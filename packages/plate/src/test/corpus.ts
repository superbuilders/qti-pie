/**
 * Where the 1EdTech QTI 3 example corpus sits on this machine, and how tests list its folders and
 * read its files and extracted packages.
 *
 * The corpus is extracted once, outside the repository, by {@link extractionCommand}; this module
 * never extracts it and never writes. It reads through `node:fs/promises` inside
 * `Effect.tryPromise`, because the package carries no platform layer for Effect's `FileSystem`.
 *
 * @module
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { availableParallelism } from "node:os";
import path from "node:path";
import { Config, Effect, Schema } from "effect";
import { qtiPieCache } from "#plate/test/qti-pie.ts";

/**
 * The directory under `qti3-examples` the corpus is read from, named for the commit of 1EdTech's
 * examples the tarball holds. The tarball's own top directory is `1EdTech-qti-examples-0a92fbb`,
 * so the extraction step strips it and unpacks into this one.
 */
const corpusDirectory = "qti-examples-0a92fbbb6d2e620a1f7fad19977be4c418246bc0";

/**
 * The one-time extraction of the corpus, the shell text {@link CorpusMissing} hands the operator.
 *
 * It unpacks the cached tarball into {@link corpusDirectory}, its top directory stripped, then each
 * nested `X.zip` beside itself into `X.zip.d/`.
 */
const extractionCommand = [
  "D=~/.cache/qti-pie/qti3-examples",
  `mkdir -p "$D/${corpusDirectory}"`,
  `tar -xzf "$D/qti-examples-0a92fbb.tar.gz" -C "$D/${corpusDirectory}" --strip-components=1`,
  `find "$D/${corpusDirectory}" -name '*.zip' -exec sh -c 'unzip -q -n "$1" -d "$1.d"' _ {} \\;`,
].join("\n");

/**
 * The corpus root: `PLATE_CORPUS_DIR` when it is set and not empty, otherwise the extraction
 * directory, `qti3-examples/<corpusDirectory>` in the cache ({@link qtiPieCache}).
 *
 * `HOME` is read only when `PLATE_CORPUS_DIR` is absent, so a run that names the root needs no
 * home.
 */
export const corpusRoot: Config.Config<string> = Config.NonEmptyString("PLATE_CORPUS_DIR").pipe(
  Config.orElse(() => qtiPieCache("qti3-examples", corpusDirectory)),
);

/**
 * The failure of a corpus read whose root directory does not exist.
 *
 * `root` is the directory {@link corpusRoot} resolved, and `command` is the extraction
 * ({@link extractionCommand}), which creates the default root.
 */
export class CorpusMissing extends Schema.TaggedError<CorpusMissing>()("CorpusMissing", {
  command: Schema.String,
  root: Schema.String,
}) {
  /**
   * The missing root and the two ways to supply it: run the extraction, or point
   * `PLATE_CORPUS_DIR` at a directory that holds the corpus.
   */
  override get message(): string {
    return [
      `No corpus directory at ${this.root}.`,
      "Extract the 1EdTech QTI 3 examples once with these commands, or set PLATE_CORPUS_DIR to the directory that holds them:",
      this.command,
    ].join("\n");
  }
}

/**
 * The failure of a corpus read that names no readable file or folder inside the root.
 *
 * `path` is the relative path the caller gave, and `detail` says why it cannot be read: it leaves
 * the root, or the operating system refused the file or folder it names.
 */
export class CorpusFileUnreadable extends Schema.TaggedError<CorpusFileUnreadable>()(
  "CorpusFileUnreadable",
  { detail: Schema.String, path: Schema.String },
) {
  /**
   * The path asked for, why it cannot be read, and the two repairs: name a file inside the corpus
   * root, or point `PLATE_CORPUS_DIR` at the directory that holds the corpus.
   */
  override get message(): string {
    return `Cannot read corpus file ${this.path}: ${this.detail}. Name a file inside the corpus root, or set PLATE_CORPUS_DIR to the directory that holds the corpus.`;
  }
}

/**
 * Give the text of a failure the operating system raised.
 *
 * @param cause What `node:fs` rejected with.
 * @returns Its message, or its text when it is not an `Error`.
 */
const causeText = (cause: unknown): string =>
  Error.isError(cause) ? cause.message : String(cause);

/**
 * Give the absolute path a corpus-relative path names, when it stays inside the root.
 *
 * @param root The directory {@link corpusRoot} resolved.
 * @param relative The path under the root, as the caller gave it; `.` for the root itself.
 * @returns The absolute path; {@link CorpusFileUnreadable} when it resolves outside the root, by
 *   `..` segments or as an absolute path.
 */
const insideRoot = (
  root: string,
  relative: string,
): Effect.Effect<string, CorpusFileUnreadable> => {
  const resolved = path.resolve(root, relative);
  const fromRoot = path.relative(root, resolved);

  return fromRoot === ".." || fromRoot.startsWith(`..${path.sep}`) || path.isAbsolute(fromRoot)
    ? Effect.fail(
        new CorpusFileUnreadable({
          detail: `it resolves to ${resolved}, outside the corpus root ${root}`,
          path: relative,
        }),
      )
    : Effect.succeed(resolved);
};

/**
 * Confirm that the corpus root is a directory.
 *
 * @param root The directory {@link corpusRoot} resolved.
 * @returns Nothing; {@link CorpusMissing} when it does not exist or is not a directory.
 */
