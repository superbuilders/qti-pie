/**
 * A Graphic Gap Match's plot under plate's renderer vocabulary (`#plate/graphic/plot.ts`, its
 * classes read by `#plate/interactions/plot-roles.ts`), held to the rules of
 * `#plate/test/plot-rules.ts`, written apart from it, and its kills, each a bug planted in a mutant
 * copy of plate run as a program of its own (`#plate/test/kills.ts`).
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
import { figuresOf, shadeDirectionOf, stepsOf } from "#plate/graphic/plot.ts";
import { smallestTargetOf, stageScaleOf } from "#plate/graphic/scale.ts";
import {
  floorOf,
  plotKindOf,
  pointStyleOf,
  shadeOf,
  statisticOf,
} from "#plate/interactions/plot-roles.ts";
import { runKilled } from "#plate/test/kills.ts";
import type { Kill } from "#plate/test/kills.ts";
import { walkLattice, walkPlot } from "#plate/test/plot-rules.ts";

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
    file: "src/interactions/plot-roles.ts",
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
  'import { floorOf } from "#plate/interactions/plot-roles.ts";',
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

/**
 * The plot's kills: a line left unextended, a line clipped wrong, two plot classes still drawing, a
 * whisker capped at the wrong end, a given statistic ignored, the box plot drawn on its line, a
 * dot's style ignored, the ray run from the wrong dot or the wrong way, an unanswered shading read
 * as right, a dot plot stacked from the top, its steps sized by what it holds, its class misread,
 * the shading's choices swapped, two statistic classes still naming one, and open and closed
 * swapped.
 */
const plotKills: readonly Kill[] = [
  {
    file: "src/graphic/plot.ts",
    original: 'reach === "segment" ? [first, second] : throughBox(first, second, box)',
    replacement: "[first, second]",
    why: "a line stops at its two points",
  },
  {
    file: "src/graphic/plot.ts",
    original: "const enter = Math.max(xEnter, yEnter);",
    replacement: "const enter = Math.min(xEnter, yEnter);",
    why: "a line runs past the plot's box",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: "asked.length === 1 ?",
    replacement: "asked.length >= 1 ?",
    why: "two plot classes still draw the first",
  },
  {
    file: "src/graphic/plot.ts",
    original: "whisker(high, q3)",
    replacement: "whisker(q3, high)",
    why: "the upper whisker is capped at the quartile, not the maximum",
  },
  {
    file: "src/graphic/plot.ts",
    original: "const at = placed?.target ?? given?.identifier;",
    replacement: "const at = placed?.target;",
    why: "a given statistic is not drawn from",
  },
  {
    file: "src/graphic/plot.ts",
    original: "const level = (stand: Stand) => stand.middle.y - boxRise;",
    replacement: "const level = (stand: Stand) => stand.middle.y;",
    why: "the box plot is drawn on the line, not above it",
  },
  {
    file: "src/graphic/plot.ts",
    original: '[{ dot, kind: "point", x: stand.middle.x, y: stand.middle.y }]',
    replacement: '[{ dot: "closed", kind: "point", x: stand.middle.x, y: stand.middle.y }]',
    why: "every dot is drawn closed",
  },
  {
    file: "src/graphic/plot.ts",
    original: "dots.toSorted((a, b) => a.x - b.x)",
    replacement: "dots.toSorted((a, b) => b.x - a.x)",
    why: "the ray runs from the rightmost dot",
  },
  {
    file: "src/graphic/plot.ts",
    original: 'x2: shade === "left" ? box.left : box.right,',
    replacement: "x2: box.right,",
    why: "every ray runs right",
  },
  {
    file: "src/graphic/plot.ts",
    original:
      'return link.right !== undefined && picked.includes(link.right) ? "right" : undefined;',
    replacement: 'return link.right !== undefined ? "right" : undefined;',
    why: "an unanswered shading runs the ray right",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: 'Option.some(left ? "left" : "right")',
    replacement: 'Option.some(left ? "right" : "left")',
    why: "the shading's left and right choices are swapped",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: "named.length === 1 ?",
    replacement: "named.length >= 1 ?",
    why: "two statistic classes still name the first",
  },
  {
    file: "src/graphic/plot.ts",
    original: "[box.left, box.bottom - (at + 1) * step, box.right, box.bottom - at * step]",
    replacement: "[box.left, box.top + at * step, box.right, box.top + (at + 1) * step]",
    why: "a dot plot's column stacks down from its top",
  },
  {
    file: "src/graphic/plot.ts",
    original: '(capacity.kind === "at-most" ? capacity.n : held)',
    replacement: "held",
    why: "a dot plot's steps share the column among what it holds, not its match-max",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: '["plate-dot-plot", "dot-plot"],',
    replacement: '["plate-dot-plots", "dot-plot"],',
    why: "the dot plot's class is read under another name",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: 'Option.some(open ? "open" : "closed")',
    replacement: 'Option.some(open ? "closed" : "open")',
    why: "open and closed dots are swapped",
  },
];

/**
 * The program a plot kill runs in its mutant copy: it walks the copy's plot and writes what it
 * found as JSON.
 */
const plotScript = [
  'import { Option } from "effect";',
  'import { plotKindOf, pointStyleOf, shadeOf, statisticOf } from "#plate/interactions/plot-roles.ts";',
  'import { figuresOf, shadeDirectionOf, stepsOf } from "#plate/graphic/plot.ts";',
  'import { walkPlot } from "#plate/test/plot-rules.ts";',
  "process.stdout.write(JSON.stringify({ found: walkPlot({ figuresOf, none: Option.none(), plotKindOf, pointStyleOf, shadeDirectionOf, shadeOf, some: Option.some, statisticOf, stepsOf, value: Option.getOrUndefined }) ?? null }));",
].join("\n");

describe("a Graphic Gap Match's plot", () => {
  it("draws the lines, the box plot and the dots of every case of its box, and stacks a dot plot's columns, as AlphaTest drew them, and reads plate's classes as whole tokens", () => {
    const found = walkPlot({
      figuresOf,
      none: Option.none(),
      plotKindOf,
      pointStyleOf,
      shadeDirectionOf,
      shadeOf,
      some: Option.some,
      statisticOf,
      stepsOf,
      value: Option.getOrUndefined,
    });

    assert.isUndefined(found, found);
  });

  for (const kill of plotKills) {
    it(`kills ${kill.why}`, () => {
      const run = runKilled(kill, plotScript);

      assert.strictEqual(run.status, 0, run.stderr);
      assert.notInclude(run.stdout, '"found":null', `the walk passed with ${kill.file} mutated`);
    });
  }
});
