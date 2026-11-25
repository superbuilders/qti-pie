/**
 * Plate's UI suite over the rich-text essay's value: the XHTML plate writes of the editor's
 * document (`@qti-pie/plate/rich-text`), and the document it reads back, held to rules written here
 * from QTI 3.0.1 and AlphaTest's player's toolbar (mastery-track-player 941a86a,
 * `ExtendedTextInteraction.tsx` lines 303–312), never from plate's code.
 *
 * - RT1, each command: each of the toolbar's commands, on a line of one word, writes the XHTML a
 *   table here gives by hand, and that XHTML reads back as the line.
 * - RT2, lossless: every document of the toolbar's formats reads back as it was from its XHTML, and
 *   from its Delta.
 * - RT3, inside QTI: every document's XHTML is well-formed XML (crust's reader) whose every element
 *   is one of QTI 3.0.1's HTML elements the toolbar needs, whose attributes are a link's `href` and
 *   a block's or a span's `class`, and whose every class is the shared vocabulary's or plate's own
 *   two, strike and justify, for which QTI has none.
 * - RT4, the review: a review shows an answer's document formatted, built from the document and never
 *   from the value's markup, as AlphaTest's review showed the answer in its read-only editor
 *   (`ExtendedTextInteraction.tsx` lines 296–300 and 831–841): each answer of a table here draws
 *   the markup the table gives, a link keeps its address only for http, https and mailto, and a
 *   value plate did not write shows as its text.
 * - RT5, the count: the count under the editor says how many words the answer holds, AlphaTest's "1
 *   word" or "N words" (line 848), each answer of a table here at the count the table gives by
 *   hand, a word a run of anything but JavaScript's `\s` on the answer's text, a paragraph's and a
 *   list item's end a space, a zero-width character nothing.
 *
 * Its kills, each a writer a slip would make in place of plate's: underline as HTML's `u`, which
 * QTI 3.0.1 does not hold; strike left out; a link's address and the text left unescaped; an
 * ordered list and a bullet list beside it written as one list; and Quill's own `ql-indent-N` class
 * in place of the vocabulary's margin.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { drawn, explore } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import { array, boolean, characterOf, element, string } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { readXml } from "@qti-pie/crust/read.ts";
import type { Child } from "@qti-pie/crust/tree.ts";
import { Effect, Exit, Formatter } from "effect";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { acceptedItem, configure } from "@qti-pie/plate";
import {
  indentLevels,
  linesOfOps,
  linesOfXhtml,
  opsOfLines,
  plainLine,
  plainRun,
  xhtmlOfLines,
} from "@qti-pie/plate/rich-text";
import type { Line, LineFormat, Run, RunFormat } from "@qti-pie/plate/rich-text";
import { admitted } from "@qti-pie/plate/test/admitted";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import { ExtendedText, heldOf, Responses, RichText } from "@qti-pie/plate/ui/client";

/**
 * QTI 3.0.1's HTML elements the essay may write (`imsqti_asiv3p0p1_v1p0.xsd`), each one a command
 * of the toolbar needs: a paragraph, headers 1 to 3, the two lists and their items, bold, italic,
 * subscript, superscript, a link, and a span for a class.
 */
const qtiElements: ReadonlySet<string> = new Set([
  "a",
  "em",
  "h1",
  "h2",
  "h3",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "sub",
  "sup",
  "ul",
]);

/**
 * The classes the essay may write: the shared vocabulary's alignments, underline and start margins
 * 1 to 5, and plate's own strike and justify.
 */
const essayClasses: ReadonlySet<string> = new Set([
  "plate-align-justify",
  "plate-strike",
  "qti-align-center",
  "qti-align-right",
  "qti-margin-s-1",
  "qti-margin-s-2",
  "qti-margin-s-3",
  "qti-margin-s-4",
  "qti-margin-s-5",
  "qti-underline",
]);

/**
 * A line of one word, `w`, in a run format and a line format, each over plain.
 *
 * @param run What the run's format turns on.
 * @param line What the line's format turns on.
 * @returns The line.
 */
const oneWord = (run: Partial<RunFormat>, line: Partial<LineFormat>): Line => ({
  format: { ...plainLine, ...line },
  runs: [{ format: { ...plainRun, ...run }, text: "w" }],
});

/**
 * RT1's table: each command of the toolbar, a line of one word under it, and the XHTML it writes,
 * by hand.
 */
