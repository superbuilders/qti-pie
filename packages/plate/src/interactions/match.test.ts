/**
 * Match's and Gap Match's binding, and Match's response validation.
 *
 * The binding is held to the class descriptions' sentences: "The MatchInteraction must be bound to
 * a response variable with base-type directedPair and either single or multiple cardinality"
 * (section 5.89), and the GapMatchInteraction the same "depending on the number of gaps" (section
 * 5.57), which reading 169 reads for two or more gaps.
 *
 * The validation is held, over the fixtures `match.xml` and `match-shuffle.xml`, to what the
 * information model says a valid response is: a Match creates associations "between pairs of
 * choices in the two sets, but not between pairs of choices in the same set" (section 2.4.1.4), the
 * first set "the source choices and the second set the targets" (5.89.7); a choice's `match-max` is
 * "the maximum number of choices this choice may be associated with. If match-max is 0 there is no
 * restriction" (5.131.6); its `match-group` lists "the objects that can be matched with this
 * choice" (5.131.5), a choice of either set; `max-associations` caps the pairs, 1 where unwritten
 * (the ASI XSD's default, reading 190) and no cap at 0 (reading 53); and `min-associations` is "the
 * minimum number of associations that the candidate is required to make to form a valid response",
 * judged only under `validateResponses`. The author's `data-max-selections-message` and
 * `data-min-selections-message` replace the catalog's words for the two bounds.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { configure } from "#plate/configuration.ts";
import type { InvalidConfiguration } from "#plate/configuration.ts";
import { readSource } from "#plate/document/read.ts";
import { message } from "#plate/messages.ts";
import type { Value } from "#plate/model/values.ts";
import { checkResponses } from "#plate/responses.ts";
import { fixturesDirectory } from "#plate/test/scratch.ts";
import { admitted, admittedItem } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * Write an item whose one interaction is bound to `RESPONSE`, declared with a base type and a
 * cardinality.
 *
 * @param interaction The interaction, as XML text.
 * @param baseType The declaration's `base-type`.
 * @param cardinality The declaration's `cardinality`.
 * @returns The item's text.
 */
const itemXml = (interaction: string, baseType: string, cardinality: string): string =>
  [
    '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="item" title="Item" adaptive="false" time-dependent="false">',
    `<qti-response-declaration identifier="RESPONSE" cardinality="${cardinality}" base-type="${baseType}"/>`,
    `<qti-item-body>${interaction}</qti-item-body>`,
    "</qti-assessment-item>",
  ].join("");

/**
 * A Match of one source and one target.
 */
const match = [
  '<qti-match-interaction response-identifier="RESPONSE">',
  '<qti-simple-match-set><qti-simple-associable-choice identifier="A" match-max="1">a</qti-simple-associable-choice></qti-simple-match-set>',
  '<qti-simple-match-set><qti-simple-associable-choice identifier="B" match-max="1">b</qti-simple-associable-choice></qti-simple-match-set>',
  "</qti-match-interaction>",
].join("");

/**
 * A Gap Match of one gap text and one gap, so either cardinality the class names binds it.
 */
const gapMatch = [
  '<qti-gap-match-interaction response-identifier="RESPONSE">',
  '<qti-gap-text identifier="W" match-max="1">word</qti-gap-text>',
  '<p>Fill <qti-gap identifier="G"/>.</p>',
  "</qti-gap-match-interaction>",
].join("");

/**
 * Read one of the Match fixtures as the text the author wrote.
 *
 * @param file The fixture's file name under `fixtures/m3d/items/`.
 * @returns The item's XML.
 */
const fixtureText = (file: string): Effect.Effect<string> =>
  Effect.promise(() => readFile(path.join(fixturesDirectory, "m3d", "items", file), "utf-8"));

/**
 * Replace the one place a text occurs in an item's XML, failing the test when it is not there.
 *
 * @param xml The item's XML.
 * @param from The text to find.
 * @param to The text to put in its place.
 * @returns The edited XML.
 */
const edited = (xml: string, from: string, to: string): string => {
  assert.include(xml, from);

  return xml.replace(from, to);
};

/**
 * Open an item's XML, failing the test when `admitted` does not accept it.
 *
 * @param xml The item's XML.
 * @returns The accepted item.
 */
const accepted = Effect.fnUntraced(function* accepted(xml: string) {
  const verdict = yield* admitted("items/match.xml", new TextEncoder().encode(xml));

  return Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`the item is ${verdict.verdict}, not accepted`),
  );
});

