/**
 * The closed vocabulary Alpha's Gap Match layout suite (`alpha-gap-match-layout.test.ts`) lays its
 * pages out over, the domain itself, never cases a person chose: the widths of the item the
 * layouts are held at, each named for the screen it stands for, and each fixture's cards and gaps.
 *
 * @module
 */
import { dictionary } from "@bjornpagen/testing/dictionary";

/**
 * A width of the item the layouts are held at, in CSS pixels, and the screen it stands for.
 */
export interface ItemWidth {
  readonly screen: "laptop" | "phone" | "phone in metis's card" | "tablet at 200%";
  readonly width: number;
}

/**
 * The widths of the item the layouts are held at, in CSS pixels, each by the screen it stands for:
 * a laptop's column, a 768 px tablet at 200% zoom, a phone, and a 320 px phone's item inside
 * metis's card, its padding taken off.
 */
export const itemWidths = dictionary<ItemWidth>([
  { screen: "laptop", width: 1000 },
  { screen: "tablet at 200%", width: 384 },
  { screen: "phone", width: 320 },
  { screen: "phone in metis's card", width: 288 },
]);

/**
 * The number line fixture's cards (`qti-gap-text`), by identifier, as `gap-match/number-line.xml`
 * writes them, each placed at most once (`match-max="1"`).
 */
export const numberLineCards = dictionary(["n106", "n36", "n63"]);

/**
 * The number line fixture's gaps (`qti-gap`), its marked positions, by identifier, in the line's
 * order, each holding one card.
 */
export const numberLineGaps = dictionary(["position-1", "position-2", "position-3"]);

/**
 * The comparison fixture's symbol cards, by identifier, as `gap-match/comparison.xml` writes them:
 * equal, greater and less.
 */
export const comparisonCards = dictionary(["eq", "gt", "lt"]);
