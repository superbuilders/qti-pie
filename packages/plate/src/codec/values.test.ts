import { assert, describe, expectTypeOf, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, boolean, element, int, oneOf } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { regex } from "arkregex";
import {
  Array as Arr,
  Duration,
  Effect,
  Formatter,
  Option,
  Predicate,
  Result,
  Schema,
} from "effect";
import {
  PostedResponses,
  RecordValueSchema,
  ResponseValueSchema,
  ValueSchema,
} from "#plate/codec/values.ts";
import { modelledBaseTypes, modelledCardinalities, nullOf } from "#plate/model/values.ts";
import { isRecordValue } from "#plate/model/record-value.ts";
import type {
  ModelledBaseType,
  RecordValue,
  Responses,
  ResponseValue,
  Single,
  Value,
} from "#plate/model/values.ts";
import { boxHolds } from "#plate/test/box.ts";

/**
 * Read a value back as a host hands it back after storing it as JSON text: written as JSON and the
 * text decoded as JSON, so what JSON cannot write, and a structured clone would keep, is gone.
 */
const storedAsJson = (value: Schema.Json): Schema.Json =>
  Schema.decodeUnknownSync(Schema.fromJsonString(Schema.Json))(JSON.stringify(value));

/**
 * Construct a value for a test.
 *
 * @param baseType The value's base type.
 * @param cardinality The value's cardinality.
 * @param values Its values.
 * @returns The value.
 */
const value = (
  baseType: ModelledBaseType,
  cardinality: Value["cardinality"],
  values: readonly Single[],
): Value => ({ baseType, cardinality, values });

/**
 * Construct identifier values for a test.
 *
 * @param names The identifiers, in order.
 * @returns One identifier value for each name.
 */
const identifiers = (...names: readonly string[]): readonly Single[] =>
  names.map((name) => ({ baseType: "identifier", value: name }));

/**
 * Construct untyped input for {@link ValueSchema}, with cardinality `single`.
 *
 * @param baseType The input's base type, possibly not a modelled one.
 * @param values Its values, possibly not ones the base type holds.
 * @returns The input object.
 */
const singleInput = (baseType: string, values: readonly object[]) => ({
  baseType,
  cardinality: "single",
  values,
});

/**
 * Decide whether {@link ValueSchema} decodes a single value of a base type whose encoded value is
 * as given.
 *
 * @param baseType The value's base type.
 * @param written The encoded value of its one single.
 * @returns Whether the decode succeeds.
 */
const decodesSingle = (baseType: string, written: Schema.Json): boolean =>
  Result.isSuccess(
    Schema.decodeUnknownResult(ValueSchema)(singleInput(baseType, [{ baseType, value: written }])),
  );

/**
 * Decode a single value of a base type whose encoded value is as given, and read its values.
 *
 * @param baseType The value's base type.
 * @param written The encoded value of its one single.
 * @returns The values it decodes to; none when the decode fails.
 */
const decodedSingles = (baseType: string, written: Schema.Json): Option.Option<readonly Single[]> =>
  Result.getSuccess(
    Result.map(
      Schema.decodeUnknownResult(ValueSchema)(
        singleInput(baseType, [{ baseType, value: written }]),
      ),
      (decoded) => decoded.values,
    ),
  );

/**
 * How long one case of a search here may run before it is stopped and reported.
 */
const caseHang = Duration.seconds(30);

/**
 * What a case of a decoding box reaches: its input decoded, or refused.
 */
const DECODINGS = ["decoded", "refused"] as const;

/**
 * A {@link DECODINGS} member.
 */
type Decoding = (typeof DECODINGS)[number];

/**
 * The member of {@link DECODINGS} a case reaches.
 *
 * @param decodes Whether its input decodes.
 * @returns What it reaches.
 */
const decoding = (decodes: boolean): Decoding => (decodes ? "decoded" : "refused");

/**
 * The singles of one base type, at least one.
 */
type SinglesOf<B extends ModelledBaseType> = readonly [
  Extract<Single, { readonly baseType: B }>,
  ...Extract<Single, { readonly baseType: B }>[],
];

/**
 * The values the round-trip box is written with, for each base type the value model holds: an
 * identifier of each kind of name character; both booleans; zero, a negative and integers past the
 * safe integers either way, which only digits keep; an ordinary float, a vast one and every float a
 * JSON number cannot carry, the infinities, NaN and negative zero; text with outer spaces, line
 * ends and an astral character; points at the origin and past the safe integers; pairs in either
 * order and of one identifier twice; durations of each kind a float has; URIs of a query, a space
 * and a fragment; and files at either end of a size.
 */
