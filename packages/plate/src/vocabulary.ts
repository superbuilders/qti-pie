/**
 * The closed value sets: the QTI vocabulary plate models and reads, and the package vocabulary, as
 * data.
 *
 * Every set is closed: a value outside it is unsupported or invalid, never guessed at. The item
 * model reads {@link modelled}, so what plate models, marks and shows as a notice is decided once.
 *
 * What an element does comes from its QTI name, attributes and binding alone: no vocabulary class
 * changes it. `styles/theme.css` is the inventory of the classes plate presents, but for
 * `qti-match-tabular`, which lays a Match out as a table whose markup no stylesheet could write
 * (`#plate/ui/item/interactions/match.tsx`), and {@link carriedClass} the one class plate leaves off
 * for a candidate's PNP.
 *
 * @module
 */
import { Option } from "effect";
import { controlCap } from "#plate/control-cap.ts";
import type { ModuleKind } from "#plate/interactions/contract.ts";
import type { Supports } from "#plate/supports.ts";

/**
 * The eleven QTI base types, as the `base-type` attribute spells them.
 *
 * The value model holds all eleven; a `file` is its name, size and type, never its bytes
 * (`FileValue` in `#plate/model/values.ts`).
 */
export const baseTypes = [
  "identifier",
  "boolean",
  "integer",
  "float",
  "string",
  "point",
  "pair",
  "directedPair",
  "duration",
  "file",
  "uri",
] as const;

/**
 * A QTI base type.
 */
export type BaseType = (typeof baseTypes)[number];

/**
 * The four QTI cardinalities, as the `cardinality` attribute spells them.
 */
export const cardinalities = ["single", "multiple", "ordered", "record"] as const;

/**
 * A QTI cardinality.
 */
export type Cardinality = (typeof cardinalities)[number];

/**
 * The five geometries of an area, as QTI's `shape` attribute spells them, the XSD's `ShapeEnum`:
 * on a `qti-area-map-entry` and a `qti-inside`, which a point response is scored by, and on a
 * `qti-hotspot-choice` and a `qti-associable-hotspot`, the areas a graphic interaction draws.
 */
export const areaGeometries = ["circle", "default", "ellipse", "poly", "rect"] as const;

/**
 * The geometry of an area, one of {@link areaGeometries}.
 */
export type AreaGeometry = (typeof areaGeometries)[number];

/**
 * The QTI names of the four interactions `modelled` names among the elements it renders, and whose
 * notices it states: Choice, Text Entry, Extended Text and Inline Choice. Each is read, as every
 * interaction is, through its module (`#plate/interactions/`), which declares the binding it
 * renders with.
 */
export const interactionNames = [
  "qti-choice-interaction",
  "qti-text-entry-interaction",
  "qti-extended-text-interaction",
  "qti-inline-choice-interaction",
] as const;

/**
 * The text interactions, Text Entry and Extended Text, which share their bindings and most of
 * their unsupported features.
 */
const textInteractions = ["qti-text-entry-interaction", "qti-extended-text-interaction"] as const;

/**
 * The declarations whose `base-type` and `cardinality` the model reads: the response, outcome and
 * template declarations.
 */
const declarations = [
  "qti-response-declaration",
  "qti-outcome-declaration",
  "qti-template-declaration",
] as const;

/**
 * What makes an element carry an unsupported feature.
 *
 * - `element`: the element itself is present.
 * - `attribute`: the element carries the attribute `name`, with any value. A name in the XML
 *   namespace is spelled with its reserved prefix, `xml:base`.
 * - `attribute-value`: the element's attribute `name` has the value `value`.
 * - `integer-above`: the element's attribute `name`, its outer whitespace gone, reads as an integer
 *   greater than `limit`. A value that is not an integer never is.
 * - `refused-pattern`: the element carries the attribute `name`, and `compile` in
 *   `#plate/model/regex.ts` refuses its value as an XML Schema regular expression, so the pattern
 *   cannot be checked.
 * - `untyped`: the declaration carries no `base-type` and its cardinality is not `record`, the one
 *   cardinality that has none.
 */
