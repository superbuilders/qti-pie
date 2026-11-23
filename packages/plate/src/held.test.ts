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
import { answerOf, endedOf, heldOf, sameResponse, sameResponses, savedOf } from "#plate/held.ts";
import type { Held } from "#plate/held.ts";
import { endedName } from "#plate/instance.ts";
import { nullOf } from "#plate/model/values.ts";
import type { RecordField, RecordValue, Responses, Single, Value } from "#plate/model/values.ts";

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

/**
 * Construct a value for a test.
 *
 * @param baseType The value's base type.
 * @param cardinality The value's cardinality.
 * @param values Its values.
 * @returns The value.
 */
const valueOf = (
  baseType: Value["baseType"],
  cardinality: Value["cardinality"],
  values: readonly Single[],
): Value => ({ baseType, cardinality, values });

/**
 * Construct identifier singles.
 *
 * @param names The identifiers, in order.
 * @returns One single for each.
 */
const identifiers = (...names: readonly string[]): readonly Single[] =>
  names.map((name) => ({ baseType: "identifier", value: name }));

/**
 * Construct a single pair or directed pair value.
 *
 * @param baseType `pair` or `directedPair`.
 * @param source The first identifier.
 * @param destination The second.
 * @returns The value.
 */
const pairOf = (baseType: "pair" | "directedPair", source: string, destination: string): Value =>
  valueOf(baseType, "single", [{ baseType, value: [source, destination] }]);

/**
 * Construct a record.
 *
 * @param fields Its fields, in order.
 * @returns The record.
 */
const recordOf = (...fields: readonly RecordField[]): RecordValue => ({
  cardinality: "record",
  fields,
});

/**
 * Construct a record field.
 *
 * @param identifier The field's identifier.
 * @param single Its value.
 * @returns The field.
 */
const field = (identifier: string, single: Single): RecordField => ({ identifier, value: single });

/**
 * Construct a single point value.
 *
 * @param x Its horizontal coordinate.
 * @param y Its vertical coordinate.
 * @returns The value.
 */
const point = (x: bigint, y: bigint): Value =>
  valueOf("point", "single", [{ baseType: "point", value: [x, y] }]);

describe("sameResponse", () => {
  // Oracle: QTI 3.0.1's values (information model, BaseTypeEnum and Cardinality): a `multiple` is an
  // unordered bag, repeats counted; an `ordered` a sequence; a `pair` unordered and a `directedPair`
  // ordered; a record's fields named, in no order; and NULL is no value at any cardinality.
  it("holds a multiple the same as a bag and an ordered as a sequence", () => {
    const abb = identifiers("A", "B", "B");
    const bab = identifiers("B", "A", "B");

    assert.isTrue(
      sameResponse(valueOf("identifier", "multiple", abb), valueOf("identifier", "multiple", bab)),
    );
    assert.isFalse(
      sameResponse(valueOf("identifier", "ordered", abb), valueOf("identifier", "ordered", bab)),
    );
    assert.isTrue(
      sameResponse(valueOf("identifier", "ordered", abb), valueOf("identifier", "ordered", abb)),
    );
    assert.isFalse(
      sameResponse(
        valueOf("identifier", "multiple", abb),
        valueOf("identifier", "multiple", identifiers("A", "A", "B")),
      ),
    );
  });

  it("holds a pair the same in either order, a directed pair only in order, a point only at both coordinates", () => {
    assert.isTrue(sameResponse(pairOf("pair", "A", "B"), pairOf("pair", "B", "A")));
    assert.isFalse(
      sameResponse(pairOf("directedPair", "A", "B"), pairOf("directedPair", "B", "A")),
    );
    assert.isTrue(sameResponse(pairOf("directedPair", "A", "B"), pairOf("directedPair", "A", "B")));
    assert.isTrue(sameResponse(point(102n, 113n), point(102n, 113n)));
    assert.isFalse(sameResponse(point(102n, 113n), point(113n, 102n)));
    assert.isFalse(sameResponse(point(102n, 113n), point(102n, 114n)));
  });

  it("holds NULL the same as NULL alone", () => {
    const a = valueOf("identifier", "single", identifiers("A"));

    assert.isTrue(sameResponse(nullOf("identifier", "single"), nullOf("identifier", "single")));
    assert.isFalse(sameResponse(a, nullOf("identifier", "single")));
    assert.isFalse(sameResponse(nullOf("identifier", "single"), a));
    assert.isTrue(sameResponse(recordOf(), recordOf()));
  });

  it("holds numbers the same by value and strings by code point, within one base type and cardinality", () => {
    const integer = (whole: bigint): Value =>
      valueOf("integer", "single", [{ baseType: "integer", value: whole }]);
    const float = (number: number): Value =>
      valueOf("float", "single", [{ baseType: "float", value: number }]);
    const string = (text: string): Value =>
      valueOf("string", "single", [{ baseType: "string", value: text }]);

    assert.isTrue(sameResponse(integer(1n), integer(1n)));
    assert.isTrue(sameResponse(float(0), float(-0)));
    assert.isFalse(sameResponse(float(Number.NaN), float(Number.NaN)));
    assert.isFalse(sameResponse(integer(1n), float(1)));
    assert.isFalse(sameResponse(string("a"), string("A")));
    assert.isFalse(
      sameResponse(
        valueOf("identifier", "single", identifiers("A")),
        valueOf("identifier", "multiple", identifiers("A")),
      ),
    );
  });

  it("holds a record the same by its fields in any order, and never a record the same as a value", () => {
    const stringValue = field("stringValue", { baseType: "string", value: "1.5" });
    const floatValue = field("floatValue", { baseType: "float", value: 1.5 });

    assert.isTrue(
      sameResponse(recordOf(stringValue, floatValue), recordOf(floatValue, stringValue)),
    );
    assert.isTrue(
      sameResponse(
        recordOf(field("pair", { baseType: "pair", value: ["A", "B"] })),
        recordOf(field("pair", { baseType: "pair", value: ["B", "A"] })),
      ),
    );
    assert.isFalse(
      sameResponse(
        recordOf(field("integerValue", { baseType: "integer", value: 2n })),
        recordOf(field("integerValue", { baseType: "float", value: 2 })),
      ),
    );
    assert.isFalse(sameResponse(recordOf(stringValue, floatValue), recordOf(stringValue)));
    assert.isFalse(sameResponse(recordOf(stringValue), recordOf(stringValue, floatValue)));
    assert.isFalse(
      sameResponse(
        recordOf(stringValue),
        recordOf(field("stringValue", { baseType: "string", value: "1.50" })),
      ),
    );
    assert.isFalse(sameResponse(recordOf(stringValue), recordOf(floatValue)));
    assert.isFalse(sameResponse(recordOf(), recordOf(stringValue)));
    assert.isFalse(
      sameResponse(
        recordOf(stringValue),
        valueOf("string", "single", [{ baseType: "string", value: "1.5" }]),
      ),
    );
  });
});
