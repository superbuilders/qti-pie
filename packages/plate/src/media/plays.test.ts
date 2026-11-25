/**
 * Media's plays (`step` beside this file), over every sequence of what a media element reports, up
 * to seven reports long, as the island hears them (a refused play followed, or not, by the pause
 * the island makes), under no `max-plays` and under `max-plays` 1, 2 and 3. QTI counts "the number
 * of times the media object was experienced" and forbids playing it "more than max-play times"
 * (information model 5.92 and 5.92.3); plate counts a play when a playback begun at rest first
 * sounds, or when the position comes back to the start while it sounds (spec readings 188 and 245).
 * At every report of every sequence:
 *
 * - **never past the limit:** the count never passes `max-plays`;
 * - **only what sounded:** the count rises only by one, and only as the media sounds: at the first
 *   `playing` of a playback begun at rest, or at a return to the start while it plays;
 * - **a pause before the sound is no play:** a pause of a playback that has not sounded counts
 *   nothing and leaves the media at rest;
 * - **a resume spends nothing:** a playback paused and resumed is the same play, playing again at
 *   once, nothing counted and nothing refused;
 * - **a refusal only where a play would begin:** a play is refused only at the limit, and only as a
 *   playback begins at rest or the position returns to the start while it plays;
 * - **every sound is counted:** under the limit, a playback begun at rest that sounds is counted;
 * - **a failure ends at rest:** a media that cannot play is at rest, its count as it was.
 *
 * And reading 245's cases, as one sequence each. Kills, each failing the rule its words name: a
 * step that counts as a playback begins (only what sounded), one that leaves a playback paused
 * before its sound paused rather than at rest (a pause before the sound), one that makes a resumed
 * playback a new play (a resume), one that refuses nothing at the limit (never past it), one that
 * refuses a resume at the limit (a refusal only where a play begins), one that counts an end, one
 * that takes a looping media's wrap for no play (every sound counted), and one that leaves a failed
 * playback pending (a failure ends at rest).
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { step } from "#plate/media/plays.ts";
import type { Plays, Seen, Stepped } from "#plate/media/plays.ts";
import type { Limit } from "#plate/placement/limit.ts";

/**
 * What a media element reports, every one of them.
 */
const reports: readonly Seen[] = ["play", "playing", "pause", "ended", "failed", "rewound"];

/**
 * The limits the rules run under: none, and `max-plays` 1, 2 and 3.
 */
const limits: readonly Limit[] = [
  { kind: "none" },
  { kind: "at-most", n: 1 },
  { kind: "at-most", n: 2 },
  { kind: "at-most", n: 3 },
];

/**
 * Every sequence of `length` reports.
 *
 * @param length The sequence's length.
 * @returns The sequences.
 */
const sequencesOf = (length: number): readonly (readonly Seen[])[] =>
  length === 0
    ? [[]]
    : sequencesOf(length - 1).flatMap((rest) => reports.map((seen) => [...rest, seen]));

/**
 * The plays of a media the island has not heard play yet.
 */
const atRest: Plays = { count: 0, phase: "rest" };

/**
 * One step as the rules read it: the plays before the report and after, the report, what the step
 * asked of the island, and the limit.
 */
interface Moment {
  readonly after: Plays;
  readonly before: Plays;
  readonly does: Stepped["does"];
  readonly limit: Limit;
  readonly seen: Seen;
}

/**
 * Tell whether a report begins a new play: a playback begun at rest, or a return to the start while
 * the media plays.
 *
 * @param moment The step.
 * @returns Whether a play begins there.
 */
const begins = ({ before, seen }: Moment): boolean =>
  (seen === "play" && before.phase === "rest") ||
  (seen === "rewound" && before.phase === "playing");

/**
 * Tell whether the media sounds a play at a report: the first `playing` of a playback begun at
 * rest, or a return to the start while it plays, which sounds at once.
 *
 * @param moment The step.
 * @returns Whether a play sounds there.
 */
const sounds = ({ before, seen }: Moment): boolean =>
  (seen === "playing" && before.phase === "pending") ||
  (seen === "rewound" && before.phase === "playing");

/**
 * Tell whether the plays before a report have reached the limit.
 *
 * @param moment The step.
 * @returns Whether one more play would pass `max-plays`.
 */
const full = ({ before, limit }: Moment): boolean =>
  limit.kind === "at-most" && before.count >= limit.n;

/**
 * How much a report raised the count.
 *
 * @param moment The step.
 * @returns The rise.
 */
const rise = ({ after, before }: Moment): number => after.count - before.count;

/**
 * The rules, each by its name and what breaks it.
 */
