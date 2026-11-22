/**
 * The declaration and mapping overlays' rules over their node (`#pantry/qti/declarations.ts`,
 * `#pantry/qti/mapping.ts`): a value set's, a table's and a mapping's declaration, a value's set,
 * a field's set, a map entry's mapping and a table entry's table are each its node's parent, which
 * only `Node` holds (decision S3: no copies); a declaration's kind is its element's, and its name,
 * cardinality and base type its attributes' values, which the views read
 * (`#pantry/qti/names.ts`); a record's field is its value's `field-identifier`, its base type the
 * value's own `base-type`; and a scale's pairs are its stored ends' joins.
 * Each law that pairs an overlay row or a node with one of them reads `Node` through a query here,
 * under the law's own name.
 */
import { check, contained, derived, key, on, query, select, Text, v } from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import { referencedTables, tableReaders } from "#pantry/grammar/expression.ts";
import { BaseTypeLexical, MappableBaseType } from "#pantry/grammar/install.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import { attributesOf } from "#pantry/qti/attributes.ts";
import { BaseTypePattern, unjudgedBaseTypes } from "#pantry/qti/expression-types.ts";
import {
  contextVariable,
  declarationKinds,
  fieldBaseTypes,
  fieldIdentifiers,
  itemSessionVariables,
  testSessionVariables,
  valueSetKinds,
} from "#pantry/qti/declarations.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { testKind } from "#pantry/vocab/terms/tests.ts";
import { placedTableReaders } from "#pantry/qti/overlay-queries/reference.ts";
import { lookupEntryKinds, lookupTableKinds, LookupValue, MapKey } from "#pantry/qti/mapping.ts";
import {
  attributeValues,
  attributeCodes,
  DeclarationBaseType,
  DeclarationCardinality,
  DeclarationName,
  MasteryValue,
  NamedDeclaration,
  NormalMaximum,
  NormalMinimum,
  QtiViews,
} from "#pantry/qti/names.ts";
import { Node } from "#pantry/qti/node.ts";

/**
 * Each value's `field-identifier`, by its `qti-value` element's place, its `value` the field's name
 * collapsed (`IdentifierDType`'s class, C18): one field of a record's value, "a set of independent
 * values each identified by its own identifier and having its own base-type" (information model
 * §8.16, CardinalityEnum, `record`), where its set is a record's ("Value cardinality"); on any
 * other value it names nothing (§7.46.1). No row copies it. A value that is no NCName names no
 * field (spec reading 152), and no rule reads one: AL1's `value_domain` refuses the write that
 * holds it at its own insert, before any rule over a query is judged at COMMIT, so the selection
 * matches no pattern.
 */
const recordFields = attributeValues("field-identifier", ["qti-value"]);

/**
 * Each value's own `base-type`, by its `qti-value` element's place, where it spells a code, with
 * the code (C17, `attributeCodes`): the base type a record's field's text is read in (information
 * model §7.46.2, Value's base-type: "This characteristic is only used for specifying the base-type
 * of a value that forms part of a record"). Any other value's text is read in its declaration's,
 * and the attribute there types nothing and is refused by no law (§7.46: "The base-type is defined
 * by the 'base-type' attribute of the declaration except in the case of variables with record
 * cardinality"). A `base-type` written as no code has no row,
 * and its value domain refuses it alone (the orchestrator's ruling of 2026-11-06: one cause is
 * refused under one rule).
 */
const valueBaseTypes = attributeCodes("base-type", ["qti-value"], BaseTypeLexical);

/**
 * Each value set beside its declaration's cardinality, by the set's place: a
 * `qti-default-value` or `qti-correct-response` node, its count of values (its element children,
 * its `qti-value`s alone: `CorrectResponseDType`, `DefaultValueDType`), and its parent's
 * {@link DeclarationCardinality}, where the declaration has one (spec reading 158).
 * `Value_cardinality` holds a single variable's set to one value.
 */
const SetCardinality = derived(
  "SetCardinality",
  query(QtiViews).rule((r) => {
    const {
      elementChildren,
      kind,
      package: pkg,
      parent: declaration,
      path,
      start,
    } = v(Node, "set");
    const { code: cardinality } = v(DeclarationCardinality, "declared");

    return r
      .match(Node, { elementChildren, kind, package: pkg, parent: declaration, path, start })
      .match(DeclarationCardinality, { code: cardinality, package: pkg, path, start: declaration })
      .where(r.in(kind, valueSetKinds))
      .find({ cardinality, elementChildren, package: pkg, path, start });
  }),
);

