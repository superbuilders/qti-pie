/**
 * The placement machine: what a child may do with chips, a bank and targets, as pure functions of
 * an arrangement, a board and the placements on it, with no DOM and no React. Match, gap match and
 * graphic gap match are boards of pairs, a chip in a target each; order and graphic order boards of
 * positions; associate and graphic associate boards of boxes, each box two halves that pair two
 * chips.
 *
 * QTI decides each limit. A chip is a choice the child moves (`qti-simple-associable-choice` in
 * the first match set or in an associate, `qti-gap-text`, `qti-simple-choice`,
 * `qti-associable-hotspot`), and its use limit is its `match-max`, "The maximum number of choices
 * this choice may be associated with" (QTI 3.0 information model 5.58, 5.131; a hotspot's, 5.7.8).
 * A target is a target choice or a gap. The total is the interaction's `max-associations`, "The
 * maximum number of associations that the candidate is allowed to make" (5.8, 5.57, 5.59, 5.89).
 * The server writes each as a {@link Limit}. What happens on a drop onto a full target QTI leaves
 * open, so the swap there is plate's ruling.
 *
 * The placements are controlled: an island derives them from the response it holds, passes them
 * in, and posts the placements a step returns. A refused step returns only its refusal, so nothing
 * half-applies.
 *
 * @module
 */
import type { Pair } from "#plate/interactions/pair.ts";
import { isOne, reached } from "#plate/placement/limit.ts";
import type { Limit } from "#plate/placement/limit.ts";

/**
 * A chip of a board of pairs: one source the child moves, by its QTI identifier. `uses` is the
 * choice's `match-max`, how many times it may be placed; a chip with more than one use is a stack
 * of copies, as a gap text that fills several gaps is. `targets` is the choice's `match-group`,
 * the targets it may go in, empty for any (see {@link PairsBoard}).
 */
export interface ChipRule {
  readonly id: string;
  readonly uses: Limit;
  readonly targets: readonly string[];
}

/**
 * A target of a board of pairs: one place a chip goes, by its QTI identifier, and how many chips it
 * holds at once. A gap holds at most 1, since "Each gap can have at most one choice associated with
 * it" (5.57); a match target holds its own `match-max`. `chips` is the target's `match-group`, the
 * chips it takes, empty for any (see {@link PairsBoard}).
 */
export interface TargetRule {
  readonly id: string;
  readonly capacity: Limit;
  readonly chips: readonly string[];
}

/**
 * The rules of an ordered response: the candidate must "select a subset of the choices and impose
 * an ordering on them" (5.97). Its targets are positions, each holding one choice, and each choice
 * is placed once. A chip goes into the position it is put on, empty or not, so a child builds the
 * order in any order: an empty position takes it, a filled one trades places with it, and the
 * position a chip leaves stays empty until another fills it (Bjorn, 2026-11-15). How many positions
 * there are is the placements' own length ({@link Sequence}).
 *
 * - `chips`: the choices' identifiers, in the order the page shows them.
 */
export interface SequenceBoard {
  readonly kind: "sequence";
  readonly chips: readonly string[];
}

/**
 * The rules of a response of pairs, a chip in a target each, as a match's or a gap match's
 * `directedPair`s are.
 *
 * - `chips` and `targets` in the order the page shows them.
 * - `total` is `max-associations`.
 * - `repeats` says whether one chip may sit in one target more than once. A match makes each
 *   association once, and a gap holds one chip, so neither repeats; a graphic gap match does: "the
 *   same choice may be associated with an qti-associable-hotspot multiple times, in which case the
 *   corresponding directed pair appears multiple times in the value of the response variable" (QTI
 *   3.0 implementation guide, graphic gap match).
 * - `swap` says whether a drop onto a full target that holds at most one chip trades places with that
 *   chip: a chip from the bank sends the occupant back, and a chip from another target takes the
 *   occupant's place and leaves it its own. A graphic gap match's hotspot that holds one swaps; a
 *   gap refuses, so the child lifts its gap text out first (`gapBoardOf` in
 *   `#plate/placement/gap-board.ts`); and a match target that holds several refuses, since which
 *   chip would leave is not the child's to guess.
 *
 * A pair is allowed only where both sides' `match-group`s allow it. QTI's `match-group` is "a list
 * of the identifiers for the objects that can be matched with this choice" (5.131.5; on a gap,
 * 5.55.4; on a gap text, 5.58.4); plate's ruling reads it on both sides of a pair, an absent or
 * empty one admitting any (spec reading 179).
 */
export interface PairsBoard {
  readonly kind: "pairs";
  readonly chips: readonly ChipRule[];
  readonly targets: readonly TargetRule[];
  readonly total: Limit;
  readonly repeats: boolean;
  readonly swap: boolean;
}

/**
 * A chip of a board of boxes: one choice the child pairs with another, by its QTI identifier.
 * `uses` is the choice's `match-max`, how many pairs it may be in, and `partners` its
 * `match-group`, the choices it may pair with, empty for any (see {@link BoxesBoard}).
 */
export interface PartnerRule {
  readonly id: string;
  readonly uses: Limit;
  readonly partners: readonly string[];
}

