/**
 * Read-aloud's session over one item (`heard` beside this file), against a page written apart from
 * it: items of one to five controls, each reading an interaction's prompt, a text of the body or a
 * choice, at every place in document order, driven as the browser carries out the session's
 * commands and shown as each control shows the session (`shownAt`). Each control plays its own part
 * alone and only at its own press, as the implementation guide stores a part's recording, the
 * alternative to that part's written text, and states no sequencing of spoken recordings
 * (§5.2.8.3). How far each rule searches: "alone" every item of up to five controls; the notice's
 * rules up to three; the late echoes' every sequence of five moves on an item of each size up to
 * three, the moves presses, single late pauses, ends, stops elsewhere, failures, unmounts and
 * remounts; every other rule up to four.
 *
 * - **alone:** a press of a control, a prompt's as any other's, the item's first press or a later
 *   one, plays that control and no other, and nothing plays after its recording ends;
 * - **one at a time:** a press of a second control while the first plays stops the first and plays
 *   the second alone, and a press of the control playing stops it, before its recording has begun
 *   to sound as after;
 * - **nothing next:** nothing plays after a recording ends, stops by anything else or fails, or its
 *   control unmounts, nor once the item is left;
 * - **late echoes:** a recording's `pause` heard at any later moment, one at a time, or not at all,
 *   as the browser may deliver it, dropped once its control plays again, as the island drops it,
 *   and never heard once its control left, leaves the session playing exactly the recording that
 *   sounds, and showing it so, through failures, unmounts and remounts;
 * - **the notice:** a press that cannot play is told once, at its control, and the next press takes
 *   the notice down; an interruption is told nothing, and so is a refusal no press waits on.
 *
 * Kills: the chain, as plate's session played it before, an item's first press of a prompt playing
 * the prompt and then every other control mounted, prompts before texts before choices, fails
 * "alone" at each of the 546 presses of a prompt in an item of two to five controls (a press of
 * `prompt0` in `prompt0 text1 choice2` played all three); a session that answers a press of the
 * control it plays by playing it again, as one that read a press as a stop only once the recording
 * sounded did, fails "one at a time"; and a page that delivers a `pause` its control's next play
 * overtook fails "late echoes".
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { heard, newSession, shownAt } from "#plate/read-aloud/session.ts";
import type { Command, Refusal, Report, Session } from "#plate/read-aloud/session.ts";

/**
 * The role of the part a control of a test item reads: an interaction's prompt, a text of the
 * body or a choice. The session reads no role: a prompt's control is a control as any other.
 */
type Role = "choice" | "prompt" | "text";

/**
 * A control of a test item: its role, and its name, the role and its place in document order.
 */
interface Spot {
  readonly name: string;
  readonly role: Role;
}

/**
 * The roles a control may read in.
 */
const roles: readonly Role[] = ["prompt", "text", "choice"];

/**
 * Every sequence of `length` roles.
 *
 * @param length The sequence's length.
 * @returns The sequences.
 */
const rolesOf = (length: number): readonly (readonly Role[])[] =>
  length === 0 ? [[]] : rolesOf(length - 1).flatMap((rest) => roles.map((role) => [...rest, role]));

/**
 * Every item of one to `most` controls, every role at every place, each in document order.
 *
 * @param most The most controls an item holds.
 * @returns The items.
 */
const itemsUpTo = (most: number): readonly (readonly Spot[])[] =>
  Array.from({ length: most }, (_, index) => index + 1).flatMap((length) =>
    rolesOf(length).map((sequence) =>
      sequence.map((role, place): Spot => ({ name: `${role}${place}`, role })),
    ),
  );

/**
 * The refusals that interrupt a recording, which no child is told of: `play()` rejected with an
 * `AbortError`, and a `MediaError` of `MEDIA_ERR_ABORTED` (code 1).
 */
