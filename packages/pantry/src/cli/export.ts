import { Effect, Schema } from "effect";
import { Argument, Command } from "effect/cli";
import {
  dryRunFlag,
  replaceWith,
  requireName,
  requireReplaceable,
  yesFlag,
  zipFlag,
} from "#pantry/cli/args.ts";
import { withAuthorApp } from "#pantry/cli/engine.ts";
import { emitSuccess, outputMode } from "#pantry/cli/output.ts";
import type { OutputMode } from "#pantry/cli/output.ts";
import type { ZipEntry } from "#pantry/package/zip.ts";

/**
 * One file `export` wrote: its path inside the package and its size.
 */
const ExportEntry = Schema.Struct({ bytes: Schema.Int, path: Schema.String });

/**
 * What `export` returns under `--output json`: the package's name, where it was
 * written and every file written.
 */
const ExportWritten = Schema.Struct({
  entries: Schema.Array(ExportEntry),
  package: Schema.String,
  target: Schema.String,
});

/**
 * What `export --dry-run` returns under `--output json`: the package's name, the
 * target, whether the target would be created or replaced, and every file that would be written.
 * Nothing was written.
 */
const ExportPlanned = Schema.Struct({
  dry_run: Schema.Literal(true),
  entries: Schema.Array(ExportEntry),
  package: Schema.String,
  target: Schema.String,
  target_action: Schema.Literals(["create", "replace"]),
});

/**
 * What `export` returns under `--output json`: the files it wrote, or under `--dry-run` the files
 * it would write.
 */
export const ExportData = Schema.Union([ExportPlanned, ExportWritten]);

/**
 * Print what an export wrote: nothing in text mode, which has no text for it, and under `--output
 * json` the {@link ExportWritten} data, every entry with its size.
 *
 * @param mode - The output mode the run resolved.
 * @param written - The package's name, the target, and the entries the export wrote.
 * @param written.entries - The entries, in the order the export wrote them.
 * @param written.package - The package's name.
 * @param written.target - Where they were written.
 * @returns Completes once it is printed.
 */
const reportExported = (
  mode: OutputMode,
  written: {
    readonly entries: readonly ZipEntry[];
    readonly package: string;
    readonly target: string;
  },
) =>
  emitSuccess(mode, {
    command: "export",
    data: {
      entries: written.entries.map(({ bytes, path }) => ({ bytes: bytes.byteLength, path })),
      package: written.package,
      target: written.target,
    },
    dataSchema: ExportData,
    ok: true,
  });

/**
 * Write the imported package named `name`, the name `qti import` stored it under, to `dir`, or to
 * a zip file under `--zip`.
 *
 * A target that already has something in it needs `--yes`, which replaces it, files `qti` did not
 * write included. The name and the target are checked before the database opens. The export
 * is written beside the target first and takes its place only once it is complete, so an export
 * that fails leaves the old target as it was. A symlink target is replaced, never followed.
 *
 * The engine loads when the handler runs, so `--help` and a usage error never pay for it, and the
 * exporter loads inside the database's pool (`withAuthorApp`), so neither does a run that cannot
 * reach the database. Under `--output json` it lists the entries `exportPackage` wrote, in the
 * order it wrote them, each with its size; text mode prints nothing.
 *
 * Under `--dry-run` nothing is written and the target is not touched: the entries the export would
 * write are listed with their sizes, and whether the target would be created or replaced. A dry run
 * refuses what the real run would refuse, before it opens the database: a target with something in
 * it without `--yes`, and the folders no export replaces.
 */
export const exportCommand = Command.make(
  "export",
  {
    dir: Argument.String("dir"),
    dryRun: dryRunFlag,
    name: Argument.String("name"),
    yes: yesFlag,
    zip: zipFlag,
  },
  Effect.fn("cli.export")(function* exportHandler({ dir, dryRun, name, yes, zip }) {
    const mode = yield* outputMode;
    const target = zip && !dir.endsWith(".zip") ? `${dir}.zip` : dir;

    const named = yield* requireName(name);
    const action = yield* requireReplaceable(target, yes);

    if (dryRun) {
      const planned = yield* withAuthorApp(
        () => import("#pantry/export/package.ts"),
        ({ exportEntries }) => exportEntries(named),
      );
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
      withAuthorApp(
        () => import("#pantry/export/package.ts"),
        ({ exportPackage }) => exportPackage(named, staged),
      ),
    );

    yield* reportExported(mode, { entries: written, package: named, target });
  }),
).pipe(
  Command.withDescription(
    "Export the package named <name>, the name `qti import` stored it under, to <dir>, or to the zip file <dir>.zip under --zip (writes files; --dry-run lists them, writes nothing and refuses what the real run would refuse). A <dir> that already has something in it needs --yes, which replaces it, and the old one goes only once the new export is written; a symlink is replaced, never followed",
  ),
  Command.withExamples([
    {
      command: "qti export ./out simple",
      description: "Write an imported package to the folder ./out",
    },
    {
      command: "qti export --zip ./out simple",
      description: "Write it to the zip file ./out.zip",
    },
    {
      command: "qti export --dry-run ./out simple",
      description: "List the files it would write, and write nothing",
    },
    {
      command: "qti export --output json ./out simple",
      description: "Print the files written as one line of JSON",
    },
  ]),
);
