/**
 * Renders every item of 1EdTech's QTI 3 example corpus and of the local QTI database snapshot
 * with plate's `<Item>`, at two checkouts, and reports which renders differ: plate's render diff.
 *
 * From the repository's root, a lane proves exactly its own change before it commits it:
 *
 * ```sh
 * node packages/qti-pie/packages/plate/scripts/render-diff.ts --run <lane>-<n> --paths <its files>…
 * ```
 *
 * The before is `HEAD`, and the after is `HEAD` with only the files those paths name taken from
 * the working tree, new and deleted files included: a commit built in a temporary index
 * (`read-tree HEAD`, `update-index --add --remove`, `write-tree`, `commit-tree`), so the other
 * edits in the shared working tree play no part. The other forms:
 *
 * ```sh
 * node packages/qti-pie/packages/plate/scripts/render-diff.ts [--before <commit>] [--after <commit> | --paths <path>…] [--run <name>] [--source corpus|snapshot]… [--processes <n>]
 * ```
 *
 * `--before` is the commit compared against, `HEAD` when left out. `--after` is a commit to
 * compare; with neither it nor `--paths`, the after is the working tree as it stands, everyone's
 * edits in it. Every commit side is checked out in a detached worktree under the run's `trees/`
 * and installed there (`pnpm install --frozen-lockfile --ignore-scripts`), and the worktree is
 * removed and pruned when the run ends. `--source` names a source to render (`sources` in
 * `render-diff/inputs.ts`), both when left out. `--run` names the run's directory under
 * `out/render-diff/`, the time it starts when left out; a run of that name is replaced.
 * `--processes` names how many processes each side renders in.
 *
 * Every accepted item is rendered in each mode of `modes` (`render-diff/protocol.ts`): answering,
 * the review of its own solution with and without the solution to mark against, the review of no
 * response, of a partly right one and of a wrong one where the harness can make them, and the
 * solution. Each render
 * runs under fixed inputs: one instance token, one configuration seed, one begin seed, and a
 * configuration whose `assets` give every file of the item's package the placeholder address
 * `/assets/<path>`. Answering renders the islands on the server, inside `<Responses>`, as Next's
 * server render does. Every plate, React and Effect function a side calls is its own checkout's,
 * loaded through Vite (`render-diff/worker.ts`); the harness, the inputs and the comparison are
 * this file's, the same for both sides.
 *
 * It writes `out/render-diff/<run>/{before,after}/<source>/<item>.<mode>.html`, each render broken
 * into one line per tag (`render-diff/lined.ts`) or, when a step failed, the step and the failure;
 * `{before,after}/verdicts.tsv`, the verdict `openAdmitted` gave every document; and `summary.txt`,
 * which it also prints: the outputs per interaction kind and mode, how many differ, which outputs
 * differ, appear or disappear, the interaction kinds and modes they are of, and a unified diff of
 * each of the first few. `diff -r` of the two side directories shows the rest. It exits with status
 * 1 when any output or verdict differs.
 *
 * **What an empty diff proves:** for every document of the sources read, both checkouts'
 * `openAdmitted` gave the same verdict, and for every accepted item, in every mode, both checkouts'
 * `<Item>` rendered the same HTML byte for byte under the same inputs, or failed at the same step
 * with the same error. It proves nothing of what the inputs do not reach: a mode or response not
 * rendered, an interaction kind neither source holds, a host prop the harness never sets
 * (`supports`, `view`, `host`), what the islands do once they hydrate, or the stylesheet.
 *
 * Each side renders in child processes, one shard of the documents each ({@link
 * defaultProcesses},
 * or as many as `--processes` names), both sides at once.
 */
import { execFileSync, fork } from "node:child_process";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { getHeapStatistics } from "node:v8";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { Console, Effect, Schema } from "effect";
import { inputsOf, sources } from "#scripts/render-diff/inputs.ts";
import type { Inputs, Source } from "#scripts/render-diff/inputs.ts";
import { modes } from "#scripts/render-diff/protocol.ts";
import type { Opened, Output, ShardOutput } from "#scripts/render-diff/protocol.ts";

