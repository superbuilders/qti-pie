"use client";

/**
 * The Choice interaction's client island (`qti-choice-interaction`): the child picks one choice
 * from a UI SDK radio group, or several from a UI SDK checkbox group, and the picks are the
 * response's identifiers.
 *
 * This is the first island, and every interaction's island follows its pattern:
 *
 * - **Layout.** One `"use client"` module per interaction, `#plate/ui/<kind>/<kind>.tsx`, exporting
 *   the island and its props interface, and beside it `#plate/ui/<kind>/labels.ts`, the catalog's
 *   message for each text the island writes, which the server fills (`labelsOf` in
 *   `#plate/ui/item/interactions/labels.ts`). Kinds that write the same texts share one record, as
 *   Choice and Hot Text share `#plate/ui/picks/labels.ts`. A server component renders the island
 *   inside its own Suspense boundary; nothing else in the module runs on the server.
 * - **Props.** One exported interface, every member serializable across the server and client
 *   boundary: strings, numbers, booleans, arrays, plain objects, and `ReactNode` content the server
 *   rendered (a choice's text, image or MathML; a prompt). No functions, no seed, no correct
 *   response. The server has already shuffled the choices, written QTI's defaults, resolved the
 *   name and read what the attributes mean together, as Choice's {@link Picks} or a count's `Limit`
 *   (`#plate/ui/limit.ts`), so an island reads facts and never decides what an unwritten attribute
 *   means. What the author wrote on the root and what names the group arrive as one value each
 *   (`Authored` in `#plate/ui/attributes.ts`), which the island spreads.
 * - **Labels.** Every text plate writes that the child hears or reads arrives in a `labels` prop of
 *   plain strings, from plate's message catalog or from the author's own message. A label's
 *   `{placeholders}` hold values only the island knows; the island fills them, and each label's
 *   comment names them.
 * - **The response.** An island reads and writes only its own response, through `useResponse(name)`,
 *   as plate's lexical forms. It renders no `name` on its controls and no hidden input: the item's
 *   `<Responses>` posts every entry.
 * - **Parts.** plate's parts carry `data-slot="plate-<kind>-<part>"`, beside the UI SDK components'
 *   own slots; state is a `data-*` attribute. No `class` but the author's and no `style`: the
 *   item's stylesheet styles the slots, and the page's content security policy refuses inline
 *   styles.
 * - **Refusals.** A change the interaction refuses is cancelled before any state changes, announced
 *   with UI SDK's `announce`, and shown beside the controls, so a child who cannot read the screen
 *   and one who cannot hear it both learn why nothing happened. No control is disabled to stop it.
 *
 * Review and solution render on the server with the same parts and no island.
 *
 * @module
 */
import type { ReactNode } from "react";
import type { Authored, Named } from "#plate/ui/attributes.ts";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import type { picksKeys } from "#plate/ui/picks/labels.ts";
import { PickOption, PicksGroup } from "#plate/ui/picks/picks-group.tsx";
import type { Picks } from "#plate/ui/picks/picks.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import type { Spoken } from "#plate/ui/read-aloud/spoken.tsx";

/**
 * What the server gives a Choice's island, as QTI's `qti-choice-interaction` and plate's
 * presentation of it say: what the author wrote on its root and what names its group
 * (`Authored`), always something, and its own.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_ChoiceInteraction
 */
export interface ChoiceProps extends Authored<Named> {
  /**
   * The choices in display order: the server's order, shuffled already when the interaction
   * shuffles. `content` is the choice's server-rendered content, inside the option's `label`, so it
   * holds no `label` of its own and no interactive element. `label` names the choice's control
   * where its content names nothing, an image with no alternative text alone: "Choice n of
   * count" (`optionName` in `#plate/ui/picks/names.ts`); none where the content names it.
   * `readAloud` is read-aloud's control for the catalog the choice references, absent where the
   * candidate hears none (`#plate/ui/read-aloud/read-aloud.tsx`).
   */
  readonly choices: readonly (Spoken & {
    readonly content: ReactNode;
    readonly identifier: string;
    readonly label: string | undefined;
  })[];
  readonly labels: Labels<typeof picksKeys>;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * `orientation`: `vertical` when the author wrote none, the XSD's default (5.30.4). A layout hint
   * the stylesheet reads from the root's `data-orientation`; arrow keys move both ways either way.
   */
  readonly orientation: "horizontal" | "vertical";
  /**
   * How many choices the child picks (QTI 3.0 information model 5.30.2), as the server reads it
   * (`picksOf` in `#plate/ui/picks/picks.ts`): one as a radio group, where a pick replaces the
   * last, else checkboxes, a pick past `max-choices` refused. The response is a bag: the island
   * posts each picked identifier once, which a bag does not read in any order.
   */
  readonly picks: Picks;
  /**
   * The `qti-prompt`, server-rendered, under the id that names the group; undefined where the
   * interaction has none.
   */
  readonly prompt: Prompt | undefined;
}

/**
 * Render a Choice for the child to answer, holding its response in the item's `<Responses>`: a
 * picks group (`PicksGroup` in `#plate/ui/picks/picks-group.tsx`), which owns the response, the
 * refusal and its announcement.
 *
 * The parts:
 *
 * - `plate-choice`, the root, with the author's `data-*` and `class`, `data-orientation`, and
 *   `data-full` while checkboxes with a limit hold `max-choices` identifiers;
 * - `plate-prompt`, the prompt, where the interaction has one;
 * - UI SDK's `radio-group` or `checkbox-group`, named by `naming`;
 * - `plate-choice-option`, one `label` per choice, with `data-selected` while it is picked. It wraps
 *   the UI SDK `radio` or `checkbox` button and the choice's content, so a press anywhere on it
 *   presses the control: the whole option is the hit target, and the stylesheet gives it the K–3
 *   minimum height of 64 px whatever the content, an image or MathML included;
 * - `plate-choice-content`, the choice's content;
 * - `plate-choice-row`, for a choice with a read-aloud control, holding its `plate-choice-option` and
 *   then the control: a `label` may hold no labelable element but its own control (HTML, the
 *   `label` element), so the control's button stands beside the option, never in it;
 * - `plate-choice-limit`, the `limit` label, shown from a refused pick until the next accepted one.
 *
 * @param props The interaction, its response's entry name and its labels ({@link ChoiceProps}).
 * @returns The Choice, its controls bound to the response.
 */
export const Choice = (props: ChoiceProps) => {
  const { choices, labels, name, naming, orientation, picks, prompt, root } = props;

  return (
    <PicksGroup
      before={<PromptPart prompt={prompt} />}
      limit={labels.limit}
      naming={naming}
      picks={picks}
      response={name}
      root={{ ...root, "data-orientation": orientation, "data-slot": "plate-choice" }}
    >
      {choices.map(({ content, readAloud, ...option }) => {
        const pick = (
          <PickOption key={option.identifier} {...option} slot="plate-choice-option">
            <span data-slot="plate-choice-content">{content}</span>
          </PickOption>
        );

        return readAloud === undefined ? (
          pick
        ) : (
          <div data-slot="plate-choice-row" key={option.identifier}>
            {pick}
            {readAloud}
          </div>
        );
      })}
    </PicksGroup>
  );
};
