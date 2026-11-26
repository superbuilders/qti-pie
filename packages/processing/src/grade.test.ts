import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect } from "effect";
import { compileItemOver, compileItemWith, compileTestWith } from "#processing/compile/document.ts";
import { valuesDigest } from "#processing/digest.ts";
import { restartBudget } from "#processing/engine.ts";
import {
  completePendingWith,
  gradeAnswerWith,
  gradeSittingWith,
  proofOf,
  templateDefaultsWith,
} from "#processing/grade.ts";
import type { ClosingMember, ItemSession, SittingInput, Submitted } from "#processing/grade.ts";
import { alphaDefinitionPrefix, recordedOperator } from "#processing/operator.ts";
import { operatorTable } from "#processing/operators/table.ts";
import type { CompiledItem } from "#processing/program.ts";
import { takeWith } from "#processing/session.ts";
import type { Take } from "#processing/session.ts";
import { processingSeed } from "#processing/stream.ts";
import { element, text } from "#processing/test/run.ts";
import { container, single, textValue } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";
import type { XmlElement } from "#processing/xml.ts";

const table = operatorTable;

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

    const { inputDigest, ...proof } = proofOf(graded);
    assert.strictEqual(inputDigest.sha256.length, 64);
    assert.deepStrictEqual(proof, {
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
      pending: [],
      readAt: { microseconds: 3_000_000n },
      startedAt: { microseconds: 1_000_000n },
      test,
      testSeed: seed,
      unpresented: [],
    });
    if (!("kind" in graded) || graded.kind !== "done") {
      return assert.fail("graded");
    }

    assert.deepStrictEqual(graded.test.get("TOTAL"), single("float", 1.5));
    assert.deepStrictEqual(graded.members[0]?.read.saved, { kind: "default" });
  });
});

/**
 * A test's outcome declaration.
 *
 * @param identifier - The outcome.
 * @param base - Its base type.
 * @param cardinality - Its cardinality.
 * @returns The element.
 */
const outcome = (identifier: string, base: string, cardinality: string): XmlElement =>
  element("qti-outcome-declaration", { "base-type": base, cardinality, identifier }, []);

/**
 * A closing member of the input-digest sitting.
 *
 * @param identifier - Its item ref.
 * @param session - Its session.
 * @param evaluations - The recorded answers in.
 * @returns The member.
 */
const closingOf = (
  identifier: string,
  session: ItemSession,
  evaluations: ReadonlyMap<number, Value>,
): ClosingMember => ({
  evaluations,
  item: itemOf(false, [scoring]),
  ref: { identifier, occurrence: 1n },
  responses: { kind: "default" },
  session,
});

/**
 * A sitting of two default submissions, q1 and q2, over a test of the two.
 *
 * @returns The sitting.
 */
const twoMemberSitting = (): SittingInput => {
  const item = itemOf(false, [scoring]);
  const compiled = compileTestWith(
    element("qti-assessment-test", { identifier: "t" }, [
      element("qti-test-part", { identifier: "p" }, [
        element("qti-assessment-item-ref", { href: "q1.xml", identifier: "q1" }, []),
        element("qti-assessment-item-ref", { href: "q2.xml", identifier: "q2" }, []),
      ]),
    ]),
    digest,
    new Map([
      ["q1", item],
      ["q2", item],
    ]),
    table,
  );

  return {
    carried: [],
    closing: [closingOf("q1", fresh(noTake), new Map()), closingOf("q2", fresh(noTake), new Map())],
    context: new Map(),
    pending: [],
    readAt: { microseconds: 3_000_000n },
    startedAt: { microseconds: 1_000_000n },
    test: compiled.ok ? compiled.value : assert.fail(compiled.refusal.detail),
    testSeed: seed,
    unpresented: [],
  };
};

/**
 * The input digest a sitting's grade proves.
 *
 * @param input - The sitting.
 * @returns The digest's hex, or `undefined` where the grade failed.
 */
const inputDigestOf = (input: SittingInput): string | undefined => {
  const graded = gradeSittingWith(table, input);

  return "failure" in graded ? undefined : proofOf(graded).inputDigest.sha256;
};

/**
 * How a sitting departs from {@link twoMemberSitting}: each field a completion may not drift, and
 * the two it may (the recorded answers in, the order the members come in).
 */
interface Departure {
  readonly context: boolean;
  readonly duration: boolean;
  readonly evaluations: boolean;
  readonly numAttempts: boolean;
  readonly pending: boolean;
  readonly readAt: boolean;
  readonly reordered: boolean;
  readonly startedAt: boolean;
  readonly testSeed: boolean;
  readonly unpresented: boolean;
}

