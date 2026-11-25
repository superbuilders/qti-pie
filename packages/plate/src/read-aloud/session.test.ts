/**
 * Read-aloud's session over one item (`heard` beside this file), against a page written apart from
 * it: every item of up to five controls, each reading an interaction's prompt, a text of the body
 * or a choice, at every place in document order, driven as the browser carries out the session's
 * commands. Each control plays its own part alone and only at its own press, as the implementation
 * guide stores a part's recording, the alternative to that part's written text, and states no
 * sequencing of an item's recordings (§5.2.8.3):
 *
 * - **alone:** a press of a control, a prompt's as any other's, the item's first press or a later
 *   one, plays that control and no other, and nothing plays after its recording ends;
 * - **one at a time:** a press of a second control while the first plays stops the first and plays
 *   the second alone, and a press of the control playing stops it;
 * - **nothing next:** nothing plays after a recording ends, stops by anything else or fails, or its
 *   control unmounts, nor once the item is left;
 * - **the notice:** a press that cannot play is told once, at its control, and the next press takes
 *   the notice down; an interruption is told nothing, and so is a refusal no press waits on.
 *
 * Kills: the chain, as plate's session played it before, an item's first press of a prompt playing
 * the prompt and then every other control mounted, prompts before texts before choices, fails
 * "alone" at each of the 546 presses of a prompt in an item of two to five controls (a press of
 * `prompt0` in `prompt0 text1 choice2` played all three).
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { heard, newSession } from "#plate/read-aloud/session.ts";
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
 * A page holding one item's controls, as the browser carries out the session's commands: which
 * controls are mounted, in document order, which one's recording plays, every command the session
 * gave, the faults no session may commit, a play over a recording still playing and a command to a
 * control that left the page, and whether a recording the session stops fires its `pause`, as one
 * playing does, or not, as one whose play the browser refused does not.
 */
interface Room {
  commands: Command<Spot>[];
  readonly echoes: boolean;
  faults: string[];
  mounted: readonly Spot[];
  playing: Option.Option<Spot>;
  session: Session<Spot>;
}

/**
 * Whether a recording the session stops fires its `pause`: each test that drives the session
 * through a stop runs under both.
 */
const echoings: readonly boolean[] = [true, false];

/**
 * Open a room on an item, its session the one every item opens with.
 *
 * @param item The item's controls, in document order.
 * @param echoes Whether a recording the session stops fires its `pause`.
 * @returns The room.
 */
const opened = (item: readonly Spot[], echoes = true): Room => ({
  commands: [],
  echoes,
  faults: [],
  mounted: item,
  playing: Option.none(),
  session: newSession,
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
 * Report to the session and carry out its commands as the browser does: a `play` starts the
 * control's recording, a `stop` stops it, and a recording stopped while it played fires its
 * `pause`, which its control reports once the commands have run.
 *
 * @param room The room, changed in place.
 * @param report The report.
 */
const hear = (room: Room, report: Report<Spot>): void => {
  const turn = heard(room.session, report);
  const stopped: Spot[] = [];

  room.session = turn.session;

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

      if (room.echoes) {
        stopped.push(command.control);
      }
    }
  }

  for (const control of stopped) {
    hear(room, { control, kind: "paused" });
  }
};

/**
 * Press a control as a child does: a press that stops it while its recording plays, else one
 * that plays it.
 *
 * @param room The room.
 * @param control The control.
 */
const press = (room: Room, control: Spot): void => {
  hear(room, sounds(room, control) ? { control, kind: "release" } : { control, kind: "press" });
};

/**
 * Let the recording playing play to its end.
 *
 * @param room The room.
 */
