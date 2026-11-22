/**
 * The server's two connections against scripts/db.sh, whose `QTI_PIE_PG_*` settings and
 * database-name rule are the specification: each setting's named variants carry the value or the
 * refusal that script gives them, a required setting left unset or empty refused, naming it, and
 * every combination of them is exhausted.
 */
import net from "node:net";
import { fileURLToPath } from "node:url";
import {
  login,
  natural,
  relation,
  role as worldRole,
  schema,
  wholeEntriesOf,
} from "@bjornpagen/grizzle";
import type { DbConnection, MigrationConnectionConfig } from "@bjornpagen/grizzle";
import { roleNameOf } from "@bjornpagen/grizzle/runtime";
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import {
  Clock,
  ConfigProvider,
  Duration,
  Effect,
  FileSystem,
  Formatter,
  Option,
  Predicate,
  Redacted,
  Result,
} from "effect";
import type { Layer } from "effect";
import pg from "pg";
import {
  ClusterConfigError,
  loginConnection,
  migrationConnection,
  PasswordCommandFailed,
  PasswordCommandNotRun,
  PasswordCommandSilent,
  PasswordCommandTimedOut,
  primedLoginConnection,
} from "#pantry/db/connection.ts";
import type { PasswordCommandError } from "#pantry/db/connection.ts";
import { searchTimeout } from "#pantry/test/settings.ts";

/**
 * The folder each run's scratch `HOME`, CA and secrets folders are made in, the package's
 * git-ignored `work/`.
 */
const work = fileURLToPath(new URL("../../work/", import.meta.url));

/**
 * A scratch installation, as small as grizzle builds one: one relation, read by one role.
 */
const ProbeRoot = schema("ConnectionProbe", [relation("Probe", { id: natural }, ["id"])], []);

/**
 * The scratch installation's login, whose connection the cases build.
 */
const rootLogin = login(ProbeRoot, "app", [
  worldRole(ProbeRoot, "reader", wholeEntriesOf(ProbeRoot)),
]);

/**
 * The scratch login's installed role on the default database, which names the password file its
 * connection reads.
 */
const loginRole = roleNameOf(rootLogin, { rolePrefix: "qti_pie" });

/**
 * The scratch login's connection, built from the settings a case provides.
 */
const rootConnection = loginConnection.pipe(Effect.map((connectionOf) => connectionOf(rootLogin)));

/**
 * The scratch login's connection as the runtime's layer builds it, running the password command
 * before any attempt where one is set.
 */
const primedRootConnection = primedLoginConnection.pipe(
  Effect.flatMap((connectionOf) => connectionOf(rootLogin)),
);

/**
 * The connections a password command case builds: the migration identity's, a login's, which runs
 * the command at each attempt, and a login's as the runtime's layer builds it, which runs it once
 * before the first.
 */
const commandSides = ["migration", "login", "primed login"] as const;

/**
 * The three sides' builds, one type: each side's connection, failing as any of them fails, under
 * the services any of them reads.
 */
type SideBuild = Effect.Effect<
  DbConnection,
  Effect.Error<typeof migrationConnection | typeof primedRootConnection | typeof rootConnection>,
  Effect.Services<typeof migrationConnection | typeof primedRootConnection | typeof rootConnection>
>;

/**
 * Build the connection of one side under the settings provided.
 *
 * @param side - The connection.
 * @returns The connection.
 */
const connectionOfSide = (side: (typeof commandSides)[number]): SideBuild =>
  ({
    login: rootConnection,
    migration: migrationConnection,
    "primed login": primedRootConnection,
  })[side];

/**
 * The migration identity's password, as `scripts/db.sh migrate` exports it.
 */
const migrationPassword = "the migration identity's password";

/**
 * The migration identity a case names, a lane's owner role.
 */
const migrationRole = "qti_migrator";

/**
 * The required settings a case that varies none of them holds: the server's host and port, the
 * database whose installation {@link loginRole} is in, and the migration identity.
 */
const serverSettings = {
  QTI_PIE_PG_DATABASE: "qti_pie",
  QTI_PIE_PG_HOST: "localhost",
  QTI_PIE_PG_MIGRATION_ROLE: migrationRole,
  QTI_PIE_PG_PORT: "5435",
} as const;

/**
 * A password command's bound, in milliseconds, where `QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT` is unset
 * or empty.
 */
const defaultCommandTimeoutMs = 60_000;

/**
 * One named variant of a setting: the text the environment holds for it, if any, and the value
 * scripts/db.sh resolves it to, or none where the script refuses it.
 */
interface Variant<V> {
  readonly name: string;
  readonly text: Option.Option<string>;
  readonly value: Option.Option<V>;
}

/**
 * Construct the variant of a setting whose variable is unset.
 *
 * @param value - The default the script gives it.
 * @returns The variant.
 */
const unset = <V>(value: V): Variant<V> => ({
  name: "unset",
  text: Option.none(),
  value: Option.some(value),
});

/**
 * Construct the variant of a required setting whose variable is unset, which the script refuses.
 *
 * @returns The variant.
 */
const missing = <V>(): Variant<V> => ({
  name: "unset",
  text: Option.none(),
  value: Option.none(),
});

/**
 * Construct a variant of a setting the script keeps.
 *
 * @param name - What the variant is, as a failing case prints it.
 * @param text - The environment's text.
 * @param value - The value the script resolves the text to.
 * @returns The variant.
 */
const kept = <V>(name: string, text: string, value: V): Variant<V> => ({
  name,
  text: Option.some(text),
  value: Option.some(value),
});

/**
 * Construct a variant of a setting the script refuses.
 *
 * @param name - What the variant is, as a failing case prints it.
 * @param text - The environment's text.
 * @returns The variant.
 */
const refused = <V>(name: string, text: string): Variant<V> => ({
  name,
  text: Option.some(text),
  value: Option.none(),
});

