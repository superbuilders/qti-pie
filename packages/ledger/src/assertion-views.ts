/**
 * What an outcome's assertions make of an attempt, derived and never stored, at the Delivery level
 * over the ledger: which outcomes an item scores externally, which of an attempt's are still
 * waiting for their score, which assertion is in force, and every variable's value in force after
 * the attempt; and the two laws that read pantry's views beside the ledger's assertions. The stored
 * assertions are the ledger's (`#ledger.ts`, `OutcomeAssertion` and its arms and values).
 *
 * QTI 3.0.1 information model, Table 4.5.10, `external-scored`: "This identifies whether or not the
 * value for this outcome is produced by human or by machine scoring", of `ExternalScoredEnum`
 * (Table 8.21), multiplicity [0..1]. An outcome's value is otherwise "set either from a default
 * given in the declaration itself or by a responseRule during responseProcessing" (§4.5, Table
 * 4.5's description), so an assertion is admitted for exactly the outcomes QTI exempts. Results
 * Reporting, Table 2.7.7: `pendingExternalScoring` is "The value to use when the response
 * processing rules are processed, but the score is NOT final because the 'external-scored' property
 * for the outcome variable was set", and `final` "the values at the end of an attempt after
 * response processing has taken place".
 *
 * - **ExternallyScored**: each outcome a document declares `external-scored`, by its package, the
 *   document's path (which keys an item, SV-KEY-01) and the outcome's identifier, with its
 *   cardinality and the kind of scoring it names (`ExternalScoring`, the declaration's token).
 *   pantry's name view `DeclarationName` beside the declaration's own `external-scored` attribute,
 *   matched by the declaration's place, as `ItemVariable` matches it (`#ledger.ts`).
 * - **InForceAssertion**: each asserted outcome of an attempt with its latest assertion's instant,
 *   the one in force (the owner's ruling, 2026-11-19: "the latest wins"). An assertion's clock is
 *   the outcome's of the attempt, so the latest is the last committed.
 * - **PendingExternalScoring**: each external-scored outcome of an attempt that no assertion has
 *   scored yet, with the kind its declaration names: Results Reporting's `pendingExternalScoring`,
 *   per outcome. An attempt with a row here is not final; one with none is, whether or not its item
 *   scores anything externally.
 * - **AwaitingHumanEvaluation**: each rubric group of an attempt whose every `rubric-score`
 *   application declined, which no reply and no person's value (`HumanOperatorValue`) answers: what
 *   the deferred response processing waits on, and what the operator's `essays` offers a person
 *   (review M6, route 1).
 * - **OutcomeInForceSingle**`<BaseType>`: each single variable's value after the attempt, as Results
 *   Reporting reports it: the value response processing left (`SnapshotSingle<BaseType>`), unless
 *   an assertion scored the variable, and then its latest assertion's value; no row is NULL, an
 *   asserted NULL among them. Its heading is `SnapshotSingle<BaseType>`'s, so a reader of an
 *   attempt's values reads it in that relation's place. A response is never asserted (only an
 *   outcome is declared `external-scored`), so its row is the attempt's. A variable of another
 *   cardinality is never asserted either (below), so its value in force is its
 *   `Attempt<Multiple|Ordered><BaseType>` or `AttemptRecord` rows, read there.
 *
 * Laws:
 *
 * - **The assertion is of its declaration's kind** (the owner's ruling, 2026-11-19: "a law ties each
 *   assertion to an outcome its item declares external-scored with the same kind"): every
 *   assertion's package, path, outcome and kind is an `ExternallyScored` row's. So an outcome
 *   response processing sets is never asserted, a response, a template variable and a built-in
 *   never are, and a human never asserts an `externalMachine` outcome nor a machine a `human` one:
 *   the kind and the token are one roster.
 *
 * What it does not hold: an assertion of an outcome of another cardinality than `single`. Each
 * asserted value is one of the typed singles (`AssertedSingle<BaseType>`), and AlphaTest's
 * converter writes `external-scored` on single outcomes alone (`qti-port/registry/response.md`: no
 * served item declares `external-scored`; conversion C-EXT-HUMAN writes `SCORE`, single float,
 * `human`). Such a declaration is valid QTI ("external-scored" has no cardinality condition, Table
 * 4.5.10), so nothing refuses it: the QTI database is an importer that "must be able to ignore or
 * remove the unsupported data" and never refuses a valid package (QTI 3.0 Conformance §3; the
 * lead's ruling J1, 2026-11-20). Its declaration stands in `ExternallyScored` with its cardinality,
 * which is how the "gradable" verdict leaves its item unserved for credit, so no attempt of it ever
 * waits for a score nobody can give.
 */
