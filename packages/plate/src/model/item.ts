/**
 * The item model: what plate reads from a valid `qti-assessment-item`, typed, with every feature
 * it does not render named as a notice or a mark.
 *
 * {@link buildItem} reads the declarations (`#plate/model/declarations.ts`), the template
 * the body (`#plate/model/body.ts`) into one {@link Item}, each through the build those
 * modules share (`#plate/model/build.ts`). This module holds the model's types and the build. The
 * vocabulary module's `modelled` decides what is modelled and what is unsupported, so the verdict,
 * the payload and the server shell meet the same decision. A document reaches it only once the
 * database admitted it, so a typed value outside its lexical space is a defect, thrown.
 *
 * An author `data-*` attribute on a body element is carried as the element's attribute, unchanged,
 * and the server shell writes it; plate reads none of them and attaches no behaviour. The drop is
 * made once, upstream, by `checkAdmitted`'s securing: a `data-*` name plate reserves
 * (`reservedDataNames` and the `data-qti-` prefix in `#plate/vocabulary.ts`) and the XSD does not
 * declare is removed and marked `attribute:<name>` before this builder reads the source, never
 * refused, and it never overrides plate's own marker. So the builder holds no list of reserved
 * names of its own; the server shell drops a reserved name a payload carries all the same, as its
 * own guard. `data-ssml`, `data-qti-suppress-tts` and `data-catalog-idref` are the XSD's own and
 * keep their routes ({@link BodyElement.catalog} for the last). An interaction module's root
 * carries its author `data-*` on its node (`withAuthorData`), and a Portable Custom Interaction
 * reads its own as its properties.
 *
 * @module
 */
import { Option } from "effect";
import type { ContentNode, ItemNodesHeld } from "#plate/content/modules.ts";
import type { SourceDocument, SourceElement } from "#plate/document/source.ts";
import type { ContainerKind, ModuleKind } from "#plate/interactions/contract.ts";
import {
  childrenNamed,
  elementsOf,
  identifierAttribute,
  isQti,
  replaceXmlSpace,
  requiredValue,
  valueOf,
} from "#plate/model/attributes.ts";
import { bodyNodes, collectItemPart, itemPart, modalFeedbackOf } from "#plate/model/body.ts";
import type { ItemContentBuild } from "#plate/model/body.ts";
import {
  adaptiveOf,
  declarationsOf,
  markElement,
  markUnreadWithin,
  pathsOf,
} from "#plate/model/build.ts";
import type { Build } from "#plate/model/build.ts";
import {
  contextDeclaration,
  outcomeDeclaration,
  recordResponse,
  responseDeclaration,
  templateDeclaration,
  unheldDeclaration,
} from "#plate/model/declarations.ts";
import type { IntegerOrRef } from "#plate/model/integer-ref.ts";
import type { ModuleModel } from "#plate/model/interactions.ts";
import type { ModelledBaseType, RecordValue, Single, Value } from "#plate/model/values.ts";
import type { AdmittedDocument } from "#plate/validate/verdict.ts";
import type {
  AreaGeometry,
  BaseType,
  Cardinality,
  ExternalScoring,
  OutcomeView,
} from "#plate/vocabulary.ts";

/**
 * A feature the item holds and plate does not render, where it is, and how it is shown: a
 * `notice` in the body in place of its part, or a `mark` on the verdict only.
 */
export interface UnsupportedFeature {
  /**
   * The feature's key, as the verdict and its notice name it: an element name, an attribute name,
   * or `name="value"`.
   */
  readonly feature: string;
  /**
   * The element path of the element that carries it.
   */
  readonly path: string;
  readonly shown: "mark" | "notice";
}

/**
 * One `qti-map-entry`: the key in its response's base type, the value it maps to, and whether a
 * string key compares case-sensitively (`case-sensitive`, false by default).
 */
export interface MapEntry {
  readonly caseSensitive: boolean;
  readonly key: Single;
  readonly value: number;
}

/**
 * A response's `qti-mapping`, in document order.
 */
export interface Mapping {
  /**
   * The value of a response value no entry maps; 0 when `default-value` is absent.
   */
  readonly defaultValue: number;
  readonly entries: readonly MapEntry[];
  readonly lowerBound: Option.Option<number>;
  readonly upperBound: Option.Option<number>;
}

/**
 * One `qti-area-map-entry`: an area of the coordinate space and the value a point inside it maps
 * to.
 */
export interface AreaMapEntry {
  /**
   * The `coords`, in written order. A coordinate written with `%` holds its number without the
   * sign; the mapping's `percent` records that one was.
   */
  readonly coords: readonly number[];
  readonly mappedValue: number;
  readonly shape: AreaGeometry;
}

/**
 * A point response's `qti-area-mapping`, its entries in document order.
 */
