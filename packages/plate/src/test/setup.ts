/**
 * The unit run's setup file: before each test, require every cache its tags name.
 *
 * A test that carries a cache's tag fails with `CacheMissing`'s message, which names the
 * missing path and how to fetch it, when that cache is missing, rather than skipping or reading a
 * path that is not there. A hook or layer around the test that reads the cache first fails with
 * its own reader's error. Each cache is probed at most once per test file, the first time a test
 * that carries its tag runs.
 *
 * @module
 */
import { beforeEach } from "@effect/vitest";
import { Effect } from "effect";
import { caches, requireCache } from "#plate/test/caches.ts";

/**
 * Each cache's probe by tag, memoized so it runs at most once in this test file.
 */
const probes = new Map(
  caches.map((cache) => [cache.tag, Effect.runSync(Effect.cached(requireCache(cache)))] as const),
);

beforeEach(({ task }) =>
  Effect.runPromise(
    Effect.forEach(task.tags ?? [], (tag) => probes.get(tag) ?? Effect.void, { discard: true }),
  ),
);