/**
 * Every departure: each of its ten fields either way.
 */
const departures: Gen<Departure> = (source) => {
  const bit = (): boolean => int(0, 1)(source) === 1;

  return {
    context: bit(),
    duration: bit(),
    evaluations: bit(),
    numAttempts: bit(),
    pending: bit(),
    readAt: bit(),
    reordered: bit(),
    startedAt: bit(),
    testSeed: bit(),
    unpresented: bit(),
  };
};

/**
 * The sitting a departure makes of a base sitting.
 *
 * @param base - The sitting.
 * @param departure - How it departs.
 * @returns The departed sitting.
 */
const departed = (base: SittingInput, departure: Departure): SittingInput => {
  const q1 = closingOf(
    "q1",
    departure.duration ? { ...fresh(noTake), duration: 13 } : fresh(noTake),
    departure.evaluations ? new Map([[7, single("float", 1)]]) : new Map(),
  );
  const q2 = closingOf(
    "q2",
    departure.numAttempts ? { ...fresh(noTake), numAttempts: 1n } : fresh(noTake),
    new Map(),
  );
  const pendingQ2 = departure.pending && !departure.unpresented;
  const members = departure.unpresented || pendingQ2 ? [q1] : [q1, q2];

  return {
    ...base,
    closing: departure.reordered ? members.toReversed() : members,
    context: departure.context ? new Map([["C", single("integer", 1n)]]) : base.context,
    pending: pendingQ2 ? [q2] : [],
    readAt: departure.readAt ? { microseconds: 3_000_001n } : base.readAt,
    startedAt: departure.startedAt ? { microseconds: 0n } : base.startedAt,
    testSeed: departure.testSeed ? { key: `${seed.key}0` } : base.testSeed,
    unpresented: departure.unpresented
      ? [{ item: itemOf(false, [scoring]), ref: { identifier: "q2", occurrence: 1n } }]
      : [],
  };
};

describe("a sitting's input digest (completePending's check)", () => {
  it.effect(
    "is the base's exactly when the sitting departs from it in nothing but its recorded answers and its members' order",
    (ctx) => {
      const base = twoMemberSitting();
      const at = inputDigestOf(base);

      return searched(
        ctx,
        exhaust(
          {
            box: "each of ten fields of a two-member sitting either way",
            caseHang: Duration.seconds(30),
            coverage: noCoverage,
            generator: departures,
            literal: (departure) => JSON.stringify(departure),
            oracle: { kind: "specification", name: "the digest names every field but evaluations" },
            suite: "processing/grade/input-digest",
          },
          (departure) =>
            Effect.sync(() => {
              const drifted =
                departure.context ||
                departure.duration ||
                departure.numAttempts ||
                (departure.pending && !departure.unpresented) ||
                departure.readAt ||
                departure.startedAt ||
                departure.testSeed ||
                departure.unpresented;
              assert.strictEqual(inputDigestOf(departed(base, departure)) === at, !drifted);
            }),
        ),
      );
    },
  );
});

/**
 * A recorded operator of the tests': an essay's score, out of its maximum.
 */
const essayScore = recordedOperator({
  definition: `${alphaDefinitionPrefix}test-essay-score`,
  maximum: 1,
  operands: [
    { form: "expression", name: "essay", type: { base: "string", cardinality: "single" } },
    { form: "expression", name: "maximum", type: { base: "float", cardinality: "single" } },
  ],
  result: { base: "float", cardinality: "single" },
});

/**
 * An essay item: its `SCORE` the recorded score of its `ESSAY`, out of 1.
 *
 * @returns The compiled item.
 */
const essayItem = (): CompiledItem => {
  const compiled = compileItemOver(
    element("qti-assessment-item", { adaptive: "false", identifier: "q1" }, [
      element(
        "qti-response-declaration",
        { "base-type": "string", cardinality: "single", identifier: "ESSAY" },
        [],
      ),
      element(
        "qti-outcome-declaration",
        { "base-type": "float", cardinality: "single", identifier: "SCORE" },
        [],
      ),
      element("qti-response-processing", {}, [
        setOutcome(
          "SCORE",
          element("qti-custom-operator", { definition: essayScore.definition }, [
            variable("ESSAY"),
            literal("float", "1"),
          ]),
        ),
      ]),
    ]),
    digest,
    table,
    (definition) => (definition === essayScore.definition ? essayScore : undefined),
  );

  return compiled.ok ? compiled.value : assert.fail(compiled.refusal.detail);
};

