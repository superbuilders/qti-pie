/**
 * The table of interaction modules, the regions of an interaction, the content it holds of its
 * own, the walk that finds an item body's interactions, and the steps of each interaction's module,
 * which the payload, the results, the verdict and the server shell share.
 *
 * Every interaction kind plate reads is a module ({@link modules}), so each hub dispatches on an
 * interaction in one place. {@link regionsOf} is the one place that knows which content each
 * interaction holds: every walk of the body that enters an interaction enters it through the
 * regions its module gives, so no walk keeps its own table of the kinds.
 * {@link childNodesOf} and {@link mapChildNodes} are the one place that knows which nodes of the
 * item model hold body nodes, so a walk of the model keeps only the cases it treats apart.
 * {@link moduleSteps} is the one place that hands a model node to its module, and
 * {@link modulePayload} a redacted one, so each hub delegates an interaction in one line, and a
 * module that lands changes none.
 * {@link containerFor} does the same for the element a module owns as the container of its
 * interactions. The types the hubs read of a module kind, its model node at a level
 * ({@link ModelOf}) and its payload node ({@link PayloadOf}), are read from the table of modules
 * ({@link modules}), and the item model reads its union of module nodes ({@link ModuleModel}) from
 * the same table, so a module declares both in its own file and no shared file names a kind's
 * fields. {@link redactRegions} takes a model node to the redacted body's level, as the redaction
 * does, through its module's `hollow` (the interaction-module contract in
 * `#plate/interactions/contract.ts` explains the levels).
 *
 * @module
 */
import { Array as Arr, Data, Option } from "effect";

import type { SourceElement } from "#plate/document/source.ts";
import { associateModule } from "#plate/interactions/associate.ts";
import { choiceModule } from "#plate/interactions/choice.ts";
import { endAttemptModule } from "#plate/interactions/end-attempt.ts";
import { extendedTextModule } from "#plate/interactions/extended-text.ts";
import { gapMatchModule } from "#plate/interactions/gap-match.ts";
import { graphicAssociateModule } from "#plate/interactions/graphic-associate.ts";
import { graphicGapMatchModule } from "#plate/interactions/graphic-gap-match.ts";
import { graphicOrderModule } from "#plate/interactions/graphic-order.ts";
import { hotspotModule } from "#plate/interactions/hotspot.ts";
import { hottextModule } from "#plate/interactions/hottext.ts";
import { inlineChoiceModule } from "#plate/interactions/inline-choice.ts";
import { matchModule } from "#plate/interactions/match.ts";
import { mediaModule } from "#plate/interactions/media.ts";
import { orderModule } from "#plate/interactions/order.ts";
import { portableCustomModule } from "#plate/interactions/portable-custom.ts";
import {
  positionObjectContainer,
  positionObjectModule,
} from "#plate/interactions/position-object.ts";
import { selectPointModule } from "#plate/interactions/select-point.ts";
import { sliderModule } from "#plate/interactions/slider.ts";
import { textEntryModule } from "#plate/interactions/text-entry.ts";
import type {
  ChoiceVisibility,
  ContainerKind,
  InteractionModule,
  ModuleBinding,
  ModuleContainer,
  ModuleKind,
  ModuleParseContext,
  NodeAt,
  OwnRegion,
  Parsed,
  RedactKit,
} from "#plate/interactions/contract.ts";
import type {
  BodyNode,
  Interaction,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
  RedactedNode,
  Unsupported,
} from "#plate/model/item.ts";
import type { ResponseValue, Value } from "#plate/model/values.ts";
import type { Paired, PairedInteraction } from "#plate/payload.ts";

/**
 * One region of an interaction: content it holds of its own, such as its Prompt, a choice's
 * content or a Gap Match's gapped text, as the walks read it.
 *
 * @template L The level of its content, the item model's by default.
 */
export interface Region<L extends Level = ModelLevel> {
  readonly nodes: Nodes<L>;
  /**
   * The template visibility of the region's choice, with the choice it decides (`ChoiceVisibility`
   * in `#plate/interactions/contract.ts`), none for content that is always shown.
   */
  readonly shownBy: Option.Option<ChoiceVisibility>;
}

/**
 * The module of each kind plate parses through one, by kind: a record over {@link ModuleKind}, so
 * a kind added to it or taken from it changes this table or fails to compile. The types a hub reads
 * of a module ({@link ModelOf}, {@link PayloadOf}) are read from it, so a module that lands
 * declares them in its own file.
 */
