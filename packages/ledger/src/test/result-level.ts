/**
 * The composition the result relations' database suite (`#ledger/results.db.test.ts`, its AI-graded
 * essay, its templated item's take, its operators item and its adaptive item's attempts) runs on,
 * and its one login: pantry's QTI levels, the registry of qti-pie's general-purpose operators with
 * one grader version of `rubric-score` and the `ext:criteria` rubric use registered, as an
 * application that grades essays registers its own (metis's alphatest-operators;
 * `#ledger/evaluations.test.ts` composes the same), and the ledger and the delivery level over
 * them: the Delivery relations every application reads, here with a grader in force.
 * `grizzle.result.config.ts` installs it in a run's own database on the shared test cluster, and
 * nothing else does.
 *
 * The login publishes a package (pantry's `insertWrite`), writes an attempt's session facts as host
 * rows (`facts`, one insert of each relation it names, its rows the call's), grades the attempt's
 * sitting as the write that records it does (`grade`, P4's `gradeAttemptOf` over the sitting of the
 * session the call names, `sittingOfSessionOf`), records each application's evaluation through the
 * ledger's own evaluator write (`recordEvaluations`, `evaluationProgramsOf`) and a person's value
 * through its own person's-value write (`evaluate`, `personValueOf`'s `recordValue` over the call's
 * `scorer`), each grading and settling the attempt's sitting in its own transaction; takes a
 * templated item's session as every take does (`take`, `takeValuesOf` over the session's sitting),
 * reading both what it stored and the machine's own run of it (`templateProcessingOf` over
 * `takeArgumentsOf`); writes a test's sitting as host rows (`sittingFacts`: its test session, its
 * members' item sessions with their seeds, and an attempt), then enters, presents in, saves in,
 * answers in, suspends and ends it through the test runtime's own programs (`sittingProgramsOf`),
 * each over the sitting the call names, a timed entry with the first budget the call gives, as an
 * application's level writes it from its applied limit, and an end followed by the finish
 * (`finishTest`, `finishTestOf` sequenced after `endTest`, as every application ends a sitting);
 * and reads the Delivery relations the suite holds to its table, the tests it delivers, each
 * attempt's completion status and outcomes as its response processing wrote them, and each
 * attempt's string values, one child's at a time.
 *
 * @module
 */
import {
  ChangeSet,
  Fn,
  login,
  pg,
  query,
  role,
  Type,
  v,
  wholeEntriesOf,
  workload,
} from "@bjornpagen/grizzle";
import { PackageName } from "@qti-pie/pantry/qti/limits.ts";
import { authorWrites, insertWrite } from "@qti-pie/pantry/qti/logins.ts";
import { QtiLom } from "@qti-pie/pantry/qti/lom.ts";
import { deliveryOf } from "#ledger/delivery.ts";
import { evaluationProgramsOf, personValueOf } from "#ledger/evaluation-programs.ts";
import { finishTestOf } from "#ledger/finish.ts";
import {
  gradeAttemptOf,
  gradeAttemptTables,
  takeArgumentsOf,
  takeValuesOf,
} from "#ledger/grade.ts";
import { templateProcessingOf } from "#ledger/grading.ts";
import { LearnerId } from "#ledger/keys.ts";
import { ledgerOf } from "#ledger/ledger.ts";
import type { GraderVersion } from "#ledger/registry/contract.ts";
import { registryOf } from "#ledger/registry/levels.ts";
import { customOperators } from "#ledger/registry/operators.ts";
import { sittingProgramsOf } from "#ledger/sitting-programs.ts";
import { sittingHeading, sittingOfSessionOf } from "#ledger/sitting-queries.ts";
import { testOutcomeRunTables } from "#ledger/test-run-writes.ts";

/**
 * The grader version of `rubric-score` the composition registers, in force for every item that
 * applies it.
 */
export const grader = {
  class: "rubric-score",
  criteria: "{{rubric}} {{response}}",
  effort: "high",
  endpoint: "https://grader.invalid/v1",
  instructions: "Score from 0 to {{maximum}}.",
  maxOutputTokens: 1,
  model: "grader",
  prompt: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  vendor: "grader",
  version: "rubric-score-1",
} as const satisfies GraderVersion;

/**
 * The rubric use the composition registers, the one an item's scorer rubric block names for
 * `rubric-score`.
 */
