/**
 * The verdict on a document the database admitted, the one gate between a source and an item a
 * host may redact, score or render.
 *
 * The database is the only judge of a document's validity (pantry's laws): a host opens only what
 * admission accepted, through `openAdmitted`, and {@link checkAdmitted} judges no rule of QTI's. It
 * reads a document's root first, and leaves unchecked every root but an item, a section and a
 * stimulus, a test and a root outside QTI's namespace among them, which plate does not deliver, and
 * then what it cannot render: SSML, an XInclude `include`, an unexpanded entity reference. Every
 * verdict carries the kind of its document's root. On an item it secures the source before it
 * builds the item. Securing removes every attribute only a wildcard admits, except an author
 * `data-*` that plate does not reserve ({@link isAuthorData}), and passes every URL attribute
 * through `url.ts`, keeping each value in its parsed form or dropping it with a notice beside its
 * element. Its {@link Accepted} is the only input `redact` and `score` take. A stimulus is secured
 * and built the same way, since plate delivers it with each item that references it
 * ({@link AcceptedStimulus}), and is marked, as a section is, since plate delivers neither alone.
 * {@link checkAdmitted} is a
 * plain function, with no Effect runtime: a document outside admission's contract is a defect,
 * thrown by the builders, never a verdict.
 *
 * @module
 */
import { regex } from "arkregex";
import { Array as Arr, Brand, Option, Result } from "effect";
import { checkIsland } from "#plate/content/modules.ts";
import {
  attributePath,
  qtiNamespace,
  walk,
  xincludeNamespace,
  xmlNamespace,
} from "#plate/document/source.ts";
import type {
  SourceAttribute,
  SourceChild,
  SourceDocument,
  SourceElement,
  Visit,
} from "#plate/document/source.ts";
import { inadmissible } from "#plate/model/attributes.ts";
import { mapChildNodes } from "#plate/model/interactions.ts";
import { buildItem, buildStimulus } from "#plate/model/item.ts";
import type {
  BodyNode,
  Item,
  Stimulus,
  Unsupported,
  UnsupportedFeature,
} from "#plate/model/item.ts";
import { classifyUrlAt, formatUrl, urlContextOf, urlValueOf } from "#plate/model/url.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import {
  attributeName,
  governingTables,
  isAllowance,
  isInstanceAttribute,
} from "#plate/validate/governing.ts";
import type { ContentTable, Tables } from "#plate/validate/governing.ts";
import { isAuthorData } from "#plate/vocabulary.ts";
import type { RootMark } from "#plate/vocabulary.ts";

/**
 * Why a valid document is left unchecked: it holds SSML (reading `ssml-document-is-fragment`),
 * whose validity plate cannot judge, an XInclude `include`, whose inclusion plate neither performs
 * nor judges, an entity reference the reader kept unexpanded, or a root that is not an item, a
 * section or a stimulus, a test among them. `path` is the element or attribute at issue.
 */
export interface UncheckedReason {
  readonly path: string;
  readonly reason: "entity" | "root" | "ssml" | "xinclude";
}

/**
 * The fields of an accepted document, which only {@link checkAdmitted} and {@link acceptForTest}
 * brand.
 */
interface AcceptedFields {
  /**
   * The document's location as the host named it.
   */
  readonly document: string;
  /**
   * The item built from the secured source, with each URL notice placed in its body, and as its
   * `unsupported` every feature not rendered, in document order: the item's own, each attribute
   * securing removed, and each URL dropped.
   */
  readonly item: Item;
}

/**
 * A document {@link checkAdmitted} accepted, the only input `redact` and `score` take.
 *
 * The brand exists only in the type, so a hand-built {@link Item}, or any object built by hand, does
 * not type-check where an `Accepted` is expected: {@link checkAdmitted} is its constructor, and
 * {@link acceptForTest} the one named seam for tests.
 */
export type Accepted = Brand.Branded<AcceptedFields, "Accepted">;

/**
 * The brand's constructor, kept to this module.
 */
const accept = Brand.nominal<Accepted>();

/**
 * What plate holds of a section document it accepts: valid, and never delivered.
 */
interface SectionSummary {
  /**
   * The document's location as the host named it.
   */
  readonly document: string;
  /**
   * The root's `identifier`, its outer XML whitespace removed, as an NCName reads.
   */
  readonly identifier: string;
  /**
   * The root's `title`, as written.
   */
  readonly title: string;
  /**
   * Every feature not delivered: the root's mark, `root:qti-assessment-section`, at the root's
   * path, alone.
   */
  readonly unsupported: readonly UnsupportedFeature[];
}

/**
 * A section document {@link checkAdmitted} accepted, which only it constructs.
 */
type AcceptedSection = Brand.Branded<SectionSummary, "AcceptedSection">;

