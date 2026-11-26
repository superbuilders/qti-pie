/**
 * The functions family: `qti-math-operator`, `qti-math-constant` and `qti-stats-operator`
 * (sections 2.11.3.39, 2.11.1.7 and 2.11.3.44).
 *
 * The mathematical functions are the host's `Math` functions, directly (D3: no pinned libm; the
 * package assumes Node). An argument outside a function's natural domain gives NULL, as a NaN
 * result does, and so does `ln` or `log` of 0, whose host value is -INF ("e.g. log(0) or asin(2)",
 * section 2.11.3.39); a reciprocal function gives NULL where its base function is 0 or -0 and 0
 * where it is an infinity; `floor`, `ceil` and `signum` give integers, NULL for an infinity or NaN
 * (reading `infinite-rounding-operand`). The statistics are computed exactly over the members'
 * binary values and rounded once: the mean and the variances are their exact values' nearest
 * doubles, the standard deviations the nearest double of the exact variance's square root.
 *
 * @module
 */
import type { MathOperatorName, StatsOperatorName, StaticType } from "#processing/ir.ts";
import { mathOperatorNames, statsOperatorNames } from "#processing/ir.ts";
import {
  addExact,
  exactOfFloat,
  exactOfInteger,
  exactSum,
  floatOfNumber,
  multiplyExact,
  nearestQuotient,
  nearestSquareRoot,
  negateExact,
} from "#processing/numbers.ts";
import type { Exact, NumberScalar } from "#processing/numbers.ts";
import {
  floatNull,
  floatValue,
  integerNull,
  integerValue,
  numberOf,
  numbersOf,
  valuesOf,
} from "#processing/operators/arithmetic.ts";
import { enumAttribute } from "#processing/operators/attributes.ts";
import {
  checked,
  noOperand,
  oneOperand,
  operandsTaken,
  refused,
  someOperands,
  typed,
} from "#processing/operators/operator.ts";
import type { Checked, OperandRule, OperatorTable } from "#processing/operators/operator.ts";
import type { Value } from "#processing/value.ts";

/**
 * A float function's result: NULL where it is NaN, the value outside every function's domain.
 *
 * @param float - The result.
 * @returns The single float, or NULL.
 */
const floatOrNull = (float: number): Value => (Number.isNaN(float) ? floatNull : floatValue(float));

/**
 * A reciprocal of a function's value: NULL where the value is 0 or -0, 0 where it is an infinity,
 * else its reciprocal (section 2.11.3.39).
 *
 * @param value - The base function's value.
 * @returns The reciprocal, NaN standing for NULL.
 */
const reciprocal = (value: number): number => (value === 0 ? Number.NaN : 1 / value);

/**
 * How a function maps its arguments: the first, and atan2's second, x.
 */
type Operation = (first: NumberScalar, second: NumberScalar | undefined) => Value;

/**
 * A float function of one argument.
 *
 * @param apply - The function.
 * @returns Its operation.
 */
const unary =
  (apply: (x: number) => number): Operation =>
  (first) =>
    floatOrNull(apply(floatOfNumber(first)));

/**
 * An integral function's operation: of an integer, its own rule; of a float, NULL for an infinity
 * or NaN, else the integer its rule gives.
 *
 * @param ofInteger - The rule over an integer.
 * @param ofFloat - The rule over a finite float, an integer-valued double.
 * @returns Its operation.
 */
const integral =
  (ofInteger: (integer: bigint) => bigint, ofFloat: (float: number) => number): Operation =>
  (first) => {
    if (first.base === "integer") {
      return integerValue(ofInteger(first.value));
    }

    return Number.isFinite(first.value) ? integerValue(BigInt(ofFloat(first.value))) : integerNull;
  };

/**
 * An integer's sign.
 *
 * @param integer - The integer.
 * @returns -1, 0 or 1.
 */
const signOf = (integer: bigint): bigint => {
  if (integer === 0n) {
    return 0n;
  }

  return integer > 0n ? 1n : -1n;
};

