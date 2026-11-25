import { regex } from "arkregex";
import type { Gen } from "@bjornpagen/testing/gen";
/**
 * The stage the six graphic kinds share (Hotspot, Graphic Associate, Graphic Gap Match, Graphic
 * Order, Select Point, Position Object): the picture an interaction's areas are drawn on, where
 * each area sits on it, the attributes QTI writes for it, and the outline and name the placeholder
 * draws for it, so the picture shows what the child is asked to find and never which area is
 * right.
 *
 * The areas stand on a grid of near-square cells over the picture, one to a cell in reading order,
 * each centred in its cell, so no two overlap; a default area, where a kind writes one, is the
 * whole picture. Every coordinate is in the picture's authored pixels, which is the space plate
 * reads an area's coordinates in (`graphic/geometry.ts`), written as whole pixels or as whole
 * percentages of the picture, the only percentages QTI's `coords` admit.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import { dimension } from "#specimen/dimension.ts";
import type { Picker } from "#specimen/dimension.ts";
import { aspect, placed, placeholder, scale, sizeOf, svgAddress } from "#specimen/picture.ts";
import type { Asset, Picture, Size } from "#specimen/picture.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * The geometries an area is drawn as: each of QTI's but `default`, which is the whole picture.
 */
type Geometry = "circle" | "ellipse" | "poly" | "rect";

/**
 * The geometry every area of a stage takes: all one, or each in turn, from the rectangle.
 */
const geometry = dimension("Areas' shape", [
  ["mixed", "Each in turn", "mixed"],
  ["rect", "Rectangles", "rect"],
  ["circle", "Circles", "circle"],
  ["ellipse", "Ellipses", "ellipse"],
  ["poly", "Triangles", "poly"],
]);

/**
 * How big each area is: half its cell; `tiny`, 12 authored pixels across, under the 24 px a
 * target needs, so plate's stage scales the picture up to give it room (`graphic/scale.ts`); or
 * the cell less a margin.
 */
const extent = dimension("Areas' size", [
  ["normal", "Half a cell", "normal"],
  ["tiny", "Tiny (12 px)", "tiny"],
  ["large", "A whole cell", "large"],
]);

/**
 * How the areas' `coords` are written: whole pixels, or whole percentages of the picture.
 */
const coordinates = dimension("Coordinates", [
  ["pixels", "Pixels", "pixels"],
  ["percent", "Percentages", "percent"],
]);

/**
 * Whether the picture's `img` writes its `width` and `height`, or leaves plate to read its
 * natural size once it loads.
 */
const sizing = dimension("Picture's size", [
  ["written", "Written", "written"],
  ["natural", "Left to the picture", "natural"],
]);

/**
 * The element that carries the picture: an `img`, or a `picture` holding a `source` and its
 * `img`.
 */
const carrier = dimension("Picture element", [
  ["img", "img", "img"],
  ["picture", "picture", "picture"],
]);

/**
 * The dimensions of a stage whose picture's size is written and whose areas are pixels: a Select
 * Point's or a Position Object's, since plate gives either interaction its notice for a picture
 * of no written size, and their areas are an area mapping's, which writes pixels.
 */
export const sizedStageDimensions = {
  "stage-aspect": aspect,
  "stage-carrier": carrier,
  "stage-extent": extent,
  "stage-geometry": geometry,
  "stage-scale": scale,
} as const;

/**
 * The dimensions of a stage whose areas QTI writes as hotspots: a sized stage's, and how the
 * picture's size and the areas' coordinates are written.
 */
export const stageDimensions = {
  ...sizedStageDimensions,
  "stage-coordinates": coordinates,
  "stage-sizing": sizing,
} as const;

/**
 * The values of the stage's dimensions, by name.
 */
type StageValues = {
  readonly [
    N in keyof typeof stageDimensions
  ]: (typeof stageDimensions)[N]["values"][number]["value"];
};

/**
 * The values of a sized stage's dimensions, by name.
 */
type SizedStageValues = Pick<StageValues, keyof typeof sizedStageDimensions>;

/**
 * A stage's settings: its picture, and how its areas are drawn and written.
 */
export interface Stage {
  readonly carrier: StageValues["stage-carrier"];
  readonly coordinates: StageValues["stage-coordinates"];
  readonly extent: StageValues["stage-extent"];
  readonly geometry: StageValues["stage-geometry"];
  readonly picture: Picture;
  readonly sizing: StageValues["stage-sizing"];
}

