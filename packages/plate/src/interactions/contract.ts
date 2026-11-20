/**
 * The interaction-module contract: what one interaction kind gives every hub that dispatches on
 * `Interaction["kind"]`, so a kind's facts live in its own module and each hub delegates to it.
 *
 * Every interaction kind plate reads is a module beside this file, one file per kind, Choice,
 * Extended Text, Inline Choice and Text Entry among them. A module owns its kind's model node: it
 * declares the node's type over the fields every module's node shares ({@link ModuleInteraction}),
 * and the item model's `Interaction` union and the hubs' `ModelOf<K>`
 * (`#plate/model/interactions.ts`) read that type from the table of modules, so no hub and no
 * shared file names a kind's fields.
 *
 * Its `parse` reads the element through the kit the body walk hands it ({@link ReaderKit}): the
 * attribute readers, the body walk for the element's content (its Prompt, its choices' content)
 * with the module's own elements, such as a `qti-gap`, let through as elements where the walk
 * writes a notice for any other `qti-*` element, the marks it records, and the declaration its
 * `response-identifier` names. Its `redact` gives the payload node the server shell renders the
 * interaction with, from the view's facts the payload hands it ({@link RedactKit}); its `regions`
 * give the content it holds, which every walk of the body enters it through; and its `validate`
 * judges a response the caller decoded. Its optional members (`absentValue`, `countsAttempt`,
 * `shown`) are set by the kinds whose rule differs from the general one.
 *
 * An element no module declares, `qti-drawing-interaction` and `qti-upload-interaction` among them,
 * is the notice the body walk gives any `qti-*` element it does not read. The modules form no
 * registry a host can reach: the body walk finds each element's module in the one table of modules
 * (`modules` in `#plate/model/interactions.ts`), and every hub delegates an interaction through
 * that file, its `moduleSteps` for a model node, its `modulePayload` for a redacted one, and its
 * `regionsOf`, `mapRegions` and `redactRegions` for the content a node holds. A module whose
 * interactions stand inside an element of their own, as Position Objects stand inside a
 * `qti-position-object-stage`, gives that element's {@link ModuleContainer}, which the table of
 * containers (`containers` in `#plate/model/interactions.ts`, a record over {@link ContainerKind})
 * holds: the body walk hands the element to it with the interactions inside it already parsed.
 *
 * A node holds its content at a level (`Level` in `#plate/model/item.ts`): the item model's body
 * at `ModelLevel`, every node the body walk reads, and the redacted body at `RedactedLevel`, which
 * holds no printed variable, template content or feedback content at any depth. So a module
 * declares its node generic in the level, each content field a `Nodes<L>`, and names it to this
 * contract as a {@link ByLevel}, which {@link NodeAt} applies to a level:
 *
 * ```ts
 * interface ChoiceInteraction<
 *   L extends Level = ModelLevel,
 * > extends ModuleInteraction<"choice"> {
 *   readonly choices: readonly SimpleChoice<L>[];
 *   readonly prompt: Option.Option<Nodes<L>>;
 * }
 * interface ChoiceByLevel extends ByLevel {
 *   readonly node: ChoiceInteraction<this["level"]>;
 * }
 * // NodeAt<ChoiceByLevel, RedactedLevel> is ChoiceInteraction<RedactedLevel>.
 * const hollow = (interaction: ChoiceInteraction): ChoiceInteraction<RedactedLevel> => ({
 *   ...interaction,
 *   choices: interaction.choices.map((choice) => ({ ...choice, content: [] })),
 *   prompt: interaction.prompt.pipe(Option.map(() => [])),
 * });
 * ```
 *
 * `parse` gives the node at `ModelLevel`, `redact` reads it at `RedactedLevel`, and `regions`
 * reads it at either level. `hollow` gives the model's node with every content field emptied, at
 * `RedactedLevel`, and keeps every other field, so the node's regions are the same at both:
 * `redactRegions` (`#plate/model/interactions.ts`) takes a model node to the redacted body's level
 * by putting each region's redacted content back into the hollow node. Its type is the check that
 * it empties every field: a field it keeps holds the model's content, which does not compile as
 * the redacted body's, as `prompt` would not above. The members that only read the node
 * (`absentValue`, `countsAttempt`, `shown`, `validate`) take it at `ModelLevel`, and a
 * node at `RedactedLevel` is one, since a redacted body's nodes are model nodes.
 *
 * @module
 */