export const modules = {
  associate: associateModule,
  choice: choiceModule,
  "end-attempt": endAttemptModule,
  "extended-text": extendedTextModule,
  "gap-match": gapMatchModule,
  "graphic-associate": graphicAssociateModule,
  "graphic-gap-match": graphicGapMatchModule,
  "graphic-order": graphicOrderModule,
  hotspot: hotspotModule,
  hottext: hottextModule,
  "inline-choice": inlineChoiceModule,
  match: matchModule,
  media: mediaModule,
  order: orderModule,
  "portable-custom": portableCustomModule,
  "position-object": positionObjectModule,
  "select-point": selectPointModule,
  slider: sliderModule,
  "text-entry": textEntryModule,
} as const satisfies { readonly [K in ModuleKind]: { readonly kind: K } };

/**
 * The module of each {@link ModuleKind}, by kind, as each module declares itself.
 */
export type Modules = typeof modules;

/**
 * The model node of a module's kind at each level (`ByLevel` in `#plate/interactions/contract.ts`),
 * as its module declares it.
 *
 * @template K The kind.
 */
type ByLevelOf<K extends ModuleKind> = K extends ModuleKind
  ? Modules[K] extends InteractionModule<K, infer F, infer _P>
    ? F
    : never
  : never;

/**
 * The model node of a module's kind at a level, as its module declares it.
 *
 * @template K The kind.
 * @template L The level, the item model's by default.
 */
export type ModelOf<K extends ModuleKind, L extends Level = ModelLevel> = NodeAt<ByLevelOf<K>, L>;

/**
 * The payload node of a module's kind, as its module's `redact` gives it. It names the response it
 * binds, as the contract requires of every module's payload node.
 *
 * @template K The kind.
 */
export type PayloadOf<K extends ModuleKind> = Extract<
  ReturnType<Modules[K]["redact"]>,
  { readonly response: string }
>;

/**
 * The model node of any interaction plate parses through a module at a level, one member per kind,
 * each as its module declares it: the item model's `Interaction` union holds this, so a module that
 * lands changes the model through its own file.
 *
 * @template L The level, the item model's by default.
 */
export type ModuleModel<L extends Level = ModelLevel> = {
  readonly [K in ModuleKind]: ModelOf<K, L>;
}[ModuleKind];

/**
 * Each kind's module as the hubs call it, by kind: a mapped type, so that indexing it by a kind
 * gives that kind's module, which correlates a node's kind with its module's types.
 */
type Stepped = { readonly [K in ModuleKind]: InteractionModule<K, ByLevelOf<K>, PayloadOf<K>> };

/**
 * {@link modules} as {@link Stepped}: the assignment is the check that every module's steps take and
 * give its own model and payload nodes.
 */
const stepped: Stepped = modules;

/**
 * Give the value a module kind's model node takes for its response when the form posted no entry,
 * by its kind's module: none when the module does not say.
 *
 * @param kind The kind.
 * @param interaction The node.
 * @returns The module's `absentValue`, none when it has none.
 */
const moduleAbsentValue = <K extends ModuleKind>(
  kind: K,
  interaction: ModelOf<K>,
): Option.Option<Value> =>
  Option.map(Option.fromUndefinedOr(stepped[kind].absentValue), (absent) => absent(interaction));

/**
 * Give a module kind's model node's regions, by its kind's module.
 *
 * @template K The kind.
 * @template L The level of the node's content.
 * @param kind The kind.
 * @param interaction The node.
 * @returns Its regions, as its module gives them, in document order.
 */
const moduleRegions = <K extends ModuleKind, L extends Level>(
  kind: K,
  interaction: ModelOf<K, L>,
): readonly OwnRegion<ModelOf<K, L>, BodyNode<L>>[] => stepped[kind].regions<L>(interaction);

/**
 * Give the regions of an interaction, first in the document first, as its kind's module gives
 * them, its Prompt, its Label, its choices' content and its other `content` among them.
 *
 * @template L The level of its content, the item model's by default.
 * @param interaction The interaction.
 * @returns Its regions.
 */
export const regionsOf = <L extends Level = ModelLevel>(
  interaction: Interaction<L>,
): readonly Region<L>[] => moduleRegions<ModuleKind, L>(interaction.kind, interaction);

