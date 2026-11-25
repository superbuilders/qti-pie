/**
 * The rich-text essay's value: what Quill's document (its Delta) is posted as, and read back from.
 * A `qti-extended-text-interaction` of `format="xhtml"` "is text marked up in XHTML" (QTI 3.0.1
 * information model §8.42), and plate answers it in Quill, AlphaTest's player's editor
 * (mastery-track-player 941a86a, Quill 2.0.3, `ExtendedTextInteraction.tsx` lines 296–314), whose
 * DOM is no XHTML QTI admits (a bullet list as an `ol` of `li data-list="bullet"`, its own `ql-*`
 * classes, `u` and `s`, none of which QTI 3.0.1's HTML holds). So plate posts its own writing of
 * Quill's document, never Quill's DOM, and reads it back to restore the editor.
 *
 * The document is {@link Line}s, each a block of {@link Run}s of text, as Quill's Delta holds it:
 * a line's format rides on the line feed that ends it, a run's on its text. Each of AlphaTest's
 * toolbar's commands writes one thing:
 *
 * - A header of level 1 to 3: `h1` to `h3`; a line of none: `p`;
 * - An ordered or a bullet list: an `ol` or `ul` of `li`, one list for each run of lines of one kind;
 * - Align center or right: QTI's shared vocabulary's `qti-align-center` or `qti-align-right`;
 *   justify, which the vocabulary has no class for: plate's `plate-align-justify`;
 * - Indent 1 to 5: the vocabulary's `qti-margin-s-1` to `qti-margin-s-5`, on a paragraph, a header or
 *   a list's item alike, a list never nested; Quill's editor indents no further than 5
 *   ({@link indentLevels});
 * - Bold: `strong`; italic: `em`; underline: `span class="qti-underline"`; strike, which QTI has
 *   neither element nor class for: `span class="plate-strike"`; subscript and superscript: `sub`
 *   and `sup`; a link: `a href`;
 * - Clean: no format.
 *
 * A run's elements stand in one order, outermost first: `a`, `sub` or `sup`, `strong`, `em`, the
 * underline's `span`, the strike's `span`. An empty line is an element with nothing in it. Text is
 * escaped (`&`, `<`, `>`, and `"` in an attribute), and a character XML cannot hold is left out, so
 * writing and reading are inverse on every document of XML's characters ({@link xhtmlOfLines},
 * {@link linesOfXhtml}).
 *
 * A value plate did not write this way, such as an essay the plain textarea posted before, reads as
 * its text, a line to each of its lines (`textOfXhtml`), with no format.
 *
 * The module is pure, and imported by the island and the server shell alike.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#DerivedEnum_TextFormatEnum
 */
import { regex } from "arkregex";
import { Array as Arr, Option, pipe } from "effect";
import type { Op } from "quill";
import { textOfXhtml } from "#plate/interactions/xhtml-text.ts";

/**
 * The indents a line may take: none, or 1 to 5, as the shared vocabulary's start margins run.
 */
export const indentLevels = [0, 1, 2, 3, 4, 5] as const;

/**
 * What the rich-text essay does otherwise than AlphaTest's, each by what AlphaTest did, the lines
 * of `ExtendedTextInteraction.tsx` (mastery-track-player 941a86a) that did it, and what plate does:
 * each fate counted once (edullm-bd's rulings, 2026-11-22). Measured in Chrome on a rich essay of
 * AlphaTest's: nine presses of indent gave AlphaTest `ql-indent-8` and give plate `qti-margin-s-5`;
 * a paste of a coloured word, a bold word and a picture keeps the bold word alone. A count differs
 * only at a block's end: within a block both split on JavaScript's `\s` alone, so a hyphenated
 * word, a number, a contraction and a mark of punctuation standing alone each count as AlphaTest
 * counted them, one word; a count never falls below AlphaTest's, so no word minimum refuses an
 * answer AlphaTest's count let through.
 */
