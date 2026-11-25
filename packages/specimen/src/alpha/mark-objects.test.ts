/**
 * The mark-objects PCI (`urn:fdc:alpha.school:2026:mark-objects`) held to its form: the product
 * the assessment lead specifies (a child marks objects by tapping to ring them, a second tap takes
 * the ring away, and the count ringed is scored), and the QTI 3.0.1 form that carries it, its typed
 * properties `data-objects`, `data-layout` (`rows` or `scatter`) and `data-per-row` (for rows) and
 * its markup's one `img`, the picture of one object. On seven synthetic mark items (rows with a
 * short last row, full rows, one row, and scatters of seven, eight, nine and ten objects, two of
 * the items take-aways), made up, their ids, objects, counts, stems and keys, each read from the
 * package's fixture `fixtures/alpha/mark-objects/` and run with plate's module file in plate's own
 * PCI frame in headless Google Chrome, its objects tapped with the pointer
 * (`#specimen/alpha/mark-objects.ts`). The rules are written here from the form, transcribed apart
 * from the module, never from the PCI's code:
 *
 * - MO0, before the module runs: the frame shows its markup while the module loads, the one picture
 *   of an object and nothing else: no other element, no text.
 * - MO1, the screen: the item shows exactly its count of objects, each the picture of one object,
 *   loaded, and nothing more, each picture at its 60 CSS pixels in the middle of a cell 1.25 times
 *   its side, laid out as its item says: rows of `perRow` with the last row the rest (one row where
 *   `perRow` is the count), the cells side by side across and down and each column at one place in
 *   every row; or scattered as the form places them, by the golden angle from the middle outwards,
 *   scaled so that no two centres stand closer than 1.6 sides, none touching and evenly spread. The
 *   frame holds no text at all: no count, no numeral.
 * - MO2, the ring: a tapped object gets one ring, a circle unfilled and stroked `#1d6fd1`, centred on
 *   the object and around it (radius 0.56 and stroke 0.10 of the picture's side, inside its cell),
 *   and is pressed; a second tap takes the ring away. An object holds its picture and, ringed, that
 *   ring, and nothing else: never an X, never a strike-through. All of it as the browser renders
 *   it, a stylesheet's rule counting as markup: the ring's computed stroke and fill, shown whole
 *   (opaque, visible), nothing clipping it, and no picture, background or pseudo-element content
 *   drawn on an object.
 * - MO3, the response: the response is the number of objects ringed at submit, the Appendix C JSON `{
 *   base: { integer: n } }`, NULL `{ base: null }` when none is; the last change the frame relays
 *   is the response the PCI completes with, and its state names the objects ringed, by place, in
 *   order.
 * - MO4, the golden responses: for every item, the correct marking, each systematic wrong one the
 *   specification names (every object ringed; one too few and one too many; for a take-away item
 *   the ones that leave ringed instead of the ones left) and the edge cases (nothing ringed, an
 *   object ringed and unringed, a marking corrected by a second tap, every object ringed then
 *   unringed) give the count the child left ringed. The database scores each with `match_correct`;
 *   the served proof's cases for these items carry the same responses with their expected `SCORE`.
 * - MO5, coming back: bound to a count, the PCI rings that many objects, the first by place (an
 *   object's place is its index in the order the PCI makes the objects: reading order in rows, and
 *   in a scatter from the middle outwards), and gives that count back; bound to NULL or to the
 *   integer 0 it rings none; handed a state, the JSON text its `getState` gives, it rings exactly
 *   the state's objects; handed back the state it completed with, it comes back to the very
 *   objects.
 * - MO6, refusals: an item whose layout, count, row length or picture the PCI cannot read (a count
 *   beyond the layout's most, twenty in rows and ten scattered; a row longer than ten or than the
 *   count; a markup that is not one `img`; a picture without an `alt`, or not square, from 44 to
 *   120 pixels), or that writes any `data-*` property outside the PCI's contract, fails to run
 *   rather than drawing a guess, and the error it throws is the PCI's refusal naming what broke the
 *   rule. The frame reports it `failed` with the browser's "Script error." (the module's script is
 *   cross-origin to the frame's opaque origin, so the browser withholds its error from the frame's
 *   `error` event); the page's own record of what the frame threw holds the refusal. The `data-*`
 *   attributes QTI 3.0.1's schema itself declares on the element are passed over.
 * - MO7, not answering: in review, solution or suspended, the PCI shows the rings it is bound to and
 *   a tap on an object changes nothing; once it has completed, no tap changes anything either, and
 *   the frame relays nothing more.
 * - MO8, the keyboard: Space and Enter on a focused object ring it and take its ring away, as a tap
 *   does, and Tab moves to the next object.
 * - MO9, fitting: each object is drawn at its picture's `width` and `height`; in a frame narrower
 *   than the set, the whole set is scaled down to the frame's width, no object moving to another
 *   row, but never so far that a picture is less than 44 pixels wide; widened again, it comes back
 *   to its own size, never larger.
 * - MO10, forgiving: a saved state the PCI cannot use (no such text, a place outside the set or named
 *   twice) falls back to the bound count, a state's places count in any order, and a bound value
 *   that is no count of the set rings none: a saved answer never stops the PCI. A picture the host
 *   marked with attributes of its own still draws, each object's picture carrying the markup
 *   picture's `src`, `alt`, `width` and `height` alone.
 * - MO11, a swipe: in rows and in a scatter, the set and every object take every touch that starts on
 *   them as the child's (their computed `touch-action` is `none`), so a finger's swipe sideways
 *   from an object, either way, rings nothing, relays no change and takes the host page nowhere:
 *   the browser cancels none of the frame's pointers (it takes no part of the gesture), and the
 *   page's address and history stand as they were.
 *
 * @module
 */