/**
 * The brand's constructor, kept to this module.
 */
const acceptSection = Brand.nominal<AcceptedSection>();

/**
 * The fields of an accepted stimulus document, which only {@link checkAdmitted} brands.
 */
interface StimulusFields {
  /**
   * The document's location as the host named it.
   */
  readonly document: string;
  /**
   * The stimulus built from the secured source (`buildStimulus` in `#plate/model/item.ts`), with
   * each URL notice placed in its body, and as its `unsupported` every feature not delivered, in
   * document order: the root's mark, `root:qti-assessment-stimulus`, first, since plate delivers a
   * stimulus only with an item that references it, never alone; then the stimulus's own marks and
   * notices, each attribute securing removed, and each URL dropped.
   */
  readonly stimulus: Stimulus;
}

/**
 * A stimulus document {@link checkAdmitted} accepted: secured as an item is and built, the only
 * stimulus `<Item>` delivers beside an item that references it. The brand exists only in the type,
 * so a hand-built {@link Stimulus} does not type-check where one is expected.
 */
export type AcceptedStimulus = Brand.Branded<StimulusFields, "AcceptedStimulus">;

/**
 * The brand's constructor, kept to this module.
 */
const acceptStimulus = Brand.nominal<AcceptedStimulus>();

/**
 * The kind of a QTI 3 root, by its local name in QTI's namespace: the item, the test, the section
 * and the stimulus, and the two roots plate leaves unchecked, an outcome declaration and response
 * processing.
 */
type RootKind =
  | "item"
  | "outcome-declaration"
  | "response-processing"
  | "section"
  | "stimulus"
  | "test";

/**
 * The kind a verdict carries: its root's. A document plate opens has one of the six QTI 3 roots:
 * the database admitted it, and a root outside QTI's namespace, or a QTI element other than the six
 * at the root, is no document a host opens, a defect thrown (`InadmissibleDocument`).
 */
export type VerdictKind = RootKind;

/**
 * The kinds of root {@link checkAdmitted} accepts.
 */
type AcceptedKind = "item" | "section" | "stimulus";

/**
 * An accepting verdict's document, by its kind, so that `kind` narrows `accepted`.
 */
type AcceptedByKind =
  | { readonly accepted: Accepted; readonly kind: "item" }
  | { readonly accepted: AcceptedSection; readonly kind: "section" }
  | { readonly accepted: AcceptedStimulus; readonly kind: "stimulus" };

/**
 * The verdict on a document, by `verdict`.
 *
 * - `unchecked`: a document plate does not render, with every reason: a root that is no item, section
 *   or stimulus, or content plate cannot render (SSML, an XInclude `include`, an unexpanded entity
 *   reference); never rendered.
 * - `accepted-with-unsupported`: valid, with features plate does not render or deliver, each named.
 * - `accepted`: valid, and plate renders or delivers all of it.
 *
 * Every arm carries `kind`: an accepting verdict's is `item`, `section` or `stimulus`, and
 * `accepted` is the {@link Accepted}, {@link AcceptedSection} or {@link AcceptedStimulus} to match,
 * so `kind` narrows it. `unchecked` carries the root's kind. There is no refused verdict: a
 * document plate opens was admitted by the database, the only judge of its validity, so a state
 * outside admission's contract is a defect thrown, never a verdict. Read an accepted item through
 * {@link acceptedItem}. `document` is the document's location.
 */
export type Verdict =
  | {
      readonly document: string;
      readonly kind: VerdictKind;
      readonly reasons: readonly UncheckedReason[];
      readonly verdict: "unchecked";
    }
  | (AcceptedByKind & {
      readonly document: string;
      readonly verdict: "accepted-with-unsupported";
    })
  | (AcceptedByKind & { readonly document: string; readonly verdict: "accepted" });

/**
 * Each QTI 3 root's kind, by its local name in QTI's namespace.
 */
const rootKinds: ReadonlyMap<string, RootKind> = new Map<string, RootKind>([
  ["qti-assessment-item", "item"],
  ["qti-assessment-section", "section"],
  ["qti-assessment-stimulus", "stimulus"],
  ["qti-assessment-test", "test"],
  ["qti-outcome-declaration", "outcome-declaration"],
  ["qti-response-processing", "response-processing"],
]);

/**
 * Report whether {@link checkAdmitted} accepts a root of a kind, when nothing leaves it unchecked.
 *
 * @param kind The root's kind.
 * @returns Whether it is an item, a section or a stimulus.
 */
const isAcceptedKind = (kind: VerdictKind): kind is AcceptedKind =>
  kind === "item" || kind === "section" || kind === "stimulus";

/**
 * A source with its attributes secured, and what securing it removed.
 */
