import { drawn, explore } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { bytes, int, map } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Formatter } from "effect";
import type { AttributesOf, Expression } from "#processing/ir.ts";
import { comparisonOperators } from "#processing/operators/comparison.ts";
import { singleBoolean } from "#processing/operators/operator.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import {
  element,
  literal,
  nodeOf,
  ownVariable,
  testContext,
  testRun,
} from "#processing/test/run.ts";
import { container, isText, nullOf, recordOf, single, valueTypeOf } from "#processing/value.ts";
import type { Text, Value, ValueType } from "#processing/value.ts";

const operators = Object.freeze({ ...comparisonOperators, ...valuesOperators });

/**
 * The work one case may do.
 */
const caseHang = Duration.seconds(30);

/**
 * How many rotating cases each search compares beside its witnesses.
 */
const CASES = 1000;

const booleanNull = nullOf({ base: "boolean", cardinality: "single" });

const { run } = testRun(
  operators,
  {
    missing: { value: nullOf({ base: "float", cardinality: "single" }) },
    tenth: { value: single("float", 0.1) },
    two: { value: single("integer", 2n) },
  },
  {},
);

/**
 * A single integer's literal.
 *
 * @param value - The integer.
 * @returns The `qti-base-value`.
 */
const integer = (value: bigint): Expression => literal(single("integer", value));

/**
 * A single float's literal.
 *
 * @param value - The float.
 * @returns The `qti-base-value`.
 */
const float = (value: number): Expression => literal(single("float", value));

/**
 * A single duration's literal.
 *
 * @param seconds - The duration.
 * @returns The `qti-base-value`.
 */
const duration = (seconds: number): Expression => literal(single("duration", seconds));

/**
 * A comparison's value.
 *
 * @param kind - The comparison.
 * @param left - The first operand.
 * @param right - The second operand.
 * @returns Its value.
 */
const compared = (
  kind: "duration-gte" | "duration-lt" | "gt" | "gte" | "lt" | "lte",
  left: Expression,
  right: Expression,
): Value => run.evaluate(nodeOf(kind, [left, right], {}, singleBoolean));

/**
 * An equal's value under a tolerance.
 *
 * @param attributes - The equal's attributes.
 * @param x - The first operand.
 * @param y - The second operand.
 * @returns Its value.
 */
const equalUnder = (attributes: AttributesOf["equal"], x: Expression, y: Expression): Value =>
  run.evaluate(nodeOf("equal", [x, y], attributes, singleBoolean));

/**
 * An absolute or relative tolerance of literal ends, both included.
 *
 * @param mode - The mode.
 * @param t0 - The lower reach.
 * @param t1 - The upper reach.
 * @returns The attributes.
 */
const tolerance = (
  mode: "absolute" | "relative",
  t0: number,
  t1: number,
): AttributesOf["equal"] => ({
  includeLowerBound: true,
  includeUpperBound: true,
  tolerance: [
    { kind: "literal", value: t0 },
    { kind: "literal", value: t1 },
  ],
  toleranceMode: mode,
});

/**
 * An integer of up to 80 bits, either sign: integers past 2^53 among them.
 */
const anyInteger: Gen<bigint> = map(bytes({ max: 10, min: 1 }), (octets) => {
  let magnitude = 0n;
  for (const octet of octets) {
    magnitude = magnitude * 256n + BigInt(octet);
  }

  return (octets[0] ?? 0) % 2 === 0 ? magnitude : -magnitude;
});

/**
 * A count of sixteenths, a double exactly.
 *
 * @param count - The count.
 * @returns The double.
 */
const sixteenth = (count: number): number => count / 16;

/**
 * An absolute tolerance whose lower reach names a variable and whose upper is 0.5.
 *
 * @param identifier - The variable.
 * @returns The attributes.
 */
const named = (identifier: string): AttributesOf["equal"] => ({
  includeLowerBound: true,
  includeUpperBound: true,
  tolerance: [
    {
      kind: "variable",
      variable: ownVariable(identifier, { base: "float", cardinality: "single" }),
    },
    { kind: "literal", value: 0.5 },
  ],
  toleranceMode: "absolute",
});

/**
 * An equal-rounded's value.
 *
 * @param figures - The figures.
 * @param mode - How they count.
 * @param x - The first operand.
 * @param y - The second operand.
 * @returns Its value.
 */
