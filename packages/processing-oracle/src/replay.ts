/**
 * Replay plate's recording through the engine: for every item it ran, every seed and every case's
 * attempts, the engine's result beside the recorded one, as differences.
 *
 * The truth feeds forward, never the engine's own results: each attempt runs on the session the
 * recording says the last attempt left (its `numAttempts`, its outcomes for an adaptive item), so
 * one moved value shows once, where it moves, rather than in every attempt after it.
 *
 * @module
 */
import type {
  AnswerView,
  Engine,
  ItemEngine,
  ItemSeed,
  MemberView,
  SessionView,
  SittingView,
} from "#processing-oracle/engine.ts";
import { postable } from "#processing-oracle/k2.ts";
import type { K2Item } from "#processing-oracle/k2.ts";
import type {
  RanItem,
  RecordedCase,
  RecordedSeed,
  RecordedValues,
} from "#processing-oracle/recording.ts";
import { lineIdsOf, servedSeeds, stepsOf, unpublished } from "#processing-oracle/served.ts";
import type { BeforeLine, ServedCase } from "#processing-oracle/served.ts";
import {
  completionOf,
  latestAttemptOf,
  latestRunOf,
  postedOf,
  valuesOfRows,
} from "#processing-oracle/sqltruth.ts";
import type { SittingInputs, SqlTruthLine } from "#processing-oracle/sqltruth.ts";
import type { SuiteCase } from "#processing-oracle/suite.ts";
import { fieldDiffers, keyOf, valuesDiffer } from "#processing-oracle/verdict.ts";
import type { Difference, FieldSide } from "#processing-oracle/verdict.ts";

/**
 * What an attempt gave, as one difference side when it is not the kind the truth recorded: a
 * refusal with its reasons' codes (and whether an end-attempt ended the attempt), a failure with
 * its text, or the kind.
 *
 * @param view The answer.
 * @returns Its side.
 */
export const kindOf = (view: AnswerView): string => {
  switch (view.kind) {
    case "refused": {
      return `refused: ${view.codes.join(",")}${view.endAttempt ? " (ended by an end-attempt)" : ""}`;
    }
    case "failed": {
      return `failed: ${view.failure}`;
    }
    case "done":
    case "pending": {
      return view.kind;
    }
  }
};

/**
 * A ran item's document, `<package>/<path>`, as its keys name it.
 *
 * @param item The item.
 * @returns The document.
 */
const documentOf = (item: RanItem): string => `${item.package}/${item.path}`;

/**
 * The differences of one case's attempts, run in order on the recorded sessions.
 *
 * @param engine The compiled item.
 * @param seed The item's seed.
 * @param line The line's key parts.
 * @param line.set The set.
 * @param line.document The document.
 * @param line.decisionSeed The decision seed.
 * @param take What the item's take set, as the recording holds it.
 * @param recorded The case.
 * @returns Its differences.
 */
const caseDiffers = (
  engine: ItemEngine,
  seed: ItemSeed,
  line: { readonly decisionSeed: string; readonly document: string; readonly set: string },
  take: RecordedSeed["begun"],
  recorded: RecordedCase,
): readonly Difference[] => {
  let session: SessionView = { duration: 0, numAttempts: 0, prior: undefined };
  const out: (readonly Difference[])[] = [];
  for (const [index, attempt] of recorded.attempts.entries()) {
    const key = keyOf(line, { case: recorded.name, index });
    const view = engine.answer({
      recorded: new Map(),
      responses: attempt.kind === "scored" ? attempt.responses : attempt.posted,
      seed,
      session,
      take,
      validate: true,
    });
    if (attempt.kind === "failed") {
      const refused = [...new Set(attempt.refused.map(([response]) => response))].toSorted();
      out.push(
        view.kind === "refused"
          ? fieldDiffers(key, "refused", refused, [...new Set(view.refused)].toSorted())
          : fieldDiffers(key, "kind", "refused", kindOf(view)),
      );
      continue;
    }

    out.push(
      view.kind === "done"
        ? [
            ...valuesDiffer(key, "outcomes", attempt.outcomes, view.outcomes),
            ...fieldDiffers(key, "numAttempts", attempt.numAttempts, view.numAttempts),
            ...fieldDiffers(key, "credit", attempt.ownerCredit, view.credit?.kind ?? null),
          ]
        : fieldDiffers(key, "kind", "done", kindOf(view)),
    );

    session = { duration: 0, numAttempts: attempt.numAttempts, prior: attempt.outcomes };
  }

  return out.flat();
};

