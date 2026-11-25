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
   * Shown beside the control, as an alert a screen reader says at once, when the media cannot play:
   * every `source` failed, or a `MediaError` reached it. The control's next press clears it.
   */
  failed: "mediaFailed",
  /**
   * What a screen reader hears, politely, as the control asks for a play of a media that has yet
   * to load; the control is its Pause meanwhile.
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
  "captions" | "failed" | "loading" | "noPlaysLeft" | "pause" | "play" | "playsLeft"
>;
