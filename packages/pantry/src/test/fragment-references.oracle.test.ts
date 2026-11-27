/**
 * A fragment's references resolve where it is included, once per placement, as its merged document
 * holds them (spec reading `fragment-placement`): a fragment an item splices resolves its feedback
 * and printed variables in the item's declarations.
 *
 * The box is the every-relation package with a fragment spliced into the body of its third item.
 * The fragment makes one reference, a printed variable or a feedback outcome, which names a
 * variable the item declares or one it does not, and is included once or twice. Every case is
 * judged by the law oracle (`#pantry/test/oracle.ts`, which judges an item with the fragments it
 * splices) and by the schema's own laws over the import's rows (`#pantry/test/host-judge.ts`:
 * `FragmentScope`'s placements), and the laws each side breaks must be one set.
 */
import type { Law } from "@bjornpagen/grizzle";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Formatter, Option } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { everyRelationPackage, scopedPackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge, judgedLaws } from "#pantry/test/host-judge.ts";
import { judge as judgeOracle, lawsOf } from "#pantry/test/oracle.ts";
import { databaseJudgedLawNames } from "#pantry/test/law-namer.ts";
import { lawNameOf } from "#pantry/import/refusal.ts";
import { nameOf as packageNameOf } from "#pantry/test/package-name.ts";

/**
 * The reference the fragment makes: a printed variable's `identifier`, or a feedback inline's
 * `outcome-identifier`.
 */
const kinds = ["printed variable", "feedback"] as const;

/**
 * One case: the reference's kind, whether the name it spells is one the item declares, and how
 * many includes place the fragment.
 */
interface FragmentCase {
  readonly kind: (typeof kinds)[number];
  readonly placed: 1 | 2;
  readonly resolves: boolean;
}

/**
 * Every case of the box: 8.
 */
const fragmentCases: Gen<FragmentCase> = (source) => ({
  kind: source.draw(element(kinds)),
  placed: source.draw(element([1, 2] as const)),
  resolves: source.draw(element([true, false])),
});

/**
 * The QTI 3.0 namespace.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * The fragment's path, at the package's root.
 */
const fragmentPath = "afragment.xml";

/**
 * The name a case's reference spells: an outcome the item declares (`SCORE`, and the `VERDICT` the
 * box adds to it for a feedback), else one no declaration holds.
 *
 * @param drawn - The case.
 * @returns The name.
 */
const nameOf = (drawn: FragmentCase): string => {
  if (!drawn.resolves) {
    return "NOPE";
  }

  return drawn.kind === "feedback" ? "VERDICT" : "SCORE";
};

/**
 * Write a case's fragment: a paragraph holding its printed variable or feedback inline.
 *
 * @param drawn - The case.
 * @returns The document.
 */
const fragmentOf = (drawn: FragmentCase): string => {
  const name = nameOf(drawn);
  const reference =
    drawn.kind === "printed variable"
      ? `<qti-printed-variable identifier="${name}"/>`
      : `<qti-feedback-inline outcome-identifier="${name}" identifier="true" show-hide="show">Passed.</qti-feedback-inline>`;

  return `<?xml version="1.0" encoding="UTF-8"?>\n<p xmlns="${asi}">Included: ${reference}</p>\n`;
};

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
 * Build a case's package: the every-relation package, its third item declaring an identifier
 * outcome `VERDICT` beside its `SCORE`, the fragment listed, and its includes in the item's body.
 *
 * @param drawn - The case.
 * @returns The package's entries.
 */
const packageOf = (drawn: FragmentCase): PackageEntries => {
  const includes = `<xi:include href="${fragmentPath}"/>`.repeat(drawn.placed);
  const steps: readonly ((entries: PackageEntries) => PackageEntries)[] = [
    (entries) =>
      replaced(
        entries,
        "items/item3.xml",
        '<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>',
        '<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="VERDICT" cardinality="single" base-type="identifier"/>',
      ),
    (entries) =>
      replaced(
        entries,
        "imsmanifest.xml",
        '<resource identifier="section-res"',
        `<resource identifier="afragment-res" type="imsqti_fragment_xmlv3p0" href="${fragmentPath}">\n      <file href="${fragmentPath}"/>\n    </resource>\n    <resource identifier="section-res"`,
      ),
    (entries) => new Map([...entries, [fragmentPath, new TextEncoder().encode(fragmentOf(drawn))]]),
    (entries) =>
      replaced(
        entries,
        "items/item3.xml",
        "<p>Scored by its included rule.</p>",
        `<p>Scored by its included rule.</p>${includes.replaceAll(fragmentPath, `../${fragmentPath}`)}`,
      ),
  ];

  let entries = everyRelationPackage({ choices: 2, hotspots: 1, hottexts: 1 });
  for (const step of steps) {
    entries = step(entries);
  }

  return entries;
};

