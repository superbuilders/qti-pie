import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import type { SourceDocument, SourceElement } from "#plate/document/source.ts";
import { evaluateExpression, runRules } from "#plate/engine/evaluate.ts";
import type { Variables } from "#plate/engine/evaluate.ts";
import {
  OutcomeMismatchError,
  UnknownIdentifierError,
  UnmappedResponseError,
} from "#plate/engine/failures.ts";
import { booleanOf, floatValue, integerValue } from "#plate/engine/numbers.ts";
import { drawStream } from "#plate/engine/random.ts";
import type { Item, OutcomeDeclaration, ResponseDeclaration } from "#plate/model/item.ts";
import type { Branch, Expression, Rule } from "#plate/model/expression.ts";
import { admittedItem } from "#plate/test/admitted.ts";
import { nullOf } from "#plate/model/values.ts";
import type { Single, Value } from "#plate/model/values.ts";
import { attr, doc, el, paragraph, text } from "#plate/test/source.ts";

/**
 * Construct a single identifier value.
 *
 * @param identifier The identifier.
 * @returns The value.
 */
const identifierValue = (identifier: string): Value => ({
  baseType: "identifier",
  cardinality: "single",
  values: [{ baseType: "identifier", value: identifier }],
});

/**
 * Construct a single duration of some seconds.
 *
 * @param seconds The seconds.
 * @returns The value.
 */
const durationValue = (seconds: number): Value => ({
  baseType: "duration",
  cardinality: "single",
  values: [{ baseType: "duration", value: seconds }],
});

/**
 * The BG007-shaped response: a single identifier whose correct response is `true`.
 */
const response: ResponseDeclaration = {
  areaMapping: Option.none(),
  baseType: "identifier",
  cardinality: "single",
  correct: Option.some(identifierValue("true")),
  defaultValue: Option.none(),
  identifier: "RESPONSE",
  mapping: Option.none(),
};

/**
 * A single identifier response with no correct response.
 */
const open: ResponseDeclaration = { ...response, correct: Option.none(), identifier: "OPEN" };

/**
 * A multiple point response with no area mapping.
 */
const unmapped: ResponseDeclaration = {
  areaMapping: Option.none(),
  baseType: "point",
  cardinality: "multiple",
  correct: Option.none(),
  defaultValue: Option.none(),
  identifier: "UNMAPPED",
  mapping: Option.none(),
};

/**
 * A single float outcome with no default, as `SCORE` is declared.
 */
const score: OutcomeDeclaration = {
  baseType: "float",
  cardinality: "single",
  defaultValue: Option.none(),
  identifier: "SCORE",
  interpretation: Option.none(),
  longInterpretation: Option.none(),
  lookupTable: Option.none(),
  masteryValue: Option.none(),
  normalMaximum: Option.none(),
  normalMinimum: Option.none(),
  view: Option.none(),
};

/**
 * A single boolean outcome with no default.
 */
const empty: OutcomeDeclaration = { ...score, baseType: "boolean", identifier: "EMPTY" };

/**
 * The item the rules run against: its declarations are all the evaluator reads of it.
 */
const item: Item = {
  adaptive: false,
  body: [],
  content: {
    "qti-assessment-stimulus-ref": [],
    "qti-catalog-info": [],
    "qti-companion-materials-info": [],
  },
  contexts: new Map(),
  document: "evaluate.xml",
  identifier: "evaluate",
  lang: Option.none(),
  modalFeedback: [],
  outcomes: new Map([
    ["SCORE", score],
    ["EMPTY", empty],
  ]),
  processing: Option.none(),
  records: new Map(),
  responses: new Map([
    ["RESPONSE", response],
    ["OPEN", open],
    ["UNMAPPED", unmapped],
  ]),
  templateProcessing: { kind: "absent" },
  templates: new Map(),
  title: "Evaluate",
  unheld: new Map(),
  unsupported: [],
};

/**
 * Construct the variables of one attempt.
 *
 * @param answer The value of `RESPONSE`.
 * @param scored The value of `SCORE` before the rules run, 0 by default.
 * @returns The variables: `RESPONSE` and `OPEN`, and `SCORE` and a NULL `EMPTY`.
 */
