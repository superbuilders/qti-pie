/**
 * The SQL grader's recorded truths for test-level outcome processing, durations and numAttempts
 * (the oracle corpus's `sql-truths/`), recorded once before the machine was culled: for each of
 * the tests a plan names (the crafted test and the 1EdTech corpus's packaged tests with outcome
 * processing), three sittings (members unanswered, all answered correctly, every second one), each
 * line holding what the sitting posted and every row the grader wrote for its child, read straight
 * from the ledger's tables.
 *
 * @module
 */
import { Schema, SchemaTransformation } from "effect";
import type { RecordedValue, RecordedValues } from "#processing-oracle/recording.ts";

/**
 * A table row as the recorder read it: each column's value as node-postgres returns it (a bigint
 * or numeric as its decimal text, a double as a number).
 */
const RowSchema = Schema.Record(
  Schema.String,
  Schema.Union([Schema.String, Schema.Number, Schema.Boolean, Schema.Null]),
);

/**
 * One table row.
 */
export type Row = typeof RowSchema.Type;

/**
 * A posted single's value read to its lexical form at the boundary: a string as it is, a number by
 * ECMAScript's shortest decimal, a boolean as `true` or `false`, a two-part value its parts
 * space-separated.
 */
const PostedTextSchema = Schema.Union([
  Schema.String,
  Schema.Number.pipe(
    Schema.decodeTo(
      Schema.String,
      SchemaTransformation.transform({ decode: String, encode: Number }),
    ),
  ),
  Schema.Boolean.pipe(
    Schema.decodeTo(
      Schema.String,
      SchemaTransformation.transform({
        decode: (b): string => (b ? "true" : "false"),
        encode: (t) => t === "true",
      }),
    ),
  ),
  Schema.Tuple([Schema.String, Schema.String]).pipe(
    Schema.decodeTo(
      Schema.String,
      SchemaTransformation.transform({
        decode: ([a, b]) => `${a} ${b}`,
        encode: (t): readonly [string, string] => {
          const [a = "", b = ""] = t.split(" ");

          return [a, b];
        },
      }),
    ),
  ),
]);

/**
 * A member's presentation and save in a sitting: what it posted (each single in its lexical form)
 * and its save's outcome, absent where it saved nothing.
 */
const MemberStepSchema = Schema.Struct({
  member: Schema.String,
  posted: Schema.Record(
    Schema.String,
    Schema.Struct({
      baseType: Schema.String,
      cardinality: Schema.String,
      values: Schema.Array(Schema.Struct({ baseType: Schema.String, value: PostedTextSchema })),
    }),
  ),
  present: Schema.String,
  save: Schema.optionalKey(Schema.String),
});

/**
 * A member's step.
 */
export type MemberStep = typeof MemberStepSchema.Type;

/**
 * One sitting's step as the recorder wrote it: a write's outcome, or a member's.
 */
const StepSchema = Schema.Union([
  Schema.Struct({ take: Schema.String }),
  Schema.Struct({ enter: Schema.String }),
  Schema.Struct({ finish: Schema.String }),
  MemberStepSchema,
]);

/**
 * One recorded sitting.
 */
export const SqlTruthLineSchema = Schema.Union([
  Schema.Struct({
    case: Schema.String,
    child: Schema.String,
    error: Schema.NullOr(Schema.String),
    members: Schema.Array(Schema.Struct({ identifier: Schema.String, path: Schema.String })),
    mode: Schema.Literals(["none", "correct", "alternate", "first"]),
    package: Schema.String,
    rows: Schema.Record(Schema.String, Schema.Array(RowSchema)),
    steps: Schema.Array(StepSchema),
    test: Schema.String,
  }),
  Schema.Struct({ error: Schema.String, package: Schema.String }),
  Schema.Struct({
    package: Schema.Literal("qti-rptemplates"),
    publish: Schema.Literal("accepted"),
  }),
]);

/**
 * One recorded line: a sitting, a package that did not publish, or the published
 * response-processing templates every package's items may name, published first.
 */
export type SqlTruthLine = typeof SqlTruthLineSchema.Type;

/**
 * The base types by the ledger's table-name segment.
 */