const interruptions: readonly Refusal[] = [
  {
    cause: new DOMException("The play() request was interrupted.", "AbortError"),
    kind: "rejected",
  },
  { code: 1, kind: "media-error" },
];

/**
 * Refusals that fail a recording: `play()` rejected with any other cause, a `MediaError` of any
 * other code (network, decode, source not supported, and one HTML does not name), and every source
 * failed.
 */
const failures: readonly Refusal[] = [
  { cause: new DOMException("Autoplay is not allowed.", "NotAllowedError"), kind: "rejected" },
  { cause: new DOMException("No supported source.", "NotSupportedError"), kind: "rejected" },
  { cause: new TypeError("play is not a function"), kind: "rejected" },
  { cause: undefined, kind: "rejected" },
  { code: 2, kind: "media-error" },
  { code: 3, kind: "media-error" },
  { code: 4, kind: "media-error" },
  { code: 5, kind: "media-error" },
  { kind: "no-source" },
];

/**
 * When the page delivers the `pause` of a recording the session stopped while it sounded: `now`,
 * once the turn's commands have run; `late`, held until the room is told to deliver it
 * ({@link deliver}), and dropped then where its control plays again, as the island drops a `pause`
 * that finds its recording playing; `never`, as a recording whose play the browser refused fires
 * none.
 */
type Echoes = "late" | "never" | "now";

/**
 * A page holding one item's controls, as the browser carries out the session's commands: which
 * controls are mounted, in document order, which one's recording plays, every command the session
 * gave, the controls its notice was told at, in order, the faults no session may commit (a play
 * over a recording still playing, a command to a control that left the page, and a control showing
 * the session otherwise than the page sounds it), when a recording the session stops fires its
 * `pause`, and the `pause`s held for later.
 */
interface Room {
  commands: Command<Spot>[];
  readonly echoes: Echoes;
  faults: string[];
  held: readonly Spot[];
  mounted: readonly Spot[];
  playing: Option.Option<Spot>;
  session: Session<Spot>;
  told: readonly string[];
}

/**
 * When a recording the session stops fires its `pause`: each test that drives the session through
 * a stop runs under each.
 */
const echoings: readonly Echoes[] = ["now", "late", "never"];

/**
 * Open a room on an item, its session the one every item opens with.
 *
 * @param item The item's controls, in document order.
 * @param echoes When a recording the session stops fires its `pause`.
 * @returns The room.
 */
const opened = (item: readonly Spot[], echoes: Echoes): Room => ({
  commands: [],
  echoes,
  faults: [],
  held: [],
  mounted: item,
  playing: Option.none(),
  session: newSession,
  told: [],
});

/**
 * Tell whether a room's recording playing is a control's.
 *
 * @param room The room.
 * @param control The control.
 * @returns Whether it plays.
 */
const sounds = (room: Room, control: Spot): boolean =>
  Option.exists(room.playing, (playing) => playing === control);

/**
 * Check that every control mounted shows the session as the page sounds it: pressed exactly while
 * its recording plays.
 *
 * @param room The room, its faults added to.
 */
const shownAsSounded = (room: Room): void => {
  for (const control of room.mounted) {
    if ((shownAt(room.session, control) === "playing") !== sounds(room, control)) {
      room.faults.push(
        `${control.name} shows ${shownAt(room.session, control)} while it ${sounds(room, control) ? "sounds" : "is silent"}`,
      );
    }
  }
};

/**
 * Report to the session and carry out its commands as the browser does: a `play` starts the
 * control's recording, a `stop` stops it, and a recording stopped while it played fires its
 * `pause` as the room's echoes say, reported as its stop once the commands have run.
 *
 * @param room The room, changed in place.
 * @param report The report.
 */
