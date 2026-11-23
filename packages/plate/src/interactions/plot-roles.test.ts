/**
 * A Graphic Gap Match's bank caption, chosen by what its choices go on (`bankCaptionKeyOf`): a
 * graph's values, "DRAG & DROP THE VALUE" or "…VALUES" by how many it holds, and a picture's
 * answer, "DRAG & DROP THE ANSWER", held to a table of the rule written apart from the code
 * (`walkBankCaption` in `#plate/test/plot-rules.ts`), with the bugs it must catch.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { bankCaptionKeyOf } from "#plate/interactions/plot-roles.ts";
import { runKilled } from "#plate/test/kills.ts";
import type { Kill } from "#plate/test/kills.ts";
import { walkBankCaption } from "#plate/test/plot-rules.ts";

/**
 * The caption's kills: a lattice read as a picture, a plot read as a picture, the singular and the
 * plural swapped, and every graph's bank said in the singular.
 */
const kills: readonly Kill[] = [
  {
    file: "src/interactions/plot-roles.ts",
    original: 'if (floorOf(classes) === "enhanced" && plotKindOf(classes) === "plain") {',
    replacement: 'if (plotKindOf(classes) === "plain") {',
    why: "a lattice's bank captioned as a picture's",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: 'if (floorOf(classes) === "enhanced" && plotKindOf(classes) === "plain") {',
    replacement: 'if (floorOf(classes) === "enhanced") {',
    why: "a plot's bank captioned as a picture's",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: 'return choices === 1 ? "bankCaptionValue" : "bankCaptionValues";',
    replacement: 'return choices === 1 ? "bankCaptionValues" : "bankCaptionValue";',
    why: "the singular and the plural swapped",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: 'return choices === 1 ? "bankCaptionValue" : "bankCaptionValues";',
    replacement: 'return "bankCaptionValue";',
    why: "every graph's bank in the singular",
  },
];

/**
 * The program a kill runs in its mutant copy: it walks the copy's caption rule and writes what it
 * found as JSON.
 */
const captionScript = [
  'import { Option } from "effect";',
  'import { bankCaptionKeyOf } from "#plate/interactions/plot-roles.ts";',
  'import { walkBankCaption } from "#plate/test/plot-rules.ts";',
  "process.stdout.write(JSON.stringify({ found: walkBankCaption({ bankCaptionKeyOf, none: Option.none(), some: Option.some }) ?? null }));",
].join("\n");

describe("a Graphic Gap Match's bank caption", () => {
  it("says VALUE for a graph's one choice, VALUES for its others, and ANSWER for a picture's, over every class and count", () => {
    assert.isUndefined(
      walkBankCaption({ bankCaptionKeyOf, none: Option.none(), some: Option.some }),
    );
  });

  for (const kill of kills) {
    it(`kills ${kill.why}`, () => {
      const run = runKilled(kill, captionScript);

      assert.strictEqual(run.status, 0, run.stderr);
      assert.notInclude(run.stdout, '"found":null', `the walk passed with ${kill.file} mutated`);
    });
  }
});
