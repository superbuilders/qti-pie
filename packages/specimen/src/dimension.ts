/**
 * The dimensions of a specimen: each fact of an item a generator draws from a closed list of
 * values, which the lab shows as "any" or one fixed value and writes to its address as
 * `?<key>=<name>`. A kind declares its own as a record, so its picks are typed from it, and the lab
 * lists them from the same record, never from a second list.
 *
 * @module
 */
import { Array as Arr, Brand, Option, Record, Result } from "effect";
import { element, map, span } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import type { Tape } from "@bjornpagen/testing/tape";

/**
 * One value a dimension may take: its `name` in an address, its `label` for a person, and the
 * value the description holds.
 */
interface Value<V> {
  readonly label: string;
  readonly name: string;
  readonly value: V;
}

/**
 * A closed list of values, the simplest first, which is where a failing case shrinks to and where
 * an enumeration starts.
 */
export interface Dimension<V> {
  readonly label: string;
  readonly values: Arr.NonEmptyReadonlyArray<Value<V>>;
}

/**
 * A record of dimensions, one for each key of `M`, each taking the values `M` names.
 */
export type DimensionsOf<M> = { readonly [N in keyof M]: Dimension<M[N]> };

/**
 * Which dimensions a sheet holds fixed: each fixed dimension's address key, and the name of the
 * value it is fixed at. A dimension it does not name is at any value. {@link queryIn} mints one
 * from an address, holding every key and name to the dimensions, and {@link anyQuery} is the one
 * that fixes nothing.
 */
export type Query = Brand.Branded<ReadonlyMap<string, string>, "Query">;

/**
 * The brand's constructor, kept to this module.
 */
const query = Brand.nominal<Query>();

/**
 * The query that fixes nothing: every dimension at any value.
 */
export const anyQuery: Query = query(new Map());

/**
 * Draw one dimension of a record as a query holds it: a generator a kind's settings draw each of
 * their dimensions through, and only the ones their settings reach.
 */
export type Picker<M> = <N extends keyof M>(name: N) => Gen<M[N]>;

/**
 * Map a non-empty list, keeping it non-empty.
 *
 * @param items The list.
 * @param mapped What each item becomes.
 * @returns The mapped list.
 */
const mapNonEmpty = <A, B>(
  items: Arr.NonEmptyReadonlyArray<A>,
  mapped: (item: A) => B,
): Arr.NonEmptyReadonlyArray<B> => [
  mapped(items[0]),
  ...items.slice(1).map((item) => mapped(item)),
];

/**
 * Declare a dimension from its values, each written `[name, label, value]`, the simplest first.
 *
 * @param label The dimension's label.
 * @param values Its values.
 * @returns The dimension.
 */
export const dimension = <
  const T extends Arr.NonEmptyReadonlyArray<readonly [name: string, label: string, value: unknown]>,
>(
  label: string,
  values: T,
): Dimension<T[number][2]> => ({
  label,
  values: mapNonEmpty(values, ([name, valueLabel, value]) => ({ label: valueLabel, name, value })),
});

/**
 * The dimension of the whole numbers from `low` to `high`, each named and labelled by its digits,
 * the least first.
 *
 * @param label The dimension's label.
 * @param low The least value.
 * @param high The greatest value, at least `low`.
 * @returns The dimension.
 */
export const counted = (label: string, low: number, high: number): Dimension<number> => ({
  label,
  values: Arr.map(Arr.range(low, high), (value) => ({
    label: String(value),
    name: String(value),
    value,
  })),
});

/**
 * Draw a dimension's values that a query allows: the one it fixes, or any.
 *
 * A fixed dimension is a decision with one value, which a tape does not record, so a case's token
 * is relative to the query it was drawn under. A minted query fixes only a name the dimension
 * holds; a name it does not hold leaves it at any.
 *
 * @param held The dimension.
 * @param fixed The name the query fixes it at, none when it leaves it at any.
 * @returns The generator.
 */
const draw = <V>(held: Dimension<V>, fixed: Option.Option<string>): Gen<V> => {
  const allowed = Option.match(fixed, {
    onNone: () => held.values,
    onSome: (name) => held.values.filter((value) => value.name === name),
  });

  return map(
    element(Arr.isReadonlyArrayNonEmpty(allowed) ? allowed : held.values),
    (value) => value.value,
  );
};

/**
 * Whose dimensions a record is: the item's, keyed by their names, or a kind's, keyed
 * `<kind>.<name>` by the kind's value name.
 */
export type Owner =
  | { readonly kind: "item" }
  | { readonly kind: "interaction"; readonly name: string };

/**
 * A dimension's address key.
 *
 * @param owner Whose it is.
 * @param name Its name in its record.
 * @returns The key.
 */
