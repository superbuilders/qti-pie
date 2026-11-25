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
 * A language is also written over the IR, never as a pattern's text, or read from a pattern whole
 * ({@link languageOf}); its prefixes ({@link prefixesOf}), each matched alone and in linear time,
 * are what a box whose every text must be on the way to an answer may hold.
 *
 * @module
 * @see https://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#regexs
 */
import { Data, Option } from "effect";
import {
  buildNfa,
  empty,
  end,
  folded,
  Matcher,
  never as noText,
  RegexBuilder,
  seq,
  start,
  xsdPattern,
} from "@qti-pie/crust/regex.ts";
import type { RegexNode } from "@qti-pie/crust/regex.ts";

/**
 * A compiled pattern: grizzle's matcher of its automaton.
 */
export type { Matcher } from "@qti-pie/crust/regex.ts";

/**
 * A language plate writes over the IR, of whole texts: a node that tests no assertion.
 */
export type { RegexNode as Language } from "@qti-pie/crust/regex.ts";

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

/**
 * A language of whole texts that tests an assertion, which no language plate writes does and no
 * pattern's language does once its anchors are off: a defect in plate.
 */
class AssertionInLanguage extends Data.TaggedError("AssertionInLanguage")<{
  readonly where: string;
}> {
  /**
   * The broken contract, and what to do with it.
   */
  override get message(): string {
    return `A language of whole texts tests an assertion (${this.where}), which neither plate's own languages nor an XML Schema pattern without its anchors can. This is a defect in plate's model/regex.ts; report it with the item that caused it.`;
  }
}

/**
 * Give a pattern's language of whole texts: what `xsdPattern` reads between the two anchors it
 * writes, `seq([start, pattern, end])`, which its sequence flattens.
 *
 * @param anchored The IR `xsdPattern` read.
 * @returns The language, never where the pattern matches nothing.
 */
const unanchored = (anchored: RegexNode): RegexNode => {
  if (anchored.kind === "never") {
    return noText;
  }

  if (
    anchored.kind !== "seq" ||
    anchored.items[0]?.kind !== "start" ||
    anchored.items.at(-1)?.kind !== "end"
  ) {
    throw new AssertionInLanguage({ where: "a pattern xsdPattern read without its two anchors" });
  }

  return seq(anchored.items.slice(1, -1));
};

/**
 * Give a pattern's language of whole texts, the texts it matches: what `xsdPattern` reads, its two
 * anchors off, as the IR holds it, with no automaton built.
 *
 * @param pattern The pattern as the item writes it.
 * @returns The language, or none for a text outside Appendix F's grammar, which checks nothing
 *   (`compile`).
 */
export const languageOf = (pattern: string): Option.Option<RegexNode> => {
  const read = xsdPattern(pattern);

  return read.ok ? Option.some(unanchored(read.value)) : Option.none();
};

/**
 * Give the prefixes of a language's texts: every text some text of the language begins with, the
 * empty text among them where the language holds any text, and none where it holds none.
 *
 * Every live node of the IR holds a text and so does each of its children (grizzle's `LiveNode`),
 * so a node's prefixes follow from its shape alone: a set's, the empty text or one of its code
 * points; a sequence's, a prefix of its first item, or the whole first item followed by a prefix of
 * the rest; an alternation's, any arm's; and a repetition's, fewer whole bodies than its most,
 * followed by a prefix of one more, its least count reached by the texts that follow. A repetition
 * stays a counted one, so the prefixes of `[1-9][0-9]{0,4}` are a handful of nodes too. The walk
 * is grizzle's fold, children first, on the heap, so a language of any depth is read without
 * recursing.
 *
 * @param language The language, of whole texts.
 * @returns Its prefixes.
 */
export const prefixesOf = (language: RegexNode): RegexNode => {
  const builder = new RegexBuilder();

  return folded(new Map<RegexNode, RegexNode>(), language, (node, of): RegexNode => {
    switch (node.kind) {
      case "never":
      case "empty": {
        return node;
      }
      case "set": {
        return builder.alt([empty, node]);
      }
      case "seq": {
        const last = node.items.at(-1);

        if (last === undefined) {
          return empty;
        }

        let prefixes = of(last);

        for (const item of node.items.slice(0, -1).toReversed()) {
          prefixes = builder.alt([of(item), seq([item, prefixes])]);
        }

        return prefixes;
      }
      case "alt": {
        return builder.alt(node.arms.map(of));
      }
      case "repeat": {
        return seq([
          builder.repeat(node.body, 0, node.max === "unbounded" ? node.max : node.max - 1),
          of(node.body),
        ]);
      }
      case "start":
      case "end": {
        throw new AssertionInLanguage({ where: `a ${node.kind} anchor` });
      }
      default: {
        return node satisfies never;
      }
    }
  });
};

/**
 * Compile a language of whole texts into its matcher: anchored at both ends, as a pattern's is, so
 * a text matches only whole.
 *
 * @param language The language.
 * @returns Its matcher.
 */
export const compileLanguage = (language: RegexNode): Matcher =>
  Matcher.of(buildNfa(seq([start, language, end])));
