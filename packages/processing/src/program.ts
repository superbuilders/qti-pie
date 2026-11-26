/**
 * A compiled document: an item's or a test's declarations and rules, as the compiler makes them
 * from the stored document and the processing languages run them.
 *
 * @module
 */
import type {
  Expression,
  Mapping,
  AreaMapping,
  VariableRef,
  VariableRole,
} from "#processing/ir.ts";
import type { Interaction } from "#processing/compile/body.ts";
import type { Digest } from "#processing/graded.ts";
import type { Single, Value, ValueType } from "#processing/value.ts";

/**
 * A lookup table (§5.71, §5.89): a match table's integer sources, or an interpolation table's
 * float sources each with whether it includes its boundary (default true), in document order, and
 * the value no entry gives.
 */
export type LookupTable =
  | {
      readonly defaultValue: Single | undefined;
      readonly entries: readonly { readonly source: bigint; readonly target: Single }[];
      readonly kind: "match";
    }
  | {
      readonly defaultValue: Single | undefined;
      readonly entries: readonly {
        readonly includeBoundary: boolean;
        readonly source: number;
        readonly target: Single;
      }[];
      readonly kind: "interpolation";
    };

/**
 * A declared variable: its identifier, role and type, and the value it starts at.
 *
 * - A response starts NULL whatever it declares (§2.2.2.1); its declared default is its `default`.
 * - An outcome starts at its default, else a single numeric one at 0 and any other NULL (reading
 *   `numeric-outcome-default`).
 * - A template variable and a context variable start at their defaults, else NULL.
 */
export interface Declaration {
  /**
   * The correct response a response declares, NULL where none (and for every other role).
   */
  readonly correct: Value;
  /**
   * The default the declaration writes, NULL where none.
   */
  readonly default: Value;
  readonly identifier: string;
  /**
   * An outcome's lookup table.
   */
  readonly lookup: LookupTable | undefined;
  /**
   * A response's area mapping.
   */
  readonly areaMapping: AreaMapping | undefined;
  /**
   * A response's mapping.
   */
  readonly mapping: Mapping | undefined;
  /**
   * An outcome's `normal-maximum`.
   */
  readonly normalMaximum: number | undefined;
  /**
   * An outcome's `normal-minimum`.
   */
  readonly normalMinimum: number | undefined;
  readonly role: VariableRole;
  readonly type: ValueType;
}

/**
 * A condition's branch: its test, and the rules it runs when the test is true.
 */
export interface Branch<R> {
  readonly rules: readonly R[];
  readonly when: Expression;
}

/**
 * A condition: its branches in order (if, then each else-if), and the else's rules, none where it
 * has no else. A branch runs when its test is the single boolean true; NULL is not true (§5.114).
 */
export interface Condition<R> {
  readonly branches: readonly Branch<R>[];
  readonly kind: "condition";
  readonly otherwise: readonly R[];
  readonly place: number;
}

/**
 * A set of a variable to an expression's value.
 */
export interface SetRule<K extends string> {
  readonly expression: Expression;
  readonly kind: K;
  readonly place: number;
  readonly target: VariableRef;
}

/**
 * A `qti-lookup-outcome-value`: an outcome set to what its table maps the expression's value to.
 */
export interface LookupRule {
  readonly expression: Expression;
  readonly kind: "lookup-outcome";
  readonly place: number;
  readonly table: LookupTable;
  readonly target: VariableRef;
}

/**
 * An exit of one processing language.
 */
export interface ExitRule<K extends string> {
  readonly kind: K;
  readonly place: number;
}

/**
 * A response processing rule (§4.6): fragments spliced, a template expanded.
 */
export type ResponseRule =
  | Condition<ResponseRule>
  | ExitRule<"exit-response">
  | LookupRule
  | SetRule<"set-outcome">;

/**
 * A template processing rule (§5.156). A constraint stands only at the top level (reading
 * `template-constraint-placement`).
 */
export type TemplateRule =
  | Condition<TemplateRule>
  | ExitRule<"exit-template">
  | SetRule<"set-correct">
  | SetRule<"set-default">
  | SetRule<"set-template">
  | { readonly expression: Expression; readonly kind: "constraint"; readonly place: number };

/**
 * An outcome processing rule (§5.102): fragments spliced.
 */
export type OutcomeRule =
  | Condition<OutcomeRule>
  | ExitRule<"exit-test">
  | LookupRule
  | SetRule<"set-outcome">;

/**
 * A compiled item.
 */
export interface CompiledItem {
  /**
   * Whether the item is adaptive (§5.7): its outcomes carry from attempt to attempt, and it closes
   * when its processing sets `completionStatus` to `completed`.
   */
  readonly adaptive: boolean;
  /**
   * Every declaration, the built-ins among them, by identifier.
   */
  readonly declarations: ReadonlyMap<string, Declaration>;
  readonly digest: Digest;
  readonly identifier: string;
  /**
   * The interactions of its body that response admission judges (§7.19.7), in document order.
   */
  readonly interactions: readonly Interaction[];
  readonly kind: "item";
  readonly responseProcessing: readonly ResponseRule[];
  readonly templateProcessing: readonly TemplateRule[];
}

/**
 * An item ref of a compiled test: its identifier, the item it names, its categories, the sections
 * that hold it, its weights and its template defaults.
 */
export interface CompiledItemRef {
  readonly categories: readonly string[];
  readonly identifier: string;
  readonly item: CompiledItem;
  readonly sections: readonly string[];
  /**
   * Each `qti-template-default`: the template variable it sets and the test-level expression whose
   * value it takes (§5.152).
   */
  readonly templateDefaults: readonly {
    readonly expression: Expression;
    readonly template: string;
  }[];
  readonly weights: ReadonlyMap<string, number>;
}

/**
 * A compiled test.
 */
export interface CompiledTest {
  /**
   * The test's own declarations, the built-ins among them, by identifier.
   */
  readonly declarations: ReadonlyMap<string, Declaration>;
  readonly digest: Digest;
  readonly identifier: string;
  readonly itemRefs: readonly CompiledItemRef[];
  readonly kind: "test";
  readonly outcomeProcessing: readonly OutcomeRule[];
}
