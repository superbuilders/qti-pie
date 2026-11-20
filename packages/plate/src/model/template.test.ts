import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import type { SourceDocument, SourceElement } from "#plate/document/source.ts";
import type { Expression, TemplateBranch, TemplateRule } from "#plate/model/expression.ts";
import { admittedItem } from "#plate/test/admitted.ts";
import { integer } from "#plate/test/fixtures.ts";
import { integerElement, truth, variableElement } from "#plate/test/processing.ts";
import { attr, doc, el, paragraph, text } from "#plate/test/source.ts";

/**
 * The path of the template processing, which every path in these tests starts with.
 */
const processing = "qti-assessment-item/qti-template-processing";

/**
 * Construct an item whose template processing holds some rules, beside the template variables `T`
 * and `U` (single integers), the response `RESPONSE` (a single integer), the outcome `SCORE` (a
 * single float) and any further declarations.
 *
 * @param rules The children of the `qti-template-processing`.
 * @param declarations The declarations after `U`'s, in document order; none by default.
 * @param after What follows the item body, such as a `qti-response-processing`; nothing by default.
 * @returns The document at `items/test.xml`.
 */
const templated = (
  rules: readonly SourceElement[],
  declarations: readonly SourceElement[] = [],
  after: readonly SourceElement[] = [],
): SourceDocument =>
  doc(
    "items/test.xml",
    el(
      "qti-assessment-item",
      [attr("identifier", "item"), attr("time-dependent", "false"), attr("title", "Item")],
      [
        el("qti-response-declaration", [
          attr("base-type", "integer"),
          attr("cardinality", "single"),
          attr("identifier", "RESPONSE"),
        ]),
        ...declarations.filter((declaration) => declaration.local === "qti-response-declaration"),
        el("qti-outcome-declaration", [
          attr("base-type", "float"),
          attr("cardinality", "single"),
          attr("identifier", "SCORE"),
        ]),
        ...["T", "U"].map((identifier) =>
          el("qti-template-declaration", [
            attr("base-type", "integer"),
            attr("cardinality", "single"),
            attr("identifier", identifier),
          ]),
        ),
        ...declarations.filter((declaration) => declaration.local !== "qti-response-declaration"),
        el("qti-template-processing", [], rules),
        el("qti-item-body", [], [paragraph]),
        ...after,
      ],
    ),
  );

/**
 * Construct a `qti-base-value` of a boolean.
 *
 * @param value The boolean, as written.
 * @returns The expression element.
 */
const booleanElement = (value: "false" | "true"): SourceElement =>
  el("qti-base-value", [attr("base-type", "boolean")], [text(value)]);

/**
 * Construct a rule element that names its target and holds some operands, such as a
 * `qti-set-template-value`.
 *
 * @param local The rule's name.
 * @param identifier The variable it sets.
 * @param operands Its children.
 * @returns The rule element.
 */
const setting = (
  local: string,
  identifier: string,
  ...operands: readonly SourceElement[]
): SourceElement => el(local, [attr("identifier", identifier)], operands);

/**
 * Construct a `qti-field-value` of a field of `QTI_CONTEXT`, the built-in context variable, a
 * fresh element at each call, since a document's paths are keyed by element.
 *
 * @returns The expression element.
 */
const contextField = (): SourceElement =>
  el("qti-field-value", [attr("field-identifier", "f")], [variableElement("QTI_CONTEXT")]);

/**
 * The expression a `qti-base-value` of an integer reads as.
 *
 * @param value The integer.
 * @returns The expression.
 */
const integerOf = (value: bigint): Expression => ({
  kind: "base-value",
  operands: [],
  value: integer(value),
});

/**
 * The expression a `qti-base-value` of a boolean reads as.
 *
 * @param value The boolean.
 * @returns The expression.
 */
const booleanOf = (value: boolean): Expression => ({
  kind: "base-value",
  operands: [],
  value: truth(value),
});

/**
 * The expression a `qti-variable` reads as.
 *
 * @param identifier The variable it reads.
 * @returns The expression.
 */
const variableOf = (identifier: string): Expression => ({
  identifier,
  kind: "variable",
  operands: [],
  weightIdentifier: Option.none(),
});

/**
 * Construct a branch of a template condition.
 *
 * @param when Its condition.
 * @param then The rules it runs.
 * @returns The branch.
 */
const branch = (when: Expression, rules: readonly TemplateRule[]): TemplateBranch => ({
  rules,
  when,
});

/**
 * Construct the rule that sets the template variable `T`.
 *
 * @param value The integer it sets.
 * @returns The rule.
 */
