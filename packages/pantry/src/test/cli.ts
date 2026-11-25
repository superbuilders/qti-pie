import { readFileSync } from "node:fs";
import path from "node:path";
import {
  ConfigProvider,
  Console,
  Effect,
  FileSystem,
  JsonSchema,
  Layer,
  Option,
  Schema,
  SchemaRepresentation,
  Stdio,
  Stream,
} from "effect";
import type { Exit } from "effect";
import type { Command } from "effect/cli";
import { ChildProcess, ChildProcessSpawner } from "effect/process";
import type { ProgramName } from "#pantry/cli/completions.ts";
import { runCli } from "#pantry/cli/run.ts";
import type { Program } from "#pantry/cli/run.ts";
import { fileScratchDirectory } from "#pantry/test/scratch.ts";

/**
 * The package folder, `packages/pantry`: where the program runs by default and where `work/` is.
 */
const packageRoot = path.resolve(import.meta.dirname, "..", "..");

/**
 * The folder that holds every copy `packageCopy` makes, `work/cli-copies-*`, the run's own, so two
 * runs at once never replace each other's copy of a package mid-test.
 */
const copiesRoot = fileScratchDirectory("cli-copies-");

/**
 * A check of a printed line against the committed JSON Schema `schema/<name>.json`, read as a
 * person's validator would read it rather than through the schema that printed the line: the
 * file is parsed as a JSON Schema 2020-12 document and the line as plain JSON.
 *
 * @param name - The schema's file name under `schema/`, without `.json`: `error`, `import`,
 *   `export` or `roundtrip`.
 * @returns Whether a line, parsed as JSON, matches the committed schema.
 */
export const matchesCommitted = (name: string): ((line: string) => boolean) => {
  const committed = Schema.is(
    SchemaRepresentation.fromJsonSchemaDocument(
      JsonSchema.fromSchemaDraft2020_12(
        Schema.decodeUnknownSync(Schema.fromJsonString(Schema.Record(Schema.String, Schema.Json)))(
          readFileSync(path.join(packageRoot, "schema", `${name}.json`), "utf-8"),
        ),
      ),
    ),
  );
  const parse = Schema.decodeUnknownSync(Schema.fromJsonString(Schema.Json));

  return (line) => committed(parse(line));
};

/**
 * Run a program on `args` in this process, through the same runner as the process, with the console
 * captured in place of the terminal.
 *
 * @param program - The program to run: `qti` (`#pantry/cli.ts`), one of the programs that run a
 *   command (`#pantry/qti-import.ts` and the like), or a test's own.
 * @param args - The command line after the program's name.
 * @param env - The environment its settings read: with some, the run reads its configuration from
 *   those variables alone, in place of the process environment, so give every variable the run
 *   needs; with none, the process environment.
 * @returns How the run ended, and what it wrote with `Console.log` (standard output) and with
 *   `Console.error` (standard error), each joined by line feeds.
 */
export const captureCli = Effect.fn("test.cli.captureCli")(function* captureCli<
  Name extends string,
  Input,
  ContextInput,
  E,
  R,
>(
  program: Program<Command.Command<Name, Input, ContextInput, E, R>>,
  args: readonly string[],
  env: Option.Option<Readonly<Record<string, string>>>,
) {
  const out: string[] = [];
  const err: string[] = [];
  const exit: Exit.Exit<unknown, unknown> = yield* runCli(program, { version: "0.0.0" }).pipe(
    Effect.provide(Stdio.layerTest({ args: Effect.succeed(args) })),
    Effect.provide(
      Option.match(env, {
        onNone: () => Layer.empty,
        onSome: (variables) => ConfigProvider.layer(ConfigProvider.fromUnknown(variables)),
      }),
    ),
    Effect.provideService(
      Console.Console,
      Object.assign(Object.create(console), {
        error: (...parts: readonly unknown[]): void => {
          err.push(parts.join(" "));
        },
        log: (...parts: readonly unknown[]): void => {
          out.push(parts.join(" "));
        },
      }),
    ),
    Effect.exit,
  );

  return { exit, stderr: err.join("\n"), stdout: out.join("\n") };
});

/**
 * Each program's entry module, by the program's name, beside `src/`'s own `cli.ts`.
 */
const entryOf: Readonly<Record<ProgramName, string>> = {
  qti: "cli.ts",
  "qti-export": "qti-export.ts",
  "qti-import": "qti-import.ts",
  "qti-roundtrip": "qti-roundtrip.ts",
};

/**
 * Run a program as a child process in `packages/pantry`, as a person's shell would, and collect how
 * it ended.
 *
 * @param program - The program's name.
 * @param args - The command line after the program's name.
 * @param env - Variables laid over a copy of this process's environment, or none.
 * @returns The exit code, and what the child wrote to standard output and standard error.
 */
export const spawnCli = Effect.fn("test.cli.spawnCli")(function* spawnCli(
  program: ProgramName,
  args: readonly string[],
  env: Option.Option<Readonly<Record<string, string>>>,
) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

  return yield* Effect.scoped(
    Effect.gen(function* collect() {
      const handle = yield* spawner.spawn(
        ChildProcess.make(
          process.execPath,
          [path.resolve(import.meta.dirname, "..", entryOf[program]), ...args],
          {
            cwd: packageRoot,
            env: { ...process.env, ...Option.getOrElse(env, () => ({})) },
            stdin: "ignore",
          },
        ),
      );

      return yield* Effect.all(
        {
          code: handle.exitCode,
          stderr: Stream.mkString(Stream.decodeText(handle.stderr)),
          stdout: Stream.mkString(Stream.decodeText(handle.stdout)),
        },
        { concurrency: "unbounded" },
      );
    }),
  ).pipe(Effect.orDie);
});

/**
 * Copy the package folder `source` to `<label>` in the run's copies folder, replacing any earlier
 * copy, so a test that exports or rewrites a package works on a folder of its own.
 *
 * @param source - The package folder to copy.
 * @param label - The copy's name; it starts `copy-` and appears in one test file only.
 * @returns The absolute path of the copy.
 */
export const packageCopy = Effect.fn("test.cli.packageCopy")(function* packageCopy(
  source: string,
  label: string,
) {
  const fs = yield* FileSystem.FileSystem;
  const target = path.join(copiesRoot, label);

  yield* fs.remove(target, { force: true, recursive: true });
  yield* fs.makeDirectory(copiesRoot, { recursive: true });
  yield* fs.copy(source, target);

  return target;
});
