/**
 * Choice (Q-2) in the server shell: what renders a `qti-choice-interaction`'s payload node, its
 * island in `answering` (`#plate/ui/choice/choice.tsx`) and its server markup in `review` and
 * `solution`. The standard renderer writes nothing between the prompt and the options; a renderer
 * an extension composes from {@link leadIsland} and {@link leadReview} writes its own lead there,
 * and is otherwise this one.
 *
 * The island takes its choices as presented, shuffled already by the core with the host-named
 * instance, each with read-aloud's control for the catalog it references where the candidate hears
 * it read aloud, named by the choice's place as presented, and how many the child picks, read from
 * its binding and `max-choices` by the one rule every picks group follows (`picksOf` in
 * `#plate/interactions/picks.ts`). The review shows the options with each picked one
 * `data-selected`, and, by the host's marks, each marked one `data-mark`
 * (`#plate/ui/picks/marks.ts`).
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
import { choiceLabel, optionName } from "#plate/interactions/option-names.ts";
import { groupSlotOf, picksOf } from "#plate/interactions/picks.ts";
import { ReviewedPick } from "#plate/ui/picks/review.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";

/**
 * Render a Choice's island, with what its renderer writes between the prompt and the options.
 *
 * @param paired The Choice.
 * @param paired.model Its model node: the author's `data-*` and `data-max-selections-message`.
 * @param paired.payload Its payload: its choices as presented, its binding, `max-choices`, prompt
 *   and names.
 * @param context What the page may know of the render.
 * @param lead What the renderer writes between the prompt and the options, server markup; `null`
 *   for nothing.
 * @returns The island.
 */
export const leadIsland = (
  { model, payload: node }: Paired<"choice">,
  context: IslandContext,
  lead: ReactNode,
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
          choiceLabel(context.className, index + 1),
          context.locale,
        ),
        ...spokenOf(choice, index + 1, "readAloudChoice", context),
      }))}
      labels={labelsOf(picksKeys, context.locale, { limit: model.messages.max })}
      lead={lead}
      naming={controlNameOf(prompt, node, ownName(model, context), context)}
      orientation={node.orientation}
      picks={picksOf(node)}
      prompt={prompt}
      response={node.declared}
      root={rootOf(model, context)}
    />
  );
};

/**
 * Render a Choice's island as plate's standard renderer does, with nothing between the prompt and
 * the options.
 *
 * @param paired The Choice.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (paired: Paired<"choice">, context: IslandContext): ReactNode =>
  leadIsland(paired, context, null);

/**
 * Render a Choice's review or solution, with what its renderer writes between the prompt and the
 * options: its options, each as the review shows it (`marksOf` in `#plate/ui/picks/marks.ts`),
 * picked or not, and marked where the review marks it.
 *
 * @param paired The Choice.
 * @param paired.model Its model node: the author's `data-*`.
 * @param paired.payload Its payload: its choices as presented, its prompt and names, and the
 *   identifiers it shows picked.
 * @param context What the shell knows: what the render shows, which marks the picks or not.
 * @param lead What the renderer writes between the prompt and the options, server markup; `null`
 *   for nothing.
 * @returns The markup.
 */
export const leadReview = (
  { model, payload: node }: Paired<"choice">,
  context: ReviewContext,
  lead: ReactNode,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);
  const reviewed = marksOf(node.restore, markingOf(node.response, context));

  return (
    <div {...rootOf(model, context)} data-orientation={node.orientation} data-slot="plate-choice">
      <PromptPart prompt={prompt} />
      {lead}
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

/**
 * Render a Choice's review or solution as plate's standard renderer does, with nothing between the
 * prompt and the options.
 *
 * @param paired The Choice.
 * @param context What the shell knows: what the render shows, which marks the picks or not.
 * @returns The markup.
 */
export const review = (paired: Paired<"choice">, context: ReviewContext): ReactNode =>
  leadReview(paired, context, null);
