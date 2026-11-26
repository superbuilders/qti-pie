import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { noCoverage, requiredInSpace } from "@bjornpagen/testing/features";
import { bytes, element, int, map } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Formatter } from "effect";
import {
  addExact,
  compareExact,
  decimalOfExact,
  exactOfFloat,
  exactOfInteger,
  exactSum,
  floatOfDecimal,
  multiplyExact,
  nearestFloat,
  nearestQuotient,
  nearestSquareRoot,
  orderOfNumbers,
  roundDecimal,
  toFloat,
} from "#processing/numbers.ts";

/**
 * The work one case may do: a few bigint operations on a thousand bits at most.
 */
const caseHang = Duration.seconds(30);

/**
 * How many rotating cases each search compares beside its witnesses.
 */
const CASES = 2000;

/**
 * Any double, every bit pattern alike: NaNs, infinities, zeros of both signs and subnormals among
 * them.
 */
const anyDouble: Gen<number> = map(bytes({ max: 8, min: 8 }), (eight) =>
  new DataView(eight.buffer, eight.byteOffset, 8).getFloat64(0),
);

/**
 * A finite double, a NaN or an infinity drawn as 0.
 */
const finiteDouble: Gen<number> = map(anyDouble, (float) => (Number.isFinite(float) ? float : 0));

/**
 * A pair of doubles: half drawn near each other, so sums cancel and round at every exponent.
 */
const pairs: Gen<readonly [number, number]> = (source) => {
  const first = anyDouble(source);
  const near = int(0, 1)(source) === 1 && Number.isFinite(first);

  return [first, near ? -first * (1 + int(-3, 3)(source) * Number.EPSILON) : anyDouble(source)];
};

/**
 * Two doubles' description, for a failure.
 *
 * @param pair - The doubles.
 * @returns Their source.
 */
const pairLiteral = (pair: readonly [number, number]): string => Formatter.format(pair);

/**
 * Two doubles agree: one value, a -0 apart from a 0, NaN with NaN.
 *
 * @param actual - The kernel's.
 * @param expected - IEEE's.
 * @param what - What was computed.
 */
const agrees = (actual: number, expected: number, what: string): void => {
  assert.isTrue(
    Object.is(actual, expected),
    `${what}: ${String(actual)}, IEEE ${String(expected)}`,
  );
};

/**
 * Two finite doubles' order by IEEE 754's comparison.
 *
 * @param x - The one.
 * @param y - The other.
 * @returns -1, 0 or 1.
 */
const ieeeOrder = (x: number, y: number): number => {
  if (x < y) {
    return -1;
  }

  return x > y ? 1 : 0;
};

