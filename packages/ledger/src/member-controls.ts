/**
 * The item-session control each member of a delivered test is delivered under, read from pantry's
 * test views (`SessionControl`, `MaxAttempts`, `TestMember`, `ItemRefSection`), each a query over
 * the ledger so the delivery level states its laws over them and its programs read them
 * (`#ledger/delivery.ts`):
 *
 * - **Settings in force**: each setting a member's item session is delivered under is the nearest
 *   scope's that writes it, the item ref's own control, then each section that holds it, innermost
 *   first, then its part, and QTI's default where none does: "a setting at qti-test-part level
 *   affects all items in that part unless the setting is overridden at the qti-assessment-section
 *   level or ultimately at the individual qti-assessment-item-ref. The defaults for an
 *   qti-Item-session-control are used only in the absence of any applicable constraint" (§7.19,
 *   spec reading 63). Every scope of a ref is an element that holds it, so the nearest is the one
 *   that starts last.
 * - **Member controls**: each member's `max-attempts`, `show-feedback` and `show-solution` in force,
 *   by its test and its place: "If it is unspecified it is treated as 1 for non-adaptive items"
 *   (Table 7.19.1; a delivered test refers to no adaptive item), and show-feedback's and
 *   show-solution's "The default is 'false'" (Tables 7.19.2, 7.19.3). What a served item shows of
 *   them is `#ledger/session-control.ts`'s.
 * - **Individual refs**: the item references of a part whose `submission-mode` is `individual`, the
 *   only refs whose own item-session-control a delivered test admits. QTI 3.0.1 limits
 *   `validate-responses` and `allow-skipping` to such parts: "The value of this attribute is only
 *   applicable when the item is in a qti-test-part with individual submission mode" (Table 7.19.7),
 *   and in a simultaneous part "By definition the candidate can take one and only one attempt at
 *   each item" (§2.8.2, Navigation and Submission).
 * - **Validated members**: an individual ref whose `validate-responses` in force is true: "When
 *   validate-responses is turned on (true) then the candidates are not allowed to submit the item
 *   until they have provided valid responses for all interactions" (Table 7.19.7). The answer to
 *   that item, its candidate's submission, is admitted under it; the end of the part, an "expected
 *   event, such as the end of a test" (§2.2.4), is no candidate's submission, and submits it as it
 *   stands.
 * - **Unlimited members**: an individual ref whose `max-attempts` in force is 0: "A value of 0
 *   indicates no limit" (Table 7.19.1), so its item session takes another attempt after each one.
 *
 * A delivered test admits validate-responses true and max-attempts 0 at an individual ref's own
 * scope alone, so for those two the ref's own control is the one in force.
 */
import { pg, query, Type, v } from "@bjornpagen/grizzle";
import type { LedgerLevel } from "#ledger/delivery.ts";

/**
 * The member queries of the ledger's item-session controls.
 *
 * @param ledger The Ledger level.
 * @returns `memberControls`, each member's settings in force, and `individualRefs`,
 *   `validatedMembers` and `unlimitedMembers`, each keyed by the test's package and path and the
 *   item ref's place, `start`, with its identifier, `item`.
 */
