import { assert, describe, it } from "@effect/vitest";
import type { Expression, ItemFilter, StaticType } from "#processing/ir.ts";
import { testLevelOperators } from "#processing/operators/test-level.ts";
import type { MemberOutcome, MemberResponse, MemberState } from "#processing/run.ts";
import { element, nodeOf, testContext, testRun } from "#processing/test/run.ts";
import { container, isText, nullOf, single, textValue } from "#processing/value.ts";
import type { Text, Value } from "#processing/value.ts";

/**
 * A text the tests know is not empty.
 *
 * @param written - The text.
 * @returns It, as a Text.
 */
const text = (written: string): Text => (isText(written) ? written : assert.fail("empty text"));

/**
 * A single identifier.
 *
 * @param letter - The identifier.
 * @returns The value.
 */
const identifier = (letter: string): Value => single("identifier", text(letter));

/**
 * The single identifier NULL: no value, no correct response, the default.
 */
const noIdentifier: Value = nullOf({ base: "identifier", cardinality: "single" });

/**
 * A response whose default is NULL.
 *
 * @param value - Its value.
 * @param correct - Its correct response.
 * @returns The response.
 */
const response = (value: Value, correct: Value): MemberResponse => ({
  correct,
  default: noIdentifier,
  identifier: "RESPONSE",
  value,
});

/**
 * A declared bound, or none.
 */
type Bound = number | "none";

/**
 * A bound as the session holds it.
 *
 * @param bound - The bound, or none.
 * @returns It, or `undefined` for none.
 */
const declared = (bound: Bound): number | undefined => (bound === "none" ? undefined : bound);

/**
 * The float outcome SCORE with its declared bounds.
 *
 * @param value - Its value.
 * @param minimum - Its normal-minimum.
 * @param maximum - Its normal-maximum.
 * @returns The outcome.
 */
const score = (value: Value, minimum: Bound, maximum: Bound): MemberOutcome => ({
  identifier: "SCORE",
  normalMaximum: declared(maximum),
  normalMinimum: declared(minimum),
  value,
});

/**
 * An item session.
 *
 * @param ref - The item ref.
 * @param state - What differs from a selected item attempted once with no response or outcome.
 * @returns The session.
 */
const member = (
  ref: string,
  state: Partial<
    Pick<MemberState, "numAttempts" | "outcomes" | "responses" | "selected" | "weights">
  >,
): MemberState => ({
  categories: [],
  completionStatus: textValue("identifier", "completed"),
  duration: 0,
  identifier: ref,
  numAttempts: state.numAttempts ?? 1n,
  occurrence: 1n,
  outcomes: state.outcomes ?? [],
  presented: true,
  responses: state.responses ?? [],
  sections: [],
  selected: state.selected ?? true,
  weights: state.weights ?? new Map(),
});

/**
 * The sessions the counts are held over.
 */
const sessions: readonly MemberState[] = [
  member("right", { responses: [response(identifier("A"), identifier("A"))] }),
  member("wrong", { responses: [response(identifier("B"), identifier("A"))] }),
  member("wrongUnattempted", {
    numAttempts: 0n,
    responses: [response(identifier("B"), identifier("A"))],
  }),
  member("noResponses", {}),
  member("noCorrect", { responses: [response(identifier("A"), noIdentifier)] }),
  member("unselected", { numAttempts: 0n, selected: false }),
];

const filter: ItemFilter = { excludeCategories: [], includeCategories: [], section: undefined };

const integerType: StaticType = { kind: "typed", type: { base: "integer", cardinality: "single" } };

const floatsType: StaticType = { kind: "typed", type: { base: "float", cardinality: "multiple" } };

/**
 * An expression's value over item sessions.
 *
 * @param members - The sessions.
 * @param expression - The expression.
 * @returns Its value.
 */
const over = (members: readonly MemberState[], expression: Expression): Value =>
  testRun(testLevelOperators, {}, { members }).run.evaluate(expression);

/**
 * A count over the stated sessions.
 *
 * @param kind - The count.
 * @returns Its integer.
 */
const counted = (
  kind:
    | "number-correct"
    | "number-incorrect"
    | "number-presented"
    | "number-responded"
    | "number-selected",
): Value => over(sessions, nodeOf(kind, [], { filter }, integerType));

/**
 * Two items' SCORE bounds, the first with a weight W of 2.
 */
const bounded: readonly MemberState[] = [
  member("one", { outcomes: [score(single("float", 1), 0, 2)], weights: new Map([["W", 2]]) }),
  member("two", { outcomes: [score(single("float", 1), -1, 4)] }),
];

/**
 * An outcome bound's value.
 *
 * @param members - The sessions.
 * @param kind - The bound.
 * @param weight - The weight named, or none.
 * @returns Its value.
 */
const bounds = (
  members: readonly MemberState[],
  kind: "outcome-maximum" | "outcome-minimum",
  weight: "none" | "W",
): Value =>
  over(
    members,
    nodeOf(
      kind,
      [],
      { filter, outcome: "SCORE", weight: weight === "none" ? undefined : weight },
      floatsType,
    ),
  );

