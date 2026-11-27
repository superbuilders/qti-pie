/**
 * The MathML align overlay's rows (spec reading `mathml-validity`, §C's `rowsOf`): from one
 * document's view (`DocumentView` of `#pantry/import/fold.ts`), the rows of every relation
 * `#pantry/qti/mathml-align.ts` declares.
 *
 * - **`MathAction`**, one row for every `m:maction`: its element rank and element count, the lexical
 *   form of its `selection` (empty where it writes none), that form collapsed, and the integer it
 *   reads as: 1 where none is written, the value where the collapsed form is `xs:integer`'s within
 *   the signed 64-bit range, 0 for any other form and for a negative integer, which no child
 *   numbers (so a non-integer or negative selection is refused under "MathML maction selection",
 *   where the oracle skips it: a difference of the law's name only, the document is refused either
 *   way).
 * - **`MathCell`**, one row for every `m:mtd`; the counts and the greatest start are drawn by the
 *   database from the group and leaf families.
 * - **`MathAlignScope`**, one row for every `m:mtd`, the root of its cell's scope (open, its own
 *   cell), and for every element below a cell, in the cell nearest above it. An element below a
 *   cell takes its cell, parent kind, `received` state and `inherited` direction from its parent's
 *   row, its `chosen` index from a parent `maction`, and derives the rest as the schema states: its
 *   state (unjudged under an `maction` but at the selected child, else what it received), its
 *   direction and what it passes on. An element outside every cell has no row.
 * - **`MathAlignGroup`**, one row for every `m:maligngroup` whose state is `open`.
 * - **`CellLeaf`**, one row for every complete element of a cell, an element with no element child,
 *   in document order within its cell, nested in its cell's `MathCell` row as `leaves`, which the
 *   database numbers by the order they are nested in. An `m:mtd` is no leaf: an empty cell nested
 *   in another is its own cell with no leaf, not a leaf of the outer one, as the oracle's
 *   `contentOfCell` (`#pantry/test/oracle.ts`) reads it too.
 *
 * A direction is the `dir` an element writes where its value is `ltr` or `rtl`, and else the one
 * its parent holds, except that an `m:math` that writes neither holds `ltr` (MathML 3 §2.2.1 and
 * §3.1.5.1, reading `mathml-direction`). A `dir` of any other form, HTML's `auto` among them, has
 * no `AlignDirection`, so the element changes no direction. A cell's root takes the direction of
 * the nearest ancestor up to its `m:math` that writes `ltr` or `rtl`, else `ltr`, the host's
 * statement (audit items 1 and 2). An HTML ancestor's `dir` is not read. No row copies a `dir`: the
 * database reads each scoped element's own from the attribute where it stands (C18).
 *
 * The rows are built in one pass over the nodes in document order, each parent's before its
 * children's, appending to its lists in place, so a document with one element of many children
 * costs time linear in its nodes (decision 357).
 */
import { regex } from "arkregex";
import type { Addition } from "@bjornpagen/grizzle";
import { Option } from "effect";
import { foldAt, governorOf, lexicalOf } from "#pantry/import/fold.ts";
import type { AttributeIndex, DocumentView, Folds } from "#pantry/import/fold.ts";
import { attributeValueOf, valueAt } from "#pantry/import/names.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import { nonElements } from "#pantry/import/overlays/mathml-tree.ts";
import type { Place } from "#pantry/qti/schema.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { NodeRow } from "#pantry/model/xdm.ts";
import type {
  CellLeaf,
  MathAction,
  MathAlignGroup,
  MathAlignScope,
  MathCell,
} from "#pantry/qti/mathml-align.ts";
import { integerForm } from "#pantry/qti/limits.ts";

/**
 * One complete element of a cell as its cell's family nests it: without the group the nesting
 * supplies (`package`, `path` and `cell`, its cell's key), nor the `at` the family draws.
 */
type CellLeafInsert = Omit<Addition<typeof CellLeaf>, "cell" | "package" | "path">;

/**
 * A cell's row, with its leaves nested at its count field, in document order.
 */
