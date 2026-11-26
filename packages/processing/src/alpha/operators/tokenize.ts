/**
 * `tokenize(text, separator)` (composable-operators.md §2.1 P5): XPath F&O 3.1 `fn:tokenize($input,
 * $pattern)` with no flags, the pattern an XML Schema regular expression (Appendix F). Its
 * separators are found in one reading of the text: left to right, without overlap, each the match
 * F&O chooses at the leftmost position where one begins, the first of two alternatives that both
 * match there, quantifiers greedy. The pieces between them, in order; none where any piece is
 * empty, since an ordered container holds no NULL.
 *
 * A separator is read once, where its literal is admitted ({@link separatorOf}): a pattern outside
 * Appendix F's grammar, or one that matches the empty string (F&O FORX0003), is no separator, so
 * publication refuses it and `tokenize` never meets one. Its reading keeps the pattern's structure
 * (branches in order, groups, quantifiers) and takes each atom's characters from grizzle-text's
 * Appendix F reader, so every class means what Appendix F says (`\s` the four XML white space
 * characters, `\d` every decimal digit, `\i` and `\c` XML's name characters, the block names); it
 * is written as a JavaScript expression, whose matching is F&O's: leftmost, first alternative,
 * greedy.
 *
 * @module
 */
import { regex } from "arkregex";
import { xsdPattern } from "@bjornpagen/grizzle-text/regex/xsd";
import { charsOf } from "#processing/alpha/text.ts";
import { isText, container } from "#processing/value.ts";
import type { Text, Value } from "#processing/value.ts";
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";

/**
 * The brand only {@link separatorOf} mints.
 */
const separatorBrand: unique symbol = Symbol("Separator");

/**
 * An admitted separator: a pattern of Appendix F that matches no empty string, as F&O reads it.
 */
export interface Separator {
  readonly [separatorBrand]: true;
  readonly expression: RegExp;
}

/**
 * A code point as an escape inside a JavaScript class.
 */
const escaped = (point: number): string => `\\u{${point.toString(16)}}`;

/**
 * An atom's characters as a JavaScript class, from grizzle-text's reading of the atom alone
 * (anchored at both ends, the set between); none where it reads as no set of characters.
 *
 * @param atom - The atom as written: a character, an escape, a class expression or `.`.
 * @returns The class, or none.
 */
const classOf = (atom: string): string | undefined => {
  const read = xsdPattern(atom);
  if (!read.ok) {
    return undefined;
  }

  const node = read.value;
  if (node.kind === "never") {
    return "[]";
  }

  const middle = node.kind === "seq" && node.items.length === 3 ? node.items[1] : undefined;
  if (middle?.kind !== "set") {
    return undefined;
  }

  return `[${middle.set.map(([lo, hi]) => (lo === hi ? escaped(lo) : `${escaped(lo)}-${escaped(hi)}`)).join("")}]`;
};

/**
 * How many characters the escape at `at` spans: a category or block escape to its `}`, any other
 * two.
 *
 * @param chars - The pattern's characters.
 * @param at - The place of its `\`.
 * @returns Its length.
 */
const escapeLength = (chars: readonly string[], at: number): number => {
  if (chars[at + 1] !== "p" && chars[at + 1] !== "P") {
    return 2;
  }

  const close = chars.indexOf("}", at);

  return close === -1 ? chars.length - at : close - at + 1;
};

/**
 * Where the class expression opening at `at` closes: after its `]`, nested subtractions and escapes
 * read through.
 *
 * @param chars - The pattern's characters.
 * @param at - The place of its `[`, from 0.
 * @returns The place after its `]`.
 */
const classEnd = (chars: readonly string[], at: number): number => {
  let depth = 0;
  let i = at;
  while (i < chars.length) {
    const c = chars[i];
    if (c === "\\") {
      i += chars[i + 1] === "p" || chars[i + 1] === "P" ? escapeLength(chars, i) : 2;
      continue;
    }

    if (c === "[") {
      depth += 1;
    } else if (c === "]") {
      depth -= 1;
      if (depth === 0) {
        return i + 1;
      }
    }

    i += 1;
  }

  return i;
};

/**
 * How many characters the atom at `at` spans: a class expression to its `]`, an escape, or one
 * character.
 *
 * @param chars - The pattern's characters.
 * @param at - The atom's place.
 * @returns Its length.
 */
const atomLength = (chars: readonly string[], at: number): number => {
  if (chars[at] === "[") {
    return classEnd(chars, at) - at;
  }

  return chars[at] === "\\" ? escapeLength(chars, at) : 1;
};

/**
 * The pattern written as a JavaScript expression, its structure kept: none where an atom reads as
 * no set.
 *
 * @param chars - The pattern's characters, admitted by Appendix F's grammar.
 * @returns The expression's source, or none.
 */
const sourceOf = (chars: readonly string[]): string | undefined => {
  let out = "";
  let i = 0;
  while (i < chars.length) {
    const c = chars[i] ?? "";
    if (c === "(") {
      out += "(?:";
      i += 1;
    } else if (c === ")" || c === "|" || c === "?" || c === "*" || c === "+") {
      out += c;
      i += 1;
    } else if (c === "{") {
      const close = chars.indexOf("}", i);
      out += chars.slice(i, close + 1).join("");
      i = close + 1;
    } else {
      const length = atomLength(chars, i);
      const set = classOf(chars.slice(i, i + length).join(""));
      if (set === undefined) {
        return undefined;
      }

      out += set;
      i += length;
    }
  }

  return out;
};

/**
 * A separator, read from its pattern: none where the pattern is outside Appendix F's grammar or
 * matches the empty string (F&O FORX0003), which publication refuses.
 *
 * @param pattern - The pattern as the content writes it.
 * @returns The separator, or none.
 */
export const separatorOf = (pattern: string): Separator | undefined => {
  if (!xsdPattern(pattern).ok) {
    return undefined;
  }

  const source = sourceOf(charsOf(pattern));
  const anchored = regex(`^(?:${source ?? ""})$`, "u");
  if (source === undefined || anchored.test("")) {
    return undefined;
  }

  return { expression: regex(`(?:${source})`, "gu"), [separatorBrand]: true };
};

/**
 * A text's pieces between its separators.
 *
 * @param text - The text.
 * @param separator - The separator.
 * @returns The pieces in order; none where any piece is empty.
 */
export const tokenize = (text: string, separator: Separator): readonly Text[] => {
  const pieces: string[] = [];
  let at = 0;
  for (const match of text.matchAll(separator.expression)) {
    pieces.push(text.slice(at, match.index));
    at = match.index + match[0].length;
  }
  pieces.push(text.slice(at));

  return pieces.every(isText) ? pieces : [];
};

/**
 * A separator literal: a string pattern that is a separator ({@link separatorOf}); none for NULL,
 * which separates nothing, or any other value.
 *
 * @param value - The literal as written.
 * @returns The separator, or none.
 */
const separatorLiteral = (value: Value): Separator | undefined =>
  value.kind === "single" && value.base === "string" ? separatorOf(value.value) : undefined;

/**
 * The `tokenize` operator's registry entry.
 */
export const tokenizeOperator = inlineOperator({
  apply: ([text, separator]) => container("ordered", "string", tokenize(text.value, separator)),
  definition: `${alphaDefinitionPrefix}tokenize`,
  operands: [
    { form: "expression", name: "text", type: { base: "string", cardinality: "single" } },
    {
      form: "literal",
      name: "separator",
      parse: (value: Value) => separatorLiteral(value),
      type: { base: "string", cardinality: "single" },
    },
  ],
  result: { base: "string", cardinality: "ordered" },
});
