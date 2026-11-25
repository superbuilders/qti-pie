/**
 * HTML's ASCII whitespace, tab, line feed, form feed, carriage return and space: the one
 * definition the shell splits a token list and collapses a name by. It is not XML's white space
 * (`trimXmlSpace` in `#plate/model/values.ts`), which holds no form feed: an author's value is
 * XML, a page's tokens and names are HTML's.
 *
 * @module
 * @see https://infra.spec.whatwg.org/#ascii-whitespace
 */
import { regex } from "arkregex";

/**
 * A run of ASCII whitespace.
 */
const asciiWhitespace = regex("[\t\n\f\r ]+", "gu");

/**
 * Split a value into its tokens, as HTML splits a set of space-separated tokens: an IDREFS value
 * or a `match-group`.
 *
 * @param value The value as written.
 * @returns Its tokens, in order, none empty.
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#space-separated-tokens
 */
export const asciiTokens = (value: string): readonly string[] =>
  value.split(asciiWhitespace).filter((token) => token !== "");

/**
 * Strip and collapse a text's ASCII whitespace, as a name is read: each run one space, none at
 * either end.
 *
 * @param text The text.
 * @returns The collapsed text, empty when it held only whitespace.
 * @see https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
 */
export const collapsedText = (text: string): string =>
  text.replaceAll(asciiWhitespace, " ").replaceAll(regex("^ | $", "gu"), "");
