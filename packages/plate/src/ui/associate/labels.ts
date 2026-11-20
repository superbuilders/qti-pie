/**
 * The words an Associate says: the placement primitive's announcements, its refusals and its
 * slots' names, in a board of boxes' wording. The server fills them from plate's message catalog
 * (`labelsOf` in `#plate/ui/item/interactions/labels.ts`). QTI gives `qti-associate-interaction` no
 * `data-max-selections-message` (QTI 3.0 information model 5.8 lists none, where 5.89.5 gives Match
 * one), so a pick at `max-associations` says the primitive's `totalReached`.
 *
 * @module
 */
import type { LabelKeys, Labels } from "#plate/ui/item/interactions/labels.ts";
import { boxKeys } from "#plate/ui/placement/labels.ts";

/**
 * The catalog's message for every text an Associate writes for the child: a board of boxes', where
 * a choice's name is its visible text and a box's is its `box` label with its number ("Pair 1"),
 * with Associate's own wording for a choice in as many pairs as its `match-max` allows.
 */
export const associateKeys = {
  ...boxKeys,
  /**
   * Refused: the choice is already in as many pairs as its `match-max` allows.
   */
  chipUsedUp: "associateChipUsedUp",
} as const satisfies LabelKeys<string>;

/**
 * Every text an Associate's island writes, as the server filled {@link associateKeys}.
 */
export type AssociateLabels = Labels<typeof associateKeys>;
