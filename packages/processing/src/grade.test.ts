import { assert, describe, it } from "@effect/vitest";
import { compileItemWith, compileTestWith } from "#processing/compile/document.ts";
import { valuesDigest } from "#processing/digest.ts";
import { restartBudget } from "#processing/engine.ts";
import {
  gradeAnswerWith,
  gradeSittingWith,
  proofOf,
  templateDefaultsWith,
} from "#processing/grade.ts";
import type { ItemSession } from "#processing/grade.ts";
import { customOperators } from "#processing/operators/custom.ts";
import { logicOperators } from "#processing/operators/logic.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import type { CompiledItem } from "#processing/program.ts";
import { takeWith } from "#processing/session.ts";
import type { Take } from "#processing/session.ts";
import { processingSeed } from "#processing/stream.ts";
import { element, text } from "#processing/test/run.ts";
import { single, textValue } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";
import type { XmlElement } from "#processing/xml.ts";

const table = Object.freeze({ ...customOperators, ...logicOperators, ...valuesOperators });

const digest = Object.freeze({ sha256: "1".repeat(64) });

const seed = processingSeed("decision", "package", "q1");

const noTake: Take = Object.freeze({
  correct: new Map(),
  defaults: new Map(),
  templates: new Map(),
});

/**
 * A `qti-value`.
 *
 * @param written - Its text.
 * @returns The element.
 */
const value = (written: string): XmlElement => element("qti-value", {}, [text(written)]);

/**
 * A `qti-base-value`.
 *
 * @param base - Its base type.
 * @param written - Its text.
 * @returns The element.
 */
const literal = (base: string, written: string): XmlElement =>
  element("qti-base-value", { "base-type": base }, [text(written)]);

/**
 * A `qti-variable`.
 *
 * @param identifier - The variable.
 * @returns The element.
 */
const variable = (identifier: string): XmlElement => element("qti-variable", { identifier }, []);

/**
 * A `qti-set-outcome-value`.
 *
 * @param identifier - The outcome.
 * @param expression - Its expression.
 * @returns The element.
 */
const setOutcome = (identifier: string, expression: XmlElement): XmlElement =>
  element("qti-set-outcome-value", { identifier }, [expression]);

/**
 * Compile an item of a boolean response `RESPONSE`, a float `SCORE`, an integer `COUNT`, an
 * identifier `GRADE` with an interpolation table, and the given processing.
 *
 * @param adaptive - Whether the item is adaptive.
 * @param children - Its processing elements.
 * @returns The compiled item.
 */
const itemOf = (adaptive: boolean, children: readonly XmlElement[]): CompiledItem => {
  const compiled = compileItemWith(
    element("qti-assessment-item", { adaptive: String(adaptive), identifier: "q1" }, [
      element(
        "qti-response-declaration",
        { "base-type": "boolean", cardinality: "single", identifier: "RESPONSE" },
        [element("qti-correct-response", {}, [value("true")])],
      ),
      element(
        "qti-outcome-declaration",
        { "base-type": "float", cardinality: "single", identifier: "SCORE", "normal-maximum": "2" },
        [],
      ),
      element(
        "qti-outcome-declaration",
        { "base-type": "integer", cardinality: "single", identifier: "COUNT" },
        [],
      ),
      element(
        "qti-outcome-declaration",
        { "base-type": "identifier", cardinality: "single", identifier: "GRADE" },
        [
          element("qti-interpolation-table", { "default-value": "F" }, [
            element(
              "qti-interpolation-table-entry",
              { "source-value": "1.5", "target-value": "A" },
              [],
            ),
            element(
              "qti-interpolation-table-entry",
              { "source-value": "0.5", "target-value": "C" },
              [],
            ),
          ]),
        ],
      ),
      element(
        "qti-template-declaration",
        { "base-type": "boolean", cardinality: "single", identifier: "FLAG" },
        [element("qti-default-value", {}, [value("false")])],
      ),
      ...children,
    ]),
    digest,
    table,
  );

  return compiled.ok ? compiled.value : assert.fail(compiled.refusal.detail);
};

/**
 * Response processing that scores a true response 2, a false one 0.5, and sets GRADE from SCORE.
 */
const scoring = element("qti-response-processing", {}, [
  element("qti-response-condition", {}, [
    element("qti-response-if", {}, [
      variable("RESPONSE"),
      setOutcome("SCORE", literal("float", "2")),
    ]),
    element("qti-response-else", {}, [setOutcome("SCORE", literal("float", "0.5"))]),
  ]),
  element("qti-lookup-outcome-value", { identifier: "GRADE" }, [variable("SCORE")]),
]);

/**
 * A session before its first attempt.
 *
 * @param take - Its take.
 * @returns The session.
 */
const fresh = (take: Take): ItemSession => ({
  duration: 12,
  numAttempts: 0n,
  prior: { kind: "none" },
  seed,
  take,
});

/**
 * Grade an answer of a boolean response.
 *
 * @param item - The item.
 * @param response - The response's value.
 * @param session - The session.
 * @returns The grade or the failure.
 */
