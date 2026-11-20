/**
 * The engine's references to variables: the value a `qti-variable` reads ({@link variableValue}),
 * from the responses, outcomes and template values the attempt holds ({@link own}) or from a
 * built-in variable ({@link builtInValue}); the record an operand of `qti-field-value`,
 * `qti-is-null` or `qti-match` reads ({@link recordOrValue}); the type of each built-in the run
 * holds ({@link builtInType}); and
 * the run-time resolver of an attribute that holds a literal or names a template or outcome
 * variable ({@link referenceValue}, and {@link referenceInteger} for an integer one).
 *
 * It reads `Variables`, `Scope` and `Evaluate` from `#plate/engine/evaluate.ts` as types only, so
 * every expression family may import it without a cycle.
 *
 * @module
 */
import { Option, Record as Rec, Result } from "effect";
import type { Evaluate, Scope, Variables } from "#plate/engine/evaluate.ts";
import { RecordOperandError, UnknownIdentifierError } from "#plate/engine/failures.ts";
import type { EngineFailure } from "#plate/engine/failures.ts";
import { integerOf, integerValue, singleValue } from "#plate/engine/numbers.ts";
import { isItemBuiltIn, itemBuiltInTypes } from "#plate/model/built-ins.ts";
import type { Expression, FloatOrRef, IntegerOrRef, StringOrRef } from "#plate/model/expression.ts";
import type { RecordDeclaration } from "#plate/model/item.ts";
import { qtiContextName } from "#plate/model/record.ts";
import { nullOf, nullRecord } from "#plate/model/values.ts";
import type { RecordValue, ResponseValue, Value } from "#plate/model/values.ts";

/**
 * Look up a value or a record by identifier among a map's own keys.
 *
 * The variables come from plain objects, which inherit `Object.prototype`, and `constructor` or
 * `toString` is a valid identifier; reading only own keys keeps an inherited member from being
 * read as a value. A map the variables do not carry, such as the template values of an attempt
 * given none, holds no value by any name.
 *
 * @param values The responses, the record responses' records, the outcomes, the template values
 *   or an override map, if any.
 * @param identifier The identifier.
 * @returns The value or the record, or none when the map holds none by that name.
 * @see https://effect.website/docs/data-types/record/
 */
export const own = <A extends RecordValue | Value>(
  values: Readonly<Record<string, A>> | undefined,
  identifier: string,
): Option.Option<A> => (values === undefined ? Option.none() : Rec.get(values, identifier));

/**
 * Give the value of the built-in variable an identifier names that the variables carry apart from
 * the responses, outcomes and template values: for `numAttempts`, the attempt count as a single
 * integer.
 *
 * The built-in outcome `completionStatus` is not among them: the record holds it among its
 * outcomes, where the item holds it (`holdsCompletionStatus` in `#plate/model/record.ts`), so
 * {@link variableValue} gives the record's value, as it gives any outcome's. An item's `duration`
 * is not among them either: the engine holds no value of an item's time spent.
 *
 * @param variables The variables of the run.
 * @param identifier The variable's identifier.
 * @returns The value, or none for any other identifier and for `numAttempts` when the variables
 *   carry no count.
 */
export const builtInValue = (variables: Variables, identifier: string): Option.Option<Value> =>
  identifier === "numAttempts"
    ? Option.map(Option.fromUndefinedOr(variables.numAttempts), integerValue)
    : Option.none();

/**
 * Give the type of a built-in variable the run holds, as `#plate/model/built-ins.ts` types it: the
 * item's `completionStatus`, a single identifier, and `numAttempts`, a single integer, never from
 * the attempt, so a built-in's type does not depend on what the attempt holds of it. An item's
 * `duration` is not among them: the engine holds no value of an item's time spent, so the item
 * model marks an item's rule that reads it.
 *
 * It is the type a `qti-default` of the built-in gives NULL of: a built-in declares no default.
 *
 * @param identifier The variable's identifier.
 * @returns Its base type and cardinality, or none for an identifier that names no built-in the run
 *   holds.
 */
export const builtInType = (
  identifier: string,
): Option.Option<Pick<Value, "baseType" | "cardinality">> =>
  identifier !== "duration" && isItemBuiltIn(identifier)
    ? Option.some(itemBuiltInTypes[identifier])
    : Option.none();

/**
 * Give the value the run's own variables hold by an identifier: the response, the outcome or the
 * template variable of that identifier, the built-in `completionStatus` among the outcomes, else
 * the built-in variable of that name ({@link builtInValue}).
 *
 * @param variables The variables of the run.
 * @param identifier The variable's identifier.
 * @returns The value, none when the run's own variables hold none by that name.
 */
const directValue = (variables: Variables, identifier: string): Option.Option<Value> =>
  Option.firstSomeOf([
    own(variables.responses, identifier),
    own(variables.outcomes, identifier),
    own(variables.templates, identifier),
    own(variables.contexts, identifier),
    builtInValue(variables, identifier),
  ]);

