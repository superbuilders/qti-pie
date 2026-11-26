/**
 * The arithmetic family: `qti-sum`, `qti-product`, `qti-subtract`, `qti-divide`, `qti-power`,
 * `qti-min`, `qti-max`, `qti-integer-divide`, `qti-integer-modulus`, `qti-gcd`, `qti-lcm`,
 * `qti-integer-to-float`, `qti-round`, `qti-truncate` and `qti-round-to` (sections 2.11.3.11–14,
 * 16, 19, 24, 25, 30, 31, 33, 37, 38, 40 and 43).
 *
 * Integers are exact `bigint`s (reading `integer-unbounded`): sum, product, subtract, min and max
 * of integers alone give an integer, computed exactly and held to the computation bound (reading
 * `engine-size-limit`). Otherwise each integer becomes its nearest finite double (`toFloat`,
 * reading `integer-unbounded`) and the result is a float: a sum is its exact total rounded once
 * (D2), a product and a difference are IEEE 754's in document order, a quotient and a power are
 * IEEE 754's and NULL where they are no finite float (sections 2.11.3.19 and 2.11.3.31: "outside
 * the value set defined by float (not including positive and negative infinity)"), and min and max
 * are NULL over a NaN, which is no numerical value.
 *
 * @module
 */
import {
  decimalOfExact,
  exactOfNumber,
  exactSum,
  floatOfDecimal,
  floatOfNumber,
  flooredQuotient,
  roundDecimal,
  toFloat,
} from "#processing/numbers.ts";
import type { Decimal, NumberScalar } from "#processing/numbers.ts";
import type { Expression, LiteralOr, StaticType } from "#processing/ir.ts";
import { enumAttribute, integerOrVariable } from "#processing/operators/attributes.ts";
import {
  checked,
  dynamic,
  noAttributes,
  oneOperand,
  operandsTaken,
  refused,
  someOperands,
  twoOperands,
  typed,
} from "#processing/operators/operator.ts";
import type {
  Checked,
  CompileContext,
  OperandRule,
  OperatorTable,
} from "#processing/operators/operator.ts";
import { boundedInteger, integerAttribute } from "#processing/run.ts";
import type { Run } from "#processing/run.ts";
import { nullOf, single } from "#processing/value.ts";
import type { NonEmpty, Null, Value } from "#processing/value.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * A computed integer held to the computation bound: the integer, or `undefined` where it is past
 * the bound and the run has failed (reading `engine-size-limit`). The evaluator's `boundedInteger`
 * at the operator's place.
 */
export type Bounded = (integer: bigint) => bigint | undefined;

/**
 * The numbers an arithmetic operator's operands hold, each member of a container in its place:
 * integers when every one is an integer, else floats.
 */
export type Members =
  | { readonly kind: "float"; readonly values: NonEmpty<number> }
  | { readonly kind: "integer"; readonly values: NonEmpty<bigint> };

/**
 * The single float NULL, the value of a float operator that gives none.
 */
export const floatNull: Null = nullOf({ base: "float", cardinality: "single" });

/**
 * The single integer NULL.
 */
export const integerNull: Null = nullOf({ base: "integer", cardinality: "single" });

/**
 * A single float.
 *
 * @param float - The float.
 * @returns The value.
 */
export const floatValue = (float: number): Value => single("float", float);

/**
 * A single integer.
 *
 * @param integer - The integer.
 * @returns The value.
 */
export const integerValue = (integer: bigint): Value => single("integer", integer);

/**
 * The numbers a value holds.
 *
 * @param value - The value.
 * @returns Its numbers, a single's one or a container's members in order; `undefined` for NULL, a
 *   record, or a value of a base type that is no number.
 */
