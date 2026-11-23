/**
 * Shared stimuli as plate reads them, over the 1EdTech Best Practice guide's own shared stimulus
 * (`QTI3_BPIG_Examples`, the implementation guide's §3.7.7 example, "An Unbelievable Night"): the
 * passage document `passages/unbelievableNight.xml` and the three items that reference it, two by
 * `../passages/unbelievableNight.xml` from `items/`, one placing it in its body by
 * `data-stimulus-idref`.
 *
 * The rules each case holds, from the information model and the guide:
 *
 * - The item "uses the 'qti-assessment-stimulus-ref' structure to provide the link between the Item
 *   and the Stimulus" (§7.6), its `href` "The uri used to refer to the stimulus file (e.g.
 *   elsewhere in the same content package)" (§7.6.2), so the ref names the document its `href`
 *   resolves to from the item's own location (RFC 3986 §5.2), and is no unsupported part;
 * - A stimulus holds a `qti-stimulus-body` and a `qti-catalog-info`, "The alternative accessibility
 *   information that is to be associated with the content in the stimulus body" (§4.3.9, §4.3.10),
 *   so its body and its catalogs are read from its own document, its URLs resolved against its own
 *   location; a stylesheet is plate's mark, as an item's is, and a stimulus is never delivered
 *   alone;
 * - A catalog card stays dormant until the host enables its support, a stimulus's as an item's.
 *
 * The cases read the corpus (tag `corpus`), and fail when it is missing.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { configure } from "#plate/configuration.ts";
import type { BodyNode } from "#plate/model/item.ts";
import { redactStimulus } from "#plate/redact/walk.ts";
import { noSupports } from "#plate/supports.ts";
import { readCorpusFile } from "#plate/test/corpus.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem, acceptedStimulus, unsupportedFeatures } from "#plate/validate/verdict.ts";

/**
 * The Best Practice guide's package, an extracted folder of the corpus.
 */
const bpig = "QTI3_BPIG_Examples";

/**
 * Open a document of the guide's package at its path there, which the database admitted.
 *
 * @param path The document's path in the package.
 * @returns Its verdict.
 */
const opened = Effect.fnUntraced(function* opened(path: string) {
  return yield* admitted(path, yield* readCorpusFile(`${bpig}/${path}`));
});

/**
 * Collect the `data-stimulus-idref` of every element of a body, in document order.
 *
 * @param nodes The body.
 * @returns The idrefs as written.
 */
const placementsIn = (nodes: readonly BodyNode[]): readonly string[] =>
  nodes.flatMap((node) =>
    node.kind === "element"
      ? [...(node.stimulus === undefined ? [] : [node.stimulus]), ...placementsIn(node.children)]
      : [],
  );

