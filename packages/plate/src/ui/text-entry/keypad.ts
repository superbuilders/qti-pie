/**
 * A Text Entry's on-screen keypad: the keys a box offers, a function of how its text is read, and
 * what pressing one does to the box's text.
 *
 * The keys follow the box's base type alone. QTI has no word for a box an expression answers, so
 * every `string` box offers the operators a mathematical answer is typed with, and none offers
 * letters: a box that asks for a word is typed on the device's own keyboard, which the keypad never
 * replaces. A Text Entry is always bound to a `single` response, so its cardinality chooses
 * nothing, and its `pattern-mask` chooses nothing either: which characters a regular expression's
 * matches may hold has no answer short of reading the expression as a language, and the mask never
 * stops typing.
 *
 * The module is imported by client modules only.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { TextEntryKeypad } from "#plate/configuration.ts";
import type { TypedReading } from "#plate/ui/typed.ts";

/**
 * The digits, in the order a keypad shows them: 1 to 9, then 0, as a phone's and a calculator's
 * keys run.
 */
const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const;

/**
 * Every key a keypad may hold: a typed key is the text it puts in the box, so no table from a key
 * to its text can drift; `backspace` deletes. `-` is the hyphen-minus a keyboard types and plate
 * reads as a number's sign, and `*` the one times sign a box's answer is read with: a key's face
 * shows them as `−` and `×` ({@link faces}).
 */
export type Key = (typeof digits)[number] | "*" | "+" | "-" | "." | "/" | "backspace";

/**
 * How a keypad lays its keys out, which the stylesheet reads from its `data-keypad-layout`: the
 * base type of the box's response, since that alone chooses the keys.
 */
type Layout = TypedReading["baseType"];

/**
 * A box's keypad: its keys, in the order a child reads them, row by row, and their layout.
 */
export interface Keypad {
  readonly keys: Arr.NonEmptyReadonlyArray<Key>;
  readonly layout: Layout;
}

/**
 * What each key shows: a digit and the decimal point, the fraction bar and the plus sign as they
 * are typed, the minus sign `−` for `-`, the multiplication sign `×` for `*`, and `⌫` for
 * `backspace`, which the catalog names, since a screen reader reads that glyph as nothing a child
 * knows. The others are named by their face.
 */
export const faces: Readonly<Record<Key, string>> = {
  "*": "×",
  "+": "+",
  "-": "−",
  ".": ".",
  "/": "/",
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  backspace: "⌫",
};

/**
 * Give the keys of a box's response read by its base type.
 *
 * An `integer` takes the digits of its base and nothing else, as Becky Allen's kindergarten pad
 * does, 0 under 8; one in a base above 10 takes letters as digits, which no keypad offers, so it
 * has none, as `inputModeOf` (`#plate/ui/typed.ts`) gives it the text keyboard. A `float` adds the
 * decimal point left of 0, as her grade 4 pad does. A `string` adds a fourth column of the fraction
 * bar, the minus sign, the plus sign and the times sign, for a fraction, a negative number or an
 * expression.
 *
 * @param reading How the box's text is read.
 * @returns The keypad, or none where no keypad types an answer.
 */
const keysOf = (reading: TypedReading): Option.Option<Keypad> => {
  switch (reading.baseType) {
    case "integer": {
      return reading.base <= 10
        ? Option.some({
            keys: Arr.append(
              digits.filter((digit) => Number(digit) < reading.base),
              "backspace",
            ),
            layout: "integer",
          })
        : Option.none();
    }
    case "float": {
      return Option.some({
        keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"],
        layout: "float",
      });
    }
    case "string": {
      return Option.some({
        keys: [
          "1",
          "2",
          "3",
          "/",
          "4",
          "5",
          "6",
          "-",
          "7",
          "8",
          "9",
          "+",
          ".",
          "0",
          "backspace",
          "*",
        ],
        layout: "string",
      });
    }
    default: {
      return reading.baseType satisfies never;
    }
  }
};

/**
 * Give the keypad a box shows under the host's setting: none under `none`, and under `on-screen`
 * the keys its response holds ({@link keysOf}).
 *
 * @param setting The configuration's `textEntryKeypad`.
 * @param reading How the box's text is read.
 * @returns The keypad, or none.
 */
export const keypadOf = (
  setting: TextEntryKeypad,
  reading: TypedReading,
): Option.Option<Keypad> => {
  switch (setting) {
    case "none": {
      return Option.none();
    }
    case "on-screen": {
      return keysOf(reading);
    }
    default: {
      return setting satisfies never;
    }
  }
};

/**
 * What splits a box's text into the characters a reader sees, so `backspace` deletes one of them.
 */
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/**
 * A box's text and its selection, from `start` to `end`, `start` at most `end`; a caret is a
 * selection of nothing.
 */
export interface Selected {
  readonly end: number;
  readonly start: number;
  readonly text: string;
}

/**
 * A box's text after a key, and its caret.
 */
export interface Pressed {
  readonly caret: number;
  readonly text: string;
}

/**
 * Press a key on a box's text, as the same key on a keyboard does: a typed key replaces the
 * selection with its text; `backspace` deletes the selection, or the character before a caret, a
 * whole grapheme ({@link graphemes}), so it never leaves half an emoji or a letter without its
 * accent. The caret stands after the change.
 *
 * @param selected The box's text and its selection.
 * @param key The key pressed.
 * @returns The text and the caret.
 */
export const pressed = (selected: Selected, key: Key): Pressed => {
  const { end, start, text } = selected;
  const after = text.slice(end);

  if (key !== "backspace") {
    return { caret: start + key.length, text: `${text.slice(0, start)}${key}${after}` };
  }

  const head = text.slice(0, start);
  const before =
    start === end
      ? Option.match(Arr.last([...graphemes.segment(head)]), {
          onNone: () => head,
          onSome: (last) => head.slice(0, last.index),
        })
      : head;

  return { caret: before.length, text: `${before}${after}` };
};
