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
import { check, Compute, contained, derived, key, on, query, select, v } from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import { referencedTables } from "#pantry/grammar/expression.ts";
import { BaseTypeLexical, MappableBaseType } from "#pantry/grammar/install.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import { attributesOf } from "#pantry/qti/attributes.ts";
import { BaseTypePattern, unjudgedBaseTypes } from "#pantry/qti/expression-types.ts";
import {
  contextVariable,
  declarationKinds,
  doublesInOrder,
  fieldIdentifiers,
  itemSessionVariables,
  MasteryValue,
  NormalMaximum,
  NormalMinimum,
  reservedBaseTypes,
  valueSetKinds,
} from "#pantry/qti/declarations.ts";
import { placedTableReaders, tableClaims } from "#pantry/qti/overlay-queries/reference.ts";
import {
  exactValuePattern,
  lookupEntryKinds,
  lookupTableKinds,
  LookupValue,
  MapKey,
} from "#pantry/qti/mapping.ts";
import {
  attributeValues,
  attributeCodes,
  DeclarationBaseType,
  DeclarationCardinality,
  DeclarationName,
  NamedDeclaration,
  QtiViews,
  TypedDeclarationName,
} from "#pantry/qti/names.ts";
import { Node } from "#pantry/qti/node.ts";
import { normalMinimumDefault } from "#pantry/vocab/terms/declarations.ts";

/**
 * Each value's `field-identifier`, by its `qti-value` element's place, its `value` the field's name
 * collapsed (`IdentifierDType`'s class, C18): one field of a record's value, "a set of independent
 * values each identified by its own identifier and having its own base-type" (information model
 * §8.16, CardinalityEnum, `record`), since a value writes its `field-identifier` and its
 * `base-type` both or neither ("Value cardinality", `#pantry/qti/declarations.ts`). No row copies
 * it. A value that is no NCName names no field (spec reading 152), and no rule reads one: AL1's
 * `value_domain` refuses the write that holds it at its own insert, before any rule over a query is
 * judged at COMMIT, so the selection matches no pattern.
 */
const recordFields = attributeValues("field-identifier", ["qti-value"]);

/**
 * Each value's own `base-type`, by its `qti-value` element's place, where it spells a code, with
 * the code (C17, `attributeCodes`): the base type a record's field's text is read in (information
 * model §7.46.2, Value's base-type: "This characteristic is only used for specifying the base-type
 * of a value that forms part of a record"). Any other value's text is read in its declaration's,
 * and `Value_cardinality` refuses the attribute there. A `base-type` written as no code has no row,
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
 * {@link recordFields} value. "Record field key" holds a set's names distinct.
 */
const SetFieldName = derived(
  "SetFieldName",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value: identifier } = v(recordFields, "field");
    const { parent: set } = v(Node, "node");

    return r
      .match(recordFields, { package: pkg, path, start, value: identifier })
      .match(Node, { package: pkg, parent: set, path, start })
      .find({ identifier, package: pkg, path, set, start });
  }),
);

/**
 * Each value of a record's set, by the value's place: a `qti-value` node whose parent is a value
 * set of a declaration whose {@link DeclarationCardinality} is `record`. "Value cardinality" holds
 * each to its field.
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
 * Each record field beside its set's declared cardinality, by the field's place, where the set's
 * declaration has one: "Value cardinality" holds it to `record`.
 */
const FieldSetCardinality = derived(
  "FieldSetCardinality",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, start } = v(recordFields, "field");
    const { parent: set } = v(Node, "node");
    const { kind, parent: declaration } = v(Node, "setNode");
    const { code: cardinality } = v(DeclarationCardinality, "declared");

    return r
      .match(recordFields, { package: pkg, path, start })
      .match(Node, { package: pkg, parent: set, path, start })
      .match(Node, { kind, package: pkg, parent: declaration, path, start: set })
      .match(DeclarationCardinality, { code: cardinality, package: pkg, path, start: declaration })
      .where(r.in(kind, valueSetKinds))
      .find({ cardinality, package: pkg, path, start });
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
 * processing reference that claims its declaration's table ("E1 derived") and a placed map response
 * or map response point ("Mapped response") is held to one of these. The content model holds a
 * declaration to at most one table of each slot (N7).
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
 * The tables of one kind a declaration holds.
 *
 * @param kind - The table's kind.
 * @returns The selection of {@link DeclarationTable}.
 */
