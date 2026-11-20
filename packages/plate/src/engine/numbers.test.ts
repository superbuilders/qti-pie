import { assert, describe, it } from "@effect/vitest";
import {
  bitLengthOf,
  boundedInteger,
  boundedTimes,
  ComputationBoundDefect,
  emptyProduct,
  heldToContainerBound,
  toFloat,
} from "#plate/engine/numbers.ts";

/**
 * The largest finite float, `Number.MAX_VALUE`, as an exact integer: 2^1024 − 2^971.
 */
const greatest = 2n ** 1024n - 2n ** 971n;

/**
 * The least integer whose nearest double, ties to even, is an infinity: 2^1024 − 2^970, halfway
 * between {@link greatest} and 2^1024, a tie that rounds to the even 2^1024.
 */
const midpoint = 2n ** 1024n - 2n ** 970n;

describe("the engine's one integer-to-float conversion", () => {
  it("toFloat gives an integer beyond the largest finite float the largest finite float of its sign (reading 45)", () => {
    assert.strictEqual(toFloat(10n ** 400n), Number.MAX_VALUE);
    assert.strictEqual(toFloat(-(10n ** 400n)), -Number.MAX_VALUE);
    assert.strictEqual(toFloat(midpoint), Number.MAX_VALUE);
    assert.strictEqual(toFloat(-midpoint), -Number.MAX_VALUE);
    assert.strictEqual(toFloat(2n ** 1024n), Number.MAX_VALUE);
  });

  it("toFloat gives every other integer its nearest double, ties to even (reading 45)", () => {
    assert.strictEqual(toFloat(greatest), Number.MAX_VALUE);
    assert.strictEqual(toFloat(midpoint - 1n), Number.MAX_VALUE);
    assert.strictEqual(toFloat(-greatest), -Number.MAX_VALUE);
    assert.strictEqual(toFloat(2n ** 53n + 1n), 2 ** 53);
    assert.strictEqual(toFloat(2n ** 53n + 3n), 2 ** 53 + 4);
    assert.strictEqual(toFloat(-7n), -7);
    assert.isTrue(Object.is(toFloat(0n), 0), "the integer 0 is the float +0");
  });
});

describe("the engine's bounds on what it computes", () => {
  it("bitLengthOf counts the binary digits of an integer's magnitude", () => {
    assert.strictEqual(bitLengthOf(0n), 0);
    assert.strictEqual(bitLengthOf(1n), 1);
    assert.strictEqual(bitLengthOf(-1n), 1);
    assert.strictEqual(bitLengthOf(15n), 4);
    assert.strictEqual(bitLengthOf(16n), 5);
    assert.strictEqual(bitLengthOf(-(2n ** 64n) + 1n), 64);
    assert.strictEqual(bitLengthOf(2n ** 999_999n), 1_000_000);
    assert.strictEqual(bitLengthOf(2n ** 1_000_000n - 1n), 1_000_000);
    assert.strictEqual(bitLengthOf(-(2n ** 1_000_000n)), 1_000_001);
  });

  it("boundedInteger keeps an integer of exactly 1,000,000 bits and aborts the run, never NULL, for one of 1,000,001", () => {
    assert.strictEqual(boundedInteger(2n ** 1_000_000n - 1n), 2n ** 1_000_000n - 1n);
    assert.strictEqual(boundedInteger(-(2n ** 999_999n)), -(2n ** 999_999n));
    assert.throws(() => {
      boundedInteger(2n ** 1_000_000n);
    }, ComputationBoundDefect);
    assert.throws(() => {
      boundedInteger(-(2n ** 1_000_000n));
    }, ComputationBoundDefect);
  });

  it("boundedTimes decides from its factors' bit lengths: kept unmeasured when they sum to at most 1,000,000, aborted when the sum less one is past it, and measured only in between", () => {
    const half = boundedTimes(emptyProduct, 2n ** 499_999n);
    const over = boundedTimes(emptyProduct, 2n ** 500_000n);
    assert.deepStrictEqual(
      half,
      { integer: 2n ** 499_999n, leastBits: 500_000, mostBits: 500_000 },
      "1 times an integer has exactly its bits",
    );
    assert.deepStrictEqual(over, {
      integer: 2n ** 500_000n,
      leastBits: 500_001,
      mostBits: 500_001,
    });

    assert.deepStrictEqual(
      boundedTimes(half, 2n ** 499_999n),
      { integer: 2n ** 999_998n, leastBits: 999_999, mostBits: 1_000_000 },
      "500,000 and 500,000 bits sum to the bound: kept, and its range is not narrowed by a measure",
    );
    assert.throws(
      () => {
        boundedTimes(over, 2n ** 500_000n);
      },
      ComputationBoundDefect,
      undefined,
      "500,001 and 500,001 bits: the sum less one, 1,000,001, is past the bound",
    );
    assert.deepStrictEqual(
      boundedTimes(half, 2n ** 500_000n),
      { integer: 2n ** 999_999n, leastBits: 1_000_000, mostBits: 1_000_000 },
      "500,000 and 500,001 bits: in between, measured exactly at 1,000,000",
    );
    assert.throws(
      () => {
        boundedTimes(boundedTimes(emptyProduct, 3n * 2n ** 499_998n), 3n * 2n ** 499_999n);
      },
      ComputationBoundDefect,
      undefined,
      "500,000 and 500,001 bits: in between, measured exactly at 1,000,001",
    );
  });

  it("boundedTimes carries a partial product's range: a factor of ±1 keeps it, a range across the bound is measured, and 0 gives 0", () => {
    const kept = boundedTimes(boundedTimes(emptyProduct, 2n ** 499_999n), 2n ** 499_999n);

    assert.deepStrictEqual(boundedTimes(kept, -1n), {
      integer: -(2n ** 999_998n),
      leastBits: 999_999,
      mostBits: 1_000_000,
    });
    assert.deepStrictEqual(
      boundedTimes(kept, 2n),
      { integer: 2n ** 999_999n, leastBits: 1_000_000, mostBits: 1_000_000 },
      "999,999 to 1,000,000 bits times 2 bits is 1,000,000 to 1,000,002: measured, 1,000,000",
    );
    assert.throws(
      () => {
        boundedTimes(kept, 4n);
      },
      ComputationBoundDefect,
      undefined,
      "999,999 to 1,000,000 bits times 3 bits is at least 1,000,001",
    );
    assert.deepStrictEqual(boundedTimes(kept, 0n), { integer: 0n, leastBits: 0, mostBits: 0 });
  });

  it("heldToContainerBound holds a container of 1,000,000 values and aborts the run, never NULL, for one of 1,000,001", () => {
    assert.doesNotThrow(() => {
      heldToContainerBound(0n);
    });
    assert.doesNotThrow(() => {
      heldToContainerBound(1_000_000n);
    });
    assert.throws(() => {
      heldToContainerBound(1_000_001n);
    }, ComputationBoundDefect);
    assert.throws(() => {
      heldToContainerBound(2_147_483_647n * 2_147_483_647n);
    }, ComputationBoundDefect);
  });
});