/**
 * Open a Match fixture, as written or edited.
 *
 * @param file The fixture's file name.
 * @param edit The edit that makes a variant of the item's XML, none for the item as written.
 * @returns The accepted item.
 */
const opened = Effect.fnUntraced(function* opened(
  file: string,
  edit: (xml: string) => string = (xml) => xml,
) {
  return yield* accepted(edit(yield* fixtureText(file)));
});

/**
 * Construct the multiple directed-pair value of the pairs given, each written `"<source>
 * <target>"`.
 *
 * @param written The pairs.
 * @returns The value.
 */
const pairs = (...written: readonly string[]): Value => ({
  baseType: "directedPair",
  cardinality: "multiple",
  values: written.map((pair) => {
    const [source = "", target = ""] = pair.split(" ");

    return { baseType: "directedPair", value: [source, target] };
  }),
});

/**
 * Give the texts of the messages `checkResponses` gives the item's `RESPONSE`.
 *
 * @param item The accepted item.
 * @param value The response's value, none to leave it out.
 * @param validateResponses Whether tier (b) limits apply too.
 * @returns The messages' texts, in order.
 */
const judged = (
  item: Accepted,
  value?: Value,
  validateResponses = false,
): Effect.Effect<readonly string[], InvalidConfiguration> =>
  Effect.map(configure({ seed: "", validateResponses }), (configuration) =>
    checkResponses(item, value === undefined ? {} : { RESPONSE: value }, configuration).map(
      ({ text }) => text,
    ),
  );

/**
 * The author's message for too many matches in `match.xml`.
 */
const authorMax = "Make three matches at most.";

/**
 * The author's message for too few matches in `match.xml`.
 */
const authorMin = "Make at least one match.";

/**
 * `match.xml`'s correct response: each tool with its trade.
 */
const correct = pairs("TROWEL GARDENER", "ANVIL SMITH", "LOOM WEAVER");

/**
 * Four pairs of `match.xml`, each within its choices' `match-max`: one more than its
 * `max-associations`.
 */
const four = pairs("TROWEL GARDENER", "TROWEL MASON", "ANVIL SMITH", "LOOM WEAVER");

/**
 * Leave out an item's two author messages, so the catalog's words are given.
 *
 * @param xml The item's XML.
 * @returns The XML without `data-max-selections-message` and `data-min-selections-message`.
 */
const wordless = (xml: string): string =>
  xml.replaceAll(/\s+data-m(?:in|ax)-selections-message="[^"]*"/gu, "");

describe("the binding of Match and Gap Match", () => {
  it.effect("builds a binding of directedPair, single or multiple", () =>
    Effect.gen(function* everyBinding() {
      const wrong: string[] = [];

      for (const [kind, interaction] of [
        ["match", match],
        ["gap-match", gapMatch],
      ] as const) {
        for (const cardinality of ["single", "multiple"] as const) {
          const source = yield* readSource(
            "items/item.xml",
            new TextEncoder().encode(itemXml(interaction, "directedPair", cardinality)),
          );
          if (admittedItem(source).body[0]?.kind !== kind) {
            wrong.push(`${kind} directedPair ${cardinality}`);
          }
        }
      }

      assert.deepStrictEqual(wrong, []);
    }),
  );
});