/**
 * A checkout a side renders: the working tree as it stands; a commit, by its full hash; or the
 * commit `--paths` builds, `HEAD` with the paths it names taken from the working tree.
 */
type Checkout =
  | { readonly kind: "working" }
  | { readonly commit: string; readonly kind: "commit" }
  | { readonly commit: string; readonly kind: "paths"; readonly paths: readonly string[] };

/**
 * The two sides of a diff.
 */
const sides = ["before", "after"] as const;

/**
 * One of {@link sides}.
 */
type Side = (typeof sides)[number];

/**
 * The failure of a command the render diff runs: `git` or `pnpm`.
 *
 * `command` is the command line and `detail` what it wrote to its standard error.
 */
class CommandFailed extends Schema.TaggedError<CommandFailed>()("CommandFailed", {
  command: Schema.String,
  detail: Schema.String,
}) {
  /**
   * The command and its error output.
   */
  override get message(): string {
    return `${this.command} failed: ${this.detail}`;
  }
}

/**
 * The failure of a worker thread that stopped before it posted its shard's output.
 *
 * `tree` is the checkout it rendered and `detail` the error it stopped with.
 */
class ShardFailed extends Schema.TaggedError<ShardFailed>()("ShardFailed", {
  detail: Schema.String,
  tree: Schema.String,
}) {
  /**
   * The checkout and the error, and what to check: that the checkout's plate still exports what
   * `render-diff/worker.ts`'s `apiSource` imports.
   */
  override get message(): string {
    return `Rendering ${this.tree} failed: ${this.detail}. Check that its plate still exports what render-diff/worker.ts's apiSource imports.`;
  }
}

/**
 * The failure of a command line the render diff does not take.
 */
class UsageRefused extends Schema.TaggedError<UsageRefused>()("UsageRefused", {
  detail: Schema.String,
}) {
  /**
   * What was refused, and the usage.
   */
  override get message(): string {
    return `${this.detail}. Usage: render-diff.ts [--before <commit>] [--after <commit> | --paths <path>…] [--run <name>] [--source ${sources.join("|")}]… [--processes <n>]`;
  }
}

/**
 * Run a command in an environment and give its standard output.
 *
 * @param file The program.
 * @param args Its arguments.
 * @param cwd The directory it runs in.
 * @param env Its environment.
 * @returns Its standard output, trimmed; {@link CommandFailed}, with what it wrote to its standard
 *   error, when it exits other than 0. It runs synchronously: every command the render diff runs is
 *   short, and none runs while the workers render.
 */
const command = (file: string, args: readonly string[], cwd: string, env: NodeJS.ProcessEnv) =>
  Effect.try({
    catch: (cause) =>
      new CommandFailed({
        command: [file, ...args].join(" "),
        detail: cause instanceof Error ? cause.message : String(cause),
      }),
    try: () =>
      execFileSync(file, args, {
        cwd,
        encoding: "utf-8",
        env,
        maxBuffer: 2 ** 30,
        stdio: ["ignore", "pipe", "pipe"],
      }).trim(),
  });

/**
 * Run a command in this process's environment and give its standard output ({@link command}).
 *
 * @param file The program.
 * @param args Its arguments.
 * @param cwd The directory it runs in.
 * @returns Its standard output, trimmed; {@link CommandFailed} when it exits other than 0.
 */
const run = (file: string, args: readonly string[], cwd: string) =>
  command(file, args, cwd, process.env);

/**
 * The repository's root, the checkout this file runs in.
 */
const repository = run("git", ["rev-parse", "--show-toplevel"], import.meta.dirname);

/**
 * Check out a commit in a detached worktree and install it, removing the worktree when the scope
 * closes, whether the install succeeded or not.
 *
 * @param root The repository's root.
 * @param commit The commit's full hash.
 * @param at Where the worktree goes.
 * @returns The worktree's root, valid while the scope is open.
 */
