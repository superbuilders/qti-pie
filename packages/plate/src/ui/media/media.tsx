"use client";

/**
 * The Media interaction's client island (`qti-media-interaction`, Q-14): the author's `audio` or
 * `video` as the server rendered it, a large Play control beside it, and the plays the child makes
 * counted into the response, a single `integer` (QTI 3.0 information model 5.92).
 *
 * What counts as a play, and what is refused, is `#plate/ui/media/plays.ts`'s: the island listens
 * to the media element and runs its step at each `play`, `pause`, `ended` and each `seeking` that
 * brings the position back to the start, so the author's native controls, where the author asked
 * for them, count and refuse exactly as the island's own control does. After each counted play the
 * count is the response's one text; until the first, the island posts nothing, and the response is
 * NULL.
 *
 * - **Autostart.** The server writes no `autoplay`: with `autostart` the island starts the media
 *   itself once it is listening, so the play is counted, and only while the response counts no play
 *   yet, so a restored attempt does not spend a play by loading. A browser that refuses an unmuted
 *   start without a gesture leaves the media for the child's press.
 * - **Loop.** The server writes the interaction's `loop` on the element, and each wrap round is a
 *   play. Once the plays reach `max-plays` the island turns the loop off, so the last play ends
 *   rather than wrapping into one more, and gives it back as rendered when it lets the media go.
 * - **Hidden or removed.** The media pauses whenever React unmounts the island or hides it (an
 *   `<Activity>` the host hides), in the listeners' effect cleanup, so a page the child left does
 *   not keep playing; the plays so far stand, and the media resumes as a paused playback.
 * - **The control.** UI SDK's Button: Play, or Pause while the media plays, so media that starts by
 *   itself can always be paused, with or without the native controls (WCAG 1.4.2, 2.2.2). Pressed,
 *   it calls the element's `play()`, whose promise keeps the button pending, announcing `loading`,
 *   while the media loads. Once the plays reach `max-plays` and the media is at rest it is
 *   disabled, kept focusable so a child on it is not dropped, and described by the plays left. A
 *   play the native controls ask for past the limit is paused at once and announced assertively;
 *   the plays-left text beside the control shows the same.
 * - **Text tracks.** The author's `track` children stay the element's (WCAG 1.2). A `video` with a
 *   captions or subtitles track has a Captions toggle, UI SDK's Toggle, pressed while one shows, so
 *   captions can be turned on where the author gave no native controls; turned on, it shows the
 *   track marked `default`, else the first. Each cue of a descriptions track, which a browser loads
 *   but never draws, is announced politely as it begins, so a screen reader reads the text
 *   description in time with the video.
 * - **Size and keys.** The controls are native buttons, so Tab, Enter and Space work them; the
 *   stylesheet gives each the K–3 minimum of 64 px, beyond WCAG 2.5.5's 44 px. The native media
 *   controls are the browser's, whose size WCAG 2.5.8 leaves to it.
 *
 * The parts:
 *
 * - `plate-media`, the root, with what the author wrote on it (`root`: the `class` and the `data-*`),
 *   `data-playing` while the media plays and `data-full` while the plays have reached `max-plays`.
 *   It is the group `naming` names, which the server resolved: by the prompt, else by the author's
 *   `aria-labelledby` or `aria-label`, and no group when nothing names it;
 * - `plate-prompt`, the prompt;
 * - `plate-media-player`, holding the server's media element as its one child;
 * - `plate-media-controls`, holding the controls: UI SDK's `button`, Play or Pause, and UI SDK's
 *   `toggle`, Captions, where the video has captions;
 * - `plate-media-plays`, the `playsLeft` label, while `max-plays` limits the plays;
 * - `plate-media-least`, the `least` sentence, while the plays are fewer than `min-plays`;
 * - In a replay, the count the response recorded, `plate-media-count`, as the server wrote it.
 *
 * A review and a solution replay the media through {@link MediaReplay}, the same parts and the
 * same controls, which count nothing and post nothing (Bjorn's ruling, 2026-11-18: "replay mode is
 * fine"; plate's UI suite's J1). QTI's rules for plays are the attempt's: `autostart` begins the
 * media "as soon as the candidate starts the attempt", `min-plays` asks it to be "played a minimum
 * number of times by the candidate", and `max-plays` makes it impossible "for the candidate to play
 * the media object more than max-play times" (5.92.1 to 5.92.3). A review is no attempt, so a
 * replay starts only when pressed, plays as often as anyone likes and asks for no play, and the
 * count its response recorded stays as recorded.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_MediaInteraction
 */
