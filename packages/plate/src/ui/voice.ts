/**
 * The page's one voice: of the recordings and the media a page plays, one sounds at a time. Plate's
 * players join it while they are mounted ({@link joinVoice}): read-aloud's control
 * (`#plate/ui/read-aloud/read-aloud.tsx`) and the Media interaction's island
 * (`#plate/ui/media/media.tsx`), of every item the page shows.
 *
 * - **A press takes the voice.** A player takes the voice as it plays ({@link speak}): a press, or a
 *   Media's play its limit allows. That pauses every other media element of the page that sounds,
 *   at once, in the press's own task, so the last press is the one heard however close the presses
 *   come, two in one task included, whether or not a recording a press left has settled its
 *   `play()`, and whatever sounded before any player joined the page.
 * - **Any other start takes it too.** While a player is joined, a media element of the page that is
 *   no player's and starts to play takes the voice as its `play` event is heard at the document, as
 *   it is captured (`play` does not bubble): a host's own media. A `play` event whose element is
 *   paused again by the time it is heard, as one a later press paused, takes nothing. A player's
 *   own `play` takes nothing here: each player takes the voice itself once it has decided that the
 *   play stands, so a Media's play refused past its limit stops nothing.
 * - **A muted media is no voice.** A media element muted or at volume 0, such as a decorative looping
 *   video, neither takes the voice nor loses it; once it is heard while it plays, unmuted or turned
 *   up, as its native controls let the candidate, it takes the voice as its `volumechange` is heard
 *   at the document, a player's as any other's, since that change is the candidate's own.
 * - **The page is its document.** The voice holds the media elements of the players' document tree: a
 *   host's media outside it, an `Audio()` never placed in the document, or one in a shadow root or
 *   another frame, is neither paused nor heard.
 *
 * A media element that loses the voice is paused, nothing more: each player hears its own pause,
 * read-aloud's item session resting and a Media keeping the play it counted (spec reading 245).
 *
 * @module
 * @see {@link https://html.spec.whatwg.org/multipage/media.html#event-media-play | HTML, the media element's `play` event}
 */

/**
 * The media elements of plate's players mounted now, each joined to the voice.
 */
const joined = new Set<HTMLMediaElement>();

/**
 * Tell whether a media element is heard: it is neither muted nor at volume 0.
 *
 * @param element The media element.
 * @returns Whether it is heard when it plays.
 */
const heard = (element: HTMLMediaElement): boolean => !element.muted && element.volume > 0;

/**
 * Take the page's voice for a media element that plays, or is about to: every other media element
 * of the page that plays and is heard is paused now. A muted element takes nothing.
 *
 * @param element The media element.
 */
export const speak = (element: HTMLMediaElement): void => {
  if (!heard(element)) {
    return;
  }

  for (const other of element.ownerDocument.querySelectorAll<HTMLMediaElement>("audio, video")) {
    if (other !== element && !other.paused && heard(other)) {
      other.pause();
    }
  }
};

/**
 * Hear a `play` event at the document: a media element of the page that is no player's and starts
 * to play takes the voice, unless it is paused again already.
 *
 * @param event The event, as it is captured on the way to its element.
 */
const started = (event: Event): void => {
  const { target } = event;

  if (target instanceof HTMLMediaElement && !joined.has(target) && !target.paused) {
    speak(target);
  }
};

/**
 * Hear a `volumechange` at the document: a media element of the page that plays and is now heard
 * takes the voice. A change that leaves it unheard, or that comes while it is paused, takes
 * nothing.
 *
 * @param event The event, as it is captured on the way to its element (it does not bubble).
 */
const turnedUp = (event: Event): void => {
  const { target } = event;

  if (target instanceof HTMLMediaElement && !target.paused) {
    speak(target);
  }
};

/**
 * Join a player's media element to the page's voice while the player is mounted: the page's
 * listeners are there from the first player joined to the last one's leaving.
 *
 * @param element The player's media element.
 * @returns The leave, which the player runs as it unmounts: the element is a player's no more, and
 *   the last player's leave takes the page's listeners away.
 */
export const joinVoice = (element: HTMLMediaElement): (() => void) => {
  if (joined.size === 0) {
    element.ownerDocument.addEventListener("play", started, { capture: true });
    element.ownerDocument.addEventListener("volumechange", turnedUp, { capture: true });
  }

  joined.add(element);

  return () => {
    joined.delete(element);

    if (joined.size === 0) {
      element.ownerDocument.removeEventListener("play", started, { capture: true });
      element.ownerDocument.removeEventListener("volumechange", turnedUp, { capture: true });
    }
  };
};
