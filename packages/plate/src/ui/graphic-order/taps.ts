/**
 * A tap on a Graphic Order's image, as one step on its order: the classic graphic-order rule, one
 * tap per area. A tap on an area left out of the order puts it in the first empty position; a tap
 * on an ordered area takes it out and leaves its position empty, as a chip taken out of the list
 * does, so no other area moves. A tap on an area left out while every position is taken is
 * refused, and changes nothing. Pure, and safe to import on the server and the client.
 *
 * The list of chips below the image stays the way to put an area in a chosen position, and to drag
 * one; the step reads only the positions, so the two ways never disagree about them.
 *
 * @module
 */
import type { Sequence } from "#plate/ui/placement/machine.ts";

/**
 * What a tap did to the order, by its kind:
 *
 * - `placed`: the area went into the first empty position, `index` from 0.
 * - `removed`: the area left the order, and its position is empty.
 * - `full`: refused, since every position is taken and the area is in none of them; `placements` is
 *   the order as it was.
 */
export type TapStep =
  | {
      readonly chip: string;
      readonly index: number;
      readonly kind: "placed";
      readonly placements: Sequence;
    }
  | {
      readonly chip: string;
      readonly kind: "removed";
      readonly placements: Sequence;
    }
  | {
      readonly chip: string;
      readonly kind: "full";
      readonly placements: Sequence;
    };

/**
 * Take one tap on an area's chip as a step on the order.
 *
 * @param placements The positions' occupants, each area in at most one.
 * @param chip The area tapped.
 * @returns The step, and the positions after it.
 */
export const tapStep = (placements: Sequence, chip: string): TapStep => {
  const index = placements.indexOf(chip);

  if (index !== -1) {
    return { chip, kind: "removed", placements: placements.with(index, null) };
  }

  const open = placements.indexOf(null);

  return open === -1
    ? { chip, kind: "full", placements }
    : { chip, index: open, kind: "placed", placements: placements.with(open, chip) };
};
