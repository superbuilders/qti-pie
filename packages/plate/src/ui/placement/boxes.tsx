"use client";

/**
 * A board of boxes on the placement primitive, which Associate and Graphic Associate share: the
 * child makes each `pair` of the response in a box of two halves, a chip in each, and a box whose
 * halves both hold a chip is one pair of the response. The machine
 * (`#plate/ui/placement/machine.ts`, {@link BoxesBoard}) holds QTI's limits and plate's rulings, and
 * the primitive refuses a move before anything changes and announces every step, a pair made
 * included; this module keeps the boxes a child sees and the response they post in step, and
 * renders the boxes.
 *
 * An island holds the board with {@link usePairBoxes} and composes the rest inside a
 * `PlacementRoot` (`#plate/ui/placement/parts.tsx`): its own bank of chips, which is Associate's
 * choices and Graphic Associate's hotspots, the message part, and {@link PairBoxes}.
 *
 * @module
 */
import { useMemo, useState } from "react";
import { flag } from "#plate/ui/attributes.ts";
import type { Limit } from "#plate/ui/limit.ts";
import {
  boxesOf,
  halfName,
  keptBoxes,
  pairTextsOf,
  partnerRuleOf,
} from "#plate/ui/placement/associable.ts";
import type { Associable, AssociableChoice } from "#plate/ui/placement/associable.ts";
import type { BoxLabels } from "#plate/ui/placement/labels.ts";
import { shownBoxes } from "#plate/ui/placement/machine.ts";
import type { Boxes, BoxesBoard, Half } from "#plate/ui/placement/machine.ts";
import { PlacementChip, PlacementSlot, PlacementTarget } from "#plate/ui/placement/parts.tsx";
import { useResponse } from "#plate/ui/responses.tsx";

/**
 * What a `PlacementRoot` over a board of boxes takes from {@link usePairBoxes}: the board, the
 * boxes it shows, and what to do with the boxes a child's move asks for.
 */
export interface PairBoxesRoot {
  readonly board: BoxesBoard;
  readonly placements: Boxes;
  readonly onPlacementsChange: (next: Boxes) => void;
}

/**
 * A board of boxes as an island holds it: the root's options, and the boxes the page shows, the
 * empty box a new pair begins in last when there is one, which {@link PairBoxes} renders.
 */
export interface PairBoxesBoard {
  readonly root: PairBoxesRoot;
  readonly shown: Boxes;
}

/**
 * Hold a board of boxes bound to a response of `pair`s in the item's `<Responses>`.
 *
 * The boxes are the response's pairs, and between moves also a box holding one chip, which no
 * response holds: the island keeps the boxes it last showed while they post the response it holds,
 * and follows the response wherever the host changes it (`keptBoxes`). A move that changes no pair,
 * such as a chip put in an empty box or moved between a box's halves, writes nothing, so the host
 * sees only a change of the answer. A box naming a chip the board lacks, as a stored pair can name
 * a choice the item no longer shows, is not shown, and the next move drops it from the response.
 *
 * @param name The entry name the response posts under.
 * @param chips The choices or hotspots a child pairs, in the order the page shows them, each by its
 *   `identifier`, `match-group` and `match-max`.
 * @param total `max-associations`: how many pairs the response may hold.
 * @returns The board, for a `PlacementRoot` and {@link PairBoxes}.
 */
export const usePairBoxes = (
  name: string,
  chips: readonly Associable[],
  total: Limit,
): PairBoxesBoard => {
  const [texts, set] = useResponse(name);
  const [layout, setLayout] = useState(() => boxesOf(texts));
  const board = useMemo(
    (): BoxesBoard => ({ chips: chips.map(partnerRuleOf), kind: "boxes", total }),
    [chips, total],
  );
  const placements = useMemo(() => {
    const known = new Set(chips.map((chip) => chip.identifier));

    return keptBoxes(layout, texts).filter((box) =>
      box.every((chip) => chip === null || known.has(chip)),
    );
  }, [chips, layout, texts]);

  return {
    root: {
      board,
      onPlacementsChange: (next) => {
        setLayout(next);

        if (keptBoxes(next, texts) !== next) {
          set(pairTextsOf(next));
        }
      },
      placements,
    },
    shown: shownBoxes({ ...board, placements }),
  };
};

