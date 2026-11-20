"use client";

/**
 * The Order interaction's client island (`qti-order-interaction`): the child puts the choices in
 * order by moving each from a bank of chips into numbered positions, by a tap, a drag or a key,
 * and the choices in position order are the response.
 *
 * It follows the Choice island's pattern (`#plate/ui/choice/choice.tsx`) and stands on the
 * placement primitive (`#plate/ui/placement/parts.tsx`) as a sequence board: each choice is one
 * chip, placed at most once, and each position holds one choice. A chip lands in the position it
 * is dropped, tapped or keyed into, and a position stays empty until a chip fills it, so a child
 * can put the last step first. A chip dropped on a taken position trades places with the chip
 * there, which moves to the position the dropped chip left, or back to the bank when the dropped
 * chip came from the bank.
 *
 * The response is the chips in position order, posted once the positions are filled from the first
 * as far as the order requires (`useSequence` in `#plate/ui/placement/sequence.ts`): until then,
 * and while an empty position stands before a filled one, it stays NULL, "the candidate has not
 * offered a response" (QTI 3.0 information model 5.115). An untouched order posts nothing, so the
 * shuffled order of the bank is never an answer, and never scores right by accident.
 *
 * @module
 */
import { useMemo } from "react";
import type { ReactNode } from "react";
import type { Authored, NameAttributes } from "#plate/ui/attributes.ts";
import type { OrderLabels } from "#plate/ui/order/labels.ts";
import type { Position } from "#plate/ui/placement/machine.ts";
import {
  PlacementBank,
  PlacementChip,
  PlacementMessage,
  PlacementRoot,
  PlacementSlot,
  PlacementTarget,
  PlacementTargetLabel,
} from "#plate/ui/placement/parts.tsx";
import { useSequence } from "#plate/ui/placement/sequence.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { spokenBeside } from "#plate/ui/read-aloud/spoken.tsx";
import type { Spoken } from "#plate/ui/read-aloud/spoken.tsx";

/**
 * What the server gives an Order's island, as QTI's `qti-order-interaction` and plate's
 * presentation of it say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_OrderInteraction
 */
export interface OrderProps extends Authored<NameAttributes> {
  /**
   * The choices in display order: the server's order, shuffled already when the interaction
   * shuffles, each `fixed` choice at its own place (5.97.1). `content` is the `qti-simple-choice`'s
   * server-rendered content, shown in its chip in the bank, which stays as a placeholder once the
   * choice is placed, so it holds no interactive element; `copy` is the same content written as a
   * copy, with none of the author's `id`s, which the position it is placed in shows, so no `id`
   * stands twice on the page while the placeholder keeps the original. `label`, absent when the
   * content shows text, is the accessible name the server gives a choice whose content has none,
   * such as an image: its chip carries it, and announcements read it, since the primitive reads a
   * part's text, then its `aria-label`, and never an image's `alt`. `readAloud` is read-aloud's
   * control for the catalog the choice references, absent where the candidate hears none
   * (`#plate/ui/read-aloud/read-aloud.tsx`): it stands beside the choice's chip in the bank, in
   * `plate-order-choice`, never in the chip, a button, and the bank lists every choice once,
   * placed or not, so each choice is heard from one place.
   */
  readonly choices: readonly (Spoken & {
    readonly content: ReactNode;
    readonly copy: ReactNode;
    readonly identifier: string;
    readonly label: string | undefined;
  })[];
  /**
   * The texts the island writes for the child, from plate's message catalog (`orderKeys` in
   * `#plate/ui/order/labels.ts`).
   */
  readonly labels: OrderLabels;
  /**
   * How many positions the Order shows, which the server derives from `max-choices` and
   * `min-choices`. With a `min-choices`, it is the `max-choices` written beside it, or one per
   * choice when there is none, since "If unspecified, all of the choices may be ordered" (5.97.3);
   * without one, it is one per choice, since then "all of the choices must be ordered and
   * max-choices is ignored" (5.97.2, plate's reading 18).
   */
  readonly positions: number;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * `orientation`, "a hint to rendering systems that the ordering has an inherent vertical or
   * horizontal interpretation" (5.97.4). The XSD gives it no default, so it is absent where the
   * author wrote none, and the stylesheet then lays the positions out vertically, plate's platform
   * default. The stylesheet reads it from the root's `data-orientation`.
   */
  readonly orientation: "horizontal" | "vertical" | undefined;
  /**
   * The `qti-prompt`, server-rendered under its scoped id, which `naming` names the group by where
   * the prompt names anything; undefined when the interaction has none.
   */
  readonly prompt: Prompt | undefined;
  /**
   * How many positions the response must fill before it posts, which the server derives from
   * `min-choices`: the `min-choices` written, or one per choice when there is none, since then
   * every choice must be ordered (5.97.2). It never stops a child placing or taking out a choice;
   * whether a submitted response is valid the server judges.
   */
  readonly required: number;
}