/**
 * `QTI_PIE_PG_HOST`: unset or empty is refused, and any other text is the host as written.
 */
const hosts = [
  kept("localhost", "localhost", "localhost"),
  missing<string>(),
  refused<string>("empty", ""),
  kept("an IP address", "127.0.0.1", "127.0.0.1"),
  kept("another name", "db.test", "db.test"),
] as const;

/**
 * `QTI_PIE_PG_PORT`: an integer from 1 to 65535 is itself, and unset, empty and every other text is
 * refused.
 */
const ports = [
  kept("server B", "5435", 5435),
  missing<number>(),
  refused<number>("empty", ""),
  kept("the least port", "1", 1),
  kept("the greatest port", "65535", 65_535),
  refused<number>("not a number", "x"),
  refused<number>("zero", "0"),
  refused<number>("past the greatest port", "65536"),
  refused<number>("a fraction", "54.3"),
  refused<number>("negative", "-1"),
] as const;

/**
 * The longest database whose name, as its role prefix, leaves the scratch login's role within 63
 * bytes.
 */
const longestInstalled = "a".repeat(63 - "__".length - roleNameOf(rootLogin, {}).length);

/**
 * `QTI_PIE_PG_DATABASE`: unset or empty is refused, and a name is kept exactly when it is a
 * lowercase letter, then at most 62 lowercase letters, digits or underscores, with no `__` and not
 * starting with `pg_`. Every kept name is a role prefix grizzle accepts, its roles within 63 bytes
 * as far as {@link longestInstalled}, so the scratch folders name each one's role by `roleNameOf`.
 */
const databases = [
  kept("qti_pie", "qti_pie", "qti_pie"),
  missing<string>(),
  refused<string>("empty", ""),
  kept("the swarm's", "qti_pie_swarm", "qti_pie_swarm"),
  kept("one letter", "a", "a"),
  kept("the longest installed", longestInstalled, longestInstalled),
  refused<string>("an uppercase letter", "Qti_pie"),
  refused<string>("a leading digit", "8des"),
  refused<string>("a leading underscore", "_qti_pie"),
  refused<string>("a doubled underscore", "qti__pie"),
  refused<string>("PostgreSQL's reserved pg_", "pg_qti"),
  refused<string>("64 bytes", "a".repeat(64)),
  refused<string>("a hyphen", "gr8-des"),
] as const;

/**
 * Where the CA is: `QTI_PIE_PG_CA` unset, which is refused, or naming a file that is there, or one
 * that is not.
 */
const cas = ["unset", "a file", "a missing file"] as const;

/**
 * Where the login's password file is: the default folder under `HOME`, named by the database, or a
 * `QTI_PIE_PG_SECRETS`.
 */
const secretFolders = ["the default under HOME", "set"] as const;

/**
 * One case of the box: a variant of each setting.
 */
interface Settings {
  readonly ca: (typeof cas)[number];
  readonly database: Variant<string>;
  readonly host: Variant<string>;
  readonly port: Variant<number>;
  readonly secrets: (typeof secretFolders)[number];
}

/**
 * The settings that meet in a case: the database name meets the CA and the secrets folder, since
 * a refused name is refused before the CA is read and a login's password file lies under the
 * name's folder; the port meets the CA, since a refused port is refused before the CA is read; and
 * the host meets nothing, each setting read apart from the others. So each case varies one of them
 * over those it meets, the others at their first, kept variant (the host's CA a file, so both
 * connections build), the small box in which every interaction the connections have occurs.
 */
const settingsAxes = ["database", "port", "host"] as const;

/**
 * Draw a case: one axis of {@link settingsAxes}, and every variant of that axis's settings.
 */
const settingsOf: Gen<Settings> = (source) => {
  const axis = source.draw(element(settingsAxes));
  const database = axis === "database" ? source.draw(element(databases)) : databases[0];
  const port = axis === "port" ? source.draw(element(ports)) : ports[0];
  const host = axis === "host" ? source.draw(element(hosts)) : hosts[0];
  const ca = axis === "host" ? cas[1] : source.draw(element(cas));
  const secrets = axis === "database" ? source.draw(element(secretFolders)) : secretFolders[0];

  return { ca, database, host, port, secrets };
};

/**
 * What a case reaches: a connection built, a setting refused (malformed, or unset where it is
 * required), or the CA unreadable.
 */
type Reached = "built" | "malformed" | "no CA";

/**
 * The scratch folders a run reads: `HOME`, with a password file for every database name the script
 * keeps, the file `QTI_PIE_PG_CA` names, the folder `QTI_PIE_PG_SECRETS` names, with the login's
 * password file in each kept database's installation, and an empty folder.
 */
interface Scratch {
  readonly caFile: string;
  readonly empty: string;
  readonly home: string;
  readonly secrets: string;
}

/**
 * The CA text in the file `QTI_PIE_PG_CA` names.
 */
const namedCa = "the CA QTI_PIE_PG_CA names";

/**
 * The password in the folder `QTI_PIE_PG_SECRETS` names, written with the surrounding whitespace
 * the reader trims.
 */
const secretsPassword = "the password in QTI_PIE_PG_SECRETS";

/**
 * The password in a database's default folder under `HOME`.
 *
 * @param database - The database the folder is named by.
 * @returns The password.
 */
const homePassword = (database: string): string => `the password for ${database}`;

/**
 * Write the scratch folders of one run into a temporary folder of `work/` that the scope removes.
 *
 * @returns The folders.
 */
