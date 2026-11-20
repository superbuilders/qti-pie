/**
 * The corpus sweeps' shared support: every corpus member opened once per test file, the records a
 * templated item is redacted under, and the time a sweep may take.
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
import { Array as Arr, Cause, Effect, Exit, Option, Result } from "effect";
import { begin } from "#plate/begin.ts";
import type { EngineFailure } from "#plate/engine/evaluate.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import { corpusDocuments, readCorpusFile } from "#plate/test/corpus.ts";
import type { CorpusFileUnreadable, CorpusMissing } from "#plate/test/corpus.ts";
import { admitted, isAdmitted } from "#plate/test/admitted.ts";
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
 * The instance token every sweep record begins under, so a record is a function of its item and
 * seed.
 */
const sweepInstance = "sweep";

/**
 * Report whether an accepted item's template processing runs: the item holds template rules.
 *
 * @param accepted The accepted document.
 * @returns Whether `begin` runs template processing for it, so `redact` needs its record.
 */
export const templated = (accepted: Accepted): boolean =>
  accepted.item.templateProcessing.kind === "runs";

/**
 * The seeds the template sweeps begin a record under: fixed strings, so a run repeats and a
 * failure names the seed. `begin` draws a fresh seed when given none, so a sweep never leaves one
 * out.
 */
export const sweepSeeds = ["1", "2"] as const;

/**
 * One state a templated item is redacted in: a record begun under a sweep seed, or no record.
 */
export interface RecordState {
  /**
   * The state as a failure names it: `seed "1"`, or `no record`.
   */
  readonly name: string;
  /**
   * The record `begin` started under the seed, decoded from the form the host stores; none for no
   * record.
   */
  readonly record: Option.Option<ItemRecord>;
}

/**
 * The state of an item redacted with no record.
 */
export const noRecord: RecordState = { name: "no record", record: Option.none() };

/**
 * Begin an accepted item's record under a sweep seed, with the fixed instance
 * {@link sweepInstance}.
 *
 * @param accepted The accepted document.
 * @param seed The sweep seed.
 * @returns The record, or the failure of `begin`.
 */
export const begunUnder = (
  accepted: Accepted,
  seed: string,
): Result.Result<ItemRecord, EngineFailure> => begin(accepted, { instance: sweepInstance, seed });

/**
 * Begin an accepted item's record under each of {@link sweepSeeds} ({@link begunUnder}); then add
 * {@link noRecord}.
 *
 * @param accepted The accepted document.
 * @returns A state per seed, in {@link sweepSeeds}' order, then the state with no record; or the
 *   first failure of `begin`.
 */
export const recordStates = (
  accepted: Accepted,
): Result.Result<readonly RecordState[], EngineFailure> =>
  Result.map(
    Result.all(
      sweepSeeds.map((seed) =>
        Result.map(begunUnder(accepted, seed), (record): RecordState => ({
          name: `seed ${JSON.stringify(seed)}`,
          record: Option.some(record),
        })),
      ),
    ),
    (begun): readonly RecordState[] => [...begun, noRecord],
  );
