/**
 * The arrows a Graphic Gap Match draws beside its hotspots, where each hotspot's author asks for
 * one by plate's class `plate-arrow-up` or `plate-arrow-down`, at the points
 * `#plate/graphic/arrows.ts` pins them: the island's stage and the review draw them alike. Safe to
 * import on the server and the client: it holds no hook or state.
 *
 * @module
 */
import { pinnedArrowsOf } from "#plate/graphic/arrows.ts";
import type { Arrowed } from "#plate/graphic/arrows.ts";
import type { ImageSize } from "#plate/interactions/image-size.ts";
import { ArrowPin } from "#plate/ui/graphic/drawn.tsx";

/**
 * Draw an arrow at each point {@link pinnedArrowsOf} pins one (`ArrowPin` in
 * `#plate/ui/graphic/drawn.tsx`).
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
    {pinnedArrowsOf(props.hotspots, props.size).map((arrow) => (
      <ArrowPin
        key={arrow.identifier}
        at={arrow.at}
        direction={arrow.direction}
        size={props.size}
      />
    ))}
  </>
);