import { Data, Option } from "effect";

import type { Configuration } from "#plate/configuration.ts";
import type { SourceChild, SourceElement } from "#plate/document/source.ts";
import type { Malformed } from "#plate/form/encoding.ts";
import type {
  BodyAttribute,
  BodyNode,
  ContainerNode,
  Level,
  ModelLevel,
  RedactedLevel,
  TemplateVisibility,
  Unsupported,
} from "#plate/model/item.ts";
import type { AttributeReaders } from "#plate/model/reader.ts";
import type { ResponseValue, Single, Value } from "#plate/model/values.ts";
import type { HostFacts } from "#plate/pci/host.ts";
import type { BaseType, Cardinality } from "#plate/vocabulary.ts";

/**
 * A message response validation gives one response, in the locale's text or the author's: what a
 * module's `validate` gives and `checkResponses` (`#plate/responses.ts`) collects.
 */
export interface ValidationMessage {
  /**
   * The identifier of the response it concerns.
   */
  readonly response: string;
  readonly text: string;
}

/**
 * The module kinds, each once: the one place that names them. The table of modules in
 * `#plate/model/interactions.ts` is a record over {@link ModuleKind}, so a kind added here or taken
 * from here changes that table or fails to compile.
 */
const moduleKinds = {
  associate: true,
  choice: true,
  "end-attempt": true,
  "extended-text": true,
  "gap-match": true,
  "graphic-associate": true,
  "graphic-gap-match": true,
  "graphic-order": true,
  hotspot: true,
  hottext: true,
  "inline-choice": true,
  match: true,
  media: true,
  order: true,
  "portable-custom": true,
  "position-object": true,
  "select-point": true,
  slider: true,
  "text-entry": true,
} as const;

/**
 * A kind plate parses through an interaction module beside this file: every interaction kind it
 * reads.
 */
export type ModuleKind = keyof typeof moduleKinds;

/**
 * The module kinds that own an element as the container of their interactions ({@link
 * ModuleContainer}): Position Object's `qti-position-object-stage`, the one container QTI gives an
 * interaction. The table of containers is a record over these kinds, so each declares one and no
 * other kind can, and a
 * container node's module is one of these, and the server shell renders every container it meets
 * with no case for a kind that has none.
 */
export type ContainerKind = Extract<ModuleKind, "position-object">;

/**
 * A node type with the level of its content as its parameter, `this["level"]` in `node`: what a
 * module names its node by, and {@link NodeAt} applies, as the module doc shows.
 */
export interface ByLevel {
  readonly level: Level;
  readonly node: unknown;
}

/**
 * A node that holds no content, the same at every level, such as a Text Entry's: what a module
 * whose node holds none names it by, its `hollow` the node itself and its `regions` none.
 *
 * @template I The node.
 */
export interface LevelFree<I> extends ByLevel {
  readonly node: I;
}

/**
 * The node a {@link ByLevel} gives at a level.
 *
 * @template F The node type.
 * @template L The level, the item model's by default.
 */
export type NodeAt<F extends ByLevel, L extends Level = ModelLevel> = (F & {
  readonly level: L;
})["node"];

/**
 * A feature of the QTI 3.0 conformance list, Appendix A, by its identifier: `Q-1` to `Q-21` are
 * the interactions, Associate to Upload in alphabetical order.
 */
type FeatureId = `Q-${number}`;

/**
 * The fields every module kind's model node shares, which the hubs read of any interaction: the
 * kind, the element path, the response it binds (`response-identifier`, which every QTI interaction
 * carries) and the author's names for it. A module declares its node over these.
 *
 * @template K The kind.
 */
