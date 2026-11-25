/**
 * An item rendered as a host renders it, and the facts plate's UI suite reads of the page: the
 * islands in its element tree, and from its HTML every id, every IDREF, every control and the name
 * a screen reader gives it, every mark, every notice and every entry its form posts.
 *
 * The facts are read against tables written from the web's own specifications, not from plate's
 * code: HTML's IDREF attributes and its form entry list, WAI-ARIA's roles that need a name, and the
 * Accessible Name computation as HTML-AAM gives it for each element. Test support for plate's UI
 * suite under `src/ui/`; it reads plate through its public entries alone.
 *
 * @module
 * @see https://www.w3.org/TR/accname-1.2/
 * @see https://www.w3.org/TR/html-aam-1.0/#accessible-name-computations-by-html-element
 * @see https://www.w3.org/TR/wai-aria-1.2/#namefromcontent
 */
import { regex } from "arkregex";
import { Data, Function, Record as Rec } from "effect";
import { parseHTML } from "linkedom";
import { Children, Component, Fragment, Suspense, createElement, isValidElement } from "react";
import type { JSXElementConstructor, ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Accepted, Responses as ResponseValues } from "@qti-pie/plate";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";

/**
 * An element the island walk cannot expand: a class component, an async component, or a built-in
 * other than a fragment or a Suspense boundary, none of which plate's server shell writes. A defect
 * of the walk, thrown, so a shell that starts writing one is seen at once rather than walked past.
 */
class UnwalkedElement extends Data.TaggedError("UnwalkedElement")<{ readonly element: string }> {
  /**
   * The element the walk met.
   */
  override get message(): string {
    return `The island walk met ${this.element}, which it cannot expand; teach it this element type.`;
  }
}

/**
 * A kind of interaction plate renders, as its item model names it: read from the public type of an
 * accepted item's body, so the suite's kinds are plate's.
 */
export type InteractionKind = Extract<
  Accepted["item"]["body"][number],
  { readonly response: string }
>["kind"];

/**
 * Where on a page a fact stands: inside the interaction of a kind, its root and the parts plate
 * draws inside it, or elsewhere in the item, its authored content and plate's own parts around it.
 */
export type Where = InteractionKind | "item";

/**
 * A client component a page's element tree holds, an island: the name its module and export give
 * it, and the props the server hands it, which ship to the page with its code.
 */
export interface Island {
  readonly name: string;
  readonly props: unknown;
}

/**
 * A page of an item: the client components its element tree holds, and the facts its HTML shows.
 */
export interface Page {
  /**
   * Every client component, an island, the element tree holds, in tree order.
   */
  readonly islands: readonly Island[];
  readonly facts: PageFacts;
}

/**
 * What a page's HTML shows, as the suite's rules read it.
 */
export interface PageFacts {
  /**
   * Every control a screen reader reaches, the name the Accessible Name computation gives it,
   * empty for none, and where it stands.
   */
  readonly controls: readonly {
    readonly element: string;
    readonly name: string;
    readonly where: Where;
  }[];
  /**
   * Every `id`, in document order, and where it stands.
   */
  readonly ids: readonly { readonly id: string; readonly where: Where }[];
  /**
   * Every mark a review draws, in document order ({@link DrawnMark}).
   */
  readonly marks: readonly DrawnMark[];
  /**
   * The text of every `plate-notice`, in document order.
   */
  readonly notices: readonly string[];
  /**
   * Every entry the page's form posts, its name and its text, in tree order, as HTML's entry list
   * builds it.
   */
  readonly posted: readonly FormEntry[];
  /**
   * Every IDREF the page writes: the attribute, the element that carries it, the id it names, and
   * where it stands.
   */
  readonly references: readonly Reference[];
}

/**
 * A mark a review draws: what it says; whether it marks an answer, each token of a part's
 * `data-mark`, or a choice of the bank, `missed` for a chip the review marks as left behind
 * (`data-missed`), which marks the choice whatever pairs miss it; whether a screen reader reaches
 * the part, outside every subtree left out of the accessibility tree; and the part, by its
 * `data-slot`.
 */
export interface DrawnMark {
  readonly mark: string;
  readonly on: "answer" | "choice";
  readonly read: boolean;
  readonly slot: string;
}

/**
 * An IDREF the page writes: the attribute, the element that carries it, the id it names, and where
 * it stands.
 */
