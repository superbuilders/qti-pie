/**
 * The chips a placement interaction's review shows, Match's, Gap Match's, Order's and the graphic
 * placements': each chip as a review shows it in a target, with its mark, and in the bank, a chip
 * the review shows missing where it belongs saying so where the child left it, and the pairs a
 * response gives laid out by target. Plain server markup, with the islands' `data-slot` names.
 *
 * @module
 */
import type { ReactNode } from "react";
import { pairsOf, pairText } from "#plate/interactions/pair.ts";
import type { Pair } from "#plate/interactions/pair.ts";
import type { Locale } from "#plate/messages.ts";
import { flag } from "#plate/ui/attributes.ts";
import { bagMarks, missedShown } from "#plate/ui/item/interactions/marks.ts";
import type { AnswerMark, Marking } from "#plate/ui/item/interactions/marks.ts";
import { markPart, wordsOfMark } from "#plate/ui/item/interactions/words.tsx";

/**
 * One chip as a review shows it in a target: the choice, and its mark, none where the review marks
 * nothing.
 */
export interface Shown {
  readonly identifier: string;
  readonly mark: AnswerMark | undefined;
}

/**
 * Render a chip in a review: the choice's content in a `span`, which no press moves, with its mark
 * and the mark's words, every kind's ({@link wordsOfMark}). A `missed` chip stands where the
 * correct response puts it and says "Right answer", never "Missing": "missed" means only that the
 * candidate did not give this pair or this position, and a candidate who placed the chip elsewhere,
 * as every wrong Order does, did not leave it out. A chip the candidate truly left out says so in
 * the bank ({@link bankChipPart}).
 *
 * @param content The choice's content, written.
 * @param mark The chip's mark, none for one the review does not mark.
 * @param key Its key among its siblings.
 * @param locale The locale of plate's own text.
 * @returns The `plate-placement-chip` part.
 */
export const chipPart = (
  content: ReactNode,
  mark: AnswerMark | undefined,
  key: string,
  locale: Locale,
): ReactNode => (
  <span key={key} data-mark={mark} data-slot="plate-placement-chip">
    {content}
    {markPart(wordsOfMark(mark), locale)}
  </span>
);

/**
 * Tell whether a choice has no uses left once placed so often, as the island's bank shows a chip
 * used up: its `match-max` reached, 0 being no limit.
 *
 * @param matchMax The choice's `match-max`.
 * @param uses How often it is placed, as `countsOf` in `#plate/interactions/counts.ts` counts it.
 * @returns Whether it is used up.
 */
export const usedUp = (matchMax: bigint, uses: bigint): boolean =>
  matchMax !== 0n && uses >= matchMax;

/**
 * One chip as a review shows it in the bank: `copies` while its `match-max` is 0 or above 1, as the
 * island's bank shows a stack, and where it stands. A `rest` chip has a use left; a `left` one has
 * a use left while the review shows it missing where it belongs, so it says so where the candidate
 * left it; a `used` one has no use left, a placeholder, and a chip that is used up says nothing of
 * being missed.
 */
export interface Banked {
  readonly copies: boolean;
  readonly state: "left" | "rest" | "used";
}

/**
 * Give a choice's chip as a review's bank shows it.
 *
 * @param matchMax The choice's `match-max`, 0 being no limit.
 * @param uses How often the response places it, as `countsOf` in `#plate/interactions/counts.ts`
 *   counts it.
 * @param missed Whether the review shows it in a place the candidate did not put it
 *   ({@link missedOf}).
 * @returns The chip.
 */
export const bankedOf = (matchMax: bigint, uses: bigint, missed: boolean): Banked => {
  const copies = matchMax !== 1n;

  if (usedUp(matchMax, uses)) {
    return { copies, state: "used" };
  }

  return { copies, state: missed ? "left" : "rest" };
};

/**
 * Render a chip in a review's bank: the choice's content in a `span`, which no press moves, with
 * `data-copies` for a chip with copies and `data-used` for one used up. A `left` chip says so
 * (`data-missed`, and the mark's words), so the candidate finds the chip they left behind.
 *
 * @param content The choice's content, written.
 * @param chip The chip, as the bank shows it.
 * @param key Its key among its siblings.
 * @param locale The locale of plate's own text.
 * @returns The `plate-placement-chip` part.
 */
export const bankChipPart = (
  content: ReactNode,
  chip: Banked,
  key: string,
  locale: Locale,
): ReactNode => (
  <span
    key={key}
    data-copies={flag(chip.copies)}
    data-missed={flag(chip.state === "left")}
    data-slot="plate-placement-chip"
    data-used={flag(chip.state === "used")}
  >
    {content}
    {markPart(chip.state === "left" ? "missing" : "silent", locale)}
  </span>
);

/**
 * Give the choices a review shows in a place the candidate did not put them.
 *
 * @param byTarget Each target's chips ({@link pairsByTarget}).
 * @returns The identifiers of the choices of its missed chips.
 */
export const missedOf = (byTarget: ReadonlyMap<string, readonly Shown[]>): ReadonlySet<string> =>
  new Set(
    [...byTarget.values()].flatMap((chips) =>
      chips.filter((chip) => chip.mark === "missed").map((chip) => chip.identifier),
    ),
  );

/**
 * Lay a bag of pairs out as a review marks it: against the correct response, each pair given with
 * its mark, right while the correct bag holds a copy of it, as `qti-match` compares a `multiple`
 * response of `directedPair`s, then each correct pair no answer gave, missed; with nothing to mark
 * against, each pair given, unmarked.
 *
 * @param given The pairs given.
 * @param marking How the review marks the response.
 * @returns Each pair shown, with its mark where the review marks one.
 */
const markedPairs = (
  given: readonly Pair[],
  marking: Marking,
): readonly (readonly [Pair, AnswerMark | undefined])[] => {
  if (marking.kind !== "against") {
    return given.map((pair) => [pair, undefined]);
  }

  const marks = bagMarks(given, pairsOf(marking.correct.values), pairText);

  return [
    ...given.map((pair, index): readonly [Pair, AnswerMark | undefined] => [
      pair,
      marks.given[index],
    ]),
    ...missedShown(marking, marks.missed).map((pair): readonly [Pair, AnswerMark] => [
      pair,
      "missed",
    ]),
  ];
};

/**
 * Lay a bag of pairs out by target, as a review shows them: each pair given in its target, in the
 * order given, with its mark when the review marks, then each correct pair missed in its target
 * ({@link markedPairs}).
 *
 * @param given The pairs given.
 * @param marking How the review marks the response.
 * @returns Each target's chips, by the target's identifier.
 */
export const pairsByTarget = (
  given: readonly Pair[],
  marking: Marking,
): ReadonlyMap<string, readonly Shown[]> => {
  const byTarget = new Map<string, Shown[]>();

  for (const [{ chip, target }, mark] of markedPairs(given, marking)) {
    const chips = byTarget.get(target) ?? [];

    chips.push({ identifier: chip, mark });
    byTarget.set(target, chips);
  }

  return byTarget;
};