export const rubricUse = "ext:criteria";

/**
 * The delivery level over a registry with {@link grader} and {@link rubricUse}.
 */
export const ResultLevel = deliveryOf(
  ledgerOf(
    registryOf(QtiLom, {
      bindings: [],
      graders: [grader],
      operators: customOperators,
      rubricUses: [rubricUse],
      tables: [],
    }).Registry,
  ),
);

const {
  ApplicationDraw,
  ApplicationMaximum,
  ApplicationOperands,
  Attempt,
  AttemptCredit,
  AwaitingHumanEvaluation,
  DeliveredTest,
  HumanOperatorValue,
  ItemSessionStatus,
  ItemSessionValue,
  ItemSessionValueSingleIdentifier,
  ItemSessionValueSingleInteger,
  OutcomeInForceSingleFloat,
  Package,
  PendingApplication,
  ProcessedAttempt,
  SnapshotMultipleIdentifier,
  SnapshotSingleBoolean,
  SnapshotSingleFloat,
  SnapshotSingleIdentifier,
  SnapshotSingleString,
  TestBudget,
  TestSession,
  TestVisit,
} = ResultLevel.relations;

/**
 * The session facts a case writes as host rows, each relation once, its rows the call's: an item
 * session with the seed its processing draws under, and an attempt with its response, every instant
 * the insert's own; and, for history, the grading an import carries with it, the attempt's
 * `ProcessedAttempt` and its outcomes, in the same write. A fact that names a stored instant (an
 * evaluation of the attempt, a person's value) is no host row (grizzle's insert stamps every
 * instant it is given none of), so each is written by its own program below.
 */
const sessionRelations = ["ItemSession", "SessionSeed", "ResponseSnapshot", "Attempt"] as const;

/**
 * The session facts' write: one insert of each relation it names, with no row of its own.
 */
const facts = ChangeSet.empty(ResultLevel).insertAll({
  Attempt: [],
  ItemSession: [],
  ProcessedAttempt: [],
  ResponseSnapshot: [],
  SessionSeed: [],
  SnapshotMultipleIdentifier: [],
  SnapshotSingleBoolean: [],
  SnapshotSingleFloat: [],
  SnapshotSingleString: [],
});

/**
 * The relations an evaluation and a person's value write: the evaluation's header and its arms,
 * and the person's value.
 */
const evaluationRelations = [
  "OperatorEvaluation",
  "OperatorReply",
  "OperatorFeedback",
  "OperatorDecline",
  "HumanOperatorValue",
] as const;

/**
 * What the take writes: each value template processing set, by the rule that set it, and its rows
 * in the sidecar of its cardinality and base type.
 */
const takeRelations = [
  "ItemSessionValue",
  "ItemSessionValueSingleIdentifier",
  "ItemSessionValueSingleBoolean",
  "ItemSessionValueSingleInteger",
  "ItemSessionValueSingleFloat",
  "ItemSessionValueSingleString",
  "ItemSessionValueSinglePoint",
  "ItemSessionValueSinglePair",
  "ItemSessionValueSingleDirectedPair",
  "ItemSessionValueSingleDuration",
  "ItemSessionValueSingleUri",
  "ItemSessionValueSingleFile",
  "ItemSessionValueMultipleIdentifier",
  "ItemSessionValueMultipleBoolean",
  "ItemSessionValueMultipleInteger",
  "ItemSessionValueMultipleFloat",
  "ItemSessionValueMultipleString",
  "ItemSessionValueMultiplePoint",
  "ItemSessionValueMultiplePair",
  "ItemSessionValueMultipleDirectedPair",
  "ItemSessionValueMultipleDuration",
  "ItemSessionValueMultipleUri",
  "ItemSessionValueMultipleFile",
  "ItemSessionValueOrderedIdentifier",
  "ItemSessionValueOrderedBoolean",
  "ItemSessionValueOrderedInteger",
  "ItemSessionValueOrderedFloat",
  "ItemSessionValueOrderedString",
  "ItemSessionValueOrderedPoint",
  "ItemSessionValueOrderedPair",
  "ItemSessionValueOrderedDirectedPair",
  "ItemSessionValueOrderedDuration",
  "ItemSessionValueOrderedUri",
  "ItemSessionValueOrderedFile",
] as const;

