import { assert, describe, it } from "@effect/vitest";
import { alphaDefinitionPrefix, inlineOperator, recordedOperator } from "#processing/operator.ts";
import { customOperators } from "#processing/operators/custom.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import { element, literal, nodeOf, testContext, testRun, text } from "#processing/test/run.ts";
import { nullOf, single, textValue } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";

/**
 * An inline operator of the tests': its text repeated as often as its literal count says, a NULL
 * count read as once.
 */
const repeated = inlineOperator({
  apply: ([written, times]) => textValue("string", written.value.repeat(times)),
  definition: "urn:test:repeat",
  operands: [
    { form: "expression", name: "text", type: { base: "string", cardinality: "single" } },
    {
      form: "literal",
      name: "times",
      parse: (value: Value) => {
        if (value.kind === "null") {
          return 1;
        }

        return value.kind === "single" && value.base === "integer" && value.value > 0n
          ? Number(value.value)
          : undefined;
      },
      type: { base: "integer", cardinality: "single" },
    },
  ],
  result: { base: "string", cardinality: "single" },
});

/**
 * A recorded operator of the tests': an essay's score, out of its maximum.
 */
const scored = recordedOperator({
  definition: `${alphaDefinitionPrefix}test-score`,
  maximum: 1,
  operands: [
    { form: "expression", name: "essay", type: { base: "string", cardinality: "single" } },
    { form: "expression", name: "maximum", type: { base: "float", cardinality: "single" } },
  ],
  result: { base: "float", cardinality: "single" },
});

const context = testContext({ declared: {}, operators: [repeated, scored] });

const operators = Object.freeze({ ...customOperators, ...valuesOperators });

/**
 * Read a custom operator element.
 *
 * @param definition - Its `definition`.
 * @param children - Its operand elements.
 * @returns What the family reads.
 */
const read = (definition: string, children: Parameters<typeof element>[2]) =>
  customOperators["custom-operator"].read(
    element("qti-custom-operator", { definition }, children),
    context,
    9,
  );

const word = element("qti-base-value", { "base-type": "string" }, [text("ab")]);

describe("the custom-operator family", () => {
  it("refuses a definition the registry does not list, and a wrong operand count (D10)", () => {
    const unknown = read("urn:test:missing", []);
    assert.strictEqual(unknown.ok ? undefined : unknown.refusal.code, "unknown-operator");

    const short = read("urn:test:repeat", [word]);
    assert.strictEqual(short.ok ? undefined : short.refusal.code, "arity");
  });

  it("binds a literal operand at compile time, NULL by the module's reading, and refuses one its parse refuses", () => {
    const three = read("urn:test:repeat", [
      word,
      element("qti-base-value", { "base-type": "integer" }, [text("3")]),
    ]);
    assert.isTrue(three.ok);

    const node = nodeOf(
      "custom-operator",
      [literal(textValue("string", "ab")), literal(single("integer", 3n))],
      three.value,
      {
        kind: "typed",
        type: { base: "string", cardinality: "single" },
      },
    );

    const { run } = testRun(operators, {}, {});
    assert.deepStrictEqual(
      customOperators["custom-operator"].evaluate(node, run),
      textValue("string", "ababab"),
    );

    assert.isTrue(read("urn:test:repeat", [word, element("qti-null", {}, [])]).ok);

    const zero = read("urn:test:repeat", [
      word,
      element("qti-base-value", { "base-type": "integer" }, [text("0")]),
    ]);
    assert.strictEqual(zero.ok ? undefined : zero.refusal.code, "attribute");
  });

  it("demands a recorded answer that is not in, gives NULL meanwhile, and asks nothing for a NULL operand (D7, D8)", () => {
    const call = read(`${alphaDefinitionPrefix}test-score`, [word, word]);
    assert.isTrue(call.ok);

    const floatType = { kind: "typed", type: { base: "float", cardinality: "single" } } as const;
    const essay = nodeOf(
      "custom-operator",
      [literal(textValue("string", "ab")), literal(single("float", 4))],
      call.value,
      floatType,
    );

    const pending = testRun(operators, {}, {});
    assert.deepStrictEqual(
      customOperators["custom-operator"].evaluate(essay, pending.run),
      nullOf({ base: "float", cardinality: "single" }),
    );
    assert.deepStrictEqual(pending.recorder.demands, [
      {
        definition: `${alphaDefinitionPrefix}test-score`,
        maximum: single("float", 4),
        operands: [textValue("string", "ab"), single("float", 4)],
        place: 0,
      },
    ]);

    const answered = testRun(
      operators,
      {},
      { recorded: new Map([[0, { kind: "answered", value: single("float", 3) }]]) },
    );
    assert.deepStrictEqual(
      customOperators["custom-operator"].evaluate(essay, answered.run),
      single("float", 3),
    );
    assert.deepStrictEqual(answered.recorder.demands, []);
    assert.deepStrictEqual(answered.recorder.declined, []);

    const declined = testRun(operators, {}, { recorded: new Map([[0, { kind: "declined" }]]) });
    assert.deepStrictEqual(
      customOperators["custom-operator"].evaluate(essay, declined.run),
      nullOf({ base: "float", cardinality: "single" }),
    );
    assert.deepStrictEqual(declined.recorder.demands, []);
    assert.deepStrictEqual(declined.recorder.declined, [0]);

    const empty = nodeOf(
      "custom-operator",
      [literal(textValue("string", "")), literal(single("float", 4))],
      call.value,
      floatType,
    );

    const blank = testRun(operators, {}, {});
    assert.deepStrictEqual(
      customOperators["custom-operator"].evaluate(empty, blank.run),
      nullOf({ base: "float", cardinality: "single" }),
    );
    assert.deepStrictEqual(blank.recorder.demands, []);
  });
});
