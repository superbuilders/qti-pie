/**
 * The English texts of the Select Point interaction's island and review (Q-18,
 * `#plate/ui/select-point/`). One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * Select Point's texts, keyed by the role each plays.
 *
 * The stage's region, where the child marks the picture, is an application whose role a screen
 * reader names `selectPointRole`, described by `selectPointKeys`, its keys. A point is told by its
 * number among the points, `{n}` from 1, and its place on the image, `{x}` pixels from the left and
 * `{y}` from the top, as QTI writes a point's coordinates: the island says `selectPointCross` as
 * the arrow keys move its cross, `selectPointMarked`, `selectPointMoved` and `selectPointRemoved`
 * as it marks, moves and removes one, names each point's button in its list `selectPointPoint`, and
 * says `selectPointLimit`, `{n}` the most points the interaction takes, when a mark past them is
 * refused. A review lists each point it shows as `selectPointShown`.
 */
export const selectPointMessages = {
  selectPointAtLeast: "Mark at least {n} points.",
  selectPointAtLeastOne: "Mark at least 1 point.",
  selectPointAtMost: "Mark at most {n} points.",
  selectPointAtMostOne: "Mark at most 1 point.",
  selectPointCross: "Cross at {x} across and {y} down.",
  selectPointKeys:
    "Arrow keys move the cross, and Shift with an arrow moves it ten times as far. Enter or Space marks a point at the cross, or removes the point there. Delete removes the point at the cross.",
  selectPointLimit: "You can mark up to {n} points. Remove one to mark another.",
  selectPointMalformed:
    "Give each point as two whole numbers, x from 0 to {width} and y from 0 to {height}.",
  selectPointMarked: "Point {n} marked, {x} across and {y} down.",
  selectPointMoved: "Point {n} moved to {x} across and {y} down.",
  selectPointOutside: "Point {n}: {axis} must be from 0 to {bound}.",
  selectPointPoint: "Remove point {n}, {x} across and {y} down",
  selectPointRemoved: "Point {n} removed.",
  selectPointRole: "picture to mark",
  selectPointShown: "Point {n}, {x} across and {y} down",
} as const;
