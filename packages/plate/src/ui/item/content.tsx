/**
 * The server shell's body walk: a redacted item's body nodes as server React elements, the XHTML
 * the author wrote mapped exactly, each notice as plate's Notice part, each feedback block the page
 * shows as plate's Feedback part, each interaction and each module's container handed to the
 * interactions' seam through the item, and each content module's node to its view in
 * `#plate/ui/item/contents/`.
 *
 * It is the one walk of an item's content: the body and each modal feedback through `<Item>`, and
 * an interaction's own content (a prompt, a choice, gap match's sentence) through the seam's
 * `context.content`, so both are written by the same rules. Nothing is written as an HTML string.
 *
 * The seam's files import this one, so it imports none of them: the item hands it the seam's
 * renderers through the walk (the `body` arm of its {@link Scope}: `interaction`, `answer` and
 * `container`). A content view walks what its node holds through
 * {@link ContentWalk.nodes} and imports nothing of this file, so this file imports each view.
 *
 * @module
 */
import { Array as Arr, Option, Predicate } from "effect";
import { createElement, Fragment } from "react";
import type { Attributes, Key, ReactNode } from "react";
import type { MathNode } from "#plate/content/mathml.ts";
import { contentNodes, copyContent } from "#plate/content/modules.ts";
import type { ContentNode } from "#plate/content/modules.ts";
import type { ContainerKind } from "#plate/interactions/contract.ts";
import { message, numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import { isInteraction, regionsOf } from "#plate/model/interactions.ts";
import type {
  BodyElement,
  ContainerNode,
  Interaction,
  RedactedLevel,
  RedactedNode,
} from "#plate/model/item.ts";
import { spokenBefore, spokenWithin } from "#plate/read-aloud/placement.ts";
import type { SpokenControl } from "#plate/read-aloud/placement.ts";
import { feedbackBlockTag } from "#plate/redact/walk.ts";
import type { Glossary, Glossed } from "#plate/ui/item/contents/catalog.tsx";
import { content as mathmlContent, missingInMath } from "#plate/ui/item/contents/mathml.tsx";
import { content as rubricContent } from "#plate/ui/item/contents/rubric.tsx";
import { slotPlan } from "#plate/content/math-slots.ts";
import type { SlotSize } from "#plate/content/math-slots.ts";
import type { Credit, Position, ReadsAloud } from "#plate/ui/item/context.ts";
import { NestedInteraction, UnrenderedNode } from "#plate/ui/item/errors.ts";
import { feedbackBlockOf, isExplanation } from "#plate/ui/item/feedback.tsx";
import {
  headingLevelOf,
  htmlSubset,
  missingIn,
  propsOf,
  takesFlow,
  textless,
  voidElements,
  writtenTag,
} from "#plate/ui/item/html.ts";
import type { Addressing } from "#plate/ui/item/html.ts";
import { collapsedText } from "#plate/model/whitespace.ts";

/**
 * Hand an interaction of the body to the seam: its model node, as the redacted body holds it, and
 * the key it stands under among its siblings.
 */
export type InteractionAt = (interaction: Interaction<RedactedLevel>, key: Key) => ReactNode;

/**
 * What the walk hands a module's container view with the container's node: its children to
 * render, its key, and the walk where it stands.
 */
export interface ContainerWalk {
  /**
   * Render the container's children as the walk renders an element's: each element the walk's
   * way, each interaction through the seam.
   *
   * @returns The children, in order.
   */
  readonly children: () => readonly ReactNode[];
  /**
   * The container's key among its siblings, which the view's root carries.
   */
  readonly key: Key;
  /**
   * The walk where the container stands.
   */
  readonly walk: Walk;
}

/**
 * Hand a module's container to the seam (`renderContainer` in
 * `#plate/ui/item/interactions/index.tsx`): its node, and what the walk gives with it.
 */
export type ContainerAt = (
  node: ContainerNode<ContainerKind, RedactedLevel>,
  walk: ContainerWalk,
) => ReactNode;

/**
 * What the walk hands a content module's view with its payload node: the way to write the nodes
 * the node holds, its key, and the walk where it stands.
 */
export interface ContentWalk {
  /**
   * The node's key among its siblings, which the view's root carries.
   */
  readonly key: Key;
  /**
   * Write body nodes the content node holds, as the walk writes an interaction's own content, so
   * an interaction among them is a defect.
   *
   * @param nodes The body nodes, in document order.
   * @returns The nodes, in order.
   */
  readonly nodes: (nodes: readonly RedactedNode[]) => readonly ReactNode[];
  /**
   * The walk where the node stands.
   */
  readonly walk: Walk;
}

/**
 * What the walk carries into every node, and where those nodes stand.
 */
export interface Walk {
  readonly addressing: Addressing;
  /**
   * The credit the attempt shown earned, which each feedback part carries ({@link feedbackOf}):
   * the redacted item's `credit`.
   */
  readonly credit: Option.Option<Credit>;
  /**
   * The amount added to an authored heading's level ({@link headingOffsetOf}).
   */
  readonly headingOffset: number;
  readonly locale: Locale;
  /**
   * What the walk renders beyond the HTML subset ({@link Scope}).
   */
  readonly scope: Scope;
  /**
   * The interactions and gaps a formula of the walk draws in its slots, each by the `id` its slot's
   * `xref` names ({@link slotsIn}): the walk writes none of them where it stands, and the formula
   * draws each in its slot (`content` in `#plate/ui/item/contents/mathml.tsx`).
   */
  readonly slots: ReadonlyMap<string, Slotted>;
  /**
   * Read-aloud's control each element of the walk holds after its own content, by the element's
   * path ({@link spokenIn}): none but in a run of an interaction's own content that stands outside
   * every control of the interaction, whose interaction hands the walk read-aloud
   * (`ContentOptions.readAloud` in `#plate/ui/item/context.ts`), as gap match's sentence does.
   */
  readonly spoken: ReadonlyMap<string, ReactNode>;
  readonly standing: Standing;
}

/**
 * An interaction or a gap a formula draws in its slot (`#plate/content/math-slots.ts`): its
 * slot's size, and the interaction as the walk would render it where it stands.
 */
export interface Slotted {
  readonly render: () => ReactNode;
  readonly size: SlotSize;
}

/**
 * No slots, for a walk none of whose formulas draws an interaction: a notice's, the catalog
 * listing's, a modal feedback's; the walk of each run of content fills its own ({@link nodesOf}).
 */
export const noSlots: ReadonlyMap<string, Slotted> = new Map();

/**
 * No control held inside an element, for a walk of the body, which writes its controls before what
 * they read ({@link readAloudBefore}), and of any content but an interaction's that stands outside
 * every control.
 */
export const noSpoken: ReadonlyMap<string, ReactNode> = new Map();

/**
 * What a walk renders beyond the HTML subset, by what it walks:
 *
 * - `body`, the item's body: each interaction and module's container among the nodes through the
 *   seam, the right answer a review writes for an interaction apart from it after the block that
 *   holds it ({@link answersAfter}), nothing where the interaction writes none, the glossary of the
 *   page (`glossaryOf` in `#plate/ui/item/contents/catalog.tsx`), the disclosure it presents after
 *   the block of each term that references a catalog keeping a glossary card, the read-aloud of the
 *   page (`readAloudOf` there), whose control precedes each element at a flow position that
 *   references a catalog keeping a spoken card that gives audio ({@link readAloudBefore}), and the
 *   verdict the review's feedback opens with, where the host handed a credit, with the feedback
 *   block whose run it heads, the first the body shows at a flow position
 *   ({@link firstFeedbackIn}); and the stimulus an element of the body places by
 *   `data-stimulus-idref`, after the element's children;
 * - `owned`, the content of an interaction that owns elements outside the subset
 *   (`ContentOptions.own` in `#plate/ui/item/context.ts`), which it renders;
 * - `plain`, any other content: an interaction's that owns none, a modal feedback's, a disclosure's
 *   or the catalog listing's, where an interaction or a container is a defect, no term is presented
 *   and an element outside the subset is dropped with its subtree.
 */
export type Scope =
  | {
      readonly answer: InteractionAt;
      readonly container: ContainerAt;
      readonly glossary: Glossary;
      readonly interaction: InteractionAt;
      readonly kind: "body";
      readonly readAloud: ReadsAloud;
      /**
       * The stimulus the item places inside an element of its body by `data-stimulus-idref`,
       * written after the element's own children (`placementsOf` in `#plate/ui/item/stimuli.tsx`);
       * none for every other element, and in a stimulus's own body.
       */
      readonly stimulus: (element: BodyElement<RedactedLevel>) => Option.Option<ReactNode>;
      readonly verdict: Option.Option<VerdictAt>;
    }
  | {
      readonly kind: "owned";
      readonly own: (element: BodyElement<RedactedLevel>) => ReactNode;
    }
  | { readonly kind: "plain" };

/**
 * The verdict a review's feedback opens with (`verdictOf` in `#plate/ui/item/feedback.tsx`), and
 * the feedback block whose run of feedback it heads.
 */
export interface VerdictAt {
  readonly at: BodyElement<RedactedLevel>;
  readonly part: ReactNode;
}

/**
 * Where a walk stands: `flow`, where flow content may stand; `phrasing`, where only phrasing
 * content stands, though an element below may hold flow content again; `phrasing-only`, where
 * nothing below may stand at a flow position, since a `p` is open above, which a `div` inside
 * would close in HTML, or the walk started where only phrasing content stands.
 */
type Standing = Position | "phrasing-only";

/**
 * Give the position content stands at where a walk stands, which decides a notice's element and a
 * feedback block's.
 *
 * @param standing Where the walk stands.
 * @returns `flow`, or `phrasing` for both of the phrasing standings.
 */
const positionOf = (standing: Standing): Position => (standing === "flow" ? "flow" : "phrasing");

/**
 * Give an interaction's own content, the nodes it writes through `context.content`: the nodes of
 * its regions (`regionsOf` in `#plate/model/interactions.ts`), its prompt, label, choices and any
 * other content its module holds, in document order.
 *
 * @param interaction The interaction, as the redacted body holds it.
 * @returns Its content's nodes, in document order.
 */
const contentOf = (interaction: Interaction<RedactedLevel>): readonly RedactedNode[] =>
  regionsOf<RedactedLevel>(interaction).flatMap((region) => region.nodes);

/**
 * Give the body content a content module's node holds, through its module's `copy` and
 * `content` (`contentNodes` in `#plate/content/modules.ts`), such as a rubric block's.
 *
 * @param node The content module's node.
 * @returns Its body content, in document order.
 */
const contentBodyOf = (node: ContentNode<RedactedLevel>): readonly RedactedNode[] =>
  contentNodes(copyContent(node));

/**
 * Collect every element among body nodes, at any depth and in document order, each with the tags
 * of the elements it stands inside, outermost first: below each element, in each interaction's own
 * content ({@link contentOf}), and in the body content a content module's node holds, such as a
 * rubric block's. Below an element the walk does not write ({@link writtenTag}) only when
 * `throughDropped` holds, since the walk drops such an element with its subtree.
 *
 * @param nodes The body nodes.
 * @param throughDropped Whether to descend into an element the walk drops.
 * @param within The tags of the elements the nodes stand inside.
 * @returns Each element, with the tags of the elements it stands inside.
 */
const elementsWithin = (
  nodes: readonly RedactedNode[],
  throughDropped: boolean,
  within: readonly string[],
): readonly (readonly [element: BodyElement<RedactedLevel>, within: readonly string[]])[] =>
  nodes.flatMap((node): readonly (readonly [BodyElement<RedactedLevel>, readonly string[]])[] => {
    if (isInteraction(node)) {
      return elementsWithin(contentOf(node), throughDropped, within);
    }

    switch (node.kind) {
      case "element": {
        return throughDropped || writtenTag(node.tag)
          ? [
              [node, within],
              ...elementsWithin(node.children, throughDropped, [...within, node.tag]),
            ]
          : [[node, within]];
      }
      case "container": {
        return elementsWithin(node.children, throughDropped, within);
      }
      case "content": {
        return elementsWithin(contentBodyOf(node), throughDropped, within);
      }
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
 * Collect every element among body nodes, at any depth and in document order, as
 * {@link elementsWithin} does.
 *
 * @param nodes The body nodes.
 * @param throughDropped Whether to descend into an element the walk drops.
 * @returns The elements.
 */
export const elementsIn = (
  nodes: readonly RedactedNode[],
  throughDropped: boolean,
): readonly BodyElement<RedactedLevel>[] =>
  elementsWithin(nodes, throughDropped, []).map(([element]) => element);

/**
 * Give the controls the elements of a run of an interaction's own content hold after their own
 * content, where the run stands outside every control of the interaction: each element the
 * placement gives one (`spokenWithin` in `#plate/read-aloud/placement.ts`), by its tag and the
 * tags of the elements it stands inside, whose catalog keeps a spoken card that gives audio, at
 * any depth, in document order, named `readAloudLabel` by its
 * place among them, so two labels' controls ("least", "greatest") are told apart, and keyed
 * `read-aloud` among the element's children.
 *
 * @param nodes The run's body nodes.
 * @param readAloud The page's read-aloud.
 * @param locale The locale of plate's own text.
 * @returns Each control, by its element's path.
 */
export const spokenIn = (
  nodes: readonly RedactedNode[],
  readAloud: ReadsAloud,
  locale: Locale,
): ReadonlyMap<string, ReactNode> => {
  const held = elementsWithin(nodes, false, []).flatMap(([element, within]) =>
    Option.toArray(
      Option.map(spokenWithin(element, within), (spoken) => [element.path, spoken] as const),
    ),
  );
  const [, controls] = Arr.mapAccum(
    held,
    1,
    (n, [path, { catalog, role }]): readonly [number, readonly (readonly [string, ReactNode])[]] =>
      Option.match(
        readAloud(
          catalog,
          role,
          message(locale, "readAloudLabel", { n: numeral(locale, n) }),
          "read-aloud",
        ),
        { onNone: () => [n, []], onSome: (control) => [n + 1, [[path, control]]] },
      ),
  );

  return new Map(controls.flat());
};

/**
 * Collect every content module's node among body nodes, at any depth and in document order: below
 * each element the walk writes, in each interaction's own content and in each content node's own
 * body content, each before the nodes it holds. The shell checks what a node writes beyond its
 * body content, such as MathML's own URLs, through these.
 *
 * @param nodes The body nodes.
 * @returns The content nodes.
 */
export const contentsIn = (nodes: readonly RedactedNode[]): readonly ContentNode<RedactedLevel>[] =>
  nodes.flatMap((node): readonly ContentNode<RedactedLevel>[] => {
    if (isInteraction(node)) {
      return contentsIn(contentOf(node));
    }

    switch (node.kind) {
      case "element": {
        return writtenTag(node.tag) ? contentsIn(node.children) : [];
      }
      case "container": {
        return contentsIn(node.children);
      }
      case "content": {
        return [node, ...contentsIn(contentBodyOf(node))];
      }
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
 * Find the first file body nodes name that `assets` gives no address, resolved against the
 * document the nodes are written for: a package URL of an element, through the elements a dropped
 * element holds too, then a MathML formula's own URLs, so the page is refused before any of it is
 * written.
 *
 * @param nodes Every body node a document writes.
 * @param addressing The document's location and the assets.
 * @returns The file's path from the package root, or undefined when every file has an address.
 */
export const missingInNodes = (
  nodes: readonly RedactedNode[],
  addressing: Pick<Addressing, "assets" | "document">,
): string | undefined => {
  for (const element of elementsIn(nodes, true)) {
    const path = missingIn(element, addressing);

    if (path !== undefined) {
      return path;
    }
  }

  for (const node of contentsIn(nodes)) {
    const path = node.element === "math" ? missingInMath(node.node, addressing) : undefined;

    if (path !== undefined) {
      return path;
    }
  }

  return undefined;
};

/**
 * Give the amount every authored heading shifts by: the item's shallowest written heading lands at
 * the configured heading level, and every other keeps its distance from it, so an item that starts
 * at `h2` still starts at the level the host gave (the host owns `h1`).
 *
 * @param nodes Every body node the item writes: its body, then its modal feedback's content.
 * @param headingLevel The configured heading level.
 * @returns The offset, 0 for an item with no heading.
 */
export const headingOffsetOf = (nodes: readonly RedactedNode[], headingLevel: number): number => {
  const levels = elementsIn(nodes, false).flatMap((element) => {
    const level = headingLevelOf(element.tag);

    return level === undefined ? [] : [level];
  });

  return levels.length === 0 ? 0 : headingLevel - Math.min(...levels);
};

/**
 * Give the tag an authored element renders as: a heading shifted by the offset and capped at
 * `h6`, any other tag unchanged.
 *
 * @param tag The authored local name.
 * @param headingOffset The amount added to a heading's level.
 * @returns The tag to write.
 */
const tagFor = (tag: string, headingOffset: number): string => {
  const level = headingLevelOf(tag);

  return level === undefined ? tag : `h${String(Math.min(6, level + headingOffset))}`;
};

/**
 * Render plate's Notice part: a note naming a feature plate does not show, in the locale's text.
 *
 * @param feature The feature's key in QTI's own spelling, such as `qti-hottext-interaction`.
 * @param locale The locale of plate's text.
 * @param position Where it stands: a `div` at a flow position, a `span` at a phrasing one.
 * @param key Its key among its siblings, none when it stands alone.
 * @returns The `plate-notice` part.
 */
export const noticeOf = (
  feature: string,
  locale: Locale,
  position: Position,
  key?: Key,
): ReactNode =>
  createElement(
    position === "flow" ? "div" : "span",
    { "data-slot": "plate-notice", key, role: "note" },
    message(locale, "notice", { feature }),
  );

/**
 * Render plate's Feedback part, feedback the item's outcomes show, set apart from the question,
 * with the credit the host graded the attempt by as `data-credit`: one panel for a run of adjacent
 * feedback blocks in their place ({@link feedbackRunOf}), one for the modal feedback after the
 * body, or the review's verdict alone; or a feedback block at a phrasing position, a run of its
 * sentence. Its words are the item's own, but for the verdict and the title of the item's
 * explanation (`#plate/ui/item/feedback.tsx`).
 *
 * @param element Its element: a `div`, a `span` at a phrasing position.
 * @param key Its key among its siblings.
 * @param walk The walk where it stands, whose credit it carries.
 * @param content Its content, rendered.
 * @returns The `plate-feedback` part.
 */
export const feedbackOf = (
  element: "div" | "span",
  key: Key,
  walk: Pick<Walk, "credit">,
  content: readonly ReactNode[],
): ReactNode =>
  createElement(
    element,
    {
      "data-credit": Option.getOrUndefined(walk.credit),
      "data-slot": "plate-feedback",
      key,
    },
    ...content,
  );

/**
 * One child of an element, with its index among the element's children, which keys it.
 */
interface Placed {
  readonly index: number;
  readonly node: RedactedNode;
}

/**
 * Place body nodes at their indices: a table's structure drops whitespace text, which HTML moves
 * out of it.
 *
 * @param nodes The body nodes.
 * @param parent The parent element's tag, none at the top of a walk.
 * @returns The placed nodes, in order.
 */
const placed = (nodes: readonly RedactedNode[], parent?: string): readonly Placed[] =>
  nodes.flatMap((node, index) =>
    parent !== undefined &&
    textless.has(parent) &&
    node.kind === "text" &&
    collapsedText(node.text) === ""
      ? []
      : [{ index, node }],
  );

/**
 * Tell whether a placed node is an element of a tag.
 *
 * @param entry The placed node.
 * @param tag The tag.
 * @returns Whether its node is an element of that tag.
 */
const isTag = (entry: Placed, tag: string): boolean =>
  entry.node.kind === "element" && entry.node.tag === tag;

/**
 * The wrapper the HTML parser opens around each run of a table's direct children of a tag: a
 * `tbody` around rows, a `colgroup` around columns.
 */
const tableWrappers: readonly (readonly [member: string, wrapper: string])[] = [
  ["tr", "tbody"],
  ["col", "colgroup"],
];

/**
 * A feedback block the page shows, placed among its siblings.
 */
interface PlacedBlock {
  readonly index: number;
  readonly node: BodyElement<RedactedLevel>;
}

/**
 * Placed nodes as a walk at a flow position renders them: each node alone, or a run of adjacent
 * feedback blocks the page shows, which stand in one Feedback part.
 */
type Run =
  | { readonly entry: Placed; readonly kind: "node" }
  | {
      readonly blocks: Arr.NonEmptyReadonlyArray<PlacedBlock>;
      readonly kind: "feedback";
    };

/**
 * Give a placed node as a feedback block the page shows, when it is one.
 *
 * @param entry The placed node.
 * @returns The block, or none.
 */
const blockOf = ({ index, node }: Placed): Option.Option<PlacedBlock> =>
  node.kind === "element" && node.tag === feedbackBlockTag
    ? Option.some({ index, node })
    : Option.none();

/**
 * Group placed nodes into runs: each run of feedback blocks adjacent to one another, with nothing
 * between them but whitespace, which the run drops, is one run; every other node is its own.
 * Whitespace after a run's last block stays after it.
 *
 * @param entries The placed nodes, in order.
 * @returns The runs, in order.
 */
const runsOf = (entries: readonly Placed[]): readonly Run[] => {
  const runs: Run[] = [];
  let blocks: PlacedBlock[] = [];
  let between: Placed[] = [];
  const close = (): void => {
    if (Arr.isArrayNonEmpty(blocks)) {
      runs.push({ blocks, kind: "feedback" });
    }

    runs.push(...between.map((entry): Run => ({ entry, kind: "node" })));
    blocks = [];
    between = [];
  };

  for (const entry of entries) {
    const block = blockOf(entry);

    if (Option.isSome(block)) {
      between = [];
      blocks.push(block.value);
    } else if (
      blocks.length > 0 &&
      entry.node.kind === "text" &&
      collapsedText(entry.node.text) === ""
    ) {
      between.push(entry);
    } else {
      close();
      runs.push({ entry, kind: "node" });
    }
  }

  close();

  return runs;
};

/**
 * Render placed nodes in order; at a flow position each run of adjacent feedback blocks the page
 * shows stands in one Feedback part ({@link feedbackRunOf}).
 *
 * @param entries The placed nodes.
 * @param walk What the walk carries.
 * @returns The rendered nodes.
 */
const renderedOf = (entries: readonly Placed[], walk: Walk): readonly ReactNode[] =>
  walk.standing === "flow"
    ? runsOf(entries).map((run) =>
        run.kind === "node"
          ? nodeOf(run.entry.node, run.entry.index, walk)
          : feedbackRunOf(run.blocks, walk),
      )
    : entries.map(({ index, node }) => nodeOf(node, index, walk));

/**
 * Render a run of adjacent feedback blocks the page shows at a flow position as one Feedback part,
 * in their place, so the blocks the attempt shows read as one panel rather than a card each: the
 * review's verdict first where the run holds the body's first feedback block (the `verdict` of
 * {@link Scope}'s `body` arm), then each block in the author's order, the item's explanation after
 * its title (`feedbackBlockOf` in `#plate/ui/item/feedback.tsx`). The blocks' content and
 * visibility are the item's: the run only groups and titles them.
 *
 * @param blocks The blocks, in order.
 * @param walk The walk where they stand.
 * @returns The `plate-feedback` part.
 */
const feedbackRunOf = (blocks: Arr.NonEmptyReadonlyArray<PlacedBlock>, walk: Walk): ReactNode => {
  const [first] = blocks;
  const verdict =
    walk.scope.kind === "body"
      ? walk.scope.verdict.pipe(Option.filter(({ at }) => at === first.node))
      : Option.none();

  return feedbackOf("div", `feedback-${String(first.index)}`, walk, [
    ...verdict.pipe(
      Option.map(({ part }) => part),
      Option.toArray,
    ),
    ...blocks.flatMap(({ index, node }) =>
      feedbackBlockOf(
        "div",
        index,
        isExplanation(node),
        Option.none(),
        walk.locale,
        renderedOf(placed(node.children), walk),
      ),
    ),
  ]);
};

/**
 * Render a table's children, each run of rows in a `tbody` and each run of columns in a
 * `colgroup`, as the HTML parser would place them, so the server's elements hydrate as
 * themselves.
 *
 * @param entries The table's children, whitespace already dropped.
 * @param walk The walk below the table.
 * @returns The rendered children.
 */
const tableChildren = (entries: readonly Placed[], walk: Walk): readonly ReactNode[] => {
  const result: ReactNode[] = [];
  let run: Placed[] = [];
  let wrapper: string | undefined;
  const close = (): void => {
    const [first] = run;

    if (wrapper !== undefined && first !== undefined) {
      result.push(
        createElement(wrapper, { key: `${wrapper}-${String(first.index)}` }, renderedOf(run, walk)),
      );
    }

    run = [];
    wrapper = undefined;
  };

  for (const entry of entries) {
    const row = tableWrappers.find(([member]) => isTag(entry, member));

    if (row === undefined) {
      close();
      result.push(...renderedOf([entry], walk));
    } else {
      const [, around] = row;

      if (around !== wrapper) {
        close();
        wrapper = around;
      }

      run.push(entry);
    }
  }

  close();

  return result;
};

/**
 * Give where the content below an element stands: `phrasing-only` below a `p` and anywhere
 * already `phrasing-only`, else `flow` below an element that takes flow content
 * ({@link takesFlow}), else `phrasing`.
 *
 * @param tag The element's local name.
 * @param standing Where the element stands.
 * @returns Where its children stand.
 */
const standingBelow = (tag: string, standing: Standing): Standing => {
  if (standing === "phrasing-only" || tag === "p") {
    return "phrasing-only";
  }

  return takesFlow(tag) ? "flow" : "phrasing";
};

/**
 * Give the nodes an element at a flow position is the nearest block of: every node below it the
 * walk writes at a phrasing position, in document order, reached through phrasing positions alone.
 * The walk below an element is where {@link standingBelow} stands it, a feedback block's content
 * and a module's container's children stand where the block or container does, and a content
 * node's body where the node does. It stops at a node that stands at a flow position again, such as
 * a table cell's content below the phrasing of its row, since that node, or the block it is, is
 * the nearest block of what it holds, and at an interaction, whose own content is walked apart. So
 * each node below a block has one nearest block, and whatever a block writes after itself for the
 * nodes it holds, a right answer or a glossary disclosure, is written once.
 *
 * @param nodes The nodes, as the redacted body holds them.
 * @param standing Where they stand.
 * @returns The nodes, in document order.
 */
const heldBelow = (nodes: readonly RedactedNode[], standing: Standing): readonly RedactedNode[] =>
  positionOf(standing) === "flow"
    ? []
    : nodes.flatMap((node): readonly RedactedNode[] => {
        if (isInteraction(node)) {
          return [node];
        }

        switch (node.kind) {
          case "element": {
            if (node.tag === feedbackBlockTag) {
              return [node, ...heldBelow(node.children, standing)];
            }

            return htmlSubset.has(node.tag)
              ? [node, ...heldBelow(node.children, standingBelow(node.tag, standing))]
              : [];
          }
          case "container": {
            return [node, ...heldBelow(node.children, standing)];
          }
          case "content": {
            return [node, ...heldBelow(contentBodyOf(node), standing)];
          }
          case "text":
          case "unsupported": {
            return [node];
          }
          default: {
            return node satisfies never;
          }
        }
      });

/**
 * Give the terms an element at a flow position owns, whose disclosures follow it: the element
 * itself when it references a catalog, and each term it is the nearest block of
 * ({@link heldBelow}).
 *
 * @param element The element.
 * @param inner The walk below it, whose position its children stand at.
 * @returns The terms, in document order.
 */
const ownedTerms = (
  element: BodyElement<RedactedLevel>,
  inner: Walk,
): readonly BodyElement<RedactedLevel>[] =>
  [element, ...heldBelow(element.children, inner.standing)].flatMap((node) =>
    node.kind === "element" && node.catalog !== undefined ? [node] : [],
  );

/**
 * Keep a rendered node that writes something.
 *
 * @param node The node.
 * @returns The node, or none for `null` and `undefined`, which write nothing.
 */
const writtenOf = (node: ReactNode): readonly ReactNode[] =>
  node === null || node === undefined ? [] : [node];

/**
 * Give the right answers that follow an element at a flow position, each the seam writes for an
 * interaction apart from it (`answer` in {@link Scope}'s `body` arm): the answer of each interaction
 * the element is the nearest block of ({@link heldBelow}), in document order, as with the
 * glossary's terms ({@link ownedTerms}). A `p` holding a Text Entry is such an element, so the Text
 * Entry's right answer follows the paragraph and the sentence keeps its shape; a table is none for
 * a Text Entry in one of its cells, which stands at a flow position, its own block, and writes its
 * answer there.
 *
 * @param element The element.
 * @param inner The walk below it, whose position its children stand at.
 * @param walk The walk where it stands, which renders the answers.
 * @returns The answers written, in document order.
 */
const answersAfter = (
  element: BodyElement<RedactedLevel>,
  inner: Walk,
  walk: Walk,
): readonly ReactNode[] => {
  if (walk.scope.kind !== "body") {
    return [];
  }

  const { answer } = walk.scope;

  return heldBelow(element.children, inner.standing)
    .filter(isInteraction)
    .flatMap((interaction, index) => writtenOf(answer(interaction, `answer-${String(index)}`)));
};

/**
 * Give the glossary's disclosures that follow an element at a flow position: one for each term it
 * owns ({@link ownedTerms}) that references a card the glossary keeps, none in a walk with no
 * glossary.
 *
 * @param element The element.
 * @param inner The walk below it, whose position its children stand at.
 * @param walk The walk where it stands.
 * @returns The disclosures, in document order.
 */
const disclosuresAfter = (
  element: BodyElement<RedactedLevel>,
  inner: Walk,
  walk: Walk,
): readonly ReactNode[] => {
  if (walk.scope.kind !== "body") {
    return [];
  }

  const { glossary } = walk.scope;
  const after: Walk = {
    addressing: walk.addressing,
    credit: walk.credit,
    headingOffset: walk.headingOffset,
    locale: walk.locale,
    scope: { kind: "plain" },
    slots: noSlots,
    spoken: noSpoken,
    standing: "flow",
  };

  return ownedTerms(element, inner).flatMap((term, index) =>
    Option.toArray(
      Option.map(glossary(term), (presented) =>
        presented.disclosure(
          (content) => renderedOf(placed(content), after),
          `glossary-${String(index)}`,
        ),
      ),
    ),
  );
};

/**
 * Give read-aloud's control for an element of the body at a flow position that references a
 * catalog keeping a spoken card that gives audio, which precedes the element as its previous
 * sibling, so it stands at the top of what it reads, as AlphaTest's player put a question's and a
 * passage's control: where flow content may stand, a `span` may, so the page stays valid whatever
 * the element is.
 * None in a walk with no read-aloud, a walk of an interaction's own content among them, whose
 * Choice writes its choices' controls itself, and whose other parts stand where a control would
 * sit inside another control or, in a run outside every control, hold their controls inside them
 * ({@link spokenIn}); and none for an element at a phrasing position, whose parent may admit no
 * control after it (a list item's, a table cell's).
 *
 * @param element The element.
 * @param walk The walk where it stands.
 * @returns The control, or nothing.
 */
const readAloudBefore = (element: BodyElement<RedactedLevel>, walk: Walk): readonly ReactNode[] =>
  walk.scope.kind === "body"
    ? spokenAt(spokenBefore({ element, kind: "element" }), walk.scope.readAloud, walk.locale)
    : [];

/**
 * Write read-aloud's control the placement gives (`spokenBefore` in
 * `#plate/read-aloud/placement.ts`), named by its role: none where the catalog keeps no spoken card
 * that gives audio.
 *
 * @param spoken The control the placement gives, none where none stands.
 * @param readAloud The page's read-aloud.
 * @param locale The locale of plate's own text.
 * @returns The control, or nothing.
 */
const spokenAt = (
  spoken: Option.Option<SpokenControl>,
  readAloud: ReadsAloud,
  locale: Locale,
): readonly ReactNode[] =>
  Option.toArray(
    spoken.pipe(
      Option.flatMap(({ catalog, role }) =>
        readAloud(
          catalog,
          role,
          message(locale, role === "prompt" ? "readAloudPrompt" : "readAloudText"),
          "read-aloud",
        ),
      ),
    ),
  );

/**
 * Write the props a term takes from the glossary: the id its disclosure's `summary` is named by,
 * where the author wrote none, and `aria-details` naming the disclosure after any the author named.
 *
 * @param props The props the element writes.
 * @param glossed What the glossary gives the term.
 * @returns The props with the term's.
 */
const termProps = (props: ReturnType<typeof propsOf>, glossed: Glossed) => {
  const authored = props["aria-details"];

  return {
    ...props,
    "aria-details": Predicate.isString(authored)
      ? `${authored} ${glossed.details}`
      : glossed.details,
    id: glossed.term,
  };
};

/**
 * Render an authored element and its subtree, a table inside plate's Table part (`plate-table`),
 * or, for one outside the HTML subset, what the interaction whose content it is renders in its
 * place, else nothing; a feedback block the page shows ({@link feedbackBlockTag}) is plate's
 * Feedback part ({@link feedbackOf}), its content walked where the block stands: here only at a
 * phrasing position, since at a flow position a block stands in its run ({@link renderedOf}). In a
 * walk of the body, an element at a flow position is preceded by its read-aloud control
 * ({@link readAloudBefore}) and followed by the right answers the seam writes apart from the
 * interactions it holds ({@link answersAfter}), then the glossary's disclosure of each term it owns
 * ({@link ownedTerms}), and a term names its disclosure. In a run of an interaction's own content
 * outside every control, an element holds its read-aloud control after its own children
 * ({@link spokenIn}). A picture, in any walk, carries the line
 * `data-plate-unloaded`, the catalog's `pictureUnloaded`, which the stylesheet shows under the
 * picture's words where it fails to load.
 *
 * @param element The element, as the redacted body holds it.
 * @param key Its key among its siblings.
 * @param walk What the walk carries.
 * @returns The element.
 */
const elementOf = (element: BodyElement<RedactedLevel>, key: Key, walk: Walk): ReactNode => {
  if (element.tag === feedbackBlockTag) {
    return feedbackOf("span", key, walk, renderedOf(placed(element.children), walk));
  }

  const declared = htmlSubset.get(element.tag);

  if (declared === undefined) {
    return createElement(
      Fragment,
      { key },
      walk.scope.kind === "owned" ? walk.scope.own(element) : undefined,
    );
  }

  const inner: Walk = {
    ...walk,
    standing: standingBelow(element.tag, walk.standing),
  };
  const entries = placed(element.children, element.tag);
  const authored = propsOf(element, declared, walk.addressing);
  // A picture carries the line the stylesheet shows under its words where it fails to load.
  const written =
    element.tag === "img"
      ? { ...authored, "data-plate-unloaded": message(walk.locale, "pictureUnloaded") }
      : authored;
  const glossed = walk.scope.kind === "body" ? walk.scope.glossary(element) : Option.none();
  const attributes = Option.match(glossed, {
    onNone: () => written,
    onSome: (term) => termProps(written, term),
  });
  const tag = tagFor(element.tag, walk.headingOffset);
  const below = (): readonly ReactNode[] =>
    element.tag === "table" ? tableChildren(entries, inner) : renderedOf(entries, inner);
  // A stimulus the item places here stands after the element's own children: "the stimulus is
  // injected into" the element that names it (implementation guide §3.7.7).
  const placedHere = walk.scope.kind === "body" ? Option.toArray(walk.scope.stimulus(element)) : [];
  const held = Option.toArray(Option.fromUndefinedOr(walk.spoken.get(element.path)));
  const children = voidElements.has(element.tag) ? undefined : [...below(), ...placedHere, ...held];
  const writtenAt = (at: Key): ReactNode => {
    // `satisfies` gives the literal React's `Attributes` as its contextual type, so `key` stays a
    // `Key`: without one, React's experimental types (Next loads them) widen `optimisticKey`'s
    // unique symbol to `symbol`, which `Attributes.key` refuses.
    const props = { ...attributes, key: at } satisfies Attributes;

    return children === undefined ? createElement(tag, props) : createElement(tag, props, children);
  };
  // A table stands in plate's Table part, the box it scrolls sideways in when it is wider than the
  // item, so the page never does (WCAG 1.4.10); the table keeps its own display, and so its
  // semantics, which some engines drop from a table displayed otherwise.
  const elementAt = (at: Key): ReactNode =>
    element.tag === "table"
      ? createElement("div", { "data-slot": "plate-table", key: at }, writtenAt("table"))
      : writtenAt(at);
  if (walk.standing !== "flow") {
    return elementAt(key);
  }

  const preceding = readAloudBefore(element, walk);
  const following = [
    ...answersAfter(element, inner, walk),
    ...disclosuresAfter(element, inner, walk),
  ];

  return preceding.length === 0 && following.length === 0
    ? elementAt(key)
    : createElement(Fragment, { key }, ...preceding, elementAt("block"), ...following);
};

/**
 * Render an interaction of the walk through the seam: at a flow position it is its own block, so
 * the right answer the seam writes for it apart from it (`answer` in {@link Scope}'s `body` arm)
 * follows it there, and read-aloud's control for the catalog its own root references
 * (`ModuleInteraction.catalog` in `#plate/interactions/contract.ts`) precedes it, the control for
 * its prompt, which a chain plays first, as AlphaTest's player showed a question's prompt clip
 * however its markup carried it. At a phrasing position it stands alone: its parent may admit no
 * control beside it.
 *
 * @param interaction The interaction, as the redacted body holds it.
 * @param key Its key among its siblings.
 * @param walk What the walk carries.
 * @returns What the seam renders.
 * @throws {NestedInteraction} In a walk of an interaction's own content.
 */
const interactionOf = (
  interaction: Interaction<RedactedLevel>,
  key: Key,
  walk: Walk,
): ReactNode => {
  if (walk.scope.kind !== "body") {
    throw new NestedInteraction({ kind: interaction.kind });
  }

  const rendered = walk.scope.interaction(interaction, key);

  if (walk.standing !== "flow") {
    return rendered;
  }

  const preceding = spokenAt(
    spokenBefore({ interaction, kind: "interaction" }),
    walk.scope.readAloud,
    walk.locale,
  );
  const following = writtenOf(walk.scope.answer(interaction, "answer"));

  return preceding.length === 0 && following.length === 0
    ? rendered
    : createElement(Fragment, { key }, ...preceding, rendered, ...following);
};

/**
 * Render a module's container through the seam.
 *
 * @param node The container's node.
 * @param key Its key among its siblings.
 * @param walk What the walk carries.
 * @returns What the seam renders.
 * @throws {UnrenderedNode} In a walk with no container view, which is a walk of an interaction's
 *   own content.
 */
const containerOf = (
  node: ContainerNode<ContainerKind, RedactedLevel>,
  key: Key,
  walk: Walk,
): ReactNode => {
  if (walk.scope.kind !== "body") {
    throw new UnrenderedNode({ detail: `a container of ${node.module}` });
  }

  return walk.scope.container(node, {
    children: () => renderedOf(placed(node.children), walk),
    key,
    walk,
  });
};

/**
 * Render a body-placed content module's node through its view in `#plate/ui/item/contents/`, by
 * its element, with the payload node its module's `copy` gives: one case per module of
 * `bodyModules` (`#plate/content/modules.ts`).
 *
 * @param node The content module's node.
 * @param key Its key among its siblings.
 * @param walk What the walk carries.
 * @returns What the view renders.
 */
const contentNodeOf = (node: ContentNode<RedactedLevel>, key: Key, walk: Walk): ReactNode => {
  const view: ContentWalk = {
    key,
    nodes: (nodes) => renderedOf(placed(nodes), walk),
    walk,
  };
  const payload = copyContent(node);

  switch (payload.element) {
    case "math": {
      return mathmlContent(payload, view);
    }
    case "qti-rubric-block": {
      return rubricContent(payload, view);
    }
    default: {
      return payload satisfies never;
    }
  }
};

/**
 * Give the formulas among body nodes, each its `math` element, at any depth ({@link contentsIn}).
 *
 * @param nodes The body nodes.
 * @returns The formulas.
 */
const formulasIn = (nodes: readonly RedactedNode[]): readonly MathNode<RedactedLevel>[] =>
  contentsIn(nodes).flatMap((node) => {
    const payload = copyContent(node);

    return payload.element === "math" ? [payload.payload] : [];
  });

/**
 * Give the slots a run of content's walk draws: the walk's own, and each target of the run that
 * exactly one slot of its formulas names (`slotPlan` in `#plate/content/math-slots.ts`), drawn as
 * the walk would draw it where it stands: an interaction through the seam, a gap by its
 * interaction's `own`. A copy writes no slot, so no interaction stands twice on the page.
 *
 * @param nodes The run's body nodes.
 * @param walk The walk where they stand.
 * @returns The slots.
 */
const slotsIn = (nodes: readonly RedactedNode[], walk: Walk): ReadonlyMap<string, Slotted> => {
  const { scope } = walk;

  if (walk.addressing.writing === "copy" || scope.kind === "plain") {
    return walk.slots;
  }

  const planned = [...slotPlan(formulasIn(nodes), nodes, scope.kind)].flatMap(
    ([id, target]): readonly (readonly [string, Slotted])[] => {
      if (target.kind === "gap") {
        return scope.kind === "owned"
          ? [[id, { render: () => scope.own(target.node), size: target.size }]]
          : [];
      }

      return scope.kind === "body"
        ? [[id, { render: () => scope.interaction(target.node, `slot-${id}`), size: target.size }]]
        : [];
    },
  );

  return new Map([...walk.slots, ...planned]);
};

/**
 * Tell whether a formula of the walk draws a body node in its slot, so the walk writes nothing
 * where it stands.
 *
 * @param node The node.
 * @param walk What the walk carries.
 * @returns Whether it is an interaction or a gap the walk's slots hold by its id.
 */
const slottedElsewhere = (node: RedactedNode, walk: Walk): boolean => {
  if (isInteraction(node)) {
    return Option.isSome(node.id) && walk.slots.has(node.id.value);
  }

  if (node.kind !== "element" || node.tag !== "qti-gap") {
    return false;
  }

  const id = node.attributes.find(({ name }) => name === "id")?.value;

  return id !== undefined && walk.slots.has(id);
};

/**
 * Render one body node.
 *
 * @param node The body node, as the redacted body holds it.
 * @param key Its key among its siblings.
 * @param walk What the walk carries.
 * @returns Nothing for a node a formula draws in its slot ({@link slottedElsewhere}); text as
 *   itself, an element ({@link elementOf}), a notice as the Notice part (none in a copy, whose
 *   original tells it: `Addressing.writing`), an interaction or a module's container through the
 *   seam ({@link interactionOf}, {@link containerOf}), a content module's node through its view
 *   ({@link contentNodeOf}).
 */
const nodeOf = (node: RedactedNode, key: Key, walk: Walk): ReactNode => {
  if (slottedElsewhere(node, walk)) {
    return null;
  }

  if (isInteraction(node)) {
    return interactionOf(node, key, walk);
  }

  switch (node.kind) {
    case "element": {
      return elementOf(node, key, walk);
    }
    case "text": {
      return node.text;
    }
    case "unsupported": {
      return walk.addressing.writing === "copy"
        ? null
        : noticeOf(node.feature, walk.locale, positionOf(walk.standing), key);
    }
    case "container": {
      return containerOf(node, key, walk);
    }
    case "content": {
      return contentNodeOf(node, key, walk);
    }
    default: {
      return node satisfies never;
    }
  }
};

/**
 * Render a run of body nodes, its formulas drawing in their slots the interactions and gaps of
 * the run they name ({@link slotsIn}).
 *
 * @param nodes The body nodes, as the redacted body holds them.
 * @param walk What the walk carries.
 * @returns The rendered nodes, in order.
 */
export const nodesOf = (nodes: readonly RedactedNode[], walk: Walk): readonly ReactNode[] =>
  renderedOf(placed(nodes), { ...walk, slots: slotsIn(nodes, walk) });

/**
 * Give the first feedback block the page shows at a flow position among body nodes, in document
 * order, as the body walk meets it: below each element the walk writes, each where the walk stands
 * it ({@link standingBelow}), and in each module's container and content node, but in no
 * interaction's own content, whose walk carries no verdict. The review's verdict heads the run
 * that holds it (`verdict` in {@link Scope}'s `body` arm).
 *
 * @param nodes The body nodes.
 * @param standing Where they stand, the body's flow by default.
 * @returns The block, or none where the body shows none at a flow position.
 */
export const firstFeedbackIn = (
  nodes: readonly RedactedNode[],
  standing: Standing = "flow",
): Option.Option<BodyElement<RedactedLevel>> =>
  Arr.findFirst(nodes, (node): Option.Option<BodyElement<RedactedLevel>> => {
    if (isInteraction(node)) {
      return Option.none();
    }

    switch (node.kind) {
      case "element": {
        if (node.tag === feedbackBlockTag) {
          return standing === "flow" ? Option.some(node) : Option.none();
        }

        return htmlSubset.has(node.tag)
          ? firstFeedbackIn(node.children, standingBelow(node.tag, standing))
          : Option.none();
      }
      case "container": {
        return firstFeedbackIn(node.children, standing);
      }
      case "content": {
        return firstFeedbackIn(contentBodyOf(node), standing);
      }
      case "text":
      case "unsupported": {
        return Option.none();
      }
      default: {
        return node satisfies never;
      }
    }
  });
