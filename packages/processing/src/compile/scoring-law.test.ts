/**
 * The scoring law (the ruling of 2026-11-28: partial credit is kept and is declared by the item
 * alone; the grader infers, defaults and patches none): an item declares its response processing
 * (QTI 3.0.1 §5.113); a scored item declares a single numeric SCORE with a `normal-maximum` above 0
 * (§5.108), the one source of its credit, and bounds every mapping within it (§5.83); a multi-part
 * item writes inline rules that read every part; and a score the scoring reaches outside [0,
 * normal-maximum] is a failure, never a grade.
 */
import { assert, describe, it } from "@effect/vitest";
import { compileItem, gradeAnswer } from "#processing/entries.ts";
import type { ItemSession } from "#processing/grade.ts";
import { processingSeed } from "#processing/stream.ts";
import { element, text } from "#processing/test/run.ts";
import { textValue } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * A published template's URI.
 */
const template = (name: string): string =>
  `https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/${name}`;

/**
 * A text entry bound to a response.
 */
const entry = (response: string): XmlElement =>
  element("qti-text-entry-interaction", { "response-identifier": response }, []);

/**
 * A single string response keyed to a word, and its mapping, if any.
 */
const response = (identifier: string, key: string, mapping: readonly XmlElement[]): XmlElement =>
  element(
    "qti-response-declaration",
    { "base-type": "string", cardinality: "single", identifier },
    [element("qti-correct-response", {}, [element("qti-value", {}, [text(key)])]), ...mapping],
  );

/**
 * SCORE, with no normal-maximum.
 */
const bareScore: XmlElement = element(
  "qti-outcome-declaration",
  { "base-type": "float", cardinality: "single", identifier: "SCORE" },
  [],
);

/**
 * SCORE with a normal-maximum.
 */
const score = (maximum: string): XmlElement =>
  element(
    "qti-outcome-declaration",
    { "base-type": "float", cardinality: "single", identifier: "SCORE", "normal-maximum": maximum },
    [],
  );

/**
 * SCORE raised by 1 for each part whose response matches its key.
 */
const sumOf = (parts: readonly string[]): XmlElement =>
  element(
    "qti-response-processing",
    {},
    parts.map((part) =>
      element("qti-response-condition", {}, [
        element("qti-response-if", {}, [
          element("qti-match", {}, [
            element("qti-variable", { identifier: part }, []),
            element("qti-correct", { identifier: part }, []),
          ]),
          element("qti-set-outcome-value", { identifier: "SCORE" }, [
            element("qti-sum", {}, [
              element("qti-variable", { identifier: "SCORE" }, []),
              element("qti-base-value", { "base-type": "float" }, [text("1")]),
            ]),
          ]),
        ]),
      ]),
    ),
  );

/**
 * An item of declarations, a body and a response processing.
 */
const itemOf = (children: readonly XmlElement[], body: readonly XmlElement[]) =>
  compileItem(
    element("qti-assessment-item", { adaptive: "false", identifier: "law" }, [
      ...children,
      element("qti-item-body", {}, body),
    ]),
    { sha256: "7".repeat(64) },
  );

/**
 * The refusal code of a compile, or `ok`.
 */
const codeOf = (compiled: ReturnType<typeof itemOf>): string =>
  compiled.ok ? "ok" : compiled.refusal.code;

