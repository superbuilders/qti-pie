/**
 * The HTML the item body may hold, and how the server shell writes an author's element as a React
 * element: the XSD's HTML subset and the attributes it declares, each attribute under the prop
 * name React writes it from, every id and IDREF scoped, and every URL as its address.
 *
 * Nothing an author wrote is executed or injected: an element outside the subset is dropped, and so
 * is an attribute the XSD does not declare on its element (an event handler, `style`, an undeclared
 * name), but for an author `data-*` plate does not reserve. `checkAdmitted` has already removed
 * every attribute only the XSD's wildcard admits; this is the shell's own guard.
 *
 * @module
 */
import { Option, Result } from "effect";
import { qtiNamespace } from "#plate/document/source.ts";
import { addressUrl, classifyUrl, missingPathOf, urlContextOf } from "#plate/model/url.ts";
import type { Asset, KeptUrl, PackagePath } from "#plate/model/url.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import { feedbackBlockTag } from "#plate/redact/walk.ts";
import { authoredId, authoredIdrefs } from "#plate/ui/item/ids.ts";
import { isAuthorData } from "#plate/vocabulary.ts";
import type { BodyAttribute, BodyElement, RedactedLevel } from "#plate/model/item.ts";

/**
 * The attributes whose value is a list of ids (IDREFS, or one IDREF, which is a list of one), each
 * scoped by {@link authoredIdrefs}. `for` is not among them: the XSD does not declare it on
 * `label`.
 */
const idReferences: ReadonlySet<string> = new Set([
  "aria-activedescendant",
  "aria-controls",
  "aria-describedby",
  "aria-details",
  "aria-errormessage",
  "aria-flowto",
  "aria-labelledby",
  "aria-owns",
  "headers",
]);

/**
 * The attributes the XSD declares by name on every HTML element of the item body but `param` and
 * `template`: ARIA's states and properties, the global attributes, and QTI's `data-catalog-idref`
 * and `data-qti-suppress-tts`. `data-qti-suppress-tts`, and `data-ssml` on the {@link textual}
 * elements, reach the page as the model carries them (decision D22), so the browser's read-aloud
 * engine reads the speech plan from the HTML.
 */
const globalAttributes: readonly string[] = [
  "aria-activedescendant",
  "aria-atomic",
  "aria-autocomplete",
  "aria-busy",
  "aria-checked",
  "aria-colcount",
  "aria-colindex",
  "aria-colspan",
  "aria-controls",
  "aria-current",
  "aria-describedby",
  "aria-details",
  "aria-disabled",
  "aria-errormessage",
  "aria-expanded",
  "aria-flowto",
  "aria-haspopup",
  "aria-hidden",
  "aria-invalid",
  "aria-label",
  "aria-labelledby",
  "aria-level",
  "aria-live",
  "aria-modal",
  "aria-multiline",
  "aria-multiselectable",
  "aria-orientation",
  "aria-owns",
  "aria-placeholder",
  "aria-posinset",
  "aria-pressed",
  "aria-readonly",
  "aria-relevant",
  "aria-required",
  "aria-roledescription",
  "aria-rowcount",
  "aria-rowindex",
  "aria-rowspan",
  "aria-selected",
  "aria-setsize",
  "aria-sort",
  "aria-valuemax",
  "aria-valuemin",
  "aria-valuenow",
  "aria-valuetext",
  "class",
  "data-catalog-idref",
  "data-qti-suppress-tts",
  "dir",
  "id",
  "label",
  "lang",
  "role",
  "xml:lang",
];

/**
 * ARIA's name for the keyboard shortcuts attribute, which every element but the empty ones
 * declares.
 */
const keyShortcuts = "aria-keyshortcuts";

/**
 * The XSD's misspelling of {@link keyShortcuts}, which it declares on the empty elements in its
 * place, as the information model's ARIABaseEmpty does (§7.1.44). Reading `aria-keyshorts` admits
 * it alone there, and the shell writes it as ARIA's, so a screen reader announces it (operator
 * ruling `96840ced`).
 */