import { assert, layer } from "@effect/vitest";
import { Context, Duration, Effect, Layer } from "effect";
import { markItem, ringPage } from "#specimen/alpha/mark-objects.ts";
import type {
  Drawn,
  DrawnObject,
  FrameMessage,
  MarkItem,
  RingPage,
  Start,
} from "#specimen/alpha/mark-objects.ts";

/**
 * How long a rule may take before vitest fails it bare: a hang guard, never a budget.
 */
const ruleHang = 300_000;

/**
 * The ring's colour, the drawing guide's ring rule (`#1d6fd1`), as the browser computes it.
 */
const ringColour = "rgb(29, 111, 209)";

/**
 * An object's look beyond its elements: no pseudo-element content, no background picture, and an
 * overflow that lets its ring stand outside its box.
 */
const plainLook = { after: "none", background: "none", before: "none", overflow: "visible" };

/**
 * The form's geometry: the fixtures' pictures, 60 CSS pixels square; an object's cell, 1.25 times
 * the picture's side; the ring, a circle of radius 0.56 and stroke 0.10 of the picture's side; a
 * scattered set's least distance between two centres, 1.6 pictures' sides, and the turn from one
 * object to the next, the golden angle; and the least picture side a narrow frame scales to.
 */
const form = {
  apart: 1.6,
  cell: 1.25,
  least: 44,
  ringRadius: 0.56,
  ringStroke: 0.1,
  side: 60,
  turn: Math.PI * (3 - Math.sqrt(5)),
};

/**
 * How far a measured length may stand from its reference, in CSS pixels: the browser's layout
 * rounds to a sixty-fourth of a pixel.
 */
const pixelSlack = 0.5;

/**
 * One scattered object's centre, in CSS pixels from the start of the box the set's objects stand
 * in.
 */
interface Centre {
  readonly x: number;
  readonly y: number;
}

/**
 * A scattered set as the form places it: each object's centre by its place, and the width and
 * height of the box that holds them, in CSS pixels.
 */
interface Scattered {
  readonly centres: readonly Centre[];
  readonly height: number;
  readonly width: number;
}

/**
 * How one of the items lays its objects out, as its document says: in rows of `perRow`, or
 * scattered.
 */
type Layout = { readonly kind: "rows"; readonly perRow: number } | { readonly kind: "scatter" };

/**
 * A scattered set as the form places it, transcribed here from the form apart from the PCI: each
 * object turned the golden angle from the one before, at a distance from the middle growing as the
 * square root of its place (`√((place + ½) / count)`), the whole scaled so that the two closest
 * centres stand 1.6 sides apart, and the box the smallest that holds every object.
 *
 * @param count The objects.
 * @returns Each object's centre by its place, and the box's width and height.
 */
const scatteredBy = (count: number): Scattered => {
  const unit = Array.from({ length: count }, (_unused, place) => ({
    x: Math.sqrt((place + 0.5) / count) * Math.cos(place * form.turn),
    y: Math.sqrt((place + 0.5) / count) * Math.sin(place * form.turn),
  }));
  const pairs = unit.flatMap((one, place) =>
    unit.slice(place + 1).map((other) => Math.hypot(one.x - other.x, one.y - other.y)),
  );
  const scale = pairs.length === 0 ? 0 : (form.apart * form.side) / Math.min(...pairs);
  const xs = unit.map((centre) => centre.x * scale);
  const ys = unit.map((centre) => centre.y * scale);
  const half = (form.side * form.cell) / 2;
  const left = Math.min(...xs) - half;
  const top = Math.min(...ys) - half;

  return {
    centres: xs.map((x, place) => ({ x: x - left, y: (ys[place] ?? 0) - top })),
    height: Math.max(...ys) + half - top,
    width: Math.max(...xs) + half - left,
  };
};

/**
 * One mark item as its document gives it: its id, the object it shows and how many, its layout, the
 * count its key accepts (`qti-correct-response`), and for a take-away item how many leave.
 */
interface Golden {
  readonly correct: number;
  readonly count: number;
  readonly id: string;
  readonly layout: Layout;
  readonly leave?: number;
  readonly object: string;
}

/**
 * The seven synthetic items, from their documents.
 */
const goldens: readonly Golden[] = [
  {
    correct: 7,
    count: 11,
    id: "alpha-mark-objects-rows",
    layout: { kind: "rows", perRow: 4 },
    object: "acorn",
  },
  {
    correct: 2,
    count: 9,
    id: "alpha-mark-objects-rows-full",
    layout: { kind: "rows", perRow: 3 },
    object: "button",
  },
  {
    correct: 5,
    count: 8,
    id: "alpha-mark-objects-row-leave",
    layout: { kind: "rows", perRow: 8 },
    leave: 3,
    object: "duck",
  },
  {
    correct: 6,
    count: 8,
    id: "alpha-mark-objects-scatter",
    layout: { kind: "scatter" },
    object: "pebble",
  },
  {
    correct: 3,
    count: 7,
    id: "alpha-mark-objects-scatter-leave",
    layout: { kind: "scatter" },
    leave: 4,
    object: "leaf",
  },
  {
    correct: 4,
    count: 10,
    id: "alpha-mark-objects-scatter-ten",
    layout: { kind: "scatter" },
    object: "mushroom",
  },
  {
    correct: 7,
    count: 9,
    id: "alpha-mark-objects-scatter-nine",
    layout: { kind: "scatter" },
    object: "bell",
  },
];

