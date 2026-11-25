/**
 * Plate's UI suite over read-aloud in headless Google Chrome: plate's own `<ReadAloudItem>`,
 * `<ReadAloud>`, the Gap Match's island and the Media interaction's, an attempt's that counts its
 * plays into `<Responses>` and a review's replay, bundled and driven as a child presses
 * and a host moves between items (`#specimen/ui/read-aloud-browser.ts`), with synthetic recordings,
 * sine tones the page's server may hold back or refuse. Each rule runs under `<StrictMode>` and
 * without, and every rule also holds that no two recordings ever sounded at once and that the page
 * reported no error.
 *
 * The rules are the product's (one voice; each control plays its own part alone and only at its
 * own press; nothing plays by itself; a press stops whatever plays), read from the page, never from
 * plate's code:
 *
 * - RB1, alone: a prompt's press plays it alone, and nothing plays after it ends.
 * - RB2, one at a time in an item: a press of another control stops the first; a press of the control
 *   playing stops it.
 * - RB3, one voice across items: a press in one item stops the recording another item plays.
 * - RB4, leaving the item: once the host moves to the next item, even one that names the same file,
 *   nothing plays.
 * - RB5, leaving while a play is pending: a control unmounted while its recording loads never sounds
 *   once its data arrives.
 * - RB6 and RB7, a press while another's play is pending: in the same item or another, the pending
 *   recording never sounds, and no notice stands.
 * - RB8, a second press of a pending control stops it: the control the session plays stops at its
 *   press, whether or not its recording has begun to sound, a press by the pointer as two in one
 *   task.
 * - RB9, a late failure belongs to no press: a recording that fails after another control was pressed
 *   leaves that one playing and tells nothing.
 * - RB10, hidden and shown again: a control hidden while it plays (an `<Activity>` a router hides)
 *   falls silent and shows itself unpressed when shown again, and its next press plays it.
 * - RB11, rapid presses across items: one voice throughout, the last press's.
 * - RB12 and RB14, two presses in one task, across items and in one item: the last one sounds.
 * - RB13, the old item hidden, the next naming the same file: silent, and the next item's control
 *   plays alone.
 * - RB15, a Media interaction and the host's own media: a read-aloud press stops the Media and the
 *   host's media playing, and a Media's press stops read-aloud.
 * - RB16, the host's stop of every recording: the control shows itself unpressed, and its next press
 *   plays it from its start.
 * - RB17, one instance across items: a host that keeps the instance while the next item's control at
 *   the same place has another recording plays nothing of the left item, and the control's press
 *   plays the next item's file.
 * - RB18, a Gap Match's label: the control a label of a Gap Match's sentence holds after its words
 *   plays its own recording at its own press, one voice with the item's other controls and another
 *   item's, and a press of a card and its placement in a gap neither start nor stop a recording.
 * - RB19, a Media interrupted: a Media that another Media's press or a read-aloud press stops
 *   mid-play keeps the one play it counted, and its own press resumes that play and spends none,
 *   under `max-plays` 1 and in loop mode alike; one stopped while it still loads, before it
 *   sounded, counted no play, so its next press plays and counts (reading 245).
 * - RB20, a refused play takes no voice: a Media's play past `max-plays`, as its native controls
 *   start it, is refused and stops nothing.
 * - RB21, the voice outlives a player's leaving: after one of two players unmounts, a host's media
 *   that starts still stops the other's recording.
 * - RB22, what sounded before: a host's media playing before any player mounted is stopped by the
 *   next press; a muted looping media is no voice, never paused and never pausing.
 * - RB23, a picture graph's labels: the control each category word of a graph's table holds after the
 *   word, in its cell, plays only at its own press, one voice with the stem.
 *
 * Kills: plate's islands at ywomqvus, the commit before this suite, fail RB8 (two presses in one
 * task restarted the pending recording), RB10 (the control stayed pressed and silent once shown
 * again), RB12 and RB14 (two presses in one task left silence), RB15 (a Media and a recording read
 * aloud sounded together), RB17 (the left item's recording played on, and the press played its
 * file), RB19 (two Media sounded together), RB20 (a refused play stopped the recording read aloud)
 * and RB22 (a host's media playing before sounded on). Each rule that held there already is killed
 * by a slip planted in this suite's plate: a session that plays a recording again at its stop (RB1,
 * RB16), an island whose unmount leaves its recording playing (RB10, RB13) or plays it on (RB4),
 * one that retries an interrupted play (RB5), a page with no one voice (RB3, RB6 and RB7, RB11,
 * RB15, RB18), a session that plays the control playing again at its press (RB2, RB8, RB23), one
 * that tells a refusal no press waits on (RB9), a play that does not go back to the start (RB16), a
 * control not keyed by its recording (RB17), a Media that counts a play as it begins (RB19), a page
 * listener that takes the voice for a player's own play (RB20) or goes at any player's leaving
 * (RB21), and a voice that pauses only players or treats a muted media as one (RB22).
 *
 * @module
 */
