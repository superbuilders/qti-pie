/**
 * The items a render diff renders, from its two sources, and the files each one's package holds,
 * which its configuration addresses: {@link inputsOf}.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Effect, Schema } from "effect";
import { isAdmitted } from "#plate/test/admitted.ts";
import { corpusDocuments, corpusRoot, filesUnder, readCorpusFile } from "#plate/test/corpus.ts";
import { qtiPieCache } from "#plate/test/qti-pie.ts";

/**
 * The sources a render diff reads, each a directory of its run's outputs: `corpus`, 1EdTech's QTI 3
 * example corpus, every document of the set plate's corpus sweeps read (`corpusDocuments`); and
 * `snapshot`, the local snapshot of the QTI database, every `items/*.xml` of each package under
 * `~/.cache/qti-pie/qtidb/packages`. The snapshot is Alpha School content, so nothing rendered from
 * it is ever committed.
 */
export const sources = ["corpus", "snapshot"] as const;

/**
 * One of {@link sources}.
 */
export type Source = (typeof sources)[number];

/**
 * One document a render diff opens and, when `openAdmitted` accepts it as an item, renders, as a
 * Schema, which a worker decodes its shard's documents by:
 *
 * - `location`, the document's path, which `openAdmitted` takes as its location and every package URL
 *   it writes is resolved against: from the corpus root for the corpus, as the sweeps open it, and
 *   from its package's root for the snapshot, as qti-app opens a stored item;
 * - `name`, where the document's outputs go under its source's directory: its path there without
 *   `.xml`, its package first for the snapshot;
 * - `package`, the key of the package whose files its configuration addresses, in {@link Inputs}'
 *   `packages`;
 * - `path`, the absolute path its bytes are read from.
 */
export const DocumentSchema = Schema.Struct({
  location: Schema.String,
  name: Schema.String,
  package: Schema.String,
  path: Schema.String,
  source: Schema.Literals(sources),
});

/**
 * One document a render diff opens ({@link DocumentSchema}).
 */
export type Document = typeof DocumentSchema.Type;

/**
 * Every document a render diff opens, and the files of each package they belong to, by package
 * key: each file's path from the package root, as a configuration's `assets` keys it.
 */
export interface Inputs {
  readonly documents: readonly Document[];
  readonly packages: Readonly<Record<string, readonly string[]>>;
}

/**
 * The failure of a render diff that cannot list the files of one of its sources.
 *
 * `path` is the directory it listed and `detail` the operating system's reason.
 */
export class SourceUnreadable extends Schema.TaggedError<SourceUnreadable>()("SourceUnreadable", {
  detail: Schema.String,
  path: Schema.String,
}) {
  /**
   * The directory, the reason, and the repair: fetch the snapshot, or leave the source out.
   */
  override get message(): string {
    return `Cannot list ${this.path}: ${this.detail}. Download the QTI database snapshot there (~/.cache/qti-pie/qtidb/dl.mjs), or leave its source out with --source corpus.`;
  }
}

/**
 * List every regular file under a directory, at any depth, as `filesUnder` lists a corpus folder:
 * each a POSIX path from the directory, links left out, sorted in JavaScript's default string
 * order.
 *
 * @param directory The directory's absolute path.
 * @returns The files' paths; {@link SourceUnreadable} when the directory cannot be listed.
 */
const filesIn = (directory: string): Effect.Effect<readonly string[], SourceUnreadable> =>
  Effect.tryPromise({
    catch: (cause) =>
      new SourceUnreadable({
        detail: cause instanceof Error ? cause.message : String(cause),
        path: directory,
      }),
    try: () => readdir(directory, { recursive: true, withFileTypes: true }),
  }).pipe(
    Effect.map((entries) =>
      entries
        .filter((entry) => entry.isFile())
        .map((entry) =>
          path
            .relative(directory, path.join(entry.parentPath, entry.name))
            .split(path.sep)
            .join("/"),
        )
        .toSorted(),
    ),
  );

/**
 * The key of the corpus's one package: the corpus root, which every corpus location is a path
 * from.
 */
const corpusPackage = "corpus";

/**
 * List the corpus's documents the database admitted (`isAdmitted`, `#plate/test/admitted.ts`), each
 * opened at its path from the corpus root, all under the one package that holds every corpus file.
 */