export interface Reference {
  readonly attribute: string;
  readonly element: string;
  readonly id: string;
  readonly where: Where;
}

/**
 * Tell whether an element type is a function component, which React renders by calling it with
 * its props: a function that is no class component, which React tells by the
 * `prototype.isReactComponent` that `Component` sets.
 *
 * @param type The element's type.
 * @returns Whether it is a function component.
 * @see https://react.dev/reference/react/Component
 */
const isFunctionComponent = <P>(
  type: string | JSXElementConstructor<P>,
): type is (props: P) => ReactNode | Promise<ReactNode> =>
  typeof type === "function" && !(type.prototype instanceof Component);

/**
 * Tell whether an element type is a host element's, a tag name such as `div`.
 *
 * @param type The element's type.
 * @returns Whether it is a tag name.
 */
const isHostType = <P>(type: string | JSXElementConstructor<P>): type is string =>
  typeof type === "string";

/**
 * Find the client components in an element tree as React Server Components would ship them: the
 * walk expands every server component, a function of its props, by calling it as an RSC renderer
 * does, enters host elements, fragments and Suspense boundaries through their children, and stops
 * at a component a `"use client"` module exports, whose code a page loads.
 *
 * @param node The tree.
 * @param clients Every export of plate's `"use client"` modules, by value, with its name.
 * @returns Each client component met, its name and its props, in tree order.
 * @throws {UnwalkedElement} At an element of a type it cannot expand.
 */
export const islandsIn = (
  node: ReactNode,
  clients: ReadonlyMap<unknown, string>,
): readonly Island[] =>
  Children.toArray(node).flatMap((child): readonly Island[] => {
    if (!isValidElement<{ readonly children?: ReactNode }>(child)) {
      return [];
    }

    const { props, type } = child;
    const island = clients.get(type);

    if (island !== undefined) {
      return [{ name: island, props }];
    }

    if (isHostType(type) || type === Fragment || type === Suspense) {
      return islandsIn(props.children, clients);
    }

    if (!isFunctionComponent(type)) {
      throw new UnwalkedElement({ element: "a component that is no function component" });
    }

    const rendered = type(props);

    if (rendered instanceof Promise) {
      throw new UnwalkedElement({ element: `the async component ${type.name}` });
    }

    return islandsIn(rendered, clients);
  });

/**
 * The attributes whose value is a space-separated list of ids (HTML's `headers` and `itemref`, and
 * WAI-ARIA's ID reference lists).
 *
 * @see https://html.spec.whatwg.org/multipage/indices.html#attributes-3
 * @see https://www.w3.org/TR/wai-aria-1.2/#valuetype_idref_list
 */
const idrefLists = [
  "aria-controls",
  "aria-describedby",
  "aria-details",
  "aria-flowto",
  "aria-labelledby",
  "aria-owns",
  "headers",
  "itemref",
] as const;

/**
 * The attributes whose value is one id (HTML's `commandfor`, `form`, `list` and `popovertarget`,
 * and WAI-ARIA's ID references); `for` is one id on a `label` and a list on an `output`.
 *
 * @see https://html.spec.whatwg.org/multipage/indices.html#attributes-3
 * @see https://www.w3.org/TR/wai-aria-1.2/#valuetype_idref
 */
const idrefSingles = [
  "aria-activedescendant",
  "aria-errormessage",
  "commandfor",
  "form",
  "list",
  "popovertarget",
] as const;

/**
 * The SVG presentation attributes that may reference an element by `url(#id)`.
 *
 * @see https://www.w3.org/TR/SVG2/linking.html#processingIRI
 */
const urlReferences = [
  "clip-path",
  "fill",
  "filter",
  "marker-end",
  "marker-mid",
  "marker-start",
  "mask",
  "stroke",
] as const;

/**
 * A reference by `url(#id)`.
 */
const urlReference = regex("^url\\(\\s*[\"']?#(?<id>[^\"')]+)[\"']?\\s*\\)$", "u");

/**
 * The WAI-ARIA roles whose accessible name may come from their content.
 *
 * @see https://www.w3.org/TR/wai-aria-1.2/#namefromcontent
 */
const nameFromContent: ReadonlySet<string> = new Set([
  "button",
  "cell",
  "checkbox",
  "columnheader",
  "gridcell",
  "heading",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "row",
  "rowheader",
  "switch",
  "tab",
  "tooltip",
  "treeitem",
]);

