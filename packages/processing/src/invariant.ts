/**
 * The package's one invariant door: a condition the surrounding code has already established,
 * such as a node the compiler typed or a tuple this package built itself. A violation is a defect
 * of the package, never a property of its input (every input that can be wrong is a typed refusal
 * or failure), so it throws, as grizzle's engine's door does; nothing catches it.
 *
 * @module
 */

/**
 * Assert a condition the code has established. It narrows like any assertion.
 *
 * @param condition - The condition.
 * @param what - What it establishes, for the defect's message.
 */
export const invariant: (condition: boolean, what: string) => asserts condition = (
  condition,
  what,
) => {
  if (!condition) {
    throw new Error(`@qti-pie/processing internal invariant: ${what}`);
  }
};
