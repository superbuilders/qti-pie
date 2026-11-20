import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import type { Expression } from "#plate/model/expression.ts";
import { admittedItem } from "#plate/test/admitted.ts";
import type { Value } from "#plate/model/values.ts";
import {
  assertKindType,
  baseValueElement,
  expressionElement,
  integerElement,
  integerOutcome,
  outcomeDeclaration,
  outItem,
  processed,
  processingItem,
  responseDeclaration,
  setOutcomeElement,
  truth,
  variableElement,
} from "#plate/test/processing.ts";
import { attr, el } from "#plate/test/source.ts";

/**
 * Construct a `qti-base-value` of an identifier.
 *
 * @param name The identifier.
 * @returns The element.
 */
const identifierElement = (name: string): SourceElement => baseValueElement("identifier", name);

/**
 * Construct the `qti-base-value` expression of an identifier, as the reader reads
 * {@link identifierElement}.
 *
 * @param name The identifier.
 * @returns The expression.
 */
const identifierExpression = (name: string): Expression => ({
  kind: "base-value",
  operands: [],
  value: {
    baseType: "identifier",
    cardinality: "single",
    values: [{ baseType: "identifier", value: name }],
  },
});

/**
 * Construct a value of base type identifier.
 *
 * @param cardinality Its cardinality.
 * @param names Its identifiers, in order; none for NULL.
 * @returns The value.
 */
const identifiers = (cardinality: Value["cardinality"], ...names: readonly string[]): Value => ({
  baseType: "identifier",
  cardinality,
  values: names.map((value) => ({ baseType: "identifier", value })),
});

/**
 * Construct the `qti-custom-operator` an item's processing may hold, whose value plate never
 * knows.
 *
 * @returns The element.
 */
const customElement = (): SourceElement =>
  expressionElement("custom-operator", [attr("class", "x")]);

/**
 * The declarations of the item {@link runItem} builds: a multiple identifier response `RESPONSE`,
 * the integer outcomes `i` (2) and `n` (2) the corpus's `qti-index` and `qti-repeat` name, and one
 * outcome per expression it sets.
 */
const runDeclarations: readonly SourceElement[] = [
  responseDeclaration("RESPONSE", "identifier", "multiple"),
  integerOutcome("i", "2"),
  integerOutcome("n", "2"),
  outcomeDeclaration("BUILT", "identifier", "multiple"),
  outcomeDeclaration("SEQUENCE", "identifier", "ordered"),
  outcomeDeclaration("REPEATED", "identifier", "ordered"),
  outcomeDeclaration("SIZE", "integer"),
  outcomeDeclaration("PICKED", "identifier"),
  outcomeDeclaration("CHOSEN", "identifier"),
  outcomeDeclaration("HELD", "boolean"),
  outcomeDeclaration("LEFT", "identifier", "multiple"),
  outcomeDeclaration("PART", "boolean"),
  outcomeDeclaration("EMPTY", "boolean"),
];

/**
 * An item whose processing holds every landed containers kind, reading the response and the
 * variables `i` and `n`.
 */
const runItem = processingItem(runDeclarations, [
  setOutcomeElement(
    "BUILT",
    expressionElement("multiple", [], [identifierElement("A"), variableElement("RESPONSE")]),
  ),
  setOutcomeElement(
    "SEQUENCE",
    expressionElement("ordered", [], [identifierElement("C"), identifierElement("A")]),
  ),
  setOutcomeElement(
    "REPEATED",
    expressionElement(
      "repeat",
      [attr("number-repeats", "n")],
      [identifierElement("A"), identifierElement("B")],
    ),
  ),
  setOutcomeElement("SIZE", expressionElement("container-size", [], [variableElement("RESPONSE")])),
  setOutcomeElement(
    "PICKED",
    expressionElement(
      "index",
      [attr("n", "i")],
      [expressionElement("ordered", [], [identifierElement("C"), identifierElement("D")])],
    ),
  ),
  setOutcomeElement("CHOSEN", expressionElement("random", [], [variableElement("RESPONSE")])),
  setOutcomeElement(
    "HELD",
    expressionElement("member", [], [identifierElement("B"), variableElement("RESPONSE")]),
  ),
  setOutcomeElement(
    "LEFT",
    expressionElement("delete", [], [identifierElement("B"), variableElement("RESPONSE")]),
  ),
  setOutcomeElement(
    "PART",
    expressionElement(
      "contains",
      [],
      [
        variableElement("RESPONSE"),
        expressionElement("multiple", [], [identifierElement("B"), identifierElement("B")]),
      ],
    ),
  ),
  setOutcomeElement(
    "EMPTY",
    expressionElement(
      "is-null",
      [],
      [expressionElement("delete", [], [identifierElement("Z"), variableElement("RESPONSE")])],
    ),
  ),
]);

