/**
 * The one reading of the text a child types into a box, a Text Entry's `input` or one of an
 * Extended Text's `textarea`s, as a value of the response it writes, and the one writing of a value
 * back into a box: what the typed islands derive their responses from (`#plate/ui/typed.ts`), so a
 * box's text is the child's, exactly as typed, and the value is a function of it. It renders
 * nothing and loads no browser API, so `@qti-pie/plate` exports it for server code that reads a
 * typed text as a page does: {@link typedResponseOf} a response from its boxes' texts, the islands'
 * own, {@link readTyped} and {@link readRecord} one box's, and {@link typedEntry} and
 * {@link takesTyped} which texts a box takes at all.
 *
 * A box writes a `string`, an `integer` in the interaction's `base`, a `float`, or, for a record
 * response, the record QTI gives a string interaction's text (information model 2.4.2.2, spec
 * reading `record-number-fields`). Text that is no value of its base type, `abc` or a bare `-` in
 * an integer box, is {@link UnreadReason}: no response can carry it, so the island holds it as typed
 * and its response posts none of it.
 *
 * @module
 */
import { regex } from "arkregex";
import { Array, Option, Result } from "effect";
import {
  empty,
  literal,
  never as noText,
  RegexBuilder,
  runsOf,
  seq,
  set,
} from "@qti-pie/crust/regex.ts";
import type { Typed } from "#plate/held.ts";
import { compileLanguage, languageOf, matches, prefixesOf } from "#plate/model/regex.ts";
import type { Language, Matcher } from "#plate/model/regex.ts";
import {
  format,
  isXmlText,
  nullOf,
  nullRecord,
  parseLexical,
  trimXmlSpace,
} from "#plate/model/values.ts";
import type {
  Declared,
  RecordDeclared,
  RecordField,
  RecordValue,
  ResponseValue,
  Single,
} from "#plate/model/values.ts";

/**
 * How a box's text is read as an answer.
 */
export interface TypedReading {
  /**
   * The number base an `integer` answer is written in, the interaction's `base`: an integer from 2
   * to 36, 10 when the author wrote none (the XSD's default). In any other base no text is an
   * integer.
   */
  readonly base: number;
  /**
   * The base type of the response the box writes. A record response is typed as a `string`, the
   * text its fields are read from.
   */
  readonly baseType: "float" | "integer" | "string";
  /**
   * Whether a `string` of XML white space alone is no answer, as QTI's `TextFormatEnum` asks of
   * `plain` and `preformatted` text: "where a response consists only of white-space characters …
   * it should be treated as an empty string (NULL)". Otherwise only empty text is no answer.
   */
  readonly blankIsEmpty: boolean;
}

/**
 * A typed response as its declaration types it, which a Text Entry or an Extended Text writes: a
 * `string`, an `integer` or a `float` of any cardinality but `record`, or a record, whose
 * `stringValue` the box's text is.
 */
export type TypedDeclared = Declared<TypedReading["baseType"]> | RecordDeclared;

/**
 * Why a box's text is no value of its base type: `character`, it holds a character XML cannot
 * carry, a control character other than tab, line feed and carriage return, U+FFFE, U+FFFF or a
 * lone surrogate, so no result could hold it; `number`, an `integer` box's text is no integer in
 * its base or a `float` box's no finite decimal.
 */
export type UnreadReason = "character" | "number";

/**
 * Read the text a typed number holds: the text with its outer XML white space shed, as XSD's
 * collapse facet reads a number (spec reading `typed-value-whitespace`), none where nothing is
 * left, which is no answer.
 *
 * @param text The box's text.
 * @returns The number's lexical form, none for blank text.
 */
const typedNumber = (text: string): Option.Option<string> =>
  Option.liftPredicate(trimXmlSpace(text), (lexical) => lexical !== "");

