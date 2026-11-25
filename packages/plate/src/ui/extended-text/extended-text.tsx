"use client";

/**
 * The Extended Text interaction's client island (`qti-extended-text-interaction`): one UI SDK
 * textarea, or several for a response that holds several strings, where the child writes, and
 * the texts written are the response.
 *
 * It follows the Choice island's pattern (`#plate/ui/choice/choice.tsx`).
 *
 * A `format` of `xhtml` asks for structured text whose "value of the response variable is text
 * marked up in XHTML", typed as "plain typed text interpreted with a set of simple text markup
 * conventions such as those used in wiki page editors or a complete WYSIWYG editor" (QTI 3.0.1
 * information model 8.42). This island gives it the plain textarea and a wiki editor's
 * conventions, and posts the XHTML they make: a blank line parts paragraphs, each a `p`, and
 * another line break is a `br` (`#plate/interactions/xhtml-text.ts`), read back to the very text
 * typed when the response is restored. A WYSIWYG editor would need: a document model holding only
 * the XHTML QTI's content model admits, its keyboard and toolbar commands, paste and drop that keep
 * only that subset, and a review that shows the fragment as markup.
 *
 * @module
 */
import { Field, FieldError } from "@ui-sdk/react/field";
import { Textarea } from "@ui-sdk/react/textarea";
import type { Authored, Named } from "#plate/ui/attributes.ts";
import type { extendedTextKeys } from "#plate/ui/extended-text/labels.ts";
import { WordCount } from "#plate/ui/extended-text/word-count.tsx";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import { fillLabel } from "#plate/ui/labels.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { asTyped } from "#plate/model/typed-text.ts";
import type { Written } from "#plate/model/typed-text.ts";
import { inputModeOf, useBoxes } from "#plate/ui/typed.ts";
import type { BoxCounts, TypedDeclared } from "#plate/ui/typed.ts";
import { textOfXhtml, xhtmlOfText } from "#plate/interactions/xhtml-text.ts";

/**
 * The size of each of an Extended Text's boxes, in a textarea's `cols` and `rows`, each undefined
 * where the author's hints size nothing: the server derives it from `expected-length` and
 * `expected-lines` (QTI 3.0 information model 5.48.3, 5.48.8), so the island and the review draw
 * one size.
 */
export interface BoxSize {
  readonly cols: number | undefined;
  readonly rows: number | undefined;
}

/**
 * What the server gives an Extended Text's island, as QTI's `qti-extended-text-interaction` and
 * plate's presentation of it say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_ExtendedTextInteraction
 */
export interface ExtendedTextProps extends Authored<Named> {
  /**
   * `base`, the number base an `integer` answer is typed in: 10 when the author wrote none, the
   * XSD's default (5.48.1).
   */
  readonly base: number;
  /**
   * The base type of the response the interaction binds. A `record` response is a `string` here:
   * the text written is its `stringValue`, which the server reads its other fields from.
   */
  readonly baseType: "float" | "integer" | "string";
  /**
   * How many boxes show, which the server derives from the bound response's cardinality,
   * `max-strings` (5.48.6) and `min-strings` (5.48.7, 0 when the author wrote none, the XSD's
   * default), where an absent or 0 `max-strings` is no limit (plate's reading `max-strings-zero`):
   *
   * - A `single` or `record` response takes one string: `shown` and `most` are 1.
   * - A `multiple` or `ordered` response takes a string per box. `shown` is `max-strings` when it is
   *   from 1 to 10, else the greater of 10 and `min-strings`, and at most 100. `most` is
   *   `max-strings` when it limits, else 100, and at most 100, so a rendered item's tab stops stay
   *   bounded whatever its restored response holds.
   *
   * The island shows `shown` boxes, or one per string its response holds up to `most`, so
   * restoring drops no answer, and posts the strings in the boxes' order: a sequence reads that
   * order, a bag does not. `min-strings` decides whether a submitted response is valid, which the
   * server judges, so a child is never stopped short of it. The server shows its notice in place
   * of an interaction whose `min-strings` passes 100, so no island receives one.
   */
  readonly boxes: BoxCounts;
  /**
   * `format`: `plain` when the author wrote none, the XSD's default (5.48.9). The root's
   * `data-format` carries it, for the stylesheet to write `preformatted` text as `pre` does: white
   * space kept and lines unwrapped. `xhtml` gets the plain textarea, its text posted as XHTML (see
   * the module comment).
   */
  readonly format: "plain" | "preformatted" | "xhtml";
  readonly labels: Labels<typeof extendedTextKeys>;
  /**
   * The response the boxes write, as its declaration types it: a `string`, `integer` or `float` of
   * any cardinality but `record`, or a record.
   */
  readonly response: TypedDeclared;
  /**
   * `pattern-mask`, undefined when the author wrote none: the XML Schema regular expression each
   * string matches to be valid (5.48.4). It never stops typing; a box shows the `pattern` label
   * once it loses focus with text that fails it, until the text matches.
   */
  readonly patternMask: string | undefined;
  /**
   * `placeholder-text`, undefined when the author wrote none: what each empty box shows (5.48.5).
   */
  readonly placeholder: string | undefined;
  /**
   * The `qti-prompt`, server-rendered under its scoped id, which `naming` then names the box, or
   * the group of boxes, by; undefined when the interaction has none.
   */
  readonly prompt: Prompt | undefined;
  /**
   * Each box's size, a hint the author gives, never a limit.
   */
  readonly size: BoxSize;
}

