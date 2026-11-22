/**
 * Where a Graphic Gap Match pins the arrow beside a hotspot whose author asks for one
 * (`pinnedArrowsOf` in `#plate/graphic/arrows.ts`): beside exactly the hotspots that ask, on the
 * hotspot's box at its top's middle pointing up or its bottom's pointing down, in document order.
 *
 * The oracle is AlphaTest's player (mastery-track-player 941a86a, `GapMatchInteraction.tsx`): it
 * stood a 16 px arrow 2 px above a zone's top (`mb-0.5`) or below its bottom (`mt-0.5`), centred on
 * the zone (`items-center`). Each hotspot's points are worked here from its `coords` by hand, apart
 * from plate's geometry.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { pinnedArrowsOf } from "#plate/graphic/arrows.ts";
import type { PinnedArrow } from "#plate/graphic/arrows.ts";
import type { ArrowDirection } from "#plate/interactions/area.ts";

/**
 * The image the hotspots stand on, in its own pixels.
 */
const size = { height: 300, width: 400 };

/**
 * Three hotspots, one of each geometry a converted item or an author draws, with the point above
 * and below each one's box, its middle, worked from its `coords` by hand.
 */
const zones = [
  {
    below: { x: 60, y: 90 },
    coords: [20, 40, 100, 90],
    geometry: "rect",
    identifier: "R",
    over: { x: 60, y: 40 },
  },
  {
    below: { x: 200, y: 180 },
    coords: [200, 150, 30],
    geometry: "circle",
    identifier: "C",
    over: { x: 200, y: 120 },
  },
  {
    below: { x: 320, y: 260 },
    coords: [300, 200, 340, 200, 360, 260, 280, 250],
    geometry: "poly",
    identifier: "P",
    over: { x: 320, y: 200 },
  },
] as const;

/**
 * Every list of `n` places, each asking for no arrow, an arrow up or an arrow down.
 *
 * @param n How many places.
 * @returns Every list.
 */
const patterns = (n: number): readonly (readonly (ArrowDirection | undefined)[])[] =>
  n === 0
    ? [[]]
    : patterns(n - 1).flatMap((rest) => [
        [undefined, ...rest],
        ["up" as const, ...rest],
        ["down" as const, ...rest],
      ]);

describe("a hotspot's arrow", () => {
  it("is pinned beside exactly the hotspots that ask for one, on the box's top pointing up or its bottom pointing down, for every pattern over three zones", () => {
    for (const asked of patterns(zones.length)) {
      const hotspots = zones.map((zone, at) => ({
        arrow: asked[at],
        coords: zone.coords.map((value) => ({ percent: false, value })),
        geometry: zone.geometry,
        identifier: zone.identifier,
      }));

      assert.deepStrictEqual(
        pinnedArrowsOf(hotspots, size),
        zones.flatMap((zone, at): readonly PinnedArrow[] => {
          const direction = asked[at];

          return direction === undefined
            ? []
            : [
                {
                  at: direction === "up" ? zone.over : zone.below,
                  direction,
                  identifier: zone.identifier,
                },
              ];
        }),
        JSON.stringify(asked),
      );
    }
  });
});
