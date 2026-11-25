import path from "node:path";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { Console, Duration, Effect, FileSystem, Layer, Option, Schema } from "effect";
import { describe } from "vitest";
import { RoundtripData } from "#pantry/cli/roundtrip.ts";
import { ErrorObject, successEnvelope } from "#pantry/cli/output.ts";
import { databaseRefusalOf, refusalFieldsOf } from "#pantry/cli/refused.ts";
import { AuthorAppLayer } from "#pantry/db/layer.ts";
import { localMediaStore } from "#pantry/package/media.ts";
import { comparePackage } from "#pantry/export/compare.ts";
import { exportPackage } from "#pantry/export/package.ts";
import { importDir } from "#pantry/test/import-dir.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { qtiRoundtrip } from "#pantry/qti-roundtrip.ts";
import { captureCli, matchesCommitted } from "#pantry/test/cli.ts";
import { examplesTarball, materializeCorpus } from "#pantry/test/fixtures.ts";
import { exitCodeOf } from "#pantry/cli/run.ts";
import { hasLease, settings } from "#pantry/test/settings.ts";
import { fileDatabaseOf } from "#pantry/test/writing-files.ts";
import { renderVerdicts, verdictsPath } from "#pantry/test/verdicts.ts";
import type { VerdictRow } from "#pantry/test/verdicts.ts";
import { ImportRefused } from "#pantry/import/rules.ts";

/**
 * The folder every case's scratch lives under, `packages/pantry/work/cli-corpus`; each package has
 * a folder of its own under it, named for the package, so no two cases share a path.
 */
const scratchRoot = path.resolve(import.meta.dirname, "..", "work", "cli-corpus");

/**
 * The corpus's packages when `QTI_PIE_CORPUS=1` and a lease is held, and none otherwise.
 *
 * Vitest declares a file's cases before any runs, so the corpus's names are listed while the file
 * is collected; a run without both settings never opens the tarball. Each `dir` is a corpus `.zip`
 * file.
 */
const corpus =
  hasLease && settings.corpusRequested
    ? await Effect.runPromise(materializeCorpus().pipe(Effect.provide(NodeServices.layer)))
    : [];

/**
 * The envelope `roundtrip` prints under `--json`, as a reader decodes it from standard output.
 */
const roundtripEnvelope = Schema.fromJsonString(successEnvelope("roundtrip", RoundtripData));

/**
 * The committed schemas of the two lines a roundtrip prints: its envelope, and its error object.
 */
const committedRoundtrip = matchesCommitted("roundtrip");

const committedError = matchesCommitted("error");

/**
 * A line of standard error as an {@link ErrorObject}, or none when it is anything else.
 */
const errorObjectOf = Schema.decodeUnknownOption(Schema.fromJsonString(ErrorObject));

/**
 * What a suite's cases so far found: vitest runs a file's cases in order, and the last case reads
 * it. The suite makes one ({@link emptyTally}) and hands it to its cases.
 */
interface Tally {
  accepted: number;
  equalEntries: number;
  /**
   * The packages the importer refused, with the rules each was refused under, as the verdict file
   * writes them.
   */
  readonly refused: { readonly name: string; readonly rule: string }[];
  slowestImport: { readonly millis: number; readonly name: string };
  slowestRoundtrip: { readonly millis: number; readonly name: string };
  /**
   * The verdict of every package the cases judged, keyed to the tarball member it came from; the
   * last case renders them as the verdict file.
   */
  readonly verdicts: VerdictRow[];
}

/**
 * A suite's tally before its first case.
 *
 * @returns The tally, empty.
 */
const emptyTally = (): Tally => ({
  accepted: 0,
  equalEntries: 0,
  refused: [],
  slowestImport: { millis: 0, name: "" },
  slowestRoundtrip: { millis: 0, name: "" },
  verdicts: [],
});

/**
 * The lines of standard error that decode as an {@link ErrorObject}; any other line is not counted.
 */
const errorObjectsOf = (stderr: string) =>
  stderr.split("\n").flatMap((line) => Option.toArray(errorObjectOf(line)));

/**
 * The texts of a refusal's laws, as a sorted list: the laws are a set, so their order is no part of
 * what the two refusals must agree on.
 */
const texts = (facts: readonly { readonly text: string }[]): readonly string[] =>
  facts.map(({ text }) => text).toSorted();

/**
 * Run one corpus package through the importer: import it under the name its zip's base name gives
 * (`nameOf`), and, where it is accepted, export the stored package and compare the export with its
 * source.
 *
 * @param tally - The suite's tally, whose slowest import the run may be.
 * @param entry - The corpus package: its zip, its tarball member and its name.
 * @param entry.dir - The zip.
 * @param entry.member - Its tarball member.
 * @param entry.name - Its name.
 * @returns The import's outcome, a success or the refusal, and the comparison's report, empty for a
 *   refused package.
 */
