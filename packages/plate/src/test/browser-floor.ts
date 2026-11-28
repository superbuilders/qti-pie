/**
 * The test support that holds qti-pie to its hosts' browser floor (`#plate/browser-floor.ts`)
 * against MDN's browser compatibility data, at the version qti-pie pins: whether a feature is fully
 * supported at the floor, by its key in the data; the members of JavaScript's built-ins and of the
 * DOM the floor lacks, which the suites take out of the realm they run the PCI frame's code in; the
 * syntax and the globals a script's source names, by their keys; the CSS feature a use of
 * `#plate/test/css-features.ts` is, by its key; and the CSS a module of Alpha's writes.
 *
 * A feature is fully supported at the floor where each of the floor's browsers has shipped it by
 * the floor's version and not removed it since, with no flag, no vendor's prefix, no other name and
 * no partial implementation: the data's own statement of support, read as written, so a feature no
 * one has listed by hand is held all the same.
 *
 * @module
 * @see https://github.com/mdn/browser-compat-data/blob/main/schemas/compat-data-schema.md
 */
import bcd from "@mdn/browser-compat-data" with { type: "json" };
import type {
  CompatStatement,
  Identifier,
  SimpleSupportStatement,
  SupportBlock,
  SupportStatement,
} from "@mdn/browser-compat-data";
import { regex } from "arkregex";
import { readFileSync } from "node:fs";
import nodePath from "node:path";
import { Predicate } from "effect";
import { parseSync, Visitor } from "oxc-parser/src-js";
import type { Node } from "oxc-parser/src-js";
import { browserFloor } from "#plate/browser-floor.ts";

/**
 * Read a version the data writes: a release (`18.1`), or the last release a feature came by at the
 * latest (`≤83`, read as that release); `undefined` for none, a preview or an unknown version.
 *
 * @param written The version, as the data writes it.
 * @returns The release.
 */
const releaseOf = (written: string | false | undefined): number | undefined => {
  if (written === undefined || written === false) {
    return undefined;
  }

  const release = Number(written.startsWith("≤") ? written.slice(1) : written);

  return Number.isFinite(release) ? release : undefined;
};

/**
 * Whether a statement of support says the feature is there at a release, under its own name:
 * shipped by it, not removed by it, with no flag, no prefix and no other name, a partial
 * implementation as well as a full one.
 *
 * @param statement The statement.
 * @param release The release.
 * @returns Whether it does.
 */
const shippedIn = (statement: SimpleSupportStatement, release: number): boolean => {
  const added = releaseOf(statement.version_added);
  const removed = releaseOf(statement.version_removed);

  return (
    statement.flags === undefined &&
    statement.prefix === undefined &&
    statement.alternative_name === undefined &&
    added !== undefined &&
    added <= release &&
    (removed === undefined || removed > release)
  );
};

/**
 * Whether a statement of support is full support at a release: shipped by it, not removed by it,
 * with no flag, no prefix, no other name and no partial implementation.
 *
 * @param statement The statement.
 * @param release The release.
 * @returns Whether it is.
 */
const fullIn = (statement: SimpleSupportStatement, release: number): boolean =>
  shippedIn(statement, release) && statement.partial_implementation !== true;

/**
 * Whether a browser's support, one statement or several, holds full support at a release.
 *
 * @param support The browser's support, `undefined` where the data gives none.
 * @param release The release.
 * @returns Whether it does.
 */
const fullAt = (support: SupportStatement | undefined, release: number): boolean => {
  if (support === undefined) {
    return false;
  }

  return (Array.isArray(support) ? support : [support]).some((statement) =>
    fullIn(statement, release),
  );
};

/**
 * Each of the floor's browsers, by its name, as a test of a feature's support at the floor's
 * release of it: a browser the floor comes to name has no test until one is written here.
 */
const floorTests: Readonly<Record<keyof typeof browserFloor, (support: SupportBlock) => boolean>> =
  {
    chrome: (support) => fullAt(support.chrome, browserFloor.chrome),
    firefox: (support) => fullAt(support.firefox, browserFloor.firefox),
    safari: (support) => fullAt(support.safari, browserFloor.safari),
    safari_ios: (support) => fullAt(support.safari_ios, browserFloor.safari_ios),
  };

/**
 * Give the first release of a browser in which a feature is fully supported and stays so.
 *
 * @param support The browser's support, `undefined` where the data gives none.
 * @returns The release, `undefined` where the browser has none.
 */
