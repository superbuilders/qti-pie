/**
 * The shade-parts PCI (`urn:fdc:alpha.school:2026:shade-parts`) held to the assessment lead's
 * specification of the Grade 3 fraction items, on the suite's synthetic items (one per figure:
 * rectangles cut vertically and horizontally into 2, 3, 4, 6 and 8 parts, a grid of two rows of
 * four, circles in 2, 3, 4, 6 and 8 parts, sets of 3, 4, 6 and 8 beads, one picture of our own
 * drawing, and the equivalence form's stacked models), each read from the package's fixture
 * `fixtures/alpha/shade-parts/` and run with plate's module file in plate's own PCI frame in
 * headless Google Chrome, its parts tapped with the pointer (`#specimen/alpha/shade-parts.ts`). The
 * rules are written here from the specification (the tap-to-shade type and its equivalence form: a
 * rectangle or circle cut into b equal parts, or a set of b like objects, none shaded and each part
 * tappable; a tap shades a part and a second tap clears it; the shape and nothing else on screen;
 * scored on how many parts are shaded, whichever they are; for the equivalence form, the first
 * fraction's model shaded with the same whole beneath it at the same size, cut for the new
 * denominator, unshaded, its cuts in line with the first's), never from the PCI's code:
 *
 * - SP0, before the module runs: the frame shows its markup while the module loads: nothing for a
 *   rectangle or a circle, whose markup is empty, and the object's one picture for a set.
 * - SP1, the screen: exactly b tappable parts, equal in area, none shaded (white, outlined `#333` at
 *   3 px), each holding a 44 px disc a tap lands on (WCAG 2.2's Target Size, Enhanced), laid out as
 *   the figure says, and no text at all: no count, no "0 parts shaded" line, no numeral. A shown
 *   model is a picture above, of the same width and left edge, its first parts shaded and none
 *   tappable.
 * - SP2, shading: a tapped part is shaded (`#4aa3df`) and pressed; a second tap clears it.
 * - SP3, the response: the number of parts shaded at submit, the Appendix C JSON `{ base: { integer:
 *   n } }`, NULL `{ base: null }` when none is (owner's ruling Q6); the last change the frame
 *   relays is the response the PCI completes with.
 * - SP4, the golden responses: for every item, the correct count in two different sets of parts
 *   (scored on the count, not the place), the complement, every part, one too many corrected by a
 *   second tap, every part shaded then cleared, and nothing tapped. Each response is scored as
 *   `match_correct` scores it against the item's key, read from its fixture: 1 for the correct
 *   count in any parts and for one too many corrected, 0 for every other.
 * - SP5, coming back: bound to a count, the PCI shades that many parts, the first by place, and gives
 *   that count back; bound to NULL it shades none; handed a state alone, exactly the state's parts;
 *   handed both, the stored response decides (the state kept only where it shades as many).
 * - SP6, refusals: an item whose figure or partition the PCI cannot read fails to run rather than
 *   drawing a guess.
 * - SP7, the keyboard: each part is a tab stop, and Space or Enter toggles the focused part, once
 *   however long it is held, and not at all with Alt, Control or Meta.
 * - SP8, review: a PCI not interacting takes no tap, and its parts are no tab stops.
 * - SP9, a swipe: the model takes every touch that starts on it as the child's (its `svg`'s computed
 *   `touch-action` is `none`, where the browser reads it, and each part's is too), so a finger's
 *   swipe sideways from a part, either way, shades nothing, changes no response and takes the host
 *   page nowhere: it navigates to no address, and its address and history stand as they were.
 *
 * @module
 */
import { assert, layer } from "@effect/vitest";
import { Context, Duration, Effect, Layer } from "effect";
import { shadeItem, shadePage } from "#specimen/alpha/shade-parts.ts";
import type {
  Drawn,
  FrameMessage,
  ShadeItem,
  ShadePage,
  Start,
} from "#specimen/alpha/shade-parts.ts";

/**
 * How long a rule may take before vitest fails it bare: a hang guard, never a budget.
 */
const ruleHang = 600_000;

/**
 * The parts' colours, as the browser computes them: a clear part's white, a shaded
 * part's `#4aa3df`, and the outline's `#333`.
 */
const colours = {
  clear: "rgb(255, 255, 255)",
  outline: "rgb(51, 51, 51)",
  shaded: "rgb(74, 163, 223)",
} as const;

/**
 * The object every set fixture pictures, as its picture's `alt` names it.
 */
const setObject = "bead";

/**
 * The outline's width, in CSS pixels: a disc's ring lies outside the fill a tap is measured on.
 */
const outline = 3;

/**
 * The smallest disc's radius every part holds, in CSS pixels: half of WCAG 2.2's 44 px.
 */
