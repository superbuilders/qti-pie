/**
 * The law oracle's prediction for each negative of {@link negativeNames}, held to the table
 * `#pantry/test/negatives.ts` pins ({@link expectations}).
 *
 * Each negative is materialized and read as `importAgreesWithOracle` reads a package
 * (`#pantry/test/oracle-verdict.ts` `oracleVerdict`), and its verdict is held to
 * {@link expectations}: the rules the oracle's breaches name. The oracle judges every breach of a
 * package, so the import, which refuses a package under the rule of the first object that fails,
 * may name any of the set. The positive the stimulus negatives are built over is accepted
 * ({@link positives}), so a set holds only the negative's own breaches; the bank negatives and
 * `test-document` are built over `stimulus-shared`, which the stimulus negatives share.
 *
 * Phase 5's test positives are 1EdTech test packages, and pantry stores no test (spec reading
 * 228): each is refused under "Test structure" alone ({@link tests}).
 */
import path from "node:path";
import { NodeServices } from "@effect/platform-node";
import { assert, describe, it as plain, layer } from "@effect/vitest";
import { ConfigProvider, Effect, FileSystem } from "effect";
import { readEntries } from "#pantry/package/read.ts";
import { materialize, negativeNames } from "#pantry/test/fixtures.ts";
import type { FixtureName } from "#pantry/test/fixtures.ts";
import { expectations } from "#pantry/test/negatives.ts";
import { oracleVerdict } from "#pantry/test/oracle-verdict.ts";

/**
 * The directory every test root is made under: the package's gitignored `work/`.
 */
const workDirectory = path.resolve(import.meta.dirname, "../../work");

/**
 * The positive the stimulus negatives are built over, which the oracle accepts.
 */
const positives = ["stimulus-301"] as const satisfies readonly FixtureName[];

/**
 * Phase 5's test positives the oracle once accepted, each a test whose content is otherwise valid
 * QTI, so each breaks spec reading 1's "Test structure" and nothing else.
 */
const tests = [
  "test-content",
  "test-include",
  "test-lti",
  "test-mapping",
] as const satisfies readonly FixtureName[];

/**
 * Materialize a fixture in a root of its own and judge it by the oracle.
 *
 * @param name - The fixture's name.
 * @returns `"accepted"`, or the sorted rules the oracle's breaches name.
 */
const verdictOf = Effect.fn("negatives.oracle.verdictOf")(function* verdictOf(name: FixtureName) {
  const fs = yield* FileSystem.FileSystem;

  yield* fs.makeDirectory(workDirectory, { recursive: true });

  const root = yield* fs.makeTempDirectoryScoped({
    directory: workDirectory,
    prefix: "negatives-oracle-",
  });
  const config = ConfigProvider.layerAdd(
    ConfigProvider.fromUnknown({ QTI_PIE_QTI_FIXTURES: root }),
    { asPrimary: true },
  );
  const dir = yield* materialize(name).pipe(Effect.provide(config));
  const verdict = yield* oracleVerdict(yield* readEntries(dir));

  return verdict.kind === "accepted" ? "accepted" : [...verdict.rules].toSorted();
});

describe("test/negatives.oracle.test.ts", () => {
  plain("states each negative once", () => {
    assert.deepStrictEqual(Object.keys(expectations).toSorted(), [...negativeNames].toSorted());
  });
});

layer(NodeServices.layer, { excludeTestServices: true })(
  "the law oracle's prediction for each negative",
  (it) => {
    for (const name of negativeNames) {
      it.effect(`predicts ${name}`, () =>
        Effect.gen(function* predictsNegative() {
          assert.deepStrictEqual(yield* verdictOf(name), [...expectations[name]], name);
        }).pipe(Effect.scoped),
      );
    }

    for (const name of positives) {
      it.effect(`accepts the positive ${name}`, () =>
        Effect.gen(function* acceptsPositive() {
          assert.strictEqual(yield* verdictOf(name), "accepted", name);
        }).pipe(Effect.scoped),
      );
    }

    for (const name of tests) {
      it.effect(`refuses the test ${name} under Test structure alone`, () =>
        Effect.gen(function* refusesTest() {
          assert.deepStrictEqual(yield* verdictOf(name), ["test-structure"], name);
        }).pipe(Effect.scoped),
      );
    }
  },
);
