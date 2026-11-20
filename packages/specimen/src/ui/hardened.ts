/**
 * The flags plate's UI suite runs under, and its refusal to run without them: the testing
 * library's hardened flags, on every process of the run, its parent and each worker.
 *
 * Node reads the flags from its own command line alone here: the machine's Node drops what
 * `NODE_OPTIONS` holds without a word, so a flag set there never applies. The `test:ui` script puts
 * them on the parent's command line, `vitest.ui.config.ts` hands them to each worker as its
 * `execArgv`, and each process checks its own before a case runs.
 *
 * @module
 */
import { HARDENED_FLAGS } from "@bjornpagen/testing/runner";
import { Data } from "effect";

/**
 * A process of the suite's run started without some of the hardened flags.
 */
class HardenedFlagsMissing extends Data.TaggedError("HardenedFlagsMissing")<{
  readonly missing: readonly string[];
}> {
  /**
   * The flags missing, and where they go.
   */
  override get message(): string {
    return `Plate's UI suite runs only under the testing library's hardened flags, and this process lacks ${this.missing.join(" ")}. Run it with \`pnpm run test:ui\`, which puts them on node's command line; NODE_OPTIONS does not carry them.`;
  }
}

/**
 * Refuse to go on in a process Node started without every hardened flag on its command line.
 *
 * @throws {HardenedFlagsMissing} When a flag is missing from `process.execArgv`.
 */
export const requireHardened = (): void => {
  const missing = HARDENED_FLAGS.filter((flag) => !process.execArgv.includes(flag));

  if (missing.length > 0) {
    throw new HardenedFlagsMissing({ missing });
  }
};