export interface ModuleInteraction<K extends ModuleKind> {
  /**
   * The author's `aria-label`, which names the interaction when it has no Prompt.
   */
  readonly ariaLabel: Option.Option<string>;
  /**
   * The author's `aria-labelledby`, an IDREFS value as written, which names the interaction when it
   * has no Prompt.
   */
  readonly ariaLabelledby: Option.Option<string>;
  /**
   * The author's `data-*` attributes on the interaction's root, in document order, as securing kept
   * them (decision D24): each a name plate does not reserve (`isAuthorData` in
   * `#plate/vocabulary.ts`). The body walk sets it after the module's `parse` ({@link Parsed}); a
   * module never reads or writes it, and the payload hub copies it past the module's `redact`, so
   * the shell writes each on the interaction's root, none listed when the root carries none. A
   * Portable Custom Interaction's node has no `data`: its `data-*` are its properties.
   */
  readonly data: readonly BodyAttribute[];
  readonly kind: K;
  readonly path: string;
  /**
   * The identifier of the response it binds, `response-identifier`, read as `identifierOf` reads
   * it.
   */
  readonly response: string;
}

/**
 * A module's node as its `parse` gives it: every field but the author's `data-*`
 * ({@link ModuleInteraction.data}), which the body walk sets on it.
 *
 * @template N The node, or a union of nodes, each read as itself.
 */
export type Parsed<N> = N extends unknown ? Omit<N, "data"> : never;

/**
 * The response declaration an interaction's `response-identifier` names, as the body walk hands it
 * to the interaction's module: its identifier, its cardinality, and its base type unless it is a
 * `record`. The body walk
 * gives the notice for a binding outside the module's ({@link misfitOf}) before the module reads
 * the element, and the module narrows the binding by its own table ({@link boundIn}).
 *
 * It holds the declaration's type and nothing else of it: no element, so no module's `parse` can
 * read a `qti-correct-response`, a `qti-mapping`, a `qti-area-mapping` or a `qti-default-value`
 * into its model node, from which the payload node and the island's props are built. Its type is
 * read once, from a document the database admitted: a `record` declaration has no base type of its
 * own, and every other one has both attributes, inside their vocabularies.
 */
export type BoundDeclaration =
  | {
      readonly cardinality: "record";
      readonly identifier: string;
    }
  | {
      /**
       * The declaration's `base-type`, which every declaration of another cardinality than
       * `record` carries in a checked document (the database's "AL3 required").
       */
      readonly baseType: BaseType;
      readonly cardinality: Exclude<Cardinality, "record">;
      readonly identifier: string;
    };

/**
 * The responses a module renders an interaction bound to: the base types and cardinalities of a
 * declaration it takes, or `any` for a module that takes a declared response of any type, as a
 * Portable Custom Interaction does (reading 75). A `record` declaration has no base type of its
 * own, so a binding whose cardinalities hold `record` takes one whatever base types it lists.
 */
export type ModuleBinding =
  | "any"
  | {
      readonly baseTypes: readonly BaseType[];
      readonly cardinalities: readonly Cardinality[];
    };

/**
 * Name the first part of a declaration outside a module's binding, as the notice for it keys it:
 * the cardinality first, as `cardinality="…"`, then the base type, as `base-type="…"`, each as the
 * declaration writes it. The body walk gives that notice in place of the interaction before its
 * module reads it.
 *
 * @param binding The module's binding.
 * @param declaration The declaration the interaction names.
 * @returns The feature key of the first part outside the binding, none when the binding takes the
 *   declaration.
 */
export const misfitOf = (
  binding: ModuleBinding,
  declaration: BoundDeclaration,
): Option.Option<string> => {
  if (binding === "any") {
    return Option.none();
  }

  if (!binding.cardinalities.includes(declaration.cardinality)) {
    return Option.some(`cardinality="${declaration.cardinality}"`);
  }

  return declaration.cardinality === "record" || binding.baseTypes.includes(declaration.baseType)
    ? Option.none()
    : Option.some(`base-type="${declaration.baseType}"`);
};

/**
 * A module read a declaration outside the binding it narrowed it by, which the body walk judged
 * first: a defect of the module or of the walk, which no document can cause. It is thrown, never
 * returned.
 */
class UnboundDeclaration extends Data.TaggedError("UnboundDeclaration")<{
  readonly declaration: string;
}> {
  /**
   * The broken invariant, and what to do with it.
   */
  override get message(): string {
    return `An interaction module read the response ${JSON.stringify(this.declaration)} outside the binding the body walk judged it by. This is a defect in plate's interaction modules; report it with the item that caused it.`;
  }
}

