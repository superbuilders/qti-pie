/**
 * A recorded application's request operands and its grader, on the lease's result database (the
 * result composition, `#ledger/test/result-level.ts`, which the ledger's global setup installs,
 * `#ledger/test/result-install.ts`): an item of two essays, each scored by its own `rubric-score`
 * application on one rubric group, its document placed by two assemblies, answered with every
 * assignment of a text to each response ({@link space}), one text in both among them. It runs
 * wherever a lane names its lease (pantry's `QTI_PIE_PG_*`), and is skipped elsewhere, as every
 * database suite is.
 *
 * The oracle is this table, written from the sources apart from the code:
 *
 * - A `qti-custom-operator`'s operands are its child expressions ("The custom operator provides an
 *   extension mechanism for defining operations not currently supported by this specification", ASI
 *   `qti-custom-operator`), and `rubric-score`'s contract names four by rank, its `response` the
 *   essay it scores (`#ledger/registry/operators.ts`); so each application is a request of its own,
 *   with its own response, however its response's value compares with another's. Two applications
 *   whose operands' values are equal are two requests, never one.
 * - An application waits for its evaluation while its reply is outstanding: the attempt is
 *   `pendingResponseProcessing` and holds no credit until it is processed (Results Reporting,
 *   `sessionStatus`; ASI Table 5.37, an outcome's value set by response processing).
 * - The registry's `RubricGrader` is one grader a rubric group, by its item's document and the `id`
 *   of the scorer rubric block its applications name (its definition,
 *   `#ledger/registry/levels.ts`): two applications of one group, and two assemblies placing its
 *   document, are one grader.
 */
import { randomBytes } from "node:crypto";
import { Sha256 } from "@bjornpagen/grizzle";
import { factsDecoder } from "@bjornpagen/grizzle/compile";
import { Db } from "@bjornpagen/grizzle/runtime";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, int, map } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, layer } from "@effect/vitest";
import { importRowsOf } from "@qti-pie/pantry/import/program.ts";
import { readPackage } from "@qti-pie/pantry/import/read.ts";
import { Array as Arr, Duration, Effect, FileSystem, Option, Result } from "effect";
import { lease, suiteLayerOf, SuiteLogin } from "#ledger/test/result-suite.ts";
import { grader, ResultLevel, rubricUse } from "#ledger/test/result-level.ts";

/**
 * How long one case may run before it is stopped and reported, the file's one guard on time: a
 * write or a read that runs past it is hung, whatever the machine's load.
 */
const caseHang = Duration.minutes(2);

/**
 * This run's own token, in the name of the package it publishes, since a package is closed and
 * never published twice.
 */
const run = randomBytes(6).toString("hex");

const PACKAGE = `ledger-app-operands-${run}`;

const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

const rubricScore = "tag:superbuilders.school,2026:qti/custom-operator/rubric-score";

/**
 * The item's document, and the two assemblies that place it.
 */
const ITEM = "items/pair.xml";

const ASSEMBLIES = ["first.xml", "second.xml"] as const;

/**
 * The item's rubric group: the `id` of its one scorer rubric block, which both applications name.
 */
const RUBRIC = "RUBRIC";

/**
 * The item's MAXSCORE default, each application's `maximum` operand.
 */
const maximum = 2;

/**
 * The two essays, each its own response, scored by its own application (`DRAW_<response>`), every
 * other operand of the two equal: one rubric, one maximum, one draw.
 */
const RESPONSES = ["RESPONSE_A", "RESPONSE_B"] as const;

type Response = (typeof RESPONSES)[number];

const application = (response: Response) =>
  `<qti-set-outcome-value identifier="DRAW_${response}"><qti-custom-operator class="rubric-score" definition="${rubricScore}"><qti-variable identifier="${response}"/><qti-base-value base-type="identifier">${RUBRIC}</qti-base-value><qti-default identifier="MAXSCORE"/><qti-base-value base-type="integer">1</qti-base-value></qti-custom-operator></qti-set-outcome-value>`;

const itemXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="pair" title="pair" adaptive="false" time-dependent="false" xml:lang="en">
${RESPONSES.map((response) => `<qti-response-declaration identifier="${response}" cardinality="single" base-type="string"/>`).join("")}<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>${String(maximum)}</qti-value></qti-default-value></qti-outcome-declaration>${RESPONSES.map((response) => `<qti-outcome-declaration identifier="DRAW_${response}" cardinality="record" view="author"/>`).join("")}<qti-item-body><qti-rubric-block use="${rubricUse}" view="scorer" id="${RUBRIC}"><qti-content-body><p>Award 1 for a force named with its direction.</p></qti-content-body></qti-rubric-block>${RESPONSES.map((response) => `<qti-extended-text-interaction response-identifier="${response}"/>`).join("")}</qti-item-body><qti-response-processing>${RESPONSES.map(application).join("")}<qti-set-outcome-value identifier="SCORE"><qti-sum>${RESPONSES.map((response) => `<qti-field-value field-identifier="score"><qti-variable identifier="DRAW_${response}"/></qti-field-value>`).join("")}</qti-sum></qti-set-outcome-value></qti-response-processing>
</qti-assessment-item>`;

const assemblyXml = (path: string) => {
  const identifier = path.replace(".xml", "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="${identifier}" title="${identifier}"><qti-test-part identifier="part" navigation-mode="nonlinear" submission-mode="individual"><qti-assessment-section identifier="section" title="section" visible="true"><qti-assessment-item-ref identifier="pair" href="${ITEM}"/></qti-assessment-section></qti-test-part>
</qti-assessment-test>`;
};

