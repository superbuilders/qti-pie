/**
 * The hosts' browser floor (`#plate/browser-floor.ts`) held over plate's stylesheets, the CSS of
 * Alpha's PCI modules and the source of the island that hosts a PCI, against MDN's browser
 * compatibility data (`#plate/test/browser-floor.ts`): every feature they use is fully supported at
 * the floor, or listed here as a finding, so the next one that is not fails qti-pie's gate. The
 * frame's boot and the modules' own scripts are held where they run: `frame-boot.test.ts` and
 * `alpha/pci-modules.test.ts`, and specimen's suites in Chrome.
 *
 * The CSS is read by `#plate/test/css-features.ts`, whose oracle is the specifications, written by
 * hand: CSS Syntax 3's tokenizer (a comment and a string hold no token of a selector), Selectors
 * 4's invalid selectors, CSS Conditional 3's `@supports` (its block applies only where its
 * condition holds) and CSS Syntax 3's declaration list, which keeps the last valid declaration of a
 * property, so an earlier one is a fallback.
 *
 * @module
 * @see https://www.w3.org/TR/css-syntax-3/#tokenization
 * @see https://www.w3.org/TR/selectors-4/#invalid
 * @see https://www.w3.org/TR/css-conditional-3/#at-supports
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcd from "@mdn/browser-compat-data" with { type: "json" };
import { assert, describe, it } from "@effect/vitest";
import { browserFloor } from "#plate/browser-floor.ts";
import {
  atFloor,
  compatOf,
  cssKeyOf,
  firstFullRelease,
  importClosure,
  keysIn,
  moduleCssIn,
} from "#plate/test/browser-floor.ts";
import { cssImportsIn, cssUsesIn } from "#plate/test/css-features.ts";

/**
 * Plate's source folder.
 */
const source = path.join(import.meta.dirname, "..");

/**
 * Plate's stylesheets, the ones its package exports, by their path in `src/`.
 */
const stylesheets = [
  "alpha/styles/base.css",
  "alpha/styles/theme.css",
  "styles/base.css",
  "styles/theme.css",
] as const;

/**
 * The folder of Alpha's PCI module files, which run in the PCI's frame as written.
 */
const moduleFolder = path.join(source, "alpha", "pci-modules");

/**
 * Give each of Alpha's PCI module files, by name, its text as the frame runs it.
 *
 * @returns The files.
 */
const moduleFiles = (): readonly { readonly name: string; readonly text: string }[] =>
  readdirSync(moduleFolder)
    .filter((name) => name.endsWith(".js"))
    .toSorted()
    .map((name) => ({ name, text: readFileSync(path.join(moduleFolder, name), "utf-8") }));

/**
 * The island's modules: the PCI's host side, which a host's page runs, its frame's own boot and
 * page aside.
 */
const islandFolder = path.join(source, "ui", "portable-custom");

/**
 * Resolve a stylesheet's import from plate's package, as a host's bundler resolves it.
 */
const resolveImport = (address: string): string => fileURLToPath(import.meta.resolve(address));

/**
 * Give a stylesheet and each it imports, and each those import, by name: its path in `src/` for
 * plate's own, the import's address for a dependency's.
 *
 * @param name The stylesheet's name.
 * @param file The stylesheet's file.
 * @returns The stylesheets.
 */
const withImports = (
  name: string,
  file: string,
): readonly { readonly name: string; readonly text: string }[] => {
  const text = readFileSync(file, "utf-8");

  return [
    { name, text },
    ...cssImportsIn(text).flatMap((address) => withImports(address, resolveImport(address))),
  ];
};

/**
 * Give each stylesheet the floor holds, by name: plate's and the sheets they import, and each
 * module file's CSS.
 *
 * @returns The stylesheets.
 */
const sheetsOf = (): readonly { readonly name: string; readonly text: string }[] => [
  ...stylesheets.flatMap((file) => withImports(file, path.join(source, file))),
  ...moduleFiles().map(({ name, text }) => ({ name, text: moduleCssIn(name, text).css })),
];

