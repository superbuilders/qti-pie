import { availableParallelism } from "node:os";
import { assert, describe, it } from "@effect/vitest";
import { drawn, explore } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Effect, Formatter, Result } from "effect";
import { canonicalize } from "#crust/canonical.ts";
import {
  caseHang,
  documentSituations,
  documentSituationsOf,
  generatedDocument,
} from "#crust/test/trees.ts";
import type { Bounds } from "#crust/test/trees.ts";
import type { Attribute, Child, Element, Misc, XmlDocument } from "#crust/tree.ts";

// The oracle: the recursive canonicalizer, `canonical.ts` as it was at 56330e2c, the last commit
// before the walks became iterative, kept but for names and comments, and for dropping the doctype
// from the prolog, which holds it among the comments and processing instructions. It overflows the
// stack within a few thousand levels, so the trees below stay far shallower. What the differential
// proves is the walk, the order the iterative canonicalizer visits a tree in and the scope it hands
// each element, and with it the escapes and the code point order, which the code under test now
// writes another way (`markup.ts`'s escapes, a comparison of code units). Its outermost scope is
// empty where the code under test's binds `xml`, which no generated tree declares.

/**
 * The namespace name every namespace declaration's attribute is in.
 */
const xmlnsNamespace = "http://www.w3.org/2000/xmlns/";

/**
 * The namespace declarations in scope.
 */
type Scope = ReadonlyMap<string, string>;

/**
 * Compare two strings by code point.
 */
const compareCodePoints = (left: string, right: string): number => {
  const a = Array.from(left, (character) => character.codePointAt(0) ?? 0);
  const b = Array.from(right, (character) => character.codePointAt(0) ?? 0);
  const shared = Math.min(a.length, b.length);

  for (let index = 0; index < shared; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);

    if (difference !== 0) {
      return difference;
    }
  }

  return a.length - b.length;
};

/**
 * Escape a text run.
 */
const escapeText = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\r", "&#xD;");

/**
 * Escape an attribute value.
 */
const escapeAttribute = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;")
    .replaceAll("\t", "&#x9;")
    .replaceAll("\n", "&#xA;")
    .replaceAll("\r", "&#xD;");

/**
 * Render an attribute value with each recorded reference as `&name;`.
 */
const renderValue = (attribute: Attribute): string => {
  let rendered = "";
  let position = 0;

  for (const reference of attribute.references) {
    rendered += escapeAttribute(attribute.value.slice(position, reference.offset));
    rendered += `&${reference.name};`;
    position = reference.offset + reference.name.length + 2;
  }

  return rendered + escapeAttribute(attribute.value.slice(position));
};

/**
 * The scope an element's own declarations make on top of its parent's.
 */
const scopeOf = (element: Element, parent: Scope): Scope => {
  const declared = new Map(parent);

  for (const attribute of element.attributes) {
    if (attribute.namespace === xmlnsNamespace) {
      declared.set(attribute.prefix === "xmlns" ? attribute.local : "", attribute.value);
    }
  }

  return declared;
};

/**
 * The declarations an element renders.
 */
const renderNamespaces = (scope: Scope, parent: Scope): string =>
  [...scope]
    .filter(([prefix, name]) => (parent.get(prefix) ?? "") !== name)
    .toSorted(([left], [right]) => compareCodePoints(left, right))
    .map(([prefix, name]) => (prefix === "" ? ` xmlns="${name}"` : ` xmlns:${prefix}="${name}"`))
    .join("");

/**
 * Render the attribute axis.
 */
const renderAttributes = (element: Element): string =>
  element.attributes
    .filter((attribute) => attribute.namespace !== xmlnsNamespace)
    .toSorted(
      (left, right) =>
        compareCodePoints(left.namespace, right.namespace) ||
        compareCodePoints(left.local, right.local),
    )
    .map((attribute) => ` ${attribute.qname}="${renderValue(attribute)}"`)
    .join("");

/**
 * Render a comment or a processing instruction.
 */
const renderMisc = (item: Misc): string =>
  item.kind === "comment"
    ? `<!--${item.text}-->`
    : `<?${item.target}${item.data === "" ? "" : ` ${item.data}`}?>`;

/**
 * Render an element and its children, by recursion.
 */
const renderElement = (element: Element, parent: Scope): string => {
  const scope = scopeOf(element, parent);
  const children = element.children
    .map((child: Child): string => {
      if (child.kind === "element") {
        return renderElement(child, scope);
      }

      if (child.kind === "text") {
        return escapeText(child.value);
      }

      if (child.kind === "entityRef") {
        return `&${child.name};`;
      }

      return renderMisc(child);
    })
    .join("");

  return `<${element.qname}${renderNamespaces(scope, parent)}${renderAttributes(element)}>${children}</${element.qname}>`;
};

/**
 * The recursive `canonicalize`.
 */
const recursiveCanonicalize = (doc: XmlDocument): Uint8Array => {
  const prolog = doc.prolog
    .map((item) => (item.kind === "doctype" ? "" : `${renderMisc(item)}\n`))
    .join("");
  const epilog = doc.epilog.map((item) => `\n${renderMisc(item)}`).join("");

  return new TextEncoder().encode(`${prolog}${renderElement(doc.root, new Map())}${epilog}`);
};

// The tests.

/**
 * The text of canonical bytes, which are UTF-8, so two forms compare as strings.
 *
 * @param bytes - The canonical form.
 * @returns Its text.
 */
const text = (bytes: Uint8Array): string => new TextDecoder("utf-8", { fatal: true }).decode(bytes);

/**
 * How many rotating cases each run's search compares, beside its floor and steered witnesses, and
 * the bounds each case draws its own within: depth and width small enough for the recursive
 * oracle, nodes enough for every kind and declaration to meet.
 */
const CASES = 400;

const CASE_BOUNDS: Bounds = { depth: 12, nodes: 64, width: 6 };

describe("canonicalize gives the recursive canonicalizer's bytes", () => {
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
              name: "the recursive canonicalizer of 56330e2c",
            },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "crust/canonical/documents",
          },
          ({ document }, c) =>
            Effect.sync(() => {
              c.noteAll(documentSituationsOf(document));

              assert.strictEqual(
                text(Result.getOrThrow(canonicalize(document))),
                text(recursiveCanonicalize(document)),
              );
            }),
        ),
      ),
  );
});
