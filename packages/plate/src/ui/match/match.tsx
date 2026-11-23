"use client";

/**
 * The Match interaction's client island (`qti-match-interaction`): the child sorts the first match
 * set's choices, chips in a bank, into the second set's choices, groups, and each chip in a group
 * is one `directedPair` of the response, the source first.
 *
 * It follows the Choice island's pattern (`#plate/ui/choice/choice.tsx`) on the placement primitive
 * (`#plate/ui/placement/parts.tsx`), whose machine holds QTI's limits and whose parts take a tap, a
 * drag or a key, refuse a move before anything changes, and announce every step. The island gives
 * the primitive Match's board (`matchBoardOf` in `#plate/placement/match-board.ts`), which a Match
 * laid out as a table moves its ticks on too (`#plate/ui/match/table.tsx`), and turns its
 * placements into the response and back; it decides no rule of its own.
 *
 * @module
 */
import { useMemo } from "react";
import type { Declared } from "#plate/model/values.ts";
import type { Authored, NameAttributes } from "#plate/ui/attributes.ts";
import type { Limit } from "#plate/placement/limit.ts";
import type { MatchLabels } from "#plate/ui/match/labels.ts";
import { matchBoardOf } from "#plate/placement/match-board.ts";
import { directedPairsOf, placementsOf } from "#plate/ui/placement/associable.ts";
import type { AssociableChoice } from "#plate/ui/placement/associable.ts";
import type { Pairs } from "#plate/placement/machine.ts";
import type { TargetName } from "#plate/ui/placement/primitive.ts";
import {
  PlacementBank,
  PlacementChip,
  PlacementMessage,
  PlacementRoot,
  PlacementSlot,
  PlacementTarget,
  PlacementTargetLabel,
} from "#plate/ui/placement/parts.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { spokenBeside } from "#plate/ui/read-aloud/spoken.tsx";
import { directedPairSingles, useResponse } from "#plate/ui/responses.tsx";

/**
 * One group of a Match, a choice of its second set, as the island shows it: the choice, but for
 * its `label`, and its {@link TargetName}, by its content's text where the content shows text, else
 * by the name the server gives it.
 */
export type MatchTarget = Omit<AssociableChoice, "label"> & { readonly name: TargetName };

/**
 * A Match's visible heading of its bank: the author's `data-first-column-header`, and the id the
 * bank's group is named by, the same in the island and the review.
 */
export interface MatchHeader {
  readonly id: string;
  readonly text: string;
}

/**
 * What the server gives a Match's island, as QTI's `qti-match-interaction` and plate's presentation
 * of it say. The two `qti-simple-match-set`s are `sources` and `targets`: "the first set defines
 * the source choices and the second set the targets" (QTI 3.0 information model 5.89.7).
 *
 * Validity is not a prop: `min-associations` (5.89.3) and each choice's `match-min` (5.131.7)
 * decide whether a submitted response is valid, which the server judges, and a child is never
 * stopped short of them.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_MatchInteraction
 */
export interface MatchProps extends Authored<NameAttributes> {
  /**
   * The author's `data-first-column-header` (5.89.6), "the custom text to be rendered in the
   * top-left header cell of the table (headings must be visible)", as written and not blank, and
   * the id the server scopes for it: the heading of the sources, whose column a table's top-left
   * cell heads. The bank holds the sources here, so it is the bank's visible heading and names it.
   * Undefined when the author wrote none.
   */
  readonly header: MatchHeader | undefined;
  /**
   * The announcements, refusals and words the island writes. The server gives the author's
   * `data-max-selections-message` as `totalReached` when the interaction has one (5.89.5), so the
   * refusal reads the same on the page as in the server's validation.
   */
  readonly labels: MatchLabels;
  /**
   * `max-associations` (5.89.2): how many chips the groups hold in all. The server writes the XSD's
   * default of 1 when the author wrote none, and no limit for 0 (see {@link Limit}). A chip from
   * the bank is refused once the groups hold that many, and a chip moved between groups is not,
   * since a move makes no new association. A `single` response has at most 1 here, so it never
   * holds two pairs.
   */
  readonly maxAssociations: Limit;
  /**
   * The response, as its declaration types it: a `directedPair` response of `single` or
   * `multiple` cardinality.
   */
  readonly response: Declared<"directedPair", "multiple" | "single">;
  /**
   * The `qti-prompt`, server-rendered under its scoped id, which `naming` names the group by where
   * the prompt names anything; undefined when the interaction has none.
   */
  readonly prompt: Prompt | undefined;
  /**
   * The first match set's choices, the chips, in display order: the server's order, shuffled
   * already when the interaction shuffles (5.89.1). Each is shown in the bank and again in each
   * group that holds it; its `matchMax` is how many groups it may go to, and its `matchGroup` the
   * groups it may go to.
   */
  readonly sources: readonly AssociableChoice[];
  /**
   * The second match set's choices, the groups, in display order, shuffled already as the sources
   * are. Each one's `content` is the group's visible content and its `name` how it is named; its
   * `matchMax` is how many chips it holds, and its `matchGroup` the sources it takes.
   */
  readonly targets: readonly MatchTarget[];
}

