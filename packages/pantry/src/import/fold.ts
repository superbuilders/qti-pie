/**
 * The host's one fold of a document's tree fields: the values the laws derive along the tree, which
 * the importer writes on every `Node` row (the W5 amendment's §C) and the overlay builders read.
 *
 * Each node folds from its parent's fold and its predecessor sibling's state:
 *
 * - `ancestry`, its parent's with the flags its kind enters (`E1_derived`), the document node's its
 *   context's;
 * - `nearest`, `nearestPath` and `nearestKind`, its parent where the parent is an interaction, else
 *   its parent's (N8), the document node's its context's (spec reading `fragment-placement`): a
 *   position in the folded document, or in the document at `nearestPath` where the context gives
 *   it;
 * - `state`, its content-automaton state (C5, N5), the document node's 0;
 * - `elements`, the elements among its parent's children up to it, itself included where it is one,
 *   the document node's 0, and `elementChildren`, the elements among its own children, which the
 *   rules over a query that count an element's children read from `Node`.
 *
 * An import flattens and folds each document once ({@link DocumentView}), and every row builder
 * reads that one view. The law oracle folds the same fields with its own fold
 * (`#pantry/model/folds.ts`), so the two implementations stay apart and a host-against-oracle
 * differential compares them.
 */
import { Match, Option } from "effect";
import type { Kind, Name } from "#pantry/grammar/compose.ts";
import { placedStep, placementOf } from "#pantry/grammar/content.ts";
import type { Placement } from "#pantry/grammar/content.ts";
import {
  Enters,
  GoverningOf,
  grammar,
  interactionKinds,
  nonElementKinds,
} from "#pantry/grammar/install.ts";
import type { Flag } from "#pantry/grammar/install.ts";
import type { DocumentContext } from "#pantry/import/context.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { flatten } from "#pantry/model/xdm.ts";
import type { AttributeRow, FlatRows, NodeRow, XdmDocument } from "#pantry/model/xdm.ts";

/**
 * An ancestry flag's handle.
 */
type FlagHandle = (typeof Flag.handles)[number];

/**
 * What one node folds to. `nearest` is its nearest interaction's position, in the folded document
 * where `nearestPath` is none: an ancestor there, or its document node where it has no interaction
 * among its ancestors and no site places the document in one. Where its chain of nearest reaches
 * its document node and a site places the document in an interaction, that interaction is in the
 * document at `nearestPath`, the context's (`Document.contextPath`).
 */
export interface Folded {
  readonly ancestry: ReadonlySet<FlagHandle>;
  readonly elementChildren: bigint;
  readonly elements: bigint;
  /**
   * The node's own kind, which steps its children's automaton and names their nearest interaction.
   */
  readonly kind: Kind;
  readonly nearest: bigint;
  readonly nearestKind: Kind;
  readonly nearestPath: Option.Option<string>;
  readonly state: number;
}

/**
 * What the fold keeps of a node for its children: its fold, before its own children are counted.
 */
type Held = Omit<Folded, "elementChildren">;

/**
 * What the fold keeps of a node's children so far, its cursor as each child is folded: the state
 * of the child folded last, {@link startState} before the first, and the elements among them.
 */
interface Under {
  elements: bigint;
  state: number;
}

/**
 * The installed `GoverningOf`, by the key text of its `(kind, governs)`.
 */
const governorAt: ReadonlyMap<string, string> = new Map(
  GoverningOf.rows.map(({ governor, governs, kind }) => [keyTextOf(kind, governs), governor]),
);

/**
 * Read a node's governor, `Node.governor`: what its attributes and text are judged under, as the
 * law states it (`typeGovernorOf` of `#pantry/qti/node.ts`, and `E1_derived` on `Node`). Under a
 * named type it is `GoverningOf`'s of (kind, type); with no type, and under a type
 * `GoverningOf` holds no row of (an `xsi:type` its kind's declared type does not derive, which
 * `XsiType derived` refuses), its kind's own, `KindGovernor`'s, which spells the kind's handle
 * (`#pantry/grammar/install.ts` `Governor`: each `NodeKind` handle first).
 *
 * @param kind - The node's kind.
 * @param governs - Its governing type, none where no named type governs it.
 * @returns The governor's `Governor` handle.
 */
