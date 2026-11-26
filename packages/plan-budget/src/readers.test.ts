/**
 * The readers the checks rest on, held to what grizzle writes: a judge function's body however it
 * is installed, the delta tables its capture functions create, and the growth slope's bound.
 */
import { assert, describe, it } from "@effect/vitest";
import { descentSlope, slopeOf } from "#plan-budget/growth.ts";
import { assembledText, deltaTablesOf, judgeBlocksOf } from "#plan-budget/served.ts";
import type { ServedUnit } from "#plan-budget/served.ts";

/**
 * A judge part's installed body (`pg_proc.prosrc`) as grizzle writes one: a probe for each law,
 * each `PERFORM 1 FROM (<query>) AS "found";` behind the test of its deltas, a nested query's
 * parentheses and a string's semicolon inside.
 */
const body = `DECLARE
  "__rowed" "pg_catalog"."text"[];
BEGIN
  "__rowed" := '{}'::"pg_catalog"."text"[];
  IF "__rowed" && '{"__delta_news_attempt_ab12cd34ef"}'::"pg_catalog"."text"[] THEN
    PERFORM 1 FROM (SELECT "r1"."c1" FROM "ledger"."__reader_news_attempt_ab12cd34ef"() AS "r1"("c1") WHERE NOT EXISTS (SELECT FROM "ledger"."item_session" AS "r2" WHERE "r2"."child" = "r1"."c1" AND "r2"."item" <> ';')) AS "found";
    IF FOUND THEN RAISE EXCEPTION 'law';
    END IF;
  END IF;
  IF "__rowed" && '{"__delta_olds_stage_zniusokvuz"}'::"pg_catalog"."text"[] THEN
    PERFORM 1 FROM (SELECT "r1"."at" FROM "pg_temp"."__delta_olds_stage_zniusokvuz" AS "r1") AS "found";
  END IF;
END`;

describe("judgeBlocksOf", () => {
  it("reads every block of an installed body, with the tables and the temporary deltas it reads", () => {
    const blocks = judgeBlocksOf("__judge_attempt_ab12cd34ef", body);

    assert.strictEqual(blocks.length, 2);
    assert.deepStrictEqual(
      blocks.map(({ name }) => name),
      ["__judge_attempt_ab12cd34ef#0", "__judge_attempt_ab12cd34ef#1"],
    );
    assert.match(
      blocks[0]?.sql ?? "",
      /^SELECT 1 FROM \(SELECT "r1"\."c1" FROM .*';'\)\) AS "found"$/u,
    );
    assert.deepStrictEqual([...(blocks[0]?.tables ?? [])], ["attempt"]);
    assert.deepStrictEqual([...(blocks[0]?.deltas ?? [])], []);
    assert.deepStrictEqual([...(blocks[1]?.tables ?? [])], ["stage"]);
    assert.deepStrictEqual([...(blocks[1]?.deltas ?? [])], ["__delta_olds_stage_zniusokvuz"]);
  });

  it("reads no block where a body holds none", () => {
    assert.strictEqual(judgeBlocksOf("__judge_none", "BEGIN RETURN; END").length, 0);
  });
});

describe("deltaTablesOf", () => {
  it("reads each delta table a capture body creates, and no sentinel", () => {
    const tables = deltaTablesOf(`BEGIN
      CREATE TEMPORARY TABLE "pg_temp"."__sentinel_i3endrwe6b" ("__written" "pg_catalog"."text"[]) ON COMMIT DELETE ROWS;
      CREATE TEMPORARY TABLE "pg_temp"."__delta_news_decision_46wdjalzy7" ("at" bigint, "child" "pg_catalog"."text", "__count" bigint) ON COMMIT DROP;
    END`);

    assert.deepStrictEqual([...tables.keys()], ["__delta_news_decision_46wdjalzy7"]);
  });
});

describe("slopeOf", () => {
  it("is near 0 for an action whose pages stay the child's own, and near 1 for one that reads every row", () => {
    const sizes = [1, 10, 100];

    assert.isBelow(Math.abs(slopeOf(sizes.map((size) => ({ pages: 400, size })))), descentSlope);
    assert.isBelow(
      slopeOf(sizes.map((size, at) => ({ pages: 400 + 40 * at, size }))),
      descentSlope,
    );
    assert.isAbove(slopeOf(sizes.map((size) => ({ pages: 400 * size, size }))), 0.99);
  });
});

/**
 * A single statement's units as grizzle serves them (runtime/write/parted.ts PartedUnit): an
 * always unit of two arms, its CTE taking one parameter; a part whose CTEs print empty, its arm
 * taking two; and a part with a CTE and an arm of one parameter each.
 */
const units: readonly ServedUnit[] = [
  {
    arms: [
      { head: 'SELECT "c1" FROM "r1" WHERE "c2" = ', holes: [{ after: "", hole: 0 }] },
      { head: "SELECT 0 WHERE false", holes: [] },
    ],
    ctes: {
      head: '"r1"("c1", "c2") AS MATERIALIZED (SELECT ',
      holes: [{ after: ", 1)", hole: 0 }],
    },
    kind: "always",
    params: [{}],
  },
  {
    arm: {
      head: "SELECT ",
      holes: [
        { after: " WHERE ", hole: 0 },
        { after: "", hole: 1 },
      ],
    },
    ctes: { head: "", holes: [] },
    kind: "part",
    params: [{}, {}],
  },
  {
    arm: { head: 'SELECT "c3" FROM "r3" WHERE "c3" = ', holes: [{ after: "", hole: 0 }] },
    ctes: { head: '"r3"("c3") AS (SELECT ', holes: [{ after: ")", hole: 0 }] },
    kind: "part",
    params: [{}],
  },
];

describe("assembledText", () => {
  it("assembles a single statement as grizzle does: each arm a cut text placed after its unit's parameters", () => {
    assert.strictEqual(
      assembledText(units),
      [
        'WITH "r1"("c1", "c2") AS MATERIALIZED (SELECT $1, 1),',
        '"r3"("c3") AS (SELECT $4)',
        'SELECT "c1" FROM "r1" WHERE "c2" = $1',
        "UNION ALL",
        "SELECT 0 WHERE false",
        "UNION ALL",
        "SELECT $2 WHERE $3",
        "UNION ALL",
        'SELECT "c3" FROM "r3" WHERE "c3" = $4',
      ].join("\n"),
    );
  });

  it("heads the text with no WITH where no unit has CTEs", () => {
    assert.strictEqual(assembledText(units.slice(1, 2)), "SELECT $1 WHERE $2");
  });
});