export interface AreaMapping {
  /**
   * The value of a point no area maps; 0 when `default-value` is absent.
   */
  readonly defaultValue: number;
  readonly entries: readonly AreaMapEntry[];
  readonly lowerBound: Option.Option<number>;
  /**
   * Whether any coordinate of any entry is written with `%`. The information model does not say
   * what a percentage means in scoring, and the corpus has none, so response processing that reads
   * such a mapping is marked `area-coords-percent` and does not run.
   */
  readonly percent: boolean;
  readonly upperBound: Option.Option<number>;
}

/**
 * A `qti-response-declaration` of a modelled base type and cardinality (I-1).
 */
export interface ResponseDeclaration {
  /**
   * The `qti-area-mapping` of a `point` declaration, when it has one; none for every other base
   * type.
   */
  readonly areaMapping: Option.Option<AreaMapping>;
  readonly baseType: ModelledBaseType;
  readonly cardinality: Value["cardinality"];
  /**
   * The `qti-correct-response`, when the declaration has one.
   */
  readonly correct: Option.Option<Value>;
  /**
   * The `qti-default-value`, when the declaration has one.
   */
  readonly defaultValue: Option.Option<Value>;
  readonly identifier: string;
  readonly mapping: Option.Option<Mapping>;
}

/**
 * One `qti-match-table-entry`: the integer a lookup matches and the value it then gives.
 */
export interface MatchTableEntry {
  /**
   * `source-value`, an `xs:int`, held exact as every integer is (reading 45).
   */
  readonly sourceValue: bigint;
  /**
   * `target-value`, a value of the outcome's base type (reading 8), read as written for `string`
   * and collapsed for every other base type (reading 7).
   */
  readonly targetValue: Single;
}

/**
 * An outcome's `qti-match-table`, its entries in document order.
 */
interface MatchTable {
  /**
   * `default-value`, a value of the outcome's base type, read as written for `string` and
   * collapsed for every other base type (reading 7), when the table has one.
   */
  readonly defaultValue: Option.Option<Single>;
  readonly entries: readonly MatchTableEntry[];
  readonly kind: "match";
}

/**
 * One `qti-interpolation-table-entry`: the least number a lookup maps to its value.
 */
export interface InterpolationTableEntry {
  /**
   * `include-boundary`, an `xs:boolean` that is true when absent: whether a number equal to
   * `sourceValue` maps to this entry.
   */
  readonly includeBoundary: boolean;
  /**
   * `source-value`, an `xs:double` read as the XSD reads it, outer whitespace collapsed (reading
   * 7).
   */
  readonly sourceValue: number;
  /**
   * `target-value`, a value of the outcome's base type, read as written for `string` and
   * collapsed for every other base type (reading 7).
   */
  readonly targetValue: Single;
}

/**
 * An outcome's `qti-interpolation-table`, its entries in document order.
 */
interface InterpolationTable {
  /**
   * `default-value`, a value of the outcome's base type, read as written for `string` and
   * collapsed for every other base type (reading 7), when the table has one.
   */
  readonly defaultValue: Option.Option<Single>;
  readonly entries: readonly InterpolationTableEntry[];
  readonly kind: "interpolation";
}

/**
 * The table a `qti-lookup-outcome-value` maps its value through: the outcome's match table or its
 * interpolation table.
 */
export type LookupTable = InterpolationTable | MatchTable;

/**
 * A `qti-outcome-declaration` of a modelled base type and cardinality (I-2).
 *
 * Its last six fields are the attributes Results Reporting mirrors on an `outcomeVariable`, each
 * read as the XSD types it and none when the declaration does not carry it. No XSD default is
 * filled in, so an absent `normal-minimum` is none, not 0. Nothing renders them.
 */
export interface OutcomeDeclaration {
  readonly baseType: ModelledBaseType;
  readonly cardinality: Value["cardinality"];
  /**
   * The `qti-default-value`, when the declaration has one.
   */
  readonly defaultValue: Option.Option<Value>;
  /**
   * `external-scored`, `externalMachine` or `human`: the outcome's value is produced by scoring
   * outside the item's response processing (the information model's OutcomeDeclaration, section
   * 4.5.10). Absent when the declaration writes none, so a declaration built by hand may leave it
   * out.
   */
  readonly externalScored?: ExternalScoring;
  readonly identifier: string;
  /**
   * `interpretation`, an `xs:string`, as written.
   */
  readonly interpretation: Option.Option<string>;
  /**
   * `long-interpretation`, an `xs:anyURI`, with its whitespace collapsed. It is only ever copied
   * into a result, never rendered or fetched, so it does not pass through `#plate/model/url.ts`.
   */
  readonly longInterpretation: Option.Option<string>;
  /**
   * The `qti-match-table` or `qti-interpolation-table`, when the declaration has one.
   */
  readonly lookupTable: Option.Option<LookupTable>;
  /**
   * `mastery-value`, an `xs:double`.
   */
  readonly masteryValue: Option.Option<number>;
  /**
   * `normal-maximum`, an `xs:double`. The database holds it above 0 (reading 16).
   */
  readonly normalMaximum: Option.Option<number>;
  /**
   * `normal-minimum`, an `xs:double`.
   */
  readonly normalMinimum: Option.Option<number>;
  /**
   * `view`, a list of {@link outcomeViews} in the order written.
   */
  readonly view: Option.Option<readonly OutcomeView[]>;
}

