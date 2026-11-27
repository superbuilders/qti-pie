import { assert, describe, it } from "@effect/vitest";
import { growthFactor, growthLimit, growthRatio } from "@qti-pie/crust/test/growth.ts";
import { Effect, Option, Result } from "effect";
import { format, parseElementText, parseLexical } from "#plate/model/values.ts";
import type { ModelledBaseType, Single } from "#plate/model/values.ts";

describe("parseElementText", () => {
  it.effect("trims a 100,000-character whitespace run in linear time", () =>
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

  it.effect(
    "reads a float beyond the largest double as an infinity of its sign, as XML Schema 1.1's doubleLexicalMap does (reading `bounded-double`)",
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
});

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
});
