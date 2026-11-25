/**
 * Alpha's math entry held to AlphaTest's: the field a Text Entry marked `alpha-math-entry` is
 * answered in (`@qti-pie/plate/alpha/math-entry`), driven in headless Google Chrome as a child
 * drives it (`#specimen/alpha/math-entry.ts`), against AlphaTest's player (mastery-track-player at
 * 941a86a) written down here by hand from its source, never from plate's code, and against the
 * fates edullm-bd ruled on 2026-11-22.
 *
 * The rules:
 *
 * - ME1, every key alone: each key of plate's keyboard pressed on an empty field posts the LaTeX
 *   AlphaTest's same key wrote, its template's squares MathLive's boxes (`\placeholder{}`) where a
 *   fate made them boxes; the added degree and theta keys post `\degree` and `\theta`, and the keys
 *   that move or delete post nothing on an empty field.
 * - ME2, the mom test: each template key, its boxes filled by tapping each and typing digits, posts
 *   what AlphaTest's player's field posted when the child tapped after each square, deleted it and
 *   typed the same digits in its place: filling the boxes of a fraction gives that fraction.
 * - ME3, parity: any key sequence over the keys plate kept as AlphaTest had them (every keyboard key
 *   but the nine template keys and the two added ones, every typed character but the space, and
 *   every key that types nothing) posts on plate's field what it posts on AlphaTest's player's.
 * - ME4, the thin space and the template's place: a mixed number typed `2 1/2` posts `2\,\frac12`,
 *   and the fraction key after a 3 makes an empty fraction beside it, the 3 left whole.
 * - ME5, a key's own work: ME1 and ME4 post the same in a page whose `Math.random` draws one number
 *   every time, where MathLive alone would name keys alike and run one key's command for
 *   another's.
 *
 * Its kills, each a slip planted in plate's field as the page sets it up, which ME1, ME4 and
 * ME3's kept sequences catch: smart fences off, smart superscripts on, MathLive's inline shortcuts
 * back, the thin space dropped, a template key's squares back, a template that takes the number
 * before the caret, a key's LaTeX changed, the degree key gone, and scripts nested one deep.
 *
 * @module
 */
import { availableParallelism } from "node:os";
import { assert, layer } from "@effect/vitest";
import { exhaust, explore, drawn } from "@bjornpagen/testing/explore";
import { noCoverage, requiredInSpace } from "@bjornpagen/testing/features";
import { array, element, int, map, oneOf } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { boundedShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Context, Duration, Effect, Layer, Queue, Result } from "effect";
import type { MathfieldElement, VirtualKeyboardInterface, VirtualKeyboardLayout } from "mathlive";
import {
  mathEntryFields,
  namesOf,
  pressedKeys,
  setupOf,
  typedAll,
  typedCharacters,
} from "#specimen/alpha/math-entry.ts";
import type {
  MathEntryFailure,
  MathEntryField,
  MathEntryKey,
  Setup,
} from "#specimen/alpha/math-entry.ts";

/**
 * How long one rule may run before vitest stops it: a hang guard, never a budget. Each rule drives
 * Chrome for every case it checks, on a machine that runs many suites at once.
 */
const ruleHang = 1_200_000;

/**
 * How many fields a rule drives at once: one per core, each in a page of its own.
 */
const fieldCount = availableParallelism();

/**
 * AlphaTest's player's math field, as `NumericEntry.tsx` set it (lines 1067–1098 and 1852–1877):
 * smart fences on, smart mode and smart superscripts off, the placeholder symbol `▢`, scripts at
 * most four deep, no inline shortcuts and no menu, and a typed space MathLive's default, nothing.
 */
const alphaTestSettings: Setup["settings"] = {
  inlineShortcuts: {},
  mathModeSpace: "",
  menuItems: [],
  placeholderSymbol: "▢",
  scriptDepth: 4,
  smartFence: true,
  smartMode: false,
  smartSuperscript: false,
};

/**
 * AlphaTest's virtual keyboard's keys, row by row, as `NumericEntry.tsx` wrote them (lines
 * 1120–1173), each key's `latex` as its source spells it.
 */