/**
 * What the test runtime's programs write of a sitting beside the session facts: its test session,
 * its candidate sessions, presentations, budgets and end, a save's rows and its snapshot's given
 * reading, and the close's `DefaultSubmission` of a presented member with no save; the value
 * sidecars a save writes are grading's (`gradeAttemptTables`).
 */
const sittingRelations = [
  "TestSession",
  "TestMoment",
  "TestVisit",
  "TestSuspension",
  "TestBudget",
  "TestPresented",
  "TestEnd",
  "Save",
  "SnapshotGiven",
  "DefaultSubmission",
] as const;

/**
 * The suite's role: every relation to read, and a package's relations, the session facts, the
 * evaluations and a person's value, the take's values, grading's, what settling a sitting writes
 * (`testOutcomeRunTables` and SittingFinal), and what the test runtime's programs write of a
 * sitting, to write.
 */
const Suite = role(ResultLevel, "result_runner", wholeEntriesOf(ResultLevel), {
  write: [
    ...authorWrites,
    ...sessionRelations,
    ...evaluationRelations,
    ...takeRelations,
    ...gradeAttemptTables,
    ...testOutcomeRunTables,
    "SittingFinal",
    ...sittingRelations,
  ],
});

/**
 * The test runtime's programs over the composition.
 */
const sittingPrograms = sittingProgramsOf(ResultLevel);

/**
 * The sitting a call names by its key, `child` and `stage`: what every sitting program's
 * `sittings` is bound to.
 */
const namedSitting = query(ResultLevel).rule((r) =>
  r.find({ child: r.param("child", LearnerId), stage: r.param("stage", pg.bigint) }),
);

/**
 * A test's sitting as host rows, each relation once, its rows the call's: its test session, its
 * members' item sessions with the seeds their processing draws under, as a take writes them, and an
 * attempt of a member with its snapshot, every instant the insert's own. A sitting written so takes
 * no template processing, which none of its members declares.
 */
const sittingFacts = ChangeSet.empty(ResultLevel).insertAll({
  Attempt: [],
  ItemSession: [],
  ResponseSnapshot: [],
  SessionSeed: [],
  TestSession: [],
});

/**
 * A timed sitting's first budget, `remaining`, beside its start: what an application's level
 * writes from its applied limit (edullm's `firstBudget`), here the call's.
 */
const firstBudget = ChangeSet.empty(ResultLevel).insert(
  TestBudget,
  query(ResultLevel).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const { child, stage } = v(sittings, "budgetedSitting");

    return r
      .match(sittings, { child, stage })
      .match(TestSession, { child, stage })
      .where(r.not(TestVisit, { child, stage }))
      .find({
        child,
        k: 0n,
        remaining: Type.cast(r.param("remaining", pg.numeric(20, 0)), TestBudget.fields.remaining),
        stage,
      });
  }),
);

/**
 * The sitting of the session a call names (`child`, `package`, `path`, `n`), the one every write
 * over a session binds `sittings` to.
 */
const sessionSitting = sittingOfSessionOf(ResultLevel);

/**
 * The machine's own run of the template processing of the call's `sittings` (`sittingHeading`),
 * over takeArgumentsOf's readers bound to them as the take binds them, the registry's tables
 * unbound as the take passes them: what the take's stored values are held to
 * (`templateProcessingOf`, its seed the session's `SessionSeed`, its label `templateLabel` of the
 * item's identifier, no given value).
 */
const takeArguments = takeArgumentsOf(ResultLevel);

/**
 * The run's integer values once it ends, by holder, each keyed to the call's sitting by its run key
 * (child and stage, with package and path): the template variable's drawn value among them.
 */
