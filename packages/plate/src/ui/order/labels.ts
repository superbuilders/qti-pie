/**
 * The words an Order says: the placement primitive's announcements, its refusals and its slots'
 * names, in order's own wording. The server fills them from plate's message catalog (`labelsOf` in
 * `#plate/ui/item/interactions/labels.ts`), so no wording ships in the client's code.
 *
 * @module
 */
import type { LabelKeys, Labels } from "#plate/ui/item/interactions/labels.ts";
import { placementKeys } from "#plate/ui/placement/labels.ts";

/**
 * The catalog's message for every text an Order writes for the child: the placement primitive's,
 * with order's wording (its `order…` keys) wherever a label names a position, whose name is its
 * number, and wherever a chip that cannot be picked up already has a place in the order. Order's
 * board never refuses with `targetFull`, `pairMade`, `notInGroup` or `totalReached`: a taken
 * position swaps, each choice is placed once, no choice or position has a `match-group`, and the
 * positions alone bound how many are placed.
 */
export const orderKeys = {
  ...placementKeys,
  /**
   * Refused: the choice already has a place in the order.
   */
  chipUsedUp: "orderChipUsedUp",
  /**
   * The picked choice went into a position, named by its number.
   */
  placed: "orderPlaced",
  /**
   * The name of a position's slot, `{target}` its number.
   */
  slot: "orderSlot",
  /**
   * A choice from one position went into another, and the choice there moved to the first.
   */
  swapped: "orderSwapped",
  /**
   * A choice from the bank went into a taken position, and the choice there went back to the bank.
   */
  swappedBack: "orderSwappedBack",
} as const satisfies LabelKeys<string>;

/**
 * Every text an Order's island writes, as the server filled {@link orderKeys}.
 */
export type OrderLabels = Labels<typeof orderKeys>;
