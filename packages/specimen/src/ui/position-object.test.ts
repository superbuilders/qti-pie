/**
 * The Position Object interaction (`qti-position-object-interaction`) hydrated in headless Google
 * Chrome (`#specimen/ui/hydrated.ts`) and driven as a child drives it, on 1EdTech's own example,
 * "Airport Locations" (`qtiv3-examples/packaging/items/position_object.xml`): a map of the United
 * Kingdom, an airport the child places up to three copies of, and the three airports' points as its
 * correct response, which an area mapping scores. Its page in answering holds the three copies
 * placed, its correct response as the child's, so every copy has places on both sides of it, and
 * each copy's control, its mark on the stage and its point in the response are told apart by its
 * place among its object's copies, as QTI records them, in the order they were placed.
 *
 * Held to the interaction as QTI 3.0's information model gives it, each copy one `point` of its
 * response (5.107), and to the ways plate's island gives a child to take a copy up, move it, put it
 * down and take it off (`#plate/ui/position-object/primitive.ts`), written down here by hand, never
 * from the island's code:
 *
 * - PO1, Delete and Backspace: either key on a copy's control takes that copy off the stage, and that
 *   copy alone: the response holds every other copy's point, in its order.
 * - PO2, a tap on a copy's control picks that copy up: its control alone is pressed, and its mark on
 *   the stage alone is picked; the response is unchanged.
 * - PO3, the keys alone: Enter on a copy's control picks that copy up, and focus stays on that
 *   control once the page has settled; an arrow key moves the copy one pixel of the stage image,
 *   and Enter puts it down there: the response holds that copy's point moved and every other copy's
 *   point where it was. A copy's control keeps focus while its copy is held, so the next key a
 *   child presses lands on the copy they picked up.
 * - PO4, a tap on a copy's mark on the stage picks that copy up, as a tap on its control does.
 * - PO9, the arrow keys on the object's button move only a copy that button gave: a copy picked up by
 *   Enter on its control stays where it was while focus moves to the object's button and the arrows
 *   are pressed there, and Enter back on its control puts it down where it was, writing nothing.
 *   The arrows move a copy only on the control whose Enter puts it down.
 *
 * And on a stage of two objects or more, each its own interaction and response, each placed any
 * number of times, the specimen floor's first such case (`#specimen/floor.ts`), its correct
 * response placed, so the objects and their copies are told apart by their interaction alone:
 *
 * - PO5, Enter on an object's button picks up a new copy of that object, its button alone pressed,
 *   and Enter again puts it on the stage: that object's response gains one point after its own, and
 *   every other object's response is unchanged.
 * - PO6, Delete on an object's first copy's control takes that copy off: that object's response loses
 *   its first point, and every other object's response is unchanged.
 * - PO7, a tap on an object's button while a new copy of another object is held picks up a new copy
 *   of the object tapped, its button alone pressed, and puts nothing on the stage: the copy held
 *   goes back, and no response changes.
 *
 * And on a stage of two objects or more, each placed once (`max-choices="1"`), the floor's first
 * such case, its correct response placed:
 *
 * - PO8, the keys alone, on the button the child moves a single copy with: Enter on an object's
 *   button picks up the copy placed, its button alone pressed; an arrow key moves it one pixel of
 *   the stage image, and Enter on that button puts it down there: that object's response holds its
 *   one point moved, and every other object's response is unchanged. The key that picked the copy
 *   up puts it down, as it does a new copy, and never takes it off.
 * - PO10, by the pointer, on the same stage: two taps on an object's button put its copy back where
 *   it was, writing nothing and leaving nothing pressed; a tap on its copy's control in its list
 *   and then on the button takes the copy off, that object's response NULL and every other's
 *   unchanged. (The stage's copies are drawn large enough to overlap, so a tap on a mark lands on
 *   the topmost; PO4 taps marks on a stage whose copies stand apart.)
 *
 * Every page hydrates with no error React reports, none the page throws and none its console logs
 * but a picture's failed load, and none is reported, thrown or logged after any key or tap a case
 * sends, by the time the page has settled.
 *
 * @module
 */
