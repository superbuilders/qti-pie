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
const alphaSheets = new Map(
  ["alpha/styles/base.css", "alpha/styles/theme.css"].map((sheet) => [sheet, sheetOf(sheet)]),
);

/**
 * Plate's own two sheets, by path under `src/`.
 */
const coreSheets = new Map(
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
 * Read the modules that write plate's parts: plate's UI (`src/ui/<x>`) and Alpha's renderers
 * beside this file (`src/alpha/<x>`), whose parts, such as Alpha's Choice line, Alpha's sheets
 * draw too.
 *
 * @returns Each `.ts` and `.tsx` file under `src/ui/` and `src/alpha/` but their tests.
 */
const uiModules = (): readonly string[] => [...modulesUnder("../ui/"), ...modulesUnder("./")];

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
 * Give the `data-*` names a sheet selects (`[data-picked]`, `[data-mark="missed"]`).
 *
 * @param sheet The sheet.
 * @returns Each name, once.
 */
const selectedData = (sheet: string): ReadonlySet<string> =>
  new Set(
    [...uncommented(sheet).matchAll(/\[(?<name>data-[a-z0-9-]+)/gu)].map(
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
 * Give the states a sheet selects by their value (`[data-mark="missed"]`), each `name="value"`,
 * parts (`data-slot`) left out.
 *
 * @param sheet The sheet.
 * @returns Each state's name and value, once.
 */
const selectedStates = (sheet: string): ReadonlySet<string> =>
  new Set(
    [...uncommented(sheet).matchAll(/\[(?<state>data-(?!slot=)[a-z0-9-]+="[^"]*")\]/gu)].map(
      (match) => match.groups?.["state"] ?? "",
    ),
  );

/**
 * Give the custom properties a sheet reads (`var(--plate-target-size)`).
 *
 * @param sheet The sheet.
 * @returns Each property's name, once.
 */
const readProperties = (sheet: string): ReadonlySet<string> =>
  new Set(
    [...uncommented(sheet).matchAll(/var\(\s*(?<name>--[a-z0-9-]+)/gu)].map(
      (match) => match.groups?.["name"] ?? "",
    ),
  );

/**
 * Give the custom properties a sheet declares (`--plate-target-size: 4rem`).
 *
 * @param sheet The sheet.
 * @returns Each property's name, once.
 */
const declaredProperties = (sheet: string): ReadonlySet<string> =>
  new Set(
    [...uncommented(sheet).matchAll(/(?<![\w-])(?<name>--[a-z0-9-]+)\s*:/gu)].map(
      (match) => match.groups?.["name"] ?? "",
    ),
  );

/**
 * Give a rule's declarations, each as `property: value`: its whitespace collapsed, one space after
 * the property's colon and none before it, and the property in lower case but a custom property,
 * whose name keeps its case, so every check reads one spelling of each.
 *
 * @param body The rule's block, between its braces.
 * @returns Each declaration.
 */
const declarationsIn = (body: string): readonly string[] =>
  body
    .split(";")
    .map((declaration) => declaration.trim().replaceAll(/\s+/gu, " "))
    .filter((declaration) => declaration !== "")
    .map((declaration) => {
      const colon = declaration.indexOf(":");
      const property = declaration.slice(0, colon).trim();

      return colon === -1
        ? declaration
        : `${property.startsWith("--") ? property : property.toLowerCase()}: ${declaration.slice(colon + 1).trim()}`;
    });

/**
 * Give the declarations of a sheet's one rule whose selector, its whitespace collapsed, ends in
 * the given text.
 *
 * @param sheet The sheet.
 * @param selector The selector's end, its whitespace collapsed.
 * @returns The rule's declarations, each `property: value`.
 */
const declarationsOf = (sheet: string, selector: string): readonly string[] => {
  const rules = [
    ...uncommented(sheet).matchAll(/(?<selector>[^{};]+)\{(?<body>[^{}]*)\}/gu),
  ].filter((match) =>
    (match.groups?.["selector"] ?? "").trim().replaceAll(/\s+/gu, " ").endsWith(selector),
  );

  assert.strictEqual(rules.length, 1, `one rule ends in ${selector}`);

  return declarationsIn(rules[0]?.groups?.["body"] ?? "");
};

/**
 * One rule of a sheet, at any depth of its layers and media queries: its selector list, its
 * whitespace collapsed, and its declarations, each `property: value`.
 */
interface Rule {
  readonly selector: string;
  readonly declarations: readonly string[];
}

/**
 * Give a sheet's rules, each innermost block with its selector list.
 *
 * @param sheet The sheet.
 * @returns Each rule, in order.
 */
const rulesOf = (sheet: string): readonly Rule[] =>
  [...uncommented(sheet).matchAll(/(?<selector>[^{};]+)\{(?<body>[^{}]*)\}/gu)].map((match) => ({
    declarations: declarationsIn(match.groups?.["body"] ?? ""),
    selector: (match.groups?.["selector"] ?? "").trim().replaceAll(/\s+/gu, " "),
  }));

/**
 * Give how a character of a selector changes its depth in brackets and parentheses, read forwards.
 *
 * @param character The character.
 * @returns 1 for an opening bracket or parenthesis, -1 for a closing one, else 0.
 */
const nesting = (character: string): number => {
  if ("([".includes(character)) {
    return 1;
  }

  return ")]".includes(character) ? -1 : 0;
};

/**
 * Give the last compound selector of each complex selector of a selector list, the element the rule
 * styles, each split at the list's commas and its last combinator outside brackets and parentheses.
 *
 * @param selector The selector list, its whitespace collapsed.
 * @returns Each last compound, as written.
 */
const subjectsOf = (selector: string): readonly string[] => {
  const complexes: string[] = [];
  let depth = 0;
  let current = "";

  for (const character of selector) {
    depth += nesting(character);
    if (character === "," && depth === 0) {
      complexes.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  complexes.push(current.trim());

  return complexes.map((complex) => {
    let at = complex.length;
    let level = 0;

    while (at > 0) {
      const character = complex.charAt(at - 1);

      level -= nesting(character);
      if (level === 0 && " >+~".includes(character)) {
        break;
      }

      at -= 1;
    }

    return complex.slice(at);
  });
};

/**
 * Give the declarations of a sheet's rules that style an element, read from each rule's last
 * compound selectors, a pseudo-element's rule left out, each with its rule's selector.
 *
 * @param sheet The sheet.
 * @param subject Whether a last compound is the element, such as {@link isCard}.
 * @param properties The properties to keep.
 * @returns Each such declaration, `selector { property: value }`.
 */
const declaredOn = (
  sheet: string,
  subject: (compound: string) => boolean,
  properties: RegExp,
): readonly string[] =>
  rulesOf(sheet).flatMap(({ declarations, selector }) =>
    subjectsOf(selector).some((compound) => !compound.includes("::") && subject(compound))
      ? declarations
          .filter((declaration) => properties.test(declaration.split(":")[0] ?? ""))
          .map((declaration) => `${selector} { ${declaration} }`)
      : [],
  );

/**
 * The properties that size a box, any of which a later rule could shrink a card with.
 */
const sizing = /^(?:min-|max-)?(?:inline-size|block-size|width|height)$/u;

/**
 * The properties that lay a strip out, any of which a later rule could break its one row with.
 */
const laying =
  /^(?:display|grid-auto-flow|grid-auto-columns|grid-template(?:-[a-z]+)?|flex-wrap|flex-direction|overflow(?:-[xy]|-inline|-block)?|(?:max-)?inline-size|columns|column-count)$/u;

/**
 * Tell whether a last compound is a card of a number strip: plate's hottext choice.
 *
 * @param compound The last compound.
 * @returns Whether it styles a card.
 */
const isCard = (compound: string): boolean =>
  compound.startsWith('[data-slot="plate-hottext-choice"]');

/**
 * Tell whether a last compound is a number strip itself.
 *
 * @param compound The last compound.
 * @returns Whether it styles the strip.
 */
const isStrip = (compound: string): boolean => compound === ".alpha-number-strip";

/**
 * Give what sizes a number strip's cards in a sheet.
 *
 * @param sheet The sheet.
 * @returns Each sizing declaration on a card, with its rule's selector.
 */
const cardSizes = (sheet: string): readonly string[] => declaredOn(sheet, isCard, sizing);

/**
 * Give what lays a number strip out in a sheet.
 *
 * @param sheet The sheet.
 * @returns Each laying-out declaration on the strip, with its rule's selector.
 */
const stripLayout = (sheet: string): readonly string[] => declaredOn(sheet, isStrip, laying);

/**
 * The properties Alpha's theme may declare, its look and nothing else: colours, backgrounds,
 * edges, outlines, shadows, fonts, a text's decoration, a line's height, opacity, margins and
 * tokens. What lays a part out, sizes, moves, hides or scales it is the base sheet's.
 */
const presenting =
  /^(?:--[a-z0-9-]+|color|background(?:-color)?|border(?:-[a-z-]+)?|corner-shape|outline(?:-[a-z]+)?|box-shadow|font(?:-[a-z-]+)?|text-decoration(?:-[a-z]+)?|line-height|opacity|margin(?:-[a-z-]+)?|forced-color-adjust)$/u;

/**
 * The properties a theme's pseudo-element may declare beside {@link presenting}: a frame drawn
 * over its part, which takes no press.
 */
const framing = /^(?:content|position|inset|pointer-events)$/u;

/**
 * Tell whether a declaration of a theme moves or grows its part's press: outside
 * {@link presenting}, a margin that pulls the part over another, or for a pseudo-element's frame,
 * outside {@link framing} or an inset other than 0.
 *
 * @param declaration The declaration, `property: value`.
 * @param pseudo Whether every selector of its rule is a pseudo-element's.
 * @returns Whether it does.
 */
const movesPress = (declaration: string, pseudo: boolean): boolean => {
  const colon = declaration.indexOf(":");
  const property = declaration.slice(0, colon).trim();
  const value = declaration.slice(colon + 1).trim();

  if (property.startsWith("margin")) {
    return value.includes("-");
  }

  if (pseudo && framing.test(property)) {
    return property === "inset" && value !== "0";
  }

  return !presenting.test(property);
};

/**
 * Give what a sheet declares that {@link movesPress} its part, and each pseudo-element's frame that
 * takes the press (a position without `pointer-events: none`).
 *
 * @param sheet The sheet.
 * @returns Each such declaration, with its rule's selector.
 */
const unpresenting = (sheet: string): readonly string[] =>
  rulesOf(sheet).flatMap(({ declarations, selector }) => {
    const pseudo = subjectsOf(selector).every((compound) => compound.includes("::"));
    const pressed =
      pseudo &&
      declarations.some((declaration) => declaration.startsWith("position:")) &&
      !declarations.includes("pointer-events: none")
        ? [`${selector} { pointer-events: none is missing }`]
        : [];

    return [
      ...declarations
        .filter((declaration) => movesPress(declaration, pseudo))
        .map((declaration) => `${selector} { ${declaration} }`),
      ...pressed,
    ];
  });

/**
 * Give the rules of a sheet's `@media (forced-colors: active)` blocks.
 *
 * @param sheet The sheet.
 * @returns Each rule inside such a block.
 */
const forcedRulesOf = (sheet: string): readonly Rule[] => {
  const text = uncommented(sheet);
  const found: Rule[] = [];
  let at = text.indexOf("@media (forced-colors: active)");

  while (at !== -1) {
    const open = text.indexOf("{", at);
    let depth = 0;
    let end = open;

    for (; end < text.length; end += 1) {
      const character = text.charAt(end);

      if (character === "{") {
        depth += 1;
      } else if (character === "}") {
        depth -= 1;
      }

      if (depth === 0) {
        break;
      }
    }
    found.push(...rulesOf(text.slice(open + 1, end)));
    at = text.indexOf("@media (forced-colors: active)", end);
  }

  return found;
};

/**
 * Give the states a sheet writes another way than `[data-x]` or `[data-x="value"]`, which the
 * checks of state values would not read.
 *
 * @param sheet The sheet.
 * @returns Each such attribute selector, as written.
 */
const strayStates = (sheet: string): readonly string[] =>
  [...uncommented(sheet).matchAll(/\[data-[^\]]*\]/gu)]
    .map(([written]) => written)
    .filter((written) => !/^\[data-[a-z0-9-]+(?:="[^"]*")?\]$/u.test(written));

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

/**
 * Give a sheet's top-level statements and the preludes of its top-level blocks, in order, each
 * with its whitespace collapsed: `@layer a, b;` for a statement, `@layer a {` for a block.
 *
 * @param sheet The sheet.
 * @returns Each top-level statement or block prelude.
 */
const topLevel = (sheet: string): readonly string[] => {
  const text = uncommented(sheet);
  const found: string[] = [];
  let depth = 0;
  let pending = "";

  for (const character of text) {
    if (depth === 0) {
      pending += character;
    }

    if (character === "{") {
      if (depth === 0) {
        found.push(pending.trim().replaceAll(/\s+/gu, " "));
        pending = "";
      }

      depth += 1;
    } else if (character === "}") {
      depth -= 1;
    } else if (character === ";" && depth === 0) {
      found.push(pending.trim().replaceAll(/\s+/gu, " "));
      pending = "";
    }
  }

  assert.strictEqual(depth, 0, "the sheet's braces balance");
  assert.strictEqual(pending.trim(), "", "the sheet ends on a statement or a block");

  return found;
};

/**
 * List the classes neither of Alpha's sheets selects.
 *
 * @param classes The classes.
 * @returns Each class nothing presents.
 */
const unpresented = (classes: readonly string[]): readonly string[] =>
  classes.filter(
    (name) =>
      ![...alphaSheets.values()].some((sheet) => selectedClasses(sheet, "alpha-").has(name)),
  );

describe("Alpha's renderer vocabulary", () => {
  it("names each class under Alpha's own prefix, alpha-, the vendor's code QTI's implementation guide §3.6.1 asks for", () => {
    for (const name of Object.keys(alphaClasses)) {
      assert.match(name, /^alpha-[a-z0-9]+(?:-[a-z0-9]+)*$/u, name);
    }
  });

  it("presents every class in Alpha's sheets", () => {
    assert.deepStrictEqual(unpresented(Object.keys(alphaClasses)), []);
  });

  it("refuses a class nothing presents (the plant)", () => {
    assert.deepStrictEqual(unpresented([...Object.keys(alphaClasses), "alpha-planted"]), [
      "alpha-planted",
    ]);
  });

  it("names every alpha- class Alpha's sheets select, and they select of plate's vocabulary only its declared classes", () => {
    for (const [sheet, text] of alphaSheets) {
      assert.deepStrictEqual(
        [...selectedClasses(text, "alpha-")].filter((name) => !Object.hasOwn(alphaClasses, name)),
        [],
        `${sheet}: an alpha- class Alpha's vocabulary does not name`,
      );
      assert.deepStrictEqual(
        [...selectedClasses(text, "plate-")].filter(
          (name) => !Object.hasOwn(rendererClasses, name),
        ),
        [],
        `${sheet}: a plate- class plate's vocabulary does not name`,
      );
    }
  });

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
  it("hold every rule in @layer plate-alpha, which the base sheet orders after plate", () => {
    assert.deepStrictEqual(topLevel(alphaSheets.get("alpha/styles/base.css") ?? ""), [
      "@layer ui-sdk, plate, plate-alpha;",
      "@layer plate-alpha {",
    ]);
    assert.deepStrictEqual(topLevel(alphaSheets.get("alpha/styles/theme.css") ?? ""), [
      "@layer plate-alpha {",
    ]);
  });

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

  it("key on plate's own parts and states: each data-slot one plate's UI writes, each data-* one plate's sheets select", () => {
    const written = uiModules();
    const states = new Set([...coreSheets.values()].flatMap((sheet) => [...selectedData(sheet)]));

    for (const [sheet, text] of alphaSheets) {
      const slots = [...selectedSlots(text)];

      assert.isAbove(slots.length, 0, `${sheet} selects plate's parts`);
      assert.deepStrictEqual(
        slots.filter((slot) => !written.some((source) => source.includes(`"${slot}"`))),
        [],
        `${sheet}: a data-slot plate's UI does not write`,
      );
      assert.deepStrictEqual(
        [...selectedData(text)].filter((name) => !states.has(name)),
        [],
        `${sheet}: a data-* name plate's sheets do not select`,
      );
    }
  });

  it("key on each state by a value plate's sheets select, so a misspelled value fails", () => {
    const states = new Set([...coreSheets.values()].flatMap((sheet) => [...selectedStates(sheet)]));
    const strays = (text: string): readonly string[] =>
      [...selectedStates(text)].filter((state) => !states.has(state));

    for (const [sheet, text] of alphaSheets) {
      assert.deepStrictEqual(
        strays(text),
        [],
        `${sheet}: a state value plate's sheets do not select`,
      );
    }
    assert.deepStrictEqual(strays('.alpha-number-strip [data-mark="mised"] {}'), [
      'data-mark="mised"',
    ]);
  });

  it("read only custom properties plate's sheets or Alpha's declare, so a misspelled token fails", () => {
    const declared = new Set(
      [...coreSheets.values(), ...alphaSheets.values()].flatMap((sheet) => [
        ...declaredProperties(sheet),
      ]),
    );
    const strays = (text: string): readonly string[] =>
      [...readProperties(text)].filter((name) => !declared.has(name));

    for (const [sheet, text] of alphaSheets) {
      assert.deepStrictEqual(strays(text), [], `${sheet}: a custom property no sheet declares`);
    }
    assert.deepStrictEqual(strays("a { min-inline-size: var(--plate-target-sise); }"), [
      "--plate-target-sise",
    ]);
  });

  it('write each state as [data-x] or [data-x="value"], so every value is read and checked', () => {
    for (const [sheet, text] of alphaSheets) {
      assert.deepStrictEqual(strayStates(text), [], `${sheet}: a state written another way`);
    }
    assert.deepStrictEqual(
      strayStates("a[data-mark=mised], b[data-mark='wrnog'], c[data-mark^=\"r\"] {}"),
      ["[data-mark=mised]", "[data-mark='wrnog']", '[data-mark^="r"]'],
    );
  });

  it("hold a number strip's every card to plate's 64 px target both ways, sized by the base sheet's card rule alone", () => {
    const base = alphaSheets.get("alpha/styles/base.css") ?? "";
    const card = '.alpha-number-strip [data-slot="plate-hottext-choice"]';
    assert.deepStrictEqual(cardSizes(base), [
      `:where([data-slot="plate-hottext"]) ${card} { min-inline-size: var(--plate-target-size) }`,
      `:where([data-slot="plate-hottext"]) ${card} { min-block-size: var(--plate-target-size) }`,
    ]);
    assert.deepStrictEqual(cardSizes(alphaSheets.get("alpha/styles/theme.css") ?? ""), []);
    for (const [sheet, text] of alphaSheets) {
      assert.notInclude([...declaredProperties(text)], "--plate-target-size", sheet);
    }
    assert.match(
      uncommented(coreSheets.get("styles/base.css") ?? ""),
      /--plate-target-size:\s*4rem;/u,
      "plate's target is 4rem, 64 px at the root's 16 px",
    );
    assert.deepStrictEqual(
      cardSizes(
        `${card}:first-child { min-block-size: 44px } ${card}::before { inset: 0; width: 1px }`,
      ),
      [`${card}:first-child { min-block-size: 44px }`],
      "a later card rule's size is read, a pseudo-element's is not (the plant)",
    );
  });

  it("lay a number strip out by the base sheet's strip rule alone: one row that never wraps, no wider than its block, scrolling inside its own box", () => {
    const base = alphaSheets.get("alpha/styles/base.css") ?? "";
    const strip = ':where([data-slot="plate-hottext"]) .alpha-number-strip';
    assert.deepStrictEqual(stripLayout(base), [
      `${strip} { display: grid }`,
      `${strip} { grid-auto-columns: 1fr }`,
      `${strip} { grid-auto-flow: column }`,
      `${strip} { inline-size: max-content }`,
      `${strip} { max-inline-size: calc(100% + var(--plate-number-strip-room, 0.75rem)) }`,
      `${strip} { overflow-x: auto }`,
    ]);
    assert.deepStrictEqual(stripLayout(alphaSheets.get("alpha/styles/theme.css") ?? ""), []);
    assert.deepStrictEqual(
      stripLayout(".x .alpha-number-strip { max-inline-size: none; grid-auto-flow: row }"),
      [
        ".x .alpha-number-strip { max-inline-size: none }",
        ".x .alpha-number-strip { grid-auto-flow: row }",
      ],
      "a theme's strip rule that undoes the layout is read (the plant)",
    );
  });

  it("leave every part's shape to the base sheet: the theme declares only its look, neither sheet selects a class by attribute or nests a rule", () => {
    assert.deepStrictEqual(unpresenting(alphaSheets.get("alpha/styles/theme.css") ?? ""), []);
    for (const [sheet, text] of alphaSheets) {
      assert.notInclude(uncommented(text), "&", `${sheet} nests a rule`);
      assert.notMatch(uncommented(text), /\[\s*class/iu, `${sheet} selects a class by attribute`);
    }
    assert.deepStrictEqual(
      unpresenting(
        ".a { color: red; zoom: 0.5 } .b::after, .b { display: none } .c { translate: 0 -40px; writing-mode: vertical-rl } .d::before { position: absolute; inset: 0; pointer-events: none } .e::after { content: ''; position: absolute; inset: -1000px } .f { margin: 0 0 0.5rem; margin-inline-start: -40px }",
      ),
      [
        ".a { zoom: 0.5 }",
        ".b::after, .b { display: none }",
        ".c { translate: 0 -40px }",
        ".c { writing-mode: vertical-rl }",
        ".e::after { inset: -1000px }",
        ".e::after { pointer-events: none is missing }",
        ".f { margin-inline-start: -40px }",
      ],
      "a theme's rule that lays out, sizes, moves or hides a part is read, a frame is not (the plant)",
    );
    assert.deepStrictEqual(
      rulesOf(".a { --plate-number-strip-room : 0 ; POSITION :absolute }").flatMap(
        ({ declarations }) => declarations,
      ),
      ["--plate-number-strip-room: 0", "position: absolute"],
      "every declaration is read in one spelling (the plant)",
    );
  });

  it("highlight a number strip's start in every state: an opaque fill, Mark under forced colours, and room for every badge", () => {
    const theme = alphaSheets.get("alpha/styles/theme.css") ?? "";
    const base = alphaSheets.get("alpha/styles/base.css") ?? "";
    const start = '[data-slot="plate-hottext-content"] > .alpha-number-strip-start';
    const fills = rulesOf(theme)
      .filter(({ selector }) => selector.endsWith(start))
      .flatMap(({ declarations }) =>
        declarations.filter((declaration) => /^background(?:-color)?:/u.test(declaration)),
      );

    assert.isAbove(fills.length, 0, "the theme fills the start");
    for (const fill of fills) {
      assert.notMatch(fill, /:\s*(?:transparent|none|inherit|initial|unset|Canvas)\b/u, fill);
    }
    assert.includeMembers(
      forcedRulesOf(theme)
        .filter(({ selector }) => selector.endsWith(start))
        .flatMap(({ declarations }) => declarations),
      ["forced-color-adjust: none", "background: Mark", "color: MarkText"],
    );

    const rooms = rulesOf(theme).flatMap(({ declarations }) =>
      declarations.filter((declaration) => declaration.startsWith("--plate-number-strip-room:")),
    );

    assert.isAbove(rooms.length, 0, "the theme sets the strip's room");
    for (const room of rooms) {
      const rem = /^--plate-number-strip-room: (?<rem>[0-9]+(?:\.[0-9]+)?)rem$/u.exec(room)
        ?.groups?.["rem"];

      assert.isAtLeast(Number(rem ?? 0), 0.75, `${room}: the room holds plate's badge, 0.75rem`);
    }
    assert.deepStrictEqual(
      [
        ...new Set(
          [
            ...uncommented(base).matchAll(/var\(--plate-number-strip-room(?<fallback>[^)]*)\)/gu),
          ].map((match) => match.groups?.["fallback"]),
        ),
      ],
      [", 0.75rem"],
      "the base sheet's room is 0.75rem where a theme sets none",
    );
    assert.include(
      declarationsOf(base, ':where([data-slot="plate-hottext"]) .alpha-number-strip').join("; "),
      "scroll-padding-inline: calc(2 * var(--plate-target-size))",
      "a card the keyboard moves to scrolls into the strip whole",
    );
  });

  it("stretch a number strip's start over its card's whole face", () => {
    assert.includeMembers(
      [
        ...declarationsOf(
          alphaSheets.get("alpha/styles/base.css") ?? "",
          '.alpha-number-strip [data-slot="plate-hottext-content"] > .alpha-number-strip-start',
        ),
      ],
      ["place-self: stretch", "margin: 0 calc(-1 * var(--plate-numeral-room))"],
    );
  });
});