export const firstFullRelease = (support: SupportStatement | undefined): number | undefined => {
  let first: number | undefined;

  for (const statement of support === undefined || Array.isArray(support)
    ? (support ?? [])
    : [support]) {
    const added = releaseOf(statement.version_added);

    if (
      added !== undefined &&
      statement.version_removed === undefined &&
      fullIn(statement, added) &&
      (first === undefined || added < first)
    ) {
      first = added;
    }
  }

  return first;
};

/**
 * Whether a browser's support, one statement or several, has the feature at a release, in part or
 * in full.
 *
 * @param support The browser's support, `undefined` where the data gives none.
 * @param release The release.
 * @returns Whether it does.
 */
const shippedAt = (support: SupportStatement | undefined, release: number): boolean =>
  support !== undefined &&
  (Array.isArray(support) ? support : [support]).some((statement) => shippedIn(statement, release));

/**
 * Each of the floor's browsers, by its name, as a test of whether a feature is there at the floor's
 * release, in part or in full.
 */
const presentTests: Readonly<
  Record<keyof typeof browserFloor, (support: SupportBlock) => boolean>
> = {
  chrome: (support) => shippedAt(support.chrome, browserFloor.chrome),
  firefox: (support) => shippedAt(support.firefox, browserFloor.firefox),
  safari: (support) => shippedAt(support.safari, browserFloor.safari),
  safari_ios: (support) => shippedAt(support.safari_ios, browserFloor.safari_ios),
};

/**
 * Whether a feature is there in each of the floor's browsers at its release, in part or in full: a
 * member a browser of the floor has, which its realm holds, whether or not it does all the data
 * says.
 *
 * @param compat The feature's statement in the data.
 * @returns Whether it is.
 */
const presentAtFloor = (compat: CompatStatement): boolean =>
  Object.values(presentTests).every((test) => test(compat.support));

/**
 * Whether a feature is fully supported at the floor, in each of its browsers.
 *
 * @param compat The feature's statement in the data.
 * @returns Whether it is.
 */
export const atFloor = (compat: CompatStatement): boolean =>
  Object.values(floorTests).every((test) => test(compat.support));

/**
 * The data's areas, by name, each a key's first name.
 */
const areas: ReadonlyMap<string, Identifier> = new Map([
  ["api", bcd.api],
  ["css", bcd.css],
  ["html", bcd.html],
  ["javascript", bcd.javascript],
  ["mathml", bcd.mathml],
  ["svg", bcd.svg],
]);

/**
 * Give a feature's statement in the data by its key.
 *
 * @param key The key, its names joined by `.` (`css.selectors.has`).
 * @returns The statement, `undefined` where the data has no such feature.
 */
export const compatOf = (key: string): CompatStatement | undefined => {
  const [area = "", ...names] = key.split(".");
  let node: Identifier | undefined = areas.get(area);

  for (const name of names) {
    node = node?.[name];
  }

  return node?.__compat;
};

/**
 * Give the entries under a node of the data, each by its name, its statement of support aside.
 *
 * @param node The node.
 * @returns Each entry and its name.
 */
const childrenOf = (node: Identifier): readonly (readonly [string, Identifier])[] =>
  Object.keys(node).flatMap((key) => {
    const child = node[key];

    return key === "__compat" || child === undefined ? [] : [[key, child] as const];
  });

/**
 * A name a script can write as a member: a JavaScript identifier of ASCII letters, digits and `$`.
 */
const memberName = regex("^[A-Za-z$][A-Za-z\\d$]*$", "u");

/**
 * Give the members under a node of the data that a browser of the floor does not have, each by its
 * path from the global object (`Promise.try`, `Iterator.map`, `Element.moveBefore`,
 * `Intl.Segmenter.segment`): a member the data names as a JavaScript identifier, a static one by
 * its name without `_static`; the rest of the data's entries (events, behaviours, parameters) name
 * no member. A member a browser has in part is there, as its realm holds it (iOS's media `volume`,
 * which reads 1 and takes no setting), so a run without the members this gives is that browser's;
 * the source checks (`keysIn`) hold full support.
 *
 * @param node The node.
 * @param owner The path of the node's own object.
 * @returns The paths.
 */
