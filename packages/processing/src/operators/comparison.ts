/**
 * The comparison family: `qti-lt`, `qti-gt`, `qti-lte`, `qti-gte`, `qti-equal`,
 * `qti-equal-rounded`, `qti-duration-lt` and `qti-duration-gte` (sections 2.11.3.3, 2.11.3.4,
 * 2.11.3.20–23, 26, 27 and 28). `qti-match` compares as value.ts's `sameScalar` compares members,
 * the one implementation of "the same value".
 *
 * Numbers compare by their exact values, an integer against a float included (reading
 * `integer-unbounded`), so the integer 9007199254740993 is greater than the float 9007199254740992.
 * A tolerance's ends are exact over the doubles' binary values (reading `tolerance-exact-binary`),
 * `t0` bounding below and `t1` above (reading `relative-equal-range`). Every comparison gives NULL
 * for a NULL operand; a NaN is in no order, so a comparison with one is false.
 *
 * @module
 */
import {
  addExact,
  compareExact,
  exactOfInteger,
  exactOfNumber,
  floatOfNumber,
  multiplyExact,
  negateExact,
  orderOfNumbers,
  sameDecimal,
} from "#processing/numbers.ts";
import type { NumberScalar, Order } from "#processing/numbers.ts";
import type { AttributesOf, Expression, Node, StaticType } from "#processing/ir.ts";
import { numberOf, roundedOf, roundingAttributes } from "#processing/operators/arithmetic.ts";
import { membersOf } from "#processing/operators/containers.ts";
import type { Rounded, RoundingMode } from "#processing/operators/arithmetic.ts";
import {
  booleanAttribute,
  enumAttribute,
  floatOrVariable,
  listAttribute,
} from "#processing/operators/attributes.ts";
import {
  checked,
  noAttributes,
  operandsTaken,
  refused,
  singleBoolean,
  twoOperands,
} from "#processing/operators/operator.ts";
import type {
  Checked,
  CompileContext,
  Operator,
  OperandRule,
  OperatorTable,
} from "#processing/operators/operator.ts";
import { floatAttribute, integerAttribute } from "#processing/run.ts";
import type { Run } from "#processing/run.ts";
import { nullOf, sameScalar, sameValueType, single, valueTypeOf } from "#processing/value.ts";
import type { BaseType, Present, RecordValue, Scalars, Value } from "#processing/value.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * The single boolean NULL.
 */
export const booleanNull: Value = nullOf({ base: "boolean", cardinality: "single" });

/**
 * A single boolean.
 *
 * @param holds - The truth.
 * @returns The value.
 */
export const truth = (holds: boolean): Value => single("boolean", holds);

/**
 * Which order a comparison holds for.
 */
export type Inequality = "gt" | "gte" | "lt" | "lte";

/**
 * Whether an order is one an inequality holds for.
 *
 * @param inequality - The inequality.
 * @param order - The first operand's order against the second's.
 * @returns Whether it holds.
 */
const holdsFor = (inequality: Inequality, order: Order): boolean => {
  switch (inequality) {
    case "gt": {
      return order > 0;
    }
    case "gte": {
      return order >= 0;
    }
    case "lt": {
      return order < 0;
    }
    case "lte": {
      return order <= 0;
    }
  }
};

/**
 * The value of `qti-gt`, `qti-gte`, `qti-lt` or `qti-lte`: whether the first single number stands
 * so against the second, by exact value.
 *
 * @param inequality - Which.
 * @param left - The first operand's value.
 * @param right - The second operand's value.
 * @returns The truth; NULL where either is NULL or no single number; false where either is NaN.
 */
export const inequalityOf = (inequality: Inequality, left: Value, right: Value): Value => {
  const x = numberOf(left);
  const y = numberOf(right);
  if (x === undefined || y === undefined) {
    return booleanNull;
  }

  const order = orderOfNumbers(x, y);

  return truth(order !== undefined && holdsFor(inequality, order));
};

