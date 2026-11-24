/**
 * The first check: an action's cold generic plans, measured in a fresh backend of its own.
 *
 * A measurement opens one connection, begins one transaction that is rolled back, and for each step
 * of the action ({@link ServedAction}) either runs it where it stands (a statement with no plan,
 * whose objects the statements after it plan against) or sends `EXPLAIN (GENERIC_PLAN, SUMMARY,
 * MEMORY, FORMAT JSON) <statement>` twice as a simple Query: the first plan is the cold one, the
 * backend's first of that statement, which loads every catalog entry it names that no step before
 * it loaded; the second is the warm one, over the caches the first filled. A simple Query binds
 * nothing, so PostgreSQL plans the statement's placeholders as values it has none for, the generic
 * plan every grizzle session keeps (`plan_cache_mode = force_generic_plan`); through the extended
 * protocol they would become the EXPLAIN's own parameters, which the Bind must fill, and the plan
 * would be custom.
 *
 * The verdict is the planner's memory, which PostgreSQL counts exactly and which no load moves: an
 * action fails when its cold plans' memory, statements and armed judge blocks summed, passes the
 * ceiling calibrated from the 100 ms bar (#plan-budget/ceiling.ts). The pathology stop is the
 * backend's CPU, not its wall time: a watchdog reads the backend's scheduler count while each plan
 * runs and cancels it once the action's cold planning has run longer on a CPU than the bar, so a
 * plan that would take seconds costs the bar once, and the action fails at that step. A
 * statement_timeout would stop it by wall time, which on a machine at a load of hundreds cuts plans
 * that ran for a fraction of the bar.
 *
 * @module
 */
import { performance } from "node:perf_hooks";
import { Effect, Schema } from "effect";
import type pg from "pg";
import { cancelPast, cpuMsBetween, scheduledOf } from "#plan-budget/backend.ts";
import type { Scheduled } from "#plan-budget/backend.ts";
import {
  actionsOf,
  captureBodiesQuery,
  deltaTablesOf,
  judgeBlocksOf,
  judgeBodiesQuery,
} from "#plan-budget/served.ts";
import type { ActionStep, ServedAction } from "#plan-budget/served.ts";

/**
 * How often the watchdog reads a planning backend's CPU: the cancellation lands at most this late
 * past the bar, plus the cancel's own round trip, so a cancelled plan costs the bar and a few
 * milliseconds.
 *
 * @limitKind provisional
 * @owner the planning budget's watchdog (#plan-budget/plans.ts)
 * @unit milliseconds
 * @scope each planning request of a measured action, while it runs
 * @guards a plan that runs seconds or minutes past the bar, which the measurement would otherwise wait out
 * @measure the overshoot of cancelled plans past the bar (their CPU at cancellation less the bar), kept a small share
 *   of it
 * @origin set when the watchdog replaced the statement_timeout, 2026-11-23, with no evidence
 * @recorded 2026-11-23
 */
const watchEveryMs = 2;

/**
 * PostgreSQL's SQLSTATE for a statement cancelled on request: the watchdog's pg_cancel_backend.
 */
const queryCanceled = "57014";

/**
 * One planning, as its EXPLAIN reports it and its backend's scheduler counted it.
 */
export interface Planning {
  /**
   * The planning's time as PostgreSQL reports it ("Planning Time"), wall time inside the backend.
   */
  readonly ms: number;
  /**
   * The backend's on-CPU milliseconds over the whole request: parse, analysis, planning and the
   * answer.
   */
  readonly cpuMs: number;
  /**
   * The planner's memory used ("Memory Used"), in kilobytes.
   */
  readonly usedKb: number;
  /**
   * The planner's memory allocated ("Memory Allocated"), in kilobytes.
   */
  readonly allocatedKb: number;
  /**
   * The plan's estimated total cost.
   */
  readonly cost: number;
}

/**
 * A planned step: its source, name and size, and its cold and warm plannings.
 */
export interface PlannedStep {
  readonly source: ActionStep["source"];
  readonly name: string;
  readonly bytes: number;
  readonly cold: Planning;
  readonly warm: Planning;
}

/**
 * Where an action stopped: the step the watchdog cancelled, or one PostgreSQL refused to plan.
 */
export interface Stopped {
  readonly kind: "overBudget" | "refused";
  readonly step: number;
  readonly source: ActionStep["source"];
  readonly name: string;
  readonly bytes: number;
  readonly detail: string;
}

