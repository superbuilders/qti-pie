/**
 * Plate's read-aloud driven in headless Chrome as a child and a host drive it: pages of the
 * synthetic items of `#specimen/ui/read-aloud-items.ts`, each opened as content the database
 * admitted, rendered by `<Item>` and hydrated as a host hydrates its items
 * (`#specimen/ui/hydrated.ts`), its recordings on the harness's server. A rule presses controls by
 * their accessible names, moves the host between items, plays media of the host's own, and reads
 * the page's account of its media (`#specimen/ui/hydrate-account.ts`). Every wait ends on what is
 * certain to come whether the page is right or broken: the frames after an action and the page's
 * next idle period, every play the page asked for settled, an event of a recording the rule saw
 * begin, or the server's report that it was asked for or delivered a held-back recording; never a
 * delay. A rule then reads the page and gives its faults.
 *
 * Test support for plate's UI suite under `src/ui/`.
 *
 * @module
 */
import { Data, Effect, Option, Schema } from "effect";
import type { Scope } from "effect";
import type { Locator, Page } from "playwright-core";
import { acceptedItem, acceptedStimulus, configure, startingResponses } from "@qti-pie/plate";
import { admitted } from "@qti-pie/plate/test/admitted";
import type { ItemProps } from "@qti-pie/plate/ui";
import type { Recording, Seen } from "#specimen/ui/hydrate-account.ts";
import type { Scene } from "#specimen/ui/hydrate-page.ts";
import { HydrationFailure, scenePages } from "#specimen/ui/hydrated.ts";
import type { Answering, HydratedScene, Recordings } from "#specimen/ui/hydrated.ts";
import type { Synthetic } from "#specimen/ui/read-aloud-items.ts";

/**
 * A rule could not drive the page: a control it pressed was not there to press, or a document
 * would not open.
 */
export class DrivingFailure extends Data.TaggedError("DrivingFailure")<{
  readonly step: string;
}> {
  /**
   * The step that failed.
   */
  override get message(): string {
    return `The rule could not drive the page: ${this.step}`;
  }
}

/**
 * A step of a rule failed: driving the page, or the page itself.
 */
export type RuleFailure = DrivingFailure | HydrationFailure;

/**
 * One item of a page as a rule asks for it: its document, its instance, the address of each of its
 * recordings, by the part it reads, and its passages, each with theirs.
 */
export interface ShowSpec {
  readonly document: Synthetic;
  readonly instance: string;
  readonly recordings: Readonly<Record<string, string>>;
  readonly stimuli?: readonly {
    readonly document: Synthetic;
    readonly recordings: Readonly<Record<string, string>>;
  }[];
}

/**
 * A page as a rule asks for it: its items, by key, and its first scene, the keys of the items it
 * shows, in order.
 */
export interface SceneSpec {
  readonly first: readonly string[];
  readonly shows: Readonly<Record<string, ShowSpec>>;
}

/**
 * The supports of a child who hears content read aloud: the `spoken` catalog support enabled at
 * `computer-read-aloud`, every other support off.
 */
const spoken: NonNullable<ItemProps["supports"]> = {
  braille: Option.none(),
  catalog: new Set(["spoken"]),
  display: { invertDisplayPolarity: false, keywordEmphasis: false, magnification: Option.none() },
  keywordTranslationLanguage: Option.none(),
  readAloud: Option.some("computer-read-aloud"),
  signLanguage: Option.none(),
};

/**
 * Give each recording of a document its address, by its package path.
 *
 * @param document The document.
 * @param recordings Each recording's address, by the part it reads.
 * @returns The `assets` entries.
 */
const assetsOf = (
  document: Synthetic,
  recordings: Readonly<Record<string, string>>,
): readonly (readonly [string, string])[] =>
  Object.entries(recordings).flatMap(([part, address]) => {
    const path = document.recordings[part];

    return path === undefined ? [] : [[path, address] as const];
  });

/**
 * Open a synthetic document as content the database admitted.
 *
 * @param document The document.
 * @returns Its bytes' verdict.
 */