export const numbersOf = (value: Value): readonly NumberScalar[] | undefined => {
  switch (value.kind) {
    case "null":
    case "record": {
      return undefined;
    }
    case "single": {
      if (value.base === "integer") {
        return [{ base: "integer", value: value.value }];
      }

      return value.base === "float" ? [{ base: "float", value: value.value }] : undefined;
    }
    case "multiple":
    case "ordered": {
      if (value.base === "integer") {
        return value.values.map((integer) => ({ base: "integer", value: integer }) as const);
      }

      return value.base === "float"
        ? value.values.map((float) => ({ base: "float", value: float }) as const)
        : undefined;
    }
  }
};

/**
 * A single number.
 *
 * @param value - The value.
 * @returns Its number; `undefined` for NULL, a container, a record or a value that is no number.
 */
export const numberOf = (value: Value): NumberScalar | undefined => {
  if (value.kind !== "single") {
    return undefined;
  }

  if (value.base === "integer") {
    return { base: "integer", value: value.value };
  }

  return value.base === "float" ? { base: "float", value: value.value } : undefined;
};

/**
 * A single integer.
 *
 * @param value - The value.
 * @returns Its integer; `undefined` for any other value.
 */
export const integerOf = (value: Value): bigint | undefined =>
  value.kind === "single" && value.base === "integer" ? value.value : undefined;

/**
 * The members of an arithmetic operator's operands.
 *
 * @param values - The operands' values.
 * @returns The members; `undefined` when any operand is NULL or holds a value that is no number.
 */
export const membersOf = (values: readonly Value[]): Members | undefined => {
  const integers: bigint[] = [];
  const floats: number[] = [];
  let allIntegers = true;
  for (const value of values) {
    const held = numbersOf(value);
    if (held === undefined) {
      return undefined;
    }

    for (const number of held) {
      floats.push(floatOfNumber(number));
      if (number.base === "integer") {
        integers.push(number.value);
      } else {
        allIntegers = false;
      }
    }
  }

  const [firstInteger, ...restIntegers] = integers;
  if (allIntegers) {
    return firstInteger === undefined
      ? undefined
      : { kind: "integer", values: [firstInteger, ...restIntegers] };
  }

  const [firstFloat, ...restFloats] = floats;

  return firstFloat === undefined
    ? undefined
    : { kind: "float", values: [firstFloat, ...restFloats] };
};

/**
 * The value of `qti-sum`: the integers' exact sum, held to the bound, or the floats' exact total
 * rounded once (D2). NULL when any operand is NULL or no number.
 *
 * @param values - The operands' values.
 * @param bounded - The computation bound.
 * @param none - The NULL of the operator's static type.
 * @returns The sum.
 */
export const sumOf = (values: readonly Value[], bounded: Bounded, none: Null): Value => {
  const members = membersOf(values);
  if (members === undefined) {
    return none;
  }

  if (members.kind === "float") {
    return floatValue(exactSum(members.values));
  }

  let total = 0n;
  for (const integer of members.values) {
    total += integer;
  }

  const held = bounded(total);

  return held === undefined ? none : integerValue(held);
};

/**
 * The value of `qti-product`: the integers' exact product, 0 where any is 0, else held to the bound
 * at each partial product (with no 0 each partial product's magnitude is at least the one before,
 * so the first past the bound means the whole is); or the floats' IEEE 754 product in document
 * order.
 *
 * @param values - The operands' values.
 * @param bounded - The computation bound.
 * @param none - The NULL of the operator's static type.
 * @returns The product.
 */
export const productOf = (values: readonly Value[], bounded: Bounded, none: Null): Value => {
  const members = membersOf(values);
  if (members === undefined) {
    return none;
  }

  if (members.kind === "float") {
    let product = 1;
    for (const float of members.values) {
      product *= float;
    }

    return floatValue(product);
  }

  if (members.values.includes(0n)) {
    return integerValue(0n);
  }

  let product = 1n;
  for (const integer of members.values) {
    const held = bounded(product * integer);
    if (held === undefined) {
      return none;
    }

    product = held;
  }

  return integerValue(product);
};

