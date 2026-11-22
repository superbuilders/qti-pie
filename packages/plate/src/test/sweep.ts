/**
 * The corpus sweeps' shared support: every corpus member opened once per test file, the records a
 * templated item is redacted under, read from the golden grading data, and the time a sweep may
 * take.
 *
 * Test support, outside the core: nothing under `src/index.ts`'s closure imports it
 * (`src/boundary.test.ts`). It reads the corpus through `corpusDocuments` and `readCorpusFile`, so
 * a test points it elsewhere with `PLATE_CORPUS_DIR` through `ConfigProvider.fromUnknown`.
 *
 * @module
 */
import { availableParallelism } from "node:os";
import { assert } from "@effect/vitest";
import type { Config } from "effect";
import { Array as Arr, Cause, Effect, Exit, Option } from "effect";
import type { ItemRecord } from "#plate/model/record.ts";
import { corpusDocuments, readCorpusFile } from "#plate/test/corpus.ts";
import type { CorpusFileUnreadable, CorpusMissing } from "#plate/test/corpus.ts";
import { admitted, isAdmitted } from "#plate/test/admitted.ts";
import { documentDigest } from "#plate/test/records.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted, Verdict } from "#plate/validate/verdict.ts";

/**
 * The time a corpus sweep's case may take. Opening the corpus (about 800 members) and running a
 * sweep over it takes seconds here; the bound leaves room for a loaded machine without letting a
 * hung run stall the suite.
 */
export const sweepTimeoutMs = 600_000;

/**
 * One corpus member, read and opened.
 */
export interface Member {
  /**
   * The member's bytes as read from the corpus, which `admitted` judged.
   */
  readonly bytes: Uint8Array;
  /**
   * The member's corpus-relative path, which `admitted` took as its location.
   */
  readonly location: string;
  /**
   * What `admitted` gave: its verdict, or the defect that escaped it.
   */
  readonly verdict: Exit.Exit<Verdict>;
}

/**
 * Read one corpus document and, where the database admitted it ({@link isAdmitted}), open it,
 * keeping a defect `admitted` lets escape as the member's outcome rather than the sweep's failure.
 *
 * @param location The document's corpus-relative path.
 * @returns The member, none for a document the database refuses, which is no member; a failure
 *   only when the corpus cannot be read.
 */
const openMember = Effect.fnUntraced(function* openMember(
  location: string,
): Effect.fn.Return<
  Option.Option<Member>,
  CorpusFileUnreadable | CorpusMissing | Config.ConfigError
> {
  const bytes = yield* readCorpusFile(location);
  if (!isAdmitted(bytes)) {
    return Option.none();
  }

  const verdict = yield* Effect.exit(admitted(location, bytes));

  return Option.some({ bytes, location, verdict });
});

/**
 * Every member of the corpus document set, read and opened, in the set's order.
 *
 * It runs once per test file: the first run's result, members or failure, is kept for the module's
 * life, and Vitest gives each test file its own module. That run reads the corpus root from the
 * configuration in force when it starts.
 */
export const openCorpus: Effect.Effect<
  readonly Member[],
  CorpusFileUnreadable | CorpusMissing | Config.ConfigError
> = Effect.runSync(
  Effect.cached(
    corpusDocuments.pipe(
      Effect.flatMap((documents) =>
        Effect.all(
          documents.map((location) => openMember(location)),
          { concurrency: availableParallelism() },
        ),
      ),
      Effect.map(Arr.getSomes),
    ),
  ),
);

/**
 * Give a member's accepted document, when `admitted` accepted it with either accepting verdict.
 *
 * A defect that escaped `admitted` fails the calling test, naming the member and the defect, so no
 * sweep drops a member `admitted` could not judge without saying so.
 *
 * @param member The member.
 * @returns The accepted document, or none for a refused or unchecked member.
 */
export const acceptedOf = (member: Member): Option.Option<Accepted> =>
  Exit.match(member.verdict, {
    onFailure: (cause) =>
      assert.fail(`${member.location}: admitted let a defect escape: ${Cause.pretty(cause)}`),
    onSuccess: acceptedItem,
  });

/**
 * Report whether an accepted item has template processing, which the QTI database runs at the
 * take, so `redact` needs the record the database returned for it.
 *
 * @param accepted The accepted document.
 * @returns Whether the item holds a `qti-template-processing`.
 */
export const templated = (accepted: Accepted): boolean => accepted.item.templated;

/**
 * One state a templated item is redacted in: a record the golden grading data holds, or no record.
 */
export interface RecordState {
  /**
   * The state as a failure names it: `golden 1`, or `no record`.
   */
  readonly name: string;
  /**
   * The record, none for no record.
   */
  readonly record: Option.Option<ItemRecord>;
}

/**
 * The state of an item redacted with no record.
 */
export const noRecord: RecordState = { name: "no record", record: Option.none() };

/**
 * Give the states a templated corpus item is redacted in: a record per seed of the golden recording
 * (`goldenRecords` in `#plate/test/records.ts`), named `golden 1`, `golden 2`, … in the recording's
 * order, then {@link noRecord}. An item the recording did not run is redacted with no record only.
 *
 * @param bytes The item's bytes, by whose digest the recording keys it.
 * @param golden The recording's records, by document digest.
 * @returns The states.
 */
export const recordStates = (
  bytes: Uint8Array,
  golden: ReadonlyMap<string, readonly ItemRecord[]>,
): readonly RecordState[] => [
  ...(golden.get(documentDigest(bytes)) ?? []).map((record, index): RecordState => ({
    name: `golden ${String(index + 1)}`,
    record: Option.some(record),
  })),
  noRecord,
];
