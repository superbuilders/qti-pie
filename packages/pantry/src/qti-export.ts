/**
 * `qti-export`, the program that writes an imported package back to files: `export`'s definition
 * (`#pantry/cli/export.ts`) run on the engine, which this module loads statically, so its graph is
 * the export's alone and `qti` never loads it.
 *
 * @module
 */
import { Effect } from "effect";
import { Command } from "effect/cli";
import { replaceWith, requireReplaceable } from "#pantry/cli/args.ts";
import { requireName, withAuthorApp } from "#pantry/cli/engine.ts";
import { ExportData, exportDefinition, reportExported } from "#pantry/cli/export.ts";
import { emitSuccess, outputMode } from "#pantry/cli/output.ts";
import { asProgram, runMain } from "#pantry/cli/run.ts";
import { exportEntries, exportPackage } from "#pantry/export/package.ts";

/**
 * Write the package named `name` to `dir`, or under `--dry-run` list what it would write
 * ({@link exportDefinition} says what each does). The exporter runs inside the database's pool
 * (`withAuthorApp`).
 */
const handleExport = Effect.fn("cli.export")(function* exportHandler({
  dir,
  dryRun,
  name,
  yes,
  zip,
}: {
  readonly dir: string;
  readonly dryRun: boolean;
  readonly name: string;
  readonly yes: boolean;
  readonly zip: boolean;
}) {
  const mode = yield* outputMode;
  const target = zip && !dir.endsWith(".zip") ? `${dir}.zip` : dir;

  const named = yield* requireName(name);
  const action = yield* requireReplaceable(target, yes);

  if (dryRun) {
    const planned = yield* withAuthorApp(exportEntries(named));
    const entries = planned.map(({ bytes, path }) => ({ bytes: bytes.byteLength, path }));
    const lines = entries.map(({ bytes, path }) => `  ${path} (${bytes} bytes)`);

    yield* emitSuccess(mode, {
      command: "export",
      data: {
        dry_run: true,
        entries,
        package: named,
        target,
        target_action: action,
      },
      dataSchema: ExportData,
      ok: true,
      text: [`would ${action} ${target} with ${entries.length} files:`, ...lines].join("\n"),
    });

    return;
  }

  const written = yield* replaceWith(target, (staged) =>
    withAuthorApp(exportPackage(named, staged)),
  );

  yield* reportExported(mode, { entries: written, package: named, target });
});

/**
 * The program: `export`'s definition, named `qti-export`, with its handler and the command line's
 * global flags, shown as `export` in what it prints.
 */
export const qtiExport = asProgram(
  Command.withHandler(exportDefinition("qti-export"), handleExport),
  "export",
);

if (import.meta.main) {
  runMain(qtiExport);
}