export const governorOf = (kind: string, governs: Option.Option<string>): string =>
  Option.match(
    governs.pipe(
      Option.flatMap((type) => Option.fromNullishOr(governorAt.get(keyTextOf(kind, type)))),
    ),
    { onNone: () => kind, onSome: (governor) => governor },
  );

/**
 * The installed `Enters`, the flags each node kind enters for its descendants, by kind: a kind that
 * enters none holds no group.
 */
const entersAt: ReadonlyMap<Kind, readonly FlagHandle[]> = new Map(
  [...Map.groupBy(Enters.rows, ({ kind }) => kind)].map(
    ([kind, rows]) => [kind, rows.map(({ flag }) => flag)] as const,
  ),
);

/**
 * Read the flags a node's kind enters for its descendants.
 *
 * @param kind - The node's kind.
 * @returns Its flags, none for a kind that enters none.
 */
const flagsEnteredBy = (kind: Kind): readonly FlagHandle[] => entersAt.get(kind) ?? [];

/**
 * The interaction kinds, whose children take them as their nearest interaction (N8).
 */
const interactions: ReadonlySet<string> = new Set(interactionKinds);

/**
 * The kinds that are no element, which the element counts step over.
 */
const nonElements: ReadonlySet<string> = new Set(nonElementKinds);

/**
 * The state a family's automaton starts in, before its first member: position 0, the family's
 * model as a whole (`#pantry/grammar/content.ts`, `ContentGrammar`'s positions), which
 * `placedStep` steps a first member from, and the document node's own state.
 */
const startState = 0;

/**
 * The state a member claims by its placement: an `at` member's one position, a `carries` member's
 * predecessor's, and a `shared` member's predecessor's where that is one of its positions, else its
 * first. It is the state written where no position follows, so that `N5_Follow` refuses the member
 * by name; a `carries` member always steps to it.
 *
 * A `shared` member reaches its claim only when none of its positions follows, since no state lets
 * two of them follow (`content.test.ts`, "decide every child's position"), so `N5_Follow` refuses
 * it whichever it claims. Claiming its predecessor's state leaves the family's automaton where it
 * was, as the law oracle folds the family with the member set aside (`src/test/oracle.ts`
 * `foldedOf`), so no later sibling and no owner's `lastState` reads a state the member alone
 * reached. Its first position does not: the third `m:mi` of an `m:mfrac` would claim the
 * numerator's position, where the model does not end, so the owner's row would break `N7_Last`
 * beside the member's `N5_Follow`, and the refusal would name whichever row PostgreSQL meets first.
 *
 * @param placement - The member's placement.
 * @param was - Its predecessor's state, {@link startState} for the first member.
 * @returns The state.
 */
const claimedState = (placement: Placement, was: number): number =>
  Match.valueTags(placement, {
    at: ({ position }) => position,
    carries: () => was,
    shared: ({ positions }) => (positions.includes(was) ? was : positions[0]),
  });

/**
 * Compute a member's content-automaton state (C5), the value N5 holds it to.
 *
 * `placedStep` gives the lawful state where there is one. Where there is none, the state is still
 * written, and a law refuses the node by name: an unadmitted kind keeps its predecessor's state,
 * which `N5_admitted` refuses; a kind whose position does not follow keeps the state its placement
 * claims ({@link claimedState}), which `N5_Follow` refuses.
 *
 * @param key - The parent's kind and the member's.
 * @param key.child - The member's kind.
 * @param key.parent - The parent's kind.
 * @param was - Its predecessor's state, {@link startState} for the first member.
 * @returns The state.
 */
const stateOf = (
  key: {
    readonly child: string;
    readonly parent: string;
  },
  was: number,
): number =>
  Option.match(placementOf(grammar, key), {
    onNone: () => was,
    onSome: (placement) =>
      Option.getOrElse(placedStep(grammar.content, key, placement, was), () =>
        claimedState(placement, was),
      ),
  });

