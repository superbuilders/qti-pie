/**
 * The words a review's marked part says for a screen reader, which the stylesheet hides from the
 * eye where the part's glyph says the same: {@link Words}, the one vocabulary of them, and
 * {@link markPart}, the one part that writes them.
 *
 * @module
 */
import type { ReactNode } from "react";
import { messageText } from "#plate/messages.ts";
import type { Locale, MessageKey } from "#plate/messages.ts";
import type { AnswerMark } from "#plate/ui/item/interactions/marks.ts";

/**
 * The catalog's message of each thing a marked part says: `correct`, "Right answer", on a right
 * answer the candidate did not give, a chip in its right place among them, and on each picked part
 * of a solution; `given`, "Your answer", on a picked part of a review with nothing to mark it
 * against, which only its look says is picked; `missing`, "Missing", on a chip the candidate left
 * in the bank that a review shows in its right place; `right` and `wrong`, "Your answer, right" and
 * "Your answer, wrong", on an answer the candidate gave.
 */
const wordKeys = {
  correct: "markMissed",
  given: "markGiven",
  missing: "markMissing",
  right: "markRight",
  wrong: "markWrong",
} as const satisfies Readonly<Record<string, MessageKey>>;

/**
 * What a review's part says beyond what it shows: one of {@link wordKeys}'s, or `silent`, for a
 * part that says nothing more.
 */
export type Words = keyof typeof wordKeys | "silent";

/**
 * The words of each mark a review writes on an answer: a part of the correct response the
 * candidate did not give says it is the right answer.
 */
const markWords = {
  missed: "correct",
  right: "right",
  wrong: "wrong",
} as const satisfies Readonly<Record<AnswerMark, Words>>;

/**
 * Give the words of the mark a review writes on an answer, and `silent` for an answer it marks
 * with nothing, as where it has no correct response to mark against.
 *
 * @param mark The mark, none for an answer the review leaves unmarked.
 * @returns Its words.
 */
export const wordsOfMark = (mark: AnswerMark | undefined): Words =>
  mark === undefined ? "silent" : markWords[mark];

/**
 * Write what a part says for a screen reader, which the stylesheet hides from the eye.
 *
 * @param words What the part says.
 * @param locale The locale of plate's own text.
 * @returns The `plate-mark` part, or nothing for a part that is `silent`.
 */
export const markPart = (words: Words, locale: Locale): ReactNode =>
  words === "silent" ? null : (
    <span data-slot="plate-mark">{messageText(locale, wordKeys[words])}</span>
  );
