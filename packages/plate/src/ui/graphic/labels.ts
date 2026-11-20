/**
 * The words the image stage says: the name of last resort of its region, and the hint that
 * describes the region while it scrolls. The server fills them from plate's message catalog
 * (`labelsOf`) and an island passes them to its stage as plain strings, so no wording ships in the
 * client's code.
 *
 * @module
 */
import type { LabelKeys, Labels } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for every text the image stage writes for the child, which each graphic
 * kind's own record spreads.
 */
export const graphicKeys = {
  /**
   * The name of last resort of the stage's region, where neither the interaction nor its image
   * names it: the catalog's word for a picture.
   */
  picture: "graphicPicture",
  /**
   * The description of the stage's region while it scrolls across: its container is narrower
   * than the width its targets need, so the child scrolls it to see the whole image.
   */
  scroll: "graphicScroll",
} as const satisfies LabelKeys<"picture" | "scroll">;

/**
 * Every text the image stage writes for the child, as the server filled it.
 */
export type GraphicLabels = Labels<typeof graphicKeys>;
