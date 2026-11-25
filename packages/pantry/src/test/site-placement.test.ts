/**
 * Every placement of a site, judged three ways: the law oracle's verdict over the package, the
 * import's own rows, and the CHECKs those rows meet in the database, Site's `E1_derived` among
 * them, judged by grizzle's evaluator over the rows the import's write stores.
 *
 * A site is an include under a parent the information model gives an Include: an item's body or
 * processing, or a fragment's content, and its placement's document is a fragment, whose root is
 * any kind the include may stand for (spec readings 114 and 117). Each package below is the
 * every-relation package, which the law oracle accepts, with one site placed differently, and
 * every law the host judges (`#pantry/test/host-judge.ts`) holds over its rows.
 */
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import type { EvaluatedRow } from "@bjornpagen/grizzle/compile";
import { Duration, Effect, Formatter, Result } from "effect";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { everyRelationPackage, scopedPackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge, judgedLaws } from "#pantry/test/host-judge.ts";
import { oracleVerdict } from "#pantry/test/oracle-verdict.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { evaluatorOf, insideDomains } from "#pantry/test/row-evaluation.ts";

/**
 * The places a site stands in, each with the parent kind its site has there: an include in an
 * item's body (`qti-item-body`) and in its response processing (`qti-response-processing`), the
 * every-relation package's own, and an include in a fragment's content (`div`), of a second
 * fragment.
 */
const placements = [
  { kind: "xi:include", name: "item body", parentKind: "qti-item-body" },
  { kind: "xi:include", name: "item processing", parentKind: "qti-response-processing" },
  { kind: "xi:include", name: "fragment", parentKind: "div" },
] as const;

/**
 * One place a site stands in.
 */
type Placement = (typeof placements)[number];

/**
 * The XInclude namespace.
 */
const xi = "http://www.w3.org/2001/XInclude";

/**
 * Replace the one occurrence of a text in an entry of a package.
 *
 * @param entries - The package's entries.
 * @param path - The entry.
 * @param search - The text, which must occur exactly once.
 * @param replacement - Its replacement.
 * @returns The entries, that entry edited.
 */
const replaced = (
  entries: PackageEntries,
  path: string,
  search: string,
  replacement: string,
): PackageEntries => {
  const text = new TextDecoder().decode(entries.get(path));
  assert.lengthOf(text.split(search), 2, `${path}: ${search}`);

  return new Map([
    ...entries,
    [path, new TextEncoder().encode(text.replace(search, () => replacement))],
  ]);
};

/**
 * The every-relation package with a site at a placement: its own two item includes, or a second
 * fragment its fragment includes.
 *
 * @param placement - The placement.
 * @returns The package's entries.
 */
const packageOf = (placement: Placement): PackageEntries => {
  const base = everyRelationPackage({ choices: 2, hotspots: 1, hottexts: 1 });
  const placed: Readonly<Record<Placement["name"], () => PackageEntries>> = {
    fragment: () =>
      replaced(
        replaced(
          replaced(
            new Map([
              ...base,
              [
                "items/inner.xml",
                new TextEncoder().encode(
                  '<?xml version="1.0" encoding="UTF-8"?>\n<div xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><p>Placed inside the fragment.</p></div>\n',
                ),
              ],
            ]),
            "items/fragment.xml",
            '<div xmlns="',
            `<div xmlns:xi="${xi}" xmlns="`,
          ),
          "items/fragment.xml",
          "</div>\n",
          '  <xi:include href="inner.xml"/>\n</div>\n',
        ),
        "imsmanifest.xml",
        '<resource identifier="stimulus1-res"',
        '<resource identifier="inner-res" type="imsqti_fragment_xmlv3p0" href="items/inner.xml">\n      <file href="items/inner.xml"/>\n    </resource>\n    <resource identifier="stimulus1-res"',
      ),
    "item body": () => base,
    "item processing": () => base,
  };

  return placed[placement.name]();
};

/**
 * Grizzle's evaluator of `Qti`'s rows.
 */
const evaluate = evaluatorOf(Qti);

/**
 * Whether a site's row holds Site's `E1_derived`, as grizzle's evaluator judges it.
 *
 * @param site - The site's whole row, as the import's write stores it.
 * @returns Whether it holds the check; the case fails where its domains refuse the row or the host
 *   leaves the check unevaluated.
 */
const siteCheck = (site: EvaluatedRow<typeof Qti.relations.Site>): boolean => {
  const verdict = evaluate(
    Qti.relations.Site,
    insideDomains(evaluate.admit(Qti.relations.Site, site), "a site"),
  ).checks.E1_derived;

  return Result.isSuccess(verdict)
    ? verdict.success === "holds"
    : assert.fail(`E1_derived: ${verdict.failure.why}`);
};

/**
 * Every law the host judges, read once.
 */
const laws = judgedLaws(Qti);

/**
 * The features a search must reach: a site under an item's own content, and one under a fragment's.
 */
type Reached = "an item's site" | "a fragment's site";

layer(NodeServices.layer, { excludeTestServices: true })("a site at every placement", (it) => {
  it.effect(
    "writes each placement's site and instances as the law oracle accepts them and Site's and Instance's E1_derived keep them, and refuses a site that is no include",
    (ctx) =>
      searched(
        ctx,
        exhaust(
          {
            box: "every placement of a site: an include in an item's body, its processing, and a fragment",
            caseHang: Duration.minutes(2),
            concurrency: 1,
            coverage: requiredInSpace<Reached>(["an item's site", "a fragment's site"]),
            generator: (source) => source.draw(element(placements)),
            literal: Formatter.format,
            oracle: {
              kind: "second-implementation",
              name: "the law oracle's verdict, and every law the host judges over the import's rows, Site's and Instance's E1_derived among them",
            },
            suite: "test/site-placement",
          },
          (placement, c) =>
            Effect.scoped(
              Effect.gen(function* onePlacement() {
                const dir = yield* scopedPackage(packageOf(placement));
                const verdict = yield* oracleVerdict(yield* readEntries(dir));
                const program = yield* readProgram(dir, nameOf(dir));
                const stored = previewRowsOf(program.inputs);
                const sites = stored.Site.filter(
                  (site) =>
                    site.kind === placement.kind && site.parentKind === placement.parentKind,
                );

                assert.deepStrictEqual(verdict, { kind: "accepted" }, placement.name);
                assert.isNotEmpty(sites, `${placement.name}: no site there`);
                assert.deepStrictEqual(
                  judge(stored, laws).broken.map(
                    ({ law, rows }) => `${Formatter.format(law)}: ${Formatter.format(rows)}`,
                  ),
                  [],
                  `${placement.name}: a law the import's rows break`,
                );
                for (const site of sites) {
                  c.note(site.parentKind === "div" ? "a fragment's site" : "an item's site");
                  assert.isTrue(siteCheck(site), placement.name);

                  // The planted wrong kind: an item ref in the include's place, which is no site
                  // (a section ref is one, wherever it stands, §7.5).
                  assert.isFalse(
                    siteCheck({ ...site, kind: "qti-assessment-item-ref" }),
                    `${placement.name}: an item ref kept as a site`,
                  );
                }
              }),
            ),
        ),
      ),
  );
});
