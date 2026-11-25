/**
 * The base-ten blocks' PCI (`urn:fdc:alpha.school:2026:build-with-blocks`) on synthetic look-alikes
 * of the assessment lead's block builds (qti-pie is public, so none is one of her items), hosted as
 * a host hosts them and driven in headless Google Chrome as a child drives them
 * (`#specimen/alpha/build-with-blocks.ts`), and held to the interaction specification of her K–2
 * mastery forms ("Build a number with base-ten blocks, scored by kind") and the owner's rulings,
 * written down here by hand ({@link specification}), never from the module's code:
 *
 * - B1, the key: the item's number built from its standard decomposition, by tapping each piece and
 *   then the mat, and again by dragging each piece onto the mat, posts the count of each kind on
 *   the mat, flats, rods and cubes in place order whatever order the item lists its supply in, an
 *   ordered list of integers, which is the item's correct response, so its `match_correct` scores
 *   it.
 * - B2, the systematic wrong answers: the number made from cubes alone, which the specification
 *   names, cannot be built: cubes stop going onto the mat when the tray has none left, at the
 *   supply (twelve), and what is posted is that build's own counts, never the correct ones. The
 *   tens and the ones swapped, one kind alone (the tens without the ones, the ones without the
 *   tens), and with flats one flat short and the hundreds and the tens swapped (stopped at the
 *   supply's five flats where it holds too few), post their own counts too.
 * - B3, going back, tap then tap (the owner's ruling, 2026-11-25: tap-then-tap for placing and
 *   returning, never a single-tap return): a tap on a piece on the mat chooses it and moves
 *   nothing; the next tap on the tray takes it back, as does dragging it off the mat; and an empty
 *   mat posts NULL. After a tap sets a piece down on either mat, the next tap there is that
 *   gesture's second tap and does nothing, and the one after acts.
 * - B4, resume: a frame bound to the correct response opens with the key's pieces on the mat, relays
 *   nothing and completes with that response; a bound value the PCI could not have posted, one past
 *   the supply (the number in cubes alone) or every count zero (an empty mat it posts as NULL), is
 *   no interaction, and the frame fails rather than show it; an empty list is NULL, as plate reads
 *   it, and opens an empty mat, while NULL written as another cardinality's (`base` or `record` of
 *   `null`), which plate refuses for an ordered response, fails the frame too.
 * - B5, the drawing: the frame holds nothing before the module draws (the island's markup is empty),
 *   and the PCI's element holds no text at all, so no count and no numeral, before and after the
 *   build; a rod is ten cubes long and a flat ten cubes square, on the screen; the pieces on the
 *   mat sit inside it, grouped by kind, the flats above the rods and the rods left of the cubes.
 * - B6, the module: the database admitted the item and plate accepts it; plate's resolution of its
 *   module facts against the package gives its `module` as the entry and one route, the module's
 *   file in the package, no fallback (the package holds one copy of the module) and no notice; the
 *   island's frame facts carry that route where the host serves it; and the module registers
 *   exactly the item's `custom-interaction-type-identifier`, the module's URN; the properties the
 *   module is handed are the item's supply, as the specification gives it ({@link specification}).
 * - B7, a double tap does what one tap does, on every target: on a piece of the tray it chooses it;
 *   on the mat, with a piece chosen, it puts that one piece there, even where the second tap lands
 *   on the piece the first put down; on a piece of the mat it chooses it; on the tray, with a piece
 *   of the mat chosen, it takes back that one piece. The pieces it does not move stay where they
 *   were.
 * - B8, a drag the frame never hears end: a piece dragged out of the frame and let go there, from the
 *   tray or from the mat, stays where it lay, drawn whole, with no copy following the pointer and
 *   no mat ringed, and the response is what the mats show.
 * - B9, a finger (a touch screen, as Chrome's emulation sends it): tap then tap places a piece, a
 *   double tap is one tap, also where its second tap lands on the piece its first set down, a
 *   finger drags a piece onto the mat and back, and a sideways swipe on the tray's floor moves
 *   nothing and never takes the page anywhere.
 * - B10, a drag that starts on a mat's floor moves nothing, whatever is chosen and wherever it ends:
 *   with a tray piece chosen, a swipe from the mat's floor into the tray; with a mat piece chosen,
 *   a swipe from the tray's floor onto the mat.
 * - B11, the property contract: `data-supply-rods` and `data-supply-cubes` (1 to 19) and
 *   `data-supply-flats` (1 to 9) are the module's only properties, and the two the QTI schema
 *   declares on the element (`data-catalog-idref`, `data-qti-suppress-tts`) are passed over; any
 *   other property, a required one missing, or a count out of its range or written another way is
 *   no interaction, and the frame fails rather than draw a supply it was not given.
 * - B12, one press at a time: a finger that drags a piece while a mouse drag is open ends the mouse's
 *   drag, so one copy follows one pointer and one piece is lifted; the finger's piece goes onto the
 *   mat, and the mouse's release moves nothing.
 * - B13, the drawing takes every touch: its computed `touch-action` is `none`, so a touch that starts
 *   on it is the child's alone (B9's taps, drags and floor swipe), never a pan of the page or the
 *   browser's swipe back.
 *
 * @module
 */
