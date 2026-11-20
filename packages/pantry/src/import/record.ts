/**
 * The entries of a package as the importer writes them: the `Package` row, keyed by its name; one
 * `Entry` row per file, keyed by its path, of the kind its file is; and one `Media` row per file
 * that is no document, stating the SHA-256 of its bytes. The entries are a set keyed by their
 * paths, since IMS Content Packaging gives an entry's place in the zip no meaning: no row holds a
 * listing order. No row holds a file's bytes: a document is written as its tree, and a media file's
 * bytes go to the content-addressed store under the digest its row states (`MediaStore` of
 * `#pantry/package/media.ts`), each as a {@link MediaFile}.
 */
import type { Addition } from "@bjornpagen/grizzle";
import { keyTextOf } from "#pantry/import/key-text.ts";
import type { PackagePath } from "#pantry/import/read.ts";
import type { Entry, Media, Package } from "#pantry/qti/package.ts";

/**
 * A media file of a package as its writer puts it in the content-addressed store: its path, its
 * bytes, and `digest`, the SHA-256 of the bytes as its `Media` row states it, the name the store
 * holds them under.
 */
export interface MediaFile {
  readonly bytes: Uint8Array;
  readonly digest: Addition<typeof Media>["digest"];
  readonly path: PackagePath;
}

/**
 * A package's entries as its writer writes them: the `Package` row, its entries and its media rows,
 * each keyed by the text of its key (`keyTextOf` of `#pantry/import/key-text.ts`), and the media
 * files whose bytes the store takes before the rows are written.
 */
export interface PackageRecord {
  readonly entries: ReadonlyMap<string, Addition<typeof Entry>>;
  readonly media: ReadonlyMap<string, Addition<typeof Media>>;
  readonly mediaFiles: readonly MediaFile[];
  readonly package: Addition<typeof Package>;
}

/**
 * Build a package's entries from its files: each path a document is read from is a `document`
 * entry, and every other file a `media` entry with its `Media` row.
 *
 * @param input - The package's identity, its documents' paths and its media files.
 * @param input.name - Its name, the key every row of it holds.
 * @param input.documents - The paths of its documents, the manifest's among them.
 * @param input.media - Every other file, with its bytes and their digest.
 * @returns The `Package` row, and each entry's and each media file's row by its key.
 */
export const packageRecordOf = (input: {
  readonly documents: readonly PackagePath[];
  readonly media: readonly MediaFile[];
  readonly name: Addition<typeof Package>["name"];
}): PackageRecord => ({
  entries: new Map<string, Addition<typeof Entry>>([
    ...input.documents.map(
      (path) =>
        [keyTextOf(input.name, path), { kind: "document", package: input.name, path }] as const,
    ),
    ...input.media.map(
      ({ path }) =>
        [keyTextOf(input.name, path), { kind: "media", package: input.name, path }] as const,
    ),
  ]),
  media: new Map(
    input.media.map(({ digest, path }) => [
      keyTextOf(input.name, path),
      { digest, package: input.name, path },
    ]),
  ),
  mediaFiles: input.media,
  package: { name: input.name },
});
