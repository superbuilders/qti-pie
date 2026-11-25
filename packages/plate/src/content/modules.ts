/**
 * The hubs of the content modules: the one place that holds the modules, dispatches a source
 * element to the module that reads it, and hands a module's node to its own steps, so no walk,
 * copy or codec names a module's fields, and a module that lands changes only its file and its
 * table's row here.
 *
 * The body-placed modules form one table by element ({@link bodyModules}) and the item-placed
 * modules another ({@link itemModules}). The types the hubs read of a module, its model node and
 * its payload node, are read from the tables, so the item model's `BodyNode` member
 * ({@link ContentNode}, at either level), the payload's ({@link ContentPayload}) and the content
 * the item, the redacted item and the payload hold by element ({@link ItemNodesHeld},
 * {@link ItemNodesKept}, {@link ItemPayloadsHeld}) follow a module's own declaration.
 *
 * @module
 */
import { Option, pipe } from "effect";
import { catalogInfoModule } from "#plate/content/catalog-info.ts";
import { companionMaterialsModule } from "#plate/content/companion-materials.ts";
import type {
  BodyContentModule,
  ContentByLevel,
  ContentNodeOf,
  ContentPayloadOf,
  ContentRedactKit,
  CopyOf,
  ItemContentModule,
  ItemNodeOf,
  ItemRedactKit,
  KeptNodeOf,
  NodeOf,
} from "#plate/content/contract.ts";
import { mathmlModule } from "#plate/content/mathml.ts";
import { rubricModule } from "#plate/content/rubric.ts";
import { stimulusRefModule } from "#plate/content/stimulus-ref.ts";
import { ssmlNamespace } from "#plate/document/source.ts";
import type { SourceElement } from "#plate/document/source.ts";
import type { ParseContext } from "#plate/interactions/contract.ts";
import type { Level, ModelLevel, Nodes, RedactedLevel } from "#plate/model/item.ts";
import type { UncheckedReason } from "#plate/validate/verdict.ts";

/**
 * The body-placed content modules, by element: those the body walk reads.
 */
const bodyModules = {
  math: mathmlModule,
  "qti-rubric-block": rubricModule,
} as const;

/**
 * The item-placed content modules, by element: those the item root's walk reads.
 */
const itemModules = {
  "qti-assessment-stimulus-ref": stimulusRefModule,
  "qti-catalog-info": catalogInfoModule,
  "qti-companion-materials-info": companionMaterialsModule,
} as const;

/**
 * The body-placed modules as each declares itself.
 */
export type BodyModules = typeof bodyModules;

/**
 * The item-placed modules as each declares itself.
 */
export type ItemModules = typeof itemModules;

/**
 * The element of a body-placed module.
 */
type BodyContentElement = keyof BodyModules;

/**
 * The element of an item-placed module.
 */
export type ItemContentElement = keyof ItemModules;

/**
 * One of the body-placed modules.
 */
type BodyPlacedModule = BodyModules[BodyContentElement];

/**
 * One of the item-placed modules.
 */
type ItemPlacedModule = ItemModules[ItemContentElement];

/**
 * The node of a body-placed content element in the item body, one member per module, each as its
 * module declares its node: the item model's `BodyNode` member for content.
 *
 * @template L The level of its content, the item model's by default.
 */
export type ContentNode<L extends Level = ModelLevel> = {
  readonly [E in BodyContentElement]: ContentNodeOf<E, NodeOf<BodyModules[E], L>>;
}[BodyContentElement];

/**
 * The payload node of a body-placed content element, one member per module, each as its module's
 * `copy` gives it, which the server shell renders the node by.
 */
export type ContentPayload = {
  readonly [E in BodyContentElement]: ContentPayloadOf<E, CopyOf<BodyModules[E]>>;
}[BodyContentElement];

/**
 * The nodes the item model holds of the item-placed modules' elements, by element, in document
 * order, each as its module declares it; an element's list is empty where the item holds none of
 * it.
 */
export type ItemNodesHeld = {
  readonly [E in ItemContentElement]: readonly ItemNodeOf<ItemModules[E]>[];
};