/**
 * Read the lexical form a box's text holds, none where it is no answer: a number's
 * {@link typedNumber}; a `string`'s text as typed, none when it is empty or, under `blankIsEmpty`,
 * when it holds XML white space alone (QTI's `TextFormatEnum`: such a response "should be treated
 * as an empty string (NULL)").
 *
 * @param text The box's text.
 * @param reading How the box's text is read.
 * @returns The lexical form, none for no answer.
 */
export const typedLexical = (text: string, reading: TypedReading): Option.Option<string> => {
  if (reading.baseType !== "string") {
    return typedNumber(text);
  }

  return text === "" || (reading.blankIsEmpty && trimXmlSpace(text) === "")
    ? Option.none()
    : Option.some(text);
};

/**
 * The prefix `BigInt` takes to read a magnitude in each base it reads.
 */
const bigIntPrefixes: ReadonlyMap<number, string> = new Map([
  [2, "0b"],
  [8, "0o"],
  [10, ""],
  [16, "0x"],
]);

/**
 * The most digits {@link readByHalves} folds as a float: 36^10 − 1 is below 2^53, so the fold is
 * exact in every base up to 36.
 */
const leafLength = 10;

/**
 * Read the magnitude of digits in a base `BigInt` does not read, by halves: the high half times
 * the base to the length of the low half, plus the low half.
 *
 * The time is subquadratic in the number of digits, because each level of halving does a few
 * multiplications of its own size, and the powers of the base it needs are computed once. A
 * per-digit `total * base + digit` loop over bigints is quadratic: it took 433 ms on 100,000 base-7
 * digits.
 *
 * @param digits The value of each digit, most significant first, each below `base`.
 * @param base The number base, from 2 to 36.
 * @returns The magnitude the digits name.
 */
const readByHalves = (digits: readonly number[], base: number): bigint => {
  const radix = BigInt(base);
  const powers = new Map<number, bigint>();
  const power = (exponent: number): bigint => {
    const known = powers.get(exponent) ?? radix ** BigInt(exponent);
    powers.set(exponent, known);

    return known;
  };

  const read = (start: number, end: number): bigint => {
    if (end - start <= leafLength) {
      let total = 0;
      for (const digit of digits.slice(start, end)) {
        total = total * base + digit;
      }

      return BigInt(total);
    }

    const middle = start + Math.ceil((end - start) / 2);

    return read(start, middle) * power(end - middle) + read(middle, end);
  };

  return read(0, digits.length);
};

/**
 * Read a typed integer in a base, exactly and at any size: an optional sign, then one or more
 * ASCII digits below the base, where `a` to `z` in either case are the digits from 10.
 *
 * Bases 2, 8, 10 and 16 are read by `BigInt`, and every other base by {@link readByHalves}.
 * `BigInt` reads only digits this check has admitted, so it never throws.
 *
 * @param text The trimmed text.
 * @param base The number base.
 * @returns The integer, or none when the base is not an integer from 2 to 36, there are no digits,
 *   or a digit is outside the base.
 */
const readInteger = (text: string, base: number): Option.Option<bigint> => {
  const sign = text.startsWith("-") || text.startsWith("+") ? text.slice(0, 1) : "";
  const digits = text.slice(sign.length);
  const values = Array.fromIterable(digits).map((digit) => Number.parseInt(digit, 36));
  const inBase = values.every((value) => value < base);
  if (!Number.isInteger(base) || base < 2 || base > 36 || digits === "" || !inBase) {
    return Option.none();
  }

  const prefix = bigIntPrefixes.get(base);
  const magnitude = prefix === undefined ? readByHalves(values, base) : BigInt(prefix + digits);

  return Option.some(sign === "-" ? -magnitude : magnitude);
};

/**
 * Give the reason a typed number is unread, whichever step refuses it.
 *
 * @returns `number`.
 */
const notANumber = (): UnreadReason => "number";

