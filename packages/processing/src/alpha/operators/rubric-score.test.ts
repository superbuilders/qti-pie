/**
 * Rubric-score's reply rule, the ruling of 2026-11-26 its oracle: a reply within [0, maximum] is
 * the recorded value, its feedback kept where the grader wrote any; a decline, a score outside the
 * range (never clamped) or not finite, is no input at all, so its demand stays open.
 */
import { assert, describe, it } from "@effect/vitest";
import { rubricReply } from "#processing/alpha/operators/rubric-score.ts";
import { everyMember } from "#processing/test/exhausted.ts";
import { single } from "#processing/value.ts";

/**
 * The most a reply may score, as the operator's `maximum` operand states it.
 */
const maximum = 4;

/**
 * The ruling the reply rule is checked against.
 */
const ruling =
  "Bjorn's ruling of 2026-11-26 (a decline is no verdict) and grading-classification.md's X-01";

describe("rubric-score's reply", () => {
  it.effect(
    "records every score within [0, maximum] with its feedback, the feedback only where written",
    (ctx) =>
      everyMember(
        ctx,
        {
          box: "the range's ends, inner halves and wholes, each with no feedback and with some",
          members: [
            { feedback: "", score: 0 },
            { feedback: "Clear thesis.", score: 0 },
            { feedback: "", score: 0.5 },
            { feedback: "Clear thesis.", score: 0.5 },
            { feedback: "", score: 2.5 },
            { feedback: "Clear thesis.", score: 3 },
            { feedback: "", score: maximum },
            { feedback: "Clear thesis.", score: maximum },
          ],
          oracle: ruling,
          suite: "processing/alpha/rubric-reply-in-range",
        },
        ({ feedback, score }) => {
          const reply = rubricReply(score, maximum, feedback);
          assert.deepStrictEqual(
            reply?.fields.map((field) => field.name),
            feedback === "" ? ["score"] : ["feedback", "score"],
          );
          assert.deepStrictEqual(reply?.fields.at(-1)?.value, single("float", score));
        },
      ),
  );

  it.effect(
    "records no input for a score outside the range or not finite, which a decline is",
    (ctx) =>
      everyMember(
        ctx,
        {
          box: "below 0, above the maximum, and the three non-finite doubles",
          members: [
            -0.5,
            -Number.MIN_VALUE,
            maximum + 0.5,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
          ],
          oracle: ruling,
          suite: "processing/alpha/rubric-reply-declined",
        },
        (score) => {
          assert.isUndefined(rubricReply(score, maximum, "feedback"));
        },
      ),
  );
});
