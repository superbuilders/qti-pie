/**
 * The one boundary between plate's values and the ledger's typed sidecars,
 * `@qti-pie/ledger/served-values.ts`: plate's `Value` and `RecordValue` written as the rows of each
 * variable's declared cardinality and base type, and read back from them. A posted response is
 * decoded once, by plate's `decode`, into the value this module writes: nothing here reads or
 * writes a lexical form, and no value is text in the ledger. Nothing here computes a value either:
 * the database's statements grade an answer and write its outcomes, and this module reads back what
 * they wrote. Every application that serves items over the ledger (edullm's QTI app, metis) writes
 * and reads its values through this module alone.
 *
 * - A single is one row, a multiple its distinct values each with its `count`, an ordered its values
 *   at their `place` from 0, and a record its fields each with its `field`, in the arm of the
 *   field's base type. NULL is no row.
 * - Each base type's value is its columns: `identifier`, `string` and `uri` one text, `boolean` a
 *   boolean, `integer` an exact integral numeric, `float` and `duration` a double, `point` its `x`
 *   and `y`, `pair` its identifiers in code-point order (`least`, `greatest`), `directedPair` its
 *   `source` and `target`, and `file` its bytes' SHA-256, its name and its MIME type, which no
 *   value plate holds carries: a file here is a defect ({@link UnpostedFile}).
 * - A multiple's distinct values are distinct as the ledger's key compares them: a pair in either
 *   order is one value, and a float or a duration by its identity image, grizzle's `floatBits`,
 *   which the ledger's key holds beside the value: `-0` and `0` two values, every NaN one.
 *
 * The rows read back are typed structurally ({@link ValueRows}, {@link AttemptRows},
 * {@link StartRows}): each
 * application's own read attaches a snapshot's values in this form, and its rows are its own
 * database's, so they are converted here and never parsed.
 *
 * @module
 */
import { floatBits } from "@bjornpagen/grizzle";
import type { Sha256 } from "@bjornpagen/grizzle";
import type { ItemRecord, RecordValue, Responses, ResponseValue, Value } from "@qti-pie/plate";
import type { AnswerMark, Credit, PartMark } from "@qti-pie/plate/ui";
import { Effect, Option, Order, Schema } from "effect";
import { QtiInteger } from "#ledger/scalars.ts";

/**
 * One value of a QTI value, plate's: its base type and what it holds.
 */
type Single = Value["values"][number];

/**
 * A QTI base type, as plate names it.
 */
type BaseType = Single["baseType"];

/**
 * An integer as the ledger's exact numeric holds it, branded by its contract.
 */
type LedgerInteger = ReturnType<typeof QtiInteger>;

/**
 * Each base type's value as its columns, as a single's row holds them beside its variable: what a
 * snapshot's write takes and its reads give, each of the ledger column's type.
 */
interface Columns {
  readonly boolean: { readonly value: boolean };
  readonly directedPair: { readonly source: string; readonly target: string };
  readonly duration: { readonly value: number };
  readonly file: { readonly digest: Sha256; readonly name: string; readonly type: string };
  readonly float: { readonly value: number };
  readonly identifier: { readonly value: string };
  readonly integer: { readonly value: LedgerInteger };
  readonly pair: { readonly greatest: string; readonly least: string };
  readonly point: { readonly x: LedgerInteger; readonly y: LedgerInteger };
  readonly string: { readonly value: string };
  readonly uri: { readonly value: string };
}

/**
 * Where a row stands in its variable's value, by the variable's QTI cardinality: a single's
 * nowhere, a multiple's value as often as it occurs, an ordered's at its place and a record's at
 * its field.
 */
interface Placed<K> {
  readonly multiple: K & { readonly count: bigint };
  readonly ordered: K & { readonly place: bigint };
  readonly record: K & { readonly field: string };
  readonly single: K;
}

/**
 * A QTI cardinality, which decides where a variable's rows stand.
 */
type Cardinality = keyof Placed<unknown>;

/**
 * The rows of each base type and cardinality a write builds, each its key `K`, where it stands and
 * its columns.
 */
type Lists<K> = {
  readonly [B in BaseType]: { readonly [C in Cardinality]: (Placed<K>[C] & Columns[B])[] };
};

/**
 * One base type's lists before a write adds a row: every cardinality's empty, so it takes a row of
 * any key and columns.
 */
interface NoRows {
  readonly multiple: never[];
  readonly ordered: never[];
  readonly record: never[];
  readonly single: never[];
}

/**
 * Construct the lists of one base type a write fills.
 *
 * @returns Its list of every cardinality, each empty.
 */
const noRows = (): NoRows => ({ multiple: [], ordered: [], record: [], single: [] });

/**
 * Construct the empty lists a write fills.
 *
 * @returns Every base type's list of every cardinality, each empty.
 */
