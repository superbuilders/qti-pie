/**
 * The account a hydrated page keeps of its media for plate's read-aloud suite
 * (`#specimen/ui/read-aloud-browser.test.ts`), installed before the page hydrates
 * (`#specimen/ui/hydrated.ts`): every media event of every recording from its entry into the page
 * on, in order, by the recording's name, its file's name without `.wav`, the page's frames' with
 * them; every moment two recordings sounded at once in one page; and every play the page has asked
 * for that has yet to settle. A play is asked for when its recording fires `play`, the answer of
 * the session or island a press reached, and it settles when the recording sounds (`playing`),
 * pauses, ends, fails at the element itself, or is emptied or aborted: the events with which HTML
 * settles a `play()`'s promise. A rule waits on what is certain to come whether the page is right
 * or broken: the frames after a press and the page's next idle period, which come after every
 * `play` the press caused, then every play asked for settled ({@link PageAccount.idle}); never on a
 * delay.
 *
 * Test support for plate's UI suite under `src/ui/`; it runs in the browser alone.
 *
 * @module
 * @see https://html.spec.whatwg.org/multipage/media.html#playing-the-media-resource
 */

/**
 * One recording as the page holds it now: its name, whether it is still in the document, has
 * ended, is muted, is paused and sounds, the file it plays, its control's pressed state and
 * notice, and its position.
 */
export interface Recording {
  readonly detached: boolean;
  readonly ended: boolean;
  readonly label: string;
  readonly muted: boolean;
  readonly notice: string;
  readonly paused: boolean;
  readonly pressed: string;
  readonly sounding: boolean;
  readonly src: string;
  readonly time: number;
}

/**
 * One thing the page saw: a media event of the recording named, at its place among every event
 * the account saw, from 0.
 */
export interface Seen {
  readonly at: number;
  readonly event: string;
  readonly label: string;
}

/**
 * What the suite reads and does in the page, on `window.account`.
 */
export interface PageAccount {
  /**
   * Follow a frame of the page as the page is followed, from now on: every media element in its
   * document, and every one that enters it.
   *
   * @param frame The frame's document.
   */
  readonly adopt: (frame: Document) => void;
  /**
   * Play a media element of the host's own, outside every island, as a host's media would: heard,
   * or muted and looping, as a decorative video plays; in the page, or in a frame of it. Its play
   * is left to settle as it will, a refusal among the ways: the account hears it by its events.
   *
   * @param src Its file.
   * @param muted Whether it is muted.
   * @param frame The key of the item whose frame it plays in, empty for the page.
   */
  readonly foreign: (src: string, muted: boolean, frame: string) => void;
  /**
   * Wait until every play the page has asked for has settled.
   *
   * @returns The wait.
   */
  readonly idle: () => Promise<void>;
  /**
   * Give every moment two recordings or more sounded at once in one page, by their names.
   */
  readonly overlaps: () => readonly string[];
  /**
   * Give every recording the page has followed.
   */
  readonly recordings: () => readonly Recording[];
  /**
   * Give every media event the page saw, in order.
   */
  readonly seen: () => readonly Seen[];
}

declare global {
  interface Window {
    /**
     * The page's account, once {@link installAccount} has run.
     */
    account?: PageAccount;
  }
}

/**
 * The media events the account records, each by its name.
 */
const accounted = [
  "abort",
  "canplaythrough",
  "emptied",
  "ended",
  "error",
  "pause",
  "play",
  "playing",
  "seeked",
] as const;

/**
 * The events that settle a play the page asked for: it sounds, pauses, ends, or its element is
 * emptied or its load aborted. An `error` settles it where the element itself fires it, a
 * `MediaError`; a failed `source` leaves the next to try.
 */
const settling: ReadonlySet<string> = new Set(["abort", "emptied", "ended", "pause", "playing"]);

/**
 * The events after which a recording no longer sounds.
 */
const silencing: ReadonlySet<string> = new Set(["abort", "emptied", "ended", "error", "pause"]);

/**
 * Name a recording by its file, the last segment of its address without `.wav`: its own `src`, or
 * its first `source`'s.
 *
 * @param element The recording.
 * @returns Its name.
 */
const fileOf = (element: HTMLMediaElement): string => {
  const file =
    (element.getAttribute("src") ?? element.querySelector("source")?.getAttribute("src") ?? "")
      .split("/")
      .at(-1) ?? "";
  const named = file.endsWith(".wav") ? file.slice(0, -".wav".length) : file;

  return named === "" ? "unnamed" : named;
};

/**
 * Tell whether a node is a media element, by its name, which holds in every page's realm.
 *
 * @param node The node.
 * @returns Whether it is an `audio` or a `video`.
 */
const isMediaNode = (node: Node): node is HTMLMediaElement =>
  node.nodeName === "AUDIO" || node.nodeName === "VIDEO";

/**
 * Tell whether a node is an element, by its type, which holds in every page's realm.
 *
 * @param node The node.
 * @returns Whether it is an element.
 */
const isElementNode = (node: Node): node is Element => node.nodeType === Node.ELEMENT_NODE;

/**
 * Give the media elements a node that entered the page is or holds.
 *
 * @param node The node.
 * @returns Its media elements.
 */
