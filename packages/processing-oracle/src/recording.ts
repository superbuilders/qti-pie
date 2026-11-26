/**
 * Plate's golden grading recording, read: the one independent truth the processing package is held
 * to. Plate's recorder (`scripts/golden.ts`, qti-pie 6200430 and before) ran plate's TypeScript
 * grader over every item of the bank's local copies, the 1EdTech corpus and the fixtures, under
 * each decision seed, through every generated case's attempts, and wrote what it gave: the session
 * each seed began with (template processing's values, the correct responses and defaults it set,
 * the outcomes and responses at the start), and for each attempt either its outcomes, completion
 * status, `numAttempts` and credit, or the responses validation refused and why.
 *
 * The recording lives outside the repository (it holds the bank's answer keys) under the digest
 * plate's pin names (`@qti-pie/plate/test/golden`), one JSON Lines file per set and the documents
 * under `documents/<set>/<package>/<path>`.
 *
 * @module
 */
import { createReadStream } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { Effect, Schema, Stream } from "effect";

/**
 * The sets the recording holds, each one JSON Lines file of that name.
 */
export const recordedSets = [
  "corpus",
  "pantry-fixtures",
  "plate-fixtures",
  "bank-chemistry",
  "bank-ram",
  "bank-shadows",
] as const;

/**
 * One set of the recording.
 */
export type RecordedSet = (typeof recordedSets)[number];

/**
 * The base types a recorded value carries: QTI 3.0.1's BaseTypeEnum.
 */
const BaseTypeSchema = Schema.Literals([
  "boolean",
  "directedPair",
  "duration",
  "file",
  "float",
  "identifier",
  "integer",
  "pair",
  "point",
  "string",
  "uri",
]);

/**
 * A value as the recording writes it: its base type, its cardinality and each single's lexical form
 * as plate's `format` wrote it, in place order for an ordered value. The recording holds no record
 * value: no recorded item declares one.
 */
export const RecordedValueSchema = Schema.Struct({
  baseType: BaseTypeSchema,
  cardinality: Schema.Literals(["single", "multiple", "ordered"]),
  values: Schema.Array(Schema.String),
});

/**
 * A recorded value.
 */
export type RecordedValue = typeof RecordedValueSchema.Type;

/**
 * Recorded values by their variable's identifier.
 */
export const RecordedValuesSchema = Schema.Record(Schema.String, RecordedValueSchema);

/**
 * Recorded values by their variable's identifier.
 */
export type RecordedValues = typeof RecordedValuesSchema.Type;

/**
 * Plate's credit kind of a scored attempt: what share of the maximum its score earned. Null where
 * the item declares no maximum to earn a share of.
 */
const CreditKindSchema = Schema.NullOr(Schema.Literals(["none", "partial", "full"]));

/**
 * A response's marks against an area interaction's correct areas: each point given, marked right or
 * wrong, and each correct area's point missed, each point in its lexical form.
 */
const AreaMarksSchema = Schema.Record(
  Schema.String,
  Schema.Struct({
    given: Schema.Array(Schema.Tuple([Schema.String, Schema.Literals(["right", "wrong"])])),
    missed: Schema.Array(Schema.String),
  }),
);

/**
 * An attempt response processing scored: the responses it ran with (`responses`, after the posted
 * values were read), every outcome after it, the completion status, the `numAttempts` it saw and
 * plate's two credits of it: `credit`, plate's item rule, and `ownerCredit`, the owner's rule
 * (proposal 2026-11-18, Decision 3), which the ledger writes and the package computes.
 */
const ScoredAttemptSchema = Schema.Struct({
  areaMarks: AreaMarksSchema,
  completionStatus: Schema.Literals(["completed", "incomplete", "not_attempted", "unknown"]),
  credit: CreditKindSchema,
  kind: Schema.Literal("scored"),
  numAttempts: Schema.Number,
  outcomes: RecordedValuesSchema,
  ownerCredit: CreditKindSchema,
  posted: RecordedValuesSchema,
  responses: RecordedValuesSchema,
});

/**
 * An attempt response validation refused: each refused response with plate's words for why. A
 * refused attempt is no attempt: it runs no processing and counts toward no `numAttempts`.
 */
