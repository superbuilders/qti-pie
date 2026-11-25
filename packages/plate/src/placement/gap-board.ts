/**
 * A Gap Match's board (`qti-gap-match-interaction`), which its island moves chips on: its gap texts
 * and gap images the chips, its gaps the targets. Every move the child makes, a drag, a tap and a
 * tap, or a key, is the placement machine's pick and place on this board
 * (`#plate/placement/machine.ts`), which refuses before anything changes and returns the next
 * placements, from which the island writes its whole response and draws every gap. Safe to import
 * on the server.
 *
 * @module
 */
import { chipRuleOf } from "#plate/placement/rules.ts";
import type { Associable } from "#plate/placement/rules.ts";
import type { Limit } from "#plate/placement/limit.ts";
import type { PairsBoard } from "#plate/placement/machine.ts";

/**
 * One `qti-gap` of the gapped content as the board takes it: its identifier, and its `match-group`,
 * the gap texts it may take, empty when the author wrote none or an empty list, which both mean any
 * (QTI 3.0 information model 5.55.4).
 */
export interface GapRule {
  readonly identifier: string;
  readonly matchGroup: readonly string[];
}

/**
 * How many gap texts a gap holds: "Each gap can have at most one choice associated with it"
 * (5.57).
 */
const oneGapText: Limit = { kind: "at-most", n: 1 };

/**
 * Build a Gap Match's board: its gap texts and gap images the chips, each placed up to its
 * `match-max`; its gaps the targets, each holding one; both sides' `match-group`s read on every
 * pair; and `max-associations` the total.
 *
 * A drop on a filled gap is refused, and the child lifts the gap text there out, a tap on it and a
 * tap on the bank, before another goes in. QTI leaves the drop open; plate rules it so for every
 * Gap Match, the owner's ruling of 2026-11-25 (refuse on full, and a gap text taken back by a tap
 * and a tap, never by one tap), as AlphaTest's player refused a drop on a full gap
 * (`GapMatchInteraction.tsx`, "Gap is full, don't add more"). No gap ever trades its gap text away
 * under the child's finger, so a gap changes only where the child put a gap text in or took one
 * out.
 *
 * @param gapTexts The gap texts and gap images, as presented.
 * @param gaps The gaps the gapped content shows, in document order.
 * @param maxAssociations `max-associations`, as the server wrote it.
 * @returns The board: no pair repeats, and a filled gap refuses a drop.
 */
export const gapBoardOf = (
  gapTexts: readonly Associable[],
  gaps: readonly GapRule[],
  maxAssociations: Limit,
): PairsBoard => ({
  chips: gapTexts.map(chipRuleOf),
  kind: "pairs",
  repeats: false,
  swap: false,
  targets: gaps.map(({ identifier, matchGroup }) => ({
    capacity: oneGapText,
    chips: matchGroup,
    id: identifier,
  })),
  total: maxAssociations,
});
