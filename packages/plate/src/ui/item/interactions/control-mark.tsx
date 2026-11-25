/**
 * A Control's review: the mark a Text Entry's or an Inline Choice's review writes on the one answer
 * its Control shows, against the correct response, and the right answer it writes where the answer
 * shown is not right.
 *
 * The parts, beyond the Control's own:
 *
 * - The Control's root, with `data-mark` `right` or `wrong` on an answer marked, and its `plate-mark`
 *   part, the mark's words for a screen reader;
 * - `plate-<kind>-answer`, a `p`: "Right answer: …", with `data-mark="missed"`. The body walk writes
 *   it after the block that holds the Control (`Walk.answer` in `#plate/ui/item/content.tsx`),
 *   never beside the Control: a Control stands inside the author's sentence, and a frame written
 *   there broke the sentence across lines around it.
 *
 * @module
 */
import { Option } from "effect";
import type { ReactNode } from "react";
import { message } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import type { DataRoot } from "#plate/ui/attributes.ts";
import type { Single } from "#plate/model/values.ts";
import { matchedWhole, valuesMarked } from "#plate/ui/item/interactions/marks.ts";
import type { AnswerMark, Marking } from "#plate/ui/item/interactions/marks.ts";
import { markPart } from "#plate/ui/item/interactions/words.tsx";
import type { Words } from "#plate/ui/item/interactions/words.tsx";

/**
 * A review's mark on one answer a part shows whole, a Control's, a Slider's value or a Portable
 * Custom Interaction's value: `unmarked` where the review marks nothing, as a solution does and a
 * review with nothing to mark against; else `right` where the answer matches the correct response
 * as `qti-match` compares them, `wrong` where it does not, and `unanswered` where the part shows
 * none. `wrong` and `unanswered` carry the right answer as the review writes it: a Control's as
 * text ({@link controlAnswer}), a Slider's as the correct number's text, a PCI's as the correct
 * value; none where it cannot write one, or where the review marks the candidate's own answer alone
 * and reveals no correct response (`missedShown` in `#plate/ui/item/interactions/marks.ts`).
 *
 * @template A The right answer, as the review writes it.
 */
export type ControlMark<A = string> =
  | { readonly answer: Option.Option<A>; readonly kind: "unanswered" }
  | { readonly answer: Option.Option<A>; readonly kind: "wrong" }
  | { readonly kind: "right" }
  | { readonly kind: "unmarked" };

/**
 * Give the mark a review writes on the one answer a part shows whole, from the marks the host
 * handed for its response: `unmarked` where it handed none; `unanswered` where the part shows no
 * answer; else `right` where the response matches its correct response whole (no part marked
 * `wrong` or `missed`, `matchedWhole`), and `wrong` where it does not. `wrong` and `unanswered`
 * carry the right answer the review writes from the values handed `missed`, which a review that
 * withholds the solution draws none of.
 *
 * @template A The right answer, as the review writes it.
 * @param marking The marks handed for the response.
 * @param shows Whether the part shows an answer.
 * @param answerOf Write the right answer from the values handed `missed`, none for none.
 * @returns The mark.
 */
export const controlMarkOf = <A,>(
  marking: Marking,
  shows: boolean,
  answerOf: (missed: readonly Single[]) => Option.Option<A>,
): ControlMark<A> => {
  if (marking.kind !== "marked") {
    return { kind: "unmarked" };
  }

  const answer = answerOf(valuesMarked(marking, "missed"));

  if (!shows) {
    return { answer, kind: "unanswered" };
  }

  return matchedWhole(marking) ? { kind: "right" } : { answer, kind: "wrong" };
};

/**
 * The root `data-slot` of a Control a review marks, which names its answer's part.
 */
type ControlSlot = "plate-inline-choice" | "plate-text-entry";

/**
 * What each mark writes on the part that shows the answer, a Control's root or a value: its
 * `data-mark`, none where it marks no answer shown, and its words.
 */
export const controlParts = {
  right: { mark: "right", words: "right" },
  unanswered: { mark: undefined, words: "silent" },
  unmarked: { mark: undefined, words: "silent" },
  wrong: { mark: "wrong", words: "wrong" },
} as const satisfies Readonly<
  Record<ControlMark["kind"], { readonly mark: AnswerMark | undefined; readonly words: Words }>
>;

/**
 * Give the right answer a mark writes.
 *
 * @param mark The mark.
 * @returns The answer, none for a mark that writes none.
 */
const answerOf = (mark: ControlMark): Option.Option<string> => {
  switch (mark.kind) {
    case "unanswered":
    case "wrong": {
      return mark.answer;
    }
    case "right":
    case "unmarked": {
      return Option.none();
    }
  }
};

/**
 * Render a Control's review: its root, marked, holding the Control's parts and the mark's words.
 *
 * @param props The review.
 * @param props.children The Control's parts, as the review shows them.
 * @param props.locale The locale of plate's own text.
 * @param props.mark The mark on the answer the Control shows.
 * @param props.root What the author wrote on the interaction's root.
 * @param props.slot The root's `data-slot`.
 * @returns The markup.
 */
export const ControlReview = (props: {
  readonly children: ReactNode;
  readonly locale: Locale;
  readonly mark: ControlMark;
  readonly root: DataRoot;
  readonly slot: ControlSlot;
}): ReactNode => {
  const { children, locale, mark, root, slot } = props;

  return (
    <span {...root} data-mark={controlParts[mark.kind].mark} data-slot={slot}>
      {children}
      {markPart(controlParts[mark.kind].words, locale)}
    </span>
  );
};

/**
 * Render the right answer a Control's mark carries, which the body walk writes after the block that
 * holds the Control.
 *
 * @param mark The mark on the answer the Control shows.
 * @param slot The Control's root `data-slot`, which names the answer's part, `<slot>-answer`.
 * @param locale The locale of plate's own text.
 * @returns The `plate-<kind>-answer` part, a `p` at the flow position after the block, or nothing
 *   for a mark that carries no answer.
 */
export const controlAnswer = (mark: ControlMark, slot: ControlSlot, locale: Locale): ReactNode =>
  Option.match(answerOf(mark), {
    onNone: () => null,
    onSome: (answer) => (
      <p data-mark="missed" data-slot={`${slot}-answer`}>
        {message(locale, "markMissedAnswer", { answer })}
      </p>
    ),
  });
