/**
 * Where this package connects: the PostgreSQL 19 server its `QTI_PIE_PG_*` settings name, each one
 * required and read once, as scripts/db.sh reads them, by the migration identity (`grizzle
 * migrate`, through grizzle.config.ts) and by a login (its `DbLayer`, src/db/layer.ts). Pantry runs
 * no server of its own: a lane takes a database, and an owner role of its own, on the machine's
 * shared server (README, "The database").
 */
import { regex } from "arkregex";
import { readFileSync } from "node:fs";
import net from "node:net";
import type { AnyLogin, MigrationConnectionConfig } from "@bjornpagen/grizzle";
import { CredentialError, roleNameOf } from "@bjornpagen/grizzle/runtime";
import type {
  DbConnection,
  DecoderLogin,
  ServedLogin,
  Transport,
} from "@bjornpagen/grizzle/runtime";
import * as NodeChildProcessSpawner from "@effect/platform-node/NodeChildProcessSpawner";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import {
  Config,
  Context,
  Duration,
  Effect,
  FileSystem,
  Layer,
  Option,
  PlatformError,
  Redacted,
  Ref,
  Schema,
  Stream,
} from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/process";
import pg from "pg";

/**
 * The longest delay Node's timers keep: a password command's bound is one timer, so it stays
 * within it.
 *
 * @limitKind published
 * @owner Node v26.13.1's timers (lib/internal/timers.js)
 * @unit milliseconds
 * @scope one timer's delay; a longer one is set to 1
 * @constraint hard quota
 * @source https://github.com/nodejs/node/blob/v26.13.1/lib/internal/timers.js#L173
 * @quote const TIMEOUT_MAX = 2 ** 31 - 1;
 * @verified 2026-11-16
 */
const timerMaxMs = 2 ** 31 - 1;

/**
 * The bound of one run of the password command, `QTI_PIE_PG_PASSWORD_COMMAND`, where its operator
 * sets no `QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT`: long enough for a sign-in the command runs to
 * prompt and be answered by hand.
 *
 * @limitKind provisional
 * @owner pantry's cluster connection (src/db/connection.ts, passwordCommandSetting's default)
 * @unit seconds
 * @scope each run of the password command for one role, where its operator sets no bound
 * @guards a password command that hangs (a sign-in nobody answers) holds every connection attempt that waits for it,
 *   with no failure
 * @measure time the password commands operators set (a cloud CLI's sign-in by hand and with a cached session), and
 *   keep a bound above the slowest sign-in answered by hand
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const passwordCommandTimeoutSeconds = 60;

/**
 * How long a password command that is being stopped has to exit after SIGTERM before its process
 * group is sent SIGKILL. Effect's child process sends no SIGKILL unless told, and waits for the
 * exit with no limit.
 *
 * @limitKind provisional
 * @owner pantry's cluster connection (src/db/connection.ts, runPasswordCommand)
 * @unit seconds
 * @scope each stop of one run of the password command, between its SIGTERM and its SIGKILL
 * @guards a password command that ignores SIGTERM holds its run open past its bound for as long as it runs, since the
 *   stop waits for its exit
 * @measure time how long the password commands operators set take to exit on SIGTERM, and keep a grace above the
 *   slowest
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const passwordCommandKillGraceSeconds = 1;

/**
 * The server's CA certificate could not be read: the file `QTI_PIE_PG_CA` names.
 */
export class ClusterConfigError extends Schema.TaggedError<ClusterConfigError>()(
  "ClusterConfigError",
  { path: Schema.String },
) {
  /**
   * The unreadable file and how to supply it.
   */
  override get message(): string {
    return `Cannot read the database's CA certificate at ${this.path}, the file QTI_PIE_PG_CA names. Set QTI_PIE_PG_CA to a readable PEM file: the shared server's CA, or the certificate bundle of the server's RDS region.`;
  }
}