const emptyLists = <K>(): Lists<K> => ({
  boolean: noRows(),
  directedPair: noRows(),
  duration: noRows(),
  file: noRows(),
  float: noRows(),
  identifier: noRows(),
  integer: noRows(),
  pair: noRows(),
  point: noRows(),
  string: noRows(),
  uri: noRows(),
});

/**
 * A file value at the ledger's boundary, named by its variable. QTI's file is its bytes, its MIME
 * type and its name, and the ledger keys one by its bytes' SHA-256, but plate posts no file: no
 * form it renders posts one, a file binding decodes to NULL, an Upload or a Drawing interaction and
 * a PCI bound to a file render their notices. So no answer or take holds a file and no application
 * writes one, and one here is a defect. Once plate posts files, the server computes a file's digest
 * where its bytes arrive, and that change gives a file its row.
 */
class UnpostedFile extends Schema.TaggedError<UnpostedFile>()("UnpostedFile", {
  variable: Schema.String,
}) {}

/**
 * One single as the ledger's columns: the text that tells two values of a multiple apart exactly
 * where the ledger's key does, and the row it adds to its base type's list of a cardinality.
 */
interface Cell {
  readonly add: <K, C extends Cardinality>(
    lists: Lists<K>,
    cardinality: C,
    row: Placed<K>[C],
  ) => void;
  readonly key: string;
}

/**
 * Give a float's or a duration's multiple's rows their identity image, `bits`, grizzle's
 * `floatBits`, the key field the ledger keys each value by and its law BagImage holds to the
 * value.
 *
 * @param rows The rows, each with its value.
 * @returns The rows, each with its value's image beside it.
 */
const imaged = <R extends { readonly value: number }>(rows: readonly R[]) =>
  rows.map((row) => ({ ...row, bits: floatBits(row.value) }));

/**
 * Convert one of a variable's singles to its cell.
 *
 * @param variable The variable the single is a value of, which names a file's defect.
 * @param single The single.
 * @returns Its cell; a file dies as {@link UnpostedFile}.
 */
const cellOf = (variable: string, single: Single): Effect.Effect<Cell> => {
  switch (single.baseType) {
    case "identifier": {
      const columns = { value: single.value };

      return Effect.succeed({
        add: (lists, cardinality, row) => {
          lists.identifier[cardinality].push({ ...row, ...columns });
        },
        key: single.value,
      });
    }
    case "boolean": {
      const columns = { value: single.value };

      return Effect.succeed({
        add: (lists, cardinality, row) => {
          lists.boolean[cardinality].push({ ...row, ...columns });
        },
        key: String(single.value),
      });
    }
    case "integer": {
      const columns = { value: QtiInteger(single.value) };

      return Effect.succeed({
        add: (lists, cardinality, row) => {
          lists.integer[cardinality].push({ ...row, ...columns });
        },
        key: String(single.value),
      });
    }
    case "float": {
      const columns = { value: single.value };

      return Effect.succeed({
        add: (lists, cardinality, row) => {
          lists.float[cardinality].push({ ...row, ...columns });
        },
        key: String(floatBits(single.value)),
      });
    }
    case "string": {
      const columns = { value: single.value };

      return Effect.succeed({
        add: (lists, cardinality, row) => {
          lists.string[cardinality].push({ ...row, ...columns });
        },
        key: single.value,
      });
    }
    case "point": {
      const [x, y] = single.value;
      const columns = { x: QtiInteger(x), y: QtiInteger(y) };

      return Effect.succeed({
        add: (lists, cardinality, row) => {
          lists.point[cardinality].push({ ...row, ...columns });
        },
        key: `${String(x)} ${String(y)}`,
      });
    }
    case "pair": {
      const [first, second] = single.value;
      const columns =
        first <= second ? { greatest: second, least: first } : { greatest: first, least: second };

      return Effect.succeed({
        add: (lists, cardinality, row) => {
          lists.pair[cardinality].push({ ...row, ...columns });
        },
        key: `${columns.least} ${columns.greatest}`,
      });
    }
    case "directedPair": {
      const [source, target] = single.value;
      const columns = { source, target };

      return Effect.succeed({
        add: (lists, cardinality, row) => {
          lists.directedPair[cardinality].push({ ...row, ...columns });
        },
        key: `${source} ${target}`,
      });
    }
    case "duration": {
      const columns = { value: single.value };

      return Effect.succeed({
        add: (lists, cardinality, row) => {
          lists.duration[cardinality].push({ ...row, ...columns });
        },
        key: String(floatBits(single.value)),
      });
    }
    case "uri": {
      const columns = { value: single.value };

      return Effect.succeed({
        add: (lists, cardinality, row) => {
          lists.uri[cardinality].push({ ...row, ...columns });
        },
        key: single.value,
      });
    }
    case "file": {
      return Effect.die(UnpostedFile.make({ variable }));
    }
    default: {
      return single satisfies never;
    }
  }
};

