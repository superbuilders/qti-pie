/**
 * The importer's front door (`#pantry/import/package.ts`): its retry schedule, as
 * `RetrySchedule`'s default gives it, and on the lease its verdicts, its reruns and a
 * `commitUnknown`'s resolution by running the insert-only write again, with the failures injected
 * through `WrapApply`.
 *
 * A verdict on the lease is judged against the law oracle (`#pantry/test/oracle-verdict.ts`
 * `oracleVerdict`, a second implementation): a package the oracle accepts commits, and one it
 * refuses is refused under one of the rules its breaches keep. A disagreement is a finding of the
 * schema or the oracle, never of the package.
 */
import { randomUUID } from "node:crypto";
import { Db } from "@bjornpagen/grizzle";
import type { CallError } from "@bjornpagen/grizzle";
import { NodeServices } from "@effect/platform-node";
import { assert, it as plainIt, layer } from "@effect/vitest";
import { Clock, Effect, Fiber, Layer, Ref, Result, Schedule } from "effect";
import { TestClock } from "effect/testing";
import { describe, inject } from "vitest";
import { AuthorAppLayer } from "#pantry/db/layer.ts";
import { RetrySchedule, WrapApply } from "#pantry/import/package.ts";
import { memoryMediaStore } from "#pantry/package/media.ts";
import { importDir } from "#pantry/test/import-dir.ts";
import { packageStored } from "#pantry/test/apply-edited.ts";

import { materialize } from "#pantry/test/fixtures.ts";
import type { FixtureName } from "#pantry/test/fixtures.ts";
import { importAgreesWithOracle } from "#pantry/test/oracle-verdict.ts";
import { hasLease } from "#pantry/test/settings.ts";
import { ImportRefused } from "#pantry/import/rules.ts";
import { AuthorLogin } from "#pantry/db/served.ts";

const fixtures = inject("fixtures");

/**
 * The call error a serializable transaction's refusal ends a call with, SQLSTATE 40001 read by
 * grizzle: `transient`, with the server's report as its message and its reason.
 */
const serializationFailure: CallError = {
  kind: "transient",
  message: "could not serialize access due to concurrent update",
  reason: "SerializationFailure",
  retry: "safe",
};

/**
 * The call error of a write whose COMMIT got no answer: it may have committed.
 */
const commitUnknown: CallError = {
  kind: "commitUnknown",
  message: "the COMMIT was sent and no answer came",
  retry: "never",
};

/**
 * What a run of the default `RetrySchedule` against a failure that never clears did: the clock
 * reading at each attempt, in milliseconds after the first, and whether the retry gave up.
 */
interface RetryRun {
  readonly attemptAt: readonly number[];
  readonly gaveUp: boolean;
}

/**
 * Run the default `RetrySchedule`, read unprovided as the import reads it, against an effect that
 * always fails, on the test clock, and advance the clock well past the schedule's bound.
 */
const runRetrySchedule = Effect.gen(function* runRetrySchedule() {
  const attemptAt = yield* Ref.make<readonly number[]>([]);
  const started = yield* Clock.currentTimeMillis;
  const attempt = Effect.gen(function* failsAlways() {
    const now = yield* Clock.currentTimeMillis;

    yield* Ref.update(attemptAt, (all) => [...all, now - started]);

    return yield* Effect.fail("transient");
  });
  const fiber = yield* Effect.forkChild(Effect.result(Effect.retry(attempt, yield* RetrySchedule)));

  yield* TestClock.adjust("120 seconds");

  const result = yield* Fiber.join(fiber);
  const run: RetryRun = { attemptAt: yield* Ref.get(attemptAt), gaveUp: Result.isFailure(result) };

  return run;
});

