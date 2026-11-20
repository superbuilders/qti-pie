/**
 * The words a picks group says, a Choice's and a Hot Text's alike: why a pick was refused. The
 * server fills them from plate's message catalog, or from the author's own message, through
 * `labelsOf` (`#plate/ui/item/interactions/labels.ts`), and passes them to the island as plain
 * strings, so no wording ships in the client's code. A hottext's own name comes with the hottext,
 * and a Hotspot says its own words (`#plate/ui/hotspot/labels.ts`).
 *
 * @module
 */
import type { LabelKeys } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for each text a Choice or a Hot Text writes for the child.
 */
export const picksKeys = {
  /**
   * Said and shown when a pick past `max-choices` is refused, with `{n}` for `max-choices`, which
   * the island fills. The author's `data-max-selections-message` stands in its place where the
   * interaction writes one (QTI 3.0 information model 5.30.6, 5.66.4), so a refusal reads the same
   * on the page as in the server's validation.
   */
  limit: "choiceLimit",
} as const satisfies LabelKeys<"limit">;
