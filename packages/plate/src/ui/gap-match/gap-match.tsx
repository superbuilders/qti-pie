"use client";

/**
 * The Gap Match interaction's client island (`qti-gap-match-interaction`): a bank of gap texts the
 * child places into the gaps of the author's sentence, by a drag, a tap on a gap text and then a
 * gap, or the keyboard, and each gap text in a gap is one `directedPair` of the response.
 *
 * It follows the Choice island's pattern (`#plate/ui/choice/choice.tsx`) on the placement primitive
 * (`#plate/ui/placement/parts.tsx`). The sentence is the server's: it renders the interaction's
 * block content as the island's `children`, with a {@link Gap} wherever a `qti-gap` stands, so the
 * text, its MathML and its images ship as HTML and only the gaps are client parts. Each {@link Gap}
 * reads the island's gap texts and labels from its context and the placements from the primitive's.
 *
 * QTI decides the board (QTI 3.0 information model 5.57; `gapBoardOf` in
 * `#plate/placement/gap-board.ts`): the gap texts are the sources and the gaps the targets; "Each
 * gap can have at most one choice associated with it", so a gap holds one gap text; a gap text's
 * `match-max` is how many gaps it may fill, so one gap text can fill several gaps as copies;
 * `max-associations` caps the pairs; and a pair stands only where the `match-group` of each side,
 * when it lists any, names the other. A drop on a filled gap is refused, which QTI leaves open and
 * plate rules: the child lifts the gap text there out first.
 *
 * What a gap shows is what the response sends, by construction: the island keeps no placement of
 * its own, only the chip the child holds, which stays shown where it was until a step moves it.
 * Each gap draws every gap text the response pairs with it, and its empty place only where the
 * response pairs it with none, so no pair is sent that no gap shows, and no gap shows a gap text
 * that is not sent.
 *
 * @module
 */
import { createContext, use, useMemo } from "react";
import type { ReactNode } from "react";
import type { Declared } from "#plate/model/values.ts";
import type { Authored, NameAttributes } from "#plate/ui/attributes.ts";
import { GapOutsideGapMatch } from "#plate/ui/defects.ts";
import type { GapMatchLabels } from "#plate/ui/gap-match/labels.ts";
import { fillLabel } from "#plate/ui/labels.ts";
import type { Limit } from "#plate/placement/limit.ts";
import { directedPairsOf, placementsOf } from "#plate/ui/placement/associable.ts";
import { gapBoardOf } from "#plate/placement/gap-board.ts";
import type { GapRule } from "#plate/placement/gap-board.ts";
import type { AssociableChoice } from "#plate/ui/placement/associable.ts";
import type { Pairs } from "#plate/placement/machine.ts";
import {
  PlacementBank,
  PlacementChip,
  PlacementMessage,
  PlacementRoot,
  PlacementSlot,
  PlacementTarget,
} from "#plate/ui/placement/parts.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { spokenBeside } from "#plate/ui/read-aloud/spoken.tsx";
import { directedPairSingles, useResponse } from "#plate/ui/responses.tsx";

/**
 * What the server gives a Gap Match's island, as QTI's `qti-gap-match-interaction` and plate's
 * presentation of it say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_GapMatchInteraction
 */