const scratchFolders = Effect.gen(function* scratchFolders() {
  const fs = yield* FileSystem.FileSystem;
  const root = yield* fs.makeTempDirectoryScoped({ directory: work, prefix: "db-connection-" });
  const scratch: Scratch = {
    caFile: `${root}/server-ca.pem`,
    empty: `${root}/empty`,
    home: `${root}/home`,
    secrets: `${root}/secrets`,
  };

  yield* fs.makeDirectory(scratch.home, { recursive: true });
  yield* fs.makeDirectory(scratch.empty, { recursive: true });
  yield* fs.writeFileString(scratch.caFile, namedCa);
  yield* fs.makeDirectory(scratch.secrets, { recursive: true });

  for (const database of databases) {
    if (Option.isSome(database.value)) {
      const folder = `${scratch.home}/.local/var/qti-pie/${database.value.value}`;
      const role = roleNameOf(rootLogin, { rolePrefix: database.value.value });

      yield* fs.makeDirectory(folder, { recursive: true });
      yield* fs.writeFileString(
        `${folder}/${role}.password`,
        `${homePassword(database.value.value)}\n`,
      );
      yield* fs.writeFileString(`${scratch.secrets}/${role}.password`, `  ${secretsPassword}  \n`);
    }
  }

  return scratch;
});

/**
 * The variables a case's environment holds: `HOME` always, and each other where the case sets it.
 */
interface Environment {
  QTI_PIE_PG_CA?: string;
  QTI_PIE_PG_DATABASE?: string;
  QTI_PIE_PG_HOST?: string;
  QTI_PIE_PG_MIGRATION_PASSWORD?: string;
  QTI_PIE_PG_MIGRATION_ROLE?: string;
  QTI_PIE_PG_PASSWORD_COMMAND?: string;
  QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT?: string;
  QTI_PIE_PG_PORT?: string;
  QTI_PIE_PG_SECRETS?: string;
  HOME: string;
}

/**
 * The environment of a case, each setting set only where its variant holds text.
 *
 * @param settings - The case.
 * @param scratch - The run's folders.
 * @returns The variables, `HOME`, the migration identity and its password always among them.
 */
const environmentOf = (settings: Settings, scratch: Scratch): Environment => {
  const environment: Environment = {
    HOME: scratch.home,
    QTI_PIE_PG_MIGRATION_PASSWORD: migrationPassword,
    QTI_PIE_PG_MIGRATION_ROLE: migrationRole,
  };
  const texts = [
    ["QTI_PIE_PG_DATABASE", settings.database.text],
    ["QTI_PIE_PG_HOST", settings.host.text],
    ["QTI_PIE_PG_PORT", settings.port.text],
  ] as const;

  for (const [name, text] of texts) {
    if (Option.isSome(text)) {
      environment[name] = text.value;
    }
  }

  if (settings.ca === "a file") {
    environment.QTI_PIE_PG_CA = scratch.caFile;
  }

  if (settings.ca === "a missing file") {
    environment.QTI_PIE_PG_CA = `${scratch.caFile}.missing`;
  }

  if (settings.secrets === "set") {
    environment.QTI_PIE_PG_SECRETS = scratch.secrets;
  }

  return environment;
};

/**
 * The password commands a case names, by what each does: print a role's password with whitespace
 * around it, exit 3, print only whitespace, or print one from a path that holds a space and a
 * semicolon, which a shell would split; and two settings that name no executable.
 */
const commandScripts = [
  { file: "failing.sh", text: "#!/bin/sh\nprintf 'partial'\nexit 3\n", variant: "failing" },
  {
    file: "printing.sh",
    text: "#!/bin/sh\nprintf '  password of %s  \\n' \"$1\"\n",
    variant: "printing",
  },
  { file: "silent.sh", text: "#!/bin/sh\nprintf '   \\n'\n", variant: "silent" },
  {
    file: "pass word; echo shell.sh",
    text: "#!/bin/sh\nprintf 'spaced password of %s' \"$1\"\n",
    variant: "spaced",
  },
] as const;

/**
 * Each variant of `QTI_PIE_PG_PASSWORD_COMMAND`: unset or empty, which leave the password files,
 * one of {@link commandScripts}, a path no file is at, and shell text, which names no executable.
 */
const commandVariants = [
  "unset",
  "empty",
  "printing",
  "failing",
  "silent",
  "spaced",
  "missing",
  "shell text",
] as const;

/**
 * What a password command case reaches: a password file's password, a command's password, or each
 * way a command fails.
 */
type CommandReached = "command" | "exited" | "local" | "not run" | "silent";

/**
 * The password a connection authenticates with, as grizzle reads it for one attempt.
 *
 * @param password - The connection's password.
 * @returns The password's text.
 */
const passwordText = (password: DbConnection["password"]) =>
  (Redacted.isRedacted(password) ? Effect.succeed(password) : password).pipe(
    Effect.map(Redacted.value),
  );

/**
 * A password command that counts its runs in the file beside it and prints which run it is and the
 * role it was run for.
 */
const countingScript =
  '#!/bin/sh\nruns=$(( $(cat "$0.runs" 2>/dev/null || echo 0) + 1 ))\nprintf \'%s\\n\' "$runs" > "$0.runs"\nprintf \'run %s for %s\' "$runs" "$1"\n';

/**
 * Password commands that outlive a 1-second bound, by how they take SIGTERM: each writes its
 * process ID beside it, then waits 30 seconds in a child `sleep`, which shares its process group,
 * before it would print a password.
 */
const lingeringScripts = [
  {
    file: "lingering.sh",
    text: "#!/bin/sh\necho $$ > \"$0.pid\"\nsleep 30\nprintf 'too late'\n",
    variant: "ends on SIGTERM",
  },
  {
    file: "stubborn.sh",
    text: "#!/bin/sh\ntrap '' TERM\necho $$ > \"$0.pid\"\nsleep 30\nprintf 'too late'\n",
    variant: "ignores SIGTERM",
  },
] as const;

/**
 * The live clock's cases: each lingering command once, the one that ends on SIGTERM at a login's
 * first attempt and the one that ignores it at the build of the runtime's login connection. One
 * run of the command is bounded and killed the same way wherever it runs; when each connection runs
 * it, and the bound each states, are the fake-clock cases' above.
 */
const lingeringCases = [
  { script: lingeringScripts[0], side: "login" },
  { script: lingeringScripts[1], side: "primed login" },
] as const;