/**
 * The six reporting attributes of an {@link OutcomeDeclaration}.
 */
export type OutcomeReporting = Pick<
  OutcomeDeclaration,
  | "interpretation"
  | "longInterpretation"
  | "masteryValue"
  | "normalMaximum"
  | "normalMinimum"
  | "view"
>;

/**
 * A `qti-template-declaration` of a modelled base type and cardinality: a template variable, which
 * only template processing sets, and which the item body and response processing may read (the
 * information model's TemplateDeclaration, section 5.151).
 */
export interface TemplateDeclaration {
  readonly baseType: ModelledBaseType;
  readonly cardinality: Value["cardinality"];
  /**
   * The `qti-default-value`, when the declaration has one.
   */
  readonly defaultValue: Option.Option<Value>;
  readonly identifier: string;
  /**
   * `math-variable`, an `xs:boolean`, false when absent: whether the variable's value stands in
   * for a MathML `mi` or `ci` that matches its identifier.
   */
  readonly mathVariable: boolean;
  /**
   * `param-variable`, an `xs:boolean`, false when absent: whether the variable's value stands in
   * for an object parameter's value that matches its identifier.
   */
  readonly paramVariable: boolean;
}

/**
 * A `qti-context-declaration` of a modelled base type and cardinality: a context variable, which no
 * processing sets and which template, response and outcome processing may read (the information
 * model's ContextDeclaration). The QTI database's processing holds it at its default for the whole
 * session, as no host supplies the value of a declared context variable.
 */
export interface ContextDeclaration {
  readonly baseType: ModelledBaseType;
  readonly cardinality: Value["cardinality"];
  /**
   * The `qti-default-value`, when the declaration has one.
   */
  readonly defaultValue: Option.Option<Value>;
  readonly identifier: string;
}

/**
 * An attribute of a body element as written, `xml:lang` under the name `xml:lang`.
 */
export interface BodyAttribute {
  readonly name: string;
  readonly value: string;
}

/**
 * An HTML element of the QTI namespace in the item body (I-8), with its attributes as written but
 * for the ones marked unsupported, an author `data-*` among them (a name plate reserves is dropped
 * upstream, in `checkAdmitted`); or an element an interaction module owns inside its own
 * content, such as a Gap Match's `qti-gap`, which the body walk reads the same way where the module
 * claims it (`ReaderKit.nodes` in `#plate/interactions/contract.ts`), so the redacted body and the
 * server shell carry it as any element.
 *
 * @template L The level of its children.
 */
export interface BodyElement<L extends Level = ModelLevel> {
  readonly attributes: readonly BodyAttribute[];
  /**
   * The `data-catalog-idref` the element carries: the `id` of the `qti-catalog` of its own document
   * whose cards present beside it, kept for the catalog module. Absent when the
   * element references no catalog. The attribute itself is dropped with the other marked
   * attributes.
   */
  readonly catalog?: string;
  readonly children: Nodes<L>;
  readonly kind: "element";
  readonly path: string;
  /**
   * The `data-stimulus-idref` the element carries: the author's identifier of the stimulus whose
   * body shows inside the element, kept for the module that reads the stimulus reference. Never a
   * path. Absent when the element names no stimulus. Unlike `catalog`, the attribute itself stays
   * in `attributes`: it is an author `data-*` attribute, which the body walk carries as written.
   */
  readonly stimulus?: string;
  readonly tag: string;
}

/**
 * A run of text in the item body, whitespace included.
 */
interface BodyText {
  readonly kind: "text";
  readonly text: string;
}

/**
 * How a template variable controls the visibility of a choice, a template block or a template
 * inline: its `template-identifier` and its `show-hide` (the information model's SimpleChoice,
 * section 5.132, InlineChoice, 5.73, TemplateBlock, 5.145, and TemplateInline, 5.155).
 */
export interface TemplateVisibility {
  /**
   * `show-hide`, `show` when absent. `show` hides the part unless the template variable matches,
   * or contains, the part's identifier; `hide` shows it unless the variable does.
   */
  readonly showHide: "hide" | "show";
  /**
   * `template-identifier`: the template variable, of base type identifier and single or multiple
   * cardinality, whose value controls the part's visibility.
   */
  readonly templateIdentifier: string;
}

/**
 * A choice of an interaction's own content as read-aloud knows it: its identifier, and the catalog
 * it references, its `data-catalog-idref` as written (`ReaderKit.catalog` in
 * `#plate/interactions/contract.ts`), none where it references none (plate's reading 236). Each
 * module reads it where it reads the choice and its payload carries it as read, so the server
 * shell writes read-aloud's control beside the choice from this alone (`spokenOf` in
 * `#plate/ui/item/interactions/answering.tsx`).
 */
