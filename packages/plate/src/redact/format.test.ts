import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { formatPrinted, plainPrinting, textBound } from "#plate/redact/format.ts";
import type { PrintOptions } from "#plate/redact/format.ts";
import type { Single, Value } from "#plate/model/values.ts";
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

describe("formatPrinted: a float's exact value rounds to the nearest, a tie to the even digit, as C's printf does (reading 209)", () => {
  const cases: readonly (readonly [string, number, string])[] = [
    ["%.1f", 0.25, "0.2"],
    ["%.1f", -0.25, "-0.2"],
    ["%.0f", 0.5, "0"],
    ["%.0f", 1.5, "2"],
    ["%.0f", 2.5, "2"],
    ["%.2f", 2.675, "2.67"],
    ["%.1f", 99_999.95, "99999.9"],
    ["%.1e", 2.25, "2.2e+00"],
    ["%.2g", 0.125, "0.12"],
    ["%.2r", 0.125, "0.12"],
    ["%.20f", 0.1, "0.10000000000000000555"],
    ["%e", 5e-324, "4.940656e-324"],
  ];

  for (const [format, input, output] of cases) {
    it(`${format} of ${JSON.stringify(input)} prints ${output}, as C prints the double`, () => {
      assert.strictEqual(printed(float(input), { format }), output);
    });
  }
});

describe("formatPrinted: power-form rewrites every exponent a float prints in (reading 209)", () => {
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
  it("truncates a float's exact value under an integer conversion, as C converts a double to an integer (reading 209)", () => {
    assert.strictEqual(printed(float(1e23), { format: "%i" }), "99999999999999991611392");
    assert.strictEqual(printed(float(1e23), { format: "%.0f" }), "99999999999999991611392");
    assert.strictEqual(
      printed(float(Number(2n ** 53n + 2n)), { format: "%i" }),
      "9007199254740994",
    );
    assert.strictEqual(printed(float(2 ** 100), { format: "%i" }), (2n ** 100n).toString());
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

    assert.isTrue(Option.isNone(formatPrinted(counted.value, plainPrinting, 25)));
    assert.strictEqual(counted.reads(), 3);
  });
});
