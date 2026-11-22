/**
 * Where read-aloud's controls stand in a body: the one control that stands before a body node, the
 * catalog it reads and the role its chain plays it in, as AlphaTest's player put a passage's and a
 * question's control at the top of what it reads and showed a question's prompt clip however the
 * question carried it. Pure, so its rule is checked apart from any page (`placement.test.ts`); the
 * server shell's walk writes the control it gives, where the catalog keeps a spoken card that gives
 * audio, as the node's previous sibling (`#plate/ui/item/content.tsx`).
 *
 * @module
 */
import { Option } from "effect";
import type { BodyElement, Interaction, RedactedLevel } from "#plate/model/item.ts";
import type { ReadAloudRole } from "#plate/read-aloud/session.ts";

/**
 * The control that stands before a body node: the catalog it reads and its role in the item's
 * chain.
 */
export interface SpokenBefore {
  readonly catalog: string;
  readonly role: Extract<ReadAloudRole, "prompt" | "text">;
}

/**
 * Give the control that stands before a body node at a flow position: an element's `text` control
 * for the catalog it references (its `data-catalog-idref`), and an interaction's `prompt` control
 * for the catalog its own root references, which a chain plays first; none for a node that
 * references no catalog. A node at a phrasing position, whose parent may admit no control beside
 * it (a list item's, a table cell's, a paragraph's), takes none, which the walk keeps by asking
 * only at a flow position.
 *
 * @param node The element or the interaction.
 * @returns The control, none where none stands before it.
 */
export const spokenBefore = (
  node:
    | { readonly kind: "element"; readonly element: BodyElement<RedactedLevel> }
    | { readonly kind: "interaction"; readonly interaction: Interaction<RedactedLevel> },
): Option.Option<SpokenBefore> =>
  node.kind === "element"
    ? Option.map(Option.fromUndefinedOr(node.element.catalog), (catalog) => ({
        catalog,
        role: "text" as const,
      }))
    : node.interaction.catalog.pipe(
        Option.map((catalog) => ({ catalog, role: "prompt" as const })),
      );