/**
 * The features the stylesheets use that the data names under no key of their own, each reviewed:
 * `word-wrap`, `overflow-wrap`'s other name, which quill's sheet writes and every browser of the
 * floor reads as `overflow-wrap`.
 */
const reviewedUnkeyed: readonly string[] = ["property word-wrap"];

/**
 * The uses the floor lacks that a guard holds, each a finding qti-pie keeps as written:
 *
 * - `user-select`, which Safari reads only as `-webkit-user-select` (unprefixed in Safari 27.3, never
 *   on iOS), written beside its prefixed twin in each module and in plate's base sheet;
 * - Under `@supports` in plate's base sheet: `field-sizing` (Safari 26.2), typed `attr()`'s `type()`
 *   (no Safari) and `animation-timeline` with `scroll()` (Safari 26), each an enhancement a browser
 *   without it skips whole.
 */
const guardedFindings: readonly string[] = [
  "build-with-blocks.js: property user-select",
  "count-placements.js: property user-select",
  "enter-numbers.js: property user-select",
  "mark-objects.js: property user-select",
  "shade-parts.js: property user-select",
  "styles/base.css: property animation-timeline",
  "styles/base.css: property field-sizing",
  "styles/base.css: property user-select",
  "styles/base.css: scroll()",
  "styles/base.css: type()",
  "tap-point.js: property user-select",
];

/**
 * The uses the floor lacks with no guard, each a finding qti-pie keeps as written until it is
 * ruled on: each costs only its own declaration where a browser lacks it.
 *
 * - `forced-color-adjust` (no Safari), each inside `@media (forced-colors: active)`, a mode Safari
 *   never enters;
 * - `overscroll-behavior` and `overscroll-behavior-inline`, which Safari and iOS implement only in
 *   part (no effect on a scroll container with no scrollable overflow; Chrome full from 144);
 * - `box-decoration-break` (Chrome 130; Safari only as `-webkit-box-decoration-break`, for inline
 *   elements), feedback's run of the sentence;
 * - `resize` on Extended Text's box, which iOS recognises and ignores.
 */
const unguardedFindings: readonly string[] = [
  "alpha/styles/base.css: property forced-color-adjust",
  "alpha/styles/base.css: property overscroll-behavior-inline",
  "alpha/styles/theme.css: property forced-color-adjust",
  "styles/base.css: property overscroll-behavior",
  "styles/base.css: property overscroll-behavior-inline",
  "styles/theme.css: property box-decoration-break",
  "styles/theme.css: property forced-color-adjust",
  "styles/theme.css: property resize",
];

/**
 * Give the source of each module the island runs in a host's page: the island's own modules (the
 * folder's, but its tests and the frame's page and boot) and every module of plate's they import,
 * by value, as `importClosure` follows them, each by its path in `src/`.
 *
 * @returns Each module's name and text.
 */
const islandFiles = (): readonly { readonly name: string; readonly text: string }[] =>
  importClosure(
    readdirSync(islandFolder)
      .filter(
        (name) =>
          (name.endsWith(".ts") || name.endsWith(".tsx")) &&
          !name.includes(".test.") &&
          !name.startsWith("frame-"),
      )
      .map((name) => path.join(islandFolder, name)),
    source,
  ).map((file) => ({ name: path.relative(source, file), text: readFileSync(file, "utf-8") }));

/**
 * Give the frame boot's source, the module the frame page writes as its script.
 *
 * @returns Its name and text.
 */
const bootFiles = (): readonly { readonly name: string; readonly text: string }[] => [
  {
    name: "ui/portable-custom/frame-boot.ts",
    text: readFileSync(path.join(islandFolder, "frame-boot.ts"), "utf-8"),
  },
];