export const richTextFates = [
  {
    alphaTest: "an indent up to Quill's own 8 deep",
    lines: "307",
    plate: "an indent 5 deep at most, the shared vocabulary's deepest start margin",
  },
  {
    alphaTest: "a paste keeping whatever Quill holds, a picture and a colour among it",
    lines: "296–313",
    plate: "the toolbar's formats alone: a pasted picture and colour left out, bold kept",
  },
  {
    alphaTest: "the editor's DOM posted: its ql-* classes, u and s, a bullet list as an ol",
    lines: "322–336",
    plate: "plate's XHTML of the editor's document, inside QTI 3.0.1's HTML",
  },
  {
    alphaTest: "the editor's text in Quill's sheet's 13 px Helvetica",
    lines: "11",
    plate: "the editor's text in the item's font, size and line height",
  },
  {
    alphaTest:
      "the words either side of a paragraph's, a header's or a list item's end counted as one word: the editor's DOM read by textContent, which joins its blocks with nothing between, so an answer of a sentence and a two-item list counted 11 ('everyone.Plant', 'seedsWater')",
    lines: "427–452",
    plate:
      "each block's end a space, as AlphaTest's own plain essay read a line's end: 13 words, 'Plant seeds' and 'Water plants' four words, as a parent counts them",
  },
] as const;

/**
 * A line's indent, one of {@link indentLevels}.
 */
export type Indent = (typeof indentLevels)[number];

/**
 * A run's format: each of the toolbar's inline commands, on or off, its script and its link.
 */
export interface RunFormat {
  readonly bold: boolean;
  readonly italic: boolean;
  readonly link: string | undefined;
  readonly script: "sub" | "super" | undefined;
  readonly strike: boolean;
  readonly underline: boolean;
}

/**
 * A run of text in one format.
 */
export interface Run {
  readonly format: RunFormat;
  readonly text: string;
}

/**
 * A line's format: its alignment, its header level, its indent and its list.
 */
export interface LineFormat {
  readonly align: "center" | "justify" | "right" | undefined;
  readonly header: 1 | 2 | 3 | undefined;
  readonly indent: Indent;
  readonly list: "bullet" | "ordered" | undefined;
}

/**
 * A line: its runs, in order, and its format.
 */
export interface Line {
  readonly format: LineFormat;
  readonly runs: readonly Run[];
}

/**
 * The format of plain text.
 */
export const plainRun: RunFormat = {
  bold: false,
  italic: false,
  link: undefined,
  script: undefined,
  strike: false,
  underline: false,
};

/**
 * The format of a plain paragraph.
 */
export const plainLine: LineFormat = {
  align: undefined,
  header: undefined,
  indent: 0,
  list: undefined,
};

/**
 * The value of one of a Delta operation's attributes, as Quill types it.
 */
type AttributeValue = NonNullable<Op["attributes"]>[string];

/**
 * Tell whether an attribute's value is text, as a link's is.
 *
 * @param value The value.
 * @returns Whether it is text.
 */
const isTextValue = (value: AttributeValue): value is string => typeof value === "string";

/**
 * Tell whether a Delta's insert is text, not an embed.
 *
 * @param insert The insert.
 * @returns Whether it is text.
 */
const isText = (insert: Op["insert"]): insert is string => typeof insert === "string";

/**
 * Read one of a closed set of values from an attribute, none when it holds another.
 *
 * @param values The set.
 * @param value The attribute's value.
 * @returns The value, if it is one of the set.
 */
const oneOf = <A>(values: readonly A[], value: AttributeValue): A | undefined =>
  values.find((each) => each === value);

/**
 * Read a run's format from its Delta attributes: every format the toolbar has, and nothing else.
 *
 * @param attributes The attributes.
 * @returns The format.
 */
const runFormatOf = (attributes: Op["attributes"]): RunFormat => ({
  bold: attributes?.["bold"] === true,
  italic: attributes?.["italic"] === true,
  link: isTextValue(attributes?.["link"]) ? attributes["link"] : undefined,
  script: oneOf(["sub", "super"] as const, attributes?.["script"]),
  strike: attributes?.["strike"] === true,
  underline: attributes?.["underline"] === true,
});

/**
 * Read a line's format from the Delta attributes of the line feed that ends it.
 *
 * @param attributes The attributes.
 * @returns The format.
 */
const lineFormatOf = (attributes: Op["attributes"]): LineFormat => ({
  align: oneOf(["center", "right", "justify"] as const, attributes?.["align"]),
  header: oneOf([1, 2, 3] as const, attributes?.["header"]),
  indent: oneOf(indentLevels, attributes?.["indent"]) ?? 0,
  list: oneOf(["ordered", "bullet"] as const, attributes?.["list"]),
});

/**
 * Tell whether two run formats are one.
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
 * Append a run to a line's runs, joined to the last where both share a format, an empty one left
 * out, so a document has one spelling.
 *
 * @param runs The runs so far.
 * @param run The run.
 * @returns The runs.
 */
