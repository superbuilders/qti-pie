import { cpuUsage } from "node:process";
import { assert, describe, it } from "@effect/vitest";
import { creditOf, marksOf } from "#processing/credit.ts";
import type { Area, AreaMapping } from "#processing/ir.ts";
import { container, nullOf, sameSingle, single, singlesOf } from "#processing/value.ts";
import type { Point, Single, Value } from "#processing/value.ts";

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

describe("credit (credit.sql, the owner's rule)", () => {
  it("is none at or below 0, full at or above the maximum, partial between, and nothing where the scores cannot say", () => {
    assert.deepStrictEqual(creditOf(-1, 2), { earned: 0, kind: "none", maximum: 2 });
    assert.deepStrictEqual(creditOf(1, 2), { earned: 1, kind: "partial", maximum: 2 });
    assert.deepStrictEqual(creditOf(3, 2), { earned: 2, kind: "full", maximum: 2 });
    assert.isUndefined(creditOf(Number.NaN, 2));
    assert.isUndefined(creditOf(1, 0));
    assert.isUndefined(creditOf(1, Number.POSITIVE_INFINITY));
  });
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
 * The CPU a run of work spends, user and system, in microseconds: the work the case does, never the
 * time the machine takes to let it.
 *
 * @param run - The work, giving how many marks it made.
 * @returns Its CPU.
 */
const cpuOf = (run: () => number): number => {
  const before = cpuUsage();
  const count = run();
  const spent = cpuUsage(before);

  return count < 0 ? Number.NaN : spent.user + spent.system;
};

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
 * How marking's CPU grows when the response doubles: the least CPU of five runs at 2n over the
 * least of five at n, after a run to warm the code. Linear marking doubles (near 2); a scan of the
 * marks made so far quadruples (near 4).
 *
 * @param mark - The marking.
 * @param n - The smaller size.
 * @returns The ratio.
 */
const doublingOf = (mark: (given: Value, correct: Value) => number, n: number): number => {
  const least = (size: number): number => {
    const { correct, given } = bagsOf(size);

    let lowest = Number.POSITIVE_INFINITY;
    for (let run = 0; run < 5; run += 1) {
      lowest = Math.min(
        lowest,
        cpuOf(() => mark(given, correct)),
      );
    }

    return lowest;
  };
  least(n);

  return least(2 * n) / least(n);
};

/**
 * The mutant the budget must kill: marking as it was, each new mark found by scanning the marks
 * made so far and each member's match by scanning the correct response.
 *
 * @param given - The response.
 * @param correct - The correct response.
 * @returns The marks' count.
 */
const scannedMarks = (given: Value, correct: Value): number => {
  const corrects =
    given.kind === "multiple" && correct.kind === "multiple" ? singlesOf(correct) : [];
  const taken = corrects.map(() => false);
  const marks: { readonly copies: number; readonly mark: string; readonly value: Single }[] = [];
  const add = (mark: string, value: Single): void => {
    const index = marks.findIndex((each) => each.mark === mark && sameSingle(each.value, value));
    const found = marks[index];
    if (found === undefined) {
      marks.push({ copies: 1, mark, value });
    } else {
      marks[index] = { ...found, copies: found.copies + 1 };
    }
  };
  for (const member of given.kind === "multiple" ? singlesOf(given) : []) {
    const index = corrects.findIndex(
      (each, place) => taken[place] !== true && sameSingle(each, member),
    );
    if (index === -1) {
      add("wrong", member);
    } else {
      taken[index] = true;
      add("right", member);
    }
  }

  return marks.length;
};

describe("marking's budget", () => {
  it("is linear in the response's values, a doubling of them near doubling its CPU, and kills the scan that made it quadratic", () => {
    assert.isBelow(
      doublingOf((given, correct) => marksOf(given, correct, mapping).length, 16_384),
      3,
    );
    assert.isAbove(doublingOf(scannedMarks, 2048), 3);
  });
});