import { assert, layer } from "@effect/vitest";
import { Array as Arr, Context, Effect, Layer, Option, Schema } from "effect";
import type { Responses as ResponseValues } from "@qti-pie/plate";
import { floorCases } from "#specimen/floor.ts";
import { opened as openedCase } from "#specimen/open.ts";
import { corpusItems } from "#specimen/ui/corpus.ts";
import { HydrationFailure, hydratedPages, solved } from "#specimen/ui/hydrated.ts";
import type { Answering, Hydrated } from "#specimen/ui/hydrated.ts";
import type { SourceItem } from "#specimen/ui/rules.ts";
import { itemFactsOf } from "#specimen/ui/source.ts";

/**
 * How long the suite's harness may take to start before vitest fails it bare: a hang guard, never a
 * budget. Once for the file, Vite bundles React, Chrome starts, and the corpus is opened, every one
 * of its items as the corpus suites open them, which a loaded machine takes a minute or more over;
 * each case then loads and hydrates its pages and presses a few keys, within vitest's own guard.
 */
const harnessHang = "300 seconds";

/**
 * How long one case may run before vitest stops it: a hang guard, never a budget. A case loads and
 * hydrates a page, or one a stage's object, and presses a few keys: seconds alone here, and a
 * minute or more on a loaded machine.
 */
const caseHang = 300_000;

/**
 * The corpus file of 1EdTech's Position Object example the suite drives.
 */
const location = "qtiv3-examples/packaging/items/position_object.xml";

/**
 * The example's response.
 */
const response = "RESPONSE";

/**
 * The example's correct response's three points, in its order: Manchester, London Heathrow,
 * Edinburgh, as its XML writes them.
 */
const placed: readonly (readonly [x: bigint, y: bigint])[] = [
  [118n, 184n],
  [150n, 235n],
  [96n, 114n],
];

/**
 * A stage of the specimen floor in answering, solved, and its objects' responses' identifiers in
 * the stage's order.
 */
interface FloorStage {
  readonly answering: Answering;
  readonly identifiers: readonly string[];
}

/**
 * What the suite's cases share, made once for the file: the pages, to open an item in, hydrated;
 * 1EdTech's example, solved; and the floor's stages of objects placed any number of times and
 * placed once, solved.
 */
interface Shared {
  readonly airports: Answering;
  readonly objects: FloorStage;
  readonly once: FloorStage;
  readonly open: Effect.Success<typeof hydratedPages>;
}

/**
 * The service that holds what the suite's cases share.
 */
class Pages extends Context.Service<Pages, Shared>()("specimen/ui/position-object.test/Pages") {}

/**
 * A `point` response as the suite reads it: each value's two coordinates, in order.
 */
const PointResponse = Schema.Struct({
  values: Schema.Array(Schema.Struct({ value: Schema.Tuple([Schema.BigInt, Schema.BigInt]) })),
});

/**
 * Read a `point` response from responses: its points, in order.
 *
 * @param responses The responses.
 * @param identifier The response's identifier, the example's by default.
 * @returns The points.
 */
const pointsIn = (
  responses: ResponseValues,
  identifier = response,
): Effect.Effect<readonly (readonly [bigint, bigint])[], HydrationFailure> =>
  Effect.mapError(
    Schema.decodeUnknownEffect(PointResponse)(responses[identifier]),
    (cause) => new HydrationFailure({ cause, step: "read the response's points" }),
  ).pipe(Effect.map(({ values }) => values.map(({ value }) => value)));

/**
 * 1EdTech's example in answering, solved, every copy placed.
 */
const airportsStage = Effect.gen(function* airportsStage() {
  const items = yield* corpusItems;
  const item = Arr.findFirst(items, (each) => each.location === location);

  if (Option.isNone(item)) {
    return yield* new HydrationFailure({
      cause: location,
      step: "found the example in the corpus",
    });
  }

  return solved(item.value);
});

/**
 * Open the example, solved, every copy placed, in a page of its own.
 */
const opened = Effect.gen(function* opened() {
  const { airports, open } = yield* Pages;

  return yield* open(airports);
});

/**
 * The identifiers of the objects' responses, in the stage's order, as the specimen writes them
 * (`#specimen/kinds/position-object.ts`): `OBJECT_1`, `OBJECT_2`, ….
 *
 * @param count How many objects the stage holds.
 * @returns The identifiers.
 */
