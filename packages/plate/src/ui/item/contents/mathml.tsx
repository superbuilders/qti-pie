/**
 * MathML (I-18) in the server shell: the view of a `math` element's content node, the tree the
 * MathML module read (`#plate/content/mathml.ts`) written element for element as server React
 * elements, which the browser creates in the MathML namespace below `math` and lays out natively
 * (MathML Core), and a screen reader voices and brailles (WCAG 1.1.1 and 1.3.1).
 *
 * Each element keeps the attributes plate writes on it and no other (`elementAttributes` in
 * `#plate/content/mathml-attributes.ts`: MathML 3's own but `style`), as the HTML subset
 * guards the body's elements: `class` as React's `className`; an `id`, and the id an `xref` names,
 * scoped by the instance as the body's are (`#plate/ui/item/ids.ts`); each URL a browser fetches
 * or follows (`urlContextOf` of `#plate/model/url.ts`, the table `checkAdmitted` secures them by)
 * as its address, as the body writes its URLs; and every other as
 * written, `definitionURL` and `cdbase` among them, which name a definition and which no browser
 * fetches. No `dir` is added: MathML Core's user agent stylesheet already starts every `math` left
 * to right. An `annotation-xml`'s content is written as the body is, through the walk.
 *
 * Stated limit: React creates an `annotation-xml`'s children in the MathML namespace, where the
 * HTML parser reads the server's HTML of an `annotation-xml` whose `encoding` is HTML's in the HTML
 * namespace; no item of the corpus holds an `annotation-xml`.
 *
 * The body walk (`#plate/ui/item/content.tsx`) imports this file, so it imports nothing of the
 * walk: what the node holds is written through {@link ContentWalk.nodes}.
 *
 * @module
 */
import { Option, Result } from "effect";
import { createElement } from "react";
import type { ReactNode } from "react";
import type { MathAttribute, MathChild, MathElement } from "#plate/content/mathml.ts";
import { elementAttributes } from "#plate/content/mathml-attributes.ts";
import type { ContentPayload } from "#plate/content/modules.ts";
import { mathmlNamespace } from "#plate/document/source.ts";
import { addressUrl, classifyUrl, urlContextOf } from "#plate/model/url.ts";
import type { KeptUrl, UrlContext } from "#plate/model/url.ts";
import type { ContentWalk } from "#plate/ui/item/content.tsx";
import type { Addressing } from "#plate/ui/item/html.ts";
import { authoredId, authoredIdrefs } from "#plate/ui/item/ids.ts";
import type { RedactedNode } from "#plate/model/item.ts";

/**
 * A `math` element's content node, as the redacted body holds it.
 */
type MathContent = Extract<ContentPayload, { readonly element: "math" }>;

/**
 * Look up how a browser uses a MathML attribute's URL, in the one table of URL attributes
 * (`urlContextOf` of `#plate/model/url.ts`).
 *
 * @param local The element's local name, in the MathML namespace.
 * @param name The attribute's name, in no namespace.
 * @returns The attribute's context, none when no browser fetches or follows it.
 */
const fetchedContext = (local: string, name: string): Option.Option<UrlContext> =>
  urlContextOf({ local, namespace: mathmlNamespace }, { local: name, namespace: "" });

/**
 * Tell whether MathML 3 admits an attribute on an element.
 *
 * @param local The element's local name.
 * @param name The attribute's name.
 * @returns Whether its list holds the name.
 */
const admits = (local: string, name: string): boolean =>
  elementAttributes.get(local)?.has(name) === true;

/**
 * Scope a same-document reference as the id it names, so `#a` still finds the author's `id="a"`
 * once both are scoped. A bare `#` names no id and stays as written.
 *
 * @param url The kept value.
 * @param instance The instance.
 * @returns The value, its fragment scoped when it is one.
 */
const scopedFragment = (url: KeptUrl, instance: string): KeptUrl =>
  url.kind === "fragment" && url.fragment !== ""
    ? { fragment: authoredId(instance, url.fragment), kind: "fragment" }
    : url;

/**
 * Read a URL attribute's value in its kept form.
 *
 * @param context How a browser uses it.
 * @param value The value as written.
 * @returns The kept URL, none when the value is dropped.
 */
const keptUrl = (context: UrlContext, value: string): Option.Option<KeptUrl> => {
  const url = classifyUrl(context, value);

  return url.kind === "dropped" ? Option.none() : Option.some(url);
};

/**
 * Write one of a MathML element's attributes as React writes it.
 *
 * @param local The element's local name.
 * @param attribute The attribute, by the name the HTML parser reads it under.
 * @param addressing The instance, the item's location and the assets.
 * @returns The prop and its value, none when the attribute is dropped: `class` as `className`, an
 *   `id` and an `xref` scoped (an `xref` that names no id is dropped), a fetched URL as its address
 *   (one whose file `assets` gives no address is dropped: the shell refuses such an item before it
 *   writes any of it, through {@link missingInMath}), and any other as written.
 */
