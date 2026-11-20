/**
 * The Hotspot core's name for an area, and its verdict on an area with no name of the author's
 * (WCAG 2.2, 1.1.1 Non-text Content): a `qti-hotspot-choice` is an empty element, so its name is
 * its `hotspot-label`, else its `aria-label`, and a hotspot with neither, or both blank, is marked
 * on the item's verdict for the content admin.
 *
 * The oracle is the documents, read by eye: `m3d/items/hotspot-unlabelled.xml` labels its first
 * hotspot, writes its third's `hotspot-label` blank, and gives its second and its default hotspot,
 * the fourth, none; `m3d/items/hotspot.xml` labels each of its four; the item written here names
 * its first area by `hotspot-label`, its second by `aria-label` alone, its third by `aria-label`
 * beside a blank `hotspot-label`, and its fourth by neither, its `aria-label` blank.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { interactionsIn } from "#plate/model/interactions.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The fixtures' root, which each item's location is written from.
 */
const fixtures = path.resolve(import.meta.dirname, "..", "..", "fixtures");

/**
 * The element path of a Hotspot fixture's hotspots, each followed by its position among them.
 */
const choicePath = "qti-assessment-item/qti-item-body/qti-hotspot-interaction/qti-hotspot-choice";

/**
 * The verdict's key for a hotspot with no name of the author's.
 */
const unlabelled = "hotspot-label:missing";

/**
 * A Hotspot item whose four areas are named by `hotspot-label`, by `aria-label` alone, by
 * `aria-label` beside a blank `hotspot-label`, and by neither, its `aria-label` blank.
 */
const ariaNamed = [
  '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="aria-named" title="Named areas" adaptive="false" time-dependent="false">',
  '<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"/>',
  "<qti-item-body>",
  '<qti-hotspot-interaction response-identifier="RESPONSE" max-choices="1">',
  '<img src="map.svg" alt="Four plots of a garden" width="400" height="300"/>',
  '<qti-hotspot-choice identifier="A" shape="rect" coords="40,40,160,120" hotspot-label="The square plot"/>',
  '<qti-hotspot-choice identifier="B" shape="circle" coords="300,90,50" aria-label="The round plot"/>',
  '<qti-hotspot-choice identifier="C" shape="rect" coords="200,200,260,260" hotspot-label=" " aria-label="The small plot"/>',
  '<qti-hotspot-choice identifier="D" shape="rect" coords="300,200,380,280" aria-label=" "/>',
  "</qti-hotspot-interaction>",
  "</qti-item-body>",
  "</qti-assessment-item>",
].join("");

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
 * Give the names of an item's Hotspot areas, in document order, absent for an area with none.
 *
 * @param item The accepted item, which holds one Hotspot.
 * @returns Each area's name.
 */
const namesOf = (item: Accepted): readonly (string | undefined)[] =>
  interactionsIn(item.item.body).flatMap((node) =>
    node.kind === "hotspot"
      ? node.choices.map((choice) => Option.getOrUndefined(choice.label))
      : [],
  );

describe("the Hotspot core's verdict on an unlabelled area", () => {
  it.effect(
    "marks each hotspot whose hotspot-label is absent or blank, the default one among them, and no other (WCAG 1.1.1)",
    () =>
      Effect.gen(function* unlabelledAreas() {
        const { item, verdict } = yield* fixture("m3d/items/hotspot-unlabelled.xml");

        assert.strictEqual(verdict, "accepted-with-unsupported");
        assert.deepStrictEqual(item.item.unsupported, [
          { feature: unlabelled, path: `${choicePath}[2]`, shown: "mark" },
          { feature: unlabelled, path: `${choicePath}[3]`, shown: "mark" },
          { feature: unlabelled, path: `${choicePath}[4]`, shown: "mark" },
        ]);
      }),
  );

  it.effect("marks nothing on an item whose every hotspot is labelled", () =>
    Effect.gen(function* labelledAreas() {
      const { item, verdict } = yield* fixture("m3d/items/hotspot.xml");

      assert.strictEqual(verdict, "accepted");
      assert.deepStrictEqual(item.item.unsupported, []);
    }),
  );

  it.effect(
    "names a hotspot by its hotspot-label, else its aria-label, and marks only the one named neither way",
    () =>
      Effect.gen(function* ariaLabelled() {
        const { item, verdict } = yield* accepted(
          "aria-named.xml",
          new TextEncoder().encode(ariaNamed),
        );

        assert.strictEqual(verdict, "accepted-with-unsupported");
        assert.deepStrictEqual(namesOf(item), [
          "The square plot",
          "The round plot",
          "The small plot",
          undefined,
        ]);
        assert.deepStrictEqual(item.item.unsupported, [
          { feature: unlabelled, path: `${choicePath}[4]`, shown: "mark" },
        ]);
      }),
  );
});
