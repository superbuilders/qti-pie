/**
 * The result relations of an AI-graded essay on a migrated database, held to a decision table
 * written apart from the code, under a composition that registers rubric-score's grader
 * (`#ledger/test/result-level.ts`): what an attempt's response processing waits for
 * (`PendingApplication`, `AwaitingHumanEvaluation`), the operands its request is made of
 * (`ApplicationOperands`, `ApplicationMaximum`, `ApplicationDraw`), its Results Reporting status
 * (`ItemSessionStatus`), its values in force and its credit (`OutcomeInForceSingleFloat`,
 * `AttemptCredit`), and the laws that hold a machine's reply and a person's value to the
 * application's maximum (`Reply_within_maximum`, `Human_within_maximum`). An application's own
 * suite proves the rest of the result seam on its own installation (edullm's `results.db.test.ts`,
 * whose composition registers no grader, so its essays are never evaluated). It runs only where a
 * database is handed to it (`QTI_PIE_RESULT_MIGRATIONS` and pantry's `QTI_PIE_PG_*`, by its runner,
 * which migrates `grizzle.result.config.ts` into a database of its own on the shared PostgreSQL
 * server), and is skipped elsewhere.
 *
 * Every fact is written through a program, as an application writes it: the item session with its
 * seed and the attempt's snapshot with its response, as host rows through the suite's login
 * (`facts`, every instant the insert's), history's with the grading its import carries, then
 * graded as the write that records an attempt grades it (`grade`, P4's `gradeAttemptOf` over the
 * session's sitting); each draw's evaluation through the ledger's own evaluator write
 * (`evaluationProgramsOf`'s `recordEvaluations`, a reply or a decline per call) and a person's
 * value through its own person's-value write (`evaluate`, `personValueOf`'s `recordValue` over the
 * suite's scorer), each grading and settling the attempt's sitting in the strata after it: the
 * attempt is graded in the transaction of the write after which nothing of it waits, and by no
 * earlier one, since grading's guard negates the same relations the table reads
 * (`PendingApplication`, `AwaitingHumanEvaluation`).
 *
 * The table ({@link expectedOf}) states, for each case, what QTI 3.0.1 and the owner's rules make
 * of its facts:
 *
 * - **Status** (Results Reporting, Table 2.7.7): `pendingResponseProcessing` until response
 *   processing ran, else `final`: the essay declares nothing external-scored.
 * - **Waiting** (ASI Table 5.37; review M6, route 1): an answered essay's unevaluated draws wait for
 *   their evaluation until response processing has run; its rubric group whose every draw declined
 *   waits for a person's value; a NULL response asks nothing; a processed attempt, history among
 *   them, waits for nothing.
 * - **Operands** (`rubric-score`'s contract): each draw of an answered essay, with its response, its
 *   rubric group, the grader version in force and MAXSCORE's default (ASI Table 5.42); its literal
 *   draw.
 * - **Grading**: by the write after which nothing of the attempt waits, in its own transaction.
 * - **Values in force and credit**: response processing's SCORE and MAXSCORE, and the owner's credit
 *   of SCORE over MAXSCORE (proposal 2026-11-18, Decision 3).
 * - **Bounds**: a reply or a person's value past the application's maximum is refused at its write,
 *   never clamped.
 *
 * And a templated item's take (`take`, `takeValuesOf`), held to its own table
 * ({@link takeExpectedOf}): a fresh child's session of the item under each of a set of seeds, taken
 * as every take takes one, records exactly what template processing set (QTI 3.0.1 §2.2.1; ASI
 * `qti-set-template-value`, `qti-set-correct-response`, `qti-set-default-value`), each value by the
 * rule that set it, and nothing declared: T at the machine's own run of the session's template
 * processing (`templateProcessingOf` over `takeArgumentsOf`, read before the take, as the take
 * reads it), RESPONSE's correct response T, RESPONSE's default T where T is past 5, and FEEDBACK's
 * default NULL where T is even, a header with no value row.
 *
 * And an item session's attempts, each graded as the write that records it grades it, held to a
 * table of QTI 3.0.1's outcome rule ({@link drawExpectedOf}; info §2.2.2.3): "For Adaptive Items
 * the outcome variables retain the values that were assigned to them during the previous invocation
 * of response processing", and a non-adaptive item's start again at their defaults. The item is a
 * drawing the child makes on paper and checks against a model the item reveals once its end-attempt
 * button says it is drawn (CONTENT-FRESH's "draw" items), in the package twice, adaptive and not.
 *
 * And a test's responses (`enterTest`, `saveTestItem`, `suspendTest`, `endTest`, the test runtime's
 * own programs, over a sitting written as host rows), held to their table
 * ({@link responseExpectedOf}): a save lies inside a candidate session, so one before the sitting's
 * first, after its suspension or after its end is refused by "Inside a candidate session" (QTI
 * 3.0.1 §2.2.1); and a save in a timed one arrives, by the database's stamp, within its time and
 * the in-flight grace past it, so one arriving past the grace is refused by "Response in time",
 * unless the test allows late submission (Table 7.40.3, `allow-late-submission`), whatever the
 * browser's reading of when it was given says. Every program reads back its sitting's standing,
 * which the table holds after each move. And the latest save admitted is what the end submits: a
 * save superseding an in-time one 1.5 s past the deadline is submitted, and one 11 s past it is
 * refused, so the in-time one is ({@link supersedeExpectedOf}). And a candidate session is charged
 * up to its last sign of presence (its start, a beacon, a presentation, a response), never a closed
 * tab's time: a pause, which carries a beacon, to the pause, a session suspended after a closed tab
 * to its last beacon, even across its deadline, and one whose last sign is past its deadline is
 * refused its suspension ({@link presenceExpectedOf}).
 *
 * And a test's item-session controls (`presentItem`, `saveTestItem`, `answerTestItem`, and
 * `finishTest`, the end with its finish), held to their table ({@link controlsExpectedOf}):
 * validate-responses and max-attempts 0 are delivered on an individual part's item ref alone ("only
 * applicable when the item is in a qti-test-part with individual submission mode", Table 7.19.7),
 * never on a simultaneous part's ref or a part's own control; a validated member refuses its
 * candidate's invalid answer, and nothing else is held to it (no other member's answer, no save, no
 * presentation, not the end, §2.2.4); an unlimited member takes an attempt after each (Table
 * 7.19.1); and the end submits, unvalidated, every presented member whose attempt is in progress,
 * and none never presented (Tables 7.19.6, 5.115).
 */
import { factsDecoder, Sha256 } from "@bjornpagen/grizzle";
import type { BrokenLaws } from "@bjornpagen/grizzle";
import { Db, DbLayer, LiveSource, served } from "@bjornpagen/grizzle/runtime";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import type { Gen } from "@bjornpagen/testing/gen";
import { boolean, element, int, map, oneOf, option } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, layer } from "@effect/vitest";
import { loginConnection } from "@qti-pie/pantry/db/connection.ts";
import { importRowsOf } from "@qti-pie/pantry/import/program.ts";
import { readPackage } from "@qti-pie/pantry/import/read.ts";
import {
  Array as Arr,
  Clock,
  Config,
  Context,
  Duration,
  Effect,
  FileSystem,
  Formatter,
  Layer,
  Option,
  Order,
  Ref,
  Result,
  Schema,
} from "effect";
import { DeclineReason } from "#ledger/evaluations.ts";
import { operatorTagPrefix } from "#ledger/registry/operators.ts";
import { responseParamsOf } from "#ledger/served-values.ts";
import type { ResultSuite } from "#ledger/test/result-level.ts";
import { inFlightGraceMicros } from "#ledger/delivery.ts";
import { grader, ResultLevel, rubricUse } from "#ledger/test/result-level.ts";

/**
 * The run's migrations folder, where `grizzle generate` wrote the suite's served login; none
 * outside the runner.
 */
const migrations = Effect.runSync(Config.option(Config.String("QTI_PIE_RESULT_MIGRATIONS")));

const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

const rubricScore = "tag:superbuilders.school,2026:qti/custom-operator/rubric-score";

const PACKAGE = "ledger-result-proof";

const ESSAY = "items/essay.xml";

const TAKE = "items/take.xml";

const OPERATORS = "items/operators.xml";

const SHORT = "items/short.xml";

const OTHER = "items/other.xml";

const UNTIMED_TEST = "untimed.xml";

const TIMED_TEST = "timed.xml";

const LATE_TEST = "late.xml";

/**
 * The extended-text items under a word minimum, each its own document: the validated, unlimited
 * member's, the unvalidated member's and the validated member's of one attempt.
 */
const ESSAY_MIN = "items/essay-min.xml";

const MEMBER_MIN = "items/member-min.xml";

const DRAFT_MIN = "items/draft-min.xml";

/**
 * The test of item-session controls: one individual, nonlinear part, its members
 * {@link MEMBER_REF}, {@link ESSAY_REF}, {@link DRAFT_REF} and {@link SAVED}.
 */
const CONTROLS_TEST = "controls.xml";

/**
 * Tests whose item-session controls this runtime does not deliver: validate-responses and
 * max-attempts 0 on a simultaneous part's item ref, and validate-responses on an individual part's
 * own control.
 */
const SIMULTANEOUS_VALIDATED_TEST = "simultaneous-validated.xml";

const SIMULTANEOUS_UNLIMITED_TEST = "simultaneous-unlimited.xml";

const PART_VALIDATED_TEST = "part-validated.xml";

/**
 * The item ref a test names its first member by, the one its start presents, and that item's own
 * identifier: QTI holds a ref's identifier to its item's (information model §4.1.1, pantry's "Item
 * ref identifier").
 */
const MEMBER = "member";

/**
 * The item ref a test names its second member by, and that item's own identifier, which no case
 * presents: an individual part's end attempts only the members presented, so a save of it after
 * the end reaches the laws, where a save of a member the end closed finds no open item session and
 * writes nothing.
 */
const SAVED = "saved";

/**
 * The item ref of the controls test's first member, the one its start presents, under no control of
 * its own, and that item's own identifier.
 */
const MEMBER_REF = "member-min";

/**
 * The item ref of the controls test's essay, `max-attempts` 0 and `validate-responses` true on its
 * own item-session control, and that item's own identifier.
 */
const ESSAY_REF = "essay-min";

/**
 * The item ref of the controls test's draft, `validate-responses` true on its own item-session
 * control under QTI's default `max-attempts`, 1, and that item's own identifier.
 */
const DRAFT_REF = "draft-min";

/**
 * The draw item's document, by whether it is adaptive.
 *
 * @param adaptive - Whether the item is adaptive.
 * @returns Its path in the package.
 */
const drawPathOf = (adaptive: boolean) => (adaptive ? "items/draw-adaptive.xml" : "items/draw.xml");

/**
 * The application's draws of the essay, each its own `rubric-score` operator.
 */
const essayDraws = 2;

/**
 * The essay's MAXSCORE default, its draws' `maximum` operand.
 */
const essayMaximum = 2;

/**
 * The essay's rubric group: the `id` of its scorer rubric block, which both draws name.
 */
const RUBRIC = "RUBRIC";

const draw = (n: number) =>
  `<qti-set-outcome-value identifier="DRAW_${String(n)}"><qti-custom-operator class="rubric-score" definition="${rubricScore}"><qti-variable identifier="RESPONSE"/><qti-base-value base-type="identifier">${RUBRIC}</qti-base-value><qti-default identifier="MAXSCORE"/><qti-base-value base-type="integer">${String(n)}</qti-base-value></qti-custom-operator></qti-set-outcome-value>`;

/**
 * The essay: an extended-text response scored by two draws of `rubric-score`, SCORE the better
 * reply.
 */
const essayXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="essay" title="essay" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>${String(essayMaximum)}</qti-value></qti-default-value></qti-outcome-declaration><qti-outcome-declaration identifier="DRAW_1" cardinality="record" view="author"/><qti-outcome-declaration identifier="DRAW_2" cardinality="record" view="author"/><qti-item-body><qti-rubric-block use="${rubricUse}" view="scorer" id="${RUBRIC}"><qti-content-body><p>Award 2 for a force named with its direction.</p></qti-content-body></qti-rubric-block><qti-extended-text-interaction response-identifier="RESPONSE"/></qti-item-body><qti-response-processing>${draw(1)}${draw(2)}<qti-set-outcome-value identifier="SCORE"><qti-max><qti-multiple><qti-field-value field-identifier="score"><qti-variable identifier="DRAW_1"/></qti-field-value><qti-field-value field-identifier="score"><qti-variable identifier="DRAW_2"/></qti-field-value></qti-multiple></qti-max></qti-set-outcome-value></qti-response-processing>
</qti-assessment-item>`;

/**
 * The templated item: a template variable T drawn from 2 to 9, which its template processing makes
 * RESPONSE's correct response, and RESPONSE's default where T is past 5; where T is even it sets
 * FEEDBACK's default to NULL. RESPONSE's declared default (5) and correct response (1), and
 * FEEDBACK's declared default, are what a take never records.
 */
const takeXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="take" title="take" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="integer"><qti-default-value><qti-value>5</qti-value></qti-default-value><qti-correct-response><qti-value>1</qti-value></qti-correct-response></qti-response-declaration><qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier"><qti-default-value><qti-value>none</qti-value></qti-default-value></qti-outcome-declaration><qti-template-declaration identifier="T" cardinality="single" base-type="integer"><qti-default-value><qti-value>1</qti-value></qti-default-value></qti-template-declaration><qti-template-processing><qti-set-template-value identifier="T"><qti-random-integer min="2" max="9"/></qti-set-template-value><qti-set-correct-response identifier="RESPONSE"><qti-variable identifier="T"/></qti-set-correct-response><qti-template-condition><qti-template-if><qti-gt><qti-variable identifier="T"/><qti-base-value base-type="integer">5</qti-base-value></qti-gt><qti-set-default-value identifier="RESPONSE"><qti-variable identifier="T"/></qti-set-default-value></qti-template-if></qti-template-condition><qti-template-condition><qti-template-if><qti-match><qti-integer-modulus><qti-variable identifier="T"/><qti-base-value base-type="integer">2</qti-base-value></qti-integer-modulus><qti-base-value base-type="integer">0</qti-base-value></qti-match><qti-set-default-value identifier="FEEDBACK"><qti-null/></qti-set-default-value></qti-template-if></qti-template-condition></qti-template-processing><qti-item-body><p><qti-printed-variable identifier="T"/></p><p><qti-text-entry-interaction response-identifier="RESPONSE"/></p></qti-item-body>
</qti-assessment-item>`;

/**
 * The keys the operators item scores against: an expression math-canonical reads, and a phrase
 * phrase-distance measures from.
 */
const MATH_KEY = "2x+3";

const PHRASE_KEY = "mouse";

/**
 * A `qti-custom-operator` of a registered general-purpose class (`#ledger/registry/operators.ts`)
 * over its operands' markup.
 *
 * @param operatorClass - The class.
 * @param operands - The operands' markup.
 * @returns The operator's markup.
 */
const customOperator = (operatorClass: string, operands: string) =>
  `<qti-custom-operator class="${operatorClass}" definition="${operatorTagPrefix}${operatorClass}">${operands}</qti-custom-operator>`;

