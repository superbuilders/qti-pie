/**
 * What the associating interactions share: the choices a child associates, as the server writes
 * them, and the values their responses hold; the rule each brings to a board is
 * `#plate/placement/rules.ts`'s. Match and Gap Match write `directedPair`s from a board of pairs;
 * Associate and Graphic Associate write `pair`s from a board of boxes. Safe to import on the
 * server.
 *
 * @module
 */
import type { ReactNode } from "react";
import type { UnorderedPair } from "#plate/interactions/pair.ts";
import { fillLabel } from "#plate/ui/labels.ts";
import type { BoxLabels } from "#plate/ui/placement/labels.ts";
import type { Box, Boxes, Half, Pairs } from "#plate/placement/machine.ts";
import type { Associable } from "#plate/placement/rules.ts";
import type { Spoken } from "#plate/ui/read-aloud/spoken.tsx";

/**
 * One associable choice as an island shows it: a `qti-simple-associable-choice` of either match
 * set or of an associate, or a gap match's `qti-gap-text` or `qti-gap-img`: the facts of its rule
 * ({@link Associable}), and these.
 *
 * - `content` is the choice's server-rendered content, shown in its chip in the bank and again in
 *   each target that holds it, so it holds no `id` and no interactive element.
 * - `label`, none when the content shows text, is the accessible name the server gives a choice whose
 *   content has none, such as an image: its chip or target carries it, and announcements read it,
 *   since the primitive reads a part's text, then its `aria-label`, and never an image's `alt`.
 * - `readAloud` is read-aloud's control for the catalog the choice references, absent where the
 *   candidate hears none: the island writes it beside the choice's chip in the bank alone, which
 *   lists every choice once, so each choice is heard from one place.
 */
export interface AssociableChoice extends Associable, Spoken {
  readonly content: ReactNode;
  readonly label: string | undefined;
}

/**
 * A `directedPair` as a response holds it: its source, then its target.
 */
export type DirectedPair = readonly [string, string];

/**
 * Read a response of `directedPair`s as placements, one chip in one target per pair, in the
 * response's order: a pair's source is the chip and its target the target.
 *
 * @param pairs The response's pairs, in order.
 * @returns The placements.
 */
export const placementsOf = (pairs: readonly DirectedPair[]): Pairs =>
  pairs.map(([chip, target]) => ({ chip, target }));

/**
 * Write placements as a response of `directedPair`s, the chip first. The response is a bag, so
 * the order is the placements' own and carries nothing.
 *
 * @param placements The placements.
 * @returns The response's pairs.
 */
export const directedPairsOf = (placements: Pairs): readonly DirectedPair[] =>
  placements.map(({ chip, target }) => [chip, target]);

/**
 * Read a response of `pair`s as boxes, one full box per pair, in the response's order; a pair's
 * first identifier goes in a box's first half.
 *
 * @param pairs The response's pairs, in order.
 * @returns The boxes.
 */
export const boxesOf = (pairs: readonly UnorderedPair[]): Boxes =>
  pairs.map(([first, second]): Box => [first, second]);

/**
 * Write boxes as a response of `pair`s: one pair per box that holds two chips, its first half's
 * chip first, and nothing for a box short of one. The response is a bag, so the order is the boxes'
 * own and carries nothing.
 *
 * @param boxes The boxes.
 * @returns The response's pairs.
 */
export const pairsOfBoxes = (boxes: Boxes): readonly UnorderedPair[] =>
  boxes.flatMap(([first, second]): readonly UnorderedPair[] =>
    first === null || second === null ? [] : [[first, second]],
  );

/**
 * Key a response of `pair`s by what it means: each pair's two identifiers in sorted order, since
 * "(A,B) and (B,A) are equivalent" (8.13), and the pairs sorted, since the response is a bag.
 *
 * @param pairs The response's pairs.
 * @returns The key.
 */
const pairsKey = (pairs: readonly UnorderedPair[]): string =>
  pairs
    .map((pair) => pair.toSorted().join(" "))
    .toSorted()
    .join("\n");

/**
 * Give the boxes an island shows for its response: the boxes it last showed while they hold the
 * response's pairs, boxes short of a pair included, which no response holds; else one full box per
 * pair of the response, as when the host restored another answer.
 *
 * An Associate or a Graphic Associate keeps the boxes it shows, since a box with one chip writes
 * nothing, and passes these to the placement root, so its boxes follow the response whenever the
 * host changes it, and never otherwise.
 *
 * @param shown The boxes the island last showed.
 * @param pairs The response's pairs.
 * @returns `shown` itself, when it holds `pairs`; else the response's own boxes.
 */
export const keptBoxes = (shown: Boxes, pairs: readonly UnorderedPair[]): Boxes =>
  pairsKey(pairsOfBoxes(shown)) === pairsKey(pairs) ? shown : boxesOf(pairs);

/**
 * Name a half of a box, as its target carries the name and its slot and every announcement say
 * it: the `boxFirst` or `boxSecond` label with the box's number from 1 ("Pair 1, first"), so no
 * two halves of a board share a name (WCAG 2.4.6). The island's boxes, an image's taps that place
 * a chip, and the review all name a half by it.
 *
 * @param labels The names of a box's halves.
 * @param half The half: its box's index from 0, and its side.
 * @returns Its name.
 */
export const halfName = (
  labels: Pick<BoxLabels, "boxFirst" | "boxSecond">,
  half: Pick<Half, "box" | "side">,
): string => fillLabel(half.side === 0 ? labels.boxFirst : labels.boxSecond, { n: half.box + 1 });
