/**
 * An item session's attempts as QTI counts them, derived and never stored, at the Delivery level
 * over the ledger: which attempts the built-in `numAttempts` counts, and which adaptive item
 * sessions are complete. Whether a session takes another attempt reads these two, under the control
 * it is delivered under (`#ledger/session-control.ts`).
 *
 * - **CountedAttempt**: each attempt `numAttempts` counts. "All Delivery Engines must maintain the
 *   value of numAttempts. This is a single integer that records the number of attempts at each item
 *   the candidate has taken. The value defaults to '0' initially and then increases by '1' at the
 *   start of each attempt" (§2.2.2.1, info:4702), but for an attempt the candidate ended through an
 *   End Attempt whose `count-attempt` is false: the attribute "Defines the number of attempts that
 *   a user can make using the 'endAttemptInteraction' mechanism (this can be used to limit the
 *   number of hints, etc.)" (Table 5.45.3), a boolean (spec readings 27 and 204: false leaves
 *   `numAttempts` unchanged for the attempt ended through that button), and "If the candidate
 *   invokes response processing using an endAttemptInteraction then the associated response
 *   variable is set to 'true'" (Table 5.45), so the attempt's value of that response is `true`
 *   exactly when the candidate ended it there.
 * - **CompletedSession**: each item session of an adaptive item one of whose attempts' response
 *   processing set the built-in `completionStatus` to `completed`: "For adaptive items, the value
 *   of max-attempts is ignored as the number of attempts is limited by the value of the
 *   completion-status built-in outcome variable" (Table 7.19.1).
 */
import { derived, query, v } from "@bjornpagen/grizzle";
import { booleanFalse } from "@qti-pie/pantry/grammar/domains.ts";
import type { LedgerLevel } from "#ledger/delivery.ts";

/**
 * The responses an End Attempt binds whose `count-attempt` is false, by their item's package and
 * document and the response's identifier: the item's `qti-end-attempt-interaction` binds it
 * (`response-identifier`, Table 5.45.1) and its `count-attempt` spells false (xs:boolean's `false`
 * or `0`, the attribute's value collapsed). An attempt that holds such a response `true` is one the
 * candidate ended through that button, which `numAttempts` does not count; grading reads this query
 * beside the attempt it is given, and {@link countedAttemptsOf} beside the stored ones.
 *
 * @param ledger - The ledger level.
 * @returns The query.
 */
export const uncountingResponsesOf = (ledger: LedgerLevel) => {
  const { Attribute, BoundVariable, Node } = ledger.relations;

  return query(ledger).rule((r) => {
    const { package: pkg, path, start, identifier } = v(BoundVariable, "endAttempt");
    const { value: countAttempt } = v(Attribute, "countAttempt");

    return r
      .match(Node, { kind: "qti-end-attempt-interaction", package: pkg, path, start })
      .match(BoundVariable, {
        attribute: "response-identifier",
        identifier,
        package: pkg,
        path,
        start,
      })
      .match(Attribute, {
        kind: "qti-end-attempt-interaction",
        name: "count-attempt",
        package: pkg,
        path,
        start,
        value: countAttempt,
      })
      .where(r.in(countAttempt, booleanFalse))
      .find({ identifier, package: pkg, path });
  });
};

/**
 * Each stored attempt the built-in `numAttempts` counts, as a plain query: every attempt but one
 * the candidate ended through an End Attempt whose `count-attempt` is false ({@link
 * uncountingResponsesOf}).
 *
 * @param ledger - The ledger level.
 * @returns The query.
 */
export const countedAttemptsOf = (ledger: LedgerLevel) => {
  const { Attempt, SnapshotSingleBoolean } = ledger.relations;
  const uncountingResponses = uncountingResponsesOf(ledger);

  const uncountedAttempts = query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at } = v(Attempt, "uncounted");
    const { identifier } = v(uncountingResponses, "uncounting");

    return r
      .match(Attempt, { at, child, n, package: pkg, path })
      .match(uncountingResponses, { identifier, package: pkg, path })
      .match(SnapshotSingleBoolean, {
        at,
        child,
        n,
        package: pkg,
        path,
        value: true,
        variable: identifier,
      })
      .find({ at, child, n, package: pkg, path });
  });

  return query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at } = v(Attempt, "counted");

    return r
      .match(Attempt, { at, child, n, package: pkg, path })
      .where(r.not(uncountedAttempts, { at, child, n, package: pkg, path }))
      .find({ at, child, n, package: pkg, path });
  });
};

/**
 * Each item session of an adaptive item one of whose attempts' response processing set
 * `completionStatus` to `completed` (the ledger's `ProcessedAttempt`), as a plain query.
 *
 * @param ledger - The ledger level.
 * @returns The query.
 */
export const completedSessionsOf = (ledger: LedgerLevel) => {
  const { ItemMode, ProcessedAttempt } = ledger.relations;

  return query(ledger).rule((r) => {
    const { child, package: pkg, path, n } = v(ProcessedAttempt, "completing");

    return r
      .match(ProcessedAttempt, { child, completionStatus: "completed", n, package: pkg, path })
      .match(ItemMode, { adaptive: true, package: pkg, path })
      .find({ child, n, package: pkg, path });
  });
};

/**
 * The Delivery level's relations of an item session's attempts over the ledger `ledger`, for the
 * level to spread.
 *
 * @param ledger - The ledger level.
 * @returns The derived relations.
 */
export const sessionAttemptsOf = (ledger: LedgerLevel) => {
  /**
   * Each attempt the built-in `numAttempts` counts: every attempt but those ended through a hint
   * that counts none.
   */
  const CountedAttempt = derived("CountedAttempt", countedAttemptsOf(ledger));

  /**
   * Each item session of an adaptive item one of whose attempts' response processing set
   * `completionStatus` to `completed` (the ledger's `ProcessedAttempt`).
   */
  const CompletedSession = derived("CompletedSession", completedSessionsOf(ledger));

  return [CountedAttempt, CompletedSession] as const;
};
