/**
 * The second check: each student action, timed on a fresh connection.
 *
 * A consumer declares its composition's student actions ({@link StudentAction}): the calls one
 * child's action makes through the composition's own login, as its application makes them, and the
 * calls that ready a fresh child for it. The measurement readies the child on a connection of its
 * own, which it then closes, and runs the action on a new layer whose pool holds one session, so
 * the action is the first thing its backend does: its catalog caches are cold and its generic plans
 * are made by its own statements, as a child's first action on a fresh connection makes them.
 *
 * What it reads, every number the server's own:
 *
 * - **Database time**, the verdict: the action's backend's on-CPU time from its fork to the action's
 *   end, read from the scheduler (`/proc/<pid>/schedstat`), which leaves out the time the backend
 *   waited on a run queue, so the machine's other jobs move it far less than its wall time. It
 *   counts the connection's own start (its TLS, its sign-in, its session's settings): a fresh
 *   connection is the action's to pay for.
 * - **Pages touched**, the growth's measure: every buffer the action's statements hit or read, shared
 *   and local (pg_stat_statements' top-level statements of the database, the deferred judge's parts
 *   among them, before and after), an exact count no load moves.
 * - **Waits**, beside them: the backend's wait events sampled while the action runs (Lock, LWLock, IO
 *   and the rest), which on one client should be none but the client's own reads; a lock on the
 *   child's own unit would show here.
 * - The wall time, and pg_stat_statements' planning and execution times, for reading beside the CPU.
 *
 * @module
 */
import { performance } from "node:perf_hooks";
import { Effect, Layer, Schema } from "effect";
import type pg from "pg";
import { cpuMsBetween, loadNow, queuedMsBetween, scheduledOf } from "#plan-budget/backend.ts";

/**
 * How often the wait sampler reads the action's backend's wait event.
 *
 * @limitKind provisional
 * @owner the planning budget's second check (#plan-budget/actions.ts)
 * @unit milliseconds
 * @scope each measured action, while it runs
 * @guards a wait shorter than the period, which the sampler may miss
 * @measure the shortest lock wait a child's action meets under the borrow model, and keep the period below it
 * @origin set with the sampler, 2026-11-23, with no evidence
 * @recorded 2026-11-23
 */
const sampleEveryMs = 1;

/**
 * One student action of a composition: its name, the calls that ready a fresh child for it, and the
 * action's own; its bar where it is tighter than the general one, and whether it is measured warm:
 * on a connection that already made it once, as a call the browser repeats (the presence beacon) is
 * made, where every other action is measured cold, the first thing its connection does.
 */
export interface StudentAction<R> {
  readonly name: string;
  readonly prepare: (child: string) => Effect.Effect<void, StudentCallFailed, R>;
  readonly act: (child: string) => Effect.Effect<void, StudentCallFailed, R>;
  readonly barMs: number;
  readonly warm: boolean;
}

/**
 * A call a student action or its preparation made that its login refused, or that failed.
 */
export class StudentCallFailed extends Schema.TaggedError<StudentCallFailed>()(
  "StudentCallFailed",
  {
    call: Schema.String,
    outcome: Schema.String,
  },
) {
  /**
   * The call and its outcome.
   */
  override get message(): string {
    return `${this.call} was not accepted: ${this.outcome}`;
  }
}

/**
 * A measurement's failure outside the action's calls: the server's statistics or its process could
 * not be read.
 */
export class ActionMeasureFailed extends Schema.TaggedError<ActionMeasureFailed>()(
  "ActionMeasureFailed",
  {
    action: Schema.String,
    cause: Schema.Unknown,
  },
) {
  /**
   * The action and the cause.
   */
  override get message(): string {
    return `Measuring the student action ${this.action} failed: ${String(this.cause)}`;
  }
}

/**
 * What the second check measures in: the composition's login layer, made fresh for each connection,
 * the PostgreSQL role its sessions sign in as, by which its backend is found, and the statistics
 * session.
 */
export interface ActionsSubject<R, E> {
  readonly layer: () => Layer.Layer<R, E>;
  readonly loginRole: string;
  readonly database: string;
  /**
   * A superuser's session on the cluster's maintenance database, where pg_stat_statements' view
   * reads every database.
   */
  readonly statistics: pg.Client;
}

/**
 * Pg_stat_statements' sums over a database's top-level statements.
 */
interface StatementSums {
  readonly calls: number;
  readonly pages: number;
  readonly planMs: number;
  readonly execMs: number;
}

/**
 * One student action's measurement at one population.
 */
export interface ActionRecord {
  readonly action: string;
  readonly scale: string;
  readonly child: string;
  /**
   * The backend's on-CPU milliseconds over the action: from its fork to the action's end for a cold
   * action, from the warming call's end to the action's for a warm one. The verdict's database
   * time.
   */
  readonly cpuMs: number;
  /**
   * The backend's milliseconds waiting on a run queue over the same span.
   */
  readonly queuedMs: number;
  /**
   * The client's milliseconds from the first call to the last call's answer.
   */
  readonly wallMs: number;
  /**
   * Pages the action's statements hit or read, shared and local.
   */
  readonly pages: number;
  readonly statements: number;
  readonly planMs: number;
  readonly execMs: number;
  /**
   * The sampler's count of the backend's wait events while the action ran, by type.
   */
  readonly waits: Readonly<Record<string, number>>;
  readonly samples: number;
  readonly load: number;
  readonly pid: number;
}

