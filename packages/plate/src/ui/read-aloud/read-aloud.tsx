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
 * - **One at a time.** Any other media of the page that starts to play, another read-aloud's or a
 *   Media interaction's, stops this one: a `play` event, which does not bubble, is heard at the
 *   document as it is captured.
 * - **Stopping.** The recording stops when the page is hidden, as when the candidate switches tab,
 *   and when React unmounts the island, as when the candidate goes on to another item, so nothing
 *   reads on where the candidate cannot see what it reads.
 *
 * The parts: `plate-read-aloud`, a `span`, with `data-playing` while the recording plays, holding
 * UI SDK's `toggle` and the `audio`. A `span` is phrasing content, so it stands wherever the shell
 * places it. No `class` and no `style`: the item's stylesheet styles the slot and its state.
 *
 * @module
 */
import { Toggle } from "@ui-sdk/react/toggle";
import { useEffect, useRef, useState } from "react";
import { flag } from "#plate/ui/attributes.ts";

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
 * plate's message catalog, and the recording's files in document order, one or more.
 */
export interface ReadAloudProps {
  readonly label: string;
  readonly sources: readonly [ReadAloudSource, ...ReadAloudSource[]];
}

/**
 * Leave the recording at rest where a browser refuses to play it, as when it can play none of its
 * formats: its `pause` never comes, and the control stays unpressed.
 */
const playRefused = (): undefined => undefined;

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
 * Play a recording from its start. A module function, not the press handler's own lines: the React
 * Compiler refuses a component that writes to the recording after its effect has read it.
 *
 * @param element The recording.
 */
const play = (element: HTMLAudioElement): void => {
  element.currentTime = 0;
  element.play().catch(playRefused);
};

/**
 * Render the control that reads one part of the item aloud from its recording.
 *
 * @param props The control's name and the recording's files ({@link ReadAloudProps}).
 * @returns The `plate-read-aloud` part.
 */
export const ReadAloud = ({ label, sources }: ReadAloudProps) => {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect((): (() => void) | undefined => {
    const element = audio.current ?? undefined;
    if (element === undefined) {
      return undefined;
    }

    const listeners = new AbortController();
    const { signal } = listeners;
    const playingNow = (): void => {
      setPlaying(true);
    };
    const resting = (): void => {
      setPlaying(false);
    };

    element.addEventListener("play", playingNow, { signal });
    element.addEventListener("pause", resting, { signal });
    element.addEventListener("ended", resting, { signal });
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

    return () => {
      listeners.abort();
      stop(element);
    };
  }, []);

  /**
   * Answer a press: play the recording from its start, or stop it while it plays. The toggle's own
   * change is cancelled, since the recording's events decide whether it is pressed.
   *
   * @param pressed Whether the press asks the toggle to be pressed.
   */
  const press = (pressed: boolean): void => {
    const element = audio.current ?? undefined;
    if (element === undefined) {
      return;
    }

    if (!pressed) {
      stop(element);

      return;
    }

    play(element);
  };

  return (
    <span data-playing={flag(playing)} data-slot="plate-read-aloud">
      <Toggle
        pressed={playing}
        onPressedChange={(next, details) => {
          details.cancel();
          press(next);
        }}
      >
        {label}
      </Toggle>
      <audio preload="none" ref={audio}>
        {sources.map((source, index) => (
          <source key={index} src={source.src} type={source.type} />
        ))}
      </audio>
    </span>
  );
};
