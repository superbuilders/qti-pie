/**
 * The references family of the engine: the evaluators of the expressions that read a variable, a
 * declaration or a literal, `qti-variable`, `qti-correct`, `qti-base-value`, `qti-map-response`,
 * `qti-map-response-point`, `qti-default` and `qti-null`, and of the two that draw from the scope's
 * stream, `qti-random-integer` and `qti-random-float`.
 *
 * A mapping's and an area mapping's arithmetic, once the response and its declaration are found,
 * is `#plate/engine/expressions/mapping.ts`'s. An item's record response is no value: read as a
 * value by any of these, it fails, and `qti-field-value`, `qti-is-null` and `qti-match` read its
 * record, its declared correct response or its declared default instead (`recordOrValue` in
 * `#plate/engine/refs.ts`).
 *
 * It reads the evaluator's types from `#plate/engine/evaluate.ts` as types only, so the
 * dispatcher's table may import it without a cycle.
 *
 * @module
 */
import { Option, Result } from "effect";
import type { Declarations, Evaluator, FamilyTable, Variables } from "#plate/engine/evaluate.ts";
import { mappedPoints, mappedResponse } from "#plate/engine/expressions/mapping.ts";
import { UnknownIdentifierError, UnmappedResponseError } from "#plate/engine/failures.ts";
import type { RecordOperandError } from "#plate/engine/failures.ts";
import {
  bitLengthOf,
  ComputationBoundDefect,
  floatNull,
  floatValue,
  integerBitBound,
  integerNull,
  integerValue,
  numberOf,
} from "#plate/engine/numbers.ts";
import { drawBelow, drawFloat } from "#plate/engine/random.ts";
import type { Draw } from "#plate/engine/random.ts";
import {
  builtInType,
  own,
  referenceInteger,
  referenceValue,
  variableValue,
} from "#plate/engine/refs.ts";
import type { FloatOrRef } from "#plate/model/expression.ts";
import type { ResponseDeclaration } from "#plate/model/item.ts";
import { nullOf } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";

/**
 * Find the response declaration a `qti-correct`, a `qti-map-response` or a
 * `qti-map-response-point` names.
 *
 * @param item The declarations holder: the item.
 * @param identifier The response's identifier.
 * @returns The declaration, or an {@link UnknownIdentifierError} when the holder declares no
 *   modelled response by that name.
 */
const responseOf = (
  item: Declarations,
  identifier: string,
): Result.Result<ResponseDeclaration, UnknownIdentifierError> =>
  Result.fromOption(
    Option.fromUndefinedOr(item.responses.get(identifier)),
    () => new UnknownIdentifierError({ holder: "item", identifier, role: "response" }),
  );

/**
 * A response of a type the value model holds that a `qti-correct`, a `qti-map-response` or a
 * `qti-map-response-point` names: its declaration; the correct response template processing set
 * for it, if any; and its value, if the variables hold one.
 */
interface HeldResponse {
  readonly correct: Option.Option<Value>;
  readonly declaration: ResponseDeclaration;
  readonly kind: "held";
  readonly value: Option.Option<Value>;
}

/**
 * What a `qti-correct`, a `qti-map-response` or a `qti-map-response-point` names: a
 * {@link HeldResponse}, or `built-in`, a built-in variable the run holds, with the correct response
 * a `qti-correct` of it reads. The engine holds no declaration of a built-in, so no mapping or
 * area mapping of it.
 */
type NamedResponse = HeldResponse | { readonly correct: Value; readonly kind: "built-in" };

/**
 * Find the response a `qti-correct`, a `qti-map-response` or a `qti-map-response-point` names.
 *
 * A response the holder declares is read from the holder and the variables: the correct response
 * template processing set (`Variables.correct`) and the response's value. A name the holder
 * declares no response by that names a built-in the run holds (`builtInType` in
 * `#plate/engine/refs.ts`) is that built-in, whose correct response is the one template processing
 * set, else NULL of its type, since no declaration gives it one.
 *
 * @param item The declarations holder: the item.
 * @param variables The variables of the run.
 * @param identifier The response's identifier.
 * @returns The response; or an {@link UnknownIdentifierError} with holder `item` when the holder
 *   declares no response by that name and it names no built-in.
 */
