import { Schema } from "effect";
import { Argument, Command } from "effect/cli";
import { dryRunFlag, yesFlag, zipFlag } from "#pantry/cli/args.ts";
import type { Outcome } from "#pantry/export/compare.ts";

/**
 * The kinds of an entry's outcome, a literal list checked against the exporter's `Outcome`: a kind
 * that list names and `Outcome` lacks fails to compile here, and a kind `Outcome` gains makes the
 * handler's report unassignable to {@link RoundtripData}.
 */
const outcomeKinds = [
  "canonical-equal",
  "byte-identical",
  "differs",
] as const satisfies readonly Outcome["kind"][];

/**
 * How one entry of the export compares with the package: equal as canonical XML, equal byte for
 * byte, or different, with `at` saying where. The first two are equal: an export writes each
 * element's namespace declarations and attributes in Canonical XML's order, so an entry that wrote
 * them in another order comes back `canonical-equal`, the same document.
 */
const RoundtripOutcome = Schema.Union([
  Schema.Struct({ kind: Schema.Literal(outcomeKinds[0]) }),
  Schema.Struct({ kind: Schema.Literal(outcomeKinds[1]) }),
  Schema.Struct({ at: Schema.String, kind: Schema.Literal(outcomeKinds[2]) }),
]);

/**
 * One entry of the comparison: its path and its outcome.
 */
export const RoundtripEntry = Schema.Struct({ outcome: RoundtripOutcome, path: Schema.String });

/**
 * What `roundtrip` prints under `--output jsonl` after its entries: everything but them, the
 * package named by its name.
 */
export const RoundtripSummary = Schema.Struct({
  differing: Schema.Int,
  export_dir: Schema.String,
  package: Schema.String,
});

/**
 * What `roundtrip` returns under `--output json` when it ran: the package, where it was exported,
 * how many entries differ and the comparison of every entry.
 */
const RoundtripReport = Schema.Struct({
  ...RoundtripSummary.fields,
  entries: Schema.Array(RoundtripEntry),
});

/**
 * What `roundtrip --dry-run` returns under `--output json`: what the package holds, where the
 * export would go and whether that replaces something, and that the database did not check it.
 */
const RoundtripPreview = Schema.Struct({
  database_checked: Schema.Literal(false),
  dry_run: Schema.Literal(true),
  export_dir: Schema.String,
  export_dir_action: Schema.Literals(["create", "replace"]),
  package_dir: Schema.String,
  relations: Schema.Int,
  rows: Schema.Int,
});

/**
 * What `roundtrip` returns under `--output json`: its report, or under `--dry-run` what it would
 * do.
 */
export const RoundtripData = Schema.Union([RoundtripReport, RoundtripPreview]);

/**
 * The definition of `roundtrip`, as the command `commandName`: import the package in `dir` under
 * `name`, export it to `work/export/<name>/` (`<name>.zip` under `--zip`), and print how the export
 * compares with the package the import read.
 *
 * The comparison is the exporter's `compareSource`: every entry's bytes as the import read them
 * against the entries the export of the stored package wrote, path by path, so the stored
 * documents are scanned once. An entry is `byte-identical` when its bytes come back exactly and
 * `canonical-equal` when an XML entry's bytes differ but its canonical forms agree, as they do for
 * a document that wrote its attributes or namespace declarations in another order than Canonical
 * XML's: both are equal. Any other entry differs, `at` saying where: `missing` for an entry the
 * export lacks, `extra` for one only the export writes, or the first differing byte.
 *
 * A package the database already holds, the same package under its name, imports unchanged and is
 * exported and compared as one just imported is; another package under a stored name is refused,
 * so the package stored under the name is always the one the import read.
 *
 * An export already at `work/export/<name>` needs `--yes`, which replaces it, and the old one goes
 * only once the new export is written and compared.
 *
 * Under `--dry-run` it reads and checks the package, says whether the export would be created or
 * would replace one, and writes nothing. Every refusal of the real run before its first write is
 * raised too: an earlier export without `--yes`, and a protected target.
 *
 * The definition holds no handler: `qti-roundtrip` (`#pantry/qti-roundtrip.ts`) runs it on the
 * engine, the import, the export and the comparison on one pool, and `qti` holds it only for its
 * help and completions, so `qti` never loads the engine.
 *
 * @param commandName - The command's name: `roundtrip` under `qti`, `qti-roundtrip` as its own
 *   program.
 * @returns The command, with no handler.
 */
export const roundtripDefinition = <Name extends string>(commandName: Name) =>
  Command.make(commandName, {
    dir: Argument.String("dir"),
    dryRun: dryRunFlag,
    name: Argument.String("name"),
    yes: yesFlag,
    zip: zipFlag,
  }).pipe(
    Command.withDescription(
      "Import <dir> under the name <name>, export it to work/export/<name> (<name>.zip under --zip), and compare the export with the package the import read (writes the database, the local media store and work/export/<name>; with --dry-run it reads and checks the package, says whether the export would be created or replaced, and writes nothing, and the database's own checks do not run). An export already at work/export/<name> is replaced only with --yes, and the old one goes once the new export is written",
    ),
    Command.withExamples([
      {
        command: "qti-roundtrip ./my-package my-package",
        description: "Import a package, export it again and compare the two",
      },
      {
        command: "qti-roundtrip --zip ./my-package.zip my-package",
        description: "Do the same with a zipped package, writing the export as a zip file",
      },
      {
        command: "qti-roundtrip --dry-run ./my-package my-package",
        description: "Read and check a package and say where the export would go, writing nothing",
      },
      {
        command: "qti-roundtrip --output jsonl ./my-package my-package",
        description: "Print one line of JSON per entry, then a summary line",
      },
    ]),
  );
