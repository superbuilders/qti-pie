/**
 * The result setup's clear of what a killed run left (`#ledger/test/result-install.ts`
 * `copiesDropped`), on the lane's server: every database in the configured database's namespace of
 * copies, `<database>_`, is dropped, a session still open in one among them, and the database
 * itself, outside that namespace, is kept. The configured database is the probe's own,
 * `<lease>_r_cleared`, inside the result database's namespace of copies, so a run of this file that
 * is killed leaves nothing the next setup does not clear.
 *
 * It runs only where a lane names its lease, as every database suite does, and is skipped
 * elsewhere.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import { clusterDatabase } from "@qti-pie/pantry/db/connection.ts";
import { migrationClientOf } from "@qti-pie/pantry/test/file-database.ts";
import { Config, ConfigProvider, Deferred, Effect, Option } from "effect";
import type { Client } from "pg";
import { resultDatabaseOf, resultSettingsOf } from "#ledger/test/result-database.ts";
import { copiesDropped } from "#ledger/test/result-install.ts";

/**
 * The lane's lease, where one is named.
 */
const lease = Effect.runSync(Config.option(clusterDatabase));

/**
 * The probe's own database, inside the result database's namespace of copies; its copies' namespace
 * is its name and `_`.
 *
 * @param lane - The lane's lease.
 * @returns The probe's name.
 */
const probeOf = (lane: string): string => `${resultDatabaseOf(lane)}_cleared`;

/**
 * PostgreSQL's code for a session ended by an administrator's command, as `DROP DATABASE … WITH
 * (FORCE)` ends one.
 */
const adminShutdown = "57P01";

/**
 * A connected client of `database` as the lane's migration identity, ended when the scope closes.
 *
 * @param database - The database it connects to.
 * @returns The client.
 */
const clientOf = (database: string) =>
  Effect.acquireRelease(
    migrationClientOf(database).pipe(
      Effect.tap((client) => Effect.promise(() => client.connect())),
    ),
    (client) => Effect.promise(() => client.end()),
  );

/**
 * The names of the databases that start with `prefix`, in their order.
 *
 * @param client - A client of the maintenance database.
 * @param prefix - The prefix.
 * @returns The names.
 */
const databasesFrom = (client: Client, prefix: string) =>
  Effect.map(
    Effect.promise(() =>
      client.query<{ datname: string }>(
        "SELECT datname FROM pg_database WHERE starts_with(datname, $1) ORDER BY datname",
        [prefix],
      ),
    ),
    ({ rows }) => rows.map(({ datname }) => datname),
  );

describe.skipIf(Option.isNone(lease))("the result setup's clear of a killed run's copies", () => {
  it.effect(
    "drops every database of the namespace, a session held in one ended, and keeps the database itself",
    () =>
      Effect.scoped(
        Effect.gen(function* clears() {
          const probe = probeOf(Option.getOrThrow(lease));
          const left = [`${probe}_held`, `${probe}_left`] as const;
          const maintenance = yield* clientOf("postgres");

          yield* Effect.forEach(
            [probe, ...left],
            (database) =>
              Effect.promise(() =>
                maintenance.query(
                  `CREATE DATABASE ${maintenance.escapeIdentifier(database)} TEMPLATE template0`,
                ),
              ),
            { discard: true },
          );

          /**
           * A killed run's session, still open in a copy: the clear must end it to drop the copy.
           */
          const held = yield* clientOf(left[0]);
          const ended = yield* Deferred.make<string>();
          held.on("error", (error) => {
            Deferred.doneUnsafe(
              ended,
              Effect.succeed("code" in error ? String(error.code) : error.message),
            );
          });

          yield* copiesDropped;

          assert.deepStrictEqual(yield* databasesFrom(maintenance, probe), [probe]);
          assert.strictEqual(yield* Deferred.await(ended), adminShutdown);

          yield* Effect.promise(() =>
            maintenance.query(`DROP DATABASE ${maintenance.escapeIdentifier(probe)}`),
          );
        }).pipe(
          Effect.provide(
            ConfigProvider.layer(
              ConfigProvider.fromUnknown({
                ...resultSettingsOf(process.env, Option.getOrThrow(lease)),
                QTI_PIE_PG_DATABASE: probeOf(Option.getOrThrow(lease)),
              }),
            ),
          ),
        ),
      ).pipe(Effect.provide(NodeServices.layer)),
  );
});
