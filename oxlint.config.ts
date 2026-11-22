import { builtinModules } from "node:module";
import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import antiSlop from "ultracite/oxlint/anti-slop";
import { clientModules, sourceModules, valueClosure } from "@qti-pie/plate/test/imports";

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
 * Import specifiers every package refuses: relative paths, and absolute or `file:` paths.
 */
const sharedImportPatterns = [
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
 * What plate's modules may not load, each refused by its own specifier, so the rule holds file by
 * file and needs no walk of the module graph. Its served entries (`.`, `./open`, `./package` and
 * the UI's four) stay loadable by any host, and its islands by a page: test support (the Node-only
 * corpus reader among it), every Node built-in (with or without `node:`; the keyed digest alone
 * loads `node:crypto`), the test runner by package, so no re-export under another name routes
 * around the list, and pantry and grizzle. A type-only import loads nothing, and is allowed.
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
];

/**
 * Plate's own modules, read from disk as the config loads, by path under the package (`src/<x>`).
 */
const plateModules = sourceModules();

/**
 * Plate's modules outside `src/ui/` that a `"use client"` module loads, and so a page: what the
 * islands import from the core, and what that imports in turn, by path from the repository's root.
 * The list is derived as the config loads, by the reader plate's tests hold its module graph with
 * (`@qti-pie/plate/test/imports`): every `"use client"` module, and every module reached from one
 * through a declaration that loads its module (`import type` and `export type` load nothing), less
 * the UI's own. So a module that joins the closure joins the list, and nothing keeps the list by
 * hand.
 */
const plateClientModules = valueClosure(plateModules, clientModules(plateModules))
  .filter((module) => !module.startsWith("src/ui/"))
  .map((module) => `packages/plate/${module}`)
  .toSorted();

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
  // test reads, not source.
  ignorePatterns: [
    // grizzle, this repository's submodule, is linted by its own gate and config.
    "vendor/**",
    "dist/**",
    ".agents/**",
    ".claude/**",
    "**/migrations/**",
    "packages/plate/fixtures/**",
  ],
  jsPlugins: ["./tools/lint-plugin.ts", "@stylistic/eslint-plugin"],
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
    // pantry's command line describes and prints how a run failed: a run fails or dies with any
    // value, the squashed cause Effect types `unknown`, so `describeFailure` decodes it once, and the
    // printer reads each failure and defect it is handed, by their decoders and predicates, at the
    // one boundary that turns it into a kind, a next step, and text or the JSON error object. The
    // describer's suite hands it any value, as a run would.
    {
      files: [
        "packages/pantry/src/cli/errors.test.ts",
        "packages/pantry/src/cli/errors.ts",
        "packages/pantry/src/cli/present.ts",
      ],
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
        "packages/crust/src/decode.detection.test.ts",
        "packages/crust/src/decode.test.ts",
        "packages/crust/src/decode.ts",
        "packages/crust/src/encode.test.ts",
        "packages/crust/src/read.test.ts",
        "packages/crust/src/refusal-position.test.ts",
        "packages/crust/src/scale.test.ts",
        "packages/crust/src/test/appendix-f.ts",
        "packages/crust/src/test/trees.ts",
        "packages/crust/src/write.test.ts",
      ],
      rules: { "unicorn/text-encoding-identifier-case": "off" },
    },
    // crust's UTF-16 writers and its code point order work in UTF-16 code units: `codePointAt` joins
    // a surrogate pair into one value, which no unit-wise write or comparison can carry.
    {
      files: [
        "packages/crust/src/charset.ts",
        "packages/crust/src/decode.detection.test.ts",
        "packages/crust/src/encode.ts",
      ],
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
          {
            paths: [
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
            ],
            patterns: sharedImportPatterns,
          },
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
    // plate's look is its separate stylesheets, plate/src/styles/base.css and theme.css, which a host
    // imports: its UI writes no class but the author's, at the sites `passthrough` lists, no style,
    // and imports no stylesheet.
    {
      files: ["packages/plate/src/ui/**/*.ts", "packages/plate/src/ui/**/*.tsx"],
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
    // A page loads these, so they take from `effect` only what costs a page little: no Schema, no
    // Effect runtime, no Brand. A type-only import loads nothing.
    {
      files: plateClientModules,
      rules: {
        "no-restricted-imports": [
          "error",
          {
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
              ...sharedImportPatterns,
              ...plateCorePatterns,
              {
                allowTypeImports: true,
                group: [
                  "*",
                  "!effect",
                  "!#plate/**",
                  "!@qti-pie/crust/regex.ts",
                  "!@qti-pie/crust/text.ts",
                ],
                message:
                  "A page loads this module: load only effect, plate's own modules and crust's re-exports of grizzle-text.",
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
        "packages/plate/src/graphic/holds.test.ts",
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
    // plate's import reader parses a module with the parser `vitest/node`, plate's declared test
    // runner, re-exports only as `parseAst`: vite's `parseSync` would need vite declared beside it,
    // and both parse with Oxc.
    {
      files: ["packages/plate/src/test/imports.ts"],
      rules: { "typescript/no-deprecated": "off" },
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
    {
      files: ["packages/plate/src/ui/portable-custom/host.ts"],
      rules: { "anti-slop/no-unsafe-dictionary-type": "off" },
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
