/**
 * The tap-point PCI (`urn:fdc:alpha.school:2026:tap-point`) held to the assessment lead's K–5 TEI
 * list (2026-11-19, rows 8 and 9) on the suite's synthetic items (`fixtures/alpha/tap-point/`: two
 * number lines labelled only at their ends, two first-quadrant grids), each run with plate's module
 * file in plate's own PCI frame in headless Google Chrome (`#specimen/alpha/hosted-pci.ts`). The
 * rules are written from the specification, never from the module's code. Where a tick or an
 * intersection is, is read from what is drawn: a line's ticks are its vertical strokes, a grid's
 * columns and rows stand at its axes' numerals.
 *
 * - TP1, the screen: a line shows its ticks evenly spaced, the start's numeral under the first and
 *   the end's under the last and no other text; a grid shows every unit numbered on both axes and
 *   both titles. Nothing is marked.
 * - TP2, tapping: a tap within 20 px of a tick or an intersection (inside its 44 px target) marks it;
 *   a tap on the marked one takes the mark away; a tap on another moves it. One mark at most.
 * - TP3, the response: a line's tick place `{ base: { integer: k } }`, a grid's `{ list: { integer:
 *   [x, y] } }`, NULL with nothing marked; `match_correct` scores the key 1 and a swapped pair 0;
 *   the last change relayed is the response completed with.
 * - TP4, coming back: bound to a point the PCI marks it and gives it back; NULL marks none.
 * - TP5, refusals: properties it cannot read, the other kind's property, or markup fail it.
 * - TP6, the keyboard: the figure is a tab stop, the arrows move, Enter or Space taps.
 * - TP7, review: a PCI not interacting takes no tap.
 *
 * @module
 */
import { assert, layer } from "@effect/vitest";
import { Context, Effect, Layer } from "effect";
import { tapPoint } from "@qti-pie/plate/alpha/pci-modules";
import { hostedItem, hostedPage } from "#specimen/alpha/hosted-pci.ts";
import type { HostedItem, HostedPage, Point, Start } from "#specimen/alpha/hosted-pci.ts";

/**
 * How far from a point a tap still lands on it: inside half of WCAG 2.2's 44 px target.
 */
const offTarget = 20;

/**
 * What the frame shows: the line's ticks (vertical strokes crossing the line) or the grid's
 * columns and rows (the x numerals' centres across and the y numerals' up), every text drawn, and
 * the marks (circles), each in the frame's document.
 */
interface Figure {
  readonly columns: readonly { readonly at: number; readonly text: string }[];
  /**
   * Whether the whole figure lies inside the frame's width.
   */
  readonly fits: boolean;
  readonly marks: readonly Point[];
  readonly rows: readonly { readonly at: number; readonly text: string }[];
  readonly texts: readonly string[];
  readonly ticks: readonly Point[];
}

/**
 * Read what the frame shows, in the frame's document.
 *
 * @returns The figure.
 */
const readFigure = (): Figure => {
  const svg = document.querySelector("[data-pci-dom] svg");
  const placed = [...(svg?.querySelectorAll("line, text, circle") ?? [])].map((element) => {
    const box = element.getBoundingClientRect();

    return { centre: { x: box.x + box.width / 2, y: box.y + box.height / 2 }, element };
  });
  const centres = new Map(placed.map(({ centre, element }) => [element, centre]));
  const centre = (element: Element): Point =>
    centres.get(element) ?? { x: Number.NaN, y: Number.NaN };
  const lines = [...(svg?.querySelectorAll("line") ?? [])];
  const strokes = lines.filter((line) => getComputedStyle(line).stroke === "rgb(51, 51, 51)");
  const horizontal = strokes.find((line) => line.getAttribute("y1") === line.getAttribute("y2"));
  const axisY = horizontal === undefined ? Number.NaN : centre(horizontal).y;
  const texts = [...(svg?.querySelectorAll("text") ?? [])];
  const numerals = texts.filter(
    (text) =>
      text.textContent !== "" &&
      text.textContent.split("").every((character) => character >= "0" && character <= "9"),
  );
  const below = numerals.filter((text) => text.getAttribute("text-anchor") !== "end");
  const beside = numerals.filter((text) => text.getAttribute("text-anchor") === "end");

  return {
    columns: below.map((text) => ({ at: centre(text).x, text: text.textContent })),
    fits:
      (svg?.getBoundingClientRect().right ?? Number.POSITIVE_INFINITY) <=
      document.documentElement.clientWidth,
    marks: [...(svg?.querySelectorAll("circle") ?? [])].map(centre),
    rows: beside.map((text) => ({ at: centre(text).y, text: text.textContent })),
    texts: texts.map((text) => text.textContent),
    ticks: strokes
      .filter((line) => line.getAttribute("x1") === line.getAttribute("x2"))
      .map((line) => ({ x: centre(line).x, y: axisY })),
  };
};

