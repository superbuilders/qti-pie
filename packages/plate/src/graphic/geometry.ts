/**
 * The area geometry every graphic interaction shares: hotspot, graphic gap match, graphic order and
 * graphic associate draw their areas with it, place their badges and chips with it, and say which
 * area a point falls in with it. Pure, and safe to import on the server and the client.
 *
 * An area is its geometry, QTI's `shape`, and its `coords` (QTI 3.0 information model 7.9, Coords,
 * and 8.29, ShapeEnum), as the core reads them (`#plate/interactions/area.ts`), and its coordinates
 * are in the image's own pixels, the space the stage's overlay draws in. A coordinate written with
 * `%` is a percentage of the image: an x coordinate of its width, a y coordinate of its height, an
 * `ellipse`'s radii each on its own axis, and a `circle`'s radius of the smaller of the two, since
 * "When the radius value is a percentage value, user agents should calculate the final radius value
 * based on the associated object's width and height. The radius should be the smaller value of the
 * two" (7.9; spec-readings reading 180).
 *
 * Which points an area holds is `areaHolds` (`#plate/graphic/holds.ts`), the exact test the QTI
 * database's scoring states too: its boundary included (reading 52), and coordinates that do not
 * fit the shape read as HTML's image-map processing reads them (reading 59). Where areas overlap,
 * the one listed first holds the point, since "If hotspots overlap then those listed first hide
 * overlapping hotspots that appear later" (5.67), and a `default` area holds only what no other
 * area holds, wherever it is listed.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Derived_Coords
 */
import { Array as Arr } from "effect";
import { areaHolds } from "#plate/graphic/holds.ts";
import type { AreaCoordinate } from "#plate/interactions/area.ts";
import type { ImageSize } from "#plate/interactions/image-size.ts";
import type { AreaGeometry } from "#plate/vocabulary.ts";

/**
 * A point in an image's own pixels.
 */
export interface ImagePoint {
  readonly x: number;
  readonly y: number;
}

/**
 * One area of a graphic interaction, as its hotspot writes it: its `coords`, in written order, and
 * its geometry, its `shape`.
 */
export interface GraphicArea {
  readonly coords: readonly AreaCoordinate[];
  readonly geometry: AreaGeometry;
}

/**
 * The SVG element that draws an area in the image's pixels, and its geometry, which holds exactly
 * the points the area holds: a `rect` from its corners in either order, a `circle`, an `ellipse`,
 * or a `polygon` from its complete vertex pairs, which its drawing fills by the even-odd rule as
 * HTML's polygon area is (SVG's own default, `nonzero`, would fill the inner star of a pentagram
 * that the area leaves out), carrying its coordinates in the image's pixels, which `areaHolds`
 * reads, beside them. A `default` area is the `rect` of the whole image.
 *
 * A drawing exists only for an area that holds a point ({@link drawingOf}), so what is read from
 * one, its interior, its corner, its region, is there for every drawing.
 */
export type Drawing =
  | {
      readonly element: "circle";
      readonly cx: number;
      readonly cy: number;
      readonly r: number;
    }
  | {
      readonly element: "ellipse";
      readonly cx: number;
      readonly cy: number;
      readonly rx: number;
      readonly ry: number;
    }
  | {
      readonly element: "polygon";
      readonly pixels: readonly number[];
      readonly vertices: Arr.NonEmptyReadonlyArray<Vertex>;
    }
  | {
      readonly element: "rect";
      readonly height: number;
      readonly width: number;
      readonly x: number;
      readonly y: number;
    };

/**
 * A point inside an area where a badge or a placed chip sits, and its clearance: the distance from
 * the point to the area's boundary, the radius of the largest circle around it the area holds.
 */
export interface Interior {
  readonly clearance: number;
  readonly x: number;
  readonly y: number;
}

/**
 * A polygon's vertex, in the image's pixels.
 */
type Vertex = readonly [x: number, y: number];

/**
 * Give the side of the image a percentage coordinate is of: a `circle`'s radius, its third
 * coordinate, is of the smaller side (7.9); every other coordinate alternates x and y,
 * so an even index is of the width and an odd one of the height, an `ellipse`'s two radii
 * included.
 *
 * @param geometry The area's geometry.
 * @param index The coordinate's place in `coords`.
 * @param size The image's size.
 * @returns The width, the height, or the smaller of the two.
 */
