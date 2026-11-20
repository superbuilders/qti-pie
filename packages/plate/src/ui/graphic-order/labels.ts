/**
 * The words a Graphic Order says: an Order's, since its chips are named and its positions numbered
 * as an Order's are, and its stage's. The server fills them from plate's message catalog
 * (`labelsOf`) and passes them to the island as plain strings, so no wording ships in the client's
 * code. Each hotspot's own name comes with the hotspot, not here.
 *
 * @module
 */
import { graphicKeys } from "#plate/ui/graphic/labels.ts";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import { orderKeys } from "#plate/ui/order/labels.ts";

/**
 * The catalog's message for every text a Graphic Order writes for the child: an Order's
 * (`orderKeys`) and its stage's (`graphicKeys`).
 */
export const graphicOrderKeys = { ...orderKeys, ...graphicKeys } as const;

/**
 * Every text a Graphic Order writes for the child, as the server filled it.
 */
export type GraphicOrderLabels = Labels<typeof graphicOrderKeys>;
