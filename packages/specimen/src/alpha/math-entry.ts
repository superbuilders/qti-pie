/**
 * The math entry's field, driven as a child drives it: a page in headless Google Chrome holding
 * one MathLive field set up by plate's own `setUpField` (`@qti-pie/plate/alpha/math-entry`), under
 * AlphaTest's virtual keyboard, which a key sequence is pressed into on a fresh field, and whose
 * LaTeX is read back once the last key has landed. It is the source of truth for what the field
 * emits for what a child presses: plate's UI suite reads it (`#specimen/alpha/math-entry.test.ts`),
 * and a grader's suite draws key sequences ({@link keySequence}) and asks it the LaTeX a child
 * would have posted, through {@link mathEntryFields} or its command line (`math-entry.cli.ts`).
 *
 * A key is one of three things a child does, each sent as the browser receives it from a person:
 *
 * - `keycap`, a key of the virtual keyboard, by its `latex` or its shortcut's `label` as the layout
 *   writes it (`\frac{▢}{▢}`, `[left]`): a pointer click at the key's centre once the key stands
 *   still. A key of the keyboard while it is hidden shows it first, as the field's keyboard toggle
 *   does;
 * - `typed`, a printable ASCII character typed on a US keyboard: its key, with Shift held where the
 *   character is a shifted one, as a person types it, so MathLive reads the key and its modifiers
 *   as it reads a person's (a `|` is Shift and the backslash key, and the backslash key alone opens
 *   MathLive's LaTeX mode);
 * - `pressed`, a key that types nothing: deleting, moving the caret, and Enter;
 * - `box`, a tap on one of the field's empty boxes, the `n`th in reading order from 0, which puts the
 *   caret in it, as a child taps a box a template key left; a tap on a box the field has not does
 *   nothing.
 *
 * The page is served from this machine, MathLive's own files from its package, so nothing loads
 * from another host. Chrome is the machine's, through Playwright's `chrome` channel, headless.
 *
 * @module
 */
import { createServer } from "node:http";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspect } from "node:util";
import { array, element, map, weighted } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { Array as Arr, Data, Effect, Option, Schema } from "effect";
import type { Result, Scope } from "effect";
import type { Browser, Page } from "playwright-core";
import { chromeFor } from "#specimen/ui/chrome.ts";
import {
  alphaTestLayout,
  alphaTestRows,
  alphaTestSettings,
  countKeycaps,
  fieldSettings,
  keyboardKeys,
  keyboardLayout,
  setUpField,
} from "@qti-pie/plate/alpha/math-entry";
import type { FieldSettings } from "@qti-pie/plate/alpha/math-entry";
import type { MathfieldElement, VirtualKeyboardLayout } from "mathlive";

/**
 * The names of a keyboard's keys, in the order the page shows them: each key's `latex`, or its
 * shortcut's `label`, its gaps left out, since MathLive draws a gap as no key.
 *
 * @param rows The keyboard's keys, row by row, by name.
 * @returns The names.
 */
const namesOf = (
  rows: readonly (readonly ({ readonly latex: string } | { readonly label: string })[])[],
): readonly string[] =>
  rows.flatMap((row) =>
    row.flatMap((each) => {
      if ("latex" in each) {
        return [each.latex];
      }

      return each.label === "[separator]" ? [] : [each.label];
    }),
  );

/**
 * The keys of plate's virtual keyboard, each by its name: a key AlphaTest had by AlphaTest's
 * `latex` or shortcut `label`, whatever plate's inserts, and a key plate added by its own `latex`.
 * A key's name means the same key on plate's keyboard and AlphaTest's.
 */
export const keycaps: Arr.NonEmptyReadonlyArray<string> = Arr.match(namesOf(keyboardKeys), {
  // Plate's keyboard holds every key of AlphaTest's, so it is never without keys.
  onEmpty: () =>
    Arr.map(Arr.flatten(alphaTestRows), (each) => ("latex" in each ? each.latex : each.label)),
  onNonEmpty: (names) => names,
});

/**
 * The shifted characters of a US keyboard's symbol keys, each by the `code` of its key.
 */