const ROUND_TRIP_SINGLES = {
  boolean: [
    { baseType: "boolean", value: true },
    { baseType: "boolean", value: false },
  ],
  directedPair: [
    { baseType: "directedPair", value: ["A", "B"] },
    { baseType: "directedPair", value: ["A", "A"] },
  ],
  duration: [
    { baseType: "duration", value: 90.5 },
    { baseType: "duration", value: -1.5 },
    { baseType: "duration", value: Number.POSITIVE_INFINITY },
    { baseType: "duration", value: Number.NaN },
    { baseType: "duration", value: -0 },
  ],
  file: [
    { baseType: "file", value: { name: "a.png", size: 0, type: "image/png" } },
    { baseType: "file", value: { name: "", size: Number.MAX_SAFE_INTEGER, type: "" } },
  ],
  float: [
    { baseType: "float", value: 2.5 },
    { baseType: "float", value: -1e300 },
    { baseType: "float", value: Number.POSITIVE_INFINITY },
    { baseType: "float", value: Number.NEGATIVE_INFINITY },
    { baseType: "float", value: Number.NaN },
    { baseType: "float", value: -0 },
  ],
  identifier: [
    { baseType: "identifier", value: "A" },
    { baseType: "identifier", value: "_b" },
    { baseType: "identifier", value: "c-1.d" },
  ],
  integer: [
    { baseType: "integer", value: 0n },
    { baseType: "integer", value: -7n },
    { baseType: "integer", value: 2n ** 53n + 1n },
    { baseType: "integer", value: -(10n ** 30n) },
  ],
  pair: [
    { baseType: "pair", value: ["A", "B"] },
    { baseType: "pair", value: ["B", "A"] },
  ],
  point: [
    { baseType: "point", value: [0n, 0n] },
    { baseType: "point", value: [102n, -(2n ** 53n + 1n)] },
  ],
  string: [
    { baseType: "string", value: " a " },
    { baseType: "string", value: "a\tb\nc\rd" },
    { baseType: "string", value: "\u{1F600}" },
  ],
  uri: [
    { baseType: "uri", value: "http://a/b?c=d" },
    { baseType: "uri", value: "a b.png" },
    { baseType: "uri", value: "#q1" },
  ],
} as const satisfies { readonly [B in ModelledBaseType]: SinglesOf<B> };

/**
 * Draw a value of the round-trip box: a base type the value model holds, a cardinality it holds,
 * and up to one of that base type's {@link ROUND_TRIP_SINGLES} in a single, up to two in a multiple
 * or an ordered, none being NULL.
 */
const roundTripValue: Gen<Value> = (source) => {
  const baseType = source.draw(element(modelledBaseTypes));
  const cardinality = source.draw(element(modelledCardinalities));
  const singles: readonly [Single, ...Single[]] = ROUND_TRIP_SINGLES[baseType];

  return {
    baseType,
    cardinality,
    values: source.draw(array(element(singles), { max: cardinality === "single" ? 1 : 2, min: 0 })),
  };
};

/**
 * How many values {@link roundTripValue} draws: for each base type of `k` singles, `1 + k` singles
 * and `1 + k + k²` values of each of the two containers.
 */
const ROUND_TRIP_VALUES = Arr.reduce(modelledBaseTypes, 0, (sum, baseType) => {
  const k = ROUND_TRIP_SINGLES[baseType].length;

  return sum + (1 + k) + 2 * (1 + k + k ** 2);
});

/**
 * The integer a text is the canonical representation of, read apart from the codec, character by
 * character. XML Schema 1.0 writes an integer as decimal digits (#x30-#x39) with an optional sign
 * (Part 2 section 3.3.13.1), and canonically with no `+` and no leading zero (section 3.3.13.2), so
 * zero is `0` alone; spec reading `integer-lexical` makes that the stored form. Such a text is one
 * ECMAScript's `BigInt` reads, as the integer it names.
 *
 * @param text The text.
 * @returns The integer; none when the text is no canonical integer.
 */
const integerNamed = (text: string): Option.Option<bigint> => {
  const digits = text.startsWith("-") ? text.slice(1) : text;
  const isDigits =
    digits !== "" && Arr.fromIterable(digits).every((digit) => digit >= "0" && digit <= "9");

  return text === "0" || (isDigits && !digits.startsWith("0"))
    ? Option.some(BigInt(text))
    : Option.none();
};

/**
 * The point a list of stored coordinates names: two coordinates, x then y, each an integer's
 * canonical digits ({@link integerNamed}), as a QTI point is two integers.
 *
 * @param coordinates The stored coordinates.
 * @returns The point; none when the list is not two canonical integers.
 */
const pointNamed = (coordinates: readonly string[]): Option.Option<readonly [bigint, bigint]> => {
  const [x, y, ...more] = coordinates;

  return x === undefined || y === undefined || more.length > 0
    ? Option.none()
    : Option.all([integerNamed(x), integerNamed(y)]);
};

/**
 * The pieces a text of the integer box is written with: zero and a digit; both signs; the space; a
 * decimal point; an exponent's and a hexadecimal's letters; a fullwidth digit; and an integer of
 * 401 digits, past every number type but a bigint.
 */
const INTEGER_PIECES = [
  "0",
  "7",
  "-",
  "+",
  " ",
  ".",
  "e",
  "x",
  "７",
  `1${"0".repeat(400)}`,
] as const;

/**
 * Draw a text of the integer box: every text of up to three {@link INTEGER_PIECES}.
 */
const integerText: Gen<string> = (source) =>
  source.draw(array(element(INTEGER_PIECES), { max: 3, min: 0 })).join("");

/**
 * How many texts {@link integerText} draws.
 */
const INTEGER_TEXTS = 1 + 10 + 10 ** 2 + 10 ** 3;

/**
 * The coordinates a list of the arity box is written with: zero, a negative integer, a decimal and
 * a letter.
 */
const LISTED_COORDINATES = ["0", "-12", "1.5", "a"] as const;

/**
 * Draw a list of the arity box: every list of up to three {@link LISTED_COORDINATES}.
 */
const coordinateList: Gen<readonly string[]> = (source) =>
  source.draw(array(element(LISTED_COORDINATES), { max: 3, min: 0 }));

/**
 * How many lists {@link coordinateList} draws.
 */
const COORDINATE_LISTS = 1 + 4 + 4 ** 2 + 4 ** 3;

/**
 * The pieces a coordinate of the coordinate box is written with: zero and a digit, both signs, the
 * space and a decimal point.
 */
const COORDINATE_PIECES = ["0", "1", "-", "+", " ", "."] as const;

/**
 * Draw a coordinate of the coordinate box: every text of up to two {@link COORDINATE_PIECES}.
 */
