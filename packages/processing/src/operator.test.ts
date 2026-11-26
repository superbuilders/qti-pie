import { assert, describe, it } from "@effect/vitest";
import { alphaDefinitionPrefix, inlineOperator, recordedOperator } from "#processing/operator.ts";
import type { BoundOperator, InlineEntry } from "#processing/operator.ts";
import { registered } from "#processing/registry.ts";
import { container, isText, nullOf, single, textValue } from "#processing/value.ts";
import type { Text, Value } from "#processing/value.ts";

/**
 * A text the tests know is not empty.
 *
 * @param written - The text.
 * @returns It, as a Text.
 */
const words = (written: string): Text => (isText(written) ? written : assert.fail("empty text"));

/**
 * An operator of the tests' own: the number of UTF-16 code units of a string.
 */
const lengthEntry = inlineOperator({
  apply: ([text]) => single("integer", BigInt(text.value.length)),
  definition: "urn:test:length",
  operands: [{ form: "expression", name: "text", type: { base: "string", cardinality: "single" } }],
  result: { base: "integer", cardinality: "single" },
});

/**
 * An operator whose result follows its first operand's type: it is the probe when the probe is
 * present, and NULL otherwise.
 */
const itselfEntry = inlineOperator({
  apply: ([value]) => value,
  definition: "urn:test:itself",
  operands: [{ form: "expression", name: "value", type: { cardinality: "any" } }],
  result: { operand: 0 },
});

/**
 * Bind an entry whose operands are all expressions.
 *
 * @param entry - The entry.
 * @param count - Its number of operands.
 * @returns The bound operator.
 */
const boundOf = (entry: InlineEntry, count: number): BoundOperator => {
  const written: undefined[] = [];
  written.length = count;
  const bound = entry.bind([...written]);

  return bound ?? assert.fail("an all-expression operator binds");
};

const length = boundOf(lengthEntry, 1);

const itself = boundOf(itselfEntry, 1);

/**
 * An operator with a literal separator: a NULL literal reads as the empty string, and a separator
 * of more than one character is refused.
 */
const joined = inlineOperator({
  apply: ([values, separator]) => textValue("string", values.values.join(separator)),
  definition: "urn:test:join",
  operands: [
    { form: "expression", name: "values", type: { base: "string", cardinality: "ordered" } },
    {
      form: "literal",
      name: "separator",
      parse: (value: Value) => {
        if (value.kind === "null") {
          return "";
        }

        return value.kind === "single" && value.base === "string" && value.value.length === 1
          ? value.value
          : undefined;
      },
      type: { base: "string", cardinality: "single" },
    },
  ],
  result: { base: "string", cardinality: "single" },
});

describe("custom operators", () => {
  it("applies its function to present operands of their declared types", () => {
    assert.deepStrictEqual(length.evaluate([textValue("string", "abc")]), single("integer", 3n));
  });

  it("gives NULL of its result type for a NULL operand or one a dynamic expression mistyped", () => {
    const integerNull = nullOf({ base: "integer", cardinality: "single" });
    assert.deepStrictEqual(length.evaluate([textValue("string", "")]), integerNull);
    assert.deepStrictEqual(length.evaluate([single("integer", 1n)]), integerNull);
  });

  it("gives a result that follows an operand its operand's type, a NULL included", () => {
    const values = container("ordered", "float", [1, 2]);
    assert.deepStrictEqual(itself.evaluate([values]), values);

    const floats = nullOf({ base: "float", cardinality: "multiple" });
    assert.deepStrictEqual(itself.evaluate([floats]), floats);
  });

  it("binds a literal operand by its parse, NULL included, and refuses one its parse refuses", () => {
    const pieces = container(
      "ordered",
      "string",
      ["a", "b"].map((word) => words(word)),
    );

    const empty = joined.bind([undefined, nullOf({ base: "string", cardinality: "single" })]);
    assert.deepStrictEqual(empty?.evaluate([pieces]), textValue("string", "ab"));

    const dash = joined.bind([undefined, textValue("string", "-")]);
    assert.deepStrictEqual(dash?.evaluate([pieces]), textValue("string", "a-b"));
    assert.isUndefined(joined.bind([undefined, textValue("string", "--")]));
    assert.isUndefined(joined.bind([undefined, undefined]));
    assert.isUndefined(joined.bind([textValue("string", "a"), textValue("string", "-")]));
  });

  it("gives NULL for a NULL expression operand even beside a literal", () => {
    const dash = joined.bind([undefined, textValue("string", "-")]);
    assert.deepStrictEqual(
      dash?.evaluate([nullOf({ base: "string", cardinality: "ordered" })]),
      nullOf({ base: "string", cardinality: "single" }),
    );
  });

  it("admits a recorded operator's literals by their parse, and expressions only where it computes them", () => {
    const rubric = recordedOperator({
      definition: `${alphaDefinitionPrefix}test-rubric`,
      maximum: 1,
      operands: [
        { form: "expression", name: "essay", type: { base: "string", cardinality: "single" } },
        { form: "expression", name: "maximum", type: { base: "float", cardinality: "single" } },
        {
          form: "literal",
          name: "draw",
          parse: (value: Value) =>
            value.kind === "single" && value.base === "integer" && value.value > 0n
              ? value.value
              : undefined,
          type: { base: "integer", cardinality: "single" },
        },
      ],
      result: { cardinality: "record" },
    });
    assert.isTrue(rubric.admits([undefined, undefined, single("integer", 2n)]));
    assert.isFalse(rubric.admits([undefined, undefined, single("integer", 0n)]));
    assert.isFalse(rubric.admits([undefined, undefined, undefined]));
    assert.isFalse(rubric.admits([textValue("string", "a"), undefined, single("integer", 2n)]));
  });

  it("lists each definition once in the registry", () => {
    const definitions = registered.map((operator) => operator.definition);
    assert.strictEqual(new Set(definitions).size, definitions.length);
  });
});
