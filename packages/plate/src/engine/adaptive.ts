/**
 * An item's adaptivity, as the engine answers for it: how an attempt starts its outcomes
 * ({@link startingOutcomes}).
 *
 * QTI gives an adaptive item attempts until its processing completes it: its outcomes are kept
 * from one attempt to the next rather than reset, the item session ends when the built-in
 * `completionStatus` is `completed`, and `max-attempts` does not limit it (`itemSessionOpen` in
 * `#plate/attempts.ts`). "The built-in outcome variable is `completionStatus`, spelled exactly"
 * (`docs/spec-readings.md`).
 *
 * @module
 */
import type { Item } from "#plate/model/item.ts";
import {
  completionStatus,
  completionValue,
  holdsCompletionStatus,
  outcomeStart,
} from "#plate/model/record.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import type { Value } from "#plate/model/values.ts";

/**
 * Give the value the built-in `completionStatus` holds when an attempt's processing starts. It
 * "starts with the reserved value 'not_attempted'. At the start of the first attempt it changes to
 * the reserved value 'unknown'. It remains with this value for the duration of the item session
 * unless set to a different value by a setOutcomeValue rule" (section 2.2.2.3). So the first
 * attempt, where the record counts none, starts it at `unknown`; every later attempt starts from
 * the record's value, the one the last processing left, `not_attempted` included, adaptive or not,
 * and from `unknown` for a record that lacks the built-in, which no record the codec reads does.
 * The non-adaptive reset to the declared defaults (section 2.2.2.3) covers declared outcomes, and
 * the built-in has no declaration.
 *
 * @param record The session record before the attempt.
 * @returns The built-in's value as the rules first read it.
 */
const startingCompletion = (record: ItemRecord): Value =>
  record.numAttempts === 0
    ? completionValue("unknown")
    : (record.outcomes[completionStatus] ?? completionValue("unknown"));

/**
 * Give the outcomes a non-adaptive attempt's processing starts from: the declared outcomes at
 * their defaults ({@link outcomeStart}), because a non-adaptive item resets them before each
 * response processing run, and the built-in `completionStatus`, where the item holds it, as
 * {@link startingCompletion} gives it.
 *
 * @param item The item.
 * @param record The session record before the attempt.
 * @returns The outcomes, keyed by identifier.
 */
const resetOutcomes = (item: Item, record: ItemRecord): ItemRecord["outcomes"] => {
  const defaults = outcomeStart(item, record.defaults);

  return holdsCompletionStatus(item)
    ? { ...defaults, [completionStatus]: startingCompletion(record) }
    : defaults;
};

/**
 * Give the outcomes an adaptive attempt's processing starts from: the record's outcomes as the
 * last attempt left them, since "the outcome variables are not reset" in an adaptive item, so its
 * rules read and build on them, and the built-in `completionStatus`, where the item holds it, as
 * {@link startingCompletion} gives it, `unknown` at the first attempt. Before the first attempt the
 * record holds each outcome at its default ({@link outcomeStart}), so the first attempt starts as a
 * non-adaptive one does.
 *
 * @param item The item.
 * @param record The session record before the attempt.
 * @returns The outcomes, keyed by identifier.
 */
const keptOutcomes = (item: Item, record: ItemRecord): ItemRecord["outcomes"] =>
  holdsCompletionStatus(item)
    ? { ...record.outcomes, [completionStatus]: startingCompletion(record) }
    : record.outcomes;

/**
 * Give the outcomes an attempt's processing starts from: an adaptive item's as its last attempt
 * left them ({@link keptOutcomes}), so its rules read and build on them, and a non-adaptive item's
 * reset to their defaults ({@link resetOutcomes}), the built-in `completionStatus` among them as
 * {@link startingCompletion} gives it in both.
 *
 * @param item The item.
 * @param record The session record before the attempt.
 * @returns The outcomes, keyed by identifier.
 */
export const startingOutcomes = (item: Item, record: ItemRecord): ItemRecord["outcomes"] =>
  item.adaptive ? keptOutcomes(item, record) : resetOutcomes(item, record);
