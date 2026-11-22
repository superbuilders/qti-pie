/**
 * Select Point's points as its island holds, posts and changes them: the points a response's
 * texts hold, the texts they post, each step a child takes, a mark, a move or a removal, with the
 * one refusal, a mark past `max-choices`, and the keyboard's cross. Pure, and safe to import on the
 * server and the client.
 *
 * A point is two whole numbers, x then y, in the image's own pixels from its top-left corner
 * (QTI's `point` base type, information model 5.128), and a Select Point's response posts each
 * point as one entry under its name, the point's lexical form, its two coordinates separated by a
 * space, which plate's `decode` reads as a point. Every point a step gives lies on the image, from
 * 0 to its width across and from 0 to its height down, so the core's validation accepts it under
 * either tier.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_SelectPointInteraction
 */
import { Option } from "effect";
import type { ImageSize } from "#plate/interactions/image-size.ts";
import { pointCoordinates } from "#plate/model/values.ts";
import type { ImagePoint } from "#plate/ui/graphic/geometry.ts";
import type { Picks } from "#plate/interactions/picks.ts";

/**
 * A point on the image, in its own pixels, each coordinate a whole number.
 */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * One step a child takes, as its points come out of it: a point marked or moved, by its index among
 * the points, where it now is, and the points after it; a point removed, by the index it had, and
 * the points after it; or a mark refused, with the most points the interaction takes. A refused
 * step carries no points: nothing changes.
 */
export type Step =
  | {
      readonly at: Point;
      readonly index: number;
      readonly kind: "marked" | "moved";
      readonly points: readonly Point[];
    }
  | { readonly index: number; readonly kind: "removed"; readonly points: readonly Point[] }
  | { readonly kind: "refused"; readonly limit: number };

/**
 * The radii around a point, in the image's pixels, within which a tap or the keyboard's cross
 * reaches its marker, across and down: the marker's reach on the page divided by the image's
 * scale on each axis.
 */
export interface Reach {
  readonly x: number;
  readonly y: number;
}

/**
 * How many of the image's own pixels an arrow key moves the cross, and how many Shift with an
 * arrow moves it: the stage's keyboard rule for Select Point, one authored pixel and ten.
 */
const steps = { far: 10, near: 1 } as const;

/**
 * Read a point from the text it posts as, as the value model reads a point's text
 * ({@link pointCoordinates}) and the form encoding reads a posted point: two whole numbers
 * separated by XML white space, x then y.
 *
 * @param text The text.
 * @returns The point, none for text that is not a point's lexical form.
 */
const pointOf = (text: string): Option.Option<Point> =>
  Option.map(pointCoordinates(text), ([x, y]) => ({ x: Number(x), y: Number(y) }));

/**
 * Read the points a response's texts hold, one per text, in posting order. A text that is no
 * point, which only a post without script can leave, is no point the island can show, and the
 * next step drops it.
 *
 * @param texts The texts the response posts.
 * @returns The points, in order.
 */
export const pointsOf = (texts: readonly string[]): readonly Point[] =>
  texts.flatMap((text) => Option.toArray(pointOf(text)));

/**
 * Write the texts points post: each point's lexical form, its x, a space, then its y, as the
 * core's `format` writes a point.
 *
 * @param points The points, in order.
 * @returns The texts, one per point.
 */
export const textsOf = (points: readonly Point[]): readonly string[] =>
  points.map((point) => `${String(point.x)} ${String(point.y)}`);

/**
 * Give the whole number nearest a coordinate, no lower than 0 and no higher than a bound.
 *
 * @param value The coordinate.
 * @param bound The image's side along it.
 * @returns The coordinate on the image.
 */
const onSide = (value: number, bound: number): number =>
  Math.min(bound, Math.max(0, Math.round(value)));

/**
 * Give the point of the image a position names: the nearest whole pixel, held on the image, so a
 * pointer mapped to the image's pixels, or an arrow pressed at its edge, gives a point the core
 * accepts.
 *
 * @param at The position, in the image's pixels.
 * @param size The image's size.
 * @returns The point.
 */
export const pointOn = (at: ImagePoint, size: ImageSize): Point => ({
  x: onSide(at.x, size.width),
  y: onSide(at.y, size.height),
});

/**
 * Report whether a position lies on the image, its edges included, as the stage reads a tap: a
 * drag released anywhere else puts its point back.
 *
 * @param at The position, in the image's pixels.
 * @param size The image's size.
 * @returns Whether it is on the image.
 */
