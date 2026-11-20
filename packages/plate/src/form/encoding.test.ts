import { assert, describe, expectTypeOf, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import {
  checkInstance,
  decode,
  decodeRecord,
  decodeValue,
  encode,
  entryName,
  partition,
  responseOf,
} from "#plate/form/encoding.ts";
import type { Entry, Malformed, RecordBinding, ValueBinding } from "#plate/form/encoding.ts";
import { format } from "#plate/model/values.ts";
import type {
  RecordField,
  RecordValue,
  ResponseValue,
  Single,
  Value,
} from "#plate/model/values.ts";
import { growthFactor, growthLimit, growthRatio } from "#plate/test/growth.ts";

/**
 * The item instance the tests post for.
 */
const instance = "MANIFEST-1.tests.t.xml.1.1";

/**
 * Another item instance's key: the next item of the same sitting.
 */
const otherInstance = "MANIFEST-1.tests.t.xml.1.2";

/**
 * Construct the binding of the response `RESPONSE` for a test.
 *
 * @param baseType The response's base type.
 * @param cardinality The response's cardinality.
 * @returns The binding, named for {@link instance}.
 */
const binding = (
  baseType: ValueBinding["baseType"],
  cardinality: ValueBinding["cardinality"] = "single",
): ValueBinding => ({ baseType, cardinality, name: entryName(instance, "RESPONSE") });

/**
 * The record binding of the response `RESPONSE`, named for {@link instance}.
 */
const recordBinding: RecordBinding = {
  cardinality: "record",
  name: entryName(instance, "RESPONSE"),
};

/**
 * Construct the entries a form posts for the response `RESPONSE`.
 *
 * @param values The posted values, in order.
 * @returns One entry for each value, named for {@link instance}.
 */
const posted = (...values: readonly string[]): readonly Entry[] =>
  values.map((value) => [entryName(instance, "RESPONSE"), value]);

/**
 * Construct a value for a test.
 *
 * @param bound The binding whose base type and cardinality the value takes.
 * @param values Its values.
 * @returns The value.
 */
const value = (bound: ValueBinding, ...values: readonly Single[]): Value => ({
  baseType: bound.baseType,
  cardinality: bound.cardinality,
  values,
});

/**
 * Construct an identifier value.
 *
 * @param text The identifier.
 * @returns The value.
 */
const identifier = (text: string): Single => ({ baseType: "identifier", value: text });

/**
 * Construct a string value.
 *
 * @param text The string.
 * @returns The value.
 */
const stringOf = (text: string): Single => ({ baseType: "string", value: text });

/**
 * Construct a directed pair value.
 *
 * @param source The source's identifier.
 * @param target The target's identifier.
 * @returns The value.
 */
const directedPair = (source: string, target: string): Single => ({
  baseType: "directedPair",
  value: [source, target],
});

/**
 * Construct a field of a record.
 *
 * @param name The field's identifier.
 * @param single The field's value.
 * @returns The field.
 */
const field = (name: string, single: Single): RecordField => ({ identifier: name, value: single });

/**
 * Construct an integer field of a record.
 *
 * @param name The field's identifier.
 * @param integer The field's value.
 * @returns The field.
 */
const integerField = (name: string, integer: bigint): RecordField =>
  field(name, { baseType: "integer", value: integer });

/**
 * Construct a record for a test.
 *
 * @param fields Its fields, in order.
 * @returns The record.
 */
const record = (...fields: readonly RecordField[]): RecordValue => ({
  cardinality: "record",
  fields,
});

/**
 * Construct the record a posted number decodes to, its fields in `decode`'s order.
 *
 * @param text The posted text, its `stringValue`.
 * @param counts The number's fields: `floatValue`, then the integer fields by their identifiers,
 *   `integerValue` and `exponent` only when the number has them.
 * @returns The record.
 */
const numberRecord = (
  text: string,
  counts: {
    readonly floatValue: number;
    readonly integerValue?: bigint;
    readonly leftDigits: bigint;
    readonly rightDigits: bigint;
    readonly ndp: bigint;
    readonly nsf: bigint;
    readonly exponent?: bigint;
  },
): RecordValue =>
  record(
    field("stringValue", stringOf(text)),
    field("floatValue", { baseType: "float", value: counts.floatValue }),
    ...(counts.integerValue === undefined
      ? []
      : [integerField("integerValue", counts.integerValue)]),
    integerField("leftDigits", counts.leftDigits),
    integerField("rightDigits", counts.rightDigits),
    integerField("ndp", counts.ndp),
    integerField("nsf", counts.nsf),
    ...(counts.exponent === undefined ? [] : [integerField("exponent", counts.exponent)]),
  );

/**
 * Give a record's field of an identifier.
 *
 * @param decoded The record.
 * @param name The field's identifier.
 * @returns The field's value, or none when the record has no such field.
 */
const fieldOf = (decoded: RecordValue, name: string): Option.Option<Single> =>
  Option.map(
    Option.fromUndefinedOr(decoded.fields.find((each) => each.identifier === name)),
    (found) => found.value,
  );

/**
 * Decode posted values under the record binding of the response `RESPONSE`.
 *
 * @param values The posted values, in order.
 * @returns What `decode` gives.
 */
const decodeRecordOf = (...values: readonly string[]): Result.Result<RecordValue, Malformed> =>
  decodeRecord(posted(...values), recordBinding);

/**
 * Encode a value under a binding and decode the entries back.
 *
 * @param bound The binding.
 * @param original The value to send through the form.
 * @returns The value the entries decode to.
 */
const roundTrip = (bound: ValueBinding, original: Value): Effect.Effect<Value, Malformed> =>
  Effect.fromResult(decodeValue(encode(original, bound), bound));

/**
 * The digits the Q-20 growth check reads first, before it reads {@link growthFactor} times as many.
 */
const fewerDigits = 12_500;

/**
 * The quadratic control reads 100,000 digits three times, about 1.5 s alone; under load that nears
 * vitest's default of 5 s.
 */
const controlTimeoutMs = 60_000;

/**
 * Measure how a parse's CPU time grows with its digits, through {@link growthRatio}: on the first
 * {@link fewerDigits} digits and on {@link growthFactor} times as many.
 *
 * @param spelling The digits, at least `fewerDigits * growthFactor` of them.
 * @param parse The parse to time.
 * @returns How many times as long the parse took on the larger prefix as on the smaller.
 */
const digitGrowth = (spelling: string, parse: (digits: string) => void): Effect.Effect<number> => {
  const fewer = spelling.slice(0, fewerDigits);
  const more = spelling.slice(0, fewerDigits * growthFactor);

  return growthRatio(
    () => {
      parse(fewer);
    },
    () => {
      parse(more);
    },
  );
};

/**
 * The growth check's control, a deliberately quadratic parse: a per-digit `total * 36n + digit`
 * loop, which copies the whole bigint at every digit.
 *
 * @param digits Base-36 digits.
 * @returns The integer the digits name.
 */
const parseQuadratically = (digits: string): bigint => {
  let total = 0n;
  for (const digit of digits) {
    total = total * 36n + BigInt(Number.parseInt(digit, 36));
  }

  return total;
};

describe("encode and decode", () => {
  it("decode returns a Result: Malformed for a float that is not a number, 7n for an integer", () => {
    const refused = decode(posted("abc"), binding("float"));
    assert.deepStrictEqual(
      Option.map(Result.getFailure(refused), ({ _tag, reason }) => ({ _tag, reason })),
      Option.some({ _tag: "Malformed", reason: "number" }),
    );

    const integer = binding("integer");
    const seven = decode(posted("7"), integer);
    assert.deepStrictEqual(
      Result.getSuccess(seven),
      Option.some(value(integer, { baseType: "integer", value: 7n })),
    );
  });

  it.effect("round-trip an identifier single and multiple, in order", () =>
    Effect.gen(function* identifierRoundTrip() {
      const single = binding("identifier");
      const multiple = binding("identifier", "multiple");
      const chosen = value(multiple, identifier("choiceC"), identifier("choiceA"));

      assert.deepStrictEqual(encode(chosen, multiple), posted("choiceC", "choiceA"));
      assert.deepStrictEqual(yield* roundTrip(multiple, chosen), chosen);
      assert.deepStrictEqual(
        yield* roundTrip(single, value(single, identifier("choiceB"))),
        value(single, identifier("choiceB")),
      );
    }),
  );

  it.effect("round-trip a string, an integer and a float single", () =>
    Effect.gen(function* textRoundTrip() {
      const string = value(binding("string"), { baseType: "string", value: " a b " });
      const integer = value(binding("integer"), { baseType: "integer", value: -12n });
      const float = value(binding("float"), { baseType: "float", value: 2.5 });

      assert.deepStrictEqual(yield* roundTrip(binding("string"), string), string);
      assert.deepStrictEqual(yield* roundTrip(binding("integer"), integer), integer);
      assert.deepStrictEqual(yield* roundTrip(binding("float"), float), float);
    }),
  );

  it.effect("encodes NULL as no entries and decodes no entry, or one empty, as NULL", () =>
    Effect.gen(function* nullRoundTrip() {
      const multiple = binding("identifier", "multiple");

      assert.deepStrictEqual(encode(value(multiple), multiple), []);
      assert.deepStrictEqual(yield* Effect.fromResult(decode([], multiple)), value(multiple));
      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted(""), binding("identifier"))),
        value(binding("identifier")),
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted(""), binding("string"))),
        value(binding("string")),
      );
    }),
  );

  it.effect(
    "decodes a string of XML white space alone as NULL under blankIsEmpty, as QTI's TextFormatEnum reads plain and preformatted text, and as the text otherwise",
    () =>
      Effect.gen(function* blankText() {
        const blank = " \t\r\n ";
        const recordOfText = { cardinality: "record", name: binding("string").name } as const;

        // "where a response consists only of white-space characters … it should be treated as an
        // empty string (NULL)" (TextFormatEnum, plain and preformatted).
        assert.deepStrictEqual(
          yield* Effect.fromResult(
            decode(posted(blank), binding("string"), { blankIsEmpty: true }),
          ),
          value(binding("string")),
        );
        assert.deepStrictEqual(
          yield* Effect.fromResult(decode(posted(blank), recordOfText, { blankIsEmpty: true })),
          { cardinality: "record", fields: [] },
        );
        assert.deepStrictEqual(
          yield* Effect.fromResult(decode(posted(blank), binding("string"))),
          value(binding("string"), { baseType: "string", value: " \t\n " }),
        );
      }),
  );

  it.effect(
    "refuses abc, INF, -INF, NaN and a decimal beyond the largest double, an infinity, as a float",
    () =>
      Effect.gen(function* floatRefusals() {
        for (const text of ["abc", "INF", "-INF", "NaN", "1E999", "-1E999"]) {
          const error = yield* Effect.flip(
            Effect.fromResult(decode(posted(text), binding("float"))),
          );
          assert.strictEqual(error._tag, "Malformed");
          assert.strictEqual(error.reason, "number");
        }
      }),
  );

  it.effect("trims a number, then reads an integer in its base", () =>
    Effect.gen(function* integerBase() {
      const integer = binding("integer");
      const float = binding("float");

      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted(" 7 "), integer)),
        value(integer, { baseType: "integer", value: 7n }),
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted(" 1E3 "), float)),
        value(float, { baseType: "float", value: 1000 }),
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted("101"), integer, { base: 2 })),
        value(integer, { baseType: "integer", value: 5n }),
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted("-ff"), integer, { base: 16 })),
        value(integer, { baseType: "integer", value: -255n }),
      );

      const error = yield* Effect.flip(
        Effect.fromResult(decode(posted("102"), integer, { base: 2 })),
      );
      assert.strictEqual(error.reason, "number");
    }),
  );

  it.effect("reads a posted integer exactly, beyond the safe integers", () =>
    Effect.gen(function* exactIntegers() {
      const integer = binding("integer");
      const cases: readonly (readonly [string, bigint])[] = [
        ["9007199254740993", 2n ** 53n + 1n],
        [" 1000000000000000000000000000000 ", 10n ** 30n],
        ["-1000000000000000000000000000000", -(10n ** 30n)],
        ["+0009007199254740993", 2n ** 53n + 1n],
      ];

      for (const [text, exact] of cases) {
        assert.deepStrictEqual(
          yield* Effect.fromResult(decode(posted(text), integer)),
          value(integer, { baseType: "integer", value: exact }),
        );
      }
    }),
  );

  it.effect("reads a posted integer exactly in bases 16 and 7", () =>
    Effect.gen(function* exactInBase() {
      const integer = binding("integer");
      const exact = value(integer, { baseType: "integer", value: 2n ** 53n + 1n });

      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted("20000000000001"), integer, { base: 16 })),
        exact,
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(
          decode(posted((2n ** 53n + 1n).toString(7)), integer, { base: 7 }),
        ),
        exact,
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(
          decode(posted(`-${(10n ** 30n).toString(7)}`), integer, { base: 7 }),
        ),
        value(integer, { baseType: "integer", value: -(10n ** 30n) }),
      );
    }),
  );

  it.effect("posts an integer in the base it is read in, and in base 10 without one", () =>
    Effect.gen(function* encodeInBase() {
      const integers = binding("integer", "ordered");
      const original = value(
        integers,
        ...[-(2n ** 64n), -255n, -1n, 0n, 1n, 35n, 36n, 2n ** 53n + 1n].map((integer): Single => ({
          baseType: "integer",
          value: integer,
        })),
      );

      for (let base = 2; base <= 36; base += 1) {
        assert.deepStrictEqual(
          yield* Effect.fromResult(
            decode(encode(original, integers, { base }), integers, { base }),
          ),
          original,
          `base ${String(base)}`,
        );
      }

      const single = binding("integer");
      const negative = value(single, { baseType: "integer", value: -255n });

      assert.deepStrictEqual(encode(negative, single, { base: 16 }), posted("-ff"));
      assert.deepStrictEqual(encode(negative, single), posted("-255"));

      for (const base of [1, 2.5, 37]) {
        assert.deepStrictEqual(encode(negative, single, { base }), posted("-255"), String(base));
      }
    }),
  );

  it.effect(
    "reads 100,000 base-36 digits exactly, 8 times the digits in under 32 times the time",
    () =>
      Effect.gen(function* longBase36() {
        const integer = binding("integer");
        const exact = 17n * 36n ** 99_999n + 7n ** 90_000n;
        const spelling = exact.toString(36);
        assert.strictEqual(spelling.length, 100_000);

        const read = yield* Effect.fromResult(decode(posted(spelling), integer, { base: 36 }));
        assert.deepStrictEqual(read, value(integer, { baseType: "integer", value: exact }));

        const growth = yield* digitGrowth(spelling, (digits) => {
          decode(posted(digits), integer, { base: 36 });
        });
        assert.isBelow(
          growth,
          growthLimit,
          `8 times the digits took ${growth.toFixed(1)} times as long`,
        );
      }),
  );

  it.effect(
    "control: a quadratic parse fails the growth check",
    () =>
      Effect.gen(function* quadraticControl() {
        const spelling = "z".repeat(fewerDigits * growthFactor);
        assert.strictEqual(parseQuadratically("zz"), 35n * 36n + 35n);

        const growth = yield* digitGrowth(spelling, (digits) => {
          parseQuadratically(digits);
        });
        assert.isAtLeast(
          growth,
          growthLimit,
          `8 times the digits took ${growth.toFixed(1)} times as long`,
        );
      }),
    controlTimeoutMs,
  );

  it.effect("refuses a decimal, INF, a bare sign and a base outside 2 to 36", () =>
    Effect.gen(function* integerRefusals() {
      const integer = binding("integer");
      const cases: readonly (readonly [string, number])[] = [
        ["1.5", 10],
        ["INF", 10],
        ["+", 10],
        ["-", 10],
        ["102", 2],
        ["1", 1],
        ["1", 2.5],
        ["1", 37],
      ];

      for (const [text, base] of cases) {
        const error = yield* Effect.flip(
          Effect.fromResult(decode(posted(text), integer, { base })),
        );
        assert.strictEqual(error._tag, "Malformed");
        assert.strictEqual(error.reason, "number", `${text} in base ${String(base)}`);
      }
    }),
  );

  it.effect("turns a posted CRLF and a lone CR into LF", () =>
    Effect.gen(function* lineFeeds() {
      const string = binding("string");

      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted("a\r\nb"), string)),
        value(string, { baseType: "string", value: "a\nb" }),
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted("a\rb\n"), string)),
        value(string, { baseType: "string", value: "a\nb\n" }),
      );
    }),
  );

  it.effect("refuses two entries for a single and a non-NCName", () =>
    Effect.gen(function* refusals() {
      const single = binding("identifier");

      const many = yield* Effect.flip(
        Effect.fromResult(decode(posted("choiceA", "choiceB"), single)),
      );
      assert.strictEqual(many.reason, "single-many");

      const notNcName = yield* Effect.flip(Effect.fromResult(decode(posted("1st"), single)));
      assert.strictEqual(notNcName.reason, "identifier");
    }),
  );

  it("refuses posted text holding a character XML cannot carry, and keeps tab, line breaks and an astral character", () => {
    const string = binding("string");
    const postedForm = (query: string): readonly Entry[] => [
      ...new URLSearchParams(`${string.name}=${query}`),
    ];

    for (const query of ["a%00b", "a%0Bb", "a%EF%BF%BEb", "a%EF%BF%BFb", "a%1Fb"]) {
      assert.deepStrictEqual(
        Option.map(Result.getFailure(decode(postedForm(query), string)), ({ _tag, reason }) => ({
          _tag,
          reason,
        })),
        Option.some({ _tag: "Malformed", reason: "character" }),
        query,
      );
    }
    assert.deepStrictEqual(
      Option.map(Result.getFailure(decode(posted("a\uD800b"), string)), ({ reason }) => reason),
      Option.some("character"),
      "a lone surrogate",
    );
    assert.deepStrictEqual(
      Option.map(
        Result.getFailure(decode(posted("choiceA\u0000"), binding("identifier"))),
        ({ reason }) => reason,
      ),
      Option.some("character"),
      "an identifier",
    );
    assert.deepStrictEqual(
      Result.getSuccess(decode(postedForm("a%09b%0Ac%0D%0Ad%F0%9F%98%80"), string)),
      Option.some(value(string, stringOf("a\tb\nc\nd\u{1F600}"))),
    );
  });

  it.effect("decodes only the entries its binding names", () =>
    Effect.gen(function* namedEntries() {
      const single = binding("identifier");
      const entries: readonly Entry[] = [
        [entryName(instance, "OTHER"), "choiceA"],
        [entryName(instance, "RESPONSE"), "choiceB"],
      ];

      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(entries, single)),
        value(single, identifier("choiceB")),
      );
    }),
  );

  it.effect("decodes an ordered container's filled Controls in the order they were posted", () =>
    Effect.gen(function* orderedContainer() {
      const ordered = binding("string", "ordered");

      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted("a", "", "b"), ordered)),
        value(ordered, stringOf("a"), stringOf("b")),
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted("b", "", "a"), ordered)),
        value(ordered, stringOf("b"), stringOf("a")),
      );
    }),
  );

  it.effect("decodes a multiple container's filled Controls as their multiset", () =>
    Effect.gen(function* multipleContainer() {
      const multiple = binding("string", "multiple");
      const decoded = yield* Effect.fromResult(decodeValue(posted("a", "", "b"), multiple));

      assert.strictEqual(decoded.baseType, "string");
      assert.strictEqual(decoded.cardinality, "multiple");
      assert.deepStrictEqual(
        decoded.values.map(format).toSorted((left, right) => left.localeCompare(right)),
        ["a", "b"],
      );
    }),
  );

  it.effect("decodes an ordered container whose Controls are all empty as NULL", () =>
    Effect.gen(function* emptyContainer() {
      const ordered = binding("string", "ordered");

      assert.deepStrictEqual(
        yield* Effect.fromResult(decode(posted("", "", ""), ordered)),
        value(ordered),
      );
    }),
  );

  it.effect(
    "posts a point as one entry, x then y separated by a space, as QTI's point is two integers, horizontal then vertical",
    () =>
      Effect.gen(function* pointEntry() {
        const ordered = binding("point", "ordered");
        const points = value(
          ordered,
          { baseType: "point", value: [102n, 113n] },
          { baseType: "point", value: [-3n, 0n] },
        );

        assert.deepStrictEqual(encode(points, ordered), posted("102 113", "-3 0"));
        assert.deepStrictEqual(
          yield* Effect.fromResult(decode(posted("102 113", "-3 0"), ordered)),
          points,
        );
        assert.deepStrictEqual(
          [posted("102"), posted("102 113 1"), posted("1.5 2"), posted(" 102 113")].map((entries) =>
            Result.isFailure(decode(entries, ordered)),
          ),
          [true, true, true, true],
        );
      }),
  );

  it.effect(
    "posts a multiple directedPair as one source-then-target entry per pair, which partition and decode read back as the same multiset, a repeat kept and a reversed pair its own",
    () =>
      // Oracle: QTI's directedPair is "a directed association between two objects", its two
      // identifiers "the source and destination objects", so B G2 and G2 B are two values; a
      // multiple container "is processed as an unordered list of these values", and a pair made
      // twice "appears multiple times in the value of the response variable" (information model,
      // BaseTypeEnum, the glossary's Multiple Response, and section 2.4.3.4).
      Effect.gen(function* directedPairs() {
        const multiple = binding("directedPair", "multiple");
        const pairs = value(
          multiple,
          directedPair("A", "G1"),
          directedPair("B", "G2"),
          directedPair("A", "G1"),
          directedPair("G2", "B"),
        );
        const entries = encode(pairs, multiple);
        const host: Entry = ["csrf-token", "abc"];
        const other: Entry = [entryName(otherInstance, "RESPONSE"), "C G3"];

        assert.deepStrictEqual(entries, posted("A G1", "B G2", "A G1", "G2 B"));
        for (const order of [entries, entries.toReversed()]) {
          const decoded = yield* Effect.fromResult(
            decodeValue(partition([host, ...order, other], instance).own, multiple),
          );

          assert.strictEqual(decoded.baseType, "directedPair");
          assert.strictEqual(decoded.cardinality, "multiple");
          assert.deepStrictEqual(
            decoded.values.map(format).toSorted((left, right) => left.localeCompare(right)),
            ["A G1", "A G1", "B G2", "G2 B"],
          );
        }
      }),
  );

  it.effect(
    "posts and decodes a point response R beside a string response R.x, both NCNames, as QTI's IdentifierDType is",
    () =>
      Effect.gen(function* dottedIdentifiers() {
        const point: ValueBinding = {
          baseType: "point",
          cardinality: "single",
          name: entryName(instance, "R"),
        };
        const string: ValueBinding = {
          baseType: "string",
          cardinality: "single",
          name: entryName(instance, "R.x"),
        };
        const placed = value(point, { baseType: "point", value: [3n, 4n] });
        const typed = value(string, stringOf("hello"));
        const entries = [...encode(placed, point), ...encode(typed, string)];

        assert.deepStrictEqual(yield* Effect.fromResult(decode(entries, point)), placed);
        assert.deepStrictEqual(yield* Effect.fromResult(decode(entries, string)), typed);
      }),
  );

  it.effect(
    "reads End Attempt's boolean as QTI sets it: true from its own button's entry, false when the form posted none, or another End Attempt's",
    () =>
      Effect.gen(function* endAttemptAbsent() {
        const ended = binding("boolean");
        const notEnded = value(ended, { baseType: "boolean", value: false });
        const options = { absent: notEnded };

        assert.deepStrictEqual(
          yield* Effect.fromResult(decode(posted("true"), ended, options)),
          value(ended, { baseType: "boolean", value: true }),
        );
        assert.deepStrictEqual(yield* Effect.fromResult(decode([], ended, options)), notEnded);
        assert.deepStrictEqual(
          yield* Effect.fromResult(
            decode([[entryName(instance, "OTHER"), "true"]], ended, options),
          ),
          notEnded,
        );
      }),
  );
});