/**
 * Response processing's rule that adds one point to SCORE where a condition holds.
 *
 * @param condition - The condition's markup.
 * @returns The rule's markup.
 */
const pointWhen = (condition: string) =>
  `<qti-response-condition><qti-response-if>${condition}<qti-set-outcome-value identifier="SCORE"><qti-sum><qti-variable identifier="SCORE"/><qti-base-value base-type="float">1</qti-base-value></qti-sum></qti-set-outcome-value></qti-response-if></qti-response-condition>`;

/**
 * The operators item: two text entries, each scored by a registered operator inline in its
 * response processing, a point each, of MAXSCORE 2. MATH scores where its math-canonical form
 * matches the key's; PHRASE where phrase-distance puts it at 0 from the key, which reads the
 * registry's tables in each of its roles (`RegistryBinding`), so an irregular plural counts only
 * where the table bound in its `plurals` role, the seed's `irregular-plurals`, maps it to the key's
 * word.
 */
const operatorsXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="operators" title="operators" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="MATH" cardinality="single" base-type="string"/><qti-response-declaration identifier="PHRASE" cardinality="single" base-type="string"/><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>2</qti-value></qti-default-value></qti-outcome-declaration><qti-item-body><p><qti-text-entry-interaction response-identifier="MATH"/></p><p><qti-text-entry-interaction response-identifier="PHRASE"/></p></qti-item-body><qti-response-processing>${pointWhen(`<qti-match>${customOperator("math-canonical", '<qti-variable identifier="MATH"/><qti-base-value base-type="boolean">false</qti-base-value>')}${customOperator("math-canonical", `<qti-base-value base-type="string">${MATH_KEY}</qti-base-value><qti-base-value base-type="boolean">false</qti-base-value>`)}</qti-match>`)}${pointWhen(`<qti-lte>${customOperator("phrase-distance", `<qti-variable identifier="PHRASE"/><qti-multiple><qti-base-value base-type="string">${PHRASE_KEY}</qti-base-value></qti-multiple><qti-multiple><qti-base-value base-type="string">the</qti-base-value></qti-multiple>`)}<qti-base-value base-type="integer">0</qti-base-value></qti-lte>`)}</qti-response-processing>
</qti-assessment-item>`;

/**
 * The model's points, which the checklist names: the correct response, every one ticked.
 */
const drawPoints = ["c1", "c2", "c3", "c4"] as const;

/**
 * The draw item's MAXSCORE default.
 */
const drawMaximum = 1;

/**
 * A `qti-set-outcome-value` of an outcome to an expression.
 */
const setOutcome = (identifier: string, expression: string) =>
  `<qti-set-outcome-value identifier="${identifier}">${expression}</qti-set-outcome-value>`;

/**
 * A `qti-base-value` of a base type.
 */
const baseValue = (base: string, value: string) =>
  `<qti-base-value base-type="${base}">${value}</qti-base-value>`;

/**
 * A `qti-variable` reading a variable.
 */
const variableOf = (identifier: string) => `<qti-variable identifier="${identifier}"/>`;

/**
 * The draw item: DRAWN, an end-attempt button the child presses once the drawing is on paper, and
 * RESPONSE, the checklist of the model's points (and one point the model lacks). Response
 * processing reveals the model (FEEDBACK gains `model`, HINT goes NULL, `incomplete`) until it is
 * revealed; once it is, SCORE is 1 iff every point is ticked, HINT_NULL says whether HINT is NULL,
 * and the item is `completed`. HINT's default is `start`, so a run that started HINT at its default
 * would see it non-NULL.
 *
 * @param adaptive - Whether the item is adaptive.
 * @returns Its document.
 */
const drawXmlOf = (adaptive: boolean) => {
  const score = `<qti-response-condition><qti-response-if><qti-match>${variableOf("RESPONSE")}<qti-correct identifier="RESPONSE"/></qti-match>${setOutcome("SCORE", baseValue("float", "1"))}</qti-response-if><qti-response-else>${setOutcome("SCORE", baseValue("float", "0"))}</qti-response-else></qti-response-condition>`;
  const revealed = `<qti-member>${baseValue("identifier", "model")}${variableOf("FEEDBACK")}</qti-member>${score}${setOutcome("HINT_NULL", `<qti-is-null>${variableOf("HINT")}</qti-is-null>`)}${setOutcome("completionStatus", baseValue("identifier", "completed"))}`;
  const reveal = `${setOutcome("FEEDBACK", `<qti-multiple>${variableOf("FEEDBACK")}${baseValue("identifier", "model")}</qti-multiple>`)}${setOutcome("HINT", "<qti-null/>")}${setOutcome("completionStatus", baseValue("identifier", "incomplete"))}`;
  const choices = [...drawPoints, "d1"]
    .map((point) => `<qti-simple-choice identifier="${point}">${point}</qti-simple-choice>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="${adaptive ? "draw-adaptive" : "draw"}" title="draw" adaptive="${String(adaptive)}" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="identifier"><qti-correct-response>${drawPoints.map((point) => `<qti-value>${point}</qti-value>`).join("")}</qti-correct-response></qti-response-declaration><qti-response-declaration identifier="DRAWN" cardinality="single" base-type="boolean"/><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>${String(drawMaximum)}</qti-value></qti-default-value></qti-outcome-declaration><qti-outcome-declaration identifier="FEEDBACK" cardinality="multiple" base-type="identifier"/><qti-outcome-declaration identifier="HINT" cardinality="single" base-type="identifier"><qti-default-value><qti-value>start</qti-value></qti-default-value></qti-outcome-declaration><qti-outcome-declaration identifier="HINT_NULL" cardinality="single" base-type="boolean"/><qti-item-body><p>Draw the particles on paper. <qti-end-attempt-interaction response-identifier="DRAWN" title="I have drawn it"/></p><qti-choice-interaction response-identifier="RESPONSE" max-choices="0">${choices}</qti-choice-interaction></qti-item-body><qti-response-processing><qti-response-condition><qti-response-if>${revealed}</qti-response-if><qti-response-else>${reveal}</qti-response-else></qti-response-condition></qti-response-processing>
</qti-assessment-item>`;
};

/**
 * A text entry, which a save records and nothing here grades: each test's members.
 *
 * @param identifier - The item's identifier.
 */
const textEntryXml = (identifier: string) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="${identifier}" title="${identifier}" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/><qti-item-body><p><qti-text-entry-interaction response-identifier="RESPONSE"/></p></qti-item-body>
</qti-assessment-item>`;

/**
 * The word minimum every extended-text item of the controls test states as its `pattern-mask`, an
 * XML Schema regular expression, which matches the whole string: three words or more.
 */
const wordMinimum = String.raw`\s*\S+(\s+\S+){2,}\s*`;

/**
 * An extended-text item under {@link wordMinimum}, which nothing processes.
 *
 * @param identifier - The item's identifier.
 */
const minimumXml = (identifier: string) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="${identifier}" title="${identifier}" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/><qti-item-body><qti-extended-text-interaction response-identifier="RESPONSE" pattern-mask="${wordMinimum}"/></qti-item-body>
</qti-assessment-item>`;

/**
 * A test of one part, its item refs' markup `refs`, under the part's own item-session control
 * `control`, none where it is empty.
 *
 * @param identifier - The test's identifier.
 * @param submission - The part's submission mode.
 * @param control - The part's own `qti-item-session-control`, or nothing.
 * @param refs - The section's item refs.
 */
const controlledTestXml = (
  identifier: string,
  submission: "individual" | "simultaneous",
  control: string,
  refs: string,
) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="${identifier}" title="${identifier}"><qti-test-part identifier="part" navigation-mode="nonlinear" submission-mode="${submission}">${control}<qti-assessment-section identifier="section" title="section" visible="true">${refs}</qti-assessment-section></qti-test-part>
</qti-assessment-test>`;

/**
 * An item ref, under its own item-session control `control`, none where it is empty.
 *
 * @param identifier - The ref's identifier.
 * @param href - The item's document.
 * @param control - Its own `qti-item-session-control`, or nothing.
 */
const refXml = (identifier: string, href: string, control: string) =>
  control === ""
    ? `<qti-assessment-item-ref identifier="${identifier}" href="${href}"/>`
    : `<qti-assessment-item-ref identifier="${identifier}" href="${href}">${control}</qti-assessment-item-ref>`;

/**
 * The controls test's members, in order, each with its document and its own control.
 */
const controlsMembers = [
  { control: "", path: MEMBER_MIN, ref: MEMBER_REF },
  {
    control: '<qti-item-session-control max-attempts="0" validate-responses="true"/>',
    path: ESSAY_MIN,
    ref: ESSAY_REF,
  },
  {
    control: '<qti-item-session-control validate-responses="true"/>',
    path: DRAFT_MIN,
    ref: DRAFT_REF,
  },
  { control: "", path: OTHER, ref: SAVED },
] as const;

/**
 * The tests of item-session controls, each with its documents: the controls test, which this
 * runtime delivers, and three it does not.
 */
const controlTests = [
  [
    CONTROLS_TEST,
    controlledTestXml(
      "controls",
      "individual",
      "",
      controlsMembers.map(({ control, path, ref }) => refXml(ref, path, control)).join(""),
    ),
  ],
  [
    SIMULTANEOUS_VALIDATED_TEST,
    controlledTestXml(
      "simultaneous-validated",
      "simultaneous",
      "",
      refXml(ESSAY_REF, ESSAY_MIN, '<qti-item-session-control validate-responses="true"/>'),
    ),
  ],
  [
    SIMULTANEOUS_UNLIMITED_TEST,
    controlledTestXml(
      "simultaneous-unlimited",
      "simultaneous",
      "",
      refXml(ESSAY_REF, ESSAY_MIN, '<qti-item-session-control max-attempts="0"/>'),
    ),
  ],
  [
    PART_VALIDATED_TEST,
    controlledTestXml(
      "part-validated",
      "individual",
      '<qti-item-session-control validate-responses="true"/>',
      refXml(ESSAY_REF, ESSAY_MIN, ""),
    ),
  ],
] as const;

/**
 * A test of one individual, nonlinear part of two text entries, {@link MEMBER} and {@link SAVED},
 * under the time limits `limits` states, none where it is empty.
 *
 * @param identifier - The test's identifier.
 * @param limits - Its `qti-time-limits`, or nothing.
 */
const testXml = (identifier: string, limits: string) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="${identifier}" title="${identifier}">${limits}<qti-test-part identifier="part" navigation-mode="nonlinear" submission-mode="individual"><qti-assessment-section identifier="section" title="section" visible="true"><qti-assessment-item-ref identifier="${MEMBER}" href="${SHORT}"/><qti-assessment-item-ref identifier="${SAVED}" href="${OTHER}"/></qti-assessment-section></qti-test-part>
</qti-assessment-test>`;

/**
 * The tests: untimed; timed, an hour, allowing no late submission (Table 7.40.3: "Default =
 * false"); and timed, allowing it.
 */
const tests = [
  [UNTIMED_TEST, testXml("untimed", "")],
  [TIMED_TEST, testXml("timed", '<qti-time-limits max-time="3600"/>')],
  [LATE_TEST, testXml("late", '<qti-time-limits max-time="3600" allow-late-submission="true"/>')],
] as const;

const testResource = (path: string, dependencies: readonly string[]) =>
  `<resource identifier="${path.replace(".xml", "")}" type="imsqti_test_xmlv3p0" href="${path}"><file href="${path}"/>${dependencies.map((dependency) => `<dependency identifierref="${dependency}"/>`).join("")}</resource>`;

/**
 * An item's resource, its identifier its document's name.
 *
 * @param path - The item's document.
 */
const itemResource = (path: string) =>
  `<resource identifier="${path.replace("items/", "").replace(".xml", "")}" type="imsqti_item_xmlv3p0" href="${path}"><file href="${path}"/></resource>`;

const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="${PACKAGE}"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="essay" type="imsqti_item_xmlv3p0" href="${ESSAY}"><file href="${ESSAY}"/></resource><resource identifier="take" type="imsqti_item_xmlv3p0" href="${TAKE}"><file href="${TAKE}"/></resource><resource identifier="operators" type="imsqti_item_xmlv3p0" href="${OPERATORS}"><file href="${OPERATORS}"/></resource><resource identifier="draw-adaptive" type="imsqti_item_xmlv3p0" href="${drawPathOf(true)}"><file href="${drawPathOf(true)}"/></resource><resource identifier="draw" type="imsqti_item_xmlv3p0" href="${drawPathOf(false)}"><file href="${drawPathOf(false)}"/></resource><resource identifier="short" type="imsqti_item_xmlv3p0" href="${SHORT}"><file href="${SHORT}"/></resource><resource identifier="other" type="imsqti_item_xmlv3p0" href="${OTHER}"><file href="${OTHER}"/></resource>${[ESSAY_MIN, MEMBER_MIN, DRAFT_MIN].map(itemResource).join("")}${tests.map(([path]) => testResource(path, ["short", "other"])).join("")}${controlTests.map(([path]) => testResource(path, ["essay-min", "member-min", "draft-min", "other"])).join("")}</resources></manifest>`;

/**
 * The response every answered case gives.
 */
const RESPONSE = "A push.";

/**
 * An application's evaluation as a case gives it, the ledger's two arms: a reply of a score, or a
 * decline.
 */
type Evaluation =
  | Readonly<{ result: "replied"; score: number }>
  | Readonly<{ result: "declined"; reason: (typeof DeclineReason.handles)[number] }>;

/**
 * The score a replied draw gives within the maximum, and the value a person gives once every draw
 * declined.
 */
const replyScore = 1;

const personScore = 1.5;

/**
 * A case: a fresh child's attempt of the essay, its response or NULL, its draws' evaluations in the
 * item's order, a person's value, and whether it was imported processed (history), with no
 * evaluation.
 */
type Case = Readonly<{
  name: string;
  family: Family;
  answered: boolean;
  response: string;
  evaluations: readonly Option.Option<Evaluation>[];
  person: Option.Option<number>;
  history: boolean;
}>;

type Family = "essay" | "history" | "bounds" | "empty";

/**
 * The empty essays an evaluator declines `unanswered`: whitespace alone, and markup alone, which
 * the item's own empty-essay rule makes NULL (`when-present(normalize-space(markup-text(RESPONSE)),
 * RESPONSE)`).
 */
const emptyResponses = ["  \n\t ", "<p> </p>"] as const;

/**
 * A reply within the maximum, or a decline for each reason.
 */
const evaluation: Gen<Evaluation> = oneOf([
  (): Evaluation => ({ result: "replied", score: replyScore }),
  map(element(DeclineReason.handles), (reason): Evaluation => ({ reason, result: "declined" })),
]);

/**
 * The essay family: a response or NULL, each draw unevaluated or evaluated (replied, or declined
 * for each reason), and a person's value or none.
 */
const essaySpace: Gen<Case> = (source) => {
  const answered = source.draw(boolean);
  const evaluations = answered
    ? Array.from({ length: essayDraws }, () => source.draw(option(evaluation)))
    : [];
  const person = answered && source.draw(boolean) ? Option.some(personScore) : Option.none();

  return {
    answered,
    evaluations,
    family: "essay",
    history: false,
    name: `essay ${String(answered)} ${Formatter.format(evaluations)} ${Formatter.format(person)}`,
    person,
    response: RESPONSE,
  };
};