const opened = (document: Synthetic) =>
  admitted(document.location, new TextEncoder().encode(document.xml));

/**
 * Build an item as a host shows it in answering: accepted, its recordings' and its passages'
 * addresses in `assets`, the child hearing content read aloud.
 *
 * @param show The item.
 * @returns It, in answering.
 */
const answeringOf = (show: ShowSpec): Effect.Effect<Answering, DrivingFailure> =>
  Effect.gen(function* built() {
    const item = yield* Effect.fromOption(acceptedItem(yield* opened(show.document)));
    const stimuli = yield* Effect.all(
      (show.stimuli ?? []).map((each) =>
        opened(each.document).pipe(
          Effect.flatMap((verdict) => Effect.fromOption(acceptedStimulus(verdict))),
        ),
      ),
    );
    const configuration = yield* configure({
      assets: [
        ...assetsOf(show.document, show.recordings),
        ...(show.stimuli ?? []).flatMap((each) => assetsOf(each.document, each.recordings)),
      ],
      seed: "read-aloud-browser",
    });
    const props: ItemProps = {
      configuration,
      instance: show.instance,
      item,
      mode: "answering",
      showFeedback: false,
      stimuli,
      supports: spoken,
    };

    return { props, responses: startingResponses(item, props) };
  }).pipe(
    Effect.mapError(
      (cause) => new DrivingFailure({ step: `opened ${show.document.location}: ${String(cause)}` }),
    ),
  );

/**
 * What a rule reads of a page: every moment two recordings sounded at once, every recording as it
 * is now, and every media event the page saw, in order.
 */
export interface Account {
  readonly overlaps: readonly string[];
  readonly recordings: readonly Recording[];
  readonly seen: readonly Seen[];
}

/**
 * One page as a rule drives it.
 */
export interface Driven {
  /**
   * Read the page's account now.
   */
  readonly account: Effect.Effect<Account, RuleFailure>;
  /**
   * Read the accessible tree of the page's `main` as Chrome computes it, in Playwright's ARIA
   * snapshot: each node by its role and accessible name, in document order.
   */
  readonly ariaTree: Effect.Effect<string, RuleFailure>;
  /**
   * Play a media element of the host's own, heard, or muted and looping, in the page or in a frame
   * of it, then wait as {@link Driven.heard} waits.
   *
   * @param src Its file.
   * @param muted Whether it is muted, as a decorative video is.
   * @param frame The key of the item whose frame it plays in, empty for the page.
   * @returns The play.
   */
  readonly foreign: (
    src: string,
    muted: boolean,
    frame: string,
  ) => Effect.Effect<void, RuleFailure>;
  /**
   * Wait for the page to paint and go idle, so every `play` an action caused has been heard, then
   * until every play the page asked for has settled, then for the page to paint again.
   */
  readonly heard: Effect.Effect<void, RuleFailure>;
  /**
   * Run a script in the page, waiting on what it gives, then for the page to paint.
   *
   * @param script The script, an expression.
   * @returns Its run.
   */
  readonly inPage: (script: string) => Effect.Effect<void, RuleFailure>;
  /**
   * Give the text of a Media interaction's own control, the item's Media interactions counted from
   * 0: Play, or Pause.
   *
   * @param show The item's key.
   * @param index The Media interaction's place among the item's.
   * @returns The control's text.
   */
  readonly mediaControlText: (show: string, index: number) => Effect.Effect<string, RuleFailure>;
  /**
   * Wait for the page to paint twice and run what those frames scheduled, failing where it has
   * reported an error.
   */
  readonly painted: Effect.Effect<void, RuleFailure>;
  /**
   * Read the responses an item holds now, each by its identifier as text: its values, each
   * written, joined by `, `, empty for NULL.
   *
   * @param show The item's key.
   * @returns Its responses.
   */
  readonly posted: (show: string) => Effect.Effect<Readonly<Record<string, string>>, RuleFailure>;
  /**
   * Press a button by its accessible name inside an item, as a child does, with the pointer.
   *
   * @param show The item's key.
   * @param name The button's name.
   * @returns The press, once the page painted it.
   */
  readonly press: (show: string, name: string) => Effect.Effect<void, RuleFailure>;
  /**
   * Press a Media interaction's own control, the item's Media interactions counted from 0, as a
   * child does, with the pointer.
   *
   * @param show The item's key.
   * @param index The Media interaction's place among the item's.
   * @returns The press, once the page painted it.
   */
  readonly pressMedia: (show: string, index: number) => Effect.Effect<void, RuleFailure>;
  /**
   * Press several controls in one task, each by its item and name, where each is there and each
   * player's control among them has its player joined to its page's voice; none, where one is not.
   *
   * @param targets The controls.
   * @returns The presses, once the page painted them.
   */
  readonly pressTogether: (
    targets: readonly (readonly [show: string, name: string])[],
  ) => Effect.Effect<void, RuleFailure>;
  /**
   * The page's recordings on the harness's server.
   */
  readonly recordings: Recordings;
  /**
   * Move the host to a scene: the items shown, in order, each by its key, hidden or not, in the
   * place the host gives it, in the page or in a frame of it, a page of its own.
   *
   * @param scene The scene.
   * @returns The move, once the page painted it and every frame of it holds its item: a frame
   *   loads its empty document, then holds its item, both of which come, right page or broken.
   */
  readonly scene: (
    scene: readonly {
      readonly frame?: boolean;
      readonly hidden?: boolean;
      readonly key: string;
      readonly slot?: string;
    }[],
  ) => Effect.Effect<void, RuleFailure>;
  /**
   * Wait until a recording has fired one of the events named, counting only those after the
   * number of its events given.
   *
   * @param label The recording's name.
   * @param events The events.
   * @param after How many events of the recording to pass over first, 0 for none.
   * @returns The wait.
   */
  readonly saw: (
    label: string,
    events: readonly string[],
    after: number,
  ) => Effect.Effect<void, RuleFailure>;
  /**
   * Give the text of the first element a selector finds, empty where it finds none.
   *
   * @param selector The selector.
   * @returns Its text.
   */
  readonly textOf: (selector: string) => Effect.Effect<string, RuleFailure>;
  /**
   * The page.
   */
  readonly page: Page;
}

