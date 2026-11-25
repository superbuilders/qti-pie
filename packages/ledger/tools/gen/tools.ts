import { spawn } from "node:child_process";
import { once } from "node:events";
import { rmSync } from "node:fs";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GeneratorTools } from "#tools/gen/generator.ts";

/**
 * The ledger package's directory, which every generator's target is relative to.
 */
export const ledgerDirectory = path.resolve(import.meta.dirname, "..", "..");

/**
 * The directory of qti-pie, where its formatter's and linter's configs are found.
 */
const qtiPieDirectory = path.resolve(ledgerDirectory, "..", "..");

/**
 * Runs a tool from qti-pie's directory, its output dropped and its errors shown. The tool is found
 * on the PATH the ledger package's scripts give (`pnpm generate`), which holds the workspace's
 * oxfmt and oxlint.
 *
 * @param command The tool.
 * @param args Its arguments.
 * @returns Its exit status, or null when a signal ended it.
 */
const run = async (command: string, args: readonly string[]): Promise<number | null> => {
  const child = spawn(command, args, {
    cwd: qtiPieDirectory,
    stdio: ["ignore", "ignore", "inherit"],
  });
  await once(child, "close");

  return child.exitCode;
};

/**
 * One pass of a tool over the text, as a file of the target's path under its own directory of
 * the run's scratch, where qti-pie's configs apply as they do to the target.
 *
 * @param scratch The run's scratch directory.
 * @param target The target's path from the ledger package.
 * @param text The text.
 * @param command The tool.
 * @param args Its arguments before the file.
 * @param accepted The exit statuses that mean the pass ran.
 * @returns The file's text after the pass.
 */
const pass = async (
  scratch: string,
  target: string,
  text: string,
  command: string,
  args: readonly string[],
  accepted: readonly number[],
): Promise<string> => {
  const stage = path.join(await mkdtemp(path.join(scratch, "pass-")), target);
  await mkdir(path.dirname(stage), { recursive: true });
  await writeFile(stage, text);
  const status = await run(command, [...args, stage]);
  if (status === null || !accepted.includes(status)) {
    throw new Error(`${command} ${args.join(" ")} ended with ${String(status)} over ${target}`);
  }

  return await readFile(stage, "utf-8");
};

/**
 * The tools a generator of `target` is handed, each pass over its own stage file in `scratch`.
 *
 * @param scratch The run's scratch directory.
 * @param target The target's path from the ledger package.
 * @returns The tools.
 */
export const toolsFor = (scratch: string, target: string): GeneratorTools => ({
  format: (text) => pass(scratch, target, text, "oxfmt", ["--config", ".oxfmtrc.json"], [0]),
  /**
   * Oxlint ends with 1 when findings remain after its fixes, which a generator leaves as they are.
   */
  lintFix: (text) =>
    pass(
      scratch,
      target,
      text,
      "oxlint",
      ["--disable-nested-config", "--fix", "--fix-suggestions"],
      [0, 1],
    ),
});

/**
 * Makes the run's scratch directory in the ledger package's git-ignored `work/`, removed when
 * the process exits, however it exits.
 *
 * @returns The directory.
 */
export const scratchDirectory = async (): Promise<string> => {
  const work = path.join(ledgerDirectory, "work");
  await mkdir(work, { recursive: true });
  const scratch = await mkdtemp(path.join(work, "gen-"));
  process.once("exit", () => {
    rmSync(scratch, { force: true, recursive: true });
  });

  return scratch;
};
