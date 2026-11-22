/**
 * The response mappings and the lookup tables (plan §1.7 O5; the W5 amendment's C2, C17 and C18,
 * with the tier-1 addendum's G-parse and "Text in keys" and the orchestrator's rulings of
 * 2026-11-06).
 *
 * A mapping (`qti-mapping`), an area mapping (`qti-area-mapping`) and a lookup table
 * (`qti-match-table`, `qti-interpolation-table`) are their nodes, with nothing of their own to
 * store: each is a child of its declaration's node, whose cardinality and base type are the
 * declaration's typed rows (decision S3: no copies). Every law over a table's declaration reads
 * `Node` beside `DeclarationCardinality` or `DeclarationBaseType`, a rule over a query
 * (`#pantry/qti/overlay-queries/declaration.ts`): a mapping, an area mapping and a lookup table
 * beside its declaration's cardinality, a mapping and an area mapping beside its base type, and a
 * map key and a lookup value beside the base type it is read in.
 *
 * Two overlays hold the text the laws read, each a flat row keyed by its element's place,
 * `(package, path, start)`, the key `Node` holds it by:
 *
 * - {@link MapKey} (`qti-map-entry`) copies its entry's `map-key` from `Attribute` (C18), one row per
 *   entry, so two entries with one key are two facts, in the order the mapping lists them, and
 *   never one fact that set semantics collapses (rows-first §0);
 * - {@link LookupValue} copies each table entry's `target-value` and each table's `default-value`.
 *
 * A map key and a lookup value are held to no bound of QTI's, a string mapping's expected answer
 * being of any length, but PostgreSQL's ({@link matchedText}): no key holds either, and a
 * rule over a query holds each copy to its source (`#pantry/qti/queries.ts`, "Mapping overlay").
 *
 * The laws, by the rule each states, all rules over a query but the copies' own:
 *
 * - **`mapping-base-type`** (reading 78): a mapping is no record's ("cannot be applied to variables
 *   of record cardinality", information model §2.11.1.5), and its base type is in
 *   `MappableBaseType`, so `file` and `duration` are refused; an area mapping is no record's, and
 *   its base type is `point` (information model §5.5, "a mapping from a source set of point
 *   values"). A record has no base type, so its mapping is judged by its cardinality alone, where
 *   the declaration has one: a record declaration holds no mapping and no area mapping.
 * - **Map keys may repeat** (reading 165): QTI bans no repeat, neither its XSD, which holds no
 *   `xs:unique` or `xs:key`, nor §5.88.4, which says each entry "maps a single value from the
 *   source set onto a single float", and the first entry the mapping lists that matches a value
 *   gives its value, so a repeated key, its case or its spelling included, is a lawful entry that a
 *   value an earlier entry matches never reaches.
 * - **Lookup tables are of single outcomes** (§4.5.13: a lookup table maps a source value "to a
 *   single outcome value in the declared value set").
 * - **Typed attribute values** (`attribute-lexical`, readings 7 and 8): a map key, a table entry's
 *   target and a table's default are lexical forms of their base type, `BaseTypePattern`'s
 *   (`#pantry/qti/expression-types.ts`, the one source `qti-value` and `qti-base-value` are judged
 *   by), read as written for `string` and after XML Schema's `collapse` for every other base type,
 *   whose simple type fixes that whitespace facet (reading 7).
 *
 * A string's, identifier's and URI's value is its lexical form, whitespace included (reading 7), so
 * the lexical key is their typed key. A boolean's lexical forms are `xs:boolean`'s, `1` and `true`
 * one value and `0` and `false` another (reading 34), and map keys may repeat (reading 165), so no
 * law compares them. Every check is named by its oracle law with spaces written as underscores.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Mapping | QTI 3.0 information model, §5.88 Mapping}
 */
import { contained, key, law, on, relation, select } from "@bjornpagen/grizzle";

import { Attribute, namedOn } from "#pantry/qti/attributes.ts";
import { EntryPath, matchedText, PackageName } from "#pantry/qti/limits.ts";
import { Node } from "#pantry/qti/node.ts";
import { declared, entryOf, natural } from "#pantry/qti/law-entries.ts";

/**
 * A map entry's overlay, keyed by its `qti-map-entry` element's place: its `map-key` as written.
 * How a response meets the key (reading 98, §7.21.3: case-folded for a string mapping unless the
 * entry's `case-sensitive` is true) is the scorer's, which reads the entry's `case-sensitive` from
 * `Attribute`; the database states nothing of it. The base type it is read in is its mapping's
 * declaration's, its node's grandparent's, read through `Node` (`MapKeyType`,
 * `#pantry/qti/overlay-queries/declaration.ts`).
 */
