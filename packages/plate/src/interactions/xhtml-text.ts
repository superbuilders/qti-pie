/**
 * The text a child types into an Extended Text of `format="xhtml"`, written as XHTML and read back.
 * QTI 3.0.1's `TextFormatEnum` (information model §8.42): "xhtml - indicates that the text to be
 * entered by the candidate is structured text. The value of the response variable is text marked up
 * in XHTML. The delivery engine should present an interface suitable for capturing structured text,
 * this might be plain typed text interpreted with a set of simple text markup conventions such as
 * those used in wiki page editors or a complete WYSIWYG editor." Plate gives that format the plain
 * textarea and a wiki editor's conventions: a blank line between two runs of text parts paragraphs,
 * each a `p`, and every other line break within a paragraph is a `br`. The response is the sequence
 * of those `p` elements, a fragment of XHTML's flow content, so the value a grader or a scorer
 * reads is markup, as the format declares, and never the raw text.
 *
 * Writing and reading are inverse on everything plate writes: the text read back from a written
 * value is the text typed, every space, line break and blank line kept, so a restored essay is the
 * child's own. XML 1.0 holds no other control character (§2.2, `Char`), and a textarea never makes
 * one from the keyboard; one pasted in is no character a value can hold, so writing leaves it out.
 * A value plate did not write, such as an essay another editor saved as HTML, reads as its text:
 * its paragraphs parted by a blank line, its breaks as line breaks, its other markup dropped, and
 * its character references resolved.
 *
 * @module
 */

/**
 * Every code point XML 1.0 cannot hold (§2.2, `Char`: "#x9 | #xA | #xD | [#x20-#xD7FF] |
 * [#xE000-#xFFFD] | [#x10000-#x10FFFF]"), a lone surrogate among them: a value holds none.
 */
