/**
 * The seeds of one decision's items and the order of its stage, each a keyed hash of the decision's
 * one seed ({@link itemSeeds}, {@link stageOrder}). Plate draws no seed: the host records the
 * decision's.
 *
 * A decision records one seed. Everything random about what it serves derives from that seed by
 * HMAC-SHA-256 (`keyedDigest` in `#plate/engine/random.ts`) over QTI's own identities, never a
 * position: each item's shuffle seed and processing seed, by separate hashes of the package and
 * the item identifier, and the order of a stage's items, by a hash of each. So nothing derived is
 * stored, the same decision gives the same values on every request, and an item added to or
 * removed from a package or a stage leaves every other item's values where they were.
 *
 * @module
 */
import { keyedDigest } from "#plate/engine/random.ts";

/**
 * An item by QTI's identity: its package's name and its `identifier` within the package.
 */
export interface ItemIdentity {
  /**
   * The item's `identifier`, unique within its package.
   */
  readonly identifier: string;
  /**
   * The name of the package that holds the item.
   */
  readonly package: string;
}

/**
 * The two seeds one served item takes: the shuffle's, whose effect the page shows, and
 * processing's, which must stay secret.
 */
export interface ItemSeeds {
  /**
   * The seed template and response processing draw under, which `begin` takes: the secret behind
   * every value they draw, so it never reaches the page.
   */
  readonly processing: string;
  /**
   * The seed a shuffled interaction's order is keyed by, which `configure` takes as `seed`. The
   * page shows its effect; it is no more sent to the page than the processing seed is.
   */
  readonly shuffle: string;
}

/**
 * Derive an item's seeds from its decision's seed: HMAC-SHA-256 keyed by the decision's seed over
 * `shuffle` or `processing`, the package's name and the item's identifier, each written as 64
 * lowercase hex digits. The two are separate hashes, so neither tells anything of the other, and
 * while the decision's seed stays on the server, the page that shows a shuffle cannot recompute
 * the processing's draws.
 *
 * @example
 *   itemSeeds(decision.seed, { identifier: "q1", package: "pilot-r2" });
 *   // { processing: "…64 hex digits…", shuffle: "…64 hex digits…" }, the same every call
 *
 * @param decisionSeed The seed the decision recorded.
 * @param item The served item.
 * @returns The item's seeds.
 */
export const itemSeeds = (decisionSeed: string, item: ItemIdentity): ItemSeeds => ({
  processing: keyedDigest(decisionSeed, ["processing", item.package, item.identifier]).toString(
    "hex",
  ),
  shuffle: keyedDigest(decisionSeed, ["shuffle", item.package, item.identifier]).toString("hex"),
});

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