const worktree = (root: string, commit: string, at: string) =>
  Effect.acquireRelease(run("git", ["worktree", "add", "--detach", at, commit], root), () =>
    run("git", ["worktree", "remove", "--force", at], root).pipe(
      Effect.andThen(run("git", ["worktree", "prune"], root)),
      Effect.orDie,
    ),
  ).pipe(
    Effect.andThen(
      run("pnpm", ["install", "--frozen-lockfile", "--ignore-scripts", "--prefer-offline"], at),
    ),
    Effect.as(at),
  );

/**
 * The identity the commit `--paths` builds is written under, so building it reads no one's git
 * configuration. The commit is referenced by nothing but the run's worktree.
 */
const builder = {
  GIT_AUTHOR_EMAIL: "render-diff@localhost",
  GIT_AUTHOR_NAME: "render-diff",
  GIT_COMMITTER_EMAIL: "render-diff@localhost",
  GIT_COMMITTER_NAME: "render-diff",
};

/**
 * Build the commit `--paths` names: `HEAD`'s tree with every file the paths match taken from the
 * working tree, in a temporary index of the run's own, as the gate builds a snapshot of a commit.
 *
 * A file the paths match is one `HEAD` holds, the shared index holds, or the working tree holds
 * untracked and not ignored; `update-index --add --remove` then takes each as the working tree has
 * it, adding a new file and removing a deleted one.
 *
 * @param root The repository's root.
 * @param runDirectory The run's directory, which holds the temporary index.
 * @param paths The paths, each from the directory the command runs in.
 * @returns The commit, a child of `HEAD`; {@link UsageRefused} when the paths match no file.
 */
const pathsCommit = (root: string, runDirectory: string, paths: readonly string[]) =>
  Effect.gen(function* buildPathsCommit() {
    const pathspec = paths.map((each) => path.relative(root, path.resolve(each)));
    const listed = yield* Effect.all([
      run("git", ["ls-tree", "-r", "-z", "--name-only", "HEAD", "--", ...pathspec], root),
      run(
        "git",
        ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", ...pathspec],
        root,
      ),
    ]);
    const files = [...new Set(listed.flatMap((each) => each.split("\0")))]
      .filter((file) => file !== "")
      .toSorted();

    if (files.length === 0) {
      return yield* new UsageRefused({ detail: `--paths ${paths.join(" ")} matches no file` });
    }

    const env = { ...process.env, ...builder, GIT_INDEX_FILE: path.join(runDirectory, "index") };

    yield* command("git", ["read-tree", "HEAD"], root, env);
    yield* command("git", ["update-index", "--add", "--remove", "--", ...files], root, env);

    const tree = yield* command("git", ["write-tree"], root, env);

    return yield* command(
      "git",
      ["commit-tree", tree, "-p", "HEAD", "-m", `render-diff --paths ${paths.join(" ")}`],
      root,
      env,
    );
  });

/**
 * The number of processes each side renders in when `--processes` names none: half the machine's
 * processors, so the two sides together take one a processor. Each shard is a process with a heap
 * of its own, so nothing but the machine bounds the count (as worker threads of one process they
 * shared one pointer-compression cage of 4 GiB, and one a processor ran it out of memory).
 */
const defaultProcesses = Math.max(1, Math.floor(availableParallelism() / 2));

/**
 * Order two strings in JavaScript's default string order, as `toSorted()` with no comparator does.
 *
 * @param a One string.
 * @param b The other.
 * @returns Negative, zero or positive, as `a` sorts before, with or after `b`.
 */
const compare = (a: string, b: string): number => Number(a > b) - Number(a < b);

/**
 * Render one side: split the documents round-robin into one shard a process and render each in
 * its own child process (`render-diff/worker.ts`), handed its shard over IPC.
 *
 * A process that stops before it sends its output fails the side, and so the run, whatever its
 * exit code: a run either compares every output of both sides or reports no diff at all.
 *
 * @param processes The number of processes.
 * @param tree The checkout's root.
 * @param out The side's directory.
 * @param inputs The documents and packages.
 * @returns Every shard's output, merged; {@link ShardFailed} when a process stops before sending.
 */
