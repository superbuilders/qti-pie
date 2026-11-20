/**
 * The credit an attempt earned: `full`, `partial` or `none`, from the item's own `SCORE` against
 * its own `MAXSCORE` ({@link credit}), which a host hands a review (`<Item>`'s `graded`) where it
 * shows the review's feedback, and each feedback part the review shows carries.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import { own } from "#plate/engine/refs.ts";
import type { Item } from "#plate/model/item.ts";
import type { RedactRecord } from "#plate/model/record.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * How much of the item's score the attempt shown earned, read from its own `SCORE` against its own
 * `MAXSCORE`: `full` when the score reaches the maximum, `none` when it is 0 or below, and
 * `partial` between.
 */
export type Credit = "full" | "none" | "partial";

/**
 * The outcomes {@link credit} reads: the item's score, "the candidate's overall performance on
 * the item", and its maximum, each of which "needs to be a float" (the information model's
 * OutcomeDeclaration, section 4.5).
 */
const scoreOutcomes = { maximum: "MAXSCORE", score: "SCORE" } as const;

/**
 * Give the value a page may grade an attempt by of one score outcome: its single finite float, read
 * from the record, when the item declares the outcome single and float and a candidate may see
 * it. An outcome whose `view` names other audiences and not `candidate` is not the candidate's;
 * with no `view` it is every audience's ("If no view is specified the outcome is treated as
 * relevant to all views", section 4.5.4).
 *
 * @param item The item, whose declaration types the outcome.
 * @param record The record of the attempt shown.
 * @param identifier The outcome, `SCORE` or `MAXSCORE`.
 * @returns The value; none when the item declares no such outcome, declares it of another type or
 *   for other views, or the record holds NULL, a value of another type or a non-finite one.
 */
const gradingValue = (
  item: Item,
  record: RedactRecord,
  identifier: string,
): Option.Option<number> =>
  Option.fromUndefinedOr(item.outcomes.get(identifier)).pipe(
    Option.filter(
      (declaration) =>
        declaration.baseType === "float" &&
        declaration.cardinality === "single" &&
        Option.match(declaration.view, {
          onNone: () => true,
          onSome: (views) => views.includes("candidate"),
        }),
    ),
    Option.flatMap(() => own(record.outcomes, identifier)),
    Option.flatMap((value) =>
      value.cardinality === "single" ? Arr.head(value.values) : Option.none(),
    ),
    Option.flatMap((single) =>
      single.baseType === "float" && Number.isFinite(single.value)
        ? Option.some(single.value)
        : Option.none(),
    ),
  );

/**
 * Give the credit an attempt earned: its own `SCORE`, `s`, against its own `MAXSCORE`, `m`, `full`
 * when `s >= m`, `none` when `s <= 0`, and `partial` when `0 < s < m`. It reads the outcomes
 * response processing set, so it is none before any has run in the attempt shown, as no modal
 * feedback shows then (section 5.93).
 *
 * It is none, so a review carries no credit, wherever the scores cannot say: when the item declares
 * no `MAXSCORE`; when either outcome is not a single float, or its value is NULL or not finite
 * ({@link gradingValue}); when `m <= 0`; when `SCORE` carries `external-scored`, since a human or
 * an external machine gives its value, and response processing's is not the attempt's score
 * (section 4.5.10); and when either outcome's `view` leaves out the candidate (section 4.5.4).
 *
 * @param document The accepted item.
 * @param record The record of the attempt shown.
 * @returns The credit, or none.
 */
export const credit = ({ item }: Accepted, record: RedactRecord): Option.Option<Credit> =>
  record.attempt === "submitted" &&
  item.outcomes.get(scoreOutcomes.score)?.externalScored === undefined
    ? Option.all([
        gradingValue(item, record, scoreOutcomes.score),
        gradingValue(item, record, scoreOutcomes.maximum),
      ]).pipe(
        Option.filter(([, maximum]) => maximum > 0),
        Option.map(([score, maximum]): Credit => {
          if (score >= maximum) {
            return "full";
          }

          return score <= 0 ? "none" : "partial";
        }),
      )
    : Option.none();
