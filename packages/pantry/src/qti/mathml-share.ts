/**
 * The MathML share law (spec reading 2, MathML 3 validity): the law "MathML share cycle", stated
 * over the elements of a MathML tree and the `m:share` elements that name one of them.
 *
 * "An element may not dominate itself" (MathML 3 §4.2.7): an element dominates its children and,
 * through a `share`, the element its `src` names. grizzle plans no recursion, so the module states
 * the law by a dominance rank. Each element holds a rank above each of its children's, and each
 * `share` holds a rank above its target's. A cycle of those edges would make a rank exceed itself,
 * so every ranking of it breaks one of the two, and the database refuses the document. The host
 * never refuses: it writes the ranks of a depth-first order that ignores the closing edge, and the
 * row of the `share` that closes the cycle breaks the check.
 *
 * - **{@link MathRank}**, one row per element a share can dominate or be dominated through, keyed by
 *   its node: its `rank`. Its parent's rank is its parent's row's, read through `Node`'s `parent`
 *   by a rule over a query (decision S3). Every element below an `m:math` has a parent that is a
 *   MathML element (the grammar admits no MathML kind but `m:math` under another parent), so the
 *   parents' rows are written step by step up to the root, an `m:math`. A target no `m:math` holds
 *   has a chain that ends at the document node instead, the one node that is its own parent
 *   (position 0). `E1_derived` holds each of those two tops' rank free and every other row's rank
 *   below its parent's.
 * - **{@link ShareTarget}**, one row per `m:share` of a document in no assembly with a same-document
 *   fragment, keyed by the share's node: its `id` as {@link ShareFragment} holds it and
 *   `targetStart`, the position of the element that carries the id (an owner in the query
 *   `IdBinding`). `MathML_share_cycle` is the check over the share's and the target's
 *   {@link MathRank} rows: the share's rank is above its target's.
 *
 * A document in an assembly resolves its shares in its assembly, once per instance (spec reading
 * 117), as its IDREFs do, so the two scopes are stated apart:
 *
 * - **{@link PlacedMathRank}**, {@link MathRank} per instance, keyed by the instance `(package,
 *   assembly, instance)` and the node's `start` in the instance's document. The host ranks each
 *   assembly's merged graph: each instance's child edges, the edge from an include's parent element
 *   to each top-level element of the instance it splices, and each share's edge to its target. The
 *   database proves the order of the edges it ties, the child edges.
 * - **{@link PlacedShareTarget}**, one row per `m:share` of an assembled document under each instance
 *   of it (`ShareFragment.placements` counts them, and a test document's `instances` is the count
 *   each share must reach), keyed by the instance and the share's `start`: its target resolved over
 *   the assembly's bindings (the query `AssembledId`), the target's document `target` and position
 *   `targetStart`, and the instance that holds the target. Its own `MathML_share_cycle` check
 *   compares the two {@link PlacedMathRank} rows' ranks under the right instances.
 *
 * A fragment placed in two items is ranked once per instance, so share edges that close a cycle
 * only across the two assemblies refuse nothing.
 *
 * Every element a cycle runs through has a row: a row's parent has one, so the rows of a share's
 * and a target's ancestors are written up to the root, and a share with a fragment has a
 * {@link ShareTarget} or {@link PlacedShareTarget} row, both ways. A document with a share and a
 * rank row its host omits for the share or its target is refused by those containments. The ranks
 * are the host's, and only their order is proved. A target that is no MathML element has no
 * {@link MathRank} row unless the host writes one, and a cycle that crosses a foreign element
 * between two MathML elements is not followed.
 *
 * Every statement but the checks is a restatement of the tree, "E1 derived"; the share check is
 * named by its law, as `#pantry/qti/expressions.ts` names `Arity`.
 *
 * @see {@link https://www.w3.org/TR/MathML3/chapter4.html#contm.share | MathML 3 §4.2.7, share}
 */
import { closedId, contained, counted, fin, law, on, relation, select } from "@bjornpagen/grizzle";
import { NodeKind, natural } from "#pantry/grammar/install.ts";
import { ShareFragment } from "#pantry/qti/identity.ts";
import { EntryPath, PackageName, XmlId } from "#pantry/qti/limits.ts";
import { Node } from "#pantry/qti/node.ts";
import { Instance, AssembledDocument } from "#pantry/qti/tests.ts";
import { entryOf } from "#pantry/vocab/laws.ts";

