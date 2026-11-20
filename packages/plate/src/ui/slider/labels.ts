/**
 * The words a Slider says: what it says while it holds no value. The server fills them from plate's
 * message catalog (`labelsOf` in `#plate/ui/item/interactions/labels.ts`) and passes them to the
 * island as plain strings, so no wording ships in the client's code. Its thumb's name is the
 * island's `naming`, which the server resolves.
 *
 * @module
 */
import type { LabelKeys } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for each text a Slider writes for the child.
 */
export const sliderKeys = {
  /**
   * What the thumb says to a screen reader, and the readout shows, in place of a number while the
   * slider holds no value: before the child first sets it, when its response declares no default
   * (QTI 3.0 information model 5.134: a slider "does not have a default or initial position except
   * where specified by a default value").
   */
  empty: "sliderEmpty",
} as const satisfies LabelKeys<"empty">;
