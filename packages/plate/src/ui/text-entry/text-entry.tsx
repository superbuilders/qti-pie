"use client";

/**
 * The Text Entry interaction's client island (`qti-text-entry-interaction`): one UI SDK input
 * standing inside the author's sentence, where the child types a word or a number, and the text
 * typed is the response.
 *
 * It follows the Choice island's pattern (`#plate/ui/choice/choice.tsx`). Its markup is phrasing
 * content, spans and the input, so it stands inside a paragraph, a table cell or a list item as
 * written.
 *
 * @module
 */
import { Field, FieldError } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import type { Authored, Named } from "#plate/ui/attributes.ts";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import type { textEntryKeys } from "#plate/ui/text-entry/labels.ts";
import { inputModeOf, useBoxes } from "#plate/ui/typed.ts";
import type { BoxCounts } from "#plate/ui/typed.ts";

/**
 * What the server gives a Text Entry's island, as QTI's `qti-text-entry-interaction` and plate's
 * presentation of it say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_TextEntryInteraction
 */
export interface TextEntryProps extends Authored<Named> {
  /**
   * `base`, the number base an `integer` answer is typed in: 10 when the author wrote none, the
   * XSD's default (5.162.2).
   */
  readonly base: number;
  /**
   * The base type of the response the interaction binds. A `record` response is a `string` here:
   * the text typed is its `stringValue`, which the server reads its other fields from.
   */
  readonly baseType: "float" | "integer" | "string";
  /**
   * `expected-length`: how many characters the answer is expected to take, which sizes the input
   * (5.162.4). It is a hint, never a limit. Undefined when the author wrote none or 0, which sizes
   * nothing.
   */
  readonly expectedLength: number | undefined;
  readonly labels: Labels<typeof textEntryKeys>;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * `pattern-mask`, undefined when the author wrote none: the XML Schema regular expression a
   * valid answer matches (5.162.5). It never stops typing; it shows the `pattern` label once the
   * input loses focus with text that fails it, until the text matches.
   */
  readonly patternMask: string | undefined;
  /**
   * `placeholder-text`, undefined when the author wrote none: what the empty input shows
   * (5.162.6).
   */
  readonly placeholder: string | undefined;
}

/**
 * How many boxes a Text Entry shows: its one input, whatever its response holds.
 */
const oneBox: BoxCounts = { most: 1, shown: 1 };

/**
 * Render a Text Entry for the child to answer, holding its response in the item's `<Responses>`.
 *
 * The parts:
 *
 * - `plate-text-entry`, the root, a `span`, with the author's `class` and `data-*`;
 * - UI SDK's `field`, rendered as a `span`, which ties the input to its hint;
 * - UI SDK's `input`, a native text input named by `naming`, which the server resolved: `inputmode`
 *   by the base type, `expected-length` as its `size`, `placeholder-text` as its `placeholder`;
 * - UI SDK's `field-error`, rendered as a `span`, holding the `pattern` label from the moment the
 *   input loses focus with text that fails the `pattern-mask` until the text matches, on the
 *   keystroke that makes it match. Meanwhile the field marks the input `aria-invalid`, names the
 *   hint in its `aria-describedby`, and announces the hint as it appears. Nothing shows while the
 *   child is still typing toward an answer.
 *
 * Every keystroke writes the response, and the host paces its saves. An empty input posts
 * nothing, and so does a blank one bound to a number, which the server would read as NULL. The
 * text posts as typed: the server trims a number and reads an `integer` in `base`.
 *
 * The browser offers nothing of its own: no remembered answers, no spelling marks, no
 * correction, and no capital letter at the start, since each would change or judge a child's
 * answer that is compared exactly, case and spelling included.
 *
 * @param props The interaction, its response's entry name and its labels ({@link TextEntryProps}).
 * @returns The Text Entry, its input bound to the response.
 * @see https://ui-sdk.dev/docs/react/components/input
 * @see https://ui-sdk.dev/docs/react/components/field
 */
export const TextEntry = (props: TextEntryProps) => {
  const { base, baseType, expectedLength, labels, name, naming, patternMask, placeholder, root } =
    props;
  const reading = { base, baseType, blankIsEmpty: false };
  const [[box], write, leave] = useBoxes({ counts: oneBox, name, patternMask, reading });

  return (
    <span {...root} data-slot="plate-text-entry">
      <Field invalid={box.flagged} render={<span />}>
        <Input
          {...naming}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          inputMode={inputModeOf(reading)}
          placeholder={placeholder}
          size={expectedLength}
          spellCheck={false}
          type="text"
          value={box.text}
          onBlur={() => {
            leave(0);
          }}
          onValueChange={(text) => {
            write(0, text);
          }}
        />
        {box.flagged ? (
          <FieldError match render={<span />}>
            {labels.pattern}
          </FieldError>
        ) : null}
      </Field>
    </span>
  );
};
