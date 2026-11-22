/**
 * Specimen's generator against the database: every case `everyCase` draws, rotating cases a run,
 * written as a one-document package and imported through pantry's importer, is admitted, and plate
 * opens the admitted item. Plate grades nothing: whether the case's response scores as it predicts
 * is the QTI database grader's to say, through the ledger's answer statement (edullm's
 * `packages/data/qti-database/src/specimen-scores.db.test.ts`). Each package is
 * judged through pantry's one admission policy (`admitPackage`): at full width, and a write that
 * met a concurrent one again alone, so contention is never a verdict. A refusal is then a defect of
 * the generator, which drew invalid QTI 3.0.1, and fails with the case's `TEST_SEED` and
 * `TEST_REPLAY`; a failure that recurs alone (`Unjudged`) is the database's, and fails the case
 * too.
 *
 * Each run imports under names of its own (`run`), so a `TEST_REPLAY` imports afresh rather than
 * meeting the package an earlier run stored, and the run's scratch packages are deleted when it
 * ends.
 *
 * It needs a migrated database of pantry's (`packages/pantry/scripts/db.sh create` and `migrate`),
 * named by `QTI_PIE_PG_*` as pantry's command line reads them, so it runs only through the
 * machine's one database lock, once per landing that touches specimen, pantry's laws or plate
 * (`pnpm run test:specimen-db`), never in the free runs. The free suites draw only among the
 * floor's cases, which the admission run admits ahead (`packages/specimen/src/floor.ts`).
 *
 * @module
 */
import { createHash, randomBytes } from "node:crypto";
import { availableParallelism } from "node:os";
import path from "node:path";
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { drawn, explore } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { authorDb, ImportLive } from "@qti-pie/pantry/db/layer.ts";
import { admitPackage, writeAdmissionPackage } from "@qti-pie/pantry/test/admission.ts";
import { localMediaStore } from "@qti-pie/pantry/package/media.ts";
import { openAdmitted } from "@qti-pie/plate";
import { everyCase } from "@qti-pie/specimen/specimen";
import { Effect, FileSystem, Formatter, Layer, Option } from "effect";

/**
 * How long the search may take: a hang guard, never a budget.
 */
const searchTimeoutMs = 1_800_000;

/**
 * This run's own token, in every package name it imports under, so no run, a replay included,
 * meets a package an earlier run stored.
 */
const run = randomBytes(6).toString("hex");

/**
 * The layer the importer runs on: the author application's database and the local media store.
 */
const importer = localMediaStore.pipe(
  Layer.provideMerge(ImportLive),
  Layer.provideMerge(NodeServices.layer),
);

layer(importer, { excludeTestServices: true, timeout: searchTimeoutMs })(
  "specimen's generator against the database",
  (it) => {
    it.effect(
      "every case it draws is admitted, and plate opens it: 200 rotating cases a run beside the witnesses",
      (ctx) =>
        Effect.scoped(
          Effect.gen(function* againstTheDatabase() {
            const db = yield* authorDb;
            const fs = yield* FileSystem.FileSystem;
            const scratch = yield* fs.makeTempDirectoryScoped({ prefix: "specimen-db-" });

            return yield* searched(
              ctx,
              explore(
                {
                  caseHang: "120 seconds",
                  concurrency: availableParallelism(),
                  // The free suites' floor reaches every kind; this search is the rotating sample.
                  coverage: noCoverage,
                  draw: drawn(everyCase),
                  kept: [],
                  literal: Formatter.format,
                  oracle: {
                    kind: "universal",
                    name: "pantry's admission, then plate's open",
                  },
                  runs: 200,
                  shrink: completeShrink,
                  steerEvery: 16,
                  suite: "specimen/database",
                },
                (held) =>
                  Effect.gen(function* admitsAndOpens() {
                    const bytes = new TextEncoder().encode(held.item.xml);
                    const digest = createHash("sha256").update(bytes).digest("hex");
                    const folder = path.join(scratch, digest);

                    yield* writeAdmissionPackage(folder, {
                      at: held.item.location,
                      bytes,
                      folder: Option.none(),
                    });

                    const name = `sp-${run}-${digest}`;
                    const verdict = yield* admitPackage(db.workload, folder, name);

                    assert.deepStrictEqual(verdict, { _tag: "Admitted", name });

                    const opened = yield* openAdmitted(held.item.location, bytes);

                    assert.strictEqual(opened.verdict, "accepted");
                  }),
              ),
            );
          }),
        ),
    );
  },
);
