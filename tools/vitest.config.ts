import { defineConfig } from "vitest/config";

/**
 * The repository root's own suites in `tools/`: what holds a package from outside it, such as
 * plate's module graph by the root's one reader of it (`#tools/module-graph.ts`). `pnpm run
 * test:tools` runs them, and qti-pie's trunk runs that.
 */
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
     * @bjornpagen/testing's setup draws the run seed, or replays a given one (`TEST_SEED`).
     */
    globalSetup: ["@bjornpagen/testing/vitest/global-setup"],
    hookTimeout: unbounded,
    include: ["tools/**/*.test.ts"],
    reporters: [
      "default",
      ["@bjornpagen/testing/vitest/reporter", { examples: { kind: "allowed" } }],
    ],
    testTimeout: unbounded,
  },
});