const keyShortcutsMisspelt = "aria-keyshorts";

/**
 * The attributes of the XSD's sectioning, grouping, ruby and table elements.
 */
const structural: readonly string[] = [...globalAttributes, keyShortcuts];

/**
 * The attributes of the XSD's text-level and block elements, which add SSML and `xml:base`.
 */
const textual: readonly string[] = [...structural, "data-ssml", "xml:base"];

/**
 * The attributes of the XSD's empty elements, with the misspelt shortcuts attribute.
 */
const empty: readonly string[] = [...globalAttributes, keyShortcutsMisspelt];

/**
 * The attributes of `audio`, which `video` extends.
 */
const media: readonly string[] = [
  ...structural,
  "autoplay",
  "controls",
  "crossorigin",
  "loop",
  "mediagroup",
  "muted",
  "preload",
  "src",
];

/**
 * The attributes of a table cell, `td` or `th`.
 */
const cell: readonly string[] = [
  ...structural,
  "abbr",
  "align",
  "axis",
  "colspan",
  "headers",
  "rowspan",
  "scope",
  "valign",
];

/**
 * The elements whose attributes are {@link textual}.
 */
const textualTags: readonly string[] = [
  "abbr",
  "acronym",
  "address",
  "b",
  "big",
  "cite",
  "code",
  "dd",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "i",
  "kbd",
  "ol",
  "p",
  "pre",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "tt",
  "ul",
  "var",
];

/**
 * The elements whose attributes are {@link structural}.
 */
const structuralTags: readonly string[] = [
  "article",
  "aside",
  "bdi",
  "caption",
  "figcaption",
  "figure",
  "footer",
  "header",
  "label",
  "li",
  "nav",
  "picture",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "section",
  "summary",
  "tbody",
  "tfoot",
  "thead",
  "tr",
];

/**
 * The rows of {@link htmlSubset}: each element with the attributes the XSD declares on it.
 */
const subsetRows: readonly (readonly [tag: string, attributes: readonly string[]])[] = [
  ...textualTags.map((tag) => [tag, textual] as const),
  ...structuralTags.map((tag) => [tag, structural] as const),
  ["a", [...textual, "href", "type"]],
  ["audio", media],
  ["bdo", [...structural, "title"]],
  ["blockquote", [...textual, "cite"]],
  ["br", [...empty, "xml:base"]],
  ["col", [...empty, "span", "xml:base"]],
  ["colgroup", [...structural, "span"]],
  ["details", [...structural, "open"]],
  ["hr", [...empty, "xml:base"]],
  ["img", [...empty, "alt", "height", "longdesc", "src", "width", "xml:base"]],
  ["object", [...textual, "data", "height", "type", "width"]],
  ["param", ["name", "type", "value", "valuetype"]],
  ["q", [...textual, "cite"]],
  ["source", [...empty, "media", "sizes", "src", "srcset", "type"]],
  ["table", [...textual, "summary"]],
  ["td", cell],
  ["template", []],
  ["th", cell],
  ["track", [...empty, "default", "kind", "src", "srclang"]],
  ["video", [...media, "height", "poster", "width"]],
];

/**
 * The XSD's HTML subset: each element the XSD declares whose name does not begin with `qti-`,
 * mapped to the attributes it declares on it by name, the attribute wildcard excluded. The shell
 * writes no other element.
 *
 * Transcribed by hand from the cached XSD, so the server shell carries no generated table. Every
 * name is lower case, as the XSD writes it; `xml:lang` and `xml:base` are named as the model names
 * attributes in the XML namespace.
 *
 * @see ~/.cache/qti-pie/qti3/xsd/imsqti_asiv3p0p1_v1p0.xsd (sha256 `bd82f6df…`), its 76 elements
 *   from `a` to `video`
 */