const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="${PACKAGE}"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="pair" type="imsqti_item_xmlv3p0" href="${ITEM}"><file href="${ITEM}"/></resource>${ASSEMBLIES.map((path) => `<resource identifier="${path.replace(".xml", "")}" type="imsqti_test_xmlv3p0" href="${path}"><file href="${path}"/><dependency identifierref="pair"/></resource>`).join("")}</resources></manifest>`;

/**
 * A case: the text each response is answered with, and the case's own place in the space, which
 * names its child.
 */
type Case = Readonly<{ texts: Readonly<Record<Response, string>>; place: string }>;

/**
 * The text a response is answered with, one of two forces: the values the relation's key turns on,
 * two responses whose texts are equal (which a relation keyed by the text alone would collapse) or
 * differ.
 */
const forceOf = (choice: number) => (choice === 0 ? "A push." : "A pull.");

/**
 * The space: one of the two texts for each response, drawn from its bounds, every assignment of a
 * text to each response, so two responses hold one text in half of it and two texts in the other.
 */
const space = map(
  array(int(0, 1), { max: RESPONSES.length, min: RESPONSES.length }),
  (choices) => ({
    place: choices.join(""),
    texts: { RESPONSE_A: forceOf(choices[0] ?? 0), RESPONSE_B: forceOf(choices[1] ?? 0) },
  }),
);

/**
 * A case's name, its two texts.
 */
const nameOf = (c: Case) =>
  RESPONSES.map((response) => `${response} "${c.texts[response]}"`).join(", ");

const situations = ["one text in both responses", "two texts"] as const;

type Situation = (typeof situations)[number];

/**
 * Grizzle's decoder of a write's facts, the one admission of the host rows a case writes.
 */
const decoder = Result.getOrThrow(factsDecoder(ResultLevel));

const rowsOf = <K extends Parameters<typeof decoder.decode>[0]>(
  relation: K,
  rows: readonly unknown[],
) => Result.getOrThrow(decoder.decode(relation, rows));

/**
 * The seed every case's item session draws under, which nothing the table reads depends on.
 */
const SEED = Sha256.ofBytes(new TextEncoder().encode("app-operands"));

/**
 * The control a case's item stage is delivered under: one attempt, its feedback once closed, no
 * solution and no validation.
 */
const directControl = {
  maxAttempts: 1n,
  showFeedback: true,
  showSolution: false,
  validateResponses: false,
} as const;

/**
 * The package, published once for the file through the suite's login.
 */
const published = Effect.gen(function* publish() {
  const { suite } = yield* SuiteLogin;
  const fs = yield* FileSystem.FileSystem;
  const dir = yield* fs.makeTempDirectoryScoped({ prefix: `${PACKAGE}-` });
  yield* fs.makeDirectory(`${dir}/items`, { recursive: true });
  yield* fs.writeFileString(`${dir}/imsmanifest.xml`, manifestXml);
  yield* fs.writeFileString(`${dir}/${ITEM}`, itemXml);
  yield* Effect.forEach(
    ASSEMBLIES,
    (path) => fs.writeFileString(`${dir}/${path}`, assemblyXml(path)),
    { discard: true },
  );

  const read = yield* readPackage(dir, PACKAGE);
  const rows = yield* importRowsOf(read);
  const db = yield* Db.open(suite.roles.result_runner, {});
  const outcome = yield* db.workload.publish.once({
    facts: { insert: rows.insert },
    params: { package: rows.package },
  });
  assert.include(["accepted", "unchanged"], outcome.kind, `${PACKAGE}: published`);
}).pipe(Effect.scoped, Effect.orDie);

/**
 * A case on a fresh child: its attempt answers both responses, is graded at its submission, and is
 * read back, every read held to the table in this module's header. Every read is compared as it
 * comes back, never sorted by the client (the canonical-order ruling, 2026-11-24): grizzle returns
 * a read that states no order in its result key's order, ascending, so the pending applications of
 * one attempt come by their operator's place, each response's application in its document's order;
 * and the operands are compared by their key, a map from each row's response identifier, with its
 * count beside it, so no two rows can meet under one key unseen.
 */
const holdCase = (c: Case, child: string, note: (situation: Situation) => void) =>
  Effect.gen(function* hold() {
    const name = nameOf(c);
    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const key = { child, n: 0n, package: PACKAGE, path: ITEM };
    const stage = 1n;
    yield* db.workload.begin.once({
      facts: {
        insert: { StageControl: rowsOf("StageControl", [{ child, stage, ...directControl }]) },
      },
      params: { child, package: PACKAGE, path: ITEM, seed: SEED, stage },
    });
    yield* db.workload.facts.once({
      facts: {
        insert: {
          Attempt: rowsOf("Attempt", [key]),
          ProcessedAttempt: rowsOf("ProcessedAttempt", []),
          ResponseSnapshot: rowsOf("ResponseSnapshot", [{ ...key, kind: "attempt" }]),
          SnapshotMultipleIdentifier: rowsOf("SnapshotMultipleIdentifier", []),
          SnapshotSingleBoolean: rowsOf("SnapshotSingleBoolean", []),
          SnapshotSingleFloat: rowsOf("SnapshotSingleFloat", []),
          SnapshotSingleString: rowsOf(
            "SnapshotSingleString",
            RESPONSES.map((response) => ({ ...key, value: c.texts[response], variable: response })),
          ),
        },
      },
      params: {},
    });
    yield* db.workload.grade.once({ facts: {}, params: key });

    const atChild = { facts: {}, params: { child } };
    const statuses = Arr.fromIterable(yield* db.workload.statusesOf.once(atChild));
    const pending = Arr.fromIterable(yield* db.workload.applicationsOf.once(atChild));
    const operands = Arr.fromIterable(yield* db.workload.operandsOf.once(atChild));
    const credit = Arr.fromIterable(yield* db.workload.creditsOf.once({ facts: {}, params: key }));
    const graders = Arr.fromIterable(
      yield* db.workload.gradersOf.once({ facts: {}, params: { package: PACKAGE } }),
    );

    note(c.texts.RESPONSE_A === c.texts.RESPONSE_B ? "one text in both responses" : "two texts");
    assert.deepStrictEqual<unknown>(
      statuses.map((row) => [row.path, row.status]),
      [[ITEM, "pendingResponseProcessing"]],
      `${name}: the attempt waits for its applications`,
    );
    assert.deepStrictEqual(credit, [], `${name}: no credit while it waits`);
    assert.strictEqual(
      Arr.dedupe(pending.map((row) => row.operator)).length,
      RESPONSES.length,
      `${name}: PendingApplication, one application a response`,
    );
    assert.strictEqual(
      operands.length,
      RESPONSES.length,
      `${name}: ApplicationOperands, one request a response, never one for two equal texts`,
    );
    assert.deepStrictEqual<unknown>(
      Object.fromEntries(
        operands.map((row) => [row.identifier, [row.response, row.rubric, row.grader]] as const),
      ),
      Object.fromEntries(
        RESPONSES.map(
          (response) => [response, [c.texts[response], RUBRIC, grader.version]] as const,
        ),
      ),
      `${name}: ApplicationOperands, each request by its response's identifier, with that response's own text`,
    );

    const operatorOf = Object.fromEntries(operands.map((row) => [row.identifier, row.operator]));
    assert.deepStrictEqual<unknown>(
      pending.map((row) => row.operator),
      RESPONSES.map((response) => operatorOf[response]),
      `${name}: PendingApplication, each response's application with its request's operands, in key order`,
    );
    assert.deepStrictEqual<unknown>(
      graders.map((row) => [row.path, row.rubric, row.use, row.grader]),
      [[ITEM, RUBRIC, rubricUse, grader.version]],
      `${name}: RubricGrader, one grader for the group, its two applications and two assemblies one`,
    );
  });

describe.skipIf(Option.isNone(lease))(
  "A recorded application's operands, on the lease's result database",
  () => {
    layer(suiteLayerOf("app_operands"), { excludeTestServices: true })(
      "one request an application, one grader a rubric group",
      (it) => {
        it.effect(
          "holds every assignment of a text to each response, one text in both among them",
          (ctx) =>
            Effect.gen(function* everyCase() {
              yield* published;

              return yield* searched(
                ctx,
                exhaust(
                  {
                    box: `one of two texts for each of ${String(RESPONSES.length)} responses, every assignment`,
                    caseHang,
                    coverage: requiredInSpace<Situation>(situations),
                    generator: space,
                    literal: (c) => nameOf(c),
                    oracle: {
                      kind: "specification",
                      name: "the table in this module's header: ASI qti-custom-operator, rubric-score's contract, Results Reporting sessionStatus, ASI Table 5.37 and RubricGrader's definition",
                    },
                    suite: "ledger/app-operands",
                  },
                  (c, note) =>
                    holdCase(c, `user_appoperands${run}${c.place}`, (situation) => {
                      note.note(situation);
                    }).pipe(Effect.orDie),
                ),
              );
            }),
        );
      },
    );
  },
);
