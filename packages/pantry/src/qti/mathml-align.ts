/**
 * The MathML align laws (spec reading `mathml-validity`, MathML 3 validity): the laws "MathML
 * maction selection", "MathML align placement" and "MathML align first", stated over `m:maction`
 * and the table cells (`m:mtd`) whose alignment groups (`m:maligngroup`) MathML 3 §3.5.5 places.
 *
 * An `maction` shows one child, the one its `selection` numbers (MathML 3 §3.7.1.1, "If the value
 * specified is out of range, it is an error"). In a table cell, an alignment group stands directly
 * or inside an `mrow` or `mstyle` that changes no direction, `mphantom`, `mfenced`, the selected
 * child of an `maction`, or `semantics` (§3.5.5.2), and a cell with a group that stands there
 * starts with one: its first complete element, the first element with no element child, is a group.
 * Only an `maction`'s selected child is checked (§3.5.5.9), a group outside every cell is ignored,
 * and a change of direction is a `dir` other than the one the element inherits (operator decision
 * 321).
 *
 * - **{@link MathAction}**, one row per `m:maction`, keyed by its node: its `selection`, 1 where the
 *   element writes none, with the lexical form of the attribute that gave it.
 *   `MathML_maction_selection` is the check over it and its node's element count: the action has a
 *   child and its selection is at least 1 and at most their number.
 * - **{@link MathAlignScope}**, one row per element inside an `m:mtd`, keyed by its node and read up
 *   the tree as `#pantry/qti/identity.ts` reads {@link SsmlScope} a fragment: its `cell`, the
 *   nearest `m:mtd` (the cell itself for an `m:mtd`), and its `state` there, {@link AlignState}:
 *
 *   - `open` stands in the cell: the cell itself; a child of an open `mrow` or `mstyle` that changes no
 *     direction, of an open `mphantom`, `mfenced` or `semantics`, or the selected child of an open
 *     `maction`;
 *   - `unjudged` is not checked: any child of an `maction` but the selected one, and whatever stands
 *     below it;
 *   - `closed` is any other. Each row is tied to its parent's by a containment, so the state is proved
 *     step by step: what its parent `passes` to its children is copied as `received`, and a row's own
 *     `passes` and `state` follow from its kind, its direction and the state it received. The
 *     direction a row `inherited` is its parent's `own`, the direction the parent's `dir` spells or
 *     else the one it inherited. An `m:mtd` is the root of its own scope, its state `open`; its
 *     direction is the host's, since no row stands above a cell. `MathML_align_placement` is the
 *     check over it: an `m:maligngroup`'s state is not `closed`.
 * - **{@link MathAlignGroup}**, one row per `m:maligngroup` whose state is `open`, with its `cell`,
 *   counted by {@link MathCell}`.groups`.
 * - **{@link MathCell}**, one row per `m:mtd`, keyed by its node: its `groups`, the count of its
 *   {@link MathAlignGroup} rows, its `leaves`, the count of its {@link CellLeaf} rows, and
 *   `lastStart`, the greatest start among them.
 * - **{@link CellLeaf}**, one row per complete element of a cell, keyed by its cell and its slot, the
 *   slots in document order: its `start` exceeds its predecessor's, so slot 0 is the cell's first
 *   complete element. `MathML_align_first` is the check over it, its node's kind and its cell's
 *   `groups`: a leaf in slot 0 is a group where its cell holds a group that stands.
 *
 * A complete element is an element with no element child, an `m:mtd` apart, so an empty cell nested
 * in another is no leaf of the outer one; the oracle counts it (`#pantry/test/oracle.ts`
 * `contentOfCell`). The rows of {@link MathAlignScope} are the host's, and rules over queries
 * (`#pantry/qti/queries.ts`) hold them complete and their directions to the tree: every element
 * child of an element with a scope row has its own (`CellChild`), so every element inside a cell
 * has one; and a row's `own` is the direction its element's `dir` spells, read from the attribute
 * where it stands and copied nowhere (C18), and its `inherited` wherever the element writes none or
 * one that spells no direction (`ScopedDir`).
 *
 * Every statement but the three checks is a restatement of the tree, "E1 derived"; the checks are
 * named by their laws, as `#pantry/qti/expressions.ts` names `Arity`. A row holds its node's key
 * and none of its node's facts (decision S3): every law that pairs a row with its node's kind,
 * parent, parent's kind, element rank or element count, the three checks among them, is a rule over
 * a query (`#pantry/qti/overlay-queries/expression.ts`).
 *
 * @see {@link https://www.w3.org/TR/MathML3/chapter3.html#presm.maction | MathML 3 §3.7.1, maction}
 * @see {@link https://www.w3.org/TR/MathML3/chapter3.html#presm.malign.group | MathML 3 §3.5.5.2, maligngroup}
 */
