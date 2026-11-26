import { assert, describe, it } from "@effect/vitest";
import { creditOf, marksOf } from "#processing/credit.ts";
import type { Area, AreaMapping } from "#processing/ir.ts";
import { container, nullOf, single } from "#processing/value.ts";
import type { Point } from "#processing/value.ts";

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
