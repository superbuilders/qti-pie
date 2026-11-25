/**
 * The child's response a case draws, and what a kind answers it with.
 *
 * @module
 */
import type { Responses } from "@qti-pie/plate";
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
 * One response a kind's settings admit: which it is, what the child gave, and the `SCORE` the
 * item's processing gives it.
 */
export interface Answered {
  readonly answer: Answer;
  /**
   * What the child gave the item, typed as plate holds it: each response the child gave a value, by
   * its identifier, the value in the cardinality and base type the kind's item declares. A response
   * the child left untouched is absent: a host lays these over the attempt's start (plate's
   * `startingResponses`), where it holds NULL, or its interaction's own start, End Attempt's
   * `false`.
   */
  readonly posted: Responses;
  readonly score: number;
}

/**
 * Every response a kind's settings admit, each once.
 */
export type Answers = Arr.NonEmptyReadonlyArray<Answered>;
