/**
 * A resource's LOM record names the document its href names (spec reading `resource-href`), and
 * that document's assessment object is the "associated item, test or object bank" whose identifier
 * one general identifier entry matches (`lom-identifier`, QTI 3.0 Metadata §2.7.1.1) and whose
 * title one title string matches (`lom-title`, §2.7.1.2), whatever type the resource is listed
 * under: a document whose root is an item is that object, and a document with no such root has
 * none, a test's included, since pantry stores no test (spec reading `tests-stored-as-defined`), so
 * a record that lists an identifier or a title breaks its law. The database holds it so, by rules
 * over queries (`#pantry/qti/queries.ts`: `namingRecords`, the document a resource lists at its
 * href, and `ObjectIdentifier` and `objectTitles`, its root's attributes' `value`). GEN-A's
 * differential found the law oracle reading a record's identifier against no object where the
 * resource's type and the root's kind are no pair of `RootOfType`, which the import's rows hold.
 *
 * Oracle: the specification as a checker, §2.7.1.1 and §2.7.1.2 as stated above, against the law
 * oracle (`#pantry/test/oracle.ts` `judge`, through `#pantry/test/gen/genetic/judge.ts`
 * `judgeOne`, which also builds the import's rows). The host judge leaves a rule over a query
 * unjudged, so the import's side states neither law.
 *
 * Bound: a package of one resource and its document, of the one resource type a record names (an
 * item's), each of 3 roots (an item's, and a test's and a stimulus's, which are no assessment
 * object), and each of 3 forms of the record's identifier and of its title (absent, the
 * document's, another): 27 cases, exhausted.
 */
import { regex } from "arkregex";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { genomeOf } from "#pantry/test/gen/genetic/genome.ts";
import { judgeOne } from "#pantry/test/gen/genetic/judge.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";
import { laws } from "#pantry/test/installed-laws.ts";

/**
 * The document's identifier and title, which a record's entry and string match or don't.
 */
const document = { identifier: "choice", title: "Unattended Luggage" } as const;

/**
 * The resource types whose records name their document (`objectTypes`, `#pantry/qti/metadata.ts`).
 */
const types = ["imsqti_item_xmlv3p0"] as const;

/**
 * The document's root: an item's, an assessment object, and a test's and a stimulus's, none.
 */
const roots = [
  { kind: "qti-assessment-item", object: true },
  { kind: "qti-assessment-test", object: false },
  { kind: "qti-assessment-stimulus", object: false },
] as const;

/**
 * A record's identifier entry or title string: none, the document's, or another.
 */
const forms = ["absent", "the document's", "another"] as const;

/**
 * One case of the bound.
 */
interface Case {
  readonly identifier: (typeof forms)[number];
  readonly root: (typeof roots)[number];
  readonly title: (typeof forms)[number];
  readonly type: (typeof types)[number];
}

/**
 * Every case of the bound.
 */
const cases: readonly Case[] = types.flatMap((type) =>
  roots.flatMap((root) =>
    forms.flatMap((identifier) => forms.map((title): Case => ({ identifier, root, title, type }))),
  ),
);

/**
 * Write a form as the record's value: none, the document's own, or another.
 *
 * @param form - The form.
 * @param own - The document's value.
 * @returns The value, none for an absent one.
 */
const valueOf = (form: (typeof forms)[number], own: string): string | undefined => {
  switch (form) {
    case "absent": {
      return undefined;
    }
    case "the document's": {
      return own;
    }
    case "another": {
      return `${own} two`;
    }
  }
};

/**
 * Build a case's package: the manifest, whose one resource of the case's type names `doc.xml` and
 * carries one record with the case's identifier and title, and the document, its root the case's.
 *
 * @param of - The case.
 * @returns The package's entries.
 */
const packageOf = (of: Case): ReadonlyMap<string, Uint8Array> => {
  const identifier = valueOf(of.identifier, document.identifier);
  const title = valueOf(of.title, document.title);
  const manifest = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM">',
    "  <metadata><schemaversion>3.0.1</schemaversion></metadata>",
    "  <resources>",
    `    <resource identifier="doc-res" type="${of.type}" href="doc.xml">`,
    "      <metadata><imsmd:lom><imsmd:general>",
    ...(identifier === undefined
      ? []
      : [`        <imsmd:identifier><imsmd:entry>${identifier}</imsmd:entry></imsmd:identifier>`]),
    ...(title === undefined
      ? []
      : [`        <imsmd:title><imsmd:string>${title}</imsmd:string></imsmd:title>`]),
    "      </imsmd:general></imsmd:lom></metadata>",
    '      <file href="doc.xml"/>',
    "    </resource>",
    "  </resources>",
    "</manifest>",
    "",
  ].join("\n");
  const doc = `<?xml version="1.0" encoding="UTF-8"?>\n<${of.root.kind} xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="${document.identifier}" title="${document.title}"/>\n`;
  const text = new TextEncoder();

  return new Map([
    ["imsmanifest.xml", text.encode(manifest)],
    ["doc.xml", text.encode(doc)],
  ]);
};

/**
 * Name a case.
 *
 * @param of - The case.
 * @returns Its name.
 */
const nameOf = (of: Case): string =>
  `${of.type} naming a ${of.root.kind}, its record's identifier ${of.identifier} and title ${of.title}`;

layer(NodeServices.layer, { excludeTestServices: true })(
  "a record's identifier and title, against the document its resource names",
  (it) => {
    it.effect(
      "breaks lom-identifier and lom-title in the law oracle exactly where §2.7.1.1 and §2.7.1.2 say, over rows the import builds",
      (ctx) =>
        searched(
          ctx,
          Effect.gen(function* lomObjectRuns() {
            const directory = yield* scratchDirectory("lom-object-");
            const bench = { directory, grammar, laws };

            assert.strictEqual(cases.length, 27);

            return yield* exhaust(
              {
                box: "the named resource type, 3 roots, and 3 forms each of the record's identifier and title",
                caseHang: Duration.minutes(5),
                coverage: noCoverage,
                generator: int(0, cases.length - 1),
                literal: (at) => {
                  const of = cases[at];

                  return of === undefined ? String(at) : nameOf(of);
                },
                oracle: {
                  kind: "specification",
                  name: "§2.7.1.1 and §2.7.1.2, against the law oracle",
                },
                suite: "pantry/lom-object",
              },
              (at) =>
                Effect.gen(function* lomObjectCase() {
                  const of = cases[at];
                  assert.isDefined(of, `no case ${String(at)}`);

                  const judged = yield* judgeOne(yield* genomeOf(packageOf(of)), bench, at);
                  const said = `${nameOf(of)}: the oracle ${judged.summary.oracle}; the import ${judged.summary.import}`;
                  const identifierBreaks =
                    of.identifier !== "absent" &&
                    (!of.root.object || of.identifier !== "the document's");
                  const titleBreaks =
                    of.title !== "absent" && (!of.root.object || of.title !== "the document's");

                  assert.match(judged.summary.import, regex("^built ", "u"), said);
                  assert.strictEqual(
                    regex("\\bLomObjectIdentifier\\b", "u").test(judged.summary.oracle),
                    identifierBreaks,
                    said,
                  );
                  assert.strictEqual(
                    regex("\\bLomObjectTitle\\b", "u").test(judged.summary.oracle),
                    titleBreaks,
                    said,
                  );
                }),
            );
          }).pipe(Effect.scoped),
        ),
    );
  },
);