describe("a sitting with a pending member", () => {
  it("grades Pending while an essay's evaluation is not in, and completes to the outcomes the essay answered after its evaluation gives (D7)", () => {
    const item = essayItem();
    const compiled = compileTestWith(
      element("qti-assessment-test", { identifier: "t" }, [
        outcome("TOTAL", "float", "single"),
        element("qti-test-part", { identifier: "p" }, [
          element("qti-assessment-item-ref", { href: "q1.xml", identifier: "q1" }, []),
        ]),
        element("qti-outcome-processing", {}, [setOutcome("TOTAL", variable("q1.SCORE"))]),
      ]),
      digest,
      new Map([["q1", item]]),
      table,
    );
    const test = compiled.ok ? compiled.value : assert.fail(compiled.refusal.detail);
    const essay: Submitted = {
      kind: "posted",
      values: new Map([["ESSAY", textValue("string", "An essay.")]]),
    };
    const ref = { identifier: "q1", occurrence: 1n };
    const member = (evaluations: ReadonlyMap<number, Value>): ClosingMember => ({
      evaluations,
      item,
      ref,
      responses: essay,
      session: fresh(noTake),
    });
    const sitting: SittingInput = {
      carried: [],
      closing: [],
      context: new Map(),
      pending: [member(new Map())],
      readAt: { microseconds: 3_000_000n },
      startedAt: { microseconds: 1_000_000n },
      test,
      testSeed: seed,
      unpresented: [],
    };

    const pendingGrade = gradeSittingWith(table, sitting);
    if ("failure" in pendingGrade || pendingGrade.kind !== "pending") {
      return assert.fail("pending");
    }

    const [demand, ...others] = pendingGrade.demands;
    if (demand === undefined) {
      return assert.fail("a demand");
    }

    assert.deepStrictEqual(others, []);
    assert.deepStrictEqual(demand.ref, ref);
    assert.strictEqual(demand.definition, essayScore.definition);

    const evaluations = new Map([[demand.place, single("float", 0.75)]]);
    const completed = completePendingWith(table, {
      ...sitting,
      pending: [member(evaluations)],
      pendingGrade,
    });
    if ("failure" in completed || completed.kind !== "done") {
      return assert.fail("completed");
    }

    const answered = gradeAnswerWith(table, {
      context: new Map(),
      evaluations,
      item,
      readAt: { microseconds: 2_000_000n },
      responses: essay,
      session: fresh(noTake),
      validate: false,
    });
    if ("failure" in answered || answered.result.kind !== "done") {
      return assert.fail("answered");
    }

    const carried = gradeSittingWith(table, {
      ...sitting,
      carried: [
        {
          duration: fresh(noTake).duration,
          item,
          numAttempts: answered.result.numAttempts,
          outcomes: answered.result.outcomes,
          ref,
          responses: answered.responses,
          take: noTake,
        },
      ],
      pending: [],
    });
    if ("failure" in carried || carried.kind !== "done") {
      return assert.fail("carried");
    }

    assert.deepStrictEqual(completed.test.get("TOTAL"), single("float", 0.75));
    assert.deepStrictEqual(completed.test, carried.test);

    const drifted = completePendingWith(table, {
      ...sitting,
      pending: [member(evaluations)],
      pendingGrade,
      readAt: { microseconds: 3_000_001n },
    });
    assert.strictEqual(
      "failure" in drifted ? drifted.failure.kind : undefined,
      "completion-mismatch",
    );
  });
});

