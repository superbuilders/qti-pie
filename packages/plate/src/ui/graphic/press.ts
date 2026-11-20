/**
 * How a tap on the image stage becomes a pick: on release, not on press, and only where it began
 * (WCAG 2.2's 2.5.2 Pointer Cancellation). Pure, so its rules are held by an exhaustive search
 * over pointer sequences with no page; the stage feeds it each pointer event with the spot under
 * the pointer and acts on what it commits.
 *
 * A press begins when a primary pointer goes down on the image. It commits when that pointer comes
 * up on the spot it went down on, an area or the image outside every area, and the pointer never
 * left that spot in between: moving off cancels it, and so does the browser cancelling the
 * pointer, a second pointer going down (no gesture takes two pointers, 2.5.1), or the pointer
 * leaving the image. A press alone commits nothing, so a child who touches the wrong area slides
 * off it and lets go.
 *
 * @module
 * @see https://www.w3.org/TR/WCAG22/#pointer-cancellation
 */
import type { ImagePoint } from "#plate/ui/graphic/geometry.ts";

/**
 * Where a pointer is on the stage: off the image, or on it at a point, in the image's pixels, in an
 * area, named by its hotspot's identifier, or in none. Two spots on the image are one spot when
 * they are in one area, or both in none, wherever their points stand.
 */
export type Spot =
  | { readonly kind: "off" }
  | { readonly area: string | undefined; readonly kind: "image"; readonly point: ImagePoint };

/**
 * One pointer event as the press reads it: which pointer, and the spot under it. `down` is a
 * pointer going down, `move` one moving, `up` one coming up and `cancel` the browser taking a
 * pointer back, as `pointercancel` does.
 */
export interface PressEvent {
  readonly kind: "cancel" | "down" | "move" | "up";
  readonly pointer: number;
  readonly spot: Spot;
}

/**
 * The press under way: the pointer that began it and the spot it began on; or none.
 */
export type Press =
  | { readonly kind: "none" }
  | { readonly kind: "pressed"; readonly pointer: number; readonly spot: Spot }
  | { readonly kind: "spoilt" };

/**
 * No press under way.
 */
export const noPress: Press = { kind: "none" };

/**
 * What one pointer event does: the press it leaves, and the spot it commits, when it commits one:
 * the spot the pointer came up on, at the point it came up at.
 */
export interface PressStep {
  readonly commit?: Extract<Spot, { readonly kind: "image" }>;
  readonly press: Press;
}

/**
 * Tell whether two spots are the same: both off the image, or both on it in the same area or in
 * none.
 *
 * @param left One spot.
 * @param right The other.
 * @returns Whether they are one spot.
 */
const sameSpot = (left: Spot, right: Spot): boolean =>
  left.kind === "off" ? right.kind === "off" : right.kind === "image" && left.area === right.area;

/**
 * Take one pointer event: a primary pointer going down on the image with no press under way begins
 * a press there; its moving off that spot, its cancelling, or any other pointer going down while
 * it is pressed spoils the press until every pointer is up; its coming up on the spot it began on
 * commits the spot it came up on. Every other event changes nothing.
 *
 * @param press The press under way.
 * @param event The pointer event.
 * @param pointersDown How many pointers are down after the event, so a spoilt press ends once all
 *   are up.
 * @returns The press the event leaves, and the spot it commits.
 */
export const pressStep = (press: Press, event: PressEvent, pointersDown: number): PressStep => {
  switch (press.kind) {
    case "none": {
      return event.kind === "down" && event.spot.kind === "image" && pointersDown === 1
        ? { press: { kind: "pressed", pointer: event.pointer, spot: event.spot } }
        : { press: pointersDown === 0 ? noPress : { kind: "spoilt" } };
    }
    case "pressed": {
      if (event.pointer !== press.pointer) {
        return event.kind === "down" ? { press: { kind: "spoilt" } } : { press };
      }

      if (event.kind === "move") {
        return sameSpot(event.spot, press.spot) ? { press } : { press: { kind: "spoilt" } };
      }

      if (event.kind === "up" && event.spot.kind === "image" && sameSpot(event.spot, press.spot)) {
        return { commit: event.spot, press: pointersDown === 0 ? noPress : { kind: "spoilt" } };
      }

      return { press: pointersDown === 0 ? noPress : { kind: "spoilt" } };
    }
    case "spoilt": {
      return { press: pointersDown === 0 ? noPress : press };
    }
    default: {
      return press satisfies never;
    }
  }
};