/**
 * The value of `qti-subtract`: the first single number less the second; the integers' exact
 * difference, held to the bound, or the floats' IEEE 754 one.
 *
 * @param left - The first operand's value.
 * @param right - The second operand's value.
 * @param bounded - The computation bound.
 * @param none - The NULL of the operator's static type.
 * @returns The difference; NULL where either is NULL or no single number.
 */
export const subtractOf = (left: Value, right: Value, bounded: Bounded, none: Null): Value => {
  const x = numberOf(left);
  const y = numberOf(right);
  if (x === undefined || y === undefined) {
    return none;
  }

  if (x.base === "integer" && y.base === "integer") {
    const held = bounded(x.value - y.value);

    return held === undefined ? none : integerValue(held);
  }

  return floatValue(floatOfNumber(x) - floatOfNumber(y));
};

/**
 * A float result, NULL where it is no finite float: the reading of `qti-divide`'s and `qti-power`'s
 * "outside the value set defined by float (not including positive and negative infinity)".
 *
 * @param float - The IEEE 754 result.
 * @returns The single float, or NULL for an infinity or NaN.
 */
const finiteOrNull = (float: number): Value =>
  Number.isFinite(float) ? floatValue(float) : floatNull;

/**
 * The value of `qti-divide`: a single float, the first number divided by the second, IEEE 754's
 * quotient; NULL for a divisor of 0 and for a quotient that is no finite float (section
 * 2.11.3.19).
 *
 * @param left - The dividend's value.
 * @param right - The divisor's value.
 * @returns The quotient.
 */
export const divideOf = (left: Value, right: Value): Value => {
  const x = numberOf(left);
  const y = numberOf(right);
  if (x === undefined || y === undefined) {
    return floatNull;
  }

  const divisor = floatOfNumber(y);

  return divisor === 0 ? floatNull : finiteOrNull(floatOfNumber(x) / divisor);
};

/**
 * The value of `qti-power`: a single float, the first number raised to the second, the host.s
 * exponentiation (`**`, `Math.pow`, D3); NULL where the result is no finite float (section
 * 2.11.3.31), a negative base to a fractional power among them.
 *
 * @param left - The base's value.
 * @param right - The exponent's value.
 * @returns The power.
 */
export const powerOf = (left: Value, right: Value): Value => {
  const x = numberOf(left);
  const y = numberOf(right);

  return x === undefined || y === undefined
    ? floatNull
    : finiteOrNull(floatOfNumber(x) ** floatOfNumber(y));
};

/**
 * The value of `qti-min` or `qti-max`: the least or greatest number the operands hold, an integer
 * when every one is (one of them, so never held to the bound), else a float; NULL over a NaN, which
 * is no numerical value ("If any of the sub-expressions is not a numerical value, then the result
 * is NULL", sections 2.11.3.13 and 2.11.3.14).
 *
 * @param which - Which extreme.
 * @param values - The operands' values.
 * @param none - The NULL of the operator's static type.
 * @returns The extreme.
 */
export const extremeOf = (which: "max" | "min", values: readonly Value[], none: Null): Value => {
  const members = membersOf(values);
  if (members === undefined) {
    return none;
  }

  if (members.kind === "integer") {
    let [held] = members.values;
    for (const integer of members.values) {
      held = (which === "min" ? integer < held : integer > held) ? integer : held;
    }

    return integerValue(held);
  }

  if (members.values.some((float) => Number.isNaN(float))) {
    return none;
  }

  let [held] = members.values;
  for (const float of members.values) {
    held = which === "min" ? Math.min(held, float) : Math.max(held, float);
  }

  return floatValue(held);
};

/**
 * The value of `qti-integer-divide` or `qti-integer-modulus`: of two single integers, the floored
 * quotient ("the greatest integer (i) such that i ≤ (x/y)", section 2.11.3.24), or the remainder
 * `x − z·y` of it (section 2.11.3.25); NULL for a divisor of 0.
 *
 * @param which - Which of the two.
 * @param left - The dividend's value.
 * @param right - The divisor's value.
 * @returns The quotient or the remainder.
 */