const notXmlCharacters = /[^\t\n\r\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu;

/**
 * Escape a text for XML character data: `&` and `<` always, `>` since `]]>` may not stand in
 * content, and a carriage return as its reference, since an XML processor reads a literal one as a
 * line feed (XML 1.0 §2.11).
 */
const escaped = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\r", "&#13;");

/**
 * Write the text a child typed as the XHTML value of their response: each paragraph, the text
 * between two line-feed pairs, a `p`, each other line feed in it a `br`, and every character XML
 * cannot hold left out.
 *
 * @param text The text typed, one that posts (plate posts no empty text).
 * @returns The value, a sequence of `p` elements.
 */
export const xhtmlOfText = (text: string): string =>
  text
    .replaceAll(notXmlCharacters, "")
    .split("\n\n")
    .map((paragraph) => `<p>${paragraph.split("\n").map(escaped).join("<br/>")}</p>`)
    .join("");

/**
 * A value as {@link xhtmlOfText} writes it: `p` elements holding text and `br`s alone, in their
 * escaped form.
 */
const plateWritten = /^(?:<p>(?:[^<&]|&(?:amp|lt|gt|#13);|<br\/>)*<\/p>)+$/u;

/**
 * The references plate writes, by what each stands for.
 */
const plateReferences: ReadonlyMap<string, string> = new Map([
  ["&amp;", "&"],
  ["&lt;", "<"],
  ["&gt;", ">"],
  ["&#13;", "\r"],
]);

/**
 * XHTML's predefined entities and `nbsp`, the ones an HTML editor writes, by what each stands for.
 */
const namedReferences: ReadonlyMap<string, string> = new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
  ["nbsp", "\u00A0"],
]);

/**
 * Resolve the character references of a text: a numeric one as its code point, where it names one,
 * and a named one {@link namedReferences} holds; any other stands as written.
 */
const resolved = (text: string): string =>
  text.replaceAll(/&#x[0-9A-Fa-f]+;|&#[0-9]+;|&[A-Za-z]+;/gu, (reference) => {
    const body = reference.slice(1, -1);

    if (!body.startsWith("#")) {
      return namedReferences.get(body) ?? reference;
    }

    const code = body.startsWith("#x") ? Number.parseInt(body.slice(2), 16) : Number(body.slice(1));

    return code <= 0x10_ff_ff ? String.fromCodePoint(code) : reference;
  });

/**
 * JavaScript's `\s`, spelled out as the class the database's text reads white space inside and
 * between tags by (`p3.xhtml_text`), so the two read alike.
 */
const space = String.raw`[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]`;

/**
 * The block elements whose boundaries part lines, declared once: QTI 3.0.1's block content, the
 * twenty-five tags of the information model's `BlockContentModel` (§6.3, Tables 6.3.1 to 6.3.25:
 * "This is an abstract class that enables the HTML block content tags to be used"), and the
 * structural children those blocks contain: a list's `li` (`ol`, `ul`, §6.3.11 and §6.3.12), a
 * definition list's `dt` and `dd` (`dl`, §6.3.10), a table's `caption`, row groups, rows and cells
 * (`table`, §6.3.15), and a figure's `figcaption` (`figure`, §6.3.20). The ledger's machine reads
 * the same list (`p3.xhtml_blocks`, held to this one by the ledger's xhtml-blocks test).
 */
export const blockElements = [
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "address",
  "dl",
  "ol",
  "ul",
  "hr",
  "blockquote",
  "table",
  "div",
  "article",
  "aside",
  "audio",
  "figure",
  "footer",
  "header",
  "nav",
  "section",
  "video",
  "li",
  "dt",
  "dd",
  "caption",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "figcaption",
] as const;

/**
 * A start tag of a block element ({@link blockElements}), whatever its case, self-closing or not.
 */
const blockStart = String.raw`<(?:${blockElements.join("|")})(?:${space}[^>]*)?\/?>`;

/**
 * An end tag of a block element ({@link blockElements}), whatever its case.
 */
const blockEnd = String.raw`<\/(?:${blockElements.join("|")})(?:${space}[^>]*)?>`;

/**
 * A run of block tags: where one block ends and the next begins. White space belongs to it only
 * after an end tag and before the next block tag, where it stands between two elements; after a
 * start tag it is the block's own text, as a paragraph's space is.
 */
const blockRun = new RegExp(
  `(?:${blockStart}|${blockEnd}(?:${space}+(?=${blockStart}|${blockEnd}))?)+`,
  "giu",
);

/**
 * The value's first paragraph's start tag, at the start of a run that opens the value.
 */
const openingParagraph = new RegExp(`^<p(?:${space}[^>]*)?>`, "iu");

/**
 * The value's last paragraph's end tag, at the end of a run that closes the value.
 */
const closingParagraph = new RegExp(`<\\/p${space}*>$`, "iu");

/**
 * A run of paragraph boundaries alone: one paragraph's end and the next one's start, once or more.
 */
const paragraphBoundaries = new RegExp(
  `^(?:${space}*<\\/p${space}*>${space}*<p(?:${space}[^>]*)?>)+${space}*$`,
  "iu",
);

/**
 * What a run of block tags reads as: a blank line for each paragraph boundary it is made of alone
 * (once the value's own first start and last end are set aside), so plate's values read back
 * exactly; nothing where it opens or closes the value; one line break anywhere else.
 *
 * @param run The run.
 * @param opens Whether it opens the value.
 * @param closes Whether it closes the value.
 * @returns What it reads as.
 */
const runText = (run: string, opens: boolean, closes: boolean): string => {
  const afterOpening = opens ? run.replace(openingParagraph, "") : run;
  const inner = closes ? afterOpening.replace(closingParagraph, "") : afterOpening;

  if (inner === "") {
    return "";
  }

  if (paragraphBoundaries.test(inner)) {
    return "\n\n".repeat(inner.match(/<\/p/giu)?.length ?? 0);
  }

  return opens || closes ? "" : "\n";
};

/**
 * Read a response's XHTML value back as the text a textarea shows: exactly the text typed, for a
 * value plate wrote ({@link xhtmlOfText}); for any other, its text: each `br` a line break, each
 * boundary between two paragraphs a blank line, each other boundary between blocks
 * ({@link blockElements}: a heading, a list or its item, a quotation, a table or its cell, a
 * division, a section) a line break ({@link runText}), so words in separate blocks are
 * separate words, and every other tag dropped.
 *
 * @param xhtml The value.
 * @returns The text.
 */
export const textOfXhtml = (xhtml: string): string => {
  if (plateWritten.test(xhtml)) {
    return xhtml
      .slice("<p>".length, -"</p>".length)
      .split("</p><p>")
      .map((paragraph) =>
        paragraph
          .split("<br/>")
          .map((line) =>
            line.replaceAll(
              /&(?:amp|lt|gt|#13);/gu,
              (reference) => plateReferences.get(reference) ?? reference,
            ),
          )
          .join("\n"),
      )
      .join("\n\n");
  }

  const lines = xhtml.replaceAll(new RegExp(`<br${space}*\\/?>`, "giu"), "\n");

  return resolved(
    lines
      .replaceAll(blockRun, (run: string, at: number) =>
        runText(run, at === 0, at + run.length === lines.length),
      )
      .replaceAll(/<[^>]*>/gu, ""),
  );
};
