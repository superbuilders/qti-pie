/**
 * What an attempt's and a sitting's results are, derived and never stored, at the Delivery level
 * over the ledger: which recorded applications an attempt's response processing still waits for,
 * the Results Reporting status of each attempt, which sittings are final, and which of a sitting's
 * outcome processing runs is in force. The values themselves are the ledger's and the assertion
 * views' (`#assertion-views.ts`): an attempt's single in force is `OutcomeInForceSingle<BaseType>`,
 * its credit `AttemptCredit` (`#credit-relations.ts`), and a sitting's outcomes are its run's own
 * rows (`TestOutcomeSingle<BaseType>` and the other sidecars of `TestOutcomeRun`, `#sittings.ts`),
 * matched on the run this module names in force, so no value is restated here.
 *
 * Results Reporting, Table 2.7.7 (SessionStatusEnum), the three statuses of the item variables at
 * the end of an attempt:
 *
 * - `pendingResponseProcessing`: "The value to use when the item variables represent the values of
 *   the response variables after submission but before response processing has taken place. Again,
 *   the outcomes are those assigned at the end of the previous attempt as they are awaiting
 *   response processing." An attempt is pending until the statement that runs its response
 *   processing records it (the ledger's `ProcessedAttempt`), which grading does only once no
 *   recorded application of the attempt waits for its evaluation (`PendingApplication`) and no
 *   rubric group whose every draw declined waits for a person's value (`AwaitingHumanEvaluation`,
 *   `#assertion-views.ts`, review M6, route 1).
 * - `pendingExternalScoring`: "The value to use when the response processing rules are processed, but
 *   the score is NOT final because the 'external-scored' property for the outcome variable was
 *   set": response processing ran, and an external-scored outcome has no assertion yet
 *   (`PendingExternalScoring`).
 * - `final`: "The value to use when the item variables represent the values at the end of an attempt
 *   after response processing has taken place."
 *
 * The other two statuses of the enumeration, `initial` and `pendingSubmission`, are an item
 * session's before an attempt and a save's: no attempt has them, so {@link AttemptStatus} does not
 * hold them.
 */
import {
  check,
  closed,
  contained,
  derived,
  key,
  on,
  pg,
  query,
  Type,
  v,
} from "@bjornpagen/grizzle";
import type { assertionViewsOf } from "#ledger/assertion-views.ts";
import type { LedgerLevel } from "#ledger/delivery.ts";
import { named } from "#ledger/laws.ts";

/**
 * The status of an attempt's item variables (Results Reporting, Table 2.7.7, SessionStatusEnum),
 * each token as the enumeration spells it: the three an attempt takes, `initial` and
 * `pendingSubmission` being an item session's before its first attempt and a save's.
 */
export const AttemptStatus = closed.unordered("AttemptStatus", [
  "pendingResponseProcessing",
  "pendingExternalScoring",
  "final",
]);

/**
 * Each recorded application of an attempt that waits for its evaluation, as a plain query, with its
 * item session's stage (`ItemSession`'s, a dependent attribute of the attempt): a demand of the
 * attempt (`ApplicationDemand`, what the grader's run reached and could not evaluate) with no
 * `OperatorEvaluation` of it yet. Until none waits, the attempt's response processing does not run
 * again: the operator's value is an input of it ("The custom operator provides an extension
 * mechanism for defining operations which are currently not supported by this specification", ASI
 * Table 5.37). Which applications are requested is the processing's own decision, so an essay its
 * own rule finds empty is never requested, and a NULL response is never demanded ("NULL iff the
 * response is NULL (no request is made)", `rubric-score`'s contract). An attempt whose response
 * processing has run (`ProcessedAttempt`) waits for nothing. What the Delivery level's
 * `PendingApplication` holds, and what grading's guard negates.
 *
 * @param ledger - The ledger level.
 * @returns The query.
 */
