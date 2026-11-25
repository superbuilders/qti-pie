/**
 * The counted work of the read every application attaches under its read of a child's item
 * sessions (`sessionsOf`, `#ledger/served-item.ts` sessionControlOf: each session with its control,
 * its openness and its attempts), held to its bound: one key probe of the session's member control
 * a session, the Ledger's `MemberControl`, which the sealed Package stores at publication, read by
 * the session's test and item document. So a session costs a sitting of 210 members no more than
 * one of 20. Before the control was stored, every read derived each member's scopes, settings and
 * nearest ones over the whole package and joined them to the child's sessions by package alone:
 * 2,283 rows read a session at 210 members against 1,195 at 20, 561,362 pages and 1.3 s for the
 * drill's read, where it reads 18 rows a session at either (MEMBERSTART, 2026-11-25).
 *
 * The work is PostgreSQL's own count, which no load moves: the read's statement as its login's
 * served file holds it (the planning budget's reading, `@qti-pie/plan-budget/served.ts`), run
 * under EXPLAIN ANALYZE as every grizzle session plans it, generically (`plan_cache_mode` at
 * `force_generic_plan`, each login role's fixed default), in a read-only transaction rolled back;
 * and of it the rows every scan of a relation returns, over all its loops, a keyed probe's one row
 * among them. Rows, not pages: a probe's pages grow with its index's depth, the bound's own log
 * factor, where its rows do not. The bound is the read's own count at the smaller sitting, so no
 * number here is a tuned allowance. The content is the planning budget's
 * (`@qti-pie/plan-budget/content.ts`): `rate.xml`, 20 choice items, and `drill.xml`, a FastMath
 * drill's 210, each taken as the test runtime takes one (`takeSitting`).
 *
 * The served statement under plain EXPLAIN ANALYZE ({@link sessionsRows}) stands in for grizzle's
 * own `db.workload.sessionsOf.explainAnalyze`, whose decode refuses every plan that reads a stored
 * derived relation's table ("statement 0 answered rows grizzle cannot read"; a read of
 * `DeliveredTest` alone is the least case), as this read's plan does. When grizzle decodes those
 * plans, the count reads its ExecutedPlan and the stand-in goes.
 *
 * @module
 */
import { randomBytes } from "node:crypto";
import path from "node:path";
import { Db } from "@bjornpagen/grizzle/runtime";
import { assert, describe, layer } from "@effect/vitest";
import { importRowsOf } from "@qti-pie/pantry/import/program.ts";
import { readPackage } from "@qti-pie/pantry/import/read.ts";
import { migrationClientOf } from "@qti-pie/pantry/test/file-database.ts";
import {
  choiceItems,
  choicePackage,
  drillItems,
  drillTest,
  rateTest,
  writeChoicePackage,
} from "@qti-pie/plan-budget/content.ts";
import { actionsOf } from "@qti-pie/plan-budget/served.ts";
import { ConfigProvider, Effect, FileSystem, Option, Schema } from "effect";
import type { QueryResultRow } from "pg";
import {
  resultDatabaseOf,
  resultMigrations,
  resultSettingsOf,
} from "#ledger/test/result-database.ts";
import { lease, suiteLayerOf, SuiteLogin } from "#ledger/test/result-suite.ts";

/**
 * The file's copy of the result database (`#ledger/test/result-suite.ts` ResultFile).
 */
const file = "member_reads";

/**
 * This run's children, so a replay of the file meets no sitting of an earlier run.
 */
const run = randomBytes(6).toString("hex");

/**
 * The decision each sitting is taken under: the seed its members' processing draws from.
 */
const DECISION = "7d3c2a4e-58b1-4f6a-9c0d-2b8e5f1a6c34";

/**
 * A node of PostgreSQL's EXPLAIN (ANALYZE, FORMAT JSON), as far as the count reads it: the relation
 * a scan names, what it returned a loop and how many loops it ran, and its children.
 */
interface PlanNode {
  readonly "Relation Name"?: string;
  readonly "Actual Rows": number;
  readonly "Actual Loops": number;
  readonly Plans?: readonly PlanNode[];
}

/**
 * The schema of a {@link PlanNode}.
 */
const PlanNodeSchema: Schema.Codec<PlanNode> = Schema.Struct({
  "Actual Loops": Schema.Number,
  "Actual Rows": Schema.Number,
  Plans: Schema.optionalKey(
    Schema.Array(Schema.suspend((): Schema.Codec<PlanNode> => PlanNodeSchema)),
  ),
  "Relation Name": Schema.optionalKey(Schema.String),
});

/**
 * EXPLAIN (ANALYZE, FORMAT JSON)'s one row: the plan of its one statement, outside data decoded
 * once here.
 */
const ExplainRow = Schema.Struct({
  "QUERY PLAN": Schema.Tuple([Schema.Struct({ Plan: PlanNodeSchema })]),
});