interface Secured {
  /**
   * The features of each URL dropped, keyed by its element's path, in document order, each once.
   */
  readonly drops: ReadonlyMap<string, readonly string[]>;
  /**
   * Each attribute securing removed, as a mark at its element's path.
   */
  readonly marks: readonly UnsupportedFeature[];
  readonly source: SourceDocument;
}

/**
 * The elements whose children are fallback content a browser does not show while it plays or
 * shows the element itself.
 */
const mediaElements: ReadonlySet<string> = new Set(["audio", "picture", "video"]);

/**
 * The elements whose notices are placed after their enclosing media element, never inside it.
 */
const mediaSources: ReadonlySet<string> = new Set(["source", "track"]);

/**
 * Report whether an attribute is `xml:lang` or `xml:base`, which securing keeps on any element
 * beyond XML Schema's allowances.
 *
 * @param attribute The attribute.
 * @returns Whether it is one of the two.
 */
const isLangOrBase = (attribute: SourceAttribute): boolean =>
  attribute.namespace === xmlNamespace &&
  (attribute.local === "lang" || attribute.local === "base");

/**
 * Report whether an attribute is one securing keeps on any element without its table naming it: XML
 * Schema's allowances ({@link isAllowance}: a namespace declaration, `xsi:schemaLocation` or
 * `xsi:noNamespaceSchemaLocation`), `xsi:type` and `xsi:nil` ({@link isInstanceAttribute}), and,
 * beyond those, `xml:lang` and `xml:base` ({@link isLangOrBase}).
 *
 * The database judges `xsi:type` and `xsi:nil` on every element XML Schema assesses (reading
 * `xsi-attributes`), so a valid `xsi:type` is kept, never marked.
 *
 * @param attribute The attribute.
 * @returns Whether it is an allowance.
 */
const isKeptEverywhere = (attribute: SourceAttribute): boolean =>
  isAllowance(attribute) || isInstanceAttribute(attribute) || isLangOrBase(attribute);

/**
 * Report whether an element's table declares an attribute by its exact namespace and local name
 * (the tables hold no prohibited declaration).
 *
 * @param table The table that governs the element.
 * @param namespace The attribute's namespace, `""` for none.
 * @param local The attribute's local name.
 * @returns Whether the table declares it.
 */
const declares = (table: ContentTable, namespace: string, local: string): boolean =>
  table.attributes.some(
    (declaration) => declaration.namespace === namespace && declaration.local === local,
  );

/**
 * The one element whose specification carries its own properties in wildcard-admitted attributes: a
 * `qti-portable-custom-interaction`'s `data-*` attributes are the `properties` its host passes the
 * interaction's module, "all of the key/value pairs from the data- attributes set on the
 * qti-portable-custom-interaction", named as HTML's `dataset` names them (the implementation
 * guide's PCI configuration object). So securing keeps every one there, the names plate reserves
 * among them: they reach the module's properties, never plate's own markers.
 */
const propertiesElement = "qti-portable-custom-interaction";

/**
 * Report whether an attribute is one of the properties {@link propertiesElement} carries in
 * `data-*`, which securing keeps on that element whatever its name.
 *
 * @param local The element's local name.
 * @param attribute The attribute.
 * @returns Whether it is a `data-*` attribute in no namespace on that element.
 */
const isProperty = (local: string, attribute: SourceAttribute): boolean =>
  local === propertiesElement && attribute.namespace === "" && attribute.local.startsWith("data-");

/**
 * Report whether securing keeps an attribute of a QTI-namespace element.
 *
 * It keeps an allowance, an attribute the table that governs the element declares by name, and an
 * author `data-*` ({@link isAuthorData}): a name in the reading's form that plate does not reserve,
 * on any element a wildcard lets carry one. A reserved name the XSD does not declare (`data-slot`,
 * `data-mode`, anything under `data-qti-` but the shared vocabulary's `data-qti-aria-*` and
 * `data-qti-a11y-content-role`, reading `shared-vocabulary-data-attributes`) is removed and marked,
 * so an author's attribute never reaches plate's own marker; `data-ssml`, `data-qti-suppress-tts`
 * and `data-catalog-idref` are the XSD's own, and the table keeps them first. On a
 * `qti-portable-custom-interaction` every `data-*` is kept, reserved or not, as one of its
 * properties ({@link isProperty}). Reading `aria-keyshorts` admits `aria-keyshorts` alone where the
 * table declares it (the empty elements, information model §7.1.44), so an `aria-keyshortcuts`
 * there is removed as any undeclared name is. Names compare exactly, as XML's do.
 *
 * @param local The element's local name.
 * @param table The table that governs the element, none when no declaration governs it, as in
 *   wildcard content the governing walk passes over.
 * @param attribute The attribute.
 * @returns Whether it stays; any other attribute was admitted only by a wildcard.
 */
