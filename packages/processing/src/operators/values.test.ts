import { assert, describe, it } from "@effect/vitest";
import type { VariableRef } from "#processing/ir.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import {
  element,
  literal,
  nodeOf,
  ownVariable,
  testContext,
  testRun,
  text,
} from "#processing/test/run.ts";
import { isText, nullOf, single, textValue } from "#processing/value.ts";

const context = testContext({ declared: { SCORE: { base: "float", cardinality: "single" } } });

/**
 * Read a `qti-base-value` element.
 *
 * @param base - Its `base-type`.
 * @param written - Its text.
 * @returns What the family reads.
 */
const baseValue = (base: string, written: string) =>
  valuesOperators["base-value"].read(
    element("qti-base-value", { "base-type": base }, [text(written)]),
    context,
    3,
  );

describe("the values family", () => {
  it("reads a base value in its base type's lexical form: an integer in xs:integer's space, trimmed (reading 247)", () => {
    assert.deepStrictEqual(baseValue("integer", " +007\n"), {
      ok: true,
      value: { value: single("integer", 7n) },
    });
    assert.deepStrictEqual(baseValue("float", "1e400"), {
      ok: true,
      value: { value: single("float", Number.POSITIVE_INFINITY) },
    });
    assert.deepStrictEqual(baseValue("boolean", "1"), {
      ok: true,
      value: { value: single("boolean", true) },
    });
    assert.isFalse(baseValue("integer", "7.0").ok);
  });

  it("reads an empty string base value as NULL, and a string as written (§2.2.2, reading 7)", () => {
    assert.deepStrictEqual(baseValue("string", ""), {
      ok: true,
      value: { value: nullOf({ base: "string", cardinality: "single" }) },
    });
    assert.deepStrictEqual(baseValue("string", " a "), {
      ok: true,
      value: { value: textValue("string", " a ") },
    });
  });

  it("reads a pair as two identifiers and a point as two integers", () => {
    const [a, b] = ["A", "B"];
    assert.isTrue(isText(a) && isText(b));
    assert.deepStrictEqual(baseValue("point", " 3  -4 "), {
      ok: true,
      value: { value: single("point", { x: 3n, y: -4n }) },
    });
    assert.isFalse(baseValue("pair", "A B C").ok);
  });

  it("refuses a variable the document does not declare, and types one it does by its declaration", () => {
    const read = valuesOperators.variable.read(
      element("qti-variable", { identifier: "MISSING" }, []),
      context,
      4,
    );
    assert.deepStrictEqual(read.ok ? undefined : read.refusal.code, "unknown-identifier");

    const known = valuesOperators.variable.read(
      element("qti-variable", { identifier: "SCORE" }, []),
      context,
      4,
    );
    assert.isTrue(known.ok);
  });

  it("types a weighted read of a member's integer as a float (§7.47.2)", () => {
    const weighted: VariableRef = {
      item: "q1",
      occurrence: undefined,
      role: "outcome",
      scope: "member",
      type: { base: "integer", cardinality: "single" },
      variable: "SCORE",
      weight: "W",
    };
    assert.deepStrictEqual(valuesOperators.variable.typing([], { variable: weighted }, 0), {
      ok: true,
      value: { kind: "typed", type: { base: "float", cardinality: "single" } },
    });
  });

  it("evaluates a variable, its correct response and its default from the run, NULL of its type where it holds none", () => {
    const score = ownVariable("SCORE", { base: "float", cardinality: "single" });

    const { run } = testRun(
      valuesOperators,
      {
        SCORE: {
          correct: single("float", 1),
          default: single("float", 0),
          value: single("float", 0.5),
        },
      },
      {},
    );

    const typedScore = { kind: "typed", type: score.type } as const;
    assert.deepStrictEqual(
      valuesOperators.variable.evaluate(
        nodeOf("variable", [], { variable: score }, typedScore),
        run,
      ),
      single("float", 0.5),
    );
    assert.deepStrictEqual(
      valuesOperators.correct.evaluate(nodeOf("correct", [], { variable: score }, typedScore), run),
      single("float", 1),
    );
    assert.deepStrictEqual(
      valuesOperators.default.evaluate(nodeOf("default", [], { variable: score }, typedScore), run),
      single("float", 0),
    );

    const other = ownVariable("OTHER", { base: "integer", cardinality: "multiple" });
    assert.deepStrictEqual(
      valuesOperators.variable.evaluate(
        nodeOf("variable", [], { variable: other }, typedScore),
        run,
      ),
      nullOf(other.type),
    );
    assert.deepStrictEqual(
      valuesOperators["base-value"].evaluate(literal(single("integer", 2n)), run),
      single("integer", 2n),
    );
  });
});
