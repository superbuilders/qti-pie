/**
 * Where this package connects: its own local cluster by default (pg.config.ts, made by the testing
 * library's cluster maker), reached as scripts/db.sh reaches it, or the PostgreSQL 19 server its
 * settings name, by the migration identity (`grizzle migrate`, through grizzle.config.ts) and by a
 * login (its `DbLayer`, src/db/layer.ts).
 */
import net from "node:net";
import type { AnyLogin, MigrationConnectionConfig } from "@bjornpagen/grizzle";
import { CredentialError, roleNameOf } from "@bjornpagen/grizzle/runtime";
import type {
  DbConnection,
  DecoderLogin,
  ServedLogin,
  Transport,
} from "@bjornpagen/grizzle/runtime";
import { clusterUp } from "@bjornpagen/testing/pg";
import * as NodeChildProcessSpawner from "@effect/platform-node/NodeChildProcessSpawner";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import {
  Array as Arr,
  Config,
  Context,
  Duration,
  Effect,
  FileSystem,
  Layer,
  Option,
  Redacted,
  Ref,
  Schema,
  Stream,
} from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/process";
import pg from "pg";
import cluster from "#pg.config.ts";

/**
 * The longest delay Node's timers keep. grizzle admits a `connectTimeoutMs` up to it, so pantry's
 * connect timeout, its network part and a password command's bound together, stays within it.
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
 * The bound of one connection attempt's network part, for pantry's migration identity and every
 * login alike: TCP, the SSLRequest, the TLS handshake, startup and authentication, and the one
 * CancelRequest an interrupted statement sends. grizzle takes it as the connection's
 * `connectTimeoutMs`, with a password command's own bound added where one is set, and fails an
 * attempt past it with `ConnectTimedOut`.
 *
 * @limitKind provisional
 * @owner pantry's cluster connection (src/db/connection.ts)
 * @unit milliseconds
 * @scope each connection attempt pantry makes, its network part
 * @guards a cluster that never answers, or a CancelRequest it never reads, holds the command or the test that connects
 *   for as long as the operating system's TCP timeouts allow
 * @measure time a hundred connection attempts of pantry's author login to its own cluster (pg.config.ts) and to a
 *   private cluster of its spec, on cassowary under its usual load, and keep a bound many times the slowest
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const connectNetworkTimeoutMs = 5000;

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
 * What named the CA file a connection reads: `QTI_PIE_PG_CA`, or, where it is unset, the local
 * cluster (pg.config.ts), whose member's CA the cluster maker names.
 */
const CaSource = Schema.Literals(["QTI_PIE_PG_CA", "pg.config.ts"]);

/**
 * The CA file a connection reads, and what named it ({@link CaSource}).
 */
interface CaFile {
  readonly path: string;
  readonly source: typeof CaSource.Type;
}

/**
 * The server's CA certificate could not be read: the file `QTI_PIE_PG_CA` names, or, where it is
 * unset, the local cluster member's.
 */
export class ClusterConfigError extends Schema.TaggedError<ClusterConfigError>()(
  "ClusterConfigError",
  { path: Schema.String, source: CaSource },
) {
  /**
   * The unreadable file and how to supply it, by what named it.
   */
  override get message(): string {
    return this.source === "QTI_PIE_PG_CA"
      ? `Cannot read the database's CA certificate at ${this.path}, the file QTI_PIE_PG_CA names. Set QTI_PIE_PG_CA to a readable PEM file, such as the certificate bundle of the server's RDS region, or unset it to use the local cluster's.`
      : `Cannot read the local cluster's CA certificate at ${this.path}, which the cluster maker gives its member. Run \`pnpm exec toolchain-pg doctor\` in packages/qti-pie/packages/pantry to see what its state lacks, or set QTI_PIE_PG_CA to another server's CA file.`;
  }
}

/**
 * The local cluster (pg.config.ts) could not be brought up, so a connection whose port or CA no
 * setting names has neither: the cluster maker's failure, as its message states it.
 */
