/**
 * Test support: growth checks, which tell a computation that grows linearly with its input from
 * one that grows quadratically, by how much more it does on {@link growthFactor} times the input.
 *
 * A computation whose growth lives in JavaScript is counted: {@link blockGrowth} counts the blocks
 * of JavaScript one run of it takes, through V8's block coverage, a number that is the same on
 * every run and under any load. A computation whose growth lives inside one of V8's builtins, such
 * as bigint arithmetic or the regex engine, is timed: block coverage counts no step a builtin takes
 * inside itself, so {@link growthRatio} measures the thread CPU time it takes.
 *
 * @module
 */
import { execFileSync } from "node:child_process";
import { execPath, threadCpuUsage } from "node:process";
import { fileURLToPath } from "node:url";
import { Effect, Schema } from "effect";
import type { SubjectName } from "#plate/test/counted.ts";

/**
 * How many times as large the second input of a growth check is: a linear computation then does
 * about 8 times as much on it, and a quadratic one about 64 times.
 */
export const growthFactor = 8;

/**
 * The most a computation's time may grow by on {@link growthFactor} times the input, 4 times linear
 * and half of quadratic, so a busy machine neither fails a linear computation nor passes a
 * quadratic one.
 */
export const growthLimit = 32;

/**
 * The ratio of blocks that tells linear growth from quadratic: the geometric mean of the ratios
 * the two read on {@link growthFactor} times the input, `growthFactor` and `growthFactor ** 2`,
 * which is `growthFactor ** 1.5`, about 22.6. A ratio `r` grows the work by about the power
 * `log(r) / log(growthFactor)` of the input, and below this limit that power is nearer 1 than 2. A
 * block count is exact, so the limit needs no margin for noise: a linear computation's fixed work
 * only lowers its ratio below `growthFactor`, and a quadratic one's ratio nears `growthFactor ** 2`
 * as its input grows.
 */
export const blockGrowthLimit = Math.sqrt(growthFactor * growthFactor ** 2);

/**
 * How many samples of each computation a timing takes, keeping the cheapest, so a sample a busy
 * machine slowed does not count.
 */
export const growthRuns = 3;

/**
 * The least thread CPU, in milliseconds, a sample accumulates. The thread clock advances in steps
 * of up to a scheduler tick, 1 ms on Linux at `CONFIG_HZ=1000`, so a computation of a millisecond
 * or less often reads 0 ms and any reading may be a tick off. A sample's reading is then never 0,
 * and within 4% of its time at that tick, or 16% at the 4 ms tick of `CONFIG_HZ=250`: inside a
 * growth check's margin of 4 times either way.
 */
const sampleMillis = 25;

/**
 * A sample of a computation: how many times it ran in a row, and the thread CPU those runs took
 * together, at least {@link sampleMillis}.
 */
interface Sample {
  readonly millis: number;
  readonly runs: number;
}

/**
 * Run a computation a number of times in a row and measure the CPU time this thread spent on the
 * runs, which a busy machine inflates far less than wall-clock time: the time other processes hold
 * the CPU is not counted. Effect's `Clock` reads wall-clock time only, so the thread's own clock is
 * read from Node.
 *
 * @param work The computation.
 * @param runs How many times to run it.
 * @returns The thread's CPU time over the runs, in milliseconds.
 * @see https://nodejs.org/api/process.html#processthreadcpuusagepreviousvalue
 */
const threadMillis = (work: () => void, runs: number): number => {
  const before = threadCpuUsage();
  for (let run = 0; run < runs; run += 1) {
    work();
  }

  const { system, user } = threadCpuUsage(before);

  return (system + user) / 1000;
};

/**
 * Take a sample of a computation: run it a number of times in a row, and double that number until
 * the runs together accumulate {@link sampleMillis} of thread CPU. Each run's share of the sample
 * is then a time the thread clock can tell apart from 0, however short one run is.
 *
 * @param work The computation.
 * @param runs How many times to run it first: 1, or the runs an earlier sample of it took.
 * @returns The first sample of at least {@link sampleMillis}.
 */