/**
 * Add a multiple's cells as one row for each distinct value, with how often it occurs.
 *
 * @param lists The lists the rows are added to.
 * @param key The key each row carries.
 * @param cells The multiple's cells, one for each value it holds.
 */
const addMultiple = <K>(lists: Lists<K>, key: K, cells: readonly Cell[]): void => {
  const counted = new Map<string, { readonly cell: Cell; count: bigint }>();

  for (const cell of cells) {
    const seen = counted.get(cell.key);

    if (seen === undefined) {
      counted.set(cell.key, { cell, count: 1n });
    } else {
      seen.count += 1n;
    }
  }

  for (const { cell, count } of counted.values()) {
    cell.add(lists, "multiple", { ...key, count });
  }
};

/**
 * Add one variable's value as the rows of its cardinality, each with its key `K`; NULL adds none.
 *
 * @param lists The lists the rows are added to.
 * @param key The key each row carries, its variable among it.
 * @param value The value.
 * @returns Completion once every row is added; a file dies as {@link UnpostedFile}.
 */
const addValue = Effect.fnUntraced(function* addValue<K extends { readonly variable: string }>(
  lists: Lists<K>,
  key: K,
  value: ResponseValue,
) {
  if (value.cardinality === "record") {
    for (const field of value.fields) {
      const cell = yield* cellOf(key.variable, field.value);

      cell.add(lists, "record", { ...key, field: field.identifier });
    }

    return;
  }

  const cells = yield* Effect.all(value.values.map((single) => cellOf(key.variable, single)));
  const added = {
    multiple: () => {
      addMultiple(lists, key, cells);
    },
    ordered: () => {
      for (const [place, cell] of cells.entries()) {
        cell.add(lists, "ordered", { ...key, place: BigInt(place) });
      }
    },
    single: () => {
      for (const cell of cells) {
        cell.add(lists, "single", key);
      }
    },
  } satisfies { readonly [C in Exclude<Cardinality, "record">]: () => void };

  added[value.cardinality]();
});

/**
 * Convert the responses an answer posts to the parameters its write records: each response the post
 * decoded, a record response's record among them, as the rows of its cardinality and its base
 * type's columns. A record's fields go in their arms; the statement writes each field's header
 * beside its arm. Nothing here holds an outcome: the statement runs the item's response processing
 * over these rows and writes the outcomes and the completion status itself, in the same
 * transaction.
 *
 * @param responses The responses, plate's decoding of the posted entries.
 * @returns One list per sidecar, its cardinality then its base type; a file dies as
 *   {@link UnpostedFile}.
 */
export const responseParamsOf = Effect.fnUntraced(function* responseParamsOf(responses: Responses) {
  const lists = emptyLists<{ readonly variable: string }>();

  for (const [variable, value] of Object.entries(responses)) {
    yield* addValue(lists, { variable }, value);
  }

  return {
    multipleBoolean: lists.boolean.multiple,
    multipleDirectedPair: lists.directedPair.multiple,
    multipleDuration: imaged(lists.duration.multiple),
    multipleFile: lists.file.multiple,
    multipleFloat: imaged(lists.float.multiple),
    multipleIdentifier: lists.identifier.multiple,
    multipleInteger: lists.integer.multiple,
    multiplePair: lists.pair.multiple,
    multiplePoint: lists.point.multiple,
    multipleString: lists.string.multiple,
    multipleUri: lists.uri.multiple,
    orderedBoolean: lists.boolean.ordered,
    orderedDirectedPair: lists.directedPair.ordered,
    orderedDuration: lists.duration.ordered,
    orderedFile: lists.file.ordered,
    orderedFloat: lists.float.ordered,
    orderedIdentifier: lists.identifier.ordered,
    orderedInteger: lists.integer.ordered,
    orderedPair: lists.pair.ordered,
    orderedPoint: lists.point.ordered,
    orderedString: lists.string.ordered,
    orderedUri: lists.uri.ordered,
    recordBoolean: lists.boolean.record,
    recordDirectedPair: lists.directedPair.record,
    recordDuration: lists.duration.record,
    recordFile: lists.file.record,
    recordFloat: lists.float.record,
    recordIdentifier: lists.identifier.record,
    recordInteger: lists.integer.record,
    recordPair: lists.pair.record,
    recordPoint: lists.point.record,
    recordString: lists.string.record,
    recordUri: lists.uri.record,
    singleBoolean: lists.boolean.single,
    singleDirectedPair: lists.directedPair.single,
    singleDuration: lists.duration.single,
    singleFile: lists.file.single,
    singleFloat: lists.float.single,
    singleIdentifier: lists.identifier.single,
    singleInteger: lists.integer.single,
    singlePair: lists.pair.single,
    singlePoint: lists.point.single,
    singleString: lists.string.single,
    singleUri: lists.uri.single,
  };
});

