/**
 * A delivered test's item references whose own `qti-item-session-control` sets what the test
 * runtime delivers per item, read from pantry's test views (`SessionControl`, `MaxAttempts`), each
 * a query over the ledger so the delivery level states its laws over them and its programs read
 * them (`#ledger/delivery.ts`):
 *
 * - **Individual refs**: the item references of a part whose `submission-mode` is `individual`, the
 *   only refs whose own item-session-control a delivered test admits. QTI 3.0.1 limits
 *   `validate-responses` and `allow-skipping` to such parts: "The value of this attribute is only
 *   applicable when the item is in a qti-test-part with individual submission mode" (Table 7.19.7),
 *   and in a simultaneous part "By definition the candidate can take one and only one attempt at
 *   each item" (§2.8.2, Navigation and Submission).
 * - **Validated members**: an individual ref whose control sets `validate-responses` true: "When
 *   validate-responses is turned on (true) then the candidates are not allowed to submit the item
 *   until they have provided valid responses for all interactions" (Table 7.19.7). The answer to
 *   that item, its candidate's submission, is admitted under it; the end of the part, an "expected
 *   event, such as the end of a test" (§2.2.4), is no candidate's submission, and submits it as it
 *   stands.
 * - **Unlimited members**: an individual ref whose control sets `max-attempts` 0: "A value of 0
 *   indicates no limit" (Table 7.19.1), so its item session takes another attempt after each one.
 *
 * The setting in force for an item ref is the nearest scope's that writes it (§7.19, spec reading
 * 63); a delivered test admits these two settings at the item ref's own scope alone, so a ref's own
 * control is the one in force.
 */
import { query, v } from "@bjornpagen/grizzle";
import type { LedgerLevel } from "#ledger/delivery.ts";

/**
 * The member queries of the ledger's item-ref session controls.
 *
 * @param ledger The Ledger level.
 * @returns `individualRefs`, `validatedMembers` and `unlimitedMembers`, each keyed by the test's
 *   package and path and the item ref's place, `start`, with its identifier, `item`.
 */
export const memberControlsOf = (ledger: LedgerLevel) => {
  const { MaxAttempts, SessionControl, TestMember, TestPart } = ledger.relations;

  /**
   * Each item reference of a part whose submission mode is individual, by its test and its place.
   */
  const individualRefs = query(ledger).rule((r) => {
    const { item, package: pkg, part, path, start } = v(TestMember, "individualRef");

    return r
      .match(TestMember, { item, package: pkg, part, path, start })
      .match(TestPart, { package: pkg, path, start: part, submission: "individual" })
      .find({ item, package: pkg, path, start });
  });

  /**
   * Each individual ref whose own item-session-control sets `validate-responses` true.
   */
  const validatedMembers = query(ledger).rule((r) => {
    const { item, package: pkg, path, start } = v(individualRefs, "validatedRef");

    return r
      .match(individualRefs, { item, package: pkg, path, start })
      .match(SessionControl, {
        package: pkg,
        path,
        scope: start,
        setting: "validate-responses",
        value: true,
      })
      .find({ item, package: pkg, path, start });
  });

  /**
   * Each individual ref whose own item-session-control sets `max-attempts` 0, no limit.
   */
  const unlimitedMembers = query(ledger).rule((r) => {
    const { item, package: pkg, path, start } = v(individualRefs, "unlimitedRef");

    return r
      .match(individualRefs, { item, package: pkg, path, start })
      .match(MaxAttempts, { attempts: 0, package: pkg, path, scope: start })
      .find({ item, package: pkg, path, start });
  });

  return { individualRefs, unlimitedMembers, validatedMembers } as const;
};