export interface GapMatchProps extends Authored<NameAttributes> {
  /**
   * The words over the bank where the host asks for them (`bankCaption`), AlphaTest's "DRAG & DROP
   * THE ANSWER"; undefined for none.
   */
  readonly caption: string | undefined;
  /**
   * The interaction's block content, server-rendered, with a {@link Gap} for each `qti-gap` shown,
   * in place, and nothing for a gap its template hides (5.55.3). It holds no interactive element
   * but its gaps.
   */
  readonly children: ReactNode;
  /**
   * The gaps shown, in document order, the order their {@link Gap}s' `index` counts: the targets of
   * the pairs, each with its `match-group` ({@link GapRule}). Gaps are never shuffled.
   */
  readonly gaps: readonly GapRule[];
  /**
   * The gap texts and gap images shown, in display order: the server's order, shuffled already
   * when the interaction shuffles (5.57.1), each one chip in the bank and in each gap it fills.
   * A `qti-gap-img`'s `label` is its `object-label` (5.56.7), else its image's `alt`, else plate's
   * `choiceOf` message. A `matchMax` other than 1 makes the chip a stack of copies.
   */
  readonly gapTexts: readonly AssociableChoice[];
  readonly labels: GapMatchLabels;
  /**
   * `max-associations` (5.57.3): how many pairs the gaps hold in all. The server writes the XSD's
   * default of 1 when the author wrote none, and no limit for 0 (see {@link Limit}). A `single`
   * response needs no prop of its own: QTI binds one only where `max-associations` is 1, so the
   * island writes at most one pair. `min-associations`, `match-min` and a gap's `required` are not
   * props: they decide whether a submitted response is valid (5.57.2, 5.58.6, 5.55.5), which the
   * server judges, and a child is never stopped short of them.
   */
  readonly maxAssociations: Limit;
  /**
   * The response, as its declaration types it: a `directedPair` response of `single` or
   * `multiple` cardinality, each pair a gap text and the gap it fills.
   */
  readonly response: Declared<"directedPair", "multiple" | "single">;
  /**
   * The `qti-prompt`, server-rendered under its scoped id, which `naming` names the group by where
   * the prompt names anything; undefined when the interaction has none.
   */
  readonly prompt: Prompt | undefined;
}

/**
 * What a Gap Match shares with the {@link Gap}s in its sentence: its gap texts by identifier, which
 * a gap shows the one it holds from, and its labels, which name the gaps.
 */
interface GapMatchContextValue {
  readonly gapTexts: ReadonlyMap<string, AssociableChoice>;
  readonly labels: GapMatchLabels;
}

/**
 * The context a Gap Match gives the {@link Gap}s in its sentence; undefined outside one.
 */
const GapMatchContext = createContext<GapMatchContextValue | undefined>(undefined);

/**
 * Render a Gap Match for the child to answer, holding its response in the item's `<Responses>`.
 *
 * The parts:
 *
 * - `plate-gap-match`, the root, a group named as `naming` says, with the author's `data-*` and
 *   `class` (`root`);
 * - `plate-prompt`, the prompt, when there is one;
 * - `plate-placement`, the primitive's root, holding the rest;
 * - `plate-placement-bank`, the bank, a chip per gap text in display order. A gap text with copies
 *   left stays in the bank; one with none left stays as a placeholder, so nothing around it moves.
 *   A gap text the candidate hears read aloud stands with its control in `plate-gap-match-choice`.
 *   Its `plate-placement-slot`, last, named by the `bankSlot` label, puts a placed gap text back;
 *   it keeps its place but shows only while a placed gap text is held;
 * - `children`, the author's sentence, with a `plate-gap` per gap ({@link Gap});
 * - `plate-placement-message`, the latest refusal, as the primitive announced it.
 *
 * Every change goes through the primitive's machine, which refuses a move before any state
 * changes: a gap text with no uses left, a pair past `max-associations`, a pair either side's
 * `match-group` leaves out, a gap text already in that gap, and any drop on a filled gap. The
 * response is written whole on every change.
 *
 * @param props The interaction, its response and its labels ({@link GapMatchProps}).
 * @returns The Gap Match, its placements bound to the response.
 */