/**
 * What an item session's template processing set, by the rule that sets it: its template values,
 * the correct responses and the defaults its record holds.
 */
const settings = [
  ["template", "templates"],
  ["correct", "correct"],
  ["default", "defaults"],
] as const;

/**
 * A cardinality's rows as a snapshot's read carries them: each base type's list, each row its
 * variable and its columns beside where it stands (`E`).
 */
type Group<E> = {
  readonly [B in BaseType]: readonly ({ readonly variable: string } & E & Columns[B])[];
};

/**
 * A response snapshot's value rows, an attempt's or a save's, as an application's read attaches
 * them: its singles, multiples, ordereds and record fields, each cardinality one row of the
 * snapshot itself carrying its eleven arrays, by base type. A row comes as an array of one, since
 * grizzle's evidence proves no `"one"` child of a row's own key.
 */
export interface ValueRows {
  readonly multiple: readonly Group<{ readonly count: bigint }>[];
  readonly ordered: readonly Group<{ readonly place: bigint }>[];
  readonly record: readonly Group<{ readonly field: string }>[];
  readonly single: readonly Group<unknown>[];
}

/**
 * One `AttemptMark` row of a value of one base type's columns (`C`): the response it marks, the
 * place of the value in it (an ordered response's from 0, else 0), its mark and how many copies of
 * the value it covers.
 */
type MarkRow<C> = C & {
  readonly copies: bigint;
  readonly mark: AnswerMark;
  readonly place: bigint;
  readonly variable: string;
};

/**
 * An attempt's marks as an application's read attaches them, the database's `AttemptMark`
 * relations, one for each value's columns: one row of the attempt carrying their eight arrays, as
 * its value rows carry theirs. A text's and a float's mark state their value's base type, which the
 * read types as a text: the machine marks a text value only of a text type and a float value only
 * of a float type, so another is a defect ({@link MarkTypeMismatch}).
 */
export interface MarkRows {
  readonly boolean: readonly MarkRow<Columns["boolean"]>[];
  readonly directedPair: readonly MarkRow<Columns["directedPair"]>[];
  readonly file: readonly MarkRow<{ readonly contentType: string; readonly digest: Sha256 }>[];
  readonly float: readonly MarkRow<{ readonly baseType: string; readonly value: number }>[];
  readonly integer: readonly MarkRow<Columns["integer"]>[];
  readonly pair: readonly MarkRow<Columns["pair"]>[];
  readonly point: readonly MarkRow<Columns["point"]>[];
  readonly text: readonly MarkRow<{ readonly baseType: string; readonly value: string }>[];
}

/**
 * An attempt as an application's read carries it, after the database's statement graded it: its
 * value rows, every response it was answered with and every outcome its response processing set,
 * the completion status that processing left, its credit, the database's `AttemptCredit`, none
 * while its score is pending or where its scores say none, and its marks ({@link MarkRows}).
 */
export interface AttemptRows extends ValueRows {
  readonly completionStatus: string;
  readonly credit: readonly { readonly kind: Credit }[];
  readonly marks: readonly MarkRows[];
}

/**
 * What the database judged of an attempt, as a review is handed it: its credit, none while its
 * score is pending or where its scores say none, and every mark of its responses' parts, by
 * response, missed ones among them, which plate's review draws as what it reveals says.
 */
export interface Judged {
  readonly credit: Option.Option<Credit>;
  readonly marks: Readonly<Record<string, readonly PartMark[]>>;
}

/**
 * A row of a cardinality's values, read: where it stands and the single it holds.
 */
interface ReadRow<E> {
  readonly row: { readonly variable: string } & E;
  readonly single: Single;
}

/**
 * Read a cardinality's rows of every base type into one list. A file's row is a defect ({@link
 * UnpostedFile}).
 *
 * @param group The cardinality's rows, by base type.
 * @returns Every row, each with the single it holds.
 */
const readGroup = <E>(group: Group<E>): Effect.Effect<readonly ReadRow<E>[]> => {
  const read: ReadRow<E>[] = [
    ...group.identifier.map((row): ReadRow<E> => ({
      row,
      single: { baseType: "identifier", value: row.value },
    })),
    ...group.boolean.map((row): ReadRow<E> => ({
      row,
      single: { baseType: "boolean", value: row.value },
    })),
    ...group.integer.map((row): ReadRow<E> => ({
      row,
      single: { baseType: "integer", value: row.value },
    })),
    ...group.float.map((row): ReadRow<E> => ({
      row,
      single: { baseType: "float", value: row.value },
    })),
    ...group.string.map((row): ReadRow<E> => ({
      row,
      single: { baseType: "string", value: row.value },
    })),
    ...group.point.map((row): ReadRow<E> => ({
      row,
      single: { baseType: "point", value: [row.x, row.y] },
    })),
    ...group.pair.map((row): ReadRow<E> => ({
      row,
      single: { baseType: "pair", value: [row.least, row.greatest] },
    })),
    ...group.directedPair.map((row): ReadRow<E> => ({
      row,
      single: { baseType: "directedPair", value: [row.source, row.target] },
    })),
    ...group.duration.map((row): ReadRow<E> => ({
      row,
      single: { baseType: "duration", value: row.value },
    })),
    ...group.uri.map((row): ReadRow<E> => ({ row, single: { baseType: "uri", value: row.value } })),
  ];
  const [file] = group.file;

  return file === undefined
    ? Effect.succeed(read)
    : Effect.die(UnpostedFile.make({ variable: file.variable }));
};

