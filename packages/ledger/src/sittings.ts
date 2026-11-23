/**
 * A test session in the ledger: a child taking a whole QTI 3.0.1 assessment test, each fact at the
 * database's instant. QTI's words for it, from the information model (`info301.txt`):
 *
 * - **The test session** (§2.8): "a group of assessment-items with an associated set of rules that
 *   determine which of the items the candidate sees, in what order, and in what way the candidate
 *   interacts with them". A stage that delivers a test holds one {@link TestSession}, and one item
 *   session per item ref of the test, all in their initial state: "In effect, item sessions are
 *   created in the initial state for all items at the start of the test and are maintained in
 *   parallel" (§2.2.1).
 * - **Candidate sessions** (§2.2.1): "During each attempt the candidate interacts with the item
 *   through one or more candidate sessions. At the end of a candidate session the item may be
 *   placed into the suspended state ready for the next candidate session." A {@link TestVisit} is
 *   one candidate session of the whole test, the first its start and each later one a resumption; a
 *   {@link TestSuspension} ends one, and every item session of the test is then suspended. A test's
 *   time is its candidate sessions' time: "the time between the beginning and the end of the item
 *   session minus any time the session was in the suspended state" (§2.2.2.2), and for a test "the
 *   durations of all the item sessions plus any other time spent navigating that part of the test"
 *   (§2.8.5).
 * - **Navigation** (§2.8.2): "A qti-test-part in linear mode restricts the candidate to attempt each
 *   item in turn. Once the candidate moves on they are not permitted to return." A
 *   {@link TestPresented} is the item the candidate is shown from its instant on, the item session
 *   entering the interacting state, so the items a linear part presents run in document order and
 *   never back.
 * - **The end** (§2.8.2, §2.9): "In simultaneous mode the candidate's responses are all submitted
 *   together at the end of the qti-test-part." {@link TestEnd} is that end, the candidate's
 *   submission or the delivery engine's close at the deadline: "The end of an attempt, and
 *   therefore response processing, must only take place in direct response to a user action or in
 *   response to some expected event, such as the end of a test" (§2.2.4).
 * - **Time limits** (§2.8.5, Table 7.40): "max-time … This is the maximum duration, in seconds,
 *   allocated to the test", and "The allow-late-submission attribute regulates whether a
 *   candidate's response that is beyond the max-time should still be accepted", "Default = false".
 *   {@link TestBudget} is the time a candidate session begins with; "the durations may be changed
 *   depending on the relevant accessibility values in the Personal Needs & Preferences settings for
 *   the learner" (§2.8.5): what an application grants a learner (AfA PNP 3.0's
 *   `additional-testing-time`) is its own level's, above this one, which states each budget's first
 *   value.
 *
 * Every instant of a sitting's candidate sessions, presentations and end is one clock,
 * {@link TestMoment}'s, whose child is the sitting: each call on a sitting stamps one moment above
 * every moment the sitting holds, so its visits, suspensions, presentations and end are ordered as
 * they were committed (grizzle's README, Instants). The response values a candidate gives are the
 * item sessions' own (`ResponseSnapshot`), on each item session's clock.
 *
 * This module states the stored relations and the laws a level states over its own relations: keys,
 * containments and the `pred` chain of candidate sessions. Every law that reads a join is a rule
 * over a query of the level above, `#delivery.ts`.
 */
import {
  closed,
  contained,
  contract,
  instant,
  key,
  natural,
  on,
  pg,
  pred,
  relation,
} from "@bjornpagen/grizzle";
import { LearnerId } from "#ledger/keys.ts";
import { named } from "#ledger/laws.ts";
import type { RegistryLevel } from "#ledger/registry/levels.ts";

/**
 * A span of time in microseconds, the resolution of the database's instants, exactly, a whole
 * numeric: what is left of a timed sitting's time at the start of a candidate session, computed
 * exactly from a test's `max-time` and its grant, which an application's level states. It may be
 * negative only where the test allows late submission, which lets a candidate session run past its
 * deadline. Twenty digits hold every applied limit DeliveredTest admits, about 4 × 10^18
 * microseconds, and its difference with an instant.
 */
export const Micros = named("Micros", contract("Micros", pg.numeric(20, 0)));

/**
 * A sitting's standing, in the order a sitting moves through them (§2.2.1, the item session's
 * states as its candidate sessions take them): `unstarted` before its first candidate session,
 * `open` in one, `suspended` between two, `ended` once its part has ended, and `final` once its
 * outcomes are (`SittingFinal`). What each sitting program reads back (`#ledger/sitting-queries.ts`
 * sittingStandingOf), so an application maps a call's outcome in its own transaction.
 */
export const SittingStanding = closed.ordered("SittingStanding", [
  "unstarted",
  "open",
  "suspended",
  "ended",
  "final",
]);

