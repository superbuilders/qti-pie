"use client";

/**
 * Read-aloud's client island: the control that plays a `spoken` catalog card's recording to a
 * candidate whose supports enable the spoken support (`Supports.readAloud` in
 * `#plate/supports.ts`), beside the part of the item the card's catalog is referenced from.
 *
 * QTI stores read-aloud as dormant catalog content: "A catalog holds support-specific dormant
 * content that can be made active (a part of the perceivable content presented to the candidate)
 * based on the candidate's PNP information (or an assessment program's settings)" (information
 * model §5.28), and a pre-recorded reading is a `spoken` card's entry whose `qti-file-href`s are
 * the sound files, "the audio as an alternative to the written text provided in the default
 * content" (implementation guide §5.2.8.3). The server shell resolves the card under the
 * candidate's supports and hands this island the chosen entry's audio files
 * (`readAloudOf` in `#plate/ui/item/contents/catalog.tsx`).
 *
 * - **The recording.** An `audio` element with no controls, which a browser does not draw, holds one
 *   `source` per audio file, in document order, each with its `mime-type` as `type`, so the browser
 *   plays the first format it can (HTML's source selection) and plate picks none. It loads nothing
 *   until it is played (`preload="none"`).
 * - **The control.** UI SDK's Toggle: a native button, so Tab reaches it and Enter or Space press it
 *   (WCAG 2.1.1). Its name, the label the server gives, says what it reads and stays the same while
 *   its pressed state, `aria-pressed`, says whether it plays (WCAG 4.1.2), as UI SDK asks of a
 *   toggle. Pressed, it plays the recording from its start; pressed while it plays, it stops it and
 *   goes back to the start. The pressed state follows the recording's own events, so a play the
 *   browser refuses leaves it unpressed.
 * - **The item's session.** What plays is the item's read-aloud session's to say
 *   (`#plate/ui/read-aloud/session.tsx`), which every control of the item mounts in: the item's
 *   first press, where it is a prompt's, plays the prompt and then every other control in turn,
 *   prompts, texts and choices, by its `role`, and any other press plays its own part alone.
 * - **The notice.** A press that cannot play is told so once, at the control that failed, in
 *   `plate-read-aloud-notice`, an assertive live region (WCAG 4.1.3) that stays in the page empty,
 *   so the words it then says are read; the next press takes them down. It cannot play where every
 *   `source` fails, where `play()` is refused but with an `AbortError`, or where a `MediaError` but
 *   `MEDIA_ERR_ABORTED` reaches the recording: both of those follow a stop the page made.
 * - **One at a time.** Any other media of the page that starts to play, another item's read-aloud or
 *   a Media interaction's, stops this one: a `play` event, which does not bubble, is heard at the
 *   document as it is captured.
 * - **Stopping.** The recording stops when the page is hidden, as when the candidate switches tab,
 *   and when React unmounts the island, as when the candidate goes on to another item, so nothing
 *   reads on where the candidate cannot see what it reads.
 *
 * The parts: `plate-read-aloud`, a `span`, with `data-playing` while the recording plays, holding
 * UI SDK's `toggle`, the `audio` and `plate-read-aloud-notice`, a `span` holding the notice's title
 * in a `strong` and its description while it is told. A `span` is phrasing content, so it stands
 * wherever the shell places it. No `class` and no `style`: the item's stylesheet styles the slots
 * and their state.
 *
 * @module
 */
import { Toggle } from "@ui-sdk/react/toggle";
import { useEffect, useRef, useState } from "react";
import type { ReadAloudRole } from "#plate/read-aloud/session.ts";
import { flag } from "#plate/ui/attributes.ts";
import { useReadAloudSession } from "#plate/ui/read-aloud/session.tsx";
import type { ReadAloudPort } from "#plate/ui/read-aloud/session.tsx";

/**
 * One recording file as the island plays it: its address in the configuration's `assets`, and its
 * `mime-type` as the card's `qti-file-href` writes it.
 */
export interface ReadAloudSource {
  readonly src: string;
  readonly type: string;
}

/**
 * What the server gives a read-aloud island, every member serializable: the control's name, from
 * plate's message catalog, what it reads, which places it in the item's chain, and the recording's
 * files in document order, one or more.
 */
export interface ReadAloudProps {
  readonly label: string;
  readonly role: ReadAloudRole;
  readonly sources: readonly [ReadAloudSource, ...ReadAloudSource[]];
}

/**
 * Stop a recording and take it back to its start, so the next press reads it from the beginning.
 *
 * @param element The recording.
 */
