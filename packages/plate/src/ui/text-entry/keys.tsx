"use client";

/**
 * A Text Entry's on-screen keypad (`textEntryKeypad` `on-screen`), the island the server writes
 * after the item's body: the author's sentence or equation keeps its line, with the box in its
 * place, and the keys stand below everything the child reads, as the K–2 forms' product spec puts
 * the response area below the picture and the lines, never over the box, a line or a picture, and
 * never between the box and an instruction after it, since the keypad takes its own place in the
 * flow after the body.
 *
 * A key types into the box through the box's typer, the channel a host's own keypad types through
 * (`useTyping` in `#plate/ui/responses.tsx`), so the box takes or refuses it as it takes or refuses
 * its keyboard's keystrokes, and the response is read from the box's text alone.
 *
 * @module
 */
import { Button } from "@ui-sdk/react/button";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import { faces } from "#plate/ui/text-entry/keypad.ts";
import type { Keypad } from "#plate/ui/text-entry/keypad.ts";
import type { keypadKeys } from "#plate/ui/text-entry/labels.ts";
import { useTyping } from "#plate/ui/responses.tsx";

/**
 * What the server gives a Text Entry's keypad: its keys, the names it gives, and the response whose
 * box it types into.
 */
export interface TextEntryKeypadProps {
  /**
   * The keys the box's response holds, and their layout (`keypadOf` in
   * `#plate/ui/text-entry/keypad.ts`).
   */
  readonly keypad: Keypad;
  readonly labels: Labels<typeof keypadKeys>;
  /**
   * The identifier of the response whose box the keys type into.
   */
  readonly response: string;
}

/**
 * Render a Text Entry's keypad.
 *
 * The parts:
 *
 * - `plate-text-entry-keypad`, a `div` group named by the `keypad` label, with `data-keypad-layout`
 *   naming its layout;
 * - A UI SDK `button` per key, with `data-keypad-key` naming the key, showing its face and named by
 *   it, or by the `delete` label for backspace.
 *
 * A key types at the end of the box's text, and backspace deletes its last character, wherever the
 * caret stands (`pressed` in `#plate/ui/text-entry/keypad.ts`); the box takes or refuses the text
 * as it does a keystroke. Pressing one with a mouse or a finger leaves the focus where it is, its
 * `mousedown` refused, so a child typing in the box keeps it and its hint waits for the child to
 * leave the box. The keys are native buttons, so Tab
 * reaches them and Enter and Space press them.
 *
 * @param props The keys, the names and the response ({@link TextEntryKeypadProps}).
 * @returns The keypad.
 * @see https://ui-sdk.dev/docs/react/components/button
 */
export const TextEntryKeypad = ({ keypad, labels, response }: TextEntryKeypadProps) => {
  const type = useTyping(response);

  return (
    <div
      aria-label={labels.keypad}
      data-keypad-layout={keypad.layout}
      data-slot="plate-text-entry-keypad"
      role="group"
    >
      {keypad.keys.map((key) => (
        <Button
          aria-label={key === "backspace" ? labels.delete : undefined}
          data-keypad-key={key}
          key={key}
          type="button"
          onClick={() => {
            type(key);
          }}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
        >
          {faces[key]}
        </Button>
      ))}
    </div>
  );
};
