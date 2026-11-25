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
    /**
     * The corpus's signed decimal: `\\` is an escaped backslash and the `-` before `]` is a literal
     * dash.
     */
    const signed = String.raw`([0-9.\\-]{0,10})`;

    holds("([0-9.]{0,6})", "12.5", "1234567");
    holds(signed, "-3.5", "3.5e1");
    holds(signed, "\\", "a");
    holds(String.raw`[0-9\.]+`, "3.14", "");
  });

  it("anchors the whole pattern, and reads ^ and $ as ordinary characters", () => {
    holds("abc", "abc", "xabcx");
    holds("^a$", "^a$", "a");
  });
});
