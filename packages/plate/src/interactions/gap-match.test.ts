/**
 * Gap Match's response validation, held over the fixture `gap-match.xml` to what the information
 * model says a valid response is: the choices "represent the source of the pairing and gaps the
 * targets. Each gap can have at most one choice associated with it" (section 2.4.1.5); a gap
 * text's `match-max` is "the maximum number of choices this choice may be associated with. If
 * match-max is 0 there is no restriction" (5.58.5); a `match-group` lists "the identifiers for the
 * objects that can be matched with" its gap text (5.58.4) or its gap (5.55.4); a gap that is
 * `required` "must be filled by the candidate in order to form a valid response" (5.55.5);
 * `max-associations` caps the pairs, 1 where unwritten (the ASI XSD's default, reading 190) and no
 * cap at 0 (reading 53); and `min-associations` is "the minimum number of associations that the
 * candidate is required to make to form a valid response" (5.57.2). The least of a valid response,
 * `min-associations` and `required`, is judged only under `validateResponses`. The author's
 * `data-max-selections-message` and `data-min-selections-message` replace the catalog's words for
 * the two bounds.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { configure } from "#plate/configuration.ts";
import type { InvalidConfiguration } from "#plate/configuration.ts";
import { message } from "#plate/messages.ts";
import type { Value } from "#plate/model/values.ts";
import { checkResponses } from "#plate/responses.ts";
import { fixturesDirectory } from "#plate/test/scratch.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

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
 * Open `gap-match.xml`, as written or edited, failing the test when `admitted` does not accept it.
 *
 * Its Gap Match holds the gap texts `A` (`match-max` 1), `B` and `C` (`match-max` 2 each), and the
 * gaps `G1` and `G2`, with `max-associations` 2.
 *
 * @param edit The edit that makes a variant of the item's XML, none for the item as written.
 * @returns The accepted item.
 */
const opened = Effect.fnUntraced(function* opened(edit: (xml: string) => string = (xml) => xml) {
  const xml = yield* Effect.promise(() =>
    readFile(path.join(fixturesDirectory, "m3d", "items", "gap-match.xml"), "utf-8"),
  );
  const verdict = yield* admitted("items/gap-match.xml", new TextEncoder().encode(edit(xml)));

  return Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`the item is ${verdict.verdict}, not accepted`),
  );
});

/**
 * Construct the multiple directed-pair value of the pairs given, each written `"<choice> <gap>"`.
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
 * The fixture's correct response: `tulips` in the first gap and `bloom` in the second.
 */
const correct = pairs("A G1", "B G2");

/**
 * Add a third gap to the fixture's sentence, so three pairs fit its gaps and pass its
 * `max-associations` of 2.
 *
 * @param xml The item's XML.
 * @returns The XML with the gap `G3`.
 */
const thirdGap = (xml: string): string =>
  edited(
    xml,
    'they <qti-gap identifier="G2"/> in spring.',
    'they <qti-gap identifier="G2"/> in spring and <qti-gap identifier="G3"/> in the sun.',
  );

