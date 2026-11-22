/**
 * Read a pinned file of the spec cache, `~/.cache/qti-pie/`, for a test whose oracle it is. A test
 * never skips for want of it: an absent or changed file fails the test with the file's path and
 * the command that fills the cache.
 */
import { Effect, FileSystem, Result, Schema } from "effect";
import { Digest } from "effect/crypto";
import { cacheDirectory } from "#pantry/test/spec-cache/pins.ts";
import { renderText } from "#pantry/test/spec-cache/render.ts";
import type { HtmlPin } from "#pantry/test/spec-sections.ts";

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

/**
 * A cached source held to its rendering alone renders to a text whose SHA-256 is not the pinned
 * one: it is not the copy that was judged.
 *
 * `file` is the source's path, `expected` the rendering's pin, and `actual` the SHA-256 of the
 * source's rendering by the recorded command, or the reference it holds that the command does not
 * decode.
 */
export class SpecRenderingMismatch extends Schema.TaggedError<SpecRenderingMismatch>()(
  "SpecRenderingMismatch",
  { actual: Schema.String, expected: Schema.String, file: Schema.String },
) {
  /**
   * Which file, what its rendering hashed to against the pin, and the command that fetches it
   * again.
   */
  override get message(): string {
    return `The cached ${this.file} renders to a text with SHA-256 ${this.actual}, not the pinned ${this.expected}. Run \`${fetchSpecsCommand}\` to download it again; if every download of it renders to the new text, review that text and re-pin it in src/test/spec-sections.ts.`;
  }
}

/**
 * Read a specification's cached HTML as its pin holds it: a byte-pinned page by its own SHA-256
 * ({@link readPinned}); a page held to its rendering alone by the SHA-256 of its rendering by the
 * recorded command, which must be the text rendering's pin.
 *
 * @param path - The HTML's path under the cache directory.
 * @param pin - How the HTML is held.
 * @param textSha256 - The pin of the HTML's text rendering.
 * @returns The HTML's bytes; a {@link SpecFileMissing}, a {@link SpecFileMismatch} or a
 *   {@link SpecRenderingMismatch} when it is not the judged copy.
 */
export const readPinnedHtml = Effect.fn("test.specCache.readPinnedHtml")(function* readPinnedHtml(
  path: string,
  pin: HtmlPin,
  textSha256: string,
) {
  if (pin.kind === "bytes") {
    return yield* readPinned({ path, sha256: pin.sha256 });
  }

  const fs = yield* FileSystem.FileSystem;
  const file = `${yield* cacheDirectory}/${path}`;
  if (!(yield* fs.exists(file))) {
    return yield* new SpecFileMissing({ file });
  }

  const bytes = yield* fs.readFile(file);
  const text = renderText(new TextDecoder().decode(bytes));
  if (Result.isFailure(text)) {
    return yield* new SpecRenderingMismatch({
      actual: `an undecodable ${text.failure.entity} at offset ${String(text.failure.offset)}`,
      expected: textSha256,
      file,
    });
  }

  const actual = yield* (yield* Digest.Digest).digestHex(
    Digest.sha256,
    new TextEncoder().encode(text.success),
  );
  if (actual !== textSha256) {
    return yield* new SpecRenderingMismatch({ actual, expected: textSha256, file });
  }

  return bytes;
});