/**
 * Write a use, as the findings list it: its sheet and its feature.
 *
 * @param sheet The sheet's name.
 * @param feature The feature.
 * @returns Its text.
 */
const findingOf = (sheet: string, feature: string): string => `${sheet}: ${feature}`;

/**
 * Give the uses in a stylesheet, each as its feature and whether it is guarded.
 *
 * @param text The stylesheet.
 * @returns The uses, in order.
 */
const usesOf = (text: string): readonly string[] =>
  cssUsesIn(text).map(({ feature, guarded }) => `${guarded ? "guarded" : "open"} ${feature}`);

describe("the hosts' browser floor", () => {
  it("is a release of each of its browsers the data knows", () => {
    const known: Readonly<Record<keyof typeof browserFloor, boolean>> = {
      chrome: bcd.browsers.chrome.releases[String(browserFloor.chrome)] !== undefined,
      firefox: bcd.browsers.firefox.releases[String(browserFloor.firefox)] !== undefined,
      safari: bcd.browsers.safari.releases[String(browserFloor.safari)] !== undefined,
      safari_ios: bcd.browsers.safari_ios.releases[String(browserFloor.safari_ios)] !== undefined,
    };

    assert.deepStrictEqual(known, { chrome: true, firefox: true, safari: true, safari_ios: true });
  });

  it("holds every CSS feature plate's stylesheets and Alpha's PCI modules use, or names it a finding", () => {
    const unresolved = new Set<string>();
    const guarded = new Set<string>();
    const unguarded = new Set<string>();

    for (const { name, text } of sheetsOf()) {
      for (const { feature, guarded: held } of cssUsesIn(text)) {
        const key = cssKeyOf(feature);
        const compat = key === undefined ? undefined : compatOf(key);

        if (compat === undefined) {
          unresolved.add(feature);
        } else if (!atFloor(compat)) {
          (held ? guarded : unguarded).add(findingOf(name, feature));
        }
      }
    }

    assert.deepStrictEqual(
      {
        guarded: [...guarded].toSorted(),
        unguarded: [...unguarded].toSorted(),
        unresolved: [...unresolved].toSorted(),
      },
      { guarded: guardedFindings, unguarded: unguardedFindings, unresolved: reviewedUnkeyed },
      "A CSS feature plate uses must be fully supported at the floor, in the data at the version qti-pie pins: a later one fails here. A feature the data names under no single key needs its key in `#plate/test/browser-floor.ts`.",
    );
  });

  /**
   * The members the island names that a floor browser supports only in part, each reviewed:
   * Safari's and iOS's `devicePixelRatio`, partial before 26.4 because it does not change with the
   * page's zoom. The island sends it to the frame as D′, which sizes only the frame's probe step
   * (`frame-boot.ts`); every post's echo is still ended by the island's `settled`, which reads the
   * element's laid-out height and not the ratio, so a D′ that omits the page's zoom costs at most a
   * probe that does not move the frame, never a wait that strands.
   */
  const reviewedIsland: readonly string[] = [
    "ui/portable-custom/host.ts: api.Window.devicePixelRatio",
    "ui/portable-custom/landing.ts: api.Window.devicePixelRatio",
  ];

  it("holds every global, static member and syntax the island's source names, its imports' too", () => {
    const named = islandFiles().flatMap(({ name, text }) =>
      keysIn(name, text)
        .filter((key) => {
          const compat = compatOf(key);

          return compat === undefined || !atFloor(compat);
        })
        .map((key) => `${name}: ${key}`),
    );

    assert.deepStrictEqual(
      named,
      reviewedIsland,
      "The island's modules run in the host's page as written, so each feature they name must be fully supported at the floor, or be reviewed by name.",
    );
  });
});

describe("Alpha's PCI modules' style", () => {
  it("is written only as the reader reads it", () => {
    assert.deepStrictEqual(
      moduleFiles().flatMap(({ name, text }) => moduleCssIn(name, text).refused),
      [],
      "A module writes style through a `style` element's text, `style.<property> = …` or `style.setProperty(\"<property>\", …)`, which the floor's CSS test reads; any other way escapes it.",
    );
  });
});

