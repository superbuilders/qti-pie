/**
 * The words a Graphic Associate says: an Associate's, since the two make pairs alike, and the image
 * stage's. The server fills them from plate's message catalog (`labelsOf`) and passes them to the
 * island as plain strings, so no wording ships in the client's code. Each area's own name comes
 * with the area, not here.
 *
 * @module
 */
import { associateKeys } from "#plate/ui/associate/labels.ts";
import { graphicKeys } from "#plate/ui/graphic/labels.ts";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for every text a Graphic Associate writes for the child: an Associate's
 * (`associateKeys`) and its stage's (`graphicKeys`).
 */
export const graphicAssociateKeys = { ...associateKeys, ...graphicKeys } as const;

/**
 * Every text a Graphic Associate writes for the child, as the server filled it.
 */
export type GraphicAssociateLabels = Labels<typeof graphicAssociateKeys>;
