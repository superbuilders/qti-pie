/**
 * The packaging fixtures on the lease (the spec's 4.12 to 4.14), PostgreSQL the judge: each
 * fixture's verdict is the law oracle's (`#pantry/test/oracle-verdict.ts`, a second
 * implementation), and a dangling include is refused under the law it breaks.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { drawn, explore } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Layer } from "effect";
import { describe } from "vitest";
import { AuthorAppLayer } from "#pantry/db/layer.ts";
import { memoryMediaStore } from "#pantry/package/media.ts";
import { importDir } from "#pantry/test/import-dir.ts";
import { materialize } from "#pantry/test/fixtures.ts";
import { importAgreesWithOracle, packagingFixtures } from "#pantry/test/oracle-verdict.ts";
import { danglingIncludeName, materializeProcessing } from "#pantry/test/processing-fixtures.ts";
import { hasLease } from "#pantry/test/settings.ts";
import { ImportRefused } from "#pantry/import/rules.ts";
import { fileDatabaseOf } from "#pantry/test/writing-files.ts";

describe.skipIf(!hasLease)("import/package.packaging.test.ts, on the lease", () => {
  layer(
    Layer.mergeAll(AuthorAppLayer, NodeServices.layer, memoryMediaStore).pipe(
      Layer.provideMerge(fileDatabaseOf("packaging")),
    ),
    {
      excludeTestServices: true,
    },
  )("importPackage of the packaging fixtures on the lease", (it) => {
    it.effect("gives each drawn packaging fixture the law oracle's verdict", (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang: Duration.seconds(120),
            coverage: noCoverage,
            draw: drawn(int(0, packagingFixtures.length - 1)),
            kept: [],
            literal: (at) => packagingFixtures[at] ?? String(at),
            oracle: {
              kind: "second-implementation",
              name: "the law oracle's verdict over the same entries, for 12 of the packaging fixtures a run, drawn from the run's seed, one import each, so the runs between them cover the list",
            },
            runs: 12,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "pantry/package-packaging-db",
          },
          (at) =>
            Effect.gen(function* oracleAgrees() {
              const name = packagingFixtures[at];
              if (name === undefined) {
                return;
              }

              yield* importAgreesWithOracle(yield* materialize(name), name);
            }),
        ),
      ),
    );

    it.effect(`refuses ${danglingIncludeName} by the law its dangling include breaks`, () =>
      Effect.gen(function* includeTarget() {
        const refused = yield* Effect.flip(
          importDir(yield* materializeProcessing(danglingIncludeName)),
        );
        const named: readonly string[] =
          refused instanceof ImportRefused
            ? refused.rules
            : ["_tag" in refused ? refused._tag : refused.kind];

        assert.include(
          named,
          "include-target",
          `${danglingIncludeName}: refused under ${named.join(", ")}, where reading 115 refuses an include whose href names no document the manifest lists under "Include target", the import's own ChangeSet writing its site with no SiteTarget, never by an engine refusal of a write to a document the change does not insert; the fixture names a file only a resource's file entry lists, so include-target alone refuses it`,
        );
      }),
    );
  });
});
