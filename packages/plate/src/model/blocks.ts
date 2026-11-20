/**
 * The block names of XML Schema 1.0 Part 2, Appendix F, with their code-point ranges: the names a
 * block escape such as `\p{IsBasicLatin}` may use.
 *
 * The table is the Recommendation's, 85 rows over 84 names, not the Unicode Database's current
 * `Blocks.txt`, and the 2004 Recommendation never changes, so `blocks.generated.json` is committed
 * once. Its test holds it to the table it reads from the cached Recommendation.
 *
 * @module
 * @see https://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#nt-IsBlock
 */
import committed from "#plate/model/blocks.generated.json" with { type: "json" };
import type { CodeRange } from "#plate/model/values.ts";

/**
 * One row of the block table: a block name and its code points, `first` to `last`, both included.
 * A name the table lists twice (`Specials`) has two rows.
 */
interface BlockRow {
  readonly first: number;
  readonly last: number;
  readonly name: string;
}

/**
 * Group rows by block name, keeping the table's order of names and of each name's ranges.
 *
 * @param rows The table's rows.
 * @returns Each name's ranges.
 */
const byName = (rows: readonly BlockRow[]): ReadonlyMap<string, readonly CodeRange[]> => {
  const grouped = new Map<string, readonly CodeRange[]>();

  for (const { first, last, name } of rows) {
    grouped.set(name, [...(grouped.get(name) ?? []), [first, last]]);
  }

  return grouped;
};

/**
 * The committed block table, by name: each of the 84 names with its ranges, two for `Specials`.
 */
export const blocks: ReadonlyMap<string, readonly CodeRange[]> = byName(committed);
