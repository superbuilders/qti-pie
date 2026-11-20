/**
 * The admission run: the database judges every document plate's and specimen's free suites open,
 * once per landing, and the set of the digests it admitted is written into plate's test support
 * (`packages/plate/src/test/admitted-digests.ts`), which the suites read with no database. plate
 * judges no document's validity; this run is how its tests come to hold only documents the
 * database admitted.
 *
 * Each document is admitted alone, as a one-document package: the document at its own path, every
 * file it names copied from its own package where that package holds it (a stimulus it names
 * listed as a stimulus resource), and a placeholder of the file's kind where it does not. So a
 * document is judged by the laws over it, never refused for a test or a document it sits beside.
 *
 * From `packages/qti-pie/packages/pantry`, in order:
 *
 * 1. Collect: run plate's and specimen's free suites with `QTI_PIE_ADMIT_COLLECT=<dir>/collected`,
 *    which writes every document their admission helpers open there (`#plate/test/admitted.ts`).
 * 2. `node scripts/admit.ts packages <dir> --collected <dir>/collected --tree <root>… --snapshot
 *    <root>`, each `--tree` a folder every QTI document of which a suite or a harness reads whole
 *    (the example corpus, plate's fixtures, pantry's processing fixtures), and `--snapshot` the QTI
 *    database snapshot the render diff renders (`~/.cache/qti-pie/qtidb/packages`), whose admitted
 *    documents go to a local file beside it, never to the repository.
 * 3. `node scripts/admit.ts import <dir>` against a scratch database of this package (`scripts/db.sh
 *    create` and `migrate`), through the machine's one database lock, then, in the same hold,
 *    `admit-rows.sql` (psql, as the installation's owner, `-v out=<dir>`), which exports the rows
 *    `write` reads.
 * 4. `node scripts/admit.ts write <edullm commit> <dir> --snapshot
 *    ~/.cache/qti-pie/qtidb/admitted.jsonl`, then format the module it writes with qti-pie's oxfmt
 *    (from `packages/qti-pie`) and commit it.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import {
  Array as Arr,
  Config,
  Console,
  Effect,
  FileSystem,
  Layer,
  Option,
  Path,
  pipe,
  Schema,
} from "effect";
import { Argument, Command, Flag } from "effect/cli";
import { authorDb, ImportLive } from "#pantry/db/layer.ts";
import { grammar } from "#pantry/grammar/install.ts";
import {
  admitPackage,
  AdmissionVerdict,
  asiRootOf,
  openedRoots,
  writeAdmissionPackage,
} from "#pantry/test/admission.ts";
import type { AdmissionDocument } from "#pantry/test/admission.ts";
import { localMediaStore } from "#pantry/package/media.ts";

/**
 * Where an admitted document's digest goes: `suite`, plate's committed admitted set, for a document
 * a free suite or a harness reads; `snapshot`, a local file beside the QTI database snapshot the
 * render diff renders, never the repository.
 */
type Scope = "snapshot" | "suite";

/**
 * One document to admit: its digest, its bytes, its path in its package, the folder its package's
 * files are read from (none for a collected document, whose files are placeholders), where it was
 * opened, and where its digest goes.
 */
interface Candidate extends AdmissionDocument {
  readonly digest: string;
  readonly opened: readonly string[];
  readonly scopes: readonly Scope[];
}

/**
 * The SHA-256 of a document's bytes, in lowercase hex, the key the admitted set holds it by.
 *
 * @param bytes The bytes.
 * @returns The digest.
 */
const digestOf = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

/**
 * One line of a collection's `opens.jsonl`: a document a suite opened, where and in which test.
 */
const Opened = Schema.Struct({
  digest: Schema.String,
  location: Schema.String,
  test: Schema.String,
});

/**
 * Read a collection: each document a suite opened, at the first location it was opened under, with
 * every test that opened it.
 *
 * @param directory The collection.
 * @returns The candidates.
 */
