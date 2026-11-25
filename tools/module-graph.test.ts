/**
 * Plate's module graph held to its rules from the repository's root, by the one reader of it
 * (`#tools/module-graph.ts`), the one the lint config derives the modules a page loads with.
 *
 * - The serving entries, plate's `.` and the UI's `./ui` and `./ui/client`, load no committed JSON
 *   but the tables serving reads ({@link servedTables}), so no cold start parses a table for
 *   nothing; and a planted table is refused.
 * - The modules a page loads are the islands' closure outside `src/ui/`, derived, not kept: a planted
 *   import in an island adds its module, and an island's import taken out drops the module only it
 *   reached.
 *
 * @module
 */
import { readFileSync } from "node:fs";
import { assert, describe, it } from "@effect/vitest";
import { Schema } from "effect";
import { plateClientModulesOf, plateModules, valueClosure } from "#tools/module-graph.ts";

/**
 * Plate's sources, tests included, by path under the package.
 */
const modules = plateModules();

/**
 * Every module plate's public surface reaches through declarations that load a module.
 */
const closure = valueClosure(modules, ["src/index.ts"]);

/**
 * The committed JSON modules the serving entries, `.` and the UI's `./ui` and `./ui/client`, may
 * load, each with what reads it while a host serves items. Any other JSON their closure reaches is
 * a table serving never reads, loaded and parsed on every cold start for nothing.
 */
const servedTables = {} satisfies Readonly<Record<string, string>>;

/**
 * List the committed JSON modules the roots reach that {@link servedTables} does not name.
 *
 * @param sources The modules' sources, by path under the package (`src/<x>`).
 * @param roots The paths to start from.
 * @returns Each such JSON module, in the order the walk first reached it.
 */
const unservedTables = (
  sources: ReadonlyMap<string, string>,
  roots: readonly string[],
): readonly string[] =>
  valueClosure(sources, roots).filter(
    (module) => module.endsWith(".json") && !Object.hasOwn(servedTables, module),
  );

/**
 * The part of plate's `package.json` this suite reads: its exports map.
 */
const Manifest = Schema.Struct({ exports: Schema.Record(Schema.String, Schema.String) });

/**
 * Read plate's exports map, once per case, so a manifest that does not decode fails only the
 * cases that read it.
 *
 * @returns Each subpath with the module it names, `./` and all.
 */
const plateExports = (): Readonly<Record<string, string>> =>
  Schema.decodeUnknownSync(Manifest)(
    JSON.parse(readFileSync(new URL("../packages/plate/package.json", import.meta.url), "utf-8")),
  ).exports;

/**
 * Plant a source line at the end of one of plate's modules, leaving the package as it is on disk.
 *
 * @param module The module's path under the package.
 * @param line The line.
 * @returns The modules, that one planted.
 */
const planted = (module: string, line: string): ReadonlyMap<string, string> =>
  new Map([...modules, [module, `${modules.get(module) ?? ""}\n${line}\n`]]);

describe("plate's serving entries", () => {
  it("load from the UI's entries, ./ui and ./ui/client, no committed JSON but the tables serving reads", () => {
    const exports = plateExports();
    const roots = ["./ui", "./ui/client"].map(
      (subpath) => exports[subpath]?.replace(/^\.\//u, "") ?? "",
    );

    assert.deepStrictEqual(roots, ["src/ui/index.ts", "src/ui/client.ts"]);
    assert.deepStrictEqual(unservedTables(modules, roots), []);
  });

  it("reach from the core, src/index.ts, more than ten modules, redact, restore and openAdmitted among them", () => {
    assert.isAbove(closure.length, 10);
    assert.includeMembers(
      [...closure],
      ["src/redact.ts", "src/restore.ts", "src/validate/admitted.ts", "src/document/read.ts"],
    );
  });

  it('load from the serving entry, the exports map\'s ".", no committed JSON but the tables serving reads', () => {
    const entry = plateExports()["."]?.replace(/^\.\//u, "") ?? "";

    assert.strictEqual(entry, "src/index.ts");
    assert.deepStrictEqual(unservedTables(modules, [entry]), []);
  });

  it("refuse a table serving never reads once the serving entry loads one (the plant)", () => {
    assert.sameMembers(
      [
        ...unservedTables(
          planted(
            "src/index.ts",
            'export { default as planted } from "#plate/planted.generated.json" with { type: "json" };',
          ),
          ["src/index.ts"],
        ),
      ],
      ["src/planted.generated.json"],
    );
  });
});

describe("the modules a page loads, derived from the islands' closure", () => {
  it("are plate's modules outside the UI that an island loads, the placement machine, the area geometry and Alpha's math field among them, and no UI module nor Alpha React module", () => {
    const derived = plateClientModulesOf(modules);

    assert.includeMembers(
      [...derived],
      [
        "packages/plate/src/placement/machine.ts",
        "packages/plate/src/graphic/geometry.ts",
        "packages/plate/src/alpha/math-entry/field.ts",
      ],
    );
    assert.isFalse(derived.some((module) => module.startsWith("packages/plate/src/ui/")));
    assert.isFalse(
      derived.some(
        (module) => module.startsWith("packages/plate/src/alpha/") && module.endsWith(".tsx"),
      ),
    );
    assert.notInclude([...derived], "packages/plate/src/vocabulary.ts");
  });

  it("gain a module an island starts to load (the plant)", () => {
    const island = "src/ui/graphic-gap-match/graphic-gap-match.tsx";
    const before = new Set(plateClientModulesOf(modules));

    assert.include(modules.get(island) ?? "", '"use client"');
    assert.deepStrictEqual(
      plateClientModulesOf(
        planted(island, 'import { noSupports } from "#plate/supports.ts";\nnoSupports;'),
      ).filter((module) => !before.has(module)),
      ["packages/plate/src/supports.ts"],
    );
  });

  it("lose a module once no island loads it (the plant)", () => {
    const withoutBoard = new Map(
      [...modules].map(([module, source]) => [
        module,
        source.replaceAll('from "#plate/placement/match-board.ts"', 'from "#plate/absent.ts"'),
      ]),
    );

    assert.include(plateClientModulesOf(modules), "packages/plate/src/placement/match-board.ts");
    assert.notInclude(
      plateClientModulesOf(withoutBoard),
      "packages/plate/src/placement/match-board.ts",
    );
  });
});
