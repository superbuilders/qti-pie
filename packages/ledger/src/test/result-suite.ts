/**
 * The services the database suites over the result composition (`#ledger/test/result-level.ts`) run
 * on: the lane's lease, where one is named, and the one login `grizzle generate` compiled into the
 * run's migrations folder (`#ledger/test/result-database.ts`), with a database layer of one session
 * on a copy of the lease's result database of the file's own, where the ledger's global setup
 * installs the composition (`#ledger/test/result-install.ts`). A suite over it runs wherever a lane
 * names its lease and is skipped elsewhere, as every database suite is.
 *
 * Vitest runs a package's database files side by side, and the result runner's writes are
 * serializable with nothing run again, so two files on one database refuse each other's
 * transactions as a finding of neither: each file takes a copy of the result database of its own
 * (pantry's `fileConnections`, `#pantry/test/file-database.ts`, the one implementation of a test
 * file's database), named by its {@link ResultFile}, and the copy is dropped when its layer is
 * released.
 *
 * @module
 */
import { DbLayer, LiveSource, served } from "@bjornpagen/grizzle/runtime";
import type { DbConnection } from "@bjornpagen/grizzle/runtime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { clusterDatabase } from "@qti-pie/pantry/db/connection.ts";
import { fileConnections } from "@qti-pie/pantry/test/file-database.ts";
import { Config, ConfigProvider, Context, Effect, FileSystem, Layer, Option, Schema } from "effect";
import { resultMigrations, resultSettingsOf } from "#ledger/test/result-database.ts";
import type { ResultSuite } from "#ledger/test/result-level.ts";

/**
 * The lane's lease, where one is named: a suite runs on a copy of its result database.
 */
export const lease = Effect.runSync(Config.option(clusterDatabase));

/**
 * The ledger's database test files over the result composition, each by the suffix of its copy of
 * the result database: a closed union of at most 18 bytes each, so a copy's name, the result
 * database's, `_` and the suffix, stays within PostgreSQL's 63.
 */
export type ResultFile =
  | "results"
  | "placement"
  | "typed"
  | "module_held"
  | "member_reads"
  | "app_operands"
  | "media_served";

/**
 * The suite's login as `grizzle generate` compiled it, and the file's connection as that login,
 * which its file compiled for a moved clock connects with too (`#ledger/test/result-clock.ts`).
 */
type Logins = Readonly<{
  connection: DbConnection;
  suite: ReturnType<typeof served<typeof ResultSuite>>;
}>;

/**
 * The suite's login, which every case opens its role from.
 */
export class SuiteLogin extends Context.Service<SuiteLogin, Logins>()(
  "@qti-pie/ledger/test/result-suite/SuiteLogin",
) {}

/**
 * One session: the suite's calls run one after another.
 */
export const onePool = { max: 1 } as const;

/**
 * A file's services: its served login, its database layer on its own copy of the lease's result
 * database, and Node's platform. The settings name the result database in place of the lease, so
 * the copy is taken of it and its connections keep its role prefix.
 *
 * @param file - The file, which names its copy.
 * @returns The layer, which drops the copy when it is released.
 */
export const suiteLayerOf = (file: ResultFile) =>
  Layer.unwrap(
    Effect.gen(function* suiteLayer() {
      const fs = yield* FileSystem.FileSystem;
      const text = yield* fs.readFileString(`${resultMigrations}/qti/served/result_suite.json`);
      const document = yield* Schema.decodeEffect(Schema.fromJsonString(Schema.Unknown))(text);
      const suite = served<typeof ResultSuite>(document, "result_suite");
      const { loginConnectionOf } = yield* fileConnections(file).pipe(
        Effect.provide(
          ConfigProvider.layer(
            ConfigProvider.fromUnknown(resultSettingsOf(process.env, Option.getOrThrow(lease))),
          ),
        ),
      );
      const connection = loginConnectionOf(suite);

      return Layer.mergeAll(
        Layer.succeed(SuiteLogin, { connection, suite }),
        DbLayer.make({ ...connection, login: suite, pool: onePool }).pipe(
          Layer.provide(LiveSource.layer({ ...connection, login: suite })),
        ),
      );
    }),
  ).pipe(Layer.provideMerge(NodeServices.layer));
