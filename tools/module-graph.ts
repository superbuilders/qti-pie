/**
 * Module graphs read from the repository's root: every static import of every module, the closure
 * of what loads at run time, and the modules a page loads. It is the one reader of plate's graph,
 * for the lint config, which derives the modules a page loads as it loads (`plateClientModules` in
 * `oxlint.config.ts`), and for the root's suite that holds plate's graph to its rules
 * (`#tools/module-graph.test.ts`); and the one reader of crust's run time, which the root's suite
 * holds to loading no module that names Node's `Buffer` (`#tools/crust-runtime.test.ts`).
 *
 * {@link readImports} parses a module with Oxc's parser (`oxc-parser`, a devDependency of the
 * repository's root alone, so no consumer of plate installs it) and reads every top-level `import`
 * declaration and every `export … from`, and the loads its code makes at run time beyond them: a
 * dynamic `import(…)` and a CommonJS `require(…)` of a written specifier. A module that does not
 * parse, a declaration it does not classify, and a load of a specifier its code computes are
 * reported as unreadable, never skipped, so a check that reads a module's imports fails on a form
 * of import the reader does not know instead of passing it. Plate's graph follows declarations
 * alone, as a React Server Components bundler cuts a page's graph; crust's run time follows every
 * load.
 *
 * A declaration loads its module at run time unless it is type-only as a whole (`import type`,
 * `export type`): under `verbatimModuleSyntax`, `import { type A } from "x"` is kept as
 * `import {} from "x"`.
 *
 * @module
 */
import { regex } from "arkregex";
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { isBuiltin } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Schema } from "effect";
import { parseSync, Visitor } from "oxc-parser";
import type { Argument, Program } from "oxc-parser";

/**
 * One name a declaration imports or re-exports.
 */
interface ImportedName {
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
interface StaticImport {
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
 * One load a module's code makes at run time beside its declarations: a dynamic `import(…)` or a
 * CommonJS `require(…)` of a written specifier.
 */
interface RuntimeLoad {
  /**
   * The line the load is written on, from 1.
   */
  readonly line: number;
  /**
   * The module specifier, without its quotes.
   */
  readonly specifier: string;
}

/**
 * What {@link readImports} reads from one module.
 */
interface ModuleImports {
  readonly imports: readonly StaticImport[];
  readonly loads: readonly RuntimeLoad[];
  /**
   * The lines of the `import` and `export` declarations it could not classify, and of the loads
   * whose specifier its code computes.
   */
  readonly unreadable: readonly number[];
}

/**
 * How a module is parsed: as TypeScript, as TypeScript with JSX, or as JavaScript, ES module or
 * CommonJS as its syntax says.
 */
type Language = "js" | "ts" | "tsx";

/**
 * The prefix of plate's own import alias, which resolves to its `src/`.
 */
const plateAlias = "#plate/";

/**
 * Whether a value the parser or a manifest gives is text: a literal's written string, or a path
 * where a manifest could also hold a condition object.
 */
const isText = Schema.is(Schema.String);

/**
 * One statement of a module, as Oxc's parser gives it.
 */
type Statement = Program["body"][number];

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
 * every `export … from`, `export *` included, each whether written on one line or several; and its
 * loads at run time beside them, each `import(…)` and `require(…)` of a written specifier.
 *
 * @param source The module's source.
 * @param lang How to parse it: `"tsx"` for a module that holds JSX, `"ts"` for any other TypeScript,
 *   `"js"` for JavaScript, an ES module or CommonJS.
 * @returns The declarations and the loads in source order, and the lines of those it could not
 *   classify: the line of the parser's first error, for a module that does not parse.
 */
const readImports = (source: string, lang: Language): ModuleImports => {
  const { errors, program } = parseSync(`module.${lang}`, source, {
    lang,
    sourceType: lang === "js" ? "unambiguous" : "module",
  });
  const [error] = errors;

  if (error !== undefined) {
    return { imports: [], loads: [], unreadable: [lineOf(source, error.labels[0]?.start ?? 0)] };
  }

  const readings = program.body.map((statement) => ({
    line: lineOf(source, statement.start),
    reading: readingOf(statement),
  }));
  const loads: RuntimeLoad[] = [];
  const computed: number[] = [];
  const load = (specifier: Argument, at: number) => {
    if (specifier.type === "Literal" && isText(specifier.value)) {
      loads.push({ line: lineOf(source, at), specifier: specifier.value });
    } else {
      computed.push(lineOf(source, at));
    }
  };

  new Visitor({
    CallExpression: (node) => {
      const [first] = node.arguments;

      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "require" &&
        first !== undefined
      ) {
        load(first, node.start);
      }
    },
    ImportExpression: (node) => {
      load(node.source, node.start);
    },
  }).visit(program);

