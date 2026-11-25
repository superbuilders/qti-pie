/**
 * Plate's one reading of the text a child types into a box (`#plate/model/typed-text.ts`), against
 * the value model's lexical rules, QTI's `TextFormatEnum`, the information model's record fields of
 * a string interaction (2.4.2.2, spec reading 191) and the integers a Text Entry's `base` names,
 * every case a value written from the rule: an integer exact at any size and in every base, a float
 * finite, a string's line breaks a textarea's, and a character XML cannot carry unread; and the
 * texts a whole-number box takes, with no `pattern-mask` against a grammar of how an integer is
 * written, and under a mask against a brute force over every answer the mask's own matcher admits,
 * the K–2 forms' entries among the masks (their product spec: whole numbers, "leading zeros
 * rejected", a lone 0 valid, Kindergarten 0 to 20, Grades 1 and 2 up to three and four digits,
 * raised where a listed wrong answer is longer).
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { growthFactor, growthLimit, growthRatio } from "@qti-pie/crust/test/growth.ts";
import { Effect, Option, Result } from "effect";
import { readRecord, readTyped } from "#plate/model/typed-text.ts";
import type { TypedReading, UnreadReason } from "#plate/model/typed-text.ts";
import type { RecordField, RecordValue, Single } from "#plate/model/values.ts";

/**
 * Construct a box's reading for a test.
 *
 * @param baseType The base type its text is read as.
 * @param base The number base an integer is written in.
 * @param blankIsEmpty Whether a string of XML white space alone is no answer.
 * @returns The reading.
 */
const reading = (
  baseType: TypedReading["baseType"],
  base = 10,
  blankIsEmpty = false,
): TypedReading => ({ base, baseType, blankIsEmpty });

/**
 * Read a box's text, failing with why it is unread.
 *
 * @param text The box's text.
 * @param how How it is read.
 * @returns The value, none for no answer.
 */
const read = (
  text: string,
  how: TypedReading,
): Effect.Effect<Option.Option<Single>, UnreadReason> => Effect.fromResult(readTyped(text, how));

/**
 * Give why a box's text is unread, none when it reads.
 *
 * @param text The box's text.
 * @param how How it is read.
 * @returns The reason, or none.
 */
const unreadOf = (text: string, how: TypedReading): Option.Option<UnreadReason> =>
  Result.getFailure(readTyped(text, how));

/**
 * Construct an integer single.
 *
 * @param value The integer.
 * @returns The single.
 */
const integer = (value: bigint): Single => ({ baseType: "integer", value });

/**
 * Construct a string single.
 *
 * @param text The string.
 * @returns The single.
 */
const stringOf = (text: string): Single => ({ baseType: "string", value: text });

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
 * @param value The field's value.
 * @returns The field.
 */
const integerField = (name: string, value: bigint): RecordField => field(name, integer(value));

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
 * Construct the record a typed number reads as, its fields in `readRecord`'s order.
 *
 * @param text The typed text, its `stringValue`.
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
 * @param value The record.
 * @param name The field's identifier.
 * @returns The field's value, or none when the record has no such field.
 */
const fieldOf = (value: RecordValue, name: string): Option.Option<Single> =>
  Option.map(
    Option.fromUndefinedOr(value.fields.find((each) => each.identifier === name)),
    (found) => found.value,
  );

/**
 * Read a box's text as a record, failing with why it is unread.
 *
 * @param text The box's text.
 * @returns The record.
 */
const recordOf = (text: string): Effect.Effect<RecordValue, UnreadReason> =>
  Effect.fromResult(readRecord(text, false));

/**
 * The digits the Q-20 growth check reads first, before it reads {@link growthFactor} times as many.
 */
const fewerDigits = 12_500;

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

describe("readTyped", () => {
  it.effect(
    "reads a string of XML white space alone as no answer under blankIsEmpty, as QTI's TextFormatEnum reads plain and preformatted text, and as the text otherwise",
    () =>
      Effect.gen(function* blankText() {
        const blank = " \t\r\n ";

        // "where a response consists only of white-space characters … it should be treated as an
        // empty string (NULL)" (TextFormatEnum, plain and preformatted).
        assert.deepStrictEqual(yield* read(blank, reading("string", 10, true)), Option.none());
        assert.deepStrictEqual(yield* Effect.fromResult(readRecord(blank, true)), {
          cardinality: "record",
          fields: [],
        });
        assert.deepStrictEqual(
          yield* read(blank, reading("string")),
          Option.some(stringOf(" \t\n ")),
        );
      }),
  );

  it("leaves abc, INF, -INF, NaN and a decimal beyond the largest double, an infinity, unread as a float", () => {
    for (const text of ["abc", "INF", "-INF", "NaN", "1E999", "-1E999"]) {
      assert.deepStrictEqual(unreadOf(text, reading("float")), Option.some("number"), text);
    }
  });

  it.effect(
    "reads 100,000 base-36 digits exactly, 8 times the digits in under 32 times the time",
    () =>
      Effect.gen(function* longBase36() {
        const exact = 17n * 36n ** 99_999n + 7n ** 90_000n;
        const spelling = exact.toString(36);
        assert.strictEqual(spelling.length, 100_000);

        assert.deepStrictEqual(
          yield* read(spelling, reading("integer", 36)),
          Option.some(integer(exact)),
        );

        const growth = yield* digitGrowth(spelling, (digits) => {
          readTyped(digits, reading("integer", 36));
        });
        assert.isBelow(
          growth,
          growthLimit,
          `8 times the digits took ${growth.toFixed(1)} times as long`,
        );
      }),
  );

  it.effect("control: a quadratic parse fails the growth check", () =>
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
  );
});

describe("readRecord", () => {
  it.effect("1e400 gives the floatValue INF, exponent 400 and ndp -400", () =>
    Effect.gen(function* beyondDouble() {
      assert.deepStrictEqual(
        yield* recordOf("1e400"),
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
      const long = yield* recordOf("7".repeat(10_000));
      const sevens = (7n * (10n ** 10_000n - 1n)) / 9n;

      assert.deepStrictEqual(fieldOf(long, "integerValue"), Option.some(integer(sevens)));
      assert.deepStrictEqual(fieldOf(long, "leftDigits"), Option.some(integer(10_000n)));
      assert.deepStrictEqual(
        fieldOf(long, "floatValue"),
        Option.some({ baseType: "float", value: Number.POSITIVE_INFINITY }),
      );
    }),
  );
});
