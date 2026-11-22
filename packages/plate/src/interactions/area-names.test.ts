/**
 * The names a graphic interaction's areas show under (`namedAreasOf` in
 * `#plate/interactions/area-names.ts`): an area the author named keeps its name and is not
 * `unnamed`; one the author named nothing takes plate's "Area n of count" and is `unnamed`, so its
 * parts write `data-unnamed` and a theme can hide them from the eye.
 *
 * The property walks every pattern of named and unnamed areas, up to six, against the rule of
 * `#plate/test/area-names.ts`, written apart from it: the oracle for the fallback is the catalog's
 * English, "Area n of count". Each kill runs the walk ({@link walkScript}) in a mutant copy of
 * plate with its bug planted, a program of its own (`runKilled` in `#plate/test/kills.ts`).
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { namedAreasOf } from "#plate/interactions/area-names.ts";
import { walkNames } from "#plate/test/area-names.ts";
import { runKilled } from "#plate/test/kills.ts";
import type { Kill } from "#plate/test/kills.ts";

/**
 * The kills: the flag left off a name plate made up, the place counted from 0, and the count read
 * as the place.
 */
const kills: readonly Kill[] = [
  {
    file: "src/interactions/area-names.ts",
    original: "unnamed: Option.isNone(label),",
    replacement: "unnamed: false,",
    why: "a name plate made up is not unnamed",
  },
  {
    file: "src/interactions/area-names.ts",
    original: "n: numeral(locale, index + 1),",
    replacement: "n: numeral(locale, index),",
    why: "an area's place is counted from 0",
  },
  {
    file: "src/interactions/area-names.ts",
    original: "count: numeral(locale, areas.length),",
    replacement: "count: numeral(locale, index + 1),",
    why: "the count is the area's place",
  },
];

/**
 * The program a kill runs in its mutant copy: it walks the copy's naming and writes what it found
 * as JSON.
 */
const walkScript = [
  'import { namedAreasOf } from "#plate/interactions/area-names.ts";',
  'import { walkNames } from "#plate/test/area-names.ts";',
  "process.stdout.write(JSON.stringify({ found: walkNames({ namedAreasOf }) ?? null }));",
].join("\n");

describe("a graphic area's name", () => {
  it("is the author's, not unnamed, where the core read one, else Area n of count, unnamed, for every pattern up to six areas", () => {
    const found = walkNames({ namedAreasOf });

    assert.isUndefined(found, found);
  });

  for (const kill of kills) {
    it(`kills ${kill.why}`, () => {
      const run = runKilled(kill, walkScript);

      assert.strictEqual(run.status, 0, run.stderr);
      assert.notInclude(run.stdout, '"found":null', `the walk passed with ${kill.file} mutated`);
    });
  }
});
