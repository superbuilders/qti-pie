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
 * - `beacon`: the presence beacon, PRESENCE-LEDGER's growing window; declared, and failing, until it
 *   lands.
 *
 * Run from this package: `node budget/plan-budget.ts --database <scratch database> --migrations
 * <the generated result composition's folder>`, with pantry's `QTI_PIE_PG_*` settings naming the
 * scratch cluster.
 *
 * @module
 */
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { Db, DbLayer, LiveSource, roleNameOf, served } from "@bjornpagen/grizzle/runtime";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { loginConnection } from "@qti-pie/pantry/db/connection.ts";
import { importRowsOf } from "@qti-pie/pantry/import/program.ts";
import { readPackage } from "@qti-pie/pantry/import/read.ts";
import { StudentCallFailed } from "@qti-pie/plan-budget/actions.ts";
import type { StudentAction } from "@qti-pie/plan-budget/actions.ts";
import { copyUnits } from "@qti-pie/plan-budget/population.ts";
import { measureActions } from "@qti-pie/plan-budget/run-actions.ts";
import { Cause, Duration, Effect, Layer } from "effect";
import { Client } from "pg";
import { responseParamsOf } from "#ledger/served-values.ts";
import type { ResultSuite } from "#ledger/test/result-level.ts";

const { values } = parseArgs({
  options: {
    database: { type: "string" },
    migrations: { type: "string" },
    out: { type: "string" },
    populate: { type: "boolean" },
    repeats: { type: "string" },
    scales: { type: "string" },
  },
});

const database = values.database ?? "pb_ledger";

const secrets = path.join(os.homedir(), ".local/var/plan-budget", database);

const port = Number(process.env["QTI_PIE_PG_PORT"] ?? "5493");

const socket = path.join(process.env["XDG_RUNTIME_DIR"] ?? "", "postgresql-edullm-planbudget");

const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

const PACKAGE = "plan-budget";

const items = Array.from({ length: 20 }, (_, k) => `q${String(k + 1).padStart(2, "0")}`);

const STD = "std.xml";

const RATE = "rate.xml";

const itemXml = (id: string) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="${id}" title="${id}" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"><qti-correct-response><qti-value>C</qti-value></qti-correct-response></qti-response-declaration>
<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>0</qti-value></qti-default-value></qti-outcome-declaration>
<qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>1</qti-value></qti-default-value></qti-outcome-declaration>
<qti-item-body><qti-choice-interaction response-identifier="RESPONSE" max-choices="1"><qti-prompt>${id}: which is even?</qti-prompt><qti-simple-choice identifier="A">7</qti-simple-choice><qti-simple-choice identifier="B">9</qti-simple-choice><qti-simple-choice identifier="C">10</qti-simple-choice></qti-choice-interaction></qti-item-body>
<qti-response-processing><qti-response-condition><qti-response-if><qti-match><qti-variable identifier="RESPONSE"/><qti-correct identifier="RESPONSE"/></qti-match><qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value></qti-response-if><qti-response-else><qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">0</qti-base-value></qti-set-outcome-value></qti-response-else></qti-response-condition></qti-response-processing>
</qti-assessment-item>`;

const outcomes = `<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float"/>`;

const outcomeProcessing = `<qti-outcome-processing><qti-set-outcome-value identifier="SCORE"><qti-sum><qti-test-variables variable-identifier="SCORE"/></qti-sum></qti-set-outcome-value><qti-set-outcome-value identifier="MAXSCORE"><qti-sum><qti-test-variables variable-identifier="MAXSCORE"/></qti-sum></qti-set-outcome-value></qti-outcome-processing>`;

