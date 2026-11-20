/**
 * The scoring function a host calls: {@link scoreRecord}, which runs one attempt from the record
 * before it and returns the record after it. It is a plain function that returns a `Result`, and
 * validates responses as `checkResponses` in `#plate/responses.ts` does.
 *
 * Plate keeps no state of a host's flow: the host rebuilds the record before an attempt from its
 * own facts (`begin` and `recordAfter`), and no attempt limit applies here.
 *
 * @module
 */
import { Data, Option, Record as Rec, Result, Schema } from "effect";
import { ResponseValueSchema } from "#plate/codec/values.ts";
import { ConfigurationSchema } from "#plate/configuration.ts";
import type { Configuration } from "#plate/configuration.ts";
import { runAttempt } from "#plate/engine/attempt.ts";
import type { EngineFailure } from "#plate/engine/evaluate.ts";
import type { ValidationMessage } from "#plate/interactions/contract.ts";
import { itemBuiltInTypes } from "#plate/model/built-ins.ts";
import type { Item, OutcomeDeclaration, ResponseDeclaration } from "#plate/model/item.ts";
import { completionStatus, holdsCompletionStatus } from "#plate/model/record.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import { isRecordValue } from "#plate/model/values.ts";
import type { ResponseValue, Responses, Value } from "#plate/model/values.ts";
import { redactStructure } from "#plate/redact/walk.ts";
import { checkShown } from "#plate/responses.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * A record that does not fit the item it is passed with: one that holds a value of a variable the
 * item does not declare, or of another type than its declaration's, or lacks what an attempt
 * carries over. A developer error, returned through a `Result`: the host rebuilt the record from
 * facts that are not the item's.
 */
export class InvalidRecord extends Data.TaggedError("InvalidRecord")<{
  /**
   * What does not fit, with the variable it names.
   */
  readonly issue: string;
}> {
  /**
   * What is wrong and what to do instead, in one line.
   */
  override get message(): string {
    return `The item record does not fit the item: ${this.issue}. Rebuild it with begin and recordAfter from this item session's own attempts.`;
  }
}

/**
 * A record that belongs to another item or document than the one it is passed with: a developer
 * error, returned through a `Result` by `scoreRecord` and `restore`.
 *
 * `item` and `document` are the passed item's; `recordItem` and `recordDocument` the record's.
 */
export class RecordMismatch extends Data.TaggedError("RecordMismatch")<{
  readonly document: string;
  readonly item: string;
  readonly recordDocument: string;
  readonly recordItem: string;
}> {
  /**
   * Both items and what to pass instead, in one line.
   */
  override get message(): string {
    return `The session record belongs to item ${JSON.stringify(this.recordItem)} in ${JSON.stringify(this.recordDocument)}, not to item ${JSON.stringify(this.item)} in ${JSON.stringify(this.document)}. Pass the record begin or recordAfter gives for this item.`;
  }
}

/**
 * Why a response is not one {@link scoreRecord} takes.
 *
 * - `undeclared`: the item scores no response by that identifier. It declares none, or declares one
 *   the renderer does not score: base type `file`, or a record response the item model does not
 *   hold (`Item.unheld` lists it).
 * - `not-a-value`: it is not a value or a record at all (an integer as a number rather than a
 *   `bigint`, an empty string, two values in a single, a record field identifier that is not an
 *   NCName or that two fields name, a record field of base type `file`, …).
 * - `base-type`: a value of another base type than its declaration's.
 * - `cardinality`: a value of another cardinality than its declaration's: a record for a response
 *   that is not a record response, or a value that is not a record for one that is.
 */
export type ResponseProblem = "base-type" | "cardinality" | "not-a-value" | "undeclared";

/**
 * What each {@link ResponseProblem} of a declared response says about it.
 */
const problemWords: Readonly<Record<ResponseProblem, string>> = {
  "base-type": "has another base type than its declaration",
  cardinality: "has another cardinality than its declaration",
  "not-a-value": "is not a value",
  undeclared: "is not a response the item scores",
};

/**
 * The type a response's declaration gives the value {@link scoreRecord} takes for it: a base type
 * and a cardinality, or, for a record response, which has no base type of its own, cardinality
 * `record`.
 */
type DeclaredResponse =
  | Pick<ResponseDeclaration, "baseType" | "cardinality">
  | { readonly cardinality: "record" };

/**
 * A response {@link scoreRecord} cannot run: a developer error, returned through a `Result`.
 *
 * `response` is its identifier, `problem` what is wrong with it, and `expected` its declaration's
 * base type and cardinality, `{ cardinality: "record" }` for a record response, or none when the
 * item scores no such response (`undeclared`).
 */
