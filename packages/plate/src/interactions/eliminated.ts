/**
 * The options a host has eliminated, a test's cross-out, by the response they are options of: what
 * the picks groups read to disable and describe each one (`Eliminated` in
 * `#plate/ui/picks/eliminated.tsx`). Pure, so its rule is checked apart from any page
 * (`eliminated.test.ts`), and safe for a page to load.
 *
 * @module
 */

/**
 * One eliminated option: the entry name its interaction's response posts under, from plate's
 * `entryName`, and the option's identifier. Two interactions may share an identifier, so the entry
 * name keeps one's cross-out from the other's.
 */
export type EliminatedOption = readonly [name: string, identifier: string];

/**
 * Group eliminated options by the entry name their response posts under.
 *
 * @param options The options, in any order, each once or more.
 * @returns Each response's eliminated identifiers, by its entry name; a response none of whose
 *   options is eliminated is absent.
 */
export const eliminatedBy = (
  options: readonly EliminatedOption[],
): ReadonlyMap<string, ReadonlySet<string>> => {
  const grouped = new Map<string, Set<string>>();

  for (const [name, identifier] of options) {
    grouped.set(name, (grouped.get(name) ?? new Set<string>()).add(identifier));
  }

  return grouped;
};