export const pendingApplicationsOf = (ledger: LedgerLevel) => {
  const { ApplicationDemand, ItemSession, OperatorEvaluation, ProcessedAttempt } = ledger.relations;

  return query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at, operator } = v(ApplicationDemand, "pendingDemand");
    const { stage } = v(ItemSession, "pendingSession");

    return r
      .match(ApplicationDemand, { at, child, n, operator, package: pkg, path })
      .match(ItemSession, { child, n, package: pkg, path, stage })
      .where(
        r.not(ProcessedAttempt, { at, child, n, package: pkg, path }),
        r.not(OperatorEvaluation, { at, child, n, operator, package: pkg, path }),
      )
      .find({ at, child, n, operator, package: pkg, path, stage });
  });
};

/**
 * The Delivery level's result relations over the ledger `ledger`, for the level to spread. Each
 * attempt's row carries its item session's `stage`, a dependent attribute of its key, so a reader
 * of a sitting's attempts matches it there.
 *
 * - **PendingApplication** `(child, package, path, n, at, operator) → stage`:
 *   {@link pendingApplicationsOf}.
 * - **ItemSessionStatus** `(child, package, path, n, at) → stage, status`: each attempt's status,
 *   exactly one.
 * - **LatestAttempt** `(child, package, path, n) → stage, at`: each item session's latest attempt,
 *   processed or not, the one its review shows.
 * - **SettledSitting** `(child, stage)`: each sitting that has ended with no attempt pending,
 *   derived.
 * - The laws of the ledger's stored **SittingFinal** `(child, stage, at)` (`#sittings.ts`), keyed by
 *   `(child, stage)` too, the same sittings as SettledSitting, `at` its insert's stamp; its laws
 *   hold it to SettledSitting both ways, each one negation deep, as grizzle states a law (a law
 *   over SettledSitting itself, a negation of a negation, is an UnsupportedLawFamily): every final
 *   sitting has ended and holds no attempt not final (`UnsettledFinal` empty), and every ended
 *   sitting with no row holds one (`UnfinalEnded` ⊆ `UnsettledSitting`).
 * - **TestRunInForce** `(child, stage) → at`: each sitting's outcome processing run in force.
 *
 * @param ledger - The ledger level.
 * @param assertions - The assertion views' plain queries (`#assertion-views.ts`), read here since a
 *   relation of a level reads no derived relation of its own level.
 * @returns The roster, the derived relations, and SittingFinal's laws.
 */
