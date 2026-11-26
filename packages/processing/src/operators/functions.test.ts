import { drawn, explore } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { array, int } from "@bjornpagen/testing/gen";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Formatter } from "effect";
import type {
  Expression,
  MathOperatorName,
  StaticType,
  StatsOperatorName,
} from "#processing/ir.ts";
import { functionsOperators, mathOf, statisticOf } from "#processing/operators/functions.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import { literal, nodeOf, testRun } from "#processing/test/run.ts";
import { container, nullOf, single } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";

const operators = Object.freeze({ ...functionsOperators, ...valuesOperators });

/**
 * The work one case may do.
 */
const caseHang = Duration.seconds(30);

/**
 * How many rotating cases each search compares beside its witnesses.
 */
const CASES = 1000;

const floatNull = nullOf({ base: "float", cardinality: "single" });

const integerNull = nullOf({ base: "integer", cardinality: "single" });

const floatType: StaticType = { kind: "typed", type: { base: "float", cardinality: "single" } };

const { run } = testRun(operators, {}, {});

/**
 * A math operator's value over floats.
 *
 * @param name - The function.
 * @param arguments_ - Its arguments.
 * @returns Its value.
 */
const math = (name: MathOperatorName, ...arguments_: readonly number[]): Value =>
  mathOf(
    name,
    arguments_.map((value) => single("float", value)),
  );

/**
 * A statistic of integers.
 *
 * @param name - The statistic.
 * @param members - The members.
 * @returns Its value.
 */
const statisticOfIntegers = (name: StatsOperatorName, members: readonly bigint[]): Value =>
  statisticOf(name, container("ordered", "integer", members));

/**
 * A statistic of floats.
 *
 * @param name - The statistic.
 * @param members - The members.
 * @returns Its value.
 */
const statisticOfFloats = (name: StatsOperatorName, members: readonly number[]): Value =>
  statisticOf(name, container("multiple", "float", members));

describe("the functions family's laws", () => {
  it.effect(
    "the mean and the variances of integers are their exact rationals rounded once (StatsOperatorEnum, D2)",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn(array(int(-1_000_000, 1_000_000), { max: 12, min: 1 })),
            kept: [],
            literal: (members) => Formatter.format(members),
            oracle: {
              kind: "second-implementation",
              name: "the rationals over bigints, divided once by IEEE's correctly rounded division",
            },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/functions/statistics",
          },
          (drawnMembers) =>
            Effect.sync(() => {
              const members = drawnMembers.map(BigInt);
              const count = BigInt(members.length);
              let sum = 0n;
              let squares = 0n;
              for (const member of members) {
                sum += member;
                squares += member * member;
              }

              assert.deepStrictEqual(
                statisticOfIntegers("mean", members),
                single("float", Number(sum) / Number(count)),
              );

              const spread = count * squares - sum * sum;
              assert.deepStrictEqual(
                statisticOfIntegers("popVariance", members),
                count < 2n ? floatNull : single("float", Number(spread) / Number(count * count)),
              );
              assert.deepStrictEqual(
                statisticOfIntegers("sampleVariance", members),
                count < 2n
                  ? floatNull
                  : single("float", Number(spread) / Number(count * (count - 1n))),
              );
            }),
        ),
      ),
  );
});