export const isOnImage = (at: ImagePoint, size: ImageSize): boolean =>
  at.x >= 0 && at.y >= 0 && at.x <= size.width && at.y <= size.height;

/**
 * Give the middle of the image, where the keyboard's cross starts.
 *
 * @param size The image's size.
 * @returns The point.
 */
export const middleOf = (size: ImageSize): Point =>
  pointOn({ x: size.width / 2, y: size.height / 2 }, size);

/**
 * Mark a point: for `one`, the one point, moved there when one is marked already; else one more
 * point after the others, refused when they hold `at-most`'s `n` already.
 *
 * @param points The points.
 * @param at The point to mark.
 * @param picks How many points the child marks: `one` for a `single` response, or a `multiple` one
 *   whose `max-choices` is 1; else `any`, for a `max-choices` of 0, the XSD's default, which is no
 *   limit (5.128.2), or `at-most` `max-choices`.
 * @returns The step.
 */
export const mark = (points: readonly Point[], at: Point, picks: Picks): Step => {
  if (picks.kind === "one") {
    return { at, index: 0, kind: points.length === 0 ? "marked" : "moved", points: [at] };
  }

  if (picks.kind === "at-most" && points.length >= picks.n) {
    return { kind: "refused", limit: picks.n };
  }

  return { at, index: points.length, kind: "marked", points: [...points, at] };
};

/**
 * Remove a point.
 *
 * @param points The points.
 * @param index The point's index.
 * @returns The step, the later points one place earlier.
 */
export const remove = (points: readonly Point[], index: number): Step => ({
  index,
  kind: "removed",
  points: points.filter((_, at) => at !== index),
});

/**
 * Move a point.
 *
 * @param points The points.
 * @param index The point's index.
 * @param to Where it goes.
 * @returns The step, the point in its place among the others.
 */
export const move = (points: readonly Point[], index: number, to: Point): Step => ({
  at: to,
  index,
  kind: "moved",
  points: points.map((point, at) => (at === index ? to : point)),
});

/**
 * Find the point whose marker reaches a position: the last listed whose ellipse of the reach's
 * radii around it holds the position, boundary included, since a later marker is drawn over an
 * earlier one and a tap reaches the one on top.
 *
 * @param points The points.
 * @param at The position, in the image's pixels.
 * @param reach The marker's radii, in the image's pixels.
 * @returns The point's index, or none.
 */
export const markerAt = (
  points: readonly Point[],
  at: ImagePoint,
  reach: Reach,
): number | undefined => {
  const index = points.findLastIndex(
    (point) => ((at.x - point.x) / reach.x) ** 2 + ((at.y - point.y) / reach.y) ** 2 <= 1,
  );

  return index === -1 ? undefined : index;
};

/**
 * Take a press at a point, as a tap there or Enter with the cross there takes it: remove the point
 * whose marker reaches it, else mark it.
 *
 * @param points The points.
 * @param at The point pressed.
 * @param picks How many points the child marks.
 * @param reach The marker's radii, in the image's pixels.
 * @returns The step.
 */
export const pressAt = (points: readonly Point[], at: Point, picks: Picks, reach: Reach): Step => {
  const hit = markerAt(points, at, reach);

  return hit === undefined ? mark(points, at, picks) : remove(points, hit);
};

/**
 * An arrow key's direction across and down.
 */
const directions = {
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
} as const satisfies Readonly<Record<string, readonly [x: number, y: number]>>;

/**
 * Report whether a key is an arrow, which moves the cross.
 *
 * @param key The key, `KeyboardEvent.key`.
 * @returns Whether it is one of {@link directions}.
 */
const isArrow = (key: string): key is keyof typeof directions => Object.hasOwn(directions, key);

/**
 * Move the keyboard's cross for an arrow key: one of the image's own pixels along the arrow, ten
 * with Shift, held on the image. Left and Right are the image's own, whatever the page's
 * direction, since a point's x counts from the image's left edge.
 *
 * @param cross Where the cross is.
 * @param key The key, `KeyboardEvent.key`.
 * @param far Whether Shift is held.
 * @param size The image's size.
 * @returns Where the cross goes, or none for a key that is no arrow.
 */
export const nudge = (
  cross: Point,
  key: string,
  far: boolean,
  size: ImageSize,
): Point | undefined => {
  if (!isArrow(key)) {
    return undefined;
  }

  const step = far ? steps.far : steps.near;
  const [across, down] = directions[key];

  return pointOn(
    {
      x: cross.x + across * step,
      y: cross.y + down * step,
    },
    size,
  );
};