/**
 * Read a connection's first attempt: the password the attempt reads.
 *
 * @param connection - The connection.
 * @param connection.password - Its password.
 * @returns The password's text.
 */
const firstAttempt = ({ password }: DbConnection) =>
  passwordText(password).pipe(Effect.map((text) => ({ password: text })));

/**
 * Test whether a value is one of the password command's errors.
 *
 * @param cause - The value.
 * @returns Whether it is an instance of one of their classes.
 */
// oxlint-disable-next-line anti-slop/no-unknown-parameters -- A guard over a `CredentialError`'s cause, which grizzle types as unknown.
const isPasswordCommandError = (cause: unknown): cause is PasswordCommandError =>
  cause instanceof PasswordCommandFailed ||
  cause instanceof PasswordCommandNotRun ||
  cause instanceof PasswordCommandSilent ||
  cause instanceof PasswordCommandTimedOut;

/**
 * The cause of a connection attempt's failure, which must be grizzle's `CredentialError`.
 *
 * @param failure - What the attempt failed with.
 * @returns The `CredentialError`'s cause where it is a password command's error, else nothing.
 */
// oxlint-disable-next-line anti-slop/no-unknown-parameters -- A test reads the failure of a `Result` it already narrowed to no type.
const attemptCause = (failure: unknown): PasswordCommandError | undefined => {
  assert.strictEqual(
    Predicate.hasProperty(failure, "_tag") ? failure._tag : undefined,
    "CredentialError",
  );

  const cause = Predicate.hasProperty(failure, "cause") ? failure.cause : undefined;

  return isPasswordCommandError(cause) ? cause : undefined;
};

/**
 * Assert that a password command's refusal is its own error, whose message, which the command line
 * prints, names the command, the role and `QTI_PIE_PG_PASSWORD_COMMAND`.
 *
 * @param refusal - The command's error.
 * @param command - The command the case set.
 * @param role - The role the command was run for.
 */
const assertReported = (
  refusal: PasswordCommandError | undefined,
  command: string,
  role: string,
): void => {
  const message = refusal?.message ?? "";

  assert.include(message, command);
  assert.include(message, role);
  assert.include(message, "QTI_PIE_PG_PASSWORD_COMMAND");
  assert.notInclude(message, "pnpm pg");
};

/**
 * Test whether any process is left in a process group: a signal 0 to the group reaches one.
 *
 * @param group - The process group's ID, its leader's process ID.
 * @returns Whether a process of the group is alive.
 */
const groupAlive = (group: number) =>
  Effect.try({
    catch: (cause) => cause,
    try: () => process.kill(-group, 0),
  }).pipe(
    Effect.as(true),
    Effect.catchIf(
      (cause) => Predicate.hasProperty(cause, "code") && cause.code === "ESRCH",
      () => Effect.succeed(false),
    ),
    Effect.orDie,
  );

/**
 * Where a case of the settings box expects a connection: its database, which is its role prefix
 * too, and its host, from the case's settings, and its port and its CA's text, by its side.
 */
interface Expected {
  readonly ca: string;
  readonly database: string;
  readonly host: string;
  readonly port: number;
}

/**
 * Assert that a connection is the server's where a case expects it, over node-postgres, opening a
 * TCP socket.
 *
 * @param connection - The connection.
 * @param expected - Where it must be.
 */
const assertAt = (connection: Omit<DbConnection, "password">, expected: Expected): void => {
  assert.strictEqual(connection.driver, pg);
  assert.strictEqual(connection.database, expected.database);
  assert.strictEqual(connection.rolePrefix, expected.database);
  assert.strictEqual(connection.transport.kind, "sslRequest");
  assert.strictEqual(connection.transport.host, expected.host);
  assert.strictEqual(connection.transport.servername, expected.host);
  assert.strictEqual(connection.transport.port, expected.port);
  assert.strictEqual(connection.transport.ca, expected.ca);

  const socket = connection.transport.open();

  assert.instanceOf(socket, net.Socket);
  socket.destroy();
};

/**
 * Assert that a build failed with Effect's `ConfigError`, naming one of the malformed settings.
 *
 * @param built - The build.
 * @param malformed - The settings the case malformed.
 */
const assertMalformed = (
  built: Result.Result<unknown, unknown>,
  malformed: readonly string[],
): void => {
  const failure = Result.isFailure(built) ? built.failure : undefined;
  const message = Predicate.hasProperty(failure, "message") ? String(failure.message) : "";

  assert.strictEqual(Object.getOwnPropertyDescriptor(failure, "_tag")?.value, "ConfigError");
  assert.isTrue(
    malformed.some((name) => message.includes(name)),
    message,
  );
};

/**
 * Assert that a build failed with a `ClusterConfigError` naming the missing file `QTI_PIE_PG_CA`
 * names, by that setting.
 *
 * @param built - The build.
 * @param scratch - The run's folders.
 */
const assertMissingCa = (built: Result.Result<unknown, unknown>, scratch: Scratch): void => {
  const failure = Result.isFailure(built) ? built.failure : undefined;

  assert.instanceOf(failure, ClusterConfigError);
  assert.strictEqual(failure.path, `${scratch.caFile}.missing`);
  assert.include(failure.message, "QTI_PIE_PG_CA");
};

/**
 * Hold a login's build in a case of the settings box whose settings are well formed: refused where
 * the CA file is missing, and else built at the setting's port, against the named CA, with the
 * password file of the case's secrets folder.
 *
 * @param settings - The case.
 * @param scratch - The run's folders.
 * @param built - The login's build.
 * @param provider - The case's settings, which its password reads.
 * @returns What the build reached.
 */
