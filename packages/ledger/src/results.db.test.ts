/**
 * The result relations of an AI-graded essay on a migrated database, held to a decision table
 * written apart from the code, under a composition that registers rubric-score's grader
 * (`#ledger/test/result-level.ts`): what an attempt's response processing waits for
 * (`PendingApplication`, `AwaitingHumanEvaluation`), the operands its request is made of
 * (`ApplicationOperands`, `ApplicationMaximum`, `ApplicationDraw`), its Results Reporting status
 * (`ItemSessionStatus`), its values in force and its credit (`OutcomeInForceSingleFloat`,
 * `AttemptCredit`), and the laws that hold a machine's reply and a person's value to the
 * application's maximum ("Reply within maximum", "Human within maximum"). An application's own
 * suite proves the rest of the result seam on its own installation (edullm's `results.db.test.ts`,
 * whose composition registers no grader, so its essays are never evaluated). It runs wherever a
 * lane names its lease (pantry's `QTI_PIE_PG_*`), on the lease's result database, where the
 * ledger's global setup generates and installs the composition (`#ledger/test/result-install.ts`),
 * and is skipped elsewhere, as every database suite is.
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
 * - **Operands** (`rubric-score`'s contract): each draw of an answered essay the grader's run
 *   demands, with its response, its rubric group, the grader version in force and MAXSCORE's
 *   default (ASI Table 5.42); its literal draw. A history attempt carries none: nothing grades it,
 *   and history is never regraded.
 * - **Grading**: by the write after which nothing of the attempt waits, in its own transaction.
 * - **Values in force and credit**: response processing's SCORE and MAXSCORE, and the owner's credit
 *   of SCORE over MAXSCORE (proposal 2026-11-18, Decision 3).
 * - **Bounds**: a reply or a person's value past the application's maximum is refused at its write,
 *   never clamped.
 *
 * And a templated item's take (`begin`, `takeValuesOf`), held to its own table
 * ({@link takeExpectedOf}): a fresh child's session of the item under each of a set of seeds, taken
 * as every take takes one, records exactly what template processing set (QTI 3.0.1 §2.2.1; ASI
 * `qti-set-template-value`, `qti-set-correct-response`, `qti-set-default-value`), each value by the
 * rule that set it, and nothing declared: T at the machine's own run of the session's template
 * processing (`templateProcessingOf` over `takeArgumentsOf`, as the take ran it), RESPONSE's
 * correct response T, RESPONSE's default T where T is past 5, and FEEDBACK's default NULL where T
 * is even, a header with no value row.
 *
 * And an item session's attempts, each graded as the write that records it grades it, held to a
 * table of QTI 3.0.1's outcome rule ({@link drawExpectedOf}; info §2.2.2.3): "For Adaptive Items
 * the outcome variables retain the values that were assigned to them during the previous invocation
 * of response processing", and a non-adaptive item's start again at their defaults. The item is a
 * drawing the child makes on paper and checks against a model the item reveals once its end-attempt
 * button says it is drawn (CONTENT-FRESH's "draw" items), in the package twice, adaptive and not.
 *
 * And a sitting as a review reads it (`reviewOf`, `#ledger/attempt-rows.ts` attemptRowsOf), held to
 * its table ({@link reviewExpectedOf}): each item session of the sitting that has an attempt, at
 * its latest attempt (the Delivery level's `LatestAttempt`), with its values as they stand, the
 * completion status its response processing left, its credit and its marks; an essay waiting for
 * a person holds its response alone, a session never answered has no row, and another sitting's
 * attempt is not read.
 *
 * And a test's responses (`enterTest`, `saveTestItem`, `suspendTest`, `endTest`, the test runtime's
 * own programs, over a sitting written as host rows), held to their table
 * ({@link responseExpectedOf}): a save lies inside a candidate session, so one before the sitting's
 * first, after its suspension or after its end is refused by "Inside a candidate session" (QTI
 * 3.0.1 §2.2.1); and a save in a timed one arrives, by the database's stamp, within its time and
 * the in-flight grace past it, so one arriving past the grace is refused by "Response in time",
 * unless the test allows late submission (Table 7.40.3, `allow-late-submission`), whatever the
 * browser's reading of when it was given says, a reading a day ahead of the stamp included, which
 * no law holds to it (`BrowserReading`). Every program reads back its sitting's standing,
 * which the table holds after each move. And the latest save admitted is what the end submits: a
 * save superseding an in-time one 1.5 s past the deadline is submitted, and one 11 s past it is
 * refused, so the in-time one is ({@link supersedeExpectedOf}). And a candidate session is charged
 * up to its last sign of presence (its start, a beacon, a presentation, a response), never a closed
 * tab's time: a pause, which carries a beacon, to the pause, a session suspended after a closed tab
 * to its last beacon, even across its deadline, and one whose last sign is past its deadline is
 * refused its suspension ({@link presenceExpectedOf}).
 *
 * And a sitting's presence windows (`beaconTest`, served on the database's clock), held to their
 * table ({@link windowExpected}): a beacon within 3 s of the sitting's latest window grows it, one
 * past the grace opens a window of its own, a window overlapping another is refused by Presence's
 * key and one from its end admitted, half-open, and a question visit is credited from the first
 * beacon to the last, cut at a suspension and never charged a closed tab's tail (`PresentTime`,
 * `LastPresence`). And any run of up to twelve beacons, in order or not, across a UTC midnight or
 * not, leaves the windows, the visit's present time by day and the last beacon a serial reference
 * gives ({@link windowsOfReadings}, {@link creditByDayOf}).
 *
 * Each family whose verdict turns on time (the responses, the supersedes, the presences, the
 * windows and the beacon runs) runs over a moved clock (`#ledger/test/result-clock.ts`): its case
 * states the instant of every call, each stamp and each reading of the database's clock, so no
 * real time between its statements, however loaded the machine, moves a verdict, and no case
 * sleeps. Every other family runs the statements `grizzle generate` compiled, the ones an
 * application runs.
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
 *
 * And a simultaneous part's shown members (`presentItem`, `saveTestItem`, `finishTest`), held to
 * their table ({@link shownExpectedOf}): a save of a member never presented is refused by "Shown
 * before saved" and stores nothing (§2.2.1, §2.3), the end submits every presented member from its
 * latest save or at its defaults and none never presented, and an attempt of a human-scored essay
 * waits for its score (`pendingExternalScoring`, Results Reporting Table 2.7.7), so its sitting is
 * final only where the essay was never presented.
 *
 * And a shuffling section's sittings (`takeSitting`, `resumeTest`, `presentItem`, `suspendTest`),
 * held to the order plate's keyed digest gives ({@link shuffledOrderOf}): a section whose
 * qti-ordering shuffles presents its members in ascending HMAC-SHA-256 under its sitting's
 * decision seed over "ordering", the package and the item ref (§5.98.1, "causes the order of the
 * child elements to be randomized"), its start at the first of them, a member ahead of its turn
 * refused by "Linear in order" and one behind it by "Linear never back", a resumption at the
 * member its candidate left, and two sittings of the test under two seeds in two orders; the same
 * order among other members (a member before, two shuffling sections, one inside an unshuffled
 * section, a member after), in a nonlinear part, an individual part, and an ordering written with
 * whitespace and a comment over refs fixed false; and a shuffling section that holds a section, a
 * fixed item ref, or an ordering's extension element of any namespace is no test this runtime
 * delivers.
 *
 * And a sitting's entries (`enterTest` at a named member, `resumeTest` where its candidate left it,
 * `suspendTest`, `saveTestItem`), held to their table ({@link entryExpectedOf}): an entry presents
 * the member it names, the last presented or else the first for a resumed one, any in a nonlinear
 * part, and in a linear part only one whose every member before it was presented ("Linear in
 * order"), and in an individual one the one the candidate is on at a resumption ("In turn", moving
 * on submitting only there); a name of no member enters nothing; and a save of the member entered
 * at is accepted.
 */
import { Sha256 } from "@bjornpagen/grizzle";
import { factsDecoder } from "@bjornpagen/grizzle/compile";
import type { BrokenLaws } from "@bjornpagen/grizzle";
import { Db } from "@bjornpagen/grizzle/runtime";
import { drawn as drawnBy, exhaust, explore } from "@bjornpagen/testing/explore";
import { required, requiredInSpace } from "@bjornpagen/testing/features";
import type { Gen } from "@bjornpagen/testing/gen";
import {
  array,
  boolean,
  constant,
  element,
  int,
  map,
  oneOf,
  option,
  shuffled,
} from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, layer } from "@effect/vitest";
import { createHmac } from "node:crypto";
import { importRowsOf } from "@qti-pie/pantry/import/program.ts";
import { readPackage } from "@qti-pie/pantry/import/read.ts";
import {
  Array as Arr,
  Duration,
  Effect,
  FileSystem,
  Formatter,
  Layer,
  Option,
  Order,
  Ref,
  Result,
} from "effect";
import { DeclineReason } from "#ledger/evaluations.ts";
import { operatorTagPrefix } from "#ledger/registry/operators.ts";
import { reviewShowsOf, sessionFactsOf } from "#ledger/served-item.ts";
import type { ReviewShows, SessionControl } from "#ledger/served-item.ts";
import { judgedOfRows, responseParamsOf, responsesOfRows } from "#ledger/served-values.ts";
import type { AttemptRows, MarkRows, ValueRows } from "#ledger/served-values.ts";
import { BrowserReading } from "#ledger/sittings.ts";
import { inFlightGraceMicros, presenceGraceMicros } from "#ledger/delivery.ts";
import type { LedgerLawName } from "#ledger/laws.ts";
import { MovedSuite, movedSuiteLayer, onMovedClock } from "#ledger/test/result-clock.ts";
import { lease, SuiteLogin, suiteLayerOf } from "#ledger/test/result-suite.ts";
import { grader, ResultLevel, rubricUse } from "#ledger/test/result-level.ts";

/**
 * How long one case of any search here may run before it is stopped and reported, the suite's one
 * guard on time: a write or a read that runs past it is hung, whatever the machine's load.
 */
const caseHang = Duration.minutes(2);

/**
 * The most cases any search of the suite runs: the beacon stream's coverage bound, above every
 * exhaustive space's size.
 */
const mostCases = 128;

/**
 * Each test's own timeout, which no run of its work reaches: its search's cases and its setup at
 * the case guard, so a loaded machine finishes the search and only a hung case stops it (vitest's
 * 60 s cut the essay's search at its third case under a load of hundreds).
 */
const searchTimeout = Duration.toMillis(Duration.times(caseHang, mostCases + 1));

const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

const rubricScore = "tag:superbuilders.school,2026:qti/custom-operator/rubric-score";

const PACKAGE = "ledger-result-proof";

const ESSAY = "items/essay.xml";

const WAVE = "items/wave.xml";

const TAKE = "items/take.xml";

const OPERATORS = "items/operators.xml";

const PATTERNS = "items/patterns.xml";

const PATTERNS_LOCATED = "items/patterns-located.xml";

const PATTERNS_TEMPLATE = "items/rptemplates/patterns.xml";

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
 * The test of inherited item-session controls ({@link showingTestXml}), its members' settings
 * stated at its part, its sections and its item refs.
 */
const SHOWING_TEST = "showing.xml";

/**
 * The test of shown members ({@link shownTestXml}): one simultaneous, nonlinear part.
 */
const SHOWN_TEST = "shown.xml";

/**
 * The tests of linear navigation ({@link linearTestXmlOf}): one linear part, individual or
 * simultaneous.
 */
const LINEAR_TEST = "linear.xml";

const LINEAR_TOGETHER_TEST = "linear-together.xml";

/**
 * The test of a shuffling section ({@link shuffledTestXml}): one linear, simultaneous part whose
 * one section's qti-ordering shuffles its six item refs ({@link shuffledMembers}).
 */
const SHUFFLED_TEST = "shuffled.xml";

/**
 * The shuffled test's members as one individual part takes them ({@link shuffledTestXml},
 * FastMath's shape): one linear, individual part whose one section shuffles the same six item
 * refs.
 */
const SHUFFLED_INDIVIDUAL_TEST = "shuffled-individual.xml";

/**
 * The tests of shuffling sections among other members ({@link mixedTestXmlOf}): one linear and one
 * nonlinear simultaneous part over {@link mixedMembers}.
 */
const SHUFFLED_MIXED_TEST = "shuffled-mixed.xml";

const SHUFFLED_FREE_TEST = "shuffled-free.xml";

/**
 * The test of a shuffle written loosely ({@link shuffledLooseTestXml}): whitespace and a comment
 * inside its ordering, and each item ref writing `fixed="false"`, QTI's default (§5.6.3).
 */
const SHUFFLED_LOOSE_TEST = "shuffled-loose.xml";

/**
 * Tests of a shuffling section this runtime does not deliver: one that holds a section, one whose
 * item ref is fixed, one whose ordering holds an extension element of another namespace, and one
 * whose ordering holds QTI's own HTML `span`, which pantry reads as its declaration, no foreign
 * element (§5.98.1, §5.98.3, docs/spec-readings.md reading 61).
 */
const SHUFFLED_NESTED_TEST = "shuffled-nested.xml";

const SHUFFLED_FIXED_TEST = "shuffled-fixed.xml";

const SHUFFLED_EXTENDED_TEST = "shuffled-extended.xml";

const SHUFFLED_MARKUP_TEST = "shuffled-markup.xml";

/**
 * The human-scored essay's document ({@link humanXml}).
 */
const HUMAN = "items/human.xml";

/**
 * The bounded items ({@link boundedXml}), each the document of the item ref of its own identifier
 * in the outcome bounds test: SCORE's declared bounds and BONUS's maximum where it declares
 * one.
 */
const BOUNDED_A = "items/bounded-a.xml";

const BOUNDED_B = "items/bounded-b.xml";

const BOUNDED_A_REF = "bounded-a";

const BOUNDED_B_REF = "bounded-b";

/**
 * The bounded items' SCORE bounds, {@link BOUNDED_A_REF}'s BONUS maximum (its item declares one,
 * {@link BOUNDED_B_REF}'s none), and the weight W {@link BOUNDED_A_REF}'s item ref states.
 */
const A_SCORE = { maximum: 2, minimum: 0 } as const;

const B_SCORE = { maximum: 3, minimum: -1 } as const;

const A_BONUS_MAXIMUM = 5;

const A_WEIGHT = 2;

/**
 * The outcome bounds test ({@link outcomeBoundsTestXml}): its outcome processing reads its
 * members' declared bounds through qti-outcome-maximum and qti-outcome-minimum.
 */
const OUTCOME_BOUNDS_TEST = "outcome-bounds.xml";

/**
 * The item ref the shown test names its human-scored essay by, and that item's own identifier.
 */
const HUMAN_REF = "human";

/**
 * The item ref a test names its first member by, the one its start presents, and that item's own
 * identifier: QTI holds a ref's identifier to its item's (information model §4.1.1, pantry's "Item
 * ref identifier").
 */
const MEMBER = "member";

/**
 * The item ref a test names its second member by, and that item's own identifier, which a response
 * case enters at and then saves: the end alone (`endTest`, no close) attempts
 * nothing, so a save of it after the end reaches the laws, where a save of a member the end closed
 * finds no open item session and writes nothing; and a save before the first candidate session is
 * of a member never presented, which "Shown before saved" refuses too.
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
 * The essay: an extended-text response its own rule finds empty, NULL or nothing but whitespace and
 * markup (`is-null(normalize-space(markup-text(RESPONSE)))`, the converter's), scoring SCORE 0 and
 * reaching no draw, else scored by two draws of `rubric-score`, SCORE the better reply.
 */
const essayXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="essay" title="essay" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>${String(essayMaximum)}</qti-value></qti-default-value></qti-outcome-declaration><qti-outcome-declaration identifier="DRAW_1" cardinality="record" view="author"/><qti-outcome-declaration identifier="DRAW_2" cardinality="record" view="author"/><qti-item-body><qti-rubric-block use="${rubricUse}" view="scorer" id="${RUBRIC}"><qti-content-body><p>Award 2 for a force named with its direction.</p></qti-content-body></qti-rubric-block><qti-extended-text-interaction response-identifier="RESPONSE"/></qti-item-body><qti-response-processing><qti-response-condition><qti-response-if><qti-is-null><qti-custom-operator class="normalize-space" definition="${operatorTagPrefix}normalize-space"><qti-custom-operator class="markup-text" definition="${operatorTagPrefix}markup-text"><qti-variable identifier="RESPONSE"/></qti-custom-operator></qti-custom-operator></qti-is-null><qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">0</qti-base-value></qti-set-outcome-value></qti-response-if><qti-response-else>${draw(1)}${draw(2)}<qti-set-outcome-value identifier="SCORE"><qti-max><qti-multiple><qti-field-value field-identifier="score"><qti-variable identifier="DRAW_1"/></qti-field-value><qti-field-value field-identifier="score"><qti-variable identifier="DRAW_2"/></qti-field-value></qti-multiple></qti-max></qti-set-outcome-value></qti-response-else></qti-response-condition></qti-response-processing>
</qti-assessment-item>`;

/**
 * The wave: an essay whose second draw only its first draw's reply lets the processing reach, at a
 * score of 1 or more, SCORE then the second draw's score; under 1, SCORE 0 and the second draw
 * never reached. The first run demands the first draw alone; the run after its reply demands the
 * second, a later wave.
 */
const waveXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="wave" title="wave" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>${String(essayMaximum)}</qti-value></qti-default-value></qti-outcome-declaration><qti-outcome-declaration identifier="DRAW_1" cardinality="record" view="author"/><qti-outcome-declaration identifier="DRAW_2" cardinality="record" view="author"/><qti-item-body><qti-rubric-block use="${rubricUse}" view="scorer" id="${RUBRIC}"><qti-content-body><p>Award 2 for a force named with its direction.</p></qti-content-body></qti-rubric-block><qti-extended-text-interaction response-identifier="RESPONSE"/></qti-item-body><qti-response-processing>${draw(1)}<qti-response-condition><qti-response-if><qti-gte><qti-field-value field-identifier="score"><qti-variable identifier="DRAW_1"/></qti-field-value><qti-base-value base-type="float">1</qti-base-value></qti-gte>${draw(2)}<qti-set-outcome-value identifier="SCORE"><qti-field-value field-identifier="score"><qti-variable identifier="DRAW_2"/></qti-field-value></qti-set-outcome-value></qti-response-if><qti-response-else><qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">0</qti-base-value></qti-set-outcome-value></qti-response-else></qti-response-condition></qti-response-processing>
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
 * A point to OUTCOME where RESPONSE matches a qti-pattern-match's `pattern` (QTI 3.0.1 §5.104.1:
 * "The syntax for the regular expression language is as defined in Appendix F of [XSCHEMA, 01]").
 *
 * @param outcome - The outcome the point sets.
 * @param pattern - The pattern as written.
 * @returns The rule's markup.
 */
const patternPoint = (outcome: string, pattern: string) =>
  `<qti-response-condition><qti-response-if><qti-pattern-match pattern="${pattern}"><qti-variable identifier="RESPONSE"/></qti-pattern-match><qti-set-outcome-value identifier="${outcome}"><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value></qti-response-if></qti-response-condition>`;

/**
 * A pattern is a StringOrVariableRef (QTI 3.0.1 §9.3.4: "The type used for attributes of string
 * type that may be replaced with the value of a template or outcome variable of base type string
 * and single cardinality. If a string appears to be a reference to a template or outcome variable
 * but there is no variable with the given name it should be treated simply as string value"). The
 * patterns item: DECLARED's point by `{PAT}`, PAT a declared outcome holding `[0-9]+`, so a run
 * matches RESPONSE against PAT's value; UNDECLARED's by `{NOPE}`, which names no variable, so it
 * is the string `{NOPE}`, no Appendix F expression (a `{` opens no count), which matches nothing:
 * the condition is NULL and no point is set.
 */
const patternsXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="patterns" title="patterns" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/><qti-outcome-declaration identifier="PAT" cardinality="single" base-type="string"><qti-default-value><qti-value>[0-9]+</qti-value></qti-default-value></qti-outcome-declaration><qti-outcome-declaration identifier="DECLARED" cardinality="single" base-type="float"><qti-default-value><qti-value>0</qti-value></qti-default-value></qti-outcome-declaration><qti-outcome-declaration identifier="UNDECLARED" cardinality="single" base-type="float"><qti-default-value><qti-value>0</qti-value></qti-default-value></qti-outcome-declaration><qti-item-body><p><qti-text-entry-interaction response-identifier="RESPONSE"/></p></qti-item-body><qti-response-processing>${patternPoint("DECLARED", "{PAT}")}${patternPoint("UNDECLARED", "{NOPE}")}</qti-response-processing>
</qti-assessment-item>`;

/**
 * The located template the located patterns item runs (QTI 3.0.1 §4.6.2, template-location): its
 * `{PAT}` names a variable of the item that runs it, which declares PAT, so a run matches RESPONSE
 * against the item's PAT (§4.6.1: the rules obtained from the template are used instead of the
 * item's own).
 */
const patternsTemplateXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-response-processing xmlns="${asi}">${patternPoint("SCORE", "{PAT}")}</qti-response-processing>`;

/**
 * The located patterns item: PAT `[a-z]+`, its response processing the located template's.
 */
const patternsLocatedXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="patterns-located" title="patterns-located" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/><qti-outcome-declaration identifier="PAT" cardinality="single" base-type="string"><qti-default-value><qti-value>[a-z]+</qti-value></qti-default-value></qti-outcome-declaration><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>0</qti-value></qti-default-value></qti-outcome-declaration><qti-item-body><p><qti-text-entry-interaction response-identifier="RESPONSE"/></p></qti-item-body><qti-response-processing template-location="rptemplates/patterns.xml"/>
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
 * The human-scored essay: an extended-text response whose SCORE a person gives, declared
 * `external-scored` `human` ("a human must score the Item", Table 8.21), which no response
 * processing of its own sets.
 */
const humanXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="${HUMAN_REF}" title="${HUMAN_REF}" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" external-scored="human"/><qti-item-body><qti-extended-text-interaction response-identifier="RESPONSE"/></qti-item-body>
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
 * The test of inherited item-session controls: one individual, nonlinear part, whose own control
 * states max-attempts 1 and show-solution true; in it an outer section, whose control states
 * show-feedback true, holding {@link MEMBER}, whose own control states show-feedback and
 * show-solution false, then {@link SAVED}, under no control of its own, then an inner section,
 * whose control states show-feedback false, holding {@link MEMBER_REF}, under none, and
 * {@link DRAFT_REF}, whose own states max-attempts 0. Each setting in force is the nearest scope's
 * that writes it (§7.19), so MEMBER is shown by its own, SAVED by the outer section's feedback and
 * the part's solution, MEMBER_REF by the inner section's feedback over the outer's, and DRAFT_REF
 * takes an attempt after each.
 */
const showingTestXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="showing" title="showing"><qti-test-part identifier="part" navigation-mode="nonlinear" submission-mode="individual"><qti-item-session-control max-attempts="1" show-solution="true"/><qti-assessment-section identifier="outer" title="outer" visible="true"><qti-item-session-control show-feedback="true"/>${refXml(MEMBER, SHORT, '<qti-item-session-control show-feedback="false" show-solution="false"/>')}${refXml(SAVED, OTHER, "")}<qti-assessment-section identifier="inner" title="inner" visible="true"><qti-item-session-control show-feedback="false"/>${refXml(MEMBER_REF, MEMBER_MIN, "")}${refXml(DRAFT_REF, DRAFT_MIN, '<qti-item-session-control max-attempts="0"/>')}</qti-assessment-section></qti-assessment-section></qti-test-part>
</qti-assessment-test>`;

/**
 * A test of linear navigation: one linear part of two text entries, {@link MEMBER} first, then
 * {@link SAVED}.
 *
 * @param identifier - The test's identifier.
 * @param submission - The part's submission mode.
 */
const linearTestXmlOf = (identifier: string, submission: "individual" | "simultaneous") =>
  `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="${identifier}" title="${identifier}"><qti-test-part identifier="part" navigation-mode="linear" submission-mode="${submission}"><qti-assessment-section identifier="section" title="section" visible="true">${refXml(MEMBER, SHORT, "")}${refXml(SAVED, OTHER, "")}</qti-assessment-section></qti-test-part>
</qti-assessment-test>`;

/**
 * The shuffled test's members in document order, each its item ref and its item's document: every
 * item of the package that is neither adaptive nor templated, each once.
 */
const shuffledMembers = [
  { path: SHORT, ref: MEMBER },
  { path: OTHER, ref: SAVED },
  { path: MEMBER_MIN, ref: MEMBER_REF },
  { path: DRAFT_MIN, ref: DRAFT_REF },
  { path: ESSAY_MIN, ref: ESSAY_REF },
  { path: HUMAN, ref: HUMAN_REF },
] as const;

/**
 * The item resources every test over the six members depends on.
 */
const sixMembers = ["short", "other", "member-min", "draft-min", "essay-min", HUMAN_REF] as const;

/**
 * A test of one linear part of one section, holding `content`.
 *
 * @param identifier - The test's identifier.
 * @param content - The section's content.
 * @param submission - The part's submission mode.
 */
const shuffledSectionXmlOf = (
  identifier: string,
  content: string,
  submission: "individual" | "simultaneous" = "simultaneous",
) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="${identifier}" title="${identifier}"><qti-test-part identifier="part" navigation-mode="linear" submission-mode="${submission}"><qti-assessment-section identifier="section" title="section" visible="true">${content}</qti-assessment-section></qti-test-part>
</qti-assessment-test>`;

const shuffledContent = `<qti-ordering shuffle="true"/>${shuffledMembers.map(({ path, ref }) => refXml(ref, path, "")).join("")}`;

const shuffledTestXml = shuffledSectionXmlOf("shuffled", shuffledContent);

const shuffledIndividualTestXml = shuffledSectionXmlOf(
  "shuffled-individual",
  shuffledContent,
  "individual",
);

/**
 * The mixed tests' members in document order, each its item ref, its item's document, and `block`,
 * the shuffling section that holds it, if one does: {@link MEMBER} alone, then the section `first`
 * shuffling {@link SAVED} and {@link MEMBER_REF}, then an unshuffled section `middle` holding the
 * section `second`, which shuffles {@link DRAFT_REF} and {@link ESSAY_REF}, and then
 * {@link HUMAN_REF}.
 */
const mixedMembers = [
  { block: undefined, path: SHORT, ref: MEMBER },
  { block: "first", path: OTHER, ref: SAVED },
  { block: "first", path: MEMBER_MIN, ref: MEMBER_REF },
  { block: "second", path: DRAFT_MIN, ref: DRAFT_REF },
  { block: "second", path: ESSAY_MIN, ref: ESSAY_REF },
  { block: undefined, path: HUMAN, ref: HUMAN_REF },
] as const;

/**
 * A test of one simultaneous part over {@link mixedMembers}: a shuffling section after a member, two
 * shuffling sections one after the other, the second inside an unshuffled section, and a member
 * after them.
 *
 * @param identifier - The test's identifier.
 * @param navigation - The part's navigation mode.
 */
const mixedTestXmlOf = (identifier: string, navigation: "linear" | "nonlinear") =>
  `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="${identifier}" title="${identifier}"><qti-test-part identifier="part" navigation-mode="${navigation}" submission-mode="simultaneous"><qti-assessment-section identifier="top" title="top" visible="true">${refXml(MEMBER, SHORT, "")}<qti-assessment-section identifier="first" title="first" visible="true"><qti-ordering shuffle="true"/>${refXml(SAVED, OTHER, "")}${refXml(MEMBER_REF, MEMBER_MIN, "")}</qti-assessment-section><qti-assessment-section identifier="middle" title="middle" visible="true"><qti-assessment-section identifier="second" title="second" visible="true"><qti-ordering shuffle="true"/>${refXml(DRAFT_REF, DRAFT_MIN, "")}${refXml(ESSAY_REF, ESSAY_MIN, "")}</qti-assessment-section>${refXml(HUMAN_REF, HUMAN, "")}</qti-assessment-section></qti-assessment-section></qti-test-part>
</qti-assessment-test>`;

/**
 * The loose test's members in document order.
 */
const looseMembers = [
  { block: "section", path: SHORT, ref: MEMBER },
  { block: "section", path: OTHER, ref: SAVED },
] as const;

const shuffledLooseTestXml = shuffledSectionXmlOf(
  "shuffled-loose",
  `<qti-ordering shuffle="true">
  <!-- each sitting draws its own order -->
</qti-ordering>${looseMembers.map(({ path, ref }) => `<qti-assessment-item-ref identifier="${ref}" href="${path}" fixed="false"/>`).join("")}`,
);

const shuffledNestedTestXml = shuffledSectionXmlOf(
  "shuffled-nested",
  `<qti-ordering shuffle="true"/>${refXml(MEMBER, SHORT, "")}<qti-assessment-section identifier="inner" title="inner" visible="true">${refXml(SAVED, OTHER, "")}</qti-assessment-section>`,
);

const shuffledFixedTestXml = shuffledSectionXmlOf(
  "shuffled-fixed",
  `<qti-ordering shuffle="true"/><qti-assessment-item-ref identifier="${MEMBER}" href="${SHORT}" fixed="true"/>${refXml(SAVED, OTHER, "")}`,
);

const shuffledExtendedTestXml = shuffledSectionXmlOf(
  "shuffled-extended",
  `<qti-ordering shuffle="true"><by:rank xmlns:by="urn:example:ordering"/></qti-ordering>${refXml(MEMBER, SHORT, "")}${refXml(SAVED, OTHER, "")}`,
);

const shuffledMarkupTestXml = shuffledSectionXmlOf(
  "shuffled-markup",
  `<qti-ordering shuffle="true"><span>by rank</span></qti-ordering>${refXml(MEMBER, SHORT, "")}${refXml(SAVED, OTHER, "")}`,
);

/**
 * The test of shown members: one simultaneous, nonlinear part, {@link MEMBER} first, the one its
 * start presents, then the human-scored essay {@link HUMAN_REF}.
 */
const shownTestXml = controlledTestXml(
  "shown",
  "simultaneous",
  "",
  `${refXml(MEMBER, SHORT, "")}${refXml(HUMAN_REF, HUMAN, "")}`,
);

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
 * A bounded item: a text entry whose SCORE declares `normal-minimum` and `normal-maximum`, and
 * whose BONUS declares `normal-maximum` where `bonusMaximum` gives one; nothing processes its
 * response.
 *
 * @param identifier - The item's identifier.
 * @param minimum - SCORE's normal-minimum.
 * @param maximum - SCORE's normal-maximum.
 * @param bonusMaximum - BONUS's normal-maximum, or none.
 */
const boundedXml = (
  identifier: string,
  minimum: number,
  maximum: number,
  bonusMaximum: Option.Option<number>,
) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="${identifier}" title="${identifier}" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" normal-minimum="${String(minimum)}" normal-maximum="${String(maximum)}"/><qti-outcome-declaration identifier="BONUS" cardinality="single" base-type="float"${Option.match(bonusMaximum, { onNone: () => "", onSome: (bonus) => ` normal-maximum="${String(bonus)}"` })}/><qti-item-body><p><qti-text-entry-interaction response-identifier="RESPONSE"/></p></qti-item-body>
</qti-assessment-item>`;

/**
 * The outcome bounds test: one individual, nonlinear part of {@link BOUNDED_A_REF}, weighted 2 by
 * W, and {@link BOUNDED_B_REF}, which states no W; its outcome processing sets, from its members'
 * declared bounds, MAX_WEIGHTED the sum of SCORE's maxima weighted by W, MIN_WEIGHTED the sum of
 * SCORE's minima weighted by W, MAX the sum of SCORE's maxima, and BONUS_MAX_NULL whether BONUS's
 * maxima are NULL.
 */
const outcomeBoundsTestXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="outcome-bounds" title="outcome-bounds"><qti-outcome-declaration identifier="MAX_WEIGHTED" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="MIN_WEIGHTED" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="MAX" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="BONUS_MAX_NULL" cardinality="single" base-type="boolean"/><qti-test-part identifier="part" navigation-mode="nonlinear" submission-mode="individual"><qti-assessment-section identifier="section" title="section" visible="true"><qti-assessment-item-ref identifier="${BOUNDED_A_REF}" href="${BOUNDED_A}"><qti-weight identifier="W" value="${String(A_WEIGHT)}"/></qti-assessment-item-ref><qti-assessment-item-ref identifier="${BOUNDED_B_REF}" href="${BOUNDED_B}"/></qti-assessment-section></qti-test-part><qti-outcome-processing><qti-set-outcome-value identifier="MAX_WEIGHTED"><qti-sum><qti-outcome-maximum outcome-identifier="SCORE" weight-identifier="W"/></qti-sum></qti-set-outcome-value><qti-set-outcome-value identifier="MIN_WEIGHTED"><qti-sum><qti-outcome-minimum outcome-identifier="SCORE" weight-identifier="W"/></qti-sum></qti-set-outcome-value><qti-set-outcome-value identifier="MAX"><qti-sum><qti-outcome-maximum outcome-identifier="SCORE"/></qti-sum></qti-set-outcome-value><qti-set-outcome-value identifier="BONUS_MAX_NULL"><qti-is-null><qti-outcome-maximum outcome-identifier="BONUS"/></qti-is-null></qti-set-outcome-value></qti-outcome-processing>
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
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="${PACKAGE}"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="essay" type="imsqti_item_xmlv3p0" href="${ESSAY}"><file href="${ESSAY}"/></resource><resource identifier="wave" type="imsqti_item_xmlv3p0" href="${WAVE}"><file href="${WAVE}"/></resource><resource identifier="take" type="imsqti_item_xmlv3p0" href="${TAKE}"><file href="${TAKE}"/></resource><resource identifier="operators" type="imsqti_item_xmlv3p0" href="${OPERATORS}"><file href="${OPERATORS}"/></resource><resource identifier="patterns" type="imsqti_item_xmlv3p0" href="${PATTERNS}"><file href="${PATTERNS}"/></resource><resource identifier="patterns-located" type="imsqti_item_xmlv3p0" href="${PATTERNS_LOCATED}"><file href="${PATTERNS_LOCATED}"/><dependency identifierref="patterns-template"/></resource><resource identifier="patterns-template" type="imsqti_rptemplate_xmlv3p0" href="${PATTERNS_TEMPLATE}"><file href="${PATTERNS_TEMPLATE}"/></resource><resource identifier="draw-adaptive" type="imsqti_item_xmlv3p0" href="${drawPathOf(true)}"><file href="${drawPathOf(true)}"/></resource><resource identifier="draw" type="imsqti_item_xmlv3p0" href="${drawPathOf(false)}"><file href="${drawPathOf(false)}"/></resource><resource identifier="short" type="imsqti_item_xmlv3p0" href="${SHORT}"><file href="${SHORT}"/></resource><resource identifier="other" type="imsqti_item_xmlv3p0" href="${OTHER}"><file href="${OTHER}"/></resource>${[ESSAY_MIN, MEMBER_MIN, DRAFT_MIN, HUMAN].map(itemResource).join("")}${tests.map(([path]) => testResource(path, ["short", "other"])).join("")}${controlTests.map(([path]) => testResource(path, ["essay-min", "member-min", "draft-min", "other"])).join("")}${testResource(SHOWING_TEST, ["short", "other", "member-min", "draft-min"])}${testResource(SHOWN_TEST, ["short", HUMAN_REF])}${testResource(LINEAR_TEST, ["short", "other"])}${testResource(LINEAR_TOGETHER_TEST, ["short", "other"])}${[SHUFFLED_TEST, SHUFFLED_INDIVIDUAL_TEST, SHUFFLED_MIXED_TEST, SHUFFLED_FREE_TEST].map((path) => testResource(path, sixMembers)).join("")}${[SHUFFLED_LOOSE_TEST, SHUFFLED_NESTED_TEST, SHUFFLED_FIXED_TEST, SHUFFLED_EXTENDED_TEST, SHUFFLED_MARKUP_TEST].map((path) => testResource(path, ["short", "other"])).join("")}${[BOUNDED_A, BOUNDED_B].map(itemResource).join("")}${testResource(OUTCOME_BOUNDS_TEST, [BOUNDED_A_REF, BOUNDED_B_REF])}</resources></manifest>`;

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
 * The empty essays: whitespace alone, and markup alone, which the item's own empty-essay rule finds
 * empty, so its response processing scores them 0 and reaches no draw.
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
 * The empty family: an essay of whitespace or markup alone, which its response processing scores 0
 * at its submission, the run reaching no draw, so nothing is requested and nothing waits; and a
 * person's value or none, of a group that does not wait.
 */
const emptySpace: Gen<Case> = (source) => {
  const response = source.draw(element(emptyResponses));
  const person = source.draw(boolean) ? Option.some(personScore) : Option.none();

  return {
    answered: true,
    evaluations: [],
    family: "empty",
    history: false,
    name: `empty ${JSON.stringify(response)} ${Formatter.format(person)}`,
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
 * Whether the attempt's rubric group is a person's to score: every draw evaluated and declined.
 * Such a group waits (`AwaitingHumanEvaluation`) until a person gives a value.
 */
const allDeclined = (held: Held) =>
  held.evaluated.every((e) => Option.exists(e, ({ result }) => result === "declined"));

/**
 * Whether the item's own rule finds the case's essay empty: NULL, or nothing but whitespace and
 * markup once its markup is read as text (`is-null(normalize-space(markup-text(RESPONSE)))`). Its
 * response processing then scores it 0 and reaches no draw.
 *
 * @param c - The case.
 */
const blankOf = (c: Case) => !c.answered || emptyResponses.some((empty) => empty === c.response);

/**
 * Whether the attempt's response processing waits: an essay its rule does not find empty, a draw
 * the run demanded and unevaluated, or every draw declined and no person's value; a processed
 * attempt, history's among them, waits for nothing, and an empty essay is graded at its
 * submission.
 */
const waitsOf = (held: Held) =>
  !held.case.history &&
  !blankOf(held.case) &&
  (held.evaluated.some(Option.isNone) || (allDeclined(held) && Option.isNone(held.person)));

/**
 * The rubric groups of the attempt waiting for a person's value.
 */
const awaitingOf = (held: Held): readonly string[] =>
  waitsOf(held) && allDeclined(held) && Option.isNone(held.person) ? [RUBRIC] : [];

/**
 * SCORE as grading sets it once nothing waits: 0 for an essay its rule finds empty; else `qti-max`
 * over `qti-multiple` of the draws' scores, NULL members ignored: the better reply, else the
 * person's value every declined draw of the group takes; history's 2, as imported.
 */
const scoreOf = (held: Held): Option.Option<number> => {
  if (held.case.history) {
    return Option.some(essayMaximum);
  }

  if (blankOf(held.case)) {
    return Option.some(0);
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
  | Readonly<{ kind: "refused"; law: "Reply within maximum" | "Human within maximum" }>
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
 * - **Waiting** (ASI Table 5.37; review M6, route 1): an unprocessed essay its rule does not find
 *   empty waits on each draw its run demanded and no evaluation answered, and on its rubric group
 *   when every draw declined and no person's value stands. An empty one waits for nothing: its run
 *   reaches no draw. A person's value answers only a group that waits: of any other it records
 *   nothing.
 * - **Grading** (Bjorn, 2026-11-18: "grading MUST be done in the same database transaction"): an
 *   attempt is processed by the write after which nothing of it waits, in that write's own
 *   transaction, and by no earlier one.
 * - **Operands**: each draw of an essay its rule does not find empty and the grader's run demands,
 *   its response, rubric group, grader in force and maximum; none of an empty one, never requested,
 *   and none of a history attempt, which nothing grades.
 * - **Values and credit**: grading's SCORE and MAXSCORE, SCORE 0 for an essay its rule finds empty;
 *   the credit none at 0, full at the maximum, partial between.
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
        steps.push({ kind: "refused", law: "Reply within maximum" });

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
        steps.push({ kind: "refused", law: "Human within maximum" });

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
      applications: unprocessed ? evaluated.filter(Option.isNone).length : 0,
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
      operands:
        blankOf(c) || c.history
          ? []
          : Array.from(
              { length: essayDraws },
              () => [c.response, RUBRIC, grader.version, essayMaximum] as const,
            ),
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
  "refused:Reply within maximum",
  "refused:Human within maximum",
  "held at the maximum",
  "an empty essay scored 0 at its submission, never requested",
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
      ...(c.family === "bounds" ? ["held at the maximum" as const] : []),
      ...(c.family === "empty" &&
      want.status === "final" &&
      want.operands.length === 0 &&
      want.applications === 0
        ? ["an empty essay scored 0 at its submission, never requested" as const]
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
 * The one package, the essay, the templated item, the operators item, the draw item adaptive and
 * not, the tests of the text entries, the tests of item-session controls with their items, and the
 * test of shown members with its human-scored essay, published through the suite's login.
 */
const published = Effect.gen(function* publish() {
  const { suite } = yield* SuiteLogin;
  const fs = yield* FileSystem.FileSystem;
  const dir = yield* fs.makeTempDirectoryScoped({ prefix: `${PACKAGE}-` });
  yield* fs.makeDirectory(`${dir}/items`, { recursive: true });
  yield* fs.writeFileString(`${dir}/imsmanifest.xml`, manifest);
  yield* fs.writeFileString(`${dir}/${ESSAY}`, essayXml);
  yield* fs.writeFileString(`${dir}/${WAVE}`, waveXml);
  yield* fs.writeFileString(`${dir}/${TAKE}`, takeXml);
  yield* fs.writeFileString(`${dir}/${OPERATORS}`, operatorsXml);
  yield* fs.makeDirectory(`${dir}/items/rptemplates`, { recursive: true });
  yield* fs.writeFileString(`${dir}/${PATTERNS}`, patternsXml);
  yield* fs.writeFileString(`${dir}/${PATTERNS_LOCATED}`, patternsLocatedXml);
  yield* fs.writeFileString(`${dir}/${PATTERNS_TEMPLATE}`, patternsTemplateXml);
  for (const adaptive of [true, false]) {
    yield* fs.writeFileString(`${dir}/${drawPathOf(adaptive)}`, drawXmlOf(adaptive));
  }
  yield* fs.writeFileString(`${dir}/${SHORT}`, textEntryXml(MEMBER));
  yield* fs.writeFileString(`${dir}/${OTHER}`, textEntryXml(SAVED));
  for (const { path, ref } of controlsMembers.filter((member) => member.path !== OTHER)) {
    yield* fs.writeFileString(`${dir}/${path}`, minimumXml(ref));
  }
  yield* fs.writeFileString(`${dir}/${HUMAN}`, humanXml);
  yield* fs.writeFileString(
    `${dir}/${BOUNDED_A}`,
    boundedXml(BOUNDED_A_REF, A_SCORE.minimum, A_SCORE.maximum, Option.some(A_BONUS_MAXIMUM)),
  );
  yield* fs.writeFileString(
    `${dir}/${BOUNDED_B}`,
    boundedXml(BOUNDED_B_REF, B_SCORE.minimum, B_SCORE.maximum, Option.none()),
  );
  for (const [path, xml] of [
    ...tests,
    ...controlTests,
    [SHOWING_TEST, showingTestXml],
    [SHOWN_TEST, shownTestXml],
    [LINEAR_TEST, linearTestXmlOf("linear", "individual")],
    [LINEAR_TOGETHER_TEST, linearTestXmlOf("linear-together", "simultaneous")],
    [SHUFFLED_TEST, shuffledTestXml],
    [SHUFFLED_INDIVIDUAL_TEST, shuffledIndividualTestXml],
    [SHUFFLED_MIXED_TEST, mixedTestXmlOf("shuffled-mixed", "linear")],
    [SHUFFLED_FREE_TEST, mixedTestXmlOf("shuffled-free", "nonlinear")],
    [SHUFFLED_LOOSE_TEST, shuffledLooseTestXml],
    [SHUFFLED_NESTED_TEST, shuffledNestedTestXml],
    [SHUFFLED_FIXED_TEST, shuffledFixedTestXml],
    [SHUFFLED_EXTENDED_TEST, shuffledExtendedTestXml],
    [SHUFFLED_MARKUP_TEST, shuffledMarkupTestXml],
    [OUTCOME_BOUNDS_TEST, outcomeBoundsTestXml],
  ]) {
    yield* fs.writeFileString(`${dir}/${path}`, xml);
  }

  const read = yield* readPackage(dir, PACKAGE);
  const rows = yield* importRowsOf(read);
  const db = yield* Db.open(suite.roles.result_runner, {});
  const outcome = yield* db.workload.publish.once({
    facts: { insert: rows.insert },
    params: { package: rows.package },
  });
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
 * The control an item stage of the suite is delivered under where its case states none: edullm's
 * `direct` policy's, one attempt, its feedback once closed, no solution and no validation.
 */
const directControl = {
  maxAttempts: 1n,
  showFeedback: true,
  showSolution: false,
  validateResponses: false,
} as const;

/**
 * The decision seed of every sitting the suite takes through the test runtime's take, from which
 * its members' processing seeds derive (the machine's `processing_seed`).
 */
const DECISION = "7d3c2a4e-58b1-4f6a-9c0d-2b8e5f1a6c34";

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
 * The laws a refusal names. The suite's login is over the composition's top level, so every law its
 * writes can break is of its own levels, named in `laws` (`every`, `first` or `some`), a key's or a
 * check's over a stored relation at COMMIT among them (grizzle 380c1a7d6); a refusal by a level
 * above it cannot arise, and fails the case.
 *
 * @param refused The refusal.
 * @returns The laws it names.
 */
const refusedLawsOf = (refused: BrokenLaws) =>
  refused.kind === "above"
    ? assert.fail(`a refusal by a level above the suite's: ${Formatter.format(refused)}`)
    : refused.laws;

/**
 * Whether a refusal names one of the ledger's laws, each by the name its catalog gives it
 * (`#ledger/laws.ts`).
 *
 * @param refused The refusal.
 * @param names The laws' names.
 * @returns Whether the refusal names one of them.
 */
const refusedBy = (refused: BrokenLaws, ...names: readonly LedgerLawName[]) =>
  refusedLawsOf(refused).some(({ law }) => names.some((name) => law.entry.name === name));

/**
 * A read's float outcomes in the variable order the tables state them: floatsOf reads a union of
 * two rules (a snapshot's value, an assertion's), whose key grizzle proves is its whole heading, so
 * it arrives ordered by value before variable, no order a table states.
 *
 * @param floats - Each outcome's variable and value.
 * @returns Them by variable.
 */
const byVariableOf = (floats: readonly (readonly [string, number])[]) =>
  Arr.sort(
    floats,
    Order.mapInput(Order.String, (row: readonly [string, number]) => row[0]),
  );

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
    yield* db.workload.begin.once({
      facts: {
        insert: {
          StageControl: rowsOf("StageControl", [{ child, stage, ...directControl }]),
        },
      },
      params: { child, package: PACKAGE, path: ESSAY, seed: SEED, stage },
    });
    yield* db.workload.facts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", [key]),
          ProcessedAttempt: rowsOf(
            "ProcessedAttempt",
            c.history ? [{ ...key, completionStatus: "completed" }] : [],
          ),
          ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...key, kind: "attempt" }]),
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
    const essayDrawRows = yield* db.workload.drawsOf.once({
      facts: {},
      params: { package: PACKAGE },
    });
    const operators = Arr.dedupe(
      Arr.fromIterable(essayDrawRows)
        .filter((row) => row.path === ESSAY)
        .map((row) => row.operator),
    );
    assert.strictEqual(
      Arr.fromIterable(waitingRows).length,
      !blankOf(c) && !c.history ? essayDraws : 0,
      `${c.name}: PendingApplication once the attempt is graded at its submission, none of an empty essay's or history's`,
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
            refusedBy(written.failure.refused, want.law),
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
    const creditRows = yield* db.workload.creditsOf.once({ facts: {}, params: key });
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
      Arr.fromIterable(drawRows)
        .filter((row) => row.path === ESSAY)
        .map((row) => row.draw),
      ["1", "2"],
      `${c.name}: ApplicationDraw, the essay's two literal draws`,
    );
    assert.deepStrictEqual<unknown>(
      byVariableOf(Arr.fromIterable(floatRows).map((row) => [row.variable, row.value] as const)),
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
 * one identifier template processing sets, it sets to NULL. Each list is in the order a read
 * returns it, its key's: by kind as `SessionValueKind` lists them (template, correct, default),
 * then by variable.
 *
 * @param t - The T the machine's run draws.
 */
const takeExpectedOf = (t: bigint): TakeExpected => {
  const setsDefault = t > 5n;
  const nulls = t % 2n === 0n;

  return {
    headers: [
      ["template", "T"],
      ["correct", "RESPONSE"],
      ...(nulls ? [["default", "FEEDBACK"] as const] : []),
      ...(setsDefault ? [["default", "RESPONSE"] as const] : []),
    ],
    identifiers: [],
    integers: [
      ["template", "T", t],
      ["correct", "RESPONSE", t],
      ...(setsDefault ? [["default", "RESPONSE", t] as const] : []),
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
 * One take: a fresh child's session of the templated item under its seed, begun by its take
 * (`begin`: its host rows, then `takeValuesOf` over the session's sitting, in one transaction);
 * the machine's own run of its sitting's template processing, as the take ran it, its T one value
 * from 2 to 9; and what the take stored, every header and value row, held to the table for that T.
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
    const taken = yield* db.workload.begin.once({
      facts: {
        insert: {
          StageControl: rowsOf("StageControl", [{ child, stage, ...directControl }]),
        },
      },
      params: { child, package: PACKAGE, path: TAKE, seed: seedOf(c.seed), stage },
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the take writes what its run set`);

    const atChild = { facts: {}, params: { child } };
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

    const want = takeExpectedOf(t);
    const headerRows = yield* db.workload.takenHeadersOf.once(atChild);
    const integerRows = yield* db.workload.takenIntegersOf.once(atChild);
    const identifierRows = yield* db.workload.takenIdentifiersOf.once(atChild);
    assert.deepStrictEqual<unknown>(
      {
        headers: Arr.fromIterable(headerRows).map((row) => [row.kind, row.variable]),
        identifiers: Arr.fromIterable(identifierRows).map((row) => [
          row.kind,
          row.variable,
          row.value,
        ]),
        integers: Arr.fromIterable(integerRows).map((row) => [row.kind, row.variable, row.value]),
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
    yield* db.workload.begin.once({
      facts: {
        insert: {
          StageControl: rowsOf("StageControl", [{ child, stage, ...directControl }]),
        },
      },
      params: { child, package: PACKAGE, path: OPERATORS, seed: SEED, stage },
    });
    yield* db.workload.facts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", [key]),
          ProcessedAttempt: rowsOf("ProcessedAttempt", []),
          ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...key, kind: "attempt" }]),
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
    const creditRows = yield* db.workload.creditsOf.once({ facts: {}, params: key });
    assert.deepStrictEqual<unknown>(
      {
        credit: Arr.fromIterable(creditRows).map((row) => [row.earned, row.maximum, row.kind]),
        floats: byVariableOf(
          Arr.fromIterable(floatRows).map((row) => [row.variable, row.value] as const),
        ),
        status: Arr.fromIterable(statusRows).map((row) => row.status),
      },
      { credit: want.credit, floats: want.floats, status: ["final"] },
      `${c.name}: graded through the ledger's own grading, its operators given the registry's tables`,
    );
  });

/**
 * A patterns case: a fresh child's attempt of the patterns item or the located patterns item, its
 * RESPONSE digits or letters.
 */
type PatternsCase = Readonly<{
  answer: "digits" | "letters";
  item: "item" | "located";
  name: string;
}>;

/**
 * What each case answers.
 */
const patternAnswers = { digits: "42", letters: "abc" } as const;

/**
 * Every patterns case: each item with each answer.
 */
const patternsSpace: Gen<PatternsCase> = (source) => {
  const item = source.draw(element(["item", "located"] as const));
  const answer = source.draw(element(["digits", "letters"] as const));

  return { answer, item, name: `patterns ${item} ${answer}` };
};

/**
 * The patterns table (QTI 3.0.1 §9.3.4, §5.104.1): on the patterns item, DECLARED's point where
 * RESPONSE is in PAT's `[0-9]+`, the digits, and never UNDECLARED's, whose `{NOPE}` is no pattern;
 * on the located item, SCORE's point where RESPONSE is in the item's PAT, `[a-z]+`, the letters.
 *
 * @param c - The case.
 * @returns The float outcomes in force, by name.
 */
const patternsExpectedOf = (c: PatternsCase) =>
  c.item === "item"
    ? [
        ["DECLARED", c.answer === "digits" ? 1 : 0],
        ["UNDECLARED", 0],
      ]
    : [["SCORE", c.answer === "letters" ? 1 : 0]];

/**
 * The situations the patterns space must reach.
 */
const patternsSituations = [
  "a braced pattern names an item's declared variable: matched",
  "a braced pattern names an item's declared variable: unmatched",
  "a braced pattern names no variable: a string, no pattern",
  "a located template's braced pattern names its item's variable: matched",
  "a located template's braced pattern names its item's variable: unmatched",
] as const;

type PatternsSituation = (typeof patternsSituations)[number];

/**
 * One patterns case: a fresh child's session of the case's item and its attempt with RESPONSE, as
 * host rows, graded as the write that records an attempt grades it (`grade`); then its status and
 * float outcomes in force, held to the table.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdPatterns = (
  c: PatternsCase,
  child: string,
  note: (situation: PatternsSituation) => void,
) =>
  Effect.gen(function* hold() {
    const matched = c.item === "item" ? c.answer === "digits" : c.answer === "letters";
    if (c.item === "item") {
      note(
        matched
          ? "a braced pattern names an item's declared variable: matched"
          : "a braced pattern names an item's declared variable: unmatched",
      );
      note("a braced pattern names no variable: a string, no pattern");
    } else {
      note(
        matched
          ? "a located template's braced pattern names its item's variable: matched"
          : "a located template's braced pattern names its item's variable: unmatched",
      );
    }

    const path = c.item === "item" ? PATTERNS : PATTERNS_LOCATED;
    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const key = { child, n: 0n, package: PACKAGE, path };
    const stage = 1n;
    yield* db.workload.begin.once({
      facts: {
        insert: {
          StageControl: rowsOf("StageControl", [{ child, stage, ...directControl }]),
        },
      },
      params: { child, package: PACKAGE, path, seed: SEED, stage },
    });
    yield* db.workload.facts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", [key]),
          ProcessedAttempt: rowsOf("ProcessedAttempt", []),
          ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...key, kind: "attempt" }]),
          SnapshotMultipleIdentifier: rowsOf("SnapshotMultipleIdentifier", []),
          SnapshotSingleBoolean: rowsOf("SnapshotSingleBoolean", []),
          SnapshotSingleFloat: rowsOf("SnapshotSingleFloat", []),
          SnapshotSingleString: rowsOf("SnapshotSingleString", [
            { ...key, value: patternAnswers[c.answer], variable: "RESPONSE" },
          ]),
        },
      },
      params: {},
    });
    yield* db.workload.grade.once({ facts: {}, params: key });

    const atChild = { facts: {}, params: { child } };
    const statusRows = yield* db.workload.statusesOf.once(atChild);
    const floatRows = yield* db.workload.floatsOf.once(atChild);
    assert.deepStrictEqual<unknown>(
      {
        floats: byVariableOf(
          Arr.fromIterable(floatRows).map((row) => [row.variable, row.value] as const),
        ),
        status: Arr.fromIterable(statusRows).map((row) => row.status),
      },
      { floats: patternsExpectedOf(c), status: ["final"] },
      `${c.name}: a braced pattern read by the run's own declarations, through the ledger's own grading`,
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

      if (first) {
        yield* db.workload.begin.once({
          facts: {
            insert: {
              StageControl: rowsOf("StageControl", [
                { child, stage, ...directControl, maxAttempts: BigInt(drawAttempts) },
              ]),
            },
          },
          params: { child, package: PACKAGE, path, seed: SEED, stage },
        });
      }

      yield* db.workload.facts.once({
        facts: {
          insert: {
            Attempt: rowsOf("Attempt", [key]),
            ProcessedAttempt: rowsOf("ProcessedAttempt", []),
            ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...key, kind: "attempt" }]),
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

      const completions = Arr.fromIterable(yield* db.workload.completionsOf.once(atChild));
      const floats = Arr.fromIterable(yield* db.workload.snapshotFloatsOf.once(atChild));
      const identifiers = Arr.fromIterable(yield* db.workload.snapshotIdentifiersOf.once(atChild));
      const bags = Arr.fromIterable(yield* db.workload.snapshotIdentifierBagsOf.once(atChild));
      const booleans = Arr.fromIterable(yield* db.workload.snapshotBooleansOf.once(atChild));
      assert.deepStrictEqual<unknown>(
        completions.map(({ at, completionStatus }) => ({
          feedback: bags
            .filter((row) => row.at === at && row.variable === "FEEDBACK")
            .flatMap((row) => Arr.replicate(row.value, Number(row.count))),
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
 * A review case: a fresh child's sitting, one item stage, holding the adaptive draw item answered
 * twice (drawn, then `ending`), the non-adaptive draw item answered once (`ending`), the essay
 * answered and waiting for a person (both its draws declined), and a text entry begun and never
 * answered; and a second sitting of the child, a text entry answered there.
 */
type ReviewCase = Readonly<{ name: string; ending: Ending }>;

const reviewSpace: Gen<ReviewCase> = map(element(endings), (ending): ReviewCase => ({
  ending,
  name: `review: the adaptive draw drawn then ${ending}, the draw ${ending}, an essay waiting for a person`,
}));

/**
 * One item session's row of the review read, as the table states it: its item, the completion
 * status its response processing left (none while it is pending), its single values in force and
 * its multiple values, each `[variable, base type, value]` (a multiple's with its count), its
 * credit `[earned, maximum, kind]`, and each mark `[variable, value, mark]`, every mark of a
 * multiple at place 0 covering one copy.
 */
type ReviewRow = Readonly<{
  credit: readonly (readonly [number, number, string])[];
  marks: readonly (readonly [string, string, string])[];
  multiples: readonly (readonly [string, string, string, bigint])[];
  path: string;
  processed: readonly string[];
  singles: readonly (readonly [string, string, unknown])[];
}>;

/**
 * The owner's credit of a SCORE over its maximum: none at 0 or below, full at the maximum or
 * above, partial between.
 *
 * @param score The SCORE.
 * @param maximum Its maximum.
 * @returns The credit's kind.
 */
const reviewCreditOf = (score: number, maximum: number): string => {
  if (score <= 0) {
    return "none";
  }

  return score >= maximum ? "full" : "partial";
};

/**
 * A draw item's row after its attempts end so: its latest attempt's outcomes as the draw family's
 * table states them (info §2.2.2.3; {@link drawExpectedOf}), the responses that attempt gave
 * ({@link responsesOf}), its credit, SCORE over MAXSCORE, and its marks on RESPONSE, whose correct
 * response is every point of the model: a ticked point `right`, a point nobody ticked `missed`
 * (no point the checklist offers outside the model is ever ticked here). DRAWN, a boolean with no
 * correct response, has no mark.
 *
 * @param adaptive Whether the item is the adaptive one.
 * @param ended How each attempt ended.
 * @returns The row.
 */
const drawRowOf = (adaptive: boolean, ended: readonly Ending[]): ReviewRow => {
  const after = Option.getOrThrow(
    Arr.last(drawExpectedOf({ adaptive, endings: ended, name: "review" })),
  );
  const { drawn, ticked } = responsesOf(Option.getOrThrow(Arr.last(ended)));

  return {
    credit: after.score.flatMap((score) =>
      after.maxScore.map((maximum) => [score, maximum, reviewCreditOf(score, maximum)] as const),
    ),
    marks: drawPoints.map(
      (point) => ["RESPONSE", point, ticked.includes(point) ? "right" : "missed"] as const,
    ),
    multiples: [
      ...after.feedback.map((value) => ["FEEDBACK", "identifier", value, 1n] as const),
      ...ticked.map((value) => ["RESPONSE", "identifier", value, 1n] as const),
    ],
    path: drawPathOf(adaptive),
    processed: [after.status],
    singles: [
      ["DRAWN", "boolean", drawn],
      ...after.hint.map((value) => ["HINT", "identifier", value] as const),
      ...after.hintNull.map((value) => ["HINT_NULL", "boolean", value] as const),
      ...after.maxScore.map((value) => ["MAXSCORE", "float", value] as const),
      ...after.score.map((value) => ["SCORE", "float", value] as const),
    ],
  };
};

/**
 * The table of the review read, from QTI 3.0.1's text, read apart from the read: each item session
 * of the sitting that has an attempt, at its latest attempt (Results Reporting reports an item
 * session's variables at the end of its last attempt), and none that has none.
 *
 * - The adaptive draw at its second attempt, its outcomes those its response processing left after
 *   the first's (info §2.2.2.3); the non-adaptive draw at its one attempt.
 * - The essay, both its draws declined, waits for a person: `pendingResponseProcessing` (Results
 *   Reporting, Table 2.7.7: "the item variables represent the values of the response variables
 *   after submission but before response processing has taken place"), so it holds its response
 *   alone, no completion status, no credit and no mark (a string response with no correct response
 *   is never marked).
 * - The text entry never answered has no row, and the second sitting's attempt is none of this
 *   sitting's.
 *
 * @param c The case.
 * @returns The rows, by path.
 */
const reviewExpectedOf = (c: ReviewCase): readonly ReviewRow[] =>
  Arr.sort(
    [
      drawRowOf(true, ["drawn", c.ending]),
      drawRowOf(false, [c.ending]),
      {
        credit: [],
        marks: [],
        multiples: [],
        path: ESSAY,
        processed: [],
        singles: [["RESPONSE", "string", RESPONSE]],
      },
    ],
    Order.mapInput(Order.String, (row: ReviewRow) => row.path),
  );

/**
 * The situations the review family must reach.
 */
const reviewSituations = [
  "a multi-attempt item read at its latest attempt",
  "full credit",
  "no credit",
  "a mark right",
  "a mark missed",
  "an essay waiting for a person, its response alone",
  "a session with no attempt has no row",
  "another sitting's attempt is not read",
] as const;

type ReviewSituation = (typeof reviewSituations)[number];

/**
 * The situations a review case reaches, read off what its table expects.
 *
 * @param expected The case's rows.
 * @returns Its situations.
 */
const reviewSituationsOf = (expected: readonly ReviewRow[]): readonly ReviewSituation[] => [
  "a multi-attempt item read at its latest attempt",
  "an essay waiting for a person, its response alone",
  "a session with no attempt has no row",
  "another sitting's attempt is not read",
  ...expected.flatMap((row): readonly ReviewSituation[] => [
    ...row.credit.map((credit): ReviewSituation =>
      credit[2] === "full" ? "full credit" : "no credit",
    ),
    ...row.marks.map((mark): ReviewSituation =>
      mark[2] === "right" ? "a mark right" : "a mark missed",
    ),
  ]),
];

/**
 * How many values a cardinality's row of a snapshot holds, every base type's.
 *
 * @param group The row.
 * @returns Its values.
 */
const valueCountOf = (
  group:
    | ValueRows["single"][number]
    | ValueRows["multiple"][number]
    | ValueRows["ordered"][number]
    | ValueRows["record"][number],
) =>
  group.identifier.length +
  group.boolean.length +
  group.integer.length +
  group.float.length +
  group.string.length +
  group.point.length +
  group.pair.length +
  group.directedPair.length +
  group.duration.length +
  group.uri.length +
  group.file.length;

/**
 * How many marks an attempt's marks row holds, every shape's.
 *
 * @param marks The row.
 * @returns Its marks.
 */
const markCountOf = (marks: MarkRows) =>
  marks.text.length +
  marks.integer.length +
  marks.float.length +
  marks.boolean.length +
  marks.pair.length +
  marks.directedPair.length +
  marks.point.length +
  marks.file.length;

/**
 * One run of a review case: the sitting's item sessions begun as an application's decision begins
 * them, each attempt recorded as host rows and graded as the write that records it grades it
 * (`grade`), the essay's draws each declined through the evaluator's own write
 * (`recordEvaluations`), and the second sitting's text entry answered; then the sitting read as a
 * review reads it (`reviewOf`, `attemptRowsOf`), held to the table, each row at its session's
 * latest attempt, and its rows read as an application reads them (`judgedOfRows`).
 *
 * @param c The case.
 * @param child The run's fresh child.
 * @param note Records the situation the case reaches.
 */
const holdReview = (c: ReviewCase, child: string, note: (situation: ReviewSituation) => void) =>
  Effect.gen(function* hold() {
    const expected = reviewExpectedOf(c);
    for (const situation of reviewSituationsOf(expected)) {
      note(situation);
    }

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const stage = 1n;
    const other = 2n;
    const beginAt = (path: string, at: bigint, control: boolean) =>
      db.workload.begin.once({
        facts: {
          insert: {
            StageControl: rowsOf(
              "StageControl",
              control
                ? [{ child, stage: at, ...directControl, maxAttempts: BigInt(drawAttempts) }]
                : [],
            ),
          },
        },
        params: { child, package: PACKAGE, path, seed: SEED, stage: at },
      });
    const attempt = (
      key: Readonly<{ child: string; n: bigint; package: string; path: string }>,
      rows: Readonly<{
        booleans: readonly Readonly<{ value: boolean; variable: string }>[];
        identifiers: readonly string[];
        strings: readonly Readonly<{ value: string; variable: string }>[];
      }>,
    ) =>
      Effect.andThen(
        db.workload.facts.once({
          facts: {
            insert: {
              Attempt: rowsOf("Attempt", [key]),
              ProcessedAttempt: rowsOf("ProcessedAttempt", []),
              ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...key, kind: "attempt" }]),
              SnapshotMultipleIdentifier: rowsOf(
                "SnapshotMultipleIdentifier",
                rows.identifiers.map((value) => ({
                  ...key,
                  count: 1n,
                  value,
                  variable: "RESPONSE",
                })),
              ),
              SnapshotSingleBoolean: rowsOf(
                "SnapshotSingleBoolean",
                rows.booleans.map((row) => ({ ...key, ...row })),
              ),
              SnapshotSingleFloat: rowsOf("SnapshotSingleFloat", []),
              SnapshotSingleString: rowsOf(
                "SnapshotSingleString",
                rows.strings.map((row) => ({ ...key, ...row })),
              ),
            },
          },
          params: {},
        }),
        db.workload.grade.once({ facts: {}, params: key }),
      );
    const drawKey = (adaptive: boolean) => ({
      child,
      n: 0n,
      package: PACKAGE,
      path: drawPathOf(adaptive),
    });
    const drawAttempt = (adaptive: boolean, ending: Ending) => {
      const { drawn, ticked } = responsesOf(ending);

      return attempt(drawKey(adaptive), {
        booleans: [{ value: drawn, variable: "DRAWN" }],
        identifiers: ticked,
        strings: [],
      });
    };

    yield* beginAt(drawPathOf(true), stage, true);
    yield* beginAt(drawPathOf(false), stage, false);
    yield* beginAt(ESSAY, stage, false);
    yield* beginAt(OTHER, stage, false);
    yield* beginAt(SHORT, other, true);
    yield* drawAttempt(true, "drawn");
    yield* drawAttempt(true, c.ending);
    yield* drawAttempt(false, c.ending);

    const essay = { child, n: 0n, package: PACKAGE, path: ESSAY };
    yield* attempt(essay, {
      booleans: [],
      identifiers: [],
      strings: [{ value: RESPONSE, variable: "RESPONSE" }],
    });

    const recorded = Arr.fromIterable(
      yield* db.workload.attemptsOf.once({ facts: {}, params: { child } }),
    );
    const essayAt = Option.getOrThrow(Arr.findFirst(recorded, (row) => row.path === ESSAY)).at;
    const operators = Arr.dedupe(
      Arr.fromIterable(yield* db.workload.drawsOf.once({ facts: {}, params: { package: PACKAGE } }))
        .filter((row) => row.path === ESSAY)
        .map((row) => row.operator),
    );
    for (const operator of operators) {
      yield* db.workload.recordEvaluations.once({
        facts: {},
        params: {
          declines: [
            {
              ...essay,
              at: essayAt,
              grader: grader.version,
              operator,
              reason: Option.getOrThrow(Arr.head(DeclineReason.handles)),
              request: requestOf(operator),
            },
          ],
          feedbacks: [],
          replies: [],
        },
      });
    }
    yield* attempt(
      { child, n: 0n, package: PACKAGE, path: SHORT },
      { booleans: [], identifiers: [], strings: [{ value: RESPONSE, variable: "RESPONSE" }] },
    );

    const reviewed = Option.getOrThrow(
      Arr.head(
        Arr.fromIterable(yield* db.workload.reviewOf.once({ facts: {}, params: { child, stage } })),
      ),
    );
    const rows: readonly AttemptRows[] = reviewed.attempts;
    const latest = new Map<string, bigint>();
    for (const row of yield* db.workload.attemptsOf.once({ facts: {}, params: { child } })) {
      const session = `${row.path} ${String(row.n)}`;
      const held = latest.get(session);
      if (held === undefined || row.at > held) {
        latest.set(session, row.at);
      }
    }
    const read = yield* Effect.all(
      reviewed.attempts.map((row) =>
        Effect.map(judgedOfRows(row), (judged) => {
          const [single] = row.single;
          const [multiple] = row.multiple;
          const [ordered] = row.ordered;
          const [record] = row.record;
          const [marked] = row.marks;
          assert.isDefined(single, `${c.name}, ${row.path}: its singles' row`);
          assert.isDefined(multiple, `${c.name}, ${row.path}: its multiples' row`);
          assert.isDefined(ordered, `${c.name}, ${row.path}: its ordereds' row`);
          assert.isDefined(record, `${c.name}, ${row.path}: its records' row`);
          assert.isDefined(marked, `${c.name}, ${row.path}: its marks' row`);
          assert.strictEqual(
            row.at,
            latest.get(`${row.path} ${String(row.n)}`),
            `${c.name}, ${row.path}: read at its session's latest attempt`,
          );

          const singles = [
            ...single.boolean.map(({ value, variable }) => [variable, "boolean", value] as const),
            ...single.float.map(({ value, variable }) => [variable, "float", value] as const),
            ...single.identifier.map(
              ({ value, variable }) => [variable, "identifier", value] as const,
            ),
            ...single.string.map(({ value, variable }) => [variable, "string", value] as const),
          ];
          const multiples = multiple.identifier.map(
            ({ count, value, variable }) => [variable, "identifier", value, count] as const,
          );
          assert.deepStrictEqual<unknown>(
            [
              valueCountOf(single),
              valueCountOf(multiple),
              valueCountOf(ordered),
              valueCountOf(record),
              markCountOf(marked),
              judged.credit.pipe(Option.map((kind) => [kind])),
            ],
            [
              singles.length,
              multiples.length,
              0,
              0,
              marked.text.length,
              Option.fromUndefinedOr(row.credit[0]).pipe(Option.map(({ kind }) => [kind])),
            ],
            `${c.name}, ${row.path}: no value or mark of a shape the table gives none of, and the credit judgedOfRows reads its row's`,
          );

          return {
            credit: row.credit.map(({ earned, kind, maximum }) => [earned, maximum, kind] as const),
            marks: Arr.sort(
              marked.text.map((mark) => {
                assert.deepStrictEqual<unknown>(
                  [mark.baseType, mark.place, mark.copies],
                  ["identifier", 0n, 1n],
                  `${c.name}, ${row.path}: a multiple's mark at place 0, one copy`,
                );

                return [mark.variable, mark.value, mark.mark] as const;
              }),
              Order.mapInput(Order.String, (mark: readonly [string, string, string]) => mark[1]),
            ),
            multiples,
            path: row.path,
            processed: Option.toArray(
              row.processed.pipe(Option.map(({ completionStatus }) => completionStatus)),
            ),
            singles: Arr.sort(
              singles,
              Order.mapInput(
                Order.String,
                ([variable]: readonly [string, string, unknown]) => variable,
              ),
            ),
          } satisfies ReviewRow;
        }),
      ),
    );
    assert.strictEqual(
      rows.length,
      expected.length,
      `${c.name}: one row per item session with an attempt`,
    );
    assert.deepStrictEqual<unknown>(
      read,
      expected,
      `${c.name}: the sitting's rows, as the table states them`,
    );
  });

/**
 * The instant every case on the moved clock starts from, 2026-11-25T12:00:00Z, in microseconds
 * since the Unix epoch. Each case is a fresh child's, and every clock of a sitting has its child
 * for its child, so no stamp of another case is a head a case's stamps meet: each instant a case
 * states is the instant its writes stamp, in every run.
 */
const clockStart = 1_795_608_000_000_000n;

/**
 * A second of the database's clock, in microseconds.
 */
const oneSecond = 1_000_000n;

/**
 * A tenth of a second, in microseconds: the span between a case's moves where only their order
 * matters.
 */
const tenth = 100_000n;

/**
 * A case's Db over the moved clock (`#ledger/test/result-clock.ts`), whose every call reads the
 * instant the case last stated, {@link clockStart} until it states one: the clocked parameters of
 * the call and every instant it stamps. `at(instant, call)` states `instant` and makes `call` at
 * it.
 */
const clockedDb = Effect.gen(function* openClocked() {
  const { suite } = yield* (yield* MovedSuite).moved;
  const clock = yield* Ref.make(clockStart);
  const db = yield* Db.openMoved(suite.roles.result_runner, {}, Ref.get(clock));
  const at = <A, E, R>(instant: bigint, call: Effect.Effect<A, E, R>) =>
    Effect.andThen(Ref.set(clock, instant), call);

  return { at, db } as const;
});

/**
 * The instants a program's `entered` read-back gives, each candidate session it began.
 *
 * @param reads - The program's read-backs.
 */
const entryInstantsOf = (reads: Readonly<{ entered: Iterable<Readonly<{ at: bigint }>> }>) =>
  Arr.fromIterable(reads.entered).map((row) => row.at);

/**
 * When a response case's save is given: before the sitting's first candidate session, in its open
 * one, after its suspension, or after its end.
 */
type When = "unstarted" | "open" | "suspended" | "ended";

/**
 * A response case's timing, its save arriving at an instant of the moved clock it states: an
 * untimed sitting; or a timed one, its save arriving within its time (in time), at the last
 * microsecond of the in-flight grace past a deadline at its session's beginning (in flight), within
 * that grace with a browser's reading a microsecond past the deadline (which decides nothing), or
 * at the microsecond after the grace (arrived late); or at that microsecond where the test allows
 * late submission; or an untimed sitting's save whose browser reading runs a day ahead of the
 * database's stamp, a skewed clock, which no law holds to the stamp (`BrowserReading`), so it is
 * admitted, where the parent's "Given before" refused it.
 */
type Timing =
  | "untimed"
  | "inTime"
  | "inFlight"
  | "givenLate"
  | "givenAhead"
  | "arrivedLate"
  | "lateAllowed";

type ResponseCase = Readonly<{ name: string; when: When; timing: Timing }>;

/**
 * Each timing's test, its first budget (none for an untimed sitting), when its save arrives, the
 * database's stamp, and the save's `given`, the browser's reading, each from its candidate
 * session's beginning, all in microseconds.
 */
const timings = {
  arrivedLate: {
    arrives: inFlightGraceMicros + 1n,
    given: 0n,
    remaining: Option.some(0n),
    test: TIMED_TEST,
  },
  givenAhead: {
    arrives: oneSecond,
    given: 86_400_000_000n,
    remaining: Option.none<bigint>(),
    test: UNTIMED_TEST,
  },
  givenLate: { arrives: oneSecond, given: 1n, remaining: Option.some(0n), test: TIMED_TEST },
  inFlight: {
    arrives: inFlightGraceMicros,
    given: 0n,
    remaining: Option.some(0n),
    test: TIMED_TEST,
  },
  inTime: {
    arrives: oneSecond,
    given: 0n,
    remaining: Option.some(3_600_000_000n),
    test: TIMED_TEST,
  },
  lateAllowed: {
    arrives: inFlightGraceMicros + 1n,
    given: 1n,
    remaining: Option.some(0n),
    test: LATE_TEST,
  },
  untimed: { arrives: oneSecond, given: 0n, remaining: Option.none<bigint>(), test: UNTIMED_TEST },
} as const satisfies Record<
  Timing,
  Readonly<{ arrives: bigint; given: bigint; remaining: Option.Option<bigint>; test: string }>
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
  openCase("givenAhead"),
  openCase("arrivedLate"),
  openCase("lateAllowed"),
  closedCase("unstarted"),
  closedCase("suspended"),
  closedCase("ended"),
] as const;