/**
 * The nodes the redacted item holds of the item-placed modules' elements, by element, in document
 * order, each as its module's `redact` keeps it; an element's list is empty where it keeps none.
 */
export type ItemNodesKept = {
  readonly [E in ItemContentElement]: readonly KeptNodeOf<ItemModules[E]>[];
};

/**
 * The payload nodes the payload holds of the item-placed modules' elements, by element, in the
 * order of {@link ItemNodesHeld}: each the module's `copy` of a node the redaction kept, every
 * element's list empty where it kept none.
 */
export type ItemPayloadsHeld = {
  readonly [E in ItemContentElement]: readonly CopyOf<ItemModules[E]>[];
};

/**
 * The members of a body-placed module the hubs read, typed by its element's model and payload
 * nodes in {@link bodyModules}, its element and placement among them, so a table row whose key is
 * not its module's element is refused where the table is checked.
 *
 * @template E The element.
 */
type SteppedBody<E extends BodyContentElement> = Pick<
  BodyContentModule<E, ContentByLevel<BodyModules[E]>, CopyOf<BodyModules[E]>>,
  "content" | "copy" | "element" | "normalise" | "parse" | "placement" | "redact"
>;

/**
 * The members of an item-placed module the hubs read, typed by its element's nodes in
 * {@link itemModules}.
 *
 * @template E The element.
 */
type SteppedItem<E extends ItemContentElement> = Pick<
  ItemContentModule<
    E,
    ItemNodeOf<ItemModules[E]>,
    KeptNodeOf<ItemModules[E]>,
    CopyOf<ItemModules[E]>
  >,
  "content" | "copy" | "element" | "normalise" | "parse" | "placement" | "redact"
>;

/**
 * The members of every body-placed module the hubs read, by element.
 */
type SteppedBodyTable = { readonly [E in BodyContentElement]: SteppedBody<E> };

/**
 * The members of every item-placed module the hubs read, by element.
 */
type SteppedItemTable = { readonly [E in ItemContentElement]: SteppedItem<E> };

/**
 * The body-placed modules as the hubs call them: {@link bodyModules} checked against the members
 * each element's module must give, so a module's own node types are what the hubs hand it.
 */
const steppedBody: SteppedBodyTable = bodyModules;

/**
 * The item-placed modules as the hubs call them.
 */
const steppedItem: SteppedItemTable = itemModules;

/**
 * Tell whether a module reads a source element: the element is in the module's namespace under
 * the module's local name.
 *
 * @param module The module.
 * @param element The element.
 * @returns Whether the module reads it.
 */
const reads = (
  module: { readonly element: string; readonly namespace: string },
  element: SourceElement,
): boolean => module.namespace === element.namespace && module.element === element.local;

/**
 * Find the body-placed module that reads a body element.
 *
 * @param element The element.
 * @returns The module, none when no body-placed module reads the element.
 */
export const bodyModuleFor = (element: SourceElement): Option.Option<BodyPlacedModule> =>
  Option.fromUndefinedOr(Object.values(bodyModules).find((module) => reads(module, element)));

/**
 * Find the item-placed module that reads an item root child.
 *
 * @param element The element.
 * @returns The module, none when no item-placed module reads the element.
 */
export const itemModuleFor = (element: SourceElement): Option.Option<ItemPlacedModule> =>
  Option.fromUndefinedOr(Object.values(itemModules).find((module) => reads(module, element)));

/**
 * Read a body element through the module of one element: the element as its module normalises it,
 * then parsed into the module's node, placed in the body as a content node at the
 * element's path.
 *
 * @template E The element.
 * @param element The module's element.
 * @param source The source element.
 * @param context The parse context the body walk built for the source element.
 * @returns The content node.
 */
const parseWith = <E extends BodyContentElement>(
  element: E,
  source: SourceElement,
  context: ParseContext,
): ContentNodeOf<E, NodeOf<BodyModules[E]>> => {
  const module = steppedBody[element];

  return pipe(module.parse(module.normalise(source), context), (node) => ({
    element,
    kind: "content",
    node,
    path: context.path,
  }));
};

