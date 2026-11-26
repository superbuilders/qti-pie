import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { bytes, int, map } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Formatter } from "effect";
import type { Expression, StaticType } from "#processing/ir.ts";
import {
  addExact,
  compareExact,
  exactOfFloat,
  exactOfInteger,
  flooredQuotient,
} from "#processing/numbers.ts";
import { arithmeticOperators } from "#processing/operators/arithmetic.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import {
  element,
  literal,
  nodeOf,
  ownVariable,
  testContext,
  testRun,
} from "#processing/test/run.ts";
import { container, nullOf, single } from "#processing/value.ts";
import type { Null, Single, Value } from "#processing/value.ts";

const operators = Object.freeze({ ...arithmeticOperators, ...valuesOperators });

/**
 * The work one case may do.
 */
const caseHang = Duration.seconds(30);

/**
 * How many rotating cases each search compares beside its witnesses.
 */
const CASES = 1000;

const floatType: StaticType = { kind: "typed", type: { base: "float", cardinality: "single" } };

const integerType: StaticType = { kind: "typed", type: { base: "integer", cardinality: "single" } };

const floatNull: Null = nullOf({ base: "float", cardinality: "single" });

const integerNull: Null = nullOf({ base: "integer", cardinality: "single" });

/**
 * A single integer's literal.
 *
 * @param value - The integer.
 * @returns The `qti-base-value`.
 */
const integer = (value: bigint): Expression => literal(single("integer", value));

/**
 * A single float's literal.
 *
 * @param value - The float.
 * @returns The `qti-base-value`.
 */
const float = (value: number): Expression => literal(single("float", value));

/**
 * A NULL literal of a single type.
 *
 * @param value - The NULL.
 * @returns The `qti-base-value`.
 */
const nothing = (value: Null): Expression => literal(value);

/**
 * A present value's type.
 *
 * @param value - The value.
 * @returns Its type.
 */
const valueTypeOfPresent = (value: Exclude<Value, Null>) =>
  value.kind === "record"
    ? ({ cardinality: "record" } as const)
    : ({ base: value.base, cardinality: value.kind } as const);

/**
 * A variable's read, for a container operand: `qti-variable` of a stated outcome.
 *
 * @param identifier - The outcome.
 * @param value - Its value.
 * @returns The expression.
 */
const read = (identifier: string, value: Value): Expression => {
  const type = value.kind === "null" ? value.type : valueTypeOfPresent(value);

  return nodeOf(
    "variable",
    [],
    { variable: ownVariable(identifier, type) },
    { kind: "typed", type },
  );
};

const { recorder, run } = testRun(
  operators,
  {
    bag: { value: container("multiple", "integer", [1n, 2n, 2n]) },
    floats: { value: container("ordered", "float", [0.1, 0.2]) },
    places: { value: single("integer", 2n) },
  },
  {},
);

/**
 * Evaluate an expression in the test run.
 *
 * @param expression - The expression.
 * @returns Its value.
 */
const valueOf = (expression: Expression): Value => run.evaluate(expression);

/**
 * A `qti-divide`'s value.
 *
 * @param x - The dividend.
 * @param y - The divisor.
 * @returns The quotient.
 */
const divide = (x: Expression, y: Expression): Value =>
  valueOf(nodeOf("divide", [x, y], {}, floatType));

/**
 * A `qti-power`'s value.
 *
 * @param x - The base.
 * @param y - The exponent.
 * @returns The power.
 */
const power = (x: number, y: number): Value =>
  valueOf(nodeOf("power", [float(x), float(y)], {}, floatType));

/**
 * A `qti-sum`'s static type over operands.
 *
 * @param operands - The operands.
 * @returns The typing's verdict.
 */
const sumTyping = (operands: readonly [Expression, ...Expression[]]) =>
  arithmeticOperators.sum.typing(operands, {}, 0);

/**
 * Any integer of up to 128 bits, either sign.
 */
const anyInteger: Gen<bigint> = map(bytes({ max: 16, min: 1 }), (octets) => {
  let magnitude = 0n;
  for (const octet of octets) {
    magnitude = magnitude * 256n + BigInt(octet);
  }

  return (octets[0] ?? 0) % 2 === 0 ? magnitude : -magnitude;
});

