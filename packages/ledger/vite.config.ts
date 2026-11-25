import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // @bjornpagen/testing's setup draws the run seed every searched() test reads, or replays a given
    // one; the ledger's generates and installs the result suite's composition where a lane names its
    // lease.
    globalSetup: ["@bjornpagen/testing/vitest/global-setup", "./src/test/result-install.ts"],
    // A hang guard, never a budget.
    hookTimeout: 60_000,
    include: ["src/**/*.test.ts"],
    reporters: [
      "default",
      ["@bjornpagen/testing/vitest/reporter", { examples: { kind: "allowed" } }],
    ],
    testTimeout: 60_000,
  },
});
