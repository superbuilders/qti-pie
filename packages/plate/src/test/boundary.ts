/**
 * Test support for plate's boundary suites, core's (`#plate/boundary.test.ts`) and Alpha's
 * (`#plate/alpha/boundary.test.ts`): the seams no published entry exports, the exports map's script
 * entries, and each entry's exports as a table of plate's modules holds them
 * (`#plate/test/modules.js`, `#plate/alpha/modules.js`, which `pnpm run generate` writes).
 *
 * @module
 */
import { readFileSync } from "node:fs";
import { regex } from "arkregex";
import { Schema } from "effect";
import { brandRedacted } from "#plate/redact/walk.ts";
import { acceptForTest } from "#plate/validate/verdict.ts";

/**
 * The seams that make an accepted root or a `Redacted` without `openAdmitted` or `redact`: no
 * published entry exports one.
 */
export const seams: ReadonlyMap<string, unknown> = new Map<string, unknown>([
  ["acceptForTest", acceptForTest],
  ["brandRedacted", brandRedacted],
]);

/**
 * The parts of `package.json` the boundary suites read.
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
    JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf-8")),
  );

/**
 * The exports map's script entries, each by its subpath with the target it names: every entry a
 * host loads code from, so a rule held over them holds over an entry the map gains, with no edit
 * in a suite.
 *
 * @returns `[subpath, target]` for each entry whose target is a script, in the map's order.
 */
export const scriptEntries = (): readonly (readonly [subpath: string, target: string])[] =>
  Object.entries(readManifest().exports).flatMap(([subpath, target]) =>
    regex("\\.[cm]?[jt]sx?$", "u").test(target) ? [[subpath, target] as const] : [],
  );

/**
 * Whether an entry's target is one of Alpha's modules, inside plate's `src/alpha/`, which core
 * never imports and Alpha's table holds.
 *
 * @param target The target, as the exports map names it.
 * @returns Whether it is.
 */
export const isAlphaTarget = (target: string): boolean => target.startsWith("./src/alpha/");

/**
 * Each entry of a table of plate's modules with its exports, by name.
 *
 * @param table The table's entries, each subpath with its exports as name and value pairs.
 * @returns Each entry's exports, by its subpath.
 */
export const published = (
  table: readonly (readonly [subpath: string, exports: readonly (readonly [string, unknown])[]])[],
): ReadonlyMap<string, ReadonlyMap<string, unknown>> =>
  new Map(table.map(([subpath, exports]) => [subpath, new Map(exports)]));

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
 * List the exports of every published entry that are one of some named values, by its own name or
 * under any other.
 *
 * @param exported Each entry's exports, by its subpath ({@link published}).
 * @param named The values, by the name each is declared with.
 * @returns `<entry> <name>` for each name an entry exports one of them under, empty when none
 *   exports one.
 */
export const publishedAmong = (
  exported: ReadonlyMap<string, ReadonlyMap<string, unknown>>,
  named: ReadonlyMap<string, unknown>,
): readonly string[] =>
  [...exported].flatMap(([entry, exports]) =>
    exportedAmong(exports, named).map((name) => `${entry} ${name}`),
  );