const variablesOf = (answer: Value, scored: Value = floatValue(0)): Variables => ({
  outcomes: { EMPTY: nullOf("boolean", "single"), SCORE: scored },
  responses: { OPEN: nullOf("identifier", "single"), RESPONSE: answer },
});

/**
 * Construct a `qti-variable`.
 *
 * @param identifier The variable's identifier.
 * @returns The expression.
 */
const variable = (identifier: string): Expression => ({
  identifier,
  kind: "variable",
  operands: [],
  weightIdentifier: Option.none(),
});

/**
 * Construct a `qti-base-value`.
 *
 * @param value The value.
 * @returns The expression.
 */
const base = (value: Value): Expression => ({ kind: "base-value", operands: [], value });

/**
 * Construct a single identifier.
 *
 * @param value The identifier.
 * @returns The single.
 */
const identifierOf = (value: string): Single => ({ baseType: "identifier", value });

/**
 * Construct a `qti-set-outcome-value`.
 *
 * @param identifier The outcome.
 * @param expression Its new value.
 * @returns The rule.
 */
const setOutcome = (identifier: string, expression: Expression): Rule => ({
  expression,
  identifier,
  kind: "set-outcome",
});

/**
 * Construct a `qti-response-if` or `qti-response-else-if`.
 *
 * @param when Its condition.
 * @param then The rules it runs.
 * @returns The branch.
 */
const branchOf = (when: Expression, rules: readonly Rule[]): Branch => ({ rules, when });

/**
 * Construct a `qti-response-condition`.
 *
 * @param branches Its if and else-if branches, in order.
 * @param otherwise Its else rules, when it has an else.
 * @returns The rule.
 */
const condition = (branches: readonly Branch[], otherwise?: readonly Rule[]): Rule => ({
  branches,
  kind: "condition",
  otherwise: Option.fromUndefinedOr(otherwise),
});

/**
 * The `match_correct` template as its rule tree: `SCORE` is 1 when `RESPONSE` matches its correct
 * response, else 0.
 */
const matchCorrect: readonly Rule[] = [
  condition(
    [
      branchOf(
        {
          kind: "match",
          operands: [
            variable("RESPONSE"),
            { identifier: "RESPONSE", kind: "correct", operands: [] },
          ],
        },
        [setOutcome("SCORE", base(floatValue(1)))],
      ),
    ],
    [setOutcome("SCORE", base(floatValue(0)))],
  ),
];

/**
 * Give the failure a Result holds, after checking that it is a Result and that it failed.
 *
 * @param result The Result the engine returned.
 * @returns Its failure.
 */
const failureOf = <A, E>(result: Result.Result<A, E>): E => {
  assert.isTrue(Result.isResult(result));
  assert.isTrue(Result.isFailure(result));

  return Result.getOrThrow(Result.flip(result));
};

