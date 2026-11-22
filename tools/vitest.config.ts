import { defineConfig } from "vitest/config";

/**
 * The repository root's own suites in `tools/`: what holds a package from outside it, such as
 * plate's module graph by the root's one reader of it (`#tools/module-graph.ts`). `pnpm run
 * test:tools` runs them, and qti-pie's trunk runs that.
 */
export default defineConfig({
  test: {
    // @bjornpagen/testing's setup draws the run seed, or replays a given one (`TEST_SEED`).
    globalSetup: ["@bjornpagen/testing/vitest/global-setup"],
    // A hang guard, never a budget.
    hookTimeout: 60_000,
    include: ["tools/**/*.test.ts"],
    reporters: [
      "default",
      ["@bjornpagen/testing/vitest/reporter", { examples: { kind: "allowed" } }],
    ],
    testTimeout: 60_000,
  },
});