export class InvalidResponses extends Data.TaggedError("InvalidResponses")<{
  readonly expected: Option.Option<DeclaredResponse>;
  readonly problem: ResponseProblem;
  readonly response: string;
}> {
  /**
   * The response, what is wrong with it and what to pass instead, in one line.
   */
  override get message(): string {
    const name = JSON.stringify(this.response);

    return Option.match(this.expected, {
      onNone: () =>
        `The responses hold ${name}, but the item scores no response by that identifier: it declares none, or declares one the renderer does not score (base type file, or a record response the item model does not hold, such as one with a file field). Leave ${name} out of the responses.`,
      onSome: (expected) =>
        expected.cardinality === "record"
          ? `The response ${name} ${problemWords[this.problem]}. Pass a record, { cardinality: "record", fields }, each field an NCName identifier no other field names and a single value of a modelled base type other than file, an integer as a bigint and NULL as no fields.`
          : `The response ${name} ${problemWords[this.problem]}. Pass a value of base type ${expected.baseType} and cardinality ${expected.cardinality}, an integer as a bigint and NULL as no values, as decode gives it.`,
    });
  }
}

/**
 * Responses that break a limit the item sets whatever `validate-responses` says (tier (a), reading
 * 195): a developer error, returned through a `Result`, with the messages the interactions gave.
 *
 * `score` records nothing for them, so the host's own count of refused posts, if it keeps one, is
 * the only trace.
 */
export class ResponsesRefused extends Data.TaggedError("ResponsesRefused")<{
  readonly messages: readonly ValidationMessage[];
}> {
  /**
   * The messages and what to do instead, in one line.
   */
  override get message(): string {
    const said = this.messages.map((entry) => `${entry.response}: ${entry.text}`).join("; ");

    return `The responses break limits the item sets whatever validate-responses says (${said}), so score recorded nothing. Score responses within those limits; checkResponses gives the same messages under the record the page shows.`;
  }
}

/**
 * The configuration tier (a) runs under: English, with `validateResponses` off, so only the limits
 * an item sets whatever `validate-responses` says apply (reading 195), and the empty `seed`, since
 * no check reads a shuffle's order. The configuration's Schema decodes it, so every other field
 * holds its default.
 */
const tierA: Configuration = Schema.decodeSync(ConfigurationSchema)({
  locale: "en",
  seed: "",
  validateResponses: false,
});

/**
 * Check that a record belongs to the item being scored.
 *
 * `score` runs it on the record it is handed, and `restore` on the record it gives back, so
 * another item's record is refused before either checks it against the item's declarations.
 *
 * @param item The item.
 * @param record The record.
 * @returns The record, or {@link RecordMismatch} when its item or document is another.
 */
export const belonging = (
  item: Item,
  record: ItemRecord,
): Result.Result<ItemRecord, RecordMismatch> =>
  record.item === item.identifier && record.document === item.document
    ? Result.succeed(record)
    : Result.fail(
        new RecordMismatch({
          document: item.document,
          item: item.identifier,
          recordDocument: record.document,
          recordItem: record.item,
        }),
      );

/**
 * A kind of value a stored record holds by identifier: a response, an outcome, a template
 * variable, or a correct response or a default its template processing set.
 */
type StoredVariable = "correct response" | "default" | "outcome" | "response" | "template variable";

/**
 * What a record holding a value of each {@link StoredVariable} kind for an identifier the item
 * gives no type is told.
 */
const undeclaredWords: Readonly<Record<StoredVariable, string>> = {
  "correct response": "the item scores no response by that identifier",
  default: "the item scores no response and declares no outcome by that identifier",
  outcome: "the item declares no outcome by that identifier",
  response: "the item scores no response by that identifier",
  "template variable": "the item declares no template variable by that identifier",
};

/**
 * The type a record's value of one variable must have: its declaration's base type and
 * cardinality, or, for a built-in, which no declaration gives, the built-in's (`builtIn`).
 */
interface Expected extends Pick<OutcomeDeclaration, "baseType" | "cardinality"> {
  readonly builtIn: boolean;
}

/**
 * The type of the built-in `completionStatus`, a single identifier, as {@link Expected}
 * (`itemBuiltInTypes` in `#plate/model/built-ins.ts`).
 */
const builtInCompletion: Expected = { ...itemBuiltInTypes.completionStatus, builtIn: true };

/**
 * The type of the built-in `numAttempts`, a single integer, as {@link Expected}.
 */
