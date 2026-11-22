/**
 * The cell logic of a Match laid out as a table (`press` in `#plate/placement/match-board.ts`),
 * held to the rules of `#plate/test/match-table.ts`, written apart from it, over every board and
 * every reachable placement in its box; and its kills: each bug planted in the cell logic, in the
 * machine under it or in the server's reading of QTI's 0 makes the walk find a disagreement.
 *
 * Each kill runs the walk ({@link walkScript}) in a mutant copy of plate with its bug planted, a
 * program of its own (`runKilled` in `#plate/test/kills.ts`).
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { limitOf } from "#plate/placement/limit.ts";
import { matchBoardOf, press } from "#plate/placement/match-board.ts";
import { runKilled } from "#plate/test/kills.ts";
import type { Kill } from "#plate/test/kills.ts";
import { walkTable } from "#plate/test/match-table.ts";

/**
 * The kills: the row of radios' move, both ways; a tick taken out; the column's and the row's
 * `match-max`; `max-associations`; QTI's 0 as no limit; and `match-group`.
 */
const kills: readonly Kill[] = [
  {
    file: "src/placement/match-board.ts",
    original: "uses !== undefined && isOne(uses) && ticked !== undefined",
    replacement: "uses !== undefined && false && ticked !== undefined",
    why: "a row of radios refuses a tick in another cell instead of moving its tick there",
  },
  {
    file: "src/placement/match-board.ts",
    original: "uses !== undefined && isOne(uses) && ticked !== undefined",
    replacement: "uses !== undefined && true && ticked !== undefined",
    why: "a row whose match-max is 0 or 2 moves its tick instead of taking another",
  },
  {
    file: "src/placement/match-board.ts",
    original: "if (chipsIn(arrangement, column).includes(cell.row)) {",
    replacement: "if (false) {",
    why: "a ticked cell's tick cannot be taken out",
  },
  {
    file: "src/placement/machine.ts",
    original: "  if (!reached(rule.capacity, held.length)) {",
    replacement: "  if (true) {",
    why: "a column at its match-max takes another tick",
  },
  {
    file: "src/placement/machine.ts",
    original:
      "rule === undefined || reached(rule.uses, matching(arrangement.placements, { chip }).length)",
    replacement: "rule === undefined",
    why: "a row at its match-max takes another tick",
  },
  {
    file: "src/placement/machine.ts",
    original: "if (source === null && reached(arrangement.total, placements.length)) {",
    replacement: "if (false) {",
    why: "a tick passes max-associations",
  },
  {
    file: "src/placement/limit.ts",
    original: 'count === 0n ? { kind: "none" } : { kind: "at-most", n: Number(count) }',
    replacement: '({ kind: "at-most", n: Number(count) })',
    why: "a match-max or max-associations of 0 allows none where QTI writes it for no limit",
  },
  {
    file: "src/placement/machine.ts",
    original: "(targets.length === 0 || targets.includes(target)) &&",
    replacement: "true &&",
    why: "a row's match-group no longer keeps it out of a column",
  },
];

/**
 * The program a kill runs in its mutant copy: it walks the copy's cell logic and writes what the
 * walk found as JSON.
 */
const walkScript = [
  'import { walkTable } from "#plate/test/match-table.ts";',
  'import { limitOf } from "#plate/placement/limit.ts";',
  'import { matchBoardOf, press } from "#plate/placement/match-board.ts";',
  "process.stdout.write(JSON.stringify(walkTable({ limitOf, matchBoardOf, press })));",
].join("\n");

describe("a Match's table", () => {
  it("presses each cell of every board in its box as QTI's rules say", () => {
    const { cases, found } = walkTable({ limitOf, matchBoardOf, press });

    assert.isUndefined(found, found);
    assert.isAbove(cases, 0);
  });

  for (const kill of kills) {
    it(`kills ${kill.why}`, () => {
      const run = runKilled(kill, walkScript);

      assert.strictEqual(run.status, 0, run.stderr);
      assert.include(run.stdout, '"found":"', `the walk passed with ${kill.file} mutated`);
    });
  }
});
