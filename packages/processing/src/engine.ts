/**
 * The engine: a run of one processing language over a compiled program's state, every expression
 * evaluated by its kind's operator, every set held to its target's type.
 *
 * - **Template processing** (§5.156) draws template values, correct responses and defaults at the
 *   start of an item session. A constraint that is not true restarts it from the declared values,
 *   at most 100 restarts a run, shared by every constraint; once they are spent the declared values
 *   are used and processing continues after the constraint (reading `null-results`, item 7).
 * - **Response processing** (§4.6) sets an item's outcomes from its responses. `qti-exit-response`
 *   ends the whole run, from inside a fragment too.
 * - **Outcome processing** (§5.102) sets a test's outcomes from its items', from the defaults every
 *   run. `qti-exit-test` ends outcome processing.
 *
 * A set stores a NULL as the target's NULL, a value of the target's type as it is, and fails the
 * run on any other (reading `completion-status-values`), `completionStatus` only to one of its four
 * values. A condition's branch runs when its test is the single boolean true; NULL is not true. The
 * first failure ends the run; its result is the failure, never a value (readings
 * `engine-size-limit`, `completion-status-values`).
 *
 * @module
 */
import type { Expression, ExpressionKind, ItemFilter, Node, VariableRef } from "#processing/ir.ts";
import type { Operator, OperatorTable } from "#processing/operators/operator.ts";
import type {
  Condition,
  Declaration,
  LookupRule,
  LookupTable,
  OutcomeRule,
  ResponseRule,
  TemplateRule,
} from "#processing/program.ts";
import type { Demand, MemberState, ProcessingFailure, Run } from "#processing/run.ts";
import { toFloat } from "#processing/numbers.ts";
import { nullOf, sameValueType, single, valueTypeOf } from "#processing/value.ts";
import type { Single, Value } from "#processing/value.ts";

/**
 * The values a run reads and sets: each variable's current value, and the correct responses and
 * defaults template processing set, by identifier.
 */
export interface Variables {
  readonly correct: ReadonlyMap<string, Value>;
  readonly defaults: ReadonlyMap<string, Value>;
  readonly values: ReadonlyMap<string, Value>;
}

/**
 * What a run is over: its program's declarations, the variables it starts from, its stream, the
 * recorded answers it reads, and in outcome processing the test's item sessions.
 */
export interface RunInput {
  readonly declarations: ReadonlyMap<string, Declaration>;
  readonly draw: () => number;
  readonly members: readonly MemberState[];
  readonly recorded: ReadonlyMap<number, Value>;
  readonly variables: Variables;
}

/**
 * A run's result: the variables it ended with and the demands it made, or the failure that ended
 * it.
 */
export type RunResult =
  | { readonly demands: readonly Demand[]; readonly kind: "ran"; readonly variables: Variables }
  | { readonly failure: ProcessingFailure; readonly kind: "failed" };

/**
 * The four values `completionStatus` may hold (§2.2.2.3, reading `completion-status-values`).
 */
const completionValues: ReadonlySet<string> = new Set([
  "completed",
  "incomplete",
  "not_attempted",
  "unknown",
]);

/**
 * Evaluate a node with its kind's operator.
 *
 * @param table - The operators.
 * @param kind - The node's kind.
 * @param node - The node.
 * @param run - The run.
 * @returns Its value.
 */
const dispatch = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  kind: K,
  node: Node<K>,
  run: Run,
): Value => {
  const operator: Operator<K> = table[kind];

  return operator.evaluate(node, run);
};

/**
 * Whether a node is of a kind the table holds.
 *
 * @param table - The operators.
 * @param expression - The node.
 * @returns Whether the table holds its kind.
 */
const heldBy = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  expression: Expression,
): expression is Node<K> => Object.hasOwn(table, expression.kind);

/**
 * Whether a member's sections and categories pass a filter (§7.39, reading `null-results` item 4).
 *
 * @param member - The member.
 * @param filter - The filter.
 * @returns Whether it is kept.
 */
const kept = (member: MemberState, filter: ItemFilter): boolean =>
  (filter.section === undefined || member.sections.includes(filter.section)) &&
  (filter.includeCategories.length === 0 ||
    filter.includeCategories.some((category) => member.categories.includes(category))) &&
  !filter.excludeCategories.some((category) => member.categories.includes(category));

