/**
 * Media's plays (Q-14): what counts as one play of the author's `audio` or `video`, and what the
 * island does at each thing the media element reports, as one pure step that the island runs from
 * its listeners. Safe to import on the server.
 *
 * QTI binds a Media to a single `integer`, the number of times the media object was experienced
 * (information model 5.92), and says of `max-plays` that it must not be possible for the candidate
 * to play the media object more than `max-plays` times (5.92.3). Neither says what one play is.
 * plate reads it so, from upstream issues #359 and #452:
 *
 * - The media is at rest before its first playback and again once it has ended. A playback begun at
 *   rest is a play, wherever the child had moved the position to.
 * - A playback paused and resumed is the same play, wherever it resumes.
 * - The position coming back to the media's start from past it ({@link rewound}) is a new play: the
 *   child going back to hear it again, or a looping media wrapping round, which plays "subject to
 *   max-plays" (5.92.4). While playing, it begins that play at once; while paused, it leaves the
 *   media at rest, so the next playback is the play.
 * - A play past `max-plays` is refused: the island pauses it at once and says so, and the media stays
 *   at rest. Nothing else is ever refused, so with no limit the child plays freely.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_MediaInteraction
 */
import { reached } from "#plate/ui/limit.ts";
import type { Limit } from "#plate/ui/limit.ts";

/**
 * Where the media stands: at rest, before its first playback or once it has ended; playing; or
 * paused within a playback.
 */
export type Phase = "paused" | "playing" | "rest";

/**
 * The plays of one media: how many the response counts, and where the media stands.
 */
export interface Plays {
  readonly count: number;
  readonly phase: Phase;
}

/**
 * What the media element reports, as the step reads it: it began or resumed playing (`play`), it
 * paused (`pause`), it reached its end and stopped (`ended`), or its position came back to the
 * start from past it ({@link rewound}).
 */
export type Seen = "ended" | "pause" | "play" | "rewound";

/**
 * What one step leaves, and what the island does about it: `count` posts the new count, `refuse`
 * pauses the media and says why, `none` does nothing.
 */
export interface Stepped {
  readonly does: "count" | "none" | "refuse";
  readonly plays: Plays;
}

/**
 * How far into a media its start reaches, in seconds: a seek that lands inside it from past it is
 * the child going back to the beginning, and a seek within it, as a child restarting a play just
 * begun, is not.
 */
const startSeconds = 1;

/**
 * Begin a play, or refuse it at the limit.
 *
 * @param plays The plays so far.
 * @param limit `max-plays`, as the server wrote it.
 * @returns The play counted, the media playing; or refused at the limit, the media at rest.
 */
const begin = (plays: Plays, limit: Limit): Stepped =>
  reached(limit, plays.count)
    ? { does: "refuse", plays: { ...plays, phase: "rest" } }
    : { does: "count", plays: { count: plays.count + 1, phase: "playing" } };

/**
 * Step the plays by one thing the media reported.
 *
 * @param plays The plays so far.
 * @param seen What the media reported.
 * @param limit `max-plays`, as the server wrote it.
 * @returns The plays after it, and what the island does.
 */
export const step = (plays: Plays, seen: Seen, limit: Limit): Stepped => {
  switch (seen) {
    case "ended": {
      return { does: "none", plays: { ...plays, phase: "rest" } };
    }
    case "pause": {
      return {
        does: "none",
        plays: plays.phase === "playing" ? { ...plays, phase: "paused" } : plays,
      };
    }
    case "play": {
      return plays.phase === "rest"
        ? begin(plays, limit)
        : { does: "none", plays: { ...plays, phase: "playing" } };
    }
    case "rewound": {
      return plays.phase === "playing"
        ? begin(plays, limit)
        : { does: "none", plays: { ...plays, phase: "rest" } };
    }
    default: {
      return seen satisfies never;
    }
  }
};

/**
 * Tell whether a seek brings the position back to the media's start from past it, which begins a
 * new play: the start is its first second, or its first half when it is shorter than two seconds,
 * so a looping clip of any length that wraps round from its end comes back to it. A media whose
 * duration is not known yet, or has none (a stream), takes the first second.
 *
 * @param from The position before the seek, in seconds.
 * @param to The position the seek lands at, in seconds.
 * @param duration The media's `duration`, `NaN` until it is known.
 * @returns Whether `from` is past the start and `to` inside it.
 */
export const rewound = (from: number, to: number, duration: number): boolean => {
  const start =
    Number.isFinite(duration) && duration > 0 ? Math.min(startSeconds, duration / 2) : startSeconds;

  return from >= start && to < start;
};

/**
 * A count, as plate's lexical form of an `integer` writes one.
 */
const digits = /^[0-9]+$/u;

/**
 * Read the count a response posts: its one text, a count of plays.
 *
 * @param texts The response's texts, as `useResponse` gives them.
 * @returns The count, 0 when the response posts none.
 */
export const countIn = (texts: readonly string[]): number => {
  const [text] = texts;

  return text !== undefined && digits.test(text) ? Number(text) : 0;
};
