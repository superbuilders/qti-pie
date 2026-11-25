/**
 * The oracle: the recursive writer, `write.ts` as it was at 56330e2c, the last commit before the
 * walks became iterative, but for names and comments and for the rules the writer has gained since,
 * which it follows: the doctype written and searched in its place in the prolog, which holds it
 * among the comments and processing instructions, and a `>` escaped where adjacent text runs make
 * `]]>`. It overflows the stack from about 2,000 levels, so the trees below stay far shallower. Its
 * escaping is the code under test's own, so what the differential proves is the walk: the order the
 * iterative writer visits, renders and searches a tree in, which is the writer's contract.
 *
 * @module
 */
import { availableParallelism } from "node:os";
import { assert, describe, it } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { noCoverage, required, requiredInSpace } from "@bjornpagen/testing/features";
import { array, element, int, map, oneOf } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Effect, Formatter, Option, Result } from "effect";
import { EncodeError } from "#crust/errors.ts";
import type { MiscHolder, WriteRefusal } from "#crust/errors.ts";
import { canonicalize } from "#crust/canonical.ts";
import { readXml } from "#crust/read.ts";
import { boxHolds } from "#crust/test/box.ts";
import {
  bare,
  caseHang,
  documentSituations,
  documentSituationsOf,
  generatedDocument,
  labelled,
  PLANE_TREES_TO_7,
  planeTreeUpTo,
} from "#crust/test/trees.ts";
import type { Bounds } from "#crust/test/trees.ts";
import type { Attribute, Child, Misc, Text, XmlDeclaration, XmlDocument } from "#crust/tree.ts";
import { writeXml, writeXmlText } from "#crust/write.ts";

/**
 * The characters an attribute value always escapes, with the reference each becomes.
 */
const attributeEscapes: ReadonlyMap<string, string> = new Map([
  ["&", "&amp;"],
  ["<", "&lt;"],
  ['"', "&quot;"],
  ["\t", "&#x9;"],
  ["\n", "&#xA;"],
  ["\r", "&#xD;"],
]);

/**
 * The text of a numeric character reference to `codePoint`.
 */
const characterReference = (codePoint: number): string =>
  `&#x${codePoint.toString(16).toUpperCase()};`;

/**
 * Whether `character` lies above the threshold.
 */
const isAbove = (character: string, threshold: number): boolean =>
  (character.codePointAt(0) ?? 0) > threshold;

/**
 * Escape an attribute value, each code point above `threshold` as a character reference.
 */
const escapeAttribute = (value: string, threshold: number): string => {
  let escaped = "";

  for (const character of value) {
    escaped += isAbove(character, threshold)
      ? characterReference(character.codePointAt(0) ?? 0)
      : (attributeEscapes.get(character) ?? character);
  }

  return escaped;
};

/**
 * Render an attribute value with each recorded reference as `&name;`.
 */
const renderValue = (attribute: Attribute, threshold: number): string => {
  let rendered = "";
  let position = 0;

  for (const reference of attribute.references) {
    rendered += escapeAttribute(attribute.value.slice(position, reference.offset), threshold);
    rendered += `&${reference.name};`;
    position = reference.offset + reference.name.length + 2;
  }

  return rendered + escapeAttribute(attribute.value.slice(position), threshold);
};

/**
 * Escape a plain text run, after a plain run that ends `before`.
 */
const escapeText = (value: string, threshold: number, before: string): string => {
  let escaped = "";
  let previous = before;

  for (const character of value) {
    if (isAbove(character, threshold)) {
      escaped += characterReference(character.codePointAt(0) ?? 0);
    } else if (character === "&") {
      escaped += "&amp;";
    } else if (character === "<") {
      escaped += "&lt;";
    } else if (character === ">" && previous.endsWith("]]")) {
      escaped += "&gt;";
    } else if (character === "\r") {
      escaped += "&#xD;";
    } else {
      escaped += character;
    }

    previous = (previous + character).slice(-2);
  }

  return escaped;
};

/**
 * One CDATA section, a `]]>` inside it split across two.
 */
