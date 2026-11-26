/**
 * The typed program: what the compiler makes of a stored document's expressions, and what the
 * evaluator runs. Every QTI 3.0.1 expression element is one {@link ExpressionKind} (its local name
 * without `qti-`), and a compiled expression is a {@link Node} of its kind: its operands, as a tuple
 * of the arity the kind takes, its attributes, read and resolved (a variable's reference, a
 * mapping, a custom operator's registry entry), its static type, and its place in the document.
 *
 * A node is well typed by construction: the compiler builds one only after its kind's operator
 * typed its operands (`#processing/operators/operator.ts`), so the evaluator meets no unknown
 * identifier, no wrong arity and no operand a static type rules out. What stays dynamic is what QTI
 * leaves to run time: `qti-null`, a record field's value, and NULL.
 *
 * @module
 */
import type { BoundOperator, InlineEntry, RecordedEntry } from "#processing/operator.ts";
import type { BaseType, Null, Single, Value, ValueType } from "#processing/value.ts";

/**
 * The expression kinds: every element QTI 3.0.1's ASI XSD admits where an expression stands, by its
 * local name without `qti-`, sorted. The last eight are outcome processing's alone (§2.11.2).
 */
export const expressionKinds = [
  "and",
  "any-n",
  "base-value",
  "container-size",
  "contains",
  "correct",
  "custom-operator",
  "default",
  "delete",
  "divide",
  "duration-gte",
  "duration-lt",
  "equal",
  "equal-rounded",
  "field-value",
  "gcd",
  "gt",
  "gte",
  "index",
  "inside",
  "integer-divide",
  "integer-modulus",
  "integer-to-float",
  "is-null",
  "lcm",
  "lt",
  "lte",
  "map-response",
  "map-response-point",
  "match",
  "math-constant",
  "math-operator",
  "max",
  "member",
  "min",
  "multiple",
  "not",
  "null",
  "or",
  "ordered",
  "pattern-match",
  "power",
  "product",
  "random",
  "random-float",
  "random-integer",
  "repeat",
  "round",
  "round-to",
  "stats-operator",
  "string-match",
  "substring",
  "subtract",
  "sum",
  "truncate",
  "variable",
  "number-correct",
  "number-incorrect",
  "number-presented",
  "number-responded",
  "number-selected",
  "outcome-maximum",
  "outcome-minimum",
  "test-variables",
] as const;

/**
 * An expression kind.
 */
export type ExpressionKind = (typeof expressionKinds)[number];

/**
 * What the compiler knows of an expression's value before it runs: its type, or that only the run
 * knows it (`qti-null`, which is NULL of whatever type its place needs, and a record field's
 * value).
 */
export type StaticType =
  | { readonly kind: "dynamic" }
  | { readonly kind: "typed"; readonly type: ValueType };

/**
 * No operand.
 */
export type NoOperand = readonly [];

/**
 * Exactly one operand.
 */
export type OneOperand = readonly [Expression];

/**
 * Exactly two operands, in order.
 */
export type TwoOperands = readonly [Expression, Expression];

/**
 * At least one operand.
 */
export type SomeOperands = readonly [Expression, ...Expression[]];

/**
 * Any number of operands, none included.
 */
export type AnyOperands = readonly Expression[];

/**
 * The operands of each kind, by the XSD's multiplicity.
 */