/**
 * Rebuild a module kind's model node with the content of each of its regions replaced, at the
 * same level, by its kind's module: `map` called on the regions in document order, then each
 * result put back through its region's own `put`.
 *
 * @template K The kind.
 * @template L The level of the node's content.
 * @param kind The kind.
 * @param interaction The node.
 * @param map The content each region is replaced by.
 * @returns The node, each region's content replaced.
 */
const moduleMap = <K extends ModuleKind, L extends Level>(
  kind: K,
  interaction: ModelOf<K, L>,
  map: (region: Region<L>) => Nodes<L>,
): ModelOf<K, L> => {
  const contents = moduleRegions<K, L>(kind, interaction).map((region) => ({
    nodes: map(region),
    put: region.put,
  }));
  let rebuilt = interaction;
  for (const { nodes, put } of contents) {
    rebuilt = put(rebuilt, nodes);
  }

  return rebuilt;
};

/**
 * Rebuild an interaction with the content of each of its regions ({@link regionsOf}) replaced,
 * calling `map` on the regions in document order, so a `map` that gathers what it finds gathers it
 * in that order, then putting each region's content back through its own `put`, which finds its
 * part by itself, so no region's content moves to another's.
 *
 * @template L The level of the interaction's content, the item model's by default.
 * @param interaction The interaction.
 * @param map The content each region is replaced by.
 * @returns The interaction with each region's content replaced; a kind with no region is returned
 *   as it is.
 */
const mapRegions = <L extends Level = ModelLevel>(
  interaction: Interaction<L>,
  map: (region: Region<L>) => Nodes<L>,
): Interaction<L> => moduleMap<ModuleKind, L>(interaction.kind, interaction, map);

/**
 * A module's node held its regions in one order and its hollow node in another, or held more of
 * them: a defect of the module, whose regions read its content where they should read only its
 * fields. It is thrown, never returned, as no document can cause it.
 */
class UnalignedRegions extends Data.TaggedError("UnalignedRegions")<{
  readonly kind: ModuleKind;
}> {
  /**
   * The broken invariant, and what to do with it.
   */
  override get message(): string {
    return `The ${this.kind} interaction module gave a node and its hollow node different regions, so redactRegions cannot put each region's content back. A module's regions must follow the node's fields alone, never its content; fix the module's regions.`;
  }
}

/**
 * Take a module kind's model node to the redacted body's level, by its kind's module: `map` called
 * on the node's regions in document order, then each result put back, region by region, into the
 * node's hollow node, whose regions are the node's one for one.
 *
 * @template K The kind.
 * @param kind The kind.
 * @param interaction The node.
 * @param map The redacted content each region is replaced by.
 * @returns The node at the redacted body's level.
 * @throws {UnalignedRegions} When the hollow node's regions are not the node's.
 */
const moduleRedact = <K extends ModuleKind>(
  kind: K,
  interaction: ModelOf<K>,
  map: (region: Region) => Nodes<RedactedLevel>,
): ModelOf<K, RedactedLevel> => {
  const module = stepped[kind];
  const contents = moduleRegions<K, ModelLevel>(kind, interaction).map(map);
  const hollow = module.hollow(interaction);
  const puts = module.regions<RedactedLevel>(hollow);
  if (puts.length !== contents.length) {
    throw new UnalignedRegions({ kind });
  }

  let rebuilt = hollow;
  for (const [region, nodes] of Arr.zip(puts, contents)) {
    rebuilt = region.put(rebuilt, nodes);
  }

  return rebuilt;
};

/**
 * Take an interaction of the model to the redacted body's level, each region's content replaced
 * by what `map` gives: `map` is called on the regions in document order, as {@link mapRegions}
 * calls it, and each result is put back into the node's hollow node (`hollow` in
 * `#plate/interactions/contract.ts`), every field but its content as it was. The redaction gives
 * the page each interaction so.
 *
 * @param interaction The interaction, as the item model holds it.
 * @param map The redacted content each region is replaced by.
 * @returns The interaction at the redacted body's level; a kind with no region is returned with
 *   its other fields as they were.
 */
export const redactRegions = (
  interaction: Interaction,
  map: (region: Region) => Nodes<RedactedLevel>,
): Interaction<RedactedLevel> => moduleRedact<ModuleKind>(interaction.kind, interaction, map);