/**
 * A declaration narrowed to one of a module's bindings: the base type and cardinality its table
 * names.
 */
export interface BoundBinding<B extends BaseType, C extends Cardinality> {
  readonly baseType: B;
  readonly cardinality: C;
}

/**
 * Give the base type and cardinality of the declaration an interaction is bound to, typed by the
 * binding its module renders with: the body walk has given the notice for any declaration outside
 * it ({@link misfitOf}), so the declaration the module is handed is inside it.
 *
 * @template B The base types the module renders with.
 * @template C The cardinalities the module renders with.
 * @param binding The base types and cardinalities.
 * @param declaration The declaration the interaction names.
 * @returns The bound base type and cardinality.
 * @throws {UnboundDeclaration} When the declaration is outside the binding, which the body walk
 *   rules out.
 */
export const boundIn = <const B extends BaseType, const C extends Cardinality>(
  binding: { readonly baseTypes: readonly B[]; readonly cardinalities: readonly C[] },
  declaration: BoundDeclaration,
): BoundBinding<B, C> => {
  if (declaration.cardinality === "record") {
    throw new UnboundDeclaration({ declaration: declaration.identifier });
  }

  const cardinality = binding.cardinalities.find((value) => value === declaration.cardinality);
  const baseType = binding.baseTypes.find((value) => value === declaration.baseType);
  if (cardinality === undefined || baseType === undefined) {
    throw new UnboundDeclaration({ declaration: declaration.identifier });
  }

  return { baseType, cardinality };
};

/**
 * What a module's `parse` reads the body walk's content with: the kit the walk hands it beside the
 * attribute readers ({@link AttributeReaders}), so a module reads its element the way the body walk
 * reads the item body, and never re-implements the walk or imports its readers.
 */
export interface ReaderKit extends AttributeReaders {
  /**
   * Record each feature of the vocabulary's `modelled.controlNotices` the element carries, such
   * as `min-strings>100`, as shown by a notice in place of the interaction's Controls: the
   * interaction is still built, and its Prompt renders.
   *
   * @param element The interaction.
   */
  readonly controlNotices: (element: SourceElement) => void;
  /**
   * Read the template visibility of a choice or a hotspot, as the body walk reads a template
   * block's or inline's: its `template-identifier`, read as an identifier, with its `show-hide`,
   * `show` when absent; none when it carries no `template-identifier`, whatever its `show-hide`.
   *
   * @param element The choice or hotspot.
   * @returns Its template visibility, none when it has none.
   */
  readonly templateVisibility: (element: SourceElement) => Option.Option<TemplateVisibility>;
  /**
   * The location of the document being read, its path from the package root as the host named it,
   * which a URL the element carries is resolved against (`classifyUrlAt` in `#plate/model/url.ts`).
   */
  readonly location: string;
  /**
   * Read the content of the element's first child of one name, such as its `qti-prompt`, as the
   * body walk reads a Prompt: the child's marks recorded, its children walked.
   *
   * @param element The element.
   * @param local The child's local name in the QTI namespace.
   * @returns The child's content, none when the element has no such child.
   */
  readonly content: (element: SourceElement, local: string) => Option.Option<readonly BodyNode[]>;
  /**
   * Record a feature the module reads but does not render as a mark on the verdict, at an element.
   *
   * @param element The element that carries the feature.
   * @param feature The feature's key, as the verdict names it.
   */
  readonly mark: (element: SourceElement, feature: string) => void;
  /**
   * Record the marks the vocabulary's `renders.marks` place on a body element, as the body walk
   * records them on each element it reads; a module calls it once for the element it reads, after
   * it has decided not to give the notice.
   *
   * @param element The element.
   */
  readonly markElement: (element: SourceElement) => void;
  /**
   * Read children of an element as body nodes, the way the body walk reads the item body: text as
   * itself, HTML elements with their subtrees, MathML, printed variables and template content
   * intact, and any other `qti-*` element as a notice, except those the module owns, which are read
   * as elements, their attributes as written and their children walked the same way, so a
   * `qti-gap` inside a paragraph reaches the module's content, and the payload and the server
   * shell carry it as an element.
   *
   * @param parent The element whose children are read.
   * @param options Which children (all of them by default), and the local names of the `qti-*`
   *   elements the module owns, none by default.
   * @returns The body nodes, in document order.
   */
  readonly nodes: (
    parent: SourceElement,
    options?: {
      readonly children?: readonly SourceChild[];
      readonly own?: readonly string[];
    },
  ) => readonly BodyNode[];
}