const sideOf = (geometry: AreaGeometry, index: number, size: ImageSize): number => {
  if (geometry === "circle" && index === 2) {
    return Math.min(size.width, size.height);
  }

  return index % 2 === 0 ? size.width : size.height;
};

/**
 * Resolve an area's coordinates to the image's pixels: a percentage scaled by the side its place
 * names ({@link sideOf}), a pixel coordinate as written.
 *
 * @param area The area.
 * @param size The image's size.
 * @returns The coordinates as numbers, in written order.
 */
const pixelsOf = (area: GraphicArea, size: ImageSize): readonly number[] =>
  area.coords.map((coordinate, index) =>
    coordinate.percent
      ? (coordinate.value * sideOf(area.geometry, index, size)) / 100
      : coordinate.value,
  );

/**
 * Report whether an area holds any point at all, by testing the point its coordinates name first:
 * a `rect`'s first corner, a `circle`'s or an `ellipse`'s centre, a `poly`'s first vertex. Each
 * lies in its area whenever the coordinates fit the shape, so the test fails exactly for an area
 * HTML reads as holding no point: too few coordinates, or a radius of zero or less.
 *
 * @param geometry The area's geometry.
 * @param pixels Its coordinates, in the image's pixels.
 * @returns Whether the area holds a point.
 */
const holdsAny = (geometry: AreaGeometry, pixels: readonly number[]): boolean => {
  const [x = 0, y = 0] = pixels;

  return areaHolds[geometry](pixels, x, y);
};

/**
 * List a polygon's vertices: its coordinates in complete pairs, an odd last one ignored, as
 * `areaHolds` reads them.
 *
 * @param pixels The polygon's coordinates, in the image's pixels.
 * @returns The vertices, in order.
 */
const verticesOf = (pixels: readonly number[]): readonly Vertex[] => {
  const vertices: Vertex[] = [];
  for (let index = 0; index + 1 < pixels.length; index += 2) {
    vertices.push([pixels[index] ?? 0, pixels[index + 1] ?? 0]);
  }

  return vertices;
};

/**
 * Give the drawing of an area in the image's pixels ({@link Drawing}).
 *
 * @param area The area.
 * @param size The image's size.
 * @returns The drawing, or none for an area that holds no point, which nothing draws and no point
 *   hits.
 */
export const drawingOf = (area: GraphicArea, size: ImageSize): Drawing | undefined => {
  if (area.geometry === "default") {
    return { element: "rect", height: size.height, width: size.width, x: 0, y: 0 };
  }

  const pixels = pixelsOf(area, size);
  if (!holdsAny(area.geometry, pixels)) {
    return undefined;
  }

  const [first = 0, second = 0, third = 0, fourth = 0] = pixels;
  switch (area.geometry) {
    case "circle": {
      return { cx: first, cy: second, element: "circle", r: third };
    }
    case "ellipse": {
      return { cx: first, cy: second, element: "ellipse", rx: third, ry: fourth };
    }
    case "poly": {
      const vertices = verticesOf(pixels);

      // `holdsAny` held, so the polygon has the vertices `areaHolds` needs; the test gives the type
      // the first of them.
      return Arr.isReadonlyArrayNonEmpty(vertices)
        ? { element: "polygon", pixels, vertices }
        : undefined;
    }
    case "rect": {
      return {
        element: "rect",
        height: Math.abs(fourth - second),
        width: Math.abs(third - first),
        x: Math.min(first, third),
        y: Math.min(second, fourth),
      };
    }
    default: {
      return area.geometry satisfies never;
    }
  }
};

/**
 * An area as the overlay draws it: the area, and its drawing in the image's pixels.
 *
 * @template A The area, with what an interaction holds of it beside its geometry.
 */
interface Painted<A extends GraphicArea> {
  readonly area: A;
  readonly drawing: Drawing;
}

/**
 * Find the area a point falls in: the first one listed, `default` areas aside, that holds it
 * (`areaHolds`, boundary included), so that where areas overlap the first hides the later ones;
 * else the first `default` area; else none.
 *
 * @template A The areas, with what an interaction holds of each.
 * @param areas The interaction's areas, in document order.
 * @param size The image's size.
 * @param point The point, in the image's pixels.
 * @returns The area, or none.
 */