/**
 * Every function's operation by its name.
 */
type Operations = { readonly [N in MathOperatorName]: Operation };

/**
 * The functions of `qti-math-operator` (MathOperatorNameEnum).
 */
const operations: Operations = {
  abs: unary((x) => Math.abs(x)),
  acos: unary((x) => Math.acos(x)),
  acot: unary((x) => Math.atan(1 / x)),
  acsc: unary((x) => Math.asin(1 / x)),
  asec: unary((x) => Math.acos(1 / x)),
  asin: unary((x) => Math.asin(x)),
  atan: unary((x) => Math.atan(x)),
  atan2: (first, second) =>
    second === undefined
      ? floatNull
      : floatOrNull(Math.atan2(floatOfNumber(first), floatOfNumber(second))),
  ceil: integral(
    (integer) => integer,
    (float) => Math.ceil(float),
  ),
  cos: unary((x) => Math.cos(x)),
  cosh: unary((x) => Math.cosh(x)),
  cot: unary((x) => reciprocal(Math.tan(x))),
  coth: unary((x) => reciprocal(Math.tanh(x))),
  csc: unary((x) => reciprocal(Math.sin(x))),
  csch: unary((x) => reciprocal(Math.sinh(x))),
  exp: unary((x) => Math.exp(x)),
  floor: integral(
    (integer) => integer,
    (float) => Math.floor(float),
  ),
  ln: unary((x) => (x > 0 ? Math.log(x) : Number.NaN)),
  log: unary((x) => (x > 0 ? Math.log10(x) : Number.NaN)),
  sec: unary((x) => reciprocal(Math.cos(x))),
  sech: unary((x) => reciprocal(Math.cosh(x))),
  signum: integral(signOf, (float) => Math.sign(float)),
  sin: unary((x) => Math.sin(x)),
  sinh: unary((x) => Math.sinh(x)),
  tan: unary((x) => Math.tan(x)),
  tanh: unary((x) => Math.tanh(x)),
  toDegrees: unary((x) => x * (180 / Math.PI)),
  toRadians: unary((x) => x * (Math.PI / 180)),
};

/**
 * Whether a function gives an integer: floor, ceil and signum (section 2.11.3.39).
 *
 * @param name - The function.
 * @returns Whether its result is an integer.
 */
const integerResult = (name: MathOperatorName): boolean =>
  name === "ceil" || name === "floor" || name === "signum";

/**
 * The value of `qti-math-operator`: its function of its single numbers (section 2.11.3.39).
 *
 * @param name - The function.
 * @param values - The operands' values: two for atan2, the first its y, one for the rest.
 * @returns The single float, or the single integer of floor, ceil and signum; NULL where an operand
 *   is NULL or no single number, or the argument is outside the function's domain.
 */
export const mathOf = (name: MathOperatorName, values: readonly Value[]): Value => {
  const [first, second] = values;
  const x = first === undefined ? undefined : numberOf(first);
  if (x === undefined) {
    return integerResult(name) ? integerNull : floatNull;
  }

  return operations[name](x, second === undefined ? undefined : numberOf(second));
};

/**
 * The value of `qti-math-constant`: the double nearest π or e (section 2.11.1.7).
 *
 * @param name - The constant.
 * @returns The single float.
 */
export const constantOf = (name: "e" | "pi"): Value => floatValue(name === "pi" ? Math.PI : Math.E);

/**
 * A statistic of finite members, computed exactly and rounded once.
 *
 * @param name - The statistic.
 * @param members - The members, one or more, each a finite double's exact value.
 * @returns The statistic; `undefined` for a spread of fewer than two members.
 */
