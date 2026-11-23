/**
 * The export of a package, named by the name it was imported under: every document the database
 * holds for it rebuilt from its scan and written in its charset, and every media file's bytes read
 * from the content-addressed store by the digest its `Media` row states (fin.md D6, §4.6). The
 * database is no document store: a document's one representation is its tree, so the export
 * writes it as canonical XML, and a media file's bytes are the store's alone.
 *
 * A package's entries are its `Entry` rows, by path, each read with its media digest where it is
 * media (`#pantry/export/scan.ts` `entriesOf`). A document is read by one ordered scan of its nodes
 * at its key, the package and its path, page by page (`documentScan`, `#pantry/export/pages.ts`),
 * assembled with one stack (`#pantry/model/assemble.ts`) and written by `unshred` in its export
 * charset; a media file is the bytes `MediaStore` (`#pantry/package/media.ts`) holds under its
 * digest. No tree is walked and no query recurses.
 */
import { Db } from "@bjornpagen/grizzle/runtime";
import type { DbLayer, OpenError, CallError } from "@bjornpagen/grizzle/runtime";
import { Array as Arr, Effect, FileSystem, Order, Path, Schema, Stream } from "effect";
import type { PlatformError } from "effect";
import { AuthorLogin } from "#pantry/db/served.ts";

import { addRow, emptyScan, scannedRows } from "#pantry/export/pages.ts";
import type { DocumentRowCount } from "#pantry/export/pages.ts";
import { scanXml } from "#pantry/export/render.ts";
import type { AssembleError } from "#pantry/model/assemble.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { MediaStore } from "#pantry/package/media.ts";
import type { MediaMissing } from "#pantry/package/media.ts";
import { writeZip } from "#pantry/package/zip.ts";
import type { ZipEntry } from "#pantry/package/zip.ts";
import type { AuthorRole } from "#pantry/qti/roles.ts";
import { codePointOrder } from "@qti-pie/crust/charset.ts";
import type { EncodeError } from "@qti-pie/crust/errors.ts";

/**
 * The rows each page of a document's export scan asks for. A page is one flight of the scan's
 * statements, so its size trades round trips against the rows held at once: a document of the
 * corpus is a few pages of this size, and a page holds a few thousand rows with their attributes.
 *
 * @limitKind provisional
 * @owner pantry's export (src/export/package.ts, exportEntries)
 * @unit rows
 * @scope each page of one document's export scan
 * @guards a scan of no pages holds a whole document's rows and their attributes at once, and one flight's answer grows
 *   with the largest document
 * @measure export the corpus's largest documents from a private cluster at pages of 100, 1,000 and 10,000 rows,
 *   recording the time and the peak memory of each, and keep the smallest page past which the time stops falling
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const exportPageRows = 1000;

/**
 * An export of a name that no imported package has.
 */
export class PackageNotFound extends Schema.TaggedError<PackageNotFound>()("PackageNotFound", {
  /**
   * The name the export named.
   */
  package: Schema.String,
}) {
  /**
   * What is missing, naming the name.
   */
  override get message(): string {
    return `No imported package has the name ${this.package}.`;
  }
}

/**
 * What can stop an export before it writes: the database, a name no package has, a document whose
 * scanned rows are not one document's, one that cannot be written in its charset, or a media file
 * the store does not hold.
 */
type EntriesError =
  | OpenError
  | CallError
  | PackageNotFound
  | AssembleError
  | DocumentRowCount
  | EncodeError
  | MediaMissing;

/**
 * The entries an export of the package `name` names writes, by path, without writing any.
 *
 * The entries are read once, each media entry with its digest. Each document is scanned in pages of
 * {@link exportPageRows} rows, assembled, and written by `unshred` in its export charset; a document
 * that cannot be written in that charset fails here, and nothing falls back to another. Each media
 * entry is the bytes the store holds under its digest. Every document is an entry of kind
 * `document` and every media row one of kind `media`: the database holds it, as the law "Entry
 * kind" states (`#pantry/qti/package.ts`), and refused every write that broke it, so the export
 * reads each entry by its kind and checks the law again nowhere.
 *
 * The entries and each page are separate reads, each in a snapshot of its own. They agree because
 * a package is written once, in one transaction, and never changed: no relation of the schema is
 * mutable, and an immutable owner's family is fixed when it is inserted.
 *
 * Fails with `PackageNotFound` when no imported package has the name, before any scan.
 *
 * @param name - The imported package's name, its key.
 * @returns The path and bytes of every entry. Fails with the database's, the scan's, the encoder's
 *   or the store's error, or `PackageNotFound`, every one an export raises before it writes.
 */
