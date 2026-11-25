/**
 * The site generator's packages (`#pantry/test/gen/sites.ts`) against the law oracle (lane NIL, the
 * SitePath fix; spec readings 114 and 115): every way each of the package's two sites can write
 * its href, exhausted, each package imported once and its rows judged by the site laws restated on
 * the host and by the schema's own statements, and the verdicts held to one:
 * the rows', the statements', the law oracle's, and the case table's (`rulesOfBox`).
 *
 * A site's href is a row of its own, `SitePath`, written only where the href names a path of the
 * package, with whether an entry is there (`entry`), and its target another, `SiteTarget`. So no
 * site holds a stand-in path, and each fault breaks one law: an href naming an absent file breaks
 * `File_exists` alone, a CHECK the row meets as it is inserted, whatever its site; and an include
 * that names no document breaks "Include target" alone.
 */
import type { Addition } from "@bjornpagen/grizzle";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import type { Case } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Option } from "effect";
import { readProgram } from "#pantry/import/program.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { readEntries } from "#pantry/package/read.ts";
import { Qti } from "#pantry/qti/schema.ts";
import type { Site } from "#pantry/qti/tests.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { judge, judgedLaws, previewRowsOf, textOfField } from "#pantry/test/host-judge.ts";
import type { HeldRow } from "#pantry/test/host-judge.ts";
import {
  outsideRulesOfBox,
  ruleOfCase,
  rulesOfBox,
  siteBox,
  siteLiteral,
  siteNames,
  sitePackage,
  sites,
} from "#pantry/test/gen/sites.ts";
import type { HrefCase, SiteBox, SiteName } from "#pantry/test/gen/sites.ts";
import { oracleVerdict } from "#pantry/test/oracle-verdict.ts";
import { ruleOfLaw } from "#pantry/import/refusal.ts";
import { includeTargetBreachesOf } from "#pantry/test/placed-includes.ts";
import { nameOf } from "#pantry/test/package-name.ts";

/**
 * The rules a site's laws or an absent file refuse a package under: the include's target, the
 * href's reachability and the file's existence.
 */
const siteRules: ReadonlySet<string> = new Set(["file-exists", "include-target", "reachability"]);

/**
 * A situation the box must reach: each site under each case.
 */
type Situation = `${SiteName} ${HrefCase}`;

/**
 * Write an element's key, `(package, path, start)`, as one text, so the rows of one element are
 * found by it.
 *
 * @param row - A row over an element.
 * @param row.package - Its package's manifest identifier.
 * @param row.path - Its document's path.
 * @param row.start - The element's position in its document.
 * @returns The text.
 */
const placeOf = (row: {
  readonly package: string;
  readonly path: string;
  readonly start: bigint;
}): string => JSON.stringify([row.package, row.path, String(row.start)]);

/**
 * Find the one site row of a named site of the box: its document's and its element's.
 *
 * @param inputs - The package's import inputs.
 * @param name - The site.
 * @returns The row.
 */
const siteOf = (inputs: PackageInputs, name: SiteName): Addition<typeof Site> => {
  const found = [...inputs.Site.values()].filter(
    (site) => site.path === sites[name].path && site.kind === sites[name].kind,
  );
  assert.lengthOf(found, 1, `${name}: one site row`);

  const [site] = found;
  if (site === undefined) {
    return assert.fail(`${name}: no site row`);
  }

  return site;
};

/**
 * Judge a package's site rows by the site laws restated on the host: each `SitePath` a site's, its
 * path its href's `ReferencePath` and `entry` exactly where an entry is there; each `SiteTarget` a
 * site's and its path's, exactly where that path is a listed document. The rules the rows break,
 * each site's one: `File_exists` where its path's `entry` is false, which PostgreSQL judges as the
 * row is inserted; otherwise, for an include with no target whose href does not resolve outside the
 * package, "Include target" (an external include, marked `external` exactly where its href's
 * `Reference` is external, is stored as written and never fetched, reading 115).
 *
 * @param inputs - The package's import inputs.
 * @param literal - The package's literal, for the assertions' messages.
 * @returns The rules the rows break.
 */
