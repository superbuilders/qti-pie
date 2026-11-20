"use client";

/**
 * The Associate interaction's client island (`qti-associate-interaction`): the child pairs the
 * choices, chips in a bank, by putting two of them in a box, and each box that holds two choices is
 * one `pair` of the response.
 *
 * It follows the Choice island's pattern (`#plate/ui/choice/choice.tsx`) on the placement primitive
 * (`#plate/ui/placement/parts.tsx`) as a board of boxes (`#plate/ui/placement/boxes.tsx`), whose
 * machine holds QTI's limits and plate's rulings, and whose parts take a tap, a drag or a key,
 * refuse a move before anything changes, and announce every step and every pair made. The island
 * gives the primitive Associate's board and turns its boxes into the response and back; it decides
 * no rule of its own.
 *
 * @module
 */
import type { AssociateLabels } from "#plate/ui/associate/labels.ts";
import type { Authored, NameAttributes } from "#plate/ui/attributes.ts";
import type { Limit } from "#plate/ui/limit.ts";
import type { AssociableChoice } from "#plate/ui/placement/associable.ts";
import { PairBoxes, usePairBoxes } from "#plate/ui/placement/boxes.tsx";
import {
  PlacementBank,
  PlacementChip,
  PlacementMessage,
  PlacementRoot,
  PlacementSlot,
} from "#plate/ui/placement/parts.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";

/**
 * What the server gives an Associate's island, as QTI's `qti-associate-interaction` and plate's
 * presentation of it say: an interaction that "presents candidates with a number of choices and
 * allows them to create associations between them" (QTI 3.0 information model 5.8).
 *
 * Validity is not a prop: `min-associations` (5.8.3) and each choice's `match-min` (5.131.7) decide
 * whether a submitted response is valid, which the server judges, and a child is never stopped
 * short of them.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_AssociateInteraction
 */
export interface AssociateProps extends Authored<NameAttributes> {
  /**
   * The `qti-simple-associable-choice`s, the chips, in display order: the server's order, shuffled
   * already when the interaction shuffles, each `fixed` choice at its own place (5.8.1). Each is
   * shown in the bank and again in each box that holds it; its `matchMax` is how many pairs it may
   * be in (5.131.6), and its `matchGroup` the choices it may pair with (5.131.5).
   */
  readonly choices: readonly AssociableChoice[];
  /**
   * The announcements, refusals and words the island writes, a board of boxes' (see
   * {@link AssociateLabels}).
   */
  readonly labels: AssociateLabels;
  /**
   * `max-associations` (5.8.2): how many pairs the response may hold. The server writes the XSD's
   * default of 1 when the author wrote none, and no limit for 0 (see {@link Limit}). A `single`
   * response has at most 1 here, so it never posts two entries.
   */
  readonly maxAssociations: Limit;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * The `qti-prompt`, server-rendered under its scoped id, which `naming` names the group by where
   * the prompt names anything; undefined when the interaction has none.
   */
  readonly prompt: Prompt | undefined;
}

/**
 * Render an Associate for the child to answer, holding its response in the item's `<Responses>`.
 *
 * The parts, in the order a screen reader meets them, the choices before the pairs:
 *
 * - `plate-associate`, the root, a group named as `naming` says, with the author's `data-*` and
 *   `class` (`root`);
 * - `plate-prompt`, the prompt;
 * - `plate-placement`, the primitive's root, with `data-picked` while a chip is held and
 *   `data-dragging` while one is dragged;
 * - `plate-placement-bank`, the bank, with `data-over` under a dragged chip. It holds one
 *   `plate-placement-chip` per choice, with `data-picked`, `data-dragging`, `data-copies` when its
 *   `match-max` is not 1, and `data-used`, a placeholder that keeps its place, once it is in as
 *   many pairs as it may be; and last, always, the `plate-placement-slot` that puts a chip picked
 *   up from a box back, which the stylesheet hides, keeping its space, until such a chip is held,
 *   so nothing moves under a finger;
 * - `plate-placement-message`, the latest refusal, as it was announced;
 * - `plate-placement-boxes`, the boxes ({@link PairBoxes}): each a `plate-placement-box` of two
 *   halves named "Pair n", with `data-paired` once it holds a pair, and after the others, while
 *   `max-associations` allows another pair, the empty box a new pair begins in.
 *
 * A pair joins two different choices, as no other box joins them in either order, and only where
 * both choices' `match-group`s allow it; a choice is in at most its `match-max` boxes, and the
 * boxes hold `max-associations` pairs in all. Each refusal is the primitive's: stopped before the
 * response changes, announced, and shown in the message.
 *
 * The response is a bag: one `"first second"` text per box that holds a pair, in the order of the
 * boxes, never sorted; a box holding one choice posts nothing.
 *
 * @param props The interaction, its response's entry name and its labels ({@link AssociateProps}).
 * @returns The Associate, its boxes bound to the response.
 * @see {@link PlacementRoot}
 */
export const Associate = (props: AssociateProps) => {
  const { choices, labels, maxAssociations, name, naming, prompt, root } = props;
  const pairs = usePairBoxes(name, choices, maxAssociations);

  return (
    <div {...naming} {...root} data-slot="plate-associate" role="group">
      <PromptPart prompt={prompt} />
      <PlacementRoot {...pairs.root} labels={labels}>
        <PlacementBank>
          {choices.map((choice) => (
            <PlacementChip
              key={choice.identifier}
              aria-label={choice.label}
              value={choice.identifier}
            >
              {choice.content}
            </PlacementChip>
          ))}
          <PlacementSlot />
        </PlacementBank>
        <PlacementMessage />
        <PairBoxes boxes={pairs.shown} chips={choices} labels={labels} />
      </PlacementRoot>
    </div>
  );
};
