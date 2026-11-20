/**
 * The template interpreter: an item's template processing, run from the item's declared state as a
 * pure function of the item, its template rules and one stream of draws.
 *
 * {@link runTemplates} gives the value of each template variable and the correct responses and
 * defaults the rules set, by identifier. The rules run in order, each seeing what the rules before
 * it left, and every expression goes through the evaluator (`evaluateExpression` in
 * `#plate/engine/evaluate.ts`) with the one stream the caller passes, so a seed in gives the same
 * values out. Template processing may read only template variables (section 6.50), so the
 * evaluator sees the template values and no response or outcome value. A failure of what the
 * caller passed is an {@link EngineFailure} returned in a `Result`, as the evaluator returns it;
 * the first one ends the run.
 *
 * Value imports point one way: `#plate/engine/attempt.ts` to here, and here to the evaluator.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_TemplateProcessing
 */
import { Option, Result } from "effect";
import {
  assigned,
  chosenRules,
  evaluateExpression,
  isTrue,
  runInOrder,
} from "#plate/engine/evaluate.ts";
import type { EngineFailure, Ran } from "#plate/engine/evaluate.ts";
import { UnknownIdentifierError } from "#plate/engine/failures.ts";
import type { OutcomeMismatchError } from "#plate/engine/failures.ts";
import type { Draw } from "#plate/engine/random.ts";
import { itemBuiltInTypes } from "#plate/model/built-ins.ts";
import type { Expression, TemplateRule } from "#plate/model/expression.ts";
import type { Item, TemplateDeclaration } from "#plate/model/item.ts";
import { contextValues } from "#plate/model/record.ts";
import { nullOf, nullRecord } from "#plate/model/values.ts";
import type { RecordValue, Value } from "#plate/model/values.ts";

/**
 * What template processing leaves, each map by identifier: the value of every template variable,
 * and the correct responses and defaults its rules set.
 *
 * `templates` holds every template variable the item declares. `correct` and `defaults` hold only
 * the variables a `qti-set-correct-response` or a `qti-set-default-value` set; the item's own
 * declarations are never changed, so a variable the rules did not set keeps its declared correct
 * response or default, which the evaluator reads behind these maps (`Variables.correct` and
 * `Variables.defaults` in `#plate/engine/evaluate.ts`). Every value is of its target's declared
 * base type and cardinality, or a built-in's own type for a built-in ({@link builtInTargets}), a
 * NULL included.
 */
export interface TemplateValues {
  readonly correct: Readonly<Record<string, Value>>;
  readonly defaults: Readonly<Record<string, Value>>;
  readonly templates: Readonly<Record<string, Value>>;
}

/**
 * The number of restarts one run of template processing may take, shared by all its
 * `qti-template-constraint`s, so it runs its rules at most 101 times.
 *
 * QTI requires "a finite maximum number of iterations" and assumes 100 (section 5.150), and the
 * run's constraints share the budget (reading 216); when it runs out, a failing constraint applies
 * the declared state and processing continues after it.
 */
const restartBudget = 100;

/**
 * A template rule that sets a variable: a `qti-set-template-value`, a `qti-set-correct-response`
 * or a `qti-set-default-value`.
 */
type SetRule = Extract<TemplateRule, { readonly identifier: string }>;

/**
 * The map of {@link TemplateValues} each setting rule writes.
 */
const setMaps = {
  "set-correct-response": "correct",
  "set-default-value": "defaults",
  "set-template-value": "templates",
} as const satisfies Readonly<Record<SetRule["kind"], keyof TemplateValues>>;

/**
 * One run of the rules: the item, the stream, the declared state a restart returns to, and whether
 * the run's restarts are spent.
 */
