/**
 * Hot Text (Q-11) in the server shell: what renders a `qti-hottext-interaction`'s payload node, its
 * island in `answering` and its server markup in `review` and `solution`.
 *
 * Its passage is the author's block content, written through the shell's walk with every hottext
 * where the author put it, at any depth (plate's reading 38): the walk hands this file each
 * hottext ({@link hottextTag}), an element outside the HTML subset, through `own`, and the payload
 * gives each one's part by its path (`HottextPart` in `#plate/interactions/hottext.ts`): a choice
 * the child may pick, or plain text, "simply part of the surrounding material" (QTI 3.0
 * information model 5.65).
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { ReactNode } from "react";
import { hottextTag } from "#plate/interactions/hottext.ts";
import type { HottextPart } from "#plate/interactions/hottext.ts";
import type { PayloadOf } from "#plate/model/interactions.ts";
import type { Paired } from "#plate/payload.ts";
import { Hottext } from "#plate/ui/hottext/hottext.tsx";
import { elementsIn } from "#plate/ui/item/content.tsx";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { spokenOf } from "#plate/ui/item/interactions/answering.tsx";
import {
  controlNameOf,
  labelsOf,
  ownName,
  promptAt,
  rootOf,
} from "#plate/ui/item/interactions/labels.ts";
import { markingOf } from "#plate/ui/item/interactions/marks.ts";
import { picksKeys } from "#plate/ui/picks/labels.ts";
import { marksOf } from "#plate/ui/picks/marks.ts";
import { optionName } from "#plate/interactions/option-names.ts";
import { PickOption } from "#plate/ui/picks/picks-group.tsx";
import { groupSlotOf, picksOf } from "#plate/interactions/picks.ts";
import { ReviewedPick } from "#plate/ui/picks/review.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";
import { spokenBeside } from "#plate/ui/read-aloud/spoken.tsx";

/**
 * One hottext the passage shows: its `qti-hottext` element's path and its part.
 */
type Shown = readonly [path: string, part: HottextPart];

/**
 * Give the hottexts the passage shows, in document order: each `qti-hottext` the shell's walk
 * reaches, with its part. A hottext below an element the walk drops is not shown, so it is no
 * choice and is counted among none.
 *
 * @param node The Hot Text's payload: its passage and each hottext's part.
 * @returns The shown hottexts.
 */
const shownIn = (node: PayloadOf<"hottext">): readonly Shown[] =>
  elementsIn(node.content, false).flatMap((element): readonly Shown[] => {
    const part = element.tag === hottextTag ? node.hottexts.get(element.path) : undefined;

    return part === undefined ? [] : [[element.path, part]];
  });

/**
 * Write a hottext's passage where phrasing content stands, as the body's content is written. A
 * hottext inside it, which QTI admits nowhere ("It must not contain any nested interactions or
 * other hottext areas", 5.65) and which no response may name, is written the same way, as text.
 *
 * @param part The hottext's part.
 * @param node The Hot Text's payload: each hottext's part.
 * @param context What the shell knows: its content walk.
 * @returns The content.
 */
const passageOf = (
  part: HottextPart,
  node: PayloadOf<"hottext">,
  context: Pick<IslandContext, "content">,
): ReactNode =>
  context.content(part.passage, {
    own: (inner) => {
      const nested = inner.tag === hottextTag ? node.hottexts.get(inner.path) : undefined;

      return nested === undefined ? undefined : passageOf(nested, node, context);
    },
    position: "phrasing",
  });

/**
 * Write the passage through the shell's walk, each shown hottext as `placed` writes it.
 *
 * @param node The Hot Text's payload: its passage.
 * @param placed What each shown hottext stands as, by its element's path.
 * @param context What the shell knows: its content walk.
 * @returns The passage.
 */
