/**
 * A composite item, `fixtures/m3e/items/composite.xml` (upstream #129): one body holding a Choice,
 * a Text Entry, an Inline Choice and an Extended Text, each bound to a single response of its own,
 * whose response processing adds 1 to `SCORE` for each of the first three that matches its correct
 * response and never reads the fourth, `NOTE`. Each case is held to the item's own declarations
 * and processing:
 *
 * - "Each response variable declared may be bound to one and only one interaction" (information
 *   model, section 2.2.2.2; reading 92), so each response starts on its own, at its own declared
 *   base type, and an attempt's start names each once;
 * - The solution is each declared correct response, NULL for `NOTE`, which declares none. The scores
 *   are the QTI database's.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { Value } from "#plate/model/values.ts";
import { solution } from "#plate/solution.ts";
import { shownResponses, startingResponses } from "#plate/starting.ts";
import { feedbackHidden } from "#plate/test/page.ts";
import { fixturesDirectory } from "#plate/test/scratch.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";

/**
 * The item's four responses in document order, each with its base type.
 */
const parts = [
  { baseType: "identifier", response: "COLOUR" },
  { baseType: "string", response: "CITY" },
  { baseType: "identifier", response: "TENSE" },
  { baseType: "string", response: "NOTE" },
] as const;

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

describe("a composite item: four interactions of four kinds, each bound to its own response", () => {
  it.effect("opens accepted, every part supported", () =>
    Effect.gen(function* opens() {
      assert.strictEqual((yield* opened()).verdict, "accepted");
    }),
  );

  it.effect(
    "shows each response once, in document order, and starts each at NULL of its own declared base type",
    () =>
      Effect.gen(function* startsApart() {
        const { accepted } = yield* opened();

        assert.deepStrictEqual(
          shownResponses(accepted, feedbackHidden),
          parts.map(({ response }) => response),
        );
        assert.deepStrictEqual(
          startingResponses(accepted, feedbackHidden),
          Object.fromEntries(parts.map(({ baseType, response }) => [response, absent(baseType)])),
        );
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
