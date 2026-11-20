import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import type { Expression } from "#plate/model/expression.ts";
import { admittedItem } from "#plate/test/admitted.ts";
import type { Value } from "#plate/model/values.ts";
import {
  assertKindType,
  expressionElement,
  integerElement,
  outAfter,
  outcomeDeclaration,
  processingItem,
  setOutcomeElement,
  variableElement,
} from "#plate/test/processing.ts";
import { el, text } from "#plate/test/source.ts";

/**
 * Construct a multiple integer outcome declaration with a default value.
 *
 * @param identifier Its `identifier`.
 * @param written Its default value's members, as written.
 * @returns The `qti-outcome-declaration`.
 */
const integersOutcome = (identifier: string, written: readonly string[]): SourceElement =>
  outcomeDeclaration(identifier, "integer", "multiple", [
    el(
      "qti-default-value",
      [],
      written.map((member) => el("qti-value", [], [text(member)])),
    ),
  ]);

/**
 * Construct the `qti-base-value` expression of an integer, as the reader reads
 * {@link integerElement}.
 *
 * @param value The integer.
 * @returns The expression.
 */
const integerExpression = (value: bigint): Expression => ({
  kind: "base-value",
  operands: [],
  value: { baseType: "integer", cardinality: "single", values: [{ baseType: "integer", value }] },
});

/**
 * The single integer value of an integer.
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
 * The single integer type.
 */
const integerType = { baseType: "integer", cardinality: "single" } as const;

describe("the integers family's reader specs and kind rules", () => {
  it("build an item whose inline processing holds qti-integer-divide, qti-integer-modulus, qti-integer-to-float, qti-gcd and qti-lcm, with processing some", () => {
    const built = admittedItem(
      processingItem(
        [
          outcomeDeclaration("QUOTIENT", "integer"),
          outcomeDeclaration("REMAINDER", "integer"),
          outcomeDeclaration("FLOATED", "float"),
          outcomeDeclaration("GCD", "integer"),
          outcomeDeclaration("LCM", "integer"),
        ],
        [
          setOutcomeElement(
            "QUOTIENT",
            expressionElement("integer-divide", [], [integerElement("-7"), integerElement("2")]),
          ),
          setOutcomeElement(
            "REMAINDER",
            expressionElement("integer-modulus", [], [integerElement("7"), integerElement("-2")]),
          ),
          setOutcomeElement(
            "FLOATED",
            expressionElement("integer-to-float", [], [integerElement("3")]),
          ),
          setOutcomeElement(
            "GCD",
            expressionElement("gcd", [], [integerElement("12"), integerElement("18")]),
          ),
          setOutcomeElement("LCM", expressionElement("lcm", [], [integerElement("4")])),
        ],
      ),
    );

    assert.deepStrictEqual(
      built.processing,
      Option.some([
        {
          expression: {
            kind: "integer-divide",
            operands: [integerExpression(-7n), integerExpression(2n)],
          },
          identifier: "QUOTIENT",
          kind: "set-outcome",
        },
        {
          expression: {
            kind: "integer-modulus",
            operands: [integerExpression(7n), integerExpression(-2n)],
          },
          identifier: "REMAINDER",
          kind: "set-outcome",
        },
        {
          expression: { kind: "integer-to-float", operands: [integerExpression(3n)] },
          identifier: "FLOATED",
          kind: "set-outcome",
        },
        {
          expression: {
            kind: "gcd",
            operands: [integerExpression(12n), integerExpression(18n)],
          },
          identifier: "GCD",
          kind: "set-outcome",
        },
        {
          expression: { kind: "lcm", operands: [integerExpression(4n)] },
          identifier: "LCM",
          kind: "set-outcome",
        },
      ]),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it.effect(
    "run qti-gcd and qti-lcm over a multiple integer outcome variable and a single integer, with no refusal",
    () =>
      Effect.gen(function* runsAggregates() {
        const declarations = [integersOutcome("NUMS", ["12", "-18"])];
        const gcd = expressionElement("gcd", [], [variableElement("NUMS"), integerElement("8")]);
        const lcm = expressionElement("lcm", [], [variableElement("NUMS"), integerElement("8")]);

        const greatest = yield* outAfter("integer", gcd, declarations);
        const least = yield* outAfter("integer", lcm, declarations);
        const multipleType = { baseType: "integer", cardinality: "multiple" } as const;

        assert.deepStrictEqual(greatest, integerValue(2n));
        assert.deepStrictEqual(least, integerValue(72n));
        assertKindType(greatest, "gcd", [multipleType, integerType]);
        assertKindType(least, "lcm", [multipleType, integerType]);
      }),
  );
});
