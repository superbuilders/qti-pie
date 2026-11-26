/**
 * The suite's login compiled for a moved clock, for the families of `#ledger/results.db.test.ts`
 * whose verdict turns on time: a deadline, the in-flight grace, the presence grace. grizzle's
 * `compileServedMoved` compiles the login's programs so that every clocked parameter and every
 * instant an insert stamps reads the instant the call states, and `Db.openMoved` states it at each
 * call (grizzle's README, "The database's clock": "A test states the clock; it never sleeps"). So a
 * case states every instant of its sitting, and no real time between its statements, however
 * loaded the machine, moves its verdict.
 *
 * What is compiled is the login with its clocked workload alone, the programs those families call
 * (`ClockedSuite`), from the snapshot the run's `grizzle generate` wrote beside the suite's served
 * file, once for the test file, when the first of those families runs, and served over the test
 * file's own copy of the result database with the suite's connection. Its layer is provided around
 * a family's search alone, where it stands in for the generated file's under the login's one key.
 * It never stands in for what production runs: every family that holds no time serves the file
 * `grizzle generate` compiled (`SuiteLogin`), the statements an application runs.
 *
 * @module
 */
import { compileServedMoved } from "@bjornpagen/grizzle/compile";
import { DbLayer, LiveSource, served } from "@bjornpagen/grizzle/runtime";
import type { DbConnection } from "@bjornpagen/grizzle/runtime";
import { Context, Effect, FileSystem, Layer, Schema } from "effect";
import { resultMigrations } from "#ledger/test/result-database.ts";
import { clockedWorkload, presenceWorkload, ResultSuite } from "#ledger/test/result-level.ts";
import type { ClockedSuite } from "#ledger/test/result-level.ts";
import { onePool, SuiteLogin } from "#ledger/test/result-suite.ts";

/**
 * The clocked login served from its file compiled for a moved clock.
 */
type MovedLogin = ReturnType<typeof served<ClockedSuite>>;

/**
 * The database layer of the moved login over the file's copy, one session, as the suite's own.
 *
 * @param suite - The moved login.
 * @param connection - The file's connection as the suite's login.
 */
const movedLayerOf = (suite: MovedLogin, connection: DbConnection) =>
  DbLayer.make({ ...connection, login: suite, pool: onePool }).pipe(
    Layer.provide(LiveSource.layer({ ...connection, login: suite })),
  );

/**
 * The clocked login compiled for a moved clock from the run's snapshot, and its database layer
 * over the file's connection.
 *
 * @param connection - The file's connection as the suite's login.
 * @param fs - The file system the snapshot is read from.
 */
const movedOf = (connection: DbConnection, fs: FileSystem.FileSystem) =>
  Effect.gen(function* compileMoved() {
    const snapshot = yield* Schema.decodeEffect(Schema.fromJsonString(Schema.Unknown))(
      yield* fs.readFileString(`${resultMigrations}/qti/snapshot.json`),
    );
    const file = yield* compileServedMoved(ResultSuite, snapshot, [
      clockedWorkload,
      presenceWorkload,
    ]);
    const suite = served<ClockedSuite>(file, "result_suite");

    return { layer: movedLayerOf(suite, connection), suite } as const;
  });

/**
 * The moved login, whose roles a case opens with `Db.openMoved`, and its database layer, which
 * {@link onMovedClock} provides: compiled at its first read and kept for the file.
 */
export class MovedSuite extends Context.Service<
  MovedSuite,
  Readonly<{ moved: ReturnType<typeof movedOf> }>
>()("@qti-pie/ledger/test/result-clock/MovedSuite") {}

/**
 * The moved login of the test file, over its connection; building the layer compiles nothing.
 */
export const movedSuiteLayer = Layer.effect(
  MovedSuite,
  Effect.gen(function* movedSuite() {
    const { connection } = yield* SuiteLogin;
    const fs = yield* FileSystem.FileSystem;

    return { moved: yield* Effect.cached(movedOf(connection, fs)) };
  }),
);

/**
 * `effect` over the moved clock: the moved login's database layer provided around it, in place of
 * the generated file's.
 *
 * @param effect - A family's search, each of whose cases opens the moved login's role.
 */
export const onMovedClock = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.gen(function* moved() {
    const { layer } = yield* (yield* MovedSuite).moved;

    return yield* Effect.provide(effect, layer);
  });