export const hitOf = <A extends GraphicArea>(
  areas: readonly A[],
  size: ImageSize,
  point: ImagePoint,
): A | undefined =>
  areas.find(
    (area) =>
      area.geometry !== "default" &&
      areaHolds[area.geometry](pixelsOf(area, size), point.x, point.y),
  ) ?? areas.find((area) => area.geometry === "default");

/**
 * Give the areas to draw, bottom first, each with its drawing, so that the area a point falls in
 * ({@link hitOf}) is the topmost drawn there: the `default` areas first, then the others, each
 * group from its last listed to its first. A pointer, which reaches the topmost area under it,
 * then reaches the area scoring would name, and the first-listed area's outline is never painted
 * over by a later one. An area that holds no point is left out: nothing draws it and no point
 * hits it.
 *
 * @template A The areas, with what an interaction holds of each.
 * @param areas The interaction's areas, in document order.
 * @param size The image's size.
 * @returns The areas drawn, in drawing order, each with its drawing.
 */
export const paintedOf = <A extends GraphicArea>(
  areas: readonly A[],
  size: ImageSize,
): readonly Painted<A>[] => {
  const reversed = areas.toReversed();

  return [
    ...reversed.filter((area) => area.geometry === "default"),
    ...reversed.filter((area) => area.geometry !== "default"),
  ].flatMap((area) => {
    const drawing = drawingOf(area, size);

    return drawing === undefined ? [] : [{ area, drawing }];
  });
};

/**
 * How finely the search for a polygon's deepest point resolves it: the clearance it finds is
 * within the polygon's smaller extent divided by this of the deepest clearance there is.
 */
const refinement = 256;

/**
 * The four offsets from a cell's centre to its quarters' centres, in units of a quarter's half
 * side.
 */
const quarters: readonly Vertex[] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

/**
 * A square cell of the search for a polygon's deepest point: its centre, half its side, its depth
 * (the signed distance from its centre to the polygon's boundary, positive inside), and its bound,
 * the most depth any of its points can have, since depth changes no faster than position.
 */
interface Cell {
  readonly bound: number;
  readonly depth: number;
  readonly half: number;
  readonly x: number;
  readonly y: number;
}

/**
 * Measure the distance from a point to a segment, its ends included.
 *
 * @param x The point's x coordinate.
 * @param y The point's y coordinate.
 * @param from One end of the segment.
 * @param to The other end.
 * @returns The distance.
 */
const segmentDistance = (x: number, y: number, from: Vertex, to: Vertex): number => {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = dx * dx + dy * dy;
  const along =
    length === 0 ? 0 : Math.min(1, Math.max(0, ((x - x1) * dx + (y - y1) * dy) / length));

  return Math.hypot(x - (x1 + along * dx), y - (y1 + along * dy));
};

/**
 * Measure the distance from a point to a polygon's boundary, the last vertex joining the first.
 *
 * @param vertices The polygon's vertices.
 * @param x The point's x coordinate.
 * @param y The point's y coordinate.
 * @returns The distance to the nearest edge.
 */
const boundaryDistance = (vertices: readonly Vertex[], x: number, y: number): number => {
  let nearest = Number.POSITIVE_INFINITY;
  for (const [index, to] of vertices.entries()) {
    nearest = Math.min(nearest, segmentDistance(x, y, vertices.at(index - 1) ?? to, to));
  }

  return nearest;
};

/**
 * A box in the image's pixels: its left, top, right and bottom edges.
 */
export interface Box {
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
}

/**
 * Find the point of a box where a 1-Lipschitz function is greatest, by a best-first search of
 * square cells: each cell's bound is the function at its centre plus half its diagonal, the most
 * any of its points can hold since the function moves no faster than position, and the search
 * splits, best bound first, every cell that could still beat the best found by more than its
 * resolution, the box's smaller side divided by {@link refinement}. The function is a signed
 * distance, positive where the point stands inside the region it measures, so the point found is
 * the region's deepest, within that resolution.
 *
 * @param depth The function: a signed distance, in the image's pixels.
 * @param box The box searched.
 * @returns The deepest point and its depth; none where no point of the box has a positive depth,
 *   or the box encloses nothing.
 * @see https://github.com/mapbox/polylabel
 */
