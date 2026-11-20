/**
 * The credit the owner's rule gives an attempt (Bjorn, 2026-11-18, through the lead): the item's
 * own `SCORE` against its `MAXSCORE` where it declares one, as plate's `credit` reads them; where
 * it declares none, against `SCORE`'s own `normal-maximum`, QTI's declared bound of the outcome
 * (information model 4.5); and none where neither says.
 *
 * It is written apart from every grader, plate's and the database's, as the table of a rule the
 * database grader is held to: the golden records it beside plate's credit, so the oracle stays
 * exact on the 53 corpus and fixture items the rule changes (and the bank, which declares
 * `MAXSCORE` everywhere, it does not).
 *
 * @module
 */
import { Option } from "effect";
import { credit } from "#plate/credit.ts";
import type { Credit } from "#plate/credit.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * Give the credit of a score against a positive maximum: `full` at or above it, `none` at or below
 * 0, `partial` between.
 *
 * @param score The score.
 * @param maximum The maximum, above 0.
 * @returns The credit.
 */
const creditAgainst = (score: number, maximum: number): Credit => {
  if (score >= maximum) {
    return "full";
  }

  return score <= 0 ? "none" : "partial";
};

/**
 * Give the credit the owner's rule gives the attempt a record holds.
 *
 * @param accepted The item.
 * @param record The record after the attempt.
 * @returns The credit, or none.
 */
export const ownerCredit = (accepted: Accepted, record: ItemRecord): Option.Option<Credit> => {
  const { outcomes } = accepted.item;

  if (outcomes.has("MAXSCORE")) {
    return credit(accepted, record);
  }

  const declared = outcomes.get("SCORE");
  const held = record.outcomes["SCORE"]?.values[0];

  return declared !== undefined &&
    declared.baseType === "float" &&
    declared.cardinality === "single" &&
    declared.externalScored === undefined &&
    Option.match(declared.view, {
      onNone: () => true,
      onSome: (views) => views.includes("candidate"),
    }) &&
    held?.baseType === "float" &&
    Number.isFinite(held.value)
    ? declared.normalMaximum.pipe(
        Option.filter((maximum) => maximum > 0),
        Option.map((maximum) => creditAgainst(held.value, maximum)),
      )
    : Option.none();
};