const section = (value: string): string =>
  `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;

/**
 * Write a CDATA run, closed around each reference it needs.
 */
const renderCdata = (value: string, threshold: number): string => {
  let rendered = "";
  let current = "";

  for (const character of value) {
    if (isAbove(character, threshold) || character === "\r") {
      rendered += current === "" ? "" : section(current);
      rendered += characterReference(character.codePointAt(0) ?? 0);
      current = "";
    } else {
      current += character;
    }
  }

  return current === "" && rendered !== "" ? rendered : rendered + section(current);
};

/**
 * Render a node, an element by recursion.
 */
const renderNode = (node: Child, threshold: number): string => {
  if (node.kind === "text") {
    return node.cdata ? renderCdata(node.value, threshold) : escapeText(node.value, threshold, "");
  }

  if (node.kind === "comment") {
    return `<!--${node.text}-->`;
  }

  if (node.kind === "pi") {
    return `<?${node.target}${node.data === "" ? "" : ` ${node.data}`}?>`;
  }

  if (node.kind === "entityRef") {
    return `&${node.name};`;
  }

  const attributes = node.attributes
    .map((attribute) => ` ${attribute.qname}="${renderValue(attribute, threshold)}"`)
    .join("");

  if (node.children.length === 0) {
    return `<${node.qname}${attributes}/>`;
  }

  /**
   * A plain text run is escaped knowing the last two characters of the plain run just before it.
   */
  let before = "";
  const children = node.children
    .map((child) => {
      if (child.kind === "text" && !child.cdata) {
        const rendered = escapeText(child.value, threshold, before);
        before = (before + child.value).slice(-2);

        return rendered;
      }

      before = "";

      return renderNode(child, threshold);
    })
    .join("");

  return `<${node.qname}${attributes}>${children}</${node.qname}>`;
};

/**
 * Render the XML declaration.
 */
const renderDeclaration = (declaration: XmlDeclaration): string => {
  const encoding = Option.match(declaration.encoding, {
    onNone: () => "",
    onSome: (value) => ` encoding="${value}"`,
  });
  const standalone = Option.match(declaration.standalone, {
    onNone: () => "",
    onSome: (value) => ` standalone="${value}"`,
  });

  return `<?xml version="${declaration.version}"${encoding}${standalone}?>`;
};

/**
 * The first code point of `value` above `threshold`.
 */
const firstAbove = (value: string, threshold: number): number | undefined => {
  for (const character of value) {
    if (isAbove(character, threshold)) {
      return character.codePointAt(0);
    }
  }

  return undefined;
};

/**
 * An `EncodeError` for the first code point of `value` above `threshold`.
 */
const unwritable = (
  value: string,
  where: EncodeError["where"],
  threshold: number,
): EncodeError | undefined => {
  const codePoint = firstAbove(value, threshold);

  return codePoint === undefined ? undefined : new EncodeError({ codePoint, threshold, where });
};

/**
 * The first unwritable construct under `node`, by recursion.
 */
const findInNode = (node: Child, threshold: number): EncodeError | undefined => {
  if (node.kind === "text") {
    return undefined;
  }

  if (node.kind === "comment") {
    return unwritable(node.text, "comment", threshold);
  }

  if (node.kind === "pi") {
    return unwritable(node.target, "pi", threshold) ?? unwritable(node.data, "pi", threshold);
  }

  if (node.kind === "entityRef") {
    return unwritable(node.name, "name", threshold);
  }

  const own = unwritable(node.qname, "name", threshold);

  if (own !== undefined) {
    return own;
  }

  for (const attribute of node.attributes) {
    const found =
      unwritable(attribute.qname, "name", threshold) ??
      attribute.references
        .map((reference) => unwritable(reference.name, "name", threshold))
        .find((error) => error !== undefined);

    if (found !== undefined) {
      return found;
    }
  }

  return node.children
    .map((child) => findInNode(child, threshold))
    .find((error) => error !== undefined);
};

/**
 * The first unwritable construct in the document.
 */
const findUnwritable = (doc: XmlDocument, threshold: number): EncodeError | undefined =>
  [...doc.prolog, doc.root, ...doc.epilog]
    .map((node) =>
      node.kind === "doctype"
        ? unwritable(node.text, "doctype", threshold)
        : findInNode(node, threshold),
    )
    .find((error) => error !== undefined);

/**
 * The recursive `writeXml`, taking its threshold as `writeXml` does: none writes every character as
 * itself.
 */
const recursiveWriteXml = (
  doc: XmlDocument,
  given: Option.Option<number>,
): Effect.Effect<string, EncodeError> => {
  const threshold = Option.getOrElse(given, () => Number.POSITIVE_INFINITY);
  const failure = findUnwritable(doc, threshold);

  if (failure !== undefined) {
    return Effect.fail(failure);
  }

  const declaration = Option.match(doc.declaration, {
    onNone: () => "",
    onSome: (value) => `${renderDeclaration(value)}\n`,
  });
  const prolog = doc.prolog
    .map((node) => `${node.kind === "doctype" ? node.text : renderNode(node, threshold)}\n`)
    .join("");
  const epilog = doc.epilog.map((misc) => `\n${renderNode(misc, threshold)}`).join("");

  return Effect.succeed(`${declaration}${prolog}${renderNode(doc.root, threshold)}${epilog}`);
};

/**
 * The thresholds the two writers are compared under beside none: ISO-8859-1's and US-ASCII's, the
 * two an encoder class sets, so every reference a writer writes and every construct it refuses is
 * met.
 */
const THRESHOLDS = [0xff, 0x7f] as const;

/**
 * What one write gave: its text, or its failure's fields.
 */
type Outcome =
  | { readonly kind: "text"; readonly text: string }
  | {
      readonly codePoint: number;
      readonly kind: "failure";
      readonly threshold: number;
      readonly where: EncodeError["where"];
    };

/**
 * Run a write and record what it gave, so two writers' outcomes compare as plain values.
 *
 * @param effect - The write.
 * @returns Its outcome.
 */
const outcomeOf = (effect: Effect.Effect<string, EncodeError>): Effect.Effect<Outcome> =>
  Effect.match(effect, {
    onFailure: ({ codePoint, threshold, where }): Outcome => ({
      codePoint,
      kind: "failure",
      threshold,
      where,
    }),
    onSuccess: (text): Outcome => ({ kind: "text", text }),
  });

/**
 * Check that `writeXmlText`, `writeXml` with no threshold and the recursive writer give the same
 * text for `doc`, and that `writeXml` and the recursive writer give the same outcome under each of
 * {@link THRESHOLDS}. The trees hold only characters XML allows (the PLAIN and WILD pools of
 * test/trees.ts), so a WriteRefusal under a threshold is the writer's defect, never an outcome the
 * recursive writer shares.
 *
 * @param doc - The document.
 * @param name - What to name the case by in a failure: its seed or its tree.
 * @returns Nothing; fails the test at the first threshold whose outcomes differ.
 */
const agrees = Effect.fnUntraced(function* agreesWithRecursive(doc: XmlDocument, name: string) {
  const text = yield* recursiveWriteXml(doc, Option.none());

  assert.strictEqual(Result.getOrThrow(writeXmlText(doc)), text, `${name}, writeXmlText`);
  assert.strictEqual(yield* writeXml(doc, Option.none()), text, `${name}, no threshold`);
  for (const threshold of THRESHOLDS) {
    assert.deepStrictEqual(
      yield* outcomeOf(
        writeXml(doc, Option.some(threshold)).pipe(Effect.catchTag("WriteRefusal", Effect.die)),
      ),
      yield* outcomeOf(recursiveWriteXml(doc, Option.some(threshold))),
      `${name}, threshold ${threshold}`,
    );
  }
});

/**
 * The largest node count the box holds every tree of: the 197 ordered trees of 1 to 7 nodes.
 */
const BOX_NODES = 7;

/**
 * The box's generator: every plane tree of 1 to {@link BOX_NODES} nodes.
 */
const planeTrees = planeTreeUpTo(BOX_NODES);

/**
 * How many rotating cases each run's search compares, beside its floor and steered witnesses, and
 * the bounds each case draws its own within: depth and width small enough for the recursive
 * oracle, nodes enough for every kind and declaration to meet.
 */
const CASES = 400;

const CASE_BOUNDS: Bounds = { depth: 12, nodes: 64, width: 6 };

describe("writeXml and writeXmlText give the recursive writer's text", () => {
  it.effect(
    `for every plane tree of 1 to ${BOX_NODES} nodes, labelled, under every threshold, exhausted`,
    (ctx) =>
      Effect.andThen(
        boxHolds(planeTrees, PLANE_TREES_TO_7),
        searched(
          ctx,
          exhaust(
            {
              box: "every plane tree of 1 to 7 nodes, labelled, under every threshold: 197 trees",
              caseHang,
              coverage: noCoverage,
              generator: planeTrees,
              literal: Formatter.format,
              oracle: {
                kind: "second-implementation",
                name: "the recursive writer of 56330e2c",
              },
              suite: "crust/write/plane-trees",
            },
            ({ nodes, tree }) => agrees(bare(labelled(tree)), `a plane tree of ${nodes} nodes`),
          ),
        ),
      ),
  );

  it.effect(
    `for swarmed documents, each within ${CASE_BOUNDS.nodes} nodes, depth ${CASE_BOUNDS.depth} and width ${CASE_BOUNDS.width}: ${CASES} rotating cases a run beside the witnesses`,
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            concurrency: availableParallelism(),
            coverage: required(documentSituations, { cases: 200, sense: notesOnly }),
            draw: drawn(generatedDocument(CASE_BOUNDS)),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "second-implementation",
              name: "the recursive writer of 56330e2c",
            },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "crust/write/documents",
          },
          ({ document }, c) =>
            Effect.suspend(() => {
              c.noteAll(documentSituationsOf(document));

              return agrees(document, "the drawn document");
            }),
        ),
      ),
  );
});

/**
 * The runs a stretch of content is drawn from: the empty run, the halves of `]]>` and a letter,
 * each as plain text and as a CDATA section.
 */
const RUNS: readonly [Text, ...Text[]] = [
  { cdata: false, kind: "text", value: "" },
  { cdata: true, kind: "text", value: "" },
  { cdata: false, kind: "text", value: "]" },
  { cdata: true, kind: "text", value: "]" },
  { cdata: false, kind: "text", value: "]]" },
  { cdata: true, kind: "text", value: "]]" },
  { cdata: false, kind: "text", value: ">" },
  { cdata: true, kind: "text", value: ">" },
  { cdata: false, kind: "text", value: "a" },
  { cdata: true, kind: "text", value: "a" },
];

/**
 * The most runs one stretch holds.
 */
const MOST_RUNS = 4;

/**
 * Every stretch of 1 to {@link MOST_RUNS} adjacent runs.
 */
const stretch: Gen<readonly Text[]> = array(element(RUNS), { max: MOST_RUNS, min: 1 });

/**
 * The size of {@link stretch}'s box: the stretches of 1 to 4 of the 10 runs.
 */
const STRETCHES = Array.from({ length: MOST_RUNS }, (_, at) => RUNS.length ** (at + 1)).reduce(
  (sum, count) => sum + count,
  0,
);

describe("writeXml writes adjacent text runs as the content they hold", () => {
  it.effect(
    `for every stretch of 1 to ${String(MOST_RUNS)} plain and CDATA runs over the halves of ]]>, exhausted: ${String(STRETCHES)} documents`,
    (ctx) =>
      Effect.andThen(
        boxHolds(stretch, STRETCHES),
        searched(
          ctx,
          exhaust(
            {
              box: "every stretch of 1 to 4 of 10 runs: the empty run, ], ]], > and a letter, plain and CDATA",
              caseHang,
              coverage: requiredInSpace<"across" | "none">(["across", "none"]),
              generator: stretch,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: 'XML 1.0 section 2.4 as crust\'s reader checks it ("]]>" in content with its ">" unescaped is not well-formed), and the text kept: the text read back is the runs\' text joined',
              },
              suite: "crust/write/adjacent-runs",
            },
            (runs, c) =>
              Effect.gen(function* keepsTheContent() {
                const joined = runs.map(({ value }) => value).join("");
                const plain = runs
                  .map(({ cdata, value }) => (cdata ? "\0" : value))
                  .join("")
                  .split("\0");
                const across = plain.some((held) => held.includes("]]>"));
                c.note(across ? "across" : "none");

                const text = yield* writeXml(
                  bare({
                    attributes: [],
                    children: runs,
                    kind: "element",
                    local: "a",
                    namespace: "",
                    prefix: "",
                    qname: "a",
                  }),
                  Option.none(),
                );
                const read = yield* readXml(new TextEncoder().encode(text));
                const content = read.root.children
                  .map((child) => (child.kind === "text" ? child.value : "\u{FFFF}"))
                  .join("");

                assert.strictEqual(content, joined, text);
              }),
          ),
        ),
      ),
  );
});

/**
 * The kinds of node a prolog of the prolog box holds beside its doctype.
 */
const PROLOG_KINDS = ["comment", "pi"] as const;

/**
 * Draw a prolog of the prolog box: up to four comments and instructions, each written on a line of
 * its own as the writer lays a prolog out and named by its place, and the doctype at any of their
 * places, first, between two of them or last.
 */
const prologOrder: Gen<readonly string[]> = (source) => {
  const kinds = source.draw(array(element(PROLOG_KINDS), { max: 4, min: 0 }));
  const nodes = kinds.map((kind, at) =>
    kind === "comment" ? `<!--c${String(at)}-->` : `<?p${String(at)} d?>`,
  );

  return nodes.toSpliced(source.draw(int(0, nodes.length)), 0, '<!DOCTYPE r [<!ENTITY e "v">]>');
};

/**
 * How many prologs {@link prologOrder} draws: for each length of 0 to 4, every sequence of the two
 * kinds by every place of the doctype among them.
 */
const PROLOG_ORDERS = 1 * 1 + 2 * 2 + 4 * 3 + 8 * 4 + 16 * 5;

describe("readXml then writeXml keeps the prolog's order", () => {
  it.effect(
    `for every prolog of up to 4 comments and instructions with the doctype at each of their places: ${String(PROLOG_ORDERS)} prologs`,
    (ctx) =>
      Effect.andThen(
        boxHolds(prologOrder, PROLOG_ORDERS),
        searched(
          ctx,
          exhaust(
            {
              box: "every prolog of 0 to 4 comments and instructions, the doctype first, between two or last",
              caseHang,
              coverage: noCoverage,
              generator: prologOrder,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "the input document: XML 1.0 production [22] lets a comment or an instruction stand before or after the doctype, and the Information Set keeps the document's children, the DTD among them, in document order (section 2.1); the input lays its prolog out as the writer does, so the text written back is the text read",
              },
              suite: "crust/write/prolog-order",
            },
            (prolog) =>
              Effect.gen(function* keepsThePrologOrder() {
                const text = ['<?xml version="1.0"?>', ...prolog, "<r/>"].join("\n");
                const read = yield* readXml(new TextEncoder().encode(text));

                assert.strictEqual(yield* writeXml(read, Option.none()), text);
              }),
          ),
        ),
      ),
  );
});

/**
 * A document of one element `r` whose attribute `a` holds `attribute` and whose content is one text
 * run holding `text`.
 *
 * @param attribute - The attribute's value.
 * @param text - The text run's value.
 * @returns The document.
 */
const holding = (attribute: string, text: string): XmlDocument => ({
  charset: "UTF-8",
  declaration: Option.none(),
  epilog: [],
  prolog: [],
  root: {
    attributes: [
      { local: "a", namespace: "", prefix: "", qname: "a", references: [], value: attribute },
    ],
    children: [{ cdata: false, kind: "text", value: text }],
    kind: "element",
    local: "r",
    namespace: "",
    prefix: "",
    qname: "r",
  },
});

/**
 * What the writer refused, as a plain value: the construct and the rule it breaks.
 *
 * @param written - A write.
 * @returns Its refusal's place and rule, or the text it wrote.
 */
const refusalOf = (written: Result.Result<string, WriteRefusal>) =>
  Result.match(written, {
    onFailure: (refused) => refused.at,
    onSuccess: (text) => text,
  });

/**
 * The places a comment or an instruction stands in, each with the document that holds `misc` there
 * and the holder the writer names.
 */
const MISC_PLACES = [
  {
    documentOf: (misc: Misc): XmlDocument => ({ ...holding("v", "t"), prolog: [misc] }),
    holder: { _tag: "prolog" },
  },
  {
    documentOf: (misc: Misc): XmlDocument => {
      const plain = holding("v", "t");

      return { ...plain, root: { ...plain.root, children: [...plain.root.children, misc] } };
    },
    holder: { _tag: "element", qname: "r" },
  },
  {
    documentOf: (misc: Misc): XmlDocument => ({ ...holding("v", "t"), epilog: [misc] }),
    holder: { _tag: "epilog" },
  },
] as const;

/**
 * XML 1.0's Char production ([2], section 2.2) as printed, the oracle's own: `#x9 | #xA | #xD |
 * [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]`, each a range of code points.
 */
const CHAR_RANGES = [
  [0x9, 0x9],
  [0xa, 0xa],
  [0xd, 0xd],
  [0x20, 0xd7_ff],
  [0xe0_00, 0xff_fd],
  [0x1_00_00, 0x10_ff_ff],
] as const;

/**
 * Whether a document may hold a character ({@link CHAR_RANGES}).
 *
 * @param codePoint - A code point, or a lone surrogate's code unit.
 * @returns Whether it is a Char.
 */
const isChar = (codePoint: number): boolean =>
  CHAR_RANGES.some(([first, last]) => codePoint >= first && codePoint <= last);

/**
 * The first character of a text outside {@link isChar}, by its code point: a lone surrogate is a
 * character of its own.
 *
 * @param text - The text.
 * @returns Its code point; `None` when every character is a Char.
 */
const firstNonChar = (text: string): Option.Option<number> =>
  Arr.findFirst(
    Array.from(text, (character) => character.codePointAt(0) ?? 0),
    (codePoint) => !isChar(codePoint),
  );

/**
 * The characters a value of the Char box is written with: a letter, the space, every character
 * markup gives a meaning (`&`, `<`, `>`, both quotes, and `]`, of which `]]>` is three), the tab
 * and both line ends, which an attribute value's normalization reads (section 3.3.3) and a reader's
 * line-end handling folds (section 2.11), a character above 0x7f and one beyond the Basic
 * Multilingual Plane.
 */
const CHAR_ALPHABET = [
  "a",
  " ",
  "&",
  "<",
  ">",
  '"',
  "'",
  "]",
  "\t",
  "\n",
  "\r",
  "é",
  "\u{10000}",
] as const;

/**
 * Draw a value of the Char box: every string of up to three of {@link CHAR_ALPHABET}.
 */
const charValue: Gen<string> = map(
  array(element(CHAR_ALPHABET), { max: 3, min: 0 }),
  (characters) => characters.join(""),
);

/**
 * How many values {@link charValue} draws.
 */
const CHAR_VALUES = 1 + 13 + 13 ** 2 + 13 ** 3;

/**
 * What a value of the Char box holds that a writer could miswrite.
 */
const charSituations = [
  "]]>",
  "a CR LF pair",
  "a lone CR",
  "an astral character",
  "the empty value",
] as const;

/**
 * A {@link charSituations} member.
 */
type CharSituation = (typeof charSituations)[number];

/**
 * The situations a Char box value reaches.
 *
 * @param value - The value.
 * @returns Each it reaches.
 */
const charSituationsOf = (value: string): readonly CharSituation[] => {
  const characters = Arr.fromIterable(value);
  const reached: readonly (readonly [CharSituation, boolean])[] = [
    ["]]>", value.includes("]]>")],
    ["a CR LF pair", value.includes("\r\n")],
    [
      "a lone CR",
      characters.some((character, at) => character === "\r" && characters[at + 1] !== "\n"),
    ],
    [
      "an astral character",
      characters.some((character) => (character.codePointAt(0) ?? 0) > 0xff_ff),
    ],
    ["the empty value", value === ""],
  ];

  return reached.flatMap(([situation, held]) => (held ? [situation] : []));
};

/**
 * Draw a code point outside {@link isChar} below 0x10000, every one of them: the C0 controls but the
 * tab and the line ends, the lone surrogates, and U+FFFE and U+FFFF. Above U+FFFF every code point
 * up to U+10FFFF is a Char.
 */
const nonChar: Gen<number> = oneOf([
  int(0x0, 0x8),
  int(0xb, 0xc),
  int(0xe, 0x1f),
  int(0xd8_00, 0xdf_ff),
  int(0xff_fe, 0xff_ff),
]);

/**
 * How many code points {@link nonChar} draws.
 */
const NON_CHARS = 9 + 2 + 18 + 2048 + 2;

/**
 * The writer's thresholds a refusal is held under: none, every character as itself, and the
 * ISO-8859-1 ceiling, which writes the rest as references.
 */
const THRESHOLD_FORMS = [Option.none(), Option.some(0xff)] as const;

/**
 * A case of the refusal box: a code point outside Char and the threshold writeXml writes under.
 */
type UnderThreshold = { readonly codePoint: number; readonly threshold: Option.Option<number> };

/**
 * Draw a case of the refusal box: every code point {@link nonChar} draws under each of
 * {@link THRESHOLD_FORMS}.
 */
const nonCharUnderThreshold: Gen<UnderThreshold> = (source) => ({
  codePoint: source.draw(nonChar),
  threshold: source.draw(element(THRESHOLD_FORMS)),
});

describe("the writer writes only characters XML 1.0 allows (Char, section 2.2)", () => {
  it.effect(
    `reads back every value of up to 3 of ${String(CHAR_ALPHABET.length)} characters as written, in an attribute and in a text run: ${String(CHAR_VALUES)} values`,
    (ctx) =>
      Effect.andThen(
        boxHolds(charValue, CHAR_VALUES),
        searched(
          ctx,
          exhaust(
            {
              box: "every value of 0 to 3 characters over a letter, the space, & < > \" ' ], the tab, both line ends, é and U+10000",
              caseHang,
              concurrency: availableParallelism(),
              coverage: requiredInSpace<CharSituation>(charSituations),
              generator: charValue,
              literal: (value) => JSON.stringify(value),
              oracle: {
                kind: "specification",
                name: "crust's reader over the text written: every character is a Char (XML 1.0 section 2.2), so each comes back as it was, the attribute's tab and line ends and the text's carriage return among them, which the writer writes as references (sections 2.11 and 3.3.3)",
              },
              suite: "crust/write/char-values",
            },
            (value, c) =>
              Effect.gen(function* readsBack() {
                c.noteAll(charSituationsOf(value));

                const read = yield* readXml(
                  new TextEncoder().encode(Result.getOrThrow(writeXmlText(holding(value, value)))),
                );

                assert.deepStrictEqual(
                  [
                    read.root.attributes.map((attribute) => attribute.value),
                    read.root.children
                      .map((child) => (child.kind === "text" ? child.value : ""))
                      .join(""),
                  ],
                  [[value], value],
                  JSON.stringify(value),
                );
              }),
          ),
        ),
      ),
  );

  it.effect(
    `refuses every code point outside Char below U+10000, in an attribute and in a text run, naming it and its place, under every writer: ${String(NON_CHARS)} code points under ${String(THRESHOLD_FORMS.length)} thresholds`,
    (ctx) =>
      Effect.andThen(
        boxHolds(nonCharUnderThreshold, NON_CHARS * THRESHOLD_FORMS.length),
        searched(
          ctx,
          exhaust(
            {
              box: "every code point outside Char below U+10000: the C0 controls but the tab and line ends, the surrogates and U+FFFE and U+FFFF, each between two letters, under writeXml's two thresholds",
              caseHang,
              concurrency: availableParallelism(),
              coverage: noCoverage,
              generator: nonCharUnderThreshold,
              literal: ({ codePoint, threshold }) =>
                `{ codePoint: 0x${codePoint.toString(16)}, threshold: ${Formatter.format(threshold)} }`,
              oracle: {
                kind: "specification",
                name: "XML 1.0's Char production (section 2.2) and the Legal Character constraint (section 4.1), so no reference writes one either: the text writer and both thresholds of writeXml refuse alike",
              },
              suite: "crust/write/non-chars",
            },
            ({ codePoint, threshold }) =>
              Effect.gen(function* refuses() {
                const value = `a${String.fromCodePoint(codePoint)}b`;
                const rule = { _tag: "Char", codePoint } as const;
                const inAttribute = { _tag: "attribute", element: "r", name: "a", rule } as const;
                const inText = { _tag: "text", element: "r", rule } as const;

                assert.deepStrictEqual(refusalOf(writeXmlText(holding(value, "t"))), inAttribute);
                assert.deepStrictEqual(refusalOf(writeXmlText(holding("v", value))), inText);

                const refused = yield* Effect.flip(writeXml(holding("v", value), threshold));

                assert.strictEqual(refused._tag, "WriteRefusal", JSON.stringify(value));
              }),
          ),
        ),
      ),
  );
});

/**
 * The characters a comment of the comment box is written with: a letter, the hyphen whose pair and
 * whose place at the end production [15] rules out, the space, `>`, the tab, a character above 0x7f
 * and one beyond the Basic Multilingual Plane, and three characters outside Char, a C0 control,
 * U+FFFE and a lone surrogate. No carriage return: every reader turns one into a line feed (section
 * 2.11), so none reads back as written.
 */
const COMMENT_ALPHABET = [
  "a",
  "-",
  " ",
  ">",
  "\t",
  "é",
  "\u{10000}",
  "\u0001",
  "￾",
  "\uD800",
] as const;

/**
 * Draw a comment of the comment box: every text of up to three of {@link COMMENT_ALPHABET}.
 */
const boxComment: Gen<Misc> = map(
  array(element(COMMENT_ALPHABET), { max: 3, min: 0 }),
  (characters): Misc => ({ kind: "comment", text: characters.join("") }),
);

/**
 * How many comments {@link boxComment} draws.
 */
const BOX_COMMENTS = 1 + 10 + 10 ** 2 + 10 ** 3;

/**
 * The characters an instruction's target in the target box is written with: the letters of `xml`,
 * an upper-case `L` so the reserved name is met in another case and a longer name that starts with
 * it is met too, a digit, which no name starts with, the colon, which no NCName holds, the space,
 * which no name holds, and U+FFFE, outside Char.
 */
const TARGET_ALPHABET = ["x", "m", "l", "L", "1", ":", " ", "\uFFFE"] as const;

/**
 * Draw an instruction of the target box: every target of up to four of {@link TARGET_ALPHABET},
 * its data a letter.
 */
const targetPi: Gen<Misc> = map(
  array(element(TARGET_ALPHABET), { max: 4, min: 0 }),
  (characters): Misc => ({ data: "d", kind: "pi", target: characters.join("") }),
);

/**
 * How many instructions {@link targetPi} draws.
 */
const TARGET_PIS = 1 + 8 + 8 ** 2 + 8 ** 3 + 8 ** 4;

/**
 * The characters an instruction's data in the data box is written with: a letter, `?` and `>`, of
 * which `?>` closes an instruction, and a C0 control, outside Char. No white space: an
 * instruction's one space before its data stands for any, so data that leads with white space reads
 * back without it.
 */
const DATA_ALPHABET = ["d", "?", ">", "\u0001"] as const;

/**
 * Draw an instruction of the data box: target `p`, every data of up to three of
 * {@link DATA_ALPHABET}.
 */
const dataPi: Gen<Misc> = map(
  array(element(DATA_ALPHABET), { max: 3, min: 0 }),
  (characters): Misc => ({ data: characters.join(""), kind: "pi", target: "p" }),
);

/**
 * How many instructions {@link dataPi} draws.
 */
const DATA_PIS = 1 + 4 + 4 ** 2 + 4 ** 3;

/**
 * XML 1.0's [4] NameStartChar as printed, the colon left out, as Namespaces in XML's NCName leaves
 * it out: each a range of code points.
 */
const NC_NAME_START_RANGES = [
  [0x41, 0x5a],
  [0x5f, 0x5f],
  [0x61, 0x7a],
  [0xc0, 0xd6],
  [0xd8, 0xf6],
  [0xf8, 0x2_ff],
  [0x3_70, 0x3_7d],
  [0x3_7f, 0x1f_ff],
  [0x20_0c, 0x20_0d],
  [0x20_70, 0x21_8f],
  [0x2c_00, 0x2f_ef],
  [0x30_01, 0xd7_ff],
  [0xf9_00, 0xfd_cf],
  [0xfd_f0, 0xff_fd],
  [0x1_00_00, 0xe_ff_ff],
] as const;

/**
 * Whether a character starts an NCName ({@link NC_NAME_START_RANGES}).
 *
 * @param codePoint - The character's code point.
 * @returns Whether it does.
 */
const isNcNameStart = (codePoint: number): boolean =>
  NC_NAME_START_RANGES.some(([first, last]) => codePoint >= first && codePoint <= last);

/**
 * Whether a character continues an XML name (XML 1.0 [4a] NameChar, the colon left out), as
 * printed.
 *
 * @param codePoint - The character's code point.
 * @returns Whether it does.
 */
const isNcNameChar = (codePoint: number): boolean =>
  isNcNameStart(codePoint) ||
  codePoint === 0x2d ||
  codePoint === 0x2e ||
  (codePoint >= 0x30 && codePoint <= 0x39) ||
  codePoint === 0xb7 ||
  (codePoint >= 0x3_00 && codePoint <= 0x3_6f) ||
  (codePoint >= 0x20_3f && codePoint <= 0x20_40);

/**
 * Whether a text is an NCName (Namespaces in XML 1.0 [4]: a Name with no colon).
 *
 * @param text - The text.
 * @returns Whether it is.
 */
const isNcName = (text: string): boolean => {
  const codePoints = Array.from(text, (character) => character.codePointAt(0) ?? 0);

  return Option.match(Arr.head(codePoints), {
    onNone: () => false,
    onSome: (first) => isNcNameStart(first) && codePoints.slice(1).every(isNcNameChar),
  });
};

/**
 * The refusal the oracle expects for a comment or an instruction where `holder` says, by the rules
 * in the order the writer states them (`miscRefusal`, `#crust/charset.ts`): a character outside
 * Char first, then a comment's `--` or its `-` at the end (Comment, [15]), an instruction's target
 * that is no NCName or is `xml` in any case (PITarget, [17], and Namespaces in XML section 7), or
 * its data's `?>` (PI, [16]).
 *
 * @param misc - The comment or instruction.
 * @param holder - Where it stands.
 * @returns The refusal's place and rule; `None` when it breaks none.
 */
