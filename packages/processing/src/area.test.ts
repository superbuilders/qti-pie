import { drawn, explore } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Formatter } from "effect";
import { inside } from "#processing/area.ts";
import type { Area, Vertex } from "#processing/ir.ts";

/**
 * The work one case may do.
 */
const caseHang = Duration.seconds(30);

/**
 * How many rotating cases each search compares beside its witnesses.
 */
const CASES = 1000;

/**
 * A vertex of integers.
 *
 * @param x - Its x.
 * @param y - Its y.
 * @returns The vertex.
 */
const vertex = (x: number, y: number): Vertex => ({ x: BigInt(x), y: BigInt(y) });

/**
 * Whether an area holds a point of integers.
 *
 * @param region - The area.
 * @param x - The point's x.
 * @param y - The point's y.
 * @returns Whether it holds it.
 */
const holds = (region: Area, x: number, y: number): boolean =>
  inside(region, { x: BigInt(x), y: BigInt(y) });

describe("an area's geometry", () => {
  it.effect(
    "a rect holds exactly the points between its ordered corners, as the polygon of its corners does, over any denominator (readings `area-mapping`, `area-coords-fit`)",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn((source): readonly number[] => [
              ...Array.from({ length: 6 }, () => int(-8, 8)(source)),
              int(1, 4)(source),
            ]),
            kept: [],
            literal: (row) => Formatter.format(row),
            oracle: { kind: "universal", name: "a rect and the polygon of its corners agree" },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/area/rect-as-poly",
          },
          ([one = 0, two = 0, three = 0, four = 0, x = 0, y = 0, scale = 1]) =>
            Effect.sync(() => {
              const [left, right] = one <= three ? [one, three] : [three, one];
              const [top, bottom] = two <= four ? [two, four] : [four, two];
              const denominator = BigInt(scale);
              const rect = holds(
                {
                  bottom: BigInt(bottom),
                  denominator,
                  kind: "rect",
                  left: BigInt(left),
                  right: BigInt(right),
                  top: BigInt(top),
                },
                x,
                y,
              );
              const corners = [
                vertex(left, top),
                vertex(right, top),
                vertex(right, bottom),
                vertex(left, bottom),
              ] as const;
              if (left !== right && top !== bottom) {
                assert.strictEqual(
                  holds({ denominator, kind: "poly", vertices: corners }, x, y),
                  rect,
                );
              }

              assert.strictEqual(
                rect,
                left <= x * scale && x * scale <= right && top <= y * scale && y * scale <= bottom,
              );
            }),
        ),
      ),
  );

  it.effect(
    "a circle holds the points whose squared distance from its centre is at most its radius squared",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn((source): readonly number[] =>
              Array.from({ length: 5 }, () => int(-20, 20)(source)),
            ),
            kept: [],
            literal: (row) => Formatter.format(row),
            oracle: {
              kind: "second-implementation",
              name: "the distance over doubles of small integers",
            },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/area/circle",
          },
          ([cx = 0, cy = 0, radius = 0, x = 0, y = 0]) =>
            Effect.sync(() => {
              assert.strictEqual(
                holds(
                  {
                    centre: vertex(cx, cy),
                    denominator: 1n,
                    kind: "circle",
                    radius: BigInt(Math.abs(radius)),
                  },
                  x,
                  y,
                ),
                (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2,
              );
            }),
        ),
      ),
  );

  it("holds a point on an edge, every point everywhere and none nowhere (readings `area-mapping`, `area-coords-fit`)", () => {
    assert.isTrue(
      holds({ bottom: 10n, denominator: 1n, kind: "rect", left: 0n, right: 10n, top: 0n }, 10, 5),
    );
    assert.isTrue(
      holds({ centre: vertex(0, 0), denominator: 1n, kind: "circle", radius: 5n }, 3, 4),
    );
    assert.isTrue(
      holds({ across: 4n, centre: vertex(0, 0), denominator: 1n, down: 2n, kind: "ellipse" }, 4, 0),
    );
    assert.isFalse(
      holds({ across: 4n, centre: vertex(0, 0), denominator: 1n, down: 2n, kind: "ellipse" }, 4, 1),
    );
    assert.isTrue(
      holds(
        { denominator: 1n, kind: "poly", vertices: [vertex(0, 0), vertex(10, 0), vertex(0, 10)] },
        5,
        5,
      ),
    );
    assert.isTrue(holds({ kind: "everywhere" }, -1000, 1000));
    assert.isFalse(holds({ kind: "nowhere" }, 0, 0));
  });

  it("fills a poly by the even-odd rule: a pentagram's centre is outside, a point of it inside (reading `area-coords-fit`)", () => {
    const star: Area = {
      denominator: 1n,
      kind: "poly",
      vertices: [vertex(5, 0), vertex(8, 10), vertex(0, 4), vertex(10, 4), vertex(2, 10)],
    };

    assert.isFalse(holds(star, 5, 5));
    assert.isTrue(holds(star, 5, 1));
  });

  it("reads coordinates over their denominator exactly: a rect from 1/2 to 3/2 holds 1 and not 2 (reading `circle-percentage-radius`)", () => {
    const half: Area = {
      bottom: 3n,
      denominator: 2n,
      kind: "rect",
      left: 1n,
      right: 3n,
      top: 1n,
    };

    assert.isTrue(holds(half, 1, 1));
    assert.isFalse(holds(half, 2, 1));
    assert.isFalse(holds(half, 0, 1));
  });
});