/**
 * Read one box's text as a value of its base type.
 *
 * Text holding a character XML cannot carry is unread first, whatever the base type, since the
 * value would end in a result no XML reader reads. Then the text is read as {@link typedLexical}
 * reads it: empty text is no answer, a number sheds its outer XML white space first, so blank text
 * is no answer too, and so is a string of XML white space alone under `blankIsEmpty`. A string has
 * CRLF and a lone CR turned into LF, as a textarea's value has, so a value holds LF line breaks
 * only. An integer is read exactly in `base`, then its decimal digits take the value model's one
 * path, so a typed integer is the value the same digits are in content. A float is the value
 * model's reading of the text, and is unread when it is not finite: `INF`, `-INF`, `NaN`, and a
 * decimal beyond the largest double, which reads as an infinity of its sign (reading
 * `bounded-double`).
 *
 * @param text The box's text, as typed.
 * @param reading How the box's text is read.
 * @returns The value, none for no answer, or why the text is unread.
 */
export const readTyped = (
  text: string,
  reading: TypedReading,
): Result.Result<Option.Option<Single>, UnreadReason> => {
  if (!isXmlText(text)) {
    return Result.fail("character");
  }

  const typed = typedLexical(text, reading);
  if (Option.isNone(typed)) {
    return Result.succeedNone;
  }

  const lexical = typed.value;
  const { baseType } = reading;
  if (baseType === "string") {
    return Result.succeedSome({ baseType, value: lexical.replaceAll(regex("\r\n?", "gu"), "\n") });
  }

  const decimal =
    baseType === "integer"
      ? Option.map(readInteger(lexical, reading.base), String)
      : Option.some(lexical);

  return Result.fromOption(decimal, notANumber).pipe(
    Result.flatMap((number) => Result.mapError(parseLexical(baseType, number), notANumber)),
    Result.filterOrFail(
      (single) => single.baseType !== "float" || Number.isFinite(single.value),
      notANumber,
    ),
    Result.map(Option.some),
  );
};

/**
 * A number in a record's text: xs:double's lexical form, as `parseLexical` reads a float, without
 * `INF`, `-INF` and `NaN`. An optional sign, the digits before the point, the point and the digits
 * after it when written, and `e` or `E` with the exponent when written; {@link numberFields} also
 * asks for at least one digit before or after the point. Each run of digits ends at a character the
 * next part starts with, so a failed match backtracks in time linear in the text.
 */
const recordNumber = regex(
  "^(?<sign>[+-]?)(?<whole>[0-9]*)(?:\\.(?<fraction>[0-9]*))?(?:[Ee](?<exponent>[+-]?[0-9]+))?$",
  "u",
);

/**
 * A digit other than zero: where a number's significant figures start.
 */
const nonZeroDigit = regex("[1-9]", "u");

/**
 * Construct an integer field of a record.
 *
 * @param identifier The field's identifier.
 * @param value The field's value.
 * @returns The field.
 */
const integerField = (identifier: string, value: bigint): RecordField => ({
  identifier,
  value: { baseType: "integer", value },
});

/**
 * Give the fields a record's text gives when it is a number: `floatValue`, `integerValue`,
 * `leftDigits`, `rightDigits`, `ndp`, `nsf` and `exponent`, in that order.
 *
 * The text is trimmed of XML whitespace only, so a no-break space keeps it from being a number.
 * `floatValue` is the value model's reading of a float, so past the largest double it is an
 * infinity of its sign (reading `bounded-double`). `integerValue` is the exact integer, present
 * only when no fractional digit and no exponent is written (`5.` gives 5). `leftDigits` and
 * `rightDigits` count the digits written before and after the point, leading and trailing zeros
 * included, the sign not. `ndp` is `rightDigits` minus the exponent, and may be negative. `nsf`
 * counts from the first non-zero digit to the last digit written; a zero value has the digits after
 * the point, at least one. `exponent` is present only when written. Every integer is exact at any
 * size, and each count is one scan of the text.
 *
 * @param text The box's text, as typed.
 * @returns The fields, or none when the trimmed text is not a number.
 */
