/**
 * The English texts of read-aloud, the control that plays a `spoken` catalog card's recording
 * (`#plate/ui/read-aloud/`). One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * Read-aloud's texts, keyed by the role each plays. Most are the name of one control, a toggle
 * whose name stays while its pressed state says whether it plays, so a screen reader tells the
 * controls apart by what each reads, each with `{n}`, its place among the page's controls of that
 * part, the item's own and its passages', from 1, which the page's one namer gives
 * (`#plate/read-aloud/naming.ts`), so no two controls of the page share a name (WCAG 2.4.6):
 * `readAloudPrompt` reads an interaction's prompt, or the catalog its root references,
 * `readAloudText` an element of a body, a stem or a passage's paragraph, `readAloudLabel` an
 * element that holds its control after its words, in a Gap Match's sentence (a slot's label,
 * "least") or inside a table cell (a picture graph's category), `readAloudChoice` a choice,
 * `readAloudGroup` a Match's group, `readAloudRow` and `readAloudColumn` a row's and a column's
 * header of a Match laid out as a table, and `readAloudArea` an area of a graphic interaction's
 * image. A press whose recording cannot play tells the child so at the control, once, under the
 * title `readAloudFailedTitle`, in the words `readAloudFailed`: AlphaTest's player's
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
  readAloudPrompt: "Listen to question {n}",
  readAloudRow: "Listen to row {n}",
  readAloudText: "Listen to text {n}",
} as const;
