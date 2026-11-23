/**
 * How a command that writes a package to the database settles a stop by `--timeout` that comes
 * once its write has begun: the moment the write begins, marked through the importer's
 * `WrapApply`, and the read-back by the package's name that says what the write left.
 */
import { Duration, Effect } from "effect";
import { withAuthorApp } from "#pantry/cli/engine.ts";
import { onStop, WriteStopped, WriteUnsettled } from "#pantry/cli/timeout.ts";
import type { Settlement, StopError, WriteCommand } from "#pantry/cli/timeout.ts";
import type { WrapApply } from "#pantry/import/package.ts";
import type { QtiPackage } from "#pantry/import/read.ts";

/**
 * Run `write`, which applies a package's rows through the importer (`importPackage` of
 * `#pantry/import/package.ts`), so that a stop by `--timeout` from the moment its database write
 * begins ends the run with `settlement`: each attempt of the apply runs through `wrapApply`, the
 * importer's `WrapApply`, in a wrap that records `settlement` first ({@link onStop}). Until the
 * first attempt starts nothing is written (the package read, its rows built, the pool opened), so
 * a stop stays a plain timeout. A wrap the caller provided already runs inside this one.
 *
 * @param wrapApply - The importer's `WrapApply`, from the engine module the handler loaded.
 * @param settlement - What a stop once the write has begun ends the run with.
 * @param write - The import's write.
 * @returns What `write` returns.
 */
export const settlingWrite = Effect.fnUntraced(function* settlingWrite<A, E, R>(
  wrapApply: typeof WrapApply,
  settlement: Settlement,
  write: Effect.Effect<A, E, R>,
) {
  const outer = yield* wrapApply;

  return yield* write.pipe(
    Effect.provideService(wrapApply, (apply) => Effect.andThen(onStop(settlement), outer(apply))),
  );
});

/**
 * What reading a package back by its name finds (`held` of {@link WriteStopped}).
 */
type Held = WriteStopped["held"];

/**
 * Read back the package `pkg` names, on a pool of its own: its `Package` row by its name
 * (`packageOf`), and where that is there, whether it is this package: the import's write only
 * inserts, so it is run again over the same rows (`importRowsOf` of `#pantry/import/program.ts`),
 * which answers `unchanged` for this package and is refused on the keys the two share for another,
 * and writes nothing in either case. The pool is opened again (`withAuthorApp`) because the
 * stopped handler's closed with it, and grizzle destroys the connection of a flight it interrupts
 * (README, "No server-side timeouts").
 *
 * @param pkg - The package the write wrote.
 * @returns What the database holds under the package's name. Fails with what opening the pool,
 *   building the rows or either call fails with but a refusal.
 */
const readBack = (pkg: QtiPackage) =>
  withAuthorApp(
    () => Promise.all([import("#pantry/db/layer.ts"), import("#pantry/import/program.ts")]),
    ([{ authorDb }, { importRowsOf }]) =>
      Effect.gen(function* readsPackageBack() {
        const db = yield* authorDb;

        if (
          (yield* db.workload.packageOf.once({ facts: {}, params: { package: pkg.name } })).size ===
          0
        ) {
          return "absent" as const satisfies Held;
        }

        const rows = yield* importRowsOf(pkg);

        return yield* db.workload.insertWrite
          .once({ facts: { insert: rows.insert }, params: { package: rows.package } })
          .pipe(
            Effect.as<Held>("this"),
            Effect.catchIf(
              (failure) => failure.kind === "refused",
              () => Effect.succeed<Held>("other"),
            ),
          );
      }),
  );

/**
 * The settlement of a stop that comes once a write of `pkg` has begun ({@link settlingWrite}):
 * read the package back by its name ({@link readBack}), within the run's limit again, and end the
 * run by what it finds. This package stored under the name, the write committed (or the package
 * stood there already, which is the same answer), and `held` of
 * the limit's text ends the run: an import's reports that it stored the package, and a round
 * trip's that its import committed and its export did not finish. Another package or none under
 * the name, the write did not commit: {@link WriteStopped}, which says nothing was written. A
 * read-back that fails, or does not finish within the limit, settles nothing:
 * {@link WriteUnsettled}, which says the package may or may not be stored, never that nothing was
 * written.
 *
 * What the read-back finds is the commit's outcome where grizzle awaited it. Interrupted while it
 * awaits COMMIT's answer, a flight cancels nothing and the interruption takes effect once COMMIT
 * has answered, so the stopped handler ends with the commit decided. Interrupted while its
 * statements run, it sends one CancelRequest and destroys the connection without awaiting the
 * backend (`packages/grizzle/src/adapter/wire/batch.ts`, `runTransaction`'s "Interruption"), so a
 * COMMIT the server reached before the cancellation may still be committing when the read-back
 * takes its snapshot, a new pool's connection later; a package not held there is the database as
 * the read found it.
 *
 * @param command - The command whose write it is.
 * @param pkg - The package the write wrote.
 * @param held - What ends the run where the package is stored, given the limit as the stop's
 *   message gives it.
 * @returns The settlement.
 * @see https://github.com/bjornpagen/grizzle/blob/6eaf80489272cc5aa5e08c24cab8efd3c4b035b0/packages/grizzle/src/adapter/wire/batch.ts#L975-L988
 */
export const readBackSettlement =
  (
    command: WriteCommand,
    pkg: QtiPackage,
    held: (after: string) => Effect.Effect<void, StopError>,
  ): Settlement =>
  (limit) =>
    Effect.gen(function* settleStop() {
      const after = Duration.format(limit);
      const unsettled = (reason: string) =>
        new WriteUnsettled({ after, command, package: pkg.name, reason });

      yield* Effect.logWarning(
        `${command} of ${pkg.name} was stopped after ${after} once its write had begun, so its commit is unknown until the package is read back by its name`,
      );

      const found = yield* readBack(pkg).pipe(
        Effect.tapError((failure) => Effect.logWarning("reading the package back failed", failure)),
        Effect.mapError((failure) => unsettled(failure.message)),
        Effect.timeoutOrElse({
          duration: limit,
          orElse: () => Effect.fail(unsettled(`it did not finish within ${after}`)),
        }),
      );

      yield* Effect.annotateCurrentSpan({ command, held: found, package: pkg.name });

      if (found === "this") {
        yield* Effect.logWarning(
          `${command} of ${pkg.name}: the package read back is the one written, so its write committed`,
        );

        return yield* held(after);
      }

      return yield* new WriteStopped({ after, command, held: found, package: pkg.name });
    }).pipe(Effect.withSpan("cli.settleStop"));
