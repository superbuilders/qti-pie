/**
 * Test support: the constructors with which a test hand-builds a source document
 * ({@link SourceDocument}) node by node, an element in the QTI namespace and an attribute in none
 * unless the test names another.
 *
 * @module
 */
import { qtiNamespace } from "#plate/document/source.ts";
import type {
  SourceAttribute,
  SourceChild,
  SourceDocument,
  SourceElement,
  SourceEntity,
  SourceText,
} from "#plate/document/source.ts";

/**
 * Construct a source document.
 *
 * @param location The document's location.
 * @param root The root element.
 * @returns The document holding `root` at `location`.
 */
export const doc = (location: string, root: SourceElement): SourceDocument => ({ location, root });

/**
 * Construct a source element, in the QTI namespace unless another is given.
 *
 * @param local The element's local name.
 * @param attributes The element's attributes, none by default.
 * @param children The element's children, none by default.
 * @param namespace The element's namespace, QTI's by default.
 * @returns The element holding exactly the given name, attributes and children.
 */
export const el = (
  local: string,
  attributes: readonly SourceAttribute[] = [],
  children: readonly SourceChild[] = [],
  namespace: string = qtiNamespace,
): SourceElement => ({ attributes, children, kind: "element", local, namespace });

/**
 * Construct a source attribute, in no namespace unless another is given.
 *
 * @param local The attribute's local name.
 * @param value The value in its source spelling.
 * @param namespace The attribute's namespace, none by default.
 * @param references The entity references the value holds unexpanded, none by default.
 * @returns The attribute holding exactly the given name, value and references.
 */
export const attr = (
  local: string,
  value: string,
  namespace = "",
  references: readonly string[] = [],
): SourceAttribute => ({ local, namespace, references, value });

/**
 * Construct a run of character data.
 *
 * @param value The characters as the document holds them.
 * @returns The text node holding `value`.
 */
export const text = (value: string): SourceText => ({ kind: "text", text: value });

/**
 * Construct a reference to an undeclared entity.
 *
 * @param name The entity's name, without `&` and `;`.
 * @returns The entity node naming `name`.
 */
export const entity = (name: string): SourceEntity => ({ kind: "entity", name });

/**
 * A paragraph of text, the least item body the ASI XSD admits (`qti-item-body` holds at least one
 * block), for an item whose body a test does not read.
 */
export const paragraph: SourceElement = el("p", [], [text("Read.")]);
