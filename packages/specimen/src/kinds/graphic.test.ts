/**
 * The stage the graphic kinds share, checked over every stage and every count of areas from 1 to
 * 9: each area lies inside the picture, no two areas' bounds overlap, each area holds its own
 * centre, the point a child's tap on it lands on, a `tiny` area is under the 24 px WCAG asks of a
 * target, so plate's stage must scale it up, and the coordinates written are the area drawn: whole
 * numbers, of pixels or of percentages of the picture's sides.
 *
 * The oracle is geometry written apart from the placement: the bounds and the point-in-area test
 * of each shape from its coordinates in pixels, as the HTML Standard's image map reads them.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Array as Arr } from "effect";
import { areaAttributes, areasOf } from "#specimen/kinds/graphic.ts";
import type { Area, Stage } from "#specimen/kinds/graphic.ts";
import { sizeOf } from "#specimen/picture.ts";
import type { Size } from "#specimen/picture.ts";

/**
 * Every stage: each shape and size of picture, geometry, extent and way of writing coordinates.
 */
const stages: readonly Stage[] = (["wide", "square", "tall"] as const).flatMap((aspect) =>
  (["normal", "tiny", "huge"] as const).flatMap((scale) =>
    (["mixed", "rect", "circle", "ellipse", "poly"] as const).flatMap((geometry) =>
      (["normal", "tiny", "large"] as const).flatMap((extent) =>
        (["pixels", "percent"] as const).map((coordinates): Stage => ({
          carrier: "img",
          coordinates,
          extent,
          geometry,
          picture: { aspect, scale },
          sizing: "written",
        })),
      ),
    ),
  ),
);

/**
 * An area's bounds in pixels: its least and most x and y.
 *
 * @param area The area.
 * @returns The bounds.
 */
const boundsOf = (area: Area): Readonly<Record<"bottom" | "left" | "right" | "top", number>> => {
  const [a = 0, b = 0, c = 0, d = 0] = area.coords;

  switch (area.geometry) {
    case "rect": {
      return { bottom: d, left: a, right: c, top: b };
    }
    case "circle": {
      return { bottom: b + c, left: a - c, right: a + c, top: b - c };
    }
    case "ellipse": {
      return { bottom: b + d, left: a - c, right: a + c, top: b - d };
    }
    case "poly": {
      const xs = area.coords.filter((_, at) => at % 2 === 0);
      const ys = area.coords.filter((_, at) => at % 2 === 1);

      return {
        bottom: Math.max(...ys),
        left: Math.min(...xs),
        right: Math.max(...xs),
        top: Math.min(...ys),
      };
    }
    default: {
      return area.geometry satisfies never;
    }
  }
};

/**
 * Whether a point is inside an area, its boundary included.
 *
 * @param area The area.
 * @param point The point, in pixels.
 * @returns Whether the area holds it.
 */
const holds = (area: Area, [x, y]: readonly [number, number]): boolean => {
  const [a = 0, b = 0, c = 0, d = 0] = area.coords;

  switch (area.geometry) {
    case "rect": {
      return a <= x && x <= c && b <= y && y <= d;
    }
    case "circle": {
      return (x - a) ** 2 + (y - b) ** 2 <= c ** 2;
    }
    case "ellipse": {
      return ((x - a) / c) ** 2 + ((y - b) / d) ** 2 <= 1;
    }
    case "poly": {
      // The point is on the same side of each edge, or on one: the signs of the three cross
      // products never differ.
      const corners = Arr.makeBy(
        area.coords.length / 2,
        (at) =>
          [Arr.getUnsafe(area.coords, 2 * at), Arr.getUnsafe(area.coords, 2 * at + 1)] as const,
      );
      const signs = new Set(
        corners.map(([x1, y1], at) => {
          const [x2, y2] = Arr.getUnsafe(corners, (at + 1) % corners.length);

          return Math.sign((x2 - x1) * (y - y1) - (y2 - y1) * (x - x1));
        }),
      );

      return !(signs.has(1) && signs.has(-1));
    }
    default: {
      return area.geometry satisfies never;
    }
  }
};

/**
 * The side of the picture a coordinate written as a percentage is of: an x of the width, a y of
 * the height, and a circle's radius of the smaller side.
 *
 * @param area The area.
 * @param size The picture's size.
 * @param at The coordinate's place in `coords`.
 * @returns The side, in pixels.
 */
const sideOf = (area: Area, size: Size, at: number): number => {
  if (area.geometry === "circle" && at === 2) {
    return Math.min(size.width, size.height);
  }

  return at % 2 === 0 ? size.width : size.height;
};

describe("a graphic stage", () => {
  it("places each area inside the picture, apart from every other, holding its own centre", () => {
    for (const stage of stages) {
      const size = sizeOf(stage.picture);

      for (const count of Arr.range(1, 9)) {
        const areas = areasOf(stage, count);
        const bounds = areas.map(boundsOf);

        assert.strictEqual(areas.length, count);

        for (const [at, [area, own]] of Arr.zip(areas, bounds).entries()) {
          const label = `${JSON.stringify(stage)} area ${String(at)} of ${String(count)}`;

          assert.isTrue(
            own.left >= 0 && own.top >= 0 && own.right <= size.width && own.bottom <= size.height,
            `${label} leaves the picture`,
          );
          assert.isTrue(own.right > own.left && own.bottom > own.top, `${label} is empty`);
          assert.isTrue(holds(area, area.centre), `${label} does not hold its centre`);

          for (const other of bounds.slice(at + 1)) {
            assert.isTrue(
              other.left >= own.right ||
                own.left >= other.right ||
                other.top >= own.bottom ||
                own.top >= other.bottom,
              `${label} overlaps a later area`,
            );
          }
        }
      }
    }
  });

  it("writes whole coordinates that are the area drawn, a tiny one under a target's 24 px", () => {
    for (const stage of stages) {
      const size = sizeOf(stage.picture);

      for (const area of areasOf(stage, 4)) {
        const written = String(areaAttributes(stage, area)["coords"]);
        const values = written.split(",");

        assert.isTrue(
          values.every((value) =>
            stage.coordinates === "percent" ? /^[0-9]+%$/u.test(value) : /^[0-9]+$/u.test(value),
          ),
          `${JSON.stringify(stage)} writes ${written}`,
        );

        const pixels = values.map((value, at) =>
          stage.coordinates === "pixels"
            ? Number(value)
            : (Number(value.slice(0, -1)) * sideOf(area, size, at)) / 100,
        );

        assert.isTrue(
          pixels.length === area.coords.length &&
            pixels.every((value, at) => Math.abs(value - Arr.getUnsafe(area.coords, at)) < 1e-9),
          `${JSON.stringify(stage)} writes ${written} for the area drawn at ${area.coords.join(",")}`,
        );

        if (stage.extent === "tiny" && stage.coordinates === "pixels") {
          const own = boundsOf(area);

          assert.isBelow(Math.min(own.right - own.left, own.bottom - own.top), 24);
        }
      }
    }
  });
});
