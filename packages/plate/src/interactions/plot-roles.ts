/**
 * What a gap text or a hotspot of a Graphic Gap Match is to the plot plate draws over its picture,
 * read from plate's renderer classes on it (`rendererClasses` in `#plate/vocabulary.ts`): the box
 * plot's statistic it places or stands for (R8), and the number line's dot it draws (R7). Each is
 * presentation alone; no response, limit or name reads it.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import { carriesRendererClass } from "#plate/vocabulary.ts";
import type { RendererClass } from "#plate/vocabulary.ts";

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