const commands: readonly (readonly [command: string, line: Line, xhtml: string])[] = [
  ["normal", oneWord({}, {}), "<p>w</p>"],
  ["header 1", oneWord({}, { header: 1 }), "<h1>w</h1>"],
  ["header 2", oneWord({}, { header: 2 }), "<h2>w</h2>"],
  ["header 3", oneWord({}, { header: 3 }), "<h3>w</h3>"],
  ["bold", oneWord({ bold: true }, {}), "<p><strong>w</strong></p>"],
  ["italic", oneWord({ italic: true }, {}), "<p><em>w</em></p>"],
  ["underline", oneWord({ underline: true }, {}), '<p><span class="qti-underline">w</span></p>'],
  ["strike", oneWord({ strike: true }, {}), '<p><span class="plate-strike">w</span></p>'],
  ["ordered list", oneWord({}, { list: "ordered" }), "<ol><li>w</li></ol>"],
  ["bullet list", oneWord({}, { list: "bullet" }), "<ul><li>w</li></ul>"],
  ["subscript", oneWord({ script: "sub" }, {}), "<p><sub>w</sub></p>"],
  ["superscript", oneWord({ script: "super" }, {}), "<p><sup>w</sup></p>"],
  ["indent", oneWord({}, { indent: 1 }), '<p class="qti-margin-s-1">w</p>'],
  ["indent 5 deep", oneWord({}, { indent: 5 }), '<p class="qti-margin-s-5">w</p>'],
  ["align center", oneWord({}, { align: "center" }), '<p class="qti-align-center">w</p>'],
  ["align right", oneWord({}, { align: "right" }), '<p class="qti-align-right">w</p>'],
  ["align justify", oneWord({}, { align: "justify" }), '<p class="plate-align-justify">w</p>'],
  [
    "link",
    oneWord({ link: "https://example.org/?a=1&b=2" }, {}),
    '<p><a href="https://example.org/?a=1&amp;b=2">w</a></p>',
  ],
  [
    "every inline command at once",
    oneWord(
      { bold: true, italic: true, link: "x", script: "super", strike: true, underline: true },
      {},
    ),
    '<p><a href="x"><sup><strong><em><span class="qti-underline"><span class="plate-strike">w</span></span></em></strong></sup></a></p>',
  ],
  [
    "a list item indented and aligned",
    oneWord({}, { align: "right", indent: 2, list: "bullet" }),
    '<ul><li class="qti-align-right qti-margin-s-2">w</li></ul>',
  ],
];

/**
 * Tell whether two run formats are one, field by field.
 *
 * @param a A format.
 * @param b Another.
 * @returns Whether they are equal.
 */
const sameRunFormat = (a: RunFormat, b: RunFormat): boolean =>
  a.bold === b.bold &&
  a.italic === b.italic &&
  a.link === b.link &&
  a.script === b.script &&
  a.strike === b.strike &&
  a.underline === b.underline;

/**
 * Tell whether two documents are one, line by line and run by run.
 *
 * @param a A document.
 * @param b Another.
 * @returns Whether they are equal.
 */
const sameDocument = (a: readonly Line[], b: readonly Line[]): boolean =>
  a.length === b.length &&
  a.every((line, at) => {
    const other = b[at];

    return (
      other !== undefined &&
      line.format.align === other.format.align &&
      line.format.header === other.format.header &&
      line.format.indent === other.format.indent &&
      line.format.list === other.format.list &&
      line.runs.length === other.runs.length &&
      line.runs.every((run, index) => {
        const twin = other.runs[index];

        return (
          twin !== undefined && run.text === twin.text && sameRunFormat(run.format, twin.format)
        );
      })
    );
  });

/**
 * Hold the runs of a line as the editor holds them, the rule written here: an empty run is no run,
 * and two neighbours of one format are one run of both texts.
 *
 * @param runs The runs drawn.
 * @returns The runs, held.
 */
const held = (runs: readonly Run[]): readonly Run[] => {
  const kept: Run[] = [];

  for (const run of runs) {
    const last = kept.at(-1);

    if (run.text !== "") {
      if (last !== undefined && sameRunFormat(last.format, run.format)) {
        kept[kept.length - 1] = { format: last.format, text: last.text + run.text };
      } else {
        kept.push(run);
      }
    }
  }

  return kept;
};

/**
 * Draw a run's format: each inline command on or off, a script of two or none, and a link of three
 * or none, one holding the characters an attribute escapes.
 */