export interface ReferencingChoice {
  readonly catalog: Option.Option<string>;
  readonly identifier: string;
}

/**
 * A `qti-simple-choice` of a Choice, or a `qti-inline-choice` of an Inline Choice, which carries
 * the same fields: its identifier and the catalog it references, its content, whether it is fixed,
 * and its template visibility.
 *
 * @template L The level of its content.
 */
export interface SimpleChoice<L extends Level = ModelLevel> extends ReferencingChoice {
  readonly content: Nodes<L>;
  /**
   * `fixed`, an `xs:boolean`, false when absent: a fixed choice keeps its document position when
   * its interaction is shuffled.
   */
  readonly fixed: boolean;
  /**
   * The choice's `template-identifier` and `show-hide`, none when it has no `template-identifier`:
   * a choice with none is always shown.
   */
  readonly templateVisibility: Option.Option<TemplateVisibility>;
}

/**
 * A `qti-printed-variable` (the information model's PrintedVariable): the place in the body where
 * the value of an outcome or a template variable is written as text, with the attributes that say
 * how. The database has judged what it names ("Printed variable reference") and its `format`.
 *
 * The model holds it whatever the variable's value, which comes from an attempt's record, so
 * `redactItem` in `#plate/redact/walk.ts` decides what the page sees in its place. Its `format`,
 * `field`, `delimiter` and `mapping-indicator` are `xs:normalizedString`s, held as XSD reads them:
 * each tab and line break a space, nothing trimmed.
 */
export interface PrintedVariable {
  /**
   * `base`, 10 when absent: the number base the `i` conversion writes an integer in, as a literal
   * or as the name of the single integer outcome or template variable that holds it (the XSD's
   * union of `xs:integer` and a variable's name).
   */
  readonly base: IntegerOrRef;
  /**
   * `delimiter`, `;` when absent: what separates the values of a container.
   */
  readonly delimiter: string;
  /**
   * `field`, none when absent: the field of a record value to write.
   */
  readonly field: Option.Option<string>;
  /**
   * `format`, none when absent: one printf conversion, which the database has judged; with none,
   * the value is written in its default form.
   */
  readonly format: Option.Option<string>;
  /**
   * `identifier`: the outcome or template variable whose value is written.
   */
  readonly identifier: string;
  /**
   * `index`, none when absent: which value of a container to write, counted from 1, as a literal or
   * as the name of the single integer outcome or template variable that holds it.
   */
  readonly index: Option.Option<IntegerOrRef>;
  readonly kind: "printed-variable";
  /**
   * `mapping-indicator`, `=` when absent: what separates a record field's name from its value.
   */
  readonly mappingIndicator: string;
  readonly path: string;
  /**
   * `power-form`, an `xs:boolean`, false when absent: whether a float written with no `format`
   * shows its exponent as a power of ten.
   */
  readonly powerForm: boolean;
}

/**
 * A `qti-template-block` (`kind` `template-block`) or a `qti-template-inline` (`template-inline`),
 * the information model's TemplateBlock and TemplateInline (sections 5.145 and 5.155): content
 * shown or hidden by a template value, as a choice with a template visibility is.
 *
 * The model holds it whatever the variable's value, which comes from an attempt's record, so
 * `redactItem` in `#plate/redact/walk.ts` decides what the page sees in its place: its content
 * where the value shows it, nothing where it hides it. A redacted body holds none
 * ({@link RedactedLevel}).
 */
export interface TemplateContent {
  /**
   * The content, read as any body content is.
   */
  readonly content: readonly BodyNode[];
  /**
   * `identifier`: the identifier the template variable's value is matched against.
   */
  readonly identifier: string;
  readonly kind: "template-block" | "template-inline";
  readonly path: string;
  /**
   * The responses its content binds: the `response-identifier` of every QTI element in its source
   * content that carries one (every interaction does), each read as `identifierOf` reads it,
   * whether the element is read as an interaction or replaced by a notice, nested template content
   * included, each once, in document order. A notice drops its subtree, so `content` alone cannot
   * tell which responses an unsupported interaction binds; this tells what hiding the content
   * withholds, a notice's interaction included.
   */
  readonly responses: readonly string[];
  /**
   * Its `template-identifier` and `show-hide`.
   */
  readonly templateVisibility: TemplateVisibility;
}

/**
 * How an outcome variable controls the visibility of a feedback element: its `outcome-identifier`
 * and its `show-hide` (the information model's FeedbackBlock, section 5.49, FeedbackInline, 5.52,
 * ModalFeedback, 5.93, and TemplateBlockFeedbackBlock, 5.148).
 */
export interface FeedbackVisibility {
  /**
   * `outcome-identifier`: the outcome variable, of base type identifier and single or multiple
   * cardinality, whose value response processing sets to show or hide the element (5.49.1).
   */
  readonly outcomeIdentifier: string;
  /**
   * `show-hide`: `show` hides the element unless the outcome variable matches, or contains, the
   * element's identifier; `hide` shows it unless the variable does (5.49.3). A block's or an
   * inline's is `show` when absent; a modal feedback's is required.
   */
  readonly showHide: "hide" | "show";
}

