import { builtinModules } from "node:module";
import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import antiSlop from "ultracite/oxlint/anti-slop";
import { plateClientModulesOf, plateModules } from "#tools/module-graph.ts";

/**
 * Matches module declarations and calls without spacing local call groups.
 */
const topLevelUnit = {
  selector:
    'Program > :matches(ExportNamedDeclaration, ExportDefaultDeclaration, FunctionDeclaration, ClassDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration, TSEnumDeclaration, TSModuleDeclaration, VariableDeclaration, ExpressionStatement[expression.type="CallExpression"])',
};

/**
 * Matches direct and yielded Effect logs, including piped log annotations.
 */
const effectLogStatement = {
  selector:
    'ExpressionStatement:matches([expression.type="CallExpression"], [expression.type="YieldExpression"]):has(CallExpression[callee.type="MemberExpression"][callee.object.name="Effect"][callee.property.name=/^log(Trace|Debug|Info|Warning|Error|Fatal)?$/])',
};

/**
 * Import specifiers every module refuses: relative paths, and absolute or `file:` paths.
 */
const pathImportPatterns = [
  {
    message: "Use the package's `#<package>/*` import alias instead of a relative source import.",
    regex: "^\\.{1,2}/",
  },
  {
    message:
      "Use the package's `#<package>/*` import alias or a dependency's exported name instead of an absolute or `file:` path.",
    regex: "^(?:/|file:)",
  },
];

/**
 * The pattern by which core never imports `alpha/`. A package's `src/alpha/` holds Alpha's QTI
 * extensions, each conformant to the specification, and core, every module outside an `alpha/`
 * folder, reaches none of them: a host plugs one in through a registry, or content holds it, as an
 * item's package holds its PCI's module file. The pattern is the specifier's `alpha` segment, so it
 * refuses the package's own alias (`#plate/alpha/…`) and another package's export
 * (`@qti-pie/plate/alpha/…`) alike, a type-only import too. The overrides on `alpha/` folders, last
 * among the rule's, lift it there.
 */
const alphaImportPattern = {
  message:
    "Core never imports alpha/: Alpha's extensions reach a host through a registry, or content through its loader.",
  regex: "(?:^|/)alpha(?:/|$)",
};

/**
 * Import specifiers every core module refuses: {@link pathImportPatterns}, and
 * {@link alphaImportPattern}.
 */
const sharedImportPatterns = [...pathImportPatterns, alphaImportPattern];

/**
 * Every Node built-in, with or without `node:`, as a specifier pattern without its anchor.
 */
const nodeBuiltins = `(?:node:|(?:${builtinModules.join("|")})(?:/|$))`;

/**
 * Every Node built-in but node:crypto, the one plate's keyed digest loads, as a specifier pattern
 * without its anchor: the others with or without `node:`, and `crypto` without it. oxlint reads
 * the pattern with Rust's regex, which has no look-around to refuse node:crypto alone by.
 */
const nodeBuiltinsButCrypto = `(?:node:(?:${builtinModules
  .map((name) => name.replace(/^node:/u, ""))
  .filter((name) => name !== "crypto")
  .join("|")})|${builtinModules.join("|")})(?:/|$)`;

/**
 * The pattern by which plate's modules load no Node built-in, one of {@link plateCorePatterns}.
 */
const plateNodePattern = {
  allowTypeImports: true,
  message: "plate's modules run on any host, so they load no Node built-in.",
  regex: `^${nodeBuiltins}`,
};

/**
 * The pattern by which plate defines its UI SDK primitives through its own `definePrimitive`
 * (`#plate/ui/define-primitive.ts`), which refuses a slot whose parts take props but carry no key,
 * one of {@link plateCorePatterns}; that module's override, the one place it is lifted, defines
 * through UI SDK's.
 */
const plateDefinePattern = {
  allowTypeImports: true,
  importNames: ["definePrimitive"],
  message:
    "Define a plate primitive with definePrimitive from #plate/ui/define-primitive.ts, which refuses a slot whose parts take props but no key.",
  regex: "^@ui-sdk/core$",
};