const alphaTestKeys = [
  [{ latex: "1" }, { latex: "2" }, { latex: "3" }, { latex: "+" }, { latex: "<" }, { latex: ">" }],
  [
    { latex: "4" },
    { latex: "5" },
    { latex: "6" },
    { latex: "-" },
    { latex: "\\frac{▢}{▢}" },
    { latex: "▢\\frac{▢}{▢}" },
  ],
  [
    { latex: "7" },
    { latex: "8" },
    { latex: "9" },
    { latex: "\\times" },
    { latex: "(▢)" },
    { latex: "▢^{▢}" },
  ],
  [
    { latex: "0" },
    { latex: "." },
    { latex: "=" },
    { latex: "\\div" },
    { latex: "[▢]" },
    { latex: "\\sqrt{▢}" },
  ],
  [
    { latex: "x" },
    { latex: "y" },
    { latex: "\\mid▢\\mid" },
    { latex: "▢^{\\frac{▢}{▢}}" },
    { latex: "(▢)^{\\frac{▢}{▢}}" },
    { latex: "\\leq" },
  ],
  [
    { latex: "," },
    { latex: "/" },
    { latex: "\\pm" },
    { latex: "\\pi" },
    { latex: "\\infty" },
    { latex: "\\geq" },
  ],
  [
    { class: ".digit", label: "[hide-keyboard]", width: 1 },
    { class: ".digit", label: "[left]", width: 2 },
    { class: ".digit", label: "[right]", width: 2 },
    { class: ".digit", label: "[backspace]", width: 1 },
  ],
] as const;

/**
 * AlphaTest's one layout, as `NumericEntry.tsx` gave `mathVirtualKeyboard.layouts` (lines
 * 1111–1176).
 */
const alphaTestLayout: VirtualKeyboardLayout = {
  label: "calculator",
  layers: [
    {
      rows: alphaTestKeys.map((row) => [...row]),
      style: ".digit { background: var(--keycap-background); color: var(--keycap-text) }",
    },
  ],
  tooltip: "Calculator layout",
};

/**
 * Set a field up as AlphaTest's player did once the field stood in the page: each option in the
 * order `NumericEntry.tsx` assigns it (lines 1852–1877), then the keyboard's layout.
 *
 * @param field The field.
 * @param keyboard The page's keyboard.
 * @param settings The options.
 * @param layout The layout.
 */
const alphaTestSetUp = (
  field: MathfieldElement,
  keyboard: VirtualKeyboardInterface,
  settings: Setup["settings"],
  layout: VirtualKeyboardLayout,
): void => {
  field.smartFence = settings.smartFence;
  field.smartMode = settings.smartMode;
  field.smartSuperscript = settings.smartSuperscript;
  field.placeholderSymbol = settings.placeholderSymbol;
  field.scriptDepth = settings.scriptDepth;
  field.inlineShortcuts = settings.inlineShortcuts;
  field.mathModeSpace = settings.mathModeSpace;
  field.menuItems = settings.menuItems;
  keyboard.layouts = [layout];
};

/**
 * AlphaTest's player's field, as written down here.
 */
const alphaTestPlayer: Setup = {
  layout: alphaTestLayout,
  names: namesOf(alphaTestKeys),
  setUp: alphaTestSetUp,
  settings: alphaTestSettings,
};

/**
 * AlphaTest's keys whose template held squares, each by its `latex`: the keys the fates changed.
 */
const templateKeys: readonly string[] = alphaTestKeys
  .flat()
  .flatMap((key) => ("latex" in key && key.latex.includes("▢") ? [key.latex] : []));

/**
 * The keys plate added, by their `latex`.
 */
const addedKeys: readonly string[] = [String.raw`\degree`, String.raw`\theta`];

/**
 * The keys that move the caret, delete or hide the keyboard: on an empty field they post nothing.
 */
const shortcutKeys: ReadonlySet<string> = new Set([
  "[hide-keyboard]",
  "[left]",
  "[right]",
  "[backspace]",
]);

/**
 * What a key of plate's keyboard posts pressed alone on an empty field (ME1): AlphaTest's latex,
 * each square a box where the key is a template key; the added keys their own LaTeX; a shortcut key
 * nothing.
 *
 * @param keycap The key, by its name.
 * @returns The LaTeX.
 */
const aloneOf = (keycap: string): string => {
  if (shortcutKeys.has(keycap)) {
    return "";
  }

  return keycap.replaceAll("▢", "\\placeholder{}");
};

/**
 * Every key of plate's keyboard, by its name: AlphaTest's, then the added ones.
 */
const plateKeycaps: readonly string[] = [
  ...alphaTestKeys.flat().map((key) => ("latex" in key ? key.latex : key.label)),
  ...addedKeys,
];

