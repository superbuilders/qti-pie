/**
 * A test session's outcome processing (QTI 3.0.1 information model, Table 5.102,
 * OutcomeProcessing), as a composable write over the Delivery level: one run of the SQL machine's
 * flat test entry (`testOutcomeProcessingOf`, out/grading-sql/p4/test/test-document.sql) over every
 * member's item session as it stands, its result stored as a `TestOutcomeRun` and its sidecars
 * (`#ledger/test-run-writes.ts`), in the transaction of the write that composes it. "Outcome
 * processing takes place each time the candidate submits the responses for an item (when in
 * individual submission mode) or a group of items (when in simultaneous submission mode). It
 * happens after any (item level) response processing triggered by the submission. The values of the
 * test's outcome variables are always reset to their defaults prior to carrying out the
 * instructions described by the outcomeRules" (info:37242): so every run is the same function of
 * the item sessions' state, and the latest run is in force. The end of a part runs it
 * (`#ledger/finish.ts`), and so does every later write that changes an outcome it reads: an
 * external score asserted, the last pending evaluation of an ended sitting recorded.
 *
 * The run's sittings are the `sittings` relation parameter, which the program composing the run
 * binds once, to the sittings it acts on. Each rule that reads the call binds every rows argument
 * to it ({@link runOf}), so the call is closed and every read of its fields, in every member of the
 * write, is one evaluation. Every value row it passes and reads back is keyed by its session's run
 * key (child, package, path, stage), the machine's (out/grading-sql/p3-v16): a member's by its item
 * session in the sitting, the test's own by the test session, so one call runs every due sitting,
 * each by itself.
 *
 * What the run reads, each a rows argument of the one call:
 *
 * - The tree: the test's `qti-outcome-processing` subtree, and the declarations of the test and of
 *   every member's item, as P4's tree builder crosses them;
 * - Each member's state now, by its item session in the sitting (held `value`): an attempted member's
 *   latest attempt, through P4's snapshot builder; its built-ins, `numAttempts` (1 once presented:
 *   "An attempt begins at first presentation", spec reading 3) and `duration` (`ItemDuration`,
 *   seconds), and `completionStatus` `not_attempted` for a member never presented (§2.2.2.3: "The
 *   value of completionStatus is set to not_attempted at the start of the session");
 * - The test's own values, by the test session: each context value the application bound for the
 *   sitting, `SessionContextFloat`, `SessionContextInteger` and `SessionContextBoolean` (child,
 *   stage, identifier, value), a value only it knows (TIME_LIMIT's applied limit, an assignment's
 *   grade facts), each read only where the test declares the context single and of that base type;
 *   and the test's `duration`, its candidate sessions' time (§2.8.5: "the durations of all the item
 *   sessions plus any other time spent navigating that part of the test");
 * - The test's content per item ref: its members in document order, the sections that hold each at
 *   any depth, its categories, weights and variable mappings, and its outcomes' normal bounds.
 */
import { Fn, Num, pg, query, Type, v } from "@bjornpagen/grizzle";
import type { Rule } from "@bjornpagen/grizzle";
import { sittingHeading } from "#ledger/sitting-queries.ts";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";
import { memberValuesOf, testTreeOf } from "#ledger/grade.ts";
import {
  DocFloat,
  DocGiven,
  DocInteger,
  DocText,
  DocumentRun,
  sittingSeed,
  TestMemberBound,
  testOutcomeProcessingOf,
} from "#ledger/grading.ts";

/**
 * The microseconds of a second, the instants' resolution.
 */
const second = 1_000_000n;

/**
 * Each change of each of the call's sittings that its outcome processing reads, at its instant: its
 * end, an assertion of a member's outcome (IMPL-ASSERT), an evaluation a member's custom operator
 * recorded, a person's value for a member's rubric group. Each a reading of the one database clock,
 * so the latest is compared with a run's as such.
 */
