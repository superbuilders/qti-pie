/**
 * A student action's calls, as a declaration states them: each a served program's call through the
 * composition's own runtime, its failure the action's (`StudentCallFailed`), named by the call and
 * rendered by Effect.
 *
 * @module
 */
import type { RelationCounts, WriteOutcome } from "@bjornpagen/grizzle/client";
import { Cause, Effect } from "effect";
import { StudentCallFailed } from "#plan-budget/actions.ts";

/**
 * A call's every way to fail, as the action's failure: the call and Effect's rendering of the
 * cause.
 *
 * @param call - The call.
 * @returns The cause's mapping.
 */
const failedAs =
  (call: string) =>
  <E>(cause: Cause.Cause<E>): StudentCallFailed =>
    StudentCallFailed.make({ call, outcome: Cause.pretty(cause).slice(0, 400) });

/**
 * A read: its answer, or the action's failure.
 *
 * @param call - The program's name.
 * @param effect - The call.
 * @returns The call's answer.
 */
export const read = <A, E, R>(call: string, effect: Effect.Effect<A, E, R>) =>
  Effect.mapError(Effect.sandbox(effect), failedAs(call));

/**
 * A write that must be accepted: its outcome, or the action's failure, a refusal among them, and
 * `unchanged` too, a write that found its child not in the state it needs (a sitting that is not
 * there), so no action is measured over a call that wrote nothing.
 *
 * @param call - The program's name.
 * @param effect - The call.
 * @returns The write's outcome.
 */
export const accepted = <A extends { readonly kind: string }, E, R>(
  call: string,
  effect: Effect.Effect<A, E, R>,
) =>
  Effect.filterOrFail(
    read(call, effect),
    (outcome) => outcome.kind === "accepted",
    (outcome) => StudentCallFailed.make({ call, outcome: outcome.kind }),
  );

/**
 * A write that must be accepted, or stand unchanged where its facts are already held: content a run
 * before published, whose closed facts the installation holds.
 *
 * @param call - The program's name.
 * @param effect - The call.
 * @returns The write's outcome.
 */
export const acceptedOrHeld = <A extends { readonly kind: string }, E, R>(
  call: string,
  effect: Effect.Effect<A, E, R>,
) =>
  Effect.filterOrFail(
    read(call, effect),
    (outcome) => outcome.kind === "accepted" || outcome.kind === "unchanged",
    (outcome) => StudentCallFailed.make({ call, outcome: outcome.kind }),
  );

/**
 * The counts of a write's outcome, as its failure states them.
 *
 * @param counts - The outcome's counts.
 * @returns Each relation's added, put and deleted rows.
 */
const countsText = (counts: readonly RelationCounts[]): string =>
  counts.length === 0
    ? "none"
    : counts
        .map(
          ({ added, deleted, put, relation }) =>
            `${relation} +${String(added)} ~${String(put)} -${String(deleted)}`,
        )
        .join(", ");

/**
 * A write accepted with its effect: a row of `relation` added or put, the fact the write exists to
 * state (an answer's attempt, a take's sitting). Any other outcome is the action's failure:
 * `unchanged`, and an acceptance that wrote other rows but none of `relation`, so a measured write
 * is one that did what its action names.
 *
 * @param call - The program's name.
 * @param relation - The relation the write must add a row of or put one in, as its counts name it.
 * @param effect - The call.
 * @returns The write's outcome.
 */
export const wrote = <Reads, E, R>(
  call: string,
  relation: string,
  effect: Effect.Effect<WriteOutcome<Reads>, E, R>,
) =>
  Effect.flatMap(read(call, effect), (outcome) =>
    outcome.kind === "accepted" &&
    outcome.counts.some((count) => count.relation === relation && count.added + count.put > 0n)
      ? Effect.succeed(outcome)
      : Effect.fail(
          StudentCallFailed.make({
            call,
            outcome:
              outcome.kind === "accepted"
                ? `accepted with no row of ${relation} (counts ${countsText(outcome.counts)})`
                : outcome.kind,
          }),
        ),
  );

/**
 * A database handle opened, its calls `f`'s: the handle's opening failure the action's.
 *
 * @param open - The handle's opening (`Db.open(role, …)`).
 * @param f - The calls.
 * @returns What `f` answers.
 */
export const opened = <D, A, E, R1, R2>(
  open: Effect.Effect<D, E, R1>,
  f: (db: D) => Effect.Effect<A, StudentCallFailed, R2>,
) => Effect.flatMap(read("Db.open", open), f);
