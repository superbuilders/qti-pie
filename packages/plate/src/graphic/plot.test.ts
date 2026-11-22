/**
 * A Graphic Gap Match's plot under plate's renderer vocabulary (`#plate/graphic/plot.ts`), held to
 * the rules of `#plate/test/plot-rules.ts`, written apart from it, and its kills, each a bug
 * planted in a mutant copy of plate run as a program of its own (`#plate/test/kills.ts`).
 *
 * The lattice (R10, Q4): `plate-lattice` on the root keeps 24 px targets, every other root 44, and
 * a stage is drawn at the scale that makes its smallest cell that wide (`#plate/graphic/scale.ts`),
 * the island's and the review's alike.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import type { GraphicArea } from "#plate/graphic/geometry.ts";
import { floorOf } from "#plate/graphic/plot.ts";
import { smallestTargetOf, stageScaleOf } from "#plate/graphic/scale.ts";
import { runKilled } from "#plate/test/kills.ts";
import type { Kill } from "#plate/test/kills.ts";
import { walkLattice } from "#plate/test/plot-rules.ts";

/**
 * A lattice of three by three 10 px cells tiling a 30 px picture, each a `rect` hotspot.
 */
const cells: readonly GraphicArea[] = [0, 1, 2].flatMap((row) =>
  [0, 1, 2].map((column): GraphicArea => ({
    coords: [column * 10, row * 10, column * 10 + 10, row * 10 + 10].map((value) => ({
      percent: false,
      value,
    })),
    geometry: "rect",
  })),
);

/**
 * The lattice's kills: the class read as no lattice, 2.5.8's 24 px taken as 44, and the scale
 * blind to its floor.
 */
const kills: readonly Kill[] = [
  {
    file: "src/graphic/plot.ts",
    original: '? "minimum" : "enhanced"',
    replacement: '? "enhanced" : "enhanced"',
    why: "a lattice keeps 44 px",
  },
  {
    file: "src/graphic/scale.ts",
    original: "{ enhanced: 44, minimum: 24 }",
    replacement: "{ enhanced: 44, minimum: 44 }",
    why: "the minimum floor keeps 44 px",
  },
  {
    file: "src/graphic/scale.ts",
    original: "floor: targetSizes[floor] / smallestTarget,",
    replacement: "floor: targetSizes.enhanced / smallestTarget,",
    why: "the stage's scale ignores its floor",
  },
];

/**
 * The program a lattice kill runs in its mutant copy: it walks the copy's lattice rule and writes
 * what it found as JSON.
 */
const latticeScript = [
  'import { Option } from "effect";',
  'import { stageScaleOf } from "#plate/graphic/scale.ts";',
  'import { floorOf } from "#plate/graphic/plot.ts";',
  'import { walkLattice } from "#plate/test/plot-rules.ts";',
  "process.stdout.write(JSON.stringify({ found: walkLattice({ floorOf, none: Option.none(), some: Option.some, stageScaleOf }) ?? null }));",
].join("\n");

describe("a Graphic Gap Match's lattice", () => {
  it("keeps 24 px targets exactly where plate-lattice is a token of the root's class, and the stage's scale makes the smallest region that wide", () => {
    assert.isUndefined(
      walkLattice({ floorOf, none: Option.none(), some: Option.some, stageScaleOf }),
    );
  });

  it("scales a tiled lattice of 10 px cells from its smallest cell to the floor's width", () => {
    const smallest = smallestTargetOf(cells, { height: 30, width: 30 });

    assert.approximately(smallest, 10, 0.1, "a 10 px cell's tap region is about 10 px across");
    assert.approximately(stageScaleOf(smallest, "minimum").floor * smallest, 24, 1e-9);
    assert.approximately(stageScaleOf(smallest, "enhanced").floor * smallest, 44, 1e-9);
  });

  for (const kill of kills) {
    it(`kills ${kill.why}`, () => {
      const run = runKilled(kill, latticeScript);

      assert.strictEqual(run.status, 0, run.stderr);
      assert.notInclude(run.stdout, '"found":null', `the walk passed with ${kill.file} mutated`);
    });
  }
});