const namedResponse = (
  item: Declarations,
  variables: Variables,
  identifier: string,
): Result.Result<NamedResponse, UnknownIdentifierError> => {
  const builtIn = builtInType(identifier);
  if (!item.responses.has(identifier) && Option.isSome(builtIn)) {
    const { baseType, cardinality } = builtIn.value;

    return Result.succeed({
      correct: Option.getOrElse(own(variables.correct, identifier), () =>
        nullOf(baseType, cardinality),
      ),
      kind: "built-in",
    });
  }

  return Result.map(responseOf(item, identifier), (declaration) => ({
    correct: own(variables.correct, identifier),
    declaration,
    kind: "held",
    value: own(variables.responses, identifier),
  }));
};

/**
 * Find the response a `qti-map-response` or a `qti-map-response-point` maps ({@link
 * namedResponse}), which must be held: the engine holds no mapping or area mapping of a built-in,
 * which no declaration gives one, so a name of a built-in fails as a name of no response does.
 *
 * @param item The declarations holder.
 * @param variables The variables of the run.
 * @param identifier The response's identifier.
 * @returns The held response; or an {@link UnknownIdentifierError} with holder `item` when the name
 *   reads a built-in, or the failure {@link namedResponse} gives.
 */
const heldResponse = (
  item: Declarations,
  variables: Variables,
  identifier: string,
): Result.Result<HeldResponse, UnknownIdentifierError> =>
  Result.flatMap(namedResponse(item, variables, identifier), (named) =>
    named.kind === "held"
      ? Result.succeed(named)
      : Result.fail(new UnknownIdentifierError({ holder: "item", identifier, role: "response" })),
  );

/**
 * Give the value of a `qti-map-response`: a single float.
 *
 * The value is what the response's mapping maps it to (`mappedResponse` in
 * `#plate/engine/expressions/mapping.ts`): the sum of the mapped values of its distinct values, so
 * a `single` value maps to its one value's, `{B,B,C}` counts `B` once, and a NULL response maps to
 * 0, a container's sum clamped to the mapping's bounds (reading 207).
 *
 * @param item The declarations holder, whose declaration gives the mapping.
 * @param variables The variables of the run.
 * @param identifier The response's identifier.
 * @returns The mapped value; or an {@link UnknownIdentifierError} when the item declares no
 *   modelled response by that name, an {@link UnmappedResponseError} when its declaration has no
 *   mapping, or an {@link UnknownIdentifierError} when the variables hold no value of it, checked
 *   in that order.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#ExpMapResponse
 */
const mapResponse = (
  item: Declarations,
  variables: Variables,
  identifier: string,
): Result.Result<Value, UnknownIdentifierError | UnmappedResponseError> =>
  Result.gen(function* mapOneResponse() {
    const named = yield* heldResponse(item, variables, identifier);
    const mapping = yield* Result.fromOption(
      named.declaration.mapping,
      () => new UnmappedResponseError({ identifier, mapping: "qti-mapping" }),
    );
    const response = yield* Result.fromOption(
      named.value,
      () => new UnknownIdentifierError({ holder: "record", identifier, role: "response" }),
    );

    return mappedResponse(mapping, response);
  });

/**
 * Give the value of a `qti-map-response-point`: a single float.
 *
 * The value is what the response's area mapping maps its points to (`mappedPoints` in
 * `#plate/engine/expressions/mapping.ts`), so a NULL response maps to 0, a container's sum clamped
 * to the area mapping's bounds and a single point's not (reading 207).
 *
 * @param item The declarations holder, whose declaration gives the area mapping.
 * @param variables The variables of the run.
 * @param identifier The response's identifier.
 * @returns The mapped value; or an {@link UnknownIdentifierError} when the item declares no
 *   modelled response by that name, an {@link UnmappedResponseError} when its declaration has no
 *   area mapping, or an {@link UnknownIdentifierError} when the variables hold no value of it,
 *   checked in that order.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#ExpMapResponsePoint
 */
const mapResponsePoint = (
  item: Declarations,
  variables: Variables,
  identifier: string,
): Result.Result<Value, UnknownIdentifierError | UnmappedResponseError> =>
  Result.gen(function* mapOnePointResponse() {
    const named = yield* heldResponse(item, variables, identifier);
    const mapping = yield* Result.fromOption(
      named.declaration.areaMapping,
      () => new UnmappedResponseError({ identifier, mapping: "qti-area-mapping" }),
    );
    const response = yield* Result.fromOption(
      named.value,
      () => new UnknownIdentifierError({ holder: "record", identifier, role: "response" }),
    );

    return mappedPoints(mapping, response);
  });