/**
 * The position of a document's document node, `flatten`'s node 0, which is its own parent.
 */
const documentStart = 0n;

/**
 * The context of a document no site names, its fold's seed: no ancestry, and its own document node
 * as its nearest, of kind `document`.
 */
export const ownContext: DocumentContext = {
  ancestry: new Set(),
  nearest: documentStart,
  nearestKind: "document",
  nearestPath: Option.none(),
};

/**
 * The key a document's folds are held under in {@link Folds}: this module's alone, so no reader but
 * {@link foldAt} reaches them.
 */
const byNode: unique symbol = Symbol("folds");

/**
 * A document's folds, as {@link foldOf} gives them: opaque, each node's read by {@link foldAt}, the
 * one reader, which is total.
 */
export interface Folds {
  readonly [byNode]: ReadonlyMap<bigint, Folded>;
}

/**
 * Read one node's fold: total, since {@link foldOf} folds every node it is given or throws.
 *
 * @param folds - A document's folds, as {@link foldOf} gives them.
 * @param start - The position of a node of that document.
 * @returns The node's fold.
 * @throws {Error} When the document holds no node there: a defect of the caller, which read a node
 *   of one document in another's folds.
 */
export const foldAt = (folds: Folds, start: bigint): Folded => {
  const folded = folds[byNode].get(start);
  if (folded === undefined) {
    throw new Error(
      `The folded document holds no node at ${String(start)}, and foldOf folds every node it is given. Read each node in the folds of its own document.`,
    );
  }

  return folded;
};

/**
 * Fold a document's nodes under its context.
 *
 * The nodes come in document order, so each node's parent is folded before it, and its siblings
 * before it in slot order. The document node, its own parent, folds from the context alone; every
 * other node from its parent's fold and the state of the parent's child folded last,
 * {@link startState} for its first child.
 *
 * @param nodes - The document's node rows as `flatten` writes them, in document order.
 * @param context - The document's context.
 * @returns Each node's fold, which {@link foldAt} reads.
 * @throws {Error} When a node comes before its parent, which `flatten`'s document order rules out:
 *   a defect of the caller, never of the document.
 */
/**
 * GRIZZLE-PENDING: Q11, folds stepped by a closed relation, lets the database draw state. ancestry
 * and nearest stay the host's: a document node's are its Document's context, from outside its tree
 * (spec reading `fragment-placement`), and grizzle pins a root's copies at their start.
 */
export const foldOf = (nodes: readonly NodeRow<Composed>[], context: DocumentContext): Folds => {
  const folded = new Map<bigint, { readonly held: Held; readonly under: Under }>();

  for (const node of nodes) {
    const { kind, start } = node;
    if (node.parent === start) {
      folded.set(start, {
        held: {
          ancestry: context.ancestry,
          elements: 0n,
          kind,
          nearest: context.nearest,
          nearestKind: context.nearestKind,
          nearestPath: context.nearestPath,
          state: startState,
        },
        under: { elements: 0n, state: startState },
      });
      continue;
    }

    const parentFold = folded.get(node.parent);
    if (parentFold === undefined) {
      throw new Error(
        `The node at ${String(start)} comes before its parent at ${String(node.parent)}, but a document's nodes are folded in document order. Fold flatten's rows as it writes them.`,
      );
    }

    const { held: parent, under } = parentFold;
    const fromInteraction = interactions.has(parent.kind);
    under.state = stateOf({ child: kind, parent: parent.kind }, under.state);
    under.elements += nonElements.has(kind) ? 0n : 1n;
    folded.set(start, {
      held: {
        ancestry: new Set([...parent.ancestry, ...flagsEnteredBy(kind)]),
        elements: under.elements,
        kind,
        nearest: fromInteraction ? node.parent : parent.nearest,
        nearestKind: fromInteraction ? parent.kind : parent.nearestKind,
        nearestPath: fromInteraction ? Option.none() : parent.nearestPath,
        state: under.state,
      },
      under: { elements: 0n, state: startState },
    });
  }

  return {
    [byNode]: new Map(
      [...folded].map(([at, { held, under }]) => [
        at,
        { ...held, elementChildren: under.elements },
      ]),
    ),
  };
};