const numberFields = (text: string): readonly RecordField[] => {
  const trimmed = trimXmlSpace(text);
  const parts = recordNumber.exec(trimmed)?.groups;
  const sign = parts?.["sign"] ?? "";
  const whole = parts?.["whole"] ?? "";
  const fraction = parts?.["fraction"] ?? "";
  const written = Option.fromUndefinedOr(parts?.["exponent"]);
  if (whole === "" && fraction === "") {
    return [];
  }

  const exponent = written.pipe(Option.map(BigInt));
  const digits = whole + fraction;
  const first = digits.search(nonZeroDigit);
  const significant = first === -1 ? Math.max(fraction.length, 1) : digits.length - first;
  const isInteger = Option.isNone(written) && fraction === "" && whole !== "";
  const integer = isInteger
    ? Result.getSuccess(parseLexical("integer", sign + whole))
    : Option.none<Single>();
  const float = Result.getSuccess(parseLexical("float", trimmed));

  return [
    ...Option.toArray(float.pipe(Option.map((value) => ({ identifier: "floatValue", value })))),
    ...Option.toArray(integer.pipe(Option.map((value) => ({ identifier: "integerValue", value })))),
    integerField("leftDigits", BigInt(whole.length)),
    integerField("rightDigits", BigInt(fraction.length)),
    integerField("ndp", BigInt(fraction.length) - Option.getOrElse(exponent, () => 0n)),
    integerField("nsf", BigInt(significant)),
    ...Option.toArray(exponent.pipe(Option.map((value) => integerField("exponent", value)))),
  ];
};

/**
 * Read a record response from the one box's text a string interaction bound to it holds (QTI 3.0.1
 * information model 2.4.2.2; spec reading `record-number-fields`).
 *
 * The text is read as a `string` box reads one: unread when it holds a character XML cannot carry,
 * no answer when empty, and under `blankIsEmpty` when it holds XML white space alone, and with CRLF
 * and a lone CR turned into LF. That text is the record's `stringValue`. When the text trimmed of
 * XML whitespace is a decimal number with an optional exponent, {@link numberFields} gives the
 * fields `floatValue`, `integerValue` (only for a whole number with no exponent), `leftDigits`,
 * `rightDigits`, `ndp`, `nsf` and `exponent` (only when written), every integer exact. Text that is
 * no such number, `INF`, `-INF` and `NaN` among it, gives `stringValue` alone. The interaction's
 * `base` is never applied.
 *
 * @example
 *   readRecord("1.5e3", false);
 *   // A record: stringValue "1.5e3", floatValue 1500, leftDigits 1, rightDigits 1, ndp -2,
 *   // nsf 2, exponent 3.
 *
 * @param text The box's text, as typed.
 * @param blankIsEmpty Whether text of XML white space alone is no answer too.
 * @returns The record, the NULL record (no field) for no answer, or `character`.
 */
export const readRecord = (
  text: string,
  blankIsEmpty: boolean,
): Result.Result<RecordValue, UnreadReason> =>
  readTyped(text, { base: 10, baseType: "string", blankIsEmpty }).pipe(
    Result.map((stringValue): RecordValue => ({
      cardinality: "record",
      fields: Option.match(stringValue, {
        onNone: () => [],
        onSome: (value) => [{ identifier: "stringValue", value }, ...numberFields(text)],
      }),
    })),
  );

/**
 * Write a value back into a box's text: an integer's digits in the interaction's `base`, any other
 * single in its lexical form, which {@link readTyped} reads back to the same value.
 *
 * @param single The value, a `string`, an `integer` or a `float`.
 * @param base The number base an integer is written in, from 2 to 36; base 10 when it is no whole
 *   number from 2 to 36, a base no typed integer is read in.
 * @returns The text a box shows for it.
 */
export const typedText = (
  single: Extract<Single, { readonly baseType: TypedReading["baseType"] }>,
  base: number,
): string => {
  if (single.baseType === "integer") {
    return single.value.toString(Number.isInteger(base) && base >= 2 && base <= 36 ? base : 10);
  }

  return format(single);
};