/**
 * The history family: an essay imported processed, with its outcomes and no evaluation, its
 * response given or not.
 */
const historySpace: Gen<Case> = (source) => {
  const answered = source.draw(boolean);

  return {
    answered,
    evaluations: [],
    family: "history",
    history: true,
    name: `history ${String(answered)}`,
    person: Option.none(),
    response: RESPONSE,
  };
};

/**
 * The bounds family: an answered essay whose first draw replies, or whose draws both decline and a
 * person gives a value, of the maximum or half a point past it.
 */
const boundsSpace: Gen<Case> = (source) => {
  const score = essayMaximum + source.draw(int(0, 1)) / 2;
  const byPerson = source.draw(boolean);
  const declined: Option.Option<Evaluation> = Option.some({
    reason: "refused",
    result: "declined",
  });

  return {
    answered: true,
    evaluations: byPerson
      ? [declined, declined]
      : [Option.some({ result: "replied", score }), declined],
    family: "bounds",
    history: false,
    name: `bounds ${byPerson ? "person" : "reply"} ${String(score)}`,
    person: byPerson ? Option.some(score) : Option.none(),
    response: RESPONSE,
  };
};

/**
 * The empty family: an essay of whitespace or markup alone, its draws both declined `unanswered`,
 * which the commit accepts and routes to no person, so the second decline grades the attempt on its
 * NULL; or, the control, both declined `refused`, a person's to score as any refusal; and a
 * person's value or none.
 */
const emptySpace: Gen<Case> = (source) => {
  const response = source.draw(element(emptyResponses));
  const reason = source.draw(element(["unanswered", "refused"] as const));
  const person = source.draw(boolean) ? Option.some(personScore) : Option.none();
  const declined: Option.Option<Evaluation> = Option.some({ reason, result: "declined" });

  return {
    answered: true,
    evaluations: [declined, declined],
    family: "empty",
    history: false,
    name: `empty ${JSON.stringify(response)} ${reason} ${Formatter.format(person)}`,
    person,
    response,
  };
};

/**
 * Every family's cases.
 */
const space: Gen<Case> = oneOf([essaySpace, historySpace, boundsSpace, emptySpace]);

/**
 * One write of a case after its attempt is recorded: a draw's evaluation, by the draw's place in
 * the item's order, or a person's value of the essay's rubric group.
 */
type Step =
  | Readonly<{ kind: "evaluation"; draw: number; evaluation: Evaluation }>
  | Readonly<{ kind: "person"; score: number }>;

/**
 * A case's writes after its attempt, in order: each evaluated draw's evaluation, then the person's
 * value.
 */
const stepsOf = (c: Case): readonly Step[] => [
  ...c.evaluations.flatMap((e, place) =>
    Option.toArray(e).map((evaluated): Step => ({
      draw: place,
      evaluation: evaluated,
      kind: "evaluation",
    })),
  ),
  ...Option.toArray(c.person).map((score): Step => ({ kind: "person", score })),
];

/**
 * What the ledger holds of an attempt after some of its case's writes: each draw's evaluation so
 * far, and the person's value, where one landed.
 */
type Held = Readonly<{
  case: Case;
  evaluated: readonly Option.Option<Evaluation>[];
  person: Option.Option<number>;
}>;

/**
 * Whether the attempt's rubric group is a person's to score: every draw evaluated and declined, and
 * one of them for a reason a person scores, `refused` or `unreadable`. A group whose every draw
 * declined `unanswered` (an empty essay) is no one's: it holds none and never waits, as a NULL
 * response's. Such a group waits (`AwaitingHumanEvaluation`) until a person gives a value.
 */
const allDeclined = (held: Held) =>
  held.evaluated.every((e) => Option.exists(e, ({ result }) => result === "declined")) &&
  held.evaluated.some((e) =>
    Option.exists(
      e,
      (evaluated) => evaluated.result === "declined" && evaluated.reason !== "unanswered",
    ),
  );

/**
 * Whether the attempt's response processing waits: an answered essay's request made and an
 * application unevaluated, or every draw declined and no person's value; a processed attempt,
 * history's among them, waits for nothing.
 */
const waitsOf = (held: Held) =>
  !held.case.history &&
  held.case.answered &&
  (held.evaluated.some(Option.isNone) || (allDeclined(held) && Option.isNone(held.person)));

/**
 * The rubric groups of the attempt waiting for a person's value.
 */
const awaitingOf = (held: Held): readonly string[] =>
  waitsOf(held) && allDeclined(held) && Option.isNone(held.person) ? [RUBRIC] : [];

/**
 * SCORE as grading sets it once nothing waits, `qti-max` over `qti-multiple` of the draws' scores,
 * NULL members ignored: the better reply, else the person's value every declined draw of the
 * group takes, else NULL, an unanswered essay's (rubric-score's contract: "NULL iff the response is
 * NULL (no request is made)"); history's 2, as imported.
 */
const scoreOf = (held: Held): Option.Option<number> => {
  if (held.case.history) {
    return Option.some(essayMaximum);
  }

  const replies = held.evaluated.flatMap((e) =>
    Option.toArray(e).flatMap((evaluated) =>
      evaluated.result === "replied" ? [evaluated.score] : [],
    ),
  );

  return replies.length === 0 ? held.person : Option.some(Math.max(...replies));
};

/**
 * The owner's credit kind of a SCORE over the essay's maximum: none at 0, full at the maximum,
 * partial between.
 *
 * @param score The SCORE.
 * @returns Its credit's kind.
 */
const creditKindOf = (score: number): "full" | "none" | "partial" => {
  if (score <= 0) {
    return "none";
  }

  return score >= essayMaximum ? "full" : "partial";
};

/**
 * What the oracle expects of one write: refused by a bound law, or held, `accepted` or, for a
 * person's value of a group that does not wait, `unchanged`, with the attempt's status after it and
 * its read-back of what still waits for a person.
 */
type StepExpected =
  | Readonly<{ kind: "refused"; law: "Reply_within_maximum" | "Human_within_maximum" }>
  | Readonly<{
      kind: "held";
      outcome: "accepted" | "unchanged";
      status: "pendingResponseProcessing" | "final";
      awaiting: readonly string[];
    }>;

/**
 * What the oracle expects of a case's attempt once every write held: its status, what it waits for,
 * its operands, its values in force and its credit.
 */
type FinalExpected = Readonly<{
  status: "pendingResponseProcessing" | "final";
  applications: number;
  awaiting: readonly string[];
  operands: readonly (readonly [
    response: string,
    rubric: string,
    grader: string,
    maximum: number,
  ])[];
  floats: readonly (readonly [string, number])[];
  credit: readonly (readonly [
    earned: number,
    maximum: number,
    kind: "none" | "partial" | "full",
  ])[];
}>;

/**
 * What the oracle expects of a case: each write's, up to the first one a law refuses, and the
 * attempt's once every write held.
 */
type Expected = Readonly<{
  steps: readonly StepExpected[];
  final: Option.Option<FinalExpected>;
}>;

/**
 * The status of an attempt after some of its writes.
 */
const statusOf = (held: Held) => (waitsOf(held) ? "pendingResponseProcessing" : "final");

/**
 * The oracle: what QTI 3.0.1 and the owner's rules make of a case's facts, the rule table written
 * apart from the relations it checks.
 *
 * - **Bounds** (`rubric-score`: "`score` is in [0, maximum]. A reply outside that range is a decline,
 *   never clamped"): a reply or a person's value past MAXSCORE's default is refused at its write,
 *   its law named, and nothing after it is written.
 * - **Waiting** (ASI Table 5.37; review M6, route 1): an answered, unprocessed essay waits on each
 *   unevaluated draw, and on its rubric group when every draw declined and no person's value
 *   stands. A person's value answers only a group that waits: of any other it records nothing.
 * - **Grading** (Bjorn, 2026-11-18: "grading MUST be done in the same database transaction"): an
 *   attempt is processed by the write after which nothing of it waits, in that write's own
 *   transaction, and by no earlier one.
 * - **Operands**: each draw of an answered essay, its response, rubric group, grader in force and
 *   maximum.
 * - **Values and credit**: grading's SCORE and MAXSCORE, SCORE NULL for an unanswered essay; the
 *   credit none at 0, full at the maximum, partial between, and none where SCORE is NULL.
 */
const expectedOf = (c: Case): Expected => {
  const steps: StepExpected[] = [];
  const evaluated: Option.Option<Evaluation>[] = Array.from({ length: essayDraws }, () =>
    Option.none(),
  );
  let person = Option.none<number>();
  const heldNow = (): Held => ({ case: c, evaluated, person });

  for (const step of stepsOf(c)) {
    if (step.kind === "evaluation") {
      if (step.evaluation.result === "replied" && step.evaluation.score > essayMaximum) {
        steps.push({ kind: "refused", law: "Reply_within_maximum" });

        return { final: Option.none(), steps };
      }

      evaluated[step.draw] = Option.some(step.evaluation);
      steps.push({
        awaiting: awaitingOf(heldNow()),
        kind: "held",
        outcome: "accepted",
        status: statusOf(heldNow()),
      });
    } else if (awaitingOf(heldNow()).length > 0) {
      if (step.score > essayMaximum) {
        steps.push({ kind: "refused", law: "Human_within_maximum" });

        return { final: Option.none(), steps };
      }

      person = Option.some(step.score);
      steps.push({ awaiting: [], kind: "held", outcome: "accepted", status: statusOf(heldNow()) });
    } else {
      steps.push({
        awaiting: awaitingOf(heldNow()),
        kind: "held",
        outcome: "unchanged",
        status: statusOf(heldNow()),
      });
    }
  }

  const held = heldNow();
  const unprocessed = waitsOf(held);
  const score = scoreOf(held);

  return {
    final: Option.some({
      applications: c.answered && unprocessed ? evaluated.filter(Option.isNone).length : 0,
      awaiting: awaitingOf(held),
      credit: unprocessed
        ? []
        : Option.toArray(score).map((value) => [value, essayMaximum, creditKindOf(value)] as const),
      floats: unprocessed
        ? []
        : [
            ["MAXSCORE", essayMaximum],
            ...Option.toArray(score).map((value) => ["SCORE", value] as const),
          ],
      operands: c.answered
        ? Array.from(
            { length: essayDraws },
            () => [c.response, RUBRIC, grader.version, essayMaximum] as const,
          )
        : [],
      status: unprocessed ? "pendingResponseProcessing" : "final",
    }),
    steps,
  };
};

/**
 * The situations the space must reach, each a branch of the rule the oracle states.
 */
const situations = [
  "family:essay",
  "family:history",
  "family:bounds",
  "family:empty",
  "status:pendingResponseProcessing",
  "status:final",
  "waiting for an evaluation",
  "waiting for a person",
  "pending after an evaluation",
  "graded by its last evaluation",
  "graded by a person's value",
  "a value of a group that does not wait",
  "credit:none",
  "credit:partial",
  "credit:full",
  "credit:absent",
  "refused:Reply_within_maximum",
  "refused:Human_within_maximum",
  "held at the maximum",
  "an empty essay declined unanswered, graded on its NULL with no one waiting",
  "an empty essay declined refused, a person's",
] as const;

type Situation = (typeof situations)[number];

/**
 * The situations a case reaches, read off what the oracle expects of it.
 */
const situationsOf = (c: Case, expected: Expected): readonly Situation[] => {
  const steps = stepsOf(c);
  const reached = expected.steps.flatMap((want, k): readonly Situation[] => {
    if (want.kind === "refused") {
      return [`refused:${want.law}`];
    }

    const step = steps[k];
    const graded = want.status === "final";
    if (step?.kind === "person") {
      if (want.outcome === "unchanged") {
        return ["a value of a group that does not wait"];
      }

      return graded ? ["graded by a person's value"] : [];
    }

    return [graded ? "graded by its last evaluation" : "pending after an evaluation"];
  });

  return [
    `family:${c.family}`,
    ...reached,
    ...Option.toArray(expected.final).flatMap((want): readonly Situation[] => [
      `status:${want.status}`,
      ...(want.applications > 0 ? ["waiting for an evaluation" as const] : []),
      ...(want.awaiting.length > 0 ? ["waiting for a person" as const] : []),
      ...want.credit.map((credit): Situation => `credit:${credit[2]}`),
      ...(want.status === "final" && want.credit.length === 0 ? ["credit:absent" as const] : []),
      ...(c.family === "bounds" ? ["held at the maximum" as const] : []),
      ...(c.family === "empty"
        ? [
            want.status === "final" && want.awaiting.length === 0 && want.floats.length === 1
              ? ("an empty essay declined unanswered, graded on its NULL with no one waiting" as const)
              : ("an empty essay declined refused, a person's" as const),
          ]
        : []),
    ]),
  ];
};

/**
 * How an attempt ends: by DRAWN with nothing ticked, or by submitting the checklist with every
 * point ticked or with all but the last two.
 */
const endings = ["drawn", "right", "wrong"] as const;

type Ending = (typeof endings)[number];

/**
 * An attempt's responses: whether DRAWN ended it, and the points it ticked.
 */
type DrawResponses = Readonly<{ drawn: boolean; ticked: readonly string[] }>;

/**
 * The responses an attempt ending so gives: DRAWN, true only where the button ended it, and the
 * ticked points.
 */
const responsesOf = (ending: Ending): DrawResponses => ({
  drawn: ending === "drawn",
  ticked: { drawn: [], right: drawPoints, wrong: drawPoints.slice(0, 2) }[ending],
});

/**
 * The attempts of one draw case's item session.
 */
const drawAttempts = 3;

/**
 * A draw case: a fresh child's item session of the draw item, adaptive or not, and how each of its
 * attempts ends, each graded before the next is recorded.
 */
type DrawCase = Readonly<{ name: string; adaptive: boolean; endings: readonly Ending[] }>;

/**
 * The adaptive family: either item, and every way of ending each of its attempts.
 */
const drawSpace: Gen<DrawCase> = (source) => {
  const adaptive = source.draw(boolean);
  const ended = Array.from({ length: drawAttempts }, () => source.draw(element(endings)));

  return {
    adaptive,
    endings: ended,
    name: `draw ${adaptive ? "adaptive" : "non-adaptive"} ${ended.join(" ")}`,
  };
};

/**
 * The draw item's outcomes after an attempt, each the list of its values (NULL none), and the
 * completion status its response processing left.
 */
type DrawOutcomes = Readonly<{
  feedback: readonly string[];
  hint: readonly string[];
  hintNull: readonly boolean[];
  maxScore: readonly number[];
  score: readonly number[];
  status: "completed" | "incomplete";
}>;

/**
 * The outcomes an attempt's response processing starts from where it starts at their defaults (ASI
 * Table 4.5): SCORE 0, a numeric outcome with no default; MAXSCORE and HINT their defaults;
 * FEEDBACK and HINT_NULL NULL.
 */
const drawDefaults = {
  feedback: [],
  hint: ["start"],
  hintNull: [],
  maxScore: [drawMaximum],
  score: [0],
} as const satisfies Omit<DrawOutcomes, "status">;

