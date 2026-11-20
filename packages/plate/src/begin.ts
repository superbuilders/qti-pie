/**
 * Start the record of an item's first attempt: {@link begin}.
 *
 * @module
 */
import type { Result } from "effect";
import { firstAttempt } from "#plate/engine/attempt.ts";
import type { EngineFailure } from "#plate/engine/evaluate.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * Start the record of an item's first attempt: run its template processing under a seed and set
 * every response and outcome to its default.
 *
 * The seed is the host's, used as given: the processing seed `itemSeeds` derives from the
 * decision's. It keys every value template and response processing draw, so it is their secret:
 * a guessable seed, such as `"7"` or `""`, lets anyone who sees the page and the item recompute
 * them. `begin` never reads the configuration's `seed`, which keys a shuffled interaction's order.
 *
 * The record holds the seed, the template values template processing drew under it, the instance
 * and the item, the correct responses and defaults it set, and each response and outcome at its
 * default. The same document, instance and seed give the same record every run, so a host stores
 * none of it: it calls `begin` again from the recorded seed, and `recordAfter` carries the
 * recorded attempts onto it. An item that declares no template variable holds no template value,
 * correct response or default.
 *
 * The record is server data: its seed keys every value it draws, and its template values and
 * correct responses can give the answers away, so it never reaches the page.
 *
 * @example
 *   const record = begin(accepted, { instance: "q1", seed: seeds.processing });
 *   // Result.succeed(record), the same every run; render the first page with it and pass it to
 *   // scoreRecord with the first responses.
 *
 * @param document The document `checkAdmitted` accepted.
 * @param start The use of the item the record starts.
 * @param start.instance The host's name for this use of the item, which scopes its ids.
 * @param start.seed The host's seed, which keys every value template and response processing draws,
 *   used as given.
 * @returns The record of the first attempt, or an {@link EngineFailure} from template processing.
 *   The engine's failure cannot occur on a checked item: the database refuses, or the item model
 *   marks, every cause on an accepted item (a read of a variable template processing holds no value
 *   of, a rule setting a variable the item does not declare in the kind the rule sets, a value of
 *   another type), so a host writes no handling for it. A built-in named as the kind it stands as
 *   is no such cause (E22a, reading 111): a `qti-set-correct-response` of `numAttempts` and a
 *   `qti-set-default-value` of `completionStatus` or `numAttempts` run, and the record holds the
 *   built-in's correct response or default they set. An item whose template processing the model
 *   marks, because it holds an element the engine does not run or names a variable the engine does
 *   not hold (such as `QTI_CONTEXT` read other than whole by `qti-field-value`, `qti-is-null` or
 *   `qti-match`, the default of a context variable, or a template or context variable of a type
 *   plate does not model), does not run it: its record begins with each response and outcome at its
 *   declared default and no template value, correct response or default, and `checkAdmitted`'s
 *   verdict tells the host, `accepted-with-unsupported` with each mark (`variable:<identifier>` at
 *   `qti-template-processing` for a name the engine does not hold).
 */
export const begin = (
  document: Accepted,
  start: {
    readonly instance: string;
    readonly seed: string;
  },
): Result.Result<ItemRecord, EngineFailure> => firstAttempt(document.item, start);
