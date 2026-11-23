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
import { Button } from "@ui-sdk/react/button";
import { Field, FieldError } from "@ui-sdk/react/field";
import { Input, createInputController } from "@ui-sdk/react/input";
import { Option } from "effect";
import { useCallback, useRef, useState } from "react";
import type { TextEntryKeypad } from "#plate/configuration.ts";
import type { Authored, Named } from "#plate/ui/attributes.ts";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import { digitsOf } from "#plate/ui/text-entry/digits.ts";
import { faces, keypadOf, pressed } from "#plate/ui/text-entry/keypad.ts";
import type { Key } from "#plate/ui/text-entry/keypad.ts";
import type { textEntryKeys } from "#plate/ui/text-entry/labels.ts";
import { asTyped } from "#plate/model/typed-text.ts";
import { inputModeOf, useBoxes } from "#plate/ui/typed.ts";
import type { BoxCounts, TypedDeclared, TypedReading } from "#plate/ui/typed.ts";

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
   * Whether the author marked the box a drill's (`plate-digits`, `#plate/ui/text-entry/digits.ts`):
   * it takes digits alone and asks for the device's number keyboard.
   */
  readonly digits: boolean;
  /**
   * The base type the box's text is read as: the response's, and `string` for a `record` response,
   * the text typed being its `stringValue`, which plate's reading of typed text reads its other
   * fields from.
   */
  readonly baseType: "float" | "integer" | "string";
  /**
   * `expected-length`: how many characters the answer is expected to take, which sizes the input
   * (5.162.4). It is a hint, never a limit. Undefined when the author wrote none or 0, which sizes
   * nothing.
   */
  readonly expectedLength: number | undefined;
  /**
   * The configuration's `textEntryKeypad`: whether the box shows an on-screen keypad under it.
   */
  readonly keypad: TextEntryKeypad;
  readonly labels: Labels<typeof textEntryKeys>;
  /**
   * The response the box writes, as its declaration types it: a single `string`, `integer` or
   * `float`, or a record.
   */
  readonly response: TypedDeclared;
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
 * Give the keyboard a box asks the device for: none where the host shows a keypad of its own
 * (`textEntryKeypad` `host`), which wins, since its keys are the ones the child types with; the
 * number keyboard for a drill's box (`plate-digits`); else the keyboard its base type reads by
 * (`inputModeOf`).
 *
 * @param keypad The host's `textEntryKeypad`.
 * @param digits Whether the box is a drill's.
 * @param reading How the box's text is read.
 * @returns The `inputmode`, undefined for the device's text keyboard.
 */
const inputModeFor = (
  keypad: TextEntryKeypad,
  digits: boolean,
  reading: TypedReading,
): "decimal" | "none" | "numeric" | undefined => {
  if (keypad === "host") {
    return "none";
  }

  return digits ? "numeric" : inputModeOf(reading);
};

