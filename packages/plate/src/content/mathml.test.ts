import { assert, describe, it } from "@effect/vitest";
import type { MathChild, MathNode } from "#plate/content/mathml.ts";
import { mathmlNamespace } from "#plate/document/source.ts";
import type { SourceChild, SourceElement } from "#plate/document/source.ts";
import { admittedItem } from "#plate/test/admitted.ts";
import type { BodyNode } from "#plate/model/item.ts";
import { redactItem } from "#plate/redact/walk.ts";
import { integer } from "#plate/test/fixtures.ts";
import { shownToCandidate, underRecord } from "#plate/test/page.ts";
import { recordOf } from "#plate/test/records.ts";
import { attr, doc, el, text } from "#plate/test/source.ts";

/**
 * Construct a MathML element.
 *
 * @param local Its local name.
 * @param children Its children, none by default.
 * @returns The element, in the MathML namespace.
 */
const math = (local: string, children: readonly SourceChild[] = []): SourceElement =>
  el(local, [], children, mathmlNamespace);

/**
 * Construct a template declaration of a single integer whose default is given.
 *
 * @param identifier Its identifier.
 * @param value Its default, as written.
 * @param mathVariable Its `math-variable`, absent unless given.
 * @returns The declaration.
 */
const template = (identifier: string, value: string, mathVariable?: string): SourceElement =>
  el(
    "qti-template-declaration",
    [
      attr("base-type", "integer"),
      attr("cardinality", "single"),
      attr("identifier", identifier),
      ...(mathVariable === undefined ? [] : [attr("math-variable", mathVariable)]),
    ],
    [el("qti-default-value", [], [el("qti-value", [], [text(value)])])],
  );

/**
 * Give the MathML trees a redacted body holds, in document order.
 *
 * @param nodes The body nodes.
 * @returns Each `math` element's tree.
 */
const mathIn = (nodes: readonly BodyNode[]): readonly MathNode[] =>
  nodes.flatMap((node): readonly MathNode[] => {
    if (node.kind === "content" && node.element === "math") {
      return [node.node];
    }

    return node.kind === "element" ? mathIn(node.children) : [];
  });

/**
 * Construct a MathML token as the model holds it.
 *
 * @param local Its local name.
 * @param content Its text.
 * @returns The token.
 */
const token = (local: string, content: string): MathChild<BodyNode> => ({
  attributes: [],
  children: [{ kind: "text", text: content }],
  kind: "element",
  local,
});

describe("MathML's template variables", () => {
  it("replaces each mi and ci naming a math-variable template variable with an mn or cn holding its value, and leaves every other token as written", () => {
    // The information model, section 2.3.3: "If mathVariable is set in a template variable's
    // declaration then all instances of 'mi' and 'ci' that match the name of the template variable
    // must be replaced by 'mn' and 'cn' respectively with the template variable's value as their
    // content." A token's content matches without the whitespace at its ends, which "is removed"
    // (MathML 3, section 2.1.7). `PLAIN` is a template variable with no `math-variable`, so its
    // token stays an `mi`.
    const built = admittedItem(
      doc(
        "items/calc.xml",
        el(
          "qti-assessment-item",
          [attr("identifier", "calc"), attr("time-dependent", "false"), attr("title", "Calc")],
          [
            template("CALC0", "7", "true"),
            template("PLAIN", "3"),
            el(
              "qti-item-body",
              [],
              [
                el(
                  "p",
                  [],
                  [
                    math("math", [
                      math("mi", [text(" CALC0 ")]),
                      math("mo", [text("+")]),
                      math("mi", [text("PLAIN")]),
                    ]),
                    math("math", [
                      math("apply", [
                        math("plus"),
                        math("ci", [text("CALC0")]),
                        math("cn", [text("1")]),
                      ]),
                    ]),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
    // The template values the database's take gives the item session (its record), which the page
    // shows: plate draws none.
    const record = recordOf({ templates: { CALC0: integer(7n), PLAIN: integer(3n) } });
    const trees = mathIn(redactItem(built, shownToCandidate, underRecord(record)).body);

    assert.deepStrictEqual(
      trees.map((tree) => tree.children),
      [
        [token("mn", "7"), token("mo", "+"), token("mi", "PLAIN")],
        [
          {
            attributes: [],
            children: [
              { attributes: [], children: [], kind: "element", local: "plus" },
              token("cn", "7"),
              token("cn", "1"),
            ],
            kind: "element",
            local: "apply",
          },
        ],
      ],
    );
  });
});
