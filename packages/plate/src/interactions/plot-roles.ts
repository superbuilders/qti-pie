/**
 * What a Graphic Gap Match's root, gap texts and hotspots are to the plot plate draws over its
 * picture, read from plate's renderer classes on them (`rendererClasses` in
 * `#plate/vocabulary.ts`): the plot the root asks for and the target size its hotspots keep; the
 * box plot's statistic a gap text places or a hotspot stands for (R8); and the number line's dot a
 * gap text draws (R7). Each is presentation alone; no response, limit or name reads it. The server
 * reads them and hands the island what they say, so the plot's drawing (`#plate/graphic/plot.ts`)
 * and the page read no class.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { TargetFloor } from "#plate/graphic/scale.ts";
import { carriesRendererClass } from "#plate/vocabulary.ts";
import type { RendererClass } from "#plate/vocabulary.ts";

/**
 * Give the target size a Graphic Gap Match's hotspots keep on its stage: 24 px where its root
 * carries `plate-lattice`, a graph whose hotspots tile its plot, else 44 px (`TargetFloor` in
 * `#plate/graphic/scale.ts`).
 *
 * @param classes The class the root carries, none when it carries none.
 * @returns The floor.
 */
export const floorOf = (classes: Option.Option<string>): TargetFloor =>
  carriesRendererClass(classes, "plate-lattice") ? "minimum" : "enhanced";

/**
 * What a Graphic Gap Match's plot draws, by its root's class: `line` or `segment` through each gap
 * text's two placements (R6), a `box-plot` from its statistics (R8), a `number-line`'s dots (R7),
 * a `dot-plot`'s placed choices stacked up its columns (M44), or nothing beyond the interaction,
 * `plain`.
 */
export type PlotKind = "box-plot" | "dot-plot" | "line" | "number-line" | "plain" | "segment";

/**
 * Each plot's class on the root.
 */
const plotClasses: readonly (readonly [RendererClass, Exclude<PlotKind, "plain">])[] = [
  ["plate-graph-line", "line"],
  ["plate-graph-segment", "segment"],
  ["plate-box-plot", "box-plot"],
  ["plate-number-line-graph", "number-line"],
  ["plate-dot-plot", "dot-plot"],
];

/**
 * Read a Graphic Gap Match's plot from its root's class: the one plot whose class it holds, and
 * `plain` where it holds none, or two, which ask for no one drawing.
 *
 * @param classes The class the root carries, none when it carries none.
 * @returns The plot.
 */
export const plotKindOf = (classes: Option.Option<string>): PlotKind => {
  const asked = plotClasses.filter(([name]) => carriesRendererClass(classes, name));
  const [only] = asked;

  return only !== undefined && asked.length === 1 ? only[1] : "plain";
};

/**
 * The five statistics of a box plot, in the order its axis shows them.
 */
export const statistics = ["min", "q1", "median", "q3", "max"] as const;

/**
 * One of {@link statistics}.
 */
export type Statistic = (typeof statistics)[number];

/**
 * Each statistic's class.
 */
const statisticClasses = {
  max: "plate-stat-max",
  median: "plate-stat-median",
  min: "plate-stat-min",
  q1: "plate-stat-q1",
  q3: "plate-stat-q3",
} as const satisfies Readonly<Record<Statistic, RendererClass>>;

/**
 * Read the box plot's statistic an element's class names: the one statistic whose class it holds,
 * and none where it holds none, or two, which name no one statistic.
 *
 * @param classes The element's `class` as written, none when absent.
 * @returns The statistic, none for none.
 */
export const statisticOf = (classes: Option.Option<string>): Option.Option<Statistic> => {
  const named = statistics.filter((statistic) =>
    carriesRendererClass(classes, statisticClasses[statistic]),
  );

  return named.length === 1 ? Arr.head(named) : Option.none();
};

/**
 * How a number line's dot is drawn: hollow, an endpoint the set leaves out, or filled, one it
 * holds.
 */
export type PointStyle = "closed" | "open";

/**
 * Read the dot a gap text's class asks for: open where it holds `plate-point-open`, closed where
 * it holds `plate-point-closed`, and none where it holds neither, or both.
 *
 * @param classes The gap text's `class` as written, none when absent.
 * @returns The dot's style, none for none.
 */
export const pointStyleOf = (classes: Option.Option<string>): Option.Option<PointStyle> => {
  const open = carriesRendererClass(classes, "plate-point-open");

  if (open === carriesRendererClass(classes, "plate-point-closed")) {
    return Option.none();
  }

  return Option.some(open ? "open" : "closed");
};

/**
 * Which way a number line's ray runs from its dot: to the line's left end, or its right.
 */
export type ShadeDirection = "left" | "right";

/**
 * Read the way a choice of a shading interaction runs the ray, from its class: left where it
 * holds `plate-shade-left`, right where it holds `plate-shade-right`, and none where it holds
 * neither, or both.
 *
 * @param classes The choice's `class` as written, none when absent.
 * @returns The direction, none for none.
 */
export const shadeOf = (classes: Option.Option<string>): Option.Option<ShadeDirection> => {
  const left = carriesRendererClass(classes, "plate-shade-left");

  if (left === carriesRendererClass(classes, "plate-shade-right")) {
    return Option.none();
  }

  return Option.some(left ? "left" : "right");
};