/**
 * The oracle of the adaptive family: each attempt's outcomes after its response processing. An
 * attempt starts from its outcomes' defaults where it is the session's first or its item is not
 * adaptive, and from the outcomes the previous attempt left, a NULL one NULL, where the item is
 * adaptive (info §2.2.2.3). Then until FEEDBACK holds `model`, the model is revealed: FEEDBACK
 * gains it, HINT goes NULL, `incomplete`; once it does, SCORE is 1 iff every point is ticked,
 * HINT_NULL says whether HINT is NULL, `completed`.
 */
const drawExpectedOf = (c: DrawCase): readonly DrawOutcomes[] => {
  const after: DrawOutcomes[] = [];
  for (const ending of c.endings) {
    const start: Omit<DrawOutcomes, "status"> = c.adaptive
      ? Option.getOrElse(Arr.last(after), () => drawDefaults)
      : drawDefaults;
    after.push(
      start.feedback.includes("model")
        ? {
            ...start,
            hintNull: [start.hint.length === 0],
            score: [ending === "right" ? 1 : 0],
            status: "completed",
          }
        : { ...start, feedback: [...start.feedback, "model"], hint: [], status: "incomplete" },
    );
  }

  return after;
};

/**
 * The situations the adaptive family must reach, each a branch of the rule its oracle states.
 */
const drawSituations = [
  "adaptive",
  "non-adaptive",
  "revealed on the first attempt",
  "completed after the reveal",
  "full credit after the reveal",
  "no credit after the reveal",
  "a NULL outcome with a default kept NULL",
  "kept after a completed attempt",
  "a non-adaptive item starts over",
] as const;

type DrawSituation = (typeof drawSituations)[number];

/**
 * The situations a draw case reaches, read off what its oracle expects.
 */
const drawSituationsOf = (
  c: DrawCase,
  expected: readonly DrawOutcomes[],
): readonly DrawSituation[] => [
  c.adaptive ? "adaptive" : "non-adaptive",
  ...expected.flatMap((want, k): readonly DrawSituation[] => {
    const previous = expected[k - 1];
    if (previous === undefined) {
      return ["revealed on the first attempt"];
    }

    if (want.status === "incomplete") {
      return ["a non-adaptive item starts over"];
    }

    return [
      "completed after the reveal",
      want.score[0] === 1 ? "full credit after the reveal" : "no credit after the reveal",
      ...(want.hintNull[0] === true ? ["a NULL outcome with a default kept NULL" as const] : []),
      ...(previous.status === "completed" ? ["kept after a completed attempt" as const] : []),
    ];
  }),
];

/**
 * The suite's login as `grizzle generate` compiled it.
 */
type Logins = Readonly<{
  suite: ReturnType<typeof served<typeof ResultSuite>>;
}>;

class SuiteLogin extends Context.Service<SuiteLogin, Logins>()(
  "@qti-pie/ledger/results.db.test/SuiteLogin",
) {}

/**
 * One session: the suite's calls run one after another.
 */
const onePool = { idleTimeoutMs: Duration.toMillis(Duration.minutes(1)), max: 1, min: 0 } as const;

/**
 * The suite's services: its served login, its database layer on the run's database, and Node's
 * platform.
 */
const SuiteLayer = Layer.unwrap(
  Effect.gen(function* suiteLayer() {
    const fs = yield* FileSystem.FileSystem;
    const folder = Option.getOrThrow(migrations);
    const text = yield* fs.readFileString(`${folder}/qti/served/result_suite.json`);
    const file = yield* Schema.decodeEffect(Schema.fromJsonString(Schema.Unknown))(text);
    const suite = served<typeof ResultSuite>(file, "result_suite");
    const connectionOf = yield* loginConnection;
    const connection = connectionOf(suite);

    return Layer.mergeAll(
      Layer.succeed(SuiteLogin, { suite }),
      DbLayer.make({ ...connection, login: suite, pool: onePool }).pipe(
        Layer.provide(LiveSource.layer({ ...connection, login: suite })),
      ),
    );
  }),
).pipe(Layer.provideMerge(NodeServices.layer));

/**
 * The one package, the essay, the templated item, the operators item, the draw item adaptive and
 * not, the tests of the text entries, and the tests of item-session controls with their items,
 * published through the suite's login.
 */
const published = Effect.gen(function* publish() {
  const { suite } = yield* SuiteLogin;
  const fs = yield* FileSystem.FileSystem;
  const dir = yield* fs.makeTempDirectoryScoped({ prefix: `${PACKAGE}-` });
  yield* fs.makeDirectory(`${dir}/items`, { recursive: true });
  yield* fs.writeFileString(`${dir}/imsmanifest.xml`, manifest);
  yield* fs.writeFileString(`${dir}/${ESSAY}`, essayXml);
  yield* fs.writeFileString(`${dir}/${TAKE}`, takeXml);
  yield* fs.writeFileString(`${dir}/${OPERATORS}`, operatorsXml);
  for (const adaptive of [true, false]) {
    yield* fs.writeFileString(`${dir}/${drawPathOf(adaptive)}`, drawXmlOf(adaptive));
  }
  yield* fs.writeFileString(`${dir}/${SHORT}`, textEntryXml(MEMBER));
  yield* fs.writeFileString(`${dir}/${OTHER}`, textEntryXml(SAVED));
  for (const { path, ref } of controlsMembers.filter((member) => member.path !== OTHER)) {
    yield* fs.writeFileString(`${dir}/${path}`, minimumXml(ref));
  }
  for (const [path, xml] of [...tests, ...controlTests]) {
    yield* fs.writeFileString(`${dir}/${path}`, xml);
  }

  const read = yield* readPackage(dir, PACKAGE);
  const rows = yield* importRowsOf(read);
  const db = yield* Db.open(suite.roles.result_runner, {});
  const outcome = yield* db.workload.publish.once({ facts: { insert: rows.insert }, params: {} });
  assert.include(["accepted", "unchanged"], outcome.kind, `${PACKAGE}: published`);
});

/**
 * Grizzle's decoder of a write's facts, the one admission of the host rows a case writes: a row it
 * refuses is the suite's defect.
 */
const decoder = Result.getOrThrow(factsDecoder(ResultLevel));

/**
 * A relation's host rows as the write takes them, as grizzle's decoder admits them.
 */
const rowsOf = <K extends Parameters<typeof decoder.decode>[0]>(
  relation: K,
  rows: readonly unknown[],
) => Result.getOrThrow(decoder.decode(relation, rows));

/**
 * A seed an item session draws under (`SessionSeed`), named by a text: a seed is a SHA-256, 32 raw
 * bytes, as the take computes one, so the suite's seeds are the digests of their names' UTF-8
 * bytes.
 *
 * @param name - The seed's name.
 */
const seedOf = (name: string) => Sha256.ofBytes(new TextEncoder().encode(name));

/**
 * The seed every case's item session draws under, which nothing the table reads depends on.
 */
const SEED = seedOf("result-suite");

/**
 * The scorer of a person's value, the suite's own.
 */
const SCORER = "user_ledgerscorer";

/**
 * A request's SHA-256, one per evaluation of a case: the digest of the operator's place, 32 raw
 * bytes.
 */
const requestOf = (operator: bigint) => Sha256.ofBytes(new TextEncoder().encode(String(operator)));

/**
 * Every law a refusal names, in whichever list its arm carries it: a refusal by the suite's own
 * levels' laws (`every`, `first`, `some`) names them in `laws`, and one by a level above in
 * `above`, beside its own levels' where it judged them broken (`own` every), each arm narrowed by
 * its kind. Which arm a qti-pie law refuses in under the suite's composition is grizzle's to state,
 * so the table finds its law in any of them.
 *
 * @param refused The refusal.
 * @returns The laws it names.
 */
const refusedLawsOf = (refused: BrokenLaws) => {
  if (refused.kind !== "above") {
    return refused.laws;
  }

  if (refused.own === "every") {
    return [...refused.above, ...refused.laws];
  }

  return refused.above;
};

/**
 * One run of a case: a fresh child's item session of the essay and its attempt with its response,
 * history's with its imported grading, graded as the write that records it grades it (`grade`);
 * then each of its writes in turn, a draw's evaluation through the ledger's evaluation writes or a
 * person's value, each grading the attempt in its own transaction, held to the table after each:
 * its outcome, what it reads back as still waiting, and the attempt's status, which only the write
 * after which nothing waits makes final; then every reading held to the table.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdCase = (c: Case, child: string, note: (situation: Situation) => void) =>
  Effect.gen(function* hold() {
    const expected = expectedOf(c);
    for (const situation of situationsOf(c, expected)) {
      note(situation);
    }

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const key = { child, n: 0n, package: PACKAGE, path: ESSAY };
    const stage = 1n;
    yield* db.workload.facts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", [key]),
          ItemSession: rowsOf("ItemSession", [{ child, package: PACKAGE, path: ESSAY, stage }]),
          ProcessedAttempt: rowsOf(
            "ProcessedAttempt",
            c.history ? [{ ...key, completionStatus: "completed" }] : [],
          ),
          ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...key, kind: "attempt" }]),
          SessionSeed: rowsOf("SessionSeed", [
            { child, package: PACKAGE, path: ESSAY, seed: SEED, stage },
          ]),
          SnapshotMultipleIdentifier: rowsOf("SnapshotMultipleIdentifier", []),
          SnapshotSingleBoolean: rowsOf("SnapshotSingleBoolean", []),
          SnapshotSingleFloat: rowsOf(
            "SnapshotSingleFloat",
            c.history
              ? [
                  { ...key, value: essayMaximum, variable: "SCORE" },
                  { ...key, value: essayMaximum, variable: "MAXSCORE" },
                ]
              : [],
          ),
          SnapshotSingleString: rowsOf(
            "SnapshotSingleString",
            c.answered ? [{ ...key, value: c.response, variable: "RESPONSE" }] : [],
          ),
        },
      },
      params: {},
    });
    if (!c.history) {
      yield* db.workload.grade.once({ facts: {}, params: key });
    }

    const atChild = { facts: {}, params: { child } };
    const recordedRows = yield* db.workload.statusesOf.once(atChild);
    const statusesBefore = Arr.fromIterable(recordedRows);
    const { at } = Option.getOrThrow(Arr.head(statusesBefore));
    const waitingRows = yield* db.workload.applicationsOf.once(atChild);
    const maximaRows = yield* db.workload.maximaOf.once(atChild);
    const maxima = Arr.fromIterable(maximaRows);
    const operators = Arr.sort(Arr.dedupe(maxima.map((row) => row.operator)), Order.BigInt);
    assert.strictEqual(
      Arr.fromIterable(waitingRows).length,
      c.answered && !c.history ? essayDraws : 0,
      `${c.name}: PendingApplication once the attempt is recorded, none of history's`,
    );

    const attempt = { at, child, n: 0n, package: PACKAGE, path: ESSAY };
    const steps = stepsOf(c);
    for (const [k, want] of expected.steps.entries()) {
      const step = Option.getOrThrow(Arr.get(steps, k));
      const label = `${c.name}, write ${String(k + 1)}`;
      const call =
        step.kind === "person"
          ? db.workload.evaluate.once({
              facts: {},
              params: { ...attempt, rubric: RUBRIC, score: step.score, scorer: SCORER },
            })
          : (() => {
              const operator = Option.getOrThrow(Arr.get(operators, step.draw));
              const application = {
                ...attempt,
                grader: grader.version,
                operator,
                request: requestOf(operator),
              };

              return db.workload.recordEvaluations.once({
                facts: {},
                params:
                  step.evaluation.result === "replied"
                    ? {
                        declines: [],
                        feedbacks: [],
                        replies: [{ ...application, score: step.evaluation.score }],
                      }
                    : {
                        declines: [{ ...application, reason: step.evaluation.reason }],
                        feedbacks: [],
                        replies: [],
                      },
              });
            })();
      const written = yield* Effect.result(call);
      if (want.kind === "refused") {
        assert.isTrue(
          Result.isFailure(written) &&
            written.failure.kind === "refused" &&
            Formatter.format(refusedLawsOf(written.failure.refused)).includes(want.law),
          `${label}: refused by ${want.law}, got ${Formatter.format(written)}`,
        );

        return;
      }

      const outcome = Result.getOrThrow(written);
      const statusRows = yield* db.workload.statusesOf.once(atChild);
      assert.deepStrictEqual<unknown>(
        {
          awaiting: outcome.reads.awaiting.map((row) => row.rubric),
          outcome: outcome.kind,
          status: Arr.fromIterable(statusRows).map((row) => row.status),
        },
        { awaiting: want.awaiting, outcome: want.outcome, status: [want.status] },
        `${label}: its outcome, its read-back of what still waits, and the attempt's status after it`,
      );
    }

    const want = Option.getOrThrow(expected.final);
    const statusRows = yield* db.workload.statusesOf.once(atChild);
    const applicationRows = yield* db.workload.applicationsOf.once(atChild);
    const awaitingRows = yield* db.workload.awaitingOf.once(atChild);
    const operandRows = yield* db.workload.operandsOf.once(atChild);
    const floatRows = yield* db.workload.floatsOf.once(atChild);
    const creditRows = yield* db.workload.creditsOf.once(atChild);
    const drawRows = yield* db.workload.drawsOf.once({ facts: {}, params: { package: PACKAGE } });
    const maximumOf = (operator: bigint) =>
      maxima.filter((row) => row.operator === operator).map((row) => row.maximum);
    assert.deepStrictEqual<unknown>(
      Arr.fromIterable(statusRows).map((row) => [row.status, row.stage]),
      [[want.status, stage]],
      `${c.name}: ItemSessionStatus, one row, with its stage`,
    );
    assert.strictEqual(
      Arr.fromIterable(applicationRows).length,
      want.applications,
      `${c.name}: PendingApplication`,
    );
    assert.deepStrictEqual<unknown>(
      Arr.fromIterable(awaitingRows).map((row) => row.rubric),
      want.awaiting,
      `${c.name}: AwaitingHumanEvaluation`,
    );
    assert.deepStrictEqual<unknown>(
      Arr.fromIterable(operandRows).map((row) => [
        row.response,
        row.rubric,
        row.grader,
        ...maximumOf(row.operator),
      ]),
      want.operands,
      `${c.name}: ApplicationOperands and ApplicationMaximum`,
    );
    assert.deepStrictEqual<unknown>(
      Arr.sort(
        Arr.fromIterable(drawRows).map((row) => row.draw),
        Order.String,
      ),
      ["1", "2"],
      `${c.name}: ApplicationDraw, the essay's two literal draws`,
    );
    assert.deepStrictEqual<unknown>(
      Arr.sort(
        Arr.fromIterable(floatRows).map((row) => [row.variable, row.value] as const),
        Order.mapInput(Order.String, (row: readonly [string, number]) => row[0]),
      ),
      want.floats,
      `${c.name}: floats in force`,
    );
    assert.deepStrictEqual<unknown>(
      Arr.fromIterable(creditRows).map((row) => [row.earned, row.maximum, row.kind]),
      want.credit,
      `${c.name}: AttemptCredit`,
    );
  });

/**
 * A take's case: a fresh child's session of the templated item under one seed, named (`seedOf`),
 * whose T is whatever the machine's template processing draws under it.
 */
type TakeCase = Readonly<{ name: string; seed: string }>;

/**
 * The seeds a take draws under (`SessionSeed`), twenty-four, enough that T falls on both sides of 5
 * and of evenness: the first and the twenty-three after it.
 */