/**
 * The rules of a response of `pair`s, as an associate's and a graphic associate's are: the child
 * makes each pair in a box of two halves, a chip in each. A `pair` is undirected, "so (A,B) and
 * (B,A) are equivalent" (QTI 3.0 information model 8.13), so a box's halves hold no order: its two
 * chips are one pair whichever half each is in, and the box is a pair only once both are full.
 *
 * - `chips`: the choices, in the order the page shows them.
 * - `total`: `max-associations` (5.8.2, 5.59.2), how many pairs there may be, and so how many boxes.
 *
 * The page shows the boxes that hold a chip and, after them, one empty box a new pair begins in,
 * once every box holds a pair and while the total allows one more: boxes grow one at a time, and
 * none is offered at the total (plate's ruling R11). A box whose halves both empty closes up, so no
 * empty box stands among the others. A half holds one chip, and a drop onto a full half trades
 * places with its chip, as a graphic gap match's hotspot that holds one does.
 *
 * A pair joins two different choices, as no other box joins them in either order: plate's ruling
 * (after #246), since an associate lets the candidate "create associations between" its choices
 * (5.8) and QTI counts a choice's `match-max` in "choices this choice may be associated with"
 * (5.131.6). It is allowed only where both chips' `match-group`s allow it (plate's reading 179). A
 * chip sits in no more boxes than its `match-max`, whether or not each is a pair yet, since each
 * box it is in becomes one; and as no box repeats a pair or pairs a chip with itself, every box a
 * chip is in counts one distinct pair (#269).
 *
 * `min-associations` (5.8.3) and each choice's `match-min` (5.131.7) decide whether a submitted
 * response is valid, which the server judges, and a child is never stopped short of them, so the
 * board holds no least count.
 */
export interface BoxesBoard {
  readonly kind: "boxes";
  readonly chips: readonly PartnerRule[];
  readonly total: Limit;
}

/**
 * What one position of a sequence holds: the chip placed there, or `null` while it is empty.
 */
export type Occupant = string | null;

/**
 * A sequence's placements: one occupant per position, the first position's first, so a sequence
 * holds as many as the order shows positions, filled or empty. Its chips in position order are the
 * ordered response only while no empty position stands before a filled one: an ordered response
 * holds no gap.
 */
export type Sequence = readonly Occupant[];

/**
 * A board of pairs' placements, each a chip in a target, the {@link Pair} a match or a gap match
 * posts: a bag, as its `multiple` response is; the list's order is only the order a target shows
 * its chips in.
 */
export type Pairs = readonly Pair[];

/**
 * One box of a board of boxes: its two halves, each the chip it holds, or `null` while it holds
 * none. A box whose halves both hold a chip is a pair, which its response posts as the `pair`
 * `"first second"`.
 */
export type Box = readonly [string | null, string | null];

/**
 * A board of boxes' placements: the boxes that hold a chip, in the order the page shows them. None
 * is empty: the empty box a new pair begins in is no placement (see {@link shownBoxes}).
 */
export type Boxes = readonly Box[];

/**
 * A sequence board and the placements on it.
 */
export type SequenceArrangement = SequenceBoard & { readonly placements: Sequence };

/**
 * A board of pairs and the placements on it.
 */
export type PairsArrangement = PairsBoard & { readonly placements: Pairs };

/**
 * A board of boxes and the placements on it.
 */
export type BoxesArrangement = BoxesBoard & { readonly placements: Boxes };

/**
 * A board and the placements on it, together, so one kind of board never meets another's
 * placements.
 */
export type Arrangement = SequenceArrangement | PairsArrangement | BoxesArrangement;

/**
 * A board of pairs' target, as a place a chip can be, by its QTI identifier.
 */
export interface Target {
  readonly kind: "target";
  readonly id: string;
}

/**
 * A sequence's position, as a place a chip can be, by its index from 0: a position has no
 * identifier in QTI.
 */
export interface Position {
  readonly kind: "position";
  readonly index: number;
}

/**
 * A half of a box, as a place a chip can be: the box's index from 0, among the boxes the page
 * shows, and the half's, 0 or 1. Neither has an identifier in QTI.
 */
export interface Half {
  readonly kind: "half";
  readonly box: number;
  readonly side: 0 | 1;
}

/**
 * A place that holds chips, as a target part renders it: a board of pairs' target, a sequence's
 * position, or a box's half.
 */
export type Spot = Target | Position | Half;

/**
 * The bank, where chips start and come back to, as a place.
 */
export interface Bank {
  readonly kind: "bank";
}

/**
 * Where a chip can be: the bank, or a spot.
 */
export type Place = Bank | Spot;

/**
 * The bank, as a place.
 */
export const bank: Bank = { kind: "bank" };

/**
 * The chip the child holds: its identifier, and the place it was picked up from.
 */
export interface Picked {
  readonly chip: string;
  readonly from: Place;
}

/**
 * Why a step was refused, by the key of the label that says so (`PlacementLabels`).
 *
 * - `pickFirst`: a place was chosen with no chip held.
 * - `targetFull`: the target holds its capacity, and a swap does not apply.
 * - `chipUsedUp`: the chip from the bank is placed as often as its `match-max` allows.
 * - `totalReached`: a new association would pass `max-associations`.
 * - `pairMade`: the target already holds the chip, and the board does not repeat pairs; on a board of
 *   boxes, another box already pairs the chip with the one in the half beside it, in either order.
 * - `notInGroup`: the chip's `match-group` leaves the target out, or the target's leaves the chip
 *   out; on a board of boxes, either chip's leaves out the other.
 * - `selfPair`: on a board of boxes, the half beside the target holds the same chip, which no pair
 *   joins with itself.
 * - `unknown`: the step names a chip or place the board lacks, or a chip where the placements do not
 *   hold it, as when the response changed under a held chip. No label says it, since the child did
 *   not cause it.
 */
export type RefusalReason =
  | "pickFirst"
  | "targetFull"
  | "chipUsedUp"
  | "totalReached"
  | "pairMade"
  | "notInGroup"
  | "selfPair"
  | "unknown";

/**
 * A refused step's reason, with the chip and the target it concerns, so an announcement can name
 * them: `null` where the reason concerns none. `partner` is the chip a refused pair on a board of
 * boxes would join `chip` with, the one in the half beside the target, and `null` on every other
 * refusal.
 */
