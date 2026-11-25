/**
 * Rosters and closed relations as values (fin.md §17).
 *
 * A roster is a closed vocabulary of handles, each coded by its position. A closed relation is
 * fixed when the schema compiles, so it has no table: grizzle packs it into a constant. This module
 * holds the rows a generator states and, for a relation a serving path reads by key, its index
 * ({@link indexed}); a test indexes any other itself. It checks no row, packs nothing and sizes
 * nothing: grizzle refuses a value outside its field's code space and two facts of one key when it
 * declares the relation, a slot past its owner's count when it packs it, and a constant past
 * PostgreSQL's longest bit string (README, "Limits"). The tests over a composition declare its
 * relations through grizzle to read the same refusals (`#pantry/test/declared.ts`).
 *
 * The shapes follow grizzle's two declaration forms (grizzle D1 to D3): a roster, and
 * `closed.relation(name, fields, key, rows)`. A key digit is a closed id, a field over a roster
 * (grizzle D2), so a relation's index is the mixed radix of roster codes. A payload field is a
 * closed id or an open-typed value, the latter coded by its active domain within the relation in
 * value order (fin.md §17, "Codes").
 */
import { Option, Schema } from "effect";
import type { Array as Arr } from "effect";
import type { Source } from "#pantry/vocab/inventory/types.ts";

/**
 * A roster: the handles of a closed vocabulary, each coded by its position.
 *
 * Codes are append-only (grizzle D1): a vocabulary that grows appends handles, so every code an
 * earlier roster gave keeps its handle. A roster's constant is the set of its live codes.
 */
export interface Roster<
  Handle extends string,
  Handles extends readonly Handle[] = readonly Handle[],
> {
  /**
   * The roster's name, as a relation keyed by it and its failures name it.
   */
  readonly name: string;
  /**
   * The handles, in code order.
   */
  readonly handles: Handles;
  /**
   * Find a handle's code.
   *
   * @param handle - The handle.
   * @returns Its code, or none for a string the roster does not hold.
   */
  readonly codeOf: (handle: Primitive) => Option.Option<number>;
  /**
   * Narrow a string to a handle of the roster.
   *
   * @param value - Any string.
   * @returns Whether the roster holds it.
   */
  readonly has: (value: string) => value is Handle;
}

/**
 * A roster that holds a handle: the form grizzle's `closed(name, handles)` declares, whose
 * handles are a nonempty list. A roster the generators build from a vocabulary list's content
 * may be empty for a list that states none of it, and is a plain {@link Roster}.
 */
export type NonEmptyRoster<Handle extends string> = Roster<
  Handle,
  Arr.NonEmptyReadonlyArray<Handle>
>;

/**
 * A field whose values are a roster's handles: a closed id. Every key field is one. `Over` is
 * the roster's own type, so a field over a {@link NonEmptyRoster} keeps saying so.
 */
export interface IdField<
  Name extends string,
  Handle extends string,
  Over extends Roster<Handle> = Roster<Handle>,
> {
  readonly _tag: "id";
  readonly name: Name;
  readonly roster: Over;
}

/**
 * The value types an open-typed payload field holds: values the relation's constant codes by
 * their place in value order, so equal values share a code.
 */
export type Primitive = bigint | boolean | number | string;

/**
 * A payload field of an open type: its code space is the distinct values the relation's rows hold,
 * in value order.
 */
export interface ValueField<Name extends string, Value extends Primitive> {
  readonly _tag: "value";
  readonly name: Name;
  readonly values: readonly Value[];
}

/**
 * A key field over `fin(O, n)` for a closed O (fin.md §17, "The index"): its codes are 0 to n − 1,
 * where n is read per prefix, the values of the key fields before it. Its relation's string is then
 * a dependent sum, Σ o. Fin(n o): a prefix's block sits at the offset of the blocks before it, so
 * no cell is spent on a code a prefix does not have.
 */
export interface DependentField<Name extends string> {
  readonly _tag: "dependent";
  readonly name: Name;
  /**
   * The codes at the widest prefix, each spelled as its numeral; a prefix holds a leading run of
   * them.
   */
  readonly roster: Roster<string>;
  /**
   * How many codes the field has under a prefix.
   *
   * @param prefix - The values of the key fields before the first dependent field.
   * @returns The size of the field's code space there.
   */
  readonly sizeOf: (prefix: Readonly<Record<string, string>>) => number;
}