const collectedIn = Effect.fn("admit.collected")(function* collectedIn(directory: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const lines = (yield* fs.readFileString(path.join(directory, "opens.jsonl")))
    .split("\n")
    .filter((line) => line !== "");
  const opens = yield* pipe(
    lines,
    Effect.forEach((line) => Schema.decodeUnknownEffect(Schema.fromJsonString(Opened))(line)),
  );
  const byDigest = pipe(
    opens,
    Arr.groupBy(({ digest }) => digest),
  );

  return yield* Effect.forEach(Object.entries(byDigest), ([digest, [first, ...rest]]) =>
    Effect.map(fs.readFile(path.join(directory, `${digest}.xml`)), (bytes): Candidate => {
      const written = path.normalize(first.location);

      return {
        at: written.startsWith("../") || path.isAbsolute(written) ? "doc.xml" : written,
        bytes,
        digest,
        folder: Option.none(),
        opened: Arr.dedupe([first, ...rest].map(({ test }) => test)),
        scopes: ["suite"],
      };
    }),
  );
});

/**
 * Read a tree: every QTI document under it plate opens, each from its own package's folder, the
 * nearest one above it that holds an `imsmanifest.xml`, else the tree's root.
 *
 * @param root The tree's root.
 * @param scope Where its admitted documents' digests go.
 * @returns The candidates.
 */
const treeDocuments = Effect.fn("admit.tree")(function* treeDocuments(root: string, scope: Scope) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const files = (yield* fs.readDirectory(root, { recursive: true })).filter((file) =>
    file.endsWith(".xml"),
  );
  const listed = new Set(files);
  const packageOf = (file: string): string => {
    for (let folder = path.dirname(file); folder !== "." && folder !== "/";) {
      if (listed.has(path.join(folder, "imsmanifest.xml"))) {
        return folder;
      }

      folder = path.dirname(folder);
    }

    return ".";
  };
  const read = yield* Effect.forEach(
    files,
    (file) => Effect.map(fs.readFile(path.join(root, file)), (bytes) => ({ bytes, file })),
    { concurrency: "unbounded" },
  );

  const rooted = yield* pipe(
    read,
    Effect.forEach(({ bytes, file }) =>
      Effect.map(asiRootOf(bytes), (asiRoot) => ({ asiRoot, bytes, file })),
    ),
  );

  return rooted.flatMap(({ asiRoot, bytes, file }): readonly Candidate[] =>
    Option.match(asiRoot, {
      onNone: () => [],
      onSome: (local) => {
        if (!openedRoots.has(local)) {
          return [];
        }

        const folder = packageOf(file);

        return [
          {
            at: path.relative(folder, file).split(path.sep).join("/"),
            bytes,
            digest: digestOf(bytes),
            folder: Option.some(path.join(root, folder)),
            opened: [path.join(root, file)],
            scopes: [scope],
          },
        ];
      },
    }),
  );
});

/**
 * The package folder of each candidate under a run's directory, by its digest.
 *
 * @param path The platform's paths.
 * @param directory The run's directory.
 * @param digest The candidate's digest.
 * @returns The folder.
 */
const packageFolder = (path: Path.Path, directory: string, digest: string) =>
  path.join(directory, "packages", digest);

/**
 * One document of an admission package: its path in the package, its digest, and where a suite or
 * a tree opened it.
 */
const PackagedDocument = Schema.Struct({
  digest: Schema.String,
  opened: Schema.Array(Schema.String),
  path: Schema.String,
});

/**
 * One package the run imports, one line of `packages.jsonl`: a candidate written as a one-document
 * package, its name, its folder, its one document, and where that document's digest goes when the
 * database admits it.
 */
const Packaged = Schema.Struct({
  documents: Schema.Array(PackagedDocument),
  folder: Schema.String,
  name: Schema.String,
  scopes: Schema.Array(Schema.Literals(["snapshot", "suite"])),
});