const shiftedSymbols = [
  ["!", "Digit1"],
  ['"', "Quote"],
  ["#", "Digit3"],
  ["$", "Digit4"],
  ["%", "Digit5"],
  ["&", "Digit7"],
  ["(", "Digit9"],
  [")", "Digit0"],
  ["*", "Digit8"],
  ["+", "Equal"],
  [":", "Semicolon"],
  ["<", "Comma"],
  [">", "Period"],
  ["?", "Slash"],
  ["@", "Digit2"],
  ["^", "Digit6"],
  ["_", "Minus"],
  ["{", "BracketLeft"],
  ["|", "Backslash"],
  ["}", "BracketRight"],
  ["~", "Backquote"],
] as const;

/**
 * The unshifted characters of a US keyboard's symbol keys and its space bar, each by the `code` of
 * its key.
 */
const plainSymbols = [
  [" ", "Space"],
  ["'", "Quote"],
  [",", "Comma"],
  ["-", "Minus"],
  [".", "Period"],
  ["/", "Slash"],
  [";", "Semicolon"],
  ["=", "Equal"],
  ["[", "BracketLeft"],
  ["\\", "Backslash"],
  ["]", "BracketRight"],
  ["`", "Backquote"],
] as const;

/**
 * What a US keyboard types each printable ASCII character with, as Playwright names a key press:
 * the `code` of its key, after `Shift+` where the character is a shifted one. A letter's key is
 * `Key` and the letter, a digit's `Digit` and the digit.
 */
const usKeys: ReadonlyMap<string, string> = new Map([
  ...shiftedSymbols.map(([character, code]) => [character, `Shift+${code}`] as const),
  ...plainSymbols,
  ...Arr.makeBy(10, (digit) => [String(digit), `Digit${String(digit)}`] as const),
  ...Arr.makeBy(26, (letter) => {
    const lower = String.fromCodePoint(0x61 + letter);
    const upper = lower.toUpperCase();

    return [
      [lower, `Key${upper}`],
      [upper, `Shift+Key${upper}`],
    ] as const;
  }).flat(),
]);

/**
 * Every character a key sequence may type: the 95 printable ASCII characters, space to tilde.
 */
export const typedCharacters: Arr.NonEmptyReadonlyArray<string> = Arr.map(
  Arr.range(0x20, 0x7e),
  (point) => String.fromCodePoint(point),
);

/**
 * The keys that type nothing a sequence may press, by their `key` names. Tab and Escape are not
 * among them: each takes the caret out of the field, after which nothing more is typed into it.
 */
export const pressedKeys = [
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Backspace",
  "Delete",
  "End",
  "Enter",
  "Home",
] as const;

/**
 * One thing a child does to the field: a key of the virtual keyboard, a character typed, a key that
 * types nothing, or a tap on one of the squares the field draws, by its place among them from 0,
 * as a key sequence's line of JSON writes it.
 */
export const MathEntryKeySchema = Schema.Union([
  Schema.Struct({ keycap: Schema.Literals(keycaps) }),
  Schema.Struct({ typed: Schema.Literals(typedCharacters) }),
  Schema.Struct({ pressed: Schema.Literals(pressedKeys) }),
  Schema.Struct({ box: Schema.Number }),
]);

/**
 * One thing a child does to the field ({@link MathEntryKeySchema}).
 */
export type MathEntryKey = typeof MathEntryKeySchema.Type;

/**
 * A key sequence, as the command line reads one per line.
 */
export const KeySequenceSchema = Schema.Array(MathEntryKeySchema);

/**
 * The keyboards a field can be typed on: plate's, whose template keys hold MathLive's boxes, and
 * AlphaTest's, whose template keys insert the square character, as its player gave it.
 */
export const keyboards = ["plate", "alphatest"] as const;

/**
 * A keyboard a field can be typed on, one of {@link keyboards}.
 */
export type Keyboard = (typeof keyboards)[number];

/**
 * What a field is set up with on a keyboard: its options, its layout, the function that applies
 * them, and its keys' names in the order the page shows them, which places a key among the page's
 * keys.
 */
