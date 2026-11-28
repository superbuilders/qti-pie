/**
 * Read the CSS features a stylesheet uses, parsed by CSS Syntax Level 3's tokenizer and its rule
 * and declaration grammar, written here (§4, "Tokenization", and §5, "Parsing"), so a selector's
 * pseudo-class is known as one and never as text that looks like one: a comment, a string, an
 * attribute selector's value or a property's name holds none.
 *
 * Each use is a feature: a MathML element a type selector styles (`<math>`), a declaration's
 * property (`property zoom`) or an at-rule's descriptor (`descriptor @font-face src`), a selector's
 * pseudo-class (`:has()`, `:nth-child(… of S)`) or pseudo-element (`::part()`), an at-rule
 * (`@layer`, `@import … layer()`, a media query's range), a nested rule (`&`), or a value's
 * function (`oklch()`) or unit (`lh`). A use is guarded where a browser that lacks the feature
 * keeps what the rule means without it:
 *
 * - Everything inside `@supports`, a block that applies only where the browser has what it asks for;
 * - A value's function or unit where the same block declares the same property before it, a fallback
 *   the browser keeps once it drops the later declaration;
 * - A property whose block also declares it with a vendor's prefix (`-webkit-user-select` beside
 *   `user-select`), which the prefixed engine reads.
 *
 * A vendor-prefixed feature is written for its one engine and is no use; nor is a media query's
 * feature, since a query is evaluated, false where its feature is unknown, and never dropped.
 *
 * @module
 * @see https://www.w3.org/TR/css-syntax-3/#tokenization
 * @see https://www.w3.org/TR/css-syntax-3/#parsing
 * @see https://www.w3.org/TR/css-conditional-3/#at-supports
 * @see https://www.w3.org/TR/selectors-4/#invalid
 */

/**
 * A punctuation token of CSS Syntax 3 (§4): a bracket, a colon, a semicolon or a comma.
 */
type Punctuation = "(" | ")" | ":" | ";" | "[" | "]" | "comma" | "{" | "}";

/**
 * The punctuation tokens, by the code point each is.
 */
const punctuation: ReadonlyMap<string, Punctuation> = new Map([
  ["(", "("],
  [")", ")"],
  [",", "comma"],
  [":", ":"],
  [";", ";"],
  ["[", "["],
  ["]", "]"],
  ["{", "{"],
  ["}", "}"],
]);

/**
 * Each opening bracket's closing one.
 */
const closing: ReadonlyMap<string, Punctuation> = new Map([
  ["(", ")"],
  ["[", "]"],
  ["{", "}"],
]);

/**
 * A token of CSS Syntax 3 (§4), the kinds this reader tells apart, each with the line it starts
 * on: an ident, a function's name, an at-keyword, a hash, a string or a URL with its value; a
 * number, a percentage or a dimension, the dimension with its unit; a delimiter with its code
 * point; and the punctuation.
 */
type Token = { readonly line: number } & (
  | { readonly kind: Punctuation | "whitespace" }
  | {
      readonly kind: "at-keyword" | "function" | "hash" | "ident" | "string" | "url";
      readonly value: string;
    }
  | { readonly kind: "delim"; readonly value: string }
  | { readonly kind: "dimension"; readonly unit: string }
  | { readonly kind: "number" | "percentage" }
);

/**
 * A component value of CSS Syntax 3 (§5.4.7): a preserved token, a simple block with its contents,
 * or a function with its arguments.
 */
type Component =
  | Token
  | {
      readonly contents: readonly Component[];
      readonly kind: "block";
      readonly line: number;
      readonly open: "(" | "[" | "{";
    }
  | {
      readonly args: readonly Component[];
      readonly kind: "call";
      readonly line: number;
      readonly name: string;
    };

/**
 * A rule of CSS Syntax 3 (§5): an at-rule, its name, prelude and block where it has one, or a
 * qualified rule, its prelude and its block.
 */
