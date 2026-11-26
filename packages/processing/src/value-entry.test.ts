import { readFileSync } from "node:fs";
import { assert, describe, it } from "@effect/vitest";
import { regex } from "arkregex";

/**
 * An import of one of the package's modules.
 */
const packageImport = regex('from "#processing/(?<path>[^"]+)"', "gu");

/**
 * The package's modules a source module imports, by their `#processing/` paths.
 *
 * @param module - The module's path under `src`.
 * @returns The paths it imports.
 */
const importsOf = (module: string): readonly string[] => {
  const source = readFileSync(new URL(module, import.meta.url), "utf-8");
  const paths: string[] = [];
  for (let found = packageImport.exec(source); found !== null; found = packageImport.exec(source)) {
    paths.push(found.groups.path);
  }

  return paths;
};

/**
 * Every module a module reaches through its imports, itself included.
 *
 * @param root - The module's path under `src`.
 * @returns The paths, sorted.
 */
const reachedFrom = (root: string): readonly string[] => {
  const reached = new Set([root]);
  const pending = [root];
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    for (const imported of importsOf(next)) {
      if (!reached.has(imported)) {
        reached.add(imported);
        pending.push(imported);
      }
    }
  }

  return [...reached].toSorted();
};

describe("the value entry", () => {
  it("reaches the value model and its lexical forms alone, so a page that loads it loads none of the compiler, the evaluator or the grade", () => {
    assert.deepStrictEqual(reachedFrom("value-entry.ts"), [
      "lexical.ts",
      "value-entry.ts",
      "value.ts",
    ]);
  });
});
