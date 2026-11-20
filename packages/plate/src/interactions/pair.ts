/**
 * The pairs of the interactions that associate choices, as a response's values give them: a
 * `directedPair` as Match, Gap Match and Graphic Gap Match read it, a chip and the target it is
 * put in, and a `pair` as Associate and Graphic Associate read it, two choices joined in either
 * order. A response's pairs are read into these once, from its values, and the islands' placement
 * machine holds the same {@link Pair}, so no reader splits a pair's text.
 *
 * It imports types alone, so a client island may read it without the core's runtime.
 *
 * @module
 */
import type { Single } from "#plate/model/values.ts";

/**
 * One `directedPair` of a response: `chip`, its first identifier, the choice a child moves (a
 * match's source, a gap text, a gap image), and `target`, its second, the place the chip is put (a
 * match's target, a gap, a hotspot). QTI orders a directed pair, so the two never trade sides.
 */
export interface Pair {
  readonly chip: string;
  readonly target: string;
}

/**
 * One `pair` of a response: two choices or hotspots, in the order the response wrote them. The
 * order carries nothing, since "(A,B) and (B,A) are equivalent" (QTI 3.0 information model 8.13),
 * so two pairs are compared by {@link unorderedKey}.
 */
export type UnorderedPair = readonly [string, string];

/**
 * Give the directed pairs among a value's singles, in order. A single of another base type, which a
 * `directedPair` binding never holds, gives none.
 *
 * @param singles The value's singles, as the view shows them or the correct response holds them.
 * @returns The pairs.
 */
export const pairsOf = (singles: readonly Single[]): readonly Pair[] =>
  singles.flatMap((single) =>
    single.baseType === "directedPair" ? [{ chip: single.value[0], target: single.value[1] }] : [],
  );

/**
 * Give the `pair`s among a value's singles, in order, each as written. A single of another base
 * type, which a `pair` binding never holds, gives none.
 *
 * @param singles The value's singles, as the view shows them or the correct response holds them.
 * @returns The pairs.
 */
export const unorderedPairsOf = (singles: readonly Single[]): readonly UnorderedPair[] =>
  singles.flatMap((single) => (single.baseType === "pair" ? [single.value] : []));

/**
 * Write a pair in plate's lexical form of a `directedPair`, as `format` in
 * `#plate/model/values.ts` writes one: the chip, one space, the target. An island posts it, the
 * server's decode reads it back to the same pair, and two pairs with one text are one pair.
 *
 * @param pair The pair.
 * @returns Its lexical form.
 */
export const pairText = (pair: Pair): string => `${pair.chip} ${pair.target}`;

/**
 * Key a `pair` by what it means: its two identifiers in code-unit order and one space between
 * them, the same whichever the response wrote first.
 *
 * @param pair The pair.
 * @returns Its key.
 */
export const unorderedKey = ([first, second]: UnorderedPair): string =>
  first < second ? `${first} ${second}` : `${second} ${first}`;