const requireRoot = (root: string): Effect.Effect<void, CorpusMissing> => {
  const missing = new CorpusMissing({ command: extractionCommand, root });

  return Effect.tryPromise({ catch: () => missing, try: () => stat(root) }).pipe(
    Effect.flatMap((stats) => (stats.isDirectory() ? Effect.void : Effect.fail(missing))),
  );
};

/**
 * Read the bytes of one corpus file, named by its path relative to {@link corpusRoot}.
 *
 * A path that resolves outside the root, `..` segments or an absolute path, fails as
 * {@link CorpusFileUnreadable} before anything is read, so a caller can never read beyond the
 * corpus through this function. Symbolic links inside the root are followed.
 *
 * @param relative The file's path under the corpus root, such as
 *   `QTI3_BPIG_Examples/items/BG007.xml`.
 * @returns The file's bytes; {@link CorpusMissing} when the root directory does not exist,
 *   {@link CorpusFileUnreadable} when the path leaves the root or names no readable file, and a
 *   `ConfigError` when neither `PLATE_CORPUS_DIR` nor `HOME` is set.
 */
export const readCorpusFile = Effect.fn("plate.readCorpusFile")(function* readCorpusFile(
  relative: string,
): Effect.fn.Return<Uint8Array, CorpusMissing | CorpusFileUnreadable | Config.ConfigError> {
  yield* Effect.annotateCurrentSpan("corpus.path", relative);

  const root = yield* corpusRoot;
  const file = yield* insideRoot(root, relative);

  yield* requireRoot(root);

  return yield* Effect.tryPromise({
    catch: (cause) =>
      new CorpusFileUnreadable({
        detail: `${causeText(cause)}; the corpus root is ${root}`,
        path: relative,
      }),
    try: () => readFile(file),
  });
});

/**
 * List every regular file under a folder of the corpus, at any depth.
 *
 * Each file is a POSIX path from the folder, and the list is sorted in JavaScript's default string
 * order. Symbolic links are not followed, so a link is never listed. A folder that resolves outside
 * the root fails as {@link readCorpusFile} fails for such a path, before anything is listed.
 *
 * @param directory The folder's path under the corpus root, such as
 *   `QTI3_BPIG_Examples/BPIG_22April.zip.d`; `.` for the root itself.
 * @returns The files' paths; {@link CorpusMissing} when the root directory does not exist,
 *   {@link CorpusFileUnreadable} when the folder leaves the root or it or a folder under it cannot
 *   be listed, and a `ConfigError` when neither `PLATE_CORPUS_DIR` nor `HOME` is set.
 */
export const filesUnder = Effect.fn("plate.filesUnder")(function* filesUnder(
  directory: string,
): Effect.fn.Return<readonly string[], CorpusMissing | CorpusFileUnreadable | Config.ConfigError> {
  yield* Effect.annotateCurrentSpan("corpus.path", directory);

  const root = yield* corpusRoot;
  const folder = yield* insideRoot(root, directory);

  yield* requireRoot(root);

  const entries = yield* Effect.tryPromise({
    catch: (cause) =>
      new CorpusFileUnreadable({
        detail: `${causeText(cause)}; the corpus root is ${root}, and its extraction unzips each X.zip into the X.zip.d/ folder beside it`,
        path: directory,
      }),
    try: () => readdir(folder, { recursive: true, withFileTypes: true }),
  });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(folder, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"),
    )
    .toSorted();
});

/**
 * Read every file of a corpus package's extracted folder, `X.zip.d/`, keyed by its path from the
 * folder, as a host holds a package's files once it unzips it.
 *
 * The files are those {@link filesUnder} lists, links left out, each read by
 * {@link readCorpusFile}, as many at once as the machine has cores.
 *
 * @param directory The folder's path under the corpus root, such as
 *   `QTI3_BPIG_Examples/BPIG_22April.zip.d`.
 * @returns Each file's bytes by its path from the folder; {@link CorpusMissing} when the root
 *   directory does not exist, {@link CorpusFileUnreadable} when the folder leaves the root or a
 *   folder or file under it cannot be read, and a `ConfigError` when neither `PLATE_CORPUS_DIR` nor
 *   `HOME` is set.
 */
export const readCorpusPackage = Effect.fn("plate.readCorpusPackage")(function* readCorpusPackage(
  directory: string,
): Effect.fn.Return<
  ReadonlyMap<string, Uint8Array>,
  CorpusMissing | CorpusFileUnreadable | Config.ConfigError
> {
  yield* Effect.annotateCurrentSpan("corpus.path", directory);

  const files = yield* filesUnder(directory);
  const entries = yield* Effect.all(
    files.map((file) =>
      Effect.map(readCorpusFile(`${directory}/${file}`), (bytes) => [file, bytes] as const),
    ),
    { concurrency: availableParallelism() },
  );

  return new Map(entries);
});

/**
 * The corpus's document set: every regular file whose name ends in `.xml` under {@link corpusRoot},
 * at any depth.
 *
 * Each member is a corpus-relative POSIX path, the form {@link readCorpusFile} takes, and the set
 * is sorted in JavaScript's default string order. A nested zip's extracted copy, under `X.zip.d/`,
 * is a member like any other file. Symbolic links are not followed, so a link is never a member. It
 * is the one list the corpus sweeps read.
 *
 * Fails as {@link filesUnder} fails for the root.
 */
export const corpusDocuments: Effect.Effect<
  readonly string[],
  CorpusMissing | CorpusFileUnreadable | Config.ConfigError
> = filesUnder(".").pipe(
  Effect.map((files) => files.filter((member) => member.endsWith(".xml"))),
  Effect.withSpan("plate.corpusDocuments"),
);