const changesOf = (delivery: DeliveryLevel) => {
  const { HumanOperatorValue, ItemSession, OperatorEvaluation, OutcomeAssertion, TestEnd } =
    delivery.relations;

  return query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage, at } = v(TestEnd, "endChange");

      return r
        .match(sittings, { child, stage })
        .match(TestEnd, { at, child, stage })
        .find({ at, child, stage });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage, package: pkg, path, n } = v(ItemSession, "assertedSession");
      const { at: attempted, variable, asserted } = v(OutcomeAssertion, "assertionChange");

      return r
        .match(sittings, { child, stage })
        .match(ItemSession, { child, n, package: pkg, path, stage })
        .match(OutcomeAssertion, {
          asserted,
          at: attempted,
          child,
          n,
          package: pkg,
          path,
          variable,
        })
        .find({ at: asserted, child, stage });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage, package: pkg, path, n } = v(ItemSession, "evaluatedSession");
      const { at: attempted, operator, evaluated } = v(OperatorEvaluation, "evaluationChange");

      return r
        .match(sittings, { child, stage })
        .match(ItemSession, { child, n, package: pkg, path, stage })
        .match(OperatorEvaluation, {
          at: attempted,
          child,
          evaluated,
          n,
          operator,
          package: pkg,
          path,
        })
        .find({ at: evaluated, child, stage });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const { child, stage, package: pkg, path, n } = v(ItemSession, "scoredSession");
      const { at: attempted, rubric, asserted } = v(HumanOperatorValue, "humanChange");

      return r
        .match(sittings, { child, stage })
        .match(ItemSession, { child, n, package: pkg, path, stage })
        .match(HumanOperatorValue, {
          asserted,
          at: attempted,
          child,
          n,
          package: pkg,
          path,
          rubric,
        })
        .find({ at: asserted, child, stage });
    });
};

/**
 * Each of the call's sittings while a run of its outcome processing is due, with its test: it has
 * ended or changed, and no run is stamped at or after its latest change. One rule for every write
 * that composes the run: the end's finish runs it once (a repeated end changes nothing), and a
 * later assertion, evaluation or human value runs it again.
 */
export const dueOf = (delivery: DeliveryLevel) => {
  const { TestOutcomeRun, TestSession } = delivery.relations;
  const changes = changesOf(delivery);
  const latest = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const changesAt = changes.bind({ sittings });
    const { child, stage, at } = v(changesAt, "change");

    return r.match(changesAt, { at, child, stage }).find({ at: r.max(at), child, stage });
  });
  const ranSince = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const latestAt = latest.bind({ sittings });
    const { child, stage, at: lastChange } = v(latestAt, "changedAt");
    const { at } = v(TestOutcomeRun, "ranAt");

    return r
      .match(latestAt, { at: lastChange, child, stage })
      .match(TestOutcomeRun, { at, child, stage })
      .where(r.ge(at, lastChange))
      .find({ child, stage });
  });

  return query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const latestAt = latest.bind({ sittings });
    const ranSinceAt = ranSince.bind({ sittings });
    const { child, stage } = v(latestAt, "due");
    const { package: pkg, path } = v(TestSession, "dueSitting");

    return r
      .match(latestAt, { child, stage })
      .match(TestSession, { child, package: pkg, path, stage })
      .where(r.not(ranSinceAt, { child, stage }))
      .find({ child, package: pkg, path, stage });
  });
};

/**
 * The flat test entry's call for the due sittings (`sitting`, {@link dueOf}), as the rule that reads
 * it builds it: every field a source.
 */