const takeSeeds = [
  "take-0",
  ...Array.from({ length: 23 }, (_, k) => `take-${String(k + 1)}`),
] as const;

/**
 * Every take's case: one per seed.
 */
const takeSpace: Gen<TakeCase> = map(element(takeSeeds), (seed): TakeCase => ({
  name: `take ${seed}`,
  seed,
}));

/**
 * What a take stores of the templated item for a drawn T, each list ordered by kind and variable:
 * the headers (kind, variable), and the value rows by base type (kind, variable, value).
 */
type TakeExpected = Readonly<{
  headers: readonly (readonly [string, string])[];
  identifiers: readonly (readonly [string, string, string])[];
  integers: readonly (readonly [string, string, bigint])[];
}>;

/**
 * The take's table: exactly what the templated item's template processing set for a drawn T (QTI
 * 3.0.1 §2.2.1), and nothing declared. T, by `qti-set-template-value`; RESPONSE's correct response
 * T, by `qti-set-correct-response`; RESPONSE's default T where T is past 5, by
 * `qti-set-default-value`, and none where it is not, its declared 5 no row; FEEDBACK's default NULL
 * where T is even, a header with no value row, and nothing where it is odd. No identifier row: the
 * one identifier template processing sets, it sets to NULL.
 *
 * @param t - The T the machine's run draws.
 */
const takeExpectedOf = (t: bigint): TakeExpected => {
  const setsDefault = t > 5n;
  const nulls = t % 2n === 0n;

  return {
    headers: [
      ["correct", "RESPONSE"],
      ...(nulls ? [["default", "FEEDBACK"] as const] : []),
      ...(setsDefault ? [["default", "RESPONSE"] as const] : []),
      ["template", "T"],
    ],
    identifiers: [],
    integers: [
      ["correct", "RESPONSE", t],
      ...(setsDefault ? [["default", "RESPONSE", t] as const] : []),
      ["template", "T", t],
    ],
  };
};

/**
 * The situations the take's space must reach, each a branch of its template processing.
 */
const takeSituations = [
  "T past 5: RESPONSE's default set to T",
  "T at most 5: RESPONSE's default not set, nothing stored",
  "T even: FEEDBACK's default set to NULL, a header with no value",
  "T odd: FEEDBACK's default not set, nothing stored",
] as const;

type TakeSituation = (typeof takeSituations)[number];

/**
 * A stored set's rows, ordered by kind and variable as the table states them.
 *
 * @param rows - A read's rows.
 */
const byVariable = <R extends Readonly<{ kind: string; variable: string }>>(rows: Iterable<R>) =>
  Arr.sort(
    Arr.fromIterable(rows),
    Order.mapInput(Order.String, (row: R) => `${row.kind} ${row.variable}`),
  );

/**
 * One take: a fresh child's session of the templated item under its seed, as host rows; the
 * machine's own run of its sitting's template processing, read before the take, as the take reads
 * it, its T one value from 2 to 9; then the take (`take`, `takeValuesOf` over the session's
 * sitting), and what it stored, every header and value row, held to the table for that T.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdTake = (c: TakeCase, child: string, note: (situation: TakeSituation) => void) =>
  Effect.gen(function* hold() {
    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const stage = 1n;
    yield* db.workload.facts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", []),
          ItemSession: rowsOf("ItemSession", [{ child, package: PACKAGE, path: TAKE, stage }]),
          ProcessedAttempt: rowsOf("ProcessedAttempt", []),
          ResponseSnapshot: rowsOf("ResponseSnapshot", []),
          SessionSeed: rowsOf("SessionSeed", [
            { child, package: PACKAGE, path: TAKE, seed: seedOf(c.seed), stage },
          ]),
          SnapshotMultipleIdentifier: rowsOf("SnapshotMultipleIdentifier", []),
          SnapshotSingleBoolean: rowsOf("SnapshotSingleBoolean", []),
          SnapshotSingleFloat: rowsOf("SnapshotSingleFloat", []),
          SnapshotSingleString: rowsOf("SnapshotSingleString", []),
        },
      },
      params: {},
    });

    const atChild = { facts: {}, params: { child } };
    const atSession = { facts: {}, params: { child, n: 0n, package: PACKAGE, path: TAKE } };
    const runRows = yield* db.workload.takeRunIntegersOf.once({
      facts: {},
      params: { sittings: [{ child, stage }] },
    });
    const drawn = Arr.fromIterable(runRows)
      .filter((row) => row.holds === "value" && row.identifier === "T")
      .map((row) => row.value);
    assert.strictEqual(drawn.length, 1, `${c.name}: the machine's run ends with one T`);

    const t = Option.getOrThrow(Arr.head(drawn));
    assert.isTrue(t >= 2n && t <= 9n, `${c.name}: T from 2 to 9, got ${String(t)}`);
    note(
      t > 5n
        ? "T past 5: RESPONSE's default set to T"
        : "T at most 5: RESPONSE's default not set, nothing stored",
    );
    note(
      t % 2n === 0n
        ? "T even: FEEDBACK's default set to NULL, a header with no value"
        : "T odd: FEEDBACK's default not set, nothing stored",
    );

    const taken = yield* db.workload.take.once(atSession);
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the take writes what its run set`);

    const want = takeExpectedOf(t);
    const headerRows = yield* db.workload.takenHeadersOf.once(atChild);
    const integerRows = yield* db.workload.takenIntegersOf.once(atChild);
    const identifierRows = yield* db.workload.takenIdentifiersOf.once(atChild);
    assert.deepStrictEqual<unknown>(
      {
        headers: byVariable(headerRows).map((row) => [row.kind, row.variable]),
        identifiers: byVariable(identifierRows).map((row) => [row.kind, row.variable, row.value]),
        integers: byVariable(integerRows).map((row) => [row.kind, row.variable, row.value]),
      },
      want,
      `${c.name}: the take stores exactly what template processing set, T the run's ${String(t)}`,
    );
  });

/**
 * An operators case: a fresh child's attempt of the operators item, MATH the key or a wrong
 * expression, PHRASE the key, an irregular plural of it, or a wrong word.
 */
type OperatorsCase = Readonly<{
  math: "key" | "wrong";
  name: string;
  phrase: "key" | "plural" | "wrong";
}>;

/**
 * What each case answers.
 */
const mathAnswers = { key: MATH_KEY, wrong: "2x+4" } as const;

const phraseAnswers = { key: PHRASE_KEY, plural: "mice", wrong: "cheese" } as const;

/**
 * Every operators case: each MATH answer with each PHRASE answer.
 */
const operatorsSpace: Gen<OperatorsCase> = (source) => {
  const math = source.draw(element(["key", "wrong"] as const));
  const phrase = source.draw(element(["key", "plural", "wrong"] as const));

  return { math, name: `operators ${math} ${phrase}`, phrase };
};

/**
 * The operators table: a point for MATH's key, whose math-canonical form is the key's, and none
 * for a wrong expression; a point for PHRASE's key, at distance 0, and for "mice", which the
 * seed's `irregular-plurals` table, bound in phrase-distance's `plurals` role, maps to "mouse"
 * (`noun_singular`), so at distance 0 too; none for a
 * wrong word, at no distance (phrase-distance's NULL); SCORE their sum, of MAXSCORE 2, and the
 * owner's credit of it.
 *
 * @param c - The case.
 * @returns SCORE and MAXSCORE in force, by name, the attempt's credit, and its kind.
 */
const operatorsExpectedOf = (c: OperatorsCase) => {
  const score = (c.math === "key" ? 1 : 0) + (c.phrase === "wrong" ? 0 : 1);
  const kind = (["none", "partial", "full"] as const)[score] ?? "none";

  return {
    credit: [[score, 2, kind]],
    floats: [
      ["MAXSCORE", 2],
      ["SCORE", score],
    ],
    kind,
  } as const;
};

/**
 * The situations the operators space must reach.
 */
const operatorsSituations = [
  "math-canonical: the key",
  "math-canonical: a wrong expression",
  "phrase-distance: the key",
  "phrase-distance: an irregular plural the irregular-plurals table maps to the key",
  "phrase-distance: a wrong word",
  "credit:full",
  "credit:partial",
  "credit:none",
] as const;

type OperatorsSituation = (typeof operatorsSituations)[number];

/**
 * The situation each PHRASE answer reaches.
 */
const phraseSituations = {
  key: "phrase-distance: the key",
  plural: "phrase-distance: an irregular plural the irregular-plurals table maps to the key",
  wrong: "phrase-distance: a wrong word",
} as const satisfies { readonly [P in OperatorsCase["phrase"]]: OperatorsSituation };

/**
 * One operators case: a fresh child's session of the operators item and its attempt with its two
 * responses, as host rows, then graded as the write that records an attempt grades it (`grade`,
 * gradeAttemptOf over the session's sitting, the machine given the registry's tables and the
 * attempt's replies as every application's grading gives them); then its status, SCORE and
 * MAXSCORE in force, and its credit, held to the table.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdOperators = (
  c: OperatorsCase,
  child: string,
  note: (situation: OperatorsSituation) => void,
) =>
  Effect.gen(function* hold() {
    const want = operatorsExpectedOf(c);
    note(c.math === "key" ? "math-canonical: the key" : "math-canonical: a wrong expression");
    note(phraseSituations[c.phrase]);
    note(`credit:${want.kind}`);

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const key = { child, n: 0n, package: PACKAGE, path: OPERATORS };
    const stage = 1n;
    yield* db.workload.facts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", [key]),
          ItemSession: rowsOf("ItemSession", [{ child, package: PACKAGE, path: OPERATORS, stage }]),
          ProcessedAttempt: rowsOf("ProcessedAttempt", []),
          ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...key, kind: "attempt" }]),
          SessionSeed: rowsOf("SessionSeed", [
            { child, package: PACKAGE, path: OPERATORS, seed: SEED, stage },
          ]),
          SnapshotMultipleIdentifier: rowsOf("SnapshotMultipleIdentifier", []),
          SnapshotSingleBoolean: rowsOf("SnapshotSingleBoolean", []),
          SnapshotSingleFloat: rowsOf("SnapshotSingleFloat", []),
          SnapshotSingleString: rowsOf("SnapshotSingleString", [
            { ...key, value: mathAnswers[c.math], variable: "MATH" },
            { ...key, value: phraseAnswers[c.phrase], variable: "PHRASE" },
          ]),
        },
      },
      params: {},
    });
    yield* db.workload.grade.once({ facts: {}, params: key });

    const atChild = { facts: {}, params: { child } };
    const statusRows = yield* db.workload.statusesOf.once(atChild);
    const floatRows = yield* db.workload.floatsOf.once(atChild);
    const creditRows = yield* db.workload.creditsOf.once(atChild);
    assert.deepStrictEqual<unknown>(
      {
        credit: Arr.fromIterable(creditRows).map((row) => [row.earned, row.maximum, row.kind]),
        floats: Arr.sort(
          Arr.fromIterable(floatRows).map((row) => [row.variable, row.value] as const),
          Order.mapInput(Order.String, (row: readonly [string, number]) => row[0]),
        ),
        status: Arr.fromIterable(statusRows).map((row) => row.status),
      },
      { credit: want.credit, floats: want.floats, status: ["final"] },
      `${c.name}: graded through the ledger's own grading, its operators given the registry's tables`,
    );
  });

/**
 * A variable's values at an attempt, as a snapshot read gives them: none where it is NULL.
 *
 * @param rows - The read's rows.
 * @param at - The attempt's instant.
 * @param variable - The variable.
 * @returns Its values.
 */
const valuesAt = <A>(
  rows: readonly Readonly<{ at: bigint; variable: string; value: A }>[],
  at: bigint,
  variable: string,
) => rows.filter((row) => row.at === at && row.variable === variable).map((row) => row.value);

/**
 * One run of a draw case: a fresh child's item session of the draw item, and each of its attempts
 * recorded as host rows with its responses, graded as the write that records it grades it
 * (`grade`), and every attempt so far held to the table after it: its completion status, and each
 * outcome as its response processing wrote it beside its responses.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdDrawCase = (c: DrawCase, child: string, note: (situation: DrawSituation) => void) =>
  Effect.gen(function* hold() {
    const expected = drawExpectedOf(c);
    for (const situation of drawSituationsOf(c, expected)) {
      note(situation);
    }

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const path = drawPathOf(c.adaptive);
    const key = { child, n: 0n, package: PACKAGE, path };
    const stage = 1n;
    const atChild = { facts: {}, params: { child } };
    for (const [k, ending] of c.endings.entries()) {
      const { drawn, ticked } = responsesOf(ending);
      const first = k === 0;
      yield* db.workload.facts.once({
        facts: {
          insert: {
            Attempt: rowsOf("Attempt", [key]),
            ItemSession: rowsOf(
              "ItemSession",
              first ? [{ child, package: PACKAGE, path, stage }] : [],
            ),
            ProcessedAttempt: rowsOf("ProcessedAttempt", []),
            ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...key, kind: "attempt" }]),
            SessionSeed: rowsOf(
              "SessionSeed",
              first ? [{ child, package: PACKAGE, path, seed: SEED, stage }] : [],
            ),
            SnapshotMultipleIdentifier: rowsOf(
              "SnapshotMultipleIdentifier",
              ticked.map((value) => ({ ...key, count: 1n, value, variable: "RESPONSE" })),
            ),
            SnapshotSingleBoolean: rowsOf("SnapshotSingleBoolean", [
              { ...key, value: drawn, variable: "DRAWN" },
            ]),
            SnapshotSingleFloat: rowsOf("SnapshotSingleFloat", []),
            SnapshotSingleString: rowsOf("SnapshotSingleString", []),
          },
        },
        params: {},
      });
      yield* db.workload.grade.once({ facts: {}, params: key });

      const completions = Arr.sort(
        Arr.fromIterable(yield* db.workload.completionsOf.once(atChild)),
        Order.mapInput(Order.BigInt, (row: { readonly at: bigint }) => row.at),
      );
      const floats = Arr.fromIterable(yield* db.workload.snapshotFloatsOf.once(atChild));
      const identifiers = Arr.fromIterable(yield* db.workload.snapshotIdentifiersOf.once(atChild));
      const bags = Arr.fromIterable(yield* db.workload.snapshotIdentifierBagsOf.once(atChild));
      const booleans = Arr.fromIterable(yield* db.workload.snapshotBooleansOf.once(atChild));
      assert.deepStrictEqual<unknown>(
        completions.map(({ at, completionStatus }) => ({
          feedback: Arr.sort(
            bags
              .filter((row) => row.at === at && row.variable === "FEEDBACK")
              .flatMap((row) => Arr.replicate(row.value, Number(row.count))),
            Order.String,
          ),
          hint: valuesAt(identifiers, at, "HINT"),
          hintNull: valuesAt(booleans, at, "HINT_NULL"),
          maxScore: valuesAt(floats, at, "MAXSCORE"),
          score: valuesAt(floats, at, "SCORE"),
          status: completionStatus,
        })),
        expected.slice(0, k + 1),
        `${c.name}, after attempt ${String(k + 1)}: every attempt's completion status and outcomes`,
      );
    }
  });

/**
 * When a response case's save is given: before the sitting's first candidate session, in its open
 * one, after its suspension, or after its end.
 */