export const htmlSubset: ReadonlyMap<string, ReadonlySet<string>> = new Map(
  subsetRows.map(([tag, attributes]) => [tag, new Set(attributes)]),
);

/**
 * Tell whether the shell writes an element of the redacted body, and so its subtree: one of the
 * {@link htmlSubset} as itself, and a feedback block the page shows (`feedbackBlockTag` in
 * `#plate/redact/walk.ts`) as plate's Feedback part. It drops any other with its subtree, or the
 * interaction whose content it is writes the element in its place.
 *
 * @param tag The element's local name.
 * @returns Whether the shell writes it.
 */
export const writtenTag = (tag: string): boolean => htmlSubset.has(tag) || tag === feedbackBlockTag;

/**
 * The prop React writes each attribute of the subset from, where it is not the attribute's own
 * name: React warns on, and may misplace, an attribute spelt as HTML spells it (`class`,
 * `colspan`). Every other attribute of the subset React writes from its own lower-case name.
 *
 * @see https://react.dev/reference/react-dom/components/common#common-props
 */
const propNames: ReadonlyMap<string, string> = new Map([
  ["autoplay", "autoPlay"],
  ["class", "className"],
  ["colspan", "colSpan"],
  ["crossorigin", "crossOrigin"],
  ["mediagroup", "mediaGroup"],
  ["rowspan", "rowSpan"],
  ["srclang", "srcLang"],
  ["srcset", "srcSet"],
  ["xml:base", "xmlBase"],
]);

/**
 * The boolean attributes of the subset. HTML reads one as true when it is present, whatever its
 * value, so the shell writes each as React's `true` where the author's value means true, and leaves
 * it out where the value means false ({@link falseValues}).
 *
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
 */
const booleanAttributes: ReadonlySet<string> = new Set([
  "autoplay",
  "controls",
  "default",
  "loop",
  "muted",
  "open",
]);

/**
 * The values that make a boolean attribute of the subset or an ARIA state the XSD types
 * `xs:boolean` false, as the XSD types each: `false` of the enumeration it writes for `audio`'s and
 * `video`'s `autoplay`, `controls`, `loop` and `muted` and `track`'s `default`, `true`, `false` or
 * the attribute's own name, which bridges HTML's present-or-absent reading into XML; and `false`
 * and `0`, `xs:boolean`'s lexical false, for `details`'s `open` and the ARIA states
 * ({@link ariaBooleans}). Every other value the XSD admits means true.
 *
 * @see https://www.w3.org/TR/xmlschema-2/#boolean
 */
const falseValues: ReadonlySet<string> = new Set(["0", "false"]);

/**
 * The ARIA states the XSD types `xs:boolean` on every HTML element of the subset. ARIA reads such a
 * state only as the token `true` or `false`, while `xs:boolean`'s lexical space also holds `1` and
 * `0` and collapses the white space around a value, so the shell writes each as the ARIA token its
 * value means ({@link falseValues}): an author's `aria-hidden="1"` reaches the page as
 * `aria-hidden="true"`, which a browser reads, and not as a value it ignores.
 *
 * @see https://www.w3.org/TR/wai-aria-1.2/#valuetype_true-false
 * @see https://www.w3.org/TR/xmlschema-2/#boolean
 */
const ariaBooleans: ReadonlySet<string> = new Set([
  "aria-atomic",
  "aria-busy",
  "aria-disabled",
  "aria-haspopup",
  "aria-hidden",
  "aria-modal",
  "aria-multiline",
  "aria-multiselectable",
  "aria-readonly",
  "aria-required",
]);

/**
 * Tell whether the shell writes an attribute on an element: the XSD declares it there by name,
 * it is ARIA's shortcuts attribute on an element that declares the misspelling, or it is an author
 * `data-*` (`isAuthorData`, decision D24's one table in `#plate/vocabulary.ts`).
 *
 * @param declared The attributes the XSD declares on the element.
 * @param name The attribute's name.
 * @returns Whether it is written.
 */
