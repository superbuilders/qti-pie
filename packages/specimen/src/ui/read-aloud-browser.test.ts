/**
 * Plate's UI suite over read-aloud in headless Google Chrome: plate's own items, rendered by
 * `<Item>` and hydrated as a host hydrates them (`#specimen/ui/hydrated.ts`), the synthetic items
 * of `#specimen/ui/read-aloud-items.ts`, each opened as content the database admitted, driven as a
 * child presses and a host moves between items (`#specimen/ui/read-aloud-scenes.ts`), with
 * synthetic recordings, sine tones the harness's server answers at once, holds back until a rule
 * releases them, or refuses, nearly every one a tone that never ends. Each rule logs its name as it
 * starts, runs under `<StrictMode>` and without, and also holds that no two recordings ever sounded
 * at once and that the page reported no error. Every wait ends on what is certain to come whether
 * the page is right or broken (the frames after an action and the page's next idle period, every
 * play the page asked for settled, an event of a recording the rule saw begin, the server's report
 * that it was asked for a held-back recording or began to deliver it), never on a delay; the rule
 * then reads the page and gives its faults, so a broken page fails the rule rather than leaving it
 * waiting. A rule whose next step would rest on the page being right, a seek in a recording no
 * press played or a press that would stop what had to play, ends at its first fault.
 *
 * Whether a recording sounds is read at a moment only of one that never ends ({@link soundsNow},
 * which takes no other's name, {@link Endless}): it sounds from its `playing` until the page stops
 * it, so what a rule reads is the page's doing, however long the machine took to get there. A
 * recording that ends ({@link Finite}), a prompt's or a Media's tone whose end a rule waits on, may
 * have played to its end before the rule reads the page, however soon after its press, so it is
 * read by its events alone: its press began it alone where its `playing` came after the press and
 * nothing else sounds ({@link beganAlone}), and it ended at its `ended` or its `pause`. Every read
 * of the page's account refuses an endless recording the page knows an end of, so no reading of an
 * endless recording's state rests on its length. A position a rule compares is one an event read,
 * never one read later. And every rule races Chrome's own report of a request of one recording past
 * the connections it opens to its host, so a seventh stream, whoever made it, fails the rule by
 * name rather than leave a wait on it waiting.
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
import { endlessName, finiteName } from "#specimen/ui/hydrated.ts";
import type { Endless, Finite, Recordings } from "#specimen/ui/hydrated.ts";
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
 * The recordings the rules name, each named once, by a key of its own, so a name is one kind of
 * recording throughout the file: every one never ends ({@link endlessName}), so a rule may read at
 * any moment whether it sounds, but the three whose events alone tell what they did
 * ({@link finiteName}): the prompt and the Media's tone whose ends RB1 and RB20 wait on, and the
 * recording the server refuses in RB9 and RB27.
 */
const recording = {
  a: endlessName("a"),
  a1: endlessName("a1"),
  apples: endlessName("apples"),
  b: endlessName("b"),
  broken: finiteName("broken"),
  c: endlessName("c"),
  c2: endlessName("c2"),
  choice2: endlessName("choice2"),
  deco: endlessName("deco"),
  greatest: endlessName("greatest"),
  host: endlessName("host"),
  least: endlessName("least"),
  left: endlessName("left"),
  m1: endlessName("m1"),
  m2: endlessName("m2"),
  m3: endlessName("m3"),
  media: endlessName("media"),
  next: endlessName("next"),
  p: endlessName("p"),
  pears: endlessName("pears"),
  prompt0: finiteName("prompt0"),
  same: endlessName("same"),
  short: finiteName("short"),
  stem: endlessName("stem"),
  text1: endlessName("text1"),
} as const;

/**
 * The length of a recording that ends, in milliseconds: any length serves, since a rule reads such
 * a recording by its events alone, never at a moment.
 */
const finiteLength = 1500;

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
 * the rule names its own, every other part a tone that never ends named for the instance and the
 * part.
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
      given[part] ?? recordings.endless(endlessName(`${instance}-${part}`)),
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
 * Check that exactly the recordings named sound now: each one that never ends ({@link Endless}),
 * so whether it sounds at this moment is the page's doing alone, never its own end's, as the
 * page's account, which refuses an endless recording the page knows an end of, holds. A recording
 * that ends is no recording this check takes: {@link beganAlone} and its events read it.
 *
 * @param page The page.
 * @param step The step, for the fault.
 * @param labels The recordings' names.
 * @returns The fault, none where exactly they sound.
 */
