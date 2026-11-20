/**
 * The words an Inline Choice says: what its trigger shows before a pick. The server fills them from
 * plate's message catalog, or from the author's own attributes (`labelsOf` in
 * `#plate/ui/item/interactions/labels.ts`), and passes them to the island as plain strings, so no
 * wording ships in the client's code. Its trigger's name is the island's `trigger`, which the
 * server resolves.
 *
 * @module
 */
import type { LabelKeys } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for each text an Inline Choice writes for the child.
 */
export const inlineChoiceKeys = {
  /**
   * What the trigger shows while no choice is picked: the author's `data-prompt` when the
   * interaction has one and it is not blank (QTI 3.0 information model 5.74.5).
   */
  prompt: "selectPrompt",
} as const satisfies LabelKeys<"prompt">;