const builtInAttempts: Expected = { ...itemBuiltInTypes.numAttempts, builtIn: true };

/**
 * Give the type of a built-in whose correct response or default template processing may set, as
 * {@link Expected}: one of the built-ins given, where the item holds it, declaring no response,
 * outcome, template variable or record response by its name, so no declaration wins over it.
 * Template processing sets the correct response of the built-in response `numAttempts` and the
 * default of it and of the built-in outcome `completionStatus` (reading 111, "a processing
 * element's `identifier` names a variable of the kind the element reads or sets"; `targetOf` in
 * `#plate/engine/template.ts`).
 *
 * @param item The item.
 * @param identifier The variable's identifier.
 * @param named The built-ins the kind of value may name.
 * @returns The built-in's type, or none when the identifier names none of them the item holds.
 */
const builtInSet = (
  item: Item,
  identifier: string,
  named: ReadonlyMap<string, Expected>,
): Option.Option<Expected> =>
  item.responses.has(identifier) ||
  item.outcomes.has(identifier) ||
  item.templates.has(identifier) ||
  item.records.has(identifier)
    ? Option.none()
    : Option.fromUndefinedOr(named.get(identifier));

/**
 * The built-ins whose correct response template processing may set: the built-in response
 * `numAttempts` ({@link builtInSet}).
 */
const correctBuiltIns: ReadonlyMap<string, Expected> = new Map([["numAttempts", builtInAttempts]]);

/**
 * The built-ins whose default template processing may set: the built-in response `numAttempts` and
 * the built-in outcome `completionStatus` ({@link builtInSet}).
 */
const defaultBuiltIns: ReadonlyMap<string, Expected> = new Map([
  [completionStatus, builtInCompletion],
  ["numAttempts", builtInAttempts],
]);

/**
 * Give the type a declaration sets for a record's value of its variable.
 *
 * @param declaration The declaration, none when the item gives the identifier no type.
 * @returns Its base type and cardinality, as a declaration's, or none.
 */
const declared = (
  declaration: Pick<OutcomeDeclaration, "baseType" | "cardinality"> | undefined,
): Option.Option<Expected> =>
  Option.map(Option.fromUndefinedOr(declaration), ({ baseType, cardinality }) => ({
    baseType,
    builtIn: false,
    cardinality,
  }));

/**
 * Say what is wrong with one value a stored record holds, as a value of its variable's type.
 *
 * The record's codec has already checked the value is a value, so only its base type and
 * cardinality are left to check. A mistyped built-in `completionStatus` is named as the built-in,
 * since no declaration of the item gives its type.
 *
 * @param variable What kind of value it is.
 * @param identifier The identifier the record holds it under.
 * @param expected The type the value must have, none when the item gives that identifier no type
 *   of the kind (or, for a response, declares one it does not score).
 * @param value The record's value.
 * @returns The issue, in words that name the variable, or none when the value fits.
 */
const storedMisfit = (
  variable: StoredVariable,
  identifier: string,
  expected: Option.Option<Expected>,
  value: Value,
): Option.Option<string> => {
  const name = JSON.stringify(identifier);

  return Option.match(expected, {
    onNone: () => Option.some(`it holds the ${variable} ${name}, but ${undeclaredWords[variable]}`),
    onSome: ({ baseType, builtIn, cardinality }) =>
      value.baseType === baseType && value.cardinality === cardinality
        ? Option.none()
        : Option.some(
            `its ${variable} ${name} has base type ${value.baseType} and cardinality ${value.cardinality}, but ${builtIn ? `the built-in ${name} takes` : `the item declares ${name} with`} base type ${baseType} and cardinality ${cardinality}`,
          ),
  });
};

/**
 * Find the first of a record's values of one kind that does not fit its variable's type.
 *
 * @param variable What kind of values they are.
 * @param expectedOf The type each identifier's value must have, none when the item gives it no type
 *   of the kind.
 * @param values The record's values of that kind, by identifier.
 * @returns The first issue, or none when every value fits.
 */
const firstMisfit = (
  variable: StoredVariable,
  expectedOf: (identifier: string) => Option.Option<Expected>,
  values: Readonly<Record<string, Value>>,
): Option.Option<string> =>
  Option.firstSomeOf(
    Object.entries(values).map(([identifier, value]) =>
      storedMisfit(variable, identifier, expectedOf(identifier), value),
    ),
  );

/**
 * Report whether an item declares a record response by an identifier, one its item model holds
 * (`Item.records`).
 *
 * @param item The item.
 * @param identifier The response's identifier.
 * @returns Whether the item holds a record response by that identifier.
 */