/**
 * The digits of an integer written in a base from 2 to 36, from `least`, as a class body writes
 * them: the decimal digits below the base, then for a base above 10 its letters, in either case.
 *
 * @param base The number base.
 * @param least The least digit, `0` for every digit or `1` for every digit but 0.
 * @returns The digits' runs.
 */
const digitRuns = (base: number, least: "0" | "1"): string => {
  const letters = base - 10;

  return letters > 0
    ? `${least}-9a-${String.fromCodePoint(0x60 + letters)}A-${String.fromCodePoint(0x40 + letters)}`
    : `${least}-${String(base - 1)}`;
};

/**
 * Give the texts an integer is written as in a base, the texts {@link typedText} writes, a letter
 * digit in either case: `0`, or an optional minus, a digit other than 0 and any digits after it. In
 * a base outside 2 to 36 no text is an integer ({@link readTyped}), so the language holds none.
 *
 * @param base The number base.
 * @returns The language, written over the regex IR.
 */
const writtenIntegers = (base: number): Language => {
  if (!Number.isInteger(base) || base < 2 || base > 36) {
    return noText;
  }

  const builder = new RegexBuilder();

  return builder.alt([
    literal("0"),
    seq([
      builder.alt([empty, literal("-")]),
      set(runsOf(digitRuns(base, "1"))),
      builder.repeat(set(runsOf(digitRuns(base, "0"))), 0, "unbounded"),
    ]),
  ]);
};

/**
 * The texts a box takes, the text a keystroke would leave in it: those every one of its matchers
 * matches, or every text where it has none ({@link typedEntry}).
 */
export type TypedEntry = Option.Option<Array.NonEmptyReadonlyArray<Matcher>>;

/**
 * Give the texts a box takes ({@link takesTyped}): for an `integer` box, the texts that begin an
 * integer it may write and, in base 10, begin a text its `pattern-mask` matches; for a `string` or
 * a `float` box, every text, its child's own writing, which a `pattern-mask` judges once the child
 * leaves the box (`useBoxes` in `#plate/ui/typed.ts`).
 *
 * An integer box posts the integer written as {@link typedText} writes it, the very text it shows,
 * so it takes only the prefixes of an integer written plainly: no leading zero, `+`, space or
 * decimal point ever stands in it. In base 10 that text is the value's lexical form, the text the
 * database matches the `pattern-mask` against (`fails` in `#plate/ui/typed.ts`), so the box also
 * takes only the prefixes of the texts the mask matches ({@link languageOf}): under
 * `0|[1-9]|1[0-9]|20` it takes `2` and `20` and refuses `21`, `99` and a minus, and under
 * `0|[1-9][0-9]{0,2}` a fourth digit and a minus. Where the mask's every text is an integer written
 * plainly, as the K–2 forms' caps are, the two together are exactly the prefixes of the integers
 * the mask matches, so every text the box holds is on the way to an answer; under a mask some of
 * whose texts are no such integer (a leading zero, a sign), the box may hold a text that begins
 * both and completes to neither, which the mask judges once the child leaves the box. Each is its
 * own matcher, built from the language's shape and run once over a text, so no mask, however great
 * its counts, makes a box's entry costly to build or to check: no automaton of the two is ever
 * made. In any other base the mask matches the value's decimal digits, no text the box shows, so it
 * narrows nothing here. A box whose mask matches no text takes no text at all, and one whose mask's
 * texts begin no integer takes the empty text alone.
 *
 * @param reading How the box's text is read: its base type, and the base an integer is typed in.
 * @param patternMask The interaction's `pattern-mask`, none where the author wrote none; one outside
 *   Appendix F's grammar narrows nothing, as it checks nothing.
 * @returns The box's entry.
 */