export interface Setup {
  readonly layout: VirtualKeyboardLayout;
  readonly names: readonly string[];
  /**
   * The function that sets a field up, `setUpField`'s shape, whose own source runs in the page.
   */
  readonly setUp: typeof setUpField;
  readonly settings: FieldSettings;
}

/**
 * What a field is set up with on each keyboard ({@link Setup}).
 */
const setups: Readonly<Record<Keyboard, Setup>> = {
  alphatest: {
    layout: alphaTestLayout,
    names: namesOf(alphaTestRows),
    setUp: setUpField,
    settings: alphaTestSettings,
  },
  plate: {
    layout: keyboardLayout,
    names: namesOf(keyboardKeys),
    setUp: setUpField,
    settings: fieldSettings,
  },
};

/**
 * Give what a field is set up with on a keyboard.
 *
 * @param keyboard The keyboard.
 * @returns Its setup.
 */
export const setupOf = (keyboard: Keyboard): Setup => setups[keyboard];

/**
 * Give the names of a keyboard's keys, as its layout's rows name them ({@link namesOf}), for a
 * setup of a test's own.
 */
export { namesOf };

/**
 * Draw a key of a keyboard's: a key of the virtual keyboard half the time, since that is how most
 * children answer, a typed character a third, and a key that types nothing the rest.
 *
 * @param names The keyboard's keys' names.
 * @returns The draw.
 */
const keyOf = (names: Arr.NonEmptyReadonlyArray<string>): Gen<MathEntryKey> =>
  weighted([
    [3, map(element(names), (keycap): MathEntryKey => ({ keycap }))],
    [2, map(element(typedCharacters), (typed): MathEntryKey => ({ typed }))],
    [1, map(element(pressedKeys), (pressed): MathEntryKey => ({ pressed }))],
  ]);

/**
 * Draw a key sequence of up to a dozen keys over every key a child has on a keyboard: the length of
 * a short answer, a fraction filled in or a few corrections.
 *
 * @param keyboard The keyboard.
 * @returns The draw.
 */
export const keySequenceOn = (keyboard: Keyboard): Gen<readonly MathEntryKey[]> =>
  array(
    keyOf(
      Arr.match(setups[keyboard].names, {
        onEmpty: () => keycaps,
        onNonEmpty: (names) => names,
      }),
    ),
    { max: 12, min: 0 },
  );

/**
 * Draw a key sequence over every key a child has on plate's keyboard ({@link keySequenceOn}).
 */
export const keySequence: Gen<readonly MathEntryKey[]> = keySequenceOn("plate");

/**
 * The page could not be served, Chrome could not start or be driven, or the field did not take a
 * key.
 */
export class MathEntryFailure extends Data.TaggedError("MathEntryFailure")<{
  readonly cause: unknown;
  readonly step: string;
}> {
  /**
   * The step that failed and its cause.
   */
  override get message(): string {
    return `The math entry's field failed while it ${this.step}: ${inspect(this.cause, { depth: 3 })}`;
  }
}

/**
 * Run a promise of Chrome's or the server's as an effect that fails with the step it was.
 *
 * @param step What the promise does, for the failure.
 * @param run The promise.
 * @returns The effect.
 */
const attempt = <A>(step: string, run: () => Promise<A>): Effect.Effect<A, MathEntryFailure> =>
  Effect.tryPromise({ catch: (cause) => new MathEntryFailure({ cause, step }), try: run });

/**
 * MathLive's package folder, which the page serves its module and fonts from.
 */
const mathliveFolder = path.dirname(fileURLToPath(import.meta.resolve("mathlive")));

/**
 * The page: MathLive's module, its fonts from its own sheet as Alpha's base sheet gives them, and
 * MathLive set up for the page as Alpha sets it up once a page
 * (`#plate/alpha/math-entry/mathlive.ts`): told to load neither fonts nor sounds itself, and its
 * keyboard's keys given counted ids by `countKeycaps`'s own source. Every setup's field runs in
 * such a page, AlphaTest's player's among them: the ids MathLive draws at random gave two keys one
 * id about one keyboard in 300, a defect AlphaTest's player had and plate does not keep, so ME3
 * holds plate to AlphaTest's keys without it, and no draw decides a run.
 */
const pageHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>math entry</title>
<link rel="stylesheet" href="/mathlive/mathlive-fonts.css">
<script type="module">
import { MathfieldElement } from "/mathlive/mathlive.min.mjs";
MathfieldElement.fontsDirectory = null;
MathfieldElement.soundsDirectory = null;
(${String(countKeycaps)})(window.mathVirtualKeyboard);
window.fieldReady = customElements.whenDefined("math-field");
</script></head><body></body></html>`;

/**
 * The media type of each kind of file of MathLive's the page asks for.
 */
const mediaTypes: ReadonlyMap<string, string> = new Map([
  [".css", "text/css"],
  [".mjs", "text/javascript"],
  [".woff2", "font/woff2"],
]);

/**
 * Answer one request of the page: the page itself, or a file of MathLive's package that its module
 * and sheet name.
 *
 * @param request The request.
 * @param response Its response.
 */
const serve = (request: IncomingMessage, response: ServerResponse): void => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const file = path.join(
    mathliveFolder,
    path.normalize(url.pathname.replace(/^\/mathlive\//u, "")),
  );
  const served = Option.filter(
    Option.fromNullishOr(mediaTypes.get(path.extname(file))),
    () => url.pathname.startsWith("/mathlive/") && file.startsWith(`${mathliveFolder}${path.sep}`),
  );

  if (url.pathname === "/") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(pageHtml);
  } else {
    void Effect.runPromise(
      Option.match(served, {
        onNone: () => Effect.sync(() => response.writeHead(404).end()),
        onSome: (type) =>
          Effect.match(
            attempt("read a file of MathLive's", () => readFile(file)),
            {
              onFailure: () => response.writeHead(404).end(),
              onSuccess: (bytes) => response.writeHead(200, { "content-type": type }).end(bytes),
            },
          ),
      }),
    );
  }
};

/**
 * The address a listening server took, as Node reports it for a TCP server.
 */
const ListeningAddress = Schema.Struct({ port: Schema.Number });

/**
 * The page's server on a port of the loopback the system chose, closed with its scope.
 */
const pageServer: Effect.Effect<string, MathEntryFailure, Scope.Scope> = Effect.flatMap(
  Effect.acquireRelease(
    Effect.callback<Server>((resume) => {
      const server = createServer(serve);

      server.listen(0, "127.0.0.1", () => {
        resume(Effect.succeed(server));
      });
    }),
    (server) =>
      Effect.callback<undefined>((resume) => {
        server.close(() => {
          resume(Effect.undefined);
        });
        server.closeAllConnections();
      }),
  ),
  (server) =>
    Effect.mapError(
      Schema.decodeUnknownEffect(ListeningAddress)(server.address()),
      (cause) => new MathEntryFailure({ cause, step: "read the page's server's port" }),
    ).pipe(Effect.map(({ port }) => `http://127.0.0.1:${String(port)}/`)),
);

/**
 * Chrome, through the suites' one launcher (`#specimen/ui/chrome.ts`), its failures this harness's.
 */
const launched = chromeFor((step, cause) => new MathEntryFailure({ cause, step }));

/**
 * The machine's Google Chrome, headless, closed with its scope.
 */
const chrome = launched.browser;

/**
 * Wait in the page until it has painted twice since now, so what a key changed has been laid out.
 *
 * @returns The wait, in the page.
 */
const twoFrames = async (): Promise<void> => {
  const first = Promise.withResolvers<number>();

  requestAnimationFrame(first.resolve);
  await first.promise;
  const second = Promise.withResolvers<number>();

  requestAnimationFrame(second.resolve);
  await second.promise;
};

