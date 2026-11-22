/**
 * The writes that record what a recorded application of an attempt took (`rubric-score`'s), as
 * builders over the delivery level (`#ledger/delivery.ts`), which an application binds once per
 * program over its own role (edullm's evaluator and operator logins, metis's): each records its
 * facts once, as ledger facts the SQL grader reads, and then, in the strata after it, the
 * response processing of every sitting they name (`#ledger/grade.ts` gradeAttemptOf) and that
 * sitting's settling (`#ledger/finish.ts` settleSittingOf), so an attempt whose last pending
 * evaluation a call records is graded in the same transaction (Bjorn, 2026-11-18: "grading MUST
 * be done in the same database transaction"), and one still waiting for another is not
 * (gradable's guard).
 *
 * - {@link evaluationProgramsOf}'s `recordEvaluations` { replies, feedbacks, declines }: the
 *   registered `rubric-score` evaluator's facts (a worker's step that sends a request and decodes
 *   the reply, spec/custom-operators.md §9 #7), three relation parameters of any number of rows,
 *   each row one application of an attempt:
 *
 *   - `replies` { child, package, path, n, at, operator, grader, request, score }: a replied evaluation
 *     and its `score` (`Reply_score`: at least 0; a reply past the maximum is the worker's decoding's
 *     decline, never clamped);
 *   - `feedbacks` { child, package, path, n, at, operator, feedback }: the model's feedback of a reply
 *     the call records, one row per reply that has one; an empty feedback is QTI's NULL and has no
 *     row;
 *   - `declines` { child, package, path, n, at, operator, grader, request, reason }: a declined
 *     evaluation, with why: `refused`, `unreadable`, or `unanswered` (an essay of whitespace or
 *     markup alone), the one reason that routes the group to no person.
 *
 *   Its read-back is `awaiting` { replies, declines } → [{ child, package, path, n, at, rubric }]:
 *   each rubric group of an attempt the call's rows name that still waits for a person once the call
 *   stands (`AwaitingHumanEvaluation`, every `rubric-score` application of the group declined).
 * - {@link personValueOf}'s `recordValue` { scorers, child, package, path, n, at, rubric, score } and
 *   `recordValueWithFeedback` { …, feedback }: a person's value of a waiting rubric group
 *   (`HumanOperatorValue`, `Human_score`, with `HumanOperatorFeedback`), which response processing
 *   reads in place of the group's draws. `scorers` { scorer } is who records it, which the
 *   application binds to its own admission of its caller, so a call it admits nobody for records
 *   nothing. Its read-back `awaiting` [{ rubric }] is what of the attempt still waits.
 *
 * Each row names its attempt by its key, its instant `at` as the bigint a read gave it, and its
 * application by its operator's place in the item's document. The database stamps `evaluated`, the
 * clock whose child is the application, and reads the operator's `class` from the content
 * (`RecordedApplication`), so neither is a field. `grader` is the worker's own: the grader version
 * whose prompt it rendered and sent, never the version in force at write time, which a deploy may
 * have appended while the call was in flight; `Evaluation_grader` refuses a version of another
 * class, and OperatorEvaluation's key holds one fact per attempt and operator. A row records only a
 * pending application (`PendingApplication`: its request made, no evaluation of it yet, its attempt
 * not processed): a redelivered row, whose application the first delivery took out of pending,
 * finds nothing and records nothing, as does a row of an application the item does not record or
 * whose request was never made. A role that composes these inserts what they record and what the
 * grading and settling write (`gradeAttemptTables`, `testOutcomeRunTables`, SittingFinal).
 *
 * @module
 */
import { ChangeSet, pg, query, Type, v } from "@bjornpagen/grizzle";
import type { Rule } from "@bjornpagen/grizzle";
import { EvaluationResult } from "#ledger/evaluations.ts";
import { settleSittingOf } from "#ledger/finish.ts";
import { gradeAttemptOf } from "#ledger/grade.ts";
import { LearnerId } from "#ledger/keys.ts";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";
import { sittingOfSessionOf } from "#ledger/sitting-queries.ts";