export const typedEntry = (
  reading: Pick<TypedReading, "base" | "baseType">,
  patternMask: string | undefined,
): TypedEntry => {
  if (reading.baseType !== "integer") {
    return Option.none();
  }

  const integers = compileLanguage(prefixesOf(writtenIntegers(reading.base)));
  const mask =
    reading.base === 10
      ? Option.flatMap(Option.fromUndefinedOr(patternMask), languageOf)
      : Option.none();

  return Option.some(
    Option.match(mask, {
      onNone: () => [integers] as const,
      onSome: (language) => [integers, compileLanguage(prefixesOf(language))] as const,
    }),
  );
};

/**
 * Decide whether a box takes the text a keystroke would leave in it, a key of a keypad or of the
 * keyboard ({@link typedEntry}): where every one of its matchers matches it. A box that does not
 * take it keeps its text, so what it shows is always a text it may hold.
 *
 * @param entry The box's entry.
 * @param text The text the box would hold.
 * @returns Whether the box takes it.
 */
export const takesTyped = (entry: TypedEntry, text: string): boolean =>
  Option.match(entry, {
    onNone: () => true,
    onSome: (matchers) => matchers.every((matcher) => matches(matcher, text)),
  });

/**
 * How a box's text stands in its response: `write` makes the text the value holds from the text a
 * box shows, `read` the text a box shows from the one a value holds, each the other's inverse on
 * what `write` makes. A Text Entry's and a plain or preformatted Extended Text's is {@link asTyped};
 * an `xhtml` Extended Text's writes the XHTML its conventions make of the text
 * (`#plate/interactions/xhtml-text.ts`).
 */
export interface Written {
  readonly write: (text: string) => string;
  readonly read: (posted: string) => string;
}

/**
 * Typed text as a value holds it: the text itself.
 */
export const asTyped: Written = { read: (posted) => posted, write: (text) => text };

/**
 * Read a typed response from its boxes' texts, as the typed islands do on every keystroke: each box
 * whose text is an answer ({@link typedLexical}), in the boxes' order, written into the response
 * ({@link Written}) and read by {@link readTyped}, a record from its one box by {@link readRecord}.
 * A box whose text is no value of its base type leaves the response unread, its value NULL, since
 * the screen holds no value of its type, and the host refuses an answer until the child changes it
 * (`answerOf` in `#plate/held.ts`).
 *
 * A Text Entry reads its box with its `base`, its response's base type (`string` for a record), and
 * `blankIsEmpty` true, its text being plain; an Extended Text with `blankIsEmpty` true but for an
 * `xhtml` one (QTI's `TextFormatEnum`, SV-DESIGN-05).
 *
 * @example
 *   typedResponseOf(
 *     ["24 lb"],
 *     { cardinality: "record", identifier: "RESPONSE" },
 *     { base: 10, baseType: "string", blankIsEmpty: true },
 *     asTyped,
 *   );
 *   // [{ texts: ["24 lb"], unread: false }, a record holding stringValue "24 lb" alone]
 *
 * @param texts The boxes' texts, as typed, empty boxes included.
 * @param declared The response's declaration.
 * @param reading How a box's text is read.
 * @param written How a box's text stands in its response.
 * @returns The boxes the state holds, and the value read from them.
 */
export const typedResponseOf = (
  texts: readonly string[],
  declared: TypedDeclared,
  reading: TypedReading,
  written: Written,
): readonly [typed: Typed, value: ResponseValue] => {
  const answers = texts
    .filter((text) => Option.isSome(typedLexical(text, reading)))
    .map(written.write);
  if (declared.cardinality === "record") {
    const [text = ""] = answers;

    return Result.match(readRecord(text, reading.blankIsEmpty), {
      onFailure: () => [{ texts, unread: true }, nullRecord],
      onSuccess: (value) => [{ texts, unread: false }, value],
    });
  }

  return Result.match(Result.all(answers.map((text) => readTyped(text, reading))), {
    onFailure: () => [{ texts, unread: true }, nullOf(declared.baseType, declared.cardinality)],
    onSuccess: (singles) => [
      { texts, unread: false },
      {
        baseType: declared.baseType,
        cardinality: declared.cardinality,
        values: Array.getSomes(singles),
      },
    ],
  });
};
