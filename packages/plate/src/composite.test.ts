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
 * - Each interaction's limits judge its own response alone: the Choice's `min-choices` 1 refuses it
 *   empty under `validateResponses`, and the other three have no limit to break;
 * - The scores are the processing's sums, 3, 2 and 0, and the solution is each declared correct
 *   response, NULL for `NOTE`, which declares none.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { configure } from "#plate/configuration.ts";
import { decode, entryName, partition } from "#plate/form/encoding.ts";
import type { Entry } from "#plate/form/encoding.ts";
import type { Responses, Value } from "#plate/model/values.ts";
import { postings } from "#plate/postings.ts";
import type { Posting } from "#plate/postings.ts";
import { checkResponses } from "#plate/responses.ts";
import { solution } from "#plate/solution.ts";
import { score } from "#plate/test/score.ts";
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
 * The responses that answer every scored part wrongly and fill the note.
 */
const allWrong: Readonly<Record<Part, Value>> = {
  CITY: given("string", "Porto"),
  COLOUR: given("identifier", "A"),
  NOTE: given("string", note),
  TENSE: given("identifier", "PRESENT"),
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
    postings(accepted, instance).map(({ binding, identifier, options }) => [
      identifier,
      Result.getOrElse(decode(own, binding, options), (malformed) =>
        assert.fail(`${identifier} does not decode: ${malformed.reason}`),
      ),
    ]),
  );
};

/**
 * Score one attempt and give its `SCORE` and `MAXSCORE`.
 *
 * @param accepted The item.
 * @param responses The candidate's responses.
 * @returns Each outcome's values.
 */
const outcomesAfter = (
  accepted: Accepted,
  responses: Responses,
): Readonly<Record<"MAXSCORE" | "SCORE", readonly unknown[]>> => {
  const stored = Result.getOrElse(score(accepted, responses), (failure) =>
    assert.fail(`score refused the responses: ${failure._tag}`),
  );

  return {
    MAXSCORE: stored.outcomes["MAXSCORE"]?.values.map((single) => single.value) ?? [],
    SCORE: stored.outcomes["SCORE"]?.values.map((single) => single.value) ?? [],
  };
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
          postings(accepted, instance).map(({ binding, identifier }) => ({ binding, identifier })),
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

  it.effect("judges each interaction's response alone", () =>
    Effect.gen(function* judgedApart() {
      const { accepted } = yield* opened();
      const configuration = yield* configure({ seed: "", validateResponses: true });
      const emptyColour = checkResponses(
        accepted,
        { ...allRight, COLOUR: absent("identifier") },
        configuration,
      );

      assert.isNotEmpty(emptyColour, "an empty Choice of min-choices 1 is refused");
      assert.deepStrictEqual([...new Set(emptyColour.map(({ response }) => response))], ["COLOUR"]);
      assert.deepStrictEqual(
        checkResponses(
          accepted,
          {
            CITY: absent("string"),
            COLOUR: given("identifier", "B"),
            NOTE: absent("string"),
            TENSE: absent("identifier"),
          },
          configuration,
        ),
        [],
        "an empty CITY, TENSE or NOTE has no limit to break",
      );
      assert.deepStrictEqual(checkResponses(accepted, allRight, configuration), []);
    }),
  );

  it.effect("scores 1 for each correct part: 3 for all, 2 with one wrong, 0 for none", () =>
    Effect.gen(function* scores() {
      const { accepted } = yield* opened();

      assert.deepStrictEqual(outcomesAfter(accepted, allRight), { MAXSCORE: [3], SCORE: [3] });
      for (const wrong of ["COLOUR", "CITY", "TENSE"] as const) {
        assert.deepStrictEqual(
          outcomesAfter(accepted, { ...allRight, [wrong]: allWrong[wrong] }).SCORE,
          [2],
          `${wrong} wrong`,
        );
      }

      assert.deepStrictEqual(outcomesAfter(accepted, allWrong).SCORE, [0]);
      assert.deepStrictEqual(
        outcomesAfter(accepted, { ...allRight, NOTE: absent("string") }).SCORE,
        [3],
        "the note's absence takes nothing from the sum",
      );
    }),
  );

  it.effect("solves each scored response with its correct value, and NOTE with NULL", () =>
    Effect.gen(function* solves() {
      const { accepted } = yield* opened();

      assert.deepStrictEqual(solution(accepted), {
        CITY: given("string", "Lisbon"),
        COLOUR: given("identifier", "B"),
        NOTE: absent("string"),
        TENSE: given("identifier", "PAST"),
      });
    }),
  );
});