export const integerDivisionOf = (
  which: "divide" | "modulus",
  left: Value,
  right: Value,
): Value => {
  const x = integerOf(left);
  const y = integerOf(right);
  if (x === undefined || y === undefined || y === 0n) {
    return integerNull;
  }

  const quotient = flooredQuotient(x, y);

  return integerValue(which === "divide" ? quotient : x - quotient * y);
};

/**
 * The integers an integer aggregate's operands hold.
 *
 * @param values - The operands' values.
 * @returns The integers; `undefined` when any operand is NULL or holds no integer.
 */
const integersOf = (values: readonly Value[]): readonly bigint[] | undefined => {
  const members = membersOf(values);

  return members?.kind === "integer" ? members.values : undefined;
};

/**
 * The greatest common divisor of two integers, of their magnitudes, Euclid's.
 *
 * @param left - The one.
 * @param right - The other.
 * @returns Their greatest common divisor, 0 for two 0s.
 */
const greatestCommonDivisor = (left: bigint, right: bigint): bigint => {
  let larger = left < 0n ? -left : left;
  let smaller = right < 0n ? -right : right;
  while (smaller !== 0n) {
    [larger, smaller] = [smaller, larger % smaller];
  }

  return larger;
};

/**
 * The value of `qti-gcd`: the greatest common divisor of every integer the operands hold, 0 when
 * every one is 0 (section 2.11.3.11). It never exceeds the operands, so it is not held to the
 * bound.
 *
 * @param values - The operands' values.
 * @returns The divisor; NULL when any operand is NULL or no integer.
 */
export const gcdOf = (values: readonly Value[]): Value => {
  const integers = integersOf(values);
  if (integers === undefined) {
    return integerNull;
  }

  let divisor = 0n;
  for (const integer of integers) {
    divisor = greatestCommonDivisor(divisor, integer);
  }

  return integerValue(divisor);
};

/**
 * The value of `qti-lcm`: the least common multiple of every integer the operands hold, 0 when any
 * is 0 (section 2.11.3.12), held to the bound at each partial multiple, which never decreases.
 *
 * @param values - The operands' values.
 * @param bounded - The computation bound.
 * @returns The multiple; NULL when any operand is NULL or no integer.
 */
export const lcmOf = (values: readonly Value[], bounded: Bounded): Value => {
  const integers = integersOf(values);
  if (integers === undefined) {
    return integerNull;
  }

  if (integers.includes(0n)) {
    return integerValue(0n);
  }

  let multiple = 1n;
  for (const integer of integers) {
    const magnitude = integer < 0n ? -integer : integer;
    const held = bounded((multiple / greatestCommonDivisor(multiple, magnitude)) * magnitude);
    if (held === undefined) {
      return integerNull;
    }

    multiple = held;
  }

  return integerValue(multiple);
};

/**
 * The value of `qti-integer-to-float`: the single integer's nearest finite double (reading
 * `integer-unbounded`).
 *
 * @param value - The operand's value.
 * @returns The float; NULL where the operand is NULL or no single integer.
 */
export const integerToFloatOf = (value: Value): Value => {
  const integer = integerOf(value);

  return integer === undefined ? floatNull : floatValue(toFloat(integer));
};

/**
 * The value of `qti-round`: the integer n with the number in [n − 0.5, n + 0.5), so −6.5 gives −6
 * and 6.5 gives 7 (section 2.11.3.37). An integer-valued double is its own integer: past 2^52,
 * `floor + 0.5` would round back to the integer and move it up one, so 2^52 rounds to itself. Any
 * other double is below 2^52 in magnitude, where `floor + 0.5` is exact, so the comparison decides
 * on the exact value: 0.49999999999999994 gives 0. NaN and the infinities give NULL, since an
 * integer holds no infinity (reading `infinite-rounding-operand`).
 *
 * @param value - The operand's value.
 * @returns The integer.
 */
