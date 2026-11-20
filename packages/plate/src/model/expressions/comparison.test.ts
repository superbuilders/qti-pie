import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { SourceAttribute, SourceElement } from "#plate/document/source.ts";
import { runRules } from "#plate/engine/evaluate.ts";
import { drawStream } from "#plate/engine/random.ts";
import type { Expression, ExpressionType, Rule } from "#plate/model/expression.ts";
import { admittedItem } from "#plate/test/admitted.ts";
import { outcomeDefaults } from "#plate/model/record.ts";
import { nullOf } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";
import { float, integer } from "#plate/test/fixtures.ts";
import {
  assertKindType,
  baseValueElement,
  expressionElement,
  outcomeDeclaration,
  processed,
  processingItem,
  responseDeclaration,
  setOutcomeElement,
  truth,
  variableElement,
} from "#plate/test/processing.ts";
import { attr, el, text } from "#plate/test/source.ts";

/**
 * The single integer type.
 */
const integerType: ExpressionType = { baseType: "integer", cardinality: "single" };

/**
 * The single float type.
 */
const floatType: ExpressionType = { baseType: "float", cardinality: "single" };

/**
 * The single duration type.
 */
const durationType: ExpressionType = { baseType: "duration", cardinality: "single" };

/**
 * Construct the single duration value of a number of seconds.
 *
 * @param seconds The seconds, a double.
 * @returns The value.
 */
const duration = (seconds: number): Value => ({
  baseType: "duration",
  cardinality: "single",
  values: [{ baseType: "duration", value: seconds }],
});

/**
 * Construct an item whose processing sets the boolean outcome `SAME` to one expression, beside a
 * single identifier response `RESPONSE`.
 *
 * @param expression The expression element.
 * @param declarations The declarations after `RESPONSE`'s and `SAME`'s, in document order.
 * @returns The item document.
 */
const sameItem = (expression: SourceElement, declarations: readonly SourceElement[] = []) =>
  processingItem(
    [
      responseDeclaration("RESPONSE", "identifier"),
      outcomeDeclaration("SAME", "boolean"),
      ...declarations,
    ],
    [setOutcomeElement("SAME", expression)],
  );

/**
 * Construct a `qti-equal` of the integer 1 and the float 1.0.
 *
 * @param attributes Its attributes.
 * @returns The element.
 */
const equalOfOnes = (attributes: readonly SourceAttribute[]): SourceElement =>
  expressionElement("equal", attributes, [
    baseValueElement("integer", "1"),
    baseValueElement("float", "1.0"),
  ]);

/**
 * The two operands {@link equalOfOnes} reads into.
 */
const ones: readonly [Expression, Expression] = [
  { kind: "base-value", operands: [], value: integer(1n) },
  { kind: "base-value", operands: [], value: float(1) },
];

/**
 * Construct the rule that sets `SAME`.
 *
 * @param expression Its expression.
 * @returns The rule.
 */
const setsSame = (expression: Expression): Rule => ({
  expression,
  identifier: "SAME",
  kind: "set-outcome",
});

/**
 * Construct an outcome declaration with a default value.
 *
 * @param identifier Its `identifier`.
 * @param baseType Its `base-type`.
 * @param written Its default value, as written.
 * @returns The `qti-outcome-declaration`.
 */
const outcomeWithDefault = (identifier: string, baseType: string, written: string) =>
  outcomeDeclaration(identifier, baseType, "single", [
    el("qti-default-value", [], [el("qti-value", [], [text(written)])]),
  ]);

/**
 * Build an item and run its processing with no response, as one attempt does.
 *
 * @param expression The expression `SAME` is set to.
 * @param declarations The declarations after `RESPONSE`'s and `SAME`'s.
 * @returns The value of `SAME` after the run.
 */
const sameAfter = (expression: SourceElement, declarations: readonly SourceElement[] = []) =>
  Effect.gen(function* runSame() {
    const after = yield* processed(sameItem(expression, declarations), {});
    assert.isTrue(Option.isSome(after), "the processing ran");

    return Option.getOrThrow(
      Option.flatMapNullishOr(after, (variables) => variables.outcomes["SAME"]),
    );
  });

/**
 * Construct a `qti-equal` of two floats in a tolerance mode.
 *
 * @param mode Its `tolerance-mode`, as written.
 * @param tolerance Its `tolerance`, as written.
 * @param x Its first operand, as written.
 * @param y Its second operand, as written.
 * @returns The element.
 */
const floatEqual = (mode: string, tolerance: string, x: string, y: string): SourceElement =>
  expressionElement(
    "equal",
    [attr("tolerance", tolerance), attr("tolerance-mode", mode)],
    [baseValueElement("float", x), baseValueElement("float", y)],
  );