/**
 * The password command `QTI_PIE_PG_PASSWORD_COMMAND` names exited with a code other than 0 for a
 * role, so it gave no password, whatever it printed: the failure of building the runtime's login
 * connection, which runs it before any attempt (`primedLoginConnection`), and the cause of a
 * connection attempt's `CredentialError`.
 *
 * Its message names the command, the role and the exit code, and says how to see why, as
 * {@link ClusterConfigError}'s names its remedy: the command line prints a failure's message.
 */
export class PasswordCommandFailed extends Schema.TaggedError<PasswordCommandFailed>()(
  "PasswordCommandFailed",
  { command: Schema.String, exitCode: Schema.Number, role: Schema.String },
) {
  /**
   * The command, the role it was run for, its exit code, and how to see why it failed.
   */
  override get message(): string {
    return `The password command ${this.command} exited with code ${String(this.exitCode)} for the role ${this.role}, so the connection has no password. Run it by hand with ${this.role} as its one argument to see why it fails, and sign in if it asks you to; or unset QTI_PIE_PG_PASSWORD_COMMAND to read each role's password file instead.`;
  }
}

/**
 * The password command `QTI_PIE_PG_PASSWORD_COMMAND` names exited with 0 for a role and printed
 * nothing but whitespace, so it gave no password: failing as {@link PasswordCommandFailed} does.
 */
export class PasswordCommandSilent extends Schema.TaggedError<PasswordCommandSilent>()(
  "PasswordCommandSilent",
  { command: Schema.String, role: Schema.String },
) {
  /**
   * The command, the role it was run for, and what it must print.
   */
  override get message(): string {
    return `The password command ${this.command} exited with code 0 for the role ${this.role} but printed no password on standard output. QTI_PIE_PG_PASSWORD_COMMAND must print the role's password; run it by hand with ${this.role} as its one argument to check that it is signed in.`;
  }
}

/**
 * The password command `QTI_PIE_PG_PASSWORD_COMMAND` names was still running for a role when its
 * bound, `QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT`, passed, so it was killed and gave no password:
 * failing as {@link PasswordCommandFailed} does.
 */
export class PasswordCommandTimedOut extends Schema.TaggedError<PasswordCommandTimedOut>()(
  "PasswordCommandTimedOut",
  { command: Schema.String, role: Schema.String, timeout: Schema.String },
) {
  /**
   * The command, the role it was run for, its bound, and how to give it longer.
   */
  override get message(): string {
    return `The password command ${this.command} did not finish within ${this.timeout} for the role ${this.role}, so it was stopped and the connection has no password. Give QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT a longer limit, such as '2 minutes', if its sign-in needs more time, or run it by hand with ${this.role} as its one argument to see where it waits.`;
  }
}

/**
 * The password command `QTI_PIE_PG_PASSWORD_COMMAND` names could not be run to its end for a role:
 * no executable is at the path, it may not be run, or its output or exit could not be read, as the
 * spawner's `PlatformError` says. Failing as {@link PasswordCommandFailed} does.
 */
export class PasswordCommandNotRun extends Schema.TaggedError<PasswordCommandNotRun>()(
  "PasswordCommandNotRun",
  { command: Schema.String, reason: Schema.String, role: Schema.String },
) {
  /**
   * The command, the role it was run for, the spawner's reason, and what the setting must name.
   */
  override get message(): string {
    return `The password command ${this.command} could not be run for the role ${this.role}: ${this.reason}. Set QTI_PIE_PG_PASSWORD_COMMAND to the path of an executable that prints a role's password; it runs without a shell, so the setting names one file and holds no arguments.`;
  }
}

/**
 * Every way the password command gives no password.
 */
export type PasswordCommandError =
  | PasswordCommandFailed
  | PasswordCommandNotRun
  | PasswordCommandSilent
  | PasswordCommandTimedOut;

