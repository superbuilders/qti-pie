/**
 * The counts the interactions that associate choices judge a response by: how often each
 * identifier, or each pair's key, occurs in a bag of them.
 *
 * @module
 */

/**
 * Count how often each identifier occurs, in order of first occurrence. The counts are `bigint`,
 * as QTI's counts are (`match-max`, `match-min`, `max-associations`), so a count meets its limit
 * with no conversion; an identifier the bag lacks has no entry, a count of `0n`.
 *
 * @param identifiers The identifiers, with repeats.
 * @returns Each identifier with its count.
 */
export const countsOf = (identifiers: readonly string[]): ReadonlyMap<string, bigint> => {
  const counts = new Map<string, bigint>();

  for (const identifier of identifiers) {
    counts.set(identifier, (counts.get(identifier) ?? 0n) + 1n);
  }

  return counts;
};