/**
 * Give the value of a `qti-variable`: the response's, the outcome's or the template variable's
 * current value, else the built-in variable's, as {@link variableValue} reads it. A
 * `weight-identifier` weights nothing: weights are "defined only in the test context (and hence
 * only in outcomes processing)" (section 7.47.2), and plate runs no test.
 *
 * @param expression The `qti-variable`.
 * @param scope The holder and the variables of the run.
 * @returns The variable's value; or the {@link RecordOperandError} {@link variableValue} gives for a
 *   record response; or an {@link UnknownIdentifierError} when the variables hold no value of it.
 */
const evaluateVariable: Evaluator<"variable"> = (expression, scope) =>
  variableValue(scope.variables, expression.identifier);

/**
 * Give the value of a `qti-correct`: the correct response template processing set for the response
 * (`Variables.correct`), else its declaration's correct response, else NULL of its declared type.
 *
 * The response must be declared or be a built-in the run holds, so an override map never makes an
 * undeclared name readable; `qti-set-correct-response` names only a declared response or a built-in
 * response on a checked item. A built-in, `numAttempts`, reads the correct response template
 * processing set for it, else NULL of its own type, a single integer, since it declares none
 * (reading 111), and never the attempt count. A record response's `qti-correct` is read by
 * `qti-field-value`, `qti-is-null` and `qti-match` as its declared correct response
 * (`recordOrValue` in `#plate/engine/refs.ts`), never through here.
 *
 * @param expression The `qti-correct`.
 * @param scope The holder, whose declaration gives the correct response, and the variables, whose
 *   override comes first.
 * @returns The correct response or the NULL, or the {@link UnknownIdentifierError}
 *   {@link namedResponse} gives.
 */
const evaluateCorrect: Evaluator<"correct"> = (expression, scope) =>
  Result.map(namedResponse(scope.declarations, scope.variables, expression.identifier), (named) =>
    named.kind === "built-in"
      ? named.correct
      : Option.getOrElse(
          Option.orElse(named.correct, () => named.declaration.correct),
          () => nullOf(named.declaration.baseType, named.declaration.cardinality),
        ),
  );

/**
 * Give the value of a `qti-base-value`: the value as the item model parsed it.
 *
 * @param expression The `qti-base-value`.
 * @returns Its value.
 */
const evaluateBaseValue: Evaluator<"base-value"> = (expression) => Result.succeed(expression.value);

/**
 * Give the value of a `qti-map-response`: a single float, the response's value through its
 * declaration's mapping ({@link mapResponse}).
 *
 * @param expression The `qti-map-response`.
 * @param scope The item, whose declaration gives the mapping, and the variables.
 * @returns The mapped value, or the failure {@link mapResponse} gives.
 */
const evaluateMapResponse: Evaluator<"map-response"> = (expression, scope) =>
  mapResponse(scope.declarations, scope.variables, expression.identifier);

/**
 * Give the value of a `qti-map-response-point`: a single float, the response's points through its
 * declaration's area mapping ({@link mapResponsePoint}).
 *
 * @param expression The `qti-map-response-point`.
 * @param scope The item, whose declaration gives the area mapping, and the variables.
 * @returns The mapped value, or the failure {@link mapResponsePoint} gives.
 */
const evaluateMapResponsePoint: Evaluator<"map-response-point"> = (expression, scope) =>
  mapResponsePoint(scope.declarations, scope.variables, expression.identifier);

/**
 * Give the value of a `qti-default`: the default template processing set for the variable it names
 * (`Variables.defaults`), else the default value declared for it, else NULL of that variable's
 * type, as the information model says: it "returns the associated defaultValue or NULL if no
 * default value was declared".
 *
 * It reads the defaults and the declaration, never the attempt's value. A response, an outcome or a
 * template variable with no `qti-default-value` and no default set gives NULL of its base type and
 * cardinality, a single integer or float outcome included: the 0 an attempt starts such an outcome
 * at is not a declared default, and a template variable's current value is not its default either.
 * The variable must be declared, or be a built-in the run holds, for a set default to be read, so
 * an override map never makes an undeclared name readable; `qti-set-default-value` names only a
 * declared response or outcome, or a built-in of either kind, on a checked item. A declared
 * variable wins over a built-in of the same name, as `qti-variable` reads it. A built-in the run
 * holds, `numAttempts` or `completionStatus`, has no declaration and so declares no default: it
 * gives the default template processing set for it (reading 111), else NULL of the built-in's own
 * type ({@link builtInType}), a single integer or a single identifier, never what the attempt
 * holds of it. A record response's default is read by `qti-field-value`, `qti-is-null` and
 * `qti-match` (`recordOrValue` in `#plate/engine/refs.ts`).
 *
 * @param expression The `qti-default`.
 * @param scope The holder, whose declarations give the defaults, and the variables, whose set
 *   defaults come first.
 * @returns The set or declared default or the NULL; or an {@link UnknownIdentifierError} with
 *   holder `item` when the holder declares no response, outcome or template variable by that name
 *   and it names no built-in the run holds, which the item model marks in an item (an item's
 *   `duration` among them).
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#ExpDefault
 */