type Rule =
  | {
      readonly block: readonly Component[] | undefined;
      readonly kind: "at";
      readonly line: number;
      readonly name: string;
      readonly prelude: readonly Component[];
    }
  | {
      readonly block: readonly Component[];
      readonly kind: "qualified";
      readonly line: number;
      readonly prelude: readonly Component[];
    };

/**
 * A use of a CSS feature: the feature (`:has()`, `::part()`, `:nth-child(… of S)`, `:not(…, …)`,
 * `@layer`, `@import … layer()`, `@media (range)`, `&`, `oklch()`, `lh`, `property zoom`,
 * `<math>`); whether it is guarded; and the line it stands on.
 */
export interface CssUse {
  readonly feature: string;
  readonly guarded: boolean;
  readonly line: number;
}

/**
 * Whether a code point is a digit.
 *
 * @param char The code point, or `undefined` past the end.
 * @returns Whether it is.
 */
const digit = (char: string | undefined): boolean =>
  char !== undefined && char >= "0" && char <= "9";

/**
 * Whether a code point is CSS whitespace: a space, a tab or a newline (§4.2, after the input's
 * preprocessing; a form feed or a carriage return is read as one too).
 *
 * @param char The code point, or `undefined` past the end.
 * @returns Whether it is.
 */
const space = (char: string | undefined): boolean =>
  char === " " || char === "\t" || char === "\n" || char === "\r" || char === "\f";

/**
 * Whether a code point is a hex digit.
 *
 * @param char The code point, or `undefined` past the end.
 * @returns Whether it is.
 */
const hexDigit = (char: string | undefined): boolean =>
  digit(char) || (char !== undefined && "abcdefABCDEF".includes(char));

/**
 * Whether a code point starts an identifier: a letter, `_` or any non-ASCII code point.
 *
 * @param char The code point, or `undefined` past the end.
 * @returns Whether it does.
 */
const nameStart = (char: string | undefined): boolean =>
  char !== undefined &&
  ((char >= "a" && char <= "z") ||
    (char >= "A" && char <= "Z") ||
    char === "_" ||
    (char.codePointAt(0) ?? 0) >= 0x80);

/**
 * Whether a code point continues an identifier: a name start, a digit or `-`.
 *
 * @param char The code point, or `undefined` past the end.
 * @returns Whether it does.
 */
const nameChar = (char: string | undefined): boolean =>
  nameStart(char) || digit(char) || char === "-";

/**
 * Tokenize a stylesheet as CSS Syntax 3's §4.3 consumes it, comments dropped: at each code point
 * the first reader whose token starts there reads it, as §4.3.1 tries each in turn.
 *
 * @param text The stylesheet's text.
 * @returns Its tokens.
 */