import { assert, layer } from "@effect/vitest";
import { Context, Effect, Layer, Option } from "effect";
import { buildWithBlocks } from "@qti-pie/plate/alpha/pci-modules";
import {
  blocksHosted,
  blocksItems,
  blocksPages,
  centreOf,
} from "#specimen/alpha/build-with-blocks.ts";
import type {
  BlocksFrame,
  BlocksHosted,
  BlocksItem,
  Box,
  Kind,
  Place,
  Response,
} from "#specimen/alpha/build-with-blocks.ts";

/**
 * How long one case may run before vitest stops it: a hang guard, never a budget.
 */
const caseHang = 300_000;

/**
 * Pieces of each kind: a supply, a key or a build.
 */
type Counts = Readonly<Partial<Record<Kind, number>>>;

/**
 * Each fixture's number, its key and its supply, by its name, as its stem and its supply state
 * them: the key is the number's standard decomposition, the one build the supply admits (the
 * specification: "The supply is sized so that the only way to reach the target is the standard
 * decomposition"). `rods-cubes-74` lists its supply's cubes before its rods.
 */
const specification = {
  "flats-rods-cubes-153": {
    key: { cubes: 3, flats: 1, rods: 5 },
    number: 153,
    supply: { cubes: 12, flats: 5, rods: 9 },
  },
  "flats-rods-cubes-367": {
    key: { cubes: 7, flats: 3, rods: 6 },
    number: 367,
    supply: { cubes: 12, flats: 5, rods: 9 },
  },
  "rods-cubes-38": { key: { cubes: 8, rods: 3 }, number: 38, supply: { cubes: 12, rods: 9 } },
  "rods-cubes-74": { key: { cubes: 4, rods: 7 }, number: 74, supply: { cubes: 12, rods: 9 } },
} as const satisfies Readonly<
  Record<string, { readonly key: Counts; readonly number: number; readonly supply: Counts }>
>;

/**
 * The kinds, in place order.
 */
const kinds: readonly Kind[] = ["flats", "rods", "cubes"];

/**
 * The service that opens an item's PCI in a page of its own.
 */
class Pages extends Context.Service<Pages, Effect.Success<typeof blocksPages>>()(
  "specimen/ui/build-with-blocks.test/Pages",
) {}

/**
 * The response a build posts, as the specification writes it: each kind the supply names, in place
 * order, its count on the mat, an ordered list of integers; NULL for an empty mat.
 *
 * @param supply The supply.
 * @param counts The counts on the mat.
 * @returns The response.
 */
const posted = (supply: Counts, counts: Counts): Response => {
  const named = kinds.filter((kind) => supply[kind] !== undefined);

  return named.every((kind) => (counts[kind] ?? 0) === 0)
    ? { list: null }
    : { list: { integer: named.map((kind) => counts[kind] ?? 0) } };
};

/**
 * Put pieces on the mat, each kind's count of them, by tapping each piece and then the mat, or by
 * dragging each onto the mat.
 *
 * @param frame The frame.
 * @param counts The counts.
 * @param how By taps or by drags.
 * @returns The building.
 */
const build = (frame: BlocksFrame, counts: Counts, how: "drag" | "tap") =>
  Effect.asVoid(
    Effect.all(
      kinds
        .flatMap((kind) => Array.from({ length: counts[kind] ?? 0 }, () => kind))
        .map((kind) =>
          how === "tap"
            ? Effect.andThen(frame.tapPiece(kind, "tray"), frame.tapMat("mat"))
            : frame.drag(kind, "tray"),
        ),
    ),
  );

/**
 * Read the count in a place of each kind a supply names.
 *
 * @param frame The frame.
 * @param supply The supply.
 * @param place The place.
 * @returns Each kind's count.
 */
