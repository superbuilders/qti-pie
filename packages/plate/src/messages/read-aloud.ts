/**
 * The English texts of read-aloud, the control that plays a `spoken` catalog card's recording
 * (`#plate/ui/read-aloud/`). One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * Read-aloud's texts, keyed by the role each plays. Most are the name of one control, a toggle
 * whose name stays while its pressed state says whether it plays, so a screen reader tells the
 * controls apart by what each reads: `readAloudPrompt` reads an interaction's prompt,
 * `readAloudChoice` a choice, `{n}` its place among the choices as presented, `readAloudGroup` a
 * Match's group, `{n}` its place among the groups, `readAloudArea` an area of a graphic
 * interaction's image, `{n}` its place among the areas, as plate names an area with no name of its
 * own ("Area 2 of 4"), and `readAloudText` any other part of the item. A press whose recording
 * cannot play tells the child so at the control, once, under the title `readAloudFailedTitle`, in
 * the words `readAloudFailed`: AlphaTest's player's (mastery-track-player 941a86a,
 * `src/utils/audio-failure.ts` lines 4–6).
 */
export const readAloudMessages = {
  readAloudArea: "Listen to area {n}",
  readAloudChoice: "Listen to choice {n}",
  readAloudFailed:
    "This audio is unavailable right now. Please try again, and tell your teacher if it keeps happening.",
  readAloudFailedTitle: "Audio error",
  readAloudGroup: "Listen to group {n}",
  readAloudPrompt: "Listen to the question",
  readAloudText: "Listen",
} as const;