/**
 * The value of `qti-duration-lt` or `qti-duration-gte`: whether the first single duration is
 * shorter than the second, or not shorter, its seconds compared as the doubles they are (reading
 * `null-results`, item 9).
 *
 * @param which - Which.
 * @param left - The first operand's value.
 * @param right - The second operand's value.
 * @returns The truth; NULL where either is NULL or no single duration.
 */
export const durationOrderOf = (which: "gte" | "lt", left: Value, right: Value): Value => {
  if (
    left.kind !== "single" ||
    left.base !== "duration" ||
    right.kind !== "single" ||
    right.base !== "duration"
  ) {
    return booleanNull;
  }

  return truth(which === "lt" ? left.value < right.value : left.value >= right.value);
};

/**
 * `qti-equal`'s tolerance mode.
 */
export type ToleranceMode = "absolute" | "exact" | "relative";

/**
 * A `qti-equal`'s comparison, its tolerance resolved: `t0` and `t1`, the same where one is written.
 */
export interface Tolerance {
  readonly includeLower: boolean;
  readonly includeUpper: boolean;
  readonly lower: NumberScalar;
  readonly mode: "absolute" | "relative";
  readonly upper: NumberScalar;
}

/**
 * Whether an order holds at a range's lower end: above it, or at it where the end is included.
 *
 * @param order - The value's order against the end.
 * @param include - Whether the end is in the range.
 * @returns Whether it holds.
 */
const aboveLower = (order: Order | undefined, include: boolean): boolean =>
  order !== undefined && (include ? order >= 0 : order > 0);

/**
 * Whether an order holds at a range's upper end: below it, or at it where the end is included.
 *
 * @param order - The value's order against the end.
 * @param include - Whether the end is in the range.
 * @returns Whether it holds.
 */
const belowUpper = (order: Order | undefined, include: boolean): boolean =>
  order !== undefined && (include ? order <= 0 : order < 0);

/**
 * Whether `y` is in `x`'s range: absolute `[x − t0, x + t1]`, relative `[x − |x|·t0/100, x +
 * |x|·t1/100]` (reading `relative-equal-range`), each end open where its include attribute is
 * false. Over finite values it is decided exactly, as `100·(y − x)` against `−|x|·t0` and `|x|·t1`
 * (relative) or `y − x` against `−t0` and `t1` (absolute), on the doubles' binary values (reading
 * `tolerance-exact-binary`); an infinity or NaN among them compares as a double.
 *
 * @param tolerance - The tolerance.
 * @param x - The first operand's number.
 * @param y - The second operand's number.
 * @returns Whether it is in the range.
 */
export const withinTolerance = (
  tolerance: Tolerance,
  x: NumberScalar,
  y: NumberScalar,
): boolean => {
  const exactX = exactOfNumber(x);
  const exactY = exactOfNumber(y);
  const exactLower = exactOfNumber(tolerance.lower);
  const exactUpper = exactOfNumber(tolerance.upper);
  if (
    exactX !== undefined &&
    exactY !== undefined &&
    exactLower !== undefined &&
    exactUpper !== undefined
  ) {
    const relative = tolerance.mode === "relative";
    const difference = addExact(exactY, negateExact(exactX));
    const scaled = relative ? multiplyExact(exactOfInteger(100n), difference) : difference;
    const weight = relative
      ? {
          exponent: exactX.exponent,
          significand: exactX.significand < 0n ? -exactX.significand : exactX.significand,
        }
      : exactOfInteger(1n);

    return (
      aboveLower(
        compareExact(scaled, negateExact(multiplyExact(weight, exactLower))),
        tolerance.includeLower,
      ) &&
      belowUpper(compareExact(scaled, multiplyExact(weight, exactUpper)), tolerance.includeUpper)
    );
  }

  const first = floatOfNumber(x);
  const reach = (t: NumberScalar): number =>
    tolerance.mode === "absolute" ? floatOfNumber(t) : (Math.abs(first) * floatOfNumber(t)) / 100;

  return (
    aboveLower(
      orderOfNumbers(y, { base: "float", value: first - reach(tolerance.lower) }),
      tolerance.includeLower,
    ) &&
    belowUpper(
      orderOfNumbers(y, { base: "float", value: first + reach(tolerance.upper) }),
      tolerance.includeUpper,
    )
  );
};