const coordinateText: Gen<string> = (source) =>
  source.draw(array(element(COORDINATE_PIECES), { max: 2, min: 0 })).join("");

/**
 * Draw a point of the coordinate box: two coordinates of {@link coordinateText}.
 */
const pointCoordinates: Gen<readonly [string, string]> = (source) => [
  source.draw(coordinateText),
  source.draw(coordinateText),
];

/**
 * How many points {@link pointCoordinates} draws: 43 coordinates by 43.
 */
const POINT_COORDINATES = (1 + 6 + 6 ** 2) ** 2;

/**
 * The magnitudes the number boxes put either sign on: zero; the least subnormal; one, a fraction
 * and a vast float; the largest safe integer and the integer after it, where a count of bytes ends;
 * the largest double; an infinity; and NaN.
 */
const MAGNITUDES = [
  0,
  Number.MIN_VALUE,
  1,
  1.5,
  1e300,
  Number.MAX_SAFE_INTEGER,
  Number.MAX_SAFE_INTEGER + 1,
  Number.MAX_VALUE,
  Number.POSITIVE_INFINITY,
  Number.NaN,
] as const;

/**
 * Draw a number of the number boxes: each of {@link MAGNITUDES} under either sign.
 */
const signedNumber: Gen<number> = (source) => {
  const negative = source.draw(boolean);
  const magnitude = source.draw(element(MAGNITUDES));

  return negative ? -magnitude : magnitude;
};

/**
 * How many numbers {@link signedNumber} draws.
 */
const SIGNED_NUMBERS = 2 * 10;

/**
 * Whether JSON text keeps a number as itself, written by `JSON.stringify` and read back by
 * `JSON.parse`: every number but the infinities and NaN, which it writes as `null`, and negative
 * zero, which it writes as `0`.
 *
 * @param number The number.
 * @returns Whether it comes back as itself.
 */
const keptByJson = (number: number): boolean => Object.is(storedAsJson(number), number);

/**
 * Whether a number is a count of bytes as spec reading `integer-lexical` stores a file's size, read
 * apart from the codec: a whole number from 0 to 2^53 - 1, every one of which a double holds
 * exactly, whose zero is the number JSON text keeps, `0`.
 *
 * @param size The number.
 * @returns Whether it is a count of bytes.
 */
const isByteCount = (size: number): boolean =>
  Number.isInteger(size) && size >= 0 && size < 2 ** 53 && keptByJson(size);

/**
 * The base types whose values are floats: a float, and a duration, its seconds.
 */
const FLOAT_TYPES = ["float", "duration"] as const;

/**
 * A case of a float box: a base type whose values are floats, and what is written for one.
 */
interface FloatCase<A> {
  readonly baseType: (typeof FLOAT_TYPES)[number];
  readonly written: A;
}

/**
 * Draw a case of the float box: a float and a duration of each of {@link signedNumber}.
 */
const floatCase: Gen<FloatCase<number>> = (source) => ({
  baseType: source.draw(element(FLOAT_TYPES)),
  written: source.draw(signedNumber),
});

/**
 * How many cases {@link floatCase} draws.
 */
const FLOAT_CASES = 2 * SIGNED_NUMBERS;

/**
 * How the stored form writes a float: as a JSON number, or by name.
 */
const STORED_FORMS = ["number", "name"] as const;

/**
 * The names the stored form writes a float a JSON number cannot carry as: XML Schema's lexical
 * representations of the infinities and not-a-number, INF, -INF and NaN (1.0 Part 2 section
 * 3.2.5.1), and negative zero's, `-0`, which spec reading `integer-lexical` writes by name alone.
 */
const FLOAT_NAMES: ReadonlySet<string> = new Set(["INF", "-INF", "NaN", "-0"]);

/**
 * The pieces a stored float of the name box is written with: XML Schema's names, a sign, a digit,
 * ECMAScript's name for an infinity, its name in lower case, and a decimal's point and digit.
 */
const FLOAT_TEXT_PIECES = ["INF", "NaN", "-", "0", "Infinity", "inf", "1", ".", "5"] as const;

/**
 * Draw a case of the name box: a float and a duration written as every text of up to three
 * {@link FLOAT_TEXT_PIECES}.
 */
const floatTextCase: Gen<FloatCase<string>> = (source) => ({
  baseType: source.draw(element(FLOAT_TYPES)),
  written: source.draw(array(element(FLOAT_TEXT_PIECES), { max: 3, min: 0 })).join(""),
});

/**
 * How many cases {@link floatTextCase} draws.
 */
const FLOAT_TEXT_CASES = 2 * (1 + 9 + 9 ** 2 + 9 ** 3);

/**
 * Whether XML 1.0's Char production ([2], section 2.2) admits a code point: `#x9 | #xA | #xD |
 * [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]`.
 *
 * @param codePoint A code point, a lone surrogate's among them.
 * @returns Whether it is a Char.
 */
const isChar = (codePoint: number): boolean =>
  codePoint === 0x9 ||
  codePoint === 0xa ||
  codePoint === 0xd ||
  (codePoint >= 0x20 && codePoint <= 0xd7_ff) ||
  (codePoint >= 0xe0_00 && codePoint <= 0xff_fd) ||
  (codePoint >= 0x1_00_00 && codePoint <= 0x10_ff_ff);

/**
 * The base types whose values are text a result writes into XML: a string and a URI.
 */
const TEXT_TYPES = ["string", "uri"] as const;

/**
 * A case of the character box: a text base type and the code point its value holds.
 */
interface CharacterCase {
  readonly baseType: (typeof TEXT_TYPES)[number];
  readonly codePoint: number;
}