const corpusInputs = Effect.gen(function* corpusInputs() {
  const root = yield* corpusRoot;
  const listed = yield* corpusDocuments;
  const admitted = yield* Effect.filter(
    listed,
    (location) => Effect.map(readCorpusFile(location), isAdmitted),
    { concurrency: "unbounded" },
  );
  const documents = admitted.map((location): Document => ({
    location,
    name: location.replace(/\.xml$/u, ""),
    package: corpusPackage,
    path: path.join(root, location),
    source: "corpus",
  }));

  return { documents, packages: { [corpusPackage]: yield* filesUnder(".") } } satisfies Inputs;
});

/**
 * The items of one snapshot package: the XML files directly in its `items/` folder.
 */
const snapshotItem = /^items\/[^/]+\.xml$/u;

/**
 * Run a read of one path of a source, failing with {@link SourceUnreadable} at that path.
 *
 * @param at The path.
 * @param read The read.
 * @returns What it read.
 */
const unreadableAt = <A>(at: string, read: (at: string) => Promise<A>) =>
  Effect.tryPromise({
    catch: (cause) =>
      new SourceUnreadable({
        detail: cause instanceof Error ? cause.message : String(cause),
        path: at,
      }),
    try: () => read(at),
  });

/**
 * One line of the snapshot's admitted file: a document of the snapshot the database admitted, by
 * its digest, with its open marks.
 */
const SnapshotAdmitted = Schema.fromJsonString(
  Schema.Struct({ digest: Schema.String, marks: Schema.Unknown }),
);

/**
 * The digests of the snapshot's documents the database admitted, which the admission run writes
 * beside the snapshot (`packages/qti-pie/packages/pantry/scripts/admit.ts write --snapshot`): a
 * snapshot item the current laws refuse is no input, as a corpus member is not.
 */
const snapshotAdmitted = Effect.gen(function* snapshotAdmitted() {
  const file = yield* qtiPieCache("qtidb", "admitted.jsonl");
  const text = yield* unreadableAt(file, (at) => readFile(at, "utf-8"));
  const lines = yield* Effect.forEach(
    text.split("\n").filter((line) => line !== ""),
    (line) => Effect.orDie(Schema.decodeUnknownEffect(SnapshotAdmitted)(line)),
  );

  return new Set(lines.map(({ digest }) => digest));
});

/**
 * List the snapshot's items, every package's in package order, each opened at its path from its
 * package's root, with each package's files.
 */
const snapshotInputs = Effect.gen(function* snapshotInputs() {
  const root = yield* qtiPieCache("qtidb", "packages");
  const names = yield* Effect.tryPromise({
    catch: (cause) =>
      new SourceUnreadable({
        detail: cause instanceof Error ? cause.message : String(cause),
        path: root,
      }),
    try: () => readdir(root, { withFileTypes: true }),
  });
  const packages = yield* Effect.forEach(
    names
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .toSorted(),
    (name) => Effect.map(filesIn(path.join(root, name)), (files) => ({ files, name }) as const),
  );
  const admitted = yield* snapshotAdmitted;
  const items = yield* Effect.forEach(
    packages.flatMap(({ files, name }) =>
      files.filter((file) => snapshotItem.test(file)).map((location) => ({ location, name })),
    ),
    (item) =>
      Effect.map(
        unreadableAt(path.join(root, item.name, item.location), (at) => readFile(at)),
        (bytes) => ({ ...item, digest: createHash("sha256").update(bytes).digest("hex") }),
      ),
    { concurrency: "unbounded" },
  );

  return {
    documents: items
      .filter(({ digest }) => admitted.has(digest))
      .map(({ location, name }): Document => ({
        location,
        name: `${name}/${location.replace(/\.xml$/u, "")}`,
        package: `snapshot/${name}`,
        path: path.join(root, name, location),
        source: "snapshot",
      })),
    packages: Object.fromEntries(packages.map(({ files, name }) => [`snapshot/${name}`, files])),
  } satisfies Inputs;
});

/**
 * List the documents and packages of the sources asked for, in {@link sources}' order.
 *
 * @param asked The sources to read.
 * @returns Their documents and packages; {@link SourceUnreadable}, or the corpus reader's
 *   failures, when a source's files cannot be listed, and a `ConfigError` when `HOME` is unset.
 */
export const inputsOf = (asked: ReadonlySet<Source>) =>
  Effect.map(
    Effect.all(
      sources
        .filter((source) => asked.has(source))
        .map((source) => (source === "corpus" ? corpusInputs : snapshotInputs)),
    ),
    (each): Inputs => ({
      documents: each.flatMap((inputs) => inputs.documents),
      packages: Object.fromEntries(each.flatMap((inputs) => Object.entries(inputs.packages))),
    }),
  );