describe("runRules", () => {
  it("a match with a NULL response takes the else branch", () => {
    const after = Result.getOrThrow(
      runRules(
        matchCorrect,
        item,
        variablesOf(nullOf("identifier", "single"), floatValue(1)),
        drawStream("", ""),
      ),
    );

    assert.deepStrictEqual(after.outcomes["SCORE"], floatValue(0));
  });

  it("a match with the correct identifier takes the if branch", () => {
    const after = Result.getOrThrow(
      runRules(matchCorrect, item, variablesOf(identifierValue("true")), drawStream("", "")),
    );

    assert.deepStrictEqual(after.outcomes["SCORE"], floatValue(1));
  });

  it("set-outcome writes a float and leaves the responses as they were", () => {
    const before = variablesOf(identifierValue("false"));
    const after = Result.getOrThrow(
      runRules([setOutcome("SCORE", base(floatValue(2.5)))], item, before, drawStream("", "")),
    );

    assert.deepStrictEqual(after.outcomes["SCORE"], floatValue(2.5));
    assert.deepStrictEqual(after.responses, before.responses);
  });

  it("an else-if branch runs when the first fails", () => {
    const answered = (choice: string): Expression => ({
      kind: "match",
      operands: [variable("RESPONSE"), base(identifierValue(choice))],
    });
    const rules = [
      condition(
        [
          branchOf(answered("A"), [setOutcome("SCORE", base(floatValue(1)))]),
          branchOf(answered("B"), [setOutcome("SCORE", base(floatValue(0.5)))]),
        ],
        [setOutcome("SCORE", base(floatValue(0)))],
      ),
    ];
    const after = Result.getOrThrow(
      runRules(rules, item, variablesOf(identifierValue("B")), drawStream("", "")),
    );

    assert.deepStrictEqual(after.outcomes["SCORE"], floatValue(0.5));
  });

  it("a rule reads the outcome an earlier rule set", () => {
    const rules = [
      setOutcome("EMPTY", { kind: "is-null", operands: [variable("RESPONSE")] }),
      condition([branchOf(variable("EMPTY"), [setOutcome("SCORE", base(floatValue(0.5)))])]),
    ];
    const after = Result.getOrThrow(
      runRules(rules, item, variablesOf(nullOf("identifier", "single")), drawStream("", "")),
    );

    assert.deepStrictEqual(after.outcomes["EMPTY"], booleanOf(true));
    assert.deepStrictEqual(after.outcomes["SCORE"], floatValue(0.5));
  });

  it("a condition with no true branch and no else changes nothing", () => {
    const rules = [
      condition([branchOf(variable("EMPTY"), [setOutcome("SCORE", base(floatValue(1)))])]),
    ];
    const before = variablesOf(identifierValue("A"), floatValue(0.25));

    assert.deepStrictEqual(
      Result.getOrThrow(runRules(rules, item, before, drawStream("", ""))),
      before,
    );
  });

  it("refuses to set an outcome to a value of another base type", () => {
    const integerOne: Value = {
      baseType: "integer",
      cardinality: "single",
      values: [{ baseType: "integer", value: 1n }],
    };

    const failure = failureOf(
      runRules(
        [setOutcome("SCORE", base(integerOne))],
        item,
        variablesOf(identifierValue("A")),
        drawStream("", ""),
      ),
    );

    assert.instanceOf(failure, OutcomeMismatchError);
    assert.deepStrictEqual(
      {
        _tag: failure._tag,
        actual: failure.actual,
        expected: failure.expected,
        identifier: failure.identifier,
      },
      {
        _tag: "OutcomeMismatchError",
        actual: "integer single",
        expected: "float single",
        identifier: "SCORE",
      },
    );
  });

  it("refuses an outcome or a variable the item does not declare", () => {
    const outcome = failureOf(
      runRules(
        [setOutcome("RESPONSE", base(floatValue(1)))],
        item,
        variablesOf(identifierValue("A")),
        drawStream("", ""),
      ),
    );
    const missing = failureOf(
      runRules(
        [setOutcome("SCORE", variable("MISSING"))],
        item,
        variablesOf(identifierValue("A")),
        drawStream("", ""),
      ),
    );

    assert.instanceOf(outcome, UnknownIdentifierError);
    assert.instanceOf(missing, UnknownIdentifierError);
    assert.deepStrictEqual(
      [
        { _tag: outcome._tag, identifier: outcome.identifier, role: outcome.role },
        { _tag: missing._tag, identifier: missing.identifier, role: missing.role },
      ],
      [
        { _tag: "UnknownIdentifierError", identifier: "RESPONSE", role: "outcome" },
        { _tag: "UnknownIdentifierError", identifier: "MISSING", role: "variable" },
      ],
    );
  });

  it("says the item lacks an outcome it does not declare", () => {
    const failure = failureOf(
      runRules(
        [setOutcome("UNDECLARED", base(floatValue(1)))],
        item,
        variablesOf(identifierValue("A")),
        drawStream("", ""),
      ),
    );

    assert.instanceOf(failure, UnknownIdentifierError);
    assert.deepStrictEqual(
      {
        _tag: failure._tag,
        holder: failure.holder,
        identifier: failure.identifier,
        role: failure.role,
      },
      { _tag: "UnknownIdentifierError", holder: "item", identifier: "UNDECLARED", role: "outcome" },
    );
  });
});

/**
 * `GRADE`'s match table: 1 maps to `A`, 2 to `B`, and every other integer to `F`.
 */
const grade: OutcomeDeclaration = {
  ...score,
  baseType: "identifier",
  identifier: "GRADE",
  lookupTable: Option.some({
    defaultValue: Option.some(identifierOf("F")),
    entries: [
      { sourceValue: 1n, targetValue: identifierOf("A") },
      { sourceValue: 2n, targetValue: identifierOf("B") },
    ],
    kind: "match",
  }),
};