const tokensOf = (text: string): readonly Token[] => {
  const chars: string[] = [];

  for (const char of text) {
    chars.push(char);
  }

  const tokens: Token[] = [];
  let at = 0;
  let line = 1;
  const peek = (ahead: number): string | undefined => chars[at + ahead];
  const take = (): string => {
    const char = chars[at] ?? "";

    at += 1;

    if (char === "\n") {
      line += 1;
    }

    return char;
  };
  const validEscape = (ahead: number): boolean => peek(ahead) === "\\" && peek(ahead + 1) !== "\n";
  const startsName = (ahead: number): boolean => {
    const first = peek(ahead);

    if (first === "-") {
      return nameStart(peek(ahead + 1)) || peek(ahead + 1) === "-" || validEscape(ahead + 1);
    }

    return nameStart(first) || validEscape(ahead);
  };
  const startsNumber = (): boolean => {
    const [first, second, third] = [peek(0), peek(1), peek(2)];

    if (first === "+" || first === "-") {
      return digit(second) || (second === "." && digit(third));
    }

    return digit(first) || (first === "." && digit(second));
  };
  const escaped = (): string => {
    take();

    const hex: string[] = [];

    while (hex.length < 6 && hexDigit(peek(0))) {
      hex.push(take());
    }

    if (hex.length === 0) {
      return take();
    }

    if (space(peek(0))) {
      take();
    }

    return String.fromCodePoint(Number.parseInt(hex.join(""), 16) || 0xff_fd);
  };
  const name = (): string => {
    const written: string[] = [];

    while (nameChar(peek(0)) || validEscape(0)) {
      written.push(validEscape(0) ? escaped() : take());
    }

    return written.join("");
  };
  const numeric = (): Token => {
    const start = line;

    if (peek(0) === "+" || peek(0) === "-") {
      take();
    }

    while (digit(peek(0))) {
      take();
    }

    if (peek(0) === "." && digit(peek(1))) {
      take();

      while (digit(peek(0))) {
        take();
      }
    }

    if (
      (peek(0) === "e" || peek(0) === "E") &&
      (digit(peek(1)) || ((peek(1) === "+" || peek(1) === "-") && digit(peek(2))))
    ) {
      take();
      take();

      while (digit(peek(0))) {
        take();
      }
    }

    if (startsName(0)) {
      return { kind: "dimension", line: start, unit: name().toLowerCase() };
    }

    if (peek(0) === "%") {
      take();

      return { kind: "percentage", line: start };
    }

    return { kind: "number", line: start };
  };
  const quoted = (quote: string): Token => {
    const start = line;
    const written: string[] = [];

    take();

    while (at < chars.length && peek(0) !== quote && peek(0) !== "\n") {
      if (peek(0) === "\\" && peek(1) === "\n") {
        take();
        take();
      } else {
        written.push(validEscape(0) ? escaped() : take());
      }
    }

    take();

    return { kind: "string", line: start, value: written.join("") };
  };
  const urlRest = (start: number): Token => {
    const written: string[] = [];

    while (space(peek(0))) {
      take();
    }

    while (at < chars.length && peek(0) !== ")") {
      written.push(validEscape(0) ? escaped() : take());
    }

    take();

    return { kind: "url", line: start, value: written.join("").trim() };
  };
  const identLike = (): Token => {
    const start = line;
    const value = name();

    if (peek(0) !== "(") {
      return { kind: "ident", line: start, value };
    }

    take();

    let ahead = 0;

    while (space(peek(ahead))) {
      ahead += 1;
    }

    return value.toLowerCase() === "url" && peek(ahead) !== '"' && peek(ahead) !== "'"
      ? urlRest(start)
      : { kind: "function", line: start, value };
  };
  const blank = (): Token | "comment" | undefined => {
    const start = line;

    if (peek(0) === "/" && peek(1) === "*") {
      take();
      take();

      while (at < chars.length && !(peek(0) === "*" && peek(1) === "/")) {
        take();
      }

      take();
      take();

      return "comment";
    }

    if (!space(peek(0))) {
      return undefined;
    }

    while (space(peek(0))) {
      take();
    }

    return { kind: "whitespace", line: start };
  };
  const string = (): Token | undefined =>
    peek(0) === '"' || peek(0) === "'" ? quoted(peek(0) ?? "") : undefined;
  const numberLike = (): Token | undefined => (startsNumber() ? numeric() : undefined);
  const nameLike = (): Token | undefined => (startsName(0) ? identLike() : undefined);
  const marked = (): Token | undefined => {
    const start = line;

    if (peek(0) === "#" && (nameChar(peek(1)) || validEscape(1))) {
      take();

      return { kind: "hash", line: start, value: name() };
    }

    if (peek(0) === "@" && startsName(1)) {
      take();

      return { kind: "at-keyword", line: start, value: name().toLowerCase() };
    }

    const kind = punctuation.get(peek(0) ?? "");

    if (kind === undefined) {
      return undefined;
    }

    take();

    return { kind, line: start };
  };
  const readers = [blank, string, numberLike, nameLike, marked];

  while (at < chars.length) {
    const start = line;
    let token: Token | "comment" | undefined;

    for (const reader of readers) {
      token ??= reader();
    }

    token ??= { kind: "delim", line: start, value: take() };

    if (token !== "comment") {
      tokens.push(token);
    }
  }

  return tokens;
};

