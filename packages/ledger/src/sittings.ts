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
  check,
  closed,
  contained,
  contract,
  instant,
  key,
  Logic,
  mutable,
  natural,
  Num,
  on,
  pg,
  pred,
  relation,
  select,
  sha256,
  span,
  Type,
} from "@bjornpagen/grizzle";
import type { Decimal, Facts, Term } from "@bjornpagen/grizzle";
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
 * The reach of every span of microseconds the ledger computes, either way: a budget less the time
 * a candidate session ran, or the sum of a member's spans of one sitting, each within a sitting's
 * applied limit, about 4 × 10^18 microseconds, and its difference with an instant.
 *
 * @limitKind derived
 * @owner the test runtime's clock
 * @unit microseconds
 * @scope each span {@link asMicros} casts
 * @derivation the greatest power of ten {@link Micros}' twenty digits hold
 */
const microsReach = 10n ** 19n;

/**
 * A numeric a query computes, a span of microseconds.
 */
type NumericTerm = Term<Decimal, unknown, unknown, "numeric", Decimal, Facts, Decimal>;

/**
 * Cast a span of microseconds a query computes into {@link Micros}, under grizzle's range guard
 * (README, "A partial operation is guarded"). Every such span lies within {@link microsReach}, so
 * the guard's other arm, zero, stands in no committed state.
 *
 * @param micros - The span, a numeric.
 * @returns It, as a Micros.
 */
export const asMicros = (micros: NumericTerm) =>
  Logic.when(
    Num.within(micros, -microsReach, microsReach),
    (bounded) => Type.cast(Type.cast(bounded, pg.numeric(20, 0)), Micros),
    Type.literal(Micros, 0n),
  );

/**
 * The top of the database's clock as a presence window holds it, in microseconds since the Unix
 * epoch: 10000-01-01T00:00:00Z, the first microsecond past the last date grizzle holds, so every
 * microsecond of a window falls in a calendar day, which PresentTime credits it to as a `date`. A
 * reading, the microsecond past it and the grace past that are each well inside a bigint.
 *
 * @limitKind derived
 * @owner the presence readers (#ledger/delivery.ts PresentTime)
 * @unit microseconds since the Unix epoch
 * @scope each end of a presence window ({@link Moment}) and each reading ({@link Reading})
 * @derivation grizzle's `date` holds 0001-01-01 to 9999-12-31; the day after the last, in
 *   microseconds since 1970-01-01T00:00:00Z
 * @from grizzle's README, `date`
 */
export const clockTop = 253_402_300_800_000_000n;

/**
 * An end of a presence window: an instant on the database's clock in microseconds since the Unix
 * epoch, from 0 to {@link clockTop}, never a stored `instant`, which no span holds. A window's end
 * is one past its last reading, so the top is an end and no reading. It and a stamped instant
 * compare as readings of one clock (`Type.base` of the instant), never as one clock's order.
 */
export const Moment = named(
  "Presence moment",
  contract("Moment", pg.bigint, (t) => Num.within(t, 0n, clockTop)),
);

/**
 * A reading of the database's clock in microseconds since the Unix epoch, the instant a call's
 * transaction began (`clocked(…, { now: "micros" })`, `transaction_timestamp()`): one below
 * {@link Moment}'s top, so the microsecond past it is a window's end with no guard.
 */
export const Reading = named(
  "Presence reading",
  contract("Reading", pg.bigint, (t) => Num.within(t, 0n, clockTop - 1n)),
);

/**
 * The browser's reading of the database's clock when the candidate gave a response, in
 * microseconds since the Unix epoch, as the application sends it: the browser's estimate, a sensor
 * reading of a clock of its own, which may run ahead of the database's or behind it. A type of its
 * own, so no term compares it with an instant or a {@link Reading} without a cast, and no law
 * relates it to either: the two clocks share no order, so a reading ahead of the database's stamp
 * is evidence of skew, never a refusal.
 */
