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
 * @source calibration.json, 2026-11-23, alone in priority.slice: cold CPU = 7.65 ms × MB^0.644 (r2 0.964 in log
 *   CPU, measured over fitted 0.62 to 1.73 at the 5th and 95th percentiles) over 55 actions of edullm's QTI database
 *   (production's published corpus restored), pantry, and the ledger's result composition at qti-pie 8ac9c2261a6a
 *   (Presence), each measured three times in fresh backends on postgres@edullm-planbudget with no other client, at a
 *   machine load of 199 to 260; every action's memory equal across its runs
 * @verified 2026-11-23
 */
export const ceilingKb = 55_332;