const runFormats: Gen<RunFormat> = (source) => ({
  bold: boolean(source),
  italic: boolean(source),
  link: element([undefined, 'https://example.org/a?b=1&c="2"', "mailto:t@example.org"])(source),
  script: element([undefined, "sub", "super"] as const)(source),
  strike: boolean(source),
  underline: boolean(source),
});

/**
 * Draw a run's text: letters, a space and a tab, the characters XML escapes, and characters past
 * ASCII, one of them past the Basic Multilingual Plane.
 */
const runTexts: Gen<string> = string(
  characterOf(["a", "b", " ", "\t", "&", "<", ">", '"', "'", "é", "😀"]),
  { max: 5, min: 0 },
);

/**
 * The header level each block format draws, none for a paragraph or a list.
 */
const headers = {
  bullet: undefined,
  h1: 1,
  h2: 2,
  h3: 3,
  ordered: undefined,
  p: undefined,
} as const;

/**
 * Draw a line's format: a paragraph, a header of 1 to 3 or a list of either kind, one block format
 * to a line as Quill holds it; an alignment or none; and an indent of 0 to 5.
 */
const lineFormats: Gen<LineFormat> = (source) => {
  const block = element(["p", "h1", "h2", "h3", "ordered", "bullet"] as const)(source);

  return {
    align: element([undefined, "center", "right", "justify"] as const)(source),
    header: headers[block],
    indent: element(indentLevels)(source),
    list: block === "ordered" || block === "bullet" ? block : undefined,
  };
};

/**
 * Draw a document: one to five lines, each a line format and up to four runs, held as the editor
 * holds them.
 */
const documents: Gen<readonly Line[]> = array(
  (source): Line => ({
    format: lineFormats(source),
    runs: held(
      array((each): Run => ({ format: runFormats(each), text: runTexts(each) }), {
        max: 4,
        min: 0,
      })(source),
    ),
  }),
  { max: 5, min: 1 },
);

/**
 * What a drawn document is required to reach: each command, an empty line, a text XML escapes, and
 * an ordered list beside a bullet list.
 */
type Situation =
  | "adjacent lists"
  | "align center"
  | "align justify"
  | "align right"
  | "bold"
  | "bullet"
  | "empty line"
  | "escaped text"
  | "header"
  | "indent"
  | "italic"
  | "link"
  | "ordered"
  | "strike"
  | "subscript"
  | "superscript"
  | "underline";

/**
 * Name what a document reaches.
 *
 * @param document The document.
 * @returns Each situation it reaches.
 */