const appended = (runs: readonly Run[], run: Run): readonly Run[] =>
  pipe(
    Arr.last(runs),
    Option.filter((last) => sameRunFormat(last.format, run.format)),
    Option.match({
      onNone: () => (run.text === "" ? runs : [...runs, run]),
      onSome: (last) => [...runs.slice(0, -1), { format: last.format, text: last.text + run.text }],
    }),
  );

/**
 * Read Quill's Delta into lines: each line feed ends a line, in its attributes' format, and the
 * text before it, run by run, is the line's. An embed, which the editor's formats never make, is
 * left out.
 *
 * @param ops The Delta's operations, every one an insert, as a document's are.
 * @returns The lines.
 */
export const linesOfOps = (ops: readonly Op[]): readonly Line[] => {
  const lines: Line[] = [];
  let runs: readonly Run[] = [];

  for (const op of ops) {
    if (!isText(op.insert)) {
      continue;
    }

    const [first = "", ...rest] = op.insert.split("\n");

    runs = appended(runs, { format: runFormatOf(op.attributes), text: first });

    for (const piece of rest) {
      lines.push({ format: lineFormatOf(op.attributes), runs });
      runs = appended([], { format: runFormatOf(op.attributes), text: piece });
    }
  }

  return runs.length === 0 ? lines : [...lines, { format: plainLine, runs }];
};

/**
 * Write a run's format as Delta attributes: each format on, and none off.
 *
 * @param format The format.
 * @returns The attributes, undefined for plain text.
 */
const runAttributes = (format: RunFormat): Op["attributes"] => {
  const attributes: Record<string, boolean | string> = {};

  if (format.bold) {
    attributes["bold"] = true;
  }

  if (format.italic) {
    attributes["italic"] = true;
  }

  if (format.link !== undefined) {
    attributes["link"] = format.link;
  }

  if (format.script !== undefined) {
    attributes["script"] = format.script;
  }

  if (format.strike) {
    attributes["strike"] = true;
  }

  if (format.underline) {
    attributes["underline"] = true;
  }

  return Object.keys(attributes).length === 0 ? undefined : attributes;
};

/**
 * Write a line's format as the Delta attributes of its line feed.
 *
 * @param format The format.
 * @returns The attributes, undefined for a plain paragraph.
 */
const lineAttributes = (format: LineFormat): Op["attributes"] => {
  const attributes: Record<string, number | string> = {};

  if (format.align !== undefined) {
    attributes["align"] = format.align;
  }

  if (format.header !== undefined) {
    attributes["header"] = format.header;
  }

  if (format.indent !== 0) {
    attributes["indent"] = format.indent;
  }

  if (format.list !== undefined) {
    attributes["list"] = format.list;
  }

  return Object.keys(attributes).length === 0 ? undefined : attributes;
};

/**
 * Give an operation its attributes only where it has some, as Quill writes one.
 *
 * @param insert The text.
 * @param attributes The attributes, undefined for none.
 * @returns The operation.
 */
const opOf = (insert: string, attributes: Op["attributes"]): Op =>
  attributes === undefined ? { insert } : { attributes, insert };

/**
 * Write lines as Quill's Delta, which the editor opens with.
 *
 * @param lines The lines.
 * @returns The Delta's operations.
 */
export const opsOfLines = (lines: readonly Line[]): readonly Op[] =>
  lines.flatMap((line) => [
    ...line.runs.map((run) => opOf(run.text, runAttributes(run.format))),
    opOf("\n", lineAttributes(line.format)),
  ]);

/**
 * Every code point XML 1.0 cannot hold (§2.2, `Char`), a lone surrogate among them.
 */
const notXmlCharacters = regex(
  "[^\t\n\r\\u0020-\\uD7FF\\uE000-\\uFFFD\\u{10000}-\\u{10FFFF}]",
  "gu",
);

/**
 * Escape a text for XML character data, and for an attribute's value in double quotes, leaving out
 * every character XML cannot hold, which no value can carry.
 *
 * @param text The text.
 * @returns The text, escaped.
 */
