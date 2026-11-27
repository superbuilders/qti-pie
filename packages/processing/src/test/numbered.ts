/**
 * The numbering of a tree parsed from text, for processing's own tests, fixtures and tools: each
 * element's `start` its pre-order position among every node of its document, the document itself
 * at 0, so the root element at 1, as pantry's `flatten` numbers a document's nodes. In production
 * an element's `start` is pantry's own, read from its rows, and nothing recounts it; here the
 * numbering need only be consistent.
 *
 * @module
 */
import type { XmlAttribute, XmlElement, XmlNode } from "#processing/xml.ts";

/**
 * An element as a reader of text gives it: an element without its `start`.
 */
export interface UnnumberedElement {
  readonly attributes: readonly XmlAttribute[];
  readonly children: readonly UnnumberedNode[];
  readonly kind: "element";
  readonly local: string;
  readonly namespace: string;
}

/**
 * Anything an unnumbered element holds.
 */
export type UnnumberedNode =
  | UnnumberedElement
  | { readonly kind: "comment" | "entityRef" | "pi" }
  | { readonly kind: "text"; readonly value: string };

/**
 * An element numbered, and the position after its last node.
 */
interface Numbered {
  readonly element: XmlElement;
  readonly next: number;
}

/**
 * Number an element and every node under it in pre-order from a position.
 *
 * @param element - The element.
 * @param at - Its position.
 * @returns It numbered, and the position after its last node.
 */
const numberedFrom = (element: UnnumberedElement, at: number): Numbered => {
  let next = at + 1;
  const children: XmlNode[] = [];
  for (const child of element.children) {
    if (child.kind === "element") {
      const { element: numberedChild, next: after } = numberedFrom(child, next);
      children.push(numberedChild);
      next = after;
    } else {
      children.push(
        child.kind === "text" ? { kind: "text", value: child.value } : { kind: child.kind },
      );
      next += 1;
    }
  }

  return {
    element: {
      attributes: element.attributes.map(({ local, namespace, value }) => ({
        local,
        namespace,
        value,
      })),
      children,
      kind: "element",
      local: element.local,
      namespace: element.namespace,
      start: at,
    },
    next,
  };
};

/**
 * Number a document's root element and every node under it, the root at 1.
 *
 * @param root - The root element.
 * @returns It numbered.
 */
export const numbered = (root: UnnumberedElement): XmlElement => numberedFrom(root, 1).element;