export interface Refusal {
  readonly reason: RefusalReason;
  readonly chip: string | null;
  readonly target: Spot | null;
  readonly partner: string | null;
}

/**
 * What a step that went through did, in the terms an announcement needs. Every target named is the
 * one the chip ended in, after the boxes closed up.
 *
 * - `picked`: `chip` was picked up from `from`.
 * - `placed`: `chip` went from `from` into `target`, which had room.
 * - `swapped`: `chip` went from `from` into the full `target`, and `other`, which it held, went to
 *   `otherTo`, the place `chip` left.
 * - `returned`: `chip` went from the target `from` back to the bank.
 * - `canceled`: `chip`, held from `from`, was put down, and nothing moved.
 */
export type Move =
  | { readonly kind: "picked"; readonly chip: string; readonly from: Place }
  | { readonly kind: "placed"; readonly chip: string; readonly from: Place; readonly target: Spot }
  | {
      readonly kind: "swapped";
      readonly chip: string;
      readonly from: Place;
      readonly target: Spot;
      readonly other: string;
      readonly otherTo: Place;
    }
  | { readonly kind: "returned"; readonly chip: string; readonly from: Spot }
  | { readonly kind: "canceled"; readonly chip: string; readonly from: Place };

/**
 * A refused step: why, and nothing else, since a refused step changes nothing.
 */
export interface Refused {
  readonly ok: false;
  readonly refusal: Refusal;
}

/**
 * The result of a pick: the chip held and what happened, or the refusal.
 */
export type Picking =
  | {
      readonly ok: true;
      readonly picked: Picked;
      readonly move: Extract<Move, { kind: "picked" }>;
    }
  | Refused;

/**
 * The result of a place: the next arrangement, with nothing held, and what happened, or the
 * refusal, which leaves the chip held.
 */
export type Step =
  | {
      readonly ok: true;
      readonly arrangement: Arrangement;
      readonly move: Exclude<Move, { kind: "picked" }>;
    }
  | Refused;

/**
 * Report whether two places are the same: both the bank, the same target, the same position or the
 * same half.
 *
 * @param a One place, or none.
 * @param b The other, or none.
 * @returns Whether they name one place; two nones are the same.
 */
export const samePlace = (a: Place | null, b: Place | null): boolean => {
  if (a === null || b === null) {
    return a === b;
  }

  if (a.kind === "bank") {
    return b.kind === "bank";
  }

  if (a.kind === "half") {
    return b.kind === "half" && a.box === b.box && a.side === b.side;
  }

  return a.kind === "target"
    ? b.kind === "target" && a.id === b.id
    : b.kind === "position" && a.index === b.index;
};

/**
 * Find a chip's rule on a board of pairs.
 *
 * @param board The board.
 * @param chip A chip identifier.
 * @returns Its rule, or undefined when the board has no such chip.
 */
const chipRule = (board: PairsBoard, chip: string): ChipRule | undefined =>
  board.chips.find((rule) => rule.id === chip);

/**
 * Find a target's rule on a board of pairs.
 *
 * @param board The board.
 * @param target A target's identifier.
 * @returns Its rule, or undefined when the board has no such target.
 */
const targetRule = (board: PairsBoard, target: string): TargetRule | undefined =>
  board.targets.find((rule) => rule.id === target);

/**
 * Find the position a spot names, by its index, which names a position of a sequence only where
 * its placements hold an occupant at that index.
 *
 * @param spot A spot.
 * @returns Its index, or undefined when it is no position.
 */
const positionOf = (spot: Spot): number | undefined =>
  spot.kind === "position" ? spot.index : undefined;

/**
 * Name a sequence's position as a place.
 *
 * @param index The position's index, from 0.
 * @returns The position.
 */
const position = (index: number): Position => ({ index, kind: "position" });

/**
 * Take the placements of a board of pairs that a chip, a target or both name.
 *
 * @param placements The placements.
 * @param of The chip, the target's identifier, or both, that a placement must have.
 * @returns The placements that have them, in order.
 */
const matching = (
  placements: Pairs,
  of: { readonly chip?: string; readonly target?: string },
): Pairs =>
  placements.filter(
    (placement) =>
      (of.chip === undefined || placement.chip === of.chip) &&
      (of.target === undefined || placement.target === of.target),
  );

/**
 * Take one placement out of the placements: the first with its chip and target.
 *
 * @param placements The placements.
 * @param placement The chip and the target it leaves.
 * @returns The placements without the first such pair.
 */
const removeOne = (placements: Pairs, placement: Pair): Pairs => {
  const at = placements.findIndex(
    (each) => each.chip === placement.chip && each.target === placement.target,
  );

  return at === -1 ? placements : placements.toSpliced(at, 1);
};

/**
 * Report whether both sides' `match-group`s allow a pair: each side's group is empty or names the
 * other. A side the board lacks has no group.
 *
 * @param board The board.
 * @param chip A chip identifier.
 * @param target A target identifier.
 * @returns Whether the chip may go in the target.
 */
const inGroup = (board: PairsBoard, chip: string, target: string): boolean => {
  const targets = chipRule(board, chip)?.targets ?? [];
  const chips = targetRule(board, target)?.chips ?? [];

  return (
    (targets.length === 0 || targets.includes(target)) &&
    (chips.length === 0 || chips.includes(chip))
  );
};

/**
 * Find a chip's rule on a board of boxes.
 *
 * @param board The board.
 * @param chip A chip identifier.
 * @returns Its rule, or undefined when the board has no such chip.
 */
const partnerRule = (board: BoxesBoard, chip: string): PartnerRule | undefined =>
  board.chips.find((rule) => rule.id === chip);