/**
 * A document's closed attributes, each element's by their name: `Attribute`'s key within its
 * document, `(start, name)`, since an element writes each closed name once (Namespaces in XML 1.0,
 * §6.3). It is read by any name of the roster; an open class's names no closed attribute.
 */
export type AttributeIndex = ReadonlyMap<bigint, ReadonlyMap<Name, AttributeRow<Composed>>>;

/**
 * A document flattened: its rows as `flatten` writes them, each node at its position, and its
 * closed attributes by their element and name, indexed once ({@link flatDocumentOf}). The contexts
 * read it before the document is judged (`#pantry/import/context.ts`), and its view holds the same
 * value after.
 */
export interface FlatDocument {
  readonly attributes: AttributeIndex;
  readonly rows: FlatRows<Composed>;
}

/**
 * Flatten a document's tree and index its closed attributes, once per document.
 *
 * @param tree - The document's tree, as shred gives it.
 * @returns The document flattened.
 */
export const flatDocumentOf = (tree: XdmDocument<Composed>): FlatDocument => {
  const rows = flatten(tree);

  return {
    attributes: new Map(
      [...Map.groupBy(rows.attributes, ({ start }) => start)].map(
        ([start, held]) => [start, new Map(held.map((row) => [row.name, row]))] as const,
      ),
    ),
    rows,
  };
};

/**
 * One document as every row builder reads it: its tree, the document flattened, and the nodes'
 * folds under the context it is judged in. An import builds one view per document ({@link viewOf})
 * and hands that one value to the tree's writer and to every overlay builder, so each document is
 * flattened, indexed and folded once and every row names each node by the same position.
 */
export interface DocumentView extends FlatDocument {
  readonly context: DocumentContext;
  readonly folds: Folds;
  readonly tree: XdmDocument<Composed>;
}

/**
 * Read an element's attribute of one closed name: its row as written, none where the element
 * writes none. Every overlay builder reads a document's attributes here, through its view's one
 * index.
 *
 * @param view - The document, by its index.
 * @param start - The element's position.
 * @param name - The attribute's name.
 * @returns The attribute's row.
 */
export const attributeOf = (
  view: Pick<DocumentView, "attributes">,
  start: bigint,
  name: Name,
): Option.Option<AttributeRow<Composed>> =>
  Option.fromUndefinedOr(view.attributes.get(start)?.get(name));

/**
 * Read an element's attribute of one closed name as written: its lexical form, none where the
 * element writes none ({@link attributeOf}).
 *
 * @param view - The document, by its index.
 * @param start - The element's position.
 * @param name - The attribute's name.
 * @returns The lexical form.
 */
export const lexicalOf = (
  view: Pick<DocumentView, "attributes">,
  start: bigint,
  name: Name,
): Option.Option<string> => Option.map(attributeOf(view, start, name), ({ lexical }) => lexical);

/**
 * Fold a flattened document under the context it is judged in.
 *
 * @param tree - The document's tree, as shred gives it.
 * @param flat - The document flattened ({@link flatDocumentOf} of the tree).
 * @param context - The context it is judged in (spec reading `fragment-placement`).
 * @returns Its view.
 */
export const viewOf = (
  tree: XdmDocument<Composed>,
  { attributes, rows }: FlatDocument,
  context: DocumentContext,
): DocumentView => ({ attributes, context, folds: foldOf(rows.nodes, context), rows, tree });

/**
 * View a document no site names: flattened and judged in its own context ({@link ownContext}), as
 * the read judges the manifest and every document it reads before their contexts are known.
 *
 * @param tree - The document's tree, as shred gives it.
 * @returns Its view.
 */
export const ownViewOf = (tree: XdmDocument<Composed>): DocumentView =>
  viewOf(tree, flatDocumentOf(tree), ownContext);