const baseOfSegment: ReadonlyMap<string, RecordedValue["baseType"]> = new Map([
  ["boolean", "boolean"],
  ["directed_pair", "directedPair"],
  ["duration", "duration"],
  ["file", "file"],
  ["float", "float"],
  ["identifier", "identifier"],
  ["integer", "integer"],
  ["pair", "pair"],
  ["point", "point"],
  ["string", "string"],
  ["uri", "uri"],
]);

/**
 * A value table's cardinality and base type, from its name `<prefix>_<cardinality>_<base>`.
 *
 * @param table The table's name.
 * @param prefix The family's prefix (`test_outcome`, `snapshot`).
 * @returns Its cardinality and base type, or undefined for another table.
 */
export const valueTypeOfTable = (
  table: string,
  prefix: string,
):
  | {
      readonly baseType: RecordedValue["baseType"];
      readonly cardinality: RecordedValue["cardinality"];
    }
  | undefined => {
  const lead = `${prefix}_`;
  const rest = table.startsWith(lead) ? table.slice(lead.length) : "";
  const cut = rest.indexOf("_");
  const cardinality = cut === -1 ? "" : rest.slice(0, cut);
  const baseType = baseOfSegment.get(cut === -1 ? "" : rest.slice(cut + 1));

  return (cardinality === "single" || cardinality === "multiple" || cardinality === "ordered") &&
    baseType !== undefined
    ? { baseType, cardinality }
    : undefined;
};

/**
 * A column's text.
 *
 * @param row The row.
 * @param column The column.
 * @returns Its text, empty where it is NULL or absent.
 */
const text = (row: Row, column: string): string => {
  const value = row[column];

  return value === null || value === undefined ? "" : String(value);
};

/**
 * A row's single, in its lexical form, by its base type's columns.
 *
 * @param baseType The base type.
 * @param row The row.
 * @returns The single's lexical form.
 */
export const singleOfRow = (baseType: RecordedValue["baseType"], row: Row): string => {
  switch (baseType) {
    case "pair": {
      return `${text(row, "least")} ${text(row, "greatest")}`;
    }
    case "directedPair": {
      return `${text(row, "source")} ${text(row, "target")}`;
    }
    case "point": {
      return `${text(row, "x")} ${text(row, "y")}`;
    }
    case "file": {
      return text(row, "name");
    }
    case "boolean":
    case "duration":
    case "float":
    case "identifier":
    case "integer":
    case "string":
    case "uri": {
      return text(row, "value");
    }
  }
};

/**
 * The values a family of tables holds for the rows a filter keeps, by variable: a single's one row,
 * a multiple's rows each its `count` times, an ordered's rows in `place` order.
 *
 * @param rows The line's rows, by table.
 * @param prefix The family's prefix.
 * @param keep Which rows count (the latest run's, one attempt's).
 * @returns The values, by variable.
 */
export const valuesOfRows = (
  rows: Readonly<Record<string, readonly Row[]>>,
  prefix: string,
  keep: (row: Row) => boolean,
): RecordedValues => {
  const out: Record<
    string,
    {
      baseType: RecordedValue["baseType"];
      cardinality: RecordedValue["cardinality"];
      placed: [number, string][];
    }
  > = {};
  for (const [table, held] of Object.entries(rows)) {
    const declared = valueTypeOfTable(table, prefix);
    if (declared === undefined) {
      continue;
    }

    for (const row of held.filter(keep)) {
      const variable = text(row, "variable");
      out[variable] ??= { ...declared, placed: [] };
      const entry = out[variable];
      const single = singleOfRow(declared.baseType, row);
      const copies = declared.cardinality === "multiple" ? Number(text(row, "count") || "1") : 1;
      for (let k = 0; k < copies; k += 1) {
        entry.placed.push([
          declared.cardinality === "ordered" ? Number(text(row, "place")) : 0,
          single,
        ]);
      }
    }
  }

  return Object.fromEntries(
    Object.entries(out).map(([variable, { baseType, cardinality, placed }]) => [
      variable,
      {
        baseType,
        cardinality,
        values: placed.toSorted((a, b) => a[0] - b[0]).map(([, single]) => single),
      },
    ]),
  );
};

/**
 * The base types by their QTI names.
 */
const baseOfName: ReadonlyMap<string, RecordedValue["baseType"]> = new Map(
  [...baseOfSegment.values()].map((base) => [base, base] as const),
);

/**
 * A member step's posted responses as recorded values, or undefined where it saved none.
 *
 * @param step The step.
 * @returns The responses.
 */
