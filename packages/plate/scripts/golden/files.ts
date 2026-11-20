/**
 * The files the golden posts, and the facts it records of each: a file value's identity is its
 * content, its SHA-256 digest (Bjorn, 2026-11-19), and QTI 3.0.1's BaseTypeEnum makes a file "any
 * sequence of octets (bytes) qualified by a content-type and an optional filename". Plate's
 * `FileValue` holds a file's name, size and type, never its bytes, so the golden states each file
 * it posts here, its bytes included, and records the digest of those bytes beside plate's lexical
 * form, the name.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { Option } from "effect";
import type { FileValue } from "#plate/model/values.ts";

/**
 * A file the golden posts: its name, its content type and its bytes.
 */
interface GoldenFile {
  readonly bytes: Uint8Array;
  readonly name: string;
  readonly type: string;
}

/**
 * The file a case posts to each response an Upload binds.
 */
const upload: GoldenFile = {
  bytes: new TextEncoder().encode("A golden upload: five cartons, ten chocolates each.\n"),
  name: "golden-upload.txt",
  type: "text/plain",
};

/**
 * Every file the golden posts, by its name.
 */
const goldenFiles: ReadonlyMap<string, GoldenFile> = new Map([[upload.name, upload]]);

/**
 * The file value a case posts to an Upload's response, as plate holds it.
 */
export const uploadedFile: FileValue = {
  name: upload.name,
  size: upload.bytes.length,
  type: upload.type,
};

/**
 * A file's facts as the golden records them: the SHA-256 of its bytes in hex, its content type, and
 * its filename, none (`null`) where it has no name.
 */
export type GoldenFileFacts = readonly [digest: string, type: string, name: string | null];

/**
 * Give the facts of a file the golden posted.
 *
 * @param file The file value, as plate holds it.
 * @returns Its facts.
 * @throws {Error} For a file the golden did not post, whose bytes it does not hold: no case gives
 *   one.
 */
export const fileFactsOf = (file: FileValue): GoldenFileFacts => {
  const posted = Option.getOrThrowWith(
    Option.fromUndefinedOr(goldenFiles.get(file.name)),
    () =>
      new Error(
        `golden: no case posts a file named ${JSON.stringify(file.name)}, so its bytes are unknown`,
      ),
  );

  return [
    createHash("sha256").update(posted.bytes).digest("hex"),
    posted.type,
    posted.name === "" ? null : posted.name,
  ];
};