const targetRadius = 22;

/**
 * How one item's figure is cut, from its item: a rectangle's rows and columns, a circle's
 * sectors, or a set's objects in rows of `perRow`.
 */
type Figure =
  | { readonly kind: "circle"; readonly parts: number }
  | { readonly columns: number; readonly kind: "rectangle"; readonly rows: number }
  | { readonly kind: "set"; readonly parts: number; readonly perRow: number };

/**
 * One synthetic item: its name in the fixture, its figure, the count its key accepts
 * (`qti-correct-response`), and its shown model's parts and shaded parts, for the equivalence form.
 */
interface Golden {
  readonly correct: number;
  readonly figure: Figure;
  readonly name: string;
  readonly shown?: { readonly parts: number; readonly shaded: number };
}

/**
 * A rectangle of `rows` by `columns`.
 *
 * @param rows Its rows.
 * @param columns Its columns.
 * @returns The figure.
 */
const rectangle = (rows: number, columns: number): Figure => ({ columns, kind: "rectangle", rows });

/**
 * The suite's items, from their items.
 */
const goldens: readonly Golden[] = [
  { correct: 1, figure: rectangle(1, 2), name: "rectangle-vertical-2" },
  { correct: 2, figure: rectangle(1, 3), name: "rectangle-vertical-3" },
  { correct: 1, figure: rectangle(1, 4), name: "rectangle-vertical-4" },
  { correct: 5, figure: rectangle(1, 6), name: "rectangle-vertical-6" },
  { correct: 3, figure: rectangle(1, 8), name: "rectangle-vertical-8" },
  { correct: 1, figure: rectangle(2, 1), name: "rectangle-horizontal-2" },
  { correct: 1, figure: rectangle(3, 1), name: "rectangle-horizontal-3" },
  { correct: 1, figure: rectangle(4, 1), name: "rectangle-horizontal-4" },
  { correct: 5, figure: rectangle(6, 1), name: "rectangle-horizontal-6" },
  { correct: 5, figure: rectangle(8, 1), name: "rectangle-horizontal-8" },
  { correct: 5, figure: rectangle(2, 4), name: "rectangle-grid-2x4" },
  { correct: 1, figure: { kind: "circle", parts: 2 }, name: "circle-2" },
  { correct: 1, figure: { kind: "circle", parts: 3 }, name: "circle-3" },
  { correct: 2, figure: { kind: "circle", parts: 4 }, name: "circle-4" },
  { correct: 5, figure: { kind: "circle", parts: 6 }, name: "circle-6" },
  { correct: 3, figure: { kind: "circle", parts: 8 }, name: "circle-8" },
  { correct: 2, figure: { kind: "set", parts: 3, perRow: 3 }, name: "set-3" },
  { correct: 1, figure: { kind: "set", parts: 4, perRow: 4 }, name: "set-4" },
  { correct: 4, figure: { kind: "set", parts: 6, perRow: 3 }, name: "set-6" },
  { correct: 5, figure: { kind: "set", parts: 8, perRow: 4 }, name: "set-8" },
  {
    correct: 6,
    figure: rectangle(1, 8),
    name: "equivalent-rectangle-fourths-eighths",
    shown: { parts: 4, shaded: 3 },
  },
  {
    correct: 3,
    figure: rectangle(1, 6),
    name: "equivalent-rectangle-halves-sixths",
    shown: { parts: 2, shaded: 1 },
  },
  {
    correct: 4,
    figure: { kind: "circle", parts: 8 },
    name: "equivalent-circle-halves-eighths",
    shown: { parts: 2, shaded: 1 },
  },
];

/**
 * Give a figure's number of parts.
 *
 * @param figure The figure.
 * @returns Its parts.
 */
const partsOf = (figure: Figure): number =>
  figure.kind === "rectangle" ? figure.rows * figure.columns : figure.parts;

/**
 * One scripted response: its name, the parts tapped in order by their place, and the count left
 * shaded, absent for none.
 */
interface Scripted {
  readonly name: string;
  /**
   * Whether the response is right: the correct count, in any parts.
   */
  readonly right: boolean;
  readonly shaded?: number;
  readonly taps: readonly number[];
}

/**
 * Give an item's scripted responses: SP4's table.
 *
 * @param golden The item.
 * @returns Its scripted responses.
 */