/**
 * `LEVEL`'s match table, with no `default-value`: 1 maps to `A`.
 */
const level: OutcomeDeclaration = {
  ...grade,
  identifier: "LEVEL",
  lookupTable: Option.some({
    defaultValue: Option.none(),
    entries: [{ sourceValue: 1n, targetValue: identifierOf("A") }],
    kind: "match",
  }),
};

/**
 * `BAND`'s interpolation table, in document order: at or above 7.5 is `HIGH`; above 2, the
 * boundary excluded, `MID`; at or above 0 `LOW`; anything else `NONE`.
 */
const band: OutcomeDeclaration = {
  ...grade,
  identifier: "BAND",
  lookupTable: Option.some({
    defaultValue: Option.some(identifierOf("NONE")),
    entries: [
      { includeBoundary: true, sourceValue: 7.5, targetValue: identifierOf("HIGH") },
      { includeBoundary: false, sourceValue: 2, targetValue: identifierOf("MID") },
      { includeBoundary: true, sourceValue: 0, targetValue: identifierOf("LOW") },
    ],
    kind: "interpolation",
  }),
};

/**
 * A single integer outcome, `COUNT`, the source of a NULL integer.
 */
const count: OutcomeDeclaration = { ...score, baseType: "integer", identifier: "COUNT" };

/**
 * The item of the response-rule cases: {@link item} with the lookup outcomes and `COUNT`.
 */
const lookupItem: Item = {
  ...item,
  outcomes: new Map([
    ...item.outcomes,
    ["GRADE", grade],
    ["LEVEL", level],
    ["BAND", band],
    ["COUNT", count],
  ]),
};

/**
 * The variables of the response-rule cases: `SCORE` 0, and `COUNT`, `GRADE`, `LEVEL` and `BAND`
 * NULL.
 */
const lookupVariables: Variables = {
  outcomes: {
    BAND: nullOf("identifier", "single"),
    COUNT: nullOf("integer", "single"),
    GRADE: nullOf("identifier", "single"),
    LEVEL: nullOf("identifier", "single"),
    SCORE: floatValue(0),
  },
  responses: {},
};

/**
 * Construct a `qti-lookup-outcome-value`.
 *
 * @param identifier The outcome whose table maps the value.
 * @param expression The value looked up.
 * @returns The rule.
 */
const lookupOutcome = (identifier: string, expression: Expression): Rule => ({
  expression,
  identifier,
  kind: "lookup-outcome",
});

/**
 * Run one lookup against {@link lookupItem} and give the outcome it set.
 *
 * @param identifier The outcome looked up.
 * @param expression The value looked up.
 * @returns The outcome's value after the lookup.
 */
const lookedUp = (identifier: string, expression: Expression): Value | undefined =>
  Result.getOrThrow(
    runRules(
      [lookupOutcome(identifier, expression)],
      lookupItem,
      lookupVariables,
      drawStream("", ""),
    ),
  ).outcomes[identifier];

/**
 * Construct a `qti-set-outcome-value` element of `SCORE` to a float base value.
 *
 * @param value The base value's text.
 * @returns The rule element.
 */
const scoreElement = (value: string): SourceElement =>
  el(
    "qti-set-outcome-value",
    [attr("identifier", "SCORE")],
    [el("qti-base-value", [attr("base-type", "float")], [text(value)])],
  );

/**
 * Construct an item whose inline response processing looks its float response up in `BAND`'s
 * interpolation table, {@link band}'s as written: at or above 7.5 is `HIGH`; above 2, the
 * boundary excluded, `MID`; at or above 0 `LOW`; anything else `NONE`. `BAND` is a single
 * identifier.
 */