/**
 * The WAI-ARIA widget roles that require an accessible name, the controls the suite holds to one.
 *
 * @see https://www.w3.org/TR/wai-aria-1.2/#widget_roles
 */
const namedRoles: ReadonlySet<string> = new Set([
  "button",
  "checkbox",
  "combobox",
  "grid",
  "link",
  "listbox",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "radiogroup",
  "searchbox",
  "slider",
  "spinbutton",
  "switch",
  "textbox",
  "tree",
  "treegrid",
  "treeitem",
]);

/**
 * The implicit role of each `input` type a person operates (HTML-AAM). A type absent here, such as
 * `date` or `file`, is a control named only by its label, which the suite calls `input`.
 *
 * @see https://www.w3.org/TR/html-aam-1.0/#el-input-button
 */
const inputRoles: ReadonlyMap<string, string> = new Map([
  ["button", "button"],
  ["checkbox", "checkbox"],
  ["email", "textbox"],
  ["image", "button"],
  ["number", "spinbutton"],
  ["radio", "radio"],
  ["range", "slider"],
  ["reset", "button"],
  ["search", "searchbox"],
  ["submit", "button"],
  ["tel", "textbox"],
  ["text", "textbox"],
  ["url", "textbox"],
]);

/**
 * The elements a `label` can name.
 *
 * @see https://html.spec.whatwg.org/multipage/forms.html#category-label
 */
const labelable: ReadonlySet<string> = new Set([
  "button",
  "input",
  "meter",
  "output",
  "progress",
  "select",
  "textarea",
]);

/**
 * The input types whose `value` is their name, as a button's text is.
 */
const valueNamed: ReadonlySet<string> = new Set(["button", "reset", "submit"]);

/**
 * The input types a form's entry list leaves out, a button posting only as the submitter.
 *
 * @see https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set
 */
const unposted: ReadonlySet<string> = new Set(["button", "file", "image", "reset", "submit"]);

/**
 * The `data-slot` of each kind's interaction root, the part plate's markup contract names
 * `plate-<kind>`: a record over every kind, so a kind plate gains is a kind the suite places.
 */
const rootSlots = {
  associate: "plate-associate",
  choice: "plate-choice",
  "end-attempt": "plate-end-attempt",
  "extended-text": "plate-extended-text",
  "gap-match": "plate-gap-match",
  "graphic-associate": "plate-graphic-associate",
  "graphic-gap-match": "plate-graphic-gap-match",
  "graphic-order": "plate-graphic-order",
  hotspot: "plate-hotspot",
  hottext: "plate-hottext",
  "inline-choice": "plate-inline-choice",
  match: "plate-match",
  media: "plate-media",
  order: "plate-order",
  "portable-custom": "plate-portable-custom",
  "position-object": "plate-position-object",
  "select-point": "plate-select-point",
  slider: "plate-slider",
  "text-entry": "plate-text-entry",
} as const satisfies { readonly [K in InteractionKind]: `plate-${K}` };

/**
 * Every kind plate renders, in the order of {@link rootSlots}.
 */
export const interactionKinds: readonly InteractionKind[] = Rec.keys(rootSlots);

/**
 * Each kind by its root's `data-slot`.
 */
const kindsBySlot: ReadonlyMap<string, InteractionKind> = new Map(
  Rec.toEntries(rootSlots).map(([kind, slot]) => [slot, kind] as const),
);

/**
 * The selector of every interaction root.
 */
const rootSelector = [...kindsBySlot.keys()].map((slot) => `[data-slot="${slot}"]`).join(", ");

/**
 * Give where an element stands: the kind of the innermost interaction root that holds it, itself
 * included, or the item.
 *
 * @param element The element.
 * @returns Where it stands.
 */
const whereOf = (element: Element): Where =>
  kindsBySlot.get(element.closest<HTMLElement | SVGElement>(rootSelector)?.dataset["slot"] ?? "") ??
  "item";

/**
 * Describe an element as a failure names it: its tag, then its `data-slot`, `role`, `id` and
 * `name`.
 *
 * @param element The element.
 * @returns The description.
 */
