/**
 * The Schema codecs of the value model, for the server and the boundaries,
 * `@qti-pie/plate/codec`: {@link SingleSchema}, {@link ValueSchema} and {@link RecordValueSchema}
 * check, encode and decode the plain {@link Single}, {@link Value} and {@link RecordValue} types of
 * `#plate/model/values.ts`, {@link ResponseValueSchema} a response's value of either kind, and
 * {@link PostedResponses} the body an item posts: its responses by identifier, each typed as its
 * declaration types it.
 *
 * It is the one codec of a posted answer. An item's islands hold typed values in the host's state
 * (`Held`, `@qti-pie/plate/ui/client`), the host encodes what the state's contract gives it to post
 * (`savedOf`, `answerOf`) with {@link PostedResponses}, and every server that takes a post (edullm's
 * QTI app, metis) decodes it once at its boundary with the same Schema, so no server reads an item,
 * a start record or anything else to decode a post. It loads only `effect` and crust's text rules.
 * Plate's own page modules load no Schema, so the host's code encodes, never an island.
 *
 * @module
 */
import { Array as Arr, Option, Schema, SchemaTransformation } from "effect";
import { isNcName } from "@qti-pie/crust/text.ts";
import { isXmlText, modelledBaseTypes, modelledCardinalities } from "#plate/model/values.ts";
import type { RecordValue, Responses, Single, Value } from "#plate/model/values.ts";

/**
 * An identifier as a Schema: a string that is an NCName.
 */
const IdentifierText = Schema.String.check(
  Schema.makeFilter((text: string) =>
    isNcName(text) ? undefined : "an identifier must be an NCName; start it with a letter or _",
  ),
);

/**
 * A string or a URI as a Schema: text whose every character XML can carry, since a stored value
 * may be written into a result. It refuses what `decode` refuses of a posted string.
 */
const XmlText = Schema.String.check(
  Schema.makeFilter((text: string) =>
    isXmlText(text)
      ? undefined
      : "this text holds a character XML cannot carry; remove each control character other than tab, line feed and carriage return, each U+FFFE and U+FFFF, and each lone surrogate",
  ),
);

/**
 * The names the stored form writes for the floats a JSON number cannot carry: xs:double's names for
 * the infinities and NaN, as `formatFloat` writes them, and `-0`, because `JSON.stringify` writes
 * negative zero as `0`.
 */
const FloatNames = Schema.Literals(["INF", "-INF", "NaN", "-0"]);

/**
 * Decide whether a stored float is one of {@link FloatNames} rather than a number.
 */
const isFloatName = Schema.is(FloatNames);

/**
 * The float each of {@link FloatNames} names.
 */
const namedFloats: Readonly<Record<typeof FloatNames.Type, number>> = {
  "-0": -0,
  "-INF": Number.NEGATIVE_INFINITY,
  INF: Number.POSITIVE_INFINITY,
  NaN: Number.NaN,
};

/**
 * A check that a number the stored form writes as a JSON number is not negative zero, the number
 * `JSON.parse("-0")` gives: zero has one spelling, `0`, and negative zero, where it is a value of
 * its own, is written by name (spec reading 247).
 *
 * @param issue What to change, in words, when the number is negative zero.
 * @returns The check.
 */
const isNotNegativeZero = (issue: string) =>
  Schema.makeFilter((number: number) => (Object.is(number, -0) ? issue : undefined));

/**
 * A float the stored form writes as a JSON number: a finite number other than negative zero, which
 * only its name `"-0"` writes, so the number `-0` is no second spelling of it.
 */
const FloatNumber = Schema.Finite.check(
  isNotNegativeZero('negative zero is written by name; write "-0"'),
);

/**
 * A float as a Schema whose encoded form survives JSON text: a finite number other than negative
 * zero stays a number ({@link FloatNumber}), and the infinities, NaN and negative zero are written
 * by name. The decode reads exactly what the encode writes, the four names and those numbers, so a
 * stored value has one spelling.
 */