/**
 * Run a promise of Chrome's as an effect that fails with the step it was.
 *
 * @param step What the promise does, for the failure.
 * @param run The promise.
 * @returns The effect.
 */
const attempt = <A>(step: string, run: () => Promise<A>): Effect.Effect<A, HydrationFailure> =>
  Effect.tryPromise({ catch: (cause) => new HydrationFailure({ cause, step }), try: run });

/**
 * The selector of an item's `section`.
 *
 * @param show The item's key.
 * @returns The selector.
 */
const sectionOf = (show: string): string => `section[data-show="${show}"]`;

/**
 * Tell, in the page, whether a button is ready to press: a player's control, read-aloud's or a
 * Media's, whose player has joined its page's voice, which marks its media element in the effect
 * that readies the press; any other button is ready as React hydrated it.
 *
 * @param button The button.
 * @returns Whether it is ready.
 */
const joinedPlayer = (button: Element): boolean => {
  const part = button.closest("[data-slot=plate-read-aloud], [data-slot=plate-media]");

  return part?.querySelector("audio[data-plate-voice], video[data-plate-voice]") !== null;
};

/**
 * One response as a host posts it, as far as a rule reads it: its values, each with its value
 * written.
 */
const PostedValues = Schema.Record(
  Schema.String,
  Schema.Struct({
    values: Schema.optional(Schema.Array(Schema.Struct({ value: Schema.Unknown }))),
  }),
);

/**
 * Drive a hydrated page.
 *
 * @param hydrated The page.
 * @returns It, as a rule drives it.
 */