const RefusedAttemptSchema = Schema.Struct({
  kind: Schema.Literal("failed"),
  posted: RecordedValuesSchema,
  refused: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  tag: Schema.Literal("ResponsesRefused"),
});

/**
 * One recorded attempt, scored or refused.
 */
export const RecordedAttemptSchema = Schema.Union([ScoredAttemptSchema, RefusedAttemptSchema]);

/**
 * One recorded attempt.
 */
export type RecordedAttempt = typeof RecordedAttemptSchema.Type;

/**
 * One generated case of an item under a seed: its name (what the recorder posted) and its attempts
 * in the order the session ran them.
 */
const RecordedCaseSchema = Schema.Struct({
  attempts: Schema.Array(RecordedAttemptSchema),
  name: Schema.String,
});

/**
 * One recorded case.
 */
export type RecordedCase = typeof RecordedCaseSchema.Type;

/**
 * The session an item began with under one decision seed, before any attempt.
 */
const BegunSchema = Schema.Struct({
  correct: RecordedValuesSchema,
  defaults: RecordedValuesSchema,
  outcomes: RecordedValuesSchema,
  responses: RecordedValuesSchema,
  templates: RecordedValuesSchema,
});

/**
 * The session an item began with.
 */
export type Begun = typeof BegunSchema.Type;

/**
 * An item's recording under one decision seed: the seed, the session it began with, the solution
 * the recorder posted for "correct", and every case.
 */
const RecordedSeedSchema = Schema.Struct({
  begun: BegunSchema,
  cases: Schema.Array(RecordedCaseSchema),
  decisionSeed: Schema.String,
  solution: RecordedValuesSchema,
});

/**
 * One item's recording under one decision seed.
 */
export type RecordedSeed = typeof RecordedSeedSchema.Type;

/**
 * An item the recording ran: plate accepted its document. `package` is the folder that holds it
 * (the recorder's package name, which keys its seeds), `path` its file there, `identifier` the
 * item's own.
 */
const RanItemSchema = Schema.Struct({
  adaptive: Schema.Boolean,
  digest: Schema.String,
  identifier: Schema.String,
  package: Schema.String,
  path: Schema.String,
  seeds: Schema.Array(RecordedSeedSchema),
  set: Schema.Literals(recordedSets),
  verdict: Schema.Literal("accepted"),
});

/**
 * An item the recording ran.
 */
export type RanItem = typeof RanItemSchema.Type;

/**
 * A document the recording did not run: plate's validation left it unchecked (not an item).
 */
const UncheckedItemSchema = Schema.Struct({
  digest: Schema.String,
  package: Schema.String,
  path: Schema.String,
  set: Schema.Literals(recordedSets),
  verdict: Schema.Literal("unchecked"),
});

/**
 * One line of a set's recording.
 */
const RecordedLineSchema = Schema.Union([RanItemSchema, UncheckedItemSchema]);

/**
 * One line of a set's recording.
 */
export type RecordedLine = typeof RecordedLineSchema.Type;

const decodeLine = Schema.decodeUnknownEffect(Schema.fromJsonString(RecordedLineSchema));

/**
 * A document's path in the recording, from its root.
 *
 * @param root The recording's directory.
 * @param item The item.
 * @returns The document's path.
 */
export const documentPath = (root: string, item: RanItem): string =>
  path.join(root, "documents", item.set, item.package, item.path);

/**
 * Read one set of the recording, line by line: the bank's sets run to hundreds of megabytes, so no
 * set is read whole.
 *
 * @param root The recording's directory.
 * @param set The set.
 * @returns Each line, decoded, in the recording's order.
 */
export const readSet = (root: string, set: RecordedSet): Stream.Stream<RecordedLine, Error> =>
  Stream.fromAsyncIterable(
    createInterface({
      crlfDelay: Number.POSITIVE_INFINITY,
      input: createReadStream(path.join(root, `${set}.jsonl`), { encoding: "utf-8" }),
    }),
    (cause) => new Error(`reading the recording's ${set}.jsonl`, { cause }),
  ).pipe(
    Stream.filter((line) => line.length > 0),
    Stream.mapEffect((line) =>
      decodeLine(line).pipe(
        Effect.mapError((cause) => new Error(`a line of the recording's ${set}.jsonl`, { cause })),
      ),
    ),
  );
