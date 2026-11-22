import { Effect } from "effect";
import { defineConfig } from "vitest/config";
import { cacheTags } from "#plate/test/caches.ts";

/**
 * The default time a test or hook may take before vitest fails it. This machine runs many test
 * runs at once, at load averages near 400 on 64 cores, and there vitest's 5 s default fails tests
 * that pass in well under a second alone: boundary.test.ts's walks and write.test.ts's
 * `readSource` among them. A test that names its own timeout keeps it.
 */
const timeoutMs = 60_000;

export default defineConfig(async () => ({
  test: {
    hookTimeout: timeoutMs,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // One tag per cache under ~/.cache/qti-pie. A missing cache fails the tests that carry its tag,
    // with a message naming the missing path and how to fetch it (`src/test/setup.ts`).
    setupFiles: ["src/test/setup.ts"],
    tags: [...(await Effect.runPromise(cacheTags))],
    testTimeout: timeoutMs,
  },
}));