import { assert, layer } from "@effect/vitest";
import { Context, Duration, Effect, Layer } from "effect";
import { readAloudBrowser, recording, settle } from "#specimen/ui/read-aloud-browser.ts";
import type {
  Account,
  Driven,
  ReadAloudBrowser,
  ReadAloudBrowserFailure,
} from "#specimen/ui/read-aloud-browser.ts";
import type { Scene, SceneItem } from "#specimen/ui/read-aloud-page.ts";

/**
 * How long one rule may run before vitest stops it: a hang guard, never a budget. A rule opens a
 * page twice and waits for each state it drives the page to.
 */
const ruleHang = 300_000;

/**
 * How long a held-back recording waits on the server before it arrives: the suite's own input,
 * longer than the gap a rule leaves between a press and the next (150 ms), so the next press
 * always finds the first recording still loading.
 */
const heldBack = 1500;

/**
 * A recording that outlasts every rule: thirty seconds of tone.
 *
 * @param name Its name.
 * @returns Its path.
 */
const long = (name: string): string => recording(name, 30_000);

/**
 * A recording held back on the server before it arrives ({@link heldBack}).
 *
 * @param name Its name.
 * @returns Its path.
 */
const slow = (name: string): string => recording(name, 30_000, { delay: heldBack });

/**
 * Write an item a host shows.
 *
 * @param instance Its instance.
 * @param controls Its controls, each its name and its recording.
 * @returns The item.
 */
const item = (
  instance: string,
  ...controls: readonly (readonly [string, string])[]
): SceneItem => ({
  controls: controls.map(([label, src]) => ({ label, src })),
  hidden: false,
  instance,
});

/**
 * Write a scene of items and Media interactions.
 *
 * @param items The items.
 * @param media The Media interactions' files.
 * @returns The scene.
 */
const sceneOf = (items: readonly SceneItem[], media: readonly string[] = []): Scene => ({
  items,
  media,
});

/**
 * Chrome and the page's server, held for the file.
 */
class Chrome extends Context.Service<Chrome, ReadAloudBrowser>()(
  "specimen/ui/read-aloud-browser.test/Chrome",
) {}

/**
 * Open {@link Chrome}, closed when the file ends.
 */
const ChromeLayer = Layer.effect(Chrome, Effect.orDie(readAloudBrowser));

/**
 * Give the names of the recordings the page started to play, by their `play` events, in order.
 *
 * @param account The page's account.
 * @returns The names.
 */
const playsIn = (account: Account): string =>
  account.seen
    .filter((each) => each.event === "play")
    .map((each) => each.label)
    .join(" ");

/**
 * Tell whether a recording ever sounded.
 *
 * @param account The page's account.
 * @param label The recording's name.
 * @returns Whether its `playing` was seen.
 */
const sounded = (account: Account, label: string): boolean =>
  account.seen.some((each) => each.label === label && each.event === "playing");

/**
 * Give a control's pressed state and notice as the page shows them: its recording still in the
 * page.
 *
 * @param account The page's account.
 * @param label The control's name.
 * @returns Its `aria-pressed` and notice, `gone` where it is not in the page.
 */
const shownOf = (account: Account, label: string): string => {
  const shown = account.recordings.find((each) => each.label === label && !each.detached);

  return shown === undefined ? "gone" : `pressed ${String(shown.pressed)} notice "${shown.notice}"`;
};

/**
 * Run a rule on a page of a scene, under `<StrictMode>` and without, and gather what went wrong:
 * the rule's own faults, a state the page never came to, two recordings sounding at once, and the
 * page's errors.
 *
 * @param scene The scene the page opens on.
 * @param rule The rule, which gives its faults.
 * @returns Every fault, by mode.
 */