/**
 * Decide each region of a module kind's model node whose choice a template visibility shows or
 * hides, by its kind's module.
 *
 * @template K The kind.
 * @template L The level of the node's content.
 * @param kind The kind.
 * @param interaction The node.
 * @param shows Whether the values show a region's choice.
 * @returns The node with each such choice decided.
 */
const moduleDecide = <K extends ModuleKind, L extends Level>(
  kind: K,
  interaction: ModelOf<K, L>,
  shows: (region: Region<L>) => boolean,
): ModelOf<K, L> => {
  let decided = interaction;
  for (const region of moduleRegions<K, L>(kind, interaction)) {
    if (Option.isSome(region.shownBy)) {
      decided = region.shownBy.value.decide(decided, shows(region));
    }
  }

  return decided;
};

/**
 * Decide each region of an interaction whose choice a template visibility shows or hides: the
 * choice kept, its visibility settled, where `shows` says the values show it, and dropped where
 * they hide or withhold it, as the redaction leaves a template inline's content.
 *
 * @template L The level of the interaction's content, the item model's by default.
 * @param interaction The interaction.
 * @param shows Whether the values show a region's choice, by its visibility and the choice it
 *   decides.
 * @returns The interaction with each such choice decided; one with none is returned as it is.
 */
export const decideRegions = <L extends Level = ModelLevel>(
  interaction: Interaction<L>,
  shows: (region: Region<L>) => boolean,
): Interaction<L> => moduleDecide<ModuleKind, L>(interaction.kind, interaction, shows);

/**
 * The kinds of body node that are no interaction, each once: a record over every such kind, so a
 * kind added to the body or taken from it changes this table or fails to compile.
 */
const contentKinds = {
  container: true,
  content: true,
  element: true,
  "feedback-block": true,
  "feedback-inline": true,
  "printed-variable": true,
  "template-block": true,
  "template-inline": true,
  text: true,
  unsupported: true,
} as const satisfies { readonly [K in Exclude<BodyNode, Interaction>["kind"]]: true };

/**
 * Tell whether a body node is an interaction.
 *
 * @template N The body node, at its level.
 * @param node The body node.
 * @returns Whether it is one of the interactions of its level: any node whose kind is no content
 *   kind.
 */
export const isInteraction = <N extends BodyNode>(
  node: N,
): node is Extract<N, { readonly kind: ModuleKind }> => !Object.hasOwn(contentKinds, node.kind);

/**
 * Give the body nodes a node of the item model holds, in document order: an element's and a
 * module's container's children, a template or feedback block's or inline's content whatever its
 * visibility, and an interaction's regions' content ({@link regionsOf}), region by region. A text,
 * a printed variable, a notice and a content module's node hold none.
 *
 * @param node The body node.
 * @returns The nodes it holds, none for a node that holds no body content.
 */
const childNodesOf = (node: BodyNode): Nodes => {
  if (isInteraction(node)) {
    return regionsOf(node).flatMap((region) => region.nodes);
  }

  switch (node.kind) {
    case "container":
    case "element": {
      return node.children;
    }
    case "feedback-block":
    case "feedback-inline":
    case "template-block":
    case "template-inline": {
      return node.content;
    }
    case "content":
    case "printed-variable":
    case "text":
    case "unsupported": {
      return [];
    }
    default: {
      return node satisfies never;
    }
  }
};

/**
 * Rebuild a node of the item model with the body nodes it holds ({@link childNodesOf}) replaced:
 * `map` called on each list it holds in document order, an interaction's region by region
 * ({@link mapRegions}), every other field as it was. A node that holds none is returned as it is.
 *
 * @param node The body node.
 * @param map The nodes each list of its content is replaced by.
 * @returns The node with its content replaced.
 */
export const mapChildNodes = (node: BodyNode, map: (nodes: Nodes) => Nodes): BodyNode => {
  if (isInteraction(node)) {
    return mapRegions(node, (region) => map(region.nodes));
  }

  switch (node.kind) {
    case "container":
    case "element": {
      return { ...node, children: map(node.children) };
    }
    case "feedback-block":
    case "feedback-inline":
    case "template-block":
    case "template-inline": {
      return { ...node, content: map(node.content) };
    }
    case "content":
    case "printed-variable":
    case "text":
    case "unsupported": {
      return node;
    }
    default: {
      return node satisfies never;
    }
  }
};