/**
 * What plate's modules may not load, each refused by its own specifier, so the rule holds file by
 * file and needs no walk of the module graph. Its served entries (`.`, `./open`, `./package` and
 * the UI's four) stay loadable by any host, and its islands by a page: test support (the Node-only
 * corpus reader among it), every Node built-in (with or without `node:`; the keyed digest alone
 * loads `node:crypto`), the test runner by package, so no re-export under another name routes
 * around the list, and pantry and grizzle. A type-only import loads nothing, and is allowed. Nor
 * does a module but plate's own `definePrimitive` take UI SDK's ({@link plateDefinePattern}).
 */
const plateCorePatterns = [
  {
    allowTypeImports: true,
    message: "plate's modules load no test support: move the shared code out of src/test/.",
    regex: "^#plate/test/",
  },
  plateNodePattern,
  {
    allowTypeImports: true,
    message: "plate's modules load no test runner.",
    regex: "^(?:vitest|@effect/vitest|vite-plus)(?:/|$)|^@vitest/",
  },
  {
    allowTypeImports: true,
    message:
      "plate depends on crust, never on pantry, grizzle or grizzle-text: it reads grizzle-text through crust's re-exports (@qti-pie/crust/regex.ts, @qti-pie/crust/text.ts, @qti-pie/crust/uri.ts).",
    regex: "^(?:@qti-pie/pantry|@bjornpagen/grizzle(?:-text)?|@grizzle)(?:/|$)",
  },
  plateDefinePattern,
];

/**
 * The UI entries server code never imports, a type-only import included, since TypeScript compiles
 * what it names: the rendering entry and the client entry, whose modules reach the islands.
 */
const serverRefusedImportPaths = [
  {
    message:
      "Server code imports the UI's types from `@qti-pie/plate/ui/props`, never the UI's rendering entry.",
    name: "@qti-pie/plate/ui",
  },
  {
    message:
      "Server code imports the UI's types from `@qti-pie/plate/ui/props`, never the UI's client entry.",
    name: "@qti-pie/plate/ui/client",
  },
];

/**
 * Plate's modules outside `src/ui/` that a `"use client"` module loads, and so a page: what the
 * islands import from the core, and what that imports in turn, by path from the repository's root.
 * The list is derived as the config loads, by the root's one reader of plate's module graph
 * (`plateClientModulesOf` in `#tools/module-graph.ts`): every `"use client"` module, and every
 * module reached from one through a declaration that loads its module (`import type` and
 * `export type` load nothing), less the UI's own. So a module that joins the closure joins the
 * list, and nothing keeps the list by hand.
 */
const plateClientModules = plateClientModulesOf(plateModules());

/**
 * Plate's `alpha/` modules a page loads, from {@link plateClientModules}: they keep the page's bans
 * as core's do, and lift {@link alphaImportPattern} alone.
 */
const plateAlphaClientModules = plateClientModules.filter((module) =>
  module.startsWith("packages/plate/src/alpha/"),
);

/**
 * The options of the rule a module a page loads is held to, given the patterns its place takes
 * ({@link sharedImportPatterns} in core, {@link pathImportPatterns} in `alpha/`): from `effect` only
 * what costs a page little, no Schema, no Effect runtime, no Brand, and nothing but effect, plate's
 * own modules and crust's re-exports of grizzle-text. A type-only import loads nothing.
 *
 * @param patterns The place's patterns.
 * @returns The rule's options.
 */
const pageImportOptions = (patterns: typeof sharedImportPatterns) => ({
  paths: [
    {
      allowImportNames: ["Array", "Data", "Option", "Result", "pipe"],
      allowTypeImports: true,
      message:
        "A page loads this module: take only Array, Data, Option, Result and pipe from effect.",
      name: "effect",
    },
  ],
  patterns: [
    ...patterns,
    ...plateCorePatterns,
    {
      allowTypeImports: true,
      group: ["*", "!effect", "!#plate/**", "!@qti-pie/crust/regex.ts", "!@qti-pie/crust/text.ts"],
      message:
        "A page loads this module: load only effect, plate's own modules and crust's re-exports of grizzle-text.",
    },
  ],
});