/**
 * A member's variable as a prefixed read reads it: its value, or the response's or outcome's; times
 * its weight where the read names one and the value is a single integer or float (a float, 1.0
 * where the ref defines no such weight, §7.47.2).
 *
 * @param member - The member, or `undefined` where the session holds no such occurrence.
 * @param variable - The reference.
 * @param read - Which of the variable's values: its value, its correct response or its default.
 * @returns The value.
 */
const memberValue = (
  member: MemberState | undefined,
  variable: Extract<VariableRef, { readonly scope: "member" }>,
  read: "correct" | "default" | "value",
): Value => {
  const response = member?.responses.find((each) => each.identifier === variable.variable);
  const outcome = member?.outcomes.find((each) => each.identifier === variable.variable);
  const value =
    response?.[read] ?? (read === "value" ? outcome?.value : undefined) ?? nullOf(variable.type);
  if (variable.weight === undefined || read !== "value" || value.kind !== "single") {
    return value;
  }

  const weight = member?.weights.get(variable.weight) ?? 1;
  if (value.base === "float") {
    return single("float", value.value * weight);
  }

  return value.base === "integer" ? single("float", toFloat(value.value) * weight) : value;
};

/**
 * The state a run keeps while its rules set its variables.
 */
interface State {
  correct: Map<string, Value>;
  defaults: Map<string, Value>;
  readonly demands: Demand[];
  failure: ProcessingFailure | undefined;
  values: Map<string, Value>;
}

/**
 * Make a run over a state.
 *
 * @param table - The operators.
 * @param input - What the run is over.
 * @param state - Its state, which its sets change.
 * @returns The run.
 */
const runOver = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  input: RunInput,
  state: State,
): Run => {
  const declared = (identifier: string): Declaration | undefined =>
    input.declarations.get(identifier);
  const member = (
    variable: Extract<VariableRef, { readonly scope: "member" }>,
  ): MemberState | undefined => {
    const occurrences = input.members.filter((each) => each.identifier === variable.item);

    return variable.occurrence === undefined
      ? occurrences.at(-1)
      : occurrences.find((each) => each.occurrence === variable.occurrence);
  };
  const run: Run = {
    correctOf: (variable) =>
      variable.scope === "member"
        ? memberValue(member(variable), variable, "correct")
        : (state.correct.get(variable.identifier) ??
          declared(variable.identifier)?.correct ??
          nullOf(variable.type)),
    defaultOf: (variable) =>
      variable.scope === "member"
        ? memberValue(member(variable), variable, "default")
        : (state.defaults.get(variable.identifier) ??
          declared(variable.identifier)?.default ??
          nullOf(variable.type)),
    demand: (demand) => {
      state.demands.push(demand);
    },
    draw: input.draw,
    evaluate: (expression) =>
      heldBy(table, expression)
        ? dispatch(table, expression.kind, expression, run)
        : nullOf({ cardinality: "record" }),
    fail: (failure) => {
      state.failure ??= failure;
    },
    members: (filter) => input.members.filter((each) => kept(each, filter)),
    read: (variable) =>
      variable.scope === "member"
        ? memberValue(member(variable), variable, "value")
        : (state.values.get(variable.identifier) ?? nullOf(variable.type)),
    recorded: (place) => input.recorded.get(place),
  };

  return run;
};

/**
 * Whether a value is the single boolean true.
 *
 * @param value - The value.
 * @returns Whether it is.
 */
const isTrue = (value: Value): boolean =>
  value.kind === "single" && value.base === "boolean" && value.value;

/**
 * The value a set stores in its target, or the failure it is (reading `completion-status-values`):
 * a NULL as the target's NULL, a value of the target's type as it is, `completionStatus` only one
 * of its four values.
 *
 * @param target - The target.
 * @param value - The value.
 * @param place - The set's place.
 * @returns The value to store, or the failure.
 */
const assigned = (
  target: VariableRef,
  value: Value,
  place: number,
):
  | { readonly kind: "failed"; readonly failure: ProcessingFailure }
  | { readonly kind: "stored"; readonly value: Value } => {
  if (target.scope === "own" && target.identifier === "completionStatus") {
    return value.kind === "single" &&
      value.base === "identifier" &&
      completionValues.has(value.value)
      ? { kind: "stored", value }
      : { failure: { kind: "completion-status", place, value }, kind: "failed" };
  }

  if (value.kind === "null") {
    return { kind: "stored", value: nullOf(target.type) };
  }

  const actual = valueTypeOf(value);

  return sameValueType(actual, target.type)
    ? { kind: "stored", value }
    : {
        failure: {
          actual,
          expected: target.type,
          identifier: target.scope === "own" ? target.identifier : target.variable,
          kind: "set-type",
          place,
        },
        kind: "failed",
      };
};