const renderSide = (processes: number, tree: string, out: string, inputs: Inputs) =>
  Effect.map(
    Effect.forEach(
      Array.from({ length: processes }, (_, shard) => shard),
      (shard) =>
        Effect.callback<ShardOutput, ShardFailed>((resume) => {
          const worker = fork(
            fileURLToPath(new URL("render-diff/worker.ts", import.meta.url)),
            [],
            {
              env: { ...process.env, NODE_ENV: "production" },
              serialization: "advanced",
            },
          );
          worker.send({
            cacheDir: path.join(out, "..", "vite", path.basename(out), String(shard)),
            documents: inputs.documents.filter((_, index) => index % processes === shard),
            out,
            packages: inputs.packages,
            tree,
          });
          worker.once("message", (output: ShardOutput) => {
            resume(Effect.succeed(output));
          });
          worker.once("error", (error) => {
            resume(
              Effect.fail(
                new ShardFailed({
                  detail: error instanceof Error ? (error.stack ?? error.message) : String(error),
                  tree,
                }),
              ),
            );
          });
          worker.once("exit", (code) => {
            resume(
              Effect.fail(
                new ShardFailed({
                  detail: `exited with ${code} before sending its output${code === 13 ? ", a top-level await that never settled" : ""}`,
                  tree,
                }),
              ),
            );
          });

          return Effect.sync(() => {
            worker.kill();
          });
        }),
      { concurrency: "unbounded" },
    ),
    (shards): ShardOutput => ({
      heap: Math.max(...shards.map((each) => each.heap)),
      opened: shards
        .flatMap((each) => each.opened)
        .toSorted((a, b) => compare(`${a.source}/${a.name}`, `${b.source}/${b.name}`)),
      outputs: shards.flatMap((each) => each.outputs).toSorted((a, b) => compare(a.path, b.path)),
    }),
  );

/**
 * Give the verdicts file of a side: one line per document, its source, its name and its verdict.
 *
 * @param opened The side's verdicts.
 * @returns The file's text.
 */
const verdictsText = (opened: readonly Opened[]): string =>
  opened.map(({ name, source, verdict }) => `${source}\t${name}\t${verdict}\n`).join("");

/**
 * How many unified diffs the summary prints, of the first outputs that differ; `diff -r` of the
 * two sides shows the rest.
 */
const diffsShown = 5;

/**
 * How many lines of each unified diff the summary prints.
 */
const diffLines = 60;

/**
 * Give the unified diff of one output between the two sides, as `git diff --no-index` writes it,
 * cut to {@link diffLines} lines. `git diff --no-index` exits 1 when the files differ, which here
 * they do, so the shell passes 0 and 1 as success and anything higher as the failure it is.
 *
 * @param runDirectory The run's directory.
 * @param file The output's path under each side's directory.
 * @returns The diff's text; {@link CommandFailed} when `git diff` fails.
 */
const unifiedDiff = (runDirectory: string, file: string) =>
  Effect.map(
    run(
      "sh",
      [
        "-c",
        'git diff --no-index --no-color -U2 -- "$1" "$2"; test $? -le 1',
        "sh",
        `before/${file}`,
        `after/${file}`,
      ],
      runDirectory,
    ),
    (stdout) => {
      const lines = stdout.split("\n");

      return [
        ...lines.slice(0, diffLines),
        ...(lines.length > diffLines ? [`… ${lines.length - diffLines} more lines`] : []),
      ].join("\n");
    },
  );

/**
 * Give the table of outputs per interaction kind and mode: each cell the number of the after
 * side's outputs, and how many of them differ from the before side's, when any do.
 *
 * @param outputs The after side's outputs.
 * @param differing The paths of the outputs that differ.
 * @returns The table's lines.
 */
const kindTable = (
  outputs: readonly Output[],
  differing: ReadonlySet<string>,
): readonly string[] => {
  const kinds = [...[...new Set(outputs.flatMap((output) => output.kinds))].toSorted(), "all"];
  const cell = (kind: string, mode: string) => {
    const counted = outputs.filter(
      (output) => output.mode === mode && (kind === "all" || output.kinds.includes(kind)),
    );
    const changed = counted.filter((output) => differing.has(output.path)).length;

    return changed === 0 ? String(counted.length) : `${counted.length} (${changed} differ)`;
  };
  const rows = [
    ["kind", ...modes],
    ...kinds.map((kind) => [kind, ...modes.map((mode) => cell(kind, mode))]),
  ];
  const widths =
    rows[0]?.map((_, column) => Math.max(...rows.map((row) => (row[column] ?? "").length))) ?? [];

  return rows.map((row) =>
    row
      .map((text, column) => text.padEnd(widths[column] ?? 0))
      .join("  ")
      .trimEnd(),
  );
};

