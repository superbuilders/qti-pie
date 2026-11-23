/**
 * The lanes' shared backlog: each composition's failing actions under both checks, as its newest
 * run found them, written as one Markdown file the writer lanes read (edullm's
 * `out/rc-cutover/plan-budget-backlog.md`). Each run of a check leaves its composition's summary in
 * the summaries folder; the backlog is every summary there, rewritten whole on every run, so it
 * always holds each composition's newest list.
 *
 * @module
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Schema } from "effect";

/**
 * One check's summary of a composition's run: the composition, the check, what was measured (the
 * tree, its pins and the installation's data), when, at what load, how many actions, and the
 * failing ones.
 */
const CheckSummarySchema = Schema.Struct({
  at: Schema.String,
  check: Schema.Literals(["actions", "memory"]),
  composition: Schema.String,
  failing: Schema.Array(Schema.Struct({ action: Schema.String, reason: Schema.String })),
  load: Schema.Number,
  measured: Schema.Number,
  subject: Schema.String,
});

/**
 * One check's summary of a composition's run.
 */
export type CheckSummary = typeof CheckSummarySchema.Type;

/**
 * A summary file's text, decoded.
 */
const summaryOf = Schema.decodeUnknownSync(Schema.fromJsonString(CheckSummarySchema));

/**
 * A check's summary, kept for the backlog.
 *
 * @param folder - The summaries folder.
 * @param summary - The summary.
 */
export const keepSummary = (folder: string, summary: CheckSummary): void => {
  mkdirSync(folder, { recursive: true });
  writeFileSync(
    path.join(folder, `${summary.composition}.${summary.check}.json`),
    `${JSON.stringify(summary, undefined, 2)}\n`,
  );
};

/**
 * The backlog from every kept summary, written whole.
 *
 * @param folder - The summaries folder.
 * @param file - The backlog's Markdown file.
 */
export const writeBacklog = (folder: string, file: string): void => {
  const summaries = readdirSync(folder)
    .filter((name) => name.endsWith(".json"))
    .toSorted()
    .map((name) => summaryOf(readFileSync(path.join(folder, name), "utf-8")));
  const sections = Map.groupBy(summaries, ({ composition }) => composition);
  const lines = [
    "# The planning budget's backlog",
    "",
    "Written by `@qti-pie/plan-budget` on every run: each composition's actions that fail the planning budget today,",
    "by check. The bar is 100 ms of database time per student action from a fresh connection, and 10 ms warm for the",
    "presence beacon. Check 1 holds every action's cold generic plans (statements and the commit-time judge blocks",
    "its writes arm) to the planner-memory ceiling calibrated from that bar, and stops a plan whose CPU passes it.",
    "Check 2 times each student action on a fresh connection at 1x, 10x and 100x data, and fails it over its bar or",
    "when the pages it touches grow with the data beyond the child's own rows. This list is the backlog D2, D4, D5,",
    "C1 and the writer lanes empty.",
    "",
  ];

  for (const [composition, checks] of sections) {
    lines.push(`## ${composition}`, "");

    for (const summary of checks.toSorted((a, b) => (a.check < b.check ? 1 : -1))) {
      const name =
        summary.check === "memory" ? "Check 1, planner memory" : "Check 2, student actions timed";

      lines.push(
        `### ${name}: ${String(summary.failing.length)} of ${String(summary.measured)} fail`,
        "",
        `${summary.subject}; run ${summary.at}, load ${summary.load.toFixed(0)}.`,
        "",
        ...summary.failing.map(({ action, reason }) => `- \`${action}\`: ${reason}`),
        "",
      );
    }
  }

  writeFileSync(file, lines.join("\n"));
};
