/**
 * `qti-import`, the program that imports a QTI package into the database: `import`'s definition
 * (`#pantry/cli/import.ts`) run on the engine, which this module loads statically, so its graph is
 * the import's alone and `qti` never loads it.
 *
 * @module
 */
import { Effect } from "effect";
import { Command } from "effect/cli";
import { databaseNotChecked, requirePackage } from "#pantry/cli/args.ts";
import { requireName, withAuthorApp } from "#pantry/cli/engine.ts";
import { ImportData, importDefinition, reportImported } from "#pantry/cli/import.ts";
import { emitSuccess, outputMode } from "#pantry/cli/output.ts";
import { asProgram, runMain } from "#pantry/cli/run.ts";
import { authorDb } from "#pantry/db/layer.ts";
import { importPackage } from "#pantry/import/package.ts";
import { previewPackage } from "#pantry/import/preview.ts";
import { readPackage } from "#pantry/import/read.ts";

/**
 * Import the package in `dir` under `name`, or under `--dry-run` read and check it and print how
 * much it holds ({@link importDefinition} says what each does). The importer runs inside the
 * database's pool (`withAuthorApp`).
 */
const handleImport = Effect.fn("cli.import")(function* importHandler({
  dir,
  dryRun,
  name,
}: {
  readonly dir: string;
  readonly dryRun: boolean;
  readonly name: string;
}) {
  const mode = yield* outputMode;

  yield* requirePackage(dir);

  const named = yield* requireName(name);

  if (dryRun) {
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
    Effect.gen(function* importOnPool() {
      const db = yield* authorDb;

      return yield* importPackage(db.workload, yield* readPackage(dir, named));
    }),
  );

  yield* reportImported(mode, stored);
});

/**
 * The program: `import`'s definition, named `qti-import`, with its handler and the command line's
 * global flags, shown as `import` in what it prints.
 */
export const qtiImport = asProgram(
  Command.withHandler(importDefinition("qti-import"), handleImport),
  "import",
);

if (import.meta.main) {
  runMain(qtiImport);
}
