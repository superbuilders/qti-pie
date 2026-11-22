/**
 * Static imports, read from TypeScript source, for the tests that hold the package's module graph
 * to a rule, such as the served tables (`src/boundary.test.ts`), and for the lint config, which
 * derives the modules a page loads from the islands' closure as it loads (`plateClientModules` in
 * the repository's `oxlint.config.ts`, through `@qti-pie/plate/test/imports`).
 *
 * {@link readImports} parses a module with vite's `parseAst` (Oxc's parser, which `vitest/node`
 * re-exports) and reads every top-level `import` declaration and every `export … from`. A dynamic
 * `import(…)` and `import.meta` are not declarations. A module that does not parse, and a
 * declaration it does not classify, are reported as unreadable, never skipped, so a test that reads
 * a module's imports fails on a form of import the reader does not know instead of passing it.
 *
 * A declaration loads its module at run time unless it is type-only as a whole (`import type`,
 * `export type`): under `verbatimModuleSyntax`, `import { type A } from "x"` is kept as
 * `import {} from "x"`.
 *
 * Test support: nothing outside `src/test/`, test files and the lint config imports it.
 *
 * @module
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Predicate, Result } from "effect";
import { parseAst } from "vitest/node";

/**
 * One name a declaration imports or re-exports.
 */
export interface ImportedName {
  /**
   * The name before `as`; `default` for a default import, and `*` for a namespace import or an
   * `export *`.
   */
  readonly name: string;
  /**
   * Whether this name alone is type-only, as `A` is in `import { type A } from "x"`.
   */
  readonly typeOnly: boolean;
}

/**
 * One static `import` declaration, or one `export … from`.
 */
export interface StaticImport {
  /**
   * The line the declaration starts on, from 1.
   */
  readonly line: number;
  /**
   * The names it imports, in source order; empty for a bare `import "…"`.
   */
  readonly names: readonly ImportedName[];
  /**
   * The module specifier, without its quotes.
   */
  readonly specifier: string;
  /**
   * Whether the whole declaration is type-only (`import type`, `export type`).
   */
  readonly typeOnly: boolean;
}

/**
 * What {@link readImports} reads from one module.
 */
export interface ModuleImports {
  readonly imports: readonly StaticImport[];
  /**
   * The lines of the `import` and `export` declarations it could not classify.
   */
  readonly unreadable: readonly number[];
}

/**
 * The prefix of the package's own import alias, which resolves to `src/`.
 */
const plateAlias = "#plate/";

/**
 * One statement of a module, as vite's parser gives it.
 */
type Statement = ReturnType<typeof parseAst>["body"][number];

/**
 * A name an `import { … }` or `export { … } from` names in the module it loads: an identifier, or
 * a string literal (`import { "a-b" as c }`).
 */
type ModuleName = Extract<
  Statement,
  { type: "ExportNamedDeclaration" }
>["specifiers"][number]["local"];

/**
 * What reading one statement gives: a declaration, a declaration that does not read, or nothing
 * to read (any other statement, a local export among them).
 */
type Reading =
  | { readonly kind: "import"; readonly value: Omit<StaticImport, "line"> }
  | { readonly kind: "none" }
  | { readonly kind: "unreadable" };

/**
 * The reading of a statement that imports nothing.
 */
const none: Reading = { kind: "none" };

/**
 * The reading of a declaration the reader does not classify.
 */
const notRead: Reading = { kind: "unreadable" };

/**
 * Give the name a specifier names in the module it loads.
 *
 * @param name The specifier's imported or local name.
 * @returns The identifier's name, or the string literal's value.
 */
const nameOf = (name: ModuleName): string => (name.type === "Literal" ? name.value : name.name);

/**
 * Read one statement of a module.
 *
 * @param statement The statement.
 * @returns The declaration it is, nothing for a statement that loads no module, and unreadable for
 *   `import x = require("…")`, which the reader does not classify.
 */
const readingOf = (statement: Statement): Reading => {
  if (statement.type === "ImportDeclaration") {
    return {
      kind: "import",
      value: {
        names: statement.specifiers.map((specifier) =>
          specifier.type === "ImportSpecifier"
            ? { name: nameOf(specifier.imported), typeOnly: specifier.importKind === "type" }
            : {
                name: specifier.type === "ImportDefaultSpecifier" ? "default" : "*",
                typeOnly: false,
              },
        ),
        specifier: statement.source.value,
        typeOnly: statement.importKind === "type",
      },
    };
  }

  if (statement.type === "ExportAllDeclaration") {
    return {
      kind: "import",
      value: {
        names: [{ name: "*", typeOnly: false }],
        specifier: statement.source.value,
        typeOnly: statement.exportKind === "type",
      },
    };
  }

  if (statement.type === "ExportNamedDeclaration" && statement.source !== null) {
    return {
      kind: "import",
      value: {
        names: statement.specifiers.map((specifier) => ({
          name: nameOf(specifier.local),
          typeOnly: specifier.exportKind === "type",
        })),
        specifier: statement.source.value,
        typeOnly: statement.exportKind === "type",
      },
    };
  }

  return statement.type === "TSImportEqualsDeclaration" &&
    statement.moduleReference.type === "TSExternalModuleReference"
    ? notRead
    : none;
};

/**
 * Give the line an offset of a source falls on.
 *
 * @param source The source.
 * @param index The offset.
 * @returns The line, from 1.
 */
