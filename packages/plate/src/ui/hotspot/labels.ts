/**
 * The words a Hotspot says: why a pick was refused, and its stage's words. The server fills them
 * from plate's message catalog, or from the author's own message (`labelsOf`), and passes them to
 * the island as plain strings, so no wording ships in the client's code. Each hotspot's own name
 * comes with the hotspot, not here.
 *
 * @module
 */
import { graphicKeys } from "#plate/ui/graphic/labels.ts";
import type { LabelKeys, Labels } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for every text a Hotspot writes for the child: its own, and its stage's
 * (`graphicKeys`).
 */
export const hotspotKeys = {
  ...graphicKeys,
  /**
   * Said and shown when a pick past `max-choices` is refused, with `{n}` for `max-choices`, which
   * the island fills. The server gives the author's `data-max-selections-message` here when the
   * interaction has one (QTI 3.0 information model 5.68.4), so a refusal reads the same on the
   * page as in the server's validation.
   */
  limit: "hotspotLimit",
} as const satisfies LabelKeys<"limit" | "picture" | "scroll">;

/**
 * Every text a Hotspot writes for the child, as the server filled it.
 */
export type HotspotLabels = Labels<typeof hotspotKeys>;
