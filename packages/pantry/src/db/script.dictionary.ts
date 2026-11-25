/**
 * The vocabulary of `script.test.ts`: the settings scripts/db.sh requires, the script's own, never
 * cases a person chose.
 *
 * @module
 */
import { dictionary } from "@bjornpagen/testing/dictionary";

/**
 * The settings scripts/db.sh requires, and a subcommand that requires it: every subcommand the
 * host, the port, the CA, the database, the migration identity and, with no password command, its
 * password file and the logins' password folder, and `create` alone the template.
 */
export const requiredSettings = dictionary<{
  readonly setting: string;
  readonly subcommand: string;
}>([
  { setting: "QTI_PIE_PG_HOST", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_PORT", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_CA", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_DATABASE", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_MIGRATION_ROLE", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_MIGRATION_PASSWORD_FILE", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_SECRETS", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_TEMPLATE", subcommand: "create" },
]);
