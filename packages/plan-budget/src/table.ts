/**
 * The first check's records as one table a reader works from: a row for every planned step of every
 * action, its statement's prepared name or its judge block's name, its size, and its cold and warm
 * plannings (planner memory, the backend's CPU and PostgreSQL's planning time), with the action's
 * verdict and, where the watchdog or PostgreSQL stopped the action, a row for the step it stopped
 * at.
 *
 * @module
 */
import { readFileSync, writeFileSync } from "node:fs";
import { Schema } from "effect";

/**
 * One planning, as a record holds it.
 */
const PlanningSchema = Schema.Struct({
  cpuMs: Schema.Number,
  ms: Schema.Number,
  usedKb: Schema.Number,
});

/**
 * What the table reads of a first check's record.
 */
const RecordSchema = Schema.Struct({
  action: Schema.String,
  load: Schema.Number,
  measured: Schema.Struct({
    plans: Schema.Array(
      Schema.Struct({
        bytes: Schema.Number,
        cold: PlanningSchema,
        name: Schema.String,
        source: Schema.String,
        warm: PlanningSchema,
      }),
    ),
    stopped: Schema.optional(
      Schema.Struct({
        bytes: Schema.Number,
        detail: Schema.String,
        kind: Schema.String,
        name: Schema.String,
        source: Schema.String,
        step: Schema.Number,
      }),
    ),
  }),
  verdict: Schema.String,
});

/**
 * A record's line, decoded.
 */
const recordOf = Schema.decodeUnknownSync(Schema.fromJsonString(RecordSchema));

/**
 * Kilobytes in a megabyte, as EXPLAIN's MEMORY counts them.
 */
const kbPerMb = 1024;

/**
 * The table's columns, in order.
 */
const columns = [
  "action",
  "verdict",
  "step",
  "source",
  "name",
  "bytes",
  "cold_mb",
  "cold_cpu_ms",
  "cold_ms",
  "warm_mb",
  "warm_cpu_ms",
  "warm_ms",
  "stopped",
  "load",
];

/**
 * The table of a run's records, written as tab-separated values.
 *
 * @param records - The run's record file, one JSON line an action.
 * @param out - The table's file.
 * @returns The rows written.
 */
export const writePlanTable = (records: string, out: string): number => {
  const rows = [columns.join("\t")];

  for (const line of readFileSync(records, "utf-8").split("\n")) {
    if (line.trim() !== "") {
      const record = recordOf(line);
      const load = record.load.toFixed(0);

      for (const [at, plan] of record.measured.plans.entries()) {
        rows.push(
          [
            record.action,
            record.verdict,
            String(at),
            plan.source,
            plan.name,
            String(plan.bytes),
            (plan.cold.usedKb / kbPerMb).toFixed(3),
            plan.cold.cpuMs.toFixed(2),
            plan.cold.ms.toFixed(2),
            (plan.warm.usedKb / kbPerMb).toFixed(3),
            plan.warm.cpuMs.toFixed(2),
            plan.warm.ms.toFixed(2),
            "",
            load,
          ].join("\t"),
        );
      }

      const { stopped } = record.measured;

      if (stopped !== undefined) {
        rows.push(
          [
            record.action,
            record.verdict,
            `stop at ${String(stopped.step)}`,
            stopped.source,
            stopped.name,
            String(stopped.bytes),
            "",
            "",
            "",
            "",
            "",
            "",
            `${stopped.kind}: ${stopped.detail.replaceAll(/\s+/gu, " ").slice(0, 200)}`,
            load,
          ].join("\t"),
        );
      }
    }
  }

  writeFileSync(out, `${rows.join("\n")}\n`);

  return rows.length - 1;
};