/**
 * The differences of one ran item: compiled from its document, then under each seed its take
 * against the session the seed began with, and each case's attempts.
 *
 * @param engine The engine.
 * @param item The ran item.
 * @param bytes Its document's bytes.
 * @returns Its differences.
 */
export const itemDiffers = (
  engine: Engine,
  item: RanItem,
  bytes: Uint8Array,
): readonly Difference[] => {
  const document = documentOf(item);
  const compiled = engine.item(bytes);
  if (compiled.kind === "refused") {
    return fieldDiffers(
      [item.set, document].join("|"),
      "compiled",
      "accepted",
      `refused: ${compiled.reason}`,
    );
  }

  return item.seeds.flatMap((recorded) => {
    const line = { decisionSeed: recorded.decisionSeed, document, set: item.set };
    const seed = {
      decisionSeed: recorded.decisionSeed,
      identifier: item.identifier,
      package: item.package,
    };
    const take = compiled.take(seed);
    const begun = keyOf(line, "begun");

    return [
      ...valuesDiffer(begun, "templates", recorded.begun.templates, take.templates),
      ...valuesDiffer(begun, "correct", recorded.begun.correct, take.correct),
      ...valuesDiffer(begun, "defaults", recorded.begun.defaults, take.defaults),
      ...recorded.cases.flatMap((c) => caseDiffers(compiled, seed, line, recorded.begun, c)),
    ];
  });
};

/**
 * The seed a corpus item without a recorded decision is answered under: one fixed decision seed,
 * since no such item's grading draws.
 */
const fixedDecision = "00000000-0000-4000-8000-000000000000";

/**
 * A float score as a recorded value.
 *
 * @param score The score.
 * @returns The value.
 */
const scoreValue = (score: number): RecordedValues =>
  ({ SCORE: { baseType: "float", cardinality: "single", values: [String(score)] } }) as const;

/**
 * The SCORE of a done attempt's outcomes, alone.
 *
 * @param outcomes The outcomes.
 * @returns SCORE, or nothing where the item declares none.
 */
const scoreOf = (outcomes: RecordedValues): RecordedValues => {
  const score = outcomes["SCORE"];

  return score === undefined ? {} : { SCORE: score };
};

/**
 * What a ported suite case gave, as its table states one.
 *
 * @param view The answer.
 * @returns Its result.
 */
const suiteResultOf = (view: AnswerView): FieldSide => {
  switch (view.kind) {
    case "done": {
      return { kind: "done", score: view.outcomes["SCORE"]?.values[0] ?? null };
    }
    case "pending": {
      return { draws: [...view.draws], kind: "pending" };
    }
    case "refused":
    case "failed": {
      return { kind: view.kind };
    }
  }
};

/**
 * The differences of one K2 item: each case the page can post, submitted with validation off (QTI's
 * default, Table 7.19.7, as AlphaTest delivers), against AlphaTest's own submitted score (SCORE
 * alone, which is all AlphaTest reports).
 *
 * @param engine The engine.
 * @param item The item.
 * @param observed AlphaTest's score of each case, by case id.
 * @returns Its differences.
 */
export const k2Differs = (
  engine: Engine,
  item: K2Item,
  observed: ReadonlyMap<string, number>,
): readonly Difference[] => {
  const compiled = engine.item(new TextEncoder().encode(item.xml));
  if (compiled.kind === "refused") {
    return fieldDiffers(`k2|${item.key}`, "compiled", "accepted", `refused: ${compiled.reason}`);
  }

  const seed = { decisionSeed: fixedDecision, identifier: item.identifier, package: "k2" };
  const take = compiled.take(seed);

  return item.cases.filter(postable).flatMap((c) => {
    const key = `k2|${item.key}|${c.id}`;
    const score = observed.get(c.id);
    if (score === undefined) {
      return fieldDiffers(key, "observed", "a score", null);
    }

    const view = compiled.answer({
      recorded: new Map(),
      responses: c.qti,
      seed,
      session: { duration: 0, numAttempts: 0, prior: undefined },
      take,
      validate: false,
    });

    return view.kind === "done"
      ? valuesDiffer(key, "outcomes", scoreValue(score), scoreOf(view.outcomes))
      : fieldDiffers(key, "kind", "done", kindOf(view));
  });
};

/**
 * The differences of the ported results-suite cases: each answered once with its draws' recorded
 * scores, against the pending draws or the SCORE its table states.
 *
 * @param engine The engine.
 * @param cases The cases.
 * @returns Their differences.
 */
