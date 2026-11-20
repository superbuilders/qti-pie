import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { configure } from "#plate/configuration.ts";
import type { SourceElement } from "#plate/document/source.ts";
import { Malformed, decodeValue, entryName } from "#plate/form/encoding.ts";
import type { Entry } from "#plate/form/encoding.ts";
import { validateExtendedText } from "#plate/interactions/extended-text.ts";
import type { ExtendedTextInteraction } from "#plate/interactions/extended-text.ts";
import { message } from "#plate/messages.ts";
import type { BodyNode } from "#plate/model/item.ts";
import type { Value } from "#plate/model/values.ts";
import { checkResponses } from "#plate/responses.ts";
import { attr, doc, el, text as sourceText } from "#plate/test/source.ts";
import { admittedSource } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";

/**
 * The item instance whose entry names the posts here use.
 */
const instance = "7d3e9a10-4b2c-4f6e-8a51-2c9b0e7f4d13";

/**
 * The identifier of the response the first Extended Text here binds.
 */
const response = "ESSAY";

/**
 * The form entry name the first Extended Text's Control posts under.
 */
const name = entryName(instance, response);

/**
 * Construct a text node of the body.
 *
 * @param value The text.
 * @returns The node.
 */
const words = (value: string): BodyNode => ({ kind: "text", text: value });

/**
 * A plain string Extended Text with a Prompt, the author's class and five expected lines.
 */
const essay: ExtendedTextInteraction = {
  ariaLabel: Option.none(),
  ariaLabelledby: Option.none(),
  base: 10,
  baseType: "string",
  cardinality: "single",
  class: Option.some("qti-height-lines-6"),
  data: [],
  expectedLength: Option.none(),
  expectedLines: Option.some(5n),
  format: "plain",
  kind: "extended-text",
  maxStrings: Option.none(),
  minStrings: 0n,
  path: "qti-assessment-item/qti-item-body/qti-extended-text-interaction",
  patternMask: Option.none(),
  patternMaskMessage: Option.none(),
  placeholder: Option.none(),
  prompt: Option.some([words("Describe your day.")]),
  response,
};

/**
 * The essay with no Prompt, no class and no expected lines.
 */
const bare: ExtendedTextInteraction = {
  ...essay,
  class: Option.none(),
  expectedLines: Option.none(),
  prompt: Option.none(),
};

/**
 * The bare essay bound to a float, so its posted text is read as a number.
 */
const measure: ExtendedTextInteraction = { ...bare, baseType: "float" };

/**
 * The essay in the `xhtml` format, which plate presents as a plain textarea of text.
 */
const rich: ExtendedTextInteraction = { ...essay, format: "xhtml" };

/**
 * The `xhtml` essay with a `pattern-mask` of lower-case words and the author's message for it.
 */
const masked: ExtendedTextInteraction = {
  ...rich,
  patternMask: Option.some("[a-z ]+"),
  patternMaskMessage: Option.some("Write in lower-case words."),
};

/**
 * The essay bound to an `ordered` response of at most three strings.
 */
const rivers: ExtendedTextInteraction = {
  ...essay,
  cardinality: "ordered",
  maxStrings: Option.some(3n),
  prompt: Option.some([words("Name three rivers.")]),
};

/**
 * Give the cardinality of the value an Extended Text here binds: every fixture binds a value, never
 * a record.
 *
 * @param interaction The Extended Text.
 * @returns Its cardinality.
 */
const valueCardinality = (
  interaction: ExtendedTextInteraction,
): Exclude<ExtendedTextInteraction["cardinality"], "record"> =>
  interaction.cardinality === "record"
    ? assert.fail(`The Extended Text for ${interaction.response} binds a record.`)
    : interaction.cardinality;

/**
 * Decode the entries posted for an Extended Text as its caller does, under the default entry name,
 * as a value of the interaction's base type and cardinality.
 *
 * @param interaction The Extended Text.
 * @param entries The posted entries.
 * @returns The decoded value, or the {@link Malformed} `decode` gave.
 */
const decoded = (
  interaction: ExtendedTextInteraction,
  entries: readonly Entry[],
): Effect.Effect<Value | Malformed> =>
  Effect.succeed(
    Result.merge(
      decodeValue(entries, {
        baseType: interaction.baseType,
        cardinality: valueCardinality(interaction),
        name: entryName(instance, interaction.response),
      }),
    ),
  );