const deepestBy = (depth: (x: number, y: number) => number, box: Box): Interior | undefined => {
  const { bottom, left, right, top } = box;
  const side = Math.min(right - left, bottom - top);

  if (!(side > 0)) {
    return undefined;
  }

  const cellAt = (x: number, y: number, half: number): Cell => {
    const value = depth(x, y);

    return { bound: value + half * Math.SQRT2, depth: value, half, x, y };
  };
  // Kept in ascending order of bound, so the last cell is the one to split next.
  const queue: Cell[] = [];
  const enqueue = (cell: Cell) => {
    let low = 0;
    let high = queue.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if ((queue[middle]?.bound ?? 0) < cell.bound) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }

    queue.splice(low, 0, cell);
  };
  const precision = side / refinement;

  for (let x = left; x < right; x += side) {
    for (let y = top; y < bottom; y += side) {
      enqueue(cellAt(x + side / 2, y + side / 2, side / 2));
    }
  }

  let best = cellAt((left + right) / 2, (top + bottom) / 2, 0);
  for (let cell = queue.pop(); cell !== undefined; cell = queue.pop()) {
    if (cell.depth > best.depth) {
      best = cell;
    }

    // The queue holds no cell with a higher bound, so none can be deeper by more than this.
    if (cell.bound - best.depth <= precision) {
      break;
    }

    const half = cell.half / 2;
    for (const [dx, dy] of quarters) {
      enqueue(cellAt(cell.x + dx * half, cell.y + dy * half, half));
    }
  }

  return best.depth > 0 ? { clearance: best.depth, x: best.x, y: best.y } : undefined;
};

/**
 * Give the box a polygon's vertices span.
 *
 * @param vertices The vertices.
 * @returns The box.
 */
const boxOfVertices = (vertices: readonly Vertex[]): Box => {
  const xs = vertices.map(([x]) => x);
  const ys = vertices.map(([, y]) => y);

  return {
    bottom: Math.max(...ys),
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
  };
};

/**
 * Measure a point's signed distance to a polygon's boundary: positive inside, by `areaHolds`'s
 * even-odd reading, negative outside.
 *
 * @param pixels The polygon's coordinates, in the image's pixels.
 * @param vertices Its vertices.
 * @param x The point's x coordinate.
 * @param y The point's y coordinate.
 * @returns The signed distance.
 */
const polygonDepth = (
  pixels: readonly number[],
  vertices: readonly Vertex[],
  x: number,
  y: number,
): number => {
  const distance = boundaryDistance(vertices, x, y);

  return areaHolds.poly(pixels, x, y) ? distance : -distance;
};

/**
 * Find a polygon's deepest point, its pole of inaccessibility: the point inside it farthest from
 * its boundary, where the largest chip fits. A concave polygon's bounding-box centre can lie
 * outside it, and its vertex average too, so the search covers the bounding box ({@link
 * deepestBy}). Inside is `areaHolds`'s even-odd reading, so the point is one the area holds.
 *
 * @param polygon The polygon's drawing: its coordinates, in the image's pixels, and its vertices.
 * @returns The deepest point and its clearance; the first vertex, with no clearance, when the
 *   polygon encloses nothing, its vertices all on one line.
 */
const deepestOf = (polygon: Extract<Drawing, { readonly element: "polygon" }>): Interior => {
  const { pixels, vertices } = polygon;
  const [[firstX, firstY]] = vertices;

  return (
    deepestBy((x, y) => polygonDepth(pixels, vertices, x, y), boxOfVertices(vertices)) ?? {
      clearance: 0,
      x: firstX,
      y: firstY,
    }
  );
};

/**
 * Give the point inside an area where its placed choices' box and a pair's line stand, never its
 * bounding-box centre, which a concave area need not hold: a `rect`'s, a `circle`'s or an
 * `ellipse`'s centre, a `poly`'s deepest point, and for a `default` area the image's centre.
 *
 * @param drawing The area's drawing.
 * @returns The point and its clearance.
 */
export const interiorOf = (drawing: Drawing): Interior => {
  switch (drawing.element) {
    case "circle": {
      return { clearance: drawing.r, x: drawing.cx, y: drawing.cy };
    }
    case "ellipse": {
      return { clearance: Math.min(drawing.rx, drawing.ry), x: drawing.cx, y: drawing.cy };
    }
    case "polygon": {
      return deepestOf(drawing);
    }
    case "rect": {
      return {
        clearance: Math.min(drawing.width, drawing.height) / 2,
        x: drawing.x + drawing.width / 2,
        y: drawing.y + drawing.height / 2,
      };
    }
    default: {
      return drawing satisfies never;
    }
  }
};

