#!/usr/bin/env -S node --disable-proto=delete --disable-sigusr1
/**
 * The planning budget's command line, run from the package whose composition it measures:
 *
 * - `install --config <grizzle config> [--env NAME=value]… [--extension <name>@<schema>]…
 *   [--grizzle-sets-generic-plans]`: a fresh scratch installation of the config's committed
 *   migrations (#plan-budget/install.ts), each extension made by the superuser first.
 * - `memory --migrations <folder> [--login <login>]… [--watch-ms <ms>] [--out <records.jsonl>]`: the
 *   first check over every action of the composition (#plan-budget/memory.ts), each action's record
 *   as a JSON line and its verdict line on standard output; exits 1 when any action fails.
 * - `table --record <records.jsonl> --out <plans.tsv>`: the first check's records as one table, a row
 *   for every planned step of every action (#plan-budget/table.ts).
 * - `calibrate --record <records.jsonl>… --out <calibration.json>`: the ceiling's calibration from
 *   the first check's records of runs on a cluster no other client used
 *   (#plan-budget/calibrate.ts).
 *
 * Every command reads the scratch cluster from `PLAN_BUDGET_SOCKET` (its socket folder),
 * `PLAN_BUDGET_PORT` and `PLAN_BUDGET_DATABASE`, the superuser from the account, and the CA from
 * `PGSSLROOTCERT`. With `--composition`, `--subject` and `--summaries`, `memory` keeps the run's
 * summary, and with `--backlog` it rewrites the lanes' shared backlog from every kept summary
 * (#plan-budget/report.ts).
 *
 * @module
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import { Effect, Schema } from "effect";
import { Client } from "pg";
import { loadNow } from "#plan-budget/backend.ts";
import { calibrationOf } from "#plan-budget/calibrate.ts";
import { ceilingKb } from "#plan-budget/ceiling.ts";
import { installFresh } from "#plan-budget/install.ts";
import { measureMemory, memoryReasonOf } from "#plan-budget/memory.ts";
import type { Connections } from "#plan-budget/plans.ts";
import { keepSummary, writeBacklog } from "#plan-budget/report.ts";
import { verdictOf } from "#plan-budget/run-actions.ts";
import { writePlanTable } from "#plan-budget/table.ts";

/**
 * The bar: a student action's database time, in milliseconds (Bjorn, approved 2026-11-23).
 *
 * @limitKind product
 * @owner Bjorn's planning budget (out/rc-cutover/PLAN.md, "The planning budget is a test")
 * @unit milliseconds of database time
 * @scope one student action, from a fresh connection, on realistic data
 * @constraint the bar every check judges by
 * @source out/rc-cutover/PLAN.md: "100 ms of database time per student action, from a fresh connection"
 * @verified 2026-11-23
 */
export const budgetMs = 100;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    backlog: { type: "string" },
    bar: { multiple: true, type: "string" },
    "ceiling-kb": { type: "string" },
    composition: { type: "string" },
    conditions: { type: "string" },
    config: { type: "string" },
    env: { multiple: true, type: "string" },
    extension: { multiple: true, type: "string" },
    "grizzle-sets-generic-plans": { type: "boolean" },
    login: { multiple: true, type: "string" },
    migrations: { type: "string" },
    out: { type: "string" },
    record: { multiple: true, type: "string" },
    subject: { type: "string" },
    summaries: { type: "string" },
    "watch-ms": { type: "string" },
  },
});

const socket =
  process.env["PLAN_BUDGET_SOCKET"] ??
  path.join(process.env["XDG_RUNTIME_DIR"] ?? "", "postgresql-edullm-planbudget");

const port = Number(process.env["PLAN_BUDGET_PORT"] ?? "5493");

const database = process.env["PLAN_BUDGET_DATABASE"] ?? "";

const superuser = os.userInfo().username;