const bandItem: SourceDocument = doc(
  "items/band.xml",
  el(
    "qti-assessment-item",
    [attr("identifier", "band"), attr("time-dependent", "false"), attr("title", "Band")],
    [
      el("qti-response-declaration", [
        attr("base-type", "float"),
        attr("cardinality", "single"),
        attr("identifier", "RESPONSE"),
      ]),
      el(
        "qti-outcome-declaration",
        [
          attr("base-type", "identifier"),
          attr("cardinality", "single"),
          attr("identifier", "BAND"),
        ],
        [
          el(
            "qti-interpolation-table",
            [attr("default-value", "NONE")],
            [
              el("qti-interpolation-table-entry", [
                attr("source-value", "7.5"),
                attr("target-value", "HIGH"),
              ]),
              el("qti-interpolation-table-entry", [
                attr("include-boundary", "false"),
                attr("source-value", "2"),
                attr("target-value", "MID"),
              ]),
              el("qti-interpolation-table-entry", [
                attr("source-value", "0"),
                attr("target-value", "LOW"),
              ]),
            ],
          ),
        ],
      ),
      el("qti-item-body", [], [paragraph]),
      el(
        "qti-response-processing",
        [],
        [
          el(
            "qti-lookup-outcome-value",
            [attr("identifier", "BAND")],
            [el("qti-variable", [attr("identifier", "RESPONSE")])],
          ),
        ],
      ),
    ],
  ),
);