/**
 * Draw a case of the character box: a string or a URI holding a code point at each edge of
 * {@link isChar}: every C0 control and the space, every code point from U+D7FE to U+E001, the
 * surrogates among them, U+FFFC to U+FFFF, the first two astral code points and the last two.
 */
const characterCase: Gen<CharacterCase> = (source) => ({
  baseType: source.draw(element(TEXT_TYPES)),
  codePoint: source.draw(
    oneOf([
      int(0x0, 0x20),
      int(0xd7_fe, 0xe0_01),
      int(0xff_fc, 0xff_ff),
      int(0x1_00_00, 0x1_00_01),
      int(0x10_ff_fe, 0x10_ff_ff),
    ]),
  ),
});

/**
 * How many cases {@link characterCase} draws: 2 text base types by 33, 2,052, 4, 2 and 2 code
 * points.
 */
const CHARACTER_CASES = 2 * (33 + 2052 + 4 + 2 + 2);

/**
 * The text of a character-box case: its code point between two letters in a string, and after a
 * path's slash in a URI, a surrogate as its lone code unit.
 *
 * @param character The case.
 * @returns The text.
 */
const textWith = ({ baseType, codePoint }: CharacterCase): string => {
  const character = String.fromCodePoint(codePoint);

  return baseType === "string" ? `a${character}b` : `http://a/${character}`;
};