/**
 * A `qti-feedback-block` (`kind` `feedback-block`) or a `qti-feedback-inline` (`feedback-inline`):
 * integrated feedback, content in the item body shown or hidden by an outcome value (sections 5.49
 * and 5.52), as template content is by a template value.
 *
 * The model holds it whatever the outcome's value, which comes from an attempt's record, so
 * `redactItem` in `#plate/redact/walk.ts` decides what the page sees in its place: its content
 * where the value shows it, nothing where it hides it. A redacted body holds none
 * ({@link RedactedLevel}).
 */
export interface FeedbackContent {
  /**
   * The content, read as any body content is: a block's `qti-content-body`'s, an inline's own.
   */
  readonly content: readonly BodyNode[];
  /**
   * `feedbackVisibility`: its `outcome-identifier` and `show-hide`.
   */
  readonly feedbackVisibility: FeedbackVisibility;
  /**
   * `identifier`: the identifier the outcome's value is matched against.
   */
  readonly identifier: string;
  readonly kind: "feedback-block" | "feedback-inline";
  readonly path: string;
  /**
   * The responses its content binds, as {@link TemplateContent.responses} lists a template
   * block's: an interaction in hidden feedback "must also be hidden. The candidate must not be
   * able to set or update the value of the associated response variables" (5.49).
   */
  readonly responses: readonly string[];
}

/**
 * A `qti-modal-feedback` (the information model's ModalFeedback, section 5.93): feedback the item
 * holds outside its body, "shown to the candidate directly following response processing" when its
 * outcome's value shows it. Its content holds no interaction (5.93).
 */
export interface ModalFeedback {
  /**
   * The content of its `qti-content-body`, read as any body content is.
   */
  readonly content: readonly BodyNode[];
  readonly feedbackVisibility: FeedbackVisibility;
  readonly identifier: string;
  readonly path: string;
  /**
   * `title`, an `xs:normalizedString`, none when absent, which "Delivery engines are not required
   * to present ... but may do so, for example as the title of a modal pop-up window" (5.93.4).
   */
  readonly title: Option.Option<string>;
}

/**
 * A body part plate does not render, shown as a notice in its place; its subtree is dropped.
 */
export interface Unsupported {
  /**
   * The feature's key, as {@link UnsupportedFeature.feature} names it.
   */
  readonly feature: string;
  readonly kind: "unsupported";
  readonly path: string;
}

/**
 * An element an interaction module owns as the container of its interactions, such as the
 * `qti-position-object-stage` Position Objects stand inside (`ModuleContainer` in
 * `#plate/interactions/contract.ts`): the module that owns it, and its children as the body walk
 * read them, the interactions inside it among them. It is no interaction and binds no response;
 * the walks that find a body's interactions enter it as they enter an element.
 *
 * @template K The kind of the module that owns the container.
 * @template L The level of its children.
 */
export interface ContainerNode<K extends ModuleKind = ModuleKind, L extends Level = ModelLevel> {
  readonly children: Nodes<L>;
  readonly kind: "container";
  /**
   * The kind of the module whose container `parse` gave the node.
   */
  readonly module: K;
  readonly path: string;
}

/**
 * An interaction of the item model: every kind plate reads, each node as its module declares it
 * (`ModuleModel` in `#plate/model/interactions.ts`, read from the table of modules), so this union
 * names no kind's fields and a module that lands changes it through its own file.
 *
 * @template L The level of its content.
 */
export type Interaction<L extends Level = ModelLevel> = ModuleModel<L>;

/**
 * A level of the item body: the body nodes content holds at every depth. The item model reads its
 * body at {@link ModelLevel}, and the redaction gives the page a body at {@link RedactedLevel},
 * which holds none of the nodes it settles. Every type that holds content takes its level,
 * {@link ModelLevel} by default; `#plate/interactions/contract.ts` explains how a module's node
 * does.
 */
export interface Level {
  readonly node: unknown;
}

/**
 * A node of the body at both levels: an element, a text, an interaction, a notice, the node of a
 * body-placed content element (`ContentNode` in `#plate/content/modules.ts`, one member per content
 * module, each as its module declares it), or the container an interaction module owns
 * ({@link ContainerNode}), each with its content at the level.
 *
 * @template L The level of its content.
 */
export type SettledNode<L extends Level> =
  | BodyElement<L>
  | BodyText
  | ContainerNode<ContainerKind, L>
  | ContentNode<L>
  | Interaction<L>
  | Unsupported;

/**
 * The item model's level: every node the body walk reads, the printed variables, the template
 * blocks and inlines and the feedback blocks and inlines among them, which the model holds
 * whatever an attempt's values.
 */
