import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { readCorpusFile } from "#plate/test/corpus.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Verdict } from "#plate/validate/verdict.ts";

/**
 * The corpus documents the witness opens, by their path under the corpus root, which `admitted`
 * takes as their location: a MathML item, an Upload item plate accepts and shows as a notice, and
 * three Beginner's Guide items it accepts whole.
 */
const corpusItems = {
  bg007: "QTI3_BPIG_Examples/items/BG007.xml",
  bg010: "QTI3_BPIG_Examples/items/BG010.xml",
  bg011: "QTI3_BeginnersGuide_Examples/items/BG011.xml",
  mathml: "QTI3_BPIG_Examples/items/MathML.xml",
  upload: "QTI3_BPIG_Examples/items/upload-interaction.xml",
} as const;

/**
 * Open a corpus document as a host opens a document it read from storage.
 *
 * @param location The document's path under the corpus root.
 * @returns Its verdict.
 */
const openCorpusItem = Effect.fnUntraced(function* openCorpusItem(location: string) {
  const verdict: Verdict = yield* admitted(location, yield* readCorpusFile(location));

  return { verdict };
});

describe("the vertical witness over the corpus", { tags: ["corpus"] }, () => {
  it.effect("admitted gives each corpus document its verdict", () =>
    Effect.gen(function* verdicts() {
      const table: readonly (readonly [string, Verdict["verdict"]])[] = [
        // Accepted: the MathML content module judges MathML, so the item is built and judged.
        [corpusItems.mathml, "accepted"],
        [corpusItems.upload, "accepted-with-unsupported"],
        [corpusItems.bg007, "accepted"],
        [corpusItems.bg010, "accepted"],
        [corpusItems.bg011, "accepted"],
      ];

      for (const [location, expected] of table) {
        const { verdict } = yield* openCorpusItem(location);

        assert.strictEqual(verdict.verdict, expected, location);
        assert.strictEqual(verdict.document, location);
      }
    }),
  );
});

describe(
  "an item whose template processing sets its correct response",
  { tags: ["corpus"] },
  () => {
    it.effect(
      "template_digging opens accepted, with its template processing, which the database runs, and nothing marked",
      () =>
        Effect.gen(function* templateDigging() {
          const location = "QTI3_BPIG_Examples/items/template_digging.xml";
          const { verdict } = yield* openCorpusItem(location);
          const accepted = acceptedItem(verdict).pipe(
            Option.filter(() => verdict.verdict === "accepted"),
            Option.getOrElse(() => assert.fail(`${location} is ${verdict.verdict}, not accepted`)),
          );

          assert.isTrue(accepted.item.templated, "the item has template processing");
          assert.deepStrictEqual(accepted.item.unsupported, []);
        }),
    );
  },
);