/**
 * The number a single integer, float or duration holds, as an interpolation table compares it.
 *
 * @param value - The single.
 * @returns Its number, or `undefined` for another base type.
 */
const numberOf = (value: Single): number | undefined => {
  if (value.base === "integer") {
    return toFloat(value.value);
  }

  return value.base === "float" || value.base === "duration" ? value.value : undefined;
};

/**
 * The value a lookup table maps a value to (§5.72): a match table's first entry whose source is the
 * integer; an interpolation table's first entry, in document order, whose source is at most the
 * number (below it where the entry excludes its boundary); the table's default where none does,
 * NULL where it has none (§5.71.1, §5.89.1).
 *
 * @param table - The table.
 * @param value - The value looked up: a single integer, float or duration.
 * @returns The target, or `undefined`.
 */
const lookedUp = (table: LookupTable, value: Value): Single | undefined => {
  if (value.kind !== "single") {
    return table.defaultValue;
  }

  if (table.kind === "match") {
    const found =
      value.base === "integer"
        ? table.entries.find((entry) => entry.source === value.value)
        : undefined;

    return found?.target ?? table.defaultValue;
  }

  const number = numberOf(value);
  const found =
    number === undefined
      ? undefined
      : table.entries.find((entry) =>
          entry.includeBoundary ? entry.source <= number : entry.source < number,
        );

  return found?.target ?? table.defaultValue;
};

/**
 * What a rule list's run ended with: the next rule, or an exit.
 */
type Ended = "exit" | "next" | "restart";

/**
 * Run one set: evaluate its expression, hold the value to its target, store it.
 *
 * @param run - The run.
 * @param state - The state.
 * @param target - The target.
 * @param expression - The expression.
 * @param place - The set's place.
 * @param into - Which of the state's maps it sets.
 */
const runSet = (
  run: Run,
  state: State,
  target: VariableRef,
  expression: Expression,
  place: number,
  into: "correct" | "defaults" | "values",
): void => {
  const value = run.evaluate(expression);
  if (state.failure !== undefined) {
    return;
  }

  const stored = assigned(target, value, place);
  if (stored.kind === "failed") {
    run.fail(stored.failure);

    return;
  }

  state[into].set(target.scope === "own" ? target.identifier : target.variable, stored.value);
};

/**
 * Run a lookup.
 *
 * @param run - The run.
 * @param state - The state.
 * @param rule - The lookup.
 */
const runLookup = (run: Run, state: State, rule: LookupRule): void => {
  const value = run.evaluate(rule.expression);
  if (state.failure !== undefined) {
    return;
  }

  const target = lookedUp(rule.table, value);
  state.values.set(
    rule.target.scope === "own" ? rule.target.identifier : rule.target.variable,
    target ?? nullOf(rule.target.type),
  );
};

/**
 * The rules a condition runs: its first branch whose test is true, else its else.
 *
 * @param run - The run.
 * @param condition - The condition.
 * @returns The rules.
 */
const chosen = <R>(run: Run, condition: Condition<R>): readonly R[] =>
  condition.branches.find((branch) => isTrue(run.evaluate(branch.when)))?.rules ??
  condition.otherwise;

/**
 * Run response or outcome rules in order.
 *
 * @param run - The run.
 * @param state - The state.
 * @param rules - The rules.
 * @returns How the list ended.
 */
const runOutcomeRules = (
  run: Run,
  state: State,
  rules: readonly (OutcomeRule | ResponseRule)[],
): Ended => {
  for (const rule of rules) {
    if (state.failure !== undefined) {
      return "exit";
    }

    switch (rule.kind) {
      case "condition": {
        const ended = runOutcomeRules(run, state, chosen<OutcomeRule | ResponseRule>(run, rule));
        if (ended !== "next") {
          return ended;
        }

        break;
      }
      case "set-outcome": {
        runSet(run, state, rule.target, rule.expression, rule.place, "values");
        break;
      }
      case "lookup-outcome": {
        runLookup(run, state, rule);
        break;
      }
      case "exit-response":
      case "exit-test": {
        return "exit";
      }
    }
  }

  return "next";
};

