/**
 * The enter-numbers PCI (`urn:fdc:alpha.school:2026:enter-numbers`) held to the assessment lead's
 * K–5 TEI list (2026-11-19, rows 4, 5 and 6) on the suite's synthetic items, one per kind
 * (`fixtures/alpha/enter-numbers/`: a fraction, a mixed number, a decimal, a quotient and its
 * remainder, a factor pair, an ordered pair), each run with plate's module file in plate's own PCI
 * frame in headless Google Chrome (`#specimen/alpha/hosted-pci.ts`). The rules are written from
 * the specification, never from the module's code:
 *
 * - EN1, the screen: the markup's lines, a box at each mark (a fraction two stacked over a bar, a
 *   mixed number three), each box at least 44 px both ways and empty; the keypad's keys 0 to 9 and
 *   backspace, the point key on a decimal entry only.
 * - EN2, refusals at entry: a key that would leave a box no beginning of a number its kind admits
 *   changes nothing (a leading zero, a zero as a denominator's first digit, a second point, a point
 *   first, a digit past the box's digits).
 * - EN3, the response on value: a fraction, a mixed number or a decimal is its numerator and
 *   denominator in lowest terms, so every equivalent and an improper fraction for a mixed number
 *   score as `match_correct` scores the item's key; a mixed number's whole-number box alone is that
 *   whole number, and a decimal's point with no digit after it adds nothing (xs:decimal's `3.`);
 *   boxes are their integers in order (a factor pair's declaration is `multiple`, so either order
 *   scores); a swap of ordered boxes does not.
 * - EN4, NULL: untouched, one box of two, or emptied again, the response is NULL and scores 0; the
 *   last change relayed is the response completed with.
 * - EN5, coming back: bound to a value the boxes show it (a mixed entry's whole number in its
 *   whole-number box alone); with a state writing the same value, the state's spelling; with a
 *   state writing another, the bound value.
 * - EN6, refusals: an item whose properties or markup the PCI cannot read fails to run.
 * - EN7, the keyboard: a box is a tab stop, digits type, `/` moves from a numerator to its
 *   denominator, Backspace deletes.
 * - EN8, review: a PCI not interacting takes no key and no tap.
 * - EN9, every answer comes back: each value an entry of few digits can write, bound again while
 *   answering or in review, is shown as boxes writing that value and given back unchanged (a host
 *   that keeps only the response rebinds every answer the PCI gave).
 *
 * @module
 */
import { assert, layer } from "@effect/vitest";
import { Context, Effect, Layer } from "effect";
import { enterNumbers } from "@qti-pie/plate/alpha/pci-modules";
import { hostedItem, hostedPage } from "#specimen/alpha/hosted-pci.ts";
import type { HostedItem, HostedPage, Point, Start } from "#specimen/alpha/hosted-pci.ts";

/**
 * WCAG 2.2's Target Size (Enhanced), in CSS pixels.
 */
const target = 44;

/**
 * One box or key as the frame shows it.
 */
interface Control {
  readonly centre: Point;
  readonly disabled: boolean;
  readonly height: number;
  readonly label: string;
  readonly ringed: boolean;
  readonly text: string;
  readonly visible: boolean;
  readonly width: number;
}

/**
 * What the frame shows: its boxes (`role="textbox"`) and keys (buttons) in document order, and the
 * text of each line beside the keypad, a MathML fraction read as `a/b` and the boxes left out.
 */
interface Screen {
  readonly boxes: readonly Control[];
  readonly keys: readonly Control[];
  readonly lines: readonly string[];
}

/**
 * Read what the frame shows, in the frame's document.
 *
 * @returns The screen.
 */