describe("a record binding", () => {
  // `tsc` refuses each type line once a decoder's result parts from its binding's kind.
  it("decodeValue gives a Value, decodeRecord a record, and decode either, by the binding's kind", () => {
    expectTypeOf(decodeValue).returns.toEqualTypeOf<Result.Result<Value, Malformed>>();
    expectTypeOf(decodeRecord).returns.toEqualTypeOf<Result.Result<RecordValue, Malformed>>();
    expectTypeOf(decode).returns.toEqualTypeOf<Result.Result<ResponseValue, Malformed>>();
    assert.deepStrictEqual(Result.getSuccess(decode([], recordBinding)), Option.some(record()));
    assert.deepStrictEqual(
      Result.getSuccess(decode([], binding("string"))),
      Option.some(value(binding("string"))),
    );
  });

  it.effect("each of the table's examples decodes to its record", () =>
    Effect.gen(function* tableExamples() {
      const examples: readonly (readonly [string, RecordValue])[] = [
        [
          "  12 ",
          numberRecord("  12 ", {
            floatValue: 12,
            integerValue: 12n,
            leftDigits: 2n,
            ndp: 0n,
            nsf: 2n,
            rightDigits: 0n,
          }),
        ],
        [
          "-0.050",
          numberRecord("-0.050", {
            floatValue: -0.05,
            leftDigits: 1n,
            ndp: 3n,
            nsf: 2n,
            rightDigits: 3n,
          }),
        ],
        [
          "1.5e3",
          numberRecord("1.5e3", {
            exponent: 3n,
            floatValue: 1500,
            leftDigits: 1n,
            ndp: -2n,
            nsf: 2n,
            rightDigits: 1n,
          }),
        ],
        [
          "5.",
          numberRecord("5.", {
            floatValue: 5,
            integerValue: 5n,
            leftDigits: 1n,
            ndp: 0n,
            nsf: 1n,
            rightDigits: 0n,
          }),
        ],
        ["abc", record(field("stringValue", stringOf("abc")))],
      ];

      for (const [text, expected] of examples) {
        assert.deepStrictEqual(yield* Effect.fromResult(decodeRecordOf(text)), expected, text);
      }
    }),
  );

  it.effect("an empty post, or none, is a NULL record", () =>
    Effect.gen(function* nullRecord() {
      assert.deepStrictEqual(yield* Effect.fromResult(decodeRecordOf("")), record());
      assert.deepStrictEqual(yield* Effect.fromResult(decodeRecordOf()), record());
    }),
  );

  it.effect("zeros, a sign and a lone fraction count their digits as the table says", () =>
    Effect.gen(function* digitCounts() {
      const examples: readonly (readonly [string, RecordValue])[] = [
        [
          "0.000",
          numberRecord("0.000", {
            floatValue: 0,
            leftDigits: 1n,
            ndp: 3n,
            nsf: 3n,
            rightDigits: 3n,
          }),
        ],
        [
          "0",
          numberRecord("0", {
            floatValue: 0,
            integerValue: 0n,
            leftDigits: 1n,
            ndp: 0n,
            nsf: 1n,
            rightDigits: 0n,
          }),
        ],
        [
          "100",
          numberRecord("100", {
            floatValue: 100,
            integerValue: 100n,
            leftDigits: 3n,
            ndp: 0n,
            nsf: 3n,
            rightDigits: 0n,
          }),
        ],
        [
          ".5",
          numberRecord(".5", {
            floatValue: 0.5,
            leftDigits: 0n,
            ndp: 1n,
            nsf: 1n,
            rightDigits: 1n,
          }),
        ],
        [
          "+007",
          numberRecord("+007", {
            floatValue: 7,
            integerValue: 7n,
            leftDigits: 3n,
            ndp: 0n,
            nsf: 1n,
            rightDigits: 0n,
          }),
        ],
        [
          "2E-1",
          numberRecord("2E-1", {
            exponent: -1n,
            floatValue: 0.2,
            leftDigits: 1n,
            ndp: 1n,
            nsf: 1n,
            rightDigits: 0n,
          }),
        ],
      ];

      for (const [text, expected] of examples) {
        assert.deepStrictEqual(yield* Effect.fromResult(decodeRecordOf(text)), expected, text);
      }
    }),
  );

  it.effect("1e400 gives the floatValue INF, exponent 400 and ndp -400", () =>
    Effect.gen(function* beyondDouble() {
      assert.deepStrictEqual(
        yield* Effect.fromResult(decodeRecordOf("1e400")),
        numberRecord("1e400", {
          exponent: 400n,
          floatValue: Number.POSITIVE_INFINITY,
          leftDigits: 1n,
          ndp: -400n,
          nsf: 1n,
          rightDigits: 0n,
        }),
      );
    }),
  );

  it.effect("a 10,000-digit numeral gives an exact integerValue and leftDigits 10000", () =>
    Effect.gen(function* longNumeral() {
      const decoded = yield* Effect.fromResult(decodeRecordOf("7".repeat(10_000)));
      const sevens = (7n * (10n ** 10_000n - 1n)) / 9n;

      assert.deepStrictEqual(
        fieldOf(decoded, "integerValue"),
        Option.some({ baseType: "integer", value: sevens }),
      );
      assert.deepStrictEqual(
        fieldOf(decoded, "leftDigits"),
        Option.some({ baseType: "integer", value: 10_000n }),
      );
      assert.deepStrictEqual(
        fieldOf(decoded, "floatValue"),
        Option.some({ baseType: "float", value: Number.POSITIVE_INFINITY }),
      );
    }),
  );

  it.effect(
    "INF, -INF, NaN, grouping, a no-break space, and ff under base 16 give stringValue alone",
    () =>
      Effect.gen(function* notNumbers() {
        for (const text of ["INF", "-INF", "NaN", "1,000", "\u00A012", "1 2", "."]) {
          assert.deepStrictEqual(
            yield* Effect.fromResult(decodeRecordOf(text)),
            record(field("stringValue", stringOf(text))),
            text,
          );
        }
        assert.deepStrictEqual(
          yield* Effect.fromResult(decode(posted("ff"), recordBinding, { base: 16 })),
          record(field("stringValue", stringOf("ff"))),
        );
      }),
  );

  it.effect(
    "CRLF and a lone CR become LF in stringValue, and XML whitespace around a number is trimmed",
    () =>
      Effect.gen(function* lineBreaks() {
        assert.deepStrictEqual(
          yield* Effect.fromResult(decodeRecordOf("\t3\r\n")),
          numberRecord("\t3\n", {
            floatValue: 3,
            integerValue: 3n,
            leftDigits: 1n,
            ndp: 0n,
            nsf: 1n,
            rightDigits: 0n,
          }),
        );
        assert.deepStrictEqual(
          fieldOf(yield* Effect.fromResult(decodeRecordOf("a\rb")), "stringValue"),
          Option.some(stringOf("a\nb")),
        );
      }),
  );

  it.effect("two entries are single-many, and U+0001 is character", () =>
    Effect.gen(function* refusals() {
      const many = yield* Effect.flip(Effect.fromResult(decodeRecordOf("1", "2")));
      assert.deepStrictEqual([many._tag, many.reason], ["Malformed", "single-many"]);

      const character = yield* Effect.flip(Effect.fromResult(decodeRecordOf("1\u0001")));
      assert.strictEqual(character.reason, "character");
    }),
  );

  it.effect("encode posts a record's stringValue, which decode reads back", () =>
    Effect.gen(function* recordRoundTrip() {
      const answer = record(
        field("stringValue", stringOf(" 4.20\n")),
        field("floatValue", { baseType: "float", value: 4.2 }),
      );

      assert.deepStrictEqual(encode(answer, recordBinding), posted(" 4.20\n"));
      assert.deepStrictEqual(encode(record(), recordBinding), []);

      const decoded = yield* Effect.fromResult(
        decodeRecord(encode(answer, recordBinding), recordBinding),
      );
      assert.deepStrictEqual(fieldOf(decoded, "stringValue"), fieldOf(answer, "stringValue"));
    }),
  );
});

