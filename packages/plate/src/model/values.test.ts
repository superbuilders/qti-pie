import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import {
  format,
  isModelled,
  isNull,
  isNullResponse,
  isRecordValue,
  isXmlText,
  nullOf,
  parseElementText,
  parseLexical,
  readIeeeDouble,
} from "#plate/model/values.ts";
import type {
  ModelledBaseType,
  RecordField,
  RecordValue,
  Single,
  Value,
} from "#plate/model/values.ts";
import { growthFactor, growthLimit, growthRatio } from "#plate/test/growth.ts";

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
 * Construct a record for a test.
 *
 * @param fields Its fields, in written order.
 * @returns The record.
 */
const record = (...fields: readonly RecordField[]): RecordValue => ({
  cardinality: "record",
  fields,
});

/**
 * Construct a field of a record for a test.
 *
 * @param identifier The field's identifier.
 * @param single Its value.
 * @returns The field.
 */
const field = (identifier: string, single: Single): RecordField => ({ identifier, value: single });

/**
 * The timeout of the linear-trim check, which samples both sizes of each of its two cases several
 * times, each sample at least `growthRatio`'s minimum of thread CPU: about a second alone, and 2 s
 * and more beside the rest of the suite on a loaded machine, toward vitest's default of 5 s.
 * Vitest fails a test that ends after its timeout even when it passes.
 */
const growthTimeoutMs = 60_000;

describe("isNullResponse and isRecordValue", () => {
  it("isNull holds a value of no values NULL at any cardinality, and one holding a value not", () => {
    assert.isTrue(isNull(nullOf("string", "multiple")));
    assert.isFalse(isNull(value("identifier", "single", identifiers("A"))));
  });

  it("take a record with no field as NULL and a record with a field as not", () => {
    const filled = record(field("stringValue", { baseType: "string", value: "a" }));

    assert.isTrue(isNullResponse(record()));
    assert.isFalse(isNullResponse(filled));
    assert.isTrue(isNullResponse(nullOf("integer", "single")));
    assert.isFalse(isNullResponse(value("identifier", "single", identifiers("A"))));
    assert.deepStrictEqual(
      [isRecordValue(filled), isRecordValue(record()), isRecordValue(nullOf("string", "single"))],
      [true, true, false],
    );
  });
});

describe("parseElementText", () => {
  it.effect("trims an identifier's outer whitespace and keeps a string's", () =>
    Effect.gen(function* trimsByBaseType() {
      assert.deepStrictEqual(
        yield* Effect.fromResult(parseElementText("identifier", " completed ")),
        Option.some<Single>({ baseType: "identifier", value: "completed" }),
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(parseElementText("string", " a ")),
        Option.some<Single>({ baseType: "string", value: " a " }),
      );
    }),
  );

  it.effect("reads an empty string as NULL and a blank one as a value", () =>
    Effect.gen(function* emptyStringIsNull() {
      assert.deepStrictEqual(
        yield* Effect.fromResult(parseElementText("string", "")),
        Option.none(),
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(parseElementText("string", " ")),
        Option.some<Single>({ baseType: "string", value: " " }),
      );
    }),
  );

  it.effect("trims tabs and line breaks but keeps a no-break space", () =>
    Effect.gen(function* xmlWhitespaceOnly() {
      assert.deepStrictEqual(
        yield* Effect.fromResult(parseElementText("boolean", "\n\ttrue\r\n")),
        Option.some<Single>({ baseType: "boolean", value: true }),
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(parseElementText("pair", " A \n B ")),
        Option.some<Single>({ baseType: "pair", value: ["A", "B"] }),
      );

      const error = yield* Effect.flip(
        Effect.fromResult(parseElementText("identifier", " completed")),
      );
      assert.strictEqual(error._tag, "InvalidValue");
    }),
  );

  it("reads an empty string as NULL and a padded integer as itself", () => {
    assert.deepStrictEqual(
      Result.getSuccess(parseElementText("string", "")),
      Option.some(Option.none()),
    );
    assert.deepStrictEqual(
      Result.getSuccess(parseElementText("integer", " 7 ")),
      Option.some(Option.some<Single>({ baseType: "integer", value: 7n })),
    );
  });

  it.effect(
    "trims a 100,000-character whitespace run in linear time",
    () =>
      Effect.gen(function* linearTrim() {
        const run = " \t\n\r".repeat(25_000);
        const shorterRun = " \t\n\r".repeat(25_000 / growthFactor);
        const cases: readonly (readonly [
          ModelledBaseType,
          (whitespace: string) => string,
          Single,
        ])[] = [
          ["identifier", (whitespace) => `${whitespace}x`, { baseType: "identifier", value: "x" }],
          [
            "pair",
            (whitespace) => `A${whitespace}B${whitespace}`,
            { baseType: "pair", value: ["A", "B"] },
          ],
        ];
        for (const [baseType, textOf, single] of cases) {
          const fewer = textOf(shorterRun);
          const more = textOf(run);
          assert.deepStrictEqual(
            yield* Effect.fromResult(parseElementText(baseType, more)),
            Option.some(single),
          );
          assert.deepStrictEqual(
            yield* Effect.fromResult(parseElementText(baseType, fewer)),
            Option.some(single),
          );

          const growth = yield* growthRatio(
            () => {
              parseElementText(baseType, fewer);
            },
            () => {
              parseElementText(baseType, more);
            },
          );
          assert.isBelow(
            growth,
            growthLimit,
            `${baseType}: 8 times the whitespace took ${growth.toFixed(1)} times as long`,
          );
        }
      }),
    growthTimeoutMs,
  );
});

