/**
 * Each item session of a sitting at its latest attempt, as it stands, with every value it holds, by
 * its shape then its base type (`#ledger/served-values.ts` `AttemptRows`), its credit and its
 * marks: what a review of the sitting shows of each of its questions, `#ledger/served-values.ts`
 * `recordOfRows` and `judgedOfRows` reading it into the record after the attempt and what the
 * database judged of it. An application attaches it under its own read of the sitting, so every
 * member's attempt is part of that read's one statement.
 *
 * - **The attempts**: each item session of the sitting at its latest attempt, processed or not (the
 *   Delivery level's `LatestAttempt`), by its key.
 * - **`processed`**: the completion status its response processing left (`ProcessedAttempt`), none
 *   while it is pending response processing (Results Reporting, Table 2.7.7,
 *   `pendingResponseProcessing`: "the item variables represent the values of the response variables
 *   after submission but before response processing has taken place"), such as an essay waiting for
 *   a person's value.
 * - **Its values**: each single as it stands, response processing's value or, where an
 *   external-scored outcome is asserted, its latest assertion's (`OutcomeInForceSingle<BaseType>`),
 *   and each multiple, ordered and record value as its snapshot holds it, a value of those
 *   cardinalities being never asserted.
 * - **`credit`**: its credit (`AttemptCredit`, the owner's rule), none while its score is pending or
 *   where its scores say none.
 * - **`marks`**: the database's marks on its responses' parts, `#ledger/mark-reads.ts` `markReadsOf`,
 *   bound to its sitting, whose evaluation of `attemptMarksOf` every shape's read of the statement
 *   shares.
 *
 * The latest attempt is the one derivation every reader of it shares, the Delivery level's
 * `LatestAttempt`, the marks' own among them. Each shape is one row of the attempt carrying its
 * eleven arrays, by base type, and its marks one row carrying eight, by the value's columns: a row
 * of all of them attached directly is past what TypeScript instantiates, and grizzle's evidence
 * proves no `"one"` child of a row's own key, so each row comes as an array of one.
 *
 * Generated from the Ledger level's sidecars by `tools/gen/attempt-rows.ts`: after changing one,
 * run `pnpm generate` in `packages/ledger`; `pnpm generate:check` refuses this file where it
 * differs.
 *
 * @module
 */
import type { Facts, InputOrigin, InstantDomain, NaturalDomain, Term } from "@bjornpagen/grizzle";
import { query, v } from "@bjornpagen/grizzle";
import { markReadsOf } from "#ledger/mark-reads.ts";
import type { SittingKey } from "#ledger/saved-rows.ts";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";

/**
 * A text field as a parent row carries it to the reads attached to it, an input of theirs: a read
 * that matches a relation's whole key at inputs holds at most one row of it, which an `"option"`
 * attachment needs proved.
 */
type TextTerm = Term<string, unknown, InputOrigin, "text", unknown, Facts, unknown>;

/**
 * A sitting's stage as a parent row carries it.
 */
type BigintTerm = Term<bigint, unknown, InputOrigin, "bigint", unknown, Facts, unknown>;

/**
 * An item session's place as a parent row carries it.
 */
type NaturalTerm = Term<NaturalDomain, unknown, InputOrigin, "bigint", unknown, Facts, unknown>;

/**
 * An instant as a parent row carries it.
 */
type InstantTerm = Term<InstantDomain, unknown, InputOrigin, "bigint", unknown, Facts, unknown>;

/**
 * An attempt's key as a parent row carries it: its item session's and its instant.
 */
type AttemptKey = Readonly<{
  at: InstantTerm;
  child: TextTerm;
  n: NaturalTerm;
  package: TextTerm;
  path: TextTerm;
}>;

/**
 * An attempt's key with its sitting's stage, as the attempt's row carries it to its marks.
 */
type MarkedKey = AttemptKey & Readonly<{ stage: BigintTerm }>;

