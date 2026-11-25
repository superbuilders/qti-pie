/**
 * The text a case's item prints, a fixed function of where it stands, so a case is its dimensions
 * alone and two cases differ only where their dimensions do. Short text is one word; long text is
 * a phrase that wraps in a narrow column.
 *
 * @module
 */
import { Array as Arr } from "effect";
import { dimension } from "#specimen/dimension.ts";

/**
 * How long a run of text is: one word, or a phrase long enough to wrap.
 */
export const length = dimension("Text", [
  ["short", "Short", "short"],
  ["long", "Long", "long"],
]);

/**
 * How long a run of text is.
 */
export type Length = (typeof length.values)[number]["value"];

/**
 * The words, each distinct, so no two runs of a case read alike. A K-3 child's words.
 */
const words = [
  "cat",
  "sun",
  "map",
  "hat",
  "cup",
  "fox",
  "bed",
  "pig",
  "jam",
  "owl",
  "bus",
  "egg",
] as const;

/**
 * What a long run says after its word.
 */
const tails = [
  "that sat in the warm sun all afternoon by the big red barn",
  "which the children found under the old oak tree near the pond",
  "that rolled down the long green hill and into the muddy river",
  "which hid behind the tall stack of books in the school library",
] as const;

/**
 * The word at a place, cycling once the words run out, a number after it then so it stays
 * distinct.
 *
 * @param at The place, from 0.
 * @returns The word.
 */
export const word = (at: number): string => {
  const round = Math.floor(at / words.length);
  const base = Arr.getUnsafe(words, at % words.length);

  return round === 0 ? base : `${base} ${String(round + 1)}`;
};

/**
 * The run of text at a place: its word, and for a long run a phrase after it.
 *
 * @param held How long it is.
 * @param at The place, from 0.
 * @returns The text.
 */
export const run = (held: Length, at: number): string => {
  switch (held) {
    case "short": {
      return word(at);
    }
    case "long": {
      return `the ${word(at)} ${Arr.getUnsafe(tails, at % tails.length)}`;
    }
  }
};