const admits = (declared: ReadonlySet<string>, name: string): boolean =>
  declared.has(name) ||
  (name === keyShortcuts && declared.has(keyShortcutsMisspelt)) ||
  isAuthorData(name);

/**
 * What writing an element's attributes needs to know of the item: its instance, which scopes ids,
 * and its location and the configuration's assets, which address its package URLs.
 */
export interface Addressing {
  readonly assets: ReadonlyMap<PackagePath, Asset>;
  readonly document: string;
  readonly instance: string;
  /**
   * Which writing of the content the walk makes: `original`, which writes each of the author's
   * `id`s, scoped; or `copy`, a second writing of content the page shows elsewhere too, such as
   * an Order's placeholder chip or the chip a review shows left in the bank, which writes no `id`
   * and no notice, so each of the author's ids stands once on the page while its references still
   * name the original's elements, and each feature the item renders without is told once, by the
   * original.
   */
  readonly writing: Writing;
}

/**
 * Which writing of a run of content the walk makes ({@link Addressing.writing}).
 */
export type Writing = "copy" | "original";

/**
 * Scope a same-document reference as the id it names, so `#q1` still finds the author's `id="q1"`
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
 * Write one of the author's attributes as React writes it.
 *
 * @param attribute The attribute as the redacted body holds it.
 * @param tag The element's local name, which says whether the attribute is a URL.
 * @param addressing The instance, the item's location and the assets.
 * @returns The prop and its value, none when the attribute is dropped: `xml:lang` as `lang`,
 *   `aria-keyshorts` as `aria-keyshortcuts`, an `id` and each id of an IDREF attribute scoped (an
 *   IDREF attribute that names no id is dropped), a URL as its address (a URL `checkAdmitted` would
 *   drop, or one whose file `assets` gives no address, is dropped: the shell refuses such an item
 *   before it writes any of it), a boolean attribute as `true` where its value means true and
 *   dropped where it means false, an `xs:boolean` ARIA state as the token `true` or `false`, and
 *   any other as written.
 */
const propFor = (
  { name, value }: BodyAttribute,
  tag: string,
  addressing: Addressing,
): readonly (readonly [string, boolean | string])[] => {
  if (name === "xml:lang") {
    return [["lang", value]];
  }

  if (name === keyShortcutsMisspelt) {
    return [[keyShortcuts, value]];
  }

  if (name === "id") {
    return addressing.writing === "copy" ? [] : [["id", authoredId(addressing.instance, value)]];
  }

  if (idReferences.has(name)) {
    const ids = authoredIdrefs(addressing.instance, value);

    return ids === undefined ? [] : [[name, ids]];
  }

  if (ariaBooleans.has(name)) {
    // The database refuses a value outside the lexical space before any page is written.
    return [[name, falseValues.has(trimXmlSpace(value)) ? "false" : "true"]];
  }

  if (booleanAttributes.has(name)) {
    // `xs:boolean` collapses whitespace before it reads a value; the enumeration's values hold none.
    return falseValues.has(trimXmlSpace(value)) ? [] : [[propNames.get(name) ?? name, true]];
  }

  const prop = propNames.get(name) ?? name;

  return Option.match(
    urlContextOf({ local: tag, namespace: qtiNamespace }, { local: name, namespace: "" }),
    {
      onNone: () => [[prop, value]],
      onSome: (context) => {
        const url = classifyUrl(context, value);
        const written =
          url.kind === "dropped"
            ? Option.none()
            : Result.getSuccess(
                addressUrl(
                  scopedFragment(url, addressing.instance),
                  addressing.document,
                  addressing.assets,
                ),
              );

        return Option.match(written, { onNone: () => [], onSome: (address) => [[prop, address]] });
      },
    },
  );
};