const soundsNow = (page: Driven, step: string, ...labels: readonly Endless[]) =>
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
 * Count the events of a recording the page saw.
 *
 * @param account The page's account.
 * @param label The recording's name.
 * @returns How many.
 */
const eventsOf = (account: Account, label: string): number =>
  account.seen.filter((each) => each.label === label).length;

/**
 * The events by which a press plays a recording from a place: its `play`, where it stood at rest;
 * its `seeked`, where the press took a recording already sounding back to a place, which fires no
 * `play`; its `playing`, where it sounded with neither.
 */
const playedAt: ReadonlySet<string> = new Set(["play", "playing", "seeked"]);

/**
 * Give the position a press played a recording from: its position as the first of its
 * {@link playedAt} events after the events of it passed over reached the page, the place the press
 * set it to play from, never one read once the recording has played on.
 *
 * @param account The page's account.
 * @param label The recording's name.
 * @param after How many of its events came before the press.
 * @returns The position, in seconds, none where the press neither played, sought nor sounded it.
 */
const playedFrom = (account: Account, label: string, after: number): number | undefined =>
  account.seen
    .filter((each) => each.label === label)
    .slice(after)
    .find((each) => playedAt.has(each.event))?.time;

/**
 * Check the position a press played a recording from ({@link playedFrom}) against the place the
 * step asks for.
 *
 * @param step The step, for the fault.
 * @param label The recording's name.
 * @param from The position, none where the press neither played, sought nor sounded it.
 * @param right Whether a position is the one the step asks for.
 * @param wrong The fault where it is not.
 * @returns The fault, none where the press played it from where the step asks.
 */
const playedFromFaults = (
  step: string,
  label: string,
  from: number | undefined,
  right: (at: number) => boolean,
  wrong: (at: number) => string,
): readonly string[] => {
  if (from === undefined) {
    return [`${step}: the press neither played, sought nor sounded ${label}`];
  }

  return right(from) ? [] : [wrong(from)];
};

/**
 * Check that a press began a recording that ends, alone: its `playing` came after the events of
 * it passed over, and nothing else sounds now. Whether it sounds itself is no fact of a moment,
 * since it may have played to its end by the time the rule reads the page, however soon after the
 * press; its end is its `ended` or its `pause`, which a rule waits on.
 *
 * @param page The page.
 * @param step The step, for the fault.
 * @param label The recording's name.
 * @param after How many of its events came before the press.
 * @returns The fault, none where the press began it alone.
 */