describe("ValueSchema", () => {
  it.effect(
    `decodes every value it encodes back to that value, from the encoded form and from it stored as JSON text, in every base type and cardinality: ${String(ROUND_TRIP_VALUES)} values`,
    (ctx) =>
      Effect.andThen(
        boxHolds(roundTripValue, ROUND_TRIP_VALUES),
        searched(
          ctx,
          exhaust(
            {
              box: "every base type the value model holds by single, multiple and ordered, holding NULL, one value, or two in a container, of 2 to 6 values of the base type: integers past the safe integers, the infinities, NaN and negative zero as a float and a duration, outer spaces, line ends and an astral character, a file's size at 0 and 2^53 - 1",
              caseHang,
              coverage: requiredInSpace<ModelledBaseType>(modelledBaseTypes),
              generator: roundTripValue,
              literal: Formatter.format,
              oracle: {
                kind: "universal",
                name: "decode ∘ encode = id and decode ∘ JSON.parse ∘ JSON.stringify ∘ encode = id: the codec reads exactly what it writes, and what it writes survives JSON text (spec reading `integer-lexical`), negative zero and NaN compared as themselves",
              },
              suite: "plate/value-codec/round-trip",
            },
            (original, c) =>
              Effect.gen(function* valueRoundTrips() {
                c.note(original.baseType);

                const encoded = yield* Schema.encodeEffect(ValueSchema)(original);
                assert.deepStrictEqual(
                  yield* Schema.decodeUnknownEffect(ValueSchema)(encoded),
                  original,
                );
                assert.deepStrictEqual(
                  yield* Schema.decodeUnknownEffect(ValueSchema)(storedAsJson(encoded)),
                  original,
                );
              }),
          ),
        ),
      ),
  );

  it.effect("encodes an integer as its decimal digits and decodes them to the same bigint", () =>
    Effect.gen(function* integerAsDigits() {
      const original = value("integer", "single", [{ baseType: "integer", value: -(10n ** 30n) }]);
      const encoded = yield* Schema.encodeEffect(ValueSchema)(original);

      assert.deepStrictEqual(encoded, {
        baseType: "integer",
        cardinality: "single",
        values: [{ baseType: "integer", value: "-1000000000000000000000000000000" }],
      });
      assert.deepStrictEqual(yield* Schema.decodeUnknownEffect(ValueSchema)(encoded), original);
    }),
  );

  it.effect(
    "encodes a point as two runs of decimal digits and decodes them to the same point",
    () =>
      Effect.gen(function* pointAsDigits() {
        const original = value("point", "single", [
          { baseType: "point", value: [102n, -(2n ** 53n + 1n)] },
        ]);
        const encoded = yield* Schema.encodeEffect(ValueSchema)(original);

        assert.deepStrictEqual(encoded, {
          baseType: "point",
          cardinality: "single",
          values: [{ baseType: "point", value: ["102", "-9007199254740993"] }],
        });

        const handedBack = storedAsJson(encoded);
        assert.deepStrictEqual(
          yield* Schema.decodeUnknownEffect(ValueSchema)(handedBack),
          original,
        );
      }),
  );

  it.effect(
    `decodes a point only from two coordinates, refusing a list of any other length or with a coordinate that is no integer, over every list of up to 3 of ${String(LISTED_COORDINATES.length)} coordinates: ${String(COORDINATE_LISTS)} lists`,
    (ctx) =>
      Effect.andThen(
        boxHolds(coordinateList, COORDINATE_LISTS),
        searched(
          ctx,
          exhaust(
            {
              box: "every list of 0 to 3 coordinates of 0, -12, 1.5 and a",
              caseHang,
              coverage: requiredInSpace<Decoding>(DECODINGS),
              generator: coordinateList,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "QTI 3.0.1's point is two integers, x then y, each stored as XML Schema 1.0's canonical integer (Part 2 section 3.3.13.2, spec reading `integer-lexical`): a list decodes exactly when it holds two texts, each an optional minus sign and decimal digits with no leading zero, or 0, to the point of the integers they name",
              },
              suite: "plate/value-codec/point-arity",
            },
            (coordinates, c) =>
              Effect.sync(() => {
                const point = pointNamed(coordinates);
                c.note(decoding(Option.isSome(point)));

                assert.deepStrictEqual(
                  decodedSingles("point", coordinates),
                  Option.map(point, (named): readonly Single[] => [
                    { baseType: "point", value: named },
                  ]),
                  Formatter.format(coordinates),
                );
              }),
          ),
        ),
      ),
  );

  it.effect(
    `decodes an integer only from its canonical digits, the form the encode writes, to the integer they name, over every text of up to 3 of ${String(INTEGER_PIECES.length)} pieces: ${String(INTEGER_TEXTS)} texts`,
    (ctx) =>
      Effect.andThen(
        boxHolds(integerText, INTEGER_TEXTS),
        searched(
          ctx,
          exhaust(
            {
              box: "every text of 0 to 3 pieces over 0, 7, the minus and plus signs, the space, the point, e, x, a fullwidth 7 and an integer of 401 digits",
              caseHang,
              coverage: requiredInSpace<Decoding>(DECODINGS),
              generator: integerText,
              literal: (text) => JSON.stringify(text),
              oracle: {
                kind: "specification",
                name: "XML Schema 1.0's canonical integer (Part 2 section 3.3.13.2), the stored form spec reading `integer-lexical` makes: a text decodes exactly when it is an optional minus sign and decimal digits (#x30-#x39) with no leading zero, or 0, to the integer it names",
              },
              suite: "plate/value-codec/integer-digits",
            },
            (text, c) =>
              Effect.sync(() => {
                const integer = integerNamed(text);
                c.note(decoding(Option.isSome(integer)));

                assert.deepStrictEqual(
                  decodedSingles("integer", text),
                  Option.map(integer, (named): readonly Single[] => [
                    { baseType: "integer", value: named },
                  ]),
                  JSON.stringify(text),
                );
              }),
          ),
        ),
      ),
  );

  it.effect(
    `decodes a point's coordinates only from their canonical digits, over every pair of texts of up to 2 of ${String(COORDINATE_PIECES.length)} pieces: ${String(POINT_COORDINATES)} points`,
    (ctx) =>
      Effect.andThen(
        boxHolds(pointCoordinates, POINT_COORDINATES),
        searched(
          ctx,
          exhaust(
            {
              box: "every two coordinates, each a text of 0 to 2 pieces over 0, 1, the minus and plus signs, the space and the point",
              caseHang,
              coverage: requiredInSpace<Decoding>(DECODINGS),
              generator: pointCoordinates,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "a point's two coordinates are XML Schema 1.0's canonical integers (Part 2 section 3.3.13.2, spec reading `integer-lexical`): two texts decode exactly when each is an optional minus sign and decimal digits with no leading zero, or 0, to the point of the integers they name",
              },
              suite: "plate/value-codec/point-coordinates",
            },
            (coordinates, c) =>
              Effect.sync(() => {
                const point = pointNamed(coordinates);
                c.note(decoding(Option.isSome(point)));

                assert.deepStrictEqual(
                  decodedSingles("point", coordinates),
                  Option.map(point, (named): readonly Single[] => [
                    { baseType: "point", value: named },
                  ]),
                  Formatter.format(coordinates),
                );
              }),
          ),
        ),
      ),
  );

  it('decodes negative zero only from its name "-0", never from the number -0', () => {
    assert.isFalse(decodesSingle("float", -0));
    assert.isFalse(decodesSingle("duration", -0));
    assert.isTrue(decodesSingle("float", "-0"));
    assert.isTrue(decodesSingle("float", 0));
  });

  it.effect(
    `decodes a file's size only when it is a count of bytes, a whole number from 0 to 2^53 - 1 whose zero is 0, never -0, over each of ${String(MAGNITUDES.length)} magnitudes under either sign: ${String(SIGNED_NUMBERS)} sizes`,
    (ctx) =>
      Effect.andThen(
        boxHolds(signedNumber, SIGNED_NUMBERS),
        searched(
          ctx,
          exhaust(
            {
              box: "0, the least subnormal, 1, 1.5, 1e300, 2^53 - 1, 2^53, the largest double, an infinity and NaN, each under either sign",
              caseHang,
              coverage: requiredInSpace<Decoding>(DECODINGS),
              generator: signedNumber,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "spec reading `integer-lexical`: a file's size is a count of bytes whose zero is written 0 alone, so a size decodes exactly when Number.isInteger holds, it is from 0 to below 2^53, and JSON text gives it back as itself",
              },
              suite: "plate/value-codec/file-size",
            },
            (size, c) =>
              Effect.sync(() => {
                const counted = isByteCount(size);
                c.note(decoding(counted));

                assert.strictEqual(
                  decodesSingle("file", { name: "a.png", size, type: "image/png" }),
                  counted,
                  Formatter.format(size),
                );
              }),
          ),
        ),
      ),
  );

  it.effect(
    `stores a float and a duration as a JSON number exactly when JSON text keeps it, otherwise by name, and reads each back through JSON text as itself, over each of ${String(MAGNITUDES.length)} magnitudes under either sign: ${String(FLOAT_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(floatCase, FLOAT_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "a float and a duration of 0, the least subnormal, 1, 1.5, 1e300, 2^53 - 1, 2^53, the largest double, an infinity and NaN, each under either sign",
              caseHang,
              coverage: requiredInSpace<(typeof STORED_FORMS)[number]>(STORED_FORMS),
              generator: floatCase,
              literal: Formatter.format,
              oracle: {
                kind: "universal",
                name: "decode ∘ JSON.parse ∘ JSON.stringify ∘ encode = id, by Object.is, so negative zero and NaN come back as themselves; and a float is stored as a number exactly when JSON.stringify and JSON.parse give that number back as itself (spec reading `integer-lexical`)",
              },
              suite: "plate/value-codec/float-json",
            },
            ({ baseType, written }, c) =>
              Effect.gen(function* floatThroughJson() {
                const encoded = yield* Schema.encodeEffect(ValueSchema)(
                  value(baseType, "single", [{ baseType, value: written }]),
                );
                const [stored] = encoded.values;
                const storedAsNumber = Predicate.isNumber(stored?.value);
                c.note(storedAsNumber ? "number" : "name");

                const name = `${baseType} ${Formatter.format(written)}`;
                assert.strictEqual(storedAsNumber, keptByJson(written), name);

                const decoded = yield* Schema.decodeUnknownEffect(ValueSchema)(
                  storedAsJson(encoded),
                );
                const [single] = decoded.values;
                assert.strictEqual(single?.baseType, baseType, name);
                assert.isTrue(Object.is(single?.value, written), name);
              }),
          ),
        ),
      ),
  );

  it.effect(
    "stores a duration as its seconds, as a float, INF and NaN by name, and reads it back through JSON text",
    () =>
      Effect.gen(function* durationThroughJson() {
        const original = value(
          "duration",
          "multiple",
          [90.5, -1.5, Number.POSITIVE_INFINITY, Number.NaN].map((seconds) => ({
            baseType: "duration",
            value: seconds,
          })),
        );
        const encoded = yield* Schema.encodeEffect(ValueSchema)(original);

        assert.deepStrictEqual(encoded, {
          baseType: "duration",
          cardinality: "multiple",
          values: [
            { baseType: "duration", value: 90.5 },
            { baseType: "duration", value: -1.5 },
            { baseType: "duration", value: "INF" },
            { baseType: "duration", value: "NaN" },
          ],
        });

        const handedBack = storedAsJson(encoded);
        const decoded = yield* Schema.decodeUnknownEffect(ValueSchema)(handedBack);
        assert.deepStrictEqual(decoded, original);
        assert.strictEqual(
          Schema.decodeUnknownResult(ValueSchema)(
            singleInput("duration", [{ baseType: "duration", value: "PT1M30.5S" }]),
          )._tag,
          "Failure",
        );
      }),
  );

  it.effect(
    'writes the infinities, NaN and negative zero as "INF", "-INF", "NaN" and "-0", and every other float as a number',
    () =>
      Effect.gen(function* floatEncodedForms() {
        const encoded = yield* Schema.encodeEffect(ValueSchema)(
          value(
            "float",
            "ordered",
            [
              Number.POSITIVE_INFINITY,
              Number.NEGATIVE_INFINITY,
              Number.NaN,
              -0,
              0,
              2.5,
              -1e300,
            ].map((number) => ({ baseType: "float", value: number })),
          ),
        );

        assert.deepStrictEqual(
          encoded.values.map((single) => single.value),
          ["INF", "-INF", "NaN", "-0", 0, 2.5, -1e300],
        );
      }),
  );

  it.effect(
    `decodes a float or a duration stored as text only from INF, -INF, NaN and -0, over every text of up to 3 of ${String(FLOAT_TEXT_PIECES.length)} pieces: ${String(FLOAT_TEXT_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(floatTextCase, FLOAT_TEXT_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "a float and a duration stored as every text of 0 to 3 pieces over INF, NaN, the minus sign, 0, Infinity, inf, 1, the point and 5",
              caseHang,
              coverage: requiredInSpace<Decoding>(DECODINGS),
              generator: floatTextCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "XML Schema 1.0 Part 2 section 3.2.5.1's lexical representations of the infinities and not-a-number, INF, -INF and NaN, and negative zero's name -0 (spec reading `integer-lexical`), the only floats stored as text: a text decodes exactly when it is one of the four",
              },
              suite: "plate/value-codec/float-names",
            },
            ({ baseType, written }, c) =>
              Effect.sync(() => {
                const named = FLOAT_NAMES.has(written);
                c.note(decoding(named));

                assert.strictEqual(
                  decodesSingle(baseType, written),
                  named,
                  `${baseType} ${JSON.stringify(written)}`,
                );
              }),
          ),
        ),
      ),
  );

  it("refuses a value of another base type, an invalid value and two values in a single", () => {
    const valid = Schema.is(ValueSchema);
    assert.isTrue(valid(singleInput("integer", [{ baseType: "integer", value: 1n }])));
    assert.isTrue(valid(singleInput("integer", [{ baseType: "integer", value: 2n ** 53n + 1n }])));
    assert.isFalse(valid(singleInput("integer", [{ baseType: "integer", value: 1 }])));
    assert.isFalse(valid(singleInput("integer", [{ baseType: "integer", value: 2 ** 53 }])));
    assert.isFalse(valid(singleInput("integer", [{ baseType: "float", value: 1 }])));
    assert.isFalse(valid(singleInput("integer", [{ baseType: "integer", value: "1" }])));
    assert.isFalse(valid(singleInput("integer", [{ baseType: "integer", value: 1.5 }])));
    assert.isFalse(valid(singleInput("identifier", [{ baseType: "identifier", value: "1" }])));
    assert.isFalse(valid(singleInput("pair", [{ baseType: "pair", value: ["A", "1"] }])));
    assert.isFalse(valid(singleInput("string", [{ baseType: "string", value: "" }])));
    assert.isFalse(valid(singleInput("identifier", identifiers("A", "B"))));
    assert.isTrue(valid(singleInput("point", [{ baseType: "point", value: [102n, 113n] }])));
    assert.isFalse(valid(singleInput("point", [{ baseType: "point", value: [1n, 2n, 3n] }])));
    assert.isFalse(valid(singleInput("point", [{ baseType: "point", value: [102, 113] }])));
    assert.isTrue(valid(singleInput("duration", [])));
    assert.isTrue(valid(singleInput("duration", [{ baseType: "duration", value: 90.5 }])));
    assert.isFalse(valid(singleInput("duration", [{ baseType: "duration", value: "PT1M" }])));
    assert.isTrue(valid(singleInput("file", [])));
    assert.isFalse(valid(singleInput("file", [{ baseType: "string", value: "a.txt" }])));
    assert.isFalse(valid({ baseType: "identifier", cardinality: "record", values: [] }));
  });

  it.effect(
    `decodes a string or a URI exactly when every character of it is one XML can carry, over a code point at each edge of XML's Char in each: ${String(CHARACTER_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(characterCase, CHARACTER_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "a string holding a code point between two letters and a URI holding it after a path's slash, for U+0000 to U+0020, U+D7FE to U+E001 with every surrogate alone, U+FFFC to U+FFFF, U+10000, U+10001, U+10FFFE and U+10FFFF",
              caseHang,
              coverage: requiredInSpace<Decoding>(DECODINGS),
              generator: characterCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "XML 1.0's Char production ([2], section 2.2), #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF], which every character of a document a result writes must match: a text decodes exactly when its code point is a Char",
              },
              suite: "plate/value-codec/xml-chars",
            },
            (character, c) =>
              Effect.sync(() => {
                const carried = isChar(character.codePoint);
                c.note(decoding(carried));

                assert.strictEqual(
                  decodesSingle(character.baseType, textWith(character)),
                  carried,
                  `${character.baseType} U+${character.codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
                );
              }),
          ),
        ),
      ),
  );
});