const readScreen = (): Screen => {
  const dom = document.querySelector("[data-pci-dom]");
  const controls = (selector: string): readonly Control[] =>
    [...(dom?.querySelectorAll(selector) ?? [])].map((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        centre: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
        disabled:
          element instanceof HTMLButtonElement
            ? element.disabled
            : element.getAttribute("aria-disabled") === "true",
        height: box.height,
        label: element.getAttribute("aria-label") ?? "",
        ringed: style.borderTopColor === "rgb(29, 111, 209)",
        text: element.textContent,
        visible: style.visibility !== "hidden",
        width: box.width,
      };
    });
  const keypad = dom?.querySelector('[role="group"][aria-label="Number keypad"]');
  const lines = [...(keypad?.previousElementSibling?.children ?? [])].map((line) => {
    const copy = line.cloneNode(true);

    if (!(copy instanceof Element)) {
      return "";
    }

    for (const fraction of copy.querySelectorAll("mfrac")) {
      fraction.replaceWith(
        `${fraction.children[0]?.textContent ?? ""}/${fraction.children[1]?.textContent ?? ""}`,
      );
    }

    for (const box of copy.querySelectorAll('[role="textbox"]')) {
      box.remove();
    }

    return Array.from(copy.textContent, (character) => (character.trim() === "" ? " " : character))
      .join("")
      .split(" ")
      .filter((word) => word !== "")
      .join(" ");
  });

  return {
    boxes: controls('[role="textbox"]'),
    keys: controls("button"),
    lines,
  };
};

/**
 * The suite's items, by their fixture's name.
 */
type ItemName =
  | "decimal-sum"
  | "factor-pair"
  | "fraction-sum"
  | "mixed-product"
  | "ordered-pair"
  | "quotient-remainder";

/**
 * One synthetic item: its name, the boxes it shows, the line's text without them, whether its
 * keypad has the point key, and the box labels in order.
 */
interface Golden {
  readonly boxes: readonly string[];
  readonly lines: readonly string[];
  readonly name: ItemName;
  readonly point: boolean;
}

/**
 * The suite's items, from their fixtures.
 */
const goldens: readonly Golden[] = [
  {
    boxes: ["numerator", "denominator"],
    lines: ["2/7 + 3/7 ="],
    name: "fraction-sum",
    point: false,
  },
  {
    boxes: ["whole number", "numerator", "denominator"],
    lines: ["3 × 5/6 ="],
    name: "mixed-product",
    point: false,
  },
  { boxes: ["number"], lines: ["1.25 + 2.5 ="], name: "decimal-sum", point: true },
  {
    boxes: ["box 1 of 2", "box 2 of 2"],
    lines: ["1,234 ÷ 5 = R"],
    name: "quotient-remainder",
    point: false,
  },
  {
    boxes: ["box 1 of 2", "box 2 of 2"],
    lines: ["1 × 36", "2 × 18", "3 × 12", "×", "6 × 6"],
    name: "factor-pair",
    point: false,
  },
  { boxes: ["box 1 of 2", "box 2 of 2"], lines: ["(, )"], name: "ordered-pair", point: false },
];

/**
 * A child's entry: each box's keys, in box order, typed on the keypad after a tap on the box; and
 * the response the specification gives it, `null` for NULL.
 */
interface Scripted {
  readonly entry: readonly string[];
  readonly response: readonly number[] | null;
  readonly why: string;
}

/**
 * The golden entries of each item, the response each must give derived from the specification:
 * a value in lowest terms, boxes in order, NULL for an entry missing a box it needs (a mixed
 * number's whole-number box alone is its whole number, a decimal's bare point adds nothing).
 */