const setT = (value: bigint): TemplateRule => ({
  expression: integerOf(value),
  identifier: "T",
  kind: "set-template-value",
});

describe("templateRules", () => {
  it("reads qti-set-template-value, qti-set-correct-response and qti-set-default-value into their target and expression", () => {
    const built = admittedItem(
      templated([
        setting("qti-set-template-value", "T", integerElement("3")),
        setting("qti-set-correct-response", "RESPONSE", variableElement("T")),
        setting("qti-set-default-value", "RESPONSE", integerElement("0")),
      ]),
    );

    assert.deepStrictEqual(built.templateProcessing, {
      kind: "runs",
      rules: [
        setT(3n),
        { expression: variableOf("T"), identifier: "RESPONSE", kind: "set-correct-response" },
        { expression: integerOf(0n), identifier: "RESPONSE", kind: "set-default-value" },
      ],
    });
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("reads a qti-template-condition into its branches in order and its qti-template-else as otherwise", () => {
    const built = admittedItem(
      templated([
        el(
          "qti-template-condition",
          [],
          [
            el(
              "qti-template-if",
              [],
              [
                booleanElement("false"),
                setting("qti-set-template-value", "T", integerElement("1")),
              ],
            ),
            el(
              "qti-template-else-if",
              [],
              [
                booleanElement("true"),
                setting("qti-set-template-value", "T", integerElement("2")),
                el("qti-exit-template"),
              ],
            ),
            el(
              "qti-template-else",
              [],
              [
                el(
                  "qti-template-condition",
                  [],
                  [el("qti-template-if", [], [booleanElement("true")])],
                ),
                setting("qti-set-template-value", "T", integerElement("3")),
              ],
            ),
          ],
        ),
      ]),
    );

    assert.deepStrictEqual(built.templateProcessing, {
      kind: "runs",
      rules: [
        {
          branches: [
            branch(booleanOf(false), [setT(1n)]),
            branch(booleanOf(true), [setT(2n), { kind: "exit-template" }]),
          ],
          kind: "template-condition",
          otherwise: Option.some<readonly TemplateRule[]>([
            {
              branches: [branch(booleanOf(true), [])],
              kind: "template-condition",
              otherwise: Option.none(),
            },
            setT(3n),
          ]),
        },
      ],
    });
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("reads a qti-template-constraint into its expression and a qti-exit-template into an exit, in document order", () => {
    const built = admittedItem(
      templated([
        setting("qti-set-template-value", "T", integerElement("4")),
        el(
          "qti-template-constraint",
          [],
          [el("qti-match", [], [variableElement("T"), integerElement("4")])],
        ),
        el("qti-exit-template"),
        setting("qti-set-template-value", "U", integerElement("5")),
      ]),
    );

    assert.deepStrictEqual(built.templateProcessing, {
      kind: "runs",
      rules: [
        setT(4n),
        {
          expression: { kind: "match", operands: [variableOf("T"), integerOf(4n)] },
          kind: "template-constraint",
        },
        { kind: "exit-template" },
        { expression: integerOf(5n), identifier: "U", kind: "set-template-value" },
      ],
    });
  });

  it("marks record-set at a qti-set-default-value and a qti-set-correct-response of a record response, in place of variable:<identifier>, and runs no template processing", () => {
    const built = admittedItem(
      templated(
        [
          setting("qti-set-default-value", "ANSWER", el("qti-null")),
          setting("qti-set-template-value", "T", integerElement("1")),
          setting("qti-set-correct-response", "ANSWER", el("qti-null")),
        ],
        [
          el("qti-response-declaration", [
            attr("cardinality", "record"),
            attr("identifier", "ANSWER"),
          ]),
        ],
      ),
    );

    assert.deepStrictEqual(built.templateProcessing, { kind: "stalled" });
    assert.deepStrictEqual(built.unsupported, [
      { feature: "record-set", path: `${processing}/qti-set-default-value`, shown: "mark" },
      { feature: "record-set", path: `${processing}/qti-set-correct-response`, shown: "mark" },
    ]);
  });

  it("holds a read of QTI_CONTEXT through qti-field-value, never record-set, in template and in response processing, both of which run", () => {
    const built = admittedItem(
      templated(
        [setting("qti-set-template-value", "T", contextField())],
        [],
        [
          el(
            "qti-response-processing",
            [],
            [setting("qti-set-outcome-value", "SCORE", contextField())],
          ),
        ],
      ),
    );

    assert.deepStrictEqual(
      [built.templateProcessing.kind === "runs", Option.isSome(built.processing)],
      [true, true],
    );
    assert.deepStrictEqual(built.unsupported, []);
  });
});
