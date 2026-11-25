/**
 * A composition's scratch installation: a fresh database on the test's cluster, owned by a role of
 * its own, its committed migrations applied by `grizzle migrate` as that owner, and every login
 * given the owner's password, which the measured sessions sign in with. Each login role plans
 * generically (`plan_cache_mode = force_generic_plan`), which grizzle's migration stores as its
 * role default, so every measured session plans as grizzle's do.
 *
 * The cluster is the caller's, reached over its socket as a superuser for the installation's own
 * setup, and over verify-full TLS on localhost for the migration, as grizzle connects. It must be a
 * cluster of the test's own, never a live, staging or production database. It must preload
 * pg_stat_statements, whose view the second check reads every action's pages from: the installation
 * creates the extension in the cluster's `postgres` database, where the view is read, and asks the
 * extension's own state before it drops anything, so a cluster that does not preload it is refused
 * with the extension's error, which names `shared_preload_libraries`, and keeps no extension, the
 * two statements sharing one implicit transaction.
 *
 * @module
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Effect, Schema } from "effect";
import { Client } from "pg";

/**
 * A step of the installation failed: a statement of the superuser's, or the migration.
 */
export class InstallFailed extends Schema.TaggedError<InstallFailed>()("InstallFailed", {
  cause: Schema.Unknown,
  step: Schema.String,
}) {
  /**
   * The step and its cause.
   */
  override get message(): string {
    return `Installing the scratch database failed at ${this.step}: ${String(this.cause)}`;
  }
}

/**
 * Where and what to install.
 */
export interface Installation {
  /**
   * The database, which is also its installation's role prefix.
   */
  readonly database: string;
  /**
   * The cluster's socket folder and port, and its CA for verify-full TLS on localhost.
   */
  readonly socket: string;
  readonly port: number;
  readonly ca: string;
  /**
   * The superuser the setup runs as.
   */
  readonly superuser: string;
  /**
   * The package folder `grizzle migrate` runs in, its grizzle CLI, and the config it migrates.
   */
  readonly packageDir: string;
  readonly grizzle: string;
  readonly config: string;
  /**
   * Settings the config reads besides the installation's own (`QTI_PIE_RESULT_MIGRATIONS`, …).
   */
  readonly env: Readonly<Record<string, string>>;
  /**
   * The folder the owner's and logins' passwords are written to, mode 700.
   */
  readonly secrets: string;
  /**
   * Extensions the composition's migrations type columns by and its owner may not create itself,
   * an untrusted one (metis's lesson embeddings take pgvector in `vector_ext`, which its test
   * cluster's template carries): each made by the superuser in its schema, usable by every role,
   * before the migration. None for most compositions.
   */
  readonly extensions: readonly { readonly name: string; readonly schema: string }[];
}

/**
 * One statement as the superuser.
 *
 * @param install - The installation.
 * @param database - The database it runs in.
 * @param step - What it is, for a failure.
 * @param sql - The statement.
 * @returns Its rows.
 */
const asSuperuser = (install: Installation, database: string, step: string, sql: string) =>
  Effect.acquireUseRelease(
    Effect.tryPromise({
      catch: (cause) => new InstallFailed({ cause, step: `${step}: connect` }),
      try: async () => {
        const client = new Client({
          database,
          host: install.socket,
          port: install.port,
          user: install.superuser,
        });

        await client.connect();

        return client;
      },
    }),
    (client) =>
      Effect.tryPromise({
        catch: (cause) => new InstallFailed({ cause, step }),
        try: async () => {
          const answered = await client.query<{ readonly name: string }>(sql);

          return answered.rows;
        },
      }),
    (client) => Effect.promise(() => client.end()),
  );

/**
 * A quoted identifier.
 *
 * @param name - The name.
 * @returns Its quoted spelling.
 */
const quoted = (name: string): string => `"${name.replaceAll('"', '""')}"`;

/**
 * The installation, made fresh: any database and roles of its prefix a run before left are dropped
 * first.
 *
 * @param install - The installation.
 * @returns Completes once every login can sign in.
 */
