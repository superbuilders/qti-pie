/**
 * The interface every standard QTI operator implements: one module per family under
 * `#processing/operators/`, each exporting an {@link OperatorTable} of its kinds, which the closed
 * table of every kind joins (`#processing/operators/table.ts`).
 *
 * An operator is four parts, each of one stage:
 *
 * - **arity**: the guard that a compiled element's operand list has the kind's arity
 *   ({@link noOperand}, {@link oneOperand}, {@link twoOperands}, {@link someOperands},
 *   {@link anyOperands}), so a node's operands are the tuple its kind takes.
 * - **read**: its attributes from its element, resolved against the document (a variable's reference,
 *   a response's mapping, a custom operator's entry), or a refusal. Defaults are QTI's.
 * - **typing**: its static result type from its operands' static types and its attributes, or a
 *   refusal where an operand's type is one the operator does not take (an operand whose type is
 *   `dynamic` is taken: the run decides).
 * - **evaluate**: its value in a run. It evaluates its operands through the run, in document order,
 *   and applies QTI's NULL law: a NULL operand gives NULL unless the operator's own rule says
 *   otherwise (`qti-is-null`, `qti-container-size`, `qti-multiple`, `qti-and`, …). It never meets
 *   an operand its typing refused, but a `dynamic` operand may hold any value at run time, which
 *   gives NULL where the operator cannot use it.
 *
 * @module
 */
import type {
  AnyOperands,
  Area,
  AreaMapping,
  AttributesOf,
  Expression,
  ExpressionKind,
  Node,
  NoOperand,
  OneOperand,
  OperandsOf,
  SomeOperands,
  StaticType,
  Mapping,
  TwoOperands,
  VariableRef,
} from "#processing/ir.ts";
import type { CustomOperator } from "#processing/operator.ts";
import type { Run } from "#processing/run.ts";
import type { BaseType, Value, ValueType } from "#processing/value.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * Why the compiler refuses a document. Every document it reads was admitted by pantry, so a refusal
 * names a defect admission missed or a construct the package does not take, never a candidate's
 * input.
 */
export type RefusalCode =
  | "arity"
  | "attribute"
  | "duplicate-identifier"
  | "element"
  | "operand-type"
  | "response-binding"
  | "set-type"
  | "template-location"
  | "unknown-identifier"
  | "unknown-operator"
  | "unknown-template"
  | "value-cardinality";

/**
 * A refusal: why, where, and a sentence that names what to change.
 */
export interface Refusal {
  readonly code: RefusalCode;
  readonly detail: string;
  readonly place: number;
}

/**
 * A stage's result: its value, or a refusal.
 */
export type Checked<A> =
  | { readonly ok: false; readonly refusal: Refusal }
  | { readonly ok: true; readonly value: A };

/**
 * A stage's value.
 *
 * @param value - The value.
 * @returns It, checked.
 */
export const checked = <A>(value: A): Checked<A> => ({ ok: true, value });

/**
 * A refusal at a place.
 *
 * @param code - Why.
 * @param place - Where.
 * @param detail - What to change.
 * @returns The refusal.
 */
export const refused = <A>(code: RefusalCode, place: number, detail: string): Checked<A> => ({
  ok: false,
  refusal: { code, detail, place },
});

/**
 * A response's declaration as `qti-map-response` and `qti-map-response-point` read it.
 */
export interface DeclaredResponse {
  readonly areaMapping: AreaMapping | undefined;
  readonly mapping: Mapping | undefined;
  readonly variable: VariableRef;
}

/**
 * What an operator's attributes are resolved against: the document's declarations.
 */
export interface CompileContext {
  /**
   * The area an element's `shape` and `coords` write, resolved against the image it lies on: for a
   * `qti-inside`, the image of the interaction whose response its operand reads
   * (`#processing/compile/area.ts`).
   */
  readonly area: (element: XmlElement, place: number) => Checked<Area>;
  /**
   * The registered custom operator a `definition` URI names (`#processing/registry.ts`).
   */
  readonly customOperator: (definition: string) => CustomOperator | undefined;
  /**
   * Whether the document is an item's or a test's: outcome processing's item expressions and
   * prefixed references exist in a test alone.
   */
  readonly document: "item" | "test";
  /**
   * The response a `qti-map-response`'s or a `qti-map-response-point`'s `identifier` names.
   */
  readonly response: (identifier: string) => DeclaredResponse | undefined;
  /**
   * The variable an `identifier` names: in an item its own variable or built-in; in a test its own,
   * or an item's through its item ref (`ITEMREF.VAR`, `ITEMREF.N.VAR`).
   */
  readonly variable: (identifier: string) => VariableRef | undefined;
  /**
   * The variable an `identifier` names read with the weight a `weight-identifier` names: in a test,
   * an item's variable through its item ref; nowhere else (reading `weight-identifier-placement`).
   */
  readonly weightedVariable: (identifier: string, weight: string) => VariableRef | undefined;
}