const loginReached = Effect.fnUntraced(function* loginReached(
  settings: Settings,
  scratch: Scratch,
  built: Result.Result<DbConnection, unknown>,
  provider: Layer.Layer<never>,
) {
  const database = Option.getOrThrow(settings.database.value);

  if (settings.ca === "a missing file") {
    assertMissingCa(built, scratch);

    return "no CA" as const;
  }

  assert.isTrue(Result.isSuccess(built), String(built));

  if (Result.isSuccess(built)) {
    assertAt(built.success, {
      ca: namedCa,
      database,
      host: Option.getOrThrow(settings.host.value),
      port: Option.getOrThrow(settings.port.value),
    });
    assert.notProperty(built.success, "role");
    assert.strictEqual(
      yield* passwordText(built.success.password).pipe(Effect.provide(provider)),
      settings.secrets === "set" ? secretsPassword : homePassword(database),
    );
  }

  return "built" as const;
});

/**
 * Hold the migration identity's build in a case of the settings box whose settings are well
 * formed: refused where the CA file is missing, and else built at the setting's port, as
 * `QTI_PIE_PG_MIGRATION_ROLE`, against the named CA, with the migration password the case sets.
 *
 * @param settings - The case.
 * @param scratch - The run's folders.
 * @param built - The migration identity's build.
 * @param provider - The case's settings, which its password reads.
 * @returns What the build reached.
 */
const migrationReached = Effect.fnUntraced(function* migrationReached(
  settings: Settings,
  scratch: Scratch,
  built: Result.Result<MigrationConnectionConfig, unknown>,
  provider: Layer.Layer<never>,
) {
  if (settings.ca === "a missing file") {
    assertMissingCa(built, scratch);

    return "no CA" as const;
  }

  assert.isTrue(Result.isSuccess(built), String(built));

  if (Result.isSuccess(built)) {
    assertAt(built.success, {
      ca: namedCa,
      database: Option.getOrThrow(settings.database.value),
      host: Option.getOrThrow(settings.host.value),
      port: Option.getOrThrow(settings.port.value),
    });
    assert.strictEqual(built.success.role, migrationRole);
    assert.strictEqual(
      yield* passwordText(built.success.password).pipe(Effect.provide(provider)),
      migrationPassword,
    );
  }

  return "built" as const;
});