import { contained, derived, Logic, Num, on, query, Type, v } from "@bjornpagen/grizzle";
import type { Rule } from "@bjornpagen/grizzle";
import type { LedgerLevel } from "#ledger/delivery.ts";
import { named } from "#ledger/laws.ts";
import { ExternalScoring } from "#ledger/ledger.ts";
import { QtiFloat } from "#ledger/scalars.ts";

/**
 * The outcomes a document declares with `external-scored` spelling `mode`, by the declaration's
 * place: its name and cardinality (`DeclarationName`, of kind `qti-outcome-declaration`,
 * "external-scored" being an attribute of the OutcomeDeclaration class alone, Table 4.5.10), by the
 * document's path, which keys an item (SV-KEY-01). The attribute restricts `xs:string` to its two
 * enumerations with white space preserved (the XSD's `external-scored`), so its value spells a
 * token as written, and the rule states the token it reads once, as the roster's handle.
 */
const scoredAs =
  (ledger: LedgerLevel, mode: (typeof ExternalScoring.handles)[number]) =>
  (r: Rule<LedgerLevel>) => {
    const { Attribute, DeclarationName } = ledger.relations;
    const {
      package: pkg,
      path,
      start,
      identifier,
      cardinality,
    } = v(DeclarationName, "declaration");

    return r
      .match(DeclarationName, {
        cardinality,
        declarationKind: "qti-outcome-declaration",
        identifier,
        package: pkg,
        path,
        start,
      })
      .match(Attribute, {
        kind: "qti-outcome-declaration",
        name: "external-scored",
        package: pkg,
        path,
        start,
        value: mode,
      })
      .find({ cardinality, identifier, mode: ExternalScoring.handle(mode), package: pkg, path });
  };

/**
 * The external-scored outcomes, every document's, by both tokens: each outcome a document declares
 * `external-scored`, `{ package, path, identifier, cardinality, mode }`. The one statement of what
 * QTI exempts from response processing, which `ExternallyScored` names at the Delivery level and
 * IMPL-GRADABLE's servable verdict reads inline: a derived relation reads only the levels below its
 * own, so a relation of the Delivery level reads this query, never the derived relation beside it.
 *
 * @param ledger - The ledger level.
 * @returns The query.
 */
export const externallyScoredOf = (ledger: LedgerLevel) =>
  query(ledger).rule(scoredAs(ledger, "externalMachine")).rule(scoredAs(ledger, "human"));

/**
 * Each rubric group of an attempt that waits for a person's value, with its item session's stage
 * (dependent, for the sitting that holds it): every `rubric-score` application of the group
 * declined, none replied, and no `HumanOperatorValue` answers it. The one definition the deferred
 * response processing, the operator's `essays` and `evaluate` and the evaluator's read-back read
 * (IMPL-OPS's route 1, review M6). Requests are static, every `RecordedApplication` of an item
 * whose response is non-NULL, so a decline stands for a sent request, and a group of a NULL
 * response (which response processing scores 0) holds none and never waits. Response processing
 * runs once no group of the attempt waits and no application is in flight: Results Reporting, Table
 * 2.7.7, `pendingResponseProcessing`, "the item variables represent the values of the response
 * variables after submission but before response processing has taken place". A `refused` or
 * `unreadable` decline counts, so an essay whose every draw declined is a person's to score, never
 * scored wrong; an `unanswered` one (an essay of whitespace or markup alone, which the item's own
 * empty-essay rule makes NULL) routes to no person, so a group whose every draw declined
 * `unanswered` holds none and never waits, as a NULL response's, and response processing runs on
 * its NULL; an attempt whose response processing has run (`ProcessedAttempt`) waits for no one,
 * history imported with its outcomes among them.
 *
 * @param ledger - The ledger level.
 * @returns The query, `(child, package, path, n, at, rubric, stage)`.
 */
