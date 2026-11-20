"use client";

/**
 * The Hot Text interaction's client island (`qti-hottext-interaction`): the author's passage with
 * runs of text set in it as choices, which the child picks in place, one as a UI SDK radio or
 * several as UI SDK checkboxes, and the picks are the response's identifiers.
 *
 * It follows the Choice island's pattern (`#plate/ui/choice/choice.tsx`), its choices standing in
 * the author's content as Gap Match's gaps stand in its sentence
 * (`#plate/ui/gap-match/gap-match.tsx`): the server renders the interaction's block content as the
 * island's `children`, with a `PickOption` (`#plate/ui/picks/picks-group.tsx`) wherever a hottext
 * the child may pick stands, so the passage, its MathML and its images ship as HTML and only the
 * choices are client parts, each reading the picks group it stands in.
 *
 * QTI decides the picks (QTI 3.0 information model 5.66): "Like choiceInteraction, the candidate's
 * task is to select one or more of the choices, up to a maximum of max-choices", and the response
 * is an `identifier` of `single` or `multiple` cardinality. A hottext its template hides "must
 * still be presented to the candidate as if it were simply part of the surrounding material", only
 * "unselectable" (5.65): the server writes its content in the passage with no `PickOption`, so it
 * is text here and no choice.
 *
 * @module
 */
import type { ReactNode } from "react";
import type { Authored, Named } from "#plate/ui/attributes.ts";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import type { picksKeys } from "#plate/ui/picks/labels.ts";
import { PicksGroup } from "#plate/ui/picks/picks-group.tsx";
import type { Picks } from "#plate/ui/picks/picks.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";

/**
 * What the server gives a Hot Text's island, as QTI's `qti-hottext-interaction` and plate's
 * presentation of it say: what the author wrote on its root and what names its group
 * (`Authored`), always something, and its own.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_HotTextInteraction
 */
export interface HottextProps extends Authored<Named> {
  /**
   * The interaction's block content after its prompt, server-rendered, the passage the author
   * wrote, with a `PickOption` for each hottext the child may pick, in place, and the content alone
   * of each one its template hides (5.65). It holds no interactive element but its choices.
   */
  readonly children: ReactNode;
  readonly labels: Labels<typeof picksKeys>;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * How many hottexts the child picks (5.66.1), as the server reads it (`picksOf` in
   * `#plate/ui/picks/picks.ts`): one as radios of one group, where a pick replaces the last, else
   * checkboxes, a pick past `max-choices` refused. The response is a bag: the island posts each
   * picked identifier once, which a bag does not read in any order.
   */
  readonly picks: Picks;
  /**
   * The `qti-prompt`, server-rendered, under the id that names the group; undefined where the
   * interaction has none.
   */
  readonly prompt: Prompt | undefined;
}

/**
 * Render a Hot Text for the child to answer, holding its response in the item's `<Responses>`: a
 * picks group (`PicksGroup` in `#plate/ui/picks/picks-group.tsx`), which owns the response, the
 * refusal and its announcement.
 *
 * The parts:
 *
 * - `plate-hottext`, the root, with the author's `data-*` and `class`, and `data-full` while
 *   checkboxes with a limit hold `max-choices` identifiers;
 * - `plate-prompt`, the prompt, where the interaction has one;
 * - The group, UI SDK's `radio-group` or `checkbox-group`, named by `naming`, holding the author's
 *   passage, with a `plate-hottext-choice` per hottext the child may pick: a `label`, phrasing
 *   content, so it stands in the author's sentence and breaks no paragraph, with `data-selected`
 *   while it is picked, around the UI SDK `radio` or `checkbox` and the hottext's
 *   `plate-hottext-content`, so a press anywhere on it presses the control and the content names
 *   it. The whole run is the hit target: the stylesheet's padding and line height make it at least
 *   44 px tall, where the 64 px of a K–3 target elsewhere would break the line it stands in, and
 *   nothing in it moves when it is picked;
 * - `plate-hottext-limit`, the `limit` label, shown from a refused pick until the next accepted one.
 *
 * @param props The interaction, its response's entry name and its labels ({@link HottextProps}).
 * @returns The Hot Text, its hottexts bound to the response.
 */
export const Hottext = (props: HottextProps) => {
  const { children, labels, name, naming, picks, prompt, root } = props;

  return (
    <PicksGroup
      before={<PromptPart prompt={prompt} />}
      limit={labels.limit}
      naming={naming}
      picks={picks}
      response={name}
      root={{ ...root, "data-slot": "plate-hottext" }}
    >
      {children}
    </PicksGroup>
  );
};