const declaresRecord = (item: Item, identifier: string): boolean => item.records.has(identifier);

/**
 * Find the first value a record holds under the identifier of a record response, where only a
 * record may sit.
 *
 * @param item The item.
 * @param record The record, which belongs to the item.
 * @returns The issue, or none when no value sits under a record response's identifier.
 */
const misplacedValue = (item: Item, record: ItemRecord): Option.Option<string> =>
  Option.map(
    Option.fromUndefinedOr(
      Object.keys(record.responses).find((identifier) => declaresRecord(item, identifier)),
    ),
    (identifier) => {
      const name = JSON.stringify(identifier);

      return `its response ${name} is not a record, but the item declares ${name} a record response`;
    },
  );

/**
 * Find the first record a record holds under an identifier the item declares no record response
 * by: one the item scores no response by, or one of a response it scores as a value.
 *
 * @param item The item.
 * @param record The record, which belongs to the item.
 * @returns The issue, naming the base type and cardinality the item declares for the identifier,
 *   if any, or none when every record sits under a record response's identifier.
 */
const misplacedRecord = (item: Item, record: ItemRecord): Option.Option<string> =>
  Option.map(
    Option.fromUndefinedOr(
      Object.keys(record.records).find((identifier) => !declaresRecord(item, identifier)),
    ),
    (identifier) => {
      const name = JSON.stringify(identifier);

      return Option.match(Option.fromUndefinedOr(item.responses.get(identifier)), {
        onNone: () =>
          `it holds the record ${name}, but the item declares no record response by that identifier`,
        onSome: ({ baseType, cardinality }) =>
          `its response ${name} is a record, but the item declares ${name} with base type ${baseType} and cardinality ${cardinality}`,
      });
    },
  );

/**
 * Find the first response a record holds that does not fit: a value under a record response's
 * identifier ({@link misplacedValue}), one the item does not score, one of another base type or
 * cardinality than its declaration, or a record under an identifier the item declares no record
 * response by ({@link misplacedRecord}).
 *
 * The record's codec has already checked each record is a record (`RecordValueSchema`), so only
 * where it sits is left to check.
 *
 * @param item The item.
 * @param record The record, which belongs to the item.
 * @returns The first issue, a value's before a record's, or none when every response fits.
 */
const responseMisfit = (item: Item, record: ItemRecord): Option.Option<string> =>
  misplacedValue(item, record).pipe(
    Option.orElse(() =>
      firstMisfit(
        "response",
        (identifier) => declared(item.responses.get(identifier)),
        record.responses,
      ),
    ),
    Option.orElse(() => misplacedRecord(item, record)),
  );

/**
 * Find the first of the values template processing left in a record that does not fit: each
 * template value one of a template variable the item declares, each correct response one of a
 * response the item scores or the built-in response `numAttempts`, and each default one of a
 * response it scores, an outcome it declares or the built-in `numAttempts` or `completionStatus`,
 * as template processing sets them (`targetOf` in `#plate/engine/template.ts`), each of its
 * declaration's base type and cardinality, or the built-in's ({@link builtInSet}).
 *
 * A template variable the record lacks is not refused here: the record of an item whose
 * `qti-template-processing` the engine does not run holds none, and `results` and `advance` run
 * {@link fitting}, which shares this check, over the `fresh` record of an item never presented,
 * which holds no template value either. {@link templateGap} refuses the gap where it matters, on
 * the record `score` and `restore` take for an item whose template processing runs.
 *
 * @param item The item.
 * @param record The record, which belongs to the item.
 * @returns The first issue, a template value's, then a correct response's, then a default's, or
 *   none when every value fits.
 */
const templateMisfit = (item: Item, record: ItemRecord): Option.Option<string> =>
  firstMisfit(
    "template variable",
    (identifier) => declared(item.templates.get(identifier)),
    record.templates,
  ).pipe(
    Option.orElse(() =>
      firstMisfit(
        "correct response",
        (identifier) =>
          Option.orElse(declared(item.responses.get(identifier)), () =>
            builtInSet(item, identifier, correctBuiltIns),
          ),
        record.correct,
      ),
    ),
    Option.orElse(() =>
      firstMisfit(
        "default",
        (identifier) =>
          Option.orElse(
            declared(item.responses.get(identifier) ?? item.outcomes.get(identifier)),
            () => builtInSet(item, identifier, defaultBuiltIns),
          ),
        record.defaults,
      ),
    ),
  );