/**
 * Name both halves of a box, as spots of the board.
 *
 * @param box The box's index from 0, among the boxes the page shows.
 * @returns Its two halves.
 */
const halvesOf = (box: number): readonly [Half, Half] => [
  { box, kind: "half", side: 0 },
  { box, kind: "half", side: 1 },
];

/**
 * The focus handlers an island gives a placed chip ({@link PairBoxesProps.chipProps}): what it does
 * when the chip takes focus, given the chip's element as far as a handler reads it, whether it
 * `matches` a selector such as `:focus-visible`, and when the chip loses focus.
 */
export interface ChipFocusProps {
  readonly onBlur: () => void;
  readonly onFocus: (event: {
    readonly currentTarget: { readonly matches: (selectors: string) => boolean };
  }) => void;
}

/**
 * What {@link PairBoxes} renders.
 */
export interface PairBoxesProps {
  /**
   * The boxes the page shows, {@link usePairBoxes}' `shown`.
   */
  readonly boxes: Boxes;
  /**
   * The chips, each as a placed chip shows it: its content, and its `label` where the content shows
   * no text.
   */
  readonly chips: readonly AssociableChoice[];
  /**
   * Give the focus handlers of a placed chip, by its identifier: the island's own, which a placed
   * chip carries as its bank chip does, so a graphic island marks the chip's area on its image
   * while the chip has keyboard focus (WCAG 2.4.7, 1.3.1). None where the island has none.
   *
   * @param chip The placed chip's identifier.
   * @returns Its `onFocus` and `onBlur`.
   */
  readonly chipProps?: (chip: string) => ChipFocusProps;
  /**
   * The words of the boxes: `boxFirst` and `boxSecond`, the names of a box's halves, `{n}` its
   * number from 1.
   */
  readonly labels: Pick<BoxLabels, "boxFirst" | "boxSecond">;
}

/**
 * Render a board of boxes' boxes, inside its `PlacementRoot`, as a list in the order the page shows
 * them, the empty box a new pair begins in last.
 *
 * - `plate-placement-boxes`, the list.
 * - `plate-placement-box`, one box, with `data-paired` once both halves hold a chip, and `data-empty`
 *   while neither does, as the box a new pair begins in.
 * - In each box, two `plate-placement-target`s, its halves, each a group named by the `boxFirst` or
 *   `boxSecond` label with the box's number ("Pair 1, first"), which announcements and slots say,
 *   so no two halves share a name. An empty half holds a `plate-placement-slot` a tap or a key puts
 *   the held chip in; a full one holds its `plate-placement-chip`, with the island's `chipProps`
 *   for it, and pressing it while another chip is held trades the two.
 *
 * Removing a pair needs no control of its own: a placed chip goes back to the bank by a tap on the
 * bank's slot, a drag, or Delete, and the primitive keeps focus on it there.
 *
 * @param props The boxes, the chips, their focus handlers and the labels ({@link PairBoxesProps}).
 * @returns The list of boxes.
 */
export const PairBoxes = (props: PairBoxesProps) => {
  const { boxes, chipProps, chips, labels } = props;
  const chipsBy = useMemo(() => new Map(chips.map((chip) => [chip.identifier, chip])), [chips]);
  const halves = useMemo(
    () => Array.from({ length: boxes.length }, (_, box) => halvesOf(box)),
    [boxes.length],
  );

  return (
    <ol data-slot="plate-placement-boxes" role="list">
      {halves.map((pair, index) => {
        const [first, second] = boxes[index] ?? [null, null];

        return (
          // A box is a place, not an item: its place is its key.
          <li
            key={index}
            data-empty={flag(first === null && second === null)}
            data-paired={flag(first !== null && second !== null)}
            data-slot="plate-placement-box"
          >
            {pair.map((half) => (
              <PlacementTarget
                key={half.side}
                name={{ by: "aria-label", text: halfName(labels, half) }}
                spot={half}
              >
                {({ chips: [chip] }) =>
                  chip === undefined ? (
                    <PlacementSlot />
                  ) : (
                    <PlacementChip
                      key={chip}
                      aria-label={chipsBy.get(chip)?.label}
                      value={chip}
                      {...chipProps?.(chip)}
                    >
                      {chipsBy.get(chip)?.content}
                    </PlacementChip>
                  )
                }
              </PlacementTarget>
            ))}
          </li>
        );
      })}
    </ol>
  );
};
