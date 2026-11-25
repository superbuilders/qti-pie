/**
 * The installation the result relations' database suite (`src/results.db.test.ts`) runs on: the
 * composition with rubric-score's grader and its one login (`#ledger/test/result-level.ts`),
 * generated from nothing into the package's scratch folder for each run (`pnpm run
 * result:generate`) and installed in a lane's result database (`#ledger/test/result-database.ts`),
 * both by the ledger's global setup, as the migration identity pantry's `QTI_PIE_PG_*` settings
 * name (pantry's `migrationConnectionNow`). It is the suite's alone and never deployed, so nothing
 * commits it.
 */
import { defineConfig } from "@bjornpagen/grizzle";
import { leaseNameBytes, migrationConnectionNow } from "@qti-pie/pantry/db/connection.ts";
import { resultMigrations, resultSuffix } from "#ledger/test/result-database.ts";
import { ResultLevel, ResultSuite } from "#ledger/test/result-level.ts";

export default defineConfig({
  connection: migrationConnectionNow,
  logins: [ResultSuite],
  migrations: resultMigrations,
  /**
   * The longest role prefix an installation of this config runs under: a lane's result database,
   * its lease's name (pantry's `leaseNameBytes`) and the suffix after it.
   */
  rolePrefixBytes: leaseNameBytes + resultSuffix.length,
  schemas: [ResultLevel],
});
