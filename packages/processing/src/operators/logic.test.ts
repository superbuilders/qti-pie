import { assert, describe, it } from "@effect/vitest";
import type { Expression } from "#processing/ir.ts";
import { logicOperators } from "#processing/operators/logic.ts";
import { singleBoolean } from "#processing/operators/operator.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import { literal, nodeOf, ownVariable, testRun } from "#processing/test/run.ts";
import { nullOf, single } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";

const operators = { ...logicOperators, ...valuesOperators };

/**
 * A truth in Kleene's order, false below unknown below true, the oracle's reading of three-valued
 * logic.
 */
type Truth = 0 | 1 | 2;

const truths: readonly Truth[] = [0, 1, 2];

/**
 * The operand a truth is.
 *
 * @param truth - The truth.
 * @returns A `qti-base-value` of it, or of the boolean NULL.
 */
const operandOf = (truth: Truth): Expression =>
  literal(
    truth === 1
      ? nullOf({ base: "boolean", cardinality: "single" })
      : single("boolean", truth === 2),
  );

/**
 * The value a truth is.
 *
 * @param truth - The truth.
 * @returns The single boolean, or its NULL.
 */
const valueOf = (truth: Truth): Value =>
  truth === 1 ? nullOf({ base: "boolean", cardinality: "single" }) : single("boolean", truth === 2);

/**
 * The least of truths.
 *
 * @param list - The truths.
 * @returns The least.
 */
const least = (list: readonly [Truth, ...Truth[]]): Truth => {
  let [held] = list;
  for (const next of list) {
    held = next < held ? next : held;
  }

  return held;
};

/**
 * The greatest of truths.
 *
 * @param list - The truths.
 * @returns The greatest.
 */
const greatest = (list: readonly [Truth, ...Truth[]]): Truth => {
  let [held] = list;
  for (const next of list) {
    held = next > held ? next : held;
  }

  return held;
};

/**
 * A truth reversed, unknown kept.
 *
 * @param truth - The truth.
 * @returns Its reverse.
 */
const reversed = (truth: Truth): Truth => {
  if (truth === 1) {
    return 1;
  }

  return truth === 0 ? 2 : 0;
};

/**
 * Every list of one to three truths.
 */
const lists: readonly (readonly [Truth, ...Truth[]])[] = truths.flatMap((first) => [
  [first] as const,
  ...truths.flatMap((second) => [
    [first, second] as const,
    ...truths.map((third) => [first, second, third] as const),
  ]),
]);

/**
 * The oracle's `qti-any-n`: true when every reading of the unknowns lies within the range, false
 * when none does, NULL when some do.
 *
 * @param within - For each reading, whether it lies within the range.
 * @returns The value.
 */
const expectedAnyN = (within: readonly boolean[]): Value => {
  if (within.every(Boolean)) {
    return single("boolean", true);
  }

  return within.some(Boolean)
    ? nullOf({ base: "boolean", cardinality: "single" })
    : single("boolean", false);
};

const { run } = testRun(operators, {
  threshold: { value: single("integer", 2n) },
});

describe("the logic family", () => {
  it("and is the least truth and or the greatest, over every list of up to three truths (Kleene, §2.11.3.10, §2.11.3.15)", () => {
    for (const list of lists) {
      const [first, ...rest] = list.map(operandOf);
      const operands = [first ?? operandOf(0), ...rest] as const;
      const and = nodeOf("and", operands, {}, singleBoolean);
      const or = nodeOf("or", operands, {}, singleBoolean);
      assert.deepStrictEqual(logicOperators.and.evaluate(and, run), valueOf(least(list)));
      assert.deepStrictEqual(logicOperators.or.evaluate(or, run), valueOf(greatest(list)));
    }
  });

  it("not reverses a truth and keeps unknown (§2.11.3.35)", () => {
    for (const truth of truths) {
      const node = nodeOf("not", [operandOf(truth)], {}, singleBoolean);
      assert.deepStrictEqual(logicOperators.not.evaluate(node, run), valueOf(reversed(truth)));
    }
  });

  it("any-n is true when every reading of the unknowns keeps the trues within [min, max], false when none does, else NULL (§2.11.3.1)", () => {
    for (const list of lists) {
      for (const min of [0n, 1n, 2n]) {
        for (const max of [1n, 2n, 3n]) {
          const [first, ...rest] = list.map(operandOf);
          const node = nodeOf(
            "any-n",
            [first ?? operandOf(0), ...rest],
            { max: { kind: "literal", value: max }, min: { kind: "literal", value: min } },
            singleBoolean,
          );
          const unknowns = list.filter((truth) => truth === 1).length;
          const trues = list.filter((truth) => truth === 2).length;
          const readings = Array.from({ length: unknowns + 1 }, (_, extra) =>
            BigInt(trues + extra),
          );
          const within = readings.map((count) => count >= min && count <= max);
          const expected = expectedAnyN(within);
          assert.deepStrictEqual(logicOperators["any-n"].evaluate(node, run), expected);
        }
      }
    }
  });

  it("any-n reads a min that names a variable at run time, and NULL for one that holds NULL", () => {
    const threshold = ownVariable("threshold", { base: "integer", cardinality: "single" });
    const missing = ownVariable("missing", { base: "integer", cardinality: "single" });
    const node = (min: typeof threshold) =>
      nodeOf(
        "any-n",
        [operandOf(2), operandOf(2), operandOf(0)],
        { max: { kind: "literal", value: 3n }, min: { kind: "variable", variable: min } },
        singleBoolean,
      );
    assert.deepStrictEqual(
      logicOperators["any-n"].evaluate(node(threshold), run),
      single("boolean", true),
    );
    assert.deepStrictEqual(
      logicOperators["any-n"].evaluate(node(missing), run),
      nullOf({ base: "boolean", cardinality: "single" }),
    );
  });
});