const inEveryMode = (
  scene: Scene,
  rule: (page: Driven) => Effect.Effect<readonly string[], ReadAloudBrowserFailure>,
): Effect.Effect<readonly string[], ReadAloudBrowserFailure, Chrome> =>
  Effect.gen(function* everyMode() {
    const chrome = yield* Chrome;
    const faults = yield* Effect.forEach([false, true], (strict) =>
      Effect.scoped(
        Effect.gen(function* oneMode() {
          const page = yield* chrome.open(scene, strict);
          const own = yield* Effect.catchTag(rule(page), "ReadAloudBrowserFailure", (failure) =>
            Effect.succeed([failure.message]),
          );
          const { errors, overlaps, recordings, seen } = yield* page.account;
          const found = [
            ...own,
            ...overlaps.map((each) => `two voices at once: ${each}`),
            ...errors.map((each) => `the page's error: ${each}`),
          ];

          return [
            ...found,
            // What the page saw and holds, where something went wrong, so the fault can be read.
            ...(found.length === 0
              ? []
              : [
                  `seen: ${seen.map((each) => `${String(Math.round(each.at))} ${each.label} ${each.event}`).join(", ")}`,
                  `holds: ${JSON.stringify(recordings)}`,
                ]),
          ].map((fault) => `${strict ? "strict" : "plain"}: ${fault}`);
        }),
      ),
    );

    return faults.flat();
  });

/**
 * Check a rule holds: it gives no fault in either mode.
 *
 * @param scene The scene the page opens on.
 * @param rule The rule.
 * @returns The check.
 */
const holds = (
  scene: Scene,
  rule: (page: Driven) => Effect.Effect<readonly string[], ReadAloudBrowserFailure>,
): Effect.Effect<void, ReadAloudBrowserFailure, Chrome> =>
  Effect.map(inEveryMode(scene, rule), (faults) => {
    assert.deepStrictEqual(faults, []);
  });