const testXml = (
  id: string,
  navigation: string,
  submission: string,
) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="${id}" title="${id}">${outcomes}<qti-test-part identifier="P" navigation-mode="${navigation}" submission-mode="${submission}"><qti-assessment-section identifier="S" title="S" visible="true">${items.map((q) => `<qti-assessment-item-ref identifier="${q}" href="items/${q}.xml"/>`).join("")}</qti-assessment-section></qti-test-part>${outcomeProcessing}
</qti-assessment-test>`;

const dependencies = items.map((q) => `<dependency identifierref="${q}"/>`).join("");

const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="${PACKAGE}"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="std" type="imsqti_test_xmlv3p0" href="${STD}"><file href="${STD}"/>${dependencies}</resource><resource identifier="rate" type="imsqti_test_xmlv3p0" href="${RATE}"><file href="${RATE}"/>${dependencies}</resource>${items.map((q) => `<resource identifier="${q}" type="imsqti_item_xmlv3p0" href="items/${q}.xml"><file href="items/${q}.xml"/></resource>`).join("")}</resources></manifest>`;

const migrations = values.migrations ?? process.env["QTI_PIE_RESULT_MIGRATIONS"] ?? "";

const suite = served<typeof ResultSuite>(
  JSON.parse(readFileSync(path.join(migrations, "qti/served/result_suite.json"), "utf-8")),
  "result_suite",
);

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

const accepted = <E, R>(call: string, effect: Effect.Effect<{ readonly kind: string }, E, R>) =>
  effect.pipe(
    Effect.mapError(
      (failed) =>
        new StudentCallFailed({ call, outcome: Cause.pretty(Cause.fail(failed)).slice(0, 400) }),
    ),
    Effect.flatMap((outcome) =>
      outcome.kind === "accepted" || outcome.kind === "unchanged"
        ? Effect.void
        : Effect.fail(new StudentCallFailed({ call, outcome: outcome.kind })),
    ),
  );

/**
 * A sitting taken as the test runtime takes one (`takeSitting`): its test session and each member's
 * item session, at the decision's seed.
 */
const take = (db: SuiteDb, child: string, test: string) =>
  accepted(
    "takeSitting",
    db.workload.takeSitting.once({
      facts: {},
      params: { ...sittingOf(child), package: PACKAGE, path: test, seed: DECISION },
    }),
  );

const enter = (db: SuiteDb, child: string) =>
  accepted("enterTest", db.workload.enterTest.once({ facts: {}, params: sittingOf(child) }));

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

const nextOf = (item: string) => {
  const k = items.indexOf(item);
  const next = items[k + 1];

  return next === undefined ? [] : [{ item: next }];
};

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

const suspend = (db: SuiteDb, child: string) =>
  accepted("suspendTest", db.workload.suspendTest.once({ facts: {}, params: sittingOf(child) }));

const finish = (db: SuiteDb, child: string) =>
  accepted("finishTest", db.workload.finishTest.once({ facts: {}, params: sittingOf(child) }));

const [firstItem = "q01", secondItem = "q02"] = items;

/**
 * A child's every member presented and saved, as one who answered them all before submitting.
 */