const escaped = (text: string): string =>
  text
    .replaceAll(notXmlCharacters, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/**
 * The class each alignment writes.
 */
const alignClasses = {
  center: "qti-align-center",
  justify: "plate-align-justify",
  right: "qti-align-right",
} as const;

/**
 * Write a line's block classes: its alignment's, then its indent's.
 *
 * @param format The line's format.
 * @returns The attribute, with its leading space, or nothing.
 */
const blockClass = (format: LineFormat): string => {
  const classes = [
    ...(format.align === undefined ? [] : [alignClasses[format.align]]),
    ...(format.indent === 0 ? [] : [`qti-margin-s-${String(format.indent)}`]),
  ];

  return classes.length === 0 ? "" : ` class="${classes.join(" ")}"`;
};

/**
 * Write a run: its text inside its format's elements, the outermost first.
 *
 * @param run The run.
 * @returns The XHTML.
 */
const runXhtml = ({ format, text }: Run): string => {
  let written = escaped(text);

  if (format.strike) {
    written = `<span class="plate-strike">${written}</span>`;
  }

  if (format.underline) {
    written = `<span class="qti-underline">${written}</span>`;
  }

  if (format.italic) {
    written = `<em>${written}</em>`;
  }

  if (format.bold) {
    written = `<strong>${written}</strong>`;
  }

  if (format.script !== undefined) {
    const element = format.script === "sub" ? "sub" : "sup";

    written = `<${element}>${written}</${element}>`;
  }

  return format.link === undefined ? written : `<a href="${escaped(format.link)}">${written}</a>`;
};

/**
 * Write lines as the XHTML the essay posts: each line a block, a run of list lines of one kind one
 * list (the module's rules).
 *
 * @param lines The lines.
 * @returns The XHTML, a fragment of flow content.
 */
export const xhtmlOfLines = (lines: readonly Line[]): string => {
  let written = "";
  let open: "bullet" | "ordered" | undefined;

  for (const { format, runs } of lines) {
    const content = runs.map(runXhtml).join("");

    if (open !== undefined && open !== format.list) {
      written += open === "ordered" ? "</ol>" : "</ul>";
      open = undefined;
    }

    if (format.list === undefined) {
      const element = format.header === undefined ? "p" : `h${String(format.header)}`;

      written += `<${element}${blockClass(format)}>${content}</${element}>`;
    } else {
      if (open === undefined) {
        written += format.list === "ordered" ? "<ol>" : "<ul>";
        open = format.list;
      }

      written += `<li${blockClass(format)}>${content}</li>`;
    }
  }

  if (open !== undefined) {
    written += open === "ordered" ? "</ol>" : "</ul>";
  }

  return written;
};

/**
 * One token of plate's XHTML: an element's start or end, or text.
 */
type Token =
  | { readonly attributes: string; readonly kind: "start"; readonly name: string }
  | { readonly kind: "end"; readonly name: string }
  | { readonly kind: "text"; readonly text: string };

/**
 * The tokens of plate's XHTML: an element's start or end tag, with its attributes in double
 * quotes, or a run of text.
 */
const tokenPattern = regex(
  '<(?<slash>/?)(?<name>[a-z0-9]+)(?<attributes>(?:\\s+[a-z]+="[^"<]*")*)\\s*>|(?<text>[^<]+)',
  "gu",
);

/**
 * Read plate's XHTML into tokens: none when it holds anything else, a self-closed tag or a
 * comment among them.
 *
 * @param xhtml The XHTML.
 * @returns The tokens.
 */
const tokensOf = (xhtml: string): Option.Option<readonly Token[]> => {
  const tokens: Token[] = [];
  let read = 0;

  for (const match of xhtml.matchAll(tokenPattern)) {
    if (match.index !== read) {
      return Option.none();
    }

    read += match[0].length;
    const { attributes = "", name = "", slash = "", text } = match.groups ?? {};

    if (text !== undefined) {
      tokens.push({ kind: "text", text });
    } else if (slash === "/") {
      tokens.push({ kind: "end", name });
    } else {
      tokens.push({ attributes, kind: "start", name });
    }
  }

  return read === xhtml.length ? Option.some(tokens) : Option.none();
};

/**
 * The references plate's escaping writes, by what each stands for.
 */
const references: ReadonlyMap<string, string> = new Map([
  ["&amp;", "&"],
  ["&gt;", ">"],
  ["&lt;", "<"],
  ["&quot;", '"'],
]);

/**
 * Resolve the references of a text plate escaped: none when it holds another.
 *
 * @param text The text.
 * @returns The text, resolved.
 */
const unescaped = (text: string): Option.Option<string> => {
  const parts = text.split(regex("(?<reference>&[^;]*;)", "u"));

  return parts.every((part, at) => at % 2 === 0 || references.has(part))
    ? Option.some(
        parts.map((part, at) => (at % 2 === 0 ? part : (references.get(part) ?? ""))).join(""),
      )
    : Option.none();
};

/**
 * Read a start tag's attributes, each name with its value resolved.
 *
 * @param attributes The tag's attribute text.
 * @returns The attributes, none when a value holds a reference plate does not write.
 */
const attributesOf = (attributes: string): Option.Option<ReadonlyMap<string, string>> =>
  Option.map(
    Option.all(
      [...attributes.matchAll(regex('(?<name>[a-z]+)="(?<value>[^"]*)"', "gu"))].map((match) =>
        Option.map(
          unescaped(match.groups?.["value"] ?? ""),
          (resolved) => [match.groups?.["name"] ?? "", resolved] as const,
        ),
      ),
    ),
    (pairs) => new Map(pairs),
  );

/**
 * Read a block's classes into its alignment and indent: none when it holds a class plate does not
 * write.
 *
 * @param classes The `class` attribute, empty when absent.
 * @returns The alignment and indent.
 */
const blockFormatOf = (classes: string): Option.Option<Pick<LineFormat, "align" | "indent">> => {
  let align: LineFormat["align"];
  let indent: Indent = 0;

  for (const name of classes.split(" ").filter((each) => each !== "")) {
    const aligned = Arr.findFirst(
      ["center", "right", "justify"] as const,
      (each) => alignClasses[each] === name,
    );
    const indented = indentLevels.find(
      (each) => each > 0 && name === `qti-margin-s-${String(each)}`,
    );

    if (Option.isSome(aligned)) {
      align = aligned.value;
    } else if (indented === undefined) {
      return Option.none();
    } else {
      indent = indented;
    }
  }

  return Option.some({ align, indent });
};

/**
 * The run format each inline element and class of plate's turns on.
 */
const inlineFormats: ReadonlyMap<string, Partial<RunFormat>> = new Map([
  ["em", { italic: true }],
  ["span plate-strike", { strike: true }],
  ["span qti-underline", { underline: true }],
  ["strong", { bold: true }],
  ["sub", { script: "sub" }],
  ["sup", { script: "super" }],
]);

/**
 * Where a reading of plate's XHTML stands: the lines read, the list and the block open, the open
 * block's runs, the formats of the inline elements open, and the names of every element open, the
 * innermost last.
 */
interface Reading {
  block: LineFormat | undefined;
  readonly ends: string[];
  readonly formats: RunFormat[];
  readonly lines: Line[];
  list: LineFormat["list"];
  runs: readonly Run[];
}

/**
 * The elements a line is.
 */
const blockElements: ReadonlySet<string> = new Set(["h1", "h2", "h3", "li", "p"]);

/**
 * Read a run of text into the open block, in the open inline elements' format.
 *
 * @param reading The reading.
 * @param text The text, as written.
 * @returns Whether it is plate's: text inside a block, with only plate's references.
 */
const readText = (reading: Reading, text: string): boolean =>
  Option.match(unescaped(text), {
    onNone: () => false,
    onSome: (resolved) => {
      if (reading.block === undefined) {
        return false;
      }

      reading.runs = appended(reading.runs, {
        format: reading.formats.at(-1) ?? plainRun,
        text: resolved,
      });

      return true;
    },
  });

/**
 * Read an element's end: a block's ends its line, a list's the list, an inline element's its
 * format.
 *
 * @param reading The reading.
 * @param name The element's name.
 * @returns Whether it ends the element open.
 */
const readEnd = (reading: Reading, name: string): boolean => {
  if (reading.ends.pop() !== name) {
    return false;
  }

  if (blockElements.has(name) && reading.block !== undefined) {
    reading.lines.push({ format: reading.block, runs: reading.runs });
    reading.block = undefined;
    reading.runs = [];
  } else if (name === "ol" || name === "ul") {
    reading.list = undefined;
  } else {
    reading.formats.pop();
  }

  return true;
};

/**
 * Read a block's start: its line's format, from its element and its classes.
 *
 * @param reading The reading.
 * @param name The element's name.
 * @param attributes Its attributes.
 * @returns Whether it is plate's: outside every block, an item only in a list, classes plate
 *   writes.
 */
const readBlock = (
  reading: Reading,
  name: string,
  attributes: ReadonlyMap<string, string>,
): boolean => {
  const inList = name === "li";

  return Option.match(blockFormatOf(attributes.get("class") ?? ""), {
    onNone: () => false,
    onSome: (spacing) => {
      if (
        reading.block !== undefined ||
        inList !== (reading.list !== undefined) ||
        [...attributes.keys()].some((each) => each !== "class")
      ) {
        return false;
      }

      reading.block = {
        ...spacing,
        header: oneOf([1, 2, 3] as const, Number(name.slice(1))),
        list: inList ? reading.list : undefined,
      };

      return true;
    },
  });
};

/**
 * Read an inline element's start: its format, on top of the formats open.
 *
 * @param reading The reading.
 * @param name The element's name.
 * @param attributes Its attributes.
 * @returns Whether it is plate's: inside a block, a link with its `href` alone, or an element and
 *   class plate writes.
 */
const readInline = (
  reading: Reading,
  name: string,
  attributes: ReadonlyMap<string, string>,
): boolean => {
  const current = reading.formats.at(-1) ?? plainRun;
  const href = attributes.get("href");
  const classes = attributes.get("class");
  const turned = inlineFormats.get(classes === undefined ? name : `${name} ${classes}`);

  if (reading.block === undefined) {
    return false;
  }

  if (name === "a" && href !== undefined && attributes.size === 1) {
    reading.formats.push({ ...current, link: href });

    return true;
  }

  if (turned !== undefined && [...attributes.keys()].every((each) => each === "class")) {
    reading.formats.push({ ...current, ...turned });

    return true;
  }

  return false;
};

/**
 * Read an element's start.
 *
 * @param reading The reading.
 * @param name The element's name.
 * @param written Its attributes, as written.
 * @returns Whether it is plate's.
 */
const readStart = (reading: Reading, name: string, written: string): boolean =>
  Option.match(attributesOf(written), {
    onNone: () => false,
    onSome: (attributes) => {
      reading.ends.push(name);

      if (name === "ol" || name === "ul") {
        if (reading.list !== undefined || reading.block !== undefined || attributes.size > 0) {
          return false;
        }

        reading.list = name === "ol" ? "ordered" : "bullet";

        return true;
      }

      return blockElements.has(name)
        ? readBlock(reading, name, attributes)
        : readInline(reading, name, attributes);
    },
  });

/**
 * Read one token of a document: its text, an element's end or an element's start.
 *
 * @param reading The reading.
 * @param token The token.
 * @returns Whether it is plate's.
 */
const readToken = (reading: Reading, token: Token): boolean => {
  switch (token.kind) {
    case "text": {
      return readText(reading, token.text);
    }
    case "end": {
      return readEnd(reading, token.name);
    }
    case "start": {
      return readStart(reading, token.name, token.attributes);
    }
  }
};

/**
 * Read plate's XHTML back into lines: the inverse of {@link xhtmlOfLines} on every document it
 * writes; none for a value it did not write.
 *
 * @param xhtml The XHTML.
 * @returns The lines.
 */
const writtenLines = (xhtml: string): Option.Option<readonly Line[]> =>
  Option.flatMap(tokensOf(xhtml), (tokens) => {
    const reading: Reading = {
      block: undefined,
      ends: [],
      formats: [],
      lines: [],
      list: undefined,
      runs: [],
    };
    const read = tokens.every((token) => readToken(reading, token));

    return read && reading.ends.length === 0 ? Option.some(reading.lines) : Option.none();
  });

/**
 * Read an essay's value into the lines the editor opens with: plate's writing read back
 * ({@link writtenLines}), or, for a value it did not write, its text, a line to each line, with no
 * format; an empty value is one empty line, as an empty editor holds.
 *
 * @param xhtml The value.
 * @returns The lines.
 */
export const linesOfXhtml = (xhtml: string): readonly Line[] =>
  Option.getOrElse(writtenLines(xhtml), () =>
    textOfXhtml(xhtml)
      .split("\n")
      .map((text): Line => ({ format: plainLine, runs: appended([], { format: plainRun, text }) })),
  );

/**
 * Tell whether a value is plate's writing of a document, which reads back exactly.
 *
 * @param xhtml The value.
 * @returns Whether {@link linesOfXhtml} reads it as written.
 */
export const isWritten = (xhtml: string): boolean => Option.isSome(writtenLines(xhtml));