/**
 * Report whether both chips' `match-group`s allow them to pair: each one's group is empty or names
 * the other. A chip the board lacks has no group.
 *
 * @param board The board.
 * @param chip One chip identifier.
 * @param partner The other.
 * @returns Whether the two may pair.
 */
const partnered = (board: BoxesBoard, chip: string, partner: string): boolean => {
  const mine = partnerRule(board, chip)?.partners ?? [];
  const theirs = partnerRule(board, partner)?.partners ?? [];

  return (
    (mine.length === 0 || mine.includes(partner)) && (theirs.length === 0 || theirs.includes(chip))
  );
};

/**
 * A box with neither half full, as the page shows the box a new pair begins in.
 */
const emptyBox: Box = [null, null];

/**
 * Report whether a box holds a pair: a chip in each half.
 *
 * @param box The box.
 * @returns Whether both halves hold a chip.
 */
const complete = (box: Box): box is readonly [string, string] => box[0] !== null && box[1] !== null;

/**
 * Report whether a box holds no chip.
 *
 * @param box The box.
 * @returns Whether both halves are empty.
 */
const empty = (box: Box): boolean => box[0] === null && box[1] === null;

/**
 * Report whether two boxes hold one pair: both full, with the same two chips in either order.
 *
 * @param a One box.
 * @param b The other.
 * @returns Whether they pair the same chips.
 */
const samePair = (a: Box, b: Box): boolean =>
  complete(a) &&
  complete(b) &&
  ((a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]));

/**
 * Report whether two lists of boxes are the same: each box with the same chip in the same half.
 *
 * @param a One list.
 * @param b The other.
 * @returns Whether every chip sits where it sat.
 */
const sameBoxes = (a: Boxes, b: Boxes): boolean =>
  a.length === b.length &&
  a.every((box, index) => box[0] === b[index]?.[0] && box[1] === b[index]?.[1]);

/**
 * Read the chip a half holds.
 *
 * @param boxes The boxes.
 * @param half A half.
 * @returns Its chip, `null` when it holds none, or undefined when no box of the list has it, as the
 *   empty box a new pair begins in does not.
 */
const holderOf = (boxes: Boxes, half: Half): string | null | undefined =>
  boxes[half.box]?.[half.side];

/**
 * Name the half beside a half, in the same box.
 *
 * @param half A half.
 * @returns The box's other half.
 */
const besideOf = (half: Half): Half => ({
  box: half.box,
  kind: "half",
  side: half.side === 0 ? 1 : 0,
});

/**
 * Put a chip in a half, or empty it.
 *
 * @param boxes The boxes, the half's among them.
 * @param half The half.
 * @param chip The chip it holds now, or `null` for none.
 * @returns The boxes, with that half's chip replaced.
 */
const write = (boxes: Boxes, half: Half, chip: string | null): Boxes =>
  boxes.map((box, index): Box => {
    if (index !== half.box) {
      return box;
    }

    return half.side === 0 ? [chip, box[1]] : [box[0], chip];
  });

/**
 * Close the boxes up: drop every box that holds no chip, so the rest keep their order.
 *
 * @param boxes The boxes.
 * @returns The boxes that hold a chip.
 */
const closeUp = (boxes: Boxes): Boxes => boxes.filter((box) => !empty(box));

/**
 * Name the half a half becomes once the boxes close up: the same half of its box, which moves up
 * one place for each empty box before it.
 *
 * @param boxes The boxes before they close up.
 * @param half A half of a box that holds a chip.
 * @returns The half it is after.
 */
const closedUp = (boxes: Boxes, half: Half): Half => ({
  box: half.box - boxes.slice(0, half.box).filter(empty).length,
  kind: "half",
  side: half.side,
});

/**
 * Count the boxes a chip sits in.
 *
 * @param boxes The boxes.
 * @param chip A chip identifier.
 * @returns How many boxes hold it, in either half.
 */
const boxesHolding = (boxes: Boxes, chip: string): number =>
  boxes.filter((box) => box[0] === chip || box[1] === chip).length;

/**
 * Report whether the page offers a new box after the boxes: once every box holds a pair, and while
 * `max-associations` allows one more pair (plate's ruling R11).
 *
 * @param arrangement A board of boxes and its placements.
 * @returns Whether an empty box follows the boxes.
 */
const opensBox = (arrangement: BoxesArrangement): boolean =>
  arrangement.placements.every(complete) &&
  !reached(arrangement.total, arrangement.placements.length);

/**
 * Report whether the page shows a half: one of a box's, or of the empty box after them when one is
 * offered.
 *
 * @param arrangement A board of boxes and its placements.
 * @param half A half.
 * @returns Whether a chip can be put there.
 */
const offers = (arrangement: BoxesArrangement, half: Half): boolean => {
  const { length } = arrangement.placements;

  return (
    Number.isInteger(half.box) &&
    half.box >= 0 &&
    (half.box < length || (half.box === length && opensBox(arrangement)))
  );
};

/**
 * Report whether two lists of pairs are the same bag: each pair as many times in both.
 *
 * @param a One list.
 * @param b The other.
 * @returns Whether every chip sits where it sat.
 */
const sameBag = (a: Pairs, b: Pairs): boolean =>
  a.length === b.length && a.every((pair) => matching(a, pair).length === matching(b, pair).length);

/**
 * Build a refused step.
 *
 * @param reason Why it was refused.
 * @param chip The chip it concerns, if any.
 * @param target The target it concerns, if any.
 * @param partner The chip a refused pair on a board of boxes would join `chip` with, if any.
 * @returns The refusal.
 */