describe("the functions family's stated values", () => {
  it("floor, ceil and signum give integers, NULL for an infinity or NaN (reading `infinite-rounding-operand`)", () => {
    assert.deepStrictEqual(math("floor", -2.5), single("integer", -3n));
    assert.deepStrictEqual(math("ceil", -2.5), single("integer", -2n));
    assert.deepStrictEqual(math("floor", Number.POSITIVE_INFINITY), integerNull);
    assert.deepStrictEqual(math("signum", -0), single("integer", 0n));
    assert.deepStrictEqual(math("signum", Number.NaN), integerNull);
    assert.deepStrictEqual(
      mathOf("floor", [single("integer", 10n ** 30n)]),
      single("integer", 10n ** 30n),
    );
  });

  it("an argument outside the domain gives NULL: log(0), ln(-1), asin(2), and a reciprocal of 0 (§2.11.3.39)", () => {
    assert.deepStrictEqual(math("log", 0), floatNull);
    assert.deepStrictEqual(math("ln", -1), floatNull);
    assert.deepStrictEqual(math("asin", 2), floatNull);
    assert.deepStrictEqual(math("cot", 0), floatNull);
    assert.deepStrictEqual(math("csch", -0), floatNull);
    assert.deepStrictEqual(math("sec", Number.NaN), floatNull);
    assert.deepStrictEqual(math("log", 1000), single("float", 3));
  });

  it("a reciprocal of an infinity is 0, atan2 reads its first operand as y, and abs of an integer is a float (§2.11.3.39)", () => {
    assert.deepStrictEqual(math("coth", Number.POSITIVE_INFINITY), single("float", 1));
    assert.deepStrictEqual(math("sech", Number.POSITIVE_INFINITY), single("float", 0));
    assert.deepStrictEqual(math("atan2", 1, 0), single("float", Math.PI / 2));
    assert.deepStrictEqual(math("atan2", 0, -1), single("float", Math.PI));
    assert.deepStrictEqual(
      math("atan2", Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
      single("float", -Math.PI / 4),
    );
    assert.deepStrictEqual(mathOf("abs", [single("integer", -3n)]), single("float", 3));
    assert.deepStrictEqual(math("toDegrees", Math.PI), single("float", 180));
  });

  it("a statistic is NULL over a NaN, a variance over fewer than two members, and the mean of floats one rounding (StatsOperatorEnum)", () => {
    assert.deepStrictEqual(statisticOfFloats("mean", [0.1, 0.2, 0.3]), single("float", 0.2));
    assert.deepStrictEqual(
      statisticOfFloats("popSD", [2, 4, 4, 4, 5, 5, 7, 9]),
      single("float", 2),
    );
    assert.deepStrictEqual(statisticOfFloats("sampleSD", [1]), floatNull);
    assert.deepStrictEqual(statisticOfFloats("popVariance", [1]), floatNull);
    assert.deepStrictEqual(statisticOfFloats("mean", [1, Number.NaN]), floatNull);
    assert.deepStrictEqual(
      statisticOfFloats("mean", [1, Number.POSITIVE_INFINITY]),
      single("float", Number.POSITIVE_INFINITY),
    );
    assert.deepStrictEqual(
      statisticOfFloats("sampleVariance", [1, Number.POSITIVE_INFINITY]),
      floatNull,
    );
    assert.deepStrictEqual(
      statisticOf("mean", nullOf({ base: "float", cardinality: "multiple" })),
      floatNull,
    );
  });

  it("math-constant is the double nearest π or e (§2.11.1.7)", () => {
    assert.deepStrictEqual(
      run.evaluate(nodeOf("math-constant", [], { name: "pi" }, floatType)),
      single("float", Math.PI),
    );
    assert.deepStrictEqual(
      run.evaluate(nodeOf("math-constant", [], { name: "e" }, floatType)),
      single("float", Math.E),
    );
  });
});

describe("the functions family's typing", () => {
  it("atan2 takes two operands and every other function one (reading `math-operator-arity`)", () => {
    const two: readonly [Expression, Expression] = [
      literal(single("float", 1)),
      literal(single("float", 2)),
    ];

    assert.isTrue(functionsOperators["math-operator"].typing(two, { name: "atan2" }, 0).ok);
    assert.isFalse(functionsOperators["math-operator"].typing(two, { name: "sin" }, 0).ok);
    assert.isFalse(functionsOperators["math-operator"].typing([two[0]], { name: "atan2" }, 0).ok);
    assert.deepStrictEqual(
      functionsOperators["math-operator"].typing([two[0]], { name: "floor" }, 0),
      {
        ok: true,
        value: { kind: "typed", type: { base: "integer", cardinality: "single" } },
      },
    );
  });
});