/**
 * Decode one JSON Lines file of a run, a line a value of a struct.
 *
 * @param file The file.
 * @param schema The Schema of a line.
 * @returns Its values.
 */
const linesOf = Effect.fn("admit.lines")(function* linesOf<A>(
  file: string,
  schema: Schema.Codec<A, unknown>,
) {
  const fs = yield* FileSystem.FileSystem;
  const decodeLine = Schema.decodeUnknownEffect(Schema.fromJsonString(schema));

  return yield* pipe(
    (yield* fs.readFileString(file)).split("\n").filter((line) => line !== ""),
    Effect.forEach((line) => decodeLine(line)),
  );
});

/**
 * Write every candidate's package under a run's directory, the collected documents and each
 * tree's, each digest once, a tree's place first, since it holds the files the document names; and
 * list them, with every package imported as it is, in `packages.jsonl`.
 */
const packagesCommand = Command.make(
  "packages",
  {
    collected: Flag.Directory("collected").pipe(Flag.optional),
    directory: Argument.Directory("directory", { mustExist: false }),
    snapshots: Flag.Directory("snapshot").pipe(Flag.atLeast(0)),
    trees: Flag.Directory("tree").pipe(Flag.atLeast(0)),
  },
  Effect.fn("admit.packagesCommand")(function* packagesCommand({
    collected,
    directory,
    snapshots,
    trees,
  }) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const fromTrees = (yield* pipe(
      trees,
      Effect.forEach((tree) => treeDocuments(tree, "suite")),
    )).flat();
    const fromSnapshots = (yield* pipe(
      snapshots,
      Effect.forEach((tree) => treeDocuments(tree, "snapshot")),
    )).flat();
    const fromSuites = yield* Option.match(collected, {
      onNone: () => Effect.succeed<readonly Candidate[]>([]),
      onSome: collectedIn,
    });
    const candidates = Object.values(
      pipe(
        [...fromTrees, ...fromSuites, ...fromSnapshots],
        Arr.groupBy(({ digest }) => digest),
      ),
    ).map(([first, ...rest]): Candidate => ({
      ...first,
      opened: Arr.dedupe([first, ...rest].flatMap(({ opened }) => opened)),
      scopes: Arr.dedupe([first, ...rest].flatMap(({ scopes }) => scopes)),
    }));

    yield* fs.makeDirectory(path.join(directory, "packages"), { recursive: true });
    yield* Effect.forEach(
      candidates,
      (candidate) =>
        writeAdmissionPackage(packageFolder(path, directory, candidate.digest), candidate),
      { concurrency: "unbounded", discard: true },
    );
    yield* fs.writeFileString(
      path.join(directory, "packages.jsonl"),
      candidates
        .map(({ at, digest, opened, scopes }) =>
          Packaged.make({
            documents: [{ digest, opened, path: at }],
            folder: packageFolder(path, directory, digest),
            name: `a-${digest}`,
            scopes,
          }),
        )
        .map((packaged) => `${JSON.stringify(packaged)}\n`)
        .join(""),
    );
    yield* Console.log(
      `${String(candidates.length)} documents packaged under ${directory}/packages: ${String(fromTrees.length)} from the trees, ${String(fromSuites.length)} collected, ${String(fromSnapshots.length)} from the snapshots`,
    );
  }),
);

/**
 * Import every package of a run's roster into the database under its name, and write the
 * verdicts.
 */