/**
 * Give a record back, or refuse it with the issue found.
 *
 * @param record The record.
 * @param issue What does not fit, none when everything does.
 * @returns The record, or {@link InvalidRecord} with the issue.
 */
const unlessMisfit = (
  record: ItemRecord,
  issue: Option.Option<string>,
): Result.Result<ItemRecord, InvalidRecord> =>
  Option.match(issue, {
    onNone: () => Result.succeed(record),
    onSome: (found) => Result.fail(new InvalidRecord({ issue: found })),
  });

/**
 * Find the first template variable an item declares that a record holds no value for, where the
 * item's template processing runs.
 *
 * Such an item's response processing reads values its template processing drew when the record
 * started, and every record `begin` or `score` writes for it holds a value, NULL included, for each
 * declared template variable. A record without one would be scored against the declarations, the
 * correct response its template processing overrides among them, so it is not one the renderer
 * wrote. An item whose template processing does not run is left alone: its record holds the
 * declared defaults, or, for a `qti-template-processing` the item model marks, no template value.
 *
 * @param item The item.
 * @param record The record, which belongs to the item.
 * @returns The issue, naming the first such variable in declaration order, or none.
 */
const templateGap = (item: Item, record: ItemRecord): Option.Option<string> =>
  item.templateProcessing.kind === "runs"
    ? Option.map(
        Option.fromUndefinedOr(
          [...item.templates.keys()].find((identifier) => !Rec.has(record.templates, identifier)),
        ),
        (identifier) =>
          `it holds no value for the template variable ${JSON.stringify(identifier)}, which the item's template processing sets when its record starts`,
      )
    : Option.none();

/**
 * Check that a record holds a value for every template variable its item declares, where
 * the item's template processing runs ({@link templateGap}).
 *
 * `restore` runs it after {@link fitting}, and {@link scoreRecord} runs its check,
 * {@link templateGap}, inside {@link carriedFitting}, so neither gives back nor scores a record that
 * would be scored against the declared values its template processing replaces. {@link fitting} does
 * not run it: `results` and `advance` run that over the `fresh` record of an item never presented,
 * which holds no template value and must still fit.
 *
 * @param item The item.
 * @param record The record, which belongs to the item.
 * @returns The record, or {@link InvalidRecord} naming the first declared
 *   template variable it holds no value for.
 */
export const templatesHeld = (
  item: Item,
  record: ItemRecord,
): Result.Result<ItemRecord, InvalidRecord> => unlessMisfit(record, templateGap(item, record));

/**
 * Find what is wrong with the built-in `completionStatus` of a record, where the item holds the
 * built-in (`holdsCompletionStatus` in `#plate/model/record.ts`): a record that holds no value for
 * it, or one of another type than a single identifier, which is named as the built-in. "Delivery
 * Engines must maintain the value of the built-in outcome variable completionStatus, a single
 * identifier. It starts with the reserved value "not_attempted"" (section 2.2.2.3), and every
 * record `begin` or `score` writes, the `fresh` record of an item never presented among them, holds
 * it, so a record that lacks it is not one the renderer wrote.
 *
 * @param item The item.
 * @param record The record, which belongs to the item.
 * @returns The issue, or none when the item does not hold the built-in or the record holds it as a
 *   single identifier.
 */
const completionMisfit = (item: Item, record: ItemRecord): Option.Option<string> =>
  holdsCompletionStatus(item)
    ? Option.match(Rec.get(record.outcomes, completionStatus), {
        onNone: () =>
          Option.some(
            `it holds no value for the built-in outcome ${JSON.stringify(completionStatus)}, which every record of the item holds`,
          ),
        onSome: (value) =>
          storedMisfit("outcome", completionStatus, Option.some(builtInCompletion), value),
      })
    : Option.none();

/**
 * Check what an attempt carries from a record into the rules: each response the record
 * holds is one the item scores, of its declaration's base type and cardinality, and each record a
 * record response's ({@link responseMisfit}); the built-in `completionStatus`, where the item holds
 * it, is held, a single identifier ({@link completionMisfit}); the template values, correct
 * responses and defaults fit as {@link templateMisfit} checks them; and, where the item's template
 * processing runs, it holds a value for each declared template variable ({@link templatesHeld}). It
 * is the check {@link scoreRecord} runs on the record it is handed.
 *
 * A declared response the record lacks is left to the engine, which fails `UnknownIdentifierError`
 * if the processing reads it. The declared outcomes are not checked: the attempt resets them to
 * their defaults before the rules run, so none the record holds reaches the engine.
 *
 * @param item The item.
 * @param record The record, which belongs to the item.
 * @returns The record, or {@link InvalidRecord} naming the first response, then
 *   the built-in, then the first template value, correct response or default, that does not fit,
 *   then the first declared template variable it holds no value for.
 */
