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

/**
 * The lane's settings pointed at its lease's result database: pantry's `QTI_PIE_PG_DATABASE`, the
 * {@link resultDatabaseOf}, and its `QTI_PIE_PG_SECRETS`, the folder of its logins' password
 * files, the lease's folder with {@link resultSuffix} after its name, as the database's name
 * follows the lease's. Each database's logins keep their passwords in a folder of their own, so
 * `scripts/db.sh drop` of either, which removes its `QTI_PIE_PG_SECRETS`, reaches no file of the
 * other's: the lease's owner password, its logins' passwords and its media store stay. Where a
 * password command gives every password, no folder is named, for the result database either.
 *
 * @param environment - The lane's settings, `process.env`.
 * @param lease - The lease, pantry's `QTI_PIE_PG_DATABASE`.
 * @returns The lane's settings, the result database's in place of the lease's.
 */
export const resultSettingsOf = (
  environment: NodeJS.ProcessEnv,
  lease: string,
): NodeJS.ProcessEnv => {
  const secrets = environment["QTI_PIE_PG_SECRETS"];
  const database = { ...environment, QTI_PIE_PG_DATABASE: resultDatabaseOf(lease) };

  return secrets === undefined
    ? database
    : {
        ...database,
        QTI_PIE_PG_SECRETS: path.join(
          path.dirname(secrets),
          `${path.basename(secrets)}${resultSuffix}`,
        ),
      };
};