/**
 * The sums now.
 *
 * @param statistics - The statistics session.
 * @param database - The installation's database.
 * @returns The sums.
 */
const sumsOf = (statistics: pg.Client, database: string) =>
  Effect.map(
    Effect.promise(() =>
      statistics.query<{
        readonly calls: string;
        readonly pages: string;
        readonly plan: number;
        readonly exec: number;
      }>(
        `SELECT coalesce(sum(calls), 0) AS calls,
                coalesce(sum(shared_blks_hit + shared_blks_read + local_blks_hit + local_blks_read), 0) AS pages,
                coalesce(sum(total_plan_time), 0)::float8 AS plan, coalesce(sum(total_exec_time), 0)::float8 AS exec
           FROM pg_stat_statements WHERE toplevel AND dbid = (SELECT oid FROM pg_database WHERE datname = $1)`,
        [database],
      ),
    ),
    ({ rows: [row] }): StatementSums => ({
      calls: Number(row?.calls ?? 0),
      execMs: row?.exec ?? 0,
      pages: Number(row?.pages ?? 0),
      planMs: row?.plan ?? 0,
    }),
  );

/**
 * The login role's one client backend now, if it has one.
 *
 * @param statistics - The statistics session.
 * @param role - The login's PostgreSQL role.
 * @returns Its backend's state and wait event, or none.
 */
const backendOf = async (statistics: pg.Client, role: string) => {
  const answered = await statistics.query<{
    readonly pid: number;
    readonly state: string | null;
    readonly wait: string | null;
  }>(
    "SELECT pid, state, wait_event_type AS wait FROM pg_stat_activity WHERE usename = $1 AND backend_type = 'client backend'",
    [role],
  );

  return answered.rows;
};

/**
 * One student action measured at one population (see the module's header): the child readied on a
 * connection of its own, then the action on a fresh one.
 *
 * @param subject - What it measures in.
 * @param action - The action.
 * @param scale - The population's label.
 * @param child - The fresh child, whom nothing before held.
 * @returns The action's record.
 */
export const measureAction = <R, E>(
  subject: ActionsSubject<R, E>,
  action: StudentAction<R>,
  scale: string,
  child: string,
): Effect.Effect<ActionRecord, ActionMeasureFailed | E | StudentCallFailed> =>
  Effect.gen(function* measureActionAt() {
    yield* Effect.scoped(
      Effect.flatMap(Layer.build(subject.layer()), (context) =>
        Effect.provide(action.prepare(child), context),
      ),
    );

    return yield* Effect.scoped(
      Effect.gen(function* measuredAt() {
        const context = yield* Layer.build(subject.layer());

        if (action.warm) {
          yield* Effect.provide(action.act(child), context);
        }

        const warmed = action.warm
          ? yield* Effect.promise(() => backendOf(subject.statistics, subject.loginRole))
          : [];
        const from =
          warmed[0] === undefined ? { cpuNs: 0, queuedNs: 0 } : scheduledOf(warmed[0].pid);
        const before = yield* sumsOf(subject.statistics, subject.database);
        const waits = new Map<string, number>();
        let samples = 0;
        let sampling = false;
        const sampler = setInterval(() => {
          if (sampling) {
            return;
          }

          sampling = true;
          void backendOf(subject.statistics, subject.loginRole).then((rows) => {
            sampling = false;

            for (const { state, wait } of rows) {
              if (state === "active" || wait !== null) {
                samples += 1;
                waits.set(wait ?? "CPU", (waits.get(wait ?? "CPU") ?? 0) + 1);
              }
            }

            return rows.length;
          });
        }, sampleEveryMs);
        const started = performance.now();

        yield* Effect.provide(action.act(child), context).pipe(
          Effect.ensuring(
            Effect.sync(() => {
              clearInterval(sampler);
            }),
          ),
        );

        const wallMs = performance.now() - started;
        const backends = yield* Effect.promise(() =>
          backendOf(subject.statistics, subject.loginRole),
        );
        const [backend] = backends;

        if (backend === undefined || backends.length > 1) {
          return yield* Effect.fail(
            new ActionMeasureFailed({
              action: action.name,
              cause: `the login role ${subject.loginRole} holds ${String(backends.length)} backends, where the action's pool of one holds one`,
            }),
          );
        }

        const scheduled = scheduledOf(backend.pid);
        const after = yield* sumsOf(subject.statistics, subject.database);

        return {
          action: action.name,
          child,
          cpuMs: cpuMsBetween(from, scheduled),
          execMs: after.execMs - before.execMs,
          load: loadNow(),
          pages: after.pages - before.pages,
          pid: backend.pid,
          planMs: after.planMs - before.planMs,
          queuedMs: queuedMsBetween(from, scheduled),
          samples,
          scale,
          statements: after.calls - before.calls,
          waits: Object.fromEntries(waits),
          wallMs,
        } satisfies ActionRecord;
      }),
    );
  });