/**
 * The value of `qti-equal`: whether the second single number equals the first, exactly (an
 * integer and a float by exact value, -0 equal to 0, NaN equal to nothing), or within the
 * tolerance.
 *
 * @param tolerance - The tolerance, or `exact`.
 * @param left - The first operand's value, `x`.
 * @param right - The second operand's value, `y`.
 * @returns The truth; NULL where either is NULL or no single number, or where a tolerance names a
 *   variable that holds no number.
 */
export const equalOf = (
  tolerance: Tolerance | "exact" | undefined,
  left: Value,
  right: Value,
): Value => {
  const x = numberOf(left);
  const y = numberOf(right);
  if (x === undefined || y === undefined || tolerance === undefined) {
    return booleanNull;
  }

  return truth(
    tolerance === "exact" ? orderOfNumbers(x, y) === 0 : withinTolerance(tolerance, x, y),
  );
};

/**
 * Whether two rounded numbers are the same: one decimal, or one infinity.
 *
 * @param left - The one.
 * @param right - The other.
 * @returns Whether they are the same.
 */
const sameRounded = (left: Rounded, right: Rounded): boolean => {
  if (left.kind === "infinity") {
    return right.kind === "infinity" && left.negative === right.negative;
  }

  return right.kind === "decimal" && sameDecimal(left.decimal, right.decimal);
};

/**
 * The value of `qti-equal-rounded`: whether the two single numbers, each rounded by round-to's rule
 * (reading `format-float-rounding`), are the same decimal.
 *
 * @param mode - How the figures count.
 * @param figures - How many, or `undefined` where the variable it names holds no integer.
 * @param left - The first operand's value.
 * @param right - The second operand's value.
 * @returns The truth; NULL where either is NULL, no number or NaN, or the figures are none or below
 *   the least.
 */
export const equalRoundedOf = (
  mode: RoundingMode,
  figures: bigint | undefined,
  left: Value,
  right: Value,
): Value => {
  const x = numberOf(left);
  const y = numberOf(right);
  if (x === undefined || y === undefined || figures === undefined) {
    return booleanNull;
  }

  const one = roundedOf(x, mode, figures);
  const other = roundedOf(y, mode, figures);

  return one === undefined || other === undefined ? booleanNull : truth(sameRounded(one, other));
};

/**
 * Whether two lists of one base type hold the same members, each matched once: a multiset's
 * equality.
 *
 * @param base - The base type.
 * @param left - The one list.
 * @param right - The other.
 * @returns Whether they are one multiset.
 */
const sameBag = <B extends BaseType>(
  base: B,
  left: readonly Scalars[B][],
  right: readonly Scalars[B][],
): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  const unmatched = [...right];

  return left.every((member) => {
    const at = unmatched.findIndex((held) => sameScalar(base, held, member));
    if (at === -1) {
      return false;
    }

    unmatched.splice(at, 1);

    return true;
  });
};

/**
 * Whether two lists of one base type hold the same members in the same places.
 *
 * @param base - The base type.
 * @param left - The one list.
 * @param right - The other.
 * @returns Whether they are one sequence.
 */
const sameSequence = <B extends BaseType>(
  base: B,
  left: readonly Scalars[B][],
  right: readonly Scalars[B][],
): boolean =>
  left.length === right.length &&
  left.every((member, at) => {
    const other = right[at];

    return other !== undefined && sameScalar(base, member, other);
  });

/**
 * Whether two records are the same: the same field names, each field's value of one base type and
 * the same (records are sorted by name, so field i meets field i).
 *
 * @param left - The one record.
 * @param right - The other.
 * @returns Whether they are one record.
 */