/**
 * Draw a sized stage: every dimension of {@link sizedStageDimensions}, its picture's size
 * written and its areas in pixels.
 *
 * @param pick The kind's picker, which holds the sized stage's dimensions.
 * @returns The stage.
 */
export const sizedStageOf =
  (pick: Picker<SizedStageValues>): Gen<Stage> =>
  (source) => ({
    carrier: source.draw(pick("stage-carrier")),
    coordinates: "pixels",
    extent: source.draw(pick("stage-extent")),
    geometry: source.draw(pick("stage-geometry")),
    picture: { aspect: source.draw(pick("stage-aspect")), scale: source.draw(pick("stage-scale")) },
    sizing: "written",
  });

/**
 * Draw a stage whose areas QTI writes as hotspots: every dimension of {@link stageDimensions}.
 *
 * @param pick The kind's picker, which holds the stage's dimensions.
 * @returns The stage.
 */
export const stageOf =
  (pick: Picker<StageValues>): Gen<Stage> =>
  (source) => ({
    ...source.draw(sizedStageOf(pick)),
    coordinates: source.draw(pick("stage-coordinates")),
    sizing: source.draw(pick("stage-sizing")),
  });

/**
 * An area placed on a stage: its geometry, its coordinates as QTI writes them, each a whole number
 * of the stage's unit (a pixel, or a percentage of its side of the picture), the same coordinates
 * in pixels, and its centre, the pixel a child's tap on it lands on.
 */
export interface Area {
  readonly centre: readonly [x: number, y: number];
  readonly coords: readonly number[];
  readonly geometry: Geometry;
  readonly written: readonly number[];
}

/**
 * The share of a cell an area of each extent spans; a tiny one spans {@link tinyAcross} pixels.
 */
const spans = { large: 0.8, normal: 0.5, tiny: 0 } as const satisfies Record<
  Stage["extent"],
  number
>;

/**
 * How many authored pixels a tiny area spans: half the 24 px WCAG 2.5.8 asks of a target.
 */
const tinyAcross = 12;

/**
 * The geometries a stage of mixed areas gives them, in turn.
 */
const mixed = ["rect", "circle", "ellipse", "poly"] as const satisfies readonly Geometry[];

/**
 * The geometry of the area at a place, as the stage's geometry gives it.
 *
 * @param held The stage's geometry.
 * @param at The area's place, from 0.
 * @returns Its geometry.
 */
const geometryAt = (held: Stage["geometry"], at: number): Geometry =>
  held === "mixed" ? Arr.getUnsafe(mixed, at % mixed.length) : held;

/**
 * The pixels one unit of a coordinate spans: a pixel; or, on a stage that writes percentages, a
 * hundredth of the side the coordinate is a percentage of, as plate reads one
 * (`graphic/geometry.ts`): an x of the width, a y of the height, and a circle's radius of the
 * smaller side.
 */
interface Units {
  readonly radius: number;
  readonly x: number;
  readonly y: number;
}

/**
 * The units a stage writes its coordinates in.
 *
 * @param stage The stage.
 * @returns The pixels each unit spans.
 */
const unitsOf = (stage: Stage): Units => {
  const size = sizeOf(stage.picture);

  switch (stage.coordinates) {
    case "pixels": {
      return { radius: 1, x: 1, y: 1 };
    }
    case "percent": {
      return {
        radius: Math.min(size.width, size.height) / 100,
        x: size.width / 100,
        y: size.height / 100,
      };
    }
  }
};

/**
 * The unit of each coordinate of an area: x and y alternate, but a circle's third coordinate is
 * its radius.
 *
 * @param held The area's geometry.
 * @param units The stage's units.
 * @param at The coordinate's place in `coords`.
 * @returns The pixels its unit spans.
 */
const unitAt = (held: Geometry, units: Units, at: number): number => {
  if (held === "circle" && at === 2) {
    return units.radius;
  }

  return at % 2 === 0 ? units.x : units.y;
};

/**
 * A half-width, half-height or radius in whole units: at least one.
 *
 * @param pixels The reach, in pixels.
 * @param unit The pixels one unit spans.
 * @returns The units.
 */
const reach = (pixels: number, unit: number): number => Math.max(1, Math.round(pixels / unit));