const answer = (item: CompiledItem, response: Value, session: ItemSession) =>
  gradeAnswerWith(table, {
    context: new Map(),
    evaluations: new Map(),
    item,
    readAt: { microseconds: 5n },
    responses: {
      at: { microseconds: 4n },
      kind: "save",
      values: new Map([["RESPONSE", response]]),
    },
    session,
    validate: false,
  });

/**
 * An item whose processing sets its completionStatus to incomplete.
 *
 * @param adaptive - Whether it is adaptive.
 * @returns The item.
 */
const counting = (adaptive: boolean): CompiledItem =>
  itemOf(adaptive, [
    element("qti-response-processing", {}, [
      setOutcome("completionStatus", literal("identifier", "incomplete")),
    ]),
  ]);

describe("response processing", () => {
  it("runs rules in order: a condition's first true branch, a lookup's first entry at most its value (§5.72), credit and marks against the correct response (D5)", () => {
    const item = itemOf(false, [scoring]);

    const right = answer(item, single("boolean", true), fresh(noTake));
    if (!("result" in right) || right.result.kind !== "done") {
      return assert.fail("graded");
    }

    assert.deepStrictEqual(right.result.outcomes.get("SCORE"), single("float", 2));
    assert.deepStrictEqual(right.result.outcomes.get("GRADE"), textValue("identifier", "A"));
    assert.deepStrictEqual(right.result.outcomes.get("COUNT"), single("integer", 0n));
    assert.deepStrictEqual(right.result.credit, { earned: 2, kind: "full", maximum: 2 });
    assert.deepStrictEqual(right.result.marks.get("RESPONSE"), [
      { copies: 1, mark: "right", place: 0, value: single("boolean", true) },
    ]);
    assert.strictEqual(right.result.numAttempts, 1n);
    assert.deepStrictEqual(right.result.completionStatus, textValue("identifier", "unknown"));

    const wrong = answer(item, single("boolean", false), fresh(noTake));
    if (!("result" in wrong) || wrong.result.kind !== "done") {
      return assert.fail("graded");
    }

    assert.deepStrictEqual(wrong.result.outcomes.get("GRADE"), textValue("identifier", "C"));
    assert.deepStrictEqual(wrong.result.credit, { earned: 0.5, kind: "partial", maximum: 2 });
    assert.deepStrictEqual(wrong.result.marks.get("RESPONSE"), [
      { copies: 1, mark: "wrong", place: 0, value: single("boolean", false) },
      { copies: 1, mark: "missed", place: 0, value: single("boolean", true) },
    ]);
  });

  it("proves what it graded: the item's program, the save's instant and its values' digest, the read's instant (G5 §4)", () => {
    const item = itemOf(false, [scoring]);

    const graded = answer(item, single("boolean", true), fresh(noTake));
    if (!("result" in graded)) {
      return assert.fail("graded");
    }

    assert.deepStrictEqual(proofOf(graded), {
      prior: { kind: "none" },
      program: digest,
      readAt: { microseconds: 5n },
      responses: [
        {
          digest: valuesDigest(new Map([["RESPONSE", single("boolean", true)]])),
          saved: { at: { microseconds: 4n }, kind: "save" },
        },
      ],
    });
  });

  it("fails the run on a set of a value of another type, and of completionStatus outside its four values, NULL included (reading `completion-status-values`)", () => {
    const mistyped = itemOf(false, [
      element("qti-response-processing", {}, [setOutcome("SCORE", literal("integer", "1"))]),
    ]);

    const failed = answer(mistyped, single("boolean", true), fresh(noTake));
    assert.deepStrictEqual("failure" in failed ? failed.failure.kind : undefined, "set-type");

    const status = itemOf(false, [
      element("qti-response-processing", {}, [
        setOutcome("completionStatus", element("qti-null", {}, [])),
      ]),
    ]);

    const statusFailed = answer(status, single("boolean", true), fresh(noTake));
    assert.deepStrictEqual(
      "failure" in statusFailed ? statusFailed.failure.kind : undefined,
      "completion-status",
    );
  });

  it("ends the whole run at qti-exit-response, inside a condition too (§4.6)", () => {
    const item = itemOf(false, [
      element("qti-response-processing", {}, [
        setOutcome("SCORE", literal("float", "1")),
        element("qti-response-condition", {}, [
          element("qti-response-if", {}, [
            literal("boolean", "true"),
            element("qti-exit-response", {}, []),
          ]),
        ]),
        setOutcome("SCORE", literal("float", "9")),
      ]),
    ]);

    const graded = answer(item, single("boolean", true), fresh(noTake));
    assert.deepStrictEqual(
      "result" in graded && graded.result.kind === "done"
        ? graded.result.outcomes.get("SCORE")
        : undefined,
      single("float", 1),
    );
  });

  it("carries an adaptive item's outcomes from its last processed attempt, and resets a non-adaptive item's (§5.7)", () => {
    const prior = {
      at: { microseconds: 1n },
      kind: "processed",
      outcomes: new Map<string, Value>([
        ["SCORE", single("float", 7)],
        ["completionStatus", textValue("identifier", "incomplete")],
      ]),
    } as const;
    const second: ItemSession = { ...fresh(noTake), numAttempts: 1n, prior };
    const adaptive = answer(counting(true), single("boolean", true), second);

    const reset = answer(counting(false), single("boolean", true), second);
    assert.deepStrictEqual(
      "result" in adaptive && adaptive.result.kind === "done"
        ? adaptive.result.outcomes.get("SCORE")
        : undefined,
      single("float", 7),
    );
    assert.deepStrictEqual(
      "result" in reset && reset.result.kind === "done"
        ? reset.result.outcomes.get("SCORE")
        : undefined,
      single("float", 0),
    );
    assert.strictEqual(
      "result" in adaptive && adaptive.result.kind === "done"
        ? adaptive.result.numAttempts
        : undefined,
      2n,
    );
  });
});