/**
 * Collect the interactions of body nodes in document order, each before the nodes it holds, at
 * any depth ({@link childNodesOf}): inside elements, a module's containers, template and feedback
 * blocks and inlines, and every interaction's regions. A template or feedback block's or inline's
 * content is walked whatever its visibility, so over the model its interactions are found; a
 * redacted body holds no template or feedback block or inline, its hidden content already gone.
 *
 * @param nodes The body nodes.
 * @returns The interactions.
 */
export const interactionsIn = (nodes: Nodes): readonly Interaction[] =>
  nodes.flatMap((node) => [
    ...(isInteraction(node) ? [node] : []),
    ...interactionsIn(childNodesOf(node)),
  ]);

/**
 * Collect the interactions of a redacted body in document order, as {@link interactionsIn} does,
 * inside elements, a module's containers and every interaction's regions, each at the redacted
 * level, so the payload (`interactionPayload` in `#plate/payload.ts`) takes it. A redacted body
 * holds no template or feedback block or inline.
 *
 * @param nodes The redacted body's nodes.
 * @returns The interactions.
 */
export const redactedInteractionsIn = (
  nodes: readonly RedactedNode[],
): readonly Interaction<RedactedLevel>[] =>
  nodes.flatMap((node): readonly Interaction<RedactedLevel>[] => {
    if (isInteraction(node)) {
      return [
        node,
        ...regionsOf<RedactedLevel>(node).flatMap((region) => redactedInteractionsIn(region.nodes)),
      ];
    }

    switch (node.kind) {
      case "container":
      case "element": {
        return redactedInteractionsIn(node.children);
      }
      case "content":
      case "text":
      case "unsupported": {
        return [];
      }
      default: {
        return node satisfies never;
      }
    }
  });

/**
 * Give the value an interaction's response takes when the form posted no entry for it, in place
 * of NULL: each node answers through its module's `absentValue` (`InteractionModule` in
 * `#plate/interactions/contract.ts`), and a module that leaves the member unset answers none, so no
 * entry stays NULL for it. `postings`
 * (`#plate/postings.ts`) reads it into the response's posting, so a host that decodes through the
 * postings gets the module's value without naming the kind.
 *
 * @param interaction The interaction.
 * @returns The value no entry decodes to, none for NULL.
 */
export const absentValueOf = (interaction: Interaction): Option.Option<Value> =>
  moduleAbsentValue(interaction.kind, interaction);

/**
 * The steps of a model node that read it, each bound to it: the members of its module the hubs
 * call ({@link InteractionModule}), so a hub delegates a module's kind in one line.
 */
interface ModuleSteps {
  /**
   * The value the node shows for a stored or correct value, the module's `shown`: the value itself
   * when it has none.
   */
  readonly shown: (value: ResponseValue) => ResponseValue;
}

/**
 * Bind a module's steps to one of its kind's model nodes.
 *
 * @template K The kind.
 * @param kind The kind.
 * @param interaction The node.
 * @returns The module's steps, each on the node.
 */
const stepsOf = <K extends ModuleKind>(kind: K, interaction: ModelOf<K>): ModuleSteps => {
  const module = stepped[kind];

  return {
    shown: (value) => module.shown?.(interaction, value) ?? value,
  };
};

/**
 * Give a model node's steps that read it, by its kind's module. A redacted body's interaction is
 * one, since a node at `RedactedLevel` is a model node.
 *
 * @param interaction The model node.
 * @returns Its module's steps, bound to it.
 */
export const moduleSteps = (interaction: ModuleModel): ModuleSteps =>
  stepsOf(interaction.kind, interaction);

/**
 * Pair a redacted body's interaction of one kind with its payload node, its module's `redact`:
 * the one place a {@link Paired} is minted, where the model node and the payload node are both at
 * the kind, so whatever reads the pair takes them as one kind's without a check.
 *
 * @template K The kind.
 * @param kind The kind.
 * @param interaction The node, as the redacted body holds it.
 * @param kit The view's facts the module reads.
 * @returns The node and its payload node, at its kind.
 */
export const payloadAt = <K extends ModuleKind>(
  kind: K,
  interaction: ModelOf<K, RedactedLevel>,
  kit: RedactKit,
): Paired<K> => ({ kind, model: interaction, payload: stepped[kind].redact(interaction, kit) });