const isKept = (
  local: string,
  table: Option.Option<ContentTable>,
  attribute: SourceAttribute,
): boolean =>
  isKeptEverywhere(attribute) ||
  (attribute.namespace === "" && isAuthorData(attribute.local)) ||
  isProperty(local, attribute) ||
  Option.exists(table, (declared) => declares(declared, attribute.namespace, attribute.local));

/**
 * Secure one element's attributes: remove each one only a wildcard admits and pass each URL
 * attribute through `url.ts`, its value read under its type's whiteSpace facet (`urlValueOf`),
 * which resolves a package path against the document's location.
 *
 * An element is read by the table that governs it ({@link governingTables}): a valid `xsi:type`'s
 * type, or the declaration that admitted it, a local one included, so an attribute that type or
 * declaration declares is kept. An element the walk passed over in wildcard content, which no
 * declaration governs, has no table, so only what {@link isKept} keeps on every element stays.
 *
 * @param location The document's location as the host named it.
 * @param visit The element's visit.
 * @param governing The table that governs each governed element ({@link governingTables}).
 * @param marks Where securing's marks are collected.
 * @param drops Where each dropped URL's feature is collected, by element path.
 * @returns The attributes that stay, each kept URL in its parsed form: the element's own array
 *   when every attribute stays as written.
 */
const secureAttributes = (
  location: string,
  visit: Visit,
  governing: ReadonlyMap<SourceElement, ContentTable>,
  marks: UnsupportedFeature[],
  drops: Map<string, string[]>,
): readonly SourceAttribute[] => {
  const { element, path } = visit;
  const table = Option.fromUndefinedOr(governing.get(element));
  const kept: SourceAttribute[] = [];
  for (const attribute of element.attributes) {
    if (element.namespace === qtiNamespace && !isKept(element.local, table, attribute)) {
      marks.push({ feature: `attribute:${attributeName(attribute)}`, path, shown: "mark" });
      continue;
    }

    const context = urlContextOf(element, attribute);
    if (Option.isNone(context)) {
      kept.push(attribute);
      continue;
    }

    const url = classifyUrlAt(
      location,
      context.value,
      urlValueOf(element, attribute, attribute.value),
    );
    if (url.kind === "dropped") {
      const features = drops.get(path) ?? [];
      if (!features.includes(url.feature)) {
        drops.set(path, [...features, url.feature]);
      }
    } else {
      const formatted = formatUrl(url);
      kept.push(formatted === attribute.value ? attribute : { ...attribute, value: formatted });
    }
  }

  return kept.length === element.attributes.length &&
    kept.every((attribute, index) => attribute === element.attributes[index])
    ? element.attributes
    : kept;
};

/**
 * Secure a source before the item is built from it.
 *
 * Each element is rebuilt after its descendants, from the walk in reverse, so the work needs no
 * call stack however deep the document; only an element whose attributes changed, or one of whose
 * element children was rebuilt, is rebuilt and recorded as replaced, so securing copies only the
 * elements on the way to a change, and an element with no replacement stays as it is. Element
 * paths do not change: they depend only on element names and their order.
 *
 * Each element is secured by the table that governs it ({@link governingTables}): the type a valid
 * `xsi:type` names, or else the declaration that admitted it, which for a name declared in several
 * places is the one its context holds and not the name's global one. The walk is made once per
 * document and tables.
 *
 * @param source A document the database admitted, that
 *   plate can judge.
 * @param visits The document's walk ({@link walk}), in document order.
 * @param tables The tables it was checked against.
 * @returns The secured source, securing's marks and the dropped URLs.
 */
const secure = (source: SourceDocument, visits: readonly Visit[], tables: Tables): Secured => {
  const marks: UnsupportedFeature[] = [];
  const drops = new Map<string, string[]>();
  const governing = governingTables(source, tables);
  const secured = visits.map((visit) => ({
    attributes: secureAttributes(source.location, visit, governing, marks, drops),
    element: visit.element,
  }));
  const replaced = new Map<SourceElement, SourceElement>();
  for (const { attributes, element } of secured.toReversed()) {
    if (
      attributes !== element.attributes ||
      element.children.some((child) => child.kind === "element" && replaced.has(child))
    ) {
      replaced.set(element, {
        ...element,
        attributes,
        children: element.children.map((child): SourceChild =>
          child.kind === "element" ? (replaced.get(child) ?? child) : child,
        ),
      });
    }
  }

  return {
    drops,
    marks,
    source: { location: source.location, root: replaced.get(source.root) ?? source.root },
  };
};

/**
 * The body nodes a placement gives back, and the notices that move up to the enclosing media
 * element.
 */
