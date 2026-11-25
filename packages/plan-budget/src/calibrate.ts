/**
 * The ceiling's calibration: the planner memory whose cold planning reaches the 100 ms bar of
 * backend CPU, fitted from the first check's own records on a cluster no other client uses.
 *
 * Each action of every measured composition is measured several times, each time in a fresh
 * backend; an action's CPU is the least of its runs, the one the machine's other jobs disturbed
 * least (its memory is the same every time, which the calibration checks). Over the actions no
 * watchdog stopped, the cold planning CPU an action spends is fitted by least squares as a power of
 * the planner memory its cold plans use, both summed over the action, so the fit is of the very
 * sums the verdict reads: a line in log CPU on log memory. A line in CPU on memory fits worse
 * (r2 0.78 against 0.97 in the first calibration, 2026-11-23): a small action's cold CPU is mostly
 * its catalog's loading, a large one's its planner's allocations, and the power holds both. The
 * ceiling is the memory at which the power reaches the bar. The record keeps the corpus, the fit,
 * its residuals and the machine's load, so the ceiling is re-derived, never set by hand.
 *
 * @module
 */
import { readFileSync } from "node:fs";
import { Array as Arr, Schema } from "effect";

/**
 * One action's point of the fit: its cold planner memory and the least cold CPU of its runs.
 */
export interface CalibrationPoint {
  readonly action: string;
  readonly coldKb: number;
  readonly coldCpuMs: number;
  readonly runs: number;
}

/**
 * The calibration's record: its corpus, the fitted line, how well it fits, and the ceiling it
 * gives.
 */
export interface Calibration {
  readonly budgetMs: number;
  /**
   * Where and how the runs were made: the cluster, that no other client used it, the slice the runs
   * ran in, and the machine.
   */
  readonly conditions: string;
  /**
   * The power's factor: the cold CPU of an action whose cold plans use one megabyte, in
   * milliseconds.
   */
  readonly msAtOneMb: number;
  /**
   * The power's exponent: cold CPU = msAtOneMb × megabytes^exponent.
   */
  readonly exponent: number;
  /**
   * The fit's coefficient of determination, in log CPU.
   */
  readonly r2: number;
  /**
   * The residuals' quantiles (5 %, 50 %, 95 %), as factors of measured over fitted CPU.
   */
  readonly residualFactor: { readonly p05: number; readonly p50: number; readonly p95: number };
  /**
   * The memory at which the line reaches the bar, in kilobytes.
   */
  readonly ceilingKb: number;
  /**
   * Actions whose memory differed between runs, which an exact count never does.
   */
  readonly unequalMemory: readonly string[];
  readonly loads: { readonly least: number; readonly most: number };
  readonly points: readonly CalibrationPoint[];
}

/**
 * What the calibration reads of a first check's record: the action, its cold sums, where it stopped
 * and the load.
 */
const CalibrationRecord = Schema.Struct({
  action: Schema.String,
  coldCpuMs: Schema.Number,
  coldKb: Schema.Number,
  load: Schema.Number,
  measured: Schema.Struct({
    plans: Schema.Array(Schema.Struct({})),
    stopped: Schema.optional(Schema.Struct({ kind: Schema.String })),
  }),
});

/**
 * A record's line, decoded.
 */
const recordOf = Schema.decodeUnknownSync(Schema.fromJsonString(CalibrationRecord));

/**
 * Kilobytes in a megabyte, as EXPLAIN's MEMORY counts them.
 */
const kbPerMb = 1024;

/**
 * A quantile of sorted values, by the nearest rank.
 *
 * @param sorted - The values, ascending.
 * @param q - The quantile, from 0 to 1.
 * @returns The value at that rank.
 */
const quantile = (sorted: readonly number[], q: number): number =>
  sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))))] ??
  Number.NaN;

/**
 * The calibration of the first check's records: every JSON line of every file, grouped by action.
 *
 * @param files - The runs' record files, each one full run of the first check.
 * @param budgetMs - The bar.
 * @returns The calibration.
 */
export const calibrationOf = (
  files: readonly string[],
  budgetMs: number,
  conditions: string,
): Calibration => {
  const records = files.flatMap((file) =>
    readFileSync(file, "utf-8")
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => recordOf(line)),
  );
  const byAction = Map.groupBy(
    records.filter(({ measured }) => measured.stopped === undefined && measured.plans.length > 0),
    ({ action }) => action,
  );
  const points: CalibrationPoint[] = [];
  const unequalMemory: string[] = [];

  for (const [action, runs] of byAction) {
    const memories = new Set(runs.map(({ coldKb }) => coldKb));

    if (memories.size > 1) {
      unequalMemory.push(action);
    }

    points.push({
      action,
      coldCpuMs: Arr.reduce(runs, Number.POSITIVE_INFINITY, (least, { coldCpuMs }) =>
        Math.min(least, coldCpuMs),
      ),
      coldKb: Arr.reduce(memories, Number.POSITIVE_INFINITY, (least, kb) => Math.min(least, kb)),
      runs: runs.length,
    });
  }

  const fitted = points.filter(({ coldCpuMs, coldKb }) => coldKb > 0 && coldCpuMs > 0);
  const xs = fitted.map(({ coldKb }) => Math.log(coldKb / kbPerMb));
  const ys = fitted.map(({ coldCpuMs }) => Math.log(coldCpuMs));
  const meanX = xs.reduce((sum, x) => sum + x, 0) / xs.length;
  const meanY = ys.reduce((sum, y) => sum + y, 0) / ys.length;
  const sxy = xs.reduce((sum, x, at) => sum + (x - meanX) * ((ys[at] ?? 0) - meanY), 0);
  const sxx = xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0);
  const exponent = sxy / sxx;
  const logAtOneMb = meanY - exponent * meanX;
  const residuals = ys.map((y, at) => y - (logAtOneMb + exponent * (xs[at] ?? 0)));
  const ssRes = residuals.reduce((sum, r) => sum + r ** 2, 0);
  const ssTot = ys.reduce((sum, y) => sum + (y - meanY) ** 2, 0);
  const sorted = residuals.toSorted((a, b) => a - b);
  const loads = records.map(({ load }) => load);

  return {
    budgetMs,
    ceilingKb: Math.floor(Math.exp((Math.log(budgetMs) - logAtOneMb) / exponent) * kbPerMb),
    conditions,
    exponent,
    loads: {
      least: Arr.reduce(loads, Number.POSITIVE_INFINITY, (least, load) => Math.min(least, load)),
      most: Arr.reduce(loads, Number.NEGATIVE_INFINITY, (most, load) => Math.max(most, load)),
    },
    msAtOneMb: Math.exp(logAtOneMb),
    points: points.toSorted((a, b) => a.coldKb - b.coldKb),
    r2: 1 - ssRes / ssTot,
    residualFactor: {
      p05: Math.exp(quantile(sorted, 0.05)),
      p50: Math.exp(quantile(sorted, 0.5)),
      p95: Math.exp(quantile(sorted, 0.95)),
    },
    unequalMemory,
  };
};
