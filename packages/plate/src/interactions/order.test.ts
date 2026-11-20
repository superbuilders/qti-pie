/**
 * Order's response validation, held over the fixtures `order.xml` and `order-subset.xml` to what
 * the information model says a valid response is. In an Order "the candidate's task is to reorder
 * the choices" (section 2.4.1.2), so a response places choices of the interaction, each once. Its
 * `min-choices` is "the minimum number of choices that the candidate must select and order to form
 * a valid response to the interaction ... If unspecified, all of the choices must be ordered and
 * max-choices is ignored" (5.97.2, reading 18), judged only under `validateResponses`, and its
 * `max-choices` the most "the candidate may select and order" (5.97.3), judged always. The author's
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
 * Open an Order fixture, as written or edited, failing the test when `admitted` does not accept it.
 *
 * `order.xml` orders the four choices `A` to `D` and writes no `min-choices`; `order-subset.xml`
 * orders two or three of the five choices `A` to `E`, `min-choices` 2 and `max-choices` 3, each
 * bound with its author's message.
 *
 * @param file The fixture's file name under `fixtures/ei/items/`.
 * @param edit The edit that makes a variant of the item's XML, none for the item as written.
 * @returns The accepted item.
 */
const opened = Effect.fnUntraced(function* opened(
  file: string,
  edit: (xml: string) => string = (xml) => xml,
) {
  const xml = yield* Effect.promise(() =>
    readFile(path.join(fixturesDirectory, "ei", "items", file), "utf-8"),
  );
  const verdict = yield* admitted(`items/${file}`, new TextEncoder().encode(edit(xml)));

  return Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${file} is ${verdict.verdict}, not accepted`),
  );
});

/**
 * Construct the ordered identifier value of the identifiers given.
 *
 * @param identifiers The identifiers, in order.
 * @returns The value.
 */
const ordered = (...identifiers: readonly string[]): Value => ({
  baseType: "identifier",
  cardinality: "ordered",
  values: identifiers.map((value) => ({ baseType: "identifier", value })),
});

/**
 * Give the texts of the messages `checkResponses` gives the item's `RESPONSE`.
 *
 * @param item The accepted item.
 * @param value The response's value.
 * @param validateResponses Whether tier (b) limits apply too.
 * @returns The messages' texts, in order.
 */
const judged = (
  item: Accepted,
  value: Value,
  validateResponses = false,
): Effect.Effect<readonly string[], InvalidConfiguration> =>
  Effect.map(configure({ seed: "", validateResponses }), (configuration) =>
    checkResponses(item, { RESPONSE: value }, configuration).map(({ text }) => text),
  );

describe("Order's response validation", () => {
  it.effect("refuses a choice placed twice, under either tier", () =>
    Effect.gen(function* repeated() {
      const item = yield* opened("order.xml");
      const twice = message("en", "orderRepeated", { choice: "A" });

      assert.deepStrictEqual(yield* judged(item, ordered("A", "A", "B")), [twice]);
      assert.deepStrictEqual(yield* judged(item, ordered("A", "A", "B", "C", "D"), true), [twice]);
      assert.deepStrictEqual(yield* judged(item, ordered("A", "B")), []);
    }),
  );

  it.effect("refuses an identifier that names no choice of the Order", () =>
    Effect.gen(function* unknown() {
      const item = yield* opened("order.xml");
      const refused = [message("en", "unknownChoice")];

      assert.deepStrictEqual(yield* judged(item, ordered("Z", "A")), refused);
      assert.deepStrictEqual(yield* judged(item, ordered("A", "B", "C", "D", "E")), refused);
    }),
  );

  it.effect(
    "without min-choices needs every choice ordered under validateResponses, and ignores max-choices",
    () =>
      Effect.gen(function* everyChoice() {
        const item = yield* opened("order.xml");
        const all = [message("en", "orderAll", { n: "4" })];

        assert.deepStrictEqual(yield* judged(item, ordered("A", "B")), []);
        assert.deepStrictEqual(yield* judged(item, ordered("A", "B"), true), all);
        assert.deepStrictEqual(yield* judged(item, ordered(), true), all);
        assert.deepStrictEqual(yield* judged(item, ordered("B", "A", "C", "D"), true), []);

        const capped = yield* opened("order.xml", (xml) =>
          edited(
            xml,
            '<qti-order-interaction response-identifier="RESPONSE">',
            '<qti-order-interaction response-identifier="RESPONSE" max-choices="2">',
          ),
        );

        assert.deepStrictEqual(yield* judged(capped, ordered("B", "A", "C", "D"), true), []);
        assert.deepStrictEqual(yield* judged(capped, ordered("B", "A"), true), all);
      }),
  );

  it.effect(
    "holds a subset to max-choices under either tier and to min-choices only under validateResponses",
    () =>
      Effect.gen(function* subsetBounds() {
        const item = yield* opened("order-subset.xml");
        const tooFew = ["Put at least two items in order."];
        const tooMany = ["Put no more than three items in order."];

        assert.deepStrictEqual(yield* judged(item, ordered("D")), []);
        assert.deepStrictEqual(yield* judged(item, ordered("D"), true), tooFew);
        assert.deepStrictEqual(yield* judged(item, ordered("D", "A"), true), []);
        assert.deepStrictEqual(yield* judged(item, ordered("D", "A", "B"), true), []);
        for (const validateResponses of [false, true]) {
          assert.deepStrictEqual(
            yield* judged(item, ordered("D", "A", "B", "E"), validateResponses),
            tooMany,
          );
        }

        const plain = yield* opened("order-subset.xml", (xml) =>
          xml.replaceAll(/\s+data-m(?:in|ax)-selections-message="[^"]*"/gu, ""),
        );

        assert.deepStrictEqual(yield* judged(plain, ordered("D"), true), [
          message("en", "orderAtLeast", { n: "2" }),
        ]);
        assert.deepStrictEqual(yield* judged(plain, ordered("D", "A", "B", "E")), [
          message("en", "orderAtMost", { n: "3" }),
        ]);
      }),
  );
});
