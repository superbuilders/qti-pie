/**
 * The arrow a Graphic Gap Match draws beside a hotspot whose author asks for one by
 * `data-arrow-direction` (`arrowOf` in `#plate/interactions/area.ts`, `HotspotArrows` beside this
 * file): read exactly as AlphaTest's player matched it, `up` or `down`, and pinned beside exactly
 * the hotspots that ask, above the hotspot's box pointing up or below it pointing down, centred on
 * it and clear of it.
 *
 * The oracle is AlphaTest's player (mastery-track-player 941a86a, `GapMatchInteraction.tsx`): it
 * read `data-arrow-direction` when its value was `up` or `down` and nothing else, and drew a 16 px
 * arrow 2 px above a zone's top (`mb-0.5`) or below its bottom (`mt-0.5`), centred on the zone
 * (`items-center`). Each hotspot's edge is worked here from its `coords`, apart from plate's
 * geometry.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { arrowOf } from "#plate/interactions/area.ts";
import type { ArrowDirection } from "#plate/interactions/area.ts";
import { HotspotArrows } from "#plate/ui/graphic-gap-match/arrows.tsx";

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

/**
 * Write a coordinate as the pin writes it: a percentage of its side of the image.
 *
 * @param value The coordinate, in the image's pixels.
 * @param side The side's length.
 * @returns The percentage.
 */
const percent = (value: number, side: number): string => `${String((value / side) * 100)}%`;

/**
 * One arrow as the markup shows it: where its pin stands, how its box is moved from there, and
 * the path it draws.
 */
interface Shown {
  readonly path: string;
  readonly transform: string;
  readonly x: string;
  readonly y: string;
}

/**
 * Read every arrow a markup pins, in document order.
 *
 * @param html The markup.
 * @returns The arrows.
 */
const arrowsIn = (html: string): readonly Shown[] =>
  [
    ...html.matchAll(
      /<svg data-slot="plate-graphic-pin"[^>]*? x="(?<x>[^"]*)" y="(?<y>[^"]*)"><g data-slot="plate-graphic-arrow"[^>]*? transform="(?<transform>[^"]*)"><path d="(?<path>[^"]*)"/gu,
    ),
  ].map((match) => ({
    path: match.groups?.["path"] ?? "",
    transform: match.groups?.["transform"] ?? "",
    x: match.groups?.["x"] ?? "",
    y: match.groups?.["y"] ?? "",
  }));

describe("a hotspot's arrow", () => {
  it("is read from data-arrow-direction when it is exactly up or down, and never otherwise", () => {
    assert.deepStrictEqual(arrowOf(Option.some("up")), Option.some("up"));
    assert.deepStrictEqual(arrowOf(Option.some("down")), Option.some("down"));

    for (const written of ["", "Up", "DOWN", " up", "down ", "left", "right", "updown", "true"]) {
      assert.deepStrictEqual(arrowOf(Option.some(written)), Option.none(), written);
    }

    assert.deepStrictEqual(arrowOf(Option.none()), Option.none());
  });

  it("is pinned beside exactly the hotspots that ask for one, above pointing up or below pointing down, for every pattern over three zones", () => {
    for (const asked of patterns(zones.length)) {
      const hotspots = zones.map((zone, at) => ({
        arrow: asked[at],
        coords: zone.coords.map((value) => ({ percent: false, value })),
        geometry: zone.geometry,
        identifier: zone.identifier,
      }));
      const html = renderToStaticMarkup(createElement(HotspotArrows, { hotspots, size }));

      assert.deepStrictEqual(
        arrowsIn(html),
        zones.flatMap((zone, at): readonly Shown[] => {
          const arrow = asked[at];

          if (arrow === undefined) {
            return [];
          }

          const at2 = arrow === "up" ? zone.over : zone.below;

          return [
            {
              path:
                arrow === "up"
                  ? "M 12 19 V 5 M 5 12 L 12 5 L 19 12"
                  : "M 12 5 V 19 M 19 12 L 12 19 L 5 12",
              transform:
                arrow === "up"
                  ? `translate(-8 -18) scale(${String(16 / 24)})`
                  : `translate(-8 2) scale(${String(16 / 24)})`,
              x: percent(at2.x, size.width),
              y: percent(at2.y, size.height),
            },
          ];
        }),
        JSON.stringify(asked),
      );
    }
  });
});
