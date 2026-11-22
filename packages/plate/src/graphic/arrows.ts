/**
 * Where a Graphic Gap Match pins the arrow beside each hotspot whose author asks for one by plate's
 * class `plate-arrow-up` or `plate-arrow-down` (`arrowOf` in `#plate/interactions/area.ts`): on the
 * hotspot's box, at its top's middle for an arrow up and its bottom's for an arrow down, as
 * AlphaTest's player stood one centred over or under its drop box. The island's stage and the
 * review draw an arrow at each such point alike (`HotspotArrows` in
 * `#plate/ui/graphic-gap-match/arrows.tsx`). Safe to import on the server and the client.
 *
 * @module
 */
import { drawingOf, edgeOf } from "#plate/graphic/geometry.ts";
import type { GraphicArea, ImagePoint } from "#plate/graphic/geometry.ts";
import type { ArrowDirection } from "#plate/interactions/area.ts";
import type { ImageSize } from "#plate/interactions/image-size.ts";

/**
 * A hotspot as its arrow reads it: its area, its identifier, and the arrow its author asks for,
 * undefined for none.
 */
export interface Arrowed extends GraphicArea {
  readonly arrow: ArrowDirection | undefined;
  readonly identifier: string;
}

/**
 * One arrow to draw: the hotspot it stands beside, which way it points, and the point of the
 * hotspot's box it stands on, in the image's pixels.
 */
export interface PinnedArrow {
  readonly at: ImagePoint;
  readonly direction: ArrowDirection;
  readonly identifier: string;
}

/**
 * Pin an arrow beside each hotspot whose author asks for one, in document order, and none beside
 * any other or beside a hotspot that holds no point: above the hotspot's box pointing up, or below
 * it pointing down, centred on it ({@link edgeOf}).
 *
 * @param hotspots The hotspots, in document order.
 * @param size The image's size, the pixel space of their coordinates.
 * @returns The arrows.
 */
export const pinnedArrowsOf = (
  hotspots: readonly Arrowed[],
  size: ImageSize,
): readonly PinnedArrow[] =>
  hotspots.flatMap((hotspot) => {
    const { arrow, identifier } = hotspot;
    const drawing = arrow === undefined ? undefined : drawingOf(hotspot, size);

    return arrow === undefined || drawing === undefined
      ? []
      : [{ at: edgeOf(drawing, arrow === "up" ? "top" : "bottom"), direction: arrow, identifier }];
  });