/**
 * Read a stylesheet's component values (CSS Syntax 3, §5.4.7 to §5.4.9): each simple block and
 * function with its contents.
 *
 * @param tokens The stylesheet's tokens.
 * @returns Its component values.
 */
const componentsOf = (tokens: readonly Token[]): readonly Component[] => {
  let at = 0;
  const until = (close: Punctuation | "end"): Component[] => {
    const read: Component[] = [];

    while (at < tokens.length) {
      const token = tokens[at];

      at += 1;

      if (token === undefined || token.kind === close) {
        return read;
      }

      if (token.kind === "(" || token.kind === "[" || token.kind === "{") {
        read.push({
          contents: until(closing.get(token.kind) ?? "end"),
          kind: "block",
          line: token.line,
          open: token.kind,
        });
      } else if (token.kind === "function") {
        read.push({
          args: until(")"),
          kind: "call",
          line: token.line,
          name: token.value.toLowerCase(),
        });
      } else {
        read.push(token);
      }
    }

    return read;
  };

  return until("end");
};

/**
 * Read a list of rules (CSS Syntax 3, §5.4.1 and §5.4.2): an at-keyword starts an at-rule, which a
 * `;` or a `{}` block ends; anything else starts a qualified rule, which its `{}` block ends.
 *
 * @param components The list's component values.
 * @returns Its rules.
 */
const rulesOf = (components: readonly Component[]): readonly Rule[] => {
  const rules: Rule[] = [];
  let prelude: Component[] = [];
  let atRule: { readonly line: number; readonly name: string } | undefined;

  for (const component of components) {
    if (
      component.kind === "at-keyword" &&
      atRule === undefined &&
      prelude.every((each) => each.kind === "whitespace")
    ) {
      atRule = { line: component.line, name: component.value };
      prelude = [];
    } else if (component.kind === ";" && atRule !== undefined) {
      rules.push({ block: undefined, kind: "at", line: atRule.line, name: atRule.name, prelude });
      atRule = undefined;
      prelude = [];
    } else if (component.kind === "block" && component.open === "{") {
      rules.push(
        atRule === undefined
          ? {
              block: component.contents,
              kind: "qualified",
              line: prelude.find((each) => each.kind !== "whitespace")?.line ?? component.line,
              prelude,
            }
          : {
              block: component.contents,
              kind: "at",
              line: atRule.line,
              name: atRule.name,
              prelude,
            },
      );
      atRule = undefined;
      prelude = [];
    } else if (component.kind !== "whitespace" || prelude.length > 0 || atRule !== undefined) {
      prelude.push(component);
    }
  }

  return rules;
};

/**
 * A declaration of a style rule's block: its property, lowercased but for a custom property, and
 * its value.
 */
interface Declaration {
  readonly property: string;
  readonly value: readonly Component[];
}

/**
 * A style rule's block: its declarations, in order, and its nested rules.
 */
interface StyleBlock {
  readonly declarations: readonly Declaration[];
  readonly nested: readonly Rule[];
}

/**
 * Read a style rule's block (CSS Syntax 3, §5.4.5, with CSS Nesting's rules among its
 * declarations): each declaration, and each nested rule, an at-rule or a qualified rule, which a
 * `{}` block in what would be a declaration marks.
 *
 * @param block The block's contents.
 * @returns Its declarations and its nested rules.
 */
const blockOf = (block: readonly Component[]): StyleBlock => {
  const declarations: Declaration[] = [];
  const nested: Component[] = [];
  let item: Component[] = [];
  const ended = (): void => {
    const written = item.filter((each) => each.kind !== "whitespace");
    const [first, second] = written;

    if (
      written.some((each) => each.kind === "block" && each.open === "{") ||
      first?.kind === "at-keyword"
    ) {
      for (const component of item) {
        nested.push(component);
      }
    } else if (first?.kind === "ident" && second?.kind === ":") {
      declarations.push({
        property: first.value.startsWith("--") ? first.value : first.value.toLowerCase(),
        value: written.slice(2),
      });
    }

    item = [];
  };

  for (const component of block) {
    item.push(component);

    if (component.kind === ";" || (component.kind === "block" && component.open === "{")) {
      if (component.kind === ";") {
        item.pop();
      }

      ended();
    }
  }

  ended();

  return { declarations, nested: rulesOf(nested) };
};

