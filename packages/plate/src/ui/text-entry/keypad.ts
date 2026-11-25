/**
 * A Text Entry's on-screen keypad: the keys a box offers, a function of how its text is read, and
 * what pressing one does to the box's text.
 *
 * The keys follow the box's base type alone. QTI has no word for a box an expression answers, so
 * every `string` box offers the operators a mathematical answer is typed with, and none offers
 * letters: a box that asks for a word is typed on the device's own keyboard, which the keypad never
 * replaces. A Text Entry is always bound to a `single` response, so its cardinality chooses
 * nothing, and its `pattern-mask` chooses no key either: the keys stay the same from one item to
 * the next, and a key whose text the box may not hold is refused by the box, as the same key of
 * the keyboard is (`typedEntry` in `#plate/model/typed-text.ts`).
 *
 * The module is imported by the server shell, which writes a box's keypad after the item's body
 * (`after` in `#plate/ui/item/interactions/text-entry.tsx`), and by client modules.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { TextEntryKeypad } from "#plate/configuration.ts";
import { takesTyped } from "#plate/model/typed-text.ts";
import type { TypedEntry } from "#plate/model/typed-text.ts";
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
 * A box's keypad: its keys, in the order a child reads them, row by row, their layout, and whether
 * they type every text the box takes (`whole`), so the box asks the device for no keyboard of its
 * own, which would open over the keys and the picture.
 */
export interface Keypad {
  readonly keys: Arr.NonEmptyReadonlyArray<Key>;
  readonly layout: Layout;
  readonly whole: boolean;
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
 * Give the keys of a box's response read by its base type, and whether they type every text the
 * box takes.
 *
 * An `integer` takes the digits of its base and nothing else, 0 under 8; its keys type every text
 * the box takes unless the box takes a minus, which no key types, so a box whose `pattern-mask`
 * admits no negative number is typed on the keys alone (`typedEntry` in
 * `#plate/model/typed-text.ts`), and one that admits one keeps the device's keyboard for the sign.
 * One in a base above 10 takes letters as digits, which no keypad offers, so it has none, as
 * `inputModeOf` (`#plate/ui/typed.ts`) gives it the text keyboard. A `float` adds the decimal point
 * left of 0. A `string` adds a fourth column of the fraction bar, the minus sign, the plus sign and
 * the times sign, for a fraction, a negative number or an expression. A `float` box and a `string`
 * box take every text, a sign, an exponent and a word among them, which no keypad types, so each
 * keeps the device's keyboard.
 *
 * @param reading How the box's text is read.
 * @param entry The texts the box takes.
 * @returns The keypad, or none where no keypad types an answer.
 */
const keysOf = (reading: TypedReading, entry: TypedEntry): Option.Option<Keypad> => {
  switch (reading.baseType) {
    case "integer": {
      return reading.base <= 10
        ? Option.some({
            keys: Arr.append(
              digits.filter((digit) => Number(digit) < reading.base),
              "backspace",
            ),
            layout: "integer",
            whole: !takesTyped(entry, "-"),
          })
        : Option.none();
    }
    case "float": {
      return Option.some({
        keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"],
        layout: "float",
        whole: false,
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
        whole: false,
      });
    }
  }
};

/**
 * Give the keypad a box shows under the host's setting: none under `none`, and under `on-screen`
 * the keys its response holds ({@link keysOf}).
 *
 * @param setting The configuration's `textEntryKeypad`.
 * @param reading How the box's text is read.
 * @param entry The texts the box takes.
 * @returns The keypad, or none.
 */
export const keypadOf = (
  setting: TextEntryKeypad,
  reading: TypedReading,
  entry: TypedEntry,
): Option.Option<Keypad> => {
  switch (setting) {
    case "none": {
      return Option.none();
    }
    case "on-screen": {
      return keysOf(reading, entry);
    }
  }
};

/**
 * What splits a box's text into the characters a reader sees, so `backspace` deletes one of them.
 */
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/**
 * Press a key on a box's text, as a calculator's keys press theirs: a typed key puts its text at
 * the end, and `backspace` deletes the last character, a whole grapheme ({@link graphemes}), so it
 * never leaves half an emoji or a letter without its accent. Where the caret stands chooses
 * nothing, so a key never edits the middle of the text, where a box that keeps a whole number would
 * refuse the edit and the key would seem dead.
 *
 * @param text The box's text.
 * @param key The key pressed.
 * @returns The text after the key; the caret stands at its end.
 */
export const pressed = (text: string, key: Key): string =>
  key === "backspace"
    ? Option.match(Arr.last([...graphemes.segment(text)]), {
        onNone: () => text,
        onSome: (last) => text.slice(0, last.index),
      })
    : `${text}${key}`;