describe("RetrySchedule's default", () => {
  plainIt.effect("keeps retrying past the fifth retry while under its time bound", () =>
    // Oracle: the specification as a checker, the schedule's contract: bounded by elapsed time,
    // not by count.
    Effect.gen(function* keepsRetrying() {
      const { attemptAt } = yield* runRetrySchedule;

      assert.isAbove(attemptAt.length, 6);
      assert.isBelow(attemptAt[6] ?? Number.POSITIVE_INFINITY, 30_000);
    }),
  );

  plainIt.effect("waits at most one second between attempts", () =>
    // Oracle: the specification as a checker, the cap of one second before jitter.
    Effect.gen(function* capsDelays() {
      const { attemptAt } = yield* runRetrySchedule;
      const gaps = attemptAt.slice(1).map((at, i) => at - (attemptAt[i] ?? 0));

      assert.isAtMost(Math.max(...gaps), 1000);
    }),
  );

  plainIt.effect("stops once thirty seconds have passed, and then fails", () =>
    // Oracle: the specification as a checker, the schedule's bound of thirty seconds: the attempt
    // that ends past it is the last.
    Effect.gen(function* stopsAtBound() {
      const { attemptAt, gaveUp } = yield* runRetrySchedule;
      const last = attemptAt.at(-1) ?? 0;

      assert.isTrue(gaveUp);
      assert.isAbove(last, 30_000);
      assert.isAtMost(last, 31_000);
    }),
  );
});

/**
 * Retries with no wait, so a test of the retry logic does not sleep.
 */
const quickly = Schedule.recurs(2);

/**
 * Fail `failures` times in a row, then succeed, retried on `schedule` while the failure is
 * transient, with the delays driven by the test clock so nothing sleeps. Gives the attempts made.
 *
 * @param schedule - The retries' schedule.
 * @param failures - How many attempts fail before one succeeds.
 * @returns The attempts made.
 */
const attemptsUnder = (schedule: Schedule.Schedule<unknown>, failures: number) =>
  Effect.gen(function* simulated() {
    const attempts = yield* Ref.make(0);
    const attempt = Effect.flatMap(
      Ref.updateAndGet(attempts, (n) => n + 1),
      (n) => (n <= failures ? Effect.fail(serializationFailure) : Effect.succeed(n)),
    );
    const fiber = yield* Effect.forkChild(Effect.result(Effect.retry(attempt, { schedule })));

    yield* TestClock.adjust("10 seconds");
    yield* Fiber.join(fiber);

    return yield* Ref.get(attempts);
  });

describe("import/package.test.ts, the retry budget", () => {
  plainIt.effect("the production schedule retries an injected failure and two real ones", () =>
    // Oracle: the specification as a checker, the schedule's time bound, under which three
    // transient failures are retried.
    Effect.gen(function* survives() {
      assert.strictEqual(yield* attemptsUnder(yield* RetrySchedule, 3), 4);
    }),
  );

  plainIt.effect("the test schedule gives up after one injected failure and two real ones", () =>
    // Oracle: the specification as a checker, `Schedule.recurs(2)`: three attempts in all.
    Effect.gen(function* gaveUp() {
      assert.strictEqual(yield* attemptsUnder(quickly, 3), 3);
    }),
  );
});

/**
 * The refusing fixtures, each a copy of `simple` with one hand edit.
 */
const broken: readonly FixtureName[] = [
  "undeclared-response",
  "choice-in-prompt",
  "choice-bounds",
  "body-empty",
  "bad-template-uri",
  "identifier-mismatch",
];

/**
 * The refusing fixtures whose law the oracle states no host predicate for (Q5.08's value laws),
 * with the rules the law each breaks keeps: judged against the rule, not the oracle.
 * `title-mismatch`, whose `lom-title` the oracle states none for either, is judged in
 * `program.oracle.db.test.ts` with Q5.12's cases.
 */
const brokenBeyondOracle: readonly (readonly [FixtureName, readonly string[]])[] = [
  ["two-values-single", ["value-cardinality"]],
  ["bad-identifier-value", ["typed-copy", "attribute-lexical"]],
];

