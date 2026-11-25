import { regex } from "arkregex";
import { assert, describe, it } from "@effect/vitest";
import { Schema } from "effect";
import { readFileSync } from "node:fs";
import { brandRedacted } from "#plate/redact/walk.ts";
import { entries } from "#plate/test/modules.js";
import { acceptForTest } from "#plate/validate/verdict.ts";

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
 * The exports map's script entries, each by its subpath: every entry a host loads code from, so a
 * rule held over them holds over an entry the map gains, with no edit here.
 *
 * @returns The subpath of each entry whose target is a script, in the map's order.
 */
const scriptEntries = (): readonly string[] =>
  Object.entries(readManifest().exports).flatMap(([subpath, target]) =>
    regex("\\.[cm]?[jt]sx?$", "u").test(target) ? [subpath] : [],
  );

/**
 * The entry of the table of plate's modules, which the table leaves out: it exports the table
 * alone, and would import itself.
 */
const tableEntry = "./test/modules";

/**
 * Every published entry's exports, by its subpath: the table of plate's modules
 * (`#plate/test/modules.js`, which `pnpm run generate` writes) imports each script entry of the
 * exports map but its own statically, as a host loads it, through the package's own name. The
 * table is plain JavaScript beside a declaration of its shape, so the root program's `tsc` does
 * not follow its imports into the UI's `.tsx` modules, which only plate's DOM program compiles.
 *
 * @returns Each entry's exports, by its subpath.
 */
const published = (): ReadonlyMap<string, ReadonlyMap<string, unknown>> =>
  new Map(entries.map(([subpath, exports]) => [subpath, new Map(Object.entries(exports))]));

/**
 * List the exports of every published entry that are one of some named values, by its own name or
 * under any other.
 *
 * @param exported Each entry's exports, by its subpath ({@link published}).
 * @param named The values, by the name each is declared with.
 * @returns `<entry> <name>` for each name an entry exports one of them under, empty when none
 *   exports one.
 */
const publishedAmong = (
  exported: ReadonlyMap<string, ReadonlyMap<string, unknown>>,
  named: ReadonlyMap<string, unknown>,
): readonly string[] =>
  [...exported].flatMap(([entry, exports]) =>
    exportedAmong(exports, named).map((name) => `${entry} ${name}`),
  );

describe("the published entries, every script entry of the exports map", () => {
  it("are each in the table of plate's modules, but the table's own, in the map's order", () => {
    assert.deepStrictEqual(
      entries.map(([subpath]) => subpath),
      scriptEntries().filter((subpath) => subpath !== tableEntry),
      "the table of plate's modules is not the exports map's: run `pnpm run generate` in packages/plate",
    );
  });

  it("export no test seam, brand constructor, mark predicate or defect, under any name, the UI's server and client entries included", () => {
    const exported = published();

    assert.includeMembers([...exported.keys()], [".", "./ui", "./ui/client"]);
    assert.includeMembers([...(exported.get(".")?.keys() ?? [])], ["openAdmitted", "redact"]);
    assert.includeMembers([...(exported.get("./ui")?.keys() ?? [])], ["Item"]);
    assert.includeMembers([...(exported.get("./ui/client")?.keys() ?? [])], ["Responses"]);
    assert.deepStrictEqual(publishedAmong(exported, seams), []);
  });
});
