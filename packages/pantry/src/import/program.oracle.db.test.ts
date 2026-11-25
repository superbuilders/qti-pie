/**
 * The import on the lease, PostgreSQL itself the judge (testing doctrine, rule 3): each accepted
 * package commits whole in one transaction, and each refused one is refused under the law its one
 * edit breaks (membership in the laws the outcome's refusal names, `lawsOfRefusal`, since one
 * native object may discharge several, C22). Written to run at N1 on the lease and restated in the
 * network seat's probe, never by a hand.
 *
 * The cases over a whole package that the slices left to the importer (their reports, and the
 * orchestrator's lists of 2026-11-06) run through one helper: a valid package, one edit, the
 * apply. An edit is either of the package's text ({@link editedSimple}, a fixture spec over
 * `simple`), which the reader and the codec read like any package, or of one row of its inputs,
 * with the copy of it the import writes beside it, before the ChangeSet is built
 * ({@link applyEdited}), which writes a state no valid document shreds to but every written type
 * admits. A corruption no written type admits (a gap in a family's slots, a wrong count, a junk
 * accumulator) cannot be written through the API at all; those are the slices' direct-SQL cases.
 *
 * Each case also logs how long its apply takes: the author login's `insertWrite` member, compiled
 * once by `grizzle generate` into the login's served file, applied to the package's facts.
 */
import { regex } from "arkregex";
import type { Law } from "@bjornpagen/grizzle";
import type { CallError } from "@bjornpagen/grizzle/runtime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { boolean } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Formatter, Layer, Option, Result } from "effect";
import { describe, inject } from "vitest";
import { composed } from "#pantry/grammar/compose.ts";

import { WrapApply } from "#pantry/import/package.ts";
import { boxHolds } from "#pantry/test/box.ts";
import { importDir } from "#pantry/test/import-dir.ts";
import { nameOf } from "#pantry/test/package-name.ts";

import type { NodeMember, NodeRoot, PackageInputs } from "#pantry/import/write.ts";
import type { Place } from "#pantry/qti/schema.ts";
import { readEntries } from "#pantry/package/read.ts";

import {
  corpusPackage,
  materialize,
  materializeSpec,
  ownIdentifierOf,
  specOf,
  variantOf,
} from "#pantry/test/fixtures.ts";
import type { FixtureName, FixtureSpec, TextEdit } from "#pantry/test/fixtures.ts";
import { materializeProcessing, processingFixtureNames } from "#pantry/test/processing-fixtures.ts";
import { processingVerdicts } from "#pantry/test/processing-verdicts.ts";
import { resourceTypeCases } from "#pantry/test/resource-type-cases.ts";
import { judge, lawsOf, verdictOf } from "#pantry/test/oracle.ts";
import { hasLease } from "#pantry/test/settings.ts";
import { ImportRefused } from "#pantry/import/rules.ts";
import { AuthorAppLayer } from "#pantry/db/layer.ts";
import { memoryMediaStore } from "#pantry/package/media.ts";
import { fileDatabaseOf } from "#pantry/test/writing-files.ts";
import {
  applyEdited,
  checkNamed,
  keyOn,
  packageStored,
  rejectedBy,
} from "#pantry/test/apply-edited.ts";

/**
 * The call error of a write whose COMMIT got no answer, as grizzle's call ends with it: it may
 * have committed.
 */
const commitUnknown: CallError = {
  kind: "commitUnknown",
  message: "the COMMIT was sent and no answer came",
  retry: "never",
};

const fixtures = inject("fixtures");

/**
 * A package's inputs as read: the edit that applies the package unchanged.
 *
 * @param inputs - The inputs.
 * @returns The same inputs.
 */
const asRead = (inputs: PackageInputs): PackageInputs => inputs;

/**
 * 1EdTech's `svg`, a QTI 3.0.1 package as every fixture is ({@link corpusPackage}), otherwise
 * unedited.
 */
const svgSpec: FixtureSpec = corpusPackage({
  edits: [],
  member: "qtiv3-examples/packaging/svg/svg.zip",
  name: "svg",
});

/**
 * The corpus packages pantry accepts, by name. 1EdTech's `svg` holds `simple`'s manifest
 * identifier, and each is stored under its own name, its directory's
 * ({@link variantOf} gives the variant a directory of its own).
 */
const acceptedPackages = Effect.all({
  sharedMedia: materialize("sharedMedia"),
  simple: Effect.succeed(fixtures.simple),
  svg: materializeSpec(variantOf(svgSpec, "q5.15-svg", [])),
});

/**
 * The name of a variant of `simple` this file imports.
 *
 * @param name - The case's name.
 * @returns The variant's name.
 */
const simpleVariant = (name: string): string => `q5.15-${name}`;

/**
 * `simple` with edits of its text, materialized once under its own name and manifest identifier
 * ({@link variantOf}), so each case's package is one of its own on the lease.
 *
 * @param name - The fixture's name.
 * @param edits - The edits, each a replacement of one occurrence in one file.
 * @returns The package's directory.
 */