describe("the comparison family's reader specs and kind rules", () => {
  it("read a qti-match into its two operands", () => {
    const document = sameItem(
      expressionElement(
        "match",
        [],
        [
          variableElement("RESPONSE"),
          expressionElement("correct", [attr("identifier", "RESPONSE")]),
        ],
      ),
    );
    const built = admittedItem(document);

    assert.deepStrictEqual(
      built.processing,
      Option.some([
        setsSame({
          kind: "match",
          operands: [
            {
              identifier: "RESPONSE",
              kind: "variable",
              operands: [],
              weightIdentifier: Option.none(),
            },
            { identifier: "RESPONSE", kind: "correct", operands: [] },
          ],
        }),
      ]),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("read a qti-equal's four tolerance fields at their defaults when none is written", () => {
    const built = admittedItem(sameItem(equalOfOnes([])));

    assert.deepStrictEqual(
      built.processing,
      Option.some([
        setsSame({
          includeLowerBound: true,
          includeUpperBound: true,
          kind: "equal",
          operands: ones,
          tolerance: [],
          toleranceMode: "exact",
        }),
      ]),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("read a qti-equal's four tolerance fields as written", () => {
    const built = admittedItem(
      sameItem(
        equalOfOnes([
          attr("include-lower-bound", "false"),
          attr("include-upper-bound", " 0 "),
          attr("tolerance", "\t0.5  INF "),
          attr("tolerance-mode", "exact"),
        ]),
      ),
    );

    assert.deepStrictEqual(
      built.processing,
      Option.some([
        setsSame({
          includeLowerBound: false,
          includeUpperBound: false,
          kind: "equal",
          operands: ones,
          tolerance: [
            { _tag: "literal", value: 0.5 },
            { _tag: "literal", value: Number.POSITIVE_INFINITY },
          ],
          toleranceMode: "exact",
        }),
      ]),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("build an exact qti-equal whose tolerance token names nothing, with no mark", () => {
    const built = admittedItem(sameItem(equalOfOnes([attr("tolerance", "NOTHING")])));

    assert.deepStrictEqual(
      built.processing,
      Option.some([
        setsSame({
          includeLowerBound: true,
          includeUpperBound: true,
          kind: "equal",
          operands: ones,
          tolerance: [{ _tag: "ref", identifier: "NOTHING" }],
          toleranceMode: "exact",
        }),
      ]),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it('build an inline qti-equal with tolerance-mode="relative" or "absolute", with processing some and no tolerance-mode mark', () => {
    for (const mode of ["relative", "absolute"] as const) {
      const built = admittedItem(
        sameItem(equalOfOnes([attr("tolerance-mode", mode), attr("tolerance", "0.1")])),
      );

      assert.deepStrictEqual(
        built.processing,
        Option.some([
          setsSame({
            includeLowerBound: true,
            includeUpperBound: true,
            kind: "equal",
            operands: ones,
            tolerance: [{ _tag: "literal", value: 0.1 }],
            toleranceMode: mode,
          }),
        ]),
        mode,
      );
      assert.deepStrictEqual(built.unsupported, [], mode);
    }
  });

  it("keep an absolute qti-equal over the floatValue of a record response, marking no tolerance mode", () => {
    const built = admittedItem(
      sameItem(
        expressionElement(
          "equal",
          [attr("tolerance-mode", "absolute"), attr("tolerance", "0.1")],
          [
            expressionElement(
              "field-value",
              [attr("field-identifier", "floatValue")],
              [variableElement("ANSWER")],
            ),
            baseValueElement("float", "1.0"),
          ],
        ),
        [
          el("qti-response-declaration", [
            attr("cardinality", "record"),
            attr("identifier", "ANSWER"),
          ]),
        ],
      ),
    );

    assert.isTrue(Option.isSome(built.processing), "the processing runs");
    assert.deepStrictEqual(built.unsupported, []);
  });

  it.effect(
    "run a qti-equal in absolute and relative modes whose tolerance names a float and an integer outcome variable",
    () =>
      Effect.gen(function* runsReferencedTolerance() {
        const declarations = [
          outcomeWithDefault("HALF", "float", "0.5"),
          outcomeWithDefault("ONE", "integer", "1"),
        ];
        const cases: readonly (readonly [SourceElement, boolean])[] = [
          [floatEqual("absolute", "ONE HALF", "10", "9"), true],
          [floatEqual("absolute", "ONE HALF", "10", "10.5"), true],
          [floatEqual("absolute", "ONE HALF", "10", "10.75"), false],
          [floatEqual("absolute", "HALF", "10", "9.25"), false],
          [floatEqual("relative", "5.0 5.0", "200", "210"), true],
          [floatEqual("relative", "ONE", "200", "202.5"), false],
          [floatEqual("relative", "ONE", "-200", "-202"), true],
        ];

        for (const [expression, expected] of cases) {
          const same = yield* sameAfter(expression, declarations);

          assert.deepStrictEqual(same, truth(expected));
          assertKindType(same, "equal", [floatType, floatType]);
        }
      }),
  );

  it.effect(
    "accept a qti-equal whose tolerance token names no variable or a string variable, and run it to NULL",
    () =>
      Effect.gen(function* runsUnnamedToleranceToNull() {
        const declarations = [outcomeWithDefault("LABEL", "string", "0.5")];

        for (const token of ["NOTHING", "LABEL"]) {
          const expression = equalOfOnes([
            attr("tolerance", token),
            attr("tolerance-mode", "absolute"),
          ]);

          const same = yield* sameAfter(expression, declarations);

          assert.deepStrictEqual(same, nullOf("boolean", "single"), token);
          assertKindType(same, "equal", [integerType, floatType]);
        }
      }),
  );

  it.effect(
    "run a qti-equal whose tolerance token names a template variable with the template value, with no mark",
    () =>
      Effect.gen(function* runsTemplateTolerance() {
        const document = sameItem(
          expressionElement(
            "equal",
            [attr("tolerance", "T"), attr("tolerance-mode", "absolute")],
            [baseValueElement("integer", "1"), baseValueElement("float", "1.5")],
          ),
          [
            el("qti-template-declaration", [
              attr("base-type", "float"),
              attr("cardinality", "single"),
              attr("identifier", "T"),
            ]),
          ],
        );
        const built = admittedItem(document);
        const rules = Option.getOrElse(built.processing, () => assert.fail("no processing"));
        const sameAt = (tolerance: number) =>
          Effect.fromResult(
            runRules(
              rules,
              built,
              {
                outcomes: outcomeDefaults(built),
                responses: {},
                templates: { T: float(tolerance) },
              },
              drawStream("", ""),
            ),
          ).pipe(Effect.map((after) => after.outcomes["SAME"]));

        assert.deepStrictEqual(built.unsupported, []);
        assert.deepStrictEqual(yield* sameAt(0.5), truth(true));
        assert.deepStrictEqual(yield* sameAt(0.25), truth(false));
      }),
  );

  it("read qti-gt, qti-gte, qti-lt and qti-lte into their two operands", () => {
    for (const kind of ["gt", "gte", "lt", "lte"] as const) {
      const built = admittedItem(
        sameItem(
          expressionElement(
            kind,
            [],
            [baseValueElement("integer", "2"), baseValueElement("float", "1.5")],
          ),
        ),
      );

      assert.deepStrictEqual(
        built.processing,
        Option.some([
          setsSame({
            kind,
            operands: [
              { kind: "base-value", operands: [], value: integer(2n) },
              { kind: "base-value", operands: [], value: float(1.5) },
            ],
          }),
        ]),
        kind,
      );
      assert.deepStrictEqual(built.unsupported, [], kind);
    }
  });

  it.effect(
    "run qti-gt, qti-gte, qti-lt and qti-lte of the integer 2 and the float 1.5 to the boolean each gives",
    () =>
      Effect.gen(function* runsOrders() {
        const cases = [
          ["gt", true],
          ["gte", true],
          ["lt", false],
          ["lte", false],
        ] as const;

        for (const [kind, expected] of cases) {
          const same = yield* sameAfter(
            expressionElement(
              kind,
              [],
              [baseValueElement("integer", "2"), baseValueElement("float", "1.5")],
            ),
          );

          assert.deepStrictEqual(same, truth(expected), kind);
          assertKindType(same, kind, [integerType, floatType]);
        }
      }),
  );

  it("read qti-duration-lt and qti-duration-gte into their two operands, with no mark", () => {
    for (const kind of ["duration-lt", "duration-gte"] as const) {
      const document = sameItem(
        expressionElement(
          kind,
          [],
          [baseValueElement("duration", "89.9"), baseValueElement("duration", "90")],
        ),
      );
      const built = admittedItem(document);

      assert.deepStrictEqual(
        built.processing,
        Option.some([
          setsSame({
            kind,
            operands: [
              { kind: "base-value", operands: [], value: duration(89.9) },
              { kind: "base-value", operands: [], value: duration(90) },
            ],
          }),
        ]),
        kind,
      );
      assert.deepStrictEqual(built.unsupported, [], kind);
    }
  });

  it.effect(
    "run qti-duration-lt and qti-duration-gte of a duration variable and a duration to the boolean each gives, of the type their rule gives",
    () =>
      Effect.gen(function* runsDurations() {
        const declarations = [outcomeWithDefault("TAKEN", "duration", "89.9")];
        const cases = [
          ["duration-lt", "90", true],
          ["duration-gte", "90", false],
          ["duration-lt", "89.9", false],
          ["duration-gte", "89.9", true],
          ["duration-lt", "INF", true],
          ["duration-gte", "NaN", false],
        ] as const;

        for (const [kind, written, expected] of cases) {
          const expression = expressionElement(
            kind,
            [],
            [variableElement("TAKEN"), baseValueElement("duration", written)],
          );

          const same = yield* sameAfter(expression, declarations);

          assert.deepStrictEqual(same, truth(expected), `${kind} ${written}`);
          assertKindType(same, kind, [durationType, durationType]);
        }
      }),
  );
});
