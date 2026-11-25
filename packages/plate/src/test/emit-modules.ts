/**
 * Write plate's table of its modules, `test/modules.js`, and its types, `test/modules.d.ts`: every
 * script entry of the exports map, each module through the package's own name as a host loads it,
 * and every `"use client"` module under `src/`, each through `#plate/*`, the very module the server
 * shell loads, all imported statically, so a test reads their exports with no import built at run
 * time. The table is plain JavaScript beside a declaration of its shape, so no program `tsc`
 * checks follows its imports into the UI's `.tsx` modules, which only plate's DOM program compiles;
 * its own entry, `./test/modules`, it leaves out.
 *
 * Run from plate's directory: `pnpm run generate` writes both files; `pnpm run generate:check`
 * writes nothing and fails, naming each file, when either differs from what it would write, so a
 * new entry or client module fails the check until the table is written again.
 *
 * @module
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { argv } from "node:process";
import { regex } from "arkregex";
import { Schema } from "effect";

/**
 * Plate's root and its `src/`.
 */
const packageRoot = path.resolve(import.meta.dirname, "..", "..");

/**
 * The table's entry in the exports map, which the table leaves out: it would import itself.
 */
const ownEntry = "./test/modules";

/**
 * The exports map of plate's `package.json`.
 */
const Manifest = Schema.Struct({ exports: Schema.Record(Schema.String, Schema.String) });

/**
 * A module's first statement as the `"use client"` directive, after any comments.
 */
const useClient = regex(
  "^(?:\\s|//[^\n]*\n|/\\*[\\s\\S]*?\\*/)*(?<quote>[\"'])use client\\k<quote>",
  "u",
);

/**
 * The exports map's script entries but the table's own, by subpath, in the map's order.
 */
const entries = Object.entries(
  Schema.decodeUnknownSync(Manifest)(
    JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf-8")),
  ).exports,
).flatMap(([subpath, target]) =>
  regex("\\.[cm]?[jt]sx?$", "u").test(target) && subpath !== ownEntry ? [subpath] : [],
);

/**
 * The `"use client"` modules under `src/`, by their paths there, sorted.
 */
const clients = readdirSync(path.join(packageRoot, "src"), { encoding: "utf-8", recursive: true })
  .filter(
    (file) =>
      regex("\\.tsx?$", "u").test(file) &&
      !regex("\\.test\\.tsx?$", "u").test(file) &&
      useClient.test(readFileSync(path.join(packageRoot, "src", file), "utf-8")),
  )
  .toSorted();

/**
 * What the table's module JSDoc says of it.
 */
const about = [
  "/**",
  " * Every script entry of plate's exports map but this table's own, by its subpath, and every",
  " * `\"use client\"` module under plate's `src/`, by its path there, each with its module's exports,",
  " * imported statically: the entries through the package's own name, as a host loads them, and the",
  " * client modules through `#plate/*`, as the server shell does. Written by",
  " * `src/test/emit-modules.ts` (`pnpm run generate`), which `pnpm run generate:check` holds it to.",
  " *",
  " * @module",
  " */",
] as const;

/**
 * The table, as `test/modules.js` holds it.
 */
const table = [
  ...about,
  ...entries.map(
    (subpath, at) => `import * as entry${String(at)} from "@qti-pie/plate${subpath.slice(1)}";`,
  ),
  ...clients.map((file, at) => `import * as client${String(at)} from "#plate/${file}";`),
  "",
  "/**",
  " * The exports map's script entries, each subpath with its module's exports, in the map's order.",
  " */",
  "export const entries = Object.freeze([",
  ...entries.map((subpath, at) => `  ["${subpath}", entry${String(at)}],`),
  "]);",
  "",
  "/**",
  ' * The `"use client"` modules, each path under `src/` with its module\'s exports, sorted.',
  " */",
  "export const clients = Object.freeze([",
  ...clients.map((file, at) => `  ["${file}", client${String(at)}],`),
  "]);",
  "",
].join("\n");

/**
 * The table's types, as `test/modules.d.ts` holds them.
 */
const types = [
  ...about,
  "",
  "/**",
  " * The exports map's script entries, each subpath with its module's exports, in the map's order.",
  " */",
  "export declare const entries: readonly (readonly [",
  "  subpath: string,",
  "  exports: Readonly<Record<string, unknown>>,",
  "])[];",
  "",
  "/**",
  ' * The `"use client"` modules, each path under `src/` with its module\'s exports, sorted.',
  " */",
  "export declare const clients: readonly (readonly [",
  "  file: string,",
  "  exports: Readonly<Record<string, unknown>>,",
  "])[];",
  "",
].join("\n");

/**
 * Each file the run writes or checks, by its path under the package.
 */
const written = [
  ["src/test/modules.js", table],
  ["src/test/modules.d.ts", types],
] as const;

/**
 * Whether the run checks the files instead of writing them.
 */
const check = argv.includes("--check");

/**
 * The files whose committed bytes differ from what the run would write.
 */
const drifted = written.flatMap(([file, text]) => {
  const at = path.join(packageRoot, file);

  if (!check) {
    writeFileSync(at, text);

    return [];
  }

  return existsSync(at) && readFileSync(at, "utf-8") === text ? [] : [file];
});

if (drifted.length > 0) {
  process.stderr.write(
    `${drifted.join(", ")} differ from what src/test/emit-modules.ts writes: run \`pnpm run generate\` in packages/plate and commit the result.\n`,
  );
  process.exitCode = 1;
}
