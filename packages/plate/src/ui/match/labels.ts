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

/**
 * The catalog's message for every text a Match laid out as a table (`qti-match-tabular`) writes for
 * the child: the Match's, with the table's own words for its refusals, which name a row and a
 * column where the bank's name a chip and a group, and `moved`, said when a row whose `match-max`
 * is 1 takes a new tick and its old one leaves (`press` in `#plate/ui/match/board.ts`). A tick put
 * in or taken out says nothing: its tick box says its own state. The table picks nothing up and
 * trades nothing, so it never says the primitive's other steps, and a press on a ticked cell takes
 * the tick out, so it never says `pairMade`.
 */
export const matchTableKeys = {
  ...matchKeys,
  /**
   * Refused: the row's source is in as many columns as its `match-max` allows. Placeholder:
   * `{chip}`.
   */
  chipUsedUp: "matchTableRowFull",
  /**
   * The row's tick moved to the cell pressed. Placeholders: `{chip}`, the row, and `{target}`, the
   * column it moved to.
   */
  moved: "matchTableMoved",
  /**
   * Refused: the row's or the column's `match-group` keeps the two apart. Placeholders: `{chip}`,
   * `{target}`.
   */
  notInGroup: "matchTableNotInGroup",
  /**
   * Refused: the column holds as many ticks as its `match-max` allows. Placeholder: `{target}`.
   */
  targetFull: "matchTableColumnFull",
  /**
   * Refused: the table holds as many ticks as `max-associations` allows, unless the author's
   * `data-max-selections-message` says it instead. No placeholder.
   */
  totalReached: "matchTableTotalReached",
} as const satisfies LabelKeys<string>;

/**
 * Every text a Match's table writes, as the server filled {@link matchTableKeys}.
 */
export type MatchTableLabels = Labels<typeof matchTableKeys>;