const mediaIn = (node: Node): readonly HTMLMediaElement[] => {
  if (isMediaNode(node)) {
    return [node];
  }

  return isElementNode(node) ? [...node.querySelectorAll<HTMLMediaElement>("audio, video")] : [];
};

/**
 * Install the page's account, from now on: it follows every media element already in the page and
 * every one that enters it, the page's frames' as they are adopted.
 */
export const installAccount = (): void => {
  const labels = new Map<HTMLMediaElement, string>();
  const sounding = new Set<HTMLMediaElement>();
  const pending = new Set<HTMLMediaElement>();
  const followed = new WeakSet<HTMLMediaElement>();
  const seen: Seen[] = [];
  const overlaps: string[] = [];
  let waiting: (() => void)[] = [];

  /**
   * Name a recording, as it is named when it first meets the account, kept once it leaves.
   *
   * @param element The recording.
   * @returns Its name.
   */
  const labelOf = (element: HTMLMediaElement): string => {
    const known = labels.get(element) ?? fileOf(element);

    labels.set(element, known);

    return known;
  };

  /**
   * Tell whether a recording sounds now: it has played since its last stop, it is not paused or
   * ended, though the event that says so may not have reached the page yet, as when a script
   * paused it a moment ago, and it is heard, neither muted nor silent.
   *
   * @param element The recording.
   * @returns Whether it sounds.
   */
  const audible = (element: HTMLMediaElement): boolean =>
    sounding.has(element) &&
    !element.paused &&
    !element.ended &&
    !element.muted &&
    element.volume > 0;

  /**
   * Release every wait for the page's plays to settle, where none is pending.
   */
  const released = (): void => {
    if (pending.size > 0) {
      return;
    }

    const done = waiting;

    waiting = [];

    for (const resume of done) {
      resume();
    }
  };

  /**
   * Account for one media event of a recording: write it, keep what it says of the recording's
   * sound and of the play it settles, and note two recordings sounding at once in one page, a
   * frame being a page of its own.
   *
   * @param event The event.
   * @param element The recording.
   */
  const heard = (event: Event, element: HTMLMediaElement): void => {
    const { type } = event;

    seen.push({ at: seen.length, event: type, label: labelOf(element) });

    if (type === "play") {
      pending.add(element);
    } else if (settling.has(type) || (type === "error" && event.target === element)) {
      pending.delete(element);
      released();
    }

    if (type === "playing") {
      sounding.add(element);

      const voices = [...sounding].filter(
        (each) => audible(each) && each.ownerDocument === element.ownerDocument,
      );

      if (voices.length > 1) {
        overlaps.push(voices.map(labelOf).join(" + "));
      }
    } else if (silencing.has(type)) {
      sounding.delete(element);
    }
  };

  /**
   * Account for a recording from its entry into the page on: every media event it fires, heard at
   * the element itself as it is captured, its `source`s' among them, since an element React has
   * taken out of the document still fires its events, but no longer to the document.
   *
   * @param element The recording.
   */
  const follow = (element: HTMLMediaElement): void => {
    for (const type of accounted) {
      element.addEventListener(
        type,
        (event) => {
          heard(event, element);
        },
        { capture: true },
      );
    }
  };

  /**
   * Follow every media element among nodes that entered the page, and inside them.
   *
   * @param nodes What entered the page.
   */
  const entered = (nodes: Iterable<Node>): void => {
    for (const element of [...nodes].flatMap(mediaIn).filter((each) => !followed.has(each))) {
      followed.add(element);
      labelOf(element);
      follow(element);
    }
  };

  /**
   * Follow every media element of a document, and every one that enters it.
   *
   * @param page The document.
   */
  const watch = (page: Document): void => {
    entered([page.body]);
    new MutationObserver((records) => {
      entered(records.flatMap((record) => [...record.addedNodes]));
    }).observe(page.body, { childList: true, subtree: true });
  };

  watch(document);

  window.account = {
    adopt: watch,
    foreign: (src, muted, frame) => {
      const page =
        frame === ""
          ? document
          : (document.querySelector<HTMLIFrameElement>(`iframe[data-frame="${frame}"]`)
              ?.contentDocument ?? document);
      const element = page.createElement("audio");

      element.loop = muted;
      element.muted = muted;
      element.src = src;
      page.body.append(element);
      entered([element]);
      void Promise.allSettled([element.play()]);
    },
    idle: async () => {
      const { promise, resolve } = Promise.withResolvers<null>();

      waiting.push(() => {
        resolve(null);
      });
      released();
      await promise;
    },
    overlaps: () => [...overlaps],
    recordings: () =>
      [...labels.keys()].map((element) => {
        const part = element.closest("[data-slot=plate-read-aloud]");

        return {
          detached: !element.isConnected,
          ended: element.ended,
          label: labelOf(element),
          muted: element.muted,
          notice: part?.querySelector("[data-slot=plate-read-aloud-notice]")?.textContent ?? "",
          paused: element.paused,
          pressed: part?.querySelector("button")?.getAttribute("aria-pressed") ?? "",
          sounding: audible(element),
          src: element.currentSrc,
          time: element.currentTime,
        };
      }),
    seen: () => [...seen],
  };
};
