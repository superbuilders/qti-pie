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
 * - **In turn**: an attempt is of a presented member, in any part; and in an individual linear part,
 *   where "the candidate [is restricted] to attempt each item in turn. Once the candidate moves on
 *   they are not permitted to return" (Table 5.159.4, `navigation-mode`), a member presented before
 *   a later presentation of another member has its attempt: moving on submits, and a skip is a
 *   submission of NULL responses (Table 7.19.6, `allow-skipping`). In a simultaneous part moving on
 *   submits nothing: "each item session passes between the interacting and suspended states only"
 *   (Table 5.159.5), its attempts the end's ("Submitted together").
 * - **Linear in order**: in a linear part every member before a presented member was presented, so
 *   with "Linear never back" its presentations run in member order from the first: "each item in
 *   turn" (Table 5.159.4) is every item, a skipped one presented and submitted with no response
 *   (Table 7.19.6). The members' order is the sitting's, the places its take writes
 *   (`MemberPlace`): the test's own order, but a section whose `qti-ordering` shuffles presents its
 *   members in their sitting's ranks (§5.98.1, `ShuffleRank`). It is stated as each presented
 *   member's predecessor presented, which is every member before it in turn, one probe a
 *   presentation; a delivered test has one part, so that is its predecessor in its part. Sound
 *   while a delivered test holds no qti-selection, qti-pre-condition or qti-branch-rule
 *   (`#ledger/delivery.ts` undeliveredKinds; a pre-condition skips an item and a branch rule jumps,
 *   §2.8.3, §5.23).
 * - **Members placed** and **Placed members only**: a sitting's places are exactly its members, one
 *   each, which its take writes.
 * - **Placed from the first** and **Placed in order**: a sitting's places run from 1 with no gap, and
 *   each member placed after another is after it in the test's order: by its item ref's place, but
 *   within one shuffling section by its rank. A sitting's places are a total order of its members
 *   (One member a place), so every step in order makes them the one order its test and ranks give,
 *   each place held by its neighbour's alone, one key probe a member (its `prior`), never by a
 *   comparison of every pair.
 * - **Shuffled members ranked** and **Ranked members only**: a sitting's ranks are exactly the
 *   members of its test's shuffling sections, one each, which its take draws (§5.98.1: "If 'true'
 *   causes the order of the child elements to be randomized"; §5.98: "If no ordering rule is given,
 *   assume that the elements are to be ordered in the order in which they are defined").
 * - **Shown before saved**: a save is of a presented member, in any part. An item session is in its
 *   initial state "before the delivery has taken place" (§2.2.1), and the candidate sets or updates
 *   its response variables only in the interacting state, in which "The body must be presented to
 *   the candidate" (§2.3); so a save of a member never shown is no response the candidate gave, and
 *   is refused at its write, never admitted for the end to drop (the end submits only what was
 *   shown, `#ledger/finish.ts`).
 *
 * Every relation here is derived and stores nothing; each law reads its query at commit.
 */
import { check, contained, derived, key, on, query, Type, v } from "@bjornpagen/grizzle";
import type { LedgerLevel } from "#ledger/delivery.ts";
import { named } from "#ledger/laws.ts";

