/**
 * The engine's numbers, a leaf the evaluator and the expression families share: the single values
 * a kind gives ({@link singleValue} for any single, {@link booleanOf}, {@link integerValue},
 * {@link floatValue}) and the single NULLs ({@link booleanNull}, {@link integerNull},
 * {@link floatNull}), the one conversion from an integer to a float ({@link toFloat}, and
 * {@link floatOf} for a single number), the one single of some base types a value holds
 * ({@link singleOf}; {@link numberOf} for a number and {@link integerOf} for an integer), exact
 * equality of two numbers
 * ({@link sameNumber}), and the bounds on what the engine computes ({@link integerBitBound},
 * {@link containerSizeBound}), with the checks that hold a computed integer, a product built one
 * factor at a time ({@link boundedTimes}) and a container to them.
 *
 * Integers are exact `bigint`s (reading 45) and floats are 64-bit doubles, never infinite when made
 * from an integer. An integer and a float compare exactly, never through a lossy conversion.
 *
 * @module
 */
import { Data, Option } from "effect";
import type { ModelledBaseType, Single, Value } from "#plate/model/values.ts";

/**
 * Construct the single value that holds one single, of the single's base type.
 *
 * @param single The single.
 * @returns The value.
 */
export const singleValue = (single: Single): Value => ({
  baseType: single.baseType,
  cardinality: "single",
  values: [single],
});

/**
 * Construct a single boolean value.
 *
 * @param value The boolean.
 * @returns The value.
 */
export const booleanOf = (value: boolean): Value => ({
  baseType: "boolean",
  cardinality: "single",
  values: [{ baseType: "boolean", value }],
});

/**
 * Construct a single integer value.
 *
 * @param value The integer.
 * @returns The value.
 */
export const integerValue = (value: bigint): Value => ({
  baseType: "integer",
  cardinality: "single",
  values: [{ baseType: "integer", value }],
});

/**
 * Construct a single float value.
 *
 * @param value The float.
 * @returns The value.
 */
export const floatValue = (value: number): Value => ({
  baseType: "float",
  cardinality: "single",
  values: [{ baseType: "float", value }],
});

/**
 * The single boolean NULL: the value of a comparison, logic or text expression whose truth is not
 * known.
 */
export const booleanNull: Value = { baseType: "boolean", cardinality: "single", values: [] };

/**
 * The single integer NULL: the value of an integer expression whose value is not defined.
 */
export const integerNull: Value = { baseType: "integer", cardinality: "single", values: [] };

/**
 * The single float NULL: the value of a float expression whose value is not defined.
 */
export const floatNull: Value = { baseType: "float", cardinality: "single", values: [] };

/**
 * Convert an exact integer to a float: the nearest double, ties to even, and the largest finite
 * double of its sign for an integer beyond it (reading 45). It is the one conversion from an
 * integer to a float, so every kind that makes a float of an integer clamps alike.
 *
 * Beyond 2^53 a double cannot hold every integer, so `2^53 + 1` becomes `2^53`. That loss is the
 * float QTI specifies wherever an integer is compared as one, so it is not reported.
 *
 * An integer has no largest value (reading 45), and the float base type holds no infinity, so "an
 * integer beyond the largest finite float becomes the largest finite float of its sign" (reading
 * 45): from 2^1024 − 2^970, the least integer whose nearest double is an infinity, `10^400`
 * among them, it gives `Number.MAX_VALUE`, and its negative `-Number.MAX_VALUE`. `Number` of a
 * `bigint` is never NaN.
 *
 * @param integer The integer.
 * @returns The nearest double, finite.
 */
export const toFloat = (integer: bigint): number => {
  const nearest = Number(integer);
  if (nearest === Number.POSITIVE_INFINITY) {
    return Number.MAX_VALUE;
  }

  return nearest === Number.NEGATIVE_INFINITY ? -Number.MAX_VALUE : nearest;
};

/**
 * A single of a numeric base type: an exact integer or a 64-bit double.
 */
export type NumberSingle = Extract<Single, { readonly baseType: "float" | "integer" }>;

/**
 * Give the one single a value holds when the value is a single of one of some base types, as every
 * kind reads an operand it takes as a single: a logic kind's boolean, a string kind's string, a
 * numeric kind's number, a duration comparison's duration.
 *
 * @param value The value.
 * @param baseTypes The base types the single may have.
 * @returns The single, or none when the value is NULL, a container, or a single of another base
 *   type.
 */