const sampleOf = (work: () => void, runs: number): Sample => {
  let sample: Sample = { millis: threadMillis(work, runs), runs };
  while (sample.millis < sampleMillis) {
    const doubled = sample.runs * 2;
    sample = { millis: threadMillis(work, doubled), runs: doubled };
  }

  return sample;
};

/**
 * Measure how a computation's CPU time grows with its input: sample it on a smaller input and on a
 * larger one, {@link growthFactor} times as large in a growth check, alternating so a busy spell
 * slows both sizes, and keep each size's cheapest run over {@link growthRuns} samples. Each sample
 * lasts at least {@link sampleMillis}, a shorter run repeated as many times in a row as reach it,
 * and a size's later samples start at the runs its last one took.
 *
 * @param fewer The computation on the smaller input, which may run many times.
 * @param more The computation on the larger input, which may run more than once.
 * @returns How many times as long one run of `more` took as one run of `fewer`.
 */
export const growthRatio = (fewer: () => void, more: () => void): Effect.Effect<number> =>
  Effect.sync(() => {
    let fewerSample: Sample = { millis: 0, runs: 1 };
    let moreSample: Sample = { millis: 0, runs: 1 };
    let fewerMs = Number.POSITIVE_INFINITY;
    let moreMs = Number.POSITIVE_INFINITY;
    for (let run = 0; run < growthRuns; run += 1) {
      fewerSample = sampleOf(fewer, fewerSample.runs);
      moreSample = sampleOf(more, moreSample.runs);
      fewerMs = Math.min(fewerMs, fewerSample.millis / fewerSample.runs);
      moreMs = Math.min(moreMs, moreSample.millis / moreSample.runs);
    }

    return moreMs / fewerMs;
  });

/**
 * The counts the counting process writes, as JSON: the blocks one run of a subject took on its
 * smaller input and on its larger.
 */
const BlocksSchema = Schema.fromJsonString(
  Schema.Struct({ fewer: Schema.Number, more: Schema.Number }),
);

/**
 * The counting process's script, `#plate/test/blocks.ts`.
 */
const blocksScript = fileURLToPath(new URL("blocks.ts", import.meta.url));

/**
 * The V8 flag the counting process runs under: V8 compiles its code with its interpreter and its
 * baseline compiler, Sparkplug, and never with its optimizing compilers, Maglev and Turbofan, whose
 * code loses block counts, as many as depend on when V8 optimized each function. On Node 26.13.1,
 * eight counts of the `records` subject's run on 1,000 declarations read from 400,578 to 420,607
 * blocks under every tier, and 635,776 on each of eight under this flag.
 */
const baselineTiers = "--max-opt=1";

/**
 * Measure how a computation's blocks of JavaScript grow with its input: count the blocks one run
 * of a subject (`#plate/test/counted.ts`) takes on `fewer` parts and on {@link growthFactor} times
 * as many, in a Node process of its own, whose V8 compiles every function the subject runs with
 * block counters (`#plate/test/blocks.ts`) and none with an optimizing compiler
 * ({@link baselineTiers}). The count is exact, so one run of each size tells the
 * growth. It counts every function call and every block a branch or a loop enters in JavaScript,
 * and no step a builtin takes inside itself: a quadratic dedupe that scans what it kept with
 * `Array.prototype.some` reads about 64 times the blocks on 8 times the entries, and one that scans
 * with `Array.prototype.includes` about 8 times.
 *
 * @param subject The subject: the computation and the input it builds.
 * @param fewer How many parts the smaller input holds.
 * @returns How many times as many blocks the run on the larger input took as the run on the
 *   smaller.
 */
export const blockGrowth = (subject: SubjectName, fewer: number): Effect.Effect<number> =>
  Effect.sync(() =>
    execFileSync(
      execPath,
      [baselineTiers, blocksScript, subject, String(fewer), String(fewer * growthFactor)],
      {
        encoding: "utf-8",
      },
    ),
  ).pipe(
    Effect.flatMap((written) => Effect.orDie(Schema.decodeUnknownEffect(BlocksSchema)(written))),
    Effect.map((blocks) => blocks.more / blocks.fewer),
  );
