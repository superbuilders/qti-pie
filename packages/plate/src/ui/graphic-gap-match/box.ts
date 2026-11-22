/**
 * Where a Graphic Gap Match draws the choices a hotspot holds: an upright box its area holds,
 * centred on the area's interior point, so a choice drawn inside the box sits wholly inside the
 * area. QTI asks it of this interaction: "It must be clear to the candidate which hotspot each
 * choice has been associated with. When associated, choices must appear wholly inside the gaps if
 * at all possible and, where overlaps are required, should not hide each other completely" (QTI
 * 3.0 information model 5.60). A bounding box's centre can lie outside a concave area, so the box
 * stands on the area's interior point (`interiorOf`), never on that centre. Pure, and safe to
 * import on the server and the client.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_GraphicGapMatchInteraction
 */
import type { ImageSize } from "#plate/interactions/image-size.ts";
import { drawingOf, interiorOf } from "#plate/graphic/geometry.ts";
import type { GraphicArea } from "#plate/graphic/geometry.ts";

/**
 * An upright box inside an area, in the image's pixels: its centre, `x` and `y`, and its `width`
 * and `height`.
 */
export interface PlacedBox {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

/**
 * Give the box a hotspot's placed choices are drawn in: an upright box the area holds, centred on
 * its interior point. A `rect` is its own box. A `circle`'s is the square inside it, `r·√2` on a
 * side. An `ellipse`'s is the largest upright box inside it, `rx·√2` by `ry·√2`. A `poly`'s is the
 * square inside the largest circle around its deepest point, the circle of the point's clearance,
 * which the polygon holds whatever its concavity.
 *
 * @param area The hotspot's area.
 * @param size The image's size, the pixel space of its coordinates.
 * @returns The box, or none for an area that holds no point, which draws nothing.
 */
export const placedBoxOf = (area: GraphicArea, size: ImageSize): PlacedBox | undefined => {
  const drawing = drawingOf(area, size);
  if (drawing === undefined) {
    return undefined;
  }

  switch (drawing.element) {
    case "circle": {
      const side = drawing.r * Math.SQRT2;

      return { height: side, width: side, x: drawing.cx, y: drawing.cy };
    }
    case "ellipse": {
      return {
        height: drawing.ry * Math.SQRT2,
        width: drawing.rx * Math.SQRT2,
        x: drawing.cx,
        y: drawing.cy,
      };
    }
    case "polygon": {
      const interior = interiorOf(drawing);
      const side = interior.clearance * Math.SQRT2;

      return { height: side, width: side, x: interior.x, y: interior.y };
    }
    case "rect": {
      return {
        height: drawing.height,
        width: drawing.width,
        x: drawing.x + drawing.width / 2,
        y: drawing.y + drawing.height / 2,
      };
    }
    default: {
      return drawing satisfies never;
    }
  }
};