/**
 * A database name scripts/db.sh accepts, which is also its installation's role prefix: a lowercase
 * letter, then at most 62 lowercase letters, digits or underscores, with no `__` and not starting
 * with `pg_`, the rule at the top of that script.
 *
 * - The name leads every cluster role grizzle installs for the database, `<prefix>__<stem>`, so it
 *   holds no `__`, which parts the prefix from the stem; it starts with a letter, as grizzle's
 *   prefix must; and it does not start with `pg_`, which PostgreSQL reserves for roles. A role the
 *   prefix takes past PostgreSQL's 63 bytes is refused where the role is named, by grizzle's
 *   `roleNameOf` ({@link installedRoleOf}), since only a login's stem fixes its length.
 * - PostgreSQL folds an unquoted name to lowercase and truncates one past 63 bytes, so `db.sh
 *   create`, which writes the name unquoted, would make another database than the one a connection
 *   names as written.
 *
 * @see https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
 * @see https://www.postgresql.org/docs/current/sql-createrole.html
 */
/**
 * The longest database name a lane leases, which is its installation's role prefix: the longest in
 * use, edullm_keydigest_pantry. A config's `rolePrefixBytes` states it (grizzle.config.ts), and
 * grizzle refuses a longer prefix at connect.
 */
export const leaseNameBytes = 23;

export const DatabaseName = Schema.String.check(
  Schema.isPattern(regex("^(?!pg_)(?!.*__)[a-z][a-z0-9_]{0,62}$", "u"), {
    message:
      "Use a lowercase letter, then at most 62 lowercase letters, digits or underscores, with no __ and not starting with pg_, so that scripts/db.sh creates the database this connection names and grizzle accepts the name as the installation's role prefix",
  }),
);

/**
 * The database a connection names, `QTI_PIE_PG_DATABASE`, which is also its installation's role
 * prefix, so a lane's database name is its prefix and two lanes never share one. It has no default:
 * a suite reads `Config.option(clusterDatabase)` to skip where no database is named.
 */
export const clusterDatabase = Config.schema(DatabaseName, "QTI_PIE_PG_DATABASE");

/**
 * The server's settings, read from the same variables scripts/db.sh reads, each required: a
 * missing one fails with Effect's `ConfigError`, naming the variable, before any file is read.
 *
 * - `ca` is the CA file a connection verifies the server against, `QTI_PIE_PG_CA`.
 * - `host` is the server's host, `QTI_PIE_PG_HOST`, which its certificate must name.
 * - `port` is the server's port, `QTI_PIE_PG_PORT`.
 */
const clusterSettings = Config.all({
  ca: Config.String("QTI_PIE_PG_CA"),
  database: clusterDatabase,
  host: Config.String("QTI_PIE_PG_HOST"),
  port: Config.Port("QTI_PIE_PG_PORT"),
});

/**
 * The migration identity, `QTI_PIE_PG_MIGRATION_ROLE`: the role that owns the database and so
 * every schema `grizzle migrate` installs, the lane's own owner role on the shared server.
 */
const migrationRoleSetting = Config.String("QTI_PIE_PG_MIGRATION_ROLE");

/**
 * A password command's bound: a positive duration whose milliseconds stay within
 * {@link timerMaxMs}, the one timer that bounds the command's run.
 */
const PasswordCommandTimeout = Schema.DurationFromString.check(
  Schema.makeFilter(
    (timeout: Duration.Duration) =>
      Duration.isPositive(timeout) && Duration.toMillis(timeout) <= timerMaxMs,
    {
      message:
        "Use a positive duration of at most 24 days, such as '90 seconds' or '2 minutes', so it stays within what Node's timers keep",
    },
  ),
);

/**
 * The password command and its bound, where `QTI_PIE_PG_PASSWORD_COMMAND` names one.
 */
interface PasswordCommand {
  readonly command: string;
  readonly timeout: Duration.Duration;
}

/**
 * The executable that gives each role its password, `QTI_PIE_PG_PASSWORD_COMMAND`, none where it is
 * unset or empty, as scripts/db.sh reads it, with the bound of one run of it,
 * `QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT`, 60 seconds ({@link passwordCommandTimeoutSeconds}) where
 * it is unset or empty. Where the command is set, it replaces both local sources: the migration
 * identity's `QTI_PIE_PG_MIGRATION_PASSWORD` and each login's password file.
 *
 * The bound is long enough for a sign-in the command runs to prompt and be answered by hand.
 * scripts/db.sh puts none on its own runs: it runs the command before it starts psql.
 */
