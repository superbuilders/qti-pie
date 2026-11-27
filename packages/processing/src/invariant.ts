/**
 * The package's two doors that throw, which nothing catches, as grizzle's engine's door does: an
 * invariant, a condition the surrounding code has already established, such as a node the
 * compiler typed or a tuple this package built itself, whose violation is a defect of the
 * package; and a contract, what the package's types cannot state that its caller must hold, such
 * as a response map total over the item's declared responses, whose violation is a defect of the
 * caller. Every input a candidate or an author can make wrong is a typed refusal or failure.
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

/**
 * A caller's broken contract: what it had to hold, which the package's types cannot state.
 */
export class BrokenContractError extends Error {
  readonly _tag = "BrokenContract";
  readonly what: string;

  /**
   * @param what - What the caller had to hold.
   */
  constructor(what: string) {
    super(`@qti-pie/processing broken contract: ${what}`);
    this.name = "BrokenContractError";
    this.what = what;
  }
}

/**
 * Assert what a caller must hold and the types cannot state. A violation is the caller's defect.
 *
 * @param condition - The condition.
 * @param what - What the caller must hold, for the defect's message.
 */
export const contract: (condition: boolean, what: string) => asserts condition = (
  condition,
  what,
) => {
  if (!condition) {
    throw new BrokenContractError(what);
  }
};
