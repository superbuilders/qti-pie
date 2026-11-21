import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { heard, openedIn, pressedAfter } from "#plate/read-aloud/session.ts";
import type {
  Command,
  ReadAloudRole,
  Refusal,
  Report,
  Session,
} from "#plate/read-aloud/session.ts";

/**
 * A control of a test item: its role, and its name, the role and its place in document order.
 */
interface Spot {
  readonly name: string;
  readonly role: ReadAloudRole;
}

/**
 * The roles a control may read.
 */
const roles: readonly ReadAloudRole[] = ["prompt", "text", "choice"];

/**
 * Every sequence of `length` roles.
 *
 * @param length The sequence's length.
 * @returns The sequences.
 */
const rolesOf = (length: number): readonly (readonly ReadAloudRole[])[] =>
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
 * The chain a first press of a prompt plays, written apart from the session's sort: the prompt,
 * then the item's other prompts, its texts and its choices, each in document order.
 *
 * @param item The item's controls, in document order.
 * @param prompt The prompt pressed.
 * @returns The controls in the order they play.
 */
const chainOf = (item: readonly Spot[], prompt: Spot): readonly Spot[] => [
  prompt,
  ...item.filter((spot) => spot.role === "prompt" && spot !== prompt),
  ...item.filter((spot) => spot.role === "text"),
  ...item.filter((spot) => spot.role === "choice"),
];

/**
 * Each item's prompts, with the item: every first press that starts a chain.
 *
 * @param most The most controls an item holds.
 * @returns Each item and one of its prompts.
 */