const beganAlone = (page: Driven, step: string, label: Finite, after: number) =>
  page.account.pipe(
    Effect.map((account) => {
      const others = soundingIn(account).filter((each) => each !== label);
      const began = account.seen
        .filter((each) => each.label === label)
        .slice(after)
        .some((each) => each.event === "playing");

      return [
        ...(began ? [] : [`${step}: ${label} did not sound`]),
        ...(others.length === 0 ? [] : [`${step}: ${others.join(" and ")} sounds beside ${label}`]),
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
 * two recordings sounding at once, the page's errors, an endless recording that ended, and a
 * request of one recording past Chrome's connections to its host, which the rule races so that its
 * every wait ends at the request held back; and with them, where anything went wrong, every event
 * the page saw and every recording it holds, so the fault can be read.
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

          return yield* Effect.raceFirst(
            Effect.gen(function* ruled() {
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
            }),
            page.crowded,
          );
        }).pipe(
          Effect.catchTags({
            CrowdedRecording: (failure) =>
              Effect.succeed([`${strict ? "strict" : "plain"}: ${failure.message}`]),
            DrivingFailure: (failure) =>
              Effect.succeed([`${strict ? "strict" : "plain"}: ${failure.message}`]),
            EndedEndless: (failure) =>
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
 * delivery of its start, then the recording's event that says its data came, or failed, or that its
 * load was given up, counting only events after the release; nothing more where the page let the
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
    const before = eventsOf(yield* page.account, label);

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
        apple: at.endless(recording.choice2),
        prompt: at.tone(recording.prompt0, finiteLength),
        stem: at.endless(recording.text1),
      })),
      (page) =>
        Effect.gen(function* alone() {
          const before = eventsOf(yield* page.account, recording.prompt0);

          yield* page.press("i1", named.question1);
          yield* page.heard;

          const begun = yield* beganAlone(page, "the press", recording.prompt0, before);

          if (begun.length > 0) {
            return begun;
          }

          yield* page.saw(recording.prompt0, ["ended", "pause"], before);
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
        saidAlone((at) => ({
          apple: at.endless(recording.choice2),
          stem: at.endless(recording.text1),
        })),
        (page) =>
          Effect.gen(function* oneAtATime() {
            yield* page.press("i1", named.text1);
            yield* page.heard;

            const first = yield* soundsNow(page, "text1 pressed", recording.text1);

            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const second = yield* soundsNow(page, "choice2 pressed", recording.choice2);

            yield* page.press("i1", named.choice1);
            yield* page.heard;

            return [
              ...first,
              ...second,
              ...(yield* soundsNow(page, "choice2 pressed again")),
              ...(yield* showsNow(page, recording.choice2, `pressed false notice ""`)),
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
          i1: showOf(said, "i1", at, { apple: at.endless(recording.a1) }),
          i2: showOf(said, "i2", at, { apple: at.endless(recording.c2) }),
        },
      }),
      (page) =>
        Effect.gen(function* acrossItems() {
          const faults: (readonly string[])[] = [];

          for (const [show, label] of [
            ["i1", recording.a1],
            ["i2", recording.c2],
            ["i1", recording.a1],
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
            i1: showOf(said, "i1", at, { apple: at.endless(recording.same) }),
            i2: showOf(said, "i2", at, { apple: at.endless(recording.same) }),
          },
        }),
        (page) =>
          Effect.gen(function* leaving() {
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const begun = yield* soundsNow(page, "the press", recording.same);

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
        saidAlone((at) => ({ apple: at.held(recording.p) })),
        (page) =>
          Effect.gen(function* leavingPending() {
            yield* page.press("i1", named.choice1);

            const asked = yield* playedNow(page, recording.p);

            if (asked.length > 0) {
              return asked;
            }

            yield* page.recordings.requested(recording.p);
            yield* page.scene([]);
            yield* released(page, recording.p);
            yield* page.heard;

            return sounded(yield* page.account, recording.p)
              ? ["p sounded after its control left"]
              : [];
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
              i1: showOf(said, "i1", at, {
                apple: at.held(recording.a),
                pear: at.endless(recording.b),
              }),
            },
          }),
          (at: Recordings): SceneSpec => ({
            first: ["i1", "i2"],
            shows: {
              i1: showOf(said, "i1", at, { apple: at.held(recording.a) }),
              i2: showOf(said, "i2", at, { pear: at.endless(recording.b) }),
            },
          }),
        ],
        (scene, index) =>
          holds(index === 0 ? "RB6" : "RB7", scene, (page) =>
            Effect.gen(function* overtaken() {
              yield* page.press("i1", named.choice1);

              const asked = yield* playedNow(page, recording.a);

              if (asked.length > 0) {
                return asked;
              }

              yield* page.recordings.requested(recording.a);
              yield* page.press(index === 0 ? "i1" : "i2", named.choice2);
              yield* released(page, recording.a);
              yield* page.heard;

              const account = yield* page.account;

              return [
                ...(sounded(account, recording.a) ? ["a sounded"] : []),
                ...(yield* soundsNow(page, "a's data arrived", recording.b)),
                ...(yield* showsNow(page, recording.a, `pressed false notice ""`)),
                ...(yield* showsNow(page, recording.b, `pressed true notice ""`)),
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
            saidAlone((at) => ({ apple: at.held(recording.a) })),
            (page) =>
              Effect.gen(function* stoppedPending() {
                yield* twice(page);
                yield* page.recordings.release(recording.a);
                yield* page.heard;

                const account = yield* page.account;
                const answers = answersIn(account, recording.a).join(" ");

                return [
                  ...(answers.endsWith("play pause")
                    ? []
                    : [`the presses' answers were "${answers}", not a play and then its stop`]),
                  ...(sounded(account, recording.a) ? ["a sounded after its second press"] : []),
                  ...(yield* showsNow(page, recording.a, `pressed false notice ""`)),
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
        saidAlone((at) => ({ apple: at.refused(recording.broken), pear: at.endless(recording.b) })),
        (page) =>
          Effect.gen(function* lateFailure() {
            yield* page.press("i1", named.choice1);

            const asked = yield* playedNow(page, recording.broken);

            if (asked.length > 0) {
              return asked;
            }

            yield* page.recordings.requested(recording.broken);
            yield* page.press("i1", named.choice2);
            yield* released(page, recording.broken);
            yield* page.heard;

            const account = yield* page.account;

            return [
              ...(yield* soundsNow(page, "broken failed", recording.b)),
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
        saidAlone((at) => ({ apple: at.endless(recording.a) })),
        (page) =>
          Effect.gen(function* hidden() {
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "a pressed", recording.a);

            yield* page.scene([{ hidden: true, key: "i1" }]);

            const hid = yield* soundsNow(page, "hidden");

            yield* page.scene([{ key: "i1" }]);

            const shown = [
              ...(yield* soundsNow(page, "shown again")),
              ...(yield* showsNow(page, recording.a, `pressed false notice ""`)),
            ];

            yield* page.press("i1", named.choice1);
            yield* page.heard;

            return [
              ...pressed,
              ...hid,
              ...shown,
              ...(yield* soundsNow(page, "pressed again", recording.a)),
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
          i1: showOf(said, "i1", at, {
            apple: at.endless(recording.a),
            pear: at.endless(recording.b),
          }),
          i2: showOf(said, "i2", at, { apple: at.endless(recording.c) }),
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

          return yield* soundsNow(page, "the last press", recording.b);
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
                i1: showOf(said, "i1", at, { apple: at.endless(recording.a) }),
                i2: showOf(said, "i2", at, { apple: at.endless(recording.b) }),
              },
            }),
            targets: [
              ["i1", named.choice1],
              ["i2", named.choice1],
            ] as const,
          },
          {
            rule: "RB14",
            scene: saidAlone((at) => ({
              apple: at.endless(recording.a),
              pear: at.endless(recording.b),
            })),
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

              return yield* soundsNow(page, "two presses in one task", recording.b);
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
            i1: showOf(said, "i1", at, { apple: at.endless(recording.same) }),
            i2: showOf(said, "i2", at, { apple: at.endless(recording.same) }),
          },
        }),
        (page) =>
          Effect.gen(function* hiddenBehind() {
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "i1 pressed", recording.same);

            yield* page.scene([{ hidden: true, key: "i1" }, { key: "i2" }]);

            const moved = yield* soundsNow(page, "moved on");

            yield* page.press("i2", named.choice1);
            yield* page.heard;

            return [
              ...pressed,
              ...moved,
              ...(yield* soundsNow(page, "i2 pressed", recording.same)),
            ];
          }),
      ),
  );

  it.effect(
    "RB15: a read-aloud press stops a Media and the host's media playing, and a Media's press stops read-aloud",
    () =>
      holds(
        "RB15",
        mediaAlone((at) => ({ m1: at.endless(recording.media), stem: at.endless(recording.a) })),
        (page) =>
          Effect.gen(function* withMedia() {
            const faults: (readonly string[])[] = [];

            yield* page.pressMedia("m", 0);
            yield* page.heard;
            faults.push(yield* soundsNow(page, "the Media pressed", recording.media));
            yield* page.press("m", named.text1);
            yield* page.heard;
            faults.push(yield* soundsNow(page, "read-aloud pressed", recording.a));
            yield* page.pressMedia("m", 0);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "the Media pressed again", recording.media),
              yield* showsNow(page, recording.a, `pressed false notice ""`),
            );
            yield* page.foreign(page.recordings.endless(recording.host), false, "");
            faults.push(yield* soundsNow(page, "the host's media", recording.host));
            yield* page.press("m", named.text1);
            yield* page.heard;
            faults.push(yield* soundsNow(page, "read-aloud pressed again", recording.a));

            return faults.flat();
          }),
      ),
  );

  it.effect(
    "RB16: after the host stops every recording, the control shows itself unpressed and its next press plays it from its start",
    () =>
      holds(
        "RB16",
        saidAlone((at) => ({ apple: at.endless(recording.a) })),
        (page) =>
          Effect.gen(function* stopAll() {
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "a pressed", recording.a);

            if (pressed.length > 0) {
              return pressed;
            }

            const sought = 10;

            yield* page.inPage(
              `new Promise((resolve) => { const element = ${elementNamed(recording.a)}; element.addEventListener("seeked", () => { resolve(undefined); }, { once: true }); element.currentTime = ${String(sought)}; })`,
            );
            yield* page.inPage(
              `for (const each of document.querySelectorAll("audio")) each.pause();`,
            );

            const stopped = [
              ...(yield* soundsNow(page, "the host stopped every recording")),
              ...(yield* showsNow(page, recording.a, `pressed false notice ""`)),
            ];
            const before = eventsOf(yield* page.account, recording.a);

            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const again = playedFrom(yield* page.account, recording.a, before);

            return [
              ...stopped,
              ...(yield* soundsNow(page, "a pressed again", recording.a)),
              ...playedFromFaults(
                "a pressed again",
                recording.a,
                again,
                (at) => at < sought,
                (at) =>
                  `a did not start again from its start: it played from ${String(at)}, the host having sought ${String(sought)}`,
              ),
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
            left: showOf(said, "kept", at, { apple: at.endless(recording.left) }),
            next: showOf(said, "kept", at, { apple: at.endless(recording.next) }),
          },
        }),
        (page) =>
          Effect.gen(function* keptPlace() {
            yield* page.press("left", named.choice1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "left pressed", recording.left);

            yield* page.scene([{ key: "next", slot: "left" }]);

            const moved = yield* soundsNow(page, "moved on");

            yield* page.press("next", named.choice1);
            yield* page.heard;

            return [
              ...pressed,
              ...moved,
              ...(yield* soundsNow(page, "next pressed", recording.next)),
            ];
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
              greatest: at.endless(recording.greatest),
              least: at.endless(recording.least),
            }),
            i1: showOf(said, "i1", at, { stem: at.endless(recording.stem) }),
          },
        }),
        (page) =>
          Effect.gen(function* gapMatchLabel() {
            const faults: (readonly string[])[] = [];

            for (const [show, name, label] of [
              ["gm", named.label1, recording.least],
              ["gm", named.label2, recording.greatest],
              ["i1", named.text1, recording.stem],
              ["gm", named.label2, recording.greatest],
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
              ...(yield* soundsNow(page, "a card placed", recording.greatest)),
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
          m1: at.endless(recording.m1),
          m2: at.endless(recording.m2),
          m3: at.held(recording.m3),
          stem: at.endless(recording.a),
        })),
        (page) =>
          Effect.gen(function* interrupted() {
            const faults: (readonly string[])[] = [];

            yield* page.pressMedia("m", 0);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "M1 pressed", recording.m1),
              yield* countedNow(page, "M1 plays", { M1: "1", M2: "", M3: "" }),
            );
            yield* page.pressMedia("m", 1);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "M2 pressed", recording.m2),
              yield* countedNow(page, "M2 stops M1 mid-play", { M1: "1", M2: "1", M3: "" }),
            );

            const paused = yield* page.account;
            const stopped = paused.recordings.find((each) => each.label === recording.m1);
            const beforeResume = eventsOf(paused, recording.m1);

            yield* page.pressMedia("m", 0);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "M1 pressed again", recording.m1),
              yield* countedNow(page, "M1 resumed under max-plays 1", {
                M1: "1",
                M2: "1",
                M3: "",
              }),
            );

            const resumed = playedFrom(yield* page.account, recording.m1, beforeResume);

            yield* page.press("m", named.text1);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "read-aloud pressed", recording.a),
              yield* countedNow(page, "a read-aloud press stops M1", {
                M1: "1",
                M2: "1",
                M3: "",
              }),
            );
            yield* page.pressMedia("m", 1);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "M2 pressed again", recording.m2),
              yield* countedNow(page, "M2 resumed in loop mode", { M1: "1", M2: "1", M3: "" }),
            );
            yield* page.pressMedia("m", 2);

            const asked = yield* playedNow(page, recording.m3);

            if (asked.length > 0) {
              return [...faults.flat(), ...asked];
            }

            yield* page.recordings.requested(recording.m3);
            yield* page.press("m", named.text1);
            yield* released(page, recording.m3);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "read-aloud pressed over M3", recording.a),
              yield* countedNow(page, "M3 paused before it sounded", {
                M1: "1",
                M2: "1",
                M3: "",
              }),
            );
            yield* page.pressMedia("m", 2);
            yield* page.heard;
            faults.push(
              yield* soundsNow(page, "M3 pressed again", recording.m3),
              yield* countedNow(page, "M3 plays and counts", { M1: "1", M2: "1", M3: "1" }),
            );

            return [
              ...faults.flat(),
              ...(stopped !== undefined && stopped.paused && !stopped.ended && stopped.time > 0
                ? []
                : [`M1 was not paused mid-play by M2: ${JSON.stringify(stopped)}`]),
              ...playedFromFaults(
                "M1 pressed again",
                recording.m1,
                resumed,
                (at) => stopped !== undefined && at >= stopped.time,
                (at) => `M1 did not resume where it stopped: ${JSON.stringify([stopped, at])}`,
              ),
            ];
          }),
      ),
  );

  it.effect(
    "RB20: a Media's play refused past max-plays takes no voice: the recording read aloud plays on",
    () =>
      holds(
        "RB20",
        mediaAlone((at) => ({
          m1: at.tone(recording.short, finiteLength),
          stem: at.endless(recording.a),
        })),
        (page) =>
          Effect.gen(function* refusedPlay() {
            const before = eventsOf(yield* page.account, recording.short);

            yield* page.pressMedia("m", 0);
            yield* page.heard;

            const begun = yield* beganAlone(page, "M1 pressed", recording.short, before);

            if (begun.length > 0) {
              return begun;
            }

            yield* page.saw(recording.short, ["ended", "pause"], before);
            yield* page.press("m", named.text1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "read-aloud pressed", recording.a);

            yield* page.inPage(`${elementNamed(recording.short)}?.play().catch(() => undefined)`);
            yield* page.heard;

            return [
              ...pressed,
              ...(yield* soundsNow(page, "the refusal", recording.a)),
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
            i1: showOf(said, "i1", at, { apple: at.endless(recording.a) }),
            i2: showOf(said, "i2", at, { apple: at.endless(recording.b) }),
          },
        }),
        (page) =>
          Effect.gen(function* oneLeft() {
            yield* page.scene([{ key: "i1" }]);
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const pressed = yield* soundsNow(page, "a pressed", recording.a);

            yield* page.foreign(page.recordings.endless(recording.host), false, "");

            return [...pressed, ...(yield* soundsNow(page, "the host's media", recording.host))];
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
          shows: { i1: showOf(said, "i1", at, { apple: at.endless(recording.a) }) },
        }),
        (page) =>
          Effect.gen(function* alreadyPlaying() {
            yield* page.foreign(page.recordings.endless(recording.host), false, "");
            yield* page.foreign(page.recordings.endless(recording.deco), true, "");

            const before = yield* soundsNow(page, "before any player", recording.host);

            yield* page.scene([{ key: "i1" }]);
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const muted = (yield* page.account).recordings.find(
              (each) => each.label === recording.deco,
            );

            return [
              ...before,
              ...(yield* soundsNow(page, "a pressed", recording.a)),
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
                apples: at.endless(recording.apples),
                pears: at.endless(recording.pears),
                stem: at.endless(recording.stem),
              }),
              stimuli: [{ document: passage, recordings: showOf(passage, "p", at, {}).recordings }],
            },
          },
        }),
        (page) =>
          Effect.gen(function* graphLabels() {
            const faults: (readonly string[])[] = [];

            for (const [name, label] of [
              [named.text1, recording.stem],
              [named.label1, recording.apples],
              [named.label2, recording.pears],
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
        saidAlone((at) => ({ apple: at.endless(recording.a) })),
        (page) =>
          Effect.gen(function* turnedUp() {
            const faults: (readonly string[])[] = [];
            const change = (script: string) =>
              page.inPage(
                `new Promise((resolve) => { const deco = ${elementNamed(recording.deco)}; deco.addEventListener("volumechange", () => { setTimeout(resolve, 0); }, { once: true }); ${script} })`,
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
            faults.push(yield* soundsNow(page, "a pressed", recording.a));
            yield* page.foreign(page.recordings.endless(recording.deco), true, "");
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
            faults.push(yield* soundsNow(page, "a pressed again", recording.a));
            yield* change("deco.volume = 0.5;");
            faults.push(yield* holdsPaused("turned while paused", "a", false));
            yield* change("deco.muted = true;");
            yield* page.inPage(`${elementNamed(recording.deco)}.play()`);
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
        mediaAlone((at) => ({ m3: at.held(recording.m3) })),
        (page) =>
          Effect.gen(function* pausedLoading() {
            yield* page.pressMedia("m", 2);

            const asked = yield* playedNow(page, recording.m3);

            if (asked.length > 0) {
              return asked;
            }

            yield* page.recordings.requested(recording.m3);

            const loading = yield* page.mediaControlText("m", 2);

            yield* page.pressMedia("m", 2);

            const paused = (yield* page.account).recordings.find(
              (each) => each.label === recording.m3,
            );

            yield* released(page, recording.m3);
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
              ...(sounded(account, recording.m3) ? ["m3 sounded once its data arrived"] : []),
              ...counted,
              ...(yield* soundsNow(page, "pressed again", recording.m3)),
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
            i1: showOf(said, "i1", at, { apple: at.endless(recording.a) }),
            i2: showOf(said, "i2", at, { apple: at.endless(recording.b) }),
          },
        }),
        (page) =>
          Effect.gen(function* twoPages() {
            yield* page.scene([{ key: "i1" }, { frame: true, key: "i2" }]);
            yield* page.press("i1", named.choice1);
            yield* page.heard;

            const inPage = yield* soundsNow(page, "a pressed in the page", recording.a);

            yield* page.inPage(
              `[...(document.querySelector('iframe[data-frame="i2"]')?.contentDocument?.querySelectorAll('section[data-show="i2"] button') ?? [])].find((each) => each.textContent === ${JSON.stringify(named.choice1)})?.dispatchEvent(new PointerEvent("click", { bubbles: true, cancelable: true, composed: true }))`,
            );
            yield* page.heard;

            const inFrame = yield* soundsNow(
              page,
              "b pressed in the frame",
              recording.a,
              recording.b,
            );

            yield* page.foreign(page.recordings.endless(recording.host), false, "i2");

            return [
              ...inPage,
              ...inFrame,
              ...(yield* soundsNow(
                page,
                "the host's media in the frame",
                recording.a,
                recording.host,
              )),
            ];
          }),
      ),
  );

  it.effect(
    "RB27: a Media whose recording cannot play ends at rest, its control its Play again, nothing counted or sounding, and the child is told beside the control",
    () =>
      holds(
        "RB27",
        mediaAlone((at) => ({ m1: at.refused(recording.broken) })),
        (page) =>
          Effect.gen(function* failedMedia() {
            yield* page.pressMedia("m", 0);

            const asked = yield* playedNow(page, recording.broken);

            if (asked.length > 0) {
              return asked;
            }

            yield* page.recordings.requested(recording.broken);
            yield* released(page, recording.broken);
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
        saidAlone((at) => ({ apple: at.endless(recording.a) })),
        (page) =>
          Effect.gen(function* playAndPress() {
            yield* page.inPage(
              `(() => { const host = document.createElement("audio"); host.src = ${JSON.stringify(page.recordings.endless(recording.host))}; document.body.append(host); void host.play().catch(() => undefined); [...document.querySelectorAll('section[data-show="i1"] button')].find((each) => each.textContent === ${JSON.stringify(named.choice1)})?.click(); })()`,
            );
            yield* page.heard;

            const host = (yield* page.account).recordings.find(
              (each) => each.label === recording.host,
            );

            return [
              ...(yield* soundsNow(page, "the press after the host's play", recording.a)),
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