const takeRunIntegersOf = query(ResultLevel).rule((r) => {
  const sittings = r.relation("sittings", sittingHeading);
  const sitting = { sittings };
  const run = Fn.row(templateProcessingOf, {
    bases: takeArguments.bases.bind(sitting),
    booleans: takeArguments.booleans.bind(sitting),
    declaration_attributes: takeArguments.declaration_attributes.bind(sitting),
    declaration_texts: takeArguments.declaration_texts.bind(sitting),
    declarations: takeArguments.declarations.bind(sitting),
    directed_pairs: takeArguments.directed_pairs.bind(sitting),
    field_booleans: takeArguments.field_booleans.bind(sitting),
    field_directed_pairs: takeArguments.field_directed_pairs.bind(sitting),
    field_file_names: takeArguments.field_file_names.bind(sitting),
    field_files: takeArguments.field_files.bind(sitting),
    field_floats: takeArguments.field_floats.bind(sitting),
    field_integers: takeArguments.field_integers.bind(sitting),
    field_pairs: takeArguments.field_pairs.bind(sitting),
    field_points: takeArguments.field_points.bind(sitting),
    field_texts: takeArguments.field_texts.bind(sitting),
    file_names: takeArguments.file_names.bind(sitting),
    files: takeArguments.files.bind(sitting),
    floats: takeArguments.floats.bind(sitting),
    integers: takeArguments.integers.bind(sitting),
    pairs: takeArguments.pairs.bind(sitting),
    points: takeArguments.points.bind(sitting),
    program_attributes: takeArguments.program_attributes.bind(sitting),
    program_texts: takeArguments.program_texts.bind(sitting),
    programs: takeArguments.programs.bind(sitting),
    reply_floats: takeArguments.reply_floats.bind(sitting),
    reply_texts: takeArguments.reply_texts.bind(sitting),
    runs: takeArguments.runs.bind(sitting),
    table_bindings: takeArguments.table_bindings,
    table_entries: takeArguments.table_entries,
    table_values: takeArguments.table_values,
    texts: takeArguments.texts.bind(sitting),
    vars: takeArguments.vars.bind(sitting),
  });
  const { child, stage } = v(sittings, "runSitting");
  const { holds, identifier, package: pkg, path, place, value } = v(run.integers, "runInt");

  return r
    .match(sittings, { child, stage })
    .match(run.integers, { child, holds, identifier, package: pkg, path, place, stage, value })
    .find({ holds, identifier, path, place, value });
});

/**
 * What the take stored of the child's sessions: each value's header, by the rule that set it.
 */
const takenHeadersOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, stage, kind, variable } = v(ItemSessionValue, "takenHeader");

  return r
    .match(ItemSessionValue, {
      child: r.param("child", LearnerId),
      kind,
      package: pkg,
      path,
      stage,
      variable,
    })
    .find({ kind, path, variable });
});

/**
 * Its integer singles.
 */
const takenIntegersOf = query(ResultLevel).rule((r) => {
  const {
    package: pkg,
    path,
    stage,
    kind,
    variable,
    value,
  } = v(ItemSessionValueSingleInteger, "takenInteger");

  return r
    .match(ItemSessionValueSingleInteger, {
      child: r.param("child", LearnerId),
      kind,
      package: pkg,
      path,
      stage,
      value,
      variable,
    })
    .find({ kind, path, value, variable });
});

/**
 * Its identifier singles.
 */
const takenIdentifiersOf = query(ResultLevel).rule((r) => {
  const {
    package: pkg,
    path,
    stage,
    kind,
    variable,
    value,
  } = v(ItemSessionValueSingleIdentifier, "takenIdentifier");

  return r
    .match(ItemSessionValueSingleIdentifier, {
      child: r.param("child", LearnerId),
      kind,
      package: pkg,
      path,
      stage,
      value,
      variable,
    })
    .find({ kind, path, value, variable });
});

/**
 * The ledger's evaluator write, `recordEvaluations` { replies, feedbacks, declines }, each grading
 * and settling the sitting its rows name in the strata after it, and its read-back of what still
 * waits for a person, which the suite's workload puts over its role as every application does.
 */
const evaluations = evaluationProgramsOf(ResultLevel);

/**
 * The suite's scorer: the call's `scorer`, whom the suite's role admits, as an application binds
 * the scorers it admits.
 */
const suiteScorer = query(ResultLevel).rule((r) =>
  r.find({ scorer: r.param("scorer", HumanOperatorValue.fields.scorer) }),
);

/**
 * A person's value of a rubric group while it waits for one (`AwaitingHumanEvaluation`), through
 * the ledger's own person's-value write (`personValueOf`'s `recordValue`), as every application
 * records one, over the suite's scorer: then the grading and settling of its attempt's sitting in
 * the same transaction. A group that does not wait finds no row, records nothing and answers
 * `unchanged`. It reads back what of the attempt still waits after it.
 */
const evaluate = personValueOf(ResultLevel).recordValue.bind({ scorers: suiteScorer });

