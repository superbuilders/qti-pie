/**
 * The evaluator: the response rules and the registry's expression kinds run over an item's rule
 * tree, as pure functions of the item and the variables of one attempt.
 *
 * {@link runRules} runs response rules in order, and {@link evaluateExpression} gives the value of
 * one expression. They take rules the item model ({@link Item}) built, the declarations those rules
 * read ({@link Declarations}: an item's), and variables that hold a value for every modelled
 * declaration and the built-in `completionStatus`, as the session record does, and the attempt
 * count the built-in `numAttempts` reads. A random kind draws from
 * the one stream ({@link Draw}) the call is given, in evaluation order. A rule that names an
 * identifier outside them, sets an outcome to a value of another type, or maps a response that has
 * no mapping is a failure of what the caller passed, and the caller can cause each one: the
 * variables come from a record the host hands back. An identifier the variables hold no value of is
 * the record's gap, and one the item declares nothing of is the item's; the failure says which. So
 * the functions stay plain and synchronous and return each failure, an {@link EngineFailure}, in a
 * `Result`; the first failure ends the run.
 *
 * Each expression kind's evaluator lives in its family's table under `#plate/engine/expressions/`,
 * and this module dispatches through the one table the nine make ({@link evaluators}). A family
 * reads {@link Scope} and the evaluator's types from here as types only, so the value imports point
 * one way: from here to the families.
 *
 * @module
 */
import { Option, Result } from "effect";
import { OutcomeMismatchError, UnknownIdentifierError } from "#plate/engine/failures.ts";
import type { EngineFailure } from "#plate/engine/failures.ts";
import { arithmeticEvaluators } from "#plate/engine/expressions/arithmetic.ts";
import { comparisonEvaluators } from "#plate/engine/expressions/comparison.ts";
import { containersEvaluators } from "#plate/engine/expressions/containers.ts";
import { functionsEvaluators } from "#plate/engine/expressions/functions.ts";
import { integersEvaluators } from "#plate/engine/expressions/integers.ts";
import { logicEvaluators } from "#plate/engine/expressions/logic.ts";
import { referencesEvaluators } from "#plate/engine/expressions/references.ts";
import { roundingEvaluators } from "#plate/engine/expressions/rounding.ts";
import { textEvaluators } from "#plate/engine/expressions/text.ts";
import { numberOf, sameNumber, singleOf, singleValue } from "#plate/engine/numbers.ts";
import type { NumberSingle } from "#plate/engine/numbers.ts";
import type { Draw } from "#plate/engine/random.ts";
import { completionStatusValues } from "#plate/model/built-ins.ts";
import type { Expression, ExpressionKind, Rule } from "#plate/model/expression.ts";
import type { Item, LookupTable, OutcomeDeclaration } from "#plate/model/item.ts";
import {
  completionStatus,
  completionStatusType,
  holdsCompletionStatus,
} from "#plate/model/record.ts";
import { isNull, nullOf } from "#plate/model/values.ts";
import type { RecordValue, Single, Value } from "#plate/model/values.ts";

export type { EngineFailure } from "#plate/engine/failures.ts";

/**
 * The variables of one attempt: each response, each record response's record, each outcome and
 * each template variable by identifier, the correct responses and defaults template processing
 * set, and the attempt count.
 *
 * Responses, record responses, outcomes and template variables share one identifier space, because
 * declaration identifiers are unique together, so a `qti-variable` names at most one of them. The
 * outcomes hold the built-in outcome `completionStatus` beside the declared ones where the item
 * holds it (`holdsCompletionStatus` in `#plate/model/record.ts`), since it is "declared
 * implicitly" (section 2.2.2.3): no response, outcome or template variable then shares its name.
 */
