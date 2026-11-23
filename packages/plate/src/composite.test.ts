/**
 * A composite item, `fixtures/m3e/items/composite.xml` (upstream #129): one body holding a Choice,
 * a Text Entry, an Inline Choice and an Extended Text, each bound to a single response of its own,
 * whose response processing adds 1 to `SCORE` for each of the first three that matches its correct
 * response and never reads the fourth, `NOTE`. Each case is held to the item's own declarations
 * and processing:
 *
 * - "Each response variable declared may be bound to one and only one interaction" (information
 *   model, section 2.2.2.2; reading 92), so each response posts and decodes under its own entry
 *   name alone;
 * - The solution is each declared correct response, NULL for `NOTE`, which declares none. The scores
 *   are the QTI database's.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { decode, entryName, partition } from "#plate/form/encoding.ts";
import type { Entry } from "#plate/form/encoding.ts";
import type { Responses, Value } from "#plate/model/values.ts";
import { postings } from "#plate/postings.ts";
import type { Posting } from "#plate/postings.ts";
import { solution } from "#plate/solution.ts";
import { feedbackHidden } from "#plate/test/page.ts";
import { fixturesDirectory } from "#plate/test/scratch.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The instance token every posting here is named for.
 */
const instance = "q1";

/**
 * What the candidate types in the note, the one response the processing never reads.
 */
const note = "The trip was short, and the food was good.";

/**
 * The item's four responses in document order: each one's base type, and the text a candidate who
 * answers it rightly posts.
 */
const parts = [
  { baseType: "identifier", posted: "B", response: "COLOUR" },
  { baseType: "string", posted: "Lisbon", response: "CITY" },
  { baseType: "identifier", posted: "PAST", response: "TENSE" },
  { baseType: "string", posted: note, response: "NOTE" },
] as const;

/**
 * The identifier of one of the item's responses.
 */
type Part = (typeof parts)[number]["response"];

/**
 * Construct the value of a single response that holds one text.
 *
 * @param baseType The response's base type.
 * @param text The text, a choice's identifier or what was typed.
 * @returns The value.
 */
const given = (baseType: "identifier" | "string", text: string): Value => ({
  baseType,
  cardinality: "single",
  values: [{ baseType, value: text }],
});

/**
 * Construct the NULL value of a single response.
 *
 * @param baseType The response's base type.
 * @returns The value, which holds nothing.
 */
const absent = (baseType: "identifier" | "string"): Value => ({
  baseType,
  cardinality: "single",
  values: [],
});

/**
 * The responses that answer every scored part rightly and fill the note.
 */
const allRight: Readonly<Record<Part, Value>> = {
  CITY: given("string", "Lisbon"),
  COLOUR: given("identifier", "B"),
  NOTE: given("string", note),
  TENSE: given("identifier", "PAST"),
};

/**
 * Open the composite fixture, failing the test when `admitted` does not accept it.
 *
 * @returns The verdict and the accepted item.
 */
const opened = Effect.fnUntraced(function* opened() {
  const bytes = yield* Effect.promise(() =>
    readFile(path.join(fixturesDirectory, "m3e", "items", "composite.xml")),
  );
  const verdict = yield* admitted("items/composite.xml", bytes);
  const accepted = Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`the composite item is ${verdict.verdict}, not accepted`),
  );

  return { accepted, verdict: verdict.verdict };
});

/**
 * Decode every response of the item from the entries a form posted, each through its own posting,
 * from the entries `partition` gives this instance.
 *
 * @param accepted The item.
 * @param entries The posted entries.
 * @returns Each response's value, by its identifier.
 */
const decodeAll = (accepted: Accepted, entries: readonly Entry[]): Responses => {
  const { own } = partition(entries, instance);

  return Object.fromEntries(
    postings(accepted, instance, feedbackHidden).map(({ binding, identifier, options }) => [
      identifier,
      Result.getOrElse(decode(own, binding, options), (malformed) =>
        assert.fail(`${identifier} does not decode: ${malformed.reason}`),
      ),
    ]),
  );
};

describe("a composite item: four interactions of four kinds, each bound to its own response", () => {
  it.effect("opens accepted, every part supported", () =>
    Effect.gen(function* opens() {
      assert.strictEqual((yield* opened()).verdict, "accepted");
    }),
  );

  it.effect(
    "posts each response once, under its own entry name, with its declared base type, and decodes each from its own entries alone",
    () =>
      Effect.gen(function* postsApart() {
        const { accepted } = yield* opened();

        assert.deepStrictEqual(
          postings(accepted, instance, feedbackHidden).map(({ binding, identifier }) => ({
            binding,
            identifier,
          })),
          parts.map(({ baseType, response }): Pick<Posting, "binding" | "identifier"> => ({
            binding: { baseType, cardinality: "single", name: entryName(instance, response) },
            identifier: response,
          })),
        );
        assert.deepStrictEqual(
          decodeAll(
            accepted,
            parts.map(({ posted, response }): Entry => [entryName(instance, response), posted]),
          ),
          allRight,
        );
        for (const { baseType, posted, response } of parts) {
          assert.deepStrictEqual(
            decodeAll(accepted, [[entryName(instance, response), posted]]),
            Object.fromEntries(
              parts.map((other) => [
                other.response,
                other.response === response ? given(baseType, posted) : absent(other.baseType),
              ]),
            ),
            `only ${response} is posted, so only ${response} is filled`,
          );
        }
      }),
  );

  it.effect("solves each scored response with its correct value, and NOTE with NULL", () =>
    Effect.gen(function* solves() {
      const { accepted } = yield* opened();

      assert.deepStrictEqual(solution(accepted, { correct: {} }), {
        CITY: given("string", "Lisbon"),
        COLOUR: given("identifier", "B"),
        NOTE: absent("string"),
        TENSE: given("identifier", "PAST"),
      });
    }),
  );
});