const expectedAt = (misc: Misc, holder: MiscHolder): Option.Option<WriteRefusal["at"]> => {
  if (misc.kind === "comment") {
    return Option.map(
      Option.orElse(
        Option.map(firstNonChar(misc.text), (codePoint) => ({ _tag: "Char", codePoint }) as const),
        () =>
          misc.text.includes("--") || misc.text.endsWith("-")
            ? Option.some({ _tag: "Comment" } as const)
            : Option.none(),
      ),
      (rule): WriteRefusal["at"] => ({ _tag: "comment", holder, rule }),
    );
  }

  return Option.map(
    Option.orElse(
      Option.map(
        firstNonChar(`${misc.target}${misc.data}`),
        (codePoint) => ({ _tag: "Char", codePoint }) as const,
      ),
      (): Option.Option<{ readonly _tag: "PI" } | { readonly _tag: "PITarget" }> => {
        if (!isNcName(misc.target) || misc.target.toLowerCase() === "xml") {
          return Option.some({ _tag: "PITarget" } as const);
        }

        return misc.data.includes("?>") ? Option.some({ _tag: "PI" } as const) : Option.none();
      },
    ),
    (rule): WriteRefusal["at"] => ({ _tag: "pi", holder, rule, target: misc.target }),
  );
};

/**
 * What a comment or an instruction of the boxes holds that a writer could miswrite or let through.
 */