const end = (room: Room): void => {
  if (Option.isSome(room.playing)) {
    const control = room.playing.value;

    room.playing = Option.none();
    hear(room, { control, kind: "ended" });
  }
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
 * hidden page does: it fires its `pause`.
 *
 * @param room The room.
 */
const stopElsewhere = (room: Room): void => {
  if (Option.isSome(room.playing)) {
    const control = room.playing.value;

    room.playing = Option.none();
    hear(room, { control, kind: "paused" });
  }
};

/**
 * Take a control off the page, as React unmounts it: its recording stops with no `pause`
 * reported, its listeners gone, and it reports that it left.
 *
 * @param room The room.
 * @param control The control.
 */
const unmount = (room: Room, control: Spot): void => {
  room.mounted = room.mounted.filter((spot) => spot !== control);

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
const toldIn = (room: Room): string =>
  room.commands
    .filter((command) => command.act === "tell")
    .map((command) => command.control.name)
    .join(" ");

/**
 * Give the names of controls, in order.
 *
 * @param spots The controls.
 * @returns The names.
 */
const namesOf = (spots: readonly Spot[]): string => spots.map((spot) => spot.name).join(" ");

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
        const room = opened(item);

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
            const room = opened(item);

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

              const acts = room.commands.map((each) => `${each.act} ${each.control.name}`);

              // The first ends late, as one the browser's own media controls played on would:
              // the second's press stopped it, so nothing follows it.
              hear(room, { control: first, kind: "ended" });
              finish(room);

              const expected = [`stop ${first.name}`, `play ${second.name}`];

              return acts.join(", ") === expected.join(", ") &&
                playedIn(room) === second.name &&
                room.faults.length === 0
                ? []
                : [
                    {
                      acts: acts.join(", "),
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

  it("of the control playing stops it, and nothing plays after", () => {
    const wrong = itemsUpTo(4).flatMap((item) =>
      echoings.flatMap((echoes) =>
        item.flatMap((control) => {
          const room = opened(item, echoes);

          press(room, control);
          press(room, control);

          const stopped = Option.isNone(room.playing);

          finish(room);

          return stopped && playedIn(room) === control.name && room.faults.length === 0
            ? []
            : [{ control: control.name, echoes, item: namesOf(item), played: playedIn(room) }];
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
          const room = opened(item);

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
  it("plays on through an end, a stop, a refusal, a release or an unmount of another control, and through a refusal that interrupts it, and nothing plays after it", () => {
    const wrong = itemsUpTo(4).flatMap((item) =>
      item.flatMap((current) => {
        const idle = item.filter((spot) => spot !== current);
        const reports: readonly (readonly [string, Report<Spot>])[] = [
          ...idle.flatMap((spot): readonly (readonly [string, Report<Spot>])[] => [
            [`ended ${spot.name}`, { control: spot, kind: "ended" }],
            [`paused ${spot.name}`, { control: spot, kind: "paused" }],
            [`release ${spot.name}`, { control: spot, kind: "release" }],
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
            const room = opened(item);

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
            const room = opened(item);

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

describe("a press that cannot play", () => {
  it("is told once, at its control, however often its recording says so, and nothing plays after", () => {
    const wrong = itemsUpTo(3).flatMap((item) =>
      item.flatMap((first) =>
        item.flatMap((control) =>
          failures.flatMap((refusal) => {
            const room = opened(item);

            press(room, first);
            finish(room);
            press(room, control);

            const before = playedIn(room);

            // A broken source refuses the play and fires the element's error both.
            hear(room, { control, kind: "refused", refusal });
            hear(room, { control, kind: "refused", refusal: { kind: "no-source" } });
            finish(room);

            return toldIn(room) === control.name &&
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

  it("is told anew at every press, and the notice comes down at the next press, a press that stops a control included", () => {
    const wrong = itemsUpTo(3).flatMap((item) =>
      item.flatMap((first) =>
        failures.flatMap((refusal) => {
          const room = opened(item);
          const faults: string[] = [];

          press(room, first);
          hear(room, { control: first, kind: "refused", refusal });

          let standing = first;

          // Every later press that fails is told again, the notice before it down first.
          for (const control of item) {
            room.commands = [];
            press(room, control);
            hear(room, { control, kind: "refused", refusal });

            const acts = room.commands.map((each) => `${each.act} ${each.control.name}`);
            const expected = [
              `hush ${standing.name}`,
              `play ${control.name}`,
              `stop ${control.name}`,
              `tell ${control.name}`,
            ];

            if (acts.join(", ") !== expected.join(", ")) {
              faults.push(`pressing ${control.name} gave ${acts.join(", ")}`);
            }

            standing = control;
          }

          // A press that stops a control takes the notice down too, and plays nothing.
          for (const control of item) {
            const again: Room = { ...room, commands: [], faults: [] };

            hear(again, { control, kind: "release" });

            const acts = again.commands.map((each) => `${each.act} ${each.control.name}`);
            const expected = [`hush ${standing.name}`, `stop ${control.name}`];

            if (acts.join(", ") !== expected.join(", ") || again.faults.length > 0) {
              faults.push(`releasing ${control.name} gave ${acts.join(", ")}`);
            }
          }

          return faults.length === 0 && room.faults.length === 0
            ? []
            : [{ faults: [...faults, ...room.faults], first: first.name, item: namesOf(item) }];
        }),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("is never told of an interruption, an AbortError or MEDIA_ERR_ABORTED, which changes nothing", () => {
    const wrong = itemsUpTo(3).flatMap((item) =>
      item.flatMap((first) =>
        interruptions.flatMap((refusal) => {
          const room = opened(item);

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
            const room = opened(item);

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