/**
 * Record the `template-identifier` an element carries as a mark, where its module shows no part of
 * it by a template value.
 *
 * @param read The reader kit.
 * @param carrier The choice, gap or hotspot.
 */
export const markTemplate = (read: ReaderKit, carrier: SourceElement): void => {
  if (Option.isSome(read.valueOf(carrier, "template-identifier"))) {
    read.mark(carrier, "template-identifier");
  }
};

/**
 * What the body walk hands a module's `parse`: the element's path, the one way to replace the
 * element by its notice, which also records the feature on the verdict, and the kit it reads the
 * element with.
 */
export interface ParseContext {
  /**
   * Replace the element by its notice, and record the feature as shown by one.
   *
   * @param feature The feature's key, as the verdict and the notice name it.
   * @returns The unsupported node.
   */
  readonly notice: (feature: string) => Unsupported;
  /**
   * The element path of the element being parsed.
   */
  readonly path: string;
  /**
   * The kit the element and its content are read with.
   */
  readonly read: ReaderKit;
}

/**
 * What the body walk hands an interaction module's `parse`: what it hands any module, and the
 * declaration the interaction's `response-identifier` names. The walk has refused an interaction
 * that names none the item declares as `undeclared-response`, given the notice of a feature of the
 * vocabulary's `modelled.notices` the element carries, and given the notice for a declaration
 * outside the module's binding ({@link misfitOf}), each before `parse` reads the element.
 */
export interface ModuleParseContext extends ParseContext {
  readonly bound: BoundDeclaration;
  /**
   * The element whose children the body walk reads the interaction among: a Position Object's
   * stage, from which it takes the size its points are bounded by.
   */
  readonly parent: SourceElement;
}

/**
 * What the payload hands a module's `redact`, for the one interaction it gives the payload node of
 * (`interactionPayload` in `#plate/payload.ts`): the view's facts about the interaction's
 * responses, so a module restores a stored response into its parts, writes its inputs under the
 * response's entry name, and shuffles by the configuration's seed, with no hub naming its kind, and
 * the host's facts ({@link RedactKit.host}), so a module reads what only its host knows. The view's
 * values are the host's: a value a module's interaction binds has passed the module's `shown`
 * (through `restore` in `#plate/restore.ts` or `solution` in `#plate/solution.ts`) when the host
 * read them from there, so what a module shows is what its own step gave.
 */
export interface RedactKit {
  /**
   * Give the name a response's controls post under, `entryName(instance, response)`.
   *
   * @param response The response identifier, one of the module's `bindings`.
   * @returns The entry name.
   */
  readonly formName: (response: string) => string;
  /**
   * The host's facts, the view's `host`, the empty record when the host passed none: what only
   * the host knows, such as the URL of a script it serves (`HostFacts` in `#plate/pci/host.ts`). A
   * module reads only its own member and bakes what its interaction needs into its payload node; a
   * module whose member is absent redacts as with none. The facts are a page input, never item
   * data: they reach no redacted item and no `Payload` field, only the payload node a module bakes
   * them into.
   */
  readonly host: HostFacts;
  /**
   * The item instance key, which scopes every id and entry name.
   */
  readonly instance: string;
  /**
   * The configuration's `seed`, written as given: with the response, the key of a shuffle
   * (`presentedOrder` in `#plate/shuffle.ts`).
   */
  readonly seed: string;
  /**
   * Give the values the view shows for a response: the value's members, a record's `stringValue`
   * alone, none when it is NULL, a record without one, or the view gives none.
   *
   * @param response The response identifier, one of the module's `bindings`.
   * @returns The values shown.
   */
  readonly shown: (response: string) => readonly Single[];
}

/**
 * The template visibility of a region's choice (`template-identifier` and `show-hide`), with the
 * identifier of the choice it shows or hides: what the redaction decides the region by.
 */
export interface ChoiceVisibility {
  /**
   * The identifier of the choice whose content the region is.
   */
  readonly choice: string;
  readonly visibility: TemplateVisibility;
}

