/**
 * The planner-memory ceiling the first check judges an action's cold plans by: the memory whose
 * planning, on a CPU of this machine's cluster, reaches the 100 ms bar, fitted over every statement
 * of every measured composition (#plan-budget/calibrate.ts, its record in calibration.json beside
 * this package).
 *
 * @module
 */

/**
 * The ceiling, in kilobytes of planner memory ("Memory Used"), summed over an action's cold plans.
 *
 * @limitKind measured
 * @owner the planning budget's first check (#plan-budget/memory.ts)
 * @unit kilobytes of planner memory, summed over one action's cold generic plans
 * @scope every action of every composition the planning budget measures
 * @constraint the memory whose cold planning reaches the 100 ms bar of backend CPU
 * @source calibration.json, 2026-11-23: cold CPU = 8.44 ms × MB^0.652 (r2 0.968 in log CPU, measured over fitted
 *   0.66 to 1.93 at the 5th and 95th percentiles) over 47 actions of edullm's QTI database, the ledger's result
 *   composition and pantry, each measured three times in fresh backends on postgres@edullm-planbudget with no other
 *   client, at a machine load of 261 to 391; every action's memory equal across its runs
 * @verified 2026-11-23
 */
export const ceilingKb = 45_463;
