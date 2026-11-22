/**
 * The graphic kinds' names for an area, and their verdict on an area with no name of the author's
 * (WCAG 2.2, 1.1.1 Non-text Content), beside Hotspot's own (`#plate/interactions/hotspot.test.ts`):
 * a `qti-associable-hotspot` of Graphic Gap Match or Graphic Associate, and a `qti-hotspot-choice`
 * of Graphic Order, is an empty element, so its name is its `hotspot-label`, else its `aria-label`,
 * and an area with neither, or both blank, is marked on the item's verdict for the content admin.
 *
 * The oracle is the documents, read by eye: each item written (`#plate/test/area-items.ts`) names
 * its first area by `hotspot-label`, gives its second no name, writes its third's `hotspot-label`
 * blank, names its fourth by `aria-label` alone and its fifth by `aria-label` beside a blank
 * `hotspot-label`, and writes its sixth's `aria-label` blank; the fixtures
 * `m3d/items/graphic-gap-match.xml`, `ei/items/graphic-order.xml` and
 * `ei/items/graphic-associate.xml` label every area, `ei/items/graphic-order-subset.xml` every area
 * but its third, and the corpus's BPIG `QTI3-graphic-order.xml` names its four airports by
 * `aria-label` alone ("Airport A" to "Airport D").
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { interactionsIn } from "#plate/model/interactions.ts";
import { areaItemOf, areaKinds } from "#plate/test/area-items.ts";
import { readCorpusFile } from "#plate/test/corpus.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The fixtures' root, which each fixture's location is written from.
 */
const fixtures = path.resolve(import.meta.dirname, "..", "..", "fixtures");

/**
 * The verdict's key for an area with no `hotspot-label` of its own.
 */
const unlabelled = "hotspot-label:missing";

/**
 * The element path of a graphic interaction in an item's body.
 */
const bodyPath = "qti-assessment-item/qti-item-body";

/**
 * Open a document, which `admitted` must accept as an item.
 *
 * @param location The document's location.
 * @param bytes The document.
 * @returns The accepted item, with the verdict it came from.
 */
const accepted = Effect.fnUntraced(function* accepted(location: string, bytes: Uint8Array) {
  const verdict = yield* admitted(location, bytes);
  const item: Accepted = Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${location} is not accepted: ${verdict.verdict}`),
  );

  return { item, verdict: verdict.verdict };
});

/**
 * Open a fixture item, which `admitted` must accept.
 *
 * @param location The item's path from the fixtures' root.
 * @returns The accepted item, with the verdict it came from.
 */
const fixture = Effect.fnUntraced(function* fixture(location: string) {
  return yield* accepted(
    location,
    yield* Effect.promise(() => readFile(path.join(fixtures, location))),
  );
});

/**
 * Give the names of an item's graphic areas, in document order, absent for an area with none.
 *
 * @param item The accepted item, which holds one Graphic Gap Match, Graphic Order or Graphic
 *   Associate.
 * @returns Each area's name.
 */
const namesOf = (item: Accepted): readonly (string | undefined)[] =>
  interactionsIn(item.item.body).flatMap((node) =>
    node.kind === "graphic-gap-match" ||
    node.kind === "graphic-order" ||
    node.kind === "graphic-associate"
      ? node.hotspots.map((hotspot) => Option.getOrUndefined(hotspot.label))
      : [],
  );

describe("the graphic kinds' verdict on an unlabelled area", () => {
  for (const kind of areaKinds) {
    it.effect(
      `${kind.element} names each ${kind.area} by its hotspot-label, else its aria-label, and marks each named neither way (WCAG 1.1.1)`,
      () =>
        Effect.gen(function* unlabelledAreas() {
          const { item, verdict } = yield* accepted(
            `${kind.element}.xml`,
            new TextEncoder().encode(areaItemOf(kind)),
          );
          const at = `${bodyPath}/${kind.element}/${kind.area}`;

          assert.strictEqual(verdict, "accepted-with-unsupported");
          assert.deepStrictEqual(namesOf(item), [
            "The field",
            undefined,
            undefined,
            "The pond",
            "The barn",
            undefined,
          ]);
          assert.deepStrictEqual(item.item.unsupported, [
            { feature: unlabelled, path: `${at}[2]`, shown: "mark" },
            { feature: unlabelled, path: `${at}[3]`, shown: "mark" },
            { feature: unlabelled, path: `${at}[6]`, shown: "mark" },
          ]);
        }),
    );
  }

  it.effect("marks nothing on the fixtures whose every area is labelled", () =>
    Effect.gen(function* labelledFixtures() {
      for (const location of [
        "m3d/items/graphic-gap-match.xml",
        "ei/items/graphic-order.xml",
        "ei/items/graphic-associate.xml",
      ]) {
        const { item, verdict } = yield* fixture(location);

        assert.strictEqual(verdict, "accepted", location);
        assert.deepStrictEqual(item.item.unsupported, [], location);
      }
    }),
  );

  it.effect("marks the one unlabelled hotspot of the Graphic Order subset fixture", () =>
    Effect.gen(function* subsetFixture() {
      const { item } = yield* fixture("ei/items/graphic-order-subset.xml");

      assert.deepStrictEqual(item.item.unsupported, [
        {
          feature: unlabelled,
          path: `${bodyPath}/qti-graphic-order-interaction/qti-hotspot-choice[3]`,
          shown: "mark",
        },
      ]);
    }),
  );

  it.effect(
    "names the BPIG Graphic Order's airports by their aria-label and marks none of them",
    () =>
      Effect.gen(function* ariaNamedAirports() {
        const location = "QTI3_BPIG_Examples/items/QTI3-graphic-order.xml";
        const { item } = yield* accepted(location, yield* readCorpusFile(location));

        assert.deepStrictEqual(namesOf(item), ["Airport A", "Airport B", "Airport C", "Airport D"]);
        assert.deepStrictEqual(
          item.item.unsupported.filter(({ feature }) => feature === unlabelled),
          [],
        );
      }),
    { tags: ["corpus"] },
  );
});