const lackedUnder = (node: Identifier, owner: readonly string[]): readonly string[] =>
  childrenOf(node).flatMap(([key, child]) => {
    const name = key.endsWith("_static") ? key.slice(0, -"_static".length) : key;

    if (!memberName.test(name) || name === owner.at(-1)) {
      return [];
    }

    const path = [...owner, name];
    const compat = child.__compat;
    const lacked = compat === undefined || presentAtFloor(compat) ? [] : [path.join(".")];

    return [...lacked, ...lackedUnder(child, path)];
  });

/**
 * The members of JavaScript's built-ins and of the DOM the floor lacks, by their paths from the
 * global object, as {@link lackedUnder} gives them.
 */
export const laterMembers: readonly string[] = [
  ...lackedUnder(bcd.javascript["builtins"] ?? {}, []),
  ...lackedUnder(bcd.api, []),
];

/**
 * Take each member out of the realm this function runs in, so code that reaches one meets
 * `undefined`, as code in a browser that lacks it does: the member of its owner's own and of its
 * owner's prototype, and of the global object where its owner is `Window`, whose members a
 * window holds as its own. The function reaches nothing outside itself, so its source text runs in
 * any realm: a `node:vm` context's, or a page's in Chrome.
 *
 * @param paths The members' paths, from the global object.
 */
export const removeLaterMembers = (paths: readonly string[]): void => {
  for (const path of paths) {
    const names = path.split(".");
    const member = names.pop() ?? "";
    let owner: object | undefined = globalThis;

    for (const name of names) {
      const next: unknown =
        owner === undefined ? undefined : Object.getOwnPropertyDescriptor(owner, name)?.value;

      owner = next instanceof Object ? next : undefined;
    }

    const prototype: unknown =
      owner === undefined ? undefined : Object.getOwnPropertyDescriptor(owner, "prototype")?.value;

    for (const holder of [
      owner,
      prototype,
      names.join(".") === "Window" ? globalThis : undefined,
    ]) {
      if (holder instanceof Object) {
        Reflect.deleteProperty(holder, member);
      }
    }
  }
};

/**
 * Give each member the realm this function runs in still has, of some, as {@link
 * removeLaterMembers} reaches them, but one no script can delete, a non-configurable property (the
 * language's well-known symbols, `Symbol.dispose`), which {@link keysIn} holds in a source by
 * name instead. The function reaches nothing outside itself, so its source text runs in any realm.
 *
 * @param paths The members' paths, from the global object.
 * @returns The paths of the members the realm has, joined by `, `, a string that leaves any realm
 *   as itself.
 */
export const reachedMembers = (paths: readonly string[]): string => {
  const reached: string[] = [];

  for (const path of paths) {
    const names = path.split(".");
    const member = names.pop() ?? "";
    let owner: unknown = globalThis;

    for (const name of names) {
      owner =
        owner instanceof Object ? Object.getOwnPropertyDescriptor(owner, name)?.value : undefined;
    }

    const prototype: unknown =
      owner instanceof Object
        ? Object.getOwnPropertyDescriptor(owner, "prototype")?.value
        : undefined;
    const holders = [owner, prototype, names.join(".") === "Window" ? globalThis : undefined];

    if (
      holders.some(
        (holder) =>
          holder instanceof Object &&
          Object.getOwnPropertyDescriptor(holder, member)?.configurable === true,
      )
    ) {
      reached.push(path);
    }
  }

  return reached.join(", ");
};

/**
 * Give a string literal's value.
 *
 * @param node The node, or `undefined` where an argument is missing.
 * @returns The value, `undefined` where the node is no string literal.
 */
const stringOf = (node: Node | undefined): string | undefined => {
  if (node?.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis[0]?.value.cooked ?? undefined;
  }

  return node?.type === "Literal" && Predicate.isString(node.value) ? node.value : undefined;
};

/**
 * Give the name a member's key writes: an identifier's, or a string literal's value.
 *
 * @param node The key.
 * @returns The name, `undefined` where the key is neither.
 */
const nameOf = (node: Node): string | undefined =>
  node.type === "Identifier" ? node.name : stringOf(node);

/**
 * Give the static text of a stylesheet a module writes: a string literal's value, a template's
 * text with each expression read as the identifier `x`, the elements of an array its `join` joins,
 * or what a `const` bound to one of those holds.
 *
 * @param node The value written.
 * @param bound Each `const` of the source, by name, and its initializer.
 * @returns The text, `undefined` where the value is none of those.
 */