describe("checkInstance", () => {
  it("refuses an empty token first", () => {
    assert.deepStrictEqual(checkInstance(""), Option.some({ requirement: "non-empty" }));
  });

  it("refuses a character outside ASCII letters, digits, _, ., : and -, naming the first", () => {
    for (const [token, character] of [
      ["a b", " "],
      ["«r1»", "«"],
      ["q1/2", "/"],
      ["é", "é"],
    ] as const) {
      assert.deepStrictEqual(
        checkInstance(token),
        Option.some({ character, requirement: "characters" }),
        token,
      );
    }
  });

  it("refuses a trailing - and a --, which would let a chrome id meet an authored id", () => {
    for (const [token, at] of [
      ["ab-", "end"],
      ["a--b", "double"],
      ["-", "end"],
      ["--", "end"],
    ] as const) {
      assert.deepStrictEqual(
        checkInstance(token),
        Option.some({ at, requirement: "id-boundary" }),
        token,
      );
    }
  });

  it("admits React's useId forms, a host's dotted key and a plain token", () => {
    for (const token of ["_r_1_", ":r1:", "q1", "a.b", instance]) {
      assert.deepStrictEqual(checkInstance(token), Option.none(), token);
    }
  });
});

describe("responseOf", () => {
  it("reads back the response entryName named, for every instance and identifier", () => {
    for (const token of [instance, "q1", "_r_1_", ":r1:"]) {
      for (const response of ["RESPONSE", "R.x", "R-1", ""]) {
        assert.deepStrictEqual(
          responseOf(token, entryName(token, response)),
          Option.some(response),
        );
      }
    }
  });

  it("reads no response from another instance's name, a longer token's or a name with no dot", () => {
    assert.deepStrictEqual(
      responseOf(instance, entryName(otherInstance, "RESPONSE")),
      Option.none(),
    );
    assert.deepStrictEqual(responseOf("q1", "q10.RESPONSE"), Option.none());
    assert.deepStrictEqual(responseOf("q1", "RESPONSE"), Option.none());
  });
});