const promptsUpTo = (most: number): readonly (readonly [readonly Spot[], Spot])[] =>
  itemsUpTo(most).flatMap((item) =>
    item.filter((spot) => spot.role === "prompt").map((prompt) => [item, prompt] as const),
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
 * playing does, or not, as one whose play the browser refused does not; and the item's instance,
 * with the instances of its test's items a press has been heard of, as its test's memory holds them
 * after each turn.
 */
interface Room {
  commands: Command<Spot>[];
  readonly echoes: boolean;
  faults: string[];
  readonly instance: string;
  mounted: readonly Spot[];
  playing: Option.Option<Spot>;
  pressed: ReadonlySet<string>;
  session: Session<Spot>;
}

/**
 * Whether a recording the session stops fires its `pause`: each test that drives the session
 * through a stop runs under both.
 */
const echoings: readonly boolean[] = [true, false];

/**
 * Show an item in its test: a room on it, opening with the session its test's memory gives it.
 *
 * @param item The item's controls, in document order.
 * @param instance The item's instance.
 * @param pressed The instances of the test's items a press has been heard of.
 * @returns The room.
 */
const visit = (item: readonly Spot[], instance: string, pressed: ReadonlySet<string>): Room => ({
  commands: [],
  echoes: true,
  faults: [],
  instance,
  mounted: item,
  playing: Option.none(),
  pressed,
  session: openedIn(pressed, instance),
});

/**
 * Open a room on an item no control of which has been pressed.
 *
 * @param item The item's controls, in document order.
 * @param echoes Whether a recording the session stops fires its `pause`.
 * @returns The room.
 */
const opened = (item: readonly Spot[], echoes = true): Room => ({
  ...visit(item, "item", new Set()),
  echoes,
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
  room.pressed = pressedAfter(room.pressed, room.instance, turn.session);

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
 * that plays it, which names the controls mounted then.
 *
 * @param room The room.
 * @param control The control.
 */
const press = (room: Room, control: Spot): void => {
  hear(
    room,
    sounds(room, control)
      ? { control, kind: "release" }
      : { control, kind: "press", mounted: room.mounted },
  );
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
 * Leave an item for another, as a host does: every control of the item unmounts.
 *
 * @param room The room.
 * @returns The instances of the test's items a press has been heard of, as the item leaves them.
 */
const leave = (room: Room): ReadonlySet<string> => {
  for (const spot of room.mounted) {
    unmount(room, spot);
  }

  return room.pressed;
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
 * Press a prompt first and let its chain play its first `steps` controls to their end, so the
 * chain plays its next.
 *
 * @param item The item.
 * @param prompt The prompt.
 * @param steps How many of the chain's controls end.
 * @param echoes Whether a recording the session stops fires its `pause`.
 * @returns The room.
 */
const chainedTo = (item: readonly Spot[], prompt: Spot, steps: number, echoes = true): Room => {
  const room = opened(item, echoes);

  press(room, prompt);

  for (let ended = 0; ended < steps; ended += 1) {
    end(room);
  }

  return room;
};

/**
 * Every moment of every chain, up to items of `most` controls: the item, its prompt, the chain it
 * plays, and how many of the chain's controls have ended, so the next one plays.
 *
 * @param most The most controls an item holds.
 * @returns Each moment.
 */
const momentsUpTo = (
  most: number,
): readonly {
  readonly chain: readonly Spot[];
  readonly item: readonly Spot[];
  readonly prompt: Spot;
  readonly steps: number;
}[] =>
  promptsUpTo(most).flatMap(([item, prompt]) => {
    const chain = chainOf(item, prompt);

    return chain.map((_, steps) => ({ chain, item, prompt, steps }));
  });

describe("an item's first press, where it plays a prompt", () => {
  it("plays that prompt, then the item's other prompts, its texts and its choices, each in document order, one after another", () => {
    const wrong = promptsUpTo(5).flatMap(([item, prompt]) => {
      const room = opened(item);

      press(room, prompt);
      finish(room);

      const expected = namesOf(chainOf(item, prompt));

      return playedIn(room) === expected && room.faults.length === 0
        ? []
        : [{ expected, faults: room.faults, item: namesOf(item), played: playedIn(room) }];
    });

    assert.deepStrictEqual(wrong, []);
  });

  it("skips every control unmounted before its turn, at any moment, and plays the rest in order", () => {
    const wrong = momentsUpTo(4).flatMap(({ chain, item, prompt, steps }) => {
      const waiting = chain.slice(steps + 1);

      return Array.from({ length: 2 ** waiting.length }, (_, bits) => {
        const gone = waiting.filter((_spot, index) => Math.floor(bits / 2 ** index) % 2 === 1);
        const room = chainedTo(item, prompt, steps);

        for (const spot of gone) {
          unmount(room, spot);
        }

        finish(room);

        const expected = namesOf(chain.filter((spot) => !gone.includes(spot)));

        return playedIn(room) === expected && room.faults.length === 0
          ? []
          : [{ expected, faults: room.faults, gone: namesOf(gone), played: playedIn(room) }];
      }).flat();
    });

    assert.deepStrictEqual(wrong, []);
  });

  it("chains no control mounted after the press", () => {
    const wrong = promptsUpTo(4).flatMap(([item, prompt]) => {
      const later: Spot = { name: "later", role: "choice" };
      const room = opened(item);

      press(room, prompt);
      room.mounted = [...room.mounted, later];
      finish(room);

      const expected = namesOf(chainOf(item, prompt));

      return playedIn(room) === expected ? [] : [{ expected, played: playedIn(room) }];
    });

    assert.deepStrictEqual(wrong, []);
  });
});

describe("every other press", () => {
  it("plays its own part alone: an item's first press of a text or a choice, and any later press, of a prompt too, whether the first still plays or not", () => {
    const wrong = itemsUpTo(4).flatMap((item) =>
      item.flatMap((first) =>
        item.flatMap((second) =>
          [true, false].flatMap((waits) => {
            const room = opened(item);

            press(room, first);

            if (waits) {
              finish(room);
            }

            const before = playedIn(room);

            if (sounds(room, second)) {
              return [];
            }

            press(room, second);
            finish(room);

            const firstPlays = first.role === "prompt" ? namesOf(chainOf(item, first)) : first.name;
            const expected = `${waits ? firstPlays : first.name} ${second.name}`;

            return playedIn(room) === expected && room.faults.length === 0
              ? []
              : [
                  {
                    before,
                    expected,
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
});

describe("the chain", () => {
  it("ends at a press of another control, which plays alone, at any moment", () => {
    const wrong = momentsUpTo(4).flatMap(({ chain, item, prompt, steps }) =>
      echoings.flatMap((echoes) =>
        item.flatMap((other) => {
          const room = chainedTo(item, prompt, steps, echoes);
          const current = chain[steps] ?? prompt;

          if (other === current) {
            return [];
          }

          press(room, other);
          // The control the chain played ends late, as one the browser's own media controls
          // played on would: the chain is over, so nothing follows it.
          hear(room, { control: current, kind: "ended" });
          finish(room);

          const expected = `${namesOf(chain.slice(0, steps + 1))} ${other.name}`;

          return playedIn(room) === expected && room.faults.length === 0
            ? []
            : [
                {
                  echoes,
                  expected,
                  faults: room.faults,
                  other: other.name,
                  played: playedIn(room),
                },
              ];
        }),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("ends at a press that stops the control playing, at a stop by anything else, and at the playing control's unmount, at any moment", () => {
    const causes: readonly (readonly [string, (room: Room, current: Spot) => void])[] = [
      [
        "a press that stops it",
        (room, current) => {
          press(room, current);
        },
      ],
      [
        "a stop by anything else",
        (room) => {
          stopElsewhere(room);
        },
      ],
      [
        "its unmount",
        (room, current) => {
          unmount(room, current);
        },
      ],
    ];
    const wrong = momentsUpTo(4).flatMap(({ chain, item, prompt, steps }) =>
      echoings.flatMap((echoes) =>
        causes.flatMap(([cause, act]) => {
          const room = chainedTo(item, prompt, steps, echoes);
          const current = chain[steps] ?? prompt;

          act(room, current);
          // The control that played ends late, as one the browser's own media controls played on
          // would: the chain is over, so nothing follows it.
          hear(room, { control: current, kind: "ended" });
          finish(room);

          const ended = namesOf(chain.slice(0, steps + 1));
          // Afterwards a press of any control still mounted plays it alone, and commands no
          // control that left.
          const after = room.mounted.flatMap((spot) => {
            const again: Room = { ...room, commands: [], faults: [] };

            press(again, spot);
            finish(again);

            return playedIn(again) === spot.name && again.faults.length === 0
              ? []
              : [`${spot.name}: ${playedIn(again)} ${again.faults.join(", ")}`];
          });

          return playedIn(room) === ended && room.faults.length === 0 && after.length === 0
            ? []
            : [{ after, cause, echoes, ended, faults: room.faults, played: playedIn(room) }];
        }),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("ends when the item is left, every control unmounting in any order, and commands nothing after", () => {
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
    const wrong = momentsUpTo(4).flatMap(({ chain, item, prompt, steps }) =>
      orders(item).flatMap((order) => {
        const room = chainedTo(item, prompt, steps);
        const before = room.commands.length;

        for (const spot of order) {
          unmount(room, spot);
        }

        finish(room);

        return room.commands.length === before && room.faults.length === 0
          ? []
          : [{ chain: namesOf(chain), order: namesOf(order), steps }];
      }),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("plays on through an end, a stop, a refusal, a release or an unmount it did not play next, and through a refusal that interrupts the control playing", () => {
    const wrong = momentsUpTo(4).flatMap(({ chain, item, prompt, steps }) => {
      const current = chain[steps] ?? prompt;
      const idle = item.filter((spot) => spot !== current);
      const played = chain.slice(0, steps);
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
          const room = chainedTo(item, prompt, steps);

          hear(room, report);
          finish(room);

          return playedIn(room) === namesOf(chain) &&
            toldIn(room) === "" &&
            room.faults.length === 0
            ? []
            : [{ chain: namesOf(chain), name, played: playedIn(room), told: toldIn(room) }];
        }),
        ...played.flatMap((spot) => {
          const room = chainedTo(item, prompt, steps);

          unmount(room, spot);
          finish(room);

          return playedIn(room) === namesOf(chain) && room.faults.length === 0
            ? []
            : [{ chain: namesOf(chain), name: `unmount ${spot.name}`, played: playedIn(room) }];
        }),
      ];
    });

    assert.deepStrictEqual(wrong, []);
  });
});

describe("a press that cannot play", () => {
  it("is told once, at the first control that fails, however many of its chain's recordings fail and however often each says so, and its chain plays on past each", () => {
    const wrong = promptsUpTo(4).flatMap(([item, prompt]) => {
      const chain = chainOf(item, prompt);

      return Array.from({ length: 2 ** chain.length - 1 }, (_, code) => code + 1).flatMap(
        (bits) => {
          const failing = chain.filter((_spot, index) => Math.floor(bits / 2 ** index) % 2 === 1);

          return failures.flatMap((refusal) => {
            const room = opened(item);

            press(room, prompt);

            for (let turns = chain.length; turns > 0 && Option.isSome(room.playing); turns -= 1) {
              if (Option.isSome(room.playing) && failing.includes(room.playing.value)) {
                const control = room.playing.value;

                // A broken source refuses the play and fires the element's error both.
                hear(room, { control, kind: "refused", refusal });
                hear(room, { control, kind: "refused", refusal: { kind: "no-source" } });
              } else {
                end(room);
              }
            }

            const first = failing[0]?.name ?? "";

            return playedIn(room) === namesOf(chain) &&
              toldIn(room) === first &&
              Option.isNone(room.playing) &&
              room.faults.length === 0
              ? []
              : [
                  {
                    failing: namesOf(failing),
                    played: playedIn(room),
                    refusal: JSON.stringify(refusal),
                    told: toldIn(room),
                  },
                ];
          });
        },
      );
    });

    assert.deepStrictEqual(wrong, []);
  });

  it("is told once where it plays its part alone, and nothing plays after", () => {
    const wrong = itemsUpTo(3).flatMap((item) =>
      item.flatMap((first) =>
        item.flatMap((control) =>
          failures.flatMap((refusal) => {
            const room = opened(item);

            press(room, first);
            finish(room);
            press(room, control);

            const before = playedIn(room);

            hear(room, { control, kind: "refused", refusal });
            hear(room, { control, kind: "refused", refusal });
            finish(room);

            return toldIn(room) === control.name &&
              playedIn(room) === before &&
              room.faults.length === 0
              ? []
              : [{ control: control.name, played: playedIn(room), told: toldIn(room) }];
          }),
        ),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("is told anew at every press, and the notice comes down at the next press, a press that stops the chain included", () => {
    const wrong = momentsUpTo(3).flatMap(({ chain, item, prompt, steps }) => {
      const current = chain[steps] ?? prompt;

      return failures.flatMap((refusal) => {
        const room = chainedTo(item, prompt, steps);

        hear(room, { control: current, kind: "refused", refusal });

        const faults: string[] = [];
        const told = toldIn(room);

        if (told !== current.name) {
          faults.push(`the chain's failure told ${told}`);
        }

        // A press that stops the chain playing on past the failure takes the notice down.
        if (Option.isSome(room.playing)) {
          const playing = room.playing.value;

          room.commands = [];
          press(room, playing);

          const [first] = room.commands;

          if (first?.act !== "hush" || first.control !== current || sounds(room, playing)) {
            faults.push(`the release of ${playing.name} gave ${JSON.stringify(room.commands)}`);
          }
        }

        // Every later press that fails is told again, the notice before it down first.
        for (const control of item) {
          const standing = Option.getOrUndefined(room.session.told);

          room.commands = [];
          press(room, control);
          hear(room, { control, kind: "refused", refusal });

          const acts = room.commands.map((each) => `${each.act} ${each.control.name}`);
          const expected = [
            ...(standing === undefined ? [] : [`hush ${standing.name}`]),
            `play ${control.name}`,
            `stop ${control.name}`,
            `tell ${control.name}`,
          ];

          if (acts.join(", ") !== expected.join(", ")) {
            faults.push(`pressing ${control.name} gave ${acts.join(", ")}`);
          }
        }

        return faults.length === 0 && room.faults.length === 0
          ? []
          : [{ chain: namesOf(chain), faults: [...faults, ...room.faults], steps }];
      });
    });

    assert.deepStrictEqual(wrong, []);
  });

  it("is never told of an interruption, an AbortError or MEDIA_ERR_ABORTED, which changes nothing, alone or in a chain", () => {
    const wrong = itemsUpTo(3).flatMap((item) =>
      item.flatMap((first) =>
        interruptions.flatMap((refusal) => {
          const room = opened(item);

          press(room, first);

          for (let turns = item.length; turns > 0 && Option.isSome(room.playing); turns -= 1) {
            hear(room, { control: room.playing.value, kind: "refused", refusal });
            end(room);
          }

          const expected = first.role === "prompt" ? namesOf(chainOf(item, first)) : first.name;

          return toldIn(room) === "" && playedIn(room) === expected && room.faults.length === 0
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

describe("an item the student comes back to", () => {
  it("keeps its first press spent where its test holds one memory, so a press of a prompt plays the prompt alone, however the first visit pressed it; and chains again where each visit holds its own", () => {
    const wrong = itemsUpTo(4).flatMap((item) =>
      item.flatMap((first) =>
        item
          .filter((spot) => spot.role === "prompt")
          .flatMap((prompt) => {
            const before = visit(item, "a", new Set());

            press(before, first);
            finish(before);

            const remembered = leave(before);
            const test = visit(item, "a", remembered);
            const own = visit(item, "a", new Set());

            for (const room of [test, own]) {
              press(room, prompt);
              finish(room);
            }

            const chain = namesOf(chainOf(item, prompt));

            return playedIn(test) === prompt.name &&
              playedIn(own) === chain &&
              test.faults.length === 0 &&
              own.faults.length === 0
              ? []
              : [
                  {
                    first: first.name,
                    item: namesOf(item),
                    own: playedIn(own),
                    prompt: prompt.name,
                    test: playedIn(test),
                  },
                ];
          }),
      ),
    );

    assert.deepStrictEqual(wrong, []);
  });

  it("still chains where its earlier visit pressed nothing, and where only another item was pressed", () => {
    const wrong = itemsUpTo(4).flatMap((item) =>
      item
        .filter((spot) => spot.role === "prompt")
        .flatMap((prompt) =>
          item.flatMap((other) => {
            const unpressed = visit(item, "a", new Set());
            const elsewhere = visit(item, "b", leave(unpressed));

            press(elsewhere, other);
            finish(elsewhere);

            const back = visit(item, "a", leave(elsewhere));

            press(back, prompt);
            finish(back);

            const chain = namesOf(chainOf(item, prompt));

            return playedIn(back) === chain &&
              [...back.pressed].join(" ") === "b a" &&
              back.faults.length === 0
              ? []
              : [
                  {
                    item: namesOf(item),
                    other: other.name,
                    played: playedIn(back),
                    pressed: [...back.pressed].join(" "),
                    prompt: prompt.name,
                  },
                ];
          }),
        ),
    );

    assert.deepStrictEqual(wrong, []);
  });
});
