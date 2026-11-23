/**
 * Extended Text (Q-7) in the server shell: what renders a `qti-extended-text-interaction`'s payload
 * node, its island in `answering` (`#plate/ui/extended-text/extended-text.tsx`) and its server
 * markup in `review` and `solution`.
 *
 * The island takes its binding, `base`, its boxes and their size from `expected-length` and
 * `expected-lines`, `format`, `pattern-mask` with the author's `data-patternmask-message` in place
 * of the catalog's, its placeholder, prompt and name. The review shows each string in a read-only
 * textarea, sized and named as the island's boxes are, and by the host's marks marks each
 * box and writes the right answers the strings miss ({@link marksOf}). Where `min-strings` asks for
 * more boxes than plate shows, both are the cap's notice in its place.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { ReactNode } from "react";
import { controlCap } from "#plate/control-cap.ts";
import type { ExtendedTextInteraction } from "#plate/interactions/extended-text.ts";
import { writeIn } from "#plate/interactions/text-entry.ts";
import { textOfXhtml } from "#plate/interactions/xhtml-text.ts";
import { message, messageText } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import { format, isNullResponse, isRecordValue } from "#plate/model/values.ts";
import type { ResponseValue, Single } from "#plate/model/values.ts";
import type { Paired } from "#plate/payload.ts";
import { ExtendedText } from "#plate/ui/extended-text/extended-text.tsx";
import type { BoxSize } from "#plate/ui/extended-text/extended-text.tsx";
import { extendedTextKeys } from "#plate/ui/extended-text/labels.ts";
import { noticeOf } from "#plate/ui/item/content.tsx";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { hintOf } from "#plate/ui/item/interactions/facts.ts";
import {
  controlNameOf,
  labelsOf,
  ownName,
  promptAt,
  rootOf,
} from "#plate/ui/item/interactions/labels.ts";
import { bagMarks, markingOf, partsMarked } from "#plate/ui/item/interactions/marks.ts";
import type { AnswerMark, Marking } from "#plate/ui/item/interactions/marks.ts";
import { markPart, wordsOfMark } from "#plate/ui/item/interactions/words.tsx";
import { fillLabel } from "#plate/ui/labels.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";

/**
 * The characters a line is expected to hold (QTI 3.0 information model 5.48.8), which turns
 * `expected-length` into a box's width and, without `expected-lines`, its height.
 */
const lineLength = 72;

/**
 * Give an Extended Text's boxes their size, as its island and its review draw them: `cols` from
 * `expected-length`, up to one line of 72 characters; `rows` from `expected-lines`, else from
 * `expected-length` in lines of 72 characters. A hint the author wrote as 0, or not at all, sizes
 * nothing.
 *
 * @param model Its model node: `expected-length`.
 * @param node Its payload: `expected-lines`.
 * @returns The size.
 */
const sizeOf = (
  model: Paired<"extended-text">["model"],
  node: Paired<"extended-text">["payload"],
): BoxSize => {
  const width = hintOf(model.expectedLength);

  return {
    cols: width === undefined ? undefined : Math.min(width, lineLength),
    rows:
      hintOf(node.expectedLines) ??
      (width === undefined ? undefined : Math.ceil(width / lineLength)),
  };
};

/**
 * Render an Extended Text's island, or the cap's notice in its place when its `min-strings` asks
 * for more boxes than plate shows.
 *
 * @param paired The Extended Text.
 * @param paired.model Its model node: the author's `data-*`, `expected-length`, `pattern-mask` and
 *   `data-patternmask-message`, and the control plate names when nothing else names it.
 * @param paired.payload Its payload: its binding, `base`, its boxes, `expected-lines`, `format`,
 *   placeholder, prompt and names, and no Control (`n` 0) when the cap's notice stands in their
 *   place.
 * @param context What the page may know of the render.
 * @returns The island, or the notice.
 */
export const island = (
  { model, payload: node }: Paired<"extended-text">,
  context: IslandContext,
): ReactNode => {
  if (node.n === 0) {
    return noticeOf(controlCap.feature, context.locale, "flow");
  }

  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <ExtendedText
      base={node.base}
      baseType={node.baseType}
      boxes={node.boxes}
      format={node.format}
      labels={labelsOf(extendedTextKeys, context.locale, { pattern: model.patternMaskMessage })}
      response={node.declared}
      naming={controlNameOf(prompt, node, ownName(model, context), context)}
      patternMask={Option.getOrUndefined(model.patternMask)}
      placeholder={Option.getOrUndefined(node.placeholder)}
      prompt={prompt}
      root={rootOf(model, context)}
      size={sizeOf(model, node)}
    />
  );
};

/**
 * How a review marks one box: the mark on the string it shows, none where it marks none, and the
 * right answer written after it, none where nothing is missed there.
 */
interface BoxMark {
  readonly mark: Exclude<AnswerMark, "missed"> | undefined;
  readonly missed: Option.Option<Single>;
}

/**
 * A box a review marks nothing on.
 */
const none: BoxMark = { mark: undefined, missed: Option.none() };

/**
 * How a review marks an Extended Text's boxes: one {@link BoxMark} for each box, in order, and the
 * right answers written after the last box, which no box stands for.
 */