/**
 * Each value's text beside its declaration's base type and cardinality, by the value's place,
 * where its declaration has both: a `qti-value` node's string value, its parent a value set and
 * its grandparent the declaration. `Typed_value` reads the text in the base type unless the
 * cardinality is `record`, whose value is a field read in its own base type
 * ({@link FieldValueText}). A declaration with no base type gives its values none to be read in,
 * and one with no cardinality none to tell a record's from another's.
 */
const TypedValueText = derived(
  "TypedValueText",
  query(QtiViews).rule((r) => {
    const { package: pkg, parent: set, path, start, stringValue: text } = v(Node, "value");
    const { kind, parent: declaration } = v(Node, "setNode");
    const { code: baseType } = v(DeclarationBaseType, "base");
    const { code: cardinality } = v(DeclarationCardinality, "declared");

    return r
      .match(Node, { kind: "qti-value", package: pkg, parent: set, path, start, stringValue: text })
      .match(Node, { kind, package: pkg, parent: declaration, path, start: set })
      .match(DeclarationBaseType, { code: baseType, package: pkg, path, start: declaration })
      .match(DeclarationCardinality, { code: cardinality, package: pkg, path, start: declaration })
      .where(r.in(kind, valueSetKinds))
      .find({ baseType, cardinality, package: pkg, path, start, text });
  }),
);

/**
 * Each value's text beside its own base type and its declaration's cardinality, by the value's
 * place, where it has a base type of its own ({@link valueBaseTypes}) and its declaration a
 * cardinality. `Typed_value` reads a record's field's text in its own base type; any other value's
 * is read in its declaration's ({@link TypedValueText}).
 */
const FieldValueText = derived(
  "FieldValueText",
  query(QtiViews).rule((r) => {
    const { package: pkg, parent: set, path, start, stringValue: text } = v(Node, "value");
    const { code: baseType } = v(valueBaseTypes, "own");
    const { kind, parent: declaration } = v(Node, "setNode");
    const { code: cardinality } = v(DeclarationCardinality, "declared");

    return r
      .match(Node, { package: pkg, parent: set, path, start, stringValue: text })
      .match(valueBaseTypes, { code: baseType, package: pkg, path, start })
      .match(Node, { kind, package: pkg, parent: declaration, path, start: set })
      .match(DeclarationCardinality, { code: cardinality, package: pkg, path, start: declaration })
      .where(r.in(kind, valueSetKinds))
      .find({ baseType, cardinality, package: pkg, path, start, text });
  }),
);

/**
 * Each record field's name beside its set, its node's parent, by the field's place: its
 * {@link recordFields} value, where the set is a value set of a declaration whose
 * {@link DeclarationCardinality} is `record`. "Record field key" holds a set's names distinct. A
 * `field-identifier` on a value of any other set names no field (information model §7.46.1: "only
 * used for specifying the field identifier for a value that forms part of a record"), so no law
 * reads it.
 */
const SetFieldName = derived(
  "SetFieldName",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, start, value: identifier } = v(recordFields, "field");
    const { parent: set } = v(Node, "node");
    const { kind, parent: declaration } = v(Node, "setNode");

    return r
      .match(recordFields, { package: pkg, path, start, value: identifier })
      .match(Node, { package: pkg, parent: set, path, start })
      .match(Node, { kind, package: pkg, parent: declaration, path, start: set })
      .match(DeclarationCardinality, { code: "record", package: pkg, path, start: declaration })
      .where(r.in(kind, valueSetKinds))
      .find({ identifier, package: pkg, path, set, start });
  }),
);

/**
 * Each value of a record's set, by the value's place: a `qti-value` node whose parent is a value
 * set of a declaration whose {@link DeclarationCardinality} is `record`. "Value cardinality" holds
 * each to its field, a `field-identifier` and a `base-type` both, since a record is "a set of
 * independent values each identified by its own identifier and having its own base-type"
 * (information model §8.16, CardinalityEnum).
 */
