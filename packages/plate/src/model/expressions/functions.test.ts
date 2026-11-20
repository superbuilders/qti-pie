import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { unknownAttributes } from "#plate/model/expression.ts";
import { admittedItem } from "#plate/test/admitted.ts";
import { nullOf } from "#plate/model/values.ts";
import { float, integer } from "#plate/test/fixtures.ts";
import {
  assertKindType,
  expressionElement,
  floatElement,
  operandOf,
  outcomeDeclaration,
  processed,
  processingItem,
  setOutcomeElement,
  variableElement,
} from "#plate/test/processing.ts";
import { attr, el, text } from "#plate/test/source.ts";

/**
 * Construct a float outcome declaration whose default is a container of floats.
 *
 * @param identifier Its `identifier`.
 * @param written Its default values, as written.
 * @returns The `qti-outcome-declaration`.
 */
const floatsOutcome = (identifier: string, written: readonly string[]): SourceElement =>
  outcomeDeclaration(identifier, "float", "multiple", [
    el(
      "qti-default-value",
      [],
      written.map((value) => el("qti-value", [], [text(value)])),
    ),
  ]);

/**
 * Construct a `qti-math-operator`.
 *
 * @param name Its `name`, as written.
 * @param operands Its operands.
 * @returns The element.
 */
const mathOperatorElement = (name: string, operands: readonly SourceElement[]): SourceElement =>
  expressionElement("math-operator", [attr("name", name)], operands);

/**
 * Construct an item whose processing sets a float outcome `SCORE`, an integer outcome `WHOLE` and
 * a float outcome `MEAN` from a functions expression each, beside the float container `VALUES`.
 *
 * @returns The item document.
 */
const functionsItem = () =>
  processingItem(
    [
      outcomeDeclaration("SCORE", "float"),
      outcomeDeclaration("WHOLE", "integer"),
      outcomeDeclaration("MEAN", "float"),
      floatsOutcome("VALUES", ["1", "2", "3", "6"]),
    ],
    [
      setOutcomeElement(
        "SCORE",
        expressionElement(
          "power",
          [],
          [
            mathOperatorElement("abs", [floatElement("-2")]),
            expressionElement("math-constant", [attr("name", "e")]),
          ],
        ),
      ),
      setOutcomeElement("WHOLE", mathOperatorElement("floor", [floatElement("-2.5")])),
      setOutcomeElement(
        "MEAN",
        expressionElement("stats-operator", [attr("name", "mean")], [variableElement("VALUES")]),
      ),
    ],
  );

/**
 * Build an item and run its processing with no response, as one attempt does.
 *
 * @param document The item document.
 * @returns The outcomes after the run.
 */
const outcomesAfter = (document: ReturnType<typeof processingItem>) =>
  Effect.gen(function* runFunctions() {
    const after = yield* processed(document, {});
    assert.isTrue(Option.isSome(after), "the processing ran");

    return Option.getOrThrow(after).outcomes;
  });

/**
 * Construct an item whose processing sets one outcome of a type to one expression.
 *
 * @param baseType The outcome's base type.
 * @param expression The expression element.
 * @returns The item document.
 */
const settingItem = (baseType: string, expression: SourceElement) =>
  processingItem(
    [outcomeDeclaration("OUT", baseType), floatsOutcome("VALUES", ["1", "2"])],
    [setOutcomeElement("OUT", expression)],
  );

describe("the functions family's reader specs and kind rules", () => {
  it("build an item whose inline processing holds qti-power, qti-math-operator, qti-math-constant and qti-stats-operator, with processing some", () => {
    const built = admittedItem(functionsItem());

    assert.deepStrictEqual(
      built.processing,
      Option.some([
        {
          expression: {
            kind: "power",
            operands: [
              { kind: "math-operator", name: "abs", operands: [operandOf(float(-2))] },
              { kind: "math-constant", name: "e", operands: [] },
            ],
          },
          identifier: "SCORE",
          kind: "set-outcome",
        },
        {
          expression: {
            kind: "math-operator",
            name: "floor",
            operands: [operandOf(float(-2.5))],
          },
          identifier: "WHOLE",
          kind: "set-outcome",
        },
        {
          expression: {
            kind: "stats-operator",
            name: "mean",
            operands: [
              {
                identifier: "VALUES",
                kind: "variable",
                operands: [],
                weightIdentifier: Option.none(),
              },
            ],
          },
          identifier: "MEAN",
          kind: "set-outcome",
        },
      ]),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it.effect("run that processing: a float power, an integer floor and a float mean", () =>
    Effect.gen(function* runsFunctions() {
      const outcomes = yield* outcomesAfter(functionsItem());
      const score = outcomes["SCORE"];
      const whole = outcomes["WHOLE"];
      const mean = outcomes["MEAN"];

      assert.strictEqual(score?.baseType, "float");
      assert.strictEqual(score?.cardinality, "single");
      assert.strictEqual(score?.values.length, 1);
      assert.deepStrictEqual(whole, integer(-3n));
      assert.deepStrictEqual(mean, float(3));
      assertKindType(
        Option.getOrThrow(Option.fromNullishOr(whole)),
        "math-operator",
        [{ baseType: "float", cardinality: "single" }],
        { ...unknownAttributes, name: Option.some("floor") },
      );
      assertKindType(
        Option.getOrThrow(Option.fromNullishOr(mean)),
        "stats-operator",
        [{ baseType: "float", cardinality: "multiple" }],
        { ...unknownAttributes, name: Option.some("mean") },
      );
    }),
  );

  it.effect(
    "accept a qti-math-operator whose operand count is not its name's and run it to NULL, never a refusal",
    () =>
      Effect.gen(function* runsWrongArity() {
        for (const expression of [
          mathOperatorElement("sin", [floatElement("1"), floatElement("2")]),
          mathOperatorElement("atan2", [floatElement("1")]),
        ]) {
          const document = settingItem("float", expression);

          const outcomes = yield* outcomesAfter(document);

          assert.deepStrictEqual(outcomes["OUT"], nullOf("float", "single"));
        }
      }),
  );
});