describe("Match's response validation", () => {
  it.effect(
    "refuses a choice of either set in more pairs than its match-max, under either tier, and 0 is no limit",
    () =>
      Effect.gen(function* matchMax() {
        const item = yield* opened("match.xml");

        for (const validateResponses of [false, true]) {
          assert.deepStrictEqual(
            yield* judged(item, pairs("ANVIL SMITH", "ANVIL MASON"), validateResponses),
            [message("en", "matchChoiceAtMostOne", { choice: "ANVIL" })],
          );
        }

        assert.deepStrictEqual(yield* judged(item, pairs("TROWEL GARDENER", "LOOM GARDENER")), [
          message("en", "matchChoiceAtMostOne", { choice: "GARDENER" }),
        ]);
        assert.deepStrictEqual(
          yield* judged(item, pairs("TROWEL GARDENER", "TROWEL MASON")),
          [],
          "TROWEL's match-max is 2",
        );

        const unlimited = yield* opened("match.xml", (xml) =>
          edited(
            xml,
            '<qti-simple-associable-choice identifier="ANVIL" match-max="1">',
            '<qti-simple-associable-choice identifier="ANVIL" match-max="0">',
          ),
        );

        assert.deepStrictEqual(yield* judged(unlimited, pairs("ANVIL SMITH", "ANVIL MASON")), []);
      }),
  );

  it.effect("refuses a pair outside the match-group of its source, or of its target", () =>
    Effect.gen(function* matchGroup() {
      const item = yield* opened("match-shuffle.xml");

      assert.deepStrictEqual(yield* judged(item, pairs("VIOLIN BRASS")), [
        message("en", "matchNotInSourceGroup", {
          group: "STRINGS, KEYBOARD",
          source: "VIOLIN",
          target: "BRASS",
        }),
      ]);
      assert.deepStrictEqual(yield* judged(item, pairs("VIOLIN STRINGS")), []);
      assert.deepStrictEqual(yield* judged(item, pairs("VIOLIN KEYBOARD")), []);
      assert.deepStrictEqual(yield* judged(item, pairs("TRUMPET BRASS")), []);

      const target = yield* opened("match-shuffle.xml", (xml) =>
        edited(
          xml,
          '<qti-simple-associable-choice identifier="BRASS" match-max="1">',
          '<qti-simple-associable-choice identifier="BRASS" match-max="1" match-group="TRUMPET">',
        ),
      );

      assert.deepStrictEqual(yield* judged(target, pairs("FLUTE BRASS")), [
        message("en", "matchNotInTargetGroup", {
          group: "TRUMPET",
          source: "FLUTE",
          target: "BRASS",
        }),
      ]);
      assert.deepStrictEqual(yield* judged(target, pairs("TRUMPET BRASS")), []);
    }),
  );

  it.effect(
    "refuses a pair whose source is no choice of the first set or whose target is none of the second",
    () =>
      Effect.gen(function* pairDirection() {
        const item = yield* opened("match-shuffle.xml");
        const unknown = [message("en", "unknownChoice")];

        assert.deepStrictEqual(yield* judged(item, pairs("VIOLIN NOPE")), unknown);
        assert.deepStrictEqual(
          yield* judged(item, pairs("STRINGS VIOLIN")),
          unknown,
          "a pair runs from the first set to the second",
        );
        assert.deepStrictEqual(
          yield* judged(item, pairs("VIOLIN DRUM")),
          unknown,
          "no pair joins two choices of one set",
        );
      }),
  );

  it.effect(
    "refuses more pairs than max-associations under either tier, 1 where unwritten and none at 0, and fewer than min-associations only under validateResponses",
    () =>
      Effect.gen(function* associationBounds() {
        const item = yield* opened("match.xml");

        for (const validateResponses of [false, true]) {
          assert.deepStrictEqual(yield* judged(item, four, validateResponses), [authorMax]);
          assert.deepStrictEqual(yield* judged(item, correct, validateResponses), []);
        }

        const floored = yield* opened("match.xml", (xml) =>
          edited(xml, 'max-associations="3"', 'max-associations="3" min-associations="1"'),
        );

        assert.deepStrictEqual(yield* judged(floored, pairs()), []);
        assert.deepStrictEqual(yield* judged(floored), []);
        assert.deepStrictEqual(yield* judged(floored, pairs(), true), [authorMin]);
        assert.deepStrictEqual(yield* judged(floored, undefined, true), [authorMin]);
        assert.deepStrictEqual(yield* judged(floored, pairs("LOOM WEAVER"), true), []);

        const plain = yield* opened("match.xml", (xml) =>
          edited(
            wordless(xml),
            'max-associations="3"',
            'max-associations="3" min-associations="1"',
          ),
        );

        assert.deepStrictEqual(yield* judged(plain, four), [message("en", "atMost", { n: "3" })]);
        assert.deepStrictEqual(yield* judged(plain, pairs(), true), [
          message("en", "atLeast", { n: "1" }),
        ]);

        const single = yield* opened("match.xml", (xml) =>
          edited(xml, ' max-associations="3"', ""),
        );
        const unwritten = yield* opened("match.xml", (xml) =>
          edited(wordless(xml), ' max-associations="3"', ""),
        );
        const unlimited = yield* opened("match.xml", (xml) =>
          edited(xml, 'max-associations="3"', 'max-associations="0"'),
        );

        assert.deepStrictEqual(yield* judged(single, correct), [authorMax]);
        assert.deepStrictEqual(yield* judged(single, pairs("ANVIL SMITH")), []);
        assert.deepStrictEqual(yield* judged(unwritten, correct), [
          message("en", "atMost", { n: "1" }),
        ]);
        assert.deepStrictEqual(yield* judged(unlimited, four), []);
      }),
  );
});