/**
 * Where a line's tick or a grid's intersection is on screen.
 *
 * @param figure What is drawn.
 * @param point The tick's place `[k, 0]` or the intersection `[x, y]`.
 * @returns Its centre.
 */
const placeOf = (figure: Figure, [x, y]: readonly [number, number]): Point => {
  if (figure.ticks.length > 0 && figure.rows.length === 0) {
    return figure.ticks[x] ?? { x: Number.NaN, y: Number.NaN };
  }

  return {
    x: figure.columns.find((column) => Number(column.text) === x)?.at ?? Number.NaN,
    y: figure.rows.find((row) => Number(row.text) === y)?.at ?? Number.NaN,
  };
};

/**
 * The Appendix C JSON of a line's single integer response, `{ base: null }` for NULL.
 *
 * @param tick The tick's place, `null` for NULL.
 * @returns The JSON.
 */
const lineJson = (tick: number | null) =>
  tick === null ? { base: null } : { base: { integer: tick } };

/**
 * The Appendix C JSON of a grid's ordered integer response, `{ list: null }` for NULL.
 *
 * @param point The point's coordinates, `null` for NULL.
 * @returns The JSON.
 */
const gridJson = (point: readonly number[] | null) =>
  point === null ? { list: null } : { list: { integer: point } };

/**
 * The page the rules drive, held for the whole file.
 */
class Hosted extends Context.Service<Hosted, HostedPage>()(
  "specimen/alpha/tap-point.test/Hosted",
) {}

/**
 * Open {@link Hosted}, closed when the file ends.
 */
const HostedLayer = Layer.effect(Hosted, Effect.orDie(hostedPage(tapPoint)));

/**
 * Start a fresh frame for an item and require it ready.
 *
 * @param page The page.
 * @param item The item.
 * @param start The response it is bound to, the state and the status.
 * @returns What it draws.
 */
const started = Effect.fnUntraced(function* started(
  page: HostedPage,
  item: HostedItem,
  start: Start,
) {
  const ready = yield* Effect.orDie(page.start(item, start));

  assert.strictEqual(ready.kind, "ready", `the PCI runs: ${ready.reason ?? ""}`);

  return yield* Effect.orDie(page.read(readFigure));
});

/**
 * Tap points of the figure, each a little off its centre, inside its target.
 *
 * @param page The page.
 * @param figure What is drawn.
 * @param points The points.
 * @returns Once tapped.
 */
const tapped = (page: HostedPage, figure: Figure, points: readonly (readonly [number, number])[]) =>
  Effect.orDie(
    page.tapAt(
      points.map((point, index) => {
        const at = placeOf(figure, point);
        const off = index % 2 === 0 ? offTarget : -offTarget;

        return { x: at.x + off, y: at.y - off };
      }),
    ),
  );

/**
 * Complete the frame: the response it completed with and the last change it relayed.
 *
 * @param page The page.
 * @returns Both, as the frame posted them.
 */
const finished = Effect.fnUntraced(function* finished(page: HostedPage) {
  const completed = yield* Effect.orDie(page.complete);
  const messages = yield* Effect.orDie(page.messages);
  const last = messages.findLast((message) => message.kind === "changed")?.value;

  return { last, response: completed.response };
});

/**
 * The score `match_correct` gives a response against the item's key.
 *
 * @param item The item.
 * @param response The integers, `null` for NULL.
 * @returns 1 or 0.
 */