/**
 * Render a Match for the child to answer, holding its response in the item's `<Responses>`.
 *
 * The parts, in the order a screen reader meets them, the choices before the targets, as QTI's
 * shared vocabulary asks (1.2.8.1):
 *
 * - `plate-match`, the root, a group named as `naming` says, with the author's `data-*` and `class`
 *   (`root`);
 * - `plate-prompt`, the prompt;
 * - `plate-placement`, the primitive's root, with `data-picked` while a chip is held and
 *   `data-dragging` while one is dragged;
 * - `plate-match-header`, the author's `data-first-column-header` (`header`), when there is one: the
 *   bank's visible heading, which names the bank, then a group;
 * - `plate-placement-bank`, the bank, with `data-over` under a dragged chip. It holds one
 *   `plate-placement-chip` per source, with `data-picked`, `data-dragging`, `data-copies` when its
 *   `match-max` is not 1, and `data-used`, a placeholder that keeps its place, once it has no uses
 *   left, a source the candidate hears read aloud standing with its control in
 *   `plate-match-choice`, and last, always, the `plate-placement-slot` that puts a chip picked up
 *   from a group back, which the stylesheet hides, keeping its space, until such a chip is held, so
 *   nothing moves under a finger;
 * - `plate-placement-message`, the latest refusal, as it was announced;
 * - `plate-match-group`, one per target, the card that holds its `plate-placement-target`, a group
 *   named by its `plate-placement-target-label`, the target's content, or by its `label` when it
 *   has one. The target has `data-over` under a dragged chip, `data-empty` while it holds none,
 *   `data-refuses` while it would refuse the held chip, and `data-full` at its `match-max`. It
 *   holds, after its label, read-aloud's control where the candidate hears the group read aloud,
 *   which a press places nothing by; `plate-match-full`, the `full` label, while it is full; a
 *   `plate-placement-chip` for each chip placed in it, in the order they came; and, while it has
 *   room, a `plate-placement-slot` a tap or a key puts the held chip in.
 *
 * A group holds as many chips as its `match-max`, a chip goes to as many groups as its own, never
 * twice to one and only where both sides' `match-group`s allow, and the groups hold
 * `max-associations` in all. A full group refuses a chip rather than trading one out, since which
 * of its chips would leave is not the child's to guess. Each refusal is the primitive's: stopped
 * before the response changes, announced, and shown in the message.
 *
 * The response is a bag: one `directedPair` per chip in a group, the chip's source first, in the
 * order the primitive keeps them, never sorted or made distinct.
 *
 * @param props The interaction, its response and its labels ({@link MatchProps}).
 * @returns The Match, its placements bound to the response.
 * @see {@link PlacementRoot}
 */
export const Match = (props: MatchProps) => {
  const { header, labels, maxAssociations, naming, prompt, response, root, sources, targets } =
    props;
  const [pairs, set] = useResponse(response, directedPairSingles);
  const chipsBy = useMemo(
    () => new Map(sources.map((source) => [source.identifier, source])),
    [sources],
  );
  const board = useMemo(
    () => matchBoardOf(sources, targets, maxAssociations),
    [maxAssociations, sources, targets],
  );
  const placements = useMemo(() => placementsOf(pairs), [pairs]);

  return (
    <div {...naming} {...root} data-slot="plate-match" role="group">
      <PromptPart prompt={prompt} />
      <PlacementRoot
        board={board}
        labels={labels}
        placements={placements}
        onPlacementsChange={(next: Pairs) => {
          set(directedPairsOf(next));
        }}
      >
        {header === undefined ? null : (
          <div data-slot="plate-match-header" id={header.id}>
            {header.text}
          </div>
        )}
        <PlacementBank
          {...(header === undefined ? {} : { "aria-labelledby": header.id, role: "group" })}
        >
          {sources.map((source) =>
            spokenBeside(
              <PlacementChip
                key={source.identifier}
                aria-label={source.label}
                value={source.identifier}
              >
                {source.content}
              </PlacementChip>,
              source,
              { key: source.identifier, slot: "plate-match-choice" },
            ),
          )}
          <PlacementSlot />
        </PlacementBank>
        <PlacementMessage />
        <div>
          {targets.map((target) => (
            <div key={target.identifier} data-slot="plate-match-group">
              <PlacementTarget name={target.name} spot={{ id: target.identifier, kind: "target" }}>
                {({ chips, full }) => (
                  <>
                    <PlacementTargetLabel>{target.content}</PlacementTargetLabel>
                    {target.readAloud}
                    {full ? <span data-slot="plate-match-full">{labels.full}</span> : null}
                    {chips.map((chip) => (
                      <PlacementChip key={chip} aria-label={chipsBy.get(chip)?.label} value={chip}>
                        {chipsBy.get(chip)?.content}
                      </PlacementChip>
                    ))}
                    {full ? null : <PlacementSlot />}
                  </>
                )}
              </PlacementTarget>
            </div>
          ))}
        </div>
      </PlacementRoot>
    </div>
  );
};
