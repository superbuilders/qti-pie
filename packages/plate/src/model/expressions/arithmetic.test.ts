import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { Value } from "#plate/model/values.ts";
import {
  assertKindType,
  expressionElement,
  floatElement,
  integerElement,
  operandOf,
  outAfter,
  outcomeDeclaration,
  processingItem,
  responseDeclaration,
  setOutcomeElement,
  variableElement,
} from "#plate/test/processing.ts";
import { admittedItem } from "#plate/test/admitted.ts";

/**
 * Construct a single integer value.
 *
 * @param value The integer.
 * @returns The value.
 */
const integerValue = (value: bigint): Value => ({
  baseType: "integer",
  cardinality: "single",
  values: [{ baseType: "integer", value }],
});

/**
 * Construct a single float value.
 *
 * @param value The float.
 * @returns The value.
 */
const floatValue = (value: number): Value => ({
  baseType: "float",
  cardinality: "single",
  values: [{ baseType: "float", value }],
});

/**
 * The single integer type.
 */
const integerType = { baseType: "integer", cardinality: "single" } as const;

describe("the arithmetic family's reader specs and kind rules", () => {
  it("build an item whose inline processing holds qti-sum, qti-product, qti-subtract, qti-divide, qti-min and qti-max, with processing some", () => {
    const built = admittedItem(
      processingItem(
        [
          outcomeDeclaration("SUM", "integer"),
          outcomeDeclaration("PRODUCT", "float"),
          outcomeDeclaration("DIFFERENCE", "integer"),
          outcomeDeclaration("QUOTIENT", "float"),
          outcomeDeclaration("LEAST", "integer"),
          outcomeDeclaration("GREATEST", "float"),
        ],
        [
          setOutcomeElement(
            "SUM",
            expressionElement("sum", [], [integerElement("1"), integerElement("2")]),
          ),
          setOutcomeElement(
            "PRODUCT",
            expressionElement("product", [], [integerElement("3"), floatElement("0.5")]),
          ),
          setOutcomeElement(
            "DIFFERENCE",
            expressionElement("subtract", [], [integerElement("5"), integerElement("7")]),
          ),
          setOutcomeElement(
            "QUOTIENT",
            expressionElement("divide", [], [integerElement("7"), integerElement("2")]),
          ),
          setOutcomeElement("LEAST", expressionElement("min", [], [integerElement("4")])),
          setOutcomeElement(
            "GREATEST",
            expressionElement(
              "max",
              [],
              [floatElement("2.5"), integerElement("3"), floatElement("-1")],
            ),
          ),
        ],
      ),
    );

    assert.deepStrictEqual(
      built.processing,
      Option.some([
        {
          expression: {
            kind: "sum",
            operands: [operandOf(integerValue(1n)), operandOf(integerValue(2n))],
          },
          identifier: "SUM",
          kind: "set-outcome",
        },
        {
          expression: {
            kind: "product",
            operands: [operandOf(integerValue(3n)), operandOf(floatValue(0.5))],
          },
          identifier: "PRODUCT",
          kind: "set-outcome",
        },
        {
          expression: {
            kind: "subtract",
            operands: [operandOf(integerValue(5n)), operandOf(integerValue(7n))],
          },
          identifier: "DIFFERENCE",
          kind: "set-outcome",
        },
        {
          expression: {
            kind: "divide",
            operands: [operandOf(integerValue(7n)), operandOf(integerValue(2n))],
          },
          identifier: "QUOTIENT",
          kind: "set-outcome",
        },
        {
          expression: { kind: "min", operands: [operandOf(integerValue(4n))] },
          identifier: "LEAST",
          kind: "set-outcome",
        },
        {
          expression: {
            kind: "max",
            operands: [
              operandOf(floatValue(2.5)),
              operandOf(integerValue(3n)),
              operandOf(floatValue(-1)),
            ],
          },
          identifier: "GREATEST",
          kind: "set-outcome",
        },
      ]),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it.effect("run a qti-sum of an integer response of cardinality multiple, member by member", () =>
    Effect.gen(function* sumsContainer() {
      const expression = expressionElement(
        "sum",
        [],
        [variableElement("RESPONSE"), integerElement("4")],
      );
      const declarations = [responseDeclaration("RESPONSE", "integer", "multiple")];

      const out = yield* outAfter("integer", expression, declarations, {
        RESPONSE: {
          baseType: "integer",
          cardinality: "multiple",
          values: [
            { baseType: "integer", value: 1n },
            { baseType: "integer", value: 2n },
            { baseType: "integer", value: 3n },
          ],
        },
      });

      assert.deepStrictEqual(out, integerValue(10n));
      assertKindType(out, "sum", [{ baseType: "integer", cardinality: "multiple" }, integerType]);
    }),
  );
});