const scoreOf = (item: HostedItem, response: readonly number[] | null): number =>
  response !== null &&
  response.length === item.correct.length &&
  response.every((value, index) => value === item.correct[index])
    ? 1
    : 0;

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

layer(HostedLayer)("the tap-point PCI", (it) => {
  for (const [name, parts, ends] of [
    ["line-0-1-5", 5, ["0", "1"]],
    ["line-0-2-8", 8, ["0", "2"]],
  ] as const) {
    it.effect(
      `TP1: ${name} draws its ticks evenly with numerals at its ends alone, nothing marked`,
      () =>
        Effect.gen(function* lineScreen() {
          const page = yield* Hosted;
          const item = yield* Effect.orDie(hostedItem(tapPoint, name));
          const figure = yield* started(page, item, {});
          const gaps = figure.ticks
            .slice(1)
            .map((tick, index) => tick.x - (figure.ticks[index]?.x ?? 0));

          assert.strictEqual(figure.ticks.length, parts + 1, "a tick at each cut and at both ends");
          assert.isTrue(
            gaps.every((gap) => Math.abs(gap - (gaps[0] ?? 0)) < 0.5),
            "equal parts",
          );
          assert.isAtLeast(gaps[0] ?? 0, 44, "a tick's 44 px target clears its neighbours");
          assert.deepStrictEqual(
            figure.texts,
            ends,
            "the numerals of its two ends and nothing else",
          );
          assert.isTrue(
            figure.columns.every(
              (column, index) =>
                Math.abs(column.at - (figure.ticks[index === 0 ? 0 : parts]?.x ?? 0)) < 0.5,
            ),
            "each end's numeral under its tick",
          );
          assert.deepStrictEqual(figure.marks, [], "nothing marked");
          assert.isTrue(figure.fits, "the whole line fits AlphaTest's frame");
        }),
    );
  }

  for (const [name, size, titles] of [
    ["grid-10", 10, ["Days", "Pages read"]],
    ["grid-5", 5, ["Steps", "Height"]],
  ] as const) {
    it.effect(
      `TP1: ${name} numbers every unit on both axes and draws both titles, nothing marked`,
      () =>
        Effect.gen(function* gridScreen() {
          const page = yield* Hosted;
          const item = yield* Effect.orDie(hostedItem(tapPoint, name));
          const figure = yield* started(page, item, {});
          const units = Array.from({ length: size + 1 }, (_unused, unit) => String(unit));

          assert.deepStrictEqual(
            figure.columns.map((column) => column.text),
            units,
          );
          assert.deepStrictEqual(
            figure.rows.map((row) => row.text),
            units,
          );
          assert.includeMembers([...figure.texts], [...titles]);
          assert.isTrue(
            figure.rows.every(
              (row, index) => index === 0 || row.at < (figure.rows[index - 1]?.at ?? 0),
            ),
            "y counts up the screen",
          );
          assert.deepStrictEqual(figure.marks, [], "nothing marked");
        }),
    );
  }

  it.effect(
    "TP2, TP3: a line marks the tapped tick, unmarks it, moves it, and gives the tick's place",
    () =>
      Effect.gen(function* line() {
        const page = yield* Hosted;
        const item = yield* Effect.orDie(hostedItem(tapPoint, "line-0-1-5"));
        const scripts: readonly (readonly [
          readonly (readonly [number, number])[],
          number | null,
          string,
        ])[] = [
          [[[2, 0]], 2, "the key, 2/5"],
          [[[3, 0]], 3, "3/5"],
          [[[5, 0]], 5, "the end tick, 1"],
          [[[0, 0]], 0, "the start tick, 0"],
          [
            [
              [2, 0],
              [2, 0],
            ],
            null,
            "tapped and untapped",
          ],
          [
            [
              [1, 0],
              [2, 0],
            ],
            2,
            "a change of mind",
          ],
          [[], null, "untouched"],
        ];

        yield* Effect.forEach(
          scripts,
          ([taps, expected, why]) =>
            Effect.gen(function* lineScript() {
              const figure = yield* started(page, item, {});

              yield* tapped(page, figure, taps);

              const after = yield* Effect.orDie(page.read(readFigure));

              assert.strictEqual(
                after.marks.length,
                expected === null ? 0 : 1,
                `${why}: one mark at most`,
              );

              if (expected !== null) {
                const at = placeOf(after, [expected, 0]);

                assert.isBelow(
                  Math.hypot((after.marks[0]?.x ?? 0) - at.x, (after.marks[0]?.y ?? 0) - at.y),
                  1,
                  `${why}: the ring on its tick`,
                );
              }

              const { last, response } = yield* finished(page);

              assert.deepStrictEqual(response, lineJson(expected), why);
              assert.deepStrictEqual(
                last,
                taps.length === 0 ? undefined : lineJson(expected),
                `${why}: the last change relayed`,
              );
              assert.strictEqual(
                scoreOf(item, expected === null ? null : [expected]),
                expected === 2 ? 1 : 0,
                `${why}: scored`,
              );
            }),
          { discard: true },
        );
      }),
  );

  it.effect(
    "TP2, TP3: a grid dots the tapped intersection, undots it, moves it, and gives [x, y]",
    () =>
      Effect.gen(function* grid() {
        const page = yield* Hosted;
        const item = yield* Effect.orDie(hostedItem(tapPoint, "grid-10"));
        const scripts: readonly (readonly [
          readonly (readonly [number, number])[],
          readonly number[] | null,
          string,
        ])[] = [
          [[[3, 6]], [3, 6], "the key"],
          [[[6, 3]], [6, 3], "swapped"],
          [[[0, 0]], [0, 0], "the origin"],
          [[[10, 10]], [10, 10], "the far corner"],
          [
            [
              [3, 6],
              [3, 6],
            ],
            null,
            "tapped and untapped",
          ],
          [
            [
              [4, 6],
              [3, 6],
            ],
            [3, 6],
            "a change of mind",
          ],
          [[], null, "untouched"],
        ];

        yield* Effect.forEach(
          scripts,
          ([taps, expected, why]) =>
            Effect.gen(function* gridScript() {
              const figure = yield* started(page, item, {});

              yield* tapped(page, figure, taps);

              const after = yield* Effect.orDie(page.read(readFigure));

              assert.strictEqual(
                after.marks.length,
                expected === null ? 0 : 1,
                `${why}: one dot at most`,
              );

              if (expected !== null) {
                const at = placeOf(after, [expected[0] ?? 0, expected[1] ?? 0]);

                assert.isBelow(
                  Math.hypot((after.marks[0]?.x ?? 0) - at.x, (after.marks[0]?.y ?? 0) - at.y),
                  1,
                  `${why}: the dot on its intersection`,
                );
              }

              const { last, response } = yield* finished(page);

              assert.deepStrictEqual(response, gridJson(expected), why);
              assert.deepStrictEqual(
                last,
                taps.length === 0 ? undefined : gridJson(expected),
                `${why}: the last change relayed`,
              );
              assert.strictEqual(
                scoreOf(item, expected),
                why === "the key" || why === "a change of mind" ? 1 : 0,
                `${why}: scored`,
              );
            }),
          { discard: true },
        );
      }),
  );

  it.effect("TP4: coming back, the bound point is marked and given back; NULL marks none", () =>
    Effect.gen(function* resume() {
      const page = yield* Hosted;
      const line = yield* Effect.orDie(hostedItem(tapPoint, "line-0-1-5"));
      const grid = yield* Effect.orDie(hostedItem(tapPoint, "grid-10"));
      const lineFigure = yield* started(page, line, { boundTo: { base: { integer: 2 } } });

      assert.strictEqual(lineFigure.marks.length, 1);
      assert.deepStrictEqual((yield* finished(page)).response, lineJson(2));

      const gridFigure = yield* started(page, grid, { boundTo: { list: { integer: [3, 6] } } });
      const at = placeOf(gridFigure, [3, 6]);

      assert.isBelow(
        Math.hypot((gridFigure.marks[0]?.x ?? 0) - at.x, (gridFigure.marks[0]?.y ?? 0) - at.y),
        1,
      );
      assert.deepStrictEqual((yield* finished(page)).response, gridJson([3, 6]));
      assert.deepStrictEqual((yield* started(page, grid, { boundTo: { list: null } })).marks, []);
    }),
  );

  it.effect("TP5: an item the PCI cannot read fails to run", () =>
    Effect.gen(function* refused() {
      const page = yield* Hosted;
      const line = yield* Effect.orDie(hostedItem(tapPoint, "line-0-1-5"));
      const grid = yield* Effect.orDie(hostedItem(tapPoint, "grid-10"));
      const cases: readonly (readonly [string, HostedItem, Start])[] = [
        ["no kind", withProperties(line, { kind: undefined }), {}],
        ["an unknown kind", withProperties(line, { kind: "circle" }), {}],
        ["one part", withProperties(line, { parts: "1" }), {}],
        ["thirteen parts", withProperties(line, { parts: "13" }), {}],
        ["an end before the start", withProperties(line, { end: "0", start: "1" }), {}],
        ["a grid's property on a line", withProperties(line, { size: "10" }), {}],
        ["a grid of eleven", withProperties(grid, { size: "11" }), {}],
        ["an empty title", withProperties(grid, { xTitle: "" }), {}],
        ["a line's property on a grid", withProperties(grid, { parts: "4" }), {}],
        ["markup", { ...line, markup: "<p>0</p>" }, {}],
        ["a bound tick past the end", line, { boundTo: { base: { integer: 6 } } }],
        ["a bound pair on a line", line, { boundTo: { list: { integer: [3, 0] } } }],
        ["a bound point off the grid", grid, { boundTo: { list: { integer: [4, 11] } } }],
      ];

      yield* Effect.forEach(
        cases,
        ([why, broken, start]) =>
          Effect.gen(function* refusedCase() {
            assert.strictEqual(
              (yield* Effect.orDie(page.start(broken, start))).kind,
              "failed",
              why,
            );
          }),
        { discard: true },
      );
    }),
  );

  it.effect("TP6: the keyboard moves over the points and Enter or Space taps", () =>
    Effect.gen(function* keyboard() {
      const page = yield* Hosted;
      const line = yield* Effect.orDie(hostedItem(tapPoint, "line-0-1-5"));
      const grid = yield* Effect.orDie(hostedItem(tapPoint, "grid-10"));

      yield* started(page, line, {});
      yield* Effect.orDie(page.press(["Tab", "ArrowRight", "ArrowRight", "Enter"]));
      assert.deepStrictEqual((yield* finished(page)).response, lineJson(2));

      yield* started(page, grid, {});
      yield* Effect.orDie(
        page.press([
          "Tab",
          ...Array.from({ length: 3 }, () => "ArrowRight"),
          ...Array.from({ length: 6 }, () => "ArrowUp"),
          "Space",
          "Space",
        ]),
      );
      assert.deepStrictEqual(
        (yield* finished(page)).response,
        gridJson(null),
        "Space taps, and taps again",
      );
      yield* started(page, grid, {});
      yield* Effect.orDie(
        page.press([
          "Tab",
          ...Array.from({ length: 3 }, () => "ArrowRight"),
          ...Array.from({ length: 6 }, () => "ArrowUp"),
          "Space",
        ]),
      );
      assert.deepStrictEqual((yield* finished(page)).response, gridJson([3, 6]));
    }),
  );

  it.effect("TP7: in review the PCI takes no tap", () =>
    Effect.gen(function* review() {
      const page = yield* Hosted;
      const grid = yield* Effect.orDie(hostedItem(tapPoint, "grid-10"));
      const figure = yield* started(page, grid, {
        boundTo: { list: { integer: [3, 6] } },
        status: "closed",
      });

      yield* tapped(page, figure, [[1, 1]]);
      yield* Effect.orDie(page.press(["Tab", "Enter"]));

      const at = placeOf(figure, [3, 6]);
      const after = yield* Effect.orDie(page.read(readFigure));

      assert.strictEqual(after.marks.length, 1);
      assert.isBelow(
        Math.hypot((after.marks[0]?.x ?? 0) - at.x, (after.marks[0]?.y ?? 0) - at.y),
        1,
      );
    }),
  );
});