/**
 * Borrow a field of a pool for one use, giving it back after.
 */
type Borrow = <A, E>(use: (field: MathEntryField) => Effect.Effect<A, E>) => Effect.Effect<A, E>;

/**
 * Hold a set of fields as a pool, each case borrowing one, so cases run at once on fields of their
 * own.
 *
 * @param fields The fields.
 * @returns Borrow a field for one use.
 */
const poolOf = (fields: Arr.NonEmptyReadonlyArray<MathEntryField>): Effect.Effect<Borrow> =>
  Effect.map(Queue.unbounded<MathEntryField>(), (queue) => {
    Queue.offerAllUnsafe(queue, fields);

    return (use) =>
      Effect.acquireUseRelease(Queue.take(queue), use, (field) => Queue.offer(queue, field));
  });

/**
 * A template key with what a child fills its boxes with, in the order a reader meets them.
 */
interface Filling {
  readonly fills: readonly string[];
  readonly keycap: string;
}

/**
 * The keys a child presses to fill a template key's boxes on plate's field: the key, then for each
 * box a tap on the first box left and the box's digits.
 *
 * @param filling The key and its fills.
 * @returns The keys.
 */
const filledOnPlate = ({ fills, keycap }: Filling): readonly MathEntryKey[] => [
  { keycap },
  ...fills.flatMap((fill): readonly MathEntryKey[] => [
    { box: 0 },
    ...fill.split("").map((typed): MathEntryKey => ({ typed })),
  ]),
];

/**
 * The keys a child pressed to fill AlphaTest's template on its field: the key, then for each square
 * a tap after the first square left, a Backspace that deletes it, and the box's digits, as a child
 * did once the squares were characters.
 *
 * @param filling The key and its fills.
 * @returns The keys.
 */
const filledOnAlphaTest = ({ fills, keycap }: Filling): readonly MathEntryKey[] => [
  { keycap },
  ...fills.flatMap((fill): readonly MathEntryKey[] => [
    { box: 0 },
    { pressed: "Backspace" },
    ...fill.split("").map((typed): MathEntryKey => ({ typed })),
  ]),
];

/**
 * The keys plate kept as AlphaTest had them (ME3): every keyboard key but the template keys, every
 * typed character but the space, and every key that types nothing.
 */
const keptKeycaps = plateKeycaps.filter(
  (keycap) => !templateKeys.includes(keycap) && !addedKeys.includes(keycap),
);

/**
 * The characters plate types as AlphaTest typed them: every printable ASCII character but the
 * space, which plate types as a thin space.
 */
const keptCharacters = Arr.match(
  typedCharacters.filter((each) => each !== " "),
  {
    onEmpty: () => typedCharacters,
    onNonEmpty: (kept) => kept,
  },
);

/**
 * The names of {@link keptKeycaps}, of which there are always some: the digits are among them.
 */
const keptNames = Arr.match(keptKeycaps, {
  onEmpty: () => typedCharacters,
  onNonEmpty: (kept) => kept,
});

/**
 * Draw a key over the keys plate kept.
 */
const keptKey: Gen<MathEntryKey> = oneOf([
  map(element(keptNames), (keycap): MathEntryKey => ({ keycap })),
  map(element(keptCharacters), (typed): MathEntryKey => ({ typed })),
  map(element(pressedKeys), (pressed): MathEntryKey => ({ pressed })),
]);

/**
 * Draw a key sequence over the keys plate kept, up to a dozen keys.
 */
const keptSequence: Gen<readonly MathEntryKey[]> = array(keptKey, { max: 12, min: 1 });

/**
 * Print a key sequence as source a kept case pastes.
 *
 * @param keys The keys.
 * @returns The JSON of the keys.
 */
const literalOf = (keys: readonly MathEntryKey[]): string => JSON.stringify(keys);

/**
 * Give the LaTeX a sequence posted, or why it was not typed, as text a disagreement names.
 *
 * @param typed What typing the sequence gave.
 * @returns The LaTeX, or the failure's message.
 */
const postedOf = (typed: Result.Result<string, MathEntryFailure> | undefined): string =>
  typed === undefined
    ? "not typed"
    : Result.match(typed, {
        onFailure: (failure) => `failed: ${failure.message}`,
        onSuccess: (latex) => latex,
      });

/**
 * The facts of ME4: a key sequence and the LaTeX plate's field posts for it.
 */
