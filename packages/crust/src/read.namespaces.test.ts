import { regex } from "arkregex";
import { availableParallelism } from "node:os";
import { assert, describe, it } from "@effect/vitest";
import { drawn, explore } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Effect, Formatter, Option } from "effect";
import { SaxesParser } from "saxes";
import { readXml } from "#crust/read.ts";
import { bare, caseHang, generatedTree, situationsOf } from "#crust/test/trees.ts";
import type { Bounds, TreeFeature, TreeSituation } from "#crust/test/trees.ts";
import type { Child, Element } from "#crust/tree.ts";
import { writeXml } from "#crust/write.ts";

/**
 * What a parse resolved, in document order: each element's name and namespace, then each of its
 * attributes', or where its first well-formedness error stands, as the line and column its message
 * opens with. The two readers word an error differently; they must refuse at the same place.
 */
type Resolved =
  | { readonly kind: "names"; readonly names: readonly string[] }
  | { readonly kind: "error"; readonly at: string };

/**
 * The `line:column` a well-formedness message opens with, as `saxes` and crust's namespace pass
 * both write it.
 *
 * @param message - The message.
 * @returns Its position, or the whole message when it opens with none.
 */
const positionIn = (message: string): string =>
  regex("^\\d+:\\d+", "u").exec(message)?.[0] ?? message;

/**
 * The oracle: the namespaces `saxes` resolves in its own namespace mode, a second
 * implementation of Namespaces in XML. crust reads with `saxes`'s namespaces off and resolves every
 * name in its own pass, after the attribute-list defaults are added (`#crust/namespaces.ts`); on a
 * document with no default, the two must resolve the same names and refuse at the same place.
 *
 * @param text - The document.
 * @returns What `saxes` resolved.
 */
const bySaxes = (text: string): Resolved => {
  const parser = new SaxesParser({ position: true, xmlns: true });
  const names: string[] = [];
  const errors: string[] = [];
  parser.on("opentag", (tag) => {
    names.push(`${tag.name} ${tag.uri}`);
    for (const attribute of Object.values(tag.attributes)) {
      names.push(`@${attribute.name} ${attribute.uri}`);
    }
  });
  parser.on("error", (error) => {
    errors.push(error.message);
  });
  parser.write(text).close();

  const [first] = errors;

  return first === undefined ? { kind: "names", names } : { at: positionIn(first), kind: "error" };
};

/**
 * Each element's name and namespace in document order, then each of its attributes'.
 *
 * @param root - The tree.
 * @returns The names, as {@link bySaxes} lists them.
 */
const namesOf = (root: Element): readonly string[] => [
  `${root.qname} ${root.namespace}`,
  ...root.attributes.map((attribute) => `@${attribute.qname} ${attribute.namespace}`),
  ...root.children.flatMap((child) => (child.kind === "element" ? namesOf(child) : [])),
];

/**
 * How many rotating cases each run's search reads, beside its floor and steered witnesses, and the
 * bounds each case draws its own within.
 */
const CASES = 400;

const CASE_BOUNDS: Bounds = { depth: 12, nodes: 64, width: 6 };

/**
 * The features the round trip draws: every one of `treeFeatures` but entity references, in an
 * attribute value or as a child, since the reader refuses an entity the document does not declare.
 */
const roundTripFeatures = [
  "text",
  "element",
  "cdata",
  "comment",
  "pi",
  "attribute",
  "declaration",
  "wild",
] as const satisfies readonly TreeFeature[];

/**
 * The situations the round trip's witnesses must reach: every one of `treeSituations` but those of
 * entity references.
 */
const roundTripSituations = [
  "text",
  "element",
  "cdata",
  "comment",
  "pi",
  "attribute",
  "bare root",
  "declaration",
  "deep",
  "wild",
] as const satisfies readonly TreeSituation[];

/**
 * Make line ends line feeds, as a parser does before it reads markup (XML 1.0 section 2.11): a
 * comment or a processing instruction cannot escape a carriage return, so it reads back this way.
 *
 * @param text - The characters as written.
 * @returns Them as read.
 */
