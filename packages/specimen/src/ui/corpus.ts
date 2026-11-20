/**
 * 1EdTech's QTI 3 example corpus as plate's UI suite shows it: every accepted item of the corpus,
 * opened through plate's public `openAdmitted` as a host opens a document, with the configuration
 * that gives every corpus file an address, the record an item whose template processing runs starts
 * from, and what the suite reads of its XML (`#specimen/ui/source.ts`).
 *
 * The corpus is extracted once, outside the repository, as plate's own corpus sweeps read it
 * (`plate/src/test/corpus.ts`): under `PLATE_CORPUS_DIR`, or the extraction directory in
 * `~/.cache/qti-pie/qti3-examples`. This module never extracts it and never writes. Test support
 * for plate's UI suite under `src/ui/`.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import path from "node:path";
import { acceptedItem, begin, configure, openAdmitted } from "@qti-pie/plate";
import type { Accepted, Configuration } from "@qti-pie/plate";
import { isAdmitted } from "@qti-pie/plate/test/admitted";
import { Config, Data, Effect, Option, Result } from "effect";
import { instance } from "#specimen/ui/rules.ts";
import type { SourceItem } from "#specimen/ui/rules.ts";
import { itemFactsOf } from "#specimen/ui/source.ts";

/**
 * The directory under `~/.cache/qti-pie/qti3-examples` the corpus is extracted into, named for the
 * commit of 1EdTech's examples its tarball holds.
 */
const corpusDirectory = "qti-examples-0a92fbbb6d2e620a1f7fad19977be4c418246bc0";

/**
 * The digest of the corpus's files ({@link digestOf}), which pins the suite to the corpus it was
 * run on: turbo's cache cannot read a folder outside the repository, so this tracked value is the
 * corpus's version among the `test:ui` task's inputs, and the reader refuses a corpus of any other
 * digest, so a replayed pass is a pass on this corpus.
 */
const corpusDigest = "3ee408912ab0b1d6fd7edbbc19ba9085fad26e0f394de1d1368fa1c1664369ce";

/**
 * The seed every templated item's record begins under, so a run repeats.
 */
const recordSeed = "1";

/**
 * The corpus root: `PLATE_CORPUS_DIR` when it is set and not empty, otherwise the extraction
 * directory under `HOME`.
 */
const corpusRoot: Config.Config<string> = Config.NonEmptyString("PLATE_CORPUS_DIR").pipe(
  Config.orElse(() =>
    Config.NonEmptyString("HOME").pipe(
      Config.map((home) => path.join(home, ".cache", "qti-pie", "qti3-examples", corpusDirectory)),
    ),
  ),
);

/**
 * The corpus could not be read at its root: it is not extracted there, or a file under it cannot be
 * read.
 */
class CorpusUnreadable extends Data.TaggedError("CorpusUnreadable")<{
  readonly detail: string;
  readonly root: string;
}> {
  /**
   * What could not be read, and the two repairs.
   */
  override get message(): string {
    return `Cannot read 1EdTech's QTI 3 examples at ${this.root}: ${this.detail}. Extract them there as plate's src/test/corpus.ts says, or set PLATE_CORPUS_DIR to the folder that holds them.`;
  }
}

/**
 * The corpus at the root is not the one the suite is pinned to: its files' digest is not
 * {@link corpusDigest}.
 */
class CorpusUnpinned extends Data.TaggedError("CorpusUnpinned")<{
  readonly digest: string;
  readonly root: string;
}> {
  /**
   * The two digests, and the two repairs.
   */
  override get message(): string {
    return `The corpus at ${this.root} has the digest ${this.digest}, and plate's UI suite is pinned to ${corpusDigest}. Extract commit ${corpusDirectory.slice("qti-examples-".length)} of 1EdTech's QTI 3 examples there afresh, as plate's src/test/corpus.ts says, or, to move the suite to another corpus, change corpusDirectory and corpusDigest in this module together.`;
  }
}

/**
 * Give the text of what `node:fs` rejected with.
 *
 * @param cause The rejection.
 * @returns Its message, or its text.
 */
