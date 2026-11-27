/**
 * Match's and Gap Match's binding.
 *
 * The binding is held to the class descriptions' sentences: "The MatchInteraction must be bound to
 * a response variable with base-type directedPair and either single or multiple cardinality"
 * (section 5.89), and the GapMatchInteraction the same "depending on the number of gaps" (section
 * 5.57), which reading `gap-match-cardinality` reads for two or more gaps.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { readSource } from "#plate/document/read.ts";
import { admittedItem } from "#plate/test/admitted.ts";

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