/**
 * One scripted response: its name, the objects tapped in order by their place, and the count left
 * ringed, absent for none.
 */
interface Scripted {
  readonly name: string;
  readonly ringed?: number;
  readonly taps: readonly number[];
}

/**
 * Give `n` distinct places among `count` objects, the odd places first and then the even ones, so a
 * marking is never just the first objects.
 *
 * @param n How many.
 * @param count The objects.
 * @returns The places.
 */
const spread = (n: number, count: number): readonly number[] =>
  [
    ...Array.from({ length: count }, (_unused, index) => index).filter((index) => index % 2 === 1),
    ...Array.from({ length: count }, (_unused, index) => index).filter((index) => index % 2 === 0),
  ].slice(0, n);

/**
 * Give an item's scripted responses: MO4's table.
 *
 * @param golden The item.
 * @returns Its scripted responses.
 */
const scriptsOf = (golden: Golden): readonly Scripted[] => {
  const every = spread(golden.count, golden.count);
  const corrected = spread(golden.correct + 1, golden.count);

  return [
    { name: "nothing ringed", taps: [] },
    { name: "correct", ringed: golden.correct, taps: spread(golden.correct, golden.count) },
    {
      name: "correct after one ring taken away",
      ringed: golden.correct,
      taps: [...corrected, corrected[0] ?? 0],
    },
    {
      name: "one too few",
      ringed: golden.correct - 1,
      taps: spread(golden.correct - 1, golden.count),
    },
    { name: "one too many", ringed: golden.correct + 1, taps: corrected },
    { name: "every object ringed", ringed: golden.count, taps: every },
    ...(golden.leave === undefined
      ? []
      : [
          {
            name: "the ones that leave ringed",
            ringed: golden.leave,
            taps: spread(golden.leave, golden.count),
          },
        ]),
    { name: "one object ringed and unringed", taps: [0, 0] },
    { name: "every object ringed then unringed", taps: [...every, ...every] },
  ];
};

/**
 * The Appendix C JSON of a count left ringed, NULL for none (MO3).
 *
 * @param ringed The count, absent for none.
 * @returns The JSON.
 */
const responseOf = (ringed?: number) =>
  ringed === undefined ? { base: null } : { base: { integer: ringed } };

/**
 * Give the top of an object's box, in whole CSS pixels, which the objects of one row share.
 *
 * @param object The object.
 * @returns Its top.
 */
const top = (object: DrawnObject): number => Math.round(object.box.y);

/**
 * Check a row or rows against MO1's grid: each cell one cell from the one before it in its row,
 * each row one cell below the one before it, and each column at one place in every row, so the
 * short last row stands under the first objects of the rows above.
 *
 * @param golden The item.
 * @param objects Its objects, by place, which in a row or rows is reading order.
 * @param perRow The row length.
 */
const holdsGrid = (golden: Golden, objects: readonly DrawnObject[], perRow: number): void => {
  const pitch = form.side * form.cell;

  for (const [place, object] of objects.entries()) {
    const column = place % perRow;
    const first = objects[place - column];
    const above = objects[place - perRow];

    if (first !== undefined && column > 0) {
      assert.closeTo(
        object.box.x - first.box.x,
        column * pitch,
        pixelSlack,
        `${golden.id} object ${String(place)} stands one cell from its row's neighbours`,
      );
    }

    if (above !== undefined) {
      assert.closeTo(
        object.box.x,
        above.box.x,
        pixelSlack,
        `${golden.id} column ${String(column)} stands at one place`,
      );
      assert.closeTo(
        object.box.y - above.box.y,
        pitch,
        pixelSlack,
        `${golden.id} object ${String(place)} stands one cell below the row above`,
      );
    }
  }
};

/**
 * Check a scattered set against MO1's spread: no two objects' centres closer than 1.6 sides, so
 * none touches, and each object's nearest neighbour at most a quarter farther than the closest
 * pair, so the set is evenly spread.
 *
 * @param golden The item.
 * @param objects Its objects.
 */
const holdsSpread = (golden: Golden, objects: readonly DrawnObject[]): void => {
  const centres = objects.map((object) => ({
    x: object.box.x + object.box.width / 2,
    y: object.box.y + object.box.height / 2,
  }));
  const nearest = centres.map((one, place) =>
    Math.min(
      ...centres
        .filter((_other, index) => index !== place)
        .map((other) => Math.hypot(one.x - other.x, one.y - other.y)),
    ),
  );
  const closest = Math.min(...nearest);

  assert.isAtLeast(
    closest,
    form.apart * form.side - pixelSlack,
    `${golden.id}'s scattered objects stand at least 1.6 sides apart, none touching`,
  );
  assert.isAtMost(
    Math.max(...nearest),
    closest * 1.25,
    `${golden.id}'s scattered objects are evenly spread`,
  );
};

/**
 * Check what the frame shows against MO1: the count of objects, each one picture of the object, as
 * the layout places them, and no text.
 *
 * @param golden The item.
 * @param drawn What the frame shows.
 */
