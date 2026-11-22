/**
 * An item's correct responses: {@link solution}, a plain function a host calls to show the correct
 * responses in force, such as on a solution page, and
 * {@link shownThrough}, the walk that gives each value as the interaction bound to it shows it.
 *
 * @module
 */
import { Option, Record as Rec } from "effect";
import { interactionsIn, moduleSteps } from "#plate/model/interactions.ts";
import type { Item, RecordDeclaration, ResponseDeclaration } from "#plate/model/item.ts";
import type { SolutionRecord } from "#plate/model/record.ts";
import { nullOf, nullRecord } from "#plate/model/values.ts";
import type { RecordValue, Responses, Value } from "#plate/model/values.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * Give a response declaration's correct response.
 *
 * @param declaration The response declaration.
 * @returns Its `qti-correct-response`, or NULL of its base type and cardinality when it declares
 *   none.
 */
const correctOf = (declaration: ResponseDeclaration): Value =>
  Option.getOrElse(declaration.correct, () =>
    nullOf(declaration.baseType, declaration.cardinality),
  );

/**
 * Give a record response declaration's correct response.
 *
 * @param declaration The record response declaration.
 * @returns Its `qti-correct-response`, or the NULL record when it declares none.
 */
const recordCorrectOf = (declaration: RecordDeclaration): RecordValue =>
  Option.getOrElse(declaration.correct, () => nullRecord);

/**
 * Give the values an item's interactions show for values by response: each response an
 * interaction binds through its module's `shown`, as the value the interaction shows, which its
 * `redact` reads back through its kit at render; every other response as given. A module that
 * declares no `shown` shows the value itself. Each response of
 * an accepted item binds one interaction at most (reading 92), so one module decides each.
 *
 * `restore` in `#plate/restore.ts` and {@link solution} both give their values through it. It
 * reads only the values' own keys, so an identifier such as `constructor` is never read from
 * `Object.prototype`.
 *
 * @param item The item.
 * @param values The values, by response identifier: stored ones or correct ones.
 * @returns The values, each a module's interaction binds replaced by what it shows.
 */
export const shownThrough = (item: Item, values: Responses): Responses => ({
  ...values,
  ...Object.fromEntries(
    interactionsIn(item.body).flatMap((interaction) =>
      Option.toArray(
        Option.map(
          Rec.get(values, interaction.response),
          (value) => [interaction.response, moduleSteps(interaction).shown(value)] as const,
        ),
      ),
    ),
  ),
});

/**
 * Give an item's correct responses in force, by response identifier, each as the interaction bound
 * to it shows it.
 *
 * Each response's correct response is the one the record holds, which the QTI database's template
 * processing set at the take and its read returned, else the declaration's
 * `qti-correct-response`, else NULL of the declared base type and cardinality. Each record response
 * gives its declaration's `qti-correct-response`, else the NULL record (a record of no field). A
 * response an interaction module binds then passes the module's `solution` ({@link shownThrough}).
 *
 * It takes `checkAdmitted`'s {@link Accepted}, never `redact`'s output, which holds no correct
 * response.
 *
 * @param document The accepted item.
 * @param record The item session's record, of which it reads only the correct responses template
 *   processing set.
 * @returns A value for every response the item declares, a record response's a record, each value
 *   of base type integer an exact `bigint`.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_CorrectResponse
 */
export const solution = (document: Accepted, record: SolutionRecord): Responses => {
  const { item } = document;

  return shownThrough(item, {
    ...Object.fromEntries(
      [...item.responses].map(([identifier, declaration]) => [
        identifier,
        Option.getOrElse(Rec.get(record.correct, identifier), () => correctOf(declaration)),
      ]),
    ),
    ...Object.fromEntries(
      Array.from(item.records.values(), (declaration) => [
        declaration.identifier,
        recordCorrectOf(declaration),
      ]),
    ),
  });
};
