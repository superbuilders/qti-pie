/**
 * The English texts of the Hotspot interaction's island and review (Q-10, `#plate/ui/hotspot/`).
 * One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * Hotspot's texts, keyed by the role each plays. A Hotspot says `hotspotLimit`, `{n}` its
 * `max-choices`, when a pick past them is refused, unless the author wrote a
 * `data-max-selections-message` to say instead. An area with no `hotspot-label` is named by the
 * stage's `graphicAreaOf`.
 */
export const hotspotMessages = {
  hotspotLimit: "You can choose up to {n} areas. Take one back to choose another.",
} as const;
