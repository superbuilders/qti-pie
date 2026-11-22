/**
 * Grizzle's one regex engine as plate reads it (DECISIONS 56): XML Schema 1.0's regular expressions
 * read into the IR of every dialect (`xsdPattern`), the automaton of a node's language, a counted
 * repetition its counter (`buildNfa`), and its matcher, linear in the text (`Matcher`). crust
 * re-exports them from `@bjornpagen/grizzle-text`, dependency-free and browser-safe, so a page
 * loads them as it loads crust, and plate reads no grizzle package of its own.
 *
 * @module
 */
export { Matcher } from "@bjornpagen/grizzle-text/regex/match";

export { buildNfa } from "@bjornpagen/grizzle-text/regex/nfa";

export { xsdPattern } from "@bjornpagen/grizzle-text/regex/xsd";
