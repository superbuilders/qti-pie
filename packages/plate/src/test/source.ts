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
 * Construct a source element in another namespace than QTI's.
 *
 * @param namespace The element's namespace.
 * @param local The element's local name.
 * @param attributes The element's attributes.
 * @param children The element's children.
 * @returns The element holding exactly the given name, attributes and children.
 */
export const elIn = (
  namespace: string,
  local: string,
  attributes: readonly SourceAttribute[],
  children: readonly SourceChild[],
): SourceElement => ({ attributes, children, kind: "element", local, namespace });

/**
 * Construct a source element in the QTI namespace.
 *
 * @param local The element's local name.
 * @param attributes The element's attributes.
 * @param children The element's children.
 * @returns The element holding exactly the given name, attributes and children.
 */
export const el = (
  local: string,
  attributes: readonly SourceAttribute[],
  children: readonly SourceChild[],
): SourceElement => elIn(qtiNamespace, local, attributes, children);

/**
 * Construct a source attribute.
 *
 * @param local The attribute's local name.
 * @param value The value in its source spelling.
 * @param namespace The attribute's namespace, `""` for none.
 * @param references The entity references the value holds unexpanded.
 * @returns The attribute holding exactly the given name, value and references.
 */
export const sourceAttribute = (
  local: string,
  value: string,
  namespace: string,
  references: readonly string[],
): SourceAttribute => ({ local, namespace, references, value });

/**
 * Construct a source attribute in a namespace, its value holding no entity reference.
 *
 * @param namespace The attribute's namespace.
 * @param local The attribute's local name.
 * @param value The value in its source spelling.
 * @returns The attribute holding exactly the given name and value.
 */
export const attrIn = (namespace: string, local: string, value: string): SourceAttribute =>
  sourceAttribute(local, value, namespace, []);

/**
 * Construct a source attribute in no namespace, its value holding no entity reference.
 *
 * @param local The attribute's local name.
 * @param value The value in its source spelling.
 * @returns The attribute holding exactly the given name and value.
 */
export const attr = (local: string, value: string): SourceAttribute =>
  sourceAttribute(local, value, "", []);

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

/**
 * Construct a declaration with its three attributes.
 *
 * @param local `qti-response-declaration` or `qti-outcome-declaration`.
 * @param identifier The declared identifier.
 * @param baseType The `base-type` value.
 * @param cardinality The `cardinality` value.
 * @param children The declaration's children.
 * @returns The declaration element.
 */
export const declaration = (
  local: "qti-outcome-declaration" | "qti-response-declaration",
  identifier: string,
  baseType: string,
  cardinality: string,
  children: readonly SourceChild[],
): SourceElement =>
  el(
    local,
    [attr("base-type", baseType), attr("cardinality", cardinality), attr("identifier", identifier)],
    children,
  );

/**
 * The declarations' kinds in the order the XSD's `AssessmentItemDType` sets them.
 */
const declarationOrder: readonly string[] = [
  "qti-context-declaration",
  "qti-response-declaration",
  "qti-outcome-declaration",
  "qti-template-declaration",
];

/**
 * Give an element's place among the root's leading children: its declaration kind's, and after
 * every declaration for any other element, such as a `qti-template-processing`.
 *
 * @param element The element.
 * @returns Its place.
 */
const placeOf = (element: SourceElement): number => {
  const place = declarationOrder.indexOf(element.local);

  return place === -1 ? declarationOrder.length : place;
};

/**
 * Construct an item document from its parts, its declarations in the order the XSD sets.
 *
 * @param parts The root's extra attributes, the declarations, the body's children and what follows
 *   the body.
 * @returns The document at `items/test.xml`.
 */
export const item = (parts: {
  readonly after?: readonly SourceElement[];
  readonly attributes?: readonly SourceAttribute[];
  readonly body: readonly SourceChild[];
  readonly declarations: readonly SourceElement[];
}): SourceDocument =>
  doc(
    "items/test.xml",
    el(
      "qti-assessment-item",
      [
        attr("identifier", "item"),
        attr("time-dependent", "false"),
        attr("title", "Item"),
        ...(parts.attributes ?? []),
      ],
      [
        ...parts.declarations.toSorted((left, right) => placeOf(left) - placeOf(right)),
        el("qti-item-body", [], parts.body),
        ...(parts.after ?? []),
      ],
    ),
  );
