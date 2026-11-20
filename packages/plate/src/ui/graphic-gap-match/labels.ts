/**
 * The words a Graphic Gap Match says: the placement primitive's announcements and refusals, and
 * its image stage's. The server fills them from plate's message catalog, or from the author's own
 * message (`labelsOf`), and passes them to the island as plain strings, so no wording ships in the
 * client's code. Each hotspot's own name comes with the hotspot, not here.
 *
 * @module
 */
import { graphicKeys } from "#plate/ui/graphic/labels.ts";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import { placementKeys } from "#plate/ui/placement/labels.ts";

/**
 * The catalog's message for every text a Graphic Gap Match writes for the child: the placement
 * primitive's (`placementKeys`) and its stage's (`graphicKeys`). The server gives the author's
 * `data-max-selections-message` in place of `totalReached` where the interaction has one, so a
 * refusal reads the same on the page as in the server's validation.
 */
export const graphicGapMatchKeys = { ...placementKeys, ...graphicKeys } as const;

/**
 * Every text a Graphic Gap Match writes for the child, as the server filled it.
 */
export type GraphicGapMatchLabels = Labels<typeof graphicGapMatchKeys>;