/**
 * Take a snapshot's one row of a cardinality's values: the read attaches the snapshot's own, so one
 * missing is a defect.
 *
 * @param rows The rows the read attached, one.
 * @returns The row; none dies.
 */
const groupOf = <G>(rows: readonly G[]): Effect.Effect<G> =>
  Effect.orDie(Effect.fromOption(Option.fromUndefinedOr(rows[0])));

/**
 * The order of an ordered's rows: by their place.
 */
const byPlace = Order.mapInput(
  Order.BigInt,
  (read: { readonly row: { readonly place: bigint } }) => read.row.place,
);

/**
 * Give the singles of one variable's rows.
 *
 * @param rows A cardinality's rows, read.
 * @param variable The variable.
 * @returns Its rows, in the order they were read.
 */
const rowsOfVariable = <E>(rows: readonly ReadRow<E>[], variable: string) =>
  rows.filter(({ row }) => row.variable === variable);

/**
 * Read the values a snapshot's rows hold, by variable: every single, multiple, ordered and record
 * value it holds.
 *
 * @param snapshot The snapshot's value rows.
 * @returns For each cardinality, a variable's values of it: a single's, a multiple's occurrences,
 *   an ordered's in its order and a record's fields.
 */
const valuesOf = Effect.fnUntraced(function* valuesOf(snapshot: ValueRows) {
  const single = yield* Effect.flatMap(groupOf(snapshot.single), readGroup);
  const multiple = yield* Effect.flatMap(groupOf(snapshot.multiple), readGroup);
  const ordered = yield* Effect.flatMap(groupOf(snapshot.ordered), readGroup);
  const record = yield* Effect.flatMap(groupOf(snapshot.record), readGroup);

  return {
    multiple: (variable: string): readonly Single[] =>
      rowsOfVariable(multiple, variable).flatMap((read) =>
        Array.from({ length: Number(read.row.count) }, () => read.single),
      ),
    ordered: (variable: string): readonly Single[] =>
      rowsOfVariable(ordered, variable)
        .toSorted(byPlace)
        .map((read) => read.single),
    record: (variable: string) =>
      rowsOfVariable(record, variable).map((read) => ({
        identifier: read.row.field,
        value: read.single,
      })),
    single: (variable: string): readonly Single[] =>
      rowsOfVariable(single, variable).map((read) => read.single),
  };
});

/**
 * A snapshot's values, read, by cardinality and variable.
 */
type Read = Effect.Success<ReturnType<typeof valuesOf>>;

/**
 * Read a declared variable's value from a snapshot's rows of its cardinality.
 *
 * @param read The snapshot's values.
 * @param identifier The variable's identifier.
 * @param declared Its declaration's base type and cardinality.
 * @returns Its value, none where it has no row, NULL.
 */
const declaredValueOf = (
  read: Read,
  identifier: string,
  { baseType, cardinality }: Pick<Value, "baseType" | "cardinality">,
): Option.Option<Value> => {
  const values = read[cardinality](identifier);

  return values.length === 0 ? Option.none() : Option.some({ baseType, cardinality, values });
};

/**
 * Read a record response's value from a snapshot's record rows.
 *
 * @param read The snapshot's values.
 * @param identifier The response's identifier.
 * @returns Its record, none where it has no field, NULL.
 */
const recordValueOf = (read: Read, identifier: string): Option.Option<RecordValue> => {
  const fields = read.record(identifier);

  return fields.length === 0 ? Option.none() : Option.some({ cardinality: "record", fields });
};

/**
 * The declarations a snapshot's values are read by: the item's responses, record responses and
 * outcomes, as plate's accepted item model declares them.
 */
interface Declarations {
  readonly outcomes: ReadonlyMap<string, Pick<Value, "baseType" | "cardinality">>;
  readonly records: ReadonlyMap<string, unknown>;
  readonly responses: ReadonlyMap<string, Pick<Value, "baseType" | "cardinality">>;
}

/**
 * Give the NULL of a declared variable.
 *
 * @param declared Its declaration's base type and cardinality.
 * @returns No value, of that base type and cardinality.
 */
const nullOf = ({ baseType, cardinality }: Pick<Value, "baseType" | "cardinality">): Value => ({
  baseType,
  cardinality,
  values: [],
});