  return {
    imports: readings.flatMap(({ line, reading }) =>
      reading.kind === "import" ? [{ line, ...reading.value }] : [],
    ),
    loads,
    unreadable: [
      ...readings.flatMap(({ line, reading }) => (reading.kind === "unreadable" ? [line] : [])),
      ...computed,
    ],
  };
};

/**
 * Give the language a module is parsed in, by its file's extension.
 *
 * @param module The module's path.
 * @returns `"tsx"` for `.tsx`, `"ts"` for `.ts` and `.mts`, and `"js"` for any other.
 */
const languageOf = (module: string): Language => {
  if (module.endsWith(".tsx")) {
    return "tsx";
  }

  return module.endsWith(".ts") || module.endsWith(".mts") ? "ts" : "js";
};

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
    ? { imports: [], loads: [], unreadable: [] }
    : readImports(source, languageOf(module));

/**
 * Where a specifier leads from a module: to a module of the graph, by its name; outside the graph,
 * which the walk leaves (another package of plate's, a Node built-in); or nowhere, a specifier the
 * graph's resolution cannot follow.
 */
type Resolution =
  | { readonly kind: "module"; readonly module: string }
  | { readonly kind: "outside" }
  | { readonly kind: "unresolved" };

/**
 * One load the walk follows, of any form: a declaration's or a load's specifier, and whether it
 * loads nothing at run time (a type-only declaration).
 */
interface Load {
  readonly form: "declaration" | "run time";
  readonly specifier: string;
  readonly typeOnly: boolean;
}

/**
 * A module graph as a walk reads it: each module's source by its name, none for a module the graph
 * holds no source of; where a specifier leads from a module; and which loads the walk follows.
 */
export interface Graph {
  readonly follows: (load: Load) => boolean;
  readonly resolve: (specifier: string, from: string) => Resolution;
  readonly sourceOf: (module: string) => string | undefined;
}

/**
 * What a walk of a graph found: the modules it reached; the specifiers it followed outside the
 * graph, another package or a Node built-in; and the specifiers it could not follow and the lines
 * it could not read; each with the module they stand in.
 */
export interface Closure {
  readonly outside: readonly { readonly module: string; readonly specifier: string }[];
  readonly reached: readonly string[];
  readonly unreadable: readonly { readonly line: number; readonly module: string }[];
  readonly unresolved: readonly { readonly module: string; readonly specifier: string }[];
}

/**
 * Collect every module the roots reach through the loads a graph follows.
 *
 * @param graph The graph.
 * @param roots The modules to start from.
 * @returns The modules reached, the roots included, in the order the walk first reached them, a
 *   module the graph holds no source of reached but not read; every specifier it followed outside
 *   the graph; and every specifier and line it could not follow or read.
 */
export const closureOf = (graph: Graph, roots: readonly string[]): Closure => {
  const outside: { readonly module: string; readonly specifier: string }[] = [];
  const reached = new Set<string>();
  const unreadable: { readonly line: number; readonly module: string }[] = [];
  const unresolved: { readonly module: string; readonly specifier: string }[] = [];

  /**
   * Reach a module once, then every module its followed loads lead to.
   *
   * @param module The module's name.
   */
  const visit = (module: string): void => {
    if (reached.has(module)) {
      return;
    }

    reached.add(module);

    const source = graph.sourceOf(module);
    const read =
      source === undefined ? { imports: [], loads: [], unreadable: [] } : importsOf(module, source);
    const loads: readonly Load[] = [
      ...read.imports.map((declaration): Load => ({
        form: "declaration",
        specifier: declaration.specifier,
        typeOnly: declaration.typeOnly,
      })),
      ...read.loads.map((load): Load => ({
        form: "run time",
        specifier: load.specifier,
        typeOnly: false,
      })),
    ];

    for (const line of read.unreadable) {
      unreadable.push({ line, module });
    }

    for (const load of loads.filter((each) => graph.follows(each))) {
      const target = graph.resolve(load.specifier, module);

      if (target.kind === "module") {
        visit(target.module);
      } else if (target.kind === "outside") {
        outside.push({ module, specifier: load.specifier });
      } else {
        unresolved.push({ module, specifier: load.specifier });
      }
    }
  };

  for (const root of roots) {
    visit(root);
  }

  return { outside, reached: [...reached], unreadable, unresolved };
};

/**
 * Plate's graph over its modules' sources, as a page's bundler cuts it: every declaration that
 * loads a module, an `import` or `export … from` that is not type-only as a whole, of a `#plate/`
 * specifier (`src/<x>` for `#plate/<x>`); any other specifier leads outside plate.
 *
 * @param modules The modules' sources, by path under the package (`src/<x>`).
 * @returns The graph.
 */
const plateGraph = (modules: ReadonlyMap<string, string>): Graph => ({
  follows: (load) => load.form === "declaration" && !load.typeOnly,
  resolve: (specifier) =>
    specifier.startsWith(plateAlias)
      ? { kind: "module", module: `src/${specifier.slice(plateAlias.length)}` }
      : { kind: "outside" },
  sourceOf: (module) => modules.get(module),
});

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
): readonly string[] => closureOf(plateGraph(modules), roots).reached;

