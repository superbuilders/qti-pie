/**
 * The interface every custom operator implements, and the registry entry it becomes.
 *
 * QTI 3.0.1 gives `qti-custom-operator` no semantics of its own: its `definition` URI names the
 * operator, and "an engine that does not know it gives NULL" (§5.37, reading 212). This package
 * knows exactly the operators `#processing/registry.ts` lists, each keyed by its `definition` URI
 * and never by redefining a QTI element; publication refuses any other (D10).
 *
 * Two kinds:
 *
 * - **inline**: a pure, total, synchronous function of its operands. It never sees NULL: the entry
 *   gives NULL for a NULL operand, or one not of its declared type, before calling it, and a NULL
 *   result takes the declared result type.
 * - **recorded**: an answer computed outside the evaluator (an AI rubric verdict) and handed in as
 *   input, read by the operator's place in the document. Where none is recorded the run records a
 *   demand and its result is Pending (D7, D8).
 *
 * A module is written against its typed operands ({@link InlineOperator}); {@link inlineOperator}
 * turns it into the uniform {@link CustomOperator} entry the registry lists and the evaluator
 * calls, so no module's operands are checked anywhere else.
 *
 * @module
 */
import { nullOf, sameValueType, valueTypeOf } from "#processing/value.ts";
import type {
  BaseType,
  ContainerCardinality,
  ContainerOf,
  Null,
  Present,
  RecordValue,
  SingleOf,
  Value,
  ValueType,
} from "#processing/value.ts";

/**
 * The type an operand or a result is declared with: a cardinality and base type, a record, or any
 * present value.
 */
export type TypeSpec = ValueType | { readonly cardinality: "any" };

/**
 * One operand of a custom operator: its name, its type, and whether the document must write it as
 * a `qti-base-value` (`literal`) or may compute it (`expression`).
 */
export interface OperandSpec {
  readonly form: "expression" | "literal";
  readonly name: string;
  readonly type: TypeSpec;
}

/**
 * The single of each base type of a union of them.
 */
type SingleFor<B> = B extends BaseType ? SingleOf<B> : never;

/**
 * The container of each base type and cardinality of unions of them.
 */
type ContainerFor<B, C> = B extends BaseType
  ? C extends ContainerCardinality
    ? ContainerOf<B, C>
    : never
  : never;

/**
 * The present value of a declared type.
 */
export type PresentOf<S extends TypeSpec> = S extends {
  readonly base: infer B;
  readonly cardinality: "single";
}
  ? SingleFor<B>
  : S extends { readonly base: infer B; readonly cardinality: infer C }
    ? ContainerFor<B, C>
    : S extends { readonly cardinality: "record" }
      ? RecordValue
      : Present;

/**
 * The operands an inline operator's function is handed, each present, in declared order.
 */
export type ArgumentsOf<Operands extends readonly OperandSpec[]> = {
  readonly [I in keyof Operands]: PresentOf<Operands[I]["type"]>;
};

/**
 * A result's declared type: a fixed type, or the type of one of its operands, by position.
 */
export type ResultSpec = ValueType | { readonly operand: number };

/**
 * The value an inline operator gives: present of its result's type, or NULL.
 */
export type ResultOf<R extends ResultSpec, Operands extends readonly OperandSpec[]> =
  | Null
  | (R extends { readonly operand: infer I extends number }
      ? ArgumentsOf<Operands>[I]
      : R extends ValueType
        ? PresentOf<R>
        : never);

/**
 * The `definition` URI prefix of Alpha's operators (`tag:` URIs, RFC 4151).
 */
export const alphaDefinitionPrefix = "tag:superbuilders.school,2026:qti/custom-operator/";

/**
 * An inline operator as its module writes it: a pure, total function of present operands of the
 * declared types.
 */
export interface InlineOperator<
  Definition extends string,
  Operands extends readonly OperandSpec[],
  R extends ResultSpec,
> {
  /**
   * The function: synchronous, total, reading nothing but its operands and the module's own
   * constants.
   */
  readonly apply: (operands: ArgumentsOf<Operands>) => ResultOf<R, Operands>;
  readonly definition: Definition;
  readonly operands: Operands;
  readonly result: R;
}