/**
 * The React Compiler's rules, as the toolchain preset turns them on in edullm's apps: oxlint's
 * correctness category's compiler rules, which the preset runs by category, and the ones it names
 * (react/todo, react/unsupported-syntax, react/syntax and react/invariant refuse a function the
 * compiler cannot compile at all).
 */
const reactCompilerRules = {
  "react/capitalized-calls": "error",
  "react/error-boundaries": "error",
  "react/exhaustive-effect-dependencies": "error",
  "react/globals": "error",
  "react/hooks": "error",
  "react/immutability": "error",
  "react/incompatible-library": "error",
  "react/invariant": "error",
  "react/memo-dependencies": "error",
  "react/preserve-manual-memoization": "error",
  "react/purity": "error",
  "react/refs": "error",
  "react/set-state-in-effect": "error",
  "react/set-state-in-render": "error",
  "react/static-components": "error",
  "react/syntax": "error",
  "react/todo": "error",
  "react/unsupported-syntax": "error",
  "react/use-memo": "error",
  "react/void-use-memo": "error",
} as const;

export default defineConfig({
  extends: [core, antiSlop],
  // A fixture package's JS modules (a PCI's AMD module, its JSON module resolution file) are data a
  // test reads, not source. An Alpha PCI module file is its typed source with the types stripped,
  // byte for byte (`packages/plate/src/alpha/pci-modules.test.ts`): the source is linted.
  ignorePatterns: [
    // grizzle, this repository's submodule, is linted by its own gate and config.
    "vendor/**",
    "dist/**",
    ".agents/**",
    ".claude/**",
    "**/migrations/**",
    "packages/plate/fixtures/**",
    "packages/plate/src/alpha/pci-modules/*.js",
  ],
  jsPlugins: [
    "./tools/lint-plugin.ts",
    "@stylistic/eslint-plugin",
    "./vendor/toolchain/packages/devtools/src/oxlint-plugin.ts",
  ],
  // Keep source imports stable when files move: each package maps `#<package>/*` to its `src/` in package.json
  // `imports`, which Node resolves at run time and TypeScript resolves under nodenext.
  // The resolver already refuses an unlisted subpath and another package's alias; lint refuses what it allows:
  // a relative specifier, an absolute or `file:` specifier, and (in crust) the package's own name.
  // A later override replaces the rule's options for its files, so the crust override repeats the shared patterns.
  // The lint plugins under tools/ import each other through the root's `#tools/*` alias, as Node resolves it.
  // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-restricted-imports
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        "no-restricted-imports": ["error", { patterns: sharedImportPatterns }],
      },
    },
    {
      files: ["packages/specimen/**/*.ts", "packages/specimen/**/*.tsx"],
      rules: {
        "no-restricted-properties": [
          "error",
          ...[
            { object: "chromium", property: "launch" },
            { property: "newContext" },
            { property: "newPage" },
          ].map((restricted) => ({
            ...restricted,
            message:
              "Chrome, its contexts and its pages are opened by #specimen/ui/chrome.ts alone, with Playwright's timeouts at 0, so no verdict rests on a load deadline (2026-11-26: eight harnesses each opened Chrome, five kept Playwright's 30 s default, and page.goto timed out at load 300).",
          })),
        ],
      },
    },
    {
      files: ["packages/specimen/src/ui/chrome.ts"],
      rules: { "no-restricted-properties": "off" },
    },
    {
      files: ["packages/crust/**/*.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              ...sharedImportPatterns,
              {
                message:
                  "Import crust's own files through the `#crust/*` alias, not through the package name.",
                regex: "^@qti-pie/crust(?:/|$)",
              },
            ],
          },
        ],
      },
    },
    // specimen's hydration harness ships a page's element tree to the browser on its stand-in for
    // React Server Components' wire (`src/ui/wire.ts`): a serialization boundary, whose writer takes
    // any value an element's props hold, which React's element API types `unknown`, and whose reader
    // gives each back as it was, as the props of the elements it makes; the page reads the wire
    // through its Schema first, and its tree through `treeFromWire`, which gives an element.
    {
      files: ["packages/specimen/src/ui/wire.ts"],
      rules: {
        "anti-slop/no-known-value-widening": "off",
        "anti-slop/no-unknown-parameters": "off",
        "anti-slop/no-unknown-returns": "off",
        "anti-slop/no-unsafe-dictionary-type": "off",
      },
    },
    // pantry's command line describes and prints how a run failed: a run fails or dies with any
    // value, the squashed cause Effect types `unknown`, so `describeFailure` decodes it once, and the
    // printer reads each failure and defect it is handed, by their decoders and predicates, at the
    // one boundary that turns it into a kind, a next step, and text or the JSON error object. The
    // describer's suite hands it any value, as a run would.
    {
      files: ["packages/pantry/src/cli/errors.ts", "packages/pantry/src/cli/present.ts"],
      rules: { "anti-slop/no-unknown-parameters": "off" },
    },
    // crust reads and writes XML's encoding labels: `UTF-8`, `UTF-16LE` and `US-ASCII` are the labels
    // XML 1.0 section 4.3.3 and IANA spell, and `utf8` a closed encoder-class name, data of its table
    // and of the documents its tests read, never an identifier handed to a Node encoding API, which is
    // what the rule is for.
    {
      files: [
        "packages/crust/src/canonical.test.ts",
        "packages/crust/src/charset.test.ts",
        "packages/crust/src/charset.ts",
        "packages/crust/src/decode.ts",
        "packages/crust/src/scale.test.ts",
        "packages/crust/src/test/trees.ts",
        "packages/crust/src/write.test.ts",
      ],
      rules: { "unicorn/text-encoding-identifier-case": "off" },
    },
    // crust's UTF-16 writers and its code point order work in UTF-16 code units: `codePointAt` joins
    // a surrogate pair into one value, which no unit-wise write or comparison can carry.
    {
      files: ["packages/crust/src/charset.ts", "packages/crust/src/encode.ts"],
      rules: { "unicorn/prefer-code-point": "off" },
    },
    {
      files: ["packages/plate/src/**/*.ts", "packages/plate/src/**/*.tsx"],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: [...sharedImportPatterns, ...plateCorePatterns] },
        ],
        "workspace/no-bare-error": "error",
      },
    },
    // plate's own `definePrimitive` defines through UI SDK's, the one module that does.
    {
      files: ["packages/plate/src/ui/define-primitive.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              ...sharedImportPatterns,
              ...plateCorePatterns.filter((pattern) => pattern !== plateDefinePattern),
            ],
          },
        ],
      },
    },
    // The UI's data entry, `@qti-pie/plate/ui/props`, is what server code imports of the UI, so it
    // reaches no rendering module: its modules load no `.tsx` module, a type-only import included,
    // since TypeScript compiles every module a type-only import names, and a rendering module
    // reaches the islands, whose browser libraries a server's program resolves to their server
    // builds. A module that joins the entry's closure joins the list.
    {
      files: [
        "packages/plate/src/ui/item/context.ts",
        "packages/plate/src/ui/item/html.ts",
        "packages/plate/src/ui/item/ids.ts",
        "packages/plate/src/ui/item/interactions/marks.ts",
        "packages/plate/src/ui/props.ts",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              ...sharedImportPatterns,
              ...plateCorePatterns,
              {
                message:
                  "The UI's data entry (`@qti-pie/plate/ui/props`) reaches no rendering module: move the type into a `.ts` module.",
                regex: "\\.tsx$",
              },
            ],
          },
        ],
        "workspace/no-bare-error": "error",
      },
    },
    // The ledger and pantry are server code: they import plate's pure entries and the UI's data
    // entry (`@qti-pie/plate/ui/props`), never the UI's rendering entries, whose modules reach the
    // islands, which a server's program cannot compile (MathLive resolves to its `node` build, with
    // no `MathfieldElement`). A type-only import is refused too: TypeScript compiles what it names.
    {
      files: ["packages/ledger/**/*.ts", "packages/pantry/**/*.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          { paths: serverRefusedImportPaths, patterns: sharedImportPatterns },
        ],
      },
    },
    // plate's UI is React that its host's Next build compiles with the React Compiler at
    // panicThreshold all_errors (@bjornpagen/devtools/react-compiler), which fails the build on any
    // component or hook it cannot compile. These are the compiler's rules as the toolchain preset
    // runs them on edullm's apps, so the lint refuses such a function before a build meets it.
    {
      files: ["packages/plate/src/**/*.ts", "packages/plate/src/**/*.tsx"],
      plugins: ["react"],
      rules: reactCompilerRules,
    },
    // plate's look is its separate stylesheets, plate/src/styles/base.css and theme.css, and Alpha's,
    // plate/src/alpha/styles/, which a host imports: its UI, Alpha's renderers among it, writes no
    // class but the author's, at the sites `passthrough` lists, no style, and imports no stylesheet.
    {
      files: [
        "packages/plate/src/ui/**/*.ts",
        "packages/plate/src/ui/**/*.tsx",
        "packages/plate/src/alpha/**/*.tsx",
      ],
      rules: {
        "workspace/classes-live-in-styles": [
          "error",
          {
            // The author's class: the shell filters it into the interaction's context (item.tsx), the
            // island's context copies it (index.tsx), the roots carry it (labels.ts), and two UI SDK
            // parts write it only where the author did (position-object.tsx, select-point.tsx).
            passthrough: [
              "packages/plate/src/ui/item/interactions/index.tsx",
              "packages/plate/src/ui/item/interactions/labels.ts",
              "packages/plate/src/ui/item/item.tsx",
              "packages/plate/src/ui/position-object/position-object.tsx",
              "packages/plate/src/ui/select-point/select-point.tsx",
            ],
          },
        ],
      },
    },
    // The shuffle's and the stage order's digests hash through node:crypto's synchronous HMAC, the
    // one Node built-in the server core loads. No "use client" module reaches them, so no page does.
    {
      files: ["packages/plate/src/digest.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              ...sharedImportPatterns,
              ...plateCorePatterns.filter((pattern) => pattern !== plateNodePattern),
              {
                allowTypeImports: true,
                message:
                  "The shuffle's and the stage order's digests load no Node built-in but node:crypto.",
                regex: `^${nodeBuiltinsButCrypto}`,
              },
            ],
          },
        ],
        "workspace/no-bare-error": "error",
      },
    },
    // Tests and their support load what plate's modules may not, and throw what they like.
    {
      files: [
        "packages/plate/src/**/*.test.ts",
        "packages/plate/src/**/*.test.tsx",
        "packages/plate/src/test/**",
      ],
      rules: {
        "no-restricted-imports": ["error", { patterns: sharedImportPatterns }],
        "workspace/no-bare-error": "off",
      },
    },
    // A page loads these, so they take from `effect` only what costs a page little (pageImportOptions).
    {
      files: [...plateClientModules],
      rules: { "no-restricted-imports": ["error", pageImportOptions(sharedImportPatterns)] },
    },
    // Inside an `alpha/` folder a module imports its folder's siblings as well as core, and keeps its
    // package's other bans: plate's, a page's for those of plate's a page loads, the server's for the
    // ledger and pantry, and the shared ones elsewhere; plate's alpha suites, and the emit step that
    // writes each PCI module file under the machine's Node, load Node as plate's tests do. Last among
    // the rule's overrides, they lift alphaImportPattern on `alpha/` alone.
    {
      files: ["packages/*/src/alpha/**/*.ts", "packages/*/src/alpha/**/*.tsx"],
      rules: { "no-restricted-imports": ["error", { patterns: pathImportPatterns }] },
    },
    {
      files: ["packages/ledger/src/alpha/**/*.ts", "packages/pantry/src/alpha/**/*.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          { paths: serverRefusedImportPaths, patterns: pathImportPatterns },
        ],
      },
    },
    {
      files: ["packages/plate/src/alpha/**/*.ts", "packages/plate/src/alpha/**/*.tsx"],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: [...pathImportPatterns, ...plateCorePatterns] },
        ],
      },
    },
    {
      files: [
        "packages/plate/src/alpha/**/*.test.ts",
        "packages/plate/src/alpha/**/*.test.tsx",
        "packages/plate/src/alpha/emit-pci-modules.ts",
      ],
      rules: { "no-restricted-imports": ["error", { patterns: pathImportPatterns }] },
    },
    {
      files: [...plateAlphaClientModules],
      rules: { "no-restricted-imports": ["error", pageImportOptions(pathImportPatterns)] },
    },
    // The index of Alpha's PCI modules is a leaf: a host outside qti-pie (AlphaTest's player, through
    // its qti-pie submodule) imports it as TypeScript with none of plate's dependencies installed,
    // and its TypeScript follows a type-only import too, so the index imports nothing at all.
    {
      files: ["packages/plate/src/alpha/pci-modules.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                message:
                  "The index of Alpha's PCI modules is a leaf a host outside qti-pie imports: it imports nothing.",
                regex: ".",
              },
            ],
          },
        ],
      },
    },
    // Errors with no fields, each with a fixed message (plate's defects, assembly's RootMissing): a
    // getter writes it, since a `message` field would be an own property of every error, so the getter
    // reads nothing of `this`.
    {
      files: ["packages/pantry/src/model/assemble.ts", "packages/plate/src/ui/defects.ts"],
      rules: { "class-methods-use-this": "off" },
    },
    // Mutual recursion through nested content, in each of these modules' own scope: the item model's
    // readers (the body walk's `bodyNodes` and `bodyNode`, response rules' `rules` and `rule`,
    // template rules' `sequence` and `rule`, the regex translator's groups, classes and states), the
    // content-model matcher's (`intern` and `keyOf`, `ends` and `endsOnce`, `derive` and
    // `deriveOnce`), the XSD table generator's (`namedSimpleType`, `typeOf` and `simpleType`,
    // `typeTable` and `complexTable`, `elementParticle` and `declaredType`), and the UI body walk's
    // renderers (`renderedOf`, `nodeOf` and `feedbackRunOf`), MathML's `mfenced` rewrite
    // (`expandFenced` and `normaliseElement`, as an argument of an `mfenced` may hold another), and
    // crust's plane-tree generators
    // (`forestOf` and `planeTreeOf`, `child` and the element it labels). Each calls one declared after
    // it from inside its own body, which runs only once all are defined. The rule still refuses a use
    // before its declaration in the same scope.
    {
      files: [
        "packages/crust/src/test/trees.ts",
        "packages/plate/src/content/mathml.ts",
        "packages/plate/src/model/body.ts",
        "packages/plate/src/model/regex.ts",
        "packages/plate/src/ui/item/content.tsx",
      ],
      rules: { "no-use-before-define": ["error", { variables: false }] },
    },
    // QTI's own `shape` attribute (`qti-area-map-entry`'s and `qti-inside`'s, the information model's
    // Shape) names an area's geometry, not a structure. pantry's derived attribute leaf names each
    // anonymous type's constant after the attribute that declares it, and plate's item model and
    // area hit test name their fields, readers and cases after the attribute.
    {
      files: [
        "packages/pantry/src/vocab/inventory/attributes.ts",
        "packages/plate/src/model/declarations.ts",
        "packages/plate/src/model/item.test.ts",
        "packages/plate/src/model/item.ts",
        "packages/plate/src/graphic/holds.ts",
      ],
      rules: { "anti-slop/no-shape-in-symbol-names": "off" },
    },
    // The URL classifier's tests and the payload's hand them `javascript:` URLs, the input the
    // classifier and securing must drop; the suites never navigate to one.
    {
      files: ["packages/plate/src/model/url.test.ts", "packages/plate/src/payload.test.ts"],
      rules: { "no-script-url": "off" },
    },
    // The parsing boundaries that take what arrives untyped: `configure` decodes the host's
    // settings, which reach it as any value, with Schema; and the Appendix C reader of a PCI's JSON
    // takes each node as `unknown` until a predicate has read it, keyed by whatever the PCI wrote, as
    // a module a page loads parses it without Schema.
    {
      files: ["packages/plate/src/configuration.ts", "packages/plate/src/pci/json.ts"],
      rules: {
        "anti-slop/no-unknown-parameters": "off",
        "anti-slop/no-unsafe-dictionary-type": "off",
      },
    },
    // A PCI frame's boot is the boundary between the host and a PCI's own code: what an AMD module
    // exports, what a factory is handed and what a PCI returns as its state and its response are
    // opaque by the PCI contract, and a script with no imports has no Schema to parse them with, so
    // `unknown` is their type until a predicate has read them. Every helper stays inside `bootFrame`,
    // whose source text is the frame's script, so one moved to the module's scope would be undefined
    // in the frame. The page side reads a frame's message key by key at the same boundary.
    {
      files: ["packages/plate/src/ui/portable-custom/frame-boot.ts"],
      rules: {
        "anti-slop/no-unknown-parameters": "off",
        "anti-slop/no-unknown-returns": "off",
        "anti-slop/no-unknown-type-aliases": "off",
        "anti-slop/no-unsafe-dictionary-type": "off",
        "unicorn/consistent-function-scoping": "off",
      },
    },
    // A specimen suite's reader of a PCI's frame (`readDrawn` of
    // `packages/specimen/src/alpha/shade-parts.ts`) is the text Playwright evaluates in the frame's
    // document, as `bootFrame` is the frame's script: every helper stays inside it, since one moved
    // to the module's scope would be undefined in the frame.
    {
      files: ["packages/specimen/src/alpha/shade-parts.ts"],
      rules: { "unicorn/consistent-function-scoping": "off" },
    },
    // An Alpha PCI module (`packages/plate/src/alpha/pci-modules/`) is an author's AMD module that
    // runs in the PCI's sandboxed frame, as the frame's boot does: its text with the types stripped
    // is a content package's module file, so every helper stays inside its one factory, and the
    // state and bound response it is handed cross `postMessage` untyped, so they are `unknown` until
    // a predicate has read them, a script with no imports having no Schema to parse them with. Its
    // one failure is the PCI contract's, an exception from `getInstance` that the boot reports, and
    // such a script has no tagged error class to throw. It is an AMD module, as QTI 3.0.1 has a
    // PCI's module be: its one statement is the `define` the frame's loader runs, and its module
    // file is a classic script, never an ES module, so its factory states strict mode itself.
    {
      files: ["packages/plate/src/alpha/pci-modules/*.ts"],
      rules: {
        "anti-slop/no-runtime-typeof": "off",
        "anti-slop/no-unknown-parameters": "off",
        "anti-slop/no-unsafe-dictionary-type": "off",
        "import/no-amd": "off",
        "unicorn/consistent-function-scoping": "off",
        "unicorn/prefer-module": "off",
        "workspace/no-bare-error": "off",
      },
    },
    {
      files: ["packages/plate/src/ui/portable-custom/host.ts"],
      rules: { "anti-slop/no-unsafe-dictionary-type": "off" },
    },
    // The rich-text essay reads Quill's document as its Delta (`editor.getContents().ops`), which
    // the type-aware lint types as an error type where tsc types it as quill-delta's Delta: the lint
    // does not follow quill's typings into quill-delta's CommonJS `Delta.d.ts`. The island reads
    // only `ops`, the `Op[]` `#plate/rich-text/xhtml.ts` takes, which tsc checks.
    {
      files: ["packages/plate/src/ui/extended-text/rich-text.tsx"],
      rules: {
        "typescript/no-unsafe-argument": "off",
        "typescript/no-unsafe-member-access": "off",
      },
    },
    // A Media's autostart, and read-aloud's session carrying out a press's play, handle `play()`'s
    // refusal with its promise's own `catch`: the workspace forbids try/catch, and neither the effect
    // that starts a Media nor the session, which plays a recording from a toggle's change handler or
    // from the `ended` listener of the one before it, can await.
    {
      files: [
        "packages/plate/src/ui/media/media.tsx",
        "packages/plate/src/ui/read-aloud/session.tsx",
      ],
      rules: { "promise/prefer-await-to-then": "off" },
    },
    // Tests may chain a promise, as ultracite 7, which turned prefer-await-to-then on, let them.
    {
      files: [
        "**/*.{test,spec,test-d,spec-d}.{ts,tsx,js,jsx}",
        "**/__tests__/**/*.{ts,tsx,js,jsx}",
      ],
      rules: { "promise/prefer-await-to-then": "off" },
    },
  ],
  rules: {
    "@stylistic/padding-line-between-statements": [
      "error",
      { blankLine: "always", next: topLevelUnit, prev: "*" },
      { blankLine: "always", next: "*", prev: topLevelUnit },
      {
        blankLine: "always",
        next: "const",
        // Effect generator calls are wrapped in yield expressions.
        prev: {
          selector:
            'ExpressionStatement:matches([expression.type="CallExpression"], [expression.type="YieldExpression"][expression.argument.type="CallExpression"])',
        },
      },
      { blankLine: "always", next: "return", prev: "*" },
      { blankLine: "always", next: "*", prev: "if" },
      { blankLine: "always", next: "*", prev: effectLogStatement },
    ],
    // Off, as before ultracite 8: its findings are in plate files other lanes edit (gap-match, match, item).
    "anti-slop/no-array-filter-map": "off",
    // Off, as before ultracite 8: its 10,360 findings span crust, pantry and plate, which other lanes edit.
    "anti-slop/require-readable-spacing": "off",
    "default-case": "off",
    "devtools/no-variadic-callback": "error",
    // A limit's evidence is its JSDoc's tags (the indefensible-numbers skill), and `@formatConstant` marks a declaration
    // whose numbers are a format's own (a code table, a type's range, an operator's arity), which are no limits.
    "jsdoc/check-tag-names": [
      "error",
      {
        definedTags: [
          "formatConstant",
          "limitKind",
          "owner",
          "unit",
          "scope",
          "constraint",
          "source",
          "quote",
          "verified",
          "evidence",
          "observed",
          "environment",
          "workload",
          "result",
          "decision",
          "revalidate",
          "derivation",
          "from",
          "guards",
          "measure",
          "origin",
          "recorded",
        ],
      },
    ],
    // Related Effect schemas and errors form one cohesive module.
    "max-classes-per-file": "off",
    // ultracite 8 relaxes these from ultracite 7's settings, which qti-pie keeps: sort-keys orders a relation's
    // fields, its column order.
    "no-unused-vars": "error",
    "no-use-before-define": "error",
    "promise/prefer-await-to-then": "error",
    "sort-keys": "error",
    "typescript/consistent-return": "off",
    // Effect adapters return existing promises without introducing async wrappers.
    // Off, as before ultracite 8: its one finding is plate's catalog proving its areas disjoint, a `{}` it means.
    "typescript/no-generated-empty-object-type": "off",
    "typescript/promise-function-async": "off",
    // Relaxed by ultracite 8 too, and kept at ultracite 7's settings.
    "unicorn/no-useless-undefined": "error",
    "unicorn/prefer-export-from": "error",
    // unicorn's rule reads `Schema.TaggedError<Self>()`, the class factory every error class extends,
    // as an error called without `new`, and has no option to exempt it (oxc exempts `Data.TaggedError`
    // alone, `throw_new_error.rs`). The workspace rule is unicorn's with `Schema.TaggedError` exempt too.
    "unicorn/throw-new-error": "off",
    "workspace/no-built-in-try-catch": "error",
    "workspace/throw-new-error": "error",
  },
});
