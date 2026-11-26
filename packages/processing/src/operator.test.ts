import { assert, describe, it } from "@effect/vitest";
import { alphaDefinitionPrefix, inlineOperator, recordedOperator } from "#processing/operator.ts";
import { registered } from "#processing/registry.ts";
import { container, nullOf, single, textValue } from "#processing/value.ts";

/**
 * An operator of the tests' own: the number of UTF-16 code units of a string.
 */
const length = inlineOperator({
  apply: ([text]) => single("integer", BigInt(text.value.length)),
  definition: "urn:test:length",
  operands: [{ form: "expression", name: "text", type: { base: "string", cardinality: "single" } }],
  result: { base: "integer", cardinality: "single" },
});

/**
 * An operator whose result follows its first operand's type: it is the probe when the probe is
 * present, and NULL otherwise.
 */
const itself = inlineOperator({
  apply: ([value]) => value,
  definition: "urn:test:itself",
  operands: [{ form: "expression", name: "value", type: { cardinality: "any" } }],
  result: { operand: 0 },
});

describe("custom operators", () => {
  it("applies its function to present operands of their declared types", () => {
    assert.deepStrictEqual(length.evaluate([textValue("string", "abc")]), single("integer", 3n));
  });

  it("gives NULL of its result type for a NULL operand, a wrong type or a wrong count", () => {
    const integerNull = nullOf({ base: "integer", cardinality: "single" });
    assert.deepStrictEqual(length.evaluate([textValue("string", "")]), integerNull);
    assert.deepStrictEqual(length.evaluate([single("integer", 1n)]), integerNull);
    assert.deepStrictEqual(length.evaluate([]), integerNull);
  });

  it("gives a result that follows an operand its operand's type, a NULL included", () => {
    const values = container("ordered", "float", [1, 2]);
    assert.deepStrictEqual(itself.evaluate([values]), values);

    const floats = nullOf({ base: "float", cardinality: "multiple" });
    assert.deepStrictEqual(itself.evaluate([floats]), floats);
  });

  it("keeps a recorded operator's declaration, which has no function", () => {
    const rubric = recordedOperator({
      definition: `${alphaDefinitionPrefix}test-rubric`,
      maximum: 1,
      operands: [
        { form: "expression", name: "essay", type: { base: "string", cardinality: "single" } },
        { form: "expression", name: "maximum", type: { base: "float", cardinality: "single" } },
      ],
      result: { cardinality: "record" },
    });
    assert.deepStrictEqual(Object.keys(rubric).toSorted(), [
      "definition",
      "kind",
      "maximum",
      "operands",
      "result",
    ]);
  });

  it("lists each definition once in the registry", () => {
    const definitions = registered.map((operator) => operator.definition);
    assert.strictEqual(new Set(definitions).size, definitions.length);
  });
});
