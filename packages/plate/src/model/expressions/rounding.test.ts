import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import type { Expression } from "#plate/model/expression.ts";
import { nullOf } from "#plate/model/values.ts";
import { attr } from "#plate/test/source.ts";
import {
  assertKindType,
  expressionElement,
  floatElement,
  integerOutcome,
  outAfter,
  outcomeDeclaration,
  outItem,
  processingItem,
  setOutcomeElement,
} from "#plate/test/processing.ts";
import { admittedItem } from "#plate/test/admitted.ts";

/**
 * Construct a `qti-round-to`.
 *
 * @param mode Its `rounding-mode`, as written.
 * @param figures Its `figures`, as written.
 * @param operand Its operand.
 * @returns The element.
 */
const roundToElement = (mode: string, figures: string, operand: SourceElement) =>
  expressionElement("round-to", [attr("figures", figures), attr("rounding-mode", mode)], [operand]);

/**
 * Construct a `qti-equal-rounded`.
 *
 * @param attributes Its attributes: `figures`, and `rounding-mode` where given.
 * @param left Its first operand.
 * @param right Its second operand.
 * @returns The element.
 */
const equalRoundedElement = (
  attributes: readonly ReturnType<typeof attr>[],
  left: SourceElement,
  right: SourceElement,
) => expressionElement("equal-rounded", attributes, [left, right]);

/**
 * Construct the `qti-base-value` expression of a float, as the reader reads
 * {@link floatElement}.
 *
 * @param value The float.
 * @returns The expression.
 */
const floatExpression = (value: number): Expression => ({
  kind: "base-value",
  operands: [],
  value: { baseType: "float", cardinality: "single", values: [{ baseType: "float", value }] },
});

/**
 * The single float type.
 */
const floatType = { baseType: "float", cardinality: "single" } as const;

describe("the rounding family's reader specs and kind rules", () => {
  it("build an item whose inline processing holds qti-round, qti-truncate, qti-round-to and qti-equal-rounded, with processing some", () => {
    const built = admittedItem(
      processingItem(
        [
          outcomeDeclaration("ROUNDED", "integer"),
          outcomeDeclaration("CUT", "integer"),
          outcomeDeclaration("TO", "float"),
          outcomeDeclaration("SAME", "boolean"),
          integerOutcome("FIGURES", "2"),
        ],
        [
          setOutcomeElement("ROUNDED", expressionElement("round", [], [floatElement("6.5")])),
          setOutcomeElement("CUT", expressionElement("truncate", [], [floatElement("-6.8")])),
          setOutcomeElement(
            "TO",
            roundToElement("decimalPlaces", "FIGURES", floatElement("2.675")),
          ),
          setOutcomeElement(
            "SAME",
            equalRoundedElement(
              [attr("figures", " 3 ")],
              floatElement("3.175"),
              floatElement("3.183"),
            ),
          ),
        ],
      ),
    );

    assert.deepStrictEqual(
      built.processing,
      Option.some([
        {
          expression: { kind: "round", operands: [floatExpression(6.5)] },
          identifier: "ROUNDED",
          kind: "set-outcome",
        },
        {
          expression: { kind: "truncate", operands: [floatExpression(-6.8)] },
          identifier: "CUT",
          kind: "set-outcome",
        },
        {
          expression: {
            figures: { _tag: "ref", identifier: "FIGURES" },
            kind: "round-to",
            operands: [floatExpression(2.675)],
            roundingMode: "decimalPlaces",
          },
          identifier: "TO",
          kind: "set-outcome",
        },
        {
          expression: {
            figures: { _tag: "literal", value: 3n },
            kind: "equal-rounded",
            operands: [floatExpression(3.175), floatExpression(3.183)],
            roundingMode: "significantFigures",
          },
          identifier: "SAME",
          kind: "set-outcome",
        },
      ]),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it.effect(
    "run a qti-round-to whose figures names an integer outcome variable with that variable's value",
    () =>
      Effect.gen(function* runsReferencedFigures() {
        const expression = roundToElement("decimalPlaces", "FIGURES", floatElement("2.675"));
        const declarations = [integerOutcome("FIGURES", "2")];

        const out = yield* outAfter("float", expression, declarations);

        assert.deepStrictEqual(out, {
          baseType: "float",
          cardinality: "single",
          values: [{ baseType: "float", value: 2.68 }],
        });
        assertKindType(out, "round-to", [floatType]);
      }),
  );

  it.effect("set an integer outcome from qti-round of INF to the integer NULL, not a failure", () =>
    Effect.gen(function* setsRoundedInfinity() {
      const expression = expressionElement("round", [], [floatElement("INF")]);

      const out = yield* outAfter("integer", expression);

      assert.deepStrictEqual(out, nullOf("integer", "single"));
      assertKindType(out, "round", [floatType]);
    }),
  );

  it.effect("read figures at 2^63 - 1 exactly and run it", () =>
    Effect.gen(function* readsFiguresRange() {
      const greatest = roundToElement(
        "decimalPlaces",
        "9223372036854775807",
        floatElement("2.675"),
      );
      const built = admittedItem(outItem("float", greatest));
      const read = Option.getOrElse(built.processing, () => []).flatMap((rule) =>
        rule.kind === "set-outcome" && rule.expression.kind === "round-to"
          ? [rule.expression.figures]
          : [],
      );
      assert.deepStrictEqual(read, [{ _tag: "literal", value: 9_223_372_036_854_775_807n }]);
      assert.deepStrictEqual(yield* outAfter("float", greatest), {
        baseType: "float",
        cardinality: "single",
        values: [{ baseType: "float", value: 2.675 }],
      });
    }),
  );
});
