/**
 * What QTI 3.0.1 runs at the end of a test's part, as composable writes over the Delivery level, in
 * the end's own transaction (Bjorn, 2026-11-20: "grading MUST be done in the same database
 * transaction"), each over the call's subject sittings, the `sittings` relation parameter
 * (`#ledger/sitting-queries.ts`), which an application binds once per program, to its own query
 * (`ChangeSet.bind`). An application sequences {@link finishTestOf} after the stratum that writes
 * the sitting's end (`TestEnd`).
 *
 * - **The close** ({@link closeOf}): an attempt for every member the end submits
 *   ({@link closeReadsOf}), its response values its latest save's (`#ledger/finish-copies.ts`).
 *   "The end of an attempt, and therefore response processing, must only take place in direct
 *   response to a user action or in response to some expected event, such as the end of a test"
 *   (§2.2.4), and "In simultaneous mode the candidate's responses are all submitted together at the
 *   end of the qti-test-part" (Table 5.159.5). The close rule (research/14 §3.5, IMPL-TESTPLAYER's
 *   statement, confirmed 2026-11-20):
 *
 *   - A simultaneous part, in either navigation mode: every presented member, each attemptless until
 *     the end (`#ledger/test-laws.ts`, "Submitted together"), from its latest save, or, where it has
 *     none, with its declared defaults (a `DefaultSubmission`: a skipped item's "response variables
 *     are submitted with their default value or are NULL", Table 7.19.6);
 *   - An individual nonlinear part: every presented member with no attempt, the same way: its attempt
 *     began when it was presented (spec reading 3, "An attempt begins at first presentation"), and
 *     the end ends it; and an unlimited member (its item ref's `max-attempts` 0, Table 7.19.1) saved
 *     since its last attempt, from that save: its next attempt began when its last ended. Navigating
 *     submits nothing, and the end is no candidate's submission, so its item ref's validate-responses
 *     does not hold the end's attempt back (§2.2.4, Table 7.19.7);
 *   - An individual linear part: only the member on screen, the sitting's latest presentation, where
 *     its attempt is in progress (none yet, or an unlimited member's saved since its last) and its
 *     latest save holds a value; every member before it has its attempt already ("In turn": moving on
 *     submits), and a cleared answer, a save with no value, is not submitted;
 *   - A member never presented gets none ("In turn": an attempt is of a member the candidate was
 *     shown).
 * - **The grading**: every attempt of the sitting that response processing has not run on, the
 *   close's among them, through the item's response processing (P4's `gradeAttemptOf`), in the
 *   stratum after the close.
 * - **The settle** ({@link settleSittingOf}): the test's outcome processing
 *   (`#ledger/test-run-writes.ts`), one run over every member's outcomes, stored as the sitting's
 *   `TestOutcomeRun` and its sidecars, once per end, beside the sitting turning final, in the
 *   stratum after the grading.
 *
 * A sitting with no end submits nothing, grades nothing and runs nothing; so does an end already
 * finished: its every submitted member has its attempt (no save is taken after the end), and its
 * run is stamped at or after the end.
 */
import { ChangeSet, query, v } from "@bjornpagen/grizzle";
import { savedCopiesOf } from "#ledger/finish-copies.ts";
import { gradeAttemptOf } from "#ledger/grade.ts";
import { SnapshotKind } from "#ledger/ledger.ts";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";
import { closeReadsOf, sittingHeading } from "#ledger/sitting-queries.ts";
import { testRunWritesOf } from "#ledger/test-run-writes.ts";

/**
 * The close, one stratum: for each member the end submits (`closing`, {@link closeReadsOf}) its
 * attempt, a response snapshot of kind `attempt` at the instant the database stamps, with its
 * latest save's values; a member with no save submits its declared defaults, a `DefaultSubmission`
 * of the same key in the same stratum, so of the same instant. Its outcomes and completion status
 * are its response processing's, written by the grading in the next stratum.
 */
const closeOf = (delivery: DeliveryLevel) => {
  const { Attempt, DefaultSubmission, ResponseSnapshot, Save } = delivery.relations;
  const reads = closeReadsOf(delivery);
  const { closing } = reads;
  const submitted = ChangeSet.empty(delivery)
    .insert(
      ResponseSnapshot,
      query(delivery).rule((r) => {
        const closingAt = closing.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { child, package: pkg, path, n } = v(closingAt, "submitted");

        return r
          .match(closingAt, { child, n, package: pkg, path })
          .find({ child, kind: SnapshotKind.handle("attempt"), n, package: pkg, path });
      }),
    )
    .insert(
      Attempt,
      query(delivery).rule((r) => {
        const closingAt = closing.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { child, package: pkg, path, n } = v(closingAt, "attempted");

        return r
          .match(closingAt, { child, n, package: pkg, path })
          .find({ child, n, package: pkg, path });
      }),
    )
    .insert(
      DefaultSubmission,
      query(delivery).rule((r) => {
        const closingAt = closing.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { child, package: pkg, path, n } = v(closingAt, "defaulted");

        return r
          .match(closingAt, { child, n, package: pkg, path })
          .where(r.not(Save, { child, n, package: pkg, path }))
          .find({ child, n, package: pkg, path });
      }),
    );

  return ChangeSet.union(submitted, savedCopiesOf(delivery, reads));
};

/**
 * Each of the call's sittings turning final, in the statement that makes it so: it is settled
 * (P4-RESULT's `SettledSitting`, the one definition: ended, and no item session of its stage
 * waiting on anything, Results Reporting, Table 2.7.7, `final`, "the values at the end of an
 * attempt after response processing has taken place"), and it holds no `SittingFinal` yet; the row
 * stamped at the call's instant.
 */
const finalizeSittingOf = (delivery: DeliveryLevel) => {
  const { SettledSitting, SittingFinal } = delivery.relations;

  return ChangeSet.empty(delivery).insert(
    SittingFinal,
    query(delivery).rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage } = v(sittings, "finalSitting");

      return r
        .match(sittings, { child, stage })
        .match(SettledSitting, { child, stage })
        .where(r.not(SittingFinal, { child, stage }))
        .find({ child, stage });
    }),
  );
};

/**
 * The call's sittings settling, one stratum, composed after every write that may settle one: the
 * end's finish, a late grade, an assertion. The test's outcome processing over every member's
 * outcomes in force, stored as a sitting's run where one is due (`#ledger/test-run-writes.ts`),
 * beside each sitting turning final where nothing of it is pending ({@link finalizeSittingOf}).
 * The run reads the contexts the application bound for the sitting from the ledger
 * (`SessionContext<Float|Integer|Boolean>`). A write over one attempt sequences it after its
 * grading and binds its whole program once to the sitting of the item session it names
 * (`#ledger/sitting-queries.ts`'s sittingOfSessionOf).
 */
export const settleSittingOf = (delivery: DeliveryLevel) =>
  ChangeSet.union(testRunWritesOf(delivery), finalizeSittingOf(delivery));

/**
 * The end of the call's sittings, whole, in one transaction of three strata after the
 * application's end: the close ({@link closeOf}); the grading of every attempt the close wrote,
 * through the item's response processing (P4's `gradeAttemptOf`), which reads them back stored;
 * and the settle ({@link settleSittingOf}).
 */
export const finishTestOf = (delivery: DeliveryLevel) =>
  ChangeSet.sequence(
    ChangeSet.sequence(closeOf(delivery), gradeAttemptOf(delivery)),
    settleSittingOf(delivery),
  );
