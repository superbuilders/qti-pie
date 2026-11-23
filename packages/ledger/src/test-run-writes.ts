/**
 * A test outcome run's writes (the call `#ledger/test-run-call.ts`): the run header and each
 * sidecar's rows from the flat test entry's result, one insert per sidecar, since grizzle's types
 * admit no helper generic over a relation's heading, each shape's inserts a ChangeSet of their own,
 * joined by `ChangeSet.union`. A result row is the test's outcome after the run, held `value`, of
 * kind `outcome`; a single is its one row at place 0; a multiple's rows are its singles, whose
 * distinct values with their counts are its bag, a float's and a duration's by their bits
 * (`Num.floatBits`, so -0 and 0 are two values, as plate's multiple holds them); an ordered's are
 * at their places; a record's at its fields, each field's header beside its arm. No row is NULL.
 */
import { ChangeSet, Num, query, v } from "@bjornpagen/grizzle";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";
import { sittingHeading } from "#ledger/sitting-queries.ts";
import { dueOf, runOf } from "#ledger/test-run-call.ts";

/**
 * The relations a run writes, by name, for a role's insert list: a writer that composes the run
 * grants them all.
 */
export const testOutcomeRunTables = [
  "TestOutcomeRun",
  "TestOutcomeSingleIdentifier",
  "TestOutcomeSingleBoolean",
  "TestOutcomeSingleInteger",
  "TestOutcomeSingleFloat",
  "TestOutcomeSingleString",
  "TestOutcomeSinglePoint",
  "TestOutcomeSinglePair",
  "TestOutcomeSingleDirectedPair",
  "TestOutcomeSingleDuration",
  "TestOutcomeSingleUri",
  "TestOutcomeSingleFile",
  "TestOutcomeMultipleIdentifier",
  "TestOutcomeMultipleBoolean",
  "TestOutcomeMultipleInteger",
  "TestOutcomeMultipleFloat",
  "TestOutcomeMultipleString",
  "TestOutcomeMultiplePoint",
  "TestOutcomeMultiplePair",
  "TestOutcomeMultipleDirectedPair",
  "TestOutcomeMultipleDuration",
  "TestOutcomeMultipleUri",
  "TestOutcomeMultipleFile",
  "TestOutcomeOrderedIdentifier",
  "TestOutcomeOrderedBoolean",
  "TestOutcomeOrderedInteger",
  "TestOutcomeOrderedFloat",
  "TestOutcomeOrderedString",
  "TestOutcomeOrderedPoint",
  "TestOutcomeOrderedPair",
  "TestOutcomeOrderedDirectedPair",
  "TestOutcomeOrderedDuration",
  "TestOutcomeOrderedUri",
  "TestOutcomeOrderedFile",
  "TestOutcomeRecord",
  "TestOutcomeRecordIdentifier",
  "TestOutcomeRecordBoolean",
  "TestOutcomeRecordInteger",
  "TestOutcomeRecordFloat",
  "TestOutcomeRecordString",
  "TestOutcomeRecordPoint",
  "TestOutcomeRecordPair",
  "TestOutcomeRecordDirectedPair",
  "TestOutcomeRecordDuration",
  "TestOutcomeRecordUri",
  "TestOutcomeRecordFile",
] as const;

/**
 * The relations settling a sitting writes, by name, for a role's insert list: its test outcome
 * run's, and the fact that its outcomes are final (`SittingFinal`).
 */
export const settleTables = [...testOutcomeRunTables, "SittingFinal"] as const;

/**
 * The writes of one run of the outcome processing of each of the call's sittings, the `sittings`
 * relation parameter, where one is due ({@link dueOf}), at the instant the database stamps the run
 * with. Compose it after every write whose stratum changes an outcome the run reads, in a later
 * stratum (`ChangeSet.sequence`).
 */