const sheetTextOf = (node: Node, bound: ReadonlyMap<string, Node>): string | undefined => {
  if (node.type === "TemplateLiteral") {
    return node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join("x");
  }

  if (node.type === "Identifier") {
    const init = bound.get(node.name);

    return init === undefined ? undefined : sheetTextOf(init, new Map());
  }

  if (
    node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    nameOf(node.callee.property) === "join" &&
    node.callee.object.type === "ArrayExpression"
  ) {
    return node.callee.object.elements
      .map((element) => (element === null ? "" : (sheetTextOf(element, bound) ?? "")))
      .join("");
  }

  return stringOf(node);
};

/**
 * Turn a DOM property's camel-case name into its CSS property's: `minWidth` into `min-width`.
 *
 * @param name The name.
 * @returns The property.
 */
const kebabOf = (name: string): string => {
  const written: string[] = [];

  for (const char of name) {
    written.push(char >= "A" && char <= "Z" ? `-${char.toLowerCase()}` : char);
  }

  return written.join("");
};

/**
 * The CSS a module's source writes, as one stylesheet, and each way it writes style that the
 * stylesheet cannot hold, refused.
 */
export interface ModuleCss {
  readonly css: string;
  readonly refused: readonly string[];
}

/**
 * Give a style value as a module writes it: a literal's or a template's text, each expression read
 * as the identifier `x`; anything else, a value the module computes, as `x`.
 *
 * @param node The value.
 * @param bound Each `const` of the source, by name, and its initializer.
 * @returns The value's text.
 */
const styleValueOf = (node: Node | undefined, bound: ReadonlyMap<string, Node>): string =>
  node === undefined ? "x" : (sheetTextOf(node, bound) ?? "x");

/**
 * Whether an expression is an element's `style`: `<expression>.style`.
 *
 * @param node The expression.
 * @returns Whether it is.
 */
const styleObject = (node: Node): boolean =>
  node.type === "MemberExpression" && !node.computed && nameOf(node.property) === "style";

/**
 * Give the CSS a module's source writes, as one stylesheet: the text of each `style` element it
 * makes (`createElement("style")`, its `textContent` written), and a rule `x{…}` of each property
 * it writes through an element's `style` (`style.minWidth = …`, `style.setProperty("zoom", …)`),
 * its value as written, each expression in it read as the identifier `x`: what the module computes,
 * a colour or a size, is no feature, and every selector, property, function and unit it writes is
 * its source's own. Any other way to write style is refused, so this grammar is the only one a
 * module styles in: a computed property name, `cssText`, an alias of `style` or a destructuring of
 * it, `Object.assign` onto it, and `setAttribute("style", …)`.
 *
 * @param file The source's name, which the parser reads its language from.
 * @param source The source, a script.
 * @returns The stylesheet, and what is refused.
 */
export const moduleCssIn = (file: string, source: string): ModuleCss => {
  const { program } = parseSync(file, source, { lang: "js" });
  const bound = new Map<string, Node>();
  const sheets = new Set<string>();
  const written: string[] = [];
  const declarations: string[] = [];
  const refused: string[] = [];

  new Visitor({
    AssignmentExpression: (node) => {
      const { left: target } = node;

      if (target.type !== "MemberExpression") {
        return;
      }

      const member = target.computed ? stringOf(target.property) : nameOf(target.property);

      if (
        member === "textContent" &&
        target.object.type === "Identifier" &&
        sheets.has(target.object.name)
      ) {
        written.push(sheetTextOf(node.right, bound) ?? "");
      } else if (styleObject(target.object)) {
        if (member === undefined || member === "cssText") {
          refused.push(`${file}: style written as ${member ?? "a computed property"}`);
        } else {
          declarations.push(`${kebabOf(member)}:${styleValueOf(node.right, bound)}`);
        }
      }
    },
    CallExpression: (node) => {
      const { callee } = node;
      const method = callee.type === "MemberExpression" ? nameOf(callee.property) : undefined;
      const [first, second] = node.arguments;

      if (callee.type !== "MemberExpression") {
        return;
      }

      if (method === "setProperty" && styleObject(callee.object)) {
        const property = stringOf(first);

        if (property === undefined) {
          refused.push(`${file}: style written through setProperty with a computed property`);
        } else {
          declarations.push(`${property}:${styleValueOf(second, bound)}`);
        }
      } else if (method === "setAttribute" && stringOf(first)?.toLowerCase() === "style") {
        refused.push(`${file}: style written through setAttribute("style")`);
      } else if (
        method === "assign" &&
        callee.object.type === "Identifier" &&
        callee.object.name === "Object" &&
        first !== undefined &&
        styleObject(first)
      ) {
        refused.push(`${file}: style written through Object.assign`);
      }
    },
    VariableDeclarator: (node) => {
      if (node.init !== null && styleObject(node.init)) {
        refused.push(`${file}: an alias of an element's style`);
      }

      if (
        node.id.type === "ObjectPattern" &&
        node.id.properties.some(
          (property) => property.type === "Property" && nameOf(property.key) === "style",
        )
      ) {
        refused.push(`${file}: a destructuring of an element's style`);
      }

      if (node.id.type !== "Identifier" || node.init === null) {
        return;
      }

      bound.set(node.id.name, node.init);

      const { init } = node;

      if (
        init.type === "CallExpression" &&
        init.callee.type === "MemberExpression" &&
        nameOf(init.callee.property) === "createElement" &&
        stringOf(init.arguments[0]) === "style"
      ) {
        sheets.add(node.id.name);
      }
    },
  }).visit(program);

  return { css: [...written, `x{${declarations.join(";")}}`].join("\n"), refused };
};