/**
 * Construct an integer container.
 *
 * @param cardinality Its cardinality.
 * @param members Its members.
 * @returns The value.
 */
const integerContainer = (
  cardinality: "multiple" | "ordered",
  ...members: readonly bigint[]
): Value => ({
  baseType: "integer",
  cardinality,
  values: members.map((value) => ({ baseType: "integer", value })),
});

describe("the containers family's reader specs and kind rules", () => {
  it("build an item whose inline processing holds qti-repeat, qti-index and qti-random, their operands, references and literals read, with processing some", () => {
    const built = admittedItem(
      processingItem(
        [
          outcomeDeclaration("REPEATED", "identifier", "ordered"),
          outcomeDeclaration("PICKED", "identifier"),
          outcomeDeclaration("CHOSEN", "identifier"),
          integerOutcome("n", "2"),
        ],
        [
          setOutcomeElement(
            "REPEATED",
            expressionElement(
              "repeat",
              [attr("number-repeats", "n")],
              [identifierElement("A"), expressionElement("ordered")],
            ),
          ),
          setOutcomeElement(
            "PICKED",
            expressionElement(
              "index",
              [attr("n", " 2 ")],
              [expressionElement("ordered", [], [identifierElement("B")])],
            ),
          ),
          setOutcomeElement(
            "CHOSEN",
            expressionElement(
              "random",
              [],
              [expressionElement("ordered", [], [identifierElement("C")])],
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
            kind: "repeat",
            numberRepeats: { _tag: "ref", identifier: "n" },
            operands: [identifierExpression("A"), { kind: "ordered", operands: [] }],
          },
          identifier: "REPEATED",
          kind: "set-outcome",
        },
        {
          expression: {
            kind: "index",
            n: { _tag: "literal", value: 2n },
            operands: [{ kind: "ordered", operands: [identifierExpression("B")] }],
          },
          identifier: "PICKED",
          kind: "set-outcome",
        },
        {
          expression: {
            kind: "random",
            operands: [{ kind: "ordered", operands: [identifierExpression("C")] }],
          },
          identifier: "CHOSEN",
          kind: "set-outcome",
        },
      ]),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it.effect(
    "run every landed containers kind in an item's processing, reading i and n as the corpus does",
    () =>
      Effect.gen(function* runsContainers() {
        const after = yield* processed(runItem, {
          RESPONSE: identifiers("multiple", "B", "C", "B"),
        });
        assert.isTrue(Option.isSome(after), "the processing ran");

        const outcome = (identifier: string): Value =>
          Option.getOrThrow(
            Option.flatMapNullishOr(after, (variables) => variables.outcomes[identifier]),
          );
        const response = { baseType: "identifier", cardinality: "multiple" } as const;
        const single = { baseType: "identifier", cardinality: "single" } as const;
        const ordered = { baseType: "identifier", cardinality: "ordered" } as const;

        assert.deepStrictEqual(outcome("BUILT"), identifiers("multiple", "A", "B", "C", "B"));
        assertKindType(outcome("BUILT"), "multiple", [single, response]);
        assert.deepStrictEqual(outcome("SEQUENCE"), identifiers("ordered", "C", "A"));
        assertKindType(outcome("SEQUENCE"), "ordered", [single, single]);
        assert.deepStrictEqual(outcome("REPEATED"), identifiers("ordered", "A", "B", "A", "B"));
        assertKindType(outcome("REPEATED"), "repeat", [single, single]);
        assert.deepStrictEqual(outcome("SIZE"), {
          baseType: "integer",
          cardinality: "single",
          values: [{ baseType: "integer", value: 3n }],
        });
        assertKindType(outcome("SIZE"), "container-size", [response]);
        assert.deepStrictEqual(outcome("PICKED"), identifiers("single", "D"));
        assertKindType(outcome("PICKED"), "index", [ordered]);
        // `processed` runs under the default stream, `drawStream("", "")`, and CHOSEN takes the
        // run's first draw, 0xaa7855e1. `drawBelow` among RESPONSE's 3 members keeps its low 2
        // bits, 1, so qti-random picks the member at position 1 (from 0) of B, C, B: C.
        assert.deepStrictEqual(outcome("CHOSEN"), identifiers("single", "C"));
        assertKindType(outcome("CHOSEN"), "random", [response]);
        assert.deepStrictEqual(outcome("HELD"), truth(true));
        assertKindType(outcome("HELD"), "member", [single, response]);
        assert.deepStrictEqual(outcome("LEFT"), identifiers("multiple", "C"));
        assertKindType(outcome("LEFT"), "delete", [single, response]);
        assert.deepStrictEqual(outcome("PART"), truth(true));
        assertKindType(outcome("PART"), "contains", [response, response]);
        assert.deepStrictEqual(outcome("EMPTY"), truth(false));
      }),
  );

  it.effect(
    "run the containers kinds over a NULL response: container-size 0, member and contains NULL, delete and random NULL",
    () =>
      Effect.gen(function* runsOverNull() {
        const after = yield* processed(runItem, { RESPONSE: identifiers("multiple") });
        const outcome = (identifier: string): Value =>
          Option.getOrThrow(
            Option.flatMapNullishOr(after, (variables) => variables.outcomes[identifier]),
          );

        assert.deepStrictEqual(outcome("BUILT"), identifiers("multiple", "A"));
        assert.deepStrictEqual(outcome("SIZE"), {
          baseType: "integer",
          cardinality: "single",
          values: [{ baseType: "integer", value: 0n }],
        });
        assert.deepStrictEqual(outcome("HELD"), {
          baseType: "boolean",
          cardinality: "single",
          values: [],
        });
        assert.deepStrictEqual(outcome("LEFT"), identifiers("multiple"));
        assert.deepStrictEqual(outcome("CHOSEN"), identifiers("single"));
        assert.deepStrictEqual(outcome("PART"), {
          baseType: "boolean",
          cardinality: "single",
          values: [],
        });
        assert.deepStrictEqual(outcome("EMPTY"), truth(true));
      }),
  );

  it.effect(
    "score an item whose container holds a qti-custom-operator beside a typed operand: the operator's NULL is ignored and the container holds the typed operand's values (reading 212)",
    () =>
      Effect.gen(function* scoresUntypedContainers() {
        const cases: readonly (readonly [string, Value, SourceElement])[] = [
          [
            "qti-multiple",
            integerContainer("multiple", 1n),
            expressionElement("multiple", [], [customElement(), integerElement("1")]),
          ],
          [
            "qti-index of a qti-ordered",
            {
              baseType: "integer",
              cardinality: "single",
              values: [{ baseType: "integer", value: 1n }],
            },
            expressionElement(
              "index",
              [attr("n", "1")],
              [expressionElement("ordered", [], [customElement(), integerElement("1")])],
            ),
          ],
          [
            "qti-ordered",
            integerContainer("ordered", 1n),
            expressionElement("ordered", [], [integerElement("1"), customElement()]),
          ],
          [
            "qti-repeat",
            integerContainer("ordered", 1n, 1n),
            expressionElement(
              "repeat",
              [attr("number-repeats", "2")],
              [customElement(), integerElement("1")],
            ),
          ],
          [
            "qti-delete of a qti-multiple",
            integerContainer("multiple", 2n),
            expressionElement(
              "delete",
              [],
              [
                integerElement("1"),
                expressionElement("multiple", [], [customElement(), integerElement("2")]),
              ],
            ),
          ],
          [
            "qti-multiple of a qti-sum, which the operator's NULL makes NULL",
            integerContainer("multiple", 2n),
            expressionElement(
              "multiple",
              [],
              [
                expressionElement("sum", [], [customElement(), integerElement("1")]),
                integerElement("2"),
              ],
            ),
          ],
        ];

        for (const [label, expected, expression] of cases) {
          const document = outItem(expected.baseType, expression, [], expected.cardinality);
          const built = admittedItem(document);
          const ran = yield* Effect.result(processed(document, {}));

          assert.deepStrictEqual(
            built.unsupported.map((mark) => mark.feature),
            ["qti-custom-operator"],
            label,
          );
          assert.isTrue(Option.isSome(built.processing), `${label}: the processing runs`);
          assert.deepStrictEqual(
            ran.pipe(
              Result.map((after) =>
                Option.flatMapNullishOr(after, (variables) => variables.outcomes["OUT"]),
              ),
            ),
            Result.succeed(Option.some(expected)),
            label,
          );
        }
      }),
  );

  it("reads a qti-field-value of a record response, its field-identifier with its outer whitespace gone, and keeps the processing with no mark", () => {
    const built = admittedItem(
      outItem(
        "string",
        expressionElement(
          "field-value",
          [attr("field-identifier", " stringValue ")],
          [variableElement("ANSWER")],
        ),
        [
          el("qti-response-declaration", [
            attr("cardinality", "record"),
            attr("identifier", "ANSWER"),
          ]),
        ],
      ),
    );

    assert.deepStrictEqual(built.unsupported, []);
    assert.deepStrictEqual(
      built.processing,
      Option.some([
        {
          expression: {
            fieldIdentifier: "stringValue",
            kind: "field-value",
            operands: [
              {
                identifier: "ANSWER",
                kind: "variable",
                operands: [],
                weightIdentifier: Option.none(),
              },
            ],
          },
          identifier: "OUT",
          kind: "set-outcome",
        },
      ]),
    );
  });
});