export interface Variables {
  /**
   * The value of each context variable the holder declares of a modelled type, by identifier, at
   * its default (`contextValues` in `#plate/model/record.ts`): no processing sets one. Absent where
   * the run holds none, and a `qti-variable` of one is then the record's gap.
   */
  readonly contexts?: Readonly<Record<string, Value>>;
  /**
   * The correct responses template processing set with `qti-set-correct-response`, by the
   * response's identifier, a built-in response's among them (reading 111). A `qti-correct` reads a
   * response's value here before its declaration's correct response; with none, or with no value
   * of that response, it reads the declaration, and a built-in's NULL.
   */
  readonly correct?: Readonly<Record<string, Value>>;
  /**
   * The defaults template processing set with `qti-set-default-value`, by the variable's
   * identifier, a built-in's among them (reading 111). A `qti-default` reads a variable's value
   * here before its declaration's default; with none, or with no value of that variable, it reads
   * the declaration, and a built-in's NULL.
   */
  readonly defaults?: Readonly<Record<string, Value>>;
  /**
   * The value of the built-in response variable `numAttempts`: the number of attempts at the
   * item, the one being processed included, because the count "increases by '1' at the start of
   * each attempt". `runAttempt` in `#plate/engine/attempt.ts` always gives it. Without it, a
   * `qti-variable` of `numAttempts` is the record's gap, as any other variable the record holds
   * no value of.
   *
   * @see https://www.imsglobal.org/spec/qti/v3p0/info#IV_Response
   */
  readonly numAttempts?: bigint;
  readonly outcomes: Readonly<Record<string, Value>>;
  /**
   * The value of the built-in context variable `QTI_CONTEXT`, a record, as the host's context gives
   * it (`qtiContextRecord` in `#plate/model/record.ts`), the NULL record when the host gave none.
   * `qti-field-value`, `qti-is-null` and `qti-match` read it whole, as they read a record
   * response's record, and a value read of it fails. Absent where the run holds none, and a read
   * of it is then the record's gap.
   */
  readonly qtiContext?: RecordValue;
  /**
   * The value of each record response, by identifier, beside `responses`, which hold the values of
   * the other cardinalities: the session record's `records`. Absent where the run holds no record
   * response.
   */
  readonly records?: Readonly<Record<string, RecordValue>>;
  readonly responses: Readonly<Record<string, Value>>;
  /**
   * The value of each template variable, by identifier, as template processing left it. Without
   * it, a `qti-variable` of a template variable is the record's gap, as any other variable the
   * record holds no value of.
   */
  readonly templates?: Readonly<Record<string, Value>>;
}

/**
 * The declarations a run of rules reads: the outcomes it sets, the responses and template
 * variables whose declarations give the correct responses, the defaults, the mappings and the area
 * mappings, and the record responses, whose declarations give the correct response and the default
 * a `qti-correct` and a `qti-default` of one read (`recordOrValue` in `#plate/engine/refs.ts`),
 * absent where the holder declares none. An {@link Item} is one, and every item's processing passes
 * its item.
 */
export type Declarations = Pick<Item, "outcomes" | "records" | "responses" | "templates">;

/**
 * The evaluator's context: the declarations holder whose declarations give the outcomes' types,
 * the correct responses, the mappings and the area mappings, the variables of the run, and the
 * stream its random kinds draw from.
 *
 * Every evaluator takes it whole, so a field the engine adds reaches every family with no change
 * to an evaluator's signature. The family tests build it only through `scopeOf` in
 * `#plate/test/processing.ts`.
 */
export interface Scope {
  /**
   * The declarations holder: an item ({@link Declarations}).
   */
  readonly declarations: Declarations;
  /**
   * The stream every draw of one processing run comes from, in evaluation order: operands left to
   * right and a condition's branches until the first true one. An operand is evaluated in its
   * caller's scope, so it draws from the same stream.
   */
  readonly draw: Draw;
  readonly variables: Variables;
}

/**
 * The variant of each expression kind: the member of {@link Expression} whose `kind` it is, `never`
 * for a kind the union does not hold.
 */
type Variants = { readonly [K in ExpressionKind]: Extract<Expression, { readonly kind: K }> };