const holdsScreen = (golden: Golden, drawn: Drawn): void => {
  const { objects } = drawn;
  const rows = [...new Set(objects.map(top))];

  assert.strictEqual(objects.length, golden.count, `${golden.id} shows its count of objects`);
  assert.strictEqual(drawn.text.trim(), "", `${golden.id}'s frame holds no text, no numeral`);
  for (const object of objects) {
    assert.deepStrictEqual(
      object.pictures.map(({ alt, loaded }) => ({ alt, loaded })),
      [{ alt: golden.object, loaded: true }],
      `each object is one ${golden.object}, its picture loaded`,
    );
    for (const picture of object.pictures) {
      assert.closeTo(picture.width, form.side, pixelSlack, `${golden.id}'s pictures are 60 wide`);
      assert.closeTo(picture.height, form.side, pixelSlack, `${golden.id}'s pictures are 60 high`);
    }
    assert.closeTo(object.box.width, form.side * form.cell, pixelSlack, `${golden.id}'s cells`);
    assert.closeTo(object.box.height, form.side * form.cell, pixelSlack, `${golden.id}'s cells`);
  }

  switch (golden.layout.kind) {
    case "rows": {
      const { perRow } = golden.layout;

      assert.deepStrictEqual(
        rows.map((row) => objects.filter((object) => top(object) === row).length),
        Array.from({ length: Math.ceil(golden.count / perRow) }, (_unused, index) =>
          Math.min(perRow, golden.count - index * perRow),
        ),
        `${golden.id}'s objects stand in rows of ${String(perRow)}`,
      );
      holdsGrid(golden, objects, perRow);
      break;
    }
    case "scatter": {
      const box = drawn.scatter;
      const placed = scatteredBy(golden.count);

      assert.isNotNull(box, `${golden.id}'s objects stand in a scatter's box`);
      assert.closeTo(box?.width ?? 0, placed.width, pixelSlack, `${golden.id}'s scatter's width`);
      assert.closeTo(
        box?.height ?? 0,
        placed.height,
        pixelSlack,
        `${golden.id}'s scatter's height`,
      );
      for (const [place, object] of objects.entries()) {
        const centre = placed.centres[place];

        if (box !== null && centre !== undefined) {
          assert.isAtMost(
            Math.abs(object.box.x + object.box.width / 2 - (box.x + centre.x)),
            pixelSlack,
            `${golden.id} object ${String(place)} stands where the form places it, across`,
          );
          assert.isAtMost(
            Math.abs(object.box.y + object.box.height / 2 - (box.y + centre.y)),
            pixelSlack,
            `${golden.id} object ${String(place)} stands where the form places it, down`,
          );
        }
      }
      holdsSpread(golden, objects);
      break;
    }
    default: {
      golden.layout satisfies never;
    }
  }

  if (golden.layout.kind !== "scatter") {
    const reading = [...objects].toSorted(
      (left, right) => top(left) - top(right) || left.box.x - right.box.x,
    );

    assert.deepStrictEqual(reading, objects, `${golden.id}'s objects stand in reading order`);
  }
};

/**
 * Check the rings against MO2: each object of the set ringed has one ring, a circle unfilled and
 * stroked in the ring's colour, and is pressed; every other object has none and is not pressed.
 *
 * @param golden The item.
 * @param drawn What the frame shows.
 * @param ringed The objects ringed, by place.
 */
const holdsRings = (golden: Golden, drawn: Drawn, ringed: ReadonlySet<number>): void => {
  for (const [place, object] of drawn.objects.entries()) {
    const on = ringed.has(place);
    const named = `${golden.id} object ${String(place)}`;

    assert.strictEqual(object.pressed, String(on), `${named} pressed`);
    assert.deepStrictEqual(
      object.children,
      [{ descendants: [], name: "img" }, ...(on ? [{ descendants: ["circle"], name: "svg" }] : [])],
      `${named} holds its picture${on ? " and one ring" : ""} and nothing else`,
    );
    assert.deepStrictEqual(
      object.rings.map(({ elements, fill, shown, stroke }) => ({ elements, fill, shown, stroke })),
      on
        ? [
            {
              elements: ["circle"],
              fill: "none",
              shown: { opacity: 1, strokeOpacity: 1, visibility: "visible" },
              stroke: ringColour,
            },
          ]
        : [],
      `${named} ${on ? "has one blue ring, shown whole" : "has no mark"}`,
    );
    assert.deepStrictEqual(
      object.look,
      plainLook,
      `${named} has nothing drawn on it by a stylesheet`,
    );

    for (const { geometry } of object.rings) {
      assert.closeTo(
        geometry.x,
        object.box.x + object.box.width / 2,
        pixelSlack,
        `${named}'s ring is centred on it, across`,
      );
      assert.closeTo(
        geometry.y,
        object.box.y + object.box.height / 2,
        pixelSlack,
        `${named}'s ring is centred on it, down`,
      );
      assert.closeTo(
        geometry.radius,
        form.ringRadius * form.side,
        pixelSlack,
        `${named}'s ring stands around it`,
      );
      assert.closeTo(
        geometry.strokeWidth,
        form.ringStroke * form.side,
        pixelSlack / 2,
        `${named}'s ring is thick`,
      );
    }
  }
};

/**
 * Give the objects a tap sequence leaves ringed: each tap rings an object or takes its ring away.
 *
 * @param taps The places tapped, in order.
 * @returns The places left ringed.
 */
const ringedBy = (taps: readonly number[]): ReadonlySet<number> => {
  const ringed = new Set<number>();

  for (const tap of taps) {
    if (ringed.has(tap)) {
      ringed.delete(tap);
    } else {
      ringed.add(tap);
    }
  }

  return ringed;
};

/**
 * An item with its PCI's properties written otherwise.
 *
 * @param item The item.
 * @param properties The properties it is written with.
 * @returns The item so written.
 */
