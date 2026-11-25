/**
 * The item-session control each item session is delivered under, and whether it takes another
 * attempt, at the Delivery level over the ledger, derived and never stored: the one statement of
 * both every application serves an item session by (edullm's QTI app, metis), so none states a
 * setting of its own or decides what a served item shows (`#ledger/served-item.ts` reads them).
 *
 * - **ItemSessionControl** `(child, package, path, n) → maxAttempts, showFeedback, showSolution`: the
 *   session's effective `qti-item-session-control`. A test sitting's member's is its test's, each
 *   setting the nearest scope's that writes it, else QTI's default, the Ledger's `MemberControl`
 *   stored at publication (`#ledger/member-controls.ts`), read by the session's test and item
 *   document; an item stage's is its `StageControl`, which the application's decision states, since
 *   no test's scope holds the item.
 * - **ItemSessionOpen** `(child, package, path, n)`: each session that takes another attempt. An
 *   adaptive item's until its `completionStatus` is completed, "the number of attempts is limited
 *   by the value of the completion-status built-in outcome variable"; any other's under
 *   max-attempts 0, "A value of 0 indicates no limit", and else while the attempts `numAttempts`
 *   counts are fewer than its max-attempts (Table 7.19.1); and none of a sitting that ended, since
 *   the end of its part is the "expected event, such as the end of a test" after which no attempt
 *   is taken (§2.2.4). A session with no row is closed.
 * - **ItemStageSession** `(child, stage)`: each stage that serves an item session and is no test
 *   sitting, an item stage, which "Item stage control" holds to its `StageControl`.
 * - **SittingStageControl** `(child, stage) → held`: each test sitting with a `StageControl`, `held`
 *   false, which "Sitting control from its test" refuses.
 *
 * Each is derived from facts, never stored by a writer: the take's item sessions, the content's
 * scopes, the stage's control the decision inserts, the attempts and the end. A read of a session's
 * control, its openness, its counted attempts and the attempts it has left is by the session's
 * whole key (child, package, path, n), its own rows, and its control is computed once, as its take
 * inserts the session (the read-committed plan's data rules, 2026-11-23).
 *
 * QTI 3.0.1 information model Table 7.19.1, `max-attempts`: "A value of max-attempts greater than
 * 1, by definition, indicates that any applicable feedback must be shown. … However, once the
 * maximum number of allowed attempts have been used (or for adaptive items, completion-status has
 * been set to completed) whether or not feedback is shown is controlled by the show-feedback
 * constraint."
 *
 * @module
 */
import type { Facts, NaturalDomain, Term } from "@bjornpagen/grizzle";
import { check, contained, derived, Num, on, pg, query, Type, v } from "@bjornpagen/grizzle";
import type { deliveryOf, LedgerLevel } from "#ledger/delivery.ts";
import { named } from "#ledger/laws.ts";
import { completedSessionsOf, countedAttemptsOf } from "#ledger/session-attempts.ts";

/**
 * The Delivery level's relations of each item session's control over the ledger `ledger`, and
 * their laws, for the level to spread.
 *
 * @param ledger - The ledger level.
 * @returns The derived relations and their laws.
 */
