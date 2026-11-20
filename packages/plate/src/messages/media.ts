/**
 * The English texts of the Media interaction's island and review (Q-14, `#plate/ui/media/`). One
 * area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * Media's texts, keyed by the role each plays. The island's play control is `mediaPlay`, or
 * `mediaPause` while the media plays, and says `mediaLoading` while a play it asked for has not
 * begun; a video's captions toggle is `mediaCaptions`. Beside it, `mediaPlaysLeft` says how many
 * plays `max-plays` leaves, `{n}` that number, and `mediaAtLeast` asks for `min-plays`, `{n}` that
 * number, until the child has played that many; `mediaAtLeastOnce` is its singular, for a
 * `min-plays` of 1. A play past `max-plays` is refused and says `mediaNoPlaysLeft`. A review or
 * solution shows the count it holds as `mediaPlays`, `{n}` the count.
 */
export const mediaMessages = {
  mediaAtLeast: "Play it at least {n} times.",
  mediaAtLeastOnce: "Play it at least once.",
  mediaCaptions: "Captions",
  mediaCheckAtLeast: "Play the media at least {n} times.",
  mediaCheckAtLeastOnce: "Play the media at least once.",
  mediaCheckAtMost: "The media can be played at most {n} times.",
  mediaCheckAtMostOnce: "The media can be played only once.",
  mediaLoading: "Loading",
  mediaNoPlaysLeft: "No plays left.",
  mediaPause: "Pause",
  mediaPlay: "Play",
  mediaPlays: "Plays: {n}",
  mediaPlaysLeft: "Plays left: {n}",
} as const;
