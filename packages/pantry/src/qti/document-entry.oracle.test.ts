/**
 * A document-typed resource's href names the one document at its path, of its type, and that
 * document is an entry: "Document entry" (`entry-kind`), as spec reading `resource-href` and the
 * readings' href resolution state ("refused where a law needs it to name an entry (a document-typed
 * resource's href, "Document entry")"). The law oracle raises it for a document-typed href, and the
 * database judges it over the queries `TypedHref`, its scope, and `TypedPath`, its entry path. The
 * containment that holds a document-typed href to a document of its type (`#pantry/qti/queries.ts`,
 * `documentHrefs` into `ResourceDocument`) is that law's, never `RootOfType`'s, whose breach is a
 * document whose (type, root kind) no row of `RootOfType` pairs. GEN-A's differential found the
 * import naming a listed resource with no entry `RootOfType`, a law the oracle does not raise
 * there.
 *
 * Oracle: a second implementation, the law oracle (`#pantry/test/oracle.ts` `judge`), against the
 * laws the import's rows break on the host (`#pantry/test/gen/genetic/judge.ts` `judgeOne`).
 * "Document entry" over a document-typed href is a rule over a query (`TypedHref` and `TypedPath`,
 * `#pantry/qti/queries.ts`), which the host judge leaves to the database, so the oracle's side
 * alone is held to it here; neither side raises `RootOfType`.
 *
 * Bound: the every-relation package with one resource added whose href, and its one file, names
 * no entry: each of the 10 resource types `RootOfType` maps, with each href {@link missingHref}
 * draws, in the package's root or a directory, through a dot-dot segment or not, and relative,
 * root-relative or a scheme's: 120 packages, exhausted. Beside it, the fragment item2.xml includes
 * listed under a second type, the outcome declaration's, beside its own ({@link twin}): the import
 * reads that path once, as the fragment its first resource names, so it is judged where item2.xml
 * splices it and nowhere alone, and the second type's href names no document of its type,
 * "Document entry" alone: neither side raises RootOfType for it, and the import's rows break no
 * Idref target the oracle does not.
 */