const hear = (room: Room, report: Report<Spot>): void => {
  const before = room.session;
  const turn = heard(room.session, report);
  const stopped: Spot[] = [];

  room.session = turn.session;

  if (
    turn.session.kind === "told" &&
    !(before.kind === "told" && before.control === turn.session.control)
  ) {
    room.told = [...room.told, turn.session.control.name];
  }

  for (const command of turn.commands) {
    room.commands.push(command);

    if (!room.mounted.includes(command.control)) {
      room.faults.push(`${command.act} ${command.control.name}, which left`);
    }

    if (command.act === "play") {
      if (Option.isSome(room.playing) && room.playing.value !== command.control) {
        room.faults.push(`play ${command.control.name} over ${room.playing.value.name}`);
      }

      room.playing = Option.some(command.control);
    }

    if (command.act === "stop" && sounds(room, command.control)) {
      room.playing = Option.none();
      stopped.push(command.control);
    }
  }

  shownAsSounded(room);

  if (room.echoes === "late") {
    room.held = [...room.held, ...stopped];
  }

  if (room.echoes === "now") {
    for (const control of stopped) {
      hear(room, { control, kind: "stopped" });
    }
  }
};

/**
 * Deliver the oldest `pause` the room holds, as the browser fires one late: it is reported as its
 * recording's stop, but where its control plays again, as the island hears a `pause` that finds
 * its recording playing.
 *
 * @param room The room.
 */
const deliverOne = (room: Room): void => {
  const [control, ...rest] = room.held;

  room.held = rest;

  if (control !== undefined && !sounds(room, control)) {
    hear(room, { control, kind: "stopped" });
  }
};

/**
 * Deliver every `pause` the room holds, the oldest first ({@link deliverOne}).
 *
 * @param room The room.
 */
const deliver = (room: Room): void => {
  while (room.held.length > 0) {
    deliverOne(room);
  }
};

/**
 * Press a control as a child does: every press is one report, and the session says what it does.
 *
 * @param room The room.
 * @param control The control.
 */
const press = (room: Room, control: Spot): void => {
  hear(room, { control, kind: "press" });
};

/**
 * Let the recording playing play to its end: it reports its stop.
 *
 * @param room The room.
 */
const end = (room: Room): void => {
  if (Option.isNone(room.playing)) {
    return;
  }

  const control = room.playing.value;

  room.playing = Option.none();
  hear(room, { control, kind: "stopped" });
};

/**
 * Let every recording play to its end, one after another, until nothing plays: at most one more
 * end than the item has controls, so a session that never rests still stops.
 *
 * @param room The room.
 */
const finish = (room: Room): void => {
  for (let ends = 0; ends <= room.mounted.length && Option.isSome(room.playing); ends += 1) {
    end(room);
  }
};

/**
 * Stop the recording playing by something other than its control, as another media's play or a
 * hidden page does: it reports its stop.
 *
 * @param room The room.
 */
const stopElsewhere = (room: Room): void => {
  end(room);
};

/**
 * Take a control off the page, as React unmounts it: its recording stops with no `pause`
 * reported, its listeners gone, so no `pause` it held is ever reported, and it reports that it
 * left.
 *
 * @param room The room.
 * @param control The control.
 */
const unmount = (room: Room, control: Spot): void => {
  room.mounted = room.mounted.filter((spot) => spot !== control);
  room.held = room.held.filter((spot) => spot !== control);

  if (sounds(room, control)) {
    room.playing = Option.none();
  }

  hear(room, { control, kind: "unmounted" });
};

/**
 * Give the names of the controls a room's session played, in order.
 *
 * @param room The room.
 * @returns The names.
 */
const playedIn = (room: Room): string =>
  room.commands
    .filter((command) => command.act === "play")
    .map((command) => command.control.name)
    .join(" ");

/**
 * Give the names of the controls a room's session told the child at, in order.
 *
 * @param room The room.
 * @returns The names.
 */
const toldIn = (room: Room): string => room.told.join(" ");

/**
 * Give the names of controls, in order.
 *
 * @param spots The controls.
 * @returns The names.
 */