const countsIn = (frame: BlocksFrame, supply: Counts, place: Place) =>
  Effect.map(
    Effect.all(
      kinds
        .filter((kind) => supply[kind] !== undefined)
        .map((kind) => Effect.map(frame.count(kind, place), (count) => [kind, count] as const)),
    ),
    (entries): Counts => Object.fromEntries(entries),
  );

/**
 * Give an item's row of the specification's table, failing the case for an item it lacks.
 *
 * @param item The item.
 * @returns Its row.
 */
const rowOf = (
  item: BlocksItem,
): { readonly key: Counts; readonly number: number; readonly supply: Counts } =>
  Object.entries(specification).find(([id]) => id === item.id)?.[1] ??
  assert.fail(`${item.id} has no row in the specification's table`);

/**
 * The properties a supply is written as, by the name HTML's `dataset` gives each `data-*`
 * attribute: `supplyRods`, `supplyCubes` and, when flats are offered, `supplyFlats`.
 *
 * @param supply The supply.
 * @returns The properties.
 */
const propertiesOf = (supply: Counts): Readonly<Record<string, string>> =>
  Object.fromEntries(
    kinds.flatMap((kind) => {
      const count = supply[kind];

      return count === undefined
        ? []
        : [[`supply${kind.charAt(0).toUpperCase()}${kind.slice(1)}`, String(count)] as const];
    }),
  );

/**
 * The right edge of the rightmost box.
 *
 * @param boxes The boxes.
 * @returns The edge.
 */
const rightOf = (boxes: readonly Box[]): number =>
  Math.max(...boxes.map((box) => box.x + box.width));

/**
 * The left edge of the leftmost box.
 *
 * @param boxes The boxes.
 * @returns The edge.
 */
const leftOf = (boxes: readonly Box[]): number => Math.min(...boxes.map((box) => box.x));

/**
 * The bottom edge of the lowest box.
 *
 * @param boxes The boxes.
 * @returns The edge.
 */
const bottomOf = (boxes: readonly Box[]): number =>
  Math.max(...boxes.map((box) => box.y + box.height));

/**
 * The top edge of the highest box.
 *
 * @param boxes The boxes.
 * @returns The edge.
 */
const topOf = (boxes: readonly Box[]): number => Math.min(...boxes.map((box) => box.y));

/**
 * Report whether a box lies inside another.
 *
 * @param inner The box inside.
 * @param outer The box around it.
 * @returns Whether it does.
 */
const inside = (inner: Box, outer: Box): boolean =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height;

/**
 * Open an item's PCI, bound to a response, and take it ready.
 *
 * @param hosted The item as hosted.
 * @param bound The response.
 * @returns The running frame.
 */
const opened = (hosted: BlocksHosted, bound: Response) =>
  Effect.gen(function* openedFrame() {
    const open = yield* Pages;
    const frame = yield* open(hosted, bound);

    assert.strictEqual(frame.started, "ready");

    return frame;
  });

/**
 * Give each kind's count of a build, held to its kind's supply: what can be built of it.
 *
 * @param supply The supply.
 * @param counts The build.
 * @returns The counts the supply holds.
 */
const heldTo = (supply: Counts, counts: Counts): Counts =>
  Object.fromEntries(
    kinds.flatMap((kind) => {
      const count = counts[kind];

      return count === undefined ? [] : [[kind, Math.min(count, supply[kind] ?? 0)] as const];
    }),
  );

/**
 * Give a box's corner, as a key two boxes at the same place share.
 *
 * @param box The box.
 * @returns The key.
 */
const cornerOf = (box: Box): string => `${box.x.toFixed(1)},${box.y.toFixed(1)}`;