export const suiteDiffers = (engine: Engine, cases: readonly SuiteCase[]): readonly Difference[] =>
  cases.flatMap((c) => {
    const key = `suite|${c.name}`;
    const compiled = engine.item(new TextEncoder().encode(c.xml));
    if (compiled.kind === "refused") {
      return fieldDiffers(key, "compiled", "accepted", `refused: ${compiled.reason}`);
    }

    const seed = {
      decisionSeed: fixedDecision,
      identifier: compiled.identifier,
      package: "suite",
    };
    const view = compiled.answer({
      recorded: c.recorded,
      responses: {
        RESPONSE: {
          baseType: "string",
          cardinality: "single",
          values: c.response === undefined ? [] : [c.response],
        },
      },
      seed,
      session: { duration: 0, numAttempts: 0, prior: undefined },
      take: compiled.take(seed),
      validate: true,
    });
    const graded = suiteResultOf(view);
    const expected =
      c.expected.kind === "done"
        ? { kind: "done", score: String(c.expected.score) }
        : { draws: [...c.expected.draws], kind: "pending" };

    return fieldDiffers(key, "result", expected, graded);
  });

/**
 * The differences of the served slice against the SQL before: each case's steps answered in one
 * session under the served run's own seed (its shard index, {@link servedSeeds}, keyed by the
 * served package), each graded step's outcomes, credit and status against the before's line. A
 * step the before never graded because its package did not publish is excluded; any other ungraded
 * step is a difference. Steps feed the engine's own session forward: the before records no
 * session.
 *
 * @param engine The engine.
 * @param cases The served cases.
 * @param before The before's lines, by line id.
 * @param bytesOf A served case's document bytes.
 * @returns Their differences.
 */
export const servedDiffers = (
  engine: Engine,
  cases: readonly ServedCase[],
  before: ReadonlyMap<string, BeforeLine>,
  bytesOf: (c: ServedCase) => Uint8Array,
): readonly Difference[] => {
  const seeds = servedSeeds(cases);

  return cases.flatMap((c) => {
    const ids = lineIdsOf(c);
    if (ids.every((id) => before.get(id)?.error === unpublished)) {
      return [];
    }

    const compiled = engine.item(bytesOf(c));
    if (compiled.kind === "refused") {
      return fieldDiffers(
        `served|${c.case}`,
        "compiled",
        "accepted",
        `refused: ${compiled.reason}`,
      );
    }

    const seed = {
      decisionSeed: seeds.get(c.case) ?? fixedDecision,
      identifier: compiled.identifier,
      package: c.package,
    };
    const take = compiled.take(seed);
    let session: SessionView = { duration: 0, numAttempts: 0, prior: undefined };

    return stepsOf(c).flatMap((step, at) => {
      const id = ids[at] ?? c.case;
      const key = `served|${id}`;
      const line = before.get(id);
      const view = compiled.answer({
        recorded: new Map(),
        responses: step.responses,
        seed,
        session,
        take,
        validate: false,
      });
      if (view.kind === "done") {
        session = { duration: 0, numAttempts: view.numAttempts, prior: view.outcomes };
      }

      if (line === undefined || line.error !== null) {
        return fieldDiffers(key, "before", "a graded line", line?.error ?? null);
      }

      if (view.kind !== "done") {
        return fieldDiffers(key, "kind", "done", kindOf(view));
      }

      const credit = line.credit.map(({ earned, kind, maximum }) => ({ earned, kind, maximum }));

      return [
        ...valuesDiffer(key, "outcomes", line.outcomes, view.outcomes),
        ...fieldDiffers(key, "credit", credit, view.credit === null ? [] : [{ ...view.credit }]),
      ];
    });
  });
};

/**
 * The ledger's completion statuses, by their stored ordinal (`CompletionStatus`, closed and
 * ordered).
 */
const completionStatuses = ["completed", "incomplete", "not_attempted", "unknown"] as const;

/**
 * The SQL grader's stored values in the form the package grades them, for one comparison: a value
 * the ledger holds no row of is NULL (a NULL value has no rows), a duration is held in the float
 * sidecar (its seconds), and an attempt's snapshot also holds the responses it ran with, which are
 * no outcome; so a variable the package gives no outcome is left out, a NULL the package gives
 * stands for no row, and a float row of a variable the package types `duration` is its duration.
 *
 * @param stored The values read from the ledger's rows, by variable.
 * @param graded The package's values, by variable.
 * @param outcomesOnly Whether only the package's own variables are compared (a member's attempt).
 * @returns The stored values, in the package's form.
 */