const rowRules = (inputs: PackageInputs, literal: string): ReadonlySet<string> => {
  const hrefPaths = new Set(
    inputs.ReferencePath.values()
      .filter(({ name }) => name === "href")
      .map((row) => JSON.stringify([placeOf(row), row.target])),
  );
  const externalHrefs = new Set(
    [...inputs.Reference.values()].flatMap((row) =>
      row.name === "href" && row.scope === "external" ? [placeOf(row)] : [],
    ),
  );
  const entries = new Set([...inputs.Entry.values()].map(({ path }) => path));
  const documents = new Set([...inputs.Document.values()].map(({ path }) => path));
  const pathOf = new Map([...inputs.SitePath.values()].map((row) => [placeOf(row), row]));
  const targetOf = new Map([...inputs.SiteTarget.values()].map((row) => [placeOf(row), row]));
  const siteNodes = new Set([...inputs.Site.values()].map(placeOf));
  assert.isTrue(
    [...pathOf.keys(), ...targetOf.keys()].every((node) => siteNodes.has(node)),
    `${literal}: a path or a target of no site`,
  );

  const broken = new Set<string>();
  for (const name of siteNames) {
    const site = siteOf(inputs, name);
    const path = pathOf.get(placeOf(site));
    const target = targetOf.get(placeOf(site));
    assert.strictEqual(
      site.external,
      externalHrefs.has(placeOf(site)),
      `${literal}: ${name}'s external mark`,
    );
    if (path !== undefined) {
      assert.isTrue(
        hrefPaths.has(JSON.stringify([placeOf(path), path.target])),
        `${literal}: ${name}'s path ${path.target} is no ReferencePath of its href`,
      );
      assert.strictEqual(path.entry, entries.has(path.target), `${literal}: ${name}'s entry`);
      assert.strictEqual(path.kind, site.kind, `${literal}: ${name}'s path's kind`);
    }

    assert.strictEqual(
      target?.target,
      path !== undefined && documents.has(path.target) ? path.target : undefined,
      `${literal}: ${name}'s target`,
    );

    if (path?.entry === false) {
      broken.add("file-exists");
    } else if (target === undefined && !site.external) {
      broken.add("include-target");
    }
  }

  return broken;
};

/**
 * The site laws as the host judge reads them from the schema's statements, selections included:
 * `SitePath`'s `File_exists`, and every containment from a site or its path, the include's target
 * and href, the file's existence and the href's reachability.
 */
const siteLaws = judgedLaws(Qti).filter((law) =>
  law.kind === "check"
    ? law.relation === "SitePath" && law.name === "File_exists"
    : law.kind === "contained" &&
      (law.from.relation === "Site" || law.from.relation === "SitePath"),
);

/**
 * Write a row's element's key, `(package, path, start)`, each value's text as grizzle's
 * `codecText` of `Site`'s field writes it.
 *
 * @param row - The row.
 * @returns The key.
 */
const heldPlaceOf = (row: HeldRow): string =>
  JSON.stringify([
    textOfField("Site", "package", row["package"]),
    textOfField("Site", "path", row["path"]),
    textOfField("Site", "start", row["start"]),
  ]);

/**
 * Judge each site's rows by the schema's own statements, the site laws, over the rows the import's
 * write stores, each breach named by refusal.ts's rule for its law, by the site it is the row of.
 * "Include target" is a containment out of the query `PlacedIncludePath`, which the host judge
 * leaves to the database, so its breaches are read from its restatement over the same rows
 * (`#pantry/test/placed-includes.ts`): an include naming an entry that is no document breaks it
 * alone, as the database refuses it.
 *
 * @param inputs - The package's import inputs.
 * @returns The rules each site's rows break, by its element's key ({@link heldPlaceOf}); the case fails
 *   where the host leaves a site law unjudged.
 */
const schemaRules = (inputs: PackageInputs): ReadonlyMap<string, ReadonlySet<string>> => {
  const rows = previewRowsOf(inputs);
  const { broken, skipped } = judge(rows, siteLaws);
  assert.deepStrictEqual(
    skipped.map(({ unjudged }) => unjudged),
    [],
    "a site law the host leaves unjudged",
  );

  const rules = new Map<string, Set<string>>();
  const breaches = [
    ...broken.map(({ law, rows: held }) => ({
      held,
      rule:
        law.kind === "check" ? "file-exists" : Option.getOrElse(ruleOfLaw(law), () => "unnamed"),
    })),
    { held: includeTargetBreachesOf(rows), rule: "include-target" },
  ];
  for (const { held, rule } of breaches) {
    for (const row of held) {
      const at = heldPlaceOf(row);
      rules.set(at, new Set([...(rules.get(at) ?? []), rule]));
    }
  }

  return rules;
};

