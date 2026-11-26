/**
 * The XPath F&O 3.1 operators against the specification's own examples (§5.4.10 fn:translate,
 * §5.4.4 fn:normalize-space, §5.6.6 fn:tokenize) and XML Schema 1.1's `xs:double` lexical space
 * (§3.3.5): the oracle is the text of the specifications, never the implementation.
 */
import { assert, describe, expect, it } from "@effect/vitest";
import { everyMember } from "#processing/test/exhausted.ts";
import { normalizeSpace } from "#processing/alpha/operators/normalize-space.ts";
import { readNumber } from "#processing/alpha/operators/read-number.ts";
import { separatorOf, tokenize } from "#processing/alpha/operators/tokenize.ts";
import { translate } from "#processing/alpha/operators/translate.ts";

describe("fn:normalize-space (F&O 3.1 §5.4.4)", () => {
  it("strips the edges and collapses each inner run, as the specification's example", () => {
    expect(
      normalizeSpace(
        " The    wealthy curled darlings\n\n                                         of    our    nation. ",
      ),
    ).toBe("The wealthy curled darlings of our nation.");
  });
  it("reads Unicode's White_Space, not XML's four characters alone", () => {
    expect(normalizeSpace("\u00A0a\u3000\u2028b\u0085")).toBe("a b");
  });
});

describe("fn:translate (F&O 3.1 §5.4.10)", () => {
  it("maps each code point by its first place, as the specification's examples", () => {
    expect(translate("bar", "abc", "ABC")).toBe("BAr");
    expect(translate("--aaa--", "abc-", "ABC")).toBe("AAA");
    expect(translate("abcdabc", "abc", "AB")).toBe("ABdAB");
  });
});

/**
 * A text's pieces between a pattern's separators, or none where the pattern is no separator.
 *
 * @param text - The text.
 * @param pattern - The pattern.
 * @returns The pieces, or none.
 */
const pieces = (text: string, pattern: string): readonly string[] | undefined => {
  const separator = separatorOf(pattern);

  return separator === undefined ? undefined : tokenize(text, separator);
};

describe("fn:tokenize (F&O 3.1 §5.6.6)", () => {
  it("splits at each leftmost separator, as the specification's examples", () => {
    expect(pieces("The cat sat on the mat", "\\s+")).toStrictEqual([
      "The",
      "cat",
      "sat",
      "on",
      "the",
      "mat",
    ]);
    expect(pieces("1, 15, 24, 50", ",\\s*")).toStrictEqual(["1", "15", "24", "50"]);
  });
  it("is NULL where a piece is empty, since an ordered container holds no NULL", () => {
    expect(pieces("1,15,,24,50,", ",")).toStrictEqual([]);
  });
  it("refuses a separator that matches the empty string (FORX0003) at admission", () => {
    expect(pieces("abba", ".?")).toBeUndefined();
  });
  it("chooses the first of two alternatives that match at a place, not the longest", () => {
    expect(pieces("abcd", "b|bc")).toStrictEqual(["a", "cd"]);
  });
  it("reads Appendix F's classes: \\s is XML's four white space characters, and ^ is a character", () => {
    expect(pieces("a\u00A0b c", "\\s")).toStrictEqual(["a\u00A0b", "c"]);
    expect(pieces("x^2", "^")).toStrictEqual(["x", "2"]);
  });
  it("refuses a pattern outside Appendix F's grammar", () => {
    expect(separatorOf("(")).toBeUndefined();
    expect(separatorOf("a{")).toBeUndefined();
  });
});

describe("read-number (XML Schema 1.1 §3.3.5 xs:double, finite lexicals)", () => {
  it("reads every finite lexical form, after XML white space collapse at the edges", () => {
    expect(readNumber(" 12 ")).toBe(12);
    expect(readNumber("1.5e3")).toBe(1500);
    expect(readNumber(".5")).toBe(0.5);
    expect(readNumber("5.")).toBe(5);
    expect(readNumber("+.5E-1")).toBe(0.05);
    expect(Object.is(readNumber("-0"), -0)).toBe(true);
  });
  it("takes the nearest double, an infinity past the greatest and a zero below the least", () => {
    expect(readNumber("0.1")).toBe(0.1);
    expect(readNumber("1e400")).toBe(Number.POSITIVE_INFINITY);
    expect(Object.is(readNumber("-1e-400"), -0)).toBe(true);
  });
  it.effect("refuses INF, NaN, inner white space and every form outside the lexical space", (ctx) =>
    everyMember(
      ctx,
      {
        box: "the special values, inner white space, other radixes, a lone point or exponent, and non-XML white space",
        members: ["INF", "-INF", "NaN", "1 2", "0x10", "", ".", "e5", "1e", "\u00A01"],
        oracle: "XML Schema 1.1 §3.3.5 (xs:double's lexical space), read-number's finite lexicals",
        suite: "processing/alpha/read-number-refused",
      },
      (text) => {
        assert.isUndefined(readNumber(text));
      },
    ),
  );
});
