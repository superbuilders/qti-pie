/**
 * The mapping overlays' rows (plan §1.7 O5, §C's `rowsOf`): from one document's view
 * (`DocumentView` of `#pantry/import/fold.ts`) and its place in its package, the rows of every
 * relation `#pantry/qti/mapping.ts` declares, each relation's rows a keyed set by its element's
 * place, `(package, path, start)`.
 *
 * The rows restate what the tree says and nothing else: each map entry's `map-key`, its value, an
 * `xs:normalizedString`'s (spec reading 7), and each lookup table's typed attribute values, as
 * written, each an `xs:string`. A table's declaration, cardinality and base type are
 * its node's parent's typed rows, which every law over them reads through `Node`
 * (`#pantry/qti/overlay-queries/declaration.ts`), so no row here copies them. The database proves
 * every row (`mappingLaws`), so a row this builder gets wrong is refused, never accepted.
 */
import type { Addition } from "@bjornpagen/grizzle";
import { Option } from "effect";
import { foldAt } from "#pantry/import/fold.ts";
import type { DocumentView } from "#pantry/import/fold.ts";
import { valueAt } from "#pantry/import/names.ts";
import { keyTextOf } from "#pantry/import/overlays/declarations.ts";
import type { Place } from "#pantry/import/overlays/declarations.ts";
import type { LookupValue, MapKey } from "#pantry/qti/mapping.ts";

/**
 * A document's mapping rows, one keyed set per relation: each map from the text of a row's key,
 * its element's place ({@link keyTextOf}), to the row as its writer writes it.
 */
export interface MappingRows {
  readonly LookupValue: ReadonlyMap<string, Addition<typeof LookupValue>>;
  readonly MapKey: ReadonlyMap<string, Addition<typeof MapKey>>;
}

/**
 * The elements whose typed attribute value a lookup table holds, each with that attribute: a table
 * entry's `target-value` and a table's own `default-value`.
 */
const lookupAttributeOf: ReadonlyMap<string, string> = new Map([
  ["qti-interpolation-table", "default-value"],
  ["qti-interpolation-table-entry", "target-value"],
  ["qti-match-table", "default-value"],
  ["qti-match-table-entry", "target-value"],
]);

/**
 * Build the mapping overlays' rows of one document.
 *
 * A map entry with no `map-key` has no `MapKey` row, and AL3 refuses the element. Its key is the
 * attribute's value, `Attribute.value`: an `xs:normalizedString`, each tab, line feed and carriage
 * return a space (the ASI XSD's `map-key`; XML Schema 1.0 Part 2, §4.3.6). A key written twice is
 * two `MapKey` rows, one per entry (reading 165). A table entry with a `target-value`,
 * and a table with a `default-value`, has its `LookupValue` row. Each is written whatever its
 * table's declaration spells (spec readings 157 and 158): a law that reads the declaration's
 * cardinality or base type judges it where the declaration has one.
 *
 * @param view - The document's view: its rows, and each node's kind in its fold.
 * @param place - Where the document stands in its package, the key every row holds.
 * @returns Every overlay's rows.
 */
export const rowsOf = (view: DocumentView, place: Place): MappingRows => {
  const keyOf = (start: bigint): string => keyTextOf(place, start);
  const mapKeys = new Map<string, Addition<typeof MapKey>>();
  const lookupValues = new Map<string, Addition<typeof LookupValue>>();

  for (const node of view.rows.nodes) {
    if (node.kind === "qti-map-entry") {
      for (const key of Option.toArray(valueAt(view, node, "map-key"))) {
        const row = { package: place.package, path: place.path, start: node.start };
        mapKeys.set(keyOf(node.start), { ...row, key });
      }
    }
  }

  for (const { lexical, name, start } of view.rows.attributes) {
    const { kind } = foldAt(view.folds, start);
    const row = { package: place.package, path: place.path, start };
    if (lookupAttributeOf.get(kind) === name) {
      lookupValues.set(keyOf(start), { ...row, value: lexical });
    }
  }

  return { LookupValue: lookupValues, MapKey: mapKeys };
};
