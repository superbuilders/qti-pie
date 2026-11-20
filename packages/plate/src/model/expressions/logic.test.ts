import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { runRules } from "#plate/engine/evaluate.ts";
import { drawStream } from "#plate/engine/random.ts";
import type { Expression } from "#plate/model/expression.ts";
import { admittedItem } from "#plate/test/admitted.ts";
import { outcomeDefaults } from "#plate/model/record.ts";
import { integer } from "#plate/test/fixtures.ts";
import {
  assertKindType,
  baseValueElement,
  expressionElement,
  integerOutcome,
  outcomeDeclaration,
  processed,
  processingItem,
  setOutcomeElement,
  truth,
} from "#plate/test/processing.ts";
import { attr, el } from "#plate/test/source.ts";

/**
 * Construct an item whose processing sets the boolean outcome `PASSED` to one expression.
 *
 * @param expression The expression element.
 * @param declarations The declarations beside `PASSED`'s, in document order after it.
 * @returns The item document.
 */
const passedItem = (expression: SourceElement, declarations: readonly SourceElement[] = []) =>
  processingItem(
    [outcomeDeclaration("PASSED", "boolean"), ...declarations],
    [setOutcomeElement("PASSED", expression)],
  );

/**
 * Construct a `qti-base-value` of a boolean.
 *
 * @param value The boolean.
 * @returns The element.
 */
const truthElement = (value: boolean): SourceElement =>
  baseValueElement("boolean", value ? "true" : "false");

/**
 * Construct the `qti-base-value` expression of a boolean, as the reader reads
 * {@link truthElement}.
 *
 * @param value The boolean.
 * @returns The expression.
 */
const truthExpression = (value: boolean): Expression => ({
  kind: "base-value",
  operands: [],
  value: truth(value),
});

/**
 * Construct a `qti-any-n` with its bounds as written.
 *
 * @param min Its `min`, as written.
 * @param max Its `max`, as written.
 * @param operands Its operands.
 * @returns The element.
 */
const anyNElement = (min: string, max: string, operands: readonly SourceElement[]) =>
  expressionElement("any-n", [attr("max", max), attr("min", min)], operands);

/**
 * Build an item and run its processing with no response, as one attempt does.
 *
 * @param expression The expression `PASSED` is set to.
 * @param declarations The declarations beside `PASSED`'s.
 * @returns The value of `PASSED` after the run.
 */
const passedAfter = (expression: SourceElement, declarations: readonly SourceElement[] = []) =>
  Effect.gen(function* runPassed() {
    const after = yield* processed(passedItem(expression, declarations), {});
    assert.isTrue(Option.isSome(after), "the processing ran");

    return Option.getOrThrow(
      Option.flatMapNullishOr(after, (variables) => variables.outcomes["PASSED"]),
    );
  });

describe("the logic family's reader specs and kind rules", () => {
  it("build an item whose inline processing holds a qti-and tree, with processing some", () => {
    const built = admittedItem(
      passedItem(
        expressionElement(
          "and",
          [],
          [
            truthElement(true),
            expressionElement(
              "or",
              [],
              [truthElement(false), expressionElement("not", [], [truthElement(false)])],
            ),
            anyNElement(" 1 ", "TWO", [truthElement(true)]),
          ],
        ),
        [integerOutcome("TWO", "2")],
      ),
    );

    assert.deepStrictEqual(
      built.processing,
      Option.some([
        {
          expression: {
            kind: "and",
            operands: [
              truthExpression(true),
              {
                kind: "or",
                operands: [
                  truthExpression(false),
                  { kind: "not", operands: [truthExpression(false)] },
                ],
              },
              {
                kind: "any-n",
                max: { _tag: "ref", identifier: "TWO" },
                min: { _tag: "literal", value: 1n },
                operands: [truthExpression(true)],
              },
            ],
          },
          identifier: "PASSED",
          kind: "set-outcome",
        },
      ]),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it.effect("run that qti-and tree to true, the type its rule gives", () =>
    Effect.gen(function* runsAndTree() {
      const passed = yield* passedAfter(
        expressionElement(
          "and",
          [],
          [
            truthElement(true),
            expressionElement(
              "or",
              [],
              [truthElement(false), expressionElement("not", [], [truthElement(false)])],
            ),
            anyNElement("1", "TWO", [truthElement(true)]),
          ],
        ),
        [integerOutcome("TWO", "2")],
      );

      assert.deepStrictEqual(passed, truth(true));
      assertKindType(passed, "and", [
        { baseType: "boolean", cardinality: "single" },
        { baseType: "boolean", cardinality: "single" },
        { baseType: "boolean", cardinality: "single" },
      ]);
    }),
  );

  it.effect(
    "run a qti-any-n whose min names an integer outcome variable with that variable's value",
    () =>
      Effect.gen(function* runsReferencedMin() {
        const operands = [truthElement(true), truthElement(true), truthElement(false)];
        const expression = anyNElement("MIN", "3", operands);

        const atTwo = yield* passedAfter(expression, [integerOutcome("MIN", "2")]);
        const atThree = yield* passedAfter(expression, [integerOutcome("MIN", "3")]);

        assert.deepStrictEqual(atTwo, truth(true));
        assert.deepStrictEqual(atThree, truth(false));
        for (const value of [atTwo, atThree]) {
          assertKindType(
            value,
            "any-n",
            operands.map(() => ({ baseType: "boolean", cardinality: "single" })),
          );
        }
      }),
  );

  it.effect(
    "run a qti-any-n whose min names a template variable with the template value, with no mark",
    () =>
      Effect.gen(function* runsTemplateMin() {
        const document = passedItem(anyNElement("T", "4", [truthElement(true)]), [
          el("qti-template-declaration", [
            attr("base-type", "integer"),
            attr("cardinality", "single"),
            attr("identifier", "T"),
          ]),
        ]);
        const built = admittedItem(document);
        const rules = Option.getOrElse(built.processing, () => assert.fail("no processing"));
        const passedAt = (min: bigint) =>
          Effect.fromResult(
            runRules(
              rules,
              built,
              {
                outcomes: outcomeDefaults(built),
                responses: {},
                templates: { T: integer(min) },
              },
              drawStream("", ""),
            ),
          ).pipe(Effect.map((after) => after.outcomes["PASSED"]));

        assert.deepStrictEqual(built.unsupported, []);
        assert.deepStrictEqual(yield* passedAt(1n), truth(true));
        assert.deepStrictEqual(yield* passedAt(2n), truth(false));
      }),
  );
});