const responseSpace: Gen<ResponseCase> = element(responseCases);

/**
 * What the table expects of a save: accepted, or refused, naming one of the laws it breaks, each by
 * the relation or check its refusal names.
 */
type ResponseExpected =
  | Readonly<{ kind: "accepted" }>
  | Readonly<{
      kind: "refused";
      laws: readonly ("Test snapshot of its session" | "Shown before saved" | "Response in time")[];
    }>;

/**
 * The responses' table. A save outside the sitting's candidate sessions is refused by "Inside a
 * candidate session", whose target is `SessionSnapshot` (§2.2.1: "During each attempt the candidate
 * interacts with the item through one or more candidate sessions"), whatever its timing; one before
 * the sitting's first is also of a member never presented, which "Shown before saved" refuses
 * (target `PresentedMember`), and the refusal names either. In the
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
  if (c.when === "unstarted") {
    return { kind: "refused", laws: ["Test snapshot of its session", "Shown before saved"] };
  }

  if (c.when !== "open") {
    return { kind: "refused", laws: ["Test snapshot of its session"] };
  }

  return c.timing === "arrivedLate"
    ? { kind: "refused", laws: ["Response in time"] }
    : { kind: "accepted" };
};

/**
 * The situations the responses' space must reach.
 */
const responseSituations = [
  "accepted in the open session",
  "accepted past its deadline: late submission allowed",
  "accepted though the browser read it past its deadline: the database's stamp decides",
  "accepted though the browser's reading runs ahead of the database's stamp: no law relates the two clocks",
  "refused: Inside a candidate session",
  "refused: before the sitting's first candidate session",
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
 * One response case: a fresh child's sitting of the case's test, taken by the test runtime's own
 * take (`takeSitting`, its members' sessions and starts the take's) and, but for a save before its
 * first candidate session, entered at {@link SAVED}, the member the case saves ("Shown before
 * saved"), a timed entry with the case's first budget, then suspended, or ended as the case says,
 * an attempt of {@link MEMBER}, presented, before the end, which nothing grades, so the ended
 * sitting waits on it and is not final; then a save of {@link SAVED} with no value, arriving and
 * given the case's times from the session's beginning, held to the table, and every move's
 * `standing` read-back to the sitting's standing after it. Every instant is the moved clock's: the
 * take at {@link clockStart}, the entry a second after it, each move between it and the save a
 * tenth of a second after the one before.
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
    const { at, db } = yield* clockedDb;
    const timing = timings[c.timing];
    const sitting = { child, stage: 1n };
    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { ...sitting, package: PACKAGE, path: timing.test, seed: DECISION },
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as the take writes it`);

    const began = clockStart + oneSecond;
    if (c.when !== "unstarted") {
      const entered = Option.isSome(timing.remaining)
        ? yield* at(
            began,
            db.workload.enterTimedTest.once({
              facts: {},
              params: { ...sitting, item: SAVED, remaining: timing.remaining.value },
            }),
          )
        : yield* at(
            began,
            db.workload.enterTest.once({ facts: {}, params: { ...sitting, item: SAVED } }),
          );
      assert.deepStrictEqual<unknown>(
        {
          at: entryInstantsOf(entered.reads),
          kind: entered.kind,
          standing: standingsOf(entered.reads),
        },
        { at: [began], kind: "accepted", standing: ["open"] },
        `${c.name}: the entry at the instant the case states, the sitting open after it`,
      );
      note("standing: open");
    }

    if (c.when === "suspended") {
      const suspended = yield* at(
        began + tenth,
        db.workload.suspendTest.once({ facts: {}, params: sitting }),
      );
      assert.deepStrictEqual<unknown>(
        { kind: suspended.kind, standing: standingsOf(suspended.reads) },
        { kind: "accepted", standing: ["suspended"] },
        `${c.name}: the suspension, the sitting suspended after it`,
      );
      note("standing: suspended");
    }

    if (c.when === "ended") {
      const shown = yield* at(
        began + tenth,
        db.workload.presentItem.once({
          facts: {},
          params: { ...sitting, item: MEMBER },
        }),
      );
      assert.strictEqual(shown.kind, "accepted", `${c.name}: the member presented`);

      const attempt = { child, n: 0n, package: PACKAGE, path: SHORT };
      const attempted = yield* at(
        began + 2n * tenth,
        db.workload.sittingFacts.once({
          facts: {
            insert: {
              Attempt: rowsOf("Attempt", [attempt]),
              ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...attempt, kind: "attempt" }]),
            },
          },
          params: {},
        }),
      );
      assert.strictEqual(attempted.kind, "accepted", `${c.name}: the member's attempt`);

      const ended = yield* at(
        began + 3n * tenth,
        db.workload.endTest.once({ facts: {}, params: sitting }),
      );
      assert.deepStrictEqual<unknown>(
        { kind: ended.kind, standing: standingsOf(ended.reads) },
        { kind: "accepted", standing: ["ended"] },
        `${c.name}: the end, the sitting ended after it and waiting on its attempt`,
      );
      note("standing: ended");

      const again = yield* at(
        began + 4n * tenth,
        db.workload.suspendTest.once({ facts: {}, params: sitting }),
      );
      assert.deepStrictEqual<unknown>(
        { kind: again.kind, standing: standingsOf(again.reads) },
        { kind: "unchanged", standing: ["ended"] },
        `${c.name}: a suspension of the ended sitting writes nothing and reads back its standing`,
      );
      note("an unchanged move reads back its standing");
    }

    const values = yield* responseParamsOf({});
    const given = BrowserReading(c.when === "unstarted" ? 1n : began + timing.given);
    const saved = yield* Effect.result(
      at(
        began + timing.arrives,
        db.workload.saveTestItem.once({
          facts: {},
          params: { ...sitting, given, item: SAVED, ...values },
        }),
      ),
    );
    const want = responseExpectedOf(c);
    if (want.kind === "refused") {
      assert.isTrue(
        Result.isFailure(saved) &&
          saved.failure.kind === "refused" &&
          refusedBy(saved.failure.refused, ...want.laws),
        `${c.name}: refused by one of ${want.laws.join(", ")}, got ${Formatter.format(saved)}`,
      );
      if (c.when === "unstarted") {
        note("refused: before the sitting's first candidate session");
      } else if (c.timing === "arrivedLate") {
        note("refused: Response in time");
      } else {
        note("refused: Inside a candidate session");
      }

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
    } else if (c.timing === "givenAhead") {
      note(
        "accepted though the browser's reading runs ahead of the database's stamp: no law relates the two clocks",
      );
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

/**
 * The document of each item ref a controls case acts on, its item session's path.
 */
const controlPaths = {
  [DRAFT_REF]: DRAFT_MIN,
  [ESSAY_REF]: ESSAY_MIN,
  [MEMBER_REF]: MEMBER_MIN,
} as const satisfies Record<ControlRef, string>;

/**
 * The declarations a controls item's save is read back by: its one text response, `RESPONSE`.
 */
const textDeclarations = {
  outcomes: new Map(),
  records: new Map(),
  responses: new Map([["RESPONSE", { baseType: "string", cardinality: "single" }] as const]),
} as const;

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
 * One controls case: a fresh child's sitting of the controls test, taken by the test runtime's own
 * take (`takeSitting`), entered, which presents {@link MEMBER_REF}; then each move through the test
 * runtime's own programs, its outcome held to the table, and the child's attempts after a
 * presentation held to be the attempts before it; then the end with its finish (`finishTest`), and
 * every member's attempts, in their order, held to the table, each by the string its snapshot
 * holds, none where the end submitted it at its default.
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
    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { ...sitting, package: PACKAGE, path: CONTROLS_TEST, seed: DECISION },
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as the take writes it`);

    const entered = yield* db.workload.enterTest.once({
      facts: {},
      params: { ...sitting, item: MEMBER_REF },
    });
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
        const responses = {
          RESPONSE: {
            baseType: "string",
            cardinality: "single",
            values: [{ baseType: "string", value: controlTexts[move.text] }],
          },
        } as const;
        const values = yield* responseParamsOf(responses);
        const params = { ...sitting, given: BrowserReading(began), item: move.ref, ...values };
        const outcome =
          move.kind === "save"
            ? yield* db.workload.saveTestItem.once({ facts: {}, params })
            : yield* db.workload.answerTestItem.once({
                facts: {},
                params: { ...params, next: [] },
              });
        assert.strictEqual(outcome.kind, want, what);
        if (move.kind === "save" && want === "accepted") {
          const sittings = Arr.fromIterable(
            yield* db.workload.savesOf.once({ facts: {}, params: { child } }),
          );
          const latest = Option.getOrThrow(
            Arr.findFirst(
              sittings.flatMap(({ saves }) => Arr.fromIterable(saves)),
              ({ path }) => path === controlPaths[move.ref],
            ),
          );
          assert.deepStrictEqual<unknown>(
            yield* responsesOfRows(textDeclarations, latest),
            responses,
            `${what}: its latest save reads back as it was saved (savedRowsOf)`,
          );
        }
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
      attempts
        .filter((row) => row.package === PACKAGE && row.path === path)
        .map((row): SubmittedText => {
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
 * A move of a shown case on the human-scored essay, in the shown test's open candidate session:
 * its presentation, or a save of {@link shownText}.
 */
type ShownMove = "present" | "save";

type ShownCase = Readonly<{ name: string; moves: readonly ShownMove[] }>;

/**
 * The text every shown case's save gives.
 */
const shownText = "A push moves the cart.";

/**
 * Every shown case: each moves the human-scored essay through the shown test's open session, then
 * ends it, the start presenting {@link MEMBER}.
 */
const shownCases = [
  { moves: [], name: "the essay never presented" },
  { moves: ["save"], name: "the essay saved before it is presented" },
  { moves: ["present"], name: "the essay presented and left blank" },
  {
    moves: ["save", "present", "save"],
    name: "the essay saved before it is presented, then presented and saved",
  },
] as const satisfies readonly ShownCase[];

const shownSpace: Gen<ShownCase> = element(shownCases);

/**
 * What the shown table holds of a case: each move's verdict, each member's attempts after the end
 * (its saved text, or `default` where the end submitted it unsaved), each attempt's status, and
 * whether the sitting is final.
 */
type ShownExpected = Readonly<{
  moves: readonly ("accepted" | "refused")[];
  attempts: Readonly<Record<typeof MEMBER | typeof HUMAN_REF, readonly ("saved" | "default")[]>>;
  statuses: Readonly<Record<typeof MEMBER | typeof HUMAN_REF, readonly string[]>>;
  final: boolean;
}>;

/**
 * The shown table, a fold over the case's moves of whether the essay was presented and whether it
 * holds a save:
 *
 * - A save of a member never presented is refused by "Shown before saved": an item session is in its
 *   initial state "before the delivery has taken place" (§2.2.1), and the candidate sets its
 *   response variables only in the interacting state, in which "The body must be presented to the
 *   candidate" (§2.3). A save of a presented member is accepted.
 * - The end of a simultaneous part submits every presented member, from its latest save, or at its
 *   defaults where it has none (Tables 5.159.5, 7.19.6), and none never presented, whose "response
 *   variable remains NULL" (Table 5.115).
 * - An attempt of the essay, whose SCORE a human gives, is `pendingExternalScoring` once its response
 *   processing ran: "the score is NOT final because the 'external-scored' property for the outcome
 *   variable was set" (Results Reporting, Table 2.7.7); the member's, which scores nothing
 *   externally, is `final`. A sitting is final once ended with no attempt pending, so it is final
 *   exactly where the essay was never presented.
 *
 * @param c - The case.
 */
const shownExpectedOf = (c: ShownCase): ShownExpected => {
  let presented = false;
  let saved = false;
  const moves = c.moves.map((move): "accepted" | "refused" => {
    if (move === "present") {
      presented = true;

      return "accepted";
    }

    if (!presented) {
      return "refused";
    }

    saved = true;

    return "accepted";
  });

  return {
    attempts: {
      [HUMAN_REF]: presented ? [saved ? "saved" : "default"] : [],
      [MEMBER]: ["default"],
    },
    final: !presented,
    moves,
    statuses: {
      [HUMAN_REF]: presented ? ["pendingExternalScoring"] : [],
      [MEMBER]: ["final"],
    },
  };
};

/**
 * The situations the shown space must reach.
 */
const shownSituations = [
  "a save of a member never presented is refused, and stores nothing",
  "a presented member's save is submitted at the end",
  "a presented member never saved is submitted at its defaults",
  "a member never presented has no attempt, and its sitting is final",
  "a presented human-scored essay waits for its score, and its sitting is not final",
] as const;

type ShownSituation = (typeof shownSituations)[number];

/**
 * The situations a case reaches, read from the table's verdicts.
 *
 * @param expected - The table's verdicts.
 */
const shownSituationsOf = (expected: ShownExpected) => {
  const reached = new Set<ShownSituation>();
  if (expected.moves.includes("refused")) {
    reached.add("a save of a member never presented is refused, and stores nothing");
  }

  const essay = expected.attempts[HUMAN_REF];
  if (essay.includes("saved")) {
    reached.add("a presented member's save is submitted at the end");
  }

  if (essay.includes("default")) {
    reached.add("a presented member never saved is submitted at its defaults");
  }

  reached.add(
    expected.final
      ? "a member never presented has no attempt, and its sitting is final"
      : "a presented human-scored essay waits for its score, and its sitting is not final",
  );

  return [...reached];
};

/**
 * One shown case: a fresh child's sitting of the shown test, taken by the test runtime's own take
 * (`takeSitting`), entered, which presents {@link MEMBER}; then each move on the essay through the
 * test runtime's own programs (`presentItem`, `saveTestItem`), its outcome held to the table, a
 * refused save to name "Shown before saved" and to leave the essay with no save; then the end with
 * its finish (`finishTest`), and each member's attempts, their statuses and the sitting's
 * finality held to the table.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdShown = (c: ShownCase, child: string, note: (situation: ShownSituation) => void) =>
  Effect.gen(function* hold() {
    const expected = shownExpectedOf(c);
    for (const situation of shownSituationsOf(expected)) {
      note(situation);
    }

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const sitting = { child, stage: 1n };
    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { ...sitting, package: PACKAGE, path: SHOWN_TEST, seed: DECISION },
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as the take writes it`);

    const entered = yield* db.workload.enterTest.once({
      facts: {},
      params: { ...sitting, item: MEMBER },
    });
    assert.strictEqual(entered.kind, "accepted", `${c.name}: the entry`);

    const began = Option.getOrThrow(Arr.head(Arr.fromIterable(entered.reads.entered))).at;
    const essaySaves = Effect.map(
      db.workload.savesOf.once({ facts: {}, params: { child } }),
      (sittings) =>
        Arr.fromIterable(sittings)
          .flatMap(({ saves }) => Arr.fromIterable(saves))
          .filter(({ path }) => path === HUMAN),
    );

    for (const [i, move] of c.moves.entries()) {
      const want = expected.moves[i];
      const what = `${c.name}: move ${String(i + 1)}, ${move} the essay`;
      if (move === "present") {
        const presented = yield* db.workload.presentItem.once({
          facts: {},
          params: { ...sitting, item: HUMAN_REF },
        });
        assert.strictEqual(presented.kind, want, what);
      } else {
        const values = yield* responseParamsOf({
          RESPONSE: {
            baseType: "string",
            cardinality: "single",
            values: [{ baseType: "string", value: shownText }],
          },
        });
        const outcome = yield* Effect.result(
          db.workload.saveTestItem.once({
            facts: {},
            params: { ...sitting, given: BrowserReading(began), item: HUMAN_REF, ...values },
          }),
        );
        if (want === "refused") {
          assert.isTrue(
            Result.isFailure(outcome) &&
              outcome.failure.kind === "refused" &&
              refusedLawsOf(outcome.failure.refused).some(
                ({ law }) =>
                  law.kind === "contained" &&
                  law.from.relation === "SavedMember" &&
                  law.to.relation === "PresentedMember",
              ),
            `${what}: refused by "Shown before saved", got ${Formatter.format(outcome)}`,
          );
          assert.deepStrictEqual<unknown>(
            yield* essaySaves,
            [],
            `${what}: the refused save stores nothing`,
          );
        } else {
          assert.strictEqual(Result.getOrThrow(outcome).kind, want, what);
        }
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
    const statuses = Arr.fromIterable(
      yield* db.workload.statusesOf.once({ facts: {}, params: { child } }),
    );
    const finals = Arr.fromIterable(
      yield* db.workload.finalsOf.once({ facts: {}, params: { child } }),
    );
    const submittedOf = (path: string) =>
      attempts
        .filter((row) => row.package === PACKAGE && row.path === path)
        .map((row) => {
          const held = strings.filter(
            (value) =>
              value.path === path &&
              value.n === row.n &&
              value.at === row.at &&
              value.variable === "RESPONSE",
          );

          if (held.length === 0) {
            return "default";
          }

          return Option.getOrThrow(Arr.head(held)).value === shownText
            ? "saved"
            : assert.fail(`${c.name}: an attempt of ${Formatter.format(held)}`);
        });
    const statusesAt = (path: string) =>
      statuses
        .filter((row) => row.package === PACKAGE && row.path === path)
        .map((row) => row.status);
    assert.deepStrictEqual<unknown>(
      {
        attempts: { [HUMAN_REF]: submittedOf(HUMAN), [MEMBER]: submittedOf(SHORT) },
        final: finals.some((row) => row.stage === sitting.stage),
        statuses: { [HUMAN_REF]: statusesAt(HUMAN), [MEMBER]: statusesAt(SHORT) },
      },
      { attempts: expected.attempts, final: expected.final, statuses: expected.statuses },
      `${c.name}: every member's attempts and their statuses after the end, and whether the sitting is final`,
    );
  });

/**
 * A test that names its members, in order: the shown test's, or a linear test's.
 */
type EntryTest = typeof SHOWN_TEST | typeof LINEAR_TEST | typeof LINEAR_TOGETHER_TEST;

/**
 * A member of an entry test, by its item ref.
 */
type EntryMember = typeof MEMBER | typeof SAVED | typeof HUMAN_REF;

/**
 * The item ref no entry test holds.
 */
const NOBODY = "nobody";

/**
 * An entry of an entry case: at the member an item ref names (`enterTest` bound to
 * `namedEntries`), or where its candidate left the sitting (`resumeTest`, bound to
 * `resumedEntries`).
 */
type Entry =
  | Readonly<{ kind: "named"; item: EntryMember | typeof NOBODY }>
  | Readonly<{ kind: "resumed" }>;

const enteredAt = (item: EntryMember | typeof NOBODY): Entry => ({ item, kind: "named" });

const resumedEntry: Entry = { kind: "resumed" };

/**
 * An entry case: a fresh child's sitting of `test`, entered as each of `entries` says, in order,
 * the sitting suspended between each two; then, where every entry was accepted, a save of the
 * member the last one presented.
 */
type EntryCase = Readonly<{ name: string; test: EntryTest; entries: readonly Entry[] }>;

/**
 * Each entry test's members, in its order.
 */
const entryMembers = {
  [LINEAR_TEST]: [MEMBER, SAVED],
  [LINEAR_TOGETHER_TEST]: [MEMBER, SAVED],
  [SHOWN_TEST]: [MEMBER, HUMAN_REF],
} as const satisfies Record<EntryTest, readonly EntryMember[]>;

/**
 * Each entry test member's item document, its item session's path.
 */
const entryDocuments = {
  [HUMAN_REF]: HUMAN,
  [MEMBER]: SHORT,
  [SAVED]: OTHER,
} as const satisfies Record<EntryMember, string>;

/**
 * Every entry case.
 */
const entryCases = [
  {
    entries: [enteredAt(MEMBER), enteredAt(HUMAN_REF)],
    name: "a nonlinear sitting resumed at its essay",
    test: SHOWN_TEST,
  },
  {
    entries: [enteredAt(HUMAN_REF)],
    name: "a nonlinear sitting started at its essay",
    test: SHOWN_TEST,
  },
  {
    entries: [resumedEntry],
    name: "a nonlinear sitting started where it begins",
    test: SHOWN_TEST,
  },
  {
    entries: [enteredAt(HUMAN_REF), resumedEntry],
    name: "a nonlinear sitting resumed where its candidate left it",
    test: SHOWN_TEST,
  },
  {
    entries: [enteredAt(NOBODY)],
    name: "a sitting entered at no member of its test",
    test: SHOWN_TEST,
  },
  {
    entries: [enteredAt(SAVED)],
    name: "a linear sitting started at its second member",
    test: LINEAR_TEST,
  },
  {
    entries: [enteredAt(MEMBER), enteredAt(SAVED)],
    name: "a linear sitting resumed at a member after the one it is on",
    test: LINEAR_TEST,
  },
  {
    entries: [enteredAt(MEMBER), enteredAt(MEMBER)],
    name: "a linear sitting resumed at the member it is on",
    test: LINEAR_TEST,
  },
  {
    entries: [resumedEntry, resumedEntry],
    name: "a linear sitting started and resumed where its candidate left it",
    test: LINEAR_TEST,
  },
  {
    entries: [enteredAt(MEMBER), enteredAt(SAVED)],
    name: "a linear simultaneous sitting resumed at its next member",
    test: LINEAR_TOGETHER_TEST,
  },
  {
    entries: [enteredAt(MEMBER), enteredAt(SAVED), enteredAt(MEMBER)],
    name: "a linear simultaneous sitting moved on, then resumed at the member before",
    test: LINEAR_TOGETHER_TEST,
  },
] as const satisfies readonly EntryCase[];

const entrySpace: Gen<EntryCase> = element(entryCases);

/**
 * A law an entry breaks: "Linear in order" or "In turn", by the relations its containment reads,
 * or "Linear never back", by its check.
 */
type EntryLaw =
  | Readonly<{ kind: "contained"; from: "LinearPreceding"; to: "PresentedMember" }>
  | Readonly<{ kind: "contained"; from: "MovedOn"; to: "AttemptedMember" }>
  | Readonly<{ kind: "check"; name: "Linear_never_back" }>;

type EntryVerdict =
  | Readonly<{ kind: "accepted"; item: EntryMember }>
  | Readonly<{ kind: "unchanged" }>
  | Readonly<{ kind: "refused"; law: EntryLaw }>;

/**
 * What the entry table holds of a case: each entry's verdict, the member an accepted one presents,
 * up to the first that is not accepted, and the member the save after the last presents, where
 * every one was accepted.
 */
type EntryExpected = Readonly<{
  entries: readonly EntryVerdict[];
  saved: Option.Option<EntryMember>;
}>;

/**
 * The entry table, a fold over the case's entries of the members the sitting presented and the one
 * it presented last:
 *
 * - An entry presents the member its entry names. A named one names its item ref; a resumed one names
 *   the member last presented, where a candidate session showed one, else the test's first
 *   (`resumedEntries`: QTI leaves where a delivery starts and resumes to it, §2.8.2). An entry
 *   naming no member of the sitting's test enters nothing.
 * - In a nonlinear part every named member is presented: "the candidate is free to navigate to any
 *   item in the test at any time" (the overview, from TestPart's `navigation-mode`, Table
 *   5.159.4).
 * - In a linear part "the candidate [is restricted] to attempt each item in turn" (Table 5.159.4):
 *   every member before the one presented was presented, else "Linear in order" refuses it, so the
 *   start presents the first member; and in an individual part a resumption at a member after the
 *   one last presented, which has no attempt, is refused by "In turn" (moving on submits), so it
 *   presents the member the candidate is on. In a simultaneous part moving on submits nothing
 *   ("each item session passes between the interacting and suspended states only", Table 5.159.5),
 *   so a resumption at the next member presents it. In either, a resumption at a member before the
 *   one last presented is refused by "Linear never back" ("Once the candidate moves on they are not
 *   permitted to return").
 * - A save of the member the last entry presented is accepted ("Shown before saved").
 *
 * @param c - The case.
 */
const entryExpectedOf = (c: EntryCase): EntryExpected => {
  const members: readonly EntryMember[] = entryMembers[c.test];
  const linear = c.test !== SHOWN_TEST;
  const entries: EntryVerdict[] = [];
  const presented = new Set<EntryMember>();
  let last = Option.none<EntryMember>();
  for (const entry of c.entries) {
    const wanted =
      entry.kind === "named"
        ? entry.item
        : Option.getOrElse(last, () => Option.getOrThrow(Arr.head(members)));
    const found = Arr.findFirst(members, (member) => member === wanted);
    if (Option.isNone(found)) {
      entries.push({ kind: "unchanged" });

      return { entries, saved: Option.none() };
    }

    const item = found.value;

    if (linear && members.slice(0, members.indexOf(item)).some((m) => !presented.has(m))) {
      entries.push({
        kind: "refused",
        law: { from: "LinearPreceding", kind: "contained", to: "PresentedMember" },
      });

      return { entries, saved: Option.none() };
    }

    if (linear && Option.isSome(last) && members.indexOf(item) < members.indexOf(last.value)) {
      entries.push({ kind: "refused", law: { kind: "check", name: "Linear_never_back" } });

      return { entries, saved: Option.none() };
    }

    if (c.test === LINEAR_TEST && Option.isSome(last) && item !== last.value) {
      entries.push({
        kind: "refused",
        law: { from: "MovedOn", kind: "contained", to: "AttemptedMember" },
      });

      return { entries, saved: Option.none() };
    }

    entries.push({ item, kind: "accepted" });
    presented.add(item);
    last = Option.some(item);
  }

  return { entries, saved: last };
};

/**
 * The situations the entry space must reach.
 */
const entrySituations = [
  "a nonlinear resumption presents the member it names, and a save of it is accepted",
  "a nonlinear start presents the member it names",
  "a start where its candidate left it presents the first member",
  "a resumption where its candidate left it presents the member last presented",
  "an entry naming no member of its test enters nothing",
  "a linear start at a member after the first is refused",
  "a linear resumption at a member after the one it is on is refused",
  "a linear resumption at a member before the one it is on is refused",
  "a linear resumption at the member it is on presents it",
  "a linear simultaneous resumption at its next member presents it, moving on submitting nothing",
] as const;

type EntrySituation = (typeof entrySituations)[number];

/**
 * The situations a case reaches, read from its entries and the table's verdicts.
 *
 * @param c - The case.
 * @param expected - The table's verdicts.
 */
const entrySituationsOf = (c: EntryCase, expected: EntryExpected): EntrySituation[] => {
  const linear = c.test !== SHOWN_TEST;
  const verdict = Option.getOrThrow(Arr.last(expected.entries));
  const entry = Option.getOrThrow(Arr.get(c.entries, expected.entries.length - 1));
  if (verdict.kind === "unchanged") {
    return ["an entry naming no member of its test enters nothing"];
  }

  if (verdict.kind === "refused") {
    if (verdict.law.kind === "check") {
      return ["a linear resumption at a member before the one it is on is refused"];
    }

    return [
      verdict.law.from === "LinearPreceding"
        ? "a linear start at a member after the first is refused"
        : "a linear resumption at a member after the one it is on is refused",
    ];
  }

  if (entry.kind === "resumed") {
    return [
      expected.entries.length === 1
        ? "a start where its candidate left it presents the first member"
        : "a resumption where its candidate left it presents the member last presented",
    ];
  }

  if (expected.entries.length === 1) {
    return linear ? [] : ["a nonlinear start presents the member it names"];
  }

  if (c.test === LINEAR_TOGETHER_TEST) {
    return [
      "a linear simultaneous resumption at its next member presents it, moving on submitting nothing",
    ];
  }

  return [
    linear
      ? "a linear resumption at the member it is on presents it"
      : "a nonlinear resumption presents the member it names, and a save of it is accepted",
  ];
};

/**
 * One entry case: a fresh child's sitting of the case's test, taken by the test runtime's own take
 * (`takeSitting`); each entry, `enterTest` at the member it names or `resumeTest` where its
 * candidate left the sitting, its outcome held to the table, a refusal to name its law, and an
 * accepted one's candidate session to present the member the table says (`presentationsOf`); the
 * sitting suspended (`suspendTest`) before each entry but the first; then, where every entry was
 * accepted, a save (`saveTestItem`) of the member the last one presented, held to be accepted.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdEntry = (c: EntryCase, child: string, note: (situation: EntrySituation) => void) =>
  Effect.gen(function* hold() {
    const expected = entryExpectedOf(c);
    for (const situation of entrySituationsOf(c, expected)) {
      note(situation);
    }

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const sitting = { child, stage: 1n };
    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { ...sitting, package: PACKAGE, path: c.test, seed: DECISION },
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as the take writes it`);

    for (const [i, want] of expected.entries.entries()) {
      const entry = Option.getOrThrow(Arr.get(c.entries, i));
      const what = `${c.name}: entry ${String(i + 1)}, ${entry.kind === "named" ? `at ${entry.item}` : "where its candidate left it"}`;
      if (i > 0) {
        const suspended = yield* db.workload.suspendTest.once({ facts: {}, params: sitting });
        assert.strictEqual(suspended.kind, "accepted", `${what}: the suspension before it`);
      }

      const entered = yield* Effect.result(
        entry.kind === "named"
          ? db.workload.enterTest.once({ facts: {}, params: { ...sitting, item: entry.item } })
          : db.workload.resumeTest.once({ facts: {}, params: sitting }),
      );
      if (want.kind === "refused") {
        assert.isTrue(
          Result.isFailure(entered) &&
            entered.failure.kind === "refused" &&
            refusedLawsOf(entered.failure.refused).some(({ law }) =>
              want.law.kind === "check"
                ? law.kind === "check" && law.name === want.law.name
                : law.kind === "contained" &&
                  law.from.relation === want.law.from &&
                  law.to.relation === want.law.to,
            ),
          `${what}: refused by ${Formatter.format(want.law)}, got ${Formatter.format(entered)}`,
        );
      } else {
        assert.strictEqual(Result.getOrThrow(entered).kind, want.kind, what);
      }

      if (want.kind === "accepted") {
        const presentations = Arr.fromIterable(
          yield* db.workload.presentationsOf.once({ facts: {}, params: { child } }),
        );
        assert.deepStrictEqual<unknown>(
          presentations
            .filter((row) => row.stage === sitting.stage && row.k === BigInt(i))
            .map((row) => row.path),
          [entryDocuments[want.item]],
          `${what}: its candidate session presents ${want.item}`,
        );
      }
    }

    if (Option.isNone(expected.saved)) {
      return;
    }

    const item = expected.saved.value;
    const values = yield* responseParamsOf({
      RESPONSE: {
        baseType: "string",
        cardinality: "single",
        values: [{ baseType: "string", value: shownText }],
      },
    });
    const saved = yield* db.workload.saveTestItem.once({
      facts: {},
      params: { ...sitting, given: BrowserReading(0n), item, ...values },
    });
    assert.strictEqual(
      saved.kind,
      "accepted",
      `${c.name}: a save of ${item}, the member entered at`,
    );
  });

/**
 * A supersede case: a timed sitting's member saved in time, then saved again the case's offset past
 * its deadline, by the database's stamp.
 */
type SupersedeCase = Readonly<{ name: string; pastMicros: bigint }>;

/**
 * The budget a supersede case's candidate session begins with, two seconds: the first save lands a
 * second into it, and the later one at the case's offset past it, each at the instant the case
 * states on the moved clock.
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
 * One supersede case: a fresh child's sitting of the timed test, taken by the test runtime's own
 * take (`takeSitting`), entered with the case's budget, which presents {@link MEMBER}; its save of
 * the first text a second into the session; then, at the case's offset past the deadline, its save
 * of the later text, held to the table; then, a second later, the end with its finish, and the
 * member's one attempt held to submit the text the table says. Every instant is the moved clock's:
 * the take at {@link clockStart}, the entry a second after it.
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

    const { at, db } = yield* clockedDb;
    const sitting = { child, stage: 1n };
    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { ...sitting, package: PACKAGE, path: TIMED_TEST, seed: DECISION },
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as the take writes it`);

    const began = clockStart + oneSecond;
    const entered = yield* at(
      began,
      db.workload.enterTimedTest.once({
        facts: {},
        params: { ...sitting, item: MEMBER, remaining: supersedeBudgetMicros },
      }),
    );
    assert.deepStrictEqual<unknown>(
      { at: entryInstantsOf(entered.reads), kind: entered.kind },
      { at: [began], kind: "accepted" },
      `${c.name}: the timed entry, at the instant the case states`,
    );

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
            params: { ...sitting, given: BrowserReading(began), item: MEMBER, ...values },
          }),
        );
      });
    const first = yield* at(began + oneSecond, saveOf(supersedeTexts.first));
    assert.isTrue(
      Result.isSuccess(first) && first.success.kind === "accepted",
      `${c.name}: the in-time save, got ${Formatter.format(first)}`,
    );

    const arrives = began + supersedeBudgetMicros + c.pastMicros;
    const later = yield* at(arrives, saveOf(supersedeTexts.later));
    if (want.later === "accepted") {
      assert.isTrue(
        Result.isSuccess(later) && later.success.kind === "accepted",
        `${c.name}: the later save admitted, got ${Formatter.format(later)}`,
      );
    } else {
      assert.isTrue(
        Result.isFailure(later) &&
          later.failure.kind === "refused" &&
          refusedBy(later.failure.refused, "Response in time"),
        `${c.name}: the later save refused by "Response in time", got ${Formatter.format(later)}`,
      );
    }

    const ended = yield* at(
      arrives + oneSecond,
      db.workload.finishTest.once({ facts: {}, params: sitting }),
    );
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
 * with, each instant on the moved clock and stated from the session's beginning.
 *
 * - `pause`: a second in, the candidate pauses, a beacon, then a suspension, in one transaction, then
 *   resumes.
 * - `lapse`: a beacon a second in, then two seconds of no sign (a closed tab), then the application
 *   suspends the session it finds abandoned, and the candidate resumes.
 * - `lapsePastDeadline`: the same with a one-second budget and the beacon half a second in, so the
 *   deadline passes while the tab is closed.
 * - `presentPastDeadline`: a beacon a microsecond past a one-second budget's deadline, then, two
 *   seconds later, a suspension.
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
    ? oneSecond
    : 600n * oneSecond;

/**
 * Each presence case's last sign of presence, its pause or its beacon, from its session's
 * beginning: a second in, half a second into a one-second budget whose deadline then passes while
 * the tab is closed, or the microsecond past that deadline for a sign past it.
 */
const lastSigns = {
  lapse: oneSecond,
  lapsePastDeadline: oneSecond / 2n,
  pause: oneSecond,
  presentPastDeadline: oneSecond + 1n,
} as const satisfies Readonly<Record<PresenceCase["ending"], bigint>>;

/**
 * A closed tab's time, from a presence case's beacon to the suspension, two seconds: a pause
 * carries its own beacon and has none.
 */
const absence = 2n * oneSecond;

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
    ? ({ kind: "refused", law: "Suspended in time" } as const)
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
 * One presence case: a fresh child's sitting of the timed test, taken by the test runtime's own
 * take (`takeSitting`), entered with the case's budget; then its ending, held to the table; and,
 * where the suspension is accepted, a resumption a second after it, whose budget is held to the
 * first budget less the time the table charges, from the session's start to its last sign of
 * presence, and the member the start presented, whose built-in `duration` (the CQPM window's part)
 * is held to the same time: a closed tab's time counts against neither the budget nor a child's
 * rate. Every instant is the moved clock's: the take at {@link clockStart}, the entry a second
 * after it.
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
    const { at, db } = yield* clockedDb;
    const sitting = { child, stage: 1n };
    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { ...sitting, package: PACKAGE, path: TIMED_TEST, seed: DECISION },
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as the take writes it`);

    const budget = presenceBudgetOf(c);
    const began = clockStart + oneSecond;
    const entered = yield* at(
      began,
      db.workload.enterTimedTest.once({
        facts: {},
        params: { ...sitting, item: MEMBER, remaining: budget },
      }),
    );
    assert.deepStrictEqual<unknown>(
      { at: entryInstantsOf(entered.reads), kind: entered.kind },
      { at: [began], kind: "accepted" },
      `${c.name}: the timed entry, at the instant the case states`,
    );

    const sign = began + lastSigns[c.ending];
    const suspension = c.ending === "pause" ? sign : sign + absence;
    if (c.ending === "pause") {
      const paused = yield* at(sign, db.workload.pauseTest.once({ facts: {}, params: sitting }));
      assert.strictEqual(paused.kind, "accepted", `${c.name}: the pause`);
    } else {
      const beaconed = yield* at(sign, db.workload.beaconTest.once({ facts: {}, params: sitting }));
      assert.strictEqual(beaconed.kind, "accepted", `${c.name}: the beacon`);

      const suspended = yield* Effect.result(
        at(suspension, db.workload.suspendTest.once({ facts: {}, params: sitting })),
      );
      if (want.kind === "refused") {
        assert.isTrue(
          Result.isFailure(suspended) &&
            suspended.failure.kind === "refused" &&
            refusedBy(suspended.failure.refused, want.law),
          `${c.name}: the suspension refused by ${want.law}, got ${Formatter.format(suspended)}`,
        );
        note("a sign past the deadline refused its suspension");

        return;
      }

      assert.isTrue(
        Result.isSuccess(suspended) && suspended.success.kind === "accepted",
        `${c.name}: the suspension, got ${Formatter.format(suspended)}`,
      );
    }

    const resumed = yield* at(
      suspension + oneSecond,
      db.workload.enterTest.once({
        facts: {},
        params: { ...sitting, item: MEMBER },
      }),
    );
    assert.strictEqual(resumed.kind, "accepted", `${c.name}: the resumption`);

    const budgets = Arr.fromIterable(
      yield* db.workload.budgetsOf.once({ facts: {}, params: { child } }),
    );
    assert.deepStrictEqual<unknown>(
      budgets.filter((row) => row.k === 1n).map((row) => String(row.remaining)),
      [String(budget - lastSigns[c.ending])],
      `${c.name}: the resumption's budget, the first less the time to the last sign of presence`,
    );

    const durations = Arr.fromIterable(
      yield* db.workload.durationsOf.once({ facts: {}, params: { child } }),
    ).filter((row) => row.package === PACKAGE && row.path === SHORT);
    assert.deepStrictEqual<unknown>(
      durations.map((row) => String(row.micros)),
      [String(lastSigns[c.ending])],
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

/**
 * An item session's control and state, as the showing table states them for one session at one
 * checkpoint: the control it is delivered under, its attempts, whether it is closed, and the
 * attempts its max-attempts leaves it, none under 0 and for an adaptive item.
 */
type SessionWant = Readonly<{
  control: SessionControl;
  attempts: bigint;
  closed: boolean;
  left: Option.Option<bigint>;
}>;

/**
 * A showing case: an item stage of one item, its control stated by its decision and its attempts,
 * each ending as the draw family's do (an item that is no draw item takes host-row attempts with no
 * response); or a sitting of a test, taken, then its members answered (`answered`), or its first
 * member attempted and the sitting ended (`ended`). Each lists what its item sessions are, by item,
 * at each checkpoint: after the begin or the take, then after each attempt or move.
 */
type ShowingCase =
  | Readonly<{
      kind: "stage";
      name: string;
      path: string;
      control: SessionControl & Readonly<{ validateResponses: boolean }>;
      endings: readonly Ending[];
      checkpoints: readonly (readonly (readonly [string, SessionWant])[])[];
      situations: readonly ShowingSituation[];
    }>
  | Readonly<{
      kind: "sitting";
      name: string;
      test: string;
      moves: "answered" | "ended";
      checkpoints: readonly (readonly (readonly [string, SessionWant])[])[];
      situations: readonly ShowingSituation[];
    }>;

/**
 * The situations the showing space must reach.
 */
const showingSituations = [
  "an item stage under its decision's control",
  "a setting from the item ref's own control",
  "a setting from the section that holds it",
  "the inner section's setting over the outer's",
  "a setting from the part",
  "QTI's defaults where no scope writes one",
  "feedback shown while attempts remain",
  "feedback hidden once closed under show-feedback false",
  "feedback shown once closed under show-feedback true",
  "the solution once closed under show-solution true",
  "marks after the last attempt with feedback hidden",
  "max-attempts 3 open until its third",
  "max-attempts 0 open after an attempt",
  "an adaptive item open until completed",
  "the end closes every member",
] as const;

type ShowingSituation = (typeof showingSituations)[number];

/**
 * A session's want: limited, its left what its max-attempts leaves after `attempts`.
 */
const limited = (control: SessionControl, attempts: bigint, closed: boolean): SessionWant => ({
  attempts,
  closed,
  control,
  left: Option.some(control.maxAttempts - attempts),
});

/**
 * A session's want with no left: under max-attempts 0, or of an adaptive item.
 */
const unlimited = (control: SessionControl, attempts: bigint, closed: boolean): SessionWant => ({
  attempts,
  closed,
  control,
  left: Option.none(),
});

/**
 * The controls the showing test's members are delivered under, each the nearest scope's
 * ({@link showingTestXml}), and a member's under no control.
 */
const showingControls = {
  draft: { maxAttempts: 0n, showFeedback: false, showSolution: true },
  member: { maxAttempts: 1n, showFeedback: false, showSolution: false },
  memberMin: { maxAttempts: 1n, showFeedback: false, showSolution: true },
  none: { maxAttempts: 1n, showFeedback: false, showSolution: false },
  saved: { maxAttempts: 1n, showFeedback: true, showSolution: true },
} as const satisfies Record<string, SessionControl>;

/**
 * The stage controls the showing cases state, each as an application's decision states one.
 */
const stageControls = {
  adaptive: { maxAttempts: 1n, showFeedback: false, showSolution: true, validateResponses: false },
  direct: directControl,
  hidden: { maxAttempts: 1n, showFeedback: false, showSolution: true, validateResponses: false },
  three: { maxAttempts: 3n, showFeedback: false, showSolution: false, validateResponses: false },
} as const;

/**
 * The control part of a stage control.
 */
const controlOf = ({
  maxAttempts,
  showFeedback,
  showSolution,
}: SessionControl): SessionControl => ({
  maxAttempts,
  showFeedback,
  showSolution,
});

/**
 * The showing table: every case, with what each of its item sessions is at each checkpoint,
 * written from QTI 3.0.1's rule (information model §7.19 and Table 7.19.1), not the code.
 */
const showingCases = [
  {
    checkpoints: [
      [[SHORT, limited(controlOf(stageControls.direct), 0n, false)]],
      [[SHORT, limited(controlOf(stageControls.direct), 1n, true)]],
    ],
    control: stageControls.direct,
    endings: ["drawn"],
    kind: "stage",
    name: "an item stage under direct's control, one attempt",
    path: SHORT,
    situations: [
      "an item stage under its decision's control",
      "feedback shown while attempts remain",
      "feedback shown once closed under show-feedback true",
    ],
  },
  {
    checkpoints: [
      [[SHORT, limited(controlOf(stageControls.hidden), 0n, false)]],
      [[SHORT, limited(controlOf(stageControls.hidden), 1n, true)]],
    ],
    control: stageControls.hidden,
    endings: ["drawn"],
    kind: "stage",
    name: "an item stage hiding its feedback, its solution once closed",
    path: SHORT,
    situations: [
      "an item stage under its decision's control",
      "feedback hidden once closed under show-feedback false",
      "the solution once closed under show-solution true",
      "marks after the last attempt with feedback hidden",
    ],
  },
  {
    checkpoints: [0n, 1n, 2n, 3n].map((attempts) => [
      [SHORT, limited(controlOf(stageControls.three), attempts, attempts === 3n)],
    ]),
    control: stageControls.three,
    endings: ["drawn", "drawn", "drawn"],
    kind: "stage",
    name: "an item stage of max-attempts 3",
    path: SHORT,
    situations: [
      "an item stage under its decision's control",
      "max-attempts 3 open until its third",
      "feedback shown while attempts remain",
      "feedback hidden once closed under show-feedback false",
    ],
  },
  {
    checkpoints: [
      [[drawPathOf(true), unlimited(controlOf(stageControls.adaptive), 0n, false)]],
      [[drawPathOf(true), unlimited(controlOf(stageControls.adaptive), 1n, false)]],
      [[drawPathOf(true), unlimited(controlOf(stageControls.adaptive), 2n, true)]],
    ],
    control: stageControls.adaptive,
    endings: ["drawn", "right"],
    kind: "stage",
    name: "an adaptive item stage, open past its max-attempts until completed",
    path: drawPathOf(true),
    situations: [
      "an item stage under its decision's control",
      "an adaptive item open until completed",
      "the solution once closed under show-solution true",
    ],
  },
  {
    checkpoints: [
      [
        [SHORT, limited(showingControls.member, 0n, false)],
        [OTHER, limited(showingControls.saved, 0n, false)],
        [MEMBER_MIN, limited(showingControls.memberMin, 0n, false)],
        [DRAFT_MIN, unlimited(showingControls.draft, 0n, false)],
      ],
      [
        [SHORT, limited(showingControls.member, 1n, true)],
        [OTHER, limited(showingControls.saved, 0n, false)],
        [MEMBER_MIN, limited(showingControls.memberMin, 0n, false)],
        [DRAFT_MIN, unlimited(showingControls.draft, 0n, false)],
      ],
      [
        [SHORT, limited(showingControls.member, 1n, true)],
        [OTHER, limited(showingControls.saved, 0n, false)],
        [MEMBER_MIN, limited(showingControls.memberMin, 0n, false)],
        [DRAFT_MIN, unlimited(showingControls.draft, 1n, false)],
      ],
    ],
    kind: "sitting",
    moves: "answered",
    name: "a test's members under the nearest scope's settings, answered",
    situations: [
      "a setting from the item ref's own control",
      "a setting from the section that holds it",
      "the inner section's setting over the outer's",
      "a setting from the part",
      "max-attempts 0 open after an attempt",
      "feedback hidden once closed under show-feedback false",
      "marks after the last attempt with feedback hidden",
    ],
    test: SHOWING_TEST,
  },
  {
    checkpoints: [
      [
        [SHORT, limited(showingControls.member, 0n, false)],
        [OTHER, limited(showingControls.saved, 0n, false)],
        [MEMBER_MIN, limited(showingControls.memberMin, 0n, false)],
        [DRAFT_MIN, unlimited(showingControls.draft, 0n, false)],
      ],
      [
        [SHORT, limited(showingControls.member, 1n, true)],
        [OTHER, limited(showingControls.saved, 0n, true)],
        [MEMBER_MIN, limited(showingControls.memberMin, 0n, true)],
        [DRAFT_MIN, unlimited(showingControls.draft, 0n, true)],
      ],
    ],
    kind: "sitting",
    moves: "ended",
    name: "a test's members after its end",
    situations: [
      "the end closes every member",
      "feedback shown once closed under show-feedback true",
      "the solution once closed under show-solution true",
    ],
    test: SHOWING_TEST,
  },
  {
    checkpoints: [
      [
        [SHORT, limited(showingControls.none, 0n, false)],
        [OTHER, limited(showingControls.none, 0n, false)],
      ],
      [
        [SHORT, limited(showingControls.none, 1n, true)],
        [OTHER, limited(showingControls.none, 0n, false)],
      ],
    ],
    kind: "sitting",
    moves: "answered",
    name: "a test under no control, answered, as metis's converted tests are",
    situations: [
      "QTI's defaults where no scope writes one",
      "marks after the last attempt with feedback hidden",
      "feedback shown while attempts remain",
    ],
    test: UNTIMED_TEST,
  },
] as const satisfies readonly ShowingCase[];

const showingSpace: Gen<ShowingCase> = element(showingCases);

/**
 * What a review of a session shows by the rule (§1 of BL-FINISH's Showing note): feedback while it
 * is open, else where its show-feedback is true; marks where feedback shows or it closed; the
 * solution once closed, where its show-solution is true.
 *
 * @param want - The session's want.
 * @returns What its review shows.
 */
const showsOfWant = ({ closed, control }: SessionWant): ReviewShows => {
  const feedback = !closed || control.showFeedback;

  return { feedback, marks: feedback || closed, solution: closed && control.showSolution };
};

/**
 * Each item session's pairs in the order of its item's path.
 *
 * @param pairs - Each pair, by its item's path.
 * @returns The pairs, by path.
 */
const byPath = <A>(pairs: readonly (readonly [string, A])[]) =>
  Arr.sort(
    pairs,
    Order.mapInput(Order.String, ([path]: readonly [string, A]) => path),
  );

/**
 * One showing case: a fresh child's item stage, begun with its decision's control and attempted,
 * or its sitting, taken by the test runtime's own take and moved as the case says; after the begin
 * or the take and after each attempt or move, every item session of the child is read as every
 * application reads it (`sessionsOf`, the ledger's `sessionControlOf`), and its control, its
 * attempts, whether it is closed, its attempts left and what its review shows
 * (`sessionFactsOf`, `reviewShowsOf`) are held to the table.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdShowing = (c: ShowingCase, child: string, note: (situation: ShowingSituation) => void) =>
  Effect.gen(function* hold() {
    for (const situation of c.situations) {
      note(situation);
    }

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const stage = 1n;
    const sitting = { child, stage };
    const checkpoint = (k: number) =>
      Effect.gen(function* read() {
        const rows = Arr.fromIterable(
          yield* db.workload.sessionsOf.once({ facts: {}, params: { child } }),
        );
        const got = yield* Effect.all(
          rows.map((row) =>
            sessionFactsOf(row.control).pipe(Effect.map((facts) => [row.path, facts] as const)),
          ),
        );
        const want = c.checkpoints[k] ?? [];
        assert.deepStrictEqual<unknown>(
          got.map(([path, facts]) => [
            path,
            {
              attempts: facts.session.attempts,
              closed: facts.session.closed,
              control: facts.control,
              left: facts.session.left,
              shows: reviewShowsOf(facts),
            },
          ]),
          byPath(want).map(([path, session]) => [
            path,
            { ...session, shows: showsOfWant(session) },
          ]),
          `${c.name}, at checkpoint ${String(k)}: every item session's control, state and review`,
        );
      });

    if (c.kind === "stage") {
      const key = { child, n: 0n, package: PACKAGE, path: c.path };
      const begun = yield* db.workload.begin.once({
        facts: {
          insert: {
            StageControl: rowsOf("StageControl", [{ child, stage, ...c.control }]),
          },
        },
        params: { child, package: PACKAGE, path: c.path, seed: SEED, stage },
      });
      assert.strictEqual(begun.kind, "accepted", `${c.name}: the item stage, begun`);
      yield* checkpoint(0);

      for (const [k, ending] of c.endings.entries()) {
        const draws = c.path === drawPathOf(true);
        const { drawn, ticked } = responsesOf(ending);
        yield* db.workload.facts.once({
          facts: {
            insert: {
              Attempt: rowsOf("Attempt", [key]),
              ProcessedAttempt: rowsOf("ProcessedAttempt", []),
              ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...key, kind: "attempt" }]),
              SnapshotMultipleIdentifier: rowsOf(
                "SnapshotMultipleIdentifier",
                draws
                  ? ticked.map((value) => ({ ...key, count: 1n, value, variable: "RESPONSE" }))
                  : [],
              ),
              SnapshotSingleBoolean: rowsOf(
                "SnapshotSingleBoolean",
                draws ? [{ ...key, value: drawn, variable: "DRAWN" }] : [],
              ),
              SnapshotSingleFloat: rowsOf("SnapshotSingleFloat", []),
              SnapshotSingleString: rowsOf("SnapshotSingleString", []),
            },
          },
          params: {},
        });

        if (draws) {
          yield* db.workload.grade.once({ facts: {}, params: key });
        }

        yield* checkpoint(k + 1);
      }

      return;
    }

    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { ...sitting, package: PACKAGE, path: c.test, seed: DECISION },
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as the take writes it`);
    yield* checkpoint(0);

    const entered = yield* db.workload.enterTest.once({
      facts: {},
      params: { ...sitting, item: MEMBER },
    });
    assert.strictEqual(entered.kind, "accepted", `${c.name}: the entry`);

    const began = Option.getOrThrow(Arr.head(Arr.fromIterable(entered.reads.entered))).at;
    const values = yield* responseParamsOf({
      RESPONSE: {
        baseType: "string",
        cardinality: "single",
        values: [{ baseType: "string", value: controlTexts.long }],
      },
    });
    const answerMember = (item: string) =>
      Effect.gen(function* answered() {
        const outcome = yield* db.workload.answerTestItem.once({
          facts: {},
          params: { ...sitting, given: BrowserReading(began), item, next: [], ...values },
        });
        assert.strictEqual(outcome.kind, "accepted", `${c.name}: the answer of ${item}`);
      });

    if (c.moves === "ended") {
      const attempt = { child, n: 0n, package: PACKAGE, path: SHORT };
      const attempted = yield* db.workload.sittingFacts.once({
        facts: {
          insert: {
            Attempt: rowsOf("Attempt", [attempt]),
            ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...attempt, kind: "attempt" }]),
          },
        },
        params: {},
      });
      assert.strictEqual(attempted.kind, "accepted", `${c.name}: the first member's attempt`);

      const ended = yield* db.workload.endTest.once({ facts: {}, params: sitting });
      assert.strictEqual(ended.kind, "accepted", `${c.name}: the end`);
      yield* checkpoint(1);

      return;
    }

    yield* answerMember(MEMBER);
    yield* checkpoint(1);
    if (c.test === SHOWING_TEST) {
      const presented = yield* db.workload.presentItem.once({
        facts: {},
        params: { ...sitting, item: DRAFT_REF },
      });
      assert.strictEqual(presented.kind, "accepted", `${c.name}: the presentation of ${DRAFT_REF}`);
      yield* answerMember(DRAFT_REF);
      yield* checkpoint(2);
    }
  });

/**
 * A case's Db over the moved clock, as {@link clockedDb} opens it.
 */
type ClockedDb = Effect.Success<typeof clockedDb>;

/**
 * A fresh child's sitting of the untimed test, taken by the test runtime's own take
 * (`takeSitting`) at {@link clockStart} and entered a second after it, `began`: its member
 * {@link MEMBER} on screen from the instant its first candidate session began, the entry's, which
 * the case states and reads back; with the case's Db over the moved clock and the `at` that states
 * its next instant.
 *
 * @param name - The case's name, for its assertions.
 * @param child - The run's fresh child.
 */
const enteredSitting = (name: string, child: string) =>
  Effect.gen(function* enter() {
    const { at, db } = yield* clockedDb;
    const sitting = { child, stage: 1n };
    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { ...sitting, package: PACKAGE, path: UNTIMED_TEST, seed: DECISION },
    });
    assert.strictEqual(taken.kind, "accepted", `${name}: the sitting, as the take writes it`);

    const began = clockStart + oneSecond;
    const entered = yield* at(
      began,
      db.workload.enterTest.once({
        facts: {},
        params: { ...sitting, item: MEMBER },
      }),
    );
    assert.deepStrictEqual<unknown>(
      { at: entryInstantsOf(entered.reads), kind: entered.kind },
      { at: [began], kind: "accepted" },
      `${name}: the entry, at the instant the case states`,
    );

    return { at, began, db, sitting } as const;
  });