describe("parseLexical", () => {
  it("reads empty text as a file with no name, as QTI 3.0.1's file holds an optional filename", () => {
    assert.deepStrictEqual(
      parseLexical("file", ""),
      Result.succeed<Single>({ baseType: "file", value: { name: "", size: 0, type: "" } }),
    );
    assert.deepStrictEqual(
      parseElementText("file", ""),
      Result.succeed(
        Option.some<Single>({ baseType: "file", value: { name: "", size: 0, type: "" } }),
      ),
    );
  });

  it.effect("refuses 1 and 6 as identifiers", () =>
    Effect.gen(function* digitsAreNotIdentifiers() {
      for (const lexical of ["1", "6"]) {
        const error = yield* Effect.flip(Effect.fromResult(parseLexical("identifier", lexical)));
        assert.strictEqual(error._tag, "InvalidValue");
        assert.strictEqual(error.baseType, "identifier");
        assert.strictEqual(error.lexical, lexical);
      }
    }),
  );

  it.effect("reads xs:boolean's true, false, 1 and 0 as booleans, and refuses any other", () =>
    // Oracle: XML Schema Part 2 §3.2.2.1, boolean's lexical space "{true, false, 1, 0}", which
    // the information model's boolean base type is (§8.14; reading 34).
    Effect.gen(function* booleanLexicalSpace() {
      for (const [lexical, read] of [
        ["true", true],
        ["false", false],
        ["1", true],
        ["0", false],
      ] as const) {
        assert.deepStrictEqual(yield* Effect.fromResult(parseLexical("boolean", lexical)), {
          baseType: "boolean",
          value: read,
        });
      }
      for (const lexical of ["TRUE", "2", "yes"]) {
        const error = yield* Effect.flip(Effect.fromResult(parseLexical("boolean", lexical)));
        assert.strictEqual(error._tag, "InvalidValue");
        assert.strictEqual(error.lexical, lexical);
      }
    }),
  );

  it.effect("round-trips integers and floats through format, INF included", () =>
    Effect.gen(function* numbersRoundTrip() {
      const cases: readonly (readonly [ModelledBaseType, string])[] = [
        ["integer", "0"],
        ["integer", "-12"],
        ["integer", "+7"],
        ["integer", "9007199254740991"],
        ["float", "2.5"],
        ["float", "1E3"],
        ["float", ".5"],
        ["float", "1e21"],
        ["float", "-0"],
        ["float", "5e-324"],
        ["float", "INF"],
        ["float", "-INF"],
        ["float", "NaN"],
      ];
      for (const [baseType, lexical] of cases) {
        const single = yield* Effect.fromResult(parseLexical(baseType, lexical));
        const again = yield* Effect.fromResult(parseLexical(baseType, format(single)));
        assert.strictEqual(again.baseType, baseType);
        assert.isTrue(Object.is(single.value, again.value), `${baseType} ${lexical}`);
      }
      assert.deepStrictEqual(yield* Effect.fromResult(parseLexical("float", "INF")), {
        baseType: "float",
        value: Number.POSITIVE_INFINITY,
      });
      assert.strictEqual(format({ baseType: "float", value: Number.NEGATIVE_INFINITY }), "-INF");
      assert.strictEqual(
        format({ baseType: "integer", value: 9_007_199_254_740_991n }),
        "9007199254740991",
      );
    }),
  );

  it.effect("refuses abc as a float and 1.5 as an integer", () =>
    Effect.gen(function* numbersRefused() {
      const float = yield* Effect.flip(Effect.fromResult(parseLexical("float", "abc")));
      assert.strictEqual(float._tag, "InvalidValue");
      assert.strictEqual(float.baseType, "float");

      const integer = yield* Effect.flip(Effect.fromResult(parseLexical("integer", "1.5")));
      assert.strictEqual(integer._tag, "InvalidValue");
      assert.strictEqual(integer.baseType, "integer");
    }),
  );

  it.effect("reads an integer of any size exactly and formats its exact digits", () =>
    Effect.gen(function* integersExact() {
      const cases: readonly (readonly [string, bigint, string])[] = [
        ["9007199254740993", 2n ** 53n + 1n, "9007199254740993"],
        ["1000000000000000000000000000000", 10n ** 30n, "1000000000000000000000000000000"],
        ["-1000000000000000000000000000000", -(10n ** 30n), "-1000000000000000000000000000000"],
        [`1${"0".repeat(400)}`, 10n ** 400n, `1${"0".repeat(400)}`],
        ["+0009007199254740993", 2n ** 53n + 1n, "9007199254740993"],
        ["-0", 0n, "0"],
      ];
      for (const [lexical, integer, digits] of cases) {
        const single = yield* Effect.fromResult(parseLexical("integer", lexical));
        assert.deepStrictEqual(single, { baseType: "integer", value: integer });
        assert.strictEqual(format(single), digits);
      }
    }),
  );

  it.effect(
    "reads a float beyond the largest double as an infinity of its sign, as XML Schema 1.1's doubleLexicalMap does (reading 144)",
    () =>
      Effect.gen(function* floatOverflowIsInfinite() {
        const cases: readonly (readonly [string, number])[] = [
          ["1e400", Number.POSITIVE_INFINITY],
          ["-1E400", Number.NEGATIVE_INFINITY],
          ["1e-400", 0],
        ];
        for (const [lexical, number] of cases) {
          assert.deepStrictEqual(yield* Effect.fromResult(parseLexical("float", lexical)), {
            baseType: "float",
            value: number,
          });
        }
      }),
  );

  it.effect(
    "reads a duration as its seconds in an xs:double, never truncated, and refuses an ISO 8601 duration",
    () =>
      Effect.gen(function* durationLexicalSpace() {
        const cases: readonly (readonly [string, number, string])[] = [
          ["90.5", 90.5, "90.5"],
          ["89.95", 89.95, "89.95"],
          ["-1.5", -1.5, "-1.5"],
          ["1E3", 1000, "1000"],
          ["INF", Number.POSITIVE_INFINITY, "INF"],
          ["-INF", Number.NEGATIVE_INFINITY, "-INF"],
          ["NaN", Number.NaN, "NaN"],
        ];
        for (const [lexical, seconds, written] of cases) {
          const single = yield* Effect.fromResult(parseLexical("duration", lexical));
          assert.strictEqual(single.baseType, "duration", lexical);
          assert.isTrue(Object.is(single.value, seconds), lexical);
          assert.strictEqual(format(single), written, lexical);
        }
        for (const lexical of ["PT1M30.5S", "P1D", "PT90S", "90s", ""]) {
          const error = yield* Effect.flip(Effect.fromResult(parseLexical("duration", lexical)));
          assert.strictEqual(error._tag, "InvalidValue", lexical);
          assert.strictEqual(error.baseType, "duration", lexical);
          assert.strictEqual(error.lexical, lexical);
        }
      }),
  );

  it.effect("reads a pair as written and refuses one with outer whitespace", () =>
    Effect.gen(function* pairsAsWritten() {
      const directed = yield* Effect.fromResult(parseLexical("directedPair", "A B"));
      assert.deepStrictEqual(directed, { baseType: "directedPair", value: ["A", "B"] });
      assert.strictEqual(format(directed), "A B");
      for (const lexical of [" A B", "A", "A B C", "A 1"]) {
        const error = yield* Effect.flip(Effect.fromResult(parseLexical("pair", lexical)));
        assert.strictEqual(error._tag, "InvalidValue");
      }
    }),
  );
});