const lineOf = (source: string, index: number): number => source.slice(0, index).split("\n").length;

/**
 * Read a module's static imports: every top-level `import` declaration, bare ones included, and
 * every `export … from`, `export *` included, each whether written on one line or several.
 *
 * @param source The module's TypeScript source.
 * @param lang How to parse it: `"tsx"` for a module that holds JSX, `"ts"` by default.
 * @returns The declarations in source order, and the lines of those it could not classify: the
 *   line the parser stopped on, for a module that does not parse.
 */
export const readImports = (source: string, lang: "ts" | "tsx" = "ts"): ModuleImports =>
  Result.match(
    Result.try({
      // The parser's failure names the offset it stopped at as `pos`; one that names none reads as
      // the source's start.
      catch: (error) =>
        Predicate.hasProperty(error, "pos") && Predicate.isNumber(error.pos) ? error.pos : 0,
      try: () => parseAst(source, { lang }),
    }),
    {
      onFailure: (offset) => ({ imports: [], unreadable: [lineOf(source, offset)] }),
      onSuccess: (program) => {
        const readings = program.body.map((statement) => ({
          line: lineOf(source, statement.start),
          reading: readingOf(statement),
        }));

        return {
          imports: readings.flatMap(({ line, reading }) =>
            reading.kind === "import" ? [{ line, ...reading.value }] : [],
          ),
          unreadable: readings.flatMap(({ line, reading }) =>
            reading.kind === "unreadable" ? [line] : [],
          ),
        };
      },
    },
  );

/**
 * Read the static imports of one module of the package map by its path: none for a JSON module,
 * which imports nothing, and a `.tsx` module parsed as one.
 *
 * @param module The module's path under the package.
 * @param source Its source.
 * @returns What {@link readImports} reads from it.
 */
const importsOf = (module: string, source: string): ModuleImports =>
  module.endsWith(".json")
    ? { imports: [], unreadable: [] }
    : readImports(source, module.endsWith(".tsx") ? "tsx" : "ts");

/**
 * Resolve a `#plate/` specifier to the module it names, by path under the package.
 *
 * @param specifier The specifier.
 * @returns `src/<x>` for `#plate/<x>`, or undefined for any other specifier.
 */
const resolvePlate = (specifier: string): string | undefined =>
  specifier.startsWith(plateAlias) ? `src/${specifier.slice(plateAlias.length)}` : undefined;

/**
 * Collect every module the roots reach through declarations that load a module: an `import` or
 * `export … from` that is not type-only as a whole, of a `#plate/` specifier. A module reached only
 * through `import type` or `export type` is not reached.
 *
 * @param modules The modules' sources, by path under the package (`src/<x>`).
 * @param roots The paths to start from.
 * @returns The paths reached, the roots included, in the order the walk first reached them. A
 *   path not in `modules` is reached but not read.
 */
export const valueClosure = (
  modules: ReadonlyMap<string, string>,
  roots: readonly string[],
): readonly string[] => {
  const reached = new Set<string>();

  /**
   * Reach a module once, then every module its value declarations load.
   *
   * @param module The module's path under the package.
   */
  const visit = (module: string): void => {
    const source = modules.get(module);

    if (reached.has(module)) {
      return;
    }

    reached.add(module);

    for (const declaration of source === undefined ? [] : importsOf(module, source).imports) {
      const target = resolvePlate(declaration.specifier);

      if (target !== undefined && !declaration.typeOnly) {
        visit(target);
      }
    }
  };

  for (const root of roots) {
    visit(root);
  }

  return [...reached];
};

/**
 * A module's leading `"use client"` directive, after any comments: what a React Server Components
 * bundler reads to cut the server's module graph there and ship the module, with everything it
 * imports, to the browser.
 *
 * @see https://react.dev/reference/rsc/use-client
 */
const useClient = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*(?<quote>["'])use client\k<quote>/u;

/**
 * Select the client modules among some sources: every non-test module whose first statement is the
 * `"use client"` directive, wherever it sits, so a new island is one the moment it is written.
 *
 * @param sources The modules' sources, by path under the package.
 * @returns Their paths, in the order given.
 */
export const clientModules = (sources: ReadonlyMap<string, string>): readonly string[] =>
  [...sources].flatMap(([module, source]) =>
    !/\.test\.tsx?$/u.test(module) && useClient.test(source) ? [module] : [],
  );

/**
 * Read the package's modules, tests included, from disk: its TypeScript sources, the UI's `.tsx`
 * among them, and its JSON files, which a source imports `with { type: "json" }`.
 *
 * A `.tsx` module is read as any other: its imports precede its JSX, so {@link readImports} reads
 * them, and every rule that walks the graph walks through the UI (`src/ui/`). A JSON module reads
 * as a module with no import declarations, so a walk reaches it and stops there, and a `#plate/`
 * import of one is not a missing module.
 *
 * @returns Each `.ts`, `.tsx` and `.json` file under `src/`, by path under the package
 *   (`src/<x>`), in path order.
 */
export const sourceModules = (): ReadonlyMap<string, string> => {
  const root = new URL("../", import.meta.url);

  return new Map(
    readdirSync(root, { encoding: "utf-8", recursive: true })
      .filter((file) => /\.(?:json|tsx?)$/u.test(file))
      .toSorted()
      .map((file) => [
        `src/${file.split(path.sep).join("/")}`,
        readFileSync(new URL(file, root), "utf-8"),
      ]),
  );
};