const scripts: Readonly<Record<ItemName, readonly Scripted[]>> = {
  "decimal-sum": [
    { entry: ["3.75"], response: [15, 4], why: "the key" },
    { entry: ["3.750"], response: [15, 4], why: "a trailing zero, the same value" },
    { entry: ["3.57"], response: [357, 100], why: "another decimal" },
    { entry: ["4"], response: [4, 1], why: "a whole number" },
    { entry: ["3."], response: [3, 1], why: "a point with no digit after it, the whole number" },
    { entry: [""], response: null, why: "blank" },
  ],
  "factor-pair": [
    { entry: ["4", "9"], response: [4, 9], why: "the key" },
    { entry: ["9", "4"], response: [9, 4], why: "the key in the other order" },
    { entry: ["4", ""], response: null, why: "one box" },
    { entry: ["3", "12"], response: [3, 12], why: "a pair already shown" },
  ],
  "fraction-sum": [
    { entry: ["5", "7"], response: [5, 7], why: "the key" },
    { entry: ["10", "14"], response: [5, 7], why: "an equivalent" },
    { entry: ["15", "21"], response: [5, 7], why: "another equivalent" },
    { entry: ["5", "14"], response: [5, 14], why: "the numerator alone right" },
    { entry: ["7", "5"], response: [7, 5], why: "the boxes swapped" },
    { entry: ["5", ""], response: null, why: "one box" },
    { entry: ["", "7"], response: null, why: "the other box" },
    { entry: ["", ""], response: null, why: "blank" },
  ],
  "mixed-product": [
    { entry: ["2", "1", "2"], response: [5, 2], why: "the key as a mixed number" },
    { entry: ["", "15", "6"], response: [5, 2], why: "the improper fraction" },
    { entry: ["", "5", "2"], response: [5, 2], why: "the improper fraction in lowest terms" },
    { entry: ["2", "3", "6"], response: [5, 2], why: "a mixed number not in lowest terms" },
    { entry: ["2", "1", "3"], response: [7, 3], why: "a wrong mixed number" },
    { entry: ["2", "", ""], response: [2, 1], why: "the whole number alone, its value" },
    { entry: ["2", "1", ""], response: null, why: "no denominator" },
    { entry: ["2", "", "2"], response: null, why: "no numerator" },
    { entry: ["", "", ""], response: null, why: "blank" },
  ],
  "ordered-pair": [
    { entry: ["3", "5"], response: [3, 5], why: "the key" },
    { entry: ["5", "3"], response: [5, 3], why: "swapped" },
    { entry: ["3", ""], response: null, why: "one box" },
  ],
  "quotient-remainder": [
    { entry: ["246", "4"], response: [246, 4], why: "the key" },
    { entry: ["246", "3"], response: [246, 3], why: "a wrong remainder" },
    { entry: ["4", "246"], response: [4, 246], why: "swapped" },
    { entry: ["246", ""], response: null, why: "no remainder" },
  ],
};

/**
 * The score `match_correct` gives a response against an item's key: 1 where they are one value
 * (an ordered list member by member, a multiple list as the same members any order), 0 otherwise,
 * NULL included.
 *
 * @param item The item.
 * @param response The response, `null` for NULL.
 * @returns The score.
 */
const scoreOf = (item: HostedItem, response: readonly number[] | null): number => {
  if (response === null || response.length !== item.correct.length) {
    return 0;
  }

  const sorted = (values: readonly number[]): readonly number[] =>
    item.cardinality === "multiple" ? values.toSorted((a, b) => a - b) : values;
  const [left, right] = [sorted(response), sorted(item.correct)];

  return left.every((value, index) => value === right[index]) ? 1 : 0;
};

/**
 * The Appendix C JSON of an ordered integer response, `{ list: null }` for NULL.
 *
 * @param values The integers, `null` for NULL.
 * @returns The JSON.
 */
const jsonOf = (values: readonly number[] | null) =>
  values === null ? { list: null } : { list: { integer: values } };

/**
 * The Appendix C JSON of a bound ordered integer response.
 *
 * @param integer The integers.
 * @returns The JSON.
 */
const bound = (integer: readonly number[]) => ({ list: { integer } });

/**
 * The value a fraction's, a mixed number's or a decimal's boxes write, as the specification
 * reads them (one box a decimal, two a fraction, three a mixed number, whose whole-number box alone
 * is its whole number): its numerator and denominator in lowest terms.
 *
 * @param texts The boxes' texts, in box order, each a number.
 * @returns `[n, d]` in lowest terms.
 */
const writtenValue = (texts: readonly string[]): readonly number[] => {
  const [first = "", second = "", third = ""] = texts;
  const places = first.includes(".") ? first.length - first.indexOf(".") - 1 : 0;
  const read = {
    1: [Number(first.replace(".", "")), 10 ** places],
    2: [Number(first), Number(second)],
    3:
      second === "" && third === ""
        ? [Number(first), 1]
        : [Number(first === "" ? "0" : first) * Number(third) + Number(second), Number(third)],
  }[texts.length] ?? [0, 1];
  const [numerator = 0, denominator = 1] = read;
  const common = (left: number, right: number): number =>
    right === 0 ? left : common(right, left % right);
  const divisor = common(numerator, denominator);

  return [numerator / divisor, denominator / divisor];
};