/**
 * Give the box an area's drawing spans, in the image's pixels: a `rect`'s own, a `circle`'s or an
 * `ellipse`'s about its centre, and a `poly`'s vertices' extent.
 *
 * @param drawing The area's drawing.
 * @returns Its box.
 */
export const boundsOf = (drawing: Drawing): Box => {
  switch (drawing.element) {
    case "circle": {
      return {
        bottom: drawing.cy + drawing.r,
        left: drawing.cx - drawing.r,
        right: drawing.cx + drawing.r,
        top: drawing.cy - drawing.r,
      };
    }
    case "ellipse": {
      return {
        bottom: drawing.cy + drawing.ry,
        left: drawing.cx - drawing.rx,
        right: drawing.cx + drawing.rx,
        top: drawing.cy - drawing.ry,
      };
    }
    case "polygon": {
      return boxOfVertices(drawing.vertices);
    }
    case "rect": {
      return {
        bottom: drawing.y + drawing.height,
        left: drawing.x,
        right: drawing.x + drawing.width,
        top: drawing.y,
      };
    }
    default: {
      return drawing satisfies never;
    }
  }
};

/**
 * Give the point straight above or below the middle of an area's box ({@link boundsOf}), on the
 * box's top or bottom edge, where an arrow drawn beside the area stands clear of it, as AlphaTest's
 * player stood one centred over or under its drop box: a `rect`'s top or bottom edge at its middle,
 * a `circle`'s or an `ellipse`'s topmost or bottommost point, and the middle of a `poly`'s box's
 * top or bottom edge.
 *
 * @param drawing The area's drawing.
 * @param side The box's edge: its top, or its bottom.
 * @returns The point, in the image's pixels.
 */
export const edgeOf = (drawing: Drawing, side: "bottom" | "top"): ImagePoint => {
  const box = boundsOf(drawing);

  return { x: (box.left + box.right) / 2, y: side === "top" ? box.top : box.bottom };
};

/**
 * Give the point of an area's outline farthest toward the image's top right, where a mark stands
 * clear of what the area outlines, the picture's own label or part, which its middle holds: a
 * `rect`'s top-right corner, for a `default` area the image's; the point of a `circle` or an
 * `ellipse` whose tangent runs from top left to bottom right; and a `poly`'s vertex farthest that
 * way. Each is the outline's point that maximizes `x - y`, so the rule is one for every shape.
 *
 * @param drawing The area's drawing.
 * @returns The point.
 */
export const cornerOf = (drawing: Drawing): ImagePoint => {
  switch (drawing.element) {
    case "circle": {
      return { x: drawing.cx + drawing.r / Math.SQRT2, y: drawing.cy - drawing.r / Math.SQRT2 };
    }
    case "ellipse": {
      const reach = Math.hypot(drawing.rx, drawing.ry);

      return { x: drawing.cx + drawing.rx ** 2 / reach, y: drawing.cy - drawing.ry ** 2 / reach };
    }
    case "polygon": {
      const [[firstX, firstY], ...rest] = drawing.vertices;
      let corner: ImagePoint = { x: firstX, y: firstY };
      for (const [x, y] of rest) {
        if (x - y > corner.x - corner.y) {
          corner = { x, y };
        }
      }

      return corner;
    }
    case "rect": {
      return { x: drawing.x + drawing.width, y: drawing.y };
    }
    default: {
      return drawing satisfies never;
    }
  }
};

/**
 * Give the size of an area as a target: the diameter of the largest circle it holds, which a
 * pointer anywhere inside lands on the area (WCAG 2.2's 2.5.8 measures a target by the circle it
 * holds): a `circle`'s diameter, a `rect`'s shorter side, an `ellipse`'s shorter axis, a `default`
 * area's, the whole image's, shorter side, and a `poly`'s inscribed circle, around its deepest
 * point ({@link interiorOf}). That search finds a point within the polygon's smaller extent divided
 * by {@link refinement} of the deepest, so a polygon's diameter is taken that much short of the
 * search's: a lower bound of the true diameter, never above it, so a stage sized by it never
 * draws a target under its size.
 *
 * @param drawing The area's drawing.
 * @returns The diameter, in the image's pixels.
 * @see https://www.w3.org/TR/WCAG22/#target-size-minimum
 */
