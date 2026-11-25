/**
 * 1EdTech's QTI 3 example corpus as plate's UI suite shows it: every accepted item of the corpus,
 * opened through plate's public `openAdmitted` as a host opens a document, with the configuration
 * that gives every corpus file an address, the record an item whose template processing runs starts
 * from, the stimuli its stimulus refs name, each the corpus's accepted stimulus at its ref's
 * target, as a host hands them, and what the suite reads of its XML (`#specimen/ui/source.ts`).
 *
 * A file a corpus stimulus names that the corpus lacks (the sharedStimulus example's passage names
 * `images/apip_VE_IP_05_croc.png` and its kin, which its package does not hold) is given an address
 * under `/corpus-placeholder/`, as the admission run judged the stimulus with a placeholder of the
 * file's kind in its place (`pantry/src/test/admission.ts`): the suite shows the document the
 * database admitted.
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
import {
  acceptedItem,
  acceptedStimulus,
  assetPaths,
  configure,
  openAdmitted,
} from "@qti-pie/plate";
import type {
  Accepted,
  AcceptedStimulus,
  Configuration,
  ItemRecord,
  Verdict,
} from "@qti-pie/plate";
import { isAdmitted } from "@qti-pie/plate/test/admitted";
import { documentDigest, goldenRecords } from "@qti-pie/plate/test/records";
import { Config, Data, Effect, Option } from "effect";
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
 * corpus's version among the `test` task's inputs, and the reader refuses a corpus of any other
 * digest, so a replayed pass is a pass on this corpus.
 */
const corpusDigest = "3ee408912ab0b1d6fd7edbbc19ba9085fad26e0f394de1d1368fa1c1664369ce";

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
  Error.isError(cause) ? cause.message : String(cause);

/**
 * Write a path's address under a root, each segment percent-encoded.
 *
 * @param root The root, such as `/corpus/`.
 * @param file The file's path from the corpus root.
 * @returns The address.
 */
const addressOf = (root: string, file: string): string =>
  `${root}${file.split("/").map(encodeURIComponent).join("/")}`;

/**
 * Give an address for every corpus file, as a host serves a package's files: its path under
 * `/corpus/`; and one under `/corpus-placeholder/` for each file a stimulus names that the corpus
 * lacks, the admission run's placeholder.
 *
 * @param files Every file's path from the corpus root.
 * @param placeholders The files stimuli name that the corpus lacks.
 * @returns The configuration, every other field at its default.
 */
const configurationOf = (files: readonly string[], placeholders: readonly string[]) =>
  configure({
    assets: [
      ...files.map((file) => [file, addressOf("/corpus/", file)] as const),
      ...placeholders.map((file) => [file, addressOf("/corpus-placeholder/", file)] as const),
    ],
    seed: "",
  });

/**
 * A node of a stimulus's body, as plate's public type of an accepted stimulus holds it.
 */
type StimulusNode = AcceptedStimulus["stimulus"]["body"][number];

/**
 * Give the files a stimulus's body names by its elements' URL attributes, each as plate resolves it
 * against the stimulus's own location (`assetPaths`), in document order.
 *
 * @param document The stimulus's location.
 * @param nodes Its body's nodes.
 * @returns The files' paths from the corpus root.
 */
const filesNamed = (document: string, nodes: readonly StimulusNode[]): readonly string[] =>
  nodes.flatMap((node) =>
    node.kind === "element"
      ? [
          ...node.attributes.flatMap(({ name, value }) =>
            assetPaths(document, node.tag, name, value),
          ),
          ...filesNamed(document, node.children),
        ]
      : [],
  );

/**
 * Give one opened corpus document as the suite shows it: its verdict's accepted item, none for a
 * refused or unchecked one or a document that is no item, with the record the database's take gives
 * an item with template processing, the golden grading data's first for it, the stimuli its refs
 * name, and what the suite reads of its XML.
 *
 * @param opened The document's path from the root, its bytes and its verdict.
 * @param opened.bytes Its bytes.
 * @param opened.location Its path from the root.
 * @param opened.verdict Its verdict.
 * @param configuration The configuration every corpus item renders under.
 * @param stimuli The corpus's accepted stimuli, by their paths from the root.
 * @param golden The golden grading data's records of the corpus's items, by the digest of their
 *   bytes.
 * @returns The item, or none.
 */
const itemAt = (
  {
    bytes,
    location,
    verdict,
  }: { readonly bytes: Uint8Array; readonly location: string; readonly verdict: Verdict },
  configuration: Configuration,
  stimuli: ReadonlyMap<string, AcceptedStimulus>,
  golden: ReadonlyMap<string, readonly ItemRecord[]>,
): Option.Option<SourceItem> =>
  Option.map(acceptedItem(verdict), (accepted: Accepted): SourceItem => {
    const facts = itemFactsOf(new TextDecoder().decode(bytes));

    return {
      accepted,
      configuration,
      given: Option.none(),
      host: Option.none(),
      kinds: facts.kinds,
      location,
      offered: facts.offered,
      stimuli: accepted.item.content["qti-assessment-stimulus-ref"].flatMap(({ target }) =>
        Option.toArray(Option.fromUndefinedOr(stimuli.get(target))),
      ),
      taken: accepted.item.templated
        ? Option.fromUndefinedOr(golden.get(documentDigest(bytes))?.[0])
        : Option.none(),
    };
  });

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

      const opened = yield* Effect.forEach(
        files.filter(([file, bytes]) => file.endsWith(".xml") && isAdmitted(bytes)),
        ([location, bytes]) =>
          Effect.map(openAdmitted(location, bytes), (verdict) => ({ bytes, location, verdict })),
        { concurrency: availableParallelism() },
      );
      const stimuli = new Map(
        opened.flatMap(({ verdict }) =>
          Option.toArray(
            Option.map(
              acceptedStimulus(verdict),
              (accepted) => [accepted.stimulus.document, accepted] as const,
            ),
          ),
        ),
      );
      const held = new Set(paths);
      const placeholders = [
        ...new Set(
          [...stimuli.values()].flatMap(({ stimulus }) =>
            filesNamed(stimulus.document, stimulus.body),
          ),
        ),
      ].filter((file) => !held.has(file));
      const configuration = yield* configurationOf(paths, placeholders);
      const golden = yield* goldenRecords;

      return opened.flatMap((each) => Option.toArray(itemAt(each, configuration, stimuli, golden)));
    }),
  ),
);