type When = "unstarted" | "open" | "suspended" | "ended";

/**
 * A response case's timing: an untimed sitting; or a timed one, its save at its session's beginning
 * (in time), arriving just past a deadline at its beginning (in flight, within the grace), with a
 * browser's reading a microsecond past that deadline (which decides nothing), or arriving twice
 * the grace past a deadline before its beginning; or a microsecond past its deadline where the test
 * allows late submission.
 */
type Timing = "untimed" | "inTime" | "inFlight" | "givenLate" | "arrivedLate" | "lateAllowed";

type ResponseCase = Readonly<{ name: string; when: When; timing: Timing }>;

/**
 * Each timing's test, its first budget (none for an untimed sitting) and the save's `given`, from
 * its candidate session's beginning, all in microseconds.
 */
const timings = {
  arrivedLate: {
    given: -2n * inFlightGraceMicros,
    remaining: Option.some(-2n * inFlightGraceMicros),
    test: TIMED_TEST,
  },
  givenLate: { given: 1n, remaining: Option.some(0n), test: TIMED_TEST },
  inFlight: { given: 0n, remaining: Option.some(0n), test: TIMED_TEST },
  inTime: { given: 0n, remaining: Option.some(3_600_000_000n), test: TIMED_TEST },
  lateAllowed: { given: 1n, remaining: Option.some(0n), test: LATE_TEST },
  untimed: { given: 0n, remaining: Option.none<bigint>(), test: UNTIMED_TEST },
} as const satisfies Record<
  Timing,
  Readonly<{ given: bigint; remaining: Option.Option<bigint>; test: string }>
>;

/**
 * A save in the open candidate session, under the timing `timing`.
 *
 * @param timing - The case's timing.
 */
const openCase = (timing: Timing): ResponseCase => ({
  name: `a save ${timing}, in the open session`,
  timing,
  when: "open",
});

/**
 * An untimed sitting's save at the moment `when`, outside its open candidate session.
 *
 * @param when - When the save is given.
 */
const closedCase = (when: Exclude<When, "open">): ResponseCase => ({
  name: `an untimed sitting's save, ${when}`,
  timing: "untimed",
  when,
});

/**
 * Every response case: each timing of a save in the open candidate session, and an untimed
 * sitting's save before, between and after its candidate sessions.
 */
const responseCases = [
  openCase("untimed"),
  openCase("inTime"),
  openCase("inFlight"),
  openCase("givenLate"),
  openCase("arrivedLate"),
  openCase("lateAllowed"),
  closedCase("unstarted"),
  closedCase("suspended"),
  closedCase("ended"),
] as const;

const responseSpace: Gen<ResponseCase> = element(responseCases);

/**
 * What the table expects of a save: accepted, or refused by the law that names it.
 */
type ResponseExpected =
  | Readonly<{ kind: "accepted" }>
  | Readonly<{ kind: "refused"; law: "SessionSnapshot" | "Response_in_time" }>;

/**
 * The responses' table. A save outside the sitting's candidate sessions is refused by "Inside a
 * candidate session", whose target is `SessionSnapshot` (§2.2.1: "During each attempt the candidate
 * interacts with the item through one or more candidate sessions"), whatever its timing. In the
 * open one, a save arriving, by the database's stamp, past its timed session's deadline and the
 * in-flight grace is refused by "Response in time", unless the test allows late submission (Table
 * 7.40.3: "The allow-late-submission attribute regulates whether a candidate's response that is
 * beyond the max-time should still be accepted"); the browser's reading `given` decides nothing, so
 * a save it reads past the deadline that arrives within the grace is accepted. Every other save is
 * accepted.
 *
 * @param c - The case.
 */
const responseExpectedOf = (c: ResponseCase): ResponseExpected => {
  if (c.when !== "open") {
    return { kind: "refused", law: "SessionSnapshot" };
  }

  return c.timing === "arrivedLate"
    ? { kind: "refused", law: "Response_in_time" }
    : { kind: "accepted" };
};

/**
 * The situations the responses' space must reach.
 */
const responseSituations = [
  "accepted in the open session",
  "accepted past its deadline: late submission allowed",
  "accepted though the browser read it past its deadline: the database's stamp decides",
  "refused: Inside a candidate session",
  "refused: Response in time",
  "standing: open",
  "standing: suspended",
  "standing: ended",
  "an unchanged move reads back its standing",
] as const;

type ResponseSituation = (typeof responseSituations)[number];

/**
 * A program's standings, as its `standing` read-back gives them.
 *
 * @param reads - The program's read-backs.
 */
const standingsOf = (reads: Readonly<{ standing: Iterable<Readonly<{ standing: string }>> }>) =>
  Arr.fromIterable(reads.standing).map((row) => row.standing);

/**
 * One response case: a fresh child's sitting of the case's test, written as host rows as a take
 * writes it and, but for a save before its first candidate session, entered, a timed entry with the
 * case's first budget, then suspended, or ended as the case says, an attempt of {@link MEMBER}
 * before the end, which nothing grades, so the ended sitting waits on it and is not final; then a
 * save of {@link SAVED} with no value, its `given` the case's from the session's beginning, held to
 * the table, and every move's `standing` read-back to the sitting's standing after it.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdResponse = (
  c: ResponseCase,
  child: string,
  note: (situation: ResponseSituation) => void,
) =>
  Effect.gen(function* hold() {
    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const timing = timings[c.timing];
    const sitting = { child, stage: 1n };
    const members = [SHORT, OTHER] as const;
    const taken = yield* db.workload.sittingFacts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", []),
          ItemSession: rowsOf(
            "ItemSession",
            members.map((path) => ({ ...sitting, package: PACKAGE, path })),
          ),
          ResponseSnapshot: rowsOf("ResponseSnapshot", []),
          SessionSeed: rowsOf(
            "SessionSeed",
            members.map((path) => ({ ...sitting, package: PACKAGE, path, seed: SEED })),
          ),
          TestSession: rowsOf("TestSession", [{ ...sitting, package: PACKAGE, path: timing.test }]),
        },
      },
      params: {},
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as a take writes it`);

    const began =
      c.when === "unstarted"
        ? 0n
        : yield* Effect.gen(function* enter() {
            const entered = Option.isSome(timing.remaining)
              ? yield* db.workload.enterTimedTest.once({
                  facts: {},
                  params: { ...sitting, remaining: timing.remaining.value },
                })
              : yield* db.workload.enterTest.once({ facts: {}, params: sitting });
            assert.deepStrictEqual<unknown>(
              { kind: entered.kind, standing: standingsOf(entered.reads) },
              { kind: "accepted", standing: ["open"] },
              `${c.name}: the entry, the sitting open after it`,
            );
            note("standing: open");

            return Option.getOrThrow(Arr.head(Arr.fromIterable(entered.reads.entered))).at;
          });

    if (c.when === "suspended") {
      const suspended = yield* db.workload.suspendTest.once({ facts: {}, params: sitting });
      assert.deepStrictEqual<unknown>(
        { kind: suspended.kind, standing: standingsOf(suspended.reads) },
        { kind: "accepted", standing: ["suspended"] },
        `${c.name}: the suspension, the sitting suspended after it`,
      );
      note("standing: suspended");
    }

    if (c.when === "ended") {
      const attempt = { child, n: 0n, package: PACKAGE, path: SHORT };
      const attempted = yield* db.workload.sittingFacts.once({
        facts: {
          insert: {
            Attempt: rowsOf("Attempt", [attempt]),
            ItemSession: rowsOf("ItemSession", []),
            ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...attempt, kind: "attempt" }]),
            SessionSeed: rowsOf("SessionSeed", []),
            TestSession: rowsOf("TestSession", []),
          },
        },
        params: {},
      });
      assert.strictEqual(attempted.kind, "accepted", `${c.name}: the member's attempt`);

      const ended = yield* db.workload.endTest.once({ facts: {}, params: sitting });
      assert.deepStrictEqual<unknown>(
        { kind: ended.kind, standing: standingsOf(ended.reads) },
        { kind: "accepted", standing: ["ended"] },
        `${c.name}: the end, the sitting ended after it and waiting on its attempt`,
      );
      note("standing: ended");

      const again = yield* db.workload.suspendTest.once({ facts: {}, params: sitting });
      assert.deepStrictEqual<unknown>(
        { kind: again.kind, standing: standingsOf(again.reads) },
        { kind: "unchanged", standing: ["ended"] },
        `${c.name}: a suspension of the ended sitting writes nothing and reads back its standing`,
      );
      note("an unchanged move reads back its standing");
    }

    const values = yield* responseParamsOf({});
    const given = c.when === "unstarted" ? 1n : began + timing.given;
    const saved = yield* Effect.result(
      db.workload.saveTestItem.once({
        facts: {},
        params: { ...sitting, given, item: SAVED, ...values },
      }),
    );
    const want = responseExpectedOf(c);
    if (want.kind === "refused") {
      assert.isTrue(
        Result.isFailure(saved) &&
          saved.failure.kind === "refused" &&
          Formatter.format(refusedLawsOf(saved.failure.refused)).includes(want.law),
        `${c.name}: refused by ${want.law}, got ${Formatter.format(saved)}`,
      );
      note(
        want.law === "Response_in_time"
          ? "refused: Response in time"
          : "refused: Inside a candidate session",
      );

      return;
    }

    const outcome = Result.getOrThrow(saved);
    assert.deepStrictEqual<unknown>(
      { kind: outcome.kind, standing: standingsOf(outcome.reads) },
      { kind: "accepted", standing: ["open"] },
      `${c.name}: the save, the sitting still open after it`,
    );
    if (c.timing === "lateAllowed") {
      note("accepted past its deadline: late submission allowed");
    } else if (c.timing === "givenLate") {
      note("accepted though the browser read it past its deadline: the database's stamp decides");
    } else {
      note("accepted in the open session");
    }
  });

/**
 * A text a controls case gives: two words, short of {@link wordMinimum}, or five, within it.
 */
const controlTexts = { long: "A push moves the cart.", short: "A push." } as const;

type ControlText = keyof typeof controlTexts;

/**
 * An item ref of the controls test a case acts on: every member but {@link SAVED}, which no case
 * presents.
 */
type ControlRef = typeof MEMBER_REF | typeof ESSAY_REF | typeof DRAFT_REF;

/**
 * A move of a controls case in the sitting's open candidate session: a presentation of a member, a
 * save of a text, or an answer of one, each only of a member presented before it, as "In turn"
 * requires of an attempt.
 */
type ControlMove =
  | Readonly<{ kind: "present"; ref: ControlRef }>
  | Readonly<{ kind: "save" | "answer"; ref: ControlRef; text: ControlText }>;

type ControlsCase = Readonly<{ name: string; moves: readonly ControlMove[] }>;

const present = (ref: ControlRef): ControlMove => ({ kind: "present", ref });

const save = (ref: ControlRef, text: ControlText): ControlMove => ({ kind: "save", ref, text });

const answer = (ref: ControlRef, text: ControlText): ControlMove => ({ kind: "answer", ref, text });

/**
 * Every controls case: each moves through the controls test's open session, then ends it, the
 * start presenting {@link MEMBER_REF}.
 */
const controlsCases = [
  { moves: [], name: "the start alone" },
  {
    moves: [
      present(ESSAY_REF),
      answer(ESSAY_REF, "short"),
      answer(ESSAY_REF, "long"),
      answer(ESSAY_REF, "long"),
    ],
    name: "the essay answered short, then long twice",
  },
  {
    moves: [answer(MEMBER_REF, "short"), answer(MEMBER_REF, "long")],
    name: "the member answered short, then long",
  },
  {
    moves: [present(DRAFT_REF), save(DRAFT_REF, "short"), present(ESSAY_REF)],
    name: "the draft saved short and left",
  },
  {
    moves: [present(ESSAY_REF), answer(ESSAY_REF, "long"), save(ESSAY_REF, "short")],
    name: "the essay answered, then saved short",
  },
  {
    moves: [present(ESSAY_REF), save(ESSAY_REF, "short"), answer(ESSAY_REF, "long")],
    name: "the essay saved short, then answered",
  },
  {
    moves: [
      present(DRAFT_REF),
      answer(DRAFT_REF, "short"),
      answer(DRAFT_REF, "long"),
      save(DRAFT_REF, "short"),
    ],
    name: "the draft answered short, then long, then saved short",
  },
  {
    moves: [
      present(ESSAY_REF),
      save(ESSAY_REF, "short"),
      present(DRAFT_REF),
      present(ESSAY_REF),
      answer(ESSAY_REF, "short"),
      answer(MEMBER_REF, "short"),
    ],
    name: "the essay saved short, left and returned to, answered short; the member answered short",
  },
] as const satisfies readonly ControlsCase[];

const controlsSpace: Gen<ControlsCase> = element(controlsCases);

/**
 * What the table holds of each member: whether its item ref's own control sets validate-responses
 * true, and whether it sets max-attempts 0 (QTI 3.0.1 Tables 7.19.7 and 7.19.1).
 */
const controlsOf = {
  [DRAFT_REF]: { unlimited: false, validated: true },
  [ESSAY_REF]: { unlimited: true, validated: true },
  [MEMBER_REF]: { unlimited: false, validated: false },
} as const satisfies Record<ControlRef, Readonly<{ unlimited: boolean; validated: boolean }>>;

/**
 * Each control ref's document.
 */
const controlPathOf = {
  [DRAFT_REF]: DRAFT_MIN,
  [ESSAY_REF]: ESSAY_MIN,
  [MEMBER_REF]: MEMBER_MIN,
} as const satisfies Record<ControlRef, string>;

/**
 * An attempt's response as the table states it: its text, or NULL where the end submitted the
 * member at its default.
 */
type SubmittedText = ControlText | "default";

type ControlsExpected = Readonly<{
  moves: readonly ("accepted" | "unchanged")[];
  attempts: Readonly<Record<ControlRef | typeof SAVED, readonly SubmittedText[]>>;
}>;

/**
 * A member's state as the controls' table folds a case's moves: whether it was presented, its
 * attempts' texts, its latest save, and whether that save came after its last attempt.
 */
interface MemberState {
  readonly attempts: SubmittedText[];
  latest: Option.Option<ControlText>;
  presented: boolean;
  since: boolean;
}

/**
 * A member's state at the sitting's start: presented there or not, with no attempt and no save.
 *
 * @param presented - Whether the start presents it.
 */
const freshMember = (presented: boolean): MemberState => ({
  attempts: [],
  latest: Option.none(),
  presented,
  since: false,
});

/**
 * The controls' table, a fold over the case's moves of each member's state (presented, its
 * attempts, its latest save, and whether that save came after its last attempt):
 *
 * - A presentation is accepted, and submits nothing: "navigation" in a nonlinear part moves the
 *   candidate, and an attempt ends "only ... in direct response to a user action or in response to
 *   some expected event, such as the end of a test" (§2.2.4), a submission.
 * - A member takes a response while its attempt is in progress: under max-attempts 1, until its one
 *   attempt (Table 7.19.1; "Once in the closed state the values of the response variables are
 *   fixed", §2.2.1), and under max-attempts 0, always ("A value of 0 indicates no limit"). A save
 *   or an answer of a member that takes none writes nothing.
 * - An answer is the candidate's submission: a validated member's is accepted only where its text is
 *   valid ("the candidates are not allowed to submit the item until they have provided valid
 *   responses for all interactions", Table 7.19.7), and an unvalidated member's whatever its text
 *   (tier (b) of admission holds only under validate-responses). A save is no submission, and is
 *   never held to it.
 * - The end submits, unvalidated, every presented member whose attempt is in progress: one with no
 *   attempt from its latest save, or at its defaults where it has none (Table 7.19.6), and an
 *   unlimited member saved since its last attempt from that save; never a member never presented,
 *   whose "response variable remains NULL" (Table 5.115).
 *
 * @param c - The case.
 */