const situationsOf = (document: readonly Line[]): readonly Situation[] =>
  document.flatMap((line, at): readonly Situation[] => [
    ...(line.format.header === undefined ? [] : ["header" as const]),
    ...(line.format.list === undefined ? [] : [line.format.list]),
    ...(line.format.align === undefined ? [] : [`align ${line.format.align}` as const]),
    ...(line.format.indent === 0 ? [] : ["indent" as const]),
    ...(line.runs.length === 0 ? ["empty line" as const] : []),
    ...(line.format.list !== undefined &&
    document[at + 1]?.format.list !== undefined &&
    document[at + 1]?.format.list !== line.format.list
      ? ["adjacent lists" as const]
      : []),
    ...line.runs.flatMap(({ format, text }): readonly Situation[] => [
      ...(format.bold ? ["bold" as const] : []),
      ...(format.italic ? ["italic" as const] : []),
      ...(format.underline ? ["underline" as const] : []),
      ...(format.strike ? ["strike" as const] : []),
      ...(format.link === undefined ? [] : ["link" as const]),
      ...(format.script === "sub" ? ["subscript" as const] : []),
      ...(format.script === "super" ? ["superscript" as const] : []),
      ...(/[&<>"]/u.test(text) ? ["escaped text" as const] : []),
    ]),
  ]);

/**
 * Hold a document's XHTML to RT3: what breaks it, none when it holds.
 *
 * @param xhtml The XHTML.
 * @returns What breaks.
 */
const outsideQti = (xhtml: string): readonly string[] => {
  const read = Effect.runSyncExit(
    readXml(new TextEncoder().encode(`<div xmlns="http://www.w3.org/1999/xhtml">${xhtml}</div>`)),
  );

  if (Exit.isFailure(read)) {
    return [`RT3: ${xhtml} is not well-formed`];
  }

  const problems: string[] = [];
  const walk = (children: readonly Child[]): void => {
    for (const child of children) {
      if (child.kind !== "element") {
        continue;
      }

      if (!qtiElements.has(child.local)) {
        problems.push(`RT3: ${child.local} is no element of QTI 3.0.1's the essay writes`);
      }

      for (const attribute of child.attributes) {
        if (attribute.local !== (child.local === "a" ? "href" : "class")) {
          problems.push(`RT3: ${child.local} carries ${attribute.local}`);
        }

        if (attribute.local === "class") {
          for (const name of attribute.value.split(" ")) {
            if (!essayClasses.has(name)) {
              problems.push(`RT3: ${name} is no class the essay writes`);
            }
          }
        }
      }

      walk(child.children);
    }
  };

  walk(read.value.root.children);

  return problems;
};

/**
 * Hold a writer to RT2 and RT3 on a document: what breaks, none when every rule holds.
 *
 * @param document The document.
 * @param write The writer, plate's or a kill's.
 * @returns What breaks.
 */
const broken = (
  document: readonly Line[],
  write: (lines: readonly Line[]) => string,
): readonly string[] => {
  const xhtml = write(document);

  return [
    ...(sameDocument(linesOfXhtml(xhtml), document) ? [] : [`RT2: ${xhtml} reads back otherwise`]),
    ...(sameDocument(linesOfOps(opsOfLines(document)), document)
      ? []
      : ["RT2: its Delta reads back otherwise"]),
    ...outsideQti(xhtml),
  ];
};

/**
 * Turn strike off on every run of a document.
 *
 * @param lines The document.
 * @returns It, with no strike.
 */
const struckOut = (lines: readonly Line[]): readonly Line[] =>
  lines.map((line) => ({
    format: line.format,
    runs: line.runs.map((run) => ({ format: { ...run.format, strike: false }, text: run.text })),
  }));

/**
 * Give every list line the kind of the first line of the run of list lines it stands in.
 *
 * @param lines The document.
 * @returns It, each run of list lines one kind.
 */
const oneListKind = (lines: readonly Line[]): readonly Line[] => {
  let kind: LineFormat["list"];

  return lines.map((line) => {
    kind = line.format.list === undefined ? undefined : (kind ?? line.format.list);

    return { format: { ...line.format, list: kind }, runs: line.runs };
  });
};

/**
 * The kills: a writer a slip would make in place of plate's.
 */
const kills: readonly (readonly [why: string, write: (lines: readonly Line[]) => string])[] = [
  [
    "underline as HTML's u",
    (lines) =>
      xhtmlOfLines(lines).replaceAll(
        /<span class="qti-underline">(?<inner>(?:<span class="plate-strike">[^<]*<\/span>)|[^<]*)<\/span>/gu,
        "<u>$<inner></u>",
      ),
  ],
  ["strike left out", (lines) => xhtmlOfLines(struckOut(lines))],
  [
    "a link's address and the text left unescaped",
    (lines) => xhtmlOfLines(lines).replaceAll("&quot;", '"').replaceAll("&amp;", "&"),
  ],
  [
    "an ordered list and a bullet list beside it as one list",
    (lines) => xhtmlOfLines(oneListKind(lines)),
  ],
  [
    "Quill's indent class",
    (lines) =>
      xhtmlOfLines(lines).replaceAll(/qti-margin-s-(?<level>[1-5])/gu, "ql-indent-$<level>"),
  ],
];

/**
 * The documents the kills are held to: each of RT1's lines, and an ordered list beside a bullet
 * one.
 */
const killDocuments: readonly (readonly Line[])[] = [
  ...commands.map(([, line]) => [line]),
  [oneWord({}, { list: "ordered" }), oneWord({}, { list: "bullet" })],
];

/**
 * An Extended Text of `format="xhtml"`, the essay a review shows.
 */
const essayXml = `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="essay" title="Essay" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/>
  <qti-item-body>
    <qti-extended-text-interaction response-identifier="RESPONSE" format="xhtml"><qti-prompt>Why does your class like the garden?</qti-prompt></qti-extended-text-interaction>
  </qti-item-body>
</qti-assessment-item>
`;

/**
 * RT4's table: an answer, and the markup its review draws inside its answer part, by hand.
 */
const reviews: readonly (readonly [answer: string, xhtml: string, markup: string])[] = [
  [
    "a sentence with a bold word, then a bullet list",
    "<p>Our class likes it <strong>because</strong> the garden helps everyone.</p><ul><li>Plant seeds</li><li>Water plants</li></ul>",
    "<p>Our class likes it <strong>because</strong> the garden helps everyone.</p><ul><li>Plant seeds</li><li>Water plants</li></ul>",
  ],
  [
    "a header, an ordered list beside a bullet list, and an empty line",
    "<h2>Why</h2><ol><li>one</li></ol><ul><li>two</li></ul><p></p>",
    "<h2>Why</h2><ol><li>one</li></ol><ul><li>two</li></ul><p><br/></p>",
  ],
  [
    "alignment, indent, underline, strike, scripts and italic",
    '<p class="qti-align-center qti-margin-s-2"><span class="qti-underline"><span class="plate-strike">x</span></span><sub>2</sub><sup><em>3</em></sup></p>',
    '<p data-align="center" data-indent="2"><span data-underline=""><span data-strike="">x</span></span><sub>2</sub><sup><em>3</em></sup></p>',
  ],
  [
    "a link of https, and one of javascript, which keeps no address",
    '<p><a href="https://example.org/a?b=1&amp;c=2">safe</a> <a href="javascript:alert(1)">unsafe</a></p>',
    '<p><a href="https://example.org/a?b=1&amp;c=2">safe</a> <a>unsafe</a></p>',
  ],
  [
    "a value plate did not write, shown as its text",
    '<p style="color: red" onclick="steal()">red &amp; <b>bold</b></p>',
    "<p>red &amp; bold</p>",
  ],
];

/**
 * Render the essay's review of an answer.
 *
 * @param xhtml The answer.
 * @returns The review's markup, as React writes it.
 */
const reviewHtml = (xhtml: string) =>
  Effect.gen(function* reviewed() {
    const verdict = yield* admitted("essay.xml", new TextEncoder().encode(essayXml));
    const accepted = yield* Effect.fromOption(acceptedItem(verdict));
    const configuration = yield* configure({ assets: [], seed: "rich-text" });

    return renderToStaticMarkup(
      createElement(Item, {
        configuration,
        instance: "suite",
        item: accepted,
        mode: "review",
        renderers: standardRenderers,
        showFeedback: false,
        values: {
          RESPONSE: {
            baseType: "string",
            cardinality: "single",
            values: [{ baseType: "string", value: xhtml }],
          },
        },
      }),
    );
  }).pipe(Effect.orDie);

/**
 * Render the essay's review of an answer and give its answer part's markup, as React writes it.
 *
 * @param xhtml The answer.
 * @returns The answer part's markup, none where the review draws no answer part.
 */
const reviewOf = (xhtml: string) =>
  Effect.map(
    reviewHtml(xhtml),
    // The answer part holds no div, so its markup runs to the first `</div>` after its start tag.
    (html) =>
      /data-slot="plate-rich-answer"[^>]*>(?<inner>.*?)<\/div>/su.exec(html)?.groups?.["inner"],
  );

/**
 * RT5's table: an answer, and what the count under the editor says of it, by hand.
 */
const counts: readonly (readonly [answer: string, xhtml: string, count: string])[] = [
  ["nothing typed", "", "0 words"],
  ["one word", "<p>one</p>", "1 word"],
  [
    "a sentence, then a bullet list of two, where AlphaTest's counter said 11",
    "<p>Our class likes it <strong>because</strong> the garden helps everyone.</p><ul><li>Plant seeds</li><li>Water plants</li></ul>",
    "13 words",
  ],
  ["two paragraphs of a word each", "<p>one</p><p>two</p>", "2 words"],
  ["a no-break space between two words", "<p>red\u00A0fox</p>", "2 words"],
  ["a zero-width space alone", "<p>\u200B</p>", "0 words"],
  ["punctuation and digits inside words", "<p>it's 3-4, ok?</p>", "3 words"],
];

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {
  // A server render runs no event handler.
};

/**
 * RT5's plain table: a plain answer, and what the count under its textarea says of it, by hand.
 */
const plainCounts: readonly (readonly [answer: string, text: string, count: string])[] = [
  ["nothing typed", "", "0 words"],
  ["one word", "one", "1 word"],
  ["words on two lines", "Plant seeds\nWater plants", "4 words"],
  ["a zero-width space alone, which a plain answer counts as typed", "\u200B", "1 word"],
  ["punctuation and digits inside words", "it's 3-4, ok?", "3 words"],
];

/**
 * The words the count says, as the catalog gives them.
 */
const countWords = { one: "1 word", other: "{n} words" } as const;

/**
 * Give what a page's count says.
 *
 * @param html The page's markup.
 * @returns The count's text, none where the page draws no count.
 */
const countIn = (html: string): string | undefined =>
  /data-slot="plate-word-count"[^>]*>(?<count>[^<]*)<\/p>/u.exec(html)?.groups?.["count"];

/**
 * Render an essay's island holding an answer, in a `<Responses>`, and give what its count says.
 *
 * @param island The island, bound to the response `RESPONSE`.
 * @param text The posted text.
 * @returns The count's text, none where the island draws no count.
 */
const islandCount = (island: ReturnType<typeof createElement>, text: string): string | undefined =>
  countIn(
    renderToStaticMarkup(
      createElement(Responses, {
        children: island,
        onChange: keepNothing,
        value: heldOf({
          RESPONSE: {
            baseType: "string",
            cardinality: "single",
            values: text === "" ? [] : [{ baseType: "string", value: text }],
          },
        }),
      }),
    ),
  );

/**
 * The response an essay's island is bound to: the item's one string, `RESPONSE`.
 */
const response = { baseType: "string", cardinality: "single", identifier: "RESPONSE" } as const;

/**
 * The rich editor's island.
 */
const richIsland = createElement(RichText, {
  naming: { "aria-label": "Answer" },
  placeholder: "Type your answer here...",
  prompt: undefined,
  response,
  root: { className: undefined },
  wordCount: countWords,
});

/**
 * A plain essay's island of one box bound to a string.
 */
const plainIsland = createElement(ExtendedText, {
  base: 10,
  baseType: "string",
  boxes: { most: 1, shown: 1 },
  format: "plain",
  labels: {
    box: "Answer {n} of {count}",
    pattern: "Not a valid answer",
    placeholder: "Type your answer here...",
    wordOne: countWords.one,
    words: countWords.other,
  },
  naming: { "aria-label": "Answer" },
  patternMask: undefined,
  placeholder: undefined,
  prompt: undefined,
  response,
  root: { className: undefined },
  size: { cols: undefined, rows: undefined },
});

describe("the rich-text essay's value", () => {
  it("RT1: each command writes the XHTML the table gives, which reads back as its line", () => {
    for (const [command, line, xhtml] of commands) {
      assert.strictEqual(xhtmlOfLines([line]), xhtml, command);
      assert.isTrue(sameDocument(linesOfXhtml(xhtml), [line]), `${command} reads back`);
    }
  });

  it.effect(
    "RT2 and RT3: every document reads back from its XHTML and its Delta, and its XHTML is QTI's",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang: "30 seconds",
            coverage: required<Situation>(
              [
                "adjacent lists",
                "align center",
                "align justify",
                "align right",
                "bold",
                "bullet",
                "empty line",
                "escaped text",
                "header",
                "indent",
                "italic",
                "link",
                "ordered",
                "strike",
                "subscript",
                "superscript",
                "underline",
              ],
              { cases: 400, sense: notesOnly },
            ),
            draw: drawn(documents),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "universal",
              name: "read ∘ write = id over the editor's documents, and QTI 3.0.1's HTML subset by crust's reader",
            },
            runs: 2000,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "plate-ui/rich-text",
          },
          (document, c) =>
            Effect.sync(() => {
              for (const situation of situationsOf(document)) {
                c.note(situation);
              }

              assert.deepStrictEqual(
                broken(document, xhtmlOfLines),
                [],
                Formatter.format(document),
              );
            }),
        ),
      ),
  );

  it.effect("RT4: a review draws each answer's document as the table gives", () =>
    Effect.gen(function* reviewRule() {
      for (const [answer, xhtml, markup] of reviews) {
        assert.strictEqual(yield* reviewOf(xhtml), markup, answer);
      }
    }),
  );

  it("RT5: the count under an essay's box says how many words each answer holds", () => {
    for (const [answer, xhtml, count] of counts) {
      assert.strictEqual(islandCount(richIsland, xhtml), count, `rich: ${answer}`);
    }

    for (const [answer, text, count] of plainCounts) {
      assert.strictEqual(islandCount(plainIsland, text), count, `plain: ${answer}`);
    }
  });

  it.effect("RT5: a review counts the answer as the editor did", () =>
    Effect.gen(function* reviewCountRule() {
      for (const [answer, xhtml, count] of counts.filter(([, value]) => value !== "")) {
        assert.strictEqual(countIn(yield* reviewHtml(xhtml)), count, `review: ${answer}`);
      }
    }),
  );

  it("its kills: each writer a slip would make breaks a rule", () => {
    for (const [why, write] of kills) {
      const caught =
        commands.some(([, line, xhtml]) => write([line]) !== xhtml) ||
        killDocuments.some((document) => broken(document, write).length > 0);

      assert.isTrue(caught, `${why}: caught`);
    }
  });
});