const passwordCommandSetting: Config.Config<Option.Option<PasswordCommand>> = Config.all({
  command: Config.option(Config.String("QTI_PIE_PG_PASSWORD_COMMAND")),
  timeout: Config.schema(PasswordCommandTimeout, "QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT").pipe(
    Config.withDefault(Duration.seconds(passwordCommandTimeoutSeconds)),
  ),
}).pipe(
  Config.map(({ command, timeout }) =>
    command.pipe(
      Option.filter((executable) => executable !== ""),
      Option.map((executable) => ({ command: executable, timeout })),
    ),
  ),
);

/**
 * Where each login's password comes from: the password command, run for the login's role, or the
 * folder of its password files, `QTI_PIE_PG_SECRETS`, where `scripts/db.sh migrate` writes them,
 * which is required where no command is set.
 */
type LoginPasswords =
  | { readonly _tag: "command"; readonly command: PasswordCommand }
  | { readonly _tag: "files"; readonly secrets: string };

/**
 * The logins' password source ({@link LoginPasswords}), read from the password command's setting
 * and, where it names none, from `QTI_PIE_PG_SECRETS`.
 */
const loginPasswordsSetting: Config.Config<LoginPasswords> = passwordCommandSetting.pipe(
  Config.flatMap((command) =>
    Option.match(command, {
      onNone: () =>
        Config.map(Config.String("QTI_PIE_PG_SECRETS"), (secrets): LoginPasswords => ({
          _tag: "files",
          secrets,
        })),
      onSome: (named) => Config.succeed<LoginPasswords>({ _tag: "command", command: named }),
    }),
  ),
);

/**
 * The variable the migration identity's password is read from, which scripts/db.sh exports, from
 * the owner's password file `QTI_PIE_PG_MIGRATION_PASSWORD_FILE` names, for each grizzle command it
 * runs.
 */
const migrationPasswordSetting = "QTI_PIE_PG_MIGRATION_PASSWORD";

/**
 * How long a password command that is being stopped has to exit after SIGTERM before its process
 * group is sent SIGKILL, so one that ignores SIGTERM cannot hold its run open past its bound
 * ({@link passwordCommandKillGraceSeconds}).
 */
const commandKillGrace = Duration.seconds(passwordCommandKillGraceSeconds);

/**
 * The Node services a password command runs under: the child process spawner,
 * with the file system and path services it reads.
 */
const processServices = NodeChildProcessSpawner.layer.pipe(
  Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
);

/**
 * Run the password command once for one role: the executable itself, never a shell, with the
 * role's name as its one argument, its standard input and error the process's own, so a sign-in
 * it runs can prompt and report, and its standard output, trimmed, the password. It runs as a child
 * of this Node process, so it needs no service of its caller's, as grizzle's `password` Effect
 * takes none.
 *
 * The command's bound is its own: past it, the run's scope closes, which sends the command's
 * process group SIGTERM, then SIGKILL after {@link commandKillGrace}, and the run fails. Nothing
 * else stops it: grizzle runs an attempt's password Effect detached from the attempt
 * (`Effect.runPromiseWith`), so an attempt that times out or is interrupted leaves the command to
 * this bound.
 *
 * It fails with a {@link PasswordCommandNotRun} where the spawner cannot run it or read its output
 * or exit, a {@link PasswordCommandFailed} for an exit code other than 0, whatever it printed, a
 * {@link PasswordCommandSilent} for an output of whitespace alone, and a
 * {@link PasswordCommandTimedOut} once its bound passes.
 *
 * @param passwordCommand - The command and its bound.
 * @param passwordCommand.command - The executable, `QTI_PIE_PG_PASSWORD_COMMAND`.
 * @param passwordCommand.timeout - The bound, `QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT`.
 * @param role - The PostgreSQL role the password is for.
 * @returns The password.
 * @see https://github.com/bjornpagen/grizzle/blob/999facc69571db35dc9878d47f2d82ba95c41456/packages/grizzle/src/adapter/wire/session.ts#L391-L410
 */
