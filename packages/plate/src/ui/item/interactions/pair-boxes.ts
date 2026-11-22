/**
 * A review's boxes of pairs, Associate's and Graphic Associate's: the pairs a payload shows, each a
 * box, with the mark the host handed its value, a pair "undirected so (A,B) and (B,A) are
 * equivalent" (QTI 3.0 information model 8.13), then each correct pair handed missed. Server only:
 * it reads the review's marks (`#plate/ui/item/interactions/marks.ts`).
 *
 * @module
 */
import { unorderedKey, unorderedPairsOf } from "#plate/interactions/pair.ts";
import type { UnorderedPair } from "#plate/interactions/pair.ts";
import { bagMarks } from "#plate/ui/item/interactions/marks.ts";
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
 * Lay out the boxes a review shows: each pair given, in the order given, with the mark handed its
 * value when the review marks, then each correct pair handed `missed`. The marks are laid on a
 * bag's copies keyed by {@link unorderedKey}, so a pair given in either order is one value.
 *
 * @param given The pairs given.
 * @param marking The marks handed for the response.
 * @returns The boxes.
 */
export const boxesShown = (
  given: readonly UnorderedPair[],
  marking: Marking,
): readonly ShownBox[] => {
  if (marking.kind !== "marked") {
    return given.map((pair) => ({ mark: undefined, pair }));
  }

  const marks = bagMarks(given, marking, unorderedPairsOf, unorderedKey);

  return [
    ...given.map((pair, index): ShownBox => ({ mark: marks.given[index], pair })),
    ...marks.missed.map((pair): ShownBox => ({ mark: "missed", pair })),
  ];
};
