/**
 * The finish's copies of saves (`#ledger/finish.ts`): each snapshot sidecar's rows of a closing
 * member's latest save, written again as the values of the attempt the finish writes for it, at
 * the instant the database stamps that attempt's snapshot with, one insert per sidecar, since
 * grizzle's types admit no helper generic over a relation's heading, each shape's inserts a
 * ChangeSet of their own, joined by `ChangeSet.union`. "The latest save of an item session is its
 * responses now: what ... the end of a simultaneous part submits" (the app's `saveTestItem`); a
 * save holds response values alone, so the attempt's response processing starts from exactly
 * them. A member with no save has none to copy, and its attempt holds no response value.
 *
 * Generated from the Ledger level's sidecars by `tools/gen/finish-copies.ts`: after changing one,
 * run `pnpm generate` in `packages/ledger`; `pnpm generate:check` refuses this file where it
 * differs.
 */
import { ChangeSet, query, v } from "@bjornpagen/grizzle";
import type { DeliveryLevel } from "#ledger/sitting-programs.ts";
import { closingOf, latestSavesOf, sittingHeading } from "#ledger/sitting-queries.ts";

/**
 * Each closing member's latest save: an item session the end of one of the call's `sittings`
 * submits ({@link closingOf}), with its latest save's instant, the one source every copy reads.
 */
const closingSavesOf = (delivery: DeliveryLevel) => {
  const closing = closingOf(delivery);
  const saves = latestSavesOf(delivery);

  return query(delivery).rule((r) => {
    const sittings = r.relation("sittings", sittingHeading);
    const closingAt = closing.bind({ sittings });
    const savesAt = saves.bind({ sittings });
    const { child, package: pkg, path, n } = v(closingAt, "closing");
    const { at } = v(savesAt, "save");

    return r
      .match(closingAt, { child, n, package: pkg, path })
      .match(savesAt, { at, child, n, package: pkg, path })
      .find({ at, child, n, package: pkg, path });
  });
};

/**
 * The copies of each closing member's latest save.
 */