/**
 * The evaluator's write over a delivery level, `recordEvaluations`, and its read-back `awaiting`.
 * `recordEvaluations` is the one program, over the level, which an application puts over the role
 * that runs it with grizzle's `ChangeSet.over(role, recordEvaluations)`, any role over the level
 * (a full role extends its base): edullm's evaluator login in its workload,
 * `ChangeSet.over(Evaluator, recordEvaluations)`, and a den step through the app role, generic in
 * it, `through(<W extends RoleOver<DeliveryLevel>>(role: W) => ChangeSet.over(role,
 * recordEvaluations), {})`, den's facts unioned with it in one transaction. It names no
 * parameter but its three row lists and reads no clock: every instant it writes (an evaluation's
 * `evaluated`, a test outcome run's `at`, a final sitting's `at`) is a clock the insert that adds
 * its row stamps, so a den step binds no clock. A role that runs it inserts what it records and
 * what the grading and settling write (this module's header).
 *
 * @param delivery The delivery level, the installation's composition of qti-pie's levels.
 * @returns The write, sequenced with the grading and settling of every sitting its rows name, and
 *   its read-back.
 */
export const evaluationProgramsOf = (delivery: DeliveryLevel) => {
  const f = delivery.relations;

  /**
   * An application of an attempt as a row names it: the attempt's key, its instant the bigint a
   * read gave it, and the operator's place in the item's document.
   */
  const application = {
    at: pg.bigint,
    child: LearnerId,
    n: f.Attempt.fields.n,
    operator: f.OperatorEvaluation.fields.operator,
    package: f.Attempt.fields.package,
    path: f.Attempt.fields.path,
  } as const;
  const replyHeading = {
    ...application,
    grader: f.OperatorEvaluation.fields.grader,
    request: f.OperatorEvaluation.fields.request,
    score: f.OperatorReply.fields.score,
  } as const;
  const feedbackHeading = {
    ...application,
    feedback: f.OperatorFeedback.fields.feedback,
  } as const;
  const declineHeading = {
    ...application,
    grader: f.OperatorEvaluation.fields.grader,
    reason: f.OperatorDecline.fields.reason,
    request: f.OperatorEvaluation.fields.request,
  } as const;

  /**
   * The call's replies whose application is pending, each at its attempt's instant and with its
   * recorded class: the one guard the evaluation header and the reply read.
   */
  const pendingReplies = query(delivery).rule((r) => {
    const replies = r.relation("replies", replyHeading);
    const {
      at: named,
      child,
      grader,
      n,
      operator,
      package: pkg,
      path,
      request,
      score,
    } = v(replies, "reply");
    const { at } = v(f.PendingApplication, "pendingReply");
    const { class: operatorClass } = v(f.RecordedApplication, "repliedApplication");

    return r
      .match(replies, { at: named, child, grader, n, operator, package: pkg, path, request, score })
      .match(f.PendingApplication, { at, child, n, operator, package: pkg, path })
      .match(f.RecordedApplication, { class: operatorClass, package: pkg, path, start: operator })
      .where(r.eq(Type.base(at), named))
      .find({
        at,
        child,
        class: operatorClass,
        grader,
        n,
        operator,
        package: pkg,
        path,
        request,
        score,
      });
  });

  /**
   * The call's declines whose application is pending, each at its attempt's instant and with its
   * recorded class: the one guard the evaluation header and the decline read.
   */
  const pendingDeclines = query(delivery).rule((r) => {
    const declines = r.relation("declines", declineHeading);
    const {
      at: named,
      child,
      grader,
      n,
      operator,
      package: pkg,
      path,
      reason,
      request,
    } = v(declines, "decline");
    const { at } = v(f.PendingApplication, "pendingDecline");
    const { class: operatorClass } = v(f.RecordedApplication, "declinedApplication");

    return r
      .match(declines, {
        at: named,
        child,
        grader,
        n,
        operator,
        package: pkg,
        path,
        reason,
        request,
      })
      .match(f.PendingApplication, { at, child, n, operator, package: pkg, path })
      .match(f.RecordedApplication, { class: operatorClass, package: pkg, path, start: operator })
      .where(r.eq(Type.base(at), named))
      .find({
        at,
        child,
        class: operatorClass,
        grader,
        n,
        operator,
        package: pkg,
        path,
        reason,
        request,
      });
  });

  /**
   * Each evaluation's header: a replied one of each pending reply, a declined one of each pending
   * decline.
   */
  const evaluations = query(delivery)
    .rule((r) => {
      const replied = pendingReplies.bind({ replies: r.relation("replies", replyHeading) });
      const {
        at,
        child,
        class: operatorClass,
        grader,
        n,
        operator,
        package: pkg,
        path,
        request,
      } = v(replied, "repliedEvaluation");

      return r
        .match(replied, {
          at,
          child,
          class: operatorClass,
          grader,
          n,
          operator,
          package: pkg,
          path,
          request,
        })
        .find({
          at,
          child,
          class: operatorClass,
          grader,
          n,
          operator,
          package: pkg,
          path,
          request,
          result: EvaluationResult.handle("replied"),
        });
    })
    .rule((r) => {
      const declined = pendingDeclines.bind({ declines: r.relation("declines", declineHeading) });
      const {
        at,
        child,
        class: operatorClass,
        grader,
        n,
        operator,
        package: pkg,
        path,
        request,
      } = v(declined, "declinedEvaluation");

      return r
        .match(declined, {
          at,
          child,
          class: operatorClass,
          grader,
          n,
          operator,
          package: pkg,
          path,
          request,
        })
        .find({
          at,
          child,
          class: operatorClass,
          grader,
          n,
          operator,
          package: pkg,
          path,
          request,
          result: EvaluationResult.handle("declined"),
        });
    });

  /**
   * The rubric groups still waiting for a person, once the call stands, of each attempt its replies
   * or declines name: none once the attempt's response processing may run, which the grading
   * stratum then runs.
   */
  const awaiting = query(delivery)
    .rule((r) => {
      const replies = r.relation("replies", replyHeading);
      const { at: named, child, n, package: pkg, path } = v(replies, "awaitingReply");
      const { at, rubric } = v(f.AwaitingHumanEvaluation, "awaitingReplied");

      return r
        .match(replies, { at: named, child, n, package: pkg, path })
        .match(f.AwaitingHumanEvaluation, { at, child, n, package: pkg, path, rubric })
        .where(r.eq(Type.base(at), named))
        .find({ at, child, n, package: pkg, path, rubric });
    })
    .rule((r) => {
      const declines = r.relation("declines", declineHeading);
      const { at: named, child, n, package: pkg, path } = v(declines, "awaitingDecline");
      const { at, rubric } = v(f.AwaitingHumanEvaluation, "awaitingDeclined");

      return r
        .match(declines, { at: named, child, n, package: pkg, path })
        .match(f.AwaitingHumanEvaluation, { at, child, n, package: pkg, path, rubric })
        .where(r.eq(Type.base(at), named))
        .find({ at, child, n, package: pkg, path, rubric });
    });

  /**
   * The sittings the call's replies and declines name: the stage ItemSession holds each attempt's
   * item session at, what the grading and settling are bound to. A call's feedbacks name only
   * attempts its replies do.
   */
  const evaluatedSittings = query(delivery)
    .rule((r) => {
      const replies = r.relation("replies", replyHeading);
      const { child, n, package: pkg, path } = v(replies, "repliedSitting");
      const { stage } = v(f.ItemSession, "repliedSession");

      return r
        .match(replies, { child, n, package: pkg, path })
        .match(f.ItemSession, { child, n, package: pkg, path, stage })
        .find({ child, stage });
    })
    .rule((r) => {
      const declines = r.relation("declines", declineHeading);
      const { child, n, package: pkg, path } = v(declines, "declinedSitting");
      const { stage } = v(f.ItemSession, "declinedSession");

      return r
        .match(declines, { child, n, package: pkg, path })
        .match(f.ItemSession, { child, n, package: pkg, path, stage })
        .find({ child, stage });
    });

  /**
   * The call's evaluations: each pending application's header and its arm, a replied one's feedback
   * where it has one, with what of the attempts still waits for a person after the call.
   */
  const write = ChangeSet.empty(delivery)
    .insert(f.OperatorEvaluation, evaluations)
    .insert(
      f.OperatorReply,
      query(delivery).rule((r) => {
        const replied = pendingReplies.bind({ replies: r.relation("replies", replyHeading) });
        const { at, child, n, operator, package: pkg, path, score } = v(replied, "repliedScore");

        return r
          .match(replied, { at, child, n, operator, package: pkg, path, score })
          .find({ at, child, n, operator, package: pkg, path, score });
      }),
    )
    .insert(
      f.OperatorFeedback,
      query(delivery).rule((r) => {
        const feedbacks = r.relation("feedbacks", feedbackHeading);
        const {
          at: named,
          child,
          feedback,
          n,
          operator,
          package: pkg,
          path,
        } = v(feedbacks, "feedback");
        const { at } = v(f.PendingApplication, "pendingFeedback");

        return r
          .match(feedbacks, { at: named, child, feedback, n, operator, package: pkg, path })
          .match(f.PendingApplication, { at, child, n, operator, package: pkg, path })
          .where(r.eq(Type.base(at), named))
          .find({ at, child, feedback, n, operator, package: pkg, path });
      }),
    )
    .insert(
      f.OperatorDecline,
      query(delivery).rule((r) => {
        const declined = pendingDeclines.bind({ declines: r.relation("declines", declineHeading) });
        const {
          at,
          child,
          n,
          operator,
          package: pkg,
          path,
          reason,
        } = v(declined, "declinedReason");

        return r
          .match(declined, { at, child, n, operator, package: pkg, path, reason })
          .find({ at, child, n, operator, package: pkg, path, reason });
      }),
    )
    .read("awaiting", () => awaiting);

  return {
    awaiting,
    recordEvaluations: ChangeSet.sequence(
      write,
      ChangeSet.sequence(gradeAttemptOf(delivery), settleSittingOf(delivery)),
    ).bind({ sittings: evaluatedSittings }),
  } as const;
};

