/**
 * The delivery level, `delivery` in PostgreSQL, the top of qti-pie's QTI levels: every derived
 * relation and every rule over a query that reads the ledger's stored relations (`#ledger.ts`),
 * which a level states only over the levels below it (grizzle's README, "Derived tables" and
 * "Levels"). The test runtime's own (`#sittings.ts`):
 *
 * - **DeliveredTest**: the tests this runtime delivers, exactly to QTI 3.0.1, and the one stated
 *   limit of what it delivers: IMPL-TESTS' DeliverableTest (no section ref, include under a
 *   section, with-replacement or adaptive selection, or item ref naming no item of the package),
 *   and beyond it a test of one part, which neither selects, branches nor conditions, orders only
 *   by a section's shuffle, of a section of item refs none of which is fixed, its ordering extended
 *   by no element (each sitting's ranks and places, `#ledger/sittings.ts` ShuffleRank and
 *   MemberPlace; QTI's OrderingDType admits a foreign attribute only as its declaration validates
 *   it strictly, and pantry holds no such declaration, so it admits none), and controls item
 *   sessions only as `#ledger/member-controls.ts` reads them (each setting inherited from the
 *   nearest scope that writes it, its part, its sections, its item ref; show-feedback and
 *   show-solution at any scope, what a served item shows of them `#ledger/session-control.ts`'s; an
 *   item ref of an individual part may set `validate-responses` true and `max-attempts` 0 on its
 *   own control; allow-comment stays false, allow-skipping true and max-attempts at most 1), holds
 *   no test rubric, test feedback, stylesheet or template default, times only the whole test with
 *   `max-time` (no `min-time`), and refers to no adaptive item and no item with template processing
 *   (whose template values the take would draw: §2.7.3, "Template processing consists of one or
 *   more TemplateRules that are followed by the cloning engine or delivery system in order to
 *   assign values to the template variables"). Every other valid test is content pantry admits and
 *   this runtime does not open: "Delivered shape" holds every sitting to DeliveredTest's clauses at
 *   every write, so no test is ever delivered half to its rules. Each construct it leaves out has
 *   no form in AlphaTest's 2,825 served tests (`qti-port/registry/tests.md`, T-ABSENT and
 *   T-FORM-01; 0 of 2,825 refused, QP-CONVERTER's count), and each is lifted by the runtime that
 *   delivers it.
 * - The laws of a sitting's candidate sessions: each later budget is the time its sitting has left,
 *   no candidate session ran, up to its last sign of presence, past its deadline unless the test
 *   allows late submission (a closed tab's time, after the last sign, is not charged: H10) (Table
 *   7.40.3), nothing of the sitting follows its end, its end falls in an open candidate session,
 *   every presentation falls in its candidate session, and a linear part's presentations never go
 *   back (§2.8.2). A sitting's first budget, its applied limit with what the application grants the
 *   learner, is the application's level's, above this one.
 * - Each item session's control and whether it takes another attempt (`#ledger/session-control.ts`):
 *   a member's from its test, an item stage's from the `StageControl` the application's decision
 *   states, the one statement of what a served item takes and shows.
 * - The laws of a sitting's responses: every response snapshot of a sitting's item session, a save or
 *   an attempt, lies inside one of its candidate sessions ("During each attempt the candidate
 *   interacts with the item through one or more candidate sessions", §2.2.1), and every response
 *   the candidate gave in a timed one arrived, by the database's stamp, within its time and the
 *   in-flight grace past it ({@link inFlightGraceMicros}), unless the test allows late submission
 *   (Table 7.40.3). The browser's reading of when it was given decides nothing. Each is the
 *   sitting's state as a law, so a write outside it is refused, naming it, whoever writes.
 * - The readers of a sitting's presence, which store nothing (`Presence`, its windows of an
 *   application's beacons): **PresentTime**, the time the candidate was there in each question
 *   visit by UTC day, every application's time credit, and **LastPresence**, each sitting's last
 *   beacon, which an application reads absence from by its own threshold. Presence is no QTI
 *   duration: ItemDuration stays its presentations' (§2.2.2.2).
 *
 * Instants are microseconds on the database's clock; a duration is the difference of two instants
 * of the sitting's clock, read as the bigint it is (`Type.base`).
 */
import {
  check,
  contained,
  contract,
  derived,
  Logic,
  Num,
  on,
  pg,
  query,
  Range,
  schema,
  Time,
  Type,
  v,
} from "@bjornpagen/grizzle";
import { booleanTrue } from "@qti-pie/pantry/grammar/domains.ts";
import { nonElementKinds } from "@qti-pie/pantry/grammar/install.ts";
import { assertionViewsOf } from "#ledger/assertion-views.ts";
import { creditRelationsOf } from "#ledger/credit-relations.ts";
import { named } from "#ledger/laws.ts";
import type { ledgerOf } from "#ledger/ledger.ts";
import { moduleHeldOf } from "#ledger/module-held.ts";
import { applicationOperandRelationsOf } from "#ledger/operands.ts";
import { resultRelationsOf } from "#ledger/results.ts";
import { responseProgramsOf } from "#ledger/response-programs.ts";
import { servableOf } from "#ledger/servable.ts";
import { sessionAttemptsOf } from "#ledger/session-attempts.ts";
import { sessionControlsOf } from "#ledger/session-control.ts";
import { asMicros, clockTop, Moment } from "#ledger/sittings.ts";
import { storedContentOf } from "#ledger/stored-content.ts";
import { testLawsOf } from "#ledger/test-laws.ts";
import { walksOf } from "#ledger/walks.ts";

/**
 * The Ledger level the delivery level extends.
 */
export type LedgerLevel = ReturnType<typeof ledgerOf>;

/**
 * The elements a delivered test holds none of: what this runtime does not deliver, each a construct
 * of QTI 3.0.1's test whose rules it would have to keep (§2.8.1 selection, §2.8.3
 * pre-conditions and branching, Table 7.19 item session control, Table 5.6 an item ref's template
 * defaults, §2.8.6 a test's rubric blocks, Table 5.157 test feedback, a stylesheet of the test, and
 * a section ref or include whose sections the test does not hold itself).
 */
