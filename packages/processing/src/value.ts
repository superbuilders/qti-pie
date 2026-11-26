/**
 * QTI 3.0.1's values, as the evaluator holds them: a base type (information model §8.14,
 * BaseTypeEnum) under a cardinality (§8.17, CardinalityEnum), or NULL of a declared type.
 *
 * "Empty containers and empty strings are always treated as NULL values" (§2.2.2): neither is
 * representable here. A container's members are a non-empty tuple, and a string, identifier or URI
 * is a {@link Text}, a string no code can make empty, so the constructors give NULL where QTI does
 * and no operator meets an empty value it would have to defend against.
 *
 * - An integer is an exact `bigint` at any size (reading `integer-unbounded`); a float and a
 *   duration's seconds are IEEE 754 binary64 doubles (reading `float-binary64`), compared by `===`,
 *   so NaN matches nothing and −0 matches 0.
 * - A pair is unordered (§8.14: "(A,B) equals (B,A)"); a directed pair and a point are ordered.
 * - A record has no base type: each field is a single value of its own (reading
 *   `record-without-base-type`), and a NULL field is no field.
 * - NULL is typed: it keeps the type it was declared or computed with (reading `null-results`).
 *
 * @module
 */

/**
 * The eleven base types, sorted (§8.14).
 */
export const baseTypes = [
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
] as const;

/**
 * A base type, one of {@link baseTypes}.
 */
export type BaseType = (typeof baseTypes)[number];

/**
 * A non-empty tuple: a container's members, of which there is always one.
 */
export type NonEmpty<T> = readonly [T, ...T[]];

/**
 * The key of the {@link Text} brand. It is declared and never defined, so no module can name it,
 * and a `Text` comes only from {@link isText}, which holds it to its one invariant.
 */
declare const nonEmptyText: unique symbol;

/**
 * A string of at least one character: the text of a string, identifier or URI value, since an
 * empty one is NULL (§2.2.2).
 */
export type Text = string & { readonly [nonEmptyText]: true };

/**
 * Whether a string is a {@link Text}: it holds a character.
 *
 * @param text - The string.
 * @returns Whether it is not empty.
 */
export const isText = (text: string): text is Text => text.length > 0;

/**
 * A pair of identifiers, unordered: {@link sameScalar} compares its members as a set of two.
 */
export interface Pair {
  readonly first: Text;
  readonly second: Text;
}

/**
 * A directed pair of identifiers: its source, then its target.
 */
export interface DirectedPair {
  readonly source: Text;
  readonly target: Text;
}

/**
 * A point: its horizontal coordinate, then its vertical, each an integer.
 */
export interface Point {
  readonly x: bigint;
  readonly y: bigint;
}

/**
 * A file value: its octets, its content type and its name where the candidate's client gave one.
 * Two files are the same file when all three agree.
 */
export interface QtiFile {
  readonly bytes: Uint8Array;
  readonly contentType: Text;
  readonly name: Text | undefined;
}

/**
 * The scalar of each base type: one member of a value.
 */
export interface Scalars {
  readonly boolean: boolean;
  readonly directedPair: DirectedPair;
  /**
   * A duration's seconds.
   */
  readonly duration: number;
  readonly file: QtiFile;
  readonly float: number;
  readonly identifier: Text;
  readonly integer: bigint;
  readonly pair: Pair;
  readonly point: Point;
  readonly string: Text;
  readonly uri: Text;
}

/**
 * A container cardinality: a bag or a sequence of members of one base type.
 */
export type ContainerCardinality = "multiple" | "ordered";

/**
 * A single value of base type `B`.
 */
export interface SingleOf<B extends BaseType> {
  readonly base: B;
  readonly kind: "single";
  readonly value: Scalars[B];
}

/**
 * A container of base type `B` and cardinality `C`, holding at least one member.
 */
export interface ContainerOf<B extends BaseType, C extends ContainerCardinality> {
  readonly base: B;
  readonly kind: C;
  readonly values: NonEmpty<Scalars[B]>;
}

/**
 * A single value of any base type.
 */
export type Single = { readonly [B in BaseType]: SingleOf<B> }[BaseType];

/**
 * A container of any base type.
 */
export type Container = {
  readonly [B in BaseType]: ContainerOf<B, "multiple"> | ContainerOf<B, "ordered">;
}[BaseType];

/**
 * One field of a record: its name and its single value.
 */
export interface RecordField {
  readonly name: string;
  readonly value: Single;
}

/**
 * A record: at least one field, by name in code-point order, each name once.
 */
export interface RecordValue {
  readonly fields: NonEmpty<RecordField>;
  readonly kind: "record";
}

/**
 * A value that is not NULL.
 */
export type Present = Container | RecordValue | Single;

/**
 * The type of a value: its cardinality and, but for a record, its base type.
 */
export type ValueType =
  | { readonly base: BaseType; readonly cardinality: "single" | ContainerCardinality }
  | { readonly cardinality: "record" };

/**
 * NULL, of the type it was declared or computed with.
 */
export interface Null {
  readonly kind: "null";
  readonly type: ValueType;
}

/**
 * A QTI value: present, or NULL of a type.
 */
export type Value = Null | Present;

/**
 * Give the type of a value.
 *
 * @param value - The value.
 * @returns Its cardinality and base type.
 */
export const valueTypeOf = (value: Value): ValueType => {
  switch (value.kind) {
    case "null": {
      return value.type;
    }
    case "record": {
      return { cardinality: "record" };
    }
    case "single":
    case "multiple":
    case "ordered": {
      return { base: value.base, cardinality: value.kind };
    }
  }
};

