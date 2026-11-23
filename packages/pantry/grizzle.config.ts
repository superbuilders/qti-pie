import { defineConfig } from "@bjornpagen/grizzle";
import { migrationConnectionNow } from "#pantry/db/connection.ts";
import { AuthorApp } from "#pantry/qti/logins.ts";
import { Qti } from "#pantry/qti/schema.ts";

/**
 * The grizzle configuration every `grizzle` command of this package names: `Qti` alone, with no
 * package-media level, since an application's migrations are its own config's to generate; its one
 * login; the committed migrations; and the migration identity's connection to the server its
 * `QTI_PIE_PG_*` settings name, built each time grizzle asks for it (`migrationConnectionNow`).
 */
export default defineConfig({
  connection: migrationConnectionNow,
  logins: [AuthorApp],
  migrations: "migrations",
  /**
   * The longest role prefix an installation of this config runs under: a test lane's database name,
   * pantry's rule (src/db/connection.ts), the longest in use edullm_keydigest_pantry. grizzle
   * refuses a longer one at connect.
   */
  rolePrefixBytes: 23,
  schemas: [Qti],
});
