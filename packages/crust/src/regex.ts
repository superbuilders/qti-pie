/**
 * Grizzle's one regex engine as plate reads it (DECISIONS 56): XML Schema 1.0's regular expressions
 * read into the IR of every dialect (`xsdPattern`), the automaton of a node's language, a counted
 * repetition its counter (`buildNfa`), and its matcher, linear in the text (`Matcher`); and the
 * IR's own constructors and folds, which plate writes a language over the IR with rather than as a
 * pattern's text (`seq`, `set`, `RegexBuilder`, `folded`, `runsOf`, `literal`). crust re-exports
 * them from
 * `@bjornpagen/grizzle-text`, dependency-free and browser-safe, so a page loads them as it loads
 * crust, and plate reads no grizzle package of its own.
 *
 * @module
 */
export {
  RegexBuilder,
  empty,
  end,
  folded,
  never,
  seq,
  set,
  start,
} from "@bjornpagen/grizzle-text/regex/ir";

export type { LiveNode, RegexNode } from "@bjornpagen/grizzle-text/regex/ir";

export { Matcher } from "@bjornpagen/grizzle-text/regex/match";

export { buildNfa } from "@bjornpagen/grizzle-text/regex/nfa";

export { literal, runsOf } from "@bjornpagen/grizzle-text/regex/words";

export { xsdPattern } from "@bjornpagen/grizzle-text/regex/xsd";