const carriedFitting = (item: Item, record: ItemRecord): Result.Result<ItemRecord, InvalidRecord> =>
  unlessMisfit(
    record,
    responseMisfit(item, record).pipe(
      Option.orElse(() => completionMisfit(item, record)),
      Option.orElse(() => templateMisfit(item, record)),
      Option.orElse(() => templateGap(item, record)),
    ),
  );

/**
 * Give the type of an outcome a record of an item may hold: an outcome the item declares, or the
 * built-in `completionStatus`, a single identifier, where the item holds it
 * (`holdsCompletionStatus` in `#plate/model/record.ts`).
 *
 * @param item The item.
 * @param identifier The outcome's identifier.
 * @returns Its type, or none when the item gives no outcome by that identifier.
 */
const outcomeType = (item: Item, identifier: string): Option.Option<Expected> =>
  identifier === completionStatus && holdsCompletionStatus(item)
    ? Option.some(builtInCompletion)
    : declared(item.outcomes.get(identifier));

/**
 * Check that a record is one {@link scoreRecord} could have written for the item: each response
 * it holds is one the item scores and each record a record response's ({@link responseMisfit}), it
 * holds the built-in `completionStatus` as a single identifier where the item holds it
 * ({@link completionMisfit}), each outcome is one the item declares or that built-in
 * ({@link outcomeType}), and its template values, correct responses and defaults fit as
 * {@link templateMisfit} checks them, each of its declaration's base type and cardinality.
 *
 * `restore` and `results` run it, so a record that does not fit is refused rather than given back
 * or written into a result. It checks what `score` checks on the record it is handed, and the
 * declared outcomes too, which `score` leaves alone because an attempt resets them; every record
 * `begin` or `score` writes fits, since template processing and the engine set only declared
 * variables, the built-in `completionStatus`, and the correct response or default of a built-in
 * template processing may set, each to a value of its type. A declared variable the record lacks
 * is not refused. A declared template variable the record of an item whose template processing
 * runs lacks is {@link templatesHeld}'s to refuse, which `restore` runs after this and whose check
 * `score` runs too; `results` and `advance` do not, since they fit the `fresh` record of an item
 * never presented.
 *
 * @param item The item.
 * @param record The record, which belongs to the item.
 * @returns The record, or {@link InvalidRecord} naming the first response, then
 *   the built-in, then the first outcome, then the first template value, correct response or
 *   default, that does not fit.
 */
export const fitting = (item: Item, record: ItemRecord): Result.Result<ItemRecord, InvalidRecord> =>
  unlessMisfit(
    record,
    responseMisfit(item, record).pipe(
      Option.orElse(() => completionMisfit(item, record)),
      Option.orElse(() =>
        firstMisfit("outcome", (identifier) => outcomeType(item, identifier), record.outcomes),
      ),
      Option.orElse(() => templateMisfit(item, record)),
    ),
  );

/**
 * Give the type an item's declaration gives a response: `{ cardinality: "record" }` for a record
 * response its item model holds, else the base type and cardinality of a response it scores.
 *
 * @param item The item.
 * @param response The response's identifier.
 * @returns The declared type, or none when the item scores no response by that identifier.
 */
const declaredResponse = (item: Item, response: string): Option.Option<DeclaredResponse> =>
  declaresRecord(item, response)
    ? Option.some({ cardinality: "record" })
    : Option.map(
        Option.fromUndefinedOr(item.responses.get(response)),
        ({ baseType, cardinality }) => ({
          baseType,
          cardinality,
        }),
      );

/**
 * Find what is wrong with one response, as a value of its declaration's type.
 *
 * It checks the type-side value (`Schema.is`), so an integer is a `bigint`, as `decode` gives it,
 * and a record holds each field identifier once, as an NCName, each field a single of a modelled
 * base type. It judges the record's shape only, never its fields' values: a host that builds a
 * record by hand answers for what its fields hold. Being a value or a record at all comes first,
 * then the kind: a record for a response that is not a record response, or a value for one that
 * is, is `cardinality`.
 *
 * @param expected The type the response's declaration gives it, none when the item scores no such
 *   response.
 * @param value The response.
 * @returns The problem, or none when the response fits its declaration.
 */
