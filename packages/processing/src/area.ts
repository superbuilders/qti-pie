/**
 * Whether an area holds a point: the one geometry every area reader shares, `qti-inside`,
 * `qti-map-response-point` and the marks an area mapping gives (D5).
 *
 * An area reaches the evaluator resolved (the IR's `Area`): the compiler reads its `shape` and
 * `coords` once, at the boundary, as QTI's `Coords` reads them (section 7.9 and ShapeEnum, section
 * 8.29) and the HTML Standard's image-map processing reads coordinates that do not fit a shape
 * (reading `area-coords-fit`), each percentage of the image's size taken at compile (reading
 * `circle-percentage-radius`), and gives every coordinate as an integer over the area's one
 * denominator. So no percentage, no image and no double reaches here, and an area that holds no
 * point (too few coordinates, a zero radius) is `nowhere`, never a shape to defend. A point on an
 * area's edge is inside it (reading `area-mapping`); a `poly` is filled by the even-odd rule. Every
 * test is a sum or product of integers, the point scaled by the denominator.
 *
 * @module
 */
import type { Area, Vertex } from "#processing/ir.ts";
import type { Point } from "#processing/value.ts";

/**
 * Whether a value lies between two ends, either first, ends included.
 *
 * @param value - The value.
 * @param one - One end.
 * @param other - The other end.
 * @returns Whether it is between them.
 */
const between = (value: bigint, one: bigint, other: bigint): boolean =>
  one <= other ? one <= value && value <= other : other <= value && value <= one;

/**
 * Whether a point is on a segment: collinear with its ends and between them.
 *
 * @param point - The point.
 * @param from - The segment's one end.
 * @param to - Its other end.
 * @returns Whether the segment holds it.
 */
const onSegment = (point: Vertex, from: Vertex, to: Vertex): boolean =>
  (to.x - from.x) * (point.y - from.y) === (to.y - from.y) * (point.x - from.x) &&
  between(point.x, from.x, to.x) &&
  between(point.y, from.y, to.y);

/**
 * Whether a polygon holds a point: on an edge, or inside by the even-odd rule, counting the edges a
 * ray from the point toward +x crosses.
 *
 * @param vertices - The vertices.
 * @param point - The point.
 * @returns Whether it is inside or on the boundary.
 */
const polygonHolds = (vertices: readonly Vertex[], point: Vertex): boolean => {
  let inside = false;
  let from = vertices.at(-1);
  for (const to of vertices) {
    if (from === undefined) {
      break;
    }

    if (onSegment(point, from, to)) {
      return true;
    }

    const toAbove = to.y > point.y;
    if (from.y > point.y !== toAbove) {
      const side = (to.x - from.x) * (point.y - from.y) - (point.x - from.x) * (to.y - from.y);
      if (toAbove ? side > 0n : side < 0n) {
        inside = !inside;
      }
    }

    from = to;
  }

  return inside;
};

/**
 * Whether an area holds a point (readings `area-mapping`, `area-coords-fit` and
 * `circle-percentage-radius`).
 *
 * @param area - The resolved area.
 * @param point - The point, in the image's units.
 * @returns Whether the point is inside the area or on its edge.
 */
export const inside = (area: Area, point: Point): boolean => {
  switch (area.kind) {
    case "everywhere": {
      return true;
    }
    case "nowhere": {
      return false;
    }
    case "rect": {
      const x = point.x * area.denominator;
      const y = point.y * area.denominator;

      return area.left <= x && x <= area.right && area.top <= y && y <= area.bottom;
    }
    case "circle": {
      const dx = point.x * area.denominator - area.centre.x;
      const dy = point.y * area.denominator - area.centre.y;

      return dx * dx + dy * dy <= area.radius * area.radius;
    }
    case "ellipse": {
      const dx = (point.x * area.denominator - area.centre.x) * area.down;
      const dy = (point.y * area.denominator - area.centre.y) * area.across;
      const both = area.across * area.down;

      return dx * dx + dy * dy <= both * both;
    }
    case "poly": {
      return polygonHolds(area.vertices, {
        x: point.x * area.denominator,
        y: point.y * area.denominator,
      });
    }
  }
};
