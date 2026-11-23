/**
 * The HTML overlays' rules over their node, their scope and their attribute
 * (`#pantry/qti/html.ts`): a {@link TableScope} row's table is read up the tree, which needs the
 * element's kind and parent, and only `Node` holds them; a cell's or a header's table is its
 * scope's, never a copy; a header's value is its ID's, which `IdValue` reads where it stands; and a
 * cell's `headers` parse is held to the attribute's lexical form where it stands, which no overlay
 * copies (C18).
 */
import { check, contained, derived, on, query, select, v } from "@bjornpagen/grizzle";
import { QtiBase } from "#pantry/qti/base.ts";
import {
  CellHeaders,
  HeaderToken,
  TableHeader,
  TableScope,
  tabledHeaders,
} from "#pantry/qti/html.ts";
import { IdValue, listForms, spelledByTokens } from "#pantry/qti/names.ts";
import { documentStart, Node } from "#pantry/qti/node.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * Each table scope beside its element's kind and parent, by the element's place.
 */
const TableScopeNode = derived(
  "TableScopeNode",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, table } = v(TableScope, "scope");
    const { kind, parent } = v(Node, "node");

    return r
      .match(TableScope, { package: pkg, path, start, table })
      .match(Node, { kind, package: pkg, parent, path, start })
      .find({ kind, package: pkg, parent, path, start, table });
  }),
);

/**
 * Each token of a cell's `headers` beside its cell's table, by the cell's place and the token.
 */
const CellToken = derived(
  "CellToken",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, token } = v(HeaderToken, "token");
    const { table } = v(TableScope, "scope");

    return r
      .match(HeaderToken, { package: pkg, path, start, token })
      .match(TableScope, { package: pkg, path, start, table })
      .find({ package: pkg, path, start, table, token });
  }),
);

/**
 * Each cell's `headers` parse beside the attribute's lexical form, by the cell's place
 * ({@link listForms}).
 */
const CellHeadersForm = listForms("CellHeadersForm", CellHeaders, "headers");

/**
 * The scopes whose table is read from the parent: every element but a `table` and a document's
 * root.
 */
const inheritedScopes = select(TableScopeNode, (s) =>
  s.and(s.ne(s.kind, "table"), s.ne(s.parent, documentStart)),
);

/**
 * The HTML overlays' rules over their node and their scope, each named by its law:
 *
 * - **"DocumentId key":** one header per (table, id) among those in a table;
 * - **"E1 derived":** a `table` is its own table, a root that is no `table` the document's, and every
 *   other element's table its parent's; a header's `id` and `owner` are its ID's ({@link IdValue});
 *   and a cell's `headers` tokens concatenate to its lexical form, or there are none and the form
 *   is whitespace alone ({@link spelledByTokens});
 * - **"Table headers"** (reading 126, info §5.140.1): each token of a cell's `headers` is the `id` of
 *   a `th` taking part in the cell's table. It refuses a token that names no ID, one that names a
 *   `td` or another element, and one that names a `th` of another table, nested or enclosing; a
 *   cell no `table` holds has its document node as its table, which no header in a table has, so
 *   every token it writes is refused.
 */
export const htmlOverlayLawsByName = {
  "E1 derived": declared("E1 derived", [
    check("E1_derived", TableScopeNode, (s) =>
      s.or(
        s.and(s.eq(s.kind, "table"), s.eq(s.table, s.start)),
        s.and(s.ne(s.kind, "table"), s.eq(s.parent, documentStart), s.eq(s.table, documentStart)),
        s.and(s.ne(s.kind, "table"), s.ne(s.parent, documentStart)),
      ),
    ),
    contained(
      on(inheritedScopes, "package", "path", "parent", "table"),
      on(TableScope, "package", "path", "start", "table"),
    ),
    contained(
      on(TableHeader, "package", "path", "start", "id", "owner"),
      on(IdValue, "package", "path", "start", "id", "owner"),
    ),
    spelledByTokens(CellHeadersForm),
  ]),
  "Table headers": declared("Table headers", [
    contained(
      on(CellToken, "package", "path", "table", "token"),
      on(tabledHeaders, "package", "path", "table", "id"),
    ),
  ]),
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const htmlOverlayRelations = [CellHeadersForm, CellToken, TableScopeNode] as const;

/**
 * The rules of this module, {@link htmlOverlayLawsByName} flattened.
 */
export const htmlOverlayLaws = Object.values(htmlOverlayLawsByName).flat();