/**
 * Run template rules in order.
 *
 * @param run - The run.
 * @param state - The state.
 * @param rules - The rules.
 * @param spent - Whether the run's restarts are spent.
 * @param declared - The declared template values, which a spent constraint resets to.
 * @returns How the list ended.
 */
const runTemplateRules = (
  run: Run,
  state: State,
  rules: readonly TemplateRule[],
  spent: boolean,
  declared: ReadonlyMap<string, Value>,
): Ended => {
  for (const rule of rules) {
    if (state.failure !== undefined) {
      return "exit";
    }

    switch (rule.kind) {
      case "condition": {
        const ended = runTemplateRules(run, state, chosen(run, rule), spent, declared);
        if (ended !== "next") {
          return ended;
        }

        break;
      }
      case "set-template": {
        runSet(run, state, rule.target, rule.expression, rule.place, "values");
        break;
      }
      case "set-correct": {
        runSet(run, state, rule.target, rule.expression, rule.place, "correct");
        break;
      }
      case "set-default": {
        runSet(run, state, rule.target, rule.expression, rule.place, "defaults");
        break;
      }
      case "constraint": {
        if (!isTrue(run.evaluate(rule.expression))) {
          if (!spent) {
            return "restart";
          }

          state.values = new Map(declared);
          state.correct = new Map();
          state.defaults = new Map();
        }

        break;
      }
      case "exit-template": {
        return "exit";
      }
    }
  }

  return "next";
};

/**
 * The most restarts one run of template processing takes (§5.150, reading `null-results` item 7).
 */
export const restartBudget = 100;

/**
 * A fresh state over variables.
 *
 * @param variables - The variables.
 * @returns The state.
 */
const stateOf = (variables: Variables): State => ({
  correct: new Map(variables.correct),
  defaults: new Map(variables.defaults),
  demands: [],
  failure: undefined,
  values: new Map(variables.values),
});

/**
 * A run's result from its state.
 *
 * @param state - The state.
 * @returns The result.
 */
const resultOf = (state: State): RunResult =>
  state.failure === undefined
    ? {
        demands: state.demands,
        kind: "ran",
        variables: { correct: state.correct, defaults: state.defaults, values: state.values },
      }
    : { failure: state.failure, kind: "failed" };

/**
 * Run response processing, or outcome processing.
 *
 * @param table - The operators.
 * @param rules - The rules.
 * @param input - What the run is over.
 * @returns Its result.
 */
export const runProcessing = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  rules: readonly (OutcomeRule | ResponseRule)[],
  input: RunInput,
): RunResult => {
  const state = stateOf(input.variables);
  runOutcomeRules(runOver(table, input, state), state, rules);

  return resultOf(state);
};

/**
 * Run template processing from the declared values, restarting where a constraint is not true.
 *
 * @param table - The operators.
 * @param rules - The rules.
 * @param input - What the run is over; its variables are the declared ones.
 * @returns Its result.
 */
export const runTemplateProcessing = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  rules: readonly TemplateRule[],
  input: RunInput,
): RunResult => {
  for (let restarts = 0; ; restarts += 1) {
    const state = stateOf(input.variables);
    const ended = runTemplateRules(
      runOver(table, input, state),
      state,
      rules,
      restarts === restartBudget,
      input.variables.values,
    );
    if (ended !== "restart") {
      return resultOf(state);
    }
  }
};

/**
 * Evaluate one expression over a run's input, outside any rule: a test's template default
 * (§5.152), whose value an item's take starts a template variable at.
 *
 * @param table - The operators.
 * @param expression - The expression.
 * @param input - What the run is over.
 * @returns Its value, or the failure.
 */
export const evaluateExpression = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  expression: Expression,
  input: RunInput,
):
  | { readonly failure: ProcessingFailure; readonly kind: "failed" }
  | { readonly kind: "value"; readonly value: Value } => {
  const state = stateOf(input.variables);
  const value = runOver(table, input, state).evaluate(expression);

  return state.failure === undefined
    ? { kind: "value", value }
    : { failure: state.failure, kind: "failed" };
};