export const sessionControlsOf = (ledger: LedgerLevel) => {
  const { ItemMode, ItemSession, MemberControl, StageControl, TestEnd, TestSession } =
    ledger.relations;

  /**
   * Each item session's control: a member's from its test, an item stage's from its stage.
   */
  const controls = query(ledger)
    .rule((r) => {
      const { child, package: pkg, path, n, stage } = v(ItemSession, "memberSession");
      const { path: test } = v(TestSession, "memberSitting");
      const { maxAttempts, showFeedback, showSolution } = v(MemberControl, "memberControl");

      return r
        .match(ItemSession, { child, n, package: pkg, path, stage })
        .match(TestSession, { child, package: pkg, path: test, stage })
        .match(MemberControl, {
          document: path,
          maxAttempts,
          package: pkg,
          path: test,
          showFeedback,
          showSolution,
        })
        .find({ child, maxAttempts, n, package: pkg, path, showFeedback, showSolution });
    })
    .rule((r) => {
      const { child, package: pkg, path, n, stage } = v(ItemSession, "stageSession");
      const { maxAttempts, showFeedback, showSolution } = v(StageControl, "stageControl");

      return r
        .match(ItemSession, { child, n, package: pkg, path, stage })
        .match(StageControl, { child, maxAttempts, showFeedback, showSolution, stage })
        .find({
          child,
          maxAttempts: Type.base(maxAttempts),
          n,
          package: pkg,
          path,
          showFeedback,
          showSolution,
        });
    });

  const ItemSessionControl = derived("ItemSessionControl", controls);

  const counted = countedAttemptsOf(ledger);
  const completed = completedSessionsOf(ledger);

  /**
   * Each item session's counted attempts, `numAttempts` after its last, where it has one.
   */
  const counts = query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at } = v(counted, "countedAttempt");

    return r
      .match(counted, { at, child, n, package: pkg, path })
      .find({ child, counted: r.count(), n, package: pkg, path });
  });

  const ItemSessionOpen = derived(
    "ItemSessionOpen",
    query(ledger)
      .rule((r) => {
        const { child, package: pkg, path, n, stage } = v(ItemSession, "adaptiveSession");

        return r
          .match(ItemSession, { child, n, package: pkg, path, stage })
          .match(ItemMode, { adaptive: true, package: pkg, path })
          .where(
            r.not(completed, { child, n, package: pkg, path }),
            r.not(TestEnd, { child, stage }),
          )
          .find({ child, n, package: pkg, path });
      })
      .rule((r) => {
        const { child, package: pkg, path, n, stage } = v(ItemSession, "unlimitedSession");
        const { maxAttempts } = v(controls, "noLimit");

        return r
          .match(ItemSession, { child, n, package: pkg, path, stage })
          .match(controls, { child, maxAttempts, n, package: pkg, path })
          .where(
            r.eq(maxAttempts, 0n),
            r.not(ItemMode, { adaptive: true, package: pkg, path }),
            r.not(TestEnd, { child, stage }),
          )
          .find({ child, n, package: pkg, path });
      })
      .rule((r) => {
        const { child, package: pkg, path, n, stage } = v(ItemSession, "untriedSession");

        return r
          .match(ItemSession, { child, n, package: pkg, path, stage })
          .where(
            r.not(ItemMode, { adaptive: true, package: pkg, path }),
            r.not(counted, { child, n, package: pkg, path }),
            r.not(TestEnd, { child, stage }),
          )
          .find({ child, n, package: pkg, path });
      })
      .rule((r) => {
        const { child, package: pkg, path, n, stage } = v(ItemSession, "triedSession");
        const { counted: made } = v(counts, "tried");
        const { maxAttempts } = v(controls, "limit");

        return r
          .match(ItemSession, { child, n, package: pkg, path, stage })
          .match(counts, { child, counted: made, n, package: pkg, path })
          .match(controls, { child, maxAttempts, n, package: pkg, path })
          .where(
            r.not(ItemMode, { adaptive: true, package: pkg, path }),
            r.not(TestEnd, { child, stage }),
            r.lt(Type.base(made), maxAttempts),
          )
          .find({ child, n, package: pkg, path });
      }),
  );

  const ItemStageSession = derived(
    "ItemStageSession",
    query(ledger).rule((r) => {
      const { child, stage } = v(ItemSession, "stageSession");

      return r
        .match(ItemSession, { child, stage })
        .where(r.not(TestSession, { child, stage }))
        .find({ child, stage });
    }),
  );

  const SittingStageControl = derived(
    "SittingStageControl",
    query(ledger).rule((r) => {
      const { child, stage } = v(TestSession, "controlledSitting");

      return r
        .match(TestSession, { child, stage })
        .match(StageControl, { child, stage })
        .find({ child, held: Type.literal(pg.boolean, false), stage });
    }),
  );

  const relations = [
    ItemSessionControl,
    ItemSessionOpen,
    ItemStageSession,
    SittingStageControl,
  ] as const;

  const laws = [
    named(
      "Item stage control",
      contained(on(ItemStageSession, "child", "stage"), on(StageControl, "child", "stage")),
    ),
    named(
      "Sitting control from its test",
      check("Sitting_control_from_its_test", SittingStageControl, (c) => c.eq(c.held, true)),
    ),
  ] as const;

  return { laws, relations } as const;
};

/**
 * The Delivery level, whose relations an item session's read reads.
 */
type DeliveryLevel = ReturnType<typeof deliveryOf>;

