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
 * - **The page is its document, and the voice is the page's.** The voice holds the media elements of
 *   one document tree, and it is held there, never in this module: a player joined is marked on its
 *   own media element ({@link joinedMark}), and the document listens while a player of its own is
 *   marked in it, so two pages one copy of plate serves (a page and a frame it renders into, or two
 *   test pages in one run) each have their own voice, and nothing of a page's voice outlives it. A
 *   host's media outside the document, an `Audio()` never placed in it, or one in a shadow root or
 *   another page's frame, is neither paused nor heard.
 *
 * A media element that loses the voice is paused, nothing more: each player hears its own pause,
 * read-aloud's item session resting and a Media keeping the play it counted (spec reading
 * `media-play-under-one-voice`).
 *
 * @module
 * @see {@link https://html.spec.whatwg.org/multipage/media.html#event-media-play | HTML, the media element's `play` event}
 */

/**
 * The attribute a player's media element carries while the player is joined to its page's voice:
 * the page's own record of its players, in its own document tree.
 */
const joinedMark = "data-plate-voice";

/**
 * Tell whether an event's target is a media element, by its own local name, which holds in every
 * page's realm: a frame's elements are no instances of this realm's `HTMLMediaElement`.
 *
 * @param target The target.
 * @returns Whether it is an `audio` or a `video`.
 */
const isMedia = (target: EventTarget | null): target is HTMLMediaElement =>
  target !== null &&
  "localName" in target &&
  (target.localName === "audio" || target.localName === "video");

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

  if (isMedia(target) && !target.hasAttribute(joinedMark) && !target.paused) {
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

  if (isMedia(target) && !target.paused) {
    speak(target);
  }
};

/**
 * Join a player's media element to its page's voice while the player is mounted: the element is
 * marked a player's, and its document listens from the first player joined there to the last one's
 * leaving. Adding a listener the document holds already adds nothing.
 *
 * @param element The player's media element.
 * @returns The leave, which the player runs as it unmounts: the element is a player's no more, and
 *   the leave of the document's last player takes its listeners away.
 */
export const joinVoice = (element: HTMLMediaElement): (() => void) => {
  const page = element.ownerDocument;

  element.setAttribute(joinedMark, "");
  page.addEventListener("play", started, { capture: true });
  page.addEventListener("volumechange", turnedUp, { capture: true });

  return () => {
    element.removeAttribute(joinedMark);

    if (page.querySelector(`[${joinedMark}]`) === null) {
      page.removeEventListener("play", started, { capture: true });
      page.removeEventListener("volumechange", turnedUp, { capture: true });
    }
  };
};