import {
  accumulated,
  check,
  closed,
  closedId,
  contained,
  counted,
  Crypto,
  drawn,
  fin,
  fold,
  generated,
  key,
  law,
  Logic,
  mirrors,
  Monoid,
  Num,
  on,
  ordered,
  pg,
  relation,
  select,
  sha256,
  Text,
  Type,
} from "@bjornpagen/grizzle";
import { anyText, natural } from "#pantry/grammar/install.ts";
import { EntryPath, integerForm, matchedText, PackageName } from "#pantry/qti/limits.ts";
import { Attribute } from "#pantry/qti/attributes.ts";
import { Node } from "#pantry/qti/node.ts";
import { entryOf } from "#pantry/vocab/laws.ts";

/**
 * The `AlignState` roster: where an element stands in its table cell, `closed` where an element
 * between it and the cell stops an alignment group, `open` where one lets it through, and
 * `unjudged` where an `maction` shows another child (MathML 3 §3.5.5.2 and §3.5.5.9).
 */
const AlignState = closed.ordered("AlignState", ["closed", "open", "unjudged"]);

/**
 * The `AlignDirection` roster: the directions a `dir` takes (MathML 3 §3.1.5.1).
 */
export const AlignDirection = closed.ordered("AlignDirection", ["ltr", "rtl"]);

/**
 * `AlignDirectionLexical`: code → lexical, each {@link AlignDirection}'s lexical form (C17), which a
 * `dir`'s `value` spells, as the scope law reads it (`ScopedDir`, `#pantry/qti/queries.ts`).
 */
export const AlignDirectionLexical = closed.relation(
  "AlignDirectionLexical",
  { code: closedId(AlignDirection), lexical: anyText },
  ["code"],
  AlignDirection.handles.map((code) => ({ code, lexical: code })),
);

/**
 * One `m:maction`, keyed by its node's `(package, path, start)`.
 *
 * - **the host's:** `selectionLexical` and `selectionWritten`, the lexical form of the `selection`
 *   attribute and whether the node writes one, which the attribute proves, an unwritten one empty
 *   (`E1_derived`). Its element count is its node's, which "MathML maction selection" reads through
 *   the query `MathActionNode` (`#pantry/qti/overlay-queries/expression.ts`);
 * - **the database's:** `selection`, the form's integer, collapsed (`Text.collapse`) and read in
 *   {@link integerForm}: 1 where none is written, 0 where it is no integer or a negative one.
 */
export const MathAction = law(
  entryOf("E1 derived"),
  relation.generated(
    "MathAction",
    {
      package: PackageName,
      path: EntryPath,
      selectionLexical: matchedText,
      selectionWritten: pg.boolean,
      start: natural,
    },
    ["package", "path", "start"],
    (m) => ({
      selection: law(
        entryOf("E1 derived"),
        generated(
          natural,
          Logic.cond(
            Logic.eq(m.selectionWritten, false),
            Type.literal(natural, 1n),
            Logic.when(
              Text.matches(Text.collapse(m.selectionLexical), integerForm),
              (text) =>
                Logic.when(
                  Num.nonnegative(Type.cast(text, pg.bigint)),
                  (value) => Type.cast(value, natural),
                  Type.literal(natural, 0n),
                ),
              Type.literal(natural, 0n),
            ),
          ),
        ),
      ),
      selectionLexicalDigest: law(
        entryOf("E1 derived"),
        generated(sha256, Crypto.sha256(m.selectionLexical)),
      ),
    }),
  ),
);

