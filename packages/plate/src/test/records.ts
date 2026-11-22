/**
 * The one way a test builds the record it shows an item by: {@link recordOf}, a literal record of
 * the values the test states, as the QTI database returns a record. Plate runs no processing and
 * derives no initial value, so the helper fills nothing by QTI's rules: no 0 for a numeric single,
 * no declared default, only the test's own values and empty maps. {@link goldenRecords} reads the
 * golden grading data's records through it: what the database's take gives a templated item, which
 * the template sweeps (`#plate/test/sweep.ts`) and specimen's UI suite show such an item by.
 *
 * Test support, outside the core: nothing under `src/index.ts`'s closure imports it. Specimen's UI
 * suite reads it through `@qti-pie/plate/test/records`, as it reads `./test/admitted`.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert } from "@effect/vitest";
import type { Cause, Config } from "effect";
import { Effect, Result, Schema } from "effect";
import type { ItemRecord } from "#plate/model/record.ts";
import { isModelled, parseLexical } from "#plate/model/values.ts";
import type { Single, Value } from "#plate/model/values.ts";
import { goldenDirectory } from "#plate/test/golden.ts";

/**
 * The values a test states of a record: whether response processing has run in the attempt it
 * shows, and each map of values by variable.
 */
export type RecordValues = Partial<
  Pick<
    ItemRecord,
    "attempt" | "correct" | "defaults" | "outcomes" | "records" | "responses" | "templates"
  >
>;

/**
 * Build a record from the values a test states: `attempt` `none` and every map empty unless the
 * test gives it.
 *
 * @param values The values.
 * @returns The record.
 */
export const recordOf = (values: RecordValues = {}): ItemRecord => ({
  attempt: "none",
  correct: {},
  defaults: {},
  outcomes: {},
  records: {},
  responses: {},
  templates: {},
  ...values,
});

/**
 * A value as the golden grading data writes it: its base type, its cardinality and each single's
 * lexical form, as plate's `format` writes it.
 */
const GoldenValue = Schema.Struct({
  baseType: Schema.String,
  cardinality: Schema.String,
  values: Schema.Array(Schema.String),
});

/**
 * The values a golden recording's item session began with, each by its variable's identifier: what
 * template processing set (`templates`, `correct`, `defaults`) and every response and outcome at
 * its start. The database grader is held to the recording, so these are the values its take gives.
 */
const BegunValues = Schema.Struct({
  correct: Schema.Record(Schema.String, GoldenValue),
  defaults: Schema.Record(Schema.String, GoldenValue),
  outcomes: Schema.Record(Schema.String, GoldenValue),
  responses: Schema.Record(Schema.String, GoldenValue),
  templates: Schema.Record(Schema.String, GoldenValue),
});

/**
 * One line of the golden corpus recording: the item by the SHA-256 of its bytes (the recording ran
 * each document once, whatever paths hold it), and, for an item the recording ran, each seed's
 * begun values.
 */
const GoldenLine = Schema.Struct({
  digest: Schema.String,
  seeds: Schema.optionalKey(Schema.Array(Schema.Struct({ begun: BegunValues }))),
});

type GoldenBegun = typeof BegunValues.Type;

const decodeGoldenLine = Schema.decodeUnknownSync(Schema.fromJsonString(GoldenLine));

/**
 * Read a golden value back into plate's: each single from its lexical form. The recording wrote
 * every value plate holds, so one that does not read back is a defect of the recording.
 *
 * @param written The value as the recording writes it.
 * @returns The value.
 */
const goldenValueOf = (written: typeof GoldenValue.Type): Value => {
  const { baseType, cardinality } = written;
  if (
    !isModelled(baseType) ||
    (cardinality !== "single" && cardinality !== "multiple" && cardinality !== "ordered")
  ) {
    return assert.fail(`the golden recording holds a ${baseType} ${cardinality} value`);
  }

  return {
    baseType,
    cardinality,
    values: written.values.map((lexical): Single =>
      Result.getOrElse(parseLexical(baseType, lexical), () =>
        assert.fail(`the golden recording's ${baseType} ${JSON.stringify(lexical)} is no value`),
      ),
    ),
  };
};

/**
 * Read a golden map of values back into plate's ({@link goldenValueOf}).
 *
 * @param values The values by identifier, as the recording writes them.
 * @returns The values by identifier.
 */
const goldenValuesOf = (
  values: Readonly<Record<string, typeof GoldenValue.Type>>,
): Readonly<Record<string, Value>> =>
  Object.fromEntries(
    Object.entries(values).map(([identifier, value]) => [identifier, goldenValueOf(value)]),
  );

/**
 * Give the record a templated item is shown by before its first attempt, as the database's take
 * returns it: the golden recording's begun values, through the one record helper ({@link
 * recordOf}).
 *
 * @param begun The recording's begun values of one seed.
 * @returns The record.
 */
const goldenRecordOf = (begun: GoldenBegun): ItemRecord =>
  recordOf({
    correct: goldenValuesOf(begun.correct),
    defaults: goldenValuesOf(begun.defaults),
    outcomes: goldenValuesOf(begun.outcomes),
    responses: goldenValuesOf(begun.responses),
    templates: goldenValuesOf(begun.templates),
  });

/**
 * Give a document's key in the golden recording: the SHA-256 of its bytes, in hex.
 *
 * @param bytes The document's bytes.
 * @returns The digest.
 */
export const documentDigest = (bytes: Uint8Array): string =>
  createHash("sha256").update(bytes).digest("hex");

/**
 * The golden recording's record of every corpus item it ran, before its first attempt, as the
 * database's take returns it ({@link goldenRecordOf}), by the SHA-256 of the item's bytes in hex
 * ({@link documentDigest}), one per seed in the recording's order. It is read once per test file; a
 * missing recording fails as the `grading-golden` cache's probe words it
 * (`#plate/test/caches.ts`).
 */
export const goldenRecords: Effect.Effect<
  ReadonlyMap<string, readonly ItemRecord[]>,
  Config.ConfigError | Cause.UnknownError
> = Effect.runSync(
  Effect.cached(
    Effect.gen(function* goldenRecords() {
      const root = yield* goldenDirectory;
      const text = yield* Effect.tryPromise(() =>
        readFile(path.join(root, "corpus.jsonl"), "utf-8"),
      );

      return new Map(
        text
          .split("\n")
          .filter((line) => line.length > 0)
          .map((written) => decodeGoldenLine(written))
          .map((line): readonly [string, readonly ItemRecord[]] => [
            line.digest,
            (line.seeds ?? []).map((seed) => goldenRecordOf(seed.begun)),
          ]),
      );
    }),
  ),
);