/**
 * The accepted fixtures, each a copy of `simple` in another encoding or layout: one decoded from
 * UTF-16, and one whose identifier value is padded with the whitespace its type collapses. The
 * other layouts' verdicts are the law oracle's over generated packages (`genetic.oracle`), and the
 * codec's encodings are crust's.
 */
const clean: readonly FixtureName[] = ["utf16", "padded-identifier-value"];

describe.skipIf(!hasLease)("import/package.test.ts, on the lease", () => {
  layer(Layer.mergeAll(AuthorAppLayer, NodeServices.layer, memoryMediaStore), {
    excludeTestServices: true,
    timeout: "60 seconds",
  })("importPackage on the lease", (it) => {
    it.effect("stores simple under its name, and again is no change", () =>
      // Oracle: PostgreSQL, every law over `simple`, the package read back by its name, and
      // grizzle's `unchanged` for the same rows a second time.
      Effect.gen(function* acceptsSimple() {
        const first = yield* importDir(fixtures.simple);
        const again = yield* importDir(fixtures.simple);
        const db = yield* Db.open((yield* AuthorLogin).roles.author, {});

        assert.strictEqual(again.outcome, "unchanged");
        assert.strictEqual(again.package, first.package);
        assert.isAbove(
          (yield* db.workload.packageOf.once({ facts: {}, params: { name: first.package } })).size,
          0,
          first.package,
        );
      }),
    );

    it.effect(
      "stores two packages that share a manifest identifier under their two names, and neither replaces the other (spec reading 178)",
      () =>
        // Oracle: the specification: IMS Content Packaging 1.2 makes a manifest's identifier
        // "unique within the Manifest" alone (section 6.11.4), so two packages may share one,
        // and a package is the name its importer gives it. Bound: `simple`'s bytes under two
        // names, each imported, then the first again.
        Effect.gen(function* sharedIdentifier() {
          const stored = yield* importDir(fixtures.simple, "shared-identifier-a");
          const second = yield* importDir(fixtures.simple, "shared-identifier-b");
          const repeated = yield* importDir(fixtures.simple, "shared-identifier-a");

          assert.deepStrictEqual(
            [stored.package, second.package, repeated.package],
            ["shared-identifier-a", "shared-identifier-b", "shared-identifier-a"],
          );
          assert.strictEqual(repeated.outcome, "unchanged");
          assert.isTrue(yield* packageStored("shared-identifier-a"));
          assert.isTrue(yield* packageStored("shared-identifier-b"));
        }),
    );

    for (const name of [...broken, ...clean]) {
      it.effect(`gives ${name} the law oracle's verdict`, () =>
        // Oracle: a second implementation, the law oracle's verdict over the same entries.
        Effect.gen(function* oracleAgrees() {
          yield* importAgreesWithOracle(yield* materialize(name), name);
        }),
      );
    }

    for (const [name, rules] of brokenBeyondOracle) {
      it.effect(`refuses ${name} under rules that meet ${rules.join(", ")}`, () =>
        // Oracle: the specification as a checker, the rule Q5.08's law keeps (the retired guard's,
        // `value-single` and `value-lexical`, as the refusal table maps them).
        Effect.gen(function* refusedBeyondOracle() {
          const refused = yield* Effect.flip(importDir(yield* materialize(name)));

          assert.isTrue(
            refused instanceof ImportRefused && refused.rules.some((rule) => rules.includes(rule)),
            `${name}: ${refused.message}`,
          );
        }),
      );
    }

    it.effect("retries one injected transient failure and then accepts", () =>
      // Oracle: the specification as a checker, the retry rule: a transient failure is retried.
      Effect.gen(function* retriesTransient() {
        const attempts = yield* Ref.make(0);
        yield* importDir(fixtures.simple).pipe(
          Effect.provideService(WrapApply, <A>(apply: Effect.Effect<A, CallError>) =>
            Effect.flatMap(
              Ref.getAndUpdate(attempts, (n) => n + 1),
              (n): Effect.Effect<A, CallError> =>
                n === 0 ? Effect.fail(serializationFailure) : apply,
            ),
          ),
        );

        assert.isAtLeast(yield* Ref.get(attempts), 2);
      }),
    );

    it.effect("fails with the transient failure itself after the last retry", () =>
      // Oracle: the specification as a checker, the retry rule: the last attempt's failure is the
      // call's.
      Effect.gen(function* givesUp() {
        const attempts = yield* Ref.make(0);
        const result = yield* Effect.result(
          importDir(fixtures.simple).pipe(
            Effect.provideService(RetrySchedule, quickly),
            Effect.provideService(WrapApply, () =>
              Effect.andThen(
                Ref.update(attempts, (n) => n + 1),
                Effect.fail(serializationFailure),
              ),
            ),
          ),
        );

        assert.strictEqual(
          Result.isFailure(result) ? result.failure : undefined,
          serializationFailure,
        );
        assert.strictEqual(yield* Ref.get(attempts), 3);
      }),
    );

    it.effect(
      "runs the write again when the commit's outcome is unknown, which finds it stored",
      () =>
        // Oracle: the specification as a checker, `commitUnknown`'s resolution: the write only
        // inserts, so running it again reads it back; the first apply committed, so the rerun
        // answers `unchanged` and the import answers that the database holds the package. Bound:
        // `simple` under a name this run draws, stored nowhere before the import, so only this
        // apply's commit can be what the rerun finds, on a lease any run has used before.
        Effect.gen(function* rerunsWrite() {
          const name = `commit-unknown-rerun-${randomUUID()}`;
          const attempts = yield* Ref.make(0);

          assert.isFalse(yield* packageStored(name), `${name} is stored before the import`);

          const imported = yield* importDir(fixtures.simple, name).pipe(
            Effect.provideService(WrapApply, <A>(apply: Effect.Effect<A, CallError>) =>
              Effect.flatMap(
                Ref.getAndUpdate(attempts, (n) => n + 1),
                (n): Effect.Effect<A, CallError> =>
                  n === 0 ? Effect.andThen(apply, Effect.fail(commitUnknown)) : apply,
              ),
            ),
          );

          assert.strictEqual(imported.outcome, "unchanged");
          assert.strictEqual(imported.package, name);
          assert.strictEqual(yield* Ref.get(attempts), 2);
          assert.isTrue(yield* packageStored(name), name);
        }),
    );

    it.effect("fails with the commitUnknown after the last rerun, and writes nothing", () =>
      // Oracle: the specification as a checker, `commitUnknown`'s resolution: every attempt's
      // commit got no answer and none ran, so the last failure is the call's and no package is
      // there. Bound: `simple` under a name of its own, which no test stores and this one never
      // writes, so no earlier import leaves a package there.
      Effect.gen(function* notThere() {
        const name = "commit-unknown-never-stored";
        const result = yield* Effect.result(
          importDir(fixtures.simple, name).pipe(
            Effect.provideService(RetrySchedule, quickly),
            Effect.provideService(WrapApply, () => Effect.fail(commitUnknown)),
          ),
        );

        assert.isTrue(Result.isFailure(result) && result.failure === commitUnknown);
        assert.isFalse(yield* packageStored(name));
      }),
    );

    it.effect("refuses another package under a stored name, and keeps the stored one", () =>
      // Oracle: the specification as a checker, a name is one revision: another package's rows
      // under a stored name meet the keys the two share, so the write is refused and the stored
      // package stays. Bound: `simple` under a name this run draws, then `utf16`, an accepted
      // fixture of other bytes, under the same name.
      Effect.gen(function* refusesReplace() {
        const name = `one-revision-${randomUUID()}`;
        const stored = yield* importDir(fixtures.simple, name);
        const other = yield* Effect.flip(importDir(yield* materialize("utf16"), name));
        const again = yield* importDir(fixtures.simple, name);

        assert.strictEqual(stored.outcome, "accepted");
        assert.instanceOf(other, ImportRefused, other.message);
        assert.strictEqual(again.outcome, "unchanged");
      }),
    );
  });
});