const miscSituations = ["legal", "Char", "Comment", "PI", "PITarget"] as const;

/**
 * A {@link miscSituations} member.
 */
type MiscSituation = (typeof miscSituations)[number];

/**
 * Hold every writer to the oracle on one comment or instruction, in each of its places: one XML
 * 1.0 rules out is refused alike by the text writer, both thresholds of writeXml and the
 * canonicalizer, naming its place and the rule.
 *
 * @param misc - The comment or instruction.
 * @returns The situation it reaches; fails the case at the first writer that differs.
 */
const holdsToProductions = (misc: Misc) =>
  Effect.gen(function* heldToProductions() {
    for (const { documentOf, holder } of MISC_PLACES) {
      const doc = documentOf(misc);
      const name = `${JSON.stringify(misc)} ${holder._tag}`;
      const expected = expectedAt(misc, holder);
      if (Option.isNone(expected)) {
        continue;
      }

      const at = expected.value;

      assert.deepStrictEqual(refusalOf(writeXmlText(doc)), at, name);
      assert.deepStrictEqual(
        Result.match(canonicalize(doc), {
          onFailure: (refused) => refused.at,
          onSuccess: () => "written",
        }),
        at,
        name,
      );
      for (const threshold of THRESHOLD_FORMS) {
        const refused = yield* Effect.flip(writeXml(doc, threshold));

        assert.deepStrictEqual(
          refused._tag === "WriteRefusal" ? refused.at : refused._tag,
          at,
          name,
        );
      }
    }

    return Option.match(expectedAt(misc, { _tag: "prolog" }), {
      onNone: (): MiscSituation => "legal",
      onSome: (at): MiscSituation =>
        at._tag === "comment" || at._tag === "pi" ? at.rule._tag : "legal",
    });
  });