const objectResponses = (count: number): readonly string[] =>
  Arr.makeBy(count, (index) => `OBJECT_${String(index + 1)}`);

/**
 * The specimen floor's first Position Object whose stage holds two objects or more, each placed as
 * `placings` gives, in answering, solved, every object's correct copies placed, and its objects'
 * responses' identifiers in the stage's order.
 *
 * @param placings How many times each object is placed: `any` (`max-choices="0"`), so a new copy
 *   of each can always be picked up, or `one` (`max-choices="1"`).
 * @returns The stage.
 */
const floorStage = (placings: "any" | "one") =>
  Effect.gen(function* floorStageOf() {
    const found = Arr.findFirst(
      floorCases,
      ({ description: { interaction } }) =>
        interaction.kind === "position-object" &&
        interaction.settings.objects >= 2 &&
        interaction.settings.placings === placings,
    );

    if (Option.isNone(found)) {
      return yield* new HydrationFailure({
        cause: `no case of two objects or more, placed ${placings}`,
        step: "found a stage of objects on the floor",
      });
    }

    const held = found.value;
    const { accepted, configuration } = yield* openedCase(held.item, Option.none());
    const facts = itemFactsOf(held.item.xml);
    const source: SourceItem = {
      accepted,
      configuration,
      given: Option.none(),
      host: held.item.host,
      kinds: facts.kinds,
      location: held.item.location,
      offered: facts.offered,
      stimuli: [],
      taken: Option.none(),
    };
    const count =
      held.description.interaction.kind === "position-object"
        ? held.description.interaction.settings.objects
        : 0;

    return { answering: solved(source), identifiers: objectResponses(count) } satisfies FloorStage;
  });

/**
 * Open the floor's stage of objects, solved, in a page of its own.
 *
 * @param answering The stage in answering.
 * @returns The page.
 */
const openedObjects = (answering: Answering) =>
  Effect.gen(function* objectsPage() {
    const { open } = yield* Pages;

    return yield* open(answering);
  });

/**
 * What the suite's cases share, made once for the file.
 */
const shared = Layer.effect(
  Pages,
  Effect.gen(function* sharing() {
    const open = yield* hydratedPages;
    const airports = yield* airportsStage;
    const objects = yield* floorStage("any");
    const once = yield* floorStage("one");

    return { airports, objects, once, open } satisfies Shared;
  }),
);

/**
 * Read every object's points from responses, in the stage's order.
 *
 * @param responses The responses.
 * @param identifiers The objects' responses' identifiers.
 * @returns Each object's points.
 */
const everyObject = (responses: ResponseValues, identifiers: readonly string[]) =>
  Effect.all(identifiers.map((identifier) => pointsIn(responses, identifier)));

/**
 * Run a step of Playwright's on the page as an effect that fails with the step it was.
 *
 * @param name What it does.
 * @param run The step.
 * @returns The effect.
 */
const step = <A>(name: string, run: () => Promise<A>): Effect.Effect<A, HydrationFailure> =>
  Effect.tryPromise({ catch: (cause) => new HydrationFailure({ cause, step: name }), try: run });

/**
 * The copies' controls, in their object's order.
 */
const controls = '[data-slot="plate-position-object-copy"]';

/**
 * The objects' buttons, in the stage's order.
 */
const objects = '[data-slot="plate-position-object-object"]';

/**
 * Each object's group, in the stage's order, which holds its button and its copies' controls.
 */
const groups = '[data-slot="plate-position-object-group"]';

/**
 * The copies' marks on the stage, in their object's order.
 */
const marks = '[data-slot="plate-position-object-token"]';

/**
 * Read which copies' controls are pressed and which marks are picked, by place, and which copy's
 * control has focus, none for focus elsewhere.
 *
 * @param hydrated The page.
 * @returns What the page shows.
 */
const shown = (hydrated: Hydrated) =>
  step("read the copies' state", () =>
    hydrated.page.evaluate(
      ([control, mark]) => {
        const buttons = [...document.querySelectorAll(control)];

        return {
          focused: buttons.indexOf(document.activeElement ?? document.body),
          picked: [...document.querySelectorAll<SVGGElement>(mark)].map(
            (each) => each.dataset["picked"] !== undefined,
          ),
          pressed: buttons.map((each) => each.getAttribute("aria-pressed") === "true"),
        };
      },
      [controls, marks] as const,
    ),
  );