export interface OperandsOf {
  readonly and: SomeOperands;
  readonly "any-n": SomeOperands;
  readonly "base-value": NoOperand;
  readonly "container-size": OneOperand;
  readonly contains: TwoOperands;
  readonly correct: NoOperand;
  readonly "custom-operator": AnyOperands;
  readonly default: NoOperand;
  readonly delete: TwoOperands;
  readonly divide: TwoOperands;
  readonly "duration-gte": TwoOperands;
  readonly "duration-lt": TwoOperands;
  readonly equal: TwoOperands;
  readonly "equal-rounded": TwoOperands;
  readonly "field-value": OneOperand;
  readonly gcd: SomeOperands;
  readonly gt: TwoOperands;
  readonly gte: TwoOperands;
  readonly index: OneOperand;
  readonly inside: OneOperand;
  readonly "integer-divide": TwoOperands;
  readonly "integer-modulus": TwoOperands;
  readonly "integer-to-float": OneOperand;
  readonly "is-null": OneOperand;
  readonly lcm: SomeOperands;
  readonly lt: TwoOperands;
  readonly lte: TwoOperands;
  readonly "map-response": NoOperand;
  readonly "map-response-point": NoOperand;
  readonly match: TwoOperands;
  readonly "math-constant": NoOperand;
  readonly "math-operator": SomeOperands;
  readonly max: SomeOperands;
  readonly member: TwoOperands;
  readonly min: SomeOperands;
  readonly multiple: AnyOperands;
  readonly not: OneOperand;
  readonly null: NoOperand;
  readonly "number-correct": NoOperand;
  readonly "number-incorrect": NoOperand;
  readonly "number-presented": NoOperand;
  readonly "number-responded": NoOperand;
  readonly "number-selected": NoOperand;
  readonly or: SomeOperands;
  readonly ordered: AnyOperands;
  readonly "outcome-maximum": NoOperand;
  readonly "outcome-minimum": NoOperand;
  readonly "pattern-match": OneOperand;
  readonly power: TwoOperands;
  readonly product: SomeOperands;
  readonly random: OneOperand;
  readonly "random-float": NoOperand;
  readonly "random-integer": NoOperand;
  readonly repeat: SomeOperands;
  readonly round: OneOperand;
  readonly "round-to": OneOperand;
  readonly "stats-operator": OneOperand;
  readonly "string-match": TwoOperands;
  readonly substring: TwoOperands;
  readonly subtract: TwoOperands;
  readonly sum: SomeOperands;
  readonly "test-variables": NoOperand;
  readonly truncate: OneOperand;
  readonly variable: NoOperand;
}

/**
 * An attribute that is a literal or names a variable whose value stands in for it at run time, as
 * the information model's `integerOrVariableRef`, `floatOrVariableRef` and `stringOrVariableRef`
 * admit. A reference is resolved: it names a declared variable, of a single type.
 */
export type LiteralOr<A> =
  | { readonly kind: "literal"; readonly value: A }
  | { readonly kind: "variable"; readonly variable: VariableRef };

/**
 * A reference to a variable, resolved at compile time against the document's declarations: what it
 * reads and the type it is declared with. A read of a variable the run does not hold is NULL of
 * that type (reading `null-results`).
 *
 * - `own`: a variable of the program's own document: an item's response, outcome, template or context
 *   variable or built-in, or a test's outcome or context variable or built-in.
 * - `member`: in a test, an item's variable through its item ref (`ITEMREF.VAR`, `ITEMREF.N.VAR`,
 *   reading `numbered-reference`), with the weight a `weight-identifier` names (§7.47.2: 1.0 where
 *   the ref defines none).
 */
export type VariableRef =
  | {
      readonly identifier: string;
      readonly role: VariableRole;
      readonly scope: "own";
      readonly type: ValueType;
    }
  | {
      readonly item: string;
      /**
       * The occurrence `N` of `ITEMREF.N.VAR`, 1 and up, or `undefined` for `ITEMREF.VAR`.
       */
      readonly occurrence: bigint | undefined;
      readonly role: VariableRole;
      readonly scope: "member";
      readonly type: ValueType;
      readonly variable: string;
      readonly weight: string | undefined;
    };

/**
 * What a variable is declared as.
 */
export type VariableRole = "built-in" | "context" | "outcome" | "response" | "template";

/**
 * One entry of a mapping (§5.88): its key and mapped value, and, for a string key, whether the
 * comparison is case sensitive (§7.21.3: false where unwritten).
 */
export interface MapEntry {
  readonly caseSensitive: boolean;
  readonly key: Single;
  readonly value: number;
}

/**
 * A response's mapping (§5.88): its entries in document order, the value an unmapped member takes
 * and the bounds of a container's sum (QTI's defaults 0, −INF and +INF where unwritten).
 */
export interface Mapping {
  readonly defaultValue: number;
  readonly entries: readonly MapEntry[];
  readonly lowerBound: number;
  readonly upperBound: number;
}

/**
 * A vertex or a centre of an area: integers over the area's denominator.
 */
export interface Vertex {
  readonly x: bigint;
  readonly y: bigint;
}