describe("the writer writes only comments and processing instructions XML 1.0 allows (productions 15 to 17)", () => {
  it.effect(
    `writes every comment of up to 3 of ${String(COMMENT_ALPHABET.length)} characters that XML 1.0 allows, and refuses every other naming its rule, in the prolog, in content and in the epilog: ${String(BOX_COMMENTS)} comments`,
    (ctx) =>
      Effect.andThen(
        boxHolds(boxComment, BOX_COMMENTS),
        searched(
          ctx,
          exhaust(
            {
              box: "every comment of 0 to 3 characters over a letter, the hyphen, the space, >, the tab, é, U+10000, a C0 control, U+FFFE and a lone surrogate, in 3 places",
              caseHang,
              concurrency: availableParallelism(),
              coverage: requiredInSpace<MiscSituation>(["legal", "Char", "Comment"]),
              generator: boxComment,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "XML 1.0's production 15 (Comment) and Char (section 2.2), transcribed here: every writer, the text writer, both thresholds of writeXml and the canonicalizer, refuses one it rules out alike",
              },
              suite: "crust/write/comments",
            },
            (misc, c) =>
              Effect.map(holdsToProductions(misc), (situation) => {
                c.note(situation);
              }),
          ),
        ),
      ),
  );

  it.effect(
    `holds every instruction target of up to 4 of ${String(TARGET_ALPHABET.length)} characters to PITarget and Char, in the prolog, in content and in the epilog: ${String(TARGET_PIS)} instructions`,
    (ctx) =>
      Effect.andThen(
        boxHolds(targetPi, TARGET_PIS),
        searched(
          ctx,
          exhaust(
            {
              box: "every instruction whose target is 0 to 4 of x, m, l, L, 1, the colon, the space and U+FFFE, its data a letter, in 3 places",
              caseHang,
              concurrency: availableParallelism(),
              coverage: requiredInSpace<MiscSituation>(["legal", "Char", "PITarget"]),
              generator: targetPi,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "XML 1.0's production 17 (PITarget), Namespaces in XML 1.0's NCName and section 7, and Char (section 2.2), transcribed here: every writer, the text writer, both thresholds of writeXml and the canonicalizer, refuses one it rules out alike",
              },
              suite: "crust/write/instruction-targets",
            },
            (misc, c) =>
              Effect.map(holdsToProductions(misc), (situation) => {
                c.note(situation);
              }),
          ),
        ),
      ),
  );

  it.effect(
    `holds every instruction's data of up to 3 of ${String(DATA_ALPHABET.length)} characters to PI and Char, in the prolog, in content and in the epilog: ${String(DATA_PIS)} instructions`,
    (ctx) =>
      Effect.andThen(
        boxHolds(dataPi, DATA_PIS),
        searched(
          ctx,
          exhaust(
            {
              box: "every instruction of target p whose data is 0 to 3 of a letter, ?, > and a C0 control, in 3 places",
              caseHang,
              concurrency: availableParallelism(),
              coverage: requiredInSpace<MiscSituation>(["legal", "Char", "PI"]),
              generator: dataPi,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "XML 1.0's production 16 (PI) and Char (section 2.2), transcribed here: every writer, the text writer, both thresholds of writeXml and the canonicalizer, refuses one it rules out alike",
              },
              suite: "crust/write/instruction-data",
            },
            (misc, c) =>
              Effect.map(holdsToProductions(misc), (situation) => {
                c.note(situation);
              }),
          ),
        ),
      ),
  );
});
