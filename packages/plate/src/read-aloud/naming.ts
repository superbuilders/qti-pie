/**
 * The names of read-aloud's controls on an item's page (spec reading 237): one namer for the whole
 * page, the item's own content and its passages', which names every control as the page makes it,
 * by the part it reads and its place among the page's controls of that part, from 1, so no two
 * controls of the page share a name (WCAG 2.4.6). A control is made only through the page's one
 * read-aloud (`readAloudOf` in `#plate/ui/item/contents/catalog.tsx`), which takes each name from
 * the page's namer: a place never restarts at an interaction, a run or a document. The page makes
 * its controls in document order, the passages a pane shows before the question, so each part's
 * places run in the order the child meets them. Pure, and safe to import on the server.
 *
 * @module
 */
import type { MessageKey } from "#plate/messages.ts";

/**
 * The catalog's names of read-aloud's control, by the part it reads, each with `{n}`, its place
 * among the page's controls of that part: `readAloudPrompt` an interaction's prompt or the catalog
 * its root references; `readAloudText` an element of a body; `readAloudLabel` an element that
 * holds its control after its words, in a table cell or a Gap Match's sentence;
 * `readAloudChoice` an option the child picks, moves or orders; `readAloudGroup` a Match's group;
 * `readAloudRow` and `readAloudColumn` a row's and a column's header of a Match laid out as a
 * table; and `readAloudArea` an area of a graphic interaction's image.
 */
export type SpokenPart = Extract<
  MessageKey,
  | "readAloudArea"
  | "readAloudChoice"
  | "readAloudColumn"
  | "readAloudGroup"
  | "readAloudLabel"
  | "readAloudPrompt"
  | "readAloudRow"
  | "readAloudText"
>;

/**
 * The page's namer of its read-aloud controls.
 */
export interface Namer {
  /**
   * Give the place of the next control the page makes of a part: 1 for its first, and one more for
   * each the page made of that part before.
   *
   * @param part The part the control reads.
   * @returns Its place among the page's controls of that part.
   */
  readonly next: (part: SpokenPart) => number;
}

/**
 * Make the namer of one page, which names its controls from 1 in each part. One page, one namer:
 * the item's render makes it once and hands it to every read-aloud of the page.
 *
 * @returns The namer.
 */
export const pageNamer = (): Namer => {
  const made = new Map<SpokenPart, number>();

  return {
    next: (part) => {
      const n = (made.get(part) ?? 0) + 1;

      made.set(part, n);

      return n;
    },
  };
};