export const testLawsOf = (ledger: LedgerLevel) => {
  const {
    Attempt,
    ItemSession,
    MemberPlace,
    NavigationMode,
    Save,
    SectionShuffle,
    ShuffleRank,
    SubmissionMode,
    TestEnd,
    TestMember,
    TestPart,
    TestPresented,
    TestSession,
    UnlimitedMember,
  } = ledger.relations;

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
   * Each member of each sitting in a section whose ordering shuffles, by the item document its ref
   * names: `section` the section's place, `test` the test's, the members its sitting ranks
   * (`ShuffleRank`).
   */
  const shuffledMembers = query(ledger).rule((r) => {
    const { child, stage, package: pkg, path: test } = v(TestSession, "shuffledSitting");
    const { document, section } = v(TestMember, "shuffledMember");

    return r
      .match(TestSession, { child, package: pkg, path: test, stage })
      .match(TestMember, { document, package: pkg, path: test, section })
      .match(SectionShuffle, { package: pkg, path: test, section })
      .find({ child, package: pkg, path: document, section, stage, test });
  });
  const ShuffledMember = derived("ShuffledMember", shuffledMembers);

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
        .where(r.not(UnlimitedMember, { package: pkg, path: test, start }))
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
   * Each sitting's member with a save.
   */
  const savedMembers = query(ledger).rule((r) => {
    const { child, package: pkg, path, n } = v(Save, "save");
    const { stage } = v(ItemSession, "savedSession");

    return r
      .match(Save, { child, n, package: pkg, path })
      .match(ItemSession, { child, n, package: pkg, path, stage })
      .match(TestSession, { child, stage })
      .find({ child, package: pkg, path, stage });
  });
  const SavedMember = derived("SavedMember", savedMembers);

  /**
   * Each sitting with an attempt of a member of a simultaneous part.
   */
  const simultaneousAttempts = query(ledger).rule((r) => {
    const { child, stage, package: pkg, path } = v(testAttempts, "attempt");
    const { test, part } = v(sittingMembers, "member");

    return r
      .match(testAttempts, { child, package: pkg, path, stage })
      .match(sittingMembers, { child, package: pkg, part, path, stage, test })
      .match(TestPart, {
        package: pkg,
        path: test,
        start: part,
        submission: SubmissionMode.handle("simultaneous"),
      })
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
      .match(TestPart, {
        package: pkg,
        path: test,
        start: part,
        submission: SubmissionMode.handle("simultaneous"),
      })
      .find({ child, package: pkg, path, stage });
  });
  const EndedPresentation = derived("EndedPresentation", endedPresentations);

  /**
   * Each member of an individual linear part the candidate moved on from: presented before a later
   * presentation of another member of the sitting. The two instants are the sitting's one clock
   * (`TestMoment`), so their order is the order the presentations were committed.
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
      .match(TestPart, {
        navigation: NavigationMode.handle("linear"),
        package: pkg,
        path: test,
        start: part,
        submission: SubmissionMode.handle("individual"),
      })
      .find({ child, package: pkg, path, stage });
  });
  const MovedOn = derived("MovedOn", movesOn);

  /**
   * Each member of a linear sitting placed just before a presented member, by its item document:
   * the member whose place (`MemberPlace`) is the presented member's prior. Every presented
   * member's predecessor presented is every member before it presented, each in turn back to the
   * first, so one probe a presentation states the law. A delivered test has one part, and selects,
   * skips and branches nothing (`#ledger/delivery.ts` undeliveredTests, undeliveredKinds), so a
   * test whose part is linear holds every member in it, and the law reads the test's part and two
   * places, never the test's members.
   */
  const linearPreceding = query(ledger).rule((r) => {
    const { child, stage, package: pkg, path } = v(TestPresented, "presentedLater");
    const { path: test } = v(TestSession, "linearSitting");
    const { prior } = v(MemberPlace, "shownPlace");
    const before = v(MemberPlace, "beforePlace");

    return r
      .match(TestPresented, { child, package: pkg, path, stage })
      .match(TestSession, { child, package: pkg, path: test, stage })
      .match(TestPart, { navigation: NavigationMode.handle("linear"), package: pkg, path: test })
      .match(MemberPlace, { child, package: pkg, path, prior, stage })
      .match(MemberPlace, { child, package: pkg, path: before.path, place: before.place, stage })
      .where(r.eq(Type.base(before.place), prior))
      .find({ child, package: pkg, path: before.path, stage });
  });
  const LinearPreceding = derived("LinearPreceding", linearPreceding);

  /**
   * Each two members of a sitting placed one after the other (`MemberPlace`), the earlier's place
   * the later's prior, so a step is one key probe from either: `from` and `to` the places of their
   * item refs in the test, `section` and `next` their sections'.
   */
  const placeSteps = query(ledger).rule((r) => {
    const { child, stage, package: pkg, path: test } = v(TestSession, "steppedSitting");
    const later = v(MemberPlace, "laterPlaced");
    const earlier = v(MemberPlace, "earlierPlaced");
    const to = v(TestMember, "laterRef");
    const from = v(TestMember, "earlierRef");

    return r
      .match(TestSession, { child, package: pkg, path: test, stage })
      .match(MemberPlace, { child, package: pkg, path: later.path, prior: later.prior, stage })
      .match(MemberPlace, { child, package: pkg, path: earlier.path, place: earlier.place, stage })
      .match(TestMember, {
        document: later.path,
        package: pkg,
        path: test,
        section: to.section,
        start: to.start,
      })
      .match(TestMember, {
        document: earlier.path,
        package: pkg,
        path: test,
        section: from.section,
        start: from.start,
      })
      .where(r.eq(Type.base(earlier.place), later.prior))
      .find({
        child,
        earlier: earlier.path,
        from: from.start,
        later: later.path,
        next: to.section,
        package: pkg,
        section: from.section,
        stage,
        test,
        to: to.start,
      });
  });

  /**
   * Each step of a sitting's places ({@link placeSteps}) but between two members of one shuffling
   * section, by the places of their item refs in the test: the test's own order (§5.98: "If no
   * ordering rule is given, assume that the elements are to be ordered in the order in which they
   * are defined"). A shuffling section holds item refs alone, so its members are one run of places,
   * and a step into or out of it compares as any other.
   */
  const RefSteps = derived(
    "RefSteps",
    query(ledger)
      .rule((r) => {
        const { child, stage, from, to, section, next } = v(placeSteps, "crossingStep");
        const { earlier, later, package: pkg, test } = v(placeSteps, "crossingMembers");

        return r
          .match(placeSteps, {
            child,
            earlier,
            from,
            later,
            next,
            package: pkg,
            section,
            stage,
            test,
            to,
          })
          .where(r.ne(section, next))
          .find({ child, from, later, stage, to });
      })
      .rule((r) => {
        const { child, stage, from, to, section } = v(placeSteps, "sectionStep");
        const { earlier, later, package: pkg, test } = v(placeSteps, "sectionMembers");

        return r
          .match(placeSteps, {
            child,
            earlier,
            from,
            later,
            next: section,
            package: pkg,
            section,
            stage,
            test,
            to,
          })
          .where(r.not(SectionShuffle, { package: pkg, path: test, section }))
          .find({ child, from, later, stage, to });
      }),
  );

  /**
   * Each step of a sitting's places ({@link placeSteps}) between two members of one shuffling
   * section, by their ranks in the sitting (`ShuffleRank`): the section presents its members in
   * ascending rank (§5.98.1).
   */
  const RankSteps = derived(
    "RankSteps",
    query(ledger).rule((r) => {
      const { child, stage, section } = v(placeSteps, "rankedStep");
      const { earlier, from, later, package: pkg, test, to } = v(placeSteps, "rankedMembers");
      const fromRank = v(ShuffleRank, "earlierRank");
      const toRank = v(ShuffleRank, "laterRank");

      return r
        .match(placeSteps, {
          child,
          earlier,
          from,
          later,
          next: section,
          package: pkg,
          section,
          stage,
          test,
          to,
        })
        .match(SectionShuffle, { package: pkg, path: test, section })
        .match(ShuffleRank, { child, package: pkg, path: earlier, rank: fromRank.rank, stage })
        .match(ShuffleRank, { child, package: pkg, path: later, rank: toRank.rank, stage })
        .find({ child, from: fromRank.rank, later, stage, to: toRank.rank });
    }),
  );

  const relations = [
    SittingMember,
    ShuffledMember,
    SittingSession,
    LimitedTestAttempt,
    AttemptedMember,
    PresentedMember,
    SavedMember,
    SimultaneousAttempt,
    EndedPresentation,
    MovedOn,
    LinearPreceding,
    RefSteps,
    RankSteps,
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
   * Shown before saved: a save is of a member the candidate was shown, in any part.
   */
  const savedWhenPresented = named(
    "Shown before saved",
    contained(
      on(SavedMember, "child", "stage", "package", "path"),
      on(PresentedMember, "child", "stage", "package", "path"),
    ),
  );

  /**
   * Linear in order: in a linear part every member before a presented member was presented.
   */
  const presentedInOrder = named(
    "Linear in order",
    contained(
      on(LinearPreceding, "child", "stage", "package", "path"),
      on(PresentedMember, "child", "stage", "package", "path"),
    ),
  );

  /**
   * In turn: an individual linear part's member the candidate moved on from has its attempt.
   */
  const movingOnSubmits = named(
    "In turn",
    contained(
      on(MovedOn, "child", "stage", "package", "path"),
      on(AttemptedMember, "child", "stage", "package", "path"),
    ),
  );

  /**
   * Members placed: every member of a sitting has its place in the sitting's order.
   */
  const membersPlaced = named(
    "Members placed",
    contained(
      on(SittingMember, "child", "stage", "package", "path"),
      on(MemberPlace, "child", "stage", "package", "path"),
    ),
  );

  /**
   * Placed members only: a sitting's place is of a member of its test.
   */
  const placedOnlyMembers = named(
    "Placed members only",
    contained(
      on(MemberPlace, "child", "stage", "package", "path"),
      on(SittingMember, "child", "stage", "package", "path"),
    ),
  );

  /**
   * Placed in order: a member placed after another is after it in the test's order, by item ref
   * outside a shuffling section, by rank within one.
   */
  const placedByRef = named(
    "Placed in order",
    check("Placed_by_ref", RefSteps, (p) => p.lt(p.from, p.to)),
  );
  const placedByRank = named(
    "Placed in order",
    check("Placed_by_rank", RankSteps, (p) => p.lt(p.from, p.to)),
  );

  /**
   * Shuffled members ranked: every member of a sitting's shuffling section has its rank in the
   * sitting.
   */
  const shuffledRanked = named(
    "Shuffled members ranked",
    contained(
      on(ShuffledMember, "child", "stage", "package", "path"),
      on(ShuffleRank, "child", "stage", "package", "path"),
    ),
  );

  /**
   * Ranked members only: a sitting's rank is of a member of one of its test's shuffling sections.
   */
  const rankedOnlyShuffled = named(
    "Ranked members only",
    contained(
      on(ShuffleRank, "child", "stage", "package", "path"),
      on(ShuffledMember, "child", "stage", "package", "path"),
    ),
  );

  const laws = [
    membersCompletely,
    membersPlaced,
    placedOnlyMembers,
    placedByRef,
    placedByRank,
    shuffledRanked,
    rankedOnlyShuffled,
    memberPackage,
    membersOnly,
    oneAttempt,
    submittedWithTheEnd,
    endSubmitsPresented,
    attemptedWhenPresented,
    movingOnSubmits,
    savedWhenPresented,
    presentedInOrder,
  ] as const;

  return { laws, relations } as const;
};
