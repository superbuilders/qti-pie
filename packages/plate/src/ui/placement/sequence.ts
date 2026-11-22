/**
 * A sequence board on the placement primitive, which Order and Graphic Order share: the child puts
 * each chip into the position it chooses, and the response is the chips in position order. The
 * machine (`#plate/ui/placement/machine.ts`, {@link SequenceBoard}) decides every move; this module
 * keeps the positions a child sees and the response they post in step.
 *
 * An ordered response is a list, so it holds no gap: "A then C" with position 2 empty is no answer
 * the response can give, and posting it would say C is second. The positions post their chips only
 * while they are filled from the first, with no empty one before a filled one, and at least as many
 * as the order requires: every position where the order asks for all its choices or for a
 * `min-choices` equal to its `max-choices`, so such an order posts once every position is filled
 * (Bjorn, 2026-11-15); else `min-choices`, so a shorter order still posts where QTI admits one. Any
 * other arrangement posts nothing, a NULL response, "the candidate has not offered a response" (QTI
 * 3.0 information model 5.115).
 *
 * @module
 */
import { useMemo, useState } from "react";
import type { Sequence, SequenceBoard } from "#plate/ui/placement/machine.ts";
import { listPlacements, listResponse } from "#plate/placement/order-list.ts";
import { useResponse } from "#plate/ui/responses.tsx";

/**
 * Lay a response out on the positions: its identifiers in the first positions, in order, and the
 * rest empty, as the server restores a response and as a host's change of it reads.
 *
 * @param texts The response's identifiers, in order.
 * @param positions How many positions the order shows.
 * @returns One occupant per position.
 */
const sequenceOf = (texts: readonly string[], positions: number): Sequence =>
  Array.from({ length: positions }, (_, index) => texts[index] ?? null);

/**
 * Give the response a sequence posts: its chips in position order, while they fill the positions
 * from the first with no empty one before a filled one and number at least `required`; else none.
 *
 * @param sequence The positions' occupants.
 * @param required How many positions the response must fill.
 * @returns The response's identifiers, or none.
 */
const responseOf = (sequence: Sequence, required: number): readonly string[] => {
  const chips = sequence.flatMap((occupant) => (occupant === null ? [] : [occupant]));

  return chips.length >= required && chips.every((chip, index) => sequence[index] === chip)
    ? chips
    : [];
};

/**
 * Give the positions an island shows for its response: the ones it last showed while they post
 * the response it holds, empty positions included, which no response holds; else the response's
 * own, as when the host restored another answer or set a refused save back.
 *
 * @param shown The positions the island last showed.
 * @param texts The response the island holds.
 * @param positions How many positions the order shows.
 * @param required How many positions the response must fill.
 * @returns `shown` itself, when it posts `texts`; else the response laid out.
 */
const keptSequence = (
  shown: Sequence,
  texts: readonly string[],
  positions: number,
  required: number,
): Sequence => {
  const posted = responseOf(shown, required);

  return posted.length === texts.length && posted.every((chip, index) => texts[index] === chip)
    ? shown
    : sequenceOf(texts, positions);
};

/**
 * What a `PlacementRoot` over a sequence board takes from {@link useSequence}: the board, the
 * positions it shows, and what to do with the positions a child's move asks for, which an island
 * also calls for a step of its own, as a tap on a Graphic Order's image is.
 */
export interface SequenceRoot {
  readonly board: SequenceBoard;
  readonly placements: Sequence;
  readonly onPlacementsChange: (next: Sequence) => void;
}

/**
 * Hold a sequence board bound to an ordered response in the item's `<Responses>`.
 *
 * The positions follow the response, and between moves also hold what no response holds: a chip
 * past an empty position, or fewer chips than the order requires. The island keeps the positions
 * it last showed while they post the response it holds, and follows the response wherever the
 * host changes it ({@link keptSequence}). A move that changes no response, as one that leaves a gap
 * or fills a position short of the required count does, writes nothing, so the host sees only a
 * change of the answer.
 *
 * @param name The entry name the response posts under.
 * @param chips The choices or hotspots a child orders, in the order the page shows them, each by
 *   its `identifier`.
 * @param positions How many positions the order shows.
 * @param required How many positions the response must fill before it posts: the order's
 *   `min-choices`, or every position where it has none.
 * @returns The root's options.
 */
export const useSequence = (
  name: string,
  chips: readonly { readonly identifier: string }[],
  positions: number,
  required: number,
): SequenceRoot => {
  const [texts, set] = useResponse(name);
  const [layout, setLayout] = useState(() => sequenceOf(texts, positions));
  const board = useMemo(
    (): SequenceBoard => ({ chips: chips.map(({ identifier }) => identifier), kind: "sequence" }),
    [chips],
  );
  const placements = useMemo(
    () => keptSequence(layout, texts, positions, required),
    [layout, positions, required, texts],
  );

  return {
    board,
    onPlacementsChange: (next) => {
      setLayout(next);

      if (keptSequence(next, texts, positions, required) !== next) {
        set(responseOf(next, required));
      }
    },
    placements,
  };
};

/**
 * Hold an order laid out as one numbered list (`plate-order-list`) on a sequence board bound to an
 * ordered response: one position per choice, each filled from the start, the choices in their
 * presented order until the child's first move or the response the host restored
 * ({@link listPlacements}); each move that reorders them posts the full order, and none other
 * posts anything ({@link listResponse}).
 *
 * @param name The entry name the response posts under.
 * @param chips The choices, in their presented order, each by its `identifier`.
 * @returns The root's options.
 */
export const useOrderList = (
  name: string,
  chips: readonly { readonly identifier: string }[],
): SequenceRoot => {
  const [texts, set] = useResponse(name);
  const presented = useMemo(() => chips.map(({ identifier }) => identifier), [chips]);
  const board = useMemo((): SequenceBoard => ({ chips: presented, kind: "sequence" }), [presented]);
  const placements = useMemo(() => listPlacements(texts, presented), [presented, texts]);

  return {
    board,
    onPlacementsChange: (next) => {
      const order = listResponse(next, placements);

      if (order !== undefined) {
        set(order);
      }
    },
    placements,
  };
};
