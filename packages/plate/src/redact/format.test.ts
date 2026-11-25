import { availableParallelism } from "node:os";
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element, int } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option, Result } from "effect";
import { formatPrinted, plainPrinting, textBound } from "#plate/redact/format.ts";
import type { PrintOptions } from "#plate/redact/format.ts";
import type { Single, Value } from "#plate/model/values.ts";
import { boxHolds } from "#plate/test/box.ts";
import { float } from "#plate/test/fixtures.ts";

/**
 * A printed variable's resolved attributes as a case writes them: those it sets, every other at its
 * XSD default, no `format` and no `index` among them.
 */
interface Written {
  readonly base?: bigint;
  readonly delimiter?: string;
  readonly format?: string;
  readonly index?: bigint;
  readonly powerForm?: boolean;
}

/**
 * Give the options a case's attributes stand for.
 *
 * @param written The attributes the case sets.
 * @returns The options, every attribute the case leaves out at its default ({@link plainPrinting}).
 */
const optionsOf = ({ format, index, ...rest }: Written): PrintOptions => ({
  ...plainPrinting,
  ...rest,
  format: Option.fromUndefinedOr(format),
  index: Option.fromUndefinedOr(index),
});

/**
 * The text `formatPrinted` writes for a value it prints, so a pin compares the text itself.
 *
 * @param value The value.
 * @param written The printed variable's resolved attributes.
 * @returns The text; the test fails when the formatter prints none (a value past a bound).
 */
const printed = (value: Value, written: Written): string =>
  Option.getOrThrow(formatPrinted(value, optionsOf(written), textBound));

/**
 * How long one case of a search here may run before it is stopped and reported.
 */
const caseHang = Duration.seconds(30);

/**
 * The floating conversions of the rounding box: C's three and the information model's `r`.
 */
const CONVERSIONS = ["f", "e", "g", "r"] as const;

/**
 * A {@link CONVERSIONS} member.
 */
type FloatConversion = (typeof CONVERSIONS)[number];

/**
 * The precisions the rounding box writes: none (6), 0, which `g` and `r` read as 1, 1, 2, and 20,
 * past every digit a double's shortest decimal holds.
 */
const PRECISIONS = ["", ".0", ".1", ".2", ".20"] as const;

/**
 * The powers of 10 a significand of the rounding box is scaled by: a fraction below `g`'s fixed
 * form, a fraction, an integer and a number past the precisions' significant figures.
 */
const SCALES = [-6, -3, 0, 3] as const;

/**
 * A case of the rounding box: a conversion at a precision, of the double nearest `significand`
 * times 10 to the `scale`.
 */
interface RoundingCase {
  readonly conversion: FloatConversion;
  readonly precision: (typeof PRECISIONS)[number];
  readonly scale: (typeof SCALES)[number];
  readonly significand: number;
}

/**
 * Draw a case of the rounding box: every conversion, precision and scale, and every significand
 * from -125 to 125, which holds the exact ties 0.125 and 0.5 and decimals no double holds, such as
 * 0.105, whose double lies below it.
 */
const roundingCase: Gen<RoundingCase> = (source) => ({
  conversion: source.draw(element(CONVERSIONS)),
  precision: source.draw(element(PRECISIONS)),
  scale: source.draw(element(SCALES)),
  significand: source.draw(int(-125, 125)),
});

/**
 * How many cases {@link roundingCase} draws.
 */
const ROUNDING_CASES = 4 * 5 * 4 * 251;

/**
 * What a case of the rounding box reaches that a printer could get wrong.
 */
const roundingSituations = [
  "an exact tie",
  "a carry past the leading digit",
  "fixed form",
  "scientific form",
  "a negative",
] as const;

/**
 * A {@link roundingSituations} member.
 */
type RoundingSituation = (typeof roundingSituations)[number];

/**
 * A finite double's magnitude as an exact decimal fraction: `numerator` over 10 to the `places`.
 */
interface Exact {
  readonly numerator: bigint;
  readonly places: number;
}