layer(NodeServices.layer)("db/connection.ts, under scripts/db.sh's settings", (it) => {
  it.effect(
    "build both connections exactly as scripts/db.sh resolves the settings, refuse what it refuses before reading a file, a required setting unset or empty among them, naming it, and name a CA that cannot be read: every variant of each setting over the settings it meets, exhausted",
    (ctx) =>
      Effect.gen(function* everySetting() {
        const scratch = yield* scratchFolders;

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "the 13 database variants under 3 CA settings and 2 secrets folders, the 10 port variants under 3 CA settings, and the 5 host variants under a CA file, each other setting at its first, kept variant",
              caseHang: Duration.seconds(10),
              concurrency: 1,
              coverage: requiredInSpace<Reached>(["built", "malformed", "no CA"]),
              generator: settingsOf,
              literal: Formatter.format,
              oracle: { kind: "specification", name: "scripts/db.sh's QTI_PIE_PG_* block" },
              suite: "db/connection/settings",
            },
            (settings, c) =>
              Effect.gen(function* oneCase() {
                const provider = ConfigProvider.layer(
                  ConfigProvider.fromUnknown(environmentOf(settings, scratch)),
                );
                const loginBuild = yield* rootConnection.pipe(
                  Effect.result,
                  Effect.provide(provider),
                );
                const migrationBuild = yield* migrationConnection.pipe(
                  Effect.result,
                  Effect.provide(provider),
                );
                const malformed = [
                  ...(Option.isNone(settings.host.value) ? ["QTI_PIE_PG_HOST"] : []),
                  ...(Option.isNone(settings.port.value) ? ["QTI_PIE_PG_PORT"] : []),
                  ...(Option.isNone(settings.database.value) ? ["QTI_PIE_PG_DATABASE"] : []),
                  ...(settings.ca === "unset" ? ["QTI_PIE_PG_CA"] : []),
                ];

                if (malformed.length > 0) {
                  c.note("malformed");
                  assertMalformed(loginBuild, malformed);
                  assertMalformed(migrationBuild, malformed);

                  return;
                }

                c.note(yield* loginReached(settings, scratch, loginBuild, provider));
                c.note(yield* migrationReached(settings, scratch, migrationBuild, provider));
              }),
          ),
        );
      }),
    searchTimeout,
  );

  it.effect(
    "fail a connection attempt, never the build, with grizzle's CredentialError when its password is missing: the login's file present or absent, and the migration password set, empty or unset, exhausted",
    (ctx) =>
      Effect.gen(function* missingPasswords() {
        const scratch = yield* scratchFolders;

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "the login's password file present or absent, by the variable that names its folder, and the migration password set, empty or unset",
              caseHang: Duration.seconds(10),
              concurrency: 1,
              coverage: requiredInSpace<"login refused" | "migration refused" | "read">([
                "login refused",
                "migration refused",
                "read",
              ]),
              generator: (source) => ({
                file: source.draw(element(["present", "absent"] as const)),
                migration: source.draw(element(["set", "empty", "unset"] as const)),
              }),
              literal: Formatter.format,
              oracle: { kind: "specification", name: "scripts/db.sh migrate's password files" },
              suite: "db/connection/passwords",
            },
            ({ file, migration }, c) =>
              Effect.gen(function* oneCase() {
                const environment: Environment = {
                  ...serverSettings,
                  HOME: scratch.home,
                  QTI_PIE_PG_CA: scratch.caFile,
                  QTI_PIE_PG_SECRETS: file === "present" ? scratch.secrets : scratch.empty,
                };

                if (migration !== "unset") {
                  environment.QTI_PIE_PG_MIGRATION_PASSWORD =
                    migration === "set" ? migrationPassword : "";
                }

                const provider = ConfigProvider.layer(ConfigProvider.fromUnknown(environment));
                const loginSide = yield* rootConnection.pipe(Effect.provide(provider));
                const migrationSide = yield* migrationConnection.pipe(Effect.provide(provider));
                const loginPassword = yield* passwordText(loginSide.password).pipe(
                  Effect.result,
                  Effect.provide(provider),
                );
                const migrationRead = yield* passwordText(migrationSide.password).pipe(
                  Effect.result,
                  Effect.provide(provider),
                );

                if (file === "present") {
                  c.note("read");
                  assert.deepStrictEqual(loginPassword, Result.succeed(secretsPassword));
                } else {
                  c.note("login refused");
                  assert.isTrue(Result.isFailure(loginPassword));
                  assert.strictEqual(
                    Result.isFailure(loginPassword) ? loginPassword.failure._tag : undefined,
                    "CredentialError",
                  );
                }

                if (migration === "set") {
                  assert.deepStrictEqual(migrationRead, Result.succeed(migrationPassword));
                } else {
                  c.note("migration refused");

                  const failure = Result.isFailure(migrationRead)
                    ? migrationRead.failure
                    : undefined;

                  assert.strictEqual(failure?._tag, "CredentialError");
                  assert.include(String(failure?.cause), "QTI_PIE_PG_MIGRATION_PASSWORD");
                }
              }),
          ),
        );
      }),
    searchTimeout,
  );

  it.effect(
    "verify both connections against the file QTI_PIE_PG_CA names, refuse an unset or empty QTI_PIE_PG_CA, naming it, and name an unreadable CA file by its setting; migrate as QTI_PIE_PG_MIGRATION_ROLE, refused unset or empty, naming it, which a login never reads: every CA and role variant, exhausted",
    (ctx) =>
      Effect.gen(function* caAndRole() {
        const scratch = yield* scratchFolders;
        const caVariants = [
          missing<string>(),
          refused<string>("empty", ""),
          kept("a file", scratch.caFile, namedCa),
          kept("a missing file", `${scratch.caFile}.missing`, ""),
        ] as const;
        const roles = [
          missing<string>(),
          refused<string>("empty", ""),
          kept("another role", "qti_owner", "qti_owner"),
        ] as const;

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "every combination of 4 CA and 3 migration role variants",
              caseHang: Duration.seconds(10),
              concurrency: 1,
              coverage: requiredInSpace<"built" | "no CA setting" | "no role" | "unreadable">([
                "built",
                "no CA setting",
                "no role",
                "unreadable",
              ]),
              generator: (source) => ({
                ca: source.draw(element(caVariants)),
                role: source.draw(element(roles)),
              }),
              literal: Formatter.format,
              oracle: { kind: "specification", name: "scripts/db.sh's QTI_PIE_PG_* settings" },
              suite: "db/connection/server",
            },
            ({ ca, role }, c) =>
              Effect.gen(function* oneCase() {
                const environment: Environment = {
                  HOME: scratch.home,
                  QTI_PIE_PG_DATABASE: serverSettings.QTI_PIE_PG_DATABASE,
                  QTI_PIE_PG_HOST: serverSettings.QTI_PIE_PG_HOST,
                  QTI_PIE_PG_MIGRATION_PASSWORD: migrationPassword,
                  QTI_PIE_PG_PORT: serverSettings.QTI_PIE_PG_PORT,
                };

                if (Option.isSome(ca.text)) {
                  environment.QTI_PIE_PG_CA = ca.text.value;
                }

                if (Option.isSome(role.text)) {
                  environment.QTI_PIE_PG_MIGRATION_ROLE = role.text.value;
                }

                const provider = ConfigProvider.layer(ConfigProvider.fromUnknown(environment));
                const loginBuild = yield* rootConnection.pipe(
                  Effect.result,
                  Effect.provide(provider),
                );
                const migrationBuild = yield* migrationConnection.pipe(
                  Effect.result,
                  Effect.provide(provider),
                );

                if (Option.isNone(ca.value)) {
                  c.note("no CA setting");
                  assertMalformed(loginBuild, ["QTI_PIE_PG_CA"]);
                  assertMalformed(migrationBuild, ["QTI_PIE_PG_CA"]);

                  return;
                }

                if (ca.name === "a missing file") {
                  c.note("unreadable");
                  assertMissingCa(loginBuild, scratch);

                  if (Option.isSome(role.value)) {
                    assertMissingCa(migrationBuild, scratch);
                  } else {
                    assertMalformed(migrationBuild, ["QTI_PIE_PG_MIGRATION_ROLE"]);
                  }

                  return;
                }

                assert.strictEqual(
                  Result.isSuccess(loginBuild) ? loginBuild.success.transport.ca : undefined,
                  namedCa,
                );
                assert.notProperty(Result.isSuccess(loginBuild) ? loginBuild.success : {}, "role");

                if (Option.isNone(role.value)) {
                  c.note("no role");
                  assertMalformed(migrationBuild, ["QTI_PIE_PG_MIGRATION_ROLE"]);

                  return;
                }

                c.note("built");
                assert.strictEqual(
                  Result.isSuccess(migrationBuild)
                    ? migrationBuild.success.transport.ca
                    : undefined,
                  namedCa,
                );
                assert.strictEqual(
                  Result.isSuccess(migrationBuild) ? migrationBuild.success.role : undefined,
                  Option.getOrThrow(role.value),
                );
              }),
          ),
        );
      }),
    searchTimeout,
  );

  it.effect(
    "runs QTI_PIE_PG_PASSWORD_COMMAND, never a shell, with the role as its one argument, its output trimmed the password, in place of both local passwords, and refuses a run that exits otherwise than 0, whatever it printed, prints no password or names no executable, with the command's own error, whose message names the command, the role and the setting: the cause of the attempt's CredentialError, or the failure of the runtime's build, which runs it first; every variant, exhausted",
    (ctx) =>
      Effect.gen(function* passwordCommands() {
        const fs = yield* FileSystem.FileSystem;
        const scratch = yield* scratchFolders;
        for (const { file, text } of commandScripts) {
          yield* fs.writeFileString(`${scratch.secrets}/${file}`, text);
          yield* fs.chmod(`${scratch.secrets}/${file}`, 0o755);
        }

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "every variant of the password command, for the migration identity, the login and the runtime's login",
              caseHang: Duration.seconds(10),
              concurrency: 1,
              coverage: requiredInSpace<CommandReached>([
                "command",
                "exited",
                "local",
                "not run",
                "silent",
              ]),
              generator: (source) => ({
                side: source.draw(element(commandSides)),
                variant: source.draw(element(commandVariants)),
              }),
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "QTI_PIE_PG_PASSWORD_COMMAND as scripts/db.sh and the edullm sign-in run it",
              },
              suite: "db/connection/password-command",
            },
            ({ side, variant }, c) =>
              Effect.gen(function* oneCase() {
                const environment: Environment = {
                  ...serverSettings,
                  HOME: scratch.home,
                  QTI_PIE_PG_CA: scratch.caFile,
                  QTI_PIE_PG_MIGRATION_PASSWORD: migrationPassword,
                  QTI_PIE_PG_SECRETS: scratch.secrets,
                };
                const role = side === "migration" ? migrationRole : loginRole;
                if (variant === "empty") {
                  environment.QTI_PIE_PG_PASSWORD_COMMAND = "";
                }

                if (variant === "missing") {
                  environment.QTI_PIE_PG_PASSWORD_COMMAND = `${scratch.secrets}/no-such-command`;
                }

                if (variant === "shell text") {
                  environment.QTI_PIE_PG_PASSWORD_COMMAND = `echo ${role}`;
                }

                const script = commandScripts.find((named) => named.variant === variant);
                if (script !== undefined) {
                  environment.QTI_PIE_PG_PASSWORD_COMMAND = `${scratch.secrets}/${script.file}`;
                }

                const provider = ConfigProvider.layer(ConfigProvider.fromUnknown(environment));
                const read = yield* connectionOfSide(side).pipe(
                  Effect.flatMap(firstAttempt),
                  Effect.result,
                  Effect.provide(provider),
                );

                if (variant === "unset" || variant === "empty") {
                  c.note("local");
                  assert.deepStrictEqual(
                    read,
                    Result.succeed({
                      password: side === "migration" ? migrationPassword : secretsPassword,
                    }),
                  );

                  return;
                }

                if (variant === "printing" || variant === "spaced") {
                  c.note("command");
                  assert.deepStrictEqual(
                    read,
                    Result.succeed({
                      password:
                        variant === "printing"
                          ? `password of ${role}`
                          : `spaced password of ${role}`,
                    }),
                  );

                  return;
                }

                const failure = Result.isFailure(read) ? read.failure : undefined;
                const refusal = side === "primed login" ? failure : attemptCause(failure);

                if (variant === "failing") {
                  c.note("exited");
                  assert.instanceOf(refusal, PasswordCommandFailed);
                  assert.deepStrictEqual(
                    refusal instanceof PasswordCommandFailed
                      ? { exitCode: refusal.exitCode, role: refusal.role }
                      : undefined,
                    { exitCode: 3, role },
                  );
                } else if (variant === "silent") {
                  c.note("silent");
                  assert.instanceOf(refusal, PasswordCommandSilent);
                } else {
                  c.note("not run");
                  assert.instanceOf(refusal, PasswordCommandNotRun);
                }

                assertReported(refusal, environment.QTI_PIE_PG_PASSWORD_COMMAND ?? "", role);
              }),
          ),
        );
      }),
    searchTimeout,
  );

  it.effect(
    "runs the password command at each attempt of the migration identity's connection and of a login's, never when either is built, and once when the runtime's login connection is built, before any attempt, whose first attempt reads that run's password and each later one a run of its own",
    () =>
      Effect.gen(function* primedRuns() {
        const fs = yield* FileSystem.FileSystem;
        const scratch = yield* scratchFolders;
        const command = `${scratch.secrets}/counting.sh`;

        yield* fs.writeFileString(command, countingScript);
        yield* fs.chmod(command, 0o755);

        const provider = ConfigProvider.layer(
          ConfigProvider.fromUnknown({
            ...serverSettings,
            HOME: scratch.home,
            QTI_PIE_PG_CA: scratch.caFile,
            QTI_PIE_PG_PASSWORD_COMMAND: command,
            QTI_PIE_PG_SECRETS: scratch.secrets,
          }),
        );
        const runs = fs.readFileString(`${command}.runs`).pipe(
          Effect.orElseSucceed(() => ""),
          Effect.map((text) => text.trim()),
        );
        const migration = yield* migrationConnection.pipe(Effect.provide(provider));

        assert.strictEqual(yield* runs, "");
        assert.strictEqual(yield* passwordText(migration.password), `run 1 for ${migrationRole}`);
        assert.strictEqual(yield* passwordText(migration.password), `run 2 for ${migrationRole}`);

        const perAttempt = yield* rootConnection.pipe(Effect.provide(provider));

        assert.strictEqual(yield* runs, "2");
        assert.strictEqual(yield* passwordText(perAttempt.password), `run 3 for ${loginRole}`);
        assert.strictEqual(yield* passwordText(perAttempt.password), `run 4 for ${loginRole}`);

        const primed = yield* primedRootConnection.pipe(Effect.provide(provider));

        assert.strictEqual(yield* runs, "5");
        assert.strictEqual(yield* passwordText(primed.password), `run 5 for ${loginRole}`);
        assert.strictEqual(yield* runs, "5");
        assert.strictEqual(yield* passwordText(primed.password), `run 6 for ${loginRole}`);
        assert.strictEqual(yield* passwordText(primed.password), `run 7 for ${loginRole}`);
      }),
  );

  it.effect(
    "bound a password command's run by QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT, 60 seconds where unset or empty, and build both connections under any bound that is a positive duration within Node's timers, 2,147,483,647 ms, refusing every other: every variant, exhausted",
    (ctx) =>
      Effect.gen(function* commandTimeouts() {
        const fs = yield* FileSystem.FileSystem;
        const scratch = yield* scratchFolders;
        const [, printing] = commandScripts;
        const command = `${scratch.secrets}/${printing.file}`;

        yield* fs.writeFileString(command, printing.text);
        yield* fs.chmod(command, 0o755);

        const timeouts = [
          unset(defaultCommandTimeoutMs),
          kept("empty", "", defaultCommandTimeoutMs),
          kept("seconds", "90 seconds", 90_000),
          kept("a fraction of a millisecond", "1.5 millis", 2),
          kept("the greatest", "2147483647 millis", 2_147_483_647),
          refused<number>("past the greatest", "2147483648 millis"),
          refused<number>("zero", "0 seconds"),
          refused<number>("infinite", "Infinity"),
          refused<number>("not a duration", "soon"),
        ] as const;

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "every variant of QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT, for the migration identity, the login and the runtime's login",
              caseHang: Duration.seconds(10),
              concurrency: 1,
              coverage: requiredInSpace<"bounded" | "refused">(["bounded", "refused"]),
              generator: (source) => ({
                side: source.draw(element(commandSides)),
                timeout: source.draw(element(timeouts)),
              }),
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "a positive duration within Node's timers, 1 to 2,147,483,647 ms",
              },
              suite: "db/connection/password-command-timeout",
            },
            ({ side, timeout }, c) =>
              Effect.gen(function* oneCase() {
                const environment: Environment = {
                  ...serverSettings,
                  HOME: scratch.home,
                  QTI_PIE_PG_CA: scratch.caFile,
                  QTI_PIE_PG_PASSWORD_COMMAND: command,
                  QTI_PIE_PG_SECRETS: scratch.secrets,
                };
                if (Option.isSome(timeout.text)) {
                  environment.QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT = timeout.text.value;
                }

                const built = yield* connectionOfSide(side).pipe(
                  Effect.result,
                  Effect.provide(ConfigProvider.layer(ConfigProvider.fromUnknown(environment))),
                );

                if (Option.isNone(timeout.value)) {
                  c.note("refused");

                  const failure = Result.isFailure(built) ? built.failure : undefined;

                  assert.strictEqual(
                    Object.getOwnPropertyDescriptor(failure, "_tag")?.value,
                    "ConfigError",
                  );
                  assert.include(String(failure?.message), "QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT");

                  return;
                }

                c.note("bounded");
                assert.isTrue(Result.isSuccess(built), String(built));
              }),
          ),
        );
      }),
    searchTimeout,
  );
});