const evaluateDefault: Evaluator<"default"> = (expression, scope) => {
  const declaration =
    scope.declarations.responses.get(expression.identifier) ??
    scope.declarations.outcomes.get(expression.identifier) ??
    scope.declarations.templates.get(expression.identifier);
  if (declaration !== undefined) {
    return Result.succeed(
      Option.getOrElse(
        Option.orElse(
          own(scope.variables.defaults, expression.identifier),
          () => declaration.defaultValue,
        ),
        () => nullOf(declaration.baseType, declaration.cardinality),
      ),
    );
  }

  const builtIn = builtInType(expression.identifier);
  if (Option.isSome(builtIn)) {
    return Result.succeed(
      Option.getOrElse(own(scope.variables.defaults, expression.identifier), () =>
        nullOf(builtIn.value.baseType, builtIn.value.cardinality),
      ),
    );
  }

  return Result.fail(
    new UnknownIdentifierError({
      holder: "item",
      identifier: expression.identifier,
      role: "variable",
    }),
  );
};

/**
 * Give the value of a `qti-null`: NULL, "treated as if it is of any desired base-type".
 *
 * A value carries a base type and a cardinality, so this NULL carries a single string's, the type
 * of an empty string, which the information model also treats as NULL. No check reads them: the
 * kind's rule types it any base type, which every operand rule and every check of a type accepts,
 * and an outcome set to it stores its own typed NULL (`setOutcome` in
 * `#plate/engine/evaluate.ts`).
 *
 * @returns The NULL.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#AbstractAttribute_ExpressionGroup_qti-null
 */
const evaluateNull: Evaluator<"null"> = () => Result.succeed(nullOf("string", "single"));

/**
 * Draw a `qti-random-integer`'s value from its resolved attributes: `min + step × j`, with `j`
 * drawn by `drawBelow` among the `⌊(max − min) / step⌋ + 1` values the range holds, so with `min`
 * 2, `max` 11 and `step` 3 the values 2, 5, 8 and 11 are equally likely.
 *
 * Every NULL is settled before the first draw, so a NULL draws nothing and leaves the stream where
 * it was for every later draw:
 *
 * - `max` below `min`, or a `step` of 0 or below: "the range holds no value and the result is NULL"
 *   (reading 216).
 *
 * A `min` or `max` of more than {@link integerBitBound} bits (1,000,000) aborts the run
 * ({@link ComputationBoundDefect}), after those NULLs and before any draw: the drawn integer is a
 * computed result, held to that bound by reading 211, and within the bound every value the range
 * holds is too, so a draw is never past it.
 *
 * A range of one value, `step` beyond `max − min` among them, draws nothing and gives `min`.
 *
 * @param draw The scope's stream.
 * @param min The least value.
 * @param max The greatest value.
 * @param step The step between values.
 * @returns The single integer, or NULL of a single integer.
 * @throws {ComputationBoundDefect} When `min` or `max` has more than 1,000,000 bits.
 */
const integerDraw = (draw: Draw, min: bigint, max: bigint, step: bigint): Value => {
  if (max < min || step <= 0n) {
    return integerNull;
  }

  if (bitLengthOf(min) > integerBitBound || bitLengthOf(max) > integerBitBound) {
    throw new ComputationBoundDefect({ kind: "integer" });
  }

  return integerValue(min + step * drawBelow(draw, (max - min) / step + 1n));
};

/**
 * Give the value of a `qti-random-integer`: a single integer drawn from its range
 * ({@link integerDraw}).
 *
 * Its `min`, `max` and `step` are resolved first, in that order, each its literal or the value of
 * the variable it names ({@link referenceInteger}); a NULL there gives NULL, before any draw.
 *
 * @param expression The `qti-random-integer`.
 * @param scope The variables of the attempt and the stream it draws from.
 * @returns The single integer or its NULL, or an {@link UnknownIdentifierError} when an attribute
 *   names a variable the variables hold no value of, which a checked item never reaches.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#AbstractAttribute_ExpressionGroup_qti-random-integer
 */
