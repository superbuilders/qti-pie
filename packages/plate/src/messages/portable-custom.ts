/**
 * The English texts of the Portable Custom Interaction's island and review (Q-16,
 * `#plate/ui/portable-custom/`). One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * The Portable Custom Interaction's texts, keyed by the role each plays. The island's frame is
 * named `portableCustomFrame` where neither the prompt nor the author's names give it text; its
 * status says `portableCustomLoading` until the PCI is ready, and `portableCustomFailed` when the
 * frame cannot run it. A review shows the response as text under `portableCustomGiven`, a
 * solution under `portableCustomCorrect`, and either says `portableCustomEmpty` for a response
 * that holds no value.
 */
export const portableCustomMessages = {
  portableCustomCorrect: "Right answer",
  portableCustomEmpty: "No answer",
  portableCustomFailed: "This activity can't open.",
  portableCustomFrame: "Activity",
  portableCustomGiven: "Your answer",
  portableCustomLoading: "Loading the activity.",
} as const;
