/**
 * QTI values and NULL as the value model holds them: a base type, a cardinality and the values,
 * with the lexical parse and format of each base type and the equality `qti-match` uses. A record
 * is its own type, {@link RecordValue}: named fields, each a single, with no base type of its own.
 *
 * The session record and the form encoding both carry a {@link Value}, and a record
 * response's {@link RecordValue} beside it, so this module owns the one value representation, and
 * the one NCName rule.
 *
 * @module
 */
import { isNcName, trimmed } from "@qti-pie/crust/text.ts";
import { Data, Option, Result } from "effect";

/**
 * The base types the value model holds values of: every QTI base type, `file` included. A `file`
 * value is a {@link FileValue}, a file's name, size and type, never its bytes.
 */
export const modelledBaseTypes = [
  "identifier",
  "boolean",
  "integer",
  "float",
  "string",
  "point",
  "pair",
  "directedPair",
  "duration",
  "uri",
  "file",
] as const;

/**
 * A base type the value model holds values of.
 */
export type ModelledBaseType = (typeof modelledBaseTypes)[number];

/**
 * The cardinalities a {@link Value} holds. A record is its own type, {@link RecordValue}, since its
 * fields each carry their own base type.
 */
export const modelledCardinalities = ["single", "multiple", "ordered"] as const;

/**
 * Report whether the value model holds values of a base type: every QTI base type is one, so a
 * text outside the `base-type` list, such as `record`, is what it refuses.
 *
 * @param baseType A `base-type` attribute value.
 * @returns Whether `baseType` is a {@link ModelledBaseType}.
 */
export const isModelled = (baseType: string): baseType is ModelledBaseType =>
  modelledBaseTypes.some((name) => name === baseType);

/**
 * Read an `xs:normalizedString`'s text as its value: "All occurrences of #x9 (tab), #xA (line
 * feed) and #xD (carriage return) are replaced with #x20 (space)", nothing trimmed (XML Schema 1.0
 * Part 2, §4.3.6, whiteSpace `replace`). A `qti-value` is one, a `ValueDType`, which extends
 * `xs:normalizedString` (the ASI XSD), so its text is read through this before
 * {@link parseElementText} reads it (spec reading 7): a string value holds no tab or line break,
 * as pantry stores it. It is grizzle-text's `replaced`, the one implementation crust re-exports.
 */
export { replaced as replaceXmlSpace } from "@qti-pie/crust/text.ts";

/**
 * Remove outer XML whitespace from text: space, tab, carriage return and line feed, and no other
 * character, so a no-break space stays part of the value it pads. Element text sheds it before
 * {@link parseElementText} reads a value, and an XSD-typed attribute value before its lexical
 * check. It is grizzle-text's `trimmed`, the one implementation crust re-exports.
 */
export const trimXmlSpace = trimmed;

/**
 * Text made only of characters XML 1.0's `Char` production admits: tab, line feed, carriage
 * return, and every code point from U+0020 up except the surrogates, U+FFFE and U+FFFF. Under the
 * `u` flag a lone surrogate is a code point of its own, so it falls outside.
 */
const xmlText = /^[\t\n\r\u{20}-\u{D7FF}\u{E000}-\u{FFFD}\u{10000}-\u{10FFFF}]*$/u;

/**
 * Report whether XML can carry a text: whether every character of it is one XML 1.0's `Char`
 * production admits, so no document that holds it, as text or in an attribute, is ill-formed.
 *
 * A posted value, a stored value and a result's attributes are all written into XML in the end,
 * a result through crust's writer, which does not refuse the others, so the form codec, the value
 * codec and `results` check each with this on its way in.
 *
 * @example
 *   isXmlText("a\tb\n"); // true
 *   isXmlText("a\u0000b"); // false
 *
 * @param text The text.
 * @returns Whether every character is an XML `Char`: no control character other than tab, line
 *   feed and carriage return, no U+FFFE or U+FFFF, and no lone surrogate.
 * @see https://www.w3.org/TR/xml/#NT-Char
 */
export const isXmlText = (text: string): boolean => xmlText.test(text);

/**
 * Two runs of non-whitespace separated by XML whitespace: the lexical form of a pair, before each
 * side is checked as an NCName.
 */
const pairLexical = /^(?<source>[^\t\n\r ]+)[\t\n\r ]+(?<destination>[^\t\n\r ]+)$/u;

