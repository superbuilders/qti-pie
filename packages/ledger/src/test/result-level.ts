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
 * `scorer`), each grading and settling the attempt's sitting in its own transaction; begins every
 * item stage's session as an application's decision does (`begin`: its item session and seed, the
 * session the call names, and `takeValuesOf` over it, in one stratum, so what template processing
 * set and the record it begins with are the machine's), reading both what the take
 * stored and the machine's own run of it (`templateProcessingOf` over `takeArgumentsOf`); takes a
 * test's sitting through the test runtime's own take (`takeSitting`, and `takeGuarded` under the
 * guard an application states in its `taken`), writes an attempt of a member
 * as host rows (`sittingFacts`), then enters, presents in, saves in, answers in, beacons in (on the
 * database's clock, and at a reading the call gives), pauses (a beacon, then a suspension, in one
 * transaction), suspends and ends it through the test runtime's own programs (`sittingProgramsOf`),
 * writes a presence window as host rows, each over the sitting the call names, a timed entry with
 * the first budget the call gives, as an application's level writes it from its applied limit, and
 * an end followed by the finish (`finishTest`, `finishTestOf` sequenced after `endTest`, as every
 * application ends a sitting); and reads the Delivery relations the suite holds to its table, the
 * tests it delivers, each attempt's completion status and outcomes as its response processing wrote
 * them, each attempt's string values, its candidate sessions' budgets, each item session's control
 * and state as every application reads them (`sessionControlOf`), each sitting's item sessions at
 * their latest attempts as a review reads them (`attemptRowsOf`), and its presence windows,
 * present time and last beacons, one child's at a time.
 *
 * @module
 */
import {
  ChangeSet,
  clocked,
  Fn,
  login,
  pg,
  query,
  Range,
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
import {
  evaluationProgramsOf,
  evaluationWrites,
  personValueOf,
  personValueWrites,
} from "#ledger/evaluation-programs.ts";
import { finishTestOf } from "#ledger/finish.ts";
import {
  gradeAttemptOf,
  gradeAttemptWrites,
  takeArgumentsOf,
  takeValuesOf,
  takeValuesWrites,
} from "#ledger/grade.ts";
import { templateProcessingOf } from "#ledger/grading.ts";
import { LearnerId } from "#ledger/keys.ts";
import { ledgerOf, sessionWrites } from "#ledger/ledger.ts";
import { Moment } from "#ledger/sittings.ts";
import type { GraderVersion } from "#ledger/registry/contract.ts";
import { registryOf } from "#ledger/registry/levels.ts";
import { customOperators } from "#ledger/registry/operators.ts";
import { sessionControlOf } from "#ledger/session-control.ts";
import { presenceWrites, sittingProgramsOf, sittingWrites } from "#ledger/sitting-programs.ts";
import { attemptRowsOf } from "#ledger/attempt-rows.ts";
import { savedRowsOf } from "#ledger/saved-rows.ts";
import { sittingHeading, sittingOfSessionOf, takenHeading } from "#ledger/sitting-queries.ts";
import { settleWrites } from "#ledger/test-run-writes.ts";

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
  ItemDuration,
  ItemSession,
  ItemSessionStatus,
  ItemSessionValue,
  ItemSessionValueSingleIdentifier,
  ItemSessionValueSingleInteger,
  LastPresence,
  OutcomeInForceSingleFloat,
  Package,
  PendingApplication,
  Presence,
  PresentTime,
  ProcessedAttempt,
  SessionSeed,
  SittingFinal,
  SnapshotMultipleIdentifier,
  SnapshotSingleBoolean,
  SnapshotSingleFloat,
  SnapshotSingleIdentifier,
  SnapshotSingleString,
  StartVariable,
  TestBudget,
  TestOutcomeSingleBoolean,
  TestOutcomeSingleFloat,
  TestPresented,
  TestSession,
  TestVisit,
  UnendedSitting,
} = ResultLevel.relations;

/**
 * The session facts a case writes as host rows, one insert of each relation it names, with no row
 * of its own, its rows the call's: an attempt with its response, every instant the insert's own;
 * and, for history, the grading an import carries with it, the attempt's `ProcessedAttempt` and its
 * outcomes, in the same write. A fact that names a stored instant (an evaluation of the attempt, a
 * person's value) is no host row (grizzle's insert stamps every instant it is given none of), so
 * each is written by its own program below. An item session is no fact of it: a session begins by
 * {@link begin} or a sitting's take, so the machine writes its start ("Start of every session").
 */
const facts = ChangeSet.empty(ResultLevel).insertAll({
  Attempt: [],
  ProcessedAttempt: [],
  ResponseSnapshot: [],
  SnapshotMultipleIdentifier: [],
  SnapshotSingleBoolean: [],
  SnapshotSingleFloat: [],
  SnapshotSingleString: [],
});

/**
 * The suite's role: every relation to read, and each family it writes by the mode the ledger
 * exports it in (pantry's `authorWrites` and the ledger's `*Writes`): a package's relations, an
 * item session's, the evaluations and a person's value, the take's values, grading's, what settling
 * a sitting writes, what the test runtime's programs write of a sitting, and the presence window.
 */
const Suite = role(ResultLevel, "result_runner", wholeEntriesOf(ResultLevel), {
  insert: [
    ...authorWrites.insert,
    ...sessionWrites.insert,
    ...evaluationWrites.insert,
    ...personValueWrites.insert,
    ...takeValuesWrites.insert,
    ...gradeAttemptWrites.insert,
    ...settleWrites.insert,
    ...sittingWrites.insert,
    ...presenceWrites.insert,
  ],
  write: [
    ...authorWrites.write,
    ...sessionWrites.write,
    ...evaluationWrites.write,
    ...personValueWrites.write,
    ...takeValuesWrites.write,
    ...gradeAttemptWrites.write,
    ...settleWrites.write,
    ...sittingWrites.write,
    ...presenceWrites.write,
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
 * An attempt of a sitting's member as host rows: the attempt with its snapshot, every instant the
 * insert's own.
 */
const sittingFacts = ChangeSet.empty(ResultLevel).insertAll({
  Attempt: [],
  ResponseSnapshot: [],
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
 * The item stage's session a call names, by its key, its stage and the seed its processing draws
 * under, as an application's decision makes one: what {@link begin} writes and takes.
 */
const namedSession = query(ResultLevel).rule((r) =>
  r.find({
    child: r.param("child", LearnerId),
    package: r.param("package", ItemSession.fields.package),
    path: r.param("path", ItemSession.fields.path),
    seed: r.param("seed", SessionSeed.fields.seed),
    stage: r.param("stage", ItemSession.fields.stage),
  }),
);

/**
 * An item stage's session, begun as an application's decision begins one (edullm's decideStage),
 * in one stratum: its item session and the seed its processing draws under ({@link namedSession}),
 * the control its stage states as host rows, and its take (`takeValuesOf`) over the same session,
 * so what its template processing set and the record it begins with are the machine's, as "Start
 * of every session" and "Item stage control" hold.
 */
const begin = ChangeSet.union(
  ChangeSet.empty(ResultLevel)
    .insert(
      ItemSession,
      query(ResultLevel).rule((r) =>
        r.find({
          child: r.param("child", LearnerId),
          package: r.param("package", ItemSession.fields.package),
          path: r.param("path", ItemSession.fields.path),
          stage: r.param("stage", ItemSession.fields.stage),
        }),
      ),
    )
    .insert(SessionSeed, namedSession)
    .insertAll({ StageControl: [] }),
  takeValuesOf(ResultLevel).bind({ takenSessions: namedSession }),
);

/**
 * The sitting a call names as an application's decision makes one, by its key, its test and its
 * decision's seed (`takenHeading`): what the test runtime's take reads.
 */
const namedTaken = query(ResultLevel).rule((r) =>
  r.find({
    child: r.param("child", takenHeading.child),
    package: r.param("package", takenHeading.package),
    path: r.param("path", takenHeading.path),
    seed: r.param("seed", takenHeading.seed),
    stage: r.param("stage", takenHeading.stage),
  }),
);

/**
 * The sitting a call names as {@link namedTaken} does, only where the child holds no unended sitting
 * of the test (`UnendedSitting`): the guard an application states in the query it binds `taken` to,
 * as edullm's QTI app (`appTaken`) and metis (`ownTaken`) do, which the sitting the take writes
 * makes false.
 */
const guardedTaken = query(ResultLevel).rule((r) => {
  const child = r.param("child", takenHeading.child);
  const pkg = r.param("package", takenHeading.package);
  const path = r.param("path", takenHeading.path);

  return r
    .match(DeliveredTest, { package: pkg, path })
    .where(r.not(UnendedSitting, { child, package: pkg, path }))
    .find({
      child,
      package: pkg,
      path,
      seed: r.param("seed", takenHeading.seed),
      stage: r.param("stage", takenHeading.stage),
    });
});

/**
 * The machine's own run of the template processing of the call's `sittings` (`sittingHeading`),
 * over takeArgumentsOf's readers bound to them as the take binds them, the registry's tables
 * unbound as the take passes them: what the take's stored values are held to
 * (`templateProcessingOf`, its seed the session's `SessionSeed`, its label `templateLabel` of the
 * item's identifier, no given value).
 */
const takeArguments = takeArgumentsOf(ResultLevel);

/**
 * The item sessions of the call's `sittings`, each with the seed its processing draws under, as the
 * take stored them: what the machine's own run of their template processing is given, as the take
 * gave its run the sessions it wrote.
 */
const storedSessions = query(ResultLevel).rule((r) => {
  const sittings = r.relation("sittings", sittingHeading);
  const { child, stage } = v(sittings, "storedSitting");
  const { package: pkg, path, seed } = v(SessionSeed, "storedSeed");

  return r
    .match(sittings, { child, stage })
    .match(SessionSeed, { child, package: pkg, path, seed, stage })
    .find({ child, package: pkg, path, seed, stage });
});

/**
 * The run's integer values once it ends, by holder, each keyed to the call's sitting by its run key
 * (child and stage, with package and path): the template variable's drawn value among them.
 */
const takeRunIntegersOf = query(ResultLevel).rule((r) => {
  const sittings = r.relation("sittings", sittingHeading);
  const sitting = { takenSessions: storedSessions.bind({ sittings }) };
  const run = Fn.row(templateProcessingOf, {
    booleans: takeArguments.booleans.bind(sitting),
    declaration_attributes: takeArguments.declaration_attributes.bind(sitting),
    declaration_texts: takeArguments.declaration_texts.bind(sitting),
    declarations: takeArguments.declarations.bind(sitting),
    directed_pairs: takeArguments.directed_pairs.bind(sitting),
    field_booleans: takeArguments.field_booleans.bind(sitting),
    field_directed_pairs: takeArguments.field_directed_pairs.bind(sitting),
    field_files: takeArguments.field_files.bind(sitting),
    field_floats: takeArguments.field_floats.bind(sitting),
    field_integers: takeArguments.field_integers.bind(sitting),
    field_pairs: takeArguments.field_pairs.bind(sitting),
    field_points: takeArguments.field_points.bind(sitting),
    field_texts: takeArguments.field_texts.bind(sitting),
    files: takeArguments.files.bind(sitting),
    floats: takeArguments.floats.bind(sitting),
    integers: takeArguments.integers.bind(sitting),
    pairs: takeArguments.pairs.bind(sitting),
    points: takeArguments.points.bind(sitting),
    programs: takeArguments.programs.bind(sitting),
    reply_floats: takeArguments.reply_floats.bind(sitting),
    reply_texts: takeArguments.reply_texts.bind(sitting),
    runs: takeArguments.runs.bind(sitting),
    table_bindings: takeArguments.table_bindings,
    table_entries: takeArguments.table_entries,
    table_values: takeArguments.table_values,
    texts: takeArguments.texts.bind(sitting),
    vars: takeArguments.vars.bind(sitting),
    walk_areas: takeArguments.walk_areas.bind(sitting),
    walk_categories: takeArguments.walk_categories.bind(sitting),
    walk_coords: takeArguments.walk_coords.bind(sitting),
    walk_customs: takeArguments.walk_customs.bind(sitting),
    walk_equals: takeArguments.walk_equals.bind(sitting),
    walk_filters: takeArguments.walk_filters.bind(sitting),
    walk_floats: takeArguments.walk_floats.bind(sitting),
    walk_idents: takeArguments.walk_idents.bind(sitting),
    walk_integers: takeArguments.walk_integers.bind(sitting),
    walk_literal_booleans: takeArguments.walk_literal_booleans.bind(sitting),
    walk_literal_directed_pairs: takeArguments.walk_literal_directed_pairs.bind(sitting),
    walk_literal_floats: takeArguments.walk_literal_floats.bind(sitting),
    walk_literal_integers: takeArguments.walk_literal_integers.bind(sitting),
    walk_literal_pairs: takeArguments.walk_literal_pairs.bind(sitting),
    walk_literal_points: takeArguments.walk_literal_points.bind(sitting),
    walk_literal_texts: takeArguments.walk_literal_texts.bind(sitting),
    walk_names: takeArguments.walk_names.bind(sitting),
    walk_patterns: takeArguments.walk_patterns.bind(sitting),
    walk_refs: takeArguments.walk_refs.bind(sitting),
    walk_rounds: takeArguments.walk_rounds.bind(sitting),
    walk_texts: takeArguments.walk_texts.bind(sitting),
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
      package: r.param("package", Package.fields.package),
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
 * The credit of the attempts of the item session a call names (`child`, `package`, `path`, `n`),
 * the session it graded.
 */
const creditsOf = query(ResultLevel).rule((r) => {
  const { at, earned, maximum, kind } = v(AttemptCredit, "credit");

  return r
    .match(AttemptCredit, {
      at,
      child: r.param("child", LearnerId),
      earned,
      kind,
      maximum,
      n: r.param("n", ItemSession.fields.n),
      package: r.param("package", ItemSession.fields.package),
      path: r.param("path", ItemSession.fields.path),
    })
    .find({ at, earned, kind, maximum });
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
 * The child's test outcome runs' single float values (`TestOutcomeSingleFloat`), each by its
 * sitting's stage, its run's instant and its variable.
 */
const testOutcomeFloatsOf = query(ResultLevel).rule((r) => {
  const { stage, at, variable, value } = v(TestOutcomeSingleFloat, "float");

  return r
    .match(TestOutcomeSingleFloat, {
      at,
      child: r.param("child", LearnerId),
      stage,
      value,
      variable,
    })
    .find({ at, stage, value, variable });
});

/**
 * The child's test outcome runs' single boolean values (`TestOutcomeSingleBoolean`), each by its
 * sitting's stage, its run's instant and its variable.
 */
const testOutcomeBooleansOf = query(ResultLevel).rule((r) => {
  const { stage, at, variable, value } = v(TestOutcomeSingleBoolean, "boolean");

  return r
    .match(TestOutcomeSingleBoolean, {
      at,
      child: r.param("child", LearnerId),
      stage,
      value,
      variable,
    })
    .find({ at, stage, value, variable });
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
 * The child's members' built-in `duration` (`ItemDuration`), in microseconds, each by its sitting
 * and its item.
 */
const durationsOf = query(ResultLevel).rule((r) => {
  const { stage, package: pkg, path, micros } = v(ItemDuration, "duration");

  return r
    .match(ItemDuration, { child: r.param("child", LearnerId), micros, package: pkg, path, stage })
    .find({ micros, package: pkg, path, stage });
});

/**
 * The child's sittings' presence windows (`Presence`), each by its sitting and its ends, half-open
 * in microseconds on the database's clock.
 */
const windowsOf = query(ResultLevel).rule((r) => {
  const { stage, during } = v(Presence, "window");

  return r.match(Presence, { child: r.param("child", LearnerId), during, stage }).find({
    from: Range.lower(during, Moment),
    stage,
    to: Range.upper(during, Moment),
  });
});

/**
 * The child's present time (`PresentTime`), each by its sitting, its question visit's instant
 * read as microseconds, and its UTC day.
 */
const presentTimesOf = query(ResultLevel).rule((r) => {
  const { stage, at, day, micros, path } = v(PresentTime, "presentTime");

  return r
    .match(PresentTime, { at, child: r.param("child", LearnerId), day, micros, path, stage })
    .find({ at: Type.base(at), day, micros, path, stage });
});

/**
 * The child's sittings' last beacons (`LastPresence`).
 */
const lastPresencesOf = query(ResultLevel).rule((r) => {
  const { stage, at } = v(LastPresence, "lastPresence");

  return r
    .match(LastPresence, { at, child: r.param("child", LearnerId), stage })
    .find({ at, stage });
});

/**
 * A presence window as host rows, written as no beacon writes one: the overlap its key refuses.
 */
const windowFacts = ChangeSet.empty(ResultLevel).insert(Presence, []);

/**
 * The child's sittings' candidate session budgets (`TestBudget`), each by its sitting and place.
 */
const budgetsOf = query(ResultLevel).rule((r) => {
  const { stage, k, remaining } = v(TestBudget, "budgetRow");

  return r
    .match(TestBudget, { child: r.param("child", LearnerId), k, remaining, stage })
    .find({ k, remaining, stage });
});

/**
 * The child's item sessions, each with its control and its state as every application reads them
 * (`sessionControlOf`, the read an application attaches under its own read of a session).
 */
const sessionsOf = query(ResultLevel)
  .rule((r) => {
    const { package: pkg, path, n, stage } = v(ItemSession, "served");

    return r
      .match(ItemSession, { child: r.param("child", LearnerId), n, package: pkg, path, stage })
      .find({ child: r.param("child", LearnerId), n, package: pkg, path, stage });
  })
  .attach("control", sessionControlOf(ResultLevel), "array");

/**
 * The child's sittings, each with the latest save of each of its item sessions and every value it
 * holds (`savedRowsOf`, the read an application attaches under its own read of a sitting).
 */
const savesOf = query(ResultLevel)
  .rule((r) => {
    const { stage } = v(TestSession, "savedSitting");

    return r
      .match(TestSession, { child: r.param("child", LearnerId), stage })
      .find({ child: r.param("child", LearnerId), stage });
  })
  .attach("saves", savedRowsOf(ResultLevel), "array");

/**
 * The sitting a call names by its key, `child` and `stage`, with each of its item sessions at its
 * latest attempt, its values as they stand, its credit and its marks (`attemptRowsOf`, the read an
 * application attaches under its own read of a sitting, as a review of it reads it).
 */
const reviewOf = query(ResultLevel)
  .rule((r) => r.find({ child: r.param("child", LearnerId), stage: r.param("stage", pg.bigint) }))
  .attach("attempts", attemptRowsOf(ResultLevel).sitting, "array");

/**
 * The child's item sessions' start records (`StartVariable`), each variable by its session's
 * sitting and item.
 */
const startsOf = query(ResultLevel).rule((r) => {
  const { stage, path, variable } = v(StartVariable, "start");

  return r
    .match(StartVariable, {
      child: r.param("child", LearnerId),
      package: r.param("package", StartVariable.fields.package),
      path,
      stage,
      variable,
    })
    .find({ path, stage, variable });
});

/**
 * The entry at the member a call names (`namedEntries`, its `item`), and the entry where its
 * candidate left the sitting (`resumedEntries`): each the ledger's one entry, its `entries` bound
 * on its own part.
 */
const namedEntry = sittingPrograms.enterTest.bind({ entries: sittingPrograms.namedEntries });

const resumedEntry = sittingPrograms.enterTest.bind({ entries: sittingPrograms.resumedEntries });

/**
 * The child's presentations (`TestPresented`), each by its sitting, its candidate session and its
 * item document.
 */
const presentationsOf = query(ResultLevel).rule((r) => {
  const { stage, at, k, path } = v(TestPresented, "presentation");

  return r
    .match(TestPresented, { at, child: r.param("child", LearnerId), k, path, stage })
    .find({ at, k, path, stage });
});

/**
 * The child's final sittings (`SittingFinal`), each by its stage: an ended sitting none of whose
 * attempts waits for its response processing or an external score.
 */
const finalsOf = query(ResultLevel).rule((r) => {
  const { stage } = v(SittingFinal, "final");

  return r.match(SittingFinal, { child: r.param("child", LearnerId), stage }).find({ stage });
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
      beaconAt: sittingPrograms.beaconTest.bind({ sittings: namedSitting }),
      beaconTest: clocked(sittingPrograms.beaconTest.bind({ sittings: namedSitting }), {
        now: "micros",
      }),
      begin,
      budgetsOf,
      completionsOf,
      creditsOf,
      deliveredTestsOf,
      drawsOf,
      durationsOf,
      endTest: sittingPrograms.endTest.bind({ sittings: namedSitting }),
      enterTest: namedEntry.bind({ sittings: namedSitting }),
      enterTimedTest: ChangeSet.union(namedEntry, firstBudget).bind({
        sittings: namedSitting,
      }),
      evaluate,
      facts,
      finalsOf,
      finishTest: ChangeSet.sequence(sittingPrograms.endTest, finishTestOf(ResultLevel)).bind({
        sittings: namedSitting,
      }),
      floatsOf,
      grade: gradeAttemptOf(ResultLevel).bind({ sittings: sessionSitting }),
      lastPresencesOf,
      maximaOf,
      operandsOf,
      pauseTest: clocked(
        ChangeSet.sequence(sittingPrograms.beaconTest, sittingPrograms.suspendTest).bind({
          sittings: namedSitting,
        }),
        { now: "micros" },
      ),
      presentItem: sittingPrograms.presentItem.bind({ sittings: namedSitting }),
      presentTimesOf,
      presentationsOf,
      publish: ChangeSet.union(insertWrite, ChangeSet.empty(ResultLevel)),
      recordEvaluations: ChangeSet.over(Suite, evaluations.recordEvaluations),
      resumeTest: resumedEntry.bind({ sittings: namedSitting }),
      reviewOf,
      saveTestItem: sittingPrograms.saveTestItem.bind({ sittings: namedSitting }),
      savesOf,
      sessionsOf,
      sittingFacts,
      snapshotBooleansOf,
      snapshotFloatsOf,
      snapshotIdentifierBagsOf,
      snapshotIdentifiersOf,
      snapshotStringsOf,
      startsOf,
      statusesOf,
      suspendTest: sittingPrograms.suspendTest.bind({ sittings: namedSitting }),
      takeGuarded: sittingPrograms.take.bind({ taken: guardedTaken }),
      takeRunIntegersOf,
      takeSitting: sittingPrograms.take.bind({ taken: namedTaken }),
      takenHeadersOf,
      takenIdentifiersOf,
      takenIntegersOf,
      testOutcomeBooleansOf,
      testOutcomeFloatsOf,
      windowFacts,
      windowsOf,
    }),
  ],
});