/**
 * Read a body element a body-placed module reads, by that module's `parse`, after its `normalise`:
 * one case per element, each parsing at its own element, so the node is the member of its element;
 * no case names a module's fields, so a module that lands changes none.
 *
 * @param module The module that reads the element ({@link bodyModuleFor}).
 * @param source The source element.
 * @param context The parse context the body walk built for it.
 * @returns The content node.
 */
export const parseBodyContent = (
  module: BodyPlacedModule,
  source: SourceElement,
  context: ParseContext,
): ContentNode => {
  switch (module.element) {
    case "math": {
      return parseWith("math", source, context);
    }
    case "qti-rubric-block": {
      return parseWith("qti-rubric-block", source, context);
    }
  }
};

/**
 * Decide what the redacted item keeps of a content node of one element, its module's `redact`: the
 * node with what it kept, at the same element and path, or none to drop it.
 *
 * @template E The element.
 * @param node The node.
 * @param kit The redaction's walk and this render's facts.
 * @returns The node kept, or none.
 */
const redactWith = <E extends BodyContentElement>(
  node: ContentNodeOf<E, NodeOf<BodyModules[E]>>,
  kit: ContentRedactKit,
): Option.Option<ContentNodeOf<E, NodeOf<BodyModules[E], RedactedLevel>>> =>
  Option.map(steppedBody[node.element].redact(node.node, kit), (kept) => ({
    element: node.element,
    kind: "content",
    node: kept,
    path: node.path,
  }));

/**
 * Give the payload node of a content node of one element the redaction kept, its module's
 * `copy`, at its element.
 *
 * @template E The element.
 * @param node The node, as the redacted body holds it.
 * @returns The payload node.
 */
const copyWith = <E extends BodyContentElement>(
  node: ContentNodeOf<E, NodeOf<BodyModules[E], RedactedLevel>>,
): ContentPayloadOf<E, CopyOf<BodyModules[E]>> => ({
  element: node.element,
  kind: "content",
  payload: steppedBody[node.element].copy(node.node),
});

/**
 * Decide what the redacted item keeps of a content node, by its element's module's `redact`: one
 * case per element, each at its own element, so the node kept is the member of its element; no
 * case names a module's fields.
 *
 * @param node The content node.
 * @param kit The redaction's walk and this render's facts.
 * @returns The node kept, or none.
 */
export const redactContent = (
  node: ContentNode,
  kit: ContentRedactKit,
): Option.Option<ContentNode<RedactedLevel>> => {
  switch (node.element) {
    case "math": {
      return redactWith(node, kit);
    }
    case "qti-rubric-block": {
      return redactWith(node, kit);
    }
  }
};

/**
 * Give the payload node of a content node of the redacted body, by its element's module's `copy`:
 * one case per element, each at its own element.
 *
 * @param node The content node, as the redacted body holds it.
 * @returns The payload node.
 */
export const copyContent = (node: ContentNode<RedactedLevel>): ContentPayload => {
  switch (node.element) {
    case "math": {
      return copyWith(node);
    }
    case "qti-rubric-block": {
      return copyWith(node);
    }
  }
};

/**
 * Give the body content a content node's payload holds, through its module's `content`: what the
 * server shell writes as it writes the body, so its asset check
 * and its heading shift read it.
 *
 * @template E The node's element.
 * @param node The payload node.
 * @returns Its body content, in document order.
 */
export const contentNodes = <E extends BodyContentElement>(
  node: ContentPayloadOf<E, CopyOf<BodyModules[E]>>,
): Nodes<RedactedLevel> => steppedBody[node.element].content(node.payload);

/**
 * Decide what the redacted item keeps of the nodes an item-placed module read from one element,
 * each through its `redact`, in document order.
 *
 * @template E The element.
 * @param element The element.
 * @param content The item's content.
 * @param kit The redaction's walk, this render's facts and the redacted body's catalog references.
 * @returns The nodes kept.
 */
const keptOf = <E extends ItemContentElement>(
  element: E,
  content: { readonly [X in E]: readonly ItemNodeOf<ItemModules[X]>[] },
  kit: ItemRedactKit,
): readonly KeptNodeOf<ItemModules[E]>[] => {
  const module = steppedItem[element];

  return content[element].flatMap((node) => Option.toArray(module.redact(node, kit)));
};