/**
 * A regular expression's modifier group in its pattern's text: `(?i:`, `(?-m:`, `(?s-i:`.
 */
const modifierGroup = regex("\\(\\?-?[ims]+(?:-[ims]+)?:", "u");

/**
 * A regular expression's named group in its pattern's text: `(?<name>`.
 */
const namedGroup = regex("\\(\\?<[A-Za-z_$]", "u");

/**
 * Give the syntax a regular expression's pattern and flags use, by their keys in the data: a
 * lookbehind, a modifier (`(?i:…)`), a named group, and the `d`, `s` and `v` flags.
 *
 * @param pattern The pattern.
 * @param flags The flags.
 * @returns The keys.
 */
const patternKeys = (pattern: string, flags: string): readonly string[] => [
  ...(pattern.includes("(?<=") || pattern.includes("(?<!")
    ? ["javascript.regular_expressions.lookbehind_assertion"]
    : []),
  ...(modifierGroup.test(pattern) ? ["javascript.regular_expressions.modifier"] : []),
  ...(namedGroup.test(pattern) ? ["javascript.regular_expressions.named_capturing_group"] : []),
  ...(flags.includes("d") ? ["javascript.builtins.RegExp.hasIndices"] : []),
  ...(flags.includes("s") ? ["javascript.builtins.RegExp.dotAll"] : []),
  ...(flags.includes("v") ? ["javascript.builtins.RegExp.unicodeSets"] : []),
];

/**
 * The data's key of each logical assignment operator.
 */
const assignments: ReadonlyMap<string, string> = new Map([
  ["&&=", "javascript.operators.logical_and_assignment"],
  ["??=", "javascript.operators.nullish_coalescing_assignment"],
  ["||=", "javascript.operators.logical_or_assignment"],
]);

/**
 * Give each name a binding of a pattern declares.
 *
 * @param pattern The pattern.
 * @returns The names.
 */
const boundBy = (pattern: Node | null): readonly string[] => {
  if (pattern?.type === "Identifier") {
    return [pattern.name];
  }

  if (pattern?.type === "ObjectPattern") {
    return pattern.properties.flatMap((property) =>
      boundBy(property.type === "RestElement" ? property.argument : property.value),
    );
  }

  if (pattern?.type === "ArrayPattern") {
    return pattern.elements.flatMap((element) => boundBy(element));
  }

  if (pattern?.type === "AssignmentPattern") {
    return boundBy(pattern.left);
  }

  return pattern?.type === "RestElement" ? boundBy(pattern.argument) : [];
};

/**
 * The names a script reaches the global object by, whose members are globals: `window.fetch` is
 * `fetch`.
 */
const globalObjects: ReadonlySet<string> = new Set(["frames", "globalThis", "self", "window"]);

/**
 * Give the features a script's source uses that the data holds by key: its syntax (a class's
 * private names and static parts, a logical assignment, optional chaining and `??`, a `using`
 * declaration, a numeric separator, a regular expression's lookbehind, modifiers, named groups and
 * flags; a brand check, `#x in o`, is a binary expression whose left is a private name, which the
 * parser's `BinaryExpression` type leaves out, as its `PrivateInExpression`), and each global it
 * names that it does not declare itself, a JavaScript built-in, a DOM interface or function, or a
 * member of `Window`, with each static member it reads of one; and each name the data has no entry
 * for, under `unknown`, so a key this function writes is one the data has. A prototype's member,
 * which the source does not say the owner of, is held by the runs the suites drive the code in, in
 * a realm without the members the floor lacks.
 *
 * @param file The source's name, which the parser reads its language from.
 * @param source The source, a script or a module.
 * @returns The keys used, each once, sorted, with any parse error as one more.
 */