export type Condition =
  | { readonly kind: "element" }
  | { readonly kind: "attribute"; readonly name: string }
  | { readonly kind: "attribute-value"; readonly name: string; readonly value: string }
  | { readonly kind: "integer-above"; readonly limit: bigint; readonly name: string }
  | { readonly kind: "refused-pattern"; readonly name: string }
  | { readonly kind: "untyped" };

/**
 * The rule that finds a feature plate does not render: the key the verdict and its notice name
 * the feature by, the elements that can carry it, and the condition under which one does.
 *
 * `on` names the elements that can carry it by their QTI local name, or is `body` for every element
 * in the item body.
 */
export interface FeatureRule {
  readonly feature: string;
  readonly on: "body" | readonly string[];
  readonly when: Condition;
}

/**
 * The "modelled" set, which the item model reads.
 */
interface Modelled {
  /**
   * The features shown as a notice in place of an interaction's Controls. The interaction is still
   * built, every field held, and its Prompt renders; only its Controls give way to the notice, and
   * the verdict lists the feature as one shown as a notice.
   */
  readonly controlNotices: readonly FeatureRule[];
  /**
   * The `qti-*` elements plate renders or reads. They include the template declarations, the
   * response and template processing (which the model skips: the QTI database runs both),
   * `qti-printed-variable`,
   * `qti-template-block` (whose content is its `qti-content-body`'s), `qti-template-inline`,
   * `qti-feedback-block` (whose content is its `qti-content-body`'s too) and `qti-feedback-inline`,
   * which the item model holds as body nodes, and `qti-modal-feedback`, which it holds beside the
   * body, its content its `qti-content-body`'s. Every element in
   * the QTI namespace without the `qti-` prefix is HTML and renders as itself.
   */
  readonly elements: readonly string[];
  /**
   * The features recorded on the verdict with no body notice. A declaration the model does not hold
   * carries one: `base-type=""` when it has no base type, or `cardinality="record"`, which an
   * outcome or template declaration of that cardinality carries; the model holds every record
   * response and every base type, `file` included. Beyond these, a `qti-*` element outside the
   * item body and outside `elements` is a mark keyed by its own name. Response and template
   * processing carry no mark: the QTI database runs every construct of them.
   */
  readonly marks: readonly FeatureRule[];
  /**
   * The features shown as a notice in place of their interaction. Beyond these, a `qti-*` element
   * in the item body outside `elements` is a notice keyed by its own name, which covers the custom
   * interactions: accepted, not launched. A `qti-rubric-block` whose `view` leaves out
   * `candidate` is none: no view plate writes holds it, so the body leaves it out.
   */
  readonly notices: readonly FeatureRule[];
}

/**
 * What plate models, reads, shows a notice for and marks, as data.
 *
 * The item model reads these lists, and the verdict names each feature it finds unsupported, so an
 * element is modelled exactly when the verdict does not name it.
 */
export const modelled = {
  controlNotices: [controlCap],
  elements: [
    "qti-assessment-item",
    "qti-response-declaration",
    "qti-outcome-declaration",
    "qti-correct-response",
    "qti-default-value",
    "qti-value",
    "qti-mapping",
    "qti-map-entry",
    "qti-area-mapping",
    "qti-area-map-entry",
    "qti-match-table",
    "qti-match-table-entry",
    "qti-interpolation-table",
    "qti-interpolation-table-entry",
    "qti-item-body",
    "qti-response-processing",
    ...interactionNames,
    "qti-prompt",
    "qti-simple-choice",
    "qti-inline-choice",
    "qti-label",
    "qti-printed-variable",
    "qti-template-block",
    "qti-content-body",
    "qti-template-inline",
    "qti-feedback-block",
    "qti-feedback-inline",
    "qti-modal-feedback",
    "qti-template-declaration",
    "qti-template-processing",
  ],
  marks: [
    {
      feature: "string-identifier",
      on: textInteractions,
      when: { kind: "attribute", name: "string-identifier" },
    },
    // A record response declaration is never marked: the item model holds every one in
    // `Item.records`, a field of `file` as a single of `file`. An outcome or template declaration
    // of that cardinality is marked.
    {
      feature: 'cardinality="record"',
      on: ["qti-outcome-declaration", "qti-template-declaration"],
      when: { kind: "attribute-value", name: "cardinality", value: "record" },
    },
    // A declaration with no base type is keyed `base-type=""`, as an interaction bound to one is.
    { feature: 'base-type=""', on: declarations, when: { kind: "untyped" } },
    { feature: "xml:base", on: "body", when: { kind: "attribute", name: "xml:base" } },
    // `data-ssml` and `data-qti-suppress-tts` are not marks: the body walk keeps both on their
    // elements, and `<Item>` writes them to the page.
  ],
  notices: [
    // Every pattern in Appendix F's language compiles and is checked, whatever its counts. A
    // pattern-mask outside that grammar is no regular expression, which the information model's
    // §5.48.4 and §5.162.5 forbid ("The regular expression language used is defined in Appendix F
    // of [XSCHEMA, 01]"): there is nothing to check a response by, so the item keeps this notice.
    {
      feature: "pattern-mask",
      on: textInteractions,
      when: { kind: "refused-pattern", name: "pattern-mask" },
    },
  ],
} as const satisfies Modelled;