/**
 * How long MathLive's timers that follow a change of focus run, the longer of its two: a field that
 * takes focus finishes taking it and joins the virtual keyboard in a timer of 60 ms (`mathlive.mjs`
 * 0.105.3, `onFocus`), until which the keyboard's keys reach no field, and the keyboard hides
 * itself in a timer of 300 ms after a field loses focus unless another holds it by then
 * (`VirtualKeyboard`'s `focusout` listener). A timer of this delay set after the focus moved fires
 * after both, so the first key lands on a field that takes it and on a keyboard no late timer
 * hides, as every key of a child's does, a child being slower than this.
 *
 * @formatConstant
 */
const focusDelay = 300;

/**
 * Wait in the page for a timer of `delay` milliseconds set now to fire.
 *
 * @param delay The timer's delay.
 * @returns The wait, in the page.
 */
const timerFired = async (delay: number): Promise<void> => {
  const fired = Promise.withResolvers<number>();

  setTimeout(() => {
    fired.resolve(performance.now());
  }, delay);
  await fired.promise;
};

/**
 * Put a fresh field in the page, the keyboard hidden and the last field gone, set up by the setup's
 * own function, from its source, as the island sets it up.
 *
 * @param page The page.
 * @param setup The keyboard's setup.
 * @returns The field in the page.
 */
const placedField = (page: Page, setup: Setup): Effect.Effect<void, MathEntryFailure> =>
  attempt("put a fresh field in the page", () =>
    page.evaluate(
      `(async () => {
          await window.fieldReady;
          window.mathVirtualKeyboard.hide();
          document.querySelector("math-field")?.remove();
          const field = new window.MathfieldElement();
          field.id = "field";
          document.body.append(field);
          (${String(setup.setUp)})(field, window.mathVirtualKeyboard, ${JSON.stringify(setup.settings)}, ${JSON.stringify(setup.layout)});
        })()`,
    ),
  );

/**
 * Put a fresh field in the page ({@link placedField}) and focus it with a click as a child does,
 * waiting until it has joined the virtual keyboard and the last field's timers have run
 * ({@link focusDelay}). The sequence's first key of the keyboard shows the keyboard again.
 *
 * @param page The page.
 * @param setup The keyboard's setup.
 * @returns The field, ready for its first key.
 */
const freshField = (page: Page, setup: Setup): Effect.Effect<void, MathEntryFailure> =>
  Effect.andThen(
    placedField(page, setup),
    attempt("focused the field", async () => {
      await page.click("#field");
      await page.evaluate(timerFired, focusDelay);
    }),
  );

/**
 * Where a click on a key of the keyboard lands, its centre, or what stood there instead.
 */
type Aim = { readonly missed: string } | { readonly x: number; readonly y: number };

/**
 * How many frames a click on a key of the keyboard waits for the key to stand still under its own
 * centre, the keyboard done sliding and the key where it was a frame before: a hang guard and never
 * a budget, so a key that stays covered (a panel MathLive opened over it) fails its sequence,
 * naming what covered it, where an unbounded wait would hang the run.
 *
 * @limitKind hang-guard
 * @owner PLATE-MATHENTRY
 * @unit frames
 * @derivation a minute of frames at 60 a second; a laid-out key stands under its centre at once
 */
const aimFrames = 3600;

/**
 * Find, in the page, where a click on a key of the keyboard lands once the key stands still: the
 * keyboard laid out with its fonts, done sliding in (MathLive holds its `animate` class until the
 * slide's transition ends), the key's centre where it was a frame before, and the key the element
 * at its centre.
 *
 * @param input The key's place among the keyboard's keys, and how many frames to wait.
 * @param input.0 The key's place.
 * @param input.1 How many frames to wait ({@link aimFrames}).
 * @returns The key's centre, or what stood there when the frames ran out.
 */
