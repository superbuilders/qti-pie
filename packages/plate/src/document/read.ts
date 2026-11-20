/**
 * The adapter from the shared XML reader to the renderer's source view.
 *
 * This is the only module that imports `@qti-pie/crust/read.ts`: the reader's tree stays here, and
 * everything after it walks a {@link SourceDocument}. A reader that cannot build a tree fails with
 * crust's own error, which a host's own input (a PNP) decodes and an admitted document never meets.
 * `write.ts` is its counterpart for the shared writer, and a module that builds a tree to write
 * imports crust's tree types only.
 *
 * @module
 */
import type { ReaderRefusal, WellFormednessError } from "@qti-pie/crust/errors.ts";
import { readXml } from "@qti-pie/crust/read.ts";
import type { Attribute, Child, Element } from "@qti-pie/crust/tree.ts";
import { Effect } from "effect";
import type {
  SourceAttribute,
  SourceChild,
  SourceDocument,
  SourceElement,
} from "#plate/document/source.ts";

/**
 * Map one of the reader's attributes, a namespace declaration included, to the source view.
 *
 * @param attribute The reader's attribute.
 * @returns The attribute with its value as read and the names of its unexpanded references.
 */
const toAttribute = (attribute: Attribute): SourceAttribute => ({
  local: attribute.local,
  namespace: attribute.namespace,
  references: attribute.references.map((reference) => reference.name),
  value: attribute.value,
});

/**
 * Map a child of the reader's element that is not an element to what the source view keeps of it.
 *
 * Text becomes text whether or not it was a CDATA section, an undeclared entity stays one by name,
 * and comments and processing instructions are dropped.
 *
 * @param child The reader's child.
 * @returns The child as the view holds it, or nothing for a comment or processing instruction.
 */
const toLeaf = (child: Exclude<Child, Element>): readonly SourceChild[] => {
  if (child.kind === "text") {
    return [{ kind: "text", text: child.value }];
  }

  if (child.kind === "entityRef") {
    return [{ kind: "entity", name: child.name }];
  }

  return [];
};

/**
 * Map one of the reader's elements, and everything under it, to the source view.
 *
 * The recursion is bounded by the reader, which refuses a document with more than 256 elements
 * open at once.
 *
 * @param element The reader's element.
 * @returns The element with its name parts, attributes and the children the view keeps.
 */
const toElement = (element: Element): SourceElement => ({
  attributes: element.attributes.map(toAttribute),
  children: element.children.flatMap((child) =>
    child.kind === "element" ? [toElement(child)] : toLeaf(child),
  ),
  kind: "element",
  local: element.local,
  namespace: element.namespace,
});

/**
 * Read a document's bytes into the renderer's source view.
 *
 * The shared reader decodes and parses the bytes; its tree then becomes a {@link SourceDocument}
 * whose elements keep their namespace, local name and attributes in order, namespace declarations
 * included. An undeclared entity the reader keeps stays a `SourceEntity`, which leaves the document
 * unchecked.
 *
 * @param location The document's location as the host named it, which the source carries.
 * @param bytes The document as read from storage.
 * @returns The source document; the reader's `WellFormednessError` or `ReaderRefusal` when it cannot
 *   build a tree.
 */
export const readSource = Effect.fn("plate.readSource")(function* readSource(
  location: string,
  bytes: Uint8Array,
): Effect.fn.Return<SourceDocument, WellFormednessError | ReaderRefusal> {
  yield* Effect.annotateCurrentSpan("document.location", location);

  const document = yield* readXml(bytes);

  return { location, root: toElement(document.root) };
});
