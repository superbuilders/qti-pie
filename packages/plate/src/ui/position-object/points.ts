/**
 * A Position Object's placed copies as the island reads and writes them: the points its response
 * holds, each the place on the stage its object's centre point lands on, in the stage image's own
 * pixels. Pure, and safe to import on the server and the client.
 *
 * A `point` response holds each copy as one `point` value, its x and its y (QTI's point type: "two
 * integers"), so the island writes one value per copy, in the order the copies were placed. A point
 * is two whole numbers, so a copy lands on a whole pixel.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Root_PositionObjectInteraction
 */
import type { ImageSize } from "#plate/interactions/image-size.ts";
import type { ImagePoint } from "#plate/graphic/geometry.ts";

/**
 * The placed copies of every interaction of a stage, by the identifier of the response each binds,
 * each interaction's points in the order its copies were placed.
 */
export type Placements = ReadonlyMap<string, readonly ImagePoint[]>;

/**
 * Read the points a response's values hold, one per value, in order: each value's two coordinates,
 * x then y, as the island's numbers.
 *
 * @param values The response's point values.
 * @returns The points, in order.
 */
export const pointsOf = (values: readonly (readonly [bigint, bigint])[]): readonly ImagePoint[] =>
  values.map(([x, y]) => ({ x: Number(x), y: Number(y) }));

/**
 * Write the values points hold: each point's two coordinates, x then y, as whole numbers.
 *
 * @param points The points, in order, each on a whole pixel.
 * @returns The values, one per point.
 */
export const valuesOf = (points: readonly ImagePoint[]): readonly (readonly [bigint, bigint])[] =>
  points.map((point) => [BigInt(point.x), BigInt(point.y)]);

/**
 * Replace one response's points among a stage's placements, keeping every other response's points
 * as they are.
 *
 * @param placements Every interaction's placed copies.
 * @param response The identifier of the response whose points change.
 * @param points The response's points now.
 * @returns The placements.
 */
export const withPoints = (
  placements: Placements,
  response: string,
  points: readonly ImagePoint[],
): Placements => new Map([...placements, [response, points]]);

/**
 * Give the whole pixel of the stage a point lands on: the point rounded to whole numbers and held
 * to the stage, from 0 to its width and from 0 to its height, the bounds `validate-responses` holds
 * a posted point to.
 *
 * @param point The point, in the stage image's pixels.
 * @param size The stage image's size.
 * @returns The point placed.
 */
export const pointOn = (point: ImagePoint, size: ImageSize): ImagePoint => ({
  x: Math.min(size.width, Math.max(0, Math.round(point.x))),
  y: Math.min(size.height, Math.max(0, Math.round(point.y))),
});

/**
 * Give the middle of the stage, on a whole pixel: where a copy picked up from its object waits
 * until the child puts it somewhere.
 *
 * @param size The stage image's size.
 * @returns The point.
 */
export const middleOf = (size: ImageSize): ImagePoint =>
  pointOn({ x: size.width / 2, y: size.height / 2 }, size);