const stop = (element: HTMLAudioElement): void => {
  element.pause();
  element.currentTime = 0;
};

/**
 * Play a recording from its start, loading it again where it holds nothing it can play: once every
 * `source` has failed, the element waits for a new one (its `networkState` is `NETWORK_NO_SOURCE`),
 * and once a `MediaError` has reached it, it keeps that error; in neither does `play()` try the
 * sources again, so a press that tries again would hear nothing and be told nothing. A module
 * function, not the press handler's own lines: the React Compiler refuses a component that writes
 * to the recording after its effect has read it.
 *
 * @param element The recording.
 * @returns The promise `play()` gives.
 * @see https://html.spec.whatwg.org/multipage/media.html#concept-media-load-algorithm
 */
const play = (element: HTMLAudioElement): Promise<void> => {
  if (element.error !== null || element.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
    element.load();
  }

  element.currentTime = 0;

  return element.play();
};

/**
 * Report a recording's `error` event as the refusal it is: a `MediaError` at the `audio` itself,
 * or, at its last `source`, every source failed, since the browser tries them in order and fires
 * `error` at each one that fails. An `error` at any other `source` leaves the next to try.
 *
 * @param event The `error` event, heard as it is captured on the way to its target.
 * @param element The recording.
 * @param port The control's port.
 * @see https://html.spec.whatwg.org/multipage/media.html#concept-media-load-algorithm
 */
const reportError = (event: Event, element: HTMLAudioElement, port: ReadAloudPort): void => {
  if (event.target === element && element.error !== null) {
    port.refused({ code: element.error.code, kind: "media-error" });
  } else if (event.target === element.lastElementChild) {
    port.refused({ kind: "no-source" });
  }
};

/**
 * Render the control that reads one part of the item aloud from its recording.
 *
 * @param props The control's name, what it reads and the recording's files
 *   ({@link ReadAloudProps}).
 * @returns The `plate-read-aloud` part.
 * @throws {ReadAloudOutsideSession} When it is rendered outside its item's `<ReadAloudSession>`.
 */
export const ReadAloud = ({ label, role, sources }: ReadAloudProps) => {
  const { failed, mount } = useReadAloudSession();
  const audio = useRef<HTMLAudioElement>(null);
  const port = useRef<ReadAloudPort>(undefined);
  const [playing, setPlaying] = useState(false);
  const [told, setTold] = useState(false);

  useEffect((): (() => void) | undefined => {
    const element = audio.current ?? undefined;
    if (element === undefined) {
      return undefined;
    }

    const control = mount({
      element,
      hush: () => {
        setTold(false);
      },
      play: () => play(element),
      role,
      stop: () => {
        stop(element);
      },
      tell: () => {
        setTold(true);
      },
    });
    const listeners = new AbortController();
    const { signal } = listeners;

    element.addEventListener(
      "play",
      () => {
        setPlaying(true);
      },
      { signal },
    );
    // A recording that plays to its end fires `pause` before `ended`, while `ended` already holds,
    // and a `pause` that a press to play again overtook finds the recording playing: neither is a
    // stop.
    element.addEventListener(
      "pause",
      () => {
        setPlaying(false);

        if (element.paused && !element.ended) {
          control.paused();
        }
      },
      { signal },
    );
    element.addEventListener(
      "ended",
      () => {
        setPlaying(false);
        control.ended();
      },
      { signal },
    );
    element.addEventListener(
      "error",
      (event) => {
        reportError(event, element, control);
      },
      { capture: true, signal },
    );
    document.addEventListener(
      "play",
      (event) => {
        if (event.target !== element && !element.paused) {
          stop(element);
        }
      },
      { capture: true, signal },
    );
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "hidden") {
          stop(element);
        }
      },
      { signal },
    );
    port.current = control;

    return () => {
      listeners.abort();
      stop(element);
      control.unmount();
      port.current = undefined;
    };
  }, [mount, role]);

  return (
    <span data-playing={flag(playing)} data-slot="plate-read-aloud">
      <Toggle
        pressed={playing}
        onPressedChange={(next, details) => {
          details.cancel();

          if (next) {
            port.current?.press();
          } else {
            port.current?.release();
          }
        }}
      >
        {label}
      </Toggle>
      <audio preload="none" ref={audio}>
        {sources.map((source, index) => (
          <source key={index} src={source.src} type={source.type} />
        ))}
      </audio>
      <span data-slot="plate-read-aloud-notice" role="alert">
        {told ? (
          <>
            <strong>{failed.title}</strong> {failed.description}
          </>
        ) : null}
      </span>
    </span>
  );
};
