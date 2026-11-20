/**
 * Position Object's verdict on a picture with no text alternative (WCAG 2.2, 1.1.1 Non-text
 * Content): an object image or a stage image the child sees and a screen reader cannot name is
 * marked on the item's verdict, at the image, for the content admin who writes its alternative.
 * An image's alternative is its `alt`, or an `object`'s text content, each counting only when it
 * holds more than XML white space.
 *
 * The oracle is the documents, read by eye: `ei/items/position-object-unnamed.xml` writes its stage
 * image's `alt` empty, gives its first object, an `object`, no text, its second, an `object`, the
 * text "A bench", and its third, an `img`, a blank `alt`; `ei/items/position-object.xml` writes an
 * `alt` on every picture; the corpus's BPIG airports item writes an `alt` on both of its `img`s,
 * and its packaging copies draw both pictures as `object`s with no text.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { readCorpusFile } from "#plate/test/corpus.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";

/**
 * The fixtures' root, which each fixture's location is written from.
 */
const fixtures = path.resolve(import.meta.dirname, "..", "..", "fixtures");

/**
 * The verdict's key for an object image with no text alternative.
 */
const unnamedObject = "object-alt:missing";

/**
 * The verdict's key for a stage image with no text alternative.
 */
const unnamedStage = "stage-alt:missing";

/**
 * The element path of a stage in an item's body.
 */
const stagePath = "qti-assessment-item/qti-item-body/qti-position-object-stage";

/**
 * Open a document, which `admitted` must accept as an item, and give its verdict and its marks.
 *
 * @param location The document's location.
 * @param bytes The document.
 * @returns The verdict, and the features it records, each with its path.
 */
const verdictOf = Effect.fnUntraced(function* verdictOf(location: string, bytes: Uint8Array) {
  const verdict = yield* admitted(location, bytes);
  const item = Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${location} is not accepted: ${verdict.verdict}`),
  );

  return { unsupported: item.item.unsupported, verdict: verdict.verdict };
});

/**
 * Open a fixture item, which `admitted` must accept.
 *
 * @param location The item's path from the fixtures' root.
 * @returns Its verdict and its marks.
 */
const fixtureVerdict = Effect.fnUntraced(function* fixtureVerdict(location: string) {
  return yield* verdictOf(
    location,
    yield* Effect.promise(() => readFile(path.join(fixtures, location))),
  );
});

describe("Position Object's verdict on a picture with no text alternative", () => {
  it.effect(
    "marks the stage image with an empty alt, the object with no text and the img with a blank alt, and not the object named by its text (WCAG 1.1.1)",
    () =>
      Effect.gen(function* unnamedPictures() {
        const { unsupported, verdict } = yield* fixtureVerdict(
          "ei/items/position-object-unnamed.xml",
        );
        const interaction = `${stagePath}/qti-position-object-interaction`;

        assert.strictEqual(verdict, "accepted-with-unsupported");
        assert.sameDeepMembers(
          [...unsupported],
          [
            { feature: unnamedObject, path: `${interaction}[1]/object`, shown: "mark" },
            { feature: unnamedObject, path: `${interaction}[3]/img`, shown: "mark" },
            { feature: unnamedStage, path: `${stagePath}/img`, shown: "mark" },
          ],
        );
      }),
  );

  it.effect("marks nothing on the fixture whose every picture has its alt", () =>
    Effect.gen(function* namedFixture() {
      const { unsupported, verdict } = yield* fixtureVerdict("ei/items/position-object.xml");

      assert.strictEqual(verdict, "accepted");
      assert.deepStrictEqual(unsupported, []);
    }),
  );

  it.effect(
    "marks neither picture of the BPIG airports, and both of each packaging copy, which draws them as objects with no text",
    () =>
      Effect.gen(function* corpusPictures() {
        const bpig = "QTI3_BPIG_Examples/items/position-object-1.xml";
        const named = yield* verdictOf(bpig, yield* readCorpusFile(bpig));

        assert.deepStrictEqual(
          named.unsupported.filter(
            ({ feature }) => feature === unnamedObject || feature === unnamedStage,
          ),
          [],
          bpig,
        );

        for (const location of [
          "qtiv3-examples/packaging/items/position_object.xml",
          "qtiv3-examples/packaging/items/items.zip.d/position_object.xml",
        ]) {
          const { unsupported } = yield* verdictOf(location, yield* readCorpusFile(location));

          assert.sameDeepMembers(
            unsupported.filter(
              ({ feature }) => feature === unnamedObject || feature === unnamedStage,
            ),
            [
              {
                feature: unnamedObject,
                path: `${stagePath}/qti-position-object-interaction/object`,
                shown: "mark",
              },
              { feature: unnamedStage, path: `${stagePath}/object`, shown: "mark" },
            ],
            location,
          );
        }
      }),
    { tags: ["corpus"] },
  );
});
