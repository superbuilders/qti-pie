/**
 * A test session's laws (IMPL-TESTOP, after D2:
 * `out/grading-sql/alphatest/02-test-outcome-processing.md` §2.2), in the delivery level: rules
 * over queries of the ledger's stored relations (`#ledger.ts`, `#sittings.ts`) and pantry's test
 * views (`#test-content.ts`), each read from QTI 3.0.1's information model (`info301.txt`), its
 * class texts:
 *
 * - **Members, completely** and **Members only**: a sitting's item sessions are exactly its test's
 *   members, one per item ref, each named by the item document its ref names (IMPL-TESTS'
 *   `TestMember.document`; SV-KEY-01: an item is `(package, path)`). "If no selection rules are
 *   given it must be assumed that all elements are to be selected" (Table 5.129, info:42753), and a
 *   delivered test selects nothing (`DeliveredTest`).
 * - **One attempt**: at most one attempt per member's item session, but an unlimited member's. In a
 *   simultaneous part "By definition the candidate can take one and only one attempt at each item"
 *   (the overview, info:5376, from TestPart's `submission-mode`, Table 5.159.5); in an individual
 *   part a non-adaptive item's `max-attempts` is 1 by default (Table 7.19.1), and only an item
 *   ref's own `max-attempts` 0, "no limit", lifts it (`#ledger/member-controls.ts`).
 * - **Submitted together**: in a simultaneous part, "the candidate's responses are all submitted
 *   together at the end of the qti-test-part" (TestPart's `submission-mode`, Table 5.159.5:
 *   "simultaneous ... all submitted together at the end"): every attempt of such a member has its
 *   sitting's end, and an ended sitting's every presented member has its attempt (an item session's
 *   attempt begins when it is presented, so a presented member goes to the end with one).
 * - **In turn**: an attempt is of a presented member, in any part; and in a linear part, where "the
 *   candidate [is restricted] to attempt each item in turn. Once the candidate moves on they are
 *   not permitted to return" (Table 5.159.4, `navigation-mode`), a member presented before a later
 *   presentation of another member has its attempt: moving on submits, and a skip is a submission
 *   of NULL responses (Table 7.19.6, `allow-skipping`).
 *
 * Every relation here is derived and stores nothing; each law reads its query at commit.
 */
import { check, contained, derived, key, on, query, v } from "@bjornpagen/grizzle";
import type { LedgerLevel } from "#ledger/delivery.ts";
import { named } from "#ledger/laws.ts";
import { memberControlsOf } from "#ledger/member-controls.ts";