/**
 * The NULL record: a record of no field.
 */
const nullRecord: RecordValue = { cardinality: "record", fields: [] };

/**
 * Read every declared variable's value, a NULL one as its NULL.
 *
 * @param declarations The variables, by identifier, each with its declaration.
 * @param valueOf Read one variable's value from its identifier and declaration, none for NULL.
 * @param nullOfDeclared Give a variable's NULL from its declaration.
 * @returns Each variable's value, by identifier.
 */
const everyDeclared = <D, A>(
  declarations: ReadonlyMap<string, D>,
  valueOf: (identifier: string, declared: D) => Option.Option<A>,
  nullOfDeclared: (declared: D) => A,
): Readonly<Record<string, A>> =>
  Object.fromEntries(
    [...declarations].map(([identifier, declared]) => [
      identifier,
      Option.getOrElse(valueOf(identifier, declared), () => nullOfDeclared(declared)),
    ]),
  );

/**
 * Read the record an item session's page shows after an attempt, and its review shows of that
 * attempt: the record the session began with, its template values, correct responses and defaults,
 * with every response, record response and outcome the database holds for the attempt, read from
 * its rows, a declared variable it holds no row of NULL, and the built-in `completionStatus` at the
 * attempt's, which every admitted item holds. The values are the database's, written by the
 * statement that graded the attempt; nothing here computes one.
 *
 * @param begun The record the item session began with.
 * @param declared The item's declarations, plate's accepted item model.
 * @param attempt The attempt's rows.
 * @returns The record after the attempt; a file's row dies as {@link UnpostedFile}.
 */
export const recordOfRows = Effect.fnUntraced(function* recordOfRows(
  begun: ItemRecord,
  declared: Declarations,
  attempt: AttemptRows,
) {
  const read = yield* valuesOf(attempt);

  return {
    ...begun,
    attempt: "submitted",
    outcomes: {
      ...everyDeclared(
        declared.outcomes,
        (identifier, declaration) => declaredValueOf(read, identifier, declaration),
        nullOf,
      ),
      completionStatus: {
        baseType: "identifier",
        cardinality: "single",
        values: [{ baseType: "identifier", value: attempt.completionStatus }],
      },
    },
    records: everyDeclared(
      declared.records,
      (identifier) => recordValueOf(read, identifier),
      () => nullRecord,
    ),
    responses: everyDeclared(
      declared.responses,
      (identifier, declaration) => declaredValueOf(read, identifier, declaration),
      nullOf,
    ),
  } satisfies ItemRecord;
});

/**
 * The rule of an item session's template processing that set a value, as the ledger's
 * `ItemSessionValue` names it: a template variable's value, a correct response or a default.
 */
type SetKind = (typeof settings)[number][0];

/**
 * What an item session's template processing set, as its start's read carries it
 * (`#ledger/session-start.ts`): each variable it set, by the rule that set it, a NULL one's among
 * them, and the value rows of each shape, each row by the rule that set it, one row of the session
 * carrying the eleven arrays, by base type. Template processing sets no record.
 */
export interface SetRows {
  readonly multiple: readonly Group<{ readonly count: bigint; readonly kind: SetKind }>[];
  readonly ordered: readonly Group<{ readonly kind: SetKind; readonly place: bigint }>[];
  readonly single: readonly Group<{ readonly kind: SetKind }>[];
  readonly variables: readonly { readonly kind: SetKind; readonly variable: string }[];
}

/**
 * The record an item session begins with as an application's read carries it
 * (`#ledger/session-start.ts`): the value rows of its variables as its first attempt starts, the
 * machine's start of its item, and what its template processing set ({@link SetRows}).
 */
export interface StartRows extends ValueRows {
  readonly set: readonly SetRows[];
}

/**
 * The declarations a start is read by: an attempt's ({@link Declarations}) and the item's template
 * variables, as plate's accepted item model declares them.
 */
interface StartDeclarations extends Declarations {
  readonly templates: ReadonlyMap<string, Pick<Value, "baseType" | "cardinality">>;
}

/**
 * The type of QTI's built-in `completionStatus`, a single identifier, which every admitted item
 * holds and no declaration names.
 */
const completionStatusType = { baseType: "identifier", cardinality: "single" } as const;

/**
 * The types of the item built-ins a template processing may set a correct response or a default of
 * (`qti-set-correct-response` of `numAttempts`, `qti-set-default-value` of `completionStatus` or
 * `numAttempts`), which no declaration names, as plate types them.
 */
const builtInTypes: ReadonlyMap<string, Pick<Value, "baseType" | "cardinality">> = new Map<
  string,
  Pick<Value, "baseType" | "cardinality">
>([
  ["completionStatus", completionStatusType],
  ["duration", { baseType: "float", cardinality: "single" }],
  ["numAttempts", { baseType: "integer", cardinality: "single" }],
]);

