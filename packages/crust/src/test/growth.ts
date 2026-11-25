/**
 * Test support: growth checks, which tell a computation that grows linearly with its input from
 * one that grows quadratically, by how much more it does on {@link growthFactor} times the input.
 * {@link growthRatio} measures the thread CPU time it takes, which sees every step, a builtin's
 * inside itself among them, such as the regex engine's or bigint arithmetic's. Plate counts the
 * blocks of JavaScript instead where a computation's growth lives in JavaScript
 * (`blockGrowth`, `#plate/test/growth.ts`), a number that is the same on every run and under any
 * load.
 *
 * @module
 */
import { threadCpuUsage } from "node:process";
import { Effect } from "effect";

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
