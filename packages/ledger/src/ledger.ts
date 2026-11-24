import {
  alternatives,
  check,
  closed,
  closedId,
  contained,
  Crypto,
  derived,
  generated,
  instant,
  key,
  natural,
  Num,
  on,
  pg,
  place,
  pred,
  query,
  relation,
  schema,
  select,
  sha256,
  str,
  Type,
  unit,
  v,
} from "@bjornpagen/grizzle";
import type { Rule } from "@bjornpagen/grizzle";
import type { BuiltIn } from "@qti-pie/pantry/grammar/install.ts";
import {
  AttributeName,
  Cardinality,
  DeclarationKind,
  grammar,
  NodeKind,
} from "@qti-pie/pantry/grammar/install.ts";
import {
  identifierBytes,
  nameMaxBytes,
  QtiIdentifier,
  TemplateUri,
  uriBytes,
} from "@qti-pie/pantry/qti/limits.ts";
import { mediaTypeBytes } from "@qti-pie/pantry/qti/media.ts";
import { publishedTemplates, urisOf } from "@qti-pie/pantry/qti/templates.ts";
import { Option } from "effect";
import { CreditKind } from "#ledger/credit.ts";
import { DeclineReason, EvaluationResult, Feedback } from "#ledger/evaluations.ts";
import {
  AdmissionCode,
  admittedAttributes,
  BodyAttribute,
  BodyNode,
  DeclarationNode,
  declarationParts,
  DocBase,
  DocText,
  DocumentAttribute,
  DocVar,
  gradedAttributes,
  gradingFunctions,
  ProgramNode,
  processingKinds,
  TableBinding,
  TableEntry,
} from "#ledger/grading.ts";
import { anyText, LearnerId, ScorerId, someText } from "#ledger/keys.ts";
import { named } from "#ledger/laws.ts";
import type { RegistryLevel } from "#ledger/registry/levels.ts";
import { customOperators } from "#ledger/registry/operators.ts";
import { QtiFloat, QtiInteger } from "#ledger/scalars.ts";
import { SittingStanding, sittingTablesOf } from "#ledger/sittings.ts";
import { templatePackage } from "#ledger/template-package.ts";

/**
 * QTI's built-in `completionStatus` outcome, which no item declares (QTI 3.0 information model,
 * 4.4.2), by its four values.
 */
export const CompletionStatus = closed.ordered("CompletionStatus", [
  "completed",
  "incomplete",
  "not_attempted",
  "unknown",
]);

/**
 * What a response snapshot is: an attempt, whose response processing ran and ended with the values
 * it holds, or a save, the response values a session holds pending or suspended (QTI's
 * pendingSubmission and suspended states), with no response processing run.
 */
export const SnapshotKind = closed.ordered("SnapshotKind", ["attempt", "save"]);

/**
 * What an item session's template processing set of one variable, each by the rule that sets it
 * (`qti-set-template-value`, `qti-set-correct-response`, `qti-set-default-value`): a template
 * variable's value, a response's correct response, or a response's or an outcome's default.
 */
export const SessionValueKind = closed.ordered("SessionValueKind", [
  "template",
  "correct",
  "default",
]);

/**
 * QTI's two kinds of external scoring, `ExternalScoredEnum` (QTI 3.0.1 information model, Table
 * 8.21): `externalMachine`, "an external scoring system will be used to score the Item", and
 * `human`, "a human must score the Item". The tokens of an outcome declaration's `external-scored`
 * (Table 4.5.10, "Enumerated value set of: { externalMachine | human }", multiplicity [0..1]) and
 * the kind of an outcome's assertion alike, so the kind a declaration admits and the kind an
 * assertion is are one roster, and one law holds them equal. The XSD restricts the attribute to
 * these two enumerations of `xs:string`, whose white space is preserved, so a stored value is one
 * of them as written. QTI states no order between them.
 */
export const ExternalScoring = closed.unordered("ExternalScoring", ["externalMachine", "human"]);

/**
 * The ledger, `ledger` in PostgreSQL: QTI 3.0.1's session facts, what each learner was served and
 * did, over the QTI content it extends. Every key is the learner (`LearnerId`, an opaque id the
 * application assigns), the sitting the application served them in (`stage`, an opaque key it
 * assigns, a plain bigint here), an `instant` the database stamps, a place, and QTI's own identity:
 * a package by the name it is published under, an item by its document's path, a variable by the
 * identifier its item declares. Nothing is a minted id. Each instant is a clock or a reference
 * (grizzle's README, Instants): a snapshot's, a test session's moment and an assertion's are
 * clocks, stamped by the insert that adds them, greater than every instant of their child, so they
 * are ordered as they were committed whatever the server's clock reads; every other instant is a
 * stored one a containment carries. What assigns a learner a sitting, which policy decided it and
 * with what settings, is an application's level above this one, never QTI's.
 *
 * - **ItemSession**: an item a sitting serves, QTI's item session, by its package and item document
 *   and its place `n` among the learner's sessions of that item, which the database stamps one past
 *   the greatest (grizzle's `place`), so the places run gapless from 0 in the order the sessions
 *   were taken; its sitting (`stage`) beside it, at most one per sitting and item, which orders the
 *   sessions a migration numbers.
 * - **ItemSessionValue**: a variable the item session's template processing set at the take, and what
 *   it set (`SessionValueKind`), with its value in the sidecar of its declared base type and
 *   cardinality, **ItemSessionValue**`<Single|Multiple|Ordered><BaseType>`: no value row is the
 *   NULL template processing set. A template variable's value is a session fact, drawn once when
 *   the session is taken, never again. Its session is named by its stage, the session's other key,
 *   since the call that takes the session writes its values in the same insert that stamps the
 *   session's place, and a place is stamped only in its own relation, never carried to a row beside
 *   it as a stage's instant is.
 * - **StartVariable**: the record an item session begins with (COMPILE-AT-PUBLISH S), each variable
 *   that is no context as the machine's run of the session with no program leaves it, which the
 *   take stores once, beside the session's values, so a read of the session's start is a read by
 *   its key: each outcome at its default in force (a numeric single with none at 0),
 *   `completionStatus` at `unknown`, each template variable at its set or declared value, and each
 *   response NULL. Its value in the sidecar of its declared base type and cardinality,
 *   **Start**`<Single|Multiple|Ordered><BaseType>`, and a record's fields in **StartRecord**, each
 *   with its own base type, whose arm **StartRecord**`<BaseType>` holds its value; no value row is
 *   NULL. Its session is named by its stage, as a session value's is, and every item session holds
 *   one (ItemSession ⊆ StartVariable): its `completionStatus` at least.
 * - **SessionSeed**: the seed an item session's template and response processing draw under, by the
 *   session's sitting (`stage`) and item, which its take computes in the database from the take's
 *   seed (the SQL grader's `processingSeed`); every item session holds one (ItemSession ⊆
 *   SessionSeed).
 * - **StageControl**: the item-session control an item stage, a sitting that delivers its items as no
 *   test's members, is delivered under (QTI 3.0.1 §7.19, ItemSessionControl): `maxAttempts`, at
 *   least one ("Some attempt"), whether feedback shows once the session closes (`showFeedback`),
 *   whether the solution does (`showSolution`), and whether responses are validated
 *   (`validateResponses`). An item stage has no test whose scopes state them, so the application's
 *   decision states them, writing this beside the stage's item sessions, and the ledger derives
 *   what each session takes and shows from it (`#ledger/session-control.ts`); a test sitting holds
 *   none, its members' controls being its test's.
 * - **ResponseSnapshot**: the response and outcome values an item session held at an instant, the one
 *   header of its values, of a kind (`SnapshotKind`): an **Attempt**, its arm, or a **Save**, the
 *   response values pending or suspended, no response processing run. An attempt whose response
 *   processing ran is a **ProcessedAttempt**, with QTI's built-in completion status after it; its
 *   outcomes are the SQL grader's, written beside its responses. An attempt that submitted every
 *   response at its default, posting none (a skip, or a presented member its test's end submits
 *   unsaved), is a **DefaultSubmission**: the grader starts its responses at their defaults and
 *   writes them. A snapshot's instant is its clock, stamped by the insert that adds it, greater
 *   than every instant of its session, so a session's snapshots are ordered as they were committed;
 *   its arm and its values hold that instant.
 * - **Snapshot**`<Single|Multiple|Ordered><BaseType>`: the values the snapshot's response and outcome
 *   variables held, by the item's declared identifier, in the sidecar of the variable's declared
 *   cardinality and base type, typed: a single value; a multiple's distinct values, each with how
 *   many times it occurs; an ordered's values at their places from 0, gapless. NULL is no row. A
 *   multiple of float or duration keys each distinct value by its identity image, `bits`, grizzle's
 *   `Num.floatBits` of the value (its IEEE 754 bits, every NaN one), which the law BagImage holds
 *   it to, beside the value: a key compares a double as PostgreSQL's equality does, where `-0` is
 *   `0`, while plate's multiple holds the two zeros as two values. A read by the value stays
 *   native.
 * - **SnapshotRecord**: a record response's fields in the snapshot, each with its own base type,
 *   which no declaration states, so the field is the header and its value the arm of its base type,
 *   **SnapshotRecord**`<BaseType>`. A record with no field is NULL.
 * - **ApplicationDemand**: a recorded custom operator the attempt's response processing reached and
 *   could not evaluate, its value not yet recorded (the registry's `RecordedApplication`), by the
 *   attempt's key and the operator's place in the item's document (`start`): a fact of the grader's
 *   run, which only the grade write stores, so an application is requested exactly when the
 *   processing reaches it with a response (`rubric-score`'s contract: "NULL iff the response is
 *   NULL (no request is made)"), and never where a branch the processing takes passes it by, such
 *   as an essay its own rule finds empty. An operator that only an earlier operator's value lets
 *   the processing reach is demanded by the run after that value is recorded.
 * - **OperatorEvaluation**: the value a recorded custom operator took in an attempt (the registry's
 *   `RecordedApplication`, `#registry/levels.ts`), a fact the registered evaluator records once per
 *   application and attempt, which the SQL grader reads, so every invocation of response processing
 *   reads the same value (QTI 3.0.1 ASI §2.11.3: "Operators never effect the values of
 *   itemVariables directly"; ASI §2.5, a delivery engine "must only report the first set of
 *   outcomes produced"): by the attempt's key, the operator's place in the item's document
 *   (`start`) and the instant it was recorded, a clock whose child is the application, so one row
 *   per application and attempt; the operator's class, the grader version that produced it (the
 *   registry's `Grader`, of that class), `request`, the SHA-256 of the exact request body it sent,
 *   32 raw bytes (grizzle's `sha256`), which pins the model, its parameters, the prompt with its
 *   rubric, passage and question, the response and the maximum, and whether the model replied or
 *   declined. It answers a demand: a demanded application with no evaluation is pending (QTI 3.0.1
 *   RR Table 2.7.7, `pendingResponseProcessing`), derived and never stored.
 * - **OperatorReply**, **OperatorFeedback** and **OperatorDecline**: a replied evaluation's record,
 *   `rubric-score`'s fields, its `score` a finite float of zero or more and its `feedback` where
 *   the reply's is no empty string, which is QTI's NULL; a declined one's reason. A declined
 *   evaluation's value is NULL.
 * - **HumanDemand**: a rubric group of an attempt (the registry's `RubricGrader`, every
 *   `rubric-score` application of an item that names one scorer rubric block) whose every
 *   application the attempt's response processing reached declined, with no person's value: a fact
 *   of the grader's run, which only the grade write stores, as it stores ApplicationDemand, so a
 *   person is asked for a group exactly when the processing can go no further without one, and
 *   never while an application it reached is still in flight. A run that demands a person writes no
 *   outcome; the person's value answers it, and the run after it grades the attempt.
 * - **ApplicationMaximum** and **HumanDemandMaximum**: the maximum of each application the run
 *   demanded, its `maximum` operand as the grader evaluated it, the default in force; and the least
 *   of them over a group the run asked a person for. Facts of the run, which only the grade write
 *   stores, so the default in force has one implementation, the grader's, and the laws that bound a
 *   reply and a person's value read no content. No row is NULL.
 * - **HumanOperatorValue** and **HumanOperatorFeedback**: the value a person recorded for a rubric
 *   group the attempt's run asked a person for (HumanDemand), which the grader reads in place of
 *   each of the group's draws: by the attempt's key, the rubric block's `id` and the instant it was
 *   recorded, a clock whose child is the attempt and the group, append-only, the latest the one in
 *   force; the person who scored (`scorer`, a {@link ScorerId}) and the score, a finite float of
 *   zero or more; and the feedback where it is no empty string.
 *
 * A value's base type and cardinality are its declaration's, so no row states them: the relation a
 * value is in names them, and a law holds that relation to the declaration. Each base type's value
 * is typed as PostgreSQL compares it: `identifier`, `string` and `uri` as text; `boolean` as a
 * boolean; `integer` as an exact integral numeric ({@link QtiInteger}); `float` and `duration` (its
 * seconds) as a double ({@link QtiFloat}); `point` as its two integers `x` and `y`; `pair` as its
 * two identifiers in code-point order, `least` and `greatest`, so the two orders of one pair are
 * one row; `directedPair` as its `source` and `target`; and `file` as QTI's file value, "a binary
 * stream of data, with associated MIME type and file name": the SHA-256 of its bytes as its
 * `digest`, its MIME `type`, empty where none was reported, and its `name`. Its size is its bytes',
 * which the digest names, so no row states it, and a file is recorded only with its digest: plate's
 * form posts no file, so the app records none, and a file value at its boundary is a defect, never
 * a name with an invented digest.
 *
 * Numbers of attempts, whether an item session is open, the order items were served in and every
 * timestamp are derived from these facts and the content, never stored.
 */
/**
 * The relations of a learner's item sessions, by name and by the mode a role writes each by: a
 * take's item sessions and their seeds, the control an item stage's decision states beside them
 * (`StageControl`), and the snapshots and attempts a candidate's responses write, each closed, so
 * a role's insert list names it.
 */
export const sessionWrites = {
  insert: ["ItemSession", "SessionSeed", "StageControl", "ResponseSnapshot", "Attempt"],
  write: [],
} as const;

/**
 * The relations of an item session's context values, by name and by the mode a role writes each
 * by: what an application states of the session its processing reads (`SessionContext*`), each
 * closed, so a role's insert list names it.
 */
export const sessionContextWrites = {
  insert: ["SessionContextFloat", "SessionContextInteger", "SessionContextBoolean"],
  write: [],
} as const;

/**
 * The values an assertion sets, by base type, which both a person's and a machine's assertion
 * write beside its header.
 */
const assertedValueTables = [
  "AssertedSingleIdentifier",
  "AssertedSingleBoolean",
  "AssertedSingleInteger",
  "AssertedSingleFloat",
  "AssertedSingleString",
  "AssertedSinglePoint",
  "AssertedSinglePair",
  "AssertedSingleDirectedPair",
  "AssertedSingleDuration",
  "AssertedSingleUri",
  "AssertedSingleFile",
] as const;

/**
 * The relations a person's assertion of an outcome writes, by name, for a role's insert list: its
 * header, the person who asserted it, and its value.
 */
export const humanAssertionTables = [
  "OutcomeAssertion",
  "HumanAssertion",
  ...assertedValueTables,
] as const;

/**
 * The relations a machine's assertion of an outcome writes, by name, for a role's insert list: its
 * header, the grader version that asserted it, and its value.
 */
export const machineAssertionTables = [
  "OutcomeAssertion",
  "MachineAssertion",
  ...assertedValueTables,
] as const;

