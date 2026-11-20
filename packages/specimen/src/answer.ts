/**
 * The child's response a case draws, and what a kind answers it with.
 *
 * @module
 */
import type { Array as Arr } from "effect";
import { dimension } from "#specimen/dimension.ts";

/**
 * The child's response, as a case names it: every part right, some, every part wrong, or none
 * given. A kind admits the ones its settings can give: a single pick has no `partial`, an End
 * Attempt no `wrong`.
 */
export const answer = dimension("The child's response", [
  ["right", "Right", "right"],
  ["partial", "Partly right", "partial"],
  ["wrong", "Wrong", "wrong"],
  ["empty", "Empty", "empty"],
]);

/**
 * One of the child's responses.
 */
export type Answer = (typeof answer.values)[number]["value"];

/**
 * What a form posts for a response, before an instance names it: each entry's response identifier
 * and its text, in the order the form posts them. A response with no entry posts nothing, which a
 * form decodes as plate's interaction module says (NULL, or its absent value).
 */
export type Posted = readonly (readonly [response: string, text: string])[];

/**
 * One response a kind's settings admit: which it is, what the form posts for it, and the `SCORE`
 * the item's processing gives it.
 */
export interface Answered {
  readonly answer: Answer;
  readonly posted: Posted;
  readonly score: number;
}

/**
 * Every response a kind's settings admit, each once.
 */
export type Answers = Arr.NonEmptyReadonlyArray<Answered>;