/**
 * Render an Order for the child to answer, holding its response in the item's `<Responses>`.
 *
 * The parts:
 *
 * - `plate-order`, the root, a group named as `naming` says, with the author's `data-*` and `class`
 *   (`root`), and `data-orientation` where the author wrote one;
 * - `plate-prompt`, the prompt;
 * - The placement primitive's root, `plate-placement`, with `data-picked` while a chip is held and
 *   `data-dragging` during a drag;
 * - `plate-placement-bank`, the bank: a `plate-placement-chip` per choice in display order, which a
 *   placed choice leaves as a layout-holding placeholder (`data-used`), a choice the candidate
 *   hears read aloud standing with its control in `plate-order-choice`, then a
 *   `plate-placement-slot` that returns a held placed chip, which the primitive names with the
 *   `bankSlot` label;
 * - `plate-order-positions`, the positions, an `ol`, as many as `positions`. It says `role="list"`
 *   outright: the stylesheet takes its markers off, and WebKit stops exposing a list with no
 *   markers as a list, which would lose "1 of 4" for a screen reader;
 * - `plate-placement-target`, each position, an `li` with `data-over` under a dragged chip and
 *   `data-empty` while it holds none. It holds its `plate-placement-target-label`, its number,
 *   which names it in every announcement and slot, then the chip placed there. A position never
 *   shows `data-full` or `data-refuses`: a taken one swaps, and each takes any choice;
 * - `plate-placement-slot`, in every empty position, which the primitive names with the `slot` label
 *   for that position: a drop, a tap or a key on it puts the held chip in that position. A press on
 *   a placed chip while another is held swaps the two;
 * - `plate-placement-message`, the latest refusal, as it was announced.
 *
 * The stylesheet makes every chip and position at least 64 px tall and the numbers large. The
 * primitive announces each step and refusal with the `labels`, filled with the chips' content and
 * the positions' numbers as the child sees them.
 *
 * @param props The interaction, its response's entry name and its labels ({@link OrderProps}).
 * @returns The Order, its placements bound to the response.
 */
export const Order = (props: OrderProps) => {
  const {
    choices,
    labels,
    name,
    naming,
    orientation,
    positions,
    prompt,
    required,
    root: authored,
  } = props;
  const root = useSequence(name, choices, positions, required);
  const spots = useMemo(
    () => Array.from({ length: positions }, (_, index): Position => ({ index, kind: "position" })),
    [positions],
  );
  const chipsBy = useMemo(
    () => new Map(choices.map((choice) => [choice.identifier, choice])),
    [choices],
  );

  return (
    <div
      {...authored}
      data-slot="plate-order"
      data-orientation={orientation}
      role="group"
      {...naming}
    >
      <PromptPart prompt={prompt} />
      <PlacementRoot {...root} labels={labels}>
        <PlacementBank>
          {choices.map((choice) =>
            spokenBeside(
              <PlacementChip
                key={choice.identifier}
                aria-label={choice.label}
                value={choice.identifier}
              >
                {choice.content}
              </PlacementChip>,
              choice,
              { key: choice.identifier, slot: "plate-order-choice" },
            ),
          )}
          <PlacementSlot />
        </PlacementBank>
        <ol data-slot="plate-order-positions" role="list">
          {spots.map((spot) => (
            <PlacementTarget
              key={spot.index}
              name={{ by: "label-part", text: String(spot.index + 1) }}
              render={<li />}
              spot={spot}
            >
              {({ chips }) => (
                <>
                  <PlacementTargetLabel>{spot.index + 1}</PlacementTargetLabel>
                  {chips.map((chip) => (
                    <PlacementChip key={chip} aria-label={chipsBy.get(chip)?.label} value={chip}>
                      {chipsBy.get(chip)?.copy}
                    </PlacementChip>
                  ))}
                  {chips.length === 0 ? <PlacementSlot /> : null}
                </>
              )}
            </PlacementTarget>
          ))}
        </ol>
        <PlacementMessage />
      </PlacementRoot>
    </div>
  );
};