const sameRecord = (left: RecordValue, right: RecordValue): boolean =>
  left.fields.length === right.fields.length &&
  left.fields.every((field, at) => {
    const other = right.fields[at];
    if (other === undefined || other.name !== field.name) {
      return false;
    }

    const { base } = field.value;
    const [one] = membersOf(base, field.value) ?? [];
    const [two] = membersOf(base, other.value) ?? [];

    return one !== undefined && two !== undefined && sameScalar(base, one, two);
  });

/**
 * Whether two present values of one type are the same value (section 2.11.3.28): a single by
 * `sameScalar`, a multiple as a multiset, an ordered position by position, a record field by field.
 *
 * @param left - The one value.
 * @param right - The other, of the same type.
 * @returns Whether they are the same.
 */
const sameValue = (left: Present, right: Present): boolean => {
  if (left.kind === "record") {
    return right.kind === "record" && sameRecord(left, right);
  }

  const { base } = left;
  const one = membersOf(base, left);
  const other = membersOf(base, right);
  if (one === undefined || other === undefined) {
    return false;
  }

  return left.kind === "multiple" ? sameBag(base, one, other) : sameSequence(base, one, other);
};

/**
 * The value of `qti-match`: whether the two values, of one base type and cardinality, are the same
 * value (section 2.11.3.28).
 *
 * @param left - The first operand's value.
 * @param right - The second operand's value.
 * @returns The truth; NULL where either is NULL, or where the two differ in type, which no static
 *   type admits and only a dynamic operand gives.
 */
export const matchOf = (left: Value, right: Value): Value => {
  if (left.kind === "null" || right.kind === "null") {
    return booleanNull;
  }

  return sameValueType(valueTypeOf(left), valueTypeOf(right))
    ? truth(sameValue(left, right))
    : booleanNull;
};

/**
 * The typing of `qti-match`: two operands of one type where both are known, never duration ("must
 * not be used on sub-expressions of base-type duration", section 2.11.3.28, reading
 * `index-and-delete-operands`).
 *
 * @param operands - The two operands.
 * @param place - The operator's place.
 * @returns The single boolean, or the refusal.
 */
const matchTyping = (
  operands: readonly [Expression, Expression],
  place: number,
): Checked<StaticType> => {
  const [left, right] = operands;
  const duration = operands.some(
    ({ type }) =>
      type.kind === "typed" && type.type.cardinality !== "record" && type.type.base === "duration",
  );
  const differ =
    left.type.kind === "typed" &&
    right.type.kind === "typed" &&
    !sameValueType(left.type.type, right.type.type);

  return duration || differ
    ? refused("operand-type", place, "write two operands of one type other than duration")
    : checked(singleBoolean);
};

/**
 * A single numeric operand.
 */
const singleNumber: OperandRule = { bases: ["float", "integer"], cardinalities: ["single"] };

/**
 * A single duration operand.
 */
const singleDuration: OperandRule = { bases: ["duration"], cardinalities: ["single"] };

/**
 * An inequality operator: two single numbers to a single boolean.
 *
 * @param which - Which.
 * @returns The operator.
 */
const inequalityOperator = <K extends Inequality>(which: K): Operator<K> => ({
  arity: twoOperands,
  evaluate: (node, run) =>
    inequalityOf(which, run.evaluate(node.operands[0]), run.evaluate(node.operands[1])),
  read: noAttributes,
  typing: (operands, _attributes, place) =>
    operandsTaken(operands, singleNumber, place, singleBoolean),
});

/**
 * A duration order operator: two single durations to a single boolean.
 *
 * @param which - Which order it tests.
 * @returns The operator.
 */
const durationOrder = <K extends "duration-gte" | "duration-lt">(
  which: "gte" | "lt",
): Operator<K> => ({
  arity: twoOperands,
  evaluate: (node, run) =>
    durationOrderOf(which, run.evaluate(node.operands[0]), run.evaluate(node.operands[1])),
  read: noAttributes,
  typing: (operands, _attributes, place) =>
    operandsTaken(operands, singleDuration, place, singleBoolean),
});