export const BrowserReading = named("Browser reading", contract("BrowserReading", pg.bigint));

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
 * - **Presence** `(child, stage, during)`: the candidate was there from `during`'s first beacon to
 *   its last, one window of an application's presence beacons, `[first, last + 1 µs)` on the
 *   database's clock ({@link Moment}), half-open, so a window of one beacon is one microsecond,
 *   never empty, and credits nothing: a window credits its width less 1 µs. No two windows of a
 *   sitting overlap: its key is `(child, stage, during WITHOUT OVERLAPS)`. A beacon puts the hull
 *   of its reading and every window within the grace of it, displacing them
 *   (`#ledger/sitting-programs.ts` beaconTest): it grows the latest window or opens one, so a
 *   sitting holds one row a stretch of presence, never one a beacon. The one open relation of the
 *   ledger, `mutable(Presence)`, changed only under its child's exclusive borrow (the Learner
 *   unit); a window is no moment of the sitting's clock, so it ends no presentation's span, and no
 *   QTI duration reads it: presence is the application's measure of time, a session's time is
 *   charged up to its last sign (H10), and an item's duration stays its presentations'
 *   (`#ledger/delivery.ts` ItemDuration).
 * - **SittingFinal** `(child, stage, at)`: the sitting's outcomes are final, at the instant they
 *   became so; one per sitting, and only of an ended one.
 * - **ShuffleRank** `(child, stage, package, path) → rank, ref, section`: the rank the member whose
 *   item document is `path` (its item ref at `ref`) takes in its sitting's order, where its section
 *   (`section`, the section's place in the test) has a `qti-ordering` that shuffles: "If 'true'
 *   causes the order of the child elements to be randomized" (§5.98.1). Its take draws it once, in
 *   the database, from its decision's seed over the test's package and the item ref's identifier
 *   (the SQL grader's `orderingRank`, plate's keyed digest), and a shuffling section presents its
 *   members in ascending rank, so the order is the sitting's fact from its start: a resumption, a
 *   review and the end read the one it began with, and two sittings of one test are two draws. No
 *   two members of a sitting share a rank, so the order is total.
 * - **MemberPlace** `(child, stage, package, path) → place, prior, ref, section`: the 1-based place
 *   the member whose item document is `path` takes in its sitting's order: the test's own order,
 *   its members' places ("If no ordering rule is given, assume that the elements are to be ordered
 *   in the order in which they are defined", §5.98), but a shuffling section's members in ascending
 *   ShuffleRank over the places the section's run holds; `prior`, the place before it; and `ref`
 *   and `section`, its item ref's place in the test and its section's, which the laws hold to the
 *   test's own rows by their keys (`#ledger/test-laws.ts` "Placed at its item ref"). Its take
 *   writes it after the ranks, once, so every reader of the order (the start, a resumption, the
 *   member after one, a review, the linear laws) reads one number by the sitting's key. No two
 *   members of a sitting share a place, nor a prior, so a member's neighbour is one key probe
 *   either way: the member whose place is its `prior`, or whose `prior` is its place; and a law
 *   over two neighbours reads their item refs from their rows, never a test's members by document.
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
  const PackageName = Package.fields.package;

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
  const Presence = named(
    "Presence window",
    relation("Presence", { ...sitting, during: span(Moment) }, ["child", "stage", "during"]),
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
  const ShuffleRank = named(
    "One rank a member",
    relation(
      "ShuffleRank",
      {
        ...sitting,
        package: PackageName,
        path: DocumentPath,
        rank: sha256,
        ref: natural,
        section: natural,
      },
      ["child", "stage", "package", "path"],
    ),
  );
  const MemberPlace = named(
    "One place a member",
    relation(
      "MemberPlace",
      {
        ...sitting,
        package: PackageName,
        path: DocumentPath,
        place: natural,
        prior: pg.bigint,
        ref: natural,
        section: natural,
      },
      ["child", "stage", "package", "path"],
    ),
  );
  const moment = (
    r: typeof TestVisit | typeof TestSuspension | typeof TestPresented | typeof TestEnd,
  ) =>
    named(
      "Moment",
      contained(on(r, "child", "stage", "at"), on(TestMoment, "child", "stage", "at")),
    );

  const tables = {
    MemberPlace,
    Presence,
    ShuffleRank,
    SittingFinal,
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
      "Presence of its test session",
      contained(on(Presence, "child", "stage"), on(TestSession, "child", "stage")),
    ),
    mutable(Presence),
    named("Final key", key(on(SittingFinal, "child", "stage"))),
    named(
      "Rank of its test session",
      contained(on(ShuffleRank, "child", "stage"), on(TestSession, "child", "stage")),
    ),
    named("One member a rank", key(on(ShuffleRank, "child", "stage", "rank"))),
    named(
      "Ranked members only",
      contained(
        on(ShuffleRank, "child", "stage", "package", "path", "ref", "section"),
        on(MemberPlace, "child", "stage", "package", "path", "ref", "section"),
      ),
    ),
    named(
      "Place of its test session",
      contained(
        on(MemberPlace, "child", "stage", "package"),
        on(TestSession, "child", "stage", "package"),
      ),
    ),
    named("One member a place", key(on(MemberPlace, "child", "stage", "place"))),
    named("One member a place", key(on(MemberPlace, "child", "stage", "prior"))),
    named(
      "Placed from the first",
      check("Placed_from_first", MemberPlace, (p) =>
        p.and(p.ge(p.place, 1n), p.eq(Num.sub(Type.base(p.place), Type.base(p.prior)), 1n)),
      ),
    ),
    // Each prior of a place after a sitting's first is a member's place, so with the check above a
    // sitting's places are 1 to its count of members.
    named(
      "Placed from the first",
      contained(
        on(
          select(MemberPlace, (p) => p.gt(p.place, 1n)),
          "child",
          "stage",
          "prior",
        ),
        on(MemberPlace, "child", "stage", "place"),
      ),
    ),
    named(
      "Final after the end",
      contained(on(SittingFinal, "child", "stage"), on(TestEnd, "child", "stage")),
    ),
  ];

  return { laws, tables } as const;
};