/**
 * The lexical form of a point: two integers, each as {@link integerLexical} writes one, separated
 * by XML whitespace, the horizontal coordinate first.
 *
 * QTI 3.0 calls a point an integer tuple and states no range for its coordinates, so each is held
 * exactly at any size, as an integer is (reading 45).
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Enumerated_BaseTypeEnum
 */
const pointLexical = /^(?<x>[+-]?[0-9]+)[\t\n\r ]+(?<y>[+-]?[0-9]+)$/u;

/**
 * The lexical space of a QTI integer, and of `xs:integer`: an optional sign and ASCII digits, as
 * many as written.
 *
 * QTI 3.0 states no range for its integer base type (the integer primitive type is "derived from
 * the decimal data-type"), so the value model holds every integer exactly, as a `bigint`
 * (reading 45).
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#AppA1
 * @see https://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#integer
 */
const integerLexical = /^[+-]?[0-9]+$/u;

/**
 * The lexical space of `xs:double` (XML Schema 1.0), which a QTI float uses: a decimal with an
 * optional exponent, `INF`, `-INF` or `NaN`.
 *
 * @see https://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#double
 */
const doubleLexical = /^(?:[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[Ee][+-]?[0-9]+)?|-?INF|NaN)$/u;

/**
 * A file as a record or a result holds it: its `name`, its `size` in bytes and its MIME `type`, the
 * empty string where none is known. Plate never holds the bytes, and stores, compares and reports
 * the file by these three fields alone. Plate's form posts no file, so a file value reaches plate
 * only through a stored record or text, which carries its name alone ({@link parseLexical}).
 */