/**
 * Plate's graph as a host's bundler walks it from an entry: every load that brings a module at run
 * time, a declaration that is not type-only as a whole and a dynamic `import()` or a `require` of a
 * written specifier alike, each `#plate/` specifier to its module and any other outside plate. A
 * load of a specifier the code computes is the walk's unreadable line, since no bundler can follow
 * it either.
 *
 * @param modules The modules' sources, by path under the package (`src/<x>`).
 * @returns The graph.
 */
const hostGraph = (modules: ReadonlyMap<string, string>): Graph => ({
  ...plateGraph(modules),
  follows: (load) => !load.typeOnly,
});

/**
 * Walk plate's graph from the roots as a host's bundler loads them ({@link hostGraph}).
 *
 * @param modules The modules' sources, by path under the package (`src/<x>`).
 * @param roots The paths to start from.
 * @returns The closure: the paths reached, the specifiers that lead outside plate, and every line
 *   the walk could not read and specifier it could not follow.
 */
export const hostClosure = (
  modules: ReadonlyMap<string, string>,
  roots: readonly string[],
): Closure => closureOf(hostGraph(modules), roots);

/**
 * Name the package a bare specifier loads from: its first segment, or its first two where it is
 * scoped (`@scope/name`); a Node built-in by its own specifier.
 *
 * @param specifier The specifier.
 * @returns The package's name.
 */
const packageNameOf = (specifier: string): string => {
  const parts = specifier.split("/");

  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : (parts[0] ?? "");
};

/**
 * Name the packages outside plate the roots load at run time, as a host's bundler loads them
 * ({@link hostClosure}): every package a module of their closure loads, by a declaration or a
 * dynamic `import()` or `require` of a written specifier, so a host that imports the roots from
 * plate's sources installs exactly these, and a package reached only through `import type` is not
 * one.
 *
 * @param modules The modules' sources, by path under the package (`src/<x>`).
 * @param roots The paths to start from.
 * @returns The packages' names, each once, sorted.
 */
export const packagesLoaded = (
  modules: ReadonlyMap<string, string>,
  roots: readonly string[],
): readonly string[] =>
  [
    ...new Set(
      hostClosure(modules, roots).outside.map(({ specifier }) => packageNameOf(specifier)),
    ),
  ].toSorted();

/**
 * The export conditions Node resolves an `import` under: of a package's conditional exports, the
 * first of an object's keys, in the object's order, that is one of them wins.
 */