interface Pass {
  /**
   * The item's context variables at their defaults (`contextValues` in `#plate/model/record.ts`).
   */
  readonly contexts: Readonly<Record<string, Value>>;
  readonly declared: TemplateValues;
  readonly draw: Draw;
  readonly item: Item;
  /**
   * The value of `QTI_CONTEXT`, which the host's context gave before the run started.
   */
  readonly qtiContext: RecordValue;
  /**
   * Whether the budget's restarts are all taken, so a failing constraint applies the declared state
   * and processing continues after it instead of restarting.
   */
  readonly spent: boolean;
}

/**
 * How a template rule ended: on its own (`next`, so the rules after it run) or at a
 * `qti-exit-template` (`exit`), each with what the rules left; or at a failing constraint that
 * restarts the run (`restart`), which keeps nothing.
 */
type Step = Ran<
  TemplateValues,
  { readonly kind: "exit"; readonly state: TemplateValues } | { readonly kind: "restart" }
>;

/**
 * Give the state template processing starts from: each template variable at its declared default,
 * else NULL of its declared base type and cardinality, and no correct response or default set.
 *
 * @param item The item, whose template declarations give each variable's type and default.
 * @returns The declared state.
 */
const declaredState = (item: Item): TemplateValues => ({
  correct: {},
  defaults: {},
  templates: Object.fromEntries(
    Array.from(item.templates, ([identifier, declaration]) => [
      identifier,
      Option.getOrElse(declaration.defaultValue, () =>
        nullOf(declaration.baseType, declaration.cardinality),
      ),
    ]),
  ),
});

/**
 * Give the value of an expression of template processing: through the evaluator, with the run's
 * stream, the template values the rules have left, the item's context variables and
 * `QTI_CONTEXT`, which the engine sets before any processing runs, and no response or outcome
 * value, because template processing "may only refer to the values of the template variables"
 * (section 6.50) beside the context variables it may read ("Context variables may be referenced in
 * template processing", section 5.34).
 *
 * So a `qti-variable` of a response or an outcome is the record's gap, and a `qti-equal` whose
 * `tolerance` names an outcome is NULL; the database refuses both before any run.
 *
 * @param expression The expression.
 * @param pass The run.
 * @param values What the rules before it left.
 * @returns The expression's value, or the evaluator's first failure.
 */
const evaluateIn = (
  expression: Expression,
  pass: Pass,
  values: TemplateValues,
): Result.Result<Value, EngineFailure> =>
  evaluateExpression(
    expression,
    pass.item,
    {
      contexts: pass.contexts,
      outcomes: {},
      qtiContext: pass.qtiContext,
      responses: {},
      templates: values.templates,
    },
    pass.draw,
  );

/**
 * The base type and cardinality of a variable a setting rule sets.
 */
type TargetType = Pick<TemplateDeclaration, "baseType" | "cardinality">;

/**
 * The built-in variables the engine holds that each setting rule may set, typed as an item builds
 * them in (`itemBuiltInTypes` in `#plate/model/built-ins.ts`): the built-in response `numAttempts`
 * for `qti-set-correct-response`, and it and the built-in outcome `completionStatus` for
 * `qti-set-default-value`. A built-in stands as a declaration of its kind (reading 111, "a
 * processing element's `identifier` names a variable of the kind the element reads or sets").
 * `duration` is not among them: the engine holds no item's time spent, and the item model marks a
 * template processing that sets it, which then does not run.
 */
const builtInTargets: Readonly<Record<SetRule["kind"], ReadonlyMap<string, TargetType>>> = {
  "set-correct-response": new Map([["numAttempts", itemBuiltInTypes.numAttempts]]),
  "set-default-value": new Map<string, TargetType>([
    ["completionStatus", itemBuiltInTypes.completionStatus],
    ["numAttempts", itemBuiltInTypes.numAttempts],
  ]),
  "set-template-value": new Map(),
};

