/**
 * The import's read of the packaging fixtures, on the host: the reader and the codec refuse
 * exactly the packages the law oracle's reader and codec refuse, under the same rule, and read
 * every other one, so every refusal past them is the database's.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import type { PlatformError } from "effect";
import { inject } from "vitest";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { materialize, materializePackage } from "#pantry/test/fixtures.ts";
import { oracleCodecRule } from "#pantry/test/oracle-verdict.ts";
import { packagingFixtures } from "#pantry/test/packaging.dictionary.ts";
import { ImportRefused } from "#pantry/import/rules.ts";
import { nameOf } from "#pantry/test/package-name.ts";

const fixtures = inject("fixtures");

/**
 * Name the rule a read failed under: a refusal's own, the one rule a refusal made before the
 * database carries, written as the verdict file writes a refusal's rules, or the platform
 * failure's tag, which no refusal names.
 *
 * @param failure - The read's failure.
 * @returns Its rule.
 */
const ruleOf = (failure: ImportRefused | PlatformError.PlatformError): string =>
  failure instanceof ImportRefused ? failure.rules.join("|") : failure._tag;

/**
 * Judge one package as the import reads it against the law oracle's own read of the same entries
 * (`judge`'s reader, version and shred), a second implementation: the read refuses under the rule
 * the oracle's reader and codec refuse it under, or reads it where they read it. Each package is a
 * case of its own, so a disagreement names its package.
 *
 * @param name - The package's name in the suite, which a failure names.
 * @param dir - Its folder.
 * @returns Nothing; fails the test where the two reads disagree.
 */
const codecAgrees = Effect.fn("test.packageRead.codecAgrees")(function* codecAgrees(
  name: string,
  dir: string,
) {
  const expected = yield* oracleCodecRule(yield* readEntries(dir));
  const read = yield* Effect.result(
    readProgram(dir, nameOf(dir)).pipe(Effect.catchTag("BadPackageName", Effect.die)),
  );

  assert.deepStrictEqual(
    Result.isFailure(read) ? Option.some(ruleOf(read.failure)) : Option.none(),
    expected,
    name,
  );
});

/**
 * The published packages the suite reads beside the packaging fixtures, each by its name and the
 * folder the global setup materialized it in.
 */
const published = [
  ["simple", fixtures.simple],
  ["lti", fixtures.lti],
  ["metaData", fixtures.metaData],
  ["CAT_Test01_Adaptive_EchoAdapt", fixtures.CAT_Test01_Adaptive_EchoAdapt],
  ["sample_pci", fixtures.sample_pci],
] as const;

layer(NodeServices.layer, { excludeTestServices: true })(
  "readProgram over the packaging fixtures and the published packages refuses exactly what the oracle's codec refuses, under its rule",
  (suite) => {
    for (const name of packagingFixtures) {
      suite.effect(name, () =>
        Effect.gen(function* fixtureAgrees() {
          yield* codecAgrees(name, yield* materialize(name));
        }),
      );
    }

    for (const [name, dir] of published) {
      suite.effect(name, () => codecAgrees(name, dir));
    }

    suite.effect("usageData", () =>
      Effect.gen(function* usageDataAgrees() {
        yield* codecAgrees("usageData", yield* materializePackage("usageData"));
      }),
    );
  },
);
