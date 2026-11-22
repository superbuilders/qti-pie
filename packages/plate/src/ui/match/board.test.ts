/**
 * The cell logic of a Match laid out as a table (`press` in `#plate/ui/match/board.ts`), held to
 * the rules of `#plate/test/match-table.ts`, written apart from it, over every board and every
 * reachable placement in its box; and its kills: each bug planted in the cell logic, in the machine
 * under it or in the server's reading of QTI's 0 makes the walk find a disagreement.
 *
 * A kill copies plate's sources into a scratch folder of the package's git-ignored `work/`, with
 * the package's `#plate/*` imports, plants its bug in the copy, and runs the walk in a program of
 * its own over the copy ({@link walkScript}), so the mutant is a whole program and the test's own
 * modules stay plate's.
 *
 * @module
 */
import { spawnSync } from "node:child_process";
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { onTestFinished } from "vitest";
import { limitOf } from "#plate/ui/item/interactions/facts.ts";
import { matchBoardOf, press } from "#plate/ui/match/board.ts";
import { walkTable } from "#plate/test/match-table.ts";
import { scratchFolder } from "#plate/test/scratch.ts";

/**
 * A bug the property must catch: `original` stands once in `file`, a path from plate's package
 * root, and `replacement` takes its place.
 */
interface Kill {
  readonly file: string;
  readonly original: string;
  readonly replacement: string;
  readonly why: string;
}

/**
 * The kills: the row of radios' move, both ways; a tick taken out; the column's and the row's
 * `match-max`; `max-associations`; QTI's 0 as no limit; and `match-group`.
 */
const kills: readonly Kill[] = [
  {
    file: "src/ui/match/board.ts",
    original: "uses !== undefined && isOne(uses) && ticked !== undefined",
    replacement: "uses !== undefined && false && ticked !== undefined",
    why: "a row of radios refuses a tick in another cell instead of moving its tick there",
  },
  {
    file: "src/ui/match/board.ts",
    original: "uses !== undefined && isOne(uses) && ticked !== undefined",
    replacement: "uses !== undefined && true && ticked !== undefined",
    why: "a row whose match-max is 0 or 2 moves its tick instead of taking another",
  },
  {
    file: "src/ui/match/board.ts",
    original: "if (chipsIn(arrangement, column).includes(cell.row)) {",
    replacement: "if (false) {",
    why: "a ticked cell's tick cannot be taken out",
  },
  {
    file: "src/ui/placement/machine.ts",
    original: "  if (!reached(rule.capacity, held.length)) {",
    replacement: "  if (true) {",
    why: "a column at its match-max takes another tick",
  },
  {
    file: "src/ui/placement/machine.ts",
    original:
      "rule === undefined || reached(rule.uses, matching(arrangement.placements, { chip }).length)",
    replacement: "rule === undefined",
    why: "a row at its match-max takes another tick",
  },
  {
    file: "src/ui/placement/machine.ts",
    original: "if (source === null && reached(arrangement.total, placements.length)) {",
    replacement: "if (false) {",
    why: "a tick passes max-associations",
  },
  {
    file: "src/ui/item/interactions/facts.ts",
    original: 'count === 0n ? { kind: "none" } : { kind: "at-most", n: Number(count) }',
    replacement: '({ kind: "at-most", n: Number(count) })',
    why: "a match-max or max-associations of 0 allows none where QTI writes it for no limit",
  },
  {
    file: "src/ui/placement/machine.ts",
    original: "(targets.length === 0 || targets.includes(target)) &&",
    replacement: "true &&",
    why: "a row's match-group no longer keeps it out of a column",
  },
];

/**
 * The program a kill runs in its mutant copy, at the copy's root: it walks the copy's cell logic
 * and writes what the walk found as JSON.
 */
const walkScript = [
  'import { walkTable } from "#plate/test/match-table.ts";',
  'import { limitOf } from "#plate/ui/item/interactions/facts.ts";',
  'import { matchBoardOf, press } from "#plate/ui/match/board.ts";',
  "process.stdout.write(JSON.stringify(walkTable({ limitOf, matchBoardOf, press })));",
].join("\n");

/**
 * The package's root, which a kill's `file` is a path from.
 */
const packageRoot = path.resolve(import.meta.dirname, "..", "..", "..");

/**
 * Make a mutant copy of plate: its sources, with the package's `#plate/*` imports, in a scratch
 * folder of the package's `work/`, so its bare imports resolve to the package's dependencies, and
 * the kill's bug planted in the copy of its file. The copy is removed when the test ends.
 *
 * @param kill The bug.
 * @returns The copy's folder.
 */
const mutantOf = (kill: Kill): string => {
  const source = readFileSync(path.join(packageRoot, kill.file), "utf-8");

  assert.strictEqual(source.split(kill.original).length, 2, `${kill.file} holds it once`);

  const copy = scratchFolder("match-table-kill-");

  onTestFinished(() => {
    rmSync(copy, { force: true, recursive: true });
  });

  cpSync(path.join(packageRoot, "src"), path.join(copy, "src"), { recursive: true });
  writeFileSync(
    path.join(copy, "package.json"),
    JSON.stringify({ imports: { "#plate/*": "./src/*" }, type: "module" }),
  );
  writeFileSync(path.join(copy, kill.file), source.replace(kill.original, kill.replacement));
  writeFileSync(path.join(copy, "walk.ts"), walkScript);

  return copy;
};

describe("a Match's table", () => {
  it("presses each cell of every board in its box as QTI's rules say", () => {
    const { cases, found } = walkTable({ limitOf, matchBoardOf, press });

    assert.isUndefined(found, found);
    assert.isAbove(cases, 0);
  });

  for (const kill of kills) {
    it(`kills ${kill.why}`, () => {
      const copy = mutantOf(kill);
      const run = spawnSync(process.execPath, [path.join(copy, "walk.ts")], {
        encoding: "utf-8",
      });

      assert.strictEqual(run.status, 0, run.stderr);
      assert.include(run.stdout, '"found":"', `the walk passed with ${kill.file} mutated`);
    });
  }
});