/**
 * Keep a group's rows of one rule.
 *
 * @param group The group, by base type.
 * @param kind The rule.
 * @returns The rows the rule set, by base type.
 */
const ofKind = <E extends { readonly kind: SetKind }>(
  group: Group<E>,
  kind: SetKind,
): Group<E> => ({
  boolean: group.boolean.filter((row) => row.kind === kind),
  directedPair: group.directedPair.filter((row) => row.kind === kind),
  duration: group.duration.filter((row) => row.kind === kind),
  file: group.file.filter((row) => row.kind === kind),
  float: group.float.filter((row) => row.kind === kind),
  identifier: group.identifier.filter((row) => row.kind === kind),
  integer: group.integer.filter((row) => row.kind === kind),
  pair: group.pair.filter((row) => row.kind === kind),
  point: group.point.filter((row) => row.kind === kind),
  string: group.string.filter((row) => row.kind === kind),
  uri: group.uri.filter((row) => row.kind === kind),
});

/**
 * A group of no row: the record fields template processing never sets.
 */
const noFields: Group<{ readonly field: string }> = {
  boolean: [],
  directedPair: [],
  duration: [],
  file: [],
  float: [],
  identifier: [],
  integer: [],
  pair: [],
  point: [],
  string: [],
  uri: [],
};

/**
 * Read the record an item session begins with, which its page shows before its first attempt and a
 * review shows where it hides feedback: every template variable, response, record response and
 * outcome at the value the database's start gives it, read from its rows, a declared variable it
 * holds no row of NULL, the built-in `completionStatus` among the outcomes; and the template
 * values, correct responses and defaults its template processing set, each set to NULL a NULL. The
 * values are the database's, computed by the statement that read them; nothing here computes one,
 * and `attempt` is `none`.
 *
 * @param declared The item's declarations, plate's accepted item model.
 * @param start The session's start rows.
 * @returns The record before the first attempt; a file's row dies as {@link UnpostedFile}.
 */
export const begunOfRows = Effect.fnUntraced(function* begunOfRows(
  declared: StartDeclarations,
  start: StartRows,
) {
  const read = yield* valuesOf(start);
  const set = yield* groupOf(start.set);
  const single = yield* groupOf(set.single);
  const multiple = yield* groupOf(set.multiple);
  const ordered = yield* groupOf(set.ordered);
  const typeOf = (variable: string) =>
    Option.firstSomeOf([
      Option.fromUndefinedOr(declared.responses.get(variable)),
      Option.fromUndefinedOr(declared.outcomes.get(variable)),
      Option.fromUndefinedOr(declared.templates.get(variable)),
      Option.fromUndefinedOr(builtInTypes.get(variable)),
    ]);
  const setBy = Effect.fnUntraced(function* setBy(kind: SetKind) {
    const values = yield* valuesOf({
      multiple: [ofKind(multiple, kind)],
      ordered: [ofKind(ordered, kind)],
      record: [noFields],
      single: [ofKind(single, kind)],
    });

    return Object.fromEntries(
      set.variables
        .filter((header) => header.kind === kind)
        .flatMap(({ variable }) =>
          Option.toArray(typeOf(variable)).map((declaration) => [
            variable,
            Option.getOrElse(declaredValueOf(values, variable, declaration), () =>
              nullOf(declaration),
            ),
          ]),
        ),
    );
  });

  return {
    attempt: "none",
    correct: yield* setBy("correct"),
    defaults: yield* setBy("default"),
    outcomes: everyDeclared(
      new Map<string, Pick<Value, "baseType" | "cardinality">>([
        ...declared.outcomes,
        ["completionStatus", completionStatusType],
      ]),
      (identifier, declaration) => declaredValueOf(read, identifier, declaration),
      nullOf,
    ),
    records: everyDeclared(
      declared.records,
      (identifier) => recordValueOf(read, identifier),
      () => nullRecord,
    ),
    responses: everyDeclared(
      declared.responses,
      (identifier, declaration) => declaredValueOf(read, identifier, declaration),
      nullOf,
    ),
    templates: everyDeclared(
      declared.templates,
      (identifier, declaration) => declaredValueOf(read, identifier, declaration),
      nullOf,
    ),
  } satisfies ItemRecord;
});

/**
 * Convert an `AttemptMark` row to the mark plate's review is handed.
 *
 * @param row The row, its value's columns read as a single.
 * @param value The single the row's columns hold.
 * @returns The mark, by its row's response.
 */
const partOf = <C>(row: MarkRow<C>, value: Single): readonly [string, PartMark] => [
  row.variable,
  { copies: row.copies, mark: row.mark, place: Number(row.place), value },
];

/**
 * A mark's value stated in the columns of one shape under a base type of another: the machine marks
 * a text only of a text type and a float only of a float type, so this is a defect, named by the
 * response and the base type.
 */