/**
 * A text field as a parent row carries it to the reads attached to it.
 */
type TextTerm = Term<string, unknown, unknown, "text", unknown, Facts, unknown>;

/**
 * An item session's place as a parent row carries it.
 */
type NaturalTerm = Term<NaturalDomain, unknown, unknown, "bigint", unknown, Facts, unknown>;

/**
 * An item session's key as a parent row carries it: its child, its item and its place.
 */
export type SessionKey = Readonly<{
  child: TextTerm;
  n: NaturalTerm;
  package: TextTerm;
  path: TextTerm;
}>;

/**
 * An item session's key alone, out of a row that carries it.
 *
 * @param key The row.
 * @returns Its child, item and place.
 */
const keyOf = (key: SessionKey) => ({
  child: key.child,
  n: key.n,
  package: key.package,
  path: key.path,
});

/**
 * Give an item session's control and its state, as a read to attach under an application's read of
 * one item session, by the session's key its parent row carries (edullm's `servedItem`,
 * `decideStage`'s read-back, `sittingItem` and an answer's read-back; metis's member reads): its
 * `ItemSessionControl`, with `open`, some exactly where it takes another attempt
 * (`ItemSessionOpen`), `counted`, its attempts `numAttempts` counts, one row where it has one, and
 * `left`, the attempts its max-attempts leaves it, one row but under max-attempts 0 and for an
 * adaptive item. What
 * `#ledger/served-item.ts`'s `sessionFactsOf` reads; no parameter of the reading statement's.
 *
 * @param delivery The Delivery level.
 * @returns The session's control, an `"array"` attachment of one row.
 */
export const sessionControlOf = (delivery: DeliveryLevel) => {
  const { CountedAttempt, ItemMode, ItemSessionControl, ItemSessionOpen } = delivery.relations;

  /**
   * Each item session's counted attempts, where it has one.
   */
  const counts = query(delivery).rule((r) => {
    const { child, package: pkg, path, n, at } = v(CountedAttempt, "countedAttempt");

    return r
      .match(CountedAttempt, { at, child, n, package: pkg, path })
      .find({ attempts: r.count(), child, n, package: pkg, path });
  });

  /**
   * The session's counted attempts, where it has one.
   */
  const countedOf = (session: SessionKey) =>
    query(delivery).rule((r) => {
      const { attempts } = v(counts, "sessionCount");

      return r.match(counts, { ...keyOf(session), attempts }).find({ attempts });
    });

  /**
   * The attempts the session's max-attempts leaves it, its limit less the attempts it counts, none
   * before its first: none for an adaptive item or under 0.
   */
  const leftOf = (session: SessionKey) =>
    query(delivery)
      .rule((r) => {
        const { maxAttempts } = v(ItemSessionControl, "untriedLimit");

        return r
          .match(ItemSessionControl, { ...keyOf(session), maxAttempts })
          .where(
            r.gt(maxAttempts, 0n),
            r.not(ItemMode, { adaptive: true, package: session.package, path: session.path }),
            r.not(CountedAttempt, keyOf(session)),
          )
          .find({ left: Num.sub(maxAttempts, 0n) });
      })
      .rule((r) => {
        const { maxAttempts } = v(ItemSessionControl, "triedLimit");
        const { attempts } = v(counts, "triedCount");

        return r
          .match(ItemSessionControl, { ...keyOf(session), maxAttempts })
          .match(counts, { ...keyOf(session), attempts })
          .where(
            r.gt(maxAttempts, 0n),
            r.not(ItemMode, { adaptive: true, package: session.package, path: session.path }),
          )
          .find({ left: Num.sub(maxAttempts, Type.base(attempts)) });
      });

  return (session: SessionKey) =>
    query(delivery)
      .rule((r) => {
        const { maxAttempts, showFeedback, showSolution } = v(ItemSessionControl, "control");

        return r
          .match(ItemSessionControl, {
            ...keyOf(session),
            maxAttempts,
            showFeedback,
            showSolution,
          })
          .find({ ...keyOf(session), maxAttempts, showFeedback, showSolution });
      })
      .attach(
        "open",
        (control) => query(delivery).rule((r) => r.match(ItemSessionOpen, keyOf(control)).find({})),
        "option",
      )
      .attach("counted", (control) => countedOf(control), "array")
      .attach("left", (control) => leftOf(control), "array");
};
