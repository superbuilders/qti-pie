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
import { Option } from "effect";
import type { ReactNode } from "react";
import { message, numeral } from "#plate/messages.ts";
import type { RedactedNode, ReferencingChoice } from "#plate/model/item.ts";
import type { IslandContext, Position } from "#plate/ui/item/context.ts";
import { limitOf } from "#plate/ui/item/interactions/facts.ts";
import { chipName } from "#plate/ui/item/interactions/text.ts";
import type { Place } from "#plate/ui/item/interactions/text.ts";
import type { AssociableChoice } from "#plate/ui/placement/associable.ts";
import type { Spoken } from "#plate/ui/read-aloud/spoken.tsx";

/**
 * The catalog's names of read-aloud's control beside a choice, by what the choice is to the child:
 * `readAloudChoice` for an option, one it picks, moves or orders, `readAloudGroup` for a Match's
 * group, which the options go to, `readAloudRow` and `readAloudColumn` for a row's and a column's
 * header of a Match laid out as a table, and `readAloudArea` for an area of a graphic
 * interaction's image. `{n}` is the choice's place among its set as presented.
 */
type SpokenPart =
  | "readAloudArea"
  | "readAloudChoice"
  | "readAloudColumn"
  | "readAloudGroup"
  | "readAloudRow";

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
 * Give read-aloud for a choice of an interaction's own content, which its island writes beside the
 * choice: the control for the catalog the choice references, a choice's in the item's chain, named
 * by what the choice is and its place, and keyed by its identifier, where the candidate hears it
 * (`IslandContext.readAloud`);
 * none where the choice references no catalog, or one that keeps no spoken card that gives audio.
 *
 * @param choice The choice: its identifier and the catalog it references.
 * @param n Its place among its set as presented, from 1.
 * @param part What the choice is to the child, which names the control.
 * @param context What the page may know: the locale and read-aloud.
 * @returns The choice's read-aloud.
 */
export const spokenOf = (
  choice: ReferencingChoice,
  n: number,
  part: SpokenPart,
  context: Pick<IslandContext, "locale" | "readAloud">,
): Spoken =>
  Option.match(
    choice.catalog.pipe(
      Option.flatMap((catalog) =>
        context.readAloud(
          catalog,
          "choice",
          message(context.locale, part, { n: numeral(context.locale, n) }),
          choice.identifier,
        ),
      ),
    ),
    { onNone: () => ({}), onSome: (readAloud) => ({ readAloud }) },
  );

/**
 * Give an associable choice, a source or target of a Match or a gap text or gap image of a Gap
 * Match or a Graphic Gap Match, as the island takes it, with its read-aloud ({@link spokenOf}).
 *
 * @param choice The choice's payload: its content, identifier, the catalog it references,
 *   `match-group` and `match-max`, and its `object-label`, a gap image's, none for a gap text or a
 *   Match's choice.
 * @param place The choice's place among its set as presented, which names it when nothing else
 *   does.
 * @param position Where its content stands: phrasing in a chip, flow in a Match's group.
 * @param context What the shell knows: its content walk, the locale and read-aloud.
 * @returns The choice.
 */
export const associableOf = (
  choice: ReferencingChoice & {
    readonly content: readonly RedactedNode[];
    readonly label: Option.Option<string>;
    readonly matchGroup: readonly string[];
    readonly matchMax: bigint;
  },
  place: Place,
  position: Position,
  context: Pick<IslandContext, "content" | "locale" | "readAloud">,
): AssociableChoice => ({
  content: contentOf(choice.content, position, context),
  identifier: choice.identifier,
  label: chipName(choice.content, choice.label, place, context.locale),
  matchGroup: choice.matchGroup,
  matchMax: limitOf(choice.matchMax),
  ...spokenOf(choice, place.n, "readAloudChoice", context),
});
