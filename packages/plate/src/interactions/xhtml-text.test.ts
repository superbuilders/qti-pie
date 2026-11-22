/**
 * An `xhtml` Extended Text's conventions (`#plate/interactions/xhtml-text.ts`): every text a child
 * can type is written as well-formed XHTML, `p` elements of text and `br`s alone, and read back as
 * the very text typed, over every text of up to five characters from an alphabet of the characters
 * the conventions read (a line feed, which parts lines and paragraphs, a carriage return, a tab, a
 * space, the three characters XML escapes, and a letter), and over texts holding characters XML 1.0
 * cannot hold, which writing leaves out. A value another editor wrote reads as its text.
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import { textOfXhtml, xhtmlOfText } from "#plate/interactions/xhtml-text.ts";

/**
 * The characters the conventions read, beside a letter that stands for any other text.
 */
const alphabet = ["\n", "\r", "\t", " ", "&", "<", ">", "a"] as const;

/**
 * Every text of exactly `length` characters of {@link alphabet}.
 *
 * @param length The length.
 * @returns The texts.
 */
const textsOf = (length: number): readonly string[] =>
  length === 0
    ? [""]
    : textsOf(length - 1).flatMap((prefix) => alphabet.map((character) => prefix + character));

/**
 * Every text of one to five characters of {@link alphabet}: 37,448 texts.
 */
const texts = [1, 2, 3, 4, 5].flatMap(textsOf);

/**
 * A written value as an XHTML document: the fragment in an XHTML `div`.
 *
 * @param xhtml The value.
 * @returns The document's bytes.
 */
const documentOf = (xhtml: string): Uint8Array =>
  new TextEncoder().encode(`<div xmlns="http://www.w3.org/1999/xhtml">${xhtml}</div>`);

describe("xhtmlOfText and textOfXhtml", () => {
  it("read back every short text exactly as it was typed", () => {
    for (const text of texts) {
      assert.strictEqual(textOfXhtml(xhtmlOfText(text)), text, JSON.stringify(text));
    }
  });

  it("write every short text as p elements holding text and br elements alone", () => {
    for (const text of texts) {
      assert.match(
        xhtmlOfText(text),
        /^(?:<p>(?:[^<&]|&(?:amp|lt|gt|#13);|<br\/>)*<\/p>)+$/u,
        JSON.stringify(text),
      );
    }
  });

  it.effect("write well-formed XHTML for every text of up to three characters", () =>
    Effect.forEach(
      [1, 2, 3].flatMap(textsOf),
      (text) => Effect.asVoid(readXml(documentOf(xhtmlOfText(text)))),
      { discard: true },
    ),
  );

  it("part paragraphs at a blank line and lines at a line feed", () => {
    assert.strictEqual(
      xhtmlOfText("One day\nI saw a fox.\n\nIt ran <away> & hid."),
      "<p>One day<br/>I saw a fox.</p><p>It ran &lt;away&gt; &amp; hid.</p>",
    );
  });

  it("leave out what XML 1.0 cannot hold, and keep the rest of the text", () => {
    assert.strictEqual(xhtmlOfText("a\u0001b\u0008c\uFFFEd"), "<p>abcd</p>");
    assert.strictEqual(textOfXhtml(xhtmlOfText("a\u0001b")), "ab");
    assert.strictEqual(textOfXhtml(xhtmlOfText("😀 \u{10FFFF}")), "😀 \u{10FFFF}");
  });

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

  it("read another editor's HTML as its text", () => {
    assert.strictEqual(
      textOfXhtml(
        '<p class="ql-align-center">Dear <strong>Sam</strong>,</p><p>I&nbsp;agree &#38; I&#x27;m in.<br>Bye</p>',
      ),
      "Dear Sam,\n\nI\u00A0agree & I'm in.\nBye",
    );
    assert.strictEqual(textOfXhtml("plain words"), "plain words");
  });
});
