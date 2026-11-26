/**
 * One canonical form of a recorded value, so two writers' lexical forms of one QTI value compare
 * equal: plate's `format` (the recording), the SQL grader's read-back (the served ledgers) and the
 * processing package's values, each written once into this form.
 *
 * - A float or duration is its IEEE double: `-0` and `0` are two forms (QTI 3.0.1 grades them equal,
 *   but a recorded `-0` that becomes `0` is a moved value to rule on), NaN one, and every decimal
 *   spelling of one double one form (`1`, `1.0` and `1e0`).
 * - An integer is its exact decimal, a leading `+` and leading zeros dropped.
 * - A point and a directed pair are their two parts, whitespace-separated; a pair (QTI's unordered
 *   pair) its two identifiers sorted.
 * - A multiple value is its singles sorted (a bag has no order); an ordered value keeps its places.
 *
 * A form that does not read as its base type is kept whole behind a `!`, so it compares equal only
 * to the same malformed text and shows in a difference as what it is.
 *
 * @module
 */
import { regex } from "arkregex";
import type { RecordedValue, RecordedValues } from "#processing-oracle/recording.ts";

/**
 * XML Schema's decimal and double lexical forms, short of the named ones.
 */
const decimalForm = regex("^[+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)(?:[eE][+-]?[0-9]+)?$", "u");

/**
 * An integer's lexical form.
 */
const integerForm = regex("^[+-]?[0-9]+$", "u");

/**
 * XML Schema's whitespace, which separates a two-part single's parts.
 */
const whitespace = regex("[ \\t\\n\\r]+", "u");

/**
 * XML Schema's named doubles, each by its lexical forms.
 */
const namedDoubles: ReadonlyMap<string, number> = new Map([
  ["+INF", Number.POSITIVE_INFINITY],
  ["-INF", Number.NEGATIVE_INFINITY],
  ["INF", Number.POSITIVE_INFINITY],
  ["NaN", Number.NaN],
]);

/**
 * Read a float's lexical form (XML Schema's `double`: a decimal, `INF`, `-INF` or `NaN`) to its
 * double, or undefined for a form that is none.
 *
 * @param text The lexical form.
 * @returns The double.
 */
export const doubleOf = (text: string): number | undefined => {
  const trimmed = text.trim();

  return namedDoubles.get(trimmed) ?? (decimalForm.test(trimmed) ? Number(trimmed) : undefined);
};

/**
 * A double's one form: the shortest decimal that reads back to it (ECMAScript's Number::toString),
 * `-0` kept, and QTI's names for the infinities and NaN.
 *
 * @param double The double.
 * @returns Its form.
 */
const doubleForm = (double: number): string => {
  if (Number.isNaN(double)) {
    return "NaN";
  }

  if (!Number.isFinite(double)) {
    return double > 0 ? "INF" : "-INF";
  }

  return Object.is(double, -0) ? "-0" : String(double);
};

/**
 * The parts of a two-part single (a point, a pair, a directed pair), split at whitespace.
 *
 * @param text The lexical form.
 * @returns Its parts.
 */
const partsOf = (text: string): readonly string[] =>
  text
    .trim()
    .split(whitespace)
    .filter((part) => part.length > 0);

/**
 * A malformed form, kept whole.
 *
 * @param text The text.
 * @returns Its form.
 */
const malformed = (text: string): string => `!${text}`;

/**
 * A float's or duration's form.
 *
 * @param text The lexical form.
 * @returns Its form.
 */
const floatForm = (text: string): string => {
  const double = doubleOf(text);

  return double === undefined ? malformed(text) : doubleForm(double);
};

/**
 * An integer's form.
 *
 * @param text The lexical form.
 * @returns Its form.
 */
const integerOf = (text: string): string => {
  const trimmed = text.trim();

  return integerForm.test(trimmed) ? BigInt(trimmed).toString() : malformed(text);
};

/**
 * XML Schema's boolean lexical forms, each by its value.
 */
const booleanForms: ReadonlyMap<string, string> = new Map([
  ["0", "false"],
  ["1", "true"],
  ["false", "false"],
  ["true", "true"],
]);

/**
 * A two-part single's form: its two parts, each written by `part`, sorted for an unordered pair.
 *
 * @param text The lexical form.
 * @param part Each part's form.
 * @param unordered Whether the parts are unordered (QTI's pair).
 * @returns Its form.
 */
const twoPartForm = (text: string, part: (text: string) => string, unordered: boolean): string => {
  const parts = partsOf(text).map(part);

  return parts.length === 2 ? (unordered ? parts.toSorted() : parts).join(" ") : malformed(text);
};

/**
 * Each base type's single form.
 */
const singleForms: Readonly<Record<RecordedValue["baseType"], (text: string) => string>> = {
  boolean: (text) => booleanForms.get(text.trim()) ?? malformed(text),
  directedPair: (text) => twoPartForm(text, (part) => part, false),
  duration: floatForm,
  file: (text) => text,
  float: floatForm,
  identifier: (text) => text,
  integer: integerOf,
  pair: (text) => twoPartForm(text, (part) => part, true),
  point: (text) => twoPartForm(text, integerOf, false),
  string: (text) => text,
  uri: (text) => text,
};

/**
 * One single's canonical form, by its base type.
 *
 * @param baseType The base type.
 * @param text The single's lexical form.
 * @returns Its canonical form.
 */
export const singleForm = (baseType: RecordedValue["baseType"], text: string): string =>
  singleForms[baseType](text);

/**
 * A recorded value's canonical form: its base type, cardinality and singles' forms, a multiple's
 * sorted. A NULL value (no singles) of any shape keeps its shape.
 *
 * @param value The value.
 * @returns Its canonical form.
 */
export const valueForm = (value: RecordedValue): RecordedValue => {
  const values = value.values.map((text) => singleForm(value.baseType, text));

  return {
    baseType: value.baseType,
    cardinality: value.cardinality,
    values: value.cardinality === "multiple" ? values.toSorted() : values,
  };
};

/**
 * Recorded values' canonical forms, by variable.
 *
 * @param values The values.
 * @returns Their canonical forms.
 */
export const valuesForm = (values: RecordedValues): RecordedValues =>
  Object.fromEntries(Object.entries(values).map(([name, value]) => [name, valueForm(value)]));
