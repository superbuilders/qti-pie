/**
 * An item session's attempts as a host records them: the count `numAttempts` derives, a hint's
 * attempt left out; whether `itemSessionOpen` lets another attempt run, by the stage's limit or an
 * adaptive item's completion; and the record `recordAfter` rebuilds from `begin`'s and the attempts
 * `attemptOf` read, which scores the next attempt as the record `scoreRecord` returned does.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { attemptOf, itemSessionOpen, numAttempts, recordAfter } from "#plate/attempts.ts";
import type { ClockedAttempt } from "#plate/attempts.ts";
import { begin } from "#plate/begin.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import type { Responses, Value } from "#plate/model/values.ts";
import { scoreRecord } from "#plate/score.ts";
import { float, identifier, integer } from "#plate/test/fixtures.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The fixtures' root.
 */
const fixtures = path.resolve(import.meta.dirname, "..", "fixtures");

/**
 * Open a fixture item, which `check` must accept.
 *
 * @param location Its path under the fixtures' root.
 * @returns The accepted item.
 */
const opened = Effect.fnUntraced(function* opened(location: string) {
  const bytes = yield* Effect.promise(() => readFile(path.join(fixtures, location)));
  const verdict = yield* admitted(location, bytes);

  return Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${location} is ${verdict.verdict}, not accepted`),
  );
});

/**
 * A single boolean.
 *
 * @param value The boolean.
 * @returns The value.
 */
const boolean = (value: boolean): Value => ({
  baseType: "boolean",
  cardinality: "single",
  values: [{ baseType: "boolean", value }],
});

/**
 * A single string.
 *
 * @param value The string.
 * @returns The value.
 */
const text = (value: string): Value => ({
  baseType: "string",
  cardinality: "single",
  values: [{ baseType: "string", value }],
});

/**
 * Run an item session's attempts as a host does: each from the record `recordAfter` rebuilds from
 * `begin`'s and the attempts recorded so far, each recorded through `attemptOf` at the next tick of
 * a clock.
 *
 * @param accepted The item.
 * @param posts Each attempt's posted responses, in order.
 * @returns The record `begin` gave, each attempt recorded, and each record `scoreRecord` returned.
 */
const session = (accepted: Accepted, posts: readonly Responses[]) => {
  const begun = Result.getOrThrow(begin(accepted, { instance: "s1", seed: "7" }));
  const attempts: ClockedAttempt[] = [];
  const scored: ItemRecord[] = [];
  for (const posted of posts) {
    const after = Result.getOrThrow(
      scoreRecord(accepted, posted, recordAfter(accepted, begun, attempts)),
    );
    attempts.push({ ...attemptOf(after), at: BigInt(attempts.length + 1) });
    scored.push(after);
  }

  return { attempts, begun, scored };
};

describe("numAttempts and itemSessionOpen", () => {
  it.effect(
    "count every attempt but a hint's, as the record does, and close the session at the stage's limit",
    () =>
      Effect.gen(function* countsHints() {
        const accepted = yield* opened("ei/items/end-attempt.xml");
        const hint = { HINT: boolean(true), RESPONSE: identifier("tree") };
        const answer = { HINT: boolean(false), RESPONSE: identifier("tree") };
        const { attempts, scored } = session(accepted, [hint, answer, hint, answer]);

        assert.deepStrictEqual(
          scored.map((record) => record.numAttempts),
          [0, 1, 1, 2],
        );
        assert.deepStrictEqual(
          attempts.map((_, at) => numAttempts(accepted, attempts.slice(0, at + 1))),
          [0, 1, 1, 2],
        );
        assert.deepStrictEqual(
          [1, 2, 3].map((limit) => itemSessionOpen(accepted, attempts, limit)),
          [false, false, true],
        );
        assert.isTrue(itemSessionOpen(accepted, attempts.slice(0, 1), 1), "a hint leaves it open");
        assert.isTrue(itemSessionOpen(accepted, [], 1), "no attempt leaves it open");
        assert.strictEqual(
          numAttempts(accepted, attempts.toReversed()),
          2,
          "the count reads each attempt alone",
        );
      }),
  );

  it.effect("close an adaptive item once an attempt completes it, whatever the stage's limit", () =>
    Effect.gen(function* closesOnCompletion() {
      const accepted = yield* opened("m5/items/adaptive.xml");
      const { attempts, scored } = session(accepted, [
        { RESPONSE: text("Venus") },
        { RESPONSE: text("Mars") },
        { RESPONSE: text("Mercury") },
      ]);

      assert.deepStrictEqual(
        attempts.map((attempt) => attempt.completionStatus),
        ["incomplete", "incomplete", "completed"],
      );
      assert.deepStrictEqual(scored.at(-1)?.outcomes["TRIES"], integer(3n), "outcomes kept");
      assert.isTrue(itemSessionOpen(accepted, attempts.slice(0, 2), 1), "limit ignored");
      assert.isFalse(itemSessionOpen(accepted, attempts, 100));
    }),
  );
});

describe("recordAfter", () => {
  it.effect("gives begin's record before any attempt", () =>
    Effect.gen(function* beginsAtBegun() {
      const accepted = yield* opened("ei/items/end-attempt.xml");
      const begun = Result.getOrThrow(begin(accepted, { instance: "s1", seed: "7" }));

      assert.strictEqual(recordAfter(accepted, begun, []), begun);
    }),
  );

  it.effect(
    "rebuilds the record scoreRecord returned from begin's and the attempts, so the next attempt scores alike",
    () =>
      Effect.gen(function* rebuildsRecord() {
        const accepted = yield* opened("m5/items/adaptive.xml");
        const { attempts, begun, scored } = session(accepted, [
          { RESPONSE: text("Venus") },
          { RESPONSE: text("Mars") },
        ]);
        const rebuilt = recordAfter(accepted, begun, attempts);

        assert.deepStrictEqual(rebuilt, scored.at(-1));
        assert.deepStrictEqual(
          recordAfter(accepted, begun, attempts.toReversed()),
          rebuilt,
          "the latest attempt is the one of the greatest clock reading, in any order",
        );
        assert.deepStrictEqual(
          Result.getOrThrow(scoreRecord(accepted, { RESPONSE: text("Mercury") }, rebuilt)).outcomes[
            "SCORE"
          ],
          float(1),
        );
      }),
  );

  it.effect("reads an outcome or a response the attempt holds none of as NULL", () =>
    Effect.gen(function* fillsNull() {
      const accepted = yield* opened("ei/items/end-attempt.xml");
      const begun = Result.getOrThrow(begin(accepted, { instance: "s1", seed: "7" }));
      const rebuilt = recordAfter(accepted, begun, [
        { at: 1n, completionStatus: "unknown", outcomes: {}, responses: {} },
      ]);

      assert.deepStrictEqual(rebuilt.responses["RESPONSE"], {
        baseType: "identifier",
        cardinality: "single",
        values: [],
      });
      assert.deepStrictEqual(rebuilt.outcomes["SCORE"], {
        baseType: "float",
        cardinality: "single",
        values: [],
      });
      assert.deepStrictEqual(rebuilt.outcomes["completionStatus"], identifier("unknown"));
      assert.deepStrictEqual([rebuilt.attempt, rebuilt.numAttempts], ["submitted", 1]);
    }),
  );
});