/**
 * An `xhtml` Extended Text's text as it is posted: the XHTML its conventions make of it.
 */
const asXhtml: Written = { read: textOfXhtml, write: xhtmlOfText };

/**
 * Render an Extended Text for the child to answer, holding its response in the item's
 * `<Responses>`.
 *
 * The parts:
 *
 * - `plate-extended-text`, the root, with the author's `class` and `data-*`, and `data-format`; with
 *   several boxes it is a group, named by `naming`, which the server resolved;
 * - `plate-prompt`, the prompt, under the id `naming` names the box or the group by;
 * - One UI SDK `field` per box, which ties its textarea to its hint;
 * - UI SDK's `textarea`, a native textarea: its `cols` and `rows` the server's `size`,
 *   `placeholder-text` as its `placeholder`. One box is named by `naming`; with several, each is
 *   named by the `box` label;
 * - UI SDK's `field-error`, holding the `pattern` label from the moment the box loses focus with text
 *   that fails the `pattern-mask` until the text matches, on the keystroke that makes it match.
 *   Meanwhile the field marks the textarea `aria-invalid`, names the hint in its
 *   `aria-describedby`, and announces the hint as it appears. Each box is judged on its own, and
 *   nothing shows while the child is still typing in it.
 * - `plate-word-count`, under an essay of one box bound to a string, how many words its text holds,
 *   as AlphaTest's player said under every essay (`#plate/ui/extended-text/word-count.tsx`).
 *
 * Every keystroke writes the boxes' texts as typed and the response read from them: the boxes that
 * hold an answer, in the boxes' order. A box left empty is no answer and leaves the others in their
 * places, and so is one of white space alone in `plain` and `preformatted` text, as QTI reads it,
 * or a blank one bound to a number. A keystroke leaves a box only a text it takes, as a Text
 * Entry's does (`typedEntry` in `#plate/model/typed-text.ts`): an `integer` box refuses a leading
 * zero, a `+`, a space or a decimal point, or a text that begins no text its `pattern-mask`
 * matches, and keeps its text.
 *
 * The browser offers nothing of its own: no remembered answers, no spelling marks, no correction
 * and no capital letters, since each would change or judge the child's own writing.
 *
 * A box is a place, not an item: it keeps its place whatever its text, so its place is its key.
 *
 * @param props The interaction, its response and its labels
 *   ({@link ExtendedTextProps}).
 * @returns The Extended Text, its boxes bound to the response.
 * @see https://ui-sdk.dev/docs/react/components/textarea
 * @see https://ui-sdk.dev/docs/react/components/field
 */
export const ExtendedText = (props: ExtendedTextProps) => {
  const {
    base,
    baseType,
    format,
    labels,
    naming,
    patternMask,
    placeholder,
    prompt,
    response,
    root,
    size,
  } = props;
  const reading = { base, baseType, blankIsEmpty: format !== "xhtml" };
  const written = format === "xhtml" ? asXhtml : asTyped;
  const [boxes, write, leave] = useBoxes({
    counts: props.boxes,
    declared: response,
    patternMask,
    reading,
    typer: undefined,
    written,
  });
  const grouped = boxes.length > 1;
  const [only, ...others] = boxes;
  const boxName = (index: number): Named =>
    grouped
      ? { "aria-label": fillLabel(labels.box, { count: boxes.length, n: index + 1 }) }
      : naming;

  return (
    <div
      {...root}
      data-slot="plate-extended-text"
      data-format={format}
      {...(grouped ? { role: "group", ...naming } : {})}
    >
      <PromptPart prompt={prompt} />
      {boxes.map((box, index) => (
        <Field key={index} invalid={box.flagged}>
          <Textarea
            {...boxName(index)}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            cols={size.cols}
            inputMode={inputModeOf(reading)}
            placeholder={placeholder}
            rows={size.rows}
            spellCheck={false}
            value={box.text}
            onBlur={() => {
              leave(index);
            }}
            onValueChange={(text, details) => {
              if (!write(index, text)) {
                details.cancel();
              }
            }}
          />
          {box.flagged ? <FieldError match>{labels.pattern}</FieldError> : null}
        </Field>
      ))}
      {others.length === 0 && baseType === "string" ? (
        <WordCount
          labels={{ one: labels.wordOne, other: labels.words }}
          read="plain"
          text={only.text}
        />
      ) : null}
    </div>
  );
};