const RecordSetValue = derived(
  "RecordSetValue",
  query(QtiViews).rule((r) => {
    const { package: pkg, parent: set, path, start } = v(Node, "value");
    const { kind, parent: declaration } = v(Node, "setNode");

    return r
      .match(Node, { kind: "qti-value", package: pkg, parent: set, path, start })
      .match(Node, { kind, package: pkg, parent: declaration, path, start: set })
      .match(DeclarationCardinality, { code: "record", package: pkg, path, start: declaration })
      .where(r.in(kind, valueSetKinds))
      .find({ package: pkg, path, start });
  }),
);

/**
 * Each mapping beside its declaration's cardinality, by its `qti-mapping` node's place, where the
 * declaration has one: `cardinality`, the declaration's {@link DeclarationCardinality}'s, the
 * declaration its node's parent. "MappableBaseType" holds it to no record. A mapping of a
 * declaration with no cardinality has no row, and no law reads a cardinality it does not have
 * (spec reading 158).
 */
const MappingCardinality = derived(
  "MappingCardinality",
  query(QtiViews).rule((r) => {
    const { package: pkg, parent: declaration, path, start } = v(Node, "mapping");
    const { code: cardinality } = v(DeclarationCardinality, "declared");

    return r
      .match(Node, { kind: "qti-mapping", package: pkg, parent: declaration, path, start })
      .match(DeclarationCardinality, { code: cardinality, package: pkg, path, start: declaration })
      .find({ cardinality, package: pkg, path, start });
  }),
);

/**
 * Each area mapping beside its declaration's cardinality, by its `qti-area-mapping` node's place,
 * where the declaration has one, as {@link MappingCardinality} holds a mapping's: "AreaMapping base
 * type" holds it to no record.
 */
const AreaMappingCardinality = derived(
  "AreaMappingCardinality",
  query(QtiViews).rule((r) => {
    const { package: pkg, parent: declaration, path, start } = v(Node, "mapping");
    const { code: cardinality } = v(DeclarationCardinality, "declared");

    return r
      .match(Node, { kind: "qti-area-mapping", package: pkg, parent: declaration, path, start })
      .match(DeclarationCardinality, { code: cardinality, package: pkg, path, start: declaration })
      .find({ cardinality, package: pkg, path, start });
  }),
);

/**
 * Each lookup table beside its outcome declaration's cardinality, by its `qti-match-table` or
 * `qti-interpolation-table` node's place, where the declaration has one, as
 * {@link MappingCardinality} holds a mapping's: "Lookup table cardinality" holds it to single.
 */
const LookupTableCardinality = derived(
  "LookupTableCardinality",
  query(QtiViews).rule((r) => {
    const { kind, package: pkg, parent: declaration, path, start } = v(Node, "table");
    const { code: cardinality } = v(DeclarationCardinality, "declared");

    return r
      .match(Node, { kind, package: pkg, parent: declaration, path, start })
      .match(DeclarationCardinality, { code: cardinality, package: pkg, path, start: declaration })
      .where(r.in(kind, lookupTableKinds))
      .find({ cardinality, package: pkg, path, start });
  }),
);

/**
 * Each mapping beside its declaration's base type, by its `qti-mapping` node's place, where the
 * declaration has one: `baseType`, the declaration's {@link DeclarationBaseType}'s, the declaration
 * its node's parent. "MappableBaseType" holds it to a mappable type. A record has none, and its
 * mapping no row (lane NIL's audit, B12).
 */
const MappingBaseType = derived(
  "MappingBaseType",
  query(QtiViews).rule((r) => {
    const { package: pkg, parent: declaration, path, start } = v(Node, "mapping");
    const { code: baseType } = v(DeclarationBaseType, "base");

    return r
      .match(Node, { kind: "qti-mapping", package: pkg, parent: declaration, path, start })
      .match(DeclarationBaseType, { code: baseType, package: pkg, path, start: declaration })
      .find({ baseType, package: pkg, path, start });
  }),
);

/**
 * Each area mapping beside its declaration's base type, by its `qti-area-mapping` node's place,
 * where the declaration has one, as {@link MappingBaseType} holds a mapping's: "AreaMapping base
 * type" holds it to `point`.
 */
const AreaMappingBaseType = derived(
  "AreaMappingBaseType",
  query(QtiViews).rule((r) => {
    const { package: pkg, parent: declaration, path, start } = v(Node, "mapping");
    const { code: baseType } = v(DeclarationBaseType, "base");

    return r
      .match(Node, { kind: "qti-area-mapping", package: pkg, parent: declaration, path, start })
      .match(DeclarationBaseType, { code: baseType, package: pkg, path, start: declaration })
      .find({ baseType, package: pkg, path, start });
  }),
);