const rounded = (
  figures: bigint,
  mode: "decimalPlaces" | "significantFigures",
  x: number,
  y: number,
): Value =>
  run.evaluate(
    nodeOf(
      "equal-rounded",
      [float(x), float(y)],
      { figures: { kind: "literal", value: figures }, roundingMode: mode },
      singleBoolean,
    ),
  );

/**
 * An identifier the tests know is not empty.
 *
 * @param written - The identifier.
 * @returns It, as a Text.
 */
const text = (written: string): Text => (isText(written) ? written : assert.fail("empty text"));

/**
 * The values `qti-match` is held over, each a variable of its own name.
 */
const matched = Object.freeze({
  bagAAB: { value: container("multiple", "identifier", [text("A"), text("A"), text("B")]) },
  bagAB: { value: container("multiple", "identifier", [text("A"), text("B")]) },
  bagABA: { value: container("multiple", "identifier", [text("A"), text("B"), text("A")]) },
  listAB: { value: container("ordered", "identifier", [text("A"), text("B")]) },
  listBA: { value: container("ordered", "identifier", [text("B"), text("A")]) },
  pairAB: { value: single("pair", { first: text("A"), second: text("B") }) },
  pairBA: { value: single("pair", { first: text("B"), second: text("A") }) },
  recordFloat: {
    value: recordOf([
      { name: "n", value: single("float", 1) },
      { name: "s", value: single("string", text("x")) },
    ]),
  },
  recordOne: {
    value: recordOf([
      { name: "n", value: single("integer", 1n) },
      { name: "s", value: single("string", text("x")) },
    ]),
  },
  recordTwo: {
    value: recordOf([
      { name: "s", value: single("string", text("x")) },
      { name: "n", value: single("integer", 1n) },
    ]),
  },
} satisfies Readonly<Record<string, { readonly value: Value }>>);

const { run: matchRun } = testRun(operators, matched, {});

/**
 * A stated value's read.
 *
 * @param name - Its variable.
 * @returns The `qti-variable`.
 */
const stated = (name: keyof typeof matched): Expression => {
  const type: ValueType = valueTypeOf(matched[name].value);

  return nodeOf("variable", [], { variable: ownVariable(name, type) }, { kind: "typed", type });
};

/**
 * A `qti-match`'s value.
 *
 * @param left - The first operand.
 * @param right - The second operand.
 * @returns Its value.
 */
const match = (left: Expression, right: Expression): Value =>
  matchRun.evaluate(nodeOf("match", [left, right], {}, singleBoolean));

describe("the comparison family's laws", () => {
  it.effect(
    "an integer against the float nearest an integer orders as the two integers do, past 2^53 included (reading `integer-unbounded`)",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn((source): readonly [bigint, bigint] => [
              anyInteger(source),
              anyInteger(source),
            ]),
            kept: [],
            literal: (pair) => Formatter.format(pair),
            oracle: {
              kind: "second-implementation",
              name: "bigint order of the integer and the float's integer",
            },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/comparison/integer-float-order",
          },
          ([a, b]) =>
            Effect.sync(() => {
              const nearest = Number(b);
              const exactB = BigInt(nearest);
              assert.deepStrictEqual(
                compared("lt", integer(a), float(nearest)),
                single("boolean", a < exactB),
              );
              assert.deepStrictEqual(
                compared("gte", integer(a), float(nearest)),
                single("boolean", a >= exactB),
              );
              assert.deepStrictEqual(
                compared("gt", float(nearest), integer(a)),
                single("boolean", exactB > a),
              );
              assert.deepStrictEqual(
                compared("lte", float(nearest), integer(a)),
                single("boolean", exactB <= a),
              );
            }),
        ),
      ),
  );

  it.effect(
    "an absolute tolerance holds y exactly when x − t0 ≤ y ≤ x + t1 over the integers the doubles scale to (reading `tolerance-exact-binary`)",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn((source): readonly [number, number, number, number] => [
              int(-4000, 4000)(source),
              int(-4000, 4000)(source),
              int(1, 400)(source),
              int(1, 400)(source),
            ]),
            kept: [],
            literal: (row) => Formatter.format(row),
            oracle: {
              kind: "second-implementation",
              name: "the range over integers, in sixteenths",
            },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/comparison/absolute-tolerance",
          },
          ([x, y, t0, t1]) =>
            Effect.sync(() => {
              assert.deepStrictEqual(
                equalUnder(
                  tolerance("absolute", sixteenth(t0), sixteenth(t1)),
                  float(sixteenth(x)),
                  float(sixteenth(y)),
                ),
                single("boolean", x - t0 <= y && y <= x + t1),
              );
            }),
        ),
      ),
  );
});