export const installFresh = (install: Installation) =>
  Effect.gen(function* installFreshOf() {
    const owner = `${install.database}_owner`;
    const password = randomBytes(24).toString("hex");

    mkdirSync(install.secrets, { mode: 0o700, recursive: true });
    yield* asSuperuser(
      install,
      "postgres",
      "pg_stat_statements",
      "CREATE EXTENSION IF NOT EXISTS pg_stat_statements; SELECT pg_stat_statements_info()",
    );
    yield* asSuperuser(
      install,
      "postgres",
      "drop database",
      `DROP DATABASE IF EXISTS ${quoted(install.database)} WITH (FORCE)`,
    );

    const left = yield* asSuperuser(
      install,
      "postgres",
      "roles left",
      `SELECT rolname AS name FROM pg_roles WHERE starts_with(rolname, '${install.database}_') ORDER BY rolname = '${owner}', rolname`,
    );

    yield* Effect.forEach(
      left,
      ({ name }) =>
        asSuperuser(install, "postgres", "drop role", `DROP ROLE IF EXISTS ${quoted(name)}`),
      {
        discard: true,
      },
    );
    yield* asSuperuser(
      install,
      "postgres",
      "owner",
      `CREATE ROLE ${quoted(owner)} LOGIN CREATEROLE REPLICATION PASSWORD '${password}'`,
    );
    yield* asSuperuser(
      install,
      "postgres",
      "database",
      `CREATE DATABASE ${quoted(install.database)} OWNER ${quoted(owner)} TEMPLATE template0 ENCODING 'UTF8' LOCALE_PROVIDER builtin BUILTIN_LOCALE 'C.UTF-8'`,
    );
    writeFileSync(path.join(install.secrets, "owner.password"), password, { mode: 0o600 });
    yield* Effect.forEach(
      install.extensions,
      ({ name, schema }) =>
        asSuperuser(
          install,
          install.database,
          `extension ${name}`,
          `CREATE SCHEMA IF NOT EXISTS ${quoted(schema)}; CREATE EXTENSION IF NOT EXISTS ${quoted(name)} SCHEMA ${quoted(schema)}; GRANT USAGE ON SCHEMA ${quoted(schema)} TO PUBLIC`,
        ),
      { discard: true },
    );
    yield* Effect.try({
      catch: (cause) => new InstallFailed({ cause, step: "grizzle migrate" }),
      try: () =>
        execFileSync(
          process.execPath,
          [
            "--disable-proto=delete",
            "--disable-sigusr1",
            install.grizzle,
            "migrate",
            install.config,
          ],
          {
            cwd: install.packageDir,
            env: {
              ...process.env,
              ...install.env,
              PLAN_BUDGET_CA: install.ca,
              PLAN_BUDGET_DATABASE: install.database,
              PLAN_BUDGET_OWNER: owner,
              PLAN_BUDGET_PASSWORD: password,
              PLAN_BUDGET_PORT: String(install.port),
              QTI_PIE_PG_CA: install.ca,
              QTI_PIE_PG_DATABASE: install.database,
              QTI_PIE_PG_HOST: "localhost",
              QTI_PIE_PG_MIGRATION_PASSWORD: password,
              QTI_PIE_PG_MIGRATION_ROLE: owner,
              QTI_PIE_PG_PORT: String(install.port),
              QTI_PIE_PG_SECRETS: install.secrets,
            },
            stdio: "inherit",
          },
        ),
    });

    const logins = yield* asSuperuser(
      install,
      "postgres",
      "logins",
      `SELECT rolname AS name FROM pg_roles WHERE rolcanlogin AND starts_with(rolname, '${install.database}__')`,
    );

    yield* Effect.forEach(
      logins,
      ({ name }) =>
        Effect.gen(function* loginOf() {
          yield* asSuperuser(
            install,
            "postgres",
            "login password",
            `ALTER ROLE ${quoted(name)} PASSWORD '${password}'`,
          );
          writeFileSync(path.join(install.secrets, `${name}.password`), password, { mode: 0o600 });
        }),
      { discard: true },
    );
  });