describe("Gap Match's response validation", () => {
  it.effect("refuses a gap that holds two choices, under either tier", () =>
    Effect.gen(function* gapFull() {
      const item = yield* opened();

      for (const validateResponses of [false, true]) {
        assert.deepStrictEqual(yield* judged(item, pairs("A G1", "B G1"), validateResponses), [
          message("en", "gapMatchGapFull", { gap: "G1" }),
        ]);
      }

      assert.deepStrictEqual(yield* judged(item, correct), []);
    }),
  );

  it.effect("refuses a gap text in more gaps than its match-max, and 0 is no limit", () =>
    Effect.gen(function* matchMax() {
      const item = yield* opened();

      assert.deepStrictEqual(yield* judged(item, pairs("A G1", "A G2")), [
        message("en", "gapMatchChoiceAtMostOne", { choice: "A" }),
      ]);
      assert.deepStrictEqual(yield* judged(item, pairs("B G1", "B G2")), [], "B's match-max is 2");

      const unlimited = yield* opened((xml) =>
        edited(
          xml,
          '<qti-gap-text identifier="A" match-max="1">',
          '<qti-gap-text identifier="A" match-max="0">',
        ),
      );

      assert.deepStrictEqual(yield* judged(unlimited, pairs("A G1", "A G2")), []);
    }),
  );

  it.effect("refuses a pair outside the match-group of its gap text, or of its gap", () =>
    Effect.gen(function* matchGroup() {
      const choiceGroup = yield* opened((xml) =>
        edited(
          xml,
          '<qti-gap-text identifier="A" match-max="1">',
          '<qti-gap-text identifier="A" match-max="1" match-group="G1">',
        ),
      );

      assert.deepStrictEqual(yield* judged(choiceGroup, pairs("A G2")), [
        message("en", "gapMatchNotInChoiceGroup", { choice: "A", gap: "G2", group: "G1" }),
      ]);
      assert.deepStrictEqual(yield* judged(choiceGroup, pairs("A G1")), []);
      assert.deepStrictEqual(yield* judged(choiceGroup, pairs("B G2")), []);

      const gapGroup = yield* opened((xml) =>
        edited(xml, '<qti-gap identifier="G2"/>', '<qti-gap identifier="G2" match-group="B"/>'),
      );

      assert.deepStrictEqual(yield* judged(gapGroup, pairs("C G2")), [
        message("en", "gapMatchNotInGapGroup", { choice: "C", gap: "G2", group: "B" }),
      ]);
      assert.deepStrictEqual(yield* judged(gapGroup, pairs("B G2")), []);
      assert.deepStrictEqual(yield* judged(gapGroup, pairs("C G1")), []);
    }),
  );

  it.effect(
    "refuses more pairs than max-associations under either tier, 1 where unwritten and none at 0, and fewer than min-associations only under validateResponses",
    () =>
      Effect.gen(function* associationBounds() {
        const three = pairs("A G1", "B G2", "C G3");
        const capped = yield* opened(thirdGap);

        for (const validateResponses of [false, true]) {
          assert.deepStrictEqual(yield* judged(capped, three, validateResponses), [
            message("en", "atMost", { n: "2" }),
          ]);
        }

        const floored = yield* opened((xml) =>
          edited(xml, 'max-associations="2"', 'max-associations="2" min-associations="1"'),
        );

        assert.deepStrictEqual(yield* judged(floored, pairs()), []);
        assert.deepStrictEqual(yield* judged(floored, pairs(), true), [
          message("en", "atLeast", { n: "1" }),
        ]);
        assert.deepStrictEqual(yield* judged(floored, pairs("A G1"), true), []);

        const worded = yield* opened((xml) =>
          edited(
            thirdGap(xml),
            'max-associations="2"',
            'max-associations="2" min-associations="1" data-min-selections-message="Fill a gap first." data-max-selections-message="Two gaps at most."',
          ),
        );

        assert.deepStrictEqual(yield* judged(worded, undefined, true), ["Fill a gap first."]);
        assert.deepStrictEqual(yield* judged(worded, three), ["Two gaps at most."]);

        const unwritten = yield* opened((xml) => edited(xml, ' max-associations="2"', ""));
        const unlimited = yield* opened((xml) =>
          edited(thirdGap(xml), 'max-associations="2"', 'max-associations="0"'),
        );

        assert.deepStrictEqual(yield* judged(unwritten, correct), [
          message("en", "atMost", { n: "1" }),
        ]);
        assert.deepStrictEqual(yield* judged(unwritten, pairs("A G1")), []);
        assert.deepStrictEqual(yield* judged(unlimited, three), []);
      }),
  );

  it.effect("refuses a required gap left empty only under validateResponses", () =>
    Effect.gen(function* requiredGap() {
      const item = yield* opened((xml) =>
        edited(xml, '<qti-gap identifier="G1"/>', '<qti-gap identifier="G1" required="true"/>'),
      );

      assert.deepStrictEqual(yield* judged(item, pairs("B G2")), []);
      assert.deepStrictEqual(yield* judged(item, pairs("B G2"), true), [
        message("en", "gapMatchGapRequired", { gap: "G1" }),
      ]);
      assert.deepStrictEqual(yield* judged(item, pairs("A G1"), true), []);
    }),
  );
});