/**
 * Decide what the redacted item keeps of the nodes the item-placed modules read, each node
 * through its module's `redact`, in the modules' order and each element's in document order.
 *
 * @param content The item's content.
 * @param kit The redaction's walk, this render's facts and the redacted body's catalog references.
 * @returns The content kept, by element, every element's list empty where it kept none.
 */
export const redactItemContent = (content: ItemNodesHeld, kit: ItemRedactKit): ItemNodesKept => ({
  "qti-assessment-stimulus-ref": keptOf("qti-assessment-stimulus-ref", content, kit),
  "qti-catalog-info": keptOf("qti-catalog-info", content, kit),
  "qti-companion-materials-info": keptOf("qti-companion-materials-info", content, kit),
});

/**
 * Copy the nodes an item-placed module read from one element into their payload nodes, through
 * its `copy`.
 *
 * @template E The element.
 * @param element The element.
 * @param content The redacted item's content.
 * @returns The payload nodes, in document order.
 */
const copiedOf = <E extends ItemContentElement>(
  element: E,
  content: { readonly [X in E]: readonly KeptNodeOf<ItemModules[X]>[] },
): readonly CopyOf<ItemModules[E]>[] => {
  const module = steppedItem[element];

  return content[element].map((node) => module.copy(node));
};

/**
 * Copy the content a redacted item holds into the payload's, each node through its module's
 * `copy`, each element's in document order.
 *
 * @param content The redacted item's content.
 * @returns The payload content, by element, every element's list empty where the redacted item
 *   holds none of it.
 */
export const copyItemContent = (content: ItemNodesKept): ItemPayloadsHeld => ({
  "qti-assessment-stimulus-ref": copiedOf("qti-assessment-stimulus-ref", content),
  "qti-catalog-info": copiedOf("qti-catalog-info", content),
  "qti-companion-materials-info": copiedOf("qti-companion-materials-info", content),
});

/**
 * Give the body content the payload nodes of one item-placed module's element hold, through its
 * `content`.
 *
 * @template E The element.
 * @param element The element.
 * @param content The payload's content.
 * @returns The nodes' body content, in document order.
 */
const itemElementNodes = <E extends ItemContentElement>(
  element: E,
  content: { readonly [X in E]: readonly CopyOf<ItemModules[X]>[] },
): Nodes<RedactedLevel> => {
  const module = steppedItem[element];

  return content[element].flatMap((node) => module.content(node));
};

/**
 * Give the body content the payload holds of the item-placed modules' elements, each node through
 * its module's `content`, in the modules' order and each element's in document order: what the
 * server shell writes of them as it writes the body, so its asset check and its heading shift read
 * it, a catalog card's among it.
 *
 * @param content The payload's content.
 * @returns The body content, in order.
 */
export const itemContentNodes = (content: ItemPayloadsHeld): Nodes<RedactedLevel> =>
  Object.values(itemModules).flatMap((module) => itemElementNodes(module.element, content));

/**
 * The namespaces outside QTI's whose islands leave a document unchecked, each with its reason.
 * SSML's is the one: no module reads SSML, so the body walk gives an SSML element the notice it
 * gives any element of a namespace it does not read, and a document that holds one is left
 * unchecked rather than built. MathML's is not among them, since the MathML module checks each
 * `math` against MathML 3's structural rules as it parses it.
 */
const uncheckedNamespaces: ReadonlyMap<string, UncheckedReason["reason"]> = new Map([
  [ssmlNamespace, "ssml"],
]);

/**
 * Judge an island of a namespace outside QTI's for the verdict: the reasons plate cannot judge the
 * document for it ({@link uncheckedNamespaces}), none for an island of any other namespace.
 *
 * @param island The island's outermost element.
 * @param path The element's path.
 * @returns The reasons the document stays unchecked, each at the island's path.
 */
export const checkIsland = (island: SourceElement, path: string): readonly UncheckedReason[] =>
  Option.match(Option.fromUndefinedOr(uncheckedNamespaces.get(island.namespace)), {
    onNone: () => [],
    onSome: (reason) => [{ path, reason }],
  });