const runPasswordCommand = (
  { command, timeout }: PasswordCommand,
  role: string,
): Effect.Effect<Redacted.Redacted, PasswordCommandError> =>
  Effect.gen(function* passwordCommandRun() {
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
    const handle = yield* spawner.spawn(
      ChildProcess.make(command, [role], {
        forceKillAfter: commandKillGrace,
        stderr: "inherit",
        stdin: "inherit",
        stdout: "pipe",
      }),
    );
    const { exitCode, output } = yield* Effect.all(
      { exitCode: handle.exitCode, output: Stream.mkString(Stream.decodeText(handle.stdout)) },
      { concurrency: "unbounded" },
    );
    const password = output.trim();
    if (exitCode !== ChildProcessSpawner.ExitCode(0)) {
      return yield* new PasswordCommandFailed({ command, exitCode, role });
    }

    if (password === "") {
      return yield* new PasswordCommandSilent({ command, role });
    }

    return Redacted.make(password);
  }).pipe(
    Effect.scoped,
    Effect.catchTag("PlatformError", (cause) =>
      Effect.fail(new PasswordCommandNotRun({ command, reason: cause.message, role })),
    ),
    Effect.timeoutOrElse({
      duration: timeout,
      orElse: () =>
        Effect.fail(
          new PasswordCommandTimedOut({ command, role, timeout: Duration.format(timeout) }),
        ),
    }),
    Effect.provide(processServices),
    Effect.withSpan("db.passwordCommand", { attributes: { role } }),
  );

/**
 * The password of a connection attempt from the password command: a run of it for the role, whose
 * failure fails the attempt with grizzle's `CredentialError`.
 *
 * @param passwordCommand - The command and its bound.
 * @param role - The PostgreSQL role the password is for.
 * @returns The attempt's password Effect.
 */
const attemptPassword = (
  passwordCommand: PasswordCommand,
  role: string,
): Effect.Effect<Redacted.Redacted, CredentialError> =>
  runPasswordCommand(passwordCommand, role).pipe(
    Effect.mapError((cause) => new CredentialError({ cause })),
  );

/**
 * Run the password command for a login's role before any connection attempt, and give the
 * password Effect its attempts read: the password that run printed, for the first attempt, then a
 * run of its own for each later one.
 *
 * The run here is the one the caller waits for, outside every attempt, so a sign-in it runs by
 * hand is bounded by the command's bound alone, and its failure is this package's own error as it
 * is. In an attempt the same failure is only the cause of grizzle's failure at stage `acquire`,
 * whose message says no more than that the password Effect failed. Each later attempt runs the
 * command again, so a credential that expires, such as an RDS IAM token, is new for each session.
 *
 * @param passwordCommand - The command and its bound.
 * @param role - The login's PostgreSQL role.
 * @returns The password Effect, once the first run has given a password; fails as
 *   {@link runPasswordCommand} does.
 */
const primedPassword = Effect.fnUntraced(function* primedPassword(
  passwordCommand: PasswordCommand,
  role: string,
) {
  const first = yield* runPasswordCommand(passwordCommand, role);
  const waiting = yield* Ref.make(Option.some(first));
  const password: DbConnection["password"] = Ref.getAndSet(waiting, Option.none()).pipe(
    Effect.flatMap((primed) =>
      Option.match(primed, {
        onNone: () => attemptPassword(passwordCommand, role),
        onSome: (printed) => Effect.succeed(printed),
      }),
    ),
  );

  return password;
});

/**
 * The database a test file's connections name in place of `QTI_PIE_PG_DATABASE`'s, a copy of it of
 * the file's own (`#pantry/test/file-database.ts`), or none, the live default, for the database the
 * settings name. A copy keeps its template's roles, so the role prefix stays the settings'
 * database's name, the lane's, and only the database a connection names changes. Every connection
 * this module builds reads it, so a layer, a command line run in the test's process and a session
 * the test opens all reach the file's database with no builder of their own.
 */
export const FileDatabase = Context.Reference<Option.Option<string>>("pantry/db/FileDatabase", {
  defaultValue: () => Option.none(),
});