describe("validateExtendedText", () => {
  it.effect("under validateResponses, checks a single entry against the pattern-mask", () =>
    Effect.gen(function* patternChecked() {
      const configuration = yield* configure({ seed: "", validateResponses: true });
      const mismatch = yield* decoded(masked, [[name, "<b>x</b>"]]);
      const messages = validateExtendedText(masked, mismatch, configuration);

      assert.deepStrictEqual(messages, [{ response, text: "Write in lower-case words." }]);
      assert.deepStrictEqual(
        validateExtendedText(
          { ...masked, patternMaskMessage: Option.none() },
          mismatch,
          configuration,
        ),
        [{ response, text: message("en", "patternMismatch") }],
      );
      assert.deepStrictEqual(
        validateExtendedText(
          masked,
          mismatch,
          yield* configure({ seed: "", validateResponses: false }),
        ),
        [],
      );
      assert.deepStrictEqual(
        validateExtendedText(
          masked,
          yield* decoded(masked, [[name, "a quiet day"]]),
          configuration,
        ),
        [],
      );
      assert.deepStrictEqual(
        validateExtendedText(masked, yield* decoded(masked, []), configuration),
        [],
      );
    }),
  );

  it.effect(
    "refuses text that is not a number for a float or an integer, with the author's message when set",
    () =>
      Effect.gen(function* malformedNumber() {
        const configuration = yield* configure({ seed: "", validateResponses: true });
        const counted: ExtendedTextInteraction = { ...bare, baseType: "integer" };

        for (const interaction of [measure, counted]) {
          assert.deepStrictEqual(
            validateExtendedText(
              interaction,
              yield* decoded(interaction, [[name, "abc"]]),
              configuration,
            ),
            [{ response, text: message("en", "malformedNumber") }],
          );
        }

        const authored: ExtendedTextInteraction = {
          ...measure,
          patternMaskMessage: Option.some("Write a measurement, such as 2.5."),
        };
        assert.deepStrictEqual(
          validateExtendedText(authored, yield* decoded(authored, [[name, "abc"]]), configuration),
          [{ response, text: "Write a measurement, such as 2.5." }],
        );

        assert.deepStrictEqual(
          validateExtendedText(measure, yield* decoded(measure, [[name, "2.5"]]), configuration),
          [],
        );
      }),
  );

  it.effect(
    "accepts any decoded text, and refuses a string response posted twice with its own message",
    () =>
      Effect.gen(function* stringValues() {
        const configuration = yield* configure({ seed: "", validateResponses: true });

        for (const posted of [[], [[name, ""]], [[name, "a\r\nb"]]] as const) {
          assert.deepStrictEqual(
            validateExtendedText(essay, yield* decoded(essay, posted), configuration),
            [],
          );
        }

        const twice = yield* decoded(essay, [
          [name, "a"],
          [name, "b"],
        ]);
        assert.instanceOf(twice, Malformed);
        assert.strictEqual(twice.reason, "single-many");
        assert.deepStrictEqual(validateExtendedText(essay, twice, configuration), [
          { response, text: message("en", "malformedSingleMany") },
        ]);
      }),
  );
});

/**
 * Construct the entries a form posts for the first Extended Text, one per text, in order.
 *
 * @param texts The texts, one per Control.
 * @returns The entries, each under the default entry name.
 */
const entriesOf = (...texts: readonly string[]): readonly Entry[] =>
  texts.map((posted): Entry => [name, posted]);

describe("an Extended Text bound to a container", () => {
  it.effect(
    "refuses more entries than a nonzero max-strings whatever validateResponses says, and fewer than min-strings only under it",
    () =>
      Effect.gen(function* counts() {
        const lenient = yield* configure({ seed: "", validateResponses: false });
        const strict = yield* configure({ seed: "", validateResponses: true });
        const four = yield* decoded(rivers, entriesOf("a", "b", "c", "d"));

        for (const configuration of [lenient, strict]) {
          assert.deepStrictEqual(validateExtendedText(rivers, four, configuration), [
            { response, text: message("en", "atMostStrings", { n: "3" }) },
          ]);
        }
        assert.deepStrictEqual(
          validateExtendedText(rivers, yield* decoded(rivers, entriesOf("a", "b", "c")), strict),
          [],
        );

        const pair: ExtendedTextInteraction = { ...rivers, minStrings: 2n };
        const one = yield* decoded(pair, entriesOf("a", "", ""));
        assert.deepStrictEqual(validateExtendedText(pair, one, strict), [
          { response, text: message("en", "atLeastStrings", { n: "2" }) },
        ]);
        assert.deepStrictEqual(validateExtendedText(pair, one, lenient), []);

        const atMostOne: ExtendedTextInteraction = { ...rivers, maxStrings: Option.some(1n) };
        assert.deepStrictEqual(
          validateExtendedText(atMostOne, yield* decoded(atMostOne, entriesOf("a", "b")), lenient),
          [{ response, text: message("en", "atMostOneString") }],
        );

        const atLeastOne: ExtendedTextInteraction = { ...rivers, minStrings: 1n };
        assert.deepStrictEqual(
          validateExtendedText(
            atLeastOne,
            yield* decoded(atLeastOne, entriesOf("", "", "")),
            strict,
          ),
          [{ response, text: message("en", "atLeastOneString") }],
        );

        const unlimited: ExtendedTextInteraction = { ...rivers, maxStrings: Option.some(0n) };
        const many = Array.from({ length: 25 }, (_, index) => `river ${index}`);
        assert.deepStrictEqual(
          validateExtendedText(unlimited, yield* decoded(unlimited, entriesOf(...many)), strict),
          [],
        );
      }),
  );

  it.effect("under validateResponses, checks the pattern-mask on each member of a container", () =>
    Effect.gen(function* eachMember() {
      const strict = yield* configure({ seed: "", validateResponses: true });
      const lowered: ExtendedTextInteraction = {
        ...rivers,
        patternMask: Option.some("[a-z ]+"),
        patternMaskMessage: Option.some("Write in lower-case words."),
      };
      const mixed = yield* decoded(lowered, entriesOf("nile", "Amazon"));

      assert.deepStrictEqual(validateExtendedText(lowered, mixed, strict), [
        { response, text: "Write in lower-case words." },
      ]);
      assert.deepStrictEqual(
        validateExtendedText(
          lowered,
          mixed,
          yield* configure({ seed: "", validateResponses: false }),
        ),
        [],
      );
      assert.deepStrictEqual(
        validateExtendedText(lowered, yield* decoded(lowered, entriesOf("nile", "amazon")), strict),
        [],
      );
    }),
  );
});

