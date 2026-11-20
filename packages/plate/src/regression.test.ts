/**
 * The items a downstream user reported on 2026-11-12 (upstream #464), a Match, a Gap Match and an
 * Order, each in a text form, in `fixtures/regress/reported-2026-11-12/`. Each item's own source is
 * the oracle: a text item opens accepted, and its correct response, the pairs or the order its
 * `qti-correct-response` writes, scores the full marks its response processing sets on a match
 * with the correct response: `SCORE` 1.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { Value } from "#plate/model/values.ts";
import { score } from "#plate/test/score.ts";
import { fixturesDirectory } from "#plate/test/scratch.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";

/**
 * The reported items' folder.
 */
const reported = path.join(fixturesDirectory, "regress", "reported-2026-11-12");

/**
 * Read one reported item and open it, under the location its images' relative `src` resolves
 * against.
 *
 * @param name The item's file name without `.xml`.
 * @returns The verdict.
 */
const opened = Effect.fnUntraced(function* opened(name: string) {
  const bytes = yield* Effect.promise(() => readFile(path.join(reported, "items", `${name}.xml`)));

  return yield* admitted(`items/${name}.xml`, bytes);
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
 * The three text items, each with its correct response as its `qti-correct-response` writes it.
 */
const textItems: readonly (readonly [string, Value])[] = [
  ["sample-alf-match-text", pairs("s1 t1", "s2 t2", "s3 t3", "s4 t4")],
  ["sample-alf-gap-match-text", pairs("w1 g1", "w2 g2", "w3 g3")],
  ["sample-alf-order-text", ordered("o1", "o2", "o3", "o4")],
];

describe("the items reported on 2026-11-12", () => {
  it.effect("each text item opens accepted, and its correct response scores 1", () =>
    Effect.gen(function* textItemsScore() {
      for (const [name, correct] of textItems) {
        const verdict = yield* opened(name);
        const accepted = Option.getOrElse(acceptedItem(verdict), () =>
          assert.fail(`${name} is ${verdict.verdict}`),
        );
        const record = yield* Effect.fromResult(score(accepted, { RESPONSE: correct }));

        assert.strictEqual(verdict.verdict, "accepted", name);
        assert.deepStrictEqual(
          record.outcomes["SCORE"]?.values.map((single) => single.value),
          [1],
          name,
        );
      }
    }),
  );
});