describe("response rules: lookup, exit and a typed NULL", () => {
  it("a lookup maps a value through its outcome's match table by exact integer", () => {
    assert.deepStrictEqual(lookedUp("GRADE", base(integerValue(2n))), identifierValue("B"));
  });

  it("a lookup no match table entry maps gives the table's default-value, else a NULL of the outcome's type", () => {
    assert.deepStrictEqual(lookedUp("GRADE", base(integerValue(3n))), identifierValue("F"));
    assert.deepStrictEqual(
      lookedUp("LEVEL", base(integerValue(3n))),
      nullOf("identifier", "single"),
    );
  });

  it("a lookup of a NULL gives the table's default-value, else NULL, never the outcome's own default", () => {
    const defaulted: Item = {
      ...lookupItem,
      outcomes: new Map([
        ...lookupItem.outcomes,
        ["LEVEL", { ...level, defaultValue: Option.some(identifierValue("Z")) }],
      ]),
    };
    const after = Result.getOrThrow(
      runRules(
        [lookupOutcome("GRADE", variable("COUNT")), lookupOutcome("LEVEL", variable("COUNT"))],
        defaulted,
        lookupVariables,
        drawStream("", ""),
      ),
    );

    assert.deepStrictEqual(after.outcomes["GRADE"], identifierValue("F"));
    assert.deepStrictEqual(after.outcomes["LEVEL"], nullOf("identifier", "single"));
  });

  it("a lookup maps a number through an interpolation table by the first entry whose source-value it reaches, include-boundary deciding the equal case", () => {
    const bands = [
      [floatValue(7.5), "HIGH"],
      [floatValue(9), "HIGH"],
      [floatValue(2.5), "MID"],
      [floatValue(2), "LOW"],
      [integerValue(2n), "LOW"],
      [integerValue(3n), "MID"],
      [floatValue(0), "LOW"],
      [floatValue(-1), "NONE"],
    ] as const;

    for (const [index, [source, expected]] of bands.entries()) {
      assert.deepStrictEqual(
        lookedUp("BAND", base(source)),
        identifierValue(expected),
        `case ${index}`,
      );
    }
  });

  it("a lookup maps a duration through an interpolation table by its seconds, as reading 28 admits one", () => {
    assert.deepStrictEqual(lookedUp("BAND", base(durationValue(90))), identifierValue("HIGH"));
    assert.deepStrictEqual(lookedUp("BAND", base(durationValue(2))), identifierValue("LOW"));
    assert.deepStrictEqual(lookedUp("BAND", base(durationValue(-1))), identifierValue("NONE"));
  });

  it.effect(
    "an inline lookup through an interpolation table runs into a single outcome, each answer to its band (repair7-1)",
    () =>
      Effect.gen(function* looksUpInline() {
        const single = admittedItem(bandItem);
        const rules = yield* Option.match(single.processing, {
          onNone: () => Effect.die("the single outcome's lookup does not run"),
          onSome: Effect.succeed,
        });
        const bands = [
          [7.5, "HIGH"],
          [2.5, "MID"],
          [2, "LOW"],
          [-1, "NONE"],
        ] as const;

        assert.deepStrictEqual(single.unsupported, []);
        for (const [index, [answer, expected]] of bands.entries()) {
          const after = Result.getOrThrow(
            runRules(
              rules,
              single,
              {
                outcomes: { BAND: nullOf("identifier", "single") },
                responses: { RESPONSE: floatValue(answer) },
              },
              drawStream("", ""),
            ),
          );

          assert.deepStrictEqual(
            after.outcomes["BAND"],
            identifierValue(expected),
            `case ${index}`,
          );
        }
      }),
  );

  it("an exit ends the run, at any depth, keeping what earlier rules set and skipping later ones", () => {
    const flat = Result.getOrThrow(
      runRules(
        [
          setOutcome("SCORE", base(floatValue(1))),
          { kind: "exit" },
          setOutcome("SCORE", base(floatValue(2))),
        ],
        lookupItem,
        lookupVariables,
        drawStream("", ""),
      ),
    );
    const nested = Result.getOrThrow(
      runRules(
        [
          condition([
            branchOf(base(booleanOf(true)), [
              setOutcome("SCORE", base(floatValue(1))),
              { kind: "exit" },
              setOutcome("SCORE", base(floatValue(3))),
            ]),
          ]),
          setOutcome("SCORE", base(floatValue(2))),
        ],
        lookupItem,
        lookupVariables,
        drawStream("", ""),
      ),
    );

    assert.deepStrictEqual(flat.outcomes["SCORE"], floatValue(1));
    assert.deepStrictEqual(nested.outcomes["SCORE"], floatValue(1));
  });

  it.effect("a nested fragment's rules run in its place", () =>
    Effect.gen(function* runsFragment() {
      const built = admittedItem(
        doc(
          "items/fragment.xml",
          el(
            "qti-assessment-item",
            [
              attr("identifier", "fragment"),
              attr("time-dependent", "false"),
              attr("title", "Fragment"),
            ],
            [
              el("qti-outcome-declaration", [
                attr("base-type", "float"),
                attr("cardinality", "single"),
                attr("identifier", "SCORE"),
              ]),
              el("qti-item-body", [], [paragraph]),
              el(
                "qti-response-processing",
                [],
                [
                  scoreElement("1"),
                  el(
                    "qti-response-processing-fragment",
                    [],
                    [
                      scoreElement("2"),
                      el("qti-response-processing-fragment", [], [el("qti-exit-response")]),
                      scoreElement("3"),
                    ],
                  ),
                  scoreElement("4"),
                ],
              ),
            ],
          ),
        ),
      );
      const rules = yield* Option.match(built.processing, {
        onNone: () => Effect.die("the fragments' processing does not run"),
        onSome: Effect.succeed,
      });
      const after = Result.getOrThrow(
        runRules(
          rules,
          built,
          { outcomes: { SCORE: floatValue(0) }, responses: {} },
          drawStream("", ""),
        ),
      );

      assert.deepStrictEqual(after.outcomes["SCORE"], floatValue(2));
    }),
  );

  it("a NULL of another type is stored as the outcome's typed NULL (spec §4.5)", () => {
    const after = Result.getOrThrow(
      runRules(
        [setOutcome("SCORE", variable("COUNT"))],
        lookupItem,
        lookupVariables,
        drawStream("", ""),
      ),
    );

    assert.deepStrictEqual(after.outcomes["SCORE"], nullOf("float", "single"));
  });

  it("a value of another type that is not NULL still fails OutcomeMismatchError at the evaluator", () => {
    const failure = failureOf(
      runRules(
        [setOutcome("SCORE", base(integerValue(1n)))],
        lookupItem,
        lookupVariables,
        drawStream("", ""),
      ),
    );

    assert.instanceOf(failure, OutcomeMismatchError);
    assert.deepStrictEqual(
      { _tag: failure._tag, actual: failure.actual, expected: failure.expected },
      { _tag: "OutcomeMismatchError", actual: "integer single", expected: "float single" },
    );
  });
});