describe("point values", () => {
  it.effect("reads two integers separated by whitespace as an exact point", () =>
    Effect.gen(function* pointRead() {
      assert.deepStrictEqual(yield* Effect.fromResult(parseLexical("point", "102 113")), {
        baseType: "point",
        value: [102n, 113n],
      });
      assert.deepStrictEqual(
        yield* Effect.fromResult(parseElementText("point", " 102  113 ")),
        Option.some<Single>({ baseType: "point", value: [102n, 113n] }),
      );
      assert.deepStrictEqual(
        yield* Effect.fromResult(parseElementText("point", "\n\t9007199254740993\r\n-12\t")),
        Option.some<Single>({ baseType: "point", value: [2n ** 53n + 1n, -12n] }),
      );
    }),
  );

  it.effect("refuses a non-integer coordinate, one coordinate, words, three and outer space", () =>
    Effect.gen(function* pointsRefused() {
      for (const lexical of ["1.5 2", "102", "a b", "1 2 3", " 102 113", "102,113", ""]) {
        const error = yield* Effect.flip(Effect.fromResult(parseLexical("point", lexical)));
        assert.strictEqual(error._tag, "InvalidValue", JSON.stringify(lexical));
        assert.strictEqual(error.baseType, "point");
        assert.strictEqual(error.lexical, lexical);
      }
      const trimmed = yield* Effect.flip(Effect.fromResult(parseElementText("point", " 1 2 3 ")));
      assert.strictEqual(trimmed.lexical, "1 2 3");
    }),
  );

  it.effect("round-trips a point through format as two runs of decimal digits", () =>
    Effect.gen(function* pointRoundTrip() {
      for (const [lexical, written] of [
        ["102 113", "102 113"],
        ["+0102\t\n-0", "102 0"],
        [`1${"0".repeat(30)} -7`, `1${"0".repeat(30)} -7`],
      ] as const) {
        const single = yield* Effect.fromResult(parseLexical("point", lexical));
        assert.strictEqual(format(single), written, lexical);
        assert.deepStrictEqual(yield* Effect.fromResult(parseLexical("point", written)), single);
      }
    }),
  );
});

