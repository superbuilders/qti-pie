/**
 * The latest save of each item session of a sitting, with every value it holds, by its shape then
 * its base type (`#ledger/served-values.ts` `ValueRows`): what a reopened item restores, QTI's
 * suspended state (§2.2.1), "the candidate's responses are restored correctly" (conformance
 * T-14), `#ledger/served-values.ts` `responsesOfRows` reading it into the responses
 * `#ledger/served-item.ts` `resumedOf` starts the item from. An application attaches it under its
 * own read of the sitting, so every member's save is part of that read's one statement.
 *
 * The latest save is the one derivation every reader of it shares, `#ledger/sitting-queries.ts`
 * `latestSavesOf`, the close's among them. Each shape is one row of the save's snapshot carrying
 * its eleven arrays, by base type: a row of all forty-four attached directly is past what
 * TypeScript instantiates, and grizzle's evidence proves no `"one"` child of a row's own key, so
 * the row comes as an array of one.
 *
 * Generated from the Ledger level's sidecars by `tools/gen/saved-rows.ts`: after changing one, run
 * `pnpm generate` in `packages/ledger`; `pnpm generate:check` refuses this file where it differs.
 *
 * @module
 */
import type { Facts, InstantDomain, NaturalDomain, Term } from "@bjornpagen/grizzle";
import { query, v } from "@bjornpagen/grizzle";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";
import { latestSavesOf } from "#ledger/sitting-queries.ts";

/**
 * A text field as a parent row carries it to the reads attached to it.
 */
type TextTerm = Term<string, unknown, unknown, "text", unknown, Facts, unknown>;

/**
 * A sitting's stage as a parent row carries it.
 */
type BigintTerm = Term<bigint, unknown, unknown, "bigint", unknown, Facts, unknown>;

/**
 * An item session's place as a parent row carries it.
 */
type NaturalTerm = Term<NaturalDomain, unknown, unknown, "bigint", unknown, Facts, unknown>;

/**
 * An instant as a parent row carries it.
 */
type InstantTerm = Term<InstantDomain, unknown, unknown, "bigint", unknown, Facts, unknown>;

/**
 * A sitting's key as a parent row carries it: its child and its stage.
 */
export type SittingKey = Readonly<{ child: TextTerm; stage: BigintTerm }>;

/**
 * A save's key as a parent row carries it: its item session's and its instant.
 */
type SaveKey = Readonly<{
  at: InstantTerm;
  child: TextTerm;
  n: NaturalTerm;
  package: TextTerm;
  path: TextTerm;
}>;

/**
 * A save's key alone, out of a row that carries it.
 *
 * @param key The row.
 * @returns Its child, item, place and instant.
 */
const keyOf = (key: SaveKey) => ({
  at: key.at,
  child: key.child,
  n: key.n,
  package: key.package,
  path: key.path,
});

/**
 * Give the latest saves of a sitting's item sessions, as a read to attach under an application's
 * read of the sitting, by the sitting's key its parent row carries: each item session of it that
 * has a save, by its key, with its latest save's instant and every value that save holds.
 *
 * @param delivery The Delivery level.
 * @returns The sitting's saves, an `"array"` attachment, each row's `single`, `multiple`,
 *   `ordered` and `record` its value rows.
 */
export const savedRowsOf = (delivery: DeliveryLevel) => {
  const {
    ItemSession,
    ResponseSnapshot,
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
    SnapshotSingleBoolean,
    SnapshotSingleDirectedPair,
    SnapshotSingleDuration,
    SnapshotSingleFile,
    SnapshotSingleFloat,
    SnapshotSingleIdentifier,
    SnapshotSingleInteger,
    SnapshotSinglePair,
    SnapshotSinglePoint,
    SnapshotSingleString,
    SnapshotSingleUri,
  } = delivery.relations;
  const saves = latestSavesOf(delivery);
  const singlesOf = (save: SaveKey) =>
    query(delivery)
      .rule((r) => r.match(ResponseSnapshot, keyOf(save)).find(keyOf(save)))
      .attach(
        "identifier",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(SnapshotSingleIdentifier, "value");

            return r
              .match(SnapshotSingleIdentifier, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(SnapshotSingleBoolean, "value");

            return r
              .match(SnapshotSingleBoolean, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(SnapshotSingleInteger, "value");

            return r
              .match(SnapshotSingleInteger, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(SnapshotSingleFloat, "value");

            return r
              .match(SnapshotSingleFloat, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(SnapshotSingleString, "value");

            return r
              .match(SnapshotSingleString, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (values) =>
          query(delivery).rule((r) => {
            const { variable, x, y } = v(SnapshotSinglePoint, "value");

            return r
              .match(SnapshotSinglePoint, { ...keyOf(values), variable, x, y })
              .find({ variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (values) =>
          query(delivery).rule((r) => {
            const { greatest, least, variable } = v(SnapshotSinglePair, "value");

            return r
              .match(SnapshotSinglePair, { ...keyOf(values), greatest, least, variable })
              .find({ greatest, least, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (values) =>
          query(delivery).rule((r) => {
            const { source, target, variable } = v(SnapshotSingleDirectedPair, "value");

            return r
              .match(SnapshotSingleDirectedPair, { ...keyOf(values), source, target, variable })
              .find({ source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(SnapshotSingleDuration, "value");

            return r
              .match(SnapshotSingleDuration, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (values) =>
          query(delivery).rule((r) => {
            const { value, variable } = v(SnapshotSingleUri, "value");

            return r
              .match(SnapshotSingleUri, { ...keyOf(values), value, variable })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (values) =>
          query(delivery).rule((r) => {
            const { digest, name, type, variable } = v(SnapshotSingleFile, "value");

            return r
              .match(SnapshotSingleFile, { ...keyOf(values), digest, name, type, variable })
              .find({ digest, name, type, variable });
          }),
        "array",
      );
  const multiplesOf = (save: SaveKey) =>
    query(delivery)
      .rule((r) => r.match(ResponseSnapshot, keyOf(save)).find(keyOf(save)))
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
  const orderedsOf = (save: SaveKey) =>
    query(delivery)
      .rule((r) => r.match(ResponseSnapshot, keyOf(save)).find(keyOf(save)))
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
  const recordsOf = (save: SaveKey) =>
    query(delivery)
      .rule((r) => r.match(ResponseSnapshot, keyOf(save)).find(keyOf(save)))
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

  const sittingAt = query(delivery).rule((r) => {
    const child = r.param("child", ItemSession.fields.child);
    const stage = r.param("stage", ItemSession.fields.stage);

    return r.match(ItemSession, { child, stage }).find({ child, stage });
  });

  return (sitting: SittingKey) =>
    query(delivery)
      .rule((r) => {
        const savesAt = saves.bind({
          sittings: sittingAt.bind({ child: sitting.child, stage: sitting.stage }),
        });
        const { at, child, n, package: pkg, path } = v(savesAt, "saved");

        return r
          .match(savesAt, { at, child, n, package: pkg, path })
          .find({ at, child, n, package: pkg, path });
      })
      .attach("single", singlesOf, "array")
      .attach("multiple", multiplesOf, "array")
      .attach("ordered", orderedsOf, "array")
      .attach("record", recordsOf, "array");
};
