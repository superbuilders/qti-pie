/**
 * The Hotspot interaction (`qti-hotspot-interaction`) hydrated in headless Google Chrome
 * (`#specimen/ui/hydrated.ts`) and driven as a child drives it, on two of 1EdTech's own examples of
 * one map of four airports, each its correct response the child's: "UK Airports (Take 1)"
 * (`qtiv3-examples/packaging/items/hotspot.xml`), each airport a circle of radius 8, one `single`
 * `identifier` response, its correct response `A`, so the page opens with one area picked; and
 * "Composite UK Airports 3" (`Item_QTI3_Hotspot_03` of the shared vocabulary), the same circles of
 * radius 10, one `multiple` response of at most three, its correct response `A`, `B` and `D`, so
 * the page opens with three areas picked.
 *
 * Held to plate's island as its module states it (`#plate/ui/hotspot/hotspot.tsx`), written down
 * here by hand, never from the island's code:
 *
 * - HS1, a tap on the picked area takes it back, and a tap on another picks it: a tap on `A` writes
 *   NULL, a tap on `B` then writes `B`, and a tap on `C` moves the pick to `C`.
 * - HS2, read-only, as a host's review or a completed attempt shows it: the stage draws no area's hit
 *   shape, and a tap on another area's place in the picture, a press on its row and an arrow key on
 *   the picked row's radio change nothing, the arrow key moving the focus to the next row, and the
 *   radio group reads as read-only. The suite draws it read-only through renderers of its own,
 *   plate's standard ones with the Hotspot's island given `readOnly`, as a host outside plate's
 *   shell draws it (`@qti-pie/plate/ui/hotspot`).
 * - HS3, several picks read-only: the stage draws no area's hit shape, every row's checkbox reads as
 *   read-only, and a tap on a picked area's place and on another's, a press on a picked row and on
 *   another, and Space on the picked row's checkbox change nothing, the checkbox taking the focus.
 * - HS4, several picks, a tap on a picked area takes it back and the others stay, and a tap on
 *   another picks it beside them: a tap on `A` writes `B` and `D`, and a tap on `C` then writes
 *   `B`, `D` and `C`.
 *
 * Every page hydrates with no error React reports, none the page throws and none its console logs
 * but a picture's failed load, and none is reported, thrown or logged after any key or tap a case
 * sends, by the time the page has settled.
 *
 * Kills are in this suite's commit: each slip planted in plate that breaks a rule fails it.
 *
 * @module
 */
import { assert, layer } from "@effect/vitest";
import { Array as Arr, Context, Effect, Layer, Option, Schema } from "effect";
import { cloneElement, isValidElement } from "react";
import type { Responses as ResponseValues } from "@qti-pie/plate";
import { renderersOf, standardRenderers } from "@qti-pie/plate/ui";
import type { Renderers } from "@qti-pie/plate/ui";
import { corpusItems } from "#specimen/ui/corpus.ts";
import { HydrationFailure, hydratedPages, solved } from "#specimen/ui/hydrated.ts";
import type { Answering, Hydrated } from "#specimen/ui/hydrated.ts";

/**
 * 1EdTech's Hotspot examples the suite drives, each by its corpus file and its response: one pick,
 * and several.
 */
const examples = {
  airports: { location: "qtiv3-examples/packaging/items/hotspot.xml", response: "RESPONSE" },
  cities: {
    location: "qtiv3-examples/items/shared-vocabulary/Items/Item_QTI3_Hotspot_03/hotspot-qti3.xml",
    response: "RESPONSE1",
  },
} as const;

/**
 * An example's name.
 */
type Example = keyof typeof examples;

/**
 * The examples' areas, the same in both, in document order: each identifier and its circle's
 * centre, as their XML writes them.
 */
const areas = [
  { identifier: "A", x: 77, y: 115 },
  { identifier: "B", x: 118, y: 184 },
  { identifier: "C", x: 150, y: 235 },
  { identifier: "D", x: 96, y: 114 },
] as const;

/**
 * Plate's standard renderers with the Hotspot's island given `readOnly`, as a host outside plate's
 * shell draws it for a review or a completed attempt. The island plate's shell renders is the
 * Hotspot's element, whose `readOnly` alone changes.
 */
const readOnlyRenderers: Renderers = renderersOf(standardRenderers, [
  {
    hotspot: {
      ...standardRenderers.hotspot,
      island: (paired, context) => {
        const island = standardRenderers.hotspot.island(paired, context);

        return isValidElement<{ readonly readOnly: boolean }>(island)
          ? cloneElement(island, { readOnly: true })
          : island;
      },
    },
  },
]);

/**
 * What the suite's cases share, made once for the file: the pages, to open an item in, hydrated;
 * and each of 1EdTech's examples, solved, to draw as plate's shell draws it or read-only.
 */