const savedAll = (db: SuiteDb, child: string) =>
  Effect.forEach(
    items.entries(),
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

    yield* take(db, child, rate ? RATE : STD);
    yield* enter(db, child);

    for (const [k, q] of items.entries()) {
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

const withDb = <A, E, R>(f: (db: SuiteDb) => Effect.Effect<A, E, R>) =>
  Effect.flatMap(
    Effect.mapError(
      openDb(),
      (failed) =>
        new StudentCallFailed({
          call: "Db.open",
          outcome: Cause.pretty(Cause.fail(failed)).slice(0, 400),
        }),
    ),
    f,
  );

const taken = (test: string) => (child: string) => withDb((db) => take(db, child, test));

const entered = (test: string) => (child: string) =>
  withDb((db) => Effect.andThen(take(db, child, test), enter(db, child)));

/**
 * The package, published once through the suite's own `publish`.
 */
const publish = Effect.scoped(
  Effect.gen(function* publishPackage() {
    const dir = mkdtempSync(path.join(os.tmpdir(), `${PACKAGE}-`));

    mkdirSync(path.join(dir, "items"), { recursive: true });
    writeFileSync(path.join(dir, "imsmanifest.xml"), manifest);
    writeFileSync(path.join(dir, STD), testXml("std", "nonlinear", "simultaneous"));
    writeFileSync(path.join(dir, RATE), testXml("rate", "linear", "individual"));

    for (const q of items) {
      writeFileSync(path.join(dir, "items", `${q}.xml`), itemXml(q));
    }

    const read = yield* readPackage(dir, PACKAGE);
    const rows = yield* importRowsOf(read);
    const layer = yield* layerOf;
    const context = yield* Layer.build(layer());
    const db = yield* Effect.provide(openDb(), context);

    yield* accepted(
      "publish",
      db.workload.publish.once({ facts: { insert: rows.insert }, params: {} }),
    );
  }),
);

const program = Effect.gen(function* planBudget() {
  const statistics = new Client({
    database: "postgres",
    host: socket,
    port,
    user: os.userInfo().username,
  });
  const admin = new Client({ database, host: socket, port, user: os.userInfo().username });

  yield* Effect.promise(() => statistics.connect());
  yield* Effect.promise(() => admin.connect());

  const published = yield* Effect.promise(() =>
    admin.query("SELECT 1 FROM qti.package WHERE name = $1", [PACKAGE]),
  );

  if (published.rowCount === 0) {
    yield* publish;
    yield* Effect.logInfo(`published ${PACKAGE}`);
  }

  const layer = yield* layerOf;
  const actions: readonly StudentAction<Effect.Services<ReturnType<typeof openDb>>>[] = [
    {
      act: (child) => withDb((db) => enter(db, child)),
      barMs: 100,
      name: "start",
      prepare: taken(STD),
      warm: false,
    },
    {
      act: (child) => withDb((db) => present(db, child, secondItem)),
      barMs: 100,
      name: "present",
      prepare: entered(STD),
      warm: false,
    },
    {
      act: (child) => withDb((db) => save(db, child, firstItem, "C")),
      barMs: 100,
      name: "save",
      prepare: entered(STD),
      warm: false,
    },
    {
      act: (child) => withDb((db) => answer(db, child, firstItem, "C")),
      barMs: 100,
      name: "answer",
      prepare: entered(RATE),
      warm: false,
    },
    {
      act: (child) => withDb((db) => suspend(db, child)),
      barMs: 100,
      name: "suspend",
      prepare: entered(STD),
      warm: false,
    },
    {
      act: (child) => withDb((db) => enter(db, child)),
      barMs: 100,
      name: "resume",
      prepare: (child) =>
        withDb((db) =>
          Effect.andThen(
            Effect.andThen(take(db, child, STD), enter(db, child)),
            suspend(db, child),
          ),
        ),
      warm: false,
    },
    {
      act: (child) => withDb((db) => finish(db, child)),
      barMs: 100,
      name: "submit",
      prepare: (child) =>
        withDb((db) =>
          Effect.andThen(
            Effect.andThen(take(db, child, STD), enter(db, child)),
            savedAll(db, child),
          ),
        ),
      warm: false,
    },
  ];
  const verdicts = yield* measureActions(
    {
      actions: values.populate === true ? [] : actions,
      admin,
      composition: "ledger-result",
      grow: copyUnits("child"),
      pending:
        values.populate === true
          ? []
          : [
              {
                barMs: 10,
                name: "beacon",
                reason:
                  "the presence beacon (Presence, a growing window keyed by a WITHOUT OVERLAPS span) is PRESENCE-LEDGER's; its bar is 10 ms of database time, warm, flat from 1x to 100x",
              },
            ],
      repeats: Number(values.repeats ?? "3"),
      scales: (values.scales ?? "1,10,100").split(",").map(Number),
      seed: (child) => withDb((db) => fullPath(db, child, Number(/\d+$/u.exec(child)?.[0] ?? "0"))),
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
    values.out ?? path.join(secrets, "actions.jsonl"),
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

NodeRuntime.runMain(program.pipe(Effect.provide(NodeServices.layer)));
