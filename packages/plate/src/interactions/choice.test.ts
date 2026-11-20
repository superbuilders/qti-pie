import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { configure } from "#plate/configuration.ts";
import { Malformed, decodeValue, entryName } from "#plate/form/encoding.ts";
import type { Entry } from "#plate/form/encoding.ts";
import { validateChoice } from "#plate/interactions/choice.ts";
import type { ChoiceInteraction } from "#plate/interactions/choice.ts";
import { message } from "#plate/messages.ts";
import type { BodyNode } from "#plate/model/item.ts";
import type { Value } from "#plate/model/values.ts";

/**
 * The item instance whose entry name the posts here use.
 */
const instance = "0b6c1f3e-2a4d-4c8e-9f17-5d2e8a3b6c40";

/**
 * The identifier of the response every Choice here binds.
 */
const response = "RESPONSE";

/**
 * The form entry name the Choice's Controls post under.
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
 * A single Choice of three colours with a phrasing Prompt.
 */
const colours: ChoiceInteraction = {
  ariaLabel: Option.none(),
  ariaLabelledby: Option.none(),
  cardinality: "single",
  choices: [
    { content: [words("Red")], fixed: false, identifier: "A", templateVisibility: Option.none() },
    { content: [words("Green")], fixed: false, identifier: "B", templateVisibility: Option.none() },
    { content: [words("Blue")], fixed: false, identifier: "C", templateVisibility: Option.none() },
  ],
  class: Option.some("swatches"),
  data: [],
  kind: "choice",
  maxChoices: 1n,
  messages: { max: Option.none(), min: Option.none() },
  minChoices: 0n,
  orientation: "horizontal",
  path: "qti-assessment-item/qti-item-body/qti-choice-interaction",
  prompt: Option.some([words("Pick a colour.")]),
  response,
  shuffle: false,
};

/**
 * The colours as a multiple Choice that takes exactly two: checkboxes, `max-choices` and
 * `min-choices` 2.
 */
const pairs: ChoiceInteraction = {
  ...colours,
  cardinality: "multiple",
  maxChoices: 2n,
  minChoices: 2n,
};

/**
 * Construct the entries a form posts for the Choice's response.
 *
 * @param values The identifiers posted, in order.
 * @returns One entry per identifier, under the Choice's entry name.
 */
const posting = (...values: readonly string[]): readonly Entry[] =>
  values.map((value) => [name, value]);

/**
 * Decode the entries posted for a Choice as its caller does, under the entry name the caller gave
 * its Controls, as identifiers of the Choice's cardinality.
 *
 * @param interaction The Choice.
 * @param entries The posted entries.
 * @param entry The entry name the caller reads, the Choice's default name unless given.
 * @returns The decoded value, or the {@link Malformed} `decode` gave.
 */
const decoded = (
  interaction: ChoiceInteraction,
  entries: readonly Entry[],
  entry: string = name,
): Effect.Effect<Value | Malformed> =>
  Effect.succeed(
    Result.merge(
      decodeValue(entries, {
        baseType: "identifier",
        cardinality: interaction.cardinality,
        name: entry,
      }),
    ),
  );

describe("validateChoice", () => {
  it.effect("refuses over-ticking with validateResponses false and true alike", () =>
    Effect.gen(function* overTicking() {
      for (const validateResponses of [false, true]) {
        const messages = validateChoice(
          pairs,
          yield* decoded(pairs, posting("A", "B", "C")),
          yield* configure({ seed: "", validateResponses }),
        );

        assert.deepStrictEqual(messages, [{ response, text: message("en", "atMost", { n: "2" }) }]);
      }
    }),
  );

  it.effect("refuses fewer than min-choices only with validateResponses true", () =>
    Effect.gen(function* tooFew() {
      const one = yield* decoded(pairs, posting("A"));
      const lenient = validateChoice(
        pairs,
        one,
        yield* configure({ seed: "", validateResponses: false }),
      );
      const strict = validateChoice(
        pairs,
        one,
        yield* configure({ seed: "", validateResponses: true }),
      );

      assert.deepStrictEqual(lenient, []);
      assert.deepStrictEqual(strict, [{ response, text: message("en", "atLeast", { n: "2" }) }]);
    }),
  );

  it.effect(
    "refuses an identifier no choice presents, a duplicate and a second entry for a single",
    () =>
      Effect.gen(function* tierA() {
        const configuration = yield* configure({ seed: "", validateResponses: false });
        const unknown = { response, text: message("en", "unknownChoice") };

        assert.deepStrictEqual(
          validateChoice(colours, yield* decoded(colours, posting("Z")), configuration),
          [unknown],
        );
        assert.deepStrictEqual(
          validateChoice(
            colours,
            yield* decoded(colours, posting("not an identifier")),
            configuration,
          ),
          [unknown],
        );
        assert.deepStrictEqual(
          validateChoice(pairs, yield* decoded(pairs, posting("A", "A")), configuration),
          [unknown],
        );
        assert.deepStrictEqual(
          validateChoice(colours, yield* decoded(colours, posting("A", "B")), configuration),
          [{ response, text: message("en", "atMost", { n: "1" }) }],
        );
      }),
  );

  it.effect(
    "gives a Malformed single-many atMost 1, the author's max message when set, and any other unknownChoice",
    () =>
      Effect.gen(function* malformedInput() {
        const configuration = yield* configure({ seed: "", validateResponses: false });
        const twice = new Malformed({ entry: name, reason: "single-many" });
        const authored: ChoiceInteraction = {
          ...colours,
          messages: { max: Option.some("One only, please."), min: Option.none() },
        };

        assert.deepStrictEqual(validateChoice(colours, twice, configuration), [
          { response, text: message("en", "atMost", { n: "1" }) },
        ]);
        assert.deepStrictEqual(validateChoice(authored, twice, configuration), [
          { response, text: "One only, please." },
        ]);
        for (const reason of ["identifier", "number"] as const) {
          assert.deepStrictEqual(
            validateChoice(colours, new Malformed({ entry: name, reason }), configuration),
            [{ response, text: message("en", "unknownChoice") }],
          );
        }
      }),
  );

  it.effect("writes the author's data-max-selections-message and data-min-selections-message", () =>
    Effect.gen(function* authorMessages() {
      const authored: ChoiceInteraction = {
        ...pairs,
        messages: { max: Option.some("Two at most, please."), min: Option.some("Pick two.") },
      };
      const configuration = yield* configure({ seed: "", validateResponses: true });

      assert.deepStrictEqual(
        validateChoice(authored, yield* decoded(authored, posting("A", "B", "C")), configuration),
        [{ response, text: "Two at most, please." }],
      );
      assert.deepStrictEqual(
        validateChoice(authored, yield* decoded(authored, posting("A")), configuration),
        [{ response, text: "Pick two." }],
      );
    }),
  );
});