describe("evaluateExpression", () => {
  it("is-null on NULL is true", () => {
    const value = Result.getOrThrow(
      evaluateExpression(
        { kind: "is-null", operands: [variable("RESPONSE")] },
        item,
        variablesOf(nullOf("identifier", "single")),
        drawStream("", ""),
      ),
    );

    assert.deepStrictEqual(value, booleanOf(true));
  });

  it("a match with a NULL side is NULL", () => {
    const value = Result.getOrThrow(
      evaluateExpression(
        { kind: "match", operands: [variable("OPEN"), base(identifierValue("A"))] },
        item,
        variablesOf(identifierValue("A")),
        drawStream("", ""),
      ),
    );

    assert.deepStrictEqual(value, nullOf("boolean", "single"));
  });

  it.effect("a match tells an integer correct response beyond 2^53 from its neighbour", () =>
    Effect.gen(function* exactIntegerMatch() {
      const built = admittedItem(
        doc(
          "items/exact.xml",
          el(
            "qti-assessment-item",
            [attr("identifier", "exact"), attr("time-dependent", "false"), attr("title", "Exact")],
            [
              el(
                "qti-response-declaration",
                [
                  attr("base-type", "integer"),
                  attr("cardinality", "single"),
                  attr("identifier", "RESPONSE"),
                ],
                [el("qti-correct-response", [], [el("qti-value", [], [text("9007199254740993")])])],
              ),
              el("qti-item-body", [], [paragraph]),
            ],
          ),
        ),
      );
      const matches = (answer: bigint) =>
        Effect.fromResult(
          evaluateExpression(
            {
              kind: "match",
              operands: [
                variable("RESPONSE"),
                { identifier: "RESPONSE", kind: "correct", operands: [] },
              ],
            },
            built,
            {
              outcomes: {},
              responses: {
                RESPONSE: {
                  baseType: "integer",
                  cardinality: "single",
                  values: [{ baseType: "integer", value: answer }],
                },
              },
            },
            drawStream("", ""),
          ),
        );

      assert.deepStrictEqual(yield* matches(2n ** 53n), booleanOf(false));
      assert.deepStrictEqual(yield* matches(2n ** 53n + 1n), booleanOf(true));
    }),
  );

  it("correct is the declared correct response, or NULL of the declared type", () => {
    const variables = variablesOf(identifierValue("A"));

    assert.deepStrictEqual(
      Result.getOrThrow(
        evaluateExpression(
          { identifier: "RESPONSE", kind: "correct", operands: [] },
          item,
          variables,
          drawStream("", ""),
        ),
      ),
      identifierValue("true"),
    );
    assert.deepStrictEqual(
      Result.getOrThrow(
        evaluateExpression(
          { identifier: "OPEN", kind: "correct", operands: [] },
          item,
          variables,
          drawStream("", ""),
        ),
      ),
      nullOf("identifier", "single"),
    );
  });

  it("a variable reads a response or an outcome", () => {
    const variables = variablesOf(identifierValue("A"), floatValue(0.75));

    assert.deepStrictEqual(
      Result.getOrThrow(
        evaluateExpression(variable("RESPONSE"), item, variables, drawStream("", "")),
      ),
      identifierValue("A"),
    );
    assert.deepStrictEqual(
      Result.getOrThrow(evaluateExpression(variable("SCORE"), item, variables, drawStream("", ""))),
      floatValue(0.75),
    );
  });

  it("a variable reads the built-in numAttempts as a single integer, the attempt count", () => {
    const variables: Variables = { ...variablesOf(identifierValue("A")), numAttempts: 3n };

    assert.deepStrictEqual(
      Result.getOrThrow(
        evaluateExpression(variable("numAttempts"), item, variables, drawStream("", "")),
      ),
      integerValue(3n),
    );
  });

  it("a variable reads a response or an outcome named numAttempts before the attempt count", () => {
    const plain = variablesOf(identifierValue("A"));
    const declared: Variables = {
      ...plain,
      numAttempts: 3n,
      outcomes: { ...plain.outcomes, numAttempts: floatValue(0.5) },
    };

    assert.deepStrictEqual(
      Result.getOrThrow(
        evaluateExpression(variable("numAttempts"), item, declared, drawStream("", "")),
      ),
      floatValue(0.5),
    );
  });

  it("says the record lacks numAttempts when the variables carry no attempt count", () => {
    const failure = failureOf(
      evaluateExpression(
        variable("numAttempts"),
        item,
        variablesOf(identifierValue("A")),
        drawStream("", ""),
      ),
    );

    assert.instanceOf(failure, UnknownIdentifierError);
    assert.deepStrictEqual(
      { _tag: failure._tag, holder: failure.holder, identifier: failure.identifier },
      { _tag: "UnknownIdentifierError", holder: "record", identifier: "numAttempts" },
    );
  });

  it("refuses a variable named like an Object.prototype member", () => {
    const failure = failureOf(
      evaluateExpression(
        variable("constructor"),
        item,
        variablesOf(identifierValue("A")),
        drawStream("", ""),
      ),
    );

    assert.instanceOf(failure, UnknownIdentifierError);
    assert.deepStrictEqual(
      { _tag: failure._tag, identifier: failure.identifier, role: failure.role },
      { _tag: "UnknownIdentifierError", identifier: "constructor", role: "variable" },
    );
  });

  it("says the record lacks a variable the variables hold no value of", () => {
    const failure = failureOf(
      evaluateExpression(
        variable("MISSING"),
        item,
        variablesOf(identifierValue("A")),
        drawStream("", ""),
      ),
    );

    assert.instanceOf(failure, UnknownIdentifierError);
    assert.deepStrictEqual(
      {
        _tag: failure._tag,
        holder: failure.holder,
        identifier: failure.identifier,
        role: failure.role,
      },
      { _tag: "UnknownIdentifierError", holder: "record", identifier: "MISSING", role: "variable" },
    );
    assert.include(failure.message, JSON.stringify("MISSING"));
    assert.include(failure.message, "item record");
  });
});