const problemOf = (
  expected: Option.Option<DeclaredResponse>,
  value: ResponseValue,
): Option.Option<ResponseProblem> =>
  Option.match(expected, {
    onNone: () => Option.some("undeclared"),
    onSome: (declaration) => {
      if (!Schema.is(ResponseValueSchema)(value)) {
        return Option.some("not-a-value");
      }

      if (declaration.cardinality === "record" || isRecordValue(value)) {
        return declaration.cardinality === value.cardinality
          ? Option.none()
          : Option.some("cardinality");
      }

      if (value.baseType !== declaration.baseType) {
        return Option.some("base-type");
      }

      return value.cardinality === declaration.cardinality
        ? Option.none()
        : Option.some("cardinality");
    },
  });

/**
 * Check each response as a value of its declaration's base type and cardinality, or, for a record
 * response, as a record ({@link problemOf}).
 *
 * @param item The item.
 * @param responses The responses by identifier.
 * @returns The responses, or {@link InvalidResponses} for the first that does not fit.
 */
const checkedResponses = (
  item: Item,
  responses: Responses,
): Result.Result<Responses, InvalidResponses> =>
  Option.match(
    Option.firstSomeOf(
      Object.entries(responses).map(([response, value]) => {
        const expected = declaredResponse(item, response);

        return Option.map(
          problemOf(expected, value),
          (problem) => new InvalidResponses({ expected, problem, response }),
        );
      }),
    ),
    {
      onNone: () => Result.succeed(responses),
      onSome: (invalid) => Result.fail(invalid),
    },
  );

/**
 * Give a responses map's values and records apart, as an item record holds them: each
 * {@link Value} under `responses` and each `RecordValue` under `records`, by the identifier it was
 * posted under.
 *
 * It splits by what each value is, never by the item's declarations, so nothing is lost: a record
 * posted for a response the item does not declare a record response lands under `records`, and a
 * value posted for a record response under `responses`, where the check of the record that holds
 * them refuses it ({@link fitting}, and {@link scoreRecord}'s check of its responses).
 *
 * @example
 *   const { records, responses } = splitResponses(saved);
 *   // overlay the record's: { ...record.responses, ...responses } and { ...record.records, ...records }
 *
 * @param responses The responses by identifier.
 * @returns The values and the records, each by identifier.
 */
export const splitResponses = (responses: Responses): Pick<ItemRecord, "records" | "responses"> => {
  const entries = Object.entries(responses);

  return {
    records: Object.fromEntries(
      entries.flatMap(([identifier, value]) =>
        isRecordValue(value) ? [[identifier, value] as const] : [],
      ),
    ),
    responses: Object.fromEntries(
      entries.flatMap(([identifier, value]) =>
        isRecordValue(value) ? [] : [[identifier, value] as const],
      ),
    ),
  };
};

/**
 * Leave out the posted value of each response only content the page does not see binds: one some
 * interaction binds, a rendered one anywhere in the body or any one inside a template block or
 * inline the record's template values hide or withhold, and no interaction the page sees binds
 * (`RedactedStructure.hiddenOnly`, from the walk `redactItem` makes, which `checkShown` judges
 * by). An interaction inside hidden template content is dropped whether the renderer shows it or a
 * notice in its place: hidden wins.
 *
 * `checkShown` gives such a response no message, so a session's stored value for it passes that
 * check, and this is the one guard that keeps a posted value from reaching response processing:
 * the attempt reads the record's value instead, which stands even when the value posted is NULL.
 * Every route into an attempt passes it: outside tests, only {@link scoreRecord} reaches
 * `runAttempt`, through `attemptFrom`. A response no interaction of the
 * item binds, or one bound only to a notice on content the page sees, is passed on as posted: the
 * page shows no interaction that hides it, so response processing reads what the host sends.
 *
 * @param responses The responses, each checked against its declaration.
 * @param hiddenOnly The responses only content the page does not see binds, under the record the
 *   attempt scores from.
 * @returns The responses, but those only content the record hides or withholds binds.
 */
const shownOnly = (responses: Responses, hiddenOnly: ReadonlySet<string>): Responses =>
  Object.fromEntries(Object.entries(responses).filter(([response]) => !hiddenOnly.has(response)));

/**
 * Check that a record is the item's and holds what an attempt carries over: step 1 of
 * {@link scoreRecord}, {@link belonging} and then {@link carriedFitting}.
 *
 * @param item The item.
 * @param record The record.
 * @returns The record; {@link RecordMismatch} for another item's record; or {@link InvalidRecord}
 *   for one that does not fit the item.
 */
