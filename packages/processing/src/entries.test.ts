import { assert, describe, it } from "@effect/vitest";
import { compileItem, gradeAnswer } from "#processing/entries.ts";
import type { ItemSession } from "#processing/grade.ts";
import type { CompiledItem } from "#processing/program.ts";
import { processingSeed } from "#processing/stream.ts";
import { element, text } from "#processing/test/run.ts";
import { single, textValue } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";

/**
 * A choice item scored by the published match_correct template, its correct response `B`.
 */
const compiled = compileItem(
  element("qti-assessment-item", { adaptive: "false", identifier: "choice" }, [
    element(
      "qti-response-declaration",
      { "base-type": "identifier", cardinality: "single", identifier: "RESPONSE" },
      [element("qti-correct-response", {}, [element("qti-value", {}, [text("B")])])],
    ),
    element(
      "qti-outcome-declaration",
      { "base-type": "float", cardinality: "single", identifier: "SCORE" },
      [],
    ),
    element(
      "qti-response-processing",
      { template: "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct" },
      [],
    ),
  ]),
  Object.freeze({ sha256: "2".repeat(64) }),
);

const item: CompiledItem = compiled.ok ? compiled.value : assert.fail(compiled.refusal.detail);

const session: ItemSession = Object.freeze({
  duration: 3,
  numAttempts: 0n,
  prior: { kind: "none" } as const,
  seed: processingSeed("decision", "package", "choice"),
  take: {
    correct: new Map<string, Value>(),
    defaults: new Map<string, Value>(),
    templates: new Map<string, Value>(),
  },
});

/**
 * The SCORE an answer earns.
 *
 * @param response - The response's value.
 * @returns SCORE, or `undefined` where the grade is no Done item result.
 */
const scoreOf = (response: Value): Value | undefined => {
  const graded = gradeAnswer({
    context: new Map(),
    evaluations: new Map(),
    item,
    readAt: { microseconds: 2n },
    responses: {
      at: { microseconds: 1n },
      kind: "save",
      values: new Map([["RESPONSE", response]]),
    },
    session,
    validate: false,
  });

  return "result" in graded && graded.result.kind === "done"
    ? graded.result.outcomes.get("SCORE")
    : undefined;
};

describe("the bound entries", () => {
  it("compile a published template's item and grade it on the one operator table (reading `built-in-templates`)", () => {
    assert.deepStrictEqual(scoreOf(textValue("identifier", "B")), single("float", 1));
    assert.deepStrictEqual(scoreOf(textValue("identifier", "A")), single("float", 0));
  });
});
