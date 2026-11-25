/**
 * The ledger's database setup for vitest: where a lane names its lease (pantry's
 * `QTI_PIE_PG_DATABASE`), the result composition is generated from nothing (`result:generate`) and
 * installed afresh in the lease's result database before any file runs, through pantry's
 * `scripts/db.sh reset` over `grizzle.result.config.ts`, with the lane's own owner and server and
 * the result database's own password folder (`resultSettingsOf`); so the result suite runs wherever
 * the other database suites do. Where no lease is named, nothing: every database suite skips alike.
 *
 * @module
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { clusterDatabase } from "@qti-pie/pantry/db/connection.ts";
import { Config, Effect, Option } from "effect";
import { resultSettingsOf } from "#ledger/test/result-database.ts";

/**
 * The ledger package's folder.
 */
const ledger = path.join(import.meta.dirname, "..", "..");

/**
 * Installs the result composition in the lease's result database, where a lease is named.
 */
const setup = (): void => {
  const lease = Effect.runSync(Config.option(clusterDatabase));

  if (Option.isNone(lease)) {
    return;
  }

  execFileSync("pnpm", ["-s", "run", "result:generate"], { cwd: ledger, stdio: "inherit" });
  execFileSync("bash", [path.join(ledger, "..", "pantry", "scripts", "db.sh"), "reset"], {
    env: {
      ...resultSettingsOf(process.env, lease.value),
      QTI_PIE_GRIZZLE_CONFIG: path.join(ledger, "grizzle.result.config.ts"),
    },
    stdio: "inherit",
  });
};

export default setup;