const describe = (element: Element): string =>
  [
    element.localName,
    ...["data-slot", "role", "id", "name"].flatMap((attribute) => {
      const value = element.getAttribute(attribute);

      return value === null ? [] : [`${attribute}="${value}"`];
    }),
  ].join(" ");

/**
 * Tell whether an element is left out of the accessibility tree: it, or an element around it,
 * is `hidden`, `inert` or `aria-hidden="true"`.
 *
 * @param element The element.
 * @returns Whether a screen reader never reaches it.
 */
const outOfTree = (element: Element): boolean =>
  element.closest('[hidden], [inert], [aria-hidden="true"]') !== null;

/**
 * Tell whether a node is an element, by its `nodeType`, which DOM gives `ELEMENT_NODE` exactly for
 * an `Element`.
 *
 * @param node The node.
 * @returns Whether it is an element.
 * @see https://dom.spec.whatwg.org/#dom-node-nodetype
 */
const isElement = (node: Node): node is Element => node.nodeType === node.ELEMENT_NODE;

/**
 * Give the text alternative of an element's content: its text, each element in it replaced by its
 * `aria-label` when it has one, an image by its `alt`, and an element left out of the tree by
 * nothing (Accessible Name computation, step 2F).
 *
 * @param element The element.
 * @returns The text, its white space collapsed.
 */
const contentText = (element: Element): string =>
  [...element.childNodes]
    .map((child): string => {
      if (!isElement(child)) {
        return child.nodeType === child.TEXT_NODE ? (child.textContent ?? "") : "";
      }

      if (child.hasAttribute("hidden") || child.getAttribute("aria-hidden") === "true") {
        return "";
      }

      const label = child.getAttribute("aria-label")?.trim() ?? "";

      if (label !== "") {
        return label;
      }

      return child.localName === "img" || child.localName === "area"
        ? (child.getAttribute("alt") ?? "")
        : contentText(child);
    })
    .join(" ")
    .replaceAll(regex("\\s+", "gu"), " ")
    .trim();

/**
 * Give an element's role: its first `role` token that the tables know, else its implicit role from
 * HTML-AAM, else `focusable` for an element in the tab order with none, else none.
 *
 * @param element The element.
 * @returns The role, or `undefined` for none.
 */
const roleOf = (element: Element): string | undefined => {
  const explicit = element.getAttribute("role")?.trim().split(regex("\\s+", "u"))[0] ?? "";

  if (namedRoles.has(explicit) || nameFromContent.has(explicit)) {
    return explicit;
  }

  switch (element.localName) {
    case "a":
    case "area": {
      return element.hasAttribute("href") ? "link" : undefined;
    }
    case "button": {
      return "button";
    }
    case "input": {
      const type = element.getAttribute("type")?.toLowerCase() ?? "text";

      return type === "hidden" ? undefined : (inputRoles.get(type) ?? "input");
    }
    case "select": {
      return element.hasAttribute("multiple") ? "listbox" : "combobox";
    }
    case "textarea": {
      return "textbox";
    }
    default: {
      const tabIndex = element.getAttribute("tabindex");

      return tabIndex !== null && Number(tabIndex) >= 0 ? "focusable" : undefined;
    }
  }
};

/**
 * Give the element on a page with an id.
 *
 * @param document The page.
 * @param id The id.
 * @returns The element, or `null` for none.
 */
const byId = (document: Document, id: string): Element | null =>
  document.querySelector(`[id="${id.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"]`);

/**
 * Give the text of the elements an element's `aria-labelledby` names, each by its `aria-label` or
 * else its content (Accessible Name computation, step 2B).
 *
 * @param element The element.
 * @returns The text, empty for none.
 */
const labelledByText = (element: Element): string =>
  (element.getAttribute("aria-labelledby") ?? "")
    .split(regex("\\s+", "u"))
    .filter((id) => id !== "")
    .map((id) => {
      const target = byId(element.ownerDocument, id);

      return target === null
        ? ""
        : (target.getAttribute("aria-label")?.trim() ?? contentText(target));
    })
    .join(" ")
    .trim();

/**
 * Give the text of a labelable element's labels: every `label` whose `for` names it, and the
 * `label` around it (HTML-AAM, step 2D).
 *
 * @param element The element.
 * @returns The text, empty for none or for an element no label names.
 */
