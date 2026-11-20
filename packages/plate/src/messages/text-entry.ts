/**
 * The English texts of the Text Entry interaction's on-screen keypad (Q-20,
 * `#plate/ui/text-entry/`). One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * Text Entry's keypad texts, keyed by the role each plays: `textEntryKeypad` names the group of
 * keys under a box, and `textEntryDelete` the key that deletes the character before the caret,
 * whose face is a glyph a screen reader reads as nothing a child knows.
 */
export const textEntryMessages = {
  textEntryDelete: "Delete",
  textEntryKeypad: "Keypad",
} as const;