const passageWith = (
  node: PayloadOf<"hottext">,
  placed: ReadonlyMap<string, ReactNode>,
  context: Pick<IslandContext, "content">,
): ReactNode =>
  context.content(node.content, {
    own: (element) => (element.tag === hottextTag ? placed.get(element.path) : undefined),
    position: "flow",
  });

/**
 * Render a Hot Text's island: the passage through the shell's walk, a `PickOption` wherever a
 * hottext the child may pick stands, beside read-aloud's control for the catalog it references in
 * `plate-hottext-spoken` where the candidate hears it, and the passage alone of each other.
 *
 * @param paired The Hottext and its payload node.
 * @param paired.model The redacted model node the payload node was given for: the bound response's
 *   cardinality, `max-choices`, and the author's `data-*` and `data-max-selections-message`.
 * @param paired.payload Its payload node, as its module's `redact` gave it: its passage, prompt and
 *   names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"hottext">,
  context: IslandContext,
): ReactNode => {
  const { locale } = context;
  const shown = shownIn(node);
  const count = shown.filter(([, part]) => part.kind === "choice").length;
  const [, placed] = Arr.mapAccum(
    shown,
    0,
    (index, [path, part]): readonly [number, readonly [string, ReactNode]] => {
      const content = passageOf(part, node, context);

      return part.kind === "plain"
        ? [index, [path, content]]
        : [
            index + 1,
            [
              path,
              spokenBeside(
                <PickOption
                  identifier={part.identifier}
                  key={path}
                  label={optionName(part.passage, { count, n: index + 1 }, Option.none(), locale)}
                  slot="plate-hottext-choice"
                >
                  <span data-slot="plate-hottext-content">{content}</span>
                </PickOption>,
                spokenOf(part, index + 1, "readAloudChoice", context),
                { key: path, slot: "plate-hottext-spoken" },
              ),
            ],
          ];
    },
  );

  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <Hottext
      labels={labelsOf(picksKeys, locale, { limit: model.messages.max })}
      name={node.formName}
      naming={controlNameOf(prompt, node, ownName(model, context), context)}
      picks={picksOf(model)}
      prompt={prompt}
      root={rootOf(model, context)}
    >
      {passageWith(node, new Map(placed), context)}
    </Hottext>
  );
};

/**
 * Render a Hot Text's review or solution: its passage with each hottext the child may pick where it
 * stands, as the review shows it (`marksOf` in `#plate/ui/picks/marks.ts`), picked or not and
 * marked where the review marks it, so the child reviews the picks in their sentence.
 *
 * @param paired The Hottext and its payload node.
 * @param paired.model The redacted model node the payload node was given for: the bound response's
 *   cardinality and `max-choices`, which make the group a radio or a checkbox group, and the
 *   author's `data-*`.
 * @param paired.payload Its payload node, as its module's `redact` gave it: its passage, prompt,
 *   names and the identifiers it shows picked, the candidate's in a review and the correct ones in
 *   a solution.
 * @param context What the shell knows of the item and the render: what it shows, which marks the
 *   picks or not.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"hottext">,
  context: ReviewContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);
  const reviewed = marksOf(node.restore, markingOf(node.response, context));
  const placed = new Map(
    shownIn(node).map(([path, part]): readonly [string, ReactNode] => {
      const content = passageOf(part, node, context);

      return [
        path,
        part.kind === "plain" ? (
          content
        ) : (
          <ReviewedPick
            element="span"
            key={path}
            locale={context.locale}
            review={reviewed(part.identifier)}
            slot="plate-hottext-choice"
          >
            <span data-slot="plate-hottext-content">{content}</span>
          </ReviewedPick>
        ),
      ];
    }),
  );

  return (
    <div {...rootOf(model, context)} data-slot="plate-hottext">
      <PromptPart prompt={prompt} />
      <div
        {...controlNameOf(prompt, node, ownName(model, context), context)}
        data-slot={groupSlotOf(picksOf(model))}
        role="group"
      >
        {passageWith(node, placed, context)}
      </div>
    </div>
  );
};
