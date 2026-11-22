import { availableParallelism } from "node:os";
import { Config, Effect, Option } from "effect";

/**
 * The named lease database, when one is held; `Option.none()` otherwise.
 */
const leaseDatabase = Config.option(Config.String("QTI_PIE_PG_DATABASE"));

/**
 * Whether `QTI_PIE_CORPUS=1` asks for the 1EdTech corpus tests.
 */
export const corpusRequested = Config.String("QTI_PIE_CORPUS").pipe(
  Config.withDefault(""),
  Config.map((value) => value === "1"),
);

/**
 * Whether `QTI_PIE_GENETIC=1` asks for the genetic searches' long budget, beside the bounded one
 * every free run spends.
 */
export const geneticRequested = Config.String("QTI_PIE_GENETIC").pipe(
  Config.withDefault(""),
  Config.map((value) => value === "1"),
);

/**
 * The settings, resolved once at load through the default provider.
 */
export const settings = Effect.runSync(
  Config.all({ corpusRequested, geneticRequested, leaseDatabase }),
);

/**
 * Whether this run holds a lease, so the database suites may run.
 */
export const hasLease = Option.isSome(settings.leaseDatabase);

/**
 * How many sketches an exhaustion runs at once where its cases share no state, no session, schema,
 * database or folder: the machine's parallelism, as Node reports it. A search whose cases share
 * state runs one sketch at a time.
 */
export const searchWidth = availableParallelism();

/**
 * How many child processes a test helper runs at once, each on its own CPU: `validate`'s `xmllint`
 * batches (`#pantry/test/gen/xmllint.ts`) and `materializeCorpus`'s `tar` and `unzip` runs
 * (`#pantry/test/fixtures.ts`). A derived limit, in child processes from one test process: the
 * machine's logical CPUs as Node counts them (`availableParallelism()`), since each child runs on
 * one CPU, so one a CPU keeps every CPU busy and more only queue on the scheduler. Every Vitest
 * worker running such a helper holds its own.
 */
export const processWidth = availableParallelism();

/**
 * Every search's Vitest timeout: none, which Vitest states as zero, so the testing library's bridge
 * gives the search no deadline (`noDeadline` of `@bjornpagen/testing/explore`) and it judges its
 * whole fixed set of cases, the run seed's, whatever the machine's load. The library's rule
 * (`@bjornpagen/testing`'s `vitest/config.ts`): "A long search that keeps making progress must
 * never fail on wall time; each case's hang guard is what catches a case that stops." Each search's
 * `caseHang` is that guard; a test that runs no search keeps its project's hang guard.
 */
export const searchTimeout = 0;
