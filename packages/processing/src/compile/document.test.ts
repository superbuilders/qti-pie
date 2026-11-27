import { assert, describe, it } from "@effect/vitest";
import {
  compileItemWith,
  compileTestWith,
  publishedTemplate,
} from "#processing/compile/document.ts";
import { customOperators } from "#processing/operators/custom.ts";
import { logicOperators } from "#processing/operators/logic.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import { operatorTable } from "#processing/operators/table.ts";
import type { CompiledItem } from "#processing/program.ts";
import { element, text } from "#processing/test/run.ts";
import { nullOf, single, textValue } from "#processing/value.ts";
import type { Single } from "#processing/value.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * A single identifier.
 *
 * @param written - The identifier.
 * @returns Its value.
 */
const identifierOf = (written: string): Single => {
  const read = textValue("identifier", written);

  return read.kind === "single" ? read : assert.fail("an identifier is not empty");
};

const table = Object.freeze({ ...customOperators, ...logicOperators, ...valuesOperators });

const digest = Object.freeze({ sha256: "0".repeat(64) });

/**
 * A `qti-value`.
 *
 * @param written - Its text.
 * @returns The element.
 */
const value = (written: string): XmlElement => element("qti-value", {}, [text(written)]);

/**
 * A boolean `qti-base-value`.
 *
 * @param holds - The boolean.
 * @returns The element.
 */
const truth = (holds: boolean): XmlElement =>
  element("qti-base-value", { "base-type": "boolean" }, [text(String(holds))]);

/**
 * A float `qti-base-value`.
 *
 * @param written - The float.
 * @returns The element.
 */
const float = (written: string): XmlElement =>
  element("qti-base-value", { "base-type": "float" }, [text(written)]);

/**
 * An item of declarations and processing.
 *
 * @param children - The item's children.
 * @returns The item.
 */
const item = (children: readonly XmlElement[]): XmlElement =>
  element("qti-assessment-item", { adaptive: "false", identifier: "q1" }, children);

const declarations: readonly XmlElement[] = [
  element(
    "qti-response-declaration",
    { "base-type": "identifier", cardinality: "multiple", identifier: "RESPONSE" },
    [
      element("qti-correct-response", {}, [value("A"), value("B")]),
      element("qti-mapping", { "default-value": "-1", "lower-bound": "0" }, [
        element("qti-map-entry", { "map-key": "A", "mapped-value": "2" }, []),
      ]),
    ],
  ),
  element(
    "qti-outcome-declaration",
    { "base-type": "float", cardinality: "single", identifier: "SCORE" },
    [element("qti-default-value", {}, [value("0.5")])],
  ),
  element(
    "qti-outcome-declaration",
    { "base-type": "identifier", cardinality: "single", identifier: "GRADE" },
    [
      element("qti-interpolation-table", { "default-value": "F" }, [
        element(
          "qti-interpolation-table-entry",
          { "source-value": "0.9", "target-value": "A" },
          [],
        ),
        element(
          "qti-interpolation-table-entry",
          { "include-boundary": "false", "source-value": "0.5", "target-value": "C" },
          [],
        ),
      ]),
    ],
  ),
  element(
    "qti-template-declaration",
    { "base-type": "string", cardinality: "single", identifier: "T" },
    [element("qti-default-value", {}, [value("")])],
  ),
];

/**
 * Compile the item of {@link declarations} with an empty response processing of these attributes.
 *
 * @param attributes - The `qti-response-processing`'s attributes.
 * @returns The compiled item, or the refusal.
 */
const processed = (attributes: Readonly<Record<string, string>>) =>
  compileItemWith(
    item([...declarations, element("qti-response-processing", attributes, [])]),
    digest,
    operatorTable,
  );