/**
 * A finite double's exact magnitude, read from its IEEE 754 binary64 bits: a significand times a
 * power of 2, which is a significand times 5 to the power over 10 to the power where the power is
 * negative.
 *
 * @param value The double.
 * @returns Its magnitude, exactly.
 */
const exactOf = (value: number): Exact => {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, Math.abs(value));
  const bits = view.getBigUint64(0);
  const biased = Number(bits >> 52n);
  const fraction = bits & ((1n << 52n) - 1n);
  const significand = biased === 0 ? fraction : fraction | (1n << 52n);
  const power = (biased === 0 ? 1 : biased) - 1075;

  return power >= 0
    ? { numerator: significand << BigInt(power), places: 0 }
    : { numerator: significand * 5n ** BigInt(-power), places: -power };
};

/**
 * An exact magnitude times 10 to the `places`, rounded to the nearest integer, a tie to the even.
 *
 * @param exact The magnitude.
 * @param places The decimal places to keep, negative to round left of the point.
 * @returns The integer, and whether the rounding met an exact tie.
 */
const roundedAt = (exact: Exact, places: number): readonly [bigint, boolean] => {
  const scaled = exact.numerator * 10n ** BigInt(Math.max(places, 0));
  const divisor = 10n ** BigInt(exact.places) * 10n ** BigInt(Math.max(-places, 0));
  const quotient = scaled / divisor;
  const twice = 2n * (scaled % divisor);
  const up = twice > divisor || (twice === divisor && quotient % 2n === 1n);

  return [up ? quotient + 1n : quotient, twice === divisor];
};

/**
 * An exact magnitude rounded to `digits` significant digits, a tie to the even, in scientific
 * form.
 *
 * @param exact The magnitude.
 * @param digits The significant digits to keep, 1 or more.
 * @returns The digits, the power of 10 of the first, whether the rounding met a tie and whether it
 *   carried past the leading digit.
 */
const significantOf = (
  exact: Exact,
  digits: number,
): {
  readonly carried: boolean;
  readonly digits: string;
  readonly power: number;
  readonly tie: boolean;
} => {
  if (exact.numerator === 0n) {
    return { carried: false, digits: "0".repeat(digits), power: 0, tie: false };
  }

  const leading = exact.numerator.toString().length - 1 - exact.places;
  const [kept, tie] = roundedAt(exact, digits - 1 - leading);
  const carried = kept.toString().length > digits;

  return {
    carried,
    digits: (carried ? kept / 10n : kept).toString(),
    power: carried ? leading + 1 : leading,
    tie,
  };
};

/**
 * Digits with a point before their last `places`, as `f` writes them with no `#`.
 *
 * @param scaled The digits, as an integer.
 * @param places The digits after the point.
 * @returns The text.
 */
const pointed = (scaled: bigint, places: number): string => {
  const digits = scaled.toString().padStart(places + 1, "0");

  return places === 0 ? digits : `${digits.slice(0, -places)}.${digits.slice(-places)}`;
};

/**
 * Text without the trailing zeros of its fraction, nor the point when no digit is left after it,
 * as `g` writes with no `#`.
 *
 * @param text Digits, with or without a point.
 * @returns The text.
 */
const withoutTrailingZeros = (text: string): string => {
  if (!text.includes(".")) {
    return text;
  }

  const kept = Option.match(
    Arr.findLastIndex(Array.from(text), (character) => character !== "0"),
    { onNone: () => text, onSome: (at) => text.slice(0, at + 1) },
  );

  return kept.endsWith(".") ? kept.slice(0, -1) : kept;
};

/**
 * Significant digits as a mantissa: the first, then the point and the rest when there is a rest.
 *
 * @param digits The digits.
 * @returns The mantissa.
 */
const mantissaOf = (digits: string): string =>
  digits.length === 1 ? digits : `${digits.charAt(0)}.${digits.slice(1)}`;

/**
 * An exponent as `e` writes it: `e`, its sign, and two digits at least.
 *
 * @param power The power of 10.
 * @returns The exponent's text.
 */