const inscribedDiameterOf = (drawing: Drawing): number => {
  switch (drawing.element) {
    case "circle": {
      return 2 * drawing.r;
    }
    case "ellipse": {
      return 2 * Math.min(drawing.rx, drawing.ry);
    }
    case "polygon": {
      const box = boxOfVertices(drawing.vertices);
      const side = Math.min(box.right - box.left, box.bottom - box.top);

      return 2 * Math.max(0, deepestOf(drawing).clearance - side / refinement);
    }
    case "rect": {
      return Math.min(drawing.width, drawing.height);
    }
    default: {
      return drawing satisfies never;
    }
  }
};

/**
 * The sides of the polygon an ellipse is measured by where its own curve has no closed-form
 * distance: enough that the polygon and the curve part by under an 800th of the ellipse's radius.
 */
const ellipseSides = 64;

/**
 * An area's region as the tap measure reads it: a circle and a rectangle exactly, a polygon by its
 * vertices, and an ellipse as a polygon of {@link ellipseSides} sides.
 */
type Region =
  | { readonly cx: number; readonly cy: number; readonly kind: "circle"; readonly r: number }
  | { readonly box: Box; readonly kind: "rect" }
  | {
      readonly kind: "poly";
      readonly pixels: readonly number[];
      readonly vertices: readonly Vertex[];
    };

/**
 * Give the polygon an ellipse is measured by: one inside it, its vertices on the curve, where the
 * area's own region is measured, so a tap region is never taken larger than it is; or one around
 * it, its sides touching the curve, where the ellipse takes points from a later area, so the
 * later area's region is never taken larger either.
 *
 * @param drawing The ellipse.
 * @param fit `inside` or `around`.
 * @returns The polygon's region.
 */
const ellipseRegionOf = (
  drawing: Extract<Drawing, { readonly element: "ellipse" }>,
  fit: "around" | "inside",
): Region => {
  const grow = fit === "around" ? 1 / Math.cos(Math.PI / ellipseSides) : 1;
  const vertices = Array.from({ length: ellipseSides }, (_, index): Vertex => {
    const angle = (2 * Math.PI * index) / ellipseSides;

    return [
      drawing.cx + drawing.rx * grow * Math.cos(angle),
      drawing.cy + drawing.ry * grow * Math.sin(angle),
    ];
  });

  return { kind: "poly", pixels: vertices.flat(), vertices };
};

/**
 * Give an area's region for the tap measure.
 *
 * @param drawing The area's drawing.
 * @param fit How an ellipse is measured: `inside` for the area's own region, `around` for one that
 *   takes points from it.
 * @returns The region.
 */
const regionOf = (drawing: Drawing, fit: "around" | "inside"): Region => {
  switch (drawing.element) {
    case "circle": {
      return { cx: drawing.cx, cy: drawing.cy, kind: "circle", r: drawing.r };
    }
    case "ellipse": {
      return ellipseRegionOf(drawing, fit);
    }
    case "polygon": {
      return { kind: "poly", pixels: drawing.pixels, vertices: drawing.vertices };
    }
    case "rect": {
      return {
        box: {
          bottom: drawing.y + drawing.height,
          left: drawing.x,
          right: drawing.x + drawing.width,
          top: drawing.y,
        },
        kind: "rect",
      };
    }
    default: {
      return drawing satisfies never;
    }
  }
};

/**
 * Measure a point's signed distance to a box's edge: positive inside, negative outside.
 *
 * @param box The box.
 * @param x The point's x coordinate.
 * @param y The point's y coordinate.
 * @returns The signed distance.
 */
const boxDepth = (box: Box, x: number, y: number): number => {
  const inside = Math.min(x - box.left, box.right - x, y - box.top, box.bottom - y);
  if (inside >= 0) {
    return inside;
  }

  return -Math.hypot(
    Math.max(box.left - x, 0, x - box.right),
    Math.max(box.top - y, 0, y - box.bottom),
  );
};

/**
 * Measure a point's signed distance to a region's boundary: positive inside, negative outside.
 *
 * @param region The region.
 * @param x The point's x coordinate.
 * @param y The point's y coordinate.
 * @returns The signed distance.
 */
const regionDepth = (region: Region, x: number, y: number): number => {
  switch (region.kind) {
    case "circle": {
      return region.r - Math.hypot(x - region.cx, y - region.cy);
    }
    case "poly": {
      return polygonDepth(region.pixels, region.vertices, x, y);
    }
    case "rect": {
      return boxDepth(region.box, x, y);
    }
    default: {
      return region satisfies never;
    }
  }
};