const written = (item: MarkItem, properties: Readonly<Record<string, string>>): MarkItem => ({
  ...item,
  properties,
});

/**
 * The page the rules drive, held for the whole file.
 */
class Ring extends Context.Service<Ring, RingPage>()("specimen/alpha/mark-objects.test/Ring") {}

/**
 * Open {@link Ring}, closed when the file ends.
 */
const RingLayer = Layer.effect(Ring, Effect.orDie(ringPage));

/**
 * Start a fresh frame for an item and require it ready, the one factory it registered the item's
 * type identifier.
 *
 * @param page The page.
 * @param item The item.
 * @param start The response it is bound to and the state it restores, each absent for none.
 * @returns Once the PCI is ready.
 */
const started = Effect.fnUntraced(function* started(page: RingPage, item: MarkItem, start: Start) {
  const ready = yield* Effect.orDie(page.start(item, start));
  const messages = yield* Effect.orDie(page.messages);

  assert.strictEqual(ready.kind, "ready", `the PCI runs: ${ready.reason ?? ""}`);
  assert.deepStrictEqual(
    messages.find((message) => message.kind === "registered")?.typeIdentifiers,
    [item.typeIdentifier],
    "the module registers the item's type identifier",
  );
});

/**
 * Complete the frame and give the response it completed with, and the last change it relayed.
 *
 * @param page The page.
 * @returns The completed response, and the last relayed change's value, `undefined` for none.
 */
const finished = Effect.fnUntraced(function* finished(page: RingPage) {
  const completed: FrameMessage = yield* Effect.orDie(page.complete);
  const messages = yield* Effect.orDie(page.messages);
  const changes = messages.filter((message) => message.kind === "changed");

  return { changed: changes.at(-1)?.value, response: completed.response, state: completed.state };
});

/**
 * Give each object's picture's drawn width, by place.
 *
 * @param drawn What the frame shows.
 * @returns The sides, in CSS pixels.
 */
const sidesOf = (drawn: Drawn): readonly number[] =>
  drawn.objects.flatMap((object) => object.pictures.map((picture) => picture.width));

/**
 * Give where the rightmost object ends.
 *
 * @param drawn What the frame shows.
 * @returns Its right edge, in CSS pixels from the frame's start.
 */
const rightmostOf = (drawn: Drawn): number =>
  Math.max(...drawn.objects.map((object) => object.box.x + object.box.width));

/**
 * Read what the frame shows until it holds, a resized frame laying out again and its resize
 * observer running between reads, at most a hundred reads (each a round trip to the frame, so
 * none waits on the rule's test clock, which never moves by itself).
 *
 * @param page The page.
 * @param holds When what the frame shows is the state awaited.
 * @returns What the frame shows, the last read when it never held.
 */
const drawnWhen = Effect.fnUntraced(function* drawnWhen(
  page: RingPage,
  holds: (drawn: Drawn) => boolean,
) {
  let drawn = yield* Effect.orDie(page.drawn);

  for (let read = 1; read < 100 && !holds(drawn); read += 1) {
    drawn = yield* Effect.orDie(page.drawn);
  }

  return drawn;
});

