/**
 * Test support: block-count growth checks, which tell a computation that grows linearly with its
 * input from one that grows quadratically, by how many more blocks of JavaScript it runs on
 * `growthFactor` (`@qti-pie/crust/test/growth.ts`) times the input. {@link blockGrowth} counts the
 * blocks of JavaScript one run of it takes, through V8's block coverage, a number that is the same
 * on every run and under any load. Block coverage counts no step a builtin takes inside itself,
 * such as bigint arithmetic or the regex engine, so a computation whose growth lives inside one is
 * timed by crust's `growthRatio` instead, in thread CPU time.
 *
 * @module
 */
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { env, execPath } from "node:process";
import { fileURLToPath } from "node:url";
import { growthFactor } from "@qti-pie/crust/test/growth.ts";
import { Effect, Schema } from "effect";
import type { SubjectName } from "#plate/test/counted.ts";
import { scratchFolder } from "#plate/test/scratch.ts";

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
 * ({@link baselineTiers}). The process runs with `NODE_V8_COVERAGE` set, so Node turns block
 * coverage on before any module loads; Node writes its own coverage into that folder as the
 * process exits, a scratch folder of the run's own, removed once the process has ended. The count
 * is exact, so one run of each size tells the growth. It counts every function call and every
 * block a branch or a loop enters in JavaScript, and no step a builtin takes inside itself: a
 * quadratic dedupe that scans what it kept with `Array.prototype.some` reads about 64 times the
 * blocks on 8 times the entries, and one that scans with `Array.prototype.includes` about 8 times.
 *
 * @param subject The subject: the computation and the input it builds.
 * @param fewer How many parts the smaller input holds.
 * @returns How many times as many blocks the run on the larger input took as the run on the
 *   smaller.
 */
export const blockGrowth = (subject: SubjectName, fewer: number): Effect.Effect<number> =>
  Effect.acquireUseRelease(
    Effect.sync(() => scratchFolder("coverage-")),
    (coverage) =>
      Effect.sync(() =>
        execFileSync(
          execPath,
          [baselineTiers, blocksScript, subject, String(fewer), String(fewer * growthFactor)],
          { encoding: "utf-8", env: { ...env, NODE_V8_COVERAGE: coverage } },
        ),
      ),
    (coverage) =>
      Effect.sync(() => {
        rmSync(coverage, { force: true, recursive: true });
      }),
  ).pipe(
    Effect.flatMap((written) => Effect.orDie(Schema.decodeUnknownEffect(BlocksSchema)(written))),
    Effect.map((blocks) => blocks.more / blocks.fewer),
  );