/**
 * One MathML element a share can dominate or be dominated through, keyed by its node's
 * `(package, path, start)`, and `rank`, the host's, its dominance rank. Its kind and parent are
 * its node's, and its parent's rank its parent's row's, which the rules over the queries
 * `MathRankNode` and `MathRankStep` read (`#pantry/qti/overlay-queries/expression.ts`).
 */
export const MathRank = law(
  entryOf("E1 derived"),
  relation(
    "MathRank",
    {
      package: PackageName,
      path: EntryPath,
      rank: natural,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One `m:share` whose `src` is a fragment of its own document, keyed by the share's node: the
 * element its fragment names and the two ranks the law compares.
 *
 * - **the host's:** the share's key and its `id`, the share's fragment as {@link ShareFragment} holds
 *   it, and `targetStart`, the position of the owner of that id under the query `IdBinding` in the
 *   same document. The two ranks the law compares are the {@link MathRank} rows' of the share and
 *   of the target, which the rule over the query `ShareRanks` reads.
 */
export const ShareTarget = law(
  entryOf("E1 derived"),
  relation(
    "ShareTarget",
    {
      id: XmlId,
      package: PackageName,
      path: EntryPath,
      start: natural,
      targetStart: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One MathML element of an instance of an assembly that a placed share stands on or names, or that
 * lies on such an element's chain, keyed by the instance, `(package, assembly, instance)`, and the
 * element's `start` in the instance's document, `path`. It is {@link MathRank} per instance (spec
 * reading 117): the same element is ranked once under each instance of its document, in that
 * instance's assembly.
 *
 * - **the host's:** the node's `package`, `path` and `start`, its node's key, the `instance` (its
 *   pre-order position in its assembly's instance tree) and its `assembly`, proved against
 *   {@link Instance}, and `rank`, its dominance rank in its assembly's merged graph. Its kind and
 *   parent are its node's, and its parent's rank its parent's row's under the same instance, which
 *   the rules over the queries `PlacedMathRankNode` and `PlacedMathRankStep` read. An `m:math` and
 *   the document node have no tied parent.
 */
export const PlacedMathRank = law(
  entryOf("E1 derived"),
  relation(
    "PlacedMathRank",
    {
      assembly: EntryPath,
      instance: natural,
      package: PackageName,
      path: EntryPath,
      rank: natural,
      start: natural,
    },
    ["package", "assembly", "instance", "start"],
  ),
);

/**
 * One `m:share` of an assembled document under one instance of it, keyed by the instance,
 * `(package, assembly, instance)`, and the share's `start` in the instance's document, `path`: the
 * element its fragment names in that instance's assembly and the two ranks the law compares.
 *
 * - **the host's:** `id`, the share's fragment as {@link ShareFragment} holds it, the instance's
 *   `assemblyKind`, and the binding of the id in the assembly (the query `AssembledId`'s `path`,
 *   `owner` and `instance`): `target`, the document that holds the target, `targetStart`, its
 *   position there, and `targetInstance`, the instance of the target's document it is bound under.
 *   The two ranks the law compares, the share's under `instance` and the target's under
 *   `targetInstance`, are the {@link PlacedMathRank} rows', which the rule over the query
 *   `PlacedShareRanks` reads.
 */
export const PlacedShareTarget = law(
  entryOf("E1 derived"),
  relation(
    "PlacedShareTarget",
    {
      assembly: EntryPath,
      assemblyKind: closedId(NodeKind),
      id: XmlId,
      instance: natural,
      package: PackageName,
      path: EntryPath,
      start: natural,
      target: EntryPath,
      targetInstance: natural,
      targetStart: natural,
    },
    ["package", "assembly", "instance", "start"],
  ),
);

/**
 * The shares of a document in an assembly, the ones {@link PlacedShareTarget} places once under
 * each instance.
 */
const assembledShares = select(ShareFragment, (f) => f.eq(f.assembled, true));

/**
 * The shares of a document in no assembly, the ones {@link ShareTarget} holds.
 */
const unassembledShares = select(ShareFragment, (f) => f.eq(f.assembled, false));

/**
 * A share of a document in no assembly resolves: it has its {@link ShareTarget}, whose target is an
 * owner of its id under the query `IdBinding`. A share whose id names nothing has none, and this is
 * the one statement it breaks beside "Idref target"'s own, so it is stated under that law (spec
 * reading 2; decision 428): a dangling share is refused by "Idref target" alone, and every share of
 * a document that law accepts has its target, the one the cycle check reads.
 */
export const shareResolution = contained(
  on(unassembledShares, "package", "path", "start", "id"),
  on(ShareTarget, "package", "path", "start", "id"),
);

/**
 * Each share's placements, counted by `ShareFragment.placements`.
 */
const placedShareFamily = counted(
  on(PlacedShareTarget, "package", "path", "start"),
  fin(ShareFragment, "placements"),
);

/**
 * The relations the share law declares, in one list, as `#pantry/qti/schema.ts` composes them.
 */
export const shareRelations = [MathRank, PlacedMathRank, PlacedShareTarget, ShareTarget] as const;

/**
 * Every statement over the module's relations, the check named by its law:
 *
 * - **the ranks:** each row at its node; `E1_derived`, that an element's rank is above its parent's
 *   for every kind but `m:math` and the document node, and that every other row's parent has its
 *   row, reads the node's kind and parent, so it is a rule over a query
 *   (`#pantry/qti/overlay-queries/expression.ts`);
 * - **the targets:** a {@link ShareTarget} row only for a {@link ShareFragment} of a document in no
 *   assembly, and one for each such share that resolves ({@link shareResolution}, under "Idref
 *   target"), its `targetStart` an owner of its id in its document's ID/IDREF table (a rule over a
 *   query, `#pantry/qti/overlay-queries/identity.ts`), the share and the target each a
 *   {@link MathRank} row; and `MathML_share_cycle`, the share's rank above its target's, over the
 *   two rows' ranks, a rule over a query;
 * - **the placed ranks and targets:** the same per instance of an assembled document: each
 *   {@link PlacedMathRank} row at its node and its instance, a {@link PlacedShareTarget} row for
 *   each share under every instance of its document, its target resolved over its assembly's
 *   ID/IDREF table (a rule over a query), the share and the target each a {@link PlacedMathRank}
 *   row under the right instance, and the two rules over queries again.
 */
export const shareLaws = [
  contained(on(MathRank, "package", "path", "start"), on(Node, "package", "path", "start")),

  contained(
    on(ShareTarget, "package", "path", "start", "id"),
    on(unassembledShares, "package", "path", "start", "id"),
  ),
  shareResolution,
  contained(on(ShareTarget, "package", "path", "start"), on(MathRank, "package", "path", "start")),
  contained(
    on(ShareTarget, "package", "path", "targetStart"),
    on(MathRank, "package", "path", "start"),
  ),

  contained(on(PlacedMathRank, "package", "path", "start"), on(Node, "package", "path", "start")),
  contained(
    on(PlacedMathRank, "package", "assembly", "instance", "path"),
    on(Instance, "package", "assembly", "start", "document"),
  ),

  contained(
    on(PlacedShareTarget, "package", "path", "start", "id"),
    on(ShareFragment, "package", "path", "start", "id"),
  ),
  contained(
    on(PlacedShareTarget, "package", "assembly", "instance", "path", "assemblyKind"),
    on(Instance, "package", "assembly", "start", "document", "assemblyKind"),
  ),
  placedShareFamily,
  contained(
    on(assembledShares, "package", "path", "placements"),
    on(AssembledDocument, "package", "path", "instances"),
  ),
  contained(
    on(PlacedShareTarget, "package", "assembly", "targetInstance", "target"),
    on(Instance, "package", "assembly", "start", "document"),
  ),
  contained(
    on(PlacedShareTarget, "package", "assembly", "instance", "start"),
    on(PlacedMathRank, "package", "assembly", "instance", "start"),
  ),
  contained(
    on(PlacedShareTarget, "package", "assembly", "targetInstance", "targetStart"),
    on(PlacedMathRank, "package", "assembly", "instance", "start"),
  ),
];