export const testRunWritesOf = (delivery: DeliveryLevel) => {
  const sitting = dueOf(delivery);
  const runAt = runOf(delivery, sitting);
  const {
    TestOutcomeRun,
    TestOutcomeSingleIdentifier,
    TestOutcomeSingleBoolean,
    TestOutcomeSingleInteger,
    TestOutcomeSingleFloat,
    TestOutcomeSingleString,
    TestOutcomeSinglePoint,
    TestOutcomeSinglePair,
    TestOutcomeSingleDirectedPair,
    TestOutcomeSingleDuration,
    TestOutcomeSingleUri,
    TestOutcomeSingleFile,
    TestOutcomeMultipleIdentifier,
    TestOutcomeMultipleBoolean,
    TestOutcomeMultipleInteger,
    TestOutcomeMultipleFloat,
    TestOutcomeMultipleString,
    TestOutcomeMultiplePoint,
    TestOutcomeMultiplePair,
    TestOutcomeMultipleDirectedPair,
    TestOutcomeMultipleDuration,
    TestOutcomeMultipleUri,
    TestOutcomeMultipleFile,
    TestOutcomeOrderedIdentifier,
    TestOutcomeOrderedBoolean,
    TestOutcomeOrderedInteger,
    TestOutcomeOrderedFloat,
    TestOutcomeOrderedString,
    TestOutcomeOrderedPoint,
    TestOutcomeOrderedPair,
    TestOutcomeOrderedDirectedPair,
    TestOutcomeOrderedDuration,
    TestOutcomeOrderedUri,
    TestOutcomeOrderedFile,
    TestOutcomeRecord,
    TestOutcomeRecordIdentifier,
    TestOutcomeRecordBoolean,
    TestOutcomeRecordInteger,
    TestOutcomeRecordFloat,
    TestOutcomeRecordString,
    TestOutcomeRecordPoint,
    TestOutcomeRecordPair,
    TestOutcomeRecordDirectedPair,
    TestOutcomeRecordDuration,
    TestOutcomeRecordUri,
    TestOutcomeRecordFile,
    BaseType,
  } = delivery.relations;
  const header = ChangeSet.empty(delivery).insert(
    TestOutcomeRun,
    query(delivery).rule((r) => {
      const sittings = r.relation("sittings", sittingHeading);
      const sittingAt = sitting.bind({ sittings });
      const { child, stage } = v(sittingAt, "runSitting");

      return r.match(sittingAt, { child, stage }).find({ child, stage });
    }),
  );
  const multipleIdentifierBag = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const run = runAt(r);
    const { child, stage } = v(sittingAt, "multipleIdentifierBagSitting");
    const { identifier } = v(run.vars, "multipleIdentifierVar");
    const { place, value } = v(run.texts, "multipleIdentifierValue");

    return r
      .match(sittingAt, { child, stage })
      .match(run.vars, {
        card: "multiple",
        child,
        holds: "value",
        identifier,
        kind: "outcome",
        stage,
      })
      .match(run.texts, { base: "identifier", child, identifier, place, stage, value })
      .find({ child, identifier, place, stage, value });
  });
  const multipleBooleanBag = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const run = runAt(r);
    const { child, stage } = v(sittingAt, "multipleBooleanBagSitting");
    const { identifier } = v(run.vars, "multipleBooleanVar");
    const { place, value } = v(run.booleans, "multipleBooleanValue");

    return r
      .match(sittingAt, { child, stage })
      .match(run.vars, {
        card: "multiple",
        child,
        holds: "value",
        identifier,
        kind: "outcome",
        stage,
      })
      .match(run.booleans, { child, identifier, place, stage, value })
      .find({ child, identifier, place, stage, value });
  });
  const multipleIntegerBag = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const run = runAt(r);
    const { child, stage } = v(sittingAt, "multipleIntegerBagSitting");
    const { identifier } = v(run.vars, "multipleIntegerVar");
    const { place, value } = v(run.integers, "multipleIntegerValue");

    return r
      .match(sittingAt, { child, stage })
      .match(run.vars, {
        card: "multiple",
        child,
        holds: "value",
        identifier,
        kind: "outcome",
        stage,
      })
      .match(run.integers, { child, identifier, place, stage, value })
      .find({ child, identifier, place, stage, value });
  });
  const multipleFloatBag = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const run = runAt(r);
    const { child, stage } = v(sittingAt, "multipleFloatBagSitting");
    const { identifier } = v(run.vars, "multipleFloatVar");
    const { place, value } = v(run.floats, "multipleFloatValue");

    return r
      .match(sittingAt, { child, stage })
      .match(run.vars, {
        card: "multiple",
        child,
        holds: "value",
        identifier,
        kind: "outcome",
        stage,
      })
      .match(run.floats, { base: "float", child, identifier, place, stage, value })
      .find({ child, identifier, place, stage, value });
  });
  const multipleStringBag = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const run = runAt(r);
    const { child, stage } = v(sittingAt, "multipleStringBagSitting");
    const { identifier } = v(run.vars, "multipleStringVar");
    const { place, value } = v(run.texts, "multipleStringValue");

    return r
      .match(sittingAt, { child, stage })
      .match(run.vars, {
        card: "multiple",
        child,
        holds: "value",
        identifier,
        kind: "outcome",
        stage,
      })
      .match(run.texts, { base: "string", child, identifier, place, stage, value })
      .find({ child, identifier, place, stage, value });
  });
  const multiplePointBag = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const run = runAt(r);
    const { child, stage } = v(sittingAt, "multiplePointBagSitting");
    const { identifier } = v(run.vars, "multiplePointVar");
    const { place, x, y } = v(run.points, "multiplePointValue");

    return r
      .match(sittingAt, { child, stage })
      .match(run.vars, {
        card: "multiple",
        child,
        holds: "value",
        identifier,
        kind: "outcome",
        stage,
      })
      .match(run.points, { child, identifier, place, stage, x, y })
      .find({ child, identifier, place, stage, x, y });
  });
  const multiplePairBag = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const run = runAt(r);
    const { child, stage } = v(sittingAt, "multiplePairBagSitting");
    const { identifier } = v(run.vars, "multiplePairVar");
    const { place, least, greatest } = v(run.pairs, "multiplePairValue");

    return r
      .match(sittingAt, { child, stage })
      .match(run.vars, {
        card: "multiple",
        child,
        holds: "value",
        identifier,
        kind: "outcome",
        stage,
      })
      .match(run.pairs, { child, greatest, identifier, least, place, stage })
      .find({ child, greatest, identifier, least, place, stage });
  });
  const multipleDirectedPairBag = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const run = runAt(r);
    const { child, stage } = v(sittingAt, "multipleDirectedPairBagSitting");
    const { identifier } = v(run.vars, "multipleDirectedPairVar");
    const { place, source, target } = v(run.directed_pairs, "multipleDirectedPairValue");

    return r
      .match(sittingAt, { child, stage })
      .match(run.vars, {
        card: "multiple",
        child,
        holds: "value",
        identifier,
        kind: "outcome",
        stage,
      })
      .match(run.directed_pairs, { child, identifier, place, source, stage, target })
      .find({ child, identifier, place, source, stage, target });
  });
  const multipleDurationBag = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const run = runAt(r);
    const { child, stage } = v(sittingAt, "multipleDurationBagSitting");
    const { identifier } = v(run.vars, "multipleDurationVar");
    const { place, value } = v(run.floats, "multipleDurationValue");

    return r
      .match(sittingAt, { child, stage })
      .match(run.vars, {
        card: "multiple",
        child,
        holds: "value",
        identifier,
        kind: "outcome",
        stage,
      })
      .match(run.floats, { base: "duration", child, identifier, place, stage, value })
      .find({ child, identifier, place, stage, value });
  });
  const multipleUriBag = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const run = runAt(r);
    const { child, stage } = v(sittingAt, "multipleUriBagSitting");
    const { identifier } = v(run.vars, "multipleUriVar");
    const { place, value } = v(run.texts, "multipleUriValue");

    return r
      .match(sittingAt, { child, stage })
      .match(run.vars, {
        card: "multiple",
        child,
        holds: "value",
        identifier,
        kind: "outcome",
        stage,
      })
      .match(run.texts, { base: "uri", child, identifier, place, stage, value })
      .find({ child, identifier, place, stage, value });
  });
  const multipleFileBag = query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const sittingAt = sitting.bind({ sittings });
    const run = runAt(r);
    const { child, stage } = v(sittingAt, "multipleFileBagSitting");
    const { identifier } = v(run.vars, "multipleFileVar");
    const { place, digest, content_type: contentType, name } = v(run.files, "multipleFileValue");

    return r
      .match(sittingAt, { child, stage })
      .match(run.vars, {
        card: "multiple",
        child,
        holds: "value",
        identifier,
        kind: "outcome",
        stage,
      })
      .match(run.files, {
        child,
        content_type: contentType,
        digest,
        identifier,
        name,
        place,
        stage,
      })
      .find({ child, contentType, digest, identifier, name, place, stage });
  });
  const singles = ChangeSet.empty(delivery)
    .insert(
      TestOutcomeSingleIdentifier,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "singleIdentifierSitting");
        const { identifier } = v(run.vars, "singleIdentifierVar");
        const { place, value } = v(run.texts, "singleIdentifierValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "single",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.texts, { base: "identifier", child, identifier, place, stage, value })
          .where(r.eq(place, 0n))
          .find({ child, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeSingleBoolean,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "singleBooleanSitting");
        const { identifier } = v(run.vars, "singleBooleanVar");
        const { place, value } = v(run.booleans, "singleBooleanValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "single",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.booleans, { child, identifier, place, stage, value })
          .where(r.eq(place, 0n))
          .find({ child, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeSingleInteger,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "singleIntegerSitting");
        const { identifier } = v(run.vars, "singleIntegerVar");
        const { place, value } = v(run.integers, "singleIntegerValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "single",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.integers, { child, identifier, place, stage, value })
          .where(r.eq(place, 0n))
          .find({ child, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeSingleFloat,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "singleFloatSitting");
        const { identifier } = v(run.vars, "singleFloatVar");
        const { place, value } = v(run.floats, "singleFloatValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "single",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.floats, { base: "float", child, identifier, place, stage, value })
          .where(r.eq(place, 0n))
          .find({ child, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeSingleString,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "singleStringSitting");
        const { identifier } = v(run.vars, "singleStringVar");
        const { place, value } = v(run.texts, "singleStringValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "single",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.texts, { base: "string", child, identifier, place, stage, value })
          .where(r.eq(place, 0n))
          .find({ child, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeSinglePoint,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "singlePointSitting");
        const { identifier } = v(run.vars, "singlePointVar");
        const { place, x, y } = v(run.points, "singlePointValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "single",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.points, { child, identifier, place, stage, x, y })
          .where(r.eq(place, 0n))
          .find({ child, stage, variable: identifier, x, y });
      }),
    )
    .insert(
      TestOutcomeSinglePair,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "singlePairSitting");
        const { identifier } = v(run.vars, "singlePairVar");
        const { place, least, greatest } = v(run.pairs, "singlePairValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "single",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.pairs, { child, greatest, identifier, least, place, stage })
          .where(r.eq(place, 0n))
          .find({ child, greatest, least, stage, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeSingleDirectedPair,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "singleDirectedPairSitting");
        const { identifier } = v(run.vars, "singleDirectedPairVar");
        const { place, source, target } = v(run.directed_pairs, "singleDirectedPairValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "single",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.directed_pairs, { child, identifier, place, source, stage, target })
          .where(r.eq(place, 0n))
          .find({ child, source, stage, target, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeSingleDuration,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "singleDurationSitting");
        const { identifier } = v(run.vars, "singleDurationVar");
        const { place, value } = v(run.floats, "singleDurationValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "single",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.floats, { base: "duration", child, identifier, place, stage, value })
          .where(r.eq(place, 0n))
          .find({ child, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeSingleUri,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "singleUriSitting");
        const { identifier } = v(run.vars, "singleUriVar");
        const { place, value } = v(run.texts, "singleUriValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "single",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.texts, { base: "uri", child, identifier, place, stage, value })
          .where(r.eq(place, 0n))
          .find({ child, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeSingleFile,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "singleFileSitting");
        const { identifier } = v(run.vars, "singleFileVar");
        const { place, digest, content_type: contentType, name } = v(run.files, "singleFileValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "single",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.files, {
            child,
            content_type: contentType,
            digest,
            identifier,
            name,
            place,
            stage,
          })
          .where(r.eq(place, 0n))
          .find({ child, digest, name, stage, type: contentType, variable: identifier });
      }),
    );
  const multiples = ChangeSet.empty(delivery)
    .insert(
      TestOutcomeMultipleIdentifier,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const multipleIdentifierBagAt = multipleIdentifierBag.bind({ sittings });
        const { child, stage, identifier, place, value } = v(
          multipleIdentifierBagAt,
          "multipleIdentifier",
        );

        return r.match(multipleIdentifierBagAt, { child, identifier, place, stage, value }).find({
          child,
          count: r.count(),
          stage,
          value,
          variable: identifier,
        });
      }),
    )
    .insert(
      TestOutcomeMultipleBoolean,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const multipleBooleanBagAt = multipleBooleanBag.bind({ sittings });
        const { child, stage, identifier, place, value } = v(
          multipleBooleanBagAt,
          "multipleBoolean",
        );

        return r
          .match(multipleBooleanBagAt, { child, identifier, place, stage, value })
          .find({ child, count: r.count(), stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeMultipleInteger,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const multipleIntegerBagAt = multipleIntegerBag.bind({ sittings });
        const { child, stage, identifier, place, value } = v(
          multipleIntegerBagAt,
          "multipleInteger",
        );

        return r
          .match(multipleIntegerBagAt, { child, identifier, place, stage, value })
          .find({ child, count: r.count(), stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeMultipleFloat,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const multipleFloatBagAt = multipleFloatBag.bind({ sittings });
        const { child, stage, identifier, place, value } = v(multipleFloatBagAt, "multipleFloat");

        return r.match(multipleFloatBagAt, { child, identifier, place, stage, value }).find({
          bits: Num.floatBits(value),
          child,
          count: r.count(),
          stage,
          value,
          variable: identifier,
        });
      }),
    )
    .insert(
      TestOutcomeMultipleString,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const multipleStringBagAt = multipleStringBag.bind({ sittings });
        const { child, stage, identifier, place, value } = v(multipleStringBagAt, "multipleString");

        return r.match(multipleStringBagAt, { child, identifier, place, stage, value }).find({
          child,
          count: r.count(),
          stage,
          value,
          variable: identifier,
        });
      }),
    )
    .insert(
      TestOutcomeMultiplePoint,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const multiplePointBagAt = multiplePointBag.bind({ sittings });
        const { child, stage, identifier, place, x, y } = v(multiplePointBagAt, "multiplePoint");

        return r
          .match(multiplePointBagAt, { child, identifier, place, stage, x, y })
          .find({ child, count: r.count(), stage, variable: identifier, x, y });
      }),
    )
    .insert(
      TestOutcomeMultiplePair,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const multiplePairBagAt = multiplePairBag.bind({ sittings });
        const { child, stage, identifier, place, least, greatest } = v(
          multiplePairBagAt,
          "multiplePair",
        );

        return r
          .match(multiplePairBagAt, { child, greatest, identifier, least, place, stage })
          .find({
            child,
            count: r.count(),
            greatest,
            least,
            stage,
            variable: identifier,
          });
      }),
    )
    .insert(
      TestOutcomeMultipleDirectedPair,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const multipleDirectedPairBagAt = multipleDirectedPairBag.bind({ sittings });
        const { child, stage, identifier, place, source, target } = v(
          multipleDirectedPairBagAt,
          "multipleDirectedPair",
        );

        return r
          .match(multipleDirectedPairBagAt, { child, identifier, place, source, stage, target })
          .find({
            child,
            count: r.count(),
            source,
            stage,
            target,
            variable: identifier,
          });
      }),
    )
    .insert(
      TestOutcomeMultipleDuration,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const multipleDurationBagAt = multipleDurationBag.bind({ sittings });
        const { child, stage, identifier, place, value } = v(
          multipleDurationBagAt,
          "multipleDuration",
        );

        return r.match(multipleDurationBagAt, { child, identifier, place, stage, value }).find({
          bits: Num.floatBits(value),
          child,
          count: r.count(),
          stage,
          value,
          variable: identifier,
        });
      }),
    )
    .insert(
      TestOutcomeMultipleUri,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const multipleUriBagAt = multipleUriBag.bind({ sittings });
        const { child, stage, identifier, place, value } = v(multipleUriBagAt, "multipleUri");

        return r.match(multipleUriBagAt, { child, identifier, place, stage, value }).find({
          child,
          count: r.count(),
          stage,
          value,
          variable: identifier,
        });
      }),
    )
    .insert(
      TestOutcomeMultipleFile,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const multipleFileBagAt = multipleFileBag.bind({ sittings });
        const { child, stage, identifier, place, digest, contentType, name } = v(
          multipleFileBagAt,
          "multipleFile",
        );

        return r
          .match(multipleFileBagAt, { child, contentType, digest, identifier, name, place, stage })
          .find({
            child,
            count: r.count(),
            digest,
            name,
            stage,
            type: contentType,
            variable: identifier,
          });
      }),
    );
  const ordereds = ChangeSet.empty(delivery)
    .insert(
      TestOutcomeOrderedIdentifier,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "orderedIdentifierSitting");
        const { identifier } = v(run.vars, "orderedIdentifierVar");
        const { place, value } = v(run.texts, "orderedIdentifierValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "ordered",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.texts, { base: "identifier", child, identifier, place, stage, value })
          .find({ child, place, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeOrderedBoolean,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "orderedBooleanSitting");
        const { identifier } = v(run.vars, "orderedBooleanVar");
        const { place, value } = v(run.booleans, "orderedBooleanValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "ordered",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.booleans, { child, identifier, place, stage, value })
          .find({ child, place, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeOrderedInteger,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "orderedIntegerSitting");
        const { identifier } = v(run.vars, "orderedIntegerVar");
        const { place, value } = v(run.integers, "orderedIntegerValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "ordered",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.integers, { child, identifier, place, stage, value })
          .find({ child, place, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeOrderedFloat,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "orderedFloatSitting");
        const { identifier } = v(run.vars, "orderedFloatVar");
        const { place, value } = v(run.floats, "orderedFloatValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "ordered",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.floats, { base: "float", child, identifier, place, stage, value })
          .find({ child, place, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeOrderedString,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "orderedStringSitting");
        const { identifier } = v(run.vars, "orderedStringVar");
        const { place, value } = v(run.texts, "orderedStringValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "ordered",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.texts, { base: "string", child, identifier, place, stage, value })
          .find({ child, place, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeOrderedPoint,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "orderedPointSitting");
        const { identifier } = v(run.vars, "orderedPointVar");
        const { place, x, y } = v(run.points, "orderedPointValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "ordered",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.points, { child, identifier, place, stage, x, y })
          .find({ child, place, stage, variable: identifier, x, y });
      }),
    )
    .insert(
      TestOutcomeOrderedPair,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "orderedPairSitting");
        const { identifier } = v(run.vars, "orderedPairVar");
        const { place, least, greatest } = v(run.pairs, "orderedPairValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "ordered",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.pairs, { child, greatest, identifier, least, place, stage })
          .find({ child, greatest, least, place, stage, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeOrderedDirectedPair,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "orderedDirectedPairSitting");
        const { identifier } = v(run.vars, "orderedDirectedPairVar");
        const { place, source, target } = v(run.directed_pairs, "orderedDirectedPairValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "ordered",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.directed_pairs, { child, identifier, place, source, stage, target })
          .find({ child, place, source, stage, target, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeOrderedDuration,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "orderedDurationSitting");
        const { identifier } = v(run.vars, "orderedDurationVar");
        const { place, value } = v(run.floats, "orderedDurationValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "ordered",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.floats, { base: "duration", child, identifier, place, stage, value })
          .find({ child, place, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeOrderedUri,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "orderedUriSitting");
        const { identifier } = v(run.vars, "orderedUriVar");
        const { place, value } = v(run.texts, "orderedUriValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "ordered",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.texts, { base: "uri", child, identifier, place, stage, value })
          .find({ child, place, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeOrderedFile,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "orderedFileSitting");
        const { identifier } = v(run.vars, "orderedFileVar");
        const { place, digest, content_type: contentType, name } = v(run.files, "orderedFileValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "ordered",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.files, {
            child,
            content_type: contentType,
            digest,
            identifier,
            name,
            place,
            stage,
          })
          .find({ child, digest, name, place, stage, type: contentType, variable: identifier });
      }),
    );
  const records = ChangeSet.empty(delivery)
    .insert(
      TestOutcomeRecord,
      query(delivery)
        .rule((r) => {
          const sittings = r.relation("sittings", sittingHeading);
          const sittingAt = sitting.bind({ sittings });
          const run = runAt(r);
          const { child, stage } = v(sittingAt, "recordIdentifierHeaderSitting");
          const { identifier } = v(run.vars, "recordIdentifierHeaderVar");
          const { field } = v(run.field_texts, "recordIdentifierHeaderField");

          return r
            .match(sittingAt, { child, stage })
            .match(run.vars, {
              card: "record",
              child,
              holds: "value",
              identifier,
              kind: "outcome",
              stage,
            })
            .match(run.field_texts, { base: "identifier", child, field, identifier, stage })
            .find({
              baseType: BaseType.handle("identifier"),
              child,
              field,
              stage,
              variable: identifier,
            });
        })
        .rule((r) => {
          const sittings = r.relation("sittings", sittingHeading);
          const sittingAt = sitting.bind({ sittings });
          const run = runAt(r);
          const { child, stage } = v(sittingAt, "recordBooleanHeaderSitting");
          const { identifier } = v(run.vars, "recordBooleanHeaderVar");
          const { field } = v(run.field_booleans, "recordBooleanHeaderField");

          return r
            .match(sittingAt, { child, stage })
            .match(run.vars, {
              card: "record",
              child,
              holds: "value",
              identifier,
              kind: "outcome",
              stage,
            })
            .match(run.field_booleans, { child, field, identifier, stage })
            .find({
              baseType: BaseType.handle("boolean"),
              child,
              field,
              stage,
              variable: identifier,
            });
        })
        .rule((r) => {
          const sittings = r.relation("sittings", sittingHeading);
          const sittingAt = sitting.bind({ sittings });
          const run = runAt(r);
          const { child, stage } = v(sittingAt, "recordIntegerHeaderSitting");
          const { identifier } = v(run.vars, "recordIntegerHeaderVar");
          const { field } = v(run.field_integers, "recordIntegerHeaderField");

          return r
            .match(sittingAt, { child, stage })
            .match(run.vars, {
              card: "record",
              child,
              holds: "value",
              identifier,
              kind: "outcome",
              stage,
            })
            .match(run.field_integers, { child, field, identifier, stage })
            .find({
              baseType: BaseType.handle("integer"),
              child,
              field,
              stage,
              variable: identifier,
            });
        })
        .rule((r) => {
          const sittings = r.relation("sittings", sittingHeading);
          const sittingAt = sitting.bind({ sittings });
          const run = runAt(r);
          const { child, stage } = v(sittingAt, "recordFloatHeaderSitting");
          const { identifier } = v(run.vars, "recordFloatHeaderVar");
          const { field } = v(run.field_floats, "recordFloatHeaderField");

          return r
            .match(sittingAt, { child, stage })
            .match(run.vars, {
              card: "record",
              child,
              holds: "value",
              identifier,
              kind: "outcome",
              stage,
            })
            .match(run.field_floats, { base: "float", child, field, identifier, stage })
            .find({
              baseType: BaseType.handle("float"),
              child,
              field,
              stage,
              variable: identifier,
            });
        })
        .rule((r) => {
          const sittings = r.relation("sittings", sittingHeading);
          const sittingAt = sitting.bind({ sittings });
          const run = runAt(r);
          const { child, stage } = v(sittingAt, "recordStringHeaderSitting");
          const { identifier } = v(run.vars, "recordStringHeaderVar");
          const { field } = v(run.field_texts, "recordStringHeaderField");

          return r
            .match(sittingAt, { child, stage })
            .match(run.vars, {
              card: "record",
              child,
              holds: "value",
              identifier,
              kind: "outcome",
              stage,
            })
            .match(run.field_texts, { base: "string", child, field, identifier, stage })
            .find({
              baseType: BaseType.handle("string"),
              child,
              field,
              stage,
              variable: identifier,
            });
        })
        .rule((r) => {
          const sittings = r.relation("sittings", sittingHeading);
          const sittingAt = sitting.bind({ sittings });
          const run = runAt(r);
          const { child, stage } = v(sittingAt, "recordPointHeaderSitting");
          const { identifier } = v(run.vars, "recordPointHeaderVar");
          const { field } = v(run.field_points, "recordPointHeaderField");

          return r
            .match(sittingAt, { child, stage })
            .match(run.vars, {
              card: "record",
              child,
              holds: "value",
              identifier,
              kind: "outcome",
              stage,
            })
            .match(run.field_points, { child, field, identifier, stage })
            .find({
              baseType: BaseType.handle("point"),
              child,
              field,
              stage,
              variable: identifier,
            });
        })
        .rule((r) => {
          const sittings = r.relation("sittings", sittingHeading);
          const sittingAt = sitting.bind({ sittings });
          const run = runAt(r);
          const { child, stage } = v(sittingAt, "recordPairHeaderSitting");
          const { identifier } = v(run.vars, "recordPairHeaderVar");
          const { field } = v(run.field_pairs, "recordPairHeaderField");

          return r
            .match(sittingAt, { child, stage })
            .match(run.vars, {
              card: "record",
              child,
              holds: "value",
              identifier,
              kind: "outcome",
              stage,
            })
            .match(run.field_pairs, { child, field, identifier, stage })
            .find({
              baseType: BaseType.handle("pair"),
              child,
              field,
              stage,
              variable: identifier,
            });
        })
        .rule((r) => {
          const sittings = r.relation("sittings", sittingHeading);
          const sittingAt = sitting.bind({ sittings });
          const run = runAt(r);
          const { child, stage } = v(sittingAt, "recordDirectedPairHeaderSitting");
          const { identifier } = v(run.vars, "recordDirectedPairHeaderVar");
          const { field } = v(run.field_directed_pairs, "recordDirectedPairHeaderField");

          return r
            .match(sittingAt, { child, stage })
            .match(run.vars, {
              card: "record",
              child,
              holds: "value",
              identifier,
              kind: "outcome",
              stage,
            })
            .match(run.field_directed_pairs, { child, field, identifier, stage })
            .find({
              baseType: BaseType.handle("directedPair"),
              child,
              field,
              stage,
              variable: identifier,
            });
        })
        .rule((r) => {
          const sittings = r.relation("sittings", sittingHeading);
          const sittingAt = sitting.bind({ sittings });
          const run = runAt(r);
          const { child, stage } = v(sittingAt, "recordDurationHeaderSitting");
          const { identifier } = v(run.vars, "recordDurationHeaderVar");
          const { field } = v(run.field_floats, "recordDurationHeaderField");

          return r
            .match(sittingAt, { child, stage })
            .match(run.vars, {
              card: "record",
              child,
              holds: "value",
              identifier,
              kind: "outcome",
              stage,
            })
            .match(run.field_floats, { base: "duration", child, field, identifier, stage })
            .find({
              baseType: BaseType.handle("duration"),
              child,
              field,
              stage,
              variable: identifier,
            });
        })
        .rule((r) => {
          const sittings = r.relation("sittings", sittingHeading);
          const sittingAt = sitting.bind({ sittings });
          const run = runAt(r);
          const { child, stage } = v(sittingAt, "recordUriHeaderSitting");
          const { identifier } = v(run.vars, "recordUriHeaderVar");
          const { field } = v(run.field_texts, "recordUriHeaderField");

          return r
            .match(sittingAt, { child, stage })
            .match(run.vars, {
              card: "record",
              child,
              holds: "value",
              identifier,
              kind: "outcome",
              stage,
            })
            .match(run.field_texts, { base: "uri", child, field, identifier, stage })
            .find({
              baseType: BaseType.handle("uri"),
              child,
              field,
              stage,
              variable: identifier,
            });
        })
        .rule((r) => {
          const sittings = r.relation("sittings", sittingHeading);
          const sittingAt = sitting.bind({ sittings });
          const run = runAt(r);
          const { child, stage } = v(sittingAt, "recordFileHeaderSitting");
          const { identifier } = v(run.vars, "recordFileHeaderVar");
          const { field } = v(run.field_files, "recordFileHeaderField");

          return r
            .match(sittingAt, { child, stage })
            .match(run.vars, {
              card: "record",
              child,
              holds: "value",
              identifier,
              kind: "outcome",
              stage,
            })
            .match(run.field_files, { child, field, identifier, stage })
            .find({
              baseType: BaseType.handle("file"),
              child,
              field,
              stage,
              variable: identifier,
            });
        }),
    )
    .insert(
      TestOutcomeRecordIdentifier,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "recordIdentifierSitting");
        const { identifier } = v(run.vars, "recordIdentifierVar");
        const { field, value } = v(run.field_texts, "recordIdentifierValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "record",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.field_texts, { base: "identifier", child, field, identifier, stage, value })
          .find({ child, field, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeRecordBoolean,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "recordBooleanSitting");
        const { identifier } = v(run.vars, "recordBooleanVar");
        const { field, value } = v(run.field_booleans, "recordBooleanValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "record",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.field_booleans, { child, field, identifier, stage, value })
          .find({ child, field, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeRecordInteger,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "recordIntegerSitting");
        const { identifier } = v(run.vars, "recordIntegerVar");
        const { field, value } = v(run.field_integers, "recordIntegerValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "record",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.field_integers, { child, field, identifier, stage, value })
          .find({ child, field, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeRecordFloat,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "recordFloatSitting");
        const { identifier } = v(run.vars, "recordFloatVar");
        const { field, value } = v(run.field_floats, "recordFloatValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "record",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.field_floats, { base: "float", child, field, identifier, stage, value })
          .find({ child, field, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeRecordString,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "recordStringSitting");
        const { identifier } = v(run.vars, "recordStringVar");
        const { field, value } = v(run.field_texts, "recordStringValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "record",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.field_texts, { base: "string", child, field, identifier, stage, value })
          .find({ child, field, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeRecordPoint,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "recordPointSitting");
        const { identifier } = v(run.vars, "recordPointVar");
        const { field, x, y } = v(run.field_points, "recordPointValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "record",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.field_points, { child, field, identifier, stage, x, y })
          .find({ child, field, stage, variable: identifier, x, y });
      }),
    )
    .insert(
      TestOutcomeRecordPair,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "recordPairSitting");
        const { identifier } = v(run.vars, "recordPairVar");
        const { field, least, greatest } = v(run.field_pairs, "recordPairValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "record",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.field_pairs, { child, field, greatest, identifier, least, stage })
          .find({
            child,
            field,
            greatest,
            least,
            stage,
            variable: identifier,
          });
      }),
    )
    .insert(
      TestOutcomeRecordDirectedPair,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "recordDirectedPairSitting");
        const { identifier } = v(run.vars, "recordDirectedPairVar");
        const { field, source, target } = v(run.field_directed_pairs, "recordDirectedPairValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "record",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.field_directed_pairs, { child, field, identifier, source, stage, target })
          .find({
            child,
            field,
            source,
            stage,
            target,
            variable: identifier,
          });
      }),
    )
    .insert(
      TestOutcomeRecordDuration,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "recordDurationSitting");
        const { identifier } = v(run.vars, "recordDurationVar");
        const { field, value } = v(run.field_floats, "recordDurationValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "record",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.field_floats, { base: "duration", child, field, identifier, stage, value })
          .find({ child, field, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeRecordUri,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "recordUriSitting");
        const { identifier } = v(run.vars, "recordUriVar");
        const { field, value } = v(run.field_texts, "recordUriValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "record",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.field_texts, { base: "uri", child, field, identifier, stage, value })
          .find({ child, field, stage, value, variable: identifier });
      }),
    )
    .insert(
      TestOutcomeRecordFile,
      query(delivery).rule((r) => {
        const sittings = r.relation("sittings", sittingHeading);
        const sittingAt = sitting.bind({ sittings });
        const run = runAt(r);
        const { child, stage } = v(sittingAt, "recordFileSitting");
        const { identifier } = v(run.vars, "recordFileVar");
        const {
          field,
          digest,
          content_type: contentType,
          name,
        } = v(run.field_files, "recordFileValue");

        return r
          .match(sittingAt, { child, stage })
          .match(run.vars, {
            card: "record",
            child,
            holds: "value",
            identifier,
            kind: "outcome",
            stage,
          })
          .match(run.field_files, {
            child,
            content_type: contentType,
            digest,
            field,
            identifier,
            name,
            stage,
          })
          .find({
            child,
            digest,
            field,
            name,
            stage,
            type: contentType,
            variable: identifier,
          });
      }),
    );

  return ChangeSet.union(
    ChangeSet.union(header, ChangeSet.union(singles, multiples)),
    ChangeSet.union(ordereds, records),
  );
};