/**
 * Each map key beside the base type it is read in, by its `qti-map-entry` node's place, where its
 * mapping's declaration has one: `key`, its {@link MapKey}'s, and `baseType`, the declaration's
 * {@link DeclarationBaseType}'s, the mapping its node's parent and the declaration the mapping's.
 * "Typed attribute value" holds the key to the type's lexical forms. A record's mapping reads its
 * keys in no base type, and they have no row.
 */
const MapKeyType = derived(
  "MapKeyType",
  query(QtiViews).rule((r) => {
    const { key: text, package: pkg, path, start } = v(MapKey, "key");
    const { parent: mapping } = v(Node, "entry");
    const { parent: declaration } = v(Node, "mapping");
    const { code: baseType } = v(DeclarationBaseType, "base");

    return r
      .match(MapKey, { key: text, package: pkg, path, start })
      .match(Node, { package: pkg, parent: mapping, path, start })
      .match(Node, {
        kind: "qti-mapping",
        package: pkg,
        parent: declaration,
        path,
        start: mapping,
      })
      .match(DeclarationBaseType, { code: baseType, package: pkg, path, start: declaration })
      .find({ baseType, key: text, package: pkg, path, start });
  }),
);

/**
 * Each lookup value beside the base type it is read in, by the place of the element that carries
 * it, where its table's outcome declaration has one: `value`, its {@link LookupValue}'s, and
 * `baseType`, the declaration's {@link DeclarationBaseType}'s. A table entry's target's table is
 * its node's parent, and a table's default value's table its own node; the declaration is the
 * table's node's parent. "Typed attribute value" holds the value to the type's lexical forms.
 */
const LookupValueType = derived(
  "LookupValueType",
  query(QtiViews)
    .rule((r) => {
      const { package: pkg, path, start, value } = v(LookupValue, "value");
      const { kind, parent: table } = v(Node, "entry");
      const { kind: tableKind, parent: declaration } = v(Node, "table");
      const { code: baseType } = v(DeclarationBaseType, "base");

      return r
        .match(LookupValue, { package: pkg, path, start, value })
        .match(Node, { kind, package: pkg, parent: table, path, start })
        .match(Node, { kind: tableKind, package: pkg, parent: declaration, path, start: table })
        .match(DeclarationBaseType, { code: baseType, package: pkg, path, start: declaration })
        .where(r.in(kind, lookupEntryKinds))
        .where(r.in(tableKind, lookupTableKinds))
        .find({ baseType, package: pkg, path, start, value });
    })
    .rule((r) => {
      const { package: pkg, path, start, value } = v(LookupValue, "value");
      const { kind, parent: declaration } = v(Node, "table");
      const { code: baseType } = v(DeclarationBaseType, "base");

      return r
        .match(LookupValue, { package: pkg, path, start, value })
        .match(Node, { kind, package: pkg, parent: declaration, path, start })
        .match(DeclarationBaseType, { code: baseType, package: pkg, path, start: declaration })
        .where(r.in(kind, lookupTableKinds))
        .find({ baseType, package: pkg, path, start, value });
    }),
);

/**
 * Each table a declaration holds, by the declaration's place and the table's kind: a mapping, an
 * area mapping, a match table or an interpolation table, a child of the declaration's node. A
 * placed map response or map response point ("Mapped response") and a placed lookup ("Lookup type")
 * is held to one of these. The content model holds a declaration to at most one table of each slot
 * (N7).
 */
const DeclarationTable = derived(
  "DeclarationTable",
  query(QtiBase).rule((r) => {
    const { kind, package: pkg, parent: declaration, path } = v(Node, "table");

    return r
      .match(Node, { kind, package: pkg, parent: declaration, path })
      .where(r.in(kind, referencedTables))
      .find({ declaration, kind, package: pkg, path });
  }),
);

/**
 * The tables of one kind a declaration holds. Exported for the interpolation table a lookup of a
 * value a match table does not map reads (`#pantry/qti/queries.ts`).
 *
 * @param kind - The table's kind.
 * @returns The selection of {@link DeclarationTable}.
 */
export const declarationTables = (kind: (typeof referencedTables)[number]) =>
  select(DeclarationTable, (t) => t.eq(t.kind, kind));