export const GapMatch = (props: GapMatchProps) => {
  const {
    caption,
    children,
    gapTexts,
    gaps,
    labels,
    maxAssociations,
    naming,
    prompt,
    response,
    root,
  } = props;
  const [pairs, set] = useResponse(response, directedPairSingles);
  const board = useMemo(
    () => gapBoardOf(gapTexts, gaps, maxAssociations),
    [gapTexts, gaps, maxAssociations],
  );
  const context = useMemo(
    (): GapMatchContextValue => ({
      gapTexts: new Map(gapTexts.map((gapText) => [gapText.identifier, gapText])),
      labels,
    }),
    [gapTexts, labels],
  );
  const placements = useMemo(() => placementsOf(pairs), [pairs]);

  return (
    <div {...naming} {...root} data-slot="plate-gap-match" role="group">
      <PromptPart prompt={prompt} />
      <GapMatchContext value={context}>
        <PlacementRoot
          board={board}
          labels={labels}
          placements={placements}
          onPlacementsChange={(next: Pairs) => {
            set(directedPairsOf(next));
          }}
        >
          <PlacementBank caption={caption}>
            {gapTexts.map((gapText) =>
              spokenBeside(
                <PlacementChip
                  key={gapText.identifier}
                  aria-label={gapText.label}
                  value={gapText.identifier}
                >
                  {gapText.content}
                </PlacementChip>,
                gapText,
                { key: gapText.identifier, slot: "plate-gap-match-choice" },
              ),
            )}
            <PlacementSlot />
          </PlacementBank>
          {children}
          <PlacementMessage />
        </PlacementRoot>
      </GapMatchContext>
    </div>
  );
};

/**
 * What the server gives each {@link Gap} it places in a Gap Match's sentence.
 */
export interface GapProps {
  /**
   * The `qti-gap`'s identifier, the target of the pairs that fill it.
   */
  readonly identifier: string;
  /**
   * The gap's position among the interaction's gaps shown, in document order, counted from 0: its
   * place in the island's `gaps`. Its name is the `gap` label with `{n}` as this plus 1.
   */
  readonly index: number;
}

/**
 * Render one gap of a Gap Match's sentence, where a `qti-gap` stands: a place inline in the line
 * that holds one gap text, drawn from the response alone.
 *
 * The parts:
 *
 * - `plate-gap`, a `span` standing in the line, which grows around it;
 * - `plate-placement-target`, the primitive's target, a `span` and a `group` named by the `gap`
 *   label, "Blank 2", which announcements and refusals read;
 * - `plate-placement-slot`, while the response pairs no gap text with the gap: the button that puts
 *   the held gap text here, named by the `slot` label with the gap's name, "Put it in Blank 2", an
 *   empty dashed place at least 64 px tall. It shows no number or letter of plate's own: the
 *   author's content around a gap may hold numerals of its own, a comparison's or a number line's,
 *   which a number of plate's would read as part of, and AlphaTest's player drew the empty place
 *   blank, as the K–2 mastery forms' design does. The gap's number lives in its name alone, which a
 *   refusal says just after the child acted on that gap;
 * - `plate-placement-chip`, one for each gap text the response pairs with the gap, at a chip's full
 *   size, which picks it up again. A gap holds one gap text, but the gap draws whatever the
 *   response pairs with it, so what it shows is what is sent whatever the response holds.
 *
 * The response names only gap texts and gaps the island shows, since the server drops any other
 * pair it restores.
 *
 * @param props The gap's identifier and position ({@link GapProps}).
 * @returns The gap, showing the gap text it holds or the place for one.
 * @throws {GapOutsideGapMatch} When it is rendered outside a {@link GapMatch}, whose context it
 *   reads.
 */
export const Gap = (props: GapProps) => {
  const { identifier, index } = props;
  const gapMatch = use(GapMatchContext);

  if (gapMatch === undefined) {
    throw new GapOutsideGapMatch();
  }

  const gapName = fillLabel(gapMatch.labels.gap, { n: index + 1 });

  return (
    <span data-slot="plate-gap">
      <PlacementTarget
        name={{ by: "aria-label", text: gapName }}
        render={<span />}
        spot={{ id: identifier, kind: "target" }}
      >
        {({ chips }) =>
          chips.length === 0 ? (
            <PlacementSlot />
          ) : (
            chips.map((chip, at) => (
              <PlacementChip
                key={`${chip} ${String(at)}`}
                aria-label={gapMatch.gapTexts.get(chip)?.label}
                value={chip}
              >
                {gapMatch.gapTexts.get(chip)?.content}
              </PlacementChip>
            ))
          )
        }
      </PlacementTarget>
    </span>
  );
};
