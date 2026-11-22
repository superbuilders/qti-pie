/**
 * What scripts/db.sh sends psql and what it reports, with no database: a stub psql in place of
 * `GRIZZLE_PG_BIN`'s, which records the password and the connection string each connection is
 * given and connects nowhere, and stub password commands, held to the meaning src/db/connection.ts
 * gives `QTI_PIE_PG_PASSWORD_COMMAND`. Every setting the script requires is set but where a case
 * leaves one unset or empty, which the script refuses, naming it, before any psql runs.
 */
import path from "node:path";
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { Effect, FileSystem, Stream } from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/process";
import { scratchDirectory } from "#pantry/test/scratch.ts";

/**
 * The package folder, `packages/pantry`, which scripts/db.sh runs from.
 */
const packageRoot = path.resolve(import.meta.dirname, "..", "..");

/**
 * A psql that appends the password and the connection string it was given to `psql.log` beside
 * its folder, and prints nothing, as a query that finds no row does.
 */
const stubPsql = `#!/bin/sh
printf 'PGPASSWORD=%s %s\\n' "$PGPASSWORD" "$6" >> "$(dirname "$0")/../psql.log"
`;

/**
 * A grizzle config with grizzle.config.ts's connection over a scratch installation, as small as
 * grizzle builds one, written beside a case's stub psql (`work/` is inside the package, so its
 * `#pantry/` import resolves): grizzle migrate builds the connection before it reads a migration,
 * and loading `Qti` would only stand between the script and the connection the case observes.
 */
const probeConfig = `import { defineConfig, natural, relation, schema } from "@bjornpagen/grizzle";
import { migrationConnectionNow } from "#pantry/db/connection.ts";

export default defineConfig({
  connection: migrationConnectionNow,
  logins: [],
  migrations: "migrations",
  schemas: [schema("ConnectionProbe", [relation("Probe", { id: natural }, ["id"])], [])],
});
`;

/**
 * The variables of the process the tests run in that scripts/db.sh or the grizzle config reads,
 * removed from each run, so only a case's own settings reach it. Every default the script derives
 * from `HOME` is set.
 */
const cleared = {
  QTI_PIE_GRIZZLE_CONFIG: undefined,
  QTI_PIE_PG_DATABASE: undefined,
  QTI_PIE_PG_HOST: undefined,
  QTI_PIE_PG_MIGRATION_PASSWORD: undefined,
  QTI_PIE_PG_PASSWORD_COMMAND: undefined,
  QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT: undefined,
} as const;

/**
 * The migration identity every case names, a lane's owner role.
 */
const migrationRole = "qti_migrator";

/**
 * The settings scripts/db.sh requires, and a subcommand that requires it: every subcommand the
 * host, the port, the CA, the database, the migration identity and, with no password command, its
 * password file, and `create` alone the template.
 */