/**
 * A record of the fields a Text Entry's post gives: its text, an integer of 400 digits, and a float
 * that is infinite.
 */
const posted: RecordValue = {
  cardinality: "record",
  fields: [
    { identifier: "stringValue", value: { baseType: "string", value: "  12 " } },
    { identifier: "integerValue", value: { baseType: "integer", value: 10n ** 399n + 7n } },
    { identifier: "floatValue", value: { baseType: "float", value: Number.POSITIVE_INFINITY } },
  ],
};

/**
 * Records {@link RecordValueSchema} refuses, by what is wrong with each, typed as the plain record
 * would be had it been built by hand: an identifier that is not an NCName, an identifier written
 * twice, a field of base type `file` holding text where a file is its name, size and type, and a
 * field holding the empty string, which is NULL, and a NULL field is no field.
 */
const malformedRecords = {
  "a field holding the empty string": {
    cardinality: "record",
    fields: [{ identifier: "stringValue", value: { baseType: "string", value: "" } }],
  },
  "a field of base type file holding text": {
    cardinality: "record",
    fields: [{ identifier: "upload", value: { baseType: "file", value: "a.txt" } }],
  },
  "an identifier that is not an NCName": {
    cardinality: "record",
    fields: [{ identifier: "1st", value: { baseType: "string", value: "a" } }],
  },
  "an identifier written twice": {
    cardinality: "record",
    fields: [
      { identifier: "stringValue", value: { baseType: "string", value: "a" } },
      { identifier: "stringValue", value: { baseType: "string", value: "b" } },
    ],
  },
} as const;