export class LocalMemberUnavailable extends Schema.TaggedError<LocalMemberUnavailable>()(
  "LocalMemberUnavailable",
  { reason: Schema.String },
) {
  /**
   * The cluster maker's reason, and how to look into it or reach another server.
   */
  override get message(): string {
    return `The local cluster pantry connects to where QTI_PIE_PG_PORT or QTI_PIE_PG_CA is unset (pg.config.ts) could not be brought up: ${this.reason}. Run \`pnpm exec toolchain-pg doctor\` in packages/qti-pie/packages/pantry to see why, or set QTI_PIE_PG_PORT and QTI_PIE_PG_CA to another server's.`;
  }
}

/**
 * `QTI_PIE_PG_CA` is unset, and the migration identity's connection reads the server's CA from it
 * alone: scripts/db.sh, which runs grizzle's commands that connect, sets it from the local
 * cluster, and grizzle.config.ts builds the connection synchronously, where the cluster's member
 * cannot be described. It names the database and the role the connection was for.
 */
export class MigrationCaUnset extends Schema.TaggedError<MigrationCaUnset>()("MigrationCaUnset", {
  database: Schema.String,
  role: Schema.String,
}) {
  /**
   * The connection, what sets its CA, and how to name another server's.
   */
  override get message(): string {
    return `QTI_PIE_PG_CA is unset, and the migration identity's connection, as ${this.role} to the database ${this.database}, reads the server's CA from it alone. Run grizzle's commands that connect through scripts/db.sh (scripts/db.sh migrate, reset or drop), which sets it from the local cluster, or set QTI_PIE_PG_CA to another server's CA file.`;
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
    return `The password command ${this.command} exited with code ${String(this.exitCode)} for the role ${this.role}, so the connection has no password. Run it by hand with ${this.role} as its one argument to see why it fails, and sign in if it asks you to; or unset QTI_PIE_PG_PASSWORD_COMMAND to use the local cluster's passwords.`;
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
const DatabaseName = Schema.String.check(
  Schema.isPattern(/^(?!pg_)(?!.*__)[a-z][a-z0-9_]{0,62}$/u, {
    message:
      "Use a lowercase letter, then at most 62 lowercase letters, digits or underscores, with no __ and not starting with pg_, so that scripts/db.sh creates the database this connection names and grizzle accepts the name as the installation's role prefix",
  }),
);

/**
 * A folder setting whose default is a path under the home folder: the variable's value, else
 * `HOME` with `below` appended.
 *
 * @param name - The variable.
 * @param below - The default's path under the home folder.
 * @returns The folder.
 */
const underHome = (name: string, below: string): Config.Config<string> =>
  Config.all({ home: Config.String("HOME"), set: Config.option(Config.String(name)) }).pipe(
    Config.map(({ home, set }) => Option.getOrElse(set, () => `${home}/${below}`)),
  );

/**
 * The database a connection names, as `QTI_PIE_PG_DATABASE` gives it, `qti_pie` by default.
 */
const database = Config.schema(DatabaseName, "QTI_PIE_PG_DATABASE").pipe(
  Config.withDefault("qti_pie"),
);

/**
 * The cluster's settings, read from the same variables as the block at the top of scripts/db.sh,
 * which sets each from the local cluster where it is unset; an empty variable is unset, as the
 * script's `:=` reads it. Every setting left unset is the local cluster's (pg.config.ts); setting
 * them reaches another server.
 *
 * - `ca` is the CA file a connection verifies the server against, `QTI_PIE_PG_CA`: none where it is
 *   unset, for the local cluster member's.
 * - `port` is the server's port, `QTI_PIE_PG_PORT`: none where it is unset, for the local cluster
 *   member's.
 * - `secrets` is the folder of the logins' password files, `~/.local/var/qti-pie/<database>` by
 *   default, where `scripts/db.sh migrate` writes them.
 */
const clusterSettings = Config.all({
  ca: Config.option(Config.String("QTI_PIE_PG_CA")),
  database,
  host: Config.String("QTI_PIE_PG_HOST").pipe(Config.withDefault("localhost")),
  port: Config.option(Config.Port("QTI_PIE_PG_PORT")),
  secrets: database.pipe(
    Config.flatMap((name) => underHome("QTI_PIE_PG_SECRETS", `.local/var/qti-pie/${name}`)),
  ),
});

/**
 * The migration identity, `QTI_PIE_PG_MIGRATION_ROLE`: the role that owns the database and so
 * every schema `grizzle migrate` installs. None where it is unset, for the local cluster's owner
 * (pg.config.ts), qti_pie_dev, which owns every database scripts/db.sh creates there.
 */
const migrationRoleSetting = Config.option(Config.String("QTI_PIE_PG_MIGRATION_ROLE"));

/**
 * What a connection reads of the local cluster's member where a setting is unset: the port it
 * listens on, its CA's file, its owner, and the file of the owner's password, as the cluster maker
 * describes its member.
 */
export interface MemberFacts {
  readonly caFile: string;
  readonly owner: string;
  readonly passwordFile: string;
  readonly port: number;
}

/**
 * The local cluster's member, which a login's connection reads where `QTI_PIE_PG_PORT` or
 * `QTI_PIE_PG_CA` is unset: `member` describes it each time it runs, so a connection whose settings
 * name every fact never runs it. Production's is {@link localMemberUp}; a test gives its own.
 */
export class LocalMember extends Context.Service<
  LocalMember,
  { readonly member: Effect.Effect<MemberFacts, LocalMemberUnavailable> }
>()("pantry/db/LocalMember") {}

/**
 * The bound, in milliseconds, of a connection attempt's network part, for the migration identity
 * and every login alike: TCP, the SSLRequest, the TLS handshake, startup and authentication, and
 * the one CancelRequest an interrupted statement sends.
 *
 * Grizzle states no number of its own: every `DbConnection` carries the caller's
 * `connectTimeoutMs`, and an attempt that has not read its password, connected, finished TLS and
 * authenticated within it fails with `ConnectTimedOut`. 5,000 ms ({@link connectNetworkTimeoutMs})
 * is this package's choice. It stands well above a reachable server's few round trips, and a
 * server that never answers fails the command within seconds rather than holding it. A password
 * command's run is not part of it: {@link connectTimeoutMsOf} adds the command's own bound.
 *
 * @see https://github.com/bjornpagen/grizzle/blob/eb56d58bb3191b6645f1334dc55f63c7a73c2dc4/packages/grizzle/src/adapter/types/layer.ts#L71-L88
 * @see https://github.com/bjornpagen/grizzle/blob/eb56d58bb3191b6645f1334dc55f63c7a73c2dc4/README.md#connecting
 */
const networkTimeoutMs = connectNetworkTimeoutMs;

/**
 * The greatest `connectTimeoutMs` grizzle accepts, 2,147,483,647, the largest delay Node's timers
 * keep ({@link timerMaxMs}).
 *
 * @see https://github.com/bjornpagen/grizzle/blob/999facc69571db35dc9878d47f2d82ba95c41456/packages/grizzle/src/adapter/types/layer.ts#L61-L78
 */
const greatestConnectTimeoutMs = timerMaxMs;

/**
 * A password command's bound: a positive duration whose milliseconds, added to
 * {@link networkTimeoutMs}, stay within {@link greatestConnectTimeoutMs}.
 */
const PasswordCommandTimeout = Schema.DurationFromString.check(
  Schema.makeFilter(
    (timeout: Duration.Duration) =>
      Duration.isPositive(timeout) &&
      Duration.toMillis(timeout) <= greatestConnectTimeoutMs - networkTimeoutMs,
    {
      message:
        "Use a positive duration of at most 24 days, such as '90 seconds' or '2 minutes', so the connect timeout it adds to stays within what Node's timers keep",
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
 * it is unset or empty. Where the command
 * is set, it replaces both local sources: the migration identity's `QTI_PIE_PG_MIGRATION_PASSWORD`
 * and each login's password file.
 *
 * The bound is long enough for a sign-in the command runs to prompt and be answered by hand.
 * scripts/db.sh puts none on its own runs: it runs the command before it starts psql, so no
 * connect timeout covers it there.
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
 * The bound, in milliseconds, of one connection attempt: {@link networkTimeoutMs}, plus the
 * password command's own bound where one is set, since every attempt that runs the command waits
 * for it.
 *
 * Grizzle's `connectTimeoutMs` covers the password Effect too: node-postgres starts its connect
 * timer before TCP and asks for the password only when the server does, within the same timer. So
 * the command's run gets its own bound and the attempt's network part keeps its 5,000 ms. The cost
 * is the longer wait, where a command is set, for a server that never answers and for a
 * CancelRequest, which the same number bounds.
 *
 * @param command - The password command, if any.
 * @returns The attempt's `connectTimeoutMs`, a whole number of milliseconds.
 * @see https://github.com/bjornpagen/grizzle/blob/999facc69571db35dc9878d47f2d82ba95c41456/packages/grizzle/src/adapter/types/layer.ts#L61-L78
 */
const connectTimeoutMsOf = (command: Option.Option<PasswordCommand>): number =>
  Option.match(command, {
    onNone: () => networkTimeoutMs,
    onSome: ({ timeout }) => networkTimeoutMs + Math.ceil(Duration.toMillis(timeout)),
  });

/**
 * The variable the migration identity's password is read from, which scripts/db.sh exports, from
 * the local cluster's owner's password file where no setting names another, for each grizzle
 * command it runs.
 */
const migrationPasswordSetting = "QTI_PIE_PG_MIGRATION_PASSWORD";

/**
 * A connection to the cluster, without its password, the folder its logins' password files are in,
 * and the password command that gives every role its password where the settings name one.
 */
interface ClusterConnection {
  readonly command: Option.Option<PasswordCommand>;
  readonly connection: Omit<DbConnection, "password">;
  readonly secrets: string;
}

/**
 * How long a password command that is being stopped has to exit after SIGTERM before its process
 * group is sent SIGKILL, so one that ignores SIGTERM cannot hold its run open past its bound
 * ({@link passwordCommandKillGraceSeconds}).
 */
const commandKillGrace = Duration.seconds(passwordCommandKillGraceSeconds);

/**
 * The Node services a password command and the cluster maker run under: the child process spawner,
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
 * The cluster's settings and the password command's, read before any file is, so a missing or
 * malformed setting fails with Effect's `ConfigError` first.
 */
const settingsRead = Effect.all({ command: passwordCommandSetting, settings: clusterSettings });

/**
 * Read the server's CA and build from the settings the connection every connection to the cluster
 * is: TCP to the host and `port`, verify-full TLS against the CA file `ca`, whose server
 * certificate must name the host (the cluster maker's CA names `localhost`, `127.0.0.1` and `::1`),
 * node-postgres as the driver, the database's name as the role prefix, so each database is an
 * installation of its own, and the connect timeout {@link connectTimeoutMsOf} gives the settings'
 * password command.
 *
 * The CA is read through Effect's `FileSystem`, whichever the caller provides: Node's
 * (`NodeFileSystem.layer`) for a login's connection, and for the migration identity's a
 * synchronous one of grizzle.config.ts's own, since grizzle calls the config's connection
 * synchronously (`GrizzleConfig.connection`, `() => MigrationConnectionConfig`) and its transport
 * takes the CA as text, while `NodeFileSystem` reads a file only asynchronously. It fails with a
 * {@link ClusterConfigError} when the CA is unreadable.
 *
 * @param settings - The cluster's settings ({@link clusterSettings}).
 * @param settings.database - The database, which is the installation's role prefix too.
 * @param settings.host - The server's host.
 * @param settings.secrets - The folder of the logins' password files.
 * @param command - The password command, if any.
 * @param port - The server's port.
 * @param ca - The CA file, and what named it.
 * @returns The connection, without its password.
 * @see https://github.com/bjornpagen/grizzle/blob/eb56d58bb3191b6645f1334dc55f63c7a73c2dc4/packages/grizzle/src/adapter/types/config.ts#L41-L45
 */
const connectionAt = (
  settings: { readonly database: string; readonly host: string; readonly secrets: string },
  command: Option.Option<PasswordCommand>,
  port: number,
  ca: CaFile,
): Effect.Effect<ClusterConnection, ClusterConfigError, FileSystem.FileSystem> =>
  Effect.gen(function* connectedAt() {
    const fs = yield* FileSystem.FileSystem;
    const text = yield* fs
      .readFileString(ca.path)
      .pipe(Effect.mapError(() => new ClusterConfigError(ca)));
    const transport: Transport = {
      ca: text,
      host: settings.host,
      kind: "sslRequest",
      open: () => new net.Socket(),
      port,
      servername: settings.host,
    };
    const result: ClusterConnection = {
      command,
      connection: {
        connectTimeoutMs: connectTimeoutMsOf(command),
        database: settings.database,
        driver: pg,
        rolePrefix: settings.database,
        transport,
      },
      secrets: settings.secrets,
    };

    return result;
  });

/**
 * Read the cluster's settings and its CA for a login's connection: the port and the CA file the
 * settings name, and each one they leave unset the local cluster member's ({@link LocalMember}),
 * which is described once, and only where one is unset, so a connection whose settings name both
 * never brings the local cluster up.
 *
 * It fails with Effect's `ConfigError` for a missing or malformed setting, before any file is read
 * or the member described, with the member's {@link LocalMemberUnavailable}, and with a
 * {@link ClusterConfigError} when the CA is unreadable.
 */
const loginCluster = Effect.gen(function* loginCluster() {
  const { command, settings } = yield* settingsRead;
  const { member } = yield* LocalMember;
  const described = yield* Effect.cached(member);
  const port = yield* Option.match(settings.port, {
    onNone: () => described.pipe(Effect.map((facts) => facts.port)),
    onSome: Effect.succeed,
  });
  const ca = yield* Option.match(settings.ca, {
    onNone: () =>
      described.pipe(
        Effect.map((facts): CaFile => ({ path: facts.caFile, source: "pg.config.ts" })),
      ),
    onSome: (path) => Effect.succeed<CaFile>({ path, source: "QTI_PIE_PG_CA" }),
  });

  return yield* connectionAt(settings, command, port, ca);
});

/**
 * The cluster maker's member of pantry's own cluster (pg.config.ts), the {@link LocalMember} of
 * every command and test that reaches the cluster: the cluster up, made where it is missing and
 * started where it is stopped (the testing library's `clusterUp`), and its one member's facts. It
 * reads `HOME` and `TOOLCHAIN_PG_CLUSTER` through the caller's `ConfigProvider`.
 */
export const localMemberUp = Layer.succeed(LocalMember, {
  member: clusterUp(cluster).pipe(
    Effect.map((members): MemberFacts => {
      const { caFile, owner, passwordFile, port } = Arr.headNonEmpty(members);

      return { caFile, owner, passwordFile, port };
    }),
    Effect.mapError((failure) => new LocalMemberUnavailable({ reason: failure.message })),
    Effect.provide(processServices),
    Effect.withSpan("db.localMember"),
  ),
});

/**
 * The migration identity's connection to the cluster, which the `connection` of grizzle.config.ts
 * builds when `grizzle migrate`, `drift`, `roles` or `uninstall` calls it: `grizzle generate`,
 * `check` and `names` never call it, so they read no setting of the cluster's and no CA. It reads
 * the CA through `FileSystem`, which the config provides as a synchronous read, so that it runs
 * under `Effect.runSync`, where the local cluster's member cannot be described: so the CA is the
 * file `QTI_PIE_PG_CA` names, which scripts/db.sh sets from the local cluster for every grizzle
 * command it runs, and the port and the role, where `QTI_PIE_PG_PORT` and
 * `QTI_PIE_PG_MIGRATION_ROLE` are unset, the local cluster's as pg.config.ts states them.
 *
 * Its password is read at each connection attempt, never when the connection is built: from the
 * password command where `QTI_PIE_PG_PASSWORD_COMMAND` names one, run for the migration role, else
 * from `QTI_PIE_PG_MIGRATION_PASSWORD`. A missing password fails the attempt with grizzle's
 * `CredentialError`, whose cause is the command's failure ({@link PasswordCommandError}) or
 * Effect's `ConfigError` naming the variable.
 *
 * Building it fails with Effect's `ConfigError` for a missing or malformed setting, with
 * {@link MigrationCaUnset} where `QTI_PIE_PG_CA` is unset, and with a {@link ClusterConfigError}
 * when the CA is unreadable.
 */
export const migrationConnection = Effect.gen(function* migrationConnection() {
  const { command, settings } = yield* settingsRead;
  const role = Option.getOrElse(yield* migrationRoleSetting, () => cluster.owner);
  const path = yield* Option.match(settings.ca, {
    onNone: () => Effect.fail(new MigrationCaUnset({ database: settings.database, role })),
    onSome: Effect.succeed,
  });
  const { connection } = yield* connectionAt(
    settings,
    command,
    Option.getOrElse(settings.port, () => cluster.port),
    { path, source: "QTI_PIE_PG_CA" },
  );
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
 * Read the cluster's settings and its CA, each fact they leave unset the local cluster member's
 * ({@link loginCluster}), and give from them each login's connection to the cluster, for its
 * `DbLayer`: the cluster's connection with the login's password at each
 * connection attempt, from the password command where `QTI_PIE_PG_PASSWORD_COMMAND` names one, run
 * for the login's role, else the one scripts/db.sh gave the login, read from
 * `<QTI_PIE_PG_SECRETS>/<role>.password`. `<role>` is the PostgreSQL role grizzle installs for the
 * login in this connection's installation, the one `scripts/db.sh migrate` sets the password on
 * and names the file after: `roleNameOf(login, connection)`. A served login's decoder login, the
 * one its installation's live source logs in as, has a connection here as any login does.
 *
 * A missing password, a password file absent or a command that fails, is not found here: it fails
 * each connection attempt with grizzle's `CredentialError`, whose cause is the command's
 * {@link PasswordCommandError}. {@link primedLoginConnection} finds a failing command before any
 * attempt.
 *
 * It fails as {@link loginCluster} does: with Effect's `ConfigError` for a missing or malformed
 * setting, before any file is read, with {@link LocalMemberUnavailable} where a setting it leaves
 * to the local cluster cannot be read from it, and with a {@link ClusterConfigError} when the CA is
 * unreadable.
 *
 * @see https://github.com/bjornpagen/grizzle/blob/eb56d58bb3191b6645f1334dc55f63c7a73c2dc4/packages/engine/src/program/names.ts#L61-L76
 */
export const loginConnection = Effect.gen(function* loginConnection() {
  const fs = yield* FileSystem.FileSystem;
  const { command, connection, secrets } = yield* loginCluster;

  return <L>(login: AnyLogin | ServedLogin<L> | DecoderLogin): DbConnection => ({
    ...connection,
    password: Effect.flatMap(installedRoleOf(login, connection), (role) =>
      Option.match(command, {
        onNone: () => filePassword(fs, secrets, role),
        onSome: (passwordCommand) => attemptPassword(passwordCommand, role),
      }),
    ),
  });
}).pipe(Effect.withSpan("db.loginConnection"));

/**
 * Read the cluster's settings and its CA, and give from them the Effect that builds a login's
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
  const { command, connection, secrets } = yield* loginCluster;

  return <L>(
    login: AnyLogin | ServedLogin<L>,
  ): Effect.Effect<DbConnection, PasswordCommandError | CredentialError> =>
    Effect.flatMap(installedRoleOf(login, connection), (role) =>
      Option.match(command, {
        onNone: () => Effect.succeed({ ...connection, password: filePassword(fs, secrets, role) }),
        onSome: (passwordCommand) =>
          primedPassword(passwordCommand, role).pipe(
            Effect.map((password): DbConnection => ({ ...connection, password })),
          ),
      }),
    );
}).pipe(Effect.withSpan("db.primedLoginConnection"));
