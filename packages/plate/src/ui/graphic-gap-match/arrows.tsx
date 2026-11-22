/**
 * The arrows a Graphic Gap Match draws beside its hotspots, where each hotspot's author asks for
 * one by `data-arrow-direction`: the island's stage and the review's pin them alike. Safe to import
 * on the server and the client: it holds no hook or state.
 *
 * @module
 */
import type { ArrowDirection } from "#plate/interactions/area.ts";
import type { ImageSize } from "#plate/interactions/image-size.ts";
import { ArrowPin } from "#plate/ui/graphic/drawn.tsx";
import type { GraphicArea } from "#plate/ui/graphic/geometry.ts";

/**
 * A hotspot as its arrow reads it: its area, its identifier, and the arrow its author asks for,
 * undefined for none.
 */
interface Arrowed extends GraphicArea {
  readonly arrow: ArrowDirection | undefined;
  readonly identifier: string;
}

/**
 * Pin an arrow beside each hotspot whose author asks for one, and nothing for any other
 * (`ArrowPin` in `#plate/ui/graphic/drawn.tsx`).
 *
 * @param props.hotspots The hotspots, in document order.
 * @param props.size The image's size, the pixel space of their coordinates.
 * @returns The arrows, inside the stage's pins.
 */
export const HotspotArrows = (props: {
  readonly hotspots: readonly Arrowed[];
  readonly size: ImageSize;
}) => (
  <>
    {props.hotspots.map((hotspot) =>
      hotspot.arrow === undefined ? null : (
        <ArrowPin
          key={hotspot.identifier}
          area={hotspot}
          direction={hotspot.arrow}
          size={props.size}
        />
      ),
    )}
  </>
);
