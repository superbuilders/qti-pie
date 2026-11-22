import { globSync, readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

/**
 * Test files that open the leased database: named `*.db.test.ts` or `*.packaging.test.ts`, or gated
 * on `hasLease` from `#pantry/test/settings.ts`. Read from the tree, so a new file joins by its
 * name or its gate and no list needs keeping.
 */
const databaseFiles = globSync("src/**/*.test.ts", { cwd: import.meta.dirname })
  .filter(
    (file) =>
      /\.(?:db|packaging)\.test\.ts$/u.test(file) ||
      readFileSync(`${import.meta.dirname}/${file}`, "utf-8").includes("hasLease"),
  )
  .toSorted();

// Each project's testTimeout and hookTimeout is a hang guard, never a budget.
export default defineConfig({
  test: {
    // @bjornpagen/testing's setup draws the run seed every searched() test reads, or replays a given one.
    globalSetup: ["@bjornpagen/testing/vitest/global-setup", "./src/test/global-setup.ts"],
    projects: [
      {
        extends: true,
        test: {
          exclude: ["**/node_modules/**", ...databaseFiles],
          hookTimeout: 60_000,
          include: ["src/**/*.test.ts"],
          name: "free",
          sequence: { groupOrder: 1 },
          testTimeout: 60_000,
        },
      },
      {
        extends: true,
        test: {
          hookTimeout: 60_000,
          include: databaseFiles,
          name: "database",
          sequence: { groupOrder: 2 },
          testTimeout: 60_000,
        },
      },
    ],
    reporters: [
      "default",
      ["@bjornpagen/testing/vitest/reporter", { examples: { kind: "allowed" } }],
    ],
  },
});