/**
 * State that each declared placed reference of a reader's kind by `identifier` reads a table its
 * declaration holds, one its kind reads (`tableReaders` of `#pantry/grammar/expression.ts`): its
 * declaration, in its assembly's root, is one that holds such a table.
 *
 * @param kind - The reader's kind.
 * @returns The containment.
 */
const readsItsTable = (kind: (typeof tableReaders)[number]["kind"]) => {
  const tables = tableReaders.flatMap((reader) => (reader.kind === kind ? [reader.table] : []));

  return contained(
    on(placedTableReaders(kind), "package", "assembly", "declaration"),
    on(
      select(DeclarationTable, (t) => t.in(t.kind, tables)),
      "package",
      "path",
      "declaration",
    ),
  );
};

/**
 * Each declaration's cardinality beside its base type, by the declaration's place, where it has
 * both: `cardinality`, its {@link DeclarationCardinality}'s code. "Declaration base type" holds it
 * to no record, since a record has no base type.
 */
const BaseTypeCardinality = derived(
  "BaseTypeCardinality",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, start } = v(DeclarationBaseType, "base");
    const { code: cardinality } = v(DeclarationCardinality, "declared");

    return r
      .match(DeclarationBaseType, { package: pkg, path, start })
      .match(DeclarationCardinality, { code: cardinality, package: pkg, path, start })
      .find({ cardinality, package: pkg, path, start });
  }),
);

/**
 * The declarations whose cardinality is other than a record's: each's
 * {@link DeclarationCardinality} that is not `record`, every one of which writes a base type.
 */
const nonRecordDeclarations = select(DeclarationCardinality, (c) => c.ne(c.code, "record"));

/**
 * The `base-type` of each declaration that writes one, whether or not it spells a code.
 */
const baseTypeAttributes = attributesOf("base-type", declarationKinds);

/**
 * Each outcome declaration that has both a normal minimum, written or the XSD's default, and a
 * mastery value, by its declaration's place: the two doubles, its {@link NormalMinimum}'s and its
 * {@link MasteryValue}'s, which `Mastery_range` orders (spec readings 9 and 149: each pair judged
 * where both have a value).
 */
export const MasteryFloor = derived(
  "MasteryFloor",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, start, value: normalMinimum } = v(NormalMinimum, "minimum");
    const { value: masteryValue } = v(MasteryValue, "mastery");

    return r
      .match(NormalMinimum, { package: pkg, path, start, value: normalMinimum })
      .match(MasteryValue, { package: pkg, path, start, value: masteryValue })
      .find({ masteryValue, normalMinimum, package: pkg, path, start });
  }),
);

/**
 * Each outcome declaration that has both a mastery value and a normal maximum, by its
 * declaration's place, as {@link MasteryFloor} holds the other pair: its {@link MasteryValue}'s and
 * its {@link NormalMaximum}'s doubles.
 */
export const MasteryCeiling = derived(
  "MasteryCeiling",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, start, value: masteryValue } = v(MasteryValue, "mastery");
    const { value: normalMaximum } = v(NormalMaximum, "maximum");

    return r
      .match(MasteryValue, { package: pkg, path, start, value: masteryValue })
      .match(NormalMaximum, { package: pkg, path, start, value: normalMaximum })
      .find({ masteryValue, normalMaximum, package: pkg, path, start });
  }),
);

/**
 * A `MasteryFloor` row as a check reads it.
 */
type MasteryFloorRow = RowScalars<typeof MasteryFloor>;

/**
 * A `MasteryCeiling` row as a check reads it.
 */
type MasteryCeilingRow = RowScalars<typeof MasteryCeiling>;

/**
 * State `Mastery_range` over a mastery value and a normal minimum, written or the XSD's default
 * (readings 9 and 149): the minimum is no greater than the mastery value, each the double its
 * attribute names, `NaN` ordered against nothing, so a pair with `NaN` holds. In `float8`'s order
 * `NaN` equals `NaN` and is above every other value, so its arms stand beside the comparison.
 *
 * @param r - The row.
 * @returns The predicate.
 */
const floorCheck = (r: MasteryFloorRow) =>
  r.or(
    r.eq(r.normalMinimum, Number.NaN),
    r.eq(r.masteryValue, Number.NaN),
    r.le(r.normalMinimum, r.masteryValue),
  );