export interface FileValue {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

/**
 * One QTI value, tagged by its base type: a string for `identifier`, `string` and `uri`; a
 * `bigint` for `integer`; a number for `float`; a boolean for `boolean`; two `bigint`s for `point`,
 * the horizontal coordinate first; two identifiers for `pair` and `directedPair`, the source
 * first; a number of seconds for `duration`; and a {@link FileValue} for `file`.
 *
 * An integer, and each coordinate of a point, is exact at any size. A float is an xs:double. A
 * duration is its seconds in an xs:double, never truncated, and written as a float is (readings 29
 * and 68). It is not numerical: no arithmetic takes one. A file's lexical form is its name alone:
 * {@link format} writes it and {@link parseLexical} reads it as a file with no bytes, since text
 * carries no size and no type. `SingleSchema` in `#plate/codec/values.ts` checks and encodes this
 * type at the boundaries.
 */
export type Single =
  | { readonly baseType: "identifier"; readonly value: string }
  | { readonly baseType: "boolean"; readonly value: boolean }
  | { readonly baseType: "integer"; readonly value: bigint }
  | { readonly baseType: "float"; readonly value: number }
  | { readonly baseType: "string"; readonly value: string }
  | { readonly baseType: "point"; readonly value: readonly [bigint, bigint] }
  | { readonly baseType: "pair"; readonly value: readonly [string, string] }
  | { readonly baseType: "directedPair"; readonly value: readonly [string, string] }
  | { readonly baseType: "duration"; readonly value: number }
  | { readonly baseType: "uri"; readonly value: string }
  | { readonly baseType: "file"; readonly value: FileValue };

/**
 * A QTI value of a modelled base type, as the session record and the form encoding carry it: a
 * base type, a cardinality and its values, none for NULL.
 *
 * NULL is `values: []` at any cardinality, because QTI treats an empty string and an empty
 * container as NULL; there is no other spelling of NULL, so an empty string is never one of the
 * values. A `single` holds at most one value, and every value carries the value's own base type.
 * `ValueSchema` in `#plate/codec/values.ts` checks these rules at the boundaries.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Variables
 */
export interface Value {
  readonly baseType: ModelledBaseType;
  readonly cardinality: (typeof modelledCardinalities)[number];
  readonly values: readonly Single[];
}

/**
 * One field of a {@link RecordValue}: its identifier, an NCName, and its value, a single of a
 * modelled base type. A NULL field is no field, so a field always holds a value.
 */
export interface RecordField {
  readonly identifier: string;
  readonly value: Single;
}

/**
 * A QTI value of cardinality `record`, as a record response holds it: its fields, each named once.
 *
 * A record has no base type of its own; each field carries its own. A NULL field is no field, and a
 * record with no field is NULL, so there is one spelling of NULL here too. The order of the fields
 * means nothing ({@link sameRecord}). `RecordValueSchema` in `#plate/codec/values.ts` checks these
 * rules at the boundaries.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Variables
 */
export interface RecordValue {
  readonly cardinality: "record";
  readonly fields: readonly RecordField[];
}

/**
 * The value a response holds: a {@link Value} of a modelled base type and cardinality, or a
 * {@link RecordValue}.
 */
export type ResponseValue = Value | RecordValue;

/**
 * The values a candidate gave an item, by response identifier, each value of base type integer an
 * exact `bigint`: a {@link Value} for a response of a modelled base type and cardinality, and a
 * {@link RecordValue} for a record response.
 */
export type Responses = Readonly<Record<string, ResponseValue>>;

/**
 * The value one single of a base type holds: an identifier's or a string's text, an integer's
 * `bigint`, a pair's two identifiers, a point's two coordinates.
 *
 * @template B The base type.
 */
export type ValueOf<B extends ModelledBaseType> = Extract<
  Single,
  { readonly baseType: B }
>["value"];

/**
 * A response of a base type as its declaration types it, which an island is handed in place of a
 * name: its identifier, its base type and its cardinality, none of its values. A module narrows
 * both to the binding it renders, so a Choice's is an `identifier` response of `single` or
 * `multiple`.
 *
 * @template B The base types it may have.
 * @template C The cardinalities it may have.
 */
export interface Declared<
  B extends ModelledBaseType = ModelledBaseType,
  C extends Value["cardinality"] = Value["cardinality"],
> {
  readonly baseType: B;
  readonly cardinality: C;
  readonly identifier: string;
}

/**
 * A record response as its declaration types it: its identifier, and the cardinality `record`,
 * since a record has no base type of its own.
 */
export interface RecordDeclared {
  readonly cardinality: "record";
  readonly identifier: string;
}

/**
 * Report whether a response's value is a record.
 *
 * @param value The value to test.
 * @returns Whether `value` is a {@link RecordValue}.
 */
export const isRecordValue = (value: ResponseValue): value is RecordValue =>
  value.cardinality === "record";

/**
 * Give the text a record was typed as: its `stringValue` field, which the string interaction bound
 * to it shows (QTI 3.0.1 information model 2.4.2.2: "stringValue - the string, as typed by the
 * candidate").
 *
 * @param record The record.
 * @returns Its `stringValue`, or none when it has no such field, as the NULL record has none.
 */
export const recordText = (record: RecordValue): readonly Single[] =>
  record.fields.flatMap(({ identifier, value }) => (identifier === "stringValue" ? [value] : []));

/**
 * Construct the NULL value of a base type and cardinality.
 *
 * @param baseType The value's base type.
 * @param cardinality The value's cardinality.
 * @returns The value with no values.
 */
export const nullOf = (baseType: ModelledBaseType, cardinality: Value["cardinality"]): Value => ({
  baseType,
  cardinality,
  values: [],
});

/**
 * The NULL record: a record with no field, since a NULL field is no field.
 */
export const nullRecord: RecordValue = { cardinality: "record", fields: [] };

/**
 * Report whether a value is NULL.
 *
 * @param value The value to test.
 * @returns Whether `value` holds no values.
 */
export const isNull = (value: Value): boolean => value.values.length === 0;

/**
 * Report whether a response's value is NULL: a {@link Value} with no values, or a record with no
 * field. QTI treats an empty string and an empty container as NULL, and the value model has no
 * other spelling of either: an empty string is no value (`ValueSchema` refuses one), and a NULL
 * field is no field. The one test of NULL every caller reads, `@qti-pie/plate` and
 * `@qti-pie/plate/ui/props` export it.
 *
 * @param value The value to test.
 * @returns Whether `value` holds nothing.
 */
export const isNullResponse = (value: ResponseValue): boolean =>
  isRecordValue(value) ? value.fields.length === 0 : isNull(value);

/**
 * Say what to write for a duration: its seconds as an xs:double, never an ISO 8601 duration. A
 * parse failure ({@link InvalidValue}) says it in these words.
 *
 * @param literal How to write each literal the words name, such as `90.5`: as given in a plain
 *   message, or in a code span in Markdown.
 * @returns The words, which follow "write".
 */
const durationForm = (literal: (text: string) => string): string =>
  `its seconds as a decimal or exponent number such as ${literal("90.5")}, or ${literal("INF")}, ${literal("-INF")} or ${literal("NaN")}, never an ISO 8601 duration such as ${literal("PT1M30.5S")}`;

/**
 * The lexical form each base type takes, in the words a parse failure uses to say what to write.
 */
const expected = {
  boolean: "true, false, 1 or 0",
  directedPair: "two NCNames separated by whitespace, such as A B",
  duration: durationForm((text) => text),
  file: "the file's name, such as photo.png, or none; its bytes are never written",
  float: "a decimal or exponent number such as 2.5 or 1E3, or INF, -INF or NaN",
  identifier: "an NCName: a letter or _ first, then letters, digits, -, _ or .",
  integer: "decimal digits with an optional sign, such as -12",
  pair: "two NCNames separated by whitespace, such as A B",
  point: "two integers separated by whitespace, x then y, such as 102 113",
  string: "any text",
  uri: "any text",
} satisfies Record<ModelledBaseType, string>;

/**
 * The failure of reading text as a value of a base type: the text is outside the base type's
 * lexical space. A document that holds it is invalid.
 */
export class InvalidValue extends Data.TaggedError("InvalidValue")<{
  readonly baseType: ModelledBaseType;
  readonly lexical: string;
}> {
  /**
   * The text and the lexical form its base type takes, in one line.
   */
  override get message(): string {
    return `${JSON.stringify(this.lexical)} is not a ${this.baseType} value; write ${expected[this.baseType]}`;
  }
}

/**
 * Give a value when a lexical check holds.
 *
 * @param holds Whether the text is in the base type's lexical space.
 * @param single The value the text names.
 * @returns `single` when `holds`, otherwise none.
 */
const valueIf = (holds: boolean, single: Single): Option.Option<Single> =>
  holds ? Option.some(single) : Option.none();

/**
 * Read text in xs:double's lexical space as its IEEE double, reading 144 ("A bounded `xs:double` is
 * judged on its IEEE value"): the literal rounded to the nearest double, ties to even, as XML
 * Schema 1.1's doubleLexicalMap reads it (Part 2, section 3.3.5.2). A magnitude past the midpoint
 * between the largest finite double and 2^1024, such as `1e400`, is an infinity of its sign; one
 * below 2^-1075, half the least subnormal, such as `1e-400`, is a zero of its sign. `INF` and
 * `-INF` are the infinities and `NaN` is NaN. `Number` rounds a decimal exactly so.
 *
 * Every `xs:double` literal plate reads is read so: a float and a duration value
 * ({@link parseLexical}), a bound and a float map key, as pantry reads them, so the two packages
 * read one literal one way.
 *
 * The lexical space is XML Schema 1.0's ({@link doubleLexical}), so `+INF`, `Infinity` and padded
 * text are outside it.
 *
 * @param lexical The text, as written; no whitespace is removed first.
 * @returns The double it names, or none when the text is outside xs:double's lexical space.
 * @see https://www.w3.org/TR/xmlschema11-2/#f-doubleLexmap
 */
export const readIeeeDouble = (lexical: string): Option.Option<number> => {
  if (!doubleLexical.test(lexical)) {
    return Option.none();
  }

  if (lexical === "INF") {
    return Option.some(Number.POSITIVE_INFINITY);
  }

  return Option.some(lexical === "-INF" ? Number.NEGATIVE_INFINITY : Number(lexical));
};

/**
 * Read a QTI integer lexical form as the exact integer it names, at any size.
 *
 * `BigInt` reads only text {@link integerLexical} has admitted, which it always accepts, so it
 * never throws.
 *
 * @param lexical The lexical form.
 * @returns The integer it names, or none when the text is not an integer.
 */
const readInteger = (lexical: string): Option.Option<Single> =>
  integerLexical.test(lexical)
    ? Option.some({ baseType: "integer", value: BigInt(lexical) })
    : Option.none();

/**
 * Read the lexical form of a point as its two exact coordinates: the one reading of a point's
 * text, which a point value and a Position Object's posted copies are both read by.
 *
 * `BigInt` reads only text {@link pointLexical} has admitted as an integer, which it always
 * accepts, so it never throws.
 *
 * @param lexical The lexical form, with no outer whitespace removed.
 * @returns The coordinates, x then y, or none when the text is not two integers separated by XML
 *   white space.
 */
export const pointCoordinates = (lexical: string): Option.Option<readonly [bigint, bigint]> => {
  const coordinates = pointLexical.exec(lexical)?.groups;
  const x = coordinates?.["x"];
  const y = coordinates?.["y"];

  return x === undefined || y === undefined ? Option.none() : Option.some([BigInt(x), BigInt(y)]);
};

/**
 * Read the lexical form of a point as a point value ({@link pointCoordinates}).
 *
 * @param lexical The lexical form, with no outer whitespace removed.
 * @returns The point, or none when the text is not two integers separated by XML white space.
 */
const readPoint = (lexical: string): Option.Option<Single> =>
  Option.map(pointCoordinates(lexical), (value): Single => ({ baseType: "point", value }));

/**
 * Read the lexical form of a pair or directed pair.
 *
 * @param baseType Which of the two to read.
 * @param lexical The lexical form, with no outer whitespace removed.
 * @returns The two identifiers in written order, or none when the text is not two NCNames
 *   separated by whitespace.
 */
const readPair = (baseType: "pair" | "directedPair", lexical: string): Option.Option<Single> => {
  const { destination, source } = pairLexical.exec(lexical)?.groups ?? {};

  return source !== undefined &&
    destination !== undefined &&
    isNcName(source) &&
    isNcName(destination)
    ? Option.some<Single>({ baseType, value: [source, destination] })
    : Option.none();
};

/**
 * Read the lexical form of a file: its name, as a result's `value` element and {@link format}
 * write one. Text names a file and nothing more, so the file it reads is known by name alone,
 * with no bytes: `size` 0 and `type` the empty string. QTI 3.0.1's file is "any sequence of octets
 * (bytes) qualified by a content-type and an optional filename" (information model, BaseTypeEnum),
 * so empty text is a file with no name, never a refusal.
 *
 * @param lexical The lexical form, with no outer whitespace removed.
 * @returns The file.
 */
const readFile = (lexical: string): Option.Option<Single> =>
  Option.some({ baseType: "file", value: { name: lexical, size: 0, type: "" } });

/**
 * How each base type reads its lexical form: the value it names, or none when the text is outside
 * the lexical space.
 *
 * A duration reads as a float does, its seconds in xs:double's lexical space: `90.5`, `INF`,
 * `-INF`, `NaN` and a negative are durations, and an ISO 8601 duration such as `PT1M30.5S` is
 * outside it (reading 68). A file reads as its name alone ({@link readFile}).
 */
const readers = {
  boolean: (lexical: string) =>
    valueIf(["true", "false", "1", "0"].includes(lexical), {
      baseType: "boolean",
      value: lexical === "true" || lexical === "1",
    }),
  directedPair: (lexical: string) => readPair("directedPair", lexical),
  duration: (lexical: string) =>
    Option.map(readIeeeDouble(lexical), (seconds): Single => ({
      baseType: "duration",
      value: seconds,
    })),
  file: readFile,
  float: (lexical: string) =>
    Option.map(readIeeeDouble(lexical), (number): Single => ({ baseType: "float", value: number })),
  identifier: (lexical: string) =>
    valueIf(isNcName(lexical), { baseType: "identifier", value: lexical }),
  integer: readInteger,
  pair: (lexical: string) => readPair("pair", lexical),
  point: readPoint,
  string: (lexical: string) => valueIf(true, { baseType: "string", value: lexical }),
  uri: (lexical: string) => valueIf(true, { baseType: "uri", value: lexical }),
} satisfies Record<ModelledBaseType, (lexical: string) => Option.Option<Single>>;

/**
 * Read text as a value of a base type, exactly as written.
 *
 * No whitespace is removed, so a padded attribute value is refused, as spec reading 7 rules for
 * typed values in attributes.
 *
 * A boolean is `xs:boolean`'s lexical space, `true`, `false`, `1` or `0`, `1` being `true` and `0`
 * `false` (reading 34). The QTI XSD does not decide: it types `qti-value` as `xs:normalizedString`
 * and `qti-base-value` as `xs:string`. The information model does: its boolean base type is "the
 * same as the set of values defined by the boolean primitiveType" (section 8.14, BaseTypeEnum),
 * which the binding types `xs:boolean` (XML Schema Part 2 §3.2.2.1, "{true, false, 1, 0}");
 * Appendix A1.3's "permitted values of "true" and "false"" is not normative (information model
 * §1.2), as `xsBooleanOf` in `#plate/model/attributes.ts` reads an attribute the XSD types so.
 *
 * @param baseType The base type to read.
 * @param lexical The text, as written.
 * @returns The value the text names, or a failure with {@link InvalidValue} when the text is
 *   outside the base type's lexical space.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Enumerated_BaseTypeEnum
 */
export const parseLexical = (
  baseType: ModelledBaseType,
  lexical: string,
): Result.Result<Single, InvalidValue> =>
  Result.fromOption(readers[baseType](lexical), () => new InvalidValue({ baseType, lexical }));

/**
 * Read the text content of an element, such as `qti-value`, as a value of a base type.
 *
 * Spec reading 7: outer XML whitespace is formatting for every base type but `string`, so it is
 * removed before the text is read, in time linear in the text; for `string` it is part of the
 * value. An empty `string` is NULL, not a value. A `qti-value`'s text is an `xs:normalizedString`,
 * read through {@link replaceXmlSpace} first; a `qti-base-value`'s is an `xs:string`, read as
 * written.
 *
 * @param baseType The base type to read.
 * @param text The element's text content, as written.
 * @returns The value the text names, none for NULL, or a failure with {@link InvalidValue} when
 *   the trimmed text is outside the base type's lexical space.
 */
export const parseElementText = (
  baseType: ModelledBaseType,
  text: string,
): Result.Result<Option.Option<Single>, InvalidValue> =>
  baseType === "string"
    ? Result.succeed(valueIf(text !== "", { baseType, value: text }))
    : Result.map(parseLexical(baseType, trimXmlSpace(text)), Option.some);

/**
 * Write a float in the lexical space of xs:double.
 *
 * `String` already writes the shortest digits that read back to the same number, in a form
 * xs:double admits (`2.5`, `1e+21`); the infinities, NaN and negative zero are written by name.
 *
 * @param number The float to write.
 * @returns Its lexical form, which {@link parseLexical} reads back to the same number.
 */
const formatFloat = (number: number): string => {
  if (Number.isNaN(number)) {
    return "NaN";
  }

  if (number === Number.POSITIVE_INFINITY) {
    return "INF";
  }

  if (number === Number.NEGATIVE_INFINITY) {
    return "-INF";
  }

  return Object.is(number, -0) ? "-0" : String(number);
};

/**
 * Write a value in its base type's lexical form.
 *
 * `String` writes the exact decimal digits of an integer of any size, never an exponent: no `+`, no
 * leading zeros, and `0` for a written `-0`. A point's coordinates are written the same way. A
 * duration is written as its seconds, as a float is. A file is written as its name, the one field
 * text can carry: its size and type are the form's, so {@link parseLexical} reads the name back as a
 * file of that name alone.
 *
 * @param single The value to write.
 * @returns The lexical form, which {@link parseLexical} reads back to the same value, a file
 *   excepted; a pair is its two identifiers, and a point its two coordinates, separated by one
 *   space.
 */
export const format = (single: Single): string => {
  if (single.baseType === "boolean") {
    return single.value ? "true" : "false";
  }

  if (single.baseType === "file") {
    return single.value.name;
  }

  if (single.baseType === "integer") {
    return String(single.value);
  }

  if (single.baseType === "float" || single.baseType === "duration") {
    return formatFloat(single.value);
  }

  if (single.baseType === "point") {
    return `${String(single.value[0])} ${String(single.value[1])}`;
  }

  if (single.baseType === "pair" || single.baseType === "directedPair") {
    return `${single.value[0]} ${single.value[1]}`;
  }

  return single.value;
};

/**
 * Report whether two singles are equal, as {@link match} compares two single values.
 *
 * @param left One single.
 * @param right The other single.
 * @returns Whether they share a base type and are equal: a `pair` in either order, a
 *   `directedPair` in order, a `point` when both coordinates are equal, a `file` when its name,
 *   size and type are each equal, integers, floats and durations by value (`===` compares two
 *   bigints by value) and strings by code point.
 */
export const sameSingle = (left: Single, right: Single): boolean => {
  if (left.baseType === "file" && right.baseType === "file") {
    return (
      left.value.name === right.value.name &&
      left.value.size === right.value.size &&
      left.value.type === right.value.type
    );
  }

  if (left.baseType === "pair" && right.baseType === "pair") {
    const [a, b] = left.value;
    const [c, d] = right.value;

    return (a === c && b === d) || (a === d && b === c);
  }

  if (left.baseType === "directedPair" && right.baseType === "directedPair") {
    return left.value[0] === right.value[0] && left.value[1] === right.value[1];
  }

  if (left.baseType === "point" && right.baseType === "point") {
    return left.value[0] === right.value[0] && left.value[1] === right.value[1];
  }

  return left.baseType === right.baseType && left.value === right.value;
};

/**
 * Give a record's fields by identifier, in linear time. A record names each identifier once
 * (`RecordValueSchema` refuses one that does not).
 *
 * @param record The record.
 * @returns Each field's value by its identifier.
 */
const fieldsOf = (record: RecordValue): ReadonlyMap<string, Single> =>
  new Map(record.fields.map((field) => [field.identifier, field.value]));

/**
 * Report whether two records hold the same fields, in any order.
 *
 * @param left One record.
 * @param right The other record.
 * @returns Whether they name the same set of identifiers and, for each, fields of one base type
 *   that are equal as {@link sameSingle} compares them. Two NULL records name no identifier, so
 *   they are the same; `qti-match`'s NULL rule is its caller's.
 */
export const sameRecord = (left: RecordValue, right: RecordValue): boolean => {
  const leftFields = fieldsOf(left);
  const rightFields = fieldsOf(right);

  return (
    leftFields.size === rightFields.size &&
    [...leftFields].every(([identifier, single]) => {
      const other = rightFields.get(identifier);

      return other !== undefined && sameSingle(single, other);
    })
  );
};

/**
 * Report whether two equally long lists hold the same values as multisets.
 *
 * @param left One list.
 * @param right The other list, of the same length.
 * @returns Whether each value of `left` pairs with its own equal value of `right`.
 */
const sameMultiset = (left: readonly Single[], right: readonly Single[]): boolean => {
  const unmatched = [...right];

  return left.every((single) => {
    const index = unmatched.findIndex((other) => sameSingle(single, other));
    if (index === -1) {
      return false;
    }

    unmatched.splice(index, 1);

    return true;
  });
};

/**
 * Report whether two values match, as `qti-match` and `match_correct` compare a response with its
 * correct response.
 *
 * The values must share a base type and a cardinality. `single` compares the one value, `multiple`
 * compares as a multiset (repeats count), and `ordered` as a sequence.
 *
 * @param left One value.
 * @param right The other value.
 * @returns Whether they match; false when either is NULL.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#OpMatch
 */
export const match = (left: Value, right: Value): boolean => {
  if (
    isNull(left) ||
    isNull(right) ||
    left.baseType !== right.baseType ||
    left.cardinality !== right.cardinality ||
    left.values.length !== right.values.length
  ) {
    return false;
  }

  return left.cardinality === "multiple"
    ? sameMultiset(left.values, right.values)
    : left.values.every((single, index) => {
        const other = right.values[index];

        return other !== undefined && sameSingle(single, other);
      });
};

/**
 * Report whether a response's value is its default, as skipping and Results Reporting's answered
 * status read it: a value that matches it ({@link match}), or a record that holds the same fields
 * in any order ({@link sameRecord}). A value is never a record's default, nor a record a value's.
 *
 * @param value The value given, not NULL.
 * @param fallback The response's default.
 * @returns Whether `value` is `fallback`.
 */
export const atDefault = (value: ResponseValue, fallback: ResponseValue): boolean =>
  isRecordValue(value)
    ? isRecordValue(fallback) && sameRecord(value, fallback)
    : !isRecordValue(fallback) && match(value, fallback);

/**
 * Give the value a map of values holds by an identifier, read from the map's own keys only.
 *
 * The values come from plain objects, which inherit `Object.prototype`, and `constructor` or
 * `toString` is a valid identifier; reading only own keys keeps an inherited member from being
 * read as a value. A map the caller does not carry holds no value by any name.
 *
 * @param values The values, by identifier: a record's template values, outcomes or defaults.
 * @param identifier The identifier.
 * @returns The value, or none when the map holds none by that name.
 */
export const own = <A extends RecordValue | Value>(
  values: Readonly<Record<string, A>> | undefined,
  identifier: string,
): Option.Option<A> =>
  values !== undefined && Object.hasOwn(values, identifier)
    ? Option.fromUndefinedOr(values[identifier])
    : Option.none();