/**
 * An item whose SCORE is a value, with weights.
 *
 * @param value - The value.
 * @param weights - The item ref's weights.
 * @returns The session.
 */
const scored = (value: Value, weights: ReadonlyMap<string, number>): MemberState =>
  member("item", { outcomes: [score(value, "none", "none")], weights });

/**
 * Integer scores, one weighted, one NULL and one a container.
 */
const integers: readonly MemberState[] = [
  scored(single("integer", 2n), new Map([["W", 0.5]])),
  scored(single("integer", 3n), new Map()),
  scored(nullOf({ base: "integer", cardinality: "single" }), new Map()),
  scored(container("multiple", "integer", [9n]), new Map()),
];

/**
 * A `qti-test-variables`'s value over SCORE.
 *
 * @param members - The sessions.
 * @param attributes - Its written base type and weight.
 * @returns Its value.
 */
const variables = (
  members: readonly MemberState[],
  attributes: {
    readonly base: "float" | "identifier" | "none";
    readonly weight: "none" | "W";
  },
): Value =>
  over(
    members,
    nodeOf(
      "test-variables",
      [],
      {
        base: attributes.base === "none" ? undefined : attributes.base,
        filter,
        variable: "SCORE",
        weight: attributes.weight === "none" ? undefined : attributes.weight,
      },
      { kind: "dynamic" },
    ),
  );

describe("the counts (§2.11.2.1–5)", () => {
  it("judges only items whose every declared response has a correct response, and counts the incorrect only where attempted (reading `null-results`, item 5)", () => {
    assert.deepStrictEqual(counted("number-correct"), single("integer", 1n));
    assert.deepStrictEqual(counted("number-incorrect"), single("integer", 1n));
  });

  it("counts the attempted, the responded and the selected", () => {
    assert.deepStrictEqual(counted("number-presented"), single("integer", 4n));
    assert.deepStrictEqual(counted("number-responded"), single("integer", 3n));
    assert.deepStrictEqual(counted("number-selected"), single("integer", 5n));
  });
});

describe("the outcome bounds (§2.11.2.6, §2.11.2.7)", () => {
  it("gives each item's declared bound, weighted where a weight is named, 1.0 where an item has none (section 7.47.2)", () => {
    assert.deepStrictEqual(
      bounds(bounded, "outcome-minimum", "none"),
      container("multiple", "float", [0, -1]),
    );
    assert.deepStrictEqual(
      bounds(bounded, "outcome-maximum", "W"),
      container("multiple", "float", [4, 4]),
    );
  });

  it("ignores an item with no declared minimum, and is NULL for a maximum where any item declares none (reading `null-results`, item 6)", () => {
    const partial = [...bounded, scored(single("float", 1), new Map())];

    assert.deepStrictEqual(
      bounds(partial, "outcome-minimum", "none"),
      container("multiple", "float", [0, -1]),
    );
    assert.deepStrictEqual(
      bounds(partial, "outcome-maximum", "none"),
      nullOf({ base: "float", cardinality: "multiple" }),
    );
  });
});

describe("test-variables (§2.11.2.8, reading `weighted-test-variables`)", () => {
  it("keeps each item's single non-NULL value, integers as integers where none is a float and none is weighted", () => {
    assert.deepStrictEqual(
      variables(integers, { base: "none", weight: "none" }),
      container("multiple", "integer", [2n, 3n]),
    );
    assert.deepStrictEqual(
      variables([...integers, scored(single("float", 0.5), new Map())], {
        base: "none",
        weight: "none",
      }),
      container("multiple", "float", [2, 3, 0.5]),
    );
  });

  it("weights every number as a float, 1.0 where an item has no such weight (section 7.47.2)", () => {
    assert.deepStrictEqual(
      variables(integers, { base: "none", weight: "W" }),
      container("multiple", "float", [1, 3]),
    );
  });

  it("matches only the written base type, which becomes the result's", () => {
    const mixed = [scored(identifier("A"), new Map()), scored(single("integer", 1n), new Map())];

    assert.deepStrictEqual(
      variables(mixed, { base: "identifier", weight: "none" }),
      container("multiple", "identifier", [text("A")]),
    );
  });

  it("is read in a test alone, and refuses a weight on a base type other than float (reading `weighted-test-variables`)", () => {
    const inTest = { ...testContext({ declared: {} }), document: "test" } as const;
    const inItem = testContext({ declared: {} });

    assert.isFalse(
      testLevelOperators["test-variables"].read(
        element("qti-test-variables", { "variable-identifier": "SCORE" }, []),
        inItem,
        0,
      ).ok,
    );
    assert.isFalse(
      testLevelOperators["test-variables"].read(
        element(
          "qti-test-variables",
          { "base-type": "integer", "variable-identifier": "SCORE", "weight-identifier": "W" },
          [],
        ),
        inTest,
        0,
      ).ok,
    );
    assert.deepStrictEqual(
      testLevelOperators["number-correct"].read(
        element(
          "qti-number-correct",
          { "include-category": "a  b", "section-identifier": "S" },
          [],
        ),
        inTest,
        0,
      ),
      {
        ok: true,
        value: { filter: { excludeCategories: [], includeCategories: ["a", "b"], section: "S" } },
      },
    );
  });
});