/**
 * State `Mastery_range` over a mastery value and a normal maximum, each read as {@link floorCheck}
 * reads the other pair.
 *
 * @param r - The row.
 * @returns The predicate.
 */
const ceilingCheck = (r: MasteryCeilingRow) =>
  r.or(
    r.eq(r.masteryValue, Number.NaN),
    r.eq(r.normalMaximum, Number.NaN),
    r.le(r.masteryValue, r.normalMaximum),
  );

/**
 * Each named declaration beside its document's root kind, by the declaration's place: what the
 * reserved names' laws read, an item's and a test's apart (spec readings 163 and 168).
 */
const RootedDeclaration = derived(
  "RootedDeclaration",
  query(QtiViews).rule((r) => {
    const { declarationKind, identifier, package: pkg, path, start } = v(NamedDeclaration, "name");
    const { rootKind } = v(Document, "document");

    return r
      .match(NamedDeclaration, { declarationKind, identifier, package: pkg, path, start })
      .match(Document, { package: pkg, path, rootKind })
      .find({ declarationKind, identifier, package: pkg, path, rootKind, start });
  }),
);

/**
 * The declaration and mapping overlays' rules over their node, each named by its oracle law:
 *
 * - **AreaMapping base type:** an area mapping's declaration is no record, where it has a
 *   cardinality, and its base type, where it has one, is `point`;
 * - **Declaration base type:** a record has no base type, and every declaration of another
 *   cardinality writes one; one that spells nothing is its value domain's alone (spec reading
 *   158);
 * - **Declaration key** (spec reading 74): a document's declared names are distinct;
 * - **Declaration not reserved** (readings 72 and 168): no declaration names one of an item's three
 *   built-in session variables (information model table 4.5.1; §2.2.2);
 * - **Lookup type** and **Mapped response:** a declared placed lookup, map response or map response
 *   point reads a table its declaration holds, one its kind reads (spec reading 166);
 * - **Lookup table cardinality:** a match or interpolation table's outcome is single, where it has a
 *   cardinality;
 * - **Mastery range** (C2, G-parse): the mastery value lies in the normal range, each pair judged
 *   where both have a value: written, or a normal minimum's XSD default (reading 149);
 * - **MappableBaseType:** a mapping's declaration is no record, where it has a cardinality, and its
 *   base type, where it has one, is in `MappableBaseType`;
 * - **Typed attribute value:** a map key, a table entry's target and a table's default are lexical
 *   forms of their declaration's base type, where it has one: read as written for `string`, and for
 *   every other base type after XML Schema's `collapse`, the whitespace facet each typed simple
 *   type fixes (XML Schema 1.0 Part 2 §4.3.6), so `" 3 "` is the integer 3 (reading 7);
 * - **Typed value:** each value's text is a lexical form of its base type, its declaration's or, a
 *   record's field's, its own, each value its node's string value, its set its parent and its
 *   declaration its grandparent;
 * - **Record field key:** a set's fields are distinct by name;
 * - **Reserved type:** QTI_CONTEXT keeps its built-in shape: it is declared as a context and, where
 *   it has a cardinality, is a record (reading 74). SCORE, MAXSCORE and PASSED are typed by no
 *   normative rule: §4.5's "needs to be a float" and "needs to be a boolean" use no RFC 2119
 *   keyword (§1.3), §2.2.2.3's "MUST" is NOT NORMATIVE, and no XSD or Schematron rule types them,
 *   so a declaration of any type is admitted (J1);
 * - **Value cardinality:** a single variable's set holds one value, and every value of a record's set
 *   is a field, with its `field-identifier` and its `base-type` both; a value of any other set may
 *   write either attribute, which types and names nothing there (information model §7.46.1,
 *   §7.46.2: each "is only used for" a value that forms part of a record).
 */
