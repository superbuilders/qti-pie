/**
 * The test runtime's writes over a learner's sittings, as builders over the delivery level
 * (`#delivery.ts`), which an application's workload over its own role takes and composes with
 * `ChangeSet.union` and `ChangeSet.sequence`: what a candidate does to a sitting, exactly
 * to QTI 3.0.1, written once for every application (edullm's QTI app, metis).
 *
 * - `take` { taken }: each sitting the application's decision made (`taken`, its key, its test and
 *   its decision's seed), its test session, and an item session "in the initial state for all items
 *   at the start of the test" (§2.2.1) per member with the seed its processing draws under, the
 *   rank each member of a shuffling section takes in the sitting's order (`ShuffleRank`, §5.98.1)
 *   and every member's place in it (`MemberPlace`), each with its item ref and section, and beside
 *   them the template processing of each and the record it begins with (`#ledger/grade.ts`
 *   takeValuesOf), all in one stratum, so `taken` is read once. The application binds `taken` to
 *   its query of what its decision wrote, in the stratum after it, its guard in that query
 *   (`ChangeSet.sequence(appDecide, take.bind({ taken: appTaken }))`).
 * - `enterTest` { sittings, entries }: the sitting's next candidate session (§1.5, §2.2.1), its `k`
 *   the count of the sessions before it, presenting the member its entry names by its item
 *   document, at the start and on a resumption alike, the application binding `entries` to the
 *   entries its call makes (`resumedEntries`, where its candidate left it; `namedEntries`, the
 *   member a call names by its item ref's identifier): in a nonlinear part "the candidate is free
 *   to navigate to any item in the test at any time" (the overview, from TestPart's
 *   `navigation-mode`, Table 5.159.4), and in a linear part the delivery level's laws hold it to
 *   the member order ("Linear in order", "Linear never back") and, in an individual part, to the
 *   member the candidate is on ("In turn"); a timed sitting's later budget is what its suspended
 *   session left (`NextBudget`). The start's budget is the application's applied limit, which it
 *   unions in.
 * - `presentItem` { sittings, item }: the candidate moves to the member whose item ref is `item`.
 * - `saveTestItem` { sittings, item, given, …values }: a response given and not submitted, QTI's
 *   suspended values (§2.2.4).
 * - `skipTestItem` { sittings, item, given, …values, next }: a skip, the same attempt and move with
 *   no value written, every response submitted at its default (Table 7.19.6), `DefaultSubmission`;
 *   its value lists are empty, which its admission judges.
 * - `answerTestItem` { sittings, item, given, …values, next }: an individual part's attempt (Table
 *   7.19.1: one attempt for a non-adaptive item, any number for an item ref whose `max-attempts` is
 *   0), and the member `next` names presented where it names one, each only where the member's
 *   response admission, under its item ref's validate-responses, gives no reason
 *   (`#ledger/grade.ts` memberAnswerAdmissionOf, over `sittings` and `item`).
 * - `beaconTest` { sittings, now }: the open candidate session's presence beacon at `now`, the
 *   database's clock (served `clocked(…, { now: "micros" })`), the application's sign that its
 *   candidate is there: one put of the sitting's presence window, grown or opened (`Presence`),
 *   which the session's time is charged up to (`#delivery.ts`, H10) and time credit is read from,
 *   served through a role of its own ({@link presenceWrites}).
 * - `suspendTest`, `endTest` { sittings }: the open candidate session suspended; the sitting's part
 *   ended. A pause the candidate makes is `beaconTest`, then `suspendTest`, in one transaction,
 *   charged to the pause, served through the presence role ({@link presenceWrites}); an application
 *   that finds a session abandoned suspends it alone, charged to its last sign of presence.
 *
 * `sittings` is the relation parameter every builder but the take reads
 * (`#ledger/sitting-queries.ts` sittingHeading), which the application binds once per program to
 * its own query of the sittings it may act on, edullm's the authenticated child's, so a sitting it
 * names nothing of is unreachable, and every rule matches each with its test session. An item is
 * named by its `qti-assessment-item-ref`'s identifier, resolved through the sitting's test to its
 * document and item session; a candidate session's `k` and an item session's place `n` are read in
 * the statement, never passed. A move of a sitting's candidate sessions (entering, presenting,
 * suspending, ending) whose sitting is not in the state it needs writes nothing and answers
 * `unchanged`: a second tab, a double start. A response is the delivery level's to judge: one
 * outside a candidate session, or arriving past its time and the in-flight grace, is refused,
 * naming "Inside a candidate session" or "Response in time" (`#delivery.ts`), whoever writes it.
 * Each program reads back what it wrote, and `standing`, each of its sittings' standing after it
 * (`#ledger/sitting-queries.ts` sittingStandingOf), so a caller maps an `unchanged` outcome in the
 * call's own transaction.
 *
 * Why builders over the delivery level, not a role's: grizzle checks a write against its role
 * (WritableCheck), and that check defers over a role type parameter, so a helper generic over the
 * application's role does not typecheck, and a write-permission token threaded through it was
 * rejected as a second, weaker statement of the role's grants. A ChangeSet over the level below
 * every application's role is one any of them takes; an application's own facts (its decision, its
 * applied limit, its bookmarks) union in from its own level. A level's rule reads no level above
 * it, so an application's guard enters these statements through the relation parameters it binds
 * (`ChangeSet.bind`), its query run inside each statement with no read before it.
 *
 * Instants are microseconds on the database's clock, which stamps every row these programs write;
 * `given` is the browser's reading, recorded beside a response, never ordered by and never
 * admitting one: what arrives by a timed session's deadline and the in-flight grace, by the
 * database's stamp, is admitted, the latest save winning.
 */
import { ChangeSet, Fn, Logic, Num, pg, query, Range, Type, v } from "@bjornpagen/grizzle";
import { presenceGraceMicros } from "#ledger/delivery.ts";
import type { deliveryOf } from "#ledger/delivery.ts";
import { memberAnswerAdmissionOf, takeValuesOf } from "#ledger/grade.ts";
import { orderingRank, processingSeed } from "#ledger/grading.ts";
import { SnapshotKind } from "#ledger/ledger.ts";
import {
  shownMemberOf,
  sittingHeading,
  sittingStandingOf,
  takenHeading,
} from "#ledger/sitting-queries.ts";
import { BrowserReading, Moment, Reading } from "#ledger/sittings.ts";

/**
 * The relations the test runtime's programs write of a sitting beside its item sessions, by name
 * and by the mode a role writes each by: its test session, its moments, candidate sessions,
 * suspensions, budgets, presentations and end, a save's rows and its snapshot's given reading, the
 * close's `DefaultSubmission` of a presented member with no save, and its take's ranks of a
 * shuffling section's members, each closed, so a role's insert list names it.
 */
export const sittingWrites = {
  insert: [
    "TestSession",
    "TestMoment",
    "TestVisit",
    "TestSuspension",
    "TestBudget",
    "TestPresented",
    "TestEnd",
    "Save",
    "SnapshotGiven",
    "DefaultSubmission",
    "ShuffleRank",
    "MemberPlace",
  ],
  write: [],
} as const;

/**
 * The grants of a presence role, the one declaration every composition spreads into a role of its
 * own, by name and by the mode a role writes each by: `Presence`, the ledger's one open relation,
 * whose window a beacon's put displaces (`beaconTest`), so its write list names it; and what a
 * pause's suspension inserts after its beacon in the same transaction (`suspendTest`'s moment and
 * suspension), so its insert list names them.
 *
 * A role of its own, never beside a composition's other writes: an insert into `Presence`, whose
 * primary key holds a span, has no READ COMMITTED form (its exclusion constraint arbitrates by ON
 * CONFLICT DO NOTHING alone), so the role that serves it runs SERIALIZABLE (grizzle's generate:
 * "move each ChangeSet that inserts into a relation whose primary key holds a span to a role of
 * its own"). A role that holds it with every other write runs all of them SERIALIZABLE, a
 * package's publish and grading with the beacons; one that leaves it out runs READ COMMITTED.
 */
export const presenceWrites = {
  insert: ["TestMoment", "TestSuspension"],
  write: ["Presence"],
} as const;

/**
 * The delivery level the builders write over.
 */
export type DeliveryLevel = ReturnType<typeof deliveryOf>;

/**
 * The test runtime's builders over a delivery level.
 *
 * @param delivery The delivery level, the installation's composition of qti-pie's levels, whose
 *   laws judge every response these programs write (`#delivery.ts`).
 * @returns The queries and ChangeSets of a sitting.
 */