interface Placed {
  readonly lifted: readonly Unsupported[];
  readonly nodes: readonly BodyNode[];
}

/**
 * Report whether a body element holds nothing a reader sees: no element, and no text but XML
 * whitespace.
 *
 * @param children The element's children.
 * @returns Whether they are empty to the eye.
 */
const isBare = (children: readonly BodyNode[]): boolean =>
  children.every((child) => child.kind === "text" && regex("^[ \t\r\n]*$", "u").test(child.text));

/**
 * Construct the notices of the URLs dropped from one element, and note that they were placed.
 *
 * @param drops The dropped URLs' features, by element path.
 * @param placed The paths whose notices are in the body.
 * @param path The element's path.
 * @returns One notice per feature, in order.
 */
const noticesAt = (
  drops: ReadonlyMap<string, readonly string[]>,
  placed: Set<string>,
  path: string,
): readonly Unsupported[] => {
  const features = drops.get(path) ?? [];
  if (features.length > 0) {
    placed.add(path);
  }

  return features.map((feature) => ({ feature, kind: "unsupported", path }));
};

/**
 * Place the URL notices among a list of body nodes and inside them.
 *
 * A notice follows its element as its next sibling. A link the drop leaves bare, with no element
 * and no text, is replaced by its notice. A `source` or `track` inside an `audio`, `picture` or
 * `video` lifts its notice to just after that media element, where a reader sees it; inside, it
 * would be fallback content.
 *
 * @param nodes The nodes.
 * @param drops The dropped URLs' features, by element path.
 * @param placed The paths whose notices are in the body, added to as they are placed.
 * @param inMedia Whether a media element encloses the nodes.
 * @returns The nodes with their notices, and the notices lifted out of them.
 */
const placeNodes = (
  nodes: readonly BodyNode[],
  drops: ReadonlyMap<string, readonly string[]>,
  placed: Set<string>,
  inMedia: boolean,
): Placed => {
  /**
   * Place the URL notices of one of the nodes and of its subtree.
   *
   * @param node The node.
   * @returns The node and its notices, and the notices lifted out of it.
   */
  const placeNode = (node: BodyNode): Placed => {
    if (node.kind === "element") {
      const media = mediaElements.has(node.tag);
      const inner = placeNodes(node.children, drops, placed, inMedia || media);
      const element: BodyNode = { ...node, children: inner.nodes };
      const own = noticesAt(drops, placed, node.path);
      if (media) {
        return { lifted: [], nodes: [element, ...own, ...inner.lifted] };
      }

      if (inMedia && mediaSources.has(node.tag)) {
        return { lifted: [...inner.lifted, ...own], nodes: [element] };
      }

      if (node.tag === "a" && own.length > 0 && isBare(node.children)) {
        return { lifted: inner.lifted, nodes: own };
      }

      return { lifted: inner.lifted, nodes: [element, ...own] };
    }

    const lifted: Unsupported[] = [];
    const rebuilt = mapChildNodes(node, (children) => {
      const inner = placeNodes(children, drops, placed, inMedia);
      lifted.push(...inner.lifted);

      return inner.nodes;
    });

    return { lifted, nodes: [rebuilt] };
  };

  const results = nodes.map(placeNode);

  return {
    lifted: results.flatMap((result) => result.lifted),
    nodes: results.flatMap((result) => result.nodes),
  };
};

/**
 * Put every unsupported feature of an accepted document in document order, each once per feature
 * and path.
 *
 * @param entries The item's own features, then securing's marks, then the dropped URLs'.
 * @param visits The document's walk, which gives each element's order; securing keeps every
 *   element and its path, so the walk of the source before securing serves. Only the features'
 *   own paths are indexed, and only when there are two or more features to order: hashing a path
 *   reads every character of it, so indexing costs a pass over the whole document's paths.
 * @returns The features ordered by their element, keeping the given order within one element.
 */
const inDocumentOrder = (
  entries: readonly UnsupportedFeature[],
  visits: readonly Visit[],
): readonly UnsupportedFeature[] => {
  const seen = new Set<string>();
  const unique = entries.filter((entry) => {
    const key = `${entry.feature}\n${entry.path}`;
    const fresh = !seen.has(key);
    seen.add(key);

    return fresh;
  });
  if (unique.length < 2) {
    return unique;
  }

  const paths = new Set(unique.map((entry) => entry.path));
  const order = new Map<string, number>();
  for (const [index, visit] of visits.entries()) {
    if (paths.has(visit.path)) {
      order.set(visit.path, index);
    }
  }

  return unique.toSorted((a, b) => (order.get(a.path) ?? 0) - (order.get(b.path) ?? 0));
};

