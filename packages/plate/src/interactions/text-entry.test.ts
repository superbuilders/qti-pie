import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { configure } from "#plate/configuration.ts";
import { Malformed, decodeValue, entryName } from "#plate/form/encoding.ts";
import type { Entry } from "#plate/form/encoding.ts";
import { validateTextEntry } from "#plate/interactions/text-entry.ts";
import type { TextEntryInteraction } from "#plate/interactions/text-entry.ts";
import { message } from "#plate/messages.ts";
import type { Value } from "#plate/model/values.ts";

/**
 * The item instance whose entry names the posts here use.
 */
const instance = "6f1d2c3b-4a5e-4f60-8b71-9c2d3e4f5a6b";

/**
 * The identifier of the response the first Text Entry of every item here binds.
 */
const response = "RESPONSE";

/**
 * The form entry name the first Text Entry's Control posts under by default.
 */
const name = entryName(instance, response);

/**
 * The path of the paragraph every item body here holds.
 */
const paragraphPath = "qti-assessment-item/qti-item-body/p";

/**
 * An unnamed Text Entry for a city, bound to a single string, with the author's class, an
 * `expected-length` and a `placeholder-text`.
 */
const city: TextEntryInteraction = {
  ariaLabel: Option.none(),
  ariaLabelledby: Option.none(),
  base: 10,
  baseType: "string",
  cardinality: "single",
  class: Option.some("short-answer"),
  data: [],
  expectedLength: Option.some(12n),
  kind: "text-entry",
  path: `${paragraphPath}/qti-text-entry-interaction`,
  patternMask: Option.none(),
  patternMaskMessage: Option.none(),
  placeholder: Option.some("A city"),
  response,
};

/**
 * The city's Text Entry bound to a single float, with no class, length or placeholder.
 */
const length: TextEntryInteraction = {
  ...city,
  baseType: "float",
  class: Option.none(),
  expectedLength: Option.none(),
  placeholder: Option.none(),
};

/**
 * The author's message for a mismatch on {@link masked}.
 */
const maskMessage = "Enter up to six digits and points.";

/**
 * The city's Text Entry with a `pattern-mask` of up to six digits and points, and the author's
 * `data-patternmask-message`.
 */
const masked: TextEntryInteraction = {
  ...city,
  patternMask: Option.some("([0-9.]{0,6})"),
  patternMaskMessage: Option.some(maskMessage),
};

/**
 * Decode the entries posted for a Text Entry as its caller does: under the entry name the caller
 * gave its Control, as a single value of its base type, an integer in its `base`.
 *
 * @param interaction The Text Entry.
 * @param entries The posted entries.
 * @param entry The entry name the caller reads, the first Text Entry's default name unless given.
 * @returns The decoded value, or the {@link Malformed} `decode` gave.
 */
const decoded = (
  interaction: TextEntryInteraction,
  entries: readonly Entry[],
  entry: string = name,
): Effect.Effect<Value | Malformed> =>
  Effect.succeed(
    Result.merge(
      decodeValue(
        entries,
        { baseType: interaction.baseType, cardinality: "single", name: entry },
        { base: interaction.base },
      ),
    ),
  );