describe("the scoring law", () => {
  it("does not judge a writing item, whose verdict is an input (D8)", () => {
    const essay = element(
      "qti-response-declaration",
      { "base-type": "string", cardinality: "single", identifier: "RESPONSE" },
      [],
    );
    const compiled = itemOf(
      [essay, score("4")],
      [element("qti-extended-text-interaction", { "response-identifier": "RESPONSE" }, [])],
    );
    assert.strictEqual(compiled.ok ? compiled.value.maximum : undefined, 4);
  });

  it("refuses an item with no response processing, or one with neither rules nor a template (§5.113)", () => {
    assert.strictEqual(
      codeOf(itemOf([response("RESPONSE", "a", []), score("1")], [entry("RESPONSE")])),
      "no-response-processing",
    );
    assert.strictEqual(
      codeOf(
        itemOf(
          [response("RESPONSE", "a", []), score("1"), element("qti-response-processing", {}, [])],
          [entry("RESPONSE")],
        ),
      ),
      "no-response-processing",
    );
  });

  it("takes an all-or-nothing item's maximum from the constant it awards, and refuses a normal-maximum that is another (§5.108)", () => {
    const rp = element("qti-response-processing", { template: template("match_correct") }, []);
    assert.strictEqual(
      codeOf(itemOf([response("RESPONSE", "a", []), bareScore, rp], [entry("RESPONSE")])),
      "ok",
    );
    assert.strictEqual(
      codeOf(itemOf([response("RESPONSE", "a", []), score("1"), rp], [entry("RESPONSE")])),
      "ok",
    );
    assert.strictEqual(
      codeOf(itemOf([response("RESPONSE", "a", []), score("2"), rp], [entry("RESPONSE")])),
      "undeclared-scoring",
    );
  });

  it("refuses an item whose credit can be partial and whose SCORE declares no normal-maximum above 0 (§5.108)", () => {
    const declared = [response("A", "a", []), response("B", "b", [])];
    const body = [entry("A"), entry("B")];
    assert.strictEqual(
      codeOf(itemOf([...declared, bareScore, sumOf(["A", "B"])], body)),
      "undeclared-scoring",
    );
    assert.strictEqual(
      codeOf(itemOf([...declared, score("0"), sumOf(["A", "B"])], body)),
      "undeclared-scoring",
    );
    assert.strictEqual(codeOf(itemOf([...declared, score("2"), sumOf(["A", "B"])], body)), "ok");
  });

  it("refuses a single response's mapping whose default or mapped value leaves [0, maximum], its bounds never applying (§5.83, reading `mapping-bounds`)", () => {
    const rp = element("qti-response-processing", { template: template("map_response") }, []);
    const mapped = (defaultValue: string, value: string) =>
      codeOf(
        itemOf(
          [
            response("RESPONSE", "a", [
              element(
                "qti-mapping",
                { "default-value": defaultValue, "lower-bound": "0", "upper-bound": "1" },
                [element("qti-map-entry", { "map-key": "a", "mapped-value": value }, [])],
              ),
            ]),
            score("1"),
            rp,
          ],
          [entry("RESPONSE")],
        ),
      );
    assert.strictEqual(mapped("-1", "1"), "undeclared-scoring");
    assert.strictEqual(mapped("0", "2"), "undeclared-scoring");
    assert.strictEqual(mapped("0", "1"), "ok");
  });

  it("refuses a multi-part item scored by a template or by rules that leave a part unread, and admits one that reads every part", () => {
    const declared = [response("A", "a", []), response("B", "b", []), score("2")];
    const body = [entry("A"), entry("B")];
    assert.strictEqual(
      codeOf(
        itemOf(
          [
            ...declared,
            element("qti-response-processing", { template: template("match_correct") }, []),
          ],
          body,
        ),
      ),
      "undeclared-scoring",
    );
    assert.strictEqual(codeOf(itemOf([...declared, sumOf(["A"])], body)), "undeclared-scoring");
    assert.strictEqual(codeOf(itemOf([...declared, sumOf(["A", "B"])], body)), "ok");
  });

  it("fails a score its scoring reaches outside [0, normal-maximum], clamping none", () => {
    const compiled = itemOf(
      [response("A", "a", []), response("B", "b", []), score("1"), sumOf(["A", "B"])],
      [entry("A"), entry("B")],
    );
    const item = compiled.ok ? compiled.value : assert.fail(compiled.refusal.detail);
    const session: ItemSession = {
      duration: 1,
      numAttempts: 0n,
      prior: { kind: "none" },
      seed: processingSeed("d", "p", "law"),
      take: {
        correct: new Map<string, Value>(),
        defaults: new Map<string, Value>(),
        templates: new Map<string, Value>(),
      },
    };
    const graded = (a: string, b: string) =>
      gradeAnswer({
        answered: { item, kind: "item" },
        context: new Map(),
        evaluations: new Map(),
        readAt: { microseconds: 2n },
        responses: {
          at: { microseconds: 1n },
          kind: "save",
          values: new Map([
            ["A", textValue("string", a)],
            ["B", textValue("string", b)],
          ]),
        },
        session,
      });
    const half = graded("a", "x");
    assert.deepStrictEqual(
      "result" in half && half.result.kind === "done" ? half.result.credit : undefined,
      {
        earned: 1,
        kind: "full",
        maximum: 1,
      },
    );

    const both = graded("a", "b");
    assert.deepStrictEqual("failure" in both ? both.failure : undefined, {
      kind: "score-bound",
      maximum: 1,
      score: 2,
    });
  });
});