/**
 * The at-rules whose block is a list of rules, read as a stylesheet is.
 */
const ruleListBlocks: ReadonlySet<string> = new Set([
  "container",
  "layer",
  "media",
  "scope",
  "starting-style",
  "supports",
]);

/**
 * The pseudo-classes and pseudo-elements whose arguments are selectors.
 */
const selectorArguments: ReadonlySet<string> = new Set([
  "has",
  "host",
  "host-context",
  "is",
  "matches",
  "not",
  "slotted",
  "where",
]);

/**
 * The elements of MathML Core, each a name a type selector may write: a selector that styles one is
 * styling MathML the page draws.
 */
const mathml: ReadonlySet<string> = new Set([
  "annotation",
  "annotation-xml",
  "maction",
  "math",
  "merror",
  "mfrac",
  "mi",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mprescripts",
  "mroot",
  "mrow",
  "ms",
  "mspace",
  "msqrt",
  "mstyle",
  "msub",
  "msubsup",
  "msup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "semantics",
]);

/**
 * Whether an identifier after a component is a type selector: it starts a compound, at the
 * selector's start or after whitespace, a comma or a combinator.
 *
 * @param before The component before it, `undefined` at the start.
 * @returns Whether it is.
 */
const typed = (before: Component | undefined): boolean =>
  before === undefined ||
  before.kind === "whitespace" ||
  before.kind === "comma" ||
  (before.kind === "delim" && ">+~".includes(before.value));

/**
 * The prefixes a vendor writes its own form of a property with.
 */
const vendorPrefixes = ["-webkit-", "-moz-", "-ms-"] as const;

/**
 * Whether a component of an `@import`'s prelude names a cascade layer: `layer` or `layer(…)`.
 *
 * @param component The component.
 * @returns Whether it does.
 */
const layerNamed = (component: Component): boolean =>
  (component.kind === "call" && component.name === "layer") ||
  (component.kind === "ident" && component.value.toLowerCase() === "layer");

/**
 * Whether a component of a media query is a feature in range syntax, a parenthesized block that
 * holds `<`, `=` or `>` (Media Queries 4, §2.4.4).
 *
 * @param component The component.
 * @returns Whether it is.
 */
const ranged = (component: Component): boolean =>
  component.kind === "block" &&
  component.contents.some((inner) => inner.kind === "delim" && "<=>".includes(inner.value));

/**
 * Give the uses of CSS features in a stylesheet, as {@link CssUse} says each is read and whether it
 * is guarded.
 *
 * @param text The stylesheet's text.
 * @returns Each use, in the order the stylesheet holds them.
 */
