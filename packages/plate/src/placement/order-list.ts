/**
 * An order laid out as one numbered list (`plate-order-list`, plate's renderer vocabulary in
 * `#plate/vocabulary.ts`), as AlphaTest's player laid out every order: the choices stand in their
 * presented order from the start, one to a position, and the child reorders them in place, each
 * move a swap on the sequence board (Bjorn's board rule, 2026-11-15: a swap, never a shift). The
 * presented order is no answer, so the response stays NULL, "the candidate has not offered a
 * response" (QTI 3.0 information model 5.115), until the child's first move; from then on every
 * move posts the full order, so a child who leaves the question with the list half sorted keeps the
 * order they made, which the response's per-position grading reads.
 *
 * The rules are pure functions of the response and the move, which the island's hook
 * (`useOrderList` in `#plate/ui/placement/sequence.ts`) calls.
 *
 * @module
 */
import type { Sequence } from "#plate/ui/placement/machine.ts";

/**
 * Give the positions a list shows: the response's order where it holds every choice, as when the
 * child has moved one or the host restored their order; else the presented order.
 *
 * @param texts The response the island holds, in order.
 * @param presented The choices' identifiers in their presented order.
 * @returns One choice per position.
 */
export const listPlacements = (
  texts: readonly string[],
  presented: readonly string[],
): readonly string[] =>
  texts.length === presented.length && presented.every((chip) => texts.includes(chip))
    ? texts
    : presented;

/**
 * Give the response a move on a list posts: the full order it leaves, where it leaves every
 * position filled and differs from the order shown; none for a move that leaves a gap, which a
 * list never shows, or that changes nothing.
 *
 * @param next The positions the move asks for.
 * @param shown The positions the list shows.
 * @returns The order to post, none when the move posts nothing.
 */
export const listResponse = (
  next: Sequence,
  shown: readonly string[],
): readonly string[] | undefined => {
  const chips = next.flatMap((occupant) => (occupant === null ? [] : [occupant]));

  return chips.length === shown.length && chips.some((chip, index) => chip !== shown[index])
    ? chips
    : undefined;
};