export const testLawsOf = (ledger: LedgerLevel) => {
  const { Attempt, ItemSession, TestEnd, TestMember, TestPart, TestPresented, TestSession } =
    ledger.relations;

  /**
   * Each member of each sitting, by the item document its ref names (IMPL-TESTS'
   * `TestMember.document`, SV-KEY-01: an item is `(package, path)`): `path` the item's, `test` the
   * test's, `part` its part's start.
   */
  const sittingMembers = query(ledger).rule((r) => {
    const { child, stage, package: pkg, path: test } = v(TestSession, "sitting");
    const { document, part } = v(TestMember, "member");

    return r
      .match(TestSession, { child, package: pkg, path: test, stage })
      .match(TestMember, { document, package: pkg, part, path: test })
      .find({ child, package: pkg, part, path: document, stage, test });
  });
  const SittingMember = derived("SittingMember", sittingMembers);

  /**
   * Each item session of a sitting's stage, with its sitting's test: `package` and `path` the item
   * session's, `testPackage` and `test` the sitting's.
   */
  const sittingSessions = query(ledger).rule((r) => {
    const { child, stage, package: pkg, path } = v(ItemSession, "session");
    const { package: testPackage, path: test } = v(TestSession, "sitting");

    return r
      .match(ItemSession, { child, package: pkg, path, stage })
      .match(TestSession, { child, package: testPackage, path: test, stage })
      .find({ child, package: pkg, path, stage, test, testPackage });
  });
  const SittingSession = derived("SittingSession", sittingSessions);

  /**
   * Each attempt of a sitting's item session, with its stage.
   */
  const testAttempts = query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at } = v(Attempt, "attempt");
    const { stage } = v(ItemSession, "session");

    return r
      .match(Attempt, { at, child, n, package: pkg, path })
      .match(ItemSession, { child, n, package: pkg, path, stage })
      .match(TestSession, { child, stage })
      .find({ at, child, n, package: pkg, path, stage });
  });
  const TestAttempt = derived("TestAttempt", testAttempts);

  /**
   * The unlimited members, whose item sessions take any number of attempts.
   */
  const { unlimitedMembers } = memberControlsOf(ledger);

  /**
   * Each attempt of a sitting's member that takes at most one: every member's but an unlimited
   * one's.
   */
  const LimitedTestAttempt = derived(
    "LimitedTestAttempt",
    query(ledger).rule((r) => {
      const { at, child, n, package: pkg, path, stage } = v(testAttempts, "limitedAttempt");
      const { path: test } = v(TestSession, "limitedSitting");
      const { start } = v(TestMember, "limitedMember");

      return r
        .match(testAttempts, { at, child, n, package: pkg, path, stage })
        .match(TestSession, { child, package: pkg, path: test, stage })
        .match(TestMember, { document: path, package: pkg, path: test, start })
        .where(r.not(unlimitedMembers, { package: pkg, path: test, start }))
        .find({ at, child, n, package: pkg, path, stage });
    }),
  );

  /**
   * Each sitting's member that has its attempt.
   */
  const attemptedMembers = query(ledger).rule((r) => {
    const { child, stage, package: pkg, path } = v(testAttempts, "attempt");

    return r
      .match(testAttempts, { child, package: pkg, path, stage })
      .find({ child, package: pkg, path, stage });
  });
  const AttemptedMember = derived("AttemptedMember", attemptedMembers);

  /**
   * Each sitting's member the candidate has been shown.
   */
  const presentedMembers = query(ledger).rule((r) => {
    const { child, stage, package: pkg, path } = v(TestPresented, "presented");

    return r
      .match(TestPresented, { child, package: pkg, path, stage })
      .find({ child, package: pkg, path, stage });
  });
  const PresentedMember = derived("PresentedMember", presentedMembers);

  /**
   * Each sitting with an attempt of a member of a simultaneous part.
   */
  const simultaneousAttempts = query(ledger).rule((r) => {
    const { child, stage, package: pkg, path } = v(testAttempts, "attempt");
    const { test, part } = v(sittingMembers, "member");

    return r
      .match(testAttempts, { child, package: pkg, path, stage })
      .match(sittingMembers, { child, package: pkg, part, path, stage, test })
      .match(TestPart, { package: pkg, path: test, start: part, submission: "simultaneous" })
      .find({ child, stage });
  });
  const SimultaneousAttempt = derived("SimultaneousAttempt", simultaneousAttempts);

  /**
   * Each presented member of a simultaneous part of a sitting that has ended.
   */
  const endedPresentations = query(ledger).rule((r) => {
    const { child, stage, package: pkg, path } = v(TestPresented, "presented");
    const { test, part } = v(sittingMembers, "member");

    return r
      .match(TestPresented, { child, package: pkg, path, stage })
      .match(TestEnd, { child, stage })
      .match(sittingMembers, { child, package: pkg, part, path, stage, test })
      .match(TestPart, { package: pkg, path: test, start: part, submission: "simultaneous" })
      .find({ child, package: pkg, path, stage });
  });
  const EndedPresentation = derived("EndedPresentation", endedPresentations);

  /**
   * Each member of a linear part the candidate moved on from: presented before a later presentation
   * of another member of the sitting. The two instants are the sitting's one clock (`TestMoment`),
   * so their order is the order the presentations were committed.
   */
  const movesOn = query(ledger).rule((r) => {
    const { child, stage, package: pkg, path, at } = v(TestPresented, "before");
    const later = v(TestPresented, "later");
    const { test, part } = v(sittingMembers, "member");

    return r
      .match(TestPresented, { at, child, package: pkg, path, stage })
      .match(TestPresented, {
        at: later.at,
        child,
        package: later.package,
        path: later.path,
        stage,
      })
      .where(r.lt(at, later.at))
      .where(r.or(r.ne(pkg, later.package), r.ne(path, later.path)))
      .match(sittingMembers, { child, package: pkg, part, path, stage, test })
      .match(TestPart, { navigation: "linear", package: pkg, path: test, start: part })
      .find({ child, package: pkg, path, stage });
  });
  const MovedOn = derived("MovedOn", movesOn);

  const relations = [
    SittingMember,
    SittingSession,
    TestAttempt,
    LimitedTestAttempt,
    AttemptedMember,
    PresentedMember,
    SimultaneousAttempt,
    EndedPresentation,
    MovedOn,
  ] as const;

  /**
   * Members, completely: every member of a sitting's test has its item session in the sitting's
   * stage.
   */
  const membersCompletely = named(
    "Members, completely",
    contained(
      on(SittingMember, "child", "stage", "package", "path"),
      on(ItemSession, "child", "stage", "package", "path"),
    ),
  );

  /**
   * Members only, its package: every item session of a sitting's stage is in its test's package.
   */
  const memberPackage = named(
    "Members only, its package",
    check("MemberPackage", SittingSession, (s) => s.eq(s.package, s.testPackage)),
  );

  /**
   * Members only: every item session of a sitting's stage is of a member of its test.
   */
  const membersOnly = named(
    "Members only",
    contained(
      on(SittingSession, "package", "test", "path"),
      on(TestMember, "package", "path", "document"),
    ),
  );

  /**
   * One attempt: at most one attempt per member's item session, an unlimited member's aside.
   */
  const oneAttempt = named(
    "One attempt",
    key(on(LimitedTestAttempt, "child", "package", "path", "n")),
  );

  /**
   * Submitted together: a simultaneous part's attempts exist only with its sitting's end.
   */
  const submittedWithTheEnd = named(
    "Submitted together",
    contained(on(SimultaneousAttempt, "child", "stage"), on(TestEnd, "child", "stage")),
  );

  /**
   * Submitted together: a simultaneous part's end submits every member the candidate was shown.
   */
  const endSubmitsPresented = named(
    "Submitted together",
    contained(
      on(EndedPresentation, "child", "stage", "package", "path"),
      on(AttemptedMember, "child", "stage", "package", "path"),
    ),
  );

  /**
   * In turn: an attempt is of a member the candidate was shown, in any part.
   */
  const attemptedWhenPresented = named(
    "In turn",
    contained(
      on(AttemptedMember, "child", "stage", "package", "path"),
      on(PresentedMember, "child", "stage", "package", "path"),
    ),
  );

  /**
   * In turn: a linear part's member the candidate moved on from has its attempt.
   */
  const movingOnSubmits = named(
    "In turn",
    contained(
      on(MovedOn, "child", "stage", "package", "path"),
      on(AttemptedMember, "child", "stage", "package", "path"),
    ),
  );

  const laws = [
    membersCompletely,
    memberPackage,
    membersOnly,
    oneAttempt,
    submittedWithTheEnd,
    endSubmitsPresented,
    attemptedWhenPresented,
    movingOnSubmits,
  ] as const;

  return { laws, relations } as const;
};