/**
 * Pair a redacted body's interaction with its payload node, by its kind's module's `redact`: one
 * case per kind, each binding the node at its own kind, so the pair is the member of its kind; no
 * case names a module, so a module that lands changes none.
 *
 * @param interaction The interaction, as the redacted body holds it.
 * @param kit The view's facts the module reads.
 * @returns The node and its payload node.
 */
export const modulePayload = (
  interaction: ModuleModel<RedactedLevel>,
  kit: RedactKit,
): PairedInteraction => {
  switch (interaction.kind) {
    case "associate": {
      return payloadAt("associate", interaction, kit);
    }
    case "choice": {
      return payloadAt("choice", interaction, kit);
    }
    case "end-attempt": {
      return payloadAt("end-attempt", interaction, kit);
    }
    case "extended-text": {
      return payloadAt("extended-text", interaction, kit);
    }
    case "gap-match": {
      return payloadAt("gap-match", interaction, kit);
    }
    case "graphic-associate": {
      return payloadAt("graphic-associate", interaction, kit);
    }
    case "graphic-gap-match": {
      return payloadAt("graphic-gap-match", interaction, kit);
    }
    case "graphic-order": {
      return payloadAt("graphic-order", interaction, kit);
    }
    case "hotspot": {
      return payloadAt("hotspot", interaction, kit);
    }
    case "hottext": {
      return payloadAt("hottext", interaction, kit);
    }
    case "inline-choice": {
      return payloadAt("inline-choice", interaction, kit);
    }
    case "match": {
      return payloadAt("match", interaction, kit);
    }
    case "media": {
      return payloadAt("media", interaction, kit);
    }
    case "order": {
      return payloadAt("order", interaction, kit);
    }
    case "portable-custom": {
      return payloadAt("portable-custom", interaction, kit);
    }
    case "position-object": {
      return payloadAt("position-object", interaction, kit);
    }
    case "select-point": {
      return payloadAt("select-point", interaction, kit);
    }
    case "slider": {
      return payloadAt("slider", interaction, kit);
    }
    case "text-entry": {
      return payloadAt("text-entry", interaction, kit);
    }
    default: {
      return interaction satisfies never;
    }
  }
};

/**
 * What the body walk reads one interaction element through: its module's binding, which the walk
 * judges the declaration by, and its `parse`, which reads the element into its model node, or its
 * notice.
 */
export interface ModuleReader {
  readonly binding: ModuleBinding;
  readonly parse: (
    element: SourceElement,
    context: ModuleParseContext,
  ) => Parsed<Interaction> | Unsupported;
}

/**
 * Each module's reader, by the QTI element it reads: built once from the table of modules, so the
 * body walk finds an element's module in one lookup.
 */
const readers: ReadonlyMap<string, ModuleReader> = new Map(
  Object.values(stepped).map((module): readonly [string, ModuleReader] => [
    module.element,
    { binding: module.binding, parse: module.parse },
  ]),
);

/**
 * Give the reader of the module that reads an element, by the element's name: the one table the
 * body walk reads every interaction through.
 *
 * @param element The element's local name in the QTI namespace.
 * @returns The module's binding and `parse`, none when no module reads the element.
 */
export const readerFor = (element: string): Option.Option<ModuleReader> =>
  Option.fromUndefinedOr(readers.get(element));

/**
 * The container each container kind's module owns (`ModuleContainer` in
 * `#plate/interactions/contract.ts`), by kind: a record over `ContainerKind`, so a kind added there
 * declares its container here or fails to compile, and no other kind can declare one.
 */
const containers = {
  "position-object": positionObjectContainer,
} as const satisfies { readonly [K in ContainerKind]: ModuleContainer<K> };

/**
 * Give the container declaration of the module that owns an element as the container of its
 * interactions (`ModuleContainer` in `#plate/interactions/contract.ts`), by the element's name:
 * the body walk hands the element to its `parse` with the interactions inside it parsed.
 *
 * @param element The element's local name in the QTI namespace.
 * @returns The module's container, none when no module declares the element.
 */
export const containerFor = (element: string): Option.Option<ModuleContainer<ContainerKind>> =>
  Arr.findFirst(Object.values(containers), (container) => container.element === element);