const exponentOf = (power: number): string =>
  `e${power < 0 ? "-" : "+"}${String(Math.abs(power)).padStart(2, "0")}`;

/**
 * The situations of a list that hold.
 *
 * @param situations Each situation, with whether it holds.
 * @returns The situations that hold.
 */
const reached = (
  situations: readonly (readonly [RoundingSituation, boolean])[],
): readonly RoundingSituation[] =>
  Arr.filterMap(situations, ([situation, held]) =>
    held ? Result.succeed(situation) : Result.failVoid,
  );

/**
 * A precision as a format writes it, read as C reads it: none is 6.
 *
 * @param written The precision's text, `.n` or none.
 * @returns The precision.
 */
const precisionOf = (written: (typeof PRECISIONS)[number]): number =>
  written === "" ? 6 : Number(written.slice(1));

/**
 * Print a finite double as C's `printf` prints it under `f`, `e` or `g` with no flag and no width,
 * and under the information model's `r`, from the double's exact value (ISO 9899 section 7.21.6.1,
 * Annex F; QTI section 2.3.4): `f` rounds to `precision` places; `e` to `precision` + 1 significant
 * digits, its exponent signed and of two digits at least; `g` and `r` to the precision's
 * significant digits (0 read as 1), in `e`'s form with `precision` - 1 places when `g`'s exponent X
 * is below -4 or not below the precision P, or when `r`'s P is at most X, else in `f`'s with P - 1 -
 * X places, trailing zeros removed.
 *
 * @param value The double.
 * @param conversion The conversion.
 * @param precision The precision.
 * @returns The text, and the situations its printing reached.
 */
const cPrinted = (
  value: number,
  conversion: FloatConversion,
  precision: number,
): { readonly situations: readonly RoundingSituation[]; readonly text: string } => {
  const exact = exactOf(value);
  const sign = value < 0 || Object.is(value, -0) ? "-" : "";

  if (conversion === "f") {
    const [kept, tie] = roundedAt(exact, precision);

    return {
      situations: reached([
        ["an exact tie", tie],
        ["fixed form", true],
        ["a negative", sign === "-"],
      ]),
      text: `${sign}${pointed(kept, precision)}`,
    };
  }

  if (conversion === "e") {
    const rounded = significantOf(exact, precision + 1);

    return {
      situations: reached([
        ["an exact tie", rounded.tie],
        ["a carry past the leading digit", rounded.carried],
        ["scientific form", true],
        ["a negative", sign === "-"],
      ]),
      text: `${sign}${mantissaOf(rounded.digits)}${exponentOf(rounded.power)}`,
    };
  }

  const figures = precision === 0 ? 1 : precision;
  const rounded = significantOf(exact, figures);
  const isScientific =
    conversion === "g" ? rounded.power < -4 || rounded.power >= figures : figures <= rounded.power;
  const places = figures - 1 - rounded.power;
  const text = isScientific
    ? `${withoutTrailingZeros(mantissaOf(rounded.digits))}${exponentOf(rounded.power)}`
    : withoutTrailingZeros(pointed(roundedAt(exact, places)[0], places));

  return {
    situations: reached([
      ["an exact tie", rounded.tie],
      ["a carry past the leading digit", rounded.carried],
      [isScientific ? "scientific form" : "fixed form", true],
      ["a negative", sign === "-"],
    ]),
    text: `${sign}${text}`,
  };
};

