/**
 * Media's plays (Q-14): what counts as one play of the author's `audio` or `video`, and what the
 * island does at each thing the media element reports, as one pure step that the island runs from
 * its listeners. Safe to import on the server.
 *
 * QTI binds a Media to a single `integer`, the number of times the media object was experienced
 * (information model 5.92), and says of `max-plays` that it must not be possible for the candidate
 * to play the media object more than `max-plays` times (5.92.3). Neither says what one play is.
 * plate reads it so (spec readings 188 and 245), from upstream issues #359 and #452:
 *
 * - The media is at rest before its first playback and again once it has ended. A playback begun at
 *   rest is a play, wherever the child had moved the position to, counted when it first sounds (its
 *   first `playing`), since a media is experienced once it sounds: a playback paused while it still
 *   loads, before it sounded, as one voice pauses it at another press, is no play, and leaves the
 *   media at rest.
 * - A playback paused and resumed is the same play, wherever it resumes.
 * - The position coming back to the media's start from past it ({@link rewound}) is a new play: the
 *   child going back to hear it again, or a looping media wrapping round, which plays "subject to
 *   max-plays" (5.92.4). While playing, it begins that play at once; while paused, it leaves the
 *   media at rest, so the next playback is the play.
 * - A play past `max-plays` is refused as it begins, before it sounds: the island pauses it at once
 *   and says so, and the media stays at rest. Nothing else is ever refused, so with no limit the
 *   child plays freely.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_MediaInteraction
 */
import { reached } from "#plate/placement/limit.ts";
import type { Limit } from "#plate/placement/limit.ts";

/**
 * Where the media stands: at rest, before its first playback or once it has ended; pending, a
 * playback begun at rest that has not sounded yet; playing; or paused within a playback.
 */
export type Phase = "paused" | "pending" | "playing" | "rest";

/**
 * The plays of one media: how many the response counts, and where the media stands.
 */
export interface Plays {
  readonly count: number;
  readonly phase: Phase;
}

/**
 * What the media element reports, as the step reads it: it began or resumed a playback (`play`),
 * it sounds, its data having come (`playing`), it paused (`pause`), it reached its end and stopped
 * (`ended`), or its position came back to the start from past it ({@link rewound}).
 */
export type Seen = "ended" | "pause" | "play" | "playing" | "rewound";

/**
 * What one step leaves, and what the island does about it: `count` writes the new count, `refuse`
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
 * Refuse a play at the limit, or let it go on as the phase given.
 *
 * @param plays The plays so far.
 * @param limit `max-plays`, as the server wrote it.
 * @param then What the play becomes where the limit allows it: pending, a playback that has yet
 *   to sound, or playing, counted now, as a rewound playback sounds at once.
 * @returns The play refused at the limit, the media at rest; else pending, or counted and playing.
 */
const begin = (plays: Plays, limit: Limit, then: "pending" | "playing"): Stepped => {
  if (reached(limit, plays.count)) {
    return { does: "refuse", plays: { ...plays, phase: "rest" } };
  }

  return then === "pending"
    ? { does: "none", plays: { ...plays, phase: "pending" } }
    : { does: "count", plays: { count: plays.count + 1, phase: "playing" } };
};

/**
 * Where a pause leaves the media, by where it stood: a playback that sounded is paused within its
 * play; one that never sounded is no play, and the media is at rest again.
 */
const pausedFrom = {
  paused: "paused",
  pending: "rest",
  playing: "paused",
  rest: "rest",
} as const satisfies Readonly<Record<Phase, Phase>>;

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
      return { does: "none", plays: { ...plays, phase: pausedFrom[plays.phase] } };
    }
    case "play": {
      if (plays.phase === "rest") {
        return begin(plays, limit, "pending");
      }

      return {
        does: "none",
        plays: { ...plays, phase: plays.phase === "paused" ? "playing" : plays.phase },
      };
    }
    case "playing": {
      return plays.phase === "pending"
        ? { does: "count", plays: { count: plays.count + 1, phase: "playing" } }
        : { does: "none", plays };
    }
    case "rewound": {
      if (plays.phase === "playing") {
        return begin(plays, limit, "playing");
      }

      return {
        does: "none",
        plays: { ...plays, phase: plays.phase === "pending" ? "pending" : "rest" },
      };
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
 * Read the count of plays a response holds: its one integer, a count of plays.
 *
 * @param values The response's integers, as `useResponse` gives them.
 * @returns The count, 0 when the response holds none, or holds a negative integer, which is no
 *   count of plays.
 */
export const countIn = (values: readonly bigint[]): number => {
  const [count] = values;

  return count !== undefined && count >= 0n ? Number(count) : 0;
};
