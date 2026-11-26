/**
 * Plate's UI suite over the rich-text essay's value: the XHTML plate writes of the editor's
 * document (`@qti-pie/plate/rich-text`), and the document it reads back, held to rules written here
 * from QTI 3.0.1 and AlphaTest's player's toolbar (mastery-track-player 941a86a,
 * `ExtendedTextInteraction.tsx` lines 303–312), never from plate's code.
 *
 * - RT1, each command: every line of one word, under every combination of the toolbar's formats,
 *   writes the element or class QTI 3.0.1's HTML or its shared vocabulary holds for each format on,
 *   once, and no other, and that XHTML reads back as the line.
 * - RT2, lossless: every document of the toolbar's formats reads back as it was from its XHTML, and
 *   from its Delta.
 * - RT3, inside QTI: every document's XHTML is well-formed XML (crust's reader) whose every element
 *   is one of QTI 3.0.1's HTML elements the toolbar needs, whose attributes are a link's `href` and
 *   a block's or a span's `class`, and whose every class is the shared vocabulary's or plate's own
 *   two, strike and justify, for which QTI has none.
 * - RT4, the review: a review shows an answer's document formatted, built from the document and never
 *   from the value's markup, as AlphaTest's review showed the answer in its read-only editor
 *   (`ExtendedTextInteraction.tsx` lines 296–300 and 831–841): every document plate writes reads
 *   back from its review, a link keeping its address only for http, https and mailto, and a value
 *   plate did not write shows as its text, a line to each line.
 * - RT5, the count: the count under the editor says how many words the answer holds, AlphaTest's "1
 *   word" or "N words" (line 848), a word a run of anything but JavaScript's `\s` on the answer's
 *   text, a paragraph's and a list item's end a space, a zero-width space nothing; a plain answer's
 *   count holds a zero-width space as typed, and a review counts as the editor did.
 *
 * @module
 */
import { availableParallelism } from "node:os";
import { assert, describe, it } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { noCoverage, required } from "@bjornpagen/testing/features";
import { array, boolean, characterOf, element, option, string } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { readXml } from "@qti-pie/crust/read.ts";
import type { Child } from "@qti-pie/crust/tree.ts";
import { regex } from "arkregex";
import { Array as Arr, Effect, Exit, Formatter, Option } from "effect";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { acceptedItem, configure } from "@qti-pie/plate";
import {
  indentLevels,
  isWritten,
  linesOfOps,
  linesOfXhtml,
  opsOfLines,
  plainLine,
  xhtmlOfLines,
} from "@qti-pie/plate/rich-text";
import type { Line, LineFormat, Run, RunFormat } from "@qti-pie/plate/rich-text";
import { admitted } from "@qti-pie/plate/test/admitted";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import { ExtendedText, heldOf, Responses, RichText } from "@qti-pie/plate/ui/client";
import { boxHolds } from "#specimen/test/box.ts";

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
 * or none: an https address holding the characters an attribute escapes, a mailto one, and a
 * data one, whose address a review drops.
 */
