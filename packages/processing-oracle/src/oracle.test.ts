/**
 * The differential gate of `@qti-pie/processing`: every truth the oracle holds, replayed through
 * the package's public entries, each difference held to `rulings.json`. A source's test fails on a
 * difference no ruling names (with both sides) and the suite fails on a ruling no difference
 * needs, so the rulings file states exactly what the package moves from each truth and why.
 *
 * The truths live in `~/.cache/qti-pie/` under their pinned digests: plate's recording (the
 * independent truth, every set), and the oracle corpus (the served slice against the SQL before,
 * AlphaTest's scores of the K2 items, the SQL grader's recorded sittings). Specimen's generated
 * items and the ported pending families are data of the repository.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema, Stream } from "effect";
import { engine } from "#processing-oracle/adapter.ts";
import {
  bytesOf,
  k2Corpus,
  oracleCorpusDirectory,
  plateRecordingDirectory,
  servedDocumentPath,
  servedSlice,
  sqlTruthDocumentPath,
  sqlTruths,
} from "#processing-oracle/corpus.ts";
import { documentPath, readSet, recordedSets } from "#processing-oracle/recording.ts";
import type { RecordedSet } from "#processing-oracle/recording.ts";
import {
  itemDiffers,
  k2Differs,
  servedDiffers,
  sittingDiffers,
  suiteDiffers,
} from "#processing-oracle/replay.ts";
import { generatedCases, specimenDiffers } from "#processing-oracle/specimen.ts";
import { sittingInputsOf } from "#processing-oracle/sqltruth.ts";
import { suiteCases } from "#processing-oracle/suite.ts";
import type { Difference, Ruling } from "#processing-oracle/verdict.ts";
import { RulingsSchema, verdictOf } from "#processing-oracle/verdict.ts";

/**
 * Every ruling.
 */
const rulings: readonly Ruling[] = Schema.decodeUnknownSync(Schema.fromJsonString(RulingsSchema))(
  readFileSync(path.join(import.meta.dirname, "..", "rulings.json"), "utf-8"),
);

/**
 * Hold a source's differences to its rulings, those whose key names the source's lines or class
 * of lines: no difference unruled, no ruling of the source unused.
 *
 * @param prefix The source's key prefix.
 * @param differences Its differences.
 */
const holdTo = (prefix: string, differences: readonly Difference[]): void => {
  const verdict = verdictOf(
    differences,
    rulings.filter((ruling) => ruling.key.startsWith(prefix)),
  );
  assert.deepStrictEqual(
    { stale: verdict.stale, unruled: verdict.unruled.slice(0, 50) },
    { stale: [], unruled: [] },
    `${String(verdict.unruled.length)} differences unruled`,
  );
};

/**
 * Every difference of one set of plate's recording.
 *
 * @param set The set.
 * @returns The differences.
 */
const plateDiffers = (set: RecordedSet) =>
  Effect.gen(function* plate() {
    const root = yield* plateRecordingDirectory;
    const out: Difference[] = [];
    yield* Stream.runForEach(readSet(root, set), (line) =>
      line.verdict === "accepted"
        ? Effect.map(bytesOf(documentPath(root, line)), (bytes) => {
            for (const difference of itemDiffers(engine, line, bytes)) {
              out.push(difference);
            }
          })
        : Effect.void,
    );

    return out;
  });

describe("the differential oracle", () => {
  for (const set of recordedSets) {
    it.effect(`plate's recording, ${set}`, () =>
      Effect.map(plateDiffers(set), (differences) => {
        holdTo(`${set}|`, differences);
      }),
    );
  }

  it.effect("the served slice against the SQL before", () =>
    Effect.gen(function* served() {
      const root = yield* oracleCorpusDirectory;
      const slice = yield* servedSlice(root);
      holdTo(
        "served|",
        servedDiffers(engine, slice.cases, slice.before, (c) =>
          readFileSync(servedDocumentPath(root, c)),
        ),
      );
    }),
  );

  it.effect("the K2 items against AlphaTest's own scores", () =>
    Effect.gen(function* k2() {
      const corpus = yield* k2Corpus(yield* oracleCorpusDirectory);
      holdTo(
        "k2|",
        corpus.items.flatMap((item) => k2Differs(engine, item, corpus.scores)),
      );
    }),
  );

  it.effect("the SQL grader's recorded sittings", () =>
    Effect.gen(function* sittings() {
      const root = yield* oracleCorpusDirectory;
      const lines = yield* sqlTruths(root);
      holdTo(
        "sql|",
        lines.flatMap((line) =>
          "steps" in line
            ? sittingDiffers(engine, line, sittingInputsOf(line), (file) =>
                readFileSync(sqlTruthDocumentPath(root, line.package, file)),
              )
            : [],
        ),
      );
    }),
  );

  it("specimen's generated items against their kinds' stated scores", () => {
    holdTo("specimen|", specimenDiffers(engine, generatedCases()));
  });

  it("the ported pending families against their tables", () => {
    holdTo("suite|", suiteDiffers(engine, suiteCases));
  });
});