/**
 * Give the lines that count a side's documents and the items among them it rendered, per source.
 *
 * @param opened The side's verdicts.
 * @returns One line per source it read.
 */
const countsText = (opened: readonly Opened[]): readonly string[] =>
  sources.flatMap((source) => {
    const of = opened.filter((each) => each.source === source);
    const items = of.filter((each) => /^accepted\S* item$/u.test(each.verdict)).length;

    return of.length === 0 ? [] : [`${source}: ${of.length} documents, ${items} items rendered`];
  });

/**
 * Give the lines that list some outputs under a title, none when there are none.
 *
 * @param title What the outputs are.
 * @param files Their paths.
 * @returns The lines.
 */
const listedText = (title: string, files: readonly string[]): readonly string[] =>
  files.length === 0
    ? []
    : ["", `${title} (${files.length}):`, ...files.map((file) => `  ${file}`)];

/**
 * Give a span between two `performance.now()` readings in seconds, as the summary writes it.
 *
 * @param from The earlier reading.
 * @param to The later reading.
 * @returns The span, such as `12.3 s`.
 */
const seconds = (from: number, to: number): string => `${((to - from) / 1000).toFixed(1)} s`;

/**
 * Give the lines that say which interaction kinds and modes the outputs that differ, appear or
 * disappear are of: one line per kind, each mode with its count.
 *
 * @param outputs The outputs, of either side, each path once or twice.
 * @returns The lines; none when no output differs.
 */
const whereText = (outputs: readonly Output[]): readonly string[] => {
  const paths = new Map(outputs.map((output) => [output.path, output]));
  const kinds = [...new Set([...paths.values()].flatMap((output) => output.kinds))].toSorted();

  return kinds.length === 0
    ? []
    : [
        "",
        "By interaction kind and mode:",
        ...kinds.map((kind) => {
          const of = [...paths.values()].filter((output) => output.kinds.includes(kind));
          const counted = modes.flatMap((mode) => {
            const count = of.filter((output) => output.mode === mode).length;

            return count === 0 ? [] : [`${mode} ${count}`];
          });

          return `  ${kind}: ${counted.join(", ")}`;
        }),
      ];
};

/**
 * Compare the two sides and give the summary's lines and whether anything differs.
 *
 * @param runDirectory The run's directory.
 * @param header The lines naming the run's checkouts and time.
 * @param rendered Each side's output.
 * @returns The summary's text, and whether an output or a verdict differs.
 */
const summarize = (
  runDirectory: string,
  header: readonly string[],
  rendered: Readonly<Record<Side, ShardOutput>>,
) =>
  Effect.gen(function* compareSides() {
    const before = new Map(rendered.before.outputs.map((output) => [output.path, output.digest]));
    const after = new Map(rendered.after.outputs.map((output) => [output.path, output.digest]));
    const changed = [...after].flatMap(([file, digest]) => {
      const was = before.get(file);

      return was === undefined || was === digest ? [] : [file];
    });
    const appeared = [...after.keys()].filter((file) => !before.has(file));
    const disappeared = [...before.keys()].filter((file) => !after.has(file));
    const verdictsDiffer =
      verdictsText(rendered.before.opened) !== verdictsText(rendered.after.opened);
    const diffs = yield* Effect.forEach(changed.slice(0, diffsShown), (file) =>
      unifiedDiff(runDirectory, file),
    );
    const differs =
      changed.length > 0 || appeared.length > 0 || disappeared.length > 0 || verdictsDiffer;
    const moved = new Set([...changed, ...appeared, ...disappeared]);
    const where = [...rendered.before.outputs, ...rendered.after.outputs].filter((output) =>
      moved.has(output.path),
    );
    const text = [
      ...header,
      ...countsText(rendered.after.opened),
      "",
      "Outputs per interaction kind and mode (after), and how many differ from before:",
      ...kindTable(rendered.after.outputs, new Set(changed)),
      "",
      differs
        ? `The diff is not empty: ${changed.length} outputs differ, ${appeared.length} appear, ${disappeared.length} disappear; the verdicts ${verdictsDiffer ? "differ" : "agree"}.`
        : "The diff is empty: every verdict and every output is the same on both sides.",
      ...whereText(where),
      ...listedText("Differ", changed),
      ...listedText("Appear", appeared),
      ...listedText("Disappear", disappeared),
      ...(diffs.length === 0 ? [] : ["", `The first ${diffs.length} diffs:`, ...diffs]),
      "",
    ].join("\n");

    return { differs, text };
  });

