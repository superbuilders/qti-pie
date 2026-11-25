/**
 * `qti-roundtrip`, the program that imports a package, exports it and compares the two:
 * `roundtrip`'s definition (`#pantry/cli/roundtrip.ts`) run on the engine, which this module loads
 * statically, so its graph is the round trip's alone and `qti` never loads it.
 *
 * @module
 */
import { Effect, Path } from "effect";
import { Command } from "effect/cli";
import {
  databaseNotChecked,
  replaceWith,
  requirePackage,
  requireReplaceable,
} from "#pantry/cli/args.ts";
import { requireName, withAuthorApp } from "#pantry/cli/engine.ts";
import { RoundtripDiffers } from "#pantry/cli/errors.ts";
import { emitSuccess, outputMode } from "#pantry/cli/output.ts";
import type { OutputMode } from "#pantry/cli/output.ts";
import {
  RoundtripData,
  roundtripDefinition,
  RoundtripEntry,
  RoundtripSummary,
} from "#pantry/cli/roundtrip.ts";
import { asProgram, runMain } from "#pantry/cli/run.ts";
import { authorDb } from "#pantry/db/layer.ts";
import { byPath, compareSource, renderReport } from "#pantry/export/compare.ts";
import type { Report } from "#pantry/export/compare.ts";
import { exportPackage } from "#pantry/export/package.ts";
import { importPackage } from "#pantry/import/package.ts";
import { previewPackage } from "#pantry/import/preview.ts";
import { readPackage } from "#pantry/import/read.ts";

/**
 * Print how the export of a stored package compares with it, then fail with
 * {@link RoundtripDiffers} where an entry differs.
 *
 * @param mode - The output mode the run resolved.
 * @param compared - The comparison and where it was made.
 * @param compared.exportDir - Where the export was written.
 * @param compared.report - The comparison of every entry.
 * @param compared.stored - The stored package's name.
 * @returns Completes once it is printed. Fails with `RoundtripDiffers` where an entry differs.
 */
const reportRoundtrip = Effect.fnUntraced(function* reportRoundtrip(
  mode: OutputMode,
  compared: { readonly exportDir: string; readonly report: Report; readonly stored: string },
) {
  const { exportDir, report, stored } = compared;
  const differing = report.filter(({ outcome }) => outcome.kind === "differs").length;

  yield* emitSuccess(mode, {
    command: "roundtrip",
    data: { differing, entries: report, export_dir: exportDir, package: stored },
    dataSchema: RoundtripData,
    ok: differing === 0,
    stream: {
      lineSchema: RoundtripEntry,
      lines: report,
      summary: { differing, export_dir: exportDir, package: stored },
      summarySchema: RoundtripSummary,
    },
    text: renderReport(report),
  });

  if (differing > 0) {
    yield* new RoundtripDiffers({ differing, exportDir });
  }
});

/**
 * Import the package in `dir` under `name`, export it to `work/export/<name>` and compare the two,
 * or under `--dry-run` read and check it and say where the export would go
 * ({@link roundtripDefinition} says what each does). The import, the export and the comparison
 * share one pool (`withAuthorApp`).
 */
const handleRoundtrip = Effect.fn("cli.roundtrip")(function* roundtripHandler({
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

  yield* requirePackage(dir);

  const named = yield* requireName(name);
  const path = yield* Path.Path;
  const exportDir = path.join("work", "export", zip ? `${named}.zip` : named);

  const action = yield* requireReplaceable(exportDir, yes);

  if (dryRun) {
    const { relations, rows } = yield* previewPackage(dir, named);

    yield* emitSuccess(mode, {
      command: "roundtrip",
      data: {
        database_checked: false,
        dry_run: true,
        export_dir: exportDir,
        export_dir_action: action,
        package_dir: dir,
        relations,
        rows,
      },
      dataSchema: RoundtripData,
      ok: true,
      text: `would import ${dir}: ${rows} rows in ${relations} relations, then ${action} ${exportDir}; ${databaseNotChecked}`,
    });

    return;
  }

  const { report, stored } = yield* withAuthorApp(
    Effect.gen(function* roundtripOnPool() {
      const db = yield* authorDb;
      const pkg = yield* readPackage(dir, named);
      const imported = yield* importPackage(db.workload, pkg);
      const source = new Map(
        yield* Effect.forEach([...pkg.files], ([entryPath, file]) =>
          Effect.map(
            Effect.promise(() => file.bytes()),
            (bytes) => [entryPath, bytes] as const,
          ),
        ),
      );
      const compared = yield* replaceWith(exportDir, (written) =>
        Effect.flatMap(exportPackage(imported.package, written), (entries) =>
          compareSource(source, byPath(entries)),
        ),
      );

      return { report: compared, stored: imported.package };
    }),
  );

  yield* reportRoundtrip(mode, { exportDir, report, stored });
});

/**
 * The program: `roundtrip`'s definition, named `qti-roundtrip`, with its handler and the command
 * line's global flags, shown as `roundtrip` in what it prints.
 */
export const qtiRoundtrip = asProgram(
  Command.withHandler(roundtripDefinition("qti-roundtrip"), handleRoundtrip),
  "roundtrip",
);

if (import.meta.main) {
  runMain(qtiRoundtrip);
}