import { announce, prepareAnnouncements } from "@ui-sdk/core";
import { Button } from "@ui-sdk/react/button";
import { Toggle } from "@ui-sdk/react/toggle";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { flag } from "#plate/ui/attributes.ts";
import type { Authored } from "#plate/ui/attributes.ts";
import type { Group } from "#plate/ui/item/interactions/group.ts";
import { fillLabel } from "#plate/ui/labels.ts";
import { reached } from "#plate/ui/limit.ts";
import type { Limit } from "#plate/ui/limit.ts";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import type { mediaKeys } from "#plate/ui/media/labels.ts";
import { countIn, rewound, step } from "#plate/ui/media/plays.ts";
import type { Phase, Plays, Seen } from "#plate/ui/media/plays.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { useResponse } from "#plate/ui/responses.tsx";
import { collapsedText } from "#plate/ui/whitespace.ts";

/**
 * What the server gives a Media's island, as QTI's `qti-media-interaction` and plate's
 * presentation of it say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_MediaInteraction
 */
export interface MediaProps extends Authored<Group> {
  /**
   * `autostart` (required, 5.92.1): the media begins as the attempt starts.
   */
  readonly autostart: boolean;
  /**
   * Whether the media is a `video` holding a captions or subtitles track, which the Captions toggle
   * turns on and off.
   */
  readonly captions: boolean;
  /**
   * The interaction's `audio` or `video`, server-rendered with its `source` and `track` children,
   * each URL its address in the host's assets, its `controls` and `muted` as the author set them,
   * its `loop` the interaction's and no `autoplay`.
   */
  readonly children: ReactNode;
  readonly labels: Labels<typeof mediaKeys>;
  readonly least: Least;
  /**
   * `max-plays` (5.92.3), the XSD's default of 0 written as no limit.
   */
  readonly maxPlays: Limit;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * The `qti-prompt`, server-rendered under its scoped id, which `naming` then names the group by;
   * undefined when the interaction has none.
   */
  readonly prompt: Prompt | undefined;
}

/**
 * The fewest plays a Media asks for, `min-plays` (QTI 3.0 information model 5.92.2): none at the
 * XSD's default of 0, else `n` with the sentence that asks for them, written by the server in the
 * item's locale, singular for one play. QTI makes fewer plays an invalid response, which the server
 * judges; the island only tells the child before submitting.
 */
export type Least =
  | { readonly kind: "none" }
  | { readonly kind: "at-least"; readonly n: number; readonly text: string };

/**
 * The server's media element inside the player part: its one child, never a media of the prompt's.
 */
const mediaSelector = ":scope > :is(audio, video)";

/**
 * The kinds of text track a browser draws over a video: captions, and subtitles, which a `track`
 * with no `kind` is.
 *
 * @see https://html.spec.whatwg.org/multipage/media.html#attr-track-kind
 */
const drawnKinds: ReadonlySet<string> = new Set(["captions", "subtitles"]);

/**
 * Give a video's caption tracks: the captions and subtitles tracks of its `track` children, the
 * one marked `default` first, then the rest in document order.
 *
 * @param element The media element.
 * @returns The tracks.
 */
const captionTracks = (element: HTMLMediaElement): readonly TextTrack[] => {
  const tracks = [...element.querySelectorAll<HTMLTrackElement>(":scope > track")].filter((track) =>
    drawnKinds.has(track.track.kind),
  );

  return [
    ...tracks.filter((track) => track.default),
    ...tracks.filter((track) => !track.default),
  ].map((track) => track.track);
};

/**
 * Tell whether a video shows captions now.
 *
 * @param element The media element.
 * @returns Whether one of its caption tracks shows.
 */
const captionsShown = (element: HTMLMediaElement): boolean =>
  captionTracks(element).some((track) => track.mode === "showing");

/**
 * Show a video's captions, the track marked `default` or else the first, or hide every caption
 * track.
 *
 * @param element The media element.
 * @param shown Whether to show them.
 */
const showCaptions = (element: HTMLMediaElement, shown: boolean): void => {
  const tracks = captionTracks(element);

  for (const [index, track] of tracks.entries()) {
    track.mode = shown && index === 0 ? "showing" : "hidden";
  }
};

/**
 * Say the cues of a descriptions track that have just begun, as plain text.
 *
 * @param track The descriptions track.
 */
const describe = (track: TextTrack): void => {
  const text = collapsedText(
    [...(track.activeCues ?? [])]
      .map((cue) => (cue instanceof VTTCue ? (cue.getCueAsHTML().textContent ?? "") : ""))
      .join(" "),
  );

  if (text !== "") {
    announce(text, { priority: "polite" });
  }
};

/**
 * Leave a start the browser refused as it is: an unmuted playback the page begins without the
 * child's gesture is the browser's to refuse (its autoplay policy), and the media then waits for
 * the child's press.
 *
 * @returns Nothing.
 * @see https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
 */
const startRefused = (): undefined => undefined;