/**
 * Write an author's element's attributes as the props React writes them from.
 *
 * Only what {@link admits} lets through is written. Where the author wrote both `lang` and
 * `xml:lang`, `xml:lang` wins, as it does in HTML, and where both shortcut spellings, ARIA's wins.
 *
 * @param element The element as the redacted body holds it.
 * @param declared The attributes the XSD declares on it, from {@link htmlSubset}.
 * @param addressing The instance, the item's location and the assets.
 * @returns The props.
 */
export const propsOf = (
  { attributes, tag }: BodyElement<RedactedLevel>,
  declared: ReadonlySet<string>,
  addressing: Addressing,
): Readonly<Record<string, boolean | string>> => {
  const admitted = attributes.filter(({ name }) => admits(declared, name));
  const names = new Set(admitted.map(({ name }) => name));
  const shadowed = (name: string): boolean =>
    (name === "lang" && names.has("xml:lang")) ||
    (name === keyShortcutsMisspelt && names.has(keyShortcuts));

  return Object.fromEntries(
    admitted
      .filter(({ name }) => !shadowed(name))
      .flatMap((attribute) => propFor(attribute, tag, addressing)),
  );
};

/**
 * Find the first file an element's own URL attributes name that `assets` holds no entry for; a file
 * the host withholds is none, since the shell writes its URL as no address and renders the rest.
 *
 * @param element The element as the redacted body holds it.
 * @param addressing The item's location and the assets.
 * @returns The file's path from the package root, or undefined when every file has an address.
 */
export const missingIn = (
  element: BodyElement<RedactedLevel>,
  addressing: Pick<Addressing, "assets" | "document">,
): string | undefined => {
  for (const { name, value } of element.attributes) {
    const missing = Option.flatMap(
      urlContextOf({ local: element.tag, namespace: qtiNamespace }, { local: name, namespace: "" }),
      (context) => {
        const url = classifyUrl(context, value);

        return url.kind === "dropped"
          ? Option.none()
          : Option.flatMap(
              Result.getFailure(addressUrl(url, addressing.document, addressing.assets)),
              missingPathOf,
            );
      },
    );

    if (Option.isSome(missing)) {
      return missing.value;
    }
  }

  return undefined;
};

/**
 * The heading elements, whose level the shell shifts to the configured heading level.
 */
const headings: ReadonlySet<string> = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

/**
 * Give an authored heading's level, 1 to 6, or undefined for any other element.
 *
 * @param tag The element's local name.
 * @returns The level.
 */
export const headingLevelOf = (tag: string): number | undefined =>
  headings.has(tag) ? Number(tag.slice(1)) : undefined;

/**
 * The elements whose content is flow content, where a notice is a `div`: the subset's block
 * containers, and the elements whose content is flow content that stand only in a list or a
 * table. `p`, the headings and `pre` are not among them: their content is phrasing only.
 *
 * @see https://html.spec.whatwg.org/multipage/dom.html#flow-content
 */
const flowParents: ReadonlySet<string> = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "dd",
  "details",
  "div",
  "figure",
  "footer",
  "header",
  "li",
  "nav",
  "section",
  "td",
  "th",
]);

/**
 * Tell whether an element takes flow content, so that content below it stands where flow content
 * may, unless a `p` is open above it (`standingBelow` in `#plate/ui/item/content.tsx`).
 *
 * @param tag The element's local name.
 * @returns Whether it takes flow content.
 */
export const takesFlow = (tag: string): boolean => flowParents.has(tag);

/**
 * The elements HTML admits no text in, not even whitespace, as a table's structure: the HTML
 * parser moves any text out of them, so React refuses to hydrate one with a text child.
 *
 * @see https://html.spec.whatwg.org/multipage/tables.html#the-table-element
 */
export const textless: ReadonlySet<string> = new Set([
  "colgroup",
  "table",
  "tbody",
  "tfoot",
  "thead",
  "tr",
]);

/**
 * The HTML elements of the subset that hold no content, to which React refuses children.
 *
 * @see https://html.spec.whatwg.org/multipage/syntax.html#void-elements
 */
