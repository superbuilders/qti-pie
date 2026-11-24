/**
 * The ledger's planning budget: the result composition's student actions
 * (`#ledger/test/result-level.ts`, the sitting programs every application composes), measured by
 * `@qti-pie/plan-budget` on a scratch installation of the composition, at 1x, 10x and 100x
 * sittings.
 *
 * The content is one package of twenty choice items, each with its own match-correct response
 * processing, and two tests over them: `std.xml` (nonlinear, simultaneous) and `rate.xml` (linear,
 * individual, the rate test's shape), published through the suite's own `publish`. A seed child's
 * sitting is a whole path: its take, its entry, each member presented and saved twice (std) or
 * answered (rate), and its finish.
 *
 * - `start`: the entry into a taken test (`enterTest`).
 * - `present`: a member presented (`presentItem`).
 * - `save`: a response saved (`saveTestItem`).
 * - `answer`: an individual part's attempt, graded in the same transaction (`answerTestItem`).
 * - `suspend` and `resume`: the sitting suspended (`suspendTest`), and entered again (`enterTest`).
 * - `submit`: the test ended and finished (`finishTest`: endTest, then finishTestOf).
 * - `beacon`: the sitting's presence beacon (`beaconTest`), measured warm at its own bar of 10 ms, on
 *   a connection that already sent one, as the browser sends one a second: from PRESENCE-LEDGER's
 *   Presence on, one put of the sitting's growing window.
 *
 * `--only <name,…>` measures those actions alone, as a run that scopes its heavy arm does.
 *
 * Run from this package: `node budget/plan-budget.ts --scales <scale,…> --repeats <n> --out
 * <records.jsonl>`, with pantry's `QTI_PIE_PG_*` settings naming the scratch cluster and its
 * database, `PLAN_BUDGET_SOCKET` the cluster's socket folder, which its superuser reaches, and
 * `QTI_PIE_RESULT_MIGRATIONS` the generated result composition's folder, each required.
 *
 * @module
 */
import { mkdtempSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { Db, DbLayer, LiveSource, roleNameOf, served } from "@bjornpagen/grizzle/runtime";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { clusterDatabase, loginConnection } from "@qti-pie/pantry/db/connection.ts";
import { importRowsOf } from "@qti-pie/pantry/import/program.ts";
import { readPackage } from "@qti-pie/pantry/import/read.ts";
import type { StudentAction, StudentCallFailed } from "@qti-pie/plan-budget/actions.ts";
import { cold, warm } from "@qti-pie/plan-budget/actions.ts";
import { accepted, acceptedOrHeld, opened } from "@qti-pie/plan-budget/calls.ts";
import {
  choiceItems,
  choicePackage,
  nextOf,
  rateTest,
  stdTest,
  writeChoicePackage,
} from "@qti-pie/plan-budget/content.ts";
import { copyUnits } from "@qti-pie/plan-budget/population.ts";
import { measureActions } from "@qti-pie/plan-budget/run-actions.ts";
import { Config, Duration, Effect, Layer } from "effect";
import { Client } from "pg";
import { responseParamsOf } from "#ledger/served-values.ts";
import type { ResultSuite } from "#ledger/test/result-level.ts";

const { values } = parseArgs({
  options: {
    only: { type: "string" },
    out: { type: "string" },
    populate: { type: "boolean" },
    repeats: { type: "string" },
    scales: { type: "string" },
  },
});

/**
 * The generated result composition's folder, which `grizzle.result.config.ts` generates into.
 */
const migrations = Effect.runSync(Config.String("QTI_PIE_RESULT_MIGRATIONS"));

const suite = served<typeof ResultSuite>(
  JSON.parse(readFileSync(path.join(migrations, "qti/served/result_suite.json"), "utf-8")),
  "result_suite",
);

/**
 * The presence beacon's bar: 10 ms of database time, warm, flat from 1x to 100x (edullm-bd,
 * 2026-11-23).
 *
 * @limitKind product
 * @owner Bjorn's planning budget, as edullm-bd stated the beacon's (edullm out/rc-cutover/PRESENCE.md)
 * @unit milliseconds of database time
 * @scope one presence beacon, on a connection that already sent one
 * @constraint the bar the beacon is judged by, warm
 * @source edullm-bd to PLAN-BUDGET, 2026-11-23: "≤ 10 ms of database time, warm, flat from 1× to 100×"
 * @verified 2026-11-23
 */
const beaconBarMs = 10;

/**
 * The decision every seeded sitting is taken under: the seed its members' processing draws from.
 */
const DECISION = "7d3c2a4e-58b1-4f6a-9c0d-2b8e5f1a6c34";

const layerOf = Effect.gen(function* layerOfSuite() {
  const connectionOf = yield* loginConnection;
  const connection = connectionOf(suite);

  return () =>
    DbLayer.make({
      ...connection,
      login: suite,
      pool: { idleTimeoutMs: Duration.toMillis(Duration.minutes(10)), max: 1, min: 0 },
    }).pipe(Layer.provide(LiveSource.layer({ ...connection, login: suite })));
});

const openDb = () => Db.open(suite.roles.result_runner, {});

type SuiteDb = Effect.Success<ReturnType<typeof openDb>>;

const sittingOf = (child: string) => ({ child, stage: 1n });

const choice = (value: string) =>
  responseParamsOf({
    RESPONSE: {
      baseType: "identifier",
      cardinality: "single",
      values: [{ baseType: "identifier", value }],
    },
  });

/**
 * A sitting taken as the test runtime takes one (`takeSitting`): its test session and each member's
 * item session, at the decision's seed.
 */
const take = (db: SuiteDb, child: string, test: string) =>
  accepted(
    "takeSitting",
    db.workload.takeSitting.once({
      facts: {},
      params: { ...sittingOf(child), package: choicePackage, path: test, seed: DECISION },
    }),
  );

/**
 * A candidate session entered at the member `item` names, the first at the start and the one last
 * presented on a resumption.
 */
const enter = (db: SuiteDb, child: string, item: string) =>
  accepted(
    "enterTest",
    db.workload.enterTest.once({ facts: {}, params: { ...sittingOf(child), item } }),
  );

const present = (db: SuiteDb, child: string, item: string) =>
  accepted(
    "presentItem",
    db.workload.presentItem.once({ facts: {}, params: { ...sittingOf(child), item } }),
  );

const save = (db: SuiteDb, child: string, item: string, value: string) =>
  Effect.flatMap(choice(value), (given) =>
    accepted(
      "saveTestItem",
      db.workload.saveTestItem.once({
        facts: {},
        params: { ...sittingOf(child), given: 1n, item, ...given },
      }),
    ),
  );

const answer = (db: SuiteDb, child: string, item: string, value: string) =>
  Effect.flatMap(choice(value), (given) =>
    accepted(
      "answerTestItem",
      db.workload.answerTestItem.once({
        facts: {},
        params: { ...sittingOf(child), given: 1n, item, next: nextOf(item), ...given },
      }),
    ),
  );

const beacon = (db: SuiteDb, child: string) =>
  accepted("beaconTest", db.workload.beaconTest.once({ facts: {}, params: sittingOf(child) }));

const suspend = (db: SuiteDb, child: string) =>
  accepted("suspendTest", db.workload.suspendTest.once({ facts: {}, params: sittingOf(child) }));

const finish = (db: SuiteDb, child: string) =>
  accepted("finishTest", db.workload.finishTest.once({ facts: {}, params: sittingOf(child) }));

const [firstItem = "q01", secondItem = "q02"] = choiceItems;

/**
 * A child's every member presented and saved, as one who answered them all before submitting.
 */
const savedAll = (db: SuiteDb, child: string) =>
  Effect.forEach(
    choiceItems.entries(),
    ([k, q]) =>
      Effect.andThen(
        k > 0 ? present(db, child, q) : Effect.void,
        save(db, child, q, k % 3 === 0 ? "A" : "C"),
      ),
    { discard: true },
  );

/**
 * A seed child's whole sitting: three in four std, one in four rate.
 */
const fullPath = (db: SuiteDb, child: string, n: number) =>
  Effect.gen(function* fullPathOf() {
    const rate = n % 4 === 3;

    yield* take(db, child, rate ? rateTest : stdTest);
    yield* enter(db, child, firstItem);

    for (const [k, q] of choiceItems.entries()) {
      if (rate) {
        yield* answer(db, child, q, k % 3 === 0 ? "A" : "C");
      } else {
        if (k > 0) {
          yield* present(db, child, q);
        }

        yield* save(db, child, q, k % 3 === 0 ? "A" : "C");
        yield* save(db, child, q, "C");
      }
    }

    yield* finish(db, child);
  });

const withDb = <A, R>(f: (db: SuiteDb) => Effect.Effect<A, StudentCallFailed, R>) =>
  opened(openDb(), f);

/**
 * The child's sitting's beacon, which the browser repeats on one connection: measured warm, its
 * connection warmed by a beacon before it.
 */
const beaconed = (child: string) => withDb((db) => beacon(db, child));

const taken = (test: string) => (child: string) => withDb((db) => take(db, child, test));

const entered = (test: string) => (child: string) =>
  withDb((db) => Effect.andThen(take(db, child, test), enter(db, child, firstItem)));

/**
 * The package, published through the suite's own `publish`: accepted the first time, and unchanged
 * after, since a package's content is closed and its facts are already held, so no read of the
 * installation's own tables decides whether to.
 */
const publish = Effect.scoped(
  Effect.gen(function* publishPackage() {
    const dir = mkdtempSync(path.join(os.tmpdir(), `${choicePackage}-`));

    writeChoicePackage(dir);

    const rows = yield* importRowsOf(yield* readPackage(dir, choicePackage));
    const layer = yield* layerOf;
    const context = yield* Layer.build(layer());

    yield* opened(Effect.provide(openDb(), context), (db) =>
      acceptedOrHeld(
        "publish",
        db.workload.publish.once({
          facts: { insert: rows.insert },
          params: { package: rows.package },
        }),
      ),
    );
  }),
);

/**
 * The run: the actions measured at each of its scales, each its number of times, their records
 * appended to its file.
 */
interface Run {
  readonly out: string;
  readonly repeats: number;
  readonly scales: readonly number[];
}

const program = (run: Run) =>
  Effect.gen(function* planBudget() {
    const { database, port, socket } = yield* Config.all({
      database: clusterDatabase,
      port: Config.Port("QTI_PIE_PG_PORT"),
      socket: Config.String("PLAN_BUDGET_SOCKET"),
    });
    const secrets = path.join(os.homedir(), ".local/var/plan-budget", database);
    const statistics = new Client({
      database: "postgres",
      host: socket,
      port,
      user: os.userInfo().username,
    });
    const admin = new Client({ database, host: socket, port, user: os.userInfo().username });

    yield* Effect.promise(() => statistics.connect());
    yield* Effect.promise(() => admin.connect());

    yield* publish;
    yield* Effect.logInfo(`${choicePackage} published, or held already`);

    const layer = yield* layerOf;
    const actions: readonly StudentAction<Effect.Services<ReturnType<typeof openDb>>>[] = [
      {
        barMs: 100,
        name: "start",
        prepare: (child) =>
          Effect.as(taken(stdTest)(child), cold(withDb((db) => enter(db, child, firstItem)))),
      },
      {
        barMs: 100,
        name: "present",
        prepare: (child) =>
          Effect.as(entered(stdTest)(child), cold(withDb((db) => present(db, child, secondItem)))),
      },
      {
        barMs: 100,
        name: "save",
        prepare: (child) =>
          Effect.as(entered(stdTest)(child), cold(withDb((db) => save(db, child, firstItem, "C")))),
      },
      {
        barMs: 100,
        name: "answer",
        prepare: (child) =>
          Effect.as(
            entered(rateTest)(child),
            cold(withDb((db) => answer(db, child, firstItem, "C"))),
          ),
      },
      {
        barMs: 100,
        name: "suspend",
        prepare: (child) =>
          Effect.as(entered(stdTest)(child), cold(withDb((db) => suspend(db, child)))),
      },
      {
        barMs: beaconBarMs,
        name: "beacon",
        prepare: (child) =>
          Effect.as(entered(stdTest)(child), warm(beaconed(child), beaconed(child))),
      },
      {
        barMs: 100,
        name: "resume",
        prepare: (child) =>
          Effect.as(
            withDb((db) =>
              Effect.andThen(
                Effect.andThen(take(db, child, stdTest), enter(db, child, firstItem)),
                suspend(db, child),
              ),
            ),
            cold(withDb((db) => enter(db, child, firstItem))),
          ),
      },
      {
        barMs: 100,
        name: "submit",
        prepare: (child) =>
          Effect.as(
            withDb((db) =>
              Effect.andThen(
                Effect.andThen(take(db, child, stdTest), enter(db, child, firstItem)),
                savedAll(db, child),
              ),
            ),
            cold(withDb((db) => finish(db, child))),
          ),
      },
    ];
    const verdicts = yield* measureActions(
      {
        actions:
          values.populate === true
            ? []
            : actions.filter(
                ({ name }) => values.only === undefined || values.only.split(",").includes(name),
              ),
        admin,
        composition: "ledger-result",
        grow: copyUnits("child"),
        pending: [],
        repeats: run.repeats,
        scales: run.scales,
        seed: (child, ordinal) => withDb((db) => fullPath(db, child, ordinal)),
        seedUnits: 20,
        state: path.join(secrets, "population.json"),
        subject: {
          database,
          layer,
          loginRole: roleNameOf(suite, { rolePrefix: database }),
          statistics,
        },
        unitOf: (name) => name,
        unitsAt1x: 1894,
      },
      run.out,
    );

    for (const verdict of verdicts) {
      yield* Effect.logInfo(
        `${verdict.verdict === "pass" ? "pass" : "FAIL"} ledger-result.${verdict.action}: ${verdict.reasons.join("; ") || "within the bar at every scale, flat"} ${JSON.stringify(verdict.byScale)}`,
      );
    }

    yield* Effect.promise(() => statistics.end());
    yield* Effect.promise(() => admin.end());

    if (verdicts.some(({ verdict }) => verdict === "fail")) {
      process.exitCode = 1;
    }
  });

const { out, repeats, scales } = values;

NodeRuntime.runMain(
  (out === undefined || repeats === undefined || scales === undefined
    ? Effect.andThen(
        Effect.logError(
          "usage: plan-budget.ts --scales <scale,…> --repeats <n> --out <records.jsonl>",
        ),
        Effect.sync(() => {
          process.exitCode = 2;
        }),
      )
    : program({ out, repeats: Number(repeats), scales: scales.split(",").map(Number) })
  ).pipe(Effect.provide(NodeServices.layer)),
);