interface Shared {
  readonly items: Readonly<Record<Example, Answering>>;
  readonly open: Effect.Success<typeof hydratedPages>;
}

/**
 * The service that holds what the suite's cases share.
 */
class Pages extends Context.Service<Pages, Shared>()("specimen/ui/hotspot.test/Pages") {}

/**
 * What the suite's cases share, made once for the file.
 */
const shared = Layer.effect(
  Pages,
  Effect.gen(function* sharing() {
    const open = yield* hydratedPages;
    const corpus = yield* corpusItems;
    const solvedAt = (example: Example) => {
      const { location } = examples[example];
      const item = Arr.findFirst(corpus, (each) => each.location === location);

      return Option.isNone(item)
        ? Effect.fail(
            new HydrationFailure({ cause: location, step: "found the example in the corpus" }),
          )
        : Effect.succeed(solved(item.value));
    };
    const items = { airports: yield* solvedAt("airports"), cities: yield* solvedAt("cities") };

    return { items, open } satisfies Shared;
  }),
);

/**
 * Open an example, solved, in a page of its own, drawn by the renderers given.
 *
 * @param example The example.
 * @param renderers The renderers: plate's standard ones, or the read-only Hotspot's.
 * @returns The page.
 */
const opened = (example: Example, renderers: Renderers) =>
  Effect.gen(function* openedPage() {
    const { items, open } = yield* Pages;

    return yield* open({ ...items[example], renderers });
  });

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
 * An `identifier` response as the suite reads it: its identifiers, in order.
 */
const IdentifierResponse = Schema.Struct({
  values: Schema.Array(Schema.Struct({ value: Schema.String })),
});

/**
 * Read an example's response's identifiers from responses.
 *
 * @param example The example.
 * @param responses The responses.
 * @returns The identifiers, none for NULL.
 */
const picksIn = (
  example: Example,
  responses: ResponseValues,
): Effect.Effect<readonly string[], HydrationFailure> =>
  Effect.mapError(
    Schema.decodeUnknownEffect(IdentifierResponse)(responses[examples[example].response]),
    (cause) => new HydrationFailure({ cause, step: "read the response's identifiers" }),
  ).pipe(Effect.map(({ values }) => values.map(({ value }) => value)));

/**
 * The responses each change wrote, in order, as their identifiers.
 *
 * @param hydrated The page.
 * @param example The example it shows.
 * @returns Each change's identifiers.
 */
const writes = (hydrated: Hydrated, example: Example) =>
  Effect.flatMap(hydrated.changes, (changes) =>
    Effect.forEach(changes, (responses) => picksIn(example, responses)),
  );

/**
 * Tap an area's place in the picture: the centre of its mark's circle, which the stage draws in
 * the image's pixels at the circle's own centre, scrolled into view. The mark takes no pointer,
 * so the tap lands on what lies under it, the area's hit shape where the stage draws one.
 *
 * @param hydrated The page.
 * @param at The area's place among the areas.
 * @returns The effect.
 */
const tapped = (hydrated: Hydrated, at: number) =>
  Effect.gen(function* tap() {
    const area = areas[at];

    if (area === undefined) {
      return yield* new HydrationFailure({ cause: at, step: "found the area" });
    }

    yield* step(`tapped ${area.identifier} on the stage`, () =>
      hydrated.page
        .locator(
          `[data-slot="plate-graphic-mark"] > circle[data-tone="ink"][cx="${String(area.x)}"][cy="${String(area.y)}"]`,
        )
        .click({ force: true }),
    );
    yield* hydrated.settle;
  });

/**
 * Read the page's Hotspot: the rows' radios or checkboxes checked, the one focused, none for focus
 * elsewhere, the areas' hit shapes drawn, and whether the picks read as read-only, the radio group
 * for one pick, every checkbox for several.
 *
 * @param hydrated The page.
 * @returns What the page shows.
 */
const shown = (hydrated: Hydrated) =>
  step("read the Hotspot", () =>
    hydrated.page.evaluate(() => {
      const picks = [...document.querySelectorAll('[data-slot="radio"], [data-slot="checkbox"]')];
      const group = document.querySelector('[data-slot="radio-group"]');

      return {
        checked: picks.map((each) => each.getAttribute("aria-checked") === "true"),
        focused: picks.indexOf(document.activeElement ?? document.body),
        hitTargets: document.querySelectorAll('[data-slot="plate-graphic-area"]').length,
        readOnly:
          group === null
            ? picks.every((each) => each.getAttribute("aria-readonly") === "true")
            : group.getAttribute("aria-readonly") === "true",
      };
    }),
  );

/**
 * Give the areas picked true, and every other false.
 *
 * @param picked The picked areas' places.
 * @returns The flags, in the areas' order.
 */
const pickedAt = (picked: readonly number[]): readonly boolean[] =>
  areas.map((_, each) => picked.includes(each));