/**
 * An attempt's key alone, out of a row that carries it.
 *
 * @param key The row.
 * @returns Its child, item, place and instant.
 */
const keyOf = (key: AttemptKey) => ({
  at: key.at,
  child: key.child,
  n: key.n,
  package: key.package,
  path: key.path,
});

/**
 * Give the reads of an attempt's rows over the Delivery level: `attempt`, each a read to attach
 * under a row that carries an attempt's key and its sitting's stage, by its attachment's name (the
 * completion status its processing left, every value it holds as it stands by cardinality, its
 * credit and its marks), which every reader of an attempt's rows attaches as they stand; and
 * `sitting`, a read to attach under an application's read of a sitting, by the sitting's key its
 * parent row carries: each item session of it that has an attempt, by its key, at its latest
 * attempt, with those reads attached.
 *
 * @param delivery The Delivery level.
 * @returns `attempt`, the reads of one attempt's rows, and `sitting`, the sitting's attempts, an
 *   `"array"` attachment, each row's `single`, `multiple`, `ordered` and `record` its value
 *   rows, `processed` its completion status where its response processing has run (an
 *   `"option"`), `credit` its credit and `marks` its mark rows.
 */
export const attemptRowsOf = (delivery: DeliveryLevel) => {
  const {
    Attempt,
    AttemptCredit,
    ItemSession,
    LatestAttempt,
    OutcomeInForceSingleBoolean,
    OutcomeInForceSingleDirectedPair,
    OutcomeInForceSingleDuration,
    OutcomeInForceSingleFile,
    OutcomeInForceSingleFloat,
    OutcomeInForceSingleIdentifier,
    OutcomeInForceSingleInteger,
    OutcomeInForceSinglePair,
    OutcomeInForceSinglePoint,
    OutcomeInForceSingleString,
    OutcomeInForceSingleUri,
    ProcessedAttempt,
    SnapshotMultipleBoolean,
    SnapshotMultipleDirectedPair,
    SnapshotMultipleDuration,
    SnapshotMultipleFile,
    SnapshotMultipleFloat,
    SnapshotMultipleIdentifier,
    SnapshotMultipleInteger,
    SnapshotMultiplePair,
    SnapshotMultiplePoint,
    SnapshotMultipleString,
    SnapshotMultipleUri,
    SnapshotOrderedBoolean,
    SnapshotOrderedDirectedPair,
    SnapshotOrderedDuration,
    SnapshotOrderedFile,
    SnapshotOrderedFloat,
    SnapshotOrderedIdentifier,
    SnapshotOrderedInteger,
    SnapshotOrderedPair,
    SnapshotOrderedPoint,
    SnapshotOrderedString,
    SnapshotOrderedUri,
    SnapshotRecordBoolean,
    SnapshotRecordDirectedPair,
    SnapshotRecordDuration,
    SnapshotRecordFile,
    SnapshotRecordFloat,
    SnapshotRecordIdentifier,
    SnapshotRecordInteger,
    SnapshotRecordPair,
    SnapshotRecordPoint,
    SnapshotRecordString,
    SnapshotRecordUri,
  } = delivery.relations;
  const marks = markReadsOf(delivery);
  const singlesOf = (attempt: AttemptKey) =>
    query(delivery)
      .rule((r) => r.match(Attempt, keyOf(attempt)).find(keyOf(attempt)))
      .attach(
        "identifier",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(OutcomeInForceSingleIdentifier, "value");

            return r
              .match(OutcomeInForceSingleIdentifier, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(OutcomeInForceSingleBoolean, "value");

            return r
              .match(OutcomeInForceSingleBoolean, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(OutcomeInForceSingleInteger, "value");

            return r
              .match(OutcomeInForceSingleInteger, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(OutcomeInForceSingleFloat, "value");

            return r
              .match(OutcomeInForceSingleFloat, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(OutcomeInForceSingleString, "value");

            return r
              .match(OutcomeInForceSingleString, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (values) =>
          query(delivery).rule((r) => {
            const { variable, x, y } = v(OutcomeInForceSinglePoint, "value");

            return r
              .match(OutcomeInForceSinglePoint, { ...keyOf(values), variable, x, y })
              .find({ variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (values) =>
          query(delivery).rule((r) => {
            const { greatest, least, variable } = v(OutcomeInForceSinglePair, "value");

            return r
              .match(OutcomeInForceSinglePair, { ...keyOf(values), greatest, least, variable })
              .find({ greatest, least, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (values) =>
          query(delivery).rule((r) => {
            const { source, target, variable } = v(OutcomeInForceSingleDirectedPair, "value");

            return r
              .match(OutcomeInForceSingleDirectedPair, {
                ...keyOf(values),
                source,
                target,
                variable,
              })
              .find({ source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(OutcomeInForceSingleDuration, "value");

            return r
              .match(OutcomeInForceSingleDuration, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(OutcomeInForceSingleUri, "value");

            return r
              .match(OutcomeInForceSingleUri, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (values) =>
          query(delivery).rule((r) => {
            const { digest, name, type, variable } = v(OutcomeInForceSingleFile, "value");

            return r
              .match(OutcomeInForceSingleFile, { ...keyOf(values), digest, name, type, variable })
              .find({ digest, name, type, variable });
          }),
        "array",
      );
  const multiplesOf = (attempt: AttemptKey) =>
    query(delivery)
      .rule((r) => r.match(Attempt, keyOf(attempt)).find(keyOf(attempt)))
      .attach(
        "identifier",
        (values) =>
          query(delivery).rule((r) => {
            const { count, value, variable } = v(SnapshotMultipleIdentifier, "value");

            return r
              .match(SnapshotMultipleIdentifier, { ...keyOf(values), count, value, variable })
              .find({ count, value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (values) =>
          query(delivery).rule((r) => {
            const { count, value, variable } = v(SnapshotMultipleBoolean, "value");

            return r
              .match(SnapshotMultipleBoolean, { ...keyOf(values), count, value, variable })
              .find({ count, value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (values) =>
          query(delivery).rule((r) => {
            const { count, value, variable } = v(SnapshotMultipleInteger, "value");

            return r
              .match(SnapshotMultipleInteger, { ...keyOf(values), count, value, variable })
              .find({ count, value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (values) =>
          query(delivery).rule((r) => {
            const { bits, count, value, variable } = v(SnapshotMultipleFloat, "value");

            return r
              .match(SnapshotMultipleFloat, { ...keyOf(values), bits, count, value, variable })
              .find({ bits, count, value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (values) =>
          query(delivery).rule((r) => {
            const { count, value, variable } = v(SnapshotMultipleString, "value");

            return r
              .match(SnapshotMultipleString, { ...keyOf(values), count, value, variable })
              .find({ count, value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (values) =>
          query(delivery).rule((r) => {
            const { count, variable, x, y } = v(SnapshotMultiplePoint, "value");

            return r
              .match(SnapshotMultiplePoint, { ...keyOf(values), count, variable, x, y })
              .find({ count, variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (values) =>
          query(delivery).rule((r) => {
            const { count, greatest, least, variable } = v(SnapshotMultiplePair, "value");

            return r
              .match(SnapshotMultiplePair, { ...keyOf(values), count, greatest, least, variable })
              .find({ count, greatest, least, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (values) =>
          query(delivery).rule((r) => {
            const { count, source, target, variable } = v(SnapshotMultipleDirectedPair, "value");

            return r
              .match(SnapshotMultipleDirectedPair, {
                ...keyOf(values),
                count,
                source,
                target,
                variable,
              })
              .find({ count, source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (values) =>
          query(delivery).rule((r) => {
            const { bits, count, value, variable } = v(SnapshotMultipleDuration, "value");

            return r
              .match(SnapshotMultipleDuration, { ...keyOf(values), bits, count, value, variable })
              .find({ bits, count, value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (values) =>
          query(delivery).rule((r) => {
            const { count, value, variable } = v(SnapshotMultipleUri, "value");

            return r
              .match(SnapshotMultipleUri, { ...keyOf(values), count, value, variable })
              .find({ count, value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (values) =>
          query(delivery).rule((r) => {
            const { count, digest, name, type, variable } = v(SnapshotMultipleFile, "value");

            return r
              .match(SnapshotMultipleFile, {
                ...keyOf(values),
                count,
                digest,
                name,
                type,
                variable,
              })
              .find({ count, digest, name, type, variable });
          }),
        "array",
      );
  const orderedsOf = (attempt: AttemptKey) =>
    query(delivery)
      .rule((r) => r.match(Attempt, keyOf(attempt)).find(keyOf(attempt)))
      .attach(
        "identifier",
        (values) =>
          query(delivery).rule((r) => {
            const { place, value, variable } = v(SnapshotOrderedIdentifier, "value");

            return r
              .match(SnapshotOrderedIdentifier, { ...keyOf(values), place, value, variable })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (values) =>
          query(delivery).rule((r) => {
            const { place, value, variable } = v(SnapshotOrderedBoolean, "value");

            return r
              .match(SnapshotOrderedBoolean, { ...keyOf(values), place, value, variable })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (values) =>
          query(delivery).rule((r) => {
            const { place, value, variable } = v(SnapshotOrderedInteger, "value");

            return r
              .match(SnapshotOrderedInteger, { ...keyOf(values), place, value, variable })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (values) =>
          query(delivery).rule((r) => {
            const { place, value, variable } = v(SnapshotOrderedFloat, "value");

            return r
              .match(SnapshotOrderedFloat, { ...keyOf(values), place, value, variable })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (values) =>
          query(delivery).rule((r) => {
            const { place, value, variable } = v(SnapshotOrderedString, "value");

            return r
              .match(SnapshotOrderedString, { ...keyOf(values), place, value, variable })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (values) =>
          query(delivery).rule((r) => {
            const { place, variable, x, y } = v(SnapshotOrderedPoint, "value");

            return r
              .match(SnapshotOrderedPoint, { ...keyOf(values), place, variable, x, y })
              .find({ place, variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (values) =>
          query(delivery).rule((r) => {
            const { greatest, least, place, variable } = v(SnapshotOrderedPair, "value");

            return r
              .match(SnapshotOrderedPair, { ...keyOf(values), greatest, least, place, variable })
              .find({ greatest, least, place, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (values) =>
          query(delivery).rule((r) => {
            const { place, source, target, variable } = v(SnapshotOrderedDirectedPair, "value");

            return r
              .match(SnapshotOrderedDirectedPair, {
                ...keyOf(values),
                place,
                source,
                target,
                variable,
              })
              .find({ place, source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (values) =>
          query(delivery).rule((r) => {
            const { place, value, variable } = v(SnapshotOrderedDuration, "value");

            return r
              .match(SnapshotOrderedDuration, { ...keyOf(values), place, value, variable })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (values) =>
          query(delivery).rule((r) => {
            const { place, value, variable } = v(SnapshotOrderedUri, "value");

            return r
              .match(SnapshotOrderedUri, { ...keyOf(values), place, value, variable })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (values) =>
          query(delivery).rule((r) => {
            const { digest, name, place, type, variable } = v(SnapshotOrderedFile, "value");

            return r
              .match(SnapshotOrderedFile, { ...keyOf(values), digest, name, place, type, variable })
              .find({ digest, name, place, type, variable });
          }),
        "array",
      );
  const recordsOf = (attempt: AttemptKey) =>
    query(delivery)
      .rule((r) => r.match(Attempt, keyOf(attempt)).find(keyOf(attempt)))
      .attach(
        "identifier",
        (values) =>
          query(delivery).rule((r) => {
            const { field, value, variable } = v(SnapshotRecordIdentifier, "value");

            return r
              .match(SnapshotRecordIdentifier, { ...keyOf(values), field, value, variable })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (values) =>
          query(delivery).rule((r) => {
            const { field, value, variable } = v(SnapshotRecordBoolean, "value");

            return r
              .match(SnapshotRecordBoolean, { ...keyOf(values), field, value, variable })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (values) =>
          query(delivery).rule((r) => {
            const { field, value, variable } = v(SnapshotRecordInteger, "value");

            return r
              .match(SnapshotRecordInteger, { ...keyOf(values), field, value, variable })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (values) =>
          query(delivery).rule((r) => {
            const { field, value, variable } = v(SnapshotRecordFloat, "value");

            return r
              .match(SnapshotRecordFloat, { ...keyOf(values), field, value, variable })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (values) =>
          query(delivery).rule((r) => {
            const { field, value, variable } = v(SnapshotRecordString, "value");

            return r
              .match(SnapshotRecordString, { ...keyOf(values), field, value, variable })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (values) =>
          query(delivery).rule((r) => {
            const { field, variable, x, y } = v(SnapshotRecordPoint, "value");

            return r
              .match(SnapshotRecordPoint, { ...keyOf(values), field, variable, x, y })
              .find({ field, variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (values) =>
          query(delivery).rule((r) => {
            const { field, greatest, least, variable } = v(SnapshotRecordPair, "value");

            return r
              .match(SnapshotRecordPair, { ...keyOf(values), field, greatest, least, variable })
              .find({ field, greatest, least, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (values) =>
          query(delivery).rule((r) => {
            const { field, source, target, variable } = v(SnapshotRecordDirectedPair, "value");

            return r
              .match(SnapshotRecordDirectedPair, {
                ...keyOf(values),
                field,
                source,
                target,
                variable,
              })
              .find({ field, source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (values) =>
          query(delivery).rule((r) => {
            const { field, value, variable } = v(SnapshotRecordDuration, "value");

            return r
              .match(SnapshotRecordDuration, { ...keyOf(values), field, value, variable })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (values) =>
          query(delivery).rule((r) => {
            const { field, value, variable } = v(SnapshotRecordUri, "value");

            return r
              .match(SnapshotRecordUri, { ...keyOf(values), field, value, variable })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (values) =>
          query(delivery).rule((r) => {
            const { digest, field, name, type, variable } = v(SnapshotRecordFile, "value");

            return r
              .match(SnapshotRecordFile, { ...keyOf(values), digest, field, name, type, variable })
              .find({ digest, field, name, type, variable });
          }),
        "array",
      );

  const processedOf = (attempt: AttemptKey) =>
    query(delivery).rule((r) => {
      const { completionStatus } = v(ProcessedAttempt, "processed");

      return r
        .match(ProcessedAttempt, { ...keyOf(attempt), completionStatus })
        .find({ completionStatus });
    });

  const creditOf = (attempt: AttemptKey) =>
    query(delivery).rule((r) => {
      const { earned, kind, maximum } = v(AttemptCredit, "credit");

      return r
        .match(AttemptCredit, { ...keyOf(attempt), earned, kind, maximum })
        .find({ earned, kind, maximum });
    });

  const sittingAt = query(delivery).rule((r) => {
    const child = r.param("child", ItemSession.fields.child);
    const stage = r.param("stage", ItemSession.fields.stage);

    return r.match(ItemSession, { child, stage }).find({ child, stage });
  });

  const marksOf = (attempt: MarkedKey) =>
    query(delivery)
      .rule((r) =>
        r.match(Attempt, keyOf(attempt)).find({ ...keyOf(attempt), stage: attempt.stage }),
      )
      .attach(
        "text",
        (marked) =>
          query(delivery).rule((r) => {
            const read = marks.text.bind({
              sittings: sittingAt.bind({ child: marked.child, stage: marked.stage }),
            });
            const { baseType, copies, mark, place, value, variable } = v(read, "mark");

            return r
              .match(read, { ...keyOf(marked), baseType, copies, mark, place, value, variable })
              .find({ baseType, copies, mark, place, value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (marked) =>
          query(delivery).rule((r) => {
            const read = marks.integer.bind({
              sittings: sittingAt.bind({ child: marked.child, stage: marked.stage }),
            });
            const { copies, mark, place, value, variable } = v(read, "mark");

            return r
              .match(read, { ...keyOf(marked), copies, mark, place, value, variable })
              .find({ copies, mark, place, value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (marked) =>
          query(delivery).rule((r) => {
            const read = marks.float.bind({
              sittings: sittingAt.bind({ child: marked.child, stage: marked.stage }),
            });
            const { baseType, copies, mark, place, value, variable } = v(read, "mark");

            return r
              .match(read, { ...keyOf(marked), baseType, copies, mark, place, value, variable })
              .find({ baseType, copies, mark, place, value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (marked) =>
          query(delivery).rule((r) => {
            const read = marks.boolean.bind({
              sittings: sittingAt.bind({ child: marked.child, stage: marked.stage }),
            });
            const { copies, mark, place, value, variable } = v(read, "mark");

            return r
              .match(read, { ...keyOf(marked), copies, mark, place, value, variable })
              .find({ copies, mark, place, value, variable });
          }),
        "array",
      )
      .attach(
        "pair",
        (marked) =>
          query(delivery).rule((r) => {
            const read = marks.pair.bind({
              sittings: sittingAt.bind({ child: marked.child, stage: marked.stage }),
            });
            const { copies, greatest, least, mark, place, variable } = v(read, "mark");

            return r
              .match(read, { ...keyOf(marked), copies, greatest, least, mark, place, variable })
              .find({ copies, greatest, least, mark, place, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (marked) =>
          query(delivery).rule((r) => {
            const read = marks.directedPair.bind({
              sittings: sittingAt.bind({ child: marked.child, stage: marked.stage }),
            });
            const { copies, mark, place, source, target, variable } = v(read, "mark");

            return r
              .match(read, { ...keyOf(marked), copies, mark, place, source, target, variable })
              .find({ copies, mark, place, source, target, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (marked) =>
          query(delivery).rule((r) => {
            const read = marks.point.bind({
              sittings: sittingAt.bind({ child: marked.child, stage: marked.stage }),
            });
            const { copies, mark, place, variable, x, y } = v(read, "mark");

            return r
              .match(read, { ...keyOf(marked), copies, mark, place, variable, x, y })
              .find({ copies, mark, place, variable, x, y });
          }),
        "array",
      )
      .attach(
        "file",
        (marked) =>
          query(delivery).rule((r) => {
            const read = marks.file.bind({
              sittings: sittingAt.bind({ child: marked.child, stage: marked.stage }),
            });
            const { contentType, copies, digest, mark, place, variable } = v(read, "mark");

            return r
              .match(read, { ...keyOf(marked), contentType, copies, digest, mark, place, variable })
              .find({ contentType, copies, digest, mark, place, variable });
          }),
        "array",
      );

  const attempt = {
    credit: creditOf,
    marks: marksOf,
    multiple: multiplesOf,
    ordered: orderedsOf,
    processed: processedOf,
    record: recordsOf,
    single: singlesOf,
  } as const;

  return {
    attempt,
    sitting: (sitting: SittingKey) =>
      query(delivery)
        .rule((r) => {
          const { at, child, n, package: pkg, path, stage } = v(LatestAttempt, "latest");

          return r
            .match(LatestAttempt, { at, child, n, package: pkg, path, stage })
            .where(r.eq(child, sitting.child), r.eq(stage, sitting.stage))
            .find({ at, child, n, package: pkg, path, stage });
        })
        .attach("processed", attempt.processed, "option")
        .attach("single", attempt.single, "array")
        .attach("multiple", attempt.multiple, "array")
        .attach("ordered", attempt.ordered, "array")
        .attach("record", attempt.record, "array")
        .attach("credit", attempt.credit, "array")
        .attach("marks", attempt.marks, "array"),
  } as const;
};