/**
 * A presence window by its ends, half-open in microseconds on the database's clock: `[first, last
 *
 * - 1 µs)`.
 */
type Window = readonly [start: bigint, end: bigint];

/**
 * What a sitting's presence reads say after a case: its windows, by their start; the present time
 * of each question visit with any, keyed by the visit's instant, summed over its UTC days, so two
 * reads are one where they credit each visit alike, whatever order the read returns its rows in
 * (`presentTimesOf` returns them by its key, the day and the time before the visit); and its last
 * beacon.
 */
type PresenceReads = Readonly<{
  credits: ReadonlyMap<bigint, bigint>;
  last: bigint;
  windows: readonly Window[];
}>;

/**
 * A sitting's presence reads, through the suite's readers of `Presence`, `PresentTime` and
 * `LastPresence`, one child's at a time.
 *
 * @param db - The case's Db.
 * @param child - The case's child.
 */
const presenceReadsOf = (db: ClockedDb["db"], child: string) =>
  Effect.gen(function* read() {
    const windows = Arr.fromIterable(
      yield* db.workload.windowsOf.once({ facts: {}, params: { child } }),
    ).map((row): Window => [row.from, row.to]);
    const credits = new Map<bigint, bigint>();
    for (const row of yield* db.workload.presentTimesOf.once({ facts: {}, params: { child } })) {
      credits.set(row.at, (credits.get(row.at) ?? 0n) + BigInt(row.micros.toString()));
    }
    const last = Option.getOrThrow(
      Arr.head(
        Arr.fromIterable(yield* db.workload.lastPresencesOf.once({ facts: {}, params: { child } })),
      ),
    ).at;

    return {
      credits,
      last,
      windows,
    } satisfies PresenceReads;
  });