/**
 * How a Media's plays count, the one thing its attempt and its replay differ in: whether the media
 * starts by itself, how many plays the response counts so far, how many it may count and asks for,
 * and where each new count goes.
 */
interface Tally {
  readonly autostart: boolean;
  readonly count: number;
  readonly least: Least;
  readonly maxPlays: Limit;
  readonly write: (count: number) => void;
}

/**
 * Keep no play: a replay's write.
 */
const keepNoPlay = (): void => {
  // A replay is no attempt, so its plays reach no response.
};

/**
 * A replay's tally: it never starts by itself, counts from none, may play without limit, asks for
 * no play and keeps none of them.
 */
const replayed: Tally = {
  autostart: false,
  count: 0,
  least: { kind: "none" },
  maxPlays: { kind: "none" },
  write: keepNoPlay,
};

/**
 * What a Media's player shows, in an attempt and a replay alike: the interaction's root, names,
 * prompt, media and labels, and how its plays count (`tally`).
 */
interface PlayerProps
  extends Authored<Group>, Pick<MediaProps, "captions" | "children" | "labels" | "prompt"> {
  /**
   * What stands under the controls in a replay, the server's count of the plays recorded; nothing
   * in an attempt.
   */
  readonly recorded: ReactNode;
  readonly tally: Tally;
}

/**
 * Render a Media's player: the media, its Play or Pause control and its Captions toggle, its plays
 * stepped and counted as its tally says.
 *
 * @param props The interaction and its tally ({@link PlayerProps}).
 * @returns The Media.
 * @see https://ui-sdk.dev/docs/react/components/button
 */
const Player = (props: PlayerProps) => {
  const { captions, children, labels, naming, prompt, recorded, root, tally } = props;
  const { autostart, count, least, maxPlays } = tally;
  const [phase, setPhase] = useState<Phase>("rest");
  const [captioned, setCaptioned] = useState(false);
  const plays = useRef<Plays>({ count, phase: "rest" });
  const player = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLMediaElement | undefined>(undefined);
  const leftId = useId();
  const leastId = useId();
  const limited = maxPlays.kind === "at-most";
  const full = reached(maxPlays, count);
  const left = maxPlays.kind === "at-most" ? Math.max(0, maxPlays.n - count) : undefined;
  const short = least.kind === "at-least" && count < least.n;
  const playing = phase === "playing";

  /**
   * Step the plays by one thing the media reported, and do what the step says: post the new
   * count, turning a loop off once it reaches the limit, or pause the media and say why.
   *
   * @param seen What the media reported.
   * @param element The media element.
   */
  const observe = useEffectEvent((seen: Seen, element: HTMLMediaElement) => {
    const stepped = step(plays.current, seen, maxPlays);

    plays.current = stepped.plays;
    setPhase(stepped.plays.phase);

    if (stepped.does === "count") {
      tally.write(stepped.plays.count);

      if (reached(maxPlays, stepped.plays.count)) {
        element.loop = false;
      }
    }

    if (stepped.does === "refuse") {
      element.pause();
      announce(labels.noPlaysLeft, { priority: "assertive" });
    }
  });

  /**
   * Take up a media the island has begun listening to: no loop past the limit; a playback already
   * under way, which the child began from the native controls before the page hydrated, as begun
   * at rest; and `autostart`, while no play is counted yet.
   *
   * @param element The media element.
   */
  const takeUp = useEffectEvent((element: HTMLMediaElement) => {
    if (reached(maxPlays, plays.current.count)) {
      element.loop = false;
    }

    if (!element.paused) {
      observe("play", element);

      return;
    }

    if (autostart && plays.current.count === 0) {
      element.play().catch(startRefused);
    }
  });

  /**
   * Follow whether a video shows captions, for the Captions toggle.
   *
   * @param element The media element.
   */
  const followCaptions = useEffectEvent((element: HTMLMediaElement) => {
    setCaptioned(captionsShown(element));
  });

  useEffect(() => {
    plays.current = { ...plays.current, count };
  }, [count]);

  useEffect((): (() => void) | undefined => {
    const element = player.current?.querySelector<HTMLMediaElement>(mediaSelector) ?? undefined;
    if (element === undefined) {
      return undefined;
    }

    const listeners = new AbortController();
    const { signal } = listeners;

    element.textTracks.addEventListener(
      "change",
      () => {
        followCaptions(element);
      },
      { signal },
    );

    for (const track of element.textTracks) {
      if (track.kind === "descriptions") {
        // A track is loaded, and its cues begin and end, only while it is not disabled; hidden, it
        // still draws nothing.
        if (track.mode === "disabled") {
          track.mode = "hidden";
        }

        track.addEventListener(
          "cuechange",
          () => {
            describe(track);
          },
          { signal },
        );
      }
    }

    followCaptions(element);

    return () => {
      listeners.abort();
    };
  }, []);

  useEffect(() => {
    if (limited) {
      prepareAnnouncements(document);
    }
  }, [limited]);

  useEffect((): (() => void) | undefined => {
    const element = player.current?.querySelector<HTMLMediaElement>(mediaSelector) ?? undefined;
    if (element === undefined) {
      return undefined;
    }

    const listeners = new AbortController();
    const { signal } = listeners;
    const rendered = element.loop;
    let last = element.currentTime;

    element.addEventListener(
      "play",
      () => {
        observe("play", element);
      },
      { signal },
    );
    element.addEventListener(
      "pause",
      () => {
        observe("pause", element);
      },
      { signal },
    );
    element.addEventListener(
      "ended",
      () => {
        observe("ended", element);
      },
      { signal },
    );
    // A seek sets `seeking` before its own events, and its `timeupdate` comes after its `seeking`:
    // so `last` is the position before the seek when `seeking` reads it.
    element.addEventListener(
      "timeupdate",
      () => {
        if (!element.seeking) {
          last = element.currentTime;
        }
      },
      { signal },
    );
    element.addEventListener(
      "seeking",
      () => {
        const from = last;

        last = element.currentTime;

        if (rewound(from, last, element.duration)) {
          observe("rewound", element);
        }
      },
      { signal },
    );
    media.current = element;
    takeUp(element);

    return () => {
      listeners.abort();
      media.current = undefined;
      element.pause();
      observe("pause", element);
      element.loop = rendered;
    };
  }, []);

  /**
   * Play the media, or pause it while it plays.
   *
   * @returns The promise `play()` gives, which keeps the button pending until the media plays or
   *   cannot; none for a pause, or before the island holds the media.
   */
  const press = (): Promise<void> | undefined => {
    const element = media.current;
    if (element === undefined) {
      return undefined;
    }

    if (!element.paused) {
      element.pause();

      return undefined;
    }

    return element.play();
  };

  const described = [...(left === undefined ? [] : [leftId]), ...(short ? [leastId] : [])];

  return (
    <div
      {...root}
      {...naming}
      data-full={flag(full)}
      data-playing={flag(playing)}
      data-slot="plate-media"
    >
      <PromptPart prompt={prompt} />
      <div data-slot="plate-media-player" ref={player}>
        {children}
      </div>
      <div data-slot="plate-media-controls">
        <Button
          aria-describedby={described.length === 0 ? undefined : described.join(" ")}
          disabled={full && phase === "rest"}
          focusableWhenDisabled
          onClick={press}
          pendingAnnouncement={labels.loading}
        >
          {playing ? labels.pause : labels.play}
        </Button>
        {captions ? (
          <Toggle
            pressed={captioned}
            onPressedChange={(pressed) => {
              if (media.current !== undefined) {
                showCaptions(media.current, pressed);
              }
            }}
          >
            {labels.captions}
          </Toggle>
        ) : null}
      </div>
      {left === undefined ? null : (
        <p data-slot="plate-media-plays" id={leftId}>
          {fillLabel(labels.playsLeft, { n: left })}
        </p>
      )}
      {short ? (
        <p data-slot="plate-media-least" id={leastId}>
          {least.text}
        </p>
      ) : null}
      {recorded}
    </div>
  );
};