const importConditions: ReadonlySet<string> = new Set(["node", "import", "module-sync", "default"]);

/**
 * Whether a path names a file.
 *
 * @param file The path.
 * @returns True for a file, false for a folder or nothing.
 */
const isFile = (file: string): boolean =>
  statSync(file, { throwIfNoEntry: false })?.isFile() ?? false;

/**
 * Give the file a module path names as Node finds it: the path itself, or the path with `.js`, or
 * the folder's `index.js`, its real path, through pnpm's links.
 *
 * @param file The path.
 * @returns The module, or unresolved where no such file is.
 */
const fileAt = (file: string): Resolution => {
  const found = [file, `${file}.js`, path.join(file, "index.js")].find((candidate) =>
    isFile(candidate),
  );

  return found === undefined
    ? { kind: "unresolved" }
    : { kind: "module", module: realpathSync(found) };
};

/**
 * Give the target a package's exports or imports entry names under {@link importConditions}: a
 * path, or the first entry of a condition object whose key is a condition, read in turn.
 *
 * @param target The entry's value, as package.json holds it.
 * @returns The path, or none where the entry withholds the subpath or no condition applies.
 */
const targetOf = (target: ManifestTarget): string | undefined => {
  if (isText(target)) {
    return target;
  }

  if (target === null) {
    return undefined;
  }

  const applies = Object.entries(target).find(([condition]) => importConditions.has(condition));

  return applies === undefined ? undefined : targetOf(applies[1]);
};

/**
 * Match a subpath against a package's exports or imports map: its own key, or a key with one `*`
 * whose text around the star the subpath begins and ends with, the star's match put in the
 * target's.
 *
 * @param map The map.
 * @param subpath The subpath (`.`, `./x`, `#x`).
 * @returns The target path, or none where no key matches.
 */
const matchedIn = (map: ManifestMap, subpath: string): string | undefined => {
  const exact = map[subpath];

  if (exact !== undefined) {
    return targetOf(exact);
  }

  for (const [key, target] of Object.entries(map)) {
    const [head, tail] = key.split("*");

    if (
      tail !== undefined &&
      head !== undefined &&
      subpath.startsWith(head) &&
      subpath.endsWith(tail) &&
      subpath.length >= head.length + tail.length
    ) {
      return targetOf(target)?.replace(
        "*",
        subpath.slice(head.length, subpath.length - tail.length),
      );
    }
  }

  return undefined;
};

/**
 * An exports or imports entry of package.json: a path, null for a subpath it withholds, or a
 * condition object.
 */
type ManifestTarget = string | null | { readonly [condition: string]: ManifestTarget };

/**
 * An exports or imports map of package.json, by subpath.
 */
interface ManifestMap {
  readonly [subpath: string]: ManifestTarget;
}

/**
 * An exports or imports entry of package.json, decoded: a path, null, or a condition object of
 * entries.
 */
const ManifestTargetSchema = Schema.Union([
  Schema.String,
  Schema.Null,
  Schema.Record(
    Schema.String,
    Schema.suspend((): Schema.Codec<ManifestTarget> => ManifestTargetSchema),
  ),
]);

/**
 * The part of a package.json the resolution reads, decoded once as it is read: its exports, a map
 * by subpath or the one entry of `.`, its imports map, its main file, and its name, which a module
 * of the package may import it by.
 */
const ManifestSchema = Schema.Struct({
  exports: Schema.optionalKey(ManifestTargetSchema),
  imports: Schema.optionalKey(Schema.Record(Schema.String, ManifestTargetSchema)),
  main: Schema.optionalKey(Schema.String),
  name: Schema.optionalKey(Schema.String),
});

/**
 * Read a package's manifest.
 *
 * @param folder The package's folder.
 * @returns Its package.json, as the resolution reads it.
 */
const manifestIn = (folder: string): typeof ManifestSchema.Type =>
  Schema.decodeUnknownSync(Schema.fromJsonString(ManifestSchema))(
    readFileSync(path.join(folder, "package.json"), "utf-8"),
  );