export const singleOf = <B extends ModelledBaseType>(
  value: Value,
  ...baseTypes: readonly B[]
): Option.Option<Extract<Single, { readonly baseType: B }>> => {
  const [single, ...rest] = value.values;
  const isOf = (held: Single): held is Extract<Single, { readonly baseType: B }> =>
    baseTypes.some((baseType) => baseType === held.baseType);

  return value.cardinality === "single" && rest.length === 0 && single !== undefined && isOf(single)
    ? Option.some(single)
    : Option.none();
};

/**
 * Give the one number a single integer or float value holds.
 *
 * @param value The value.
 * @returns The single integer or float, or none when the value is NULL or not a single of a numeric
 *   base type.
 */
export const numberOf = (value: Value): Option.Option<NumberSingle> =>
  singleOf(value, "integer", "float");

/**
 * Give the integer a single integer value holds.
 *
 * @param value The value.
 * @returns The integer, or none when the value is NULL or not a single integer.
 */
export const integerOf = (value: Value): Option.Option<bigint> =>
  singleOf(value, "integer").pipe(Option.map((single) => single.value));

/**
 * Give the float a single number stands for: a float as it is, an integer through
 * {@link toFloat}, the one integer-to-float conversion.
 *
 * @param single The number.
 * @returns The float.
 */
export const floatOf = (single: NumberSingle): number =>
  single.baseType === "integer" ? toFloat(single.value) : single.value;

/**
 * Report whether an integer and a float are the same number, exactly: the float is integral and
 * converts to that integer. A float that is integral and finite converts to a `bigint` exactly, so
 * the comparison loses nothing, as `bigint == number` would not;
 * no integer is converted to a float.
 *
 * @param integer The integer.
 * @param float The float.
 * @returns Whether they are equal.
 */
const integerIsFloat = (integer: bigint, float: number): boolean =>
  Number.isInteger(float) && BigInt(float) === integer;

/**
 * Report whether two numbers are equal exactly: two integers or two floats by value, and an integer
 * and a float as {@link integerIsFloat} compares them, so `1` and `1.0` are equal and `1` and
 * `1.0000000000000002` are not.
 *
 * @param left One number.
 * @param right The other.
 * @returns Whether they are equal.
 */
export const sameNumber = (left: NumberSingle, right: NumberSingle): boolean => {
  if (left.baseType === "integer") {
    return right.baseType === "integer"
      ? left.value === right.value
      : integerIsFloat(left.value, right.value);
  }

  return right.baseType === "integer"
    ? integerIsFloat(right.value, left.value)
    : left.value === right.value;
};

/**
 * The most bits an integer the engine computes may have: 1,000,000, the computation bound reading
 * 211 states. An integer is unbounded (reading 45; information model Table A1.3, "Integer - the
 * integer data-type (this is derived from the "decimal" data-type i.e. no decimal places)"), so
 * an item whose rules square an outcome rule after rule would double its size each time and hang
 * scoring; a run that computes an integer past this bound aborts ({@link ComputationBoundDefect}).
 * An integer as written (a literal, a declared default, a stored value) is never held to it.
 */
export const integerBitBound = 1_000_000;

/**
 * The most values a container the engine computes may hold: 1,000,000, the computation bound
 * reading 211 states for containers. A run that computes a container past it aborts
 * ({@link ComputationBoundDefect}), so `qti-repeat` with a `number-repeats` of 2147483647 cannot
 * hang scoring. A container as written or stored is never held to it.
 */
export const containerSizeBound = 1_000_000;

/**
 * The defect of a run that asks for more than the computation bound (reading 211): an integer of
 * more than {@link integerBitBound} bits, or a container of more than {@link containerSizeBound}
 * values. The information model bounds neither, and no QTI value stands for "too large to
 * compute": NULL is a value, which a condition reads as false and a sum as nothing, so a run that
 * gave it would score the attempt as if the candidate had answered so. The engine never gives
 * one here. It throws this instead, aborting the run, so the attempt it would score stays
 * ungraded and its host reports the item.
 */
export class ComputationBoundDefect extends Data.TaggedError("ComputationBoundDefect")<{
  /**
   * What the run asks for past the bound: an integer, a container, or a drawing `qti-repeat`'s
   * passes.
   */
  readonly kind: "container" | "integer" | "passes";
}> {
  /**
   * The bound the run passed, and what follows from it.
   */
  override get message(): string {
    const asked = {
      container: `a container of more than ${String(containerSizeBound)} values`,
      integer: `an integer of more than ${String(integerBitBound)} bits`,
      passes: `a qti-repeat of more than ${String(containerSizeBound)} passes`,
    }[this.kind];

    return `The item's processing computes ${asked}, past plate's computation bound (reading 211), so the run aborts and the attempt it scores stays ungraded: no QTI value stands for a result past the bound. Report the item.`;
  }
}

