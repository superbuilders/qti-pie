/**
 * The English texts of the placement primitive's boards of boxes, which Associate and Graphic
 * Associate share (`#plate/ui/placement/`). One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * The boards of boxes' texts, keyed by the role each plays. A child makes each pair in a box of two
 * halves, and the placement primitive refuses a pair before anything changes: `pairsSelf` when a
 * chip would pair with itself, which every board's labels carry, and, in a box's own words,
 * `pairsMade` for a pair another box already makes and `pairsNotInGroup` for one a `match-group`
 * keeps apart. Once a step makes a pair, the primitive says `pairsPaired` after the step's own
 * words, for each pair the step made. `{chip}` is the chip that was moved and `{partner}` the chip
 * in the other half of the box, each by its visible text. `pairsBox` names a box as a whole, and
 * `pairsBoxFirst` and `pairsBoxSecond` each of its halves, so announcements and slots say where a
 * chip went and no two halves share a name (WCAG 2.4.6); `{n}` is the box's number from 1.
 */
export const pairsMessages = {
  pairsAtLeast: "Make at least {n} pairs.",
  pairsAtLeastOne: "Make at least 1 pair.",
  pairsAtMost: "Make at most {n} pairs.",
  pairsAtMostOne: "Make at most 1 pair.",
  pairsBox: "Pair {n}",
  pairsBoxFirst: "Pair {n}, first",
  pairsBoxSecond: "Pair {n}, second",
  pairsMade: "{chip} and {partner} are already a pair.",
  pairsNotInGroup: "{chip} doesn't go with {partner}.",
  pairsPaired: "{chip} and {partner} are a pair.",
  pairsSelf: "{chip} can't go with itself.",
} as const;