const FloatFromJson = Schema.Union([FloatNumber, FloatNames]).pipe(
  Schema.decodeTo(
    Schema.Number,
    SchemaTransformation.transform({
      decode: (stored) => (isFloatName(stored) ? namedFloats[stored] : stored),
      encode: (number) =>
        Option.getOrElse(
          Arr.findFirst(FloatNames.literals, (name) => Object.is(namedFloats[name], number)),
          () => number,
        ),
    }),
  ),
);

/**
 * An integer's stored form: its canonical decimal digits, `0` or an optional `-` and digits whose
 * first is not `0`, as `String` writes a `bigint` and XML Schema writes an integer canonically
 * (Part 2, section 3.3.13.2). The decimal of each integer is one text, so `+7`, `007`, ` 7` and
 * `-0` are none.
 */
const canonicalInteger = /^(?:0|-?[1-9][0-9]*)$/u;

/**
 * An integer as a Schema whose encoded form is its canonical decimal digits ({@link
 * canonicalInteger}): the encode writes what `String` writes of the `bigint`, and the decode reads
 * that form and no other, so a stored or posted integer has one spelling, as a float has ({@link
 * FloatFromJson}). It decodes plate's own output, a value the host already holds as an integer,
 * never text a candidate typed: a box's text is read by `readTyped`, which reads QTI's lexical
 * space, `+7`, `007` and ` 7` among it, before any value is posted (spec reading 247).
 */
const IntegerFromDigits = Schema.String.check(
  Schema.makeFilter((digits: string) =>
    canonicalInteger.test(digits)
      ? undefined
      : "an integer is written as its decimal digits, with no + sign, no leading zero, no white space and 0 for zero: write 7 for +7 or 007, and 0 for -0",
  ),
).pipe(Schema.decodeTo(Schema.BigInt, SchemaTransformation.bigintFromString));

/**
 * A MIME type as a posted file reports it: `type/subtype`, each a token of RFC 2045's `token`
 * production, with no parameters, in any case; or the empty string, which a browser reports for a
 * file whose type it does not know. A `File`'s `type` is one of these two and nothing else.
 *
 * @see https://www.rfc-editor.org/rfc/rfc2045#section-5.1
 */
