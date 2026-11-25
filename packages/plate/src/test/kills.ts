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
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { scratchFolder } from "#plate/test/scratch.ts";

/**
 * A path from the checkout's root to one of plate's sources, the only form a kill's `file` takes:
 * a path from plate's own root (`src/…`) is no such path and fails to type.
 */
export type PlateSource = `packages/plate/src/${string}`;

/**
 * A bug a property must catch: `original` stands once in `file`, a path from the checkout's root
 * (qti-pie's, where the toolchain's mutator and its stale-kill lint read a kill's file), and
 * `replacement` takes its place.
 */
export interface Kill {
  readonly file: PlateSource;
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
 * The package's root, whose sources a mutant copies.
 */
const packageRoot = path.resolve(import.meta.dirname, "..", "..");

/**
 * The checkout's root, qti-pie's, two folders above the package's, which a kill's `file` is a path
 * from.
 */
const checkoutRoot = path.resolve(packageRoot, "..", "..");

/**
 * The text of a kill's file, read from the checkout, where its `original` stands exactly once.
 *
 * @param planted The bug.
 * @returns The file's text, unmutated.
 * @throws {Error} When the file is no file of the checkout, or `original` does not stand once in
 *   it, so the kill would plant nothing or the wrong thing.
 */
const plantedSource = (planted: Kill): string => {
  const at = path.join(checkoutRoot, planted.file);

  if (!existsSync(at)) {
    throw new Error(`kill "${planted.why}": ${planted.file} is no file of the checkout`);
  }

  const source = readFileSync(at, "utf-8");

  if (source.split(planted.original).length !== 2) {
    throw new Error(
      `kill "${planted.why}": ${planted.file} does not hold "${planted.original}" exactly once`,
    );
  }

  return source;
};

/**
 * A kill, checked as its table loads: its file stands in the checkout and holds its `original`
 * exactly once, so a stale path or original fails at its own entry of the table, never as an
 * ENOENT inside the test that plants it.
 *
 * @param planted The bug.
 * @returns It, checked.
 */
export const kill = (planted: Kill): Kill => {
  plantedSource(planted);

  return planted;
};

/**
 * Run a script in a mutant copy of plate with a kill's bug planted.
 *
 * @param planted The bug.
 * @param script The program, at the copy's root, importing the copy's modules by `#plate/*`.
 * @returns What the program did.
 */
export const runKilled = (planted: Kill, script: string): Ran => {
  const source = plantedSource(planted);
  const copy = scratchFolder("kill-");

  try {
    cpSync(path.join(packageRoot, "src"), path.join(copy, "src"), { recursive: true });
    writeFileSync(
      path.join(copy, "package.json"),
      JSON.stringify({ imports: { "#plate/*": "./src/*" }, type: "module" }),
    );
    writeFileSync(
      path.join(copy, path.relative(packageRoot, path.join(checkoutRoot, planted.file))),
      source.replace(planted.original, planted.replacement),
    );
    writeFileSync(path.join(copy, "run.ts"), script);

    const run = spawnSync(process.execPath, [path.join(copy, "run.ts")], { encoding: "utf-8" });

    return { status: run.status, stderr: run.stderr, stdout: run.stdout };
  } finally {
    rmSync(copy, { force: true, recursive: true });
  }
};