/**
 * The rows every scan of a relation under `node` returned, over all its loops.
 *
 * @param node - A plan's node.
 * @returns The rows its scans and its descendants' returned.
 */
const scannedRows = (node: PlanNode): number =>
  (node["Relation Name"] === undefined ? 0 : node["Actual Rows"] * node["Actual Loops"]) +
  (node.Plans ?? []).reduce((sum, child) => sum + scannedRows(child), 0);

/**
 * SessionsOf's one statement, as the result suite's served file holds it.
 *
 * @returns Its text.
 */
const sessionsStatement = (): string => {
  const action = actionsOf(path.join(resultMigrations, "qti"), "result_suite", [], new Map()).find(
    ({ action: name }) => name.endsWith(".sessionsOf"),
  );
  const [step, ...more] = action?.steps ?? [];

  assert.isTrue(step?.kind === "plan" && more.length === 0, "sessionsOf is one planned statement");

  return step?.sql ?? "";
};

/**
 * The rows sessionsOf's scans return for `child`, on the file's copy of the result database, as a
 * grizzle session plans it.
 *
 * @param child - The child whose item sessions it reads.
 * @returns The rows its scans returned.
 */
const sessionsRows = (child: string) =>
  Effect.acquireUseRelease(
    migrationClientOf(`${resultDatabaseOf(Option.getOrThrow(lease))}_${file}`).pipe(
      Effect.provide(
        ConfigProvider.layer(
          ConfigProvider.fromUnknown(resultSettingsOf(process.env, Option.getOrThrow(lease))),
        ),
      ),
      Effect.tap((client) => Effect.promise(() => client.connect())),
    ),
    (client) =>
      Effect.promise(async () => {
        await client.query("BEGIN READ ONLY");
        await client.query("SET LOCAL plan_cache_mode = force_generic_plan");
        await client.query(`PREPARE member_reads AS ${sessionsStatement()}`);
        const explained = await client.query<QueryResultRow>(
          `EXPLAIN (ANALYZE, FORMAT JSON) EXECUTE member_reads(${client.escapeLiteral(child)})`,
        );
        await client.query("ROLLBACK");

        return explained.rows;
      }).pipe(
        Effect.flatMap(Schema.decodeUnknownEffect(Schema.Tuple([ExplainRow]))),
        Effect.map(([row]) => scannedRows(row["QUERY PLAN"][0].Plan)),
      ),
    (client) => Effect.promise(() => client.end()),
  );

/**
 * The planning budget's package, published through the suite's own `publish`: accepted the first
 * time, and unchanged on a replay.
 */
const publish = Effect.scoped(
  Effect.gen(function* publishPackage() {
    const { suite } = yield* SuiteLogin;
    const fs = yield* FileSystem.FileSystem;
    const dir = yield* fs.makeTempDirectoryScoped({ prefix: `${choicePackage}-` });
    writeChoicePackage(dir);

    const rows = yield* importRowsOf(yield* readPackage(dir, choicePackage));
    const db = yield* Db.open(suite.roles.result_runner, {});
    const published = yield* db.workload.publish.once({
      facts: { insert: rows.insert },
      params: { package: rows.package },
    });

    assert.include(["accepted", "unchanged"], published.kind, "the package is published");
  }),
);

/**
 * A fresh child's sitting of `test`, taken, and its read of its item sessions counted.
 *
 * @param test - The test's path in the package.
 * @returns The sessions the read returned and the rows its scans returned.
 */
const measuredSitting = (test: string) =>
  Effect.gen(function* measure() {
    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const child = `member-reads-${run}-${test}`;
    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { child, package: choicePackage, path: test, seed: DECISION, stage: 1n },
    });

    assert.strictEqual(taken.kind, "accepted", `${test}: taken`);

    const sessions = [...(yield* db.workload.sessionsOf.once({ facts: {}, params: { child } }))]
      .length;

    return { rows: yield* sessionsRows(child), sessions } as const;
  });

describe.skipIf(Option.isNone(lease))("a sitting's reads of its members, by key", () => {
  layer(suiteLayerOf(file), { excludeTestServices: true })(
    "the read of a child's item sessions costs each session one probe of its member's control",
    (it) => {
      it.effect("reads a session of a 210-member drill in no more rows than one of 20", () =>
        Effect.gen(function* perSession() {
          yield* publish;
          const rate = yield* measuredSitting(rateTest);
          const drill = yield* measuredSitting(drillTest);

          assert.strictEqual(
            rate.sessions,
            choiceItems.length,
            "rate's sitting reads each member's",
          );
          assert.strictEqual(
            drill.sessions,
            drillItems.length,
            "drill's sitting reads each member's",
          );
          assert.isAtMost(
            drill.rows / drill.sessions,
            rate.rows / rate.sessions,
            `rows a session: ${String(drill.rows)} over ${String(drill.sessions)} at the drill, ${String(rate.rows)} over ${String(rate.sessions)} at the rate test`,
          );
        }),
      );
    },
  );
});