/**
 * A standard operator, of one kind.
 */
export interface Operator<K extends ExpressionKind> {
  readonly arity: (operands: AnyOperands) => operands is OperandsOf[K];
  readonly evaluate: (node: Node<K>, run: Run) => Value;
  readonly read: (
    element: XmlElement,
    context: CompileContext,
    place: number,
  ) => Checked<AttributesOf[K]>;
  readonly typing: (
    operands: OperandsOf[K],
    attributes: AttributesOf[K],
    place: number,
  ) => Checked<StaticType>;
}

/**
 * A family's operators, one of each of its kinds.
 */
export type OperatorTable<K extends ExpressionKind> = { readonly [P in K]: Operator<P> };

/**
 * The arity guard of a kind that takes no operand.
 *
 * @param operands - The operands.
 * @returns Whether there are none.
 */
export const noOperand = (operands: AnyOperands): operands is NoOperand => operands.length === 0;

/**
 * The arity guard of a kind that takes one operand.
 *
 * @param operands - The operands.
 * @returns Whether there is exactly one.
 */
export const oneOperand = (operands: AnyOperands): operands is OneOperand => operands.length === 1;

/**
 * The arity guard of a kind that takes two operands.
 *
 * @param operands - The operands.
 * @returns Whether there are exactly two.
 */
export const twoOperands = (operands: AnyOperands): operands is TwoOperands =>
  operands.length === 2;

/**
 * The arity guard of a kind that takes one operand or more.
 *
 * @param operands - The operands.
 * @returns Whether there is at least one.
 */
export const someOperands = (operands: AnyOperands): operands is SomeOperands =>
  operands.length > 0;

/**
 * The arity guard of a kind that takes any number of operands.
 *
 * @param operands - The operands.
 * @returns True.
 */
export const anyOperands = (operands: AnyOperands): operands is AnyOperands => operands.length >= 0;

/**
 * The attributes of a kind that reads none.
 *
 * @returns No attributes.
 */
export const noAttributes = (): Checked<object> => checked({});

/**
 * A static type.
 *
 * @param type - The value type.
 * @returns The static type.
 */
export const typed = (type: ValueType): StaticType => ({ kind: "typed", type });

/**
 * The static type of an expression whose type only the run knows.
 */
export const dynamic: StaticType = { kind: "dynamic" };

/**
 * The single boolean static type, of every comparison, logic and text test.
 */
export const singleBoolean: StaticType = typed({ base: "boolean", cardinality: "single" });

/**
 * What an operand may be: the cardinalities and base types an operator takes there.
 */
export interface OperandRule {
  readonly bases: readonly BaseType[] | "any";
  readonly cardinalities: readonly ValueType["cardinality"][];
}

/**
 * Whether an operand's static type is one an operator takes. A dynamic operand is taken: its value
 * is the run's to judge.
 *
 * @param type - The operand's static type.
 * @param rule - What the operator takes.
 * @returns Whether it takes it.
 */
export const takes = (type: StaticType, rule: OperandRule): boolean => {
  if (type.kind === "dynamic") {
    return true;
  }

  const { type: value } = type;
  if (!rule.cardinalities.includes(value.cardinality)) {
    return false;
  }

  return value.cardinality === "record" || rule.bases === "any" || rule.bases.includes(value.base);
};

/**
 * Check every operand against what an operator takes there.
 *
 * @param operands - The operands.
 * @param rule - What the operator takes, the same at every position.
 * @param place - The operator's place.
 * @param result - The operator's static type where every operand is taken.
 * @returns The result type, or the refusal of the first operand not taken.
 */
export const operandsTaken = (
  operands: readonly Expression[],
  rule: OperandRule,
  place: number,
  result: StaticType,
): Checked<StaticType> => {
  const index = operands.findIndex((operand) => !takes(operand.type, rule));

  return index === -1
    ? checked(result)
    : refused(
        "operand-type",
        place,
        `operand ${String(index + 1)} must be of cardinality ${rule.cardinalities.join(" or ")}${rule.bases === "any" ? "" : ` and base type ${rule.bases.join(" or ")}`}`,
      );
};