/**
 * Judge one package of the box: its rows under the site laws, the law oracle's verdict, the case
 * table's rules and the schema's own statements over its rows, one set of rules from all four.
 *
 * @param box - The package.
 * @param c - The search's case.
 * @returns Nothing; fails the case on a disagreement.
 */
const judged = (box: SiteBox, c: Case<Situation>) =>
  Effect.gen(function* judgedSites() {
    const literal = siteLiteral(box);
    const dir = yield* scopedPackage(sitePackage(box));
    const verdict = yield* oracleVerdict(yield* readEntries(dir));
    const program = yield* readProgram(dir, nameOf(dir));
    const byRows = rowRules(program.inputs, literal);
    const byCases = rulesOfBox(box);
    const outside = outsideRulesOfBox(box);
    const oracled = new Set(
      verdict.kind === "refused" ? [...verdict.rules].filter((rule) => siteRules.has(rule)) : [],
    );

    c.noteAll(siteNames.map((name): Situation => `${name} ${box[name]}`));
    assert.deepStrictEqual(
      byRows,
      byCases,
      `${literal}: its site rows break {${[...byRows].join(", ")}}, and its cases {${[...byCases].join(", ")}}`,
    );
    assert.deepStrictEqual(
      oracled,
      byCases,
      `${literal}: the law oracle refuses it under {${verdict.kind === "refused" ? [...verdict.rules].join(", ") : ""}}, and its cases {${[...byCases].join(", ")}}`,
    );
    assert.strictEqual(
      verdict.kind === "accepted",
      byCases.size === 0 && outside.size === 0,
      `${literal}: the law oracle ${verdict.kind === "accepted" ? "accepts" : "refuses"} it`,
    );
    if (byCases.size > 0 && verdict.kind === "refused") {
      assert.deepStrictEqual(
        [...verdict.rules].filter((rule) => !byCases.has(rule) && !outside.has(rule)),
        [],
        `${literal}: the law oracle names rules beyond its cases {${[...byCases].join(", ")}} and the outside rules {${[...outside].join(", ")}}`,
      );
    }

    if (byCases.size === 0 && verdict.kind === "refused") {
      assert.deepStrictEqual(
        verdict.rules,
        outside,
        `${literal}: the law oracle refuses it under {${[...verdict.rules].join(", ")}}, outside the site laws`,
      );
    }

    const broken = schemaRules(program.inputs);
    for (const name of siteNames) {
      const site = siteOf(program.inputs, name);
      const expected = ruleOfCase(box[name]);
      assert.deepStrictEqual(
        [...(broken.get(heldPlaceOf(site)) ?? [])].toSorted(),
        expected === undefined ? [] : [expected],
        `${literal}: ${name} by the schema's statements`,
      );
    }
  }).pipe(Effect.scoped);

layer(NodeServices.layer, { excludeTestServices: true })("test/gen/sites.ts", (it) => {
  it.effect(
    "writes each site's href and target as rows of their own, so each package breaks exactly the site laws its cases, the law oracle and the schema's own statements name, an absent file File_exists alone",
    (ctx) =>
      // Oracle: a second implementation, the law oracle (`#pantry/test/oracle.ts`) over the same
      // entries; the schema's statements as grizzle keeps them, their selections included
      // (`#pantry/test/host-judge.ts`), judged by grizzle's evaluator over the rows the import's
      // write stores; and the specification as
      // a checker, reading 115 per case (`ruleOfCase`), against the import's rows under the site
      // laws restated on the host.
      // Bound: the every-relation package's two sites, each listed, naming an absent file, an
      // entry listed as no document or a file outside the package, or writing no href, 25, each
      // imported once and held to every verdict.
      searched(
        ctx,
        exhaust(
          {
            box: "the every-relation package's include of fragment.xml and include of rules.xml, each listed, naming an absent file, an entry listed as no document or an external file, or writing no href",
            caseHang: Duration.seconds(120),
            coverage: requiredInSpace<Situation>([
              "fragment absent",
              "fragment external",
              "fragment listed",
              "fragment missing",
              "fragment unlisted",
              "rules absent",
              "rules external",
              "rules listed",
              "rules missing",
              "rules unlisted",
            ]),
            generator: siteBox,
            literal: siteLiteral,
            oracle: { kind: "second-implementation", name: "the law oracle over the same entries" },
            suite: "pantry/test/gen-sites-box",
          },
          judged,
        ),
      ),
  );
});