const editedSimple = (name: string, edits: readonly TextEdit[]) =>
  materializeSpec(variantOf(specOf("simple"), simpleVariant(name), edits));

/**
 * Insert declarations into `simple`'s item after its response declaration, which content order
 * admits there.
 *
 * @param markup - The declarations.
 * @returns The edit.
 */
const afterResponse = (markup: string): TextEdit => ({
  _tag: "ReplaceText",
  file: "choice.xml",
  replacement: `</qti-response-declaration>${markup}`,
  search: "</qti-response-declaration>",
});

/**
 * The places of simple's item a label of the label box may stand on: three that ask for no tool, a
 * calculator info's and a digital material's, each an ItemFileInfo (§5.80.2), and a printed
 * variable (§7.30.4), and a paragraph (§5.16.5), which asks for one.
 */
const labelSiteNames = ["calculator", "material", "printed", "paragraph"] as const;

/**
 * Which places of simple's item carry a label.
 */
type LabelSites = Readonly<Record<(typeof labelSiteNames)[number], boolean>>;

/**
 * Draw a case of the label box: each place of {@link labelSiteNames} carrying a label or none.
 */
const labelSites: Gen<LabelSites> = (source) => ({
  calculator: source.draw(boolean),
  material: source.draw(boolean),
  paragraph: source.draw(boolean),
  printed: source.draw(boolean),
});

/**
 * How many cases {@link labelSites} draws: each of 4 places with a label or none.
 */
const LABEL_SITE_CASES = 2 ** 4;

/**
 * A `label` attribute where `carried` says, none elsewhere.
 *
 * @param carried - Whether the place carries a label.
 * @param label - The label.
 * @returns The attribute's text, with its leading space, or nothing.
 */
const labelled = (carried: boolean, label: string): string => (carried ? ` label="${label}"` : "");

/**
 * Simple's item body led by companion materials, a calculator info and a digital material, with a
 * printed variable after a paragraph, each carrying a label where `sites` says.
 *
 * @param sites - The places that carry a label.
 * @returns The text that replaces the body's start tag.
 */
const labelledBody = (sites: LabelSites): string =>
  `<qti-companion-materials-info><qti-calculator><qti-calculator-type>basic</qti-calculator-type><qti-description>A calculator</qti-description><qti-calculator-info${labelled(sites.calculator, "calculator")}><qti-file-href>https://example.org/calculator.html</qti-file-href></qti-calculator-info></qti-calculator><qti-digital-material${labelled(sites.material, "table")}><qti-file-href>https://example.org/table.html</qti-file-href></qti-digital-material></qti-companion-materials-info><qti-item-body><p${labelled(sites.paragraph, "paragraph")}>Labelled</p><p>Score: <qti-printed-variable identifier="SCORE"${labelled(sites.printed, "score")}/></p>`;

/**
 * Insert declarations into `simple`'s item after its outcome declaration.
 *
 * @param markup - The declarations.
 * @returns The edit.
 */
const afterOutcome = (markup: string): TextEdit => ({
  _tag: "ReplaceText",
  file: "choice.xml",
  replacement: `</qti-outcome-declaration>${markup}`,
  search: "</qti-outcome-declaration>",
});

/**
 * Insert a resource into `simple`'s manifest before its first.
 *
 * @param markup - The resource.
 * @returns The edit.
 */
const resourceBefore = (markup: string): TextEdit => ({
  _tag: "ReplaceText",
  file: "imsmanifest.xml",
  replacement: `<resources>${markup}`,
  search: "<resources>",
});

/**
 * Pick a containment by the relations of its two sides.
 *
 * @param from - The source's relation.
 * @param to - The target's relation.
 * @returns The predicate.
 */
const containedIn =
  (from: string, to: string) =>
  (law: Law): boolean =>
    law.kind === "contained" && law.from.relation === from && law.to.relation === to;

/**
 * Hold PostgreSQL to a verdict on a package: an accepted one commits, and a refused one is
 * refused under rules that include its rule.
 *
 * @param name - The package's name, for the assertions' messages.
 * @param dir - The package.
 * @param verdict - The verdict it is held to.
 * @returns Nothing, once PostgreSQL's verdict is the one given.
 */
const holdsVerdict = (
  name: string,
  dir: string,
  verdict:
    | { readonly verdict: "accepted" }
    | { readonly rule: string; readonly verdict: "refused" },
) =>
  Effect.gen(function* heldToVerdict() {
    if (verdict.verdict === "accepted") {
      const { outcome } = yield* applyEdited(dir, asRead);

      assert.strictEqual(outcome.kind, "accepted", `${name}: ${Formatter.format(outcome)}`);

      return;
    }

    const refused = yield* Effect.flip(importDir(dir, nameOf(dir)));

    assert.include(
      refused instanceof ImportRefused
        ? refused.rules
        : ["_tag" in refused ? refused._tag : refused.kind],
      verdict.rule,
      name,
    );
  });