/**
 * Read the server's CA and build from the settings the connection every connection to the server
 * is: TCP to the host and port, verify-full TLS against the CA file, whose server certificate must
 * name the host, node-postgres as the driver, and the database's name as the role prefix, so each
 * database is an installation of its own; a test file's copy ({@link FileDatabase}) is named in
 * place of the database, under the same prefix. It states no connect timeout: grizzle's connection
 * has none, and an unreachable server answers as its socket fails.
 *
 * The CA is read through Effect's `FileSystem`, whichever the caller provides: Node's
 * (`NodeFileSystem.layer`) for a login's connection, and for the migration identity's a
 * synchronous one of grizzle.config.ts's own, since grizzle calls the config's connection
 * synchronously (`GrizzleConfig.connection`, `() => MigrationConnectionConfig`) and its transport
 * takes the CA as text, while `NodeFileSystem` reads a file only asynchronously. It fails with a
 * {@link ClusterConfigError} when the CA is unreadable.
 *
 * @param settings - The server's settings ({@link clusterSettings}).
 * @param settings.ca - The CA file, `QTI_PIE_PG_CA`.
 * @param settings.database - The database, which is the installation's role prefix too.
 * @param settings.host - The server's host.
 * @param settings.port - The server's port.
 * @returns The connection, without its password.
 * @see https://github.com/bjornpagen/grizzle/blob/eb56d58bb3191b6645f1334dc55f63c7a73c2dc4/packages/grizzle/src/adapter/types/config.ts#L41-L45
 */
const connectionAt = (settings: {
  readonly ca: string;
  readonly database: string;
  readonly host: string;
  readonly port: number;
}): Effect.Effect<Omit<DbConnection, "password">, ClusterConfigError, FileSystem.FileSystem> =>
  Effect.gen(function* connectedAt() {
    const fs = yield* FileSystem.FileSystem;
    const fileDatabase = yield* FileDatabase;
    const text = yield* fs
      .readFileString(settings.ca)
      .pipe(Effect.mapError(() => new ClusterConfigError({ path: settings.ca })));
    const transport: Transport = {
      ca: text,
      host: settings.host,
      kind: "sslRequest",
      open: () => new net.Socket(),
      port: settings.port,
      servername: settings.host,
    };
    const connection: Omit<DbConnection, "password"> = {
      database: Option.getOrElse(fileDatabase, () => settings.database),
      driver: pg,
      rolePrefix: settings.database,
      transport,
    };

    return connection;
  });

/**
 * Read the server's settings, then the logins' password source ({@link LoginPasswords}), then the
 * server's CA for a login's connection. It fails with Effect's `ConfigError` for a missing or
 * malformed setting, before any file is read, and with a {@link ClusterConfigError} when the CA is
 * unreadable.
 */
const loginCluster = Effect.gen(function* loginCluster() {
  const settings = yield* clusterSettings;
  const passwords = yield* loginPasswordsSetting;

  return { connection: yield* connectionAt(settings), passwords };
});

/**
 * The migration identity's connection to the cluster, which the `connection` of grizzle.config.ts
 * builds when `grizzle migrate`, `drift`, `roles` or `uninstall` calls it: `grizzle generate`,
 * `check` and `names` never call it, so they read no setting of the cluster's and no CA. It reads
 * the CA through `FileSystem`, which {@link migrationConnectionNow} provides as a synchronous read,
 * so that it runs under `Effect.runSync`. Its role is `QTI_PIE_PG_MIGRATION_ROLE`, the lane's owner
 * role.
 *
 * Its password is read at each connection attempt, never when the connection is built: from the
 * password command where `QTI_PIE_PG_PASSWORD_COMMAND` names one, run for the migration role, else
 * from `QTI_PIE_PG_MIGRATION_PASSWORD`. A missing password fails the attempt with grizzle's
 * `CredentialError`, whose cause is the command's failure ({@link PasswordCommandError}) or
 * Effect's `ConfigError` naming the variable.
 *
 * Building it fails with Effect's `ConfigError` for a missing or malformed setting, and with a
 * {@link ClusterConfigError} when the CA is unreadable.
 */