export const keysIn = (file: string, source: string): readonly string[] => {
  const { errors, program } = parseSync(file, source);
  const found = new Set<string>(errors.map((error) => `parse error: ${error.message}`));
  const declared = new Set<string>();
  const keys = new WeakSet<Node>();
  const builtins = bcd.javascript["builtins"] ?? {};
  const { api } = bcd;
  const windowMembers = api["Window"] ?? {};
  const globalKey = (name: string): string | undefined => {
    if (builtins[name] !== undefined) {
      return `javascript.builtins.${name}`;
    }

    if (api[name] !== undefined) {
      return `api.${name}`;
    }

    return windowMembers[name] === undefined ? undefined : `api.Window.${name}`;
  };

  const globalNamed = (node: Node): string | undefined => {
    if (node.type === "Identifier") {
      return declared.has(node.name) ? undefined : node.name;
    }

    if (node.type !== "MemberExpression" || node.computed) {
      return undefined;
    }

    const holder = globalNamed(node.object);

    return holder !== undefined && globalObjects.has(holder) ? nameOf(node.property) : undefined;
  };

  new Visitor({
    ArrowFunctionExpression: (node) => {
      for (const parameter of node.params) {
        for (const name of boundBy(parameter)) {
          declared.add(name);
        }
      }
    },
    CatchClause: (node) => {
      for (const name of boundBy(node.param)) {
        declared.add(name);
      }
    },
    ClassDeclaration: (node) => {
      for (const name of boundBy(node.id)) {
        declared.add(name);
      }
    },
    FunctionDeclaration: (node) => {
      for (const name of [
        ...boundBy(node.id),
        ...node.params.flatMap((parameter) => boundBy(parameter)),
      ]) {
        declared.add(name);
      }
    },
    FunctionExpression: (node) => {
      for (const name of [
        ...boundBy(node.id),
        ...node.params.flatMap((parameter) => boundBy(parameter)),
      ]) {
        declared.add(name);
      }
    },
    ImportSpecifier: (node) => {
      declared.add(node.local.name);
    },
    TSEnumDeclaration: (node) => {
      declared.add(node.id.name);
    },
    TSInterfaceDeclaration: (node) => {
      declared.add(node.id.name);
    },
    TSTypeAliasDeclaration: (node) => {
      declared.add(node.id.name);
    },
    VariableDeclarator: (node) => {
      for (const name of boundBy(node.id)) {
        declared.add(name);
      }
    },
  }).visit(program);

  new Visitor({
    AssignmentExpression: (node) => {
      const key = assignments.get(node.operator);

      if (key !== undefined) {
        found.add(key);
      }
    },
    BinaryExpression: (node) => {
      const left: { readonly type: string } = node.left;

      if (node.operator === "in" && left.type === "PrivateIdentifier") {
        found.add("javascript.classes.private_class_fields_in");
      }
    },
    ChainExpression: () => {
      found.add("javascript.operators.optional_chaining");
    },
    ExportSpecifier: (node) => {
      keys.add(node.local);
      keys.add(node.exported);
    },
    Identifier: (node) => {
      const key = keys.has(node) || declared.has(node.name) ? undefined : globalKey(node.name);

      if (key !== undefined) {
        found.add(key);
      }
    },
    Literal: (node) => {
      if ("regex" in node) {
        for (const key of patternKeys(node.regex.pattern, node.regex.flags)) {
          found.add(key);
        }
      }

      if (Predicate.isNumber(node.value) && node.raw?.includes("_") === true) {
        found.add("javascript.grammar.numeric_separators");
      }
    },
    LogicalExpression: (node) => {
      if (node.operator === "??") {
        found.add("javascript.operators.nullish_coalescing");
      }
    },
    MemberExpression: (node) => {
      if (!node.computed) {
        keys.add(node.property);
      }

      const member = node.computed ? stringOf(node.property) : nameOf(node.property);
      const named = globalNamed(node.object);

      if (named !== undefined && globalObjects.has(named)) {
        const key = member === undefined ? undefined : globalKey(member);

        found.add(key ?? (member === undefined ? `refused: a computed member of ${named}` : ""));

        return;
      }

      const ownerKey = named === undefined ? undefined : globalKey(named);

      if (ownerKey === undefined) {
        return;
      }

      if (member === undefined) {
        found.add(`refused: a computed member of ${ownerKey}`);

        return;
      }

      for (const key of [`${ownerKey}.${member}_static`, `${ownerKey}.${member}`]) {
        if (compatOf(key) !== undefined) {
          found.add(key);

          return;
        }
      }
    },
    MethodDefinition: (node) => {
      keys.add(node.key);

      if (node.key.type === "PrivateIdentifier") {
        found.add("javascript.classes.private_class_methods");
      }
    },
    NewExpression: (node) => {
      if (node.callee.type === "Identifier" && node.callee.name === "RegExp") {
        const [text, flags] = node.arguments;

        for (const key of patternKeys(stringOf(text) ?? "", stringOf(flags) ?? "")) {
          found.add(key);
        }
      }
    },
    Property: (node) => {
      if (!node.computed) {
        keys.add(node.key);
      }
    },
    PropertyDefinition: (node) => {
      keys.add(node.key);

      if (node.key.type === "PrivateIdentifier") {
        found.add("javascript.classes.private_class_fields");
      }

      if (node.static) {
        found.add("javascript.classes.static.class_fields");
      }
    },
    StaticBlock: () => {
      found.add("javascript.classes.static.initialization_blocks");
    },
    TSMethodSignature: (node) => {
      keys.add(node.key);
    },
    TSPropertySignature: (node) => {
      keys.add(node.key);
    },
    TSTypeReference: (node) => {
      keys.add(node.typeName);
    },
    VariableDeclaration: (node) => {
      if (node.kind === "using") {
        found.add("javascript.statements.using");
      } else if (node.kind === "await using") {
        found.add("javascript.statements.await_using");
      }
    },
    VariableDeclarator: (node) => {
      const named = node.init === null ? undefined : globalNamed(node.init);
      const key = named === undefined ? undefined : globalKey(named);

      if (node.id.type !== "Identifier" && (key !== undefined || globalObjects.has(named ?? ""))) {
        found.add(`refused: a destructuring of ${key ?? named ?? ""}`);
      }
    },
  }).visit(program);

  found.delete("");

  return [...found]
    .map((key) =>
      key.startsWith("parse error") || key.startsWith("refused") || compatOf(key) !== undefined
        ? key
        : `unknown ${key}`,
    )
    .toSorted();
};