/**
 * A document's tree after one node of it is replaced, and whether one was.
 */
interface Replaced {
  readonly done: boolean;
  readonly root: NodeRoot;
}

/**
 * Replace each node of a document's tree that a predicate picks, the first of them only, through
 * its nesting.
 *
 * @param root - The document node.
 * @param picks - Picks the node to replace.
 * @param replace - Its replacement.
 * @returns The tree with the node replaced, and whether one was.
 */
const replaceFirst = (
  root: NodeRoot,
  picks: (node: NodeMember) => boolean,
  replace: (node: NodeMember) => NodeMember,
): Replaced => {
  let done = false;
  const walk = (node: NodeMember): NodeMember => {
    if (!done && picks(node)) {
      done = true;

      return replace(node);
    }

    return { ...node, children: node.children.map(walk) };
  };
  const children = root.children.map(walk);

  return { done, root: { ...root, children } };
};

/**
 * Edit the first node any document's tree holds that a predicate picks.
 *
 * @param picks - Picks the node.
 * @param replace - Its replacement.
 * @returns The edit of a package's inputs; a test failure when no tree holds such a node.
 */
const editNode =
  (picks: (node: NodeMember) => boolean, replace: (node: NodeMember) => NodeMember) =>
  (inputs: PackageInputs): PackageInputs => {
    for (const [key, root] of inputs.Node) {
      const edited = replaceFirst(root, picks, replace);
      if (edited.done) {
        return { ...inputs, Node: new Map([...inputs.Node, [key, edited.root]]) };
      }
    }

    return assert.fail("no tree of the package holds the node the case edits");
  };

/**
 * An element's place in its package: its document's path and its start.
 */
interface At {
  readonly start: bigint;
}

/**
 * Whether a row is of the element at a place.
 *
 * @param row - The row, of an element.
 * @param at - The place.
 * @returns Whether its path and start are the place's.
 */
const isAt = (row: Pick<Place, "path"> & At, at: Pick<Place, "path"> & At): boolean =>
  row.path === at.path && row.start === at.start;

/**
 * Find the first element any document's tree holds that a predicate picks, by its place: its
 * document's path and its start, its pre-order position in its tree, which grizzle draws from the
 * nesting as `flatten` numbers it.
 *
 * @param inputs - The package's inputs.
 * @param picks - Picks the element.
 * @returns Its place; a test failure when no tree holds such an element.
 */
const placeOf = (
  inputs: PackageInputs,
  picks: (node: NodeMember) => boolean,
): Pick<Place, "path"> & At => {
  for (const root of inputs.Node.values()) {
    let start = 0n;
    const stack: NodeMember[] = [root];
    for (let node = stack.pop(); node !== undefined; node = stack.pop()) {
      if (picks(node)) {
        return { path: root.path, start };
      }

      start += 1n;
      for (const each of node.children.toReversed()) {
        stack.push(each);
      }
    }
  }

  return assert.fail("no tree of the package holds the element the case edits");
};

/**
 * Edit the first open-class attribute of a class a package's inputs hold.
 *
 * @param inputs - The package's inputs.
 * @param name - The attribute's open class.
 * @param edit - The edit of its inputs, given its key in its keyed set and its row.
 * @returns The edited inputs; a test failure when no open attribute is of the class.
 */
const editOpen = (
  inputs: PackageInputs,
  name: string,
  edit: (
    key: string,
    row: PackageInputs["OpenAttribute"] extends ReadonlyMap<string, infer Row> ? Row : never,
  ) => PackageInputs,
): PackageInputs => {
  for (const [key, row] of inputs.OpenAttribute) {
    if (row.class === name) {
      return edit(key, row);
    }
  }

  return assert.fail(`no open attribute of the package is of the class ${name}`);
};

/**
 * Insert markup into `simple`'s item body before its choice interaction, where flow content stands.
 *
 * @param markup - The markup.
 * @returns The edit.
 */
const inBody = (markup: string): TextEdit => ({
  _tag: "ReplaceText",
  file: "choice.xml",
  replacement: `${markup}<qti-choice-interaction`,
  search: "<qti-choice-interaction",
});

/**
 * The item body's first paragraph's text, which no text domain holds, so the text arm alone
 * refuses it: the manifest's first text, cp:schema's, is TextDomain's first.
 */
const firstParagraphText = "Look at the text in the picture.";

/**
 * The metadata fixtures and the verdicts Q5.12 states for them: the rules each may be refused
 * under, none for an accepted one. `usage3-integer-float` is accepted: its `0.87` under `integer`
 * is outside a record, so untyped text (reading `usage-statistic-value`). PostgreSQL holds each to
 * its verdict by Q5.12's laws over a whole package (lom-identifier, lom-title, and lastUpdated's
 * value domain) beside every other law.
 */