/**
 * The evaluator an evaluator calls for its operands: it gives the value of any expression in a
 * scope.
 *
 * @param expression The expression, an operand of the caller.
 * @param scope The item and the variables of the attempt.
 * @returns The expression's value, or the first {@link EngineFailure} of its evaluation.
 */
export type Evaluate = (
  expression: Expression,
  scope: Scope,
) => Result.Result<Value, EngineFailure>;

/**
 * The evaluator of one expression kind: it takes the kind's own variant, so it destructures the
 * variant's `operands` tuple and reads its attributes with no check of the kind.
 *
 * @param expression The expression, of kind `K`.
 * @param scope The item and the variables of the attempt.
 * @param evaluate The evaluator of its operands.
 * @returns The expression's value, or the first {@link EngineFailure} of its evaluation.
 */
export type Evaluator<K extends ExpressionKind> = (
  expression: Variants[K],
  scope: Scope,
  evaluate: Evaluate,
) => Result.Result<Value, EngineFailure>;

/**
 * A family's table: one entry per kind of the family, its evaluator.
 */
export type FamilyTable<K extends ExpressionKind> = {
  readonly [P in K]: Evaluator<P>;
};

/**
 * Every kind's entry: the nine families' tables in one, keyed by {@link ExpressionKind}. Its type
 * requires an entry for each of the 56 kinds, so a kind no family holds fails the type check.
 */
const evaluators: FamilyTable<ExpressionKind> = {
  ...arithmeticEvaluators,
  ...comparisonEvaluators,
  ...containersEvaluators,
  ...functionsEvaluators,
  ...integersEvaluators,
  ...logicEvaluators,
  ...referencesEvaluators,
  ...roundingEvaluators,
  ...textEvaluators,
};

/**
 * Give the value of an expression through its kind's entry in {@link evaluators}.
 *
 * The kind and the variant are passed apart so the entry the kind indexes takes that variant.
 *
 * @param kind The expression's kind.
 * @param expression The expression.
 * @param scope The item and the variables of the attempt.
 * @returns The expression's value, or the first {@link EngineFailure} of its evaluation.
 */
const dispatch = <K extends ExpressionKind>(
  kind: K,
  expression: Variants[K],
  scope: Scope,
): Result.Result<Value, EngineFailure> => {
  const entry: Evaluator<K> = evaluators[kind];

  // oxlint-disable-next-line eslint/no-use-before-define -- `dispatch` and `evaluate` are mutually recursive, as operands nest; the call runs only after both are defined.
  return entry(expression, scope, evaluate);
};

/**
 * Give the value of an expression in a scope, as every evaluator's `evaluate` does.
 *
 * @param expression The expression.
 * @param scope The item and the variables of the attempt.
 * @returns The expression's value, or the first {@link EngineFailure} of its evaluation.
 */
const evaluate: Evaluate = (expression, scope) => dispatch(expression.kind, expression, scope);

/**
 * Report whether a condition's value is true.
 *
 * A response condition runs a branch only on a single boolean `true`: false or NULL counts as not
 * true, and so does a value of any other type. A template condition reads its branches, and a
 * template constraint its condition, the same way (`#plate/engine/template.ts`).
 *
 * @param value The condition's value.
 * @returns Whether it is the single boolean `true`.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_ResponseCondition
 */
export const isTrue = (value: Value): boolean => {
  const [single] = value.values;

  return value.cardinality === "single" && single?.baseType === "boolean" && single.value;
};

