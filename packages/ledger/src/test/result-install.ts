/**
 * The ledger's database setup for vitest: where a lane names its lease (pantry's
 * `QTI_PIE_PG_DATABASE`), the result composition is generated from nothing (`result:generate`) and
 * installed afresh in the lease's result database before any file runs, through pantry's
 * `scripts/db.sh reset` over `grizzle.result.config.ts`, with the lane's own owner and server and
 * the result database's own password folder (`resultSettingsOf`); so the result suite runs wherever
 * the other database suites do. Where no lease is named, nothing: every database suite skips alike.
 *
 * Before the reset, the setup drops every copy of the result database in its namespace
 * ({@link copiesDropped}): the lease is the run's own, so a copy there is a killed run's.
 *
 * @module
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { clusterDatabase } from "@qti-pie/pantry/db/connection.ts";
import { migrationClientOf } from "@qti-pie/pantry/test/file-database.ts";
import { Config, ConfigProvider, Effect, Option } from "effect";
import { resultSettingsOf } from "#ledger/test/result-database.ts";

/**
 * The ledger package's folder.
 */
const ledger = path.join(import.meta.dirname, "..", "..");

/**
 * PostgreSQL's maintenance database, which initdb makes on every server: where a database is
 * dropped, since no session may hold the database a drop names.
 */
const maintenanceDatabase = "postgres";

/**
 * Drops every database in the namespace of the configured database's copies, `QTI_PIE_PG_DATABASE`
 * and `_` (pantry's `fileDatabase` names a test file's copy `<database>_<file>`), each `WITH
 * (FORCE)`, so a session a killed run left in one ends with it. Under the result settings
 * (`resultSettingsOf`) that is `<lease>_r_`, the result database's copies, which the run's lease
 * makes its own: every database there when a run's setup begins is one a killed run left. A copy
 * holds the grants of the installation's roles, and PostgreSQL refuses to drop a role another
 * database's objects depend on (2BP01), so a copy left behind failed the next run's reset at its
 * uninstall; with the namespace cleared first, a reset never meets one.
 *
 * @returns Completes once no database is left in the namespace; a refused statement is a defect.
 */
export const copiesDropped = Effect.acquireUseRelease(
  migrationClientOf(maintenanceDatabase).pipe(
    Effect.tap((client) => Effect.promise(() => client.connect())),
  ),
  (client) =>
    Effect.gen(function* dropCopies() {
      const database = yield* clusterDatabase;
      const { rows } = yield* Effect.promise(() =>
        client.query<{ datname: string }>(
          "SELECT datname FROM pg_database WHERE starts_with(datname, $1) ORDER BY datname",
          [`${database}_`],
        ),
      );

      yield* Effect.forEach(
        rows,
        ({ datname }) =>
          Effect.promise(() =>
            client.query(`DROP DATABASE ${client.escapeIdentifier(datname)} WITH (FORCE)`),
          ),
        { discard: true },
      );
    }),
  (client) => Effect.promise(() => client.end()),
);

/**
 * Installs the result composition in the lease's result database, where a lease is named.
 */
const setup = async (): Promise<void> => {
  const lease = Effect.runSync(Config.option(clusterDatabase));

  if (Option.isNone(lease)) {
    return;
  }

  const settings = resultSettingsOf(process.env, lease.value);

  await Effect.runPromise(
    copiesDropped.pipe(
      Effect.provide(ConfigProvider.layer(ConfigProvider.fromUnknown(settings))),
      Effect.provide(NodeServices.layer),
    ),
  );
  execFileSync("pnpm", ["-s", "run", "result:generate"], { cwd: ledger, stdio: "inherit" });
  execFileSync("bash", [path.join(ledger, "..", "pantry", "scripts", "db.sh"), "reset"], {
    env: { ...settings, QTI_PIE_GRIZZLE_CONFIG: path.join(ledger, "grizzle.result.config.ts") },
    stdio: "inherit",
  });
};

export default setup;