/**
 * An area as the compiler resolves it (`#processing/compile/area.ts`), its coordinates integers
 * over its one `denominator` (1 or more), every percentage taken of its image's size, a rect's
 * corners ordered (`left ≤ right`, `top ≤ bottom`): `everywhere` is QTI's `default` ("the entire
 * area of the associated image"), `nowhere` an area whose coordinates hold no point (reading
 * `area-coords-fit`). No percentage, image or double reaches an area's reader.
 */
export type Area =
  | { readonly kind: "everywhere" }
  | { readonly kind: "nowhere" }
  | {
      readonly bottom: bigint;
      readonly denominator: bigint;
      readonly kind: "rect";
      readonly left: bigint;
      readonly right: bigint;
      readonly top: bigint;
    }
  | {
      readonly centre: Vertex;
      readonly denominator: bigint;
      readonly kind: "circle";
      readonly radius: bigint;
    }
  | {
      readonly across: bigint;
      readonly centre: Vertex;
      readonly denominator: bigint;
      readonly down: bigint;
      readonly kind: "ellipse";
    }
  | {
      readonly denominator: bigint;
      readonly kind: "poly";
      readonly vertices: readonly [Vertex, Vertex, Vertex, ...Vertex[]];
    };

/**
 * A response's area mapping (§5.6): its entries in document order, each area resolved, the default
 * and the bounds.
 */
export interface AreaMapping {
  readonly defaultValue: number;
  readonly entries: readonly { readonly area: Area; readonly value: number }[];
  readonly lowerBound: number;
  readonly upperBound: number;
}

/**
 * A `qti-custom-operator` as compiled: an inline operator bound to the element's literals, with
 * which operand positions are computed; or a recorded operator's entry.
 */
export type CustomCall =
  | {
      readonly bound: BoundOperator;
      /**
       * For each operand position, whether it is an expression (true) or a literal the binding
       * holds (false).
       */
      readonly computed: readonly boolean[];
      readonly entry: InlineEntry;
      readonly kind: "inline";
    }
  | {
      readonly entry: RecordedEntry;
      readonly kind: "recorded";
      /**
       * For each operand position, the literal value written there, or `undefined` where an
       * expression stands.
       */
      readonly written: readonly (Value | undefined)[];
    };

/**
 * The filters an outcome-processing-only expression selects the test's items by (§7.39): a section,
 * which includes its sub-sections, and categories, one shared name enough (reading `null-results`,
 * item 4).
 */
export interface ItemFilter {
  readonly excludeCategories: readonly string[];
  readonly includeCategories: readonly string[];
  readonly section: string | undefined;
}

/**
 * The attributes of each kind, read and resolved by its operator.
 */