/**
 * The data's key of each CSS function `#plate/test/css-features.ts` reads whose name the data
 * gives more than one entry, or none under its own name.
 */
const functionKeys: ReadonlyMap<string, string> = new Map([
  ["calc()", "css.types.calc"],
  ["fit-content()", "css.properties.grid-template-columns.fit-content"],
  ["format()", "css.at-rules.font-face.src"],
  ["hsla()", "css.types.color.hsl"],
  ["inset()", "css.types.basic-shape.inset"],
  ["minmax()", "css.properties.grid-template-columns.minmax"],
  ["polygon()", "css.types.basic-shape.polygon"],
  ["rem()", "css.types.rem"],
  ["repeat()", "css.properties.grid-template-columns.repeat"],
  ["rgba()", "css.types.color.rgb"],
  ["scroll()", "css.properties.animation-timeline.scroll"],
  ["type()", "css.types.type"],
]);

/**
 * The data's key of each CSS unit whose entry is not `css.types.length.<unit>`.
 */
const unitKeys: ReadonlyMap<string, string> = new Map([
  ...["cqb", "cqh", "cqi", "cqmax", "cqmin", "cqw"].map(
    (unit) => [unit, "css.types.length.container_query_length_units"] as const,
  ),
  ...["dvb", "dvh", "dvi", "dvmax", "dvmin", "dvw"].map(
    (unit) => [unit, "css.types.length.viewport_percentage_units_dynamic"] as const,
  ),
  ...["lvb", "lvh", "lvi", "lvmax", "lvmin", "lvw"].map(
    (unit) => [unit, "css.types.length.viewport_percentage_units_large"] as const,
  ),
  ...["svb", "svh", "svi", "svmax", "svmin", "svw"].map(
    (unit) => [unit, "css.types.length.viewport_percentage_units_small"] as const,
  ),
  ...["deg", "grad", "rad", "turn"].map((unit) => [unit, `css.types.angle.${unit}`] as const),
  ...["dpcm", "dpi", "dppx", "x"].map((unit) => [unit, `css.types.resolution.${unit}`] as const),
  ["fr", "css.types.flex"],
  ["ms", "css.types.time"],
  ["px", "css.types.length"],
  ["s", "css.types.time"],
]);