layer(Layer.effect(Pages, blocksPages), { excludeTestServices: true, timeout: caseHang })(
  "the base-ten blocks' PCI on its synthetic items",
  (it) => {
    it.effect("the fixture folder holds exactly the specification's items", () =>
      Effect.sync(() => {
        assert.deepStrictEqual(
          blocksItems.map((item) => item.id),
          Object.keys(specification).toSorted(),
        );
      }),
    );

    it.effect(
      "each item's supply admits its key as the one build of its number (the specification: the supply is sized so that the only way to reach the target is the standard decomposition)",
      () =>
        Effect.sync(() => {
          for (const [id, row] of Object.entries(specification)) {
            const supply: Counts = row.supply;
            const key: Counts = row.key;
            const upTo = (kind: Kind): readonly number[] =>
              Array.from({ length: (supply[kind] ?? 0) + 1 }, (_, count) => count);
            const builds = upTo("flats").flatMap((flats) =>
              upTo("rods").flatMap((rods) => {
                const cubes = row.number - 100 * flats - 10 * rods;

                return cubes >= 0 && cubes <= (supply.cubes ?? 0) ? [{ cubes, flats, rods }] : [];
              }),
            );

            assert.deepStrictEqual(
              builds,
              [{ cubes: key.cubes ?? 0, flats: key.flats ?? 0, rods: key.rods ?? 0 }],
              `${id}'s supply admits ${JSON.stringify(builds)}`,
            );
          }
        }),
    );

    for (const item of blocksItems) {
      /**
       * The item as hosted, and its correct response.
       */
      const hostedItem = Effect.map(blocksHosted(item), (hosted) => ({
        correct: { list: { integer: hosted.correct } } satisfies Response,
        hosted,
      }));

      it.effect(
        `${item.id}: B6, admitted, its module resolved by QTI's resolution to plate's file, which registers its type`,
        () =>
          Effect.scoped(
            Effect.gen(function* moduleNamed() {
              const { hosted } = yield* hostedItem;
              const frame = yield* opened(hosted, { list: null });
              const { id } = buildWithBlocks;

              assert.strictEqual(hosted.verdict, "accepted");
              assert.deepStrictEqual(hosted.resolution, {
                entry: Option.some(id),
                notices: [],
                routes: [
                  {
                    fallback: Option.none(),
                    id,
                    primary: Option.some(buildWithBlocks.path),
                    waitSeconds: { fallback: 7, primary: 7 },
                  },
                ],
              });
              assert.deepStrictEqual(hosted.frame, {
                entry: id,
                loader: "/frame.html",
                routes: [
                  {
                    id,
                    primary: `/package/${buildWithBlocks.path}`,
                    waitSeconds: { fallback: 7, primary: 7 },
                  },
                ],
              });
              assert.deepStrictEqual(yield* frame.registered, [hosted.typeIdentifier]);
              assert.strictEqual(hosted.typeIdentifier, buildWithBlocks.typeIdentifier);
              assert.deepStrictEqual(hosted.properties, propertiesOf(rowOf(item).supply));
            }),
          ),
      );

      it.effect(`${item.id}: B1, the key by taps and by drags posts the correct response`, () =>
        Effect.scoped(
          Effect.gen(function* key() {
            const { correct, hosted } = yield* hostedItem;
            const row = rowOf(item);
            const made = kinds.reduce(
              (sum, kind, place) => sum + (row.key[kind] ?? 0) * 10 ** (kinds.length - 1 - place),
              0,
            );

            assert.strictEqual(made, row.number);
            assert.deepStrictEqual(posted(row.supply, row.key), correct);

            for (const how of ["tap", "drag"] as const) {
              const frame = yield* opened(hosted, { list: null });

              yield* build(frame, row.key, how);
              yield* frame.relayed(correct);
              assert.deepStrictEqual(yield* countsIn(frame, row.supply, "mat"), row.key);
              assert.deepStrictEqual(yield* frame.complete, correct);
            }
          }),
        ),
      );

      it.effect(
        `${item.id}: B2, cubes alone stop at the supply, and each systematic wrong build posts its own counts`,
        () =>
          Effect.scoped(
            Effect.gen(function* wrong() {
              const { correct, hosted } = yield* hostedItem;
              const row = rowOf(item);
              const cubes = row.supply.cubes ?? 0;
              const alone = yield* opened(hosted, { list: null });

              yield* build(alone, { cubes }, "tap");
              assert.strictEqual(yield* alone.count("cubes", "tray"), 0);
              yield* alone.tapMat("tray");
              yield* alone.tapMat("mat");
              assert.strictEqual(yield* alone.count("cubes", "mat"), cubes);
              assert.ok(cubes < row.number, "the supply cannot make the number from cubes alone");
              yield* alone.relayed(posted(row.supply, { cubes }));
              assert.notDeepEqual(posted(row.supply, { cubes }), correct);

              const builds: readonly Counts[] = [
                { ...row.key, cubes: row.key.rods ?? 0, rods: row.key.cubes ?? 0 },
                { ...row.key, cubes: 0 },
                { ...row.key, rods: 0 },
                ...(row.key.flats === undefined
                  ? []
                  : [
                      { ...row.key, flats: row.key.flats - 1 },
                      { ...row.key, flats: row.key.rods ?? 0, rods: row.key.flats },
                    ]),
              ];

              for (const wanted of builds) {
                const held = heldTo(row.supply, wanted);
                const frame = yield* opened(hosted, { list: null });

                yield* build(frame, held, "tap");
                yield* frame.relayed(posted(row.supply, held));
                assert.notDeepEqual(posted(row.supply, held), correct);

                for (const kind of kinds.filter((each) => held[each] !== wanted[each])) {
                  assert.strictEqual(yield* frame.count(kind, "tray"), 0);
                  yield* frame.tapMat("tray");
                  yield* frame.tapMat("mat");
                  assert.strictEqual(yield* frame.count(kind, "mat"), row.supply[kind]);
                }
              }
            }),
          ),
      );

      it.effect(
        `${item.id}: B3, a piece goes back tap then tap, never by one tap, and by a drag, and an empty mat is NULL`,
        () =>
          Effect.scoped(
            Effect.gen(function* back() {
              const { hosted } = yield* hostedItem;
              const row = rowOf(item);
              const frame = yield* opened(hosted, { list: null });

              yield* build(frame, { rods: 1 }, "drag");
              yield* frame.relayed(posted(row.supply, { rods: 1 }));
              yield* frame.tapPiece("rods", "mat");
              assert.strictEqual(yield* frame.chosen("rods", "mat"), 1);
              assert.strictEqual(yield* frame.count("rods", "mat"), 1);
              yield* frame.tapMat("tray");
              yield* frame.relayed({ list: null });
              assert.strictEqual(yield* frame.count("rods", "tray"), row.supply.rods);
              assert.strictEqual(yield* frame.chosen("rods", "tray"), 0);
              // After a tap sets a piece down on a mat, the next tap on that mat is the gesture's
              // second tap and does nothing; the one after acts: here it chooses a piece of the
              // tray, which a tap on the mat puts down, and the same holds there.
              yield* frame.tapPiece("rods", "tray");
              assert.strictEqual(yield* frame.chosen("rods", "tray"), 0);
              yield* frame.tapPiece("rods", "tray");
              assert.strictEqual(yield* frame.chosen("rods", "tray"), 1);
              yield* frame.tapMat("mat");
              yield* frame.relayed(posted(row.supply, { rods: 1 }));
              yield* frame.tapPiece("rods", "mat");
              assert.strictEqual(yield* frame.chosen("rods", "mat"), 0);
              yield* frame.tapPiece("rods", "mat");
              assert.strictEqual(yield* frame.chosen("rods", "mat"), 1);
              yield* frame.tapMat("tray");
              yield* frame.relayed({ list: null });
              assert.strictEqual(yield* frame.count("rods", "tray"), row.supply.rods);
              yield* build(frame, { cubes: 1 }, "drag");
              yield* frame.relayed(posted(row.supply, { cubes: 1 }));
              yield* frame.drag("cubes", "mat");
              yield* frame.relayed({ list: null });
              assert.strictEqual(yield* frame.count("cubes", "tray"), row.supply.cubes);
              assert.deepStrictEqual(yield* frame.complete, { list: null });
            }),
          ),
      );

      it.effect(
        `${item.id}: B4, a bound response resumes, and one past the supply or all zeros fails the frame`,
        () =>
          Effect.scoped(
            Effect.gen(function* resume() {
              const { correct, hosted } = yield* hostedItem;
              const row = rowOf(item);
              const open = yield* Pages;
              const frame = yield* opened(hosted, correct);

              assert.deepStrictEqual(yield* countsIn(frame, row.supply, "mat"), row.key);
              assert.deepStrictEqual(yield* frame.relays, []);
              assert.deepStrictEqual(yield* frame.complete, correct);

              const past = yield* open(hosted, posted(row.supply, { cubes: row.number }));

              assert.strictEqual(past.started, "failed");

              const zeros = kinds.filter((kind) => row.supply[kind] !== undefined).map(() => 0);
              const empty = yield* open(hosted, { list: { integer: zeros } });

              assert.strictEqual(empty.started, "failed");

              for (const other of [{ base: null }, { record: null }] as const) {
                assert.strictEqual((yield* open(hosted, other)).started, "failed");
              }

              const none = yield* opened(hosted, { list: { integer: [] } });

              assert.deepStrictEqual(
                yield* countsIn(none, row.supply, "mat"),
                Object.fromEntries(
                  kinds.filter((kind) => row.supply[kind] !== undefined).map((kind) => [kind, 0]),
                ),
              );
            }),
          ),
      );

      it.effect(
        `${item.id}: B5, nothing before the module draws, no text, pieces to scale, and the mat's pieces on it in kind groups`,
        () =>
          Effect.scoped(
            Effect.gen(function* drawing() {
              const { correct, hosted } = yield* hostedItem;
              const row = rowOf(item);

              assert.strictEqual(hosted.markup, "");

              const frame = yield* opened(hosted, { list: null });

              assert.strictEqual(yield* frame.text, "");

              const [cube] = yield* frame.boxes("cubes", "tray");
              const [rod] = yield* frame.boxes("rods", "tray");
              const [flat] =
                row.supply.flats === undefined ? [] : yield* frame.boxes("flats", "tray");

              assert.ok(cube !== undefined && rod !== undefined, "the tray holds a rod and a cube");
              assert.closeTo(rod.height / cube.height, 10, 0.01);
              assert.closeTo(rod.width / cube.width, 1, 0.01);

              if (flat !== undefined) {
                assert.closeTo(flat.height / cube.height, 10, 0.01);
                assert.closeTo(flat.width / cube.width, 10, 0.01);
              }

              yield* build(frame, row.key, "tap");
              yield* frame.relayed(correct);
              assert.strictEqual(yield* frame.text, "");

              const mat = yield* frame.mat("mat");
              const flats = yield* frame.boxes("flats", "mat");
              const rods = yield* frame.boxes("rods", "mat");
              const cubes = yield* frame.boxes("cubes", "mat");

              assert.ok(
                [...flats, ...rods, ...cubes].every((box) => inside(box, mat)),
                "every piece on the mat lies inside it",
              );
              assert.ok(rightOf(rods) < leftOf(cubes), "the rods sit left of the cubes");

              if (row.supply.flats !== undefined) {
                assert.ok(bottomOf(flats) < topOf(rods), "the flats sit above the rods");
              }
            }),
          ),
      );

      it.effect(
        `${item.id}: B7, a double tap does what one tap does, on a tray piece, on the mat, on a mat piece and on the tray`,
        () =>
          Effect.scoped(
            Effect.gen(function* doubleTaps() {
              const { hosted } = yield* hostedItem;
              const row = rowOf(item);
              const frame = yield* opened(hosted, { list: null });

              // On a piece of the tray: it is chosen, as one tap chooses it.
              yield* frame.doubleTap("cubes", "tray");
              assert.strictEqual(yield* frame.chosen("cubes", "tray"), 1);
              assert.strictEqual(yield* frame.count("cubes", "mat"), 0);

              // Where the chosen cube lands on the mat: put it down, note where, take it back by
              // drag, choose it again and double-tap there, so the second tap lands on it.
              yield* frame.tapMat("mat");
              yield* frame.relayed(posted(row.supply, { cubes: 1 }));

              const [landing] = yield* frame.boxes("cubes", "mat");

              assert.ok(landing !== undefined, "the cube is on the mat");
              yield* frame.drag("cubes", "mat");
              yield* frame.relayed({ list: null });
              yield* frame.tapPiece("cubes", "tray");
              yield* frame.doubleTapAt(centreOf(landing));
              yield* frame.relayed(posted(row.supply, { cubes: 1 }));
              assert.strictEqual(yield* frame.count("cubes", "mat"), 1);
              assert.strictEqual(yield* frame.chosen("cubes", "mat"), 0);

              // On a piece already on the mat, with a rod chosen: one rod goes down, and the cube
              // under the second tap is not chosen, so the next tap on the tray chooses there.
              yield* frame.tapPiece("rods", "tray");
              yield* frame.doubleTap("cubes", "mat");
              yield* frame.relayed(posted(row.supply, { cubes: 1, rods: 1 }));
              assert.strictEqual(yield* frame.chosen("cubes", "mat"), 0);
              yield* frame.tapPiece("cubes", "tray");
              assert.strictEqual(yield* frame.chosen("cubes", "tray"), 1);
              assert.strictEqual(yield* frame.count("cubes", "mat"), 1);
              yield* frame.tapMat("mat");
              yield* frame.relayed(posted(row.supply, { cubes: 2, rods: 1 }));
              yield* build(frame, { cubes: 2 }, "drag");
              yield* frame.relayed(posted(row.supply, { cubes: 4, rods: 1 }));

              const before = new Set((yield* frame.boxes("cubes", "mat")).map(cornerOf));

              // On a piece of the mat: it is chosen; then on a piece of the tray: that one cube goes
              // back, and the piece under the second tap is not chosen.
              yield* frame.doubleTap("cubes", "mat");
              assert.strictEqual(yield* frame.chosen("cubes", "mat"), 1);
              assert.strictEqual(yield* frame.count("cubes", "mat"), 4);
              yield* frame.doubleTap("rods", "tray");
              yield* frame.relayed(posted(row.supply, { cubes: 3, rods: 1 }));
              assert.strictEqual(yield* frame.count("cubes", "mat"), 3);
              assert.strictEqual(yield* frame.chosen("rods", "tray"), 0);
              assert.strictEqual(yield* frame.chosen("cubes", "tray"), 0);

              const after = (yield* frame.boxes("cubes", "mat")).map(cornerOf);

              assert.strictEqual(after.length, 3);
              assert.ok(
                after.every((corner) => before.has(corner)),
                "the cubes left on the mat stay where they were",
              );
              yield* frame.tapPiece("rods", "mat");
              assert.strictEqual(yield* frame.chosen("rods", "mat"), 1);
              assert.strictEqual(yield* frame.count("rods", "mat"), 1);
              assert.deepStrictEqual(
                yield* frame.complete,
                posted(row.supply, { cubes: 3, rods: 1 }),
              );
            }),
          ),
      );

      it.effect(
        `${item.id}: B8, a drag let go outside the frame moves nothing and leaves nothing drawn`,
        () =>
          Effect.scoped(
            Effect.gen(function* lostRelease() {
              const { hosted } = yield* hostedItem;
              const row = rowOf(item);
              const frame = yield* opened(hosted, { list: null });

              yield* build(frame, { rods: 2 }, "drag");
              yield* frame.relayed(posted(row.supply, { rods: 2 }));
              yield* frame.dragOut("rods", "mat");
              assert.deepStrictEqual(yield* frame.leftovers, { copies: 0, lifted: 0, ready: 0 });
              assert.strictEqual(yield* frame.count("rods", "mat"), 2);
              yield* frame.dragOut("cubes", "tray");
              assert.deepStrictEqual(yield* frame.leftovers, { copies: 0, lifted: 0, ready: 0 });
              assert.strictEqual(yield* frame.count("cubes", "mat"), 0);
              assert.strictEqual(yield* frame.count("cubes", "tray"), row.supply.cubes);
              // The mats still answer: a drag after the lost one moves its piece.
              yield* frame.drag("rods", "mat");
              yield* frame.relayed(posted(row.supply, { rods: 1 }));
              assert.deepStrictEqual(yield* frame.complete, posted(row.supply, { rods: 1 }));
            }),
          ),
      );

      it.effect(
        `${item.id}: B9, a finger taps, double-taps and drags pieces, and a swipe moves nothing and stays on the page`,
        () =>
          Effect.scoped(
            Effect.gen(function* finger() {
              const { hosted } = yield* hostedItem;
              const row = rowOf(item);
              const frame = yield* opened(hosted, { list: null });
              const address = yield* frame.address;

              yield* frame.touchTapPiece("rods", "tray");
              assert.strictEqual(yield* frame.chosen("rods", "tray"), 1);
              yield* frame.touchTapMat("mat");
              yield* frame.relayed(posted(row.supply, { rods: 1 }));
              yield* frame.touchTapPiece("cubes", "tray");
              yield* frame.touchTapMat("mat");
              yield* frame.touchTapMat("mat");
              yield* frame.relayed(posted(row.supply, { cubes: 1, rods: 1 }));
              yield* frame.touchDrag("rods", "tray");
              yield* frame.relayed(posted(row.supply, { cubes: 1, rods: 2 }));
              yield* frame.touchDrag("cubes", "mat");
              yield* frame.relayed(posted(row.supply, { rods: 2 }));

              // Where a chosen cube lands: put it down, note where, drag it back, choose it again and
              // double-tap there, so the second tap lands on the cube the first set down.
              yield* frame.touchTapPiece("cubes", "tray");
              yield* frame.touchTapMat("mat");
              yield* frame.relayed(posted(row.supply, { cubes: 1, rods: 2 }));

              const [landing] = yield* frame.boxes("cubes", "mat");

              assert.ok(landing !== undefined, "the cube is on the mat");
              yield* frame.touchDrag("cubes", "mat");
              yield* frame.relayed(posted(row.supply, { rods: 2 }));
              yield* frame.touchTapPiece("cubes", "tray");
              yield* frame.touchDoubleTapAt(centreOf(landing));
              yield* frame.relayed(posted(row.supply, { cubes: 1, rods: 2 }));
              assert.strictEqual(yield* frame.count("cubes", "mat"), 1);
              assert.strictEqual(yield* frame.chosen("cubes", "mat"), 0);
              assert.deepStrictEqual(yield* frame.leftovers, { copies: 0, lifted: 0, ready: 0 });
              yield* frame.touchSwipe("tray");
              assert.strictEqual(yield* frame.address, address);
              assert.strictEqual(yield* frame.count("rods", "mat"), 2);
              assert.strictEqual(yield* frame.count("cubes", "mat"), 1);
              assert.deepStrictEqual(
                yield* frame.complete,
                posted(row.supply, { cubes: 1, rods: 2 }),
              );
            }),
          ),
      );

      it.effect(
        `${item.id}: B10, a drag that starts on a mat's floor moves nothing, whatever is chosen`,
        () =>
          Effect.scoped(
            Effect.gen(function* floorDrags() {
              const { hosted } = yield* hostedItem;
              const row = rowOf(item);
              const frame = yield* opened(hosted, { list: null });

              yield* frame.tapPiece("cubes", "tray");
              yield* frame.dragBetween(yield* frame.floor("mat"), yield* frame.floor("tray"));
              assert.strictEqual(yield* frame.count("cubes", "mat"), 0);
              yield* build(frame, { rods: 1 }, "drag");
              yield* frame.relayed(posted(row.supply, { rods: 1 }));
              yield* frame.tapPiece("rods", "mat");
              assert.strictEqual(yield* frame.chosen("rods", "mat"), 1);
              yield* frame.dragBetween(yield* frame.floor("tray"), yield* frame.floor("mat"));
              assert.strictEqual(yield* frame.count("rods", "mat"), 1);
              // The rod is still chosen, so the tray it can go to is still ringed, and nothing else.
              assert.strictEqual(yield* frame.chosen("rods", "mat"), 1);
              assert.deepStrictEqual(yield* frame.leftovers, { copies: 0, lifted: 0, ready: 1 });
              assert.deepStrictEqual(yield* frame.complete, posted(row.supply, { rods: 1 }));
            }),
          ),
      );

      it.effect(
        `${item.id}: B11, the supply's three properties are the module's only ones, each in its range`,
        () =>
          Effect.scoped(
            Effect.gen(function* contract() {
              const { hosted } = yield* hostedItem;
              const row = rowOf(item);
              const open = yield* Pages;
              const given = propertiesOf(row.supply);
              const withoutCubes = Object.fromEntries(
                Object.entries(given).filter(([name]) => name !== "supplyCubes"),
              );
              const refused: readonly Readonly<Record<string, string>>[] = [
                { ...given, target: String(row.number) },
                { ...given, supplyTens: "9" },
                { ...given, ssml: "<speak/>" },
                withoutCubes,
                { ...given, supplyRods: "20" },
                { ...given, supplyCubes: "0" },
                { ...given, supplyFlats: "10" },
                { ...given, supplyRods: "09" },
                { ...given, supplyRods: "+9" },
                { ...given, supplyRods: " 9" },
                { ...given, supplyCubes: "12.0" },
              ];

              for (const properties of refused) {
                const frame = yield* open({ ...hosted, properties }, { list: null });

                assert.strictEqual(frame.started, "failed", JSON.stringify(properties));
              }

              const spoken = yield* opened(
                {
                  ...hosted,
                  properties: { ...given, catalogIdref: "stem", qtiSuppressTts: "all" },
                },
                { list: null },
              );

              assert.deepStrictEqual(yield* countsIn(spoken, row.supply, "tray"), row.supply);
            }),
          ),
      );

      it.effect(
        `${item.id}: B12, one press at a time: a finger's drag during a mouse drag moves the finger's piece alone`,
        () =>
          Effect.scoped(
            Effect.gen(function* twoHands() {
              const { hosted } = yield* hostedItem;
              const row = rowOf(item);
              const frame = yield* opened(hosted, { list: null });

              assert.deepStrictEqual(yield* frame.twoPresses("rods", "cubes"), {
                copies: 1,
                lifted: 1,
              });
              yield* frame.relayed(posted(row.supply, { cubes: 1 }));
              assert.strictEqual(yield* frame.count("rods", "mat"), 0);
              assert.strictEqual(yield* frame.count("cubes", "mat"), 1);
              assert.deepStrictEqual(yield* frame.leftovers, { copies: 0, lifted: 0, ready: 0 });
              assert.deepStrictEqual(yield* frame.complete, posted(row.supply, { cubes: 1 }));
            }),
          ),
      );

      it.effect(`${item.id}: B13, the drawing takes every touch that starts on it`, () =>
        Effect.scoped(
          Effect.gen(function* touch() {
            const { hosted } = yield* hostedItem;
            const frame = yield* opened(hosted, { list: null });

            assert.strictEqual(yield* frame.touchAction, "none", "touch-action none");
          }),
        ),
      );
    }
  },
);
