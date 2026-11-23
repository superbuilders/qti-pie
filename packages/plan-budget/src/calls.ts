/**
 * A student action's calls, as a declaration states them: each a served program's call through the
 * composition's own runtime, its failure the action's (`StudentCallFailed`), named by the call and
 * rendered by Effect.
 *
 * @module
 */
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
 * A write that must be accepted, or stand unchanged where its facts are already held: its outcome,
 * or the action's failure, a refusal among them.
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
    (outcome) => outcome.kind === "accepted" || outcome.kind === "unchanged",
    (outcome) => StudentCallFailed.make({ call, outcome: outcome.kind }),
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