/**
 * A client of the scratch database over the cluster's socket, as its superuser.
 *
 * @returns The client, not yet connected.
 */
const fresh = (): Client => new Client({ database, host: socket, port, user: superuser });

/**
 * The first check over the composition, its summary kept and the backlog rewritten where the run
 * names them.
 *
 * @param migrations - The composition's migrations folder.
 * @returns Completes once every action is measured; sets the exit code to 1 when any fails.
 */
const memory = (migrations: string) =>
  Effect.gen(function* memoryCommand() {
    const watcher = fresh();

    yield* Effect.promise(() => watcher.connect());

    const connections: Connections = { fresh, watcher };
    const records = yield* measureMemory(connections, {
      budgetMs: values["watch-ms"] === undefined ? budgetMs : Number(values["watch-ms"]),
      ceilingKb: values["ceiling-kb"] === undefined ? ceilingKb : Number(values["ceiling-kb"]),
      logins: values.login,
      migrations,
      out: values.out,
    });
    const failed = records.filter(({ verdict }) => verdict !== "pass");

    yield* Effect.promise(() => watcher.end());
    yield* Effect.logInfo(
      `${String(failed.length)} of ${String(records.length)} actions over the budget`,
    );

    if (values.summaries !== undefined && values.composition !== undefined) {
      keepSummary(values.summaries, {
        at: new Date().toISOString(),
        check: "memory",
        composition: values.composition,
        failing: failed.map((record) => ({
          action: record.action,
          reason: memoryReasonOf(record),
        })),
        load: loadNow(),
        measured: records.length,
        subject: values.subject ?? migrations,
      });

      if (values.backlog !== undefined) {
        writeBacklog(values.summaries, values.backlog);
      }
    }

    if (failed.length > 0) {
      process.exitCode = 1;
    }
  });

/**
 * A setting given as `NAME=value`.
 *
 * @param pair - The setting.
 * @returns Its name and value.
 */
const settingOf = (pair: string): readonly [string, string] => {
  const at = pair.indexOf("=");

  return [pair.slice(0, at), pair.slice(at + 1)];
};

/**
 * A fresh scratch installation of the config's migrations, from the package the command runs in.
 *
 * @param config - The grizzle config.
 * @returns Completes once every login can sign in.
 */
const install = (config: string) =>
  installFresh({
    ca: process.env["PGSSLROOTCERT"] ?? "",
    config,
    database,
    env: Object.fromEntries((values.env ?? []).map((pair) => settingOf(pair))),
    extensions: (values.extension ?? []).map((named) => {
      const [name = "", schema = "public"] = named.split("@");

      return { name, schema };
    }),
    grizzle: path.join(
      path.dirname(
        createRequire(path.join(process.cwd(), "package.json")).resolve(
          "@bjornpagen/grizzle/package.json",
        ),
      ),
      "src/cli/bin.ts",
    ),
    grizzleSetsGenericPlans: values["grizzle-sets-generic-plans"] === true,
    packageDir: process.cwd(),
    port,
    secrets: path.join(os.homedir(), ".local/var/plan-budget", database),
    socket,
    superuser,
  });

/**
 * What a verdict reads of a second check's record.
 */
const MeasuredSchema = Schema.Struct({
  action: Schema.String,
  cpuMs: Schema.Number,
  pages: Schema.Number,
  size: Schema.Number,
  waits: Schema.Record(Schema.String, Schema.Number),
  wallMs: Schema.Number,
});

/**
 * A record's line, decoded.
 */
const measuredOf = Schema.decodeUnknownSync(Schema.fromJsonString(MeasuredSchema));

/**
 * The second check's verdicts over records of one or more runs, each named action at the scales it
 * was measured at, with its bar (`<name>=<ms>`); a summary kept, and the backlog rewritten, where
 * the run names them.
 *
 * @param files - The records.
 * @param bars - The actions' bars.
 * @returns Completes once every verdict is printed.
 */