/**
 * Any finite double, every bit pattern alike but NaN and the infinities, which are drawn as 0.
 */
const finiteDouble: Gen<number> = map(bytes({ max: 8, min: 8 }), (eight) => {
  const drawnFloat = new DataView(eight.buffer, eight.byteOffset, 8).getFloat64(0);

  return Number.isFinite(drawnFloat) ? drawnFloat : 0;
});

describe("the arithmetic family's laws", () => {
  it.effect(
    "integer-divide floors and integer-modulus is its remainder: x = q·y + r, r of y's sign and below |y| (§2.11.3.24, §2.11.3.25)",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn((source): readonly [bigint, bigint] => [
              anyInteger(source),
              anyInteger(source),
            ]),
            kept: [],
            literal: (pair) => Formatter.format(pair),
            oracle: { kind: "specification", name: "floored division's defining law" },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/arithmetic/floored-division",
          },
          ([x, y]) =>
            Effect.sync(() => {
              const operands = [integer(x), integer(y)] as const;
              const quotient = valueOf(nodeOf("integer-divide", operands, {}, integerType));
              const remainder = valueOf(nodeOf("integer-modulus", operands, {}, integerType));
              if (y === 0n) {
                assert.deepStrictEqual(quotient, integerNull);
                assert.deepStrictEqual(remainder, integerNull);

                return;
              }

              assert.isTrue(quotient.kind === "single" && quotient.base === "integer");
              assert.isTrue(remainder.kind === "single" && remainder.base === "integer");

              const q =
                quotient.kind === "single" && quotient.base === "integer" ? quotient.value : 0n;
              const r =
                remainder.kind === "single" && remainder.base === "integer" ? remainder.value : 0n;
              assert.strictEqual(q * y + r, x);
              assert.isTrue(
                r === 0n || r < 0n === y < 0n,
                "the remainder takes the divisor's sign",
              );
              assert.isTrue((r < 0n ? -r : r) < (y < 0n ? -y : y), "the remainder is below |y|");
            }),
        ),
      ),
  );

  it.effect(
    "round gives the n with x in [n − 0.5, n + 0.5) and truncate the n toward zero, by exact value (§2.11.3.37, §2.11.3.38)",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn((source): number => finiteDouble(source) / 2 ** int(0, 1060)(source)),
            kept: [],
            literal: (x) => Formatter.format(x),
            oracle: { kind: "specification", name: "the defining intervals, compared exactly" },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/arithmetic/round-truncate",
          },
          (x) =>
            Effect.sync(() => {
              const rounded = valueOf(nodeOf("round", [float(x)], {}, integerType));
              const truncated = valueOf(nodeOf("truncate", [float(x)], {}, integerType));
              assert.isTrue(rounded.kind === "single" && rounded.base === "integer");
              assert.isTrue(truncated.kind === "single" && truncated.base === "integer");

              const n =
                rounded.kind === "single" && rounded.base === "integer" ? rounded.value : 0n;
              const t =
                truncated.kind === "single" && truncated.base === "integer" ? truncated.value : 0n;
              const exact = exactOfFloat(x);
              const twice = { exponent: exact.exponent + 1, significand: exact.significand };
              assert.isTrue(compareExact(exactOfInteger(2n * n - 1n), twice) <= 0, "n − 0.5 ≤ x");
              assert.isTrue(compareExact(twice, exactOfInteger(2n * n + 1n)) < 0, "x < n + 0.5");

              const magnitude = {
                exponent: exact.exponent,
                significand: exact.significand < 0n ? -exact.significand : exact.significand,
              };
              const tMagnitude = t < 0n ? -t : t;
              assert.isTrue(compareExact(exactOfInteger(tMagnitude), magnitude) <= 0, "|t| ≤ |x|");
              assert.isTrue(
                compareExact(magnitude, exactOfInteger(tMagnitude + 1n)) < 0,
                "|x| < |t| + 1",
              );
              assert.isTrue(t === 0n || t < 0n === x < 0, "t keeps x's sign");
            }),
        ),
      ),
  );

  it.effect(
    "round-to of a non-negative double to n decimal places is ECMAScript's toFixed of it (reading `format-float-rounding`)",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn((source): readonly [number, number] => [
              Math.abs(finiteDouble(source)) % 1e20,
              int(0, 20)(source),
            ]),
            kept: [],
            literal: (pair) => Formatter.format(pair),
            oracle: {
              kind: "second-implementation",
              name: "Number.prototype.toFixed, which reading `format-float-rounding` names",
            },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/arithmetic/round-to",
          },
          ([x, places]) =>
            Effect.sync(() => {
              const node = nodeOf(
                "round-to",
                [float(x)],
                {
                  figures: { kind: "literal", value: BigInt(places) },
                  roundingMode: "decimalPlaces",
                },
                floatType,
              );
              assert.deepStrictEqual(valueOf(node), single("float", Number(x.toFixed(places))));
            }),
        ),
      ),
  );

  it.effect("gcd divides every operand and gcd · lcm is |a · b| (§2.11.3.11, §2.11.3.12)", (ctx) =>
    searched(
      ctx,
      explore(
        {
          caseHang,
          coverage: noCoverage,
          draw: drawn((source): readonly [bigint, bigint] => [
            anyInteger(source),
            anyInteger(source),
          ]),
          kept: [],
          literal: (pair) => Formatter.format(pair),
          oracle: { kind: "universal", name: "the divisor and multiple laws" },
          runs: CASES,
          shrink: completeShrink,
          steerEvery: 16,
          suite: "processing/arithmetic/gcd-lcm",
        },
        ([a, b]) =>
          Effect.sync(() => {
            const operands = [integer(a), integer(b)] as const;
            const divisor = valueOf(nodeOf("gcd", operands, {}, integerType));
            const multiple = valueOf(nodeOf("lcm", operands, {}, integerType));
            const d = divisor.kind === "single" && divisor.base === "integer" ? divisor.value : -1n;
            const m =
              multiple.kind === "single" && multiple.base === "integer" ? multiple.value : -1n;
            assert.isTrue(d >= 0n && m >= 0n);
            assert.isTrue(d === 0n ? a === 0n && b === 0n : a % d === 0n && b % d === 0n);

            const product = a * b;
            assert.strictEqual(d * m, product < 0n ? -product : product);
          }),
      ),
    ),
  );
});