/**
 * The responses the last change wrote, failing where the island wrote none.
 *
 * @param hydrated The page.
 * @returns The responses.
 */
const lastChange = (hydrated: Hydrated) =>
  Effect.gen(function* last() {
    const latest = Arr.last(yield* hydrated.changes);

    if (Option.isNone(latest)) {
      return yield* new HydrationFailure({ cause: "no change", step: "read the last change" });
    }

    return latest.value;
  });

/**
 * The last change's points, failing where the island wrote none.
 *
 * @param hydrated The page.
 * @returns The points.
 */
const lastPoints = (hydrated: Hydrated) =>
  Effect.flatMap(lastChange(hydrated), (latest) => pointsIn(latest));

/**
 * Read which objects' buttons are pressed, in the stage's order.
 *
 * @param hydrated The page.
 * @returns Whether each is pressed.
 */
const objectsPressed = (hydrated: Hydrated) =>
  step("read the objects' buttons", () =>
    hydrated.page.evaluate(
      (button) =>
        [...document.querySelectorAll(button)].map(
          (each) => each.getAttribute("aria-pressed") === "true",
        ),
      objects,
    ),
  );

/**
 * Give the copies but one, in order.
 *
 * @param index The place of the copy left out.
 * @returns The others.
 */
const without = (index: number) => placed.filter((_, each) => each !== index);

/**
 * Give every place but one false and that one true.
 *
 * @param index The place.
 * @returns The flags.
 */
const onlyAt = (index: number): readonly boolean[] => placed.map((_, each) => each === index);