describe("the comparison family's stated values", () => {
  it("compares an integer and a float by exact value, a NaN in no order, NULL for NULL (§2.11.3.22–27)", () => {
    assert.deepStrictEqual(
      compared("gt", integer(9_007_199_254_740_993n), float(2 ** 53)),
      single("boolean", true),
    );
    assert.deepStrictEqual(
      compared("lt", float(Number.NaN), integer(1n)),
      single("boolean", false),
    );
    assert.deepStrictEqual(
      compared("gte", float(Number.NaN), integer(1n)),
      single("boolean", false),
    );
    assert.deepStrictEqual(
      compared("lte", literal(nullOf({ base: "integer", cardinality: "single" })), integer(1n)),
      booleanNull,
    );
    assert.deepStrictEqual(
      compared("gt", integer(10n ** 400n), float(Number.POSITIVE_INFINITY)),
      single("boolean", false),
    );
  });

  it("compares durations as the doubles they are, 89.95 below 90 (reading `null-results`, item 9)", () => {
    assert.deepStrictEqual(
      compared("duration-lt", duration(89.95), duration(90)),
      single("boolean", true),
    );
    assert.deepStrictEqual(
      compared("duration-gte", duration(90), duration(90)),
      single("boolean", true),
    );
    assert.deepStrictEqual(
      compared(
        "duration-lt",
        duration(1),
        literal(nullOf({ base: "duration", cardinality: "single" })),
      ),
      booleanNull,
    );
  });

  it("equal is exact by default, an integer equal to its float and -0 to 0 (§2.11.3.3)", () => {
    const exact: AttributesOf["equal"] = {
      includeLowerBound: true,
      includeUpperBound: true,
      tolerance: undefined,
      toleranceMode: "exact",
    };

    assert.deepStrictEqual(equalUnder(exact, integer(3n), float(3)), single("boolean", true));
    assert.deepStrictEqual(equalUnder(exact, float(-0), integer(0n)), single("boolean", true));
    assert.deepStrictEqual(
      equalUnder(exact, float(Number.NaN), float(Number.NaN)),
      single("boolean", false),
    );
    assert.deepStrictEqual(
      equalUnder(exact, float(1), literal(nullOf({ base: "float", cardinality: "single" }))),
      booleanNull,
    );
  });

  it("a tolerance's ends are exact over the doubles: 1.0 ± 0.1 leaves 1.1 out, 0.123 + 0.123 holds 0.246 (reading `tolerance-exact-binary`)", () => {
    assert.deepStrictEqual(
      equalUnder(tolerance("absolute", 0.1, 0.1), float(1), float(1.1)),
      single("boolean", false),
    );
    assert.deepStrictEqual(
      equalUnder(tolerance("absolute", 0.123, 0.123), float(0.123), float(0.246)),
      single("boolean", true),
    );
  });

  it("a relative range runs from x − |x|·t0/100 to x + |x|·t1/100 whatever x's sign, its ends closed by the include attributes (reading `relative-equal-range`)", () => {
    const range = tolerance("relative", 10, 20);

    assert.deepStrictEqual(equalUnder(range, float(-100), float(-110)), single("boolean", true));
    assert.deepStrictEqual(equalUnder(range, float(-100), float(-80)), single("boolean", true));
    assert.deepStrictEqual(equalUnder(range, float(-100), float(-120)), single("boolean", false));
    assert.deepStrictEqual(equalUnder(range, float(-100), float(-79.99)), single("boolean", false));
    assert.deepStrictEqual(
      equalUnder({ ...range, includeUpperBound: false }, float(-100), float(-80)),
      single("boolean", false),
    );
  });

  it("a tolerance that names a variable reads it at run time, and NULL where it holds none", () => {
    assert.deepStrictEqual(
      equalUnder(named("tenth"), float(1), float(0.9)),
      single("boolean", true),
    );
    assert.deepStrictEqual(equalUnder(named("missing"), float(1), float(0.9)), booleanNull);
  });

  it("equal-rounded compares the two rounded decimals, significant figures by default (§2.11.3.4, reading `format-float-rounding`)", () => {
    assert.deepStrictEqual(rounded(3n, "significantFigures", 3.175, 3.17), single("boolean", true));
    assert.deepStrictEqual(rounded(2n, "decimalPlaces", 0.125, 0.13), single("boolean", true));
    assert.deepStrictEqual(rounded(2n, "decimalPlaces", 0.175, 0.18), single("boolean", false));
    assert.deepStrictEqual(rounded(2n, "decimalPlaces", Number.NaN, 1), booleanNull);
  });
});