export const migrationConnection = Effect.gen(function* migrationConnection() {
  const settings = yield* clusterSettings;
  const command = yield* passwordCommandSetting;
  const role = yield* migrationRoleSetting;
  const connection = yield* connectionAt(settings);
  const result: MigrationConnectionConfig = {
    ...connection,
    password: Option.match(command, {
      onNone: () =>
        Config.Redacted(migrationPasswordSetting).pipe(
          Effect.mapError((cause) => new CredentialError({ cause })),
        ),
      onSome: (passwordCommand) => attemptPassword(passwordCommand, role),
    }),
    role,
  };

  return result;
}).pipe(Effect.withSpan("db.migrationConnection"));

/**
 * The file system the migration identity's connection reads the server's CA through
 * ({@link migrationConnectionNow}): `readFileString`, read synchronously, so that building the
 * connection finishes under `Effect.runSync`, since grizzle calls a config's `connection`
 * synchronously and Node's (`NodeFileSystem`) reads a file only asynchronously. Building the
 * connection reads no other file, so every other operation fails, as `FileSystem.layerNoop` leaves
 * it.
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
 * Build the migration identity's connection ({@link migrationConnection}) now, synchronously: the
 * `connection` of every grizzle config over the QTI database's installations, pantry's
 * grizzle.config.ts and the QTI database's, which grizzle calls each time it reaches an
 * installation. Only those commands ask, so `generate`, `check` and `names` read no setting of the
 * server's and no CA; only those that connect read the password, at each connection attempt.
 *
 * Grizzle calls it synchronously. A setting or a CA this cannot read throws, and grizzle refuses
 * the throw as `ConnectionThrew`, printing its message, which names the variable or the file.
 *
 * @returns The connection. Throws where a setting is missing or malformed, or the CA is unreadable.
 */
export const migrationConnectionNow = (): MigrationConnectionConfig =>
  Effect.runSync(migrationConnection.pipe(Effect.provide(synchronousFiles)));

/**
 * The password a login's connection reads at each attempt where no password command is set: the
 * one scripts/db.sh gave the login, in `<QTI_PIE_PG_SECRETS>/<role>.password`, trimmed, failing the
 * attempt with grizzle's `CredentialError` where the file is absent.
 *
 * @param fs - The file system it is read from.
 * @param secrets - The folder of the logins' password files.
 * @param role - The login's PostgreSQL role, which names the file.
 * @returns The attempt's password Effect.
 */
const filePassword = (
  fs: FileSystem.FileSystem,
  secrets: string,
  role: string,
): Effect.Effect<Redacted.Redacted, CredentialError> =>
  fs.readFileString(`${secrets}/${role}.password`).pipe(
    Effect.map((text) => Redacted.make(text.trim())),
    Effect.mapError((cause) => new CredentialError({ cause })),
  );

/**
 * Name the PostgreSQL role an installation installs for a login, as grizzle's `roleNameOf` names
 * it, in the error channel: grizzle throws its `CompileError` for a role prefix it refuses and for
 * a role the prefix takes past PostgreSQL's 63 bytes, and no password names a role it cannot name,
 * so either is the connection attempt's `CredentialError`, with grizzle's error as its cause.
 *
 * @param login - The login, an authoring one or a served one, or the decoder login a served one
 *   names.
 * @param installation - The connection, whose `rolePrefix` names the installation.
 * @returns The role.
 */
const installedRoleOf = <L>(
  login: AnyLogin | ServedLogin<L> | DecoderLogin,
  installation: Parameters<typeof roleNameOf>[1],
): Effect.Effect<string, CredentialError> =>
  Effect.try({
    catch: (cause) => new CredentialError({ cause }),
    try: () => roleNameOf(login, installation),
  });

/**
 * The server's connection without its password, and each role's password at each connection
 * attempt: from the password command where `QTI_PIE_PG_PASSWORD_COMMAND` names one, run for the
 * role, else the one scripts/db.sh gave the role, read from `<QTI_PIE_PG_SECRETS>/<role>.password`.
 * The one source of a role's password, which {@link roleConnections} and {@link loginConnection}
 * both read. It fails as {@link loginCluster} does.
 */