/**
 * Give the value of an expression.
 *
 * Each kind's evaluator in its family's table gives the value, and its doc says what that value
 * is. Operands are evaluated left to right, and the first failure is the result.
 *
 * Each kind's rule (`kindRules` in `#plate/model/expressions/read.ts`) gives its base type and
 * cardinality without evaluating it, so the database refuses a `qti-set-outcome-value` this
 * function would fail (`expression-type`), and the item model marks a built-in template whose set
 * it would fail (`treeNeeds` in `#plate/model/processing.ts`). Each family's tests hold its
 * evaluators to those rules (the type invariant in `#plate/test/processing.ts`), so the two cannot
 * drift apart.
 *
 * @param expression The expression.
 * @param declarations The declarations holder, an item, whose declarations give the correct
 *   responses, the mappings and the area mappings.
 * @param variables The variables of the run.
 * @param draw The stream the expression's random kinds draw from: each processing entry's own,
 *   keyed by the record's seed under its own label (`runAttempt` its response label,
 *   `firstAttempt` its template label), so no two attempts draw the same numbers.
 * @returns The expression's value; or an {@link EngineFailure}: an {@link UnknownIdentifierError}
 *   when it names a variable or response that is not held, or an {@link UnmappedResponseError} when
 *   a `map-response` names a response with no mapping or a `map-response-point` one with no area
 *   mapping.
 */
export const evaluateExpression = (
  expression: Expression,
  declarations: Declarations,
  variables: Variables,
  draw: Draw,
): Result.Result<Value, EngineFailure> => evaluate(expression, { declarations, draw, variables });

/**
 * Give the type of an outcome a rule sets: its modelled declaration's, else the built-in
 * `completionStatus`'s, a single identifier, where the holder holds the built-in.
 *
 * @param declarations The declarations holder.
 * @param identifier The outcome's identifier.
 * @returns The outcome's base type and cardinality, none when the holder holds no outcome by that
 *   name.
 */
const outcomeType = (
  declarations: Declarations,
  identifier: string,
): Option.Option<Pick<OutcomeDeclaration, "baseType" | "cardinality">> =>
  Option.orElse(Option.fromUndefinedOr(declarations.outcomes.get(identifier)), () =>
    identifier === completionStatus && holdsCompletionStatus(declarations)
      ? Option.some(completionStatusType)
      : Option.none(),
  );

/**
 * The type a rule must give the built-in `completionStatus`, as {@link OutcomeMismatchError} names
 * it: a single identifier, one of its four values.
 */
const completionExpected = `single identifier, one of ${[...completionStatusValues].join(", ")}`;

/**
 * Write a value a rule sets the built-in `completionStatus` to as {@link OutcomeMismatchError}
 * names it: `NULL`, a single identifier with its value, or its base type and cardinality.
 *
 * @param value The value.
 * @returns The text.
 */
const completionActual = (value: Value): string => {
  const [single] = value.values;
  if (isNull(value)) {
    return "NULL";
  }

  return value.cardinality === "single" && single?.baseType === "identifier"
    ? `single identifier ${JSON.stringify(single.value)}`
    : `${value.baseType} ${value.cardinality}`;
};

/**
 * Report whether a value is one the built-in `completionStatus` may hold: a single identifier, one
 * of its four values (reading 213).
 *
 * @param value The value a rule sets it to.
 * @returns Whether it is one; NULL is not.
 */
const isCompletionValue = (value: Value): boolean => {
  const [single, ...rest] = value.values;

  return (
    value.cardinality === "single" &&
    rest.length === 0 &&
    single?.baseType === "identifier" &&
    completionStatusValues.has(single.value)
  );
};

/**
 * Give the value a variable stores when a rule sets it to a value: a `qti-set-outcome-value` or a
 * `qti-lookup-outcome-value`, in template processing a `qti-set-template-value`, a
 * `qti-set-correct-response` or a `qti-set-default-value`.
 *
 * QTI assigns without conversion: "floating point values can not be assigned to integer variables
 * and vice-versa" (section 5.130, SetValue), so a value of another base type or cardinality
 * fails. A NULL is stored as the variable's own NULL, of its base type and cardinality, whatever
 * type the NULL came with: NULL is the absence of a value, so it has no type to differ from the
 * variable's. So every value stored is of its variable's declared type.
 *
 * @param target The variable's declared base type and cardinality.
 * @param identifier The variable's identifier.
 * @param value The value it is set to.
 * @returns The value stored; or an {@link OutcomeMismatchError} when the value is not NULL and its
 *   type differs from the variable's.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_SetValue
 */
