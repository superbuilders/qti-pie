/**
 * The catalog overlays' rows (spec reading R9-a, `#pantry/qti/catalog.ts`): from one document's
 * view (`DocumentView` of `#pantry/import/fold.ts`), one `CatalogId` row per `qti-catalog`'s `id`,
 * its value, keyed by its element. A card's `support`, an entry's `default` and a reference's
 * token are each its attribute's `value` or `Idref` piece, which the database selects, so no row
 * here copies one (C18), and a reference's resolution in its document or under each instance of it
 * is a join the database reads, so no row here places one.
 *
 * {@link placedCatalogRowsOf} writes, over the whole package, an `AssembledCatalog` for each
 * binding of an assembly's ID table that a catalog owns (spec reading 117).
 *
 * The rows restate what the tree says and nothing else. The database proves every one of them
 * (`catalogLaws`, and the rules over the references, `catalogOverlayLaws`), so a row this builder
 * gets wrong is refused, never accepted.
 */
import type { Addition } from "@bjornpagen/grizzle";
import { governorOf } from "#pantry/import/fold.ts";
import type { DocumentView } from "#pantry/import/fold.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import { attributeValueOf } from "#pantry/import/names.ts";
import type { AssembledCatalog, CatalogId } from "#pantry/qti/catalog.ts";
import type { PlacedId } from "#pantry/qti/identity.ts";

/**
 * Where a document stands in its package, as this builder reads it beside the document's view: the
 * part of the importer's `DocumentPlace` (Q5.15) it needs.
 */
interface CatalogIds {
  /**
   * The package's name.
   */
  readonly package: Addition<typeof CatalogId>["package"];
  /**
   * The document's path in the package, its entry's.
   */
  readonly path: Addition<typeof CatalogId>["path"];
}

/**
 * A document's catalog rows, one keyed set per relation: each map from the text of a row's key in
 * its relation ({@link keyTextOf}), its element's `(package, path, start)`, to the row as its
 * writer writes it, so the rows of two documents of a package never meet at one key.
 */
export interface CatalogRows {
  readonly CatalogId: ReadonlyMap<string, Addition<typeof CatalogId>>;
}

/**
 * A package's catalogs' bindings of each assembly's ID table (spec reading 117), one keyed set per
 * relation.
 */
export interface PlacedCatalogRows {
  readonly AssembledCatalog: ReadonlyMap<string, Addition<typeof AssembledCatalog>>;
}

/**
 * Build the catalog overlays' rows of one document: a `CatalogId` for each `qti-catalog`'s `id`. A
 * document with no catalog gives no row.
 *
 * @param view - The document's view: its rows, and their folds under its context (spec reading
 *   117).
 * @param ids - Where it stands in its package.
 * @returns Every catalog relation's rows, each keyed by its relation's key.
 */
export const rowsOf = (view: DocumentView, ids: CatalogIds): CatalogRows => {
  const { rows } = view;
  const { package: pkg, path } = ids;
  const byStart = new Map(rows.nodes.map((node) => [node.start, node] as const));
  const catalogIds = new Map<string, Addition<typeof CatalogId>>();

  for (const { lexical, name, start } of rows.attributes) {
    const node = byStart.get(start);
    // A catalog's `id` is its ID, its value as the database's `IdValue` holds it: AL1 holds its
    // form to an NCName once collapsed where it is written (spec readings 152 and 156).
    if (node !== undefined && node.kind === "qti-catalog" && name === "id") {
      catalogIds.set(keyTextOf(pkg, path, start), {
        id: attributeValueOf(governorOf(node.kind, node.governs), name, lexical),
        owner: start,
        package: pkg,
        path,
        start,
      });
    }
  }

  return { CatalogId: catalogIds };
};

/**
 * Build a package's catalog bindings (spec reading 117): for each binding of an assembly's ID
 * table whose owner is a catalog, an `AssembledCatalog` row, one for each assembly and id.
 *
 * @param input - The package's rows the bindings read.
 * @param input.assembledIds - Every assembly's placed IDs ({@link placedIdRowsOf}'s `PlacedId`, in
 *   `#pantry/import/overlays/identity.ts`), each a binding of its assembly's ID table.
 * @param input.catalogs - Every document's catalogs ({@link rowsOf}'s `CatalogId`), whose elements
 *   own the ids that are catalog bindings.
 * @returns The rows.
 */
export const placedCatalogRowsOf = (input: {
  readonly assembledIds: Iterable<
    Pick<Addition<typeof PlacedId>, "assembly" | "id" | "instance" | "owner" | "package" | "path">
  >;
  readonly catalogs: Iterable<Addition<typeof CatalogId>>;
}): PlacedCatalogRows => {
  const catalogElements = new Set(
    [...input.catalogs].map((catalog) => keyTextOf(catalog.package, catalog.path, catalog.start)),
  );
  const bound = new Map<string, Addition<typeof AssembledCatalog>>();
  for (const { assembly, id, owner, package: pkg, path } of input.assembledIds) {
    if (catalogElements.has(keyTextOf(pkg, path, owner))) {
      bound.set(keyTextOf(pkg, assembly, id), { assembly, id, owner, package: pkg, path });
    }
  }

  return { AssembledCatalog: bound };
};
