/**
 * Inline Choice (Q-5) in the server shell: what renders a `qti-inline-choice-interaction`'s payload
 * node, its island in `answering` (`#plate/ui/inline-choice/inline-choice.tsx`) and its server
 * markup in `review` and `solution`. It stands where phrasing content does, inside the author's
 * sentence.
 *
 * The island takes its choices as presented, shuffled already by the core with the host-named
 * instance, each named by its text, its `qti-label` where that names something, and its
 * placeholder, the author's `data-prompt` in place of the catalog's. The review shows the choice it
 * holds in the place of its trigger and, by the host's marks, its mark; its
 * {@link answer}, the right choice when the answer is not right, the body walk writes after the
 * block that holds the sentence.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { ReactNode } from "react";
import type { Locale } from "#plate/messages.ts";
import { format } from "#plate/model/values.ts";
import type { Paired } from "#plate/payload.ts";
import { InlineChoice } from "#plate/ui/inline-choice/inline-choice.tsx";
import type { TriggerName } from "#plate/ui/inline-choice/inline-choice.tsx";
import { inlineChoiceKeys } from "#plate/ui/inline-choice/labels.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { contentOf } from "#plate/ui/item/interactions/answering.tsx";
import {
  ControlReview,
  controlAnswer,
  controlMarkOf,
} from "#plate/ui/item/interactions/control-mark.tsx";
import type { ControlMark } from "#plate/ui/item/interactions/control-mark.tsx";
import { controlNameOf, labelsOf, ownName, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { markingOf } from "#plate/ui/item/interactions/marks.ts";
import type { Marking } from "#plate/ui/item/interactions/marks.ts";
import { choiceText, namesSomething } from "#plate/content/text.ts";

/**
 * Give what names an Inline Choice's trigger: its `qti-label`'s content, where that names
 * something; else the author's scoped `aria-labelledby`, else the author's `aria-label`, else
 * plate's own name for a control the author named by nothing.
 *
 * @param paired The Inline Choice.
 * @param paired.model Its model node, which plate numbers among the controls it names.
 * @param paired.payload Its payload: its Label and the author's names.
 * @param context What the page may know of the render.
 * @returns The trigger's name.
 */
const triggerOf = (
  { model, payload: node }: Paired<"inline-choice">,
  context: IslandContext,
): TriggerName =>
  Option.match(node.label.pipe(Option.filter((nodes) => namesSomething(nodes, context.locale))), {
    onNone: () => ({
      kind: "named",
      naming: controlNameOf(undefined, node, ownName(model, context), context),
    }),
    onSome: (label) => ({ content: contentOf(label, "phrasing", context), kind: "label" }),
  });

/**
 * Render an Inline Choice's island. Each choice's `label` is its text, else its image's
 * alternative text, else "Choice n of count", what typing on the trigger finds.
 *
 * @param paired The Inline Choice.
 * @param paired.model Its model node: the author's `data-*` and `required`.
 * @param paired.payload Its payload: its choices as presented, its Label, `data-prompt` and names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (paired: Paired<"inline-choice">, context: IslandContext): ReactNode => {
  const { model, payload: node } = paired;
  const { locale } = context;

  return (
    <InlineChoice
      choices={node.choices.map((choice, index) => ({
        content: contentOf(choice.content, "phrasing", context),
        identifier: choice.identifier,
        label: choiceText(
          choice.content,
          Option.none(),
          { count: node.choices.length, n: index + 1 },
          locale,
        ),
      }))}
      labels={labelsOf(inlineChoiceKeys, locale, { prompt: node.placeholder })}
      required={model.required}
      response={node.declared}
      root={rootOf(model, context)}
      trigger={triggerOf(paired, context)}
    />
  );
};

/**
 * Mark the choice an Inline Choice's review shows, by the marks the host handed for its response
 * ({@link controlMarkOf}). The right answer the review writes for a wrong or missing pick is the
 * text of the choice handed `missed`, "Choice n of count" where its content shows none, and none
 * where the interaction does not present it.
 *
 * @param choices The Inline Choice's choices as presented.
 * @param shown The choice its review shows picked, none where it shows its placeholder.
 * @param marking The marks handed for the response.
 * @param locale The locale of plate's own text.
 * @returns The mark.
 */
const markOf = (
  choices: Paired<"inline-choice">["payload"]["choices"],
  shown: Option.Option<{ readonly identifier: string }>,
  marking: Marking,
  locale: Locale,
): ControlMark =>
  controlMarkOf(marking, Option.isSome(shown), (missed) =>
    Arr.head(missed.map(format)).pipe(
      Option.flatMap((identifier) =>
        Arr.findFirst(choices, (choice, at) =>
          choice.identifier === identifier
            ? Option.some(
                choiceText(
                  choice.content,
                  Option.none(),
                  { count: choices.length, n: at + 1 },
                  locale,
                ),
              )
            : Option.none(),
        ),
      ),
    ),
  );

/**
 * Give the choice an Inline Choice's review shows picked.
 *
 * @param node Its payload: its choices as presented and the identifier it shows.
 * @returns The choice, none where it shows its placeholder.
 */
const shownOf = (
  node: Paired<"inline-choice">["payload"],
): Option.Option<Paired<"inline-choice">["payload"]["choices"][number]> =>
  node.restore.pipe(
    Option.flatMap((identifier) =>
      Arr.findFirst(node.choices, (choice) => choice.identifier === identifier),
    ),
  );

/**
 * Render an Inline Choice's review: the choice it shows in the place of its trigger, and its mark.
 *
 * @param paired The Inline Choice.
 * @param paired.model Its model node: the author's `data-*`.
 * @param paired.payload Its payload: its choices as presented, its Label and the identifier it
 *   shows.
 * @param context What the shell knows.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"inline-choice">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const shown = shownOf(node);
  const label = node.label.pipe(Option.filter((nodes) => namesSomething(nodes, locale)));

  return (
    <ControlReview
      locale={locale}
      mark={markOf(node.choices, shown, markingOf(node.response, context), locale)}
      root={rootOf(model, context)}
      slot="plate-inline-choice"
    >
      {Option.isSome(label) ? (
        <span data-slot="select-label">
          {context.content(label.value, { position: "phrasing" })}
        </span>
      ) : null}
      <span data-slot="select-trigger">
        {Option.match(shown, {
          onNone: () => (
            <span data-placeholder="" data-slot="select-value">
              {labelsOf(inlineChoiceKeys, locale, { prompt: node.placeholder }).prompt}
            </span>
          ),
          onSome: (choice) => (
            <span data-slot="select-value">
              {context.content(choice.content, { position: "phrasing" })}
            </span>
          ),
        })}
      </span>
    </ControlReview>
  );
};

/**
 * Render an Inline Choice's right answer, which the body walk writes after the block that holds
 * it.
 *
 * @param paired The Inline Choice.
 * @param paired.payload Its payload: its choices as presented and the identifier it shows.
 * @param context What the shell knows.
 * @returns The `plate-inline-choice-answer` part where the choice shown is not right, else nothing.
 */
export const answer = (
  { payload: node }: Paired<"inline-choice">,
  context: ReviewContext,
): ReactNode =>
  controlAnswer(
    markOf(node.choices, shownOf(node), markingOf(node.response, context), context.locale),
    "plate-inline-choice",
    context.locale,
  );
