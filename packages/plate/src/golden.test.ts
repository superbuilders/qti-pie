/**
 * The golden grading data is the recording its pin names: its `SHA256SUMS` has the pinned digest,
 * and every file it lists has the digest it lists.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { goldenDigest, goldenDirectory } from "#plate/test/golden.ts";

/**
 * Give the SHA-256 of some bytes, in hexadecimal.
 *
 * @param bytes The bytes.
 * @returns The digest.
 */
const digestOf = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

/**
 * Read a file of the golden data.
 *
 * @param root The golden data's directory.
 * @param relative The file's path in it.
 * @returns Its bytes.
 */
const goldenFile = (root: string, relative: string) =>
  Effect.tryPromise(() => readFile(path.join(root, relative)));

describe("the golden grading data", { tags: ["grading-golden"] }, () => {
  it.effect("is the recording its pin names, every file as SHA256SUMS lists it", () =>
    Effect.gen(function* pinned() {
      const root = yield* goldenDirectory;
      const sums = yield* goldenFile(root, "SHA256SUMS");

      assert.strictEqual(digestOf(sums), goldenDigest);

      const listed = new TextDecoder()
        .decode(sums)
        .split("\n")
        .filter((line) => line !== "")
        .map((line) => ({ digest: line.slice(0, 64), relative: line.slice(66) }));
      const read = yield* Effect.all(
        listed.map(({ relative }) => Effect.map(goldenFile(root, relative), digestOf)),
        { concurrency: "unbounded" },
      );

      assert.deepStrictEqual(
        read,
        listed.map(({ digest }) => digest),
      );
    }),
  );
});