const facts: readonly (readonly [keys: readonly MathEntryKey[], latex: string])[] = [
  [
    [{ typed: "2" }, { typed: " " }, { typed: "1" }, { typed: "/" }, { typed: "2" }],
    "2\\,\\frac12",
  ],
  [[{ keycap: "3" }, { keycap: "\\frac{▢}{▢}" }], "3\\frac{\\placeholder{}}{\\placeholder{}}"],
];

/**
 * The cases of ME1 and ME4: each key alone and each fact, with the LaTeX each must post.
 */
const aloneCases: readonly (readonly [readonly MathEntryKey[], string])[] = [
  ...plateKeycaps.map((keycap) => [[{ keycap }], aloneOf(keycap)] as const),
  ...facts,
];

/**
 * Check ME1 and ME4 on a field set up some way: each key alone, then the facts, all at once over
 * the fields.
 *
 * @param fields The fields.
 * @returns Each disagreement, as `keys: posted, expected`.
 */
const aloneAndFacts = (
  fields: Arr.NonEmptyReadonlyArray<MathEntryField>,
  setup: Setup,
): Effect.Effect<readonly string[]> => {
  const cases = aloneCases;

  return Effect.map(
    typedAll(
      fields,
      cases.map(([keys]) => keys),
      setup,
    ),
    (posted) =>
      cases.flatMap(([keys, expected], at) => {
        const got = postedOf(posted[at]);

        return got === expected ? [] : [`${literalOf(keys)}: ${got}, expected ${expected}`];
      }),
  );
};

/**
 * The parity sequences a kill is checked on beside ME1 and ME4: a typed parenthesis and bar, a
 * superscript typed on, a typed word, and scripts nested.
 */
const paritySequences: readonly (readonly MathEntryKey[])[] = [
  [{ typed: "(" }, { typed: "1" }],
  [{ typed: "|" }, { typed: "x" }],
  [{ typed: "x" }, { typed: "^" }, { typed: "2" }, { typed: "+" }, { typed: "1" }],
  [{ typed: "p" }, { typed: "i" }],
  [{ typed: "x" }, { typed: "^" }, { typed: "2" }, { typed: "^" }, { typed: "3" }],
];

/**
 * Plate's `setUpField` in a page whose `Math.random` draws one number from then on, as MathLive's
 * draw did for two keys whenever it named them alike: every assignment of `setUpField`'s, written
 * here, since a page runs a setup's function from its own source. ME5 opens pages of its own for
 * it, so no other rule's page draws so.
 *
 * @param field The field.
 * @param keyboard The page's keyboard.
 * @param settings The options.
 * @param layout The layout.
 */
const drawingAlike = (
  field: MathfieldElement,
  keyboard: VirtualKeyboardInterface,
  settings: Setup["settings"],
  layout: VirtualKeyboardLayout,
): void => {
  Math.random = () => 0.5;
  field.smartFence = settings.smartFence;
  field.smartMode = settings.smartMode;
  field.smartSuperscript = settings.smartSuperscript;
  field.placeholderSymbol = settings.placeholderSymbol;
  field.scriptDepth = settings.scriptDepth;
  field.inlineShortcuts = settings.inlineShortcuts;
  field.mathModeSpace = settings.mathModeSpace;
  field.menuItems = settings.menuItems;
  keyboard.layouts = [layout];
};

/**
 * The fields the rules drive, one per core, each in a page of its own, held for the whole file and
 * set up afresh for every sequence as a rule asks: plate's, AlphaTest's player's, or a kill's.
 */
class Fields extends Context.Service<
  Fields,
  { readonly all: Arr.NonEmptyReadonlyArray<MathEntryField>; readonly borrow: Borrow }
>()("specimen/alpha/math-entry.test/Fields") {}

/**
 * Open {@link Fields}, closed when the file ends.
 */
const FieldsLayer = Layer.effect(
  Fields,
  Effect.gen(function* openFields() {
    const all = yield* Effect.orDie(mathEntryFields(fieldCount));

    return { all, borrow: yield* poolOf(all) };
  }),
);

/**
 * Plate's field, as the island sets it up.
 */
const plateField = setupOf("plate");

