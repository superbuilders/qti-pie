/**
 * A Gap Match's board (`gapBoardOf` in `#plate/placement/gap-board.ts`) under the placement
 * machine, held to the rules of `#plate/test/gap-slots.ts`, written apart from it, over every board
 * and every reachable filling of its gaps in its box, and every move a child can make on each: what
 * the response sends, and what each gap shows, are what the rules leave in the gaps after the
 * move. And its kills: each bug planted in the board, in the machine under it or in the server's
 * reading of QTI's 0 makes the walk find a disagreement, among them the bug a converter's review
 * found in AlphaTest's player, a card taken back out of its gap and still sent.
 *
 * Each kill runs the walk ({@link walkScript}) in a mutant copy of plate with its bug planted, a
 * program of its own (`runKilled` in `#plate/test/kills.ts`).
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { gapBoardOf } from "#plate/placement/gap-board.ts";
import { limitOf } from "#plate/placement/limit.ts";
import { chipsIn, pick, place } from "#plate/placement/machine.ts";
import { walkGaps } from "#plate/test/gap-slots.ts";
import { runKilled } from "#plate/test/kills.ts";
import type { Kill } from "#plate/test/kills.ts";

/**
 * The kills: a filled gap's drop, a gap's one gap text, a pair made twice, a gap's `match-group`, a
 * gap text taken back out or moved and still sent, a gap text's `match-max`, `max-associations`,
 * and QTI's 0 as no limit.
 */
const kills: readonly Kill[] = [
  {
    file: "src/placement/gap-board.ts",
    original: "swap: false,",
    replacement: "swap: true,",
    why: "a drop on a filled gap trades the gap text there away instead of being refused",
  },
  {
    file: "src/placement/gap-board.ts",
    original: 'const oneGapText: Limit = { kind: "at-most", n: 1 };',
    replacement: 'const oneGapText: Limit = { kind: "at-most", n: 2 };',
    why: "a gap holds a second gap text",
  },
  {
    file: "src/placement/gap-board.ts",
    original: "repeats: false,",
    replacement: "repeats: true,",
    why: "a gap text dropped on the gap that holds it is refused as a full gap, not as a pair made",
  },
  {
    file: "src/placement/gap-board.ts",
    original: "chips: matchGroup,",
    replacement: "chips: [],",
    why: "a gap's match-group no longer keeps a gap text out",
  },
  {
    file: "src/placement/machine.ts",
    original: "arrangement: paired(arrangement, removeOne(placements, source)),",
    replacement: "arrangement: paired(arrangement, placements),",
    why: "a gap text taken back out to the bank is still sent from the gap it left, which shows empty",
  },
  {
    file: "src/placement/machine.ts",
    original: "arrangement: paired(arrangement, [...left, { chip, target: rule.id }]),",
    replacement: "arrangement: paired(arrangement, [...placements, { chip, target: rule.id }]),",
    why: "a gap text moved to another gap is still sent from the gap it left",
  },
  {
    file: "src/placement/machine.ts",
    original:
      "rule === undefined || reached(rule.uses, matching(arrangement.placements, { chip }).length)",
    replacement: "rule === undefined",
    why: "a gap text fills more gaps than its match-max allows",
  },
  {
    file: "src/placement/machine.ts",
    original: "if (source === null && reached(arrangement.total, placements.length)) {",
    replacement: "if (false) {",
    why: "the gaps hold more pairs than max-associations allows",
  },
  {
    file: "src/placement/limit.ts",
    original: 'count === 0n ? { kind: "none" } : { kind: "at-most", n: Number(count) }',
    replacement: '({ kind: "at-most", n: Number(count) })',
    why: "a match-max or max-associations of 0 allows none where QTI writes it for no limit",
  },
];

/**
 * The program a kill runs in its mutant copy: it walks the copy's board and machine and writes what
 * the walk found as JSON.
 */
const walkScript = [
  'import { walkGaps } from "#plate/test/gap-slots.ts";',
  'import { gapBoardOf } from "#plate/placement/gap-board.ts";',
  'import { limitOf } from "#plate/placement/limit.ts";',
  'import { chipsIn, pick, place } from "#plate/placement/machine.ts";',
  "process.stdout.write(JSON.stringify(walkGaps({ chipsIn, gapBoardOf, limitOf, pick, place })));",
].join("\n");

describe("a Gap Match's board", () => {
  it("sends what each gap shows after every move a child makes on every board in its box, as QTI's rules and plate's say", () => {
    const { cases, found } = walkGaps({ chipsIn, gapBoardOf, limitOf, pick, place });

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
