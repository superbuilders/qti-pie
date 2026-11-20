/**
 * The MathML cn module's forms (spec reading 2, MathML 3 validity): every part of every type has
 * its form. PostgreSQL judges the module's law on every import, and on the free tier the law oracle
 * raises it (`#pantry/test/complete.oracle.test.ts`).
 */
import { assert, describe, it } from "@effect/vitest";
import { CnForm, CnPart, CnParts, CnType } from "#pantry/grammar/install.ts";

describe("qti/mathml-cn.ts, forms", () => {
  it("lists a form for every part of every type, as many as CnParts counts, so the rows of a cn are its type's slots", () => {
    // Oracle: the `cnForms` table the rosters and relations are generated from.
    assert.strictEqual(CnParts.rows.length, CnType.handles.length);
    for (const { parts, type } of CnParts.rows) {
      assert.strictEqual(CnForm.rows.filter((row) => row.type === type).length, Number(parts));
    }
  });

  it("names one place beyond the most parts any type holds, which no CnForm row lists", () => {
    // Oracle: the counts of `CnParts`, the most parts any type holds.
    const most = Math.max(...CnParts.rows.map((row) => Number(row.parts)));
    const beyond = CnPart.handles.at(-1);

    assert.strictEqual(CnPart.handles.length, most + 1);
    assert.deepStrictEqual(
      [...CnPart.handles],
      Array.from({ length: most + 1 }, (_, place) => String(place)),
    );
    assert.isFalse(CnForm.rows.some((row) => row.part === beyond));
  });
});