/**
 * Place `count` areas on a stage, one to a cell of a grid whose cells are near square, each
 * centred in its cell and sized by the stage's extent. Each area's centre is a whole unit, and each
 * of its half-widths, half-heights and radii is at least one, so no area written in percentages of
 * a large picture shrinks to nothing.
 *
 * @param stage The stage.
 * @param count How many areas; at least 1 is placed.
 * @returns Each area, in reading order.
 */
export const areasOf = (stage: Stage, count: number): Arr.NonEmptyReadonlyArray<Area> => {
  const size = sizeOf(stage.picture);
  const units = unitsOf(stage);
  const columns = Math.max(
    1,
    Math.min(count, Math.round(Math.sqrt((count * size.width) / size.height))),
  );
  const rows = Math.ceil(count / columns);
  const cell = { height: size.height / rows, width: size.width / columns };
  const share = spans[stage.extent];
  const wide = share === 0 ? tinyAcross : cell.width * share;
  const tall = share === 0 ? tinyAcross : cell.height * share;
  const half = Math.min(wide, tall) / 2;

  const areaAt = (at: number): Area => {
    const held = geometryAt(stage.geometry, at);
    const x = Math.round((((at % columns) + 0.5) * cell.width) / units.x);
    const y = Math.round(((Math.floor(at / columns) + 0.5) * cell.height) / units.y);
    const placedAs = (written: readonly number[]): Area => ({
      centre: [Math.round(x * units.x), Math.round(y * units.y)],
      coords: written.map((value, place) => value * unitAt(held, units, place)),
      geometry: held,
      written,
    });

    switch (held) {
      case "rect": {
        const across = reach(wide / 2, units.x);
        const down = reach(tall / 2, units.y);

        return placedAs([x - across, y - down, x + across, y + down]);
      }
      case "circle": {
        return placedAs([x, y, reach(half, units.radius)]);
      }
      case "ellipse": {
        return placedAs([x, y, reach(wide / 2, units.x), reach(Math.max(tall * 0.3, 1), units.y)]);
      }
      case "poly": {
        const across = reach(half, units.x);
        const down = reach(half, units.y);

        return placedAs([x, y - down, x + across, y + down, x - across, y + down]);
      }
    }
  };

  return [areaAt(0), ...Array.from({ length: count - 1 }, (_, at) => areaAt(at + 1))];
};

/**
 * An area's `coords` as the stage writes coordinates: whole pixels, or whole percentages.
 *
 * @param stage The stage.
 * @param area The area.
 * @returns The attribute's text.
 */
const coordsOf = (stage: Stage, area: Area): string => {
  switch (stage.coordinates) {
    case "pixels": {
      return area.written.join(",");
    }
    case "percent": {
      return area.written.map((value) => `${String(value)}%`).join(",");
    }
  }
};

/**
 * An area's attributes as QTI writes them, by name: its geometry and its `coords`. They are built
 * from their names, since QTI names the geometry `shape`.
 *
 * @param stage The stage.
 * @param area The area.
 * @returns The attributes.
 */
export const areaAttributes = (stage: Stage, area: Area) =>
  Object.fromEntries([
    ["coords", coordsOf(stage, area)],
    ["shape", area.geometry],
  ]);

/**
 * A default area's attributes: the whole picture, its `coords` in pixels, which plate reads as
 * written and ignores.
 *
 * @param stage The stage.
 * @returns The attributes.
 */
export const restAttributes = (stage: Stage) => {
  const size = sizeOf(stage.picture);

  return Object.fromEntries([
    ["coords", `0,0,${String(size.width)},${String(size.height)}`],
    ["shape", "default"],
  ]);
};

/**
 * The lowest pixel row an area reaches.
 *
 * @param area The area.
 * @returns Its bottom.
 */
const bottomOf = (area: Area): number => {
  const [, y = 0, third = 0, fourth = 0] = area.coords;

  switch (area.geometry) {
    case "rect": {
      return fourth;
    }
    case "circle": {
      return y + third;
    }
    case "ellipse": {
      return y + fourth;
    }
    case "poly": {
      return Arr.reduce(
        area.coords.filter((_, at) => at % 2 === 1),
        Number.NEGATIVE_INFINITY,
        (most, ordinate) => Math.max(most, ordinate),
      );
    }
  }
};

/**
 * How the placeholder paints an area's outline.
 */
