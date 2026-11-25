/**
 * The import's read, before the database: a package directory or `.zip` file in, the package as the
 * import writes it out, every file read once and every document it names parsed once (plan W5,
 * Q5.15; the W5 amendment's C19).
 *
 * The package is read whole (`readEntries`), under the name its caller gives it, the key its rows
 * are stored under (`PackageName`, `#pantry/qti/limits.ts`): a name that is none is refused before
 * anything is read ({@link BadPackageName}). Its manifest is decoded and shredded. Its `identifier`
 * is the package's data, which the database holds to its laws as it holds every attribute, never
 * its key. The documents it names are the (href, type) pairs of its resources whose type
 * `RootOfType` maps (spec reading 93, `namedDocuments`), and each path one names that an entry
 * holds is shredded once: the manifest's path is the manifest's alone, no resource's document
 * (reading 146). A named href no entry holds is shredded as nothing: the package's laws refuse it
 * in the database (`entry-kind`). Each document's references are then resolved as the import
 * resolves them (`referenceRowsOf`), so the package names every path the import writes a
 * `ReferencePath` or a `TextReferencePath` of.
 *
 * {@link readPackage} judges no law: what it refuses is what the reader, the container and the codec
 * refuse, and every law is the database's, met when `importPackage` (`#pantry/import/package.ts`)
 * writes the package. Nothing here reaches the author login (`#pantry/qti/logins.ts`), whose
 * workload grizzle builds when that module is evaluated.
 */
import { Array as Arr, Brand, Effect, Option, Order, Schema } from "effect";
import type { FileSystem, PlatformError } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import { grammar } from "#pantry/grammar/install.ts";
import {
  namedDocuments,
  referenceCensus,
  referenceRowsOf,
  resourceTypesOf,
  rowsOf as packageRowsOf,
  typedPathsOf,
} from "#pantry/import/overlays/package.ts";
import { ownViewOf } from "#pantry/import/fold.ts";
import { ruleOfError } from "#pantry/import/rules.ts";
import type { ImportRefused } from "#pantry/import/rules.ts";
import type { ListedDocument, PackageName } from "#pantry/import/write.ts";
import { shredGrammarOf } from "#pantry/model/composed.ts";
import { shred } from "#pantry/model/shred.ts";
import { PackageReadError, readEntries } from "#pantry/package/read.ts";
import type { PackageFile } from "#pantry/package/read.ts";
import { isPackageName } from "#pantry/qti/limits.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";

/**
 * A file's path from the package root, `/`-separated, as the reader names an entry
 * (`imsmanifest.xml`, `items/media/a b.png`).
 *
 * The brand is plate's `PackagePath` (`#plate/model/url.ts`), `Brand.Branded<string,
 * "PackagePath">`, stated here because pantry depends on no plate: one Effect brand of one key is
 * one type, so a path of a {@link QtiPackage} keys plate's `assets` as it is. plate's
 * `isPackagePath` holds a path to no empty first or last segment and no `.` or `..` segment, and
 * admits an empty segment between two others (`media//a.png`), as RFC 3986 §3.3 does; every path
 * of a package the import accepted meets it, so the two agree on every file a package holds: the
 * reader refuses an absolute path and a `..` segment (`#pantry/package/zip.ts` `unsafeEntryPath`)
 * and keeps no directory entry, a name ending with `/`, among the files; a resolved path holds no
 * dot segment ("E1 derived", `resolvedPathPattern` of `#pantry/qti/package.ts`), its empty interior
 * segments kept; and every entry but the manifest is the resolved path of a file the manifest
 * lists ("File listed"). A zip may name an entry with a `.` segment, which no href resolves to, so
 * a package that holds one is refused there.
 */
export type PackagePath = Brand.Branded<string, "PackagePath">;

/**
 * Brand an entry's path or a resolved path as a {@link PackagePath}, with no check of its own: the
 * reader and the resolver give the path, and the database holds it ({@link PackagePath}).
 */
const packagePath = Brand.nominal<PackagePath>();

/**
 * A package as the import writes it: what {@link readPackage} read, before the database.
 *
 * - `name`: the name its caller gives it, the key its `Package` row takes and every other row of it
 *   holds (`PackageName`); the manifest's `identifier` is no key, since IMS Content Packaging makes
 *   it unique within its manifest alone, and two packages may share one.
 * - `manifest`: the manifest, `imsmanifest.xml` at the package root, shredded, of the document type
 *   `manifest`.
 * - `documents`: every other document its resources name that an entry holds, one per path, in the
 *   manifest's order, each shredded once, of the type its resource names (readings 93 and 162).
 * - `files`: every entry, in listing order (sorted by path), each as a `File` whose `name` is its
 *   path and whose bytes are the entry's, read once: a document's are shredded, and every other
 *   entry's are a media file's, which the import puts in its content-addressed store under their
 *   SHA-256 (`MediaStore` of `#pantry/package/media.ts`) and states that digest as its `Media` row.
 *   No entry's bytes are stored in the database. Its `type` is empty, since the reader knows no
 *   media type; the player's media policy (`MediaType` of `#pantry/qti/media.ts`) gives an
 *   extension's.
 * - `referenced`: every path a reference of a document resolves to in the package, the attributes of
 *   the reference census, each image candidate of a `srcset` and the texts of the text census
 *   alike: exactly the paths of the `ReferencePath`, `CandidatePath` and `TextReferencePath` rows
 *   the import writes.
 */
