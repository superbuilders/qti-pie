import { Console, Effect } from "effect";
import { Argument, Command, Completions } from "effect/cli";

/**
 * The shells a completion script can be written for.
 */
const shells = [
  "bash",
  "zsh",
  "fish",
  "powershell",
] as const satisfies readonly Completions.Shell[];

/**
 * The command line's programs, in the order the help lists them: `qti` itself, and the program of
 * each command that runs on the engine.
 */
export const programNames = ["qti", "qti-import", "qti-export", "qti-roundtrip"] as const;

/**
 * One of the command line's programs, by name.
 */
export type ProgramName = (typeof programNames)[number];

/**
 * Print the completion script of one program for one shell (`qti completions <program> <shell>`):
 * `bash`, `zsh`, `fish` or `powershell`.
 *
 * It reads no configuration and no database. The programs' command trees arrive through a function
 * so this module never imports `qti`'s root, which imports it, and each is a definition with no
 * handler, so no engine loads.
 *
 * @param programs - Each program's command tree, by name, read when the command runs.
 * @returns The `completions` command.
 */
export const completionsCommand = (
  programs: () => Readonly<Record<ProgramName, Command.Command.Any>>,
) =>
  Command.make(
    "completions",
    {
      program: Argument.Literals("program", programNames),
      shell: Argument.Literals("shell", shells),
    },
    Effect.fn("cli.completions")(function* completionsHandler({ program, shell }) {
      yield* Console.log(
        Completions.generate(program, shell, Completions.fromCommand(programs()[program])),
      );
    }),
  ).pipe(
    Command.withDescription("Print a shell completion script for one of qti's programs"),
    Command.withExamples([
      {
        command: "qti completions qti-import zsh",
        description: "Print the zsh completion script of qti-import",
      },
    ]),
  );
