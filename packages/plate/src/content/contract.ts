/**
 * The content-module contract: what one QTI content element gives the walks that read it, so an
 * element's facts live in its own module and each walk delegates to it, as an interaction's do
 * through `InteractionModule` in `#plate/interactions/contract.ts`.
 *
 * A content element is one plate reads beside the interactions. A rubric block and MathML sit in
 * the item body, and the body walk dispatches each to its module's `parse` (`contentNode` in
 * `#plate/model/body.ts`). A catalog and the companion materials sit directly under the item root,
 * and the item root's walk dispatches each to its module's `parse` (`itemPart` there); the item
 * holds each node an item-placed module reads by its element (`ItemNodesHeld` in
 * `#plate/content/modules.ts`).
 *
 * A module owns its element from the source to the payload, and the hubs carry its nodes through
 * `#plate/content/modules.ts` without naming its fields. Its `parse` reads the element into its
 * model node; a body-placed one's sits in the body as a {@link ContentNodeOf}, an item-placed
 * one's in the item's `content` by its element. `redact` decides what the redacted item keeps of
 * the node under the supports the host enabled, the view the item is shown to and the attempt's
 * record ({@link ContentRedactKit}); `copy` gives the payload node `P` the server shell renders
 * the kept node by; and `content` gives the body content `P` holds, which the server shell writes
 * as it writes the body. A module's node holds its content at a level, and the module names it by
 * a `ByLevel`, as an interaction module does (`#plate/interactions/contract.ts` explains both):
 * `parse` gives it at the item model's level, and `redact` gives it at the redacted body's.
 *
 * @module
 */
