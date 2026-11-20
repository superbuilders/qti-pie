/**
 * An item session's attempts as facts a host records, and what QTI derives from them: the record
 * the next attempt starts from ({@link recordAfter}), how many attempts count ({@link numAttempts})
 * and whether the session takes another ({@link itemSessionOpen}).
 *
 * Plate holds no session. A host records each attempt's {@link Attempt}, the facts `attemptOf`
 * reads from the record `scoreRecord` returned, and rebuilds every later record from `begin`'s and
 * those facts. Nothing here is stored: the count and the session's openness are derived, as QTI
 * and Caliper both define them, from the attempts made.
 *
 * @module
 */
import { Array as Arr, Option, Order, Record as Rec } from "effect";
import { isCompletionStatus } from "#plate/model/built-ins.ts";
import type { CompletionStatus } from "#plate/model/built-ins.ts";
import { countsAttempt } from "#plate/model/interactions.ts";
import { completionStatus, holdsCompletionStatus } from "#plate/model/record.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import { nullOf, nullRecord } from "#plate/model/values.ts";
import type { Responses, Value } from "#plate/model/values.ts";
import { splitResponses } from "#plate/score.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * One attempt of an item, as a host records it: what the record after the attempt holds of it, NULL
 * as no entry.
 */
export interface Attempt {
  /**
   * The built-in `completionStatus` the attempt's processing left.
   */
  readonly completionStatus: CompletionStatus;
  /**
   * Each outcome the item declares, by identifier, as the attempt's processing left it; the
   * built-in `completionStatus` is {@link Attempt.completionStatus}.
   */
  readonly outcomes: Readonly<Record<string, Value>>;
  /**
   * Each response the record holds after the attempt, by identifier, a record response's record
   * among them: the posted ones, and every other at the value it kept.
   */
  readonly responses: Responses;
}

/**
 * Read the built-in `completionStatus` a record holds: `unknown` where it holds none, as an
 * attempt's processing starts a record that lacks it (`startingOutcomes` in
 * `#plate/engine/adaptive.ts`). Processing sets it to one of its four values or fails its run
 * (reading 213), so a record `scoreRecord` returns holds one of them.
 *
 * @param record The record.
 * @returns Its `completionStatus`.
 */
const completionOf = (record: Pick<ItemRecord, "outcomes">): CompletionStatus => {
  const held = record.outcomes[completionStatus]?.values[0];

  return held?.baseType === "identifier" && isCompletionStatus(held.value) ? held.value : "unknown";
};

/**
 * Read the facts a host records of an attempt from the record `scoreRecord` returned for it.
 *
 * @param record The record after the attempt.
 * @returns The attempt: its responses, record responses among them, its declared outcomes and its
 *   `completionStatus`.
 */
export const attemptOf = (record: ItemRecord): Attempt => ({
  completionStatus: completionOf(record),
  outcomes: Rec.remove(record.outcomes, completionStatus),
  responses: { ...record.responses, ...record.records },
});

/**
 * Count an item session's attempts as the built-in `numAttempts` counts them: every attempt but one
 * the item's interactions do not count, which is one the candidate ended through an End Attempt
 * whose `count-attempt` is false, its response `true` (`countsAttempt` in
 * `#plate/model/interactions.ts`, reading 204). So a hint uses up no attempt. The count reads each
 * attempt alone, in any order.
 *
 * @param document The item.
 * @param attempts The attempts made, each with the responses the record after it holds.
 * @returns The count.
 */
export const numAttempts = (
  document: Accepted,
  attempts: readonly Pick<Attempt, "responses">[],
): number =>
  attempts.filter((attempt) =>
    countsAttempt(document.item, splitResponses(attempt.responses).responses),
  ).length;

/**
 * Say whether an item session takes another attempt. An adaptive item's is open until an attempt's
 * processing sets the built-in `completionStatus` to `completed`, whatever its stage's limit: "For
 * adaptive items, the value of max-attempts is ignored as the number of attempts is limited by the
 * value of the completion-status built-in outcome variable" (section 7.19.1). Any other item's is
 * open while {@link numAttempts} is below the stage's limit. Each attempt is read alone, in any
 * order.
 *
 * QTI's show-feedback hangs on this: while the session is open, feedback shows between attempts,
 * and once it closes, the stage's show-feedback decides (section 7.19.1).
 *
 * @param document The item.
 * @param attempts The attempts made.
 * @param maxAttempts The stage's limit, 1 or more.
 * @returns Whether the session is open.
 */
export const itemSessionOpen = (
  document: Accepted,
  attempts: readonly Pick<Attempt, "completionStatus" | "responses">[],
  maxAttempts: number,
): boolean =>
  document.item.adaptive
    ? !attempts.some((attempt) => attempt.completionStatus === "completed")
    : numAttempts(document, attempts) < maxAttempts;

/**
 * An attempt with the clock reading it was recorded at, which orders an item session's attempts:
 * the host's clock, such as the database's microseconds, each attempt of one session at its own.
 */
export type ClockedAttempt = Attempt & {
  /**
   * When the attempt was recorded, on the host's clock.
   */
  readonly at: bigint;
};

/**
 * Give the record an item session's next attempt starts from: `begin`'s record with the latest
 * attempt's values carried over, as `scoreRecord` left them.
 *
 * With no attempt it is `begun`. Otherwise `attempt` is `submitted`, `numAttempts` is
 * {@link numAttempts} over every attempt, each response, record response and declared outcome is the
 * latest attempt's, NULL where it holds none, and the built-in `completionStatus` is the latest
 * attempt's. The latest is the one of the greatest `at`, so the attempts are a set, in any order.
 * The seed, the instance, the template values and the correct responses and defaults are `begun`'s,
 * which `begin` derives again from the recorded seed.
 *
 * @param document The item.
 * @param begun The record `begin` gave for the item session.
 * @param attempts The attempts made, each with its clock reading.
 * @returns The record.
 */
export const recordAfter = (
  document: Accepted,
  begun: ItemRecord,
  attempts: readonly ClockedAttempt[],
): ItemRecord =>
  Option.match(
    Arr.last(
      Arr.sort(
        attempts,
        Order.mapInput(Order.BigInt, (attempt: ClockedAttempt) => attempt.at),
      ),
    ),
    {
      onNone: () => begun,
      onSome: (last): ItemRecord => {
        const { item } = document;
        const { records, responses } = splitResponses(last.responses);
        const declared = {
          ...Object.fromEntries(
            Array.from(item.outcomes, ([identifier, outcome]) => [
              identifier,
              nullOf(outcome.baseType, outcome.cardinality),
            ]),
          ),
          ...last.outcomes,
        };

        return {
          ...begun,
          attempt: "submitted",
          numAttempts: numAttempts(document, attempts),
          outcomes: holdsCompletionStatus(item)
            ? {
                ...declared,
                [completionStatus]: {
                  baseType: "identifier",
                  cardinality: "single",
                  values: [{ baseType: "identifier", value: last.completionStatus }],
                },
              }
            : declared,
          records: {
            ...Object.fromEntries(
              Array.from(item.records.keys(), (identifier) => [identifier, nullRecord]),
            ),
            ...records,
          },
          responses: {
            ...Object.fromEntries(
              Array.from(item.responses, ([identifier, response]) => [
                identifier,
                nullOf(response.baseType, response.cardinality),
              ]),
            ),
            ...responses,
          },
        };
      },
    },
  );
