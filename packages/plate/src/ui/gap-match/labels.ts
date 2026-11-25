/**
 * The words a Gap Match says: the placement primitive's announcements and refusals, and the name of
 * each gap in the author's sentence. The server fills them from plate's message catalog (`labelsOf`
 * in `#plate/ui/item/interactions/labels.ts`), with the author's `data-max-selections-message` as
 * `totalReached` where the interaction has one (QTI 3.0 information model 5.57.5).
 *
 * @module
 */
import type { LabelKeys, Labels } from "#plate/ui/item/interactions/labels.ts";
import { placementKeys } from "#plate/ui/placement/labels.ts";

/**
 * The catalog's message for every text a Gap Match writes for the child: the placement primitive's,
 * and a gap's name, which fills `{target}` and `{from}` in the primitive's, so `placed` names the
 * gap a chip went into and an empty gap's slot names its gap. A drop on a filled gap is refused
 * with `targetFull`, "Blank 2 is full. Take one out first.", since a gap holds one gap text and
 * gives none up to a drop (`gapBoardOf` in `#plate/placement/gap-board.ts`).
 */
export const gapMatchKeys = {
  ...placementKeys,
  /**
   * A gap's accessible name, which announcements and refusals name it by, with `{n}` for its number
   * among the interaction's gaps in document order, counted from 1, which the island fills.
   */
  gap: "gapMatchGap",
} as const satisfies LabelKeys<string>;

/**
 * Every text a Gap Match's island writes, as the server filled {@link gapMatchKeys}.
 */
export type GapMatchLabels = Labels<typeof gapMatchKeys>;