export const roundOf = (value: Value): Value => {
  const number = numberOf(value);
  if (number === undefined) {
    return integerNull;
  }

  if (number.base === "integer") {
    return integerValue(number.value);
  }

  const float = number.value;
  if (!Number.isFinite(float)) {
    return integerNull;
  }

  if (Number.isInteger(float)) {
    return integerValue(BigInt(float));
  }

  const floor = Math.floor(float);

  return integerValue(BigInt(float >= floor + 0.5 ? floor + 1 : floor));
};

/**
 * The value of `qti-truncate`: the number truncated toward zero, so −6.8 gives −6 (section
 * 2.11.3.38); NaN and the infinities give NULL (reading `infinite-rounding-operand`).
 *
 * @param value - The operand's value.
 * @returns The integer.
 */
export const truncateOf = (value: Value): Value => {
  const number = numberOf(value);
  if (number === undefined) {
    return integerNull;
  }

  if (number.base === "integer") {
    return integerValue(number.value);
  }

  return Number.isFinite(number.value)
    ? integerValue(BigInt(Math.trunc(number.value)))
    : integerNull;
};

/**
 * How round-to and equal-rounded count their figures.
 */
export type RoundingMode = "decimalPlaces" | "significantFigures";

/**
 * A number rounded at a figure: its exact decimal rounded, or an infinity, which rounds to itself.
 */
export type Rounded =
  | { readonly decimal: Decimal; readonly kind: "decimal" }
  | { readonly kind: "infinity"; readonly negative: boolean };

/**
 * A number rounded by `qti-round-to`'s and `qti-equal-rounded`'s rule: its exact decimal (a float's
 * is its double's exact binary value, reading `format-float-rounding`) rounded at the deciding
 * digit, the (n+1)th significant digit or the (n+1)th after the point, up in magnitude when it is 5
 * or more (sections 2.11.3.43 and 2.11.3.4).
 *
 * @param number - The number.
 * @param mode - How the figures count.
 * @param figures - How many: 1 or more significant figures, 0 or more decimal places (reading
 *   `rounding-figures`).
 * @returns The rounded number; `undefined` for NaN or figures below the least.
 */
export const roundedOf = (
  number: NumberScalar,
  mode: RoundingMode,
  figures: bigint,
): Rounded | undefined => {
  if (figures < (mode === "significantFigures" ? 1n : 0n)) {
    return undefined;
  }

  const exact = exactOfNumber(number);
  if (exact === undefined) {
    const float = floatOfNumber(number);

    return Number.isNaN(float) ? undefined : { kind: "infinity", negative: float < 0 };
  }

  const decimal = decimalOfExact(exact);
  const keep =
    mode === "significantFigures"
      ? figures
      : BigInt(decimal.digits.length) + decimal.exponent + figures;

  return { decimal: roundDecimal(decimal, keep), kind: "decimal" };
};

/**
 * The value of `qti-round-to`: the float nearest the rounded number, an infinity itself. A finite
 * number whose rounding passes the largest finite double gives that double of its sign, as reading
 * 45 makes no infinity from a finite value.
 *
 * @param value - The operand's value.
 * @param mode - How the figures count.
 * @param figures - How many, or `undefined` where the variable it names holds no integer.
 * @returns The float; NULL where the operand is NULL, no number or NaN, or the figures are none or
 *   below the least.
 */
export const roundToOf = (value: Value, mode: RoundingMode, figures: bigint | undefined): Value => {
  const number = numberOf(value);
  const rounded =
    number === undefined || figures === undefined ? undefined : roundedOf(number, mode, figures);
  if (rounded === undefined) {
    return floatNull;
  }

  if (rounded.kind === "infinity") {
    return floatValue(rounded.negative ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY);
  }

  const float = floatOfDecimal(rounded.decimal);

  return floatValue(Number.isFinite(float) ? float : Math.sign(float) * Number.MAX_VALUE);
};