layer(shared, { excludeTestServices: true, timeout: harnessHang })(
  "Position Object hydrated in Chrome, on 1EdTech's Airport Locations with its three copies placed",
  (it) => {
    for (const key of ["Delete", "Backspace"] as const) {
      for (const index of placed.keys()) {
        it.effect(
          `PO1: ${key} on copy ${String(index + 1)}'s control takes that copy off, and it alone`,
          () =>
            Effect.scoped(
              Effect.gen(function* takesOff() {
                const hydrated = yield* opened;

                yield* step("focused the copy's control", () =>
                  hydrated.page.locator(controls).nth(index).focus(),
                );
                yield* step(`pressed ${key}`, () => hydrated.page.keyboard.press(key));
                yield* hydrated.settle;
                assert.deepStrictEqual(yield* lastPoints(hydrated), without(index));
              }),
            ),
          caseHang,
        );
      }
    }

    for (const index of placed.keys()) {
      it.effect(
        `PO2: a tap on copy ${String(index + 1)}'s control picks that copy up`,
        () =>
          Effect.scoped(
            Effect.gen(function* tapsControl() {
              const hydrated = yield* opened;

              yield* step("tapped the copy's control", () =>
                hydrated.page.locator(controls).nth(index).click(),
              );
              yield* hydrated.settle;
              const state = yield* shown(hydrated);

              assert.deepStrictEqual(state.pressed, onlyAt(index));
              assert.deepStrictEqual(state.picked, onlyAt(index));
              assert.deepStrictEqual(yield* hydrated.changes, []);
            }),
          ),
        caseHang,
      );

      it.effect(
        `PO3: Enter on copy ${String(index + 1)}'s control picks it up and keeps focus there, an arrow moves it, and Enter puts it down`,
        () =>
          Effect.scoped(
            Effect.gen(function* keys() {
              const hydrated = yield* opened;

              yield* step("focused the copy's control", () =>
                hydrated.page.locator(controls).nth(index).focus(),
              );
              yield* step("pressed Enter", () => hydrated.page.keyboard.press("Enter"));
              yield* hydrated.settle;
              const held = yield* shown(hydrated);

              assert.deepStrictEqual(held.pressed, onlyAt(index));
              assert.strictEqual(held.focused, index, "the picked-up copy's control keeps focus");
              yield* step("pressed ArrowRight", () => hydrated.page.keyboard.press("ArrowRight"));
              yield* step("pressed Enter", () => hydrated.page.keyboard.press("Enter"));
              yield* hydrated.settle;
              assert.deepStrictEqual(
                yield* lastPoints(hydrated),
                placed.map(([x, y], each) => (each === index ? [x + 1n, y] : [x, y])),
              );
            }),
          ),
        caseHang,
      );

      it.effect(
        `PO4: a tap on copy ${String(index + 1)}'s mark on the stage picks that copy up`,
        () =>
          Effect.scoped(
            Effect.gen(function* tapsMark() {
              const hydrated = yield* opened;

              yield* step("tapped the copy's mark", () =>
                hydrated.page.locator(marks).nth(index).click({ force: true }),
              );
              yield* hydrated.settle;
              const state = yield* shown(hydrated);

              assert.deepStrictEqual(state.pressed, onlyAt(index));
              assert.deepStrictEqual(state.picked, onlyAt(index));
            }),
          ),
        caseHang,
      );
    }

    it.effect(
      "PO5: Enter on each object's button picks up a new copy of that object, and Enter puts it on the stage, in that object's response alone",
      () =>
        Effect.scoped(
          Effect.gen(function* newCopies() {
            const {
              objects: { answering, identifiers },
            } = yield* Pages;
            const before = yield* everyObject(answering.responses, identifiers);

            assert.isAtLeast(identifiers.length, 2);

            for (const index of identifiers.keys()) {
              const hydrated = yield* openedObjects(answering);

              yield* step("focused the object's button", () =>
                hydrated.page.locator(objects).nth(index).focus(),
              );
              yield* step("pressed Enter", () => hydrated.page.keyboard.press("Enter"));
              yield* hydrated.settle;
              assert.deepStrictEqual(
                yield* objectsPressed(hydrated),
                identifiers.map((_, each) => each === index),
              );
              yield* step("pressed Enter", () => hydrated.page.keyboard.press("Enter"));
              yield* hydrated.settle;
              const after = yield* everyObject(yield* lastChange(hydrated), identifiers);

              for (const [each, points] of after.entries()) {
                const was = before[each] ?? [];

                if (each === index) {
                  assert.strictEqual(points.length, was.length + 1, `object ${String(each + 1)}`);
                  assert.deepStrictEqual(points.slice(0, was.length), was);
                } else {
                  assert.deepStrictEqual(points, was, `object ${String(each + 1)} is unchanged`);
                }
              }
            }
          }),
        ),
      caseHang,
    );

    it.effect(
      "PO6: Delete on each object's first copy's control takes that copy off, in that object's response alone",
      () =>
        Effect.scoped(
          Effect.gen(function* firstCopies() {
            const {
              objects: { answering, identifiers },
            } = yield* Pages;
            const before = yield* everyObject(answering.responses, identifiers);

            assert.isTrue(before.every((points) => points.length > 0));

            for (const index of identifiers.keys()) {
              const hydrated = yield* openedObjects(answering);

              yield* step("focused the object's first copy's control", () =>
                hydrated.page.locator(groups).nth(index).locator(controls).first().focus(),
              );
              yield* step("pressed Delete", () => hydrated.page.keyboard.press("Delete"));
              yield* hydrated.settle;
              assert.deepStrictEqual(
                yield* everyObject(yield* lastChange(hydrated), identifiers),
                before.map((points, each) => (each === index ? points.slice(1) : points)),
              );
            }
          }),
        ),
      caseHang,
    );

    it.effect(
      "PO7: a tap on an object's button while a new copy of another object is held picks up a copy of the object tapped, and writes nothing",
      () =>
        Effect.scoped(
          Effect.gen(function* otherObject() {
            const {
              objects: { answering, identifiers },
            } = yield* Pages;

            for (const index of identifiers.keys()) {
              const hydrated = yield* openedObjects(answering);
              const other = (index + 1) % identifiers.length;

              yield* step("focused the other object's button", () =>
                hydrated.page.locator(objects).nth(other).focus(),
              );
              yield* step("pressed Enter", () => hydrated.page.keyboard.press("Enter"));
              yield* hydrated.settle;
              assert.deepStrictEqual(
                yield* objectsPressed(hydrated),
                identifiers.map((_, each) => each === other),
              );
              yield* step("tapped the object's button", () =>
                hydrated.page.locator(objects).nth(index).click(),
              );
              yield* hydrated.settle;
              assert.deepStrictEqual(
                yield* objectsPressed(hydrated),
                identifiers.map((_, each) => each === index),
              );
              assert.deepStrictEqual(yield* hydrated.changes, []);
            }
          }),
        ),
      caseHang,
    );

    it.effect(
      "PO8: Enter on each once-placed object's button picks up its copy, an arrow moves it, and Enter on that button puts it down there, never taking it off",
      () =>
        Effect.scoped(
          Effect.gen(function* oncePlaced() {
            const {
              once: { answering, identifiers },
            } = yield* Pages;
            const before = yield* everyObject(answering.responses, identifiers);

            assert.isTrue(before.every((points) => points.length === 1));

            for (const index of identifiers.keys()) {
              const hydrated = yield* openedObjects(answering);

              yield* step("focused the object's button", () =>
                hydrated.page.locator(objects).nth(index).focus(),
              );
              yield* step("pressed Enter", () => hydrated.page.keyboard.press("Enter"));
              yield* hydrated.settle;
              assert.deepStrictEqual(
                yield* objectsPressed(hydrated),
                identifiers.map((_, each) => each === index),
              );
              yield* step("pressed ArrowRight", () => hydrated.page.keyboard.press("ArrowRight"));
              yield* step("pressed Enter", () => hydrated.page.keyboard.press("Enter"));
              yield* hydrated.settle;
              assert.deepStrictEqual(
                yield* everyObject(yield* lastChange(hydrated), identifiers),
                before.map((points, each) =>
                  each === index ? points.map(([x, y]) => [x + 1n, y] as const) : points,
                ),
              );
            }
          }),
        ),
      caseHang,
    );

    it.effect(
      "PO9: the arrow keys on the object's button move no copy picked up by its control, and Enter on that control puts it down where it was",
      () =>
        Effect.scoped(
          Effect.gen(function* arrowsOnTheButton() {
            for (const index of placed.keys()) {
              const hydrated = yield* opened;

              yield* step("focused the copy's control", () =>
                hydrated.page.locator(controls).nth(index).focus(),
              );
              yield* step("pressed Enter", () => hydrated.page.keyboard.press("Enter"));
              yield* hydrated.settle;
              yield* step("focused the object's button", () =>
                hydrated.page.locator(objects).first().focus(),
              );

              for (const key of ["ArrowRight", "ArrowDown", "Shift+ArrowLeft"]) {
                yield* step(`pressed ${key}`, () => hydrated.page.keyboard.press(key));
              }

              yield* step("focused the copy's control", () =>
                hydrated.page.locator(controls).nth(index).focus(),
              );
              yield* step("pressed Enter", () => hydrated.page.keyboard.press("Enter"));
              yield* hydrated.settle;
              assert.deepStrictEqual((yield* shown(hydrated)).pressed, [false, false, false]);
              assert.deepStrictEqual(yield* hydrated.changes, []);
            }
          }),
        ),
      caseHang,
    );

    it.effect(
      "PO10: two taps on a once-placed object's button put its copy back, and a tap on its copy's control then on the button takes it off",
      () =>
        Effect.scoped(
          Effect.gen(function* oncePlacedByPointer() {
            const {
              once: { answering, identifiers },
            } = yield* Pages;
            const before = yield* everyObject(answering.responses, identifiers);

            for (const index of identifiers.keys()) {
              const hydrated = yield* openedObjects(answering);
              const button = hydrated.page.locator(objects).nth(index);

              yield* step("tapped the object's button", () => button.click());
              yield* step("tapped the object's button again", () => button.click());
              yield* hydrated.settle;
              assert.deepStrictEqual(
                yield* objectsPressed(hydrated),
                identifiers.map(() => false),
              );
              assert.deepStrictEqual(yield* hydrated.changes, []);
              yield* step("tapped the copy's control", () =>
                hydrated.page.locator(groups).nth(index).locator(controls).first().click(),
              );
              yield* step("tapped the object's button", () => button.click());
              yield* hydrated.settle;
              assert.deepStrictEqual(
                yield* everyObject(yield* lastChange(hydrated), identifiers),
                before.map((points, each) => (each === index ? [] : points)),
              );
            }
          }),
        ),
      caseHang,
    );
  },
);
