/**
 * A press on a Hotspot's image (`pressedOf` in `#plate/interactions/picks.ts`), held to the rule of
 * `#plate/test/presses.ts`, written apart from it: every sequence of up to five presses on three
 * areas, under one pick, any number and at most two, from no pick. A tap on the picked area takes
 * it back, so a single response is NULL again, the product's rule for a number line's ticks.
 *
 * Each kill runs the walk in a mutant copy of plate with its bug planted, a program of its own
 * (`runKilled` in `#plate/test/kills.ts`): the one pick kept when its area is pressed again, as the
 * island did before a press took it back; and a press among several replacing the others.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { pressedOf } from "#plate/interactions/picks.ts";
import { kill, runKilled } from "#plate/test/kills.ts";
import type { Kill } from "#plate/test/kills.ts";
import { walkPresses } from "#plate/test/presses.ts";

/**
 * The kills: a single pick its area's press keeps, and a press among several that replaces them.
 */
const kills: readonly Kill[] = [
  kill({
    file: "packages/plate/src/interactions/picks.ts",
    original: "  if (picked.includes(identifier)) {",
    replacement: '  if (picks.kind !== "one" && picked.includes(identifier)) {',
    why: "a single pick pressed again stays picked",
  }),
  kill({
    file: "packages/plate/src/interactions/picks.ts",
    original: 'return picks.kind === "one" ? [identifier] : [...picked, identifier];',
    replacement: "return [identifier];",
    why: "a press among several picks replaces them",
  }),
];

/**
 * The program a kill runs in its mutant copy: it walks the copy's press rule and writes what it
 * found as JSON.
 */
const walkScript = [
  'import { pressedOf } from "#plate/interactions/picks.ts";',
  'import { walkPresses } from "#plate/test/presses.ts";',
  "process.stdout.write(JSON.stringify({ found: walkPresses({ pressedOf }) ?? null }));",
].join("\n");

describe("a press on a Hotspot's image", () => {
  it("takes a picked area back, a single pick to none, and picks any other, in place of one pick or beside several, for every sequence of up to five presses on three areas", () => {
    const found = walkPresses({ pressedOf });

    assert.isUndefined(found, found);
  });

  it("is failed by each of its kills: each bug planted in a mutant copy of plate breaks the walk", () => {
    const survivors = kills.flatMap((planted) => {
      const run = runKilled(planted, walkScript);

      assert.strictEqual(run.status, 0, run.stderr);

      return run.stdout.includes('"found":null') ? [planted.why] : [];
    });

    assert.deepStrictEqual(survivors, [], "every kill fails the walk");
  });
});