export const declarationOverlayLawsByName = {
  "AreaMapping base type": [
    check("AreaMapping_base_type", AreaMappingCardinality, (a) => a.ne(a.cardinality, "record")),
    check("AreaMapping_base_type", AreaMappingBaseType, (a) => a.eq(a.baseType, "point")),
  ],
  "Declaration base type": [
    check("Declaration_base_type", BaseTypeCardinality, (c) => c.ne(c.cardinality, "record")),
    contained(
      on(nonRecordDeclarations, "package", "path", "start"),
      on(baseTypeAttributes, "package", "path", "start"),
    ),
  ],
  "Declaration key": [key(on(NamedDeclaration, "package", "path", "identifier"))],
  "Declaration not reserved": [
    check("Declaration_not_reserved", RootedDeclaration, (d) =>
      d.or(
        d.and(d.eq(d.rootKind, testKind), d.not(d.in(d.identifier, testSessionVariables))),
        d.and(d.ne(d.rootKind, testKind), d.not(d.in(d.identifier, itemSessionVariables))),
      ),
    ),
  ],
  "Lookup table cardinality": [
    check("Lookup_table_cardinality", LookupTableCardinality, (t) => t.eq(t.cardinality, "single")),
  ],
  "Lookup type": [readsItsTable("qti-lookup-outcome-value")],
  MappableBaseType: [
    check("MappableBaseType", MappingCardinality, (m) => m.ne(m.cardinality, "record")),
    contained(on(MappingBaseType, "baseType"), on(MappableBaseType, "baseType")),
  ],
  "Mapped response": [readsItsTable("qti-map-response"), readsItsTable("qti-map-response-point")],
  "Mastery range": [
    check("Mastery_range", MasteryFloor, floorCheck),
    check("Mastery_range", MasteryCeiling, ceilingCheck),
  ],
  "Record field key": [key(on(SetFieldName, "package", "path", "set", "identifier"))],
  "Reserved type": [
    check("Reserved_type", NamedDeclaration, (d) =>
      d.or(
        d.ne(d.identifier, contextVariable.identifier),
        d.eq(d.declarationKind, contextVariable.kind),
      ),
    ),
    check("Reserved_type", DeclarationName, (d) =>
      d.or(
        d.ne(d.identifier, contextVariable.identifier),
        d.eq(d.cardinality, contextVariable.cardinality),
      ),
    ),
  ],
  "Typed attribute value": [
    check("Typed_attribute_value", MapKeyType, (k) =>
      k.or(
        k.and(
          k.eq(k.baseType, "string"),
          Text.matches(k.key, BaseTypePattern.at("pattern", k.baseType)),
        ),
        k.and(
          k.ne(k.baseType, "string"),
          Text.matches(Text.collapse(k.key), BaseTypePattern.at("pattern", k.baseType)),
        ),
      ),
    ),
    check("Typed_attribute_value", LookupValueType, (l) =>
      l.or(
        l.and(
          l.eq(l.baseType, "string"),
          Text.matches(l.value, BaseTypePattern.at("pattern", l.baseType)),
        ),
        l.and(
          l.ne(l.baseType, "string"),
          Text.matches(Text.collapse(l.value), BaseTypePattern.at("pattern", l.baseType)),
        ),
      ),
    ),
  ],
  "Typed value": [
    check("Typed_value", TypedValueText, (t) =>
      t.or(
        t.eq(t.cardinality, "record"),
        t.in(t.baseType, unjudgedBaseTypes),
        Text.matches(t.text, BaseTypePattern.at("pattern", t.baseType)),
      ),
    ),
    check("Typed_value", FieldValueText, (f) =>
      f.or(
        f.ne(f.cardinality, "record"),
        f.in(f.baseType, unjudgedBaseTypes),
        Text.matches(f.text, BaseTypePattern.at("pattern", f.baseType)),
      ),
    ),
  ],
  "Value cardinality": [
    check("Value_cardinality", SetCardinality, (c) =>
      c.or(c.ne(c.cardinality, "single"), c.eq(c.elementChildren, 1n)),
    ),
    contained(
      on(RecordSetValue, "package", "path", "start"),
      on(fieldIdentifiers, "package", "path", "start"),
    ),
    contained(
      on(RecordSetValue, "package", "path", "start"),
      on(fieldBaseTypes, "package", "path", "start"),
    ),
  ],
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const declarationOverlayRelations = [
  RootedDeclaration,
  AreaMappingBaseType,
  AreaMappingCardinality,
  BaseTypeCardinality,
  DeclarationTable,
  FieldValueText,
  LookupTableCardinality,
  LookupValueType,
  MapKeyType,
  MappingBaseType,
  MappingCardinality,
  MasteryCeiling,
  MasteryFloor,
  RecordSetValue,
  SetCardinality,
  SetFieldName,
  TypedValueText,
] as const;

/**
 * The rules of this module, {@link declarationOverlayLawsByName} flattened.
 */
export const declarationOverlayLaws = Object.values(declarationOverlayLawsByName).flat();
