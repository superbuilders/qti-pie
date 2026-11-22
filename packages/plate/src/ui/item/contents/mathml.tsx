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
import { addressUrl, classifyUrl, missingPathOf, urlContextOf } from "#plate/model/url.ts";
import type { KeptUrl, UrlContext } from "#plate/model/url.ts";
import type { ContentWalk } from "#plate/ui/item/content.tsx";
import { draw, slotMark } from "#plate/content/math-drawing.ts";
import type { Drawn, DrawnElement } from "#plate/content/math-drawing.ts";
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
 * Write one of a MathML element's attributes as plate writes it, under its MathML name.
 *
 * @param local The element's local name.
 * @param attribute The attribute, by the name the HTML parser reads it under.
 * @param addressing The instance, the item's location and the assets.
 * @returns The attribute and its value, none when it is dropped: an `id` and an `xref` scoped (an
 *   `xref` that names no id is dropped), a fetched URL as its address (one whose file `assets`
 *   gives no address is dropped: the shell refuses such an item before it writes any of it,
 *   through {@link missingInMath}), and any other as written.
 */
const writtenAttribute = (
  local: string,
  { name, value }: MathAttribute,
  addressing: Addressing,
): readonly MathAttribute[] => {
  if (name === "id") {
    return addressing.writing === "copy"
      ? []
      : [{ name, value: authoredId(addressing.instance, value) }];
  }

  if (name === "xref") {
    const id = authoredIdrefs(addressing.instance, value);

    return id === undefined ? [] : [{ name, value: id }];
  }

  return Option.match(fetchedContext(local, name), {
    onNone: () => [{ name, value }],
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
        { onNone: () => [], onSome: (address) => [{ name, value: address }] },
      ),
  });
};

/**
 * Write a MathML element's attributes as plate writes them: each MathML 3 admits on it
 * ({@link admits}), through {@link writtenAttribute}, in document order.
 *
 * @param local The element's local name.
 * @param attributes Its attributes.
 * @param addressing The instance, the item's location and the assets.
 * @returns The attributes, under their MathML names.
 */
const writtenAttributes = (
  local: string,
  attributes: readonly MathAttribute[],
  addressing: Addressing,
): readonly MathAttribute[] =>
  attributes
    .filter(({ name }) => admits(local, name))
    .flatMap((attribute) => writtenAttribute(local, attribute, addressing));

/**
 * Write a MathML element's attributes as the props React writes them from
 * ({@link writtenAttributes}), `class` as `className`.
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
    writtenAttributes(local, attributes, addressing).map(({ name, value }) => [
      name === "class" ? "className" : name,
      value,
    ]),
  );

/**
 * Tell whether a MathML element is a slot the walk draws an interaction in: an `mspace` whose
 * `xref`, as the author wrote it, names an interaction or a gap the walk's slots hold
 * (`Walk.slots` in `#plate/ui/item/content.tsx`).
 *
 * @param element The element.
 * @param slots The ids the walk's slots hold.
 * @returns The id it names, none where it is no such slot.
 */
const slotOf = (
  element: MathElement<RedactedNode>,
  slots: ReadonlySet<string>,
): Option.Option<string> =>
  Option.filter(
    Option.fromUndefinedOr(element.attributes.find(({ name }) => name === "xref")?.value),
    (id) => element.local === "mspace" && slots.has(id),
  );

/**
 * Write a MathML tree as MathJax draws it: each element with the attributes plate writes on it
 * ({@link writtenAttributes}) and its `style`, and each `annotation-xml` with its attributes and no
 * content, which MathJax never draws. MathJax reads a `style` as it reads `mathcolor` and
 * `mathbackground`, drawing its colour, border and background as the drawing's SVG attributes, as
 * AlphaTest's player drew a coloured digit or `\fcolorbox`'s frame; the page itself carries no
 * author style, so the MathML beside the drawing is written without it. A slot's `mspace`
 * ({@link slotOf}) is handed to MathJax with nothing but its mark ({@link slotMark}), which the
 * drawing sizes and places.
 *
 * @param element The tree: a `math` element's payload, or an element below it.
 * @param addressing The instance, the item's location and the assets.
 * @param slots The ids of the interactions the walk draws in this formula's slots.
 * @returns The tree, as the drawing reads it.
 */
const formulaOf = (
  element: MathElement<RedactedNode>,
  addressing: Addressing,
  slots: ReadonlySet<string>,
): MathElement<never> => ({
  attributes: slotOf(element, slots).pipe(
    Option.match({
      onNone: () => [
        ...writtenAttributes(element.local, element.attributes, addressing),
        ...element.attributes.filter(({ name }) => name === "style"),
      ],
      onSome: (id) => [{ name: slotMark, value: id }],
    }),
  ),
  children: element.children.map((child): MathChild<never> => {
    switch (child.kind) {
      case "annotation-xml": {
        return {
          attributes: writtenAttributes(child.kind, child.attributes, addressing),
          content: [],
          kind: "annotation-xml",
        };
      }
      case "element": {
        return formulaOf(child, addressing, slots);
      }
      case "text": {
        return child;
      }
      default: {
        return child satisfies never;
      }
    }
  }),
  kind: "element",
  local: element.local,
});