export interface QtiPackage {
  readonly documents: readonly ListedDocument[];
  readonly files: ReadonlyMap<PackagePath, File>;
  readonly manifest: ListedDocument;
  readonly name: PackageName;
  readonly referenced: ReadonlySet<PackagePath>;
}

/**
 * The name a caller gave a package is no name a package can be stored under: an NCName, an XML name
 * with no colon, of at most 255 UTF-8 bytes (`PackageName`, `#pantry/qti/limits.ts`).
 * Nothing was read.
 */
export class BadPackageName extends Schema.TaggedError<BadPackageName>()("BadPackageName", {
  name: Schema.String,
}) {
  /**
   * The name, why no package can be stored under it, and what a name is.
   */
  override get message(): string {
    return `No package can be stored under the name ${JSON.stringify(this.name)}: a package's name is an XML name with no colon and no space (an NCName) of at most 255 bytes, such as g3-science or MANIFEST-1. Name the package with one.`;
  }
}

/**
 * Hold a caller's name for a package to `PackageName`'s language, an NCName of at most 255 UTF-8
 * bytes (`isPackageName`, `#pantry/qti/limits.ts`), before anything is read,
 * so no row is built under a name the database would refuse.
 *
 * @param name - The name the caller gave.
 * @returns The name. Fails with {@link BadPackageName} where no package can be stored under it.
 */
export const requirePackageName = (
  name: string,
): Effect.Effect<QtiPackage["name"], BadPackageName> =>
  isPackageName(name) ? Effect.succeed(name) : Effect.fail(new BadPackageName({ name }));

/**
 * Read and shred one document of the package.
 *
 * @param file - Its entry.
 * @returns Its tree; the reader's or the codec's refusal.
 */
const shredFile = (file: PackageFile) =>
  Effect.flatMap(readXml(file.bytes), (xml) => shred(xml, shredGrammarOf(grammar)));

/**
 * Choose the type a path's document is read as, of the types its resources name it under (spec
 * readings 93 and 162): the first, in the manifest's order, whose `RootOfType` pair holds the
 * root's kind, and the first of all where none does. Every other type's href then names no document
 * of its type, which "Document entry" refuses; and `RootOfType` refuses a root only where no type
 * its resources name bears it out, whatever order they are listed in. The sort is stable, so the
 * types the root bears out come first, each group in the manifest's order.
 *
 * @param types - The types, in the manifest's order.
 * @param rootKind - The kind of the document's root.
 * @returns The type.
 */
const documentTypeOf = <T extends string>(
  types: Arr.NonEmptyReadonlyArray<T>,
  rootKind: string,
): T =>
  Arr.headNonEmpty(
    Arr.sortWith(
      types,
      (type) => Option.isNone(grammar.package.rootOfType.lookup({ root: rootKind, type })),
      Order.Boolean,
    ),
  );

/**
 * Read the package at `dir` and list its documents, one per path: the manifest, and each other
 * document its resources name that an entry holds, in the manifest's order, each shredded once.
 *
 * @param dir - The package directory or `.zip` file.
 * @param name - The package's name, which the manifest's rows are read under.
 * @returns The entries, the manifest and the other documents; the reader's, the container's or the
 *   codec's refusal.
 */