layer(RingLayer, { timeout: Duration.millis(ruleHang) })("the mark-objects PCI", (it) => {
  for (const golden of goldens) {
    it.effect(
      `MO0: ${golden.id} shows only its picture before its module runs`,
      () =>
        Effect.gen(function* beforeModule() {
          const page = yield* Ring;
          const item = yield* Effect.orDie(markItem(golden.id));
          const { settled, shown } = yield* Effect.orDie(page.beforeModule(item));

          assert.deepStrictEqual(
            shown,
            { elements: ["img"], pictures: 1, text: "" },
            `${golden.id}'s frame shows its one picture alone while its module loads`,
          );
          assert.strictEqual(settled.kind, "ready", `the PCI runs: ${settled.reason ?? ""}`);
          holdsScreen(golden, yield* Effect.orDie(page.drawn));
        }),
      ruleHang,
    );

    it.effect(
      `MO1–MO4: ${golden.id} shows its set and gives the count left ringed for every golden response`,
      () =>
        Effect.gen(function* goldenResponses() {
          const page = yield* Ring;
          const item = yield* Effect.orDie(markItem(golden.id));

          for (const scripted of scriptsOf(golden)) {
            yield* started(page, item, {});
            holdsScreen(golden, yield* Effect.orDie(page.drawn));
            yield* Effect.orDie(page.tap(scripted.taps));
            holdsRings(golden, yield* Effect.orDie(page.drawn), ringedBy(scripted.taps));

            const { changed, response, state } = yield* finished(page);
            const expected = responseOf(scripted.ringed);

            assert.deepStrictEqual(
              state,
              JSON.stringify({
                ringed: [...ringedBy(scripted.taps)].toSorted((left, right) => left - right),
              }),
              `${golden.id} ${scripted.name}: the state names the objects ringed`,
            );

            assert.deepStrictEqual(
              response,
              expected,
              `${golden.id} ${scripted.name}: the response`,
            );

            if (scripted.taps.length > 0) {
              assert.deepStrictEqual(
                changed,
                expected,
                `${golden.id} ${scripted.name}: the last change relayed is the response`,
              );
            }
          }
        }),
      ruleHang,
    );

    it.effect(
      `MO5: ${golden.id} comes back to the response it is bound to, and to a state`,
      () =>
        Effect.gen(function* comingBack() {
          const page = yield* Ring;
          const item = yield* Effect.orDie(markItem(golden.id));
          const first = new Set(Array.from({ length: golden.correct }, (_unused, index) => index));

          yield* started(page, item, { boundTo: responseOf(golden.correct) });
          holdsRings(golden, yield* Effect.orDie(page.drawn), first);
          yield* Effect.orDie(page.tap([golden.correct - 1]));
          assert.deepStrictEqual(
            (yield* finished(page)).response,
            responseOf(golden.correct - 1),
            `${golden.id}: bound to ${String(golden.correct)}, one ring taken away`,
          );

          yield* started(page, item, { boundTo: responseOf() });
          holdsRings(golden, yield* Effect.orDie(page.drawn), new Set());
          assert.deepStrictEqual((yield* finished(page)).response, responseOf());

          yield* started(page, item, { boundTo: { base: { integer: 0 } } });
          holdsRings(golden, yield* Effect.orDie(page.drawn), new Set());
          assert.deepStrictEqual(
            (yield* finished(page)).response,
            responseOf(),
            `${golden.id}: bound to the integer 0, none ringed, and NULL given back`,
          );

          const state = { ringed: [1, golden.count - 1] };

          yield* started(page, item, {
            boundTo: responseOf(golden.correct),
            state: JSON.stringify(state),
          });
          holdsRings(golden, yield* Effect.orDie(page.drawn), new Set(state.ringed));

          const restored = yield* finished(page);

          assert.isUndefined(restored.changed, `${golden.id}: a restored state relays no change`);
          assert.deepStrictEqual(
            restored.response,
            responseOf(state.ringed.length),
            `${golden.id}: a state's objects ringed exactly`,
          );

          const chosen = [golden.count - 1, 0];

          yield* started(page, item, {});
          yield* Effect.orDie(page.tap(chosen));

          const left = yield* finished(page);

          yield* started(page, item, { boundTo: left.response, state: left.state });
          holdsRings(golden, yield* Effect.orDie(page.drawn), new Set(chosen));
          assert.deepStrictEqual(
            (yield* finished(page)).response,
            left.response,
            `${golden.id}: handed back the state it completed with, the very objects come back`,
          );
        }),
      ruleHang,
    );
  }

  it.effect(
    "MO6: an item, a bound value or a state the PCI cannot read fails it, with the refusal naming what broke the rule",
    () =>
      Effect.gen(function* refusals() {
        const page = yield* Ring;
        const rows = yield* Effect.orDie(markItem("alpha-mark-objects-rows"));
        const scattered = yield* Effect.orDie(markItem("alpha-mark-objects-scatter"));
        const full = yield* Effect.orDie(markItem("alpha-mark-objects-rows-full"));
        const { layout: _layout, ...noLayout } = rows.properties;
        const { perRow: _perRow, ...noPerRow } = rows.properties;
        const cases: readonly {
          readonly item: MarkItem;
          readonly refusal: string;
          readonly start: Start;
        }[] = [
          {
            item: written(rows, noLayout),
            refusal: "its property data-layout is absent",
            start: {},
          },
          ...["circle", "row"].map((layout) => ({
            item: written(rows, { ...rows.properties, layout }),
            refusal: `its property data-layout is "${layout}"`,
            start: {},
          })),
          {
            item: written(rows, { ...rows.properties, objects: "21" }),
            refusal:
              "its property data-objects is 21, more than the 20 a set laid out as rows holds",
            start: {},
          },
          {
            item: written(scattered, { ...scattered.properties, objects: "11" }),
            refusal:
              "its property data-objects is 11, more than the 10 a set laid out as scatter holds",
            start: {},
          },
          {
            item: written(rows, { ...rows.properties, perRow: "11" }),
            refusal: "its property data-per-row is 11, more than the 10 a row holds",
            start: {},
          },
          {
            item: written(full, { ...full.properties, perRow: "10" }),
            refusal: "its property data-per-row is 10, more than its 9 objects",
            start: {},
          },
          ...["010", "0", "x"].map((objects) => ({
            item: written(rows, { ...rows.properties, objects }),
            refusal: `its property data-objects is "${objects}"`,
            start: {},
          })),
          {
            item: written(rows, noPerRow),
            refusal: "its property data-per-row is absent",
            start: {},
          },
          ...["0", "04", "x"].map((perRow) => ({
            item: written(rows, { ...rows.properties, perRow }),
            refusal: `its property data-per-row is "${perRow}"`,
            start: {},
          })),
          {
            item: written(scattered, { ...scattered.properties, perRow: "4" }),
            refusal: "its property data-per-row belongs to another layout than scatter",
            start: {},
          },
          ...[
            ["answer", "data-answer"],
            ["count", "data-count"],
            ["ringColour", "data-ring-colour"],
            ["seed", "data-seed"],
          ].map(([stray = "", attribute = ""]) => ({
            item: written(rows, { ...rows.properties, [stray]: "4" }),
            refusal: `its property ${attribute} is none of the PCI's`,
            start: {},
          })),
          {
            item: { ...rows, markup: "" },
            refusal: "its markup holds 0 elements; give it exactly one img",
            start: {},
          },
          {
            item: { ...rows, markup: `${rows.markup}${rows.markup}` },
            refusal: "its markup holds 2 elements; give it exactly one img",
            start: {},
          },
          {
            item: { ...rows, markup: "<span>an acorn</span>" },
            refusal: "its markup holds 1 elements and text; give it exactly one img",
            start: {},
          },
          {
            item: { ...rows, markup: `Mark them. ${rows.markup}` },
            refusal: "its markup holds 1 elements and text; give it exactly one img",
            start: {},
          },
          ...[
            [' width="60"', ' width="43"', `its picture's width is "43"`],
            [' height="60"', ' height="121"', `its picture's height is "121"`],
            [' width="60"', ' width="60px"', `its picture's width is "60px"`],
            [' width="60"', "", "its picture's width is absent"],
            [
              ' height="60"',
              ' height="61"',
              "its picture is 60 by 61; draw the object in a square",
            ],
            [' alt="acorn"', "", "its picture has no alt"],
          ].map(([from = "", to = "", refusal = ""]) => ({
            item: { ...rows, markup: rows.markup.replace(from, to) },
            refusal,
            start: {},
          })),
        ];

        for (const { item, refusal, start } of cases) {
          const outcome = yield* Effect.orDie(page.start(item, start));
          const thrown = yield* Effect.orDie(page.thrown);

          assert.strictEqual(outcome.kind, "failed", `${refusal}: the PCI does not run`);
          assert.strictEqual(thrown.length, 1, `${refusal}: the frame threw once`);
          assert.include(
            thrown[0] ?? "",
            `MarkObjectsRefusedError: The mark-objects PCI (${item.typeIdentifier}) cannot run: ${refusal}`,
            `${refusal}: the PCI refuses it, naming what broke the rule`,
          );
        }

        const qtiOwn = yield* Effect.orDie(
          page.start(
            written(scattered, {
              ...scattered.properties,
              catalogIdref: "catalog-1",
              qtiSuppressTts: "computer-read-aloud",
            }),
            {},
          ),
        );

        assert.strictEqual(
          qtiOwn.kind,
          "ready",
          "the data-* attributes QTI's schema declares on the element are passed over",
        );
      }),
    ruleHang,
  );

  it.effect(
    "MO7: in review, solution or suspended a tap changes nothing, and once completed nothing does",
    () =>
      Effect.gen(function* notAnswering() {
        const page = yield* Ring;
        const golden =
          goldens.find((each) => each.id === "alpha-mark-objects-row-leave") ??
          assert.fail("the row take-away item is among the goldens");

        const item = yield* Effect.orDie(markItem(golden.id));
        const bound = new Set([0, 1, 2]);

        for (const status of ["review", "solution", "suspended"]) {
          yield* started(page, item, { boundTo: responseOf(bound.size), status });

          const before = yield* Effect.orDie(page.drawn);

          assert.isTrue(
            before.objects.every((object) => object.disabled),
            `in ${status}, no object takes a tap`,
          );
          holdsRings(golden, before, bound);
          yield* Effect.orDie(page.tap([0, 5], true));
          holdsRings(golden, yield* Effect.orDie(page.drawn), bound);
          // The frame relays the PCI's response after any input it sees, when it differs from the last
          // it relayed, the first time included: the bound response may come back, never another.
          for (const message of yield* Effect.orDie(page.messages)) {
            if (message.kind === "changed") {
              assert.deepStrictEqual(
                message.value,
                responseOf(bound.size),
                `in ${status}, a tap changes no response`,
              );
            }
          }
        }

        yield* started(page, item, {});
        yield* Effect.orDie(page.tap([1]));
        assert.deepStrictEqual((yield* finished(page)).response, responseOf(1));
        yield* Effect.orDie(page.tap([2, 1], true));

        const after = yield* Effect.orDie(page.drawn);
        const kinds = (yield* Effect.orDie(page.messages)).map((message) => message.kind);

        assert.isTrue(
          after.objects.every((object) => object.disabled),
          "once completed, no object takes a tap",
        );
        holdsRings(golden, after, new Set([1]));
        assert.deepStrictEqual(
          kinds.slice(kinds.indexOf("completed") + 1),
          [],
          "once completed, the frame relays nothing",
        );
      }),
    ruleHang,
  );

  it.effect(
    "MO8: Space and Enter ring a focused object and take its ring away, and Tab moves to the next",
    () =>
      Effect.gen(function* keyboard() {
        const page = yield* Ring;
        const golden =
          goldens.find((each) => each.id === "alpha-mark-objects-rows") ??
          assert.fail("the rows item is among the goldens");

        const item = yield* Effect.orDie(markItem(golden.id));

        yield* started(page, item, {});
        yield* Effect.orDie(page.press(0, [" "]));
        holdsRings(golden, yield* Effect.orDie(page.drawn), new Set([0]));
        yield* Effect.orDie(page.press(0, ["Tab", "Enter"]));
        holdsRings(golden, yield* Effect.orDie(page.drawn), new Set([0, 1]));
        yield* Effect.orDie(page.press(1, ["Enter"]));
        holdsRings(golden, yield* Effect.orDie(page.drawn), new Set([0]));

        const { changed, response } = yield* finished(page);

        assert.deepStrictEqual(response, responseOf(1), "the keyboard's rings are the response");
        assert.deepStrictEqual(changed, responseOf(1), "each key's change is relayed");
      }),
    ruleHang,
  );

  it.effect(
    "MO9: a frame narrower than the set scales it down, never below a 44-pixel picture, and never up",
    () =>
      Effect.gen(function* fitting() {
        const page = yield* Ring;
        const golden =
          goldens.find((each) => each.id === "alpha-mark-objects-rows") ??
          assert.fail("the rows item is among the goldens");
        const item = yield* Effect.orDie(markItem(golden.id));
        const narrow = Math.round(form.side * form.cell * 4 * 0.85);

        yield* started(page, item, {});
        holdsScreen(golden, yield* Effect.orDie(page.drawn));
        yield* Effect.orDie(page.frameWidth(narrow));

        const fitted = yield* drawnWhen(page, (drawn) => rightmostOf(drawn) <= narrow);

        assert.isAtMost(rightmostOf(fitted), narrow, "the scaled set fits the narrow frame");
        for (const side of sidesOf(fitted)) {
          assert.isBelow(side, form.side, "each object is drawn smaller");
          assert.isAtLeast(side, form.least - pixelSlack, "each picture stays at least 44 wide");
        }
        assert.strictEqual(
          new Set(fitted.objects.map(top)).size,
          Math.ceil(golden.count / 4),
          "no object moves to another row",
        );

        yield* Effect.orDie(page.frameWidth(120));
        for (const side of sidesOf(
          yield* drawnWhen(page, (drawn) => sidesOf(drawn).every((each) => each < 45)),
        )) {
          assert.closeTo(side, form.least, pixelSlack, "never below a 44-pixel picture");
        }

        yield* Effect.orDie(page.frameWidth(1000));
        yield* drawnWhen(page, (drawn) => sidesOf(drawn).every((each) => each > 59));
        holdsScreen(golden, yield* Effect.orDie(page.drawn));
      }),
    ruleHang,
  );

  it.effect(
    "MO10: a saved state or response the PCI cannot use never stops it, and a picture the host marked still draws",
    () =>
      Effect.gen(function* forgiving() {
        const page = yield* Ring;
        const golden =
          goldens.find((each) => each.id === "alpha-mark-objects-rows") ??
          assert.fail("the rows item is among the goldens");
        const item = yield* Effect.orDie(markItem(golden.id));
        const first = new Set([0, 1, 2]);

        for (const state of [
          { ringed: [0] },
          '{"ringed":3}',
          '{"ringed":[1.5]}',
          '{"ringed":[11]}',
          '{"ringed":[-1]}',
          '{"ringed":[1,1]}',
          '{"ringed":[0],"more":1}',
          '{"ringed":',
          "{}",
          "[]",
        ]) {
          yield* started(page, item, { boundTo: responseOf(first.size), state });
          holdsRings(golden, yield* Effect.orDie(page.drawn), first);
          assert.deepStrictEqual(
            (yield* finished(page)).response,
            responseOf(first.size),
            `a state it cannot use (${JSON.stringify(state)}) falls back to the bound count`,
          );
        }

        yield* started(page, item, { state: '{"ringed":[4,1]}' });
        holdsRings(golden, yield* Effect.orDie(page.drawn), new Set([1, 4]));

        for (const boundTo of [
          { base: { integer: 12 } },
          { base: { integer: 0 } },
          { base: { integer: -1 } },
          { base: { integer: 2.5 } },
          { base: { integer: "3" } },
          { base: { string: "3" } },
          {},
          null,
        ]) {
          yield* started(page, item, { boundTo });
          holdsRings(golden, yield* Effect.orDie(page.drawn), new Set());
          assert.deepStrictEqual(
            (yield* finished(page)).response,
            responseOf(),
            `a response it cannot use (${JSON.stringify(boundTo)}) rings none`,
          );
        }

        yield* started(
          page,
          {
            ...item,
            markup: item.markup.replace("<img ", '<img data-host-unloaded="" class="host" '),
          },
          {},
        );

        const drawn = yield* Effect.orDie(page.drawn);

        holdsScreen(golden, drawn);
        for (const object of drawn.objects) {
          assert.deepStrictEqual(
            object.pictures.map((picture) => picture.attributes),
            [["alt", "draggable", "height", "src", "width"]],
            "each object's picture carries the markup picture's src, alt, width and height alone",
          );
        }
      }),
    ruleHang,
  );
  it.effect(
    "MO11: a swipe from an object rings nothing and takes the page nowhere: the set and every object take every touch",
    () =>
      Effect.gen(function* swiping() {
        const page = yield* Ring;

        for (const id of ["alpha-mark-objects-rows", "alpha-mark-objects-scatter"]) {
          const golden =
            goldens.find((each) => each.id === id) ?? assert.fail(`${id} is among the goldens`);
          const item = yield* Effect.orDie(markItem(golden.id));

          yield* started(page, item, {});

          const before = yield* Effect.orDie(page.drawn);

          assert.strictEqual(before.setTouchAction, "none", `${id}'s set takes every touch on it`);
          for (const object of before.objects) {
            assert.strictEqual(
              object.touchAction,
              "none",
              `${id}'s objects take every touch on them`,
            );
          }

          for (const by of [form.side * 4, -form.side * 4]) {
            const where = yield* Effect.orDie(page.swipe(0, by));

            assert.strictEqual(
              where.cancelled,
              0,
              `in ${id}, the browser takes no part of the swipe`,
            );
            assert.deepStrictEqual(
              where.after,
              where.before,
              `in ${id}, the page stays where it was`,
            );
          }

          holdsRings(golden, yield* Effect.orDie(page.drawn), new Set());
          // The frame relays the PCI's response after any input it sees, when it differs from the
          // last it relayed, the first time included: a swipe may relay the empty response, never
          // another.
          for (const message of yield* Effect.orDie(page.messages)) {
            if (message.kind === "changed") {
              assert.deepStrictEqual(
                message.value,
                responseOf(),
                `in ${id}, a swipe changes no response`,
              );
            }
          }

          assert.deepStrictEqual(
            (yield* finished(page)).response,
            responseOf(),
            `in ${id}, nothing is ringed`,
          );
        }
      }),
    ruleHang,
  );
});