/**
 * Give the number of bits an integer has: the binary digits of its magnitude, so 0 has none, 1 has
 * one and 2^999999 has 1,000,000, and an integer and its negative have the same. It reads the
 * hexadecimal digits, which `bigint` writes in time linear in its size, so it makes a string the
 * integer's size: {@link boundedTimes} measures each factor once this way, and a product only when
 * its factors cannot decide it.
 *
 * @param integer The integer.
 * @returns Its bit length.
 */
export const bitLengthOf = (integer: bigint): number => {
  if (integer === 0n) {
    return 0;
  }

  const digits = (integer < 0n ? -integer : integer).toString(16);

  return (digits.length - 1) * 4 + 32 - Math.clz32(Number.parseInt(digits.charAt(0), 16));
};

/**
 * Give an integer the engine computed, held to {@link integerBitBound}.
 *
 * @param integer The computed integer.
 * @returns The integer.
 * @throws {ComputationBoundDefect} When it has more than 1,000,000 bits, which aborts the run.
 */
export const boundedInteger = (integer: bigint): bigint => {
  if (bitLengthOf(integer) > integerBitBound) {
    throw new ComputationBoundDefect({ kind: "integer" });
  }

  return integer;
};

/**
 * A product the engine is building factor by factor, with the range its bit length lies in:
 * `leastBits <= bitLengthOf(integer) <= mostBits`. A product's bit length is known from its
 * factors' to within one bit, so the range is carried from one factor to the next instead of
 * measuring each partial product.
 */
export interface PartialProduct {
  readonly integer: bigint;
  readonly leastBits: number;
  readonly mostBits: number;
}

/**
 * The product of no factor: 1, of exactly one bit, where a product built by
 * {@link boundedTimes} starts.
 */
export const emptyProduct: PartialProduct = { integer: 1n, leastBits: 1, mostBits: 1 };

/**
 * The product of 0 and any integer: 0, of no bits.
 */
const zeroProduct: PartialProduct = { integer: 0n, leastBits: 0, mostBits: 0 };

/**
 * Multiply a product by one more integer when the result is within {@link integerBitBound},
 * deciding from bit lengths wherever they suffice. The factor is measured once; the product is
 * not. A product of `a` and `b` bits, neither 0, has `a + b` or `a + b − 1` bits, and exactly the
 * other's bits when one is ±1, the one factor of one bit. So the product is kept unmeasured when
 * the most it can have is at most the bound, and is none before any multiplication when the least
 * it can have is past it; only in between is it measured, exactly, and it is then at most the
 * factor's bits past the bound. A product with 0 is 0, whatever the other's size.
 *
 * @param held The product so far, within the bound.
 * @param factor The next integer.
 * @returns The product with the range of its bit length, exact once measured.
 * @throws {ComputationBoundDefect} When the product has more than 1,000,000 bits, which aborts the
 *   run.
 */
export const boundedTimes = (held: PartialProduct, factor: bigint): PartialProduct => {
  if (held.integer === 0n || factor === 0n) {
    return zeroProduct;
  }

  const bits = bitLengthOf(factor);
  const leastBits = held.leastBits + bits - 1;
  if (leastBits > integerBitBound) {
    throw new ComputationBoundDefect({ kind: "integer" });
  }

  const integer = held.integer * factor;
  const mostBits = held.mostBits + bits - (held.mostBits === 1 || bits === 1 ? 1 : 0);
  if (mostBits <= integerBitBound) {
    return { integer, leastBits, mostBits };
  }

  const exact = bitLengthOf(integer);
  if (exact > integerBitBound) {
    throw new ComputationBoundDefect({ kind: "integer" });
  }

  return { integer, leastBits: exact, mostBits: exact };
};

/**
 * Hold a container the engine computes, of a size, to {@link containerSizeBound}, before it is
 * built.
 *
 * @param size How many values it would hold.
 * @throws {ComputationBoundDefect} When it would hold more than 1,000,000 values, which aborts the
 *   run.
 */
export const heldToContainerBound = (size: bigint): void => {
  if (size > BigInt(containerSizeBound)) {
    throw new ComputationBoundDefect({ kind: "container" });
  }
};

/**
 * Hold the passes a drawing `qti-repeat` asks for to {@link containerSizeBound}, before the first:
 * a pass that gives a value adds at least one, so more passes than the bound would build a
 * container past it, and one that gives none ends the repeat at once.
 *
 * @param passes How many passes its `number-repeats` asks for.
 * @throws {ComputationBoundDefect} When it asks for more than 1,000,000, which aborts the run.
 */
export const heldToPassBudget = (passes: bigint): void => {
  if (passes > BigInt(containerSizeBound)) {
    throw new ComputationBoundDefect({ kind: "passes" });
  }
};
