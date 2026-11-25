/**
 * Plate's UI suite over read-aloud in headless Google Chrome: plate's own items, rendered by
 * `<Item>` and hydrated as a host hydrates them (`#specimen/ui/hydrated.ts`), the synthetic items
 * of `#specimen/ui/read-aloud-items.ts`, each opened as content the database admitted, driven as a
 * child presses and a host moves between items (`#specimen/ui/read-aloud-scenes.ts`), with
 * synthetic recordings, sine tones the harness's server answers at once, holds back until a rule
 * releases them, or refuses. Each rule logs its name as it starts, runs under `<StrictMode>` and
 * without, and also holds that no two recordings ever sounded at once and that the page reported
 * no error. Every wait ends on what is certain to come whether the page is right or broken (the
 * frames after an action and the page's next idle period, every play the page asked for settled,
 * an event of a recording the rule saw begin, the server's report that it was asked for or
 * delivered a held-back recording), never on a delay; the rule then reads the page and gives its
 * faults, so a broken page fails the rule rather than leaving it waiting. A rule whose next step
 * would rest on the page being right, a seek in a recording no press played or a press that would
 * stop what had to play, ends at its first fault.
 *
 * The rules are the product's (one voice; each control plays its own part alone and only at its
 * own press; nothing plays by itself; a press stops whatever plays; every control has a name of its
 * own), read from the page, never from plate's code:
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
 *   press, whether or not its recording has begun to sound or Chrome has asked for it, a press by
 *   the pointer as two in one task, the recording's last events a `play` and then its `pause`.
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
 *   plays it from its start, though the host had sought far into it.
 * - RB17, one place across items: a host that keeps one place and one instance while the next item's
 *   control at the same place has another recording plays nothing of the left item, and the
 *   control's press plays the next item's file.
 * - RB18, a Gap Match's label: the control a label of a Gap Match's sentence holds after its words
 *   plays its own recording at its own press, one voice with the item's other controls and another
 *   item's, and a press of a card and its placement in a gap neither start nor stop a recording.
 * - RB19, a Media interrupted: a Media that another Media's press or a read-aloud press stops
 *   mid-play keeps the one play it counted, and its own press resumes that play and spends none,
 *   under `max-plays` 1 and in loop mode alike; one stopped while it still loads, before it
 *   sounded, counted no play, so its next press plays and counts (reading 245).
 * - RB20, a refused play takes no voice: a Media's play past `max-plays`, as its native controls
 *   start it, is refused and stops nothing.
 * - RB21, the voice outlives a player's leaving: after one of two items leaves, a host's media that
 *   starts still stops the other's recording.
 * - RB22, what sounded before: a host's media playing before any player mounted is stopped by the
 *   next press; a muted looping media is no voice, never paused and never pausing.
 * - RB23, a picture graph's labels: the control each category word of a graph's table holds after the
 *   word, in its cell, plays only at its own press, one voice with the stem.
 * - RB24, a muted media heard: a muted media that plays, once unmuted or turned up as its native
 *   controls change its sound, takes the voice and stops the recording read aloud; a change that
 *   leaves it unheard, or comes while it is paused, takes nothing.
 * - RB25, a Media's own Pause while it loads: the control of a Media whose play still loads is its
 *   Pause, and its press stops that play: the media is at rest again, no play counted, it never
 *   sounds once its data arrives, and its next press plays and counts (reading 245).
 * - RB26, a page's own voice: two pages one copy of plate serves, the page and a frame it renders an
 *   item into, each have a voice of their own, held in each page, never in plate's module: a press
 *   in one stops nothing of the other's, and a host's media that starts in the frame stops the
 *   frame's recording and nothing of the page's. The frame's press is made as a script makes it, a
 *   click of the page's realm on the frame's button: UI SDK reads an event's kind by the page's own
 *   constructors, so a pointer's click of the frame's realm reads to it as one it does not list,
 *   which tells nothing of the voice.
 * - RB27, a Media that cannot play: a Media whose recording fails ends at rest, its control its Play
 *   again, nothing counted, nothing sounding, and the child is told beside the control
 *   (`mediaFailed`). The rule waits on the failure, which comes right page or broken, never on the
 *   play, which only a page that hears the failure settles.
 * - RB28, a host's play and a press in one task, as a host's script may make them: the press's
 *   recording sounds, and the host's media, which the press paused before its `play` event reached
 *   the page, takes nothing.
 * - RN1 and RN2, one name each: on a page of a picture graph's item and the passage it places last,
 *   every read-aloud control has an accessible name, as Chrome computes it, that no other control
 *   of the page shares (WCAG 2.4.6), the item's two said blocks and the passage's paragraph, the
 *   graph's labels and the passage's, three Choice interactions' questions, the first's on its root
 *   and the second's and third's on their prompts, and their choices among them; each is named by
 *   its part and its place among the page's controls of that part, once, in the order the page
 *   shows them (reading 237).
 *
 * Kills are in this suite's commit: each rule fails on a slip planted in plate that breaks it.
 *
 * @module
 */
import { assert, layer } from "@effect/vitest";
import { Context, Effect, Layer } from "effect";
import type { Recordings } from "#specimen/ui/hydrated.ts";
import { graph, line, media, passage, said } from "#specimen/ui/read-aloud-items.ts";
import type { Synthetic } from "#specimen/ui/read-aloud-items.ts";
import { readAloudPages } from "#specimen/ui/read-aloud-scenes.ts";
import type {
  Account,
  Driven,
  RuleFailure,
  SceneSpec,
  ShowSpec,
} from "#specimen/ui/read-aloud-scenes.ts";

/**
 * A recording that outlasts every rule: thirty seconds of tone.
 */
const long = 30_000;

/**
 * The names plate gives the said item's controls (`said` in `#specimen/ui/read-aloud-items.ts`).
 */
