import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { begin } from "#plate/begin.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import type { Value } from "#plate/model/values.ts";
import { restore } from "#plate/restore.ts";
import { readCorpusFile } from "#plate/test/corpus.ts";
import { score } from "#plate/test/score.ts";
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
 * The instance token every record here begins under, as an author with a stable token would.
 */
const instance = "q1";

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

/**
 * Give one variable of a record, as the values it holds.
 *
 * @param values The record's outcomes or its responses, by identifier, which share one type.
 * @param identifier The variable.
 * @returns The values, none when the record lacks the variable or it is NULL.
 */
const valuesOf = (values: ItemRecord["outcomes"], identifier: string): readonly unknown[] =>
  values[identifier]?.values.map((single) => single.value) ?? [];

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
      "template_digging opens accepted, its template processing read and its response processing some",
      () =>
        Effect.gen(function* templateDigging() {
          const location = "QTI3_BPIG_Examples/items/template_digging.xml";
          const { verdict } = yield* openCorpusItem(location);
          const accepted = acceptedItem(verdict).pipe(
            Option.filter(() => verdict.verdict === "accepted"),
            Option.getOrElse(() => assert.fail(`${location} is ${verdict.verdict}, not accepted`)),
          );

          assert.isTrue(
            accepted.item.templateProcessing.kind === "runs",
            "the template processing is read",
          );
          assert.isTrue(Option.isSome(accepted.item.processing), "the response processing runs");
          assert.deepStrictEqual(accepted.item.unsupported, []);
        }),
    );

    it.effect(
      "template_digging scores over begin's record: its template-set correct response scores 1 and a wrong one 0",
      () =>
        Effect.gen(function* templateDiggingScores() {
          const location = "QTI3_BPIG_Examples/items/template_digging.xml";
          const { verdict } = yield* openCorpusItem(location);
          const accepted = Option.getOrElse(acceptedItem(verdict), () =>
            assert.fail(`${location} is ${verdict.verdict}, not accepted`),
          );
          const stored = yield* Effect.fromResult(begin(accepted, { instance, seed: "20251107" }));
          const { record } = yield* Effect.fromResult(restore(accepted, stored));
          const correct = Option.getOrElse(Option.fromUndefinedOr(record.correct["RESPONSE"]), () =>
            assert.fail("begin's record holds no correct response for RESPONSE"),
          );
          const [single] = correct.values;
          const wrong: Value = {
            baseType: "float",
            cardinality: "single",
            values: [
              { baseType: "float", value: single?.baseType === "float" ? single.value + 1 : 0 },
            ],
          };
          const right = yield* Effect.fromResult(score(accepted, { RESPONSE: correct }, stored));
          const missed = yield* Effect.fromResult(score(accepted, { RESPONSE: wrong }, stored));

          assert.strictEqual(correct.baseType, "float");
          assert.deepStrictEqual(valuesOf(right.outcomes, "SCORE"), [1]);
          assert.deepStrictEqual(valuesOf(missed.outcomes, "SCORE"), [0]);
        }),
    );
  },
);