const exactStatistic = (name: StatsOperatorName, members: readonly Exact[]): number | undefined => {
  const count = BigInt(members.length);
  let sum = exactOfInteger(0n);
  let squares = exactOfInteger(0n);
  for (const member of members) {
    sum = addExact(sum, member);
    squares = addExact(squares, multiplyExact(member, member));
  }

  if (name === "mean") {
    return nearestQuotient(sum, count);
  }

  if (count < 2n) {
    return undefined;
  }

  const spread = addExact(
    multiplyExact(exactOfInteger(count), squares),
    negateExact(multiplyExact(sum, sum)),
  );
  switch (name) {
    case "popVariance": {
      return nearestQuotient(spread, count * count);
    }
    case "sampleVariance": {
      return nearestQuotient(spread, count * (count - 1n));
    }
    case "popSD": {
      return nearestSquareRoot(spread, count * count);
    }
    case "sampleSD": {
      return nearestSquareRoot(spread, count * (count - 1n));
    }
  }
};

/**
 * The value of `qti-stats-operator`: the statistic of a container's numbers (section 2.11.3.44,
 * StatsOperatorEnum), each integer its nearest finite double (reading `integer-unbounded`). The
 * variances and deviations need two members or more. An infinite member leaves only the mean,
 * IEEE's, defined.
 *
 * @param name - The statistic.
 * @param value - The operand's value.
 * @returns The single float; NULL where the operand is NULL, no container of numbers, or holds a
 *   NaN, or the statistic has no value.
 */
export const statisticOf = (name: StatsOperatorName, value: Value): Value => {
  const numbers =
    value.kind === "multiple" || value.kind === "ordered" ? numbersOf(value) : undefined;
  if (numbers === undefined) {
    return floatNull;
  }

  const floats = numbers.map(floatOfNumber);
  if (floats.some((float) => !Number.isFinite(float))) {
    return name === "mean" ? floatOrNull(exactSum(floats) / floats.length) : floatNull;
  }

  const statistic = exactStatistic(name, floats.map(exactOfFloat));

  return statistic === undefined ? floatNull : floatValue(statistic);
};

/**
 * A single numeric operand.
 */
const singleNumber: OperandRule = { bases: ["float", "integer"], cardinalities: ["single"] };

/**
 * A container of numbers.
 */
const numericContainer: OperandRule = {
  bases: ["float", "integer"],
  cardinalities: ["multiple", "ordered"],
};

/**
 * The single float static type.
 */
const floatType: StaticType = typed({ base: "float", cardinality: "single" });

/**
 * The functions family's operators.
 */
export const functionsOperators: OperatorTable<
  "math-constant" | "math-operator" | "stats-operator"
> = {
  "math-constant": {
    arity: noOperand,
    evaluate: (node) => constantOf(node.name),
    read: (element, _context, place) => {
      const name = enumAttribute(element, "name", ["e", "pi"] as const, undefined, place);

      return name.ok ? checked({ name: name.value }) : name;
    },
    typing: () => checked(floatType),
  },
  "math-operator": {
    arity: someOperands,
    evaluate: (node, run) => mathOf(node.name, valuesOf(node.operands, run)),
    read: (element, _context, place) => {
      const name = enumAttribute(element, "name", mathOperatorNames, undefined, place);

      return name.ok ? checked({ name: name.value }) : name;
    },
    typing: (operands, { name }, place): Checked<StaticType> => {
      const expected = name === "atan2" ? 2 : 1;
      if (operands.length !== expected) {
        return refused(
          "arity",
          place,
          `write ${String(expected)} operand${expected === 1 ? "" : "s"} for ${name} (reading math-operator-arity)`,
        );
      }

      return operandsTaken(
        operands,
        singleNumber,
        place,
        name === "ceil" || name === "floor" || name === "signum"
          ? typed({ base: "integer", cardinality: "single" })
          : floatType,
      );
    },
  },
  "stats-operator": {
    arity: oneOperand,
    evaluate: (node, run) => statisticOf(node.name, run.evaluate(node.operands[0])),
    read: (element, _context, place) => {
      const name = enumAttribute(element, "name", statsOperatorNames, undefined, place);

      return name.ok ? checked({ name: name.value }) : name;
    },
    typing: (operands, _attributes, place) =>
      operandsTaken(operands, numericContainer, place, floatType),
  },
};