/**
 * A recorded operator as its module writes it: its operands and result type, and which operand is
 * the most its answer may score.
 */
export interface RecordedOperator<
  Definition extends string,
  Operands extends readonly OperandSpec[],
  R extends ValueType,
> {
  readonly definition: Definition;
  /**
   * The position of the operand whose value is the most the answer may score, which a demand
   * carries.
   */
  readonly maximum: number;
  readonly operands: Operands;
  readonly result: R;
}

/**
 * An inline operator's registry entry, as the evaluator calls it.
 */
export interface InlineEntry<Definition extends string = string> {
  readonly definition: Definition;
  /**
   * The operator applied to its operands' values: NULL where an operand is NULL or not of its
   * declared type, else the module's result, a NULL of it of the declared result type.
   */
  readonly evaluate: (operands: readonly Value[]) => Value;
  readonly kind: "inline";
  readonly operands: readonly OperandSpec[];
  readonly result: ResultSpec;
}

/**
 * A recorded operator's registry entry: its declaration, since its answer is an input.
 */
export interface RecordedEntry<Definition extends string = string> {
  readonly definition: Definition;
  readonly kind: "recorded";
  readonly maximum: number;
  readonly operands: readonly OperandSpec[];
  readonly result: ValueType;
}

/**
 * A registry entry: a custom operator of either kind.
 */
export type CustomOperator<Definition extends string = string> =
  | InlineEntry<Definition>
  | RecordedEntry<Definition>;

/**
 * Whether a value is present and of a declared type.
 *
 * @param value - The value.
 * @param type - The declared type.
 * @returns Whether it is.
 */
const conforms = (value: Value, type: TypeSpec): value is Present =>
  value.kind !== "null" && (type.cardinality === "any" || sameValueType(valueTypeOf(value), type));

/**
 * Whether values are the present operands an operator declares, one of each declared type, in
 * order.
 *
 * @param operands - The declared operands.
 * @param values - The values.
 * @returns Whether they are.
 */
const areArguments = <Operands extends readonly OperandSpec[]>(
  operands: Operands,
  values: readonly Value[],
): values is ArgumentsOf<Operands> =>
  values.length === operands.length &&
  operands.every((operand, index) => {
    const value = values[index];

    return value !== undefined && conforms(value, operand.type);
  });

/**
 * The NULL an operator gives: of its declared result type, or of the type of the operand its result
 * follows.
 *
 * @param result - The declared result.
 * @param values - The operands' values.
 * @returns The NULL.
 */
const nullResult = (result: ResultSpec, values: readonly Value[]): Null => {
  if (!("operand" in result)) {
    return nullOf(result);
  }

  const followed = values[result.operand];

  return nullOf(followed === undefined ? { cardinality: "record" } : valueTypeOf(followed));
};

/**
 * Make an inline operator's registry entry, checking its function against its declared operands
 * and result.
 *
 * @param operator - The operator, as its module writes it.
 * @returns Its entry.
 */
export const inlineOperator = <
  const Definition extends string,
  const Operands extends readonly OperandSpec[],
  const R extends ResultSpec,
>(
  operator: InlineOperator<Definition, Operands, R>,
): InlineEntry<Definition> => ({
  definition: operator.definition,
  evaluate: (values) => {
    if (!areArguments(operator.operands, values)) {
      return nullResult(operator.result, values);
    }

    const value = operator.apply(values);

    return value.kind === "null" ? nullResult(operator.result, values) : value;
  },
  kind: "inline",
  operands: operator.operands,
  result: operator.result,
});

/**
 * Make a recorded operator's registry entry.
 *
 * @param operator - The operator, as its module writes it.
 * @returns Its entry.
 */
export const recordedOperator = <
  const Definition extends string,
  const Operands extends readonly OperandSpec[],
  const R extends ValueType,
>(
  operator: RecordedOperator<Definition, Operands, R>,
): RecordedEntry<Definition> => ({
  definition: operator.definition,
  kind: "recorded",
  maximum: operator.maximum,
  operands: operator.operands,
  result: operator.result,
});