describe("RecordValueSchema", () => {
  it.effect(
    "round-trips a record through JSON text: a 400-digit integer exact and an infinite float by name",
    () =>
      Effect.gen(function* recordRoundTrips() {
        const encoded = yield* Schema.encodeEffect(RecordValueSchema)(posted);
        const integerField = encoded.fields[1]?.value;

        assert.deepStrictEqual(
          encoded.fields.map((field) => [field.identifier, field.value.value]),
          [
            ["stringValue", "  12 "],
            ["integerValue", String(10n ** 399n + 7n)],
            ["floatValue", "INF"],
          ],
        );
        assert.strictEqual(
          integerField?.baseType === "integer" ? integerField.value.length : -1,
          400,
        );

        const handedBack = storedAsJson(encoded);
        assert.deepStrictEqual(
          yield* Schema.decodeUnknownEffect(RecordValueSchema)(handedBack),
          posted,
        );
        assert.deepStrictEqual(
          yield* Schema.decodeUnknownEffect(ResponseValueSchema)(handedBack),
          posted,
        );
      }),
  );

  it("takes a record with no field, the NULL record", () => {
    assert.isTrue(Schema.is(RecordValueSchema)({ cardinality: "record", fields: [] }));
  });

  it("refuses, decoding and encoding alike, a non-NCName identifier, a repeated identifier, a field of base type file and an empty string", () => {
    for (const [problem, malformed] of Object.entries(malformedRecords)) {
      const stored = storedAsJson(malformed);

      assert.isTrue(
        Result.isFailure(Schema.decodeUnknownResult(RecordValueSchema)(stored)),
        problem,
      );
      assert.isTrue(
        Result.isFailure(Schema.decodeUnknownResult(ResponseValueSchema)(stored)),
        problem,
      );
      assert.isTrue(
        Result.isFailure(Schema.encodeUnknownResult(RecordValueSchema)(malformed)),
        problem,
      );
      assert.isFalse(Schema.is(RecordValueSchema)(malformed), problem);
    }
  });
});

describe("the plain types", () => {
  it("are the Schemas' types, each line a type error once a Schema's type parts from its plain type", () => {
    expectTypeOf<typeof ValueSchema.Type>().toEqualTypeOf<Value>();
    expectTypeOf<typeof RecordValueSchema.Type>().toEqualTypeOf<RecordValue>();
    expectTypeOf<typeof ResponseValueSchema.Type>().toEqualTypeOf<ResponseValue>();
  });
});