interface BoxMarks {
  readonly after: readonly Single[];
  readonly boxes: readonly BoxMark[];
}

/**
 * Lay the marks the host handed for an Extended Text's response on its boxes: a `multiple`
 * response as a bag ({@link bagMarks}), each string with the mark handed its value, the values
 * handed `missed` written after the boxes; a `single` or `ordered` one by place, each string with
 * the mark handed at its place, the value handed `missed` at a box's place written after that box,
 * and those past the last box after it. Nothing marks a review with no marks, or a solution.
 *
 * @param shown The value shown, none for no value.
 * @param marking The marks handed for the response.
 * @param count How many boxes the review shows.
 * @param cardinality The bound response's cardinality.
 * @returns The marks.
 */
const marksOf = (
  shown: ResponseValue | undefined,
  marking: Marking,
  count: number,
  cardinality: ExtendedTextInteraction["cardinality"],
): BoxMarks => {
  if (marking.kind !== "marked") {
    return { after: [], boxes: Array.from({ length: count }, () => none) };
  }

  const given =
    shown === undefined || isNullResponse(shown) || isRecordValue(shown) ? [] : shown.values;

  if (cardinality === "multiple") {
    const marks = bagMarks(given, marking, (values) => values, format);

    return {
      after: marks.missed,
      boxes: Array.from({ length: count }, (_, index) => ({
        mark: marks.given[index],
        missed: Option.none(),
      })),
    };
  }

  const missed = (place: number): Option.Option<Single> =>
    Arr.findFirst(partsMarked(marking, "missed"), (part) => part.place === place).pipe(
      Option.map((part) => part.value),
    );

  return {
    after: partsMarked(marking, "missed")
      .filter((part) => part.place >= count)
      .map((part) => part.value),
    boxes: Array.from({ length: count }, (_, index): BoxMark => {
      if (given[index] === undefined) {
        return { mark: undefined, missed: missed(index) };
      }

      return partsMarked(marking, "right").some((part) => part.place === index)
        ? { mark: "right", missed: Option.none() }
        : { mark: "wrong", missed: missed(index) };
    }),
  };
};

/**
 * Write a right answer a review writes after a box.
 *
 * @param single The correct string.
 * @param base The Extended Text's `base`, the base an integer's text is read in.
 * @param locale The locale of plate's own text.
 * @param key Its key among its siblings.
 * @returns The `plate-extended-text-answer` part, `data-mark="missed"`.
 */
const answerPart = (single: Single, base: number, locale: Locale, key: string): ReactNode => (
  <p key={key} data-mark="missed" data-slot="plate-extended-text-answer">
    {message(locale, "markMissedAnswer", { answer: writeIn(single, base) })}
  </p>
);

/**
 * Render an Extended Text's review: each string in a read-only textarea in its
 * `plate-extended-text-box`, an `xhtml` one as the text its XHTML was typed from, named as the
 * island names its boxes, marked by the host's marks with the mark's words, each right
 * answer it misses after its box or after the last ({@link marksOf}); or the cap's notice where its
 * `min-strings` asks for more boxes than plate shows.
 *
 * @param paired The Extended Text.
 * @param paired.model Its model node: the author's `data-*`, `expected-length`, and the control
 *   plate names when nothing else names it.
 * @param paired.payload Its payload: the text each box shows, its `base`, format, prompt and names.
 * @param context What the shell knows: the value shown, and what the render marks it against.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"extended-text">,
  context: ReviewContext,
): ReactNode => {
  if (node.n === 0) {
    return noticeOf(controlCap.feature, context.locale, "flow");
  }

  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const naming = controlNameOf(prompt, node, ownName(model, context), context);
  const grouped = node.restores.length > 1;
  const size = sizeOf(model, node);
  const box = messageText(locale, extendedTextKeys.box);
  const marks = marksOf(
    context.values.get(node.response),
    markingOf(node.response, context),
    node.restores.length,
    model.cardinality,
  );

  return (
    <div
      {...rootOf(model, context)}
      data-format={node.format}
      data-slot="plate-extended-text"
      {...(grouped ? { role: "group", ...naming } : {})}
    >
      <PromptPart prompt={prompt} />
      {node.restores.map((text, index) => {
        const { mark, missed } = marks.boxes[index] ?? none;

        // A box is a place, not an item: it keeps its place whatever its text, so its place is its key.
        return [
          <div key={`box-${String(index)}`} data-mark={mark} data-slot="plate-extended-text-box">
            <textarea
              {...(grouped
                ? { "aria-label": fillLabel(box, { count: node.restores.length, n: index + 1 }) }
                : naming)}
              cols={size.cols}
              data-slot="textarea"
              readOnly
              rows={size.rows}
              value={node.format === "xhtml" ? textOfXhtml(text) : text}
            />
            {markPart(wordsOfMark(mark), locale)}
          </div>,
          ...Option.toArray(missed).map((single) =>
            answerPart(single, node.base, locale, `answer-${String(index)}`),
          ),
        ];
      })}
      {marks.after.map((single, index) =>
        answerPart(single, node.base, locale, `after-${String(index)}`),
      )}
    </div>
  );
};