describe("template processing", () => {
  it("sets template values at the take, and after spending 100 restarts on a false constraint uses the declared values and continues (reading `null-results` item 7)", () => {
    const item = itemOf(false, [
      element("qti-template-processing", {}, [
        element("qti-set-template-value", { identifier: "FLAG" }, [literal("boolean", "true")]),
        element("qti-template-constraint", {}, [literal("boolean", "false")]),
        element("qti-set-correct-response", { identifier: "RESPONSE" }, [
          literal("boolean", "false"),
        ]),
      ]),
    ]);
    assert.strictEqual(restartBudget, 100);

    const take = takeWith(table, item, seed, new Map(), new Map());
    assert.isFalse("failure" in take);
    if ("failure" in take) {
      return;
    }

    assert.deepStrictEqual(take.templates.get("FLAG"), single("boolean", false));
    assert.deepStrictEqual(take.correct.get("RESPONSE"), single("boolean", false));
  });

  it("starts a template variable at the test's template default (§5.152)", () => {
    const item = itemOf(false, []);

    const take = takeWith(
      table,
      item,
      seed,
      new Map([["FLAG", single("boolean", true)]]),
      new Map(),
    );
    assert.deepStrictEqual(
      "templates" in take ? take.templates.get("FLAG") : undefined,
      single("boolean", true),
    );
  });
});

describe("a sitting", () => {
  it("grades a default submission on the responses' defaults, then the test's outcome processing over them from its defaults, reading a member's weighted outcome (§5.102, §7.47.2)", () => {
    const item = itemOf(false, [scoring]);

    const compiled = compileTestWith(
      element("qti-assessment-test", { identifier: "t" }, [
        element(
          "qti-outcome-declaration",
          { "base-type": "float", cardinality: "single", identifier: "TOTAL" },
          [],
        ),
        element("qti-test-part", { identifier: "p" }, [
          element("qti-assessment-item-ref", { href: "q1.xml", identifier: "q1" }, [
            element("qti-weight", { identifier: "W", value: "3" }, []),
          ]),
        ]),
        element("qti-outcome-processing", {}, [
          setOutcome(
            "TOTAL",
            element("qti-variable", { identifier: "q1.SCORE", "weight-identifier": "W" }, []),
          ),
        ]),
      ]),
      digest,
      new Map([["q1", item]]),
      table,
    );

    const test = compiled.ok ? compiled.value : assert.fail("compiled");

    const graded = gradeSittingWith(table, {
      carried: [],
      closing: [
        {
          evaluations: new Map(),
          item,
          ref: { identifier: "q1", occurrence: 1n },
          responses: { kind: "default" },
          session: fresh(noTake),
        },
      ],
      context: new Map(),
      readAt: { microseconds: 3_000_000n },
      startedAt: { microseconds: 1_000_000n },
      test,
      testSeed: seed,
    });
    if (!("kind" in graded) || graded.kind !== "done") {
      return assert.fail("graded");
    }

    assert.deepStrictEqual(graded.test.get("TOTAL"), single("float", 1.5));
    assert.deepStrictEqual(graded.members[0]?.read.saved, { kind: "default" });
  });
});

describe("a test's template defaults", () => {
  it("evaluates each item ref's template default in the test's scope before the item's take (§5.152)", () => {
    const item = itemOf(false, []);
    const compiled = compileTestWith(
      element("qti-assessment-test", { identifier: "t" }, [
        element("qti-test-part", { identifier: "p" }, [
          element("qti-assessment-item-ref", { href: "q1.xml", identifier: "q1" }, [
            element("qti-template-default", { "template-identifier": "FLAG" }, [
              literal("boolean", "true"),
            ]),
          ]),
        ]),
      ]),
      digest,
      new Map([["q1", item]]),
      table,
    );
    const test = compiled.ok ? compiled.value : assert.fail("compiled");
    const defaults = templateDefaultsWith(table, test, "q1", new Map(), seed);
    assert.deepStrictEqual(
      "failure" in defaults ? undefined : defaults.get("FLAG"),
      single("boolean", true),
    );
  });
});