describe("validateTextEntry", () => {
  it.effect("gives a Malformed number malformedNumber, or the author's pattern-mask message", () =>
    Effect.gen(function* malformedInput() {
      const configuration = yield* configure({ seed: "", validateResponses: false });
      const authored: TextEntryInteraction = {
        ...length,
        patternMaskMessage: Option.some("Enter a length in metres."),
      };
      const abc = yield* decoded(length, [[name, "abc"]]);

      assert.instanceOf(abc, Malformed);
      assert.deepStrictEqual(validateTextEntry(length, abc, configuration), [
        { response, text: message("en", "malformedNumber") },
      ]);
      assert.deepStrictEqual(validateTextEntry(authored, abc, configuration), [
        { response, text: "Enter a length in metres." },
      ]);
    }),
  );

  it.effect("gives a string's second entry malformedSingleMany", () =>
    Effect.gen(function* stringRefusals() {
      const configuration = yield* configure({ seed: "", validateResponses: false });
      const twice = yield* decoded(city, [
        [name, "York"],
        [name, "Leeds"],
      ]);

      assert.instanceOf(twice, Malformed);
      assert.strictEqual(twice.reason, "single-many");
      assert.deepStrictEqual(validateTextEntry(city, twice, configuration), [
        { response, text: message("en", "malformedSingleMany") },
      ]);
    }),
  );

  it.effect(
    "checks pattern-mask under validateResponses only: 12a gives the author's message, 12.5 none",
    () =>
      Effect.gen(function* patternMismatch() {
        const strict = yield* configure({ seed: "", validateResponses: true });
        const lenient = yield* configure({ seed: "", validateResponses: false });
        const mismatch = yield* decoded(masked, [[name, "12a"]]);

        assert.deepStrictEqual(validateTextEntry(masked, mismatch, strict), [
          { response, text: maskMessage },
        ]);
        assert.deepStrictEqual(
          validateTextEntry({ ...masked, patternMaskMessage: Option.none() }, mismatch, strict),
          [{ response, text: message("en", "patternMismatch") }],
        );
        assert.deepStrictEqual(
          validateTextEntry(masked, yield* decoded(masked, [[name, "12.5"]]), strict),
          [],
        );
        assert.deepStrictEqual(validateTextEntry(masked, mismatch, lenient), []);
      }),
  );

  it.effect("checks no NULL against pattern-mask, even one that refuses empty text", () =>
    Effect.gen(function* nullAgainstPattern() {
      const digits: TextEntryInteraction = { ...masked, patternMask: Option.some("[0-9]+") };
      const value = yield* decoded(digits, [[name, ""]]);

      assert.deepStrictEqual(value, { baseType: "string", cardinality: "single", values: [] });
      assert.deepStrictEqual(
        validateTextEntry(digits, value, yield* configure({ seed: "", validateResponses: true })),
        [],
      );
    }),
  );

  it.effect("matches a float posted 1.50 against pattern-mask as 1.5, and a string as typed", () =>
    Effect.gen(function* canonicalFloat() {
      const strict = yield* configure({ seed: "", validateResponses: true });
      const oneDecimal = Option.some(String.raw`[0-9]\.[0-9]`);
      const measured: TextEntryInteraction = { ...length, patternMask: oneDecimal };
      const typed: TextEntryInteraction = { ...city, patternMask: oneDecimal };
      const mismatch = [{ response, text: message("en", "patternMismatch") }];

      assert.deepStrictEqual(
        validateTextEntry(measured, yield* decoded(measured, [[name, "1.50"]]), strict),
        [],
      );
      assert.deepStrictEqual(
        validateTextEntry(measured, yield* decoded(measured, [[name, "1.55"]]), strict),
        mismatch,
      );
      assert.deepStrictEqual(
        validateTextEntry(typed, yield* decoded(typed, [[name, "1.50"]]), strict),
        mismatch,
      );
    }),
  );

  it.effect(
    "accepts every decoded value without a pattern-mask, an integer in its base and NULL included, whatever validateResponses says",
    () =>
      Effect.gen(function* decodedValues() {
        const hex: TextEntryInteraction = { ...length, base: 16, baseType: "integer" };

        for (const validateResponses of [false, true]) {
          const configuration = yield* configure({ seed: "", validateResponses });

          for (const [interaction, posted] of [
            [city, "York"],
            [length, "2.5"],
            [hex, "-ff"],
            [city, ""],
          ] as const) {
            const value = yield* decoded(interaction, [[name, posted]]);

            assert.notInstanceOf(value, Malformed);
            assert.deepStrictEqual(validateTextEntry(interaction, value, configuration), []);
          }
        }

        assert.deepStrictEqual(
          validateTextEntry(
            hex,
            yield* decoded(hex, [[name, "fg"]]),
            yield* configure({ seed: "", validateResponses: false }),
          ),
          [{ response, text: message("en", "malformedNumber") }],
        );
      }),
  );

  it.effect(
    "judges no expected-length on any binding: a text longer than it gives no message, whatever validateResponses says",
    () =>
      Effect.gen(function* expectedLengthUnjudged() {
        const short: TextEntryInteraction = { ...city, expectedLength: Option.some(2n) };
        const counted: TextEntryInteraction = { ...length, expectedLength: Option.some(2n) };

        for (const validateResponses of [false, true]) {
          const configuration = yield* configure({ seed: "", validateResponses });

          for (const [interaction, posted] of [
            [short, "Constantinople"],
            [counted, "12345.678"],
          ] as const) {
            const value = yield* decoded(interaction, [[name, posted]]);

            assert.notInstanceOf(value, Malformed);
            assert.deepStrictEqual(validateTextEntry(interaction, value, configuration), []);
          }
        }
      }),
  );
});
