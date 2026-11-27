/**
 * The HTML laws over views (`#pantry/qti/html.ts`, spec reading `cell-headers`): a cell's `headers`
 * tokens ({@link HeaderToken}), its table ({@link CellTable}) and each tabled `th`'s `id` ({@link
 * TableHeader}) are projections of `Attribute` and `Node` no row copies (C18), so the laws over
 * them are rules over a query.
 */
import { contained, derived, key, on, query, v } from "@bjornpagen/grizzle";
import { Attribute } from "#pantry/qti/attributes.ts";
import { CellTable, HeaderToken, QtiViews } from "#pantry/qti/names.ts";
import { documentStart } from "#pantry/qti/node.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * Each `th` that carries an ID and takes part in a table, by the `th`'s place, beside that table,
 * its {@link CellTable}'s: its `id`, the attribute's `value` (an `xs:ID` collapsed, the ID's value
 * as `IdValue` holds it), and `idDigest`, that value's SHA-256, by which "DocumentId key" keys a
 * table's headers and "Table headers" resolves a cell's tokens among them, since XML Schema bounds
 * no `xs:ID`. AL1 holds the form to an NCName once collapsed where it is written (spec readings
 * `ncname-names` and `id-is-ncname`). A `th` no `table` holds is a header of no table, which no
 * token can name.
 */
export const TableHeader = derived(
  "TableHeader",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, start, value, valueDigest } = v(Attribute, "attribute");
    const { table } = v(CellTable, "scope");

    return r
      .match(Attribute, { kind: "th", name: "id", package: pkg, path, start, value, valueDigest })
      .match(CellTable, { package: pkg, path, start, table })
      .where(r.ne(table, documentStart))
      .find({ id: value, idDigest: valueDigest, package: pkg, path, start, table });
  }),
);

/**
 * Each token of a cell's `headers` beside its cell's table, by the cell's place and the token's
 * SHA-256.
 */
const CellToken = derived(
  "CellToken",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, start, tokenDigest } = v(HeaderToken, "token");
    const { table } = v(CellTable, "scope");

    return r
      .match(HeaderToken, { package: pkg, path, start, tokenDigest })
      .match(CellTable, { package: pkg, path, start, table })
      .find({ package: pkg, path, start, table, tokenDigest });
  }),
);

/**
 * The HTML laws over the views, each named by its law:
 *
 * - **"DocumentId key":** one header per (table, id) among those in a table, which an ID held twice
 *   in a document already breaks;
 * - **"Table headers"** (reading `cell-headers`, info §5.140.1): a cell's tokens are unique, and each
 *   token of a cell's `headers` is the `id` of a `th` taking part in the cell's table. It refuses a
 *   token that names no ID, one that names a `td` or another element, and one that names a `th` of
 *   another table, nested or enclosing; a cell no `table` holds has its document node as its table,
 *   which no header in a table has, so every token it writes is refused.
 */
export const htmlOverlayLawsByName = {
  "DocumentId key": declared("DocumentId key", [
    key(on(TableHeader, "package", "path", "table", "idDigest")),
  ]),
  "Table headers": declared("Table headers", [
    key(on(HeaderToken, "package", "path", "start", "tokenDigest")),
    contained(
      on(CellToken, "package", "path", "table", "tokenDigest"),
      on(TableHeader, "package", "path", "table", "idDigest"),
    ),
  ]),
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const htmlOverlayRelations = [CellToken, TableHeader] as const;

/**
 * The rules of this module, {@link htmlOverlayLawsByName} flattened.
 */
export const htmlOverlayLaws = Object.values(htmlOverlayLawsByName).flat();