const namesOf = (spots: readonly Spot[]): string => spots.map((spot) => spot.name).join(" ");

/**
 * Give a room's commands as `act name`, in order.
 *
 * @param room The room.
 * @returns The commands.
 */
const actsIn = (room: Room): string =>
  room.commands.map((each) => `${each.act} ${each.control.name}`).join(", ");

/**
 * Give what is wrong with a room once a press of every control still mounted has played to its
 * end: each press must play that control alone and command no control that left.
 *
 * @param room The room, copied and left as it is.
 * @returns Each control whose press went wrong, with what it played and the faults.
 */
const afterwards = (room: Room): readonly string[] =>
  room.mounted.flatMap((spot) => {
    const again: Room = { ...room, commands: [], faults: [] };

    deliver(again);
    press(again, spot);
    finish(again);

    return playedIn(again) === spot.name && again.faults.length === 0
      ? []
      : [`${spot.name}: ${playedIn(again)} ${again.faults.join(", ")}`];
  });

describe("a press", () => {
  it("plays its own control alone, a prompt's as any other's, as the item's first press: nothing plays after its recording ends", () => {
    const wrong = itemsUpTo(5).flatMap((item) =>
      item.flatMap((control) => {
        const room = opened(item, "now");

        press(room, control);
        finish(room);

        return playedIn(room) === control.name &&
          Option.isNone(room.playing) &&
          room.faults.length === 0
          ? []
          : [
              {
                control: control.name,
                faults: room.faults,
                item: namesOf(item),
                played: playedIn(room),
              },
            ];
      }),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("plays its own control alone after an earlier press, whether the earlier still plays or has ended", () => {
    const wrong = itemsUpTo(4).flatMap((item) =>
      item.flatMap((first) =>
        item.flatMap((second) =>
          [true, false].flatMap((waits) => {
            const room = opened(item, "now");

            press(room, first);

            if (waits) {
              finish(room);
            }

            if (sounds(room, second)) {
              return [];
            }

            press(room, second);
            finish(room);

            const expected = `${first.name} ${second.name}`;

            return playedIn(room) === expected && room.faults.length === 0
              ? []
              : [{ expected, faults: room.faults, item: namesOf(item), played: playedIn(room) }];
          }),
        ),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("of a second control while the first plays stops the first, then plays the second alone", () => {
    const wrong = itemsUpTo(4).flatMap((item) =>
      echoings.flatMap((echoes) =>
        item.flatMap((first) =>
          item
            .filter((second) => second !== first)
            .flatMap((second) => {
              const room = opened(item, echoes);

              press(room, first);
              room.commands = [];
              press(room, second);

              const acts = actsIn(room);

              // The first's stop is heard late, as one the browser's own media controls played on
              // would report it: the second's press stopped it, so nothing follows it.
              hear(room, { control: first, kind: "stopped" });
              deliver(room);
              finish(room);

              return acts === `stop ${first.name}, play ${second.name}` &&
                playedIn(room) === second.name &&
                room.faults.length === 0
                ? []
                : [
                    {
                      acts,
                      echoes,
                      faults: room.faults,
                      item: namesOf(item),
                      played: playedIn(room),
                    },
                  ];
            }),
        ),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("of the control the session plays stops it, and a press after plays it again from its start", () => {
    const wrong = itemsUpTo(4).flatMap((item) =>
      echoings.flatMap((echoes) =>
        item.flatMap((control) => {
          const room = opened(item, echoes);

          press(room, control);
          room.commands = [];
          // The session, not the page, says whether the control plays: a second press stops it
          // even while its `play()` is pending, before the page could show it playing.
          press(room, control);

          const stops = actsIn(room);
          const silent = shownAt(room.session, control) === "resting" && !sounds(room, control);

          deliver(room);
          room.commands = [];
          press(room, control);

          const again = actsIn(room);

          finish(room);

          return stops === `stop ${control.name}` &&
            silent &&
            again === `play ${control.name}` &&
            room.faults.length === 0
            ? []
            : [{ again, control: control.name, echoes, faults: room.faults, stops }];
        }),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });
});

describe("nothing plays next", () => {
  it("after a recording ends, stops by anything else, fails or its control unmounts, and a press after plays its control alone", () => {
    const causes: readonly (readonly [string, (room: Room, current: Spot) => void])[] = [
      [
        "its end",
        (room) => {
          end(room);
        },
      ],
      [
        "a stop by anything else",
        (room) => {
          stopElsewhere(room);
        },
      ],
      ...failures.map((refusal): readonly [string, (room: Room, current: Spot) => void] => [
        `its failure ${JSON.stringify(refusal)}`,
        (room, current) => {
          hear(room, { control: current, kind: "refused", refusal });
        },
      ]),
      [
        "its unmount",
        (room, current) => {
          unmount(room, current);
        },
      ],
    ];
    const wrong = itemsUpTo(4).flatMap((item) =>
      echoings.flatMap((echoes) =>
        item.flatMap((current) =>
          causes.flatMap(([cause, act]) => {
            const room = opened(item, echoes);

            press(room, current);
            act(room, current);

            const after = playedIn(room);

            deliver(room);
            finish(room);

            const others = afterwards(room);

            return after === current.name &&
              playedIn(room) === current.name &&
              Option.isNone(room.playing) &&
              room.faults.length === 0 &&
              others.length === 0
              ? []
              : [
                  {
                    cause,
                    current: current.name,
                    echoes,
                    faults: room.faults,
                    item: namesOf(item),
                    others,
                    played: playedIn(room),
                  },
                ];
          }),
        ),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("once the item is left, every control unmounting in any order, and commands nothing after", () => {
    /**
     * Give every order of some controls.
     *
     * @param spots The controls.
     * @returns Each permutation.
     */
    const orders = (spots: readonly Spot[]): readonly (readonly Spot[])[] =>
      spots.length === 0
        ? [[]]
        : spots.flatMap((spot) =>
            orders(spots.filter((other) => other !== spot)).map((rest) => [spot, ...rest]),
          );
    const wrong = itemsUpTo(4).flatMap((item) =>
      item.flatMap((current) =>
        orders(item).flatMap((order) => {
          const room = opened(item, "now");

          press(room, current);

          const before = room.commands.length;

          for (const spot of order) {
            unmount(room, spot);
          }

          finish(room);

          return room.commands.length === before && room.faults.length === 0
            ? []
            : [{ current: current.name, order: namesOf(order) }];
        }),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });
});

describe("the control playing", () => {
  it("plays on through a stop, a refusal or an unmount of another control, and through a refusal that interrupts it, and nothing plays after it", () => {
    const wrong = itemsUpTo(4).flatMap((item) =>
      item.flatMap((current) => {
        const idle = item.filter((spot) => spot !== current);
        const reports: readonly (readonly [string, Report<Spot>])[] = [
          ...idle.flatMap((spot): readonly (readonly [string, Report<Spot>])[] => [
            [`stopped ${spot.name}`, { control: spot, kind: "stopped" }],
            ...[...interruptions, ...failures].map((refusal): readonly [string, Report<Spot>] => [
              `refused ${spot.name} ${JSON.stringify(refusal)}`,
              { control: spot, kind: "refused", refusal },
            ]),
          ]),
          ...interruptions.map((refusal): readonly [string, Report<Spot>] => [
            `refused ${current.name} ${JSON.stringify(refusal)}`,
            { control: current, kind: "refused", refusal },
          ]),
        ];

        return [
          ...reports.flatMap(([name, report]) => {
            const room = opened(item, "now");

            press(room, current);
            hear(room, report);

            const still = sounds(room, current);

            finish(room);

            return still &&
              playedIn(room) === current.name &&
              toldIn(room) === "" &&
              room.faults.length === 0
              ? []
              : [{ current: current.name, name, played: playedIn(room), told: toldIn(room) }];
          }),
          ...idle.flatMap((spot) => {
            const room = opened(item, "now");

            press(room, current);
            unmount(room, spot);

            const still = sounds(room, current);

            finish(room);

            return still && playedIn(room) === current.name && room.faults.length === 0
              ? []
              : [{ current: current.name, name: `unmount ${spot.name}`, played: playedIn(room) }];
          }),
        ];
      }),
    );

    assert.deepStrictEqual(wrong, []);
  });
});

describe("late echoes", () => {
  it("leave the session playing exactly the recording that sounds, and showing it so, at every step of every sequence of presses, single late pauses, ends, stops elsewhere, failures, unmounts and remounts", () => {
    /**
     * A move of the page: a press of a control, the delivery of the oldest `pause` held, a
     * recording's end, its stop by anything else, its failure, a control's unmount, or its mount
     * again under its id, as `<Activity>` and `<StrictMode>` remount an island.
     */
    type Move =
      | { readonly control: Spot; readonly kind: "press" | "remount" | "unmount" }
      | { readonly kind: "deliver" | "elsewhere" | "end" | "fail" };

    /**
     * Give every sequence of `length` of some moves.
     *
     * @param moves The moves.
     * @param length The sequence's length.
     * @returns The sequences.
     */
    const sequencesOf = (moves: readonly Move[], length: number): readonly (readonly Move[])[] =>
      length === 0
        ? [[]]
        : sequencesOf(moves, length - 1).flatMap((rest) => moves.map((move) => [...rest, move]));

    /**
     * Name a move.
     *
     * @param move The move.
     * @returns Its name.
     */
    const nameOf = (move: Move): string =>
      "control" in move ? `${move.kind} ${move.control.name}` : move.kind;

    /**
     * Make one move in a room.
     *
     * @param room The room.
     * @param item The item's controls, in document order.
     * @param move The move.
     */
    const make = (room: Room, item: readonly Spot[], move: Move): void => {
      switch (move.kind) {
        case "deliver": {
          deliverOne(room);
          break;
        }
        case "elsewhere": {
          stopElsewhere(room);
          break;
        }
        case "end": {
          end(room);
          break;
        }
        case "fail": {
          if (Option.isSome(room.playing)) {
            hear(room, {
              control: room.playing.value,
              kind: "refused",
              refusal: failures[0] ?? { kind: "no-source" },
            });
          }

          break;
        }
        case "press": {
          if (room.mounted.includes(move.control)) {
            press(room, move.control);
          }

          break;
        }
        case "remount": {
          room.mounted = item.filter(
            (spot) => spot === move.control || room.mounted.includes(spot),
          );
          break;
        }
        case "unmount": {
          if (room.mounted.includes(move.control)) {
            unmount(room, move.control);
          }

          break;
        }
        default: {
          move satisfies never;
        }
      }
    };

    // The session reads no role, so one item of each size stands for every item of that size.
    const wrong = [1, 2, 3].flatMap((size) => {
      const item = Array.from({ length: size }, (_, place): Spot => ({
        name: `c${String(place)}`,
        role: "text",
      }));
      const moves: readonly Move[] = [
        ...item.flatMap((control): readonly Move[] => [
          { control, kind: "press" },
          { control, kind: "unmount" },
          { control, kind: "remount" },
        ]),
        { kind: "deliver" },
        { kind: "end" },
        { kind: "elsewhere" },
        { kind: "fail" },
      ];

      return sequencesOf(moves, 5).flatMap((sequence) => {
        const room = opened(item, "late");

        for (const move of sequence) {
          make(room, item, move);
        }

        deliver(room);
        shownAsSounded(room);

        return room.faults.length === 0
          ? []
          : [{ faults: room.faults, item: namesOf(item), moves: sequence.map(nameOf).join(", ") }];
      });
    });

    assert.deepStrictEqual(
      { first: wrong.slice(0, 5), wrong: wrong.length },
      { first: [], wrong: 0 },
    );
  });
});

describe("a press that cannot play", () => {
  it("is told once, at its control, however often its recording says so, and nothing plays after", () => {
    const wrong = itemsUpTo(3).flatMap((item) =>
      item.flatMap((first) =>
        item.flatMap((control) =>
          failures.flatMap((refusal) => {
            const room = opened(item, "now");

            press(room, first);
            finish(room);
            press(room, control);

            const before = playedIn(room);

            // A broken source refuses the play and fires the element's error both.
            hear(room, { control, kind: "refused", refusal });
            hear(room, { control, kind: "refused", refusal: { kind: "no-source" } });
            finish(room);

            return toldIn(room) === control.name &&
              shownAt(room.session, control) === "told" &&
              playedIn(room) === before &&
              Option.isNone(room.playing) &&
              room.faults.length === 0
              ? []
              : [{ control: control.name, played: playedIn(room), told: toldIn(room) }];
          }),
        ),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("is told anew at every press, and the notice comes down at the next press", () => {
    const wrong = itemsUpTo(3).flatMap((item) =>
      item.flatMap((first) =>
        failures.flatMap((refusal) => {
          const room = opened(item, "now");
          const faults: string[] = [];

          press(room, first);
          hear(room, { control: first, kind: "refused", refusal });

          let standing = first;

          // Every later press that fails is told again, the notice before it down first.
          for (const control of item) {
            room.commands = [];
            press(room, control);

            const down = shownAt(room.session, standing);

            hear(room, { control, kind: "refused", refusal });

            if (actsIn(room) !== `play ${control.name}, stop ${control.name}`) {
              faults.push(`pressing ${control.name} gave ${actsIn(room)}`);
            }

            if (control !== standing && down !== "resting") {
              faults.push(`pressing ${control.name} left ${standing.name} ${down}`);
            }

            if (shownAt(room.session, control) !== "told") {
              faults.push(`${control.name}'s failure shows ${shownAt(room.session, control)}`);
            }

            standing = control;
          }

          const told = namesOf([first, ...item]);

          return faults.length === 0 && room.faults.length === 0 && toldIn(room) === told
            ? []
            : [
                {
                  faults: [...faults, ...room.faults],
                  first: first.name,
                  item: namesOf(item),
                  told: toldIn(room),
                },
              ];
        }),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("is never told of an interruption, an AbortError or MEDIA_ERR_ABORTED, which changes nothing", () => {
    const wrong = itemsUpTo(3).flatMap((item) =>
      item.flatMap((first) =>
        interruptions.flatMap((refusal) => {
          const room = opened(item, "now");

          press(room, first);
          hear(room, { control: first, kind: "refused", refusal });

          const still = sounds(room, first);

          finish(room);

          return still &&
            toldIn(room) === "" &&
            playedIn(room) === first.name &&
            room.faults.length === 0
            ? []
            : [{ first: first.name, played: playedIn(room), told: toldIn(room) }];
        }),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("tells nothing of a refusal of a control that is not playing, a recording no press waits on", () => {
    const wrong = itemsUpTo(3).flatMap((item) =>
      item.flatMap((first) =>
        item.flatMap((other) =>
          failures.flatMap((refusal) => {
            const room = opened(item, "now");

            hear(room, { control: other, kind: "refused", refusal });
            press(room, first);

            if (other !== first) {
              hear(room, { control: other, kind: "refused", refusal });
            }

            end(room);
            hear(room, { control: first, kind: "refused", refusal });

            return toldIn(room) === "" && room.faults.length === 0
              ? []
              : [{ first: first.name, other: other.name, told: toldIn(room) }];
          }),
        ),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });
});