export const resultRelationsOf = (
  ledger: LedgerLevel,
  assertions: Pick<ReturnType<typeof assertionViewsOf>, "pendingExternalScorings">,
) => {
  const {
    Attempt,
    ItemSession,
    ProcessedAttempt,
    SittingFinal,
    TestEnd,
    TestOutcomeRun,
    TestSession,
  } = ledger.relations;
  const { pendingExternalScorings } = assertions;

  const PendingApplication = derived("PendingApplication", pendingApplicationsOf(ledger));

  /**
   * Each attempt whose response processing has not run, which the ledger's `ProcessedAttempt`
   * records (with the `completionStatus` it left) in the statement that runs it, with its item
   * session's stage.
   */
  const unprocessedAttempts = query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at } = v(Attempt, "unprocessed");
    const { stage } = v(ItemSession, "unprocessedSession");

    return r
      .match(Attempt, { at, child, n, package: pkg, path })
      .match(ItemSession, { child, n, package: pkg, path, stage })
      .where(r.not(ProcessedAttempt, { at, child, n, package: pkg, path }))
      .find({ at, child, n, package: pkg, path, stage });
  });

  /**
   * Each item session's latest attempt, processed or not, with its item session's stage: its
   * greatest instant, an attempt's instant being a clock of its item session (`Attempt`'s key), so
   * the latest is the last committed. The attempt a review of the session shows and the one a
   * reader of a sitting's attempts as they stand reads, its values, credit and marks
   * (`#ledger/attempt-rows.ts`) and the attempts the marks read (`#ledger/grade.ts`
   * attemptArgumentsOf's `gradable`). A fold, which grizzle reads at the key set its reads restrict
   * it at; read at two in one statement, as the review's sitting and the marks' evaluation read it,
   * it is derived whole for now (measured 2026-11-24: every attempt of the database for a
   * three-row review), until grizzle keys a fold at the union of its reads' key sets (the ask in
   * DECIDE6).
   */
  const LatestAttempt = derived(
    "LatestAttempt",
    query(ledger).rule((r) => {
      const { child, package: pkg, path, n, at } = v(Attempt, "latest");
      const { stage } = v(ItemSession, "latestSession");

      return r
        .match(Attempt, { at, child, n, package: pkg, path })
        .match(ItemSession, { child, n, package: pkg, path, stage })
        .find({ at: r.max(at), child, n, package: pkg, path, stage });
    }),
  );

  /**
   * Each processed attempt with an external-scored outcome no assertion has scored, with its item
   * session's stage.
   */
  const unscoredAttempts = query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at } = v(ProcessedAttempt, "unscored");
    const { stage } = v(ItemSession, "unscoredSession");

    return r
      .match(ProcessedAttempt, { at, child, n, package: pkg, path })
      .match(ItemSession, { child, n, package: pkg, path, stage })
      .match(pendingExternalScorings, { at, child, n, package: pkg, path })
      .find({ at, child, n, package: pkg, path, stage });
  });

  /**
   * Each attempt's status (Results Reporting, Table 2.7.7), exactly one:
   * `pendingResponseProcessing` until its response processing has run, which grading runs once no
   * application waits for its evaluation ({@link PendingApplication}) and no rubric group for a
   * person's value (`AwaitingHumanEvaluation`); then `pendingExternalScoring` while an
   * external-scored outcome has no assertion; else `final`.
   */
  const ItemSessionStatus = derived(
    "ItemSessionStatus",
    query(ledger)
      .rule((r) => {
        const { child, package: pkg, path, n, at, stage } = v(unprocessedAttempts, "unprocessed");

        return r.match(unprocessedAttempts, { at, child, n, package: pkg, path, stage }).find({
          at,
          child,
          n,
          package: pkg,
          path,
          stage,
          status: AttemptStatus.handle("pendingResponseProcessing"),
        });
      })
      .rule((r) => {
        const { child, package: pkg, path, n, at, stage } = v(unscoredAttempts, "unscored");

        return r.match(unscoredAttempts, { at, child, n, package: pkg, path, stage }).find({
          at,
          child,
          n,
          package: pkg,
          path,
          stage,
          status: AttemptStatus.handle("pendingExternalScoring"),
        });
      })
      .rule((r) => {
        const { child, package: pkg, path, n, at } = v(ProcessedAttempt, "final");
        const { stage } = v(ItemSession, "finalSession");

        return r
          .match(ProcessedAttempt, { at, child, n, package: pkg, path })
          .match(ItemSession, { child, n, package: pkg, path, stage })
          .where(r.not(pendingExternalScorings, { at, child, n, package: pkg, path }))
          .find({ at, child, n, package: pkg, path, stage, status: AttemptStatus.handle("final") });
      }),
  );

  /**
   * Each sitting that has ended (`TestEnd`) with no attempt of its item sessions pending, neither
   * its response processing nor an external score (Results Reporting, Table 2.7.7): the condition
   * the ledger's `SittingFinal` holds, derived. Its outcomes are its run in force's ({@link
   * TestRunInForce}): outcome processing "happens after any (item level) response processing
   * triggered by the submission" (ASI Table 5.102), so the run after its last attempt's processing
   * and its last assertion is the final one.
   */
  /**
   * Each test session not yet ended (no `TestEnd`), with its test: the sitting a take of that test
   * meets. At most one per child and test (its key, below): a second take while one stands unended
   * is a fact that did not happen, which the take's guard makes write nothing
   * (`#ledger/sitting-queries.ts` unendedSittingsOf reads this relation) and which the key makes
   * unrepresentable for any writer.
   */
  const UnendedSitting = derived(
    "UnendedSitting",
    query(ledger).rule((r) => {
      const { child, stage, package: pkg, path } = v(TestSession, "unendedSitting");

      return r
        .match(TestSession, { child, package: pkg, path, stage })
        .where(r.not(TestEnd, { child, stage }))
        .find({ child, package: pkg, path, stage });
    }),
  );

  const SettledSitting = derived(
    "SettledSitting",
    query(ledger).rule((r) => {
      const { child, stage } = v(TestEnd, "end");

      return r
        .match(TestEnd, { child, stage })
        .where(
          r.not(unprocessedAttempts, { child, stage }),
          r.not(unscoredAttempts, { child, stage }),
        )
        .find({ child, stage });
    }),
  );

  /**
   * Each sitting that holds an attempt not final, unprocessed or unscored, by the sitting.
   */
  const unsettledSittings = query(ledger)
    .rule((r) => {
      const { child, stage } = v(unprocessedAttempts, "unsettledUnprocessed");

      return r.match(unprocessedAttempts, { child, stage }).find({ child, stage });
    })
    .rule((r) => {
      const { child, stage } = v(unscoredAttempts, "unsettledUnscored");

      return r.match(unscoredAttempts, { child, stage }).find({ child, stage });
    });

  /**
   * Each final sitting that holds an attempt not final, `settled` false: none may stand ("Final
   * settled"). With SittingFinal ⊆ TestEnd, it states SittingFinal ⊆ {@link SettledSitting} one
   * negation deep, as grizzle states a law.
   */
  const UnsettledFinal = derived(
    "UnsettledFinal",
    query(ledger).rule((r) => {
      const { child, stage } = v(SittingFinal, "unsettledFinal");

      return r
        .match(SittingFinal, { child, stage })
        .match(unsettledSittings, { child, stage })
        .find({ child, settled: Type.literal(pg.boolean, false), stage });
    }),
  );

  /**
   * Each ended sitting that has no SittingFinal row: each must hold an attempt not final (law 2).
   */
  const UnfinalEnded = derived(
    "UnfinalEnded",
    query(ledger).rule((r) => {
      const { child, stage } = v(TestEnd, "unfinalEnd");

      return r
        .match(TestEnd, { child, stage })
        .where(r.not(SittingFinal, { child, stage }))
        .find({ child, stage });
    }),
  );

  /**
   * Each sitting that holds an attempt not final, as a relation of the level, for law 2 to read.
   */
  const UnsettledSitting = derived("UnsettledSitting", unsettledSittings);

  /**
   * Each sitting's outcome processing run in force: its latest (`TestOutcomeRun`, whose instant is
   * a clock of the sitting, so the latest is the last committed). Outcome processing "takes place
   * each time the candidate submits the responses" and its outcomes "are always reset to their
   * defaults prior to carrying out the instructions" (ASI Table 5.102), so a run states every test
   * outcome it leaves, and the latest run's rows are the sitting's outcomes; a sitting with no run
   * has none yet.
   */
  const TestRunInForce = derived(
    "TestRunInForce",
    query(ledger).rule((r) => {
      const { child, stage, at } = v(TestOutcomeRun, "run");

      return r.match(TestOutcomeRun, { at, child, stage }).find({ at: r.max(at), child, stage });
    }),
  );

  const relations = [
    AttemptStatus,
    PendingApplication,
    ItemSessionStatus,
    LatestAttempt,
    SettledSitting,
    UnsettledFinal,
    UnfinalEnded,
    UnsettledSitting,
    TestRunInForce,
    UnendedSitting,
  ] as const;

  const laws = [
    named(
      "Final settled",
      check("Final_settled", UnsettledFinal, (u) => u.eq(u.settled, true)),
    ),
    named(
      "Unfinal ended",
      contained(on(UnfinalEnded, "child", "stage"), on(UnsettledSitting, "child", "stage")),
    ),
    named("Unended sitting key", key(on(UnendedSitting, "child", "package", "path"))),
  ] as const;

  return { laws, relations } as const;
};