describe("shared stimuli, over the Best Practice guide's passage", { tags: ["corpus"] }, () => {
  it.effect(
    "an item's stimulus ref names the document its href resolves to from the item's directory, and is no unsupported part",
    () =>
      Effect.gen(function* refs() {
        for (const path of [
          "items/unbelievable_night_item1.xml",
          "items/unbelievable_night_item3.xml",
        ]) {
          const verdict = yield* opened(path);
          const item = Option.getOrElse(acceptedItem(verdict), () =>
            assert.fail(`${path} is ${verdict.verdict}, not an accepted item`),
          );

          assert.deepStrictEqual(
            item.item.content["qti-assessment-stimulus-ref"].map(({ identifier, target }) => ({
              identifier,
              target: String(target),
            })),
            [{ identifier: "Stimulus1", target: "passages/unbelievableNight.xml" }],
          );
          assert.deepStrictEqual(
            unsupportedFeatures(verdict).filter(
              (feature) => feature.feature === "qti-assessment-stimulus-ref",
            ),
            [],
          );
        }
      }),
  );

  it.effect(
    "an item that places its stimulus by data-stimulus-idref names the ref by its identifier from a body element",
    () =>
      Effect.gen(function* placed() {
        const verdict = yield* opened("items/unbelievable_night_item2.xml");
        const item = Option.getOrElse(acceptedItem(verdict), () =>
          assert.fail(`item 2 is ${verdict.verdict}, not an accepted item`),
        );

        assert.deepStrictEqual(
          item.item.content["qti-assessment-stimulus-ref"].map((ref) => ref.identifier),
          ["Stimulus1"],
        );
        assert.deepStrictEqual(placementsIn(item.item.body), ["Stimulus1"]);
      }),
  );

  it.effect(
    "a stimulus is read whole from its own document: its body, its catalog, its language and title, its picture resolved against its own location, its stylesheet marked and its root never delivered alone",
    () =>
      Effect.gen(function* stimulus() {
        const verdict = yield* opened("passages/unbelievableNight.xml");
        const accepted = Option.getOrElse(acceptedStimulus(verdict), () =>
          assert.fail(
            `the passage is ${verdict.verdict} ${verdict.kind}, not an accepted stimulus`,
          ),
        );
        const { stimulus: read } = accepted;

        assert.strictEqual(verdict.verdict, "accepted-with-unsupported");
        assert.strictEqual(read.document, "passages/unbelievableNight.xml");
        assert.strictEqual(read.identifier, "Stimulus1");
        assert.strictEqual(read.title, "An Unbelievable Night");
        assert.deepStrictEqual(read.lang, Option.some("en"));
        assert.deepStrictEqual(
          unsupportedFeatures(verdict).map(({ feature, shown }) => ({ feature, shown })),
          [
            { feature: "root:qti-assessment-stimulus", shown: "mark" },
            { feature: "qti-stylesheet", shown: "mark" },
          ],
        );

        const catalogs = read.content["qti-catalog-info"].flatMap((node) => node.catalogs);
        assert.deepStrictEqual(
          catalogs.map((catalog) => ({
            cards: catalog.cards.map((card) => card.support),
            id: catalog.id,
          })),
          [{ cards: ["linguistic-guidance"], id: "et1234" }],
        );

        // The passage's picture, `images/exemplarSection01_title.png` from `passages/`, kept as a
        // package path of the stimulus's own directory.
        const sources = (nodes: readonly BodyNode[]): readonly string[] =>
          nodes.flatMap((node) =>
            node.kind === "element"
              ? [
                  ...node.attributes.flatMap((attribute) =>
                    node.tag === "img" && attribute.name === "src" ? [attribute.value] : [],
                  ),
                  ...sources(node.children),
                ]
              : [],
          );
        assert.deepStrictEqual(sources(read.body), ["images/exemplarSection01_title.png"]);
      }),
  );

  it.effect(
    "a stimulus's catalog card stays dormant until the host enables its support, then reaches the page with the body that names it",
    () =>
      Effect.gen(function* dormant() {
        const verdict = yield* opened("passages/unbelievableNight.xml");
        const accepted = Option.getOrElse(acceptedStimulus(verdict), () =>
          assert.fail("the passage is no accepted stimulus"),
        );
        const configuration = yield* configure({ seed: "" });
        const shownWith = (catalog: ReadonlySet<"linguistic-guidance">) =>
          redactStimulus(
            accepted.stimulus,
            {
              configuration,
              supports: { ...noSupports, catalog },
              view: "candidate",
            },
            false,
          );

        assert.deepStrictEqual(shownWith(new Set()).content["qti-catalog-info"], []);

        const enabled = shownWith(new Set(["linguistic-guidance"]));
        assert.deepStrictEqual(
          enabled.content["qti-catalog-info"].flatMap((node) =>
            node.catalogs.map((catalog) => ({
              cards: catalog.cards.map((card) => card.support),
              id: catalog.id,
            })),
          ),
          [{ cards: ["linguistic-guidance"], id: "et1234" }],
        );
        assert.strictEqual(enabled.title, "An Unbelievable Night");
        assert.isAbove(enabled.body.length, 0);
      }),
  );
});