/**
 * The page the rules drive, held for the whole file.
 */
class Hosted extends Context.Service<Hosted, HostedPage>()(
  "specimen/alpha/enter-numbers.test/Hosted",
) {}

/**
 * Open {@link Hosted}, closed when the file ends.
 */
const HostedLayer = Layer.effect(Hosted, Effect.orDie(hostedPage(enterNumbers)));

/**
 * Start a fresh frame for an item and require it ready.
 *
 * @param page The page.
 * @param item The item.
 * @param start The response it is bound to, the state it restores and the status.
 * @returns Once the PCI is ready.
 */
const started = Effect.fnUntraced(function* started(
  page: HostedPage,
  item: HostedItem,
  start: Start,
) {
  const ready = yield* Effect.orDie(page.start(item, start));

  assert.strictEqual(ready.kind, "ready", `the PCI runs: ${ready.reason ?? ""}`);
});

/**
 * Type an entry as a child does: for each box, tap it, then tap its keys on the keypad.
 *
 * @param page The page.
 * @param entry Each box's keys, in box order.
 * @returns Once typed.
 */
const typed = Effect.fnUntraced(function* typed(page: HostedPage, entry: readonly string[]) {
  for (const [index, keys] of entry.entries()) {
    const screen = yield* Effect.orDie(page.read(readScreen));
    const box = screen.boxes[index];

    assert.isDefined(box, `box ${String(index)} is on screen`);
    yield* Effect.orDie(page.tapAt([box.centre]));

    for (const key of keys.split("")) {
      const button = screen.keys.find((each) => each.label === key);

      assert.isDefined(button, `the keypad has the key ${key}`);
      yield* Effect.orDie(page.tapAt([button.centre]));
    }
  }
});

/**
 * Complete the frame and give the response it completed with and the last change it relayed.
 *
 * @param page The page.
 * @returns The completed response and the last relayed value.
 */
const finished = Effect.fnUntraced(function* finished(page: HostedPage) {
  const completed = yield* Effect.orDie(page.complete);
  const messages = yield* Effect.orDie(page.messages);
  const changes = messages.filter((message) => message.kind === "changed");

  return { last: changes.at(-1)?.value, response: completed.response, state: completed.state };
});

/**
 * The boxes' texts on screen.
 *
 * @param page The page.
 * @returns The texts, in box order.
 */
const boxTexts = (page: HostedPage) =>
  Effect.map(Effect.orDie(page.read(readScreen)), (screen) => screen.boxes.map((box) => box.text));

/**
 * An item with its properties changed, each set or removed where `undefined`.
 *
 * @param item The item.
 * @param changes The properties.
 * @returns The changed item.
 */
const withProperties = (
  item: HostedItem,
  changes: Readonly<Record<string, string | undefined>>,
): HostedItem => ({
  ...item,
  properties: Object.fromEntries(
    Object.entries({ ...item.properties, ...changes }).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  ),
});