layer(FieldsLayer, { timeout: Duration.millis(ruleHang) })("plate's math entry", (it) => {
  it.effect(
    "ME1 and ME4: every key alone, and the thin space and the template's place",
    () =>
      Effect.gen(function* aloneRule() {
        const { all } = yield* Fields;
        const disagreements = yield* aloneAndFacts(all, plateField);

        assert.deepStrictEqual(
          disagreements,
          [],
          "each key and fact posts what AlphaTest's key and the fates give",
        );
      }),
    ruleHang,
  );

  it.effect(
    "ME2: filling a template key's boxes posts what AlphaTest posted once its squares were filled",
    (ctx) =>
      Effect.gen(function* fillRule() {
        const { borrow } = yield* Fields;
        const keycaps = Arr.isReadonlyArrayNonEmpty(templateKeys)
          ? templateKeys
          : assert.fail("AlphaTest's keyboard has template keys");
        /**
         * A template key, every box filled with one numeral of one to three digits, the first
         * nonzero digits in order (1, 12, 123), so a box that drops or reorders a digit shows it.
         */
        const filledKey: Gen<Filling> = (source) => {
          const keycap = source.draw(element(keycaps));
          const fill = Array.from({ length: source.draw(int(1, 3)) }, (_, at) =>
            String(at + 1),
          ).join("");

          return {
            fills: keycap
              .split("")
              .filter((each) => each === "▢")
              .map(() => fill),
            keycap,
          };
        };

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "each of AlphaTest's nine template keys, every box filled with a numeral of one, two or three digits",
              caseHang: Duration.minutes(5),
              concurrency: fieldCount,
              coverage: requiredInSpace<"filled">(["filled"]),
              generator: filledKey,
              literal: (filling) => JSON.stringify(filling),
              oracle: {
                kind: "second-implementation",
                name: "AlphaTest's player's field (NumericEntry.tsx lines 1067–1176), each square of its template deleted and filled by keys",
              },
              suite: "plate-ui/math-entry-fill",
            },
            (filling, c) =>
              Effect.gen(function* filled() {
                c.note("filled");

                const posted = yield* borrow((field) =>
                  Effect.orDie(field.typed(filledOnPlate(filling), plateField)),
                );
                const expected = yield* borrow((field) =>
                  Effect.orDie(field.typed(filledOnAlphaTest(filling), alphaTestPlayer)),
                );

                assert.strictEqual(
                  posted,
                  expected,
                  `${filling.keycap} filled with ${filling.fills.join(", ")}`,
                );
              }),
          ),
        );
      }),
    ruleHang,
  );

  it.effect(
    "ME3: every key plate kept types the same LaTeX on plate's field and AlphaTest's player's",
    (ctx) =>
      Effect.gen(function* parityRule() {
        const { all, borrow } = yield* Fields;
        const keptOnPlate = yield* typedAll(all, paritySequences, plateField);
        const keptOnAlphaTest = yield* typedAll(all, paritySequences, alphaTestPlayer);

        assert.deepStrictEqual(
          keptOnPlate.map(postedOf),
          keptOnAlphaTest.map(postedOf),
          "the kept sequences type the same on both fields",
        );

        return yield* searched(
          ctx,
          explore(
            {
              caseHang: Duration.minutes(5),
              concurrency: fieldCount,
              coverage: noCoverage,
              draw: drawn(keptSequence),
              kept: [],
              literal: literalOf,
              oracle: {
                kind: "second-implementation",
                name: "AlphaTest's player's field (NumericEntry.tsx lines 1067–1176), set up from this file's transcription",
              },
              runs: fieldCount,
              shrink: boundedShrink(64),
              steerEvery: 16,
              suite: "plate-ui/math-entry-parity",
            },
            (keys) =>
              Effect.gen(function* parity() {
                const posted = yield* borrow((field) =>
                  Effect.orDie(field.typed(keys, plateField)),
                );
                const expected = yield* borrow((field) =>
                  Effect.orDie(field.typed(keys, alphaTestPlayer)),
                );

                assert.strictEqual(posted, expected, literalOf(keys));
              }),
          ),
        );
      }),
    ruleHang,
  );

  it.effect(
    "ME5: every key alone, and the thin space and the template's place, post the same where every draw of Math.random is one number",
    () =>
      Effect.scoped(
        Effect.gen(function* drawnAlikeRule() {
          const fields = yield* Effect.orDie(mathEntryFields(fieldCount));
          const disagreements = yield* aloneAndFacts(fields, {
            ...plateField,
            setUp: drawingAlike,
          });

          assert.deepStrictEqual(
            disagreements,
            [],
            "each key does its own work, however MathLive's draws fall",
          );
        }),
      ),
    ruleHang,
  );
});
