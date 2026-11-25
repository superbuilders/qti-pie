/**
 * The character classes of `machine/xsd.sql`, each grizzle-text's, the one regex engine's: its XSD
 * reader's set (`xsdPattern`) for the escapes `\s`, `\i`, `\c`, `\d` and `\w` and the wildcard, the
 * General_Category values Appendix F names at the Unicode grizzle-text's generated table pins, and
 * the names of XML Schema 1.0's block table. The alphabet is XML's Char (`xmlChar`): a complement,
 * a negative group and the wildcard range over XML's characters alone, and a character outside them
 * is in no class. The SQL writes each negated form as the complement of the positive set within the
 * alphabet (`u - set`), so no class is taken unless grizzle-text's own negated form is that
 * complement and the positive set lies within XML's Char, and no letter after a backslash is an
 * escape grizzle-text reads but the SQL does not know.
 */
import { regex } from "arkregex";
import { complement, intersection } from "@bjornpagen/grizzle-text/regex/charset";
import type { CharSet } from "@bjornpagen/grizzle-text/regex/charset";
import type { RegexNode } from "@bjornpagen/grizzle-text/regex/ir";
import { xmlChar, xmlSchemaBlocks } from "@bjornpagen/grizzle-text/regex/xml";
import { xsdCategoryNames, xsdPattern } from "@bjornpagen/grizzle-text/regex/xsd";

/**
 * The classes the SQL is written from.
 */
export interface XsdClasses {
  /**
   * XML's Char, the alphabet: xsd_compile's `u`.
   */
  readonly alphabet: CharSet;
  /**
   * Each multi-character escape by its lower-case letter, then the wildcard (`.`): xsd_escape_set.
   */
  readonly escapes: ReadonlyMap<string, CharSet>;
  /**
   * Each category by its name, then each block by `Is` and its name: xsd_property_set.
   */
  readonly properties: ReadonlyMap<string, CharSet>;
  /**
   * How many categories and blocks the properties hold.
   */
  readonly categories: number;
  readonly blocks: number;
}

/**
 * The multi-character escapes Appendix F defines, by their lower-case letter (F.1.1, [37a]).
 */
const escapeLetters = ["s", "i", "c", "d", "w"] as const;

/**
 * Every letter the SQL reads after a backslash: the multi-character escapes and their
 * complements, the single-character escapes `\n`, `\r` and `\t`, and the property escapes.
 */
const knownLetters = "sSiIcCdDwWnrtpP";

/**
 * Whether two sets hold the same code points: a set's intervals are canonical, so equal sets have
 * equal lists.
 *
 * @param a A set.
 * @param b Another.
 * @returns Whether they are equal.
 */
const same = (a: CharSet, b: CharSet): boolean =>
  a.length === b.length && a.every(([lo, hi], k) => b[k]?.[0] === lo && b[k]?.[1] === hi);

/**
 * The one set grizzle-text's XSD reader reads a lone class into.
 *
 * @param pattern The class: an escape, the wildcard or a property.
 * @returns Its set.
 */
const classOf = (pattern: string): CharSet => {
  const read = xsdPattern(pattern);
  if (!read.ok) {
    throw new Error(`grizzle-text refuses ${pattern}: ${read.error.message}`);
  }

  const sets: CharSet[] = [];
  const pending: RegexNode[] = [read.value];
  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    if (node.kind === "set") {
      sets.push(node.set);
    } else if (node.kind === "seq") {
      pending.push(...node.items);
    } else if (node.kind === "alt") {
      pending.push(...node.arms);
    } else if (node.kind === "repeat") {
      pending.push(node.body);
    }
  }

  const [only, ...more] = sets;
  if (only === undefined || more.length > 0) {
    throw new Error(`grizzle-text reads ${pattern} into ${String(sets.length)} sets, not one`);
  }

  return only;
};

/**
 * A class's set, held within XML's Char, and its negated form, if it has one, held to the
 * complement of the set within XML's Char, as the SQL writes it.
 *
 * @param pattern The class.
 * @param negated Its negated form.
 * @returns The class's set.
 */
const derived = (pattern: string, negated?: string): CharSet => {
  const set = classOf(pattern);
  if (!same(intersection(xmlChar, set), set)) {
    throw new Error(`grizzle-text's ${pattern} holds a character outside XML's Char, the alphabet`);
  }

  if (negated !== undefined && !same(classOf(negated), intersection(xmlChar, complement(set)))) {
    throw new Error(
      `grizzle-text's ${negated} is not the complement of ${pattern} within XML's Char, as the SQL writes it`,
    );
  }

  return set;
};

/**
 * Two property names in the order the SQL lists them: shorter first (each category's head before
 * its values), then by code point.
 *
 * @param a A name.
 * @param b Another.
 * @returns Their order.
 */
const byLengthThenCodePoint = (a: string, b: string): number => {
  if (a.length !== b.length) {
    return a.length - b.length;
  }

  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
};

/**
 * The classes, each held to the SQL's reading of it.
 *
 * @returns The classes.
 */
export const xsdClasses = (): XsdClasses => {
  const escapes = new Map<string, CharSet>(
    escapeLetters.map((letter) => [letter, derived(`\\${letter}`, `\\${letter.toUpperCase()}`)]),
  );
  escapes.set(".", derived("."));
  for (let point = 0x41; point <= 0x7a; point += 1) {
    const letter = String.fromCodePoint(point);
    if (
      regex("^[A-Za-z]$", "u").test(letter) &&
      !knownLetters.includes(letter) &&
      xsdPattern(`\\${letter}`).ok
    ) {
      throw new Error(`grizzle-text reads \\${letter}, which the SQL knows no escape for`);
    }
  }

  const categories = [...xsdCategoryNames].toSorted(byLengthThenCodePoint);
  const blocks = [...xmlSchemaBlocks.keys()];
  const properties = new Map<string, CharSet>([
    ...categories.map((name): [string, CharSet] => [name, derived(`\\p{${name}}`, `\\P{${name}}`)]),
    ...blocks.map((name): [string, CharSet] => [
      `Is${name}`,
      derived(`\\p{Is${name}}`, `\\P{Is${name}}`),
    ]),
  ]);

  return {
    alphabet: xmlChar,
    blocks: blocks.length,
    categories: categories.length,
    escapes,
    properties,
  };
};
