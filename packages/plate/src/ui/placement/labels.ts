/**
 * The words the placement primitive says: what a screen reader hears after each step of a pick and
 * a place, and why a move was refused. The server fills them from plate's message catalog
 * (`labelsOf` in `#plate/ui/item/interactions/labels.ts`) and passes them to an island as plain
 * strings, so no wording ships in the client's code.
 *
 * @module
 */
import type { LabelKeys, Labels } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for every text the placement primitive announces, each a template whose
 * `{placeholders}` it fills with the visible text of the chips and targets involved. `{chip}` is
 * the chip that moved, `{target}` the target it reached or was refused by, `{other}` a chip a swap
 * displaced, `{from}` the target that chip moved to, and `{partner}` the chip in the other half of
 * a box, which a refused pair would have joined `{chip}` with, or which a pair just made joins it
 * with. An island's keys start from these and put its own wording in place of some, by spread.
 */
export const placementKeys = {
  /**
   * The name of the bank's slot, the button that puts a placed chip back. No placeholder.
   */
  bankSlot: "placementBankSlot",
  /**
   * The picked chip was put down where it was, by Escape, a second tap, or a drop where it came
   * from. Placeholder: `{chip}`.
   */
  canceled: "placementCanceled",
  /**
   * Refused: the chip has been placed as often as its `match-max` allows. Placeholder: `{chip}`.
   */
  chipUsedUp: "placementChipUsedUp",
  /**
   * Refused: the chip's or the target's `match-group` keeps the two apart. Placeholders: `{chip}`,
   * `{target}`; on a board of boxes, `{partner}` too.
   */
  notInGroup: "placementNotInGroup",
  /**
   * Refused: the target already holds this chip, and the interaction makes each pair once.
   * Placeholders: `{chip}`, `{target}`; on a board of boxes, `{partner}` too.
   */
  pairMade: "placementPairMade",
  /**
   * Said after a step on a board of boxes, once for each pair the step makes that no box held
   * before it, so a child hears the pair made, a status message (WCAG 4.1.3) beside the step's own
   * words: `{chip}` is the chip the step moved, or the chip a swap traded into the other box, and
   * `{partner}` the chip beside it. A board of pairs or a sequence never says it.
   */
  paired: "pairsPaired",
  /**
   * A place was pressed with no chip picked up. No placeholder.
   */
  pickFirst: "placementPickFirst",
  /**
   * A chip was picked up, by a tap, a key or the start of a drag. Placeholder: `{chip}`.
   */
  picked: "placementPicked",
  /**
   * The picked chip went into a target. Placeholders: `{chip}`, `{target}`.
   */
  placed: "placementPlaced",
  /**
   * A placed chip went back to the bank. Placeholder: `{chip}`.
   */
  returned: "placementReturned",
  /**
   * Refused, on a board of boxes: the other half of the box holds the same chip, which no pair
   * joins with itself. Placeholder: `{chip}`.
   */
  selfPair: "pairsSelf",
  /**
   * The name of a target's slot, the button that puts the held chip in. Placeholder: `{target}`,
   * the target's name as announcements read it, which for an order's position is its number.
   */
  slot: "placementSlot",
  /**
   * A chip from one target went into another full target, and the chip that target held moved to
   * the first. Placeholders: `{chip}`, `{target}`, `{other}`, `{from}`.
   */
  swapped: "placementSwapped",
  /**
   * A chip from the bank went into a full target, and the chip it held went back to the bank.
   * Placeholders: `{chip}`, `{target}`, `{other}`.
   */
  swappedBack: "placementSwappedBack",
  /**
   * Refused: the target holds as many chips as it can, and a swap does not apply. Placeholder:
   * `{target}`.
   */
  targetFull: "placementTargetFull",
  /**
   * Refused: the interaction holds as many associations as its `max-associations` allows. No
   * placeholder.
   */
  totalReached: "placementTotalReached",
} as const satisfies LabelKeys<string>;

/**
 * Every text the placement primitive announces, as the server filled {@link placementKeys}.
 */
export type PlacementLabels = Labels<typeof placementKeys>;

/**
 * The catalog's message for every text a board of boxes writes for the child, Associate's and
 * Graphic Associate's: the placement primitive's, a pair's own words where a refusal names the chip
 * already in the box, and the names of a box and of its halves. A board of boxes trades the chip of
 * a full half, and no half shows full, so it never says `targetFull`.
 */
export const boxKeys = {
  ...placementKeys,
  /**
   * The name of a box as a whole, for words about the pair it holds rather than one half: the
   * island fills `{n}`, the box's number from 1, the empty box after the others included.
   */
  box: "pairsBox",
  /**
   * The name of a box's first half, its target's `aria-label`, which announcements and its slot
   * say. Placeholder: `{n}`, the box's number from 1. It differs from `boxSecond`, so no two halves
   * of a board share a name (WCAG 2.4.6).
   */
  boxFirst: "pairsBoxFirst",
  /**
   * The name of a box's second half, as `boxFirst` names the first. Placeholder: `{n}`.
   */
  boxSecond: "pairsBoxSecond",
  /**
   * On a board of boxes the refusal concerns the chip in the other half, `{partner}`, rather than
   * the half.
   */
  notInGroup: "pairsNotInGroup",
  /**
   * As `notInGroup`, the pair already made with `{partner}`.
   */
  pairMade: "pairsMade",
} as const satisfies LabelKeys<string>;

/**
 * Every text a board of boxes writes, as the server filled {@link boxKeys}.
 */
export type BoxLabels = Labels<typeof boxKeys>;