/**
 * Whether two value types are the same type.
 *
 * @param left - One type.
 * @param right - The other.
 * @returns Whether their cardinalities and base types agree.
 */
export const sameValueType = (left: ValueType, right: ValueType): boolean =>
  left.cardinality === "record"
    ? right.cardinality === "record"
    : right.cardinality !== "record" &&
      left.cardinality === right.cardinality &&
      left.base === right.base;

/**
 * NULL of a type.
 *
 * @param type - The type.
 * @returns The NULL.
 */
export const nullOf = (type: ValueType): Null => ({ kind: "null", type });

/**
 * The single value of a scalar.
 *
 * @param base - The base type.
 * @param value - The scalar.
 * @returns The single value.
 */
export const single = <B extends BaseType>(base: B, value: Scalars[B]): SingleOf<B> => ({
  base,
  kind: "single",
  value,
});

/**
 * The single value of a text base type, or its NULL when the text is empty (§2.2.2).
 *
 * @param base - `string`, `identifier` or `uri`.
 * @param text - The text.
 * @returns The value.
 */
export const textValue = <B extends "identifier" | "string" | "uri">(
  base: B,
  text: string,
): Null | SingleOf<B> =>
  isText(text) ? { base, kind: "single", value: text } : nullOf({ base, cardinality: "single" });

/**
 * A container of members, or its NULL when it has none (§2.2.2).
 *
 * @param kind - `multiple` or `ordered`.
 * @param base - The members' base type.
 * @param values - The members, in order.
 * @returns The value.
 */
export const container = <B extends BaseType, C extends ContainerCardinality>(
  kind: C,
  base: B,
  values: readonly Scalars[B][],
): ContainerOf<B, C> | Null => {
  const [first, ...rest] = values;

  return first === undefined
    ? nullOf({ base, cardinality: kind })
    : { base, kind, values: [first, ...rest] };
};

/**
 * A record of fields, or the NULL record when it has none. A later field of a name replaces an
 * earlier one, and the fields are kept in code-point order of their names.
 *
 * @param fields - The fields.
 * @returns The value.
 */
export const recordOf = (fields: readonly RecordField[]): Null | RecordValue => {
  const byName = new Map<string, RecordField>();
  for (const field of fields) {
    byName.set(field.name, field);
  }

  const [first, ...rest] = [...byName.values()].toSorted((left, right) =>
    left.name < right.name ? -1 : 1,
  );

  return first === undefined
    ? nullOf({ cardinality: "record" })
    : { fields: [first, ...rest], kind: "record" };
};

/**
 * Whether two octet strings hold the same octets.
 *
 * @param left - One.
 * @param right - The other.
 * @returns Whether they are equal.
 */
const sameBytes = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length && left.every((octet, index) => octet === right[index]);

/**
 * Whether two scalars of a base type are the same value, one comparison per base type.
 */
type Sameness = { readonly [B in BaseType]: (left: Scalars[B], right: Scalars[B]) => boolean };

/**
 * Numbers by `===`, so NaN matches nothing and −0 matches 0.
 *
 * @param left - One number.
 * @param right - The other.
 * @returns Whether they are equal.
 */
const sameNumber = (left: bigint | number, right: bigint | number): boolean => left === right;

/**
 * Text by its code points.
 *
 * @param left - One text.
 * @param right - The other.
 * @returns Whether they are equal.
 */
const sameText = (left: Text, right: Text): boolean => left === right;

const sameness: Sameness = {
  boolean: (left, right) => left === right,
  directedPair: (left, right) => left.source === right.source && left.target === right.target,
  duration: sameNumber,
  file: (left, right) =>
    left.contentType === right.contentType &&
    left.name === right.name &&
    sameBytes(left.bytes, right.bytes),
  float: sameNumber,
  identifier: sameText,
  integer: sameNumber,
  pair: (left, right) =>
    (left.first === right.first && left.second === right.second) ||
    (left.first === right.second && left.second === right.first),
  point: (left, right) => left.x === right.x && left.y === right.y,
  string: sameText,
  uri: sameText,
};

/**
 * Whether two scalars of one base type are the same value, as `qti-match` compares members:
 * numbers by `===` (NaN matches nothing, −0 matches 0), a pair unordered, a file by its octets,
 * content type and name.
 *
 * @param base - The base type both scalars have.
 * @param left - One scalar.
 * @param right - The other.
 * @returns Whether they are the same.
 */
export const sameScalar = <B extends BaseType>(
  base: B,
  left: Scalars[B],
  right: Scalars[B],
): boolean => {
  const same: Sameness[B] = sameness[base];

  return same(left, right);
};

/**
 * The members of a container as singles of its base type, in order.
 *
 * @param value - The container.
 * @returns Its members.
 */
export const singlesOf = (value: Container): readonly Single[] => {
  switch (value.base) {
    case "boolean": {
      return value.values.map((member) => single(value.base, member));
    }
    case "directedPair": {
      return value.values.map((member) => single(value.base, member));
    }
    case "duration": {
      return value.values.map((member) => single(value.base, member));
    }
    case "file": {
      return value.values.map((member) => single(value.base, member));
    }
    case "float": {
      return value.values.map((member) => single(value.base, member));
    }
    case "identifier": {
      return value.values.map((member) => single(value.base, member));
    }
    case "integer": {
      return value.values.map((member) => single(value.base, member));
    }
    case "pair": {
      return value.values.map((member) => single(value.base, member));
    }
    case "point": {
      return value.values.map((member) => single(value.base, member));
    }
    case "string": {
      return value.values.map((member) => single(value.base, member));
    }
    case "uri": {
      return value.values.map((member) => single(value.base, member));
    }
  }
};
