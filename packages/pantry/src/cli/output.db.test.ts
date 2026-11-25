import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { Effect, Exit, Layer, Schema } from "effect";
import { describe, inject } from "vitest";
import { ImportData } from "#pantry/cli/import.ts";
import { RoundtripData } from "#pantry/cli/roundtrip.ts";
import { successEnvelope } from "#pantry/cli/output.ts";
import { AuthorAppLayer } from "#pantry/db/layer.ts";
import { localMediaStore } from "#pantry/package/media.ts";
import { byPath, compareSource } from "#pantry/export/compare.ts";
import { exportEntries } from "#pantry/export/package.ts";
import { readEntries } from "#pantry/package/read.ts";
import { captureCli, packageCopy } from "#pantry/test/cli.ts";
import { hasLease } from "#pantry/test/settings.ts";
import { fileDatabaseOf } from "#pantry/test/writing-files.ts";

const fixtures = inject("fixtures");

/**
 * The report the exporter gives for the package a run stored: its source read again and compared
 * with an export of the stored package (`compareSource`), the comparison `roundtrip` prints, the
 * export read again from the database.
 *
 * @param source - The package's directory.
 * @param name - The name it is stored under.
 * @returns The report.
 */
const sourceReport = (source: string, name: string) =>
  Effect.gen(function* reportsSource() {
    return yield* compareSource(
      byPath(yield* readEntries(source)),
      byPath(yield* exportEntries(name)),
    );
  });

/**
 * The envelope of `import`, as a reader decodes it from a line of standard output.
 */
const importEnvelope = Schema.fromJsonString(successEnvelope("import", ImportData));

/**
 * The envelope of `roundtrip`, whole.
 */
const roundtripEnvelope = Schema.fromJsonString(successEnvelope("roundtrip", RoundtripData));

/**
 * The last line of a jsonl run: the envelope without its entries.
 */
const summaryEnvelope = Schema.fromJsonString(
  successEnvelope(
    "roundtrip",
    Schema.Struct({
      differing: Schema.Number,
      export_dir: Schema.String,
      package: Schema.String,
    }),
  ),
);

/**
 * One entry line of a jsonl run.
 */
const entryLine = Schema.fromJsonString(
  Schema.Struct({
    outcome: Schema.Struct({ at: Schema.optionalKey(Schema.String), kind: Schema.String }),
    path: Schema.String,
  }),
);

/**
 * The media store the command line uses (`localMediaStore`), so a package the test imports
 * directly and one the command line imports meet one store, which the export reads.
 */
const cliMediaStore = localMediaStore.pipe(Layer.provide(NodeServices.layer));

describe.skipIf(!hasLease)("output.db.test.ts, on the lease", () => {
  layer(
    Layer.mergeAll(AuthorAppLayer, NodeServices.layer, cliMediaStore).pipe(
      Layer.provideMerge(fileDatabaseOf("output")),
    ),
    {
      excludeTestServices: true,
    },
  )("--output on the lease", (it) => {
    it.effect(
      "--json import prints one line, the envelope with the package's name, and the same package again is unchanged under it",
      () =>
        // Oracle: the contract's identity: a package is keyed by the name it is imported under
        // and an import mints nothing, so a second import of the same bytes under that name names
        // the same package and changes nothing, whatever the first found stored.
        Effect.gen(function* importJson() {
          const first = yield* captureCli(["--json", "import", fixtures.simple, "simple"]);
          const again = yield* captureCli(["--json", "import", fixtures.simple, "simple"]);

          assert.isTrue(Exit.isSuccess(first.exit), first.stderr);
          assert.isTrue(Exit.isSuccess(again.exit), again.stderr);
          assert.strictEqual(first.stdout.split("\n").length, 1);

          const stored = Schema.decodeUnknownSync(importEnvelope)(first.stdout);
          const repeated = Schema.decodeUnknownSync(importEnvelope)(again.stdout);

          assert.isTrue(stored.ok);
          assert.strictEqual(stored.schema_version, 1);
          if ("dry_run" in stored.data || "dry_run" in repeated.data) {
            assert.fail("a real import printed the dry-run arm");
          }

          assert.strictEqual(stored.data.package, "simple");
          assert.deepStrictEqual(repeated.data, { outcome: "unchanged", package: "simple" });
        }),
    );

    it.effect(
      "--json roundtrip prints the exporter's report of the stored package, no differing",
      () =>
        // Oracle: the exporter's comparison of the package's source with an export of the package
        // the envelope names, read again from the database, and the committed schema of the
        // envelope.
        Effect.gen(function* roundtripJson() {
          const copy = yield* packageCopy(fixtures.simple, "copy-output-json-simple");
          const { exit, stderr, stdout } = yield* captureCli([
            "--json",
            "roundtrip",
            "--yes",
            copy,
            "copy-output-json-simple",
          ]);

          assert.isTrue(Exit.isSuccess(exit), stderr);
          assert.strictEqual(stdout.split("\n").length, 1);

          const envelope = Schema.decodeUnknownSync(roundtripEnvelope)(stdout);

          assert.isTrue(envelope.ok);
          if ("dry_run" in envelope.data) {
            assert.fail("a real roundtrip printed the dry-run arm");
          }

          assert.strictEqual(envelope.data.differing, 0);
          assert.deepStrictEqual(envelope.data.entries, [
            ...(yield* sourceReport(copy, envelope.data.package)),
          ]);
        }),
    );

    it.effect(
      "--output jsonl roundtrip prints one object per entry, then the summary, and its debug log to stderr alone",
      () =>
        Effect.gen(function* roundtripJsonl() {
          const copy = yield* packageCopy(fixtures.simple, "copy-output-jsonl-simple");
          const { exit, stderr, stdout } = yield* captureCli([
            "--log-level",
            "debug",
            "--output",
            "jsonl",
            "roundtrip",
            "--yes",
            copy,
            "copy-output-jsonl-simple",
          ]);

          assert.isTrue(Exit.isSuccess(exit), stderr);

          const lines = stdout.split("\n");
          const summary = Schema.decodeUnknownSync(summaryEnvelope)(lines.at(-1));
          const report = yield* sourceReport(copy, summary.data.package);

          assert.strictEqual(lines.length, report.length + 1);
          assert.deepStrictEqual(
            lines.slice(0, -1).map((line) => Schema.decodeUnknownSync(entryLine)(line)),
            [...report],
          );
          assert.isTrue(summary.ok);
          assert.strictEqual(summary.data.differing, 0);
          assert.notProperty(summary.data, "entries");
          assert.match(stderr, /DEBUG/u);
        }),
    );
  });
});
