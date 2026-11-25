/**
 * An `xhtml` Extended Text's conventions (`#plate/interactions/xhtml-text.ts`): every text a child
 * can type is written as well-formed XHTML, `p` elements of text and `br`s alone, and read back as
 * the very text typed, over every text of up to five characters from an alphabet of the characters
 * the conventions read (a line feed, which parts lines and paragraphs, a carriage return, a tab, a
 * space, the three characters XML escapes, and a letter), and over texts holding characters XML 1.0
 * cannot hold, which writing leaves out. A value another editor wrote reads as its text.
 */
import { assert, describe, it } from "@effect/vitest";
import { textOfXhtml } from "#plate/interactions/xhtml-text.ts";

describe("xhtmlOfText and textOfXhtml", () => {
  it("read another editor's blocks as lines, so words in separate blocks are separate words", () => {
    assert.strictEqual(textOfXhtml("<h1>Title</h1><p>Body</p>"), "Title\nBody");
    assert.strictEqual(textOfXhtml("<ul><li>one</li><li>two</li></ul>"), "one\ntwo");
    assert.strictEqual(textOfXhtml("<p>a</p><ul><li>b</li></ul>"), "a\nb");
    assert.strictEqual(textOfXhtml("<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>"), "a\nb\nc");
    assert.strictEqual(textOfXhtml("<p>a</p><p></p><p>b</p>"), "a\n\n\n\nb");
    assert.strictEqual(textOfXhtml("<p> </p><h2>x</h2>"), " \nx");
    assert.strictEqual(textOfXhtml("<p>a</p>\n<p>b</p>"), "a\n\nb");
    assert.strictEqual(textOfXhtml("<p><strong>wo</strong>rd</p>"), "word");
  });
});