/**
 * Read the command line: the two checkouts, the run's name, the sources, and the paths `--paths`
 * takes from the working tree.
 */
const commandLine = Effect.try({
  catch: (cause) =>
    new UsageRefused({ detail: cause instanceof Error ? cause.message : String(cause) }),
  try: () =>
    parseArgs({
      allowPositionals: true,
      options: {
        after: { type: "string" },
        before: { default: "HEAD", type: "string" },
        paths: { default: false, type: "boolean" },
        processes: { type: "string" },
        run: { default: new Date().toISOString().replaceAll(":", "-"), type: "string" },
        source: { multiple: true, type: "string" },
      },
      strict: true,
    }),
});

/**
 * Give the full hash of a commit the command line names.
 *
 * @param root The repository's root.
 * @param name The commit, as `git rev-parse` reads one.
 * @returns Its hash; {@link CommandFailed} when it names no commit.
 */
const commitOf = (root: string, name: string) =>
  run("git", ["rev-parse", "--verify", `${name}^{commit}`], root);

/**
 * Give the number of processes a side renders in: the `--processes` value, a whole number of at
 * least 1, so a caller can ask for fewer or more; {@link defaultProcesses} when it names none.
 *
 * @param asked The `--processes` value, none when absent.
 * @returns The number; {@link UsageRefused} for a value that is not a whole number of at least 1.
 */
const processesOf = (asked: string | undefined) => {
  if (asked === undefined) {
    return Effect.succeed(defaultProcesses);
  }

  const processes = Number(asked);

  return Number.isInteger(processes) && processes >= 1
    ? Effect.succeed(processes)
    : Effect.fail(
        new UsageRefused({
          detail: `--processes ${asked} is not a whole number of at least 1`,
        }),
      );
};

/**
 * Give a number of bytes in mebibytes, as the summary writes it.
 *
 * @param bytes The bytes.
 * @returns The mebibytes, such as `412 MiB`.
 */
const mebibytes = (bytes: number): string => `${Math.round(bytes / 2 ** 20)} MiB`;

/**
 * Give the sources the command line asks for.
 *
 * @param asked The `--source` values, none for every source.
 * @returns The sources; {@link UsageRefused} for a name that is no source.
 */
const sourcesOf = (asked: readonly string[] | undefined) =>
  Effect.all(
    (asked ?? sources).map((name) => {
      const source = sources.find((each) => each === name);

      return source === undefined
        ? Effect.fail(new UsageRefused({ detail: `--source ${name} names no source` }))
        : Effect.succeed<Source>(source);
    }),
  ).pipe(Effect.map((each) => new Set(each)));

/**
 * Give the after side the command line asks for: the commit `--paths` builds, the commit
 * `--after` names, or the working tree.
 *
 * @param root The repository's root.
 * @param runDirectory The run's directory.
 * @param parsed The command line.
 * @returns The checkout; {@link UsageRefused} for `--paths` with `--after` or with no path, or a
 *   path without `--paths`.
 */
