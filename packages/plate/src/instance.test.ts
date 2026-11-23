/**
 * An item instance's token (`checkInstance` beside this file), against the requirements HTML's ids,
 * IDREFS and form field names put on it, read from the HTML standard and React's `useId` forms.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { checkInstance } from "#plate/instance.ts";

/**
 * A host's dotted key for an item's use, as a sitting names its items.
 */
const instance = "MANIFEST-1.tests.t.xml.1.1";

describe("checkInstance", () => {
  it("refuses an empty token first", () => {
    assert.deepStrictEqual(checkInstance(""), Option.some({ requirement: "non-empty" }));
  });

  it("refuses a character outside ASCII letters, digits, _, ., : and -, naming the first", () => {
    for (const [token, character] of [
      ["a b", " "],
      ["«r1»", "«"],
      ["q1/2", "/"],
      ["é", "é"],
    ] as const) {
      assert.deepStrictEqual(
        checkInstance(token),
        Option.some({ character, requirement: "characters" }),
        token,
      );
    }
  });

  it("refuses a trailing - and a --, which would let a chrome id meet an authored id", () => {
    for (const [token, at] of [
      ["ab-", "end"],
      ["a--b", "double"],
      ["-", "end"],
      ["--", "end"],
    ] as const) {
      assert.deepStrictEqual(
        checkInstance(token),
        Option.some({ at, requirement: "id-boundary" }),
        token,
      );
    }
  });

  it("admits React's useId forms, a host's dotted key and a plain token", () => {
    for (const token of ["_r_1_", ":r1:", "q1", "a.b", instance]) {
      assert.deepStrictEqual(checkInstance(token), Option.none(), token);
    }
  });
});