const importerRun = Effect.fn("cli.corpus.importerRun")(function* importerRun(
  tally: Tally,
  entry: {
    readonly dir: string;
    readonly member: string;
    readonly name: string;
  },
) {
  const fs = yield* FileSystem.FileSystem;
  const cwd = path.join(scratchRoot, entry.member);
  const directTarget = path.join(cwd, "direct");

  yield* fs.remove(cwd, { force: true, recursive: true });
  yield* fs.makeDirectory(cwd, { recursive: true });

  const [importTime, direct] = yield* importDir(entry.dir).pipe(Effect.result, Effect.timed);

  if (Duration.toMillis(importTime) > tally.slowestImport.millis) {
    tally.slowestImport = { millis: Duration.toMillis(importTime), name: entry.name };
  }

  const refusal = direct._tag === "Failure" ? direct.failure : undefined;

  assert.isTrue(
    refusal === undefined || refusal instanceof ImportRefused,
    `${entry.name}: the importer failed with something other than a refusal`,
  );

  const report =
    direct._tag === "Success"
      ? yield* exportPackage(direct.success.package, directTarget).pipe(
          Effect.andThen(comparePackage(entry.dir, directTarget)),
        )
      : [];

  return { direct, report };
});

/**
 * What the importer did with a corpus package, which the CLI's case of the package compares its
 * own run with.
 */
type ImporterRun = Effect.Success<ReturnType<typeof importerRun>>;

/**
 * Run one corpus package through the CLI, and assert the CLI lands it where the importer did: the
 * same package, entry for entry, or the same rules and the laws the database named.
 *
 * The two runs are separate imports of one package, so they agree on the rule and on the laws the
 * database named, and the CLI's error object carries both, read from the refusal's fields. A
 * package is keyed by the name it is imported under, here its zip's base name (`nameOf`), and an
 * import mints nothing, so the CLI's import, the second, finds the importer's package stored and
 * answers unchanged under the same name.
 *
 * Three pairs of accepted corpus zips share a manifest identifier (CONTRACT section 5), which IMS
 * Content Packaging makes unique within one manifest alone, so each is stored under its own name
 * and no case meets the package of another.
 *
 * @param tally - The suite's tally, which the judgment adds the package's verdict to.
 * @param importerRuns - Each corpus package's importer run, by its tarball member, as its importer
 *   case recorded it.
 * @param entry - The corpus package: its zip, its tarball member and its name.
 * @param entry.dir - The zip.
 * @param entry.member - Its tarball member.
 * @param entry.name - Its name.
 * @returns Nothing; fails where the CLI lands the package elsewhere, or where its importer case
 *   recorded no run.
 */
const judge = Effect.fn("cli.corpus.judge")(function* judge(
  tally: Tally,
  importerRuns: ReadonlyMap<string, ImporterRun>,
  entry: {
    readonly dir: string;
    readonly member: string;
    readonly name: string;
  },
) {
  const importer = importerRuns.get(entry.member);

  assert.isDefined(importer, `${entry.name}: its importer case recorded no run`);

  if (importer === undefined) {
    return;
  }

  const { direct, report } = importer;
  const refusal = direct._tag === "Failure" ? direct.failure : undefined;

  const [roundtripTime, cli] = yield* captureCli(
    qtiRoundtrip,
    ["--quiet", "--json", "--yes", path.resolve(entry.dir), nameOf(entry.dir)],
    Option.none(),
  ).pipe(Effect.timed);
  const code = exitCodeOf(cli.exit);

  if (Duration.toMillis(roundtripTime) > tally.slowestRoundtrip.millis) {
    tally.slowestRoundtrip = { millis: Duration.toMillis(roundtripTime), name: entry.name };
  }

  const errors = errorObjectsOf(cli.stderr);

  for (const line of cli.stderr.split("\n")) {
    if (Option.isSome(errorObjectOf(line))) {
      assert.isTrue(committedError(line), `${entry.name}: the error object's schema`);
    }
  }

  if (refusal === undefined) {
    assert.isTrue(committedRoundtrip(cli.stdout), `${entry.name}: the envelope's committed schema`);

    const envelope = Schema.decodeUnknownSync(roundtripEnvelope)(cli.stdout);
    const differing = report.filter(({ outcome }) => outcome.kind === "differs").length;

    const written = envelope.data;
    const identifier = "package" in written ? written.package : "";
    const entries = "entries" in written ? written.entries : [];

    assert.strictEqual(
      identifier,
      direct._tag === "Success" ? direct.success.package : "",
      `${entry.name}: the CLI names the package by the importer's manifest identifier`,
    );
    assert.deepStrictEqual(
      entries.map(({ outcome, path: at }) => ({ kind: outcome.kind, path: at })),
      report.map(({ outcome, path: at }) => ({ kind: outcome.kind, path: at })),
      `${entry.name}: the CLI's entries are the importer's`,
    );

    if (differing === 0) {
      assert.strictEqual(code, 0, `${entry.name}: no entry differs, so the CLI exits 0`);
      assert.isTrue(envelope.ok, `${entry.name}: ok`);
    } else {
      assert.strictEqual(code, 1, `${entry.name}: ${differing} differ, so the CLI exits 1`);
      assert.isFalse(envelope.ok, `${entry.name}: not ok`);
      assert.strictEqual(errors.length, 1, `${entry.name}: one ErrorObject line on stderr`);
      assert.strictEqual(errors[0]?.kind, "roundtrip-differs", `${entry.name}: the CLI's kind`);
    }

    tally.verdicts.push({ file: entry.member, rules: [], verdict: "accepted" });
    tally.accepted += 1;
    tally.equalEntries += report.length - differing;
  } else {
    const rules = refusal instanceof ImportRefused ? refusal.rules : [];

    assert.strictEqual(code, 1, `${entry.name}: refused directly, so the CLI exits 1`);
    assert.strictEqual(errors.length, 1, `${entry.name}: one ErrorObject line on stderr`);
    assert.strictEqual(errors[0]?.kind, "import-refused", `${entry.name}: the CLI's kind`);
    assert.deepStrictEqual(
      errors[0]?.rules,
      rules,
      `${entry.name}: the CLI names the importer's rules`,
    );

    const laws = Option.map(
      Option.flatMap(refusalFieldsOf(refusal), databaseRefusalOf),
      (database) => database.laws,
    );

    assert.deepStrictEqual(
      texts(errors[0]?.laws ?? []),
      texts(Option.getOrElse(laws, () => [])),
      `${entry.name}: the CLI names the laws the database named`,
    );
    assert.strictEqual(
      errors[0]?.sources === undefined,
      Option.isNone(laws),
      `${entry.name}: the CLI gives sources exactly when the database refused the package`,
    );
    tally.verdicts.push({ file: entry.member, rules, verdict: "refused" });
    tally.refused.push({ name: entry.name, rule: rules.join("|") });
  }
});

