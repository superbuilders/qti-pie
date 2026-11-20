/**
 * A review's boxes of pairs, Associate's and Graphic Associate's: the pairs a payload shows, each a
 * box, marked as `qti-match` compares a bag of unordered pairs (QTI 3.0 information model 6.9.25),
 * a pair "undirected so (A,B) and (B,A) are equivalent" (8.13), then each correct pair no box gave,
 * missed. Server only: it reads the review's marks (`#plate/ui/item/interactions/marks.ts`).
 *
 * @module
 */
import { unorderedKey, unorderedPairsOf } from "#plate/interactions/pair.ts";
import type { UnorderedPair } from "#plate/interactions/pair.ts";
import { bagMarks, missedShown } from "#plate/ui/item/interactions/marks.ts";
import type { AnswerMark, Marking } from "#plate/ui/item/interactions/marks.ts";

/**
 * One box a review shows: the pair's two choices or hotspots as the response wrote them, and its
 * mark, none where the review marks nothing.
 */
export interface ShownBox {
  readonly pair: UnorderedPair;
  readonly mark: AnswerMark | undefined;
}

/**
 * Lay out the boxes a review shows: each pair given, in the order given, with its mark when the
 * review marks, then each correct pair no box gave, `missed`, as the correct response writes it.
 * The marks are a bag's, keyed by {@link unorderedKey}, so a pair given in either order is the
 * correct one.
 *
 * @param given The pairs given.
 * @param marking How the review marks the response.
 * @returns The boxes.
 */
export const boxesShown = (
  given: readonly UnorderedPair[],
  marking: Marking,
): readonly ShownBox[] => {
  if (marking.kind !== "against") {
    return given.map((pair) => ({ mark: undefined, pair }));
  }

  const marks = bagMarks(given, unorderedPairsOf(marking.correct.values), unorderedKey);

  return [
    ...given.map((pair, index): ShownBox => ({ mark: marks.given[index], pair })),
    ...missedShown(marking, marks.missed).map((pair): ShownBox => ({ mark: "missed", pair })),
  ];
};