/**
 * The vocabulary classes an interaction's root leaves off for a candidate whose PNP shows
 * low-vision indications, by the interaction's module kind: Graphic Gap Match's
 * `qti-unselected-hidden`, which "should be ignored" for such a candidate (the shared
 * vocabulary's section 1.2.10.3, reading 192), so its hotspots stay visible. Hotspot's and Hot
 * Text's sections of the class (1.2.5.1, 1.2.6.3) say nothing of the PNP.
 */
const lowVisionIgnored: ReadonlyMap<ModuleKind, readonly string[]> = new Map([
  ["graphic-gap-match", ["qti-unselected-hidden"]],
]);

/**
 * Tell whether a candidate's supports show low-vision indications (reading 192): magnification,
 * inverted display polarity or the `high-contrast` catalog support is active, the AfA PNP 3.0
 * features whose descriptions concern sight alone (information model 4.1.23, 4.1.22, 4.1.36).
 *
 * @param supports The supports the host enabled.
 * @returns Whether any of the three is active.
 */
const showsLowVision = (supports: Pick<Supports, "catalog" | "display">): boolean =>
  Option.isSome(supports.display.magnification) ||
  supports.display.invertDisplayPolarity ||
  supports.catalog.has("high-contrast");

/**
 * Read a `class` attribute's tokens: its value split on ASCII whitespace, as HTML reads a set of
 * space-separated tokens, empty tokens left out.
 *
 * @param classes The attribute's value.
 * @returns Its tokens, in written order.
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#set-of-space-separated-tokens
 */
export const classTokensOf = (classes: string): readonly string[] =>
  classes.split(/[\t\n\f\r ]+/u).filter((token) => token !== "");

/**
 * Tell whether a `class` attribute holds a token.
 *
 * @param classes The attribute as written, none when absent.
 * @param token The token.
 * @returns Whether {@link classTokensOf} gives it.
 */
export const hasClass = (classes: Option.Option<string>, token: string): boolean =>
  Option.exists(classes, (written) => classTokensOf(written).includes(token));

/**
 * Plate's renderer vocabulary: the classes, each prefixed `plate-`, an author writes on a standard
 * QTI element to ask plate for a presentation QTI 3's shared vocabulary has no class for, each
 * entered here once, so the model, the islands, the review and the theme read one name
 * (metis's no-regression plan, section 3.2, under plate's prefix on edullm-bd's order of
 * 2026-11-22). Classes, never `data-*`: under the ruling of 2026-11-10 every `data-*` name plate
 * reads is reserved and dropped from author content, so a parameter plate reads rides on a class
 * token. Each changes how plate draws the element and nothing it does, no response, limit or name,
 * and a renderer that knows none of them still renders the standard interaction beneath it.
 *
 * - `arrowUp`, `arrowDown`, on a `qti-associable-hotspot`: an arrow drawn above the hotspot pointing
 *   up, or below it pointing down, as AlphaTest's player drew one beside a drop box (R9).
 */
