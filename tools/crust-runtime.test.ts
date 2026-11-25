/**
 * Crust's run time names no `Buffer`: crust runs in browsers, which have none, so no module a crust
 * entry can load names Node's `Buffer`, read by the root's one reader of module graphs
 * (`crustRuntime` in `#tools/module-graph.ts`). Every module of the walk is read, crust's own and
 * every dependency's it loads (saxes and its xmlchars, effect, arkregex, grizzle-text), through
 * every load its code makes, so the proof holds for every path a crust entry can take, not the one
 * a run took. A planted `Buffer` in a module crust loads, and a planted import of a module that
 * names one, each turn it red.
 *
 * @module
 */
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";
import { crustRuntime, linesNaming } from "#tools/module-graph.ts";
import type { Closure } from "#tools/module-graph.ts";

/**
 * Crust's decoder, by its real path: a module every reading entry loads, where the plants stand.
 */
const decoder = realpathSync(
  fileURLToPath(new URL("../packages/crust/src/decode.ts", import.meta.url)),
);

/**
 * Give the modules of a closure that name `Buffer`, each read from `planted` where it stands there
 * and from disk where it does not.
 *
 * @param closure The closure.
 * @param planted The sources that stand in for some modules' own.
 * @returns The modules, in the order the walk reached them.
 */
const namingBuffer = (closure: Closure, planted: ReadonlyMap<string, string>): readonly string[] =>
  closure.reached.filter(
    (module) =>
      !module.endsWith(".json") &&
      linesNaming(module, planted.get(module) ?? readFileSync(module, "utf-8"), "Buffer").length >
        0,
  );

/**
 * Plant a line at the end of crust's decoder, leaving the tree as it is on disk.
 *
 * @param line The line.
 * @returns The decoder's planted source, by its real path.
 */
const plantedDecoder = (line: string): ReadonlyMap<string, string> =>
  new Map([[decoder, `${readFileSync(decoder, "utf-8")}\n${line}\n`]]);

describe("crust's run time", () => {
  it("reaches past crust into every dependency it loads, and follows every load it reads", () => {
    const closure = crustRuntime(new Map());
    const packages = closure.reached.map((module) => module.split("/node_modules/").at(-1) ?? "");

    assert.includeMembers(packages, [
      "saxes/saxes.js",
      "xmlchars/xml/1.0/ed5.js",
      "effect/dist/index.js",
      "arkregex/out/index.js",
    ]);
    assert.include(closure.reached, decoder);
    assert.deepStrictEqual([closure.unresolved, closure.unreadable], [[], []]);
  });

  it("loads no module that names Node's Buffer", () => {
    assert.deepStrictEqual(namingBuffer(crustRuntime(new Map()), new Map()), []);
  });

  it("refuses a Buffer named in a module crust loads (the plant)", () => {
    const planted = plantedDecoder("export const planted = globalThis.Buffer;");

    assert.deepStrictEqual(namingBuffer(crustRuntime(planted), planted), [decoder]);
  });

  it("refuses an import of a module that names Buffer, effect's HTTP bodies among them (the plant)", () => {
    const planted = plantedDecoder('import "effect/http";');
    const named = namingBuffer(crustRuntime(planted), planted);

    assert.notInclude(named, decoder);
    assert.includeMembers(
      named.map((module) => module.split("/node_modules/").at(-1) ?? ""),
      ["effect/dist/http/HttpBody.js"],
    );
  });
});