export interface ModelLevel {
  readonly node: SettledNode<ModelLevel> | PrintedVariable | TemplateContent | FeedbackContent;
}

/**
 * The redacted body's level: what `redactItem` (`#plate/redact/walk.ts`) gives the page, which
 * holds no printed variable, template block or inline, or feedback block or inline at any depth,
 * since the redaction settles each into its text, its content, nothing or its notice.
 */
export interface RedactedLevel {
  readonly node: SettledNode<RedactedLevel>;
}

/**
 * A node of the item body at a level: any node the item model reads at {@link ModelLevel}, the
 * default, and a {@link SettledNode} at {@link RedactedLevel}.
 *
 * @template L The level.
 */
export type BodyNode<L extends Level = ModelLevel> = L["node"];

/**
 * A node of a redacted body.
 */
export type RedactedNode = BodyNode<RedactedLevel>;

/**
 * Body content at a level, in document order: an element's children, a Prompt, a choice's content.
 *
 * @template L The level.
 */
export type Nodes<L extends Level = ModelLevel> = readonly BodyNode<L>[];

/**
 * A `qti-response-declaration` of cardinality `record` the item model holds: its identifier, and
 * the record its `qti-correct-response` and its `qti-default-value` write, each none when the
 * declaration has none.
 */
export interface RecordDeclaration {
  readonly correct: Option.Option<RecordValue>;
  readonly defaultValue: Option.Option<RecordValue>;
  readonly identifier: string;
}

/**
 * The identifier, and the base type and cardinality as written, of an {@link UnheldDeclaration}.
 */
interface UnheldType {
  readonly baseType: Option.Option<BaseType>;
  readonly cardinality: Cardinality;
  readonly identifier: string;
}

/**
 * An outcome or template declaration of a type the value model holds no value of, cardinality
 * `record`: the model holds every response, a record response in {@link Item.records} and one of
 * any base type, `file` included, in {@link Item.responses}, and a declaration of any other type in
 * its own map. A record's `base-type` is optional, so it is none when the declaration writes none.
 * `kind` names the declaration.
 */
export type UnheldDeclaration = UnheldType & { readonly kind: "outcome" | "template" };

/**
 * A valid `qti-assessment-item` as plate models it.
 *
 * `responses`, `outcomes` and `templates` hold the declarations of modelled base types and
 * cardinalities, in document order, and `records` the record response declarations; every other
 * declaration is a mark, and `unheld` holds those by identifier ({@link UnheldDeclaration}). Plate
 * reads no response or template processing: the QTI database runs both from the stored document, so
 * the model holds only whether the item has template processing ({@link Item.templated}).
 * `unsupported` lists every feature not rendered, in
 * document order, each once per feature and path. `content` holds the nodes the item-placed content
 * modules read, by element.
 */
export interface Item {
  /**
   * Whether the root's `adaptive` is true: an item whose outcomes the QTI database keeps across
   * attempts and whose item session closes at completion. False when the attribute is absent, the
   * XSD default.
   */
  readonly adaptive: boolean;
  readonly body: readonly BodyNode[];
  /**
   * The nodes the item-placed content modules read from the root's children, by element, each
   * element's in document order ({@link ItemContent}); an element's list is empty where they read
   * none of it.
   */
  readonly content: ItemNodesHeld;
  /**
   * The context declarations of a modelled type, keyed by identifier, which the QTI database's
   * processing reads and the page never shows. A context declaration of base type `file` or
   * cardinality `record` is not here, and stays marked `qti-context-declaration`.
   */
  readonly contexts: ReadonlyMap<string, ContextDeclaration>;
  /**
   * The document's location as the host named it.
   */
  readonly document: string;
  readonly identifier: string;
  /**
   * The root's `xml:lang`.
   */
  readonly lang: Option.Option<string>;
  /**
   * The `qti-modal-feedback` elements, in document order.
   */
  readonly modalFeedback: readonly ModalFeedback[];
  readonly outcomes: ReadonlyMap<string, OutcomeDeclaration>;
  /**
   * The response declarations of cardinality `record` the item holds a value of, keyed by
   * identifier.
   */
  readonly records: ReadonlyMap<string, RecordDeclaration>;
  readonly responses: ReadonlyMap<string, ResponseDeclaration>;
  /**
   * Whether the item has a `qti-template-processing`, which the QTI database runs at the take: its
   * template values, correct responses and defaults are the item session's, so a page renders them
   * only from the record the database returns, never from the declarations alone.
   */
  readonly templated: boolean;
  /**
   * The item's template variables, keyed by identifier.
   */
  readonly templates: ReadonlyMap<string, TemplateDeclaration>;
  /**
   * The root's `title`, an `xs:normalizedString`, read as XSD reads one: each tab, line feed and
   * carriage return a space, as a character reference such as `&#10;` writes them.
   */
  readonly title: string;
  /**
   * The declarations the model holds no value of, keyed by identifier: the outcome and template
   * declarations of cardinality `record`. A test's processing reads each through an item ref as
   * NULL of its declared type.
   */
  readonly unheld: ReadonlyMap<string, UnheldDeclaration>;
  readonly unsupported: readonly UnsupportedFeature[];
}