describe("the document compiler", () => {
  it("reads declarations with QTI's defaults: a mapping's bounds, an entry's case sensitivity, a table's boundaries, an empty string NULL", () => {
    const compiled = compileItemWith(item(declarations), digest, table);
    assert.isTrue(compiled.ok);

    const { declarations: declared } = compiled.value;

    const response = declared.get("RESPONSE");
    assert.deepStrictEqual(response?.mapping, {
      defaultValue: -1,
      entries: [{ caseSensitive: false, key: identifierOf("A"), value: 2 }],
      lowerBound: 0,
      upperBound: Number.POSITIVE_INFINITY,
    });
    assert.deepStrictEqual(
      response?.default,
      nullOf({ base: "identifier", cardinality: "multiple" }),
    );
    assert.deepStrictEqual(declared.get("SCORE")?.default, single("float", 0.5));
    assert.deepStrictEqual(declared.get("GRADE")?.lookup, {
      defaultValue: identifierOf("F"),
      entries: [
        { includeBoundary: true, source: 0.9, target: identifierOf("A") },
        { includeBoundary: false, source: 0.5, target: identifierOf("C") },
      ],
      kind: "interpolation",
    });
    assert.deepStrictEqual(
      declared.get("T")?.default,
      nullOf({ base: "string", cardinality: "single" }),
    );
    assert.deepStrictEqual(declared.get("numAttempts")?.type, {
      base: "integer",
      cardinality: "single",
    });
  });

  it("compiles response rules in order, a fragment spliced where it stands and a condition's branches kept (§4.6, reading `fragment-placement`)", () => {
    const processing = element("qti-response-processing", {}, [
      element("qti-response-condition", {}, [
        element("qti-response-if", {}, [truth(false), element("qti-exit-response", {}, [])]),
        element("qti-response-else-if", {}, [
          truth(true),
          element("qti-set-outcome-value", { identifier: "SCORE" }, [float("1")]),
        ]),
        element("qti-response-else", {}, [
          element("qti-set-outcome-value", { identifier: "completionStatus" }, [
            element("qti-base-value", { "base-type": "identifier" }, [text("completed")]),
          ]),
        ]),
      ]),
      element("qti-response-processing-fragment", {}, [
        element("qti-lookup-outcome-value", { identifier: "GRADE" }, [
          element("qti-variable", { identifier: "SCORE" }, []),
        ]),
      ]),
    ]);

    const compiled = compileItemWith(item([...declarations, processing]), digest, table);
    assert.isTrue(compiled.ok);

    const rules = compiled.value.responseProcessing;
    assert.deepStrictEqual(
      rules.map((rule) => rule.kind),
      ["condition", "lookup-outcome"],
    );

    const [condition] = rules;
    assert.strictEqual(condition?.kind === "condition" ? condition.branches.length : 0, 2);
    assert.strictEqual(condition?.kind === "condition" ? condition.otherwise.length : 0, 1);
  });

  it("refuses a set of a variable the item does not declare as an outcome, a lookup of an outcome with no table, and a nested constraint", () => {
    const set = compileItemWith(
      item([
        ...declarations,
        element("qti-response-processing", {}, [
          element("qti-set-outcome-value", { identifier: "RESPONSE" }, [float("1")]),
        ]),
      ]),
      digest,
      table,
    );
    assert.strictEqual(set.ok ? undefined : set.refusal.code, "unknown-identifier");

    const lookup = compileItemWith(
      item([
        ...declarations,
        element("qti-response-processing", {}, [
          element("qti-lookup-outcome-value", { identifier: "SCORE" }, [float("1")]),
        ]),
      ]),
      digest,
      table,
    );
    assert.strictEqual(lookup.ok ? undefined : lookup.refusal.code, "unknown-identifier");

    const nested = compileItemWith(
      item([
        ...declarations,
        element("qti-template-processing", {}, [
          element("qti-template-condition", {}, [
            element("qti-template-if", {}, [
              truth(true),
              element("qti-template-constraint", {}, [truth(true)]),
            ]),
          ]),
        ]),
      ]),
      digest,
      table,
    );
    assert.strictEqual(nested.ok ? undefined : nested.refusal.code, "element");
  });

  it("names a published template under either prefix, with or without .xml, and nothing else (reading `built-in-templates`)", () => {
    assert.isDefined(
      publishedTemplate("https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"),
    );
    assert.isDefined(
      publishedTemplate(
        " https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response.xml\n",
      ),
    );
    assert.isUndefined(
      publishedTemplate("https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/unknown"),
    );
    assert.isUndefined(publishedTemplate("http://example.com/match_correct"));
  });

  it("refuses a response processing it cannot resolve, an unknown template's URI and any template-location, and compiles a published template to its rules (reading `built-in-templates`)", () => {
    const prefix = "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/";

    const unknown = processed({ template: `${prefix}unknown` });
    assert.strictEqual(unknown.ok ? undefined : unknown.refusal.code, "unknown-template");

    const located = processed({
      template: `${prefix}match_correct`,
      "template-location": "https://example.org/match_correct.xml",
    });
    assert.strictEqual(located.ok ? undefined : located.refusal.code, "template-location");

    const matched = processed({ template: `${prefix}match_correct` });
    assert.isTrue(
      matched.ok && matched.value.responseProcessing.length > 0,
      matched.ok ? "no rules" : matched.refusal.detail,
    );
  });

  it("resolves a test's prefixed references to its items' variables, a numbered occurrence and a weight among them (reading `numbered-reference`, §7.47.2)", () => {
    const q1 = compileItemWith(item(declarations), digest, table);

    const compiledItem: CompiledItem = q1.ok ? q1.value : assert.fail("compiled");

    const test = element("qti-assessment-test", { identifier: "t" }, [
      element(
        "qti-outcome-declaration",
        { "base-type": "float", cardinality: "single", identifier: "TOTAL" },
        [],
      ),
      element("qti-test-part", { identifier: "p" }, [
        element("qti-assessment-section", { identifier: "s" }, [
          element(
            "qti-assessment-item-ref",
            { category: "a b", href: "q1.xml", identifier: "q1" },
            [element("qti-weight", { identifier: "W", value: "2" }, [])],
          ),
        ]),
      ]),
      element("qti-outcome-processing", {}, [
        element("qti-set-outcome-value", { identifier: "TOTAL" }, [
          element("qti-variable", { identifier: "q1.SCORE", "weight-identifier": "W" }, []),
        ]),
        element("qti-set-outcome-value", { identifier: "TOTAL" }, [
          element("qti-variable", { identifier: "q1.2.SCORE" }, []),
        ]),
      ]),
    ]);

    const compiled = compileTestWith(test, digest, new Map([["q1", compiledItem]]), table);
    assert.isTrue(compiled.ok);

    const { itemRefs, outcomeProcessing } = compiled.value;
    assert.deepStrictEqual(itemRefs[0]?.categories, ["a", "b"]);
    assert.deepStrictEqual(itemRefs[0]?.sections, ["s"]);

    const reads = outcomeProcessing.flatMap((rule) =>
      rule.kind === "set-outcome" && rule.expression.kind === "variable"
        ? [rule.expression.variable]
        : [],
    );
    assert.deepStrictEqual(reads, [
      {
        item: "q1",
        occurrence: undefined,
        role: "outcome",
        scope: "member",
        type: { base: "float", cardinality: "single" },
        variable: "SCORE",
        weight: "W",
      },
      {
        item: "q1",
        occurrence: 2n,
        role: "outcome",
        scope: "member",
        type: { base: "float", cardinality: "single" },
        variable: "SCORE",
        weight: undefined,
      },
    ]);
  });
});