describe("the comparison family's attributes", () => {
  const context = testContext({ declared: { tenth: { base: "float", cardinality: "single" } } });

  it("reads equal's tolerance as one or two numbers or variables, exact mode by default (reading `tolerance`)", () => {
    assert.deepStrictEqual(
      comparisonOperators.equal.read(element("qti-equal", {}, []), context, 0),
      {
        ok: true,
        value: {
          includeLowerBound: true,
          includeUpperBound: true,
          tolerance: undefined,
          toleranceMode: "exact",
        },
      },
    );
    assert.deepStrictEqual(
      comparisonOperators.equal.read(
        element("qti-equal", { tolerance: "tenth 0.5", "tolerance-mode": "absolute" }, []),
        context,
        0,
      ),
      {
        ok: true,
        value: {
          includeLowerBound: true,
          includeUpperBound: true,
          tolerance: [
            {
              kind: "variable",
              variable: ownVariable("tenth", { base: "float", cardinality: "single" }),
            },
            { kind: "literal", value: 0.5 },
          ],
          toleranceMode: "absolute",
        },
      },
    );
    assert.isFalse(
      comparisonOperators.equal.read(
        element("qti-equal", { "tolerance-mode": "relative" }, []),
        context,
        0,
      ).ok,
    );
    assert.isFalse(
      comparisonOperators.equal.read(
        element("qti-equal", { tolerance: "1 2 3", "tolerance-mode": "absolute" }, []),
        context,
        0,
      ).ok,
    );
  });

  it("reads equal-rounded's mode as significant figures where none is written (§5.47.1)", () => {
    assert.deepStrictEqual(
      comparisonOperators["equal-rounded"].read(
        element("qti-equal-rounded", { figures: "two" }, []),
        testContext({ declared: { two: { base: "integer", cardinality: "single" } } }),
        0,
      ),
      {
        ok: true,
        value: {
          figures: {
            kind: "variable",
            variable: ownVariable("two", { base: "integer", cardinality: "single" }),
          },
          roundingMode: "significantFigures",
        },
      },
    );
  });
});

describe("qti-match", () => {
  it("compares a multiple as a multiset, an ordered by position, a pair unordered and a record field by field (§2.11.3.28)", () => {
    assert.deepStrictEqual(match(stated("bagAAB"), stated("bagABA")), single("boolean", true));
    assert.deepStrictEqual(match(stated("bagAAB"), stated("bagAB")), single("boolean", false));
    assert.deepStrictEqual(match(stated("listAB"), stated("listBA")), single("boolean", false));
    assert.deepStrictEqual(match(stated("listAB"), stated("listAB")), single("boolean", true));
    assert.deepStrictEqual(match(stated("pairAB"), stated("pairBA")), single("boolean", true));
    assert.deepStrictEqual(
      match(stated("recordOne"), stated("recordTwo")),
      single("boolean", true),
    );
    assert.deepStrictEqual(
      match(stated("recordOne"), stated("recordFloat")),
      single("boolean", false),
    );
  });

  it("a NaN matches nothing and -0 matches 0; NULL gives NULL (§2.11.3.28)", () => {
    assert.deepStrictEqual(match(float(Number.NaN), float(Number.NaN)), single("boolean", false));
    assert.deepStrictEqual(match(float(-0), float(0)), single("boolean", true));
    assert.deepStrictEqual(
      match(float(1), literal(nullOf({ base: "float", cardinality: "single" }))),
      booleanNull,
    );
  });

  it("refuses operands of two types or of base type duration (reading `index-and-delete-operands`)", () => {
    assert.isFalse(comparisonOperators.match.typing([integer(1n), float(1)], {}, 0).ok);
    assert.isFalse(comparisonOperators.match.typing([duration(1), duration(1)], {}, 0).ok);
    assert.deepStrictEqual(
      comparisonOperators.match.typing([stated("bagAAB"), stated("bagAB")], {}, 0),
      {
        ok: true,
        value: singleBoolean,
      },
    );
  });
});