export const MapKey = law(
  entryOf("Mapping overlay"),
  relation(
    "MapKey",
    {
      key: matchedText,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * A lookup table's typed attribute value, keyed by the place of the element that carries it: a
 * `qti-match-table-entry`'s or `qti-interpolation-table-entry`'s `target-value`, or a
 * `qti-match-table`'s or `qti-interpolation-table`'s `default-value`, as written. Its table is its
 * node, a table's default, or its node's parent, an entry's target, and the base type it is read in
 * the table's declaration's, read through `Node` (`LookupValueType`,
 * `#pantry/qti/overlay-queries/declaration.ts`).
 *
 * The value is copied (C18) because `Typed_attribute_value` reads it beside its declaration's base
 * type (reading 8). QTI bounds no value, so it is held to no bound of QTI's but PostgreSQL's regex
 * limit ({@link matchedText}, grizzle's `regexTextMaxBytes`), and no key holds it, its copy
 * held to its attribute by a rule over a query (`#pantry/qti/queries.ts`, "Mapping overlay").
 */
export const LookupValue = law(
  entryOf("Mapping overlay"),
  relation(
    "LookupValue",
    {
      package: PackageName,
      path: EntryPath,
      start: natural,
      value: matchedText,
    },
    ["package", "path", "start"],
  ),
);

/**
 * The lookup tables' kinds, each a child of its outcome declaration.
 */
export const lookupTableKinds = ["qti-interpolation-table", "qti-match-table"] as const;

/**
 * The lookup table entries' kinds, each a child of its table.
 */
export const lookupEntryKinds = ["qti-interpolation-table-entry", "qti-match-table-entry"] as const;

/**
 * The map entries, a constant selection: the containment into it references the one
 * `UNIQUE (package, path, start, kind)` on `Node` the document layer's arms share.
 */
const mapEntries = select(Node, (n) => n.eq(n.kind, "qti-map-entry"));

/**
 * The `map-key` of each `qti-map-entry`: the source of {@link MapKey}'s copy (C18), keyed at its
 * element's place by `Attribute`'s key, `(package, path, start, name)`, since it fixes the name,
 * whose index over the selection's place serves the copy's reverse probe, so no index holds the
 * attribute's lexical form (the addendum's "Text in keys").
 */
const mapKeyAttributes = select(Attribute, (a) =>
  a.and(a.eq(a.name, "map-key"), a.eq(a.kind, "qti-map-entry")),
);

/**
 * The lookup tables' typed attribute values: each table entry's `target-value` and each table's
 * `default-value`, the source of {@link LookupValue}'s copy, beside its key (C18; AL2 makes it
 * hold). It states a key of its own: its two names lie under an `or`, so no conjunct fixes `name`,
 * and `Attribute`'s key, `(package, path, start, name)`, keys no containment into it at its
 * element's place alone.
 */
const lookupAttributes = select(Attribute, (a) =>
  a.or(
    namedOn(a, "target-value", ["qti-match-table-entry", "qti-interpolation-table-entry"]),
    namedOn(a, "default-value", ["qti-match-table", "qti-interpolation-table"]),
  ),
);

/**
 * Every statement over the mapping overlays' own rows, each named by its oracle law:
 *
 * - **the overlays:** a map key names a map entry and every entry's `map-key` has its copy, and a
 *   lookup value stands exactly where its element writes its typed attribute value, its copy's text
 *   held to its attribute by a rule over a query (`#pantry/qti/queries.ts`);
 * - **map keys:** under no key, a key may repeat (reading 165).
 *
 * Every law over a table's declaration, `mapping-base-type`, `Lookup_table_cardinality` and
 * `Typed_attribute_value`, reads the table's node beside the declaration's typed rows, a rule over
 * a query (`#pantry/qti/overlay-queries/declaration.ts`), stated there under the same names.
 */
export const mappingLawsByName = {
  "DocumentId key": declared("DocumentId key", [
    key(on(lookupAttributes, "package", "path", "start")),
  ]),
  "Mapping overlay": declared("Mapping overlay", [
    contained(on(MapKey, "package", "path", "start"), on(mapEntries, "package", "path", "start")),
    contained(
      on(mapKeyAttributes, "package", "path", "start"),
      on(MapKey, "package", "path", "start"),
    ),
    contained(
      on(lookupAttributes, "package", "path", "start"),
      on(LookupValue, "package", "path", "start"),
    ),
    contained(
      on(LookupValue, "package", "path", "start"),
      on(lookupAttributes, "package", "path", "start"),
    ),
  ]),
} as const;

/**
 * {@link mappingLawsByName}'s statements in one list, the module's laws as the schema composes them.
 */
export const mappingLaws = Object.values(mappingLawsByName).flat();

/**
 * `mapping.ts`'s relations: each map entry's key and each lookup table's typed values.
 */
export const mappingRelations = [LookupValue, MapKey] as const;
