/**
 * A review's marks on a picks group's options, a Choice's choices, a Hot Text's hottexts and a
 * Hotspot's areas, written once for the three: each option is one {@link PickReview}, read from the
 * identifiers the review shows picked and the review's {@link Marking}, and each review writes the
 * attributes and words {@link pickParts} gives it. Safe to import on the server.
 *
 * A picks group's response never repeats an identifier (`validatePicks` refuses a repeat), so the
 * picks are a set: a picked option is right when the correct response holds it, as `qti-match`
 * compares a bag that holds no repeat (QTI 3.0 information model 6.9.25).
 *
 * @module
 */
import { format } from "#plate/model/values.ts";
import { missedShown } from "#plate/ui/item/interactions/marks.ts";
import type { AnswerMark, Marking } from "#plate/ui/item/interactions/marks.ts";
import type { Words } from "#plate/ui/item/interactions/words.tsx";

/**
 * How a review shows one option of a picks group:
 *
 * - `unpicked`: not picked, and nothing marks it;
 * - `given`: picked, in a review with nothing to mark against, where only its look says so;
 * - `correct`: picked, in a solution, whose picks are the correct response;
 * - `right` and `wrong`: picked, and the correct response holds it, or does not;
 * - `missed`: not picked, and the correct response holds it, in a review that shows the solution
 *   (`missedShown` in `#plate/ui/item/interactions/marks.ts`).
 */
export type PickReview = "correct" | "given" | "missed" | "right" | "unpicked" | "wrong";

/**
 * The attributes an option a review shows writes: `data-mark` where the review marks it, and
 * `data-selected` while it is picked, in that order, each absent otherwise.
 */
interface PickAttributes {
  readonly "data-mark"?: AnswerMark;
  readonly "data-selected"?: "";
}

/**
 * Each {@link PickReview}'s attributes, and the words its `plate-mark` part holds for a screen
 * reader, where the eye reads the option's look.
 */
export const pickParts = {
  correct: { attributes: { "data-selected": "" }, words: "correct" },
  given: { attributes: { "data-selected": "" }, words: "given" },
  missed: { attributes: { "data-mark": "missed" }, words: "correct" },
  right: { attributes: { "data-mark": "right", "data-selected": "" }, words: "right" },
  unpicked: { attributes: {}, words: "silent" },
  wrong: { attributes: { "data-mark": "wrong", "data-selected": "" }, words: "wrong" },
} as const satisfies Readonly<
  Record<PickReview, { readonly attributes: PickAttributes; readonly words: Words }>
>;

/**
 * Give how a review shows each option of a picks group.
 *
 * @param picked The identifiers the review shows picked: the candidate's in a review, the correct
 *   ones in a solution.
 * @param marking What the review marks the picks against.
 * @returns How the review shows the option of each identifier.
 */
export const marksOf = (
  picked: readonly string[],
  marking: Marking,
): ((identifier: string) => PickReview) => {
  const shown = new Set(picked);

  switch (marking.kind) {
    case "unmarked": {
      return (identifier) => (shown.has(identifier) ? "given" : "unpicked");
    }
    case "solution": {
      return (identifier) => (shown.has(identifier) ? "correct" : "unpicked");
    }
    case "against": {
      const values = marking.correct.values.map(format);
      const correct = new Set(values);
      const missed = new Set(missedShown(marking, values));

      return (identifier) => {
        if (shown.has(identifier)) {
          return correct.has(identifier) ? "right" : "wrong";
        }

        return missed.has(identifier) ? "missed" : "unpicked";
      };
    }
    default: {
      return marking satisfies never;
    }
  }
};
