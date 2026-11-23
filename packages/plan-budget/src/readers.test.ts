/**
 * The readers the checks rest on, held to what grizzle writes: a judge function's body however it
 * is installed, the delta tables its capture functions create, and the growth slope's bound.
 */
import { assert, describe, it } from "@effect/vitest";
import { descentSlope, slopeOf } from "#plan-budget/growth.ts";
import { deltaTablesOf, judgeBlocksOf } from "#plan-budget/served.ts";

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
