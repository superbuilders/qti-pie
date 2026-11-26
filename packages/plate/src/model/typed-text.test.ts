/**
 * Plate's one reading of the text a child types into a box (`#plate/model/typed-text.ts`), against
 * the value model's lexical rules, QTI's `TextFormatEnum`, the information model's record fields of
 * a string interaction (2.4.2.2, spec reading `record-number-fields`) and the integers a Text
 * Entry's `base` names, every case a value written from the rule: an integer exact at any size and
 * in every base, a float finite, a string's line breaks a textarea's, and a character XML cannot
 * carry unread; and the texts a whole-number box takes, with no `pattern-mask` against a grammar of
 * how an integer is written, and under a mask against a brute force over every answer the mask's
 * own matcher admits, the K–2 forms' entries among the masks (their product spec: whole numbers,
 * "leading zeros rejected", a lone 0 valid, Kindergarten 0 to 20, Grades 1 and 2 up to three and
 * four digits, raised where a listed wrong answer is longer).
 *
 * @module
 */
import { availableParallelism } from "node:os";
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, element, map } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { growthFactor, growthLimit, growthRatio } from "@qti-pie/crust/test/growth.ts";
import { Array as Arr, Duration, Effect, Option, Result } from "effect";
import { readRecord, readTyped } from "#plate/model/typed-text.ts";
import type { TypedReading, UnreadReason } from "#plate/model/typed-text.ts";
import type { RecordField, RecordValue, Single } from "#plate/model/values.ts";
import { boxHolds } from "#plate/test/box.ts";

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
  base: number,
  blankIsEmpty: boolean,
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
const record = (fields: readonly RecordField[]): RecordValue => ({
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
  record([
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
  ]);

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

/**
 * How long one case of a search here may run before it is stopped and reported.
 */
const caseHang = Duration.seconds(30);

/**
 * The pieces a float box's text is written with in the float box: a digit, a run of digits long
 * enough as an exponent to put a numeral past the largest double, the point, both exponent marks,
 * both signs, the space's other literals `INF` and `NaN`, a letter and the space, which XML white
 * space a number sheds around it.
 */
const FLOAT_PIECES = ["1", "999", ".", "E", "e", "+", "-", "INF", "NaN", "a", " "] as const;

/**
 * Draw a text of the float box: every text of up to four of {@link FLOAT_PIECES}.
 */
const floatBoxText: Gen<string> = map(array(element(FLOAT_PIECES), { max: 4, min: 0 }), (pieces) =>
  pieces.join(""),
);

/**
 * How many texts {@link floatBoxText} draws: for each length of 0 to 4, every sequence of the
 * pieces.
 */
const FLOAT_BOX_TEXTS = 1 + 11 + 11 ** 2 + 11 ** 3 + 11 ** 4;

/**
 * Whether a character is XML white space (XML 1.0 production [3] S): the space, the tab, the
 * carriage return and the line feed.
 *
 * @param character One character.
 * @returns Whether it is.
 */
const isXmlSpace = (character: string): boolean =>
  character === " " || character === "\t" || character === "\r" || character === "\n";

/**
 * A text without its outer XML white space.
 *
 * @param text The text.
 * @returns What stands between its first and its last character that is no XML white space.
 */
const withoutOuterSpace = (text: string): string => {
  const characters = Arr.fromIterable(text);
  const first = Arr.findFirstIndex(characters, (character) => !isXmlSpace(character));
  const last = Arr.findLastIndex(characters, (character) => !isXmlSpace(character));

  return Option.match(Option.all([first, last]), {
    onNone: () => "",
    onSome: ([from, to]) => characters.slice(from, to + 1).join(""),
  });
};

/**
 * How many ASCII digits a text starts with.
 *
 * @param text The text.
 * @returns The length of its leading run of digits.
 */
const leadingDigits = (text: string): number =>
  Option.getOrElse(
    Arr.findFirstIndex(Arr.fromIterable(text), (character) => character < "0" || character > "9"),
    () => text.length,
  );

/**
 * A text without one leading sign.
 *
 * @param text The text.
 * @returns The text after its `+` or `-`, the text itself when it starts with neither.
 */
const unsigned = (text: string): string =>
  text.startsWith("+") || text.startsWith("-") ? text.slice(1) : text;

/**
 * Whether a text is a numeral of xs:double's lexical space as XML Schema 1.0 Part 2 states it
 * (section 3.2.5): a mantissa, a decimal (section 3.2.3: an optional sign, then digits with an
 * optional period before, among or after them, one digit at least), then optionally `E` or `e` and
 * an exponent, an integer (an optional sign, then one digit or more). The space's other literals,
 * `INF`, `-INF` and `NaN`, are no numerals.
 *
 * @param text The text, its outer white space shed.
 * @returns Whether it is a numeral.
 */
const isDoubleNumeral = (text: string): boolean => {
  const mantissa = unsigned(text);
  const whole = leadingDigits(mantissa);
  const afterWhole = mantissa.slice(whole);
  const pointed = afterWhole.startsWith(".");
  const fraction = pointed ? leadingDigits(afterWhole.slice(1)) : 0;
  const rest = pointed ? afterWhole.slice(1 + fraction) : afterWhole;
  if (whole + fraction === 0) {
    return false;
  }

  if (rest === "") {
    return true;
  }

  const exponent = unsigned(rest.slice(1));

  return (
    (rest.startsWith("E") || rest.startsWith("e")) &&
    exponent !== "" &&
    leadingDigits(exponent) === exponent.length
  );
};

/**
 * What a float box's text reaches that a reader could misread.
 */
const floatSituations = [
  "no answer",
  "a finite numeral",
  "a numeral past the largest double",
  "INF or NaN",
  "no numeral",
] as const;

/**
 * A {@link floatSituations} member.
 */
type FloatSituation = (typeof floatSituations)[number];

/**
 * What a float box gives for a text, by the rule the oracle states: no answer for text of XML
 * white space alone, the double a finite numeral names (ECMAScript's StringToNumber, which rounds
 * a decimal to the nearest double, ties to even, as XML Schema 1.1's doubleLexicalMap does), and
 * `number` for every other text, `INF`, `-INF`, `NaN` and a numeral past the largest double among
 * them (reading `bounded-double`).
 *
 * @param text The box's text.
 * @returns What the box gives, and the situation the text reaches.
 */
const floatBoxExpected = (
  text: string,
): readonly [Result.Result<Option.Option<Single>, UnreadReason>, FloatSituation] => {
  const lexical = withoutOuterSpace(text);
  if (lexical === "") {
    return [Result.succeedNone, "no answer"];
  }

  if (!isDoubleNumeral(lexical)) {
    return [
      Result.fail("number"),
      ["INF", "-INF", "NaN"].includes(lexical) ? "INF or NaN" : "no numeral",
    ];
  }

  const value = Number(lexical);

  return Number.isFinite(value)
    ? [Result.succeedSome({ baseType: "float", value }), "a finite numeral"]
    : [Result.fail("number"), "a numeral past the largest double"];
};

describe("readTyped", () => {
  it.effect(
    "reads a string of XML white space alone as no answer under blankIsEmpty, as QTI's TextFormatEnum reads plain and preformatted text, and as the text otherwise",
    () =>
      Effect.gen(function* blankText() {
        const blank = " \t\r\n ";

        assert.deepStrictEqual(
          yield* read(blank, reading("string", 10, true)),
          Option.none(),
          '"where a response consists only of white-space characters … it should be treated as an empty string (NULL)" (TextFormatEnum, plain and preformatted).',
        );
        assert.deepStrictEqual(yield* Effect.fromResult(readRecord(blank, true)), {
          cardinality: "record",
          fields: [],
        });
        assert.deepStrictEqual(
          yield* read(blank, reading("string", 10, false)),
          Option.some(stringOf(" \t\n ")),
        );
      }),
  );

  it.effect(
    `reads as a float only a finite xs:double numeral, leaving INF, -INF, NaN, a numeral past the largest double and every other text unread, over every text of up to 4 of ${String(FLOAT_PIECES.length)} pieces: ${String(FLOAT_BOX_TEXTS)} texts`,
    (ctx) =>
      Effect.andThen(
        boxHolds(floatBoxText, FLOAT_BOX_TEXTS),
        searched(
          ctx,
          exhaust(
            {
              box: "every text of 0 to 4 pieces over a digit, 999, the point, E, e, both signs, INF, NaN, a letter and the space",
              caseHang,
              concurrency: availableParallelism(),
              coverage: requiredInSpace<FloatSituation>(floatSituations),
              generator: floatBoxText,
              literal: (text) => JSON.stringify(text),
              oracle: {
                kind: "specification",
                name: "XML Schema 1.0 Part 2's xs:double numeral (sections 3.2.5 and 3.2.3), transcribed here, after the outer XML white space a number sheds (XML 1.0 [3] S): a finite one reads as the double ECMAScript's StringToNumber names, ties to even as doubleLexicalMap; INF, -INF, NaN and one past the largest double are unread as no number (reading `bounded-double`), and blank text is no answer",
              },
              suite: "plate/typed-text/float-box",
            },
            (text, c) =>
              Effect.sync(() => {
                const [expected, situation] = floatBoxExpected(text);
                c.note(situation);

                assert.deepStrictEqual(
                  readTyped(text, reading("float", 10, false)),
                  expected,
                  JSON.stringify(text),
                );
              }),
          ),
        ),
      ),
  );

  it.effect(
    "reads 100,000 base-36 digits exactly, 8 times the digits in under 32 times the time",
    () =>
      Effect.gen(function* longBase36() {
        const exact = 17n * 36n ** 99_999n + 7n ** 90_000n;
        const spelling = exact.toString(36);
        assert.strictEqual(spelling.length, 100_000);

        assert.deepStrictEqual(
          yield* read(spelling, reading("integer", 36, false)),
          Option.some(integer(exact)),
        );

        const growth = yield* digitGrowth(spelling, (digits) => {
          readTyped(digits, reading("integer", 36, false));
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
