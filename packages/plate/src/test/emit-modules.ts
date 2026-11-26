/**
 * Write plate's tables of its modules, each a plain JavaScript module beside a declaration of its
 * contents: every script entry of the exports map, each module through the package's own name as a
 * host loads it, and every `"use client"` module under `src/`, each through `#plate/*`, the very
 * module the server shell loads, all imported statically, so a test reads their exports with no
 * import built at run time. A table is JavaScript so no program `tsc` checks follows its imports
 * into the UI's `.tsx` modules, which only plate's DOM program compiles.
 *
 * Core never imports `alpha/` (qti-pie's own alpha rule), so the modules split as that rule does:
 * `test/modules.js` holds core's, every module outside an `alpha/` folder but the table's own
 * entry, `./test/modules`; `alpha/modules.js` holds Alpha's, every module inside one. Each module's
 * exports are its name and value pairs, which a reader takes as a map.
 *
 * Run from plate's directory: `pnpm run generate` writes the four files; `pnpm run generate:check`
 * writes nothing and fails, naming each file, when one differs from what it would write, so a new
 * entry or client module fails the check until the tables are written again.
 *
 * @module
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { argv } from "node:process";
import { regex } from "arkregex";
import { Schema } from "effect";

/**
 * Plate's root.
 */
const packageRoot = path.resolve(import.meta.dirname, "..", "..");

/**
 * The core table's entry in the exports map, which the table leaves out: it would import itself.
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
 * The exports map's script entries but the core table's own, each subpath with its target, in the
 * map's order.
 */
const scriptEntries = Object.entries(
  Schema.decodeUnknownSync(Manifest)(
    JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf-8")),
  ).exports,
).filter(
  ([subpath, target]) => regex("\\.[cm]?[jt]sx?$", "u").test(target) && subpath !== ownEntry,
);

/**
 * The `"use client"` modules under `src/`, by their paths there, sorted.
 */
const clientModules = readdirSync(path.join(packageRoot, "src"), {
  encoding: "utf-8",
  recursive: true,
})
  .filter(
    (file) =>
      regex("\\.tsx?$", "u").test(file) &&
      !regex("\\.test\\.tsx?$", "u").test(file) &&
      useClient.test(readFileSync(path.join(packageRoot, "src", file), "utf-8")),
  )
  .toSorted();

/**
 * One table: the files it is written to, what its JSDoc calls its modules, and its entries'
 * subpaths and its client modules' paths.
 */
interface Table {
  readonly about: readonly string[];
  readonly clients: readonly string[];
  readonly entries: readonly string[];
  readonly file: string;
}

/**
 * The two tables, split as qti-pie's alpha rule splits modules: core's, outside every `alpha/`
 * folder, and Alpha's, inside one.
 */
const tables: readonly Table[] = [
  {
    about: [
      "Plate's table of core's modules, every one outside an `alpha/` folder but this table's own entry:",
      'each script entry of the exports map, by its subpath, and each `"use client"` module under',
      "`src/`, by its path there, with its exports as name and value pairs, imported statically: the",
      "entries through the package's own name, as a host loads them, and the client modules through",
      "`#plate/*`, as the server shell does. `src/test/emit-modules.ts` writes it, and its check holds",
      "it to the sources.",
    ],
    clients: clientModules.filter((file) => !file.startsWith("alpha/")),
    entries: scriptEntries
      .filter(([, target]) => !target.startsWith("./src/alpha/"))
      .map(([subpath]) => subpath),
    file: "src/test/modules",
  },
  {
    about: [
      "Plate's table of Alpha's modules, every one inside an `alpha/` folder: each script entry of the",
      'exports map, by its subpath, and each `"use client"` module under `src/`, by its path there, with',
      "its exports as name and value pairs, imported statically: the entries through the package's own",
      "name, as a host loads them, and the client modules through `#plate/*`, as the server shell does.",
      "`src/test/emit-modules.ts` writes it, and its check holds it to the sources.",
    ],
    clients: clientModules.filter((file) => file.startsWith("alpha/")),
    entries: scriptEntries
      .filter(([, target]) => target.startsWith("./src/alpha/"))
      .map(([subpath]) => subpath),
    file: "src/alpha/modules",
  },
];

/**
 * A table's module JSDoc.
 *
 * @param table The table.
 * @returns Its lines.
 */
const aboutOf = (table: Table): readonly string[] => [
  "/**",
  ...table.about.map((line) => ` * ${line}`),
  " *",
  " * @module",
  " */",
];

/**
 * A table's module, as its `.js` file holds it.
 *
 * @param table The table.
 * @returns Its text.
 */
const moduleOf = (table: Table): string =>
  [
    ...aboutOf(table),
    ...table.entries.map(
      (subpath, at) => `import * as entry${String(at)} from "@qti-pie/plate${subpath.slice(1)}";`,
    ),
    ...table.clients.map((file, at) => `import * as client${String(at)} from "#plate/${file}";`),
    "",
    "/**",
    " * The table's script entries, each subpath with its module's exports, in the map's order.",
    " */",
    "export const entries = Object.freeze([",
    ...table.entries.map((subpath, at) => `  ["${subpath}", Object.entries(entry${String(at)})],`),
    "]);",
    "",
    "/**",
    ' * The table\'s `"use client"` modules, each path under `src/` with its exports, sorted.',
    " */",
    "export const clients = Object.freeze([",
    ...table.clients.map((file, at) => `  ["${file}", Object.entries(client${String(at)})],`),
    "]);",
    "",
  ].join("\n");

/**
 * A table's declaration, as its `.d.ts` file holds it.
 *
 * @param table The table.
 * @returns Its text.
 */
const declarationOf = (table: Table): string =>
  [
    ...aboutOf(table),
    "",
    "/**",
    " * The table's script entries, each subpath with its module's exports, in the map's order.",
    " */",
    "export declare const entries: readonly (readonly [",
    "  subpath: string,",
    "  exports: readonly (readonly [name: string, value: unknown])[],",
    "])[];",
    "",
    "/**",
    ' * The table\'s `"use client"` modules, each path under `src/` with its exports, sorted.',
    " */",
    "export declare const clients: readonly (readonly [",
    "  file: string,",
    "  exports: readonly (readonly [name: string, value: unknown])[],",
    "])[];",
    "",
  ].join("\n");

/**
 * Each file the run writes or checks, by its path under the package.
 */
const written = tables.flatMap((table) => [
  [`${table.file}.js`, moduleOf(table)] as const,
  [`${table.file}.d.ts`, declarationOf(table)] as const,
]);

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
