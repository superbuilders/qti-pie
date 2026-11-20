/**
 * The path of one cache under `~/.cache/qti-pie`, where plate's tests and scripts find every input
 * fetched once outside the repository: {@link qtiPieCache}.
 *
 * A leaf: it imports nothing of plate's, so every module that names a cache path, the corpus
 * reader and the cache tags among them, reads it without an import cycle.
 *
 * @module
 */
import path from "node:path";
import { Config } from "effect";

/**
 * Construct the setting that gives a cache's path, `.cache/qti-pie/<segments>` under the home
 * folder `HOME` names.
 *
 * @example
 *   qtiPieCache("qti3", "xsd"); // "<HOME>/.cache/qti-pie/qti3/xsd"
 *
 * @param segments The cache's path under `.cache/qti-pie`, one segment each.
 * @returns The setting; reading it fails with a `ConfigError` when `HOME` is unset or empty.
 */
export const qtiPieCache = (...segments: readonly string[]): Config.Config<string> =>
  Config.NonEmptyString("HOME").pipe(
    Config.map((home) => path.join(home, ".cache", "qti-pie", ...segments)),
  );