/**
 * Give a package's exports as a map by subpath: the map it writes, or the one entry it writes for
 * `.` (a path, a null that exports nothing, or a condition object whose keys are no subpaths).
 *
 * @param exports The package's exports.
 * @returns The map.
 */
const exportsMap = (exports: ManifestTarget): ManifestMap =>
  exports === null || isText(exports) || !Object.keys(exports).some((key) => key.startsWith("."))
    ? { ".": exports }
    : exports;

/**
 * Give the folder of the package a file belongs to: the nearest folder above it that holds a
 * package.json.
 *
 * @param file The file.
 * @returns The folder.
 */
const packageOf = (file: string): string => {
  const folder = path.dirname(file);

  return isFile(path.join(folder, "package.json")) || folder === path.dirname(folder)
    ? folder
    : packageOf(folder);
};

/**
 * Find a package by its name from a module, as Node does: `node_modules/<name>` in the module's
 * folder and in each folder above it, the nearest first.
 *
 * @param name The package's name.
 * @param folder The folder to look from.
 * @returns The package's folder, or none where no folder above holds it.
 */
const installedFrom = (name: string, folder: string): string | undefined => {
  const candidate = path.join(folder, "node_modules", name);

  if (isFile(path.join(candidate, "package.json"))) {
    return candidate;
  }

  return folder === path.dirname(folder) ? undefined : installedFrom(name, path.dirname(folder));
};

/**
 * Resolve a specifier from a module as Node resolves an `import` of it: a Node built-in leads
 * outside; a relative path to its file; a `#` specifier through the module's package's imports; a
 * bare one to its package, the module's own where it names the package by its name, else found in
 * the nearest `node_modules`, through its exports under {@link importConditions}, or its `main`
 * where it states no exports. Each module is its real path.
 *
 * @param specifier The specifier.
 * @param from The module's real path.
 * @returns Where it leads.
 */
export const nodeResolve = (specifier: string, from: string): Resolution => {
  if (isBuiltin(specifier)) {
    return { kind: "outside" };
  }

  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    return fileAt(path.resolve(path.dirname(from), specifier));
  }

  if (specifier.startsWith("#")) {
    const folder = packageOf(from);
    const target = matchedIn(manifestIn(folder).imports ?? {}, specifier);

    return target === undefined ? { kind: "unresolved" } : fileAt(path.join(folder, target));
  }

  const name = packageNameOf(specifier);
  const own = packageOf(from);
  const folder = manifestIn(own).name === name ? own : installedFrom(name, path.dirname(from));

  if (folder === undefined) {
    return { kind: "unresolved" };
  }

  const subpath = `.${specifier.slice(name.length)}`;
  const { exports, main } = manifestIn(folder);

  if (exports === undefined) {
    return fileAt(path.join(folder, subpath === "." ? (main ?? "index.js") : subpath));
  }

  const target = matchedIn(exportsMap(exports), subpath);

  return target === undefined ? { kind: "unresolved" } : fileAt(path.join(folder, target));
};

/**
 * The folder of crust's package.
 */
const crustFolder = fileURLToPath(new URL("../packages/crust/", import.meta.url));

/**
 * Crust's run time: every module a crust entry loads when it runs, by real path, through every load
 * its code makes (declarations that load a module, dynamic imports and CommonJS requires), into
 * every dependency's modules as Node resolves them (saxes and its xmlchars, effect, arkregex,
 * grizzle-text). Its roots are the modules crust's exports map names, but its test support
 * (`./test/*`). A module's source is the file's on disk, but where `planted` gives another.
 *
 * @param planted Sources that stand in for some modules' own, by real path; none for the tree as
 *   it is.
 * @returns The closure.
 */
export const crustRuntime = (planted: ReadonlyMap<string, string>): Closure => {
  const { exports } = manifestIn(crustFolder);
  const roots = Object.entries(exports === undefined ? {} : exportsMap(exports))
    .filter(([subpath]) => !subpath.startsWith("./test/"))
    .flatMap(([, target]) => {
      const file = targetOf(target);

      return file === undefined ? [] : [realpathSync(path.join(crustFolder, file))];
    });

  return closureOf(
    {
      follows: (load) => !load.typeOnly,
      resolve: nodeResolve,
      sourceOf: (module) =>
        planted.get(module) ??
        (module.endsWith(".json") ? undefined : readFileSync(module, "utf-8")),
    },
    roots,
  );
};

