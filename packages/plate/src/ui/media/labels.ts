/**
 * The words a Media says: its control's names and the plays it counts. The server fills them from
 * plate's message catalog (`labelsOf` in `#plate/ui/item/interactions/labels.ts`) and passes them
 * to the island as plain strings, so no wording ships in the client's code. The sentence asking
 * for `min-plays` is the island's `least`, which the server writes whole.
 *
 * @module
 */
import type { LabelKeys } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for each text a Media writes for the child.
 */
export const mediaKeys = {
  /**
   * The Captions toggle's name, its state its `aria-pressed`.
   */
  captions: "mediaCaptions",
  /**
   * What a screen reader hears once a play the control asked for has waited a second to begin,
   * the media still loading: UI SDK Button's `pendingAnnouncement`.
   */
  loading: "mediaLoading",
  /**
   * Said when a play past `max-plays` is refused, as the media's own controls can ask for one.
   */
  noPlaysLeft: "mediaNoPlaysLeft",
  /**
   * The control's name while the media plays.
   */
  pause: "mediaPause",
  /**
   * The control's name while the media does not play.
   */
  play: "mediaPlay",
  /**
   * Shown beside the control, and describing it, while `max-plays` limits the plays, with `{n}`
   * for how many it still allows, which the island fills.
   */
  playsLeft: "mediaPlaysLeft",
} as const satisfies LabelKeys<
  "captions" | "loading" | "noPlaysLeft" | "pause" | "play" | "playsLeft"
>;
