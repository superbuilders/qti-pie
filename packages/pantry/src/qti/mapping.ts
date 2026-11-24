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
 * The text those laws read is two views of `Attribute`, each keyed by its element's place,
 * `(package, path, start)`, the key `Node` holds it by, and stored by grizzle, which keeps each
 * equal to its definition (shared views of the level `QtiViews`, `#pantry/qti/names.ts`):
 *
 * - {@link MapKey}, each `qti-map-entry`'s `map-key` (C18), one row per entry, so two entries with
 *   one key are two facts, in the order the mapping lists them, and never one fact that set
 *   semantics collapses (rows-first §0);
 * - {@link LookupValue}, each table entry's `target-value` and each table's `default-value`.
 *
 * The laws, by the rule each states, all rules over a query:
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
 * law compares them.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Mapping | QTI 3.0 information model, §5.88 Mapping}
 */
import { derived, query, v } from "@bjornpagen/grizzle";
import { Attribute } from "#pantry/qti/attributes.ts";
import { QtiBase } from "#pantry/qti/base.ts";

/**
 * The lookup tables' kinds, each a child of its outcome declaration.
 */
export const lookupTableKinds = ["qti-interpolation-table", "qti-match-table"] as const;

/**
 * The lookup table entries' kinds, each a child of its table.
 */
export const lookupEntryKinds = ["qti-interpolation-table-entry", "qti-match-table-entry"] as const;

/**
 * Each map entry's key, by its `qti-map-entry` element's place: its `map-key`'s `value`, an
 * `xs:normalizedString`, each tab, line feed and carriage return a space (the ASI XSD's `map-key`;
 * XML Schema 1.0 Part 2, §4.3.6; spec reading 7). An entry that writes no `map-key` has none, and
 * AL3 refuses the element. A key written twice is two rows, one per entry (reading 165). How a
 * response meets the key (reading 98, §7.21.3: case-folded for a string mapping unless the entry's
 * `case-sensitive` is true) is the scorer's, which reads the entry's `case-sensitive` from
 * `Attribute`; the database states nothing of it. The base type it is read in is its mapping's
 * declaration's, its node's grandparent's, read through `Node` (`MapKeyType`,
 * `#pantry/qti/overlay-queries/declaration.ts`).
 */
export const MapKey = derived.stored(
  "MapKey",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value } = v(Attribute, "attribute");

    return r
      .match(Attribute, {
        kind: "qti-map-entry",
        name: "map-key",
        package: pkg,
        path,
        start,
        value,
      })
      .find({ key: value, package: pkg, path, start });
  }),
);

/**
 * Each lookup table's typed attribute value, by the place of the element that carries it and the
 * attribute's name: a `qti-match-table-entry`'s or `qti-interpolation-table-entry`'s
 * `target-value`, or a `qti-match-table`'s or `qti-interpolation-table`'s `default-value`, as
 * written, each whatever its table's declaration spells (spec readings 157 and 158): a law that
 * reads the declaration's cardinality or base type judges it where the declaration has one. Its
 * table is its node, a table's default, or its node's parent, an entry's target, and the base type
 * it is read in the table's declaration's, read through `Node` (`LookupValueType`,
 * `#pantry/qti/overlay-queries/declaration.ts`).
 */
export const LookupValue = derived.stored(
  "LookupValue",
  query(QtiBase).rule((r) => {
    const { kind, lexical, name, package: pkg, path, start } = v(Attribute, "attribute");

    return r
      .match(Attribute, { kind, lexical, name, package: pkg, path, start })
      .where(
        r.or(
          r.and(r.eq(name, "target-value"), r.in(kind, lookupEntryKinds)),
          r.and(r.eq(name, "default-value"), r.in(kind, lookupTableKinds)),
        ),
      )
      .find({ name, package: pkg, path, start, value: lexical });
  }),
);