const scriptsOf = (golden: Golden): readonly Scripted[] => {
  const parts = partsOf(golden.figure);
  const all = Array.from({ length: parts }, (_unused, index) => index);
  const over = all.slice(0, Math.min(golden.correct + 1, parts));

  return [
    { name: "nothing tapped", right: false, taps: [] },
    {
      name: "the correct count, the first parts",
      right: true,
      shaded: golden.correct,
      taps: all.slice(0, golden.correct),
    },
    {
      name: "the correct count, the last parts",
      right: true,
      shaded: golden.correct,
      taps: all.slice(parts - golden.correct).toReversed(),
    },
    ...(parts - golden.correct === golden.correct
      ? []
      : [
          {
            name: "the complement",
            right: false,
            shaded: parts - golden.correct,
            taps: all.slice(golden.correct),
          },
        ]),
    { name: "every part", right: golden.correct === parts, shaded: parts, taps: all },
    ...(golden.correct + 1 <= parts
      ? [
          {
            name: "one too many, then one cleared",
            right: true,
            shaded: golden.correct,
            taps: [...over, over.at(-1) ?? 0],
          },
        ]
      : []),
    { name: "every part shaded then cleared", right: false, taps: [...all, ...all] },
  ];
};

/**
 * The Appendix C JSON of a count left shaded, NULL for none (SP3).
 *
 * @param shaded The count, absent for none.
 * @returns The JSON.
 */
const responseOf = (shaded?: number) =>
  shaded === undefined ? { base: null } : { base: { integer: shaded } };

/**
 * Give the parts a tap sequence leaves shaded: each tap shades a part or clears it.
 *
 * @param taps The places tapped, in order.
 * @returns The places left shaded.
 */
const shadedBy = (taps: readonly number[]): ReadonlySet<number> => {
  const shaded = new Set<number>();

  for (const tap of taps) {
    if (shaded.has(tap)) {
      shaded.delete(tap);
    } else {
      shaded.add(tap);
    }
  }

  return shaded;
};

/**
 * Round a pixel measure to a whole pixel.
 *
 * @param pixels The measure.
 * @returns It, rounded.
 */
const whole = (pixels: number): number => Math.round(pixels);

/**
 * Check the shown model against SP1: none for an item with no shown model; else a picture above the
 * model the child shades, of the same width and left edge, its first parts shaded, none tappable.
 *
 * @param golden The item.
 * @param drawn What the frame shows.
 */
const holdsShown = (golden: Golden, drawn: Drawn): void => {
  const { name } = golden;

  if (golden.shown === undefined) {
    assert.isUndefined(drawn.shown, `${name} shows one model`);

    return;
  }

  const { shown } = drawn;

  assert.isDefined(shown, `${name} shows a model above`);
  assert.strictEqual(shown?.role, "img", `${name}'s shown model is a picture`);
  assert.strictEqual(
    shown?.label,
    `a ${golden.figure.kind} in ${String(golden.shown.parts)} equal parts, ${String(golden.shown.shaded)} shaded`,
    `${name}'s shown model is named for its parts and those shaded`,
  );
  assert.strictEqual(drawn.shownTappable, 0, `${name}'s shown model has no tappable part`);
  assert.deepStrictEqual(
    drawn.shownFills,
    Array.from({ length: golden.shown.parts }, (_unused, index) =>
      index < (golden.shown?.shaded ?? 0) ? colours.shaded : colours.clear,
    ),
    `${name}'s shown model has its first ${String(golden.shown.shaded)} of ${String(golden.shown.parts)} parts shaded`,
  );
  assert.strictEqual(
    whole(shown?.box.width ?? 0),
    whole(drawn.model?.box.width ?? -1),
    `${name}'s models are the same width`,
  );
  assert.strictEqual(
    whole(shown?.box.x ?? 0),
    whole(drawn.model?.box.x ?? -1),
    `${name}'s models are aligned`,
  );
  assert.isBelow(
    (shown?.box.y ?? 0) + (shown?.box.height ?? 0),
    drawn.model?.box.y ?? 0,
    `${name}'s shown model stands above the one the child shades`,
  );
};

/**
 * Check what the frame shows against SP1.
 *
 * @param golden The item.
 * @param drawn What the frame shows.
 */