const controlsExpectedOf = (c: ControlsCase): ControlsExpected => {
  const state: Record<ControlRef, MemberState> = {
    [DRAFT_REF]: freshMember(false),
    [ESSAY_REF]: freshMember(false),
    [MEMBER_REF]: freshMember(true),
  };
  const takes = (ref: ControlRef) => controlsOf[ref].unlimited || state[ref].attempts.length === 0;
  const moves = c.moves.map((move): "accepted" | "unchanged" => {
    const member = state[move.ref];
    if (move.kind === "present") {
      member.presented = true;

      return "accepted";
    }

    if (!takes(move.ref)) {
      return "unchanged";
    }

    if (move.kind === "save") {
      member.latest = Option.some(move.text);
      member.since = true;

      return "accepted";
    }

    if (controlsOf[move.ref].validated && move.text === "short") {
      return "unchanged";
    }

    member.attempts.push(move.text);
    member.since = false;

    return "accepted";
  });
  const closed = (ref: ControlRef): readonly SubmittedText[] => {
    const member = state[ref];
    if (!member.presented) {
      return member.attempts;
    }

    if (member.attempts.length === 0) {
      return [Option.getOrElse(member.latest, (): SubmittedText => "default")];
    }

    return controlsOf[ref].unlimited && member.since
      ? [...member.attempts, Option.getOrElse(member.latest, (): SubmittedText => "default")]
      : member.attempts;
  };

  return {
    attempts: {
      [DRAFT_REF]: closed(DRAFT_REF),
      [ESSAY_REF]: closed(ESSAY_REF),
      [MEMBER_REF]: closed(MEMBER_REF),
      [SAVED]: [],
    },
    moves,
  };
};

/**
 * The situations the controls' space must reach.
 */
const controlsSituations = [
  "a validated member's short answer writes nothing",
  "a validated member's valid answer is accepted",
  "an unvalidated member's short answer is accepted",
  "an unlimited member answered again",
  "a limited member's second answer writes nothing",
  "a limited member's save after its attempt writes nothing",
  "a presentation submits nothing",
  "the end submits a short save unvalidated",
  "the end submits an unlimited member saved since its last attempt",
  "the end submits a presented member at its defaults",
  "the end submits nothing of a member never presented",
] as const;

type ControlsSituation = (typeof controlsSituations)[number];

/**
 * The situations a case reaches, read from its moves and the table's verdicts.
 *
 * @param c - The case.
 * @param expected - The table's verdicts.
 */
const controlsSituationsOf = (c: ControlsCase, expected: ControlsExpected) => {
  const reached = new Set<ControlsSituation>([
    "the end submits nothing of a member never presented",
  ]);
  const answered = new Map<ControlRef, number>();
  for (const [i, move] of c.moves.entries()) {
    const verdict = expected.moves[i];
    if (move.kind === "present") {
      reached.add("a presentation submits nothing");
    } else if (move.kind === "answer") {
      const before = answered.get(move.ref) ?? 0;
      if (verdict === "accepted") {
        answered.set(move.ref, before + 1);
        reached.add(
          controlsOf[move.ref].validated
            ? "a validated member's valid answer is accepted"
            : "an unvalidated member's short answer is accepted",
        );
        if (before > 0) {
          reached.add("an unlimited member answered again");
        }
      } else if (!controlsOf[move.ref].unlimited && before > 0) {
        reached.add("a limited member's second answer writes nothing");
      } else {
        reached.add("a validated member's short answer writes nothing");
      }
    } else if (verdict === "unchanged") {
      reached.add("a limited member's save after its attempt writes nothing");
    }
  }
  for (const ref of [MEMBER_REF, ESSAY_REF, DRAFT_REF] as const) {
    const attempts = expected.attempts[ref];
    const ends = attempts.length - (answered.get(ref) ?? 0);
    if (ends > 0 && attempts.at(-1) === "default") {
      reached.add("the end submits a presented member at its defaults");
    } else if (ends > 0 && (answered.get(ref) ?? 0) > 0) {
      reached.add("the end submits an unlimited member saved since its last attempt");
    } else if (ends > 0) {
      reached.add("the end submits a short save unvalidated");
    }
  }

  return [...reached];
};

/**
 * One controls case: a fresh child's sitting of the controls test, written as host rows as a take
 * writes it, entered, which presents {@link MEMBER_REF}; then each move through the test runtime's
 * own programs, its outcome held to the table, and the child's attempts after a presentation held
 * to be the attempts before it; then the end with its finish (`finishTest`), and every member's
 * attempts, in their order, held to the table, each by the string its snapshot holds, none where
 * the end submitted it at its default.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdControls = (
  c: ControlsCase,
  child: string,
  note: (situation: ControlsSituation) => void,
) =>
  Effect.gen(function* hold() {
    const expected = controlsExpectedOf(c);
    for (const situation of controlsSituationsOf(c, expected)) {
      note(situation);
    }

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const sitting = { child, stage: 1n };
    const taken = yield* db.workload.sittingFacts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", []),
          ItemSession: rowsOf(
            "ItemSession",
            controlsMembers.map(({ path }) => ({ ...sitting, package: PACKAGE, path })),
          ),
          ResponseSnapshot: rowsOf("ResponseSnapshot", []),
          SessionSeed: rowsOf(
            "SessionSeed",
            controlsMembers.map(({ path }) => ({ ...sitting, package: PACKAGE, path, seed: SEED })),
          ),
          TestSession: rowsOf("TestSession", [
            { ...sitting, package: PACKAGE, path: CONTROLS_TEST },
          ]),
        },
      },
      params: {},
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as a take writes it`);

    const entered = yield* db.workload.enterTest.once({ facts: {}, params: sitting });
    assert.strictEqual(entered.kind, "accepted", `${c.name}: the entry`);

    const began = Option.getOrThrow(Arr.head(Arr.fromIterable(entered.reads.entered))).at;

    const attemptCount = Effect.map(
      db.workload.attemptsOf.once({ facts: {}, params: { child } }),
      (rows) => Arr.fromIterable(rows).length,
    );

    for (const [i, move] of c.moves.entries()) {
      const want = expected.moves[i];
      const what = `${c.name}: move ${String(i + 1)}, ${move.kind} ${move.ref}${move.kind === "present" ? "" : ` ${move.text}`}`;
      if (move.kind === "present") {
        const before = yield* attemptCount;
        const presented = yield* db.workload.presentItem.once({
          facts: {},
          params: { ...sitting, item: move.ref },
        });
        assert.strictEqual(presented.kind, want, what);
        assert.strictEqual(yield* attemptCount, before, `${what}: submits nothing`);
      } else {
        const values = yield* responseParamsOf({
          RESPONSE: {
            baseType: "string",
            cardinality: "single",
            values: [{ baseType: "string", value: controlTexts[move.text] }],
          },
        });
        const params = { ...sitting, given: began, item: move.ref, ...values };
        const outcome =
          move.kind === "save"
            ? yield* db.workload.saveTestItem.once({ facts: {}, params })
            : yield* db.workload.answerTestItem.once({
                facts: {},
                params: { ...params, next: [] },
              });
        assert.strictEqual(outcome.kind, want, what);
      }
    }

    const ended = yield* db.workload.finishTest.once({ facts: {}, params: sitting });
    assert.strictEqual(ended.kind, "accepted", `${c.name}: the end and its finish`);

    const attempts = Arr.fromIterable(
      yield* db.workload.attemptsOf.once({ facts: {}, params: { child } }),
    );
    const strings = Arr.fromIterable(
      yield* db.workload.snapshotStringsOf.once({ facts: {}, params: { child } }),
    );
    const textOf = (value: string): SubmittedText => {
      if (value === controlTexts.long) {
        return "long";
      }

      if (value === controlTexts.short) {
        return "short";
      }

      return assert.fail(`${c.name}: an attempt of ${value}`);
    };
    const submittedOf = (path: string) =>
      Arr.sort(
        attempts.filter((row) => row.package === PACKAGE && row.path === path),
        Order.mapInput(Order.BigInt, (row: (typeof attempts)[number]) => row.at),
      ).map((row): SubmittedText => {
        const held = strings.filter(
          (value) =>
            value.path === path &&
            value.n === row.n &&
            value.at === row.at &&
            value.variable === "RESPONSE",
        );

        return held.length === 0 ? "default" : textOf(Option.getOrThrow(Arr.head(held)).value);
      });
    assert.deepStrictEqual<unknown>(
      {
        [DRAFT_REF]: submittedOf(controlPathOf[DRAFT_REF]),
        [ESSAY_REF]: submittedOf(controlPathOf[ESSAY_REF]),
        [MEMBER_REF]: submittedOf(controlPathOf[MEMBER_REF]),
        [SAVED]: submittedOf(OTHER),
      },
      expected.attempts,
      `${c.name}: every member's attempts, in order, after the end`,
    );
  });

/**
 * A supersede case: a timed sitting's member saved in time, then saved again the case's offset past
 * its deadline, by the database's stamp.
 */
type SupersedeCase = Readonly<{ name: string; pastMicros: bigint }>;

/**
 * The budget a supersede case's candidate session begins with, two seconds: the first save lands
 * well within it, and the case waits out the rest in real time, since the database is the clock.
 */
const supersedeBudgetMicros = 2_000_000n;

/**
 * Every supersede case: the later save 1.5 s past the deadline, within the in-flight grace, and 11
 * s past it, beyond the grace.
 */
const supersedeCases = [
  { name: "the later save 1.5 s past the deadline", pastMicros: 1_500_000n },
  { name: "the later save 11 s past the deadline", pastMicros: 11_000_000n },
] as const satisfies readonly SupersedeCase[];

const supersedeSpace: Gen<SupersedeCase> = element(supersedeCases);

/**
 * The two saves' texts: the in-time one, and the later one that would supersede it.
 */
const supersedeTexts = { first: "12", later: "125" } as const;

/**
 * The supersede table: the database is the clock. A save that arrives by its session's deadline and
 * the in-flight grace past it ({@link inFlightGraceMicros}) is admitted, the latest winning; one
 * that arrives after it is refused by "Response in time"; and the end submits the latest save
 * admitted (the close, `#ledger/finish.ts`). The browser's reading `given`, every save's its
 * session's beginning here, decides nothing.
 *
 * @param c - The case.
 */
const supersedeExpectedOf = (c: SupersedeCase) =>
  c.pastMicros <= inFlightGraceMicros
    ? ({ later: "accepted", submitted: supersedeTexts.later } as const)
    : ({ later: "refused", submitted: supersedeTexts.first } as const);

/**
 * The situations the supersede space must reach.
 */
const supersedeSituations = [
  "a later save within the grace supersedes the in-time one",
  "a later save past the grace is refused, and the in-time one is submitted",
] as const;

type SupersedeSituation = (typeof supersedeSituations)[number];

/**
 * One supersede case: a fresh child's sitting of the timed test, written as host rows as a take
 * writes it, entered with the case's budget, which presents {@link MEMBER}; its save of the first
 * text at once; then, once the database's clock is the case's offset past the deadline, its save of
 * the later text, held to the table; then the end with its finish, and the member's one attempt
 * held to submit the text the table says.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdSupersede = (
  c: SupersedeCase,
  child: string,
  note: (situation: SupersedeSituation) => void,
) =>
  Effect.gen(function* hold() {
    const want = supersedeExpectedOf(c);
    note(
      want.later === "accepted"
        ? "a later save within the grace supersedes the in-time one"
        : "a later save past the grace is refused, and the in-time one is submitted",
    );

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const sitting = { child, stage: 1n };
    const members = [SHORT, OTHER] as const;
    const taken = yield* db.workload.sittingFacts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", []),
          ItemSession: rowsOf(
            "ItemSession",
            members.map((path) => ({ ...sitting, package: PACKAGE, path })),
          ),
          ResponseSnapshot: rowsOf("ResponseSnapshot", []),
          SessionSeed: rowsOf(
            "SessionSeed",
            members.map((path) => ({ ...sitting, package: PACKAGE, path, seed: SEED })),
          ),
          TestSession: rowsOf("TestSession", [{ ...sitting, package: PACKAGE, path: TIMED_TEST }]),
        },
      },
      params: {},
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as a take writes it`);

    const entered = yield* db.workload.enterTimedTest.once({
      facts: {},
      params: { ...sitting, remaining: supersedeBudgetMicros },
    });
    assert.strictEqual(entered.kind, "accepted", `${c.name}: the timed entry`);

    const began = Option.getOrThrow(Arr.head(Arr.fromIterable(entered.reads.entered))).at;
    const saveOf = (text: string) =>
      Effect.gen(function* saveText() {
        const values = yield* responseParamsOf({
          RESPONSE: {
            baseType: "string",
            cardinality: "single",
            values: [{ baseType: "string", value: text }],
          },
        });

        return yield* Effect.result(
          db.workload.saveTestItem.once({
            facts: {},
            params: { ...sitting, given: began, item: MEMBER, ...values },
          }),
        );
      });
    const first = yield* saveOf(supersedeTexts.first);
    assert.isTrue(
      Result.isSuccess(first) && first.success.kind === "accepted",
      `${c.name}: the in-time save, got ${Formatter.format(first)}`,
    );

    const now = yield* Clock.currentTimeMillis;
    const due = Number((began + supersedeBudgetMicros + c.pastMicros) / 1000n);
    yield* Effect.sleep(Duration.millis(Math.max(0, due - now)));

    const later = yield* saveOf(supersedeTexts.later);
    if (want.later === "accepted") {
      assert.isTrue(
        Result.isSuccess(later) && later.success.kind === "accepted",
        `${c.name}: the later save admitted, got ${Formatter.format(later)}`,
      );
    } else {
      assert.isTrue(
        Result.isFailure(later) &&
          later.failure.kind === "refused" &&
          Formatter.format(refusedLawsOf(later.failure.refused)).includes("Response_in_time"),
        `${c.name}: the later save refused by Response_in_time, got ${Formatter.format(later)}`,
      );
    }

    const ended = yield* db.workload.finishTest.once({ facts: {}, params: sitting });
    assert.strictEqual(ended.kind, "accepted", `${c.name}: the end and its finish`);

    const attempts = Arr.fromIterable(
      yield* db.workload.attemptsOf.once({ facts: {}, params: { child } }),
    ).filter((row) => row.package === PACKAGE && row.path === SHORT);
    const strings = Arr.fromIterable(
      yield* db.workload.snapshotStringsOf.once({ facts: {}, params: { child } }),
    );
    assert.deepStrictEqual<unknown>(
      attempts.map((row) =>
        strings
          .filter(
            (value) =>
              value.path === SHORT &&
              value.n === row.n &&
              value.at === row.at &&
              value.variable === "RESPONSE",
          )
          .map((value) => value.value),
      ),
      [[want.submitted]],
      `${c.name}: the end submits the latest save admitted`,
    );
  });

/**
 * A presence case: how a timed sitting's first candidate session ends, and the budget it begins
 * with.
 *
 * - `pause`: the candidate pauses, a beacon and a suspension in one statement, then resumes.
 * - `lapse`: a beacon, then two seconds of no sign (a closed tab), then the application suspends the
 *   session it finds abandoned, and the candidate resumes.
 * - `lapsePastDeadline`: the same with a one-second budget, so the deadline passes while the tab is
 *   closed.
 * - `presentPastDeadline`: a beacon after a one-second budget ran out, then a suspension.
 */