/**
 * Any key field whose values are a roster's handles.
 */
type AnyIdField = IdField<string, string>;

/**
 * Any key field: a closed id, or a dependent `fin`.
 */
export type AnyKeyField = AnyIdField | DependentField<string>;

/**
 * Any field, as the encoder reads it.
 */
export type AnyField = AnyIdField | ValueField<string, Primitive>;

/**
 * The value a field holds: a handle of its roster, or a value of its type.
 */
type ValueOf<F> =
  F extends IdField<string, infer Handle>
    ? Handle
    : F extends ValueField<string, infer Value>
      ? Value
      : F extends DependentField<string>
        ? string
        : never;

/**
 * The row a list of fields describes: under each field's name, one value of its code space.
 */
export type RowOf<Fields extends readonly (AnyField | DependentField<string>)[]> = {
  readonly [F in Fields[number] as F["name"]]: ValueOf<F>;
};

/**
 * A row of a closed relation: its key fields' values and its payload fields' values.
 */
export type Row<
  Key extends readonly AnyKeyField[],
  Payload extends readonly AnyField[],
> = RowOf<Key> & RowOf<Payload>;

/**
 * A row as the encoder reads it: under each field's name, a value of whatever type the field holds.
 */
type AnyRow = Readonly<Record<string, Primitive>>;

/**
 * A closed relation under a declared key: its rows, one per key, each value within its field's code
 * space. A relation with no payload is a set. It answers no lookup: a relation the host reads by
 * key is {@link Indexed}, built where a serving path reads it, and a test indexes any other itself.
 */
export interface Closed<Key extends readonly AnyKeyField[], Payload extends readonly AnyField[]> {
  readonly name: string;
  /**
   * The key's fields in index order, the first the most significant digit. Two rows never share a
   * key.
   */
  readonly key: Key;
  readonly payload: Payload;
  /**
   * The rows as stated, every value within its field's code space.
   */
  readonly rows: readonly Row<Key, Payload>[];
}

/**
 * A closed relation the host reads by key: its rows, indexed once by their keys ({@link indexed}).
 */
export interface Indexed<
  Key extends readonly AnyKeyField[],
  Payload extends readonly AnyField[],
> extends Closed<Key, Payload> {
  /**
   * Find the row at a key.
   *
   * @param key - A handle for each key field.
   * @returns The row at that key, or none when the relation holds none there, as for a handle
   *   outside its field's roster.
   */
  readonly lookup: (key: { readonly [F in Key[number] as F["name"]]: string }) => Option.Option<
    Row<Key, Payload>
  >;
}

/**
 * A closed relation whose rows carry their spec source (Bjorn's ruling of 2026-11-05): the
 * XSD particle or declaration a row reads, by file and line, or the specification
 * or spec reading that states it. A refusal maps from its law to its source rule by its row's
 * source, so it explains itself from the law, the row's keys and the grammar's constants. The
 * source is host data: it never enters the relation's constant.
 */
export interface Sourced<
  Key extends readonly AnyKeyField[],
  Payload extends readonly AnyField[],
> extends Closed<Key, Payload> {
  /**
   * Each row with its source, in the rows' order.
   */
  readonly sourced: readonly SourcedRow<Key, Payload>[];
}

/**
 * A sourced relation the host reads by key: its rows and their sources, indexed once by their keys
 * ({@link indexedSourced}).
 */
export interface IndexedSourced<
  Key extends readonly AnyKeyField[],
  Payload extends readonly AnyField[],
>
  extends Indexed<Key, Payload>, Sourced<Key, Payload> {
  /**
   * Find where the row at a key comes from.
   *
   * @param key - A handle for each key field.
   * @returns The row's source, or none where the relation holds no row.
   */
  readonly sourceOf: (key: {
    readonly [F in Key[number] as F["name"]]: string;
  }) => Option.Option<Source>;
}

/**
 * A row a closed relation states, with where it comes from: the XSD particle or declaration it
 * reads, or the specification or spec reading that states it.
 */
export interface SourcedRow<
  Key extends readonly AnyKeyField[],
  Payload extends readonly AnyField[],
> {
  readonly row: Row<Key, Payload>;
  readonly source: Source;
}