export const plateClasses = {
  arrowDown: "plate-arrow-down",
  arrowUp: "plate-arrow-up",
} as const;

/**
 * Give the class an interaction's root carries for a candidate: the author's `class` as written,
 * less each class {@link lowVisionIgnored} names for its owner when the candidate's supports show
 * low-vision indications ({@link showsLowVision}), and none when no class token is left.
 *
 * @param owner The interaction's module kind, such as `graphic-gap-match`.
 * @param written The author's `class` as written, none when absent.
 * @param supports The supports the host enabled.
 * @returns The class, as written when nothing is left off, none when it holds no token.
 */
export const carriedClass = (
  owner: ModuleKind,
  written: Option.Option<string>,
  supports: Pick<Supports, "catalog" | "display">,
): Option.Option<string> =>
  written.pipe(
    Option.flatMap((classes) => {
      const ignored = lowVisionIgnored.get(owner) ?? [];
      const tokens = classTokensOf(classes);
      const kept =
        ignored.length === 0 || !showsLowVision(supports)
          ? tokens
          : tokens.filter((token) => !ignored.includes(token));

      if (kept.length === 0) {
        return Option.none();
      }

      return Option.some(kept.length === tokens.length ? classes : kept.join(" "));
    }),
  );

/**
 * The prefix of the `data-*` names plate reserves wholesale, but for QTI's own shared vocabulary
 * under it ({@link isSharedVocabulary}). `data-qti-suppress-tts` is under it and is also an
 * attribute the XSD declares, so it still passes where the XSD declares it: the declared set is
 * asked first.
 */
const reservedDataPrefix = "data-qti-";

/**
 * Tell whether a name under {@link reservedDataPrefix} is one QTI's shared vocabulary gives the
 * author (reading 200): `data-qti-a11y-content-role`, which marks accessibility content
 * (section 1.1.1.5), or `data-qti-aria-` followed by an ARIA attribute's name, a backup for an
 * ARIA attribute the element does not declare (section 1.1.1.4).
 *
 * @param name The attribute's local name.
 * @returns Whether it is one of the two.
 */
const isSharedVocabulary = (name: string): boolean =>
  name === "data-qti-a11y-content-role" || /^data-qti-aria-[a-z0-9_.-]+$/u.test(name);

/**
 * The `data-*` names plate itself writes or reads, which an author's attribute never takes.
 *
 * Bjorn's ruling on author `data-*` (2026-11-10): "Pass valid author data-* attributes through to
 * the rendered HTML, on HTML content elements and on interaction roots, unchanged. Plate's own
 * markers are reserved: data-slot, data-area, data-position, data-empty, data-qti-_, and every
 * data-_ name plate emits, all derived from one table. An author attribute with a reserved name is
 * dropped, not refused. It never overrides plate's marker, and the drop is documented, with a test.
 * Plate attaches no behaviour to passed-through attributes. They're inert in HTML until the app's
 * own CSS or JS reads them. PCI keeps the route it has now."
 *
 * The basis is QTI 3 Binding, section 6.7. This is the one table: securing (`checkAdmitted`) and
 * the shell's attribute guard (`#plate/ui/item/html.ts`) read it, and neither keeps a list of its
 * own. It holds the ruling's four fixed names and every `data-*` name plate's UI writes on its own
 * parts or its stylesheets select (`#plate/ui/**`, `#plate/styles/**`): the part marker, the item's
 * mode, its keyword emphasis and its modal feedback's credit, a rubric block's `use`, a catalog
 * card's `support`, what a companion material says a host supplies, the states the islands and the
 * review markup set (a slider's bound and direction, a slider review value's place along its scale,
 * a placement's pairing, a bank chip a review shows as missing, a marker's index and tone, a media
 * island's playing, an End Attempt's pending post, a PCI island's loading and failure), and the
 * states of UI SDK's components that `styles/base.css` and `styles/theme.css` select, and a
 * formula's: `data-display` on its root, and the names plate writes into the MathML it hands
 * MathJax (`data-mjx-texclass`, a slot's `data-plate-slot`) or reads in the SVG MathJax draws
 * (`data-mml-node`, `data-c`, `data-line`, `data-frame`, `data-table`, `data-background`),
 * `#plate/ui/item/contents/mathjax.ts`. The `data-qti-` prefix is {@link reservedDataPrefix}, not
 * a member, and plate writes no name under it.
 */
