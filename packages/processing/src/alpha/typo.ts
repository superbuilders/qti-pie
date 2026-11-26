/**
 * The roster's one typo policy, which `unit-near` and `phrase-distance` share: optimal string
 * alignment distance (Damerau-Levenshtein restricted to adjacent swaps, each one change), bounded,
 * and `typo(w, t)`, the allowance a typed word gets against a target. Characters are code points.
 *
 * @module
 */
import { byCodePoints, charsOf } from "#processing/alpha/text.ts";

/**
 * The OSA distance between two texts, or `bound + 1` once it passes `bound`.
 *
 * @param a - One text.
 * @param b - The other.
 * @param bound - The greatest distance that matters.
 * @returns The distance, at most `bound + 1`.
 */
export const editDistance = (a: string, b: string, bound: number): number => {
  const as = charsOf(a);
  const bs = charsOf(b);
  if (Math.abs(as.length - bs.length) > bound) {
    return bound + 1;
  }

  let before: readonly number[] = [];
  let previous: readonly number[] = Array.from({ length: bs.length + 1 }, (_, j) => j);
  for (let i = 1; i <= as.length; i += 1) {
    const current = [i];
    let best = i;
    for (let j = 1; j <= bs.length; j += 1) {
      let v = Math.min(
        (previous[j] ?? 0) + 1,
        (current[j - 1] ?? 0) + 1,
        (previous[j - 1] ?? 0) + (as[i - 1] === bs[j - 1] ? 0 : 1),
      );
      if (i > 1 && j > 1 && as[i - 1] === bs[j - 2] && as[i - 2] === bs[j - 1]) {
        v = Math.min(v, (before[j - 2] ?? 0) + 1);
      }

      current.push(v);
      best = Math.min(best, v);
    }
    if (best > bound) {
      return bound + 1;
    }

    before = previous;
    previous = current;
  }

  return previous[bs.length] ?? 0;
};

/**
 * A text's characters in code point order, the multiset a permutation shares.
 *
 * @param text - The text.
 * @returns Its characters sorted.
 */
const sortedChars = (text: string): string => charsOf(text).toSorted(byCodePoints).join("");

/**
 * The typo allowance a target of a length gives: 0 below 4 letters, 1 for 4 to 8 and 2 for 9 or
 * more.
 *
 * @param length - The target's length.
 * @returns The allowance.
 */
const allowanceOf = (length: number): number => {
  if (length < 4) {
    return 0;
  }

  return length <= 8 ? 1 : 2;
};

/**
 * `typo(w, t)`: none where the typed word has fewer than 3 letters or another first letter than the
 * target; the allowance is 0 below 4 letters of the target, 1 for 4 to 8 and 2 for 9 or more; none
 * where the OSA distance passes it, or where the target has 4 letters and the typed word is no
 * permutation of it; else the distance.
 *
 * @param typed - The typed word.
 * @param target - The target word.
 * @returns The typo's distance, or none.
 */
export const typoDistance = (typed: string, target: string): number | undefined => {
  const typedChars = charsOf(typed);
  const targetChars = charsOf(target);
  if (typedChars.length < 3 || typedChars[0] !== targetChars[0]) {
    return undefined;
  }

  const allowance = allowanceOf(targetChars.length);
  const d = editDistance(typed, target, allowance);
  if (d > allowance) {
    return undefined;
  }

  if (
    targetChars.length === 4 &&
    !(typedChars.length === targetChars.length && sortedChars(typed) === sortedChars(target))
  ) {
    return undefined;
  }

  return d;
};