const importCommand = Command.make(
  "import",
  { directory: Argument.Directory("directory") },
  Effect.fn("admit.importCommand")(function* importCommand({ directory }) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const db = yield* authorDb;
    const packages = yield* linesOf(path.join(directory, "packages.jsonl"), Packaged);
    const verdicts = yield* Effect.forEach(
      packages,
      ({ folder, name }) => admitPackage(db.workload, folder, name),
      { concurrency: "unbounded" },
    );

    yield* fs.writeFileString(
      path.join(directory, "verdicts.jsonl"),
      verdicts.map((verdict) => `${JSON.stringify(verdict)}\n`).join(""),
    );
    yield* Console.log(
      `${String(verdicts.filter(({ _tag }) => _tag === "Admitted").length)} admitted, ${String(verdicts.filter(({ _tag }) => _tag === "Refused").length)} refused, ${String(verdicts.filter(({ _tag }) => _tag === "Unjudged").length)} unjudged`,
    );
  }),
).pipe(Command.provide(localMediaStore.pipe(Layer.provideMerge(ImportLive))));

/**
 * One `Node` row of an imported package, as `admit-rows.sql` exports it: its place and its kind,
 * by the NodeKind roster's name.
 */
const NodeRow = Schema.Struct({
  kind: Schema.String,
  package: Schema.String,
  path: Schema.String,
  start: Schema.Number,
});

/**
 * One `OpenAttribute` row of an imported package, as `admit-rows.sql` exports it: its element's
 * place, its name, and its class, by the AttributeName roster's name.
 */
const OpenAttributeRow = Schema.Struct({
  class: Schema.String,
  local: Schema.String,
  package: Schema.String,
  path: Schema.String,
  start: Schema.Number,
  uri: Schema.String,
});

/**
 * One `Reference` row of an imported package, as `admit-rows.sql` exports it: its element's place,
 * the attribute that names a file, the element's kind, and the reference's scope, each closed value
 * by its roster's name.
 */
const ReferenceRow = Schema.Struct({
  kind: Schema.String,
  name: Schema.String,
  package: Schema.String,
  path: Schema.String,
  scope: Schema.String,
  start: Schema.Number,
});

/**
 * One `Srcset` row of an imported package, as `admit-rows.sql` exports it: its element's place, the
 * attribute, and the element's kind.
 */
const SrcsetRow = Schema.Struct({
  kind: Schema.String,
  name: Schema.String,
  package: Schema.String,
  path: Schema.String,
  start: Schema.Number,
});

/**
 * The node kinds that are no element: a document's, a doctype's, character data's, a comment's, a
 * processing instruction's, an entity reference's (pantry's `nonElementKinds`).
 */
const nonElementKinds: ReadonlySet<string> = new Set([
  "comment",
  "doctype",
  "document",
  "entityRef",
  "pi",
  "text",
  "ws",
]);

/**
 * An open attribute of a document, as plate's securing reads it: the 0-based pre-order index of
 * its element among the document's elements, the root 0, and its namespace and local name.
 */
type OpenMark = readonly [element: number, namespace: string, local: string];

/**
 * Order two texts by code point.
 *
 * @param left The one.
 * @param right The other.
 * @returns Negative, zero or positive.
 */
const compareText = (left: string, right: string): number =>
  left < right ? -1 : Number(left > right);

/**
 * The key a document's rows are grouped by: its package and its path, joined with a NUL.
 *
 * @param row A row of the document.
 * @param row.package Its package.
 * @param row.path Its path.
 * @returns The key.
 */
const keyOf = (row: { readonly package: string; readonly path: string }): string =>
  `${row.package}\0${row.path}`;

/**
 * Give each document of an admitted package its open marks, from the rows the database holds of
 * it: each open attribute at its element's ordinal among the document's elements, in order.
 *
 * @param nodes The packages' `Node` rows.
 * @param attributes The packages' `OpenAttribute` rows.
 * @returns Each document's marks, by `package` and `path` joined with a NUL.
 */