export const memberControlsOf = (ledger: LedgerLevel) => {
  const { ItemRefSection, MaxAttempts, SessionControl, TestMember, TestPart } = ledger.relations;

  /**
   * Each scope of an item ref, by the ref's place and the scope's: the ref itself, each section
   * that holds it at any depth, and its part.
   */
  const refScopes = query(ledger)
    .rule((r) => {
      const { package: pkg, path, start } = v(TestMember, "ownScope");

      return r.match(TestMember, { package: pkg, path, start }).find({
        package: pkg,
        path,
        scope: start,
        start,
      });
    })
    .rule((r) => {
      const { package: pkg, path, section, start } = v(ItemRefSection, "sectionScope");

      return r.match(ItemRefSection, { package: pkg, path, section, start }).find({
        package: pkg,
        path,
        scope: section,
        start,
      });
    })
    .rule((r) => {
      const { package: pkg, part, path, start } = v(TestMember, "partScope");

      return r.match(TestMember, { package: pkg, part, path, start }).find({
        package: pkg,
        path,
        scope: part,
        start,
      });
    });

  /**
   * Each scope of an item ref that writes a boolean setting, by the ref, the setting and the scope.
   */
  const statingScopes = query(ledger).rule((r) => {
    const { package: pkg, path, scope, start } = v(refScopes, "statingScope");
    const { setting } = v(SessionControl, "stated");

    return r
      .match(refScopes, { package: pkg, path, scope, start })
      .match(SessionControl, { package: pkg, path, scope, setting })
      .find({ package: pkg, path, scope, setting, start });
  });

  /**
   * Each boolean setting a scope of an item ref writes, by the ref and the setting, with the
   * nearest such scope, the one that starts last.
   */
  const nearestSettings = query(ledger).rule((r) => {
    const { package: pkg, path, scope, setting, start } = v(statingScopes, "nearestScope");

    return r
      .match(statingScopes, { package: pkg, path, scope, setting, start })
      .find({ package: pkg, path, scope: r.max(scope), setting, start });
  });

  /**
   * Each boolean setting in force for an item ref that some scope of it writes, with its value.
   */
  const settingsInForce = query(ledger).rule((r) => {
    const { package: pkg, path, scope, setting, start } = v(nearestSettings, "nearest");
    const { value } = v(SessionControl, "inForce");

    return r
      .match(nearestSettings, { package: pkg, path, scope, setting, start })
      .match(SessionControl, { package: pkg, path, scope, setting, value })
      .find({ package: pkg, path, setting, start, value });
  });

  /**
   * Each scope of an item ref that writes a `max-attempts`, by the ref and the scope.
   */
  const attemptScopes = query(ledger).rule((r) => {
    const { package: pkg, path, scope, start } = v(refScopes, "attemptScope");

    return r
      .match(refScopes, { package: pkg, path, scope, start })
      .match(MaxAttempts, { package: pkg, path, scope })
      .find({ package: pkg, path, scope, start });
  });

  /**
   * The nearest scope of an item ref that writes a `max-attempts`, the one that starts last.
   */
  const nearestAttempts = query(ledger).rule((r) => {
    const { package: pkg, path, scope, start } = v(attemptScopes, "nearestAttemptScope");

    return r
      .match(attemptScopes, { package: pkg, path, scope, start })
      .find({ package: pkg, path, scope: r.max(scope), start });
  });

  /**
   * Each member's `max-attempts` in force, a bigint: the nearest scope's, else QTI's 1.
   */
  const attemptsInForce = query(ledger)
    .rule((r) => {
      const { package: pkg, path, scope, start } = v(nearestAttempts, "stated");
      const { attempts } = v(MaxAttempts, "attemptsInForce");

      return r
        .match(nearestAttempts, { package: pkg, path, scope, start })
        .match(MaxAttempts, { attempts, package: pkg, path, scope })
        .find({ maxAttempts: Type.cast(attempts, pg.bigint), package: pkg, path, start });
    })
    .rule((r) => {
      const { package: pkg, path, start } = v(TestMember, "defaultAttempts");

      return r
        .match(TestMember, { package: pkg, path, start })
        .where(r.not(nearestAttempts, { package: pkg, path, start }))
        .find({ maxAttempts: Type.literal(pg.bigint, 1n), package: pkg, path, start });
    });

  /**
   * Each member's value in force of a boolean setting whose default is false: the nearest scope's,
   * else false.
   *
   * @param setting The setting.
   * @returns The query, by the member, with its `value`.
   */
  const falseByDefault = (setting: "show-feedback" | "show-solution") =>
    query(ledger)
      .rule((r) => {
        const { package: pkg, path, start, value } = v(settingsInForce, "stated");

        return r
          .match(settingsInForce, { package: pkg, path, setting, start, value })
          .find({ package: pkg, path, start, value });
      })
      .rule((r) => {
        const { package: pkg, path, start } = v(TestMember, "unstated");

        return r
          .match(TestMember, { package: pkg, path, start })
          .where(r.not(nearestSettings, { package: pkg, path, setting, start }))
          .find({ package: pkg, path, start, value: Type.literal(pg.boolean, false) });
      });

  const feedbackInForce = falseByDefault("show-feedback");
  const solutionInForce = falseByDefault("show-solution");

  /**
   * Each member's `max-attempts`, `show-feedback` and `show-solution` in force, one row a member.
   */
  const memberControls = query(ledger).rule((r) => {
    const { package: pkg, path, start } = v(TestMember, "controlled");
    const { maxAttempts } = v(attemptsInForce, "memberAttempts");
    const { value: showFeedback } = v(feedbackInForce, "memberFeedback");
    const { value: showSolution } = v(solutionInForce, "memberSolution");

    return r
      .match(TestMember, { package: pkg, path, start })
      .match(attemptsInForce, { maxAttempts, package: pkg, path, start })
      .match(feedbackInForce, { package: pkg, path, start, value: showFeedback })
      .match(solutionInForce, { package: pkg, path, start, value: showSolution })
      .find({ maxAttempts, package: pkg, path, showFeedback, showSolution, start });
  });

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
   * Each individual ref whose `validate-responses` in force is true.
   */
  const validatedMembers = query(ledger).rule((r) => {
    const { item, package: pkg, path, start } = v(individualRefs, "validatedRef");

    return r
      .match(individualRefs, { item, package: pkg, path, start })
      .match(settingsInForce, {
        package: pkg,
        path,
        setting: "validate-responses",
        start,
        value: true,
      })
      .find({ item, package: pkg, path, start });
  });

  /**
   * Each individual ref whose `max-attempts` in force is 0, no limit.
   */
  const unlimitedMembers = query(ledger).rule((r) => {
    const { item, package: pkg, path, start } = v(individualRefs, "unlimitedRef");
    const { maxAttempts } = v(attemptsInForce, "noLimit");

    return r
      .match(individualRefs, { item, package: pkg, path, start })
      .match(attemptsInForce, { maxAttempts, package: pkg, path, start })
      .where(r.eq(maxAttempts, 0n))
      .find({ item, package: pkg, path, start });
  });

  return { individualRefs, memberControls, unlimitedMembers, validatedMembers } as const;
};
