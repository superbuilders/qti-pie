import { Effect, Schema } from "effect";
import { Argument, Command } from "effect/cli";
import { databaseNotChecked, dryRunFlag, requireName, requirePackage } from "#pantry/cli/args.ts";
import { withAuthorApp } from "#pantry/cli/engine.ts";
import { emitSuccess, outputMode } from "#pantry/cli/output.ts";
import type { OutputMode } from "#pantry/cli/output.ts";
import type { Imported, importPackage } from "#pantry/import/package.ts";

/**
 * What an import's write did: stored the package under its name, or found it stored already, the
 * same package under its name (`#pantry/import/package.ts` `importPackage`).
 */
type ImportOutcome = Effect.Success<ReturnType<typeof importPackage>>["outcome"];

/**
 * The text each outcome prints after the package's name, checked against the importer's
 * outcomes both ways: an outcome it gains fails to compile here until it is named, and one it loses
 * until its row goes.
 */
const outcomeText = {
  accepted: "imported",
  unchanged: "unchanged",
} as const satisfies Readonly<Record<ImportOutcome, string>>;

/**
 * The importer's outcomes, {@link outcomeText}'s keys, as the literals `--output json` prints.
 */
const importOutcomes = ["accepted", "unchanged"] as const satisfies readonly ImportOutcome[];

/**
 * What `import` returns under `--output json` when the database holds the package: its name, which
 * names it to `export`, and whether this import stored it (`accepted`) or found it stored already
 * (`unchanged`).
 */
const ImportStored = Schema.Struct({
  outcome: Schema.Literals(importOutcomes),
  package: Schema.String,
});

/**
 * What `import --dry-run` returns under `--output json`: what the package holds, and that the
 * database did not check it.
 */
const ImportPreview = Schema.Struct({
  database_checked: Schema.Literal(false),
  dry_run: Schema.Literal(true),
  package_dir: Schema.String,
  relations: Schema.Int,
  rows: Schema.Int,
});

/**
 * What `import` returns under `--output json`: the name of the package the database holds and what
 * the import did, or under `--dry-run` what the package holds.
 */
export const ImportData = Schema.Union([ImportStored, ImportPreview]);

/**
 * Print what an import did: the package's name and its outcome ({@link outcomeText}), or under
 * `--output json` the same as {@link ImportStored}.
 *
 * @param mode - The output mode the run resolved.
 * @param stored - The package's name and what the import did.
 * @returns Completes once it is printed.
 */
const reportImported = (mode: OutputMode, stored: Imported) =>
  emitSuccess(mode, {
    command: "import",
    data: { outcome: stored.outcome, package: stored.package },
    dataSchema: ImportData,
    ok: true,
    text: `${stored.package}: ${outcomeText[stored.outcome]}`,
  });

/**
 * Import the package in `dir`, a directory or a `.zip` file, under `name`, then print its name and
 * whether it was imported or unchanged ({@link outcomeText}). The name is the package's key in the
 * database, the one `export` names it by: a package's manifest identifier is unique within its
 * manifest alone (IMS Content Packaging 1.2, §6.11.4), so two packages may share one and the person
 * names each. A package the database already holds, the same package under its name, is unchanged,
 * which is success. Another package under a stored name is refused: a name is one revision for as
 * long as it stands, so a changed package takes a new name. Each media file's bytes go to the local
 * media store (`localMediaStore` of `#pantry/package/media.ts`) before the package's rows are
 * written. Under `--dry-run` it reads and checks the package, prints how much it holds and stores
 * nothing.
 *
 * A dry run is the import's own read (`previewPackage`): the package read, its documents shredded
 * and every row built, and nothing written. It does not open the database, so the database's laws
 * do not judge the rows: a package it accepts can still be refused by the real import.
 *
 * A refusal prints its rule and explanation, and, when the database gave it, where each of its laws
 * is stated (`#pantry/cli/present.ts`), and the key of the row that broke them where grizzle's
 * witness names one; where it names none, as for a foreign key, the refusal says so.
 *
 * The import reads the package once (`readPackage`), a zip as it reads a directory, then writes
 * what it read (`importPackage`); the dry run reads it the same way. The engine loads when the
 * handler runs, so `--help` and a usage error never pay for
 * it, and the importer loads inside the database's pool (`withAuthorApp`), so neither does a run
 * that cannot reach the database.
 */
export const importCommand = Command.make(
  "import",
  { dir: Argument.String("dir"), dryRun: dryRunFlag, name: Argument.String("name") },
  Effect.fn("cli.import")(function* importHandler({ dir, dryRun, name }) {
    const mode = yield* outputMode;

    yield* requirePackage(dir);

    const named = yield* requireName(name);

    if (dryRun) {
      const { previewPackage } = yield* Effect.promise(() => import("#pantry/import/preview.ts"));
      const { relations, rows } = yield* previewPackage(dir, named);

      yield* emitSuccess(mode, {
        command: "import",
        data: { database_checked: false, dry_run: true, package_dir: dir, relations, rows },
        dataSchema: ImportData,
        ok: true,
        text: `would import ${dir}: ${rows} rows in ${relations} relations; ${databaseNotChecked}`,
      });

      return;
    }

    const stored = yield* withAuthorApp(
      () =>
        Promise.all([
          import("#pantry/db/layer.ts"),
          import("#pantry/import/read.ts"),
          import("#pantry/import/package.ts"),
        ]),
      ([{ authorDb }, { readPackage }, { importPackage }]) =>
        Effect.gen(function* importOnPool() {
          const db = yield* authorDb;

          return yield* importPackage(db.workload, yield* readPackage(dir, named));
        }),
    );

    yield* reportImported(mode, stored);
  }),
).pipe(
  Command.withDescription(
    "Import the package in <dir>, a directory or a .zip file, under the name <name>, its key in the database and the name `qti export` takes, and print the name: imported; or unchanged, when the database already holds the same package under it. Another package under a stored name is refused, since a name is one revision (writes the database and the local media store; with --dry-run it reads and checks the package, writes nothing, and the database's own checks do not run)",
  ),
  Command.withExamples([
    {
      command: "qti import ./my-package my-package",
      description: "Import an unzipped package under the name my-package",
    },
    {
      command: "qti import ./my-package.zip my-package",
      description: "Import a zipped package under the name my-package",
    },
    {
      command: "qti import --dry-run ./my-package my-package",
      description: "Read and check a package without storing it",
    },
    {
      command: "qti import --output json ./my-package my-package",
      description: "Print the name and the outcome as one line of JSON",
    },
  ]),
);