const holdsScreen = (golden: Golden, drawn: Drawn): void => {
  const { figure, name } = golden;
  const parts = partsOf(figure);
  const areas = drawn.parts.map((part) => part.area);
  const xs = [...new Set(drawn.parts.map((part) => whole(part.centre.x)))];
  const ys = [...new Set(drawn.parts.map((part) => whole(part.centre.y)))];

  assert.strictEqual(drawn.parts.length, parts, `${name} shows its ${String(parts)} parts`);
  assert.strictEqual(drawn.text.trim(), "", `${name}'s frame holds no text: no count, no numeral`);
  assert.strictEqual(drawn.model?.role, "group", `${name}'s model is a group of parts`);
  assert.strictEqual(
    drawn.model?.label,
    figure.kind === "set"
      ? `a set of ${String(parts)}, each ${setObject}`
      : `a ${figure.kind} in ${String(parts)} equal parts`,
    `${name}'s model is named for its whole${figure.kind === "set" ? " and its object" : ""}`,
  );
  // A set draws its object's one picture on each disc, centred, hidden from a screen reader and
  // never in the way of a tap; a rectangle or a circle draws no picture.
  assert.lengthOf(
    drawn.pictures,
    figure.kind === "set" ? parts : 0,
    `${name} draws ${figure.kind === "set" ? "its object on each disc" : "no picture"}`,
  );

  for (const [place, picture] of drawn.pictures.entries()) {
    const part = drawn.parts[place];

    assert.isDefined(part, `${name} picture ${String(place)} has its disc`);
    assert.isTrue(
      picture.href.startsWith("data:image/svg+xml;base64,"),
      `${name} picture ${String(place)} is the markup's picture as delivered`,
    );
    assert.strictEqual(
      picture.hidden,
      "true",
      `${name} picture ${String(place)} is hidden from a screen reader`,
    );
    assert.strictEqual(
      picture.pointerEvents,
      "none",
      `${name} picture ${String(place)} takes no tap`,
    );
    assert.isAtMost(
      Math.hypot(
        picture.centre.x - (part?.centre.x ?? 0),
        picture.centre.y - (part?.centre.y ?? 0),
      ),
      1.5,
      `${name} picture ${String(place)} is centred on its disc`,
    );
    assert.isTrue(
      picture.width > 0 &&
        Math.hypot(picture.width, picture.height) <= 2 * (part?.radius ?? 0) + outline,
      `${name} picture ${String(place)} fits within its disc and its ring`,
    );
  }

  for (const [place, part] of drawn.parts.entries()) {
    assert.isAtLeast(
      part.radius,
      targetRadius,
      `${name} part ${String(place)} holds a 44 px disc a tap lands on`,
    );
    assert.strictEqual(part.stroke, colours.outline, `${name} part ${String(place)} outlined #333`);
    assert.strictEqual(part.strokeWidth, "3px", `${name} part ${String(place)} outlined at 3 px`);
    assert.strictEqual(
      part.label,
      `part ${String(place + 1)} of ${String(parts)}`,
      `${name} part ${String(place)} named`,
    );
  }

  assert.isAtMost(
    Math.max(...areas) - Math.min(...areas),
    Math.max(...areas) * 0.02,
    `${name}'s parts are equal`,
  );

  if (figure.kind === "rectangle") {
    assert.strictEqual(
      xs.length,
      figure.columns,
      `${name} stands in ${String(figure.columns)} columns`,
    );
    assert.strictEqual(ys.length, figure.rows, `${name} stands in ${String(figure.rows)} rows`);
  }

  if (figure.kind === "set") {
    assert.strictEqual(
      ys.length,
      Math.ceil(figure.parts / figure.perRow),
      `${name}'s objects stand in rows of ${String(figure.perRow)}`,
    );
  }

  holdsShown(golden, drawn);
};

/**
 * Check the shading against SP2: each part of the set shaded is pressed and painted `#4aa3df`;
 * every other part is not pressed and white.
 *
 * @param golden The item.
 * @param drawn What the frame shows.
 * @param shaded The parts shaded, by place.
 */
const holdsShading = (golden: Golden, drawn: Drawn, shaded: ReadonlySet<number>): void => {
  for (const [place, part] of drawn.parts.entries()) {
    const on = shaded.has(place);

    assert.strictEqual(part.pressed, String(on), `${golden.name} part ${String(place)} pressed`);
    assert.strictEqual(
      part.fill,
      on ? colours.shaded : colours.clear,
      `${golden.name} part ${String(place)} ${on ? "shaded" : "clear"}`,
    );
  }
};

/**
 * The page the rules drive, held for the whole file.
 */
class Shade extends Context.Service<Shade, ShadePage>()("specimen/alpha/shade-parts.test/Shade") {}

/**
 * Open {@link Shade}, closed when the file ends.
 */
const ShadeLayer = Layer.effect(Shade, Effect.orDie(shadePage));

/**
 * Start a fresh frame for an item and require it ready.
 *
 * @param page The page.
 * @param item The item.
 * @param start The response it is bound to, the state it restores and the status.
 * @returns Once the PCI is ready.
 */
const started = Effect.fnUntraced(function* started(
  page: ShadePage,
  item: ShadeItem,
  start: Start,
) {
  const ready = yield* Effect.orDie(page.start(item, start));

  assert.strictEqual(ready.kind, "ready", `the PCI runs: ${ready.reason ?? ""}`);
});