export const exportEntries = Effect.fn("export.exportEntries")(function* exportEntries(
  name: string,
): Effect.fn.Return<
  readonly ZipEntry[],
  EntriesError,
  AuthorLogin | DbLayer<AuthorRole> | MediaStore
> {
  yield* Effect.annotateCurrentSpan({ package: name, pageSize: exportPageRows });

  const login = yield* AuthorLogin;
  const store = yield* MediaStore;
  const db = yield* Db.open(login.roles.author, {});
  if ((yield* db.workload.packageOf.once({ facts: {}, params: { name } })).size === 0) {
    return yield* new PackageNotFound({ package: name });
  }

  // The database delivers the entries as a set; the zip's order is the paths' code point order, the
  // database's own text order (C.UTF-8), so an export of one package is one zip, byte for byte.
  const listed = Arr.sort(
    yield* db.workload.entriesOf.once({ facts: {}, params: { package: name } }),
    Order.mapInput(codePointOrder, ({ path }: { readonly path: string }) => path),
  );
  const entries = yield* Effect.all(
    listed.map((entry): Effect.Effect<ZipEntry, EntriesError> => {
      const { path } = entry;

      if (entry.kind === "media") {
        return Effect.map(store.get(entry.media.value.digest), (bytes) => ({ bytes, path }));
      }

      return Stream.runFold(
        scannedRows(
          (window) =>
            db.workload.documentScan.once({
              facts: {},
              params: { package: name, path },
              window,
            }),
          exportPageRows,
        ),
        emptyScan<Composed>,
        addRow,
      ).pipe(
        Effect.flatMap((scan) => scanXml({ package: name, path }, scan)),
        Effect.map((bytes) => ({ bytes, path })),
        Effect.withSpan("export.scanDocument", { attributes: { package: name, path } }),
      );
    }),
  );
  yield* Effect.annotateCurrentSpan({
    documents: listed.filter(({ kind }) => kind === "document").length,
    entries: entries.length,
  });

  return entries;
});

/**
 * Write the package `name` names to `target`: a directory of the files it was imported from,
 * or, when `target` ends `.zip`, one zip file holding the same entries.
 *
 * The entries are those of {@link exportEntries}, all read, assembled and encoded before anything
 * is written, so an export that cannot be made writes nothing. A zip target holds those entries at
 * those paths, written by `writeZip`, and its directory is created when absent.
 *
 * @param name - The imported package's name.
 * @param target - The directory to write under, or the `.zip` file to write, created when absent.
 * @returns The entries it wrote, in the order it wrote them. Fails with the database's, the
 *   scan's, the encoder's, the store's or the file system's error.
 */
export const exportPackage = Effect.fn("export.exportPackage")(function* exportPackage(
  name: string,
  target: string,
): Effect.fn.Return<
  readonly ZipEntry[],
  EntriesError | PlatformError.PlatformError,
  AuthorLogin | DbLayer<AuthorRole> | MediaStore | FileSystem.FileSystem | Path.Path
> {
  yield* Effect.annotateCurrentSpan({ package: name, target });

  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const entries = yield* exportEntries(name);

  if (target.endsWith(".zip")) {
    yield* fs.makeDirectory(path.dirname(target), { recursive: true });
    yield* fs.writeFile(target, writeZip(entries));

    return entries;
  }

  for (const entry of entries) {
    const file = path.join(target, entry.path);

    yield* fs.makeDirectory(path.dirname(file), { recursive: true });
    yield* fs.writeFile(file, entry.bytes);
  }

  return entries;
});
