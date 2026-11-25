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

/**
 * No test or hook of pantry is bounded by the wall clock, Vitest's none: a verdict never rests on
 * how long the machine took to let the work run. A search's case is held by its `caseHang`, the
 * testing library's work guard; a test that runs no search is the gate's to see hung, by its unit's
 * lack of progress.
 */
const unbounded = 0;

export default defineConfig({
  test: {
    // @bjornpagen/testing's setup draws the run seed every searched() test reads, or replays a given one.
    globalSetup: ["@bjornpagen/testing/vitest/global-setup", "./src/test/global-setup.ts"],
    projects: [
      {
        extends: true,
        test: {
          exclude: ["**/node_modules/**", ...databaseFiles],
          hookTimeout: unbounded,
          include: ["src/**/*.test.ts"],
          name: "free",
          sequence: { groupOrder: 1 },
          testTimeout: unbounded,
        },
      },
      {
        extends: true,
        test: {
          hookTimeout: unbounded,
          include: databaseFiles,
          name: "database",
          sequence: { groupOrder: 2 },
          testTimeout: unbounded,
        },
      },
    ],
    reporters: [
      "default",
      ["@bjornpagen/testing/vitest/reporter", { examples: { kind: "allowed" } }],
    ],
  },
});
