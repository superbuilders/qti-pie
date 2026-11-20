/**
 * The English texts of the End Attempt interaction's island and review (Q-4,
 * `#plate/ui/end-attempt/`). One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * End Attempt's texts, keyed by the role each plays: `endAttempt` names the button where its
 * `title` shows no text and the author named it nothing else.
 */
export const endAttemptMessages = {
  endAttempt: "End attempt",
  endAttemptNotRecognised: "The {label} button was not recognised. Press it again.",
} as const;
