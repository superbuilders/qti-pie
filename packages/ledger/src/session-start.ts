/**
 * The record an item session begins with, read from the database (`sessionStartOf`): its variables
 * before its first attempt, before any
 * response processing runs, which its page shows before that attempt and a review shows where it
 * hides feedback, and what its template processing set.
 * Derived in the statement that reads it and never stored; nothing in TypeScript computes a value
 * of it (Bjorn, 2026-11-18: "ZERO GRADING IN TS ALLOWED").
 *
 * - **The start** (`single`, `multiple`, `ordered`, `record`): the machine's flat entry
 *   (`#ledger/grading.ts` `responseProcessingOf`) run over the session's item with no program, so
 *   its state is the one `response_state` gives unrun: "No program, no run: the values stand as
 *   they start", `start_of`'s variables. Each declared outcome at its default in force (the
 *   session's template-set default, else the declared one), a numeric single with none at 0 (QTI
 *   3.0.1 Table 4.5), `completionStatus` at `unknown` (information model §2.2.2.3: its value "at
 *   the start of the first attempt"), each template variable at the value the session's template
 *   processing set, else its declared default, and each response NULL, no row: no attempt has
 *   begun, and a session never attempted keeps its responses NULL, "the default value is never
 *   used" (QTI 3.0.1 Table 5.115; the machine's `start_of` gives a response its default only at a
 *   given `numAttempts` past 0). The record at the start of the first attempt, its responses at
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
 * The machine is given the session as `gradeArgumentsOf` gives a graded attempt's
 * (`#ledger/grade.ts`): the item's declarations of the kinds the machine reads, with their
 * attributes and each `qti-value`'s string value, and the session's template values held `value`,
 * the correct responses and defaults its template processing set held `correct` and `default`; no
 * response, `numAttempts` or completion status, since no attempt has begun. Its run's seed is the
 * session's (`SessionSeed`) and its label the first attempt's (`responseLabel` of 1), which a state
 * no program ran never reads. The take stores nothing of a record (`#ledger/grade.ts`
 * `takeValuesOf`: a record has no session sidecar), so no record field is given.
 *
 * Every read is keyed by the session its parent row carries (`StartedKey`: child, package, path,
 * place), bound to that row's terms, and adds no parameter to the reading statement: the record is
 * that session's own, a fact keyed by its owner, never "the child's latest session of the item".
 * `sessionStartOf` attaches it under a read of one item session (edullm's `servedItem`, its
 * decideStage's read-back of the sessions it took, and `sittingItem`). Each read's call is one
 * evaluation for its one parent row.
 *
 * Grizzle's types admit no helper generic over a relation's heading, so each sidecar's read is
 * written out, generated from one table by `tools/gen/session-start.ts`. Regenerate it with
 * `pnpm --filter @qti-pie/ledger generate`; `generate:check` holds it to its generator, so a
 * change is made there, never here.
 *
 * @module
 */