import type { Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import type { ByLevel, NodeAt, ParseContext, ReaderKit } from "#plate/interactions/contract.ts";
import type { BodyNode, Level, ModelLevel, Nodes, RedactedLevel } from "#plate/model/item.ts";
import type { RedactRecord } from "#plate/model/record.ts";
import type { Supports } from "#plate/supports.ts";
import type { OutcomeView } from "#plate/vocabulary.ts";

/**
 * The view an item is shown to when the host names none: the candidate's, which sees no rubric
 * another view alone names.
 */
export const defaultView: OutcomeView = "candidate";

/**
 * What the item root's walk hands an item-placed module's `parse`: the way to record its element as
 * a mark on the verdict only, as that walk records every `qti-*` element it does not read, since an
 * element outside the body has no place a notice could take, and the kit it reads the element with.
 */
export interface ItemParseContext {
  /**
   * Record the feature as a mark at the element's path.
   *
   * @param feature The feature's key, as the verdict names it.
   * @returns None, as the model then holds no node of the element.
   */
  readonly mark: (feature: string) => Option.Option<never>;
  /**
   * The element path of the element being parsed.
   */
  readonly path: string;
  /**
   * The kit the element and its content are read with: the attribute readers, and the body walk
   * for the element's content, as a body-placed module's `parse` reads them through
   * `ParseContext.read`.
   */
  readonly read: ReaderKit;
}

/**
 * What the redaction hands a module's `redact`: the walk over body nodes the redaction makes of
 * every content it keeps, which prints the printed variables, settles the template content and
 * reaches the notices of the nodes it is handed, and the facts of this render the module decides
 * by: the supports the host enabled, the view the item is shown to and the attempt's record. A
 * module keeps, prunes or drops its node by them, so a scorer's rubric or a dormant catalog card
 * never reaches the page.
 */
export interface ContentRedactKit {
  /**
   * The text a template variable declared `math-variable="true"` writes in place of a MathML `mi`
   * or `ci` that names it, as the content of the `mn` or `cn` that takes its place (information
   * model section 2.3.3): some text when the values hold the variable, written as a printed
   * variable with no `format` writes it and spent from the redaction's output budget, empty for
   * NULL; none for a name that is no such variable, when there are no values or they hold none of
   * it, for content the page does not see, and under a walk that writes no text, so the element
   * stays as written.
   *
   * @param name The token's content, its outer whitespace gone.
   * @returns The text, or none.
   */
  readonly mathText: (name: string) => Option.Option<string>;
  /**
   * Walk body nodes the page sees, as the redaction walks the body: their printed variables
   * printed, their template content settled, their notices reached as shown.
   *
   * @param nodes The body nodes the node holds.
   * @returns The nodes the page is given in their place.
   */
  readonly nodes: (nodes: readonly BodyNode[]) => Nodes<RedactedLevel>;
  /**
   * The attempt's template values and outcome values, as the redaction prints by them; none when
   * the item is shown with no record, or its template processing does not run.
   */
  readonly record: Option.Option<RedactRecord>;
  /**
   * The supports the host enabled, `noSupports` when it named none.
   */
  readonly supports: Supports;
  /**
   * The view the item is shown to, {@link defaultView} when the host named none.
   */
  readonly view: OutcomeView;
  /**
   * Walk body nodes the page does not see, so the redaction still reaches their notices and binds
   * their responses as content the page is not given, and gives nothing. A module that drops or
   * prunes its node hands the content it withholds here.
   *
   * @param nodes The body nodes withheld.
   */
  readonly withhold: (nodes: readonly BodyNode[]) => void;
}

/**
 * What the redaction hands an item-placed module's `redact`, which runs once the body is redacted:
 * the kit a body-placed module's `redact` is handed, and the catalogs the body the page is given
 * references.
 */
export interface ItemRedactKit extends ContentRedactKit {
  /**
   * The `data-catalog-idref` of every part of the redacted body that carries one, as written: an
   * element's, an interaction's root's and its prompt's, and each choice's (plate's reading 236).
   * It is read from the body the redaction gives the page, once it is redacted, so content the page
   * does not see, a feedback or template block or inline the values hide, a choice they hide or a
   * rubric block of another view, names no catalog, and neither does a card's own content, which is
   * no part of the body.
   */
  readonly catalogReferences: readonly string[];
}

/**
 * The members every content module has, whether it sits in the item body or under the item root.
 *
 * @template E The element's local name.
 * @template N The element's model node.
 * @template R The node the redaction keeps of it.
 * @template P The element's payload node.
 * @template K The kit its `redact` is handed: {@link ContentRedactKit} in the body, which the
 *   redaction walks, and {@link ItemRedactKit} under the item root, redacted after the body.
 */
interface ContentModuleBase<E extends string, N, R, P, K extends ContentRedactKit> {
  /**
   * The body nodes the payload node holds as body content, in document order: what the server
   * shell writes as it writes the body, so its asset check and its heading shift read them as they
   * read a Prompt's: none for a module whose node holds none.
   */
  readonly content: (node: P) => Nodes<RedactedLevel>;
  /**
   * Give the payload node the server shell renders a node the redaction kept by: what the page
   * may know of it, as its view writes it.
   */
  readonly copy: (node: R) => P;
  /**
   * The element's local name, which the walk dispatches on with the module's `namespace`.
   */
  readonly element: E;
  /**
   * The element's namespace: QTI's, or MathML's for `math`.
   */
  readonly namespace: string;
  /**
   * Rewrite the element into the form `parse` reads, before it is read, such as MathML's
   * deprecated `mfenced` into the elements it stands for, or the element itself for one read as
   * written. The walks call it on each element they dispatch to the module, and hand `parse` what
   * it gives.
   */
  readonly normalise: (element: SourceElement) => SourceElement;
  /**
   * Decide what the redacted item keeps of the model node, by the kit's supports, view and record:
   * the node, pruned of what the page may not see, its content walked through the kit; or none to
   * drop it, the content it held withheld through the kit.
   */
  readonly redact: (node: N, kit: K) => Option.Option<R>;
}

/**
 * The module of an element in the item body, which the body walk reads: its model node is one
 * node type at each level, since the redaction keeps it with its content walked.
 *
 * @template E The element's local name.
 * @template F The element's model node at each level.
 * @template P The element's payload node.
 */
export interface BodyContentModule<
  E extends string,
  F extends ByLevel,
  P,
> extends ContentModuleBase<E, NodeAt<F>, NodeAt<F, RedactedLevel>, P, ContentRedactKit> {
  /**
   * Read the element into its model node.
   */
  readonly parse: (element: SourceElement, context: ParseContext) => NodeAt<F>;
  readonly placement: "body";
}

/**
 * The module of an element directly under the item root, which the item root's walk reads: its
 * model node as read, and the node the redaction keeps, each its own type, so a module whose
 * redaction resolves the node into another shape (Catalog Resources' active cards) declares that
 * shape.
 *
 * @template E The element's local name.
 * @template N The element's model node.
 * @template R The node the redaction keeps of it.
 * @template P The element's payload node.
 */
export interface ItemContentModule<E extends string, N, R, P> extends ContentModuleBase<
  E,
  N,
  R,
  P,
  ItemRedactKit
> {
  /**
   * Read the element into its model node, or none once it has recorded the element's mark.
   */
  readonly parse: (element: SourceElement, context: ItemParseContext) => Option.Option<N>;
  readonly placement: "item";
}

/**
 * A body-placed module's model node at each level.
 *
 * @template M The module.
 */
export type ContentByLevel<M> =
  M extends BodyContentModule<infer _E, infer F, infer _P> ? F : never;

/**
 * An item-placed module's model node.
 *
 * @template M The module.
 */
export type ItemNodeOf<M> =
  M extends ItemContentModule<infer _E, infer N, infer _R, infer _P> ? N : never;

/**
 * The node an item-placed module's redaction keeps.
 *
 * @template M The module.
 */
export type KeptNodeOf<M> =
  M extends ItemContentModule<infer _E, infer _N, infer R, infer _P> ? R : never;

/**
 * A body-placed module's model node at a level.
 *
 * @template M The module.
 * @template L The level, the item model's by default.
 */
export type NodeOf<M, L extends Level = ModelLevel> = NodeAt<ContentByLevel<M>, L>;

/**
 * The payload node a module's `copy` gives.
 *
 * @template M The module.
 */
export type CopyOf<M> = M extends { readonly copy: (node: never) => infer P } ? P : never;

/**
 * The node of a body-placed content element in the item body: the module's element, which the
 * hubs dispatch on, the node its `parse` read, and the element's path.
 *
 * @template E The module's element.
 * @template N The module's model node.
 */
export interface ContentNodeOf<E extends string, N> {
  readonly element: E;
  readonly kind: "content";
  readonly node: N;
  readonly path: string;
}

/**
 * The payload node of a body-placed content element: the module's element and the node its `copy`
 * gave.
 *
 * @template E The module's element.
 * @template P The module's payload node.
 */
export interface ContentPayloadOf<E extends string, P> {
  readonly element: E;
  readonly kind: "content";
  readonly payload: P;
}