const aimAt = async ([at, frames]: readonly [number, number]): Promise<Aim> => {
  const look = async (before: string, left: number): Promise<Aim> => {
    const painted = Promise.withResolvers<number>();

    requestAnimationFrame(painted.resolve);
    await painted.promise;
    const keycap = document.querySelectorAll(".MLK__keycap")[at];
    const box = keycap?.getBoundingClientRect();
    const x = box === undefined ? 0 : box.left + box.width / 2;
    const y = box === undefined ? 0 : box.top + box.height / 2;
    const now = `${String(x)} ${String(y)}`;
    const hit = document.elementFromPoint(x, y);
    const sliding = document.querySelector(".ML__keyboard")?.classList.contains("animate") ?? true;

    if (
      keycap !== undefined &&
      hit !== null &&
      keycap.contains(hit) &&
      now === before &&
      !sliding
    ) {
      return { x, y };
    }

    return left === 0
      ? { missed: hit?.outerHTML.slice(0, 200) ?? "nothing" }
      : await look(now, left - 1);
  };

  // Laying the keyboard out starts the loads of the fonts its keys show, so their readiness waits
  // for them.
  document.querySelector(".ML__keyboard")?.getBoundingClientRect();
  await document.fonts.ready;

  return await look("", frames);
};

/**
 * Show the virtual keyboard where it is hidden, as the field's keyboard toggle does. MathLive
 * slides it in, so its keys move for some frames after it shows: a click waits for its key to stand
 * still ({@link aimAt}).
 *
 * @param page The page.
 * @returns The show.
 */
