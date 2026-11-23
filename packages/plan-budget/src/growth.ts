/**
 * Whether an action's work grows with the data beyond the child's own rows: the log-log slope of
 * the pages it touches on the populations' sizes (PERF-PUBLISH's growth.py, the one growth fit,
 * made general).
 *
 * Every population's measured child is readied the same way, so its own rows are the same at every
 * scale: a read keyed by the child touches the same pages wherever the population stands, but for
 * the levels its index descents gain. A B-tree of 8 KB pages holds a hundred keys or more a page,
 * so over two decades of rows a descent gains at most one level, and an action whose every page is
 * a descent touches at most twice its pages at a hundred times the rows: a slope of log 2 / log
 * 100, about 0.15. An action that reads every attempt touches pages in proportion to the attempts,
 * a slope near 1. The verdict fails a slope above the descents' bound.
 *
 * @module
 */

/**
 * The fewest keys an 8 KB B-tree page holds, which bounds how many levels a descent gains as rows
 * grow.
 *
 * @limitKind published
 * @owner PostgreSQL's B-tree access method (src/backend/access/nbtree/README)
 * @unit keys per index page
 * @scope every index descent of a measured action
 * @constraint a lower bound for keys of up to about 80 bytes on 8 KB pages; a wider key gains levels sooner
 * @source https://www.postgresql.org/docs/current/btree.html (BLCKSZ 8192, BTMaxItemSize about a third of a page)
 * @quote "BTMaxItemSize ... about 1/3 of a page"
 * @verified 2026-11-23
 */
const keysPerPage = 100;

/**
 * The steepest slope a growth may have and still be the descents' own: one level more per descent
 * over the span of populations a B-tree page's fanout covers.
 */
export const descentSlope = Math.log(2) / Math.log(keysPerPage);

/**
 * One population's measurement of an action: its size, relative to 1x, and the pages the action
 * touched.
 */
export interface GrowthPoint {
  readonly size: number;
  readonly pages: number;
}

/**
 * The least-squares slope of log pages on log size.
 *
 * @param points - The populations' measurements, at least two sizes.
 * @returns The slope.
 */
export const slopeOf = (points: readonly GrowthPoint[]): number => {
  const xs = points.map(({ size }) => Math.log(size));
  const ys = points.map(({ pages }) => Math.log(Math.max(1, pages)));
  const meanX = xs.reduce((sum, x) => sum + x, 0) / xs.length;
  const meanY = ys.reduce((sum, y) => sum + y, 0) / ys.length;
  const sxy = xs.reduce((sum, x, at) => sum + (x - meanX) * ((ys[at] ?? 0) - meanY), 0);
  const sxx = xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0);

  return sxy / sxx;
};

/**
 * Whether the action's pages grow beyond its descents' own.
 *
 * @param points - The populations' measurements.
 * @returns True when the slope passes {@link descentSlope}.
 */
export const grows = (points: readonly GrowthPoint[]): boolean => slopeOf(points) > descentSlope;