/**
 * Read the handle a dependent field's prefix holds in one of the key fields before it.
 *
 * @param prefix - The prefix, each key field before the first dependent one with its handle.
 * @param name - The key field.
 * @returns The field's handle in the prefix.
 * @throws {Error} When no key field before the dependent field has the name, so the field's size
 *   reads a field its relation's key does not hold before it: a defect of the relation's
 *   declaration, met when {@link closed} lays out the key, as the grammar loads.
 */
export const prefixHandle = (prefix: Readonly<Record<string, string>>, name: string): string => {
  const handle = prefix[name];
  if (handle === undefined) {
    throw new Error(
      `A dependent field's size reads the key field ${name}, and the key holds ${Object.keys(prefix).join(", ") || "no field"} before it. Move ${name} before the dependent field in the key, or read a field the key holds there.`,
    );
  }

  return handle;
};

/**
 * Read the rows a grouping holds at a key, as `Map.groupBy` groups them: a group is the rows that
 * have its key, so a key no row has holds none.
 *
 * @param groups - The rows, grouped by key.
 * @param key - The key.
 * @returns The rows at the key, in order; none where no row has it.
 */
export const rowsAt = <K, R>(groups: ReadonlyMap<K, readonly R[]>, key: K): readonly R[] =>
  groups.get(key) ?? [];

/**
 * Spell a tuple of texts as one map key, for a `Map` or a `Set` keyed by several fields: two tuples
 * share a key exactly when they hold the same texts in the same order, whatever characters the
 * texts hold, since JSON quotes and escapes each string.
 *
 * @param parts - The tuple's texts, in order.
 * @returns The key.
 */
export const tupleKey = (parts: readonly string[]): string => JSON.stringify(parts);

/**
 * The largest `int8`, 2⁶³ − 1: the top of the carrier of a count of children, the bound that bounds
 * nothing where an arity is unbounded, and of a count spec reading 46 holds to the signed 64-bit
 * range.
 *
 * @formatConstant PostgreSQL's `int8`, a signed 64-bit integer: the top of its range.
 */
export const int8Max = 9_223_372_036_854_775_807n;

/**
 * The least `int8`, −2⁶³: the bottom of the signed 64-bit range spec reading 46 holds a count to.
 *
 * @formatConstant PostgreSQL's `int8`, a signed 64-bit integer: the bottom of its range.
 */
export const int8Min = -9_223_372_036_854_775_808n;

/**
 * A row of a closed relation whose value for a field is not in that field's code space, so the
 * value has no code: the attribute grammar's refusal of a name outside `AttributeName`, from which
 * it reads an attribute's position (`#pantry/grammar/attributes.ts`).
 */
export class OutsideCodeSpace extends Schema.TaggedError<OutsideCodeSpace>()("OutsideCodeSpace", {
  field: Schema.String,
  relation: Schema.String,
  value: Schema.String,
}) {
  /**
   * The relation, the field, the value without a code, and the repair.
   */
  override get message(): string {
    return `${this.relation} has a row whose ${this.field} is ${this.value}, which the field's code space does not hold. Add ${this.value} to the field's values, or correct the row.`;
  }
}

/**
 * Construct a roster from its handles in code order. It checks no handle: grizzle refuses a roster
 * that lists a handle twice when it declares one (`closed(name, handles)`), and the tests over a
 * composition declare each of its rosters, one grizzle never sees among them, to read that refusal
 * (`#pantry/test/declared.ts`).
 *
 * @param name - The roster's name.
 * @param handles - The handles, in code order.
 * @returns The roster, typed by its list: a {@link NonEmptyRoster} over a nonempty one.
 */
export const roster = <const Handles extends readonly string[]>(
  name: string,
  handles: Handles,
): Roster<Handles[number], Handles> => {
  const codes = new Map<Primitive, number>(handles.map((handle, code) => [handle, code]));

  return {
    codeOf: (handle: Primitive) => Option.fromNullishOr(codes.get(handle)),
    handles,
    has: (value: string): value is Handles[number] => codes.has(value),
    name,
  };
};

/**
 * Construct the roster of the whole numbers 0 to `size` − 1, each spelled as its numeral: the code
 * space of a dense coordinate, fin.md's `fin(size)`, such as a parent's child positions. It is no
 * grizzle `fin(O, field)`, which names a count field that bounds a slot.
 *
 * @param name - The roster's name.
 * @param size - The number of codes.
 * @returns The roster; its numerals are distinct, so it is always one.
 */