const metadataVerdicts: readonly (readonly [FixtureName, readonly string[]])[] = [
  ["identifier-mismatch", ["lom-identifier"]],
  ["title-mismatch", ["lom-title"]],
  ["usage3", []],
  ["usage3-typed", []],
  ["usage3-padded", []],
  ["usage3-float-padded", []],
  ["usage3-feb-30", ["attribute-lexical"]],
  ["usage3-integer-float", []],
];

describe.skipIf(!hasLease)("import/program.oracle.db.test.ts, on the lease", () => {
  layer(
    Layer.mergeAll(AuthorAppLayer, NodeServices.layer, memoryMediaStore).pipe(
      Layer.provideMerge(fileDatabaseOf("oracle")),
    ),
    {
      excludeTestServices: true,
    },
  )("one ChangeSet per package, judged by PostgreSQL", (it) => {
    it.effect(
      "accepts simple, sharedMedia and svg whole, each in one apply, logging the apply time",
      () =>
        Effect.gen(function* acceptsCorpus() {
          for (const [name, dir] of Object.entries(yield* acceptedPackages)) {
            const { outcome, package: identifier } = yield* applyEdited(dir, asRead);

            assert.include(
              ["accepted", "unchanged"],
              outcome.kind,
              `${name}: PostgreSQL holds every law of the schema over the package (Q5.03's "accepted through grizzle", for the whole package)`,
            );
            assert.isTrue(
              yield* packageStored(identifier),
              `${name}: the package reads back by its id`,
            );
          }
        }),
    );

    it.effect("imports one package twice as one package under its name, the second unchanged", () =>
      Effect.gen(function* twice() {
        const first = yield* importDir(fixtures.simple, nameOf(fixtures.simple));
        const second = yield* importDir(fixtures.simple, nameOf(fixtures.simple));

        assert.strictEqual(
          second.package,
          first.package,
          "the contract's identity: a package is keyed by the name it is imported under and an import mints nothing, so the same bytes imported again under that name name the same package",
        );
        assert.strictEqual(
          second.outcome,
          "unchanged",
          "and change nothing, whatever the first import found stored",
        );
        assert.isTrue(yield* packageStored(first.package), first.package);
      }),
    );

    it.effect("leaves no row when a failure is injected in place of the apply", () =>
      Effect.gen(function* noRow() {
        /**
         * The import of a variant no other case imports, so no earlier case stored its identifier,
         * with a failure in place of its apply.
         */
        const injected = yield* editedSimple("injected-failure", []);
        const failed = yield* Effect.flip(
          importDir(injected, nameOf(injected)).pipe(
            Effect.provideService(WrapApply, () => Effect.fail(commitUnknown)),
          ),
        );

        assert.strictEqual(
          failed,
          commitUnknown,
          "commitUnknown's resolution: the failure stands in for the apply, so nothing ran, and the importer runs nothing again, so the import fails with the injected failure, where an apply run outside WrapApply would answer the package",
        );
      }),
    );

    for (const [name, identifier, baseType, first, second] of [
      ["york-keys", "CITY", "string", "York", "york"],
      ["mapping-repeated-entry", "TWICE", "identifier", "a", "a"],
      ["mapping-integer-keys", "INT", "integer", "1", "01"],
      ["mapping-float-keys", "FLT", "float", "1", "1.0"],
      ["mapping-pair-keys", "PAIR", "pair", "A B", "B A"],
      ["mapping-point-keys", "POINT", "point", "1 2", "01 +2"],
    ] as const) {
      it.effect(
        `accepts a ${baseType} mapping keyed ${first} and ${second}, a repeat as written or as the value they name (spec reading \`string-map-key-case\`)`,
        () =>
          Effect.gen(function* repeatedKeys() {
            const dir = yield* editedSimple(name, [
              afterResponse(
                `<qti-response-declaration identifier="${identifier}" cardinality="single" base-type="${baseType}"><qti-mapping default-value="0"><qti-map-entry map-key="${first}" mapped-value="1"/><qti-map-entry map-key="${second}" mapped-value="2"/></qti-mapping></qti-response-declaration>`,
              ),
            ]);
            const { outcome } = yield* applyEdited(dir, asRead);

            assert.strictEqual(
              outcome.kind,
              "accepted",
              `${Formatter.format(outcome)}: QTI's XSD holds no xs:unique or xs:key over a mapping's entries, and the first entry that matches a value gives it (reading \`string-map-key-case\`), so a repeated key is a lawful entry, written twice, in another case, or as another spelling of one integer, float, pair or point`,
            );
          }),
      );
    }

    it.effect(
      `accepts an item whose root names no tool exactly when no paragraph carries a label, whichever of its calculator info, digital material and printed variable carry one, as the law oracle judges it (label-tool, reading \`label-tool\`): ${String(LABEL_SITE_CASES)} items`,
      (ctx) =>
        searched(
          ctx,
          Effect.gen(function* labelCharacteristics() {
            yield* boxHolds(labelSites, LABEL_SITE_CASES);
            const grammar = Result.getOrThrow(composed());
            const laws = lawsOf(grammar);

            return yield* exhaust(
              {
                box: "simple's item, its root naming no tool, with each of a calculator info, a digital material, a printed variable and a paragraph carrying a label or none",
                caseHang: Duration.minutes(2),
                coverage: requiredInSpace<"accepted" | "refused">(["accepted", "refused"]),
                generator: labelSites,
                literal: Formatter.format,
                oracle: {
                  kind: "specification",
                  name: "the information model's label characteristics (reading `label-tool`): a calculator info's and a digital material's label, each an ItemFileInfo's (§5.80.2), and a printed variable's (§7.30.4) ask for no tool, and a paragraph's (§5.16.5) asks for one, which a root naming no tool refuses; the law oracle's verdict on the same package, and PostgreSQL's through LabelUse's containments",
                },
                suite: "pantry/import/label-tools",
              },
              (sites, c) =>
                Effect.gen(function* labelCase() {
                  const name = `label-${labelSiteNames.filter((site) => sites[site]).join("-") || "none"}`;
                  const accepted = !sites.paragraph;
                  c.note(accepted ? "accepted" : "refused");

                  const dir = yield* editedSimple(name, [
                    {
                      _tag: "ReplaceText",
                      file: "choice.xml",
                      replacement: labelledBody(sites),
                      search: "<qti-item-body>",
                    },
                  ]);
                  const judgment = yield* judge(yield* readEntries(dir), grammar, laws);
                  const { outcome } = yield* applyEdited(dir, asRead);

                  assert.strictEqual(
                    judgment._tag === "Judged" && judgment.breaches.length === 0,
                    accepted,
                    `${name}: the law oracle's verdict on the same package (judge)`,
                  );
                  if (accepted) {
                    assert.strictEqual(
                      outcome.kind,
                      "accepted",
                      `${name}: ${Formatter.format(outcome)}`,
                    );
                  } else {
                    assert.isTrue(
                      judgment._tag === "Judged" &&
                        judgment.breaches.every(({ law }) => law === "Label tools"),
                      `${name}: the oracle's breaches are Label tools'`,
                    );
                    assert.isTrue(
                      rejectedBy(outcome, [containedIn("LabelUse", "Attribute")]),
                      `${name}: PostgreSQL judges the labels through LabelUse's two containments with the selected labels and Label tools' containment of an item's labels in its root's tool-name: ${Formatter.format(outcome)}`,
                    );
                  }
                }),
            );
          }),
        ),
    );

    const cases = [
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("mapping-file", [
              afterResponse(
                `<qti-response-declaration identifier="UPLOAD" cardinality="single" base-type="file"><qti-mapping default-value="0"><qti-map-entry map-key="a" mapped-value="1"/></qti-mapping></qti-response-declaration>`,
              ),
            ]),
            (dir) => applyEdited(dir, asRead),
          ),
        laws: [containedIn("MappingBaseType", "MappableBaseType")],
        name: "a mapping on a file response (mapping-base-type, Q5.11)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("mapping-record", [
              afterResponse(
                `<qti-response-declaration identifier="REC" cardinality="record"><qti-mapping default-value="0"><qti-map-entry map-key="a" mapped-value="1"/></qti-mapping></qti-response-declaration>`,
              ),
            ]),
            (dir) => applyEdited(dir, asRead),
          ),
        laws: [checkNamed("MappingCardinality", "MappableBaseType")],
        name: "a mapping on a record response (mapping-base-type, Q5.11)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("area-mapping-pair", [
              afterResponse(
                `<qti-response-declaration identifier="AREA" cardinality="single" base-type="pair"><qti-area-mapping default-value="0"><qti-area-map-entry shape="circle" coords="1,1,1" mapped-value="1"/></qti-area-mapping></qti-response-declaration>`,
              ),
            ]),
            (dir) => applyEdited(dir, asRead),
          ),
        laws: [checkNamed("AreaMappingBaseType", "AreaMapping_base_type")],
        name: "an area mapping on a pair response (mapping-base-type, Q5.11)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("match-table-multiple", [
              afterOutcome(
                `<qti-outcome-declaration identifier="TABLE" cardinality="multiple" base-type="integer"><qti-match-table default-value="0"><qti-match-table-entry source-value="1" target-value="1"/></qti-match-table></qti-outcome-declaration>`,
              ),
            ]),
            (dir) => applyEdited(dir, asRead),
          ),
        laws: [checkNamed("LookupTableCardinality", "Lookup_table_cardinality")],
        name: "a match table on a multiple-cardinality outcome (lookup-cardinality, Q5.11)",
      },
      {
        /**
         * P2's (resource type, root kind) containment into RootOfType, read from the document's
         * ResourceDocument, the row its resource type is held in (`qti/package.ts` packageLaws,
         * spec reading `document-type-total`): of the statements named RootOfType, the one this
         * edit breaks; the oracle's one breach; and the rule the import names for it,
         * root-type-reverse.
         */
        apply: () =>
          Effect.flatMap(
            editedSimple("stimulus-root", [
              {
                _tag: "ReplaceText",
                file: "imsmanifest.xml",
                replacement: `type="imsqti_stimulus_xmlv3p0" href="choice.xml"`,
                search: `type="imsqti_item_xmlv3p0" href="choice.xml"`,
              },
            ]),
            (dir) =>
              Effect.gen(function* oneLawBroken() {
                const grammar = Result.getOrThrow(composed());
                const judgment = yield* judge(yield* readEntries(dir), grammar, lawsOf(grammar));

                assert.deepStrictEqual(
                  judgment._tag === "Judged" ? judgment.breaches.map(({ law }) => law) : judgment,
                  ["RootOfType"],
                  "the oracle finds RootOfType alone broken",
                );

                const applied = yield* applyEdited(dir, asRead);

                yield* holdsVerdict("an item named as a stimulus", dir, {
                  rule: "root-type-reverse",
                  verdict: "refused",
                });

                return applied;
              }),
          ),
        laws: [containedIn("ResourceDocument", "RootOfType")],
        name: "an item named as a stimulus, a root its resource type does not name (root-type-reverse, Q5.06)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("unlisted-href", [
              resourceBefore(
                `<resource identifier="extra" type="webcontent" href="choice.xml"><file href="images/sign.png"/></resource>`,
              ),
            ]),
            (dir) => applyEdited(dir, asRead),
          ),
        laws: [containedIn("ResourceHrefPath", "ResourceFilePath")],
        name: "a resource href its own files do not list (href-listed, Q5.06)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("missing-entry", [
              resourceBefore(
                `<resource identifier="ghost" type="imsqti_item_xmlv3p0" href="ghost.xml"><file href="ghost.xml"/></resource>`,
              ),
            ]),
            (dir) => applyEdited(dir, asRead),
          ),
        /**
         * "Document entry" over the query `TypedPath` (`qti/queries.ts`): the document a typed href
         * names in the package is one the package lists; and the listed file's own entry.
         */
        laws: [containedIn("TypedPath", "ResourceDocument"), containedIn("FilePath", "Entry")],
        name: "a document href no entry holds (entry-kind, Q5.06)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("shared-identifier", [
              {
                _tag: "ReplaceText",
                file: "imsmanifest.xml",
                replacement: `identifier="${ownIdentifierOf(simpleVariant("shared-identifier"))}" type="imsqti_item_xmlv3p0"`,
                search: `identifier="choice" type="imsqti_item_xmlv3p0"`,
              },
            ]),
            (dir) => applyEdited(dir, asRead),
          ),
        laws: [keyOn("IdBinding", "package", "path", "idDigest")],
        name: "a resource sharing its manifest's identifier (document-key over the manifest's IDs, Q5.06)",
      },
      {
        apply: () =>
          Effect.flatMap(materializeSpec(variantOf(svgSpec, "q5.15-comment-missing", [])), (dir) =>
            applyEdited(dir, (inputs) => ({
              ...inputs,
              Comment: new Map([...inputs.Comment].slice(1)),
            })),
          ),
        laws: [containedIn("Node", "Comment")],
        name: "a comment node with no Comment row (the comment arm, Q5.04)",
      },
      {
        apply: () =>
          Effect.flatMap(editedSimple("namespace-twice", []), (dir) =>
            applyEdited(dir, (inputs) => {
              const [declared] = inputs.Namespace.values();
              if (declared === undefined) {
                return assert.fail("no element of the package declares a namespace");
              }

              /**
               * The same prefix on the same element again, bound to another name: a second row
               * at a place past every declaration of the element, under a key text of its own,
               * so the facts hold both and only the prefix's key, by its SHA-256, is broken.
               */
              let after = declared.at + 1n;
              for (const { at, start } of inputs.Namespace.values()) {
                if (start === declared.start && at >= after) {
                  after = at + 1n;
                }
              }

              return {
                ...inputs,
                Namespace: new Map([
                  ...inputs.Namespace,
                  ["twice", { ...declared, at: after, uri: `${declared.uri}/twice` }],
                ]),
              };
            }),
          ),
        laws: [keyOn("Namespace", "package", "path", "start", "prefixDigest")],
        name: "one prefix declared twice on an element (Namespace family, Q5.04)",
      },
      {
        apply: () =>
          Effect.flatMap(editedSimple("text-whitespace", []), (dir) =>
            applyEdited(
              dir,
              editNode(
                (node) => node.kind === "text" && node.chars === firstParagraphText,
                (node) => ({ ...node, chars: " ", first: " ", last: " " }),
              ),
            ),
          ),
        laws: [checkNamed("Node", "text_arm")],
        name: "a text node of whitespace alone (the text arm, Q5.04)",
      },
      {
        apply: () =>
          Effect.flatMap(editedSimple("ws-letter", []), (dir) =>
            applyEdited(
              dir,
              editNode(
                (node) => node.kind === "ws",
                (node) => ({ ...node, chars: "x", first: "x", last: "x" }),
              ),
            ),
          ),
        laws: [checkNamed("Node", "ws_arm")],
        name: "a whitespace node holding a letter (the ws arm, Q5.04)",
      },
      {
        apply: () =>
          Effect.flatMap(editedSimple("item-identifier-missing", []), (dir) =>
            applyEdited(dir, (inputs) => {
              const item = placeOf(inputs, (node) => node.kind === "qti-assessment-item");

              return {
                ...inputs,
                Attribute: new Map(
                  [...inputs.Attribute].filter(
                    ([, row]) => !(isAt(row, item) && row.name === "identifier"),
                  ),
                ),
              };
            }),
          ),
        laws: [checkNamed("Node", "AL3_required")],
        name: "an item without its required identifier (AL3, Q5.05)",
      },
      {
        apply: () =>
          Effect.flatMap(editedSimple("schema-version", []), (dir) =>
            applyEdited(
              dir,
              editNode(
                (node) => node.kind === "cp:schemaversion",
                (node) => ({
                  ...node,
                  children: node.children.map((child) =>
                    child.kind === "text"
                      ? { ...child, chars: "3.0.x", first: "3", last: "x" }
                      : child,
                  ),
                }),
              ),
            ),
          ),
        laws: [checkNamed("Node", "TextDomain")],
        name: "a schema version outside its text domain (TextDomain, Q5.05)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("mapping-integer-word", [
              afterResponse(
                `<qti-response-declaration identifier="WORD" cardinality="single" base-type="integer"><qti-mapping default-value="0"><qti-map-entry map-key="abc" mapped-value="1"/></qti-mapping></qti-response-declaration>`,
              ),
            ]),
            (dir) => applyEdited(dir, asRead),
          ),
        laws: [checkNamed("MapKeyType", "Typed_attribute_value")],
        name: "an integer mapping keyed abc (Typed attribute value, Q5.11)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("match-table-target", [
              afterOutcome(
                `<qti-outcome-declaration identifier="LOOK" cardinality="single" base-type="integer"><qti-match-table default-value="0"><qti-match-table-entry source-value="1" target-value="x"/></qti-match-table></qti-outcome-declaration>`,
              ),
            ]),
            (dir) => applyEdited(dir, asRead),
          ),
        laws: [checkNamed("LookupValueType", "Typed_attribute_value")],
        name: "an integer outcome's match table entry targeting x (Typed attribute value, Q5.11)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("dangling-idref", [inBody(`<p aria-describedby="nowhere">See.</p>`)]),
            (dir) => applyEdited(dir, asRead),
          ),
        laws: [containedIn("IdrefTarget", "IdBinding")],
        name: "an IDREF token naming no id of its document (Idref target, Q5.07)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("data-name-upper", [inBody(`<p data-note="x">See.</p>`)]),
            (dir) =>
              applyEdited(dir, (inputs) =>
                editOpen(inputs, "data-*", (key, open) => ({
                  ...inputs,
                  OpenAttribute: new Map([
                    ...inputs.OpenAttribute,
                    [key, { ...open, local: "data-A" }],
                  ]),
                })),
              ),
          ),
        laws: [checkNamed("OpenAttribute", "AL4_data_name")],
        name: "a data-* name with an upper-case local (AL4 data name)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("data-name-declared", [inBody(`<p data-note="x">See.</p>`)]),
            (dir) =>
              applyEdited(dir, (inputs) =>
                editOpen(inputs, "data-*", (key, open) => ({
                  ...inputs,
                  OpenAttribute: new Map([
                    ...inputs.OpenAttribute,
                    [key, { ...open, local: "data-catalog-idref" }],
                  ]),
                })),
              ),
          ),
        laws: [checkNamed("OpenAttribute", "AL4_declared_data_name")],
        name: "a data-* name the p element's governor declares (AL4 declared data name)",
      },
      {
        apply: () =>
          Effect.flatMap(
            materializeSpec(variantOf(specOf("sharedMedia"), "q5.15-idref-tokens", [])),
            (dir) =>
              applyEdited(dir, (inputs) => {
                const held = [...inputs.Attribute].find(([, row]) => row.idrefs.length > 0);
                if (held === undefined) {
                  return assert.fail("no attribute of the package holds an IDREF token");
                }

                const [key, attribute] = held;

                return {
                  ...inputs,
                  Attribute: new Map([...inputs.Attribute, [key, { ...attribute, idrefs: [] }]]),
                };
              }),
          ),
        laws: [checkNamed("Attribute", "E1_derived")],
        name: "an IDREF attribute without its tokens (E1 derived, Q5.05)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("ssml-trim-mark-collapsed", [
              {
                _tag: "InsertAfterLine",
                file: "imsmanifest.xml",
                line: 66,
                text: "                        <imsmd:language>en</imsmd:language>",
              },
              inBody(
                `<p><ssml:speak xmlns:ssml="http://www.w3.org/2001/10/synthesis" version="1.1" xml:lang="en" startmark="a b"><ssml:mark name="a b"/><ssml:mark name="a  b"/>x</ssml:speak></p>`,
              ),
            ]),
            (dir) => applyEdited(dir, asRead),
          ),
        laws: [keyOn("TrimmedMark", "package", "path", "fragment", "valueDigest")],
        name: "a startmark naming two marks that collapse to one name (SSML trim mark, reading `ssml-document-is-fragment`)",
      },
      {
        apply: () =>
          Effect.flatMap(
            editedSimple("ssml-voice-und", [
              {
                _tag: "InsertAfterLine",
                file: "imsmanifest.xml",
                line: 66,
                text: "                        <imsmd:language>en</imsmd:language>",
              },
              inBody(
                `<p><ssml:speak xmlns:ssml="http://www.w3.org/2001/10/synthesis" version="1.1" xml:lang="en"><ssml:voice languages="und">hi</ssml:voice></ssml:speak></p>`,
              ),
            ]),
            (dir) => applyEdited(dir, asRead),
          ),
        laws: [checkNamed("Attribute", "value_domain")],
        name: "a voice whose languages is und (value domain, reading `ssml-voice-languages`)",
      },
    ];

    for (const { apply, laws, name } of cases) {
      it.effect(`refuses ${name}`, () =>
        Effect.gen(function* refused() {
          const { outcome, package: identifier } = yield* apply();

          assert.isTrue(
            rejectedBy(outcome, laws),
            `${name}: PostgreSQL refuses it by the law its one edit breaks, among the laws its refusal names: ${Formatter.format(outcome)}`,
          );
          assert.isFalse(yield* packageStored(identifier), name);
        }),
      );
    }

    for (const [name, rules] of metadataVerdicts) {
      it.effect(`gives ${name} Q5.12's verdict`, () =>
        Effect.gen(function* metadataVerdict() {
          const dir = yield* materialize(name);
          const outcome = yield* Effect.result(importDir(dir, nameOf(dir)));

          if (rules.length === 0) {
            assert.isTrue(outcome._tag === "Success", `${name} was refused`);
          } else {
            assert.isTrue(
              outcome._tag === "Failure" &&
                outcome.failure instanceof ImportRefused &&
                outcome.failure.rules.some((rule) => rules.includes(rule)),
              `${name}: ${outcome._tag === "Failure" ? outcome.failure.message : "accepted"}`,
            );
          }
        }),
      );
    }

    for (const name of processingFixtureNames) {
      it.effect(`gives the processing fixture ${name} its stated verdict`, () =>
        Effect.gen(function* processingVerdict() {
          /**
           * The fixture's stated verdict (Q5.10, `processing-verdicts.ts`, which the law oracle
           * predicts with no database): a checker's fixture is refused under its frozen rule, a
           * codec-refused one under the codec's rule, a guard's by AL3, N7's Last or N5's Follow,
           * and an accepted one commits. A package with no frozen row (a round-trip, template or
           * padded package) has no stated verdict, so the law oracle's verdict on it is the one
           * PostgreSQL is held to.
           */
          const stated = (yield* processingVerdicts)(name);
          const dir = yield* materializeProcessing(name);

          if (Option.isNone(stated)) {
            const grammar = Result.getOrThrow(composed());

            yield* holdsVerdict(
              name,
              dir,
              verdictOf(yield* judge(yield* readEntries(dir), grammar, lawsOf(grammar))),
            );

            return;
          }

          const verdict = stated.value;

          if (verdict.rule === "accepted") {
            yield* holdsVerdict(name, dir, { verdict: "accepted" });

            return;
          }

          if (verdict.source === "guard") {
            const { outcome } = yield* applyEdited(dir, asRead);

            assert.isTrue(
              rejectedBy(outcome, [
                checkNamed("Node", "AL3_required"),
                checkNamed("Node", "N7_Last"),
                checkNamed("Node", "N5_Follow"),
              ]),
              `${name}: ${Formatter.format(outcome)}`,
            );

            return;
          }

          yield* holdsVerdict(name, dir, { rule: verdict.rule, verdict: "refused" });
        }),
      );
    }

    for (const { edits, label, verdict } of resourceTypeCases) {
      it.effect(`holds PostgreSQL to reading \`resource-href\`'s verdict on ${label}`, () =>
        Effect.gen(function* resourceTypeVerdict() {
          /**
           * Simple with the case's resources, of {one type, two types, a type that spells nothing}
           * × {one path, two paths}, whose verdict spec readings `manifest-profile` and
           * `resource-href` state as the box states them (`resource-type-cases.ts`) and the law
           * oracle gives (`resource-types.oracle.test.ts`): a document has one type, and a
           * resource's type that spells nothing is refused by AL1's value domain alone.
           */
          const dir = yield* materializeSpec(
            variantOf(
              specOf("simple"),
              `resource-types-${label.replaceAll(regex("[^\\da-z]+", "giu"), "-")}`,
              edits,
            ),
          );

          yield* holdsVerdict(label, dir, verdict);
        }),
      );
    }
  });
});
