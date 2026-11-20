/**
 * The importer's front door: a package as `readPackage` read it (`#pantry/import/read.ts`) in, the
 * package stored under the name its caller gave it out, or one named refusal (plan W5, Q5.15; the
 * W5 amendment's A, C19 and C22).
 *
 * The read package is built into its rows once (`importRowsOf` of `#pantry/import/program.ts`, the
 * rows an application writes itself with its own grizzle `Db` where it needs the package in a
 * transaction of its own), its directory never read again. Its media files' bytes are put in the
 * content-addressed store first (`MediaStore` of `#pantry/package/media.ts`), each under the
 * SHA-256 its `Media` row states, so no stored row names bytes the store lacks; then the rows are
 * written by the author login's `insertWrite` member, the one ChangeSet step
 * (`#pantry/qti/logins.ts`) that `grizzle generate` compiled into the login's served file, applied
 * once to those rows. The caller passes its own `Db`'s workload, of any login whose workload serves
 * `insertWrite` (grizzle's `MemberHandle`): `AuthorApp`'s over `Qti` and `MediaAuthorApp`'s over
 * `QtiMedia` alike. This module is a convenience over that one apply: it retries a transient
 * refusal and a commit with no answer, and names a refusal's QTI rules.
 *
 * The write only inserts, and every row is keyed by the package's name, so a package under a new
 * name is inserted whole, the same package again under its name is grizzle's `unchanged`, and
 * another package under a stored name is refused on the keys the two share: nothing stored is
 * ever replaced, and nothing is minted. So a commit with no answer is settled by running the write
 * again, which answers whether the database holds the package: `unchanged` where it committed,
 * `accepted` where it did not and now has. Two packages that share a manifest identifier are two
 * packages under two names. The apply is one transaction, so the database holds the whole package
 * or nothing of it: there is no split and no completion marker. grizzle writes each relation's rows
 * in one statement, its nested rows past one Bind message through a carrier, a temporary table of
 * the write's own (README, "Sizes"; grizzle `164aeb06`), so no transport bound splits the write.
 */
import type { CallError, MemberHandle } from "@bjornpagen/grizzle";
import { Clock, Context, Duration, Effect, Random, Ref, Schedule } from "effect";
import { importRowsOf } from "#pantry/import/program.ts";
import type { QtiPackage } from "#pantry/import/read.ts";
import { refusalOf } from "#pantry/import/refusal.ts";
import type { ImportRefused } from "#pantry/import/rules.ts";
import { MediaStore } from "#pantry/package/media.ts";
import type { MediaUnstored } from "#pantry/package/media.ts";
import type { insertWrite } from "#pantry/qti/logins.ts";

/**
 * The first wait between two attempts of an import's database write, after a transient refusal;
 * each wait after it doubles (Effect's `Schedule.exponential`), up to
 * {@link importRetryWaitMaxSeconds}, and is drawn uniformly below that.
 *
 * @limitKind provisional
 * @owner pantry's import (src/import/package.ts, RetrySchedule's default)
 * @unit milliseconds
 * @scope the first wait of the retries of one import's insertWrite apply
 * @guards with no wait, a write refused by a serialization failure is sent again at once, and the attempts that
 *   collided collide again while the contention lasts
 * @measure run the database suite's concurrent imports (pantry's *.db.test.ts at several workers) on a private
 *   cluster, at first waits of 10, 50 and 200 ms, counting 40001 retries and import failures, and keep the wait past
 *   which the retries stop falling
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const importRetryFirstWaitMs = 50;

/**
 * The longest one wait between attempts of an import's database write lasts, before its jitter, so
 * the retries keep sampling while a burst of contention thins out.
 *
 * @limitKind provisional
 * @owner pantry's import (src/import/package.ts, RetrySchedule's default)
 * @unit seconds
 * @scope each wait of the retries of one import's insertWrite apply, before its jitter
 * @guards an exponential wait with no cap grows past the contention it waits out, so the last attempts come long after
 *   the database would take them
 * @measure with the same runs as importRetryFirstWaitMs's, at caps of 0.5, 1 and 2 s, keep the smallest cap whose
 *   failures are no more than the next one's
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const importRetryWaitMaxSeconds = 1;

/**
 * How long the retries of one import's database write run, in all: the retries stop at the first
 * attempt that ends after it, and that attempt's failure is the import's.
 *
 * @limitKind provisional
 * @owner pantry's import (src/import/package.ts, RetrySchedule's default)
 * @unit seconds
 * @scope the retries of one import's insertWrite apply, from its first attempt
 * @guards retries bounded by nothing retry a write while contention lasts, so an import under a contention that never
 *   clears never ends
 * @measure with the same runs as importRetryFirstWaitMs's, record how long the longest burst of 40001s an import meets
 *   lasts (9 workers met 1,008 in 12 minutes on 2026-11-09, at grizzle 26e3c15f), and keep a bound that outlasts it
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const importRetryElapsedMaxSeconds = 30;

/**
 * The longest the retries of one database call run, in total ({@link
 * importRetryElapsedMaxSeconds}).
 */