/**
 * Construct a `qti-simple-choice` holding only text.
 *
 * @param identifier The choice's identifier.
 * @param label The choice's text.
 * @returns The choice element.
 */
const simpleChoice = (identifier: string, label: string): SourceElement =>
  el("qti-simple-choice", [attr("identifier", identifier)], [sourceText(label)]);

/**
 * Construct a response declaration of a single value.
 *
 * @param identifier The declared identifier.
 * @param baseType The `base-type` value.
 * @returns The declaration element.
 */
const declaration = (identifier: string, baseType: string): SourceElement =>
  el("qti-response-declaration", [
    attr("base-type", baseType),
    attr("cardinality", "single"),
    attr("identifier", identifier),
  ]);

describe("an Extended Text the renderer does not support", () => {
  it.effect(
    'judges no min-strings count for an Extended Text whose min-strings="101" renders the notice in place of its Controls, so its item can be submitted, and still checks its posted value against max-strings and the pattern-mask',
    () =>
      Effect.gen(function* overCapCounts() {
        const path = "qti-assessment-item/qti-item-body/qti-extended-text-interaction";
        const verdict = admittedSource(
          doc(
            "items/over-cap.xml",
            el(
              "qti-assessment-item",
              [
                attr("identifier", "over-cap"),
                attr("time-dependent", "false"),
                attr("title", "Over the cap"),
              ],
              [
                declaration("RESPONSE", "identifier"),
                el("qti-response-declaration", [
                  attr("base-type", "string"),
                  attr("cardinality", "multiple"),
                  attr("identifier", response),
                ]),
                el(
                  "qti-item-body",
                  [],
                  [
                    el(
                      "qti-choice-interaction",
                      [attr("max-choices", "1"), attr("response-identifier", "RESPONSE")],
                      [simpleChoice("A", "Red"), simpleChoice("B", "Green")],
                    ),
                    el("qti-extended-text-interaction", [
                      attr("max-strings", "0"),
                      attr("min-strings", "101"),
                      attr("response-identifier", response),
                    ]),
                  ],
                ),
              ],
            ),
          ),
        );
        const accepted = acceptedItem(verdict).pipe(
          Option.filter(() => verdict.verdict === "accepted-with-unsupported"),
          Option.getOrElse(() =>
            assert.fail(`The item is ${verdict.verdict}, not accepted-with-unsupported.`),
          ),
        );
        const lenient = yield* configure({ seed: "", validateResponses: false });
        const strict = yield* configure({ seed: "", validateResponses: true });

        assert.deepStrictEqual(accepted.item.unsupported, [
          { feature: "min-strings>100", path, shown: "notice" },
        ]);
        assert.deepStrictEqual(
          checkResponses(
            accepted,
            {
              RESPONSE: {
                baseType: "identifier",
                cardinality: "single",
                values: [{ baseType: "identifier", value: "B" }],
              },
            },
            strict,
          ),
          [],
        );

        const over: ExtendedTextInteraction = {
          ...rivers,
          maxStrings: Option.some(2n),
          minStrings: 101n,
        };
        assert.deepStrictEqual(
          validateExtendedText(over, yield* decoded(over, entriesOf("a", "b")), strict),
          [],
        );

        const three = yield* decoded(over, entriesOf("a", "b", "c"));
        for (const configuration of [lenient, strict]) {
          assert.deepStrictEqual(validateExtendedText(over, three, configuration), [
            { response, text: message("en", "atMostStrings", { n: "2" }) },
          ]);
        }

        const overMasked: ExtendedTextInteraction = {
          ...over,
          patternMask: Option.some("[a-z ]+"),
          patternMaskMessage: Option.some("Write in lower-case words."),
        };
        assert.deepStrictEqual(
          validateExtendedText(
            overMasked,
            yield* decoded(overMasked, entriesOf("nile", "Amazon")),
            strict,
          ),
          [{ response, text: "Write in lower-case words." }],
        );
      }),
  );
});
