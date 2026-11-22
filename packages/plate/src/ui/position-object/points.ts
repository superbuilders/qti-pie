/**
 * A Position Object's placed copies as the island reads and writes them: the points its response
 * holds, each the place on the stage its object's centre point lands on, in the stage image's own
 * pixels. Pure, and safe to import on the server and the client.
 *
 * A `point` response posts each value as one entry under its entry name, the point's lexical form,
 * its x and its y separated by a space (QTI's point type: "two integers separated by white space"),
 * so the island writes one entry per copy, in the order the copies were placed. A point is two
 * whole numbers, so a copy lands on a whole pixel.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Root_PositionObjectInteraction
 */
import { Option } from "effect";
import type { ImageSize } from "#plate/interactions/image-size.ts";
import { pointCoordinates } from "#plate/model/values.ts";
import type { ImagePoint } from "#plate/ui/graphic/geometry.ts";
import type { PostedEntries, PostedEntry } from "#plate/ui/responses.tsx";

/**
 * Read a point from the text it posts, as the value model reads a point's text
 * ({@link pointCoordinates}): two whole numbers separated by XML white space, x then y.
 *
 * @param text The text.
 * @returns The point, none where the text is not two whole numbers.
 */
const pointOf = (text: string): Option.Option<ImagePoint> =>
  Option.map(pointCoordinates(text), ([x, y]) => ({ x: Number(x), y: Number(y) }));

/**
 * Read the points a response's entries hold, an entry that is no point left out.
 *
 * @param entries The entries, any other names' among them.
 * @param name The entry name the response posts under.
 * @returns The points, in posted order.
 */
export const pointsOf = (entries: PostedEntries, name: string): readonly ImagePoint[] =>
  entries.flatMap(([entry, text]) => (entry === name ? Option.toArray(pointOf(text)) : []));

/**
 * Write points as the entries a response posts: one per point, its x and its y separated by a
 * space.
 *
 * @param points The points, in order.
 * @param name The entry name the response posts under.
 * @returns The entries.
 */
const entriesOf = (points: readonly ImagePoint[], name: string): PostedEntries =>
  points.map((point): PostedEntry => [name, `${String(point.x)} ${String(point.y)}`]);

/**
 * Replace one response's points among an island's entries, keeping every other response's entries
 * as they are and in their order.
 *
 * @param entries Every entry the island posts.
 * @param name The entry name of the response whose points change.
 * @param points The response's points now.
 * @returns The entries.
 */
export const withPoints = (
  entries: PostedEntries,
  name: string,
  points: readonly ImagePoint[],
): PostedEntries => [...entries.filter(([entry]) => entry !== name), ...entriesOf(points, name)];

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
