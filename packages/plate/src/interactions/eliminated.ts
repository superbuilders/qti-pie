/**
 * The options a host has eliminated, a test's cross-out, by the response they are options of: what
 * the picks groups read to disable and describe each one (`Eliminated` in
 * `#plate/ui/picks/eliminated.tsx`). Pure, so its rule is checked apart from any page
 * (`eliminated.test.ts`), and safe for a page to load.
 *
 * @module
 */

/**
 * One eliminated option of an item: the identifier of the response its interaction binds, and the
 * option's identifier. Two interactions may share an option's identifier, so the response keeps
 * one's cross-out from the other's.
 */
export type EliminatedOption = readonly [response: string, identifier: string];

/**
 * Group eliminated options by the response they are options of.
 *
 * @param options The options, in any order, each once or more.
 * @returns Each response's eliminated identifiers, by its identifier; a response none of whose
 *   options is eliminated is absent.
 */
export const eliminatedBy = (
  options: readonly EliminatedOption[],
): ReadonlyMap<string, ReadonlySet<string>> => {
  const grouped = new Map<string, Set<string>>();

  for (const [response, identifier] of options) {
    grouped.set(response, (grouped.get(response) ?? new Set<string>()).add(identifier));
  }

  return grouped;
};