/**
 * How a region whose choice a template variable shows or hides is decided: the template visibility
 * that decides it and its choice, and the model node with the choice shown, its visibility
 * settled, or dropped.
 *
 * @template I The module's model node.
 */
export interface RegionShownBy<I> extends ChoiceVisibility {
  /**
   * Give the model node with the region's choice decided: kept with no template visibility of its
   * own when the values show it, gone when they hide or withhold it, as the redaction leaves a
   * template inline.
   *
   * @param interaction The model node.
   * @param shown Whether the values show the choice.
   * @returns The model node, the choice settled or dropped.
   */
  readonly decide: (interaction: I, shown: boolean) => I;
}

/**
 * One region of an interaction's own content as its module gives it, such as its Prompt, an
 * Inline Choice's Label, a choice's content or a Gap Match's gapped text: its content, how its
 * content is put back, and, for a choice a template variable shows or hides, how that is decided.
 *
 * A region puts its own content back ({@link OwnRegion.put}), finding its part by its own field or
 * its choice's identifier, never by its place among the regions: `mapRegions` and
 * `redactRegions` in `#plate/model/interactions.ts` fold the puts over the node in document order,
 * so a region that a walk replaces, or that a choice a template hides takes away, moves no other
 * region's content.
 * A module gives its regions from the node's fields alone, never from its content, which its
 * `hollow` empties, so the regions of a node and of its hollow node are the same, one for one.
 *
 * @template I The module's model node.
 * @template N The node its content holds: `BodyNode<L>` for a node at a level `L`.
 */
export interface OwnRegion<I, N> {
  readonly nodes: readonly N[];
  /**
   * Give the model node with the region's content replaced, every other part as it was.
   *
   * @param interaction The model node, as the puts of the regions before this one left it.
   * @param nodes The content that takes the region's place.
   * @returns The model node.
   */
  readonly put: (interaction: I, nodes: readonly N[]) => I;
  /**
   * How the template visibility of the region's choice is decided, none for content that is always
   * shown.
   */
  readonly shownBy: Option.Option<RegionShownBy<I>>;
}

/**
 * Give the region of a model node's Prompt, none when it has no Prompt.
 *
 * @template I The model node.
 * @template N The node its content holds.
 * @param interaction The model node.
 * @returns The Prompt's region, its content put back as the node's `prompt`.
 */
export const promptRegion = <I, N>(
  interaction: I & { readonly prompt: Option.Option<readonly N[]> },
): readonly OwnRegion<I, N>[] =>
  Option.match(interaction.prompt, {
    onNone: () => [],
    onSome: (nodes) => [
      {
        nodes,
        put: (each, content) => ({ ...each, prompt: Option.some(content) }),
        shownBy: Option.none(),
      },
    ],
  });

/**
 * Give the region of one part of a model node that is no choice's, such as a graphic
 * interaction's image or a Gap Match's gapped text.
 *
 * @template I The model node.
 * @template N The node its content holds.
 * @param nodes The part's content.
 * @param put Give the node with the part's content replaced.
 * @returns The part's region.
 */
export const contentRegion = <I, N>(
  nodes: readonly N[],
  put: OwnRegion<I, N>["put"],
): OwnRegion<I, N> => ({
  nodes,
  put,
  shownBy: Option.none(),
});

/**
 * How a list's choices are shown by a template variable: the template visibility of a choice,
 * none for one always shown, and the choice with its visibility settled once the values show it.
 *
 * @template C The choice.
 */
export interface ChoicesShownBy<C> {
  /**
   * Give a choice with no template visibility of its own, as the redaction keeps a choice the
   * values show.
   *
   * @param choice The choice.
   * @returns The choice, settled.
   */
  readonly settled: (choice: C) => C;
  /**
   * Give a choice's template visibility.
   *
   * @param choice The choice.
   * @returns Its `template-identifier` and `show-hide`, none when it has no `template-identifier`.
   */
  readonly visibility: (choice: C) => Option.Option<TemplateVisibility>;
}