describe("the exact kernel rounds once, as IEEE 754 rounds one operation", () => {
  it.effect("a sum of two doubles is IEEE's sum, and every finite double round-trips", (ctx) =>
    searched(
      ctx,
      explore(
        {
          caseHang,
          coverage: noCoverage,
          draw: drawn(pairs),
          kept: [],
          literal: pairLiteral,
          oracle: { kind: "second-implementation", name: "the host's IEEE 754 binary64 addition" },
          runs: CASES,
          shrink: completeShrink,
          steerEvery: 16,
          suite: "processing/numbers/sum-of-two",
        },
        ([x, y]) =>
          Effect.sync(() => {
            agrees(exactSum([x, y]), x + y, `${String(x)} + ${String(y)}`);
            if (Number.isFinite(x)) {
              agrees(
                nearestFloat(exactOfFloat(x), Object.is(x, -0)),
                x,
                `round trip of ${String(x)}`,
              );
            }
          }),
      ),
    ),
  );

  it.effect(
    "a product, a quotient by an integer, a root and an order of finite doubles are IEEE's",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn((source): readonly [number, number] => [
              finiteDouble(source),
              finiteDouble(source),
            ]),
            kept: [],
            literal: pairLiteral,
            oracle: {
              kind: "second-implementation",
              name: "the host's IEEE 754 binary64 multiply, divide, square root and comparison",
            },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/numbers/one-operation",
          },
          ([x, y]) =>
            Effect.sync(() => {
              const product = x * y;
              if (product !== 0) {
                agrees(
                  nearestFloat(multiplyExact(exactOfFloat(x), exactOfFloat(y))),
                  product,
                  "product",
                );
              }

              const divisor = BigInt(Math.trunc(Math.abs(y) % 1000)) + 1n;
              agrees(
                nearestQuotient(exactOfFloat(x), divisor),
                x / Number(divisor),
                `${String(x)} / ${divisor.toString()}`,
              );
              agrees(
                nearestSquareRoot(exactOfFloat(Math.abs(x)), 1n),
                Math.sqrt(Math.abs(x)),
                `√${String(Math.abs(x))}`,
              );
              assert.strictEqual(
                compareExact(exactOfFloat(x), exactOfFloat(y)),
                ieeeOrder(x, y),
                `${String(x)} against ${String(y)}`,
              );
            }),
        ),
      ),
  );

  it.effect("a sum is one rounding of the exact total, whatever the order", (ctx) =>
    searched(
      ctx,
      exhaust(
        {
          box: "every ordering of the stated sums",
          caseHang,
          coverage: requiredInSpace<"cancels" | "ties">(["cancels", "ties"]),
          generator: element([
            { expected: 0.6, floats: [0.1, 0.2, 0.3], note: "ties" },
            { expected: 0.6, floats: [0.3, 0.2, 0.1], note: "ties" },
            { expected: 1, floats: [1e100, 1, -1e100], note: "cancels" },
            { expected: 1, floats: [-1e100, 1e100, 1], note: "cancels" },
            { expected: 2 ** 53, floats: [2 ** 53, 1], note: "ties" },
            { expected: 2 ** 53 + 2, floats: [2 ** 53, 1, 1], note: "ties" },
            { expected: 1e-323, floats: [5e-324, 5e-324], note: "ties" },
          ] as const),
          literal: (row) => Formatter.format(row),
          oracle: { kind: "specification", name: "the exact sum, rounded once by hand (D2)" },
          suite: "processing/numbers/exact-sum",
        },
        (row, c) =>
          Effect.sync(() => {
            c.note(row.note);
            agrees(exactSum(row.floats), row.expected, Formatter.format(row.floats));
          }),
      ),
    ),
  );
});

/**
 * A double rounded at a digit of its exact decimal, as round-to does.
 *
 * @param float - The double.
 * @param keep - How many leading digits to keep.
 * @returns The double nearest the rounded decimal.
 */
const rounded = (float: number, keep: bigint): number =>
  floatOfDecimal(roundDecimal(decimalOfExact(exactOfFloat(float)), keep));

/**
 * A single integer, as the kernel reads numbers.
 *
 * @param value - The integer.
 * @returns The number.
 */
const integer = (value: bigint) => ({ base: "integer", value }) as const;

/**
 * A single float, as the kernel reads numbers.
 *
 * @param value - The float.
 * @returns The number.
 */
const float = (value: number) => ({ base: "float", value }) as const;

describe("the exact kernel's stated values", () => {
  it("rounds a double's exact decimal at the deciding digit (reading 209)", () => {
    assert.strictEqual(
      decimalOfExact(exactOfFloat(0.175)).digits,
      "174999999999999988897769753748434595763683319091796875",
    );
    assert.strictEqual(rounded(0.175, 2n), 0.17);
    assert.strictEqual(rounded(0.125, 2n), 0.13);
    assert.strictEqual(rounded(-0.125, 2n), -0.13);
    assert.strictEqual(rounded(1.005, 3n), 1);
    assert.strictEqual(rounded(0.5, 0n), 1);
    assert.strictEqual(rounded(0.05, -1n), 0);
  });

  it("orders an integer against a float by exact value, past 2^53 included", () => {
    assert.strictEqual(orderOfNumbers(integer(9_007_199_254_740_993n), float(2 ** 53)), 1);
    assert.strictEqual(orderOfNumbers(integer(9_007_199_254_740_992n), float(2 ** 53)), 0);
    assert.strictEqual(orderOfNumbers(integer(10n ** 400n), float(Number.POSITIVE_INFINITY)), -1);
    assert.strictEqual(orderOfNumbers(integer(0n), float(Number.NaN)), undefined);
    assert.strictEqual(orderOfNumbers(float(-0), integer(0n)), 0);
  });

  it("converts an integer past the double range to the largest finite double (reading 45)", () => {
    assert.strictEqual(toFloat(10n ** 400n), Number.MAX_VALUE);
    assert.strictEqual(toFloat(-(10n ** 400n)), -Number.MAX_VALUE);
    assert.strictEqual(toFloat(9_007_199_254_740_993n), 2 ** 53);
    assert.strictEqual(
      compareExact(addExact(exactOfInteger(1n), exactOfFloat(0.5)), exactOfFloat(1.5)),
      0,
    );
  });
});
