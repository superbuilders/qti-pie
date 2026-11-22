/**
 * The bounds of `#pantry/qti/limits.ts` against grizzle's own: a text a query matches by a pattern
 * bounded by the regex engine alone (`regexTextMaxBytes`), and a foreign element's names, which a
 * query matches as one expanded name, at half of it.
 */
import { regexTextMaxBytes } from "@bjornpagen/grizzle";
import { assert, describe, it } from "@effect/vitest";
import { foreignNameBytes, matchedTextBytes, utf8Length } from "#pantry/qti/limits.ts";

describe("qti/limits.ts", () => {
  it("states each bound as the UTF-8 bytes grizzle's regex engine reads, a foreign element's names half of them beside the brace", () => {
    // Oracle: grizzle's own rule (`regexTextMaxBytes`, public/text.ts of the vendored engine) and
    // the expanded name's form, `namespace}local`.
    assert.strictEqual(matchedTextBytes, regexTextMaxBytes);
    assert.isAtMost(foreignNameBytes + 1 + foreignNameBytes, matchedTextBytes);
    assert.isAbove(foreignNameBytes + 1 + foreignNameBytes + 2, matchedTextBytes);
    // A migration guard, not an oracle: the bound is a column's width in every installation, so a
    // change of grizzle's `regexTextMaxBytes` that moves it must be seen and migrated.
    assert.strictEqual(foreignNameBytes, 134_217_726);
  });

  it("counts a text's bytes as UTF-8 does: one to four bytes a code point", () => {
    // Oracle: the specification as a checker, RFC 3629 §3's table of byte sequences.
    // Bound: the first and last code point of each of the four lengths.
    for (const [text, bytes] of [
      ["\u{0}", 1],
      ["\u{7F}", 1],
      ["\u{80}", 2],
      ["\u{7FF}", 2],
      ["\u{800}", 3],
      ["\u{FFFF}", 3],
      ["\u{10000}", 4],
      ["\u{10FFFF}", 4],
    ] as const) {
      assert.strictEqual(utf8Length(text), bytes, text);
    }
  });
});