/**
 * Give the box a region spans.
 *
 * @param region The region.
 * @returns The box.
 */
const boxOfRegion = (region: Region): Box => {
  switch (region.kind) {
    case "circle": {
      return {
        bottom: region.cy + region.r,
        left: region.cx - region.r,
        right: region.cx + region.r,
        top: region.cy - region.r,
      };
    }
    case "poly": {
      return boxOfVertices(region.vertices);
    }
    case "rect": {
      return region.box;
    }
    default: {
      return region satisfies never;
    }
  }
};

/**
 * Tell whether two boxes share a point, edges included.
 *
 * @param left One box.
 * @param right The other.
 * @returns Whether they meet.
 */
const boxesMeet = (left: Box, right: Box): boolean =>
  left.left <= right.right &&
  right.left <= left.right &&
  left.top <= right.bottom &&
  right.top <= left.bottom;

/**
 * Give the size of an area as a target where it stands among the interaction's areas: the
 * diameter of the largest circle its tap region holds, the points a tap gives it by {@link hitOf}'s
 * rule. That region is the area's own on the image, less every area listed before it, which takes
 * the points they share, since "If hotspots overlap then those listed first hide overlapping
 * hotspots that appear later" (QTI 3.0 information model 5.67); a `default` area's is the image
 * less every other area, and a second `default` area holds nothing. WCAG 2.2 counts a target by
 * the region that is its alone: where two overlap, the overlap is neither's (2.5.8, the note on
 * targets).
 *
 * An area no earlier area meets, wholly on the image, is its own region, and its size is
 * {@link inscribedDiameterOf}'s. Any other is measured by the deepest point of its region
 * ({@link deepestBy}): its depth there the least of its depth in its own shape, its distance from
 * the image's edge, and its distance from each earlier area, which together are a 1-Lipschitz
 * function the search maximises, and its diameter taken the search's resolution short of twice
 * that, a lower bound. An ellipse is measured as a polygon inside it where it is the area, and one
 * around it where it hides another, so neither region is taken larger than it is.
 *
 * @param areas The interaction's areas, in document order.
 * @param index The area's index among them.
 * @param size The image's size.
 * @returns The diameter, in the image's pixels; none for an area whose tap region holds no point,
 *   which is no target: its hotspot is reached through its interaction's list alone.
 * @see https://www.w3.org/TR/WCAG22/#target-size-minimum
 */
export const tapDiameterOf = (
  areas: readonly GraphicArea[],
  index: number,
  size: ImageSize,
): number | undefined => {
  const area = areas[index];
  const drawing = area === undefined ? undefined : drawingOf(area, size);
  if (area === undefined || drawing === undefined) {
    return undefined;
  }

  const own = regionOf(drawing, "inside");
  const fallback = area.geometry === "default";
  if (fallback && areas.findIndex((each) => each.geometry === "default") !== index) {
    return undefined;
  }

  const image: Box = { bottom: size.height, left: 0, right: size.width, top: 0 };
  const reach = boxOfRegion(own);
  const box: Box = {
    bottom: Math.min(reach.bottom, image.bottom),
    left: Math.max(reach.left, image.left),
    right: Math.min(reach.right, image.right),
    top: Math.max(reach.top, image.top),
  };
  const hiding = areas.flatMap((other, at): readonly Region[] => {
    const hides =
      other.geometry === "default" || (fallback ? at === index : at >= index)
        ? undefined
        : drawingOf(other, size);
    const region = hides === undefined ? undefined : regionOf(hides, "around");

    return region !== undefined && boxesMeet(boxOfRegion(region), box) ? [region] : [];
  });

  if (
    hiding.length === 0 &&
    reach.left >= image.left &&
    reach.top >= image.top &&
    reach.right <= image.right &&
    reach.bottom <= image.bottom
  ) {
    return inscribedDiameterOf(drawing);
  }

  const found = deepestBy(
    (x, y) =>
      Math.min(
        regionDepth(own, x, y),
        boxDepth(image, x, y),
        ...hiding.map((region) => -regionDepth(region, x, y)),
      ),
    box,
  );
  const resolution = Math.min(box.right - box.left, box.bottom - box.top) / refinement;

  return found === undefined || found.clearance <= resolution
    ? undefined
    : 2 * (found.clearance - resolution);
};