/**
 * A presence-window case: how its moves go on a fresh child's untimed sitting, entered, its first
 * member on screen from the entry, each move at an instant of the moved clock the case states.
 *
 * - `grows`: two beacons 1.5 s apart, within the grace.
 * - `graceJoins`: two beacons exactly the grace apart.
 * - `opensPastGrace`: two beacons the grace and a microsecond apart.
 * - `overlapRefused`: a window, then a window written as host rows inside it, and one just past it.
 * - `pause`: a beacon, a pause (a beacon, then a suspension, in one transaction) two seconds later, a
 *   resumption a second after it and a beacon a second after that, each gap within the grace.
 * - `tail`: a beacon, another a second later, then two seconds of no sign (a closed tab) and the
 *   application's suspension of the session it finds abandoned.
 */
type WindowCase = Readonly<{
  beacons: "grows" | "graceJoins" | "opensPastGrace" | "overlapRefused" | "pause" | "tail";
  name: string;
}>;

/**
 * Every presence-window case.
 */
const windowCases = [
  { beacons: "grows", name: "two beacons within the grace grow one window" },
  { beacons: "graceJoins", name: "two beacons exactly the grace apart share one window" },
  { beacons: "opensPastGrace", name: "a beacon past the grace opens a window of its own" },
  { beacons: "overlapRefused", name: "a window overlapping another is refused by the key" },
  { beacons: "pause", name: "a window across a pause credits nothing of the suspension" },
  { beacons: "tail", name: "a closed tab's time after the last beacon credits nothing" },
] as const satisfies readonly WindowCase[];

