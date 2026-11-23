/**
 * The ledger's law catalog: every law its levels state, by the name a refusal shows, with where its
 * statement comes from, the one statement of both. Each statement of the ledger's levels takes its
 * entry here once (grizzle's `law({ name, source }, statement)`, by {@link named}), so a refusal of
 * a ledger law, in this package or a level above, names it as its author does. pantry's laws take
 * theirs from its own table (`@qti-pie/pantry/vocab/laws.ts` `lawTable`), in the same form: a QTI
 * rule's source is the information model's page and anchor, then the section, the class and its
 * words; a rule of the ledger's own representation is the module and the relation that state it.
 * A relation's primary key, a generated field, a text type's pattern and a contract take theirs
 * at their declarations the same way.
 */
import { law } from "@bjornpagen/grizzle";

/**
 * QTI 3.0.1's information model, the page every QTI source names an anchor of.
 */
const info = "https://www.imsglobal.org/spec/qti/v3p0/info";

/**
 * A law's source: where its statement comes from.
 */
interface LedgerLaw {
  readonly source: string;
}

/**
 * Every law the ledger's levels state, by name, with its source.
 */
export const ledgerLaws = {
  "Assertion instant": {
    source:
      "src/ledger.ts OutcomeAssertion: 'An assertion's key: its attempt's value's, `(child, package, path, n, at, variable)`, and its own instant'",
  },
  "Assertion kind": {
    source: `${info}#Enumerated_ExternalScoredEnum (§8.21, ExternalScoredEnum: 'externalMachine', 'an external scoring system will be used to score the Item', and 'human', 'a human must score the Item'): an outcome's assertion is of one kind, its arm (src/ledger.ts ExternalScoring, OutcomeAssertion)`,
  },
  "Assertion of its attempt": {
    source:
      "src/ledger.ts OutcomeAssertion: an outcome value an external scorer asserts of an attempt, by the attempt's key",
  },
  "Assertion scoring": {
    source: `${info}#RootCharacteristic_OutcomeDeclaration.Attr_external-scored (Table 4.5.10, 'Enumerated value set of: { externalMachine | human }'): an assertion is of an outcome its declaration scores externally, and of the kind it names, one roster held equal by this law (src/ledger.ts ExternalScoring; src/assertion-views.ts ExternallyScored)`,
  },
  "Bag image": {
    source:
      "src/ledger.ts Snapshot<Multiple><Float|Duration>: 'A multiple of float or duration keys each distinct value by its identity image, `bits`, grizzle's `Num.floatBits` of the value (its IEEE 754 bits, every NaN one), which the law BagImage holds it to'",
  },
  "Budget chain": {
    source:
      "src/delivery.ts BudgetChain: each later candidate session's budget is what its sitting's previous candidate session left it, charged up to its last sign of presence (src/sittings.ts TestBudget, the time a candidate session begins with; Presence)",
  },
  "Budget of a visit": {
    source:
      "src/sittings.ts TestBudget: 'the time a candidate session begins with', of a candidate session of the sitting",
  },
  "Candidate session place": {
    source: `${info}#Main2p2 (§2.2.1: 'During each attempt the candidate interacts with the item through one or more candidate sessions'): a sitting's candidate sessions by their place k, a visit, its suspension and its budget one a place (src/sittings.ts TestVisit, TestSuspension, TestBudget)`,
  },
  "Declared type": {
    source: `${info}#RootCharacteristic_OutcomeDeclaration.Attr_cardinality (Table 4.5.2, and the response's, template's and context's: a variable's cardinality and base-type are its declaration's, ${info}#RootCharacteristic_OutcomeDeclaration.Attr_base-type): 'A value's base type and cardinality are its declaration's, so no row states them: the relation a value is in names them, and a law holds that relation to the declaration' (src/ledger.ts)`,
  },
  "Default submission": {
    source:
      "src/ledger.ts DefaultSubmission: 'An attempt that submitted every response at its default, posting none (a skip, or a presented member its test's end submits unsaved)', an attempt's arm",
  },
  "Delivered shape": {
    source:
      "src/delivery.ts UndeliveredSitting: no sitting is of a test this runtime does not deliver (DeliveredTest's clauses)",
  },
  "Distinct values": {
    source: `${info}#Enumerated_CardinalityEnum (§8.17, CardinalityEnum: 'multiple' - 'containers may contain multiple occurrences of the same value'): 'a multiple's distinct values, each with how many times it occurs', each distinct value one row, a float's or a duration's by its identity image and a string's by its digest (src/ledger.ts)`,
  },
  "End of a visit": {
    source:
      "src/sittings.ts TestEnd: the end of a sitting, 'the candidate's submission or the delivery engine's close at the deadline', ends a candidate session of it",
  },
  "Evaluation application": {
    source:
      "src/ledger.ts OperatorEvaluation: 'the value a recorded custom operator took in an attempt (the registry's `RecordedApplication`, `#registry/levels.ts`)', of the operator's class",
  },
  "Evaluation grader": {
    source:
      "src/ledger.ts OperatorEvaluation: 'the grader version that produced it (the registry's `Grader`, of that class)'",
  },
  "Evaluation instant": {
    source:
      "src/ledger.ts OperatorEvaluation: by the attempt's key, the operator's place in the item's document (`start`) and the instant it was recorded, 'a clock whose child is the application, so one row per application and attempt'",
  },
  "Evaluation key": {
    source:
      "src/ledger.ts OperatorEvaluation: 'a fact the registered evaluator records once per application and attempt, which the SQL grader reads, so every invocation of response processing reads the same value' (ASI §2.11.3: 'Operators never effect the values of itemVariables directly')",
  },
  "Evaluation of its attempt": {
    source: `${info}#Main2p11 (§2.11.3: 'Operators never effect the values of itemVariables directly'): an operator's recorded value is of the attempt its response processing reads it in (src/ledger.ts OperatorEvaluation)`,
  },
  "Evaluation result": {
    source:
      "src/ledger.ts OperatorReply, OperatorDecline: an evaluation 'replied or declined', its arm",
  },
  "Final after the end": {
    source:
      "src/sittings.ts SittingFinal: 'A sitting whose outcomes are final', stored once its sitting has ended (TestEnd)",
  },
  "Final instant": {
    source:
      "src/sittings.ts SittingFinal: 'stored at the instant the write that made it so stamps (a clock whose child is the sitting)'",
  },
  "Final key": {
    source: "src/sittings.ts SittingFinal: 'one row per sitting'",
  },
  "Final settled": {
    source:
      "src/results.ts UnsettledFinal: 'Each final sitting that holds an attempt not final, `settled` false: none may stand'",
  },
  "Given before": {
    source:
      "src/ledger.ts SnapshotGiven: `given`, the browser's reading of the database's clock when the candidate gave the response, 'at or before the snapshot's own instant'",
  },
  "Given snapshot": {
    source:
      "src/ledger.ts SnapshotGiven: 'A sitting's response snapshot with `given`', beside its snapshot",
  },
  "Human feedback": {
    source:
      "src/ledger.ts HumanOperatorFeedback: 'the feedback where it is no empty string', of a person's value",
  },
  "Human score": {
    source:
      "src/ledger.ts HumanOperatorValue: 'the person who scored (`scorer`) and the score, a finite float of zero or more'",
  },
  "Human value instant": {
    source:
      "src/ledger.ts HumanOperatorValue: by the attempt's key, the rubric block's `id` and 'the instant it was recorded, a clock whose child is the attempt and the group, append-only, the latest the one in force'",
  },
  "Human value of its attempt": {
    source:
      "src/ledger.ts HumanOperatorValue: 'the value a person recorded for a rubric group of an attempt', by the attempt's key",
  },
  "Human value rubric": {
    source:
      "src/ledger.ts HumanOperatorValue: a rubric group 'the registry's `RubricGrader`, every `rubric-score` application of an item that names one scorer rubric block'",
  },
  "Human within maximum": {
    source:
      "src/operands.ts HumanValueBound: a person's value is at most the maximum of every application of its rubric group at the attempt",
  },
  "In turn": {
    source: `${info}#DataCharacteristic_TestPart.Attr_navigation-mode (Table 5.159.4: 'the candidate [is restricted] to attempt each item in turn. Once the candidate moves on they are not permitted to return'): an attempt is of a presented member, and a linear part's member the candidate moved on from has its attempt (src/test-laws.ts)`,
  },
  "Item of the content": {
    source:
      "src/ledger.ts ItemSession: 'an item a sitting serves, QTI's item session, by its package and item document', a document of the content the ledger extends",
  },
  "Item session key": {
    source:
      "src/ledger.ts ItemSession: 'its sitting (`stage`) beside it, at most one per sitting and item'",
  },
  "Item session place": {
    source:
      "src/ledger.ts ItemSession: 'its place `n` among the learner's sessions of that item, which the database stamps one past the greatest (grizzle's `place`), so the places run gapless from 0'",
  },
  "Item stage control": {
    source:
      "src/session-control.ts ItemStageSession: every item session of a stage no test sitting holds is delivered under its stage's control, the one the application's decision writes beside it (src/ledger.ts StageControl)",
  },
  "Key text bound": {
    source:
      "src/ledger.ts IdentifierValue, UriValue, FileName, FileType: each key text at most the UTF-8 bytes its kind holds (pantry's src/qti/limits.ts identifierBytes, uriBytes, nameMaxBytes, src/qti/media.ts mediaTypeBytes), so every key's entry fits PostgreSQL's B-tree budget; a stated limit of the representation, not a law of the specification",
  },
  "Last beacon": {
    source:
      "src/delivery.ts LastBeacon: 'A sitting's last beacon: the last microsecond of a window, one before its end, so never past the last microsecond of the clock's top'",
  },
  "Learner id": {
    source:
      "src/keys.ts LearnerId: 'an opaque text of one byte or more the application assigns ... of at most learnerIdBytes UTF-8 bytes' (69, edullm's Clerk user ids)",
  },
  "Least first": {
    source: `${info}#Enumerated_BaseTypeEnum (§8.14, BaseTypeEnum: 'pair' - 'The association is undirected so (A,B) and (B,A) are equivalent'): 'pair as its two identifiers in code-point order, least and greatest, so the two orders of one pair are one row' (src/ledger.ts)`,
  },
  "Linear never back": {
    source: `${info}#Main2p8p2 (§2.8.2: 'Once the candidate moves on they are not permitted to return'): a linear part's later presentation is never of an item ref before the earlier's (src/delivery.ts LinearPresentations)`,
  },
  "Members only": {
    source:
      "src/test-laws.ts: 'every item session of a sitting's stage is of a member of its test', since a delivered test selects nothing",
  },
  "Members only, its package": {
    source: "src/test-laws.ts: 'every item session of a sitting's stage is in its test's package'",
  },
  "Members, completely": {
    source: `${info}#DataCharacteristic_Selection.Attr_select (Table 5.129: 'If no selection rules are given it must be assumed that all elements are to be selected'): every member of a sitting's test has its item session in the sitting's stage (src/test-laws.ts)`,
  },
  Micros: {
    source:
      "src/sittings.ts Micros: 'A span of time in microseconds, the resolution of the database's instants, exactly, a whole numeric', twenty digits",
  },
  Moment: {
    source:
      "src/sittings.ts TestMoment: 'Every instant of a sitting's candidate sessions, presentations and end is one clock, TestMoment's, whose child is the sitting'",
  },
  "Moment instant": {
    source:
      "src/sittings.ts TestMoment: 'each call on a sitting stamps one moment above every moment the sitting holds', the clock of its visits, suspensions, presentations and end",
  },
  "Moment key": {
    source:
      "src/sittings.ts TestMoment: each call on a sitting stamps one moment, so a sitting's visit and suspension are each one per instant",
  },
  "Moment of its test session": {
    source: "src/sittings.ts TestMoment: a moment of a sitting's test session (TestSession)",
  },
  "Nonempty text": {
    source: `${info}#OpIsNull (§2.11, qti-is-null: 'Note that empty containers and empty strings are both treated as NULL'): 'A text of one character or more' (src/keys.ts someText), and a feedback that is no empty string (src/evaluations.ts Feedback)`,
  },
  "One attempt": {
    source: `${info}#DataCharacteristic_TestPart.Attr_submission-mode (Table 5.159.5; the overview: 'By definition the candidate can take one and only one attempt at each item'), and a non-adaptive item's max-attempts, 1 by default (${info}#DerivedCharacteristic_ItemSessionControl.Attr_max-attempts, Table 7.19.1: 'A value of 0 indicates no limit'): at most one attempt per member's item session, but a member whose item ref, in an individual part, sets max-attempts 0 (src/test-laws.ts, src/member-controls.ts)`,
  },
  "One context value": {
    source:
      "src/ledger.ts SessionContext: the value the delivery engine bound for one of a sitting's test context declarations, 'written once by the application that binds it', one a declaration",
  },
  "One control a stage": {
    source: `${info}#DataCharacteristic_ItemSessionControl (§7.19, ItemSessionControl): 'src/ledger.ts StageControl: the item-session control an application's decision states for an item stage', one a stage`,
  },
  "One end a sitting": {
    source: `${info}#DataCharacteristic_TestPart.Attr_submission-mode (Table 5.159.5: 'all submitted together at the end'): 'TestEnd is that end', one a sitting (src/sittings.ts)`,
  },
  "One seed a session": {
    source:
      "src/ledger.ts SessionSeed: 'the seed an item session's template and response processing draw under, by the session's sitting (`stage`) and item', one a session",
  },
  "One test session a sitting": {
    source: `${info}#Main2p8 (§2.8: a test session is 'a group of assessment-items with an associated set of rules'): 'A stage that delivers a test holds one TestSession' (src/sittings.ts)`,
  },
  "One value a field": {
    source: `${info}#Enumerated_CardinalityEnum (§8.17, CardinalityEnum: 'record' - 'a set of independent values each identified by its own identifier'): a record's field is its header, one a field (src/ledger.ts SnapshotRecord, TestOutcomeRecord)`,
  },
  "One value a place": {
    source: `${info}#Enumerated_CardinalityEnum (§8.17, CardinalityEnum: 'ordered'): 'an ordered's values at their places from 0, gapless', one value a place (src/ledger.ts)`,
  },
  "Ordered gapless": {
    source: `${info}#Enumerated_CardinalityEnum (§8.17, CardinalityEnum: 'ordered' - '[A,B,C] is equivalent to a similar one with value [C,B,A] whereas these two values would be considered distinct for containers with cardinality ordered'): 'an ordered's values at their places from 0, gapless' (src/ledger.ts)`,
  },
  "Piece end": {
    source:
      "src/delivery.ts PieceEnd: 'The end of a piece of a sitting's presence, one past its last microsecond: never past the last microsecond of the clock's top'",
  },
  "Piece start": {
    source:
      "src/delivery.ts PieceStart: 'The first microsecond of a piece of a sitting's presence: never before the clock's 0'",
  },
  "Presence moment": {
    source:
      "src/sittings.ts Moment: 'An end of a presence window: an instant on the database's clock in microseconds since the Unix epoch, from 0 to clockTop'",
  },
  "Presence of its test session": {
    source:
      "src/sittings.ts Presence: a window of presence is of a sitting's test session (TestSession)",
  },
  "Presence reading": {
    source:
      "src/sittings.ts Reading: 'A reading of the database's clock in microseconds since the Unix epoch, the instant a call's transaction began', one below Moment' top",
  },
  "Presence window": {
    source:
      "src/sittings.ts Presence: 'No two windows of a sitting overlap: its key is `(child, stage, during WITHOUT OVERLAPS)`', one row a stretch of presence (the owner's presence design, 2026-11-23, option (ii))",
  },
  "Presented in a visit": {
    source:
      "src/sittings.ts TestPresented: 'the item the candidate is shown from its instant on', in a candidate session of the sitting",
  },
  "Presented item session": {
    source:
      "src/sittings.ts TestPresented: 'the item session entering the interacting state', an item session of the sitting",
  },
  "Processed attempt": {
    source:
      "src/ledger.ts ProcessedAttempt: 'An attempt whose response processing ran', with QTI's built-in completion status after it",
  },
  "QTI integer": {
    source:
      "src/scalars.ts QtiInteger: 'QTI's integer, exact ... an integral numeric of integerDigits digits' (825, the SQL grader's numeric(825, 0)), at scale 0 no NaN",
  },
  "Record declared": {
    source:
      "src/ledger.ts SnapshotRecord: 'a record response's fields in the snapshot', of a recorded variable its item declares of record cardinality",
  },
  "Record field type": {
    source: `${info}#Enumerated_CardinalityEnum (§8.17, CardinalityEnum: 'record' - 'a set of independent values each identified by its own identifier and having its own base-type'): 'the field is the header and its value the arm of its base type' (src/ledger.ts SnapshotRecord)`,
  },
  "Registry value entry": {
    source:
      "src/registry/levels.ts RegistryValue: 'Each map table's value of each of its keys', a key its table holds",
  },
  "Reply feedback": {
    source:
      "src/ledger.ts OperatorFeedback: a replied evaluation's 'feedback where the reply's is no empty string, which is QTI's NULL'",
  },
  "Reply score": {
    source: "src/ledger.ts OperatorReply: 'its `score` a finite float of zero or more'",
  },
  "Reply within maximum": {
    source:
      "src/operands.ts ReplyBound: a machine's reply is at most its application's maximum at the attempt",
  },
  "Response in time": {
    source: `${info}#DerivedCharacteristic_TimeLimits.Attr_allow-late-submission (Table 7.40.3: 'The allow-late-submission attribute regulates whether a candidate's response that is beyond the max-time should still be accepted', 'Default = false'): a response given and arrived within its candidate session's budget (src/delivery.ts TimedResponse)`,
  },
  "Run instant": {
    source:
      "src/ledger.ts TestOutcomeRun: 'one run, by its sitting and its instant, a clock whose child is the sitting, stamped by the insert that adds it'",
  },
  "Run of its test session": {
    source:
      "src/ledger.ts TestOutcomeRun: 'one run, by its sitting and its instant', a run of the sitting's test session's outcome processing",
  },
  "Scorer id": {
    source:
      "src/keys.ts ScorerId: 'the person who scores an external-scored outcome or a rubric group by hand, an opaque text of one byte or more the application assigns, of at most scorerIdBytes UTF-8 bytes'",
  },
  "Served for credit": {
    source:
      "src/servable.ts: 'every item session is of an item served for credit, so an item outside the verdict ... is stored as written and never served (Conformance §3)'",
  },
  "Session context of its test session": {
    source: `${info}#Data_ContextDeclaration (Table 5.34, ContextDeclaration: 'Context variables are typically used to inject the 'context' under which an item or test session is operating'): a value the delivery engine bound for a sitting's context declaration (src/ledger.ts SessionContext)`,
  },
  "Session seed": {
    source:
      "src/ledger.ts SessionSeed: 'the seed an item session's template and response processing draw under ... every item session holds one (ItemSession ⊆ SessionSeed)'",
  },
  "Session value once": {
    source:
      "src/ledger.ts ItemSessionValue: what the take's template processing set of a variable, of each kind, 'drawn once when the session is taken, never again'",
  },
  "Settable kind": {
    source: `${info}#Abstract_TemplateRuleGroup (TemplateRuleGroup: a template value a template variable, qti-set-correct-response 'The response variable to have its correct value set' (Table 6.51.5), qti-set-default-value 'The response variable or outcome variable to have its default value set' (Table 6.51.4)): what template processing set names a variable of the kind its rule sets (src/ledger.ts settable)`,
  },
  "Shown before saved": {
    source: `${info}#Main2p2 (§2.2.1: 'The initial state of an item session represents the state after it has been determined that the item will be delivered to the candidate but before the delivery has taken place'; §2.3: 'The body must be presented to the candidate when the associated item session is in the interacting state. In this state, the candidate must be able to interact with each of the visible interactions and therefore set or update the values of the associated response variables'): a save is of a member the candidate was shown, in any part (src/test-laws.ts)`,
  },
  "Single value": {
    source: `${info}#Enumerated_CardinalityEnum (§8.17, CardinalityEnum: 'single' - 'a cardinality of single i.e. a single value'): a single variable's sidecar holds one row a variable, its value (src/ledger.ts: 'a single value')`,
  },
  "Sitting control from its test": {
    source: `${info}#DataCharacteristic_ItemSessionControl (§7.19: 'a setting at qti-test-part level affects all items in that part unless the setting is overridden at the qti-assessment-section level or ultimately at the individual qti-assessment-item-ref'): a test sitting holds no stage control, its members' controls are its test's (src/session-control.ts SittingStageControl)`,
  },
  "Sitting order": {
    source:
      "src/delivery.ts SittingOrder: 'Two instants of a sitting, by what they are: `earlier` must come before `later`, or be the same instant where `strict` is false'",
  },
  "Snapshot instant": {
    source:
      "src/ledger.ts ResponseSnapshot: 'A snapshot's instant is its clock, stamped by the insert that adds it, greater than every instant of its session'; its arm and its values hold that instant",
  },
  "Snapshot kind": {
    source:
      "src/ledger.ts ResponseSnapshot: 'of a kind (`SnapshotKind`): an Attempt, its arm, or a Save, the response values pending or suspended'",
  },
  "Snapshot of its session": {
    source:
      "src/ledger.ts ResponseSnapshot: 'the response and outcome values an item session held at an instant'",
  },
  "Some attempt": {
    source: `${info}#DataCharacteristic_ItemSessionControl.Attr_max-attempts (Table 7.19.1, 'Normally this is 1'): a stage's control allows at least one attempt, so every item session of the stage can close (src/ledger.ts StageControl)`,
  },
  "Some occurrence": {
    source: `${info}#Enumerated_CardinalityEnum (§8.17, CardinalityEnum: 'multiple' - 'containers may contain multiple occurrences of the same value'): 'a multiple's distinct values, each with how many times it occurs' (src/ledger.ts), at least once`,
  },
  "Start of every session": {
    source:
      "src/ledger.ts StartVariable: every item session begins with its start, which its take writes beside its values, in one stratum; the start holds completionStatus, so every session has a header",
  },
  "Start of its session": {
    source:
      "src/ledger.ts StartVariable: 'the record an item session begins with', by the session's key, its stage",
  },
  "Start variable declared": {
    source:
      "src/ledger.ts StartVariable: 'each variable that is no context' of the session's item, a declared one, a record or a built-in (SessionVariableName)",
  },
  "Start variable once": {
    source:
      "src/ledger.ts StartVariable: one header a variable of the session's start, its key the session's by its stage and the variable",
  },
  "Submitted together": {
    source: `${info}#DataCharacteristic_TestPart.Attr_submission-mode (Table 5.159.5: 'simultaneous ... all submitted together at the end'): a simultaneous part's attempts exist only with its sitting's end, and its end submits every member the candidate was shown (src/test-laws.ts)`,
  },
  "Suspended in time": {
    source: `${info}#DerivedCharacteristic_TimeLimits.Attr_max-time (Table 7.40: 'This is the maximum duration, in seconds, allocated to the test'): a suspended candidate session of a timed sitting whose test allows no late submission ran, up to its last sign of presence, within the time it began with (src/delivery.ts SuspensionInTime)`,
  },
  "Suspension of a visit": {
    source:
      "src/sittings.ts TestSuspension: 'a TestSuspension ends one' candidate session, a visit of the sitting",
  },
  "Test snapshot of its session": {
    source:
      "src/delivery.ts TestSnapshot: a test member's response snapshot is one taken inside a candidate session of its sitting (SessionSnapshot)",
  },
  "Unended sitting key": {
    source:
      "src/results.ts UnendedSitting: 'At most one per child and test (its key, below): a second take while one stands unended is a fact that did not happen'",
  },
  "Unfinal ended": {
    source:
      "src/results.ts UnfinalEnded: 'Each ended sitting that has no SittingFinal row: each must hold an attempt not final'",
  },
  "Value digest": {
    source:
      "src/ledger.ts: a multiple of strings keys each member by its digest, `valueDigest`, the SHA-256 of its UTF-8 bytes, which PostgreSQL computes from the value, so a value too wide for a B-tree entry is keyed by its 32 bytes",
  },
  "Value in its header": {
    source:
      "src/ledger.ts: a value's row is in the sidecar of its declared cardinality and base type beside its header ('ItemSessionValue<Single|Multiple|Ordered><BaseType>', 'Snapshot<Single|Multiple|Ordered><BaseType>', TestOutcome's and an assertion's alike), so a sidecar's row has its header's",
  },
  "Value of its session": {
    source:
      "src/ledger.ts ItemSessionValue: 'a variable the item session's template processing set at the take'",
  },
  "Visits between suspensions": {
    source: `${info}#Main2p2 (§2.2.1: 'At the end of a candidate session the item may be placed into the suspended state ready for the next candidate session'): each later candidate session follows a suspension of the one before it (src/sittings.ts TestVisit)`,
  },
} as const satisfies Readonly<Record<string, LedgerLaw>>;

/**
 * The name of a law of the ledger's catalog.
 */
export type LedgerLawName = keyof typeof ledgerLaws;

/**
 * A declaration with its law's catalog entry, grizzle's `law` of the name and its source: a
 * statement, a relation (its primary key's law), a generated field or a text type (its pattern's).
 *
 * @param name The law's name in {@link ledgerLaws}.
 * @param declaration The declaration the law comes from.
 * @returns The declaration's copy, carrying the entry, which the level declares and reads.
 */
export const named = <const S extends Parameters<typeof law>[1]>(
  name: LedgerLawName,
  declaration: S,
): S => law({ name, source: ledgerLaws[name].source }, declaration);
