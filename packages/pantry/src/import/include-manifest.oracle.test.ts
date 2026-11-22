/**
 * A site names a document a resource names, never the manifest, which is no resource's document
 * (spec reading 115: "Fragments are packaged as separate resources"; reading 146): an include whose
 * href resolves to `imsmanifest.xml` names no document, holds no `xi:fallback`, and is refused
 * under "Include target" (`include-target`) on the import's rows as in the law oracle, never under
 * "Include root" as an include of a `cp:manifest` root. GEN-A's differential found the import
 * taking the manifest as the target (`#pantry/import/write.ts` `targetAt`), so its rows broke
 * "Include root", which the oracle does not raise, and held "Include target", which it does. An
 * include that names an entry is held to its target through the query `PlacedIncludePath`, which
 * leaves out one that holds a fallback (spec reading 115), so the law is the database's, which the
 * host leaves unjudged, and it is restated over the rows (`#pantry/test/placed-includes.ts`).
 *
 * Oracle: a second implementation, the law oracle (`#pantry/test/oracle.ts` `judge`), against the
 * laws the import's rows break on the host (`#pantry/test/gen/genetic/judge.ts` `judgeOne`), and
 * "Include target"'s restatement over them.
 *
 * Bound: the every-relation package with one include added beside each of its two includes, the
 * second item's under `qti-item-body` and the third's under `qti-response-processing`, both in
 * `items/`, its href each of four spellings that resolve to the manifest (a parent step, a dot
 * step before it, a step down and back, and a percent-encoded dot): 8 cases, exhausted.
 */
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { readProgram } from "#pantry/import/program.ts";
import { everyRelationPackage, scopedPackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { genomeOf } from "#pantry/test/gen/genetic/genome.ts";
import { judgeOne, shownDisagreement } from "#pantry/test/gen/genetic/judge.ts";
import { previewRowsOf } from "#pantry/test/host-judge.ts";
import { lawsOf } from "#pantry/test/oracle.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { breaksIncludeTarget } from "#pantry/test/placed-includes.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";
import { searchTimeout } from "#pantry/test/settings.ts";

/**
 * The oracle's law tables over the composed grammar.
 */
const laws = lawsOf(grammar);

/**
 * The every-relation package the cases add an include to, at its smallest member counts.
 */
const base = everyRelationPackage({ choices: 2, hotspots: 1, hottexts: 1 });

/**
 * The base's two includes, each the passage its document holds once, in `items/`.
 */
const sites = [
  {
    include: '<xi:include href="fragment.xml"/>',
    parent: "qti-item-body",
    path: "items/item2.xml",
  },
  {
    include: '<xi:include href="rules.xml"/>',
    parent: "qti-response-processing",
    path: "items/item3.xml",
  },
] as const;

/**
 * Hrefs that resolve, from `items/`, to the manifest at the package's root.
 */
const spellings = [
  "../imsmanifest.xml",
  "./../imsmanifest.xml",
  "../items/../imsmanifest.xml",
  "../imsmanifest%2Exml",
] as const;

/**
 * Every case of the bound: each site with each spelling.
 */
const cases = sites.flatMap((site) => spellings.map((href) => ({ href, site })));

/**
 * Add an include of the case's href beside the site's include.
 *
 * @param of - The case.
 * @param of.href - The href.
 * @param of.site - The site.
 * @returns The package.
 */
const packageOf = (of: (typeof cases)[number]): PackageEntries => {
  const text = new TextDecoder().decode(base.get(of.site.path));
  const entries = new Map(base);
  entries.set(
    of.site.path,
    new TextEncoder().encode(
      text.replace(of.site.include, `${of.site.include}<xi:include href="${of.href}"/>`),
    ),
  );

  return entries;
};

layer(NodeServices.layer, { excludeTestServices: true })("an include of the manifest", (it) => {
  it.effect(
    "is Include target on the import's rows as in the law oracle, and never Include root",
    (ctx) =>
      searched(
        ctx,
        Effect.gen(function* includeManifestRuns() {
          const directory = yield* scratchDirectory("include-manifest-");
          const bench = { directory, grammar, laws };

          assert.strictEqual(cases.length, 8);

          return yield* exhaust(
            {
              box: "an include of the manifest beside each of the two includes, under each of four spellings",
              caseHang: Duration.minutes(5),
              concurrency: 1,
              coverage: noCoverage,
              generator: int(0, cases.length - 1),
              literal: (at) => {
                const of = cases[at];

                return of === undefined ? String(at) : `${of.href} under ${of.site.parent}`;
              },
              oracle: {
                kind: "second-implementation",
                name: "the law oracle against the laws the import's rows break on the host",
              },
              suite: "pantry/include-manifest",
            },
            (at) =>
              Effect.scoped(
                Effect.gen(function* includeManifestCase() {
                  const of = cases[at];
                  assert.isDefined(of, `no case ${String(at)}`);
                  if (of === undefined) {
                    return;
                  }

                  const named = `${of.href} under ${of.site.parent} in ${of.site.path}`;
                  const files = packageOf(of);
                  const judged = yield* judgeOne(yield* genomeOf(files), bench, at);
                  const said = `${named}: the oracle ${judged.summary.oracle}; the import ${judged.summary.import}`;
                  const apart = judged.disagreements.filter(
                    (disagreement) =>
                      (disagreement.kind === "oracle-only-law" ||
                        disagreement.kind === "import-only-law") &&
                      (disagreement.law === "Include target" ||
                        disagreement.law === "Include root"),
                  );

                  assert.deepStrictEqual(apart.map(shownDisagreement), [], said);
                  assert.match(judged.summary.oracle, /\bInclude target\b/u, said);

                  const dir = yield* scopedPackage(files);
                  const rows = previewRowsOf((yield* readProgram(dir, nameOf(dir))).inputs);
                  assert.isTrue(breaksIncludeTarget(rows), said);
                  assert.notMatch(judged.summary.oracle, /\bInclude root\b/u, said);
                  assert.notMatch(judged.summary.import, /\bInclude root\b/u, said);
                }),
              ),
          );
        }).pipe(Effect.scoped),
      ),
    searchTimeout,
  );
});