/**
 * Give the lines of a module that name an identifier: a reference, a binding, a property's or a
 * member's name, anywhere in its code.
 *
 * @param module The module's path, which says how to parse it.
 * @param source Its source.
 * @param name The identifier.
 * @returns The lines, in source order, one for each place it is named.
 */
export const linesNaming = (module: string, source: string, name: string): readonly number[] => {
  const lang = languageOf(module);
  const { program } = parseSync(`module.${lang}`, source, {
    lang,
    sourceType: lang === "js" ? "unambiguous" : "module",
  });
  const lines: number[] = [];

  new Visitor({
    Identifier: (node) => {
      if (node.name === name) {
        lines.push(lineOf(source, node.start));
      }
    },
  }).visit(program);

  return lines;
};

/**
 * A module's leading `"use client"` directive, after any comments: what a React Server Components
 * bundler reads to cut the server's module graph there and ship the module, with everything it
 * imports, to the browser.
 *
 * @see https://react.dev/reference/rsc/use-client
 */
const useClient = regex(
  "^(?:\\s|//[^\n]*\n|/\\*[\\s\\S]*?\\*/)*(?<quote>[\"'])use client\\k<quote>",
  "u",
);

/**
 * Select the client modules among some sources: every non-test module whose first statement is the
 * `"use client"` directive, wherever it sits, so a new island is one the moment it is written.
 *
 * @param sources The modules' sources, by path under the package.
 * @returns Their paths, in the order given.
 */
export const clientModules = (sources: ReadonlyMap<string, string>): readonly string[] =>
  [...sources].flatMap(([module, source]) =>
    !regex("\\.test\\.tsx?$", "u").test(module) && useClient.test(source) ? [module] : [],
  );

/**
 * Read plate's modules, tests included, from disk: its TypeScript sources, the UI's `.tsx` among
 * them, and its JSON files, which a source imports `with { type: "json" }`.
 *
 * A `.tsx` module is read as any other: its imports precede its JSX, so {@link readImports} reads
 * them, and every rule that walks the graph walks through the UI (`src/ui/`). A JSON module reads
 * as a module with no import declarations, so a walk reaches it and stops there, and a `#plate/`
 * import of one is not a missing module.
 *
 * @returns Each `.ts`, `.tsx` and `.json` file under plate's `src/`, by path under the package
 *   (`src/<x>`), in path order.
 */
export const plateModules = (): ReadonlyMap<string, string> => {
  const root = new URL("../packages/plate/src/", import.meta.url);

  return new Map(
    readdirSync(root, { encoding: "utf-8", recursive: true })
      .filter((file) => regex("\\.(?:json|tsx?)$", "u").test(file))
      .toSorted()
      .map((file) => [
        `src/${file.split(path.sep).join("/")}`,
        readFileSync(new URL(file, root), "utf-8"),
      ]),
  );
};

/**
 * Tell whether a module of plate is the UI's own: a module under `src/ui/`, or a React module of
 * Alpha's renderers, a `.tsx` module under `src/alpha/`, which renders as the UI's do.
 *
 * @param module The module's path under the package.
 * @returns Whether it is the UI's.
 */
const isUiModule = (module: string): boolean =>
  module.startsWith("src/ui/") || (module.startsWith("src/alpha/") && module.endsWith(".tsx"));

/**
 * Plate's modules outside the UI that a `"use client"` module loads, and so a page: what the
 * islands import from the core, and what that imports in turn, by path from the repository's root
 * ({@link clientModules}, {@link valueClosure}), less the UI's own ({@link isUiModule}), in path
 * order.
 *
 * @param modules Plate's modules, by path under the package ({@link plateModules}).
 * @returns The paths, each `packages/plate/src/<x>`.
 */
export const plateClientModulesOf = (modules: ReadonlyMap<string, string>): readonly string[] =>
  valueClosure(modules, clientModules(modules))
    .filter((module) => !isUiModule(module))
    .map((module) => `packages/plate/${module}`)
    .toSorted();
