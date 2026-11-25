/**
 * A word, as an essay's box counts one and a word minimum's `pattern-mask` holds one: the one
 * definition the count a page shows beside an essay, the importer's word minimum (metis's
 * C-EXT-WORDS writes its pattern from {@link wordPatternOf}) and the ledger's validate-responses
 * read alike, so a child who sees enough words is never refused for too few. It is AlphaTest's
 * (mastery-track-player 941a86a, ExtendedTextInteraction.tsx `getWordCount`): a word is a run of
 * anything but JavaScript's `\s`, which is exactly U+0009 to U+000D, the `Z` category and U+FEFF
 * (ECMA-262 WhiteSpace and LineTerminator); punctuation, hyphens and digits are characters of a
 * word like any other. A rich (`xhtml`) answer is counted on its text (`textOfXhtml`, which the
 * ledger matches an xhtml essay's `pattern-mask` against as `p3.xhtml_text`, reading
 * `xhtml-pattern-mask-text`), with U+200B to U+200D and U+FEFF read as nothing, as `getWordCount`
 * strips them from a rich answer before it splits, so a lone zero-width space there is no word; a
 * plain answer is counted as typed.
 *
 * @module
 */
import { regex } from "arkregex";

/**
 * How an answer's text is read: a plain answer as typed, a rich one with the zero-width characters
 * read as nothing.
 */
export type WordText = "plain" | "rich";

/**
 * JavaScript's `\s` but U+FEFF, as a class body XML Schema's expressions and JavaScript's (`u`)
 * read alike: XML Schema's own `\s` is only four characters, so the class spells the rest out.
 */
export const SPACE = String.raw`\t-\r\p{Z}`;

/**
 * The characters a rich answer's count reads as nothing, as a class body: U+200B to U+200D and
 * U+FEFF.
 */
export const INVISIBLE = "\u{200B}-\u{200D}\u{FEFF}";

/**
 * Every character a rich answer's count reads as nothing.
 */
const invisibles = regex.as(`[${INVISIBLE}]`, "gu");

/**
 * A run of JavaScript's white space, which parts one word from the next.
 */
const spaceRun = regex.as(`[${SPACE}\u{FEFF}]+`, "u");

/**
 * The words an answer's text holds, read as `read` says: its runs of anything but white space.
 *
 * @param text The answer's text: a plain answer's value, or a rich one's `textOfXhtml`.
 * @param read How the text is read.
 * @returns How many words it holds.
 */
export const wordsIn = (text: string, read: WordText): number =>
  (read === "rich" ? text.replaceAll(invisibles, "") : text)
    .split(spaceRun)
    .filter((part) => part !== "").length;

/**
 * A least number of words, at least 2, and how the answer's text is read.
 */
export type WordMinimum = Readonly<{ least: number; text: WordText }>;

/**
 * A word minimum's `pattern-mask` and the message a candidate who misses it reads.
 */
export type WordPattern = Readonly<{ pattern: string; message: string }>;

/**
 * A word minimum as an XML Schema regular expression, matched against the whole answer, written
 * only in the subset of XML Schema's expressions JavaScript reads alike under the `v` flag (a
 * group, the quantifiers `*`, `+` and `{n,}`, and classes of `\t`, `\r`, `\p{Z}` and characters
 * beyond ASCII): white space, a word, then at least `least - 1` more each after white space, then
 * white space. A plain answer's white space is JavaScript's `\s` and a word a run of anything else;
 * a rich answer's white space and words may each hold the invisible characters anywhere, and a word
 * starts with a visible one.
 *
 * @param minimum The least number of words and how the answer is read.
 * @returns The pattern and its message.
 */
export const wordPatternOf = (minimum: WordMinimum): WordPattern => {
  const more = `{${String(minimum.least - 1)},}`;
  const pattern =
    minimum.text === "plain"
      ? `[${SPACE}\u{FEFF}]*[^${SPACE}\u{FEFF}]+([${SPACE}\u{FEFF}]+[^${SPACE}\u{FEFF}]+)${more}[${SPACE}\u{FEFF}]*`
      : `[${SPACE}${INVISIBLE}]*[^${SPACE}${INVISIBLE}][^${SPACE}]*([${SPACE}][${SPACE}${INVISIBLE}]*[^${SPACE}${INVISIBLE}][^${SPACE}]*)${more}[${SPACE}${INVISIBLE}]*`;

  return { message: `Write at least ${String(minimum.least)} words.`, pattern };
};