/**
 * An item of a Select Point bound to a point response with a percentage area mapping.
 *
 * @param imageAttributes - The image's attributes.
 * @returns The compiled item, or the refusal's code.
 */
const pointItem = (imageAttributes: Readonly<Record<string, string>>) =>
  compileItemWith(
    element("qti-assessment-item", { adaptive: "false", identifier: "p" }, [
      element(
        "qti-response-declaration",
        { "base-type": "point", cardinality: "single", identifier: "RESPONSE" },
        [
          element("qti-area-mapping", {}, [
            element(
              "qti-area-map-entry",
              Object.fromEntries([
                ["coords", "50%,50%,25%"],
                ["mapped-value", "1"],
                ["shape", "circle"],
              ]),
              [],
            ),
          ]),
        ],
      ),
      element("qti-item-body", {}, [
        element("qti-select-point-interaction", { "response-identifier": "RESPONSE" }, [
          {
            attributes: Object.entries(imageAttributes).map(([local, written]) => ({
              local,
              namespace: "",
              value: written,
            })),
            children: [],
            kind: "element",
            local: "img",
            namespace: "http://www.w3.org/1999/xhtml",
          },
        ]),
      ]),
    ]),
    digest,
    table,
  );

describe("an area mapping's areas", () => {
  it("resolves a percentage against the size of the image its response's interaction shows (reading `circle-percentage-radius`)", () => {
    const compiled = pointItem({ height: "100", src: "a.png", width: "300" });
    assert.isTrue(compiled.ok);
    assert.deepStrictEqual(
      compiled.value.declarations.get("RESPONSE")?.areaMapping?.entries[0]?.area,
      {
        centre: { x: 150n, y: 50n },
        denominator: 1n,
        kind: "circle",
        radius: 25n,
      },
    );
  });

  it("refuses a percentage whose image has no known size", () => {
    const compiled = pointItem({ src: "a.png" });
    assert.strictEqual(compiled.ok ? undefined : compiled.refusal.code, "attribute");
  });
});