import type { Facts, NaturalDomain, Term } from "@bjornpagen/grizzle";
import { Fn, Num, param, query, Type, v } from "@bjornpagen/grizzle";
import type { deliveryOf } from "#ledger/delivery.ts";
import {
  copies,
  DocFieldBoolean,
  DocFieldDirectedPair,
  DocFieldFile,
  DocFieldFileName,
  DocFieldFloat,
  DocFieldInteger,
  DocFieldPair,
  DocFieldPoint,
  DocFieldText,
  DocReplyFloat,
  DocReplyText,
  DocText,
  DocumentAttribute,
  DocumentText,
  DocVar,
  ProgramNode,
  responseLabel,
  responseProcessingOf,
  TableBinding,
  TableEntry,
  TableValue,
} from "#ledger/grading.ts";
import { LearnerId } from "#ledger/keys.ts";

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
   * A session's key as parameters, which each read binds to its parent row's terms.
   */
  const keyed = {
    child: param("child", LearnerId),
    n: param("n", fields.ItemSession.fields.n),
    package: param("package", fields.ItemSession.fields.package),
    path: param("path", fields.ItemSession.fields.path),
  } as const;

  /**
   * The session, by its key, with its stage and the seed its processing draws under.
   */
  const startedOf = query(delivery).rule((r) => {
    const { stage } = v(fields.ItemSession, "startSession");
    const { seed } = v(fields.SessionSeed, "startSeed");

    return r
      .match(fields.ItemSession, {
        child: keyed.child,
        n: keyed.n,
        package: keyed.package,
        path: keyed.path,
        stage,
      })
      .match(fields.SessionSeed, {
        child: keyed.child,
        package: keyed.package,
        path: keyed.path,
        seed,
        stage,
      })
      .find({ child: keyed.child, package: keyed.package, path: keyed.path, seed, stage });
  });

  /**
   * The run: the session's run key (child, package, path, stage), its seed and the first attempt's
   * label.
   */
  const runsOf = query(delivery).rule((r) => {
    const session = startedOf.bind(keyed);
    const { child, package: pkg, path, seed, stage } = v(session, "startRun");

    return r.match(session, { child, package: pkg, path, seed, stage }).find({
      child,
      label: Fn.call(responseLabel, { attempts: 1n }),
      package: pkg,
      path,
      seed,
      stage,
    });
  });

  /**
   * The item's declarations' nodes of the kinds the machine reads.
   */
  const declarationsOf = query(delivery).rule((r) => {
    const session = startedOf.bind(keyed);
    const { package: pkg, path: item } = v(session, "startDeclared");
    const { start, end, parent, kind } = v(fields.Node, "startNode");
    const { token } = v(fields.DeclarationNodeKind, "startNodeKind");

    return r
      .match(session, { package: pkg, path: item })
      .match(fields.Node, { end, kind, package: pkg, parent, path: item, start })
      .match(fields.DeclarationNodeKind, { kind, token })
      .find({ end, kind: token, package: pkg, parent, path: item, start });
  });

  /**
   * Their attributes the machine reads.
   */
  const declarationAttributesOf = query(delivery).rule((r) => {
    const session = startedOf.bind(keyed);
    const { package: pkg, path: item } = v(session, "startAttributed");
    const { start, kind } = v(fields.Node, "startAttributedNode");
    const { name, value } = v(fields.Attribute, "startAttribute");
    const { token } = v(fields.GradedAttributeName, "startAttributeName");

    return r
      .match(session, { package: pkg, path: item })
      .match(fields.Node, { kind, package: pkg, path: item, start })
      .match(fields.DeclarationNodeKind, { kind })
      .match(fields.Attribute, { name, package: pkg, path: item, start, value })
      .match(fields.GradedAttributeName, { name, token })
      .find({ name: token, package: pkg, path: item, start, value });
  });

  /**
   * Each qti-value's string value.
   */
  const declarationTextsOf = query(delivery).rule((r) => {
    const session = startedOf.bind(keyed);
    const { package: pkg, path: item } = v(session, "startTexted");
    const { start, stringValue } = v(fields.Node, "startValueNode");

    return r
      .match(session, { package: pkg, path: item })
      .match(fields.Node, { kind: "qti-value", package: pkg, path: item, start, stringValue })
      .find({ package: pkg, path: item, start, text: stringValue });
  });

  /**
   * Each declared typed variable's base type, built-ins included.
   */
  const basesOf = query(delivery).rule((r) => {
    const session = startedOf.bind(keyed);
    const { child, package: pkg, path, stage } = v(session, "startTyped");
    const { identifier, baseType } = v(fields.ItemSessionVariable, "startTypedVariable");
    const { token: base } = v(fields.BaseTypeToken, "startBase");

    return r
      .match(session, { child, package: pkg, path, stage })
      .match(fields.ItemSessionVariable, { baseType, identifier, package: pkg, path })
      .match(fields.BaseTypeToken, { baseType, token: base })
      .find({ base, child, identifier, package: pkg, path, stage });
  });

  /**
   * The variables the run is given: each value the session's template processing set, held as the
   * rule that set it says, with its kind and cardinality.
   */
  const varsOf = query(delivery)
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startSet");
      const { variable } = v(fields.ItemSessionValue, "startSetValue");
      const { cardinality, declarationKind } = v(fields.ItemSessionVariable, "startSetDeclared");
      const { token: card } = v(fields.CardinalityToken, "startSetCard");
      const { token: kind } = v(fields.VariableKindToken, "startSetKind");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValue, {
          child,
          kind: "template",
          package: pkg,
          path,
          stage,
          variable,
        })
        .match(fields.ItemSessionVariable, {
          cardinality,
          declarationKind,
          identifier: variable,
          package: pkg,
          path,
        })
        .match(fields.CardinalityToken, { cardinality, token: card })
        .match(fields.VariableKindToken, { declarationKind, token: kind })
        .find({
          card,
          child,
          holds: Type.literal(DocVar.fields.holds, "value"),
          identifier: Type.cast(variable, DocVar.fields.identifier),
          kind,
          package: pkg,
          path,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startSet");
      const { variable } = v(fields.ItemSessionValue, "startSetValue");
      const { cardinality, declarationKind } = v(fields.ItemSessionVariable, "startSetDeclared");
      const { token: card } = v(fields.CardinalityToken, "startSetCard");
      const { token: kind } = v(fields.VariableKindToken, "startSetKind");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValue, {
          child,
          kind: "correct",
          package: pkg,
          path,
          stage,
          variable,
        })
        .match(fields.ItemSessionVariable, {
          cardinality,
          declarationKind,
          identifier: variable,
          package: pkg,
          path,
        })
        .match(fields.CardinalityToken, { cardinality, token: card })
        .match(fields.VariableKindToken, { declarationKind, token: kind })
        .find({
          card,
          child,
          holds: Type.literal(DocVar.fields.holds, "correct"),
          identifier: Type.cast(variable, DocVar.fields.identifier),
          kind,
          package: pkg,
          path,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startSet");
      const { variable } = v(fields.ItemSessionValue, "startSetValue");
      const { cardinality, declarationKind } = v(fields.ItemSessionVariable, "startSetDeclared");
      const { token: card } = v(fields.CardinalityToken, "startSetCard");
      const { token: kind } = v(fields.VariableKindToken, "startSetKind");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValue, {
          child,
          kind: "default",
          package: pkg,
          path,
          stage,
          variable,
        })
        .match(fields.ItemSessionVariable, {
          cardinality,
          declarationKind,
          identifier: variable,
          package: pkg,
          path,
        })
        .match(fields.CardinalityToken, { cardinality, token: card })
        .match(fields.VariableKindToken, { declarationKind, token: kind })
        .find({
          card,
          child,
          holds: Type.literal(DocVar.fields.holds, "default"),
          identifier: Type.cast(variable, DocVar.fields.identifier),
          kind,
          package: pkg,
          path,
          stage,
        });
    });

  /**
   * The session's values that cross as the `doc_texts` rows: its template values and the correct
   * responses and defaults its template processing set.
   */
  const textsOf = query(delivery)
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleIdentifier, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleIdentifier, {
          child,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "identifier"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleIdentifier, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleIdentifier, {
          child,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "identifier"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleIdentifier, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleIdentifier, {
          child,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "identifier"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleIdentifier,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleIdentifier, {
          child,
          count,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "identifier"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleIdentifier,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleIdentifier, {
          child,
          count,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "identifier"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleIdentifier,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleIdentifier, {
          child,
          count,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "identifier"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(
        fields.ItemSessionValueOrderedIdentifier,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedIdentifier, {
          child,
          kind: "template",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "identifier"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(
        fields.ItemSessionValueOrderedIdentifier,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedIdentifier, {
          child,
          kind: "correct",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "identifier"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(
        fields.ItemSessionValueOrderedIdentifier,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedIdentifier, {
          child,
          kind: "default",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "identifier"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleString, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleString, {
          child,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "string"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleString, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleString, {
          child,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "string"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleString, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleString, {
          child,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "string"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(fields.ItemSessionValueMultipleString, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleString, {
          child,
          count,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "string"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(fields.ItemSessionValueMultipleString, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleString, {
          child,
          count,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "string"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(fields.ItemSessionValueMultipleString, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleString, {
          child,
          count,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "string"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedString, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedString, {
          child,
          kind: "template",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "string"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedString, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedString, {
          child,
          kind: "correct",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "string"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedString, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedString, {
          child,
          kind: "default",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "string"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleUri, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleUri, {
          child,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "uri"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleUri, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleUri, {
          child,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "uri"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleUri, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleUri, {
          child,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "uri"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(fields.ItemSessionValueMultipleUri, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleUri, {
          child,
          count,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "uri"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(fields.ItemSessionValueMultipleUri, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleUri, {
          child,
          count,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "uri"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(fields.ItemSessionValueMultipleUri, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleUri, {
          child,
          count,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "uri"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedUri, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedUri, {
          child,
          kind: "template",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "uri"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedUri, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedUri, {
          child,
          kind: "correct",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "uri"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedUri, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedUri, {
          child,
          kind: "default",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "uri"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    });

  /**
   * The session's values that cross as the `doc_integers` rows: its template values and the correct
   * responses and defaults its template processing set.
   */
  const integersOf = query(delivery)
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleInteger, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleInteger, {
          child,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleInteger, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleInteger, {
          child,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleInteger, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleInteger, {
          child,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleInteger,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleInteger, {
          child,
          count,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleInteger,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleInteger, {
          child,
          count,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleInteger,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleInteger, {
          child,
          count,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedInteger, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedInteger, {
          child,
          kind: "template",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedInteger, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedInteger, {
          child,
          kind: "correct",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedInteger, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedInteger, {
          child,
          kind: "default",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    });

  /**
   * The session's values that cross as the `doc_floats` rows: its template values and the correct
   * responses and defaults its template processing set.
   */
  const floatsOf = query(delivery)
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleFloat, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleFloat, {
          child,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleFloat, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleFloat, {
          child,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleFloat, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleFloat, {
          child,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(fields.ItemSessionValueMultipleFloat, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleFloat, {
          child,
          count,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(fields.ItemSessionValueMultipleFloat, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleFloat, {
          child,
          count,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(fields.ItemSessionValueMultipleFloat, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleFloat, {
          child,
          count,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedFloat, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedFloat, {
          child,
          kind: "template",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedFloat, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedFloat, {
          child,
          kind: "correct",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedFloat, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedFloat, {
          child,
          kind: "default",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "float"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleDuration, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleDuration, {
          child,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "duration"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleDuration, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleDuration, {
          child,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "duration"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleDuration, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleDuration, {
          child,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "duration"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleDuration,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleDuration, {
          child,
          count,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "duration"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleDuration,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleDuration, {
          child,
          count,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "duration"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleDuration,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleDuration, {
          child,
          count,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          base: Type.literal(DocText.fields.base, "duration"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(
        fields.ItemSessionValueOrderedDuration,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedDuration, {
          child,
          kind: "template",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "duration"),
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(
        fields.ItemSessionValueOrderedDuration,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedDuration, {
          child,
          kind: "correct",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "duration"),
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(
        fields.ItemSessionValueOrderedDuration,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedDuration, {
          child,
          kind: "default",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          base: Type.literal(DocText.fields.base, "duration"),
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    });

  /**
   * The session's values that cross as the `doc_booleans` rows: its template values and the correct
   * responses and defaults its template processing set.
   */
  const booleansOf = query(delivery)
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleBoolean, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleBoolean, {
          child,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleBoolean, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleBoolean, {
          child,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value } = v(fields.ItemSessionValueSingleBoolean, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleBoolean, {
          child,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleBoolean,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleBoolean, {
          child,
          count,
          kind: "template",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleBoolean,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleBoolean, {
          child,
          count,
          kind: "correct",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, count } = v(
        fields.ItemSessionValueMultipleBoolean,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleBoolean, {
          child,
          count,
          kind: "default",
          package: pkg,
          path,
          stage,
          value,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedBoolean, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedBoolean, {
          child,
          kind: "template",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedBoolean, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedBoolean, {
          child,
          kind: "correct",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, value, place } = v(fields.ItemSessionValueOrderedBoolean, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedBoolean, {
          child,
          kind: "default",
          package: pkg,
          path,
          place,
          stage,
          value,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          value,
        });
    });

  /**
   * The session's values that cross as the `doc_pairs` rows: its template values and the correct
   * responses and defaults its template processing set.
   */
  const pairsOf = query(delivery)
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, least, greatest } = v(fields.ItemSessionValueSinglePair, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSinglePair, {
          child,
          greatest,
          kind: "template",
          least,
          package: pkg,
          path,
          stage,
          variable,
        })
        .find({
          child,
          greatest,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          least,
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, least, greatest } = v(fields.ItemSessionValueSinglePair, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSinglePair, {
          child,
          greatest,
          kind: "correct",
          least,
          package: pkg,
          path,
          stage,
          variable,
        })
        .find({
          child,
          greatest,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          least,
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, least, greatest } = v(fields.ItemSessionValueSinglePair, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSinglePair, {
          child,
          greatest,
          kind: "default",
          least,
          package: pkg,
          path,
          stage,
          variable,
        })
        .find({
          child,
          greatest,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          least,
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, least, greatest, count } = v(
        fields.ItemSessionValueMultiplePair,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultiplePair, {
          child,
          count,
          greatest,
          kind: "template",
          least,
          package: pkg,
          path,
          stage,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          greatest,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          least,
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, least, greatest, count } = v(
        fields.ItemSessionValueMultiplePair,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultiplePair, {
          child,
          count,
          greatest,
          kind: "correct",
          least,
          package: pkg,
          path,
          stage,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          greatest,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          least,
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, least, greatest, count } = v(
        fields.ItemSessionValueMultiplePair,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultiplePair, {
          child,
          count,
          greatest,
          kind: "default",
          least,
          package: pkg,
          path,
          stage,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          greatest,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          least,
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, least, greatest, place } = v(
        fields.ItemSessionValueOrderedPair,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedPair, {
          child,
          greatest,
          kind: "template",
          least,
          package: pkg,
          path,
          place,
          stage,
          variable,
        })
        .find({
          child,
          greatest,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          least,
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, least, greatest, place } = v(
        fields.ItemSessionValueOrderedPair,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedPair, {
          child,
          greatest,
          kind: "correct",
          least,
          package: pkg,
          path,
          place,
          stage,
          variable,
        })
        .find({
          child,
          greatest,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          least,
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, least, greatest, place } = v(
        fields.ItemSessionValueOrderedPair,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedPair, {
          child,
          greatest,
          kind: "default",
          least,
          package: pkg,
          path,
          place,
          stage,
          variable,
        })
        .find({
          child,
          greatest,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          least,
          package: pkg,
          path,
          place,
          stage,
        });
    });

  /**
   * The session's values that cross as the `doc_directed_pairs` rows: its template values and the
   * correct responses and defaults its template processing set.
   */
  const directedPairsOf = query(delivery)
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, source, target } = v(
        fields.ItemSessionValueSingleDirectedPair,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleDirectedPair, {
          child,
          kind: "template",
          package: pkg,
          path,
          source,
          stage,
          target,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          source,
          stage,
          target,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, source, target } = v(
        fields.ItemSessionValueSingleDirectedPair,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleDirectedPair, {
          child,
          kind: "correct",
          package: pkg,
          path,
          source,
          stage,
          target,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          source,
          stage,
          target,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, source, target } = v(
        fields.ItemSessionValueSingleDirectedPair,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleDirectedPair, {
          child,
          kind: "default",
          package: pkg,
          path,
          source,
          stage,
          target,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          source,
          stage,
          target,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, source, target, count } = v(
        fields.ItemSessionValueMultipleDirectedPair,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleDirectedPair, {
          child,
          count,
          kind: "template",
          package: pkg,
          path,
          source,
          stage,
          target,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          source,
          stage,
          target,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, source, target, count } = v(
        fields.ItemSessionValueMultipleDirectedPair,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleDirectedPair, {
          child,
          count,
          kind: "correct",
          package: pkg,
          path,
          source,
          stage,
          target,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          source,
          stage,
          target,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, source, target, count } = v(
        fields.ItemSessionValueMultipleDirectedPair,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleDirectedPair, {
          child,
          count,
          kind: "default",
          package: pkg,
          path,
          source,
          stage,
          target,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          source,
          stage,
          target,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, source, target, place } = v(
        fields.ItemSessionValueOrderedDirectedPair,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedDirectedPair, {
          child,
          kind: "template",
          package: pkg,
          path,
          place,
          source,
          stage,
          target,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          source,
          stage,
          target,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, source, target, place } = v(
        fields.ItemSessionValueOrderedDirectedPair,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedDirectedPair, {
          child,
          kind: "correct",
          package: pkg,
          path,
          place,
          source,
          stage,
          target,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          source,
          stage,
          target,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, source, target, place } = v(
        fields.ItemSessionValueOrderedDirectedPair,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedDirectedPair, {
          child,
          kind: "default",
          package: pkg,
          path,
          place,
          source,
          stage,
          target,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          source,
          stage,
          target,
        });
    });

  /**
   * The session's values that cross as the `doc_points` rows: its template values and the correct
   * responses and defaults its template processing set.
   */
  const pointsOf = query(delivery)
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, x, y } = v(fields.ItemSessionValueSinglePoint, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSinglePoint, {
          child,
          kind: "template",
          package: pkg,
          path,
          stage,
          variable,
          x,
          y,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          x,
          y,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, x, y } = v(fields.ItemSessionValueSinglePoint, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSinglePoint, {
          child,
          kind: "correct",
          package: pkg,
          path,
          stage,
          variable,
          x,
          y,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          x,
          y,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, x, y } = v(fields.ItemSessionValueSinglePoint, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSinglePoint, {
          child,
          kind: "default",
          package: pkg,
          path,
          stage,
          variable,
          x,
          y,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
          x,
          y,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, x, y, count } = v(fields.ItemSessionValueMultiplePoint, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultiplePoint, {
          child,
          count,
          kind: "template",
          package: pkg,
          path,
          stage,
          variable,
          x,
          y,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          x,
          y,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, x, y, count } = v(fields.ItemSessionValueMultiplePoint, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultiplePoint, {
          child,
          count,
          kind: "correct",
          package: pkg,
          path,
          stage,
          variable,
          x,
          y,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          x,
          y,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, x, y, count } = v(fields.ItemSessionValueMultiplePoint, "startHeldValue");
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultiplePoint, {
          child,
          count,
          kind: "default",
          package: pkg,
          path,
          stage,
          variable,
          x,
          y,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          x,
          y,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, x, y, place } = v(fields.ItemSessionValueOrderedPoint, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedPoint, {
          child,
          kind: "template",
          package: pkg,
          path,
          place,
          stage,
          variable,
          x,
          y,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          x,
          y,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, x, y, place } = v(fields.ItemSessionValueOrderedPoint, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedPoint, {
          child,
          kind: "correct",
          package: pkg,
          path,
          place,
          stage,
          variable,
          x,
          y,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          x,
          y,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, x, y, place } = v(fields.ItemSessionValueOrderedPoint, "startHeldValue");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedPoint, {
          child,
          kind: "default",
          package: pkg,
          path,
          place,
          stage,
          variable,
          x,
          y,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
          x,
          y,
        });
    });

  /**
   * The session's values that cross as the `doc_files` rows: its template values and the correct
   * responses and defaults its template processing set.
   */
  const filesOf = query(delivery)
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type } = v(
        fields.ItemSessionValueSingleFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleFile, {
          child,
          digest,
          kind: "template",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .find({
          child,
          content_type: type,
          digest,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type } = v(
        fields.ItemSessionValueSingleFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleFile, {
          child,
          digest,
          kind: "correct",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .find({
          child,
          content_type: type,
          digest,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type } = v(
        fields.ItemSessionValueSingleFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleFile, {
          child,
          digest,
          kind: "default",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .find({
          child,
          content_type: type,
          digest,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, count } = v(
        fields.ItemSessionValueMultipleFile,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleFile, {
          child,
          count,
          digest,
          kind: "template",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          content_type: type,
          digest,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, count } = v(
        fields.ItemSessionValueMultipleFile,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleFile, {
          child,
          count,
          digest,
          kind: "correct",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          content_type: type,
          digest,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, count } = v(
        fields.ItemSessionValueMultipleFile,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleFile, {
          child,
          count,
          digest,
          kind: "default",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          content_type: type,
          digest,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, place } = v(
        fields.ItemSessionValueOrderedFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedFile, {
          child,
          digest,
          kind: "template",
          name,
          package: pkg,
          path,
          place,
          stage,
          type,
          variable,
        })
        .find({
          child,
          content_type: type,
          digest,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, place } = v(
        fields.ItemSessionValueOrderedFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedFile, {
          child,
          digest,
          kind: "correct",
          name,
          package: pkg,
          path,
          place,
          stage,
          type,
          variable,
        })
        .find({
          child,
          content_type: type,
          digest,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, place } = v(
        fields.ItemSessionValueOrderedFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedFile, {
          child,
          digest,
          kind: "default",
          name,
          package: pkg,
          path,
          place,
          stage,
          type,
          variable,
        })
        .find({
          child,
          content_type: type,
          digest,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          package: pkg,
          path,
          place,
          stage,
        });
    });

  /**
   * The session's values that cross as the `doc_file_names` rows, each file's name: its template
   * values and the correct responses and defaults its template processing set.
   */
  const fileNamesOf = query(delivery)
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type } = v(
        fields.ItemSessionValueSingleFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleFile, {
          child,
          digest,
          kind: "template",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          name,
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type } = v(
        fields.ItemSessionValueSingleFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleFile, {
          child,
          digest,
          kind: "correct",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          name,
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type } = v(
        fields.ItemSessionValueSingleFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueSingleFile, {
          child,
          digest,
          kind: "default",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          name,
          package: pkg,
          path,
          place: Type.literal(DocText.fields.place, 0n),
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, count } = v(
        fields.ItemSessionValueMultipleFile,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleFile, {
          child,
          count,
          digest,
          kind: "template",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          name,
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, count } = v(
        fields.ItemSessionValueMultipleFile,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleFile, {
          child,
          count,
          digest,
          kind: "correct",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          name,
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, count } = v(
        fields.ItemSessionValueMultipleFile,
        "startHeldValue",
      );
      const copy = Fn.rows(copies, { count });
      const { place } = v(copy, "startCopy");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueMultipleFile, {
          child,
          count,
          digest,
          kind: "default",
          name,
          package: pkg,
          path,
          stage,
          type,
          variable,
        })
        .match(copy, { place })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          name,
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, place } = v(
        fields.ItemSessionValueOrderedFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedFile, {
          child,
          digest,
          kind: "template",
          name,
          package: pkg,
          path,
          place,
          stage,
          type,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "value"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          name,
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, place } = v(
        fields.ItemSessionValueOrderedFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedFile, {
          child,
          digest,
          kind: "correct",
          name,
          package: pkg,
          path,
          place,
          stage,
          type,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "correct"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          name,
          package: pkg,
          path,
          place,
          stage,
        });
    })
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, digest, name, type, place } = v(
        fields.ItemSessionValueOrderedFile,
        "startHeldValue",
      );

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValueOrderedFile, {
          child,
          digest,
          kind: "default",
          name,
          package: pkg,
          path,
          place,
          stage,
          type,
          variable,
        })
        .find({
          child,
          holds: Type.literal(DocText.fields.holds, "default"),
          identifier: Type.cast(variable, DocText.fields.identifier),
          name,
          package: pkg,
          path,
          place,
          stage,
        });
    });

  /**
   * A source of no rows of a heading of the machine's: the start runs no program (`response_state`:
   * "No program, no run: the values stand as they start"), so it reads no operator's reply and no
   * table, and template processing sets no record field, so these arguments hold none. Its row is
   * never read: `r.or()` matches no row.
   */
  const noPrograms = query(delivery).rule((r) =>
    r.where(r.or()).find({
      end: Type.literal(ProgramNode.fields.end, 0n),
      kind: Type.literal(ProgramNode.fields.kind, "qti-response-processing"),
      package: Type.literal(ProgramNode.fields.package, ""),
      parent: Type.literal(ProgramNode.fields.parent, 0n),
      path: Type.literal(ProgramNode.fields.path, ""),
      start: Type.literal(ProgramNode.fields.start, 0n),
    }),
  );
  const noProgramAttributes = query(delivery).rule((r) =>
    r.where(r.or()).find({
      name: Type.literal(DocumentAttribute.fields.name, "identifier"),
      package: Type.literal(DocumentAttribute.fields.package, ""),
      path: Type.literal(DocumentAttribute.fields.path, ""),
      start: Type.literal(DocumentAttribute.fields.start, 0n),
      value: Type.literal(DocumentAttribute.fields.value, ""),
    }),
  );
  const noProgramTexts = query(delivery).rule((r) =>
    r.where(r.or()).find({
      package: Type.literal(DocumentText.fields.package, ""),
      path: Type.literal(DocumentText.fields.path, ""),
      start: Type.literal(DocumentText.fields.start, 0n),
      text: Type.literal(DocumentText.fields.text, ""),
    }),
  );
  const noFieldTexts = query(delivery).rule((r) =>
    r.where(r.or()).find({
      base: Type.literal(DocFieldText.fields.base, "identifier"),
      child: Type.literal(DocFieldText.fields.child, "x"),
      field: Type.literal(DocFieldText.fields.field, ""),
      holds: Type.literal(DocFieldText.fields.holds, "value"),
      identifier: Type.literal(DocFieldText.fields.identifier, "RESPONSE"),
      package: Type.literal(DocFieldText.fields.package, ""),
      path: Type.literal(DocFieldText.fields.path, ""),
      stage: Type.literal(DocFieldText.fields.stage, 0n),
      value: Type.literal(DocFieldText.fields.value, "x"),
    }),
  );
  const noFieldIntegers = query(delivery).rule((r) =>
    r.where(r.or()).find({
      child: Type.literal(DocFieldInteger.fields.child, "x"),
      field: Type.literal(DocFieldInteger.fields.field, ""),
      holds: Type.literal(DocFieldInteger.fields.holds, "value"),
      identifier: Type.literal(DocFieldInteger.fields.identifier, "RESPONSE"),
      package: Type.literal(DocFieldInteger.fields.package, ""),
      path: Type.literal(DocFieldInteger.fields.path, ""),
      stage: Type.literal(DocFieldInteger.fields.stage, 0n),
      value: Type.literal(DocFieldInteger.fields.value, 0n),
    }),
  );
  const noFieldFloats = query(delivery).rule((r) =>
    r.where(r.or()).find({
      base: Type.literal(DocFieldFloat.fields.base, "float"),
      child: Type.literal(DocFieldFloat.fields.child, "x"),
      field: Type.literal(DocFieldFloat.fields.field, ""),
      holds: Type.literal(DocFieldFloat.fields.holds, "value"),
      identifier: Type.literal(DocFieldFloat.fields.identifier, "RESPONSE"),
      package: Type.literal(DocFieldFloat.fields.package, ""),
      path: Type.literal(DocFieldFloat.fields.path, ""),
      stage: Type.literal(DocFieldFloat.fields.stage, 0n),
      value: Type.literal(DocFieldFloat.fields.value, 0),
    }),
  );
  const noFieldBooleans = query(delivery).rule((r) =>
    r.where(r.or()).find({
      child: Type.literal(DocFieldBoolean.fields.child, "x"),
      field: Type.literal(DocFieldBoolean.fields.field, ""),
      holds: Type.literal(DocFieldBoolean.fields.holds, "value"),
      identifier: Type.literal(DocFieldBoolean.fields.identifier, "RESPONSE"),
      package: Type.literal(DocFieldBoolean.fields.package, ""),
      path: Type.literal(DocFieldBoolean.fields.path, ""),
      stage: Type.literal(DocFieldBoolean.fields.stage, 0n),
      value: Type.literal(DocFieldBoolean.fields.value, false),
    }),
  );
  const noFieldPairs = query(delivery).rule((r) =>
    r.where(r.or()).find({
      child: Type.literal(DocFieldPair.fields.child, "x"),
      field: Type.literal(DocFieldPair.fields.field, ""),
      greatest: Type.literal(DocFieldPair.fields.greatest, ""),
      holds: Type.literal(DocFieldPair.fields.holds, "value"),
      identifier: Type.literal(DocFieldPair.fields.identifier, "RESPONSE"),
      least: Type.literal(DocFieldPair.fields.least, ""),
      package: Type.literal(DocFieldPair.fields.package, ""),
      path: Type.literal(DocFieldPair.fields.path, ""),
      stage: Type.literal(DocFieldPair.fields.stage, 0n),
    }),
  );
  const noFieldDirectedPairs = query(delivery).rule((r) =>
    r.where(r.or()).find({
      child: Type.literal(DocFieldDirectedPair.fields.child, "x"),
      field: Type.literal(DocFieldDirectedPair.fields.field, ""),
      holds: Type.literal(DocFieldDirectedPair.fields.holds, "value"),
      identifier: Type.literal(DocFieldDirectedPair.fields.identifier, "RESPONSE"),
      package: Type.literal(DocFieldDirectedPair.fields.package, ""),
      path: Type.literal(DocFieldDirectedPair.fields.path, ""),
      source: Type.literal(DocFieldDirectedPair.fields.source, ""),
      stage: Type.literal(DocFieldDirectedPair.fields.stage, 0n),
      target: Type.literal(DocFieldDirectedPair.fields.target, ""),
    }),
  );
  const noFieldPoints = query(delivery).rule((r) =>
    r.where(r.or()).find({
      child: Type.literal(DocFieldPoint.fields.child, "x"),
      field: Type.literal(DocFieldPoint.fields.field, ""),
      holds: Type.literal(DocFieldPoint.fields.holds, "value"),
      identifier: Type.literal(DocFieldPoint.fields.identifier, "RESPONSE"),
      package: Type.literal(DocFieldPoint.fields.package, ""),
      path: Type.literal(DocFieldPoint.fields.path, ""),
      stage: Type.literal(DocFieldPoint.fields.stage, 0n),
      x: Type.literal(DocFieldPoint.fields.x, 0n),
      y: Type.literal(DocFieldPoint.fields.y, 0n),
    }),
  );
  const noFieldFiles = query(delivery).rule((r) =>
    r.where(r.or()).find({
      child: Type.literal(DocFieldFile.fields.child, "x"),
      content_type: Type.literal(DocFieldFile.fields.content_type, ""),
      digest: Type.literal(DocFieldFile.fields.digest, ""),
      field: Type.literal(DocFieldFile.fields.field, ""),
      holds: Type.literal(DocFieldFile.fields.holds, "value"),
      identifier: Type.literal(DocFieldFile.fields.identifier, "RESPONSE"),
      package: Type.literal(DocFieldFile.fields.package, ""),
      path: Type.literal(DocFieldFile.fields.path, ""),
      stage: Type.literal(DocFieldFile.fields.stage, 0n),
    }),
  );
  const noFieldFileNames = query(delivery).rule((r) =>
    r.where(r.or()).find({
      child: Type.literal(DocFieldFileName.fields.child, "x"),
      field: Type.literal(DocFieldFileName.fields.field, ""),
      holds: Type.literal(DocFieldFileName.fields.holds, "value"),
      identifier: Type.literal(DocFieldFileName.fields.identifier, "RESPONSE"),
      name: Type.literal(DocFieldFileName.fields.name, ""),
      package: Type.literal(DocFieldFileName.fields.package, ""),
      path: Type.literal(DocFieldFileName.fields.path, ""),
      stage: Type.literal(DocFieldFileName.fields.stage, 0n),
    }),
  );
  const noReplyFloats = query(delivery).rule((r) =>
    r.where(r.or()).find({
      child: Type.literal(DocReplyFloat.fields.child, "x"),
      field: Type.literal(DocReplyFloat.fields.field, ""),
      package: Type.literal(DocReplyFloat.fields.package, ""),
      path: Type.literal(DocReplyFloat.fields.path, ""),
      stage: Type.literal(DocReplyFloat.fields.stage, 0n),
      start: Type.literal(DocReplyFloat.fields.start, 0n),
      value: Type.literal(DocReplyFloat.fields.value, 0),
    }),
  );
  const noReplyTexts = query(delivery).rule((r) =>
    r.where(r.or()).find({
      base: Type.literal(DocReplyText.fields.base, "identifier"),
      child: Type.literal(DocReplyText.fields.child, "x"),
      field: Type.literal(DocReplyText.fields.field, ""),
      package: Type.literal(DocReplyText.fields.package, ""),
      path: Type.literal(DocReplyText.fields.path, ""),
      stage: Type.literal(DocReplyText.fields.stage, 0n),
      start: Type.literal(DocReplyText.fields.start, 0n),
      value: Type.literal(DocReplyText.fields.value, "x"),
    }),
  );
  const noTableBindings = query(delivery).rule((r) =>
    r.where(r.or()).find({
      class: Type.literal(TableBinding.fields.class, "rubric-score"),
      identifier: Type.literal(TableBinding.fields.identifier, ""),
      place: Type.literal(TableBinding.fields.place, 0n),
      role: Type.literal(TableBinding.fields.role, "stop-words"),
    }),
  );
  const noTableEntries = query(delivery).rule((r) =>
    r.where(r.or()).find({
      identifier: Type.literal(TableEntry.fields.identifier, ""),
      key: Type.literal(TableEntry.fields.key, ""),
      place: Type.literal(TableEntry.fields.place, 0n),
    }),
  );
  const noTableValues = query(delivery).rule((r) =>
    r.where(r.or()).find({
      identifier: Type.literal(TableValue.fields.identifier, ""),
      key: Type.literal(TableValue.fields.key, ""),
      value: Type.literal(TableValue.fields.value, ""),
    }),
  );

  /**
   * The machine's run of a session's start: one call, every argument a query over the session's
   * key, each bound to the parent row's terms through its own `bind`, so a read's call is one
   * evaluation for its one parent row.
   *
   * @param key The session's key, a parent row's terms.
   * @returns The run's fields, each a source a read matches.
   */
  const runOf = (key: StartedKey) => {
    const bound = { child: key.child, n: key.n, package: key.package, path: key.path };

    return Fn.row(responseProcessingOf, {
      bases: basesOf.bind(bound),
      booleans: booleansOf.bind(bound),
      declaration_attributes: declarationAttributesOf.bind(bound),
      declaration_texts: declarationTextsOf.bind(bound),
      declarations: declarationsOf.bind(bound),
      directed_pairs: directedPairsOf.bind(bound),
      field_booleans: noFieldBooleans,
      field_directed_pairs: noFieldDirectedPairs,
      field_file_names: noFieldFileNames,
      field_files: noFieldFiles,
      field_floats: noFieldFloats,
      field_integers: noFieldIntegers,
      field_pairs: noFieldPairs,
      field_points: noFieldPoints,
      field_texts: noFieldTexts,
      file_names: fileNamesOf.bind(bound),
      files: filesOf.bind(bound),
      floats: floatsOf.bind(bound),
      integers: integersOf.bind(bound),
      pairs: pairsOf.bind(bound),
      points: pointsOf.bind(bound),
      program_attributes: noProgramAttributes,
      program_texts: noProgramTexts,
      programs: noPrograms,
      reply_floats: noReplyFloats,
      reply_texts: noReplyTexts,
      runs: runsOf.bind(bound),
      table_bindings: noTableBindings,
      table_entries: noTableEntries,
      table_values: noTableValues,
      texts: textsOf.bind(bound),
      vars: varsOf.bind(bound),
    });
  };

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
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value } = v(run.texts, "startValue");

            return r
              .match(run.vars, {
                card: "single",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.texts, {
                base: "identifier",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place: 0n,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "boolean",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value } = v(run.booleans, "startValue");

            return r
              .match(run.vars, {
                card: "single",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.booleans, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place: 0n,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "integer",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value } = v(run.integers, "startValue");

            return r
              .match(run.vars, {
                card: "single",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.integers, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place: 0n,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "float",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value } = v(run.floats, "startValue");

            return r
              .match(run.vars, {
                card: "single",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.floats, {
                base: "float",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place: 0n,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "string",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value } = v(run.texts, "startValue");

            return r
              .match(run.vars, {
                card: "single",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.texts, {
                base: "string",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place: 0n,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "point",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { x, y } = v(run.points, "startValue");

            return r
              .match(run.vars, {
                card: "single",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.points, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place: 0n,
                stage: key.stage,
                x,
                y,
              })
              .where(r.ne(kind, "context"))
              .find({ variable: identifier, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { least, greatest } = v(run.pairs, "startValue");

            return r
              .match(run.vars, {
                card: "single",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.pairs, {
                child: key.child,
                greatest,
                holds: "value",
                identifier,
                least,
                package: key.package,
                path: key.path,
                place: 0n,
                stage: key.stage,
              })
              .where(r.ne(kind, "context"))
              .find({ greatest, least, variable: identifier });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { source, target } = v(run.directed_pairs, "startValue");

            return r
              .match(run.vars, {
                card: "single",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.directed_pairs, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place: 0n,
                source,
                stage: key.stage,
                target,
              })
              .where(r.ne(kind, "context"))
              .find({ source, target, variable: identifier });
          }),
        "array",
      )
      .attach(
        "duration",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value } = v(run.floats, "startValue");

            return r
              .match(run.vars, {
                card: "single",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.floats, {
                base: "duration",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place: 0n,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "uri",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value } = v(run.texts, "startValue");

            return r
              .match(run.vars, {
                card: "single",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.texts, {
                base: "uri",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place: 0n,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "file",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { digest, content_type: type } = v(run.files, "startFile");
            const { name } = v(run.file_names, "startFileName");

            return r
              .match(run.vars, {
                card: "single",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.files, {
                child: key.child,
                content_type: type,
                digest,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place: 0n,
                stage: key.stage,
              })
              .match(run.file_names, {
                child: key.child,
                holds: "value",
                identifier,
                name,
                package: key.package,
                path: key.path,
                place: 0n,
                stage: key.stage,
              })
              .where(r.ne(kind, "context"))
              .find({ digest, name, type, variable: identifier });
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
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.texts, "startValue");

            return r
              .match(run.vars, {
                card: "multiple",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.texts, {
                base: "identifier",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ count: r.count(), value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "boolean",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.booleans, "startValue");

            return r
              .match(run.vars, {
                card: "multiple",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.booleans, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ count: r.count(), value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "integer",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.integers, "startValue");

            return r
              .match(run.vars, {
                card: "multiple",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.integers, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ count: r.count(), value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "float",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.floats, "startValue");

            return r
              .match(run.vars, {
                card: "multiple",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.floats, {
                base: "float",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ bits: Num.floatBits(value), count: r.count(), value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "string",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.texts, "startValue");

            return r
              .match(run.vars, {
                card: "multiple",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.texts, {
                base: "string",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ count: r.count(), value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "point",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { x, y, place } = v(run.points, "startValue");

            return r
              .match(run.vars, {
                card: "multiple",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.points, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                x,
                y,
              })
              .where(r.ne(kind, "context"))
              .find({ count: r.count(), variable: identifier, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { least, greatest, place } = v(run.pairs, "startValue");

            return r
              .match(run.vars, {
                card: "multiple",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.pairs, {
                child: key.child,
                greatest,
                holds: "value",
                identifier,
                least,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
              })
              .where(r.ne(kind, "context"))
              .find({ count: r.count(), greatest, least, variable: identifier });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { source, target, place } = v(run.directed_pairs, "startValue");

            return r
              .match(run.vars, {
                card: "multiple",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.directed_pairs, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                source,
                stage: key.stage,
                target,
              })
              .where(r.ne(kind, "context"))
              .find({ count: r.count(), source, target, variable: identifier });
          }),
        "array",
      )
      .attach(
        "duration",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.floats, "startValue");

            return r
              .match(run.vars, {
                card: "multiple",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.floats, {
                base: "duration",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ bits: Num.floatBits(value), count: r.count(), value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "uri",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.texts, "startValue");

            return r
              .match(run.vars, {
                card: "multiple",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.texts, {
                base: "uri",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ count: r.count(), value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "file",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { digest, content_type: type, place } = v(run.files, "startFile");
            const { name } = v(run.file_names, "startFileName");

            return r
              .match(run.vars, {
                card: "multiple",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.files, {
                child: key.child,
                content_type: type,
                digest,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
              })
              .match(run.file_names, {
                child: key.child,
                holds: "value",
                identifier,
                name,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
              })
              .where(r.ne(kind, "context"))
              .find({ count: r.count(), digest, name, type, variable: identifier });
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
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.texts, "startValue");

            return r
              .match(run.vars, {
                card: "ordered",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.texts, {
                base: "identifier",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ place, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "boolean",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.booleans, "startValue");

            return r
              .match(run.vars, {
                card: "ordered",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.booleans, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ place, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "integer",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.integers, "startValue");

            return r
              .match(run.vars, {
                card: "ordered",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.integers, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ place, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "float",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.floats, "startValue");

            return r
              .match(run.vars, {
                card: "ordered",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.floats, {
                base: "float",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ place, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "string",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.texts, "startValue");

            return r
              .match(run.vars, {
                card: "ordered",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.texts, {
                base: "string",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ place, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "point",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { x, y, place } = v(run.points, "startValue");

            return r
              .match(run.vars, {
                card: "ordered",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.points, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                x,
                y,
              })
              .where(r.ne(kind, "context"))
              .find({ place, variable: identifier, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { least, greatest, place } = v(run.pairs, "startValue");

            return r
              .match(run.vars, {
                card: "ordered",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.pairs, {
                child: key.child,
                greatest,
                holds: "value",
                identifier,
                least,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
              })
              .where(r.ne(kind, "context"))
              .find({ greatest, least, place, variable: identifier });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { source, target, place } = v(run.directed_pairs, "startValue");

            return r
              .match(run.vars, {
                card: "ordered",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.directed_pairs, {
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                source,
                stage: key.stage,
                target,
              })
              .where(r.ne(kind, "context"))
              .find({ place, source, target, variable: identifier });
          }),
        "array",
      )
      .attach(
        "duration",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.floats, "startValue");

            return r
              .match(run.vars, {
                card: "ordered",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.floats, {
                base: "duration",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ place, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "uri",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { value, place } = v(run.texts, "startValue");

            return r
              .match(run.vars, {
                card: "ordered",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.texts, {
                base: "uri",
                child: key.child,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ place, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "file",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { digest, content_type: type, place } = v(run.files, "startFile");
            const { name } = v(run.file_names, "startFileName");

            return r
              .match(run.vars, {
                card: "ordered",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.files, {
                child: key.child,
                content_type: type,
                digest,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
              })
              .match(run.file_names, {
                child: key.child,
                holds: "value",
                identifier,
                name,
                package: key.package,
                path: key.path,
                place,
                stage: key.stage,
              })
              .where(r.ne(kind, "context"))
              .find({ digest, name, place, type, variable: identifier });
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
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { field, value } = v(run.field_texts, "startField");

            return r
              .match(run.vars, {
                card: "record",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_texts, {
                base: "identifier",
                child: key.child,
                field,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ field, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "boolean",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { field, value } = v(run.field_booleans, "startField");

            return r
              .match(run.vars, {
                card: "record",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_booleans, {
                child: key.child,
                field,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ field, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "integer",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { field, value } = v(run.field_integers, "startField");

            return r
              .match(run.vars, {
                card: "record",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_integers, {
                child: key.child,
                field,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ field, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "float",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { field, value } = v(run.field_floats, "startField");

            return r
              .match(run.vars, {
                card: "record",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_floats, {
                base: "float",
                child: key.child,
                field,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ field, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "string",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { field, value } = v(run.field_texts, "startField");

            return r
              .match(run.vars, {
                card: "record",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_texts, {
                base: "string",
                child: key.child,
                field,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ field, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "point",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { field, x, y } = v(run.field_points, "startField");

            return r
              .match(run.vars, {
                card: "record",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_points, {
                child: key.child,
                field,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                stage: key.stage,
                x,
                y,
              })
              .where(r.ne(kind, "context"))
              .find({ field, variable: identifier, x, y });
          }),
        "array",
      )
      .attach(
        "pair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { field, least, greatest } = v(run.field_pairs, "startField");

            return r
              .match(run.vars, {
                card: "record",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_pairs, {
                child: key.child,
                field,
                greatest,
                holds: "value",
                identifier,
                least,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .where(r.ne(kind, "context"))
              .find({ field, greatest, least, variable: identifier });
          }),
        "array",
      )
      .attach(
        "directedPair",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { field, source, target } = v(run.field_directed_pairs, "startField");

            return r
              .match(run.vars, {
                card: "record",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_directed_pairs, {
                child: key.child,
                field,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                source,
                stage: key.stage,
                target,
              })
              .where(r.ne(kind, "context"))
              .find({ field, source, target, variable: identifier });
          }),
        "array",
      )
      .attach(
        "duration",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { field, value } = v(run.field_floats, "startField");

            return r
              .match(run.vars, {
                card: "record",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_floats, {
                base: "duration",
                child: key.child,
                field,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ field, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "uri",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { field, value } = v(run.field_texts, "startField");

            return r
              .match(run.vars, {
                card: "record",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_texts, {
                base: "uri",
                child: key.child,
                field,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                stage: key.stage,
                value,
              })
              .where(r.ne(kind, "context"))
              .find({ field, value, variable: identifier });
          }),
        "array",
      )
      .attach(
        "file",
        (key: StartedKey) =>
          query(delivery).rule((r) => {
            const run = runOf(key);
            const { identifier, kind } = v(run.vars, "startVar");
            const { field, digest, content_type: type } = v(run.field_files, "startFieldFile");
            const { name } = v(run.field_file_names, "startFieldName");

            return r
              .match(run.vars, {
                card: "record",
                child: key.child,
                holds: "value",
                identifier,
                kind,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_files, {
                child: key.child,
                content_type: type,
                digest,
                field,
                holds: "value",
                identifier,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .match(run.field_file_names, {
                child: key.child,
                field,
                holds: "value",
                identifier,
                name,
                package: key.package,
                path: key.path,
                stage: key.stage,
              })
              .where(r.ne(kind, "context"))
              .find({ digest, field, name, type, variable: identifier });
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