/**
 * The double one unit in the last place from a finite double, toward +INF or -INF: its bit pattern
 * stepped by one, so every neighbour of an edge is reached exactly.
 *
 * @param x - The double, finite.
 * @param toward - The direction.
 * @returns The neighbour.
 */
const neighbour = (x: number, toward: 1 | -1): number => {
  if (x === 0) {
    return toward * Number.MIN_VALUE;
  }

  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, x);

  const step = x > 0 === toward > 0 ? 1n : -1n;
  view.setBigUint64(0, view.getBigUint64(0) + step);

  return view.getFloat64(0);
};

/**
 * Round's and truncate's edge space, every case a finite double: for n = ±2^k and ±(2^(k+1) − 1
 * ulp), k from 0 to 1023 (so 2^31, 2^52, 2^53, 2^63, MAX_SAFE_INTEGER and the largest finite double
 * among them), and n = ±0, each of n, n − 0.5 and n + 0.5 and its two neighbours (so -0.5 and
 * 0.49999999999999994 among them).
 */
const roundingEdges: Gen<number> = (source) => {
  const k = int(-1, 1023)(source);
  const below = int(0, 1)(source) === 1;
  const sign = int(0, 1)(source) === 1 ? -1 : 1;
  const half = [0, -0.5, 0.5][int(0, 2)(source)] ?? 0;
  const step = int(-1, 1)(source);
  const twoToK = k === -1 ? 0 : 2 ** k;
  const top = k === 1023 ? Number.MAX_VALUE : neighbour(2 * twoToK, -1);
  const n = sign * (below && k >= 0 ? top : twoToK);
  const x = n + half;
  const edge = step === 0 || !Number.isFinite(x) ? x : neighbour(x, step === 1 ? 1 : -1);

  return Number.isFinite(edge) ? edge : n;
};