type PresenceCase = Readonly<{
  name: string;
  ending: "pause" | "lapse" | "lapsePastDeadline" | "presentPastDeadline";
}>;

/**
 * Every presence case.
 */
const presenceCases = [
  { ending: "pause", name: "a pause the candidate makes" },
  { ending: "lapse", name: "a closed tab, then the application's suspension" },
  { ending: "lapsePastDeadline", name: "a closed tab past the deadline, then the suspension" },
  { ending: "presentPastDeadline", name: "a beacon past the deadline, then a suspension" },
] as const satisfies readonly PresenceCase[];

const presenceSpace: Gen<PresenceCase> = element(presenceCases);

/**
 * The budgets a presence case begins with: ten minutes, or one second for the cases whose deadline
 * passes.
 */
const presenceBudgetOf = (c: PresenceCase): bigint =>
  c.ending === "lapsePastDeadline" || c.ending === "presentPastDeadline"
    ? 1_000_000n
    : 600_000_000n;

/**
 * How long a presence case waits in real time after its beacon, before the suspension: two seconds
 * of no sign for a closed tab; none for a pause, which carries its own; and, for a beacon past the
 * deadline, a second and a half before the beacon.
 */
const absenceMillis = 2000;

/**
 * The presence table: a candidate session is charged up to its last sign of presence (its start, a
 * beacon, a presentation, a response): the time after it, a closed tab's, is no time the candidate
 * used (H10). So a pause, which carries a beacon, is charged to the pause; a session suspended
 * after a closed tab is charged to its last beacon, and resumes with the rest, even where the
 * deadline passed while the tab was closed; and a session whose last sign is past its deadline is
 * refused its suspension by "Suspended in time" (Table 7.40), the test allowing no late
 * submission.
 *
 * @param c - The case.
 */
const presenceExpectedOf = (c: PresenceCase) =>
  c.ending === "presentPastDeadline"
    ? ({ kind: "refused", law: "Suspended_in_time" } as const)
    : ({ kind: "charged to the last sign" } as const);

/**
 * The situations the presence space must reach.
 */
const presenceSituations = [
  "a pause charged to the pause",
  "a closed tab's time not charged",
  "a closed tab across the deadline resumes with the rest",
  "a sign past the deadline refused its suspension",
  "an item's duration ends at the last sign of presence",
] as const;

type PresenceSituation = (typeof presenceSituations)[number];

/**
 * One presence case: a fresh child's sitting of the timed test, written as host rows as a take
 * writes it, entered with the case's budget; then its ending, held to the table; and, where the
 * suspension is accepted, a resumption, whose budget is held to the first budget less the time from
 * the session's start to its last sign of presence, the last beacon's instant, and the member the
 * start presented, whose built-in `duration` (the CQPM window's part) is held to the same time: a
 * closed tab's time counts against neither the budget nor a child's rate.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdPresence = (
  c: PresenceCase,
  child: string,
  note: (situation: PresenceSituation) => void,
) =>
  Effect.gen(function* hold() {
    const want = presenceExpectedOf(c);
    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const sitting = { child, stage: 1n };
    const members = [SHORT, OTHER] as const;
    const taken = yield* db.workload.sittingFacts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", []),
          ItemSession: rowsOf(
            "ItemSession",
            members.map((path) => ({ ...sitting, package: PACKAGE, path })),
          ),
          ResponseSnapshot: rowsOf("ResponseSnapshot", []),
          SessionSeed: rowsOf(
            "SessionSeed",
            members.map((path) => ({ ...sitting, package: PACKAGE, path, seed: SEED })),
          ),
          TestSession: rowsOf("TestSession", [{ ...sitting, package: PACKAGE, path: TIMED_TEST }]),
        },
      },
      params: {},
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as a take writes it`);

    const budget = presenceBudgetOf(c);
    const entered = yield* db.workload.enterTimedTest.once({
      facts: {},
      params: { ...sitting, remaining: budget },
    });
    assert.strictEqual(entered.kind, "accepted", `${c.name}: the timed entry`);

    const began = Option.getOrThrow(Arr.head(Arr.fromIterable(entered.reads.entered))).at;
    const lastSign = yield* Effect.gen(function* end() {
      if (c.ending === "pause") {
        const paused = yield* db.workload.pauseTest.once({ facts: {}, params: sitting });
        assert.strictEqual(paused.kind, "accepted", `${c.name}: the pause`);

        return Option.some(Option.getOrThrow(Arr.head(Arr.fromIterable(paused.reads.beacon))).at);
      }

      if (c.ending === "presentPastDeadline") {
        yield* Effect.sleep(Duration.millis(absenceMillis - 500));
      }

      const beaconed = yield* db.workload.beaconTest.once({ facts: {}, params: sitting });
      assert.strictEqual(beaconed.kind, "accepted", `${c.name}: the beacon`);

      const beacon = Option.getOrThrow(Arr.head(Arr.fromIterable(beaconed.reads.beacon))).at;
      yield* Effect.sleep(Duration.millis(absenceMillis));

      const suspended = yield* Effect.result(
        db.workload.suspendTest.once({ facts: {}, params: sitting }),
      );
      if (want.kind === "refused") {
        assert.isTrue(
          Result.isFailure(suspended) &&
            suspended.failure.kind === "refused" &&
            Formatter.format(refusedLawsOf(suspended.failure.refused)).includes(want.law),
          `${c.name}: the suspension refused by ${want.law}, got ${Formatter.format(suspended)}`,
        );
        note("a sign past the deadline refused its suspension");

        return Option.none<bigint>();
      }

      assert.isTrue(
        Result.isSuccess(suspended) && suspended.success.kind === "accepted",
        `${c.name}: the suspension, got ${Formatter.format(suspended)}`,
      );

      return Option.some(beacon);
    });
    if (Option.isNone(lastSign)) {
      return;
    }

    const resumed = yield* db.workload.enterTest.once({ facts: {}, params: sitting });
    assert.strictEqual(resumed.kind, "accepted", `${c.name}: the resumption`);

    const budgets = Arr.fromIterable(
      yield* db.workload.budgetsOf.once({ facts: {}, params: { child } }),
    );
    assert.deepStrictEqual<unknown>(
      budgets.filter((row) => row.k === 1n).map((row) => String(row.remaining)),
      [String(budget - (lastSign.value - began))],
      `${c.name}: the resumption's budget, the first less the time to the last sign of presence`,
    );

    const durations = Arr.fromIterable(
      yield* db.workload.durationsOf.once({ facts: {}, params: { child } }),
    ).filter((row) => row.package === PACKAGE && row.path === SHORT);
    assert.deepStrictEqual<unknown>(
      durations.map((row) => String(row.micros)),
      [String(lastSign.value - began)],
      `${c.name}: the member's duration, from its presentation at the start to the last sign of presence`,
    );
    note("an item's duration ends at the last sign of presence");
    if (c.ending === "pause") {
      note("a pause charged to the pause");
    } else if (c.ending === "lapse") {
      note("a closed tab's time not charged");
    } else {
      note("a closed tab across the deadline resumes with the rest");
    }
  });

describe.skipIf(Option.isNone(migrations))(
  "an AI-graded essay's result relations, a templated item's take and an adaptive item's attempts, on the runner's database",
  () => {
    layer(SuiteLayer, { excludeTestServices: true, timeout: "300 seconds" })(
      "waiting, grading in the write after which nothing waits, operands, status, values and credit under a composition with rubric-score's grader",
      (it) => {
        it.effect(
          "publishes the essay, and holds every case of every family to the oracle",
          (ctx) =>
            Effect.gen(function* holdEveryCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "every case of the essay, history and bounds families, each on a fresh child",
                    caseHang: Duration.minutes(2),
                    coverage: requiredInSpace<Situation>(situations),
                    generator: space,
                    literal: (c: Case) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "expectedOf, the rule table: Results Reporting 2.7.7, ASI 5.37 and 5.42, rubric-score's contract, the owner's credit, grading in the write's own transaction",
                    },
                    suite: "ledger/results/essay",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdCase(row, `user_ledger${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(
                `the essay's result relations held over ${String(exhausted.cases)} cases`,
              );
            }).pipe(Effect.orDie),
        );

        it.effect(
          "takes the templated item under each seed, and holds what the take stored to its run",
          (ctx) =>
            Effect.gen(function* holdEveryTake() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "the templated item taken under each of its seeds, each on a fresh child",
                    caseHang: Duration.minutes(2),
                    coverage: requiredInSpace<TakeSituation>(takeSituations),
                    generator: takeSpace,
                    literal: (c: TakeCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "takeExpectedOf, the take's table: what template processing set (QTI 3.0.1 §2.2.1) and nothing declared, T the machine's own run's",
                    },
                    suite: "ledger/results/take",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdTake(row, `user_ledgertake${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the take held over ${String(exhausted.cases)} seeds`);
            }).pipe(Effect.orDie),
        );

        it.effect(
          "grades the operators item through the ledger's own grading, its operators given the registry's tables",
          (ctx) =>
            Effect.gen(function* holdEveryOperatorsCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "each MATH answer with each PHRASE answer, each on a fresh child",
                    caseHang: Duration.minutes(2),
                    coverage: requiredInSpace<OperatorsSituation>(operatorsSituations),
                    generator: operatorsSpace,
                    literal: (c: OperatorsCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "operatorsExpectedOf: math-canonical's form against the key's, phrase-distance at 0 under the seed's irregular-plurals table in its plurals role, the owner's credit",
                    },
                    suite: "ledger/results/operators",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdOperators(row, `user_ledgerops${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the operators item held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
        );

        it.effect(
          "grades the draw item's attempts, adaptive and not, and holds every case to the oracle",
          (ctx) =>
            Effect.gen(function* holdEveryDrawCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "the draw item adaptive and not, every ending of each of its three attempts, each case on a fresh child",
                    caseHang: Duration.minutes(2),
                    coverage: requiredInSpace<DrawSituation>(drawSituations),
                    generator: drawSpace,
                    literal: (c: DrawCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "drawExpectedOf, the rule table: info §2.2.2.3 (an adaptive item's outcomes retained, a non-adaptive item's at their defaults), ASI Table 4.5's defaults, the draw item's response processing",
                    },
                    suite: "ledger/results/adaptive",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdDrawCase(row, `user_ledgerdraw${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(
                `the draw item's outcomes held over ${String(exhausted.cases)} cases`,
              );
            }).pipe(Effect.orDie),
        );

        it.effect(
          "holds a test's responses to its candidate sessions and its time, and reads back each move's standing",
          (ctx) =>
            Effect.gen(function* holdEveryResponse() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "each timing of a save in the open session, and an untimed sitting's save before, between and after its candidate sessions, each on a fresh child",
                    caseHang: Duration.minutes(2),
                    coverage: requiredInSpace<ResponseSituation>(responseSituations),
                    generator: responseSpace,
                    literal: (c: ResponseCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "responseExpectedOf: inside a candidate session (QTI 3.0.1 §2.2.1), arriving, by the database's stamp, within its time and the in-flight grace unless the test allows late submission (Table 7.40.3)",
                    },
                    suite: "ledger/results/responses",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdResponse(row, `user_ledgerresp${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the responses held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
        );

        it.effect(
          "submits the latest save admitted by the database's clock, a later one within the in-flight grace and none past it",
          (ctx) =>
            Effect.gen(function* holdEverySupersedeCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "an in-time save, then a later one within and past the in-flight grace, each on a fresh child",
                    caseHang: Duration.minutes(2),
                    coverage: requiredInSpace<SupersedeSituation>(supersedeSituations),
                    generator: supersedeSpace,
                    literal: (c: SupersedeCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "supersedeExpectedOf: the database is the clock; what arrives by the deadline and the in-flight grace is admitted, the latest save winning, and the end submits it (Table 7.40.3, §2.2.4)",
                    },
                    suite: "ledger/results/supersede",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdSupersede(row, `user_ledgersup${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the supersedes held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
        );

        it.effect(
          "charges a candidate session up to its last sign of presence, never a closed tab's time",
          (ctx) =>
            Effect.gen(function* holdEveryPresenceCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "a pause, a closed tab before and across the deadline, and a sign past it, each on a fresh child",
                    caseHang: Duration.minutes(2),
                    coverage: requiredInSpace<PresenceSituation>(presenceSituations),
                    generator: presenceSpace,
                    literal: (c: PresenceCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "presenceExpectedOf: a candidate session is charged up to its last sign of presence (H10), and one whose last sign is past its deadline is refused its suspension (Table 7.40)",
                    },
                    suite: "ledger/results/presence",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdPresence(row, `user_ledgerpres${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the presences held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
        );

        it.effect(
          "delivers item-session controls on an individual part's item refs alone, and holds every answer, presentation and end to them",
          (ctx) =>
            Effect.gen(function* holdEveryControlsCase() {
              yield* Effect.scoped(published);

              const { suite } = yield* SuiteLogin;
              const db = yield* Db.open(suite.roles.result_runner, {});
              const delivered = new Set(
                Arr.fromIterable(
                  yield* db.workload.deliveredTestsOf.once({
                    facts: {},
                    params: { package: PACKAGE },
                  }),
                ).map((row) => row.path),
              );
              assert.deepStrictEqual<unknown>(
                [
                  CONTROLS_TEST,
                  SIMULTANEOUS_VALIDATED_TEST,
                  SIMULTANEOUS_UNLIMITED_TEST,
                  PART_VALIDATED_TEST,
                ].map((path) => [path, delivered.has(path)]),
                [
                  [CONTROLS_TEST, true],
                  [SIMULTANEOUS_VALIDATED_TEST, false],
                  [SIMULTANEOUS_UNLIMITED_TEST, false],
                  [PART_VALIDATED_TEST, false],
                ],
                'validate-responses and max-attempts 0 delivered on an individual part\'s item ref alone (Table 7.19.7: "only applicable when the item is in a qti-test-part with individual submission mode")',
              );

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "each sequence of presentations, saves and answers of the controls test's members, then its end, each on a fresh child",
                    caseHang: Duration.minutes(2),
                    coverage: requiredInSpace<ControlsSituation>(controlsSituations),
                    generator: controlsSpace,
                    literal: (c: ControlsCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "controlsExpectedOf: validate-responses holds the candidate's answer alone (Table 7.19.7, §2.2.4), max-attempts 0 takes an attempt after each (Table 7.19.1), the end submits every presented member in progress unvalidated and none never presented (Tables 7.19.6, 5.115)",
                    },
                    suite: "ledger/results/controls",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdControls(row, `user_ledgerctl${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the controls held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
        );
      },
    );
  },
);
