/**
 * The installation the result relations' database suite (`src/results.db.test.ts`) runs on: the
 * composition with rubric-score's grader and its one login (`#ledger/test/result-level.ts`),
 * generated from nothing into the run's own folder, `QTI_PIE_RESULT_MIGRATIONS`, and migrated into
 * the run's own database on the shared server, which pantry's `QTI_PIE_PG_*` settings name, as
 * the migration identity they name (pantry's `migrationConnectionNow`). No other installation holds
 * it.
 */
import { defineConfig } from "@bjornpagen/grizzle";
import { migrationConnectionNow } from "@qti-pie/pantry/db/connection.ts";
import { Config, Effect } from "effect";
import { ResultLevel, ResultSuite } from "#ledger/test/result-level.ts";

export default defineConfig({
  connection: migrationConnectionNow,
  logins: [ResultSuite],
  migrations: Effect.runSync(Config.String("QTI_PIE_RESULT_MIGRATIONS")),
  schemas: [ResultLevel],
});