/**
 * Write a drawn element's attributes as the props React writes them from.
 *
 * @param element The element.
 * @returns The props.
 */
const drawnProps = (element: DrawnElement): Readonly<Record<string, string>> =>
  Object.fromEntries(element.attributes.map(({ name, value }) => [name, value]));

/**
 * Write a drawing's nodes as server React elements: each element with its attributes under the
 * names React writes them by, text as itself.
 *
 * @param nodes The nodes.
 * @returns The nodes, in order, each keyed by its index.
 */
const drawnNodes = (nodes: readonly Drawn[]): readonly ReactNode[] =>
  nodes.map((node, index): ReactNode =>
    node.kind === "text"
      ? node.text
      : createElement(node.name, { ...drawnProps(node), key: index }, drawnNodes(node.children)),
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
 * Render a `math` element's content node: `plate-math`, a `span`, holding the formula as MathJax
 * draws it ({@link draw}) and the `math` element as plate writes it, for assistive technology.
 *
 * The parts:
 *
 * - `plate-math`, the root, `data-display="block"` for a display formula, which the base sheet lays
 *   out on a line of its own, centred, as MathJax lays out its display container;
 * - `plate-math-box`, an inline block as wide as the formula whose baseline is the formula's: its
 *   first line holds `plate-math-height`, an empty `svg` as tall as the formula reaches above its
 *   baseline, standing on it, and below that line stands `plate-math-depth`, an empty `svg` as deep
 *   as the formula reaches below it;
 * - `plate-math-drawing`, MathJax's `svg`, hidden from assistive technology, which the base sheet
 *   lays over the box from its foot, so the formula's baseline is the box's and the line's, as
 *   MathJax's `vertical-align` would place it, with no `style` written;
 * - `plate-math-slots`, where the formula holds slots, an `svg` of no `viewBox` over the drawing, as
 *   large as it, holding a `foreignObject` (`plate-math-slot`) at each slot's box, its place as
 *   percentages of the formula's, and in it the interaction or gap the slot names, as the walk
 *   renders it, in the page's own pixels: the slot's only appearance on the page (`Walk.slots`);
 * - The `math` element with its attributes, its descendants by their MathML local names, and each
 *   `annotation-xml`'s content as the body's, which the base sheet hides from the eye only, so a
 *   screen reader voices and brailles the MathML the author wrote.
 *
 * @param node The node, as the MathML module's `copy` gives it.
 * @param walk Its key, the walk where it stands and the way to write what it holds.
 * @returns The formula.
 */
export const content = (node: MathContent, walk: ContentWalk): ReactNode => {
  const { addressing, slots } = walk.walk;
  const formula = draw(
    formulaOf(node.payload, addressing, new Set(slots.keys())),
    new Map([...slots].map(([id, slotted]) => [id, slotted.size])),
  );

  return createElement(
    "span",
    {
      "data-display": formula.display ? "block" : undefined,
      "data-slot": "plate-math",
      key: walk.key,
    },
    createElement(
      "span",
      { "data-slot": "plate-math-box" },
      createElement("svg", {
        "data-slot": "plate-math-height",
        height: formula.height,
        width: formula.width,
      }),
      createElement("svg", { "data-slot": "plate-math-depth", height: formula.depth, width: "0" }),
      createElement(
        "svg",
        {
          ...drawnProps(formula.drawing),
          "aria-hidden": "true",
          "data-slot": "plate-math-drawing",
          focusable: "false",
        },
        drawnNodes(formula.drawing.children),
      ),
      formula.slots.length === 0
        ? null
        : createElement(
            "svg",
            {
              "data-slot": "plate-math-slots",
              height: formula.total,
              role: "none",
              width: formula.width,
            },
            formula.slots.map((slot) =>
              createElement(
                "foreignObject",
                {
                  "data-slot": "plate-math-slot",
                  height: slot.height,
                  key: slot.id,
                  width: slot.width,
                  x: slot.x,
                  y: slot.y,
                },
                slots.get(slot.id)?.render(),
              ),
            ),
          ),
    ),
    createElement(
      "math",
      propsOf("math", node.payload.attributes, addressing),
      childrenOf(node.payload.children, walk),
    ),
  );
};

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
          Option.flatMap(
            Result.getFailure(addressUrl(url, addressing.document, addressing.assets)),
            missingPathOf,
          ),
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
