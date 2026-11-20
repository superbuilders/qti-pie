/**
 * The English texts of read-aloud, the control that plays a `spoken` catalog card's recording
 * (`#plate/ui/read-aloud/`). One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * Read-aloud's texts, keyed by the role each plays: each is the name of one control, a toggle
 * whose name stays while its pressed state says whether it plays, so a screen reader tells the
 * controls apart by what each reads. `readAloudPrompt` reads an interaction's prompt,
 * `readAloudChoice` a choice, `{n}` its place among the choices as presented, and `readAloudText`
 * any other part of the item.
 */
export const readAloudMessages = {
  readAloudChoice: "Listen to choice {n}",
  readAloudPrompt: "Listen to the question",
  readAloudText: "Listen",
} as const;