const named = {
  choice1: "Listen to choice 1",
  choice2: "Listen to choice 2",
  label1: "Listen to label 1",
  label2: "Listen to label 2",
  question1: "Listen to question 1",
  text1: "Listen to text 1",
} as const;

/**
 * Write an item a host shows: a document, its instance, and its recordings' addresses, each part
 * the rule names its own, every other part a long tone named for the instance and the part.
 *
 * @param document The document.
 * @param instance Its instance.
 * @param recordings The page's recordings.
 * @param given The addresses the rule gives, by part.
 * @returns The item.
 */
const showOf = (
  document: Synthetic,
  instance: string,
  recordings: Recordings,
  given: Readonly<Record<string, string>>,
): ShowSpec => ({
  document,
  instance,
  recordings: Object.fromEntries(
    Object.keys(document.recordings).map((part) => [
      part,
      given[part] ?? recordings.tone(`${instance}-${part}`, long),
    ]),
  ),
});

/**
 * Pages of each rule's scenes, held for the file.
 */
class Pages extends Context.Service<Pages, Effect.Success<typeof readAloudPages>>()(
  "specimen/ui/read-aloud-browser.test/Pages",
) {}

/**
 * Open {@link Pages}, closed when the file ends.
 */
const PagesLayer = Layer.effect(Pages, Effect.orDie(readAloudPages));

/**
 * Give the names of the recordings sounding now, sorted.
 *
 * @param account The page's account.
 * @returns The names.
 */
const soundingIn = (account: Account): readonly string[] =>
  account.recordings
    .filter((each) => each.sounding)
    .map((each) => each.label)
    .toSorted();

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
 * @param label The recording's name.
 * @returns Its `aria-pressed` and notice, `gone` where it is not in the page.
 */
const shownOf = (account: Account, label: string): string => {
  const shown = account.recordings.find((each) => each.label === label && !each.detached);

  return shown === undefined ? "gone" : `pressed ${shown.pressed} notice "${shown.notice}"`;
};

/**
 * Check that exactly the recordings named sound now.
 *
 * @param page The page.
 * @param step The step, for the fault.
 * @param labels The recordings' names.
 * @returns The fault, none where exactly they sound.
 */
const soundsNow = (page: Driven, step: string, ...labels: readonly string[]) =>
  page.account.pipe(
    Effect.map((account) => {
      const now = soundingIn(account);

      return now.join(" ") === labels.toSorted().join(" ")
        ? []
        : [
            `${step}: ${now.length === 0 ? "nothing" : now.join(" and ")} sounds, not ${labels.length === 0 ? "nothing" : labels.join(" and ")}`,
          ];
    }),
  );

/**
 * Give a recording's `play` and `pause` events the page saw, in order, each by its name: the
 * answers the presses of its control got.
 *
 * @param account The page's account.
 * @param label The recording's name.
 * @returns The events.
 */
const answersIn = (account: Account, label: string): readonly string[] =>
  account.seen
    .filter((each) => each.label === label && (each.event === "play" || each.event === "pause"))
    .map((each) => each.event);

/**
 * Check that a press played a recording: the last of its `play` and `pause` events is a `play`,
 * which the element fires in a task of its own after the press's `play()`, before the frames and
 * the idle period the press waits on. A rule waits on the server's report that it was asked for
 * the recording only once the page asked for it.
 *
 * @param page The page.
 * @param label The recording's name.
 * @returns The fault, none where the press played it.
 */
const playedNow = (page: Driven, label: string) =>
  page.account.pipe(
    Effect.map((account) =>
      answersIn(account, label).at(-1) === "play"
        ? []
        : [
            `the press did not play ${label}: its answers were "${answersIn(account, label).join(" ")}"`,
          ],
    ),
  );

/**
 * Check that a control shows itself as given.
 *
 * @param page The page.
 * @param label The recording's name.
 * @param shown What the control shows.
 * @returns The fault, none where it shows that.
 */
const showsNow = (page: Driven, label: string, shown: string) =>
  page.account.pipe(
    Effect.map((account) =>
      shownOf(account, label) === shown ? [] : [`${label} shows ${shownOf(account, label)}`],
    ),
  );

/**
 * Run a rule on a page of a scene, under `<StrictMode>` and without, each run logged by the rule's
 * name as it starts, and gather what went wrong: the rule's own faults, a press it could not make,
 * two recordings sounding at once, and the page's errors, and with them, where anything went wrong,
 * every event the page saw and every recording it holds, so the fault can be read.
 *
 * @param rule The rule's name.
 * @param build The scene, from the page's recordings.
 * @param check The rule, which gives its faults.
 * @returns Every fault, by mode.
 */
const inEveryMode = (
  rule: string,
  build: (recordings: Recordings) => SceneSpec,
  check: (page: Driven) => Effect.Effect<readonly string[], RuleFailure>,
) =>
  Effect.gen(function* everyMode() {
    const open = yield* Pages;
    const faults = yield* Effect.forEach([false, true], (strict) =>
      Effect.scoped(
        Effect.gen(function* oneMode() {
          const mode = strict ? "strict" : "plain";

          yield* Effect.logInfo(`read-aloud in Chrome: ${rule} starts, ${mode}`);

          const page = yield* open(build, strict);
          const own = yield* check(page);
          const ended = yield* Effect.as(page.painted, []);
          const { overlaps, recordings, seen } = yield* page.account;
          const found = [
            ...own,
            ...ended,
            ...overlaps.map((each) => `two voices at once: ${each}`),
          ];

          return [
            ...found,
            ...(found.length === 0
              ? []
              : [
                  `seen: ${seen.map((each) => `${String(each.at)} ${each.label} ${each.event}`).join(", ")}`,
                  `holds: ${JSON.stringify(recordings)}`,
                ]),
          ].map((fault) => `${mode}: ${fault}`);
        }).pipe(
          Effect.catchTags({
            DrivingFailure: (failure) =>
              Effect.succeed([`${strict ? "strict" : "plain"}: ${failure.message}`]),
            HydrationFailure: (failure) =>
              Effect.succeed([`${strict ? "strict" : "plain"}: ${failure.message}`]),
          }),
        ),
      ),
    );

    return faults.flat();
  });

