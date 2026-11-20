/**
 * Read a pinned file of the spec cache, `~/.cache/qti-pie/`, for a test whose oracle it is. A test
 * never skips for want of it: an absent or changed file fails the test with the file's path and
 * the command that fills the cache.
 */
import { Effect, FileSystem, Schema } from "effect";
import { Digest } from "effect/crypto";
import { cacheDirectory } from "#pantry/test/spec-cache/pins.ts";

/**
 * The command that fills the spec cache, `src/test/spec-cache/fetch.ts`, which every error of a
 * missing or changed cached file names as the repair.
 */
export const fetchSpecsCommand = "pnpm --filter @qti-pie/pantry run fetch-specs";

/**
 * A pinned file of the spec cache is absent. `file` is where it belongs.
 */
export class SpecFileMissing extends Schema.TaggedError<SpecFileMissing>()("SpecFileMissing", {
  file: Schema.String,
}) {
  /**
   * Which file is absent, and how to fill the cache.
   */
  override get message(): string {
    return `The spec cache holds no ${this.file}, which this test reads as its oracle. Run \`${fetchSpecsCommand}\` to download every pinned specification file into the cache, each checked against its pin.`;
  }
}

/**
 * A cached file's bytes do not hash to its pin: `expected` is the pinned SHA-256 and `actual` the
 * digest of the bytes read.
 */
export class SpecFileMismatch extends Schema.TaggedError<SpecFileMismatch>()("SpecFileMismatch", {
  actual: Schema.String,
  expected: Schema.String,
  file: Schema.String,
}) {
  /**
   * Which file differs from its pin, and the two ways to settle it.
   */
  override get message(): string {
    return `The cached ${this.file} has SHA-256 ${this.actual}, not the pinned ${this.expected}. Run \`${fetchSpecsCommand}\` to download it again; if the published file itself changed, re-pin it in src/test/spec-cache/pins.ts.`;
  }
}

/**
 * Read a pinned file of the spec cache, checked against its pin.
 *
 * @param pin - The file's path under the cache and its SHA-256 (`#pantry/test/spec-cache/pins.ts`).
 * @returns The file's bytes.
 */
export const readPinned = Effect.fn("test.specCache.readPinned")(function* readPinned(pin: {
  readonly path: string;
  readonly sha256: string;
}) {
  const fs = yield* FileSystem.FileSystem;
  const file = `${yield* cacheDirectory}/${pin.path}`;
  if (!(yield* fs.exists(file))) {
    return yield* new SpecFileMissing({ file });
  }

  const bytes = yield* fs.readFile(file);
  const actual = yield* (yield* Digest.Digest).digestHex(Digest.sha256, bytes);
  if (actual !== pin.sha256) {
    return yield* new SpecFileMismatch({ actual, expected: pin.sha256, file });
  }

  return bytes;
});