export const voidElements: ReadonlySet<string> = new Set([
  "br",
  "col",
  "hr",
  "img",
  "param",
  "source",
  "track",
]);

/**
 * The elements of the subset a control of plate's, a `span` holding a `button` and an `audio`, may
 * stand in as one of its children, shown and acting as itself: each whose content model admits
 * phrasing content (flow content admits it too) and lets a `button` stand in it. Every other
 * element of the subset holds none, by HTML's content models:
 *
 * - It holds no content at all: the void elements ({@link voidElements});
 * - Its children are only its structure: a table's ({@link textless}), a list's (`dl`, `ol`, `ul`)
 *   and a picture's (its sources and its image);
 * - Ruby lays out what it holds: in a `ruby` or its parts (`rb`, `rt`, `rtc`, `rp`) a control would
 *   stand in the base text or over it as an annotation, never after the words;
 * - A `button` in it breaks it: `a` admits no interactive content; a `label` labels its first
 *   labelable descendant, the button, so a press on its words would play the recording; a
 *   `summary`'s press opens its `details`;
 * - What it holds does not show: `audio`, `video` and `object` show their content only where the
 *   browser cannot play them, a `details` its content only while open, and a `template` none.
 *
 * @see https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
 * @see https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element
 * @see https://html.spec.whatwg.org/multipage/forms.html#the-label-element
 * @see https://html.spec.whatwg.org/multipage/media.html#media-elements
 */
const phrasingHosts: ReadonlySet<string> = new Set([
  "abbr",
  "acronym",
  "address",
  "article",
  "aside",
  "b",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "caption",
  "cite",
  "code",
  "dd",
  "dfn",
  "div",
  "dt",
  "em",
  "figcaption",
  "figure",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "i",
  "kbd",
  "li",
  "nav",
  "p",
  "pre",
  "q",
  "samp",
  "section",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "td",
  "th",
  "tt",
  "var",
]);

/**
 * Tell whether the shell writes an element as itself in which a control of plate's, a `span`, may
 * stand among its children, shown and acting as itself ({@link phrasingHosts}).
 *
 * @param tag The element's local name.
 * @returns Whether it is one of the {@link htmlSubset} that holds such a control.
 */
export const holdsPhrasing = (tag: string): boolean => phrasingHosts.has(tag);

/**
 * The elements of the subset inside which no control of plate's may stand at any depth, its
 * children's children included, by HTML's content models: what holds a `button` anywhere below it
 * breaks or hides it, so the walk never places one below them, where {@link phrasingHosts} judges
 * an element's own children alone:
 *
 * - A `button` below it breaks it: `a` admits no interactive content descendant; a `label` labels its
 *   first labelable descendant, so a button anywhere in it would take a press on its words; a
 *   `summary`'s press opens its `details`;
 * - What it holds does not show: `audio`, `video` and `object` show their content only where the
 *   browser cannot play them, a `details` its content only while open, and a `template` none;
 * - Ruby lays out what it holds (`ruby`, `rb`, `rt`, `rtc`, `rp`), so a control would stand in the
 *   base text or over it as an annotation; and a `picture` holds only its sources and its image.
 *
 * A table's or a list's structure is no barrier: its cells and items hold phrasing content.
 *
 * @see https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element
 * @see https://html.spec.whatwg.org/multipage/forms.html#the-label-element
 * @see https://html.spec.whatwg.org/multipage/media.html#media-elements
 */
const controlBarriers: ReadonlySet<string> = new Set([
  "a",
  "audio",
  "details",
  "label",
  "object",
  "picture",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "summary",
  "template",
  "video",
]);

/**
 * Tell whether no control of plate's may stand anywhere inside an element ({@link
 * controlBarriers}).
 *
 * @param tag The element's local name.
 * @returns Whether the element bars a control from every element below it.
 */
export const barsControls = (tag: string): boolean => controlBarriers.has(tag);