/**
 * A numeric operand of any cardinality but record: `qti-sum`, `qti-product`, `qti-min` and
 * `qti-max` add a container's members in its place.
 */
const numbers: OperandRule = {
  bases: ["float", "integer"],
  cardinalities: ["single", "multiple", "ordered"],
};

/**
 * A single numeric operand.
 */
const singleNumber: OperandRule = { bases: ["float", "integer"], cardinalities: ["single"] };

/**
 * An integer operand of any cardinality but record: `qti-gcd` and `qti-lcm` take containers.
 */
const integers: OperandRule = {
  bases: ["integer"],
  cardinalities: ["single", "multiple", "ordered"],
};

/**
 * A single integer operand.
 */
const singleInteger: OperandRule = { bases: ["integer"], cardinalities: ["single"] };

/**
 * The single float static type.
 */
const floatType: StaticType = typed({ base: "float", cardinality: "single" });

/**
 * The single integer static type.
 */
const integerType: StaticType = typed({ base: "integer", cardinality: "single" });

/**
 * The static type of an operator that is integer over integers alone, else float: float where an
 * operand is a float, integer where every operand is an integer, else dynamic, since a dynamic
 * operand may hold either at run time.
 *
 * @param operands - The operands, every one taken as a number.
 * @returns The result's static type.
 */
const numericType = (operands: readonly Expression[]): StaticType => {
  const floats = operands.some(
    (operand) =>
      operand.type.kind === "typed" &&
      operand.type.type.cardinality !== "record" &&
      operand.type.type.base === "float",
  );
  if (floats) {
    return floatType;
  }

  return operands.every((operand) => operand.type.kind === "typed") ? integerType : dynamic;
};

/**
 * The NULL an operator gives: of its static type, or the untyped NULL `qti-null` gives where only
 * the run knows its type.
 *
 * @param type - The operator's static type.
 * @returns The NULL.
 */
export const nullAt = (type: StaticType): Null =>
  nullOf(type.kind === "typed" ? type.type : { cardinality: "record" });

/**
 * The computation bound at an operator's place.
 *
 * @param run - The run.
 * @param place - The operator's place.
 * @returns Its bound.
 */
export const boundAt =
  (run: Run, place: number): Bounded =>
  (integer) =>
    boundedInteger(run, place, integer);

/**
 * Every operand's value, in document order.
 *
 * @param operands - The operands.
 * @param run - The run.
 * @returns Their values.
 */
export const valuesOf = (operands: readonly Expression[], run: Run): readonly Value[] =>
  operands.map((operand) => run.evaluate(operand));

/**
 * The attributes of `qti-round-to` and `qti-equal-rounded`: `figures`, an integer or a variable's
 * name, and `rounding-mode`, required on round-to and `significantFigures` by default on
 * equal-rounded (sections 5.119.1 and 5.47.1, reading `rounding-figures`). A literal `figures`
 * below the mode's least is refused.
 *
 * @param element - The element.
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @param fallback - The mode where none is written, or `required`.
 * @returns The attributes.
 */
export const roundingAttributes = (
  element: XmlElement,
  context: CompileContext,
  place: number,
  fallback: RoundingMode | "required",
): Checked<{ readonly figures: LiteralOr<bigint>; readonly roundingMode: RoundingMode }> => {
  const mode = enumAttribute(
    element,
    "rounding-mode",
    ["decimalPlaces", "significantFigures"] as const,
    fallback === "required" ? undefined : fallback,
    place,
  );
  if (!mode.ok) {
    return mode;
  }

  const figures = integerOrVariable(element, "figures", undefined, context, place);
  if (!figures.ok) {
    return figures;
  }

  const least = mode.value === "significantFigures" ? 1n : 0n;

  return figures.value.kind === "literal" && figures.value.value < least
    ? refused(
        "attribute",
        place,
        `write figures as ${least.toString()} or more under ${mode.value} (reading rounding-figures)`,
      )
    : checked({ figures: figures.value, roundingMode: mode.value });
};

