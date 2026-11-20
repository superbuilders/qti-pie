import { HARDENED_FLAGS } from "@bjornpagen/testing/runner";
import { defineConfig } from "vitest/config";
import { requireHardened } from "#specimen/ui/hardened.ts";

/**
 * How long a test or hook of plate's UI suite may take before vitest fails it bare: a hang guard,
 * never a budget. Each search states its own longer bound and reports where it stopped.
 */
const timeoutMs = 60_000;

requireHardened();

/**
 * `test:ui`: plate's UI suite, `src/ui/*.test.ts`, under the testing library's hardened flags. The
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
    hookTimeout: timeoutMs,
    include: ["src/ui/*.test.ts"],
    reporters: [
      "default",
      ["@bjornpagen/testing/vitest/reporter", { examples: { kind: "allowed" } }],
    ],
    setupFiles: ["src/ui/setup.ts"],
    testTimeout: timeoutMs,
  },
});