describe("formatPrinted: a float's exact value rounds to the nearest, a tie to the even digit, as C's printf does (reading `format-float-rounding`)", () => {
  it.effect(
    `prints every decimal of up to three digits at four scales, as its double, under f, e, g and r at ${String(PRECISIONS.length)} precisions as C prints the double: ${String(ROUNDING_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(roundingCase, ROUNDING_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "every double nearest a decimal of -125 to 125 times 10 to the -6, -3, 0 or 3, under %f, %e, %g and %r with no precision and precisions 0, 1, 2 and 20",
              caseHang,
              concurrency: availableParallelism(),
              coverage: requiredInSpace<RoundingSituation>(roundingSituations),
              generator: roundingCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "ISO 9899 section 7.21.6.1's f, e and g conversions of the double's exact binary value, correctly rounded to the nearest, a tie to the even digit (Annex F), and the information model's r (section 2.3.4: as g, scientific only when the significant figures are fewer than the digits left of the point), computed here in exact integer arithmetic (reading `format-float-rounding`)",
              },
              suite: "plate/format/rounding",
            },
            ({ conversion, precision, scale, significand }, c) =>
              Effect.sync(() => {
                const value = Number(`${String(significand)}e${String(scale)}`);
                const format = `%${precision}${conversion}`;
                const expected = cPrinted(value, conversion, precisionOf(precision));
                c.noteAll(expected.situations);

                assert.strictEqual(
                  printed(float(value), { format }),
                  expected.text,
                  `${format} of ${String(value)}`,
                );
              }),
          ),
        ),
      ),
  );
});

describe("formatPrinted: power-form rewrites every exponent a float prints in (reading `format-float-rounding`)", () => {
  it("writes the exponent of e, E, g and r output so too, its power with no sign or leading zero", () => {
    assert.strictEqual(
      printed(float(12_345), { format: "%e", powerForm: true }),
      "1.234500 x 10 to the power 4",
    );
    assert.strictEqual(
      printed(float(0.0000987654321), { format: "%G", powerForm: true }),
      "9.87654 x 10 to the power -5",
    );
    assert.strictEqual(
      printed(float(987), { format: "%.2r", powerForm: true }),
      "9.9 x 10 to the power 2",
    );
  });
});

describe("formatPrinted: the conversions beyond the worked table", () => {
  it("truncates a float's exact value under an integer conversion, as C converts a double to an integer (reading `format-float-rounding`)", () => {
    assert.strictEqual(printed(float(1e23), { format: "%i" }), "99999999999999991611392");
    assert.strictEqual(printed(float(1e23), { format: "%.0f" }), "99999999999999991611392");
    assert.strictEqual(
      printed(float(Number(2n ** 53n + 2n)), { format: "%i" }),
      "9007199254740994",
    );
    assert.strictEqual(
      printed(float(2 ** 100), { format: "%i" }),
      "1267650600228229401496703205376",
    );
    assert.strictEqual(printed(float(1e21), { format: "%x" }), (10n ** 21n).toString(16));
  });

  it("g and r read a precision of 0 as 1, and . alone as 0", () => {
    assert.strictEqual(printed(float(987), { format: "%.0g" }), "1e+03");
    assert.strictEqual(printed(float(2.5), { format: "%.f" }), "2");
  });
});

/**
 * An ordered container of strings that counts which of its members have been read.
 */
interface Watched {
  /**
   * How many distinct members have been read.
   */
  readonly reads: () => number;
  readonly value: Value;
}

/**
 * Construct an ordered container that holds one string a number of times, each member noting when
 * it is read, as the formatter reads a member to print it.
 *
 * @param text The string.
 * @param count How many times the container holds it.
 * @returns The value and how many of its members have been read.
 */
const watched = (text: string, count: number): Watched => {
  const read = new Set<number>();

  return {
    reads: () => read.size,
    value: {
      baseType: "string",
      cardinality: "ordered",
      values: Array.from({ length: count }, (_, index): Single => ({
        baseType: "string",
        get value() {
          read.add(index);

          return text;
        },
      })),
    },
  };
};

describe("formatPrinted: a caller's smaller bound holds the whole text, so redact can stop at its output budget", () => {
  it("stops at the first member whose text passes the bound, so it builds no text past it: 1,000 members of 10 characters under a bound of 25 are read 3 times", () => {
    const counted = watched("y".repeat(10), 1000);

    assert.deepStrictEqual(formatPrinted(counted.value, plainPrinting, 25), Option.none());
    assert.strictEqual(counted.reads(), 3);
  });
});
