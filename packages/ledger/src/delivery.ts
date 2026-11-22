/**
 * The delivery level, `delivery` in PostgreSQL, the top of qti-pie's QTI levels: every derived
 * relation and every rule over a query that reads the ledger's stored relations (`#ledger.ts`),
 * which a level states only over the levels below it (grizzle's README, "Derived tables" and
 * "Levels"). The test runtime's own (`#sittings.ts`):
 *
 * - **DeliveredTest**: the tests this runtime delivers, exactly to QTI 3.0.1, and the one stated
 *   limit of what it delivers: IMPL-TESTS' DeliverableTest (no section ref, include under a
 *   section, with-replacement or adaptive selection, or item ref naming no item of the package),
 *   and beyond it a test of one part, which neither selects, orders, branches, conditions nor
 *   controls item sessions, holds no test rubric, test feedback, stylesheet or template default,
 *   times only the whole test with `max-time` (no `min-time`), and refers to no adaptive item and
 *   no item with template processing (whose template values the take would draw: §2.7.3, "Template
 *   processing consists of one or more TemplateRules that are followed by the cloning engine or
 *   delivery system in order to assign values to the template variables"). Every other valid test
 *   is content pantry admits and this runtime does not open: "Delivered shape" holds every sitting
 *   to DeliveredTest's clauses at every write, so no test is ever delivered half to its rules. Each
 *   construct it leaves out has no form in AlphaTest's 2,825 served tests
 *   (`qti-port/registry/tests.md`, T-ABSENT and T-FORM-01; 0 of 2,825 refused, QP-CONVERTER's
 *   count), and each is lifted by the runtime that delivers it.
 * - The laws of a sitting's candidate sessions: each later budget is the time its sitting has left,
 *   no candidate session is suspended past its deadline unless the test allows late submission
 *   (Table 7.40.3), nothing of the sitting follows its end, its end falls in an open candidate
 *   session, every presentation falls in its candidate session, and a linear part's presentations
 *   never go back (§2.8.2). A sitting's first budget, its applied limit with what the application
 *   grants the learner, and its item-session settings are the application's level's, above this
 *   one.
 * - The laws of a sitting's responses: every response snapshot of a sitting's item session, a save or
 *   an attempt, lies inside one of its candidate sessions ("During each attempt the candidate
 *   interacts with the item through one or more candidate sessions", §2.2.1), and every response
 *   the candidate gave in a timed one was given within its time and arrived within the
 *   application's grace past it, unless the test allows late submission (Table 7.40.3). Each is the
 *   sitting's state as a law, so a write outside it is refused, naming it, whoever writes.
 *
 * Instants are microseconds on the database's clock; a duration is the difference of two instants
 * of the sitting's clock, read as the bigint it is (`Type.base`).
 */
import {
  check,
  contained,
  derived,
  Logic,
  Num,
  on,
  pg,
  query,
  schema,
  Type,
  v,
} from "@bjornpagen/grizzle";
import { assertionViewsOf } from "#ledger/assertion-views.ts";
import { creditRelationsOf } from "#ledger/credit-relations.ts";
import { named } from "#ledger/laws.ts";
import type { ledgerOf } from "#ledger/ledger.ts";
import { applicationOperandRelationsOf } from "#ledger/operands.ts";
import { resultRelationsOf } from "#ledger/results.ts";
import { servableOf } from "#ledger/servable.ts";
import { sessionAttemptsOf } from "#ledger/session-attempts.ts";
import { testLawsOf } from "#ledger/test-laws.ts";

/**
 * The Ledger level the delivery level extends.
 */
export type LedgerLevel = ReturnType<typeof ledgerOf>;

/**
 * The elements a delivered test holds none of: what this runtime does not deliver, each a construct
 * of QTI 3.0.1's test whose rules it would have to keep (§2.8.1 selection and ordering, §2.8.3
 * pre-conditions and branching, Table 7.19 item session control, Table 5.6 an item ref's template
 * defaults, §2.8.6 a test's rubric blocks, Table 5.157 test feedback, a stylesheet of the test, and
 * a section ref or include whose sections the test does not hold itself).
 */