const propFor = (
  local: string,
  { name, value }: MathAttribute,
  addressing: Addressing,
): readonly (readonly [string, string])[] => {
  if (name === "class") {
    return [["className", value]];
  }

  if (name === "id") {
    return addressing.writing === "copy" ? [] : [["id", authoredId(addressing.instance, value)]];
  }

  if (name === "xref") {
    const id = authoredIdrefs(addressing.instance, value);

    return id === undefined ? [] : [[name, id]];
  }

  return Option.match(fetchedContext(local, name), {
    onNone: () => [[name, value]],
    onSome: (context) =>
      Option.match(
        Option.flatMap(keptUrl(context, value), (url) =>
          Result.getSuccess(
            addressUrl(
              scopedFragment(url, addressing.instance),
              addressing.document,
              addressing.assets,
            ),
          ),
        ),
        { onNone: () => [], onSome: (address) => [[name, address]] },
      ),
  });
};

/**
 * Write a MathML element's attributes as the props React writes them from: each MathML 3 admits on
 * it ({@link admits}), through {@link propFor}, in document order.
 *
 * @param local The element's local name.
 * @param attributes Its attributes.
 * @param addressing The instance, the item's location and the assets.
 * @returns The props.
 */
const propsOf = (
  local: string,
  attributes: readonly MathAttribute[],
  addressing: Addressing,
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    attributes
      .filter(({ name }) => admits(local, name))
      .flatMap((attribute) => propFor(local, attribute, addressing)),
  );

/**
 * Write a MathML element's children: text as itself, an element with its own children, an
 * `annotation-xml` with its content written through the walk.
 *
 * @param children The children.
 * @param walk The walk where the `math` stands.
 * @returns The children, in order, each keyed by its index.
 */
const childrenOf = (
  children: readonly MathChild<RedactedNode>[],
  walk: ContentWalk,
): readonly ReactNode[] =>
  children.map((child, index): ReactNode => {
    switch (child.kind) {
      case "annotation-xml": {
        return createElement(
          "annotation-xml",
          { ...propsOf("annotation-xml", child.attributes, walk.walk.addressing), key: index },
          walk.nodes(child.content),
        );
      }
      case "element": {
        return createElement(
          child.local,
          { ...propsOf(child.local, child.attributes, walk.walk.addressing), key: index },
          childrenOf(child.children, walk),
        );
      }
      case "text": {
        return child.text;
      }
      default: {
        return child satisfies never;
      }
    }
  });

/**
 * Render a `math` element's content node: the `math` element with its attributes, its
 * descendants by their MathML local names, and each `annotation-xml`'s content as the body's.
 *
 * @param node The node, as the MathML module's `copy` gives it.
 * @param walk Its key, the walk where it stands and the way to write what it holds.
 * @returns The `math` element.
 */
export const content = (node: MathContent, walk: ContentWalk): ReactNode =>
  createElement(
    "math",
    { ...propsOf("math", node.payload.attributes, walk.walk.addressing), key: walk.key },
    childrenOf(node.payload.children, walk),
  );

/**
 * Give the element a child of a tree is for the URL check: an element as itself, an
 * `annotation-xml` as an element of its attributes alone, since its content is body content, which
 * the shell checks as it checks the body; text is none.
 *
 * @param child The child.
 * @returns The element, none for text.
 */
const checkedElements = (child: MathChild<RedactedNode>): readonly MathElement<RedactedNode>[] => {
  switch (child.kind) {
    case "annotation-xml": {
      return [{ attributes: child.attributes, children: [], kind: "element", local: child.kind }];
    }
    case "element": {
      return [child];
    }
    case "text": {
      return [];
    }
    default: {
      return child satisfies never;
    }
  }
};

/**
 * Find the first file a MathML tree's fetched URLs name ({@link fetchedContext}) that `assets`
 * gives no address, so `<Item>` refuses the item before it writes any of it, as it refuses one
 * whose body names such a file. An `annotation-xml`'s content is body content, which the shell
 * checks as it checks the body.
 *
 * @param element The tree: a `math` element's payload, as the MathML module's `copy` gives it, or
 *   an element below it.
 * @param addressing The item's location and the assets.
 * @returns The file's path from the package root, or undefined when every file has an address.
 */
export const missingInMath = (
  element: MathElement<RedactedNode>,
  addressing: Pick<Addressing, "assets" | "document">,
): string | undefined => {
  for (const { name, value } of element.attributes) {
    const missing = Option.flatMap(
      Option.filter(fetchedContext(element.local, name), () => admits(element.local, name)),
      (context) =>
        Option.flatMap(keptUrl(context, value), (url) =>
          Result.getFailure(addressUrl(url, addressing.document, addressing.assets)),
        ),
    );

    if (Option.isSome(missing)) {
      return missing.value;
    }
  }

  for (const child of element.children.flatMap(checkedElements)) {
    const missing = missingInMath(child, addressing);

    if (missing !== undefined) {
      return missing;
    }
  }

  return undefined;
};
