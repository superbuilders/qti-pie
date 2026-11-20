/**
 * What the associating interactions share: the choices a child associates, as the server writes
 * them, how each becomes a chip of a board, and the texts their responses post. Match and Gap
 * Match post `directedPair`s from a board of pairs; Associate and Graphic Associate post `pair`s
 * from a board of boxes. Safe to import on the server.
 *
 * @module
 */
import type { ReactNode } from "react";
import { pairText } from "#plate/interactions/pair.ts";
import { fillLabel } from "#plate/ui/labels.ts";
import type { Limit } from "#plate/ui/limit.ts";
import type { BoxLabels } from "#plate/ui/placement/labels.ts";
import type {
  Box,
  Boxes,
  ChipRule,
  Half,
  Pairs,
  PartnerRule,
} from "#plate/ui/placement/machine.ts";

/**
 * One associable choice as an island shows it: a `qti-simple-associable-choice` of either match
 * set or of an associate, or a gap match's `qti-gap-text` or `qti-gap-img`.
 *
 * - `content` is the choice's server-rendered content, shown in its chip in the bank and again in
 *   each target that holds it, so it holds no `id` and no interactive element.
 * - `identifier` is the choice's `identifier`.
 * - `label`, none when the content shows text, is the accessible name the server gives a choice whose
 *   content has none, such as an image: its chip or target carries it, and announcements read it,
 *   since the primitive reads a part's text, then its `aria-label`, and never an image's `alt`.
 * - `matchGroup` is the choice's `match-group`, the identifiers it may be associated with, empty when
 *   the author wrote none or an empty list, which both mean any (QTI 3.0 information model 5.131.5,
 *   5.58.4, 5.56.4).
 * - `matchMax` is the choice's `match-max`, which QTI requires: how many associations it may be in
 *   (5.131.6, 5.58.5, 5.56.5). The server writes 0 as no limit (see {@link Limit}).
 */
export interface AssociableChoice {
  readonly content: ReactNode;
  readonly identifier: string;
  readonly label: string | undefined;
  readonly matchGroup: readonly string[];
  readonly matchMax: Limit;
}

/**
 * What a choice of a board of boxes brings to its rule: an associate's choice, or a graphic
 * associate's `qti-associable-hotspot`, whose `match-group` and `match-max` mean the same (5.7.4,
 * 5.7.8).
 */
export type Associable = Pick<AssociableChoice, "identifier" | "matchGroup" | "matchMax">;

/**
 * Make an associable choice a chip of a board of pairs: placed up to its `match-max`, and only
 * into the targets its `match-group` lists, when it lists any.
 *
 * @param choice The choice.
 * @returns Its chip.
 */
export const chipRuleOf = (choice: AssociableChoice): ChipRule => ({
  id: choice.identifier,
  targets: choice.matchGroup,
  uses: choice.matchMax,
});

/**
 * Make an associable choice or hotspot a chip of a board of boxes: in up to its `match-max` pairs,
 * and paired only with the choices its `match-group` lists, when it lists any.
 *
 * @param choice The choice or hotspot.
 * @returns Its chip.
 */
export const partnerRuleOf = (choice: Associable): PartnerRule => ({
  id: choice.identifier,
  partners: choice.matchGroup,
  uses: choice.matchMax,
});

/**
 * Read the two identifiers of a text in plate's lexical form of a `pair` or a `directedPair`: two
 * identifiers and one space between them, as `format` in `#plate/model/values.ts` writes one for
 * the server's restore and the islands write one when they post. A text of any other shape holds no
 * pair, so it gives none.
 *
 * @param text A text of a response.
 * @returns The text's two identifiers in written order, or none.
 */
const identifiersOf = (text: string): readonly (readonly [string, string])[] => {
  const [first, second, ...rest] = text.split(" ");

  return first === undefined || second === undefined || rest.length > 0 ? [] : [[first, second]];
};

/**
 * Read a response of `directedPair`s as placements, one chip in one target per text, in posting
 * order ({@link identifiersOf}).
 *
 * @param texts The response's texts, in posting order.
 * @returns The placements.
 */
export const placementsOf = (texts: readonly string[]): Pairs =>
  texts.flatMap((text) => identifiersOf(text).map(([chip, target]) => ({ chip, target })));

/**
 * Write placements as a response of `directedPair`s, the chip first. The response is a bag, so
 * the order is the placements' own and carries nothing.
 *
 * @param placements The placements.
 * @returns The response's texts.
 */
export const textsOf = (placements: Pairs): readonly string[] => placements.map(pairText);

/**
 * Read a response of `pair`s as boxes, one full box per text, in posting order
 * ({@link identifiersOf}); a pair's first identifier goes in a box's first half.
 *
 * @param texts The response's texts, in posting order.
 * @returns The boxes.
 */
export const boxesOf = (texts: readonly string[]): Boxes =>
  texts.flatMap((text) => identifiersOf(text).map(([first, second]): Box => [first, second]));

/**
 * Write boxes as a response of `pair`s: one text per box that holds a pair, its first half's chip
 * first, and nothing for a box short of one. The response is a bag, so the order is the boxes'
 * own and carries nothing.
 *
 * @param boxes The boxes.
 * @returns The response's texts.
 */
export const pairTextsOf = (boxes: Boxes): readonly string[] =>
  boxes.flatMap(([first, second]) =>
    first === null || second === null ? [] : [`${first} ${second}`],
  );

/**
 * Key a response of `pair`s by what it means: each pair's two identifiers in sorted order, since
 * "(A,B) and (B,A) are equivalent" (8.13), and the pairs sorted, since the response is a bag.
 *
 * @param texts The response's texts.
 * @returns The key.
 */
const pairsKey = (texts: readonly string[]): string =>
  texts
    .map((text) => text.split(" ").toSorted().join(" "))
    .toSorted()
    .join("\n");

/**
 * Give the boxes an island shows for its response: the boxes it last showed while they post the
 * response it holds, boxes short of a pair included, which no response holds; else one full box per
 * pair of the response, as when the host restored another answer.
 *
 * An Associate or a Graphic Associate keeps the boxes it shows, since a box with one chip posts
 * nothing, and passes these to the placement root, so its boxes follow the response whenever the
 * host changes it, and never otherwise.
 *
 * @param shown The boxes the island last showed.
 * @param texts The response the island holds.
 * @returns `shown` itself, when it posts `texts`; else the response's own boxes.
 */
export const keptBoxes = (shown: Boxes, texts: readonly string[]): Boxes =>
  pairsKey(pairTextsOf(shown)) === pairsKey(texts) ? shown : boxesOf(texts);

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