const retryBound = Duration.seconds(importRetryElapsedMaxSeconds);

/**
 * The longest one wait between attempts lasts, before jitter ({@link importRetryWaitMaxSeconds}).
 */
const retryDelayCap = Duration.seconds(importRetryWaitMaxSeconds);

/**
 * The schedule the import retries the `insertWrite` apply on after a transient refusal or a commit
 * with no answer. Its
 * default is the production schedule, so a caller provides nothing; a test provides another through
 * `Effect.provideService`, to give up sooner than the bound allows.
 *
 * The default is bounded by elapsed time and not by count. A serialization failure never depends
 * on the call's inputs, and under contention PostgreSQL expects many attempts, so a count says
 * nothing about how long the contention lasts. The wait starts at {@link importRetryFirstWaitMs}
 * (50 ms) and doubles, as `Schedule.exponential` does by default, is capped at
 * {@link importRetryWaitMaxSeconds} (one second) so the retries keep sampling while the burst thins
 * out, and is then drawn uniformly from zero to that wait, so attempts that collided do not retry
 * together. The retries stop at the first attempt that ends after
 * {@link importRetryElapsedMaxSeconds} (thirty seconds), and that attempt's failure is the call's.
 */
export const RetrySchedule = Context.Reference<Schedule.Schedule<unknown>>(
  "pantry/import/package/RetrySchedule",
  {
    defaultValue: () =>
      Schedule.exponential(Duration.millis(importRetryFirstWaitMs)).pipe(
        Schedule.modifyDelay(
          Effect.fnUntraced(function* jitters({ duration }) {
            const random = yield* Random.next;

            return Duration.times(Duration.min(duration, retryDelayCap), random);
          }),
        ),
        Schedule.upTo({ duration: retryBound }),
      ),
  },
);

/**
 * What runs each attempt of the import's apply: by default the attempt as it is, so a caller
 * provides nothing. A wrap runs as each attempt starts, so it marks the moment the import's
 * database write begins: the command line's wraps the attempt it is given in one that first records
 * how a stop by `--timeout` from then on is settled (`#pantry/cli/settle.ts` `settlingWrite`),
 * since grizzle's README says an interrupted write may have committed. A test provides a wrap
 * through `Effect.provideService` to inject a failure the cluster will not raise on demand (a
 * `transient` call error, a `commitUnknown` before or after the apply ran, an interruption while it
 * waits on a lock), and the import's retries then meet that failure as they would meet the
 * database's.
 */
export const WrapApply = Context.Reference<
  <A>(apply: Effect.Effect<A, CallError>) => Effect.Effect<A, CallError>
>("pantry/import/package/WrapApply", { defaultValue: () => (apply) => apply });

/**
 * Whether the same call may be run again to an answer: the database refused the attempt for a
 * reason outside the call's inputs (grizzle's `transient`), or its COMMIT got no answer
 * (`commitUnknown`), which grizzle's README settles by reading back before running the call again.
 * The write only inserts, so running it again is that read: it answers `unchanged` where the first
 * attempt committed. Nothing else is run again.
 *
 * @param error - The failure.
 * @returns Whether the call is run again.
 */
const isRerun = (error: CallError): boolean =>
  error.kind === "transient" || error.kind === "commitUnknown";

/**
 * Run `attempt` again while its failure is one a rerun settles ({@link isRerun}), on `schedule`.
 * Each rerun logs the attempt it follows, the time since the first attempt and the failure's kind,
 * so a run shows how often it ran again; a failure after the last rerun is the error it was,
 * logged with the attempts made.
 *
 * @param name - The call's name, for the logs.
 * @param attempt - One attempt.
 * @param schedule - The reruns' schedule.
 * @returns The first attempt that succeeds, or the last failure.
 */
const retried = <A, E extends CallError, R>(
  name: string,
  attempt: Effect.Effect<A, E, R>,
  schedule: Schedule.Schedule<unknown>,
): Effect.Effect<A, E, R> =>
  Effect.gen(function* retriedAttempt() {
    const attempts = yield* Ref.make(0);
    const started = yield* Clock.currentTimeMillis;
    const logRerun = Effect.fnUntraced(function* logsRerun(failure: E) {
      if (!isRerun(failure)) {
        return;
      }

      const n = yield* Ref.get(attempts);
      const now = yield* Clock.currentTimeMillis;

      yield* Effect.logWarning(
        `${name} attempt ${n} failed with ${failure.kind}, so it runs again`,
      ).pipe(
        Effect.annotateLogs({ attempt: n, elapsedMillis: now - started, errorKind: failure.kind }),
      );
    });
    const counted = Effect.andThen(
      Ref.update(attempts, (n) => n + 1),
      attempt,
    ).pipe(Effect.tapError(logRerun));

    return yield* counted.pipe(
      Effect.retry({ schedule, while: isRerun }),
      Effect.tapError(() =>
        Effect.flatMap(Ref.get(attempts), (n) =>
          Effect.logError(`${name} failed after ${n} attempt${n === 1 ? "" : "s"}`),
        ),
      ),
    );
  });