export interface AttributesOf {
  readonly and: object;
  readonly "any-n": { readonly max: LiteralOr<bigint>; readonly min: LiteralOr<bigint> };
  readonly "base-value": { readonly value: Null | Single };
  readonly "container-size": object;
  readonly contains: object;
  readonly correct: { readonly variable: VariableRef };
  readonly "custom-operator": { readonly call: CustomCall };
  readonly default: { readonly variable: VariableRef };
  readonly delete: object;
  readonly divide: object;
  readonly "duration-gte": object;
  readonly "duration-lt": object;
  readonly equal: {
    readonly includeLowerBound: boolean;
    readonly includeUpperBound: boolean;
    /**
     * The tolerance: none in `exact` mode, else `t0` then `t1`, one value written meaning both.
     */
    readonly tolerance: readonly [LiteralOr<number>, LiteralOr<number>] | undefined;
    readonly toleranceMode: "absolute" | "exact" | "relative";
  };
  readonly "equal-rounded": {
    readonly figures: LiteralOr<bigint>;
    readonly roundingMode: "decimalPlaces" | "significantFigures";
  };
  readonly "field-value": { readonly field: string };
  readonly gcd: object;
  readonly gt: object;
  readonly gte: object;
  readonly index: { readonly n: LiteralOr<bigint> };
  readonly inside: { readonly area: Area };
  readonly "integer-divide": object;
  readonly "integer-modulus": object;
  readonly "integer-to-float": object;
  readonly "is-null": object;
  readonly lcm: object;
  readonly lt: object;
  readonly lte: object;
  readonly "map-response": { readonly mapping: Mapping; readonly response: VariableRef };
  readonly "map-response-point": {
    readonly mapping: AreaMapping;
    readonly response: VariableRef;
  };
  readonly match: object;
  readonly "math-constant": { readonly name: "e" | "pi" };
  readonly "math-operator": { readonly name: MathOperatorName };
  readonly max: object;
  readonly member: object;
  readonly min: object;
  readonly multiple: object;
  readonly not: object;
  readonly null: object;
  readonly "number-correct": { readonly filter: ItemFilter };
  readonly "number-incorrect": { readonly filter: ItemFilter };
  readonly "number-presented": { readonly filter: ItemFilter };
  readonly "number-responded": { readonly filter: ItemFilter };
  readonly "number-selected": { readonly filter: ItemFilter };
  readonly or: object;
  readonly ordered: object;
  readonly "outcome-maximum": {
    readonly filter: ItemFilter;
    readonly outcome: string;
    readonly weight: string | undefined;
  };
  readonly "outcome-minimum": {
    readonly filter: ItemFilter;
    readonly outcome: string;
    readonly weight: string | undefined;
  };
  readonly "pattern-match": { readonly pattern: LiteralOr<string> };
  readonly power: object;
  readonly product: object;
  readonly random: object;
  readonly "random-float": { readonly max: LiteralOr<number>; readonly min: LiteralOr<number> };
  readonly "random-integer": {
    readonly max: LiteralOr<bigint>;
    readonly min: LiteralOr<bigint>;
    readonly step: LiteralOr<bigint>;
  };
  readonly repeat: { readonly numberRepeats: LiteralOr<bigint> };
  readonly round: object;
  readonly "round-to": {
    readonly figures: LiteralOr<bigint>;
    readonly roundingMode: "decimalPlaces" | "significantFigures";
  };
  readonly "stats-operator": { readonly name: StatsOperatorName };
  readonly "string-match": { readonly caseSensitive: boolean; readonly substring: boolean };
  readonly substring: { readonly caseSensitive: boolean };
  readonly subtract: object;
  readonly sum: object;
  readonly "test-variables": {
    /**
     * The base type matched: the written one, or integer and float alike where none is written.
     */
    readonly base: BaseType | undefined;
    readonly filter: ItemFilter;
    readonly variable: string;
    readonly weight: string | undefined;
  };
  readonly truncate: object;
  readonly variable: { readonly variable: VariableRef };
}

/**
 * The 27 names of `qti-math-operator` (§8.25), sorted.
 */
export const mathOperatorNames = [
  "abs",
  "acos",
  "acot",
  "acsc",
  "asec",
  "asin",
  "atan",
  "atan2",
  "ceil",
  "cos",
  "cosh",
  "cot",
  "coth",
  "csc",
  "csch",
  "exp",
  "floor",
  "ln",
  "log",
  "sec",
  "sech",
  "signum",
  "sin",
  "sinh",
  "tan",
  "tanh",
  "toDegrees",
  "toRadians",
] as const;

/**
 * A `qti-math-operator` name.
 */
export type MathOperatorName = (typeof mathOperatorNames)[number];

/**
 * The five names of `qti-stats-operator` (§8.36).
 */
export const statsOperatorNames = [
  "mean",
  "popSD",
  "popVariance",
  "sampleSD",
  "sampleVariance",
] as const;

/**
 * A `qti-stats-operator` name.
 */
export type StatsOperatorName = (typeof statsOperatorNames)[number];

/**
 * A compiled expression of one kind, as written: its attributes, kind, operands, place and static
 * type.
 */
export type KindNode<K extends ExpressionKind> = AttributesOf[K] & {
  readonly kind: K;
  readonly operands: OperandsOf[K];
  /**
   * The element's index among the document's elements in document order, the key a recorded
   * operator's answer and a demand are named by.
   */
  readonly place: number;
  readonly type: StaticType;
};

/**
 * Every kind's node, by kind: the map a dispatch over kinds indexes, so a kind and its node stay
 * correlated.
 */
export type Nodes = { readonly [K in ExpressionKind]: KindNode<K> };

/**
 * A compiled expression of one kind.
 */
export type Node<K extends ExpressionKind> = Nodes[K];

/**
 * A compiled expression of any kind.
 */
export type Expression = Nodes[ExpressionKind];