import { regex } from "arkregex";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { boolean, element, int } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { everyRelationPackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { genomeOf } from "#pantry/test/gen/genetic/genome.ts";
import { judgeOne, shownDisagreement } from "#pantry/test/gen/genetic/judge.ts";
import { lawsOf } from "#pantry/test/oracle.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";

/**
 * The oracle's law tables over the composed grammar.
 */
const laws = lawsOf(grammar);

/**
 * The every-relation package the cases add a resource to, at its smallest member counts.
 */
const base = everyRelationPackage({ choices: 2, hotspots: 1, hottexts: 1 });

/**
 * Each resource type `RootOfType` maps, once, in the grammar's order.
 */
const documentTypes = [
  ...new Set(grammar.package.rootOfType.rows.map(({ type }) => type)),
] as const;

/**
 * One case: the type of the resource added, and the href it and its one file write.
 */
interface Case {
  readonly href: string;
  readonly type: string;
}

/**
 * The every-relation package's fragment, which item2.xml includes, listed again under the outcome
 * declaration's type.
 */
const twin: Case = { href: "items/fragment.xml", type: "imsqti_outcomes_xmlv3p0" };

/**
 * Draw an href that names no entry of the base package: `missing.xml`, which no entry is, in the
 * package's root or its `items/` directory, through a dot-dot segment (`items/../`) or not, and
 * written relative, root-relative (a leading `/`) or as an `https:` URL.
 */
const missingHref: Gen<string> = (source) => {
  const directory = source.draw(boolean) ? "items/" : "";
  const through = source.draw(boolean) ? "items/../" : "";
  const path = `${directory}${through}missing.xml`;
  const written = source.draw(int(0, 2));
  if (written === 0) {
    return path;
  }

  return written === 1 ? `/${path}` : `https://example.com/${path}`;
};

/**
 * Draw a case: a resource type `RootOfType` maps, with an href that names no entry.
 *
 * @param types - The types `RootOfType` maps ({@link documentTypes}).
 * @returns The generator.
 */
const caseOf =
  (types: Arr.NonEmptyReadonlyArray<string>): Gen<Case> =>
  (source) => ({
    href: source.draw(missingHref),
    type: source.draw(element(types)),
  });

/**
 * Add a resource of the case's type to the base's manifest, its href and its one file the case's
 * href.
 *
 * @param of - The case.
 * @returns The package.
 */
const packageOf = (of: Case): PackageEntries => {
  const manifest = new TextDecoder().decode(base.get("imsmanifest.xml"));
  const entries = new Map(base);
  entries.set(
    "imsmanifest.xml",
    new TextEncoder().encode(
      manifest.replace(
        "  </resources>",
        `    <resource identifier="added-res" type="${of.type}" href="${of.href}">\n      <file href="${of.href}"/>\n    </resource>\n  </resources>`,
      ),
    ),
  );

  return entries;
};

/**
 * Judge one case's package, the laws apart from the import that the case watches.
 *
 * @param of - The case.
 * @param bench - The judge's bench.
 * @param at - The case's number.
 * @param watched - The laws neither side may break alone.
 * @returns The check.
 */
const judgedCase = Effect.fn("test.documentEntry.judgedCase")(function* judgedCase(
  of: Case,
  bench: Parameters<typeof judgeOne>[1],
  at: number,
  watched: readonly string[],
) {
  const judged = yield* judgeOne(yield* genomeOf(packageOf(of)), bench, at);
  const said = `${of.type} at ${of.href}: the oracle ${judged.summary.oracle}; the import ${judged.summary.import}`;
  const apart = judged.disagreements.filter(
    (disagreement) =>
      (disagreement.kind === "oracle-only-law" || disagreement.kind === "import-only-law") &&
      watched.includes(disagreement.law),
  );

  assert.deepStrictEqual(apart.map(shownDisagreement), [], said);
  assert.match(judged.summary.oracle, regex("\\bDocument entry\\b", "u"), said);
  assert.notMatch(judged.summary.oracle, regex("\\bRootOfType\\b", "u"), said);
  assert.notMatch(judged.summary.import, regex("\\bRootOfType\\b", "u"), said);
});

layer(NodeServices.layer, { excludeTestServices: true })(
  "a document-typed href that names no entry",
  (it) => {
    it.effect("is Document entry in the law oracle, and RootOfType on neither side", (ctx) =>
      searched(
        ctx,
        Effect.gen(function* documentEntryRuns() {
          const directory = yield* scratchDirectory("document-entry-");
          const bench = { directory, grammar, laws };
          let index = 0;

          assert.strictEqual(documentTypes.length, 10, "the resource types RootOfType maps");

          const types = Arr.isReadonlyArrayNonEmpty(documentTypes)
            ? documentTypes
            : assert.fail("RootOfType maps no resource type");

          return yield* exhaust(
            {
              box: "the 10 document types RootOfType maps, each with an href to missing.xml in the root or items/, through items/../ or not, relative, rooted or https: 10 × 2 × 2 × 3, 120 packages",
              caseHang: Duration.minutes(5),
              coverage: noCoverage,
              generator: caseOf(types),
              literal: (of) => `${of.type} at ${of.href}`,
              oracle: {
                kind: "second-implementation",
                name: "the law oracle against the laws the import's rows break on the host",
              },
              suite: "pantry/document-entry",
            },
            (of) => {
              index += 1;

              return judgedCase(of, bench, index, ["Document entry", "RootOfType"]);
            },
          );
        }).pipe(Effect.scoped),
      ),
    );

    it.effect(
      "is Document entry alone for an included fragment listed under a second type, on both sides",
      () =>
        Effect.gen(function* fragmentTwin() {
          const directory = yield* scratchDirectory("document-entry-twin-");

          yield* judgedCase(twin, { directory, grammar, laws }, 0, [
            "Document entry",
            "RootOfType",
            "Idref target",
          ]);
        }).pipe(Effect.scoped),
    );
  },
);