class MarkTypeMismatch extends Schema.TaggedError<MarkTypeMismatch>()("MarkTypeMismatch", {
  baseType: Schema.String,
  variable: Schema.String,
}) {}

/**
 * Convert a text mark's value to the single it names.
 *
 * @param row The mark's row.
 * @returns The single, of its text base type; another base type dies as {@link MarkTypeMismatch}.
 */
const textSingleOf = (row: MarkRows["text"][number]): Effect.Effect<Single> => {
  const { baseType, value, variable } = row;

  return baseType === "identifier" || baseType === "string" || baseType === "uri"
    ? Effect.succeed({ baseType, value })
    : Effect.die(MarkTypeMismatch.make({ baseType, variable }));
};

/**
 * Convert a float mark's value to the single it names.
 *
 * @param row The mark's row.
 * @returns The single, of its float base type; another base type dies as {@link MarkTypeMismatch}.
 */
const floatSingleOf = (row: MarkRows["float"][number]): Effect.Effect<Single> => {
  const { baseType, value, variable } = row;

  return baseType === "duration" || baseType === "float"
    ? Effect.succeed({ baseType, value })
    : Effect.die(MarkTypeMismatch.make({ baseType, variable }));
};

/**
 * Read an attempt's marks, by response. A mark of a file is a defect ({@link UnpostedFile}), as a
 * file's value row is.
 *
 * @param rows The attempt's mark rows.
 * @returns Every mark, by the response it marks, in the order the rows were read.
 */
const marksOf = Effect.fnUntraced(function* marksOf(rows: MarkRows) {
  const texts = yield* Effect.all(
    rows.text.map((row) => Effect.map(textSingleOf(row), (single) => partOf(row, single))),
  );
  const floats = yield* Effect.all(
    rows.float.map((row) => Effect.map(floatSingleOf(row), (single) => partOf(row, single))),
  );
  const parts = [
    ...texts,
    ...rows.integer.map((row) => partOf(row, { baseType: "integer", value: row.value })),
    ...floats,
    ...rows.boolean.map((row) => partOf(row, { baseType: "boolean", value: row.value })),
    ...rows.pair.map((row) => partOf(row, { baseType: "pair", value: [row.least, row.greatest] })),
    ...rows.directedPair.map((row) =>
      partOf(row, { baseType: "directedPair", value: [row.source, row.target] }),
    ),
    ...rows.point.map((row) => partOf(row, { baseType: "point", value: [row.x, row.y] })),
  ];
  const [file] = rows.file;

  if (file !== undefined) {
    return yield* Effect.die(UnpostedFile.make({ variable: file.variable }));
  }

  const byResponse = new Map<string, PartMark[]>();

  for (const [variable, part] of parts) {
    byResponse.set(variable, [...(byResponse.get(variable) ?? []), part]);
  }

  return Object.fromEntries(byResponse) satisfies Readonly<Record<string, readonly PartMark[]>>;
});

/**
 * Read what the database judged of an attempt: its credit, the kind of its `AttemptCredit` (the
 * owner's rule), and its `AttemptMark` rows. Nothing here judges: the statement that recorded the
 * attempt graded it.
 *
 * @param attempt The attempt's rows.
 * @returns Its credit and its marks; a mark of a file dies as {@link UnpostedFile}.
 */
export const judgedOfRows = Effect.fnUntraced(function* judgedOfRows(attempt: AttemptRows) {
  const marks = yield* Effect.flatMap(groupOf(attempt.marks), marksOf);

  return {
    credit: Option.map(Option.fromUndefinedOr(attempt.credit[0]), ({ kind }) => kind),
    marks,
  } satisfies Judged;
});

/**
 * Read a save's responses as plate reads them, from its ledger rows: what the item session's
 * candidate gave and did not submit, QTI's suspended values (§2.2.1), from the same rows an
 * attempt's are read from ({@link recordOfRows}).
 *
 * @param declared The item's declarations, plate's accepted item model.
 * @param rows The save's value rows.
 * @returns Each response the item declares at its declared cardinality, and each record response as
 *   its record, NULL as no entry; a file's row dies as {@link UnpostedFile}.
 */
export const responsesOfRows = Effect.fnUntraced(function* responsesOfRows(
  declared: Declarations,
  rows: ValueRows,
) {
  const read = yield* valuesOf(rows);
  const responses: [string, ResponseValue][] = [
    ...[...declared.responses].flatMap(([identifier, declaration]) =>
      Option.toArray(declaredValueOf(read, identifier, declaration)).map(
        (value): [string, ResponseValue] => [identifier, value],
      ),
    ),
    ...[...declared.records.keys()].flatMap((identifier) =>
      Option.toArray(recordValueOf(read, identifier)).map((value): [string, ResponseValue] => [
        identifier,
        value,
      ]),
    ),
  ];

  return Object.fromEntries(responses) satisfies Responses;
});