const refuse = (
  reason: RefusalReason,
  chip: string | null,
  target: Spot | null,
  partner: string | null = null,
): Refused => ({
  ok: false,
  refusal: { chip, partner, reason, target },
});

/**
 * Name the spot a place is, for a refusal.
 *
 * @param place A place.
 * @returns The spot, or `null` for the bank.
 */
const spotOf = (place: Place): Spot | null => (place.kind === "bank" ? null : place);

/**
 * Build the step that puts the held chip down with nothing moved.
 *
 * @param arrangement The arrangement, as it stays.
 * @param picked The chip held.
 * @returns The step.
 */
const putDown = (arrangement: Arrangement, picked: Picked): Step => ({
  arrangement,
  move: { chip: picked.chip, from: picked.from, kind: "canceled" },
  ok: true,
});

/**
 * Build a pick that went through.
 *
 * @param picked The chip now held.
 * @returns The pick.
 */
const lifted = (picked: Picked): Picking => ({
  move: { chip: picked.chip, from: picked.from, kind: "picked" },
  ok: true,
  picked,
});

/**
 * Put a sequence board's placements beside it.
 *
 * @param board The board.
 * @param placements Its next placements.
 * @returns The arrangement.
 */
const sequenced = (board: SequenceBoard, placements: Sequence): SequenceArrangement => ({
  chips: board.chips,
  kind: "sequence",
  placements,
});

/**
 * Put a board of pairs' placements beside it.
 *
 * @param board The board.
 * @param placements Its next placements.
 * @returns The arrangement.
 */
const paired = (board: PairsBoard, placements: Pairs): PairsArrangement => ({
  chips: board.chips,
  kind: "pairs",
  placements,
  repeats: board.repeats,
  swap: board.swap,
  targets: board.targets,
  total: board.total,
});

/**
 * Put a board of boxes' placements beside it.
 *
 * @param board The board.
 * @param placements Its next placements.
 * @returns The arrangement.
 */
const boxed = (board: BoxesBoard, placements: Boxes): BoxesArrangement => ({
  chips: board.chips,
  kind: "boxes",
  placements,
  total: board.total,
});

/**
 * Report whether a chip in the bank has no use left: placed as often as its `match-max` allows,
 * placed already in a sequence, or not on the board at all. On a board of boxes a chip is placed
 * once for each box it is in.
 *
 * @param arrangement The arrangement.
 * @param chip A chip identifier.
 * @returns Whether the bank can give out no more of it.
 */
export const usedUp = (arrangement: Arrangement, chip: string): boolean => {
  if (arrangement.kind === "sequence") {
    return !arrangement.chips.includes(chip) || arrangement.placements.includes(chip);
  }

  if (arrangement.kind === "boxes") {
    const rule = partnerRule(arrangement, chip);

    return rule === undefined || reached(rule.uses, boxesHolding(arrangement.placements, chip));
  }

  const rule = chipRule(arrangement, chip);

  return (
    rule === undefined || reached(rule.uses, matching(arrangement.placements, { chip }).length)
  );
};

/**
 * Report whether the bank has no use of any chip left.
 *
 * @param arrangement The arrangement.
 * @returns Whether every chip is used up.
 */
export const bankEmpty = (arrangement: Arrangement): boolean =>
  arrangement.kind === "sequence"
    ? arrangement.chips.every((chip) => usedUp(arrangement, chip))
    : arrangement.chips.every((rule) => usedUp(arrangement, rule.id));

/**
 * Report whether a chip in the bank is a stack of copies: a chip of a board of pairs or of boxes
 * whose `match-max` is not 1.
 *
 * @param arrangement The arrangement.
 * @param chip A chip identifier.
 * @returns Whether it may be placed more than once.
 */
export const hasCopies = (arrangement: Arrangement, chip: string): boolean => {
  if (arrangement.kind === "sequence") {
    return false;
  }

  const rule =
    arrangement.kind === "boxes" ? partnerRule(arrangement, chip) : chipRule(arrangement, chip);

  return rule !== undefined && !isOne(rule.uses);
};

/**
 * List the chips a spot holds.
 *
 * @param arrangement The arrangement.
 * @param spot A target, a position or a half.
 * @returns Its chips' identifiers, in the order it shows them, once per placement; none for a spot
 *   of another kind of board.
 */
export const chipsIn = (arrangement: Arrangement, spot: Spot): readonly string[] => {
  if (arrangement.kind === "sequence") {
    const index = positionOf(spot);
    const chip = index === undefined ? undefined : arrangement.placements[index];

    return chip === undefined || chip === null ? [] : [chip];
  }

  if (arrangement.kind === "boxes") {
    const chip = spot.kind === "half" ? holderOf(arrangement.placements, spot) : undefined;

    return chip === undefined || chip === null ? [] : [chip];
  }

  return spot.kind === "target"
    ? matching(arrangement.placements, { target: spot.id }).map((placement) => placement.chip)
    : [];
};

/**
 * Report whether a spot shows "full" to the child: it holds its capacity and takes no swap, as a
 * match group at its `match-max` does, or a filled gap. An order position, a half, or a graphic gap
 * match's hotspot that holds one still takes a chip, by trading places.
 *
 * @param arrangement The arrangement.
 * @param spot A target, a position or a half.
 * @returns Whether the spot is full to the child.
 */
export const showsFull = (arrangement: Arrangement, spot: Spot): boolean => {
  if (arrangement.kind !== "pairs" || spot.kind !== "target") {
    return false;
  }

  const rule = targetRule(arrangement, spot.id);

  return (
    rule !== undefined &&
    reached(rule.capacity, matching(arrangement.placements, { target: spot.id }).length) &&
    !(arrangement.swap && isOne(rule.capacity))
  );
};