const marksOf = (
  nodes: readonly (typeof NodeRow.Type)[],
  attributes: readonly (typeof OpenAttributeRow.Type)[],
): ReadonlyMap<string, readonly OpenMark[]> => {
  const ordinals = new Map<string, Map<number, number>>();
  for (const row of nodes
    .filter(({ kind }) => !nonElementKinds.has(kind))
    .toSorted((left, right) => left.start - right.start)) {
    const held = ordinals.get(keyOf(row)) ?? new Map<number, number>();
    held.set(row.start, held.size);
    ordinals.set(keyOf(row), held);
  }

  const marks = new Map<string, OpenMark[]>();
  for (const row of attributes) {
    const element = ordinals.get(keyOf(row))?.get(row.start);
    if (element !== undefined) {
      marks.set(keyOf(row), [...(marks.get(keyOf(row)) ?? []), [element, row.uri, row.local]]);
    }
  }

  return new Map(
    [...marks].map(([key, held]) => [
      key,
      held.toSorted(
        (left, right) =>
          left[0] - right[0] || compareText(left[1], right[1]) || compareText(left[2], right[2]),
      ),
    ]),
  );
};

/**
 * Write plate's admitted set from a run's verdicts and the rows `admit-rows.sql` exported: every
 * document of an admitted one-document package, with its open marks; the JSON Lines dumps of its
 * rows (its path, its `Node`, `OpenAttribute`, `Reference` and `Srcset` rows, and the census
 * `ReferenceAttribute` once) beside it in the run's directory and in the cache under the commit;
 * and, for the snapshot's documents, each one's digest and marks in a local file beside the
 * snapshot.
 */
