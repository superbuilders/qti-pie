/**
 * The block elements whose boundaries part an xhtml value's lines are one list, plate's
 * (`blockElements`, QTI 3.0.1's `BlockContentModel` and the structural children its blocks
 * contain), which the ledger's machine reads as written: every alternation of block tag names in
 * `p3.xhtml_blocks` (`machine/admission.sql`, the source `src/grading.ts` is generated from) names
 * exactly plate's elements, in plate's order, so the database's text and plate's part an essay's
 * lines at the same tags.
 */
import { readFileSync } from "node:fs";
import { assert, describe, it } from "@effect/vitest";
import { blockElements } from "@qti-pie/plate";

/**
 * `p3.xhtml_blocks`, as `machine/admission.sql` declares it.
 */
const blocksSql = ((): string => {
  const sql = readFileSync(new URL("../machine/admission.sql", import.meta.url), "utf-8");
  const start = sql.indexOf("create function p3.xhtml_blocks");
  assert.isTrue(start !== -1, "machine/admission.sql declares p3.xhtml_blocks");

  return sql.slice(start, sql.indexOf("$$;", start));
})();

describe("the block elements of an xhtml value's lines", () => {
  it("are plate's list wherever the machine names them", () => {
    const named = [...blocksSql.matchAll(/<\/?\(\?:(?<names>[a-z0-9|]+)\)/gu)].map((match) =>
      (match.groups?.["names"] ?? "").split("|"),
    );
    assert.isAbove(named.length, 0, "the machine names its block elements");
    for (const names of named) {
      assert.deepStrictEqual(names, [...blockElements]);
    }
  });
});