const windowSpace: Gen<WindowCase> = element(windowCases);

/**
 * A move of a presence-window case: a beacon, a pause, a resumption at {@link MEMBER} or the
 * application's suspension, at microseconds after the sitting's entry.
 */
type WindowMove = Readonly<{ after: bigint; move: "beacon" | "pause" | "resume" | "suspend" }>;

/**
 * What a presence-window case's moves are and what its reads must say after them: the windows, the
 * present time of each question visit with any, by its instant, and the last beacon they leave,
 * all in microseconds after the sitting's entry; or, after its beacons, a window overlapping
 * another, and one adjacent.
 */
type WindowExpected =
  | Readonly<{
      credits: readonly (readonly [visit: bigint, micros: bigint])[];
      kind: "moves";
      last: bigint;
      moves: readonly WindowMove[];
      reaches: WindowSituation;
      windows: readonly Window[];
    }>
  | Readonly<{ adjacent: Window; inside: Window; kind: "overlap"; moves: readonly WindowMove[] }>;

/**
 * A beacon a case sends, at microseconds after the sitting's entry.
 *
 * @param after - When it is sent.
 */
const beaconAfter = (after: bigint): WindowMove => ({ after, move: "beacon" });

/**
 * The presence-window table, each case's moves at microseconds after the sitting's entry and what
 * its reads must say, by the owner's presence design (2026-11-23): a beacon within 3 s of the
 * sitting's latest window grows it, any other opens one; a window is `[first, last + 1 µs)` and
 * credits from its first beacon to its last; no two windows of a sitting overlap; time credit is
 * cut at a suspension, and ends at the last beacon, never at what follows it.
 */
const windowExpected = {
  graceJoins: {
    credits: [[0n, 3_000_000n]],
    kind: "moves",
    last: 3_500_000n,
    moves: [beaconAfter(500_000n), beaconAfter(3_500_000n)],
    reaches: "a gap of exactly the grace joins",
    windows: [[500_000n, 3_500_001n]],
  },
  grows: {
    credits: [[0n, 1_500_000n]],
    kind: "moves",
    last: 2_000_000n,
    moves: [beaconAfter(500_000n), beaconAfter(2_000_000n)],
    reaches: "a window grown within the grace",
    windows: [[500_000n, 2_000_001n]],
  },
  opensPastGrace: {
    credits: [],
    kind: "moves",
    last: 3_500_001n,
    moves: [beaconAfter(500_000n), beaconAfter(3_500_001n)],
    reaches: "a gap past the grace opens a window",
    windows: [
      [500_000n, 500_001n],
      [3_500_001n, 3_500_002n],
    ],
  },
  overlapRefused: {
    adjacent: [2_000_001n, 2_000_002n],
    inside: [1_000_000n, 1_000_001n],
    kind: "overlap",
    moves: [beaconAfter(500_000n), beaconAfter(2_000_000n)],
  },
  pause: {
    credits: [
      [0n, 2_000_000n],
      [4_000_000n, 1_000_000n],
    ],
    kind: "moves",
    last: 5_000_000n,
    moves: [
      beaconAfter(1_000_000n),
      { after: 3_000_000n, move: "pause" },
      { after: 4_000_000n, move: "resume" },
      beaconAfter(5_000_000n),
    ],
    reaches: "a pause's suspended time credited to nothing",
    windows: [[1_000_000n, 5_000_001n]],
  },
  tail: {
    credits: [[0n, 1_000_000n]],
    kind: "moves",
    last: 2_000_000n,
    moves: [
      beaconAfter(1_000_000n),
      beaconAfter(2_000_000n),
      { after: 4_000_000n, move: "suspend" },
    ],
    reaches: "a closed tab's tail credited to nothing",
    windows: [[1_000_000n, 2_000_001n]],
  },
} as const satisfies Readonly<Record<WindowCase["beacons"], WindowExpected>>;

/**
 * The situations the presence-window space must reach.
 */
const windowSituations = [
  "a window grown within the grace",
  "a gap of exactly the grace joins",
  "a gap past the grace opens a window",
  "an overlapping window refused, an adjacent one admitted",
  "a pause's suspended time credited to nothing",
  "a closed tab's tail credited to nothing",
] as const;

type WindowSituation = (typeof windowSituations)[number];

/**
 * A presence-window move, through the test runtime's own program for it, at the instant the case
 * last stated: the kind of its outcome.
 *
 * @param db - The case's Db.
 * @param sitting - The case's sitting.
 * @param move - The move.
 */
const windowMoveOf = (
  db: ClockedDb["db"],
  sitting: Readonly<{ child: string; stage: bigint }>,
  move: WindowMove["move"],
) =>
  Effect.gen(function* windowMove() {
    switch (move) {
      case "beacon": {
        return (yield* db.workload.beaconTest.once({ facts: {}, params: sitting })).kind;
      }
      case "pause": {
        return (yield* db.workload.pauseTest.once({ facts: {}, params: sitting })).kind;
      }
      case "resume": {
        return (yield* db.workload.enterTest.once({
          facts: {},
          params: { ...sitting, item: MEMBER },
        })).kind;
      }
      case "suspend": {
        return (yield* db.workload.suspendTest.once({ facts: {}, params: sitting })).kind;
      }
    }
  });

/**
 * One presence-window case, held to {@link windowExpected}: its moves, each at the instant the
 * table states, then its reads, or its overlapping and adjacent windows.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdWindow = (c: WindowCase, child: string, note: (situation: WindowSituation) => void) =>
  Effect.gen(function* hold() {
    const want = windowExpected[c.beacons];
    const { at, began, db, sitting } = yield* enteredSitting(c.name, child);
    for (const { after, move } of want.moves) {
      const moved = yield* at(began + after, windowMoveOf(db, sitting, move));
      assert.strictEqual(moved, "accepted", `${c.name}: the ${move} at ${String(after)}`);
    }

    if (want.kind === "moves") {
      assert.deepStrictEqual<unknown>(
        yield* presenceReadsOf(db, child),
        {
          credits: new Map(want.credits.map(([visit, micros]) => [began + visit, micros])),
          last: began + want.last,
          windows: want.windows.map(([start, end]) => [began + start, began + end]),
        },
        `${c.name}: the windows, each visit's present time and the last beacon`,
      );
      note(want.reaches);

      return;
    }

    const windowAt = ([start, end]: Window) =>
      Effect.result(
        db.workload.windowFacts.once({
          facts: {
            insert: {
              Presence: rowsOf("Presence", [
                { ...sitting, during: { end: began + end, start: began + start } },
              ]),
            },
          },
          params: {},
        }),
      );
    const inside = yield* windowAt(want.inside);
    assert.isTrue(
      Result.isFailure(inside) &&
        inside.failure.kind === "refused" &&
        refusedLawsOf(inside.failure.refused).some(
          (refusal) => refusal.law.kind === "primaryKey" && refusal.law.relation === "Presence",
        ),
      `${c.name}: the window inside another refused by Presence's key, got ${Formatter.format(inside)}`,
    );

    const adjacent = yield* windowAt(want.adjacent);
    assert.isTrue(
      Result.isSuccess(adjacent) && adjacent.success.kind === "accepted",
      `${c.name}: the window from the other's end admitted, half-open, got ${Formatter.format(adjacent)}`,
    );
    note("an overlapping window refused, an adjacent one admitted");
  });

/**
 * The grace on the database's clock, in microseconds, as the suite reads it.
 */
const grace = presenceGraceMicros;

/**
 * The microseconds of one UTC day.
 */
const dayMicros = 86_400_000_000n;

/**
 * The windows a sitting's beacons at these readings leave, by the presence rule stated apart from
 * the put, for readings sent in any order: the readings sorted, each run of them whose gaps are
 * each within the grace one window, `[first, last + 1 µs)`.
 *
 * @param readings - The beacons' readings.
 */