/**
 * Check a rule holds: it gives no fault in either mode.
 *
 * @param rule The rule's name.
 * @param build The scene, from the page's recordings.
 * @param check The rule.
 * @returns The check.
 */
const holds = (
  rule: string,
  build: (recordings: Recordings) => SceneSpec,
  check: (page: Driven) => Effect.Effect<readonly string[], RuleFailure>,
) =>
  Effect.map(inEveryMode(rule, build, check), (faults) => {
    assert.deepStrictEqual(faults, []);
  });

/**
 * A scene of the said item alone, as `i1`, its recordings those the rule gives.
 *
 * @param given The addresses the rule gives, by part.
 * @returns The scene.
 */
const saidAlone =
  (given: (recordings: Recordings) => Readonly<Record<string, string>>) =>
  (recordings: Recordings): SceneSpec => ({
    first: ["i1"],
    shows: { i1: showOf(said, "i1", recordings, given(recordings)) },
  });

/**
 * A scene of the media item, as `m`, its recordings those the rule gives.
 *
 * @param given The addresses the rule gives, by part.
 * @returns The scene.
 */
const mediaAlone =
  (given: (recordings: Recordings) => Readonly<Record<string, string>>) =>
  (recordings: Recordings): SceneSpec => ({
    first: ["m"],
    shows: { m: showOf(media, "m", recordings, given(recordings)) },
  });

/**
 * Check the counts a Media item posts now against those a step expects.
 *
 * @param page The page.
 * @param step The step, for the fault.
 * @param expected Each Media's count, empty for NULL.
 * @returns The fault, none where the counts are those expected.
 */
const countedNow = (page: Driven, step: string, expected: Readonly<Record<string, string>>) =>
  Effect.map(page.posted("m"), (posted) =>
    JSON.stringify(posted) === JSON.stringify(expected)
      ? []
      : [`${step}: posted ${JSON.stringify(posted)}`],
  );

/**
 * Release a held-back recording and wait until the page has taken in its answer: the server's
 * delivery of it, then the recording's event that says its data came, or failed, or that its load
 * was given up, counting only events after the release; nothing more where the page let the
 * request go before the answer reached it. A rule releases every recording a broken page may still
 * wait on before it waits for every play to settle, so no wait of the rule rests on the page being
 * right.
 *
 * @param page The page.
 * @param label The recording's name.
 * @returns The wait.
 */
const released = (page: Driven, label: string) =>
  Effect.gen(function* takenIn() {
    const before = (yield* page.account).seen.filter((each) => each.label === label).length;

    yield* page.recordings.release(label);

    if (yield* page.recordings.delivered(label)) {
      yield* page.saw(label, ["canplaythrough", "error", "abort", "emptied"], before);
    }
  });

/**
 * Find a recording's element in the page by its name, as a page script.
 *
 * @param label The recording's name.
 * @returns The script's expression for it.
 */
const elementNamed = (label: string): string =>
  `[...document.querySelectorAll("audio")].find((each) => (each.getAttribute("src") ?? each.querySelector("source")?.getAttribute("src") ?? "").endsWith("/${label}.wav"))`;