/**
 * List the boxes the page shows for a board of boxes: its placements, then, once every box holds a
 * pair and while `max-associations` allows one more, one empty box a new pair begins in (plate's
 * ruling R11). The page renders each box's two halves as spots, the empty box's too, so at the
 * total, with every box a pair, no empty box follows and the boxes are full.
 *
 * @param arrangement A board of boxes and its placements.
 * @returns The boxes, the empty one last when there is one.
 */
export const shownBoxes = (arrangement: BoxesArrangement): Boxes =>
  opensBox(arrangement) ? [...arrangement.placements, emptyBox] : arrangement.placements;

/**
 * Find why the held chip may not enter a target at all, whatever the target holds: a
 * `match-group` on either side that keeps them apart, a chip from the bank with no uses left, or
 * a pair the target holds already on a board that makes each pair once.
 *
 * @param arrangement The arrangement.
 * @param picked The chip held.
 * @param to The target, as a place.
 * @param rule The target's rule.
 * @returns The refusal, or undefined.
 */
const entryRefusal = (
  arrangement: PairsArrangement,
  picked: Picked,
  to: Target,
  rule: TargetRule,
): Refused | undefined => {
  const { chip, from } = picked;

  if (!inGroup(arrangement, chip, rule.id)) {
    return refuse("notInGroup", chip, to);
  }

  if (from.kind === "bank" && usedUp(arrangement, chip)) {
    return refuse("chipUsedUp", chip, null);
  }

  if (
    !arrangement.repeats &&
    matching(arrangement.placements, { chip, target: rule.id }).length > 0
  ) {
    return refuse("pairMade", chip, to);
  }

  return undefined;
};

/**
 * Trade the held chip with the one chip of a full target, on a board of pairs: the occupant goes
 * where the held chip came from, back to the bank or into its target, if that target may take it.
 * A trade with a copy of the held chip moves nothing, and puts the chip down.
 *
 * @param arrangement The arrangement.
 * @param picked The chip held.
 * @param source The placement the held chip was picked up from, or `null` for the bank.
 * @param occupant The target's one placement.
 * @param to The target, as a place.
 * @returns The step, or the refusal.
 */
const swapPair = (
  arrangement: PairsArrangement,
  picked: Picked,
  source: Pair | null,
  occupant: Pair,
  to: Target,
): Step => {
  const { chip, from } = picked;
  const { placements } = arrangement;
  const left = source === null ? placements : removeOne(placements, source);
  const rest = removeOne(left, occupant);

  if (source !== null && !inGroup(arrangement, occupant.chip, source.target)) {
    return refuse("notInGroup", occupant.chip, spotOf(from));
  }

  if (
    source !== null &&
    !arrangement.repeats &&
    matching(rest, { chip: occupant.chip, target: source.target }).length > 0
  ) {
    return refuse("pairMade", occupant.chip, spotOf(from));
  }

  const entry: Pair = { chip, target: occupant.target };
  const back: Pairs = source === null ? [] : [{ chip: occupant.chip, target: source.target }];
  const next = [...rest, entry, ...back];

  if (sameBag(next, placements)) {
    return putDown(arrangement, picked);
  }

  return {
    arrangement: paired(arrangement, next),
    move: {
      chip,
      from,
      kind: "swapped",
      other: occupant.chip,
      otherTo: from,
      target: to,
    },
    ok: true,
  };
};

/**
 * Place the held chip on a board of pairs (see {@link place}).
 *
 * @param arrangement The arrangement.
 * @param picked The chip held.
 * @param to A target, or the bank.
 * @returns The step, or the refusal.
 */
const placePair = (arrangement: PairsArrangement, picked: Picked, to: Place): Step => {
  const { chip, from } = picked;
  const { placements } = arrangement;
  const source = from.kind === "target" ? matching(placements, { chip, target: from.id })[0] : null;

  if (
    chipRule(arrangement, chip) === undefined ||
    from.kind === "position" ||
    from.kind === "half" ||
    source === undefined
  ) {
    return refuse("unknown", chip, spotOf(from));
  }

  if (to.kind === "bank") {
    return source === null
      ? putDown(arrangement, picked)
      : {
          arrangement: paired(arrangement, removeOne(placements, source)),
          move: { chip, from: { id: source.target, kind: "target" }, kind: "returned" },
          ok: true,
        };
  }

  const rule = to.kind === "target" ? targetRule(arrangement, to.id) : undefined;

  if (to.kind !== "target" || rule === undefined) {
    return refuse("unknown", chip, to);
  }

  if (samePlace(to, from)) {
    return putDown(arrangement, picked);
  }

  const refusal = entryRefusal(arrangement, picked, to, rule);

  if (refusal !== undefined) {
    return refusal;
  }

  const held = matching(placements, { target: rule.id });

  if (!reached(rule.capacity, held.length)) {
    if (source === null && reached(arrangement.total, placements.length)) {
      return refuse("totalReached", chip, to);
    }

    const left = source === null ? placements : removeOne(placements, source);

    return {
      arrangement: paired(arrangement, [...left, { chip, target: rule.id }]),
      move: { chip, from, kind: "placed", target: to },
      ok: true,
    };
  }

  const [occupant] = held;

  return arrangement.swap && isOne(rule.capacity) && occupant !== undefined
    ? swapPair(arrangement, picked, source, occupant, to)
    : refuse("targetFull", chip, to);
};

/**
 * Place the held chip on a sequence board (see {@link place}): into the position it is put on. An
 * empty position takes it; a filled one trades places with it, the chip there going where the held
 * one came from, the bank or its position. A chip that leaves a position leaves it empty, so
 * nothing else moves: a swap, never a shift, since a shift would have to choose which way the
 * chips between move and where the last goes when no position is empty.
 *
 * @param arrangement The arrangement.
 * @param picked The chip held.
 * @param to A position, or the bank.
 * @returns The step, or the refusal.
 */