const undeliveredKinds = [
  "qti-selection",
  "qti-pre-condition",
  "qti-branch-rule",
  "qti-template-default",
  "qti-rubric-block.test",
  "qti-test-feedback",
  "qti-stylesheet",
] as const;

/**
 * The greatest `max-time` a delivered test states, in seconds: its applied limit, at most four
 * times it, stays a bigint of microseconds. A test that states more is no test this runtime times,
 * a stated limit, never a cap of QTI's NonNegativeDouble: about 31,700 years.
 *
 * @limitKind derived
 * @owner the test runtime
 * @unit seconds
 * @scope a delivered test's root `max-time`
 * @derivation a bigint's 9.2e18 microseconds over the largest multiplier, 4, rounded down to a power of ten
 */
export const longestMaxTime = 1e12;

/**
 * InFlightGrace: how long after a timed candidate session's deadline a response may still arrive,
 * by the database's stamp, in microseconds, ten seconds. The database is the clock: what arrives by
 * the deadline and this grace is admitted, the latest save winning, and what arrives after it is
 * refused, so the end submits the latest save admitted (`#ledger/finish.ts`); the browser's reading
 * `given` (`BrowserReading`) is evidence and admits nothing. allow-late-submission refuses "a
 * candidate's response that is beyond the max-time" (Table 7.40.3); a response the candidate made
 * within it and still in flight is no such response, and the grace bounds its flight. AlphaTest
 * stamped a drill's final submit on its server a mean of 1.12 s after the limit, on 24,266
 * clock-stopped drills in 60 days: 10.1 % within 0 s, 72.3 % 1 s, 15.1 % 2 s, 2.5 % 3 to 10 s, and
 * 92 more past 10 s (research/14 §3.6, fastmath-evidence/overshoot.result.txt), so a database that
 * took no grace would refuse the last answer of most drills.
 *
 * @limitKind published
 * @owner AlphaTest's backend (trilogy-group/beyond-masterytrack-be 3a2119e9, app/backend/utils/cqpm.ts)
 * @unit microseconds
 * @scope each response of a timed candidate session whose test allows no late submission, arriving after its deadline
 * @constraint compile-time constant
 * @source https://github.com/trilogy-group/beyond-masterytrack-be/blob/3a2119e98419c5e04a9371bc8e0d9ee3c89a9a32/app/backend/utils/cqpm.ts#L146
 * @quote export const CQPM_WINDOW_GRACE_SECONDS = 10;
 * @verified 2026-11-22
 */
export const inFlightGraceMicros = 10_000_000n;

/**
 * PresenceGrace: how long after a sitting's latest presence window ends a beacon still extends it,
 * in microseconds on the database's clock, three seconds, three beacon periods: a beacon later than
 * this opens a window of its own, so the gap between them is credited to nothing. A false split
 * only undercounts the gap, never overcounts.
 *
 * @limitKind published
 * @owner Bjorn, the owner, in the presence design he approved on 2026-11-23
 * @unit microseconds
 * @scope the longest gap, on the database's clock, between a sitting's latest window's last beacon
 *   and the beacon that extends it
 * @constraint protocol constant
 * @source edullm's out/rc-cutover/decisions-for-bjorn.html, items 1 and 2a, approved "1 yes (ii) ·
 *   2 a yes"; the design is out/rc-cutover/PRESENCE.md, "The write: the beacon"
 * @quote if the sitting's latest window ended within **3 s**, extend its range to now.
 * @verified 2026-11-23
 */
export const presenceGraceMicros = 3_000_000n;

/**
 * The microseconds of one UTC day, which has no leap second on the database's clock.
 */
const dayMicros = 86_400_000_000n;

/**
 * A sitting's last beacon ({@link LastPresence}): the last microsecond of a window, one before its
 * end, so never past the last microsecond of the clock's top; its lower end the one before a
 * window's earliest end ({@link Moment}).
 */
const LastBeacon = named(
  "Last beacon",
  contract("LastBeacon", pg.bigint, (t) => Num.within(t, -1n, clockTop - 1n)),
);

/**
 * The first microsecond of a piece of a sitting's presence ({@link presentPieces}): the later of
 * its window's first beacon and its presentation's instant, so never before the clock's 0, which a
 * window's start is not ({@link Moment}).
 */
const PieceStart = named(
  "Piece start",
  contract("PieceStart", pg.bigint, (t) => Num.within(t, 0n, 2n ** 63n - 1n)),
);

/**
 * The end of a piece of a sitting's presence ({@link presentPieces}), one past its last
 * microsecond: the earlier of its window's last beacon and its presentation's end, so never past
 * the last microsecond of the clock's top, which a window's end is not ({@link Moment}).
 */
const PieceEnd = named(
  "Piece end",
  contract("PieceEnd", pg.bigint, (t) => Num.within(t, -(2n ** 63n), clockTop - 1n)),
);

/**
 * The delivery level over the ledger.
 *
 * @param ledger The Ledger level, the installation's composition of qti-pie's levels below this
 *   one.
 * @returns The Delivery level.
 */