const verdicts = (files: readonly string[], bars: readonly string[]) =>
  Effect.gen(function* verdictsCommand() {
    const records = files.flatMap((file) =>
      readFileSync(file, "utf-8")
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => measuredOf(line)),
    );
    const judged = bars.map((bar) => {
      const [name, ms] = settingOf(bar);
      const scales = [
        ...new Set(records.filter(({ action }) => action === name).map(({ size }) => size)),
      ].toSorted((a, b) => a - b);

      return verdictOf({ barMs: Number(ms), name }, records, scales);
    });

    for (const verdict of judged) {
      yield* Effect.logInfo(
        `${verdict.verdict === "pass" ? "pass" : "FAIL"} ${verdict.action}: slope ${verdict.slope.toFixed(2)}; ${verdict.byScale.map(({ cpuMs, leastCpuMs, pages, scale }) => `${String(scale)}x ${cpuMs.toFixed(1)} ms (least ${leastCpuMs.toFixed(1)}) ${String(pages)} pages`).join(", ")}; ${verdict.reasons.join("; ") || "within its bar, flat"}`,
      );
    }

    if (values.summaries !== undefined && values.composition !== undefined) {
      const failed = judged.filter(({ verdict }) => verdict === "fail");

      keepSummary(values.summaries, {
        at: new Date().toISOString(),
        check: "actions",
        composition: values.composition,
        failing: failed.map(({ action, byScale, reasons, slope }) => ({
          action,
          reason: `${reasons.join("; ")} (first connection's CPU, least of the repeats, pages: ${byScale.map(({ cpuMs, leastCpuMs, pages, scale }) => `${String(scale)}x ${cpuMs.toFixed(0)} ms, ${leastCpuMs.toFixed(0)} ms, ${String(pages)} pages`).join("; ")}; slope ${slope.toFixed(2)})`,
        })),
        load: loadNow(),
        measured: judged.length,
        subject: values.subject ?? files.join(", "),
      });

      if (values.backlog !== undefined) {
        writeBacklog(values.summaries, values.backlog);
      }
    }
  });

const program = Effect.gen(function* planBudget() {
  const [command] = positionals;

  if (command === "calibrate" && values.record !== undefined && values.out !== undefined) {
    const calibration = calibrationOf(values.record, budgetMs, values.conditions ?? "unstated");

    writeFileSync(values.out, `${JSON.stringify(calibration, undefined, 2)}\n`);
    yield* Effect.logInfo(
      `ceiling ${String(calibration.ceilingKb)} kB: cold CPU = ${calibration.msAtOneMb.toFixed(2)} ms × MB^${calibration.exponent.toFixed(3)}, r2 ${calibration.r2.toFixed(3)} in log CPU, measured over fitted p05 ${calibration.residualFactor.p05.toFixed(2)} p50 ${calibration.residualFactor.p50.toFixed(2)} p95 ${calibration.residualFactor.p95.toFixed(2)} over ${String(calibration.points.length)} actions; memory unequal between runs: ${String(calibration.unequalMemory.length)}`,
    );
  } else if (command === "verdicts" && values.record !== undefined && values.bar !== undefined) {
    yield* verdicts(values.record, values.bar);
  } else if (command === "table" && values.record !== undefined && values.out !== undefined) {
    for (const record of values.record) {
      yield* Effect.logInfo(
        `${String(writePlanTable(record, values.out))} rows from ${record} into ${values.out}`,
      );
    }
  } else if (command === "memory" && values.migrations !== undefined && database !== "") {
    yield* memory(values.migrations);
  } else if (command === "install" && values.config !== undefined && database !== "") {
    yield* install(values.config);
  } else {
    yield* Effect.logError(
      "usage: main.ts install|memory|calibrate, with PLAN_BUDGET_DATABASE set (see the module's header)",
    );

    process.exitCode = 2;
  }
});

NodeRuntime.runMain(program);