type MathCellRow = Omit<Addition<typeof MathCell>, "leaves"> & {
  readonly leaves: readonly CellLeafInsert[];
};

/**
 * A document's align rows, one keyed set per relation, each keyed by its node's
 * `(package, path, start)` ({@link keyTextOf}).
 */
export interface MathmlAlignRows {
  readonly MathAction: ReadonlyMap<string, Addition<typeof MathAction>>;
  readonly MathAlignGroup: ReadonlyMap<string, Addition<typeof MathAlignGroup>>;
  readonly MathAlignScope: ReadonlyMap<string, Addition<typeof MathAlignScope>>;
  readonly MathCell: ReadonlyMap<string, MathCellRow>;
}

/**
 * A direction a `dir` takes.
 */
type Direction = "ltr" | "rtl";

/**
 * Where an element stands in its cell.
 */
type State = "closed" | "open" | "unjudged";

/**
 * What a scope row passes to the rows of its children.
 */
interface Scope {
  /**
   * The nearest `m:mtd`'s `start`.
   */
  readonly cell: bigint;
  /**
   * The direction the row writes or else inherited.
   */
  readonly own: Direction;
  /**
   * The state its children receive.
   */
  readonly passes: State;
  /**
   * The selection of an `m:maction`, 0 for any other element.
   */
  readonly selection: bigint;
}

/**
 * The kinds that let an alignment group through to its cell whatever their direction
 * (MathML 3 §3.5.5.2): the cell itself, and an `maction`, whose selected child is the one judged.
 */
const letKinds: ReadonlySet<string> = new Set([
  "m:maction",
  "m:mfenced",
  "m:mphantom",
  "m:semantics",
  "m:mtd",
]);

/**
 * The kinds that let an alignment group through where they change no direction.
 */
const directedKinds: ReadonlySet<string> = new Set(["m:mrow", "m:mstyle"]);

/**
 * The document node's `start`, its pre-order position 0, above every element of the document.
 */
const documentStart = 0n;

/**
 * The lexical space a `selection` is read as an integer in, `xs:integer`'s within the signed 64-bit
 * range.
 */
const integerSpelling = regex.as(integerForm.source, "u");

/**
 * Read a `dir` as a direction: its value, the lexical form normalized in its domain's class under
 * its element's governor ({@link attributeValueOf}), as the database reads it (`ScopedDir` of
 * `#pantry/qti/queries.ts`), where that value is a direction's lexical form.
 *
 * @param node - The element.
 * @param lexical - The attribute's lexical form, none where the element writes none.
 * @returns The direction it spells, none for any other form.
 */
const directionOf = (
  node: NodeRow<Composed>,
  lexical: Option.Option<string>,
): Option.Option<Direction> =>
  lexical.pipe(
    Option.map((form) => attributeValueOf(governorOf(node.kind, node.governs), "dir", form)),
    Option.filter((value): value is Direction => value === "ltr" || value === "rtl"),
  );

/**
 * Read a `selection`'s value as the integer the database generates as
 * `MathAction.selection`, for the copy each of the action's children holds (`chosen`) and the state
 * the child derives from it, which the host folds (a fold stepped by its parent's choice, grizzle's
 * ask #12) and the database holds to the generated selection.
 *
 * @param selection - The attribute's value ({@link valueAt}, its form collapsed, as
 *   `m:positive-integer`'s class is), none where the action writes none.
 * @returns 1 where none is written, the integer where the value is one and is not negative (the
 *   column is a `natural`), 0 otherwise.
 */
const selectionOf = (selection: Option.Option<string>): bigint =>
  Option.match(selection, {
    onNone: () => 1n,
    onSome: (text) => {
      if (!integerSpelling.test(text)) {
        return 0n;
      }

      const value = BigInt(text);

      return value < 0n ? 0n : value;
    },
  });

/**
 * What a parent's row hands a child's: the state the child stands in, as the schema derives it.
 *
 * @param received - The state the parent passes.
 * @param parentIsAction - Whether the parent is an `m:maction`.
 * @param rank - The child's element rank.
 * @param chosen - The parent action's selection.
 * @returns The child's state.
 */