/**
 * The media store the command line uses (`localMediaStore`), so a package the test imports
 * directly and one the command line imports meet one store, which the export reads.
 */
const cliMediaStore = localMediaStore.pipe(Layer.provide(NodeServices.layer));

describe.skipIf(!hasLease)("cli.corpus.db.test.ts, on the lease", () => {
  layer(
    Layer.mergeAll(AuthorAppLayer, NodeServices.layer, cliMediaStore).pipe(
      Layer.provideMerge(fileDatabaseOf("corpus")),
    ),
    {
      excludeTestServices: true,
    },
  )("the CLI against the importer over the corpus", (it) => {
    const tally = emptyTally();
    /**
     * Each corpus package's importer run, by its tarball member. Each package is two cases, the two
     * halves of its judgment: the importer's run, which records it here, then the CLI's, which
     * vitest runs after it and which reads what the importer's recorded.
     */
    const importerRuns = new Map<string, ImporterRun>();

    for (const entry of corpus) {
      it.effect(`${entry.name} through the importer`, () =>
        Effect.gen(function* importerCase() {
          importerRuns.set(entry.member, yield* importerRun(tally, entry));
        }),
      );
      it.effect(`${entry.name} lands through the CLI as it does through the importer`, () =>
        judge(tally, importerRuns, entry),
      );
    }

    it.effect.skipIf(!settings.corpusRequested)("the tally of accepted and refused packages", () =>
      Effect.gen(function* reports() {
        const refused = tally.refused.map(({ name, rule }) => `${name}:${rule}`).join(" ");

        yield* Console.log(
          `witness: accepted ${tally.accepted} refused ${tally.refused.length} of ${corpus.length}; refused ${refused}; equal entries ${tally.equalEntries}; slowest roundtrip ${tally.slowestRoundtrip.name} ${Math.round(tally.slowestRoundtrip.millis)}; slowest import ${tally.slowestImport.name} ${Math.round(tally.slowestImport.millis)}`,
        );

        assert.strictEqual(
          tally.accepted + tally.refused.length,
          corpus.length,
          "every package is accepted or refused",
        );

        const fs = yield* FileSystem.FileSystem;
        const tarball = yield* examplesTarball;
        const committed = verdictsPath(tarball);
        const fresh = path.resolve(
          import.meta.dirname,
          "..",
          "work",
          "verdicts",
          path.basename(committed),
        );

        yield* fs.makeDirectory(path.dirname(fresh), { recursive: true });

        const rendered = yield* renderVerdicts(tally.verdicts);

        yield* fs.writeFileString(fresh, rendered);

        const expected = yield* fs.readFileString(committed).pipe(Effect.option);

        assert.isTrue(
          Option.isSome(expected),
          `no committed verdict file at ${committed}; adopt the fresh one at ${fresh} with: cp ${fresh} ${committed}`,
        );
        assert.strictEqual(
          rendered,
          Option.getOrThrow(expected),
          `the verdicts differ from ${committed}; to adopt ${fresh}, run: cp ${fresh} ${committed}`,
        );
      }),
    );
  });
});