const undeliveredKinds = [
  "qti-selection",
  "qti-ordering",
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
 * What an application decides about a sitting's responses beside QTI, which its installation's
 * delivery level states as a constant of its laws: how long after a timed sitting's deadline a
 * response the browser gave before it may still arrive, in microseconds. allow-late-submission
 * refuses "a candidate's response that is beyond the max-time" (Table 7.40.3); a response given
 * within it and still in flight is no such response, and the grace bounds its flight. Required,
 * each application stating its own with its evidence: 0n accepts nothing that arrives after the
 * deadline.
 */
export type SittingPolicy = Readonly<{ graceMicros: bigint }>;

/**
 * The delivery level over the ledger, under an application's grace.
 *
 * @param ledger The Ledger level, the installation's composition of qti-pie's levels below this
 *   one.
 * @param policy The application's grace ({@link SittingPolicy}), a constant of "Response in time".
 * @returns The Delivery level.
 */
export const deliveryOf = (ledger: LedgerLevel, policy: SittingPolicy) => {
  const {
    Attribute,
    DeliverableTest,
    ItemMode,
    ItemSession,
    LateSubmission,
    MaxAttempts,
    MaxTime,
    Node,
    ResponseSnapshot,
    SessionControl,
    SnapshotGiven,
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
   * part, a `max-time` past {@link longestMaxTime}, or an item ref to an adaptive item or to one
   * with template processing.
   */
  /**
   * The elements a delivered test's time limits may stand on, by their place: its root, and its one
   * part (Table 7.40, "Parents: AssessmentItemRef, AssessmentSection, AssessmentTest, TestPart"). A
   * delivered test times at most one of the two, and for a test of one part the two scopes time the
   * same span: "the time limits relate to the durations of all the item sessions plus any other
   * time spent navigating that part of the test" (§2.8.5).
   */
  const timingScopes = query(ledger)
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
  const lateTests = query(ledger).rule((r) => {
    const { package: pkg, path, scope } = v(timingScopes, "lateScope");

    return r
      .match(timingScopes, { package: pkg, path, scope })
      .match(LateSubmission, { package: pkg, path, scope })
      .find({ package: pkg, path });
  });

  const LateTest = derived("LateTest", lateTests);

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
      const { package: pkg, path, scope: start } = v(timingScopes, "undeliveredScope");
      const { seconds } = v(MaxTime, "undeliveredLimit");

      return r
        .match(timingScopes, { package: pkg, path, scope: start })
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
      const { parentKind } = v(Node, "undeliveredControl");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(Node, { kind: "qti-item-session-control", package: pkg, parentKind, path })
        .where(r.ne(parentKind, "qti-test-part"))
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
      const { setting } = v(SessionControl, "undeliveredSetting");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(SessionControl, { package: pkg, path, setting, value: true })
        .where(
          r.in(setting, ["allow-comment", "show-feedback", "show-solution", "validate-responses"]),
        )
        .find({ package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path } = v(TestRoot, "undeliveredTest");
      const { attempts } = v(MaxAttempts, "undeliveredAttempts");

      return r
        .match(TestRoot, { package: pkg, path })
        .match(MaxAttempts, { attempts, package: pkg, path })
        .where(r.ne(attempts, 1))
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
   * Each member's built-in `duration`, in microseconds, exactly, its seconds a millionth of it:
   * "the accumulated time (in seconds) of all Candidate Sessions for all Attempts … the time
   * between the beginning and the end of the item session minus any time the session was in the
   * suspended state" (§2.2.2.2), the sum of its presentations' spans on the sitting's one clock,
   * each ending at the sitting's next moment and, in a timed sitting, never past its candidate
   * session's deadline. A member's next presentation is stamped in the call that ends its
   * predecessor's attempt, so a linear part's spans meet with no gap and their sum is the part's
   * time (research/14 §3.6). Every member has one, read whether or not its item is time dependent
   * (pantry's spec reading 150; §2.2.2.2's "must not be used" stands in a section the information
   * model marks not normative, info:4599).
   */
  const ItemDuration = derived(
    "ItemDuration",
    query(ledger)
      .rule((r) => {
        const { child, stage, at, k, package: pkg, path, end } = v(presentedSpans, "timedSpan");
        const { at: began } = v(TestVisit, "timedSpanVisit");
        const { remaining } = v(TestBudget, "timedSpanBudget");

        return r
          .match(presentedSpans, { at, child, end, k, package: pkg, path, stage })
          .match(TestVisit, { at: began, child, k, stage })
          .match(TestBudget, { child, k, remaining, stage })
          .find({
            child,
            micros: r.sum(
              Logic.least(
                Num.numeric(Num.sub(Type.base(end), Type.base(at))),
                Num.sub(
                  Num.add(Num.numeric(Type.base(began)), Type.base(remaining)),
                  Num.numeric(Type.base(at)),
                ),
              ),
            ),
            package: pkg,
            path,
            stage,
          });
      })
      .rule((r) => {
        const { child, stage, at, k, package: pkg, path, end } = v(presentedSpans, "untimedSpan");

        return r
          .match(presentedSpans, { at, child, end, k, package: pkg, path, stage })
          .where(r.not(TestBudget, { child, k, stage }))
          .find({
            child,
            micros: r.sum(Num.numeric(Num.sub(Type.base(end), Type.base(at)))),
            package: pkg,
            path,
            stage,
          });
      }),
  );

  /**
   * The budget each suspended candidate session of a timed sitting leaves its next: the time it
   * began with, less the time it ran, from its start to its suspension, two instants of the
   * sitting's one clock. The one statement of a later budget: a resumption's budget is read from
   * it, and "Budget chain" holds it there.
   */
  const nextBudgets = query(ledger).rule((r) => {
    const { child, stage, k, remaining } = v(TestBudget, "nextBudgetBudget");
    const { at: began } = v(TestVisit, "nextBudgetVisit");
    const { at: suspended } = v(TestSuspension, "nextBudgetSuspension");

    return r
      .match(TestBudget, { child, k, remaining, stage })
      .match(TestVisit, { at: began, child, k, stage })
      .match(TestSuspension, { at: suspended, child, k, stage })
      .find({
        child,
        left: Num.sub(
          Type.base(remaining),
          Num.numeric(Num.sub(Type.base(suspended), Type.base(began))),
        ),
        next: Num.add(Type.base(k), 1n),
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
      const { next, left } = v(nextBudgets, "before");

      return r
        .match(TestBudget, { child, k, remaining, stage })
        .match(nextBudgets, { child, left, next, stage })
        .where(r.eq(Type.base(k), next))
        .find({ child, k, left, remaining, stage });
    }),
  );

  /**
   * Each suspended candidate session of a timed sitting whose test allows no late submission, with
   * the time it ran and the time it began with.
   */
  const SuspensionInTime = derived(
    "SuspensionInTime",
    query(ledger).rule((r) => {
      const { child, stage, package: pkg, path } = v(TestSession, "sitting");
      const { k, remaining } = v(TestBudget, "budget");
      const { at: began } = v(TestVisit, "visit");
      const { at: suspended } = v(TestSuspension, "suspension");

      return r
        .match(TestSession, { child, package: pkg, path, stage })
        .match(TestBudget, { child, k, remaining, stage })
        .match(TestVisit, { at: began, child, k, stage })
        .match(TestSuspension, { at: suspended, child, k, stage })
        .where(r.not(lateTests, { package: pkg, path }))
        .find({
          child,
          k,
          ran: Num.sub(Type.base(suspended), Type.base(began)),
          remaining,
          stage,
        });
    }),
  );

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
   * Each response the candidate gave in a timed candidate session of a sitting whose test allows no
   * late submission (Table 7.40.3, its default false): its snapshot inside that session ({@link
   * SessionSnapshot}), with `ran`, the time from the session's beginning to the browser's reading
   * `given`, and `arrived`, to the database's stamp less the application's grace ({@link
   * SittingPolicy}), beside the time the session began with. The end's attempts, which the browser
   * gave nothing of, hold no `given` and are none of these.
   */
  const TimedResponse = derived(
    "TimedResponse",
    query(ledger).rule((r) => {
      const { child, stage, package: pkg, path, n, at, k, began } = v(sessionSnapshots, "timed");
      const { given } = v(SnapshotGiven, "timedGiven");
      const { remaining } = v(TestBudget, "timedBudget");
      const { package: testPackage, path: test } = v(TestSession, "timedSitting");

      return r
        .match(sessionSnapshots, { at, began, child, k, n, package: pkg, path, stage })
        .match(SnapshotGiven, { at, child, given, n, package: pkg, path })
        .match(TestBudget, { child, k, remaining, stage })
        .match(TestSession, { child, package: testPackage, path: test, stage })
        .where(r.not(lateTests, { package: testPackage, path: test }))
        .find({
          arrived: Num.sub(Num.sub(Type.base(at), policy.graceMicros), Type.base(began)),
          at,
          child,
          n,
          package: pkg,
          path,
          ran: Num.sub(given, Type.base(began)),
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
   * Each two presentations of a sitting whose part is linear, earlier earlier, with the place in
   * the test of each one's item ref: "Once the candidate moves on they are not permitted to return"
   * (§2.8.2), so the later is never of an item ref before the earlier's.
   */
  const LinearPresentations = derived(
    "LinearPresentations",
    query(ledger).rule((r) => {
      const { child, stage, package: pkg, path } = v(TestSession, "sitting");
      const earlier = v(TestPresented, "earlier");
      const later = v(TestPresented, "later");
      const from = v(TestMember, "from");
      const to = v(TestMember, "to");

      return r
        .match(TestSession, { child, package: pkg, path, stage })
        .match(TestRoot, { package: pkg, path })
        .match(TestPart, { navigation: "linear", package: pkg, path })
        .match(TestPresented, { at: earlier.at, child, package: pkg, path: earlier.path, stage })
        .match(TestPresented, { at: later.at, child, package: pkg, path: later.path, stage })
        .match(TestMember, { document: earlier.path, package: pkg, path, start: from.start })
        .match(TestMember, { document: later.path, package: pkg, path, start: to.start })
        .where(r.lt(earlier.at, later.at))
        .find({
          child,
          earlier: earlier.at,
          from: from.start,
          later: later.at,
          stage,
          to: to.start,
        });
    }),
  );

  /**
   * A sitting's laws against its test (IMPL-TESTOP): members completely and only, one attempt each,
   * submitted together, in turn; that no attempt follows its sitting's end is "Inside a candidate
   * session".
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

  const deliveryRelations = [
    DeliveredTest,
    ItemDuration,
    TimingScope,
    LateTest,
    UndeliveredSitting,
    NextBudget,
    BudgetChain,
    SuspensionInTime,
    SittingOrder,
    LinearPresentations,
    TestSnapshot,
    SessionSnapshot,
    TimedResponse,
    ...testLaws.relations,
    ...assertions.relations,
    ...servable.relations,
    ...creditRelationsOf(ledger, assertions),
    ...results.relations,
    ...sessionAttemptsOf(ledger),
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
      check("Linear_never_back", LinearPresentations, (p) => p.le(p.from, p.to)),
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
     * Response in time: a timed session's response was given within its time and arrived within the
     * grace past it.
     */
    named(
      "Response in time",
      check("Response_in_time", TimedResponse, (t) =>
        t.and(
          t.le(Num.numeric(t.ran), Type.base(t.remaining)),
          t.le(Num.numeric(t.arrived), Type.base(t.remaining)),
        ),
      ),
    ),
    ...testLaws.laws,
    ...assertions.laws,
    ...servable.laws,
    ...results.laws,
    ...operands.laws,
  ] as const;

  return schema.extend([ledger], "Delivery", [...deliveryRelations], [...deliveryLaws]);
};
