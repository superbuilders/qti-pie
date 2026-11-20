import { assert, describe, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { readFileSync } from "node:fs";
import { brandRedacted } from "#plate/redact/walk.ts";
import { sourceModules, valueClosure } from "#plate/test/imports.ts";
import { acceptForTest } from "#plate/validate/verdict.ts";

/**
 * The package's sources, tests included, by path under the package.
 */
const modules = sourceModules();

/**
 * Every module the public surface reaches through declarations that load a module.
 */
const closure = valueClosure(modules, ["src/index.ts"]);

/**
 * The seams that make an accepted root or a `Redacted` without `openAdmitted` or `redact`: no
 * published entry exports one.
 */
const seams: ReadonlyMap<string, unknown> = new Map<string, unknown>([
  ["acceptForTest", acceptForTest],
  ["brandRedacted", brandRedacted],
]);

/**
 * List a published entry's exports that are one of some named values, by its own name or under
 * any other.
 *
 * @param entry The entry's exports, by name.
 * @param named The values, by the name each is declared with.
 * @returns The names the entry exports one of them under, empty when it exports none.
 */
const exportedAmong = (
  entry: ReadonlyMap<string, unknown>,
  named: ReadonlyMap<string, unknown>,
): readonly string[] => {
  const values = new Set(named.values());

  return [...entry].flatMap(([name, value]) =>
    named.has(name) || values.has(value) ? [name] : [],
  );
};

/**
 * The committed JSON modules the serving entries, `.` and the UI's `./ui` and `./ui/client`, may
 * load, each with what reads it while a host serves items. Any other JSON their
 * closure reaches is a table serving never reads, loaded and parsed on every cold start for
 * nothing.
 */
const servedTables = {
  "src/model/blocks.generated.json":
    "the block names of XML Schema Part 2, which model/regex.ts reads to check a pattern facet",
} satisfies Readonly<Record<string, string>>;

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
 * The parts of `package.json` this witness reads.
 */
const Manifest = Schema.Struct({
  dependencies: Schema.Record(Schema.String, Schema.String),
  devDependencies: Schema.Record(Schema.String, Schema.String),
  exports: Schema.Record(Schema.String, Schema.String),
});

/**
 * Read plate's `package.json`, once per case, so a manifest that does not decode fails only the
 * cases that read it.
 *
 * @returns The parts of the manifest {@link Manifest} names.
 */
const readManifest = (): typeof Manifest.Type =>
  Schema.decodeUnknownSync(Manifest)(
    JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8")),
  );

/**
 * The exports map's script entries, each by its subpath, with the module it names under the
 * package: every entry a host loads code from, so a rule held over them holds over an entry the
 * map gains, with no edit here.
 *
 * @returns `[subpath, module]` for each entry whose target is a script, in the map's order.
 */
const scriptEntries = (): readonly (readonly [subpath: string, module: string])[] =>
  Object.entries(readManifest().exports).flatMap(([subpath, target]) =>
    /\.[cm]?[jt]sx?$/u.test(target) ? [[subpath, target.replace(/^\.\//u, "")] as const] : [],
  );

/**
 * A module's exports as a host reads them: a record of values by name.
 */
const ModuleExports = Schema.Record(Schema.String, Schema.Unknown);

/**
 * Load one published entry as a host loads it, through the package's own name and the exports
 * map. The specifier is built at run time, so the root program's `tsc` does not follow it into the
 * UI's `.tsx` modules, which only plate's DOM program compiles.
 *
 * @param subpath The entry's subpath in the exports map, such as `./ui`.
 * @returns The entry's exports, by name.
 */
const loadEntry = (subpath: string): Effect.Effect<ReadonlyMap<string, unknown>> =>
  Effect.promise(() => import(`@qti-pie/plate${subpath.slice(1)}`)).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(ModuleExports)),
    Effect.map((exports) => new Map(Object.entries(exports))),
    Effect.orDie,
  );

/**
 * Load every script entry of the exports map ({@link scriptEntries}).
 *
 * @returns Each entry's exports, by its subpath.
 */
const loadPublished = (): Effect.Effect<ReadonlyMap<string, ReadonlyMap<string, unknown>>> =>
  Effect.map(
    Effect.forEach(scriptEntries(), ([subpath]) =>
      Effect.map(loadEntry(subpath), (exports) => [subpath, exports] as const),
    ),
    (entries) => new Map(entries),
  );

/**
 * List the exports of every published entry that are one of some named values, by its own name or
 * under any other.
 *
 * @param published Each entry's exports, by its subpath ({@link loadPublished}).
 * @param named The values, by the name each is declared with.
 * @returns `<entry> <name>` for each name an entry exports one of them under, empty when none
 *   exports one.
 */
const publishedAmong = (
  published: ReadonlyMap<string, ReadonlyMap<string, unknown>>,
  named: ReadonlyMap<string, unknown>,
): readonly string[] =>
  [...published].flatMap(([entry, exports]) =>
    exportedAmong(exports, named).map((name) => `${entry} ${name}`),
  );

describe("the published entries, every script entry of the exports map", () => {
  it.effect(
    "export no test seam, brand constructor, mark predicate or defect, under any name, the UI's server and client entries included",
    () =>
      Effect.gen(function* noSeams() {
        const published = yield* loadPublished();

        assert.includeMembers([...published.keys()], [".", "./ui", "./ui/client"]);
        assert.includeMembers([...(published.get(".")?.keys() ?? [])], ["openAdmitted", "redact"]);
        assert.includeMembers([...(published.get("./ui")?.keys() ?? [])], ["Item"]);
        assert.includeMembers([...(published.get("./ui/client")?.keys() ?? [])], ["Responses"]);
        assert.deepStrictEqual(publishedAmong(published, seams), []);
      }),
  );

  it("load from the UI's entries, ./ui and ./ui/client, no committed JSON but the block table, as the serving entry does", () => {
    const { exports } = readManifest();
    const roots = ["./ui", "./ui/client"].map(
      (subpath) => exports[subpath]?.replace(/^\.\//u, "") ?? "",
    );

    assert.deepStrictEqual(roots, ["src/ui/index.ts", "src/ui/client.ts"]);
    assert.deepStrictEqual(unservedTables(modules, roots), []);
  });
});

describe("the core, from src/index.ts", () => {
  it("reaches more than ten modules, redact, score and openAdmitted among them", () => {
    assert.isAbove(closure.length, 10);
    assert.includeMembers(
      [...closure],
      ["src/redact.ts", "src/score.ts", "src/validate/admitted.ts", "src/document/read.ts"],
    );
  });

  it('loads from the serving entry, the exports map\'s ".", no committed JSON but the block table', () => {
    const entry = readManifest().exports["."]?.replace(/^\.\//u, "") ?? "";

    assert.strictEqual(entry, "src/index.ts");
    assert.deepStrictEqual(unservedTables(modules, [entry]), []);
  });

  it("refuses a table serving never reads once the serving entry loads one (the plant)", () => {
    const planted = new Map(modules);
    planted.set(
      "src/index.ts",
      `${modules.get("src/index.ts") ?? ""}\nexport { default as planted } from "#plate/planted.generated.json" with { type: "json" };\n`,
    );

    assert.sameMembers(
      [...unservedTables(planted, ["src/index.ts"])],
      ["src/planted.generated.json"],
    );
  });
});