export const numerals = (name: string, size: number): Roster<string> =>
  roster(
    name,
    Array.from({ length: size }, (_, code) => String(code)),
  );

/**
 * Construct a key or payload field over a roster.
 *
 * @param name - The field's name.
 * @param over - The roster whose handles it holds.
 * @returns The field.
 */
export const idField = <const Name extends string, Over extends Roster<string>>(
  name: Name,
  over: Over,
): IdField<Name, Over["handles"][number], Over> => ({ _tag: "id", name, roster: over });

/**
 * Order two values of one primitive type: numbers and bigints by magnitude, strings by code unit,
 * `false` before `true`. The positive branch is needed though V8's sort reads only whether a
 * comparison is below zero: ECMA-262's `Array.prototype.sort` leaves the order
 * implementation-defined for a comparator that is not consistent (§23.1.3.30), as one that never
 * answers positive is not.
 *
 * @param left - A value.
 * @param right - A value of the same type.
 * @returns Negative, zero or positive, as `left` sorts before, with or after `right`.
 */
const byValue = <Value extends Primitive>(left: Value, right: Value): number => {
  if (left < right) {
    return -1;
  }

  return left > right ? 1 : 0;
};

/**
 * Construct an open-typed payload field from the values its relation's rows hold: its code space
 * is their distinct values in value order (fin.md §17). These codes never leave the constant, so
 * they need no stability across rows that change.
 *
 * @param name - The field's name.
 * @param column - The field's value in every row.
 * @returns The field, each distinct value once, ascending.
 */
export const valueField = <const Name extends string, Value extends Primitive>(
  name: Name,
  column: Iterable<Value>,
): ValueField<Name, Value> => ({
  _tag: "value",
  name,
  values: [...new Set(column)].toSorted(byValue),
});

/**
 * Construct a dependent `fin` key field.
 *
 * @param name - The field's name.
 * @param over - The codes at the widest prefix.
 * @param sizeOf - The size of its code space under a prefix.
 * @returns The field.
 */
export const dependentField = <const Name extends string>(
  name: Name,
  over: Roster<string>,
  sizeOf: (prefix: Readonly<Record<string, string>>) => number,
): DependentField<Name> => ({ _tag: "dependent", name, roster: over, sizeOf });

/**
 * A key as a lookup names it: a handle for each key field.
 */
type KeyOf<Key extends readonly AnyKeyField[]> = {
  readonly [F in Key[number] as F["name"]]: string;
};

/**
 * Number a row's key: its key fields' codes as the digits of a mixed-radix numeral, the first
 * field the most significant, each digit's base its field's code space (its roster's size). Two
 * keys have one number exactly when they are one key, and the number is exact while the product of
 * the bases stays within `Number.MAX_SAFE_INTEGER`, which {@link lookupOf} holds every index to.
 *
 * @param key - The key's fields.
 * @param row - The row, or a lookup's key.
 * @returns The key's number, or none for a key that leaves a field out or holds a value outside
 *   its field's code space, which no row is at.
 */
const keyNumberOf = (key: readonly AnyKeyField[], row: AnyRow): Option.Option<number> => {
  let number = 0;
  for (const field of key) {
    const code = Option.flatMap(Option.fromNullishOr(row[field.name]), (value) =>
      field.roster.codeOf(String(value)),
    );
    if (Option.isNone(code)) {
      return Option.none();
    }

    number = number * field.roster.handles.length + code.value;
  }

  return Option.some(number);
};

/**
 * Index a relation's entries by their rows' keys, for its lookups: the entry at a key, none where
 * no row is, and none for a key that leaves a field out.
 *
 * It checks no row. A row's values lie in their code spaces and its key is its own because the
 * relation's constant says so: grizzle refuses a closed id outside its roster and two rows of one
 * key when `install.ts` declares the relation (`closed.relation`, `closedRows` in grizzle's
 * `schema/relation.ts`), and a slot past its owner's count when it packs the relation
 * (`outsideFin` in `physical/ddl/constants.ts`); the tests over a composition declare each of its
 * relations, one grizzle never sees among them, to read those refusals
 * (`#pantry/test/declared.ts`), and no load runs them.
 *
 * @param key - The relation's key fields.
 * @param entries - Its rows, each with whatever the host reads beside it.
 * @returns The entry at a key.
 * @throws {Error} When the key's code space has more keys than a number holds exactly, so two keys
 *   could share a number: a key of more or wider fields than any relation of the composition has.
 */