/**
 * One element inside a table cell, keyed by its node's `(package, path, start)`, as
 * {@link AlignState} defines. Its kind, parent, parent's kind, element rank and element count are
 * its node's, which the rules over the query `ScopeNode` read
 * (`#pantry/qti/overlay-queries/expression.ts`).
 *
 * - **copied from the parent's row:** `cell`, the position of the nearest `m:mtd` in the same
 *   document, `received` (the parent's `passes`) and `inherited` (the parent's `own`); and
 *   `chosen`, the `selection` of a parent `maction`, 0 under any other parent. An `m:mtd`'s row
 *   copies none of them, its `cell` its own `start`. They are the cell's alignment state carried
 *   down the tree, which a row's laws judge on the row;
 * - **derived by `E1_derived`:** `state`, `own` and `passes`: `own` the direction its element's `dir`
 *   spells, else `inherited`, which rules over a query read from the attribute where it stands
 *   (`ScopedDir`, `#pantry/qti/queries.ts`).
 */
export const MathAlignScope = law(
  entryOf("E1 derived"),
  relation(
    "MathAlignScope",
    {
      cell: natural,
      chosen: natural,
      inherited: closedId(AlignDirection),
      own: closedId(AlignDirection),
      package: PackageName,
      passes: closedId(AlignState),
      path: EntryPath,
      received: closedId(AlignState),
      start: natural,
      state: closedId(AlignState),
    },
    ["package", "path", "start"],
  ),
);

/**
 * One `m:maligngroup` whose state is `open`, keyed by its node, with the `cell` it stands in.
 */
export const MathAlignGroup = law(
  entryOf("E1 derived"),
  relation(
    "MathAlignGroup",
    { cell: natural, package: PackageName, path: EntryPath, start: natural },
    ["package", "path", "start"],
  ),
);

/**
 * One `m:mtd`, keyed by its node: `groups`, the count of its {@link MathAlignGroup} rows, `leaves`,
 * the count of its {@link CellLeaf} rows, both drawn, and `lastStart`, the greatest `start` among
 * its leaves, which the fold of their starts proves (0 where it has none).
 */