describe("the floor's Firefox", () => {
  it("is the oldest release that fully supports every feature qti-pie uses", () => {
    const findings = new Set(unguardedFindings);
    const used = new Map<string, string>();

    for (const { name, text } of sheetsOf()) {
      for (const { feature, guarded } of cssUsesIn(text)) {
        const key = cssKeyOf(feature);

        if (
          !guarded &&
          !findings.has(findingOf(name, feature)) &&
          !reviewedUnkeyed.includes(feature) &&
          key !== undefined
        ) {
          used.set(key, name);
        }
      }
    }

    const named = (files: readonly { readonly name: string; readonly text: string }[]): void => {
      for (const { name, text } of files) {
        for (const key of keysIn(name, text)) {
          used.set(key, name);
        }
      }
    };

    named(islandFiles());
    named(bootFiles());
    named(moduleFiles());

    let derived = 0;
    const none: string[] = [];

    for (const [key, name] of used) {
      const release = firstFullRelease(compatOf(key)?.support.firefox);

      if (release === undefined) {
        none.push(`${name}: ${key}`);
      } else {
        derived = Math.max(derived, release);
      }
    }

    assert.deepStrictEqual(
      { derived, none },
      { derived: browserFloor.firefox, none: [] },
      "The floor's Firefox is derived, never picked: the latest of the first full releases of every feature plate's stylesheets, the boot, the island and Alpha's PCI modules use, but the findings, which the floor's other browsers lack too. A feature Firefox never fully supports has no release to derive from.",
    );
  });
});

describe("the CSS reader", () => {
  it("reads each declaration's property, and each MathML element a type selector styles", () => {
    assert.deepStrictEqual(usesOf("p math, x > mfrac, mn.y { zoom: 2 }"), [
      "open <math>",
      "open <mfrac>",
      "open <mn>",
      "open property zoom",
    ]);
  });

  it("reads a selector's pseudo-classes and pseudo-elements, and none in a comment, a string or an attribute selector", () => {
    assert.deepStrictEqual(
      usesOf(
        '/* a:has(b) */ a[title=":has(b)"]:is(b, c:dir(rtl))::before, d:nth-child(2 of .e):not(f, g) { content: ":where(x)"; }',
      ),
      [
        "open :is()",
        "open :dir()",
        "open ::before",
        "open :nth-child(… of S)",
        "open :not(…, …)",
        "open property content",
      ],
    );
  });

  it("reads every use under `@supports` as guarded, and an at-rule's own use as open", () => {
    assert.deepStrictEqual(
      usesOf(
        '@layer a, b; @import "x.css" layer(a); @supports (color: oklch(0 0 0)) { a:has(b) { color: oklch(0 0 0); } } @media (width >= 30em) { c { inline-size: 2lh; } }',
      ),
      [
        "open @layer",
        "open @import",
        "open @import … layer()",
        "open @supports",
        "guarded :has()",
        "guarded property color",
        "guarded oklch()",
        "open @media",
        "open @media (range)",
        "open property inline-size",
        "open lh",
      ],
    );
  });

  it("reads a value backed by an earlier declaration, and a property beside its prefixed twin, as guarded, a vendor's own feature as none, and a nested rule as `&`", () => {
    assert.deepStrictEqual(
      usesOf(
        "a { color: #000; color: oklch(0 0 0); user-select: none; -webkit-user-select: none; &:hover { inline-size: 1px; } } b::-webkit-scrollbar { inline-size: 0; }",
      ),
      [
        "open property color",
        "open property color",
        "guarded oklch()",
        "guarded property user-select",
        "open &",
        "open :hover",
        "open property inline-size",
        "open px",
        "open property inline-size",
      ],
    );
  });
});
