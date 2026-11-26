/**
 * The text of an xhtml Extended Text's value: the text its box shows, against which its
 * `pattern-mask` is matched (reading 244), as plate reads a value (`textOfXhtml`,
 * `@qti-pie/plate`'s `interactions/xhtml-text.ts`) and the SQL grader restated it
 * (`p3.xhtml_text`): a value plate wrote reads back as the text typed; any other has each `br` a
 * line feed, each run of block tags a blank line per paragraph boundary it is alone (none where it
 * opens or closes the value, a line feed elsewhere), every other tag removed, then each character
 * reference resolved in one pass.
 *
 * @module
 */
import { regex } from "arkregex";

/**
 * The block elements, QTI 3.0.1's BlockContentModel and the structural children those blocks hold.
 */
const blockElements = [
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
 * JavaScript's `\s`.
 */
const space = String.raw`[\t\n\v\f\r    -     　﻿]`;

const blockStart = String.raw`<(?:${blockElements.join("|")})(?:${space}[^>]*)?/?>`;

const blockEnd = String.raw`</(?:${blockElements.join("|")})(?:${space}[^>]*)?>`;

/**
 * A run of block tags, white space between an end tag and the next block tag included.
 */
const blockRun = regex(
  `(?:${blockStart}|${blockEnd}(?:${space}+(?=${blockStart}|${blockEnd}))?)+`,
  "giu",
);

const openingParagraph = regex(`^<p(?:${space}[^>]*)?>`, "iu");

const closingParagraph = regex(`</p${space}*>$`, "iu");

const paragraphBoundaries = regex(
  `^(?:${space}*</p${space}*>${space}*<p(?:${space}[^>]*)?>)+${space}*$`,
  "iu",
);

const paragraphEnds = regex("</p", "giu");

const lineBreak = regex(`<br${space}*/?>`, "giu");

const tag = regex("<[^>]*>", "gu");

const reference = regex("&#x[0-9A-Fa-f]+;|&#[0-9]+;|&[A-Za-z]+;", "gu");

const plateWritten = regex("^(?:<p>(?:[^<&]|&(?:amp|lt|gt|#13);|<br/>)*</p>)+$", "u");

const plateReference = regex("&(?:amp|lt|gt|#13);", "gu");

const plateReferences: ReadonlyMap<string, string> = new Map([
  ["&amp;", "&"],
  ["&lt;", "<"],
  ["&gt;", ">"],
  ["&#13;", "\r"],
]);

const namedReferences: ReadonlyMap<string, string> = new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
  ["nbsp", " "],
]);

/**
 * Text with each character reference resolved: a numeric one to its code point where that is at
 * most U+10FFFF, a named one of the six to its character, any other as written.
 *
 * @param text - The text.
 * @returns It, resolved.
 */
const resolved = (text: string): string =>
  text.replaceAll(reference, (written) => {
    const body = written.slice(1, -1);
    if (!body.startsWith("#")) {
      return namedReferences.get(body) ?? written;
    }

    const code = body.startsWith("#x") ? Number.parseInt(body.slice(2), 16) : Number(body.slice(1));

    return code <= 0x10_ff_ff ? String.fromCodePoint(code) : written;
  });

/**
 * What a run of block tags reads as.
 *
 * @param run - The run.
 * @param opens - Whether it opens the value.
 * @param closes - Whether it closes the value.
 * @returns Its text.
 */
const runText = (run: string, opens: boolean, closes: boolean): string => {
  const afterOpening = opens ? run.replace(openingParagraph, "") : run;
  const inner = closes ? afterOpening.replace(closingParagraph, "") : afterOpening;
  if (inner === "") {
    return "";
  }

  if (paragraphBoundaries.test(inner)) {
    return "\n\n".repeat(inner.match(paragraphEnds)?.length ?? 0);
  }

  return opens || closes ? "" : "\n";
};

/**
 * The text of an xhtml value.
 *
 * @param xhtml - The value.
 * @returns The text its box shows.
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
            line.replaceAll(plateReference, (written) => plateReferences.get(written) ?? written),
          )
          .join("\n"),
      )
      .join("\n\n");
  }

  const lines = xhtml.replaceAll(lineBreak, "\n");

  return resolved(
    lines
      .replaceAll(blockRun, (run: string, at: number) =>
        runText(run, at === 0, at + run.length === lines.length),
      )
      .replaceAll(tag, ""),
  );
};