const storedForm = (
  stored: RecordedValues,
  graded: RecordedValues,
  outcomesOnly: boolean,
): RecordedValues =>
  Object.fromEntries([
    ...Object.entries(stored).flatMap(([name, value]) => {
      const own = graded[name];
      if (own === undefined) {
        return outcomesOnly ? [] : [[name, value] as const];
      }

      return [
        [
          name,
          own.baseType === "duration" && value.baseType === "float"
            ? { ...value, baseType: "duration" as const }
            : value,
        ] as const,
      ];
    }),
    ...Object.entries(graded).flatMap(([name, value]) =>
      stored[name] === undefined && value.values.length === 0 ? [[name, value] as const] : [],
    ),
  ]);

/**
 * What a sitting's close gave, as one difference side when it is not done.
 *
 * @param view The close.
 * @returns Its side.
 */
const sittingKindOf = (view: SittingView): string => {
  switch (view.kind) {
    case "failed": {
      return `failed: ${view.failure}`;
    }
    case "refused": {
      return `refused: ${view.codes.join(",")}`;
    }
    case "done":
    case "pending": {
      return view.kind;
    }
  }
};

/**
 * The differences of one recorded sitting: the test and its members compiled, each member's
 * saved responses closed, the members' outcomes and completion status against the grader's
 * latest attempt of each, and the test's outcomes against its latest outcome run. A sitting the
 * SQL runtime never entered (its take refused a test it does not deliver) holds no grading truth
 * and is left out; one the SQL grader failed is a difference wherever the engine grades it.
 *
 * @param engine The engine.
 * @param line The recorded sitting.
 * @param inputs Its durations.
 * @param bytesOf A document's bytes, by its path in the sitting's package.
 * @returns Its differences.
 */
export const sittingDiffers = (
  engine: Engine,
  line: Extract<SqlTruthLine, { readonly steps: unknown }>,
  inputs: SittingInputs,
  bytesOf: (path: string) => Uint8Array,
): readonly Difference[] => {
  const key = `sql|${line.case}`;
  if (!line.steps.some((step) => "enter" in step && step.enter === "accepted")) {
    return [];
  }

  const test = engine.test(
    bytesOf(line.test),
    new Map(line.members.map((member) => [member.identifier, bytesOf(member.path)])),
  );
  if (test.kind === "refused") {
    return fieldDiffers(key, "compiled", "accepted", `refused: ${test.reason}`);
  }

  const presented = new Map(
    line.steps.flatMap((step) =>
      "member" in step ? [[step.member, postedOf(step)] as const] : [],
    ),
  );
  const members: readonly MemberView[] = line.members.flatMap((member) =>
    presented.has(member.identifier)
      ? [
          {
            duration: inputs.durations.get(member.identifier) ?? 0,
            ref: member.identifier,
            responses: presented.get(member.identifier),
          },
        ]
      : [],
  );
  const view = test.close({
    decisionSeed: line.child,
    duration: inputs.testDuration,
    members,
  });
  const closed = sittingKindOf(view);
  if (line.error !== null) {
    return fieldDiffers(key, "kind", `failed: ${line.error}`, closed);
  }

  if (view.kind !== "done") {
    return fieldDiffers(key, "kind", "done", closed);
  }

  const run = latestRunOf(line.rows);
  const recordedTest =
    run === undefined
      ? {}
      : valuesOfRows(line.rows, "test_outcome", (row) => String(row["at"]) === run);

  return [
    ...valuesDiffer(key, "test", storedForm(recordedTest, view.test, false), view.test),
    ...line.members.flatMap((member) => {
      const attempt = latestAttemptOf(line.rows, member.path);
      const graded = view.members.get(member.identifier);
      const memberKey = `${key}|${member.identifier}`;
      if (attempt === undefined) {
        return graded === undefined ? [] : fieldDiffers(memberKey, "attempt", null, graded.kind);
      }

      if (graded?.kind !== "done") {
        return fieldDiffers(memberKey, "kind", "done", graded?.kind ?? null);
      }

      const recorded = valuesOfRows(
        line.rows,
        "snapshot",
        (row) => String(row["path"]) === member.path && String(row["at"]) === attempt.at,
      );
      const status = completionOf(line.rows, attempt, member.path);
      const named = completionStatuses[Number(status)];
      const withStatus: RecordedValues =
        named === undefined
          ? recorded
          : {
              ...recorded,
              completionStatus: { baseType: "identifier", cardinality: "single", values: [named] },
            };

      return valuesDiffer(
        memberKey,
        "outcomes",
        storedForm(withStatus, graded.outcomes, true),
        graded.outcomes,
      );
    }),
  ];
};
