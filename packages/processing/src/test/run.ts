/**
 * Test support for operator families: a run over stated variables and a stated draw stream, nodes
 * built directly (a family's evaluate and typing, before the compiler), and elements built as a
 * stored document holds them (a family's read).
 *
 * @module
 */
import type {
  AttributesOf,
  Expression,
  ExpressionKind,
  Node,
  KindNode,
  OperandsOf,
  StaticType,
  VariableRef,
} from "#processing/ir.ts";
import { assert } from "@effect/vitest";
import type {
  CompileContext,
  DeclaredResponse,
  Operator,
  OperatorTable,
} from "#processing/operators/operator.ts";
import { resolveArea } from "#processing/compile/area.ts";
import type { ImageSize } from "#processing/compile/area.ts";
import type { CustomOperator } from "#processing/operator.ts";
import { customOperatorOf } from "#processing/registry.ts";
import type { Demand, Evaluation, MemberState, ProcessingFailure, Run } from "#processing/run.ts";
import { nullOf, valueTypeOf } from "#processing/value.ts";
import type { Null, Single, Value, ValueType } from "#processing/value.ts";
import { numbered } from "#processing/test/numbered.ts";
import { qtiNamespace } from "#processing/xml.ts";
import type { XmlElement, XmlNode } from "#processing/xml.ts";

/**
 * A variable a test states: its value, and its correct response and default where it has them.
 */
export interface Stated {
  readonly correct?: Value;
  readonly default?: Value;
  readonly value: Value;
}

/**
 * What a test run records: the failures, the demands and how many draws it took.
 */
export interface Recorder {
  readonly declined: number[];
  readonly demands: Demand[];
  readonly draws: { taken: number };
  readonly failures: ProcessingFailure[];
}

/**
 * The name a reference reads by: its identifier, or `ITEM.VAR` for a member's.
 *
 * @param variable - The reference.
 * @returns Its name.
 */
const nameOf = (variable: VariableRef): string =>
  variable.scope === "own" ? variable.identifier : `${variable.item}.${variable.variable}`;

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
 * Whether a node's kind is one a table holds.
 *
 * @param table - The operators.
 * @param expression - The node.
 * @returns Whether the table holds its kind.
 */
const holds = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  expression: Expression,
): expression is Node<K> => expression.kind in table;

/**
 * A run over stated variables, evaluating operands with a table of the families under test: each
 * variable read by its name, a draw stream that gives the stated words in
 * turn (0 after them), stated recorded answers by place and stated members.
 *
 * @param table - The operators the run evaluates operands with.
 * @param stated - The variables by name.
 * @param options - The draws, recorded answers and members.
 * @returns The run, and what it records.
 */
export const testRun = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  stated: Readonly<Record<string, Stated>>,
  options: {
    readonly draws?: readonly number[];
    readonly members?: readonly MemberState[];
    readonly recorded?: ReadonlyMap<number, Evaluation>;
  },
) => {
  const recorder: Recorder = { declined: [], demands: [], draws: { taken: 0 }, failures: [] };
  const lookup = (variable: VariableRef): Stated | undefined => stated[nameOf(variable)];
  const run: Run = {
    correctOf: (variable) => lookup(variable)?.correct ?? nullOf(variable.type),
    decline: (place) => {
      recorder.declined.push(place);
    },
    defaultOf: (variable) => lookup(variable)?.default ?? nullOf(variable.type),
    demand: (demand) => {
      recorder.demands.push(demand);
    },
    draw: () => {
      const word = options.draws?.[recorder.draws.taken] ?? 0;
      recorder.draws.taken += 1;

      return word;
    },
    evaluate: (expression) => {
      assert.isTrue(holds(table, expression), `the test's table holds ${expression.kind}`);

      return holds(table, expression)
        ? dispatch(table, expression.kind, expression, run)
        : nullOf({ cardinality: "record" });
    },
    fail: (failure) => {
      recorder.failures.push(failure);
    },
    members: () => options.members ?? [],
    read: (variable) => lookup(variable)?.value ?? nullOf(variable.type),
    recorded: (place) => options.recorded?.get(place),
  };

  return { recorder, run } as const;
};

/**
 * A node, built directly.
 *
 * @param kind - Its kind.
 * @param operands - Its operands.
 * @param attributes - Its attributes.
 * @param type - Its static type.
 * @returns The node.
 */
export const nodeOf = <K extends ExpressionKind>(
  kind: K,
  operands: OperandsOf[K],
  attributes: AttributesOf[K],
  type: StaticType,
): KindNode<K> => ({ ...attributes, kind, operands, place: 0, type });

/**
 * A `qti-base-value` node of a value.
 *
 * @param value - The value.
 * @returns The node.
 */
export const literal = (value: Null | Single): Node<"base-value"> =>
  nodeOf("base-value", [], { value }, { kind: "typed", type: valueTypeOf(value) });

/**
 * An own variable's reference.
 *
 * @param identifier - Its identifier.
 * @param type - Its declared type.
 * @returns The reference.
 */
export const ownVariable = (identifier: string, type: ValueType): VariableRef => ({
  identifier,
  role: "outcome",
  scope: "own",
  type,
});

/**
 * An element of QTI's namespace, as a stored document holds it, numbered as a document's root
 * (`numbered`): a tree built of these is numbered whole by its root, the last one built.
 *
 * @param local - Its local name, `qti-` included.
 * @param attributes - Its attributes in no namespace.
 * @param children - Its children.
 * @returns The element.
 */
export const element = (
  local: string,
  attributes: Readonly<Record<string, string>>,
  children: readonly XmlNode[],
): XmlElement =>
  numbered({
    attributes: Object.entries(attributes).map(([name, value]) => ({
      local: name,
      namespace: "",
      value,
    })),
    children,
    kind: "element",
    local,
    namespace: qtiNamespace,
  });

/**
 * Character data.
 *
 * @param value - The text.
 * @returns The node.
 */
export const text = (value: string): XmlNode => ({ kind: "text", value });

/**
 * A compile context over stated declarations: each variable declared by name with its type, the
 * responses' mappings by name, the weighted reads by `identifier weight`, the custom operators by
 * definition (the registry's where none are stated), and the image an area's percentages are of.
 *
 * @param stated - The declarations.
 * @returns The context.
 */
export const testContext = (stated: {
  readonly declared: Readonly<Record<string, ValueType>>;
  readonly image?: ImageSize;
  readonly operators?: readonly CustomOperator[];
  readonly responses?: Readonly<Record<string, Omit<DeclaredResponse, "variable">>>;
  readonly weighted?: Readonly<Record<string, VariableRef>>;
}): CompileContext => ({
  area: (written, place) => resolveArea(written, stated.image, place),
  customOperator: (definition) =>
    stated.operators === undefined
      ? customOperatorOf(definition)
      : stated.operators.find((operator) => operator.definition === definition),
  document: "item",
  response: (identifier) => {
    const type = stated.declared[identifier];
    const response = stated.responses?.[identifier];

    return type === undefined || response === undefined
      ? undefined
      : { ...response, variable: { identifier, role: "response", scope: "own", type } };
  },
  variable: (identifier) => {
    const type = stated.declared[identifier];

    return type === undefined ? undefined : ownVariable(identifier, type);
  },
  weightedVariable: (identifier, weight) => stated.weighted?.[`${identifier} ${weight}`],
});
