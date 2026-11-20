/**
 * A review's marks on every interaction's answers ({@link AnswerMark}): `right` on an answer the
 * candidate gave that the correct response holds, `wrong` on one it does not hold, and `missed` on
 * a part of the correct response the candidate did not give. An answer is right when it matches
 * the correct response as `qti-match` compares them (QTI 3.0 information model 6.9.25): a
 * `multiple` response as a bag, so a pair is right while the correct bag still holds a copy of it,
 * an unordered `pair` in either order, and an `ordered` one as a sequence, so a choice is right in
 * the position the correct sequence gives it.
 *
 * The shell marks, and the core does not: the core redacts no correct response, and `<Item>` hands
 * the host's solution to a `review` alone ({@link ReviewContext.shows}), the one gate; each
 * response's {@link Marking} reads it.
 *
 * @module
 */
import { Option } from "effect";
import { countsOf } from "#plate/interactions/counts.ts";
import { format, isNull, isRecordValue } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";
import type { Reveals, ReviewContext } from "#plate/ui/item/context.ts";

/**
 * A mark a `review` writes on an answer against the item's correct response, which the host passes
 * as `<Item>`'s `solution`: `right` on an answer the candidate gave that the correct response
 * holds, `wrong` on one it does not hold, and `missed` on a part of the correct response the
 * candidate did not give.
 *
 * An answer is right when it matches the correct response as `qti-match` compares them, not when
 * it scored: an item whose `qti-mapping` credits other answers than its correct response still
 * marks those `wrong`.
 */
export type AnswerMark = "missed" | "right" | "wrong";

/**
 * How a review marks one response's answers, which its parts' words and marks are read from:
 * `against`, the candidate's answers marked against `correct`, the correct response the host
 * handed for the response, showing of it what `reveals` says; `unmarked`, the candidate's answers
 * with nothing to mark them against, since the host handed none, or one `qti-match` does not
 * compare (a record) or nothing matches (NULL); `solution`, the correct responses, which a solution
 * shows and marks nothing on.
 */
export type Marking =
  | { readonly correct: Value; readonly kind: "against"; readonly reveals: Reveals }
  | { readonly kind: "solution" }
  | { readonly kind: "unmarked" };

/**
 * Give how a review marks one response's answers, from what the render shows
 * (`ReviewContext.shows`).
 *
 * @param response The response identifier.
 * @param context What the shell knows: what the render shows.
 * @returns The marking.
 */
export const markingOf = (response: string, context: Pick<ReviewContext, "shows">): Marking => {
  if (context.shows.kind === "solution") {
    return { kind: "solution" };
  }

  const correct = context.shows.against.get(response);

  return correct === undefined || isRecordValue(correct) || isNull(correct)
    ? { kind: "unmarked" }
    : { correct, kind: "against", reveals: context.shows.reveals };
};

/**
 * Give the parts of the correct response a review marks `missed`: every one the candidate did not
 * give where it shows the solution, and none where it marks the candidate's own answers alone,
 * which never reveals a correct response they did not give ({@link Reveals}).
 *
 * @template T A part, as the review holds it.
 * @param marking How the review marks the response, against its correct response.
 * @param missed The parts of the correct response the candidate did not give.
 * @returns The parts the review marks missed.
 */
export const missedShown = <T>(
  marking: Extract<Marking, { readonly kind: "against" }>,
  missed: readonly T[],
): readonly T[] => (marking.reveals === "solution" ? missed : []);

/**
 * The marks of a bag's answers, and the parts of the correct bag none of them gave.
 *
 * @template T An answer, as the bag holds it.
 */
interface BagMarks<T> {
  /**
   * The mark of each answer given, in the order given.
   */
  readonly given: readonly Exclude<AnswerMark, "missed">[];
  /**
   * The correct values no answer matched, in the correct response's order, each as often as the
   * bag holds it beyond the answers that matched it.
   */
  readonly missed: readonly T[];
}

/**
 * Mark a bag's answers against the correct bag: an answer is right while the correct bag holds a
 * copy of it no earlier answer took, else wrong, and every copy left over is missed. Two answers
 * are the same answer when they have the same key, as a `pair` in either order is one pair.
 *
 * @template T An answer, as the bag holds it.
 * @param given The answers given.
 * @param correct The correct bag.
 * @param key The text two answers share exactly when they are the same answer.
 * @returns The marks, and the missed answers of the correct bag as it holds them.
 */
export const bagMarks = <T>(
  given: readonly T[],
  correct: readonly T[],
  key: (answer: T) => string,
): BagMarks<T> => {
  const left = new Map(countsOf(correct.map(key)));
  const take = (answer: T): boolean => {
    const copies = left.get(key(answer)) ?? 0n;

    if (copies === 0n) {
      return false;
    }

    left.set(key(answer), copies - 1n);

    return true;
  };

  return {
    given: given.map((answer): Exclude<AnswerMark, "missed"> => (take(answer) ? "right" : "wrong")),
    missed: correct.filter(take),
  };
};

/**
 * The mark of an answer a review shows in one position of a sequence: none where the review marks
 * nothing; `right` where the correct sequence holds it there; `wrong` where it does not, with the
 * correct value of the position, none where the correct sequence ends before it.
 */
type SlotMark =
  | { readonly kind: "right" }
  | { readonly kind: "unmarked" }
  | { readonly kind: "wrong"; readonly missed: Option.Option<string> };

/**
 * One position of a sequence as a review shows it, Order's and Graphic Order's: `empty`, no answer
 * and nothing missed there; `given`, the answer given there with its mark; `missed-only`, no
 * answer, where the correct sequence holds `chip`.
 */
export type Slot =
  | { readonly chip: string; readonly kind: "given"; readonly mark: SlotMark }
  | { readonly chip: string; readonly kind: "missed-only" }
  | { readonly kind: "empty" };

/**
 * Lay a sequence's answers out by position, as a review shows them: against the correct sequence,
 * each answer right where the correct sequence holds the same value, else wrong, and, where the
 * review shows the solution ({@link missedShown}), the correct value of a position whose answer is
 * not right, or that has none, missed there; with nothing to mark against, each answer unmarked.
 * Every position past these is empty.
 *
 * @param given The answers given, in order, as lexical forms.
 * @param marking How the review marks the response.
 * @param positions How many positions the interaction shows.
 * @returns One slot per position, as many as the most of `positions`, the answers given and the
 *   correct sequence the review shows.
 */
export const slotsOf = (
  given: readonly string[],
  marking: Marking,
  positions: number,
): readonly Slot[] => {
  if (marking.kind !== "against") {
    return Array.from({ length: Math.max(positions, given.length) }, (_, index): Slot => {
      const chip = given[index];

      return chip === undefined
        ? { kind: "empty" }
        : { chip, kind: "given", mark: { kind: "unmarked" } };
    });
  }

  const correct = marking.correct.values.map(format);
  const shown = missedShown(marking, correct);

  return Array.from(
    { length: Math.max(positions, given.length, shown.length) },
    (_, index): Slot => {
      const chip = given[index];
      const missed = Option.fromUndefinedOr(shown[index]);

      if (chip === undefined) {
        return Option.match(missed, {
          onNone: (): Slot => ({ kind: "empty" }),
          onSome: (right): Slot => ({ chip: right, kind: "missed-only" }),
        });
      }

      return chip === correct[index]
        ? { chip, kind: "given", mark: { kind: "right" } }
        : { chip, kind: "given", mark: { kind: "wrong", missed } };
    },
  );
};