/**
 * The child's attempts, each with its status and its item session's stage.
 */
const statusesOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at, stage, status } = v(ItemSessionStatus, "status");

  return r
    .match(ItemSessionStatus, {
      at,
      child: r.param("child", LearnerId),
      n,
      package: pkg,
      path,
      stage,
      status,
    })
    .find({ at, n, package: pkg, path, stage, status });
});

/**
 * The child's recorded applications that wait for their evaluation.
 */
const applicationsOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at, operator, stage } = v(PendingApplication, "application");

  return r
    .match(PendingApplication, {
      at,
      child: r.param("child", LearnerId),
      n,
      operator,
      package: pkg,
      path,
      stage,
    })
    .find({ at, n, operator, package: pkg, path, stage });
});

/**
 * The child's rubric groups that wait for a person's value.
 */
const awaitingOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at, rubric, stage } = v(AwaitingHumanEvaluation, "group");

  return r
    .match(AwaitingHumanEvaluation, {
      at,
      child: r.param("child", LearnerId),
      n,
      package: pkg,
      path,
      rubric,
      stage,
    })
    .find({ at, n, package: pkg, path, rubric, stage });
});

/**
 * The child's recorded applications' request operands.
 */
const operandsOf = query(ResultLevel).rule((r) => {
  const {
    package: pkg,
    path,
    n,
    at,
    operator,
    stage,
    response,
    rubric,
    grader: version,
  } = v(ApplicationOperands, "operands");

  return r
    .match(ApplicationOperands, {
      at,
      child: r.param("child", LearnerId),
      grader: version,
      n,
      operator,
      package: pkg,
      path,
      response,
      rubric,
      stage,
    })
    .find({ at, grader: version, n, operator, package: pkg, path, response, rubric, stage });
});

/**
 * The child's recorded applications' maxima.
 */
const maximaOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at, operator, maximum } = v(ApplicationMaximum, "maximum");

  return r
    .match(ApplicationMaximum, {
      at,
      child: r.param("child", LearnerId),
      maximum,
      n,
      operator,
      package: pkg,
      path,
    })
    .find({ at, maximum, n, operator, package: pkg, path });
});

/**
 * A package's recorded applications' draws.
 */
const drawsOf = query(ResultLevel).rule((r) => {
  const { path, operator, draw } = v(ApplicationDraw, "draw");

  return r
    .match(ApplicationDraw, {
      draw,
      operator,
      package: r.param("package", Package.fields.name),
      path,
    })
    .find({ draw, operator, path });
});

/**
 * The child's float outcomes in force.
 */
const floatsOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at, variable, value } = v(OutcomeInForceSingleFloat, "float");

  return r
    .match(OutcomeInForceSingleFloat, {
      at,
      child: r.param("child", LearnerId),
      n,
      package: pkg,
      path,
      value,
      variable,
    })
    .find({ at, n, package: pkg, path, value, variable });
});

/**
 * The child's attempts' credit.
 */
const creditsOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at, earned, maximum, kind } = v(AttemptCredit, "credit");

  return r
    .match(AttemptCredit, {
      at,
      child: r.param("child", LearnerId),
      earned,
      kind,
      maximum,
      n,
      package: pkg,
      path,
    })
    .find({ at, earned, kind, maximum, n, package: pkg, path });
});

/**
 * The child's processed attempts, each with the completion status its response processing left.
 */
const completionsOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at, completionStatus } = v(ProcessedAttempt, "processed");

  return r
    .match(ProcessedAttempt, {
      at,
      child: r.param("child", LearnerId),
      completionStatus,
      n,
      package: pkg,
      path,
    })
    .find({ at, completionStatus, n, package: pkg, path });
});

/**
 * The child's attempts' single float values, as their snapshots hold them.
 */
const snapshotFloatsOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at, variable, value } = v(SnapshotSingleFloat, "float");

  return r
    .match(SnapshotSingleFloat, {
      at,
      child: r.param("child", LearnerId),
      n,
      package: pkg,
      path,
      value,
      variable,
    })
    .find({ at, n, package: pkg, path, value, variable });
});

/**
 * The child's attempts' single identifier values, as their snapshots hold them.
 */
const snapshotIdentifiersOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at, variable, value } = v(SnapshotSingleIdentifier, "identifier");

  return r
    .match(SnapshotSingleIdentifier, {
      at,
      child: r.param("child", LearnerId),
      n,
      package: pkg,
      path,
      value,
      variable,
    })
    .find({ at, n, package: pkg, path, value, variable });
});

