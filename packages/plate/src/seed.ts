/**
 * The shuffle seeds of one decision's items and the order of its stage, each a keyed hash of the
 * decision's one seed ({@link shuffleSeed}, {@link stageOrder}). Plate draws no seed: the host
 * records the decision's.
 *
 * A decision records one seed. Everything random about what it serves derives from that seed by
 * HMAC-SHA-256 (`keyedDigest` in `#plate/digest.ts`) over QTI's own identities, never a
 * position: each item's shuffle seed, by a hash of the package and the item identifier, and the
 * order of a stage's items, by a hash of each. The processing seed template processing draws under
 * is the QTI database's, which runs template processing at the take. So nothing derived is
 * stored, the same decision gives the same values on every request, and an item added to or
 * removed from a package or a stage leaves every other item's values where they were.
 *
 * @module
 */
import { keyedDigest } from "#plate/digest.ts";

/**
 * What an item's seeds are drawn over: its package's name and its `identifier`. A salt, never the
 * item's name: QTI makes an identifier unique nowhere (information model §4.1.1, info:6346, its
 * type `Identifier` and not `UniqueIdentifier`), so two items of one package that share one draw
 * alike, and a host names an item by its document's path.
 */
export interface ItemIdentity {
  /**
   * The item's `identifier`, as its root writes it.
   */
  readonly identifier: string;
  /**
   * The name of the package that holds the item.
   */
  readonly package: string;
}

/**
 * Derive an item's shuffle seed from its decision's seed: HMAC-SHA-256 keyed by the decision's seed
 * over `shuffle`, the package's name and the item's identifier, written as 64 lowercase hex digits,
 * which `configure` takes as `seed`. The page shows its effect; it is no more sent to the page than
 * the decision's seed is.
 *
 * @example
 *   shuffleSeed(decision.seed, { identifier: "q1", package: "pilot-r2" });
 *   // "…64 hex digits…", the same every call
 *
 * @param decisionSeed The seed the decision recorded.
 * @param item The served item.
 * @returns The item's shuffle seed.
 */
export const shuffleSeed = (decisionSeed: string, item: ItemIdentity): string =>
  keyedDigest(decisionSeed, ["shuffle", item.package, item.identifier]).toString("hex");

/**
 * Give a stage's items in the order a page shows them: ranked by HMAC-SHA-256 keyed by the
 * decision's seed over `stage`, each item's package name and identifier, lowest first. The order
 * is a function of the seed and each item's identity alone, so the same decision shows the same
 * order on every request, and an item that leaves the stage moves no other.
 *
 * @param decisionSeed The seed the decision recorded.
 * @param items The stage's items, each once.
 * @returns The same items, in the order shown.
 */
export const stageOrder = <Item extends ItemIdentity>(
  decisionSeed: string,
  items: readonly Item[],
): readonly Item[] =>
  items
    .map((item) => ({
      item,
      rank: keyedDigest(decisionSeed, ["stage", item.package, item.identifier]),
    }))
    .toSorted((left, right) => Buffer.compare(left.rank, right.rank))
    .map(({ item }) => item);
