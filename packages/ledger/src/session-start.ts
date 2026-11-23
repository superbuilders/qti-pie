/**
 * The record an item session begins with, read from the database (`sessionStartOf`): its variables
 * before its first attempt, before any
 * response processing runs, which its page shows before that attempt and a review shows where it
 * hides feedback, and what its template processing set.
 * Computed once, where its inputs become known, at the take, by the SQL grader, and read here by
 * key; nothing in TypeScript computes a value of it (Bjorn, 2026-11-18: "ZERO GRADING IN TS
 * ALLOWED").
 *
 * - **The start** (`single`, `multiple`, `ordered`, `record`): what the take stored of it once
 *   (`#ledger/grade.ts` `takeValuesOf`'s start, COMPILE-AT-PUBLISH S), the Start family by the
 *   session's key, its stage: the machine's flat entry run over the session's item with no program,
 *   so its state is the one `response_state` gives unrun, "No program, no run: the values stand as
 *   they start", `start_of`'s variables. Each declared outcome at its default in force (the
 *   session's template-set default, else the declared one), a numeric single with none at 0 (QTI
 *   3.0.1 Table 4.5), `completionStatus` at `unknown` (information model §2.2.2.3: its value "at
 *   the start of the first attempt"), each template variable at the value the session's template
 *   processing set, else its declared default, and each response NULL, no row: no attempt has
 *   begun, and a session never attempted keeps its responses NULL, "the default value is never
 *   used" (QTI 3.0.1 Table 5.115). The record at the start of the first attempt, its responses at
 *   their defaults in force, is another read (`numAttempts` 1), not this one. Every value of a
 *   variable that is no context, by its shape then its base type, as an attempt's value rows are
 *   read (`#ledger/served-values.ts` `ValueRows`): a single's row, a multiple's distinct values
 *   each with its `count` (a float's or a duration's by its `bits`, grizzle's `floatBits`, as the
 *   ledger keys one), an ordered's at its `place` and a record's fields by `field`.
 * - **What template processing set** (`set`): the session's stored values (`ItemSessionValue` and its
 *   sidecars), each by the rule that set it (`kind`: `template`, `correct` or `default`), its
 *   header (`variables`) beside its value rows, so a value set to NULL has its header and no row:
 *   the record's `templates`, `correct` and `defaults` (plate's `ItemRecord`), read as stored.
 *
 * Every read is keyed by the session its parent row carries (`StartedKey`: child, package, path,
 * place), bound to that row's terms, and adds no parameter to the reading statement: the record is
 * that session's own, a fact keyed by its owner, never "the child's latest session of the item".
 * `sessionStartOf` attaches it under a read of one item session (edullm's `servedItem`, its
 * decideStage's read-back of the sessions it took, and `sittingItem`).
 *
 * Grizzle's types admit no helper generic over a relation's heading, so each sidecar's read is
 * written out, generated from one table by `tools/gen/session-start.ts`. Regenerate it with
 * `pnpm --filter @qti-pie/ledger generate`; `generate:check` holds it to its generator, so a
 * change is made there, never here.
 *
 * @module
 */
import type { Facts, NaturalDomain, Term } from "@bjornpagen/grizzle";
import { query, v } from "@bjornpagen/grizzle";
import type { deliveryOf } from "#ledger/delivery.ts";

/**
 * The Delivery level, whose relations the start reads.
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
 * A stage's key as a parent row carries it.
 */
type BigintTerm = Term<bigint, unknown, unknown, "bigint", unknown, Facts, unknown>;

/**
 * An item session's key as a parent row carries it: its child, its item, its place and its stage.
 */
export type StartedKey = Readonly<{
  child: TextTerm;
  n: NaturalTerm;
  package: TextTerm;
  path: TextTerm;
  stage: BigintTerm;
}>;

/**
 * An item session's key alone, out of a row that carries it.
 *
 * @param key The row.
 * @returns Its child, item, place and stage.
 */
