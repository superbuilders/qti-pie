/**
 * A review's marks on a picks group's options, a Choice's choices, a Hot Text's hottexts and a
 * Hotspot's areas, written once for the three: each option is one {@link PickReview}, read from the
 * identifiers the review shows picked and the marks the host handed ({@link Marking}), and each
 * review writes the attributes and words {@link pickParts} gives it. Safe to import on the server.
 *
 * A picks group's response never repeats an identifier (the QTI database's admission refuses a
 * repeat), so each option carries at most one handed mark: `right` or `wrong` on a picked one,
 * `missed` on one the candidate did not pick that the correct response holds.
 *
 * @module
 */
import { format } from "#plate/model/values.ts";
import { valuesMarked } from "#plate/ui/item/interactions/marks.ts";
import type { AnswerMark, Marking } from "#plate/ui/item/interactions/marks.ts";
import type { Words } from "#plate/ui/item/interactions/words.tsx";

/**
 * How a review shows one option of a picks group:
 *
 * - `unpicked`: not picked, and nothing marks it;
 * - `given`: picked, in a review with nothing to mark against, where only its look says so;
 * - `correct`: picked, in a solution, whose picks are the correct response;
 * - `right` and `wrong`: picked, and handed that mark;
 * - `missed`: not picked, and handed `missed`, which a review that shows the solution alone is.
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
 * @param marking The marks the host handed for the response.
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
    case "marked": {
      const handed = (mark: AnswerMark): ReadonlySet<string> =>
        new Set(valuesMarked(marking, mark).map(format));
      const right = handed("right");
      const wrong = handed("wrong");
      const missed = handed("missed");

      return (identifier) => {
        if (shown.has(identifier)) {
          if (right.has(identifier)) {
            return "right";
          }

          return wrong.has(identifier) ? "wrong" : "given";
        }

        return missed.has(identifier) ? "missed" : "unpicked";
      };
    }
  }
};
