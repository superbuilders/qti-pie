/**
 * The words a Select Point says: its board's name and keys, what it announces as a point is
 * marked, moved or removed, each point's button in its list, and why a mark was refused. The
 * server fills them from plate's message catalog and passes them to the island as plain strings,
 * so no wording ships in the client's code.
 *
 * @module
 */
import { graphicKeys } from "#plate/ui/graphic/labels.ts";
import type { LabelKeys, Labels } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for every text a Select Point writes for the child, its stage's among them
 * (`graphicKeys`). A point is told by `{n}`, its number among the points from 1, and `{x}` and
 * `{y}`, its coordinates in the image's pixels from the left and from the top, which the island
 * fills; the cross by its `{x}` and `{y}`.
 */
export const selectPointKeys = {
  ...graphicKeys,
  /**
   * Said as the arrow keys move the cross, with `{x}` and `{y}` where it now is.
   */
  cross: "selectPointCross",
  /**
   * The description of the stage's region: which keys move the cross, mark a point and remove
   * one.
   */
  keys: "selectPointKeys",
  /**
   * Said and shown when a mark past `max-choices` is refused, with `{n}` for `max-choices`.
   */
  limit: "selectPointLimit",
  /**
   * Said when a point is marked, with `{n}`, `{x}` and `{y}`.
   */
  marked: "selectPointMarked",
  /**
   * Said when a point is moved, by a drag or by marking the one point of a single response
   * elsewhere, with `{n}`, `{x}` and `{y}` where it now is.
   */
  moved: "selectPointMoved",
  /**
   * The name and text of a point's button in the list, which removes it, with `{n}`, `{x}` and
   * `{y}`.
   */
  point: "selectPointPoint",
  /**
   * Said when a point is removed, with `{n}`, the number it had.
   */
  removed: "selectPointRemoved",
  /**
   * The role description of the stage's region, an application the arrow keys work in, which a
   * screen reader says in place of "application".
   */
  role: "selectPointRole",
} as const satisfies LabelKeys<
  | "cross"
  | "keys"
  | "limit"
  | "marked"
  | "moved"
  | "picture"
  | "point"
  | "removed"
  | "role"
  | "scroll"
>;

/**
 * Every text a Select Point writes for the child, as the server filled it.
 */
export type SelectPointLabels = Labels<typeof selectPointKeys>;