const stateOf = (received: State, parentIsAction: boolean, rank: bigint, chosen: bigint): State =>
  parentIsAction && rank !== chosen ? "unjudged" : received;

/**
 * What an element of a state passes to its children (MathML 3 §3.5.5.2).
 *
 * @param state - The element's state.
 * @param kind - Its kind.
 * @param changesDirection - Whether its own direction differs from the one it inherited.
 * @returns The state its children receive.
 */
const passesOf = (state: State, kind: string, changesDirection: boolean): State => {
  if (state !== "open") {
    return state;
  }

  return letKinds.has(kind) || (directedKinds.has(kind) && !changesDirection) ? "open" : "closed";
};

/**
 * What the tree's folds give each node, and the attributes its element writes: everything a row
 * builder reads of a document.
 */
interface Reading {
  /**
   * Each element's attributes, by its `start` and their name (the document's view's).
   */
  readonly attributes: AttributeIndex;
  /**
   * The kind of each node, by its `start`.
   */
  readonly kinds: ReadonlyMap<bigint, NodeRow<Composed>["kind"]>;
  /**
   * Each node's fold (`#pantry/import/fold.ts`): its nearest interaction (N8), its element rank
   * among its parent's element children, from 1, and its element children's count.
   */
  readonly folds: Folds;
  /**
   * Where the document stands in its package, the key every row holds.
   */
  readonly ids: Place;
  /**
   * The direction each element holds, the document node's `ltr` above them.
   */
  readonly owns: Map<bigint, Direction>;
  /**
   * What each row built so far passes on, by its node's `start`.
   */
  readonly standing: Map<bigint, Scope>;
}

/**
 * The selection an element passes to its children: an `m:maction`'s, 0 for any other element.
 *
 * @param kind - The element's kind.
 * @param selection - Its `selection`'s value, none where it writes none.
 * @returns The selection.
 */
const selectionHeld = (kind: string, selection: Option.Option<string>): bigint =>
  kind === "m:maction" ? selectionOf(selection) : 0n;

/**
 * Write a node's place, the key an overlay row of it is written under.
 *
 * @param reading - The document.
 * @param node - The node.
 * @returns Its `package`, `path` and `start`.
 */
const placed = (reading: Reading, node: NodeRow<Composed>) => ({
  package: reading.ids.package,
  path: reading.ids.path,
  start: node.start,
});

/**
 * Write an `m:maction`'s row.
 *
 * @param reading - The document.
 * @param node - The `m:maction`.
 * @returns Its row.
 */
const actionOf = (reading: Reading, node: NodeRow<Composed>): Addition<typeof MathAction> => {
  const lexical = lexicalOf(reading, node.start, "selection");

  return {
    package: reading.ids.package,
    path: reading.ids.path,
    selectionLexical: Option.getOrElse(lexical, () => ""),
    selectionWritten: Option.isSome(lexical),
    start: node.start,
  };
};

/**
 * Write an element's scope row and what it passes to its children, from the row its parent passed
 * on.
 *
 * @param reading - The document.
 * @param node - The element.
 * @returns The row and what it passes; none for an element no cell holds and no cell itself.
 */
const scopeOf = (
  reading: Reading,
  node: NodeRow<Composed>,
): { readonly row: Addition<typeof MathAlignScope>; readonly scope: Scope } | undefined => {
  const above = reading.standing.get(node.parent);
  const isCell = node.kind === "m:mtd";
  if (!isCell && above === undefined) {
    return undefined;
  }

  const inherited = reading.owns.get(node.parent) ?? "ltr";
  const own = reading.owns.get(node.start) ?? inherited;
  const parentKind = reading.kinds.get(node.parent) ?? node.kind;
  const underAction = parentKind === "m:maction";
  const { elements } = foldAt(reading.folds, node.start);
  const chosen = underAction ? (above?.selection ?? 0n) : 0n;
  const received: State = above?.passes ?? "open";
  const state = isCell ? "open" : stateOf(received, underAction, elements, chosen);
  const passes = passesOf(state, node.kind, own !== inherited);
  const cell = isCell ? node.start : (above?.cell ?? node.start);

  return {
    row: {
      ...placed(reading, node),
      cell,
      chosen,
      inherited,
      own,
      passes,
      received,
      state,
    },
    scope: {
      cell,
      own,
      passes,
      selection: selectionHeld(node.kind, valueAt(reading, node, "selection")),
    },
  };
};