/**
 * Give the record of the built-in context variable `QTI_CONTEXT` when an identifier names it and
 * the run holds it (`Variables.qtiContext`). A declared variable of that name wins, as every
 * declared variable wins over a built-in, so the callers read this only after the run's own
 * values.
 *
 * @param variables The variables of the run.
 * @param identifier The identifier.
 * @returns The record, none for any other identifier or when the run holds none.
 */
const builtInRecord = (variables: Variables, identifier: string): Option.Option<RecordValue> =>
  identifier === qtiContextName ? Option.fromUndefinedOr(variables.qtiContext) : Option.none();

/**
 * Give the value of a `qti-variable`: the response, the outcome or the template variable of that
 * identifier, the built-in `completionStatus` among the outcomes, else the built-in variable of
 * that name ({@link builtInValue}).
 *
 * Declaration identifiers are unique together, so the order responses, outcomes, template values
 * never decides between two declared variables. A declared variable wins over a built-in of the
 * same name.
 * With no template values, a template variable is the record's gap.
 *
 * A record response is not a value, so a name the variables hold a record of
 * (`Variables.records`) fails: the three kinds that read a record whole take it through
 * {@link recordOrValue} before any value read.
 *
 * @param variables The variables of the run.
 * @param identifier The variable's identifier.
 * @returns Its current value; or a {@link RecordOperandError} when the variables hold a record of
 *   it; or an {@link UnknownIdentifierError}, with holder `record`, when neither the responses, the
 *   outcomes, the template values nor the built-in variables hold it.
 */
export const variableValue = (
  variables: Variables,
  identifier: string,
): Result.Result<Value, RecordOperandError | UnknownIdentifierError> => {
  if (Option.isSome(own(variables.records, identifier))) {
    return Result.fail(new RecordOperandError({ identifier }));
  }

  return Option.match(directValue(variables, identifier), {
    onNone: () =>
      Result.fail(
        Option.isSome(builtInRecord(variables, identifier))
          ? new RecordOperandError({ identifier })
          : new UnknownIdentifierError({ holder: "record", identifier, role: "variable" }),
      ),
    onSome: (value) => Result.succeed(value),
  });
};

/**
 * Give the record a record response declares for a `qti-correct` or a `qti-default` of it: its
 * correct response or its default, the NULL record when it declares none. Template processing
 * never sets either, so the declaration's is the only one.
 *
 * @param kind The kind that reads it.
 * @param declared The record response's declaration.
 * @returns The declared record.
 */
const declaredRecord = (kind: "correct" | "default", declared: RecordDeclaration): RecordValue =>
  Option.getOrElse(kind === "correct" ? declared.correct : declared.defaultValue, () => nullRecord);

/**
 * Give the record an operand names, when it names a record response: a `qti-variable` the record
 * the run holds of it (`Variables.records`), or `QTI_CONTEXT`'s ({@link builtInRecord}) where no
 * value of the run's own holds the name, a `qti-default` its declared default and a `qti-correct`
 * its declared correct response (`Declarations.records`), each the NULL record when the
 * declaration declares none. A record response's default and correct response are never set:
 * template processing that sets either is marked `record-set` and does not run.
 *
 * @param operand The operand.
 * @param scope The holder and the variables of the run.
 * @returns The record; none for any other operand, and for a name that names no record response,
 *   which its value read then judges.
 */
const recordOf = (operand: Expression, scope: Scope): Option.Option<RecordValue> => {
  const { variables } = scope;
  if (operand.kind === "variable") {
    const { identifier } = operand;

    return Option.orElse(own(variables.records, identifier), () =>
      Option.isSome(directValue(variables, identifier))
        ? Option.none()
        : builtInRecord(variables, identifier),
    );
  }

  if (operand.kind !== "correct" && operand.kind !== "default") {
    return Option.none();
  }

  const { kind } = operand;

  return Option.map(
    Option.fromUndefinedOr(scope.declarations.records.get(operand.identifier)),
    (declared) => declaredRecord(kind, declared),
  );
};

/**
 * Give what an operand of `qti-field-value`, `qti-is-null` or `qti-match` stands for: the record it
 * names ({@link recordOf}), else its value, evaluated as any operand is.
 *
 * These three kinds alone read a record whole, so they read their operands here before any value
 * read, which fails a record ({@link variableRead}). A record is read, never computed, so naming it
 * draws nothing and fails nothing; any other operand is evaluated in its place among its siblings,
 * so the draws and the first failure keep evaluation order.
 *
 * @param operand The operand.
 * @param scope The holder, the variables of the run and the stream it draws from.
 * @param evaluate The evaluator, which gives the operand's value when it names no record.
 * @returns The record or the value, or the operand's failure.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#ExpFieldValue
 */