/**
 * A `qti-equal`'s attributes: `tolerance-mode`, `exact` by default; `tolerance`, one or two numbers
 * or variables' names, required in the other modes (reading `tolerance`); and the two include
 * attributes, true by default (section 5.46).
 *
 * @param element - The element.
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @returns The attributes.
 */
const equalAttributes = (
  element: XmlElement,
  context: CompileContext,
  place: number,
): Checked<AttributesOf["equal"]> => {
  const mode = enumAttribute(
    element,
    "tolerance-mode",
    ["absolute", "exact", "relative"] as const,
    "exact",
    place,
  );
  const lower = booleanAttribute(element, "include-lower-bound", true, place);
  const upper = booleanAttribute(element, "include-upper-bound", true, place);
  if (!mode.ok) {
    return mode;
  }

  if (!lower.ok) {
    return lower;
  }

  if (!upper.ok) {
    return upper;
  }

  const written = listAttribute(element, "tolerance");
  const [first, second, ...rest] = written;
  if (mode.value === "exact" && first === undefined) {
    return checked({
      includeLowerBound: lower.value,
      includeUpperBound: upper.value,
      tolerance: undefined,
      toleranceMode: "exact",
    });
  }

  if (first === undefined || rest.length > 0) {
    return refused(
      "attribute",
      place,
      "write tolerance as one or two numbers (reading `tolerance`)",
    );
  }

  const t0 = floatOrVariable(first, context, place);
  const t1 = floatOrVariable(second ?? first, context, place);
  if (!t0.ok) {
    return t0;
  }

  return t1.ok
    ? checked({
        includeLowerBound: lower.value,
        includeUpperBound: upper.value,
        tolerance: [t0.value, t1.value],
        toleranceMode: mode.value,
      })
    : t1;
};

/**
 * A `qti-equal`'s tolerance at run time.
 *
 * @param node - The `qti-equal`.
 * @param run - The run.
 * @returns `exact`, the tolerance, or `undefined` where a variable it names holds no number.
 */
const toleranceOf = (node: Node<"equal">, run: Run): Tolerance | "exact" | undefined => {
  if (node.toleranceMode === "exact" || node.tolerance === undefined) {
    return "exact";
  }

  const lower = floatAttribute(run, node.tolerance[0]);
  const upper = floatAttribute(run, node.tolerance[1]);

  return lower === undefined || upper === undefined
    ? undefined
    : {
        includeLower: node.includeLowerBound,
        includeUpper: node.includeUpperBound,
        lower: { base: "float", value: lower },
        mode: node.toleranceMode,
        upper: { base: "float", value: upper },
      };
};

/**
 * The comparison family's operators.
 */
export const comparisonOperators: OperatorTable<
  "duration-gte" | "duration-lt" | "equal" | "equal-rounded" | "gt" | "gte" | "lt" | "lte" | "match"
> = {
  "duration-gte": durationOrder("gte"),
  "duration-lt": durationOrder("lt"),
  equal: {
    arity: twoOperands,
    evaluate: (node, run) => {
      const tolerance = toleranceOf(node, run);

      return equalOf(tolerance, run.evaluate(node.operands[0]), run.evaluate(node.operands[1]));
    },
    read: equalAttributes,
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleNumber, place, singleBoolean),
  },
  "equal-rounded": {
    arity: twoOperands,
    evaluate: (node, run) =>
      equalRoundedOf(
        node.roundingMode,
        integerAttribute(run, node.figures),
        run.evaluate(node.operands[0]),
        run.evaluate(node.operands[1]),
      ),
    read: (element, context, place) =>
      roundingAttributes(element, context, place, "significantFigures"),
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, singleNumber, place, singleBoolean),
  },
  gt: inequalityOperator("gt"),
  gte: inequalityOperator("gte"),
  lt: inequalityOperator("lt"),
  lte: inequalityOperator("lte"),
  match: {
    arity: twoOperands,
    evaluate: (node, run) =>
      matchOf(run.evaluate(node.operands[0]), run.evaluate(node.operands[1])),
    read: noAttributes,
    typing: (operands, _attributes, place) => matchTyping(operands, place),
  },
};
