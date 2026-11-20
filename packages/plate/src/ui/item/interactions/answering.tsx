/**
 * The props every interaction's island takes from the server shell, built from the interaction
 * paired with its payload node alone: its content written through the shell, its prompt, and an
 * associable choice as a placement island takes it. Each kind's island is its own file's
 * (`#plate/ui/item/interactions/<kind>.tsx`), which reads the rest from QTI, the XSD's defaults
 * written (`#plate/ui/item/interactions/facts.ts`), and from plate's catalog in the item's locale,
 * the author's own messages in place of the catalog's where the interaction writes one.
 *
 * Each takes the island's context (`IslandContext` in `#plate/ui/item/context.ts`), which has no
 * field for the item model, the record, the values or the solution, so no island is handed a
 * correct response, a mapping, or anything the redaction removed.
 *
 * @module
 */
import type { Option } from "effect";
import type { ReactNode } from "react";
import type { RedactedNode } from "#plate/model/item.ts";
import type { IslandContext, Position } from "#plate/ui/item/context.ts";
import { limitOf } from "#plate/ui/item/interactions/facts.ts";
import { chipName } from "#plate/ui/item/interactions/text.ts";
import type { Place } from "#plate/ui/item/interactions/text.ts";
import type { AssociableChoice } from "#plate/ui/placement/associable.ts";

/**
 * Write a run of content through the shell, as server React elements.
 *
 * @param nodes The content's body nodes.
 * @param position Where it stands.
 * @param context What the shell knows: its content walk.
 * @returns The content.
 */
export const contentOf = (
  nodes: readonly RedactedNode[],
  position: Position,
  context: Pick<IslandContext, "content">,
): ReactNode => context.content(nodes, { position });

/**
 * Give an associable choice, a source or target of a Match or a gap text or gap image of a Gap
 * Match or a Graphic Gap Match, as the island takes it.
 *
 * @param choice The choice's payload: its content, identifier, `match-group` and `match-max`, and its
 *   `object-label`, a gap image's, none for a gap text or a Match's choice.
 * @param place The choice's place among its set as presented, which names it when nothing else
 *   does.
 * @param position Where its content stands: phrasing in a chip, flow in a Match's group.
 * @param context What the shell knows: its content walk and the locale.
 * @returns The choice.
 */
export const associableOf = (
  choice: {
    readonly content: readonly RedactedNode[];
    readonly identifier: string;
    readonly label: Option.Option<string>;
    readonly matchGroup: readonly string[];
    readonly matchMax: bigint;
  },
  place: Place,
  position: Position,
  context: Pick<IslandContext, "content" | "locale">,
): AssociableChoice => ({
  content: contentOf(choice.content, position, context),
  identifier: choice.identifier,
  label: chipName(choice.content, choice.label, place, context.locale),
  matchGroup: choice.matchGroup,
  matchMax: limitOf(choice.matchMax),
});