/**
 * The child's attempts' multiple identifier values, each value with its count, as their snapshots
 * hold them.
 */
const snapshotIdentifierBagsOf = query(ResultLevel).rule((r) => {
  const {
    package: pkg,
    path,
    n,
    at,
    variable,
    value,
    count,
  } = v(SnapshotMultipleIdentifier, "bag");

  return r
    .match(SnapshotMultipleIdentifier, {
      at,
      child: r.param("child", LearnerId),
      count,
      n,
      package: pkg,
      path,
      value,
      variable,
    })
    .find({ at, count, n, package: pkg, path, value, variable });
});

/**
 * The child's attempts' single boolean values, as their snapshots hold them.
 */
const snapshotBooleansOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at, variable, value } = v(SnapshotSingleBoolean, "boolean");

  return r
    .match(SnapshotSingleBoolean, {
      at,
      child: r.param("child", LearnerId),
      n,
      package: pkg,
      path,
      value,
      variable,
    })
    .find({ at, n, package: pkg, path, value, variable });
});

/**
 * The child's attempts, each by its item session and its instant.
 */
const attemptsOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at } = v(Attempt, "attempt");

  return r
    .match(Attempt, { at, child: r.param("child", LearnerId), n, package: pkg, path })
    .find({ at, n, package: pkg, path });
});

/**
 * The child's snapshots' single string values, as they hold them.
 */
const snapshotStringsOf = query(ResultLevel).rule((r) => {
  const { package: pkg, path, n, at, variable, value } = v(SnapshotSingleString, "string");

  return r
    .match(SnapshotSingleString, {
      at,
      child: r.param("child", LearnerId),
      n,
      package: pkg,
      path,
      value,
      variable,
    })
    .find({ at, n, package: pkg, path, value, variable });
});

/**
 * The tests of the call's package this runtime delivers (`DeliveredTest`), by their path.
 */
const deliveredTestsOf = query(ResultLevel).rule((r) => {
  const { path } = v(DeliveredTest, "delivered");

  return r.match(DeliveredTest, { package: r.param("package", PackageName), path }).find({ path });
});

/**
 * The suite's login, `result_suite`, acting as its one role, `result_runner`.
 */
export const ResultSuite = login(ResultLevel, "result_suite", [Suite], {
  workload: [
    workload(Suite, {
      answerTestItem: sittingPrograms.answerTestItem.bind({ sittings: namedSitting }),
      applicationsOf,
      attemptsOf,
      awaitingOf,
      completionsOf,
      creditsOf,
      deliveredTestsOf,
      drawsOf,
      endTest: sittingPrograms.endTest.bind({ sittings: namedSitting }),
      enterTest: sittingPrograms.enterTest.bind({ sittings: namedSitting }),
      enterTimedTest: ChangeSet.union(sittingPrograms.enterTest, firstBudget).bind({
        sittings: namedSitting,
      }),
      evaluate,
      facts,
      finishTest: ChangeSet.sequence(sittingPrograms.endTest, finishTestOf(ResultLevel)).bind({
        sittings: namedSitting,
      }),
      floatsOf,
      grade: gradeAttemptOf(ResultLevel).bind({ sittings: sessionSitting }),
      maximaOf,
      operandsOf,
      presentItem: sittingPrograms.presentItem.bind({ sittings: namedSitting }),
      publish: ChangeSet.union(insertWrite, ChangeSet.empty(ResultLevel)),
      recordEvaluations: ChangeSet.over(Suite, evaluations.recordEvaluations),
      saveTestItem: sittingPrograms.saveTestItem.bind({ sittings: namedSitting }),
      sittingFacts,
      snapshotBooleansOf,
      snapshotFloatsOf,
      snapshotIdentifierBagsOf,
      snapshotIdentifiersOf,
      snapshotStringsOf,
      statusesOf,
      suspendTest: sittingPrograms.suspendTest.bind({ sittings: namedSitting }),
      take: takeValuesOf(ResultLevel).bind({ sittings: sessionSitting }),
      takeRunIntegersOf,
      takenHeadersOf,
      takenIdentifiersOf,
      takenIntegersOf,
    }),
  ],
});