/**
 * Give the features of the URLs securing dropped, each a notice where its element's notice was
 * placed in what the page shows, and a mark otherwise.
 *
 * @param secured The secured source and what securing it removed.
 * @param placed The paths whose notices were placed.
 * @returns The features, by element in the order securing met them.
 */
const droppedFeatures = (
  secured: Secured,
  placed: ReadonlySet<string>,
): readonly UnsupportedFeature[] =>
  Array.from(secured.drops, ([path, features]) =>
    features.map((feature): UnsupportedFeature => ({
      feature,
      path,
      shown: placed.has(path) ? "notice" : "mark",
    })),
  ).flat();

/**
 * Give the item its URL notices and the accepted document's unsupported features.
 *
 * A dropped URL whose element the body or a modal feedback's content holds is a notice beside it.
 * One inside a part the page already shows as a notice, or outside both, has no place to show, so
 * it is a mark.
 *
 * @param built The item built from the secured source.
 * @param secured The secured source and what securing it removed.
 * @param visits The walk of the source before securing, whose paths are the secured source's.
 * @returns The item with its notices placed and every unsupported feature listed.
 */
const complete = (built: Item, secured: Secured, visits: readonly Visit[]): Item => {
  const placed = new Set<string>();
  const result = placeNodes(built.body, secured.drops, placed, false);
  const modalFeedback = built.modalFeedback.map((feedback) => {
    const content = placeNodes(feedback.content, secured.drops, placed, false);

    return { ...feedback, content: [...content.nodes, ...content.lifted] };
  });

  return {
    ...built,
    body: [...result.nodes, ...result.lifted],
    modalFeedback,
    unsupported: inDocumentOrder(
      [...built.unsupported, ...secured.marks, ...droppedFeatures(secured, placed)],
      visits,
    ),
  };
};

/**
 * Collect every reason plate cannot judge a document whose root it judges, in document order: each
 * island of a namespace outside QTI's, an element whose parent is outside its namespace, as
 * `checkIsland` in `#plate/content/modules.ts` judges it (an SSML island leaves the document
 * unchecked), each XInclude element whose parent is outside its namespace, each attribute whose
 * value holds an unexpanded entity reference, and each element with one among its children.
 *
 * An XInclude `include` is a reason in every root, a section's as an item's: an included fragment
 * is judged in place, as its merged document holds it (reading `fragment-placement`), and plate
 * never fetches the fragment, so it can judge neither the fragment nor the document that places it.
 * An include with an external `href`, which reading `include-target` ("An include names a document
 * of its package or a resource outside it") admits, is only a reason here. One with an `xpointer`
 * or with a `parse` other than `xml` never reaches here: admission refuses it (reading
 * `inclusion-cycles`, "an included fragment is read in place, as XML, with no `xpointer`").
 *
 * @param visits The walk of an item, a section or a stimulus.
 * @returns The reasons, empty when plate can judge all of it.
 */
const uncheckedReasons = (visits: readonly Visit[]): readonly UncheckedReason[] => {
  const reasons: UncheckedReason[] = [];
  for (const { element, parent, path } of visits) {
    /**
     * Report whether the element starts an island of a namespace: it is in that namespace and its
     * parent, if any, is not.
     *
     * @param namespace The island's namespace.
     * @returns Whether the element is the island's outermost element.
     */
    const island = (namespace: string): boolean =>
      element.namespace === namespace &&
      !Option.exists(parent, (container) => container.namespace === namespace);
    if (element.namespace !== qtiNamespace && island(element.namespace)) {
      reasons.push(...checkIsland(element, path));
    }

    if (island(xincludeNamespace)) {
      reasons.push({ path, reason: "xinclude" });
    }

    for (const attribute of element.attributes) {
      if (attribute.references.length > 0) {
        reasons.push({ path: attributePath(path, attribute), reason: "entity" });
      }
    }

    if (element.children.some((child) => child.kind === "entity")) {
      reasons.push({ path, reason: "entity" });
    }
  }

  return reasons;
};

/**
 * Give the kind of a document's root where plate renders it, or else the verdict on the document:
 * a QTI root other than an item, a section or a stimulus (a test, an outcome declaration, response
 * processing) is `unchecked`, its one reason `root` at the root's path, so plate never renders it.
 *
 * @param source The document.
 * @returns The root's kind, or the verdict on a root plate does not judge.
 * @throws {InadmissibleDocument} When the root is none of QTI's six: outside QTI's namespace, or a
 *   QTI element no document is rooted in, which no host opens.
 */
const judgedKind = (source: SourceDocument): Result.Result<AcceptedKind, Verdict> => {
  const { local, namespace } = source.root;
  const kind = namespace === qtiNamespace ? rootKinds.get(local) : undefined;
  if (kind === undefined) {
    return inadmissible({ document: source }, "a root that is no QTI 3 root", local, {
      element: local,
      namespace,
    });
  }

  return isAcceptedKind(kind)
    ? Result.succeed(kind)
    : Result.fail({
        document: source.location,
        kind,
        reasons: [{ path: local, reason: "root" }],
        verdict: "unchecked",
      });
};

