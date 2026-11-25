import { Effect } from "effect";
import { defineConfig } from "vitest/config";
import { cacheTags } from "#plate/test/caches.ts";

/**
 * No test or hook here is bounded by the wall clock, Vitest's none: a verdict never rests on how
 * long the machine took to let the work run. A search's case is held by its `caseHang`, the testing
 * library's work guard; a test that runs no search is the gate's to see hung, by its unit's lack of
 * progress.
 */
const unbounded = 0;

export default defineConfig(async () => ({
  test: {
    hookTimeout: unbounded,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // One tag per cache under ~/.cache/qti-pie. A missing cache fails the tests that carry its tag,
    // with a message naming the missing path and how to fetch it (`src/test/setup.ts`).
    setupFiles: ["src/test/setup.ts"],
    tags: [...(await Effect.runPromise(cacheTags))],
    testTimeout: unbounded,
  },
}));