const paint = {
  fill: "#ffffff",
  "fill-opacity": 0.6,
  stroke: "#1f2937",
  "stroke-width": 2,
} as const;

/**
 * The outline of an area, in the placeholder's pixels.
 *
 * @param area The area.
 * @returns Its SVG element.
 */
const outlineOf = (area: Area): string => {
  const [first = 0, second = 0, third = 0, fourth = 0] = area.coords;

  switch (area.geometry) {
    case "rect": {
      return element(
        "rect",
        {
          ...paint,
          height: fourth - second,
          width: third - first,
          x: first,
          y: second,
        },
        [],
      );
    }
    case "circle": {
      return element("circle", { ...paint, cx: first, cy: second, r: third }, []);
    }
    case "ellipse": {
      return element("ellipse", { ...paint, cx: first, cy: second, rx: third, ry: fourth }, []);
    }
    case "poly": {
      return element("polygon", { ...paint, points: area.coords.join(",") }, []);
    }
  }
};

/**
 * The marks the placeholder draws for an area: its outline, and its name at its centre, or under
 * it when the area is too small to hold the name.
 *
 * @param size The picture's size.
 * @param area The area.
 * @param name Its name.
 * @returns The marks.
 */
const marksOf = (size: Size, area: Area, name: string): string => {
  const font = Math.max(8, Math.round(Math.min(size.width, size.height) / 24));
  const below = bottomOf(area);

  return (
    outlineOf(area) +
    element(
      "text",
      {
        "dominant-baseline": "middle",
        fill: "#111827",
        "font-family": "sans-serif",
        "font-size": font,
        "text-anchor": "middle",
        x: area.centre[0],
        y: below - area.centre[1] < font ? below + font : area.centre[1],
      },
      [text(name)],
    )
  );
};

/**
 * A stage's picture: its markup in the item and its file beside it.
 */
interface StagePicture {
  readonly asset: Asset;
  readonly markup: string;
}

/**
 * Write a stage's picture: its placeholder, with each named area drawn on it, placed beside the
 * item, and its `img`, or its `picture` holding a `source` and its `img`, as the stage carries it.
 *
 * @param stage The stage.
 * @param label What the picture shows: its alt text, printed on it, and its file's name.
 * @param drawn The areas the picture draws, each with its name.
 * @returns The markup and its file.
 */
export const pictureOf = (
  stage: Stage,
  label: string,
  drawn: readonly Readonly<{ area: Area; name: string }>[],
): StagePicture => {
  const size = sizeOf(stage.picture);
  const file = placed(
    `${label.toLowerCase().replaceAll(regex("[^a-z0-9]+", "gu"), "-")}-${stage.picture.aspect}-${stage.picture.scale}.svg`,
    svgAddress(
      placeholder(
        size,
        label,
        drawn.map(({ area, name }) => marksOf(size, area, name)),
      ),
    ),
  );
  const written = stage.sizing === "written";
  const img = element(
    "img",
    {
      alt: label,
      height: written ? Option.some(size.height) : Option.none(),
      src: file.src,
      width: written ? Option.some(size.width) : Option.none(),
    },
    [],
  );

  switch (stage.carrier) {
    case "img": {
      return { asset: file.asset, markup: img };
    }
    case "picture": {
      return {
        asset: file.asset,
        markup: element("picture", {}, [
          element("source", { srcset: file.src, type: "image/svg+xml" }, []),
          img,
        ]),
      };
    }
  }
};

/**
 * A point a child places on a stage, in its lexical form: x then y, separated by a space.
 *
 * @param point The point, in the picture's pixels.
 * @returns Its text.
 */
export const pointText = (point: readonly [x: number, y: number]): string =>
  `${String(point[0])} ${String(point[1])}`;

/**
 * An area mapping of these areas, each to 1, and every point outside them to `miss`: the
 * declaration part a point response scores by.
 *
 * @param areas The areas a right point lands in, their coordinates in pixels.
 * @param miss What a point in none of them adds.
 * @returns The `qti-area-mapping`.
 */
export const areaMapping = (areas: readonly Area[], miss: number): string =>
  element(
    "qti-area-mapping",
    { "default-value": miss },
    areas.map((area) =>
      element(
        "qti-area-map-entry",
        {
          ...Object.fromEntries([
            ["coords", area.coords.join(",")],
            ["shape", area.geometry],
          ]),
          "mapped-value": 1,
        },
        [],
      ),
    ),
  );