/**
 * Render a Media for the child to play, counting the plays into its response in the item's
 * `<Responses>`.
 *
 * @param props The interaction, its response's entry name and its labels ({@link MediaProps}).
 * @returns The Media, its media element's plays bound to the response.
 */
export const Media = (props: MediaProps) => {
  const { autostart, least, maxPlays, name, ...shown } = props;
  const [texts, set] = useResponse(name);

  return (
    <Player
      {...shown}
      recorded={null}
      tally={{
        autostart,
        count: countIn(texts),
        least,
        maxPlays,
        write: (count) => {
          set([String(count)]);
        },
      }}
    />
  );
};

/**
 * What the server gives a Media's replay island, a review's or a solution's: the attempt island's
 * parts but its response's entry name and its rules for plays, which a replay has no use for.
 */
export interface MediaReplayProps
  extends Authored<Group>, Pick<MediaProps, "captions" | "children" | "labels" | "prompt"> {
  /**
   * The count of plays the render shows, the server's `plate-media-count` line, which no replay
   * changes; nothing where it shows none.
   */
  readonly recorded: ReactNode;
}

/**
 * Replay a Media in a review or a solution: its own controls play, pause and caption the media as
 * the attempt's do, with no limit and no start of their own, and nothing counts. It is handed no
 * entry name and reads no `<Responses>`, so it posts nothing and needs no form.
 *
 * @param props The interaction, its labels and the count shown ({@link MediaReplayProps}).
 * @returns The Media, replayed.
 */
export const MediaReplay = (props: MediaReplayProps) => <Player {...props} tally={replayed} />;
