import { defineConfig } from "vitest/config";

/**
 * No test or hook here is bounded by the wall clock, Vitest's none: a verdict never rests on how
 * long the machine took to let the work run. A search's case is held by its `caseHang`, the testing
 * library's work guard; a test that runs no search is the gate's to see hung, by its unit's lack of
 * progress.
 */
const unbounded = 0;

export default defineConfig({
  test: {
    /**
     * @bjornpagen/testing's setup draws the run seed every searched() test reads, or replays a
     * given one.
     */
    globalSetup: ["@bjornpagen/testing/vitest/global-setup"],
    hookTimeout: unbounded,
    include: ["src/**/*.test.ts"],
    reporters: [
      "default",
      ["@bjornpagen/testing/vitest/reporter", { examples: { kind: "allowed" } }],
    ],
    testTimeout: unbounded,
  },
});