describe("map-response and map-response-point of a response with no mapping", () => {
  it("refuses to map a response with no mapping", () => {
    const failure = failureOf(
      evaluateExpression(
        { identifier: "OPEN", kind: "map-response", operands: [] },
        item,
        variablesOf(identifierValue("A")),
        drawStream("", ""),
      ),
    );

    assert.instanceOf(failure, UnmappedResponseError);
    assert.deepStrictEqual(
      { _tag: failure._tag, identifier: failure.identifier },
      { _tag: "UnmappedResponseError", identifier: "OPEN" },
    );
  });

  it("refuses to map a point response with no area mapping, naming qti-area-mapping", () => {
    const failure = failureOf(
      evaluateExpression(
        { identifier: "UNMAPPED", kind: "map-response-point", operands: [] },
        item,
        variablesOf(identifierValue("A")),
        drawStream("", ""),
      ),
    );

    assert.instanceOf(failure, UnmappedResponseError);
    assert.deepStrictEqual(
      { _tag: failure._tag, identifier: failure.identifier, mapping: failure.mapping },
      { _tag: "UnmappedResponseError", identifier: "UNMAPPED", mapping: "qti-area-mapping" },
    );
  });
});

describe("a set of the built-in completionStatus, which holds four values (reading 213)", () => {
  it("stores each of completed, incomplete, not_attempted and unknown", () => {
    for (const status of ["completed", "incomplete", "not_attempted", "unknown"]) {
      const after = Result.getOrThrow(
        runRules(
          [setOutcome("completionStatus", base(identifierValue(status)))],
          lookupItem,
          lookupVariables,
          drawStream("", ""),
        ),
      );

      assert.deepStrictEqual(after.outcomes["completionStatus"], identifierValue(status), status);
    }
  });

  it("fails a set to an identifier outside the four, naming the value and the four", () => {
    const failure = failureOf(
      runRules(
        [setOutcome("completionStatus", base(identifierValue("finished")))],
        lookupItem,
        lookupVariables,
        drawStream("", ""),
      ),
    );

    assert.instanceOf(failure, OutcomeMismatchError);
    assert.deepStrictEqual(
      { actual: failure.actual, expected: failure.expected, identifier: failure.identifier },
      {
        actual: 'single identifier "finished"',
        expected: "single identifier, one of completed, incomplete, not_attempted, unknown",
        identifier: "completionStatus",
      },
    );
  });

  it("fails a set to NULL, and a lookup, whose built-in has no table and so gives NULL", () => {
    for (const rule of [
      setOutcome("completionStatus", { kind: "null", operands: [] }),
      lookupOutcome("completionStatus", base(integerValue(1n))),
    ]) {
      const failure = failureOf(runRules([rule], lookupItem, lookupVariables, drawStream("", "")));

      assert.instanceOf(failure, OutcomeMismatchError);
      assert.strictEqual(failure.actual, "NULL");
    }
  });
});