export const savedCopiesOf = (delivery: DeliveryLevel) => {
  const closingSaves = closingSavesOf(delivery);
  const {
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
    SnapshotRecord,
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
  const singles = ChangeSet.empty(delivery)
    .insert(
      SnapshotSingleIdentifier,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value } = v(SnapshotSingleIdentifier, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotSingleIdentifier, { at, child, n, package: pkg, path, value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotSingleBoolean,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value } = v(SnapshotSingleBoolean, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotSingleBoolean, { at, child, n, package: pkg, path, value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotSingleInteger,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value } = v(SnapshotSingleInteger, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotSingleInteger, { at, child, n, package: pkg, path, value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotSingleFloat,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value } = v(SnapshotSingleFloat, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotSingleFloat, { at, child, n, package: pkg, path, value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotSingleString,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value } = v(SnapshotSingleString, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotSingleString, { at, child, n, package: pkg, path, value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotSinglePoint,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, x, y } = v(SnapshotSinglePoint, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotSinglePoint, { at, child, n, package: pkg, path, variable, x, y })
          .find({ child, n, package: pkg, path, variable, x, y });
      }),
    )
    .insert(
      SnapshotSinglePair,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, least, greatest } = v(SnapshotSinglePair, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
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
          .find({ child, greatest, least, n, package: pkg, path, variable });
      }),
    )
    .insert(
      SnapshotSingleDirectedPair,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, source, target } = v(SnapshotSingleDirectedPair, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
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
          .find({ child, n, package: pkg, path, source, target, variable });
      }),
    )
    .insert(
      SnapshotSingleDuration,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value } = v(SnapshotSingleDuration, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotSingleDuration, { at, child, n, package: pkg, path, value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotSingleUri,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value } = v(SnapshotSingleUri, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotSingleUri, { at, child, n, package: pkg, path, value, variable })
          .find({ child, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotSingleFile,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, digest, name, type } = v(SnapshotSingleFile, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
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
          .find({ child, digest, n, name, package: pkg, path, type, variable });
      }),
    );
  const multiples = ChangeSet.empty(delivery)
    .insert(
      SnapshotMultipleIdentifier,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value, count } = v(SnapshotMultipleIdentifier, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotMultipleIdentifier, {
            at,
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotMultipleBoolean,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value, count } = v(SnapshotMultipleBoolean, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotMultipleBoolean, {
            at,
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotMultipleInteger,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value, count } = v(SnapshotMultipleInteger, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotMultipleInteger, {
            at,
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotMultipleFloat,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, bits, value, count } = v(SnapshotMultipleFloat, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotMultipleFloat, {
            at,
            bits,
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ bits, child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotMultipleString,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value, count } = v(SnapshotMultipleString, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotMultipleString, {
            at,
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotMultiplePoint,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, x, y, count } = v(SnapshotMultiplePoint, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotMultiplePoint, { at, child, count, n, package: pkg, path, variable, x, y })
          .find({ child, count, n, package: pkg, path, variable, x, y });
      }),
    )
    .insert(
      SnapshotMultiplePair,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, least, greatest, count } = v(SnapshotMultiplePair, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotMultiplePair, {
            at,
            child,
            count,
            greatest,
            least,
            n,
            package: pkg,
            path,
            variable,
          })
          .find({ child, count, greatest, least, n, package: pkg, path, variable });
      }),
    )
    .insert(
      SnapshotMultipleDirectedPair,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, source, target, count } = v(SnapshotMultipleDirectedPair, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotMultipleDirectedPair, {
            at,
            child,
            count,
            n,
            package: pkg,
            path,
            source,
            target,
            variable,
          })
          .find({ child, count, n, package: pkg, path, source, target, variable });
      }),
    )
    .insert(
      SnapshotMultipleDuration,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, bits, value, count } = v(SnapshotMultipleDuration, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotMultipleDuration, {
            at,
            bits,
            child,
            count,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ bits, child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotMultipleUri,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, value, count } = v(SnapshotMultipleUri, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotMultipleUri, { at, child, count, n, package: pkg, path, value, variable })
          .find({ child, count, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotMultipleFile,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, digest, name, type, count } = v(SnapshotMultipleFile, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotMultipleFile, {
            at,
            child,
            count,
            digest,
            n,
            name,
            package: pkg,
            path,
            type,
            variable,
          })
          .find({ child, count, digest, n, name, package: pkg, path, type, variable });
      }),
    );
  const ordereds = ChangeSet.empty(delivery)
    .insert(
      SnapshotOrderedIdentifier,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, place, value } = v(SnapshotOrderedIdentifier, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotOrderedIdentifier, {
            at,
            child,
            n,
            package: pkg,
            path,
            place,
            value,
            variable,
          })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      SnapshotOrderedBoolean,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, place, value } = v(SnapshotOrderedBoolean, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotOrderedBoolean, {
            at,
            child,
            n,
            package: pkg,
            path,
            place,
            value,
            variable,
          })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      SnapshotOrderedInteger,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, place, value } = v(SnapshotOrderedInteger, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotOrderedInteger, {
            at,
            child,
            n,
            package: pkg,
            path,
            place,
            value,
            variable,
          })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      SnapshotOrderedFloat,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, place, value } = v(SnapshotOrderedFloat, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotOrderedFloat, { at, child, n, package: pkg, path, place, value, variable })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      SnapshotOrderedString,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, place, value } = v(SnapshotOrderedString, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotOrderedString, {
            at,
            child,
            n,
            package: pkg,
            path,
            place,
            value,
            variable,
          })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      SnapshotOrderedPoint,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, place, x, y } = v(SnapshotOrderedPoint, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotOrderedPoint, { at, child, n, package: pkg, path, place, variable, x, y })
          .find({ child, n, package: pkg, path, place, variable, x, y });
      }),
    )
    .insert(
      SnapshotOrderedPair,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, place, least, greatest } = v(SnapshotOrderedPair, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotOrderedPair, {
            at,
            child,
            greatest,
            least,
            n,
            package: pkg,
            path,
            place,
            variable,
          })
          .find({ child, greatest, least, n, package: pkg, path, place, variable });
      }),
    )
    .insert(
      SnapshotOrderedDirectedPair,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, place, source, target } = v(SnapshotOrderedDirectedPair, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotOrderedDirectedPair, {
            at,
            child,
            n,
            package: pkg,
            path,
            place,
            source,
            target,
            variable,
          })
          .find({ child, n, package: pkg, path, place, source, target, variable });
      }),
    )
    .insert(
      SnapshotOrderedDuration,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, place, value } = v(SnapshotOrderedDuration, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotOrderedDuration, {
            at,
            child,
            n,
            package: pkg,
            path,
            place,
            value,
            variable,
          })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      SnapshotOrderedUri,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, place, value } = v(SnapshotOrderedUri, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotOrderedUri, { at, child, n, package: pkg, path, place, value, variable })
          .find({ child, n, package: pkg, path, place, value, variable });
      }),
    )
    .insert(
      SnapshotOrderedFile,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, place, digest, name, type } = v(SnapshotOrderedFile, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotOrderedFile, {
            at,
            child,
            digest,
            n,
            name,
            package: pkg,
            path,
            place,
            type,
            variable,
          })
          .find({ child, digest, n, name, package: pkg, path, place, type, variable });
      }),
    );
  const records = ChangeSet.empty(delivery)
    .insert(
      SnapshotRecord,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, baseType } = v(SnapshotRecord, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecord, { at, baseType, child, field, n, package: pkg, path, variable })
          .find({ baseType, child, field, n, package: pkg, path, variable });
      }),
    )
    .insert(
      SnapshotRecordIdentifier,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, value } = v(SnapshotRecordIdentifier, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecordIdentifier, {
            at,
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ child, field, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotRecordBoolean,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, value } = v(SnapshotRecordBoolean, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecordBoolean, {
            at,
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ child, field, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotRecordInteger,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, value } = v(SnapshotRecordInteger, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecordInteger, {
            at,
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ child, field, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotRecordFloat,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, value } = v(SnapshotRecordFloat, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecordFloat, { at, child, field, n, package: pkg, path, value, variable })
          .find({ child, field, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotRecordString,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, value } = v(SnapshotRecordString, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecordString, { at, child, field, n, package: pkg, path, value, variable })
          .find({ child, field, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotRecordPoint,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, x, y } = v(SnapshotRecordPoint, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecordPoint, { at, child, field, n, package: pkg, path, variable, x, y })
          .find({ child, field, n, package: pkg, path, variable, x, y });
      }),
    )
    .insert(
      SnapshotRecordPair,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, least, greatest } = v(SnapshotRecordPair, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecordPair, {
            at,
            child,
            field,
            greatest,
            least,
            n,
            package: pkg,
            path,
            variable,
          })
          .find({ child, field, greatest, least, n, package: pkg, path, variable });
      }),
    )
    .insert(
      SnapshotRecordDirectedPair,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, source, target } = v(SnapshotRecordDirectedPair, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecordDirectedPair, {
            at,
            child,
            field,
            n,
            package: pkg,
            path,
            source,
            target,
            variable,
          })
          .find({ child, field, n, package: pkg, path, source, target, variable });
      }),
    )
    .insert(
      SnapshotRecordDuration,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, value } = v(SnapshotRecordDuration, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecordDuration, {
            at,
            child,
            field,
            n,
            package: pkg,
            path,
            value,
            variable,
          })
          .find({ child, field, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotRecordUri,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, value } = v(SnapshotRecordUri, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecordUri, { at, child, field, n, package: pkg, path, value, variable })
          .find({ child, field, n, package: pkg, path, value, variable });
      }),
    )
    .insert(
      SnapshotRecordFile,
      query(delivery).rule((r) => {
        const savedAt = closingSaves.bind({ sittings: r.relation("sittings", sittingHeading) });
        const { at, child, package: pkg, path, n } = v(savedAt, "closingSave");
        const { variable, field, digest, name, type } = v(SnapshotRecordFile, "saved");

        return r
          .match(savedAt, { at, child, n, package: pkg, path })
          .match(SnapshotRecordFile, {
            at,
            child,
            digest,
            field,
            n,
            name,
            package: pkg,
            path,
            type,
            variable,
          })
          .find({ child, digest, field, n, name, package: pkg, path, type, variable });
      }),
    );

  return ChangeSet.union(ChangeSet.union(singles, multiples), ChangeSet.union(ordereds, records));
};