// The rules wait on the wall clock, as a child does between presses and Chrome does for a
// recording's data: the live clock, never the test clock.
layer(ChromeLayer, { excludeTestServices: true, timeout: Duration.millis(ruleHang) })(
  "read-aloud in Chrome",
  (it) => {
    it.effect(
      "RB1: a prompt's press plays it alone, and nothing plays after it ends",
      () =>
        holds(
          sceneOf([
            item(
              "i1",
              ["prompt0", recording("prompt0", 1500)],
              ["text1", long("text1")],
              ["choice2", long("choice2")],
            ),
          ]),
          (page) =>
            Effect.gen(function* alone() {
              yield* page.press("prompt0");
              yield* page.saw("prompt0", "ended");
              yield* settle(1000);

              const account = yield* page.account;

              return [
                ...(playsIn(account) === "prompt0" ? [] : [`played ${playsIn(account)}`]),
                ...account.recordings
                  .filter((each) => each.sounding)
                  .map((each) => `${each.label} sounds`),
              ];
            }),
        ),
      ruleHang,
    );

    it.effect(
      "RB2: a press of another control stops the first, and a press of the control playing stops it",
      () =>
        holds(
          sceneOf([item("i1", ["text1", long("text1")], ["choice2", long("choice2")])]),
          (page) =>
            Effect.gen(function* oneAtATime() {
              yield* page.press("text1");
              yield* page.sounding("text1");
              yield* page.press("choice2");
              yield* page.sounding("choice2");
              yield* page.press("choice2");
              yield* page.sounding();

              const account = yield* page.account;

              return shownOf(account, "choice2") === `pressed false notice ""`
                ? []
                : [`choice2 shows ${shownOf(account, "choice2")}`];
            }),
        ),
      ruleHang,
    );

    it.effect(
      "RB3: a press in one item stops the recording another item plays",
      () =>
        holds(sceneOf([item("i1", ["A1", long("a1")]), item("i2", ["C2", long("c2")])]), (page) =>
          Effect.gen(function* acrossItems() {
            yield* page.press("A1");
            yield* page.sounding("A1");
            yield* page.press("C2");
            yield* page.sounding("C2");
            yield* page.press("A1");
            yield* page.sounding("A1");

            return [];
          }),
        ),
      ruleHang,
    );

    it.effect(
      "RB4: once the host moves to the next item, one naming the same file included, nothing plays",
      () =>
        holds(sceneOf([item("i1", ["S", long("same")])]), (page) =>
          Effect.gen(function* leaving() {
            yield* page.press("S");
            yield* page.sounding("S");
            yield* page.scene(sceneOf([item("i2", ["S", long("same")])]));
            yield* page.sounding();
            yield* settle(1000);

            const account = yield* page.account;

            return [
              ...(playsIn(account) === "S" ? [] : [`played ${playsIn(account)}`]),
              ...account.recordings
                .filter((each) => each.sounding)
                .map((each) => `${each.label} sounds`),
            ];
          }),
        ),
      ruleHang,
    );

    it.effect(
      "RB5: a control unmounted while its recording loads never sounds once its data arrives",
      () =>
        holds(sceneOf([item("i1", ["P", slow("p")])]), (page) =>
          Effect.gen(function* leavingPending() {
            yield* page.press("P");
            yield* settle(200);
            yield* page.scene(sceneOf([]));
            yield* settle(heldBack + 1500);

            const account = yield* page.account;

            return sounded(account, "P") ? ["P sounded after its control left"] : [];
          }),
        ),
      ruleHang,
    );

    it.effect(
      "RB6 and RB7: a press while another's play is pending, in its item or another, leaves the pending recording silent and tells nothing",
      () =>
        Effect.gen(function* pendingPress() {
          for (const scene of [
            sceneOf([item("i1", ["A", slow("a")], ["B", long("b")])]),
            sceneOf([item("i1", ["A", slow("a")]), item("i2", ["B", long("b")])]),
          ]) {
            yield* holds(scene, (page) =>
              Effect.gen(function* overtaken() {
                yield* page.press("A");
                yield* settle(150);
                yield* page.press("B");
                yield* page.sounding("B");
                yield* settle(heldBack + 1000);
                yield* page.sounding("B");

                const account = yield* page.account;

                return [
                  ...(sounded(account, "A") ? ["A sounded"] : []),
                  ...(shownOf(account, "A") === `pressed false notice ""`
                    ? []
                    : [`A shows ${shownOf(account, "A")}`]),
                  ...(shownOf(account, "B") === `pressed true notice ""`
                    ? []
                    : [`B shows ${shownOf(account, "B")}`]),
                ];
              }),
            );
          }
        }),
      ruleHang,
    );

    it.effect(
      "RB8: a second press of a control whose recording is still loading stops it, by the pointer and in the press's own task",
      () =>
        Effect.gen(function* secondPress() {
          for (const twice of [
            (page: Driven) => Effect.andThen(page.press("A"), page.press("A")),
            (page: Driven) => page.pressTogether(["A", "A"]),
          ]) {
            yield* holds(sceneOf([item("i1", ["A", slow("a")])]), (page) =>
              Effect.gen(function* stoppedPending() {
                yield* twice(page);
                yield* settle(heldBack + 1500);

                const account = yield* page.account;

                return [
                  ...(sounded(account, "A") ? ["A sounded after its second press"] : []),
                  ...(shownOf(account, "A") === `pressed false notice ""`
                    ? []
                    : [`A shows ${shownOf(account, "A")}`]),
                ];
              }),
            );
          }
        }),
      ruleHang,
    );

    it.effect(
      "RB9: a recording that fails after another control was pressed leaves that one playing and tells nothing",
      () =>
        holds(
          sceneOf([
            item(
              "i1",
              ["A", recording("broken", 30_000, { delay: 800, missing: true })],
              ["B", long("b")],
            ),
          ]),
          (page) =>
            Effect.gen(function* lateFailure() {
              yield* page.press("A");
              yield* settle(100);
              yield* page.press("B");
              yield* page.sounding("B");
              yield* settle(1500);
              yield* page.sounding("B");

              const account = yield* page.account;

              return account.recordings
                .filter((each) => each.notice !== "")
                .map((each) => `${each.label} tells ${each.notice}`);
            }),
        ),
      ruleHang,
    );

    it.effect(
      "RB10: a control hidden while it plays falls silent, shows itself unpressed when shown again, and its next press plays it",
      () =>
        holds(sceneOf([item("i1", ["A", long("a")])]), (page) =>
          Effect.gen(function* hidden() {
            yield* page.press("A");
            yield* page.sounding("A");
            yield* page.scene(sceneOf([{ ...item("i1", ["A", long("a")]), hidden: true }]));
            yield* page.sounding();
            yield* settle(500);
            yield* page.scene(sceneOf([item("i1", ["A", long("a")])]));
            yield* settle(300);
            yield* page.sounding();

            const shown = shownOf(yield* page.account, "A");

            yield* page.press("A");
            yield* page.sounding("A");

            return shown === `pressed false notice ""` ? [] : [`A shows ${shown} once shown again`];
          }),
        ),
      ruleHang,
    );

    it.effect(
      "RB11: rapid presses across items keep one voice, the last press's",
      () =>
        holds(
          sceneOf([item("i1", ["A", long("a")], ["B", long("b")]), item("i2", ["C", long("c")])]),
          (page) =>
            Effect.gen(function* rapid() {
              for (const name of ["A", "B", "C", "A", "B", "C", "B"]) {
                yield* page.press(name);
              }

              yield* page.sounding("B");

              return [];
            }),
        ),
      ruleHang,
    );

    it.effect(
      "RB12 and RB14: two presses in one task, across items and in one item, leave the last one sounding",
      () =>
        Effect.gen(function* oneTask() {
          for (const scene of [
            sceneOf([item("i1", ["A", long("a")]), item("i2", ["B", long("b")])]),
            sceneOf([item("i1", ["A", long("a")], ["B", long("b")])]),
          ]) {
            yield* holds(scene, (page) =>
              Effect.gen(function* together() {
                yield* page.pressTogether(["A", "B"]);
                yield* page.sounding("B");
                yield* settle(500);
                yield* page.sounding("B");

                return [];
              }),
            );
          }
        }),
      ruleHang,
    );

    it.effect(
      "RB13: the old item hidden while the next names the same file is silent, and the next item's control plays alone",
      () =>
        holds(sceneOf([item("i1", ["X", long("same")])]), (page) =>
          Effect.gen(function* hiddenBehind() {
            yield* page.press("X");
            yield* page.sounding("X");
            yield* page.scene(
              sceneOf([
                { ...item("i1", ["X", long("same")]), hidden: true },
                item("i2", ["Y", long("same")]),
              ]),
            );
            yield* page.sounding();
            yield* page.press("Y");
            yield* page.sounding("Y");

            return [];
          }),
        ),
      ruleHang,
    );

    it.effect(
      "RB15: a read-aloud press stops a Media and the host's media playing, and a Media's press stops read-aloud",
      () =>
        holds(sceneOf([item("i1", ["A", long("a")])], [long("media")]), (page) =>
          Effect.gen(function* withMedia() {
            const media = `media ${long("media")}`;

            yield* page.press(`Play ${long("media")}`);
            yield* page.sounding(media);
            yield* page.press("A");
            yield* page.sounding("A");
            yield* page.press(`Play ${long("media")}`);
            yield* page.sounding(media);

            const shown = shownOf(yield* page.account, "A");

            yield* page.foreign(long("host"));
            yield* page.sounding("foreign");
            yield* page.press("A");
            yield* page.sounding("A");

            return shown === `pressed false notice ""`
              ? []
              : [`A shows ${shown} once the Media plays`];
          }),
        ),
      ruleHang,
    );

    it.effect(
      "RB16: after the host stops every recording, the control shows itself unpressed and its next press plays it from its start",
      () =>
        holds(sceneOf([item("i1", ["A", long("a")], ["B", long("b")])]), (page) =>
          Effect.gen(function* stopAll() {
            yield* page.press("A");
            yield* page.sounding("A");
            yield* settle(1500);
            yield* page.inPage(
              `for (const each of document.querySelectorAll("audio")) each.pause();`,
            );
            yield* page.sounding();

            const shown = shownOf(yield* page.account, "A");

            yield* page.press("A");
            yield* page.sounding("A");

            const again = (yield* page.account).recordings.find((each) => each.label === "A");

            return [
              ...(shown === `pressed false notice ""` ? [] : [`A shows ${shown} once stopped`]),
              ...(again !== undefined && again.time < 1.5
                ? []
                : [`A did not start again from its start: ${String(again?.time)}`]),
            ];
          }),
        ),
      ruleHang,
    );

    it.effect(
      "RB17: a host that keeps one instance across items plays nothing of the left item, and the next control's press plays its own file",
      () =>
        holds(sceneOf([item("kept", ["A", long("left")])]), (page) =>
          Effect.gen(function* keptInstance() {
            yield* page.press("A");
            yield* page.sounding("A");
            yield* page.scene(sceneOf([item("kept", ["A", long("next")])]));
            yield* page.sounding();
            yield* page.press("A");
            yield* page.sounding("A");

            const playing = (yield* page.account).recordings.filter((each) => each.sounding);

            return playing.every((each) => each.src.endsWith("/next.wav"))
              ? []
              : [`the press played ${playing.map((each) => each.src).join(", ")}`];
          }),
        ),
      ruleHang,
    );

    it.effect(
      "RB18: a Gap Match's label control plays its own recording at its own press, one voice with the item's other label and another item's control, and a card's press and placement start and stop nothing",
      () =>
        holds(
          {
            gapMatch: {
              instance: "gm",
              labels: [
                { label: "least", src: long("least") },
                { label: "greatest", src: long("greatest") },
              ],
            },
            items: [item("i1", ["stem", long("stem")])],
            media: [],
          },
          (page) =>
            Effect.gen(function* gapMatchLabel() {
              yield* page.press("least");
              yield* page.sounding("least");
              yield* page.press("greatest");
              yield* page.sounding("greatest");
              yield* page.press("stem");
              yield* page.sounding("stem");
              yield* page.press("greatest");
              yield* page.sounding("greatest");
              yield* page.press("3");
              yield* page.inPage(
                `document.querySelector("[data-slot=plate-gap] [data-slot=plate-placement-slot]")?.click();`,
              );
              yield* settle(800);
              yield* page.sounding("greatest");

              const placed = yield* page.textOf("[data-slot=plate-gap]");
              const account = yield* page.account;

              return [
                ...(placed.includes("3") ? [] : [`the gap holds "${placed}", not the card 3`]),
                ...(playsIn(account) === "least greatest stem greatest"
                  ? []
                  : [`played ${playsIn(account)}`]),
              ];
            }),
        ),
      ruleHang,
    );

    it.effect(
      "RB19: a Media interaction another Media or a read-aloud press stops mid-play keeps its one counted play, and its press resumes that play, spending none, under max-plays 1 and in loop mode alike; one stopped before it sounded counted no play",
      () =>
        holds(
          {
            counted: [
              { identifier: "M1", loop: false, maxPlays: 1, src: long("m1") },
              { identifier: "M2", loop: true, maxPlays: undefined, src: long("m2") },
              { identifier: "M3", loop: false, maxPlays: 1, src: slow("m3") },
            ],
            items: [item("i1", ["A", long("a")])],
            media: [],
          },
          (page) =>
            Effect.gen(function* interrupted() {
              const faults: string[] = [];
              const m1 = `media ${long("m1")}`;
              const m2 = `media ${long("m2")}`;

              /**
               * Check the counts the page posts now against those a step expects.
               *
               * @param step The step, for the fault.
               * @param expected Each Media's count, empty for NULL.
               * @returns The fault, none where the counts are those expected.
               */
              const counted = (step: string, expected: Readonly<Record<string, string>>) =>
                page.posted.pipe(
                  Effect.map((posted) =>
                    JSON.stringify(posted) === JSON.stringify(expected)
                      ? []
                      : [`${step}: posted ${JSON.stringify(posted)}`],
                  ),
                );

              yield* page.press("Play M1");
              yield* page.sounding(m1);
              yield* settle(1000);
              faults.push(...(yield* counted("M1 plays", { M1: "1", M2: "", M3: "" })));
              yield* page.press("Play M2");
              yield* page.sounding(m2);
              faults.push(
                ...(yield* counted("M2 stops M1 mid-play", { M1: "1", M2: "1", M3: "" })),
              );

              const stopped = (yield* page.account).recordings.find((each) => each.label === m1);

              yield* page.press("Play M1");
              yield* page.sounding(m1);
              faults.push(
                ...(yield* counted("M1 resumed under max-plays 1", { M1: "1", M2: "1", M3: "" })),
              );

              const resumed = (yield* page.account).recordings.find((each) => each.label === m1);

              yield* page.press("A");
              yield* page.sounding("A");
              faults.push(
                ...(yield* counted("a read-aloud press stops M1", { M1: "1", M2: "1", M3: "" })),
              );
              yield* page.press("Play M2");
              yield* page.sounding(m2);
              faults.push(
                ...(yield* counted("M2 resumed in loop mode", { M1: "1", M2: "1", M3: "" })),
              );
              // M3 is pressed while its recording still loads, and a read-aloud press pauses it
              // before it sounds: no play, so under max-plays 1 its next press plays and counts.
              yield* page.press("Play M3");
              yield* page.press("A");
              yield* page.sounding("A");
              yield* settle(heldBack + 1000);
              faults.push(
                ...(yield* counted("M3 paused before it sounded", { M1: "1", M2: "1", M3: "" })),
              );
              yield* page.press("Play M3");
              yield* page.sounding(`media ${slow("m3")}`);
              faults.push(
                ...(yield* counted("M3 plays and counts", { M1: "1", M2: "1", M3: "1" })),
              );

              return [
                ...faults,
                ...(stopped !== undefined && stopped.paused && !stopped.ended && stopped.time > 0
                  ? []
                  : [`M1 was not paused mid-play by M2: ${JSON.stringify(stopped)}`]),
                ...(resumed !== undefined && stopped !== undefined && resumed.time >= stopped.time
                  ? []
                  : [`M1 did not resume where it stopped: ${JSON.stringify([stopped, resumed])}`]),
              ];
            }),
        ),
      ruleHang,
    );

    it.effect(
      "RB20: a Media's play refused past max-plays takes no voice: the recording read aloud plays on",
      () =>
        holds(
          {
            counted: [
              { identifier: "M1", loop: false, maxPlays: 1, src: recording("m1-short", 1500) },
            ],
            items: [item("i1", ["A", long("a")])],
            media: [],
          },
          (page) =>
            Effect.gen(function* refusedPlay() {
              yield* page.press("Play M1");
              yield* page.saw(`media ${recording("m1-short", 1500)}`, "ended");
              yield* page.press("A");
              yield* page.sounding("A");
              // As the native controls play it: the element's own play(), which the island refuses.
              yield* page.inPage(
                `document.querySelector("[data-slot=plate-media-player] audio")?.play().catch(() => undefined);`,
              );
              yield* settle(800);
              yield* page.sounding("A");

              const posted = yield* page.posted;

              return posted["M1"] === "1" ? [] : [`M1 posted ${JSON.stringify(posted)}`];
            }),
        ),
      ruleHang,
    );

    it.effect(
      "RB21: after one of two players unmounts, a host's media that starts still stops the other's recording",
      () =>
        holds(sceneOf([item("i1", ["A", long("a")]), item("i2", ["B", long("b")])]), (page) =>
          Effect.gen(function* oneLeft() {
            yield* page.scene(sceneOf([item("i1", ["A", long("a")])]));
            yield* page.press("A");
            yield* page.sounding("A");
            yield* page.foreign(long("host"));
            yield* page.sounding("foreign");

            return [];
          }),
        ),
      ruleHang,
    );

    it.effect(
      "RB22: a host's media already playing before any player mounted is stopped by the next press, and a muted looping media neither takes the voice nor loses it",
      () =>
        holds(sceneOf([]), (page) =>
          Effect.gen(function* alreadyPlaying() {
            yield* page.foreign(long("host"));
            yield* page.foreign(long("deco"), true);
            yield* page.sounding("foreign");
            yield* page.scene(sceneOf([item("i1", ["A", long("a")])]));
            yield* page.press("A");
            yield* page.sounding("A");
            yield* settle(500);

            const muted = (yield* page.account).recordings.find((each) => each.label === "muted");

            return muted !== undefined && !muted.paused
              ? []
              : [`the muted media was paused: ${JSON.stringify(muted)}`];
          }),
        ),
      ruleHang,
    );

    it.effect(
      "RB23: a picture graph's two category labels, each holding its control after its word in its cell, each play only at their own press, one voice with the stem",
      () =>
        holds(
          {
            graph: {
              instance: "graph",
              labels: [
                { label: "Listen to label 1", src: long("apples") },
                { label: "Listen to label 2", src: long("pears") },
              ],
              stem: { label: "Listen to the question", src: long("stem") },
            },
            items: [],
            media: [],
          },
          (page) =>
            Effect.gen(function* graphLabels() {
              yield* page.press("Listen to the question");
              yield* page.sounding("Listen to the question");
              yield* page.press("Listen to label 1");
              yield* page.sounding("Listen to label 1");
              yield* page.press("Listen to label 2");
              yield* page.sounding("Listen to label 2");
              yield* page.press("Listen to label 2");
              yield* page.sounding();
              yield* settle(800);

              const account = yield* page.account;
              const expected = "Listen to the question Listen to label 1 Listen to label 2";

              return playsIn(account) === expected ? [] : [`played ${playsIn(account)}`];
            }),
        ),
      ruleHang,
    );
  },
);