const lineFeeds = (text: string): string => text.replaceAll("\r\n", "\n").replaceAll("\r", "\n");

/**
 * A tree's children as XML's information set holds them (XML Infoset 1.0, sections 2.4, 2.6 and
 * 2.7; XML 1.0 section 2.11): each run of adjacent text, CDATA sections among it, is one run of
 * characters, and an empty run is none, since a CDATA boundary is no information item and the
 * writer splits a section around `]]>` and each carriage return; a comment's text and a processing
 * instruction's data with their line ends made line feeds; and the instruction's data without the
 * white space that follows its target, which its `[content]` excludes. An element-only tree is its
 * own form.
 *
 * @param element - The tree.
 * @returns It in that form.
 */
const infosetOf = (element: Element): Element => {
  const children: Child[] = [];
  for (const child of element.children) {
    const last = children.at(-1);
    switch (child.kind) {
      case "text": {
        if (last?.kind === "text") {
          children[children.length - 1] = { ...last, value: last.value + child.value };
        } else {
          children.push({ cdata: false, kind: "text", value: child.value });
        }

        break;
      }
      case "comment": {
        children.push({ kind: "comment", text: lineFeeds(child.text) });
        break;
      }
      case "pi": {
        children.push({
          ...child,
          data: lineFeeds(child.data).replace(regex("^[ \t\n]+", "u"), ""),
        });
        break;
      }
      case "element": {
        children.push(infosetOf(child));
        break;
      }
      case "entityRef": {
        children.push(child);
        break;
      }
    }
  }

  return {
    ...element,
    children: children.filter((child) => child.kind !== "text" || child.value !== ""),
  };
};

/**
 * Test whether a tree holds an empty plain text run anywhere: the reader never makes one, since
 * `saxes` emits no empty text (`read.ts`'s text handler), though a written tree may hold one. An
 * empty CDATA section is a run of its own and stays, as the document wrote it.
 *
 * @param root - The tree.
 * @returns Whether some plain text run below it is empty.
 */
const holdsEmptyRun = (root: Element): boolean =>
  root.children.some((child) =>
    child.kind === "element"
      ? holdsEmptyRun(child)
      : child.kind === "text" && !child.cdata && child.value === "",
  );

describe("readXml resolves every namespace as saxes does in its namespace mode", () => {
  it.effect(
    `and reads back the tree, by the generator's namespace model and XML's information set, for swarmed trees of elements, text, CDATA, comments and processing instructions, each within ${CASE_BOUNDS.nodes} nodes, depth ${CASE_BOUNDS.depth} and width ${CASE_BOUNDS.width}: ${CASES} rotating cases a run beside the witnesses`,
    (ctx) =>
      // Bound: the drawn trees, each with its own swarm over `roundTripFeatures` and bounds within
      // CASE_BOUNDS; the witnesses reach every situation of `roundTripSituations`.
      searched(
        ctx,
        explore(
          {
            caseHang,
            concurrency: availableParallelism(),
            coverage: required<TreeSituation>(roundTripSituations, {
              cases: 200,
              sense: notesOnly,
            }),
            draw: drawn(generatedTree(CASE_BOUNDS, roundTripFeatures)),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "universal",
              name: "read ∘ write = id in the information set's form (infosetOf), and saxes's namespace mode resolving the generator's names",
            },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "crust/read/namespaces",
          },
          ({ root: tree }, c) =>
            Effect.gen(function* roundTrip() {
              c.noteAll(situationsOf(tree));

              const text = yield* writeXml(bare(tree), Option.none());
              const doc = yield* readXml(new TextEncoder().encode(text));

              assert.isFalse(
                holdsEmptyRun(doc.root),
                "the reader puts no empty plain text run in a tree",
              );
              assert.deepStrictEqual(infosetOf(doc.root), infosetOf(tree));
              assert.deepStrictEqual(bySaxes(text), { kind: "names", names: namesOf(tree) });
            }),
        ),
      ),
  );
});