const causeText = (cause: unknown): string =>
  cause instanceof Error ? cause.message : String(cause);

/**
 * Give an address for every corpus file, as a host serves a package's files: its path under
 * `/corpus/`, each segment percent-encoded.
 *
 * @param files Every file's path from the corpus root.
 * @returns The configuration, every other field at its default.
 */
const configurationOf = (files: readonly string[]) =>
  configure({
    assets: files.map(
      (file) => [file, `/corpus/${file.split("/").map(encodeURIComponent).join("/")}`] as const,
    ),
    seed: "",
    validateResponses: false,
  });

/**
 * Open one corpus document as the suite shows it: its verdict's accepted item, none for a refused
 * or unchecked one, with the record `begin` starts for an item whose template processing runs and
 * what the suite reads of its XML.
 *
 * @param location The document's path from the root.
 * @param bytes Its bytes.
 * @param configuration The configuration every corpus item renders under.
 * @returns The item, or none.
 */
const itemAt = (location: string, bytes: Uint8Array, configuration: Configuration) =>
  Effect.map(openAdmitted(location, bytes), (verdict) =>
    Option.map(acceptedItem(verdict), (accepted: Accepted): SourceItem => {
      const facts = itemFactsOf(new TextDecoder().decode(bytes));

      return {
        accepted,
        begun:
          accepted.item.templateProcessing.kind === "runs"
            ? Option.some(Result.getOrThrow(begin(accepted, { instance, seed: recordSeed })))
            : Option.none(),
        configuration,
        given: Option.none(),
        host: Option.none(),
        kinds: facts.kinds,
        location,
        offered: facts.offered,
        scoring: facts.scoring,
      };
    }),
  );

/**
 * Give the digest of a corpus's files: SHA-256 over each file's path from the root and its own
 * SHA-256, one line a file, in path order, so any file added, gone, moved or changed changes it.
 *
 * @param files Each file's path from the root and its bytes, in path order.
 * @returns The digest, in hex.
 */
const digestOf = (files: readonly (readonly [string, Uint8Array])[]): string => {
  const digest = createHash("sha256");

  for (const [file, bytes] of files) {
    digest.update(`${file}\0${createHash("sha256").update(bytes).digest("hex")}\n`);
  }

  return digest.digest("hex");
};

/**
 * Every accepted item of the corpus document set, every `.xml` file under the root outside the QTI
 * 2.2 examples that the database admitted (`isAdmitted`, `@qti-pie/plate/test/admitted`), in path
 * order, read once per test file, from a corpus whose digest is {@link corpusDigest}.
 */
export const corpusItems = Effect.runSync(
  Effect.cached(
    Effect.gen(function* corpusItems() {
      const root = yield* corpusRoot;
      const unreadable = (cause: unknown) =>
        new CorpusUnreadable({ detail: causeText(cause), root });
      const entries = yield* Effect.tryPromise({
        catch: unreadable,
        try: () => readdir(root, { recursive: true, withFileTypes: true }),
      });
      const paths = entries
        .filter((entry) => entry.isFile())
        .map((entry) =>
          path.relative(root, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"),
        )
        .toSorted();
      const files = yield* Effect.forEach(
        paths,
        (file) =>
          Effect.tryPromise({
            catch: unreadable,
            try: () => readFile(path.join(root, file)),
          }).pipe(Effect.map((bytes) => [file, bytes] as const)),
        { concurrency: availableParallelism() },
      );
      const digest = digestOf(files);

      if (digest !== corpusDigest) {
        return yield* Effect.fail(new CorpusUnpinned({ digest, root }));
      }

      const configuration = yield* configurationOf(paths);
      const items = yield* Effect.forEach(
        files.filter(([file, bytes]) => file.endsWith(".xml") && isAdmitted(bytes)),
        ([location, bytes]) => itemAt(location, bytes, configuration),
        { concurrency: availableParallelism() },
      );

      return items.flatMap(Option.toArray);
    }),
  ),
);