const declarationTables = (kind: (typeof referencedTables)[number]) =>
  select(DeclarationTable, (t) => t.eq(t.kind, kind));

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
 * `mastery-value`, by its declaration's place: the two lexical forms, its {@link NormalMinimum}'s
 * and its {@link MasteryValue}'s, which `Mastery_range` orders (spec readings 9 and 149: each pair
 * judged where both have a value).
 */
export const MasteryFloor = derived(
  "MasteryFloor",
  query(QtiBase).rule((r) => {
    const { lexical: normalMinimum, package: pkg, path, start } = v(NormalMinimum, "minimum");
    const { lexical: masteryValue } = v(MasteryValue, "mastery");

    return r
      .match(NormalMinimum, { lexical: normalMinimum, package: pkg, path, start })
      .match(MasteryValue, { lexical: masteryValue, package: pkg, path, start })
      .find({ masteryValue, normalMinimum, package: pkg, path, start });
  }),
);

/**
 * Each outcome declaration that writes both a `mastery-value` and a `normal-maximum`, by its
 * declaration's place, as {@link MasteryFloor} holds the other pair: its {@link MasteryValue}'s and
 * its {@link NormalMaximum}'s lexical forms.
 */
export const MasteryCeiling = derived(
  "MasteryCeiling",
  query(QtiBase).rule((r) => {
    const { lexical: masteryValue, package: pkg, path, start } = v(MasteryValue, "mastery");
    const { lexical: normalMaximum } = v(NormalMaximum, "maximum");

    return r
      .match(MasteryValue, { lexical: masteryValue, package: pkg, path, start })
      .match(NormalMaximum, { lexical: normalMaximum, package: pkg, path, start })
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
 * State `Mastery_range` over a mastery value written and a normal minimum, written or the XSD's
 * default (readings 9 and 149): the minimum is no greater than the mastery value, each form read
 * collapsed, as `xs:double`'s whiteSpace `collapse` reads it (XML Schema Part 2 §4.3.6; reading 7:
 * an attribute the XSD types as `xs:double` is read as the XSD reads it), and ordered by
 * `doublesInOrder` (`#pantry/qti/declarations.ts`). The rows hold the attributes as written
 * (`Attribute.lexical`), so the check collapses each, and a guard over the collapse narrows it in
 * the parse's branch (grizzle `c899acca`).
 *
 * @param r - The row.
 * @returns The predicate.
 */
const floorCheck = (r: MasteryFloorRow) =>
  doublesInOrder(Compute.collapse(r.normalMinimum), Compute.collapse(r.masteryValue));

/**
 * State `Mastery_range` over a mastery value and a normal maximum both written, each read as
 * {@link floorCheck} reads the other pair.
 *
 * @param r - The row.
 * @returns The predicate.
 */
const ceilingCheck = (r: MasteryCeilingRow) =>
  doublesInOrder(Compute.collapse(r.masteryValue), Compute.collapse(r.normalMaximum));

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
 * - **E1 derived** and **Mapped response:** a reference's claim of its declaration's table, and a
 *   placed map response's or map response point's, names a table its declaration holds;
 * - **Lookup table cardinality:** a match or interpolation table's outcome is single, where it has a
 *   cardinality;
 * - **Mastery range** (C2, G-parse): the mastery value lies in the normal range, each pair judged
 *   where both have a value: written, or a normal minimum's XSD default (reading 149);
 * - **MappableBaseType:** a mapping's declaration is no record, where it has a cardinality, and its
 *   base type, where it has one, is in `MappableBaseType`;
 * - **Typed attribute value:** a map key, a table entry's target and a table's default are lexical
 *   forms of their declaration's base type, where it has one, written with no whitespace around
 *   them unless it is `string`;
 * - **Typed value:** each value's text is a lexical form of its base type, its declaration's or, a
 *   record's field's, its own, each value its node's string value, its set its parent and its
 *   declaration its grandparent;
 * - **E1 derived:** a normal minimum not written is the XSD's default (spec reading 149);
 * - **Record field key:** a set's fields are distinct by name;
 * - **Reserved type:** SCORE, MAXSCORE, PASSED and QTI_CONTEXT keep their specified types: a typed
 *   name has its type where it has a base type, QTI_CONTEXT is declared as a context, and, where it
 *   has a cardinality, a typed outcome name is no record and QTI_CONTEXT is one (reading 153);
 * - **Value cardinality:** a single variable's set holds one value, a record's set holds only fields,
 *   every value of it one, and a field stands only in a record's set, where its set's declaration
 *   has a cardinality; a value writes its field's two attributes both or neither
 *   (`#pantry/qti/declarations.ts`).
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
    check("Declaration_not_reserved", NamedDeclaration, (d) =>
      d.not(d.in(d.identifier, itemSessionVariables)),
    ),
  ],
  "E1 derived": [
    ...referencedTables.map((table) =>
      contained(
        on(tableClaims(table), "package", "path", "declaration"),
        on(declarationTables(table), "package", "path", "declaration"),
      ),
    ),
    check("E1_derived", NormalMinimum, (n) =>
      n.or(n.eq(n.written, true), n.eq(n.lexical, normalMinimumDefault)),
    ),
  ],
  "Lookup table cardinality": [
    check("Lookup_table_cardinality", LookupTableCardinality, (t) => t.eq(t.cardinality, "single")),
  ],
  MappableBaseType: [
    check("MappableBaseType", MappingCardinality, (m) => m.ne(m.cardinality, "record")),
    contained(on(MappingBaseType, "baseType"), on(MappableBaseType, "baseType")),
  ],
  "Mapped response": [
    contained(
      on(placedTableReaders("qti-map-response"), "package", "assembly", "declaration"),
      on(declarationTables("qti-mapping"), "package", "path", "declaration"),
    ),
    contained(
      on(placedTableReaders("qti-map-response-point"), "package", "assembly", "declaration"),
      on(declarationTables("qti-area-mapping"), "package", "path", "declaration"),
    ),
  ],
  "Mastery range": [
    check("Mastery_range", MasteryFloor, floorCheck),
    check("Mastery_range", MasteryCeiling, ceilingCheck),
  ],
  "Record field key": [key(on(SetFieldName, "package", "path", "set", "identifier"))],
  "Reserved type": [
    check("Reserved_type", TypedDeclarationName, (d) =>
      d.and(
        ...reservedBaseTypes.map((reserved) =>
          d.or(
            d.ne(d.declarationKind, reserved.kind),
            d.ne(d.identifier, reserved.identifier),
            d.eq(d.baseType, reserved.baseType),
          ),
        ),
      ),
    ),
    check("Reserved_type", NamedDeclaration, (d) =>
      d.or(
        d.ne(d.identifier, contextVariable.identifier),
        d.eq(d.declarationKind, contextVariable.kind),
      ),
    ),
    check("Reserved_type", DeclarationName, (d) =>
      d.and(
        ...reservedBaseTypes.map((reserved) =>
          d.or(
            d.ne(d.declarationKind, reserved.kind),
            d.ne(d.identifier, reserved.identifier),
            d.ne(d.cardinality, "record"),
          ),
        ),
        d.or(
          d.ne(d.identifier, contextVariable.identifier),
          d.eq(d.cardinality, contextVariable.cardinality),
        ),
      ),
    ),
  ],
  "Typed attribute value": [
    check("Typed_attribute_value", MapKeyType, (k) =>
      k.and(
        Compute.matches(k.key, BaseTypePattern.at("pattern", k.baseType)),
        k.or(k.eq(k.baseType, "string"), Compute.matches(k.key, exactValuePattern)),
      ),
    ),
    check("Typed_attribute_value", LookupValueType, (l) =>
      l.and(
        Compute.matches(l.value, BaseTypePattern.at("pattern", l.baseType)),
        l.or(l.eq(l.baseType, "string"), Compute.matches(l.value, exactValuePattern)),
      ),
    ),
  ],
  "Typed value": [
    check("Typed_value", TypedValueText, (t) =>
      t.or(
        t.eq(t.cardinality, "record"),
        t.in(t.baseType, unjudgedBaseTypes),
        Compute.matches(t.text, BaseTypePattern.at("pattern", t.baseType)),
      ),
    ),
    check("Typed_value", FieldValueText, (f) =>
      f.or(
        f.ne(f.cardinality, "record"),
        f.in(f.baseType, unjudgedBaseTypes),
        Compute.matches(f.text, BaseTypePattern.at("pattern", f.baseType)),
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
    check("Value_cardinality", FieldSetCardinality, (f) => f.eq(f.cardinality, "record")),
  ],
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const declarationOverlayRelations = [
  AreaMappingBaseType,
  AreaMappingCardinality,
  BaseTypeCardinality,
  DeclarationTable,
  FieldSetCardinality,
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