/**
 * Render a Text Entry for the child to answer, holding its response in the item's `<Responses>`.
 *
 * The parts:
 *
 * - `plate-text-entry`, the root, a `span`, with the author's `class` and `data-*`;
 * - UI SDK's `field`, rendered as a `span`, which ties the input to its hint;
 * - UI SDK's `input`, a native text input named by `naming`, which the server resolved: `inputmode`
 *   by the base type, numeric for a drill's box, none under a host's own keypad
 *   ({@link inputModeFor}), `expected-length` as its `size`, `placeholder-text` as its
 *   `placeholder`;
 * - UI SDK's `field-error`, rendered as a `span`, holding the `pattern` label from the moment the
 *   input loses focus with text that fails the `pattern-mask` until the text matches, on the
 *   keystroke that makes it match. Meanwhile the field marks the input `aria-invalid`, names the
 *   hint in its `aria-describedby`, and announces the hint as it appears. Nothing shows while the
 *   child is still typing toward an answer;
 * - `plate-text-entry-keypad`, under the field where the host's `textEntryKeypad` is `on-screen` and
 *   the box's response has keys (`keypadOf` in `#plate/ui/text-entry/keypad.ts`), a `span` group
 *   named by the `keypad` label, with `data-keypad-layout` naming its layout, holding a UI SDK
 *   `button` per key, with `data-keypad-key` naming the key, showing its face and named by it, or
 *   by the `delete` label for backspace.
 *
 * A key types into the input as a keyboard's key does: it replaces the input's selection, or
 * deletes before its caret, through the input's controller, so the change reaches the response by
 * the input's own value change, and the caret stands after it. The keys are native buttons, so Tab
 * reaches them and Enter and Space press them. The keypad is part of the box: the hint waits for
 * the child to leave both, so a tap on a key while typing toward an answer shows nothing.
 *
 * A drill's box keeps the digits of what is typed and drops every other character as it is typed
 * (`digitsOf`), so its response holds digits alone. Every keystroke writes the box's text and the
 * value read from it, and the host paces its saves. An empty input is no answer, NULL, and so is
 * one of XML white space alone, since a Text Entry's text is plain (QTI's `TextFormatEnum`,
 * SV-DESIGN-05). The box shows its text exactly as typed; the value is plate's reading of it, a
 * number trimmed and an `integer` read in `base`. A key of a host's own keypad types into the box
 * as this keypad's do (`useTyping` in `#plate/ui/responses.tsx`).
 *
 * The browser offers nothing of its own: no remembered answers, no spelling marks, no
 * correction, and no capital letter at the start, since each would change or judge a child's
 * answer that is compared exactly, case and spelling included.
 *
 * @param props The interaction, its response and its labels ({@link TextEntryProps}).
 * @returns The Text Entry, its input bound to the response.
 * @see https://ui-sdk.dev/docs/react/components/input
 * @see https://ui-sdk.dev/docs/react/components/field
 */
export const TextEntry = (props: TextEntryProps) => {
  const {
    base,
    baseType,
    digits,
    expectedLength,
    keypad,
    labels,
    naming,
    patternMask,
    placeholder,
    response,
    root,
  } = props;
  const reading = { base, baseType, blankIsEmpty: true };
  const [controller] = useState(createInputController);
  const input = useRef<HTMLInputElement>(null);
  const press = useCallback(
    (key: Key) => {
      const element = input.current;

      if (element !== null) {
        const typed = pressed(
          {
            end: element.selectionEnd ?? element.value.length,
            start: element.selectionStart ?? element.value.length,
            text: element.value,
          },
          key,
        );

        controller.setValue(typed.text);
        element.setSelectionRange(typed.caret, typed.caret);
      }
    },
    [controller],
  );
  const [[box], write, leave] = useBoxes({
    counts: oneBox,
    declared: response,
    patternMask,
    reading,
    typer: press,
    written: asTyped,
  });

  return (
    <span
      {...root}
      data-slot="plate-text-entry"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          leave(0);
        }
      }}
    >
      <Field invalid={box.flagged} render={<span />}>
        <Input
          {...naming}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          controller={controller}
          inputMode={inputModeFor(keypad, digits, reading)}
          placeholder={placeholder}
          ref={input}
          size={expectedLength}
          spellCheck={false}
          type="text"
          value={box.text}
          onValueChange={(text) => {
            write(0, digits ? digitsOf(text) : text);
          }}
        />
        {box.flagged ? (
          <FieldError match render={<span />}>
            {labels.pattern}
          </FieldError>
        ) : null}
      </Field>
      {Option.match(keypadOf(keypad, reading), {
        onNone: () => null,
        onSome: (pad) => (
          <span
            aria-label={labels.keypad}
            data-keypad-layout={pad.layout}
            data-slot="plate-text-entry-keypad"
            role="group"
          >
            {pad.keys.map((key) => (
              <Button
                aria-label={key === "backspace" ? labels.delete : undefined}
                data-keypad-key={key}
                key={key}
                type="button"
                onClick={() => {
                  press(key);
                }}
              >
                {faces[key]}
              </Button>
            ))}
          </span>
        ),
      })}
    </span>
  );
};