export const runOf = (delivery: DeliveryLevel, sitting: ReturnType<typeof dueOf>) => {
  const {
    DeclarationName,
    SessionContextBoolean,
    SessionContextFloat,
    SessionContextInteger,
    ItemDuration,
    ItemRefCategory,
    ItemRefSection,
    NamedDeclaration,
    NormalMaximum,
    NormalMinimum,
    TestEnd,
    TestMember,
    TestPresented,
    TestSuspension,
    TestVisit,
    TypedDeclarationName,
    VariableMapping,
    WeightValue,
  } = delivery.relations;

  /**
   * Each member of the sitting's test: its place in document order, its item ref's identifier and
   * its item.
   */
  const members = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const { package: pkg, path } = v(sittingAt, "memberSitting");
    const { start, item, document } = v(TestMember, "member");

    return r
      .match(sittingAt, { package: pkg, path })
      .match(TestMember, { document, item, package: pkg, path, start })
      .find({ item: document, package: pkg, path, place: start, ref: item });
  });

  /**
   * Each section that holds a member, at any depth, by its identifier.
   */
  const refSections = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const { package: pkg, path } = v(sittingAt, "sectionSitting");
    const { start, item } = v(TestMember, "sectionMember");
    const { identifier } = v(ItemRefSection, "section");

    return r
      .match(sittingAt, { package: pkg, path })
      .match(TestMember, { item, package: pkg, path, start })
      .match(ItemRefSection, { identifier, package: pkg, path, start })
      .find({ package: pkg, path, ref: item, section: identifier });
  });

  /**
   * Each category a member's item ref is assigned to.
   */
  const refCategories = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const { package: pkg, path } = v(sittingAt, "categorySitting");
    const { start, item } = v(TestMember, "categoryMember");
    const { category } = v(ItemRefCategory, "category");

    return r
      .match(sittingAt, { package: pkg, path })
      .match(TestMember, { item, package: pkg, path, start })
      .match(ItemRefCategory, { category, package: pkg, path, start })
      .find({ category, package: pkg, path, ref: item });
  });

  /**
   * Each weight of a member's item ref, its value a double (WeightValue reads it as XML Schema
   * reads an xs:double).
   */
  const refWeights = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const { package: pkg, path } = v(sittingAt, "weightSitting");
    const { start, item } = v(TestMember, "weightMember");
    const { identifier, value } = v(WeightValue, "weight");

    return r
      .match(sittingAt, { package: pkg, path })
      .match(TestMember, { item, package: pkg, path, start })
      .match(WeightValue, { identifier, package: pkg, path, ref: start, value })
      .find({
        identifier,
        package: pkg,
        path,
        ref: item,
        value,
      });
  });

  /**
   * Each variable mapping of a member's item ref.
   */
  const refMappings = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const { package: pkg, path } = v(sittingAt, "mappingSitting");
    const { start, item } = v(TestMember, "mappingMember");
    const { source, target } = v(VariableMapping, "mapping");

    return r
      .match(sittingAt, { package: pkg, path })
      .match(TestMember, { item, package: pkg, path, start })
      .match(VariableMapping, { package: pkg, path, ref: start, source, target })
      .find({ package: pkg, path, ref: item, source, target });
  });

  /**
   * Each member's outcomes' normal bounds: every outcome's minimum, written or its default 0, and
   * its maximum where written (Tables 4.5.7 and 4.5.8).
   */
  const memberBounds = query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const sittingAt = sitting.bind({ sittings });
      const { package: pkg, path } = v(sittingAt, "minimumSitting");
      const { item, document } = v(TestMember, "minimumMember");
      const { start, identifier } = v(NamedDeclaration, "minimumDeclaration");
      const { value } = v(NormalMinimum, "minimum");

      return r
        .match(sittingAt, { package: pkg, path })
        .match(TestMember, { document, item, package: pkg, path })
        .match(NamedDeclaration, {
          declarationKind: "qti-outcome-declaration",
          identifier,
          package: pkg,
          path: document,
          start,
        })
        .match(NormalMinimum, { package: pkg, path: document, start, value })
        .find({
          bound: Type.literal(TestMemberBound.fields.bound, "minimum"),
          identifier,
          package: pkg,
          path,
          ref: item,
          value,
        });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const sittingAt = sitting.bind({ sittings });
      const { package: pkg, path } = v(sittingAt, "maximumSitting");
      const { item, document } = v(TestMember, "maximumMember");
      const { start, identifier } = v(NamedDeclaration, "maximumDeclaration");
      const { value } = v(NormalMaximum, "maximum");

      return r
        .match(sittingAt, { package: pkg, path })
        .match(TestMember, { document, item, package: pkg, path })
        .match(NamedDeclaration, {
          declarationKind: "qti-outcome-declaration",
          identifier,
          package: pkg,
          path: document,
          start,
        })
        .match(NormalMaximum, { package: pkg, path: document, start, value })
        .find({
          bound: Type.literal(TestMemberBound.fields.bound, "maximum"),
          identifier,
          package: pkg,
          path,
          ref: item,
          value,
        });
    });

  /**
   * The run: its key, the test session's (child, package, path, stage), and the draw stream's key,
   * the sitting's own (child and stage), and its label.
   */
  const runs = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const { child, stage, package: pkg, path } = v(sittingAt, "runOfSitting");

    return r.match(sittingAt, { child, package: pkg, path, stage }).find({
      child,
      defaulted: Type.literal(DocumentRun.fields.defaulted, false),
      label: Type.literal(DocumentRun.fields.label, "test"),
      package: pkg,
      path,
      seed: Fn.call(sittingSeed, { child, stage }),
      stage,
    });
  });

  /**
   * Each member's presentation state, by its item session in the sitting: presented once a
   * TestPresented names it, its numAttempts 1, else 0.
   */
  const presented = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const { child, stage } = v(sittingAt, "presentedSitting");
    const { package: pkg, path } = v(TestPresented, "shown");

    return r
      .match(sittingAt, { child, stage })
      .match(TestPresented, { child, package: pkg, path, stage })
      .find({
        child,
        package: pkg,
        path,
        stage,
      });
  });

  /**
   * The test's own time: each candidate session's span, to its suspension or to the end, summed.
   */
  const spans = query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const sittingAt = sitting.bind({ sittings });
      const { child, stage } = v(sittingAt, "suspendedSitting");
      const { k, at } = v(TestVisit, "suspendedVisit");
      const { at: until } = v(TestSuspension, "suspension");

      return r
        .match(sittingAt, { child, stage })
        .match(TestVisit, { at, child, k, stage })
        .match(TestSuspension, { at: until, child, k, stage })
        .find({
          child,
          k,
          micros: Num.numeric(Num.sub(Type.base(until), Type.base(at))),
          stage,
        });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const sittingAt = sitting.bind({ sittings });
      const { child, stage } = v(sittingAt, "endedSitting");
      const { k, at } = v(TestVisit, "endedVisit");
      const { at: until } = v(TestEnd, "end");

      return r
        .match(sittingAt, { child, stage })
        .match(TestVisit, { at, child, k, stage })
        .match(TestEnd, { at: until, child, k, stage })
        .find({
          child,
          k,
          micros: Num.numeric(Num.sub(Type.base(until), Type.base(at))),
          stage,
        });
    });
  const testTime = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const spansAt = spans.bind({ sittings });
    const { child, stage, k, micros } = v(spansAt, "span");

    return r
      .match(spansAt, { child, k, micros, stage })
      .find({ child, micros: r.sum(micros), stage });
  });

  /**
   * Each member's built-in `duration`, its presented time in seconds (ItemDuration's microseconds,
   * the nearest double), 0 for a member never presented; and the test's own, its candidate
   * sessions' time.
   */
  const durations = query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const sittingAt = sitting.bind({ sittings });
      const membersAt = members.bind({ sittings });
      const { child, stage, package: pkg, path: test } = v(sittingAt, "durationSitting");
      const { item } = v(membersAt, "durationMember");
      const { micros } = v(ItemDuration, "itemDuration");

      return r
        .match(sittingAt, { child, package: pkg, path: test, stage })
        .match(membersAt, { item, package: pkg, path: test })
        .match(ItemDuration, { child, micros, package: pkg, path: item, stage })
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          count: Type.literal(DocText.fields.count, 1n),
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.literal(DocText.fields.identifier, "duration"),
          package: pkg,
          path: item,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value: Type.cast(Num.div(micros, second), pg["double precision"]),
        });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const sittingAt = sitting.bind({ sittings });
      const membersAt = members.bind({ sittings });
      const { child, stage, package: pkg, path: test } = v(sittingAt, "idleSitting");
      const { item } = v(membersAt, "idleMember");

      return r
        .match(sittingAt, { child, package: pkg, path: test, stage })
        .match(membersAt, { item, package: pkg, path: test })
        .where(r.not(ItemDuration, { child, package: pkg, path: item, stage }))
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          count: Type.literal(DocText.fields.count, 1n),
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.literal(DocText.fields.identifier, "duration"),
          package: pkg,
          path: item,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value: Type.literal(DocFloat.fields.value, 0),
        });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const sittingAt = sitting.bind({ sittings });
      const testTimeAt = testTime.bind({ sittings });
      const { child, stage, package: pkg, path } = v(sittingAt, "timeSitting");
      const { micros } = v(testTimeAt, "time");

      return r
        .match(sittingAt, { child, package: pkg, path, stage })
        .match(testTimeAt, { child, micros, stage })
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          count: Type.literal(DocText.fields.count, 1n),
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.literal(DocText.fields.identifier, "duration"),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value: Type.cast(Num.div(micros, second), pg["double precision"]),
        });
    });

  /**
   * Each member the sitting never presented: its completionStatus `not_attempted` (§2.2.2.3).
   */
  const unpresentedStatus = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const membersAt = members.bind({ sittings });
    const presentedAt = presented.bind({ sittings });
    const { child, stage, package: pkg, path: test } = v(sittingAt, "unpresentedSitting");
    const { item } = v(membersAt, "unpresentedMember");

    return r
      .match(sittingAt, { child, package: pkg, path: test, stage })
      .match(membersAt, { item, package: pkg, path: test })
      .where(r.not(presentedAt, { child, package: pkg, path: item, stage }))
      .find({
        base: Type.literal(DocText.fields.base, "identifier"),
        child,
        count: Type.literal(DocText.fields.count, 1n),
        holds: Type.literal(DocText.fields.holds, "value"),
        identifier: Type.literal(DocText.fields.identifier, "completionStatus"),
        package: pkg,
        path: item,
        place: Type.literal(DocText.fields.place, 0n),
        stage,
        value: Type.literal(DocText.fields.value, "not_attempted"),
      });
  });

  /**
   * Each context the application binds for the sitting, where the test declares it single and of
   * the value's base type, by the test's document.
   */
  const boundFloats = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const { child, stage, package: pkg, path } = v(sittingAt, "floatSitting");
    const { identifier, value } = v(SessionContextFloat, "boundFloat");

    return r
      .match(sittingAt, { child, package: pkg, path, stage })
      .match(SessionContextFloat, { child, identifier, stage, value })
      .match(DeclarationName, {
        cardinality: "single",
        declarationKind: "qti-context-declaration",
        identifier,
        package: pkg,
        path,
      })
      .match(TypedDeclarationName, {
        baseType: "float",
        declarationKind: "qti-context-declaration",
        identifier,
        package: pkg,
        path,
      })
      .find({
        base: Type.literal(DocText.fields.base, "float"),
        child,
        count: Type.literal(DocText.fields.count, 1n),
        holds: Type.literal(DocText.fields.holds, "value"),
        identifier,
        package: pkg,
        path,
        place: Type.literal(DocText.fields.place, 0n),
        stage,
        value,
      });
  });
  const boundIntegers = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const { child, stage, package: pkg, path } = v(sittingAt, "integerSitting");
    const { identifier, value } = v(SessionContextInteger, "boundInteger");

    return r
      .match(sittingAt, { child, package: pkg, path, stage })
      .match(SessionContextInteger, { child, identifier, stage, value })
      .match(DeclarationName, {
        cardinality: "single",
        declarationKind: "qti-context-declaration",
        identifier,
        package: pkg,
        path,
      })
      .match(TypedDeclarationName, {
        baseType: "integer",
        declarationKind: "qti-context-declaration",
        identifier,
        package: pkg,
        path,
      })
      .find({
        child,
        count: Type.literal(DocText.fields.count, 1n),
        holds: Type.literal(DocText.fields.holds, "value"),
        identifier,
        package: pkg,
        path,
        place: Type.literal(DocText.fields.place, 0n),
        stage,
        value,
      });
  });
  const boundBooleans = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const { child, stage, package: pkg, path } = v(sittingAt, "booleanSitting");
    const { identifier, value } = v(SessionContextBoolean, "boundBoolean");

    return r
      .match(sittingAt, { child, package: pkg, path, stage })
      .match(SessionContextBoolean, { child, identifier, stage, value })
      .match(DeclarationName, {
        cardinality: "single",
        declarationKind: "qti-context-declaration",
        identifier,
        package: pkg,
        path,
      })
      .match(TypedDeclarationName, {
        baseType: "boolean",
        declarationKind: "qti-context-declaration",
        identifier,
        package: pkg,
        path,
      })
      .find({
        child,
        count: Type.literal(DocText.fields.count, 1n),
        holds: Type.literal(DocText.fields.holds, "value"),
        identifier,
        package: pkg,
        path,
        place: Type.literal(DocText.fields.place, 0n),
        stage,
        value,
      });
  });

  /**
   * The run's tree, the test's outcome processing and every declaration of the test and its
   * members, and every member's state after its latest attempt: P4's readers over the call's
   * sittings (`#ledger/grade.ts`).
   */
  const tree = testTreeOf(delivery);
  const snapshots = memberValuesOf(delivery);

  /**
   * Each member's built-in `numAttempts`: 1 once presented, else 0.
   */
  const attemptsStarted = query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const sittingAt = sitting.bind({ sittings });
      const membersAt = members.bind({ sittings });
      const presentedAt = presented.bind({ sittings });
      const { child, stage, package: pkg, path: test } = v(sittingAt, "startedSitting");
      const { item } = v(membersAt, "startedMember");

      return r
        .match(sittingAt, { child, package: pkg, path: test, stage })
        .match(membersAt, { item, package: pkg, path: test })
        .match(presentedAt, { child, package: pkg, path: item, stage })
        .find({
          child,
          count: Type.literal(DocText.fields.count, 1n),
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.literal(DocText.fields.identifier, "numAttempts"),
          package: pkg,
          path: item,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value: Type.literal(DocInteger.fields.value, 1n),
        });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const sittingAt = sitting.bind({ sittings });
      const membersAt = members.bind({ sittings });
      const presentedAt = presented.bind({ sittings });
      const { child, stage, package: pkg, path: test } = v(sittingAt, "unstartedSitting");
      const { item } = v(membersAt, "unstartedMember");

      return r
        .match(sittingAt, { child, package: pkg, path: test, stage })
        .match(membersAt, { item, package: pkg, path: test })
        .where(r.not(presentedAt, { child, package: pkg, path: item, stage }))
        .find({
          child,
          count: Type.literal(DocText.fields.count, 1n),
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.literal(DocText.fields.identifier, "numAttempts"),
          package: pkg,
          path: item,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value: Type.literal(DocInteger.fields.value, 0n),
        });
    });

  /**
   * Each boolean value: each member's snapshot's, and each bound context's.
   */
  const booleans = query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const snapshotsBooleansAt = snapshots.booleans.bind({ sittings });
      const {
        child,
        count,
        package: pkg,
        path,
        holds,
        identifier,
        place,
        value,
        stage,
      } = v(snapshotsBooleansAt, "snapshotBoolean");

      return r
        .match(snapshotsBooleansAt, {
          child,
          count,
          holds,
          identifier,
          package: pkg,
          path,
          place,
          stage,
          value,
        })
        .find({ child, count, holds, identifier, package: pkg, path, place, stage, value });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const boundBooleansAt = boundBooleans.bind({ sittings });
      const {
        child,
        count,
        package: pkg,
        path,
        holds,
        identifier,
        place,
        value,
        stage,
      } = v(boundBooleansAt, "contextBoolean");

      return r
        .match(boundBooleansAt, {
          child,
          count,
          holds,
          identifier,
          package: pkg,
          path,
          place,
          stage,
          value,
        })
        .find({ child, count, holds, identifier, package: pkg, path, place, stage, value });
    });

  /**
   * Each float and duration value: each member's snapshot's, each built-in duration, and each
   * bound context's.
   */
  const floats = query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const snapshotsFloatsAt = snapshots.floats.bind({ sittings });
      const {
        child,
        count,
        package: pkg,
        path,
        holds,
        identifier,
        place,
        base,
        value,
        stage,
      } = v(snapshotsFloatsAt, "snapshotFloat");

      return r
        .match(snapshotsFloatsAt, {
          base,
          child,
          count,
          holds,
          identifier,
          package: pkg,
          path,
          place,
          stage,
          value,
        })
        .find({ base, child, count, holds, identifier, package: pkg, path, place, stage, value });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const durationsAt = durations.bind({ sittings });
      const {
        child,
        count,
        package: pkg,
        path,
        holds,
        identifier,
        place,
        base,
        value,
        stage,
      } = v(durationsAt, "durationFloat");

      return r
        .match(durationsAt, {
          base,
          child,
          count,
          holds,
          identifier,
          package: pkg,
          path,
          place,
          stage,
          value,
        })
        .find({ base, child, count, holds, identifier, package: pkg, path, place, stage, value });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const boundFloatsAt = boundFloats.bind({ sittings });
      const {
        child,
        count,
        package: pkg,
        path,
        holds,
        identifier,
        place,
        base,
        value,
        stage,
      } = v(boundFloatsAt, "contextFloat");

      return r
        .match(boundFloatsAt, {
          base,
          child,
          count,
          holds,
          identifier,
          package: pkg,
          path,
          place,
          stage,
          value,
        })
        .find({ base, child, count, holds, identifier, package: pkg, path, place, stage, value });
    });

  /**
   * Each integer value: each member's snapshot's, each member's numAttempts, and each bound
   * context's.
   */
  const integers = query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const snapshotsIntegersAt = snapshots.integers.bind({ sittings });
      const {
        child,
        count,
        package: pkg,
        path,
        holds,
        identifier,
        place,
        value,
        stage,
      } = v(snapshotsIntegersAt, "snapshotInteger");

      return r
        .match(snapshotsIntegersAt, {
          child,
          count,
          holds,
          identifier,
          package: pkg,
          path,
          place,
          stage,
          value,
        })
        .find({ child, count, holds, identifier, package: pkg, path, place, stage, value });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const attemptsStartedAt = attemptsStarted.bind({ sittings });
      const {
        child,
        count,
        package: pkg,
        path,
        holds,
        identifier,
        place,
        value,
        stage,
      } = v(attemptsStartedAt, "startedInteger");

      return r
        .match(attemptsStartedAt, {
          child,
          count,
          holds,
          identifier,
          package: pkg,
          path,
          place,
          stage,
          value,
        })
        .find({ child, count, holds, identifier, package: pkg, path, place, stage, value });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const boundIntegersAt = boundIntegers.bind({ sittings });
      const {
        child,
        count,
        package: pkg,
        path,
        holds,
        identifier,
        place,
        value,
        stage,
      } = v(boundIntegersAt, "contextInteger");

      return r
        .match(boundIntegersAt, {
          child,
          count,
          holds,
          identifier,
          package: pkg,
          path,
          place,
          stage,
          value,
        })
        .find({ child, count, holds, identifier, package: pkg, path, place, stage, value });
    });

  /**
   * Each text value: each member's snapshot's, and each unpresented member's completionStatus.
   */
  const texts = query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const snapshotsTextsAt = snapshots.texts.bind({ sittings });
      const {
        child,
        count,
        package: pkg,
        path,
        holds,
        identifier,
        place,
        base,
        value,
        stage,
      } = v(snapshotsTextsAt, "snapshotText");

      return r
        .match(snapshotsTextsAt, {
          base,
          child,
          count,
          holds,
          identifier,
          package: pkg,
          path,
          place,
          stage,
          value,
        })
        .find({ base, child, count, holds, identifier, package: pkg, path, place, stage, value });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const unpresentedStatusAt = unpresentedStatus.bind({ sittings });
      const {
        child,
        count,
        package: pkg,
        path,
        holds,
        identifier,
        place,
        base,
        value,
        stage,
      } = v(unpresentedStatusAt, "statusText");

      return r
        .match(unpresentedStatusAt, {
          base,
          child,
          count,
          holds,
          identifier,
          package: pkg,
          path,
          place,
          stage,
          value,
        })
        .find({ base, child, count, holds, identifier, package: pkg, path, place, stage, value });
    });

  /**
   * Each variable given a header by the sitting's own record: each member's snapshot's, and the
   * built-ins': each member's duration and, unpresented, completionStatus; the test's duration; and
   * each bound context. The machine gives every declared response and numAttempts a header itself,
   * and reads each variable's kind, cardinality and base type from the declarations (`values_of`).
   */
  const vars = query(delivery)
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const snapshotsVarsAt = snapshots.vars.bind({ sittings });
      const {
        child,
        package: pkg,
        path,
        holds,
        identifier,
        stage,
      } = v(snapshotsVarsAt, "snapshotVar");

      return r
        .match(snapshotsVarsAt, { child, holds, identifier, package: pkg, path, stage })
        .find({ child, holds, identifier, package: pkg, path, stage });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const durationsAt = durations.bind({ sittings });
      const { child, package: pkg, path, identifier, stage } = v(durationsAt, "durationVar");

      return r.match(durationsAt, { child, identifier, package: pkg, path, stage }).find({
        child,
        holds: Type.literal(DocGiven.fields.holds, "value"),
        identifier,
        package: pkg,
        path,
        stage,
      });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const unpresentedStatusAt = unpresentedStatus.bind({ sittings });
      const { child, package: pkg, path, identifier, stage } = v(unpresentedStatusAt, "statusVar");

      return r.match(unpresentedStatusAt, { child, identifier, package: pkg, path, stage }).find({
        child,
        holds: Type.literal(DocGiven.fields.holds, "value"),
        identifier,
        package: pkg,
        path,
        stage,
      });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const boundFloatsAt = boundFloats.bind({ sittings });
      const { child, package: pkg, path, identifier, stage } = v(boundFloatsAt, "contextFloatVar");

      return r.match(boundFloatsAt, { child, identifier, package: pkg, path, stage }).find({
        child,
        holds: Type.literal(DocGiven.fields.holds, "value"),
        identifier,
        package: pkg,
        path,
        stage,
      });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const boundIntegersAt = boundIntegers.bind({ sittings });
      const {
        child,
        package: pkg,
        path,
        identifier,
        stage,
      } = v(boundIntegersAt, "contextIntegerVar");

      return r.match(boundIntegersAt, { child, identifier, package: pkg, path, stage }).find({
        child,
        holds: Type.literal(DocGiven.fields.holds, "value"),
        identifier,
        package: pkg,
        path,
        stage,
      });
    })
    .rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const boundBooleansAt = boundBooleans.bind({ sittings });
      const {
        child,
        package: pkg,
        path,
        identifier,
        stage,
      } = v(boundBooleansAt, "contextBooleanVar");

      return r.match(boundBooleansAt, { child, identifier, package: pkg, path, stage }).find({
        child,
        holds: Type.literal(DocGiven.fields.holds, "value"),
        identifier,
        package: pkg,
        path,
        stage,
      });
    });

  return (r: Rule<DeliveryLevel>) => {
    const sittings = r.relation("sittings", sittingHeading);

    return Fn.row(testOutcomeProcessingOf, {
      area_coords: tree.area_coords.bind({ sittings }),
      area_entries: tree.area_entries.bind({ sittings }),
      area_mappings: tree.area_mappings.bind({ sittings }),
      booleans: booleans.bind({ sittings }),
      declaration_attributes: tree.declaration_attributes.bind({ sittings }),
      declaration_texts: tree.declaration_texts.bind({ sittings }),
      declarations: tree.declarations.bind({ sittings }),
      directed_pairs: snapshots.directed_pairs.bind({ sittings }),
      field_booleans: snapshots.field_booleans.bind({ sittings }),
      field_directed_pairs: snapshots.field_directed_pairs.bind({ sittings }),
      field_files: snapshots.field_files.bind({ sittings }),
      field_floats: snapshots.field_floats.bind({ sittings }),
      field_integers: snapshots.field_integers.bind({ sittings }),
      field_pairs: snapshots.field_pairs.bind({ sittings }),
      field_points: snapshots.field_points.bind({ sittings }),
      field_texts: snapshots.field_texts.bind({ sittings }),
      files: snapshots.files.bind({ sittings }),
      floats: floats.bind({ sittings }),
      integers: integers.bind({ sittings }),
      interpolation_entries: tree.interpolation_entries.bind({ sittings }),
      kinds: tree.kinds.bind({ sittings }),
      lookups: tree.lookups.bind({ sittings }),
      map_entries: tree.map_entries.bind({ sittings }),
      mappings: tree.mappings.bind({ sittings }),
      match_entries: tree.match_entries.bind({ sittings }),
      member_bounds: memberBounds.bind({ sittings }),
      members: members.bind({ sittings }),
      pairs: snapshots.pairs.bind({ sittings }),
      points: snapshots.points.bind({ sittings }),
      programs: tree.programs.bind({ sittings }),
      ref_categories: refCategories.bind({ sittings }),
      ref_mappings: refMappings.bind({ sittings }),
      ref_sections: refSections.bind({ sittings }),
      ref_weights: refWeights.bind({ sittings }),
      runs: runs.bind({ sittings }),
      texts: texts.bind({ sittings }),
      value_booleans: tree.value_booleans.bind({ sittings }),
      value_directed_pairs: tree.value_directed_pairs.bind({ sittings }),
      value_floats: tree.value_floats.bind({ sittings }),
      value_integers: tree.value_integers.bind({ sittings }),
      value_pairs: tree.value_pairs.bind({ sittings }),
      value_points: tree.value_points.bind({ sittings }),
      value_texts: tree.value_texts.bind({ sittings }),
      vars: vars.bind({ sittings }),
      walk_areas: tree.walk_areas.bind({ sittings }),
      walk_categories: tree.walk_categories.bind({ sittings }),
      walk_coords: tree.walk_coords.bind({ sittings }),
      walk_customs: tree.walk_customs.bind({ sittings }),
      walk_equals: tree.walk_equals.bind({ sittings }),
      walk_filters: tree.walk_filters.bind({ sittings }),
      walk_floats: tree.walk_floats.bind({ sittings }),
      walk_idents: tree.walk_idents.bind({ sittings }),
      walk_integers: tree.walk_integers.bind({ sittings }),
      walk_literal_booleans: tree.walk_literal_booleans.bind({ sittings }),
      walk_literal_directed_pairs: tree.walk_literal_directed_pairs.bind({ sittings }),
      walk_literal_floats: tree.walk_literal_floats.bind({ sittings }),
      walk_literal_integers: tree.walk_literal_integers.bind({ sittings }),
      walk_literal_pairs: tree.walk_literal_pairs.bind({ sittings }),
      walk_literal_points: tree.walk_literal_points.bind({ sittings }),
      walk_literal_texts: tree.walk_literal_texts.bind({ sittings }),
      walk_names: tree.walk_names.bind({ sittings }),
      walk_patterns: tree.walk_patterns.bind({ sittings }),
      walk_refs: tree.walk_refs.bind({ sittings }),
      walk_rounds: tree.walk_rounds.bind({ sittings }),
      walk_texts: tree.walk_texts.bind({ sittings }),
    });
  };
};
