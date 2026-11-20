/**
 * The sources the golden data is recorded from, and the item documents each holds: the bank the QTI
 * app serves (Ram's lessons and Cameron's shadow forms, as local copies), 1EdTech's QTI 3 example
 * corpus, and plate's and pantry's own fixtures.
 *
 * A source is a directory of files read once; its copies live outside the repository, since the
 * bank holds secure test content. Each document is read whole, and one whose root is not a QTI 3
 * `qti-assessment-item` is left out before plate opens it.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { Effect } from "effect";
import { isAdmitted } from "#plate/test/admitted.ts";
import type { ItemPlace } from "#scripts/golden/record.ts";

/**
 * A source: its set's name, the directory it is read from, how a document's place names its
 * package (by the first directory under the root, or by the whole directory the document sits in),
 * and where its documents' admission is held: `database` for the bank, which the database already
 * holds, and `admitted-set` for the corpus and the fixtures, whose items are read only where the
 * admission run admitted them (`isAdmitted`, `#plate/test/admitted.ts`).
 */
export interface Source {
  readonly admission: "admitted-set" | "database";
  readonly package: "directory" | "first";
  readonly root: string;
  readonly set: string;
}

/**
 * The repository root, from this file's place in it.
 */
const repository = path.resolve(import.meta.dirname, "../../../../../..");

/**
 * The sources a full recording reads: the bank first, then the corpus and the fixtures.
 */
export const sources: readonly Source[] = [
  {
    admission: "database",
    package: "first",
    root: path.join(homedir(), ".cache/qti-live/890fc95cd/out/alphascience-import/packages"),
    set: "bank-ram",
  },
  {
    admission: "database",
    package: "first",
    root: path.join(homedir(), ".cache/qti-pie/bank/shadows-74403b49489f1c2d"),
    set: "bank-shadows",
  },
  {
    admission: "admitted-set",
    package: "directory",
    root: path.join(
      homedir(),
      ".cache/qti-pie/qti3-examples/qti-examples-0a92fbbb6d2e620a1f7fad19977be4c418246bc0",
    ),
    set: "corpus",
  },
  {
    admission: "admitted-set",
    package: "first",
    root: path.join(repository, "packages/qti-pie/packages/plate/fixtures"),
    set: "plate-fixtures",
  },
  {
    admission: "admitted-set",
    package: "directory",
    root: path.join(repository, "packages/qti-pie/packages/pantry/src/test/fixtures/processing"),
    set: "pantry-fixtures",
  },
];

/**
 * The text that opens a QTI 3 item's root element, in the first bytes of its document.
 */
const itemRoot = /<qti-assessment-item[\s>][^>]*imsqtiasi_v3p0/u;

/**
 * How many leading bytes of a document {@link itemRoot} is looked for in: past an XML declaration,
 * a doctype and comments of any length a source holds.
 */
const headLength = 8192;

/**
 * A document of a source: its place and its bytes.
 */
export interface SourceItem {
  readonly bytes: Uint8Array;
  readonly place: ItemPlace;
}

/**
 * Give every file under a directory, by its path relative to it, in code-point order.
 *
 * @param root The directory.
 * @returns The relative paths.
 */
const filesUnder = (root: string) =>
  Effect.map(
    Effect.tryPromise(() => readdir(root, { recursive: true, withFileTypes: true })),
    (entries) =>
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".xml"))
        .map((entry) => path.relative(root, path.join(entry.parentPath, entry.name)))
        .toSorted(),
  );

/**
 * Give every file of a source, any kind, by its path from the source's root, in code-point order:
 * the assets a review of one of its items may name.
 *
 * @param source The source.
 * @returns The relative paths, `/`-separated.
 */
export const filesOf = (source: Source) =>
  Effect.map(
    Effect.tryPromise(() => readdir(source.root, { recursive: true, withFileTypes: true })),
    (entries) =>
      entries
        .filter((entry) => entry.isFile())
        .map((entry) =>
          path
            .relative(source.root, path.join(entry.parentPath, entry.name))
            .split(path.sep)
            .join("/"),
        )
        .toSorted(),
  );

/**
 * Give the assets a review of an item is served with: every file of the source under the same top
 * directory as the item, which holds its package (all of them for an item at the root).
 *
 * @param files Every file of the source ({@link filesOf}).
 * @param place The item's place.
 * @returns The files, by their path from the source's root.
 */
export const assetsFor = (files: readonly string[], place: ItemPlace): readonly string[] => {
  const [top] = `${place.package}/${place.path}`.split("/");

  return top === undefined || top === "."
    ? files
    : files.filter((file) => file.startsWith(`${top}/`));
};

/**
 * Give a document's place in its source, by how the source names packages.
 *
 * @param source The source.
 * @param relative The document's path under the source's root.
 * @returns Its place.
 */
const placeOf = (source: Source, relative: string): ItemPlace => {
  const segments = relative.split(path.sep);
  const [first = "", ...rest] = segments;

  return source.package === "first"
    ? { package: first, path: rest.join("/"), set: source.set }
    : {
        package: segments.slice(0, -1).join("/") || ".",
        path: segments.at(-1) ?? relative,
        set: source.set,
      };
};

/**
 * Read a source's item documents, each distinct document once (the first place it is found at),
 * since the corpus holds each zip's items both loose and extracted.
 *
 * @param source The source.
 * @returns Its item documents.
 */
export const itemsOf = (source: Source) =>
  Effect.gen(function* readItems() {
    const files = yield* filesUnder(source.root);
    const read = yield* Effect.forEach(
      files,
      (relative) =>
        Effect.map(
          Effect.tryPromise(() => readFile(path.join(source.root, relative))),
          (bytes): SourceItem => ({ bytes, place: placeOf(source, relative) }),
        ),
      { concurrency: "unbounded" },
    );
    const items = read.filter(
      (item) =>
        itemRoot.test(new TextDecoder().decode(item.bytes.subarray(0, headLength))) &&
        (source.admission === "database" || isAdmitted(item.bytes)),
    );
    const firsts = new Map(
      items
        .toReversed()
        .map((item) => [createHash("sha256").update(item.bytes).digest("hex"), item]),
    );

    return items.filter(
      (item) => firsts.get(createHash("sha256").update(item.bytes).digest("hex")) === item,
    );
  });