const labelsText = (element: Element): string => {
  if (!labelable.has(element.localName)) {
    return "";
  }

  const id = element.getAttribute("id");
  const around = element.closest("label");

  return [
    ...(id === null
      ? []
      : [...element.ownerDocument.querySelectorAll("label")].filter(
          (label) => label.getAttribute("for") === id,
        )),
    ...(around === null ? [] : [around]),
  ]
    .map(contentText)
    .join(" ")
    .trim();
};

/**
 * The names an input gives itself: its own, from its `value` or `alt`, and its `placeholder`, the
 * Accessible Name computation's last resort; each empty for none.
 */
interface OwnNames {
  readonly own: string;
  readonly placeholder: string;
}

/**
 * Give the name an input gives itself (HTML-AAM): a button-type input's `value` and an image
 * input's `alt`; and, the last resort, a text-like input's or a textarea's `placeholder`.
 *
 * @param element The element.
 * @returns Its own name and its placeholder, each empty for none.
 */
const ownNames = (element: Element): OwnNames => {
  const type = element.getAttribute("type")?.toLowerCase() ?? "text";
  const input = element.localName === "input";
  const ownAttribute = valueNamed.has(type) ? "value" : "alt";
  const namesItself = input && (valueNamed.has(type) || type === "image");

  return {
    own: namesItself ? (element.getAttribute(ownAttribute) ?? "") : "",
    placeholder:
      input || element.localName === "textarea" ? (element.getAttribute("placeholder") ?? "") : "",
  };
};

/**
 * Give an element's accessible name as the Accessible Name computation gives it for its role and
 * tag (HTML-AAM): its `aria-labelledby` elements' text; else its `aria-label`; else its labels'
 * text, or the name a button-type or image input gives itself; else its content, for a role named
 * from content and an element in the tab order with no role; else its `title`; else an input's or a
 * textarea's `placeholder`.
 *
 * @param element The element.
 * @param role Its role.
 * @returns The name, empty for none.
 */
const nameOf = (element: Element, role: string): string => {
  const { own, placeholder } = ownNames(element);
  const content = nameFromContent.has(role) || role === "focusable" ? contentText(element) : "";

  return (
    [
      labelledByText(element),
      element.getAttribute("aria-label") ?? "",
      labelsText(element),
      own,
      content,
      element.getAttribute("title") ?? "",
      placeholder,
    ]
      .map((each) => each.trim())
      .find((each) => each !== "") ?? ""
  );
};

/**
 * One entry of a form's entry list, as HTML builds it: a control's name and the text it posts.
 */
type FormEntry = readonly [name: string, text: string];

/**
 * Give the entries one form control posts, as HTML's entry list builds them: none for a control
 * with no name or that is disabled; a `select` each selected option's value; a `textarea` its text;
 * a checkbox or radio button its `value`, else `on`, only when checked; a button-type, image or
 * file input nothing; and any other input its `value`.
 *
 * @param control The control.
 * @returns Its entries.
 * @see https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set
 */
const entriesOf = (control: Element): readonly FormEntry[] => {
  const name = control.getAttribute("name") ?? "";
  const type = control.getAttribute("type")?.toLowerCase() ?? "text";

  if (name === "" || control.hasAttribute("disabled")) {
    return [];
  }

  switch (control.localName) {
    case "select": {
      return [...control.querySelectorAll("option[selected]")].map((option): FormEntry => [
        name,
        option.getAttribute("value") ?? contentText(option),
      ]);
    }
    case "textarea": {
      return [[name, control.textContent]];
    }
    default: {
      if (type === "checkbox" || type === "radio") {
        return control.hasAttribute("checked")
          ? [[name, control.getAttribute("value") ?? "on"]]
          : [];
      }

      return unposted.has(type) ? [] : [[name, control.getAttribute("value") ?? ""]];
    }
  }
};

/**
 * Give one attribute's references to ids, each id that is not empty.
 *
 * @param attribute The attribute.
 * @param ids The ids it names.
 * @returns Each attribute and id.
 */
const referring = (
  attribute: string,
  ids: readonly string[],
): readonly { readonly attribute: string; readonly id: string }[] =>
  ids.filter((id) => id !== "").map((id) => ({ attribute, id }));

/**
 * Give the IDREFs an element writes, by the tables above: each id of an IDREF list, an IDREF, a
 * `label`'s `for`, an `output`'s `for` list, a same-document `href` fragment and an SVG `url(#id)`.
 *
 * @param element The element.
 * @returns Each attribute and the id it names.
 */