export const assigned = (
  target: Pick<Value, "baseType" | "cardinality">,
  identifier: string,
  value: Value,
): Result.Result<Value, OutcomeMismatchError> => {
  if (isNull(value)) {
    return Result.succeed(nullOf(target.baseType, target.cardinality));
  }

  return value.baseType === target.baseType && value.cardinality === target.cardinality
    ? Result.succeed(value)
    : Result.fail(
        new OutcomeMismatchError({
          actual: `${value.baseType} ${value.cardinality}`,
          expected: `${target.baseType} ${target.cardinality}`,
          identifier,
        }),
      );
};

/**
 * Set an outcome, as `qti-set-outcome-value` and `qti-lookup-outcome-value` do: a modelled
 * outcome, or the built-in `completionStatus`, which a rule sets as an identifier, each without
 * conversion ({@link assigned}).
 *
 * The built-in `completionStatus` holds only its four values: "There are four permitted values"
 * (section 2.2.2.3), so a set of it to any other, NULL included, fails as a set of a value of
 * another type does (reading 213).
 *
 * @param declarations The declarations holder, whose declaration gives the outcome's type.
 * @param variables The variables before the rule.
 * @param identifier The outcome's identifier.
 * @param value The value to set.
 * @returns The variables with the outcome set and everything else as it was; or an
 *   {@link UnknownIdentifierError} when the holder declares no modelled outcome by that name and it
 *   is not the built-in `completionStatus` the holder holds, or an {@link OutcomeMismatchError}
 *   when the value is not NULL and its base type or cardinality differs from the outcome's, or
 *   when it sets the built-in to a value outside its four.
 */
const setOutcome = (
  declarations: Declarations,
  variables: Variables,
  identifier: string,
  value: Value,
): Result.Result<Variables, OutcomeMismatchError | UnknownIdentifierError> =>
  Result.gen(function* setOneOutcome() {
    const declaration = yield* Result.fromOption(
      outcomeType(declarations, identifier),
      () => new UnknownIdentifierError({ holder: "item", identifier, role: "outcome" }),
    );
    if (!declarations.outcomes.has(identifier) && !isCompletionValue(value)) {
      return yield* Result.fail(
        new OutcomeMismatchError({
          actual: completionActual(value),
          expected: completionExpected,
          identifier,
        }),
      );
    }

    const stored = yield* assigned(declaration, identifier, value);

    return { ...variables, outcomes: { ...variables.outcomes, [identifier]: stored } };
  });

/**
 * A condition as both interpreters read one, a `qti-response-condition` and a
 * `qti-template-condition`: its branches in order, each a condition and its rules, and its
 * `otherwise`.
 */
interface Branches<R> {
  readonly branches: readonly { readonly rules: readonly R[]; readonly when: Expression }[];
  readonly otherwise: Option.Option<readonly R[]>;
}

/**
 * Choose the rules a condition runs: those of its first branch whose condition is true
 * ({@link isTrue}), else its `otherwise`, else none.
 *
 * Branch conditions are evaluated in order, and those after the chosen branch, or after a
 * condition that fails, are not evaluated, so a branch after it draws nothing.
 *
 * @param condition The condition.
 * @param valueOf The value of a branch's condition, in the run's scope.
 * @returns The chosen rules, or the first failure of a branch condition.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_ResponseCondition
 */
export const chosenRules = <R>(
  condition: Branches<R>,
  valueOf: (when: Expression) => Result.Result<Value, EngineFailure>,
): Result.Result<readonly R[], EngineFailure> =>
  Result.gen(function* chooseBranch() {
    for (const branch of condition.branches) {
      if (isTrue(yield* valueOf(branch.when))) {
        return branch.rules;
      }
    }

    return Option.getOrElse(condition.otherwise, () => []);
  });

/**
 * How a rule of a sequence ended: `next`, with the state the rules after it start from, or one of
 * the interpreter's own stops, which ends the sequence.
 */
export type Ran<S, Stop> = { readonly kind: "next"; readonly state: S } | Stop;