/**
 * Begin a fresh build of a document: nothing read yet, its declarations, its names and every
 * element's path indexed.
 *
 * @param source The document.
 * @param options What the build reads.
 * @param options.stimulus Whether it reads a stimulus document ({@link Build.stimulus}).
 * @returns The build.
 */
const freshBuild = (
  source: SourceDocument,
  { stimulus }: { readonly stimulus: boolean },
): Build => ({
  declarations: declarationsOf(source),
  document: source,
  paths: pathsOf(source),
  recorded: new Map(),
  records: new Map(),
  stimulus,
  unsupported: [],
});

/**
 * A `qti-assessment-stimulus` as plate delivers it with each item that references it: "An
 * assessment stimulus object is the used to enable content to be shared by several Assessment
 * Items. The key feature is that this shared stimulus content must be supplied in the same context
 * for each of the Assessment Items that make use of it" (information model §4.3). So it is read
 * once, whole and alone, from its own document, never from an item: its body, its catalog and its
 * own location, which its URLs resolve against.
 */
export interface Stimulus {
  /**
   * The children of the document's one `qti-stimulus-body`, read as the item body is read, each
   * interaction among them the notice keyed by its element, since a stimulus declares no response
   * ({@link Build.stimulus}).
   */
  readonly body: readonly BodyNode[];
  /**
   * The stimulus's `qti-catalog-info`, read by the catalog module as an item's is: "The alternative
   * accessibility information that is to be associated with the content in the stimulus body"
   * (§4.3.10), whose catalogs only the stimulus body's `data-catalog-idref` names. The XSD places
   * no other item-placed element in a stimulus.
   */
  readonly content: Pick<ItemNodesHeld, "qti-catalog-info">;
  /**
   * The document's location as the host named it, its path from the package root, which a URL of
   * the stimulus resolves against.
   */
  readonly document: string;
  /**
   * The root's `identifier`, its outer XML whitespace removed.
   */
  readonly identifier: string;
  /**
   * The root's `xml:lang`, "The default language for the Stimulus" (§4.3.4), as written; none
   * when the root carries none.
   */
  readonly lang: Option.Option<string>;
  /**
   * The root's `title`, each tab and line break a space as an `xs:normalizedString` reads.
   */
  readonly title: string;
  /**
   * The marks and notices the walk recorded, in document order: the body's own marks, each `qti-*`
   * element the walk does not read, a `qti-stylesheet` among them, and each interaction as a
   * notice.
   */
  readonly unsupported: readonly UnsupportedFeature[];
}

/**
 * Build the model of a valid `qti-assessment-stimulus`, over a fresh build of the document that
 * reads it as {@link buildItem} reads an item: its `qti-stimulus-body`'s children through the body
 * walk, an interaction there the notice keyed by its element ({@link Build.stimulus}); and each
 * other child of the root by its item-placed content module, a `qti-catalog-info`'s catalogs among
 * them, or as the mark keyed by its name, a `qti-stylesheet`'s. The root's own mark, that
 * plate delivers no stimulus alone, is the verdict's (`#plate/validate/verdict.ts`).
 *
 * @param source A stimulus document the database admitted, secured as an item is.
 * @returns The stimulus.
 */
export const buildStimulus = (source: AdmittedDocument): Stimulus => {
  const build = freshBuild(source, { stimulus: true });
  const { root } = source;
  markElement(build, root, false);

  const identifier = identifierAttribute(build, root, "identifier");
  const title = replaceXmlSpace(requiredValue(build, root, "title"));
  const body: BodyNode[] = [];
  const content: ItemContentBuild = {
    "qti-assessment-stimulus-ref": [],
    "qti-catalog-info": [],
    "qti-companion-materials-info": [],
  };

  for (const part of elementsOf(root).filter((child) => isQti(child))) {
    if (part.local === "qti-stimulus-body") {
      markElement(build, part, true);
      body.push(...bodyNodes(build, part));
    } else {
      markElement(build, part, false);
      collectItemPart(content, itemPart(build, part));
    }
  }

  return {
    body,
    content: { "qti-catalog-info": content["qti-catalog-info"] },
    document: source.location,
    identifier,
    lang: valueOf(root, "xml:lang"),
    title,
    unsupported: build.unsupported,
  };
};