/**
 * Give the region of each choice of a list a model node holds, in document order, each finding its
 * choice again by its identifier, which no other choice of the item shares (reading 104), and, for
 * a choice a template variable shows or hides, deciding it by dropping or settling that choice.
 *
 * @template I The model node.
 * @template N The node its content holds.
 * @template C The choice.
 * @param choices The choices, in document order.
 * @param update Give the node with the list's choices passed through a step.
 * @param shownBy How a template variable shows the list's choices, none when it shows none.
 * @returns One region per choice.
 */
export const choiceRegions = <
  I,
  N,
  C extends { readonly content: readonly N[]; readonly identifier: string },
>(
  choices: readonly C[],
  update: (interaction: I, step: (choices: readonly C[]) => readonly C[]) => I,
  shownBy: Option.Option<ChoicesShownBy<C>> = Option.none(),
): readonly OwnRegion<I, N>[] =>
  choices.map((choice) => {
    const { identifier } = choice;

    return {
      nodes: choice.content,
      put: (interaction, content) =>
        update(interaction, (each) =>
          each.map((held) => (held.identifier === identifier ? { ...held, content } : held)),
        ),
      shownBy: shownBy.pipe(
        Option.flatMap((shown) =>
          shown.visibility(choice).pipe(
            Option.map((visibility) => ({
              choice: identifier,
              decide: (interaction: I, visible: boolean) =>
                update(interaction, (each) =>
                  each.flatMap((held) => {
                    if (held.identifier !== identifier) {
                      return [held];
                    }

                    return visible ? [shown.settled(held)] : [];
                  }),
                ),
              visibility,
            })),
          ),
        ),
      ),
    };
  });

/**
 * The element a module owns as the container of its interactions, and what the module does with
 * it: a `qti-position-object-stage` holds the Position Objects it is the stage of, and is no
 * interaction and no content of its own, so the module of the interactions inside it owns it. The
 * body walk reads the element's children as body nodes first, the interactions inside it through
 * their own modules, then hands the element and those nodes to `parse`; the payload carries the
 * node `parse` gives as a container (`ContainerNode`, `ContainerPayload`), whose children are
 * read and copied as any body nodes are. Position Object declares one.
 *
 * @template K The kind of the module that owns the element.
 */
export interface ModuleContainer<K extends ContainerKind> {
  /**
   * The QTI element name, which the body walk dispatches on before it gives the notice.
   */
  readonly element: `qti-${string}`;
  /**
   * Read the container element into the module's container node, or its notice.
   *
   * @param element The container element.
   * @param children The element's children as the body walk read them, in document order: the
   *   interactions inside it through their modules, any other content as the body holds it.
   * @param context The element's path, its notice, and the kit it is read with.
   * @returns The container node at the module's kind, or the unsupported node.
   */
  readonly parse: (
    element: SourceElement,
    children: readonly BodyNode[],
    context: ParseContext,
  ) => ContainerNode<K> | Unsupported;
}

/**
 * One interaction kind's module.
 *
 * Its type parameters state their variance (`in out`, `out`), so TypeScript never measures it:
 * measuring it reads the module's node at `ModelLevel`, whose content is the item model's body
 * node, whose interactions the table of modules gives (`ModuleModel` in
 * `#plate/model/interactions.ts`), which reads this type of every module, so the measure would
 * meet itself and leave the table `{}`.
 *
 * @template K The kind, as the item model names it.
 * @template F The kind's model node at each level ({@link ByLevel}), over the fields every module's
 *   node shares ({@link ModuleInteraction}); the item model's union of module nodes is read from
 *   it.
 * @template P The kind's payload node, its content at `RedactedLevel`. It names the response it
 *   binds, as every QTI interaction's `response-identifier` names one.
 */
export interface InteractionModule<
  in out K extends ModuleKind,
  in out F extends ByLevel,
  out P extends { readonly response: string },