export const ledgerOf = (qti: RegistryLevel) => {
  const {
    Attribute,
    BaseType,
    BuiltInVariable,
    DeclarationName,
    Document,
    Grader,
    GraderVersion,
    Literal,
    NamedDeclaration,
    NormalMaximum,
    ObjectIdentifier,
    OperatorClass,
    Package,
    RecordedApplication,
    RegistryTable,
    RegistryWord,
    RubricGrader,
    TableRole,
    TypedDeclarationName,
  } = qti.relations;
  const { LateSubmission, TestPart, TestRoot } = qti.relations;

  /**
   * QTI's typed item variables (§2.2.2): every variable an item declares with a base type, by its
   * package, the item's `identifier` and the declared identifier, with its cardinality, its base
   * type and the kind of declaration: pantry's name views `DeclarationName` and
   * `TypedDeclarationName`, matched as they stand, never their joins restated (`@qti-pie/pantry`'s
   * level `QtiViews`, the one home of the shared views, its name views the one definition of what a
   * name names). A query over pantry's own rows, so nothing copies them: an item's identifier is
   * its root's, and a declared name is one per item (pantry's Item key and Declaration key).
   */
  const declaredVariables = query(qti).rule((r) => {
    const { package: pkg, path } = v(ObjectIdentifier, "item");
    const { identifier, cardinality, declarationKind } = v(DeclarationName, "declaration");
    const { baseType } = v(TypedDeclarationName, "typed");

    return r
      .match(ObjectIdentifier, { package: pkg, path })
      .match(DeclarationName, { cardinality, declarationKind, identifier, package: pkg, path })
      .match(TypedDeclarationName, { baseType, identifier, package: pkg, path })
      .find({ baseType, cardinality, declarationKind, identifier, package: pkg, path });
  });

  const ItemVariable = derived.stored("ItemVariable", declaredVariables);

  /**
   * An item's built-in session variable, by its name among QTI's (pantry's `BuiltIn` roster), as a
   * declaration of its kind stands (spec reading 111, "a processing element's `identifier` names a
   * variable of the kind the element reads or sets"): its declaration kind and cardinality pantry's
   * installed `BuiltInVariable` gives under the item root, read where the rule runs, so a name
   * pantry holds no row of there names nothing; and its base type, which pantry holds on the host
   * alone (`builtInBaseTypes`), never in a relation a query reads, so the rule states it.
   */
  const builtInVariable =
    (variable: (typeof BuiltIn.handles)[number], baseType: (typeof BaseType.handles)[number]) =>
    (r: Rule<typeof qti>) => {
      const { package: pkg, path } = v(ObjectIdentifier, "item");
      const { cardinality, declaration } = v(BuiltInVariable, "builtIn");

      return r
        .match(ObjectIdentifier, { package: pkg, path })
        .match(Document, { package: pkg, path, rootKind: "qti-assessment-item" })
        .match(BuiltInVariable, { cardinality, declaration, root: "qti-assessment-item", variable })
        .find({
          baseType: BaseType.handle(baseType),
          cardinality,
          declarationKind: declaration,
          identifier: Type.literal(QtiIdentifier, variable),
          package: pkg,
          path,
        });
    };

  /**
   * QTI's item session variables: every typed variable an item declares ({@link ItemVariable}'s
   * rows), and its built-in session variables ({@link builtInVariable}): `numAttempts` and
   * `duration`, its built-in responses ("There are two built-in response variables: 'numAttempts'
   * and 'duration'. These are declared implicitly and must not appear in a 'response declaration'",
   * QTI 3.0.1 information model §2.2.2.2; `duration` "a single float that records the accumulated
   * time (in seconds)"), and `completionStatus`, its built-in outcome ("There is one built-in
   * outcome variable, 'completionStatus', that is declared implicitly and must not appear in an
   * outcome declaration", §2.2.2.3, "a single identifier"); each by the item's package and
   * `identifier`, the variable's name, its cardinality, its base type and its declaration kind.
   * What template processing may set, of the kind its rule names. A declared name is never a
   * built-in's: QTI reserves them ("The identifiers of the built-in session variables are
   * reserved", 3.0.1 tables 4.5.1, 5.115.1 and 5.151.1), which pantry's `Declaration not reserved`
   * holds, so a variable is one row.
   */
  const sessionVariables = declaredVariables
    .rule(builtInVariable("numAttempts", "integer"))
    .rule(builtInVariable("duration", "float"))
    .rule(builtInVariable("completionStatus", "identifier"));
  const ItemSessionVariable = derived.stored("ItemSessionVariable", sessionVariables);

  /**
   * QTI's record variables: every variable an item declares of cardinality `record`, which has no
   * base type ("Variables with record cardinality have no base-type", QTI 3.0.1 information model,
   * tables 4.5.3, 5.34.3, 5.115.3 and 5.151.3), by its package, the item's `identifier` and the
   * declared identifier, with the kind of declaration: pantry's `DeclarationName` of cardinality
   * `record`.
   */
  const recordVariables = query(qti).rule((r) => {
    const { package: pkg, path } = v(ObjectIdentifier, "item");
    const { identifier, declarationKind } = v(DeclarationName, "declaration");

    return r
      .match(ObjectIdentifier, { package: pkg, path })
      .match(DeclarationName, {
        cardinality: "record",
        declarationKind,
        identifier,
        package: pkg,
        path,
      })
      .find({ declarationKind, identifier, package: pkg, path });
  });
  const ItemRecordVariable = derived.stored("ItemRecordVariable", recordVariables);

  /**
   * Every variable an item's session holds, by its package, the item's `identifier` and the
   * variable's name, with the kind of its declaration: a typed one or a built-in
   * ({@link ItemSessionVariable}'s rows) and a record ({@link ItemRecordVariable}'s). What a
   * session's start record is made of (`StartVariable`), a record's among them.
   */
  const SessionVariableName = derived.stored(
    "SessionVariableName",
    query(qti)
      .rule((r) => {
        const { declarationKind, identifier, package: pkg, path } = v(sessionVariables, "typed");

        return r
          .match(sessionVariables, { declarationKind, identifier, package: pkg, path })
          .find({ declarationKind, identifier, package: pkg, path });
      })
      .rule((r) => {
        const { declarationKind, identifier, package: pkg, path } = v(recordVariables, "record");

        return r
          .match(recordVariables, { declarationKind, identifier, package: pkg, path })
          .find({ declarationKind, identifier, package: pkg, path });
      }),
  );

  /**
   * The elements a delivered test's time limits may stand on, by their place: its root, and its one
   * part (Table 7.40, "Parents: AssessmentItemRef, AssessmentSection, AssessmentTest, TestPart"). A
   * delivered test times at most one of the two, and for a test of one part the two scopes time the
   * same span: "the time limits relate to the durations of all the item sessions plus any other
   * time spent navigating that part of the test" (§2.8.5).
   */
  const timingScopes = query(qti)
    .rule((r) => {
      const { package: pkg, path, start } = v(TestRoot, "timingRoot");

      return r
        .match(TestRoot, { package: pkg, path, start })
        .find({ package: pkg, path, scope: start });
    })
    .rule((r) => {
      const { package: pkg, path, start } = v(TestPart, "timingPart");

      return r
        .match(TestPart, { package: pkg, path, start })
        .find({ package: pkg, path, scope: start });
    });

  const TimingScope = derived("TimingScope", timingScopes);

  /**
   * The tests whose time limits allow late submission, at their root or their part (Table 7.40.3,
   * default false).
   */
  const lateTests = query(qti).rule((r) => {
    const { package: pkg, path, scope } = v(timingScopes, "lateScope");

    return r
      .match(timingScopes, { package: pkg, path, scope })
      .match(LateSubmission, { package: pkg, path, scope })
      .find({ package: pkg, path });
  });

  /**
   * {@link lateTests} stored: a test's content, known once its package is published, which the
   * learner part's judge reads at every timed response's COMMIT ("Response in time", "Suspended in
   * time"), so it reads the table, never the timing scopes again.
   */
  const LateTest = derived.stored("LateTest", lateTests);

  /**
   * QTI's outcome declarations a candidate sees, by the document's place `(package, path)` and the
   * declaration's `start`, with its identifier and cardinality: every outcome declaration that
   * writes no `view`, and every one whose `view` lists `candidate`. "The intended audience for an
   * outcome variable can be set with the view attribute. If no view is specified the outcome is
   * treated as relevant to all views." (QTI 3.0.1 information model, Table 4.5.4); its value space
   * is "A list from an enumerated value set of: { author | candidate | proctor | scorer |
   * testConstructor | tutor }", the XSD's `xs:list` of `ViewEnumDType`, so its tokens are its
   * audiences (`r.tokens`). The two rules are disjoint by whether the declaration writes a `view`.
   */
  const candidateOutcomes = query(qti)
    .rule((r) => {
      const {
        package: pkg,
        path,
        start,
        identifier,
        cardinality,
      } = v(DeclarationName, "declaration");

      return r
        .match(DeclarationName, {
          cardinality,
          declarationKind: "qti-outcome-declaration",
          identifier,
          package: pkg,
          path,
          start,
        })
        .where(r.not(Attribute, { name: "view", package: pkg, path, start }))
        .find({ cardinality, identifier, package: pkg, path, start });
    })
    .rule((r) => {
      const {
        package: pkg,
        path,
        start,
        identifier,
        cardinality,
      } = v(DeclarationName, "declaration");
      const { value: view } = v(Attribute, "view");

      return r
        .match(DeclarationName, {
          cardinality,
          declarationKind: "qti-outcome-declaration",
          identifier,
          package: pkg,
          path,
          start,
        })
        .match(Attribute, { name: "view", package: pkg, path, start, value: view })
        .match(r.tokens(view), { token: "candidate" })
        .find({ cardinality, identifier, package: pkg, path, start });
    });

  /**
   * The documents whose score a credit reads, by `(package, path)`, with the place of the score's
   * declaration: SCORE declared `single` where a candidate sees it ({@link candidateOutcomes}).
   * "Items that declare a numeric outcome variable representing the candidate's overall performance
   * on the item should use the outcome name 'SCORE' for the variable." (QTI 3.0.1 information
   * model, §2.2.2.3, NOT NORMATIVE). No normative rule types SCORE: §4.5's "SCORE needs to be a
   * float" uses no RFC 2119 keyword (§1.3), so pantry admits a SCORE of any base type, and a credit
   * reads a float SCORE, or an integer one whose double is exact, as its number
   * (`outcomeInForceNumber`). An `external-scored` SCORE is one of them: its value in force is its
   * latest assertion (Table 4.5.10; owner, 2026-11-19), the outcome in force's rule, never this
   * one's.
   */
  const scoreDeclared = query(qti).rule((r) => {
    const { package: pkg, path, start } = v(candidateOutcomes, "score");

    return r
      .match(candidateOutcomes, {
        cardinality: "single",
        identifier: "SCORE",
        package: pkg,
        path,
        start,
      })
      .find({ package: pkg, path, start });
  });

  /**
   * The documents whose credit's maximum is their MAXSCORE, by `(package, path)`: a score a credit
   * reads ({@link scoreDeclared}) and MAXSCORE declared `single` where a candidate sees it. "Items
   * that declare a maximum score (in multiple response choice interactions, for example) should do
   * so by declaring the 'MAXSCORE' variable." (QTI 3.0.1 information model, §2.2.2.3, NOT
   * NORMATIVE; §4.5's "MAXSCORE needs to be a float" uses no RFC 2119 keyword, so pantry admits a
   * MAXSCORE of any base type, read as SCORE is). The owner's rule's first source (proposal
   * 2026-11-18-grading-in-sql, Decision 3). Disjoint from {@link MaximumNormal}, which a MAXSCORE
   * declaration of any kind excludes; a MAXSCORE of another cardinality or one hidden from the
   * candidate is the document's statement too, so such a document has no credit at all, never
   * `normal-maximum`'s.
   */
  const MaximumOutcome = derived(
    "MaximumOutcome",
    query(qti).rule((r) => {
      const { package: pkg, path, start } = v(scoreDeclared, "score");
      const { start: maximumStart } = v(candidateOutcomes, "maximum");

      return r
        .match(scoreDeclared, { package: pkg, path, start })
        .match(candidateOutcomes, {
          cardinality: "single",
          identifier: "MAXSCORE",
          package: pkg,
          path,
          start: maximumStart,
        })
        .find({ package: pkg, path });
    }),
  );

  /**
   * The documents whose credit's maximum is their SCORE's `normal-maximum`, by `(package, path)`,
   * with that maximum: a score a credit reads ({@link scoreDeclared}), no MAXSCORE outcome
   * declaration at all, and a `normal-maximum` on SCORE's declaration, the double pantry's view
   * `NormalMaximum` reads from it (`Text.parseDouble`, XML Schema 1.1's doubleLexicalMap). "The
   * normalMaximum characteristic optionally defines the maximum magnitude of numeric outcome
   * variables, it must be a positive value." (QTI 3.0.1 information model, Table 4.5.7), its data
   * type `NonNegativeDouble`. The owner's rule's second source (proposal 2026-11-18-grading-in-sql,
   * Decision 3). A text that names no double is one pantry's value domain refuses, so the rule
   * holds no row of it; an infinite maximum is one the credit reads as none (`credit`).
   */
  const MaximumNormal = derived(
    "MaximumNormal",
    query(qti).rule((r) => {
      const { package: pkg, path, start } = v(scoreDeclared, "score");
      const { value: maximum } = v(NormalMaximum, "normal");

      return r
        .match(scoreDeclared, { package: pkg, path, start })
        .match(NormalMaximum, { package: pkg, path, start, value: maximum })
        .where(
          r.not(NamedDeclaration, {
            declarationKind: "qti-outcome-declaration",
            identifier: "MAXSCORE",
            package: pkg,
            path,
          }),
        )
        .find({ maximum, package: pkg, path });
    }),
  );

  /**
   * A package as the ledger names it: the name it is published under, pantry's.
   */
  const PackageName = Package.fields.package;

  /**
   * An item as the ledger names it in its package: its document's path, pantry's `Document` key
   * with its package, within pantry's EntryPath bound (REPRKEY's scan of every real package: p99.9
   * 88 bytes). QTI makes an item's `identifier` unique nowhere (information model §4.1.1,
   * info:6346: its type `Identifier`, not `UniqueIdentifier`), so two items of one package may
   * share one, and the document is what names one item (SPEC-AUDIT SV-KEY-01).
   */
  const ItemPath = Document.fields.path;

  /**
   * A variable as its item declares it: its declaration's `identifier`, pantry's one QTI identifier
   * type (`QtiIdentifier`), whose byte bound every key over it fits (REPRKEY's scan of every real
   * item: a ledger variable's p99.9 11 bytes).
   */
  const VariableName = QtiIdentifier;

  /**
   * A text single of an identifier: QTI's identifier, of one character or more (QTI reads the empty
   * string as NULL), within pantry's identifier bound (`identifierBytes`), drawn from the item's
   * own declarations and choices (REPRKEY's scan of every real item: a QTI identifier's p99.9 83
   * bytes). QTI bounds no identifier, so a longer one is a known deviation, dated 2026-11-22, until
   * the identifier's digest re-key after the singleton-migration wipe (pantry's `identifierBytes`).
   */
  const IdentifierValue = named("Key text bound", str.bytes(identifierBytes, someText));

  /**
   * A text single of a URI, of one character or more, within pantry's URI bound (`uriBytes`).
   * RFC 3986 bounds no URI, so a longer response is a known deviation, dated 2026-11-22, until the
   * ledger's digest re-key of its response keys after the singleton-migration wipe.
   */
  const UriValue = named("Key text bound", str.bytes(uriBytes, someText));

  /**
   * A file value's name, of one character or more, since an empty name names no file (plate's
   * `parseLexical`): a file name, which a file system bounds at NAME_MAX (pantry's
   * `nameMaxBytes`).
   */
  const FileName = named("Key text bound", str.bytes(nameMaxBytes, someText));

  /**
   * A file value's MIME type as its sender states it, empty where none was reported: RFC 6838's
   * type and subtype of at most 127 characters each about a "/" (pantry's `mediaTypeBytes`). It
   * takes the bound alone, never a media type's pattern: a candidate's upload states its type as
   * the browser sends it, and an answer is never refused for its spelling.
   */
  const FileType = named("Key text bound", str.bytes(mediaTypeBytes, anyText));

  /**
   * Each base type's value as its columns: one value, a point's two integers, a pair's two
   * identifiers or a file's three fields. An identifier, a pair's and a directed pair's
   * identifiers, a URI and a file's name and type are bounded texts, each by its type's bound, so a
   * multiple's key holds each of its members as itself. A string has no byte bound, so a string of
   * any length is stored (SPEC-AUDIT SV-LEDGER-01: QTI sets no length on a value, and delivery
   * "must be able to collect and store the responses", conformance §2.2): a candidate's free text,
   * which no key entry holds, so a multiple of strings keys each member by its digest,
   * `valueDigest`, the SHA-256 of its UTF-8 (grizzle's `sha256`, 32 raw bytes), generated by
   * PostgreSQL from the row and never written; a write states the member by its text, and a read
   * that joins a member states the digest's equality first and the text's second. A file's `digest`
   * is the SHA-256 of its bytes, 32 raw bytes (grizzle's `sha256`), as pantry's digest of a package
   * file's bytes is (`Media`), which its writer computes, since no row holds the bytes.
   */
  const leaf = {
    boolean: { value: pg.boolean },
    directedPair: { source: QtiIdentifier, target: QtiIdentifier },
    duration: { value: QtiFloat },
    file: { digest: sha256, name: FileName, type: FileType },
    float: { value: QtiFloat },
    identifier: { value: IdentifierValue },
    integer: { value: QtiInteger },
    pair: { greatest: QtiIdentifier, least: QtiIdentifier },
    point: { x: QtiInteger, y: QtiInteger },
    string: { value: someText },
    uri: { value: UriValue },
  } as const;

  /**
   * An item session's key's fields: the child, the item, and its place among the child's sessions
   * of the item.
   */
  const sessionFields = {
    child: LearnerId,
    n: natural,
    package: PackageName,
    path: ItemPath,
  } as const;
  const sessionKey = ["child", "package", "path", "n"] as const;

  /**
   * A response snapshot's key's fields: its item session's, and the instant it was taken, its
   * clock's.
   */
  const snapshotFields = { ...sessionFields, at: instant } as const;
  const snapshotKey = ["child", "package", "path", "n", "at"] as const;

  /**
   * A snapshot's value's key's fields: its snapshot's, and the variable.
   */
  const snapshotValue = { ...snapshotFields, variable: VariableName } as const;
  const snapshotValueKey = [...snapshotKey, "variable"] as const;

  /**
   * An item session's value's key's fields: its item session's by its stage, what template
   * processing set and the variable.
   */
  const sessionValue = {
    child: LearnerId,
    kind: closedId(SessionValueKind),
    package: PackageName,
    path: ItemPath,
    stage: pg.bigint,
    variable: VariableName,
  } as const;
  const sessionValueKey = ["child", "stage", "package", "path", "kind", "variable"] as const;

  const ItemSession = named(
    "Item session place",
    relation(
      "ItemSession",
      { ...sessionFields, n: place.by("stage"), stage: pg.bigint },
      sessionKey,
    ),
  );
  /**
   * The seed an item session's template and response processing draw under, a session fact its take
   * computes in the database from its decision's seed (the machine's `processing_seed`, an
   * HMAC-SHA-256 tag, 32 raw bytes, held in grizzle's `sha256`, the width of every SHA-256 output),
   * by the session's sitting: every take writes one, held by ItemSession ⊆ SessionSeed. A run keys
   * its draw stream by the seed's hex (the machine's `seed_stream_key`), plate's protocol.
   */
  const SessionSeed = named(
    "One seed a session",
    relation(
      "SessionSeed",
      { child: LearnerId, package: PackageName, path: ItemPath, seed: sha256, stage: pg.bigint },
      ["child", "stage", "package", "path"],
    ),
  );
  /**
   * The item-session control an application's decision states for an item stage, by the stage: its
   * `max-attempts`, at least one, and its `show-feedback`, `show-solution` and `validate-responses`
   * (QTI 3.0.1 Tables 7.19.1, 7.19.2, 7.19.3, 7.19.7), every one stated, none defaulted.
   */
  const StageControl = named(
    "One control a stage",
    relation(
      "StageControl",
      {
        child: LearnerId,
        maxAttempts: natural,
        showFeedback: pg.boolean,
        showSolution: pg.boolean,
        stage: pg.bigint,
        validateResponses: pg.boolean,
      },
      ["child", "stage"],
    ),
  );
  const ResponseSnapshot = named(
    "Snapshot instant",
    relation("ResponseSnapshot", { ...snapshotFields, kind: closedId(SnapshotKind) }, snapshotKey),
  );
  const Attempt = named("Snapshot instant", relation("Attempt", snapshotFields, snapshotKey));
  /**
   * An attempt whose response processing ran, with QTI's built-in completion status after it
   * (§2.2.2.3): the one home of `completionStatus`, which no value sidecar holds. An attempt with
   * none is pending response processing (QTI Results Reporting, Table 2.7.7,
   * `pendingResponseProcessing`): a custom operator awaits its evaluation, or a rubric group a
   * person's value.
   */
  const ProcessedAttempt = named(
    "Snapshot instant",
    relation(
      "ProcessedAttempt",
      { ...snapshotFields, completionStatus: closedId(CompletionStatus) },
      snapshotKey,
    ),
  );
  /**
   * An attempt that submitted every response at its default in force, posting none (QTI 3.0.1 Table
   * 7.19.6: "all response variables are submitted with their default value or are NULL"): a skip,
   * or a presented member its test's end submits unsaved. Its response processing starts each
   * response at its default (the machine's start_of: its template-set default, else its declared
   * one, once the attempt is the session's first or later, numAttempts > 0, Table 5.115), and the
   * grader writes the responses it ran with beside its outcomes. An item never presented has no
   * attempt: "the response variable remains NULL and the default value is never used" (Table
   * 5.115).
   */
  const DefaultSubmission = named(
    "Snapshot instant",
    relation("DefaultSubmission", snapshotFields, snapshotKey),
  );
  /**
   * A response given and not submitted, every one kept: the latest is what a session's responses
   * are now (what the end submits and a reopened item restores), and the ones before it are
   * evidence of how the child worked, which dropping cannot undo. A relation of the current save
   * alone was rejected (2026-11-22): its case was row counts, and load is grizzle's and disk never
   * a concern.
   */
  const Save = named("Snapshot instant", relation("Save", snapshotFields, snapshotKey));
  /**
   * A sitting's response snapshot with `given`, the browser's reading of the database's clock when
   * the candidate gave it, in microseconds since the Unix epoch, at or before the snapshot's own
   * instant ("Given before"): a response the candidate gave carries it,
   * and the end's attempts none (`#sitting-programs.ts`); the database records it beside its own
   * instant and never orders by it, nor admits a response by it: the database's stamp is the
   * clock (`#delivery.ts` inFlightGraceMicros). A sensor reading, so a bound, never a clock.
   */
  const SnapshotGiven = named(
    "Snapshot instant",
    relation("SnapshotGiven", { ...snapshotFields, given: pg.bigint }, snapshotKey),
  );

  const SnapshotSingleIdentifier = named(
    "Single value",
    relation(
      "SnapshotSingleIdentifier",
      { ...snapshotValue, ...leaf.identifier },
      snapshotValueKey,
    ),
  );
  const SnapshotSingleBoolean = named(
    "Single value",
    relation("SnapshotSingleBoolean", { ...snapshotValue, ...leaf.boolean }, snapshotValueKey),
  );
  const SnapshotSingleInteger = named(
    "Single value",
    relation("SnapshotSingleInteger", { ...snapshotValue, ...leaf.integer }, snapshotValueKey),
  );
  const SnapshotSingleFloat = named(
    "Single value",
    relation("SnapshotSingleFloat", { ...snapshotValue, ...leaf.float }, snapshotValueKey),
  );
  const SnapshotSingleString = named(
    "Single value",
    relation("SnapshotSingleString", { ...snapshotValue, ...leaf.string }, snapshotValueKey),
  );
  const SnapshotSinglePoint = named(
    "Single value",
    relation("SnapshotSinglePoint", { ...snapshotValue, ...leaf.point }, snapshotValueKey),
  );
  const SnapshotSinglePair = named(
    "Single value",
    relation("SnapshotSinglePair", { ...snapshotValue, ...leaf.pair }, snapshotValueKey),
  );
  const SnapshotSingleDirectedPair = named(
    "Single value",
    relation(
      "SnapshotSingleDirectedPair",
      { ...snapshotValue, ...leaf.directedPair },
      snapshotValueKey,
    ),
  );
  const SnapshotSingleDuration = named(
    "Single value",
    relation("SnapshotSingleDuration", { ...snapshotValue, ...leaf.duration }, snapshotValueKey),
  );
  const SnapshotSingleUri = named(
    "Single value",
    relation("SnapshotSingleUri", { ...snapshotValue, ...leaf.uri }, snapshotValueKey),
  );
  const SnapshotSingleFile = named(
    "Single value",
    relation("SnapshotSingleFile", { ...snapshotValue, ...leaf.file }, snapshotValueKey),
  );

  const SnapshotMultipleIdentifier = named(
    "Distinct values",
    relation(
      "SnapshotMultipleIdentifier",
      { ...snapshotValue, ...leaf.identifier, count: natural },
      [...snapshotValueKey, "value"],
    ),
  );
  const SnapshotMultipleBoolean = named(
    "Distinct values",
    relation("SnapshotMultipleBoolean", { ...snapshotValue, ...leaf.boolean, count: natural }, [
      ...snapshotValueKey,
      "value",
    ]),
  );
  const SnapshotMultipleInteger = named(
    "Distinct values",
    relation("SnapshotMultipleInteger", { ...snapshotValue, ...leaf.integer, count: natural }, [
      ...snapshotValueKey,
      "value",
    ]),
  );
  const SnapshotMultipleFloat = named(
    "Distinct values",
    relation(
      "SnapshotMultipleFloat",
      { ...snapshotValue, bits: pg.bigint, ...leaf.float, count: natural },
      [...snapshotValueKey, "bits"],
    ),
  );
  const SnapshotMultipleString = named(
    "Distinct values",
    relation.generated(
      "SnapshotMultipleString",
      { ...snapshotValue, ...leaf.string, count: natural },
      [...snapshotValueKey, "valueDigest"],
      (row) => ({
        valueDigest: named("Value digest", generated(sha256, Crypto.sha256(row.value))),
      }),
    ),
  );
  const SnapshotMultiplePoint = named(
    "Distinct values",
    relation("SnapshotMultiplePoint", { ...snapshotValue, ...leaf.point, count: natural }, [
      ...snapshotValueKey,
      "x",
      "y",
    ]),
  );
  const SnapshotMultiplePair = named(
    "Distinct values",
    relation("SnapshotMultiplePair", { ...snapshotValue, ...leaf.pair, count: natural }, [
      ...snapshotValueKey,
      "least",
      "greatest",
    ]),
  );
  const SnapshotMultipleDirectedPair = named(
    "Distinct values",
    relation(
      "SnapshotMultipleDirectedPair",
      { ...snapshotValue, ...leaf.directedPair, count: natural },
      [...snapshotValueKey, "source", "target"],
    ),
  );
  const SnapshotMultipleDuration = named(
    "Distinct values",
    relation(
      "SnapshotMultipleDuration",
      { ...snapshotValue, bits: pg.bigint, ...leaf.duration, count: natural },
      [...snapshotValueKey, "bits"],
    ),
  );
  const SnapshotMultipleUri = named(
    "Distinct values",
    relation("SnapshotMultipleUri", { ...snapshotValue, ...leaf.uri, count: natural }, [
      ...snapshotValueKey,
      "value",
    ]),
  );
  const SnapshotMultipleFile = named(
    "Distinct values",
    relation("SnapshotMultipleFile", { ...snapshotValue, ...leaf.file, count: natural }, [
      ...snapshotValueKey,
      "digest",
      "name",
      "type",
    ]),
  );

  const SnapshotOrderedIdentifier = named(
    "One value a place",
    relation(
      "SnapshotOrderedIdentifier",
      { ...snapshotValue, place: natural, ...leaf.identifier },
      [...snapshotValueKey, "place"],
    ),
  );
  const SnapshotOrderedBoolean = named(
    "One value a place",
    relation("SnapshotOrderedBoolean", { ...snapshotValue, place: natural, ...leaf.boolean }, [
      ...snapshotValueKey,
      "place",
    ]),
  );
  const SnapshotOrderedInteger = named(
    "One value a place",
    relation("SnapshotOrderedInteger", { ...snapshotValue, place: natural, ...leaf.integer }, [
      ...snapshotValueKey,
      "place",
    ]),
  );
  const SnapshotOrderedFloat = named(
    "One value a place",
    relation("SnapshotOrderedFloat", { ...snapshotValue, place: natural, ...leaf.float }, [
      ...snapshotValueKey,
      "place",
    ]),
  );
  const SnapshotOrderedString = named(
    "One value a place",
    relation("SnapshotOrderedString", { ...snapshotValue, place: natural, ...leaf.string }, [
      ...snapshotValueKey,
      "place",
    ]),
  );
  const SnapshotOrderedPoint = named(
    "One value a place",
    relation("SnapshotOrderedPoint", { ...snapshotValue, place: natural, ...leaf.point }, [
      ...snapshotValueKey,
      "place",
    ]),
  );
  const SnapshotOrderedPair = named(
    "One value a place",
    relation("SnapshotOrderedPair", { ...snapshotValue, place: natural, ...leaf.pair }, [
      ...snapshotValueKey,
      "place",
    ]),
  );
  const SnapshotOrderedDirectedPair = named(
    "One value a place",
    relation(
      "SnapshotOrderedDirectedPair",
      { ...snapshotValue, place: natural, ...leaf.directedPair },
      [...snapshotValueKey, "place"],
    ),
  );
  const SnapshotOrderedDuration = named(
    "One value a place",
    relation("SnapshotOrderedDuration", { ...snapshotValue, place: natural, ...leaf.duration }, [
      ...snapshotValueKey,
      "place",
    ]),
  );
  const SnapshotOrderedUri = named(
    "One value a place",
    relation("SnapshotOrderedUri", { ...snapshotValue, place: natural, ...leaf.uri }, [
      ...snapshotValueKey,
      "place",
    ]),
  );
  const SnapshotOrderedFile = named(
    "One value a place",
    relation("SnapshotOrderedFile", { ...snapshotValue, place: natural, ...leaf.file }, [
      ...snapshotValueKey,
      "place",
    ]),
  );

  /**
   * A record field's key's fields: its snapshot's value's, and the field's name, a QTI identifier.
   */
  const fielded = { ...snapshotValue, field: QtiIdentifier } as const;
  const fieldedKey = [...snapshotValueKey, "field"] as const;

  /**
   * A record response's field in a snapshot, with its base type, whose arm holds its value,
   * inserted with it.
   */
  const SnapshotRecord = named(
    "One value a field",
    relation("SnapshotRecord", { ...fielded, baseType: closedId(BaseType) }, fieldedKey),
  );
  const SnapshotRecordIdentifier = named(
    "One value a field",
    relation("SnapshotRecordIdentifier", { ...fielded, ...leaf.identifier }, fieldedKey),
  );
  const SnapshotRecordBoolean = named(
    "One value a field",
    relation("SnapshotRecordBoolean", { ...fielded, ...leaf.boolean }, fieldedKey),
  );
  const SnapshotRecordInteger = named(
    "One value a field",
    relation("SnapshotRecordInteger", { ...fielded, ...leaf.integer }, fieldedKey),
  );
  const SnapshotRecordFloat = named(
    "One value a field",
    relation("SnapshotRecordFloat", { ...fielded, ...leaf.float }, fieldedKey),
  );
  const SnapshotRecordString = named(
    "One value a field",
    relation("SnapshotRecordString", { ...fielded, ...leaf.string }, fieldedKey),
  );
  const SnapshotRecordPoint = named(
    "One value a field",
    relation("SnapshotRecordPoint", { ...fielded, ...leaf.point }, fieldedKey),
  );
  const SnapshotRecordPair = named(
    "One value a field",
    relation("SnapshotRecordPair", { ...fielded, ...leaf.pair }, fieldedKey),
  );
  const SnapshotRecordDirectedPair = named(
    "One value a field",
    relation("SnapshotRecordDirectedPair", { ...fielded, ...leaf.directedPair }, fieldedKey),
  );
  const SnapshotRecordDuration = named(
    "One value a field",
    relation("SnapshotRecordDuration", { ...fielded, ...leaf.duration }, fieldedKey),
  );
  const SnapshotRecordUri = named(
    "One value a field",
    relation("SnapshotRecordUri", { ...fielded, ...leaf.uri }, fieldedKey),
  );
  const SnapshotRecordFile = named(
    "One value a field",
    relation("SnapshotRecordFile", { ...fielded, ...leaf.file }, fieldedKey),
  );

  /**
   * A test's outcomes after a run of its outcome processing (QTI 3.0.1 information model, Table
   * 5.102, OutcomeProcessing), stored by the transition whose transaction runs it (Bjorn,
   * 2026-11-20: "grading MUST be done in the same database transaction"): the end of the test's
   * part (`finishTest`), and any later write that changes an item outcome it reads, each a new run,
   * never a rewrite, since every run is a function of the item sessions' outcomes in force when it
   * ran ("The values of the test's outcome variables are always reset to their defaults prior to
   * carrying out the instructions described by the outcomeRules", info:37242). The run in force is
   * the latest.
   *
   * - **TestOutcomeRun**: one run, by its sitting and its instant, a clock whose child is the
   *   sitting, stamped by the insert that adds it, so a sitting's runs are ordered as they were
   *   committed.
   * - **TestOutcome**`<Single|Multiple|Ordered><BaseType>` and **TestOutcomeRecord**(`<BaseType>`):
   *   the values the run left the test's outcome variables, by the test's declared identifier, in
   *   the sidecar of the variable's declared cardinality and base type, each leaf typed as a
   *   snapshot's ({@link leaf}). NULL is no row.
   */
  const runFields = { at: instant, child: LearnerId, stage: pg.bigint } as const;
  const runKey = ["child", "stage", "at"] as const;
  const runValue = { ...runFields, variable: VariableName } as const;
  const runValueKey = [...runKey, "variable"] as const;
  const runFielded = { ...runValue, field: QtiIdentifier } as const;
  const runFieldedKey = [...runValueKey, "field"] as const;

  const TestOutcomeRun = named("Run instant", relation("TestOutcomeRun", runFields, runKey));

  /**
   * The value the delivery engine bound for one of a sitting's test context declarations (QTI 3.0.1
   * information model, Table 5.34, ContextDeclaration: "Context variables are typically used to
   * inject the 'context' under which an item or test session is operating"), a fact of the sitting,
   * written once by the application that binds it (the value only it knows: a timed sitting's
   * applied limit, an assignment's grade facts) and read by every run of the sitting's outcome
   * processing, so each run binds the same values. One sidecar per base type a served form binds, a
   * single value each; no row is a context the engine does not bind, whose declared default
   * stands.
   */
  const contextFields = { child: LearnerId, identifier: VariableName, stage: pg.bigint } as const;
  const contextKey = ["child", "stage", "identifier"] as const;
  const SessionContextFloat = named(
    "One context value",
    relation("SessionContextFloat", { ...contextFields, ...leaf.float }, contextKey),
  );
  const SessionContextInteger = named(
    "One context value",
    relation("SessionContextInteger", { ...contextFields, ...leaf.integer }, contextKey),
  );
  const SessionContextBoolean = named(
    "One context value",
    relation("SessionContextBoolean", { ...contextFields, ...leaf.boolean }, contextKey),
  );
  const TestOutcomeSingleIdentifier = named(
    "Single value",
    relation("TestOutcomeSingleIdentifier", { ...runValue, ...leaf.identifier }, runValueKey),
  );
  const TestOutcomeSingleBoolean = named(
    "Single value",
    relation("TestOutcomeSingleBoolean", { ...runValue, ...leaf.boolean }, runValueKey),
  );
  const TestOutcomeSingleInteger = named(
    "Single value",
    relation("TestOutcomeSingleInteger", { ...runValue, ...leaf.integer }, runValueKey),
  );
  const TestOutcomeSingleFloat = named(
    "Single value",
    relation("TestOutcomeSingleFloat", { ...runValue, ...leaf.float }, runValueKey),
  );
  const TestOutcomeSingleString = named(
    "Single value",
    relation("TestOutcomeSingleString", { ...runValue, ...leaf.string }, runValueKey),
  );
  const TestOutcomeSinglePoint = named(
    "Single value",
    relation("TestOutcomeSinglePoint", { ...runValue, ...leaf.point }, runValueKey),
  );
  const TestOutcomeSinglePair = named(
    "Single value",
    relation("TestOutcomeSinglePair", { ...runValue, ...leaf.pair }, runValueKey),
  );
  const TestOutcomeSingleDirectedPair = named(
    "Single value",
    relation("TestOutcomeSingleDirectedPair", { ...runValue, ...leaf.directedPair }, runValueKey),
  );
  const TestOutcomeSingleDuration = named(
    "Single value",
    relation("TestOutcomeSingleDuration", { ...runValue, ...leaf.duration }, runValueKey),
  );
  const TestOutcomeSingleUri = named(
    "Single value",
    relation("TestOutcomeSingleUri", { ...runValue, ...leaf.uri }, runValueKey),
  );
  const TestOutcomeSingleFile = named(
    "Single value",
    relation("TestOutcomeSingleFile", { ...runValue, ...leaf.file }, runValueKey),
  );
  const TestOutcomeMultipleIdentifier = named(
    "Distinct values",
    relation("TestOutcomeMultipleIdentifier", { ...runValue, ...leaf.identifier, count: natural }, [
      ...runValueKey,
      "value",
    ]),
  );
  const TestOutcomeMultipleBoolean = named(
    "Distinct values",
    relation("TestOutcomeMultipleBoolean", { ...runValue, ...leaf.boolean, count: natural }, [
      ...runValueKey,
      "value",
    ]),
  );
  const TestOutcomeMultipleInteger = named(
    "Distinct values",
    relation("TestOutcomeMultipleInteger", { ...runValue, ...leaf.integer, count: natural }, [
      ...runValueKey,
      "value",
    ]),
  );
  const TestOutcomeMultipleFloat = named(
    "Distinct values",
    relation(
      "TestOutcomeMultipleFloat",
      { ...runValue, bits: pg.bigint, ...leaf.float, count: natural },
      [...runValueKey, "bits"],
    ),
  );
  const TestOutcomeMultipleString = named(
    "Distinct values",
    relation.generated(
      "TestOutcomeMultipleString",
      { ...runValue, ...leaf.string, count: natural },
      [...runValueKey, "valueDigest"],
      (row) => ({
        valueDigest: named("Value digest", generated(sha256, Crypto.sha256(row.value))),
      }),
    ),
  );
  const TestOutcomeMultiplePoint = named(
    "Distinct values",
    relation("TestOutcomeMultiplePoint", { ...runValue, ...leaf.point, count: natural }, [
      ...runValueKey,
      "x",
      "y",
    ]),
  );
  const TestOutcomeMultiplePair = named(
    "Distinct values",
    relation("TestOutcomeMultiplePair", { ...runValue, ...leaf.pair, count: natural }, [
      ...runValueKey,
      "least",
      "greatest",
    ]),
  );
  const TestOutcomeMultipleDirectedPair = named(
    "Distinct values",
    relation(
      "TestOutcomeMultipleDirectedPair",
      { ...runValue, ...leaf.directedPair, count: natural },
      [...runValueKey, "source", "target"],
    ),
  );
  const TestOutcomeMultipleDuration = named(
    "Distinct values",
    relation(
      "TestOutcomeMultipleDuration",
      { ...runValue, bits: pg.bigint, ...leaf.duration, count: natural },
      [...runValueKey, "bits"],
    ),
  );
  const TestOutcomeMultipleUri = named(
    "Distinct values",
    relation("TestOutcomeMultipleUri", { ...runValue, ...leaf.uri, count: natural }, [
      ...runValueKey,
      "value",
    ]),
  );
  const TestOutcomeMultipleFile = named(
    "Distinct values",
    relation("TestOutcomeMultipleFile", { ...runValue, ...leaf.file, count: natural }, [
      ...runValueKey,
      "digest",
      "name",
      "type",
    ]),
  );
  const TestOutcomeOrderedIdentifier = named(
    "One value a place",
    relation("TestOutcomeOrderedIdentifier", { ...runValue, place: natural, ...leaf.identifier }, [
      ...runValueKey,
      "place",
    ]),
  );
  const TestOutcomeOrderedBoolean = named(
    "One value a place",
    relation("TestOutcomeOrderedBoolean", { ...runValue, place: natural, ...leaf.boolean }, [
      ...runValueKey,
      "place",
    ]),
  );
  const TestOutcomeOrderedInteger = named(
    "One value a place",
    relation("TestOutcomeOrderedInteger", { ...runValue, place: natural, ...leaf.integer }, [
      ...runValueKey,
      "place",
    ]),
  );
  const TestOutcomeOrderedFloat = named(
    "One value a place",
    relation("TestOutcomeOrderedFloat", { ...runValue, place: natural, ...leaf.float }, [
      ...runValueKey,
      "place",
    ]),
  );
  const TestOutcomeOrderedString = named(
    "One value a place",
    relation("TestOutcomeOrderedString", { ...runValue, place: natural, ...leaf.string }, [
      ...runValueKey,
      "place",
    ]),
  );
  const TestOutcomeOrderedPoint = named(
    "One value a place",
    relation("TestOutcomeOrderedPoint", { ...runValue, place: natural, ...leaf.point }, [
      ...runValueKey,
      "place",
    ]),
  );
  const TestOutcomeOrderedPair = named(
    "One value a place",
    relation("TestOutcomeOrderedPair", { ...runValue, place: natural, ...leaf.pair }, [
      ...runValueKey,
      "place",
    ]),
  );
  const TestOutcomeOrderedDirectedPair = named(
    "One value a place",
    relation(
      "TestOutcomeOrderedDirectedPair",
      { ...runValue, place: natural, ...leaf.directedPair },
      [...runValueKey, "place"],
    ),
  );
  const TestOutcomeOrderedDuration = named(
    "One value a place",
    relation("TestOutcomeOrderedDuration", { ...runValue, place: natural, ...leaf.duration }, [
      ...runValueKey,
      "place",
    ]),
  );
  const TestOutcomeOrderedUri = named(
    "One value a place",
    relation("TestOutcomeOrderedUri", { ...runValue, place: natural, ...leaf.uri }, [
      ...runValueKey,
      "place",
    ]),
  );
  const TestOutcomeOrderedFile = named(
    "One value a place",
    relation("TestOutcomeOrderedFile", { ...runValue, place: natural, ...leaf.file }, [
      ...runValueKey,
      "place",
    ]),
  );
  const TestOutcomeRecord = named(
    "One value a field",
    relation("TestOutcomeRecord", { ...runFielded, baseType: closedId(BaseType) }, runFieldedKey),
  );
  const TestOutcomeRecordIdentifier = named(
    "One value a field",
    relation("TestOutcomeRecordIdentifier", { ...runFielded, ...leaf.identifier }, runFieldedKey),
  );
  const TestOutcomeRecordBoolean = named(
    "One value a field",
    relation("TestOutcomeRecordBoolean", { ...runFielded, ...leaf.boolean }, runFieldedKey),
  );
  const TestOutcomeRecordInteger = named(
    "One value a field",
    relation("TestOutcomeRecordInteger", { ...runFielded, ...leaf.integer }, runFieldedKey),
  );
  const TestOutcomeRecordFloat = named(
    "One value a field",
    relation("TestOutcomeRecordFloat", { ...runFielded, ...leaf.float }, runFieldedKey),
  );
  const TestOutcomeRecordString = named(
    "One value a field",
    relation("TestOutcomeRecordString", { ...runFielded, ...leaf.string }, runFieldedKey),
  );
  const TestOutcomeRecordPoint = named(
    "One value a field",
    relation("TestOutcomeRecordPoint", { ...runFielded, ...leaf.point }, runFieldedKey),
  );
  const TestOutcomeRecordPair = named(
    "One value a field",
    relation("TestOutcomeRecordPair", { ...runFielded, ...leaf.pair }, runFieldedKey),
  );
  const TestOutcomeRecordDirectedPair = named(
    "One value a field",
    relation(
      "TestOutcomeRecordDirectedPair",
      { ...runFielded, ...leaf.directedPair },
      runFieldedKey,
    ),
  );
  const TestOutcomeRecordDuration = named(
    "One value a field",
    relation("TestOutcomeRecordDuration", { ...runFielded, ...leaf.duration }, runFieldedKey),
  );
  const TestOutcomeRecordUri = named(
    "One value a field",
    relation("TestOutcomeRecordUri", { ...runFielded, ...leaf.uri }, runFieldedKey),
  );
  const TestOutcomeRecordFile = named(
    "One value a field",
    relation("TestOutcomeRecordFile", { ...runFielded, ...leaf.file }, runFieldedKey),
  );

  /**
   * A variable an item session's template processing set at the take, and what it set, whose value
   * rows its sidecars hold, inserted with it.
   */
  const ItemSessionValue = named(
    "Session value once",
    relation("ItemSessionValue", sessionValue, sessionValueKey),
  );

  const ItemSessionValueSingleIdentifier = named(
    "Single value",
    relation(
      "ItemSessionValueSingleIdentifier",
      { ...sessionValue, ...leaf.identifier },
      sessionValueKey,
    ),
  );
  const ItemSessionValueSingleBoolean = named(
    "Single value",
    relation(
      "ItemSessionValueSingleBoolean",
      { ...sessionValue, ...leaf.boolean },
      sessionValueKey,
    ),
  );
  const ItemSessionValueSingleInteger = named(
    "Single value",
    relation(
      "ItemSessionValueSingleInteger",
      { ...sessionValue, ...leaf.integer },
      sessionValueKey,
    ),
  );
  const ItemSessionValueSingleFloat = named(
    "Single value",
    relation("ItemSessionValueSingleFloat", { ...sessionValue, ...leaf.float }, sessionValueKey),
  );
  const ItemSessionValueSingleString = named(
    "Single value",
    relation("ItemSessionValueSingleString", { ...sessionValue, ...leaf.string }, sessionValueKey),
  );
  const ItemSessionValueSinglePoint = named(
    "Single value",
    relation("ItemSessionValueSinglePoint", { ...sessionValue, ...leaf.point }, sessionValueKey),
  );
  const ItemSessionValueSinglePair = named(
    "Single value",
    relation("ItemSessionValueSinglePair", { ...sessionValue, ...leaf.pair }, sessionValueKey),
  );
  const ItemSessionValueSingleDirectedPair = named(
    "Single value",
    relation(
      "ItemSessionValueSingleDirectedPair",
      { ...sessionValue, ...leaf.directedPair },
      sessionValueKey,
    ),
  );
  const ItemSessionValueSingleDuration = named(
    "Single value",
    relation(
      "ItemSessionValueSingleDuration",
      { ...sessionValue, ...leaf.duration },
      sessionValueKey,
    ),
  );
  const ItemSessionValueSingleUri = named(
    "Single value",
    relation("ItemSessionValueSingleUri", { ...sessionValue, ...leaf.uri }, sessionValueKey),
  );
  const ItemSessionValueSingleFile = named(
    "Single value",
    relation("ItemSessionValueSingleFile", { ...sessionValue, ...leaf.file }, sessionValueKey),
  );

  const ItemSessionValueMultipleIdentifier = named(
    "Distinct values",
    relation(
      "ItemSessionValueMultipleIdentifier",
      { ...sessionValue, ...leaf.identifier, count: natural },
      [...sessionValueKey, "value"],
    ),
  );
  const ItemSessionValueMultipleBoolean = named(
    "Distinct values",
    relation(
      "ItemSessionValueMultipleBoolean",
      { ...sessionValue, ...leaf.boolean, count: natural },
      [...sessionValueKey, "value"],
    ),
  );
  const ItemSessionValueMultipleInteger = named(
    "Distinct values",
    relation(
      "ItemSessionValueMultipleInteger",
      { ...sessionValue, ...leaf.integer, count: natural },
      [...sessionValueKey, "value"],
    ),
  );
  const ItemSessionValueMultipleFloat = named(
    "Distinct values",
    relation(
      "ItemSessionValueMultipleFloat",
      { ...sessionValue, bits: pg.bigint, ...leaf.float, count: natural },
      [...sessionValueKey, "bits"],
    ),
  );
  const ItemSessionValueMultipleString = named(
    "Distinct values",
    relation.generated(
      "ItemSessionValueMultipleString",
      { ...sessionValue, ...leaf.string, count: natural },
      [...sessionValueKey, "valueDigest"],
      (row) => ({
        valueDigest: named("Value digest", generated(sha256, Crypto.sha256(row.value))),
      }),
    ),
  );
  const ItemSessionValueMultiplePoint = named(
    "Distinct values",
    relation("ItemSessionValueMultiplePoint", { ...sessionValue, ...leaf.point, count: natural }, [
      ...sessionValueKey,
      "x",
      "y",
    ]),
  );
  const ItemSessionValueMultiplePair = named(
    "Distinct values",
    relation("ItemSessionValueMultiplePair", { ...sessionValue, ...leaf.pair, count: natural }, [
      ...sessionValueKey,
      "least",
      "greatest",
    ]),
  );
  const ItemSessionValueMultipleDirectedPair = named(
    "Distinct values",
    relation(
      "ItemSessionValueMultipleDirectedPair",
      { ...sessionValue, ...leaf.directedPair, count: natural },
      [...sessionValueKey, "source", "target"],
    ),
  );
  const ItemSessionValueMultipleDuration = named(
    "Distinct values",
    relation(
      "ItemSessionValueMultipleDuration",
      { ...sessionValue, bits: pg.bigint, ...leaf.duration, count: natural },
      [...sessionValueKey, "bits"],
    ),
  );
  const ItemSessionValueMultipleUri = named(
    "Distinct values",
    relation("ItemSessionValueMultipleUri", { ...sessionValue, ...leaf.uri, count: natural }, [
      ...sessionValueKey,
      "value",
    ]),
  );
  const ItemSessionValueMultipleFile = named(
    "Distinct values",
    relation("ItemSessionValueMultipleFile", { ...sessionValue, ...leaf.file, count: natural }, [
      ...sessionValueKey,
      "digest",
      "name",
      "type",
    ]),
  );

  const ItemSessionValueOrderedIdentifier = named(
    "One value a place",
    relation(
      "ItemSessionValueOrderedIdentifier",
      { ...sessionValue, place: natural, ...leaf.identifier },
      [...sessionValueKey, "place"],
    ),
  );
  const ItemSessionValueOrderedBoolean = named(
    "One value a place",
    relation(
      "ItemSessionValueOrderedBoolean",
      { ...sessionValue, place: natural, ...leaf.boolean },
      [...sessionValueKey, "place"],
    ),
  );
  const ItemSessionValueOrderedInteger = named(
    "One value a place",
    relation(
      "ItemSessionValueOrderedInteger",
      { ...sessionValue, place: natural, ...leaf.integer },
      [...sessionValueKey, "place"],
    ),
  );
  const ItemSessionValueOrderedFloat = named(
    "One value a place",
    relation("ItemSessionValueOrderedFloat", { ...sessionValue, place: natural, ...leaf.float }, [
      ...sessionValueKey,
      "place",
    ]),
  );
  const ItemSessionValueOrderedString = named(
    "One value a place",
    relation("ItemSessionValueOrderedString", { ...sessionValue, place: natural, ...leaf.string }, [
      ...sessionValueKey,
      "place",
    ]),
  );
  const ItemSessionValueOrderedPoint = named(
    "One value a place",
    relation("ItemSessionValueOrderedPoint", { ...sessionValue, place: natural, ...leaf.point }, [
      ...sessionValueKey,
      "place",
    ]),
  );
  const ItemSessionValueOrderedPair = named(
    "One value a place",
    relation("ItemSessionValueOrderedPair", { ...sessionValue, place: natural, ...leaf.pair }, [
      ...sessionValueKey,
      "place",
    ]),
  );
  const ItemSessionValueOrderedDirectedPair = named(
    "One value a place",
    relation(
      "ItemSessionValueOrderedDirectedPair",
      { ...sessionValue, place: natural, ...leaf.directedPair },
      [...sessionValueKey, "place"],
    ),
  );
  const ItemSessionValueOrderedDuration = named(
    "One value a place",
    relation(
      "ItemSessionValueOrderedDuration",
      { ...sessionValue, place: natural, ...leaf.duration },
      [...sessionValueKey, "place"],
    ),
  );
  const ItemSessionValueOrderedUri = named(
    "One value a place",
    relation("ItemSessionValueOrderedUri", { ...sessionValue, place: natural, ...leaf.uri }, [
      ...sessionValueKey,
      "place",
    ]),
  );
  const ItemSessionValueOrderedFile = named(
    "One value a place",
    relation("ItemSessionValueOrderedFile", { ...sessionValue, place: natural, ...leaf.file }, [
      ...sessionValueKey,
      "place",
    ]),
  );

  /**
   * A start value's key's fields: its item session's by its stage, as a session value's, since the
   * take that stores the session's values stores its start beside them, and the variable.
   */
  const startValue = {
    child: LearnerId,
    package: PackageName,
    path: ItemPath,
    stage: pg.bigint,
    variable: VariableName,
  } as const;
  const startValueKey = ["child", "stage", "package", "path", "variable"] as const;

  /**
   * A start record field's key's fields: its variable's, and the field.
   */
  const startFielded = { ...startValue, field: QtiIdentifier } as const;
  const startFieldedKey = [...startValueKey, "field"] as const;

  /**
   * A variable of the record an item session begins with (COMPILE-AT-PUBLISH S): every variable
   * that is no context of the machine's run of the session with no program, which its take runs
   * once, beside the session's values, in their stratum (`#ledger/grade.ts` takeValuesOf), whose
   * value rows its sidecars hold, inserted with it; a NULL one has its header and no value row.
   */
  const StartVariable = named(
    "Start variable once",
    relation("StartVariable", startValue, startValueKey),
  );

  const StartSingleIdentifier = named(
    "Single value",
    relation("StartSingleIdentifier", { ...startValue, ...leaf.identifier }, startValueKey),
  );
  const StartSingleBoolean = named(
    "Single value",
    relation("StartSingleBoolean", { ...startValue, ...leaf.boolean }, startValueKey),
  );
  const StartSingleInteger = named(
    "Single value",
    relation("StartSingleInteger", { ...startValue, ...leaf.integer }, startValueKey),
  );
  const StartSingleFloat = named(
    "Single value",
    relation("StartSingleFloat", { ...startValue, ...leaf.float }, startValueKey),
  );
  const StartSingleString = named(
    "Single value",
    relation("StartSingleString", { ...startValue, ...leaf.string }, startValueKey),
  );
  const StartSinglePoint = named(
    "Single value",
    relation("StartSinglePoint", { ...startValue, ...leaf.point }, startValueKey),
  );
  const StartSinglePair = named(
    "Single value",
    relation("StartSinglePair", { ...startValue, ...leaf.pair }, startValueKey),
  );
  const StartSingleDirectedPair = named(
    "Single value",
    relation("StartSingleDirectedPair", { ...startValue, ...leaf.directedPair }, startValueKey),
  );
  const StartSingleDuration = named(
    "Single value",
    relation("StartSingleDuration", { ...startValue, ...leaf.duration }, startValueKey),
  );
  const StartSingleUri = named(
    "Single value",
    relation("StartSingleUri", { ...startValue, ...leaf.uri }, startValueKey),
  );
  const StartSingleFile = named(
    "Single value",
    relation("StartSingleFile", { ...startValue, ...leaf.file }, startValueKey),
  );

  const StartMultipleIdentifier = named(
    "Distinct values",
    relation("StartMultipleIdentifier", { ...startValue, ...leaf.identifier, count: natural }, [
      ...startValueKey,
      "value",
    ]),
  );
  const StartMultipleBoolean = named(
    "Distinct values",
    relation("StartMultipleBoolean", { ...startValue, ...leaf.boolean, count: natural }, [
      ...startValueKey,
      "value",
    ]),
  );
  const StartMultipleInteger = named(
    "Distinct values",
    relation("StartMultipleInteger", { ...startValue, ...leaf.integer, count: natural }, [
      ...startValueKey,
      "value",
    ]),
  );
  const StartMultipleFloat = named(
    "Distinct values",
    relation(
      "StartMultipleFloat",
      { ...startValue, bits: pg.bigint, ...leaf.float, count: natural },
      [...startValueKey, "bits"],
    ),
  );
  const StartMultipleString = named(
    "Distinct values",
    relation.generated(
      "StartMultipleString",
      { ...startValue, ...leaf.string, count: natural },
      [...startValueKey, "valueDigest"],
      (row) => ({
        valueDigest: named("Value digest", generated(sha256, Crypto.sha256(row.value))),
      }),
    ),
  );
  const StartMultiplePoint = named(
    "Distinct values",
    relation("StartMultiplePoint", { ...startValue, ...leaf.point, count: natural }, [
      ...startValueKey,
      "x",
      "y",
    ]),
  );
  const StartMultiplePair = named(
    "Distinct values",
    relation("StartMultiplePair", { ...startValue, ...leaf.pair, count: natural }, [
      ...startValueKey,
      "least",
      "greatest",
    ]),
  );
  const StartMultipleDirectedPair = named(
    "Distinct values",
    relation("StartMultipleDirectedPair", { ...startValue, ...leaf.directedPair, count: natural }, [
      ...startValueKey,
      "source",
      "target",
    ]),
  );
  const StartMultipleDuration = named(
    "Distinct values",
    relation(
      "StartMultipleDuration",
      { ...startValue, bits: pg.bigint, ...leaf.duration, count: natural },
      [...startValueKey, "bits"],
    ),
  );
  const StartMultipleUri = named(
    "Distinct values",
    relation("StartMultipleUri", { ...startValue, ...leaf.uri, count: natural }, [
      ...startValueKey,
      "value",
    ]),
  );
  const StartMultipleFile = named(
    "Distinct values",
    relation("StartMultipleFile", { ...startValue, ...leaf.file, count: natural }, [
      ...startValueKey,
      "digest",
      "name",
      "type",
    ]),
  );

  const StartOrderedIdentifier = named(
    "One value a place",
    relation("StartOrderedIdentifier", { ...startValue, place: natural, ...leaf.identifier }, [
      ...startValueKey,
      "place",
    ]),
  );
  const StartOrderedBoolean = named(
    "One value a place",
    relation("StartOrderedBoolean", { ...startValue, place: natural, ...leaf.boolean }, [
      ...startValueKey,
      "place",
    ]),
  );
  const StartOrderedInteger = named(
    "One value a place",
    relation("StartOrderedInteger", { ...startValue, place: natural, ...leaf.integer }, [
      ...startValueKey,
      "place",
    ]),
  );
  const StartOrderedFloat = named(
    "One value a place",
    relation("StartOrderedFloat", { ...startValue, place: natural, ...leaf.float }, [
      ...startValueKey,
      "place",
    ]),
  );
  const StartOrderedString = named(
    "One value a place",
    relation("StartOrderedString", { ...startValue, place: natural, ...leaf.string }, [
      ...startValueKey,
      "place",
    ]),
  );
  const StartOrderedPoint = named(
    "One value a place",
    relation("StartOrderedPoint", { ...startValue, place: natural, ...leaf.point }, [
      ...startValueKey,
      "place",
    ]),
  );
  const StartOrderedPair = named(
    "One value a place",
    relation("StartOrderedPair", { ...startValue, place: natural, ...leaf.pair }, [
      ...startValueKey,
      "place",
    ]),
  );
  const StartOrderedDirectedPair = named(
    "One value a place",
    relation("StartOrderedDirectedPair", { ...startValue, place: natural, ...leaf.directedPair }, [
      ...startValueKey,
      "place",
    ]),
  );
  const StartOrderedDuration = named(
    "One value a place",
    relation("StartOrderedDuration", { ...startValue, place: natural, ...leaf.duration }, [
      ...startValueKey,
      "place",
    ]),
  );
  const StartOrderedUri = named(
    "One value a place",
    relation("StartOrderedUri", { ...startValue, place: natural, ...leaf.uri }, [
      ...startValueKey,
      "place",
    ]),
  );
  const StartOrderedFile = named(
    "One value a place",
    relation("StartOrderedFile", { ...startValue, place: natural, ...leaf.file }, [
      ...startValueKey,
      "place",
    ]),
  );

  /**
   * A record variable's field in the record its item session begins with, with its base type, whose
   * arm holds its value, inserted with it.
   */
  const StartRecord = named(
    "One value a field",
    relation("StartRecord", { ...startFielded, baseType: closedId(BaseType) }, startFieldedKey),
  );
  const StartRecordIdentifier = named(
    "One value a field",
    relation("StartRecordIdentifier", { ...startFielded, ...leaf.identifier }, startFieldedKey),
  );
  const StartRecordBoolean = named(
    "One value a field",
    relation("StartRecordBoolean", { ...startFielded, ...leaf.boolean }, startFieldedKey),
  );
  const StartRecordInteger = named(
    "One value a field",
    relation("StartRecordInteger", { ...startFielded, ...leaf.integer }, startFieldedKey),
  );
  const StartRecordFloat = named(
    "One value a field",
    relation("StartRecordFloat", { ...startFielded, ...leaf.float }, startFieldedKey),
  );
  const StartRecordString = named(
    "One value a field",
    relation("StartRecordString", { ...startFielded, ...leaf.string }, startFieldedKey),
  );
  const StartRecordPoint = named(
    "One value a field",
    relation("StartRecordPoint", { ...startFielded, ...leaf.point }, startFieldedKey),
  );
  const StartRecordPair = named(
    "One value a field",
    relation("StartRecordPair", { ...startFielded, ...leaf.pair }, startFieldedKey),
  );
  const StartRecordDirectedPair = named(
    "One value a field",
    relation("StartRecordDirectedPair", { ...startFielded, ...leaf.directedPair }, startFieldedKey),
  );
  const StartRecordDuration = named(
    "One value a field",
    relation("StartRecordDuration", { ...startFielded, ...leaf.duration }, startFieldedKey),
  );
  const StartRecordUri = named(
    "One value a field",
    relation("StartRecordUri", { ...startFielded, ...leaf.uri }, startFieldedKey),
  );
  const StartRecordFile = named(
    "One value a field",
    relation("StartRecordFile", { ...startFielded, ...leaf.file }, startFieldedKey),
  );

  /**
   * An evaluation's key's fields: its attempt's, the operator's place in the item's document, and
   * its clock.
   */
  const evaluationKey = [...snapshotKey, "operator", "evaluated"] as const;

  /**
   * A demand's key's fields: its attempt's, and the operator's place in the item's document.
   */
  const demandKey = [...snapshotKey, "operator"] as const;

  const ApplicationDemand = named(
    "One demand an application",
    relation("ApplicationDemand", { ...snapshotFields, operator: natural }, demandKey),
  );
  const OperatorEvaluation = named(
    "Evaluation instant",
    relation(
      "OperatorEvaluation",
      {
        ...snapshotFields,
        class: closedId(OperatorClass),
        evaluated: instant,
        grader: closedId(GraderVersion),
        operator: natural,
        request: sha256,
        result: closedId(EvaluationResult),
      },
      evaluationKey,
    ),
  );
  const OperatorReply = named(
    "Evaluation instant",
    relation(
      "OperatorReply",
      { ...snapshotFields, evaluated: instant, operator: natural, score: pg["double precision"] },
      evaluationKey,
    ),
  );
  const OperatorFeedback = named(
    "Evaluation instant",
    relation(
      "OperatorFeedback",
      { ...snapshotFields, evaluated: instant, feedback: Feedback, operator: natural },
      evaluationKey,
    ),
  );
  const OperatorDecline = named(
    "Evaluation instant",
    relation(
      "OperatorDecline",
      { ...snapshotFields, evaluated: instant, operator: natural, reason: closedId(DeclineReason) },
      evaluationKey,
    ),
  );

  /**
   * A rubric group as the ledger names it: the `id` of the scorer rubric block its applications
   * name, as written.
   */
  const RubricName = Literal.fields.text;

  /**
   * A human demand's key's fields: its attempt's, and the rubric group.
   */
  const humanDemandKey = [...snapshotKey, "rubric"] as const;

  const HumanDemand = named(
    "One human demand a group",
    relation("HumanDemand", { ...snapshotFields, rubric: RubricName }, humanDemandKey),
  );

  /**
   * The maximum of an application the attempt's run demanded: its `maximum` operand, a
   * `qti-default`, as the grader evaluated it when it reached the application, the default in force
   * (the session's template-set default, else the declared one); no row is NULL. What the
   * evaluator's request carries and a reply is bounded by.
   */
  const ApplicationMaximum = named(
    "One maximum a demand",
    relation(
      "ApplicationMaximum",
      { ...snapshotFields, maximum: QtiFloat, operator: natural },
      demandKey,
    ),
  );

  /**
   * The maximum a person's value of a rubric group the attempt's run asked a person for may take:
   * the least of the maxima of the group's applications the run reached; no row is NULL.
   */
  const HumanDemandMaximum = named(
    "One maximum a human demand",
    relation(
      "HumanDemandMaximum",
      { ...snapshotFields, maximum: QtiFloat, rubric: RubricName },
      humanDemandKey,
    ),
  );

  /**
   * A human value's key's fields: its attempt's, the rubric group, and the instant it was recorded.
   */
  const humanKey = [...snapshotKey, "rubric", "asserted"] as const;

  const HumanOperatorValue = named(
    "Human value instant",
    relation(
      "HumanOperatorValue",
      {
        ...snapshotFields,
        asserted: instant,
        rubric: RubricName,
        score: pg["double precision"],
        scorer: ScorerId,
      },
      humanKey,
    ),
  );
  const HumanOperatorFeedback = named(
    "Human value instant",
    relation(
      "HumanOperatorFeedback",
      { ...snapshotFields, asserted: instant, feedback: Feedback, rubric: RubricName },
      humanKey,
    ),
  );

  /**
   * A child's test sessions (`#sittings.ts`): each a stage's, over its item sessions.
   */
  const sittings = sittingTablesOf(qti);

  /**
   * The variables a snapshot records: its responses and its outcomes.
   */
  const recorded = ["qti-response-declaration", "qti-outcome-declaration"] as const;

  type CardinalityName = "single" | "multiple" | "ordered";
  type BaseTypeName = (typeof BaseType.handles)[number];

  /**
   * The response or outcome variables an item declares of a cardinality and base type, by its
   * package, the item's `identifier` and the declared identifier: what a snapshot's value of that
   * sidecar names.
   */
  const recordedOf = (cardinality: CardinalityName, baseType: BaseTypeName) =>
    on(
      select(ItemVariable, (i) =>
        i.and(
          i.eq(i.cardinality, cardinality),
          i.eq(i.baseType, baseType),
          i.in(i.declarationKind, recorded),
        ),
      ),
      "package",
      "path",
      "identifier",
    );

  /**
   * An item session's variables of a cardinality and base type, by its package, the item's
   * `identifier` and the variable's: what an item session's value of that sidecar names, of the
   * kind its header's law holds.
   */
  const declaredOf = (cardinality: CardinalityName, baseType: BaseTypeName) =>
    on(
      select(ItemSessionVariable, (i) =>
        i.and(i.eq(i.cardinality, cardinality), i.eq(i.baseType, baseType)),
      ),
      "package",
      "path",
      "identifier",
    );

  /**
   * What template processing sets of a variable names an item session variable of the kind its rule
   * sets, as the QTI 3.0.1 information model's TemplateRuleGroup names each rule's target: a
   * template value a template variable (`qti-set-template-value`), a correct response "The response
   * variable to have its correct value set" (table 6.51.5, `qti-set-correct-response`), declared or
   * built in, and a default "The response variable or outcome variable to have its default value
   * set" (table 6.51.4, `qti-set-default-value`), declared or built in.
   */
  const settable = (
    kind: (typeof SessionValueKind.handles)[number],
    declarations: readonly ("qti-template-declaration" | (typeof recorded)[number])[],
  ) =>
    named(
      "Settable kind",
      contained(
        on(
          select(ItemSessionValue, (s) => s.eq(s.kind, kind)),
          "package",
          "path",
          "variable",
        ),
        on(
          select(ItemSessionVariable, (i) => i.in(i.declarationKind, declarations)),
          "package",
          "path",
          "identifier",
        ),
      ),
    );

  /**
   * An outcome's assertion: the value a scorer gave one external-scored outcome of one attempt,
   * after the attempt's response processing ran, at the instant the database stamped it, of one of
   * QTI's two kinds of scorer ({@link ExternalScoring}). QTI 3.0.1 information model, Table 4.5.10,
   * `external-scored`: "This identifies whether or not the value for this outcome is produced by
   * human or by machine scoring"; Results Reporting, Table 2.7.7, `pendingExternalScoring`: "the
   * response processing rules are processed, but the score is NOT final because the
   * 'external-scored' property for the outcome variable was set". Its key is the attempt's value's,
   * `(child, package, item, n, at, variable)`, and `asserted`, a clock whose child is that outcome
   * of that attempt: the assertions of one outcome of one attempt are ordered as they committed,
   * whatever the server's clock reads, and the latest is the one in force (the owner's ruling,
   * 2026-11-19: "append-only, at the database's instant, the latest wins"). No role updates or
   * deletes one: a regrade is a later assertion, and a report's "multiple results for the same
   * instance of an item ... each item result must have a different datestamp" (Results Reporting,
   * Table 2.4.5) reads each as one dated fact.
   *
   * - **OutcomeAssertion**: the header, with its kind, `by`, the declaration's own token, so a law
   *   holds it to the declaration's (the Delivery level's `ExternallyScored`, one containment).
   * - **HumanAssertion**: a `human` assertion's arm, its `scorer`, the person who scored
   *   ({@link ScorerId}: "a human must score the Item", Table 8.21).
   * - **MachineAssertion**: an `externalMachine` assertion's arm, its `grader`, a machine grader at a
   *   version, a handle of the Registry's one roster of machine graders (`GraderVersion`, whose
   *   facts its `Grader` holds), the roster an operator's evaluation names its grader by too ("an
   *   external scoring system will be used to score the Item", Table 8.21). A handle is one grader
   *   at one version, so a new model, prompt or setting is a new handle, and its answers are later
   *   assertions.
   * - **AssertedSingle**`<BaseType>`: the asserted value, in the sidecar of the outcome's base type,
   *   typed as an attempt's single is ({@link leaf}, one shape for both), named by the attempt's
   *   value's law ({@link recordedOf}). No value row asserts NULL ("An item variable may have no
   *   value at all, in which case it is said to have the special value NULL", §2.2.2). An outcome
   *   of another cardinality is not asserted here: its item is admitted and left unserved for
   *   credit (the Delivery level's `ExternallyScored` carries the cardinality), never refused (QTI
   *   3.0 Conformance §3, the lead's J1).
   */
  const assertedFields = { ...snapshotValue, asserted: instant } as const;
  /**
   * An assertion's key: its attempt's value's, `(child, package, path, n, at, variable)`, and its
   * own instant.
   */
  const assertedKey = ["child", "package", "path", "n", "at", "variable", "asserted"] as const;

  const OutcomeAssertion = named(
    "Assertion instant",
    relation("OutcomeAssertion", { ...assertedFields, by: closedId(ExternalScoring) }, assertedKey),
  );
  const HumanAssertion = named(
    "Assertion instant",
    relation("HumanAssertion", { ...assertedFields, scorer: ScorerId }, assertedKey),
  );
  const MachineAssertion = named(
    "Assertion instant",
    relation(
      "MachineAssertion",
      { ...assertedFields, grader: closedId(GraderVersion) },
      assertedKey,
    ),
  );

  const AssertedSingleIdentifier = named(
    "Single value",
    relation("AssertedSingleIdentifier", { ...assertedFields, ...leaf.identifier }, assertedKey),
  );
  const AssertedSingleBoolean = named(
    "Single value",
    relation("AssertedSingleBoolean", { ...assertedFields, ...leaf.boolean }, assertedKey),
  );
  const AssertedSingleInteger = named(
    "Single value",
    relation("AssertedSingleInteger", { ...assertedFields, ...leaf.integer }, assertedKey),
  );
  const AssertedSingleFloat = named(
    "Single value",
    relation("AssertedSingleFloat", { ...assertedFields, ...leaf.float }, assertedKey),
  );
  const AssertedSingleString = named(
    "Single value",
    relation("AssertedSingleString", { ...assertedFields, ...leaf.string }, assertedKey),
  );
  const AssertedSinglePoint = named(
    "Single value",
    relation("AssertedSinglePoint", { ...assertedFields, ...leaf.point }, assertedKey),
  );
  const AssertedSinglePair = named(
    "Single value",
    relation("AssertedSinglePair", { ...assertedFields, ...leaf.pair }, assertedKey),
  );
  const AssertedSingleDirectedPair = named(
    "Single value",
    relation(
      "AssertedSingleDirectedPair",
      { ...assertedFields, ...leaf.directedPair },
      assertedKey,
    ),
  );
  const AssertedSingleDuration = named(
    "Single value",
    relation("AssertedSingleDuration", { ...assertedFields, ...leaf.duration }, assertedKey),
  );
  const AssertedSingleUri = named(
    "Single value",
    relation("AssertedSingleUri", { ...assertedFields, ...leaf.uri }, assertedKey),
  );
  const AssertedSingleFile = named(
    "Single value",
    relation("AssertedSingleFile", { ...assertedFields, ...leaf.file }, assertedKey),
  );

  /**
   * The relations of outcomes' assertions, in the order the level lists them.
   */
  const assertions = [
    ExternalScoring,
    OutcomeAssertion,
    HumanAssertion,
    MachineAssertion,
    AssertedSingleIdentifier,
    AssertedSingleBoolean,
    AssertedSingleInteger,
    AssertedSingleFloat,
    AssertedSingleString,
    AssertedSinglePoint,
    AssertedSinglePair,
    AssertedSingleDirectedPair,
    AssertedSingleDuration,
    AssertedSingleUri,
    AssertedSingleFile,
  ] as const;

  /**
   * The laws of outcomes' assertions that read the ledger alone; the one that holds an assertion to
   * its item's declaration reads pantry's views, so the Delivery level states it.
   *
   * - An assertion scores a recorded attempt: "the response processing rules are processed" (Results
   *   Reporting, Table 2.7.7) before an external score is given.
   * - Each assertion has its kind's arm, and only its kind's: a `human` one its Clerk user (Table
   *   8.21, "a human must score the Item"); an `externalMachine` one its grader at a version, the
   *   Registry's (`MachineAssertion`).
   * - Each value belongs to its assertion, and is of its outcome's declared cardinality and base
   *   type, the law an attempt's single is held to ({@link recordedOf}).
   * - A pair's two identifiers stand in code-point order (`LeastFirst`), as an attempt's do.
   */
  const assertionLaws = [
    named(
      "Assertion of its attempt",
      contained(on(OutcomeAssertion, ...snapshotKey), on(Attempt, ...snapshotKey)),
    ),
    named(
      "Assertion kind",
      alternatives(OutcomeAssertion, "by", ExternalScoring, {
        externalMachine: MachineAssertion,
        human: HumanAssertion,
      }),
    ),
    named(
      "Value in its header",
      contained(on(AssertedSingleIdentifier, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
    ),
    named(
      "Declared type",
      contained(
        on(AssertedSingleIdentifier, "package", "path", "variable"),
        recordedOf("single", "identifier"),
      ),
    ),
    named(
      "Value in its header",
      contained(on(AssertedSingleBoolean, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
    ),
    named(
      "Declared type",
      contained(
        on(AssertedSingleBoolean, "package", "path", "variable"),
        recordedOf("single", "boolean"),
      ),
    ),
    named(
      "Value in its header",
      contained(on(AssertedSingleInteger, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
    ),
    named(
      "Declared type",
      contained(
        on(AssertedSingleInteger, "package", "path", "variable"),
        recordedOf("single", "integer"),
      ),
    ),
    named(
      "Value in its header",
      contained(on(AssertedSingleFloat, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
    ),
    named(
      "Declared type",
      contained(
        on(AssertedSingleFloat, "package", "path", "variable"),
        recordedOf("single", "float"),
      ),
    ),
    named(
      "Value in its header",
      contained(on(AssertedSingleString, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
    ),
    named(
      "Declared type",
      contained(
        on(AssertedSingleString, "package", "path", "variable"),
        recordedOf("single", "string"),
      ),
    ),
    named(
      "Value in its header",
      contained(on(AssertedSinglePoint, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
    ),
    named(
      "Declared type",
      contained(
        on(AssertedSinglePoint, "package", "path", "variable"),
        recordedOf("single", "point"),
      ),
    ),
    named(
      "Value in its header",
      contained(on(AssertedSinglePair, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
    ),
    named(
      "Declared type",
      contained(
        on(AssertedSinglePair, "package", "path", "variable"),
        recordedOf("single", "pair"),
      ),
    ),
    named(
      "Value in its header",
      contained(
        on(AssertedSingleDirectedPair, ...assertedKey),
        on(OutcomeAssertion, ...assertedKey),
      ),
    ),
    named(
      "Declared type",
      contained(
        on(AssertedSingleDirectedPair, "package", "path", "variable"),
        recordedOf("single", "directedPair"),
      ),
    ),
    named(
      "Value in its header",
      contained(on(AssertedSingleDuration, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
    ),
    named(
      "Declared type",
      contained(
        on(AssertedSingleDuration, "package", "path", "variable"),
        recordedOf("single", "duration"),
      ),
    ),
    named(
      "Value in its header",
      contained(on(AssertedSingleUri, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
    ),
    named(
      "Declared type",
      contained(on(AssertedSingleUri, "package", "path", "variable"), recordedOf("single", "uri")),
    ),
    named(
      "Value in its header",
      contained(on(AssertedSingleFile, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
    ),
    named(
      "Declared type",
      contained(
        on(AssertedSingleFile, "package", "path", "variable"),
        recordedOf("single", "file"),
      ),
    ),
    named(
      "Least first",
      check("LeastFirst", AssertedSinglePair, (p) => p.le(p.least, p.greatest)),
    ),
  ] as const;

  /**
   * The machine's tokens for the facts of pantry a statement passes the SQL grader
   * (`#ledger/grading.ts`'s flat entry): each a closed relation from a roster of pantry's to the
   * token its heading's field holds, its rows the machine's own lists, so a node, an attribute or a
   * declaration's type crosses as the text the machine reads, and one the machine reads none of
   * crosses as no row. grizzle has no term for a closed id's name (W1, punted from tonight's pin).
   */
  const ProgramNodeKind = closed.relation(
    "ProgramNodeKind",
    { kind: closedId(NodeKind), token: ProgramNode.fields.kind },
    ["kind"],
    processingKinds.map((kind) => ({ kind, token: kind })),
  );
  const DeclarationNodeKind = closed.relation(
    "DeclarationNodeKind",
    { kind: closedId(NodeKind), token: DeclarationNode.fields.kind },
    ["kind"],
    declarationParts.map((kind) => ({ kind, token: kind })),
  );
  const GradedAttributeName = closed.relation(
    "GradedAttributeName",
    { name: closedId(AttributeName), token: DocumentAttribute.fields.name },
    ["name"],
    gradedAttributes.map((name) => ({ name, token: name })),
  );
  /**
   * An item body's element nodes as response admission reads them (`admission_of`'s `body`): every
   * element kind, by its name, the text pantry's roster spells it with; a node that is no element
   * (character data, a comment) crosses as no row.
   */
  const BodyNodeKind = closed.relation(
    "BodyNodeKind",
    { kind: closedId(NodeKind), token: BodyNode.fields.kind },
    ["kind"],
    NodeKind.handles
      .filter((kind) => Option.isSome(grammar.kinds.isElement.lookup({ kind })))
      .map((kind) => ({ kind, token: kind })),
  );
  /**
   * The attributes of the body's elements response admission reads (`admission_of`'s
   * `body_attributes`), the machine's own list.
   */
  const AdmittedAttributeName = closed.relation(
    "AdmittedAttributeName",
    { name: closedId(AttributeName), token: BodyAttribute.fields.name },
    ["name"],
    admittedAttributes.map((name) => ({ name, token: name })),
  );
  const CardinalityToken = closed.relation(
    "CardinalityToken",
    { cardinality: closedId(Cardinality), token: DocVar.fields.card },
    ["cardinality"],
    Cardinality.handles.map((cardinality) => ({ cardinality, token: cardinality })),
  );
  /**
   * QTI's completion status as the machine holds it, its built-in outcome's identifier value
   * (`completionStatus`, §2.2.2.3): what the grade write reads the run's end by, one query for all
   * four.
   */
  const CompletionStatusToken = closed.relation(
    "CompletionStatusToken",
    { status: closedId(CompletionStatus), token: DocText.fields.value },
    ["status"],
    CompletionStatus.handles.map((status) => ({ status, token: status })),
  );
  const BaseTypeToken = closed.relation(
    "BaseTypeToken",
    { baseType: closedId(BaseType), token: DocBase.fields.base },
    ["baseType"],
    BaseType.handles.map((baseType) => ({ baseType, token: baseType })),
  );
  const VariableKindToken = closed.relation(
    "VariableKindToken",
    { declarationKind: closedId(DeclarationKind), token: DocVar.fields.kind },
    ["declarationKind"],
    [
      { declarationKind: "qti-response-declaration", token: "response" },
      { declarationKind: "qti-outcome-declaration", token: "outcome" },
      { declarationKind: "qti-template-declaration", token: "template" },
      { declarationKind: "qti-context-declaration", token: "context" },
    ],
  );
  /**
   * Each registered class the machine implements, by the machine's text of it (`table_binding`'s
   * `class`): the registry's bindings reach the grading statement through it.
   */
  const OperatorClassToken = closed.relation(
    "OperatorClassToken",
    { class: closedId(OperatorClass), token: TableBinding.fields.class },
    ["class"],
    customOperators.flatMap((operator) =>
      OperatorClass.handles.includes(operator.class)
        ? [{ class: operator.class, token: operator.class }]
        : [],
    ),
  );
  /**
   * Each role a primitive reads a seed table in, by the machine's text of it (`table_binding`'s
   * `role`).
   */
  const TableRoleToken = closed.relation(
    "TableRoleToken",
    { role: closedId(TableRole), token: TableBinding.fields.role },
    ["role"],
    TableRole.handles.map((role) => ({ role, token: role })),
  );
  /**
   * Each seed table, by the machine's text of its name (the `identifier` of `table_binding`,
   * `table_entry` and `table_value`).
   */
  const RegistryTableName = closed.relation(
    "RegistryTableName",
    { name: TableBinding.fields.identifier, table: closedId(RegistryTable) },
    ["table"],
    RegistryTable.handles.map((table) => ({ name: table, table })),
  );
  /**
   * Each key a seed table holds, by the machine's text of it (the `key` of `table_entry` and
   * `table_value`).
   */
  const RegistryWordText = closed.relation(
    "RegistryWordText",
    { key: closedId(RegistryWord), text: TableEntry.fields.key },
    ["key"],
    RegistryWord.handles.map((word) => ({ key: word, text: word })),
  );

  /**
   * What an item session's template processing set of a variable, by the machine's token of what
   * the run's value of it holds: a template variable's value its `value`, a correct response its
   * `correct`, a default its `default`.
   */
  const SessionValueHolds = closed.relation(
    "SessionValueHolds",
    { holds: DocVar.fields.holds, kind: closedId(SessionValueKind) },
    ["kind"],
    [
      { holds: "value", kind: "template" },
      { holds: "correct", kind: "correct" },
      { holds: "default", kind: "default" },
    ],
  );

  /**
   * The published response processing templates (spec reading 51, pantry's `publishedTemplates`),
   * whose rules the SQL grader runs where an item's processing names one and holds no rule of its
   * own (§4.6.1, §4.6.2), and each one's document as the reference package stores it
   * (**PublishedTemplateDocument**: `#ledger/template-package.ts`'s package, `<name>.xml`, whose
   * root is the template's `qti-response-processing`), published as any package is: information
   * model §4.6.1, "If a template identifier is given it may be used to locate an externally defined
   * responseProcessing template", and a processor that knows a template "from the template
   * identifier alone" ignores its `template-location` (§4.6.2).
   */
  const PublishedTemplate = closed.ordered("PublishedTemplate", publishedTemplates);
  const PublishedTemplateDocument = closed.relation(
    "PublishedTemplateDocument",
    {
      package: Package.fields.package,
      path: Document.fields.path,
      template: closedId(PublishedTemplate),
    },
    ["template"],
    publishedTemplates.map((template) => ({
      package: templatePackage,
      path: `${template}.xml`,
      template,
    })),
  );
  /**
   * Each `template` URI that names a published template, by its form: pantry's `urisOf`, each
   * template's four, under either prefix with or without `.xml`, in the order it gives them.
   */
  const TemplateUriForm = closed.ordered("TemplateUriForm", [
    "purl",
    "purlXml",
    "imsglobal",
    "imsglobalXml",
  ]);
  const PublishedTemplateUri = closed.relation(
    "PublishedTemplateUri",
    {
      form: closedId(TemplateUriForm),
      template: closedId(PublishedTemplate),
      uri: TemplateUri,
    },
    ["template", "form"],
    publishedTemplates.flatMap((template) =>
      urisOf([template]).flatMap((uri, at) => {
        const form = TemplateUriForm.handles[at];

        return form === undefined ? [] : [{ form, template, uri }];
      }),
    ),
  );

  return schema.extend(
    [qti],
    "Ledger",
    [
      CompletionStatus,
      SnapshotKind,
      SessionValueKind,
      CreditKind,
      AdmissionCode,
      ItemSession,
      SessionSeed,
      TimingScope,
      LateTest,
      StageControl,
      ProgramNodeKind,
      DeclarationNodeKind,
      GradedAttributeName,
      BodyNodeKind,
      AdmittedAttributeName,
      CardinalityToken,
      CompletionStatusToken,
      BaseTypeToken,
      VariableKindToken,
      OperatorClassToken,
      TableRoleToken,
      RegistryTableName,
      RegistryWordText,
      SessionValueHolds,
      PublishedTemplate,
      PublishedTemplateDocument,
      TemplateUriForm,
      PublishedTemplateUri,
      ItemSessionValue,
      ItemSessionValueSingleIdentifier,
      ItemSessionValueSingleBoolean,
      ItemSessionValueSingleInteger,
      ItemSessionValueSingleFloat,
      ItemSessionValueSingleString,
      ItemSessionValueSinglePoint,
      ItemSessionValueSinglePair,
      ItemSessionValueSingleDirectedPair,
      ItemSessionValueSingleDuration,
      ItemSessionValueSingleUri,
      ItemSessionValueSingleFile,
      ItemSessionValueMultipleIdentifier,
      ItemSessionValueMultipleBoolean,
      ItemSessionValueMultipleInteger,
      ItemSessionValueMultipleFloat,
      ItemSessionValueMultipleString,
      ItemSessionValueMultiplePoint,
      ItemSessionValueMultiplePair,
      ItemSessionValueMultipleDirectedPair,
      ItemSessionValueMultipleDuration,
      ItemSessionValueMultipleUri,
      ItemSessionValueMultipleFile,
      ItemSessionValueOrderedIdentifier,
      ItemSessionValueOrderedBoolean,
      ItemSessionValueOrderedInteger,
      ItemSessionValueOrderedFloat,
      ItemSessionValueOrderedString,
      ItemSessionValueOrderedPoint,
      ItemSessionValueOrderedPair,
      ItemSessionValueOrderedDirectedPair,
      ItemSessionValueOrderedDuration,
      ItemSessionValueOrderedUri,
      ItemSessionValueOrderedFile,
      StartVariable,
      StartSingleIdentifier,
      StartSingleBoolean,
      StartSingleInteger,
      StartSingleFloat,
      StartSingleString,
      StartSinglePoint,
      StartSinglePair,
      StartSingleDirectedPair,
      StartSingleDuration,
      StartSingleUri,
      StartSingleFile,
      StartMultipleIdentifier,
      StartMultipleBoolean,
      StartMultipleInteger,
      StartMultipleFloat,
      StartMultipleString,
      StartMultiplePoint,
      StartMultiplePair,
      StartMultipleDirectedPair,
      StartMultipleDuration,
      StartMultipleUri,
      StartMultipleFile,
      StartOrderedIdentifier,
      StartOrderedBoolean,
      StartOrderedInteger,
      StartOrderedFloat,
      StartOrderedString,
      StartOrderedPoint,
      StartOrderedPair,
      StartOrderedDirectedPair,
      StartOrderedDuration,
      StartOrderedUri,
      StartOrderedFile,
      StartRecord,
      StartRecordIdentifier,
      StartRecordBoolean,
      StartRecordInteger,
      StartRecordFloat,
      StartRecordString,
      StartRecordPoint,
      StartRecordPair,
      StartRecordDirectedPair,
      StartRecordDuration,
      StartRecordUri,
      StartRecordFile,
      ResponseSnapshot,
      Attempt,
      ProcessedAttempt,
      DefaultSubmission,
      Save,
      SnapshotGiven,
      SnapshotSingleIdentifier,
      SnapshotSingleBoolean,
      SnapshotSingleInteger,
      SnapshotSingleFloat,
      SnapshotSingleString,
      SnapshotSinglePoint,
      SnapshotSinglePair,
      SnapshotSingleDirectedPair,
      SnapshotSingleDuration,
      SnapshotSingleUri,
      SnapshotSingleFile,
      SnapshotMultipleIdentifier,
      SnapshotMultipleBoolean,
      SnapshotMultipleInteger,
      SnapshotMultipleFloat,
      SnapshotMultipleString,
      SnapshotMultiplePoint,
      SnapshotMultiplePair,
      SnapshotMultipleDirectedPair,
      SnapshotMultipleDuration,
      SnapshotMultipleUri,
      SnapshotMultipleFile,
      SnapshotOrderedIdentifier,
      SnapshotOrderedBoolean,
      SnapshotOrderedInteger,
      SnapshotOrderedFloat,
      SnapshotOrderedString,
      SnapshotOrderedPoint,
      SnapshotOrderedPair,
      SnapshotOrderedDirectedPair,
      SnapshotOrderedDuration,
      SnapshotOrderedUri,
      SnapshotOrderedFile,
      SnapshotRecord,
      SnapshotRecordIdentifier,
      SnapshotRecordBoolean,
      SnapshotRecordInteger,
      SnapshotRecordFloat,
      SnapshotRecordString,
      SnapshotRecordPoint,
      SnapshotRecordPair,
      SnapshotRecordDirectedPair,
      SnapshotRecordDuration,
      SnapshotRecordUri,
      SnapshotRecordFile,
      SessionContextFloat,
      SessionContextInteger,
      SessionContextBoolean,
      TestOutcomeRun,
      TestOutcomeSingleIdentifier,
      TestOutcomeSingleBoolean,
      TestOutcomeSingleInteger,
      TestOutcomeSingleFloat,
      TestOutcomeSingleString,
      TestOutcomeSinglePoint,
      TestOutcomeSinglePair,
      TestOutcomeSingleDirectedPair,
      TestOutcomeSingleDuration,
      TestOutcomeSingleUri,
      TestOutcomeSingleFile,
      TestOutcomeMultipleIdentifier,
      TestOutcomeMultipleBoolean,
      TestOutcomeMultipleInteger,
      TestOutcomeMultipleFloat,
      TestOutcomeMultipleString,
      TestOutcomeMultiplePoint,
      TestOutcomeMultiplePair,
      TestOutcomeMultipleDirectedPair,
      TestOutcomeMultipleDuration,
      TestOutcomeMultipleUri,
      TestOutcomeMultipleFile,
      TestOutcomeOrderedIdentifier,
      TestOutcomeOrderedBoolean,
      TestOutcomeOrderedInteger,
      TestOutcomeOrderedFloat,
      TestOutcomeOrderedString,
      TestOutcomeOrderedPoint,
      TestOutcomeOrderedPair,
      TestOutcomeOrderedDirectedPair,
      TestOutcomeOrderedDuration,
      TestOutcomeOrderedUri,
      TestOutcomeOrderedFile,
      TestOutcomeRecord,
      TestOutcomeRecordIdentifier,
      TestOutcomeRecordBoolean,
      TestOutcomeRecordInteger,
      TestOutcomeRecordFloat,
      TestOutcomeRecordString,
      TestOutcomeRecordPoint,
      TestOutcomeRecordPair,
      TestOutcomeRecordDirectedPair,
      TestOutcomeRecordDuration,
      TestOutcomeRecordUri,
      TestOutcomeRecordFile,
      EvaluationResult,
      DeclineReason,
      ApplicationDemand,
      OperatorEvaluation,
      OperatorReply,
      OperatorFeedback,
      OperatorDecline,
      HumanDemand,
      ApplicationMaximum,
      HumanDemandMaximum,
      HumanOperatorValue,
      HumanOperatorFeedback,
      sittings.tables.TestSession,
      sittings.tables.TestMoment,
      sittings.tables.TestVisit,
      sittings.tables.TestSuspension,
      sittings.tables.TestBudget,
      sittings.tables.TestPresented,
      sittings.tables.SittingFinal,
      sittings.tables.TestEnd,
      sittings.tables.Presence,
      SittingStanding,
      ItemVariable,
      ItemSessionVariable,
      ItemRecordVariable,
      SessionVariableName,
      MaximumOutcome,
      MaximumNormal,
      ...assertions,
      ...gradingFunctions,
    ],
    [
      /**
       * The learner is the unit, not the sitting: an attempt's key carries no stage, every learner
       * key leads with the child, and a child sits one live test session at a time, so holding the
       * child queues nothing but the child's own calls (the read-committed cutover, 2026-11-23).
       */
      unit("Learner", { child: LearnerId }),
      named("Item session key", key(on(ItemSession, "child", "stage", "package", "path"))),
      named(
        "Some attempt",
        check("Some_attempt", StageControl, (c) => c.ge(c.maxAttempts, 1n)),
      ),
      named(
        "Session seed",
        contained(
          on(ItemSession, "child", "stage", "package", "path"),
          on(SessionSeed, "child", "stage", "package", "path"),
        ),
      ),
      named(
        "Item of the content",
        contained(on(ItemSession, "package", "path"), on(ObjectIdentifier, "package", "path")),
      ),
      named(
        "Value of its session",
        contained(
          on(ItemSessionValue, "child", "stage", "package", "path"),
          on(ItemSession, "child", "stage", "package", "path"),
        ),
      ),
      settable("template", ["qti-template-declaration"]),
      settable("correct", ["qti-response-declaration"]),
      settable("default", recorded),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueSingleIdentifier, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueSingleIdentifier, "package", "path", "variable"),
          declaredOf("single", "identifier"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueSingleBoolean, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueSingleBoolean, "package", "path", "variable"),
          declaredOf("single", "boolean"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueSingleInteger, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueSingleInteger, "package", "path", "variable"),
          declaredOf("single", "integer"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueSingleFloat, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueSingleFloat, "package", "path", "variable"),
          declaredOf("single", "float"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueSingleString, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueSingleString, "package", "path", "variable"),
          declaredOf("single", "string"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueSinglePoint, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueSinglePoint, "package", "path", "variable"),
          declaredOf("single", "point"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueSinglePair, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueSinglePair, "package", "path", "variable"),
          declaredOf("single", "pair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueSingleDirectedPair, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueSingleDirectedPair, "package", "path", "variable"),
          declaredOf("single", "directedPair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueSingleDuration, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueSingleDuration, "package", "path", "variable"),
          declaredOf("single", "duration"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueSingleUri, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueSingleUri, "package", "path", "variable"),
          declaredOf("single", "uri"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueSingleFile, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueSingleFile, "package", "path", "variable"),
          declaredOf("single", "file"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueMultipleIdentifier, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueMultipleIdentifier, "package", "path", "variable"),
          declaredOf("multiple", "identifier"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueMultipleBoolean, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueMultipleBoolean, "package", "path", "variable"),
          declaredOf("multiple", "boolean"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueMultipleInteger, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueMultipleInteger, "package", "path", "variable"),
          declaredOf("multiple", "integer"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueMultipleFloat, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueMultipleFloat, "package", "path", "variable"),
          declaredOf("multiple", "float"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueMultipleString, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueMultipleString, "package", "path", "variable"),
          declaredOf("multiple", "string"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueMultiplePoint, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueMultiplePoint, "package", "path", "variable"),
          declaredOf("multiple", "point"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueMultiplePair, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueMultiplePair, "package", "path", "variable"),
          declaredOf("multiple", "pair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueMultipleDirectedPair, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueMultipleDirectedPair, "package", "path", "variable"),
          declaredOf("multiple", "directedPair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueMultipleDuration, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueMultipleDuration, "package", "path", "variable"),
          declaredOf("multiple", "duration"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueMultipleUri, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueMultipleUri, "package", "path", "variable"),
          declaredOf("multiple", "uri"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueMultipleFile, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueMultipleFile, "package", "path", "variable"),
          declaredOf("multiple", "file"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueOrderedIdentifier, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueOrderedIdentifier, "package", "path", "variable"),
          declaredOf("ordered", "identifier"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueOrderedBoolean, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueOrderedBoolean, "package", "path", "variable"),
          declaredOf("ordered", "boolean"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueOrderedInteger, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueOrderedInteger, "package", "path", "variable"),
          declaredOf("ordered", "integer"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueOrderedFloat, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueOrderedFloat, "package", "path", "variable"),
          declaredOf("ordered", "float"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueOrderedString, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueOrderedString, "package", "path", "variable"),
          declaredOf("ordered", "string"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueOrderedPoint, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueOrderedPoint, "package", "path", "variable"),
          declaredOf("ordered", "point"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueOrderedPair, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueOrderedPair, "package", "path", "variable"),
          declaredOf("ordered", "pair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueOrderedDirectedPair, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueOrderedDirectedPair, "package", "path", "variable"),
          declaredOf("ordered", "directedPair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueOrderedDuration, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueOrderedDuration, "package", "path", "variable"),
          declaredOf("ordered", "duration"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueOrderedUri, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueOrderedUri, "package", "path", "variable"),
          declaredOf("ordered", "uri"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(ItemSessionValueOrderedFile, ...sessionValueKey),
          on(ItemSessionValue, ...sessionValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(ItemSessionValueOrderedFile, "package", "path", "variable"),
          declaredOf("ordered", "file"),
        ),
      ),
      named(
        "Snapshot of its session",
        contained(on(ResponseSnapshot, ...sessionKey), on(ItemSession, ...sessionKey)),
      ),
      named(
        "Snapshot kind",
        alternatives(ResponseSnapshot, "kind", SnapshotKind, { attempt: Attempt, save: Save }),
      ),
      named(
        "Given snapshot",
        contained(on(SnapshotGiven, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Given before",
        check("Given_before", SnapshotGiven, (g) => g.le(g.given, Type.base(g.at))),
      ),
      named(
        "Processed attempt",
        contained(on(ProcessedAttempt, ...snapshotKey), on(Attempt, ...snapshotKey)),
      ),
      named(
        "Default submission",
        contained(on(DefaultSubmission, ...snapshotKey), on(Attempt, ...snapshotKey)),
      ),
      named(
        "Value in its header",
        contained(
          on(SnapshotSingleIdentifier, ...snapshotKey),
          on(ResponseSnapshot, ...snapshotKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotSingleIdentifier, "package", "path", "variable"),
          recordedOf("single", "identifier"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotSingleBoolean, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotSingleBoolean, "package", "path", "variable"),
          recordedOf("single", "boolean"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotSingleInteger, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotSingleInteger, "package", "path", "variable"),
          recordedOf("single", "integer"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotSingleFloat, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotSingleFloat, "package", "path", "variable"),
          recordedOf("single", "float"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotSingleString, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotSingleString, "package", "path", "variable"),
          recordedOf("single", "string"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotSinglePoint, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotSinglePoint, "package", "path", "variable"),
          recordedOf("single", "point"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotSinglePair, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotSinglePair, "package", "path", "variable"),
          recordedOf("single", "pair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(SnapshotSingleDirectedPair, ...snapshotKey),
          on(ResponseSnapshot, ...snapshotKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotSingleDirectedPair, "package", "path", "variable"),
          recordedOf("single", "directedPair"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotSingleDuration, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotSingleDuration, "package", "path", "variable"),
          recordedOf("single", "duration"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotSingleUri, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotSingleUri, "package", "path", "variable"),
          recordedOf("single", "uri"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotSingleFile, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotSingleFile, "package", "path", "variable"),
          recordedOf("single", "file"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(SnapshotMultipleIdentifier, ...snapshotKey),
          on(ResponseSnapshot, ...snapshotKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotMultipleIdentifier, "package", "path", "variable"),
          recordedOf("multiple", "identifier"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(SnapshotMultipleBoolean, ...snapshotKey),
          on(ResponseSnapshot, ...snapshotKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotMultipleBoolean, "package", "path", "variable"),
          recordedOf("multiple", "boolean"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(SnapshotMultipleInteger, ...snapshotKey),
          on(ResponseSnapshot, ...snapshotKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotMultipleInteger, "package", "path", "variable"),
          recordedOf("multiple", "integer"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotMultipleFloat, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotMultipleFloat, "package", "path", "variable"),
          recordedOf("multiple", "float"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotMultipleString, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotMultipleString, "package", "path", "variable"),
          recordedOf("multiple", "string"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotMultiplePoint, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotMultiplePoint, "package", "path", "variable"),
          recordedOf("multiple", "point"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotMultiplePair, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotMultiplePair, "package", "path", "variable"),
          recordedOf("multiple", "pair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(SnapshotMultipleDirectedPair, ...snapshotKey),
          on(ResponseSnapshot, ...snapshotKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotMultipleDirectedPair, "package", "path", "variable"),
          recordedOf("multiple", "directedPair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(SnapshotMultipleDuration, ...snapshotKey),
          on(ResponseSnapshot, ...snapshotKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotMultipleDuration, "package", "path", "variable"),
          recordedOf("multiple", "duration"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotMultipleUri, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotMultipleUri, "package", "path", "variable"),
          recordedOf("multiple", "uri"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotMultipleFile, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotMultipleFile, "package", "path", "variable"),
          recordedOf("multiple", "file"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(SnapshotOrderedIdentifier, ...snapshotKey),
          on(ResponseSnapshot, ...snapshotKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotOrderedIdentifier, "package", "path", "variable"),
          recordedOf("ordered", "identifier"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotOrderedBoolean, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotOrderedBoolean, "package", "path", "variable"),
          recordedOf("ordered", "boolean"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotOrderedInteger, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotOrderedInteger, "package", "path", "variable"),
          recordedOf("ordered", "integer"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotOrderedFloat, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotOrderedFloat, "package", "path", "variable"),
          recordedOf("ordered", "float"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotOrderedString, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotOrderedString, "package", "path", "variable"),
          recordedOf("ordered", "string"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotOrderedPoint, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotOrderedPoint, "package", "path", "variable"),
          recordedOf("ordered", "point"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotOrderedPair, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotOrderedPair, "package", "path", "variable"),
          recordedOf("ordered", "pair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(SnapshotOrderedDirectedPair, ...snapshotKey),
          on(ResponseSnapshot, ...snapshotKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotOrderedDirectedPair, "package", "path", "variable"),
          recordedOf("ordered", "directedPair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(SnapshotOrderedDuration, ...snapshotKey),
          on(ResponseSnapshot, ...snapshotKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotOrderedDuration, "package", "path", "variable"),
          recordedOf("ordered", "duration"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotOrderedUri, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotOrderedUri, "package", "path", "variable"),
          recordedOf("ordered", "uri"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotOrderedFile, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Declared type",
        contained(
          on(SnapshotOrderedFile, "package", "path", "variable"),
          recordedOf("ordered", "file"),
        ),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", SnapshotMultipleIdentifier, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", SnapshotMultipleBoolean, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", SnapshotMultipleInteger, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", SnapshotMultipleFloat, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", SnapshotMultipleString, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", SnapshotMultiplePoint, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", SnapshotMultiplePair, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", SnapshotMultipleDirectedPair, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", SnapshotMultipleDuration, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", SnapshotMultipleUri, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", SnapshotMultipleFile, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", ItemSessionValueMultipleIdentifier, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", ItemSessionValueMultipleBoolean, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", ItemSessionValueMultipleInteger, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", ItemSessionValueMultipleFloat, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", ItemSessionValueMultipleString, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", ItemSessionValueMultiplePoint, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", ItemSessionValueMultiplePair, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", ItemSessionValueMultipleDirectedPair, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", ItemSessionValueMultipleDuration, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", ItemSessionValueMultipleUri, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", ItemSessionValueMultipleFile, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Ordered gapless",
        contained(
          on(SnapshotOrderedIdentifier, ...snapshotKey, "variable", pred("place")),
          on(SnapshotOrderedIdentifier, ...snapshotKey, "variable", "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(SnapshotOrderedBoolean, ...snapshotKey, "variable", pred("place")),
          on(SnapshotOrderedBoolean, ...snapshotKey, "variable", "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(SnapshotOrderedInteger, ...snapshotKey, "variable", pred("place")),
          on(SnapshotOrderedInteger, ...snapshotKey, "variable", "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(SnapshotOrderedFloat, ...snapshotKey, "variable", pred("place")),
          on(SnapshotOrderedFloat, ...snapshotKey, "variable", "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(SnapshotOrderedString, ...snapshotKey, "variable", pred("place")),
          on(SnapshotOrderedString, ...snapshotKey, "variable", "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(SnapshotOrderedPoint, ...snapshotKey, "variable", pred("place")),
          on(SnapshotOrderedPoint, ...snapshotKey, "variable", "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(SnapshotOrderedPair, ...snapshotKey, "variable", pred("place")),
          on(SnapshotOrderedPair, ...snapshotKey, "variable", "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(SnapshotOrderedDirectedPair, ...snapshotKey, "variable", pred("place")),
          on(SnapshotOrderedDirectedPair, ...snapshotKey, "variable", "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(SnapshotOrderedDuration, ...snapshotKey, "variable", pred("place")),
          on(SnapshotOrderedDuration, ...snapshotKey, "variable", "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(SnapshotOrderedUri, ...snapshotKey, "variable", pred("place")),
          on(SnapshotOrderedUri, ...snapshotKey, "variable", "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(SnapshotOrderedFile, ...snapshotKey, "variable", pred("place")),
          on(SnapshotOrderedFile, ...snapshotKey, "variable", "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(ItemSessionValueOrderedIdentifier, ...sessionValueKey, pred("place")),
          on(ItemSessionValueOrderedIdentifier, ...sessionValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(ItemSessionValueOrderedBoolean, ...sessionValueKey, pred("place")),
          on(ItemSessionValueOrderedBoolean, ...sessionValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(ItemSessionValueOrderedInteger, ...sessionValueKey, pred("place")),
          on(ItemSessionValueOrderedInteger, ...sessionValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(ItemSessionValueOrderedFloat, ...sessionValueKey, pred("place")),
          on(ItemSessionValueOrderedFloat, ...sessionValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(ItemSessionValueOrderedString, ...sessionValueKey, pred("place")),
          on(ItemSessionValueOrderedString, ...sessionValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(ItemSessionValueOrderedPoint, ...sessionValueKey, pred("place")),
          on(ItemSessionValueOrderedPoint, ...sessionValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(ItemSessionValueOrderedPair, ...sessionValueKey, pred("place")),
          on(ItemSessionValueOrderedPair, ...sessionValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(ItemSessionValueOrderedDirectedPair, ...sessionValueKey, pred("place")),
          on(ItemSessionValueOrderedDirectedPair, ...sessionValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(ItemSessionValueOrderedDuration, ...sessionValueKey, pred("place")),
          on(ItemSessionValueOrderedDuration, ...sessionValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(ItemSessionValueOrderedUri, ...sessionValueKey, pred("place")),
          on(ItemSessionValueOrderedUri, ...sessionValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(ItemSessionValueOrderedFile, ...sessionValueKey, pred("place")),
          on(ItemSessionValueOrderedFile, ...sessionValueKey, "place"),
        ),
      ),
      named(
        "Bag image",
        check("BagImage", SnapshotMultipleFloat, (b) => b.eq(b.bits, Num.floatBits(b.value))),
      ),
      named(
        "Bag image",
        check("BagImage", SnapshotMultipleDuration, (b) => b.eq(b.bits, Num.floatBits(b.value))),
      ),
      named(
        "Bag image",
        check("BagImage", ItemSessionValueMultipleFloat, (b) =>
          b.eq(b.bits, Num.floatBits(b.value)),
        ),
      ),
      named(
        "Bag image",
        check("BagImage", ItemSessionValueMultipleDuration, (b) =>
          b.eq(b.bits, Num.floatBits(b.value)),
        ),
      ),
      named(
        "Least first",
        check("LeastFirst", SnapshotSinglePair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", SnapshotMultiplePair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", SnapshotOrderedPair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", SnapshotRecordPair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", ItemSessionValueSinglePair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", ItemSessionValueMultiplePair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", ItemSessionValueOrderedPair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Value in its header",
        contained(on(SnapshotRecord, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
      ),
      named(
        "Record declared",
        contained(
          on(SnapshotRecord, "package", "path", "variable"),
          on(
            select(ItemRecordVariable, (i) => i.in(i.declarationKind, recorded)),
            "package",
            "path",
            "identifier",
          ),
        ),
      ),
      named(
        "Record field type",
        alternatives(SnapshotRecord, "baseType", BaseType, {
          boolean: SnapshotRecordBoolean,
          directedPair: SnapshotRecordDirectedPair,
          duration: SnapshotRecordDuration,
          file: SnapshotRecordFile,
          float: SnapshotRecordFloat,
          identifier: SnapshotRecordIdentifier,
          integer: SnapshotRecordInteger,
          pair: SnapshotRecordPair,
          point: SnapshotRecordPoint,
          string: SnapshotRecordString,
          uri: SnapshotRecordUri,
        }),
      ),
      named(
        "Start of its session",
        contained(
          on(StartVariable, "child", "stage", "package", "path"),
          on(ItemSession, "child", "stage", "package", "path"),
        ),
      ),
      named(
        "Start of every session",
        contained(
          on(ItemSession, "child", "stage", "package", "path"),
          on(StartVariable, "child", "stage", "package", "path"),
        ),
      ),
      named(
        "Start variable declared",
        contained(
          on(StartVariable, "package", "path", "variable"),
          on(SessionVariableName, "package", "path", "identifier"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartSingleIdentifier, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartSingleIdentifier, "package", "path", "variable"),
          declaredOf("single", "identifier"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartSingleBoolean, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartSingleBoolean, "package", "path", "variable"),
          declaredOf("single", "boolean"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartSingleInteger, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartSingleInteger, "package", "path", "variable"),
          declaredOf("single", "integer"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartSingleFloat, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartSingleFloat, "package", "path", "variable"),
          declaredOf("single", "float"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartSingleString, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartSingleString, "package", "path", "variable"),
          declaredOf("single", "string"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartSinglePoint, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartSinglePoint, "package", "path", "variable"),
          declaredOf("single", "point"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartSinglePair, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(on(StartSinglePair, "package", "path", "variable"), declaredOf("single", "pair")),
      ),
      named(
        "Value in its header",
        contained(
          on(StartSingleDirectedPair, ...startValueKey),
          on(StartVariable, ...startValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(StartSingleDirectedPair, "package", "path", "variable"),
          declaredOf("single", "directedPair"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartSingleDuration, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartSingleDuration, "package", "path", "variable"),
          declaredOf("single", "duration"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartSingleUri, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(on(StartSingleUri, "package", "path", "variable"), declaredOf("single", "uri")),
      ),
      named(
        "Value in its header",
        contained(on(StartSingleFile, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(on(StartSingleFile, "package", "path", "variable"), declaredOf("single", "file")),
      ),
      named(
        "Value in its header",
        contained(
          on(StartMultipleIdentifier, ...startValueKey),
          on(StartVariable, ...startValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(StartMultipleIdentifier, "package", "path", "variable"),
          declaredOf("multiple", "identifier"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartMultipleBoolean, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartMultipleBoolean, "package", "path", "variable"),
          declaredOf("multiple", "boolean"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartMultipleInteger, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartMultipleInteger, "package", "path", "variable"),
          declaredOf("multiple", "integer"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartMultipleFloat, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartMultipleFloat, "package", "path", "variable"),
          declaredOf("multiple", "float"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartMultipleString, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartMultipleString, "package", "path", "variable"),
          declaredOf("multiple", "string"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartMultiplePoint, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartMultiplePoint, "package", "path", "variable"),
          declaredOf("multiple", "point"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartMultiplePair, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartMultiplePair, "package", "path", "variable"),
          declaredOf("multiple", "pair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(StartMultipleDirectedPair, ...startValueKey),
          on(StartVariable, ...startValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(StartMultipleDirectedPair, "package", "path", "variable"),
          declaredOf("multiple", "directedPair"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartMultipleDuration, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartMultipleDuration, "package", "path", "variable"),
          declaredOf("multiple", "duration"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartMultipleUri, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartMultipleUri, "package", "path", "variable"),
          declaredOf("multiple", "uri"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartMultipleFile, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartMultipleFile, "package", "path", "variable"),
          declaredOf("multiple", "file"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(StartOrderedIdentifier, ...startValueKey),
          on(StartVariable, ...startValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(StartOrderedIdentifier, "package", "path", "variable"),
          declaredOf("ordered", "identifier"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartOrderedBoolean, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartOrderedBoolean, "package", "path", "variable"),
          declaredOf("ordered", "boolean"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartOrderedInteger, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartOrderedInteger, "package", "path", "variable"),
          declaredOf("ordered", "integer"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartOrderedFloat, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartOrderedFloat, "package", "path", "variable"),
          declaredOf("ordered", "float"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartOrderedString, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartOrderedString, "package", "path", "variable"),
          declaredOf("ordered", "string"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartOrderedPoint, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartOrderedPoint, "package", "path", "variable"),
          declaredOf("ordered", "point"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartOrderedPair, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartOrderedPair, "package", "path", "variable"),
          declaredOf("ordered", "pair"),
        ),
      ),
      named(
        "Value in its header",
        contained(
          on(StartOrderedDirectedPair, ...startValueKey),
          on(StartVariable, ...startValueKey),
        ),
      ),
      named(
        "Declared type",
        contained(
          on(StartOrderedDirectedPair, "package", "path", "variable"),
          declaredOf("ordered", "directedPair"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartOrderedDuration, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartOrderedDuration, "package", "path", "variable"),
          declaredOf("ordered", "duration"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(StartOrderedUri, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(on(StartOrderedUri, "package", "path", "variable"), declaredOf("ordered", "uri")),
      ),
      named(
        "Value in its header",
        contained(on(StartOrderedFile, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Declared type",
        contained(
          on(StartOrderedFile, "package", "path", "variable"),
          declaredOf("ordered", "file"),
        ),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", StartMultipleIdentifier, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", StartMultipleBoolean, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", StartMultipleInteger, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", StartMultipleFloat, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", StartMultipleString, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", StartMultiplePoint, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", StartMultiplePair, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", StartMultipleDirectedPair, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", StartMultipleDuration, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", StartMultipleUri, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", StartMultipleFile, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Ordered gapless",
        contained(
          on(StartOrderedIdentifier, ...startValueKey, pred("place")),
          on(StartOrderedIdentifier, ...startValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(StartOrderedBoolean, ...startValueKey, pred("place")),
          on(StartOrderedBoolean, ...startValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(StartOrderedInteger, ...startValueKey, pred("place")),
          on(StartOrderedInteger, ...startValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(StartOrderedFloat, ...startValueKey, pred("place")),
          on(StartOrderedFloat, ...startValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(StartOrderedString, ...startValueKey, pred("place")),
          on(StartOrderedString, ...startValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(StartOrderedPoint, ...startValueKey, pred("place")),
          on(StartOrderedPoint, ...startValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(StartOrderedPair, ...startValueKey, pred("place")),
          on(StartOrderedPair, ...startValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(StartOrderedDirectedPair, ...startValueKey, pred("place")),
          on(StartOrderedDirectedPair, ...startValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(StartOrderedDuration, ...startValueKey, pred("place")),
          on(StartOrderedDuration, ...startValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(StartOrderedUri, ...startValueKey, pred("place")),
          on(StartOrderedUri, ...startValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(StartOrderedFile, ...startValueKey, pred("place")),
          on(StartOrderedFile, ...startValueKey, "place"),
        ),
      ),
      named(
        "Bag image",
        check("BagImage", StartMultipleFloat, (b) => b.eq(b.bits, Num.floatBits(b.value))),
      ),
      named(
        "Bag image",
        check("BagImage", StartMultipleDuration, (b) => b.eq(b.bits, Num.floatBits(b.value))),
      ),
      named(
        "Least first",
        check("LeastFirst", StartSinglePair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", StartMultiplePair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", StartOrderedPair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", StartRecordPair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Value in its header",
        contained(on(StartRecord, ...startValueKey), on(StartVariable, ...startValueKey)),
      ),
      named(
        "Record declared",
        contained(
          on(StartRecord, "package", "path", "variable"),
          on(ItemRecordVariable, "package", "path", "identifier"),
        ),
      ),
      named(
        "Record field type",
        alternatives(StartRecord, "baseType", BaseType, {
          boolean: StartRecordBoolean,
          directedPair: StartRecordDirectedPair,
          duration: StartRecordDuration,
          file: StartRecordFile,
          float: StartRecordFloat,
          identifier: StartRecordIdentifier,
          integer: StartRecordInteger,
          pair: StartRecordPair,
          point: StartRecordPoint,
          string: StartRecordString,
          uri: StartRecordUri,
        }),
      ),
      named(
        "Demand of its attempt",
        contained(on(ApplicationDemand, ...snapshotKey), on(Attempt, ...snapshotKey)),
      ),
      named(
        "Demand of an application",
        contained(
          on(ApplicationDemand, "package", "path", "operator"),
          on(RecordedApplication, "package", "path", "start"),
        ),
      ),
      named(
        "Evaluation of a demand",
        contained(on(OperatorEvaluation, ...demandKey), on(ApplicationDemand, ...demandKey)),
      ),
      named("Evaluation key", key(on(OperatorEvaluation, ...snapshotKey, "operator"))),
      named(
        "Evaluation application",
        contained(
          on(OperatorEvaluation, "package", "path", "operator", "class"),
          on(RecordedApplication, "package", "path", "start", "class"),
        ),
      ),
      named(
        "Evaluation grader",
        check("Evaluation_grader", OperatorEvaluation, (e) =>
          e.eq(Grader.at("class", e.grader), e.class),
        ),
      ),
      named(
        "Evaluation result",
        alternatives(OperatorEvaluation, "result", EvaluationResult, {
          declined: OperatorDecline,
          replied: OperatorReply,
        }),
      ),
      named(
        "Reply score",
        check("Reply_score", OperatorReply, (r) =>
          r.and(r.ge(r.score, 0), r.lt(r.score, Number.POSITIVE_INFINITY)),
        ),
      ),
      named(
        "Reply feedback",
        contained(on(OperatorFeedback, ...evaluationKey), on(OperatorReply, ...evaluationKey)),
      ),
      named(
        "Human demand of its attempt",
        contained(on(HumanDemand, ...snapshotKey), on(Attempt, ...snapshotKey)),
      ),
      named(
        "Human demand rubric",
        contained(
          on(HumanDemand, "package", "path", "rubric"),
          on(RubricGrader, "package", "path", "rubric"),
        ),
      ),
      named(
        "Maximum of a demand",
        contained(on(ApplicationMaximum, ...demandKey), on(ApplicationDemand, ...demandKey)),
      ),
      named(
        "Maximum of a human demand",
        contained(on(HumanDemandMaximum, ...humanDemandKey), on(HumanDemand, ...humanDemandKey)),
      ),
      named(
        "Value of a human demand",
        contained(on(HumanOperatorValue, ...humanDemandKey), on(HumanDemand, ...humanDemandKey)),
      ),
      named(
        "Human score",
        check("Human_score", HumanOperatorValue, (h) =>
          h.and(h.ge(h.score, 0), h.lt(h.score, Number.POSITIVE_INFINITY)),
        ),
      ),
      named(
        "Human feedback",
        contained(on(HumanOperatorFeedback, ...humanKey), on(HumanOperatorValue, ...humanKey)),
      ),
      named(
        "Run of its test session",
        contained(
          on(TestOutcomeRun, "child", "stage"),
          on(sittings.tables.TestSession, "child", "stage"),
        ),
      ),
      named(
        "Session context of its test session",
        contained(
          on(SessionContextFloat, "child", "stage"),
          on(sittings.tables.TestSession, "child", "stage"),
        ),
      ),
      named(
        "Session context of its test session",
        contained(
          on(SessionContextInteger, "child", "stage"),
          on(sittings.tables.TestSession, "child", "stage"),
        ),
      ),
      named(
        "Session context of its test session",
        contained(
          on(SessionContextBoolean, "child", "stage"),
          on(sittings.tables.TestSession, "child", "stage"),
        ),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeSingleIdentifier, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeSingleBoolean, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeSingleInteger, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeSingleFloat, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeSingleString, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeSinglePoint, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeSinglePair, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeSingleDirectedPair, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeSingleDuration, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeSingleUri, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeSingleFile, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeMultipleIdentifier, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeMultipleBoolean, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeMultipleInteger, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeMultipleFloat, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeMultipleString, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeMultiplePoint, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeMultiplePair, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeMultipleDirectedPair, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeMultipleDuration, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeMultipleUri, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeMultipleFile, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeOrderedIdentifier, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeOrderedBoolean, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeOrderedInteger, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeOrderedFloat, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeOrderedString, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeOrderedPoint, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeOrderedPair, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeOrderedDirectedPair, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeOrderedDuration, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeOrderedUri, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeOrderedFile, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", TestOutcomeMultipleIdentifier, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", TestOutcomeMultipleBoolean, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", TestOutcomeMultipleInteger, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", TestOutcomeMultipleFloat, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", TestOutcomeMultipleString, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", TestOutcomeMultiplePoint, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", TestOutcomeMultiplePair, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", TestOutcomeMultipleDirectedPair, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", TestOutcomeMultipleDuration, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", TestOutcomeMultipleUri, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Some occurrence",
        check("SomeOccurrence", TestOutcomeMultipleFile, (m) => m.ge(m.count, 1n)),
      ),
      named(
        "Ordered gapless",
        contained(
          on(TestOutcomeOrderedIdentifier, ...runValueKey, pred("place")),
          on(TestOutcomeOrderedIdentifier, ...runValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(TestOutcomeOrderedBoolean, ...runValueKey, pred("place")),
          on(TestOutcomeOrderedBoolean, ...runValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(TestOutcomeOrderedInteger, ...runValueKey, pred("place")),
          on(TestOutcomeOrderedInteger, ...runValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(TestOutcomeOrderedFloat, ...runValueKey, pred("place")),
          on(TestOutcomeOrderedFloat, ...runValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(TestOutcomeOrderedString, ...runValueKey, pred("place")),
          on(TestOutcomeOrderedString, ...runValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(TestOutcomeOrderedPoint, ...runValueKey, pred("place")),
          on(TestOutcomeOrderedPoint, ...runValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(TestOutcomeOrderedPair, ...runValueKey, pred("place")),
          on(TestOutcomeOrderedPair, ...runValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(TestOutcomeOrderedDirectedPair, ...runValueKey, pred("place")),
          on(TestOutcomeOrderedDirectedPair, ...runValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(TestOutcomeOrderedDuration, ...runValueKey, pred("place")),
          on(TestOutcomeOrderedDuration, ...runValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(TestOutcomeOrderedUri, ...runValueKey, pred("place")),
          on(TestOutcomeOrderedUri, ...runValueKey, "place"),
        ),
      ),
      named(
        "Ordered gapless",
        contained(
          on(TestOutcomeOrderedFile, ...runValueKey, pred("place")),
          on(TestOutcomeOrderedFile, ...runValueKey, "place"),
        ),
      ),
      named(
        "Bag image",
        check("BagImage", TestOutcomeMultipleFloat, (b) => b.eq(b.bits, Num.floatBits(b.value))),
      ),
      named(
        "Bag image",
        check("BagImage", TestOutcomeMultipleDuration, (b) => b.eq(b.bits, Num.floatBits(b.value))),
      ),
      named(
        "Least first",
        check("LeastFirst", TestOutcomeSinglePair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", TestOutcomeMultiplePair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", TestOutcomeOrderedPair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Least first",
        check("LeastFirst", TestOutcomeRecordPair, (p) => p.le(p.least, p.greatest)),
      ),
      named(
        "Value in its header",
        contained(on(TestOutcomeRecord, ...runKey), on(TestOutcomeRun, ...runKey)),
      ),
      named(
        "Record field type",
        alternatives(TestOutcomeRecord, "baseType", BaseType, {
          boolean: TestOutcomeRecordBoolean,
          directedPair: TestOutcomeRecordDirectedPair,
          duration: TestOutcomeRecordDuration,
          file: TestOutcomeRecordFile,
          float: TestOutcomeRecordFloat,
          identifier: TestOutcomeRecordIdentifier,
          integer: TestOutcomeRecordInteger,
          pair: TestOutcomeRecordPair,
          point: TestOutcomeRecordPoint,
          string: TestOutcomeRecordString,
          uri: TestOutcomeRecordUri,
        }),
      ),
      ...sittings.laws,
      named(
        "Presented item session",
        contained(
          on(sittings.tables.TestPresented, "child", "stage", "package", "path"),
          on(ItemSession, "child", "stage", "package", "path"),
        ),
      ),
      ...assertionLaws,
    ],
  );
};