const requiredSettings = [
  { setting: "QTI_PIE_PG_HOST", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_PORT", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_CA", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_DATABASE", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_MIGRATION_ROLE", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_MIGRATION_PASSWORD_FILE", subcommand: "check-clear" },
  { setting: "QTI_PIE_PG_TEMPLATE", subcommand: "create" },
] as const;

/**
 * A case's scratch folder, with the stub psql in `bin/`, a CA file that only exists, the migration
 * identity's password file and an empty secrets folder.
 */
const scriptScratch = Effect.gen(function* scriptScratch() {
  const fs = yield* FileSystem.FileSystem;
  const root = yield* scratchDirectory("db-script-");
  const bin = `${root}/bin`;

  yield* fs.makeDirectory(bin);
  yield* fs.writeFileString(`${bin}/psql`, stubPsql);
  yield* fs.chmod(`${bin}/psql`, 0o755);
  yield* fs.writeFileString(`${root}/ca.crt`, "a CA that is only read by psql, which is a stub\n");
  yield* fs.writeFileString(`${root}/owner.password`, "the-file-password\n");

  /**
   * The lines the stub psql logged, one per connection, none where it never ran.
   */
  const psqlRuns = fs.readFileString(`${root}/psql.log`).pipe(
    Effect.map((text) => text.split("\n").filter((line) => line !== "")),
    Effect.orElseSucceed((): readonly string[] => []),
  );

  /**
   * Write an executable password command into the scratch folder.
   *
   * @param name - Its file name.
   * @param body - Its shell text after the `#!/bin/sh` line.
   * @returns Its path.
   */
  const command = Effect.fn("test.dbScript.command")(function* command(name: string, body: string) {
    const file = `${root}/${name}`;

    yield* fs.writeFileString(file, `#!/bin/sh\n${body}\n`);
    yield* fs.chmod(file, 0o755);

    return file;
  });

  return {
    ca: `${root}/ca.crt`,
    command,
    environment: {
      ...cleared,
      GRIZZLE_PG_BIN: bin,
      QTI_PIE_PG_CA: `${root}/ca.crt`,
      QTI_PIE_PG_DATABASE: "qti_pie",
      QTI_PIE_PG_HOST: "localhost",
      QTI_PIE_PG_MIGRATION_PASSWORD_FILE: `${root}/owner.password`,
      QTI_PIE_PG_MIGRATION_ROLE: migrationRole,
      QTI_PIE_PG_PORT: "1",
      QTI_PIE_PG_SECRETS: `${root}/secrets`,
      QTI_PIE_PG_TEMPLATE: "the_template",
    },
    psqlRuns,
    root,
  };
});

/**
 * Run scripts/db.sh with one subcommand under the environment given, and collect how it ended.
 *
 * @param subcommand - `create`, `migrate`, `drop` or `check-clear`.
 * @param environment - The variables set or removed for the run.
 * @returns The exit code and what the script wrote to standard error and standard output.
 */
const runScript = Effect.fn("test.dbScript.run")(function* runScript(
  subcommand: string,
  environment: Readonly<Record<string, string | undefined>>,
) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

  return yield* Effect.scoped(
    Effect.gen(function* collect() {
      const handle = yield* spawner.spawn(
        ChildProcess.make(path.join(packageRoot, "scripts", "db.sh"), [subcommand], {
          cwd: packageRoot,
          env: environment,
          extendEnv: true,
          stdin: "ignore",
        }),
      );

      return yield* Effect.all(
        {
          code: handle.exitCode.pipe(Effect.map((code): number => code)),
          stderr: Stream.mkString(Stream.decodeText(handle.stderr)),
          stdout: Stream.mkString(Stream.decodeText(handle.stdout)),
        },
        { concurrency: "unbounded" },
      );
    }),
  ).pipe(Effect.orDie);
});

/**
 * The password commands whose run gives no password, by the shell text after `#!/bin/sh`, and the
 * exit code the script must report: a run that exits otherwise than 0 is refused whatever it
 * printed, as src/db/connection.ts's `PasswordCommandFailed` refuses it, and one that exits 0 with
 * nothing but whitespace as its `PasswordCommandSilent` does. Every subcommand refuses through the
 * same `as_owner`, so each command is run through `create`, which loads no config, and the first
 * through `check-clear` too, which exits 2 where it cannot read the server's catalog.
 */
const refusedCommands = [
  {
    body: "printf 'half a password'\nexit 3",
    exitCode: 3,
    name: "exits 3 after printing part of a password",
    subcommands: [
      ["create", 1],
      ["check-clear", 2],
    ],
  },
  {
    body: "echo 'error: not signed in'\nexit 1",
    exitCode: 1,
    name: "exits 1 with an error on standard output",
    subcommands: [["create", 1]],
  },
  {
    body: "printf '  \\n'",
    exitCode: 0,
    name: "exits 0 printing only whitespace",
    subcommands: [["create", 1]],
  },
] as const;

