import { defineConfig } from "vitest/config";

/**
 * Qti-pie's database suites, which run only through the machine's one database lock
 * (`pnpm run test:specimen-db`), never in the free runs.
 */
export default defineConfig({
  test: {
    // @bjornpagen/testing's setup draws the run seed every searched() test reads, or replays a given one.
    globalSetup: ["@bjornpagen/testing/vitest/global-setup"],
    // A hang guard, never a budget.
    hookTimeout: 60_000,
    include: ["suites/**/*.test.ts"],
    reporters: [
      "default",
      ["@bjornpagen/testing/vitest/reporter", { examples: { kind: "allowed" } }],
    ],
    testTimeout: 1_800_000,
  },
});