const fittingRecord = (
  item: Item,
  record: ItemRecord,
): Result.Result<ItemRecord, InvalidRecord | RecordMismatch> =>
  Result.flatMap(belonging(item, record), (belonged) => carriedFitting(item, belonged));

/**
 * Run one attempt from a record the item holds: steps 2 to 5 of {@link scoreRecord}.
 *
 * @param item The item.
 * @param before The record the attempt starts from, checked.
 * @param responses The candidate's responses by identifier.
 * @returns The record after the attempt; {@link InvalidResponses} for a response that does not fit
 *   its declaration; {@link ResponsesRefused} for responses that break a tier (a) limit; or the
 *   engine's failure.
 */
const attemptFrom = (
  item: Item,
  before: ItemRecord,
  responses: Responses,
): Result.Result<ItemRecord, EngineFailure | InvalidResponses | ResponsesRefused> =>
  Result.gen(function* runChecked() {
    const checked = yield* checkedResponses(item, responses);
    const structure = redactStructure(item, before);
    const messages = checkShown(item, structure, checked, tierA);
    if (messages.length > 0) {
      return yield* Result.fail(new ResponsesRefused({ messages }));
    }

    const posted = splitResponses(shownOnly(checked, structure.hiddenOnly));

    return yield* runAttempt(item, before, posted.responses, posted.records);
  });

/**
 * Score one attempt of an item: run its response processing over the responses and return the
 * record after it.
 *
 * In order, it:
 *
 * 1. Checks that the record belongs to the item and, as {@link carriedFitting} checks it, that each
 *    response it holds is one the item scores, of its declaration's base type and cardinality, and
 *    each record a record response's, that it holds the built-in `completionStatus`, which the
 *    attempt carries over, as a single identifier, that its template values, correct responses and
 *    defaults are each of its variable's declared type, and, where the item's template processing
 *    runs, that it holds a value for each declared template variable ({@link templatesHeld}).
 * 2. Checks each response as a value of its declaration, and a record response as a record, its shape
 *    only: a host that builds a record by hand is its own scorer.
 * 3. Refuses responses that break a tier (a) limit, in English with `validateResponses` off, judging
 *    the item as the record it scores from shows it (`checkShown` over the structure
 *    `redactStructure` gives for that record), so a choice the record's template values hide is
 *    refused `unknownChoice` and one they show is judged as any choice.
 * 4. Leaves out the posted value of a response only content the record hides or withholds binds,
 *    whether the renderer shows the interaction there or a notice in its place, as the same
 *    structure gives them ({@link shownOnly}).
 * 5. Runs the attempt and writes the record, each record response's record under its `records` and
 *    every other response under its `responses`.
 *
 * The record's seed, template values, correct responses and defaults come back unchanged, and the
 * rules read the template values, and the correct responses and defaults template processing set,
 * from it. It sets no attempt limit: whether the item session is open is `itemSessionOpen`'s.
 *
 * @example
 *   const after = scoreRecord(accepted, { RESPONSE: decoded }, recordAfter(accepted, begun, attempts));
 *   // on Result.succeed, record attemptOf(after)
 *
 * @param document The document `checkAdmitted` accepted.
 * @param responses The candidate's responses by identifier, each a value of its declaration's base
 *   type and cardinality, an integer as a `bigint`, and a record response's a record. A response
 *   left out keeps the record's value, as does one only content the record hides binds, whatever is
 *   posted for it.
 * @param record The record the attempt starts from: `begin`'s for the first attempt, and
 *   `recordAfter`'s over the attempts made for every later one.
 * @returns The record after the attempt, or {@link InvalidRecord} for a record that does not fit
 *   the item, such as one that holds a response the item does not score, a value of another base
 *   type or cardinality than its variable's declaration, no `completionStatus` or one that is not a
 *   single identifier, or, for an item whose template processing runs, no value for a declared
 *   template variable; {@link RecordMismatch} for another item's record; {@link InvalidResponses}
 *   for a response that does not fit its declaration; {@link ResponsesRefused} for responses that
 *   break a tier (a) limit, a choice the record hides among them; or an {@link EngineFailure} when
 *   the record lacks a response the processing reads or the processing sets an outcome to a value
 *   of another type.
 */
export const scoreRecord = (
  document: Accepted,
  responses: Responses,
  record: ItemRecord,
): Result.Result<
  ItemRecord,
  EngineFailure | InvalidRecord | InvalidResponses | RecordMismatch | ResponsesRefused
> =>
  Result.flatMap(fittingRecord(document.item, record), (before) =>
    attemptFrom(document.item, before, responses),
  );