const runFormats: Gen<RunFormat> = (source) => ({
  bold: boolean(source),
  italic: boolean(source),
  link: element([
    undefined,
    'https://example.org/a?b=1&c="2"',
    "mailto:t@example.org",
    "data:text/html,x",
  ])(source),
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
      ...(regex('[&<>"]', "u").test(text) ? ["escaped text" as const] : []),
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
 * The answer part holds no div, so its markup runs to the first `</div>` after its start tag.
 *
 * @param xhtml The answer.
 * @returns The answer part's markup, none where the review draws no answer part.
 */
const reviewOf = (xhtml: string) =>
  Effect.map(
    reviewHtml(xhtml),
    (html) =>
      regex('data-slot="plate-rich-answer"[^>]*>(?<inner>.*?)</div>', "su").exec(html)?.groups
        .inner,
  );

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {};

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
  regex('data-slot="plate-word-count"[^>]*>(?<count>[^<]*)</p>', "u").exec(html)?.groups.count;

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

/**
 * A case of RT1's box: a line format and the run format of its one word.
 */
interface OneWord {
  readonly line: LineFormat;
  readonly run: RunFormat;
}

/**
 * Draw a case of RT1's box: a line format of {@link lineFormats} and a run format of
 * {@link runFormats}.
 */
const oneWordLine: Gen<OneWord> = (source) => ({
  line: lineFormats(source),
  run: runFormats(source),
});

/**
 * How many cases {@link oneWordLine} draws: 192 run formats (bold, italic, underline and strike
 * each on or off, by 3 scripts and 4 links) by 144 line formats (6 blocks by 4 alignments by 6
 * indents).
 */
const ONE_WORD_LINES = 2 ** 4 * 3 * 4 * (6 * 4 * indentLevels.length);

/**
 * The line of a case of RT1's box: the word `w` in its run format.
 *
 * @param word The case.
 * @returns The line.
 */
const lineOf = ({ line, run }: OneWord): Line => ({
  format: line,
  runs: [{ format: run, text: "w" }],
});

/**
 * An element of the tree crust reads.
 */
type XmlElement = Extract<Child, { readonly kind: "element" }>;

/**
 * The value of an element's attribute.
 *
 * @param node The element.
 * @param name The attribute's local name.
 * @returns Its value; none where the element has none of that name.
 */
const attributeOf = (node: XmlElement, name: string): Option.Option<string> =>
  Option.map(
    Arr.findFirst(node.attributes, (attribute) => attribute.local === name),
    (attribute) => attribute.value,
  );

/**
 * The element children of an element's children.
 *
 * @param children The children.
 * @returns Its elements, in order.
 */
const elementsIn = (children: readonly Child[]): readonly XmlElement[] =>
  children.flatMap((child) => (child.kind === "element" ? [child] : []));

/**
 * The text of a tree: every text node beneath its children, in document order.
 *
 * @param children The children.
 * @returns The text.
 */
const textIn = (children: readonly Child[]): string =>
  children
    .map((child) => {
      if (child.kind === "text") {
        return child.value;
      }

      return child.kind === "element" ? textIn(child.children) : "";
    })
    .join("");

/**
 * Read an XHTML fragment with crust's reader, inside a `div` of XHTML's namespace.
 *
 * @param xhtml The fragment.
 * @returns The `div`'s children.
 */
const fragmentOf = (xhtml: string) =>
  Effect.map(
    readXml(new TextEncoder().encode(`<div xmlns="http://www.w3.org/1999/xhtml">${xhtml}</div>`)),
    (read) => read.root.children,
  );

/**
 * What RT1 reads of a line's XHTML: its block, a list's element and its item or the block's own
 * element; the block's classes; the inline elements around its word, each by its name, a span by
 * its class and a link by its address; how deep they stand, so a format written twice shows; and
 * the word.
 */
interface LineXhtml {
  readonly block: string;
  readonly classes: ReadonlySet<string>;
  readonly depth: number;
  readonly inline: ReadonlySet<string>;
  readonly word: string;
}

/**
 * The classes an element's `class` attribute holds.
 *
 * @param node The element.
 * @returns Its classes; none where it has no `class`.
 */
const classesOf = (node: XmlElement): ReadonlySet<string> =>
  new Set(
    Option.match(attributeOf(node, "class"), {
      onNone: () => [],
      onSome: (value) => value.split(" ").filter((name) => name !== ""),
    }),
  );

/**
 * Read the shape of a line's XHTML ({@link LineXhtml}).
 *
 * @param xhtml The line's XHTML.
 * @returns Its shape; fails where crust's reader refuses it.
 */
const lineXhtmlOf = (xhtml: string) =>
  Effect.map(fragmentOf(xhtml), (children): LineXhtml => {
    const [outer, ...others] = elementsIn(children);

    if (outer === undefined || others.length > 0) {
      return assert.fail(`${xhtml} is not one block`);
    }

    const items = outer.local === "ol" || outer.local === "ul" ? elementsIn(outer.children) : [];
    const [item] = items;
    const block = item ?? outer;
    const inline: string[] = [];
    let node = block;
    let [only] = elementsIn(node.children);

    while (only !== undefined) {
      inline.push(
        only.local === "a"
          ? `a ${Option.getOrThrow(attributeOf(only, "href"))}`
          : [only.local, ...classesOf(only)].join(" "),
      );
      node = only;
      [only] = elementsIn(node.children);
    }

    return {
      block: item === undefined ? outer.local : `${outer.local} ${item.local}`,
      classes: classesOf(block),
      depth: inline.length,
      inline: new Set(inline),
      word: textIn(node.children),
    };
  });

/**
 * The class QTI's shared vocabulary gives each alignment, or plate's own for justify, for which it
 * has none.
 */
const alignClasses = {
  center: "qti-align-center",
  justify: "plate-align-justify",
  right: "qti-align-right",
} as const;

/**
 * The shape RT1's rules give a case's line: a list an `ol` or `ul` of an `li`, a header `h1` to
 * `h3`, else a `p`; an alignment's and an indent's class; and around the word `strong` for bold,
 * `em` for italic, the underline's and the strike's spans, `sub` or `sup`, and `a` for a link, each
 * once.
 *
 * @param word The case.
 * @returns The shape.
 */
const lineXhtmlExpected = ({ line, run }: OneWord): LineXhtml => {
  const inline = new Set([
    ...(run.bold ? ["strong"] : []),
    ...(run.italic ? ["em"] : []),
    ...(run.underline ? ["span qti-underline"] : []),
    ...(run.strike ? ["span plate-strike"] : []),
    ...(run.script === "sub" ? ["sub"] : []),
    ...(run.script === "super" ? ["sup"] : []),
    ...(run.link === undefined ? [] : [`a ${run.link}`]),
  ]);
  const header = line.header === undefined ? "p" : `h${String(line.header)}`;

  return {
    block: line.list === undefined ? header : `${line.list === "ordered" ? "ol" : "ul"} li`,
    classes: new Set([
      ...(line.align === undefined ? [] : [alignClasses[line.align]]),
      ...(line.indent === 0 ? [] : [`qti-margin-s-${String(line.indent)}`]),
    ]),
    depth: inline.size,
    inline,
    word: "w",
  };
};

/**
 * A run as a review draws it: its marks, the formats around its text (bold, italic, underline,
 * strike, sub, super); its link, none where no `a` holds it, and an `a`'s address, none where it
 * has none; and its text.
 */
interface ReviewRun {
  readonly link: Option.Option<Option.Option<string>>;
  readonly marks: ReadonlySet<string>;
  readonly text: string;
}

/**
 * A line as a review draws it: its alignment and indent, from `data-align` and `data-indent`; its
 * block, a list's element and its item, or the block's own element; and its runs.
 */
interface ReviewLine {
  readonly align: Option.Option<string>;
  readonly block: string;
  readonly indent: number;
  readonly runs: readonly ReviewRun[];
}

/**
 * The mark a review's element draws, by its name, a span by its data attribute.
 *
 * @param node The element.
 * @returns The mark; none for a link, which is no mark.
 */
const markOf = (node: XmlElement): Option.Option<string> => {
  switch (node.local) {
    case "strong": {
      return Option.some("bold");
    }
    case "em": {
      return Option.some("italic");
    }
    case "sub":
    case "sup": {
      return Option.some(node.local === "sub" ? "sub" : "super");
    }
    case "span": {
      return Option.some(
        Option.isSome(attributeOf(node, "data-underline")) ? "underline" : "strike",
      );
    }
    default: {
      return Option.none();
    }
  }
};

/**
 * Read a run of a review's line from one of its children: its marks and link down to its text.
 *
 * @param child The child.
 * @returns The run.
 */
const reviewRunOf = (child: Child): ReviewRun => {
  const marks: string[] = [];
  let link: Option.Option<Option.Option<string>> = Option.none();
  let node = child;

  while (node.kind === "element") {
    const mark = markOf(node);

    if (Option.isSome(mark)) {
      marks.push(mark.value);
    }

    if (node.local === "a") {
      link = Option.some(attributeOf(node, "href"));
    }

    const [only, ...others] = node.children;

    if (only === undefined || others.length > 0) {
      return assert.fail(`${node.local} holds other than one child`);
    }

    node = only;
  }

  return { link, marks: new Set(marks), text: node.kind === "text" ? node.value : "" };
};

/**
 * Read a review's line from its block.
 *
 * @param block The block: a `p`, an `h1` to `h3`, or a list's `li`.
 * @param list The list's element, none for a block of its own.
 * @returns The line.
 */
const reviewLineOf = (block: XmlElement, list: Option.Option<string>): ReviewLine => {
  const [first] = block.children;
  const empty = block.children.length === 1 && first?.kind === "element" && first.local === "br";

  return {
    align: attributeOf(block, "data-align"),
    block: Option.match(list, { onNone: () => block.local, onSome: (name) => `${name} li` }),
    indent: Option.match(attributeOf(block, "data-indent"), { onNone: () => 0, onSome: Number }),
    runs: empty ? [] : block.children.map(reviewRunOf),
  };
};

/**
 * Read the lines a review's answer part draws.
 *
 * @param markup The answer part's markup, none where the review draws no answer part.
 * @returns The lines; fails where crust's reader refuses the markup.
 */
const reviewRead = (markup: string | undefined) =>
  Effect.map(fragmentOf(markup ?? assert.fail("the review draws no answer part")), (children) =>
    elementsIn(children).flatMap((block): readonly ReviewLine[] =>
      block.local === "ol" || block.local === "ul"
        ? elementsIn(block.children).map((item) => reviewLineOf(item, Option.some(block.local)))
        : [reviewLineOf(block, Option.none())],
    ),
  );

/**
 * The protocols a review keeps a link's address under: Quill's own link keeps only these.
 */
const keptProtocols: ReadonlySet<string> = new Set(["http:", "https:", "mailto:"]);

/**
 * The address a review gives a link: the link as the URL standard serializes it, where its
 * protocol is one a review keeps.
 *
 * @param link The link, as the document holds it.
 * @returns The address; none where the review keeps none.
 */
const keptAddress = (link: string): Option.Option<string> =>
  Option.flatMap(Option.fromNullishOr(URL.parse(link)), (url) =>
    keptProtocols.has(url.protocol) ? Option.some(url.href) : Option.none(),
  );

/**
 * Give the block a line's format writes in review: its list's `ol` or `ul` with its `li`, its
 * header's `h1` to `h6`, or a paragraph.
 *
 * @param format The line's format.
 * @returns The block's elements, as {@link ReviewLine} names them.
 */
const reviewBlockOf = (format: LineFormat): string => {
  if (format.list !== undefined) {
    return `${format.list === "ordered" ? "ol" : "ul"} li`;
  }

  return format.header === undefined ? "p" : `h${String(format.header)}`;
};

/**
 * The lines RT4's rules give a review of a document plate wrote: each line its block, alignment
 * and indent, each run its marks, its text and its link's kept address.
 *
 * @param document The document.
 * @returns The lines.
 */
const reviewExpected = (document: readonly Line[]): readonly ReviewLine[] =>
  document.map(({ format, runs }) => ({
    align: Option.fromUndefinedOr(format.align),
    block: reviewBlockOf(format),
    indent: format.indent,
    runs: runs.map(({ format: run, text }) => ({
      link: run.link === undefined ? Option.none() : Option.some(keptAddress(run.link)),
      marks: new Set([
        ...(run.bold ? ["bold"] : []),
        ...(run.italic ? ["italic"] : []),
        ...(run.underline ? ["underline"] : []),
        ...(run.strike ? ["strike"] : []),
        ...(run.script === undefined ? [] : [run.script]),
      ]),
      text,
    })),
  }));

/**
 * What a document of RT4's search reaches.
 */
type ReviewSituation = "dropped link" | "empty line" | "kept link" | "list" | "set apart";

/**
 * Name what a document of RT4's search reaches: a link a review keeps and one it drops, an empty
 * line, a list, and a line set apart by its alignment or indent.
 *
 * @param document The document.
 * @returns Each situation it reaches.
 */
const reviewSituationsOf = (document: readonly Line[]): readonly ReviewSituation[] =>
  document.flatMap(({ format, runs }): readonly ReviewSituation[] => [
    ...(runs.length === 0 ? ["empty line" as const] : []),
    ...(format.list === undefined ? [] : ["list" as const]),
    ...(format.align === undefined && format.indent === 0 ? [] : ["set apart" as const]),
    ...runs.flatMap(({ format: run }): readonly ReviewSituation[] =>
      run.link === undefined
        ? []
        : [Option.isSome(keptAddress(run.link)) ? "kept link" : "dropped link"],
    ),
  ]);

/**
 * What makes a paragraph one plate did not write: an attribute the essay never writes on its `p`,
 * or an inline element the essay never writes around its runs.
 */
type ForeignMark =
  | { readonly attribute: ' style="color: red"' | ' onclick="steal()"'; readonly kind: "attribute" }
  | { readonly kind: "element"; readonly name: "b" | "font" };

/**
 * Draw what makes RT4's foreign paragraphs foreign ({@link ForeignMark}).
 */
const foreignMarks: Gen<ForeignMark> = (source) =>
  boolean(source)
    ? {
        attribute: element([' style="color: red"', ' onclick="steal()"'] as const)(source),
        kind: "attribute",
      }
    : { kind: "element", name: element(["b", "font"] as const)(source) };

/**
 * A value of RT4's foreign search: what makes it foreign, and each of its paragraphs' runs, at
 * least one run of at least one character each.
 */
interface Foreign {
  readonly mark: ForeignMark;
  readonly paragraphs: readonly (readonly Run[])[];
}

/**
 * Draw a value of RT4's foreign search: a mark of {@link foreignMarks} and one to three
 * paragraphs, each of one to three runs of {@link runFormats} and one to five of the characters
 * {@link runTexts} draws from, held as the editor holds them.
 */
const foreignValues: Gen<Foreign> = (source) => ({
  mark: foreignMarks(source),
  paragraphs: array(
    (each) =>
      held(
        array(
          (one): Run => ({
            format: runFormats(one),
            text: string(characterOf(["a", "b", " ", "\t", "&", "<", ">", '"', "'", "é", "😀"]), {
              max: 5,
              min: 1,
            })(one),
          }),
          { max: 3, min: 1 },
        )(each),
      ),
    { max: 3, min: 1 },
  )(source),
});

/**
 * Write a value of RT4's foreign search: each paragraph a `p` holding the runs as plate writes a
 * plain line's, the `p` carrying the foreign attribute or the runs inside the foreign element.
 *
 * @param value The value.
 * @returns Its XHTML.
 */
const foreignXhtml = ({ mark, paragraphs }: Foreign): string =>
  paragraphs
    .map((runs) => {
      const inline = xhtmlOfLines([{ format: plainLine, runs }]).slice(
        "<p>".length,
        -"</p>".length,
      );

      return mark.kind === "attribute"
        ? `<p${mark.attribute}>${inline}</p>`
        : `<p><${mark.name}>${inline}</${mark.name}></p>`;
    })
    .join("");

/**
 * What a value of RT4's foreign search reaches: a foreign attribute, a foreign element, and
 * several paragraphs.
 */
type ForeignSituation = "attribute" | "element" | "several paragraphs";

/**
 * Read a value's paragraphs' texts with crust's reader: each `p`'s text nodes, in document order.
 *
 * @param value The value, a sequence of `p` elements.
 * @returns Each paragraph's text.
 */
const paragraphTextsOf = (value: string) =>
  Effect.map(fragmentOf(value), (children) =>
    elementsIn(children).map((paragraph) => textIn(paragraph.children)),
  );

/**
 * The characters an answer of RT5's rich search is written with: letters, a space, a tab and a
 * no-break space, which JavaScript's `\s` holds, punctuation and a digit, which stand inside a
 * word, and a zero-width space, which the rich count drops.
 */
const COUNT_ALPHABET = ["a", "b", " ", "\t", "\u00A0", "'", "-", "3", "?", "\u200B"] as const;

/**
 * Draw an answer of RT5's rich search: one to four paragraphs or list items, each of up to three
 * runs of up to five of {@link COUNT_ALPHABET}, held as the editor holds them.
 */
const countDocuments: Gen<readonly Line[]> = array(
  (source): Line => ({
    format: { ...plainLine, list: element([undefined, "ordered", "bullet"] as const)(source) },
    runs: held(
      array(
        (each): Run => ({
          format: runFormats(each),
          text: string(characterOf(COUNT_ALPHABET), { max: 5, min: 0 })(each),
        }),
        { max: 3, min: 0 },
      )(source),
    ),
  }),
  { max: 4, min: 1 },
);

/**
 * Draw an answer of RT5's plain search: up to eight of {@link COUNT_ALPHABET} and a line feed.
 */
const plainAnswers: Gen<string> = string(characterOf([...COUNT_ALPHABET, "\n"]), {
  max: 8,
  min: 0,
});

/**
 * A word, as AlphaTest's count reads one: a run of anything but JavaScript's `\s`.
 */
const wordRun = regex("\\S+", "gu");

/**
 * Count a text's words ({@link wordRun}).
 *
 * @param text The text.
 * @returns How many it holds.
 */
const wordsIn = (text: string): number => [...text.matchAll(wordRun)].length;

/**
 * What a count says of a number of words, as the catalog gives it.
 *
 * @param words The number.
 * @returns The count's text.
 */
const countOf = (words: number): string =>
  words === 1 ? countWords.one : countWords.other.replace("{n}", String(words));

/**
 * What an answer of RT5's searches reaches.
 */
type CountSituation =
  | "no-break space"
  | "nothing typed"
  | "one word"
  | "several words"
  | "zero-width space";

/**
 * Name what an answer of RT5's searches reaches: nothing typed, one word or several, a no-break
 * space and a zero-width space.
 *
 * @param typed Whether anything was typed.
 * @param text The answer's text.
 * @param words How many words it holds.
 * @returns Each situation it reaches.
 */
const countSituationsOf = (
  typed: boolean,
  text: string,
  words: number,
): readonly CountSituation[] => [
  ...(typed ? [] : ["nothing typed" as const]),
  ...(words === 1 ? ["one word" as const] : []),
  ...(words > 1 ? ["several words" as const] : []),
  ...(text.includes("\u00A0") ? ["no-break space" as const] : []),
  ...(text.includes("\u200B") ? ["zero-width space" as const] : []),
];

describe("the rich-text essay's value", () => {
  it.effect(
    `RT1: every line of one word, under every combination of the toolbar's formats, writes each format's element or class once and no other, and reads back as its line: ${String(ONE_WORD_LINES)} lines`,
    (ctx) =>
      Effect.andThen(
        boxHolds(oneWordLine, ONE_WORD_LINES),
        searched(
          ctx,
          exhaust(
            {
              box: "every line of the word w under every run format (bold, italic, underline and strike each on or off, a script of two or none, a link of three or none) and every line format (a paragraph, a header of 1 to 3 or a list of either kind, an alignment of three or none, an indent of 0 to 5)",
              caseHang: "30 seconds",
              concurrency: availableParallelism(),
              coverage: noCoverage,
              generator: oneWordLine,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "QTI 3.0.1's HTML elements and shared vocabulary for each of AlphaTest's toolbar's commands, as the module states them: a header h1 to h3, a list an ol or ul of li, bold strong, italic em, a script sub or sup, a link a href, underline the vocabulary's qti-underline span, alignment and indent its qti-align and qti-margin-s classes, and strike and justify plate's own plate-strike span and plate-align-justify class, for which QTI has none; read by crust's reader",
              },
              suite: "plate-ui/rich-text/commands",
            },
            (word) =>
              Effect.gen(function* writesEachCommand() {
                const line = lineOf(word);
                const xhtml = xhtmlOfLines([line]);

                assert.deepStrictEqual(yield* lineXhtmlOf(xhtml), lineXhtmlExpected(word), xhtml);
                assert.isTrue(sameDocument(linesOfXhtml(xhtml), [line]), `${xhtml} reads back`);
              }),
          ),
        ),
      ),
  );

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

  it.effect(
    "RT4: a review draws every document plate writes as the document, each link's address kept only for http, https and mailto",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang: "30 seconds",
            coverage: required<ReviewSituation>(
              ["dropped link", "empty line", "kept link", "list", "set apart"],
              { cases: 200, sense: notesOnly },
            ),
            draw: drawn(documents),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "specification",
              name: "AlphaTest's review, its editor read-only (ExtendedTextInteraction.tsx lines 296-300 and 831-841): each line its block, each run its format's elements, an empty line a break, alignment and indent as data-align and data-indent, underline and strike as data-underline and data-strike spans; a link's address kept as the URL standard serializes it where its protocol is http, https or mailto, as Quill's link keeps one, and dropped otherwise; read by crust's reader",
            },
            runs: 200,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "plate-ui/rich-text/review",
          },
          (document, c) =>
            Effect.gen(function* reviewsTheDocument() {
              c.noteAll(reviewSituationsOf(document));

              const xhtml = xhtmlOfLines(document);

              assert.deepStrictEqual(
                yield* reviewRead(yield* reviewOf(xhtml)),
                reviewExpected(document),
                xhtml,
              );
            }),
        ),
      ),
  );

  it.effect(
    "RT4: a review draws a value plate did not write as its text, its paragraphs parted by a blank line",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang: "30 seconds",
            coverage: required<ForeignSituation>(["attribute", "element", "several paragraphs"], {
              cases: 200,
              sense: notesOnly,
            }),
            draw: drawn(foreignValues),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "specification",
              name: "the rule for a value plate did not write (@qti-pie/plate's textOfXhtml, as its module states it): its text, its paragraphs parted by a blank line, its other markup dropped and its references resolved, a line of the review to each line of it with no format; each paragraph's text read by crust's reader",
            },
            runs: 200,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "plate-ui/rich-text/foreign",
          },
          (foreign, c) =>
            Effect.gen(function* reviewsItsText() {
              c.note(foreign.mark.kind);
              if (foreign.paragraphs.length > 1) {
                c.note("several paragraphs");
              }

              const value = foreignXhtml(foreign);

              assert.isFalse(isWritten(value), `${value} is one plate writes`);

              const texts = yield* paragraphTextsOf(value);

              assert.deepStrictEqual(
                yield* reviewRead(yield* reviewOf(value)),
                texts
                  .join("\n\n")
                  .split("\n")
                  .map((line): ReviewLine => ({
                    align: Option.none(),
                    block: "p",
                    indent: 0,
                    runs:
                      line === "" ? [] : [{ link: Option.none(), marks: new Set(), text: line }],
                  })),
                value,
              );
            }),
        ),
      ),
  );

  it.effect(
    "RT5: the count under the rich editor and its review says how many words the answer holds",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang: "30 seconds",
            coverage: required<CountSituation>(
              ["no-break space", "nothing typed", "one word", "several words", "zero-width space"],
              { cases: 200, sense: notesOnly },
            ),
            draw: drawn(option(countDocuments)),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "specification",
              name: "AlphaTest's count under the editor (ExtendedTextInteraction.tsx line 848), 1 word or N words: a word a run of anything but JavaScript's \\s on the answer's text, a paragraph's and a list item's end a space, a zero-width space nothing; a review counts as the editor did",
            },
            runs: 200,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "plate-ui/rich-text/count",
          },
          (answer, c) =>
            Effect.gen(function* countsTheWords() {
              const xhtml = Option.match(answer, { onNone: () => "", onSome: xhtmlOfLines });
              const text = Option.match(answer, {
                onNone: () => "",
                onSome: (lines) =>
                  lines.map((line) => line.runs.map((run) => run.text).join("")).join(" "),
              });
              const words = wordsIn(text.replaceAll("\u200B", ""));

              c.noteAll(countSituationsOf(Option.isSome(answer), text, words));
              assert.strictEqual(islandCount(richIsland, xhtml), countOf(words), xhtml);
              if (Option.isSome(answer)) {
                assert.strictEqual(countIn(yield* reviewHtml(xhtml)), countOf(words), xhtml);
              }
            }),
        ),
      ),
  );

  it.effect(
    "RT5: the count under a plain essay's box says how many words the answer holds, a zero-width space a word's",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang: "30 seconds",
            coverage: required<CountSituation>(
              ["no-break space", "nothing typed", "one word", "several words", "zero-width space"],
              { cases: 200, sense: notesOnly },
            ),
            draw: drawn(plainAnswers),
            kept: [],
            literal: (text) => JSON.stringify(text),
            oracle: {
              kind: "specification",
              name: "AlphaTest's count under the textarea (ExtendedTextInteraction.tsx line 848), 1 word or N words: a word a run of anything but JavaScript's \\s on the answer's text, a zero-width space a character of its word, typed",
            },
            runs: 200,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "plate-ui/rich-text/plain-count",
          },
          (text, c) =>
            Effect.sync(() => {
              const words = wordsIn(text);

              c.noteAll(countSituationsOf(text !== "", text, words));
              assert.strictEqual(
                islandCount(plainIsland, text),
                countOf(words),
                JSON.stringify(text),
              );
            }),
        ),
      ),
  );
});