/**
 * Count the significant digits of a finite xs:double lexical form: the digits of its mantissa
 * without the sign, the decimal point, the exponent, or leading and trailing zeros.
 *
 * @param lexical The lexical form.
 * @returns How many significant digits it writes.
 */
const significantDigits = (lexical: string): number =>
  lexical
    .replace(/^-/u, "")
    .replace(/[Ee].*$/u, "")
    .replace(".", "")
    .replace(/^0+/u, "")
    .replace(/0+$/u, "").length;

describe("format", () => {
  it.effect("writes every value the parser accepts, one case per base type", () =>
    Effect.gen(function* formatIsTotal() {
      const cases: readonly (readonly [ModelledBaseType, string, string])[] = [
        ["identifier", "RESPONSE_1", "RESPONSE_1"],
        ["boolean", "false", "false"],
        ["integer", "-9007199254740991", "-9007199254740991"],
        ["float", "1e400", "INF"],
        ["float", "-INF", "-INF"],
        ["float", "NaN", "NaN"],
        ["string", "a b", "a b"],
        ["pair", "A B", "A B"],
        ["directedPair", "B A", "B A"],
        ["point", "-3 +07", "-3 7"],
        ["duration", "90.50", "90.5"],
        ["uri", "https://example.org/a b", "https://example.org/a b"],
        ["file", "photo.png", "photo.png"],
      ];
      for (const [baseType, lexical, written] of cases) {
        const single = yield* Effect.fromResult(parseLexical(baseType, lexical));
        assert.strictEqual(format(single), written, `${baseType} ${lexical}`);
        assert.deepStrictEqual(
          yield* Effect.fromResult(parseLexical(baseType, format(single))),
          single,
        );
      }
    }),
  );

  it.effect(
    "writes a float as its shortest round trip: parseLexical reads it back, and one digit fewer reads back another double",
    () =>
      Effect.gen(function* shortestRoundTrip() {
        const doubles = [
          0.1,
          0.1 + 0.2,
          1 / 3,
          2.5,
          -1.5e-7,
          1e21,
          123_456_789_012_345_680_000,
          Number.MAX_VALUE,
          -Number.MAX_VALUE,
          Number.MIN_VALUE,
          0,
          -0,
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.NaN,
        ];
        for (const double of doubles) {
          const lexical = format({ baseType: "float", value: double });
          const again = yield* Effect.fromResult(parseLexical("float", lexical));
          assert.isTrue(
            Object.is(again.value, double),
            `${lexical} reads back as ${format(again)}`,
          );

          const digits = significantDigits(lexical);
          if (Number.isFinite(double) && double !== 0 && digits > 1) {
            assert.notStrictEqual(
              Number(double.toPrecision(digits - 1)),
              double,
              `${lexical} has a shorter form that reads back`,
            );
          }
        }

        assert.strictEqual(format({ baseType: "float", value: 0.1 + 0.2 }), "0.30000000000000004");
      }),
  );
});