export const recordOrValue = (
  operand: Expression,
  scope: Scope,
  evaluate: Evaluate,
): Result.Result<ResponseValue, EngineFailure> =>
  Option.match(recordOf(operand, scope), {
    onNone: (): Result.Result<ResponseValue, EngineFailure> => evaluate(operand, scope),
    onSome: (record) => Result.succeed(record),
  });

/**
 * An attribute that holds a literal or names a variable, with what its kind rule's reference facet
 * says of it: the base type its literal has and a named variable must have, and whether a
 * reference there is checked.
 *
 * The base type ties the attribute's type to its literal's: an `IntegerOrRef` is an
 * integer, a `FloatOrRef` a float and a `StringOrRef` a string. Every
 * reference facet is checked but `qti-equal`'s `tolerance`, whose reference the database does
 * not judge, so {@link referenceValue} itself keeps an unchecked site to the variables such
 * an attribute may name.
 */
export type ReferenceSite =
  | { readonly baseType: "float"; readonly checked: boolean; readonly reference: FloatOrRef }
  | {
      readonly baseType: "integer";
      readonly checked: boolean;
      readonly reference: IntegerOrRef;
    }
  | { readonly baseType: "string"; readonly checked: boolean; readonly reference: StringOrRef };

/**
 * Give the value an attribute that holds a literal or names a variable stands for when its
 * expression is evaluated.
 *
 * A literal gives itself as a single value of its base type: a `StringOrRef` literal its text as
 * written, braces included. A reference gives the named variable's value, and its type is not
 * checked: a NULL or a value of another type is the caller's to turn into the NULL its kind gives.
 * The reader split a `StringOrRef` against the item's declarations (ruling R1), so the resolver
 * never meets a braced name that names nothing.
 *
 * Such an attribute may name only "a template or outcome variable". At an admitted site the
 * database holds a reference to that (`expression-type` with `check: "reference"` refuses a
 * response, a context variable and a built-in, and `undeclared-variable` a name nothing declares),
 * so the site reads the variable as {@link variableValue} does, a template value among them, and a
 * name the variables hold no value of fails, as `qti-variable` does, which a checked item never
 * reaches.
 *
 * At an unchecked site, `qti-equal`'s `tolerance`, the database judges nothing, so the resolver
 * keeps to that rule itself: it reads only the outcomes and the template values the attempt holds,
 * and gives NULL of the site's base type for any other name, a response, the built-in
 * `numAttempts` or a name nothing declares. The built-in
 * `completionStatus`, which the record holds among its outcomes, is a single identifier, so the
 * caller's type check gives its NULL.
 *
 * @param variables The variables of the attempt.
 * @param site The attribute's value and its reference facet.
 * @returns The value; or, at a checked site, the {@link RecordOperandError} or
 *   {@link UnknownIdentifierError} {@link variableValue} gives, for a record response or a
 *   variable the variables hold no value of.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#IT_Use
 */
export const referenceValue = (
  variables: Variables,
  site: ReferenceSite,
): Result.Result<Value, RecordOperandError | UnknownIdentifierError> => {
  if (site.reference._tag === "ref") {
    const { identifier } = site.reference;

    return site.checked
      ? variableValue(variables, identifier)
      : Result.succeed(
          Option.getOrElse(
            Option.orElse(own(variables.outcomes, identifier), () =>
              own(variables.templates, identifier),
            ),
            () => nullOf(site.baseType, "single"),
          ),
        );
  }

  switch (site.baseType) {
    case "float": {
      return Result.succeed(singleValue({ baseType: "float", value: site.reference.value }));
    }
    case "integer": {
      return Result.succeed(singleValue({ baseType: "integer", value: site.reference.value }));
    }
    case "string": {
      return Result.succeed(singleValue({ baseType: "string", value: site.reference.value }));
    }
    default: {
      return site satisfies never;
    }
  }
};

/**
 * Give the integer a checked integer attribute stands for when its expression is evaluated: its
 * literal, or the value of the variable it names, through {@link referenceValue} with a checked
 * integer site, as `qti-any-n`'s bounds, `qti-round-to`'s and `qti-equal-rounded`'s `figures`,
 * `qti-index`'s `n` and `qti-repeat`'s `number-repeats` read it.
 *
 * @param variables The variables of the attempt.
 * @param reference The attribute's value.
 * @returns The integer; none when the named variable holds NULL or a value that is not a single
 *   integer, which the database refuses (`expression-type`, `check: "reference"`) on a checked
 *   item; or the failure {@link referenceValue} gives: a {@link RecordOperandError} for a record
 *   response, which `expression-type` refuses on a checked item, or an
 *   {@link UnknownIdentifierError} when it names a variable the variables hold no value of.
 */
export const referenceInteger = (
  variables: Variables,
  reference: IntegerOrRef,
): Result.Result<Option.Option<bigint>, RecordOperandError | UnknownIdentifierError> =>
  Result.map(
    referenceValue(variables, { baseType: "integer", checked: true, reference }),
    integerOf,
  );