const keyboardShown = (page: Page): Effect.Effect<void, MathEntryFailure> =>
  attempt("showed the virtual keyboard", async () => {
    const toggle = await page.evaluate(() => {
      const box = window.mathVirtualKeyboard.visible
        ? undefined
        : document
            .querySelector<MathfieldElement>("#field")
            ?.shadowRoot?.querySelector("[part=virtual-keyboard-toggle]")
            ?.getBoundingClientRect();

      return box === undefined
        ? undefined
        : { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    });

    if (toggle !== undefined) {
      await page.mouse.click(toggle.x, toggle.y);
      await page.evaluate(timerFired, focusDelay);
    }
  });

/**
 * Press one key on the focused field, as a child does.
 *
 * @param page The page.
 * @param setup The keyboard's setup, whose keys' names place a key of the keyboard.
 * @param pressedKey The key.
 * @returns The press; a failure for a key the keyboard has not, which no child can press.
 */
const press = (
  page: Page,
  setup: Setup,
  pressedKey: MathEntryKey,
): Effect.Effect<void, MathEntryFailure> => {
  if ("keycap" in pressedKey) {
    const step = `pressed the keyboard's ${pressedKey.keycap}`;
    const at = setup.names.indexOf(pressedKey.keycap);

    return at === -1
      ? Effect.fail(new MathEntryFailure({ cause: "the keyboard has no such key", step }))
      : keyboardShown(page).pipe(
          Effect.andThen(attempt(step, () => page.evaluate(aimAt, [at, aimFrames] as const))),
          Effect.flatMap((aim) =>
            "missed" in aim
              ? Effect.fail(
                  new MathEntryFailure({
                    cause: `its centre showed ${aim.missed} for ${String(aimFrames)} frames`,
                    step,
                  }),
                )
              : attempt(step, () => page.mouse.click(aim.x, aim.y)),
          ),
        );
  }

  if ("box" in pressedKey) {
    const { box } = pressedKey;

    return attempt(`tapped box ${String(box)}`, async () => {
      // MathLive draws a change on the next frame: the boxes stand where they are drawn once it has.
      await page.evaluate(twoFrames);
      const aim = await page.evaluate((at) => {
        const field = document.querySelector<MathfieldElement>("#field");
        const squares = [
          ...(field?.shadowRoot?.querySelectorAll(".ML__content [data-atom-id]") ?? []),
        ]
          .filter(
            (each) => each.children.length === 0 && each.textContent === field?.placeholderSymbol,
          )
          .map((each) => each.getBoundingClientRect())
          .toSorted((a, b) => Math.round(a.left) - Math.round(b.left) || a.top - b.top);
        const square = squares[at];

        return square === undefined
          ? undefined
          : { x: square.left + (square.width * 3) / 4, y: square.top + square.height / 2 };
      }, box);

      if (aim !== undefined) {
        await page.mouse.click(aim.x, aim.y);
      }
    });
  }

  if ("typed" in pressedKey) {
    const { typed } = pressedKey;

    return attempt(`typed ${typed}`, () => page.keyboard.press(usKeys.get(typed) ?? typed));
  }

  return attempt(`pressed ${pressedKey.pressed}`, () => page.keyboard.press(pressedKey.pressed));
};

/**
 * The field as a test or a grader drives it.
 */
export interface MathEntryField {
  /**
   * Press keys in order on a fresh field, set up as `setup` gives, and give the LaTeX it holds once
   * the last has landed: its `value`, which the island posts as the response.
   */
  readonly typed: (
    keys: readonly MathEntryKey[],
    setup: Setup,
  ) => Effect.Effect<string, MathEntryFailure>;
}

/**
 * Open a page driving one field. Keys go to one field at a time, so a caller that types many
 * sequences at once opens several ({@link mathEntryFields}).
 *
 * @param browser The Chrome it opens in.
 * @param url The page's address.
 * @returns The field, its page closed with the scope.
 */
const fieldIn = (
  browser: Browser,
  url: string,
): Effect.Effect<MathEntryField, MathEntryFailure, Scope.Scope> =>
  Effect.map(
    Effect.tap(launched.pageOf(browser, { reducedMotion: "reduce" }), (page) =>
      attempt("opened the page", () => page.goto(url)),
    ),
    (page): MathEntryField => ({
      typed: (keys, setup) =>
        Effect.gen(function* typed() {
          yield* freshField(page, setup);
          yield* Effect.forEach(keys, (each) => press(page, setup, each), { discard: true });
          yield* attempt("waited for the page to paint", () => page.evaluate(twoFrames));

          return yield* attempt("read the field's value", () =>
            page.evaluate(() => document.querySelector<MathfieldElement>("#field")?.value ?? ""),
          );
        }),
    }),
  );

/**
 * Open Chrome and the page's server, and give `count` fields, each in a page of its own, all closed
 * with the scope.
 *
 * @param count How many fields: one per sequence typed at once, and one at least, the first, where
 *   it is below one.
 * @returns The fields, each set up afresh as each sequence it types asks
 *   ({@link MathEntryField.typed}).
 */
export const mathEntryFields = (
  count: number,
): Effect.Effect<Arr.NonEmptyReadonlyArray<MathEntryField>, MathEntryFailure, Scope.Scope> =>
  Effect.gen(function* fields() {
    const url = yield* pageServer;
    const browser = yield* chrome;

    const urls: Arr.NonEmptyReadonlyArray<string> = [
      url,
      ...Array.from({ length: count - 1 }, () => url),
    ];

    return yield* Effect.forEach(urls, (at) => fieldIn(browser, at), {
      concurrency: "unbounded",
    });
  });

/**
 * Type many key sequences at once, each on a fresh field, the fields sharing the sequences out in
 * turn and each typing its share one after another.
 *
 * @param fields The fields, each in a page of its own ({@link mathEntryFields}).
 * @param sequences The key sequences.
 * @param setup What each field is set up with ({@link setupOf}).
 * @returns The LaTeX each sequence leaves, or why it could not be typed (a key the keyboard has
 *   not), in the sequences' order: one sequence's failure leaves the others typed.
 */
export const typedAll = (
  fields: Arr.NonEmptyReadonlyArray<MathEntryField>,
  sequences: readonly (readonly MathEntryKey[])[],
  setup: Setup,
): Effect.Effect<readonly Result.Result<string, MathEntryFailure>[]> =>
  Effect.map(
    Effect.forEach(
      fields,
      (field, share) =>
        Effect.forEach(
          sequences.flatMap((keys, at) =>
            at % fields.length === share ? [[at, keys] as const] : [],
          ),
          ([at, keys]) =>
            Effect.map(Effect.result(field.typed(keys, setup)), (latex) => [at, latex] as const),
        ),
      { concurrency: "unbounded" },
    ),
    (shares) =>
      shares
        .flat()
        .toSorted(([a], [b]) => a - b)
        .map(([, latex]) => latex),
  );

declare global {
  interface Window {
    /**
     * Resolves once MathLive has defined `math-field` in the page.
     */
    readonly fieldReady: Promise<unknown>;
  }
}