describe("isXmlText", () => {
  it("refuses a control character other than tab and the line breaks, U+FFFE, U+FFFF and a lone surrogate", () => {
    for (const text of [
      "a\u0000b",
      "a\u000Bb",
      "a\u001Fb",
      "a\uFFFEb",
      "a\uFFFFb",
      "a\uD800b",
      "\uDC00",
    ]) {
      assert.isFalse(isXmlText(text), JSON.stringify(text));
    }
  });

  it("admits tab, the line breaks, the empty text and an astral character", () => {
    for (const text of ["", "a\tb\nc\rd", "a\u{1F600}b", "\u{10FFFF}", "\uFFFD\uE000\uD7FF"]) {
      assert.isTrue(isXmlText(text), JSON.stringify(text));
    }
  });
});

describe("readIeeeDouble", () => {
  it("reads a literal as its IEEE double rounded to nearest, an infinity past the largest finite double and a zero below the least subnormal, each of its sign (reading 144)", () => {
    const cases: readonly (readonly [string, number])[] = [
      ["1e400", Number.POSITIVE_INFINITY],
      ["2e400", Number.POSITIVE_INFINITY],
      ["INF", Number.POSITIVE_INFINITY],
      ["-1e400", Number.NEGATIVE_INFINITY],
      ["-INF", Number.NEGATIVE_INFINITY],
      ["0", 0],
      ["-0", -0],
      ["1e-400", 0],
      ["-1e-400", -0],
      ["NaN", Number.NaN],
      ["2.5", 2.5],
      // The nearest double: below the midpoint past the largest finite double, and above it.
      ["1.7976931348623158e308", Number.MAX_VALUE],
      ["1.7976931348623159e308", Number.POSITIVE_INFINITY],
      // The least subnormal, from just above half of it; just below half of it is a zero.
      ["2.4703282292062328e-324", Number.MIN_VALUE],
      ["2.4703282292062327e-324", 0],
      ["-2.4703282292062327e-324", -0],
    ];
    for (const [lexical, number] of cases) {
      const read = readIeeeDouble(lexical);
      assert.isTrue(Option.isSome(read), lexical);
      assert.isTrue(Object.is(Option.getOrUndefined(read), number), lexical);
    }
  });

  it("reads nothing outside xs:double's lexical space", () => {
    for (const text of ["", " 1", "1 ", "+INF", "Infinity", "inf", "1e", "0x10", "1_000"]) {
      assert.isTrue(Option.isNone(readIeeeDouble(text)), JSON.stringify(text));
    }
  });
});

describe("isModelled", () => {
  it("holds every base type, file included", () => {
    const modelled = [
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
    ];
    for (const baseType of modelled) {
      assert.isTrue(isModelled(baseType), baseType);
    }
    for (const baseType of ["record", "any", ""]) {
      assert.isFalse(isModelled(baseType), baseType);
    }
  });
});