export const awaitingHumanEvaluationsOf = (ledger: LedgerLevel) => {
  const {
    HumanOperatorValue,
    ItemSession,
    OperatorDecline,
    OperatorReply,
    ProcessedAttempt,
    RubricApplication,
  } = ledger.relations;

  /**
   * Each rubric group of an attempt that holds a decline a person scores, `refused` or
   * `unreadable`: an attempt's `OperatorDecline` of that reason of an application of the group
   * (`RubricApplication`), by the attempt and the group's rubric. An `unanswered` decline puts its
   * group here by no rule.
   */
  const declinedOf = (reason: "refused" | "unreadable") => (r: Rule<LedgerLevel>) => {
    const { child, package: pkg, path, n, at, operator } = v(OperatorDecline, "declined");
    const { rubric } = v(RubricApplication, "application");

    return r
      .match(OperatorDecline, { at, child, n, operator, package: pkg, path, reason })
      .match(RubricApplication, { package: pkg, path, rubric, start: operator })
      .find({ at, child, n, package: pkg, path, rubric });
  };
  const declinedGroups = query(ledger).rule(declinedOf("refused")).rule(declinedOf("unreadable"));

  /**
   * Each rubric group of an attempt that holds a reply: an `OperatorReply` of an application of the
   * group.
   */
  const repliedGroups = query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at, operator } = v(OperatorReply, "replied");
    const { rubric } = v(RubricApplication, "application");

    return r
      .match(OperatorReply, { at, child, n, operator, package: pkg, path })
      .match(RubricApplication, { package: pkg, path, rubric, start: operator })
      .find({ at, child, n, package: pkg, path, rubric });
  });

  /**
   * Each declined group's application with no decline: an application of a group that holds a
   * decline at the attempt, which no `OperatorDecline` of the attempt answers. A group with one is
   * still in flight, or replied.
   */
  const undeclinedApplications = query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at, rubric } = v(declinedGroups, "group");
    const { start } = v(RubricApplication, "application");

    return r
      .match(declinedGroups, { at, child, n, package: pkg, path, rubric })
      .match(RubricApplication, { package: pkg, path, rubric, start })
      .where(r.not(OperatorDecline, { at, child, n, operator: start, package: pkg, path }))
      .find({ at, child, n, package: pkg, path, rubric });
  });

  return query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at, rubric } = v(declinedGroups, "group");
    const { stage } = v(ItemSession, "session");

    return r
      .match(declinedGroups, { at, child, n, package: pkg, path, rubric })
      .match(ItemSession, { child, n, package: pkg, path, stage })
      .where(
        r.not(ProcessedAttempt, { at, child, n, package: pkg, path }),
        r.not(undeclinedApplications, { at, child, n, package: pkg, path, rubric }),
        r.not(repliedGroups, { at, child, n, package: pkg, path, rubric }),
        r.not(HumanOperatorValue, { at, child, n, package: pkg, path, rubric }),
      )
      .find({ at, child, n, package: pkg, path, rubric, stage });
  });
};

/**
 * The magnitude up to which every integer is a double exactly: 2^53, IEEE 754 binary64's
 * significand being 53 bits.
 */
const exactDoubleIntegers = 2n ** 53n;

/**
 * The Delivery level's relations and laws of outcomes' assertions over the ledger `ledger`, for the
 * level to spread.
 *
 * @param ledger - The ledger level.
 * @returns The derived relations and the laws.
 */
