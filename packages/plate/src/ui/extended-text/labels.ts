/**
 * The words an Extended Text says: the names of its boxes and the hint for an answer in the wrong
 * form. The server fills them from plate's message catalog, or from the author's own attributes
 * (`labelsOf` in `#plate/ui/item/interactions/labels.ts`), and passes them to the island as plain
 * strings, so no wording ships in the client's code. The name of its one box, or of its group of
 * boxes, is the island's `naming`, which the server resolves.
 *
 * @module
 */
import type { LabelKeys } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for each text an Extended Text writes for the child.
 */
export const extendedTextKeys = {
  /**
   * Each box's accessible name when there are several, with `{n}` for its place among them, from
   * 1, and `{count}` for how many there are, which the island fills.
   */
  box: "answerOf",
  /**
   * The hint shown, and announced, beside a box once it loses focus holding text that fails the
   * `pattern-mask`, until the text matches: the author's `data-patternmask-message` when the
   * interaction has one (QTI 3.0 information model 5.48.10), so the hint reads as the server's
   * refusal does.
   */
  pattern: "patternMismatch",
} as const satisfies LabelKeys<"box" | "pattern">;
