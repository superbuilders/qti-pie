/**
 * The result suite's installation (`grizzle.result.config.ts`): its migrations, generated from
 * nothing into the package's scratch folder for each run, since the composition is the suite's
 * alone and never deployed, and the database a lane installs them in, its lease's name with
 * {@link resultSuffix} after it, so each lane's result installation is its own and its name is
 * derived from the lease, never chosen.
 *
 * @module
 */
import path from "node:path";

/**
 * The result composition's migrations, one `_init` generated from nothing into the package's
 * git-ignored `work/` (`pnpm run result:generate`, which the ledger's global setup runs).
 */
export const resultMigrations = path.join(
  import.meta.dirname,
  "..",
  "..",
  "work",
  "result-migrations",
);

/**
 * What follows a lease's name in its result database's name.
 */
export const resultSuffix = "_r";

/**
 * The result database of a lane's lease: the lease's name, then {@link resultSuffix}.
 *
 * @param lease - The lease, pantry's `QTI_PIE_PG_DATABASE`.
 * @returns The result database's name, which is also its installation's role prefix.
 */
export const resultDatabaseOf = (lease: string): string => `${lease}${resultSuffix}`;