/**
 * Give the type of the variable a setting rule sets: a template variable for
 * `qti-set-template-value`, a response for `qti-set-correct-response`, and a response or an
 * outcome for `qti-set-default-value`, as the information model names their targets and the
 * database holds them (pantry's "Set type"): the item's declaration of
 * it, else, when the item declares no variable by that name, a built-in of that kind
 * ({@link builtInTargets}), typed as the built-in, whose correct response or default is then
 * recorded as a declared variable's is. A declared variable wins over a built-in of the same name.
 *
 * @param item The item.
 * @param rule The setting rule.
 * @returns The target's base type and cardinality, or an {@link UnknownIdentifierError} when the
 *   item declares no variable of that kind by that name and it names no built-in of that kind.
 */
const targetOf = (item: Item, rule: SetRule): Result.Result<TargetType, UnknownIdentifierError> => {
  const { identifier } = rule;
  const declares =
    item.responses.has(identifier) ||
    item.outcomes.has(identifier) ||
    item.templates.has(identifier) ||
    item.records.has(identifier);
  const found = declares
    ? {
        "set-correct-response": () => item.responses.get(identifier),
        "set-default-value": () => item.responses.get(identifier) ?? item.outcomes.get(identifier),
        "set-template-value": () => item.templates.get(identifier),
      }[rule.kind]()
    : builtInTargets[rule.kind].get(identifier);

  return Result.fromOption(
    Option.fromUndefinedOr(found),
    () =>
      new UnknownIdentifierError({
        holder: "item",
        identifier: rule.identifier,
        role: rule.kind === "set-correct-response" ? "response" : "variable",
      }),
  );
};

/**
 * Set the variable a setting rule names to a value, in the map the rule writes ({@link setMaps}),
 * without conversion (`assigned` in `#plate/engine/evaluate.ts`).
 *
 * @param item The item, whose declaration gives the target's type.
 * @param values What the rules before it left.
 * @param rule The setting rule.
 * @param value The expression's value.
 * @returns What the rules leave with the variable set; or an {@link UnknownIdentifierError} when
 *   the item declares no variable of the rule's kind by that name, or an
 *   {@link OutcomeMismatchError} when the value is not NULL and its type differs from the target's.
 */
const assign = (
  item: Item,
  values: TemplateValues,
  rule: SetRule,
  value: Value,
): Result.Result<TemplateValues, OutcomeMismatchError | UnknownIdentifierError> =>
  Result.gen(function* assignOneVariable() {
    const target = yield* targetOf(item, rule);
    const stored = yield* assigned(target, rule.identifier, value);
    const map = setMaps[rule.kind];

    return { ...values, [map]: { ...values[map], [rule.identifier]: stored } };
  });

/**
 * Run one template rule.
 *
 * A setting rule sets its variable ({@link assign}); a condition runs the rules of its first branch
 * whose condition is true, else its `qti-template-else`, else none (`chosenRules` in
 * `#plate/engine/evaluate.ts`), and no branch after the chosen one draws; a `qti-exit-template`
 * ends the run, at any depth, keeping what is set. A
 * `qti-template-constraint` whose condition is true lets the rules after it run; one that is false
 * or NULL restarts the run, or, once the run's restarts are spent, applies the declared state and
 * lets the rules after it run.
 *
 * @param rule The rule.
 * @param pass The run.
 * @param values What the rules before it left.
 * @returns How the rule ended, or its first failure.
 */
const runRule = (
  rule: TemplateRule,
  pass: Pass,
  values: TemplateValues,
): Result.Result<Step, EngineFailure> =>
  Result.gen(function* runOneTemplateRule() {
    switch (rule.kind) {
      case "exit-template": {
        return { kind: "exit", state: values } satisfies Step;
      }
      case "template-condition": {
        const then = yield* chosenRules(rule, (when) => evaluateIn(when, pass, values));

        return yield* runInOrder(then, values, (each, before: TemplateValues) =>
          runRule(each, pass, before),
        );
      }
      case "template-constraint": {
        if (isTrue(yield* evaluateIn(rule.expression, pass, values))) {
          return { kind: "next", state: values } satisfies Step;
        }

        return pass.spent
          ? ({ kind: "next", state: pass.declared } satisfies Step)
          : ({ kind: "restart" } satisfies Step);
      }
      case "set-correct-response":
      case "set-default-value":
      case "set-template-value": {
        const value = yield* evaluateIn(rule.expression, pass, values);

        return {
          kind: "next",
          state: yield* assign(pass.item, values, rule, value),
        } satisfies Step;
      }
      default: {
        return rule satisfies never;
      }
    }
  });