/**
 * Name the laws a host judgment lists, each by its law's name.
 *
 * @param laws - The broken or skipped laws.
 * @returns Their names.
 */
const named = (laws: readonly { readonly law: Law }[]): ReadonlySet<string> =>
  new Set(laws.flatMap(({ law }) => Option.toArray(lawNameOf(law))));

/**
 * The oracle's law tables over the installed grammar.
 */
const oracleLaws = lawsOf(grammar);

/**
 * Every law the host judges, read once.
 */
const hostLaws = judgedLaws(Qti);

/**
 * A situation the box must reach: each reference's fragment accepted and refused.
 */
type Situation = `${FragmentCase["kind"]}, ${"accepted" | "refused"}`;

layer(NodeServices.layer, { excludeTestServices: true })(
  "the references of a fragment an item splices",
  (it) => {
    it.effect(
      "resolve in the assembly that places it, once per placement, the law oracle and the import's rows alike",
      (ctx) =>
        searched(
          ctx,
          exhaust(
            {
              /**
               * Two content references, a name declared or not, one or two includes: 8 packages.
               */
              box: "a fragment spliced into an item's body, once or twice, its printed variable or feedback outcome naming a declared or an undeclared variable",
              caseHang: Duration.minutes(2),
              coverage: requiredInSpace<Situation>([
                "printed variable, accepted",
                "printed variable, refused",
                "feedback, accepted",
                "feedback, refused",
              ]),
              generator: fragmentCases,
              literal: Formatter.format,
              /**
               * Two implementations side by side, the law oracle's judgment of the item with what
               * it splices, and the schema's laws over the import's rows.
               */
              oracle: {
                kind: "second-implementation",
                name: "the law oracle's item read through what it splices, and the schema's laws over the import's rows",
              },
              suite: "test/fragment-references",
            },
            (drawn, c) =>
              Effect.scoped(
                Effect.gen(function* oneCase() {
                  const dir = yield* scopedPackage(packageOf(drawn));
                  const judgment = yield* judgeOracle(yield* readEntries(dir), grammar, oracleLaws);
                  assert.strictEqual(judgment._tag, "Judged", Formatter.format(drawn));

                  const oracle = new Set<string>(
                    judgment._tag === "Judged" ? judgment.breaches.map(({ law }) => law) : [],
                  );
                  const program = yield* readProgram(dir, packageNameOf(dir));
                  const host = judge(previewRowsOf(program.inputs), hostLaws);
                  const broken = named(host.broken);
                  const unjudged = named(host.skipped);
                  /**
                   * The laws one judge breaks and the other does not. A placed reference's
                   * resolution in its assembly's declarations is a rule over a query
                   * (overlay-queries/reference.ts), the database's alone to judge, so the oracle's
                   * breach of such a law is no disagreement where the host breaks none. An
                   * unresolved feedback outcome once broke "Feedback outcome type" on the import's
                   * rows alone, resolved to the nil declaration of base type none; it has no
                   * declaration row now, so that law judges only a resolved outcome (lane NIL's
                   * NS2).
                   */
                  const shown = [
                    ...Iterator.from(broken)
                      .filter((law) => !oracle.has(law))
                      .map((law) => `import-only-law: ${law}`),
                    ...Iterator.from(oracle)
                      .filter(
                        (law) =>
                          !broken.has(law) &&
                          !unjudged.has(law) &&
                          !databaseJudgedLawNames.has(law),
                      )
                      .map((law) => `oracle-only-law: ${law}`),
                  ].toSorted();
                  c.note(`${drawn.kind}, ${oracle.size === 0 ? "accepted" : "refused"}`);
                  assert.strictEqual(
                    oracle.size === 0,
                    drawn.resolves,
                    `${Formatter.format(drawn)}: the oracle breaks ${[...oracle].toSorted().join(", ") || "no law"}`,
                  );

                  assert.deepStrictEqual(
                    shown,
                    [],
                    `${Formatter.format(drawn)}: ${shown.join("; ")}; the oracle breaks ${[...oracle].toSorted().join(", ") || "no law"}; the import's rows break ${[...broken].toSorted().join(", ") || "no law"}`,
                  );
                }),
              ),
          ),
        ),
    );
  },
);
