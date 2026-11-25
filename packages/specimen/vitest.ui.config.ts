import { HARDENED_FLAGS } from "@bjornpagen/testing/runner";
import { defineConfig } from "vitest/config";
import { requireHardened } from "#specimen/ui/hardened.ts";

/**
 * No test or hook here is bounded by the wall clock, Vitest's none: a verdict never rests on how
 * long the machine took to let the work run. A search's case is held by its `caseHang`, the testing
 * library's work guard; a test that runs no search is the gate's to see hung, by its unit's lack of
 * progress.
 */
const unbounded = 0;

requireHardened();

/**
 * `test:ui`: plate's UI suite, `src/ui/*.test.ts`, and the Alpha interactions' suite,
 * `src/alpha/*.test.ts`, under the testing library's hardened flags. The
 * parent process takes them from the `test:ui` script's command line, which this config refuses to
 * run without, and each worker from `execArgv`, which its setup checks
 * (`#specimen/ui/hardened.ts`).
 */
export default defineConfig({
  test: {
    execArgv: [...HARDENED_FLAGS],
    // @bjornpagen/testing's setup draws the run seed every searched() test reads, or replays a given
    // one (TEST_SEED, TEST_REPLAY), and its reporter tables what each search proved or estimated.
    globalSetup: ["@bjornpagen/testing/vitest/global-setup"],
    hookTimeout: unbounded,
    include: ["src/ui/*.test.ts", "src/alpha/*.test.ts"],
    reporters: [
      "default",
      ["@bjornpagen/testing/vitest/reporter", { examples: { kind: "allowed" } }],
    ],
    setupFiles: ["src/ui/setup.ts"],
    testTimeout: unbounded,
  },
});
