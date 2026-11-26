/**
 * The text model Alpha's operators read: a text is its code points, as QTI's string is (XSD
 * `xs:string`, a sequence of characters) and as PostgreSQL's text was when these operators were
 * written in SQL. Every position, length and slice here counts code points, 1-based where it names
 * a place (PostgreSQL's `substr`, `strpos`, `regexp_instr`), so a child's emoji is one character
 * and the literal ports of `tex-normal` and `math-canonical` keep their places.
 *
 * Every regular expression an operator writes is a JavaScript one with the `u` flag (code points,
 * and `\p{..}` read by Node's Unicode 17.0 tables, grizzle-text's own) and the `s` flag (`.`
 * matches a line end, as PostgreSQL's does), and none uses `\s`, `\d`, `\w` or `i`: white space is
 * {@link whiteSpace}, written out.
 *
 * @module
 */
import { codePoints, compareCodePoints } from "@bjornpagen/grizzle-text/text";

/**
 * Unicode's White_Space property, written out as the body of a character class: the characters
 * QTI's normalize-space and every operator's white space read.
 */
export const whiteSpace =
  "\\t\\n\\v\\f\\r \\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";

/**
 * A text's characters, each one code point.
 *
 * @param text - The text.
 * @returns Its characters in order.
 */
export const charsOf = (text: string): readonly string[] =>
  codePoints(text).map((point) => String.fromCodePoint(point));

/**
 * How many characters a text holds.
 *
 * @param text - The text.
 * @returns Its length in code points.
 */
export const lengthOf = (text: string): number => codePoints(text).length;

/**
 * `count` characters of a text from place `from` (1 is the first), PostgreSQL's `substr(text, from,
 * count)`.
 *
 * @param text - The text.
 * @param from - The first place, from 1.
 * @param count - How many characters.
 * @returns The slice.
 */
export const slice = (text: string, from: number, count: number): string => {
  const chars = charsOf(text);
  const start = Math.max(from, 1) - 1;
  const end = Math.max(from + count, 1) - 1;

  return chars.slice(start, Math.max(start, end)).join("");
};

/**
 * The characters of a text from place `from` (1 is the first) to its end, PostgreSQL's
 * `substr(text, from)`.
 *
 * @param text - The text.
 * @param start - The first place, from 1.
 * @returns The rest.
 */
export const suffix = (text: string, start: number): string =>
  charsOf(text)
    .slice(Math.max(start, 1) - 1)
    .join("");

/**
 * A text's first `n` characters, or all but its last `-n` where `n` is negative.
 *
 * @param text - The text.
 * @param n - The count.
 * @returns The head.
 */
export const head = (text: string, n: number): string => {
  if (n < 0) {
    const chars = charsOf(text);

    return chars.slice(0, Math.max(chars.length + n, 0)).join("");
  }

  let out = "";
  let taken = 0;
  for (let i = 0; i < text.length && taken < n; taken += 1) {
    const point = text.codePointAt(i) ?? 0;
    const char = String.fromCodePoint(point);
    out += char;
    i += char.length;
  }

  return out;
};

/**
 * A text's last `n` characters.
 *
 * @param text - The text.
 * @param n - The count, not negative.
 * @returns The tail.
 */
export const tail = (text: string, n: number): string => {
  const chars = charsOf(text);

  return chars.slice(Math.max(chars.length - n, 0)).join("");
};

/**
 * A list of words by their first character, each list in the given order: the one index a typo
 * search reads, since every typo score keeps a word's first letter.
 *
 * @param words - The words, in order.
 * @returns Each first character's words.
 */
export const byFirstCharacter = (
  words: readonly string[],
): ReadonlyMap<string, readonly string[]> => {
  const index = new Map<string, string[]>();
  for (const word of words) {
    const first = head(word, 1);
    const list = index.get(first);
    if (list === undefined) {
      index.set(first, [word]);
    } else {
      list.push(word);
    }
  }

  return index;
};

/**
 * The place of a text's first occurrence of another, from 1, or 0 for none.
 *
 * @param text - The text searched.
 * @param sought - The text sought.
 * @returns Its place.
 */
export const placeOf = (text: string, sought: string): number => {
  const at = text.indexOf(sought);

  return at === -1 ? 0 : lengthOf(text.slice(0, at)) + 1;
};

/**
 * The place, from 1, of the `nth` match of a global pattern in a text, the matches read left to
 * right without overlap, or 0 where there are fewer.
 *
 * @param text - The text.
 * @param pattern - The pattern, with the `g` flag.
 * @param nth - Which match, from 1.
 * @returns Its place.
 */
export const matchPlace = (text: string, pattern: RegExp, nth: number): number => {
  let seen = 0;
  for (const match of text.matchAll(pattern)) {
    seen += 1;
    if (seen === nth) {
      return lengthOf(text.slice(0, match.index)) + 1;
    }
  }

  return 0;
};

/**
 * QTI's case fold, the one `qti-string-match` reads with `case-sensitive="false"`: each character's
 * full uppercase, then the text's full lowercase, Unicode's default case conversion
 * (SpecialCasing's unconditional mappings and Final_Sigma), as plate folds.
 *
 * @param text - The text.
 * @returns The folded text.
 */
export const folded = (text: string): string => text.toUpperCase().toLowerCase();

/**
 * Two texts compared by their code points, the order every sorted print of the operators is in.
 *
 * @param a - One text.
 * @param b - The other.
 * @returns Their order.
 */
export const byCodePoints = (a: string, b: string): number => compareCodePoints(a, b);