const reservedDataNames: ReadonlySet<string> = new Set([
  "data-area",
  "data-background",
  "data-bound",
  "data-c",
  "data-calculator-type",
  "data-checked",
  "data-copies",
  "data-credit",
  "data-disabled",
  "data-display",
  "data-dragging",
  "data-empty",
  "data-failed",
  "data-focus-visible",
  "data-format",
  "data-fraction",
  "data-frame",
  "data-full",
  "data-highlighted",
  "data-hotspot-list",
  "data-hotspot-picks",
  "data-indeterminate",
  "data-index",
  "data-invalid",
  "data-keypad-key",
  "data-keypad-layout",
  "data-keyword-emphasis",
  "data-line",
  "data-loading",
  "data-major-increment",
  "data-major-unit",
  "data-mark",
  "data-material",
  "data-minimum-length",
  "data-minor-increment",
  "data-minor-unit",
  "data-missed",
  "data-mjx-texclass",
  "data-mml-node",
  "data-mode",
  "data-open",
  "data-orientation",
  "data-over",
  "data-paired",
  "data-pending",
  "data-picked",
  "data-placed",
  "data-placeholder",
  "data-plate-slot",
  "data-playing",
  "data-position",
  "data-pressed",
  "data-refuses",
  "data-reverse",
  "data-selected",
  "data-slot",
  "data-support",
  "data-system",
  "data-table",
  "data-tone",
  "data-unchecked",
  "data-unnamed",
  "data-use",
  "data-used",
]);

/**
 * Tell whether an attribute name is an author `data-*` plate passes through: the reading's form
 * (`data-` and one or more of `a-z`, `0-9`, `_`, `.` and `-`, reading 13), outside
 * {@link reservedDataPrefix} or one of the shared vocabulary's names under it
 * ({@link isSharedVocabulary}, reading 200), and not one of {@link reservedDataNames}.
 *
 * The name is the attribute's local name; one in a namespace is never an author `data-*`, and the
 * caller checks the namespace. The form admits no uppercase letter, so `data-SLOT`, which a browser
 * reads as the reserved `data-slot`, is no author `data-*` either.
 *
 * @param name The attribute's local name, as authored.
 * @returns Whether plate keeps the attribute.
 */
export const isAuthorData = (name: string): boolean =>
  /^data-[a-z0-9_.-]+$/u.test(name) &&
  (!name.startsWith(reservedDataPrefix) || isSharedVocabulary(name)) &&
  !reservedDataNames.has(name);

/**
 * The namespace of a QTI 3.0.1 package's manifest (`imsqtiv3p0p1_imscpv1p2_v1p0.xsd`).
 */
export const manifestNamespace = "http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1";

/**
 * The views an outcome is reported to, the XSD's `ViewEnumDType`: an outcome declaration's `view`
 * lists some of them, and the results report writes them back.
 */
export const outcomeViews = [
  "author",
  "candidate",
  "proctor",
  "scorer",
  "testConstructor",
  "tutor",
] as const;

/**
 * One of {@link outcomeViews}.
 */
export type OutcomeView = (typeof outcomeViews)[number];

/**
 * The values of an outcome declaration's `external-scored`, which "identifies whether or not the
 * value for this outcome is produced by human or by machine scoring" (the information model's
 * OutcomeDeclaration, section 4.5.10): `externalMachine` or `human`.
 */
export const externalScorings = ["externalMachine", "human"] as const;

/**
 * One of {@link externalScorings}.
 */
export type ExternalScoring = (typeof externalScorings)[number];

/**
 * The marks of a section or a stimulus given as a document's root, which plate accepts and never
 * delivers alone.
 */
export type RootMark = "root:qti-assessment-section" | "root:qti-assessment-stimulus";