const windowsOfReadings = (readings: readonly bigint[]): readonly Window[] => {
  const sorted = [...new Set(readings)].toSorted((a, b) => (a < b ? -1 : 1));
  const runs: [bigint, bigint][] = [];
  for (const reading of sorted) {
    const run = runs.at(-1);
    if (run !== undefined && reading - run[1] <= grace) {
      run[1] = reading;
    } else {
      runs.push([reading, reading]);
    }
  }

  return runs.map(([first, last]): Window => [first, last + 1n]);
};

/**
 * The sum of microseconds.
 *
 * @param parts - The microseconds to add.
 */
const sumOf = (parts: Iterable<bigint>) => {
  let sum = 0n;
  for (const part of parts) {
    sum += part;
  }

  return sum;
};

/**
 * The UTC day a microsecond of the database's clock falls in, as its date's ISO 8601 text, the
 * value a `date` reads as.
 *
 * @param micros - The microsecond, since the Unix epoch.
 */
const utcDayOf = (micros: bigint) =>
  new Date(Number((micros / dayMicros) * 86_400_000n)).toISOString().slice(0, 10);

/**
 * A window's credit from `at` on, by UTC day: from its first beacon to its last, each day's part.
 *
 * @param windows - The sitting's windows.
 * @param at - The presentation on screen throughout, from its instant.
 */
const creditByDayOf = (windows: readonly Window[], at: bigint) => {
  const days = new Map<string, bigint>();
  for (const [start, end] of windows) {
    let from = start < at ? at : start;
    const to = end - 1n;
    while (from < to) {
      const dayEnd = (from / dayMicros + 1n) * dayMicros;
      const part = (to < dayEnd ? to : dayEnd) - from;
      const day = utcDayOf(from);
      days.set(day, (days.get(day) ?? 0n) + part);
      from = dayEnd;
    }
  }

  return days;
};

/**
 * A run of a sitting's beacons: the gaps in microseconds between its consecutive beacons by time,
 * the order they are sent in (each the place of a beacon by time), and whether they straddle a UTC
 * midnight.
 */
type BeaconRun = Readonly<{ gaps: readonly number[]; midnight: boolean; order: readonly number[] }>;

/**
 * A gap between two beacons: within the grace, the grace exactly, a microsecond past it, or far
 * past it.
 */
const gapOf: Gen<number> = oneOf([
  int(0, Number(grace) - 1),
  constant(Number(grace)),
  constant(Number(grace) + 1),
  int(Number(grace) + 1, 60_000_000),
]);

/**
 * A decision's seed, as an application draws one: a version 4 UUID in its canonical lowercase text,
 * which the take hands the database (`takenHeading`'s `seed`).
 */
const decisionSeed: Gen<`${string}-${string}-${string}-${string}-${string}`> = (source) => {
  const digits = array(int(0, 15), { max: 30, min: 30 })(source).map((d) => d.toString(16));
  const variant = int(8, 11)(source).toString(16);
  const hex = [
    ...digits.slice(0, 12),
    "4",
    ...digits.slice(12, 15),
    variant,
    ...digits.slice(15, 30),
  ].join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

/**
 * A run of the shuffled test: two sittings, each a fresh child's under a seed of its own.
 */
type ShuffleRun = Readonly<{
  first: `${string}-${string}-${string}-${string}-${string}`;
  second: `${string}-${string}-${string}-${string}-${string}`;
}>;

const shuffleRuns: Gen<ShuffleRun> = (source) => ({
  first: decisionSeed(source),
  second: decisionSeed(source),
});

/**
 * A test's members in the order a sitting under `decision` presents them, plate's protocol stated
 * apart from the database: each member of no shuffling section at its place in the document, and
 * each run of one shuffling section's members (`block`) over the places it holds, ranked by
 * HMAC-SHA-256 keyed by the decision's text over "ordering", the package's name and its item ref's
 * identifier, joined by U+001F (plate's keyedDigest), lowest first (§5.98, §5.98.1).
 *
 * @param decision - The sitting's decision seed.
 * @param members - The test's members in document order, each shuffling section's one run.
 * @returns Its members, item ref and document, in presented order.
 */
const drawnOrderOf = <
  M extends { readonly block: string | undefined; readonly path: string; readonly ref: string },
>(
  decision: string,
  members: readonly M[],
): readonly M[] => {
  const runs: M[][] = [];
  for (const member of members) {
    const run = runs.at(-1);
    if (run !== undefined && member.block !== undefined && run[0]?.block === member.block) {
      run.push(member);
    } else {
      runs.push([member]);
    }
  }

  return runs.flatMap((run) =>
    Arr.sort(
      run.map((member) => ({
        member,
        rank: createHmac("sha256", decision)
          .update(["ordering", PACKAGE, member.ref].join("\u001F"))
          .digest("hex"),
      })),
      Order.mapInput(Order.String, ({ rank }: { readonly rank: string }) => rank),
    ).map(({ member }) => member),
  );
};

/**
 * The shuffled test's members in the order a sitting under `decision` presents them
 * ({@link drawnOrderOf}): its one section shuffles all six.
 *
 * @param decision - The sitting's decision seed.
 */
const shuffledOrderOf = (decision: string) =>
  drawnOrderOf(
    decision,
    shuffledMembers.map((member) => ({ ...member, block: "section" })),
  );

/**
 * The situations the shuffle runs must reach.
 */
const shuffleSituations = [
  "a shuffled start presents the least-ranked member",
  "a member ahead of its rank is refused",
  "a member behind the one presented is refused",
  "a resumption presents the member its candidate left",
  "a sitting walks its section in rank order",
  "a sitting's order is not its document's",
  "two sittings of the test, two orders",
  "MemberPlace places a sitting's members as it presents them",
  "a mixed start presents the first member by place",
  "a shuffled member ahead of its section's first is refused",
  "a member after a shuffling section waits for all of it",
  "a member before a shuffling section is never returned to",
  "a member several places back is never returned to",
  "a mixed sitting walks its members, then each section in rank order",
  "a nonlinear sitting is placed in its order and moves freely",
  "an ordering of whitespace and a comment, over refs fixed false, is delivered",
  "an individual part's sitting starts at its least-ranked member",
] as const;

type ShuffleSituation = (typeof shuffleSituations)[number];

/**
 * One shuffle run: each of its two seeds a fresh child's sitting of the shuffled test, taken by the
 * test runtime's own take; the first started where it begins, held to present the first member of
 * its order; the third member presented, refused by "Linear in order"; the second presented; the
 * sitting suspended and resumed, held to present the second again; the first presented, refused by
 * "Linear never back"; then the rest presented in order, and every presentation of the sitting held
 * to the order {@link shuffledOrderOf} gives. The second sitting is started and walked the same
 * way, and held to its own seed's order.
 *
 * @param run - The two seeds.
 * @param child - The run's fresh child, a suffix of which names each sitting's child.
 * @param note - Records the situation the run reaches.
 */
const holdShuffle = (run: ShuffleRun, child: string, note: (situation: ShuffleSituation) => void) =>
  Effect.gen(function* hold() {
    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const walked = (
      seed: `${string}-${string}-${string}-${string}-${string}`,
      learner: string,
      probe: boolean,
    ) =>
      Effect.gen(function* walk() {
        const order = shuffledOrderOf(seed);
        const sitting = { child: learner, stage: 1n };
        const taken = yield* db.workload.takeSitting.once({
          facts: {},
          params: { ...sitting, package: PACKAGE, path: SHUFFLED_TEST, seed },
        });
        assert.strictEqual(taken.kind, "accepted", `${seed}: the sitting, as the take writes it`);

        const started = yield* db.workload.resumeTest.once({ facts: {}, params: sitting });
        assert.strictEqual(started.kind, "accepted", `${seed}: the start`);

        const at = (i: number) => Option.getOrThrow(Arr.get(order, i));
        const presentAt = (i: number) =>
          Effect.result(
            db.workload.presentItem.once({ facts: {}, params: { ...sitting, item: at(i).ref } }),
          );
        if (probe) {
          const ahead = yield* presentAt(2);
          assert.isTrue(
            Result.isFailure(ahead) &&
              ahead.failure.kind === "refused" &&
              refusedBy(ahead.failure.refused, "Linear in order"),
            `${seed}: the third member first, refused by "Linear in order", got ${Formatter.format(ahead)}`,
          );
          note("a member ahead of its rank is refused");
        }

        assert.strictEqual(
          Result.getOrThrow(yield* presentAt(1)).kind,
          "accepted",
          `${seed}: the second member`,
        );
        if (probe) {
          const suspended = yield* db.workload.suspendTest.once({ facts: {}, params: sitting });
          assert.strictEqual(suspended.kind, "accepted", `${seed}: the suspension`);

          const resumed = yield* db.workload.resumeTest.once({ facts: {}, params: sitting });
          assert.strictEqual(resumed.kind, "accepted", `${seed}: the resumption`);

          const behind = yield* presentAt(0);
          assert.isTrue(
            Result.isFailure(behind) &&
              behind.failure.kind === "refused" &&
              refusedBy(behind.failure.refused, "Linear never back"),
            `${seed}: the first member again, refused by "Linear never back", got ${Formatter.format(behind)}`,
          );
          note("a member behind the one presented is refused");
        }

        for (const i of Arr.range(2, order.length - 1)) {
          assert.strictEqual(
            Result.getOrThrow(yield* presentAt(i)).kind,
            "accepted",
            `${seed}: member ${String(i + 1)} of its order`,
          );
        }

        const presented = Arr.fromIterable(
          yield* db.workload.presentationsOf.once({ facts: {}, params: { child: learner } }),
        ).map(({ path }) => path);
        const expected = probe
          ? [at(0).path, at(1).path, at(1).path, ...order.slice(2).map(({ path }) => path)]
          : order.map(({ path }) => path);
        assert.deepStrictEqual<unknown>(
          presented,
          expected,
          `${seed}: the sitting presents its section in its ranks' order`,
        );
        assert.deepStrictEqual<unknown>(
          Arr.fromIterable(
            yield* db.workload.placesOf.once({ facts: {}, params: { child: learner } }),
          ).map(({ path }) => path),
          order.map(({ path }) => path),
          `${seed}: MemberPlace places the sitting's members in its ranks' order`,
        );
        note("a shuffled start presents the least-ranked member");
        note("a sitting walks its section in rank order");
        note("MemberPlace places a sitting's members as it presents them");
        if (probe) {
          note("a resumption presents the member its candidate left");
        }

        if (order.some(({ ref }, i) => ref !== shuffledMembers[i]?.ref)) {
          note("a sitting's order is not its document's");
        }

        return order.map(({ ref }) => ref);
      });

    const first = yield* walked(run.first, `${child}a`, true);
    const second = yield* walked(run.second, `${child}b`, false);
    if (first.join(",") !== second.join(",")) {
      note("two sittings of the test, two orders");
    }

    /**
     * A fresh sitting of `test` under `seed`, taken and started: what it presented first, and its
     * places' item documents in order.
     */
    const started = (
      test: string,
      seed: `${string}-${string}-${string}-${string}-${string}`,
      learner: string,
    ) =>
      Effect.gen(function* start() {
        const sitting = { child: learner, stage: 1n };
        const taken = yield* db.workload.takeSitting.once({
          facts: {},
          params: { ...sitting, package: PACKAGE, path: test, seed },
        });
        assert.strictEqual(taken.kind, "accepted", `${test} ${seed}: the take`);

        const entered = yield* db.workload.resumeTest.once({ facts: {}, params: sitting });
        assert.strictEqual(entered.kind, "accepted", `${test} ${seed}: the start`);

        return {
          places: Arr.fromIterable(
            yield* db.workload.placesOf.once({ facts: {}, params: { child: learner } }),
          ).map(({ path }) => path),
          present: (ref: string) =>
            Effect.result(
              db.workload.presentItem.once({ facts: {}, params: { ...sitting, item: ref } }),
            ),
          presented: Arr.fromIterable(
            yield* db.workload.presentationsOf.once({ facts: {}, params: { child: learner } }),
          ).map(({ path }) => path),
        };
      });

    // The linear mixed test: the first member by place, refusals across the sections' runs, then
    // its order walked.
    const mixed = drawnOrderOf(run.first, mixedMembers);
    const mixedAt = (i: number) => Option.getOrThrow(Arr.get(mixed, i));
    const linear = yield* started(SHUFFLED_MIXED_TEST, run.first, `${child}c`);
    assert.deepStrictEqual<unknown>(linear.presented, [SHORT], `${run.first}: the mixed start`);
    note("a mixed start presents the first member by place");

    const ahead = yield* linear.present(mixedAt(2).ref);
    assert.isTrue(
      Result.isFailure(ahead) &&
        ahead.failure.kind === "refused" &&
        refusedBy(ahead.failure.refused, "Linear in order"),
      `${run.first}: the first section's second-ranked first, refused by "Linear in order", got ${Formatter.format(ahead)}`,
    );
    note("a shuffled member ahead of its section's first is refused");

    const past = yield* linear.present(HUMAN_REF);
    assert.isTrue(
      Result.isFailure(past) &&
        past.failure.kind === "refused" &&
        refusedBy(past.failure.refused, "Linear in order"),
      `${run.first}: the member after both sections, refused by "Linear in order", got ${Formatter.format(past)}`,
    );
    note("a member after a shuffling section waits for all of it");
    assert.strictEqual(
      Result.getOrThrow(yield* linear.present(mixedAt(1).ref)).kind,
      "accepted",
      `${run.first}: the first section's first-ranked`,
    );

    const back = yield* linear.present(MEMBER);
    assert.isTrue(
      Result.isFailure(back) &&
        back.failure.kind === "refused" &&
        refusedBy(back.failure.refused, "Linear never back"),
      `${run.first}: the first member again, refused by "Linear never back", got ${Formatter.format(back)}`,
    );
    note("a member before a shuffling section is never returned to");
    for (const i of Arr.range(2, mixed.length - 1)) {
      assert.strictEqual(
        Result.getOrThrow(yield* linear.present(mixedAt(i).ref)).kind,
        "accepted",
        `${run.first}: mixed member ${String(i + 1)} of its order`,
      );
    }

    const farBack = yield* linear.present(mixedAt(2).ref);
    assert.isTrue(
      Result.isFailure(farBack) &&
        farBack.failure.kind === "refused" &&
        refusedBy(farBack.failure.refused, "Linear never back"),
      `${run.first}: the third member after the sixth, three places back, refused by "Linear never back", got ${Formatter.format(farBack)}`,
    );
    note("a member several places back is never returned to");
    assert.deepStrictEqual<unknown>(
      Arr.fromIterable(
        yield* db.workload.presentationsOf.once({ facts: {}, params: { child: `${child}c` } }),
      ).map(({ path }) => path),
      mixed.map(({ path }) => path),
      `${run.first}: the mixed sitting presents its members, each section in its ranks' order`,
    );
    assert.deepStrictEqual<unknown>(
      linear.places,
      mixed.map(({ path }) => path),
      `${run.first}: MemberPlace places the mixed sitting's members in its order`,
    );
    note("a mixed sitting walks its members, then each section in rank order");

    // The nonlinear mixed test: placed in its order, and free to move either way.
    const free = drawnOrderOf(run.second, mixedMembers);
    const nonlinear = yield* started(SHUFFLED_FREE_TEST, run.second, `${child}d`);
    assert.deepStrictEqual<unknown>(nonlinear.presented, [SHORT], `${run.second}: the free start`);
    assert.deepStrictEqual<unknown>(
      nonlinear.places,
      free.map(({ path }) => path),
      `${run.second}: MemberPlace places the nonlinear sitting's members in its order`,
    );
    for (const ref of [HUMAN_REF, MEMBER, Option.getOrThrow(Arr.last(free)).ref]) {
      assert.strictEqual(
        Result.getOrThrow(yield* nonlinear.present(ref)).kind,
        "accepted",
        `${run.second}: the nonlinear sitting presents ${ref}`,
      );
    }
    note("a nonlinear sitting is placed in its order and moves freely");

    // The loose test: whitespace and a comment in its ordering, its refs fixed false, delivered.
    const loose = drawnOrderOf(run.first, looseMembers);
    const looseSitting = yield* started(SHUFFLED_LOOSE_TEST, run.first, `${child}e`);
    assert.deepStrictEqual<unknown>(
      [looseSitting.presented, looseSitting.places],
      [loose.slice(0, 1).map(({ path }) => path), loose.map(({ path }) => path)],
      `${run.first}: the loose sitting starts at its least-ranked member and places its order`,
    );
    note("an ordering of whitespace and a comment, over refs fixed false, is delivered");

    // The individual test, FastMath's shape: its start and its places.
    const individual = shuffledOrderOf(run.second);
    const alone = yield* started(SHUFFLED_INDIVIDUAL_TEST, run.second, `${child}f`);
    assert.deepStrictEqual<unknown>(
      [alone.presented, alone.places],
      [individual.slice(0, 1).map(({ path }) => path), individual.map(({ path }) => path)],
      `${run.second}: the individual sitting starts at its least-ranked member and places its order`,
    );
    note("an individual part's sitting starts at its least-ranked member");
  });

/**
 * A run of up to twelve beacons, sent in order or in a drawn order.
 */
const beaconRuns: Gen<BeaconRun> = (source) => {
  const gaps = array(gapOf, { max: 11, min: 0 })(source);
  const places = Arr.makeBy(gaps.length + 1, (place) => place);
  const order = boolean(source)
    ? shuffled(places, { max: places.length, min: places.length })(source)
    : places;

  return { gaps, midnight: boolean(source), order };
};

/**
 * The situations the beacon runs must reach.
 */
const beaconSituations = [
  "a window grown",
  "a gap of exactly the grace joins",
  "a gap past the grace opens a window",
  "a beacon out of order",
  "a beacon joins two windows",
  "a window across a UTC midnight",
  "a lone beacon credits nothing",
] as const;

type BeaconSituation = (typeof beaconSituations)[number];

/**
 * One run of beacons, each sent at the reading it draws, the instant of the moved clock the case
 * states for it, on a fresh child's entered sitting, and held to the serial reference: the windows
 * {@link windowsOfReadings} gives, the on-screen visit's present time by day
 * {@link creditByDayOf} gives, and the greatest reading as its last beacon.
 *
 * @param run - The run.
 * @param child - The case's fresh child.
 * @param note - Records the situations the run reaches.
 */
const holdBeacons = (run: BeaconRun, child: string, note: (situation: BeaconSituation) => void) =>
  Effect.gen(function* hold() {
    const { at, began, db, sitting } = yield* enteredSitting("a run of beacons", child);
    const offsets = [0n];
    for (const gap of run.gaps) {
      offsets.push((offsets.at(-1) ?? 0n) + BigInt(gap));
    }

    const span = offsets.at(-1) ?? 0n;
    const base = run.midnight ? (began / dayMicros + 2n) * dayMicros - span / 2n : began;
    const readings = offsets.map((offset) => base + offset);

    for (const place of run.order) {
      const reading = Arr.getUnsafe(readings, place);
      const sent = readings.filter(
        (_, index) => run.order.indexOf(index) <= run.order.indexOf(place),
      );
      const before = windowsOfReadings(sent.filter((other) => other !== reading)).length;
      const beaconed = yield* at(
        reading,
        db.workload.beaconTest.once({ facts: {}, params: sitting }),
      );
      assert.include(["accepted", "unchanged"], beaconed.kind, `the beacon at ${String(reading)}`);
      if (windowsOfReadings(sent).length < before) {
        note("a beacon joins two windows");
      }
    }

    const sorted = readings.toSorted((a, b) => (a < b ? -1 : 1));
    const expected = windowsOfReadings(readings);
    const credit = creditByDayOf(expected, began);
    const reads = yield* presenceReadsOf(db, child);
    assert.deepStrictEqual<unknown>(
      reads.windows,
      expected,
      "the windows, against the serial reference",
    );
    assert.deepStrictEqual<unknown>(
      reads.credits,
      new Map(credit.size === 0 ? [] : [[began, sumOf(credit.values())]]),
      "the on-screen visit's present time, against the serial reference",
    );
    assert.strictEqual(reads.last, sorted.at(-1), "the last beacon, the greatest reading");

    const days = Arr.fromIterable(
      yield* db.workload.presentTimesOf.once({ facts: {}, params: { child } }),
    ).map((row) => [row.day, BigInt(row.micros.toString())] as const);
    assert.deepStrictEqual<unknown>(
      days,
      [...credit.entries()].toSorted(([a], [b]) => (a < b ? -1 : 1)),
      "the present time by UTC day, against the serial reference",
    );

    if (expected.some(([start, end]) => end - start > 1n)) {
      note("a window grown");
    }

    if (
      sorted.some(
        (reading, index) => index > 0 && reading - Arr.getUnsafe(sorted, index - 1) === grace,
      )
    ) {
      note("a gap of exactly the grace joins");
    }

    if (expected.length > 1) {
      note("a gap past the grace opens a window");
    }

    if (run.order.some((place, index) => place !== index)) {
      note("a beacon out of order");
    }

    if (credit.size > 1) {
      note("a window across a UTC midnight");
    }

    if (expected.some(([start, end]) => end - start === 1n)) {
      note("a lone beacon credits nothing");
    }
  });

/**
 * A guarded take's case: a fresh child's take of the untimed test through the test runtime's own
 * take bound as an application binds it, its `taken` guarded by the child's unended sittings of the
 * test (`takeGuarded`), once, or twice.
 */
type GuardedTakeCase = Readonly<{ again: boolean; name: string }>;

const guardedTakeCases = [
  { again: false, name: "a first take" },
  { again: true, name: "a take, then another of the same test" },
] as const satisfies readonly GuardedTakeCase[];

const guardedTakeSpace: Gen<GuardedTakeCase> = element(guardedTakeCases);

/**
 * The situations the guarded take's space must reach.
 */
const guardedTakeSituations = [
  "a first take: every member's item session begins with its start",
  "a take again: the child's unended sitting guards it, and it writes nothing",
] as const;

type GuardedTakeSituation = (typeof guardedTakeSituations)[number];

/**
 * One guarded take: the take writes the sitting's test session, each member's item session, its
 * template processing's values and the record each begins with in one stratum, reading its
 * `taken` once, so the guard `taken` states holds for every write of it, though the sitting it
 * writes makes the guard false: each member's item session holds its start record ("Start of every
 * session"), its `completionStatus` at least; a second take of the same test, its guard now false,
 * writes nothing.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdGuardedTake = (
  c: GuardedTakeCase,
  child: string,
  note: (situation: GuardedTakeSituation) => void,
) =>
  Effect.gen(function* hold() {
    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const take = (stage: bigint) =>
      db.workload.takeGuarded.once({
        facts: {},
        params: { child, package: PACKAGE, path: UNTIMED_TEST, seed: DECISION, stage },
      });
    const sessions = Effect.map(
      db.workload.sessionsOf.once({ facts: {}, params: { child } }),
      (rows) => Arr.fromIterable(rows).map(({ path }) => path),
    );

    const first = yield* take(1n);
    assert.strictEqual(first.kind, "accepted", `${c.name}: the first take`);

    const taken = yield* sessions;
    assert.deepStrictEqual<unknown>(taken, [OTHER, SHORT], `${c.name}: an item session per member`);

    const started = Arr.fromIterable(
      yield* db.workload.startsOf.once({ facts: {}, params: { child, package: PACKAGE } }),
    )
      .filter(({ variable }) => variable === "completionStatus")
      .map(({ path }) => path);
    assert.deepStrictEqual<unknown>(
      started,
      taken,
      `${c.name}: every member's item session begins with its start, its completionStatus among it`,
    );
    note("a first take: every member's item session begins with its start");

    if (c.again) {
      const again = yield* take(2n);
      assert.strictEqual(again.kind, "unchanged", `${c.name}: the second take, guarded`);
      assert.deepStrictEqual<unknown>(yield* sessions, taken, `${c.name}: no item session added`);
      note("a take again: the child's unended sitting guards it, and it writes nothing");
    }
  });

/**
 * A wave's case: the first draw's reply, under 1 or past it, and the second's, where the first
 * reaches it.
 */
type WaveCase = Readonly<{ name: string; first: number; second: number }>;

/**
 * Every wave's case: a first reply that reaches the second draw or not, and a second reply.
 */
const waveSpace: Gen<WaveCase> = (source) => {
  const first = source.draw(element([0.5, 1.5] as const));
  const second = source.draw(element([1, 2] as const));

  return { first, name: `wave ${String(first)} ${String(second)}`, second };
};

/**
 * The situations the waves must reach: the second draw demanded in a later wave, and never
 * requested.
 */
const waveSituations = [
  "the second draw demanded once the first replied 1 or more",
  "graded 0 by the first reply under 1, the second never requested",
] as const;

type WaveSituation = (typeof waveSituations)[number];

/**
 * A wave's case on a fresh child: its attempt, the grade after it, which demands the first draw
 * alone, the first draw's reply, after which the second is demanded where the first reached it and
 * the attempt is graded where it did not, and the second's reply, which grades it; each held to the
 * rule: what waits, the status, and SCORE.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdWave = (c: WaveCase, child: string, note: (situation: WaveSituation) => void) =>
  Effect.gen(function* hold() {
    const reaches = c.first >= 1;
    note(
      reaches
        ? "the second draw demanded once the first replied 1 or more"
        : "graded 0 by the first reply under 1, the second never requested",
    );

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const key = { child, n: 0n, package: PACKAGE, path: WAVE };
    const stage = 1n;
    yield* db.workload.begin.once({
      facts: {
        insert: {
          StageControl: rowsOf("StageControl", [{ child, stage, ...directControl }]),
        },
      },
      params: { child, package: PACKAGE, path: WAVE, seed: SEED, stage },
    });
    yield* db.workload.facts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", [key]),
          ProcessedAttempt: rowsOf("ProcessedAttempt", []),
          ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...key, kind: "attempt" }]),
          SnapshotMultipleIdentifier: rowsOf("SnapshotMultipleIdentifier", []),
          SnapshotSingleBoolean: rowsOf("SnapshotSingleBoolean", []),
          SnapshotSingleFloat: rowsOf("SnapshotSingleFloat", []),
          SnapshotSingleString: rowsOf("SnapshotSingleString", [
            { ...key, value: RESPONSE, variable: "RESPONSE" },
          ]),
        },
      },
      params: {},
    });
    yield* db.workload.grade.once({ facts: {}, params: key });

    const atChild = { facts: {}, params: { child } };
    const draws = Arr.fromIterable(
      yield* db.workload.drawsOf.once({ facts: {}, params: { package: PACKAGE } }),
    ).filter((row) => row.path === WAVE);
    const operatorOf = (literal: string) =>
      Option.getOrThrow(Arr.findFirst(draws, (row) => row.draw === literal)).operator;
    const first = operatorOf("1");
    const second = operatorOf("2");
    const pending = Effect.map(db.workload.applicationsOf.once(atChild), (rows) =>
      Arr.fromIterable(rows).map((row) => row.operator),
    );
    const statuses = Effect.map(db.workload.statusesOf.once(atChild), (rows) =>
      Arr.fromIterable(rows).map((row) => row.status),
    );
    assert.deepStrictEqual(
      yield* pending,
      [first],
      `${c.name}: the run after the attempt demands the first draw alone`,
    );

    const { at } = Option.getOrThrow(
      Arr.head(Arr.fromIterable(yield* db.workload.statusesOf.once(atChild))),
    );
    const attempt = { at, child, n: 0n, package: PACKAGE, path: WAVE };
    const reply = (operator: bigint, score: number) =>
      db.workload.recordEvaluations.once({
        facts: {},
        params: {
          declines: [],
          feedbacks: [],
          replies: [
            { ...attempt, grader: grader.version, operator, request: requestOf(operator), score },
          ],
        },
      });
    yield* reply(first, c.first);
    assert.deepStrictEqual(
      yield* pending,
      reaches ? [second] : [],
      `${c.name}: after the first reply, the second draw demanded where the first reached it`,
    );
    assert.deepStrictEqual(
      yield* statuses,
      [reaches ? "pendingResponseProcessing" : "final"],
      `${c.name}: the attempt's status after the first reply`,
    );
    if (reaches) {
      yield* reply(second, c.second);
      assert.deepStrictEqual(yield* pending, [], `${c.name}: nothing waits after the second reply`);
      assert.deepStrictEqual(yield* statuses, ["final"], `${c.name}: final after the second reply`);
    }

    const scores = Arr.fromIterable(yield* db.workload.floatsOf.once(atChild))
      .filter((row) => row.variable === "SCORE")
      .map((row) => row.value);
    assert.deepStrictEqual(scores, [reaches ? c.second : 0], `${c.name}: SCORE`);
  });

/**
 * An outcome bounds case: a fresh child's sitting of the outcome bounds test, taken, entered and
 * ended, with no move between: the bounds its outcome processing reads are its members'
 * declarations, so no response bears on them.
 */
type OutcomeBoundsCase = Readonly<{ name: string }>;

const outcomeBoundsCases = [
  { name: "the outcome bounds test taken, entered and ended" },
] as const satisfies readonly OutcomeBoundsCase[];

const outcomeBoundsSpace: Gen<OutcomeBoundsCase> = element(outcomeBoundsCases);

/**
 * What the outcome bounds test's outcome processing leaves its outcomes.
 */
interface OutcomeBoundsExpected {
  readonly booleans: Readonly<Record<string, boolean>>;
  readonly floats: Readonly<Record<string, number>>;
}

/**
 * The table, from QTI 3.0.1's text, read apart from the machine. qti-outcome-maximum and
 * qti-outcome-minimum are test-level expressions of outcome processing, each "simultaneously looks
 * up the normalMaximum [normalMinimum] value of an outcome variable in a sub-set of the items
 * referred to in a test", with no subset filter every member (Tables 6.9.63, 6.9.64, 7.28):
 *
 * - Each member's bound of SCORE, multiplied by its item ref's weight W where one names it ("the
 *   resulting value is obtained by multiplying the variable's value by the associated weight"), and
 *   by 1.0 where none does ("If no matching definition is found the weight is assumed to be 1.0",
 *   Table 7.47.2): {@link BOUNDED_A_REF}'s weighs {@link A_WEIGHT}, {@link BOUNDED_B_REF}'s 1.0;
 * - "If any of the items within the given subset have no declared maximum the result is NULL" (Table
 *   6.9.64): {@link BOUNDED_B_REF} declares no BONUS maximum, so BONUS's maxima are NULL;
 * - Each sum the sum of its multiple's values (qti-sum).
 *
 * @param _c - The case.
 */
const outcomeBoundsExpectedOf = (_c: OutcomeBoundsCase): OutcomeBoundsExpected => ({
  booleans: { BONUS_MAX_NULL: true },
  floats: {
    MAX: A_SCORE.maximum + B_SCORE.maximum,
    MAX_WEIGHTED: A_SCORE.maximum * A_WEIGHT + B_SCORE.maximum * 1,
    MIN_WEIGHTED: A_SCORE.minimum * A_WEIGHT + B_SCORE.minimum * 1,
  },
});

/**
 * The situations the outcome bounds space must reach.
 */
const outcomeBoundsSituations = [
  "a member's declared maximum, weighted by its item ref's weight",
  "a member's declared minimum, weighted by its item ref's weight",
  "a member whose item ref names no such weight weighs 1.0",
  "a member declaring no maximum makes the maximum NULL",
] as const;

type OutcomeBoundsSituation = (typeof outcomeBoundsSituations)[number];

/**
 * Each variable's row of the latest run among a sitting's test outcome runs' rows.
 *
 * @param rows - The rows, each with its run's instant and its variable.
 * @returns The latest run's row of each variable.
 */
const latestOf = <A extends Readonly<{ at: bigint; variable: string }>>(rows: Iterable<A>) => {
  const kept = new Map<string, A>();
  for (const row of rows) {
    const held = kept.get(row.variable);
    if (held === undefined || held.at < row.at) {
      kept.set(row.variable, row);
    }
  }

  return [...kept.values()];
};

/**
 * One outcome bounds case: a fresh child's sitting of the outcome bounds test, taken by the test
 * runtime's own take (`takeSitting`), entered at {@link BOUNDED_A_REF}, then ended with its finish
 * (`finishTest`), whose outcome processing runs over its members; the test's outcomes its run left
 * (`TestOutcomeSingleFloat`, `TestOutcomeSingleBoolean`), the latest run's of each, held to the
 * table.
 *
 * @param c - The case.
 * @param child - The run's fresh child.
 * @param note - Records the situation the case reaches.
 */
const holdOutcomeBounds = (
  c: OutcomeBoundsCase,
  child: string,
  note: (situation: OutcomeBoundsSituation) => void,
) =>
  Effect.gen(function* hold() {
    const expected = outcomeBoundsExpectedOf(c);
    for (const situation of outcomeBoundsSituations) {
      note(situation);
    }

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const sitting = { child, stage: 1n };
    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { ...sitting, package: PACKAGE, path: OUTCOME_BOUNDS_TEST, seed: DECISION },
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting, as the take writes it`);

    const entered = yield* db.workload.enterTest.once({
      facts: {},
      params: { ...sitting, item: BOUNDED_A_REF },
    });
    assert.strictEqual(entered.kind, "accepted", `${c.name}: the entry`);

    const ended = yield* db.workload.finishTest.once({ facts: {}, params: sitting });
    assert.strictEqual(ended.kind, "accepted", `${c.name}: the end and its finish`);

    const floats = latestOf(
      yield* db.workload.testOutcomeFloatsOf.once({ facts: {}, params: { child } }),
    );
    const booleans = latestOf(
      yield* db.workload.testOutcomeBooleansOf.once({ facts: {}, params: { child } }),
    );
    assert.deepStrictEqual<OutcomeBoundsExpected>(
      {
        booleans: Object.fromEntries(booleans.map(({ variable, value }) => [variable, value])),
        floats: Object.fromEntries(floats.map(({ variable, value }) => [variable, value])),
      },
      expected,
      `${c.name}: the test's outcomes after its run`,
    );
  });