/**
 * Press an area's row in the list beside the picture.
 *
 * @param hydrated The page.
 * @param at The area's place among the areas.
 * @returns The effect.
 */
const pressedRow = (hydrated: Hydrated, at: number) =>
  Effect.gen(function* press() {
    yield* step(`pressed row ${String(at)}`, () =>
      hydrated.page.locator('[data-slot="plate-hotspot-option"]').nth(at).click(),
    );
    yield* hydrated.settle;
  });

layer(shared, { excludeTestServices: true })(
  "Hotspot hydrated in Chrome, on 1EdTech's UK Airports with one pick and with several, the correct areas picked",
  (it) => {
    it.effect(
      "HS1: a tap on the picked area takes it back to NULL, a tap on another picks it, and a tap on a third moves the pick",
      () =>
        Effect.scoped(
          Effect.gen(function* takesBack() {
            const hydrated = yield* opened("airports", standardRenderers);

            assert.deepStrictEqual((yield* shown(hydrated)).checked, pickedAt([0]));
            yield* tapped(hydrated, 0);
            yield* tapped(hydrated, 1);
            yield* tapped(hydrated, 2);
            assert.deepStrictEqual(yield* writes(hydrated, "airports"), [[], ["B"], ["C"]]);
            assert.deepStrictEqual((yield* shown(hydrated)).checked, pickedAt([2]));
          }),
        ),
    );

    it.effect(
      "HS2: read-only, the stage draws no hit shape, and a tap on another area, a press on its row and an arrow key on the picked row change nothing, the arrow moving the focus",
      () =>
        Effect.scoped(
          Effect.gen(function* readOnly() {
            const hydrated = yield* opened("airports", readOnlyRenderers);
            const before = yield* shown(hydrated);

            assert.deepStrictEqual(before.checked, pickedAt([0]));
            assert.strictEqual(before.hitTargets, 0, "a read-only stage draws no hit shape");
            assert.isTrue(before.readOnly, "the radio group reads as read-only");
            yield* tapped(hydrated, 1);
            yield* pressedRow(hydrated, 2);
            yield* step("focused A's radio", () =>
              hydrated.page.locator('[data-slot="radio"]').nth(0).focus(),
            );
            yield* step("pressed ArrowDown", () => hydrated.page.keyboard.press("ArrowDown"));
            yield* hydrated.settle;
            const after = yield* shown(hydrated);

            assert.deepStrictEqual(yield* writes(hydrated, "airports"), []);
            assert.deepStrictEqual(after.checked, pickedAt([0]));
            assert.strictEqual(after.focused, 1, "the arrow key moves the focus to the next row");
          }),
        ),
    );

    it.effect(
      "HS3: several picks read-only, the stage draws no hit shape, and a tap on a picked area and on another, a press on a picked row and on another, and Space on a picked row's checkbox change nothing, the checkbox taking the focus",
      () =>
        Effect.scoped(
          Effect.gen(function* severalReadOnly() {
            const hydrated = yield* opened("cities", readOnlyRenderers);
            const before = yield* shown(hydrated);

            assert.deepStrictEqual(before.checked, pickedAt([0, 1, 3]));
            assert.strictEqual(before.hitTargets, 0, "a read-only stage draws no hit shape");
            assert.isTrue(before.readOnly, "every checkbox reads as read-only");
            yield* tapped(hydrated, 0);
            yield* tapped(hydrated, 2);
            yield* pressedRow(hydrated, 0);
            yield* pressedRow(hydrated, 2);
            yield* step("focused A's checkbox", () =>
              hydrated.page.locator('[data-slot="checkbox"]').nth(0).focus(),
            );
            yield* step("pressed Space", () => hydrated.page.keyboard.press("Space"));
            yield* hydrated.settle;
            const after = yield* shown(hydrated);

            assert.deepStrictEqual(yield* writes(hydrated, "cities"), []);
            assert.deepStrictEqual(after.checked, pickedAt([0, 1, 3]));
            assert.strictEqual(after.focused, 0, "a read-only checkbox takes the focus");
          }),
        ),
    );

    it.effect(
      "HS4: several picks, a tap on a picked area takes it back and the others stay, and a tap on another picks it beside them",
      () =>
        Effect.scoped(
          Effect.gen(function* severalTakesBack() {
            const hydrated = yield* opened("cities", standardRenderers);

            assert.deepStrictEqual((yield* shown(hydrated)).checked, pickedAt([0, 1, 3]));
            yield* tapped(hydrated, 0);
            yield* tapped(hydrated, 2);
            assert.deepStrictEqual(yield* writes(hydrated, "cities"), [
              ["B", "D"],
              ["B", "D", "C"],
            ]);
            assert.deepStrictEqual((yield* shown(hydrated)).checked, pickedAt([1, 2, 3]));
          }),
        ),
    );
  },
);