const keyOf = (owner: Owner, name: string): string => {
  switch (owner.kind) {
    case "item": {
      return name;
    }
    case "interaction": {
      return `${owner.name}.${name}`;
    }
  }
};

/**
 * Draw an owner's dimensions as a query holds them: each draw in a span its address key labels,
 * holding the one decision it made, or none when the query fixes it, so a case's tape says which
 * dimensions it reached and at which value.
 *
 * @param owner Whose dimensions they are.
 * @param dimensions The dimensions.
 * @param held The query.
 * @returns The picker.
 */
export const picker =
  <M>(owner: Owner, dimensions: DimensionsOf<M>, held: Query): Picker<M> =>
  (name) => {
    const key = keyOf(owner, String(name));

    return span(key, draw(dimensions[name], Option.fromNullishOr(held.get(key))));
  };

/**
 * One dimension as the lab lists it: its address key, whose it is, its label, and its values'
 * names and labels.
 */
export interface Listed {
  readonly key: string;
  readonly label: string;
  readonly owner: Owner;
  readonly values: Arr.NonEmptyReadonlyArray<Readonly<{ label: string; name: string }>>;
}

/**
 * List an owner's dimensions, in their declared order.
 *
 * @param owner Whose they are.
 * @param dimensions The dimensions.
 * @returns Each dimension with its address key.
 */
export const listed = (
  owner: Owner,
  dimensions: Readonly<Record<string, Dimension<unknown>>>,
): readonly Listed[] =>
  Record.toEntries(dimensions).map(([name, held]) => ({
    key: keyOf(owner, name),
    label: held.label,
    owner,
    values: mapNonEmpty(held.values, (value) => ({ label: value.label, name: value.name })),
  }));

/**
 * An address's key or value that no listed dimension holds: the key, the text, and what the key
 * admits, or every key when it names no dimension.
 */
export interface Unreadable {
  readonly allowed: readonly string[];
  readonly key: string;
  readonly text: string;
}

/**
 * Read a query from an address's pairs: each pair fixes the dimension its key names at the value
 * its text names.
 *
 * @param dimensions Every dimension, as {@link listed} lists them.
 * @param pairs The address's `[key, text]` pairs.
 * @returns The query, or the first pair whose key names no dimension or whose text names no value
 *   of its dimension.
 */
export const queryIn = (
  dimensions: readonly Listed[],
  pairs: Iterable<readonly [key: string, text: string]>,
): Result.Result<Query, Unreadable> =>
  Result.map(
    Result.all(
      Arr.map(Arr.fromIterable(pairs), ([key, text]) =>
        Option.match(
          Arr.findFirst(dimensions, (listing) => listing.key === key),
          {
            onNone: () =>
              Result.fail({ allowed: dimensions.map((listing) => listing.key), key, text }),
            onSome: (listing) =>
              listing.values.some((value) => value.name === text)
                ? Result.succeed([key, text] as const)
                : Result.fail({
                    allowed: listing.values.map((value) => value.name),
                    key,
                    text,
                  }),
          },
        ),
      ),
    ),
    (fixed) => query(new Map(fixed)),
  );

/**
 * Write a query as an address's pairs.
 *
 * @param held The query.
 * @returns A `[key, name]` pair for each fixed dimension.
 */
export const pairsOf = (held: Query): readonly (readonly [key: string, name: string])[] => [
  ...held.entries(),
];

/**
 * The values a case reached, as a query: every dimension its draw reached, in the order it drew
 * them, fixed at the value it took. A dimension's span holds the one decision that picked its value
 * by its place in the list, or none when the case's query fixed it.
 *
 * @param dimensions Every dimension, as {@link listed} lists them.
 * @param held The query the case was drawn under.
 * @param tape The case's tape.
 * @param after The pairs of dimensions drawn outside a span, after the others: the child's
 *   response, drawn from those its interaction admits.
 * @returns The query that draws the case with no decision left.
 */
export const reached = (
  dimensions: readonly Listed[],
  held: Query,
  tape: Tape,
  after: readonly (readonly [key: string, name: string])[],
): Query => {
  const byKey = new Map(dimensions.map((listing) => [listing.key, listing]));

  const spanned = tape.spanLabel.flatMap((key, at) =>
    Option.toArray(
      Option.flatMap(Option.fromNullishOr(byKey.get(key)), (listing) => {
        const start = tape.spanStart[at] ?? 0;

        return (tape.spanEnd[at] ?? 0) > start
          ? Option.map(
              Option.fromNullishOr(listing.values[tape.values[start] ?? 0]),
              (value) => [key, value.name] as const,
            )
          : Option.map(Option.fromNullishOr(held.get(key)), (name) => [key, name] as const);
      }),
    ),
  );

  return query(new Map([...spanned, ...after]));
};
