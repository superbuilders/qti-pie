import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { alphaClasses } from "#plate/alpha/vocabulary.ts";
import { rendererClasses } from "#plate/vocabulary.ts";

/**
 * Read one of plate's stylesheets, by its path under `src/`.
 *
 * @param sheet The sheet's path under `src/`, such as `alpha/styles/base.css`.
 * @returns Its text.
 */
const sheetOf = (sheet: string): string =>
  readFileSync(new URL(`../${sheet}`, import.meta.url), "utf-8");

/**
 * Alpha's two sheets, as a host imports them, by path under `src/`.
 */
const alphaSheets: ReadonlyMap<string, string> = new Map(
  ["alpha/styles/base.css", "alpha/styles/theme.css"].map((sheet) => [sheet, sheetOf(sheet)]),
);

/**
 * Plate's own two sheets, by path under `src/`.
 */
const coreSheets: ReadonlyMap<string, string> = new Map(
  ["styles/base.css", "styles/theme.css"].map((sheet) => [sheet, sheetOf(sheet)]),
);

/**
 * Read the modules under a folder beside this file, tests left out: the text a census of parts
 * reads, with no import.
 *
 * @param folder The folder, relative to this file, such as `../ui/`.
 * @returns Each `.ts` and `.tsx` file under it but its tests.
 */
const modulesUnder = (folder: string): readonly string[] => {
  const root = new URL(folder, import.meta.url);

  return readdirSync(root, { encoding: "utf-8", recursive: true })
    .filter((file) => /\.tsx?$/u.test(file) && !/\.test\.tsx?$/u.test(file))
    .toSorted()
    .map((file) => readFileSync(new URL(file.split(path.sep).join("/"), root), "utf-8"));
};

/**
 * Give a sheet's text with its comments left out, so a class or a rule a comment names is not
 * read as selected.
 *
 * @param sheet The sheet.
 * @returns Its text without comments.
 */
const uncommented = (sheet: string): string => sheet.replaceAll(/\/\*[\s\S]*?\*\//gu, "");

/**
 * Give the classes a sheet selects under a prefix.
 *
 * @param sheet The sheet.
 * @param prefix The prefix, such as `alpha-`.
 * @returns Each class it selects under the prefix, once.
 */
const selectedClasses = (sheet: string, prefix: string): ReadonlySet<string> =>
  new Set(
    [...uncommented(sheet).matchAll(new RegExp(`\\.(?<name>${prefix}[a-z0-9-]+)`, "gu"))].map(
      (match) => match.groups?.["name"] ?? "",
    ),
  );

/**
 * Give the parts a sheet selects by their `data-slot`.
 *
 * @param sheet The sheet.
 * @returns Each slot's value, once.
 */
const selectedSlots = (sheet: string): ReadonlySet<string> =>
  new Set(
    [...uncommented(sheet).matchAll(/\[data-slot="(?<slot>[^"]+)"\]/gu)].map(
      (match) => match.groups?.["slot"] ?? "",
    ),
  );

/**
 * Read plate's core modules, every `.ts` and `.tsx` file under `src/` outside an `alpha/` folder,
 * by path under `src/`.
 *
 * @returns Each core module's path and text.
 */
const coreModules = (): ReadonlyMap<string, string> => {
  const root = new URL("../", import.meta.url);

  return new Map(
    readdirSync(root, { encoding: "utf-8", recursive: true })
      .map((file) => file.split(path.sep).join("/"))
      .filter((file) => /\.tsx?$/u.test(file) && !file.split("/").includes("alpha"))
      .toSorted()
      .map((file) => [file, readFileSync(new URL(file, root), "utf-8")]),
  );
};

/**
 * List the classes of Alpha's vocabulary a text names, as a class token.
 *
 * @param text The text.
 * @param classes The classes.
 * @returns Each class it names, once.
 */
const namedClasses = (text: string, classes: readonly string[]): readonly string[] =>
  classes.filter((name) => new RegExp(`(?<![\\w-])${name}(?![\\w-])`, "u").test(text));

describe("Alpha's renderer vocabulary", () => {
  it("is no core class: plate's vocabulary and its sheets name none", () => {
    assert.deepStrictEqual(
      Object.keys(rendererClasses).filter((name) => name.startsWith("alpha-")),
      [],
    );
    for (const [sheet, text] of coreSheets) {
      assert.deepStrictEqual([...selectedClasses(text, "alpha-")], [], sheet);
      assert.notMatch(text, /plate-alpha/u, `${sheet} names Alpha's layer`);
    }
  });

  it("is named by no core module, so only content and Alpha's sheets ever write or read one", () => {
    const classes = Object.keys(alphaClasses);

    assert.deepStrictEqual(
      [...coreModules()].flatMap(([file, text]) =>
        namedClasses(text, classes).map((name) => `${file}: ${name}`),
      ),
      [],
    );
    assert.deepStrictEqual(
      namedClasses('<p className="alpha-number-strip">', [...classes, "alpha-planted"]),
      ["alpha-number-strip"],
      "the census reads a class token (the plant)",
    );
  });
});

describe("Alpha's sheets", () => {
  it("draw every part Alpha's renderers write: each alpha- data-slot a module of src/alpha/ writes, Alpha's sheets select", () => {
    const drawn = new Set([...alphaSheets.values()].flatMap((sheet) => [...selectedSlots(sheet)]));
    const written = modulesUnder("./").flatMap((source) =>
      [...source.matchAll(/data-slot="(?<slot>alpha-[^"]+)"/gu)].map(
        (match) => match.groups?.["slot"] ?? "",
      ),
    );

    assert.isAbove(written.length, 0, "Alpha's renderers write parts of their own");
    assert.deepStrictEqual(
      written.filter((slot) => !drawn.has(slot)),
      [],
      "a part Alpha's renderers write that no Alpha sheet draws",
    );
  });
});
