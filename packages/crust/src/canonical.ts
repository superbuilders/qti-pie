import { Array as Arr, Order, Result } from "effect";
import { attributeValue, miscMarkup } from "#crust/markup.ts";
import { tour } from "#crust/tour.ts";
import type { Leaf } from "#crust/tour.ts";
import { checkedText, codePointOrder } from "#crust/charset.ts";
import { utf8Of } from "#crust/encode.ts";
import type { WriteRefusal } from "#crust/errors.ts";
import { XML_NAMESPACE, XMLNS_NAMESPACE } from "#crust/tree.ts";
import type { Attribute, Element, XmlDocument } from "#crust/tree.ts";

/**
 * The namespace declarations in scope, from prefix to namespace name; the default namespace is the
 * empty prefix. A prefix that is absent is not declared, and an empty name is only ever the
 * default.
 */
type Scope = ReadonlyMap<string, string>;

/**
 * Escape `&`, `<`, `>` and CR the way canonical XML writes a text run.
 */
const escapeText = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\r", "&#xD;");

/**
 * The scope an element's own declarations make on top of its parent's.
 */
const scopeOf = (element: Element, parent: Scope): Scope => {
  const declared = new Map(parent);

  for (const attribute of element.attributes) {
    if (attribute.namespace === XMLNS_NAMESPACE) {
      declared.set(attribute.prefix === "xmlns" ? attribute.local : "", attribute.value);
    }
  }

  return declared;
};

/**
 * The ` xmlns` declarations an element renders: each one in scope that changes its prefix's binding
 * from its parent's, the default first, then by prefix. A prefix the parent's scope holds changes
 * when its name does; one it does not hold is bound to no namespace there, as an empty name binds
 * it, so it changes only to a name that is not empty. So an empty default is rendered only when the
 * parent's default is not empty.
 */
const renderNamespaces = (scope: Scope, parent: Scope): string =>
  [...scope]
    .filter(([prefix, name]) => (parent.has(prefix) ? parent.get(prefix) !== name : name !== ""))
    .toSorted(([left], [right]) => codePointOrder(left, right))
    .map(([prefix, name]) => (prefix === "" ? ` xmlns="${name}"` : ` xmlns:${prefix}="${name}"`))
    .join("");

/**
 * Render the attribute axis: the non-declaration attributes by namespace name, then local name.
 */
const renderAttributes = (element: Element): string =>
  element.attributes
    .filter((attribute) => attribute.namespace !== XMLNS_NAMESPACE)
    .toSorted(
      Order.combine(
        Order.mapInput(codePointOrder, ({ namespace }: Attribute) => namespace),
        Order.mapInput(codePointOrder, ({ local }: Attribute) => local),
      ),
    )
    .map(
      (attribute) => ` ${attribute.qname}="${attributeValue(attribute, Number.POSITIVE_INFINITY)}"`,
    )
    .join("");

/**
 * Render a node that holds no other node: a text run escaped, an entity reference as `&name;`, or
 * a comment or a processing instruction.
 *
 * @param node - The node to render.
 * @returns The node's canonical form.
 */
const renderLeaf = (node: Leaf): string => {
  if (node.kind === "text") {
    return escapeText(node.value);
  }

  if (node.kind === "entityRef") {
    return `&${node.name};`;
  }

  return miscMarkup(node);
};

/**
 * The scope above the root element: the `xml` prefix, which Namespaces in XML 1.0 section 3 binds
 * to its namespace by definition, and nothing else. So an element's written declaration of `xml`
 * to that name gives no name its parent's scope lacks, and is never rendered, as Canonical XML 1.0
 * section 2.3 omits the namespace node "with local name xml, which defines the xml prefix, if its
 * string value is http://www.w3.org/XML/1998/namespace".
 */
const outermost: Scope = new Map([["xml", XML_NAMESPACE]]);

/**
 * Render an element, its namespace axis, its attribute axis and its children, always with a
 * separate end tag.
 *
 * The element is rendered by its {@link tour}, so a tree of any depth or width renders without
 * recursion. The scopes start from the {@link outermost} one, each open pushes the scope the element
 * makes and each close pops it, so every element renders its namespace axis against the scope on
 * top, its parent's, or the outermost for the root. The tour closes each element it opens, so the
 * outermost scope is never popped.
 *
 * @param root - The element to render.
 * @returns The element's canonical form.
 */
const renderElement = (root: Element): string => {
  const rendered: string[] = [];
  const opened: Arr.NonEmptyArray<Scope> = [outermost];
  for (const step of tour(root)) {
    if (step.kind === "leaf") {
      rendered.push(renderLeaf(step.node));
    } else if (step.kind === "close") {
      opened.pop();
      rendered.push(`</${step.element.qname}>`);
    } else {
      const parent = Arr.lastNonEmpty(opened);
      const scope = scopeOf(step.element, parent);
      opened.push(scope);
      rendered.push(
        `<${step.element.qname}${renderNamespaces(scope, parent)}${renderAttributes(step.element)}>`,
      );
    }
  }

  return rendered.join("");
};

/**
 * The text of a document's canonical form: its prolog but the DOCTYPE, its root, and its epilog.
 *
 * @param doc - The document.
 * @returns The text.
 */
const canonicalText = (doc: XmlDocument): string => {
  const prolog = doc.prolog
    .flatMap((node) => (node.kind === "doctype" ? [] : [`${miscMarkup(node)}\n`]))
    .join("");
  const epilog = doc.epilog.map((item) => `\n${miscMarkup(item)}`).join("");

  return `${prolog}${renderElement(doc.root)}${epilog}`;
};

/**
 * Canonicalize a document as Canonical XML 1.0 with comments, in UTF-8.
 *
 * One extension of the specification: an entity the document never declares stays a reference, so
 * an `EntityRef` child renders as `&name;` and an attribute's recorded references render as
 * `&name;` unescaped at their offsets. The XML declaration and the DOCTYPE are dropped, and every
 * other prolog item is followed, and every epilog item preceded, by a line feed.
 *
 * Its text is written as crust writes every text, once the document breaks no rule of XML no text
 * can write ({@link checkedText}), in crust's one UTF-8 encoder.
 *
 * @param doc - The document to canonicalize.
 * @returns The canonical form's bytes, or the `WriteRefusal` for the first such rule.
 */
export const canonicalize = (doc: XmlDocument): Result.Result<Uint8Array, WriteRefusal> =>
  Result.map(checkedText(doc, canonicalText), utf8Of);
