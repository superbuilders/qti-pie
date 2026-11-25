/**
 * The words a Text Entry says: its box's hint for an answer in the wrong form, and its keypad's
 * names. The server fills them from plate's message catalog, or from the author's own attributes
 * (`labelsOf` in `#plate/ui/item/interactions/labels.ts`), and passes them to the islands as plain
 * strings, so no wording ships in the client's code. Its input's name is the island's `naming`,
 * which the server resolves.
 *
 * @module
 */
import type { LabelKeys } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for the text a Text Entry's box writes for the child.
 */
export const textEntryKeys = {
  /**
   * The hint shown, and announced, beside the input once it loses focus holding text that fails
   * the `pattern-mask`, until the text matches: the author's `data-patternmask-message` when the
   * interaction has one (QTI 3.0 information model 5.162.8), so the hint reads as the server's
   * refusal does.
   */
  pattern: "patternMismatch",
} as const satisfies LabelKeys<"pattern">;

/**
 * The catalog's message for each name a Text Entry's on-screen keypad gives.
 */
export const keypadKeys = {
  /**
   * The accessible name of the key that deletes the box's last character.
   */
  delete: "textEntryDelete",
  /**
   * The accessible name of the group of keys after the item's body.
   */
  keypad: "textEntryKeypad",
} as const satisfies LabelKeys<"delete" | "keypad">;