/**
 * One action's measurement: every step planned before it stopped, if it did.
 */
export interface ActionPlans {
  readonly action: string;
  readonly plans: readonly PlannedStep[];
  readonly stopped: Stopped | undefined;
  readonly wallMs: number;
}

/**
 * A connection's refusal outside a plan request: the connection itself, BEGIN, a run step, or the
 * watchdog's cancel.
 */
export class MeasureFailed extends Schema.TaggedError<MeasureFailed>()("MeasureFailed", {
  action: Schema.String,
  at: Schema.String,
  cause: Schema.Unknown,
}) {
  /**
   * The action and what failed.
   */
  override get message(): string {
    return `Measuring ${this.action} failed at ${this.at}: ${String(this.cause)}`;
  }
}

/**
 * One EXPLAIN (GENERIC_PLAN, SUMMARY, MEMORY, FORMAT JSON) answer's one cell, as PostgreSQL writes
 * it.
 */
interface GenericAnswer {
  readonly "Planning Time": number;
  readonly Planning: { readonly "Memory Used": number; readonly "Memory Allocated": number };
  readonly Plan: { readonly "Total Cost": number };
}

/**
 * The connections a measurement makes: a fresh client of the scratch database for each action, and
 * one watcher on which the watchdog cancels.
 */
export interface Connections {
  readonly fresh: () => pg.Client;
  readonly watcher: pg.Client;
}

/**
 * The request that plans a statement generically and reports the planning.
 *
 * @param sql - The statement.
 * @returns The request.
 */
const explainOf = (sql: string): string =>
  `EXPLAIN (GENERIC_PLAN, SUMMARY, MEMORY, FORMAT JSON) ${sql}`;

/**
 * Whether an error is PostgreSQL's cancellation on request.
 *
 * @param cause - The driver's error.
 * @returns True for 57014.
 */
const isCanceled = (cause: unknown): cause is { readonly code: string } =>
  typeof cause === "object" && cause !== null && "code" in cause && cause.code === queryCanceled;

/**
 * One planning request on the action's backend, watched: the watchdog cancels it once the backend
 * has run `limitMs` on a CPU since the request was sent.
 *
 * @param connections - The measurement's connections.
 * @param client - The action's client.
 * @param pid - Its backend.
 * @param sql - The statement.
 * @param limitMs - The CPU the request may reach.
 * @returns The planning, or the driver's refusal (a cancellation among them).
 */
const planOnce = (
  connections: Connections,
  client: pg.Client,
  pid: number,
  sql: string,
  limitMs: number,
): Effect.Effect<Planning, { readonly cause: unknown }> =>
  Effect.gen(function* planOnceAt() {
    const before: Scheduled = scheduledOf(pid);
    let cancelled = false;
    const watch = setInterval(() => {
      if (!cancelled && cancelPast(connections.watcher, pid, before, limitMs) !== undefined) {
        cancelled = true;
      }
    }, watchEveryMs);
    const answered = yield* Effect.tryPromise({
      catch: (cause) => ({ cause }),
      try: () => client.query<{ readonly "QUERY PLAN": readonly GenericAnswer[] }>(explainOf(sql)),
    }).pipe(
      Effect.ensuring(
        Effect.sync(() => {
          clearInterval(watch);
        }),
      ),
    );
    const after = scheduledOf(pid);
    const answer = yield* Effect.orDie(Effect.fromNullishOr(answered.rows[0]?.["QUERY PLAN"][0]));

    return {
      allocatedKb: answer.Planning["Memory Allocated"],
      cost: answer.Plan["Total Cost"],
      cpuMs: cpuMsBetween(before, after),
      ms: answer["Planning Time"],
      usedKb: answer.Planning["Memory Used"],
    };
  });

/**
 * One action measured in a fresh backend of its own (see the module's header): each step planned
 * cold then warm, or run, in one transaction rolled back, the watchdog holding the action's cold
 * planning to `budgetMs` of CPU.
 *
 * @param connections - The measurement's connections.
 * @param served - The action.
 * @param budgetMs - The bar, in milliseconds of the backend's CPU.
 * @returns Its plans and where it stopped; a failure outside a plan request fails as
 *   {@link MeasureFailed}.
 */