/**
 * Run rules in order, each from the state the rules before it left, until one stops the sequence,
 * as both interpreters run a sequence: response rules until a `qti-exit-response`, template rules
 * until a `qti-exit-template` or a failing constraint's restart.
 *
 * @param rules The rules.
 * @param state The state before the first rule.
 * @param runRule Run one rule from a state.
 * @returns `next` with the state after the last rule, or the first stop, or the first failure.
 */
export const runInOrder = <R, S, Stop extends { readonly kind: "exit" | "restart" }>(
  rules: readonly R[],
  state: S,
  runRule: (rule: R, state: S) => Result.Result<Ran<S, Stop>, EngineFailure>,
): Result.Result<Ran<S, Stop>, EngineFailure> =>
  Result.gen(function* runRulesInOrder() {
    let current = state;
    for (const rule of rules) {
      const ran: Ran<S, Stop> = yield* runRule(rule, current);
      if (ran.kind !== "next") {
        return ran;
      }

      current = ran.state;
    }

    return { kind: "next", state: current } satisfies Ran<S, Stop>;
  });

/**
 * Report whether a number is at or above an interpolation entry's `source-value`, the equal case
 * counting only when the entry includes its boundary. An integer and a float compare exactly: `>`
 * between a `bigint` and a `number` loses nothing, and equality is {@link sameNumber}'s.
 *
 * @param number The looked-up number.
 * @param bound The entry's `source-value`.
 * @param includeBoundary The entry's `include-boundary`.
 * @returns Whether the entry maps the number.
 */
const reaches = (number: NumberSingle, bound: number, includeBoundary: boolean): boolean =>
  number.value > bound ||
  (includeBoundary && sameNumber(number, { baseType: "float", value: bound }));

/**
 * Give the number a lookup reads its operand as: a single integer or float as it is, and a single
 * duration as a float of its seconds, since the operand is "a single integer, float or duration"
 * (reading 28) and a duration is "represented as a single float that records time in seconds"
 * (Table 8.13, BaseTypeEnum).
 *
 * @param value The expression's value.
 * @returns The number, none for NULL or a value of another type.
 */
const lookupSource = (value: Value): Option.Option<NumberSingle> =>
  singleOf(value, "duration").pipe(
    Option.map((single): NumberSingle => ({ baseType: "float", value: single.value })),
    Option.orElse(() => numberOf(value)),
  );

/**
 * Map a value through a lookup table, as `qti-lookup-outcome-value` does: a match table by the
 * first entry whose `source-value` is the value exactly, an interpolation table by the first entry
 * whose `source-value` the value is at or above ({@link reaches}), a duration by its seconds
 * ({@link lookupSource}).
 *
 * A NULL, or a value no entry maps, gives the table's `default-value`, else nothing; the outcome's
 * own `qti-default-value` is not used. The database holds a match table's value to a single
 * integer and an interpolation table's to a single integer, float or duration (reading 28), so a
 * value of another type maps through no entry.
 *
 * @param table The outcome's lookup table.
 * @param value The expression's value.
 * @returns The entry's or the table's value, or none.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_LookupOutcomeValue
 */
const lookUp = (table: LookupTable, value: Value): Option.Option<Single> => {
  const mapped = Option.flatMap(lookupSource(value), (source): Option.Option<Single> => {
    const entry =
      table.kind === "match"
        ? table.entries.find(
            (each) => source.baseType === "integer" && each.sourceValue === source.value,
          )
        : table.entries.find((each) => reaches(source, each.sourceValue, each.includeBoundary));

    return Option.map(Option.fromUndefinedOr(entry), (found) => found.targetValue);
  });

  return Option.orElse(mapped, () => table.defaultValue);
};

