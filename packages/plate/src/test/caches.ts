/**
 * The caches under `~/.cache/qti-pie` that plate's unit tests read, the vitest test tag that marks
 * the tests reading each one, and the probe that fails such a test when its cache is missing.
 *
 * A missing cache fails every test that carries its tag, with {@link CacheMissing}'s message,
 * which names the missing path and how to fetch it: a run without a cache never passes on tests
 * it did not run. `src/test/setup.ts` holds each test to its tags' caches before it runs. A test
 * that should run only on request is left out by its tag (`--tags-filter`), never by its cache's
 * absence.
 *
 * Test support: `vite.config.ts` declares {@link cacheTags} as the unit run's tags, and a test that
 * reads the response-processing templates imports that cache's reader from here. Nothing here
 * fetches or writes a cache. vitest's `strictTags` (on by default) refuses a tag the run does not
 * declare.
 *
 * @module
 * @see https://vitest.dev/guide/test-tags
 */
import { access } from "node:fs/promises";
import path from "node:path";
import type { Config } from "effect";
import { Effect, Option, Schema } from "effect";
import { corpusRoot } from "#plate/test/corpus.ts";
import { goldenDirectory } from "#plate/test/golden.ts";
import { qtiPieCache } from "#plate/test/qti-pie.ts";

/**
 * Where QTI 3's response-processing templates are cached, `.cache/qti-pie/qti3/rptemplates` under
 * `HOME`, one `<name>.xml` per template.
 */
export const rptemplatesDirectory: Config.Config<string> = qtiPieCache("qti3", "rptemplates");

/**
 * The setting that relocates a cache: `PLATE_CORPUS_DIR` names the corpus root itself, and `HOME`
 * names the home folder every other cache sits under.
 */
type Variable = "HOME" | "PLATE_CORPUS_DIR";

/**
 * How each {@link Variable} relocates its cache, worded as the readers' own errors word it.
 */
const relocation: Record<Variable, string> = {
  HOME: "or set HOME to the home folder that holds .cache/qti-pie",
  PLATE_CORPUS_DIR: "or set PLATE_CORPUS_DIR to the folder that holds them",
};

/**
 * One cache a unit test reads, and the test tag that marks the tests reading it.
 */
export interface Cache {
  /**
   * The vitest tag a test carries when it reads this cache.
   */
  readonly tag: string;
  /**
   * The cache's contents, as a noun phrase.
   */
  readonly what: string;
  /**
   * The cache's file or directory, from the reader the tests themselves use.
   */
  readonly path: Config.Config<string>;
  /**
   * The files the tests read, relative to {@link Cache.path}, a directory. The probe looks for
   * each, in order, and names the first one missing. Absent when the tests need only `path`
   * itself, which the probe then looks for.
   */
  readonly files?: readonly string[];
  /**
   * How to put the cache at its path, as a clause that starts with a verb.
   */
  readonly fetch: string;
  readonly variable: Variable;
}

/**
 * Every cache, in the order the unit run declares their tags. The `fetch` texts follow the errors
 * each reader already gives.
 */
export const caches: readonly Cache[] = [
  {
    fetch: "extract the examples there, each nested zip into the X.zip.d/ folder beside it",
    path: corpusRoot,
    tag: "corpus",
    variable: "PLATE_CORPUS_DIR",
    what: "1EdTech's QTI 3 examples",
  },
  {
    fetch:
      "record it there with node packages/qti-pie/packages/plate/scripts/golden.ts, from the bank's local copies and the corpus, as the recording src/test/golden.ts pins",
    files: ["SHA256SUMS"],
    path: goldenDirectory,
    tag: "grading-golden",
    variable: "HOME",
    what: "the golden grading data",
  },
  {
    fetch:
      "fetch there, as <name>.xml, each template the tests name from https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/<name>.xml",
    path: rptemplatesDirectory,
    tag: "rptemplates",
    variable: "HOME",
    what: "QTI 3's response-processing templates",
  },
];

/**
 * One cache's test tag, structurally vitest's `TestTagDefinition`, declared here so this module
 * imports nothing from vitest. `description` is what `vitest --list-tags` prints for it.
 */
export interface CacheTag {
  readonly description: string;
  readonly name: string;
}

/**
 * The failure of a test whose cache is missing: `missing` is the first path the probe did not
 * find, and `repair` says how to put the cache there.
 */
class CacheMissing extends Schema.TaggedError<CacheMissing>()("CacheMissing", {
  missing: Schema.String,
  repair: Schema.String,
  tag: Schema.String,
  what: Schema.String,
}) {
  /**
   * The tests that fail, the path that is missing, and the repair.
   */
  override get message(): string {
    return `plate: the tests tagged ${this.tag} need ${this.what}, and ${this.missing} is missing. To run them, ${this.repair}.`;
  }
}

/**
 * How to supply a cache: its fetch, then how its setting relocates it.
 *
 * @param cache The cache.
 * @returns The repair, as a clause that starts with a verb.
 */
const repairOf = (cache: Cache): string => `${cache.fetch}, ${relocation[cache.variable]}`;

/**
 * Probe one cache's path, or each of its files in order, and fail when any is missing.
 *
 * Any failure of `access` counts as missing: the tests could not read the cache either.
 *
 * @param cache The cache.
 * @returns Nothing when every path is present; {@link CacheMissing} naming the first missing path
 *   otherwise, or a `ConfigError` when the cache's path cannot be resolved.
 */
export const requireCache = Effect.fnUntraced(function* requireCache(cache: Cache) {
  const at = yield* cache.path;
  const probes = cache.files?.map((file) => path.join(at, file)) ?? [at];
  const absent = yield* Effect.findFirst(probes, (probe) =>
    Effect.isFailure(Effect.tryPromise(() => access(probe))),
  );

  return yield* Option.isSome(absent)
    ? Effect.fail(
        new CacheMissing({
          missing: absent.value,
          repair: repairOf(cache),
          tag: cache.tag,
          what: cache.what,
        }),
      )
    : Effect.void;
});

/**
 * Give the unit run one test tag per cache, in {@link caches}' order, each described by its path
 * and how to fetch it. It probes nothing: a missing cache fails its tests when they run.
 *
 * It fails only with a `ConfigError`, for a path whose setting is unset.
 */
export const cacheTags: Effect.Effect<CacheTag[], Config.ConfigError> = Effect.all(
  caches.map((cache) =>
    cache.path.pipe(
      Effect.map((at): CacheTag => ({
        description: `Needs ${cache.what} at ${at}: ${repairOf(cache)}.`,
        name: cache.tag,
      })),
    ),
  ),
).pipe(Effect.withSpan("cacheTags"));