/**
 * The refusal a `refused` call error names, read from it alone (`refusalOf`): how grizzle decided
 * its laws (`refused.kind`), every law it names with the set of their rules, and grizzle's witness.
 * `every` names the laws grizzle judged broken; `first` the laws of the CHECK PostgreSQL tried
 * first, which the row may not be alone in breaking; `some` the laws one PostgreSQL object
 * discharges, at least one of them broken and nothing deciding which. The import judges no law and
 * reads no row of its own to decide more than grizzle did, so a `some` or `first` refusal stays
 * under every rule its laws carry. The witness is the key of the first stated row that breaks a
 * law, or `unreported` for a foreign key and for a law no stated row breaks as grizzle's host
 * judges it. A law no row of the law table names still prints its text, and carries no rule.
 * Naming the laws reads the committed dictionary alone, which compiles nothing, and that step has a
 * span of its own, which records the laws it named and their rules.
 *
 * @param error - The apply's `refused` call error.
 * @returns Fails with the `ImportRefused` it names.
 */
const nameRefusal = ({
  refused,
  witness,
}: Extract<CallError, { readonly kind: "refused" }>): Effect.Effect<never, ImportRefused> =>
  Effect.sync(() => refusalOf(refused, witness)).pipe(
    Effect.tap((built) =>
      Effect.annotateCurrentSpan({
        lawsNamed: refused.laws.length,
        refusedKind: refused.kind,
        rules: built.rules.join("|"),
      }),
    ),
    Effect.withSpan("import.nameRefusal"),
    Effect.flatMap((refusal) => Effect.fail(refusal)),
  );

/**
 * What an import did, under the package's name: stored a package under a name the database did not
 * hold (`accepted`), or found the database holding it already, the same rows under its name
 * (`unchanged`), which a write whose first commit got no answer and committed finds too.
 */
export interface Imported {
  readonly outcome: "accepted" | "unchanged";
  readonly package: QtiPackage["name"];
}

/**
 * Import a package `readPackage` read under its name, through a `Db`'s workload, `db.workload` of
 * any author login, and the content-addressed store its media files' bytes go to.
 *
 * Builds every row from the package's documents and files, reading nothing of its directory and
 * minting nothing, puts every media file's bytes in the store under the digest its `Media` row
 * states, then applies the rows as one ChangeSet through the workload's `insertWrite`. The name is
 * the one `readPackage` was given: a package under a name no package holds is `accepted`; the same
 * package again under its name is `unchanged`; another package under a stored name is refused on
 * the keys the two share, `ImportRefused` naming them, since a name is one revision for as long as
 * it stands. The apply runs again on a transient refusal and on a commit with no answer, and on
 * nothing else: the write only inserts, so a rerun of a write that committed answers `unchanged`.
 * Its member is grizzle's `MemberHandle` of the program the login serves, so the handle of either
 * author login is one, `AuthorApp`'s over `Qti` and `MediaAuthorApp`'s over `QtiMedia`. The reruns
 * run on {@link RetrySchedule}, and each attempt of the apply through {@link WrapApply}; both are
 * references whose defaults are the live ones, so a caller provides neither.
 *
 * @param workload - The author `Db`'s workload: its `insertWrite` member.
 * @param pkg - The package, as `readPackage` read it under its name.
 * @returns The package's name and what the import did. Fails with `MediaUnstored` when the store
 *   refuses a media file's bytes, before anything is written to the database; with `ImportRefused`
 *   naming the rules the database refused the package under; and with grizzle's own error when the
 *   database failed for a reason that is not a refusal.
 */
export const importPackage = Effect.fn("import.importPackage")(function* importPackage(
  workload: { readonly insertWrite: MemberHandle<typeof insertWrite> },
  pkg: QtiPackage,
): Effect.fn.Return<Imported, ImportRefused | CallError | MediaUnstored, MediaStore> {
  const schedule = yield* RetrySchedule;
  const wrap = yield* WrapApply;
  const store = yield* MediaStore;
  const rows = yield* importRowsOf(pkg);
  const name = rows.package;

  yield* Effect.forEach(rows.media, ({ bytes, digest }) => store.put(digest, bytes), {
    concurrency: "unbounded",
    discard: true,
  });

  const [elapsed, outcome] = yield* retried(
    "insertWrite",
    wrap(workload.insertWrite.once({ facts: { insert: rows.insert }, params: {} })),
    schedule,
  ).pipe(
    Effect.catch((error): Effect.Effect<never, ImportRefused | CallError> =>
      error.kind === "refused" ? nameRefusal(error) : Effect.fail(error),
    ),
    Effect.timed,
  );

  yield* Effect.annotateCurrentSpan({
    applyMillis: Duration.toMillis(elapsed),
    media: rows.media.length,
    outcome: outcome.kind,
    package: name,
  });

  if (outcome.kind === "accepted") {
    yield* Effect.logDebug(
      "import applied",
      Object.fromEntries(outcome.counts.map((c) => [c.relation, `+${c.added}`] as const)),
    );
  }

  return { outcome: outcome.kind, package: name };
});