const drivenOf = (hydrated: HydratedScene): Driven => {
  const { page } = hydrated;
  const painted = hydrated.settle;
  /**
   * The items the last scene put in frames of the page, each a page of its own.
   */
  let framed: ReadonlySet<string> = new Set();

  /**
   * Find an item's `section`: in the page, or in the frame it stands in.
   *
   * @param show The item's key.
   * @returns Its section.
   */
  const sectionAt = (show: string) =>
    framed.has(show)
      ? page.frameLocator(`iframe[data-frame="${show}"]`).locator(sectionOf(show))
      : page.locator(sectionOf(show));

  /**
   * Press the one button a locator finds, with the pointer, without waiting for it to become
   * pressable, which a broken page may never make it. The press first waits for the page to go
   * idle, so every island has hydrated and run its effects, then holds the control to its own
   * hydration: a player's control is pressable once its player has joined its page's voice, which
   * marks its media element (`data-plate-voice`, `#plate/ui/voice.ts`) in the effect that readies
   * the press; one not joined by then fails the rule, never a press that silently does nothing.
   *
   * @param what The button, for the failure.
   * @param locate Find the button, as the page stands when the press runs.
   * @returns The press.
   */
  const pressAt = (what: string, locate: () => Locator) =>
    Effect.gen(function* pressed() {
      const target = locate();

      yield* painted;

      const found = yield* attempt(`counted ${what}`, () => target.count());

      yield* found === 1
        ? Effect.void
        : Effect.fail(new DrivingFailure({ step: `found ${String(found)} of ${what}, not one` }));

      const live = yield* attempt(`read whether ${what} has hydrated`, () =>
        target.evaluate(joinedPlayer),
      );

      yield* live
        ? Effect.void
        : Effect.fail(
            new DrivingFailure({
              step: `${what} is a player's control whose player had not joined its page's voice once the page was idle`,
            }),
          );
      yield* attempt(`pressed ${what}`, () => target.click({ force: true }));
      yield* painted;
    });

  const mediaControl = (show: string, index: number) =>
    page
      .locator(`${sectionOf(show)} [data-slot=plate-media]`)
      .nth(index)
      .locator("[data-slot=plate-media-controls] button")
      .first();

  const settled = Effect.andThen(
    painted,
    Effect.andThen(
      attempt("waited for every play to settle", () => page.evaluate(() => window.account?.idle())),
      painted,
    ),
  );

  return {
    account: attempt("read the page's account", () =>
      page.evaluate(() => ({
        overlaps: window.account?.overlaps() ?? [],
        recordings: window.account?.recordings() ?? [],
        seen: window.account?.seen() ?? [],
      })),
    ),
    ariaTree: attempt("read the page's accessible tree", () => page.locator("main").ariaSnapshot()),
    foreign: (src, muted, frame) =>
      Effect.andThen(
        attempt(`played the host's own ${src}`, () =>
          page.evaluate(
            ([file, quiet, inFrame]) => {
              window.account?.foreign(file, quiet, inFrame);
            },
            [src, muted, frame] as const,
          ),
        ),
        settled,
      ),
    heard: settled,
    inPage: (script) =>
      Effect.andThen(
        attempt(`ran ${script} in the page`, () => page.evaluate(script)),
        painted,
      ),
    mediaControlText: (show, index) =>
      attempt(`read the control of Media ${String(index)} in ${show}`, async () =>
        (await mediaControl(show, index).count()) === 1
          ? ((await mediaControl(show, index).textContent()) ?? "")
          : "",
      ),
    page,
    painted,
    posted: (show) =>
      Effect.flatMap(
        attempt("read the posted responses", () =>
          page.evaluate((key) => window.hydrated?.posted[key] ?? {}, show),
        ),
        (read) =>
          Effect.mapError(
            Effect.map(Schema.decodeUnknownEffect(PostedValues)(read), (responses) =>
              Object.fromEntries(
                Object.entries(responses).map(([identifier, { values }]) => [
                  identifier,
                  (values ?? []).map(({ value }) => String(value)).join(", "),
                ]),
              ),
            ),
            (cause) => new HydrationFailure({ cause, step: "read the posted responses" }),
          ),
      ),
    press: (show, name) =>
      pressAt(`${name} in ${show}`, () =>
        sectionAt(show).getByRole("button", { exact: true, name }),
      ),
    pressMedia: (show, index) =>
      pressAt(`the control of Media ${String(index)} in ${show}`, () =>
        sectionAt(show)
          .locator("[data-slot=plate-media]")
          .nth(index)
          .locator("[data-slot=plate-media-controls] button")
          .first(),
      ),
    pressTogether: (targets) =>
      Effect.gen(function* together() {
        yield* painted;

        const pressed = yield* attempt("pressed the controls in one task", () =>
          page.evaluate(
            (all) => {
              const buttons = all.map(([section, label]) =>
                [...document.querySelectorAll<HTMLButtonElement>(`${section} button`)].find(
                  (each) => each.textContent === label,
                ),
              );
              const live = buttons.every((button) => {
                const part = button?.closest(
                  "[data-slot=plate-read-aloud], [data-slot=plate-media]",
                );

                return (
                  button !== undefined &&
                  (part === null ||
                    part?.querySelector("audio[data-plate-voice], video[data-plate-voice]") !==
                      null)
                );
              });

              if (!live) {
                return 0;
              }

              for (const button of buttons) {
                button?.click();
              }

              return buttons.length;
            },
            targets.map(([show, name]) => [sectionOf(show), name] as const),
          ),
        );

        yield* pressed === targets.length
          ? Effect.void
          : Effect.fail(
              new DrivingFailure({
                step: `pressed ${String(pressed)} of ${String(targets.length)} controls in one task`,
              }),
            );
        yield* painted;
      }),
    recordings: hydrated.recordings,
    saw: (label, events, after) =>
      attempt(`waited for ${label}'s ${events.join(" or ")}`, () =>
        page.waitForFunction(
          ([name, kinds, passed]) =>
            (window.account?.seen() ?? [])
              .filter((each) => each.label === name)
              .slice(passed)
              .some((each) => kinds.includes(each.event)),
          [label, events, after] as const,
          { polling: "raf" },
        ),
      ).pipe(Effect.asVoid),
    scene: (next) =>
      Effect.gen(function* moved() {
        framed = new Set(next.flatMap(({ frame = false, key }) => (frame ? [key] : [])));
        yield* attempt("moved to the next scene", () =>
          page.evaluate(
            (scene) => {
              window.hydrated?.scene?.(scene);
            },
            next.map(({ frame = false, hidden = false, key, slot = key }): Scene[number] => ({
              frame,
              hidden,
              key,
              slot,
            })),
          ),
        );
        yield* Effect.forEach([...framed], (show) =>
          attempt(`waited for the frame of ${show} to hold it`, () =>
            page.waitForFunction(
              (key) =>
                (document
                  .querySelector<HTMLIFrameElement>(`iframe[data-frame="${key}"]`)
                  ?.contentDocument?.querySelector(`section[data-show="${key}"]`) ?? null) !== null,
              show,
              { polling: "raf" },
            ),
          ),
        );
        yield* painted;
      }),
    textOf: (selector) =>
      attempt(`read the text of ${selector}`, () =>
        page.evaluate((query) => document.querySelector(query)?.textContent ?? "", selector),
      ),
  };
};

/**
 * Open the pages of a file's rules: Vite, the pages' server and Chrome, for the scope, and an
 * opener of a page of a scene, under `<StrictMode>` or not, its items built from the page's own
 * recordings.
 */
export const readAloudPages: Effect.Effect<
  (
    build: (recordings: Recordings) => SceneSpec,
    strict: boolean,
  ) => Effect.Effect<Driven, RuleFailure, Scope.Scope>,
  HydrationFailure,
  Scope.Scope
> = scenePages.pipe(
  Effect.map(
    (open) => (build: (recordings: Recordings) => SceneSpec, strict: boolean) =>
      open((recordings) =>
        Effect.gen(function* built() {
          const spec = build(recordings);
          const shows = yield* Effect.forEach(Object.entries(spec.shows), ([key, show]) =>
            answeringOf(show).pipe(Effect.map((answering) => [key, answering] as const)),
          );

          return {
            scene: spec.first.map((key) => ({ frame: false, hidden: false, key, slot: key })),
            shows: new Map(shows),
            strict,
          };
        }),
      ).pipe(Effect.map(drivenOf)),
  ),
);