const rules: readonly (readonly [name: string, broken: (moment: Moment) => boolean])[] = [
  ["past the limit", ({ after, limit }) => limit.kind === "at-most" && after.count > limit.n],
  [
    "counted what did not sound",
    (moment) => rise(moment) !== 0 && (rise(moment) !== 1 || !sounds(moment)),
  ],
  [
    "a pause before the sound was a play",
    (moment) =>
      moment.seen === "pause" &&
      moment.before.phase === "pending" &&
      (rise(moment) !== 0 || moment.after.phase !== "rest"),
  ],
  [
    "a resume spent a play",
    (moment) =>
      moment.before.phase === "paused" &&
      (moment.seen === "play" || moment.seen === "playing") &&
      (rise(moment) !== 0 ||
        moment.does !== "none" ||
        (moment.seen === "play" && moment.after.phase !== "playing")),
  ],
  [
    "refused where no play begins",
    (moment) => moment.does === "refuse" && (!begins(moment) || !full(moment)),
  ],
  [
    "no refusal at the limit",
    (moment) => begins(moment) && full(moment) && moment.does !== "refuse",
  ],
  [
    "a sound under the limit went uncounted",
    (moment) => sounds(moment) && !full(moment) && rise(moment) !== 1,
  ],
  ["a count that counts nothing", (moment) => moment.does === "count" && rise(moment) !== 1],
  [
    "a failure left the media short of rest",
    (moment) =>
      moment.seen === "failed" &&
      (moment.after.phase !== "rest" || rise(moment) !== 0 || moment.does !== "none"),
  ],
];

/**
 * Give what is wrong with one step, by the rules above.
 *
 * @param moment The step.
 * @returns The rules it broke.
 */
const brokenBy = (moment: Moment): readonly string[] =>
  rules.filter(([, broken]) => broken(moment)).map(([name]) => name);

/**
 * One report judged: what the step left, and the rules it broke.
 */
interface Judged {
  readonly faults: readonly string[];
  readonly stepped: Stepped;
}

/**
 * A sequence judged: the plays it leaves, and every rule broken on the way.
 */
interface Ran {
  readonly faults: readonly string[];
  readonly plays: Plays;
}

/**
 * Run one report through the step and judge it.
 *
 * @param plays The plays before it.
 * @param seen The report.
 * @param limit `max-plays`.
 * @returns What the step left, and the rules it broke.
 */
const judged = (plays: Plays, seen: Seen, limit: Limit): Judged => {
  const stepped = step(plays, seen, limit);

  return {
    faults: brokenBy({ after: stepped.plays, before: plays, does: stepped.does, limit, seen }),
    stepped,
  };
};

/**
 * Run a sequence of reports through the step as the island does, a refused play's own pause heard
 * after it, and give the plays it leaves and every rule it broke on the way.
 *
 * @param sequence The reports, in order.
 * @param limit `max-plays`.
 * @param pauses Whether the island's pause of a refused play is heard after it.
 * @returns The plays left, and the faults.
 */
const run = (sequence: readonly Seen[], limit: Limit, pauses: boolean): Ran => {
  const faults: string[] = [];
  let plays = atRest;

  for (const seen of sequence) {
    const { faults: found, stepped } = judged(plays, seen, limit);

    faults.push(...found);
    ({ plays } = stepped);

    if (stepped.does === "refuse" && pauses) {
      const paused = judged(plays, "pause", limit);

      faults.push(...paused.faults);
      ({ plays } = paused.stepped);
    }
  }

  return { faults, plays };
};

/**
 * Name a limit.
 *
 * @param limit The limit.
 * @returns Its name.
 */
const limitName = (limit: Limit): string =>
  limit.kind === "none" ? "no limit" : `max-plays ${String(limit.n)}`;

describe("a Media's plays", () => {
  it("keep every rule at every report of every sequence of up to seven reports, under every limit", () => {
    const wrong = limits.flatMap((limit) =>
      [true, false].flatMap((pauses) =>
        Array.from({ length: 8 }, (_, length) => sequencesOf(length))
          .flat()
          .flatMap((sequence) => {
            const { faults } = run(sequence, limit, pauses);

            return faults.length === 0
              ? []
              : [
                  {
                    faults: [...new Set(faults)],
                    limit: limitName(limit),
                    sequence: sequence.join(" "),
                  },
                ];
          }),
      ),
    );

    assert.deepStrictEqual(
      { first: wrong.slice(0, 5), wrong: wrong.length },
      { first: [], wrong: 0 },
    );
  });

  it.each([
    [
      "a pause mid-play by another press, then a resume, is one play",
      { kind: "at-most", n: 1 },
      ["play", "playing", "pause", "play", "playing", "ended"],
      1,
    ],
    [
      "a pause before it sounded, then a play, is one play under max-plays 1",
      { kind: "at-most", n: 1 },
      ["play", "pause", "play", "playing", "ended"],
      1,
    ],
    [
      "a second play under max-plays 1 is refused",
      { kind: "at-most", n: 1 },
      ["play", "playing", "ended", "play", "playing"],
      1,
    ],
    [
      "a looping media's wrap is a play of its own",
      { kind: "none" },
      ["play", "playing", "rewound", "rewound"],
      3,
    ],
    [
      "a playback that never sounds is no play",
      { kind: "none" },
      ["play", "pause", "play", "ended"],
      0,
    ],
  ] as const)("count reading 245's case: %s", (_name, limit, sequence, count) => {
    const { faults, plays } = run(sequence, limit, true);

    assert.deepStrictEqual({ count: plays.count, faults }, { count, faults: [] });
  });
});