/**
 * Run template rules in order until one exits or restarts, each seeing what the rules before it
 * left (`runInOrder` in `#plate/engine/evaluate.ts`).
 *
 * @param rules The rules.
 * @param pass The run.
 * @param values What the rules before them left.
 * @returns How the sequence ended, or the first failure.
 */
const runSequence = (
  rules: readonly TemplateRule[],
  pass: Pass,
  values: TemplateValues,
): Result.Result<Step, EngineFailure> =>
  runInOrder(rules, values, (rule, before: TemplateValues) => runRule(rule, pass, before));

/**
 * Run an item's template processing.
 *
 * The run starts from the declared state: each template variable at its declared default, else NULL
 * of its type, and no correct response or default set. The rules run in order, each seeing what the
 * rules before it left; `qti-set-template-value` sets its template variable, and
 * `qti-set-correct-response` and `qti-set-default-value` write the result's `correct` and
 * `defaults`, never the item. A `qti-template-condition` runs its first branch whose condition is a
 * single boolean `true`, else its `qti-template-else`; a `qti-exit-template` ends the run, nested
 * or not, keeping what is set.
 *
 * A `qti-template-constraint` that is false or NULL restarts the run from the declared state, both
 * override maps emptied, "repeatedly until the expression is 'true' or the maximum number of
 * iterations is reached" (section 5.150). The run's constraints share one budget of 100 restarts
 * (reading 216). When it runs out, the declared state applies and processing continues
 * after the constraint, and a later failing constraint applies it again and continues. The stream
 * is never reset, so each restart draws new values.
 *
 * Every expression reads the template values and no response or outcome value, as template
 * processing "may only refer to the values of the template variables" (section 6.50).
 *
 * @param item The item, whose declarations give each variable's type and default.
 * @param rules The item's template rules, as the item model built them (`Item.templateProcessing`).
 * @param draw The one stream every random kind of the run draws from, in the order the rules
 *   evaluate them, restarts included: the caller's, keyed by the record's seed under the item's
 *   template label (`templateLabel` in `#plate/engine/random.ts`).
 * @param qtiContext The value of `QTI_CONTEXT` the host's context gives (`qtiContextRecord` in
 *   `#plate/model/record.ts`); the NULL record by default, when the host gave none.
 * @returns The template values and the correct responses and defaults set; or the first failure,
 *   after which no rule runs: an {@link UnknownIdentifierError} when an expression reads a variable
 *   template processing holds no value of, or a rule sets a variable the item does not declare in
 *   the kind the rule sets, an {@link OutcomeMismatchError} when a rule sets a variable to a value
 *   of another type that is not NULL, or any other failure of the evaluator.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_TemplateConstraint
 */
export const runTemplates = (
  item: Item,
  rules: readonly TemplateRule[],
  draw: Draw,
  qtiContext: RecordValue = nullRecord,
): Result.Result<TemplateValues, EngineFailure> =>
  Result.gen(function* runFromDeclaredState() {
    const declared = declaredState(item);
    const run = { contexts: contextValues(item.contexts), declared, draw, item, qtiContext };
    let restarts = 0;
    let step = yield* runSequence(rules, { ...run, spent: false }, declared);
    while (step.kind === "restart") {
      restarts += 1;
      step = yield* runSequence(rules, { ...run, spent: restarts === restartBudget }, declared);
    }

    return step.state;
  });