/**
 * Read an attribute in no namespace that a QTI root must carry.
 *
 * @param source The document, its root in QTI's namespace.
 * @param name The attribute's name.
 * @returns Its value as written.
 * @throws {InadmissibleDocument} When the root lacks it, which the database refuses.
 */
const rootAttribute = (source: SourceDocument, name: string): string =>
  Option.match(
    Arr.findFirst(
      source.root.attributes,
      (attribute) => attribute.namespace === "" && attribute.local === name,
    ),
    {
      onNone: () =>
        inadmissible({ document: source }, "missing-attribute", source.root.local, {
          attribute: name,
          element: source.root.local,
        }),
      onSome: (attribute) => attribute.value,
    },
  );

/**
 * Give the mark of a root plate accepts and never delivers alone, at the root's path.
 *
 * @param source The section or stimulus document.
 * @param mark The root's mark.
 * @returns The mark.
 */
const rootMarkOf = (source: SourceDocument, mark: RootMark): UnsupportedFeature => ({
  feature: mark,
  path: source.root.local,
  shown: "mark",
});

/**
 * Read what plate holds of a section document: its identifier, its title and its root mark.
 *
 * @param source A section document the database admitted.
 * @returns The summary.
 */
const summariseSection = (source: SourceDocument): SectionSummary => ({
  document: source.location,
  identifier: trimXmlSpace(rootAttribute(source, "identifier")),
  title: rootAttribute(source, "title"),
  unsupported: [rootMarkOf(source, "root:qti-assessment-section")],
});

/**
 * A document the database admitted, as the item model reads it. The database is the only judge of
 * a document's validity (pantry's laws), so a document reaches plate only once admission accepted
 * it; this brand is minted here alone, on the path {@link checkAdmitted} takes, so `buildItem` and
 * `buildStimulus` read only admitted documents, whose structure the XSD holds.
 */
export type AdmittedDocument = SourceDocument & Brand.Brand<"AdmittedDocument">;

/**
 * Mint an {@link AdmittedDocument}.
 */
const admittedDocument = Brand.nominal<AdmittedDocument>();

/**
 * Give the verdict on an item the database admitted and plate can judge: secure it, build it, and
 * accept it.
 *
 * @param source The item.
 * @param visits The item's walk ({@link walk}).
 * @param tables The ASI XSD's tables securing reads.
 * @returns `accepted` or `accepted-with-unsupported`.
 */
const checkItem = (source: SourceDocument, visits: readonly Visit[], tables: Tables): Verdict => {
  const document = source.location;
  const secured = secure(source, visits, tables);
  const item = complete(buildItem(admittedDocument(secured.source)), secured, visits);
  const accepted = accept({ document, item });

  return item.unsupported.length > 0
    ? { accepted, document, kind: "item", verdict: "accepted-with-unsupported" }
    : { accepted, document, kind: "item", verdict: "accepted" };
};

/**
 * Give the verdict on a stimulus the database admitted and plate can judge: secure it as an item
 * is, build it, place the notices of its dropped URLs in its body, and accept it, always
 * `accepted-with-unsupported`, its root's mark first ({@link StimulusFields}).
 *
 * @param source The stimulus.
 * @param visits The stimulus's walk ({@link walk}).
 * @param tables The ASI XSD's tables securing reads.
 * @returns `accepted-with-unsupported`.
 */
const checkStimulus = (
  source: SourceDocument,
  visits: readonly Visit[],
  tables: Tables,
): Verdict => {
  const document = source.location;
  const secured = secure(source, visits, tables);
  const built = buildStimulus(admittedDocument(secured.source));
  const placed = new Set<string>();
  const result = placeNodes(built.body, secured.drops, placed, false);
  const stimulus: Stimulus = {
    ...built,
    body: [...result.nodes, ...result.lifted],
    unsupported: inDocumentOrder(
      [
        rootMarkOf(source, "root:qti-assessment-stimulus"),
        ...built.unsupported,
        ...secured.marks,
        ...droppedFeatures(secured, placed),
      ],
      visits,
    ),
  };

  return {
    accepted: acceptStimulus({ document, stimulus }),
    document,
    kind: "stimulus",
    verdict: "accepted-with-unsupported",
  };
};

/**
 * Give the verdict on an item, a section or a stimulus, once its root is judged: it is `unchecked`
 * for any of {@link uncheckedReasons}, and is otherwise secured,
 * built and accepted by its kind. The document is walked once, here, and the reasons, the securing
 * and the order of the unsupported features all read that walk.
 *
 * @param source The document.
 * @param kind Its root's kind.
 * @param tables The ASI XSD's tables securing reads.
 * @returns The verdict.
 */
