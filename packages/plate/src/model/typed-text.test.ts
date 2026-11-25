/**
 * Plate's one reading of the text a child types into a box (`#plate/model/typed-text.ts`), against
 * the value model's lexical rules, QTI's `TextFormatEnum`, the information model's record fields of
 * a string interaction (2.4.2.2, spec reading 191) and the integers a Text Entry's `base` names,
 * every case a value written from the rule: an integer exact at any size and in every base, a float
 * finite, a string's line breaks a textarea's, and a character XML cannot carry unread.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { growthFactor, growthLimit, growthRatio } from "@qti-pie/crust/test/growth.ts";
import { Effect, Option, Result } from "effect";
import {
  asTyped,
  readRecord,
  readTyped,
  typedResponseOf,
  typedText,
} from "#plate/model/typed-text.ts";
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

describe("readTyped", () => {
  it.effect("reads a string, an integer and a float, and empty text as no answer", () =>
    Effect.gen(function* plainValues() {
      assert.deepStrictEqual(
        yield* read(" a b ", reading("string")),
        Option.some(stringOf(" a b ")),
      );
      assert.deepStrictEqual(yield* read("-12", reading("integer")), Option.some(integer(-12n)));
      assert.deepStrictEqual(
        yield* read("2.5", reading("float")),
        Option.some({ baseType: "float", value: 2.5 }),
      );

      for (const baseType of ["string", "integer", "float"] as const) {
        assert.deepStrictEqual(yield* read("", reading(baseType)), Option.none(), baseType);
      }
    }),
  );

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

  it("reads a plain box's text of XML white space alone as no answer, and any other text whole, over every blank of up to four characters (TextFormatEnum plain, SV-DESIGN-05)", () => {
    const plain = reading("string", 10, true);
    const space = [" ", "\t", "\n", "\r"];
    const blanks = [""];
    for (let length = 1; length <= 4; length += 1) {
      for (const shorter of blanks.filter((each) => each.length === length - 1)) {
        blanks.push(...space.map((character) => shorter + character));
      }
    }
    assert.lengthOf(blanks, 341);
    for (const blank of blanks) {
      assert.deepStrictEqual(
        Result.getSuccess(readTyped(blank, plain)),
        Option.some(Option.none()),
        JSON.stringify(blank),
      );
    }
    // A box's CR reads as a line feed, as every typed line break does, so the kept text is the blanks
    // of space, tab and line feed alone.
    for (const blank of blanks.slice(1).filter((each) => !each.includes("\r"))) {
      for (const written of [`${blank}a`, `a${blank}`, `${blank}0${blank}`]) {
        assert.deepStrictEqual(
          Result.getSuccess(readTyped(written, plain)),
          Option.some(Option.some(stringOf(written))),
          JSON.stringify(written),
        );
      }
    }
  });

  it("leaves abc, INF, -INF, NaN and a decimal beyond the largest double, an infinity, unread as a float", () => {
    for (const text of ["abc", "INF", "-INF", "NaN", "1E999", "-1E999"]) {
      assert.deepStrictEqual(unreadOf(text, reading("float")), Option.some("number"), text);
    }
  });

  it.effect("trims a number, then reads an integer in its base", () =>
    Effect.gen(function* integerBase() {
      assert.deepStrictEqual(yield* read(" 7 ", reading("integer")), Option.some(integer(7n)));
      assert.deepStrictEqual(
        yield* read(" 1E3 ", reading("float")),
        Option.some({ baseType: "float", value: 1000 }),
      );
      assert.deepStrictEqual(yield* read("101", reading("integer", 2)), Option.some(integer(5n)));
      assert.deepStrictEqual(
        yield* read("-ff", reading("integer", 16)),
        Option.some(integer(-255n)),
      );
      assert.deepStrictEqual(unreadOf("102", reading("integer", 2)), Option.some("number"));
      assert.deepStrictEqual(yield* read("   ", reading("integer")), Option.none());
    }),
  );

  it.effect("reads a typed integer exactly, beyond the safe integers", () =>
    Effect.gen(function* exactIntegers() {
      const cases: readonly (readonly [string, bigint])[] = [
        ["9007199254740993", 2n ** 53n + 1n],
        [" 1000000000000000000000000000000 ", 10n ** 30n],
        ["-1000000000000000000000000000000", -(10n ** 30n)],
        ["+0009007199254740993", 2n ** 53n + 1n],
      ];

      for (const [text, exact] of cases) {
        assert.deepStrictEqual(yield* read(text, reading("integer")), Option.some(integer(exact)));
      }
    }),
  );

  it.effect("reads a typed integer exactly in bases 16 and 7", () =>
    Effect.gen(function* exactInBase() {
      const exact = Option.some(integer(2n ** 53n + 1n));

      assert.deepStrictEqual(yield* read("20000000000001", reading("integer", 16)), exact);
      assert.deepStrictEqual(
        yield* read((2n ** 53n + 1n).toString(7), reading("integer", 7)),
        exact,
      );
      assert.deepStrictEqual(
        yield* read(`-${(10n ** 30n).toString(7)}`, reading("integer", 7)),
        Option.some(integer(-(10n ** 30n))),
      );
    }),
  );

  it.effect(
    "writes an integer back in the base it is read in, and in base 10 outside 2 to 36",
    () =>
      Effect.gen(function* writeInBase() {
        const integers = [-(2n ** 64n), -255n, -1n, 0n, 1n, 35n, 36n, 2n ** 53n + 1n];

        for (let base = 2; base <= 36; base += 1) {
          for (const each of integers) {
            const single = { baseType: "integer", value: each } as const;

            assert.deepStrictEqual(
              yield* read(typedText(single, base), reading("integer", base)),
              Option.some(single),
              `${String(each)} in base ${String(base)}`,
            );
          }
        }

        const negative = { baseType: "integer", value: -255n } as const;

        assert.strictEqual(typedText(negative, 16), "-ff");
        assert.strictEqual(typedText(negative, 10), "-255");
        for (const base of [1, 2.5, 37]) {
          assert.strictEqual(typedText(negative, base), "-255", String(base));
        }
      }),
  );

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

  it("leaves a decimal, INF, a bare sign and a base outside 2 to 36 unread as an integer", () => {
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
      assert.deepStrictEqual(
        unreadOf(text, reading("integer", base)),
        Option.some("number"),
        `${text} in base ${String(base)}`,
      );
    }
  });

  it.effect("turns a typed CRLF and a lone CR into LF", () =>
    Effect.gen(function* lineFeeds() {
      assert.deepStrictEqual(
        yield* read("a\r\nb", reading("string")),
        Option.some(stringOf("a\nb")),
      );
      assert.deepStrictEqual(
        yield* read("a\rb\n", reading("string")),
        Option.some(stringOf("a\nb\n")),
      );
    }),
  );

  it("leaves text holding a character XML cannot carry unread, and keeps tab, line breaks and an astral character", () => {
    for (const text of ["a\u0000b", "a\u000Bb", "a￾b", "a￿b", "a\u001Fb", "a\uD800b"]) {
      for (const baseType of ["string", "integer", "float"] as const) {
        assert.deepStrictEqual(
          unreadOf(text, reading(baseType)),
          Option.some("character"),
          `${JSON.stringify(text)} as ${baseType}`,
        );
      }
    }
    assert.deepStrictEqual(
      Result.getSuccess(readTyped("a\tb\nc\r\nd\u{1F600}", reading("string"))),
      Option.some(Option.some(stringOf("a\tb\nc\nd\u{1F600}"))),
    );
  });
});

describe("readRecord", () => {
  it.effect("each of the table's examples reads as its record", () =>
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
        assert.deepStrictEqual(yield* recordOf(text), expected, text);
      }
    }),
  );

  it.effect("empty text is the NULL record", () =>
    Effect.gen(function* nullRecord() {
      assert.deepStrictEqual(yield* recordOf(""), record());
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
        assert.deepStrictEqual(yield* recordOf(text), expected, text);
      }
    }),
  );

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

  it.effect(
    "INF, -INF, NaN, grouping, a no-break space and digits past 9 give stringValue alone",
    () =>
      Effect.gen(function* notNumbers() {
        for (const text of ["INF", "-INF", "NaN", "1,000", " 12", "1 2", ".", "ff"]) {
          assert.deepStrictEqual(
            yield* recordOf(text),
            record(field("stringValue", stringOf(text))),
            text,
          );
        }
      }),
  );

  it.effect(
    "CRLF and a lone CR become LF in stringValue, and XML whitespace around a number is trimmed",
    () =>
      Effect.gen(function* lineBreaks() {
        assert.deepStrictEqual(
          yield* recordOf("\t3\r\n"),
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
          fieldOf(yield* recordOf("a\rb"), "stringValue"),
          Option.some(stringOf("a\nb")),
        );
      }),
  );

  it("U+0001 is unread, a character XML cannot carry", () => {
    assert.deepStrictEqual(
      Result.getFailure(readRecord("1\u0001", false)),
      Option.some("character"),
    );
  });
});

describe("typedResponseOf", () => {
  it("reads a record box as the record of its text, numbers' fields given only where the text is a number (reading 191)", () => {
    const declared = { cardinality: "record", identifier: "RESPONSE" } as const;
    const plain = reading("string", 10, true);

    assert.deepStrictEqual(typedResponseOf(["24 lb"], declared, plain, asTyped), [
      { texts: ["24 lb"], unread: false },
      record(field("stringValue", stringOf("24 lb"))),
    ]);
    assert.deepStrictEqual(typedResponseOf(["24"], declared, plain, asTyped), [
      { texts: ["24"], unread: false },
      numberRecord("24", {
        floatValue: 24,
        integerValue: 24n,
        leftDigits: 2n,
        ndp: 0n,
        nsf: 2n,
        rightDigits: 0n,
      }),
    ]);
    assert.deepStrictEqual(typedResponseOf(["  "], declared, plain, asTyped), [
      { texts: ["  "], unread: false },
      record(),
    ]);
  });

  it("leaves a whole-number box holding abc unread, its value NULL, and reads its digits in its base", () => {
    const declared = {
      baseType: "integer",
      cardinality: "single",
      identifier: "RESPONSE",
    } as const;

    assert.deepStrictEqual(typedResponseOf(["abc"], declared, reading("integer"), asTyped), [
      { texts: ["abc"], unread: true },
      { baseType: "integer", cardinality: "single", values: [] },
    ]);
    assert.deepStrictEqual(typedResponseOf(["ff"], declared, reading("integer", 16), asTyped), [
      { texts: ["ff"], unread: false },
      { baseType: "integer", cardinality: "single", values: [integer(255n)] },
    ]);
  });

  it("holds every box's text and reads the answers in the boxes' order, a blank box of plain text no answer (TextFormatEnum)", () => {
    const declared = {
      baseType: "string",
      cardinality: "ordered",
      identifier: "RESPONSE",
    } as const;
    const texts = ["b", "", " \t ", "a"];

    assert.deepStrictEqual(typedResponseOf(texts, declared, reading("string", 10, true), asTyped), [
      { texts, unread: false },
      { baseType: "string", cardinality: "ordered", values: [stringOf("b"), stringOf("a")] },
    ]);
  });

  it("judges whether a box is an answer by the text it shows, and reads the text it writes", () => {
    const declared = {
      baseType: "string",
      cardinality: "multiple",
      identifier: "RESPONSE",
    } as const;
    const wrapped = {
      read: (posted: string) => posted.slice(3, -4),
      write: (text: string) => `<p>${text}</p>`,
    };

    assert.deepStrictEqual(typedResponseOf(["", "x"], declared, reading("string"), wrapped), [
      { texts: ["", "x"], unread: false },
      { baseType: "string", cardinality: "multiple", values: [stringOf("<p>x</p>")] },
    ]);
  });
});