/**
 * Give the value a `qti-lookup-outcome-value` sets its outcome to: the single its outcome's lookup
 * table maps the value to ({@link lookUp}), else NULL.
 *
 * An outcome with no lookup table maps every value to NULL; the database refuses a lookup of one
 * (`template-requirements`), so no checked item reaches it. An outcome the holder does not declare
 * maps to NULL too, and {@link setOutcome} then fails it: an undeclared name as unknown, and the
 * built-in `completionStatus`, which no declaration gives a table, as a value outside its four. The
 * database refuses a lookup of the built-in too (reading 197).
 *
 * @param declarations The declarations holder, whose outcome declaration holds the table.
 * @param identifier The outcome's identifier.
 * @param value The expression's value.
 * @returns The value to set.
 */
const lookedUp = (declarations: Declarations, identifier: string, value: Value): Value => {
  const target = Option.fromUndefinedOr(declarations.outcomes.get(identifier)).pipe(
    Option.flatMap((declared) => declared.lookupTable),
    Option.flatMap((table) => lookUp(table, value)),
  );

  return Option.match(target, {
    onNone: () => nullOf(value.baseType, value.cardinality),
    onSome: singleValue,
  });
};

/**
 * How a response rule ended: on its own (`next`), so the rules after it run, or at a
 * `qti-exit-response` (`exit`), each with the variables the rules left.
 */
type Response = Ran<Variables, { readonly kind: "exit"; readonly state: Variables }>;

/**
 * Run one response rule.
 *
 * A condition runs the rules of its first branch whose condition is true, else its `otherwise`,
 * else nothing ({@link chosenRules}); the conditions after the chosen branch are not evaluated. A
 * set gives its outcome the expression's value, a lookup the value its outcome's table maps the
 * expression's value to ({@link lookedUp}), and an exit ends the run, at any depth.
 *
 * @param rule The rule.
 * @param declarations The declarations holder.
 * @param variables The variables before the rule.
 * @param draw The run's stream.
 * @returns How the rule ended, with the variables after it, or its first failure.
 */
const runRule = (
  rule: Rule,
  declarations: Declarations,
  variables: Variables,
  draw: Draw,
): Result.Result<Response, EngineFailure> =>
  Result.gen(function* runOneRule() {
    if (rule.kind === "exit") {
      return { kind: "exit", state: variables } satisfies Response;
    }

    if (rule.kind === "condition") {
      const then = yield* chosenRules(rule, (when) =>
        evaluateExpression(when, declarations, variables, draw),
      );

      return yield* runInOrder(then, variables, (each, before: Variables) =>
        runRule(each, declarations, before, draw),
      );
    }

    const value = yield* evaluateExpression(rule.expression, declarations, variables, draw);
    const set =
      rule.kind === "set-outcome" ? value : lookedUp(declarations, rule.identifier, value);

    return {
      kind: "next",
      state: yield* setOutcome(declarations, variables, rule.identifier, set),
    } satisfies Response;
  });

/**
 * Run response rules in order, each seeing the variables the rules before it left. A
 * `qti-exit-response` ends the run, nested or not: the rules after it do not run, and what the
 * rules before it set stays.
 *
 * Only outcomes change; the responses are returned as given.
 *
 * @param rules The rules, as the item model built them.
 * @param declarations The declarations holder they belong to: the item.
 * @param variables The variables before the rules run.
 * @param draw The one stream every rule's expressions draw from, in the order the rules run them:
 *   each processing entry's own, keyed by the record's seed under its own label (`runAttempt` its
 *   response label), so no two attempts draw the same numbers.
 * @returns The variables after the last rule run; or the first failure, after which no rule runs:
 *   an {@link UnknownIdentifierError} when a rule names an identifier the item or the variables do
 *   not hold in the role the rule reads it in, an {@link OutcomeMismatchError} when a rule sets an
 *   outcome to a value of another type that is not NULL, or an {@link UnmappedResponseError} when
 *   a rule maps a response that has no mapping.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_ResponseProcessing
 */
export const runRules = (
  rules: readonly Rule[],
  declarations: Declarations,
  variables: Variables,
  draw: Draw,
): Result.Result<Variables, EngineFailure> =>
  Result.map(
    runInOrder(rules, variables, (rule, before: Variables) =>
      runRule(rule, declarations, before, draw),
    ),
    (ran) => ran.state,
  );
