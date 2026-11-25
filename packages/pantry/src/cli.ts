import { Effect } from "effect";
import { CliError, Command } from "effect/cli";
import { completionsCommand } from "#pantry/cli/completions.ts";
import type { ProgramName } from "#pantry/cli/completions.ts";
import { kindExitCode } from "#pantry/cli/errors.ts";
import { exportDefinition } from "#pantry/cli/export.ts";
import { importDefinition } from "#pantry/cli/import.ts";
import { roundtripDefinition } from "#pantry/cli/roundtrip.ts";
import { asProgram, runMain } from "#pantry/cli/run.ts";
import { schemaCommand } from "#pantry/cli/schema.ts";

/**
 * What each exit code means, in the order the help prints them. Codes 0 and 130 have no kind.
 */
const exitCodeMeanings: readonly { readonly code: number; readonly meaning: string }[] = [
  { code: 0, meaning: "success" },
  { code: 1, meaning: "refused, or the work failed" },
  { code: 2, meaning: "the command line is wrong" },
  { code: 70, meaning: "a defect in qti" },
  { code: 74, meaning: "reading the package or writing the output failed" },
  { code: 78, meaning: "the local set-up is missing or unreadable" },
  { code: 130, meaning: "interrupted" },
];

/**
 * The kinds that end with `code`, from {@link kindExitCode}, so the table cannot drift from it.
 */
const kindsOf = (code: number): readonly string[] =>
  Object.entries(kindExitCode)
    .flatMap(([kind, exit]) => (exit === code ? [kind] : []))
    .toSorted();

/**
 * The root's long description: what qti does, what it writes, how it ends and where it reads.
 */
const description = [
  "Import QTI packages into the database and export them back.",
  "",
  "  Each command that does the work is a program of its own: qti-import, qti-export and",
  "  qti-roundtrip. qti prints their help (qti import --help), their completion scripts and the",
  "  schemas of what they print. qti-import and qti-roundtrip write the database; qti-export and",
  "  qti-roundtrip write files. Nothing else is written. Every input is a path, a directory or a",
  "  .zip file; none is read from standard input.",
  "",
  "  Exit codes:",
  ...exitCodeMeanings.map(({ code, meaning }) => {
    const kinds = kindsOf(code);

    return `    ${String(code).padEnd(4)}${meaning}${kinds.length === 0 ? "" : ` (${kinds.join(", ")})`}`;
  }),
].join("\n");

/**
 * A command `qti` holds only for its help: its definition, whose line `qti` refuses as a usage
 * error that names the program that runs it, `qti-<command>`, so `qti <command>` runs nothing and
 * loads no engine.
 *
 * @param command - The command's definition: `import`, `export` or `roundtrip`.
 * @returns The command, help alone.
 */
const helpOnly = <Name extends string, Input, ContextInput, E, R>(
  command: Command.Command<Name, Input, ContextInput, E, R>,
) =>
  command.pipe(
    Command.validate<Input>(() =>
      Effect.fail(
        new CliError.ValidationError({
          message: `qti ${command.name} only prints help: the program qti-${command.name} runs it, with the same arguments.`,
        }),
      ),
    ),
  );

/**
 * `qti`: the help of the command line and of each command (`import`, `export` and `roundtrip`, each
 * help alone: {@link helpOnly}), then `completions` and `schema`. It loads no engine: the programs
 * that run the commands (`#pantry/qti-import.ts`, `#pantry/qti-export.ts`,
 * `#pantry/qti-roundtrip.ts`) each load theirs.
 *
 * `completions` reads the programs when it runs; the annotation on the root it is handed keeps
 * `qti`'s own type from being circular.
 */
export const qti = asProgram(
  Command.make("qti").pipe(
    Command.withDescription(description),
    Command.withExamples([
      {
        command: "qti-import ./my-package my-package",
        description: "Import a package into the database under the name my-package",
      },
      {
        command: "qti-export ./out my-package",
        description: "Write the package imported as my-package back to files",
      },
      {
        command: "qti-roundtrip ./my-package my-package",
        description: "Import a package, export it and compare the two",
      },
      {
        command: "qti-import --output json ./my-package my-package",
        description: "Print the result as one line of JSON, for a program to read",
      },
      {
        command: "qti import --help",
        description: "Print the help of qti-import",
      },
    ]),
    Command.withSubcommands([
      helpOnly(importDefinition("import")),
      helpOnly(exportDefinition("export")),
      helpOnly(roundtripDefinition("roundtrip")),
      completionsCommand((): Readonly<Record<ProgramName, Command.Command.Any>> => ({
        qti: qti.command,
        "qti-export": asProgram(exportDefinition("qti-export"), "export").command,
        "qti-import": asProgram(importDefinition("qti-import"), "import").command,
        "qti-roundtrip": asProgram(roundtripDefinition("qti-roundtrip"), "roundtrip").command,
      })),
      schemaCommand,
    ]),
  ),
  "qti",
);

if (import.meta.main) {
  runMain(qti);
}