const evaluateRandomInteger: Evaluator<"random-integer"> = (expression, scope) =>
  Result.gen(function* drawRandomInteger() {
    const min = yield* referenceInteger(scope.variables, expression.min);
    const max = yield* referenceInteger(scope.variables, expression.max);
    const step = yield* referenceInteger(scope.variables, expression.step);

    return Option.match(Option.all([min, max, step]), {
      onNone: () => integerNull,
      onSome: ([least, greatest, by]) => integerDraw(scope.draw, least, greatest, by),
    });
  });

/**
 * Give the float a `qti-random-float`'s `min` or `max` stands for: its literal, or the value of the
 * float variable it names, through {@link referenceValue} with the kind's checked float facet.
 *
 * @param variables The variables of the attempt.
 * @param reference The attribute's value.
 * @returns The float; none when the named variable holds NULL or a value that is not a single
 *   float, which the database refuses (`expression-type`, `check: "reference"`) on a checked item;
 *   or the failure {@link referenceValue} gives: a {@link RecordOperandError} for a record
 *   response, which `expression-type` refuses on a checked item, or an
 *   {@link UnknownIdentifierError} when it names a variable the variables hold no value of.
 */
const referenceFloat = (
  variables: Variables,
  reference: FloatOrRef,
): Result.Result<Option.Option<number>, RecordOperandError | UnknownIdentifierError> =>
  Result.map(referenceValue(variables, { baseType: "float", checked: true, reference }), (value) =>
    Option.flatMap(numberOf(value), (single) =>
      single.baseType === "float" ? Option.some(single.value) : Option.none(),
    ),
  );

/**
 * Draw a `qti-random-float`'s value from its resolved bounds, with `u` the stream's next float in
 * [0, 1) (`drawFloat`, two draws): `min + u × (max − min)`, or `min × (1 − u) + max × u` when
 * `max − min` is not finite, so a range across the whole double line gives a finite float; the
 * result is then clamped to `[min, max]`, which a rounding of either form can step past.
 *
 * A bound that is NaN or infinite, or a `max` below `min`, gives NULL before the draw, so it draws
 * nothing (reading 216). Each operation is one IEEE 754 addition, subtraction or multiplication,
 * correctly rounded.
 *
 * @param draw The scope's stream.
 * @param min The least value.
 * @param max The greatest value.
 * @returns The single float, or NULL of a single float.
 */
const floatDraw = (draw: Draw, min: number, max: number): Value => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    return floatNull;
  }

  const u = drawFloat(draw);
  const span = max - min;
  const drawn = Number.isFinite(span) ? min + u * span : min * (1 - u) + max * u;
  if (drawn < min) {
    return floatValue(min);
  }

  return floatValue(drawn > max ? max : drawn);
};

/**
 * Give the value of a `qti-random-float`: a single float drawn from `[min, max]`
 * ({@link floatDraw}).
 *
 * Its `min` and `max` are resolved first, in that order, each its literal or the value of the
 * variable it names ({@link referenceFloat}); a NULL there gives NULL, before any draw.
 *
 * @param expression The `qti-random-float`.
 * @param scope The variables of the attempt and the stream it draws from.
 * @returns The single float or its NULL, or an {@link UnknownIdentifierError} when a bound names a
 *   variable the variables hold no value of, which a checked item never reaches.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#AbstractAttribute_ExpressionGroup_qti-random-float
 */
const evaluateRandomFloat: Evaluator<"random-float"> = (expression, scope) =>
  Result.gen(function* drawRandomFloat() {
    const min = yield* referenceFloat(scope.variables, expression.min);
    const max = yield* referenceFloat(scope.variables, expression.max);

    return Option.match(Option.all([min, max]), {
      onNone: () => floatNull,
      onSome: ([least, greatest]) => floatDraw(scope.draw, least, greatest),
    });
  });

/**
 * The references family's evaluators by kind.
 */
export const referencesEvaluators: FamilyTable<
  | "base-value"
  | "correct"
  | "default"
  | "map-response"
  | "map-response-point"
  | "null"
  | "random-float"
  | "random-integer"
  | "variable"
> = {
  "base-value": evaluateBaseValue,
  correct: evaluateCorrect,
  default: evaluateDefault,
  "map-response": evaluateMapResponse,
  "map-response-point": evaluateMapResponsePoint,
  null: evaluateNull,
  "random-float": evaluateRandomFloat,
  "random-integer": evaluateRandomInteger,
  variable: evaluateVariable,
};
