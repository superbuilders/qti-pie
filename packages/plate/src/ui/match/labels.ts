/**
 * The words a Match says: the placement primitive's announcements, its refusals and its slots'
 * names, and the word a full group shows. The server fills them from plate's message catalog
 * (`labelsOf` in `#plate/ui/item/interactions/labels.ts`), with the author's
 * `data-max-selections-message` as `totalReached` where the interaction has one (QTI 3.0
 * information model 5.89.5), so the refusal reads on the page as in the server's validation.
 *
 * @module
 */
import type { LabelKeys, Labels } from "#plate/ui/item/interactions/labels.ts";
import { placementKeys } from "#plate/ui/placement/labels.ts";

/**
 * The catalog's message for every text a Match writes for the child: the placement primitive's,
 * where a group's name is its visible content, with Match's own wording for a chip already in as
 * many groups as it may be, and the word a full group shows. A Match's board never trades chips,
 * since a full group refuses, so it never says `swapped` or `swappedBack`.
 */
export const matchKeys = {
  ...placementKeys,
  /**
   * Refused: the chip is already in as many groups as its `match-max` allows.
   */
  chipUsedUp: "matchChipUsedUp",
  /**
   * Shown inside a group, after its name, while the group holds as many chips as its `match-max`
   * allows, and never before: a group's capacity is how many sources the answer puts there, so
   * showing it ahead would give the answer away. No placeholder.
   */
  full: "matchFull",
} as const satisfies LabelKeys<string>;

/**
 * Every text a Match's island writes, as the server filled {@link matchKeys}.
 */
export type MatchLabels = Labels<typeof matchKeys>;