export const postedOf = (step: MemberStep): RecordedValues | undefined => {
  if (step.save === undefined) {
    return undefined;
  }

  const out: Record<string, RecordedValue> = {};
  for (const [name, posted] of Object.entries(step.posted)) {
    const baseType = baseOfSegment.get(posted.baseType) ?? baseOfName.get(posted.baseType);
    const { cardinality } = posted;
    if (
      baseType !== undefined &&
      (cardinality === "single" || cardinality === "multiple" || cardinality === "ordered")
    ) {
      out[name] = { baseType, cardinality, values: posted.values.map((v) => v.value) };
    }
  }

  return out;
};

/**
 * The instant of the latest test outcome run of a sitting's rows, or undefined where none ran.
 *
 * @param rows The line's rows.
 * @returns The latest run's instant, as its decimal text.
 */
export const latestRunOf = (rows: Readonly<Record<string, readonly Row[]>>): string | undefined =>
  (rows["test_outcome_run"] ?? [])
    .map((row) => text(row, "at"))
    .toSorted((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1))
    .at(-1);

/**
 * A member's latest attempt's instant and number, by its item's path, or undefined where it has
 * none.
 *
 * @param rows The line's rows.
 * @param path The member item's path.
 * @returns The attempt's `n` and `at`, as decimal text.
 */
export const latestAttemptOf = (
  rows: Readonly<Record<string, readonly Row[]>>,
  path: string,
): { readonly at: string; readonly n: string } | undefined =>
  (rows["attempt"] ?? [])
    .filter((row) => text(row, "path") === path)
    .map((row) => ({ at: text(row, "at"), n: text(row, "n") }))
    .toSorted((a, b) => (BigInt(a.at) < BigInt(b.at) ? -1 : 1))
    .at(-1);

/**
 * A member's built-in duration as the grader computed it, in seconds, by its item's path.
 *
 * @param rows The line's rows.
 * @param path The member item's path.
 * @returns The seconds, 0 where none is held.
 */
export const durationOf = (
  rows: Readonly<Record<string, readonly Row[]>>,
  path: string,
): number => {
  const row = (rows["item_duration"] ?? []).find((held) => text(held, "path") === path);

  return row === undefined ? 0 : Number(text(row, "micros")) / 1_000_000;
};

/**
 * A member's latest attempt's completion status, from its processed attempt.
 *
 * @param rows The line's rows.
 * @param attempt The attempt.
 * @param attempt.at Its instant.
 * @param attempt.n Its session's number.
 * @param path The member item's path.
 * @returns The status, or undefined where it was not processed.
 */
export const completionOf = (
  rows: Readonly<Record<string, readonly Row[]>>,
  attempt: { readonly at: string; readonly n: string },
  path: string,
): string | undefined => {
  const row = (rows["processed_attempt"] ?? []).find(
    (held) =>
      text(held, "path") === path &&
      text(held, "at") === attempt.at &&
      text(held, "n") === attempt.n,
  );

  return row === undefined ? undefined : text(row, "completion_status");
};

/**
 * The inputs a recorded sitting's replay needs beside the line: each member's built-in duration
 * and the test's, in seconds, as the SQL grader computed them from presence (read back from the
 * outcomes the crafted tests set from them; 0 where no outcome reads one).
 */
export interface SittingInputs {
  readonly durations: ReadonlyMap<string, number>;
  readonly testDuration: number;
}

/**
 * The durations a recorded sitting's replay is handed, as the SQL grader computed them from the
 * sitting's presence (its clock, not the oracle's): read back from the outcomes the crafted tests
 * set from them, `ADUR` from member `a`'s `duration` and `TDUR` from the test's; 0 where the
 * sitting's test sets neither, since then no processing reads one.
 *
 * @param line The recorded sitting.
 * @returns Member `a`'s duration, by its ref, and the test's.
 */
export const sittingInputsOf = (
  line: Extract<SqlTruthLine, { readonly steps: unknown }>,
): SittingInputs => {
  const run = latestRunOf(line.rows);
  const held =
    run === undefined
      ? {}
      : valuesOfRows(line.rows, "test_outcome", (row) => text(row, "at") === run);
  const seconds = (variable: string): number => Number(held[variable]?.values[0] ?? "0");

  return { durations: new Map([["a", seconds("ADUR")]]), testDuration: seconds("TDUR") };
};
