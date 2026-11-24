/**
 * A package's media bytes, outside the database: the content-addressed store each media entry's
 * bytes live in, under the SHA-256 its `Media` row states (`#pantry/qti/package.ts`). The database
 * is no document store: it holds a document as its tree alone and a media file as its digest
 * alone, so the import puts each media file's bytes here before it writes the package's rows
 * (`importPackage` of `#pantry/import/package.ts`), and the export reads them back by digest
 * (`exportEntries` of `#pantry/export/package.ts`).
 *
 * A digest names one sequence of bytes, so a store never holds two files under one name, a put of
 * bytes already held changes nothing, and a get returns the bytes whose digest it names. The store
 * is the caller's: the QTI install's is its media CDN, which its publisher fills itself; this
 * package's command line uses a folder ({@link directoryMediaStore}, {@link localMediaStore}), and
 * a test one held in memory ({@link memoryMediaStore}).
 *
 * A digest is grizzle's `Sha256`, the 32 octets of the SHA-256: a store writes it as 64 lowercase
 * hexadecimal digits only where it names a file outside the program, its key, and an error writes
 * it so in its message.
 */
import type { Sha256 } from "@bjornpagen/grizzle";
import { Config, Context, Effect, FileSystem, Layer, Option, Path, Schema } from "effect";

/**
 * The store holds no file under a digest a `Media` row states: the bytes were never put there, or
 * were taken away. `digest` is the digest in hexadecimal, as the message writes it.
 */
export class MediaMissing extends Schema.TaggedError<MediaMissing>()("MediaMissing", {
  digest: Schema.String,
  reason: Schema.String,
}) {
  /**
   * The digest, why the store gave no bytes, and the repair.
   */
  override get message(): string {
    return `The media store holds no file under the SHA-256 ${this.digest}: ${this.reason}. A package's media bytes are put in the store when it is imported, so import the package again from its source into this store, or point the command at the store it was imported into.`;
  }
}

/**
 * The store could not take a file's bytes under their digest, so the package that names them is
 * not written. `digest` is the digest in hexadecimal, as the message writes it.
 */
export class MediaUnstored extends Schema.TaggedError<MediaUnstored>()("MediaUnstored", {
  digest: Schema.String,
  reason: Schema.String,
}) {
  /**
   * The digest, and why the store refused the bytes.
   */
  override get message(): string {
    return `The media store could not take the file whose SHA-256 is ${this.digest}: ${this.reason}. Nothing of its package was written.`;
  }
}

/**
 * The content-addressed store of media bytes: `put` holds bytes under their digest, the SHA-256
 * the caller computed from them, and `get` gives the bytes a digest names.
 */
export class MediaStore extends Context.Service<
  MediaStore,
  {
    readonly get: (digest: Sha256) => Effect.Effect<Uint8Array, MediaMissing>;
    readonly put: (digest: Sha256, bytes: Uint8Array) => Effect.Effect<void, MediaUnstored>;
  }
>()("pantry/package/MediaStore") {}

/**
 * A store held in memory, empty when the layer is built: a test's, which reads back what its own
 * imports put, each file under its digest's hexadecimal, a `Map`'s key by value.
 */
export const memoryMediaStore = Layer.sync(MediaStore, () => {
  const held = new Map<string, Uint8Array>();

  return {
    get: (digest) =>
      Option.match(Option.fromNullishOr(held.get(digest.toHex())), {
        onNone: () =>
          Effect.fail(
            new MediaMissing({
              digest: digest.toHex(),
              reason: "no import into this store put it",
            }),
          ),
        onSome: Effect.succeed,
      }),
    put: (digest, bytes) =>
      Effect.sync(() => {
        held.set(digest.toHex(), bytes);
      }),
  };
});

/**
 * A store in a folder: each file at `<root>/sha256/<hex>`, its digest's 64 lowercase hexadecimal
 * digits, the key the media CDN gives it
 * (`cdnKeyOf` of `@edullm/qti-database/cdn`). A put writes the bytes to a file of its own in the
 * same folder and renames it into place, so the digest's path holds the whole file or none, and a
 * file already there is kept as it is.
 *
 * @param root - The folder.
 * @returns The store's layer, over the file system and its paths.
 */
export const directoryMediaStore = (root: string) =>
  Layer.effect(
    MediaStore,
    Effect.gen(function* opensFolder() {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const folder = path.join(root, "sha256");

      return {
        get: (digest) => {
          const file = path.join(folder, digest.toHex());

          return fs.readFile(file).pipe(
            Effect.mapError(
              (failure) =>
                new MediaMissing({
                  digest: digest.toHex(),
                  reason: `${file}: ${failure.message}`,
                }),
            ),
          );
        },
        put: (digest, bytes) => {
          const hex = digest.toHex();
          const file = path.join(folder, hex);

          return Effect.gen(function* putsFile() {
            if (yield* fs.exists(file)) {
              return;
            }

            yield* fs.makeDirectory(folder, { recursive: true });

            const staged = yield* fs.makeTempFile({ directory: folder, prefix: `${hex}.` });

            yield* fs.writeFile(staged, bytes);
            yield* fs.rename(staged, file);
          }).pipe(
            Effect.mapError(
              (failure) =>
                new MediaUnstored({ digest: hex, reason: `${folder}: ${failure.message}` }),
            ),
          );
        },
      };
    }),
  );

/**
 * The folder the command line's store is in, `QTI_PIE_MEDIA`, which is required. One store may
 * serve every local database: a digest names its bytes wherever they are put.
 */
const mediaFolder = Config.NonEmptyString("QTI_PIE_MEDIA");

/**
 * The command line's store: {@link directoryMediaStore} at {@link mediaFolder}.
 */
export const localMediaStore = Layer.unwrap(
  Effect.gen(function* readsFolder() {
    return directoryMediaStore(yield* mediaFolder);
  }),
);