layer(NodeServices.layer, { excludeTestServices: true })(
  "scripts/db.sh, its password command and its CA, with no database",
  (it) => {
    for (const refused of refusedCommands) {
      it.effect(
        `refuses a password command that ${refused.name}, naming its exit code, the command and the role, and starts no psql`,
        () =>
          Effect.gen(function* refusedCommand() {
            const scratch = yield* scriptScratch;
            const command = yield* scratch.command("password.sh", refused.body);
            const environment = { ...scratch.environment, QTI_PIE_PG_PASSWORD_COMMAND: command };

            for (const [subcommand, code] of refused.subcommands) {
              const run = yield* runScript(subcommand, environment);

              assert.strictEqual(run.code, code, `${subcommand}: ${run.stderr}`);
              assert.include(
                run.stderr,
                `The password command ${command} exited with code ${refused.exitCode} for the role ${migrationRole}`,
              );
              assert.include(run.stderr, "QTI_PIE_PG_PASSWORD_COMMAND");
              assert.notInclude(run.stdout, "half a password");
              assert.notInclude(run.stderr, "half a password");
            }

            assert.deepStrictEqual(yield* scratch.psqlRuns, []);
          }),
      );
    }

    it.effect(
      "sends psql the password a command prints, trimmed, on every connection, verifying against QTI_PIE_PG_CA",
      () =>
        Effect.gen(function* printedPassword() {
          const scratch = yield* scriptScratch;
          const command = yield* scratch.command(
            "password.sh",
            `[ "$1" = ${migrationRole} ] || exit 9\nprintf '  the-password \\n'`,
          );
          const run = yield* runScript("create", {
            ...scratch.environment,
            QTI_PIE_PG_PASSWORD_COMMAND: command,
          });

          assert.strictEqual(run.code, 0, run.stderr);
          assert.strictEqual(run.stdout, "qti_pie: created\n");

          const runs = yield* scratch.psqlRuns;

          assert.lengthOf(runs, 2);

          for (const line of runs) {
            assert.isTrue(line.startsWith("PGPASSWORD=the-password "), line);
            assert.include(line, `sslrootcert=${scratch.ca}`);
          }
        }),
    );

    it.effect(
      "checks a dropped database clear through the server's catalog alone, never connecting to the database it drops",
      () =>
        // Oracle: drop removes the database, so a check that connects to it can only fail; the
        // stub psql's log names every database a connection was opened to, and its empty answer
        // is a server that holds neither the database nor a role of its installation.
        Effect.gen(function* clearAfterDrop() {
          const scratch = yield* scriptScratch;
          const command = yield* scratch.command("password.sh", "echo the-password");
          const run = yield* runScript("check-clear", {
            ...scratch.environment,
            QTI_PIE_PG_DATABASE: "qti_pie_gone",
            QTI_PIE_PG_PASSWORD_COMMAND: command,
          });

          assert.strictEqual(run.code, 0, run.stderr);
          assert.strictEqual(run.stdout, "");

          const runs = yield* scratch.psqlRuns;

          assert.isNotEmpty(runs);

          for (const line of runs) {
            assert.include(line, " dbname=postgres ");
            assert.notInclude(line, "qti_pie_gone");
          }
        }),
    );

    it.effect(
      "gives grizzle migrate the CA file it gives psql, which the config reads from QTI_PIE_PG_CA and names when it cannot read it",
      () =>
        // Bound: one grizzle migrate of the probe config, whose connection, grizzle.config.ts's,
        // reads the CA from QTI_PIE_PG_CA alone, so the script must export it; the config's own
        // reading of the variable is db/connection.test.ts's.
        Effect.gen(function* exportedCa() {
          const fs = yield* FileSystem.FileSystem;
          const scratch = yield* scriptScratch;
          const command = yield* scratch.command("password.sh", "echo the-password");
          const missing = `${scratch.root}/no-such-ca.crt`;
          const config = `${scratch.root}/grizzle.config.ts`;
          const environment = {
            ...scratch.environment,
            QTI_PIE_GRIZZLE_CONFIG: config,
            QTI_PIE_PG_CA: missing,
            QTI_PIE_PG_PASSWORD_COMMAND: command,
          };

          yield* fs.writeFileString(config, probeConfig);

          const run = yield* runScript("migrate", environment);

          assert.notStrictEqual(run.code, 0);
          assert.include(
            run.stderr,
            `Cannot read the database's CA certificate at ${missing}, the file QTI_PIE_PG_CA names.`,
          );

          yield* runScript("create", environment);

          const runs = yield* scratch.psqlRuns;

          assert.lengthOf(runs, 2);

          for (const line of runs) {
            assert.include(line, `sslrootcert=${missing}`);
          }
        }),
    );

    it.effect(
      "refuses each required setting left unset or empty with exit 2, naming it, before any psql runs",
      () =>
        // Oracle: the script's own rule, every QTI_PIE_PG_* setting required and none defaulted to
        // a server it would bring up; the stub psql's log shows that no subcommand connected.
        Effect.gen(function* requiredRefused() {
          const scratch = yield* scriptScratch;
          const cases = [
            ...requiredSettings.map(({ setting, subcommand }) => ({
              setting,
              subcommand,
              text: undefined,
            })),
            ...requiredSettings.map(({ setting, subcommand }) => ({
              setting,
              subcommand,
              text: "",
            })),
          ];

          for (const { setting, subcommand, text } of cases) {
            const run = yield* runScript(subcommand, { ...scratch.environment, [setting]: text });

            assert.strictEqual(run.code, 2, `${setting}=${String(text)}: ${run.stderr}`);
            assert.include(run.stderr, `${setting} is unset`, setting);
          }

          assert.deepStrictEqual(yield* scratch.psqlRuns, []);
        }),
    );
  },
);
