/**
 * Where read-aloud's controls stand in a body: the control a body node has, the catalog it reads
 * and the role of the part it reads, which names it. Pure, so its rules are checked apart from any
 * page (`placement.test.ts`). Two places, by where the node stands:
 *
 * - **Before**, in the item's body: the one control that stands before a node, as AlphaTest's player
 *   put a passage's and a question's control at the top of what it reads and showed a question's
 *   prompt clip however the question carried it ({@link spokenBefore}). The server shell's walk
 *   writes it as the node's previous sibling.
 * - **Within**, in a run of an interaction's own content that stands outside every control of the
 *   interaction, such as gap match's sentence: the control an element of it holds after its own
 *   content ({@link spokenWithin}), as a slot's label holds its play icon ("least ▷"), so the
 *   element keeps its own place in the run's layout, the label's place on a number line. The walk
 *   writes it as the element's last child.
 *
 * Either way the walk writes the control only where the catalog keeps a spoken card that gives
 * audio (`#plate/ui/item/content.tsx`).
 *
 * @module
 */
import { Option } from "effect";
import type { BodyElement, Interaction, RedactedLevel } from "#plate/model/item.ts";
import { barsControls, holdsPhrasing } from "#plate/ui/item/html.ts";

/**
 * A control a body node has: the catalog it reads, and the role of the part it reads, an
 * interaction's `prompt` or the `text` of an element, which names the control (`readAloudPrompt`
 * and `readAloudText` in `#plate/messages/read-aloud.ts`).
 */
export interface SpokenControl {
  readonly catalog: string;
  readonly role: "prompt" | "text";
}

/**
 * Give the control an element that references a catalog has: its catalog's (its
 * `data-catalog-idref`), in the `text` role; none for one that references none.
 *
 * @param element The element.
 * @returns The control, none where the element references no catalog.
 */
const spokenText = (element: BodyElement<RedactedLevel>): Option.Option<SpokenControl> =>
  Option.map(Option.fromUndefinedOr(element.catalog), (catalog) => ({
    catalog,
    role: "text" as const,
  }));

/**
 * Give the control that stands before a body node at a flow position: an element's `text` control
 * for the catalog it references ({@link spokenText}), and an interaction's `prompt` control for the
 * catalog its own root references; none for a node that references no catalog. A node at a
 * phrasing position, whose parent may admit no control beside it (a list item's, a table cell's, a
 * paragraph's), takes none, which the walk keeps by asking only at a flow position.
 *
 * @param node The element or the interaction.
 * @returns The control, none where none stands before it.
 */
export const spokenBefore = (
  node:
    | { readonly kind: "element"; readonly element: BodyElement<RedactedLevel> }
    | { readonly kind: "interaction"; readonly interaction: Interaction<RedactedLevel> },
): Option.Option<SpokenControl> =>
  node.kind === "element"
    ? spokenText(node.element)
    : node.interaction.catalog.pipe(
        Option.map((catalog) => ({ catalog, role: "prompt" as const })),
      );

/**
 * Give the control an element of a run of an interaction's own content holds after its own
 * content, where the run stands outside every control of the interaction: its `text` control for
 * the catalog it references ({@link spokenText}), at any depth and any position, since the control,
 * a `span`, stands inside the element, where its parent's content model never sees it. None for an
 * element that references no catalog; none for one that may hold no phrasing content
 * (`holdsPhrasing` in `#plate/ui/item/html.ts`): a void element, a table's or a list's structure,
 * and an element plate does not write as itself, such as a gap, which its interaction draws; and
 * none for one that stands, at any depth, inside an element that bars every control below it
 * (`barsControls`): a link, a label, a media element and the others there, so no control stands
 * anywhere inside one.
 *
 * @param element The element.
 * @param within The tags of the elements it stands inside, outermost first, from the run's root.
 * @returns The control, none where the element holds none.
 */
export const spokenWithin = (
  element: BodyElement<RedactedLevel>,
  within: readonly string[],
): Option.Option<SpokenControl> =>
  holdsPhrasing(element.tag) && !within.some(barsControls) ? spokenText(element) : Option.none();