/**
 * A person's value of a waiting rubric group over a delivery level, `recordValue`, and with the
 * person's feedback, `recordValueWithFeedback`, each over the scorers the application binds.
 *
 * @param delivery The delivery level, the installation's composition of qti-pie's levels.
 * @returns The writes, each sequenced with the grading and settling of its attempt's sitting.
 */
export const personValueOf = (delivery: DeliveryLevel) => {
  const f = delivery.relations;

  /**
   * Who records a call's value: the application's admission of its caller, one row or none.
   */
  const scorerHeading = { scorer: f.HumanOperatorValue.fields.scorer } as const;

  /**
   * The rubric group a call values, by its parameters, with each of its scorers: the attempt's
   * group of its `rubric` while it waits for a person (`AwaitingHumanEvaluation`: every
   * `rubric-score` application of it declined, none replied, no value yet). A group that does not
   * wait (one still in flight, one a reply answered, one a person already valued, one the ledger
   * does not hold), or a call with no scorer, finds no row, so the call records nothing. The value
   * replaces the group's draws in response processing exactly when every draw declined (IMPL-OPS's
   * route 1), so it never overrides a reply.
   */
  const waitingGroup = query(delivery).rule((r) => {
    const scorers = r.relation("scorers", scorerHeading);
    const { scorer } = v(scorers, "scorer");
    const {
      at,
      child,
      n,
      package: pkg,
      path,
      rubric,
    } = v(f.AwaitingHumanEvaluation, "waitingGroup");

    return r
      .match(scorers, { scorer })
      .match(f.AwaitingHumanEvaluation, { at, child, n, package: pkg, path, rubric })
      .where(
        r.eq(child, r.param("child", LearnerId)),
        r.eq(pkg, r.param("package", f.Attempt.fields.package)),
        r.eq(path, r.param("path", f.Attempt.fields.path)),
        r.eq(n, r.param("n", f.Attempt.fields.n)),
        r.eq(Type.base(at), r.param("at", pg.bigint)),
        r.eq(rubric, r.param("rubric", f.HumanOperatorValue.fields.rubric)),
      )
      .find({ at, child, n, package: pkg, path, rubric, scorer });
  });

  /**
   * The waiting group, bound in a member's rule to the call's parameters and scorers: the one guard
   * the value and its feedback read.
   */
  const waitingIn = (r: Rule<DeliveryLevel>) =>
    waitingGroup.bind({
      at: r.param("at", pg.bigint),
      child: r.param("child", LearnerId),
      n: r.param("n", f.Attempt.fields.n),
      package: r.param("package", f.Attempt.fields.package),
      path: r.param("path", f.Attempt.fields.path),
      rubric: r.param("rubric", f.HumanOperatorValue.fields.rubric),
      scorers: r.relation("scorers", scorerHeading),
    });

  /**
   * The attempt's rubric groups still waiting for a person once the call's value stands: none once
   * its response processing may run, which the grading stratum then runs.
   */
  const awaiting = query(delivery).rule((r) => {
    const {
      at,
      child,
      n,
      package: pkg,
      path,
      rubric,
    } = v(f.AwaitingHumanEvaluation, "stillAwaiting");

    return r
      .match(f.AwaitingHumanEvaluation, { at, child, n, package: pkg, path, rubric })
      .where(
        r.eq(child, r.param("child", LearnerId)),
        r.eq(pkg, r.param("package", f.Attempt.fields.package)),
        r.eq(path, r.param("path", f.Attempt.fields.path)),
        r.eq(n, r.param("n", f.Attempt.fields.n)),
        r.eq(Type.base(at), r.param("at", pg.bigint)),
      )
      .find({ rubric });
  });

  /**
   * A person's value, `score` (at least 0, as `Human_score` holds it), recorded at the instant the
   * database stamps, the latest of the group's in force, with what of the attempt still waits after
   * it.
   */
  const valued = ChangeSet.empty(delivery)
    .insert(
      f.HumanOperatorValue,
      query(delivery).rule((r) => {
        const group = waitingIn(r);
        const { at, child, n, package: pkg, path, rubric, scorer } = v(group, "valued");

        return r.match(group, { at, child, n, package: pkg, path, rubric, scorer }).find({
          at,
          child,
          n,
          package: pkg,
          path,
          rubric,
          score: r.param("score", f.HumanOperatorValue.fields.score),
          scorer,
        });
      }),
    )
    .read("awaiting", () => awaiting);

  /**
   * A person's value with their `feedback`.
   */
  const valuedWithFeedback = valued.insert(
    f.HumanOperatorFeedback,
    query(delivery).rule((r) => {
      const group = waitingIn(r);
      const { at, child, n, package: pkg, path, rubric } = v(group, "valuedFeedback");

      return r.match(group, { at, child, n, package: pkg, path, rubric }).find({
        at,
        child,
        feedback: r.param("feedback", f.HumanOperatorFeedback.fields.feedback),
        n,
        package: pkg,
        path,
        rubric,
      });
    }),
  );

  /**
   * The grading and settling of the valued attempt's sitting, the stage its item session is at.
   */
  const graded = ChangeSet.sequence(gradeAttemptOf(delivery), settleSittingOf(delivery));
  const session = sittingOfSessionOf(delivery);

  return {
    recordValue: ChangeSet.sequence(valued, graded).bind({ sittings: session }),
    recordValueWithFeedback: ChangeSet.sequence(valuedWithFeedback, graded).bind({
      sittings: session,
    }),
  } as const;
};