/**
 * A body a page posts: a multiple of identifiers, an integer past the safe integers, a float JSON
 * has no number for, an ordered of points, a record, a NULL and an End Attempt not pressed.
 */
const body: Responses = {
  CHOICES: value("identifier", "multiple", identifiers("A", "B", "B")),
  DRAWN: value("boolean", "single", [{ baseType: "boolean", value: false }]),
  EMPTY: nullOf("directedPair", "multiple"),
  NUMBER: value("integer", "single", [{ baseType: "integer", value: 2n ** 64n + 1n }]),
  POINTS: value("point", "ordered", [
    { baseType: "point", value: [102n, 113n] },
    { baseType: "point", value: [-3n, 0n] },
  ]),
  RATIO: value("float", "single", [{ baseType: "float", value: -0 }]),
  TYPED: {
    cardinality: "record",
    fields: [
      { identifier: "stringValue", value: { baseType: "string", value: "1.50" } },
      { identifier: "floatValue", value: { baseType: "float", value: 1.5 } },
    ],
  },
};

/**
 * An NCName written in ASCII alone, as Namespaces in XML 1.0 defines one ([4]: an XML Name with no
 * colon) from XML 1.0's NameStartChar and NameChar ([4], [4a]): a letter or `_`, then letters,
 * digits, `-`, `.` and `_`.
 */
const asciiNcName = regex("^[A-Za-z_][A-Za-z0-9._-]*$", "u");

/**
 * The pieces a key of the posted box is written with: a letter, a digit, and the underscore,
 * hyphen, full stop, colon and space.
 */
const KEY_PIECES = ["A", "1", "_", "-", ".", ":", " "] as const;

/**
 * The base types a value of the posted box's identifier response holds: its own, whose stored
 * value is `A`, and an integer's, whose stored value is `1`.
 */
const POSTED_TYPES = ["identifier", "integer"] as const;

/**
 * A case of the posted box: the key a response is posted under, and the base types of the values
 * its `single` identifier response holds.
 */
interface PostedCase {
  readonly key: string;
  readonly types: readonly (typeof POSTED_TYPES)[number][];
}

/**
 * Draw a case of the posted box: every key of up to three {@link KEY_PIECES}, by every list of up
 * to two of {@link POSTED_TYPES}.
 */
const postedCase: Gen<PostedCase> = (source) => ({
  key: source.draw(array(element(KEY_PIECES), { max: 3, min: 0 })).join(""),
  types: source.draw(array(element(POSTED_TYPES), { max: 2, min: 0 })),
});

/**
 * How many cases {@link postedCase} draws: 400 keys by 7 lists.
 */
const POSTED_CASES = (1 + 7 + 7 ** 2 + 7 ** 3) * (1 + 2 + 2 ** 2);

/**
 * The body a posted-box case posts: under its key, a `single` identifier response holding a value
 * of each of its base types as the encode stores it.
 *
 * @param posting The case.
 * @returns The body.
 */
const postedBody = ({ key, types }: PostedCase) => ({
  [key]: {
    baseType: "identifier",
    cardinality: "single",
    values: types.map((baseType) =>
      baseType === "identifier" ? { baseType, value: "A" } : { baseType, value: "1" },
    ),
  },
});

describe("PostedResponses", () => {
  it.effect(
    "carries every response through JSON text whole: exact integers, named floats, records",
    () =>
      Effect.gen(function* postedRoundTrip() {
        const read = yield* Schema.decodeUnknownEffect(PostedResponses)(
          storedAsJson(Schema.encodeSync(PostedResponses)(body)),
        );

        assert.deepStrictEqual(read, body);
        assert.deepStrictEqual(
          Object.values(read).flatMap((each) =>
            isRecordValue(each)
              ? []
              : each.values.flatMap((single) =>
                  single.baseType === "float" ? [single.value] : [],
                ),
          ),
          [-0],
        );
      }),
  );

  it.effect(
    `decodes a body only under a key that is an NCName, its single holding at most one value of its own base type, over every key of up to 3 of ${String(KEY_PIECES.length)} pieces by every list of up to 2 base types: ${String(POSTED_CASES)} bodies`,
    (ctx) =>
      Effect.andThen(
        boxHolds(postedCase, POSTED_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "every key of 0 to 3 pieces over A, 1, the underscore, hyphen, full stop, colon and space, by a single identifier response holding every list of 0 to 2 values each an identifier or an integer",
              caseHang,
              coverage: requiredInSpace<Decoding>(DECODINGS),
              generator: postedCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "a response identifier is an NCName (QTI 3.0.1's identifier, Namespaces in XML 1.0 [4]), here over ASCII: a letter or _, then letters, digits, -, . and _; and a single-cardinality response holds at most one value, of the response's base type (QTI 3.0.1 information model, Variables): a body decodes exactly when both hold, to NULL or the identifier A",
              },
              suite: "plate/value-codec/posted-body",
            },
            (posting, c) =>
              Effect.sync(() => {
                const decodes =
                  asciiNcName.test(posting.key) &&
                  posting.types.length <= 1 &&
                  posting.types.every((baseType) => baseType === "identifier");
                c.note(decoding(decodes));

                assert.deepStrictEqual(
                  Result.getSuccess(
                    Schema.decodeUnknownResult(PostedResponses)(postedBody(posting)),
                  ),
                  decodes
                    ? Option.some<Responses>({
                        [posting.key]: value(
                          "identifier",
                          "single",
                          posting.types.map((): Single => ({ baseType: "identifier", value: "A" })),
                        ),
                      })
                    : Option.none(),
                  Formatter.format(posting),
                );
              }),
          ),
        ),
      ),
  );
});