const referencesOf = (
  element: Element,
): readonly { readonly attribute: string; readonly id: string }[] => {
  const forValue = element.getAttribute("for") ?? "";

  return [
    ...idrefLists.flatMap((attribute) =>
      referring(attribute, (element.getAttribute(attribute) ?? "").split(regex("\\s+", "u"))),
    ),
    ...idrefSingles.flatMap((attribute) =>
      referring(attribute, [element.getAttribute(attribute) ?? ""]),
    ),
    ...referring(
      "for",
      element.localName === "output" ? forValue.split(regex("\\s+", "u")) : [forValue],
    ),
    ...["href", "xlink:href"].flatMap((attribute) => {
      const href = element.getAttribute(attribute) ?? "";

      return referring(attribute, href.startsWith("#") ? [href.slice(1)] : []);
    }),
    ...urlReferences.flatMap((attribute) =>
      referring(attribute, [
        urlReference.exec(element.getAttribute(attribute) ?? "")?.groups.id ?? "",
      ]),
    ),
  ];
};

/**
 * Read the facts of a page's HTML, as `react-dom/server` writes it.
 *
 * @param html The page's HTML.
 * @returns Its facts.
 */
export const factsOf = (html: string): PageFacts => {
  const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
  const elements = [...document.body.querySelectorAll("*")];

  return {
    controls: elements.flatMap((element) => {
      const role = roleOf(element);

      return role === undefined ||
        outOfTree(element) ||
        !(namedRoles.has(role) || role === "input" || role === "focusable")
        ? []
        : [{ element: describe(element), name: nameOf(element, role), where: whereOf(element) }];
    }),
    ids: elements.flatMap((element) => {
      const id = element.getAttribute("id");

      return id === null ? [] : [{ id, where: whereOf(element) }];
    }),
    marks: [
      ...document.body.querySelectorAll<HTMLElement | SVGElement>("[data-mark], [data-missed]"),
    ].flatMap((element): readonly DrawnMark[] => {
      const { dataset } = element;
      const part = { read: !outOfTree(element), slot: dataset["slot"] ?? "" };

      return [
        ...(dataset["mark"] ?? "")
          .split(regex("\\s+", "u"))
          .filter((mark) => mark !== "")
          .map((mark): DrawnMark => ({ ...part, mark, on: "answer" })),
        ...(Object.hasOwn(dataset, "missed")
          ? [{ ...part, mark: "missed", on: "choice" } as const]
          : []),
      ];
    }),
    notices: [...document.body.querySelectorAll('[data-slot="plate-notice"]')].map(contentText),
    posted: [...document.body.querySelectorAll("input, select, textarea")].flatMap(entriesOf),
    references: elements.flatMap((element) =>
      referencesOf(element).map((reference) => ({
        ...reference,
        element: describe(element),
        where: whereOf(element),
      })),
    ),
  };
};

/**
 * What a page is rendered from: `<Item>`'s props, and in `answering` the responses the host's
 * `<Responses>` holds, every response the page shows.
 */
export type Showable =
  | {
      readonly mode: "answering";
      readonly props: ItemProps;
      readonly responses: ResponseValues;
    }
  | { readonly mode: "review" | "solution"; readonly props: ItemProps };

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing: () => void = Function.constVoid;

/**
 * Render an item as a host renders it: `<Item>` alone in review and solution, and in answering
 * inside the `<Responses>` that holds its responses, started from them as plate's `heldOf` starts
 * a host's.
 *
 * @param showable The props and responses.
 * @param clients Every export of plate's `"use client"` modules, by value, with its name.
 * @returns The page.
 * @throws {UnwalkedElement} When `<Item>`'s tree holds an element the island walk cannot expand;
 *   and whatever `<Item>` or an island throws while rendering.
 */
export const render = (showable: Showable, clients: ReadonlyMap<unknown, string>): Page => {
  const item: ReactElement = createElement(Item, {
    ...showable.props,
    renderers: standardRenderers,
  });
  const islands = islandsIn(item, clients);
  const page =
    showable.mode === "answering"
      ? createElement(Responses, {
          children: item,
          onChange: keepNothing,
          value: heldOf(showable.responses),
        })
      : item;

  return { facts: factsOf(renderToStaticMarkup(page)), islands };
};