const placeInSequence = (arrangement: SequenceArrangement, picked: Picked, to: Place): Step => {
  const { chip, from } = picked;
  const { placements } = arrangement;
  const at = from.kind === "bank" ? null : positionOf(from);

  if (
    !arrangement.chips.includes(chip) ||
    at === undefined ||
    (at !== null && placements[at] !== chip)
  ) {
    return refuse("unknown", chip, spotOf(from));
  }

  if (to.kind === "bank") {
    return at === null
      ? putDown(arrangement, picked)
      : {
          arrangement: sequenced(arrangement, placements.with(at, null)),
          move: { chip, from: position(at), kind: "returned" },
          ok: true,
        };
  }

  const into = positionOf(to);
  const occupant = into === undefined ? undefined : placements[into];

  if (into === undefined || occupant === undefined) {
    return refuse("unknown", chip, to);
  }

  if (into === at) {
    return putDown(arrangement, picked);
  }

  if (at === null && placements.includes(chip)) {
    return refuse("chipUsedUp", chip, null);
  }

  const left = at === null ? placements : placements.with(at, occupant);

  return {
    arrangement: sequenced(arrangement, left.with(into, chip)),
    move:
      occupant === null
        ? { chip, from, kind: "placed", target: position(into) }
        : {
            chip,
            from,
            kind: "swapped",
            other: occupant,
            otherTo: at === null ? bank : position(at),
            target: position(into),
          },
    ok: true,
  };
};

/**
 * Find why a box of the asked boxes may not hold the pair a step makes in it: the half beside the
 * one a chip enters holds the same chip, a `match-group` keeps the two apart, or another box
 * already pairs them, in either order.
 *
 * @param board The board.
 * @param asked The boxes the step asks for, before they close up.
 * @param half The half the chip enters, as it is named before the step.
 * @param chip The chip.
 * @returns The refusal, or undefined when the box holds no pair yet or a lawful one.
 */
const pairRefusal = (
  board: BoxesBoard,
  asked: Boxes,
  half: Half,
  chip: string,
): Refused | undefined => {
  const box = asked[half.box];
  const partner = holderOf(asked, besideOf(half));

  if (box === undefined || partner === undefined || partner === null) {
    return undefined;
  }

  if (partner === chip) {
    return refuse("selfPair", chip, half, partner);
  }

  if (!partnered(board, chip, partner)) {
    return refuse("notInGroup", chip, half, partner);
  }

  return asked.some((other, index) => index !== half.box && samePair(other, box))
    ? refuse("pairMade", chip, half, partner)
    : undefined;
};

/**
 * Put the held chip into a half the page shows, on a board of boxes: into an empty half the chip
 * goes in; into a full one the two trade places, the half's chip going where the held one came
 * from, the bank or its half. Every pair the step completes, the held chip's and a traded chip's,
 * must join two different chips within both `match-group`s, as no other box joins them. A box the
 * step empties closes up.
 *
 * @param arrangement The arrangement.
 * @param picked The chip held, from the bank or the half that holds it, with a use left.
 * @param to The half, not the one the chip came from.
 * @returns The step, or the refusal.
 */
const enterHalf = (arrangement: BoxesArrangement, picked: Picked, to: Half): Step => {
  const { chip, from } = picked;
  const boxes = arrangement.placements;
  const occupant = holderOf(boxes, to) ?? null;
  const shown = to.box === boxes.length ? [...boxes, emptyBox] : boxes;
  const asked = write(from.kind === "half" ? write(shown, from, occupant) : shown, to, chip);
  const refusal =
    pairRefusal(arrangement, asked, to, chip) ??
    (from.kind === "half" && occupant !== null
      ? pairRefusal(arrangement, asked, from, occupant)
      : undefined);

  if (refusal !== undefined) {
    return refusal;
  }

  const next = closeUp(asked);

  if (sameBoxes(next, boxes)) {
    return putDown(arrangement, picked);
  }

  const target = closedUp(asked, to);

  return {
    arrangement: boxed(arrangement, next),
    move:
      occupant === null
        ? { chip, from, kind: "placed", target }
        : {
            chip,
            from,
            kind: "swapped",
            other: occupant,
            otherTo: from.kind === "half" ? closedUp(asked, from) : bank,
            target,
          },
    ok: true,
  };
};

/**
 * Place the held chip on a board of boxes (see {@link place}): back into the bank, or into a half
 * the page shows (see {@link enterHalf}).
 *
 * @param arrangement The arrangement.
 * @param picked The chip held.
 * @param to A half the page shows, or the bank.
 * @returns The step, or the refusal.
 */
const placeInBoxes = (arrangement: BoxesArrangement, picked: Picked, to: Place): Step => {
  const { chip, from } = picked;
  const boxes = arrangement.placements;

  if (
    partnerRule(arrangement, chip) === undefined ||
    from.kind === "target" ||
    from.kind === "position" ||
    (from.kind === "half" && holderOf(boxes, from) !== chip)
  ) {
    return refuse("unknown", chip, spotOf(from));
  }

  if (to.kind === "bank") {
    return from.kind === "bank"
      ? putDown(arrangement, picked)
      : {
          arrangement: boxed(arrangement, closeUp(write(boxes, from, null))),
          move: { chip, from, kind: "returned" },
          ok: true,
        };
  }

  if (to.kind !== "half" || !offers(arrangement, to)) {
    return refuse("unknown", chip, to);
  }

  if (samePlace(to, from)) {
    return putDown(arrangement, picked);
  }

  if (from.kind === "bank" && usedUp(arrangement, chip)) {
    return refuse("chipUsedUp", chip, null);
  }

  return enterHalf(arrangement, picked, to);
};