/**
 * Build the item model of a valid `qti-assessment-item`.
 *
 * The body keeps text and HTML elements as written. Each interaction becomes its model, or its
 * notice, by its module's `parse` (the table of modules in `#plate/model/interactions.ts`), which
 * binds it to its response by the binding its kind renders with; a `qti-printed-variable` becomes
 * its model, and a `qti-template-block` or `qti-template-inline` its model with its content; any
 * other `qti-*` element in the body becomes a notice, its subtree dropped. Each `modelled` mark
 * adds an unsupported feature, and so does each `qti-*` element outside the body that the model
 * does not read; the root's `adaptive` is read into `adaptive`, unmarked, since the QTI database
 * delivers an adaptive item. `qti-response-processing` and `qti-template-processing` are read into
 * nothing and marked nothing: the database runs both from the stored document, and the model holds
 * only whether template processing is there ({@link Item.templated}). A response declaration of
 * cardinality `record` is held in `records`, with no mark, whatever interaction binds it: its
 * `qti-correct-response` and `qti-default-value` are read field by field ({@link recordResponse}),
 * and a Text Entry or an Extended Text bound to one is the string control of cardinality `record`.
 * A declaration of base type `file` is held as one of any other base type, its value a file's name,
 * size and type and never its bytes; Upload and Drawing, which bind one, are notices, as any
 * `qti-*` element the body walk does not read is. An outcome or template declaration of cardinality
 * `record` is held in `unheld`, beside its mark. `records` and `unheld` are each absent when empty.
 * Template declarations of modelled types are read into `templates`. Nothing is refused.
 *
 * @param source A document the database admitted.
 * @returns The item.
 */
export const buildItem = (source: AdmittedDocument): Item => {
  const build = freshBuild(source, { stimulus: false });
  const { records } = build;
  const { root } = source;
  markElement(build, root, false);

  const identifier = identifierAttribute(build, root, "identifier");
  const title = replaceXmlSpace(requiredValue(build, root, "title"));
  const responses = new Map<string, ResponseDeclaration>();
  const outcomes = new Map<string, OutcomeDeclaration>();
  const templateDeclarations = new Map<string, TemplateDeclaration>();
  const contexts = new Map<string, ContextDeclaration>();
  const unheld = new Map<string, UnheldDeclaration>();
  const holdUnheld = (declaration: SourceElement, kind: UnheldDeclaration["kind"]): void => {
    const read = unheldDeclaration(build, declaration, kind);
    if (Option.isSome(read)) {
      unheld.set(read.value.identifier, read.value);
    }
  };
  const body: BodyNode[] = [];
  const modalFeedback: ModalFeedback[] = [];
  const content: ItemContentBuild = {
    "qti-assessment-stimulus-ref": [],
    "qti-catalog-info": [],
    "qti-companion-materials-info": [],
  };
  // A context declaration the model does not hold, of base type `file` or cardinality `record`,
  // is an item part and keeps its `qti-context-declaration` mark.
  const readOtherPart = (part: SourceElement): void => {
    const read =
      part.local === "qti-context-declaration"
        ? contextDeclaration(build, part)
        : Option.none<ContextDeclaration>();
    if (Option.isSome(read)) {
      markUnreadWithin(build, part);
      contexts.set(read.value.identifier, read.value);
    } else {
      collectItemPart(content, itemPart(build, part));
    }
  };

  for (const part of elementsOf(root).filter((child) => isQti(child))) {
    if (part.local === "qti-item-body") {
      markElement(build, part, true);
      for (const node of bodyNodes(build, part)) {
        body.push(node);
      }
    } else if (
      part.local === "qti-response-processing" ||
      part.local === "qti-template-processing"
    ) {
      // The QTI database runs both from the stored document; the page renders neither.
      markElement(build, part, false);
    } else if (part.local === "qti-response-declaration") {
      markElement(build, part, false);

      const recordRead = recordResponse(build, part);
      markUnreadWithin(build, part);

      const read = responseDeclaration(build, part);
      if (Option.isSome(read)) {
        responses.set(read.value.identifier, read.value);
      }

      if (recordRead.kind === "held") {
        records.set(recordRead.declaration.identifier, recordRead.declaration);
      }
    } else if (part.local === "qti-outcome-declaration") {
      markElement(build, part, false);
      markUnreadWithin(build, part);

      const read = outcomeDeclaration(build, part);
      if (Option.isSome(read)) {
        outcomes.set(read.value.identifier, read.value);
      }

      holdUnheld(part, "outcome");
    } else if (part.local === "qti-template-declaration") {
      markElement(build, part, false);
      markUnreadWithin(build, part);

      const read = templateDeclaration(build, part);
      if (Option.isSome(read)) {
        templateDeclarations.set(read.value.identifier, read.value);
      }

      holdUnheld(part, "template");
    } else if (part.local === "qti-modal-feedback") {
      modalFeedback.push(modalFeedbackOf(build, part));
    } else {
      markElement(build, part, false);
      readOtherPart(part);
    }
  }

  return {
    adaptive: adaptiveOf(root),
    body,
    content,
    contexts,
    document: source.location,
    identifier,
    lang: valueOf(root, "xml:lang"),
    modalFeedback,
    outcomes,
    records,
    responses,
    templated: childrenNamed(root, "qti-template-processing").length > 0,
    templates: templateDeclarations,
    title,
    unheld,
    unsupported: build.unsupported,
  } satisfies Item;
};