layer(NodeServices.layer, { excludeTestServices: true })(
  "db/connection.ts, a password command's bound on the live clock",
  (it) => {
    it.effect(
      "stop a password command its bound outlives, killing its process group, SIGKILL after a second where it ignores SIGTERM, and refuse the run with PasswordCommandTimedOut: each command, at an attempt and at a build",
      (ctx) =>
        Effect.gen(function* lingeringCommands() {
          const fs = yield* FileSystem.FileSystem;
          const scratch = yield* scratchFolders;
          for (const { file, text } of lingeringScripts) {
            yield* fs.writeFileString(`${scratch.secrets}/${file}`, text);
            yield* fs.chmod(`${scratch.secrets}/${file}`, 0o755);
          }

          return yield* searched(
            ctx,
            exhaust(
              {
                box: "a command that ends on SIGTERM at a login's first attempt, and one that ignores it at the build of the runtime's login connection, under a 1-second bound",
                caseHang: Duration.seconds(20),
                concurrency: 1,
                coverage: requiredInSpace<(typeof lingeringScripts)[number]["variant"]>([
                  "ends on SIGTERM",
                  "ignores SIGTERM",
                ]),
                generator: (source) => source.draw(element(lingeringCases)),
                literal: Formatter.format,
                oracle: {
                  kind: "specification",
                  name: "QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT, the bound of one run of the command",
                },
                suite: "db/connection/password-command-killed",
              },
              ({ script, side }, c) =>
                Effect.gen(function* oneCase() {
                  const command = `${scratch.secrets}/${script.file}`;
                  const role = loginRole;
                  const provider = ConfigProvider.layer(
                    ConfigProvider.fromUnknown({
                      ...serverSettings,
                      HOME: scratch.home,
                      QTI_PIE_PG_CA: scratch.caFile,
                      QTI_PIE_PG_PASSWORD_COMMAND: command,
                      QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT: "1 second",
                      QTI_PIE_PG_SECRETS: scratch.secrets,
                    }),
                  );
                  const started = yield* Clock.currentTimeMillis;
                  const read = yield* connectionOfSide(side).pipe(
                    Effect.flatMap(firstAttempt),
                    Effect.result,
                    Effect.provide(provider),
                  );
                  const elapsed = (yield* Clock.currentTimeMillis) - started;
                  const failure = Result.isFailure(read) ? read.failure : undefined;
                  const refusal = side === "primed login" ? failure : attemptCause(failure);
                  const group = Number((yield* fs.readFileString(`${command}.pid`)).trim());

                  c.note(script.variant);
                  assert.instanceOf(refusal, PasswordCommandTimedOut);
                  assert.deepStrictEqual(
                    refusal instanceof PasswordCommandTimedOut
                      ? { role: refusal.role, timeout: refusal.timeout }
                      : undefined,
                    { role, timeout: "1s" },
                  );
                  assertReported(refusal, command, role);
                  assert.isAtLeast(elapsed, 1000);
                  assert.isBelow(elapsed, 10_000, "the run waited for the command's 30 seconds");
                  assert.isFalse(
                    yield* groupAlive(group),
                    `process group ${String(group)} lives on`,
                  );
                }),
            ),
          );
        }),
      searchTimeout,
    );
  },
);