/**
 * Pick up a chip on a board of boxes (see {@link pick}).
 *
 * @param arrangement The arrangement.
 * @param picked The chip to hold, and the bank or the half it is picked from.
 * @returns The chip held, or the refusal.
 */
const pickInBoxes = (arrangement: BoxesArrangement, picked: Picked): Picking => {
  const { chip, from } = picked;
  const boxes = arrangement.placements;

  if (partnerRule(arrangement, chip) === undefined) {
    return refuse("unknown", chip, spotOf(from));
  }

  if (from.kind !== "bank") {
    return from.kind === "half" && holderOf(boxes, from) === chip
      ? lifted(picked)
      : refuse("unknown", chip, from);
  }

  if (usedUp(arrangement, chip)) {
    return refuse("chipUsedUp", chip, null);
  }

  return reached(arrangement.total, boxes.length) &&
    shownBoxes(arrangement).every(
      (_, box) =>
        !placeInBoxes(arrangement, picked, { box, kind: "half", side: 0 }).ok &&
        !placeInBoxes(arrangement, picked, { box, kind: "half", side: 1 }).ok,
    )
    ? refuse("totalReached", chip, null)
    : lifted(picked);
};

/**
 * Place the held chip into a target, or back into the bank.
 *
 * - Back where it came from, nothing moves: the chip is put down.
 * - Into the bank, a placed chip leaves its target.
 * - Into a target with room, the chip goes in: from the bank as a new association, within the chip's
 *   `match-max` and `max-associations`; from a target as a move, which leaves both counts as they
 *   are.
 * - Into a full target that holds one chip, on a board that swaps, the two trade places: the occupant
 *   goes where the held chip came from, the bank or its target.
 * - Into any other full target, it is refused.
 * - On a sequence board, every position takes the chip: an empty one as a target with room, a filled
 *   one by a swap ({@link SequenceBoard}).
 * - A step that would leave every chip where it was, once the boxes close up, puts the chip down.
 *
 * A step that would pair a chip with a target outside either one's `match-group`, the held chip or
 * a swapped occupant, is refused. A step that would make a pair the target already holds is refused
 * unless the board repeats pairs. On a board of boxes the halves are the targets, each holding one
 * chip and trading places when full, and a step is refused that would pair a chip with itself, with
 * a chip outside either one's `match-group`, or as another box already pairs them. A step that goes
 * through leaves no chip held; a refused one leaves the chip held, so the child can choose again.
 *
 * @param arrangement The board and its placements.
 * @param picked The chip held, or `null` when none is.
 * @param to A target, a position, a half, or the bank.
 * @returns The next arrangement and what happened, or the refusal.
 */
export const place = (arrangement: Arrangement, picked: Picked | null, to: Place): Step => {
  if (picked === null) {
    return refuse("pickFirst", null, null);
  }

  if (arrangement.kind === "sequence") {
    return placeInSequence(arrangement, picked, to);
  }

  return arrangement.kind === "boxes"
    ? placeInBoxes(arrangement, picked, to)
    : placePair(arrangement, picked, to);
};

/**
 * Pick up a chip from the bank or from a target that holds it. Picking up replaces any chip already
 * held, which goes back where it was untouched.
 *
 * From the bank it is refused when the chip has no uses left, and when `max-associations` is
 * reached and no target would take the chip by a swap, so a child learns before choosing a target
 * that nothing can take it. On a board of boxes the total counts boxes, and a half with room in a
 * box short of a pair takes a chip at the total too.
 *
 * @param arrangement The board and its placements.
 * @param chip The chip to pick up.
 * @param from The place it sits in.
 * @returns The chip held, or the refusal.
 */
export const pick = (arrangement: Arrangement, chip: string, from: Place): Picking => {
  const picked: Picked = { chip, from };

  if (arrangement.kind === "sequence") {
    const at = from.kind === "bank" ? null : positionOf(from);

    if (!arrangement.chips.includes(chip) || at === undefined) {
      return refuse("unknown", chip, spotOf(from));
    }

    if (at !== null) {
      return arrangement.placements[at] === chip
        ? lifted(picked)
        : refuse("unknown", chip, spotOf(from));
    }

    return usedUp(arrangement, chip) ? refuse("chipUsedUp", chip, null) : lifted(picked);
  }

  if (arrangement.kind === "boxes") {
    return pickInBoxes(arrangement, picked);
  }

  if (chipRule(arrangement, chip) === undefined) {
    return refuse("unknown", chip, spotOf(from));
  }

  if (from.kind !== "bank") {
    return from.kind === "target" &&
      matching(arrangement.placements, { chip, target: from.id }).length > 0
      ? lifted(picked)
      : refuse("unknown", chip, from);
  }

  if (usedUp(arrangement, chip)) {
    return refuse("chipUsedUp", chip, null);
  }

  return reached(arrangement.total, arrangement.placements.length) &&
    arrangement.targets.every(
      (rule) => !placePair(arrangement, picked, { id: rule.id, kind: "target" }).ok,
    )
    ? refuse("totalReached", chip, null)
    : lifted(picked);
};

/**
 * Find why placing the held chip into a target or the bank would be refused, so a target can show
 * that it will not take the chip before the child tries.
 *
 * @param arrangement The board and its placements.
 * @param picked The chip held.
 * @param to A target, or the bank.
 * @returns The refusal, or undefined when the place would go through.
 */
export const refusalAt = (
  arrangement: Arrangement,
  picked: Picked,
  to: Place,
): Refusal | undefined => {
  const step = place(arrangement, picked, to);

  return step.ok ? undefined : step.refusal;
};