> {
  /**
   * The value a response the interaction binds takes when the form posted no entry for it, in
   * place of NULL. `absentValueOf` in `#plate/model/interactions.ts` reads it, `postings`
   * (`#plate/postings.ts`) carries it in the response's posting as `decode`'s `absent` option, and
   * `decode` (`#plate/form/encoding.ts`) gives it for no entry, so a host that decodes through the
   * postings gets it without naming the kind. Absent means NULL, which
   * almost every kind leaves in place: a Control that posts nothing has no response. End Attempt
   * sets it: its button posts `true`
   * when the candidate ends the attempt through it, and a submission without the button sets the
   * response to `false`, not NULL, since the information model sets an End Attempt's response to
   * false whenever the attempt ends another way.
   *
   * @param interaction The model node.
   * @returns The value no entry decodes to.
   * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_EndAttemptInteraction
   */
  readonly absentValue?: (interaction: NodeAt<F>) => Value;
  /**
   * The responses the module renders the interaction bound to, which the body walk judges the
   * declaration its `response-identifier` names by before `parse` reads it
   * ({@link ModuleParseContext}).
   */
  readonly binding: ModuleBinding;
  /**
   * Whether a submission through the item counts an attempt, read once per processed attempt with
   * the responses the submission set. `countsAttempt` in `#plate/model/interactions.ts` folds every
   * interaction's answer, and `runAttempt` (`#plate/engine/attempt.ts`) raises `numAttempts` by
   * one only when every answer is true; otherwise the record keeps its count while the responses
   * are still set and the rules still run. Absent means true, almost every kind's answer: every
   * submission counts. End Attempt sets it:
   * with `count-attempt` false, the attempt the candidate ends through its button is not counted.
   *
   * @param interaction The model node.
   * @param posted The submission's responses, by identifier, as `runAttempt` is given them: the
   *   module reads the value of the response its node binds from them, absent when the submission
   *   did not set it.
   * @returns Whether the attempt is counted.
   * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_EndAttemptInteraction
   */
  readonly countsAttempt?: (
    interaction: NodeAt<F>,
    posted: Readonly<Record<string, Value>>,
  ) => boolean;
  /**
   * The interaction's QTI element name, which the body walk dispatches on.
   */
  readonly element: `qti-${string}-interaction`;
  /**
   * The kind's Appendix A identifier.
   */
  readonly feature: FeatureId;
  /**
   * Give the model node with every content field emptied, at the redacted body's level, every
   * other field as it was, so its regions are the node's, one for one: what `redactRegions` puts a
   * node's redacted regions back into (the module doc shows one).
   *
   * @param interaction The model node.
   * @returns The node with no content, at `RedactedLevel`.
   */
  readonly hollow: (interaction: NodeAt<F>) => NodeAt<F, RedactedLevel>;
  readonly kind: K;
  /**
   * Read one QTI interaction element of the kind into its model node, or its notice, with the
   * declaration it is bound to.
   */
  readonly parse: (
    element: SourceElement,
    context: ModuleParseContext,
  ) => Parsed<NodeAt<F>> | Unsupported;
  /**
   * Copy the model node into the payload node the page may know: its content through the kit, and
   * what it shows of the view, the stored values, the response's entry name, the seed and the rest,
   * read from the kit ({@link RedactKit}) and baked into the payload node, since the page sees the
   * `Payload` and none of the view beyond it. It is handed the node of the redacted body.
   */
  readonly redact: (interaction: NodeAt<F, RedactedLevel>, kit: RedactKit) => P;
  /**
   * The regions of the model node's own content, in document order, as `regionsOf` gives them:
   * its Prompt and every other content it holds, each with the way it puts its content back and,
   * for a choice a template variable shows or hides, how that is decided ({@link OwnRegion}), at
   * whatever level the node holds its content.
   *
   * @template L The level of the node's content.
   */
  readonly regions: <L extends Level>(
    interaction: NodeAt<F, L>,
  ) => readonly OwnRegion<NodeAt<F, L>, BodyNode<L>>[];
  /**
   * The value the interaction shows for a stored or a correct value of the response it binds:
   * `restore` (`#plate/restore.ts`) and `solution` (`#plate/solution.ts`) hand each such value
   * through it (`shownThrough`), so the values the host shows are what the module gave, and its
   * `redact` reads them back through the kit's `shown`. Absent for a kind that shows a value as it
   * is; Graphic Associate and Graphic Order keep a value to the hotspots they hold.
   */
  readonly shown?: (interaction: NodeAt<F>, value: ResponseValue) => ResponseValue;
  /**
   * Check a response the caller decoded, as `validateInlineChoice` does.
   */
  readonly validate: (
    interaction: NodeAt<F>,
    input: Value | Malformed,
    configuration: Configuration,
  ) => readonly ValidationMessage[];
}
