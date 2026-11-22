/**
 * The credit's relations of the delivery level (`#delivery.ts`), whose list spreads
 * {@link creditRelationsOf}: what an attempt's outcomes in force make of its credit, derived and
 * never stored. They read the ledger's attempts, so they stand a level above it, since a derived
 * relation's definition is a query over the levels below it (grizzle's README, "Derived tables" and
 * "Levels"). An item is its document's path in its package (SV-KEY-01), so every heading here
 * carries `path` where an attempt's carried `item`.
 *
 * - **AttemptCredit**: an attempt's credit, the owner's rule (proposal 2026-11-18-grading-in-sql,
 *   Decision 3) over its SCORE in force and its maximum, each read as a number whatever its
 *   declared base type (the numeric outcome in force, `#assertion-views.ts`): the exact pair
 *   (earned, maximum) and its category, from the declared function `credit` (`#grading.ts`,
 *   out/grading-sql/p3/credit.sql), so the category and the fraction are one fact.
 */
import { derived, Fn, query, v } from "@bjornpagen/grizzle";
import type { assertionViewsOf } from "#ledger/assertion-views.ts";
import { credit } from "#ledger/grading.ts";
import type { ledgerOf } from "#ledger/ledger.ts";

export const creditRelationsOf = (
  ledger: ReturnType<typeof ledgerOf>,
  assertions: Pick<
    ReturnType<typeof assertionViewsOf>,
    "outcomeInForceNumber" | "pendingExternalScorings"
  >,
) => {
  const { MaximumNormal, MaximumOutcome } = ledger.relations;
  const { outcomeInForceNumber, pendingExternalScorings } = assertions;

  /**
   * An attempt's credit, by its key `(child, package, path, n, at)`: the owner's rule's arithmetic
   * (`credit`) over the attempt's SCORE in force and its maximum, each a number in force (a float
   * as itself, an integer as its exact double; a value of any other base type is none, so it has no
   * credit), one rule per maximum source, disjoint by the content's own declarations: the attempt's
   * MAXSCORE in force where the item's is the maximum ({@link MaximumOutcome}), else SCORE's
   * `normal-maximum` ({@link MaximumNormal}). An attempt with no SCORE or MAXSCORE in force (QTI's
   * NULL) has no credit, nor does one whose SCORE or MAXSCORE is external-scored and not yet
   * asserted (`PendingExternalScoring`: its value in force is response processing's, which "is NOT
   * final", Results Reporting Table 2.7.7), and so does one `credit` gives no row: a SCORE that is
   * no finite number, or a maximum that is not a finite number above 0. QTI states no credit; it
   * states the outcomes and leaves them unclamped ("normalMaximum has no affect on
   * responseProcessing or the values that the outcome variable itself can take", Table 4.5.7), so
   * this rule reads them and rewrites none.
   */
  const AttemptCredit = derived(
    "AttemptCredit",
    query(ledger)
      .rule((r) => {
        const { child, package: pkg, path, n, at, value: score } = v(outcomeInForceNumber, "score");
        const { value: maximum } = v(outcomeInForceNumber, "maximum");
        const credited = Fn.rows(credit, { maximum, score });
        const { earned, maximum: of, kind } = v(credited, "credit");

        return r
          .match(outcomeInForceNumber, {
            at,
            child,
            n,
            package: pkg,
            path,
            value: score,
            variable: "SCORE",
          })
          .match(outcomeInForceNumber, {
            at,
            child,
            n,
            package: pkg,
            path,
            value: maximum,
            variable: "MAXSCORE",
          })
          .match(MaximumOutcome, { package: pkg, path })
          .match(credited, { earned, kind, maximum: of })
          .where(
            r.not(pendingExternalScorings, { at, child, n, package: pkg, path, variable: "SCORE" }),
            r.not(pendingExternalScorings, {
              at,
              child,
              n,
              package: pkg,
              path,
              variable: "MAXSCORE",
            }),
          )
          .find({ at, child, earned, kind, maximum: of, n, package: pkg, path });
      })
      .rule((r) => {
        const { child, package: pkg, path, n, at, value: score } = v(outcomeInForceNumber, "score");
        const { maximum } = v(MaximumNormal, "normal");
        const credited = Fn.rows(credit, { maximum, score });
        const { earned, maximum: of, kind } = v(credited, "credit");

        return r
          .match(outcomeInForceNumber, {
            at,
            child,
            n,
            package: pkg,
            path,
            value: score,
            variable: "SCORE",
          })
          .match(MaximumNormal, { maximum, package: pkg, path })
          .match(credited, { earned, kind, maximum: of })
          .where(
            r.not(pendingExternalScorings, { at, child, n, package: pkg, path, variable: "SCORE" }),
          )
          .find({ at, child, earned, kind, maximum: of, n, package: pkg, path });
      }),
  );

  return [AttemptCredit] as const;
};
