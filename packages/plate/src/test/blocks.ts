/**
 * The counting process of `blockGrowth` (`#plate/test/growth.ts`): build a subject of
 * `#plate/test/counted.ts` on each of its two sizes, count the blocks of JavaScript one run on each
 * takes through V8's precise block coverage, and write both counts to standard output as JSON. Its
 * arguments are the subject's name and the two sizes.
 *
 * V8 gives a function block counters only when it compiles the function while block coverage is
 * on, and compiles a function when it first runs: a function compiled before then reports its
 * calls alone, which optimized code stops counting. So this module imports only Node's own modules
 * before it starts the coverage, and only then imports the subjects, in a process of their own:
 * every function a subject runs, the effect library's among them, is compiled with counters. A
 * count leaves out Node's own code and this module's, which are compiled before the coverage
 * starts, and any other function that runs without counters fails the count. The process runs
 * under the interpreter and Sparkplug alone (`baselineTiers` in `#plate/test/growth.ts`), since
 * code V8's optimizing compilers write loses block counts too.
 *
 * Each subject runs once on its smaller input before the counts, so neither count holds the work a
 * first run alone does, such as compiling a regex or filling a cache.
 *
 * @module
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#method-startPreciseCoverage
 */
import type { Profiler } from "node:inspector";
import { Session } from "node:inspector/promises";
import { argv, stdout } from "node:process";

const session = new Session();

session.connect();

await session.post("Profiler.enable");
await session.post("Profiler.startPreciseCoverage", { callCount: true, detailed: true });

const { Schema } = await import("effect");

const { CountingSchema, subjects } = await import("#plate/test/counted.ts");

/**
 * The functions of a script a count reads: none of Node's own scripts or of this module.
 *
 * @param script A script's coverage.
 * @returns Its functions, or none when the count leaves the script out.
 */
const countedFunctions = (script: Profiler.ScriptCoverage): readonly Profiler.FunctionCoverage[] =>
  script.url.startsWith("node:") || script.url === import.meta.url ? [] : script.functions;

/**
 * Count the blocks a function ran: its calls, and the times each block within it ran.
 *
 * @param fn A function's coverage.
 * @returns The sum of its ranges' counts.
 * @throws {Error} When the function ran without block counters: V8 compiled it before the coverage
 *   started.
 */
const blocksIn = (fn: Profiler.FunctionCoverage): number => {
  const blocks = fn.ranges.reduce((total, range) => total + range.count, 0);
  if (blocks > 0 && !fn.isBlockCoverage) {
    throw new Error(
      `${fn.functionName || "An anonymous function"} ran without block counters, compiled before the count began: blocks.ts imports nothing but Node's own modules before it starts the coverage.`,
    );
  }

  return blocks;
};

/**
 * Count the blocks of JavaScript one run of a computation takes.
 *
 * @param work The computation.
 * @returns The blocks it ran, outside Node's own code and this module.
 */
const blocksOf = async (work: () => void): Promise<number> => {
  await session.post("Profiler.takePreciseCoverage");
  work();

  const { result } = await session.post("Profiler.takePreciseCoverage");

  return result.flatMap(countedFunctions).reduce((total, fn) => total + blocksIn(fn), 0);
};

const [subject, fewerParts, moreParts] = Schema.decodeUnknownSync(CountingSchema)(argv.slice(2));

const fewer = subjects[subject](fewerParts);

const more = subjects[subject](moreParts);

fewer();

const blocks = { fewer: await blocksOf(fewer), more: await blocksOf(more) };

await session.post("Profiler.stopPreciseCoverage");

session.disconnect();

stdout.write(JSON.stringify(blocks));