const judge = (source: SourceDocument, kind: AcceptedKind, tables: Tables): Verdict => {
  const document = source.location;
  const visits = [...walk(source)];
  const reasons = uncheckedReasons(visits);
  if (reasons.length > 0) {
    return { document, kind, reasons, verdict: "unchecked" };
  }

  switch (kind) {
    case "item": {
      return checkItem(source, visits, tables);
    }
    case "section": {
      return {
        accepted: acceptSection(summariseSection(source)),
        document,
        kind,
        verdict: "accepted-with-unsupported",
      };
    }
    case "stimulus": {
      return checkStimulus(source, visits, tables);
    }
  }
};

/**
 * Give the verdict on a document the database admitted, in order:
 *
 * 1. Its root: a root outside QTI's namespace, or a QTI root other than an item, a section or a
 *    stimulus, a test among them, is `unchecked`, its one reason `root` at the root's path. plate
 *    never renders such a document.
 * 2. What plate cannot render (SSML, an XInclude `include`, an unexpanded entity reference) leaves the
 *    document `unchecked`.
 * 3. An item and a stimulus are secured through the tables and built; a section is summarised.
 *
 * It runs no rule of QTI's: the database judged the document before any host serves it, so never
 * give it a document from anywhere else.
 *
 * @param source The document, as the reader adapter built it.
 * @param tables The ASI XSD's tables securing reads.
 * @returns The verdict: accepting, or `unchecked` for what plate does not render.
 * @throws {InadmissibleDocument} When the document is outside admission's contract, a defect.
 */
export const checkAdmitted = (source: SourceDocument, tables: Tables): Verdict =>
  Result.match(judgedKind(source), {
    onFailure: (verdict) => verdict,
    onSuccess: (kind) => judge(source, kind, tables),
  });

/**
 * Construct an {@link Accepted} from a hand-built item: the one named seam through which tests
 * reach `redact` and `score` without a source. Nothing outside a test calls it; it secures
 * nothing, so it must never take an item a host built from untrusted content.
 *
 * @param item The hand-built item.
 * @returns The item accepted as it is, with its own unsupported features.
 */
export const acceptForTest = (item: Item): Accepted => accept({ document: item.document, item });

/**
 * Read the accepted item out of a verdict: the one way a caller reads one.
 *
 * An `accepted` or `accepted-with-unsupported` verdict of kind `item` gives its {@link Accepted};
 * `unchecked` gives none, and so does an accepting verdict on a section or a stimulus.
 *
 * @param verdict The verdict, as {@link checkAdmitted} gave it.
 * @returns The accepted item, or none when the verdict accepts no item.
 */
export const acceptedItem = (verdict: Verdict): Option.Option<Accepted> =>
  (verdict.verdict === "accepted" || verdict.verdict === "accepted-with-unsupported") &&
  verdict.kind === "item"
    ? Option.some(verdict.accepted)
    : Option.none();

/**
 * Give the features an accepting verdict names as not rendered or not delivered, for a document of
 * any kind: an item's, a section's root mark, or a stimulus's root mark and its own.
 *
 * @param verdict The verdict, as {@link checkAdmitted} gave it.
 * @returns The accepted document's unsupported features, in its order; none for `unchecked`.
 */
export const unsupportedFeatures = (verdict: Verdict): readonly UnsupportedFeature[] => {
  if (verdict.verdict !== "accepted" && verdict.verdict !== "accepted-with-unsupported") {
    return [];
  }

  switch (verdict.kind) {
    case "item": {
      return verdict.accepted.item.unsupported;
    }
    case "section": {
      return verdict.accepted.unsupported;
    }
    case "stimulus": {
      return verdict.accepted.stimulus.unsupported;
    }
  }
};

/**
 * Read the accepted stimulus out of a verdict: the one way a host reads one, to hand `<Item>` with
 * each item that references it.
 *
 * An accepting verdict of kind `stimulus`, always `accepted-with-unsupported` for its root's mark,
 * gives its {@link AcceptedStimulus}; `unchecked` gives none, and so does an accepting verdict on
 * an item or a section.
 *
 * @param verdict The verdict, as {@link checkAdmitted} gave it.
 * @returns The accepted stimulus, or none when the verdict accepts no stimulus.
 */
export const acceptedStimulus = (verdict: Verdict): Option.Option<AcceptedStimulus> =>
  (verdict.verdict === "accepted" || verdict.verdict === "accepted-with-unsupported") &&
  verdict.kind === "stimulus"
    ? Option.some(verdict.accepted)
    : Option.none();