export const measurePlans = (
  connections: Connections,
  served: ServedAction,
  budgetMs: number,
): Effect.Effect<ActionPlans, MeasureFailed> =>
  Effect.acquireUseRelease(
    Effect.gen(function* connectAt() {
      const client = connections.fresh();

      yield* Effect.tryPromise({
        catch: (cause) => new MeasureFailed({ action: served.action, at: "connect", cause }),
        try: () => client.connect(),
      });

      return client;
    }),
    (client) =>
      Effect.gen(function* measureAt() {
        const fail = (at: string) => (cause: unknown) =>
          new MeasureFailed({ action: served.action, at, cause });
        const { pid } = yield* Effect.tryPromise({
          catch: fail("pg_backend_pid"),
          try: () => client.query<{ readonly pid: number }>("SELECT pg_backend_pid() AS pid"),
        }).pipe(Effect.flatMap(({ rows }) => Effect.orDie(Effect.fromNullishOr(rows[0]))));
        const started = performance.now();

        yield* Effect.tryPromise({ catch: fail("BEGIN"), try: () => client.query("BEGIN") });

        const plans: PlannedStep[] = [];
        let coldCpuMs = 0;

        for (const [at, step] of served.steps.entries()) {
          if (step.kind === "run") {
            yield* Effect.tryPromise({
              catch: fail(`run step ${String(at)}`),
              try: () => client.query(step.sql),
            });
          } else {
            const planned = yield* Effect.result(
              Effect.all([
                planOnce(connections, client, pid, step.sql, budgetMs - coldCpuMs),
                planOnce(connections, client, pid, step.sql, budgetMs),
              ]),
            );

            if (planned._tag === "Failure") {
              const { cause } = planned.failure;

              return {
                action: served.action,
                plans,
                stopped: {
                  bytes: step.bytes,
                  detail: isCanceled(cause)
                    ? `cold planning passed ${String(budgetMs)} ms of CPU`
                    : String(cause),
                  kind: isCanceled(cause) ? "overBudget" : "refused",
                  name: step.name,
                  source: step.source,
                  step: at,
                },
                wallMs: performance.now() - started,
              } satisfies ActionPlans;
            }

            const [cold, warm] = planned.success;

            coldCpuMs += cold.cpuMs;
            plans.push({ bytes: step.bytes, cold, name: step.name, source: step.source, warm });
          }
        }

        return {
          action: served.action,
          plans,
          stopped: undefined,
          wallMs: performance.now() - started,
        } satisfies ActionPlans;
      }),
    (client) =>
      Effect.andThen(
        Effect.ignore(Effect.tryPromise(() => client.query("ROLLBACK"))),
        Effect.promise(() => client.end()),
      ),
  );

/**
 * Every served program of an installation: each program of each role of each named login its
 * migrations serve, with the judge blocks its writes arm, the installation's judge and capture
 * functions read from its catalog on the watcher's session. Every check of every program reads its
 * programs here, so none is left out.
 *
 * @param connections - The measurement's connections.
 * @param migrations - The schema's migrations directory.
 * @param logins - The logins, by their served files' names (`loginsIn` for every one).
 * @returns The programs, login by login, each in its served file's order.
 */
export const installedActions = (
  connections: Connections,
  migrations: string,
  logins: readonly string[],
): Effect.Effect<readonly ServedAction[], MeasureFailed> =>
  Effect.gen(function* installedActionsOf() {
    const bodies = yield* Effect.tryPromise({
      catch: (cause) =>
        new MeasureFailed({ action: "the installation's judge functions", at: "pg_proc", cause }),
      try: () =>
        connections.watcher.query<{ readonly name: string; readonly body: string }>(
          judgeBodiesQuery,
        ),
    });
    const judges = bodies.rows.flatMap(({ body, name }) => judgeBlocksOf(name, body));
    const captures = yield* Effect.tryPromise({
      catch: (cause) =>
        new MeasureFailed({ action: "the installation's capture functions", at: "pg_proc", cause }),
      try: () => connections.watcher.query<{ readonly body: string }>(captureBodiesQuery),
    });
    const deltaTables = new Map(captures.rows.flatMap(({ body }) => [...deltaTablesOf(body)]));

    yield* Effect.logInfo(
      `${String(judges.length)} judge blocks in ${String(bodies.rows.length)} judge functions`,
    );

    return logins.flatMap((login) => actionsOf(migrations, login, judges, deltaTables));
  });