/**
 * Give the entries under `css.types` named by a function's name, each by its key.
 *
 * @param node The node to look under.
 * @param path Its key.
 * @param name The function's name.
 * @returns The keys.
 */
const typesNamed = (node: Identifier, path: string, name: string): readonly string[] =>
  childrenOf(node).flatMap(([key, child]) => [
    ...(key.toLowerCase() === name && child.__compat !== undefined ? [`${path}.${key}`] : []),
    ...typesNamed(child, `${path}.${key}`, name),
  ]);

/**
 * Give the data's key of a CSS feature `#plate/test/css-features.ts` reads.
 *
 * @param feature The feature.
 * @returns Its key, `undefined` where the data names it under no single key.
 */
export const cssKeyOf = (feature: string): string | undefined => {
  const named = new Map([
    ["&", "css.selectors.nesting"],
    [":not(…, …)", "css.selectors.not.selector_list"],
    [":nth-child(… of S)", "css.selectors.nth-child.of_syntax"],
    [":nth-last-child(… of S)", "css.selectors.nth-last-child.of_syntax"],
    ["@import … layer()", "css.at-rules.import.layer"],
    ["@media (range)", "css.at-rules.media.range_syntax"],
    ["property --*", "css.properties.custom-property"],
  ]).get(feature);

  if (named !== undefined) {
    return named;
  }

  if (feature.startsWith("<")) {
    return `mathml.elements.${feature.slice(1, -1)}`;
  }

  if (feature.startsWith("descriptor @")) {
    return `css.at-rules.${feature.slice("descriptor @".length).replace(" ", ".")}`;
  }

  if (feature.startsWith("property ")) {
    return `css.properties.${feature.slice("property ".length)}`;
  }

  if (feature.startsWith(":")) {
    return `css.selectors.${feature.replaceAll(":", "").replace("()", "")}`;
  }

  if (feature.startsWith("@")) {
    return `css.at-rules.${feature.slice(1)}`;
  }

  if (feature.endsWith("()")) {
    const candidates = typesNamed(bcd.css["types"] ?? {}, "css.types", feature.slice(0, -2));

    return functionKeys.get(feature) ?? (candidates.length === 1 ? candidates[0] : undefined);
  }

  return unitKeys.get(feature) ?? `css.types.length.${feature}`;
};

/**
 * Give the features a script's source uses that the floor lacks, by their keys, as {@link keysIn}
 * reads them: each key the data holds and the floor does not fully support, each name the data has
 * no entry for, and any parse error.
 *
 * @param file The source's name, which the parser reads its language from.
 * @param source The source.
 * @returns The keys, sorted.
 */
export const lackedIn = (file: string, source: string): readonly string[] =>
  keysIn(file, source).filter((key) => {
    const compat = compatOf(key);

    return compat === undefined || !atFloor(compat);
  });

/**
 * Give every module of plate's source some modules reach, the modules themselves among them: each
 * one a module imports or re-exports by plate's own specifier (`#plate/…`), its value imports
 * alone, since a type-only import or export runs nothing, and so on until none is new.
 *
 * @param entries The modules to start from, by their paths.
 * @param root Plate's source folder, which `#plate/` names.
 * @returns The modules reached, by their paths, sorted.
 */
export const importClosure = (entries: readonly string[], root: string): readonly string[] => {
  const reached = new Set<string>();
  const waiting = [...entries];

  for (let file = waiting.pop(); file !== undefined; file = waiting.pop()) {
    if (reached.has(file)) {
      continue;
    }

    reached.add(file);

    const { program } = parseSync(file, readFileSync(file, "utf-8"));

    for (const statement of program.body) {
      const specifier =
        (statement.type === "ImportDeclaration" && statement.importKind !== "type") ||
        ((statement.type === "ExportNamedDeclaration" ||
          statement.type === "ExportAllDeclaration") &&
          statement.exportKind !== "type")
          ? statement.source?.value
          : undefined;

      if (specifier?.startsWith("#plate/") === true) {
        waiting.push(nodePath.join(root, specifier.slice("#plate/".length)));
      }
    }
  }

  return [...reached].toSorted();
};