const mimeType = /^(?:[!#$%&'*+\-.^_`|~0-9A-Za-z]+\/[!#$%&'*+\-.^_`|~0-9A-Za-z]+)?$/u;

/**
 * A posted file's metadata as a Schema; its type is `FileValue`. The name holds only characters XML
 * can carry, since a result writes it; the size is a count of bytes, a non-negative safe integer
 * whose zero is `0`, never the number `-0`; the type is a MIME type or the empty string ({@link
 * mimeType}). No field holds a byte of the file.
 */
const FileValueSchema = Schema.Struct({
  name: XmlText,
  size: Schema.Int.check(
    Schema.isGreaterThanOrEqualTo(0),
    isNotNegativeZero("a file's size is a count of bytes; write 0 for -0"),
  ),
  type: Schema.String.check(
    Schema.makeFilter((text: string) =>
      mimeType.test(text)
        ? undefined
        : "a file's type must be a MIME type such as image/png, or empty when the browser reports none",
    ),
  ),
});

/**
 * The Schema of one QTI value, tagged by its base type; its type is {@link Single}.
 *
 * An integer is exact at any size. Its encoded form is its canonical decimal digits ({@link
 * IntegerFromDigits}), which `parseLexical` reads to the same value, so a value decoded from a
 * record is one the parser could have read. A point is two such integers, x then y, each encoded as
 * its canonical decimal digits. A string or a URI holds only characters XML can carry. A float is
 * an xs:double. Its encoded form is a JSON number when it is finite and not negative zero, and
 * otherwise `"INF"`, `"-INF"`, `"NaN"` or `"-0"`, so `JSON.stringify` keeps every float. A file is
 * its name, size and type ({@link FileValueSchema}), never its bytes.
 */
const SingleSchema = Schema.Union([
  Schema.Struct({ baseType: Schema.Literal("identifier"), value: IdentifierText }),
  Schema.Struct({ baseType: Schema.Literal("boolean"), value: Schema.Boolean }),
  Schema.Struct({ baseType: Schema.Literal("integer"), value: IntegerFromDigits }),
  Schema.Struct({ baseType: Schema.Literal("float"), value: FloatFromJson }),
  Schema.Struct({ baseType: Schema.Literal("string"), value: XmlText }),
  Schema.Struct({
    baseType: Schema.Literal("point"),
    value: Schema.Tuple([IntegerFromDigits, IntegerFromDigits]),
  }),
  Schema.Struct({
    baseType: Schema.Literal("pair"),
    value: Schema.Tuple([IdentifierText, IdentifierText]),
  }),
  Schema.Struct({
    baseType: Schema.Literal("directedPair"),
    value: Schema.Tuple([IdentifierText, IdentifierText]),
  }),
  Schema.Struct({ baseType: Schema.Literal("duration"), value: FloatFromJson }),
  Schema.Struct({ baseType: Schema.Literal("uri"), value: XmlText }),
  Schema.Struct({ baseType: Schema.Literal("file"), value: FileValueSchema }),
]);

/**
 * Report what is wrong with one value of a {@link Value}.
 *
 * @param value The value that holds `single`.
 * @param single The value to check.
 * @returns The problem in words that say what to change, or none when `single` fits.
 */
const misfit = (value: Value, single: Single): Option.Option<string> => {
  if (single.baseType !== value.baseType) {
    return Option.some(
      `this value has base type ${single.baseType} inside a ${value.baseType} value; give it base type ${value.baseType}`,
    );
  }

  return single.baseType === "string" && single.value === ""
    ? Option.some("an empty string is NULL, not a value; remove it, so NULL is no values")
    : Option.none();
};

/**
 * The Schema of a QTI value of a modelled base type, as the session record carries it; its type is
 * {@link Value}.
 *
 * NULL is `values: []` at any cardinality, because QTI treats an empty string and an empty
 * container as NULL; there is no other spelling of NULL, so the Schema refuses an empty string. A
 * `single` holds at most one value, and every value carries the value's own base type.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Variables
 */
export const ValueSchema = Schema.Struct({
  baseType: Schema.Literals(modelledBaseTypes),
  cardinality: Schema.Literals(modelledCardinalities),
  values: Schema.Array(SingleSchema),
}).check(
  Schema.makeFilter((value) => {
    const misfits: Schema.FilterIssue[] = value.values.flatMap((single, index) =>
      Option.match(misfit(value, single), {
        onNone: () => [],
        onSome: (issue) => [{ issue, path: ["values", index] }],
      }),
    );

    return value.cardinality === "single" && value.values.length > 1
      ? [
          ...misfits,
          {
            issue: `a single value holds at most one value, not ${String(value.values.length)}; keep one, or none for NULL`,
            path: ["values"],
          },
        ]
      : misfits;
  }),
);

/**
 * One field of a record as a Schema; its type is `RecordField`. Its identifier's rules are the
 * record's ({@link recordMisfits}), since one of them, that no identifier repeats, reads every
 * field.
 */
const RecordFieldSchema = Schema.Struct({ identifier: Schema.String, value: SingleSchema });

/**
 * Report what is wrong with each field of a record: an identifier that is not an NCName, an
 * identifier an earlier field names, or a value that is the empty string, which is NULL, and a NULL
 * field is no field. It reads each field once, keeping the identifiers seen, so the time is linear
 * in the number of fields.
 *
 * @param record The record.
 * @returns Each problem in words that say what to change, with the path to its field.
 */
const recordMisfits = (record: RecordValue): Schema.FilterIssue[] => {
  const seen = new Set<string>();
  const misfits: Schema.FilterIssue[] = [];
  for (const [index, field] of record.fields.entries()) {
    const named = JSON.stringify(field.identifier);
    if (!isNcName(field.identifier)) {
      misfits.push({
        issue: `the field identifier ${named} is not an NCName; start it with a letter or _, then use letters, digits, -, _ or .`,
        path: ["fields", index, "identifier"],
      });
    }

    if (seen.has(field.identifier)) {
      misfits.push({
        issue: `the field identifier ${named} is named by an earlier field too; keep one field of each identifier`,
        path: ["fields", index, "identifier"],
      });
    }

    if (field.value.baseType === "string" && field.value.value === "") {
      misfits.push({
        issue: `the field ${named} holds an empty string, which is NULL, and a NULL field is no field; remove the field`,
        path: ["fields", index, "value"],
      });
    }

    seen.add(field.identifier);
  }

  return misfits;
};

/**
 * The Schema of a record value, as a record response holds it; its type is {@link RecordValue}.
 *
 * Each field is an identifier and a single of a modelled base type, encoded as {@link SingleSchema}
 * encodes a single, so an integer of any size stays exact and a float JSON has no number for is
 * written by name. The record's rules are checks on its type, so decoding and encoding refuse the
 * same records: each identifier is an NCName, no identifier is named twice, and no field holds the
 * empty string, since a NULL field is no field. A record with no field is NULL.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Variables
 */
export const RecordValueSchema = Schema.Struct({
  cardinality: Schema.Literal("record"),
  fields: Schema.Array(RecordFieldSchema),
}).check(Schema.makeFilter(recordMisfits));

/**
 * The Schema of a response's value, a {@link Value} or a {@link RecordValue}, told apart by the
 * cardinality; its type is `ResponseValue`.
 */
export const ResponseValueSchema = Schema.Union([ValueSchema, RecordValueSchema]);

/**
 * The Schema of the body an item posts, plate's `Responses`: a JSON object keyed by response
 * identifier, an NCName, which it refuses any other key as (a record Schema's key Schema drops a
 * key it refuses, so the check is the whole body's), each value the response's value in its
 * declared cardinality and base type, encoded as {@link ResponseValueSchema} encodes one, so an
 * integer of any size is its decimal digits and a float JSON has no number for is written by name.
 *
 * The body holds every response the page shows, its value as the child left it, NULL as no values
 * (a record as no field), and every End Attempt response of the item, `false` but for the one whose
 * press ended the attempt, `true` (QTI 3.0.1 information model §5.45: "If response processing is
 * invoked in any other way ... then the associated response variable is set to 'false'"; `answerOf`
 * in `#plate/held.ts`). A response the body does not name is one the page does not show, which the
 * database leaves as it holds it. The database holds each value to its declaration's cardinality
 * and base type, so a value of another type is a broken contract its write dies on, never a state a
 * server handles.
 *
 * @example
 *   Schema.decodeUnknownEffect(PostedResponses)({
 *     RESPONSE: {
 *       baseType: "integer",
 *       cardinality: "single",
 *       values: [{ baseType: "integer", value: "42" }],
 *     },
 *   });
 *   // { RESPONSE: { baseType: "integer", cardinality: "single", values: [{ baseType: "integer", value: 42n }] } }
 */
export const PostedResponses: Schema.Codec<
  Responses,
  Readonly<Record<string, (typeof ResponseValueSchema)["Encoded"]>>
> = Schema.Record(Schema.String, ResponseValueSchema).check(
  Schema.makeFilter((responses) =>
    Object.keys(responses).flatMap((identifier): Schema.FilterIssue[] =>
      isNcName(identifier)
        ? []
        : [
            {
              issue: `the response identifier ${JSON.stringify(identifier)} is not an NCName; post each response under its declaration's identifier`,
              path: [identifier],
            },
          ],
    ),
  ),
);
