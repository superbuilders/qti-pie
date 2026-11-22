/**
 * Choice (Q-2) in the server shell: what renders a `qti-choice-interaction`'s payload node, its
 * island in `answering` (`#plate/ui/choice/choice.tsx`) and its server markup in `review` and
 * `solution`.
 *
 * The island takes its choices as presented, shuffled already by the core with the host-named
 * instance, each with read-aloud's control for the catalog it references where the candidate hears
 * it read aloud, named by the choice's place as presented, and how many the child picks, read from
 * its binding and `max-choices` by the one rule every picks group follows (`picksOf` in
 * `#plate/ui/picks/picks.ts`). The review shows the options with each picked one `data-selected`,
 * and, by the host's marks, each marked one `data-mark` (`#plate/ui/picks/marks.ts`).
 *
 * @module
 */
import type { ReactNode } from "react";
import type { Paired } from "#plate/payload.ts";
import { Choice } from "#plate/ui/choice/choice.tsx";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { contentOf, spokenOf } from "#plate/ui/item/interactions/answering.tsx";
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
import { optionName } from "#plate/ui/picks/names.ts";
import { message } from "#plate/messages.ts";
import { groupSlotOf, instructionOf, picksOf } from "#plate/ui/picks/picks.ts";
import { ReviewedPick } from "#plate/ui/picks/review.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";

/**
 * Render a Choice's island.
 *
 * @param paired The Choice.
 * @param paired.model Its model node: the author's `data-*` and `data-max-selections-message`.
 * @param paired.payload Its payload: its choices as presented, its binding, `max-choices`, prompt
 *   and names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"choice">,
  context: IslandContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <Choice
      choices={node.choices.map((choice, index) => ({
        content: contentOf(choice.content, "phrasing", context),
        identifier: choice.identifier,
        label: optionName(
          choice.content,
          { count: node.choices.length, n: index + 1 },
          context.locale,
        ),
        ...spokenOf(choice, index + 1, "readAloudChoice", context),
      }))}
      instruction={
        context.picksInstruction ? message(context.locale, instructionOf(picksOf(node))) : undefined
      }
      labels={labelsOf(picksKeys, context.locale, { limit: model.messages.max })}
      name={node.formName}
      naming={controlNameOf(prompt, node, ownName(model, context), context)}
      orientation={node.orientation}
      picks={picksOf(node)}
      prompt={prompt}
      root={rootOf(model, context)}
    />
  );
};

/**
 * Render a Choice's review or solution: its options, each as the review shows it (`marksOf` in
 * `#plate/ui/picks/marks.ts`), picked or not, and marked where the review marks it.
 *
 * @param paired The Choice.
 * @param paired.model Its model node: the author's `data-*`.
 * @param paired.payload Its payload: its choices as presented, its prompt and names, and the
 *   identifiers it shows picked.
 * @param context What the shell knows: what the render shows, which marks the picks or not.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"choice">,
  context: ReviewContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);
  const reviewed = marksOf(node.restore, markingOf(node.response, context));

  return (
    <div {...rootOf(model, context)} data-orientation={node.orientation} data-slot="plate-choice">
      <PromptPart prompt={prompt} />
      {context.picksInstruction ? (
        <p data-slot="plate-choice-instruction">
          {message(context.locale, "picksInstructionReview")}
        </p>
      ) : null}
      <div
        {...controlNameOf(prompt, node, ownName(model, context), context)}
        data-slot={groupSlotOf(picksOf(node))}
        role="group"
      >
        {node.choices.map((choice) => (
          <ReviewedPick
            key={choice.identifier}
            element="div"
            locale={context.locale}
            review={reviewed(choice.identifier)}
            slot="plate-choice-option"
          >
            <span data-slot="plate-choice-content">
              {context.content(choice.content, { position: "phrasing" })}
            </span>
          </ReviewedPick>
        ))}
      </div>
    </div>
  );
};