/**
 * The arithmetic family's operators.
 */
export const arithmeticOperators: OperatorTable<
  | "divide"
  | "gcd"
  | "integer-divide"
  | "integer-modulus"
  | "integer-to-float"
  | "lcm"
  | "max"
  | "min"
  | "power"
  | "product"
  | "round"
  | "round-to"
  | "subtract"
  | "sum"
  | "truncate"
> = {
  divide: {
    arity: twoOperands,
    evaluate: (node, run) =>
      divideOf(run.evaluate(node.operands[0]), run.evaluate(node.operands[1])),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleNumber, place, floatType),
  },
  gcd: {
    arity: someOperands,
    evaluate: (node, run) => gcdOf(valuesOf(node.operands, run)),
    read: noAttributes,
    typing: (operands, _attributes, place) => operandsTaken(operands, integers, place, integerType),
  },
  "integer-divide": {
    arity: twoOperands,
    evaluate: (node, run) =>
      integerDivisionOf("divide", run.evaluate(node.operands[0]), run.evaluate(node.operands[1])),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleInteger, place, integerType),
  },
  "integer-modulus": {
    arity: twoOperands,
    evaluate: (node, run) =>
      integerDivisionOf("modulus", run.evaluate(node.operands[0]), run.evaluate(node.operands[1])),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleInteger, place, integerType),
  },
  "integer-to-float": {
    arity: oneOperand,
    evaluate: (node, run) => integerToFloatOf(run.evaluate(node.operands[0])),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleInteger, place, floatType),
  },
  lcm: {
    arity: someOperands,
    evaluate: (node, run) => lcmOf(valuesOf(node.operands, run), boundAt(run, node.place)),
    read: noAttributes,
    typing: (operands, _attributes, place) => operandsTaken(operands, integers, place, integerType),
  },
  max: {
    arity: someOperands,
    evaluate: (node, run) => extremeOf("max", valuesOf(node.operands, run), nullAt(node.type)),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, numbers, place, numericType(operands)),
  },
  min: {
    arity: someOperands,
    evaluate: (node, run) => extremeOf("min", valuesOf(node.operands, run), nullAt(node.type)),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, numbers, place, numericType(operands)),
  },
  power: {
    arity: twoOperands,
    evaluate: (node, run) =>
      powerOf(run.evaluate(node.operands[0]), run.evaluate(node.operands[1])),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleNumber, place, floatType),
  },
  product: {
    arity: someOperands,
    evaluate: (node, run) =>
      productOf(valuesOf(node.operands, run), boundAt(run, node.place), nullAt(node.type)),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, numbers, place, numericType(operands)),
  },
  round: {
    arity: oneOperand,
    evaluate: (node, run) => roundOf(run.evaluate(node.operands[0])),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleNumber, place, integerType),
  },
  "round-to": {
    arity: oneOperand,
    evaluate: (node, run) =>
      roundToOf(
        run.evaluate(node.operands[0]),
        node.roundingMode,
        integerAttribute(run, node.figures),
      ),
    read: (element, context, place) => roundingAttributes(element, context, place, "required"),
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleNumber, place, floatType),
  },
  subtract: {
    arity: twoOperands,
    evaluate: (node, run) =>
      subtractOf(
        run.evaluate(node.operands[0]),
        run.evaluate(node.operands[1]),
        boundAt(run, node.place),
        nullAt(node.type),
      ),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleNumber, place, numericType(operands)),
  },
  sum: {
    arity: someOperands,
    evaluate: (node, run) =>
      sumOf(valuesOf(node.operands, run), boundAt(run, node.place), nullAt(node.type)),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, numbers, place, numericType(operands)),
  },
  truncate: {
    arity: oneOperand,
    evaluate: (node, run) => truncateOf(run.evaluate(node.operands[0])),
    read: noAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleNumber, place, integerType),
  },
};