describe.skipIf(Option.isNone(lease))(
  "an AI-graded essay's result relations, a templated item's take and an adaptive item's attempts, on the runner's database",
  () => {
    layer(movedSuiteLayer.pipe(Layer.provideMerge(suiteLayerOf("results"))), {
      excludeTestServices: true,
      timeout: "300 seconds",
    })(
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
                    caseHang,
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
          searchTimeout,
        );

        it.effect(
          "demands a draw only an earlier draw's value reaches in a later wave, and holds each wave",
          (ctx) =>
            Effect.gen(function* holdEveryWave() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "every pair of replies of the wave's two draws, each on a fresh child",
                    caseHang,
                    coverage: requiredInSpace<WaveSituation>(waveSituations),
                    generator: waveSpace,
                    literal: (c: WaveCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "the wave's rule: a recorded application is demanded when the run reaches it, so the second draw only after the first's reply reaches it",
                    },
                    suite: "ledger/results/wave",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdWave(row, `user_wave${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the waves held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
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
                    caseHang,
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
          searchTimeout,
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
                    caseHang,
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
          searchTimeout,
        );

        it.effect(
          "grades a braced pattern by the run's own declarations: an item's, a located template's, and a name declared nowhere",
          (ctx) =>
            Effect.gen(function* holdEveryPatternsCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "each patterns item with each answer, each on a fresh child",
                    caseHang,
                    coverage: requiredInSpace<PatternsSituation>(patternsSituations),
                    generator: patternsSpace,
                    literal: (c: PatternsCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "patternsExpectedOf: QTI 3.0.1 §9.3.4's StringOrVariableRef, a braced name a declared variable's value, else the string itself, §5.104.1's Appendix F match",
                    },
                    suite: "ledger/results/patterns",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdPatterns(row, `user_ledgerpat${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the patterns items held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
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
                    caseHang,
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
          searchTimeout,
        );

        it.effect(
          "reads a sitting's item sessions each at its latest attempt, as it stands, with its credit and marks, an essay waiting for a person among them",
          (ctx) =>
            Effect.gen(function* holdEveryReview() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "a sitting of the adaptive draw answered twice, the draw once, each ending every way, an essay both of whose draws declined and a session never answered, beside a second sitting, each case on a fresh child",
                    caseHang,
                    coverage: requiredInSpace<ReviewSituation>(reviewSituations),
                    generator: reviewSpace,
                    literal: (c: ReviewCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "reviewExpectedOf, the rule table: Results Reporting reports an item session at its last attempt (Table 2.7.7, pendingResponseProcessing's responses alone), info §2.2.2.3, the owner's credit, a mark right on a given value the correct response holds and missed on one no given value took",
                    },
                    suite: "ledger/results/review",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdReview(row, `user_ledgerreview${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the review read held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
        );

        it.effect(
          "holds a test's responses to its candidate sessions and its time, and reads back each move's standing",
          (ctx) =>
            Effect.gen(function* holdEveryResponse() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* onMovedClock(
                searched(
                  ctx,
                  exhaust(
                    {
                      box: "each timing of a save in the open session, and an untimed sitting's save before, between and after its candidate sessions, each on a fresh child",
                      caseHang,
                      coverage: requiredInSpace<ResponseSituation>(responseSituations),
                      generator: responseSpace,
                      literal: (c: ResponseCase) => c.name,
                      oracle: {
                        kind: "specification",
                        name: "responseExpectedOf: inside a candidate session (QTI 3.0.1 §2.2.1), of a member shown (§2.3), arriving, by the database's stamp, within its time and the in-flight grace unless the test allows late submission (Table 7.40.3)",
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
                ),
              );
              yield* Effect.log(`the responses held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
        );

        it.effect(
          "submits the latest save admitted by the database's clock, a later one within the in-flight grace and none past it",
          (ctx) =>
            Effect.gen(function* holdEverySupersedeCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* onMovedClock(
                searched(
                  ctx,
                  exhaust(
                    {
                      box: "an in-time save, then a later one within and past the in-flight grace, each on a fresh child",
                      caseHang,
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
                ),
              );
              yield* Effect.log(`the supersedes held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
        );

        it.effect(
          "charges a candidate session up to its last sign of presence, never a closed tab's time",
          (ctx) =>
            Effect.gen(function* holdEveryPresenceCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* onMovedClock(
                searched(
                  ctx,
                  exhaust(
                    {
                      box: "a pause, a closed tab before and across the deadline, and a sign past it, each on a fresh child",
                      caseHang,
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
                ),
              );
              yield* Effect.log(`the presences held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
        );

        it.effect(
          "keeps one presence window a stretch of beacons, refuses an overlap, and credits each visit from the first beacon to the last",
          (ctx) =>
            Effect.gen(function* holdEveryWindowCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* onMovedClock(
                searched(
                  ctx,
                  exhaust(
                    {
                      box: "beacons within, at and past the grace, an overlapping window, a pause and a closed tab, each on a fresh child",
                      caseHang,
                      coverage: requiredInSpace<WindowSituation>(windowSituations),
                      generator: windowSpace,
                      literal: (c: WindowCase) => c.name,
                      oracle: {
                        kind: "specification",
                        name: "windowExpected: the owner's presence design (2026-11-23), a window grown within 3 s, `[first, last + 1 µs)`, no two overlapping, credit cut at a suspension and ending at the last beacon",
                      },
                      suite: "ledger/results/windows",
                    },
                    (row, c) =>
                      Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                        Effect.flatMap((k) =>
                          holdWindow(row, `user_ledgerwin${String(k)}`, (situation) => {
                            c.note(situation);
                          }),
                        ),
                        Effect.orDie,
                      ),
                  ),
                ),
              );
              yield* Effect.log(`the windows held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
        );

        it.effect(
          "puts the windows the serial reference gives for any run of beacons, in any order, and credits them by UTC day",
          (ctx) =>
            Effect.gen(function* holdEveryBeaconRun() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              yield* onMovedClock(
                searched(
                  ctx,
                  explore(
                    {
                      caseHang,
                      coverage: required<BeaconSituation>(beaconSituations, {
                        cases: mostCases,
                        sense: notesOnly,
                      }),
                      draw: drawnBy(beaconRuns),
                      kept: [],
                      literal: (run) => JSON.stringify(run),
                      oracle: {
                        kind: "second-implementation",
                        name: "windowsOfReadings and creditByDayOf: the readings sorted, each run whose gaps are within the grace one window, credited first beacon to last and split at UTC midnights",
                      },
                      runs: 64,
                      shrink: completeShrink,
                      steerEvery: 16,
                      suite: "ledger/results/beacons",
                    },
                    (run, c) =>
                      Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                        Effect.flatMap((k) =>
                          holdBeacons(run, `user_ledgerrun${String(k)}`, (situation) => {
                            c.note(situation);
                          }),
                        ),
                        Effect.orDie,
                      ),
                  ),
                ),
              );
            }).pipe(Effect.orDie),
          searchTimeout,
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
                    caseHang,
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
          searchTimeout,
        );

        it.effect(
          "derives each item session's control from its stage or the nearest scope of its test, and what it takes and shows from its state",
          (ctx) =>
            Effect.gen(function* holdEveryShowingCase() {
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
              assert.isTrue(
                delivered.has(SHOWING_TEST),
                "show-feedback and show-solution at a part, a section and an item ref delivered",
              );

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "each item stage's control and attempts, and each test's members under its scopes, answered and ended, each on a fresh child",
                    caseHang,
                    coverage: requiredInSpace<ShowingSituation>(showingSituations),
                    generator: showingSpace,
                    literal: (c: ShowingCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "the showing table: each setting the nearest scope's, else QTI's default (§7.19); open while attempts remain, closed at the last, at completion or at the end (Table 7.19.1); feedback while open, else show-feedback; marks once feedback shows or closed; the solution once closed under show-solution (Tables 7.19.2, 7.19.3)",
                    },
                    suite: "ledger/results/showing",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdShowing(row, `user_ledgershow${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the showings held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
        );

        it.effect(
          "refuses a save of a member never shown, submits every shown member at a simultaneous part's end, and holds a shown human-scored essay for its score",
          (ctx) =>
            Effect.gen(function* holdEveryShownCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "each sequence of presentations and saves of the shown test's human-scored essay, then its end, each on a fresh child",
                    caseHang,
                    coverage: requiredInSpace<ShownSituation>(shownSituations),
                    generator: shownSpace,
                    literal: (c: ShownCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "shownExpectedOf: a save is of a member shown (§2.2.1, §2.3), the end of a simultaneous part submits every shown member and none never shown (Tables 5.159.5, 7.19.6, 5.115), and an attempt of a human-scored outcome is pendingExternalScoring (Results Reporting Table 2.7.7)",
                    },
                    suite: "ledger/results/shown",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdShown(row, `user_ledgershown${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the shown members held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
        );

        it.effect(
          "presents the member an entry names, any in a nonlinear part and the one the candidate is on in a linear part",
          (ctx) =>
            Effect.gen(function* holdEveryEntryCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "each sequence of entries of the shown test and the linear tests, a suspension between each two, then a save of the member entered at, each on a fresh child",
                    caseHang,
                    coverage: requiredInSpace<EntrySituation>(entrySituations),
                    generator: entrySpace,
                    literal: (c: EntryCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "entryExpectedOf: an entry presents the member it names, any in a nonlinear part (Table 5.159.4: free to navigate to any item), in a linear part only in member order (Table 5.159.4: each item in turn), moving on submitting in an individual part alone (Table 5.159.5), and a save of it is accepted (§2.2.1, §2.3)",
                    },
                    suite: "ledger/results/entries",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdEntry(row, `user_ledgerentry${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the entries held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
        );

        it.effect(
          "delivers a shuffling section of item refs in its sitting's own drawn order, the same at every resumption, and no other shuffle",
          (ctx) =>
            Effect.gen(function* holdEveryShuffleRun() {
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
                  SHUFFLED_TEST,
                  SHUFFLED_INDIVIDUAL_TEST,
                  SHUFFLED_MIXED_TEST,
                  SHUFFLED_FREE_TEST,
                  SHUFFLED_LOOSE_TEST,
                  SHUFFLED_NESTED_TEST,
                  SHUFFLED_FIXED_TEST,
                  SHUFFLED_EXTENDED_TEST,
                  SHUFFLED_MARKUP_TEST,
                ].map((path) => [path, delivered.has(path)]),
                [
                  [SHUFFLED_TEST, true],
                  [SHUFFLED_INDIVIDUAL_TEST, true],
                  [SHUFFLED_MIXED_TEST, true],
                  [SHUFFLED_FREE_TEST, true],
                  [SHUFFLED_LOOSE_TEST, true],
                  [SHUFFLED_NESTED_TEST, false],
                  [SHUFFLED_FIXED_TEST, false],
                  [SHUFFLED_EXTENDED_TEST, false],
                  [SHUFFLED_MARKUP_TEST, false],
                ],
                "a shuffle delivered over a section of item refs alone, none fixed, its ordering extended by no element (§5.98)",
              );

              const runs = yield* Ref.make(0);
              yield* searched(
                ctx,
                explore(
                  {
                    caseHang,
                    coverage: required<ShuffleSituation>(shuffleSituations, {
                      cases: 24,
                      sense: notesOnly,
                    }),
                    draw: drawnBy(shuffleRuns),
                    kept: [],
                    literal: (run) => JSON.stringify(run),
                    oracle: {
                      kind: "specification",
                      name: "shuffledOrderOf: a shuffling section presents its members in ascending HMAC-SHA-256 under the sitting's decision seed over ordering, package and item ref (§5.98.1, plate's keyed digest), in turn and never back (Table 5.159.4, §2.8.2)",
                    },
                    runs: 24,
                    shrink: completeShrink,
                    steerEvery: 8,
                    suite: "ledger/results/shuffle",
                  },
                  (run, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdShuffle(run, `user_ledgershuffle${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
            }).pipe(Effect.orDie),
          searchTimeout,
        );

        it.effect(
          "takes a test's sitting whose taken sittings the application guards, every write of it under the guard read once",
          (ctx) =>
            Effect.gen(function* holdEveryGuardedTake() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "a guarded take of the untimed test, once and twice, each on a fresh child",
                    caseHang,
                    coverage: requiredInSpace<GuardedTakeSituation>(guardedTakeSituations),
                    generator: guardedTakeSpace,
                    literal: (c: GuardedTakeCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "the take writes what its taken named when it began: an item session in the initial state per member (§2.2.1), each with its start record (Start of every session); the application's guard decides only whether it takes",
                    },
                    suite: "ledger/results/guarded-take",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdGuardedTake(row, `user_ledgerguard${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the guarded takes held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
        );

        it.effect(
          "reads a test's members' declared bounds through qti-outcome-maximum and qti-outcome-minimum, weighted, and NULL where a member declares no maximum",
          (ctx) =>
            Effect.gen(function* holdEveryOutcomeBoundsCase() {
              yield* Effect.scoped(published);

              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "the outcome bounds test taken, entered and ended, on a fresh child",
                    caseHang,
                    coverage: requiredInSpace<OutcomeBoundsSituation>(outcomeBoundsSituations),
                    generator: outcomeBoundsSpace,
                    literal: (c: OutcomeBoundsCase) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "outcomeBoundsExpectedOf: each member's declared bound times its item ref's weight, 1.0 where it names none (Tables 6.9.63, 6.9.64, 7.28, 7.47.2), NULL where a member declares no maximum (Table 6.9.64)",
                    },
                    suite: "ledger/results/outcome-bounds",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdOutcomeBounds(
                          row,
                          `user_ledgeroutcomebounds${String(k)}`,
                          (situation) => {
                            c.note(situation);
                          },
                        ),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`the outcome bounds held over ${String(exhausted.cases)} cases`);
            }).pipe(Effect.orDie),
          searchTimeout,
        );
      },
    );
  },
);