/**
 * ⌊significand × 2^exponent⌋.
 *
 * @param significand - The significand.
 * @param exponent - The power of two.
 * @returns The floor.
 */
const flooredScaled = (significand: bigint, exponent: number): bigint =>
  exponent >= 0
    ? significand * 2n ** BigInt(exponent)
    : flooredQuotient(significand, 2n ** BigInt(-exponent));

/**
 * The integer QTI's round gives a finite double, by its definition over the exact value: the n with
 * x in [n − 0.5, n + 0.5), that is ⌊x + 1/2⌋ = ⌊(2x + 1) / 2⌋.
 *
 * @param x - The double.
 * @returns The integer.
 */
const roundedExactly = (x: number): bigint => {
  const exact = exactOfFloat(x);
  const twiceAndOne = addExact(
    { exponent: exact.exponent + 1, significand: exact.significand },
    exactOfInteger(1n),
  );

  return flooredScaled(twiceAndOne.significand, twiceAndOne.exponent - 1);
};

/**
 * The integer QTI's truncate gives a finite double: its exact value toward zero.
 *
 * @param x - The double.
 * @returns The integer.
 */
const truncatedExactly = (x: number): bigint => {
  const exact = exactOfFloat(x);

  return exact.exponent >= 0
    ? exact.significand * 2n ** BigInt(exact.exponent)
    : exact.significand / 2n ** BigInt(-exact.exponent);
};

