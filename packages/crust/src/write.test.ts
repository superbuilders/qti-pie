import { availableParallelism } from "node:os";
import { assert, describe, it } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { noCoverage, required, requiredInSpace } from "@bjornpagen/testing/features";
import { array, element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Effect, Formatter, Option, Result } from "effect";
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

// The oracle: the recursive writer, `write.ts` as it was at 56330e2c, the last commit before the
// walks became iterative, but for names and comments and for the rules the writer has gained since,
// which it follows: the doctype written and searched in its place in the prolog, which holds it
// among the comments and processing instructions, and a `>` escaped where adjacent text runs make
// `]]>`. It overflows the stack from about 2,000 levels, so the trees below stay far shallower. Its
// escaping is the code under test's own, so what the differential proves is the walk: the order the
// iterative writer visits, renders and searches a tree in, which is the writer's contract.

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

  // A plain text run is escaped knowing the last two characters of the plain run just before it.
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
 * The recursive `writeXml`.
 */
const recursiveWriteXml = (
  doc: XmlDocument,
  options?: { readonly threshold: number },
): Effect.Effect<string, EncodeError> => {
  const threshold = options?.threshold ?? Number.POSITIVE_INFINITY;
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

// The tests.

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
 * {@link THRESHOLDS}.
 *
 * @param doc - The document.
 * @param name - What to name the case by in a failure: its seed or its tree.
 * @returns Nothing; fails the test at the first threshold whose outcomes differ.
 */
const agrees = Effect.fnUntraced(function* agreesWithRecursive(doc: XmlDocument, name: string) {
  const text = yield* recursiveWriteXml(doc);

  assert.strictEqual(Result.getOrThrow(writeXmlText(doc)), text, `${name}, writeXmlText`);
  assert.strictEqual(yield* writeXml(doc, Option.none()), text, `${name}, no threshold`);
  for (const threshold of THRESHOLDS) {
    // The trees hold only characters XML allows (the PLAIN and WILD pools of test/trees.ts), so a
    // WriteRefusal here would be the writer's defect, never an outcome the oracle shares.
    assert.deepStrictEqual(
      yield* outcomeOf(
        writeXml(doc, Option.some(threshold)).pipe(Effect.catchTag("WriteRefusal", Effect.die)),
      ),
      yield* outcomeOf(recursiveWriteXml(doc, { threshold })),
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
      // Bound: the drawn documents, each with its own swarm and bounds within CASE_BOUNDS; the
      // witnesses reach every situation of `documentSituations`.
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
      // Oracle: XML 1.0 section 2.4, as the reader's parser checks it ("]]>" in content with its
      // ">" unescaped is not well-formed), and the content kept: the text read back is the runs'
      // text joined. Bound: every sequence of 1 to 4 of the 10 runs.
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
                name: "XML 1.0 section 2.4 as crust's reader checks it, and the text kept",
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
 * The comments and processing instructions of the prolog the round trip reads, in order, around
 * the doctype.
 */
const PROLOG_MISC: readonly string[] = ["<!--a-->", "<?p d?>", "<!--b-->", "<?q e?>"];

describe("readXml then writeXml keeps the prolog's order", () => {
  it.effect(
    `for the doctype at each of the ${String(PROLOG_MISC.length + 1)} places among a comment, a PI, a comment and a PI`,
    () =>
      // Oracle: the input document. XML 1.0 production [22] lets a comment or a PI stand before or
      // after the doctype, and the Information Set keeps the document's children, the DTD among
      // them, in document order (section 2.1). The input lays its prolog out as the writer does,
      // the declaration and each node on a line of its own, so the text written back is the text
      // read. The doctype first is the control.
      Effect.gen(function* keepsThePrologOrder() {
        for (let at = 0; at <= PROLOG_MISC.length; at += 1) {
          const prolog = PROLOG_MISC.toSpliced(at, 0, '<!DOCTYPE r [<!ENTITY e "v">]>');
          const text = ['<?xml version="1.0"?>', ...prolog, "<r/>"].join("\n");
          const read = yield* readXml(new TextEncoder().encode(text));

          assert.strictEqual(yield* writeXml(read, Option.none()), text);
        }
      }),
  );
});

/**
 * The values UNIFY-EDU's census of the XML writers wrote (out/rf/UNIFY-EDU/scripts/writers.ts),
 * each as an attribute value and as a text run: the ones every character of which XML allows.
 */
const CENSUS_VALUES = [
  "plain",
  "a&b",
  "a<b",
  "a>b",
  'a"b',
  "a'b",
  "a]]>b",
  "a\tb",
  "a\nb",
  "a\rb",
  "a\r\nb",
  " lead",
  "trail ",
  "a  b",
  " ",
  "\u00E9\u{10000}",
  "&amp;",
  "]]",
] as const;

/**
 * The census's values that hold a character outside XML 1.0's `Char` (section 2.2), each with that
 * character: a C0 control, U+FFFE, and a lone surrogate.
 */
const NON_CHARACTER_VALUES = [
  ["a\u0001b", 0x1],
  ["a\uFFFEb", 0xff_fe],
  ["a\uD800b", 0xd8_00],
] as const;

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

describe("the writer writes only characters XML 1.0 allows (Char, section 2.2)", () => {
  it.effect(
    `reads back each of the census's ${String(CENSUS_VALUES.length)} values as written, in an attribute and in a text run`,
    () =>
      // Oracle: crust's reader, over the text written: every character of these values is a Char,
      // so the reader must give each back as it was, the attribute's tab, line ends and the text's
      // carriage return included, which the writer writes as references (sections 2.11 and 3.3.3).
      Effect.gen(function* readsBack() {
        for (const value of CENSUS_VALUES) {
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
        }
      }),
  );

  it.effect(
    `refuses each of the census's ${String(NON_CHARACTER_VALUES.length)} characters outside Char, in an attribute and in a text run, naming it and its place`,
    () =>
      // Oracle: XML 1.0's Char production (section 2.2), which none of U+0001, U+FFFE and an
      // unpaired surrogate is in, and the Legal Character constraint (section 4.1), so no reference
      // writes one either. Every writer refuses alike: the text writer and both thresholds of
      // writeXml.
      Effect.gen(function* refuses() {
        for (const [value, codePoint] of NON_CHARACTER_VALUES) {
          const rule = { _tag: "Char", codePoint } as const;
          const inAttribute = { _tag: "attribute", element: "r", name: "a", rule } as const;
          const inText = { _tag: "text", element: "r", rule } as const;

          assert.deepStrictEqual(refusalOf(writeXmlText(holding(value, "t"))), inAttribute);
          assert.deepStrictEqual(refusalOf(writeXmlText(holding("v", value))), inText);
          for (const threshold of [Option.none(), Option.some(0xff)]) {
            const refused = yield* Effect.flip(writeXml(holding("v", value), threshold));

            assert.strictEqual(refused._tag, "WriteRefusal", JSON.stringify(value));
          }
        }
      }),
  );
});

/**
 * The rules a comment may break.
 */
type CommentRule = Extract<WriteRefusal["at"], { readonly _tag: "comment" }>["rule"];

/**
 * The rules a processing instruction may break.
 */
type PiRule = Extract<WriteRefusal["at"], { readonly _tag: "pi" }>["rule"];

/**
 * Comments XML 1.0 rules out, each text with the rule it breaks: a character outside `Char`
 * (section 2.2), or `--` within or `-` at its end (Comment, [15]). An instruction breaks `Char`,
 * its data holding `?>` (PI, [16]) or its target being no NCName or `xml` in any case
 * (PITarget, [17]).
 */
const ILLEGAL_COMMENTS = [
  ["a--b", { _tag: "Comment" }],
  ["--", { _tag: "Comment" }],
  ["a-", { _tag: "Comment" }],
  ["-", { _tag: "Comment" }],
  ["a\u0001b", { _tag: "Char", codePoint: 0x1 }],
  ["a\uFFFEb", { _tag: "Char", codePoint: 0xff_fe }],
  ["a\uD800b", { _tag: "Char", codePoint: 0xd8_00 }],
] as const satisfies readonly (readonly [string, CommentRule])[];

/**
 * Processing instructions XML 1.0 rules out, as {@link ILLEGAL_COMMENTS} are: each target and data
 * with the rule they break. A target must be an NCName (Namespaces in XML section 7): an XML Name,
 * so neither empty, nor led by a digit, nor holding a space, and with no colon.
 */
const ILLEGAL_PIS = [
  ["p", "a?>b", { _tag: "PI" }],
  ["p", "?>", { _tag: "PI" }],
  ["xml", "d", { _tag: "PITarget" }],
  ["XmL", "", { _tag: "PITarget" }],
  ["", "d", { _tag: "PITarget" }],
  ["1a", "d", { _tag: "PITarget" }],
  ["a b", "d", { _tag: "PITarget" }],
  ["a:b", "d", { _tag: "PITarget" }],
  ["p", "a\u0001b", { _tag: "Char", codePoint: 0x1 }],
  ["p\uFFFE", "d", { _tag: "Char", codePoint: 0xff_fe }],
] as const satisfies readonly (readonly [string, string, PiRule])[];

/**
 * Every comment and instruction XML 1.0 rules out, each with the refusal the writer gives for it
 * where `holder` says.
 */
const ILLEGAL_MISCS: readonly (readonly [Misc, (holder: MiscHolder) => WriteRefusal["at"]])[] = [
  ...ILLEGAL_COMMENTS.map(
    ([text, rule]): readonly [Misc, (holder: MiscHolder) => WriteRefusal["at"]] => [
      { kind: "comment", text },
      (holder) => ({ _tag: "comment", holder, rule }),
    ],
  ),
  ...ILLEGAL_PIS.map(
    ([target, data, rule]): readonly [Misc, (holder: MiscHolder) => WriteRefusal["at"]] => [
      { data, kind: "pi", target },
      (holder) => ({ _tag: "pi", holder, rule, target }),
    ],
  ),
];

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

describe("the writer writes only comments and processing instructions XML 1.0 allows (productions 15 to 17)", () => {
  it.effect(
    `refuses each of ${String(ILLEGAL_MISCS.length)} comments and instructions XML 1.0 rules out, in the prolog, in content and in the epilog, naming its place and the rule`,
    () =>
      // Oracle: XML 1.0's productions 15 (Comment), 16 (PI) and 17 (PITarget), and Char (section
      // 2.2): each value breaks the rule beside it. Every writer refuses alike: the text writer,
      // both thresholds of writeXml, and the canonicalizer.
      Effect.gen(function* refuses() {
        for (const [misc, refusedAt] of ILLEGAL_MISCS) {
          for (const { documentOf, holder } of MISC_PLACES) {
            const at = refusedAt(holder);
            const doc = documentOf(misc);
            const name = `${JSON.stringify(misc)} ${holder._tag}`;

            assert.deepStrictEqual(refusalOf(writeXmlText(doc)), at, name);
            assert.deepStrictEqual(
              Result.match(canonicalize(doc), {
                onFailure: (refused) => refused.at,
                onSuccess: () => "written",
              }),
              at,
              name,
            );
            for (const threshold of [Option.none(), Option.some(0xff)]) {
              const refused = yield* Effect.flip(writeXml(doc, threshold));

              assert.deepStrictEqual(
                refused._tag === "WriteRefusal" ? refused.at : refused._tag,
                at,
                name,
              );
            }
          }
        }
      }),
  );
});
