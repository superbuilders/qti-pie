/**
 * Where the oracle's truths sit, each pinned by the SHA-256 of its `SHA256SUMS` so a commit reads
 * exactly the recording it names: plate's golden recording (plate's own pin,
 * `@qti-pie/plate/test/golden`), and the oracle corpus frozen beside it, which holds the SQL
 * grader's truths recorded before the machine was culled (the served slice with its before, the
 * test-level sittings), and the Alpha truth (AlphaTest's scores of the K2 items). Both live under
 * `~/.cache/qti-pie/` because they hold content the repository does not (the bank's answer keys,
 * Alpha's items); only their digests are committed.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { goldenDirectory } from "@qti-pie/plate/test/golden";
import { Config, Effect, Schema } from "effect";
import { K2InputsSchema, K2ObservedSchema } from "#processing-oracle/k2.ts";
import type { BeforeLine, ServedCase } from "#processing-oracle/served.ts";
import { BeforeLineSchema, lineIdsOf, ServedCaseSchema } from "#processing-oracle/served.ts";
import { SqlTruthLineSchema } from "#processing-oracle/sqltruth.ts";

/**
 * The SHA-256 of the oracle corpus's `SHA256SUMS`, as `freeze-corpus.sh` printed it when it froze
 * the corpus (lane QP-PROC-DIFF, 2026-11-26), whose K2 items are those children are served (v2,
 * all-or-nothing: Bjorn kept them so on 2026-11-27).
 */
export const oracleCorpusDigest =
  "01594eaa98a98b424e1accab419b01a8da13a5167bcc00e3d2f987f1c2f67444";

/**
 * The oracle corpus's directory: `.cache/qti-pie/processing-oracle/<digest>` under `HOME`.
 */
export const oracleCorpusDirectory: Config.Config<string> = Config.NonEmptyString("HOME").pipe(
  Config.map((home) =>
    path.join(home, ".cache", "qti-pie", "processing-oracle", oracleCorpusDigest),
  ),
);

/**
 * Plate's recording's directory, by plate's own pin.
 */
export const plateRecordingDirectory: Config.Config<string> = goldenDirectory;

/**
 * A text file's lines, the empty ones left out.
 *
 * @param file The file.
 * @returns Its lines.
 */
const linesOf = (file: string): Effect.Effect<readonly string[], Error> =>
  Effect.tryPromise({
    catch: (cause) => new Error(`reading ${file}`, { cause }),
    try: () => readFile(file, "utf-8"),
  }).pipe(Effect.map((text) => text.split("\n").filter((line) => line.length > 0)));

/**
 * Each line of a JSON Lines file, decoded by a schema.
 *
 * @param file The file.
 * @param schema The schema of a line.
 * @returns The lines.
 */
const jsonLinesOf = <S extends Schema.Top & { readonly DecodingServices: never }>(
  file: string,
  schema: S,
): Effect.Effect<readonly S["Type"][], Error> =>
  Effect.flatMap(linesOf(file), (lines) =>
    Effect.all(
      lines.map((line) =>
        Schema.decodeUnknownEffect(Schema.fromJsonString(schema))(line).pipe(
          Effect.mapError((cause) => new Error(`a line of ${file}`, { cause })),
        ),
      ),
    ),
  );

/**
 * A JSON file decoded by a schema.
 *
 * @param file The file.
 * @param schema The schema.
 * @returns The value.
 */
const jsonOf = <S extends Schema.Top & { readonly DecodingServices: never }>(
  file: string,
  schema: S,
): Effect.Effect<S["Type"], Error> =>
  Effect.tryPromise({
    catch: (cause) => new Error(`reading ${file}`, { cause }),
    try: () => readFile(file, "utf-8"),
  }).pipe(
    Effect.flatMap((text) =>
      Schema.decodeUnknownEffect(Schema.fromJsonString(schema))(text).pipe(
        Effect.mapError((cause) => new Error(`decoding ${file}`, { cause })),
      ),
    ),
  );

/**
 * A file's bytes.
 *
 * @param file The file.
 * @returns Its bytes.
 */
export const bytesOf = (file: string): Effect.Effect<Uint8Array, Error> =>
  Effect.tryPromise({
    catch: (cause) => new Error(`reading ${file}`, { cause }),
    try: () => readFile(file),
  });

/**
 * The served slice: its cases in the case file's order, and the before's lines by line id.
 *
 * @param root The oracle corpus's directory.
 * @returns The cases and the before.
 */
export const servedSlice = (
  root: string,
): Effect.Effect<
  { readonly before: ReadonlyMap<string, BeforeLine>; readonly cases: readonly ServedCase[] },
  Error
> =>
  Effect.all({
    before: jsonLinesOf(path.join(root, "served", "before-main-97d0637e.jsonl"), BeforeLineSchema),
    cases: jsonLinesOf(path.join(root, "served", "cases.jsonl"), ServedCaseSchema),
  }).pipe(
    Effect.map(({ before, cases }) => ({
      before: new Map(before.map((line) => [line.case, line])),
      cases,
    })),
  );

/**
 * A served case's document, in the frozen corpus.
 *
 * @param root The oracle corpus's directory.
 * @param c The case.
 * @returns The document's path.
 */
export const servedDocumentPath = (root: string, c: ServedCase): string =>
  path.join(root, "served", "packages", c.package, c.path);

/**
 * The K2 items and AlphaTest's score of each case, by case id.
 *
 * @param root The oracle corpus's directory.
 * @returns The items and the scores.
 */
export const k2Corpus = (root: string) =>
  Effect.all({
    inputs: jsonOf(path.join(root, "k2", "cases.json"), K2InputsSchema),
    observed: jsonOf(path.join(root, "k2", "alphatest.json"), K2ObservedSchema),
  }).pipe(
    Effect.map(({ inputs, observed }) => ({
      items: inputs.items,
      scores: new Map(
        Object.entries(observed.cases).map(([id, held]) => [id, held.submit.value.score]),
      ),
    })),
  );

/**
 * The SQL grader's recorded sittings.
 *
 * @param root The oracle corpus's directory.
 * @returns Every recorded line.
 */
export const sqlTruths = (root: string) =>
  jsonLinesOf(path.join(root, "sql-truths", "ledger.jsonl"), SqlTruthLineSchema);

/**
 * A document of a recorded sitting's package, in the frozen corpus.
 *
 * @param root The oracle corpus's directory.
 * @param pkg The package's name.
 * @param file The document's path in it.
 * @returns The document's path.
 */
export const sqlTruthDocumentPath = (root: string, pkg: string, file: string): string =>
  path.join(root, "sql-truths", "packages", pkg, file);

/**
 * Every line id a served case has, for its count against the before.
 *
 * @param cases The cases.
 * @returns Every line id.
 */
export const servedLineIds = (cases: readonly ServedCase[]): readonly string[] =>
  cases.flatMap(lineIdsOf);
