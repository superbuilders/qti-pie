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
 * - MO7, not answering: in suspended, closed, solution or review (every status a delivery engine
 *   passes a PCI but interacting, QTI 3.0.1's implementation guide §3.7.12.7.1), the PCI shows the
 *   rings it is bound to and a tap on an object changes nothing; once it has completed, no tap
 *   changes anything either, and the frame relays nothing more.
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
import { word } from "@bjornpagen/testing/dictionary";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import {
  array,
  boolean,
  characterOf,
  constant,
  element,
  int,
  oneOf,
  option,
  string,
} from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Context, Duration, Effect, Formatter, Layer, Option } from "effect";
import { statuses } from "#specimen/alpha/mark-objects.dictionary.ts";
import { markItem, ringPage } from "#specimen/alpha/mark-objects.ts";
import type {
  Drawn,
  DrawnObject,
  FrameMessage,
  MarkItem,
  RingPage,
  Start,
} from "#specimen/alpha/mark-objects.ts";
import { boxHolds } from "#specimen/test/box.ts";

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
const goldens: readonly [Golden, ...Golden[]] = [
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

/**
 * Give the item of an id among the goldens.
 *
 * @param id The item's id.
 * @returns The item.
 */
const goldenOf = (id: string): Golden =>
  goldens.find((each) => each.id === id) ?? assert.fail(`${id} is among the goldens`);

/**
 * The properties the form gives the PCI, by dataset name: its whole contract (MO6).
 */
const contract: ReadonlySet<string> = new Set(["layout", "objects", "perRow"]);

/**
 * The `data-*` attributes QTI 3.0.1's schema declares on `qti-portable-custom-interaction`, by
 * dataset name, the delivery engine's, which the PCI passes over (MO6).
 */
const qtiOwn: ReadonlySet<string> = new Set(["catalogIdref", "qtiSuppressTts"]);

/**
 * The form's most: the objects a set holds in rows and scattered, the objects a row holds, and a
 * picture's side in CSS pixels (MO6).
 */
const most = { perRow: 10, rows: 20, scatter: 10, side: 120 } as const;

/**
 * A picture's `alt`, kept or left out, and its `width` and `height` as written, each none when
 * left out.
 */
interface PictureWriting {
  readonly alt: boolean;
  readonly height: Option.Option<string>;
  readonly width: Option.Option<string>;
}

/**
 * The fixtures' picture as written: its `alt` the object, 60 CSS pixels square.
 */
const asWritten: PictureWriting = {
  alt: true,
  height: Option.some(String(form.side)),
  width: Option.some(String(form.side)),
};

/**
 * A piece of a markup: the item's picture, a `span` holding the object's name, or a line of text.
 */
type Piece = "picture" | "span" | "text";

/**
 * A part of the rows or the scatter item that MO6's box writes otherwise: a typed property written
 * as a text or left out, a property outside the PCI's contract written, the markup made of other
 * pieces, or the picture written otherwise.
 */
type Variation =
  | {
      readonly kind: "property";
      readonly name: "layout" | "objects" | "perRow";
      readonly written: Option.Option<string>;
    }
  | { readonly kind: "stray"; readonly name: string }
  | { readonly kind: "markup"; readonly pieces: readonly Piece[] }
  | { readonly kind: "picture"; readonly picture: PictureWriting };

/**
 * A case of MO6's box: the item varied, by its layout, and its part written otherwise.
 */
interface Varied {
  readonly layout: "rows" | "scatter";
  readonly variation: Variation;
}

/**
 * The texts MO6's box writes a count or a row length as: every text of up to two characters of 0,
 * 1, 2 and x, so every whole number to 22 an item could write, with a leading zero and without,
 * the empty text, and texts that are no number.
 */
const numberTexts: Gen<string> = string(characterOf(["0", "1", "2", "x"]), { max: 2, min: 0 });

/**
 * The sides MO6's box writes a picture's `width` or `height` as: the least and the most a picture
 * takes, 44 and 120, a pixel beyond each, and 60 with its unit written.
 */
const sideTexts: Gen<string> = element(["43", "44", "120", "121", "60px"]);

/**
 * Draw a part of MO6's box: the layout left out or written rows, scatter or another word; the count
 * or the row length left out or written as any of {@link numberTexts}; one of four properties
 * outside the PCI's contract, or one of the two QTI 3.0.1's schema declares on the element,
 * written; the markup as any sequence of up to two pieces; or the picture with its `alt` kept or
 * left out and each side left out or written as any of {@link sideTexts}.
 */
const variations: Gen<Variation> = oneOf<Variation>([
  (source) => ({
    kind: "property",
    name: "layout",
    written: source.draw(option(element(["rows", "scatter", "circle"]))),
  }),
  (source) => ({ kind: "property", name: "objects", written: source.draw(option(numberTexts)) }),
  (source) => ({ kind: "property", name: "perRow", written: source.draw(option(numberTexts)) }),
  (source) => ({
    kind: "stray",
    name: source.draw(
      element(["answer", "count", "ringColour", "seed", "catalogIdref", "qtiSuppressTts"]),
    ),
  }),
  (source) => ({
    kind: "markup",
    pieces: source.draw(array(element(["picture", "span", "text"]), { max: 2, min: 0 })),
  }),
  (source) => ({
    kind: "picture",
    picture: {
      alt: source.draw(boolean),
      height: source.draw(option(sideTexts)),
      width: source.draw(option(sideTexts)),
    },
  }),
]);

/**
 * Draw a case of MO6's box: the rows or the scatter item, and one of {@link variations}.
 */
const variedItems: Gen<Varied> = (source) => ({
  layout: source.draw(element(["rows", "scatter"])),
  variation: source.draw(variations),
});

/**
 * How many cases {@link variedItems} draws: for each of the two items, 4 layouts, 22 counts, 22 row
 * lengths, 6 properties outside the contract, 13 markups and 72 pictures (2 `alt`s by 6 widths by
 * 6 heights).
 */
const VARIED = 2 * (4 + 22 + 22 + 6 + 13 + 2 * 6 * 6);

/**
 * Give a piece's markup: the item's own for its picture, a `span` naming the object, or a line
 * asking the child to mark.
 *
 * @param golden The item.
 * @param item The item as the frame host is handed it.
 * @param piece The piece.
 * @returns Its markup.
 */
const pieceOf = (golden: Golden, item: MarkItem, piece: Piece): string => {
  switch (piece) {
    case "picture": {
      return item.markup;
    }
    case "span": {
      return `<span>${golden.object}</span>`;
    }
    case "text": {
      return "Mark them. ";
    }
  }
};

/**
 * Write a side as the picture's attribute, nothing when it is left out.
 *
 * @param name The attribute.
 * @param side The side as written, none when left out.
 * @returns The attribute as the markup writes it.
 */
const sideAttribute = (name: "height" | "width", side: Option.Option<string>): string =>
  Option.match(side, { onNone: () => "", onSome: (text) => ` ${name}="${text}"` });

/**
 * Write the rows or the scatter item with one part otherwise (MO6).
 *
 * @param golden The item.
 * @param item The item as the frame host is handed it.
 * @param variation The part written otherwise.
 * @returns The item so written.
 */
const variedOf = (golden: Golden, item: MarkItem, variation: Variation): MarkItem => {
  switch (variation.kind) {
    case "property": {
      const { [variation.name]: _left, ...others } = item.properties;

      return written(
        item,
        Option.match(variation.written, {
          onNone: () => others,
          onSome: (text) => ({ ...others, [variation.name]: text }),
        }),
      );
    }
    case "stray": {
      return written(item, { ...item.properties, [variation.name]: "4" });
    }
    case "markup": {
      return {
        ...item,
        markup: variation.pieces.map((piece) => pieceOf(golden, item, piece)).join(""),
      };
    }
    case "picture": {
      const { alt, height, width } = variation.picture;

      return {
        ...item,
        markup: item.markup
          .replace(` alt="${golden.object}"`, alt ? ` alt="${golden.object}"` : "")
          .replace(` width="${String(form.side)}"`, sideAttribute("width", width))
          .replace(` height="${String(form.side)}"`, sideAttribute("height", height)),
      };
    }
  }
};

/**
 * The markup the PCI is handed, as MO6's rules read it: how many elements it holds, whether it
 * holds text, and its picture as written.
 */
interface HandedMarkup {
  readonly elements: number;
  readonly picture: PictureWriting;
  readonly text: boolean;
}

/**
 * Give the markup a variation hands the PCI.
 *
 * @param variation The part written otherwise.
 * @returns The markup as MO6's rules read it.
 */
const handedMarkupOf = (variation: Variation): HandedMarkup => {
  switch (variation.kind) {
    case "markup": {
      return {
        elements: variation.pieces.filter((piece) => piece !== "text").length,
        picture: asWritten,
        text: variation.pieces.some((piece) => piece !== "picture"),
      };
    }
    case "picture": {
      return { elements: 1, picture: variation.picture, text: false };
    }
    case "property":
    case "stray": {
      return { elements: 1, picture: asWritten, text: false };
    }
  }
};

/**
 * Read a count or a row length as the form writes it: a whole number from 1, with no leading zero.
 *
 * @param text The property as written, `undefined` when left out.
 * @returns The number, none when it is not so written.
 */
const countingOf = (text: string | undefined): Option.Option<number> =>
  text !== undefined &&
  text !== "" &&
  !text.startsWith("0") &&
  Arr.fromIterable(text).every((character) => character >= "0" && character <= "9")
    ? Option.some(Number(text))
    : Option.none();

/**
 * Name a property's writing as a refusal names it: `absent`, or the text in quotes.
 *
 * @param text The property as written, `undefined` when left out.
 * @returns Its name in a refusal.
 */
const writingOf = (text: string | undefined): string =>
  text === undefined ? "absent" : `"${text}"`;

/**
 * Give the attribute an item writes for a property, by its dataset name: HTML's dataset naming
 * read backwards, `data-` and each capital letter a hyphen and the letter in lower case.
 *
 * @param name The dataset name.
 * @returns The attribute.
 */
const attributeOf = (name: string): string =>
  `data-${Array.from(name, (character) =>
    character === character.toLowerCase() ? character : `-${character.toLowerCase()}`,
  ).join("")}`;

/**
 * Give the refusal MO6 names for a property that writes a count or a row length, none when it is
 * written as the form writes one.
 *
 * @param name The property's dataset name.
 * @param text The property as written, `undefined` when left out.
 * @returns The refusal, or none.
 */
const countingRefusals = (name: string, text: string | undefined): readonly string[] =>
  Option.isSome(countingOf(text))
    ? []
    : [`its property ${attributeOf(name)} is ${writingOf(text)}`];

/**
 * Give the refusals MO6 names for a layout's properties: a layout other than rows and scatter; a
 * count beyond the layout's most; for rows, a row length not written as the form writes one, or
 * longer than ten or than the count; for a scatter, a row length written at all.
 *
 * @param properties The PCI's properties.
 * @returns The refusals, none when the layout's properties fit it.
 */
const layoutRefusals = (properties: Readonly<Record<string, string>>): readonly string[] => {
  const { layout } = properties;
  const count = countingOf(properties["objects"]);
  const { perRow } = properties;
  const beyond = (kind: "rows" | "scatter"): readonly string[] =>
    Option.match(count, {
      onNone: () => [],
      onSome: (objects) =>
        objects > most[kind]
          ? [
              `its property data-objects is ${String(objects)}, more than the ${String(most[kind])} a set laid out as ${kind} holds`,
            ]
          : [],
    });

  if (layout === "rows") {
    return [
      ...beyond("rows"),
      ...countingRefusals("perRow", perRow),
      ...Option.match(countingOf(perRow), {
        onNone: () => [],
        onSome: (row) => [
          ...(row > most.perRow
            ? [
                `its property data-per-row is ${String(row)}, more than the ${String(most.perRow)} a row holds`,
              ]
            : []),
          ...Option.match(count, {
            onNone: () => [],
            onSome: (objects) =>
              row > objects
                ? [
                    `its property data-per-row is ${String(row)}, more than its ${String(objects)} objects`,
                  ]
                : [],
          }),
        ],
      }),
    ];
  }

  if (layout === "scatter") {
    return [
      ...beyond("scatter"),
      ...(perRow === undefined
        ? []
        : ["its property data-per-row belongs to another layout than scatter"]),
    ];
  }

  return [`its property data-layout is ${writingOf(layout)}`];
};

/**
 * Read a picture's side as the form writes it: a whole number of CSS pixels from 44 to 120.
 *
 * @param side The side as written, none when left out.
 * @returns The side, none when it is not so written.
 */
const sideOf = (side: Option.Option<string>): Option.Option<number> =>
  Option.filter(
    Option.flatMap(side, countingOf),
    (pixels) => pixels >= form.least && pixels <= most.side,
  );

/**
 * Give the refusals MO6 names for one picture: no `alt`, a side not written as the form writes
 * one, or two sides unequal.
 *
 * @param picture The picture as written.
 * @returns The refusals, none when the picture fits the form.
 */
const pictureRefusals = (picture: PictureWriting): readonly string[] => {
  const width = sideOf(picture.width);
  const height = sideOf(picture.height);

  return [
    ...(picture.alt ? [] : ["its picture has no alt"]),
    ...(Option.isSome(width)
      ? []
      : [`its picture's width is ${writingOf(Option.getOrUndefined(picture.width))}`]),
    ...(Option.isSome(height)
      ? []
      : [`its picture's height is ${writingOf(Option.getOrUndefined(picture.height))}`]),
    ...(Option.isSome(width) && Option.isSome(height) && width.value !== height.value
      ? [
          `its picture is ${String(width.value)} by ${String(height.value)}; draw the object in a square`,
        ]
      : []),
  ];
};

/**
 * Give every refusal MO6 names for an item, each what breaks one of its rules, as the PCI's refusal
 * opens: a property outside the contract; the count; the layout's properties; a markup that is not
 * one picture and no text; and that picture.
 *
 * @param properties The PCI's properties.
 * @param markup The markup the PCI is handed.
 * @returns The refusals, none for an item the PCI runs.
 */
const refusalsOf = (
  properties: Readonly<Record<string, string>>,
  markup: HandedMarkup,
): readonly string[] => [
  ...Object.keys(properties)
    .filter((name) => !contract.has(name) && !qtiOwn.has(name))
    .map((name) => `its property ${attributeOf(name)} is none of the PCI's`),
  ...countingRefusals("objects", properties["objects"]),
  ...layoutRefusals(properties),
  ...(markup.elements === 1 && !markup.text
    ? pictureRefusals(markup.picture)
    : [
        `its markup holds ${String(markup.elements)} elements${markup.text ? " and text" : ""}; give it exactly one img`,
      ]),
];

/**
 * A case of MO7's box: an item, and the status its PCI is started in.
 */
interface Statused {
  readonly golden: Golden;
  readonly status: string;
}

/**
 * Draw a case of MO7's box: one of the seven items, and one of the {@link statuses}.
 */
const statusedItems: Gen<Statused> = (source) => ({
  golden: source.draw(element(goldens)),
  status: source.draw(word(statuses)),
});

/**
 * How many cases {@link statusedItems} draws: the seven items, each in the five statuses.
 */
const STATUSED = 7 * 5;

/**
 * The objects MO10's boxes hand saved answers to: the rows item written with three in one row, so
 * every place and the place past the set's end are a handful.
 */
const threeObjects = 3;

/**
 * Write the rows item with {@link threeObjects} in one row.
 *
 * @param item The rows item.
 * @returns The item so written.
 */
const threeOf = (item: MarkItem): MarkItem =>
  written(item, {
    ...item.properties,
    objects: String(threeObjects),
    perRow: String(threeObjects),
  });

/**
 * How MO10's states box hands a state back, from the places it lists: as `getState` writes it,
 * JSON's compact text of `{ ringed }`; with a key more; the list without its object; the object
 * itself rather than its text; that text short of its last character; or the number of places for
 * the list.
 */
type StateWriting =
  | "as getState writes it"
  | "with a key more"
  | "the list alone"
  | "not as text"
  | "cut short"
  | "a number for the list";

/**
 * A case of MO10's states box: the places a state lists, and how it is written.
 */
interface HandedState {
  readonly places: readonly number[];
  readonly writing: StateWriting;
}

/**
 * Draw a case of MO10's states box: every list of up to two numbers, each a whole number from -1
 * to {@link threeObjects} (the set's places, 0 to 2, and 3 past its end) or one half, in each of
 * the writings.
 */
const handedStates: Gen<HandedState> = (source) => ({
  places: source.draw(array(oneOf([int(-1, threeObjects), constant(0.5)]), { max: 2, min: 0 })),
  writing: source.draw(
    element([
      "as getState writes it",
      "with a key more",
      "the list alone",
      "not as text",
      "cut short",
      "a number for the list",
    ]),
  ),
});

/**
 * How many cases {@link handedStates} draws: the six writings, each of every list of up to two of
 * six numbers.
 */
const HANDED_STATES = 6 * (1 + 6 + 6 * 6);

/**
 * A state as a case hands it the PCI: a text the host hands, or an object where it hands no text.
 */
type StateHanded = string | { readonly ringed: readonly number[] };

/**
 * Give the state a case hands the PCI.
 *
 * @param handed The case.
 * @returns The state, as the host hands it.
 */
const stateOf = ({ places, writing }: HandedState): StateHanded => {
  switch (writing) {
    case "as getState writes it": {
      return JSON.stringify({ ringed: places });
    }
    case "with a key more": {
      return JSON.stringify({ more: 1, ringed: places });
    }
    case "the list alone": {
      return JSON.stringify(places);
    }
    case "not as text": {
      return { ringed: places };
    }
    case "cut short": {
      return JSON.stringify({ ringed: places }).slice(0, -1);
    }
    case "a number for the list": {
      return JSON.stringify({ ringed: places.length });
    }
  }
};

/**
 * Give the objects a state rings by MO5 and MO10: a state written as `getState` writes it whose
 * places are distinct places of the set, in any order, rings exactly them; any other is one the
 * PCI cannot use.
 *
 * @param handed The case.
 * @param objects The set's count.
 * @returns The objects it rings, none for a state the PCI cannot use.
 */
const usableOf = (
  { places, writing }: HandedState,
  objects: number,
): Option.Option<ReadonlySet<number>> =>
  writing === "as getState writes it" &&
  new Set(places).size === places.length &&
  places.every((place) => Number.isInteger(place) && place >= 0 && place < objects)
    ? Option.some(new Set(places))
    : Option.none();

/**
 * How MO10's bound box writes a bound value from a whole number: as Appendix C's integer; that
 * integer as its text; as a string; the number and a half; or the integer with no `base`.
 */
type BoundWriting = "an integer" | "the integer's text" | "a string" | "and a half" | "no base";

/**
 * A case of MO10's bound box: a whole number, and how the bound value writes it.
 */
interface HandedBound {
  readonly count: number;
  readonly writing: BoundWriting;
}

/**
 * Draw a case of MO10's bound box: every whole number from -1 to one past {@link threeObjects}, in
 * each of the writings.
 */
const handedBounds: Gen<HandedBound> = (source) => ({
  count: source.draw(int(-1, threeObjects + 1)),
  writing: source.draw(
    element(["an integer", "the integer's text", "a string", "and a half", "no base"]),
  ),
});

/**
 * How many cases {@link handedBounds} draws: the five writings, each of six whole numbers.
 */
const HANDED_BOUNDS = 5 * 6;

/**
 * A bound value as a case binds the PCI to it: Appendix C's JSON of an integer, of the integer's
 * text, of a string or of a number with a half, or an object with no base.
 */
type BoundHanded =
  | { readonly base: { readonly integer: number } }
  | { readonly base: { readonly integer: string } }
  | { readonly base: { readonly string: string } }
  | { readonly integer: number };

/**
 * Give the bound value a case binds the PCI to.
 *
 * @param handed The case.
 * @returns The bound value.
 */
const boundOf = ({ count, writing }: HandedBound): BoundHanded => {
  switch (writing) {
    case "an integer": {
      return { base: { integer: count } };
    }
    case "the integer's text": {
      return { base: { integer: String(count) } };
    }
    case "a string": {
      return { base: { string: String(count) } };
    }
    case "and a half": {
      return { base: { integer: count + 0.5 } };
    }
    case "no base": {
      return { integer: count };
    }
  }
};

/**
 * Give the objects a bound value rings by MO5 and MO10: Appendix C's integer from 1 to the set's
 * count rings that many, the first by place; any other value rings none.
 *
 * @param handed The case.
 * @param objects The set's count.
 * @returns The objects it rings.
 */
const boundRingsOf = ({ count, writing }: HandedBound, objects: number): ReadonlySet<number> =>
  new Set(
    writing === "an integer" && count >= 1 && count <= objects
      ? Array.from({ length: count }, (_unused, place) => place)
      : [],
  );

/**
 * The Appendix C JSON of the objects ringed: their count, NULL for none (MO3).
 *
 * @param ringed The objects ringed.
 * @returns The JSON.
 */
const responseOfRings = (ringed: ReadonlySet<number>) =>
  ringed.size === 0 ? responseOf() : responseOf(ringed.size);

/**
 * A case of MO11's box: an item, the object a finger starts on, by place, and how far it swipes
 * sideways, four pictures' sides to the right or to the left.
 */
interface Swipe {
  readonly by: number;
  readonly golden: Golden;
  readonly place: number;
}

/**
 * Draw a case of MO11's box: one of the seven items, any of its objects, and either way.
 */
const swipes: Gen<Swipe> = (source) => {
  const golden = source.draw(element(goldens));

  return {
    by: (source.draw(boolean) ? -4 : 4) * form.side,
    golden,
    place: source.draw(int(0, golden.count - 1)),
  };
};

/**
 * How many cases {@link swipes} draws: each of the seven items' 62 objects, either way.
 */
const SWIPES = 2 * (11 + 9 + 8 + 8 + 7 + 10 + 9);

/**
 * How long one case of a box may run before it is stopped and reported: a hang guard, never a
 * budget.
 */
const caseHang = "5 minutes";

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
    `MO6: an item whose layout, count, row length, markup or picture the PCI cannot read, or that writes a property outside its contract, fails it, with the refusal naming a rule it breaks: every one-part variation of the rows and the scatter item, ${String(VARIED)}`,
    (ctx) =>
      Effect.gen(function* refusals() {
        const page = yield* Ring;

        yield* boxHolds(variedItems, VARIED);

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "the rows and the scatter item, each with one part written otherwise: the layout left out or written rows, scatter or another word; the count or the row length left out or written as any text of up to two of 0, 1, 2 and x; one of four properties outside the contract or one of the two QTI 3.0.1's schema declares on the element written; the markup any sequence of up to two of the picture, a span and a line of text; or the picture's alt kept or left out and each side left out or written 43, 44, 120, 121 or 60px",
              caseHang,
              coverage: noCoverage,
              generator: variedItems,
              literal: ({ layout, variation }) =>
                `the ${layout} item with ${Formatter.format(variation)}`,
              oracle: {
                kind: "specification",
                name: "MO6 as the suite transcribes the form: data-layout rows or scatter; data-objects a whole number from 1 with no leading zero, at most 20 in rows and 10 scattered; data-per-row such a number, for rows alone, at most 10 and at most the count; the markup one img and no text, its alt present and its sides whole numbers of CSS pixels from 44 to 120, equal; no data-* property but these three and the two QTI 3.0.1's schema declares on the element; an item breaking none runs, and one breaking any fails with one refusal naming one it breaks",
              },
              suite: "alpha/mark-objects-refusals",
            },
            ({ layout, variation }) =>
              Effect.gen(function* refused() {
                const golden = goldenOf(`alpha-mark-objects-${layout}`);
                const item = variedOf(golden, yield* Effect.orDie(markItem(golden.id)), variation);
                const broken = refusalsOf(item.properties, handedMarkupOf(variation));
                const outcome = yield* Effect.orDie(page.start(item, {}));

                if (broken.length === 0) {
                  assert.strictEqual(
                    outcome.kind,
                    "ready",
                    `an item breaking no rule runs: ${outcome.reason ?? ""}`,
                  );
                } else {
                  const thrown = yield* Effect.orDie(page.thrown);
                  const opening = `MarkObjectsRefusedError: The mark-objects PCI (${item.typeIdentifier}) cannot run: `;

                  assert.strictEqual(
                    outcome.kind,
                    "failed",
                    `${broken.join("; ")}: the PCI does not run`,
                  );
                  assert.strictEqual(
                    thrown.length,
                    1,
                    `${broken.join("; ")}: the frame threw once`,
                  );
                  assert.isTrue(
                    broken.some((refusal) => (thrown[0] ?? "").includes(`${opening}${refusal}`)),
                    `the PCI refuses it naming a rule it breaks, one of ${broken.join(" | ")}: it threw ${thrown[0] ?? "nothing"}`,
                  );
                }
              }),
          ),
        );
      }),
    ruleHang,
  );

  it.effect(
    `MO7: in every status but interacting the PCI shows the rings it is bound to and a tap changes nothing, and in interacting each tap rings or unrings: every item in each of the five statuses, ${String(STATUSED)}`,
    (ctx) =>
      Effect.gen(function* notAnswering() {
        const page = yield* Ring;

        yield* boxHolds(statusedItems, STATUSED);

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "each of the seven items, bound to its key's count, its first, last and second objects tapped, in each status a delivery engine passes a PCI",
              caseHang,
              coverage: noCoverage,
              generator: statusedItems,
              literal: ({ golden, status }) => `${golden.id} in ${status}`,
              oracle: {
                kind: "specification",
                name: "QTI 3.0.1's PCI statuses (implementation guide §3.7.12.7.1) and MO7 as the suite transcribes the form: the candidate answers in interacting alone, where each tap rings an object or takes its ring away (MO2) and the response is the count ringed (MO3); in suspended, closed, solution and review the PCI shows the rings it is bound to, takes no tap, and gives the bound count",
              },
              suite: "alpha/mark-objects-statuses",
            },
            ({ golden, status }) =>
              Effect.gen(function* inStatus() {
                const item = yield* Effect.orDie(markItem(golden.id));
                const bound = new Set(
                  Array.from({ length: golden.correct }, (_unused, place) => place),
                );
                const taps = [0, golden.count - 1, 1];
                const answering = status === "interacting";
                const ringed = answering ? ringedBy([...bound, ...taps]) : bound;

                yield* started(page, item, { boundTo: responseOf(bound.size), status });

                const before = yield* Effect.orDie(page.drawn);

                assert.isTrue(
                  before.objects.every((object) => object.disabled !== answering),
                  `in ${status}, ${answering ? "every object takes a tap" : "no object takes a tap"}`,
                );
                holdsRings(golden, before, bound);
                yield* Effect.orDie(page.tap(taps));
                holdsRings(golden, yield* Effect.orDie(page.drawn), ringed);

                const changes = (yield* Effect.orDie(page.messages)).filter(
                  (message) => message.kind === "changed",
                );

                if (answering) {
                  assert.deepStrictEqual(
                    changes.at(-1)?.value,
                    responseOfRings(ringed),
                    `in ${status}, the last change relayed is the count ringed`,
                  );
                } else {
                  for (const change of changes) {
                    assert.deepStrictEqual(
                      change.value,
                      responseOf(bound.size),
                      `in ${status}, a tap changes no response: the frame relays the PCI's response after any input it sees when it differs from the last it relayed, the first time included, so the bound response may come back, never another`,
                    );
                  }
                }

                assert.deepStrictEqual(
                  (yield* finished(page)).response,
                  responseOfRings(ringed),
                  `in ${status}, the response is the count ringed`,
                );
              }),
          ),
        );
      }),
    ruleHang,
  );

  it.effect("MO7: once completed, no tap changes anything, and the frame relays nothing", () =>
    Effect.gen(function* completed() {
      const page = yield* Ring;
      const golden = goldenOf("alpha-mark-objects-row-leave");
      const item = yield* Effect.orDie(markItem(golden.id));

      yield* started(page, item, {});
      yield* Effect.orDie(page.tap([1]));
      assert.deepStrictEqual((yield* finished(page)).response, responseOf(1));
      yield* Effect.orDie(page.tap([2, 1]));

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
    `MO10: a saved state rings its places when it is getState's text of places of the set, in any order, and else falls back to the bound count: ${String(HANDED_STATES)} states`,
    (ctx) =>
      Effect.gen(function* forgivingStates() {
        const page = yield* Ring;
        const golden = goldenOf("alpha-mark-objects-rows");
        const item = threeOf(yield* Effect.orDie(markItem(golden.id)));
        const bound = new Set([0, 1]);

        yield* boxHolds(handedStates, HANDED_STATES);

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "the rows item with three objects in one row, bound to 2, handed every list of up to two of -1, 0, 1, 2, 3 and one half as getState writes it, with a key more, as the list alone, as the object rather than its text, cut short of its last character, and with the number of places for the list",
              caseHang,
              coverage: noCoverage,
              generator: handedStates,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: 'MO5 and MO10 as the suite transcribes the form: a state is used when it is the JSON text getState gives, {"ringed":[…]}, of distinct places of the set in any order, and the PCI rings exactly those; any other falls back to the bound count, the first by place; the response is the count ringed (MO3)',
              },
              suite: "alpha/mark-objects-states",
            },
            (handed) =>
              Effect.gen(function* restoredState() {
                const ringed = Option.getOrElse(usableOf(handed, threeObjects), () => bound);
                yield* started(page, item, {
                  boundTo: responseOf(bound.size),
                  state: stateOf(handed),
                });
                holdsRings(golden, yield* Effect.orDie(page.drawn), ringed);
                assert.deepStrictEqual(
                  (yield* finished(page)).response,
                  responseOfRings(ringed),
                  `handed ${Formatter.format(stateOf(handed))}: the response`,
                );
              }),
          ),
        );
      }),
  );

  it.effect(
    `MO10: bound to a value that is no count of the set, the PCI rings none, and bound to a count it rings that many: ${String(HANDED_BOUNDS)} values`,
    (ctx) =>
      Effect.gen(function* forgivingBounds() {
        const page = yield* Ring;
        const golden = goldenOf("alpha-mark-objects-rows");
        const item = threeOf(yield* Effect.orDie(markItem(golden.id)));

        yield* boxHolds(handedBounds, HANDED_BOUNDS);

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "the rows item with three objects in one row, bound to every whole number from -1 to 4 written as Appendix C's integer, as the integer's text, as a string, as the number and a half, and with no base",
              caseHang,
              coverage: noCoverage,
              generator: handedBounds,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "MO5 and MO10 as the suite transcribes the form: bound to Appendix C's integer from 1 to the set's count, the PCI rings that many, the first by place, and gives that count back; bound to any other value it rings none and gives NULL",
              },
              suite: "alpha/mark-objects-bound",
            },
            (handed) =>
              Effect.gen(function* boundValue() {
                const ringed = boundRingsOf(handed, threeObjects);

                yield* started(page, item, { boundTo: boundOf(handed) });
                holdsRings(golden, yield* Effect.orDie(page.drawn), ringed);
                assert.deepStrictEqual(
                  (yield* finished(page)).response,
                  responseOfRings(ringed),
                  `bound to ${Formatter.format(boundOf(handed))}: the response`,
                );
              }),
          ),
        );
      }),
  );

  it.effect(
    "MO10: a picture the host marked still draws, each object's picture its src, alt, width and height alone",
    () =>
      Effect.gen(function* hostMarked() {
        const page = yield* Ring;
        const golden = goldenOf("alpha-mark-objects-rows");
        const item = yield* Effect.orDie(markItem(golden.id));

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
    `MO11: a swipe from any object of every item, either way, rings nothing and takes the page nowhere: the set and every object take every touch: ${String(SWIPES)} swipes`,
    (ctx) =>
      Effect.gen(function* swiping() {
        const page = yield* Ring;

        yield* boxHolds(swipes, SWIPES);

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "each object of the seven items, by place, swiped four pictures' sides to the right and to the left",
              caseHang,
              coverage: noCoverage,
              generator: swipes,
              literal: ({ by, golden, place }) =>
                `${golden.id} object ${String(place)} swiped by ${String(by)}`,
              oracle: {
                kind: "specification",
                name: "MO11 as the suite transcribes the form: the set and every object take every touch that starts on them (computed touch-action none), so a sideways swipe from an object rings nothing, relays no response but the empty one, has none of the frame's pointers cancelled by the browser, and leaves the host page's address and history as they were",
              },
              suite: "alpha/mark-objects-swipes",
            },
            ({ by, golden, place }) =>
              Effect.gen(function* swiped() {
                const item = yield* Effect.orDie(markItem(golden.id));
                const named = `in ${golden.id}, a swipe from object ${String(place)} by ${String(by)}`;

                yield* started(page, item, {});

                const before = yield* Effect.orDie(page.drawn);

                assert.strictEqual(
                  before.setTouchAction,
                  "none",
                  `${golden.id}'s set takes every touch on it`,
                );
                for (const object of before.objects) {
                  assert.strictEqual(
                    object.touchAction,
                    "none",
                    `${golden.id}'s objects take every touch on them`,
                  );
                }

                const where = yield* Effect.orDie(page.swipe(place, by));

                assert.strictEqual(where.cancelled, 0, `${named}: the browser takes no part of it`);
                assert.deepStrictEqual(
                  where.after,
                  where.before,
                  `${named}: the page stays where it was`,
                );
                holdsRings(golden, yield* Effect.orDie(page.drawn), new Set());
                for (const change of (yield* Effect.orDie(page.messages)).filter(
                  (message) => message.kind === "changed",
                )) {
                  assert.deepStrictEqual(
                    change.value,
                    responseOf(),
                    `${named} changes no response: the frame relays the PCI's response after any input it sees when it differs from the last it relayed, the first time included, so a swipe may relay the empty response, never another`,
                  );
                }
                assert.deepStrictEqual(
                  (yield* finished(page)).response,
                  responseOf(),
                  `${named}: nothing is ringed`,
                );
              }),
          ),
        );
      }),
    ruleHang,
  );
});