describe("partition", () => {
  it("takes an entry as this instance's for any valid token, by the <instance>. prefix", () => {
    const own: Entry = ["q1.RESPONSE", "A"];
    assert.deepStrictEqual(partition([own], "q1").own, [own]);

    const react: Entry = ["_r_1_.RESPONSE", "A"];
    assert.deepStrictEqual(partition([react], "_r_1_").own, [react]);
  });

  it("takes a longer token's entry as a host field, not as this instance's", () => {
    const longer: Entry = ["q10.RESPONSE", "A"];
    assert.deepStrictEqual(partition([longer], "q1"), { host: [longer], own: [] });
  });

  it("takes another instance's entry and a name with no dot as the host's", () => {
    const other: Entry = [entryName(otherInstance, "RESPONSE"), "B"];
    const bare: Entry = ["RESPONSE", "C"];
    assert.deepStrictEqual(partition([other, bare], "q1"), { host: [other, bare], own: [] });
  });

  it("sets this instance's entries apart from the host's, in posted order", () => {
    const own: Entry = [entryName(instance, "RESPONSE"), "choiceA"];
    const other: Entry = [entryName(otherInstance, "RESPONSE"), "choiceB"];
    const host: Entry = ["csrf-token", "abc"];
    const dotted: Entry = ["section.RESPONSE", "x"];

    assert.deepStrictEqual(partition([host, own, other, dotted], instance), {
      host: [host, other, dotted],
      own: [own],
    });
  });
});
