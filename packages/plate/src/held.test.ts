/**
 * The host's contract over what an item holds (`#plate/held.ts`), against QTI's End Attempt rule
 * and the owner's rulings on unread text (2026-11-23): every case a state and the post the rule
 * names for it, written from the rule.
 *
 * - **End Attempt.** QTI 3.0.1 information model §5.45: "If the candidate invokes response processing
 *   using an endAttemptInteraction then the associated response variable is set to 'true'. If
 *   response processing is invoked in any other way ... then the associated response variable is
 *   set to 'false'." The answer holds the pressed End Attempt `true` and every other `false`; a
 *   press naming no End Attempt the state holds is a defect.
 * - **Unread text.** "A save never refuses": a save posts every response, an unread one NULL.
 *   "Answer, submit and skip are gated in the host": an answer while any box is unread is refused,
 *   naming each unread response.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option, Result } from "effect";
import { answerOf, endedOf, heldOf, sameResponses, savedOf } from "#plate/held.ts";
import type { Held } from "#plate/held.ts";
import { endedName } from "#plate/instance.ts";
import type { Responses, Value } from "#plate/model/values.ts";

/**
 * The instance the page renders the item under.
 */
const instance = "sitting-42.1";

/**
 * Construct a single boolean.
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
 * An attempt's start: two End Attempts, a hint and a clue, and a whole-number box.
 */
const start: Responses = {
  CLUE: boolean(false),
  HINT: boolean(false),
  NUMBER: { baseType: "integer", cardinality: "single", values: [] },
};

/**
 * The state after the child typed a number that reads, `05`.
 */
const typed: Held = {
  responses: {
    ...start,
    NUMBER: {
      baseType: "integer",
      cardinality: "single",
      values: [{ baseType: "integer", value: 5n }],
    },
  },
  typed: { NUMBER: { texts: ["05"], unread: false } },
};

/**
 * The state after the child typed `abc` in the whole-number box, which no integer reads.
 */
const unread: Held = { responses: start, typed: { NUMBER: { texts: ["abc"], unread: true } } };

/**
 * Construct a host's form's entries.
 *
 * @param entries Each entry's name and text.
 * @returns The form.
 */
const formOf = (...entries: readonly (readonly [string, string])[]): FormData => {
  const form = new FormData();
  for (const [name, text] of entries) {
    form.append(name, text);
  }

  return form;
};

describe("answerOf", () => {
  it("answers the state as it holds it when no End Attempt ended the attempt, every End Attempt false", () => {
    assert.deepStrictEqual(
      Result.getSuccess(answerOf(typed, Option.none())),
      Option.some(typed.responses),
    );
  });

  it("answers the End Attempt whose press ended the attempt true, and the other false", () => {
    assert.deepStrictEqual(
      Result.getSuccess(answerOf(typed, Option.some("HINT"))),
      Option.some({ ...typed.responses, HINT: boolean(true) }),
    );
  });

  it("refuses an answer while a box is unread, naming it, whatever ended the attempt", () => {
    for (const ended of [Option.none(), Option.some("HINT")]) {
      assert.deepStrictEqual(
        Option.map(Result.getFailure(answerOf(unread, ended)), (failure) => [...failure.responses]),
        Option.some(["NUMBER"]),
      );
    }
  });

  it("dies on a press that names no End Attempt the state holds", () => {
    for (const named of ["NUMBER", "ABSENT"]) {
      assert.throws(
        () => {
          answerOf(typed, Option.some(named));
        },
        /holds no End Attempt response/u,
        named,
      );
    }
  });
});

describe("savedOf", () => {
  it("saves every response, an unread box's NULL, and never refuses", () => {
    assert.deepStrictEqual(savedOf(unread), start);
    assert.deepStrictEqual(savedOf(typed), typed.responses);
  });
});

describe("endedOf", () => {
  it("reads the End Attempt the form's submitter posted, and none from a form another control submitted", () => {
    assert.deepStrictEqual(
      endedOf(formOf(["csrf", "x"], [endedName(instance), "HINT"]), instance),
      Option.some("HINT"),
    );
    assert.deepStrictEqual(endedOf(formOf(["csrf", "x"]), instance), Option.none());
    assert.deepStrictEqual(
      endedOf(formOf([endedName("sitting-42.2"), "HINT"]), instance),
      Option.none(),
    );
  });
});

describe("heldOf and sameResponses", () => {
  it("starts from the responses given with no box typed into, and tells a changed response from the start", () => {
    assert.deepStrictEqual(heldOf(start), { responses: start, typed: {} });
    assert.isTrue(sameResponses(start, { ...start }));
    assert.isFalse(sameResponses(start, typed.responses));
    assert.isFalse(sameResponses(start, { HINT: boolean(false) }));
  });
});