describe("the arithmetic family's stated values", () => {
  it("integer-divide floors and integer-modulus follows it, where JavaScript truncates (G3, primer's defect)", () => {
    const divided = (x: bigint, y: bigint, kind: "integer-divide" | "integer-modulus"): Value =>
      valueOf(nodeOf(kind, [integer(x), integer(y)], {}, integerType));

    assert.deepStrictEqual(divided(-7n, 2n, "integer-divide"), single("integer", -4n));
    assert.deepStrictEqual(divided(-7n, 2n, "integer-modulus"), single("integer", 1n));
    assert.deepStrictEqual(divided(7n, -2n, "integer-modulus"), single("integer", -1n));
    assert.deepStrictEqual(divided(7n, 0n, "integer-divide"), integerNull);
    assert.deepStrictEqual(
      valueOf(nodeOf("integer-divide", [nothing(integerNull), integer(2n)], {}, integerType)),
      integerNull,
    );
  });

  it.effect(
    "round and truncate hold to their definitions over the exact value at every edge, 2^52 rounding to itself (§2.11.3.37, §2.11.3.38)",
    (ctx) =>
      searched(
        ctx,
        exhaust(
          {
            box: "n = ±0, ±2^k and ±(2^(k+1) − 1 ulp) for k ≤ 1023, at n, n ± 0.5 and every neighbour",
            caseHang,
            coverage: noCoverage,
            generator: roundingEdges,
            literal: (x) => Formatter.format(x),
            oracle: {
              kind: "specification",
              name: "⌊x + 1/2⌋ and x toward zero over the exact value",
            },
            suite: "processing/arithmetic/rounding-edges",
          },
          (x) =>
            Effect.sync(() => {
              assert.deepStrictEqual(
                valueOf(nodeOf("round", [float(x)], {}, integerType)),
                single("integer", roundedExactly(x)),
                `round(${String(x)})`,
              );
              assert.deepStrictEqual(
                valueOf(nodeOf("truncate", [float(x)], {}, integerType)),
                single("integer", truncatedExactly(x)),
                `truncate(${String(x)})`,
              );
            }),
        ),
      ),
  );

  it("round takes 2^52, an even integer past which floor + 0.5 ties back to it, to itself (§2.11.3.37)", () => {
    assert.deepStrictEqual(
      valueOf(nodeOf("round", [float(2 ** 52)], {}, integerType)),
      single("integer", 4_503_599_627_370_496n),
    );
  });

  it("round takes −6.5 to −6 and 6.5 to 7, an infinity or NaN to NULL (§2.11.3.37, reading `infinite-rounding-operand`)", () => {
    const rounded = (x: number): Value => valueOf(nodeOf("round", [float(x)], {}, integerType));

    assert.deepStrictEqual(rounded(-6.5), single("integer", -6n));
    assert.deepStrictEqual(rounded(6.5), single("integer", 7n));
    assert.deepStrictEqual(rounded(0.5 - 2 ** -54), single("integer", 0n));
    assert.deepStrictEqual(rounded(Number.POSITIVE_INFINITY), integerNull);
    assert.deepStrictEqual(rounded(Number.NaN), integerNull);
    assert.deepStrictEqual(
      valueOf(nodeOf("truncate", [float(-6.8)], {}, integerType)),
      single("integer", -6n),
    );
    assert.deepStrictEqual(
      valueOf(nodeOf("truncate", [float(Number.NEGATIVE_INFINITY)], {}, integerType)),
      integerNull,
    );
  });

  it("divide and power give NULL for a zero divisor and for any result that is no finite float (§2.11.3.19, §2.11.3.31)", () => {
    assert.deepStrictEqual(divide(integer(1n), integer(4n)), single("float", 0.25));
    assert.deepStrictEqual(divide(float(1), float(-0)), floatNull);
    assert.deepStrictEqual(divide(float(Number.POSITIVE_INFINITY), float(2)), floatNull);
    assert.deepStrictEqual(divide(float(1e308), float(1e-308)), floatNull);
    assert.deepStrictEqual(power(-8, 1 / 3), floatNull);
    assert.deepStrictEqual(power(10, 400), floatNull);
    assert.deepStrictEqual(power(2, 10), single("float", 1024));
  });

  it("sum is integer over integers alone, exact past 2^53, and a float sum is one rounding of the exact total (reading `integer-unbounded`, D2)", () => {
    assert.deepStrictEqual(
      valueOf(nodeOf("sum", [integer(9_007_199_254_740_993n), integer(1n)], {}, integerType)),
      single("integer", 9_007_199_254_740_994n),
    );
    assert.deepStrictEqual(
      valueOf(
        nodeOf(
          "sum",
          [read("floats", container("ordered", "float", [0.1, 0.2])), float(0.3)],
          {},
          floatType,
        ),
      ),
      single("float", 0.6),
    );
    assert.deepStrictEqual(
      valueOf(
        nodeOf(
          "sum",
          [read("bag", container("multiple", "integer", [1n, 2n, 2n])), integer(1n)],
          {},
          integerType,
        ),
      ),
      single("integer", 6n),
    );
    assert.deepStrictEqual(
      valueOf(nodeOf("sum", [integer(1n), nothing(integerNull)], {}, integerType)),
      integerNull,
      "a NULL operand gives the NULL of the sum's own type",
    );
  });

  it("min and max are integer over integers, float otherwise, and NULL over a NaN (§2.11.3.13, §2.11.3.14)", () => {
    assert.deepStrictEqual(
      valueOf(nodeOf("min", [integer(3n), integer(-2n)], {}, integerType)),
      single("integer", -2n),
    );
    assert.deepStrictEqual(
      valueOf(nodeOf("max", [integer(3n), float(2.5)], {}, floatType)),
      single("float", 3),
    );
    assert.deepStrictEqual(
      valueOf(nodeOf("max", [float(Number.NaN), float(2.5)], {}, floatType)),
      floatNull,
    );
  });

  it("gcd of 0s is 0, gcd(0, n) is |n|, lcm with a 0 is 0, and integer-to-float of an integer past the double range is the largest float (§2.11.3.11, §2.11.3.12, reading `integer-unbounded`)", () => {
    assert.deepStrictEqual(
      valueOf(nodeOf("gcd", [integer(0n), integer(0n)], {}, integerType)),
      single("integer", 0n),
    );
    assert.deepStrictEqual(
      valueOf(nodeOf("gcd", [integer(0n), integer(-12n)], {}, integerType)),
      single("integer", 12n),
    );
    assert.deepStrictEqual(
      valueOf(nodeOf("lcm", [integer(4n), integer(0n)], {}, integerType)),
      single("integer", 0n),
    );
    assert.deepStrictEqual(
      valueOf(nodeOf("integer-to-float", [integer(10n ** 400n)], {}, floatType)),
      single("float", Number.MAX_VALUE),
    );
  });

  it("round-to reads the deciding digit of the double's exact decimal, and a variable's figures at run time (reading `format-float-rounding`)", () => {
    const roundTo = (
      x: number,
      figures: bigint,
      mode: "decimalPlaces" | "significantFigures",
    ): Value =>
      valueOf(
        nodeOf(
          "round-to",
          [float(x)],
          { figures: { kind: "literal", value: figures }, roundingMode: mode },
          floatType,
        ),
      );

    assert.deepStrictEqual(roundTo(0.175, 2n, "decimalPlaces"), single("float", 0.17));
    assert.deepStrictEqual(roundTo(0.125, 2n, "decimalPlaces"), single("float", 0.13));
    assert.deepStrictEqual(roundTo(-0.125, 2n, "decimalPlaces"), single("float", -0.13));
    assert.deepStrictEqual(roundTo(1.005, 3n, "significantFigures"), single("float", 1));
    assert.deepStrictEqual(roundTo(1234.5, 2n, "significantFigures"), single("float", 1200));
    assert.deepStrictEqual(
      roundTo(Number.NEGATIVE_INFINITY, 2n, "decimalPlaces"),
      single("float", Number.NEGATIVE_INFINITY),
    );
    assert.deepStrictEqual(
      roundTo(Number.MAX_VALUE, 1n, "significantFigures"),
      single("float", Number.MAX_VALUE),
    );
    assert.deepStrictEqual(roundTo(Number.NaN, 2n, "decimalPlaces"), floatNull);
    assert.deepStrictEqual(
      valueOf(
        nodeOf(
          "round-to",
          [float(2.675)],
          {
            figures: {
              kind: "variable",
              variable: ownVariable("places", { base: "integer", cardinality: "single" }),
            },
            roundingMode: "decimalPlaces",
          },
          floatType,
        ),
      ),
      single("float", 2.67),
    );
  });

  it("a computed integer past 1,000,000 bits fails the run, computation-bound, and gives NULL (reading `engine-size-limit`)", () => {
    const failures = recorder.failures.length;
    const huge = integer(2n ** 600_000n);
    const product = valueOf(nodeOf("product", [huge, huge], {}, integerType));
    assert.deepStrictEqual(product, integerNull);
    assert.deepStrictEqual(recorder.failures.slice(failures), [
      { bound: "integer-bits", kind: "computation-bound", place: 0 },
    ]);
  });
});