/**
 * Complete the frame and give the response and state it completed with, and every change it
 * relayed.
 *
 * @param page The page.
 * @returns The completed response and state, and the relayed changes' values.
 */
const finished = Effect.fnUntraced(function* finished(page: ShadePage) {
  const completed: FrameMessage = yield* Effect.orDie(page.complete);
  const messages = yield* Effect.orDie(page.messages);
  const changes = messages.filter((message) => message.kind === "changed");

  return {
    changes: changes.map((change) => change.value),
    response: completed.response,
    state: completed.state,
  };
});

/**
 * Give an item with its properties changed: each named property set, or removed where `undefined`.
 *
 * @param item The item.
 * @param changes The properties to set or remove.
 * @returns The changed item.
 */
const withProperties = (
  item: ShadeItem,
  changes: Readonly<Record<string, string | undefined>>,
): ShadeItem => ({
  ...item,
  properties: Object.fromEntries(
    Object.entries({ ...item.properties, ...changes }).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  ),
});

/**
 * Give an item with its markup replaced.
 *
 * @param item The item.
 * @param markup The markup.
 * @returns The changed item.
 */
const withMarkup = (item: ShadeItem, markup: string): ShadeItem => ({ ...item, markup });

layer(ShadeLayer, { timeout: Duration.millis(ruleHang) })("the shade-parts PCI", (it) => {
  for (const golden of goldens) {
    it.effect(
      `SP0, SP1: ${golden.name} shows nothing before its module runs, then its figure and nothing else`,
      () =>
        Effect.gen(function* screen() {
          const page = yield* Shade;
          const item = yield* Effect.orDie(shadeItem(golden.name));
          const { settled, shown } = yield* Effect.orDie(page.beforeModule(item));

          // A set's markup is the object's one picture; a rectangle's or a circle's is empty.
          assert.deepStrictEqual(
            shown,
            { elements: golden.figure.kind === "set" ? ["img"] : [], text: "" },
            `${golden.name}'s frame shows its markup alone while its module loads`,
          );
          assert.strictEqual(settled.kind, "ready", `the PCI runs: ${settled.reason ?? ""}`);

          const drawn = yield* Effect.orDie(page.drawn);

          holdsScreen(golden, drawn);
          holdsShading(golden, drawn, new Set());
        }),
      ruleHang,
    );

    it.effect(
      `SP2–SP4: ${golden.name} shades and clears a tapped part and gives the count left shaded for every golden response`,
      () =>
        Effect.gen(function* goldenResponses() {
          const page = yield* Shade;
          const item = yield* Effect.orDie(shadeItem(golden.name));

          assert.strictEqual(item.correct, golden.correct, `${golden.name}: its fixture's key`);
          assert.isTrue(
            item.correct >= 1 && item.correct <= partsOf(golden.figure),
            `${golden.name}: its key counts from 1 to its parts`,
          );

          for (const scripted of scriptsOf(golden)) {
            yield* started(page, item, {});
            yield* Effect.orDie(page.tap(scripted.taps));
            holdsShading(golden, yield* Effect.orDie(page.drawn), shadedBy(scripted.taps));

            if (golden.shown !== undefined) {
              const { shownCentres } = yield* Effect.orDie(page.drawn);

              assert.lengthOf(
                shownCentres,
                golden.shown.parts,
                `${golden.name}: each part of the shown model is hit where it is tapped`,
              );
              yield* Effect.orDie(page.tapAt(shownCentres));
              holdsShading(golden, yield* Effect.orDie(page.drawn), shadedBy(scripted.taps));
            }

            const { changes, response, state } = yield* finished(page);
            const expected = responseOf(scripted.shaded);
            const key = JSON.stringify(responseOf(item.correct));

            assert.strictEqual(
              JSON.stringify(response) === key,
              scripted.right,
              `${golden.name} ${scripted.name}: match_correct scores the response ${scripted.right ? "1" : "0"} against the key ${String(item.correct)}`,
            );

            const held = new Set(
              [[], ...scripted.taps.map((_tap, index) => scripted.taps.slice(0, index + 1))].map(
                (taps) => JSON.stringify(responseOf(shadedBy(taps).size || undefined)),
              ),
            );

            assert.deepStrictEqual(
              response,
              expected,
              `${golden.name} ${scripted.name}: the response`,
            );
            assert.deepStrictEqual(
              state,
              { shaded: [...shadedBy(scripted.taps)].toSorted((left, right) => left - right) },
              `${golden.name} ${scripted.name}: the state names the parts shaded`,
            );

            for (const change of changes) {
              assert.isTrue(
                held.has(JSON.stringify(change)),
                `${golden.name} ${scripted.name}: every change relayed is a response the taps left, never one the shown model made: ${JSON.stringify(change)}`,
              );
            }

            if (scripted.taps.length > 0) {
              assert.deepStrictEqual(
                changes.at(-1),
                expected,
                `${golden.name} ${scripted.name}: the last change relayed is the response`,
              );
            }
          }
        }),
      ruleHang,
    );

    it.effect(
      `SP5: ${golden.name} comes back to the count it is bound to, or the parts of its state`,
      () =>
        Effect.gen(function* comingBack() {
          const page = yield* Shade;
          const item = yield* Effect.orDie(shadeItem(golden.name));
          const parts = partsOf(golden.figure);
          const first = new Set(Array.from({ length: golden.correct }, (_unused, index) => index));

          yield* started(page, item, { boundTo: responseOf(golden.correct) });
          holdsShading(golden, yield* Effect.orDie(page.drawn), first);
          assert.deepStrictEqual(
            (yield* finished(page)).response,
            responseOf(golden.correct),
            `${golden.name} bound to ${String(golden.correct)} gives it back`,
          );

          yield* started(page, item, { boundTo: { base: null } });
          holdsShading(golden, yield* Effect.orDie(page.drawn), new Set());
          assert.deepStrictEqual((yield* finished(page)).response, { base: null });

          yield* started(page, item, { state: { shaded: [parts - 1] } });
          holdsShading(golden, yield* Effect.orDie(page.drawn), new Set([parts - 1]));
          assert.deepStrictEqual((yield* finished(page)).response, responseOf(1));
        }),
      ruleHang,
    );
  }

  it.effect(
    "SP5: the stored response decides between it and a state that shades another count",
    () =>
      Effect.gen(function* storedDecides() {
        const page = yield* Shade;
        const golden = goldens.find((each) => each.name === "rectangle-vertical-4");
        const item = yield* Effect.orDie(shadeItem("rectangle-vertical-4"));
        const cases: readonly (readonly [string, Start, ReadonlySet<number>])[] = [
          [
            "a state of the bound count is kept",
            { boundTo: responseOf(2), state: { shaded: [1, 3] } },
            new Set([1, 3]),
          ],
          [
            "a state of another count gives way",
            { boundTo: responseOf(3), state: { shaded: [0, 2] } },
            new Set([0, 1, 2]),
          ],
          [
            "an empty state gives way to a count",
            { boundTo: responseOf(1), state: { shaded: [] } },
            new Set([0]),
          ],
          [
            "a NULL response shades nothing",
            { boundTo: { base: null }, state: { shaded: [1] } },
            new Set(),
          ],
        ];

        assert.isDefined(golden, "rectangle-vertical-4 is a golden");

        for (const [why, start, shown] of cases) {
          yield* started(page, item, start);
          holdsShading(golden, yield* Effect.orDie(page.drawn), shown);
          assert.deepStrictEqual(
            (yield* finished(page)).response,
            responseOf(shown.size || undefined),
            `${why}: the response`,
          );
        }
      }),
    ruleHang,
  );

  it.effect(
    "SP6: an item whose figure or partition the PCI cannot read fails to run",
    () =>
      Effect.gen(function* refusals() {
        const page = yield* Shade;
        const rectangleItem = yield* Effect.orDie(shadeItem("rectangle-vertical-4"));
        const circleItem = yield* Effect.orDie(shadeItem("circle-3"));
        const setItem = yield* Effect.orDie(shadeItem("set-6"));
        const picture = setItem.markup;
        const refused: readonly (readonly [string, ShadeItem, Start])[] = [
          ["no figure", withProperties(rectangleItem, { whole: undefined }), {}],
          ["an unknown figure", withProperties(rectangleItem, { whole: "triangle" }), {}],
          ["a rectangle with no rows", withProperties(rectangleItem, { rows: undefined }), {}],
          ["a whole with no parts", withProperties(circleItem, { parts: undefined }), {}],
          ["a rectangle of one part", withProperties(rectangleItem, { parts: "1", rows: "1" }), {}],
          ["a count with a leading zero", withProperties(rectangleItem, { parts: "04" }), {}],
          ["a circle of one part", withProperties(circleItem, { parts: "1" }), {}],
          ["a circle of five parts", withProperties(circleItem, { parts: "5" }), {}],
          ["a circle of nine parts", withProperties(circleItem, { parts: "9" }), {}],
          [
            "a rectangle of twelve parts",
            withProperties(rectangleItem, { parts: "12", rows: "3" }),
            {},
          ],
          ["rows that do not divide the parts", withProperties(rectangleItem, { rows: "3" }), {}],
          ["a circle with a rectangle's rows", withProperties(circleItem, { rows: "2" }), {}],
          ["a set of seven", withProperties(setItem, { parts: "7" }), {}],
          ["a set with rows", withProperties(setItem, { rows: "1" }), {}],
          [
            "a set with a shown model",
            withProperties(setItem, { shownParts: "2", shownShaded: "1" }),
            {},
          ],
          ["a set with no picture", withMarkup(setItem, ""), {}],
          ["a set with two pictures", withMarkup(setItem, `${picture}${picture}`), {}],
          [
            "a set whose picture has no alt",
            withMarkup(setItem, picture.replace(/ alt="[^"]*"/u, "")),
            {},
          ],
          [
            "a set whose picture has no width",
            withMarkup(setItem, picture.replace(/ width="[^"]*"/u, "")),
            {},
          ],
          ["a set whose object is a word", withMarkup(setItem, "a button"), {}],
          ["a set whose picture comes with a word", withMarkup(setItem, `${picture} buttons`), {}],
          ["a circle with a picture", withMarkup(circleItem, picture), {}],
          ["a rectangle with a word", withMarkup(rectangleItem, "a box"), {}],
          [
            "a shown model shading every part",
            withProperties(rectangleItem, { shownParts: "2", shownRows: "1", shownShaded: "2" }),
            {},
          ],
          [
            "a shown model partly written",
            withProperties(rectangleItem, { shownParts: "2", shownShaded: "1" }),
            {},
          ],
          [
            "a shown model whose parts do not divide the shaded model's",
            withProperties(rectangleItem, { shownParts: "3", shownRows: "1", shownShaded: "1" }),
            {},
          ],
          [
            "a shaded model in fewer parts than the shown model",
            withProperties(rectangleItem, {
              parts: "2",
              shownParts: "4",
              shownRows: "1",
              shownShaded: "2",
            }),
            {},
          ],
          [
            "a shaded model cut as the shown model is",
            withProperties(circleItem, { shownParts: "3", shownShaded: "1" }),
            {},
          ],
          [
            "a shaded model whose rows do not align with the shown model's",
            withProperties(rectangleItem, {
              parts: "8",
              rows: "1",
              shownParts: "4",
              shownRows: "2",
              shownShaded: "1",
            }),
            {},
          ],
          [
            "two upright rectangles stacked",
            withProperties(rectangleItem, {
              parts: "6",
              rows: "6",
              shownParts: "3",
              shownRows: "3",
              shownShaded: "1",
            }),
            {},
          ],
          [
            "an upright shown rectangle",
            withProperties(rectangleItem, {
              parts: "8",
              rows: "2",
              shownParts: "2",
              shownRows: "2",
              shownShaded: "1",
            }),
            {},
          ],
          [
            "a circle's sectors across the shown circle's",
            withProperties(circleItem, { parts: "4", shownParts: "3", shownShaded: "1" }),
            {},
          ],
          ["a misspelt property of the PCI's", withProperties(circleItem, { shownPart: "2" }), {}],
          ["a property the schema does not declare", withProperties(circleItem, { ssml: "" }), {}],
          ["a bound count beyond the parts", rectangleItem, { boundTo: { base: { integer: 5 } } }],
          ["a state naming no part", rectangleItem, { state: { shaded: [4] } }],
          ["a state naming a part twice", rectangleItem, { state: { shaded: [1, 1] } }],
        ];

        for (const [why, item, start] of refused) {
          const settled = yield* Effect.orDie(page.start(item, start));

          assert.strictEqual(settled.kind, "failed", `${why}: the PCI refuses to run`);
        }

        const passedOver = yield* Effect.orDie(
          page.start(
            withProperties(rectangleItem, {
              catalogIdref: "stem-read-aloud",
              qtiSuppressTts: "all",
            }),
            {},
          ),
        );

        const elsewhere = yield* Effect.orDie(
          page.start(
            withMarkup(
              setItem,
              picture.replace(/ src="[^"]*"/u, ' src="https://media.example/button.svg"'),
            ),
            {},
          ),
        );

        assert.strictEqual(
          elsewhere.kind,
          "ready",
          `a set's picture at the delivery system's own URL starts: ${elsewhere.reason ?? ""}`,
        );
        assert.strictEqual(
          passedOver.kind,
          "ready",
          `the properties the schema declares on the element are passed over: ${passedOver.reason ?? ""}`,
        );
      }),
    ruleHang,
  );

  it.effect(
    "SP7: every part is a tab stop, and Space or Enter toggles the focused part",
    () =>
      Effect.gen(function* keyboard() {
        const page = yield* Shade;
        const golden = goldens.find((each) => each.name === "circle-4");
        const item = yield* Effect.orDie(shadeItem("circle-4"));

        yield* started(page, item, {});
        yield* Effect.orDie(page.press(["Tab", "Space", "Tab", "Tab", "Enter"]));

        if (golden !== undefined) {
          holdsShading(golden, yield* Effect.orDie(page.drawn), new Set([0, 2]));
        }

        yield* Effect.orDie(page.press(["Shift+Tab", "Shift+Tab", "Space"]));

        if (golden !== undefined) {
          holdsShading(golden, yield* Effect.orDie(page.drawn), new Set([2]));
        }

        assert.deepStrictEqual((yield* finished(page)).response, responseOf(1));
      }),
    ruleHang,
  );

  it.effect(
    "SP7: a held Space or Enter toggles the focused part once, and with Alt, Control or Meta not at all",
    () =>
      Effect.gen(function* heldAndChorded() {
        const page = yield* Shade;
        const golden = goldens.find((each) => each.name === "circle-4");
        const item = yield* Effect.orDie(shadeItem("circle-4"));

        assert.isDefined(golden, "circle-4 is a golden");
        yield* started(page, item, {});
        yield* Effect.orDie(page.press(["Tab"]));
        holdsShading(golden, yield* Effect.orDie(page.drawn), new Set());
        yield* Effect.orDie(page.press(["down:Space", "down:Space", "up:Space"]));
        holdsShading(golden, yield* Effect.orDie(page.drawn), new Set([0]));
        yield* Effect.orDie(page.press(["Tab", "down:Enter", "down:Enter", "up:Enter"]));
        holdsShading(golden, yield* Effect.orDie(page.drawn), new Set([0, 1]));
        yield* Effect.orDie(page.press(["Tab", "Control+Enter", "Alt+Space", "Meta+Enter"]));
        holdsShading(golden, yield* Effect.orDie(page.drawn), new Set([0, 1]));
      }),
    ruleHang,
  );

  it.effect(
    "SP8: a PCI under review takes no tap and has no tab stop",
    () =>
      Effect.gen(function* review() {
        const page = yield* Shade;
        const golden = goldens.find((each) => each.name === "rectangle-vertical-4");
        const item = yield* Effect.orDie(shadeItem("rectangle-vertical-4"));

        yield* started(page, item, { boundTo: responseOf(2), status: "review" });
        yield* Effect.orDie(page.tap([0, 1, 2, 3]));

        const drawn = yield* Effect.orDie(page.drawn);

        if (golden !== undefined) {
          holdsShading(golden, drawn, new Set([0, 1]));
        }

        for (const part of drawn.parts) {
          assert.strictEqual(part.disabled, "true", "a part under review is disabled");
          assert.strictEqual(part.tabIndex, "-1", "a part under review is no tab stop");
        }

        const { changes, response } = yield* finished(page);

        for (const change of changes) {
          assert.deepStrictEqual(
            change,
            responseOf(2),
            "under review the frame relays only the response it was bound to",
          );
        }

        assert.deepStrictEqual(response, responseOf(2), "the response stays the bound count");
      }),
    ruleHang,
  );
  it.effect(
    "SP9: a swipe from a part shades nothing and takes the page nowhere: the model and every part take every touch",
    () =>
      Effect.gen(function* swiping() {
        const page = yield* Shade;

        for (const name of ["rectangle-vertical-4", "circle-4"]) {
          const golden =
            goldens.find((each) => each.name === name) ?? assert.fail(`${name} is a golden`);
          const item = yield* Effect.orDie(shadeItem(name));

          yield* started(page, item, {});

          const before = yield* Effect.orDie(page.drawn);

          assert.strictEqual(
            before.model?.touchAction,
            "none",
            `${name}'s model takes every touch`,
          );
          for (const part of before.parts) {
            assert.strictEqual(part.touchAction, "none", `${name}'s parts take every touch`);
          }

          for (const by of [240, -240]) {
            const where = yield* Effect.orDie(page.swipe(0, by));

            assert.deepStrictEqual(where.navigations, [], `in ${name}, a swipe navigates nowhere`);
            assert.deepStrictEqual(where.after, where.before, `in ${name}, the page stays put`);
          }

          holdsShading(golden, yield* Effect.orDie(page.drawn), new Set());

          const { changes, response } = yield* finished(page);

          // The frame relays the PCI's response after any input it sees, when it differs from the
          // last it relayed, the first time included: a swipe may relay the empty response, never
          // another.
          for (const change of changes) {
            assert.deepStrictEqual(change, responseOf(), `in ${name}, a swipe changes no response`);
          }

          assert.deepStrictEqual(response, responseOf(), `in ${name}, nothing is shaded`);
        }
      }),
    ruleHang,
  );
});