const keyOf = (key: StartedKey) => ({
  child: key.child,
  n: key.n,
  package: key.package,
  path: key.path,
  stage: key.stage,
});

/**
 * Give the reads of the record one item session begins with, over the Delivery level, each to
 * attach under a parent row that carries the session's key ({@link StartedKey}): the session's own
 * record, whatever else its child holds, and no parameter of the reading statement's.
 *
 * @param delivery The Delivery level.
 * @returns The session's `single`, `multiple`, `ordered` and `record` value rows and `set`, what
 *   its template processing set, each a read of the parent row's session.
 */
const startReadsOf = (delivery: DeliveryLevel) => {
  const fields = delivery.relations;

  /**
   * The start's values of one shape, its singles: one array per base type, by the base type's name.
   */
  const startSingles = (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))
      .attach(
        "identifier",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value } = v(fields.StartSingleIdentifier, "startValue");

            return r
              .match(fields.StartSingleIdentifier, {
                child: key.child,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value } = v(fields.StartSingleBoolean, "startValue");

            return r
              .match(fields.StartSingleBoolean, {
                child: key.child,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value } = v(fields.StartSingleInteger, "startValue");

            return r
              .match(fields.StartSingleInteger, {
                child: key.child,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value } = v(fields.StartSingleFloat, "startValue");

            return r
              .match(fields.StartSingleFloat, {
                child: key.child,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value } = v(fields.StartSingleString, "startValue");

            return r
              .match(fields.StartSingleString, {
                child: key.child,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, x, y } = v(fields.StartSinglePoint, "startValue");

            return r
              .match(fields.StartSinglePoint, {
                child: key.child,
                package: key.package,
                path: key.path,
                stage: key.stage,
                variable,
                x,
                y,
              })
              .find({ variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, least, greatest } = v(fields.StartSinglePair, "startValue");

            return r
              .match(fields.StartSinglePair, {
                child: key.child,
                greatest,
                least,
                package: key.package,
                path: key.path,
                stage: key.stage,
                variable,
              })
              .find({ greatest, least, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, source, target } = v(fields.StartSingleDirectedPair, "startValue");

            return r
              .match(fields.StartSingleDirectedPair, {
                child: key.child,
                package: key.package,
                path: key.path,
                source,
                stage: key.stage,
                target,
                variable,
              })
              .find({ source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value } = v(fields.StartSingleDuration, "startValue");

            return r
              .match(fields.StartSingleDuration, {
                child: key.child,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value } = v(fields.StartSingleUri, "startValue");

            return r
              .match(fields.StartSingleUri, {
                child: key.child,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, digest, name, type } = v(fields.StartSingleFile, "startValue");

            return r
              .match(fields.StartSingleFile, {
                child: key.child,
                digest,
                name,
                package: key.package,
                path: key.path,
                stage: key.stage,
                type,
                variable,
              })
              .find({ digest, name, type, variable });
          }),
        "array",
      );

  /**
   * The start's values of one shape, its multiples' distinct values, each with its count: one array
   * per base type, by the base type's name.
   */
  const startMultiples = (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))
      .attach(
        "identifier",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, count } = v(fields.StartMultipleIdentifier, "startValue");

            return r
              .match(fields.StartMultipleIdentifier, {
                child: key.child,
                count,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ count, value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, count } = v(fields.StartMultipleBoolean, "startValue");

            return r
              .match(fields.StartMultipleBoolean, {
                child: key.child,
                count,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ count, value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, count } = v(fields.StartMultipleInteger, "startValue");

            return r
              .match(fields.StartMultipleInteger, {
                child: key.child,
                count,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ count, value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, bits, count } = v(fields.StartMultipleFloat, "startValue");

            return r
              .match(fields.StartMultipleFloat, {
                bits,
                child: key.child,
                count,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ bits, count, value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, count } = v(fields.StartMultipleString, "startValue");

            return r
              .match(fields.StartMultipleString, {
                child: key.child,
                count,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ count, value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, x, y, count } = v(fields.StartMultiplePoint, "startValue");

            return r
              .match(fields.StartMultiplePoint, {
                child: key.child,
                count,
                package: key.package,
                path: key.path,
                stage: key.stage,
                variable,
                x,
                y,
              })
              .find({ count, variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, least, greatest, count } = v(fields.StartMultiplePair, "startValue");

            return r
              .match(fields.StartMultiplePair, {
                child: key.child,
                count,
                greatest,
                least,
                package: key.package,
                path: key.path,
                stage: key.stage,
                variable,
              })
              .find({ count, greatest, least, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, source, target, count } = v(
              fields.StartMultipleDirectedPair,
              "startValue",
            );

            return r
              .match(fields.StartMultipleDirectedPair, {
                child: key.child,
                count,
                package: key.package,
                path: key.path,
                source,
                stage: key.stage,
                target,
                variable,
              })
              .find({ count, source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, bits, count } = v(fields.StartMultipleDuration, "startValue");

            return r
              .match(fields.StartMultipleDuration, {
                bits,
                child: key.child,
                count,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ bits, count, value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, count } = v(fields.StartMultipleUri, "startValue");

            return r
              .match(fields.StartMultipleUri, {
                child: key.child,
                count,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ count, value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, digest, name, type, count } = v(
              fields.StartMultipleFile,
              "startValue",
            );

            return r
              .match(fields.StartMultipleFile, {
                child: key.child,
                count,
                digest,
                name,
                package: key.package,
                path: key.path,
                stage: key.stage,
                type,
                variable,
              })
              .find({ count, digest, name, type, variable });
          }),
        "array",
      );

  /**
   * The start's values of one shape, its ordereds' values, each at its place: one array per base
   * type, by the base type's name.
   */
  const startOrdereds = (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))
      .attach(
        "identifier",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, place } = v(fields.StartOrderedIdentifier, "startValue");

            return r
              .match(fields.StartOrderedIdentifier, {
                child: key.child,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, place } = v(fields.StartOrderedBoolean, "startValue");

            return r
              .match(fields.StartOrderedBoolean, {
                child: key.child,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, place } = v(fields.StartOrderedInteger, "startValue");

            return r
              .match(fields.StartOrderedInteger, {
                child: key.child,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, place } = v(fields.StartOrderedFloat, "startValue");

            return r
              .match(fields.StartOrderedFloat, {
                child: key.child,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, place } = v(fields.StartOrderedString, "startValue");

            return r
              .match(fields.StartOrderedString, {
                child: key.child,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, x, y, place } = v(fields.StartOrderedPoint, "startValue");

            return r
              .match(fields.StartOrderedPoint, {
                child: key.child,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                variable,
                x,
                y,
              })
              .find({ place, variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, least, greatest, place } = v(fields.StartOrderedPair, "startValue");

            return r
              .match(fields.StartOrderedPair, {
                child: key.child,
                greatest,
                least,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                variable,
              })
              .find({ greatest, least, place, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, source, target, place } = v(
              fields.StartOrderedDirectedPair,
              "startValue",
            );

            return r
              .match(fields.StartOrderedDirectedPair, {
                child: key.child,
                package: key.package,
                path: key.path,
                place,
                source,
                stage: key.stage,
                target,
                variable,
              })
              .find({ place, source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, place } = v(fields.StartOrderedDuration, "startValue");

            return r
              .match(fields.StartOrderedDuration, {
                child: key.child,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, place } = v(fields.StartOrderedUri, "startValue");

            return r
              .match(fields.StartOrderedUri, {
                child: key.child,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ place, value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, digest, name, type, place } = v(
              fields.StartOrderedFile,
              "startValue",
            );

            return r
              .match(fields.StartOrderedFile, {
                child: key.child,
                digest,
                name,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                type,
                variable,
              })
              .find({ digest, name, place, type, variable });
          }),
        "array",
      );

  /**
   * The start's values of one shape, its records' fields, each by its field: one array per base
   * type, by the base type's name.
   */
  const startRecords = (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))
      .attach(
        "identifier",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, field } = v(fields.StartRecordIdentifier, "startValue");

            return r
              .match(fields.StartRecordIdentifier, {
                child: key.child,
                field,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, field } = v(fields.StartRecordBoolean, "startValue");

            return r
              .match(fields.StartRecordBoolean, {
                child: key.child,
                field,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, field } = v(fields.StartRecordInteger, "startValue");

            return r
              .match(fields.StartRecordInteger, {
                child: key.child,
                field,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, field } = v(fields.StartRecordFloat, "startValue");

            return r
              .match(fields.StartRecordFloat, {
                child: key.child,
                field,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, field } = v(fields.StartRecordString, "startValue");

            return r
              .match(fields.StartRecordString, {
                child: key.child,
                field,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, x, y, field } = v(fields.StartRecordPoint, "startValue");

            return r
              .match(fields.StartRecordPoint, {
                child: key.child,
                field,
                package: key.package,
                path: key.path,
                stage: key.stage,
                variable,
                x,
                y,
              })
              .find({ field, variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, least, greatest, field } = v(fields.StartRecordPair, "startValue");

            return r
              .match(fields.StartRecordPair, {
                child: key.child,
                field,
                greatest,
                least,
                package: key.package,
                path: key.path,
                stage: key.stage,
                variable,
              })
              .find({ field, greatest, least, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, source, target, field } = v(
              fields.StartRecordDirectedPair,
              "startValue",
            );

            return r
              .match(fields.StartRecordDirectedPair, {
                child: key.child,
                field,
                package: key.package,
                path: key.path,
                source,
                stage: key.stage,
                target,
                variable,
              })
              .find({ field, source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, field } = v(fields.StartRecordDuration, "startValue");

            return r
              .match(fields.StartRecordDuration, {
                child: key.child,
                field,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, value, field } = v(fields.StartRecordUri, "startValue");

            return r
              .match(fields.StartRecordUri, {
                child: key.child,
                field,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ field, value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { variable, digest, name, type, field } = v(fields.StartRecordFile, "startValue");

            return r
              .match(fields.StartRecordFile, {
                child: key.child,
                digest,
                field,
                name,
                package: key.package,
                path: key.path,
                stage: key.stage,
                type,
                variable,
              })
              .find({ digest, field, name, type, variable });
          }),
        "array",
      );

  /**
   * What the session's template processing set, of one shape, its singles, each by the rule that
   * set it: one array per base type, by the base type's name.
   */
  const setSingles = (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))
      .attach(
        "identifier",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value } = v(
              fields.ItemSessionValueSingleIdentifier,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueSingleIdentifier, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value } = v(fields.ItemSessionValueSingleBoolean, "setValue");

            return r
              .match(fields.ItemSessionValueSingleBoolean, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value } = v(fields.ItemSessionValueSingleInteger, "setValue");

            return r
              .match(fields.ItemSessionValueSingleInteger, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value } = v(fields.ItemSessionValueSingleFloat, "setValue");

            return r
              .match(fields.ItemSessionValueSingleFloat, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value } = v(fields.ItemSessionValueSingleString, "setValue");

            return r
              .match(fields.ItemSessionValueSingleString, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, x, y } = v(fields.ItemSessionValueSinglePoint, "setValue");

            return r
              .match(fields.ItemSessionValueSinglePoint, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                variable,
                x,
                y,
              })
              .find({ kind, variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, least, greatest } = v(
              fields.ItemSessionValueSinglePair,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueSinglePair, {
                child: key.child,
                greatest,
                kind,
                least,
                package: key.package,
                path: key.path,
                stage: key.stage,
                variable,
              })
              .find({ greatest, kind, least, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, source, target } = v(
              fields.ItemSessionValueSingleDirectedPair,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueSingleDirectedPair, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                source,
                stage: key.stage,
                target,
                variable,
              })
              .find({ kind, source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value } = v(fields.ItemSessionValueSingleDuration, "setValue");

            return r
              .match(fields.ItemSessionValueSingleDuration, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value } = v(fields.ItemSessionValueSingleUri, "setValue");

            return r
              .match(fields.ItemSessionValueSingleUri, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, digest, name, type } = v(
              fields.ItemSessionValueSingleFile,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueSingleFile, {
                child: key.child,
                digest,
                kind,
                name,
                package: key.package,
                path: key.path,
                stage: key.stage,
                type,
                variable,
              })
              .find({ digest, kind, name, type, variable });
          }),
        "array",
      );

  /**
   * What the session's template processing set, of one shape, its multiples' distinct values, each
   * with its count, each by the rule that set it: one array per base type, by the base type's
   * name.
   */
  const setMultiples = (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))
      .attach(
        "identifier",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, count } = v(
              fields.ItemSessionValueMultipleIdentifier,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueMultipleIdentifier, {
                child: key.child,
                count,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ count, kind, value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, count } = v(
              fields.ItemSessionValueMultipleBoolean,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueMultipleBoolean, {
                child: key.child,
                count,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ count, kind, value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, count } = v(
              fields.ItemSessionValueMultipleInteger,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueMultipleInteger, {
                child: key.child,
                count,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ count, kind, value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, bits, count } = v(
              fields.ItemSessionValueMultipleFloat,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueMultipleFloat, {
                bits,
                child: key.child,
                count,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ bits, count, kind, value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, count } = v(
              fields.ItemSessionValueMultipleString,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueMultipleString, {
                child: key.child,
                count,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ count, kind, value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, x, y, count } = v(
              fields.ItemSessionValueMultiplePoint,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueMultiplePoint, {
                child: key.child,
                count,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                variable,
                x,
                y,
              })
              .find({ count, kind, variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, least, greatest, count } = v(
              fields.ItemSessionValueMultiplePair,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueMultiplePair, {
                child: key.child,
                count,
                greatest,
                kind,
                least,
                package: key.package,
                path: key.path,
                stage: key.stage,
                variable,
              })
              .find({ count, greatest, kind, least, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, source, target, count } = v(
              fields.ItemSessionValueMultipleDirectedPair,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueMultipleDirectedPair, {
                child: key.child,
                count,
                kind,
                package: key.package,
                path: key.path,
                source,
                stage: key.stage,
                target,
                variable,
              })
              .find({ count, kind, source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, bits, count } = v(
              fields.ItemSessionValueMultipleDuration,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueMultipleDuration, {
                bits,
                child: key.child,
                count,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ bits, count, kind, value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, count } = v(
              fields.ItemSessionValueMultipleUri,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueMultipleUri, {
                child: key.child,
                count,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
                variable,
              })
              .find({ count, kind, value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, digest, name, type, count } = v(
              fields.ItemSessionValueMultipleFile,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueMultipleFile, {
                child: key.child,
                count,
                digest,
                kind,
                name,
                package: key.package,
                path: key.path,
                stage: key.stage,
                type,
                variable,
              })
              .find({ count, digest, kind, name, type, variable });
          }),
        "array",
      );

  /**
   * What the session's template processing set, of one shape, its ordereds' values, each at its
   * place, each by the rule that set it: one array per base type, by the base type's name.
   */
  const setOrdereds = (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))
      .attach(
        "identifier",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, place } = v(
              fields.ItemSessionValueOrderedIdentifier,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueOrderedIdentifier, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, place, value, variable });
          }),
        "array",
      )
      .attach(
        "boolean",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, place } = v(
              fields.ItemSessionValueOrderedBoolean,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueOrderedBoolean, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, place, value, variable });
          }),
        "array",
      )
      .attach(
        "integer",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, place } = v(
              fields.ItemSessionValueOrderedInteger,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueOrderedInteger, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, place, value, variable });
          }),
        "array",
      )
      .attach(
        "float",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, place } = v(
              fields.ItemSessionValueOrderedFloat,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueOrderedFloat, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, place, value, variable });
          }),
        "array",
      )
      .attach(
        "string",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, place } = v(
              fields.ItemSessionValueOrderedString,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueOrderedString, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, place, value, variable });
          }),
        "array",
      )
      .attach(
        "point",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, x, y, place } = v(
              fields.ItemSessionValueOrderedPoint,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueOrderedPoint, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                variable,
                x,
                y,
              })
              .find({ kind, place, variable, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, least, greatest, place } = v(
              fields.ItemSessionValueOrderedPair,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueOrderedPair, {
                child: key.child,
                greatest,
                kind,
                least,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                variable,
              })
              .find({ greatest, kind, least, place, variable });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, source, target, place } = v(
              fields.ItemSessionValueOrderedDirectedPair,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueOrderedDirectedPair, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                place,
                source,
                stage: key.stage,
                target,
                variable,
              })
              .find({ kind, place, source, target, variable });
          }),
        "array",
      )
      .attach(
        "duration",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, place } = v(
              fields.ItemSessionValueOrderedDuration,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueOrderedDuration, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, place, value, variable });
          }),
        "array",
      )
      .attach(
        "uri",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, value, place } = v(
              fields.ItemSessionValueOrderedUri,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueOrderedUri, {
                child: key.child,
                kind,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
                variable,
              })
              .find({ kind, place, value, variable });
          }),
        "array",
      )
      .attach(
        "file",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const { kind, variable, digest, name, type, place } = v(
              fields.ItemSessionValueOrderedFile,
              "setValue",
            );

            return r
              .match(fields.ItemSessionValueOrderedFile, {
                child: key.child,
                digest,
                kind,
                name,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                type,
                variable,
              })
              .find({ digest, kind, name, place, type, variable });
          }),
        "array",
      );

  /**
   * Each variable the session's template processing set, by the rule that set it: the headers of
   * its values, a NULL one's among them, which has no value row.
   */
  const setVariables = (key: StartedKey) =>
    query(delivery).rule((r) => {
      const { kind, variable } = v(fields.ItemSessionValue, "setHeader");

      return r
        .match(fields.ItemSessionValue, {
          child: key.child,
          kind,
          package: key.package,
          path: key.path,
          stage: key.stage,
          variable,
        })
        .find({ kind, variable });
    });

  /**
   * What the session's template processing set: its headers and its value rows, by shape.
   */
  const setOf = (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))
      .attach("variables", setVariables, "array")
      .attach("single", setSingles, "array")
      .attach("multiple", setMultiples, "array")
      .attach("ordered", setOrdereds, "array");

  return {
    multiple: startMultiples,
    ordered: startOrdereds,
    record: startRecords,
    set: setOf,
    single: startSingles,
  } as const;
};

/**
 * Give the record an item session begins with, as a read to attach under an application's read of
 * one item session, by the session's key its parent row carries (edullm's `servedItem`,
 * decideStage's read-back and `sittingItem`): the session's own, never another of its child's,
 * and no parameter of the reading statement's.
 *
 * @param delivery The Delivery level.
 * @returns The session's start, an `"array"` attachment of one row: its `single`, `multiple`,
 *   `ordered` and `record` value rows, and `set`, what its template processing set.
 */
export const sessionStartOf = (delivery: DeliveryLevel) => {
  const fields = delivery.relations;
  const reads = startReadsOf(delivery);

  return (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))
      .attach("single", reads.single, "array")
      .attach("multiple", reads.multiple, "array")
      .attach("ordered", reads.ordered, "array")
      .attach("record", reads.record, "array")
      .attach("set", reads.set, "array");
};