layer(PagesLayer, { excludeTestServices: true })("read-aloud in Chrome", (it) => {
  it.effect("RB1: a prompt's press plays it alone, and nothing plays after it ends", () =>
    holds(
      "RB1",
      saidAlone((at) => ({
        apple: at.tone("choice2", long),
        prompt: at.tone("prompt0", 1500),
        stem: at.tone("text1", long),
      })),
      (page) =>
        Effect.gen(function* alone() {
          yield* page.press("i1", named.question1);
          yield* page.heard;

          const begun = yield* soundsNow(page, "the press", "prompt0");

          if (begun.length > 0) {
            return begun;
          }

          yield* page.saw("prompt0", ["ended", "pause"], 0);
          yield* page.heard;

          const account = yield* page.account;

          return [
            ...(playsIn(account) === "prompt0" ? [] : [`played ${playsIn(account)}`]),
            ...(yield* soundsNow(page, "after its end")),
          ];
        }),
    ),
  );

  it.effect(
    "RB2: a press of another control stops the first, and a press of the control playing stops it",
    () =>
      holds(
        "RB2",
        saidAlone((at) => ({ apple: at.tone("choice2", long), stem: at.tone("text1", long) })),
        (page) =>
          Effect.gen(function* oneAtATime() {
            yield* page.press("i1", named.text1);
            yield* page.heard;

            const first = yield* soundsNow(page, "text1 pressed", "text1");

            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const second = yield* soundsNow(page, "choice2 pressed", "choice2");

            yield* page.press("i1", named.choice1);
            yield* page.heard;

            return [
              ...first,
              ...second,
              ...(yield* soundsNow(page, "choice2 pressed again")),
              ...(yield* showsNow(page, "choice2", `pressed false notice ""`)),
            ];
          }),
      ),
  );

  it.effect("RB3: a press in one item stops the recording another item plays", () =>
    holds(
      "RB3",
      (at) => ({
        first: ["i1", "i2"],
        shows: {
          i1: showOf(said, "i1", at, { apple: at.tone("a1", long) }),
          i2: showOf(said, "i2", at, { apple: at.tone("c2", long) }),
        },
      }),
      (page) =>
        Effect.gen(function* acrossItems() {
          const faults: (readonly string[])[] = [];

          for (const [show, label] of [
            ["i1", "a1"],
            ["i2", "c2"],
            ["i1", "a1"],
          ] as const) {
            yield* page.press(show, named.choice1);
            yield* page.heard;
            faults.push(yield* soundsNow(page, `${show} pressed`, label));
          }

          return faults.flat();
        }),
    ),
  );

  it.effect(
    "RB4: once the host moves to the next item, one naming the same file included, nothing plays",
    () =>
      holds(
        "RB4",
        (at) => ({
          first: ["i1"],
          shows: {
            i1: showOf(said, "i1", at, { apple: at.tone("same", long) }),
            i2: showOf(said, "i2", at, { apple: at.tone("same", long) }),
          },
        }),
        (page) =>
          Effect.gen(function* leaving() {
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const begun = yield* soundsNow(page, "the press", "same");

            yield* page.scene([{ key: "i2" }]);
            yield* page.heard;

            const account = yield* page.account;

            return [
              ...begun,
              ...(playsIn(account) === "same" ? [] : [`played ${playsIn(account)}`]),
              ...(yield* soundsNow(page, "after the move")),
            ];
          }),
      ),
  );

  it.effect(
    "RB5: a control unmounted while its recording loads never sounds once its data arrives",
    () =>
      holds(
        "RB5",
        saidAlone((at) => ({ apple: at.held("p", long) })),
        (page) =>
          Effect.gen(function* leavingPending() {
            yield* page.press("i1", named.choice1);

            const asked = yield* playedNow(page, "p");

            if (asked.length > 0) {
              return asked;
            }

            yield* page.recordings.requested("p");
            yield* page.scene([]);
            yield* released(page, "p");
            yield* page.heard;

            return sounded(yield* page.account, "p") ? ["p sounded after its control left"] : [];
          }),
      ),
  );

  it.effect(
    "RB6 and RB7: a press while another's play is pending, in its item or another, leaves the pending recording silent and tells nothing",
    () =>
      Effect.forEach(
        [
          (at: Recordings): SceneSpec => ({
            first: ["i1"],
            shows: {
              i1: showOf(said, "i1", at, { apple: at.held("a", long), pear: at.tone("b", long) }),
            },
          }),
          (at: Recordings): SceneSpec => ({
            first: ["i1", "i2"],
            shows: {
              i1: showOf(said, "i1", at, { apple: at.held("a", long) }),
              i2: showOf(said, "i2", at, { pear: at.tone("b", long) }),
            },
          }),
        ],
        (scene, index) =>
          holds(index === 0 ? "RB6" : "RB7", scene, (page) =>
            Effect.gen(function* overtaken() {
              yield* page.press("i1", named.choice1);

              const asked = yield* playedNow(page, "a");

              if (asked.length > 0) {
                return asked;
              }

              yield* page.recordings.requested("a");
              yield* page.press(index === 0 ? "i1" : "i2", named.choice2);
              yield* released(page, "a");
              yield* page.heard;

              const account = yield* page.account;

              return [
                ...(sounded(account, "a") ? ["a sounded"] : []),
                ...(yield* soundsNow(page, "a's data arrived", "b")),
                ...(yield* showsNow(page, "a", `pressed false notice ""`)),
                ...(yield* showsNow(page, "b", `pressed true notice ""`)),
              ];
            }),
          ),
        { discard: true },
      ),
  );

  it.effect(
    "RB8: a second press of a control whose recording is still loading stops it, by the pointer and in the press's own task",
    () =>
      Effect.forEach(
        [
          (page: Driven) =>
            Effect.andThen(page.press("i1", named.choice1), page.press("i1", named.choice1)),
          (page: Driven) =>
            page.pressTogether([
              ["i1", named.choice1],
              ["i1", named.choice1],
            ]),
        ],
        (twice, index) =>
          holds(
            index === 0 ? "RB8, by the pointer" : "RB8, in one task",
            saidAlone((at) => ({ apple: at.held("a", long) })),
            (page) =>
              Effect.gen(function* stoppedPending() {
                yield* twice(page);
                yield* page.recordings.release("a");
                yield* page.heard;

                const account = yield* page.account;
                const answers = answersIn(account, "a").join(" ");

                return [
                  ...(answers.endsWith("play pause")
                    ? []
                    : [`the presses' answers were "${answers}", not a play and then its stop`]),
                  ...(sounded(account, "a") ? ["a sounded after its second press"] : []),
                  ...(yield* showsNow(page, "a", `pressed false notice ""`)),
                ];
              }),
          ),
        { discard: true },
      ),
  );

  it.effect(
    "RB9: a recording that fails after another control was pressed leaves that one playing and tells nothing",
    () =>
      holds(
        "RB9",
        saidAlone((at) => ({ apple: at.refused("broken"), pear: at.tone("b", long) })),
        (page) =>
          Effect.gen(function* lateFailure() {
            yield* page.press("i1", named.choice1);

            const asked = yield* playedNow(page, "broken");

            if (asked.length > 0) {
              return asked;
            }

            yield* page.recordings.requested("broken");
            yield* page.press("i1", named.choice2);
            yield* released(page, "broken");
            yield* page.heard;

            const account = yield* page.account;

            return [
              ...(yield* soundsNow(page, "broken failed", "b")),
              ...account.recordings
                .filter((each) => each.notice !== "")
                .map((each) => `${each.label} tells ${each.notice}`),
            ];
          }),
      ),
  );

  it.effect(
    "RB10: a control hidden while it plays falls silent, shows itself unpressed when shown again, and its next press plays it",
    () =>
      holds(
        "RB10",
        saidAlone((at) => ({ apple: at.tone("a", long) })),
        (page) =>
          Effect.gen(function* hidden() {
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "a pressed", "a");

            yield* page.scene([{ hidden: true, key: "i1" }]);

            const hid = yield* soundsNow(page, "hidden");

            yield* page.scene([{ key: "i1" }]);

            const shown = [
              ...(yield* soundsNow(page, "shown again")),
              ...(yield* showsNow(page, "a", `pressed false notice ""`)),
            ];

            yield* page.press("i1", named.choice1);
            yield* page.heard;

            return [
              ...pressed,
              ...hid,
              ...shown,
              ...(yield* soundsNow(page, "pressed again", "a")),
            ];
          }),
      ),
  );

  it.effect("RB11: rapid presses across items keep one voice, the last press's", () =>
    holds(
      "RB11",
      (at) => ({
        first: ["i1", "i2"],
        shows: {
          i1: showOf(said, "i1", at, { apple: at.tone("a", long), pear: at.tone("b", long) }),
          i2: showOf(said, "i2", at, { apple: at.tone("c", long) }),
        },
      }),
      (page) =>
        Effect.gen(function* rapid() {
          for (const [show, name] of [
            ["i1", named.choice1],
            ["i1", named.choice2],
            ["i2", named.choice1],
            ["i1", named.choice1],
            ["i1", named.choice2],
            ["i2", named.choice1],
            ["i1", named.choice2],
          ] as const) {
            yield* page.press(show, name);
          }

          yield* page.heard;

          return yield* soundsNow(page, "the last press", "b");
        }),
    ),
  );

  it.effect(
    "RB12 and RB14: two presses in one task, across items and in one item, leave the last one sounding",
    () =>
      Effect.forEach(
        [
          {
            rule: "RB12",
            scene: (at: Recordings): SceneSpec => ({
              first: ["i1", "i2"],
              shows: {
                i1: showOf(said, "i1", at, { apple: at.tone("a", long) }),
                i2: showOf(said, "i2", at, { apple: at.tone("b", long) }),
              },
            }),
            targets: [
              ["i1", named.choice1],
              ["i2", named.choice1],
            ] as const,
          },
          {
            rule: "RB14",
            scene: saidAlone((at) => ({ apple: at.tone("a", long), pear: at.tone("b", long) })),
            targets: [
              ["i1", named.choice1],
              ["i1", named.choice2],
            ] as const,
          },
        ],
        ({ rule, scene, targets }) =>
          holds(rule, scene, (page) =>
            Effect.gen(function* together() {
              yield* page.pressTogether(targets);
              yield* page.heard;

              return yield* soundsNow(page, "two presses in one task", "b");
            }),
          ),
        { discard: true },
      ),
  );

  it.effect(
    "RB13: the old item hidden while the next names the same file is silent, and the next item's control plays alone",
    () =>
      holds(
        "RB13",
        (at) => ({
          first: ["i1"],
          shows: {
            i1: showOf(said, "i1", at, { apple: at.tone("same", long) }),
            i2: showOf(said, "i2", at, { apple: at.tone("same", long) }),
          },
        }),
        (page) =>
          Effect.gen(function* hiddenBehind() {
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "i1 pressed", "same");

            yield* page.scene([{ hidden: true, key: "i1" }, { key: "i2" }]);

            const moved = yield* soundsNow(page, "moved on");

            yield* page.press("i2", named.choice1);
            yield* page.heard;

            return [...pressed, ...moved, ...(yield* soundsNow(page, "i2 pressed", "same"))];
          }),
      ),
  );

  it.effect(
    "RB15: a read-aloud press stops a Media and the host's media playing, and a Media's press stops read-aloud",
    () =>
      holds(
        "RB15",
        mediaAlone((at) => ({ m1: at.tone("media", long), stem: at.tone("a", long) })),
        (page) =>
          Effect.gen(function* withMedia() {
            const faults: (readonly string[])[] = [];

            yield* page.pressMedia("m", 0);
            yield* page.heard;
            faults.push(yield* soundsNow(page, "the Media pressed", "media"));
            yield* page.press("m", named.text1);
            yield* page.heard;
            faults.push(yield* soundsNow(page, "read-aloud pressed", "a"));
            yield* page.pressMedia("m", 0);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "the Media pressed again", "media"),
              yield* showsNow(page, "a", `pressed false notice ""`),
            );
            yield* page.foreign(page.recordings.tone("host", long), false, "");
            faults.push(yield* soundsNow(page, "the host's media", "host"));
            yield* page.press("m", named.text1);
            yield* page.heard;
            faults.push(yield* soundsNow(page, "read-aloud pressed again", "a"));

            return faults.flat();
          }),
      ),
  );

  it.effect(
    "RB16: after the host stops every recording, the control shows itself unpressed and its next press plays it from its start",
    () =>
      holds(
        "RB16",
        saidAlone((at) => ({ apple: at.tone("a", long) })),
        (page) =>
          Effect.gen(function* stopAll() {
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "a pressed", "a");

            if (pressed.length > 0) {
              return pressed;
            }

            yield* page.inPage(
              `new Promise((resolve) => { const element = ${elementNamed("a")}; element.addEventListener("seeked", () => { resolve(undefined); }, { once: true }); element.currentTime = 10; })`,
            );
            yield* page.inPage(
              `for (const each of document.querySelectorAll("audio")) each.pause();`,
            );

            const stopped = [
              ...(yield* soundsNow(page, "the host stopped every recording")),
              ...(yield* showsNow(page, "a", `pressed false notice ""`)),
            ];

            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const again = (yield* page.account).recordings.find((each) => each.label === "a");

            return [
              ...stopped,
              ...(yield* soundsNow(page, "a pressed again", "a")),
              ...(again !== undefined && again.time < 1.5
                ? []
                : [`a did not start again from its start: ${String(again?.time)}`]),
            ];
          }),
      ),
  );

  it.effect(
    "RB17: a host that keeps one place across items plays nothing of the left item, and the next control's press plays its own file",
    () =>
      holds(
        "RB17",
        (at) => ({
          first: ["left"],
          shows: {
            left: showOf(said, "kept", at, { apple: at.tone("left", long) }),
            next: showOf(said, "kept", at, { apple: at.tone("next", long) }),
          },
        }),
        (page) =>
          Effect.gen(function* keptPlace() {
            yield* page.press("left", named.choice1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "left pressed", "left");

            yield* page.scene([{ key: "next", slot: "left" }]);

            const moved = yield* soundsNow(page, "moved on");

            yield* page.press("next", named.choice1);
            yield* page.heard;

            return [...pressed, ...moved, ...(yield* soundsNow(page, "next pressed", "next"))];
          }),
      ),
  );

  it.effect(
    "RB18: a Gap Match's label control plays its own recording at its own press, one voice with the item's other label and another item's control, and a card's press and placement start and stop nothing",
    () =>
      holds(
        "RB18",
        (at) => ({
          first: ["gm", "i1"],
          shows: {
            gm: showOf(line, "gm", at, {
              greatest: at.tone("greatest", long),
              least: at.tone("least", long),
            }),
            i1: showOf(said, "i1", at, { stem: at.tone("stem", long) }),
          },
        }),
        (page) =>
          Effect.gen(function* gapMatchLabel() {
            const faults: (readonly string[])[] = [];

            for (const [show, name, label] of [
              ["gm", named.label1, "least"],
              ["gm", named.label2, "greatest"],
              ["i1", named.text1, "stem"],
              ["gm", named.label2, "greatest"],
            ] as const) {
              yield* page.press(show, name);
              yield* page.heard;
              faults.push(yield* soundsNow(page, `${name} in ${show} pressed`, label));
            }

            yield* page.inPage(
              `[...document.querySelectorAll('section[data-show="gm"] [data-slot=plate-placement-bank] button')].find((each) => each.textContent?.includes("3"))?.click()`,
            );
            yield* page.inPage(
              `document.querySelector('section[data-show="gm"] [data-slot=plate-gap] [data-slot=plate-placement-target]')?.click()`,
            );
            yield* page.heard;

            const placed = yield* page.textOf('section[data-show="gm"] [data-slot=plate-gap]');
            const account = yield* page.account;

            return [
              ...faults.flat(),
              ...(yield* soundsNow(page, "a card placed", "greatest")),
              ...(placed.includes("3") ? [] : [`the gap holds "${placed}", not the card 3`]),
              ...(playsIn(account) === "least greatest stem greatest"
                ? []
                : [`played ${playsIn(account)}`]),
            ];
          }),
      ),
  );

  it.effect(
    "RB19: a Media interaction another Media or a read-aloud press stops mid-play keeps its one counted play, and its press resumes that play, spending none, under max-plays 1 and in loop mode alike; one stopped before it sounded counted no play",
    () =>
      holds(
        "RB19",
        mediaAlone((at) => ({
          m1: at.tone("m1", long),
          m2: at.tone("m2", long),
          m3: at.held("m3", long),
          stem: at.tone("a", long),
        })),
        (page) =>
          Effect.gen(function* interrupted() {
            const faults: (readonly string[])[] = [];

            yield* page.pressMedia("m", 0);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "M1 pressed", "m1"),
              yield* countedNow(page, "M1 plays", { M1: "1", M2: "", M3: "" }),
            );
            yield* page.pressMedia("m", 1);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "M2 pressed", "m2"),
              yield* countedNow(page, "M2 stops M1 mid-play", { M1: "1", M2: "1", M3: "" }),
            );

            const stopped = (yield* page.account).recordings.find((each) => each.label === "m1");

            yield* page.pressMedia("m", 0);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "M1 pressed again", "m1"),
              yield* countedNow(page, "M1 resumed under max-plays 1", {
                M1: "1",
                M2: "1",
                M3: "",
              }),
            );

            const resumed = (yield* page.account).recordings.find((each) => each.label === "m1");

            yield* page.press("m", named.text1);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "read-aloud pressed", "a"),
              yield* countedNow(page, "a read-aloud press stops M1", {
                M1: "1",
                M2: "1",
                M3: "",
              }),
            );
            yield* page.pressMedia("m", 1);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "M2 pressed again", "m2"),
              yield* countedNow(page, "M2 resumed in loop mode", { M1: "1", M2: "1", M3: "" }),
            );
            yield* page.pressMedia("m", 2);

            const asked = yield* playedNow(page, "m3");

            if (asked.length > 0) {
              return [...faults.flat(), ...asked];
            }

            yield* page.recordings.requested("m3");
            yield* page.press("m", named.text1);
            yield* released(page, "m3");
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "read-aloud pressed over M3", "a"),
              yield* countedNow(page, "M3 paused before it sounded", {
                M1: "1",
                M2: "1",
                M3: "",
              }),
            );
            yield* page.pressMedia("m", 2);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "M3 pressed again", "m3"),
              yield* countedNow(page, "M3 plays and counts", { M1: "1", M2: "1", M3: "1" }),
            );

            return [
              ...faults.flat(),
              ...(stopped !== undefined && stopped.paused && !stopped.ended && stopped.time > 0
                ? []
                : [`M1 was not paused mid-play by M2: ${JSON.stringify(stopped)}`]),
              ...(resumed !== undefined && stopped !== undefined && resumed.time >= stopped.time
                ? []
                : [`M1 did not resume where it stopped: ${JSON.stringify([stopped, resumed])}`]),
            ];
          }),
      ),
  );

  it.effect(
    "RB20: a Media's play refused past max-plays takes no voice: the recording read aloud plays on",
    () =>
      holds(
        "RB20",
        mediaAlone((at) => ({ m1: at.tone("short", 1500), stem: at.tone("a", long) })),
        (page) =>
          Effect.gen(function* refusedPlay() {
            yield* page.pressMedia("m", 0);
            yield* page.heard;

            const begun = yield* soundsNow(page, "M1 pressed", "short");

            if (begun.length > 0) {
              return begun;
            }

            yield* page.saw("short", ["ended", "pause"], 0);
            yield* page.press("m", named.text1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "read-aloud pressed", "a");

            yield* page.inPage(`${elementNamed("short")}?.play().catch(() => undefined)`);
            yield* page.heard;

            return [
              ...pressed,
              ...(yield* soundsNow(page, "the refusal", "a")),
              ...(yield* countedNow(page, "the refusal", { M1: "1", M2: "", M3: "" })),
            ];
          }),
      ),
  );

  it.effect(
    "RB21: after one of two items leaves, a host's media that starts still stops the other's recording",
    () =>
      holds(
        "RB21",
        (at) => ({
          first: ["i1", "i2"],
          shows: {
            i1: showOf(said, "i1", at, { apple: at.tone("a", long) }),
            i2: showOf(said, "i2", at, { apple: at.tone("b", long) }),
          },
        }),
        (page) =>
          Effect.gen(function* oneLeft() {
            yield* page.scene([{ key: "i1" }]);
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "a pressed", "a");

            yield* page.foreign(page.recordings.tone("host", long), false, "");

            return [...pressed, ...(yield* soundsNow(page, "the host's media", "host"))];
          }),
      ),
  );

  it.effect(
    "RB22: a host's media already playing before any player mounted is stopped by the next press, and a muted looping media neither takes the voice nor loses it",
    () =>
      holds(
        "RB22",
        (at) => ({
          first: [],
          shows: { i1: showOf(said, "i1", at, { apple: at.tone("a", long) }) },
        }),
        (page) =>
          Effect.gen(function* alreadyPlaying() {
            yield* page.foreign(page.recordings.tone("host", long), false, "");
            yield* page.foreign(page.recordings.tone("deco", long), true, "");

            const before = yield* soundsNow(page, "before any player", "host");

            yield* page.scene([{ key: "i1" }]);
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const muted = (yield* page.account).recordings.find((each) => each.label === "deco");

            return [
              ...before,
              ...(yield* soundsNow(page, "a pressed", "a")),
              ...(muted !== undefined && !muted.paused
                ? []
                : [`the muted media was paused: ${JSON.stringify(muted)}`]),
            ];
          }),
      ),
  );

  it.effect(
    "RB23: a picture graph's two category labels, each holding its control after its word in its cell, each play only at their own press, one voice with the stem",
    () =>
      holds(
        "RB23",
        (at) => ({
          first: ["g"],
          shows: {
            g: {
              ...showOf(graph, "g", at, {
                apples: at.tone("apples", long),
                pears: at.tone("pears", long),
                stem: at.tone("stem", long),
              }),
              stimuli: [{ document: passage, recordings: showOf(passage, "p", at, {}).recordings }],
            },
          },
        }),
        (page) =>
          Effect.gen(function* graphLabels() {
            const faults: (readonly string[])[] = [];

            for (const [name, label] of [
              [named.text1, "stem"],
              [named.label1, "apples"],
              [named.label2, "pears"],
            ] as const) {
              yield* page.press("g", name);
              yield* page.heard;
              faults.push(yield* soundsNow(page, `${name} pressed`, label));
            }

            yield* page.press("g", named.label2);
            yield* page.heard;

            const account = yield* page.account;

            return [
              ...faults.flat(),
              ...(yield* soundsNow(page, "Listen to label 2 pressed again")),
              ...(playsIn(account) === "stem apples pears" ? [] : [`played ${playsIn(account)}`]),
            ];
          }),
      ),
  );

  it.effect(
    "RB24: a muted media that plays takes the voice once it is heard, unmuted or turned up, and stops the recording read aloud; a change that leaves it unheard, or comes while it is paused, takes nothing",
    () =>
      holds(
        "RB24",
        saidAlone((at) => ({ apple: at.tone("a", long) })),
        (page) =>
          Effect.gen(function* turnedUp() {
            const faults: (readonly string[])[] = [];
            const change = (script: string) =>
              page.inPage(
                `new Promise((resolve) => { const deco = ${elementNamed("deco")}; deco.addEventListener("volumechange", () => { setTimeout(resolve, 0); }, { once: true }); ${script} })`,
              );
            const holdsPaused = (step: string, label: string, paused: boolean) =>
              page.account.pipe(
                Effect.map(({ recordings }) => {
                  const found = recordings.find((each) => each.label === label)?.paused;

                  return found === paused ? [] : [`${step}: ${label} paused ${String(found)}`];
                }),
              );

            yield* page.press("i1", named.choice1);
            yield* page.heard;
            faults.push(yield* soundsNow(page, "a pressed", "a"));
            yield* page.foreign(page.recordings.tone("deco", long), true, "");
            yield* change("deco.volume = 0;");
            yield* change("deco.muted = false;");
            faults.push(yield* holdsPaused("unmuted at volume 0", "a", false));
            yield* change("deco.volume = 1;");
            faults.push(
              yield* holdsPaused("turned up", "a", true),
              yield* holdsPaused("turned up", "deco", false),
            );

            if (faults.flat().length > 0) {
              return faults.flat();
            }

            yield* page.press("i1", named.choice1);
            yield* page.heard;
            faults.push(yield* soundsNow(page, "a pressed again", "a"));
            yield* change("deco.volume = 0.5;");
            faults.push(yield* holdsPaused("turned while paused", "a", false));
            yield* change("deco.muted = true;");
            yield* page.inPage(`${elementNamed("deco")}.play()`);
            faults.push(yield* holdsPaused("played muted", "a", false));
            yield* change("deco.muted = false;");
            faults.push(yield* holdsPaused("unmuted", "a", true));

            return faults.flat();
          }),
      ),
  );

  it.effect(
    "RB25: a Media's own Pause stops a play that still loads: the media is at rest again, no play counted, it never sounds once its data arrives, and its next press plays and counts",
    () =>
      holds(
        "RB25",
        mediaAlone((at) => ({ m3: at.held("m3", long) })),
        (page) =>
          Effect.gen(function* pausedLoading() {
            yield* page.pressMedia("m", 2);

            const asked = yield* playedNow(page, "m3");

            if (asked.length > 0) {
              return asked;
            }

            yield* page.recordings.requested("m3");

            const loading = yield* page.mediaControlText("m", 2);

            yield* page.pressMedia("m", 2);

            const paused = (yield* page.account).recordings.find((each) => each.label === "m3");

            yield* released(page, "m3");
            yield* page.heard;

            const account = yield* page.account;
            const counted = yield* countedNow(page, "paused while it loaded", {
              M1: "",
              M2: "",
              M3: "",
            });

            yield* page.pressMedia("m", 2);
            yield* page.heard;

            return [
              ...(loading.startsWith("Pause")
                ? []
                : [`the control showed "${loading}" while the play loaded`]),
              ...(paused?.paused === true
                ? []
                : [`the Pause left m3 playing: ${JSON.stringify(paused)}`]),
              ...(sounded(account, "m3") ? ["m3 sounded once its data arrived"] : []),
              ...counted,
              ...(yield* soundsNow(page, "pressed again", "m3")),
              ...(yield* countedNow(page, "pressed again", { M1: "", M2: "", M3: "1" })),
            ];
          }),
      ),
  );

  it.effect(
    "RB26: two pages one copy of plate serves, the page and a frame it renders an item into, each have a voice of their own: a press in one stops nothing of the other's, and a host's media that starts in the frame stops the frame's recording alone",
    () =>
      holds(
        "RB26",
        (at) => ({
          first: ["i1"],
          shows: {
            i1: showOf(said, "i1", at, { apple: at.tone("a", long) }),
            i2: showOf(said, "i2", at, { apple: at.tone("b", long) }),
          },
        }),
        (page) =>
          Effect.gen(function* twoPages() {
            yield* page.scene([{ key: "i1" }, { frame: true, key: "i2" }]);
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const inPage = yield* soundsNow(page, "a pressed in the page", "a");

            yield* page.inPage(
              `[...(document.querySelector('iframe[data-frame="i2"]')?.contentDocument?.querySelectorAll('section[data-show="i2"] button') ?? [])].find((each) => each.textContent === ${JSON.stringify(named.choice1)})?.dispatchEvent(new PointerEvent("click", { bubbles: true, cancelable: true, composed: true }))`,
            );
            yield* page.heard;

            const inFrame = yield* soundsNow(page, "b pressed in the frame", "a", "b");

            yield* page.foreign(page.recordings.tone("host", long), false, "i2");

            return [
              ...inPage,
              ...inFrame,
              ...(yield* soundsNow(page, "the host's media in the frame", "a", "host")),
            ];
          }),
      ),
  );

  it.effect(
    "RB27: a Media whose recording cannot play ends at rest, its control its Play again, nothing counted or sounding, and the child is told beside the control",
    () =>
      holds(
        "RB27",
        mediaAlone((at) => ({ m1: at.refused("broken") })),
        (page) =>
          Effect.gen(function* failedMedia() {
            yield* page.pressMedia("m", 0);

            const asked = yield* playedNow(page, "broken");

            if (asked.length > 0) {
              return asked;
            }

            yield* page.recordings.requested("broken");
            yield* released(page, "broken");
            yield* page.painted;

            const control = yield* page.mediaControlText("m", 0);
            const told = yield* page.textOf(
              'section[data-show="m"] [data-slot=plate-media-failed]',
            );

            return [
              ...(control.startsWith("Play")
                ? []
                : [`the control shows "${control}" once the media failed`]),
              ...(told.startsWith("This audio is unavailable")
                ? []
                : [`the child was told "${told}" once the media failed`]),
              ...(yield* soundsNow(page, "the media failed")),
              ...(yield* countedNow(page, "the media failed", { M1: "", M2: "", M3: "" })),
            ];
          }),
      ),
  );

  it.effect(
    "RB28: a host's play() and a read-aloud press in one task leave the press's recording sounding, and the host's media, paused by the press before its play event reached the page, takes nothing",
    () =>
      holds(
        "RB28",
        saidAlone((at) => ({ apple: at.tone("a", long) })),
        (page) =>
          Effect.gen(function* playAndPress() {
            yield* page.inPage(
              `(() => { const host = document.createElement("audio"); host.src = ${JSON.stringify(page.recordings.tone("host", long))}; document.body.append(host); void host.play().catch(() => undefined); [...document.querySelectorAll('section[data-show="i1"] button')].find((each) => each.textContent === ${JSON.stringify(named.choice1)})?.click(); })()`,
            );
            yield* page.heard;

            const host = (yield* page.account).recordings.find((each) => each.label === "host");

            return [
              ...(yield* soundsNow(page, "the press after the host's play", "a")),
              ...(host?.paused === true
                ? []
                : [`the host's media was not paused: ${JSON.stringify(host)}`]),
            ];
          }),
      ),
  );

  it.effect(
    "RN1 and RN2: every read-aloud control of a picture graph's page has a name of its own, by its part and its place among the page's controls of that part, in the order the page shows them",
    () =>
      holds(
        "RN1 and RN2",
        (at) => ({
          first: ["g"],
          shows: {
            g: {
              ...showOf(graph, "g", at, {}),
              stimuli: [{ document: passage, recordings: showOf(passage, "p", at, {}).recordings }],
            },
          },
        }),
        (page) =>
          Effect.gen(function* oneNameEach() {
            const tree = yield* page.ariaTree;
            const names = tree.split("\n").flatMap((node) => {
              const [, name] = node.trim().split('"');

              return node.trim().startsWith('- button "Listen') && name !== undefined ? [name] : [];
            });
            const expected = [
              "Listen to text 1",
              "Listen to text 2",
              "Listen to label 1",
              "Listen to label 2",
              "Listen to question 1",
              "Listen to choice 1",
              "Listen to choice 2",
              "Listen to question 2",
              "Listen to choice 3",
              "Listen to choice 4",
              "Listen to question 3",
              "Listen to choice 5",
              "Listen to choice 6",
              "Listen to text 3",
              "Listen to label 3",
            ];
            const shared = names.filter((name, index) => names.indexOf(name) !== index);

            return [
              ...(shared.length === 0 ? [] : [`RN1: shared names ${shared.join(", ")}`]),
              ...(names.join(" | ") === expected.join(" | ")
                ? []
                : [`RN2: the controls are named ${names.join(" | ")}`]),
            ];
          }),
      ),
  );
});