/**
 * Group the complete elements of the cells by their cell, each cell's in document order.
 *
 * @param reading - The document's reading.
 * @param leafNodes - The complete elements, in document order.
 * @param scopes - Each element's scope row, by its node's `start`.
 * @returns Each cell's leaves, by the cell's `start`.
 */
const leavesByCell = (
  leafNodes: readonly NodeRow<Composed>[],
  scopes: ReadonlyMap<bigint, Addition<typeof MathAlignScope>>,
): ReadonlyMap<bigint, readonly CellLeafInsert[]> => {
  const nested = new Map<bigint, CellLeafInsert[]>();
  for (const node of leafNodes) {
    const cell = scopes.get(node.start)?.cell ?? node.start;
    const own = nested.get(cell) ?? [];
    own.push({ start: node.start });
    nested.set(cell, own);
  }

  return nested;
};

/**
 * The align rows of one document.
 *
 * @param view - The document's view: its rows, and their folds under the context it is judged in.
 * @param ids - Where the document stands in its package, the key every row holds.
 * @returns The rows of every relation the align module declares.
 */
export const rowsOf = (view: DocumentView, ids: Place): MathmlAlignRows => {
  const flat = view.rows;
  const reading: Reading = {
    attributes: view.attributes,
    folds: view.folds,
    ids,
    kinds: new Map(flat.nodes.map((node) => [node.start, node.kind] as const)),
    owns: new Map<bigint, Direction>([[documentStart, "ltr"]]),
    standing: new Map<bigint, Scope>(),
  };
  const actions = new Map<string, Addition<typeof MathAction>>();
  const cells = new Map<bigint, Omit<MathCellRow, "leaves">>();
  const scopes = new Map<bigint, Addition<typeof MathAlignScope>>();
  const groups = new Map<string, Addition<typeof MathAlignGroup>>();
  const leafNodes: NodeRow<Composed>[] = [];
  for (const node of flat.nodes) {
    if (node.parent === node.start || nonElements.has(node.kind)) {
      continue;
    }

    reading.owns.set(
      node.start,
      Option.getOrElse(
        directionOf(node, lexicalOf(reading, node.start, "dir")),
        () => (node.kind === "m:math" ? "ltr" : reading.owns.get(node.parent)) ?? "ltr",
      ),
    );
    if (node.kind === "m:maction") {
      actions.set(keyTextOf(ids.package, ids.path, node.start), actionOf(reading, node));
    }

    const built = scopeOf(reading, node);
    if (built === undefined) {
      continue;
    }

    const { row, scope } = built;
    reading.standing.set(node.start, scope);
    scopes.set(node.start, row);
    if (node.kind === "m:mtd") {
      cells.set(node.start, { package: ids.package, path: ids.path, start: node.start });
    } else {
      if (node.kind === "m:maligngroup" && row.state === "open") {
        groups.set(keyTextOf(ids.package, ids.path, node.start), {
          cell: row.cell,
          package: ids.package,
          path: ids.path,
          start: node.start,
        });
      }

      if (foldAt(reading.folds, node.start).elementChildren === 0n) {
        leafNodes.push(node);
      }
    }
  }

  const nested = leavesByCell(leafNodes, scopes);

  return {
    MathAction: actions,
    MathAlignGroup: groups,
    MathAlignScope: new Map(
      [...scopes].map(([start, row]) => [keyTextOf(ids.package, ids.path, start), row] as const),
    ),
    MathCell: new Map(
      [...cells].map(
        ([start, cell]) =>
          [
            keyTextOf(ids.package, ids.path, start),
            { ...cell, leaves: nested.get(start) ?? [] },
          ] as const,
      ),
    ),
  };
};