const lookupOf = <Key extends readonly AnyKeyField[], Entry extends { readonly row: AnyRow }>(
  key: Key,
  entries: readonly Entry[],
): ((at: KeyOf<Key>) => Option.Option<Entry>) => {
  const space = key.reduce((size, field) => size * field.roster.handles.length, 1);
  if (space > Number.MAX_SAFE_INTEGER) {
    throw new Error(
      `A key over ${key.map(({ name }) => name).join(", ")} has ${String(space)} keys, more than a number holds exactly; index it by fewer or narrower fields.`,
    );
  }

  const byKey = new Map<number, Entry>();
  for (const entry of entries) {
    for (const at of Option.toArray(keyNumberOf(key, entry.row))) {
      byKey.set(at, entry);
    }
  }

  return (at) =>
    Option.flatMap(keyNumberOf(key, at), (number) => Option.fromNullishOr(byKey.get(number)));
};

/**
 * Construct a closed relation from rows of handles and values. It indexes nothing and checks no
 * row: grizzle checks them when it declares and packs the relation, and the tests through
 * `#pantry/test/declared.ts`.
 *
 * @param relation - The relation as a generator states it.
 * @param relation.key - Its key's fields in index order, the first the most significant digit.
 * @param relation.name - Its name, as its laws and its failures name it.
 * @param relation.payload - The fields outside the key, none for a set.
 * @param relation.rows - Its rows.
 * @returns The relation.
 */
export const closed = <
  const Key extends readonly AnyKeyField[],
  const Payload extends readonly AnyField[],
>(relation: {
  readonly key: Key;
  readonly name: string;
  readonly payload: Payload;
  readonly rows: readonly Row<Key, Payload>[];
}): Closed<Key, Payload> => ({
  key: relation.key,
  name: relation.name,
  payload: relation.payload,
  rows: relation.rows,
});

/**
 * Index a closed relation's rows by their keys, for a reader that looks rows up: built once, where
 * a serving path reads the relation by key ({@link lookupOf}).
 *
 * @param relation - The relation.
 * @returns It, answering lookups.
 */
export const indexed = <Key extends readonly AnyKeyField[], Payload extends readonly AnyField[]>(
  relation: Closed<Key, Payload>,
): Indexed<Key, Payload> => {
  const at = lookupOf(
    relation.key,
    relation.rows.map((row) => ({ row })),
  );

  return { ...relation, lookup: (key) => Option.map(at(key), ({ row }) => row) };
};

/**
 * Construct a closed relation whose rows carry their sources (Bjorn's ruling of 2026-11-05),
 * each row stated with its own: the source is host data, which never enters the relation's
 * constant. It indexes nothing and checks no row.
 *
 * @param relation - The relation as a generator states it, each row with its source.
 * @param relation.key - Its key's fields in index order, the first the most significant digit.
 * @param relation.name - Its name, as its laws and its failures name it.
 * @param relation.payload - The fields outside the key, none for a set.
 * @param relation.rows - Its rows, each with where it comes from.
 * @returns The relation.
 */
export const sourced = <
  const Key extends readonly AnyKeyField[],
  const Payload extends readonly AnyField[],
>(relation: {
  readonly key: Key;
  readonly name: string;
  readonly payload: Payload;
  readonly rows: readonly SourcedRow<Key, Payload>[];
}): Sourced<Key, Payload> => ({
  key: relation.key,
  name: relation.name,
  payload: relation.payload,
  rows: relation.rows.map(({ row }) => row),
  sourced: relation.rows,
});

/**
 * Index a sourced relation's rows and their sources by their keys, for a reader that looks either
 * up: built once, where a serving path reads the relation by key ({@link lookupOf}).
 *
 * @param relation - The relation.
 * @returns It, answering lookups and sources.
 */
export const indexedSourced = <
  Key extends readonly AnyKeyField[],
  Payload extends readonly AnyField[],
>(
  relation: Sourced<Key, Payload>,
): IndexedSourced<Key, Payload> => {
  const at = lookupOf(relation.key, relation.sourced);

  return {
    ...relation,
    lookup: (key) => Option.map(at(key), ({ row }) => row),
    sourceOf: (key) => Option.map(at(key), ({ source }) => source),
  };
};