const rolePasswords = Effect.gen(function* rolePasswords() {
  const fs = yield* FileSystem.FileSystem;
  const { connection, passwords } = yield* loginCluster;
  const passwordOf = (role: string): Effect.Effect<Redacted.Redacted, CredentialError> =>
    passwords._tag === "files"
      ? filePassword(fs, passwords.secrets, role)
      : attemptPassword(passwords.command, role);

  return { connection, passwordOf };
});

/**
 * Read the server's settings and its CA, and give from them the connection of any PostgreSQL role
 * by its name, with that role's password at each connection attempt ({@link rolePasswords}), and
 * the database the connections name: for a caller that signs in per role, such as the QTI
 * database's publication layers. It fails as {@link loginCluster} does.
 */
export const roleConnections = Effect.gen(function* roleConnections() {
  const { connection, passwordOf } = yield* rolePasswords;

  return {
    connectionAs: (role: string): DbConnection => ({ ...connection, password: passwordOf(role) }),
    database: connection.database,
  };
}).pipe(Effect.withSpan("db.roleConnections"));

/**
 * Read the server's settings and its CA, and give from them each login's connection to the server,
 * for its `DbLayer`: the server's connection with the login's role's password at each connection
 * attempt ({@link rolePasswords}). The role is the PostgreSQL role grizzle installs for the login
 * in this connection's installation, the one `scripts/db.sh migrate` sets the password on and names
 * the file after: `roleNameOf(login, connection)`. A served login's decoder login, the one its
 * installation's live source logs in as, has a connection here as any login does.
 *
 * A missing password, a password file absent or a command that fails, is not found here: it fails
 * each connection attempt with grizzle's `CredentialError`, whose cause is the command's
 * {@link PasswordCommandError}. {@link primedLoginConnection} finds a failing command before any
 * attempt.
 *
 * It fails as {@link loginCluster} does: with Effect's `ConfigError` for a missing or malformed
 * setting, before any file is read, and with a {@link ClusterConfigError} when the CA is unreadable.
 *
 * @see https://github.com/bjornpagen/grizzle/blob/eb56d58bb3191b6645f1334dc55f63c7a73c2dc4/packages/engine/src/program/names.ts#L61-L76
 */
export const loginConnection = Effect.gen(function* loginConnection() {
  const { connection, passwordOf } = yield* rolePasswords;

  return <L>(login: AnyLogin | ServedLogin<L> | DecoderLogin): DbConnection => ({
    ...connection,
    password: Effect.flatMap(installedRoleOf(login, connection), passwordOf),
  });
}).pipe(Effect.withSpan("db.loginConnection"));

/**
 * Read the server's settings and its CA, and give from them the Effect that builds a login's
 * connection as {@link loginConnection} does, except where `QTI_PIE_PG_PASSWORD_COMMAND` names a
 * command: building the connection then runs it once for the login's role, before any attempt,
 * and fails with its {@link PasswordCommandError}; the first attempt reads that run's password,
 * and each later attempt runs the command again ({@link primedPassword}). `AuthorAppLayer`
 * (src/db/layer.ts) builds the runtime's connection with it, so a failing command fails the
 * layer's build with the command's own error, whose message the command line prints.
 *
 * It fails as {@link loginConnection} does.
 */
export const primedLoginConnection = Effect.gen(function* primedLoginConnection() {
  const fs = yield* FileSystem.FileSystem;
  const { connection, passwords } = yield* loginCluster;

  return <L>(
    login: AnyLogin | ServedLogin<L>,
  ): Effect.Effect<DbConnection, PasswordCommandError | CredentialError> =>
    Effect.flatMap(installedRoleOf(login, connection), (role) =>
      passwords._tag === "files"
        ? Effect.succeed({ ...connection, password: filePassword(fs, passwords.secrets, role) })
        : primedPassword(passwords.command, role).pipe(
            Effect.map((password): DbConnection => ({ ...connection, password })),
          ),
    );
}).pipe(Effect.withSpan("db.primedLoginConnection"));
