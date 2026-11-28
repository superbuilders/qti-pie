import { assert, describe, it } from "@effect/vitest";
import { creditOf, marksOf, markingSteps } from "#processing/credit.ts";
import type { Area, AreaMapping } from "#processing/ir.ts";
import { container, nullOf, sameSingle, single, singlesOf } from "#processing/value.ts";
import type { Point, Single, Value } from "#processing/value.ts";
import { everyMember } from "#processing/test/exhausted.ts";

/**
 * A rect area over denominator 1.
 *
 * @param left - Its left.
 * @param top - Its top.
 * @param right - Its right.
 * @param bottom - Its bottom.
 * @returns The area.
 */
const rect = (left: bigint, top: bigint, right: bigint, bottom: bigint): Area => ({
  bottom,
  denominator: 1n,
  kind: "rect",
  left,
  right,
  top,
});

/**
 * Three areas: A and C mapped above 0, B mapped 0.
 */
const mapping: AreaMapping = Object.freeze({
  defaultValue: 0,
  entries: [
    { area: rect(0n, 0n, 10n, 10n), value: 1 },
    { area: rect(20n, 0n, 30n, 10n), value: 0 },
    { area: rect(40n, 0n, 50n, 10n), value: 2 },
  ],
  lowerBound: Number.NEGATIVE_INFINITY,
  upperBound: Number.POSITIVE_INFINITY,
});

/**
 * A point.
 *
 * @param x - Its x.
 * @param y - Its y.
 * @returns The point.
 */
const at = (x: bigint, y: bigint): Point => ({ x, y });

describe("credit (the item's declared maximum, the ruling of 2026-11-28)", () => {
  it.effect(
    "credits a score in [0, maximum] as itself, and refuses one outside it, clamping none",
    (ctx) =>
      everyMember(
        ctx,
        {
          box: "scores from below 0 to above the maximum, NaN and the infinities, against maximum 2",
          members: [
            -1,
            -Number.MIN_VALUE,
            0,
            0.5,
            1,
            2,
            2.5,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
          ],
          oracle: "QTI 3.0.1 §5.108 (normal-maximum) and §2.2.2.3 (SCORE is never clamped)",
          suite: "processing/credit-declared",
        },
        (score) => {
          const credit = creditOf(score, 2);
          if (score >= 0 && score <= 2) {
            let kind: "full" | "none" | "partial" = "partial";
            if (score === 0) {
              kind = "none";
            } else if (score === 2) {
              kind = "full";
            }

            assert.deepStrictEqual(credit, { earned: score, kind, maximum: 2 });
          } else {
            assert.deepStrictEqual(credit, { kind: "out-of-range", score });
          }
        },
      ),
  );
});

describe("marks by area (Decision 6)", () => {
  it("marks a point right in an area mapped above 0 that no point before it reached, every other point wrong, and an unreached area missed at its least correct point", () => {
    const given = container("multiple", "point", [
      at(5n, 5n),
      at(1n, 1n),
      at(25n, 5n),
      at(99n, 99n),
    ]);
    const correct = container("multiple", "point", [at(6n, 6n), at(45n, 5n), at(41n, 1n)]);
    assert.deepStrictEqual(marksOf(given, correct, mapping), [
      { copies: 1, mark: "right", place: 0, value: single("point", at(1n, 1n)) },
      { copies: 1, mark: "wrong", place: 0, value: single("point", at(5n, 5n)) },
      { copies: 1, mark: "wrong", place: 0, value: single("point", at(25n, 5n)) },
      { copies: 1, mark: "wrong", place: 0, value: single("point", at(99n, 99n)) },
      { copies: 1, mark: "missed", place: 0, value: single("point", at(41n, 1n)) },
    ]);
  });

  it("marks an unanswered point response by area too: each area mapped above 0 missed", () => {
    const correct = container("multiple", "point", [at(6n, 6n), at(45n, 5n)]);
    assert.deepStrictEqual(
      marksOf(nullOf({ base: "point", cardinality: "multiple" }), correct, mapping),
      [
        { copies: 1, mark: "missed", place: 0, value: single("point", at(6n, 6n)) },
        { copies: 1, mark: "missed", place: 0, value: single("point", at(45n, 5n)) },
      ],
    );
  });
});

/**
 * A multiple integer response of n distinct members and its correct response, the same members
 * reversed, so every member is matched against a bag of n.
 *
 * @param n - How many members.
 * @returns The response and the correct response.
 */
const bagsOf = (n: number) => {
  const members = Array.from({ length: n }, (_, index) => BigInt(index));

  return {
    correct: container("multiple", "integer", members.toReversed()),
    given: container("multiple", "integer", members),
  };
};

/**
 * The mutant the budget must kill: marking as it was, each new mark found by scanning the marks
 * made so far and each member's match by scanning the correct response, each comparison a step.
 *
 * @param given - The response.
 * @param correct - The correct response.
 * @returns Its steps.
 */
const scannedSteps = (given: Value, correct: Value): number => {
  let steps = 0;
  const corrects =
    given.kind === "multiple" && correct.kind === "multiple" ? singlesOf(correct) : [];
  const taken = corrects.map(() => false);
  const marks: { readonly copies: number; readonly mark: string; readonly value: Single }[] = [];
  const add = (mark: string, value: Single): void => {
    let index = -1;
    for (const [position, each] of marks.entries()) {
      steps += 1;
      if (each.mark === mark && sameSingle(each.value, value)) {
        index = position;
        break;
      }
    }

    const found = marks[index];
    if (found === undefined) {
      marks.push({ copies: 1, mark, value });
    } else {
      marks[index] = { ...found, copies: found.copies + 1 };
    }
  };
  for (const member of given.kind === "multiple" ? singlesOf(given) : []) {
    let index = -1;
    for (const [place, each] of corrects.entries()) {
      steps += 1;
      if (taken[place] !== true && sameSingle(each, member)) {
        index = place;
        break;
      }
    }

    if (index === -1) {
      add("wrong", member);
    } else {
      taken[index] = true;
      add("right", member);
    }
  }

  return steps;
};

/**
 * The steps marking a response of n values against them reversed takes.
 *
 * @param n - How many values.
 * @returns The steps.
 */
const markingStepsOf = (n: number): number => {
  const { correct, given } = bagsOf(n);

  return markingSteps(given, correct);
};

/**
 * The steps the scan takes over a response of n values against them reversed.
 *
 * @param n - How many values.
 * @returns The steps.
 */
const scannedStepsOf = (n: number): number => {
  const { correct, given } = bagsOf(n);

  return scannedSteps(given, correct);
};

/**
 * Every response size from 1 to 64 values.
 */
const sizes: readonly [number, ...number[]] = [
  1,
  ...Array.from({ length: 63 }, (_, index) => index + 2),
];

describe("marking's budget", () => {
  it.effect(
    "counts its work, never its time: at most five map steps a value, so doubling the values exactly doubles the steps",
    (ctx) =>
      everyMember(
        ctx,
        {
          box: "every response size from 1 to 64 values, each against the same values reversed",
          members: sizes,
          oracle: "the bound: one key lookup or entry a mark and a match, O(values)",
          suite: "processing/credit/marking-steps",
        },
        (n) => {
          assert.isAtMost(markingStepsOf(n), 5 * n);
          assert.strictEqual(markingStepsOf(2 * n), 2 * markingStepsOf(n));
        },
      ),
  );

  it("kills the scan that made marking quadratic: its steps more than triple when the values double", () => {
    assert.isAbove(scannedStepsOf(512), 3 * scannedStepsOf(256));
  });
});
