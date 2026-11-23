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
 * The caption's kills: a picture's caption on every graph, the named lines read as unnamed, a
 * named plane read as unnamed, a labelled number line read as one of values, a plane read before a
 * line, the passage's plural and the full width's singular swapped, and a graph of no kind
 * captioned.
 */
const kills: readonly Kill[] = [
  {
    file: "src/interactions/plot-roles.ts",
    original: 'return floorOf(classes) === "enhanced" && plot === "plain"',
    replacement: "return true",
    why: "a graph of no kind captioned as a picture",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: 'return Option.some(named ? "bankCaptionLineNames" : "bankCaptionTwoPoints");',
    replacement: 'return Option.some("bankCaptionTwoPoints");',
    why: "named lines captioned as unnamed",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: 'return Option.some(named ? "bankCaptionPointNames" : "bankCaptionGridPoints");',
    replacement: 'return Option.some("bankCaptionGridPoints");',
    why: "a named plane captioned as unnamed",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: '    if (named) {\n      return Option.some("bankCaptionLabels");\n    }\n',
    replacement: "",
    why: "a labelled number line captioned as one of values",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: 'if (plot === "line" || plot === "segment") {',
    replacement:
      'if (!carriesRendererClass(classes, "plate-coordinate-plane") && (plot === "line" || plot === "segment")) {',
    why: "a line on a plane captioned as the plane",
  },
  {
    file: "src/interactions/plot-roles.ts",
    original: 'return Option.some(stimulus ? "bankCaptionValues" : "bankCaptionValue");',
    replacement: 'return Option.some(stimulus ? "bankCaptionValue" : "bankCaptionValues");',
    why: "the passage's plural and the full width's singular swapped",
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
  it("says AlphaTest's heading for each kind of stage, a line's, a plane's, a number line's, named or not, a picture's ANSWER and nothing for any other graph, over every class, with a stimulus and without", () => {
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