layer(HostedLayer)("the enter-numbers PCI", (it) => {
  for (const golden of goldens) {
    it.effect(
      `EN1: ${golden.name} shows its lines, its boxes empty at the marks, and the keypad`,
      () =>
        Effect.gen(function* screen() {
          const page = yield* Hosted;
          const item = yield* Effect.orDie(hostedItem(enterNumbers, golden.name));

          yield* started(page, item, {});

          const shown = yield* Effect.orDie(page.read(readScreen));

          assert.deepStrictEqual(shown.lines, golden.lines, "the lines, as the markup writes them");
          assert.deepStrictEqual(
            shown.boxes.map((box) => box.label),
            golden.boxes,
          );
          assert.isTrue(
            shown.boxes.every((box) => box.text === ""),
            "every box starts empty",
          );
          assert.isTrue(
            shown.boxes.every((box) => box.width >= target && box.height >= target),
            "every box is a 44 px target",
          );
          assert.deepStrictEqual(
            shown.keys.filter((key) => key.visible).map((key) => key.label),
            [
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              ...(golden.point ? ["."] : []),
              "0",
              "Backspace",
            ],
          );
          assert.isTrue(
            shown.keys
              .filter((key) => key.visible)
              .every((key) => key.width >= target && key.height >= target),
            "every key is a 44 px target",
          );
        }),
    );

    it.effect(
      `EN3, EN4: ${golden.name} gives the value of every golden entry, scored as match_correct scores its key`,
      () =>
        Effect.gen(function* responses() {
          const page = yield* Hosted;
          const item = yield* Effect.orDie(hostedItem(enterNumbers, golden.name));

          for (const scripted of scripts[golden.name]) {
            yield* started(page, item, {});
            yield* typed(page, scripted.entry);

            const { last, response } = yield* finished(page);

            assert.deepStrictEqual(response, jsonOf(scripted.response), scripted.why);
            assert.deepStrictEqual(
              last ?? { list: null },
              jsonOf(scripted.response),
              `${scripted.why}: the last change relayed`,
            );
          }
        }),
    );
  }

  it.effect("EN3: the keys score 1 and every wrong or partial entry 0, on every item", () =>
    Effect.forEach(
      goldens,
      (golden) =>
        Effect.gen(function* keyScores() {
          const item = yield* Effect.orDie(hostedItem(enterNumbers, golden.name));
          const right = scripts[golden.name].filter(
            (scripted) => scoreOf(item, scripted.response) === 1,
          );

          assert.isAbove(right.length, 0, `${golden.name} has an entry that scores`);
          assert.isTrue(
            scripts[golden.name]
              .filter((scripted) => scripted.response === null)
              .every((scripted) => scoreOf(item, scripted.response) === 0),
            `${golden.name}: NULL scores 0`,
          );
        }),
      { discard: true },
    ),
  );

  it.effect("EN2: a key that begins no admitted number changes nothing", () =>
    Effect.gen(function* refusals() {
      const page = yield* Hosted;
      const fraction = yield* Effect.orDie(hostedItem(enterNumbers, "fraction-sum"));
      const decimal = yield* Effect.orDie(hostedItem(enterNumbers, "decimal-sum"));

      yield* started(page, fraction, {});
      yield* typed(page, ["05", "07"]);
      assert.deepStrictEqual(
        yield* boxTexts(page),
        ["0", "7"],
        "no leading zero; no zero first in a denominator",
      );
      yield* typed(page, ["", "1234"]);
      assert.deepStrictEqual(yield* boxTexts(page), ["0", "712"], "no digit past the box's three");

      yield* started(page, decimal, {});
      yield* typed(page, [".3.7.5"]);
      assert.deepStrictEqual(yield* boxTexts(page), ["3.75"], "no point first, no second point");
      yield* started(page, decimal, {});
      yield* typed(page, ["123456"]);
      assert.deepStrictEqual(yield* boxTexts(page), ["12345"], "no digit past five");
      yield* typed(page, ["."]);
      assert.deepStrictEqual(
        yield* boxTexts(page),
        ["12345"],
        "no point with no digit left to follow it",
      );
    }),
  );

  it.effect("EN4: an entry emptied again is NULL, and a change of mind gives the last value", () =>
    Effect.gen(function* emptied() {
      const page = yield* Hosted;
      const item = yield* Effect.orDie(hostedItem(enterNumbers, "fraction-sum"));
      yield* started(page, item, {});

      const screen = yield* Effect.orDie(page.read(readScreen));
      const backspace = screen.keys.find((key) => key.label === "Backspace");

      assert.isDefined(backspace);
      yield* typed(page, ["5", "7"]);
      yield* Effect.orDie(page.tapAt([backspace.centre]));
      assert.deepStrictEqual(
        (yield* finished(page)).response,
        jsonOf(null),
        "the denominator deleted",
      );

      yield* started(page, item, {});
      yield* typed(page, ["4", "7"]);
      yield* typed(page, [""]);
      yield* Effect.orDie(page.tapAt([backspace.centre]));
      yield* typed(page, ["5"]);
      assert.deepStrictEqual(
        (yield* finished(page)).response,
        jsonOf([5, 7]),
        "4/7 changed to 5/7",
      );
    }),
  );

  it.effect(
    "EN5: coming back, the stored response decides and a state writing it keeps its spelling",
    () =>
      Effect.gen(function* resume() {
        const page = yield* Hosted;
        const fraction = yield* Effect.orDie(hostedItem(enterNumbers, "fraction-sum"));
        const mixed = yield* Effect.orDie(hostedItem(enterNumbers, "mixed-product"));
        const decimal = yield* Effect.orDie(hostedItem(enterNumbers, "decimal-sum"));
        const pair = yield* Effect.orDie(hostedItem(enterNumbers, "quotient-remainder"));

        yield* started(page, fraction, { boundTo: bound([5, 7]) });
        assert.deepStrictEqual(yield* boxTexts(page), ["5", "7"]);
        yield* started(page, fraction, { boundTo: bound([5, 7]), state: { boxes: ["10", "14"] } });
        assert.deepStrictEqual(
          yield* boxTexts(page),
          ["10", "14"],
          "the state writes the bound value",
        );
        yield* started(page, fraction, { boundTo: bound([5, 7]), state: { boxes: ["3", "7"] } });
        assert.deepStrictEqual(yield* boxTexts(page), ["5", "7"], "the state writes another value");
        yield* started(page, fraction, { boundTo: { list: null } });
        assert.deepStrictEqual(yield* boxTexts(page), ["", ""]);
        yield* started(page, fraction, { state: { boxes: ["5", ""] } });
        assert.deepStrictEqual(yield* boxTexts(page), ["5", ""], "nothing bound: the state alone");
        yield* started(page, mixed, { boundTo: bound([5, 2]) });
        assert.deepStrictEqual(
          yield* boxTexts(page),
          ["2", "1", "2"],
          "a mixed number comes back as its whole part and the rest",
        );
        yield* started(page, mixed, { boundTo: bound([1, 2]) });
        assert.deepStrictEqual(yield* boxTexts(page), ["", "1", "2"], "below 1, no whole part");
        yield* started(page, mixed, { boundTo: bound([3, 1]) });
        assert.deepStrictEqual(
          yield* boxTexts(page),
          ["3", "", ""],
          "a whole number comes back in the whole-number box alone",
        );
        yield* started(page, decimal, { boundTo: bound([15, 4]) });
        assert.deepStrictEqual(yield* boxTexts(page), ["3.75"]);
        yield* started(page, pair, { boundTo: bound([246, 4]) });
        assert.deepStrictEqual(yield* boxTexts(page), ["246", "4"]);
        assert.deepStrictEqual(
          (yield* finished(page)).response,
          jsonOf([246, 4]),
          "it gives back what it was bound to",
        );
      }),
  );

  it.effect("EN6: an item the PCI cannot read fails to run", () =>
    Effect.gen(function* refused() {
      const page = yield* Hosted;
      const item = yield* Effect.orDie(hostedItem(enterNumbers, "fraction-sum"));
      const pair = yield* Effect.orDie(hostedItem(enterNumbers, "quotient-remainder"));
      const cases: readonly (readonly [string, HostedItem, Start])[] = [
        ["no entry kind", withProperties(item, { entry: undefined }), {}],
        ["an unknown kind", withProperties(item, { entry: "percent" }), {}],
        ["no digits", withProperties(item, { digits: undefined }), {}],
        ["digits with a leading zero", withProperties(item, { digits: "03" }), {}],
        ["a fraction of five digits", withProperties(item, { digits: "5" }), {}],
        ["an unknown property", withProperties(item, { target: "5" }), {}],
        [
          "two marks for a fraction",
          {
            ...item,
            markup: '<p><span class="alpha-entry"></span><span class="alpha-entry"></span></p>',
          },
          {},
        ],
        [
          "one mark for whole boxes",
          { ...pair, markup: '<p><span class="alpha-entry"></span></p>' },
          {},
        ],
        [
          "a picture in the markup",
          {
            ...item,
            markup: '<p><img src="x.svg" alt="x"><span class="alpha-entry"></span></p>',
          },
          {},
        ],
        ["text outside a line", { ...item, markup: '5/7 <span class="alpha-entry"></span>' }, {}],
        ["a bound value not in lowest terms", item, { boundTo: { list: { integer: [10, 14] } } }],
        ["a bound zero denominator", item, { boundTo: { list: { integer: [5, 0] } } }],
        ["a bound single value", item, { boundTo: { base: { integer: 5 } } }],
      ];

      yield* Effect.forEach(
        cases,
        ([why, broken, start]) =>
          Effect.gen(function* refusedCase() {
            const settled = yield* Effect.orDie(page.start(broken, start));

            assert.strictEqual(settled.kind, "failed", why);
          }),
        { discard: true },
      );

      assert.strictEqual(
        (yield* Effect.orDie(page.start(withProperties(item, { catalogIdref: "audio-stem" }), {})))
          .kind,
        "ready",
        "data-catalog-idref is QTI's own and passed over",
      );
    }),
  );

  it.effect(
    "EN7: the keyboard types into the focused box, / moves to the denominator, Backspace deletes",
    () =>
      Effect.gen(function* keyboard() {
        const page = yield* Hosted;
        const item = yield* Effect.orDie(hostedItem(enterNumbers, "fraction-sum"));

        yield* started(page, item, {});
        yield* Effect.orDie(page.press(["Tab", "1", "0", "/", "1", "4", "4", "Backspace"]));
        assert.deepStrictEqual(yield* boxTexts(page), ["10", "14"]);
        yield* Effect.orDie(page.press(["Shift+Tab", "Backspace", "Backspace", "5"]));
        assert.deepStrictEqual((yield* finished(page)).response, jsonOf([5, 14]));
      }),
  );

  it.effect(
    "EN9: every value an entry writes comes back, answering and in review, as a value its boxes write",
    () =>
      Effect.gen(function* roundTrip() {
        const page = yield* Hosted;
        const fraction = yield* Effect.orDie(hostedItem(enterNumbers, "fraction-sum"));
        const mixed = yield* Effect.orDie(hostedItem(enterNumbers, "mixed-product"));
        const decimal = yield* Effect.orDie(hostedItem(enterNumbers, "decimal-sum"));
        const digit = Array.from({ length: 10 }, (_unused, index) => String(index));
        const cases: readonly (readonly [HostedItem, readonly (readonly string[])[]])[] = [
          [
            withProperties(fraction, { digits: "1" }),
            digit.flatMap((numerator) =>
              digit.slice(1).map((denominator) => [numerator, denominator]),
            ),
          ],
          [
            withProperties(mixed, { digits: "1" }),
            ["", "1", "9"].flatMap((whole) =>
              digit.flatMap((numerator) =>
                digit.slice(1).map((denominator) => [whole, numerator, denominator]),
              ),
            ),
          ],
          [
            withProperties(decimal, { digits: "2" }),
            [
              ...Array.from({ length: 100 }, (_unused, index) => [String(index)]),
              ...digit.flatMap((whole) => digit.map((tenth) => [`${whole}.${tenth}`])),
            ],
          ],
        ];

        const space = cases.flatMap(([item, entries]) => {
          const values = new Map(
            entries.map((texts) => {
              const value = writtenValue(texts);

              return [value.join("/"), value] as const;
            }),
          );

          return [...values.values()].flatMap((value) =>
            ["interacting", "closed"].map((status) => ({ item, status, value })),
          );
        });

        yield* Effect.forEach(
          space,
          ({ item, status, value }) =>
            Effect.gen(function* boundAgain() {
              const why = `${String(item.properties["entry"])} ${value.join("/")} ${status}`;

              yield* started(page, item, { boundTo: bound(value), status });
              assert.deepStrictEqual(writtenValue(yield* boxTexts(page)), value, why);
              assert.deepStrictEqual((yield* finished(page)).response, jsonOf(value), why);
            }),
          { discard: true },
        );
      }),
  );

  it.effect("EN8: in review the PCI takes no key and no tap", () =>
    Effect.gen(function* review() {
      const page = yield* Hosted;
      const item = yield* Effect.orDie(hostedItem(enterNumbers, "fraction-sum"));

      yield* started(page, item, { boundTo: { list: { integer: [5, 7] } }, status: "closed" });

      const shown = yield* Effect.orDie(page.read(readScreen));

      assert.isTrue(
        shown.keys.every((key) => key.disabled),
        "every key disabled",
      );
      yield* typed(page, ["9", ""]).pipe(Effect.ignore);
      yield* Effect.orDie(page.press(["Tab", "9"]));
      assert.deepStrictEqual(yield* boxTexts(page), ["5", "7"]);
    }),
  );
});