export const deliveryOf = (ledger: LedgerLevel) => {
  const {
    Attribute,
    DeliverableTest,
    ItemMode,
    ItemSession,
    MaxAttempts,
    MaxTime,
    MemberPlace,
    NavigationMode,
    Node,
    ResponseSnapshot,
    SectionShuffle,
    SessionControl,
    SnapshotGiven,
    Presence,
    TestBudget,
    TestEnd,
    TestMember,
    TestMoment,
    TestPart,
    TestPresented,
    TestRoot,
    TestSession,
    TestSuspension,
    TestVisit,
  } = ledger.relations;

  /**
   * The test documents this runtime does not deliver, by their document: one holds an element of
   * {@link undeliveredKinds}, a time limit on a part, section or item ref, a `min-time`, a second
   * part, a `max-time` past {@link longestMaxTime}, an item ref to an adaptive item or to one with
   * template processing, an ordering extended by an element of any namespace or none (§5.98.3: its
   * character data, comments and instructions extend nothing), or a shuffling section that
   * holds a section or a fixed item ref (§5.98.1, §5.6.3: a fixed one's place, a section's
   * visibility and keep-together, which the sitting's ranks do not keep).
   */
  /**
   * The elements a delivered test's time limits may stand on, and the tests that allow late
   * submission, the Ledger's (`TimingScope`, `LateTest`).
   */
  const { LateTest, TimingScope } = ledger.relations;

  /**
   * The item refs whose own item-session-control a delivered test admits, the Ledger's
   * (`IndividualRef`, `#ledger/member-controls.ts`).
   */
  const { IndividualRef } = ledger.relations;

  /**
   * Each item session's control, a member's from its test and an item stage's from its stage, and
   * whether it takes another attempt (`#ledger/session-control.ts`).
   */
  const sessionControls = sessionControlsOf(ledger);

  const undeliveredTests = query(ledger)
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { kind } = v(Node, "undeliveredNode");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(Node, { kind, package: pkg, path })
        .where(r.in(kind, undeliveredKinds))
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { parentKind } = v(Node, "undeliveredLimits");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(Node, { kind: "qti-time-limits", package: pkg, parentKind, path })
        .where(r.ne(parentKind, "qti-assessment-test"), r.ne(parentKind, "qti-test-part"))
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(Attribute, { kind: "qti-time-limits", name: "min-time", package: pkg, path })
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const first = v(TestPart, "undeliveredFirst");
      const second = v(TestPart, "undeliveredSecond");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(TestPart, { package: pkg, path, start: first.start })
        .match(TestPart, { package: pkg, path, start: second.start })
        .where(r.lt(first.start, second.start))
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path, scope: start } = v(TimingScope, "undeliveredScope");
      const { seconds } = v(MaxTime, "undeliveredLimit");

      return r
        .match(TimingScope, { package: pkg, path, scope: start })
        .match(MaxTime, { package: pkg, path, scope: start, seconds })
        .where(r.or(r.lt(seconds, 0), r.gt(seconds, longestMaxTime)))
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { document: itemPath } = v(TestMember, "undeliveredRef");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(TestMember, { document: itemPath, package: pkg, path })
        .match(ItemMode, { adaptive: true, package: pkg, path: itemPath })
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { document: itemPath } = v(TestMember, "undeliveredRef");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(TestMember, { document: itemPath, package: pkg, path })
        .match(Node, { kind: "qti-template-processing", package: pkg, path: itemPath })
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { start: limits } = v(Node, "undeliveredRootLimits");
      const { start: partLimits } = v(Node, "undeliveredPartLimits");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(Node, {
          kind: "qti-time-limits",
          package: pkg,
          parentKind: "qti-assessment-test",
          path,
          start: limits,
        })
        .match(Node, {
          kind: "qti-time-limits",
          package: pkg,
          parentKind: "qti-test-part",
          path,
          start: partLimits,
        })
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { parent: ref } = v(Node, "undeliveredRefControl");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(Node, {
          kind: "qti-item-session-control",
          package: pkg,
          parent: ref,
          parentKind: "qti-assessment-item-ref",
          path,
        })
        .where(r.not(IndividualRef, { package: pkg, path, start: ref }))
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(SessionControl, { package: pkg, path, setting: "allow-skipping", value: false })
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(SessionControl, { package: pkg, path, setting: "allow-comment", value: true })
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { scope } = v(SessionControl, "undeliveredValidation");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(SessionControl, {
          package: pkg,
          path,
          scope,
          setting: "validate-responses",
          value: true,
        })
        .where(r.not(IndividualRef, { package: pkg, path, start: scope }))
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { attempts } = v(MaxAttempts, "undeliveredAttempts");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(MaxAttempts, { attempts, package: pkg, path })
        .where(r.ne(attempts, 1), r.ne(attempts, 0))
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { scope } = v(MaxAttempts, "undeliveredNoLimit");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(MaxAttempts, { attempts: 0, package: pkg, path, scope })
        .where(r.not(IndividualRef, { package: pkg, path, start: scope }))
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { kind } = v(Node, "orderingExtension");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(Node, { kind, package: pkg, parentKind: "qti-ordering", path })
        .where(Logic.not(r.in(kind, nonElementKinds)))
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { section } = v(SectionShuffle, "undeliveredShuffle");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(SectionShuffle, { package: pkg, path, section })
        .match(Node, { kind: "qti-assessment-section", package: pkg, parent: section, path })
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { section } = v(SectionShuffle, "undeliveredShuffle");
      const { start: ref } = v(Node, "undeliveredFixedRef");
      const { value } = v(Attribute, "undeliveredFixed");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(SectionShuffle, { package: pkg, path, section })
        .match(Node, {
          kind: "qti-assessment-item-ref",
          package: pkg,
          parent: section,
          path,
          start: ref,
        })
        .match(Attribute, {
          kind: "qti-assessment-item-ref",
          name: "fixed",
          package: pkg,
          path,
          start: ref,
          value,
        })
        .where(r.in(value, booleanTrue))
        .find({ package: pkg, path });
    });

  const DeliveredTest = derived(
    "DeliveredTest",
    query(ledger).rule((r) => {
      const { package: pkg, path } = v(DeliverableTest, "test");

      return r
        .match(DeliverableTest, { package: pkg, path })
        .where(r.not(undeliveredTests, { package: pkg, path }))
        .find({ package: pkg, path });
    }),
  );

  /**
   * Each sitting of a test this runtime does not deliver, by {@link DeliveredTest}'s clauses: a test
   * that is not IMPL-TESTS' DeliverableTest, or one {@link undeliveredTests} names. None may stand,
   * its `delivered` false, which "Delivered shape" refuses.
   */
  const UndeliveredSitting = derived(
    "UndeliveredSitting",
    query(ledger)
      .rule((r) => {
        const { child, stage, package: pkg, path } = v(TestSession, "undeliverableSitting");

        return r
          .match(TestSession, { child, package: pkg, path, stage })
          .where(r.not(DeliverableTest, { package: pkg, path }))
          .find({ child, delivered: Type.literal(pg.boolean, false), stage });
      })
      .rule((r) => {
        const { child, stage, package: pkg, path } = v(TestSession, "undeliveredSitting");

        return r
          .match(TestSession, { child, package: pkg, path, stage })
          .match(undeliveredTests, { package: pkg, path })
          .find({ child, delivered: Type.literal(pg.boolean, false), stage });
      }),
  );

  /**
   * Each presentation of a member, with the sitting's next moment after it, the instant its item
   * session stopped interacting: the candidate moved to another member, suspended the sitting, or
   * the part ended. A presentation with no moment after it is the one on screen now, whose span has
   * no end yet; it is read only from recorded instants, never the clock, so a read of a sitting is
   * a function of its facts.
   */
  const presentedSpans = query(ledger).rule((r) => {
    const { child, stage, at, k, package: pkg, path } = v(TestPresented, "spanPresented");
    const { at: next } = v(TestMoment, "spanNext");

    return r
      .match(TestPresented, { at, child, k, package: pkg, path, stage })
      .match(TestMoment, { at: next, child, stage })
      .where(r.gt(next, at))
      .find({ at, child, end: r.min(next), k, package: pkg, path, stage });
  });

  /**
   * Each response snapshot of a sitting's item session, with its stage: a save or an attempt, the
   * candidate's or the end's.
   */
  const testSnapshots = query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at } = v(ResponseSnapshot, "testSnapshot");
    const { stage } = v(ItemSession, "snapshotSession");

    return r
      .match(ResponseSnapshot, { at, child, n, package: pkg, path })
      .match(ItemSession, { child, n, package: pkg, path, stage })
      .match(TestSession, { child, stage })
      .find({ at, child, n, package: pkg, path, stage });
  });

  const TestSnapshot = derived("TestSnapshot", testSnapshots);

  /**
   * Each response snapshot of a sitting inside one of its candidate sessions, with that session's
   * `k` and the instant it began: at or after its beginning and, where it was suspended or the
   * sitting ended in it, at or before that. A snapshot's instant is its item session's clock and a
   * candidate session's the sitting's, so they compare as readings of one database clock (<=),
   * never as one clock's order; the end's attempts share the end's instant.
   */
  const sessionSnapshots = query(ledger)
    .rule((r) => {
      const { child, stage, package: pkg, path, n, at } = v(testSnapshots, "openSnapshot");
      const { k, at: began } = v(TestVisit, "openVisit");

      return r
        .match(testSnapshots, { at, child, n, package: pkg, path, stage })
        .match(TestVisit, { at: began, child, k, stage })
        .where(
          r.le(began, at),
          r.not(TestSuspension, { child, k, stage }),
          r.not(TestEnd, { child, stage }),
        )
        .find({ at, began, child, k, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const { child, stage, package: pkg, path, n, at } = v(testSnapshots, "suspendedSnapshot");
      const { k, at: began } = v(TestVisit, "suspendedVisit");
      const { at: suspended } = v(TestSuspension, "suspension");

      return r
        .match(testSnapshots, { at, child, n, package: pkg, path, stage })
        .match(TestVisit, { at: began, child, k, stage })
        .match(TestSuspension, { at: suspended, child, k, stage })
        .where(r.le(began, at), r.le(at, suspended))
        .find({ at, began, child, k, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const { child, stage, package: pkg, path, n, at } = v(testSnapshots, "endedSnapshot");
      const { k, at: began } = v(TestVisit, "endedVisit");
      const { at: end } = v(TestEnd, "end");

      return r
        .match(testSnapshots, { at, child, n, package: pkg, path, stage })
        .match(TestVisit, { at: began, child, k, stage })
        .match(TestEnd, { at: end, child, k, stage })
        .where(r.le(began, at), r.le(at, end))
        .find({ at, began, child, k, n, package: pkg, path, stage });
    });

  const SessionSnapshot = derived("SessionSnapshot", sessionSnapshots);

  /**
   * Each sign that a candidate session's candidate was there, by its instant in microseconds on the
   * database's clock (a sign of the sitting's clock, a window's and a response of its item
   * session's, read as readings of one clock, as {@link sessionSnapshots} compares them): the
   * session's start, an application's presence window in it ({@link Presence}), its last beacon
   * (one microsecond before its end, a window being `[first, last + 1 µs)`) where the session was
   * still open then, else the session's suspension or end, a presentation in it, a response
   * snapshot inside it, a save or an answer, and the sitting's end in it, the candidate's
   * submission or the close at the deadline while the candidate is there (an application suspends a
   * session it finds abandoned, never ends it). A window lies in the candidate sessions it
   * overlaps: it opens and grows only while one is open, and a beacon within the grace of a pause
   * and a resumption extends the window across them. A session is charged up to its last sign: the
   * time after it, a closed tab's or a lost connection's, is no time the candidate used (H10), so
   * an application suspends a session it finds abandoned, and the suspension, stamped when it is
   * written, charges nothing past the last sign; a pause the candidate makes carries a beacon of
   * its own, first in the pause's transaction, and is charged to the pause.
   */
  const presenceSigns = query(ledger)
    .rule((r) => {
      const { child, stage, k, at } = v(TestVisit, "visitSign");

      return r
        .match(TestVisit, { at, child, k, stage })
        .find({ at: Type.base(at), child, k, stage });
    })
    .rule((r) => {
      const { child, stage, k, at: began } = v(TestVisit, "openWindowVisit");
      const { during } = v(Presence, "openWindow");
      const last = Type.cast(Num.sub(Type.base(Range.upper(during, Moment)), 1n), pg.bigint);

      return r
        .match(TestVisit, { at: began, child, k, stage })
        .match(Presence, { child, during, stage })
        .where(
          r.ge(last, Type.base(began)),
          r.not(TestSuspension, { child, k, stage }),
          r.not(TestEnd, { child, stage }),
        )
        .find({ at: last, child, k, stage });
    })
    .rule((r) => {
      const { child, stage, k, at: began } = v(TestVisit, "suspendedWindowVisit");
      const { at: suspended } = v(TestSuspension, "windowSuspension");
      const { during } = v(Presence, "suspendedWindow");
      const last = Type.cast(Num.sub(Type.base(Range.upper(during, Moment)), 1n), pg.bigint);

      return r
        .match(TestVisit, { at: began, child, k, stage })
        .match(TestSuspension, { at: suspended, child, k, stage })
        .match(Presence, { child, during, stage })
        .where(
          r.ge(last, Type.base(began)),
          r.le(Type.base(Range.lower(during, Moment)), Type.base(suspended)),
        )
        .find({
          at: Logic.least(last, Type.base(suspended)),
          child,
          k,
          stage,
        });
    })
    .rule((r) => {
      const { child, stage, k, at: began } = v(TestVisit, "endedWindowVisit");
      const { at: end } = v(TestEnd, "windowEnd");
      const { during } = v(Presence, "endedWindow");
      const last = Type.cast(Num.sub(Type.base(Range.upper(during, Moment)), 1n), pg.bigint);

      return r
        .match(TestVisit, { at: began, child, k, stage })
        .match(TestEnd, { at: end, child, k, stage })
        .match(Presence, { child, during, stage })
        .where(
          r.ge(last, Type.base(began)),
          r.le(Type.base(Range.lower(during, Moment)), Type.base(end)),
        )
        .find({
          at: Logic.least(last, Type.base(end)),
          child,
          k,
          stage,
        });
    })
    .rule((r) => {
      const { child, stage, k, at } = v(TestPresented, "presentedSign");

      return r
        .match(TestPresented, { at, child, k, stage })
        .find({ at: Type.base(at), child, k, stage });
    })
    .rule((r) => {
      const { child, stage, k, at } = v(sessionSnapshots, "responseSign");

      return r
        .match(sessionSnapshots, { at, child, k, stage })
        .find({ at: Type.base(at), child, k, stage });
    })
    .rule((r) => {
      const { child, stage, k, at } = v(TestEnd, "endSign");

      return r.match(TestEnd, { at, child, k, stage }).find({ at: Type.base(at), child, k, stage });
    });

  /**
   * Each candidate session's last sign of presence ({@link presenceSigns}): its start where it
   * holds no later one. The visit is matched first, so its child, sitting and place are bound
   * before the greatest is taken, and each reader reads its own sessions' signs by key.
   */
  const lastPresences = query(ledger).rule((r) => {
    const { child, stage, k } = v(TestVisit, "signedVisit");
    const { at } = v(presenceSigns, "lastSign");

    return r
      .match(TestVisit, { child, k, stage })
      .match(presenceSigns, { at, child, k, stage })
      .find({ at: r.max(at), child, k, stage });
  });

  /**
   * Each member's built-in `duration`, in microseconds, exactly, its seconds a millionth of it:
   * "the accumulated time (in seconds) of all Candidate Sessions for all Attempts … the time
   * between the beginning and the end of the item session minus any time the session was in the
   * suspended state" (§2.2.2.2), the sum of its presentations' spans on the sitting's one clock,
   * each ending at the sitting's next moment, never past its candidate session's last sign of
   * presence (a closed tab's time is no time the item was used, H10) and, in a timed sitting, never
   * past its candidate session's deadline. A member's next presentation is stamped in the call that
   * ends its predecessor's attempt, so a linear part's spans meet with no gap and their sum is the
   * part's time (research/14 §3.6). Every member has one, read whether or not its item is time
   * dependent (pantry's spec reading `duration-without-time-dependence`; §2.2.2.2's "must not be
   * used" stands in a section the information model marks not normative, info:4599). Each rule sums
   * a member's spans in an interior stage and holds the sum as a {@link Micros} ({@link asMicros}):
   * a sum of spans of one sitting, each within the sitting's time.
   */
  const ItemDuration = derived(
    "ItemDuration",
    query(ledger)
      .rule((r) => {
        const timed = r.interior((s) => {
          const { child, stage, at, k, package: pkg, path, end } = v(presentedSpans, "timedSpan");
          const { at: began } = v(TestVisit, "timedSpanVisit");
          const { remaining } = v(TestBudget, "timedSpanBudget");
          const { at: last } = v(lastPresences, "timedSpanPresence");

          return s
            .match(presentedSpans, { at, child, end, k, package: pkg, path, stage })
            .match(TestVisit, { at: began, child, k, stage })
            .match(TestBudget, { child, k, remaining, stage })
            .match(lastPresences, { at: last, child, k, stage })
            .find({
              child,
              micros: s.sum(
                Logic.least(
                  Num.numeric(Num.sub(Type.base(end), Type.base(at))),
                  Num.sub(
                    Num.add(Num.numeric(Type.base(began)), Type.base(remaining)),
                    Num.numeric(Type.base(at)),
                  ),
                  Num.numeric(Num.sub(last, Type.base(at))),
                ),
              ),
              package: pkg,
              path,
              stage,
            });
        });
        const { child, micros, package: pkg, path, stage } = v(timed, "timedDuration");

        return r
          .match(timed, { child, micros, package: pkg, path, stage })
          .find({ child, micros: asMicros(micros), package: pkg, path, stage });
      })
      .rule((r) => {
        const untimed = r.interior((s) => {
          const { child, stage, at, k, package: pkg, path, end } = v(presentedSpans, "untimedSpan");
          const { at: last } = v(lastPresences, "untimedSpanPresence");

          return s
            .match(presentedSpans, { at, child, end, k, package: pkg, path, stage })
            .match(lastPresences, { at: last, child, k, stage })
            .where(s.not(TestBudget, { child, k, stage }))
            .find({
              child,
              micros: s.sum(
                Logic.least(
                  Num.numeric(Num.sub(Type.base(end), Type.base(at))),
                  Num.numeric(Num.sub(last, Type.base(at))),
                ),
              ),
              package: pkg,
              path,
              stage,
            });
        });
        const { child, micros, package: pkg, path, stage } = v(untimed, "untimedDuration");

        return r
          .match(untimed, { child, micros, package: pkg, path, stage })
          .find({ child, micros: asMicros(micros), package: pkg, path, stage });
      }),
  );

  /**
   * Each sitting's latest moment: the instant of its last visit, presentation, suspension or end.
   */
  const latestMoments = query(ledger).rule((r) => {
    const { child, stage, at } = v(TestMoment, "latestMoment");

    return r.match(TestMoment, { at, child, stage }).find({ at: r.max(at), child, stage });
  });

  /**
   * Each piece of a sitting's presence inside one of its question visits, half-open in microseconds
   * on the database's clock: a window's credit ({@link Presence}, from its first beacon to its
   * last, its width less 1 µs) cut to a presentation's span, from the presentation's instant to the
   * sitting's next moment (the candidate moved, suspended the sitting or its part ended), or, for
   * the presentation on screen now, the sitting's latest moment, to the window's last beacon. A
   * suspension's time lies in no presentation's span, so a window a pause and a resumption fall
   * inside is cut at both.
   */
  const presentPieces = query(ledger)
    .rule((r) => {
      const { child, stage, at, k, package: pkg, path, end } = v(presentedSpans, "pieceSpan");
      const { during } = v(Presence, "pieceWindow");
      const from = Logic.greatest(Type.base(Range.lower(during, Moment)), Type.base(at));
      const to = Logic.least(
        Type.cast(Num.sub(Type.base(Range.upper(during, Moment)), 1n), pg.bigint),
        Type.base(end),
      );

      return r
        .match(presentedSpans, { at, child, end, k, package: pkg, path, stage })
        .match(Presence, { child, during, stage })
        .where(r.lt(from, to))
        .find({
          at,
          child,
          from: Type.cast(from, PieceStart),
          k,
          package: pkg,
          path,
          stage,
          to: Type.cast(to, PieceEnd),
        });
    })
    .rule((r) => {
      const { child, stage, at, k, package: pkg, path } = v(TestPresented, "onScreen");
      const { during } = v(Presence, "onScreenWindow");
      const from = Logic.greatest(Type.base(Range.lower(during, Moment)), Type.base(at));
      const to = Type.cast(Num.sub(Type.base(Range.upper(during, Moment)), 1n), pg.bigint);

      return r
        .match(TestPresented, { at, child, k, package: pkg, path, stage })
        .match(latestMoments, { at, child, stage })
        .match(Presence, { child, during, stage })
        .where(r.lt(from, to))
        .find({
          at,
          child,
          from: Type.cast(from, PieceStart),
          k,
          package: pkg,
          path,
          stage,
          to: Type.cast(to, PieceEnd),
        });
    });

  /**
   * PresentTime: the time the candidate was there in each question visit, by UTC day, the reader
   * every application's time credit is read from (AlphaTest's question time, by day, which metis
   * rounds to whole seconds and rules over at its own level), stored nowhere. A question visit is a
   * presentation, by its instant `at`, with its candidate session `k` and its item's document;
   * `day` is the UTC day, its date, and `micros` the microseconds of the sitting's
   * presence inside the visit that day ({@link presentPieces}), cut at the sitting's next moment,
   * so at a move, a suspension and the end, and for the presentation on screen now running to its
   * latest window's last beacon. A window credits from its first beacon to its last, its width
   * less 1 µs, so a window of one beacon credits nothing, and a closed tab's or a lost
   * connection's time after the last beacon credits nothing. It is no QTI duration, which stays
   * its presentations' ({@link ItemDuration}).
   */
  const PresentTime = derived(
    "PresentTime",
    query(ledger).rule((r) => {
      const { child, stage, at, k, package: pkg, path, from, to } = v(presentPieces, "timePiece");
      const days = r.series(Num.div(from, dayMicros), Num.div(Num.sub(to, 1n), dayMicros));
      const { at: day } = v(days, "timeDay");
      const dayStart = Num.mul(day, dayMicros);

      return r
        .match(presentPieces, { at, child, from, k, package: pkg, path, stage, to })
        .match(days, { at: day })
        .find({
          at,
          child,
          day: Time.dateOfEpochDay(Type.cast(day, pg.bigint)),
          k,
          micros: r.sum(
            Num.sub(
              Logic.least(Num.numeric(to), Num.numeric(Num.add(dayStart, dayMicros))),
              Logic.greatest(Num.numeric(from), Num.numeric(dayStart)),
            ),
          ),
          package: pkg,
          path,
          stage,
        });
    }),
  );

  /**
   * LastPresence: each sitting's last beacon, in microseconds on the database's clock, one before
   * its latest window's end, which an application reads its candidate's absence from, by its own
   * threshold: the time since it, never a stored state.
   */
  const LastPresence = derived(
    "LastPresence",
    query(ledger).rule((r) => {
      const { child, stage } = v(TestSession, "lastWindowSitting");
      const { during } = v(Presence, "lastWindow");

      return r
        .match(TestSession, { child, stage })
        .match(Presence, { child, during, stage })
        .find({
          at: r.max(Type.cast(Num.sub(Type.base(Range.upper(during, Moment)), 1n), LastBeacon)),
          child,
          stage,
        });
    }),
  );

  /**
   * The budget each suspended candidate session of a timed sitting leaves its next, by the
   * suspended session's own `k`: the time it began with, less the time it ran, from its start to
   * its last sign of presence ({@link lastPresences}), two instants of the database's clock, a
   * {@link Micros}. The one statement of a later budget: a resumption's budget is read from it, the
   * budget of the candidate session `k` + 1, and "Budget chain" holds it there.
   */
  const nextBudgets = query(ledger).rule((r) => {
    const { child, stage, k, remaining } = v(TestBudget, "nextBudgetBudget");
    const { at: began } = v(TestVisit, "nextBudgetVisit");
    const { at: last } = v(lastPresences, "nextBudgetPresence");

    return r
      .match(TestBudget, { child, k, remaining, stage })
      .match(TestVisit, { at: began, child, k, stage })
      .match(TestSuspension, { child, k, stage })
      .match(lastPresences, { at: last, child, k, stage })
      .find({
        child,
        k,
        left: asMicros(Num.sub(Type.base(remaining), Num.numeric(Num.sub(last, Type.base(began))))),
        stage,
      });
  });

  const NextBudget = derived("NextBudget", nextBudgets);

  /**
   * Each later budget beside what its sitting's previous candidate session left it.
   */
  const BudgetChain = derived(
    "BudgetChain",
    query(ledger).rule((r) => {
      const { child, stage, k, remaining } = v(TestBudget, "budget");
      const { k: before, left } = v(nextBudgets, "before");

      return r
        .match(TestBudget, { child, k, remaining, stage })
        .match(nextBudgets, { child, k: before, left, stage })
        .where(r.eq(Type.base(k), Num.add(Type.base(before), 1n)))
        .find({ child, k, left, remaining, stage });
    }),
  );

  /**
   * Each suspended candidate session of a timed sitting whose test allows no late submission, with
   * the time it ran, up to its last sign of presence ({@link lastPresences}), and the time it began
   * with.
   */
  const SuspensionInTime = derived(
    "SuspensionInTime",
    query(ledger).rule((r) => {
      const { child, stage, package: pkg, path } = v(TestSession, "sitting");
      const { k, remaining } = v(TestBudget, "budget");
      const { at: began } = v(TestVisit, "visit");
      const { at: last } = v(lastPresences, "presence");

      return r
        .match(TestSession, { child, package: pkg, path, stage })
        .match(TestBudget, { child, k, remaining, stage })
        .match(TestVisit, { at: began, child, k, stage })
        .match(TestSuspension, { child, k, stage })
        .match(lastPresences, { at: last, child, k, stage })
        .where(r.not(LateTest, { package: pkg, path }))
        .find({
          child,
          k,
          ran: Num.sub(last, Type.base(began)),
          remaining,
          stage,
        });
    }),
  );

  /**
   * Each response the candidate gave in a timed candidate session of a sitting whose test allows no
   * late submission (Table 7.40.3, its default false): its snapshot inside that session ({@link
   * SessionSnapshot}), with `arrived`, the time from the session's beginning to the database's
   * stamp less the in-flight grace ({@link inFlightGraceMicros}), beside the time the session began
   * with. A response the candidate gave carries the browser's reading `given`, which marks it as
   * theirs and decides nothing; the end's attempts, which the browser gave nothing of, hold none
   * and are none of these.
   */
  const TimedResponse = derived(
    "TimedResponse",
    query(ledger).rule((r) => {
      const { child, stage, package: pkg, path, n, at, k, began } = v(sessionSnapshots, "timed");
      const { remaining } = v(TestBudget, "timedBudget");
      const { package: testPackage, path: test } = v(TestSession, "timedSitting");

      return r
        .match(sessionSnapshots, { at, began, child, k, n, package: pkg, path, stage })
        .match(SnapshotGiven, { at, child, n, package: pkg, path })
        .match(TestBudget, { child, k, remaining, stage })
        .match(TestSession, { child, package: testPackage, path: test, stage })
        .where(r.not(LateTest, { package: testPackage, path: test }))
        .find({
          arrived: Num.sub(Num.sub(Type.base(at), inFlightGraceMicros), Type.base(began)),
          at,
          child,
          n,
          package: pkg,
          path,
          remaining,
          stage,
        });
    }),
  );

  /**
   * Two instants of a sitting, by what they are: `earlier` must come before `later`, or be the same
   * instant where `strict` is false. Every pair is of the sitting's one clock, so its order is the
   * order the calls were committed.
   */
  const SittingOrder = derived(
    "SittingOrder",
    query(ledger)
      .rule((r) => {
        const { child, stage, k, at: earlier } = v(TestVisit, "visit");
        const { at: later } = v(TestSuspension, "suspension");

        return r
          .match(TestVisit, { at: earlier, child, k, stage })
          .match(TestSuspension, { at: later, child, k, stage })
          .find({ child, earlier, later, stage, strict: Type.literal(pg.boolean, true) });
      })
      .rule((r) => {
        const next = v(TestVisit, "next");
        const { k, at: earlier } = v(TestSuspension, "suspension");

        return r
          .match(TestSuspension, { at: earlier, child: next.child, k, stage: next.stage })
          .match(TestVisit, { at: next.at, child: next.child, k: next.k, stage: next.stage })
          .where(r.eq(Type.base(next.k), Num.add(Type.base(k), 1n)))
          .find({
            child: next.child,
            earlier,
            later: next.at,
            stage: next.stage,
            strict: Type.literal(pg.boolean, true),
          });
      })
      .rule((r) => {
        const { child, stage, k, at: earlier } = v(TestVisit, "visit");
        const { at: later } = v(TestPresented, "presented");

        return r
          .match(TestVisit, { at: earlier, child, k, stage })
          .match(TestPresented, { at: later, child, k, stage })
          .find({ child, earlier, later, stage, strict: Type.literal(pg.boolean, false) });
      })
      .rule((r) => {
        const { child, stage, k, at: later } = v(TestSuspension, "suspension");
        const { at: earlier } = v(TestPresented, "presented");

        return r
          .match(TestSuspension, { at: later, child, k, stage })
          .match(TestPresented, { at: earlier, child, k, stage })
          .find({ child, earlier, later, stage, strict: Type.literal(pg.boolean, true) });
      })
      .rule((r) => {
        const { child, stage, k, at: earlier } = v(TestVisit, "visit");
        const { at: later } = v(TestEnd, "end");

        return r
          .match(TestVisit, { at: earlier, child, k, stage })
          .match(TestEnd, { at: later, child, k, stage })
          .find({ child, earlier, later, stage, strict: Type.literal(pg.boolean, true) });
      })
      .rule((r) => {
        const { child, stage, k, at: later } = v(TestSuspension, "suspension");
        const { at: earlier } = v(TestEnd, "end");

        return r
          .match(TestSuspension, { at: later, child, k, stage })
          .match(TestEnd, { at: earlier, child, k, stage })
          .find({ child, earlier, later, stage, strict: Type.literal(pg.boolean, true) });
      })
      .rule((r) => {
        const { child, stage, at: earlier } = v(TestVisit, "visit");
        const { at: later } = v(TestEnd, "end");

        return r
          .match(TestVisit, { at: earlier, child, stage })
          .match(TestEnd, { at: later, child, stage })
          .find({ child, earlier, later, stage, strict: Type.literal(pg.boolean, true) });
      })
      .rule((r) => {
        const { child, stage, at: earlier } = v(TestSuspension, "suspension");
        const { at: later } = v(TestEnd, "end");

        return r
          .match(TestSuspension, { at: earlier, child, stage })
          .match(TestEnd, { at: later, child, stage })
          .find({ child, earlier, later, stage, strict: Type.literal(pg.boolean, true) });
      })
      .rule((r) => {
        const { child, stage, at: earlier } = v(TestPresented, "presented");
        const { at: later } = v(TestEnd, "end");

        return r
          .match(TestPresented, { at: earlier, child, stage })
          .match(TestEnd, { at: later, child, stage })
          .find({ child, earlier, later, stage, strict: Type.literal(pg.boolean, true) });
      }),
  );

  /**
   * Each presentation of a member of a sitting whose part is linear beside each presentation of the
   * member its sitting places next (`MemberPlace`, the next one's prior its place): "Once the
   * candidate moves on they are not permitted to return" (§2.8.2), so every presentation of a
   * member comes before every presentation of the member after it. With "Linear in order" (each
   * presented member's predecessor presented) that is every later presentation never of a member
   * before the earlier's: a later presentation of a member behind an earlier one's has, between the
   * two, the member after it presented no later than the earlier one, its predecessors all
   * presented by then. So one key probe a presentation, each way, states the law, where every
   * earlier presentation of the sitting would be read.
   */
  const LinearPresentations = derived(
    "LinearPresentations",
    query(ledger).rule((r) => {
      const { child, stage, package: pkg, path } = v(TestSession, "sitting");
      const member = v(TestPresented, "member");
      const after = v(TestPresented, "after");
      const { place } = v(MemberPlace, "memberPlace");
      const { prior } = v(MemberPlace, "afterPlace");

      return (
        r
          .match(TestSession, { child, package: pkg, path, stage })
          .match(TestRoot, { package: pkg, path })
          .match(TestPart, { navigation: NavigationMode.handle("linear"), package: pkg, path })
          // Both places before either presentation: from either presentation a judge reads its
          // member's place by its path, the other member's by place and prior, and the other's
          // presentations by that member's path, never the sitting's every presentation.
          .match(MemberPlace, { child, package: pkg, path: member.path, place, stage })
          .match(MemberPlace, { child, package: pkg, path: after.path, prior, stage })
          .match(TestPresented, { at: member.at, child, package: pkg, path: member.path, stage })
          .match(TestPresented, { at: after.at, child, package: pkg, path: after.path, stage })
          .where(r.eq(prior, Type.base(place)))
          .find({ after: after.at, child, member: member.at, stage })
      );
    }),
  );

  /**
   * A sitting's laws against its test (IMPL-TESTOP): members completely and only, one attempt each,
   * submitted together, in turn, each placed and a shuffling section's members ranked; that no
   * attempt follows its sitting's end is "Inside a candidate session".
   */
  const testLaws = testLawsOf(ledger);

  /**
   * The outcomes in force after external scoring, and the kind law (IMPL-ASSERT).
   */
  const assertions = assertionViewsOf(ledger);

  /**
   * Each attempt's status and what it waits for, the sittings that are final, and each sitting's
   * run in force.
   */
  const results = resultRelationsOf(ledger, assertions);

  /**
   * What a recorded application's request is made of, and the laws that bound its answer.
   */
  const operands = applicationOperandRelationsOf(ledger);

  /**
   * The items served for credit: those no reason leaves unservable (IMPL-GRADABLE).
   */
  const servable = servableOf(ledger);

  /**
   * The program each item's response processing runs, by the item (COMPILE-AT-PUBLISH C2).
   */
  const programs = responseProgramsOf(ledger);

  /**
   * The modules a package holds for its portable custom interactions: every one a PCI names is a
   * file of its package ("Module held").
   */
  const modules = moduleHeldOf(ledger);

  /**
   * The walk of every processing program a package holds, by the document that holds it
   * (COMPILE-AT-PUBLISH C2, the walk).
   */
  const walks = walksOf(ledger);

  /**
   * The content of a package's documents the grader and admission read, stored at publication.
   */
  const content = storedContentOf(ledger);

  const deliveryRelations = [
    DeliveredTest,
    ItemDuration,
    UndeliveredSitting,
    NextBudget,
    BudgetChain,
    SuspensionInTime,
    SittingOrder,
    LinearPresentations,
    TestSnapshot,
    SessionSnapshot,
    TimedResponse,
    PresentTime,
    LastPresence,
    ...testLaws.relations,
    ...assertions.relations,
    ...servable.relations,
    ...programs.relations,
    ...modules.relations,
    ...walks.relations,
    ...content.relations,
    ...creditRelationsOf(ledger, assertions),
    ...results.relations,
    ...sessionAttemptsOf(ledger),
    ...sessionControls.relations,
    ...operands.relations,
  ] as const;
  const deliveryLaws = [
    named(
      "Delivered shape",
      check("Delivered_shape", UndeliveredSitting, (u) => u.eq(u.delivered, true)),
    ),
    named(
      "Budget chain",
      check("Budget_chain", BudgetChain, (b) => b.eq(Type.base(b.remaining), b.left)),
    ),
    named(
      "Suspended in time",
      check("Suspended_in_time", SuspensionInTime, (s) =>
        s.le(Num.numeric(s.ran), Type.base(s.remaining)),
      ),
    ),
    named(
      "Sitting order",
      check("Sitting_order", SittingOrder, (o) =>
        o.or(o.gt(o.later, o.earlier), o.and(o.eq(o.strict, false), o.eq(o.later, o.earlier))),
      ),
    ),
    named(
      "Linear never back",
      check("Linear_never_back", LinearPresentations, (p) => p.lt(p.member, p.after)),
    ),
    /**
     * Inside a candidate session: every response snapshot of a sitting lies inside one of its
     * candidate sessions.
     */
    named(
      "Test snapshot of its session",
      contained(
        on(TestSnapshot, "child", "stage", "package", "path", "n", "at"),
        on(SessionSnapshot, "child", "stage", "package", "path", "n", "at"),
      ),
    ),
    /**
     * Response in time: a timed session's response arrived, by the database's stamp, within its
     * time and the in-flight grace past it.
     */
    named(
      "Response in time",
      check("Response_in_time", TimedResponse, (t) =>
        t.le(Num.numeric(t.arrived), Type.base(t.remaining)),
      ),
    ),
    ...testLaws.laws,
    ...assertions.laws,
    ...servable.laws,
    ...programs.laws,
    ...modules.laws,
    ...results.laws,
    ...sessionControls.laws,
    ...operands.laws,
  ] as const;

  return schema.extend([ledger], "Delivery", [...deliveryRelations], [...deliveryLaws]);
};
