/**
 * The importer's front door (`#pantry/import/package.ts`), on the lease: its verdicts, its one
 * attempt, which a transient refusal fails with the refusal itself, and a `commitUnknown`, which
 * fails the import and which importing the package again settles, the write being insert-only,
 * with the failures injected through `WrapApply`.
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
import { assert, layer } from "@effect/vitest";
import { Effect, Layer, Ref, Result } from "effect";
import { describe, inject } from "vitest";
import { AuthorAppLayer } from "#pantry/db/layer.ts";
import { WrapApply } from "#pantry/import/package.ts";
import { memoryMediaStore } from "#pantry/package/media.ts";
import { importDir } from "#pantry/test/import-dir.ts";
import { packageStored } from "#pantry/test/apply-edited.ts";

import { materialize } from "#pantry/test/fixtures.ts";
import type { FixtureName } from "#pantry/test/fixtures.ts";
import { importAgreesWithOracle } from "#pantry/test/oracle-verdict.ts";
import { hasLease } from "#pantry/test/settings.ts";
import { ImportRefused } from "#pantry/import/rules.ts";
import { AuthorLogin } from "#pantry/db/served.ts";
import { fileDatabaseOf } from "#pantry/test/writing-files.ts";

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
  layer(
    Layer.mergeAll(AuthorAppLayer, NodeServices.layer, memoryMediaStore).pipe(
      Layer.provideMerge(fileDatabaseOf("package")),
    ),
    {
      excludeTestServices: true,
      timeout: "60 seconds",
    },
  )("importPackage on the lease", (it) => {
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

    it.effect(
      "fails with the transient refusal itself after one attempt, and writes nothing; importing again stores the package",
      () =>
        // Oracle: the specification as a checker: a transient refusal changed nothing, and the
        // importer makes its apply once, so the call fails with grizzle's typed `transient`
        // CallError and no package is there; running it again is the caller's. Bound: `simple`
        // under a name this run draws, stored nowhere before.
        Effect.gen(function* failsOnTransient() {
          const name = `transient-once-${randomUUID()}`;
          const attempts = yield* Ref.make(0);
          const failed = yield* Effect.flip(
            importDir(fixtures.simple, name).pipe(
              Effect.provideService(WrapApply, <A>(_apply: Effect.Effect<A, CallError>) =>
                Effect.andThen(
                  Ref.update(attempts, (n) => n + 1),
                  Effect.fail(serializationFailure),
                ),
              ),
            ),
          );

          assert.strictEqual(failed, serializationFailure);
          assert.strictEqual(yield* Ref.get(attempts), 1);
          assert.isFalse(yield* packageStored(name), name);

          const again = yield* importDir(fixtures.simple, name);

          assert.strictEqual(again.outcome, "accepted");
        }),
    );

    it.effect(
      "fails with commitUnknown when the commit's outcome is unknown, and importing again finds the package stored",
      () =>
        // Oracle: the specification as a checker, `commitUnknown`'s resolution: the importer runs
        // nothing again, so the call fails with it; the first apply committed and the write only
        // inserts, so importing the package again answers `unchanged`. Bound: `simple` under a
        // name this run draws, stored nowhere before the import, so only this apply's commit can
        // be what the second import finds, on a lease any run has used before.
        Effect.gen(function* settlesByImportingAgain() {
          const name = `commit-unknown-again-${randomUUID()}`;
          const attempts = yield* Ref.make(0);

          assert.isFalse(yield* packageStored(name), `${name} is stored before the import`);

          const failed = yield* Effect.flip(
            importDir(fixtures.simple, name).pipe(
              Effect.provideService(WrapApply, <A>(apply: Effect.Effect<A, CallError>) =>
                Effect.andThen(
                  Ref.update(attempts, (n) => n + 1),
                  Effect.andThen(apply, Effect.fail(commitUnknown)),
                ),
              ),
            ),
          );
          const again = yield* importDir(fixtures.simple, name);

          assert.strictEqual(failed, commitUnknown);
          assert.strictEqual(yield* Ref.get(attempts), 1);
          assert.strictEqual(again.outcome, "unchanged");
          assert.isTrue(yield* packageStored(name), name);
        }),
    );

    it.effect("fails with commitUnknown when no apply ran, and writes nothing", () =>
      // Oracle: the specification as a checker, `commitUnknown`'s resolution: the commit got no
      // answer and the apply never ran, so the call fails with it and no package is there. Bound:
      // `simple` under a name of its own, which no test stores and this one never writes, so no
      // earlier import leaves a package there.
      Effect.gen(function* notThere() {
        const name = "commit-unknown-never-stored";
        const result = yield* Effect.result(
          importDir(fixtures.simple, name).pipe(
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