export const assertionViewsOf = (ledger: LedgerLevel) => {
  const {
    Attempt,
    OutcomeAssertion,
    SnapshotSingleIdentifier,
    SnapshotSingleBoolean,
    SnapshotSingleInteger,
    SnapshotSingleFloat,
    SnapshotSingleString,
    SnapshotSinglePoint,
    SnapshotSinglePair,
    SnapshotSingleDirectedPair,
    SnapshotSingleDuration,
    SnapshotSingleUri,
    SnapshotSingleFile,
    AssertedSingleIdentifier,
    AssertedSingleBoolean,
    AssertedSingleInteger,
    AssertedSingleFloat,
    AssertedSingleString,
    AssertedSinglePoint,
    AssertedSinglePair,
    AssertedSingleDirectedPair,
    AssertedSingleDuration,
    AssertedSingleUri,
    AssertedSingleFile,
  } = ledger.relations;

  const externallyScored = externallyScoredOf(ledger);

  /**
   * Each asserted outcome of an attempt with its latest assertion's instant, as
   * {@link externallyScored} is read.
   */
  const inForceAssertions = query(ledger).rule((r) => {
    const {
      child,
      package: pkg,
      path,
      n,
      at,
      variable,
      asserted,
    } = v(OutcomeAssertion, "assertion");

    return r
      .match(OutcomeAssertion, { asserted, at, child, n, package: pkg, path, variable })
      .find({ asserted: r.max(asserted), at, child, n, package: pkg, path, variable });
  });

  const ExternallyScored = derived("ExternallyScored", externallyScored);

  const InForceAssertion = derived("InForceAssertion", inForceAssertions);

  /**
   * Each external-scored outcome of an attempt that no assertion has scored yet, as
   * `PendingExternalScoring` names it: the plain query, for the relations of this level that read
   * it.
   */
  const pendingExternalScorings = query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at } = v(Attempt, "attempt");
    const { identifier: variable, mode } = v(externallyScored, "scored");

    return r
      .match(Attempt, { at, child, n, package: pkg, path })
      .match(externallyScored, { identifier: variable, mode, package: pkg, path })
      .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
      .find({ at, child, mode, n, package: pkg, path, variable });
  });

  const PendingExternalScoring = derived("PendingExternalScoring", pendingExternalScorings);

  const OutcomeInForceSingleIdentifier = derived(
    "OutcomeInForceSingleIdentifier",
    query(ledger)
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          value,
        } = v(SnapshotSingleIdentifier, "processed");

        return r
          .match(SnapshotSingleIdentifier, { at, child, n, package: pkg, path, value, variable })
          .match(Attempt, { at, child, n, package: pkg, path })
          .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
          .find({ at, child, n, package: pkg, path, value, variable });
      })
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          asserted,
        } = v(inForceAssertions, "inForce");
        const { value } = v(AssertedSingleIdentifier, "asserted");

        return r
          .match(inForceAssertions, { asserted, at, child, n, package: pkg, path, variable })
          .match(AssertedSingleIdentifier, {
            asserted,
            at,
            child,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ at, child, n, package: pkg, path, value, variable });
      }),
  );
  const OutcomeInForceSingleBoolean = derived(
    "OutcomeInForceSingleBoolean",
    query(ledger)
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          value,
        } = v(SnapshotSingleBoolean, "processed");

        return r
          .match(SnapshotSingleBoolean, { at, child, n, package: pkg, path, value, variable })
          .match(Attempt, { at, child, n, package: pkg, path })
          .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
          .find({ at, child, n, package: pkg, path, value, variable });
      })
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          asserted,
        } = v(inForceAssertions, "inForce");
        const { value } = v(AssertedSingleBoolean, "asserted");

        return r
          .match(inForceAssertions, { asserted, at, child, n, package: pkg, path, variable })
          .match(AssertedSingleBoolean, {
            asserted,
            at,
            child,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ at, child, n, package: pkg, path, value, variable });
      }),
  );
  /**
   * An attempt's single integer in force, as a plain query: a relation of this level reads it,
   * never the derived relation beside it (`outcomeInForceNumber`).
   */
  const outcomeInForceSingleInteger = query(ledger)
    .rule((r) => {
      const {
        child,
        package: pkg,
        path,
        n,
        at,
        variable,
        value,
      } = v(SnapshotSingleInteger, "processed");

      return r
        .match(SnapshotSingleInteger, { at, child, n, package: pkg, path, value, variable })
        .match(Attempt, { at, child, n, package: pkg, path })
        .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
        .find({ at, child, n, package: pkg, path, value, variable });
    })
    .rule((r) => {
      const {
        child,
        package: pkg,
        path,
        n,
        at,
        variable,
        asserted,
      } = v(inForceAssertions, "inForce");
      const { value } = v(AssertedSingleInteger, "asserted");

      return r
        .match(inForceAssertions, { asserted, at, child, n, package: pkg, path, variable })
        .match(AssertedSingleInteger, {
          asserted,
          at,
          child,
          n,
          package: pkg,
          path,
          value,
          variable,
        })
        .find({ at, child, n, package: pkg, path, value, variable });
    });
  const OutcomeInForceSingleInteger = derived(
    "OutcomeInForceSingleInteger",
    outcomeInForceSingleInteger,
  );
  /**
   * An attempt's single float in force, as a plain query: a relation of this level reads it, never
   * the derived relation beside it (`outcomeInForceNumber`).
   */
  const outcomeInForceSingleFloat = query(ledger)
    .rule((r) => {
      const {
        child,
        package: pkg,
        path,
        n,
        at,
        variable,
        value,
      } = v(SnapshotSingleFloat, "processed");

      return r
        .match(SnapshotSingleFloat, { at, child, n, package: pkg, path, value, variable })
        .match(Attempt, { at, child, n, package: pkg, path })
        .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
        .find({ at, child, n, package: pkg, path, value, variable });
    })
    .rule((r) => {
      const {
        child,
        package: pkg,
        path,
        n,
        at,
        variable,
        asserted,
      } = v(inForceAssertions, "inForce");
      const { value } = v(AssertedSingleFloat, "asserted");

      return r
        .match(inForceAssertions, { asserted, at, child, n, package: pkg, path, variable })
        .match(AssertedSingleFloat, {
          asserted,
          at,
          child,
          n,
          package: pkg,
          path,
          value,
          variable,
        })
        .find({ at, child, n, package: pkg, path, value, variable });
    });
  const OutcomeInForceSingleFloat = derived("OutcomeInForceSingleFloat", outcomeInForceSingleFloat);
  /**
   * An attempt's numeric outcome in force, as a plain query: each single float in force as itself,
   * and each single integer in force as its double where that double is the integer exactly, so no
   * number is rounded. QTI 3.0.1 states no range for the integer base type, so the ledger holds one
   * unbounded (`QtiInteger`); every integer of magnitude at most 2^53 is a double exactly (IEEE
   * 754's binary64 has a 53-bit significand), and a wider one has no number here, as a value of any
   * other base type has none: no value is coerced. What credit reads (`AttemptCredit`,
   * `#credit-relations.ts`) of SCORE and MAXSCORE whatever base type the item declares them with,
   * since no normative rule of QTI 3.0.1 types either (PANTRY-CONFORM's J1 ruling).
   */
  const outcomeInForceNumber = query(ledger)
    .rule((r) => {
      const {
        child,
        package: pkg,
        path,
        n,
        at,
        variable,
        value,
      } = v(outcomeInForceSingleFloat, "float");

      return r
        .match(outcomeInForceSingleFloat, { at, child, n, package: pkg, path, value, variable })
        .find({ at, child, n, package: pkg, path, value, variable });
    })
    .rule((r) => {
      const {
        child,
        package: pkg,
        path,
        n,
        at,
        variable,
        value,
      } = v(outcomeInForceSingleInteger, "integer");

      return r
        .match(outcomeInForceSingleInteger, { at, child, n, package: pkg, path, value, variable })
        .where(Num.within(value, -exactDoubleIntegers, exactDoubleIntegers))
        .find({
          at,
          child,
          n,
          package: pkg,
          path,
          value: Logic.when(
            Num.within(value, -exactDoubleIntegers, exactDoubleIntegers),
            (exact) => Type.cast(exact, QtiFloat),
            Number.NaN,
          ),
          variable,
        });
    });
  const OutcomeInForceSingleString = derived(
    "OutcomeInForceSingleString",
    query(ledger)
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          value,
        } = v(SnapshotSingleString, "processed");

        return r
          .match(SnapshotSingleString, { at, child, n, package: pkg, path, value, variable })
          .match(Attempt, { at, child, n, package: pkg, path })
          .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
          .find({ at, child, n, package: pkg, path, value, variable });
      })
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          asserted,
        } = v(inForceAssertions, "inForce");
        const { value } = v(AssertedSingleString, "asserted");

        return r
          .match(inForceAssertions, { asserted, at, child, n, package: pkg, path, variable })
          .match(AssertedSingleString, {
            asserted,
            at,
            child,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ at, child, n, package: pkg, path, value, variable });
      }),
  );
  const OutcomeInForceSinglePoint = derived(
    "OutcomeInForceSinglePoint",
    query(ledger)
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          x,
          y,
        } = v(SnapshotSinglePoint, "processed");

        return r
          .match(SnapshotSinglePoint, { at, child, n, package: pkg, path, variable, x, y })
          .match(Attempt, { at, child, n, package: pkg, path })
          .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
          .find({ at, child, n, package: pkg, path, variable, x, y });
      })
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          asserted,
        } = v(inForceAssertions, "inForce");
        const { x, y } = v(AssertedSinglePoint, "asserted");

        return r
          .match(inForceAssertions, { asserted, at, child, n, package: pkg, path, variable })
          .match(AssertedSinglePoint, {
            asserted,
            at,
            child,
            n,
            package: pkg,
            path,
            variable,
            x,
            y,
          })
          .find({ at, child, n, package: pkg, path, variable, x, y });
      }),
  );
  const OutcomeInForceSinglePair = derived(
    "OutcomeInForceSinglePair",
    query(ledger)
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          least,
          greatest,
        } = v(SnapshotSinglePair, "processed");

        return r
          .match(SnapshotSinglePair, {
            at,
            child,
            greatest,
            least,
            n,
            package: pkg,
            path,
            variable,
          })
          .match(Attempt, { at, child, n, package: pkg, path })
          .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
          .find({ at, child, greatest, least, n, package: pkg, path, variable });
      })
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          asserted,
        } = v(inForceAssertions, "inForce");
        const { least, greatest } = v(AssertedSinglePair, "asserted");

        return r
          .match(inForceAssertions, { asserted, at, child, n, package: pkg, path, variable })
          .match(AssertedSinglePair, {
            asserted,
            at,
            child,
            greatest,
            least,
            n,
            package: pkg,
            path,
            variable,
          })
          .find({ at, child, greatest, least, n, package: pkg, path, variable });
      }),
  );
  const OutcomeInForceSingleDirectedPair = derived(
    "OutcomeInForceSingleDirectedPair",
    query(ledger)
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          source,
          target,
        } = v(SnapshotSingleDirectedPair, "processed");

        return r
          .match(SnapshotSingleDirectedPair, {
            at,
            child,
            n,
            package: pkg,
            path,
            source,
            target,
            variable,
          })
          .match(Attempt, { at, child, n, package: pkg, path })
          .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
          .find({ at, child, n, package: pkg, path, source, target, variable });
      })
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          asserted,
        } = v(inForceAssertions, "inForce");
        const { source, target } = v(AssertedSingleDirectedPair, "asserted");

        return r
          .match(inForceAssertions, { asserted, at, child, n, package: pkg, path, variable })
          .match(AssertedSingleDirectedPair, {
            asserted,
            at,
            child,
            n,
            package: pkg,
            path,
            source,
            target,
            variable,
          })
          .find({ at, child, n, package: pkg, path, source, target, variable });
      }),
  );
  const OutcomeInForceSingleDuration = derived(
    "OutcomeInForceSingleDuration",
    query(ledger)
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          value,
        } = v(SnapshotSingleDuration, "processed");

        return r
          .match(SnapshotSingleDuration, { at, child, n, package: pkg, path, value, variable })
          .match(Attempt, { at, child, n, package: pkg, path })
          .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
          .find({ at, child, n, package: pkg, path, value, variable });
      })
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          asserted,
        } = v(inForceAssertions, "inForce");
        const { value } = v(AssertedSingleDuration, "asserted");

        return r
          .match(inForceAssertions, { asserted, at, child, n, package: pkg, path, variable })
          .match(AssertedSingleDuration, {
            asserted,
            at,
            child,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ at, child, n, package: pkg, path, value, variable });
      }),
  );
  const OutcomeInForceSingleUri = derived(
    "OutcomeInForceSingleUri",
    query(ledger)
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          value,
        } = v(SnapshotSingleUri, "processed");

        return r
          .match(SnapshotSingleUri, { at, child, n, package: pkg, path, value, variable })
          .match(Attempt, { at, child, n, package: pkg, path })
          .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
          .find({ at, child, n, package: pkg, path, value, variable });
      })
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          asserted,
        } = v(inForceAssertions, "inForce");
        const { value } = v(AssertedSingleUri, "asserted");

        return r
          .match(inForceAssertions, { asserted, at, child, n, package: pkg, path, variable })
          .match(AssertedSingleUri, {
            asserted,
            at,
            child,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ at, child, n, package: pkg, path, value, variable });
      }),
  );
  const OutcomeInForceSingleFile = derived(
    "OutcomeInForceSingleFile",
    query(ledger)
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          digest,
          name,
          type,
        } = v(SnapshotSingleFile, "processed");

        return r
          .match(SnapshotSingleFile, {
            at,
            child,
            digest,
            n,
            name,
            package: pkg,
            path,
            type,
            variable,
          })
          .match(Attempt, { at, child, n, package: pkg, path })
          .where(r.not(OutcomeAssertion, { at, child, n, package: pkg, path, variable }))
          .find({ at, child, digest, n, name, package: pkg, path, type, variable });
      })
      .rule((r) => {
        const {
          child,
          package: pkg,
          path,
          n,
          at,
          variable,
          asserted,
        } = v(inForceAssertions, "inForce");
        const { digest, name, type } = v(AssertedSingleFile, "asserted");

        return r
          .match(inForceAssertions, { asserted, at, child, n, package: pkg, path, variable })
          .match(AssertedSingleFile, {
            asserted,
            at,
            child,
            digest,
            n,
            name,
            package: pkg,
            path,
            type,
            variable,
          })
          .find({ at, child, digest, n, name, package: pkg, path, type, variable });
      }),
  );

  const AwaitingHumanEvaluation = derived(
    "AwaitingHumanEvaluation",
    awaitingHumanEvaluationsOf(ledger),
  );

  const relations = [
    ExternallyScored,
    InForceAssertion,
    PendingExternalScoring,
    AwaitingHumanEvaluation,
    OutcomeInForceSingleIdentifier,
    OutcomeInForceSingleBoolean,
    OutcomeInForceSingleInteger,
    OutcomeInForceSingleFloat,
    OutcomeInForceSingleString,
    OutcomeInForceSinglePoint,
    OutcomeInForceSinglePair,
    OutcomeInForceSingleDirectedPair,
    OutcomeInForceSingleDuration,
    OutcomeInForceSingleUri,
    OutcomeInForceSingleFile,
  ] as const;

  const laws = [
    named(
      "Assertion scoring",
      contained(
        on(OutcomeAssertion, "package", "path", "variable", "by"),
        on(ExternallyScored, "package", "path", "identifier", "mode"),
      ),
    ),
  ] as const;

  return { laws, outcomeInForceNumber, pendingExternalScorings, relations };
};
