/**
 * Test support for a property's kills: each a bug planted in a mutant copy of plate, run as a
 * program of its own, so the mutant is a whole program and the test's own modules stay plate's,
 * with no module mocked.
 *
 * A kill copies plate's sources into a scratch folder of the package's git-ignored `work/`, beside
 * a `package.json` that gives the copy the package's `#plate/*` imports, so its bare imports still
 * resolve to the package's dependencies; plants its bug in the copy of its file; and runs a script
 * at the copy's root, which imports the copy's modules and writes what its property found. The copy
 * is removed once the program ends.
 *
 * @module
 */
import { spawnSync } from "node:child_process";
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { scratchFolder } from "#plate/test/scratch.ts";

/**
 * A bug a property must catch: `original` stands once in `file`, a path from plate's package root,
 * and `replacement` takes its place.
 */
export interface Kill {
  readonly file: string;
  readonly original: string;
  readonly replacement: string;
  readonly why: string;
}

/**
 * What a mutant's program did: its exit status and what it wrote.
 */
export interface Ran {
  readonly status: number | null;
  readonly stderr: string;
  readonly stdout: string;
}

/**
 * The package's root, which a kill's `file` is a path from.
 */
const packageRoot = path.resolve(import.meta.dirname, "..", "..");

/**
 * Run a script in a mutant copy of plate with a kill's bug planted.
 *
 * @param kill The bug.
 * @param script The program, at the copy's root, importing the copy's modules by `#plate/*`.
 * @returns What the program did.
 * @throws {Error} When the kill's `original` does not stand once in its file, so the kill would
 *   plant nothing or the wrong thing.
 */
export const runKilled = (kill: Kill, script: string): Ran => {
  const source = readFileSync(path.join(packageRoot, kill.file), "utf-8");

  if (source.split(kill.original).length !== 2) {
    throw new Error(`${kill.file} does not hold "${kill.original}" exactly once`);
  }

  const copy = scratchFolder("kill-");

  try {
    cpSync(path.join(packageRoot, "src"), path.join(copy, "src"), { recursive: true });
    writeFileSync(
      path.join(copy, "package.json"),
      JSON.stringify({ imports: { "#plate/*": "./src/*" }, type: "module" }),
    );
    writeFileSync(path.join(copy, kill.file), source.replace(kill.original, kill.replacement));
    writeFileSync(path.join(copy, "run.ts"), script);

    const run = spawnSync(process.execPath, [path.join(copy, "run.ts")], { encoding: "utf-8" });

    return { status: run.status, stderr: run.stderr, stdout: run.stdout };
  } finally {
    rmSync(copy, { force: true, recursive: true });
  }
};