describe("the arithmetic family's typing and attributes", () => {
  const context = testContext({ declared: { places: { base: "integer", cardinality: "single" } } });

  it("types sum integer over integers, float where a float meets them, and refuses a string", () => {
    assert.deepStrictEqual(sumTyping([integer(1n), integer(2n)]), { ok: true, value: integerType });
    assert.deepStrictEqual(sumTyping([integer(1n), float(2)]), { ok: true, value: floatType });
    assert.isFalse(sumTyping([integer(1n), literal(single("boolean", true) satisfies Single)]).ok);
  });

  it("round-to requires its rounding mode, equal-rounded's figures at least 1 under significant figures (reading `rounding-figures`)", () => {
    assert.isFalse(
      arithmeticOperators["round-to"].read(
        element("qti-round-to", { figures: "2" }, []),
        context,
        0,
      ).ok,
    );
    assert.isFalse(
      arithmeticOperators["round-to"].read(
        element("qti-round-to", { figures: "0", "rounding-mode": "significantFigures" }, []),
        context,
        0,
      ).ok,
    );
    assert.deepStrictEqual(
      arithmeticOperators["round-to"].read(
        element("qti-round-to", { figures: "places", "rounding-mode": "decimalPlaces" }, []),
        context,
        0,
      ),
      {
        ok: true,
        value: {
          figures: {
            kind: "variable",
            variable: ownVariable("places", { base: "integer", cardinality: "single" }),
          },
          roundingMode: "decimalPlaces",
        },
      },
    );
  });
});