describe("a sitting's members", () => {
  it("reads a member's built-ins and counts a selected, unpresented member at its declared start, in the test's order (§2.2.2, §2.11.2)", () => {
    const item = itemOf(false, [scoring]);
    const compiled = compileTestWith(
      element("qti-assessment-test", { identifier: "t" }, [
        outcome("AATT", "integer", "single"),
        outcome("ADUR", "float", "single"),
        outcome("STATUS", "identifier", "single"),
        outcome("SELECTED", "integer", "single"),
        outcome("SCORES", "float", "multiple"),
        outcome("MAXTOTAL", "float", "single"),
        element("qti-test-part", { identifier: "p" }, [
          element("qti-assessment-item-ref", { href: "q2.xml", identifier: "q2" }, []),
          element("qti-assessment-item-ref", { href: "q1.xml", identifier: "q1" }, []),
        ]),
        element("qti-outcome-processing", {}, [
          setOutcome("AATT", variable("q1.numAttempts")),
          setOutcome("ADUR", variable("q1.duration")),
          setOutcome("STATUS", variable("q2.completionStatus")),
          setOutcome("SELECTED", element("qti-number-selected", {}, [])),
          setOutcome(
            "SCORES",
            element("qti-test-variables", { "variable-identifier": "SCORE" }, []),
          ),
          setOutcome(
            "MAXTOTAL",
            element("qti-sum", {}, [
              element("qti-outcome-maximum", { "outcome-identifier": "SCORE" }, []),
            ]),
          ),
        ]),
      ]),
      digest,
      new Map([
        ["q1", item],
        ["q2", item],
      ]),
      table,
    );
    const test = compiled.ok ? compiled.value : assert.fail(compiled.refusal.detail);

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
      pending: [],
      readAt: { microseconds: 3_000_000n },
      startedAt: { microseconds: 1_000_000n },
      test,
      testSeed: seed,
      unpresented: [{ item, ref: { identifier: "q2", occurrence: 1n } }],
    });
    if (!("kind" in graded) || graded.kind !== "done") {
      return assert.fail("graded");
    }

    assert.deepStrictEqual(graded.test.get("AATT"), single("integer", 1n));
    assert.deepStrictEqual(graded.test.get("ADUR"), single("float", 12));
    assert.deepStrictEqual(graded.test.get("STATUS"), textValue("identifier", "not_attempted"));
    assert.deepStrictEqual(graded.test.get("SELECTED"), single("integer", 2n));
    assert.deepStrictEqual(graded.test.get("SCORES"), container("multiple", "float", [0, 0.5]));
    assert.deepStrictEqual(graded.test.get("MAXTOTAL"), single("float", 4));
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

/**
 * An item with a hint button: an End Attempt bound to `HINT`, writing `count-attempt`.
 *
 * @param countAttempt - The attribute as written.
 * @returns The compiled item.
 */
const hinted = (countAttempt: string): CompiledItem => {
  const compiled = compileItemWith(
    element("qti-assessment-item", { adaptive: "true", identifier: "q1" }, [
      element(
        "qti-response-declaration",
        { "base-type": "boolean", cardinality: "single", identifier: "HINT" },
        [],
      ),
      element(
        "qti-outcome-declaration",
        { "base-type": "float", cardinality: "single", identifier: "SCORE" },
        [],
      ),
      element(
        "qti-response-declaration",
        { "base-type": "identifier", cardinality: "multiple", identifier: "PICK" },
        [],
      ),
      element("qti-item-body", {}, [
        element(
          "qti-choice-interaction",
          { "max-choices": "1", "min-choices": "1", "response-identifier": "PICK" },
          [element("qti-simple-choice", { identifier: "A" }, [])],
        ),
        element(
          "qti-end-attempt-interaction",
          { "count-attempt": countAttempt, "response-identifier": "HINT", title: "Hint" },
          [],
        ),
      ]),
    ]),
    digest,
    table,
  );

  return compiled.ok ? compiled.value : assert.fail(compiled.refusal.detail);
};

/**
 * What a press of the hint leaves, nothing picked.
 *
 * @param countAttempt - The End Attempt's `count-attempt`.
 * @param validate - The session's `validate-responses`.
 * @returns `numAttempts` after the press, or `refused`.
 */
const pressed = (countAttempt: string, validate: boolean): bigint | "failed" | "refused" => {
  const item = hinted(countAttempt);
  const graded = gradeAnswerWith(table, {
    context: new Map(),
    evaluations: new Map(),
    item,
    readAt: { microseconds: 2n },
    responses: {
      at: { microseconds: 1n },
      kind: "save",
      values: new Map([["HINT", single("boolean", true)]]),
    },
    session: fresh(noTake),
    validate,
  });
  if (!("result" in graded)) {
    return "failed";
  }

  return graded.result.kind === "done" ? graded.result.numAttempts : "refused";
};

describe("an End Attempt's count-attempt", () => {
  it("leaves numAttempts where it was for an attempt ended through one written false, and counts one written true (reading `end-attempt-count`)", () => {
    assert.strictEqual(pressed("false", false), 0n);
    assert.strictEqual(pressed("true", false), 1n);
  });

  it("validates no attempt ended through one written false, under validate-responses too, but one written true (reading `end-attempt-validation`)", () => {
    assert.strictEqual(pressed("false", true), 0n);
    assert.strictEqual(pressed("true", true), "refused");
  });
});
