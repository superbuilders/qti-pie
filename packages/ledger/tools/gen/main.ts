import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generator as admissionCodes } from "#tools/gen/admission-codes.ts";
import { generator as finishCopies } from "#tools/gen/finish-copies.ts";
import type { Generator } from "#tools/gen/generator.ts";
import { generator as grade } from "#tools/gen/grade.ts";
import { generator as grading } from "#tools/gen/grading.ts";
import { generator as sessionStart } from "#tools/gen/session-start.ts";
import { generator as xsd } from "#tools/gen/xsd.ts";
import { ledgerDirectory, scratchDirectory, toolsFor } from "#tools/gen/tools.ts";

/**
 * The ledger package's generated files, each by its generator: `pnpm generate` writes them, and
 * `pnpm generate:check` (in edullm's `pnpm check`) regenerates them and fails on any byte a
 * committed file differs by, so a hand edit to a generated file fails the gate. Naming targets
 * (`pnpm generate src/grade.ts`) runs their generators alone. Their order is derived from what
 * each reads, never from this list's.
 */
const GENERATORS: readonly Generator[] = [
  admissionCodes,
  finishCopies,
  grade,
  grading,
  sessionStart,
  xsd,
];

/**
 * The run's arguments: `--check`, and the targets it runs, every one when none is named.
 */
const argv = process.argv.slice(2);

/**
 * Whether the run compares instead of writing.
 */
const check = argv.includes("--check");

/**
 * The targets named.
 */
const named = argv.filter((arg) => arg !== "--check");

const unknown = named.filter(
  (target) => !GENERATORS.some((generator) => generator.target === target),
);

if (unknown.length > 0) {
  throw new Error(
    `No generator writes ${unknown.join(", ")}: the generated files are ${GENERATORS.map(({ target }) => target).join(", ")}.`,
  );
}

/**
 * The generators the run runs.
 */
const chosen =
  named.length === 0 ? GENERATORS : GENERATORS.filter(({ target }) => named.includes(target));

/**
 * Whether a generator reads another's target: a read names the target's file or a directory
 * above it.
 *
 * @param reader The generator that may read it.
 * @param writer The generator of the target.
 * @returns Whether it does.
 */
const readsTargetOf = (reader: Generator, writer: Generator): boolean => {
  const target = path.normalize(writer.target);

  return reader.reads.some((read) => {
    const file = path.normalize(read);

    return file.endsWith("/") ? target.startsWith(file) : target === file;
  });
};

/**
 * The run's generators whose targets a generator reads, which run before it.
 *
 * @param reader The generator.
 * @returns The generators it waits for.
 */
const waitsFor = (reader: Generator): Generator[] =>
  chosen.filter((writer) => writer !== reader && readsTargetOf(reader, writer));

/**
 * Fails the run on a cycle of generators each reading the next one's target, which no order
 * runs: one of them reads a target only another run could have written.
 *
 * @param generator The generator the walk is at.
 * @param chain The generators the walk came through to it.
 */
const mustBeAcyclic = (generator: Generator, chain: readonly Generator[]): void => {
  if (chain.includes(generator)) {
    throw new Error(
      `The generators read each other's targets in a cycle, which no order runs: ${[...chain.slice(chain.indexOf(generator)), generator].map(({ target }) => target).join(" reads ")}.`,
    );
  }

  for (const writer of waitsFor(generator)) {
    mustBeAcyclic(writer, [...chain, generator]);
  }
};

for (const generator of chosen) {
  mustBeAcyclic(generator, []);
}

/**
 * The first line at which two texts differ, from 1.
 *
 * @param a A text.
 * @param b Another.
 * @returns The line.
 */
const firstDifferentLine = (a: string, b: string): number => {
  const as = a.split("\n");
  const bs = b.split("\n");

  return as.findIndex((line, i) => line !== bs[i]) + 1 || Math.min(as.length, bs.length) + 1;
};

const scratch = await scratchDirectory();

/**
 * Each generator's run, once begun, so a generator that several read runs once.
 */
const runs = new Map<Generator, Promise<string[]>>();

/**
 * One generator's run, after the runs of the generators whose targets it reads: it writes its
 * target, or compares it with the committed file and gives its drift.
 *
 * @param generator The generator.
 * @returns The target's drift, when the run compares and finds one.
 */
const runOf = async (generator: Generator): Promise<string[]> => {
  const begun = runs.get(generator);
  if (begun !== undefined) {
    return await begun;
  }

  const run = (async () => {
    await Promise.all(waitsFor(generator).map(runOf));
    const { generate, target } = generator;
    const text = await generate(toolsFor(scratch, target));
    const file = path.join(ledgerDirectory, target);
    if (!check) {
      await writeFile(file, text);
      process.stdout.write(`generate: wrote ${target}\n`);

      return [];
    }

    const committed = await readFile(file, "utf-8");

    return committed === text
      ? []
      : [`${target} (from line ${String(firstDifferentLine(committed, text))})`];
  })();
  runs.set(generator, run);

  return await run;
};

const outcomes = await Promise.all(chosen.map(runOf));

const drifted = outcomes.flat();

if (check && drifted.length > 0) {
  process.stderr.write(
    `generate:check: ${drifted.join(", ")} ${drifted.length === 1 ? "differs" : "differ"} from ${drifted.length === 1 ? "its generator" : "their generators"}. A generated file is changed only through its generator under packages/ledger/tools/gen/ or the sources it reads (machine/ for grading): change them, run \`pnpm --filter @qti-pie/ledger generate\` and commit both.\n`,
  );
  process.exitCode = 1;
} else if (check) {
  process.stdout.write(
    `generate:check: ${chosen.map(({ target }) => target).join(", ")} match their generators\n`,
  );
}