const writeCommand = Command.make(
  "write",
  {
    commit: Argument.String("commit"),
    directory: Argument.Directory("directory"),
    snapshot: Flag.File("snapshot", { mustExist: false }).pipe(Flag.optional),
  },
  Effect.fn("admit.writeCommand")(function* writeCommand({ commit, directory, snapshot }) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const packages = yield* linesOf(path.join(directory, "packages.jsonl"), Packaged);
    const verdicts = yield* linesOf(path.join(directory, "verdicts.jsonl"), AdmissionVerdict);
    const nodes = yield* linesOf(path.join(directory, "nodes.raw.jsonl"), NodeRow);
    const attributes = yield* linesOf(
      path.join(directory, "open-attributes.raw.jsonl"),
      OpenAttributeRow,
    );
    const references = yield* linesOf(path.join(directory, "references.raw.jsonl"), ReferenceRow);
    const srcsets = yield* linesOf(path.join(directory, "srcsets.raw.jsonl"), SrcsetRow);
    const admittedNames = new Set(
      verdicts.flatMap((verdict) => (verdict._tag === "Admitted" ? [verdict.name] : [])),
    );
    const marks = marksOf(nodes, attributes);
    const documentsOf = (scope: Scope) =>
      packages
        .filter((packaged) => packaged.scopes.includes(scope) && admittedNames.has(packaged.name))
        .flatMap(({ documents, name }) =>
          documents.map(({ digest, path: at }) => ({
            at,
            digest,
            marks: marks.get(`${name}\0${at}`) ?? [],
            name,
          })),
        );
    const admitted = documentsOf("suite").toSorted((left, right) =>
      compareText(left.digest, right.digest),
    );
    const judged = packages.filter(({ scopes }) => scopes.includes("suite")).length;
    const module = `/**
 * Each document the database admitted, by the SHA-256 of its bytes in lowercase hex, with its open
 * marks: each attribute only a wildcard admits, as the database holds it (\`OpenAttribute\`), at
 * the 0-based pre-order index of its element among the document's elements, the root 0, with its
 * namespace and local name. The documents are every document plate's free suites open, and every
 * QTI document of the example corpus and of plate's and pantry's fixtures, each admitted alone as a
 * one-document package. A test opens only these (\`#plate/test/admitted.ts\`), and a sweep reads only
 * these.
 *
 * Written by the admission run (\`packages/qti-pie/packages/pantry/scripts/admit.ts\`) at edullm
 * ${commit}: ${String(judged)} documents judged, ${String(admitted.length)} admitted, by the schema's laws at
 * that commit. Do not edit it: run the admission again when a document a suite opens changes, and
 * when a law lands that moves a verdict (follow-up 5's template needs, the normative half of G1,
 * refuse 1EdTech's slider-1, which this set admits).
 *
 * @module
 */

/**
 * Each document the database admitted, by its digest, with its open marks.
 */
export const admittedDocuments: ReadonlyMap<
  string,
  readonly (readonly [element: number, namespace: string, local: string])[]
> = new Map([
${admitted.map(({ digest, marks: held }) => `  ["${digest}", ${JSON.stringify(held)}],`).join("\n")}
]);
`;
    const target = path.join(import.meta.dirname, "../../plate/src/test/admitted-digests.ts");
    const scoped = new Set(admitted.map(({ name }) => name));
    const dumps = [
      {
        file: "documents.jsonl",
        lines: admitted.map(({ at, digest }) => JSON.stringify({ digest, path: at })),
      },
      {
        file: "nodes.jsonl",
        lines: nodes
          .filter((row) => scoped.has(row.package))
          .map(({ kind, package: name, path: at, start }) =>
            JSON.stringify({ digest: name.slice(2), kind, path: at, start }),
          ),
      },
      {
        file: "references.jsonl",
        lines: references
          .filter((row) => scoped.has(row.package))
          .map(({ kind, name, package: named, path: at, scope, start }) =>
            JSON.stringify({ digest: named.slice(2), kind, name, path: at, scope, start }),
          ),
      },
      {
        file: "srcsets.jsonl",
        lines: srcsets
          .filter((row) => scoped.has(row.package))
          .map(({ kind, name, package: named, path: at, start }) =>
            JSON.stringify({ digest: named.slice(2), kind, name, path: at, start }),
          ),
      },
      {
        file: "reference-attributes.jsonl",
        lines: grammar.references.referenceAttribute.rows.map(({ form, kind, name }) =>
          JSON.stringify({ form, kind, name }),
        ),
      },
      {
        file: "open-attributes.jsonl",
        lines: attributes
          .filter((row) => scoped.has(row.package))
          .map((row) =>
            JSON.stringify({
              class: row.class,
              digest: row.package.slice(2),
              local: row.local,
              path: row.path,
              start: row.start,
              uri: row.uri,
            }),
          ),
      },
    ];
    const home = yield* Config.String("HOME").pipe(Config.withDefault(homedir()));
    const cache = path.join(home, ".cache/qti-pie/admitted", commit);

    yield* fs.writeFileString(target, module);
    yield* fs.makeDirectory(cache, { recursive: true });
    yield* Effect.forEach(
      dumps.flatMap(({ file, lines }) => [
        { at: path.join(directory, file), text: lines.map((line) => `${line}\n`).join("") },
        { at: path.join(cache, file), text: lines.map((line) => `${line}\n`).join("") },
      ]),
      ({ at, text }) => fs.writeFileString(at, text),
      { discard: true },
    );
    yield* Option.match(snapshot, {
      onNone: () => Effect.void,
      onSome: (file) =>
        fs.writeFileString(
          file,
          documentsOf("snapshot")
            .map(({ digest, marks: held }) => `${JSON.stringify({ digest, marks: held })}\n`)
            .join(""),
        ),
    });
    yield* Console.log(
      `${String(admitted.length)} admitted documents written to ${target}, their rows to ${cache}`,
    );
  }),
);

/**
 * The admission run's three steps.
 */
const command = Command.make("admit").pipe(
  Command.withDescription(
    "Judge every document plate's and specimen's free suites open in the database, one document a package, and write the set of the digests it admitted, with their open marks, into plate's test support.",
  ),
  Command.withSubcommands([packagesCommand, importCommand, writeCommand]),
);

if (import.meta.main) {
  NodeRuntime.runMain(
    Command.run(command, { version: "0.0.0" }).pipe(Effect.provide(NodeServices.layer)),
  );
}
