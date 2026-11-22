/**
 * The installation the result relations' database suite (`src/results.db.test.ts`) runs on: the
 * composition with rubric-score's grader and its one login (`#ledger/test/result-level.ts`),
 * generated from nothing into the run's own folder, `QTI_PIE_RESULT_MIGRATIONS`, and migrated into
 * the run's own database on the shared test cluster, which pantry's `QTI_PIE_PG_*` settings name,
 * as the migration identity they name. No other installation holds it.
 */
import { readFileSync } from "node:fs";
import { defineConfig } from "@bjornpagen/grizzle";
import type { MigrationConnectionConfig } from "@bjornpagen/grizzle";
import { migrationConnection } from "@qti-pie/pantry/db/connection.ts";
import { Config, Effect, FileSystem, PlatformError } from "effect";
import { ResultLevel, ResultSuite } from "#ledger/test/result-level.ts";

/**
 * The file system the migration identity's connection reads the cluster's CA through,
 * synchronously, since grizzle calls `connection` synchronously and Node's reads a file only
 * asynchronously (pantry's grizzle.config.ts, whose reason this is); every other operation fails.
 */
const synchronousFiles = FileSystem.layerNoop({
  readFileString: (path) =>
    Effect.try({
      catch: (cause) =>
        PlatformError.systemError({
          _tag: "Unknown",
          cause,
          method: "readFileString",
          module: "FileSystem",
          pathOrDescriptor: path,
        }),
      try: () => readFileSync(path, "utf-8"),
    }),
});

/**
 * The migration identity's connection, built each time grizzle asks for it: only the commands that
 * reach the database ask, so `generate` reads no setting of the cluster's.
 *
 * @returns The connection. Throws where a setting is missing or malformed.
 */
const connection = (): MigrationConnectionConfig =>
  Effect.runSync(migrationConnection.pipe(Effect.provide(synchronousFiles)));

export default defineConfig({
  connection,
  logins: [ResultSuite],
  migrations: Effect.runSync(Config.String("QTI_PIE_RESULT_MIGRATIONS")),
  schemas: [ResultLevel],
});