/**
 * The stored relations of a test session and the laws over them alone, for the ledger's own level.
 *
 * - **TestSession** `(child, stage) → package, path`: the learner's sitting `stage` delivers the test
 *   whose document is `path` in `package`; `stage` is an opaque key the application assigns, the
 *   one an item session of the sitting names too.
 * - **TestMoment** `(child, stage, at)`: an instant at which the candidate acted on the sitting, the
 *   sitting's clock.
 * - **TestVisit** `(child, stage, k) → at`: the sitting's `k`-th candidate session began at `at`, the
 *   first its start.
 * - **TestSuspension** `(child, stage, k) → at`: candidate session `k` ended at `at`, the sitting
 *   suspended.
 * - **TestBudget** `(child, stage, k) → remaining`: a timed sitting's time left when candidate
 *   session `k` began.
 * - **TestPresented** `(child, stage, at) → k, package, path`: from `at` on, in candidate session
 *   `k`, the candidate is shown the item whose document is `path`.
 * - **TestEnd** `(child, stage) → at, k`: the sitting's end, in candidate session `k`.
 * - **TestBeacon** `(child, stage, at) → k`: at `at`, in candidate session `k`, the candidate was
 *   there: an application's presence beacon, which the session's time is charged up to (H10), no
 *   moment of the sitting's clock, so it ends no presentation's span.
 * - **SittingFinal** `(child, stage, at)`: the sitting's outcomes are final, at the instant they
 *   became so; one per sitting, and only of an ended one.
 *
 * A candidate session is the sitting's next only after the one before it was suspended, so they run
 * gapless from 0 and at most one is open: `pred` of a visit's `k` is a suspension's.
 */
export const sittingTablesOf = (qti: RegistryLevel) => {
  const { Document, Package } = qti.relations;

  /**
   * A package as the ledger names it in a key, the ledger's own (`#ledger.ts`): the name it is
   * published under.
   */
  const PackageName = Package.fields.name;

  /**
   * A test or an item as the ledger names it: its document's path in its package (SPEC-AUDIT
   * SV-KEY-01: a test and an item are each `(package, path)`).
   */
  const DocumentPath = Document.fields.path;

  const sitting = { child: LearnerId, stage: pg.bigint } as const;
  const TestSession = named(
    "One test session a sitting",
    relation("TestSession", { ...sitting, package: PackageName, path: DocumentPath }, [
      "child",
      "stage",
    ]),
  );
  const TestMoment = named(
    "Moment instant",
    relation("TestMoment", { ...sitting, at: instant }, ["child", "stage", "at"]),
  );
  const TestVisit = named(
    "Candidate session place",
    relation("TestVisit", { ...sitting, at: instant, k: natural }, ["child", "stage", "k"]),
  );
  const TestSuspension = named(
    "Candidate session place",
    relation("TestSuspension", { ...sitting, at: instant, k: natural }, ["child", "stage", "k"]),
  );
  const TestBudget = named(
    "Candidate session place",
    relation("TestBudget", { ...sitting, k: natural, remaining: Micros }, ["child", "stage", "k"]),
  );
  const TestPresented = named(
    "Moment instant",
    relation(
      "TestPresented",
      { ...sitting, at: instant, k: natural, package: PackageName, path: DocumentPath },
      ["child", "stage", "at"],
    ),
  );
  const TestEnd = named(
    "One end a sitting",
    relation("TestEnd", { ...sitting, at: instant, k: natural }, ["child", "stage"]),
  );
  const TestBeacon = named(
    "Beacon instant",
    relation("TestBeacon", { ...sitting, at: instant, k: natural }, ["child", "stage", "at"]),
  );
  /**
   * A sitting whose outcomes are final, stored at the instant the write that made it so stamps (a
   * clock whose child is the sitting), one row per sitting: the fact the application awaits (den
   * awaits only a stored relation, the lead's ruling of 2026-11-20). The Delivery level's laws hold
   * it to its condition, `SettledSitting`, both ways. HANDOVER: once den awaits a derived relation,
   * this relation is `SettledSitting` itself, a hard cutover.
   */
  const SittingFinal = named(
    "Final instant",
    relation("SittingFinal", { ...sitting, at: instant }, ["child", "stage", "at"]),
  );
  const moment = (
    r: typeof TestVisit | typeof TestSuspension | typeof TestPresented | typeof TestEnd,
  ) =>
    named(
      "Moment",
      contained(on(r, "child", "stage", "at"), on(TestMoment, "child", "stage", "at")),
    );

  const tables = {
    SittingFinal,
    TestBeacon,
    TestBudget,
    TestEnd,
    TestMoment,
    TestPresented,
    TestSession,
    TestSuspension,
    TestVisit,
  } as const;

  const laws = [
    named(
      "Moment of its test session",
      contained(on(TestMoment, "child", "stage"), on(TestSession, "child", "stage")),
    ),
    moment(TestVisit),
    moment(TestSuspension),
    moment(TestPresented),
    moment(TestEnd),
    named("Moment key", key(on(TestVisit, "child", "stage", "at"))),
    named("Moment key", key(on(TestSuspension, "child", "stage", "at"))),
    named(
      "Visits between suspensions",
      contained(
        on(TestVisit, "child", "stage", pred("k")),
        on(TestSuspension, "child", "stage", "k"),
      ),
    ),
    named(
      "Suspension of a visit",
      contained(on(TestSuspension, "child", "stage", "k"), on(TestVisit, "child", "stage", "k")),
    ),
    named(
      "Budget of a visit",
      contained(on(TestBudget, "child", "stage", "k"), on(TestVisit, "child", "stage", "k")),
    ),
    named(
      "Presented in a visit",
      contained(on(TestPresented, "child", "stage", "k"), on(TestVisit, "child", "stage", "k")),
    ),
    named(
      "End of a visit",
      contained(on(TestEnd, "child", "stage", "k"), on(TestVisit, "child", "stage", "k")),
    ),
    named(
      "Beacon of a visit",
      contained(on(TestBeacon, "child", "stage", "k"), on(TestVisit, "child", "stage", "k")),
    ),
    named("Final key", key(on(SittingFinal, "child", "stage"))),
    named(
      "Final after the end",
      contained(on(SittingFinal, "child", "stage"), on(TestEnd, "child", "stage")),
    ),
  ];

  return { laws, tables } as const;
};
