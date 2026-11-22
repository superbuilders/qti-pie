/**
 * An island's root as it stands where the author wrote no class and no `data-*` on the interaction,
 * for the suites that render an island apart from the shell: written here, outside plate's UI,
 * whose lint refuses an object's `className` key, which a root carries.
 *
 * Test support: nothing outside `src/test/` and test files imports it.
 *
 * @module
 */

/**
 * The root of an interaction the author wrote no class and no `data-*` on.
 */
export const bareRoot = { className: undefined } as const;
