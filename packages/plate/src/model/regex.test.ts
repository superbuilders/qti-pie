import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { compile, matches } from "#plate/model/regex.ts";

/**
 * Assert that a pattern compiles, takes one text and refuses another.
 *
 * @param pattern The XSD pattern.
 * @param match A text it takes.
 * @param nonMatch A text it refuses.
 */
const holds = (pattern: string, match: string, nonMatch: string): void => {
  const matcher = compile(pattern);

  assert.isTrue(Option.isSome(matcher), `${JSON.stringify(pattern)} was refused`);
  for (const [text, expected] of [
    [match, true],
    [nonMatch, false],
  ] as const) {
    assert.strictEqual(
      Option.exists(matcher, (compiled) => matches(compiled, text)),
      expected,
      `${JSON.stringify(pattern)} against ${JSON.stringify(text)}`,
    );
  }
};

describe("compile and matches, against Appendix F", () => {
  it("reads the corpus's three patterns", () => {
    holds("([0-9.]{0,6})", "12.5", "1234567");
    // `\\` is an escaped backslash and the `-` before `]` is a literal dash.
    holds(String.raw`([0-9.\\-]{0,10})`, "-3.5", "3.5e1");
    holds(String.raw`([0-9.\\-]{0,10})`, "\\", "a");
    holds(String.raw`[0-9\.]+`, "3.14", "");
  });

  it("anchors the whole pattern, and reads ^ and $ as ordinary characters", () => {
    holds("abc", "abc", "xabcx");
    holds("^a$", "^a$", "a");
  });
});

/**
 * The atoms of the oracle's box, each read alike by Appendix F and by ECMAScript under `u`: a
 * letter, classes, a negated class, the wildcard, the digit escape and two groups. On the box's
 * texts the two readings agree: `.` is every character but LF and CR in both on an alphabet with
 * no U+2028 or U+2029, and `\d` is Unicode's decimal digits in XML Schema and ASCII's in
 * ECMAScript, which agree on the one digit the texts hold.
 */
const boxAtoms = ["a", "b", "[ab]", ".", "[^a]", String.raw`\d`, "(a|b)", "(ab)"] as const;

/**
 * The quantifiers of the oracle's box, counted ones among them.
 */
const boxQuantifiers = ["", "?", "*", "+", "{2}", "{0,2}", "{1,}", "{3,3}"] as const;

/**
 * The pieces of the box: every atom under every quantifier.
 */
const boxPieces = boxAtoms.flatMap((atom) =>
  boxQuantifiers.map((quantifier) => `${atom}${quantifier}`),
);

/**
 * Every text of up to three characters over a letter of each class, a digit and a line feed.
 */
const boxTexts = (() => {
  const alphabet = ["a", "b", "1", "\n"] as const;
  const texts: string[] = [""];
  let layer: readonly string[] = [""];
  for (let length = 1; length <= 3; length += 1) {
    layer = layer.flatMap((text) => alphabet.map((character) => `${text}${character}`));
    texts.push(...layer);
  }

  return texts;
})();

describe("compile and matches, true or false for every pattern in Appendix F's language", () => {
  it("agree with ECMAScript's RegExp on every pattern of the box and every text of up to three characters, a second implementation", () => {
    // Oracle: a second implementation, V8's RegExp under `u`, anchored as XML Schema anchors every
    // expression, over the constructs the two grammars read alike. Bound: every piece, every
    // concatenation and every alternation of two pieces (8,256 patterns), against 85 texts.
    const patterns = [
      ...boxPieces,
      ...boxPieces.flatMap((first) => boxPieces.map((second) => `${first}${second}`)),
      ...boxPieces.flatMap((first) => boxPieces.map((second) => `${first}|${second}`)),
    ];
    for (const pattern of patterns) {
      const matcher = compile(pattern);
      const oracle = new RegExp(`^(?:${pattern})$`, "u");
      assert.isTrue(Option.isSome(matcher), `${JSON.stringify(pattern)} was refused`);
      for (const text of boxTexts) {
        assert.strictEqual(
          Option.exists(matcher, (compiled) => matches(compiled, text)),
          oracle.test(text),
          `${JSON.stringify(pattern)} against ${JSON.stringify(text)}`,
        );
      }
    }
  });

  it("match counted repetitions past every former bound, with no state cap and no bound on a count (SV-PATTERN-01)", () => {
    // Oracle: the specification, each case's value stated from its counts, since V8's backtracking
    // RegExp overflows its stack on the long texts. The patterns plate's 128 states, its count of
    // 127, grizzle's 255 or its copies of each repeated piece once refused or could not hold:
    // every one is a pattern of Appendix F, which bounds no count (information model §5.104.1:
    // "The syntax for the regular expression language is as defined in Appendix F of
    // [XSCHEMA, 01]").
    const cases: readonly (readonly [pattern: string, text: string, matched: boolean])[] = [
      ["[A-Za-z ]{1,100}", "abc", true],
      ["[A-Za-z ]{1,100}", "a".repeat(100), true],
      ["[A-Za-z ]{1,100}", "a".repeat(101), false],
      ["[A-Za-z ]{1,100}", "", false],
      ["[0-9]{0,64}", "", true],
      ["[0-9]{0,64}", "1".repeat(64), true],
      ["[0-9]{0,64}", "1".repeat(65), false],
      ["[0-9]{128}", "1".repeat(128), true],
      ["[0-9]{128}", "1".repeat(127), false],
      ["a{2,200}", "aa", true],
      ["a{2,200}", "a", false],
      ["a{2,200}", "a".repeat(200), true],
      ["a{2,200}", "a".repeat(201), false],
      ["(abc|def){50}", "abcdef".repeat(25), true],
      ["(abc|def){50}", "abc".repeat(49), false],
      ["[0-9]{0,255}", "1".repeat(255), true],
      ["a{256}", "a".repeat(256), true],
      ["a{256}", "a".repeat(255), false],
      ["[0-9]{0,300}", "1".repeat(300), true],
      ["[0-9]{0,300}", "1".repeat(301), false],
      ["(a{255}){255}", "a".repeat(255 * 255), true],
      ["(a{255}){255}", "a".repeat(255 * 255 - 1), false],
      ["((a{50}){50}){50}", "a".repeat(50 * 50 * 50), true],
      ["((a{50}){50}){50}", "a".repeat(50 * 50 * 50 + 1), false],
      ["((a{255}){255}){255}", "a".repeat(10), false],
      ["((a{255}){255}){20}", "a".repeat(10), false],
      ["(a?){1000000000}", "a".repeat(1000), true],
    ];
    for (const [pattern, text, matched] of cases) {
      const matcher = compile(pattern);
      assert.isTrue(Option.isSome(matcher), `${pattern} was refused`);
      assert.strictEqual(
        Option.exists(matcher, (compiled) => matches(compiled, text)),
        matched,
        `${pattern} against ${String(text.length)} code points`,
      );
    }
  });

  it("refuses only a text outside Appendix F's grammar, which is no regular expression", () => {
    for (const written of ["(?i)yes", "[a-z", "a{", "a{2,1}", "*a"]) {
      assert.isTrue(Option.isNone(compile(written)), JSON.stringify(written));
    }
  });
});