const afterOf = (
  root: string,
  runDirectory: string,
  parsed: Effect.Success<typeof commandLine>,
): Effect.Effect<Checkout, CommandFailed | UsageRefused> => {
  const { positionals, values } = parsed;

  if (values.paths && values.after !== undefined) {
    return Effect.fail(new UsageRefused({ detail: "--paths and --after name two afters" }));
  }

  if (values.paths) {
    return positionals.length === 0
      ? Effect.fail(new UsageRefused({ detail: "--paths names no path" }))
      : Effect.map(pathsCommit(root, runDirectory, positionals), (commit): Checkout => ({
          commit,
          kind: "paths",
          paths: positionals,
        }));
  }

  if (positionals.length > 0) {
    return Effect.fail(
      new UsageRefused({ detail: `${positionals.join(" ")}: a path is taken only after --paths` }),
    );
  }

  return values.after === undefined
    ? Effect.succeed({ kind: "working" })
    : Effect.map(commitOf(root, values.after), (commit): Checkout => ({ commit, kind: "commit" }));
};

/**
 * The render diff: read the command line, check out and install each commit side, render both
 * sides at once, compare them, and write and print the summary.
 */
const program = Effect.scoped(
  Effect.gen(function* renderDiff() {
    const started = performance.now();
    const parsed = yield* commandLine;
    const options = parsed.values;
    const root = yield* repository;
    const asked = yield* sourcesOf(options.source);
    const processes = yield* processesOf(options.processes);
    const runDirectory = path.join(root, "out", "render-diff", options.run);

    yield* Effect.promise(() => rm(runDirectory, { force: true, recursive: true }));
    yield* run("git", ["worktree", "prune"], root);
    yield* Effect.promise(() => mkdir(runDirectory, { recursive: true }));

    const checkouts: Readonly<Record<Side, Checkout>> = {
      after: yield* afterOf(root, runDirectory, parsed),
      before: { commit: yield* commitOf(root, options.before), kind: "commit" },
    };
    const treeOf = (side: Side) => {
      const checkout = checkouts[side];

      return checkout.kind === "working"
        ? Effect.succeed(root)
        : worktree(root, checkout.commit, path.join(runDirectory, "trees", side));
    };
    const { inputs, trees } = yield* Effect.all(
      {
        inputs: inputsOf(asked),
        trees: Effect.all(
          { after: treeOf("after"), before: treeOf("before") },
          { concurrency: "unbounded" },
        ),
      },
      { concurrency: "unbounded" },
    );
    const prepared = performance.now();
    const { after, before } = yield* Effect.all(
      {
        after: renderSide(processes, trees.after, path.join(runDirectory, "after"), inputs),
        before: renderSide(processes, trees.before, path.join(runDirectory, "before"), inputs),
      },
      { concurrency: "unbounded" },
    );
    const renderedAt = performance.now();

    yield* Effect.promise(() =>
      Promise.all([
        writeFile(path.join(runDirectory, "before", "verdicts.tsv"), verdictsText(before.opened)),
        writeFile(path.join(runDirectory, "after", "verdicts.tsv"), verdictsText(after.opened)),
      ]),
    );

    const named = (checkout: Checkout) => {
      switch (checkout.kind) {
        case "working": {
          return "the working tree";
        }
        case "commit": {
          return `commit ${checkout.commit}`;
        }
        case "paths": {
          return `HEAD with ${checkout.paths.join(" ")} from the working tree (commit ${checkout.commit})`;
        }
        default: {
          return checkout satisfies never;
        }
      }
    };
    const { differs, text } = yield* summarize(
      runDirectory,
      [
        `Render diff ${options.run}: before is ${named(checkouts.before)}; after is ${named(checkouts.after)}.`,
        `Outputs in ${runDirectory}/{before,after}. Prepared in ${seconds(started, prepared)}, rendered in ${seconds(prepared, renderedAt)} on ${processes} processes a side; the most heap one process held was ${mebibytes(Math.max(before.heap, after.heap))} of a process's ${mebibytes(getHeapStatistics().heap_size_limit)}.`,
      ],
      { after, before },
    );

    yield* Effect.promise(() => writeFile(path.join(runDirectory, "summary.txt"), text));
    yield* Console.log(text);

    if (differs) {
      process.exitCode = 1;
    }
  }),
);

await Effect.runPromise(program);
