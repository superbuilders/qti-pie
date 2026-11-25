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
 * Match's group, `{n}` its place among the groups, `readAloudRow` and `readAloudColumn` a row's and
 * a column's header of a Match laid out as a table, `{n}` its place, `readAloudArea` an area of a
 * graphic interaction's image, `{n}` its place among the areas, as plate names an area with no name
 * of its own ("Area 2 of 4"), `readAloudLabel` an element of an interaction's own content outside
 * its choices that holds its control after its words, a slot's label ("least"), `{n}` its place
 * among them, and `readAloudText` any other part of the item. A press whose
 * recording cannot play tells the child so at the control, once, under the title
 * `readAloudFailedTitle`, in the words `readAloudFailed`: AlphaTest's player's
 * (mastery-track-player 941a86a, `src/utils/audio-failure.ts` lines 4–6).
 */
export const readAloudMessages = {
  readAloudArea: "Listen to area {n}",
  readAloudChoice: "Listen to choice {n}",
  readAloudColumn: "Listen to column {n}",
  readAloudFailed:
    "This audio is unavailable right now. Please try again, and tell your teacher if it keeps happening.",
  readAloudFailedTitle: "Audio error",
  readAloudGroup: "Listen to group {n}",
  readAloudLabel: "Listen to label {n}",
  readAloudPrompt: "Listen to the question",
  readAloudRow: "Listen to row {n}",
  readAloudText: "Listen",
} as const;