const listDocuments = Effect.fn("import.listDocuments")(function* listDocuments(
  dir: string,
  name: QtiPackage["name"],
) {
  const entries = yield* readEntries(dir);
  const manifestEntry = entries.find(({ kind }) => kind === "manifest");
  if (manifestEntry === undefined) {
    return yield* new PackageReadError({ dir, path: manifestPath, rule: "manifest-root" });
  }

  const manifestXml = yield* readXml(manifestEntry.bytes);
  const manifestTree = yield* shred(manifestXml, shredGrammarOf(grammar));
  const byPath = new Map(entries.map((entry) => [entry.path, entry] as const));
  const manifestView = ownViewOf(manifestTree);
  const named = namedDocuments(
    typedPathsOf(packageRowsOf(manifestView, { package: name }), resourceTypesOf(manifestView)),
  );
  // A path is one document, of one type (reading 93): the manifest's, `manifest`, read before any
  // resource names a path (reading 146), else the type its root bears out among those resources
  // name it under (reading 162). Another type's href, the manifest's path's included, then names
  // no document of its type, which "Document entry" refuses, and the document is read once and
  // judged where its sites place it.
  const pairs = [...named.values()];
  const manifest: ListedDocument = {
    documentType: "manifest",
    path: manifestEntry.path,
    tree: manifestTree,
  };
  const documents = new Map<string, ListedDocument>();
  for (const [at, { path, type }] of pairs.entries()) {
    const entry = byPath.get(path);
    if (!(entry !== undefined && path !== manifest.path && !documents.has(path))) {
      continue;
    }

    const tree = yield* shredFile(entry);
    const others = pairs.slice(at + 1).flatMap((pair) => (pair.path === path ? [pair.type] : []));
    documents.set(path, {
      documentType: documentTypeOf([type, ...others], tree.root.kind),
      path,
      tree,
    });
  }

  return { documents: [...documents.values()], entries, manifest };
});

/**
 * An entry's bytes as a `File` takes them, a `Uint8Array` over an `ArrayBuffer`: a view of the same
 * bytes where they lie in one, which a file the platform reads always does, and a copy where they
 * lie in a `SharedArrayBuffer`, which a `Blob` refuses.
 *
 * @param bytes - The entry's bytes as read.
 * @returns The same bytes over an `ArrayBuffer`.
 */
const blobPartOf = (bytes: Uint8Array): Uint8Array<ArrayBuffer> =>
  bytes.buffer instanceof ArrayBuffer
    ? new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    : new Uint8Array(bytes);

/**
 * Whether an error is a refusal of the package, as opposed to the platform's failure to read it.
 *
 * @param error - The error.
 * @returns Whether it is a `ReadRefusal` of `#pantry/import/refusal.ts`.
 */
const isReadRefusal = <E extends { readonly _tag: string }>(
  error: E,
): error is Exclude<E, PlatformError.PlatformError> => error._tag !== "PlatformError";

/**
 * Resolve every reference of a package's documents as the import resolves it
 * (`referenceRowsOf`, the one builder of the `ReferencePath` and `TextReferencePath` rows), and
 * keep the paths of those that resolve in the package. A resolved path depends on no context, so
 * each document's own view gives the import's paths.
 *
 * @param name - The package's name.
 * @param documents - The package's documents, the manifest among them.
 * @returns Every path a reference resolves to, each once.
 */
const referencedOf = (
  name: QtiPackage["name"],
  documents: readonly ListedDocument[],
): ReadonlySet<PackagePath> =>
  new Set(
    documents.flatMap(({ path, tree }) => {
      const rows = referenceRowsOf(ownViewOf(tree), { package: name, path }, referenceCensus);

      return [
        ...rows.ReferencePath.values(),
        ...rows.TextReferencePath.values(),
        ...rows.CandidatePath.values(),
      ].map((row) => packagePath(row.target));
    }),
  );

/**
 * Read the package at `dir` under the name its caller gives it, as the import writes it: every
 * entry read once, the manifest and each document its resources name shredded once, and every
 * reference resolved ({@link QtiPackage}). `importPackage` (`#pantry/import/package.ts`) writes the
 * value it returns under that name, and reads nothing of the directory again.
 *
 * @param dir - The package directory or `.zip` file.
 * @param name - The package's name, the key it is stored under: an NCName of at most
 *   (`PackageName`).
 * @returns The package. Fails with `BadPackageName` before anything is read where no package can be
 *   stored under `name`; with `ImportRefused` naming the rule the reader, the container or the
 *   codec refused the package under; and with the platform's error when the package cannot be
 *   read.
 */
export const readPackage = Effect.fn("import.readPackage")(function* readPackage(
  dir: string,
  name: string,
): Effect.fn.Return<
  QtiPackage,
  BadPackageName | ImportRefused | PlatformError.PlatformError,
  FileSystem.FileSystem
> {
  const named = yield* requirePackageName(name);
  const { documents, entries, manifest } = yield* listDocuments(dir, named).pipe(
    Effect.catchIf(isReadRefusal, (refusal) => Effect.fail(ruleOfError(refusal))),
  );
  const referenced = referencedOf(named, [manifest, ...documents]);
  const files = new Map(
    entries.map(
      ({ bytes, path }) => [packagePath(path), new File([blobPartOf(bytes)], path)] as const,
    ),
  );

  yield* Effect.annotateCurrentSpan({
    documents: documents.length + 1,
    entries: files.size,
    referenced: referenced.size,
  });

  return { documents, files, manifest, name: named, referenced };
});