export const MathCell = law(
  entryOf("E1 derived"),
  relation(
    "MathCell",
    {
      groups: drawn(natural),
      lastStart: accumulated(natural, 0n),
      leaves: drawn(natural),
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One complete element of a table cell, in document order: keyed by its document, its `cell` and
 * its slot `at`.
 *
 * - **the host's:** `cell`, its cell's position, the family's group; its kind is its node's, and its
 *   cell's group count its cell's, which "MathML align first" reads through the query
 *   `CellLeafNode`;
 * - **drawn:** `at`;
 * - **accumulated:** `startWas` and `startAfter`, the greatest start of the leaves before it and
 *   through it.
 */
export const CellLeaf = law(
  entryOf("E1 derived"),
  relation(
    "CellLeaf",
    {
      at: drawn(natural),
      cell: natural,
      package: PackageName,
      path: EntryPath,
      start: natural,
      startAfter: accumulated(natural, 0n),
      startWas: accumulated(natural, 0n),
    },
    ["package", "path", "cell", "at"],
  ),
);

/**
 * The relations and rosters the align laws declare, in one list, as `#pantry/qti/schema.ts`
 * composes them.
 */
export const alignRelations = [
  AlignDirection,
  AlignDirectionLexical,
  AlignState,
  CellLeaf,
  MathAction,
  MathAlignGroup,
  MathAlignScope,
  MathCell,
] as const;

/**
 * The `m:maction` nodes, each of which holds a {@link MathAction} row.
 */
const actions = select(Node, (n) => n.eq(n.kind, "m:maction"));

/**
 * The `m:mtd` nodes, each of which holds a {@link MathCell} row.
 */
const cells = select(Node, (n) => n.eq(n.kind, "m:mtd"));

/**
 * The `selection` attributes of an `m:maction`, the source of {@link MathAction}'s lexical form.
 */
const selectionAttributes = select(Attribute, (a) =>
  a.and(a.eq(a.kind, "m:maction"), a.eq(a.name, "selection")),
);

/**
 * The {@link MathAction} rows of an action that writes its `selection`.
 */
const writtenSelections = select(MathAction, (m) => m.eq(m.selectionWritten, true));

/**
 * The family of a cell's leaves in document order, slot `at` of `MathCell.leaves`.
 */
const leafFamily = ordered(on(CellLeaf, "package", "path", "cell", "at"), fin(MathCell, "leaves"));

/**
 * The family of a cell's open alignment groups, counted by `MathCell.groups`.
 */
const groupFamily = counted(on(MathAlignGroup, "package", "path", "cell"), fin(MathCell, "groups"));

/**
 * The fold of a cell's leaves' starts, the greatest through each leaf (`startAfter`) and before it
 * (`startWas`), ending at `MathCell.lastStart`. With `E1_derived`'s `start > startWas`, the slots
 * are in document order, since a pre-order interval starts after every one that came before it.
 */
const leafStartFold = fold(
  leafFamily,
  Monoid.max,
  on(CellLeaf, "package", "path", "cell", "start", "startWas", "startAfter"),
  on(MathCell, "package", "path", "start", "lastStart"),
);

/**
 * Every statement over the module's relations that reads no node's fact, the rest being rules over
 * queries (`#pantry/qti/overlay-queries/expression.ts`):
 *
 * - **the action:** one row for each `m:maction` and no other node (both ways), its `selection` the
 *   attribute's integer, 1 where unwritten;
 * - **the scope:** each row at its node, and a cell's root row for each `m:mtd`;
 * - **the groups:** each {@link MathAlignGroup}'s cell its scope row's, and the family;
 * - **the cells:** one row for each `m:mtd` and no other (both ways);
 * - **the leaves:** each {@link CellLeaf}'s cell its scope row's, one row per leaf element, the
 *   ordered family and the fold of the starts.
 */
export const alignLaws = [
  mirrors(on(MathAction, "package", "path", "start"), on(actions, "package", "path", "start")),
  contained(
    on(selectionAttributes, "package", "path", "start", "lexicalDigest"),
    on(writtenSelections, "package", "path", "start", "selectionLexicalDigest"),
  ),
  contained(
    on(writtenSelections, "package", "path", "start"),
    on(selectionAttributes, "package", "path", "start"),
  ),
  check("E1_derived", MathAction, (m) =>
    m.or(m.eq(m.selectionWritten, true), m.eq(m.selectionLexical, "")),
  ),

  contained(on(MathAlignScope, "package", "path", "start"), on(Node, "package", "path", "start")),
  contained(on(cells, "package", "path", "start"), on(MathAlignScope, "package", "path", "start")),

  contained(
    on(MathAlignGroup, "package", "path", "start", "cell"),
    on(MathAlignScope, "package", "path", "start", "cell"),
  ),
  groupFamily,

  mirrors(on(MathCell, "package", "path", "start"), on(cells, "package", "path", "start")),

  contained(
    on(CellLeaf, "package", "path", "start", "cell"),
    on(MathAlignScope, "package", "path", "start", "cell"),
  ),
  key(on(CellLeaf, "package", "path", "start")),
  leafFamily,
  leafStartFold,
  check("E1_derived", CellLeaf, (l) => l.gt(l.start, l.startWas)),
] as const;
