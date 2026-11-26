/**
 * The document as the compiler reads it: a structural view of an XML element tree, so crust's
 * `Element` (the reader every stored document goes through) is an input as it stands, with the
 * readers of an element's attributes and children that every expression and rule reader shares.
 *
 * @module
 */
import { regex } from "arkregex";

/**
 * QTI 3.0.1's namespace, of every element the compiler reads.
 */
export const qtiNamespace = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * An attribute: its local name, its namespace (`""` for none) and its value as normalized.
 */
export interface XmlAttribute {
  readonly local: string;
  readonly namespace: string;
  readonly value: string;
}

/**
 * Character data.
 */
export interface XmlText {
  readonly kind: "text";
  readonly value: string;
}

/**
 * What an element holds that the compiler skips: a comment, a processing instruction, an
 * unexpanded entity reference.
 */
export interface XmlOther {
  readonly kind: "comment" | "entityRef" | "pi";
}

/**
 * An element: its name, attributes in document order and children in document order.
 */
export interface XmlElement {
  readonly attributes: readonly XmlAttribute[];
  readonly children: readonly XmlNode[];
  readonly kind: "element";
  readonly local: string;
  readonly namespace: string;
}

/**
 * Anything an element holds.
 */
export type XmlNode = XmlElement | XmlOther | XmlText;

/**
 * The value of an attribute in no namespace, as written.
 *
 * @param element - The element.
 * @param name - The attribute's local name.
 * @returns Its value, or `undefined` when the element does not write it.
 */
export const attributeOf = (element: XmlElement, name: string): string | undefined =>
  element.attributes.find((attribute) => attribute.namespace === "" && attribute.local === name)
    ?.value;

/**
 * The element children in QTI's namespace, in document order.
 *
 * @param element - The element.
 * @returns Its QTI element children.
 */
export const qtiChildren = (element: XmlElement): readonly XmlElement[] =>
  element.children.filter(
    (child): child is XmlElement => child.kind === "element" && child.namespace === qtiNamespace,
  );

/**
 * An element's character data, every text child joined in order.
 *
 * @param element - The element.
 * @returns Its text.
 */
export const textOf = (element: XmlElement): string =>
  element.children.map((child) => (child.kind === "text" ? child.value : "")).join("");

/**
 * The four characters XML counts as white space (XML 1.0 production [3]).
 */
const xmlSpace: ReadonlySet<string> = new Set([" ", "\t", "\n", "\r"]);

/**
 * A run of XML white space.
 */
const xmlSpaceRun = regex("[\\t\\n\\r ]+", "u");

/**
 * Text with XML white space removed at both ends, as an element's typed text is read (reading 7).
 *
 * @param text - The text.
 * @returns It, trimmed of XML white space alone.
 */
export const trimXmlSpace = (text: string): string => {
  let start = 0;
  let end = text.length;
  while (start < end && xmlSpace.has(text.charAt(start))) {
    start += 1;
  }

  while (end > start && xmlSpace.has(text.charAt(end - 1))) {
    end -= 1;
  }

  return text.slice(start, end);
};

/**
 * Text with XML white space collapsed: each run one space, none at either end, as XML Schema's
 * whiteSpace `collapse` reads an attribute's typed value (reading 7).
 *
 * @param text - The text.
 * @returns It, collapsed.
 */
export const collapseXmlSpace = (text: string): string =>
  text
    .split(xmlSpaceRun)
    .filter((token) => token.length > 0)
    .join(" ");
