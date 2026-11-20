/**
 * Text Entry (Q-6) in the server shell: what renders a `qti-text-entry-interaction`'s payload node,
 * its island in `answering` (`#plate/ui/text-entry/text-entry.tsx`) and its server markup in
 * `review` and `solution`. It stands where phrasing content does, inside the author's sentence.
 *
 * The island takes its binding, `base`, `expected-length`, `pattern-mask` with the author's
 * `data-patternmask-message` in place of the catalog's, its placeholder, its names and the host's
 * `textEntryKeypad`. The review shows the text in a read-only input, named as the island names its
 * own, and, against the host's solution, its mark; its {@link answer}, the right answer when the
 * answer is not right, the body walk writes after the block that holds the sentence.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { ReactNode } from "react";
import { writeIn } from "#plate/interactions/text-entry.ts";
import { isNull, isRecordValue, match } from "#plate/model/values.ts";
import type { ResponseValue } from "#plate/model/values.ts";
import type { Paired } from "#plate/payload.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { ControlReview, controlAnswer } from "#plate/ui/item/interactions/control-mark.tsx";
import type { ControlMark } from "#plate/ui/item/interactions/control-mark.tsx";
import { hintOf } from "#plate/ui/item/interactions/facts.ts";
import { controlNameOf, labelsOf, ownName, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { markingOf, missedShown } from "#plate/ui/item/interactions/marks.ts";
import type { Marking } from "#plate/ui/item/interactions/marks.ts";
import { textEntryKeys } from "#plate/ui/text-entry/labels.ts";
import { TextEntry } from "#plate/ui/text-entry/text-entry.tsx";

/**
 * Render a Text Entry's island.
 *
 * @param paired The Text Entry.
 * @param paired.model Its model node: the author's `data-*`, `pattern-mask` and
 *   `data-patternmask-message`, and the control plate names when the author named it by nothing.
 * @param paired.payload Its payload: its binding, `base`, `expected-length`, placeholder and names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"text-entry">,
  context: IslandContext,
): ReactNode => (
  <TextEntry
    base={node.base}
    baseType={node.baseType}
    expectedLength={hintOf(node.expectedLength)}
    keypad={context.textEntryKeypad}
    labels={labelsOf(textEntryKeys, context.locale, { pattern: model.patternMaskMessage })}
    name={node.formName}
    naming={controlNameOf(undefined, node, ownName(model, context), context)}
    patternMask={Option.getOrUndefined(model.patternMask)}
    placeholder={Option.getOrUndefined(node.placeholder)}
    root={rootOf(model, context)}
  />
);

/**
 * Mark the value a Text Entry's review shows against the correct response, compared as
 * `qti-match` compares them ({@link match}). Against a correct response, the right answer the
 * review writes for a wrong or missing one is its first value, an integer written in the Control's
 * `base`, the base its text is read in; a review that marks the candidate's own answer alone writes
 * none (`missedShown`).
 *
 * @param shown The value the review shows, none for no entry: NULL and a record, whose
 *   `stringValue` the Control shows but `qti-match` does not compare, hold no answer to mark.
 * @param marking How the review marks the response.
 * @param base The Text Entry's `base`.
 * @returns The mark.
 */
const markOf = (shown: ResponseValue | undefined, marking: Marking, base: number): ControlMark => {
  if (marking.kind !== "against") {
    return { kind: "unmarked" };
  }

  const answer = Arr.head(
    missedShown(marking, marking.correct.values).map((single) => writeIn(single, base)),
  );

  if (shown === undefined || isRecordValue(shown) || isNull(shown)) {
    return { answer, kind: "unanswered" };
  }

  return match(shown, marking.correct) ? { kind: "right" } : { answer, kind: "wrong" };
};

/**
 * Give the mark a Text Entry's review writes, against what the render marks it against.
 *
 * @param paired The Text Entry.
 * @param paired.payload Its payload: its response and its `base`.
 * @param context What the shell knows: the value shown, and what the render marks it against.
 * @returns The mark.
 */
const shownMarkOf = (
  { payload: node }: Paired<"text-entry">,
  context: ReviewContext,
): ControlMark =>
  markOf(context.values.get(node.response), markingOf(node.response, context), node.base);

/**
 * Render a Text Entry's review: its text in a read-only input, named as the island names its own,
 * and its mark.
 *
 * @param paired The Text Entry.
 * @param paired.model Its model node: the author's `data-*`, and the control plate names when the
 *   author named it by nothing.
 * @param paired.payload Its payload: the text it shows, its `base` and its names.
 * @param context What the shell knows: the value shown, and what the render marks it against.
 * @returns The markup.
 */
export const review = (paired: Paired<"text-entry">, context: ReviewContext): ReactNode => {
  const { model, payload: node } = paired;

  return (
    <ControlReview
      locale={context.locale}
      mark={shownMarkOf(paired, context)}
      root={rootOf(model, context)}
      slot="plate-text-entry"
    >
      <input
        {...controlNameOf(undefined, node, ownName(model, context), context)}
        data-slot="input"
        readOnly
        size={hintOf(node.expectedLength)}
        type="text"
        value={node.restore}
      />
    </ControlReview>
  );
};

/**
 * Render a Text Entry's right answer, which the body walk writes after the block that holds it.
 *
 * @param paired The Text Entry.
 * @param context What the shell knows: the value shown, and what the render marks it against.
 * @returns The `plate-text-entry-answer` part where the answer shown is not right, else nothing.
 */
export const answer = (paired: Paired<"text-entry">, context: ReviewContext): ReactNode =>
  controlAnswer(shownMarkOf(paired, context), "plate-text-entry", context.locale);
