/**
 * A `pattern-mask` or a `pattern-match` pattern, an XML Schema 1.0 regular expression, read and
 * matched by grizzle's one regex engine through crust (`@qti-pie/crust/regex.ts`, DECISIONS 56).
 * The information model makes Appendix F the language: "The syntax for the regular expression
 * language is as defined in Appendix F of [XSCHEMA, 01]" (§5.104.1, PatternMatch), and of a
 * `pattern-mask` "The regular expression language used is defined in Appendix F of [XSCHEMA, 01]"
 * (§5.48.4, §5.162.5).
 *
 * `xsdPattern` reads a pattern by Appendix F's grammar into the IR anchored at both ends, as XML
 * Schema anchors every expression and reads `^` and `$` as ordinary characters, with XML Schema's
 * own escapes (`\s` the four XML whitespace characters, `\d` every decimal digit, `\i` and `\c`
 * XML 1.0 Second Edition's name characters) and XML Schema 1.0's own block table. Appendix F sets
 * no bound on a quantifier's count, and neither does the reader. Anything outside the grammar is
 * refused, never approximated.
 *
 * A pattern is author content and the value it checks is the candidate's, so matching must not let
 * either stall its host. Grizzle's automaton counts a repetition with a counter, never a copy of
 * the repeated piece, so `[0-9]{0,300}` or `((a{255}){255}){255}` holds a handful of states; its
 * `Matcher` runs over a text once, its work linear in the text, no backtracking ever entering it.
 * So every pattern in Appendix F's language compiles, and each value matches it or does not: plate
 * keeps no bound of its own, and none of grizzle's refuses a pattern here.
 *
 * @module
 * @see https://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#regexs
 */
import { Option } from "effect";
import { buildNfa, Matcher, xsdPattern } from "@qti-pie/crust/regex.ts";

/**
 * A compiled pattern: grizzle's matcher of its automaton.
 */
export type { Matcher } from "@qti-pie/crust/regex.ts";

/**
 * Compile an XML Schema regular expression into its matcher.
 *
 * @param pattern The pattern as the item writes it.
 * @returns Its matcher, or none for a text outside Appendix F's grammar, which is no regular
 *   expression of QTI's at all.
 */
export const compile = (pattern: string): Option.Option<Matcher> => {
  const read = xsdPattern(pattern);

  return read.ok ? Option.some(Matcher.of(buildNfa(read.value))) : Option.none();
};

/**
 * Whether a whole value matches a compiled pattern.
 *
 * @param matcher The compiled pattern.
 * @param value The value.
 * @returns Whether the pattern holds the value whole.
 */
export const matches = (matcher: Matcher, value: string): boolean => matcher.matches(value);