export const sittingProgramsOf = (delivery: DeliveryLevel) => {
  const f = delivery.relations;
  const ItemRef = f.Named.fields.identifier;

  /**
   * Response admission of the member an answer posts to (`#ledger/grade.ts`'s
   * memberAnswerAdmissionOf, over the call's `sittings` and `item`): an answer it gives a
   * reason against writes nothing, and a response its values in force hide keeps its value: NULL
   * at a member's first attempt, and an unlimited member's latest attempt's after it
   * (`responseTarget`).
   */
  const admission = memberAnswerAdmissionOf(delivery);

  /**
   * Each sitting's open candidate session: its visit with no suspension, the sitting not ended.
   */
  const openVisit = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const { child, stage } = v(sittings, "openSitting");
    const { k } = v(f.TestVisit, "openVisit");

    return r
      .match(sittings, { child, stage })
      .match(f.TestVisit, { child, k, stage })
      .where(r.not(f.TestSuspension, { child, k, stage }), r.not(f.TestEnd, { child, stage }))
      .find({ child, k, stage });
  });

  /**
   * The member a call names by its item ref's identifier, in its sitting, with its item session.
   */
  const sittingMember = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const { child, stage } = v(sittings, "memberSitting");
    const { package: pkg, path: test } = v(f.TestSession, "memberTest");
    const { document } = v(f.TestMember, "member");
    const { n } = v(f.ItemSession, "memberSession");

    return r
      .match(sittings, { child, stage })
      .match(f.TestSession, { child, package: pkg, path: test, stage })
      .match(f.TestMember, { document, item: r.param("item", ItemRef), package: pkg, path: test })
      .match(f.ItemSession, { child, n, package: pkg, path: document, stage })
      .find({ child, n, package: pkg, path: document, stage });
  });

  /**
   * The member a call names ({@link sittingMember}) in its sitting's open candidate session: what
   * a presentation shows, in that session's `k`.
   */
  const memberTarget = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const open = openVisit.bind({ sittings });
    const member = sittingMember.bind({ item: r.param("item", ItemRef), sittings });
    const { child, stage, k } = v(open, "memberOpen");
    const { package: pkg, path, n } = v(member, "memberShown");

    return r
      .match(open, { child, k, stage })
      .match(member, { child, n, package: pkg, path, stage })
      .find({ child, k, n, package: pkg, path, stage });
  });

  /**
   * The item session a response is given in, while it takes another attempt: the member's ({@link
   * sittingMember}), one rule per way. A member under QTI's default `max-attempts`, 1, has no
   * attempt yet, since its one attempt closes it (Table 7.19.1) and "Once in the closed state the
   * values of the response variables are fixed" (§2.2.1); an unlimited member (`UnlimitedMember`,
   * its item ref's `max-attempts` 0: "A value of 0 indicates no limit", Table 7.19.1) takes one
   * after each. Its sitting's state is the delivery level's laws': a response lies inside a
   * candidate session, and a timed one's arrives within its time and the in-flight grace
   * (`#delivery.ts`), each refused, naming it, where it does not.
   */
  const responseTarget = query(delivery)
    .rule((r) => {
      const member = sittingMember.bind({
        item: r.param("item", ItemRef),
        sittings: r.relation("sittings", sittingHeading),
      });
      const { child, stage, package: pkg, path, n } = v(member, "response");

      return r
        .match(member, { child, n, package: pkg, path, stage })
        .where(r.not(f.Attempt, { child, n, package: pkg, path }))
        .find({ child, n, package: pkg, path, stage });
    })
    .rule((r) => {
      const item = r.param("item", ItemRef);
      const member = sittingMember.bind({
        item,
        sittings: r.relation("sittings", sittingHeading),
      });
      const { child, stage, package: pkg, path, n } = v(member, "unlimitedResponse");
      const { path: test } = v(f.TestSession, "unlimitedTest");

      return r
        .match(member, { child, n, package: pkg, path, stage })
        .match(f.TestSession, { child, package: pkg, path: test, stage })
        .match(f.UnlimitedMember, { item, package: pkg, path: test })
        .find({ child, n, package: pkg, path, stage });
    });

  /**
   * Each of the call's sittings with its standing after the call ({@link sittingStandingOf}): the
   * read-back every program carries as `standing`.
   */
  const standing = sittingStandingOf(delivery);

  /**
   * Each of the call's timed sittings' latest suspended session, by its `k`, bound to the call's
   * sittings before its maximum, so it reads their budgets alone.
   */
  const lastNext = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const { child, stage } = v(sittings, "budgetedSitting");
    const { k, left } = v(f.NextBudget, "lastNextBudget");

    return r
      .match(sittings, { child, stage })
      .match(f.NextBudget, { child, k, left, stage })
      .find({ child, k: r.max(k), stage });
  });

  /**
   * What each of the call's timed sittings' last candidate session left ({@link lastNext}).
   */
  const lastLeft = query(delivery).rule((r) => {
    const lastAt = lastNext.bind({ sittings: r.relation("sittings", sittingHeading) });
    const { child, stage, k } = v(lastAt, "lastNext");
    const { left } = v(f.NextBudget, "lastLeft");

    return r
      .match(lastAt, { child, k, stage })
      .match(f.NextBudget, { child, k, left, stage })
      .find({ child, left, stage });
  });

  /**
   * A sitting of `sittings` that has no open candidate session and has not ended, with its test.
   */
  const closedSitting = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const { child, stage } = v(sittings, "closedSitting");
    const { package: pkg, path } = v(f.TestSession, "closedTest");
    const open = openVisit.bind({ sittings });

    return r
      .match(sittings, { child, stage })
      .match(f.TestSession, { child, package: pkg, path, stage })
      .where(r.not(open, { child, stage }), r.not(f.TestEnd, { child, stage }))
      .find({ child, package: pkg, path, stage });
  });

  /**
   * The take, in one stratum, so every write of it reads `taken` once, in one statement: each
   * sitting of `taken` (the rows the application binds it to), its test session, and per member of
   * its test an item session in the initial state (§2.2.1: "item sessions are created in the
   * initial state for all items at the start of the test"), at its next place, with the seed its
   * template and response processing draw under (`SessionSeed`, the machine's `processing_seed`)
   * from its decision's seed and the item's identifier; beside them, in the same statement, the
   * template processing of each and the record each begins with (`#ledger/grade.ts` takeValuesOf),
   * over the same members ({@link takenMembers}), so nothing the take writes is read back by it.
   * The application's guard (no unended sitting of the test for the child, `#ledger/results.ts`
   * UnendedSitting) is in the query it binds `taken` to, and holds for every write of the take.
   */
  const takenMembers = query(delivery).rule((r) => {
    const taken = r.relation("taken", takenHeading);
    const { child, stage, package: pkg, path: test, seed: decision } = v(taken, "takenSitting");
    const { document } = v(f.TestMember, "takenMember");
    const { value: identifier } = v(f.ObjectIdentifier, "takenItem");

    return r
      .match(taken, { child, package: pkg, path: test, seed: decision, stage })
      .match(f.TestMember, { document, package: pkg, path: test })
      .match(f.ObjectIdentifier, { package: pkg, path: document, value: identifier })
      .find({
        child,
        package: pkg,
        path: document,
        seed: Fn.call(processingSeed, { decision, identifier, package: pkg }),
        stage,
      });
  });
  /**
   * The ranks of the take's members in shuffling sections, each with its section's place: each
   * member's from its decision's seed over the test's package and its item ref's identifier (the
   * SQL grader's `orderingRank`, keyed as plate's digests are), so its sitting presents the section
   * in a draw of its own, the same at every read of the sitting.
   */
  const takenRanked = query(delivery).rule((r) => {
    const taken = r.relation("taken", takenHeading);
    const { child, stage, package: pkg, path: test, seed: decision } = v(taken, "rankedSitting");
    const { document, item, section, start: ref } = v(f.TestMember, "rankedMember");

    return r
      .match(taken, { child, package: pkg, path: test, seed: decision, stage })
      .match(f.TestMember, { document, item, package: pkg, path: test, section, start: ref })
      .match(f.SectionShuffle, { package: pkg, path: test, section })
      .find({
        child,
        package: pkg,
        path: document,
        rank: Fn.call(orderingRank, { decision, identifier: item, package: pkg }),
        ref,
        section,
        stage,
      });
  });

  /**
   * {@link takenRanked} as `ShuffleRank` holds it, each rank with its item ref and section.
   */
  const takenRanks = query(delivery).rule((r) => {
    const ranked = takenRanked.bind({ taken: r.relation("taken", takenHeading) });
    const { child, stage, package: pkg, path, rank, ref, section } = v(ranked, "rank");

    return r
      .match(ranked, { child, package: pkg, path, rank, ref, section, stage })
      .find({ child, package: pkg, path, rank, ref, section, stage });
  });
  /**
   * Each member of the take's sittings that its sitting presents at or before a member of a
   * shuffling section (`predecessor`, by its item document): every member of the test whose place
   * is before the section's, and every member of the section whose rank ({@link takenRanks}) is at
   * or below its own, itself among them. A shuffling section holds item refs alone, so its members
   * are one run of places and no member outside it is placed between two of them.
   */
  const takenPredecessors = query(delivery)
    .rule((r) => {
      const taken = r.relation("taken", takenHeading);
      const { child, stage, package: pkg, path: test } = v(taken, "precededSitting");
      const { document, section, start: ref } = v(f.TestMember, "precededMember");
      const before = v(f.TestMember, "beforeSection");

      return r
        .match(taken, { child, package: pkg, path: test, stage })
        .match(f.TestMember, { document, package: pkg, path: test, section, start: ref })
        .match(f.SectionShuffle, { package: pkg, path: test, section })
        .match(f.TestMember, {
          document: before.document,
          package: pkg,
          path: test,
          start: before.start,
        })
        .where(r.lt(before.start, section))
        .find({
          child,
          package: pkg,
          path: document,
          predecessor: before.document,
          ref,
          section,
          stage,
        });
    })
    .rule((r) => {
      const ranked = takenRanked.bind({ taken: r.relation("taken", takenHeading) });
      const { child, stage, package: pkg, path, rank, ref, section } = v(ranked, "rankedMember");
      const lower = v(ranked, "lowerMember");

      return r
        .match(ranked, { child, package: pkg, path, rank, ref, section, stage })
        .match(ranked, { child, package: pkg, path: lower.path, rank: lower.rank, section, stage })
        .where(r.le(lower.rank, rank))
        .find({ child, package: pkg, path, predecessor: lower.path, ref, section, stage });
    });

  /**
   * The place of each member of the take's sittings in its sitting's order: a member of no
   * shuffling section at its test's own position, the count of the test's members at or before its
   * item ref's place (§5.98: "If no ordering rule is given, assume that the elements are to be
   * ordered in the order in which they are defined"; pantry's memberPositions counts the same, here
   * for the unshuffled members alone); a member of one at the count of the members its sitting
   * presents at or before it ({@link takenPredecessors}), so a shuffling section's members take the
   * positions its run holds, in ascending rank (§5.98.1). grizzle has no window function at run
   * time, so a place is the count it is, once, at the take.
   */
  const takenCounts = query(delivery)
    .rule((r) => {
      const taken = r.relation("taken", takenHeading);
      const { child, stage, package: pkg, path: test, seed } = v(taken, "placedSitting");
      const placed = v(f.TestMember, "placedRef");
      const earlier = v(f.TestMember, "placedAfter");

      // The query's key is not proven at the type level, so the count binds its sources' whole headings.
      return r
        .match(taken, { child, package: pkg, path: test, seed, stage })
        .match(f.TestMember, {
          document: placed.document,
          item: placed.item,
          package: pkg,
          part: placed.part,
          path: test,
          section: placed.section,
          start: placed.start,
          test: placed.test,
        })
        .match(f.TestMember, {
          document: earlier.document,
          item: earlier.item,
          package: pkg,
          part: earlier.part,
          path: test,
          section: earlier.section,
          start: earlier.start,
          test: placed.test,
        })
        .where(
          r.not(f.SectionShuffle, { package: pkg, path: test, section: placed.section }),
          r.le(earlier.start, placed.start),
        )
        .find({
          child,
          package: pkg,
          path: placed.document,
          place: r.count(),
          ref: placed.start,
          section: placed.section,
          stage,
        });
    })
    .rule((r) => {
      const predecessors = takenPredecessors.bind({ taken: r.relation("taken", takenHeading) });
      const {
        child,
        stage,
        package: pkg,
        path,
        predecessor,
        ref,
        section,
      } = v(predecessors, "placedShuffled");

      // The query's key is not proven at the type level, so the count binds its source's whole heading.
      return r
        .match(predecessors, { child, package: pkg, path, predecessor, ref, section, stage })
        .find({ child, package: pkg, path, place: r.count(), ref, section, stage });
    });

  /**
   * {@link takenCounts} as `MemberPlace` holds them, each with the place before it and its item
   * ref's place and section: written once, beside the ranks, so every reader of the order reads one
   * number by the sitting's key, a member's neighbour is one key probe, and a law over two
   * neighbours reads their item refs from their places.
   */
  const takenPlaces = query(delivery).rule((r) => {
    const counts = takenCounts.bind({ taken: r.relation("taken", takenHeading) });
    const { child, stage, package: pkg, path, place, ref, section } = v(counts, "counted");

    return r.match(counts, { child, package: pkg, path, place, ref, section, stage }).find({
      child,
      package: pkg,
      path,
      place,
      // A count of a sitting's members is far inside bigint; one past it would take prior -1, which
      // "Placed from the first" refuses, so the take fails rather than place a member wrongly.
      prior: Logic.when(
        Num.within(Num.sub(Type.base(place), 1n), 0n, 2n ** 62n),
        (before) => Type.cast(before, pg.bigint),
        -1n,
      ),
      ref,
      section,
      stage,
    });
  });

  const take = ChangeSet.union(
    ChangeSet.empty(delivery)
      .insert(
        f.TestSession,
        query(delivery).rule((r) => {
          const taken = r.relation("taken", takenHeading);
          const { child, stage, package: pkg, path } = v(taken, "takenTest");

          return r
            .match(taken, { child, package: pkg, path, stage })
            .find({ child, package: pkg, path, stage });
        }),
      )
      .insert(
        f.ItemSession,
        query(delivery).rule((r) => {
          const members = takenMembers.bind({ taken: r.relation("taken", takenHeading) });
          const { child, stage, package: pkg, path } = v(members, "takenSession");

          return r
            .match(members, { child, package: pkg, path, stage })
            .find({ child, package: pkg, path, stage });
        }),
      )
      .insert(
        f.SessionSeed,
        query(delivery).rule((r) => {
          const members = takenMembers.bind({ taken: r.relation("taken", takenHeading) });
          const { child, stage, package: pkg, path, seed } = v(members, "seededSession");

          return r
            .match(members, { child, package: pkg, path, seed, stage })
            .find({ child, package: pkg, path, seed, stage });
        }),
      )
      .insert(f.ShuffleRank, takenRanks)
      .insert(f.MemberPlace, takenPlaces),
    takeValuesOf(delivery).bind({ takenSessions: takenMembers }),
  );

  /**
   * The entries a call makes, the `entries` relation parameter its entry reads ({@link enterTest}):
   * each a sitting by its key ({@link sittingHeading}) with the item document of the member its
   * next candidate session presents, the member as the ledger names it (`TestPresented`,
   * `MemberPlace`, `ItemSession`). An application binds it to the entries its call makes:
   * {@link resumedEntries}, or {@link namedEntries}.
   */
  const entryHeading = { ...sittingHeading, path: f.TestPresented.fields.path } as const;

  /**
   * Each of the call's sittings' member last presented: where {@link resumedEntries} resumes it.
   */
  const lastPresented = shownMemberOf(delivery);

  /**
   * The entries that resume each of the call's sittings where its candidate left it: the member
   * last presented, where a candidate session showed one, else the member its sitting places first
   * (`MemberPlace` 1: the test's first member, or, where that is a member of a shuffling section,
   * the section's least-ranked). QTI names no member a start or a resumption opens at ("Test
   * delivery systems are free to implement their own user interface elements to facilitate
   * navigation provided they honour the navigation mode currently in effect", §2.8.2), so this is a
   * delivery's choice, stated once for every application that makes it, and the delivery level's
   * laws judge it as any other entry. Each is a member of the sitting by the row it is read from,
   * so neither reads the test's members.
   */
  const resumedEntries = query(delivery)
    .rule((r) => {
      const shown = lastPresented.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { child, stage, path } = v(shown, "resumedAt");

      return r.match(shown, { child, path, stage }).find({ child, path, stage });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage } = v(sittings, "startedAt");
      const { path } = v(f.MemberPlace, "firstPlaced");

      return r
        .match(sittings, { child, stage })
        .match(f.MemberPlace, { child, path, place: 1n, stage })
        .where(r.not(f.TestPresented, { child, stage }))
        .find({ child, path, stage });
    });

  /**
   * The entries that present, in each of the call's sittings, the member a call names by its item
   * ref's identifier, `item`, by its item document: a page that shows a member of a sitting outside
   * its candidate sessions. An identifier that names no member of the sitting's test names no
   * entry.
   */
  const namedEntries = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const { child, stage } = v(sittings, "namedAt");
    const { package: pkg, path: test } = v(f.TestSession, "namedTest");
    const { document } = v(f.TestMember, "namedMember");

    return r
      .match(sittings, { child, stage })
      .match(f.TestSession, { child, package: pkg, path: test, stage })
      .match(f.TestMember, { document, item: r.param("item", ItemRef), package: pkg, path: test })
      .find({ child, path: document, stage });
  });

  /**
   * A sitting of `sittings` the call enters ({@link closedSitting}) with the member its entry names
   * (`entries`, {@link entryHeading}): the member the candidate session presents, by its item
   * document.
   */
  const enteringSitting = query(delivery).rule((r) => {
    const closed = closedSitting.bind({ sittings: r.relation("sittings", sittingHeading) });
    const entries = r.relation("entries", entryHeading);
    const { child, stage, package: pkg, path: test } = v(closed, "enteringTest");
    const { path } = v(entries, "entry");

    return r
      .match(closed, { child, package: pkg, path: test, stage })
      .match(entries, { child, path, stage })
      .find({ child, package: pkg, path, stage, test });
  });

  /**
   * A candidate session's beginning: the sitting's moment, the visit `k`, the count of the visits
   * before it (they run gapless from 0, each after the one before it was suspended), the member it
   * presents, the one the call names ({@link enteringSitting}), and a timed resumption's budget,
   * what the suspended session left (`NextBudget`). The start's budget is the application's applied
   * limit, unioned in. Each fold binds its source's whole key.
   */
  const enterTest = ChangeSet.empty(delivery)
    .insert(
      f.TestMoment,
      query(delivery).rule((r) => {
        const entering = enteringSitting.bind({
          entries: r.relation("entries", entryHeading),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, stage } = v(entering, "entered");

        return r.match(entering, { child, stage }).find({ child, stage });
      }),
    )
    .insert(
      f.TestVisit,
      query(delivery)
        .rule((r) => {
          const entering = enteringSitting.bind({
            entries: r.relation("entries", entryHeading),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, stage } = v(entering, "started");

          return r
            .match(entering, { child, stage })
            .where(r.not(f.TestVisit, { child, stage }))
            .find({ child, k: 0n, stage });
        })
        .rule((r) => {
          const entering = enteringSitting.bind({
            entries: r.relation("entries", entryHeading),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, stage, package: pkg, path, test } = v(entering, "resumed");
          const { k: visited, at } = v(f.TestVisit, "visited");

          return r
            .match(entering, { child, package: pkg, path, stage, test })
            .match(f.TestVisit, { at, child, k: visited, stage })
            .find({ child, k: r.count(), stage });
        }),
    )
    .insert(
      f.TestPresented,
      query(delivery)
        .rule((r) => {
          const entering = enteringSitting.bind({
            entries: r.relation("entries", entryHeading),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, stage, package: pkg, path } = v(entering, "startedMember");

          return r
            .match(entering, { child, package: pkg, path, stage })
            .where(r.not(f.TestVisit, { child, stage }))
            .find({ child, k: 0n, package: pkg, path, stage });
        })
        .rule((r) => {
          const entering = enteringSitting.bind({
            entries: r.relation("entries", entryHeading),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, stage, package: pkg, path, test } = v(entering, "resumedMember");
          const { k: visited, at } = v(f.TestVisit, "resumedVisit");

          return r
            .match(entering, { child, package: pkg, path, stage, test })
            .match(f.TestVisit, { at, child, k: visited, stage })
            .find({ child, k: r.count(), package: pkg, path, stage });
        }),
    )
    .insert(
      f.TestBudget,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const entering = enteringSitting.bind({
          entries: r.relation("entries", entryHeading),
          sittings,
        });
        const leftOf = lastLeft.bind({ sittings });
        const { child, stage, package: pkg, path, test } = v(entering, "resumedBudget");
        const { k: visited, at } = v(f.TestVisit, "budgetVisit");
        const { left } = v(leftOf, "left");

        return r
          .match(entering, { child, package: pkg, path, stage, test })
          .match(f.TestVisit, { at, child, k: visited, stage })
          .match(leftOf, { child, left, stage })
          .find({
            child,
            k: r.count(),
            remaining: left,
            stage,
          });
      }),
    )
    .read("entered", (delta) =>
      query(delivery).rule((r) => {
        const { child, stage, k, at } = v(delta.added(f.TestVisit), "enteredVisit");

        return r
          .match(delta.added(f.TestVisit), { at, child, k, stage })
          .find({ at, child, k, stage });
      }),
    )
    .read("standing", () => standing);

  /**
   * The candidate's move to the member `item` names, in its sitting's open candidate session.
   */
  const presentItem = ChangeSet.empty(delivery)
    .insert(
      f.TestMoment,
      query(delivery).rule((r) => {
        const member = memberTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, stage } = v(member, "moving");

        return r.match(member, { child, stage }).find({ child, stage });
      }),
    )
    .insert(
      f.TestPresented,
      query(delivery).rule((r) => {
        const member = memberTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, stage, k, package: pkg, path } = v(member, "moved");

        return r
          .match(member, { child, k, package: pkg, path, stage })
          .find({ child, k, package: pkg, path, stage });
      }),
    )
    .read("presented", (delta) =>
      query(delivery).rule((r) => {
        const {
          child,
          stage,
          k,
          package: pkg,
          path,
        } = v(delta.added(f.TestPresented), "presentedMember");

        return r
          .match(delta.added(f.TestPresented), { child, k, package: pkg, path, stage })
          .find({ child, k, package: pkg, path, stage });
      }),
    )
    .read("standing", () => standing);

  /**
   * The open candidate session's suspension, AlphaTest's pause, or an application's close of a
   * session it found abandoned: charged up to the session's last sign of presence, and refused
   * where that ran past its deadline and the test allows no late submission ("Suspended in time").
   * A pause the candidate makes sequences `beaconTest` before it, so it is charged to the
   * pause.
   */
  const suspendTest = ChangeSet.empty(delivery)
    .insert(
      f.TestMoment,
      query(delivery).rule((r) => {
        const open = openVisit.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { child, stage } = v(open, "suspending");

        return r.match(open, { child, stage }).find({ child, stage });
      }),
    )
    .insert(
      f.TestSuspension,
      query(delivery).rule((r) => {
        const open = openVisit.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { child, stage, k } = v(open, "suspended");

        return r.match(open, { child, k, stage }).find({ child, k, stage });
      }),
    )
    .read("suspended", (delta) =>
      query(delivery).rule((r) => {
        const { child, stage, k } = v(delta.added(f.TestSuspension), "suspendedVisit");

        return r
          .match(delta.added(f.TestSuspension), { child, k, stage })
          .find({ child, k, stage });
      }),
    )
    .read("standing", () => standing);

  /**
   * What a beacon at `now`, the database's clock as the call reads it, joins into one window, each
   * by its ends, half-open in microseconds: its reading, `[now, now + 1 µs)`, and every window of
   * its sitting within the grace of it on either side (`presenceGraceMicros`). Only an open
   * candidate session's sitting has any.
   */
  const beaconNear = query(delivery)
    .rule((r) => {
      const open = openVisit.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { child, stage } = v(open, "beaconReading");
      const now = Type.base(r.param("now", Reading));

      return r.match(open, { child, stage }).find({
        child,
        end: Type.cast(Num.add(now, 1n), Moment),
        stage,
        start: Type.cast(now, Moment),
      });
    })
    .rule((r) => {
      const open = openVisit.bind({ sittings: r.relation("sittings", sittingHeading) });
      const { child, stage } = v(open, "beaconNearWindow");
      const { during } = v(f.Presence, "nearWindow");
      const now = Type.base(r.param("now", Reading));
      const start = Range.lower(during, Moment);
      const end = Range.upper(during, Moment);

      return r
        .match(open, { child, stage })
        .match(f.Presence, { child, during, stage })
        .where(
          r.gt(Num.add(Type.base(end), presenceGraceMicros), now),
          r.lt(Type.base(start), Num.add(now, 1n + presenceGraceMicros)),
        )
        .find({ child, end, stage, start });
    });

  /**
   * The window a beacon puts, by its sitting: the hull of what it joins ({@link beaconNear}), from
   * the least start to the greatest end.
   */
  const beaconHull = query(delivery).rule((r) => {
    const near = beaconNear.bind({
      now: r.param("now", Reading),
      sittings: r.relation("sittings", sittingHeading),
    });
    const { child, stage, start, end } = v(near, "hullOf");

    return r
      .match(near, { child, end, stage, start })
      .find({ child, end: r.max(end), stage, start: r.min(start) });
  });

  /**
   * The open candidate session's presence beacon at `now`, the database's clock as the call reads
   * it (an application serves it `clocked(…, { now: "micros" })`): the application's sign that its
   * candidate is there, which a session's time is charged up to (`#delivery.ts`'s presence signs,
   * H10) and every application's time credit is read from (`#delivery.ts` PresentTime). One put of
   * the sitting's window (`Presence`), the hull of its reading and every window within the grace of
   * it ({@link beaconHull}), which displaces each window it covers: with its readings in order, it
   * grows the latest window to `now` where that window's last beacon is within the grace, and
   * opens `[now, now + 1 µs)` otherwise, so a sitting holds one row a stretch of presence, never
   * one a beacon; with a reading out of order (a call's clock is read at its BEGIN, before its
   * borrow), it still keeps every reading inside a window and none overlapping. A window is no
   * moment of the sitting's clock, so it ends no presentation's span; a sitting with no open
   * candidate session writes nothing and reads back `unchanged`.
   */
  const beaconTest = ChangeSet.empty(delivery)
    .put(
      f.Presence,
      query(delivery).rule((r) => {
        const hull = beaconHull.bind({
          now: r.param("now", Reading),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, stage, start, end } = v(hull, "beaconWindow");

        return r
          .match(hull, { child, end, stage, start })
          .find({ child, during: r.span(start, end), stage });
      }),
    )
    .read("presence", (delta) =>
      query(delivery).rule((r) => {
        const { child, stage, during } = v(delta.added(f.Presence), "beaconed");

        return r.match(delta.added(f.Presence), { child, during, stage }).find({
          child,
          end: Range.upper(during, Moment),
          stage,
          start: Range.lower(during, Moment),
        });
      }),
    )
    .read("standing", () => standing);

  /**
   * The end of the sitting's part in its open candidate session: the candidate's submission, or the
   * close at the deadline, which may come after it (§2.2.4: an attempt ends "in response to some
   * expected event, such as the end of a test"). Its attempts and their processing are the grader's
   * statement, sequenced after it.
   */
  const endTest = ChangeSet.empty(delivery)
    .insert(
      f.TestMoment,
      query(delivery).rule((r) => {
        const open = openVisit.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { child, stage } = v(open, "ending");

        return r.match(open, { child, stage }).find({ child, stage });
      }),
    )
    .insert(
      f.TestEnd,
      query(delivery).rule((r) => {
        const open = openVisit.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { child, stage, k } = v(open, "ended");

        return r.match(open, { child, k, stage }).find({ child, k, stage });
      }),
    )
    .read("ended", (delta) =>
      query(delivery).rule((r) => {
        const { child, stage, k } = v(delta.added(f.TestEnd), "endedSitting");

        return r.match(delta.added(f.TestEnd), { child, k, stage }).find({ child, k, stage });
      }),
    )
    .read("standing", () => standing);

  const recordedSingles = ChangeSet.empty(delivery)
    .insert(
      f.SnapshotSingleIdentifier,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleIdentifier", {
          value: f.SnapshotSingleIdentifier.fields.value,
          variable: f.SnapshotSingleIdentifier.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleBoolean,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleBoolean", {
          value: f.SnapshotSingleBoolean.fields.value,
          variable: f.SnapshotSingleBoolean.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleInteger,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleInteger", {
          value: f.SnapshotSingleInteger.fields.value,
          variable: f.SnapshotSingleInteger.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleFloat,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleFloat", {
          value: f.SnapshotSingleFloat.fields.value,
          variable: f.SnapshotSingleFloat.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleString,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleString", {
          value: f.SnapshotSingleString.fields.value,
          variable: f.SnapshotSingleString.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSinglePoint,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singlePoint", {
          variable: f.SnapshotSinglePoint.fields.variable,
          x: f.SnapshotSinglePoint.fields.x,
          y: f.SnapshotSinglePoint.fields.y,
        });
        const { variable, x, y } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { variable, x, y })
          .find({ child, n, package: pkg, path, variable, x, y });
      }),
    )
    .insert(
      f.SnapshotSinglePair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singlePair", {
          greatest: f.SnapshotSinglePair.fields.greatest,
          least: f.SnapshotSinglePair.fields.least,
          variable: f.SnapshotSinglePair.fields.variable,
        });
        const { variable, least, greatest } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { greatest, least, variable })
          .find({ child, greatest, least, n, package: pkg, path, variable });
      }),
    )
    .insert(
      f.SnapshotSingleDirectedPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleDirectedPair", {
          source: f.SnapshotSingleDirectedPair.fields.source,
          target: f.SnapshotSingleDirectedPair.fields.target,
          variable: f.SnapshotSingleDirectedPair.fields.variable,
        });
        const { variable, source, target } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { source, target, variable })
          .find({ child, n, package: pkg, path, source, target, variable });
      }),
    )
    .insert(
      f.SnapshotSingleDuration,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleDuration", {
          value: f.SnapshotSingleDuration.fields.value,
          variable: f.SnapshotSingleDuration.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleUri,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleUri", {
          value: f.SnapshotSingleUri.fields.value,
          variable: f.SnapshotSingleUri.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleFile,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleFile", {
          digest: f.SnapshotSingleFile.fields.digest,
          name: f.SnapshotSingleFile.fields.name,
          type: f.SnapshotSingleFile.fields.type,
          variable: f.SnapshotSingleFile.fields.variable,
        });
        const { variable, digest, name, type } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { digest, name, type, variable })
          .find({ child, digest, n, name, package: pkg, path, type, variable });
      }),
    );

  /**
   * An attempt's multiples, one sidecar each.
   */
  const recordedMultiples = ChangeSet.empty(delivery)
    .insert(
      f.SnapshotMultipleIdentifier,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleIdentifier", {
          count: f.SnapshotMultipleIdentifier.fields.count,
          value: f.SnapshotMultipleIdentifier.fields.value,
          variable: f.SnapshotMultipleIdentifier.fields.variable,
        });
        const { variable, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, value, variable })
          .find({
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotMultipleBoolean,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleBoolean", {
          count: f.SnapshotMultipleBoolean.fields.count,
          value: f.SnapshotMultipleBoolean.fields.value,
          variable: f.SnapshotMultipleBoolean.fields.variable,
        });
        const { variable, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, value, variable })
          .find({ child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotMultipleInteger,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleInteger", {
          count: f.SnapshotMultipleInteger.fields.count,
          value: f.SnapshotMultipleInteger.fields.value,
          variable: f.SnapshotMultipleInteger.fields.variable,
        });
        const { variable, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, value, variable })
          .find({ child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotMultipleFloat,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleFloat", {
          bits: f.SnapshotMultipleFloat.fields.bits,
          count: f.SnapshotMultipleFloat.fields.count,
          value: f.SnapshotMultipleFloat.fields.value,
          variable: f.SnapshotMultipleFloat.fields.variable,
        });
        const { variable, bits, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { bits, count, value, variable })
          .find({ bits, child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotMultipleString,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleString", {
          count: f.SnapshotMultipleString.fields.count,
          value: f.SnapshotMultipleString.fields.value,
          variable: f.SnapshotMultipleString.fields.variable,
        });
        const { variable, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, value, variable })
          .find({
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotMultiplePoint,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multiplePoint", {
          count: f.SnapshotMultiplePoint.fields.count,
          variable: f.SnapshotMultiplePoint.fields.variable,
          x: f.SnapshotMultiplePoint.fields.x,
          y: f.SnapshotMultiplePoint.fields.y,
        });
        const { variable, x, y, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, variable, x, y })
          .find({ child, count, n, package: pkg, path, variable, x, y });
      }),
    )
    .insert(
      f.SnapshotMultiplePair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multiplePair", {
          count: f.SnapshotMultiplePair.fields.count,
          greatest: f.SnapshotMultiplePair.fields.greatest,
          least: f.SnapshotMultiplePair.fields.least,
          variable: f.SnapshotMultiplePair.fields.variable,
        });
        const { variable, least, greatest, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, greatest, least, variable })
          .find({
            child,
            count,
            greatest,
            least,
            n,
            package: pkg,
            path,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotMultipleDirectedPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleDirectedPair", {
          count: f.SnapshotMultipleDirectedPair.fields.count,
          source: f.SnapshotMultipleDirectedPair.fields.source,
          target: f.SnapshotMultipleDirectedPair.fields.target,
          variable: f.SnapshotMultipleDirectedPair.fields.variable,
        });
        const { variable, source, target, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, source, target, variable })
          .find({
            child,
            count,
            n,
            package: pkg,
            path,
            source,
            target,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotMultipleDuration,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleDuration", {
          bits: f.SnapshotMultipleDuration.fields.bits,
          count: f.SnapshotMultipleDuration.fields.count,
          value: f.SnapshotMultipleDuration.fields.value,
          variable: f.SnapshotMultipleDuration.fields.variable,
        });
        const { variable, bits, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { bits, count, value, variable })
          .find({ bits, child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotMultipleUri,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleUri", {
          count: f.SnapshotMultipleUri.fields.count,
          value: f.SnapshotMultipleUri.fields.value,
          variable: f.SnapshotMultipleUri.fields.variable,
        });
        const { variable, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, value, variable })
          .find({
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotMultipleFile,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleFile", {
          count: f.SnapshotMultipleFile.fields.count,
          digest: f.SnapshotMultipleFile.fields.digest,
          name: f.SnapshotMultipleFile.fields.name,
          type: f.SnapshotMultipleFile.fields.type,
          variable: f.SnapshotMultipleFile.fields.variable,
        });
        const { variable, digest, name, type, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, digest, name, type, variable })
          .find({
            child,
            count,
            digest,
            n,
            name,
            package: pkg,
            path,
            type,
            variable,
          });
      }),
    );

  /**
   * An attempt's ordered values, one sidecar each.
   */
  const recordedOrdereds = ChangeSet.empty(delivery)
    .insert(
      f.SnapshotOrderedIdentifier,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedIdentifier", {
          place: f.SnapshotOrderedIdentifier.fields.place,
          value: f.SnapshotOrderedIdentifier.fields.value,
          variable: f.SnapshotOrderedIdentifier.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedBoolean,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedBoolean", {
          place: f.SnapshotOrderedBoolean.fields.place,
          value: f.SnapshotOrderedBoolean.fields.value,
          variable: f.SnapshotOrderedBoolean.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedInteger,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedInteger", {
          place: f.SnapshotOrderedInteger.fields.place,
          value: f.SnapshotOrderedInteger.fields.value,
          variable: f.SnapshotOrderedInteger.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedFloat,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedFloat", {
          place: f.SnapshotOrderedFloat.fields.place,
          value: f.SnapshotOrderedFloat.fields.value,
          variable: f.SnapshotOrderedFloat.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedString,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedString", {
          place: f.SnapshotOrderedString.fields.place,
          value: f.SnapshotOrderedString.fields.value,
          variable: f.SnapshotOrderedString.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedPoint,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedPoint", {
          place: f.SnapshotOrderedPoint.fields.place,
          variable: f.SnapshotOrderedPoint.fields.variable,
          x: f.SnapshotOrderedPoint.fields.x,
          y: f.SnapshotOrderedPoint.fields.y,
        });
        const { variable, place, x, y } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, variable, x, y })
          .find({ child, n, package: pkg, path, place, variable, x, y });
      }),
    )
    .insert(
      f.SnapshotOrderedPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedPair", {
          greatest: f.SnapshotOrderedPair.fields.greatest,
          least: f.SnapshotOrderedPair.fields.least,
          place: f.SnapshotOrderedPair.fields.place,
          variable: f.SnapshotOrderedPair.fields.variable,
        });
        const { variable, place, least, greatest } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { greatest, least, place, variable })
          .find({ child, greatest, least, n, package: pkg, path, place, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedDirectedPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedDirectedPair", {
          place: f.SnapshotOrderedDirectedPair.fields.place,
          source: f.SnapshotOrderedDirectedPair.fields.source,
          target: f.SnapshotOrderedDirectedPair.fields.target,
          variable: f.SnapshotOrderedDirectedPair.fields.variable,
        });
        const { variable, place, source, target } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, source, target, variable })
          .find({ child, n, package: pkg, path, place, source, target, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedDuration,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedDuration", {
          place: f.SnapshotOrderedDuration.fields.place,
          value: f.SnapshotOrderedDuration.fields.value,
          variable: f.SnapshotOrderedDuration.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedUri,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedUri", {
          place: f.SnapshotOrderedUri.fields.place,
          value: f.SnapshotOrderedUri.fields.value,
          variable: f.SnapshotOrderedUri.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedFile,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedFile", {
          digest: f.SnapshotOrderedFile.fields.digest,
          name: f.SnapshotOrderedFile.fields.name,
          place: f.SnapshotOrderedFile.fields.place,
          type: f.SnapshotOrderedFile.fields.type,
          variable: f.SnapshotOrderedFile.fields.variable,
        });
        const { variable, place, digest, name, type } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { digest, name, place, type, variable })
          .find({ child, digest, n, name, package: pkg, path, place, type, variable });
      }),
    );

  /**
   * An attempt's record fields, each with its header, one sidecar each.
   */
  const recordedRecords = ChangeSet.empty(delivery)
    .insert(
      f.SnapshotRecordIdentifier,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordIdentifier", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordIdentifier.fields.value,
          variable: f.SnapshotRecordIdentifier.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordBoolean,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordBoolean", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordBoolean.fields.value,
          variable: f.SnapshotRecordBoolean.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordInteger,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordInteger", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordInteger.fields.value,
          variable: f.SnapshotRecordInteger.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordFloat,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordFloat", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordFloat.fields.value,
          variable: f.SnapshotRecordFloat.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordString,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordString", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordString.fields.value,
          variable: f.SnapshotRecordString.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordPoint,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordPoint", {
          field: f.SnapshotRecord.fields.field,
          variable: f.SnapshotRecordPoint.fields.variable,
          x: f.SnapshotRecordPoint.fields.x,
          y: f.SnapshotRecordPoint.fields.y,
        });
        const { variable, field, x, y } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, variable, x, y })
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            variable,
            x,
            y,
          });
      }),
    )
    .insert(
      f.SnapshotRecordPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordPair", {
          field: f.SnapshotRecord.fields.field,
          greatest: f.SnapshotRecordPair.fields.greatest,
          least: f.SnapshotRecordPair.fields.least,
          variable: f.SnapshotRecordPair.fields.variable,
        });
        const { variable, field, least, greatest } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, greatest, least, variable })
          .find({
            child,
            field,
            greatest,
            least,
            n,
            package: pkg,
            path,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordDirectedPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordDirectedPair", {
          field: f.SnapshotRecord.fields.field,
          source: f.SnapshotRecordDirectedPair.fields.source,
          target: f.SnapshotRecordDirectedPair.fields.target,
          variable: f.SnapshotRecordDirectedPair.fields.variable,
        });
        const { variable, field, source, target } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, source, target, variable })
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            source,
            target,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordDuration,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordDuration", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordDuration.fields.value,
          variable: f.SnapshotRecordDuration.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordUri,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordUri", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordUri.fields.value,
          variable: f.SnapshotRecordUri.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordFile,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordFile", {
          digest: f.SnapshotRecordFile.fields.digest,
          field: f.SnapshotRecord.fields.field,
          name: f.SnapshotRecordFile.fields.name,
          type: f.SnapshotRecordFile.fields.type,
          variable: f.SnapshotRecordFile.fields.variable,
        });
        const { variable, field, digest, name, type } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { digest, field, name, type, variable })
          .find({
            child,
            digest,
            field,
            n,
            name,
            package: pkg,
            path,
            type,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecord,
      query(delivery)
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordIdentifier", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordIdentifier.fields.value,
            variable: f.SnapshotRecordIdentifier.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .find({
              baseType: f.BaseType.handle("identifier"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordBoolean", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordBoolean.fields.value,
            variable: f.SnapshotRecordBoolean.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .find({
              baseType: f.BaseType.handle("boolean"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordInteger", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordInteger.fields.value,
            variable: f.SnapshotRecordInteger.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .find({
              baseType: f.BaseType.handle("integer"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordFloat", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordFloat.fields.value,
            variable: f.SnapshotRecordFloat.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .find({
              baseType: f.BaseType.handle("float"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordString", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordString.fields.value,
            variable: f.SnapshotRecordString.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .find({
              baseType: f.BaseType.handle("string"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordPoint", {
            field: f.SnapshotRecord.fields.field,
            variable: f.SnapshotRecordPoint.fields.variable,
            x: f.SnapshotRecordPoint.fields.x,
            y: f.SnapshotRecordPoint.fields.y,
          });
          const { variable, field, x, y } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, variable, x, y })
            .find({
              baseType: f.BaseType.handle("point"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordPair", {
            field: f.SnapshotRecord.fields.field,
            greatest: f.SnapshotRecordPair.fields.greatest,
            least: f.SnapshotRecordPair.fields.least,
            variable: f.SnapshotRecordPair.fields.variable,
          });
          const { variable, field, least, greatest } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, greatest, least, variable })
            .find({
              baseType: f.BaseType.handle("pair"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordDirectedPair", {
            field: f.SnapshotRecord.fields.field,
            source: f.SnapshotRecordDirectedPair.fields.source,
            target: f.SnapshotRecordDirectedPair.fields.target,
            variable: f.SnapshotRecordDirectedPair.fields.variable,
          });
          const { variable, field, source, target } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, source, target, variable })
            .find({
              baseType: f.BaseType.handle("directedPair"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordDuration", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordDuration.fields.value,
            variable: f.SnapshotRecordDuration.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .find({
              baseType: f.BaseType.handle("duration"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordUri", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordUri.fields.value,
            variable: f.SnapshotRecordUri.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .find({
              baseType: f.BaseType.handle("uri"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordFile", {
            digest: f.SnapshotRecordFile.fields.digest,
            field: f.SnapshotRecord.fields.field,
            name: f.SnapshotRecordFile.fields.name,
            type: f.SnapshotRecordFile.fields.type,
            variable: f.SnapshotRecordFile.fields.variable,
          });
          const { variable, field, digest, name, type } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { digest, field, name, type, variable })
            .find({
              baseType: f.BaseType.handle("file"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        }),
    );

  /**
   * A response snapshot's values: each sidecar's rows from the parameter list of its name, of the
   * response's item session (`responseTarget`), at its stamped instant, and each record field's
   * header beside its arm: a save's; an answer's are the same rows under its admission
   * (`answeredValues`).
   */
  const snapshotValues = ChangeSet.union(
    ChangeSet.union(recordedSingles, recordedMultiples),
    ChangeSet.union(recordedOrdereds, recordedRecords),
  );

  const answeredSingles = ChangeSet.empty(delivery)
    .insert(
      f.SnapshotSingleIdentifier,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleIdentifier", {
          value: f.SnapshotSingleIdentifier.fields.value,
          variable: f.SnapshotSingleIdentifier.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleBoolean,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleBoolean", {
          value: f.SnapshotSingleBoolean.fields.value,
          variable: f.SnapshotSingleBoolean.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleInteger,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleInteger", {
          value: f.SnapshotSingleInteger.fields.value,
          variable: f.SnapshotSingleInteger.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleFloat,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleFloat", {
          value: f.SnapshotSingleFloat.fields.value,
          variable: f.SnapshotSingleFloat.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleString,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleString", {
          value: f.SnapshotSingleString.fields.value,
          variable: f.SnapshotSingleString.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSinglePoint,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singlePoint", {
          variable: f.SnapshotSinglePoint.fields.variable,
          x: f.SnapshotSinglePoint.fields.x,
          y: f.SnapshotSinglePoint.fields.y,
        });
        const { variable, x, y } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { variable, x, y })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, variable, x, y });
      }),
    )
    .insert(
      f.SnapshotSinglePair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singlePair", {
          greatest: f.SnapshotSinglePair.fields.greatest,
          least: f.SnapshotSinglePair.fields.least,
          variable: f.SnapshotSinglePair.fields.variable,
        });
        const { variable, least, greatest } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { greatest, least, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, greatest, least, n, package: pkg, path, variable });
      }),
    )
    .insert(
      f.SnapshotSingleDirectedPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleDirectedPair", {
          source: f.SnapshotSingleDirectedPair.fields.source,
          target: f.SnapshotSingleDirectedPair.fields.target,
          variable: f.SnapshotSingleDirectedPair.fields.variable,
        });
        const { variable, source, target } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { source, target, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, source, target, variable });
      }),
    )
    .insert(
      f.SnapshotSingleDuration,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleDuration", {
          value: f.SnapshotSingleDuration.fields.value,
          variable: f.SnapshotSingleDuration.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleUri,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleUri", {
          value: f.SnapshotSingleUri.fields.value,
          variable: f.SnapshotSingleUri.fields.variable,
        });
        const { variable, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotSingleFile,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("singleFile", {
          digest: f.SnapshotSingleFile.fields.digest,
          name: f.SnapshotSingleFile.fields.name,
          type: f.SnapshotSingleFile.fields.type,
          variable: f.SnapshotSingleFile.fields.variable,
        });
        const { variable, digest, name, type } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { digest, name, type, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, digest, n, name, package: pkg, path, type, variable });
      }),
    );

  /**
   * An attempt's multiples, one sidecar each.
   */
  const answeredMultiples = ChangeSet.empty(delivery)
    .insert(
      f.SnapshotMultipleIdentifier,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleIdentifier", {
          count: f.SnapshotMultipleIdentifier.fields.count,
          value: f.SnapshotMultipleIdentifier.fields.value,
          variable: f.SnapshotMultipleIdentifier.fields.variable,
        });
        const { variable, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotMultipleBoolean,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleBoolean", {
          count: f.SnapshotMultipleBoolean.fields.count,
          value: f.SnapshotMultipleBoolean.fields.value,
          variable: f.SnapshotMultipleBoolean.fields.variable,
        });
        const { variable, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotMultipleInteger,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleInteger", {
          count: f.SnapshotMultipleInteger.fields.count,
          value: f.SnapshotMultipleInteger.fields.value,
          variable: f.SnapshotMultipleInteger.fields.variable,
        });
        const { variable, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotMultipleFloat,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleFloat", {
          bits: f.SnapshotMultipleFloat.fields.bits,
          count: f.SnapshotMultipleFloat.fields.count,
          value: f.SnapshotMultipleFloat.fields.value,
          variable: f.SnapshotMultipleFloat.fields.variable,
        });
        const { variable, bits, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { bits, count, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ bits, child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotMultipleString,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleString", {
          count: f.SnapshotMultipleString.fields.count,
          value: f.SnapshotMultipleString.fields.value,
          variable: f.SnapshotMultipleString.fields.variable,
        });
        const { variable, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotMultiplePoint,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multiplePoint", {
          count: f.SnapshotMultiplePoint.fields.count,
          variable: f.SnapshotMultiplePoint.fields.variable,
          x: f.SnapshotMultiplePoint.fields.x,
          y: f.SnapshotMultiplePoint.fields.y,
        });
        const { variable, x, y, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, variable, x, y })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, count, n, package: pkg, path, variable, x, y });
      }),
    )
    .insert(
      f.SnapshotMultiplePair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multiplePair", {
          count: f.SnapshotMultiplePair.fields.count,
          greatest: f.SnapshotMultiplePair.fields.greatest,
          least: f.SnapshotMultiplePair.fields.least,
          variable: f.SnapshotMultiplePair.fields.variable,
        });
        const { variable, least, greatest, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, greatest, least, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            count,
            greatest,
            least,
            n,
            package: pkg,
            path,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotMultipleDirectedPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleDirectedPair", {
          count: f.SnapshotMultipleDirectedPair.fields.count,
          source: f.SnapshotMultipleDirectedPair.fields.source,
          target: f.SnapshotMultipleDirectedPair.fields.target,
          variable: f.SnapshotMultipleDirectedPair.fields.variable,
        });
        const { variable, source, target, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, source, target, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            count,
            n,
            package: pkg,
            path,
            source,
            target,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotMultipleDuration,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleDuration", {
          bits: f.SnapshotMultipleDuration.fields.bits,
          count: f.SnapshotMultipleDuration.fields.count,
          value: f.SnapshotMultipleDuration.fields.value,
          variable: f.SnapshotMultipleDuration.fields.variable,
        });
        const { variable, bits, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { bits, count, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ bits, child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      f.SnapshotMultipleUri,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleUri", {
          count: f.SnapshotMultipleUri.fields.count,
          value: f.SnapshotMultipleUri.fields.value,
          variable: f.SnapshotMultipleUri.fields.variable,
        });
        const { variable, value, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotMultipleFile,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("multipleFile", {
          count: f.SnapshotMultipleFile.fields.count,
          digest: f.SnapshotMultipleFile.fields.digest,
          name: f.SnapshotMultipleFile.fields.name,
          type: f.SnapshotMultipleFile.fields.type,
          variable: f.SnapshotMultipleFile.fields.variable,
        });
        const { variable, digest, name, type, count } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { count, digest, name, type, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            count,
            digest,
            n,
            name,
            package: pkg,
            path,
            type,
            variable,
          });
      }),
    );

  /**
   * An attempt's ordered values, one sidecar each.
   */
  const answeredOrdereds = ChangeSet.empty(delivery)
    .insert(
      f.SnapshotOrderedIdentifier,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedIdentifier", {
          place: f.SnapshotOrderedIdentifier.fields.place,
          value: f.SnapshotOrderedIdentifier.fields.value,
          variable: f.SnapshotOrderedIdentifier.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedBoolean,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedBoolean", {
          place: f.SnapshotOrderedBoolean.fields.place,
          value: f.SnapshotOrderedBoolean.fields.value,
          variable: f.SnapshotOrderedBoolean.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedInteger,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedInteger", {
          place: f.SnapshotOrderedInteger.fields.place,
          value: f.SnapshotOrderedInteger.fields.value,
          variable: f.SnapshotOrderedInteger.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedFloat,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedFloat", {
          place: f.SnapshotOrderedFloat.fields.place,
          value: f.SnapshotOrderedFloat.fields.value,
          variable: f.SnapshotOrderedFloat.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedString,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedString", {
          place: f.SnapshotOrderedString.fields.place,
          value: f.SnapshotOrderedString.fields.value,
          variable: f.SnapshotOrderedString.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedPoint,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedPoint", {
          place: f.SnapshotOrderedPoint.fields.place,
          variable: f.SnapshotOrderedPoint.fields.variable,
          x: f.SnapshotOrderedPoint.fields.x,
          y: f.SnapshotOrderedPoint.fields.y,
        });
        const { variable, place, x, y } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, variable, x, y })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, place, variable, x, y });
      }),
    )
    .insert(
      f.SnapshotOrderedPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedPair", {
          greatest: f.SnapshotOrderedPair.fields.greatest,
          least: f.SnapshotOrderedPair.fields.least,
          place: f.SnapshotOrderedPair.fields.place,
          variable: f.SnapshotOrderedPair.fields.variable,
        });
        const { variable, place, least, greatest } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { greatest, least, place, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, greatest, least, n, package: pkg, path, place, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedDirectedPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedDirectedPair", {
          place: f.SnapshotOrderedDirectedPair.fields.place,
          source: f.SnapshotOrderedDirectedPair.fields.source,
          target: f.SnapshotOrderedDirectedPair.fields.target,
          variable: f.SnapshotOrderedDirectedPair.fields.variable,
        });
        const { variable, place, source, target } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, source, target, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, place, source, target, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedDuration,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedDuration", {
          place: f.SnapshotOrderedDuration.fields.place,
          value: f.SnapshotOrderedDuration.fields.value,
          variable: f.SnapshotOrderedDuration.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedUri,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedUri", {
          place: f.SnapshotOrderedUri.fields.place,
          value: f.SnapshotOrderedUri.fields.value,
          variable: f.SnapshotOrderedUri.fields.variable,
        });
        const { variable, place, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { place, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      f.SnapshotOrderedFile,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("orderedFile", {
          digest: f.SnapshotOrderedFile.fields.digest,
          name: f.SnapshotOrderedFile.fields.name,
          place: f.SnapshotOrderedFile.fields.place,
          type: f.SnapshotOrderedFile.fields.type,
          variable: f.SnapshotOrderedFile.fields.variable,
        });
        const { variable, place, digest, name, type } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { digest, name, place, type, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({ child, digest, n, name, package: pkg, path, place, type, variable });
      }),
    );

  /**
   * An attempt's record fields, each with its header, one sidecar each.
   */
  const answeredRecords = ChangeSet.empty(delivery)
    .insert(
      f.SnapshotRecordIdentifier,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordIdentifier", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordIdentifier.fields.value,
          variable: f.SnapshotRecordIdentifier.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordBoolean,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordBoolean", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordBoolean.fields.value,
          variable: f.SnapshotRecordBoolean.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordInteger,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordInteger", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordInteger.fields.value,
          variable: f.SnapshotRecordInteger.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordFloat,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordFloat", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordFloat.fields.value,
          variable: f.SnapshotRecordFloat.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordString,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordString", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordString.fields.value,
          variable: f.SnapshotRecordString.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordPoint,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordPoint", {
          field: f.SnapshotRecord.fields.field,
          variable: f.SnapshotRecordPoint.fields.variable,
          x: f.SnapshotRecordPoint.fields.x,
          y: f.SnapshotRecordPoint.fields.y,
        });
        const { variable, field, x, y } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, variable, x, y })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            variable,
            x,
            y,
          });
      }),
    )
    .insert(
      f.SnapshotRecordPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordPair", {
          field: f.SnapshotRecord.fields.field,
          greatest: f.SnapshotRecordPair.fields.greatest,
          least: f.SnapshotRecordPair.fields.least,
          variable: f.SnapshotRecordPair.fields.variable,
        });
        const { variable, field, least, greatest } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, greatest, least, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            field,
            greatest,
            least,
            n,
            package: pkg,
            path,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordDirectedPair,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordDirectedPair", {
          field: f.SnapshotRecord.fields.field,
          source: f.SnapshotRecordDirectedPair.fields.source,
          target: f.SnapshotRecordDirectedPair.fields.target,
          variable: f.SnapshotRecordDirectedPair.fields.variable,
        });
        const { variable, field, source, target } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, source, target, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            source,
            target,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordDuration,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordDuration", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordDuration.fields.value,
          variable: f.SnapshotRecordDuration.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordUri,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordUri", {
          field: f.SnapshotRecord.fields.field,
          value: f.SnapshotRecordUri.fields.value,
          variable: f.SnapshotRecordUri.fields.variable,
        });
        const { variable, field, value } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { field, value, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecordFile,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "valued");
        const given = r.relation("recordFile", {
          digest: f.SnapshotRecordFile.fields.digest,
          field: f.SnapshotRecord.fields.field,
          name: f.SnapshotRecordFile.fields.name,
          type: f.SnapshotRecordFile.fields.type,
          variable: f.SnapshotRecordFile.fields.variable,
        });
        const { variable, field, digest, name, type } = v(given, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .match(given, { digest, field, name, type, variable })
          .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
          .find({
            child,
            digest,
            field,
            n,
            name,
            package: pkg,
            path,
            type,
            variable,
          });
      }),
    )
    .insert(
      f.SnapshotRecord,
      query(delivery)
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordIdentifier", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordIdentifier.fields.value,
            variable: f.SnapshotRecordIdentifier.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
            .find({
              baseType: f.BaseType.handle("identifier"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordBoolean", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordBoolean.fields.value,
            variable: f.SnapshotRecordBoolean.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
            .find({
              baseType: f.BaseType.handle("boolean"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordInteger", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordInteger.fields.value,
            variable: f.SnapshotRecordInteger.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
            .find({
              baseType: f.BaseType.handle("integer"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordFloat", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordFloat.fields.value,
            variable: f.SnapshotRecordFloat.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
            .find({
              baseType: f.BaseType.handle("float"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordString", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordString.fields.value,
            variable: f.SnapshotRecordString.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
            .find({
              baseType: f.BaseType.handle("string"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordPoint", {
            field: f.SnapshotRecord.fields.field,
            variable: f.SnapshotRecordPoint.fields.variable,
            x: f.SnapshotRecordPoint.fields.x,
            y: f.SnapshotRecordPoint.fields.y,
          });
          const { variable, field, x, y } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, variable, x, y })
            .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
            .find({
              baseType: f.BaseType.handle("point"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordPair", {
            field: f.SnapshotRecord.fields.field,
            greatest: f.SnapshotRecordPair.fields.greatest,
            least: f.SnapshotRecordPair.fields.least,
            variable: f.SnapshotRecordPair.fields.variable,
          });
          const { variable, field, least, greatest } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, greatest, least, variable })
            .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
            .find({
              baseType: f.BaseType.handle("pair"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordDirectedPair", {
            field: f.SnapshotRecord.fields.field,
            source: f.SnapshotRecordDirectedPair.fields.source,
            target: f.SnapshotRecordDirectedPair.fields.target,
            variable: f.SnapshotRecordDirectedPair.fields.variable,
          });
          const { variable, field, source, target } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, source, target, variable })
            .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
            .find({
              baseType: f.BaseType.handle("directedPair"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordDuration", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordDuration.fields.value,
            variable: f.SnapshotRecordDuration.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
            .find({
              baseType: f.BaseType.handle("duration"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordUri", {
            field: f.SnapshotRecord.fields.field,
            value: f.SnapshotRecordUri.fields.value,
            variable: f.SnapshotRecordUri.fields.variable,
          });
          const { variable, field, value } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { field, value, variable })
            .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
            .find({
              baseType: f.BaseType.handle("uri"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        })
        .rule((r) => {
          const response = responseTarget.bind({
            item: r.param("item", ItemRef),
            sittings: r.relation("sittings", sittingHeading),
          });
          const { child, package: pkg, path, n } = v(response, "valued");
          const given = r.relation("recordFile", {
            digest: f.SnapshotRecordFile.fields.digest,
            field: f.SnapshotRecord.fields.field,
            name: f.SnapshotRecordFile.fields.name,
            type: f.SnapshotRecordFile.fields.type,
            variable: f.SnapshotRecordFile.fields.variable,
          });
          const { variable, field, digest, name, type } = v(given, "given");

          return r
            .match(response, { child, n, package: pkg, path })
            .match(given, { digest, field, name, type, variable })
            .where(r.not(admission.reasonsIn(r), {}), r.not(admission.hiddenIn(r), { variable }))
            .find({
              baseType: f.BaseType.handle("file"),
              child,
              field,
              n,
              package: pkg,
              path,
              variable,
            });
        }),
    );

  /**
   * An answer's values: the snapshot write's, each row only where admission gives no reason, and
   * none of a response the values in force hide.
   */
  const answeredValues = ChangeSet.union(
    ChangeSet.union(answeredSingles, answeredMultiples),
    ChangeSet.union(answeredOrdereds, answeredRecords),
  );

  /**
   * A save's response rows, every one reading the response's item session (`responseTarget`): its
   * snapshot, of kind `save`, and the browser's reading `given` beside it.
   */
  const saveSnapshot = ChangeSet.empty(delivery)
    .insert(
      f.ResponseSnapshot,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "snapshot");

        return r
          .match(response, { child, n, package: pkg, path })
          .find({ child, kind: SnapshotKind.handle("save"), n, package: pkg, path });
      }),
    )
    .insert(
      f.SnapshotGiven,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .find({ child, given: r.param("given", BrowserReading), n, package: pkg, path });
      }),
    )
    .read("snapshot", (delta) =>
      query(delivery).rule((r) => {
        const { child, package: pkg, path, n, at } = v(delta.added(f.ResponseSnapshot), "written");

        return r
          .match(delta.added(f.ResponseSnapshot), { at, child, n, package: pkg, path })
          .find({ at, child, n, package: pkg, path });
      }),
    )
    .read("standing", () => standing);

  /**
   * An answer's response rows: the snapshot of kind `attempt` and the browser's reading `given`
   * beside it, each only where admission gives no reason.
   */
  const answerSnapshot = ChangeSet.empty(delivery)
    .insert(
      f.ResponseSnapshot,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "snapshot");

        return r
          .match(response, { child, n, package: pkg, path })
          .where(r.not(admission.reasonsIn(r), {}))
          .find({ child, kind: SnapshotKind.handle("attempt"), n, package: pkg, path });
      }),
    )
    .insert(
      f.SnapshotGiven,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "given");

        return r
          .match(response, { child, n, package: pkg, path })
          .where(r.not(admission.reasonsIn(r), {}))
          .find({ child, given: r.param("given", BrowserReading), n, package: pkg, path });
      }),
    )
    .read("snapshot", (delta) =>
      query(delivery).rule((r) => {
        const { child, package: pkg, path, n, at } = v(delta.added(f.ResponseSnapshot), "written");

        return r
          .match(delta.added(f.ResponseSnapshot), { at, child, n, package: pkg, path })
          .find({ at, child, n, package: pkg, path });
      }),
    )
    .read("standing", () => standing);

  /**
   * A response given and not submitted: a `save` snapshot with its values, which the delivery
   * level's laws hold inside a candidate session, in time, and to a member the candidate was shown
   * ("Shown before saved", `#ledger/test-laws.ts`), so a save of a member never presented is
   * refused, naming it, never stored for the end to drop. QTI's suspended values: "An item
   * session that enters the suspended state may have values for the response variables that have
   * yet to be submitted for response processing" (§2.2.4). The latest save of an item session is
   * its responses now: what a reopened item restores and what the end of a simultaneous part
   * submits. A save with no value is an answer the candidate cleared.
   */
  const saveTestItem = ChangeSet.union(
    saveSnapshot.insert(
      f.Save,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "saved");

        return r
          .match(response, { child, n, package: pkg, path })
          .find({ child, n, package: pkg, path });
      }),
    ),
    snapshotValues,
  );

  /**
   * The attempt an answer and a skip in an individual part record, which the delivery level's laws
   * hold inside a candidate session and in time; and, where the candidate moves on, the member
   * `next` names presented, at most one row. Every row only where the member's response admission
   * gives no reason (QTI 3.0.1 §7.19.7: tier (a) whatever validate-responses says, and tier (b)
   * where its item ref's own control sets it true, a `ValidatedMember`: "the candidates are not
   * allowed to submit the item until they have provided valid responses for all interactions",
   * Table 7.19.7), so a refused answer or skip writes nothing. Navigation, a suspension and the end
   * are no candidate's submission, and no admission holds them back (§2.2.4).
   */
  const attemptAndMove = answerSnapshot
    .insert(
      f.Attempt,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child, package: pkg, path, n } = v(response, "attempted");

        return r
          .match(response, { child, n, package: pkg, path })
          .where(r.not(admission.reasonsIn(r), {}))
          .find({ child, n, package: pkg, path });
      }),
    )
    .insert(
      f.TestMoment,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child } = v(response, "movingOn");
        const next = r.relation("next", { item: ItemRef });
        const { item: nextItem } = v(next, "nextItem");
        const member = memberTarget.bind({
          item: nextItem,
          sittings: r.relation("sittings", sittingHeading),
        });
        const { stage } = v(member, "nextMember");

        return r
          .match(response, { child })
          .match(next, { item: nextItem })
          .match(member, { child, stage })
          .where(r.not(admission.reasonsIn(r), {}))
          .find({ child, stage });
      }),
    )
    .insert(
      f.TestPresented,
      query(delivery).rule((r) => {
        const response = responseTarget.bind({
          item: r.param("item", ItemRef),
          sittings: r.relation("sittings", sittingHeading),
        });
        const { child } = v(response, "movedOn");
        const next = r.relation("next", { item: ItemRef });
        const { item: nextItem } = v(next, "nextPresented");
        const member = memberTarget.bind({
          item: nextItem,
          sittings: r.relation("sittings", sittingHeading),
        });
        const { stage, k, package: pkg, path } = v(member, "presentedNext");

        return r
          .match(response, { child })
          .match(next, { item: nextItem })
          .match(member, { child, k, package: pkg, path, stage })
          .where(r.not(admission.reasonsIn(r), {}))
          .find({ child, k, package: pkg, path, stage });
      }),
    );

  /**
   * An answer in an individual part: the attempt and the move, with the posted values (a response
   * the values in force hide is written with no value). Its response processing, and the completion
   * status after it (§2.2.2.3), are the grader's statement, sequenced after it (`gradeAttemptOf`).
   */
  const answerTestItem = ChangeSet.union(attemptAndMove, answeredValues);

  /**
   * A skip in an individual part: the answer's attempt and move with no value, every response
   * submitted at its default (Table 7.19.6: "all response variables are submitted with their
   * default value or are NULL"), which `DefaultSubmission` records; its response processing, which
   * starts the responses at their defaults, is the grader's statement, sequenced after it. Its
   * admission judges no posted value, so it refuses only what validate-responses needs, which only
   * a validated member's item ref sets (`ValidatedMember`).
   */
  const skipTestItem = attemptAndMove.insert(
    f.DefaultSubmission,
    query(delivery).rule((r) => {
      const response = responseTarget.bind({
        item: r.param("item", ItemRef),
        sittings: r.relation("sittings", sittingHeading),
      });
      const { child, package: pkg, path, n } = v(response, "defaulted");

      return r
        .match(response, { child, n, package: pkg, path })
        .where(r.not(admission.reasonsIn(r), {}))
        .find({ child, n, package: pkg, path });
    }),
  );

  return {
    answerTestItem,
    beaconTest,
    endTest,
    enterTest,
    memberTarget,
    namedEntries,
    openVisit,
    presentItem,
    responseTarget,
    resumedEntries,
    saveTestItem,
    skipTestItem,
    suspendTest,
    take,
  };
};