export const cssUsesIn = (text: string): readonly CssUse[] => {
  const uses: CssUse[] = [];
  const used = (feature: string, guarded: boolean, line: number): void => {
    if (
      !feature.startsWith(":-") &&
      !feature.startsWith("::-") &&
      !feature.startsWith("property -")
    ) {
      uses.push({ feature, guarded, line });
    }
  };
  const walk = {
    atRule: (rule: Extract<Rule, { readonly kind: "at" }>, gated: boolean): void => {
      used(`@${rule.name}`, gated, rule.line);

      if (rule.name === "import" && rule.prelude.some((each) => layerNamed(each))) {
        used("@import … layer()", gated, rule.line);
      }

      if (rule.name === "media" && rule.prelude.some((each) => ranged(each))) {
        used("@media (range)", gated, rule.line);
      }

      if (rule.block === undefined) {
        return;
      }

      if (ruleListBlocks.has(rule.name)) {
        walk.rules(rulesOf(rule.block), gated || rule.name === "supports");
      } else if (rule.name === "keyframes") {
        for (const keyframe of rulesOf(rule.block)) {
          if (keyframe.kind === "qualified") {
            walk.style(keyframe.block, gated, "property ");
          }
        }
      } else {
        walk.style(rule.block, gated, `descriptor @${rule.name} `);
      }
    },
    pseudo: (
      pseudo: Extract<Component, { readonly kind: "call" }>,
      colons: string,
      gated: boolean,
    ): void => {
      const ofAt = pseudo.args.findIndex(
        (each) => each.kind === "ident" && each.value.toLowerCase() === "of",
      );
      const listed = pseudo.args.some(
        (each) => each.kind === "comma" || (each.kind === "delim" && ">+~".includes(each.value)),
      );

      if ((pseudo.name === "nth-child" || pseudo.name === "nth-last-child") && ofAt !== -1) {
        used(`:${pseudo.name}(… of S)`, gated, pseudo.line);
        walk.selector(pseudo.args.slice(ofAt + 1), gated);

        return;
      }

      used(
        pseudo.name === "not" && listed ? ":not(…, …)" : `${colons}${pseudo.name}()`,
        gated,
        pseudo.line,
      );

      if (selectorArguments.has(pseudo.name)) {
        walk.selector(pseudo.args, gated);
      }
    },
    rules: (rules: readonly Rule[], gated: boolean): void => {
      for (const rule of rules) {
        if (rule.kind === "at") {
          walk.atRule(rule, gated);
        } else {
          walk.selector(rule.prelude, gated);
          walk.style(rule.block, gated, "property ");
        }
      }
    },
    selector: (components: readonly Component[], gated: boolean): void => {
      for (const [index, component] of components.entries()) {
        const colons = components[index - 2]?.kind === ":" ? "::" : ":";
        const before = components[index - 1];

        if (component.kind === "ident" && typed(before) && mathml.has(component.value)) {
          used(`<${component.value}>`, gated, component.line);
        }

        if (before?.kind !== ":") {
          continue;
        }

        if (component.kind === "ident") {
          used(`${colons}${component.value.toLowerCase()}`, gated, component.line);
        } else if (component.kind === "call") {
          walk.pseudo(component, colons, gated);
        }
      }
    },
    style: (block: readonly Component[], gated: boolean, named: string): void => {
      const { declarations, nested } = blockOf(block);
      const declared = new Set<string>();

      const twinned = new Set(
        declarations.flatMap(({ property }) =>
          vendorPrefixes
            .filter((prefix) => property.startsWith(prefix))
            .map((prefix) => property.slice(prefix.length)),
        ),
      );

      for (const { property, value } of declarations) {
        used(
          property.startsWith("--") ? "property --*" : `${named}${property}`,
          gated || twinned.has(property),
          value[0]?.line ?? 0,
        );
        walk.value(value, gated || declared.has(property));
        declared.add(property);
      }

      for (const rule of nested) {
        if (rule.kind === "qualified") {
          used("&", gated, rule.line);
        }
      }

      walk.rules(nested, gated);
    },
    value: (components: readonly Component[], gated: boolean): void => {
      for (const component of components) {
        if (component.kind === "dimension") {
          used(component.unit, gated, component.line);
        } else if (component.kind === "call") {
          used(`${component.name}()`, gated, component.line);
          walk.value(component.args, gated);
        } else if (component.kind === "block") {
          walk.value(component.contents, gated);
        }
      }
    },
  };

  walk.rules(rulesOf(componentsOf(tokensOf(text))), false);

  return uses;
};

/**
 * Give the address of each stylesheet a stylesheet imports, as its `@import` writes it: a string or
 * a `url()`.
 *
 * @param text The stylesheet's text.
 * @returns The addresses, in order.
 */
export const cssImportsIn = (text: string): readonly string[] =>
  rulesOf(componentsOf(tokensOf(text))).flatMap((rule) => {
    if (rule.kind !== "at" || rule.name !== "import") {
      return [];
    }

    const address = rule.prelude.find(
      (component) => component.kind === "string" || component.kind === "url",
    );

    return address !== undefined && (address.kind === "string" || address.kind === "url")
      ? [address.value]
      : [];
  });
