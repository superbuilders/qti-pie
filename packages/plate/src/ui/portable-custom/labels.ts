/**
 * The words a Portable Custom Interaction says around the PCI it hosts: its frame's name where
 * nothing else names it, and its status while the PCI loads or when it cannot run. The server
 * fills them from plate's message catalog (`labelsOf` in `#plate/ui/item/interactions/labels.ts`)
 * and passes them to the island as plain strings, so no wording ships in the client's code. What
 * the PCI says inside its frame is its own.
 *
 * @module
 */
import type { LabelKeys } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for each text a Portable Custom Interaction's island writes for the child.
 */
export const portableCustomKeys = {
  /**
   * The status while the frame cannot run the PCI: a route failed, no factory served it, or a
   * script threw before it was ready.
   */
  failed: "portableCustomFailed",
  /**
   * The frame's `title` where the prompt, the author's `aria-labelledby` and `aria-label` give no
   * text.
   */
  frame: "portableCustomFrame",
  /**
   * The status while the PCI loads, until it says it is ready.
   */
  loading: "portableCustomLoading",
} as const satisfies LabelKeys<"failed" | "frame" | "loading">;
