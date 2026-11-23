/**
 * The HTML overlays' rows (spec reading 126, §C's `rowsOf`): from one document's view
 * (`DocumentView` of `#pantry/import/fold.ts`), the rows of every relation `#pantry/qti/html.ts`
 * declares, each a keyed set.
 *
 * The rows restate what the tree says and nothing else: each table cell's `headers` split into its
 * tokens; each `th`'s `id`, its value as the database's `IdValue` holds it;
 * and each element on the way from those cells up to the table they take part in. The database
 * proves every one of them (`htmlLaws`), so a row this builder gets wrong is refused, never
 * accepted. Readings 124 and 125 read `Node` and `Attribute` alone, so they have no rows here.
 */
import type { Addition } from "@bjornpagen/grizzle";
import { Option } from "effect";
import { governorOf, lexicalOf } from "#pantry/import/fold.ts";
import type { DocumentView } from "#pantry/import/fold.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import { attributeValueOf } from "#pantry/import/names.ts";
import { tokensOf } from "#pantry/import/pieces.ts";
import type { Place } from "#pantry/import/write.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { NodeRow } from "#pantry/model/xdm.ts";
import type { CellHeaders, HeaderToken, TableHeader, TableScope } from "#pantry/qti/html.ts";
import { cellKinds } from "#pantry/vocab/terms/html.ts";

/**
 * One token of a cell's `headers` as its cell's family nests it: without the cell's `package`,
 * `path` and `start` the nesting supplies, nor the `at` the family draws.
 */
type HeaderTokenInsert = Omit<Addition<typeof HeaderToken>, "package" | "path" | "start">;

/**
 * A cell's `headers`, with its tokens nested at its count field.
 */
type CellHeadersRow = Addition<typeof CellHeaders> & {
  readonly tokens: readonly HeaderTokenInsert[];
};

/**
 * A document's HTML rows, one keyed set per relation: each map from the text of a row's key, its
 * element's `(package, path, start)` as a JSON array, to the row as its writer writes it.
 */
export interface HtmlRows {
  readonly CellHeaders: ReadonlyMap<string, CellHeadersRow>;
  readonly TableHeader: ReadonlyMap<string, Addition<typeof TableHeader>>;
  readonly TableScope: ReadonlyMap<string, Addition<typeof TableScope>>;
}

/**
 * The table cell kinds, whose `headers` reading 126 reads.
 */
const cells: ReadonlySet<string> = new Set(cellKinds);

/**
 * The document node's position in its document: the table of an element no `table` holds, and the
 * parent a document's root element names.
 */
const documentNode = 0n;

/**
 * The walk from a cell up to the table it takes part in, the cell first, and the position of the
 * table it ends at: a `table`'s, or the document node's where no `table` holds the cell.
 */
interface TableWalk {
  readonly table: bigint;
  readonly walk: readonly NodeRow<Composed>[];
}

/**
 * Walk from an element up to its nearest `table`: the element, then each parent, ending at the
 * first `table` or at the document's root.
 *
 * @param byStart - The document's nodes by position.
 * @param element - The element.
 * @returns The walk, the element first, and its table.
 * @throws {Error} When an element on the walk has a parent that is neither the document node nor
 *   one of the document's nodes, which `flatten` rules out: a defect of the caller, never of the
 *   document.
 */
const tableWalkOf = (
  byStart: ReadonlyMap<bigint, NodeRow<Composed>>,
  element: NodeRow<Composed>,
): TableWalk => {
  const walk: NodeRow<Composed>[] = [];
  for (let at = element; ;) {
    walk.push(at);
    if (at.kind === "table") {
      return { table: at.start, walk };
    }

    if (at.parent === documentNode) {
      return { table: documentNode, walk };
    }

    const parent = byStart.get(at.parent);
    if (parent === undefined) {
      throw new Error(
        `The node at ${String(at.start)} names a parent at ${String(at.parent)}, which is not among its document's nodes, but flatten writes every parent. Walk the rows of the document the node is flattened in.`,
      );
    }

    at = parent;
  }
};

/**
 * Build a document's HTML rows.
 *
 * Each cell that writes `headers` has its {@link CellHeadersRow}, and each `th` that writes an `id`
 * its `TableHeader`, the ID's value its lexical form normalized in its domain's class
 * ({@link attributeValueOf}), an `xs:ID`'s `collapse`, as the database's `IdValue` holds it: AL1
 * holds the form to an NCName once collapsed where it is written (spec readings 152 and 156). Each
 * element on the walk up from either to its nearest `table` has its `TableScope`. A document with
 * no such cell gives no row.
 *
 * @param view - The document's view, whose rows it reads.
 * @param ids - Where it stands in its package: its `package` and `path`, every row's.
 * @returns Every HTML relation's rows.
 */
export const rowsOf = (view: DocumentView, ids: Place): HtmlRows => {
  const { rows } = view;
  const place = { package: ids.package, path: ids.path };
  const scopes = new Map<string, Addition<typeof TableScope>>();
  const headers = new Map<string, CellHeadersRow>();
  const headerIds = new Map<string, Addition<typeof TableHeader>>();
  const cellNodes = rows.nodes.filter(({ kind }) => cells.has(kind));
  if (cellNodes.length === 0) {
    return { CellHeaders: headers, TableHeader: headerIds, TableScope: scopes };
  }

  const byStart = new Map(rows.nodes.map((node) => [node.start, node] as const));
  const scopeOf = (cell: NodeRow<Composed>): void => {
    const { table, walk } = tableWalkOf(byStart, cell);
    for (const node of walk) {
      scopes.set(keyTextOf(place.package, place.path, node.start), {
        ...place,
        start: node.start,
        table,
      });
    }
  };

  for (const cell of cellNodes) {
    for (const lexical of Option.toArray(lexicalOf(view, cell.start, "headers"))) {
      scopeOf(cell);
      headers.set(keyTextOf(place.package, place.path, cell.start), {
        ...place,
        start: cell.start,
        tokens: tokensOf(lexical),
      });
    }

    for (const id of cell.kind === "th" ? Option.toArray(lexicalOf(view, cell.start, "id")) : []) {
      scopeOf(cell);
      headerIds.set(keyTextOf(place.package, place.path, cell.start), {
        ...place,
        id: attributeValueOf(governorOf(cell.kind, cell.governs), "id", id),
        owner: cell.start,
        start: cell.start,
        table: tableWalkOf(byStart, cell).table,
      });
    }
  }

  return { CellHeaders: headers, TableHeader: headerIds, TableScope: scopes };
};
