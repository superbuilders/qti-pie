/**
 * The first check over a whole composition: every action of every login its migrations serve,
 * measured by {@link measurePlans} in a fresh backend each, and judged by the planner-memory
 * ceiling.
 *
 * @module
 */
import { appendFileSync } from "node:fs";
import { Effect } from "effect";
import { loadNow } from "#plan-budget/backend.ts";
import { MeasureFailed, measurePlans } from "#plan-budget/plans.ts";
import type { ActionPlans, Connections } from "#plan-budget/plans.ts";
import {
  actionsOf,
  captureBodiesQuery,
  deltaTablesOf,
  judgeBlocksOf,
  judgeBodiesQuery,
  loginsIn,
} from "#plan-budget/served.ts";
import type { ServedAction } from "#plan-budget/served.ts";

/**
 * Kilobytes in a megabyte, as EXPLAIN's MEMORY counts them.
 */
const kbPerMb = 1024;

/**
 * An action's verdict under the first check: within the bar, over it by its plans' memory or by the
 * watchdog's cancellation, or refused by PostgreSQL at a step.
 */
export type MemoryVerdict = "memory" | "overBudget" | "pass" | "refused";

/**
 * One action's record: its measurement and the sums the verdict reads.
 */
export interface MemoryRecord {
  readonly action: string;
  readonly verdict: MemoryVerdict;
  readonly ceilingKb: number;
  readonly budgetMs: number;
  readonly statements: number;
  readonly judges: number;
  readonly run: number;
  readonly coldKb: number;
  readonly peakKb: number;
  readonly coldCpuMs: number;
  readonly coldMs: number;
  readonly warmMs: number;
  readonly load: number;
  readonly measured: ActionPlans;
}

/**
 * What a run of the first check reads: the composition's migrations and the logins it measures, the
 * bar, the ceiling, and where it writes each action's record.
 */
export interface MemoryRun {
  readonly migrations: string;
  readonly logins: readonly string[] | undefined;
  readonly budgetMs: number;
  readonly ceilingKb: number;
  readonly out: string | undefined;
}

/**
 * An action's verdict from its measurement.
 *
 * @param measured - Its plans.
 * @param coldKb - Its cold plans' memory, summed.
 * @param ceilingKb - The ceiling.
 * @returns The verdict.
 */
const verdictOf = (measured: ActionPlans, coldKb: number, ceilingKb: number): MemoryVerdict => {
  if (measured.stopped !== undefined) {
    return measured.stopped.kind;
  }

  return coldKb > ceilingKb ? "memory" : "pass";
};

/**
 * One action's record from its measurement.
 *
 * @param served - The action.
 * @param measured - Its measurement.
 * @param run - The run's settings.
 * @returns Its record.
 */
export const memoryRecordOf = (
  served: ServedAction,
  measured: ActionPlans,
  run: MemoryRun,
): MemoryRecord => {
  const coldKb = measured.plans.reduce((sum, { cold }) => sum + cold.usedKb, 0);

  return {
    action: served.action,
    budgetMs: run.budgetMs,
    ceilingKb: run.ceilingKb,
    coldCpuMs: measured.plans.reduce((sum, { cold }) => sum + cold.cpuMs, 0),
    coldKb,
    coldMs: measured.plans.reduce((sum, { cold }) => sum + cold.ms, 0),
    judges: served.judges,
    load: loadNow(),
    measured,
    peakKb: Math.max(0, ...measured.plans.map(({ cold }) => cold.usedKb)),
    run: served.steps.filter(({ kind }) => kind === "run").length,
    statements: served.statements,
    verdict: verdictOf(measured, coldKb, run.ceilingKb),
    warmMs: measured.plans.reduce((sum, { warm }) => sum + warm.ms, 0),
  };
};

/**
 * One line of the run's text output for an action.
 *
 * @param record - The action's record.
 * @returns The line.
 */
export const memoryLineOf = (record: MemoryRecord): string => {
  const head = record.verdict === "pass" ? "pass" : "FAIL";
  const stop =
    record.measured.stopped === undefined
      ? ""
      : ` ${record.measured.stopped.kind === "overBudget" ? "OVER" : "REFUSED"} at step ${String(record.measured.stopped.step)} (${record.measured.stopped.source} ${record.measured.stopped.name.slice(0, 24)}, ${String(record.measured.stopped.bytes)} bytes)${record.measured.stopped.kind === "refused" ? `: ${record.measured.stopped.detail.slice(0, 160)}` : ""}`;

  return `${head} ${record.action}: cold planner ${(record.coldKb / kbPerMb).toFixed(1)} MB of ${(record.ceilingKb / kbPerMb).toFixed(1)} (peak ${(record.peakKb / kbPerMb).toFixed(1)}), cold CPU ${record.coldCpuMs.toFixed(1)} ms, cold ${record.coldMs.toFixed(1)} ms, warm ${record.warmMs.toFixed(1)} ms; ${String(record.statements)} statements, ${String(record.judges)} judge blocks${stop}`;
};

/**
 * Why an action fails the first check, for the backlog.
 *
 * @param record - The failing action's record.
 * @returns The reason.
 */
export const memoryReasonOf = (record: MemoryRecord): string => {
  const { stopped } = record.measured;
  const before = `${(record.coldKb / kbPerMb).toFixed(1)} MB of cold planner memory in the ${String(record.measured.plans.length)} steps before it`;

  if (stopped?.kind === "overBudget") {
    return `cold planning passed ${String(record.budgetMs)} ms of CPU at step ${String(stopped.step)} of ${String(record.statements)} statements and ${String(record.judges)} judge blocks, a ${stopped.source === "judge" ? `judge block (${stopped.name})` : `statement (${stopped.name})`} of ${stopped.bytes.toLocaleString("en-US")} bytes; ${before}`;
  }

  if (stopped?.kind === "refused") {
    return `PostgreSQL refused to plan step ${String(stopped.step)}, a ${stopped.source} of ${stopped.bytes.toLocaleString("en-US")} bytes: ${stopped.detail.slice(0, 200)}`;
  }

  return `cold planner memory ${(record.coldKb / kbPerMb).toFixed(1)} MB over the ${(record.ceilingKb / kbPerMb).toFixed(1)} MB ceiling (peak statement ${(record.peakKb / kbPerMb).toFixed(1)} MB; cold CPU ${record.coldCpuMs.toFixed(0)} ms) over ${String(record.statements)} statements and ${String(record.judges)} judge blocks`;
};

/**
 * Every action of the run's logins, measured one after another, each in a fresh backend, its record
 * appended to the run's output as it is made.
 *
 * @param connections - The measurement's connections.
 * @param run - The run's settings.
 * @returns The records.
 */
export const measureMemory = (
  connections: Connections,
  run: MemoryRun,
): Effect.Effect<readonly MemoryRecord[], MeasureFailed> =>
  Effect.gen(function* measureMemoryOf() {
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

    const logins = run.logins ?? loginsIn(run.migrations);
    const records: MemoryRecord[] = [];

    for (const login of logins) {
      for (const served of actionsOf(run.migrations, login, judges, deltaTables)) {
        const measured = yield* measurePlans(connections, served, run.budgetMs);
        const record = memoryRecordOf(served, measured, run);

        records.push(record);
        yield* Effect.logInfo(memoryLineOf(record));

        if (run.out !== undefined) {
          appendFileSync(run.out, `${JSON.stringify(record)}\n`);
        }
      }
    }

    return records;
  });
